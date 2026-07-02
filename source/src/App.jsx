import { Suspense, lazy } from 'react';
import { MotionConfig, motion } from 'framer-motion';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import ParticleField from './components/ParticleField.jsx';
import Home from './pages/Home.jsx';
import { SitePreferencesProvider, useSitePreferences } from './context/SitePreferencesContext.jsx';

const Chatbot = lazy(() => import('./components/Chatbot.jsx'));

function AppShell() {
  const { sectionVisibility } = useSitePreferences();

  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        className="min-h-screen overflow-x-hidden bg-ink-950 text-slate-100"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
      >
        <ParticleField />
        <Navbar />
        <Home />
        <Footer />
        {sectionVisibility.chatbot && (
          <Suspense fallback={null}>
            <Chatbot />
          </Suspense>
        )}
      </motion.div>
    </MotionConfig>
  );
}

export default function App() {
  return (
    <SitePreferencesProvider>
      <AppShell />
    </SitePreferencesProvider>
  );
}
