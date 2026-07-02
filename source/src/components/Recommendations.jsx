import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BadgeCheck, CheckCircle, Linkedin, Lock, Plus, Quote, RefreshCw, Send, Trash2, X, XCircle } from 'lucide-react';
import SectionHeading from './SectionHeading.jsx';
import { fadeUp, staggerContainer } from '../animations/variants.js';
import { useSitePreferences } from '../context/SitePreferencesContext.jsx';
import { localizeRecommendation, recommendations as staticRecommendations } from '../data/portfolioData.js';
import useDialogA11y from '../hooks/useDialogA11y.js';
import {
  ADMIN_AUTO_SIGN_OUT_MS,
  clearStoredAdminSession,
  deleteRecommendation,
  fetchAdminRecommendations,
  fetchApprovedRecommendations,
  getStoredAdminSession,
  addSaifRecommendation,
  signInRecommendationAdmin,
  submitRecommendationDraft,
  updateRecommendationStatus,
} from '../lib/recommendationService.js';
import { notifyRecommendationSubmission } from '../lib/portfolioAdminService.js';

const emptyForm = {
  name: '',
  role: '',
  company: '',
  linkedin: '',
  quote: '',
};

const INITIAL_RECOMMENDATION_LIMIT = 4;
const staticApprovedRecommendations = staticRecommendations.filter((item) => item.verified && !item.placeholder);

function normalizeRecommendationValue(value = '') {
  return String(value || '').trim().toLowerCase();
}

function getRecommendationKey(item = {}) {
  const identityKey = [
    normalizeRecommendationValue(item.name),
    normalizeRecommendationValue(item.role),
    normalizeRecommendationValue(item.company),
  ].join('|');
  return identityKey.replace(/\|/g, '') ? identityKey : `source:${item.source_key || item.id || ''}`;
}

function getApprovedAdminRows(items = []) {
  return Array.isArray(items) ? items.filter((item) => item.status === 'approved') : [];
}

function getRecommendationTimestamp(item = {}) {
  const timestamp = Date.parse(item.approved_at || item.created_at || '');
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function isDisplayableRecommendation(item = {}) {
  return Boolean(
    normalizeRecommendationValue(item.name)
    && normalizeRecommendationValue(item.role)
    && normalizeRecommendationValue(item.company)
    && normalizeRecommendationValue(item.quote)
  );
}

function mergeApprovedRecommendations(publicItems = [], adminItems = []) {
  const liveApproved = [
    ...(Array.isArray(publicItems) ? publicItems : []),
    ...getApprovedAdminRows(adminItems),
  ].filter(isDisplayableRecommendation);
  const merged = [];
  const seen = new Set();

  [...liveApproved, ...staticApprovedRecommendations].forEach((item) => {
    const key = getRecommendationKey(item);
    if (!key || seen.has(key)) return;
    seen.add(key);
    merged.push(item);
  });

  return (merged.length > 0 ? merged : staticApprovedRecommendations)
    .sort((first, second) => getRecommendationTimestamp(second) - getRecommendationTimestamp(first));
}

function applyRecommendationStatus(item = {}, status, timestamp = new Date().toISOString()) {
  return {
    ...item,
    status,
    approved_at: status === 'approved' ? timestamp : null,
    rejected_at: status === 'rejected' ? timestamp : null,
  };
}

function replaceRecommendationById(items = [], nextItem = {}) {
  if (!nextItem?.id) return items;
  const exists = items.some((item) => item.id === nextItem.id);
  if (!exists) return isDisplayableRecommendation(nextItem) ? [nextItem, ...items] : items;
  return items.map((item) => (item.id === nextItem.id ? { ...item, ...nextItem } : item));
}

function getExcerpt(text, limit = 150) {
  if (!text || text.length <= limit) return text;
  return `${text.slice(0, limit).trim()}...`;
}

export default function Recommendations() {
  const [requestOpen, setRequestOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [activeRecommendation, setActiveRecommendation] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [approved, setApproved] = useState(staticApprovedRecommendations);
  const [consentGiven, setConsentGiven] = useState(false);
  const [websiteField, setWebsiteField] = useState('');
  const [saved, setSaved] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);
  const [adminSession, setAdminSession] = useState(null);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');
  const [adminItems, setAdminItems] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState('');
  const [showAllRecommendations, setShowAllRecommendations] = useState(false);
  const { copy, language, portfolioAdminState } = useSitePreferences();
  const sectionCopy = copy.sections.recommendations;
  const closeRequest = useCallback(() => setRequestOpen(false), []);
  const closeAdmin = useCallback(() => setAdminOpen(false), []);
  const closeDetail = useCallback(() => setActiveRecommendation(null), []);
  const requestDialogRef = useDialogA11y(requestOpen, closeRequest);
  const adminDialogRef = useDialogA11y(adminOpen, closeAdmin);
  const detailDialogRef = useDialogA11y(Boolean(activeRecommendation), closeDetail);

  useEffect(() => {
    setAdminSession(getStoredAdminSession());
  }, []);

  useEffect(() => {
    let cancelled = false;

    fetchApprovedRecommendations()
      .then((items) => {
        if (cancelled) return;
        setApproved(mergeApprovedRecommendations(items));
      })
      .catch(() => {
        if (!cancelled) setApproved(staticApprovedRecommendations);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const refreshAdminRecommendations = useCallback(async (session = adminSession) => {
    if (!session?.accessToken) return;
    setAdminLoading(true);
    setAdminError('');
    try {
      const items = await fetchAdminRecommendations(session.accessToken);
      const nextItems = Array.isArray(items) ? items : [];
      setAdminItems(nextItems);
      return nextItems;
    } catch (error) {
      setAdminError(error?.message || sectionCopy.adminLoadError);
      return [];
    } finally {
      setAdminLoading(false);
    }
  }, [adminSession, sectionCopy.adminLoadError]);

  useEffect(() => {
    if (adminOpen && adminSession?.accessToken) {
      refreshAdminRecommendations(adminSession);
    }
  }, [adminOpen, adminSession, refreshAdminRecommendations]);

  useEffect(() => {
    if (!adminSession?.accessToken) return undefined;

    let timeoutId;
    const expireAdminSession = () => {
      clearStoredAdminSession();
      setAdminSession(null);
      setAdminItems([]);
      setAdminEmail('');
      setAdminPassword('');
      setPendingDeleteId('');
      setAdminError('Admin session expired after 60 seconds of inactivity. Please sign in again.');
    };
    const resetTimer = () => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(expireAdminSession, ADMIN_AUTO_SIGN_OUT_MS);
    };
    const activityEvents = ['pointerdown', 'keydown', 'input', 'scroll', 'touchstart'];

    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, resetTimer, true);
    });
    resetTimer();

    return () => {
      window.clearTimeout(timeoutId);
      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, resetTimer, true);
      });
    };
  }, [adminSession?.accessToken]);

  useEffect(() => {
    const approvedAdminItems = getApprovedAdminRows(adminItems);
    if (approvedAdminItems.length > 0) {
      setApproved(mergeApprovedRecommendations([], approvedAdminItems));
    }
  }, [adminItems]);

  const visibleRecommendations = useMemo(() => {
    return approved
      .map((item) => ({
        ...localizeRecommendation(item, language),
        verified: true,
        backendApproved: true,
      }))
      .filter(isDisplayableRecommendation);
  }, [approved, language]);

  useEffect(() => {
    setShowAllRecommendations(false);
  }, [visibleRecommendations.length]);

  const displayedRecommendations = showAllRecommendations
    ? visibleRecommendations
    : visibleRecommendations.slice(0, INITIAL_RECOMMENDATION_LIMIT);
  const hiddenRecommendationCount = Math.max(visibleRecommendations.length - displayedRecommendations.length, 0);
  const recommendationListCountLabel = (
    showAllRecommendations ? sectionCopy.showingAllReferences : sectionCopy.showingLatestReferences
  )
    .replace('{shown}', displayedRecommendations.length)
    .replace('{total}', visibleRecommendations.length);
  const recommendationToggleLabel = (
    showAllRecommendations ? sectionCopy.showLatestReferences : sectionCopy.showAllReferences
  )
    .replace('{count}', visibleRecommendations.length)
    .replace('{hidden}', hiddenRecommendationCount);

  const verifiedCountLabel = (
    visibleRecommendations.length === 1
      ? sectionCopy.verifiedCountLabel
      : sectionCopy.verifiedCountLabelPlural
  ).replace('{count}', visibleRecommendations.length);

  const hasSaifReference = useMemo(() => {
    return adminItems.some((item) => (
      item.source_key === 'saif-abdullah-keba-reference'
      || (
        String(item.name || '').trim().toLowerCase() === 'saif abdullah'
        && String(item.company || '').trim().toLowerCase() === 'keba ag'
      )
    ));
  }, [adminItems]);

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setSaved(false);
    setSubmitError('');
  };

  const submitRecommendation = async (event) => {
    event.preventDefault();
    setLoading(true);
    setSubmitError('');

    const nextRecommendation = {
      id: window.crypto?.randomUUID?.() || `recommendation-${Date.now()}`,
      name: form.name.trim(),
      role: form.role.trim(),
      company: form.company.trim(),
      linkedin: form.linkedin.trim(),
      quote: form.quote.trim(),
    };

    try {
      if (!consentGiven) {
        throw new Error(sectionCopy.consentLabel);
      }
      if (websiteField.trim()) {
        setForm(emptyForm);
        setWebsiteField('');
        setConsentGiven(false);
        setSaved(true);
        setRequestOpen(false);
        return;
      }
      const lastSubmitAt = Number(window.localStorage.getItem('portfolio-recommendation-last-submit') || 0);
      if (Date.now() - lastSubmitAt < 60000) {
        throw new Error(sectionCopy.rateLimitError);
      }
      await submitRecommendationDraft(nextRecommendation);
      notifyRecommendationSubmission(nextRecommendation, portfolioAdminState.emailNotifications).catch(() => null);
      window.localStorage.setItem('portfolio-recommendation-last-submit', String(Date.now()));
      setForm(emptyForm);
      setWebsiteField('');
      setConsentGiven(false);
      setSaved(true);
      setRequestOpen(false);
    } catch (error) {
      setSubmitError(error?.message || sectionCopy.submitError);
    } finally {
      setLoading(false);
    }
  };

  const submitAdminLogin = async (event) => {
    event.preventDefault();
    setAdminLoading(true);
    setAdminError('');

    try {
      const session = await signInRecommendationAdmin(adminEmail.trim(), adminPassword);
      setAdminEmail('');
      setAdminPassword('');
      setAdminSession(session);
      await refreshAdminRecommendations(session);
    } catch (error) {
      clearStoredAdminSession();
      setAdminSession(null);
      setAdminError(error?.message || sectionCopy.adminLoginError);
    } finally {
      setAdminLoading(false);
    }
  };

  const changeAdminStatus = async (id, status) => {
    if (!adminSession?.accessToken) return;
    setAdminLoading(true);
    setAdminError('');
    const previousAdminItems = adminItems;
    const currentItem = adminItems.find((item) => item.id === id);
    const optimisticItems = currentItem
      ? replaceRecommendationById(adminItems, applyRecommendationStatus(currentItem, status))
      : adminItems;

    if (currentItem) {
      setAdminItems(optimisticItems);
      setApproved(mergeApprovedRecommendations([], optimisticItems));
    }

    try {
      const updatedItem = await updateRecommendationStatus(adminSession.accessToken, id, status);
      const confirmedItems = replaceRecommendationById(optimisticItems, updatedItem);
      setAdminItems(confirmedItems);
      setApproved(mergeApprovedRecommendations([], confirmedItems));

      const publicItems = await fetchApprovedRecommendations().catch(() => []);
      if (Array.isArray(publicItems) && publicItems.length > 0) {
        setApproved(mergeApprovedRecommendations(publicItems, confirmedItems));
      }

      refreshAdminRecommendations(adminSession).then((nextAdminItems) => {
        if (Array.isArray(nextAdminItems) && nextAdminItems.length > 0) {
          setApproved(mergeApprovedRecommendations([], nextAdminItems));
        }
      });
    } catch (error) {
      setAdminItems(previousAdminItems);
      setApproved(mergeApprovedRecommendations([], previousAdminItems));
      setAdminError(error?.message || sectionCopy.adminActionError);
      setAdminLoading(false);
    }
  };

  const removeAdminRecommendation = async (id) => {
    if (!adminSession?.accessToken) return;
    if (pendingDeleteId !== id) {
      setPendingDeleteId(id);
      return;
    }
    setAdminLoading(true);
    setAdminError('');

    try {
      await deleteRecommendation(adminSession.accessToken, id);
      const [nextAdminItems, publicItems] = await Promise.all([
        refreshAdminRecommendations(adminSession),
        fetchApprovedRecommendations().catch(() => []),
      ]);
      setApproved(mergeApprovedRecommendations(publicItems, nextAdminItems));
      setPendingDeleteId('');
    } catch (error) {
      setAdminError(error?.message || sectionCopy.adminActionError);
      setAdminLoading(false);
    }
  };

  const addVerifiedSaifReference = async () => {
    if (!adminSession?.accessToken) return;
    setAdminLoading(true);
    setAdminError('');

    try {
      await addSaifRecommendation(adminSession.accessToken);
      const [nextAdminItems, publicItems] = await Promise.all([
        refreshAdminRecommendations(adminSession),
        fetchApprovedRecommendations().catch(() => []),
      ]);
      setApproved(mergeApprovedRecommendations(publicItems, nextAdminItems));
    } catch (error) {
      setAdminError(error?.message || sectionCopy.adminActionError);
      setAdminLoading(false);
    }
  };

  const signOutAdmin = () => {
    clearStoredAdminSession();
    setAdminSession(null);
    setAdminItems([]);
    setAdminEmail('');
    setAdminPassword('');
    setAdminError('');
    setPendingDeleteId('');
  };

  return (
    <section id="recommendations" className="section-pad">
      <div className="page-container">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            kicker={sectionCopy.kicker}
            title={sectionCopy.title}
            copy={sectionCopy.copy}
          />
        </div>

        <motion.div
          className="recommendation-request premium-card mb-5 mt-8 grid gap-4 rounded-2xl p-5 md:grid-cols-[1fr_auto] md:items-center md:p-6"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-electric-300">{sectionCopy.requestTitle}</p>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">{sectionCopy.requestCopy}</p>
          </div>
          <div className="recommendation-request-actions">
            <button type="button" onClick={() => setRequestOpen(true)} className="btn-secondary min-h-10 px-4 py-2">
              <Plus size={16} />
              {sectionCopy.requestButton}
            </button>
            <button type="button" onClick={() => setAdminOpen(true)} className="recommendation-admin-trigger">
              <Lock size={15} />
              {sectionCopy.adminButton}
            </button>
          </div>
        </motion.div>

        {saved && (
          <div className="mb-5 rounded-2xl border border-signal-green/25 bg-signal-green/10 px-4 py-3 text-sm font-semibold text-signal-green">
            {sectionCopy.savedMessage}
          </div>
        )}

        <motion.div
          className="recommendation-trust-strip mb-6"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="recommendation-trust-item">
            <span><BadgeCheck size={18} /></span>
            <div>
              <p>{verifiedCountLabel}</p>
              <small>{sectionCopy.approvedOnlyCopy}</small>
            </div>
          </div>
          <div className="recommendation-trust-item">
            <span><CheckCircle size={18} /></span>
            <div>
              <p>{sectionCopy.approvalFlowTitle}</p>
              <small>{sectionCopy.approvalFlowCopy}</small>
            </div>
          </div>
          <div className="recommendation-trust-item">
            <span><Lock size={18} /></span>
            <div>
              <p>{sectionCopy.adminControlledTitle}</p>
              <small>{sectionCopy.adminControlledCopy}</small>
            </div>
          </div>
        </motion.div>

        <div className="recommendation-list-control">
          <div>
            <p>{sectionCopy.latestReferencesTitle}</p>
            <small>{recommendationListCountLabel}</small>
          </div>
        </div>

        <motion.div
          className="recommendation-grid"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.18 }}
        >
          {displayedRecommendations.map((item, index) => (
            <motion.article
              key={item.id || `${item.name}-${index}`}
              variants={fadeUp}
              whileHover={{ y: -6 }}
              className={`recommendation-card premium-card group flex flex-col rounded-2xl ${item.verified ? 'verified-reference-card' : ''}`}
            >
              <div className="recommendation-card-header">
                <div className="recommendation-identity">
                  <div className="recommendation-avatar">
                    {item.verified ? <BadgeCheck size={24} /> : `R${index + 1}`}
                  </div>
                  <div className="recommendation-person">
                    <p className="recommendation-person-name">{item.name}</p>
                    <div className="recommendation-person-meta">
                      <span>
                        <strong>{sectionCopy.roleMeta}</strong>
                        {item.role}
                      </span>
                      <span>
                        <strong>{sectionCopy.companyMeta}</strong>
                        {item.company}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="recommendation-header-actions">
                  {item.linkedin ? (
                    <a href={item.linkedin} target="_blank" rel="noreferrer" aria-label={sectionCopy.linkedinProfile} className="recommendation-link-proof">
                      <Linkedin size={19} />
                    </a>
                  ) : null}
                  <span className={`recommendation-status-pill ${item.verified ? 'recommendation-verified-stamp' : ''}`}>
                    {item.verified ? <BadgeCheck size={15} /> : null}
                    {item.verified ? sectionCopy.verified : item.submitted ? sectionCopy.submitted : sectionCopy.pending}
                  </span>
                </div>
              </div>

              <div className="recommendation-quote-preview mt-6 flex gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                <Quote size={22} className="mt-1 shrink-0 text-electric-300" />
                <p className="text-sm leading-7 text-slate-300">{getExcerpt(item.quote)}</p>
              </div>

              {!item.placeholder && (
                <button type="button" onClick={() => setActiveRecommendation(item)} className="recommendation-read-more mt-5">
                  {sectionCopy.readMore}
                  <Quote size={15} />
                </button>
              )}

              {item.placeholder && (
                <div className="mt-auto rounded-xl border border-signal-amber/20 bg-signal-amber/10 px-3 py-2 text-xs font-semibold text-signal-amber">
                  {sectionCopy.pending}
                </div>
              )}
            </motion.article>
          ))}
        </motion.div>

        {visibleRecommendations.length > INITIAL_RECOMMENDATION_LIMIT && (
          <div className="recommendation-list-footer">
            <button type="button" onClick={() => setShowAllRecommendations((current) => !current)} className="recommendation-list-toggle">
              {recommendationToggleLabel}
              <Quote size={15} />
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {requestOpen && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-ink-950/82 px-4 py-6 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="recommendation-form-title"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) closeRequest();
            }}
          >
            <motion.form
              ref={requestDialogRef}
              tabIndex={-1}
              className="case-study-dialog chat-scrollbar max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-white/10 bg-ink-900/94 p-5 shadow-[0_28px_120px_rgba(0,0,0,0.65)] backdrop-blur-2xl sm:p-7"
              initial={{ y: 28, scale: 0.97, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 18, scale: 0.98, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              onSubmit={submitRecommendation}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="section-kicker mb-2">{sectionCopy.kicker}</p>
                  <h3 id="recommendation-form-title" className="font-display text-2xl font-bold tracking-normal text-white sm:text-3xl">
                    {sectionCopy.modalTitle}
                  </h3>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">{sectionCopy.modalCopy}</p>
                </div>
                <button
                  type="button"
                  onClick={closeRequest}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.06] text-slate-200 transition hover:border-electric-300/50 hover:text-electric-300"
                  aria-label={sectionCopy.close}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="hidden" aria-hidden="true">
                  Website
                  <input
                    tabIndex={-1}
                    autoComplete="off"
                    value={websiteField}
                    onChange={(event) => setWebsiteField(event.target.value)}
                  />
                </label>
                <label className="recommendation-field">
                  <span>{sectionCopy.fullName}</span>
                  <input value={form.name} onChange={(event) => updateForm('name', event.target.value)} maxLength={90} required />
                </label>
                <label className="recommendation-field">
                  <span>{sectionCopy.roleLabel}</span>
                  <input value={form.role} onChange={(event) => updateForm('role', event.target.value)} maxLength={90} required />
                </label>
                <label className="recommendation-field">
                  <span>{sectionCopy.companyLabel}</span>
                  <input value={form.company} onChange={(event) => updateForm('company', event.target.value)} maxLength={120} required />
                </label>
                <label className="recommendation-field">
                  <span>{sectionCopy.profileLabel}</span>
                  <input value={form.linkedin} onChange={(event) => updateForm('linkedin', event.target.value)} type="url" placeholder="https://linkedin.com/in/..." maxLength={220} />
                </label>
                <label className="recommendation-field sm:col-span-2">
                  <span>{sectionCopy.quoteLabel}</span>
                  <textarea
                    value={form.quote}
                    onChange={(event) => updateForm('quote', event.target.value)}
                    placeholder={sectionCopy.quotePlaceholder}
                    required
                    rows={6}
                    minLength={40}
                    maxLength={1200}
                  />
                </label>
              </div>

              <label className="mt-5 flex gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-slate-300">
                <input
                  type="checkbox"
                  checked={consentGiven}
                  onChange={(event) => setConsentGiven(event.target.checked)}
                  required
                  className="mt-1 h-4 w-4 shrink-0 accent-electric-500"
                />
                <span>
                  <span className="block font-semibold text-slate-100">{sectionCopy.consentLabel}</span>
                  <span className="mt-1 block text-slate-400">{sectionCopy.privacyNote}</span>
                </span>
              </label>

              <div className="mt-6 flex justify-end">
                {submitError && (
                  <p className="mr-auto max-w-md text-sm font-semibold text-signal-amber">{submitError}</p>
                )}
                <button type="submit" disabled={loading || !consentGiven} className="btn-primary">
                  {loading ? sectionCopy.submitting : sectionCopy.submit}
                  <Send size={17} />
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {adminOpen && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-ink-950/82 px-4 py-6 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="recommendation-admin-title"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) closeAdmin();
            }}
          >
            <motion.div
              ref={adminDialogRef}
              tabIndex={-1}
              className="case-study-dialog chat-scrollbar max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-3xl border border-white/10 bg-ink-900/94 p-5 shadow-[0_28px_120px_rgba(0,0,0,0.65)] backdrop-blur-2xl sm:p-7"
              initial={{ y: 28, scale: 0.97, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 18, scale: 0.98, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="section-kicker mb-2">{sectionCopy.adminKicker}</p>
                  <h3 id="recommendation-admin-title" className="font-display text-2xl font-bold tracking-normal text-white sm:text-3xl">
                    {sectionCopy.adminTitle}
                  </h3>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">{sectionCopy.adminCopy}</p>
                </div>
                <button
                  type="button"
                  onClick={closeAdmin}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.06] text-slate-200 transition hover:border-electric-300/50 hover:text-electric-300"
                  aria-label={sectionCopy.close}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="recommendation-admin-control-note mt-5">
                <Lock size={18} />
                <div>
                  <p>{sectionCopy.adminControlTitle}</p>
                  <small>{sectionCopy.adminControlCopy}</small>
                </div>
              </div>

              {!adminSession?.accessToken ? (
                <form className="mt-6 grid gap-4 sm:max-w-md" onSubmit={submitAdminLogin}>
                  <label className="recommendation-field">
                    <span>{sectionCopy.adminEmailLabel}</span>
                    <input
                      type="email"
                      value={adminEmail}
                      onChange={(event) => setAdminEmail(event.target.value)}
                      placeholder={sectionCopy.adminEmailPlaceholder}
                      autoComplete="username"
                      required
                    />
                  </label>
                  <label className="recommendation-field">
                    <span>{sectionCopy.adminPasswordLabel}</span>
                    <input
                      type="password"
                      value={adminPassword}
                      onChange={(event) => setAdminPassword(event.target.value)}
                      placeholder={sectionCopy.adminPasswordPlaceholder}
                      autoComplete="current-password"
                      required
                    />
                  </label>
                  {adminError && <p className="text-sm font-semibold text-signal-amber">{adminError}</p>}
                  <button type="submit" disabled={adminLoading} className="btn-primary w-fit">
                    {adminLoading ? sectionCopy.adminLoading : sectionCopy.adminLogin}
                    <Lock size={16} />
                  </button>
                </form>
              ) : (
                <div className="mt-6">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-2">
                      <span className="admin-status-pill">{sectionCopy.adminSignedIn}</span>
                      <span className="admin-status-pill">{sectionCopy.adminPendingCount.replace('{count}', adminItems.filter((item) => item.status === 'pending').length)}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => refreshAdminRecommendations()} disabled={adminLoading} className="btn-secondary btn-small">
                        {sectionCopy.adminRefresh}
                        <RefreshCw size={15} />
                      </button>
                      <button type="button" onClick={signOutAdmin} className="btn-secondary btn-small">
                        {sectionCopy.adminSignOut}
                      </button>
                    </div>
                  </div>

                  {adminError && <p className="mb-4 rounded-xl border border-signal-amber/25 bg-signal-amber/10 px-4 py-3 text-sm font-semibold text-signal-amber">{adminError}</p>}
                  {adminLoading && <p className="mb-4 text-sm font-semibold text-electric-300">{sectionCopy.adminLoading}</p>}

                  {!hasSaifReference && (
                    <div className="recommendation-admin-seed mb-4">
                      <div>
                        <p className="text-sm font-bold text-white">{sectionCopy.adminSaifMissingTitle}</p>
                        <p className="mt-1 text-sm leading-6 text-slate-300">{sectionCopy.adminSaifMissingCopy}</p>
                      </div>
                      <button type="button" onClick={addVerifiedSaifReference} disabled={adminLoading} className="btn-secondary btn-small">
                        {sectionCopy.adminAddSaif}
                        <Plus size={15} />
                      </button>
                    </div>
                  )}

                  <div className="recommendation-admin-list">
                    {adminItems.length === 0 ? (
                      <p className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-300">{sectionCopy.adminEmpty}</p>
                    ) : adminItems.map((item) => (
                      <article key={item.id} className="recommendation-admin-item">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-base font-bold text-white">{item.name}</h4>
                            <span className={`recommendation-admin-status is-${item.status}`}>{sectionCopy[`status_${item.status}`] || item.status}</span>
                          </div>
                          <p className="mt-1 text-sm text-slate-400">{item.role} · {item.company}</p>
                          {item.linkedin && (
                            <a href={item.linkedin} target="_blank" rel="noreferrer" className="mt-2 inline-flex text-sm font-semibold text-electric-300 hover:text-white">
                              {item.linkedin}
                            </a>
                          )}
                          <p className="mt-3 text-sm leading-7 text-slate-300">{item.quote}</p>
                        </div>
                        <div className="recommendation-admin-actions">
                          <button type="button" onClick={() => changeAdminStatus(item.id, 'approved')} disabled={adminLoading || item.status === 'approved'} className="btn-secondary btn-small">
                            {sectionCopy.adminApprove}
                            <CheckCircle size={15} />
                          </button>
                          <button type="button" onClick={() => changeAdminStatus(item.id, 'rejected')} disabled={adminLoading || item.status === 'rejected'} className="btn-secondary btn-small">
                            {sectionCopy.adminReject}
                            <XCircle size={15} />
                          </button>
                          <button type="button" onClick={() => removeAdminRecommendation(item.id)} disabled={adminLoading} className="btn-secondary btn-small">
                            {pendingDeleteId === item.id ? sectionCopy.adminConfirmDelete : sectionCopy.adminDelete}
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeRecommendation && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-ink-950/82 px-4 py-6 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="recommendation-detail-title"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) closeDetail();
            }}
          >
            <motion.div
              ref={detailDialogRef}
              tabIndex={-1}
              className="case-study-dialog w-full max-w-2xl rounded-3xl border border-white/10 bg-ink-900/94 p-5 shadow-[0_28px_120px_rgba(0,0,0,0.65)] backdrop-blur-2xl sm:p-7"
              initial={{ y: 28, scale: 0.97, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 18, scale: 0.98, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="section-kicker mb-2">{activeRecommendation.verified ? sectionCopy.verified : activeRecommendation.submitted ? sectionCopy.submitted : sectionCopy.pending}</p>
                  <h3 id="recommendation-detail-title" className="font-display text-2xl font-bold tracking-normal text-white sm:text-3xl">
                    {sectionCopy.fullTitle}
                  </h3>
                  <p className="mt-2 text-sm text-slate-400">
                    {activeRecommendation.name} · {activeRecommendation.role} · {activeRecommendation.company}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeDetail}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.06] text-slate-200 transition hover:border-electric-300/50 hover:text-electric-300"
                  aria-label={sectionCopy.close}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="recommendation-full-quote mt-6 flex gap-4 rounded-2xl border border-white/10 bg-white/[0.045] p-5">
                <Quote size={24} className="mt-1 shrink-0 text-electric-300" />
                <p className="text-base leading-8 text-slate-200">{activeRecommendation.quote}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
