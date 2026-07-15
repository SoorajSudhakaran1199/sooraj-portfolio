import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bell,
  Bot,
  BriefcaseBusiness,
  CheckCircle2,
  Eye,
  GraduationCap,
  Layers3,
  LayoutDashboard,
  Lock,
  Moon,
  Plus,
  RefreshCcw,
  Save,
  Settings2,
  ShieldCheck,
  Sun,
  Trash2,
  UserRound,
  X,
} from 'lucide-react';
import { useSitePreferences } from '../context/SitePreferencesContext.jsx';
import useDialogA11y from '../hooks/useDialogA11y.js';
import {
  deleteChatbotSession,
  fetchChatbotHistory,
} from '../lib/chatbotHistoryService.js';
import {
  defaultPortfolioAdminState,
  fetchPortfolioAdminState,
  resetWebsiteUpdatedAt,
  savePortfolioAdminState,
  sectionKeys,
} from '../lib/portfolioAdminService.js';
import {
  ADMIN_AUTO_SIGN_OUT_MS,
  clearStoredAdminSession,
  getStoredAdminSession,
  signInRecommendationAdmin,
} from '../lib/recommendationService.js';

const tabs = [
  { id: 'control', label: 'Control', icon: LayoutDashboard },
  { id: 'about', label: 'About', icon: UserRound },
  { id: 'content', label: 'Add Content', icon: Layers3 },
  { id: 'chatHistory', label: 'Chat History', icon: Bot },
  { id: 'notify', label: 'Notify', icon: Bell },
];

const sectionLabels = {
  about: 'About / Hero',
  stats: 'Stats',
  projects: 'Projects',
  skills: 'Skills',
  experience: 'Experience',
  education: 'Education',
  recommendations: 'Recommendations',
  contact: 'Contact',
  chatbot: 'Chatbot',
};

const contentKinds = [
  { id: 'projects', label: 'Project', icon: Layers3 },
  { id: 'experiences', label: 'Experience', icon: BriefcaseBusiness },
  { id: 'education', label: 'Education', icon: GraduationCap },
  { id: 'certificates', label: 'Certification', icon: ShieldCheck },
];

const emptyContentItem = {
  projects: {
    title: '',
    period: '',
    priority: '',
    imageUrl: '',
    description: '',
    result: '',
    tech: '',
    cardBullets: '',
    evidenceBullets: '',
  },
  experiences: {
    role: '',
    company: '',
    date: '',
    location: '',
    logoUrl: '',
    description: '',
    highlights: '',
    environment: '',
  },
  education: {
    degree: '',
    university: '',
    year: '',
    country: '',
    logoUrl: '',
    specialization: '',
    url: '',
  },
  certificates: {
    title: '',
    description: '',
    url: '',
  },
};

const aboutFields = [
  ['headline', 'Headline'],
  ['eyebrow', 'Role eyebrow'],
  ['role', 'Role'],
  ['subtitle', 'Subtitle'],
  ['intro', 'Intro'],
  ['summary', 'Summary'],
  ['location', 'Location'],
  ['availability', 'Availability'],
  ['email', 'Public email'],
];

const longAboutFields = new Set(['subtitle', 'intro', 'summary', 'availability']);

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function cloneState(state) {
  return JSON.parse(JSON.stringify(state || defaultPortfolioAdminState));
}

function formatAdminDate(value) {
  const date = new Date(value || '');
  if (Number.isNaN(date.getTime())) return 'Unknown time';
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function shortSessionId(value = '') {
  const text = String(value || '');
  return text.length > 12 ? text.slice(0, 8) : text || 'session';
}

function PortfolioAdminField({ label, children }) {
  return (
    <label className="portfolio-admin-field">
      <span>{label}</span>
      {children}
    </label>
  );
}

export default function PortfolioAdminPanel({ variant = 'nav' }) {
  const { portfolioAdminState, portfolioData, setPortfolioAdminState } = useSitePreferences();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('control');
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [draft, setDraft] = useState(portfolioAdminState);
  const [contentKind, setContentKind] = useState('projects');
  const [contentDraft, setContentDraft] = useState(emptyContentItem.projects);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState('');
  const [expandedChatSession, setExpandedChatSession] = useState('');
  const [pendingDeleteChatSession, setPendingDeleteChatSession] = useState('');
  const closePanel = () => setOpen(false);
  const dialogRef = useDialogA11y(open, closePanel);
  const isMobileLauncher = variant === 'mobile';

  const openPanel = () => {
    setActiveTab('control');
    setMessage('');
    setError('');
    setOpen(true);
  };

  useEffect(() => {
    setSession(getStoredAdminSession());
  }, []);

  useEffect(() => {
    setDraft(cloneState(portfolioAdminState));
  }, [portfolioAdminState]);

  useEffect(() => {
    setContentDraft(emptyContentItem[contentKind]);
  }, [contentKind]);

  useEffect(() => {
    if (!open) return undefined;
    const timer = window.setTimeout(() => {
      dialogRef.current?.scrollTo?.({ top: 0, left: 0, behavior: 'auto' });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [activeTab, dialogRef, open, session?.accessToken]);

  useEffect(() => {
    if (!session?.accessToken) return undefined;

    let timeoutId;
    const expireAdminSession = () => {
      clearStoredAdminSession();
      setSession(null);
      setPassword('');
      setDraft(cloneState(portfolioAdminState));
      setMessage('');
      setError('Admin session expired after 60 seconds of inactivity. Please sign in again.');
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
  }, [portfolioAdminState, session?.accessToken]);

  const itemCounts = useMemo(() => ({
    projects: draft.additions?.projects?.length || 0,
    experiences: draft.additions?.experiences?.length || 0,
    education: draft.additions?.education?.length || 0,
    certificates: draft.additions?.certificates?.length || 0,
  }), [draft.additions]);

  const chatSessions = useMemo(() => {
    const grouped = new Map();

    chatHistory.forEach((row) => {
      const sessionId = row.session_id || 'unknown-session';
      const existing = grouped.get(sessionId) || {
        id: sessionId,
        messages: [],
        startedAt: row.created_at,
        lastAt: row.created_at,
        language: row.language || 'en',
        pageUrl: row.page_url || '',
      };

      existing.messages.push(row);
      if (Date.parse(row.created_at || '') > Date.parse(existing.lastAt || '')) {
        existing.lastAt = row.created_at;
      }
      if (Date.parse(row.created_at || '') < Date.parse(existing.startedAt || '')) {
        existing.startedAt = row.created_at;
      }
      if (!existing.pageUrl && row.page_url) existing.pageUrl = row.page_url;
      grouped.set(sessionId, existing);
    });

    return Array.from(grouped.values())
      .map((sessionItem) => ({
        ...sessionItem,
        messages: sessionItem.messages
          .slice()
          .sort((first, second) => Date.parse(first.created_at || '') - Date.parse(second.created_at || '')),
      }))
      .sort((first, second) => Date.parse(second.lastAt || '') - Date.parse(first.lastAt || ''));
  }, [chatHistory]);

  const refreshChatHistory = useCallback(async () => {
    if (!session?.accessToken) return;
    setChatLoading(true);
    setChatError('');
    try {
      const rows = await fetchChatbotHistory(session.accessToken);
      setChatHistory(rows);
      setPendingDeleteChatSession('');
    } catch (historyError) {
      setChatError(historyError?.message || 'Could not load chatbot history.');
    } finally {
      setChatLoading(false);
    }
  }, [session?.accessToken]);

  useEffect(() => {
    if (open && activeTab === 'chatHistory' && session?.accessToken) {
      refreshChatHistory();
    }
  }, [activeTab, open, refreshChatHistory, session?.accessToken]);

  const updateDraft = (updater) => {
    setMessage('');
    setError('');
    setDraft((current) => updater(cloneState(current)));
  };

  const updateDefault = (key, value) => {
    updateDraft((current) => ({
      ...current,
      defaults: {
        ...current.defaults,
        [key]: value,
      },
    }));
  };

  const updateAbout = (key, value) => {
    updateDraft((current) => ({
      ...current,
      personalOverrides: {
        ...current.personalOverrides,
        [key]: value,
      },
    }));
  };

  const updateNotification = (key, value) => {
    updateDraft((current) => ({
      ...current,
      emailNotifications: {
        ...current.emailNotifications,
        [key]: value,
      },
    }));
  };

  const toggleSection = (key) => {
    updateDraft((current) => ({
      ...current,
      sectionVisibility: {
        ...current.sectionVisibility,
        [key]: current.sectionVisibility?.[key] === false,
      },
    }));
  };

  const updateContentDraft = (field, value) => {
    setContentDraft((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const addContentItem = () => {
    const requiredField = contentKind === 'projects'
      ? 'title'
      : contentKind === 'experiences'
        ? 'role'
        : contentKind === 'education'
          ? 'degree'
          : 'title';

    if (!String(contentDraft[requiredField] || '').trim()) {
      setError(`Add a ${requiredField} before saving this item.`);
      return;
    }

    updateDraft((current) => ({
      ...current,
      additions: {
        ...current.additions,
        [contentKind]: [
          {
            ...contentDraft,
            id: createId(contentKind),
          },
          ...(current.additions?.[contentKind] || []),
        ],
      },
    }));
    setContentDraft(emptyContentItem[contentKind]);
    setMessage('Item added to draft. Use Save Website Updates to publish it.');
  };

  const removeContentItem = (kind, id) => {
    updateDraft((current) => ({
      ...current,
      additions: {
        ...current.additions,
        [kind]: (current.additions?.[kind] || []).filter((item) => item.id !== id),
      },
    }));
    setMessage('Item removed from draft. Use Save Website Updates to publish the removal.');
  };

  const submitLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const nextSession = await signInRecommendationAdmin(email.trim(), password);
      const liveState = await fetchPortfolioAdminState(nextSession.accessToken);
      setSession(nextSession);
      setEmail('');
      setPassword('');
      setDraft(liveState);
      setPortfolioAdminState(liveState);
      setMessage('Admin panel unlocked.');
    } catch (loginError) {
      clearStoredAdminSession();
      setSession(null);
      setError(loginError?.message || 'Admin sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  const saveUpdates = async () => {
    if (!session?.accessToken) return;
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const savedState = await savePortfolioAdminState(session.accessToken, draft);
      setPortfolioAdminState(savedState);
      setDraft(savedState);
      setMessage('Website updates saved.');
    } catch (saveError) {
      setError(saveError?.message || 'Could not save website updates.');
    } finally {
      setLoading(false);
    }
  };

  const resetUpdatedAt = async () => {
    if (!session?.accessToken) return;
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const nextState = await resetWebsiteUpdatedAt(session.accessToken, draft);
      setPortfolioAdminState(nextState);
      setDraft(nextState);
      setMessage('Website update time reset to now.');
    } catch (resetError) {
      setError(resetError?.message || 'Could not reset website update time.');
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    clearStoredAdminSession();
    setSession(null);
    setPassword('');
    setChatHistory([]);
    setExpandedChatSession('');
    setPendingDeleteChatSession('');
    setMessage('');
    setError('');
  };

  const removeChatSession = async (sessionId) => {
    if (!session?.accessToken || !sessionId) return;

    if (pendingDeleteChatSession !== sessionId) {
      setPendingDeleteChatSession(sessionId);
      setChatError('');
      setMessage(`Click delete again to remove chat session ${shortSessionId(sessionId)}.`);
      return;
    }

    setChatLoading(true);
    setChatError('');
    setMessage('');

    try {
      await deleteChatbotSession(session.accessToken, sessionId);
      setChatHistory((current) => current.filter((row) => row.session_id !== sessionId));
      setExpandedChatSession((current) => (current === sessionId ? '' : current));
      setPendingDeleteChatSession('');
      setMessage('Chat session deleted.');
    } catch (deleteError) {
      setChatError(deleteError?.message || 'Could not delete this chat session.');
    } finally {
      setChatLoading(false);
    }
  };

  const modalRoot = typeof document !== 'undefined' ? document.body : null;

  return (
    <>
      <button
        type="button"
        className={`portfolio-admin-launcher is-${isMobileLauncher ? 'mobile' : 'nav'}`}
        onClick={openPanel}
        aria-label="Open portfolio admin panel"
        title="Portfolio Admin"
      >
        <Settings2 size={isMobileLauncher ? 16 : 18} />
        {isMobileLauncher && <span>Admin Control</span>}
      </button>

      {modalRoot ? createPortal(
        <AnimatePresence>
        {open && (
          <motion.div
            className="portfolio-admin-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) closePanel();
            }}
          >
            <motion.div
              ref={dialogRef}
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
              aria-labelledby="portfolio-admin-title"
              className="portfolio-admin-shell chat-scrollbar"
              initial={{ opacity: 0, y: 28, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
              transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="portfolio-admin-header">
                <div>
                  <p className="section-kicker mb-2">
                    <ShieldCheck size={14} />
                    Admin only
                  </p>
                  <h2 id="portfolio-admin-title">Portfolio Control Center</h2>
                  <p>Manage defaults, section visibility, public About text, added portfolio entries, notifications, and update time.</p>
                </div>
                <button type="button" onClick={closePanel} className="portfolio-admin-close" aria-label="Close admin panel">
                  <X size={19} />
                </button>
              </div>

              {!session?.accessToken ? (
                <form className="portfolio-admin-login" onSubmit={submitLogin}>
                  <div className="portfolio-admin-lock">
                    <Lock size={24} />
                    <div>
                      <h3>Password protected admin access</h3>
                      <p>Only the Supabase admin account can save public portfolio changes.</p>
                    </div>
                  </div>
                  <PortfolioAdminField label="Admin email">
                    <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="username" />
                  </PortfolioAdminField>
                  <PortfolioAdminField label="Password">
                    <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" />
                  </PortfolioAdminField>
                  {error && <p className="portfolio-admin-error">{error}</p>}
                  <button type="submit" className="btn-primary w-fit" disabled={loading}>
                    {loading ? 'Checking...' : 'Unlock Admin Panel'}
                    <Lock size={16} />
                  </button>
                </form>
              ) : (
                <div className="portfolio-admin-workspace">
                  <div className="portfolio-admin-status-row">
                    <span><CheckCircle2 size={16} /> Admin session active</span>
                    <span>{portfolioData.personal.name}</span>
                    <button type="button" onClick={signOut}>Sign out</button>
                  </div>

                  <div className="portfolio-admin-tabs" role="tablist" aria-label="Portfolio admin sections">
                    {tabs.map(({ id, label, icon: Icon }) => (
                      <button
                        key={id}
                        type="button"
                        className={activeTab === id ? 'is-active' : ''}
                        onClick={() => setActiveTab(id)}
                      >
                        <Icon size={16} />
                        {label}
                      </button>
                    ))}
                  </div>

                  {activeTab === 'control' && (
                    <div className="portfolio-admin-grid">
                      <section className="portfolio-admin-panel-card">
                        <div className="portfolio-admin-card-title">
                          <Settings2 size={18} />
                          <h3>Default Experience</h3>
                        </div>
                        <div className="portfolio-admin-segmented">
                          <button type="button" className={draft.defaults?.theme === 'dark' ? 'is-active' : ''} onClick={() => updateDefault('theme', 'dark')}>
                            <Moon size={15} />
                            Dark
                          </button>
                          <button type="button" className={draft.defaults?.theme === 'light' ? 'is-active' : ''} onClick={() => updateDefault('theme', 'light')}>
                            <Sun size={15} />
                            Light
                          </button>
                        </div>
                        <div className="portfolio-admin-segmented">
                          <button type="button" className={draft.defaults?.language === 'en' ? 'is-active' : ''} onClick={() => updateDefault('language', 'en')}>
                            EN
                          </button>
                          <button type="button" className={draft.defaults?.language === 'de' ? 'is-active' : ''} onClick={() => updateDefault('language', 'de')}>
                            DE
                          </button>
                        </div>
                      </section>

                      <section className="portfolio-admin-panel-card">
                        <div className="portfolio-admin-card-title">
                          <RefreshCcw size={18} />
                          <h3>Website Update Time</h3>
                        </div>
                        <p className="portfolio-admin-muted">Current footer timestamp:</p>
                        <strong>{draft.websiteUpdatedAt || portfolioData.personal.websiteUpdatedAt}</strong>
                        <button type="button" onClick={resetUpdatedAt} disabled={loading} className="portfolio-admin-inline-button">
                          <RefreshCcw size={15} />
                          Reset to now
                        </button>
                      </section>

                      <section className="portfolio-admin-panel-card portfolio-admin-wide">
                        <div className="portfolio-admin-card-title">
                          <Eye size={18} />
                          <h3>Enable / Disable Sections</h3>
                        </div>
                        <div className="portfolio-admin-section-grid">
                          {sectionKeys.map((key) => (
                            <button
                              key={key}
                              type="button"
                              className={draft.sectionVisibility?.[key] === false ? 'is-disabled' : 'is-enabled'}
                              onClick={() => toggleSection(key)}
                            >
                              <span>{sectionLabels[key]}</span>
                              <strong>{draft.sectionVisibility?.[key] === false ? 'Off' : 'On'}</strong>
                            </button>
                          ))}
                        </div>
                      </section>
                    </div>
                  )}

                  {activeTab === 'about' && (
                    <section className="portfolio-admin-panel-card">
                      <div className="portfolio-admin-card-title">
                        <UserRound size={18} />
                        <h3>Edit Current About Section</h3>
                      </div>
                      <div className="portfolio-admin-form-grid">
                        {aboutFields.map(([key, label]) => (
                          <PortfolioAdminField key={key} label={label}>
                            {longAboutFields.has(key) ? (
                              <textarea
                                rows={key === 'summary' ? 4 : 3}
                                value={draft.personalOverrides?.[key] || ''}
                                placeholder={portfolioData.personal[key] || ''}
                                onChange={(event) => updateAbout(key, event.target.value)}
                              />
                            ) : (
                              <input
                                value={draft.personalOverrides?.[key] || ''}
                                placeholder={portfolioData.personal[key] || ''}
                                onChange={(event) => updateAbout(key, event.target.value)}
                              />
                            )}
                          </PortfolioAdminField>
                        ))}
                      </div>
                    </section>
                  )}

                  {activeTab === 'content' && (
                    <section className="portfolio-admin-panel-card">
                      <div className="portfolio-admin-card-title">
                        <Plus size={18} />
                        <h3>Add Portfolio Content</h3>
                      </div>
                      <div className="portfolio-admin-content-types">
                        {contentKinds.map(({ id, label, icon: Icon }) => (
                          <button key={id} type="button" className={contentKind === id ? 'is-active' : ''} onClick={() => setContentKind(id)}>
                            <Icon size={16} />
                            {label}
                            <span>{itemCounts[id]}</span>
                          </button>
                        ))}
                      </div>
                      <ContentEditor kind={contentKind} value={contentDraft} onChange={updateContentDraft} />
                      <button type="button" onClick={addContentItem} className="portfolio-admin-inline-button">
                        <Plus size={15} />
                        Add to draft
                      </button>
                      <div className="portfolio-admin-remove-section">
                        <div className="portfolio-admin-remove-header">
                          <div>
                            <h4>Remove Added Content</h4>
                            <p>Only content added from this admin panel appears here. Remove a mistaken item, then save website updates.</p>
                          </div>
                          <Trash2 size={18} />
                        </div>
                        <div className="portfolio-admin-added-list">
                          {contentKinds.map(({ id, label }) => (
                            <div key={id}>
                              <h4>{label}s</h4>
                              {(draft.additions?.[id] || []).length === 0 ? (
                                <p>No admin-added {label.toLowerCase()} entries yet.</p>
                              ) : (
                                (draft.additions?.[id] || []).map((item) => (
                                  <article key={item.id}>
                                    <span>{item.title || item.role || item.degree || 'Untitled entry'}</span>
                                    <button type="button" onClick={() => removeContentItem(id, item.id)} aria-label="Remove item">
                                      <Trash2 size={15} />
                                      Remove
                                    </button>
                                  </article>
                                ))
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </section>
                  )}

                  {activeTab === 'chatHistory' && (
                    <section className="portfolio-admin-panel-card portfolio-admin-wide">
                      <div className="portfolio-admin-card-title">
                        <Bot size={18} />
                        <h3>Chatbot History</h3>
                      </div>
                      <div className="portfolio-admin-chat-toolbar">
                        <p>
                          Review recorded chatbot sessions. Use this only for portfolio quality checks, support context, and abuse/privacy review.
                        </p>
                        <button type="button" onClick={refreshChatHistory} disabled={chatLoading} className="portfolio-admin-inline-button">
                          <RefreshCcw size={15} />
                          {chatLoading ? 'Loading...' : 'Refresh History'}
                        </button>
                      </div>
                      <div className="portfolio-admin-notice">
                        <ShieldCheck size={18} />
                        <p>Only signed-in admin access can read or delete these records. Visitors should not share passwords, private phone numbers, or sensitive personal data in chat.</p>
                      </div>
                      {chatError && <p className="portfolio-admin-error">{chatError}</p>}
                      {!chatError && chatLoading && <p className="portfolio-admin-success">Loading chatbot history...</p>}
                      {!chatLoading && chatSessions.length === 0 && (
                        <p className="portfolio-admin-empty-state">No chatbot history records found yet. If this stays empty after testing, run the Supabase SQL migration in <code>source/supabase/portfolio_chatbot_history.sql</code>.</p>
                      )}
                      <div className="portfolio-admin-chat-list">
                        {chatSessions.map((chatSession) => {
                          const expanded = expandedChatSession === chatSession.id;
                          const lastMessage = chatSession.messages[chatSession.messages.length - 1];
                          return (
                            <article key={chatSession.id} className="portfolio-admin-chat-session">
                              <div className="portfolio-admin-chat-session-header">
                                <div>
                                  <h4>Session {shortSessionId(chatSession.id)}</h4>
                                  <p>
                                    {chatSession.messages.length} messages · {chatSession.language?.toUpperCase() || 'EN'} · Last: {formatAdminDate(chatSession.lastAt)}
                                  </p>
                                </div>
                                <div className="portfolio-admin-chat-actions">
                                  <button type="button" onClick={() => setExpandedChatSession(expanded ? '' : chatSession.id)}>
                                    {expanded ? 'Hide Chat' : 'View Chat'}
                                  </button>
                                  <button type="button" onClick={() => removeChatSession(chatSession.id)} disabled={chatLoading}>
                                    <Trash2 size={14} />
                                    {pendingDeleteChatSession === chatSession.id ? 'Confirm Delete' : 'Delete'}
                                  </button>
                                </div>
                              </div>
                              {chatSession.pageUrl && (
                                <p className="portfolio-admin-chat-page">{chatSession.pageUrl}</p>
                              )}
                              {!expanded && lastMessage && (
                                <p className="portfolio-admin-chat-preview">
                                  <strong>{lastMessage.role === 'user' ? 'Visitor' : 'Assistant'}:</strong> {lastMessage.message}
                                </p>
                              )}
                              {expanded && (
                                <div className="portfolio-admin-chat-messages">
                                  {chatSession.messages.map((chatMessage) => (
                                    <div key={chatMessage.id} className={`portfolio-admin-chat-message is-${chatMessage.role}`}>
                                      <div>
                                        <strong>{chatMessage.role === 'user' ? 'Visitor' : 'Assistant'}</strong>
                                        <span>{formatAdminDate(chatMessage.created_at)}</span>
                                      </div>
                                      <p>{chatMessage.message}</p>
                                      {(chatMessage.topic || chatMessage.intent_id) && (
                                        <small>{[chatMessage.topic, chatMessage.intent_id].filter(Boolean).join(' · ')}</small>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </article>
                          );
                        })}
                      </div>
                    </section>
                  )}

                  {activeTab === 'notify' && (
                    <section className="portfolio-admin-panel-card">
                      <div className="portfolio-admin-card-title">
                        <Bell size={18} />
                        <h3>Recommendation Email Notifications</h3>
                      </div>
                      <button
                        type="button"
                        className={`portfolio-admin-notify-toggle ${draft.emailNotifications?.enabled === false ? 'is-disabled' : 'is-enabled'}`}
                        onClick={() => updateNotification('enabled', draft.emailNotifications?.enabled === false)}
                      >
                        <Bell size={17} />
                        {draft.emailNotifications?.enabled === false ? 'Email notification disabled' : 'Email notification enabled'}
                      </button>
                      <PortfolioAdminField label="Send notification to">
                        <input value={draft.emailNotifications?.to || ''} onChange={(event) => updateNotification('to', event.target.value)} type="email" />
                      </PortfolioAdminField>
                      <div className="portfolio-admin-notice">
                        <Bot size={18} />
                        <p>Email sending is handled by a Supabase Edge Function so no email password/API key is exposed in the website code.</p>
                      </div>
                    </section>
                  )}

                  {(message || error) && (
                    <p className={error ? 'portfolio-admin-error' : 'portfolio-admin-success'}>
                      {error || message}
                    </p>
                  )}

                  <div className="portfolio-admin-actions">
                    <button type="button" onClick={() => setDraft(cloneState(portfolioAdminState))} className="btn-secondary" disabled={loading}>
                      Discard Draft
                    </button>
                    <button type="button" onClick={saveUpdates} className="btn-primary" disabled={loading}>
                      {loading ? 'Saving...' : 'Save Website Updates'}
                      <Save size={16} />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>,
        modalRoot,
      ) : null}
    </>
  );
}

function ContentEditor({ kind, value, onChange }) {
  if (kind === 'projects') {
    return (
      <div className="portfolio-admin-form-grid">
        <PortfolioAdminField label="Project title"><input value={value.title || ''} onChange={(event) => onChange('title', event.target.value)} /></PortfolioAdminField>
        <PortfolioAdminField label="Period"><input value={value.period || ''} onChange={(event) => onChange('period', event.target.value)} /></PortfolioAdminField>
        <PortfolioAdminField label="Priority label"><input value={value.priority || ''} onChange={(event) => onChange('priority', event.target.value)} /></PortfolioAdminField>
        <PortfolioAdminField label="Image URL"><input value={value.imageUrl || ''} onChange={(event) => onChange('imageUrl', event.target.value)} /></PortfolioAdminField>
        <PortfolioAdminField label="Description"><textarea rows={3} value={value.description || ''} onChange={(event) => onChange('description', event.target.value)} /></PortfolioAdminField>
        <PortfolioAdminField label="Result"><textarea rows={3} value={value.result || ''} onChange={(event) => onChange('result', event.target.value)} /></PortfolioAdminField>
        <PortfolioAdminField label="Technologies, comma separated"><textarea rows={2} value={value.tech || ''} onChange={(event) => onChange('tech', event.target.value)} /></PortfolioAdminField>
        <PortfolioAdminField label="Card bullets, one per line"><textarea rows={4} value={value.cardBullets || ''} onChange={(event) => onChange('cardBullets', event.target.value)} /></PortfolioAdminField>
      </div>
    );
  }

  if (kind === 'experiences') {
    return (
      <div className="portfolio-admin-form-grid">
        <PortfolioAdminField label="Role"><input value={value.role || ''} onChange={(event) => onChange('role', event.target.value)} /></PortfolioAdminField>
        <PortfolioAdminField label="Company"><input value={value.company || ''} onChange={(event) => onChange('company', event.target.value)} /></PortfolioAdminField>
        <PortfolioAdminField label="Date"><input value={value.date || ''} onChange={(event) => onChange('date', event.target.value)} /></PortfolioAdminField>
        <PortfolioAdminField label="Location"><input value={value.location || ''} onChange={(event) => onChange('location', event.target.value)} /></PortfolioAdminField>
        <PortfolioAdminField label="Logo URL"><input value={value.logoUrl || ''} onChange={(event) => onChange('logoUrl', event.target.value)} /></PortfolioAdminField>
        <PortfolioAdminField label="Description"><textarea rows={3} value={value.description || ''} onChange={(event) => onChange('description', event.target.value)} /></PortfolioAdminField>
        <PortfolioAdminField label="Highlights, one per line"><textarea rows={4} value={value.highlights || ''} onChange={(event) => onChange('highlights', event.target.value)} /></PortfolioAdminField>
        <PortfolioAdminField label="Environment, comma separated"><textarea rows={2} value={value.environment || ''} onChange={(event) => onChange('environment', event.target.value)} /></PortfolioAdminField>
      </div>
    );
  }

  if (kind === 'education') {
    return (
      <div className="portfolio-admin-form-grid">
        <PortfolioAdminField label="Degree"><input value={value.degree || ''} onChange={(event) => onChange('degree', event.target.value)} /></PortfolioAdminField>
        <PortfolioAdminField label="University"><input value={value.university || ''} onChange={(event) => onChange('university', event.target.value)} /></PortfolioAdminField>
        <PortfolioAdminField label="Year"><input value={value.year || ''} onChange={(event) => onChange('year', event.target.value)} /></PortfolioAdminField>
        <PortfolioAdminField label="Country"><input value={value.country || ''} onChange={(event) => onChange('country', event.target.value)} /></PortfolioAdminField>
        <PortfolioAdminField label="Logo URL"><input value={value.logoUrl || ''} onChange={(event) => onChange('logoUrl', event.target.value)} /></PortfolioAdminField>
        <PortfolioAdminField label="Website URL"><input value={value.url || ''} onChange={(event) => onChange('url', event.target.value)} /></PortfolioAdminField>
        <PortfolioAdminField label="Specialization"><textarea rows={3} value={value.specialization || ''} onChange={(event) => onChange('specialization', event.target.value)} /></PortfolioAdminField>
      </div>
    );
  }

  return (
    <div className="portfolio-admin-form-grid">
      <PortfolioAdminField label="Certificate title"><input value={value.title || ''} onChange={(event) => onChange('title', event.target.value)} /></PortfolioAdminField>
      <PortfolioAdminField label="Certificate URL"><input value={value.url || ''} onChange={(event) => onChange('url', event.target.value)} /></PortfolioAdminField>
      <PortfolioAdminField label="Description"><textarea rows={3} value={value.description || ''} onChange={(event) => onChange('description', event.target.value)} /></PortfolioAdminField>
    </div>
  );
}
