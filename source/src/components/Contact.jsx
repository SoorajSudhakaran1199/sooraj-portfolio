import { useState } from 'react';
import { ArrowUpRight, BriefcaseBusiness, Download, Github, Linkedin, Mail, MapPin, Send } from 'lucide-react';
import ScrollReveal from './ScrollReveal.jsx';
import { useSitePreferences } from '../context/SitePreferencesContext.jsx';

export default function Contact() {
  const { copy, portfolioData } = useSitePreferences();
  const { personal } = portfolioData;
  const sectionCopy = copy.sections.contact;
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const contactLinks = [
    {
      label: sectionCopy.linkedin,
      href: personal.social.linkedin,
      icon: Linkedin,
      external: true,
    },
    {
      label: sectionCopy.github,
      href: personal.social.github,
      icon: Github,
      external: true,
    },
    {
      label: sectionCopy.email,
      href: personal.social.email,
      icon: Mail,
      external: false,
    },
  ];

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submitContact = (event) => {
    event.preventDefault();
    const subject = encodeURIComponent(`Portfolio inquiry from ${form.name.trim() || 'website visitor'}`);
    const body = encodeURIComponent([
      `Name: ${form.name.trim()}`,
      `Email: ${form.email.trim()}`,
      '',
      form.message.trim(),
    ].join('\n'));
    window.location.href = `${personal.social.email}?subject=${subject}&body=${body}`;
  };

  return (
    <section id="contact" className="contact-section section-pad pb-10">
      <div className="page-container-wide">
        <ScrollReveal>
          <div className="contact-shell premium-card relative overflow-hidden rounded-3xl p-6 sm:p-8 lg:p-10">
            <div className="relative z-10 grid gap-8 xl:grid-cols-[minmax(0,1fr)_26rem] xl:items-center">
              <div className="max-w-4xl">
                <p className="section-kicker">{sectionCopy.kicker}</p>
                <h2 className="font-display text-3xl font-black leading-tight tracking-normal text-white sm:text-5xl lg:text-6xl">
                  {sectionCopy.title}
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                  {sectionCopy.copy}
                </p>
                <div className="contact-signal-grid mt-7">
                  <span>
                    <MapPin size={17} />
                    {personal.location}
                  </span>
                  <span>
                    <BriefcaseBusiness size={17} />
                    {personal.availability}
                  </span>
                  <span>
                    <Mail size={17} />
                    {sectionCopy.meta}
                  </span>
                </div>
              </div>
              <div className="contact-action-panel">
                <div className="contact-action-header">
                  <span className="contact-status-dot" />
                  <span>{personal.role}</span>
                </div>
                <div className="mt-5 flex flex-col gap-3">
                  <a href={personal.social.email} className="btn-primary w-full">
                    {sectionCopy.contact}
                    <Mail size={17} />
                  </a>
                  <a href={personal.resumeUrl} className="btn-secondary w-full">
                    {sectionCopy.overview}
                    <Download size={17} />
                  </a>
                </div>
                <p className="mt-5 text-sm leading-6 text-slate-400">
                  {personal.email}
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal className="mt-5">
          <form className="contact-form-shell premium-card grid gap-4 rounded-2xl p-5 sm:p-6" onSubmit={submitContact}>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="recommendation-field">
                <span>{sectionCopy.formName}</span>
                <input
                  value={form.name}
                  onChange={(event) => updateForm('name', event.target.value)}
                  autoComplete="name"
                  required
                />
              </label>
              <label className="recommendation-field">
                <span>{sectionCopy.formEmail}</span>
                <input
                  value={form.email}
                  onChange={(event) => updateForm('email', event.target.value)}
                  type="email"
                  autoComplete="email"
                  required
                />
              </label>
            </div>
            <label className="recommendation-field">
              <span>{sectionCopy.formMessage}</span>
              <textarea
                value={form.message}
                onChange={(event) => updateForm('message', event.target.value)}
                placeholder={sectionCopy.formMessagePlaceholder}
                rows={5}
                minLength={20}
                required
              />
            </label>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm leading-6 text-slate-400">{sectionCopy.formNote}</p>
              <button type="submit" className="btn-primary shrink-0">
                {sectionCopy.formSubmit}
                <Send size={17} />
              </button>
            </div>
          </form>
        </ScrollReveal>

        <ScrollReveal className="contact-link-grid mt-5">
          {contactLinks.map(({ label, href, icon: Icon, external }) => (
            <a
              key={label}
              href={href}
              target={external ? '_blank' : undefined}
              rel={external ? 'noreferrer' : undefined}
              className="contact-link-card premium-card"
            >
              <span className="contact-link-icon">
                <Icon size={21} />
              </span>
              <span className="min-w-0 flex-1 text-sm font-bold text-white">{label}</span>
              <ArrowUpRight className="contact-link-arrow" size={17} />
            </a>
          ))}
        </ScrollReveal>
      </div>
    </section>
  );
}
