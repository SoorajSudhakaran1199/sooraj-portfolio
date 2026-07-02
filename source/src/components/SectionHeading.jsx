import ScrollReveal from './ScrollReveal.jsx';

export default function SectionHeading({ kicker, title, copy, align = 'left' }) {
  return (
    <ScrollReveal
      className={`mb-10 sm:mb-12 ${align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}`}
    >
      {kicker && (
        <span className={`section-kicker ${align === 'center' ? 'justify-center' : ''}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-signal-cyan shadow-[0_0_16px_rgba(55,244,255,0.8)]" />
          {kicker}
        </span>
      )}
      <h2 className="section-title">{title}</h2>
      {copy && <p className="section-copy">{copy}</p>}
    </ScrollReveal>
  );
}
