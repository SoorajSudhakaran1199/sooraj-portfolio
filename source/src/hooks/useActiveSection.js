import { useEffect, useState } from 'react';

export default function useActiveSection(sectionIds) {
  const [activeSection, setActiveSection] = useState(sectionIds[0]);

  useEffect(() => {
    const updateActiveSection = () => {
      const viewportAnchor = window.scrollY + window.innerHeight * 0.34;
      let current = sectionIds[0];

      const sections = sectionIds
        .map((id) => document.getElementById(id))
        .filter(Boolean)
        .sort((a, b) => a.offsetTop - b.offsetTop);

      sections.forEach((element) => {
        if (element.offsetTop <= viewportAnchor) {
          current = element.id;
        }
      });

      setActiveSection(current);
    };

    updateActiveSection();
    window.addEventListener('scroll', updateActiveSection, { passive: true });
    window.addEventListener('resize', updateActiveSection);

    return () => {
      window.removeEventListener('scroll', updateActiveSection);
      window.removeEventListener('resize', updateActiveSection);
    };
  }, [sectionIds]);

  return activeSection;
}
