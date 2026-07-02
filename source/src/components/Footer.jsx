import { Clock3, Github, Linkedin, Mail } from 'lucide-react';
import { useSitePreferences } from '../context/SitePreferencesContext.jsx';

export default function Footer() {
  const { copy, language, portfolioData } = useSitePreferences();
  const { personal } = portfolioData;
  const updatedAt = new Intl.DateTimeFormat(language === 'de' ? 'de-DE' : 'en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(new Date(personal.websiteUpdatedAt));

  return (
    <footer className="site-footer relative z-10 py-8">
      <div className="page-container-wide flex flex-col gap-5 text-sm text-slate-400 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <p>© 2026 {personal.name}. {copy.footer.rights}</p>
          <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-xs font-medium text-slate-300 backdrop-blur-xl">
            <Clock3 size={14} className="text-electric-300" />
            <span className="text-slate-500">{copy.footer.updated}</span>
            <span className="text-slate-200">{updatedAt}</span>
          </p>
        </div>
        <div className="footer-social-links flex items-center gap-3 text-slate-300">
          <a href={personal.social.linkedin} target="_blank" rel="noreferrer" className="footer-social-link" aria-label={copy.footer.linkedin}>
            <Linkedin size={19} />
          </a>
          <a href={personal.social.github} target="_blank" rel="noreferrer" className="footer-social-link" aria-label={copy.footer.github}>
            <Github size={19} />
          </a>
          <a href={personal.social.email} className="footer-social-link" aria-label={copy.footer.email}>
            <Mail size={19} />
          </a>
        </div>
      </div>
    </footer>
  );
}
