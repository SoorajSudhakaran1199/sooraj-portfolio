import { motion } from 'framer-motion';
import { ArrowRight, BriefcaseBusiness, Cpu, Mail, MapPin, Sparkles } from 'lucide-react';
import { fadeUp, staggerContainer } from '../animations/variants.js';
import useMouseParallax from '../hooks/useMouseParallax.js';
import { useSitePreferences } from '../context/SitePreferencesContext.jsx';

const blueprintNodes = [
  { top: '12%', left: '16%', size: 'h-2 w-2', delay: 0 },
  { top: '19%', left: '72%', size: 'h-1.5 w-1.5', delay: 0.3 },
  { top: '63%', left: '86%', size: 'h-2 w-2', delay: 0.15 },
  { top: '32%', left: '55%', size: 'h-1 w-1', delay: 0.72 },
  { top: '84%', left: '70%', size: 'h-1.5 w-1.5', delay: 0.24 },
];

const heroParticles = Array.from({ length: 12 }, (_, index) => ({
  id: index,
  left: `${8 + ((index * 17) % 84)}%`,
  top: `${8 + ((index * 29) % 78)}%`,
  size: index % 3 === 0 ? 'h-1.5 w-1.5' : 'h-1 w-1',
  delay: index * 0.18,
}));

export default function Hero() {
  const { position, handlers } = useMouseParallax(24);
  const { copy, portfolioData } = useSitePreferences();
  const { heroAssets, personal, skillChips } = portfolioData;
  const heroCopy = copy.hero;
  const headlinePrefix = personal.headline?.includes(personal.name)
    ? personal.headline.replace(personal.name, '').trim()
    : heroCopy.line1;
  const availabilitySummary = heroCopy.availabilityValue || personal.availability;

  return (
    <section id="about" className="hero-section relative z-10 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute right-0 top-0 h-full w-[72%] bg-[radial-gradient(circle_at_64%_34%,rgba(28,125,255,0.28),transparent_34rem)]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#02050d_0%,rgba(2,5,13,0.9)_34%,rgba(2,5,13,0.28)_74%,#02050d_100%)]" />
      </div>

      <div className="hero-stage mx-auto flex w-full max-w-[1760px] items-center px-4 sm:px-6 lg:px-8">
        <motion.div
          className="hero-cover-card relative w-full overflow-visible rounded-[2rem] border border-white/10 bg-ink-950/60 shadow-[0_34px_140px_rgba(0,0,0,0.55)] backdrop-blur-2xl"
          initial={{ opacity: 0, y: 34, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.86, ease: [0.22, 1, 0.36, 1], delay: 0.18 }}
          {...handlers}
        >
          <div className="hero-cover-clip absolute inset-0 overflow-hidden rounded-[2rem]">
              <motion.img
                src={heroAssets.composite}
                alt="Cinematic portrait of Sooraj Sudhakaran with industrial robotics background"
                className="hero-cover-image absolute inset-0 h-full w-full scale-[1.01] object-cover object-[66%_48%]"
                decoding="async"
                fetchPriority="high"
                animate={{ scale: [1.01, 1.022, 1.01] }}
              transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
              style={{ x: position.x * -0.18, y: position.y * -0.1 }}
            />

            <div className="hero-cover-gradient absolute inset-0" />
            <div className="hero-cover-blueprint absolute inset-0" />
            <div className="hero-blueprint-trace absolute inset-0" aria-hidden="true">
              <span className="trace-line trace-line-a" />
              <span className="trace-line trace-line-b" />
              <span className="trace-line trace-line-c" />
              <span className="trace-pulse trace-pulse-a" />
              <span className="trace-pulse trace-pulse-b" />
            </div>

            <motion.div
              className="absolute left-[47%] top-[17%] hidden h-72 w-72 rounded-full border border-electric-300/25 lg:block"
              animate={{ opacity: [0.28, 0.7, 0.28], scale: [0.96, 1.04, 0.96] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute bottom-[17%] right-[12%] hidden h-36 w-36 rounded-full border border-electric-300/25 lg:block"
              animate={{ opacity: [0.18, 0.55, 0.18], scale: [1, 1.08, 1] }}
              transition={{ duration: 6.2, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute left-[39%] top-[30%] z-10 h-[48%] w-[24%] rounded-full bg-electric-500/22 blur-3xl"
              animate={{ opacity: [0.28, 0.58, 0.28], scale: [0.98, 1.06, 0.98] }}
              transition={{ duration: 5.8, repeat: Infinity, ease: 'easeInOut' }}
              style={{ x: position.x * 0.1, y: position.y * 0.06 }}
            />

            {blueprintNodes.map((node) => (
              <motion.span
                key={`${node.top}-${node.left}`}
                className={`absolute ${node.size} rounded-full bg-electric-300 shadow-[0_0_18px_rgba(55,161,255,0.95)]`}
                style={{ top: node.top, left: node.left }}
                animate={{ opacity: [0.18, 0.85, 0.18], scale: [1, 1.55, 1] }}
                transition={{ duration: 2.8, repeat: Infinity, delay: node.delay, ease: 'easeInOut' }}
              />
            ))}

            {heroParticles.map((particle) => (
              <motion.span
                key={particle.id}
                className={`absolute ${particle.size} rounded-full bg-electric-300/80 shadow-[0_0_16px_rgba(55,161,255,0.85)]`}
                style={{ left: particle.left, top: particle.top }}
                animate={{ y: [0, -18, 0], opacity: [0.12, 0.72, 0.12] }}
                transition={{ duration: 5.5 + (particle.id % 5), repeat: Infinity, delay: particle.delay, ease: 'easeInOut' }}
              />
            ))}

            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-ink-950/90 via-ink-950/30 to-transparent" />
            <div className="pointer-events-none absolute inset-0 rounded-[2rem] shadow-[inset_0_0_0_1px_rgba(118,215,255,0.12),inset_0_0_80px_rgba(28,125,255,0.08)]" />
          </div>

          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="hero-copy-panel relative z-30 flex max-w-[660px] flex-col justify-center px-5 py-10 sm:px-10 lg:px-14 xl:px-16">
            <motion.div variants={fadeUp} className="section-kicker">
              <Sparkles size={14} />
              {personal.eyebrow}
            </motion.div>
            <motion.h1
              variants={fadeUp}
              className="hero-title max-w-[640px] font-display text-[2.72rem] font-black leading-[1.02] tracking-normal text-white sm:text-[4.05rem] lg:text-[4.45rem] xl:text-[4.85rem]"
            >
              <span className="hero-title-mask">
                <motion.span
                  className="block"
                  initial={{ y: '112%', opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.78, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                >
                  {headlinePrefix}
                </motion.span>
              </span>
              <span className="hero-title-mask">
                <motion.span
                  className="hero-name-gradient block"
                  initial={{ y: '112%', opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.42 }}
                >
                  {personal.name}
                </motion.span>
              </span>
            </motion.h1>
            <motion.p variants={fadeUp} className="hero-value-line mt-5 max-w-[36rem] text-base font-semibold uppercase tracking-[0.16em] text-electric-300 sm:text-lg">
              {heroCopy.value}
            </motion.p>
            <motion.p variants={fadeUp} className="mt-6 max-w-[36rem] text-lg leading-8 text-slate-100 sm:text-xl">
              {personal.subtitle}
            </motion.p>
            <motion.p variants={fadeUp} className="mt-4 max-w-[35rem] text-base leading-7 text-slate-300">
              {personal.intro}
            </motion.p>

            <div className="hero-action-row mt-7 flex flex-col gap-3 sm:flex-row">
              <a href="#projects" className="btn-primary">
                {heroCopy.viewProjects}
                <ArrowRight size={17} />
              </a>
              <a href="#contact" className="btn-secondary">
                {heroCopy.contactMe}
                <Mail size={17} />
              </a>
            </div>

            <div className="hero-info-grid mt-7 text-sm text-slate-200">
              <div className="hero-info-card">
                <MapPin size={17} className="text-electric-300" />
                <span className="min-w-0">
                  <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-electric-300/90">{heroCopy.location}</span>
                  <span className="block leading-5 text-white">{personal.location}</span>
                </span>
              </div>
              <div className="hero-info-card">
                <BriefcaseBusiness size={17} className="text-electric-300" />
                <span className="min-w-0">
                  <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-electric-300/90">{heroCopy.availability}</span>
                  <span className="block leading-5 text-white">{availabilitySummary}</span>
                </span>
              </div>
              <a
                href={personal.social.email}
                className="hero-info-card group"
                aria-label={heroCopy.emailAria.replace('{name}', personal.name).replace('{email}', personal.email)}
                title={personal.email}
              >
                <Mail size={17} className="text-electric-300" />
                <span className="min-w-0">
                  <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-electric-300/90">{heroCopy.email}</span>
                  <span className="block leading-5 text-white transition group-hover:text-electric-300">{heroCopy.emailMe}</span>
                </span>
              </a>
            </div>

            <div className="hero-chip-row mt-5 flex flex-wrap gap-3">
              {skillChips.map((skill) => (
                <span className="chip bg-ink-950/45" key={skill}>
                  <Cpu size={14} className="text-electric-300" />
                  {skill}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="hero-mini-card absolute right-[4.5%] top-[15%] z-40 hidden w-56 rounded-2xl border border-electric-300/20 bg-ink-950/58 p-4 shadow-glow-soft backdrop-blur-xl lg:block"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: [0.86, 1, 0.86], y: [0, -10, 0] }}
            transition={{ duration: 5.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-electric-300">{heroCopy.robotWorkflow}</p>
            <div className="mt-3 space-y-2">
              <div className="h-1.5 w-full rounded-full bg-white/10">
                <span className="block h-full w-[78%] rounded-full bg-electric-300 shadow-[0_0_16px_rgba(55,161,255,0.8)]" />
              </div>
              <div className="h-1.5 w-full rounded-full bg-white/10">
                <span className="block h-full w-[58%] rounded-full bg-signal-cyan/80 shadow-[0_0_16px_rgba(55,244,255,0.6)]" />
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-300">{heroCopy.workflowText}</p>
          </motion.div>

          <motion.div
            className="hero-mini-card absolute bottom-8 right-[7%] z-40 hidden max-w-[300px] rounded-2xl border border-white/10 bg-ink-950/66 p-4 shadow-card backdrop-blur-xl sm:block"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: [0, 8, 0] }}
            transition={{ duration: 6.2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-electric-300">{heroCopy.currentFocus}</p>
                <p className="mt-1 text-sm font-semibold leading-5 text-white">{heroCopy.currentFocusText}</p>
              </div>
              <span className="h-3 w-3 shrink-0 rounded-full bg-signal-green shadow-[0_0_18px_rgba(53,211,153,0.85)]" />
            </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}
