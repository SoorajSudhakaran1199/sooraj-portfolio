import { Bot, Boxes, Code2, Workflow, Wrench } from 'lucide-react';
import { motion } from 'framer-motion';
import SectionHeading from './SectionHeading.jsx';
import { fadeUp, staggerContainer } from '../animations/variants.js';
import { useSitePreferences } from '../context/SitePreferencesContext.jsx';

const iconMap = { Bot, Boxes, Code2, Workflow, Wrench };

const skillListStagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.055,
      delayChildren: 0.08,
    },
  },
};

const skillChipReveal = {
  hidden: { opacity: 0, x: -8 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.34, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function Skills() {
  const { copy, portfolioData } = useSitePreferences();
  const { skillGroups } = portfolioData;
  const sectionCopy = copy.sections.skills;

  return (
    <section id="skills" className="section-pad">
      <div className="page-container">
          <SectionHeading
            kicker={sectionCopy.kicker}
            title={sectionCopy.title}
            copy={sectionCopy.copy}
          />

        <motion.div
          className="grid gap-5 md:grid-cols-2 xl:grid-cols-5"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.18 }}
        >
          {skillGroups.map((group, index) => {
            const Icon = iconMap[group.icon];
            return (
              <motion.article
                key={group.title}
                variants={fadeUp}
                whileHover={{ y: -8, scale: 1.01 }}
                className="premium-card group relative rounded-2xl p-5"
              >
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-electric-500/12 text-electric-300 transition group-hover:bg-electric-500 group-hover:text-white">
                    <Icon size={24} />
                  </div>
                  <span className="text-xs font-bold text-white/20">0{index + 1}</span>
                </div>
                <h3 className="text-lg font-bold text-white">{group.title}</h3>
                <p className="mt-2 min-h-16 text-sm leading-6 text-slate-400">{group.summary}</p>
                <motion.ul
                  className="mt-5 space-y-2"
                  variants={skillListStagger}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.55 }}
                >
                  {group.skills.map((skill) => (
                    <motion.li key={skill} variants={skillChipReveal} className="skill-sequence-item flex items-center gap-2 text-sm text-slate-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-electric-300" />
                      {skill}
                    </motion.li>
                  ))}
                </motion.ul>
              </motion.article>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
