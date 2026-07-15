import { useMemo, useState } from 'react';
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion';
import { Download, Languages, Menu, Moon, Sun, X } from 'lucide-react';
import useActiveSection from '../hooks/useActiveSection.js';
import { useSitePreferences } from '../context/SitePreferencesContext.jsx';
import PortfolioAdminPanel from './PortfolioAdminPanel.jsx';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { copy, language, portfolioData, sectionVisibility, setLanguage, theme, toggleTheme } = useSitePreferences();
  const { navItems, personal } = portfolioData;
  const visibleNavItems = useMemo(
    () => navItems.filter((item) => sectionVisibility[item.id] !== false),
    [navItems, sectionVisibility],
  );
  const sectionIds = useMemo(() => visibleNavItems.map((item) => item.id), [visibleNavItems]);
  const homeHref = visibleNavItems[0]?.href || '#about';
  const activeSection = useActiveSection(sectionIds);
  const { scrollYProgress } = useScroll();
  const progressScale = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.25 });

  const closeMenu = () => setOpen(false);

  return (
    <header className="site-header fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-ink-950/62 shadow-[0_14px_50px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
      <motion.div
        className="scroll-progress absolute bottom-[-1px] left-0 h-px w-full origin-left bg-gradient-to-r from-electric-300 via-signal-cyan to-electric-500"
        style={{ scaleX: progressScale }}
      />
      <nav className="site-nav-inner page-container flex min-h-[var(--nav-height)] items-center justify-between gap-4">
        <a href={homeHref} className="site-brand focus-outline flex items-center gap-3 rounded-xl" onClick={closeMenu}>
          <span className="site-brand-mark grid h-10 w-10 place-items-center rounded-xl bg-electric-500 text-xl font-black text-white shadow-glow-soft">
            {personal.initials}
          </span>
          <span className="site-brand-copy block min-w-0">
            <span className="site-brand-name block text-sm font-bold text-white sm:text-base">{personal.name}</span>
            <span className="site-brand-subtitle block text-xs text-slate-400">{copy.navSubtitle}</span>
          </span>
        </a>

        <div className="hidden items-center gap-1 lg:flex">
          {visibleNavItems.map((item) => (
            <a
              key={item.id}
              href={item.href}
              className={`site-nav-link rounded-xl px-3 py-2 text-sm font-medium transition duration-300 ${
                activeSection === item.id
                  ? 'site-nav-link-active bg-electric-500/15 text-electric-300'
                  : 'text-slate-300 hover:bg-white/[0.055] hover:text-white'
              }`}
            >
              {copy.nav[item.id] || item.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <div className="nav-control flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.045] p-1">
            <Languages size={15} className="ml-2 text-electric-300" />
            {['en', 'de'].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setLanguage(option)}
                className={`rounded-lg px-2 py-1 text-xs font-bold uppercase tracking-[0.08em] transition ${
                  language === option ? 'bg-electric-500 text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
                aria-label={`${copy.languageLabel}: ${option.toUpperCase()}`}
              >
                {option}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className="nav-control focus-outline grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.055] text-slate-200 transition hover:border-electric-300/50 hover:text-electric-300"
            aria-label={theme === 'dark' ? copy.themeLight : copy.themeDark}
            title={theme === 'dark' ? copy.themeLight : copy.themeDark}
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <PortfolioAdminPanel variant="nav" />
          <a href={personal.resumeUrl} className="btn-primary min-h-10 px-4 py-2">
            {copy.downloadResume}
            <Download size={16} />
          </a>
        </div>

        <button
          type="button"
          className="site-menu-button focus-outline inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.055] text-white lg:hidden"
          aria-label={copy.openNavigation}
          aria-expanded={open}
          aria-controls="site-mobile-menu"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={21} /> : <Menu size={21} />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="site-mobile-menu"
            className="site-mobile-menu border-t border-white/10 bg-ink-950/95 px-4 pb-5 pt-3 backdrop-blur-2xl lg:hidden"
            initial={{ opacity: 0, height: 0, y: -8 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mx-auto grid max-w-7xl gap-2">
              {visibleNavItems.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  className={`site-nav-link rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    activeSection === item.id ? 'site-nav-link-active bg-electric-500/15 text-electric-300' : 'text-slate-200 hover:bg-white/[0.055]'
                  }`}
                  onClick={closeMenu}
                >
                  {copy.nav[item.id] || item.label}
                </a>
              ))}
              <div className="grid grid-cols-[1fr_auto] gap-2 pt-2">
                <div className="nav-control flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.045] p-1">
                  <Languages size={15} className="ml-2 text-electric-300" />
                  {['en', 'de'].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setLanguage(option)}
                      aria-label={`${copy.languageLabel}: ${option.toUpperCase()}`}
                      className={`flex-1 rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-[0.08em] transition ${
                        language === option ? 'bg-electric-500 text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="nav-control focus-outline grid h-12 w-12 place-items-center rounded-xl border border-white/10 bg-white/[0.055] text-slate-200"
                  aria-label={theme === 'dark' ? copy.themeLight : copy.themeDark}
                >
                  {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </button>
              </div>
              <PortfolioAdminPanel variant="mobile" />
              <a href={personal.resumeUrl} className="btn-primary mt-2 w-full" onClick={closeMenu}>
                {copy.downloadResume}
                <Download size={16} />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
