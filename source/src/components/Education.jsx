import { useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowUpRight, Award, BadgeCheck, ExternalLink, Eye, GraduationCap, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import SectionHeading from './SectionHeading.jsx';
import ScrollReveal from './ScrollReveal.jsx';
import { fadeUp, staggerContainer } from '../animations/variants.js';
import { useSitePreferences } from '../context/SitePreferencesContext.jsx';
import useDialogA11y from '../hooks/useDialogA11y.js';

export default function Education() {
  const [activeCertificate, setActiveCertificate] = useState(null);
  const { copy, portfolioData } = useSitePreferences();
  const { certificates, education } = portfolioData;
  const sectionCopy = copy.sections.education;
  const modalRoot = typeof document !== 'undefined' ? document.body : null;
  const closeCertificate = useCallback(() => setActiveCertificate(null), []);
  const certificateDialogRef = useDialogA11y(Boolean(activeCertificate), closeCertificate);

  return (
    <section id="education" className="section-pad">
      <div className="page-container">
          <SectionHeading
            kicker={sectionCopy.kicker}
            title={sectionCopy.title}
            copy={sectionCopy.copy}
        />

        <motion.div
          className="grid gap-5 lg:grid-cols-2"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.22 }}
        >
          {education.map((item) => (
            <motion.article
              key={item.degree}
              variants={fadeUp}
              whileHover={{ y: -6 }}
              transition={{ type: 'spring', stiffness: 130, damping: 18 }}
              className="education-card premium-card group rounded-2xl p-6"
            >
              <div className="flex gap-4">
                <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] p-3">
                  <img src={item.logo} alt={`${item.university} logo`} className="max-h-full max-w-full object-contain" loading="lazy" decoding="async" />
                </div>
                <div>
                  <p className="inline-flex rounded-full border border-electric-300/20 bg-electric-500/10 px-3 py-1 text-xs font-semibold text-electric-300">{item.year}</p>
                  <h3 className="mt-1 text-xl font-bold text-white">{item.degree}</h3>
                  <p className="mt-1 text-sm font-medium text-slate-300">{item.university}</p>
                  <p className="text-sm text-slate-500">{item.country}</p>
                </div>
              </div>
              <p className="mt-5 text-sm leading-6 text-slate-300">{item.specialization}</p>
              <a href={item.url} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-electric-300 transition group-hover:text-white">
                {sectionCopy.universityWebsite}
                <ArrowUpRight size={16} />
              </a>
            </motion.article>
          ))}
        </motion.div>

        <ScrollReveal className="mt-8">
          <div className="premium-card rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-electric-500/12 text-electric-300">
                <Award size={23} />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-electric-300">{sectionCopy.certificates}</p>
                <h3 className="text-xl font-bold text-white">{sectionCopy.certificatesTitle}</h3>
              </div>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {certificates.map((certificate, index) => (
                <motion.button
                  key={certificate.title}
                  type="button"
                  onClick={() => setActiveCertificate({ ...certificate, index })}
                  whileHover={{ y: -6 }}
                  transition={{ type: 'spring', stiffness: 135, damping: 18 }}
                  className="certificate-card group/cert relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] p-5 text-left transition hover:-translate-y-1 hover:border-electric-300/50 hover:bg-electric-500/10"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="grid h-11 w-11 place-items-center rounded-2xl border border-electric-300/20 bg-electric-500/10 text-electric-300 transition group-hover/cert:bg-electric-500 group-hover/cert:text-white">
                      {index === 0 ? <GraduationCap size={20} /> : <BadgeCheck size={20} />}
                    </div>
                    <span className="rounded-full border border-electric-300/20 bg-electric-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-electric-300">
                      0{index + 1}
                    </span>
                  </div>
                  <h4 className="mt-5 min-h-12 font-semibold leading-6 text-white">{certificate.title}</h4>
                  <p className="mt-2 min-h-24 text-sm leading-6 text-slate-400">{certificate.description}</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-electric-300 transition group-hover/cert:text-white">
                    {sectionCopy.previewCredential}
                    <Eye size={15} />
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>

      {modalRoot
        ? createPortal(
            <AnimatePresence>
              {activeCertificate ? (
                <CertificatePreviewModal
                  certificate={activeCertificate}
                  sectionCopy={sectionCopy}
                  onClose={closeCertificate}
                  dialogRef={certificateDialogRef}
                />
              ) : null}
            </AnimatePresence>,
            modalRoot,
          )
        : null}
    </section>
  );
}

function CertificatePreviewModal({ certificate, sectionCopy, onClose, dialogRef }) {
  const isPdf = String(certificate.url || '').toLowerCase().includes('.pdf');

  return (
    <motion.div
      className="case-study-backdrop fixed inset-0 z-[100] flex items-center justify-center bg-ink-950/82 px-4 py-6 backdrop-blur-xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <motion.article
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={`${certificate.title} ${sectionCopy.certificatePreviewTitle}`}
        className="certificate-preview-dialog case-study-dialog w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-ink-900/94 shadow-[0_28px_120px_rgba(0,0,0,0.65)] backdrop-blur-2xl"
        initial={{ y: 28, scale: 0.97, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: 18, scale: 0.98, opacity: 0 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="certificate-preview-header">
          <div>
            <p className="section-kicker mb-2">{sectionCopy.certificatePreviewTitle}</p>
            <h3 className="font-display text-2xl font-bold tracking-normal text-white sm:text-3xl">{certificate.title}</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">{sectionCopy.certificatePreviewCopy}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.06] text-slate-200 transition hover:border-electric-300/50 hover:text-electric-300"
            aria-label={sectionCopy.closePreview}
            title={sectionCopy.closePreview}
          >
            <X size={18} />
          </button>
        </div>

        <div className="certificate-preview-body">
          <div className="certificate-preview-meta">
            <div className="certificate-preview-thumb">
              {certificate.index === 0 ? <GraduationCap size={30} /> : <BadgeCheck size={30} />}
              <span>0{certificate.index + 1}</span>
            </div>
            <p>{certificate.description}</p>
            <a href={certificate.url} target="_blank" rel="noreferrer" className="case-study-cta mt-4 w-full">
              <span className="inline-flex items-center gap-2">
                <ExternalLink size={16} />
                {sectionCopy.openInNewTab}
              </span>
              <ArrowUpRight size={16} />
            </a>
          </div>

          <div className="certificate-preview-frame">
            <span className="certificate-preview-scan" aria-hidden="true" />
            {isPdf ? (
              <iframe src={certificate.url} title={certificate.title} loading="lazy" />
            ) : (
              <div className="certificate-preview-fallback">
                <Eye size={28} />
                <p>{sectionCopy.previewUnavailable}</p>
              </div>
            )}
          </div>
        </div>
      </motion.article>
    </motion.div>
  );
}
