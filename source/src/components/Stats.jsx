import { useEffect, useRef, useState } from 'react';
import { BriefcaseBusiness, Bot, Globe2, Zap } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { fadeUp, staggerContainer } from '../animations/variants.js';
import { useSitePreferences } from '../context/SitePreferencesContext.jsx';

const iconMap = { Bot, BriefcaseBusiness, Globe2, Zap };

function AnimatedNumber({ value, suffix }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let frame = 0;
    const frames = 48;
    const timer = window.setInterval(() => {
      frame += 1;
      setDisplay(Math.round((value * frame) / frames));
      if (frame >= frames) window.clearInterval(timer);
    }, 22);
    return () => window.clearInterval(timer);
  }, [inView, value]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}

export default function Stats() {
  const { portfolioData } = useSitePreferences();
  const { stats } = portfolioData;

  return (
    <section className="relative z-10 -mt-6 pb-10">
      <div className="page-container">
        <motion.div
          className="premium-card grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4 lg:p-5"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.35 }}
        >
          {stats.map((stat) => {
            const Icon = iconMap[stat.icon];
            return (
              <motion.article key={stat.label} variants={fadeUp} whileHover={{ y: -5 }} className="stat-card group rounded-2xl border border-white/10 bg-ink-950/35 p-5 transition hover:border-electric-300/35 hover:bg-electric-500/[0.055]">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-electric-500/12 text-electric-300 transition group-hover:bg-electric-500 group-hover:text-white">
                  <Icon size={25} />
                </div>
                <div className="font-display text-3xl font-black text-white">
                  <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                </div>
                <p className="mt-1 text-sm font-semibold text-white">{stat.label}</p>
                <p className="mt-2 text-xs leading-5 text-slate-400">{stat.detail}</p>
              </motion.article>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
