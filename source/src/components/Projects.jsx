import { useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowUpRight, CheckCircle2, FileText, Github, Layers3, Linkedin, Target, UserRound, Wrench, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import SectionHeading from './SectionHeading.jsx';
import ScrollReveal from './ScrollReveal.jsx';
import { fadeUp, staggerContainer } from '../animations/variants.js';
import { useSitePreferences } from '../context/SitePreferencesContext.jsx';
import useDialogA11y from '../hooks/useDialogA11y.js';

const proofIcons = {
  github: Github,
  linkedin: Linkedin,
};

const microStagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.065,
      delayChildren: 0.04,
    },
  },
};

const microReveal = {
  hidden: { opacity: 0, y: 10, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.44, ease: [0.22, 1, 0.36, 1] },
  },
};

function getProofLabel(type, sectionCopy) {
  if (type === 'github') return sectionCopy.githubProof;
  if (type === 'linkedin') return sectionCopy.linkedinProof;
  return sectionCopy.portfolioProof;
}

export default function Projects() {
  const [activeProject, setActiveProject] = useState(null);
  const { copy, portfolioData } = useSitePreferences();
  const { projects } = portfolioData;
  const sectionCopy = copy.sections.projects;
  const modalRoot = typeof document !== 'undefined' ? document.body : null;
  const closeProject = useCallback(() => setActiveProject(null), []);
  const projectDialogRef = useDialogA11y(Boolean(activeProject), closeProject);

  return (
    <section id="projects" className="section-pad">
      <div className="page-container-wide">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            kicker={sectionCopy.kicker}
            title={sectionCopy.title}
            copy={sectionCopy.copy}
          />
          <ScrollReveal className="mb-10 md:mb-12">
            <button type="button" className="btn-secondary" onClick={() => setActiveProject(projects[0])}>
              {sectionCopy.flagship}
              <FileText size={17} />
            </button>
          </ScrollReveal>
        </div>

        <motion.div
          className="project-showcase-grid"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.18 }}
        >
          {projects.map((project) => {
            const cardBullets = project.cardBullets?.length ? project.cardBullets : [project.description];
            const evidenceBullets = project.evidenceBullets?.length ? project.evidenceBullets : [project.result];

            return (
              <motion.article
                key={project.title}
                variants={fadeUp}
                whileHover={{ y: -10 }}
                transition={{ type: 'spring', stiffness: 130, damping: 18 }}
                className={`project-card premium-card group relative overflow-hidden rounded-2xl ${project.featured ? 'project-card-featured' : ''}`}
              >
                <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition duration-300 group-hover:opacity-100 group-hover:shadow-[inset_0_0_0_1px_rgba(118,215,255,0.38),0_0_45px_rgba(28,125,255,0.24)]" />
                <div className="project-card-media relative h-60 overflow-hidden rounded-t-2xl bg-ink-900 sm:h-72">
                  <div className="project-card-media-parallax h-full w-full">
                    <img
                      src={project.image}
                      alt={`${project.title} project visual`}
                      className="project-image-mask h-full w-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/20 to-transparent" />
                  <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                    <span className="rounded-full border border-white/10 bg-ink-950/70 px-3 py-1 text-xs font-semibold text-electric-300 backdrop-blur-xl">
                      {project.period}
                    </span>
                    {project.featured && (
                      <span className="rounded-full border border-signal-cyan/25 bg-signal-cyan/10 px-3 py-1 text-xs font-semibold text-signal-cyan backdrop-blur-xl">
                        {sectionCopy.flagshipBadge}
                      </span>
                    )}
                  </div>
                </div>
                <div className="project-card-content relative z-10 flex flex-col p-5 sm:p-6">
                  <div className="project-priority-row">
                    <span className="project-priority-pill">{project.priority || sectionCopy.priority}</span>
                  </div>
                  <h3 className="mt-3 text-2xl font-bold leading-tight text-white">{project.title}</h3>
                  <motion.ul
                    className="project-card-bullets mt-4"
                    variants={microStagger}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.45 }}
                  >
                    {cardBullets.map((bullet) => (
                      <motion.li key={bullet} variants={microReveal}>
                        <CheckCircle2 size={16} />
                        <span>{bullet}</span>
                      </motion.li>
                    ))}
                  </motion.ul>
                  <div className="project-evidence-panel mt-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-electric-300">{sectionCopy.evidence}</p>
                    <motion.div
                      className="project-evidence-list"
                      variants={microStagger}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true, amount: 0.55 }}
                    >
                      {evidenceBullets.map((bullet) => (
                        <motion.span key={bullet} variants={microReveal}>{bullet}</motion.span>
                      ))}
                    </motion.div>
                  </div>
                  {project.proofLinks?.length ? (
                    <div className="project-proof-links">
                      <span>{sectionCopy.proof}</span>
                      {project.proofLinks.map((link) => {
                        const ProofIcon = proofIcons[link.type] || ArrowUpRight;
                        return (
                          <a key={`${project.title}-${link.type}-${link.url}`} href={link.url} target="_blank" rel="noreferrer" className="project-proof-link">
                            <ProofIcon size={15} />
                            {getProofLabel(link.type, sectionCopy)}
                          </a>
                        );
                      })}
                    </div>
                  ) : null}
                  <div className="mt-auto pt-6">
                    <button type="button" onClick={() => setActiveProject(project)} className="case-study-cta min-h-11 w-full">
                      <span className="inline-flex items-center gap-2">
                        <FileText size={16} />
                        {sectionCopy.viewCaseStudy}
                      </span>
                      <ArrowUpRight size={16} />
                    </button>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </motion.div>
      </div>

      {modalRoot
        ? createPortal(
            <AnimatePresence>
              {activeProject ? (
                <CaseStudyModal
                  key={activeProject.title}
                  project={activeProject}
                  onClose={closeProject}
                  sectionCopy={sectionCopy}
                  dialogRef={projectDialogRef}
                />
              ) : null}
            </AnimatePresence>,
            modalRoot,
          )
        : null}
    </section>
  );
}

function CaseStudyModal({ project, onClose, sectionCopy, dialogRef }) {
  const caseStudy = project.caseStudy || {};
  const depthSections = [
    { label: sectionCopy.problem, value: caseStudy.problem, icon: Target },
    { label: sectionCopy.myRole, value: caseStudy.role, icon: UserRound },
    { label: sectionCopy.architecture, value: caseStudy.architecture, icon: Layers3 },
    { label: sectionCopy.outcomeDeep, value: project.result, icon: CheckCircle2 },
    { label: sectionCopy.improveNext, value: caseStudy.improvement, icon: Wrench },
  ];

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
        aria-label={`${project.title} case study`}
        className="case-study-dialog chat-scrollbar max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-3xl border border-white/15 bg-ink-950/94 shadow-glow backdrop-blur-2xl"
        initial={{ opacity: 0, y: 34, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.96 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="case-study-hero relative h-56 overflow-hidden rounded-t-3xl bg-ink-900 sm:h-72">
          <img
            src={project.image}
            alt={`${project.title} case study visual`}
            className="h-full w-full object-cover opacity-[0.82]"
            loading="lazy"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/45 to-ink-950/15" />
          <button
            type="button"
            onClick={onClose}
            className="case-study-close focus-outline absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-2xl border border-white/15 bg-ink-950/70 text-white backdrop-blur-xl transition hover:border-electric-300/60 hover:text-electric-300"
            aria-label={sectionCopy.close}
            title={sectionCopy.close}
          >
            <X size={20} />
          </button>
          <div className="absolute bottom-5 left-5 right-5">
            <div className="mb-3 flex flex-wrap gap-2">
              <span className="rounded-full border border-electric-300/25 bg-electric-500/12 px-3 py-1 text-xs font-semibold text-electric-300 backdrop-blur-xl">
                {project.period}
              </span>
              {project.featured && (
                <span className="rounded-full border border-signal-cyan/25 bg-signal-cyan/10 px-3 py-1 text-xs font-semibold text-signal-cyan backdrop-blur-xl">
                  {sectionCopy.flagshipCaseStudy}
                </span>
              )}
            </div>
            <h3 className="case-study-hero-title font-display text-3xl font-black tracking-normal text-white sm:text-5xl">
              {project.title}
            </h3>
            <p className="case-study-hero-copy mt-3 max-w-3xl text-sm leading-6 text-slate-200 sm:text-base">
              {caseStudy.focus}
            </p>
          </div>
        </div>

        <div className="relative z-10 grid gap-5 p-5 sm:p-7 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="lg:col-span-2">
            <div className="case-study-panel case-study-result-panel rounded-2xl border border-electric-300/15 bg-electric-500/[0.06] p-5">
              <p className="section-kicker mb-3">{sectionCopy.result}</p>
              <p className="text-sm leading-7 text-slate-300">{project.result}</p>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="case-study-panel rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <p className="section-kicker mb-4">
                <Layers3 size={14} />
                {sectionCopy.caseStudyDepth}
              </p>
              <div className="grid gap-3 md:grid-cols-2">
                {depthSections.map(({ label, value, icon: Icon }) => (
                  <div key={label} className="case-study-depth-card rounded-2xl border border-white/10 bg-ink-950/45 p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="grid h-9 w-9 place-items-center rounded-xl bg-electric-500/12 text-electric-300">
                        <Icon size={17} />
                      </span>
                      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-electric-300">{label}</p>
                    </div>
                    <p className="text-sm leading-6 text-slate-300">{value}</p>
                  </div>
                ))}
                <div className="case-study-depth-card rounded-2xl border border-white/10 bg-ink-950/45 p-4 md:col-span-2">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-electric-500/12 text-electric-300">
                      <Wrench size={17} />
                    </span>
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-electric-300">{sectionCopy.toolsUsed}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(caseStudy.toolsUsed || project.tech || []).map((tool) => (
                      <span key={tool} className="rounded-full border border-electric-300/20 bg-electric-500/10 px-2.5 py-1 text-xs text-electric-200">
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="case-study-panel rounded-2xl border border-white/10 bg-white/[0.045] p-5">
              <p className="section-kicker mb-3">
                <Target size={14} />
                {sectionCopy.challenge}
              </p>
              <p className="text-sm leading-7 text-slate-300">{caseStudy.challenge}</p>
            </div>

            <div className="case-study-panel case-study-result-panel rounded-2xl border border-electric-300/15 bg-electric-500/[0.06] p-5">
              <p className="section-kicker mb-3">{sectionCopy.impact}</p>
              <p className="text-sm leading-7 text-slate-300">{caseStudy.impact}</p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="case-study-panel rounded-2xl border border-white/10 bg-white/[0.045] p-5">
              <p className="section-kicker mb-3">{sectionCopy.approach}</p>
              <ul className="space-y-3">
                {(caseStudy.approach || []).map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-6 text-slate-300">
                    <CheckCircle2 size={17} className="mt-1 shrink-0 text-electric-300" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="case-study-panel rounded-2xl border border-white/10 bg-white/[0.045] p-5">
              <p className="section-kicker mb-3">{sectionCopy.deliverables}</p>
              <div className="flex flex-wrap gap-2">
                {(caseStudy.deliverables || []).map((item) => (
                  <span key={item} className="rounded-full border border-white/10 bg-ink-950/55 px-3 py-1.5 text-xs font-medium text-slate-200">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="case-study-panel rounded-2xl border border-white/10 bg-white/[0.045] p-5">
              <p className="section-kicker mb-3">{sectionCopy.engineeringDetails}</p>
              <div className="grid gap-3 md:grid-cols-3">
                {(caseStudy.details || []).map((item) => (
                  <div key={item} className="case-study-depth-card rounded-2xl border border-white/10 bg-ink-950/45 p-4">
                    <CheckCircle2 size={17} className="mb-3 text-electric-300" />
                    <p className="text-sm leading-6 text-slate-300">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="case-study-panel flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.035] p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-electric-300">{sectionCopy.techStack}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(project.tech || []).map((tech) => (
                    <span key={tech} className="rounded-full border border-electric-300/20 bg-electric-500/10 px-2.5 py-1 text-xs text-electric-200">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                {project.sourceUrl && (
                  <a href={project.sourceUrl} target="_blank" rel="noreferrer" className="btn-secondary min-h-10 px-4 py-2">
                    {project.sourceLabel || sectionCopy.openSource}
                    <ArrowUpRight size={16} />
                  </a>
                )}
                <button type="button" onClick={onClose} className="btn-primary min-h-10 px-4 py-2">
                  {sectionCopy.back}
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.article>
    </motion.div>
  );
}
