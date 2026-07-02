import Hero from '../components/Hero.jsx';
import Stats from '../components/Stats.jsx';
import Projects from '../components/Projects.jsx';
import Skills from '../components/Skills.jsx';
import Experience from '../components/Experience.jsx';
import Education from '../components/Education.jsx';
import Recommendations from '../components/Recommendations.jsx';
import Contact from '../components/Contact.jsx';
import { useSitePreferences } from '../context/SitePreferencesContext.jsx';

export default function Home() {
  const { sectionVisibility } = useSitePreferences();

  return (
    <main>
      {sectionVisibility.about && <Hero />}
      {sectionVisibility.stats && <Stats />}
      {sectionVisibility.projects && <Projects />}
      {sectionVisibility.skills && <Skills />}
      {sectionVisibility.experience && <Experience />}
      {sectionVisibility.education && <Education />}
      {sectionVisibility.recommendations && <Recommendations />}
      {sectionVisibility.contact && <Contact />}
    </main>
  );
}
