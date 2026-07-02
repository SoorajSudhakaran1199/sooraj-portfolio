import { useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight, BriefcaseBusiness, MapPin, X } from 'lucide-react';
import { motion } from 'framer-motion';
import SectionHeading from './SectionHeading.jsx';
import ScrollReveal from './ScrollReveal.jsx';
import { useSitePreferences } from '../context/SitePreferencesContext.jsx';
import useDialogA11y from '../hooks/useDialogA11y.js';

export default function Experience() {
  const [selectedExperience, setSelectedExperience] = useState(null);
  const { copy, portfolioData } = useSitePreferences();
  const { experiences } = portfolioData;
  const sectionCopy = copy.sections.experience;
  const closeExperience = useCallback(() => setSelectedExperience(null), []);
  const experienceDialogRef = useDialogA11y(Boolean(selectedExperience), closeExperience);

  return (
    <section id="experience" className="section-pad">
      <div className="page-container-wide">
        <SectionHeading
          kicker={sectionCopy.kicker}
          title={sectionCopy.title}
          copy={sectionCopy.copy}
        />

        <div className="experience-showcase relative">
          <div className="experience-list">
            {experiences.map((item, index) => (
              <ScrollReveal key={item.role} delay={index * 0.06}>
                <motion.article
                  className="experience-card premium-card group relative overflow-hidden rounded-2xl"
                  whileHover={{ y: -4 }}
                  transition={{ type: 'spring', stiffness: 130, damping: 18 }}
                >
                  <span className="experience-card-glow absolute" aria-hidden="true" />
                  <div className="experience-identity">
                    <div className="experience-logo-frame grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.055] p-3">
                      <img src={item.logo} alt={`${item.company} logo`} className="max-h-full max-w-full object-contain" loading="lazy" decoding="async" />
                    </div>
                    <div>
                      <p className="experience-date-pill inline-flex rounded-full border border-electric-300/20 bg-electric-500/10 px-3 py-1 text-xs font-semibold text-electric-300">{item.date}</p>
                      <h3 className="experience-role mt-1 text-xl font-bold text-white">{item.role}</h3>
                      <p className="experience-company mt-1 text-sm text-slate-300">{item.company}</p>
                      <p className="experience-location text-sm text-slate-500">{item.location}</p>
                    </div>
                  </div>
                  <div className="experience-evidence">
                    <p className="experience-summary max-w-4xl text-sm leading-6 text-slate-300">{item.description}</p>
                    <p className="experience-focus-label mt-5 text-[11px] font-bold uppercase tracking-[0.18em] text-electric-300">{sectionCopy.signals}</p>
                    <div className="experience-highlight-list mt-4 flex flex-wrap gap-2">
                      {item.highlights.map((highlight) => (
                        <span key={highlight} className="experience-highlight-pill rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-300">
                          {highlight}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="experience-card-action">
                    <button type="button" onClick={() => setSelectedExperience(item)} className="experience-detail-button btn-secondary min-h-10 px-4 py-2">
                      {sectionCopy.viewDetails}
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </motion.article>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>

      {selectedExperience ? createPortal(
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink-950/82 px-4 py-6 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="experience-detail-title"
          onClick={closeExperience}
        >
          <motion.div
            ref={experienceDialogRef}
            tabIndex={-1}
            className="case-study-dialog max-h-[88vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-white/10 bg-ink-900/94 p-5 shadow-[0_28px_120px_rgba(0,0,0,0.65)] backdrop-blur-2xl sm:p-7"
            initial={{ y: 28, scale: 0.97, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-4">
                <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] p-3">
                  <img src={selectedExperience.logo} alt={`${selectedExperience.company} logo`} className="max-h-full max-w-full object-contain" />
                </div>
                <div>
                  <p className="section-kicker mb-2">{selectedExperience.date}</p>
                  <h3 id="experience-detail-title" className="font-display text-2xl font-bold tracking-normal text-white sm:text-3xl">
                    {selectedExperience.role}
                  </h3>
                  <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-300">
                    <span className="inline-flex items-center gap-2">
                      <BriefcaseBusiness size={15} className="text-electric-300" />
                      {selectedExperience.company}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <MapPin size={15} className="text-electric-300" />
                      {selectedExperience.location}
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={closeExperience}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.06] text-slate-200 transition hover:border-electric-300/50 hover:text-electric-300"
                aria-label={sectionCopy.close}
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-7 rounded-2xl border border-electric-300/18 bg-electric-500/8 p-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-electric-300">{sectionCopy.focus}</p>
              <p className="mt-2 text-base leading-7 text-slate-200">{selectedExperience.details?.focus || selectedExperience.description}</p>
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-5">
                <h4 className="text-sm font-bold uppercase tracking-[0.14em] text-white">{sectionCopy.engineeringWork}</h4>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
                  {(selectedExperience.details?.responsibilities || selectedExperience.highlights || []).map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-electric-300 shadow-[0_0_12px_rgba(55,161,255,0.9)]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-5">
                <h4 className="text-sm font-bold uppercase tracking-[0.14em] text-white">{sectionCopy.professionalSignal}</h4>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
                  {(selectedExperience.details?.outcomes || selectedExperience.highlights || []).map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-signal-green shadow-[0_0_12px_rgba(53,211,153,0.8)]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-electric-300">{sectionCopy.environment}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {(selectedExperience.details?.environment || selectedExperience.highlights || []).map((item) => (
                  <span key={item} className="chip bg-white/[0.045]">{item}</span>
                ))}
              </div>
            </div>

            <div className="mt-7 flex justify-end">
              <button type="button" onClick={closeExperience} className="btn-primary">
                {sectionCopy.back}
              </button>
            </div>
          </motion.div>
        </motion.div>,
        document.body,
      ) : null}
    </section>
  );
}
