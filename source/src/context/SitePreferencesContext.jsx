import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { siteCopy } from '../data/siteCopy.js';
import { defaultPortfolioAdminState, fetchPublicPortfolioAdminState, mergePortfolioAdminState } from '../lib/portfolioAdminService.js';
import { getComposedPortfolioData } from '../lib/portfolioStateComposer.js';

const SitePreferencesContext = createContext(null);
const THEME_KEY = 'portfolio-theme';
const LANGUAGE_KEY = 'portfolio-language';

const hasStoredPreference = (key) => {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(key) !== null;
};

const getInitialTheme = () => {
  if (typeof window === 'undefined') return 'dark';
  const stored = window.localStorage.getItem(THEME_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
};

const getInitialLanguage = () => {
  if (typeof window === 'undefined') return 'en';
  const stored = window.localStorage.getItem(LANGUAGE_KEY);
  if (stored === 'en' || stored === 'de') return stored;
  return window.navigator.language.toLowerCase().startsWith('de') ? 'de' : 'en';
};

export function SitePreferencesProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);
  const [language, setLanguage] = useState(getInitialLanguage);
  const [themeTouched, setThemeTouched] = useState(() => hasStoredPreference(THEME_KEY));
  const [languageTouched, setLanguageTouched] = useState(() => hasStoredPreference(LANGUAGE_KEY));
  const [portfolioAdminState, setPortfolioAdminState] = useState(defaultPortfolioAdminState);
  const [adminStateLoaded, setAdminStateLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetchPublicPortfolioAdminState()
      .then((state) => {
        if (cancelled) return;
        setPortfolioAdminState(mergePortfolioAdminState(state));
      })
      .finally(() => {
        if (!cancelled) setAdminStateLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!adminStateLoaded) return;
    const defaultTheme = portfolioAdminState.defaults?.theme;
    if (!themeTouched && (defaultTheme === 'dark' || defaultTheme === 'light')) {
      setTheme(defaultTheme);
    }
  }, [adminStateLoaded, portfolioAdminState.defaults?.theme, themeTouched]);

  useEffect(() => {
    if (!adminStateLoaded) return;
    const defaultLanguage = portfolioAdminState.defaults?.language;
    if (!languageTouched && (defaultLanguage === 'en' || defaultLanguage === 'de')) {
      setLanguage(defaultLanguage);
    }
  }, [adminStateLoaded, portfolioAdminState.defaults?.language, languageTouched]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('theme-light', theme === 'light');
    root.classList.toggle('theme-dark', theme === 'dark');
    root.dataset.theme = theme;
    if (themeTouched) window.localStorage.setItem(THEME_KEY, theme);
  }, [theme, themeTouched]);

  useEffect(() => {
    document.documentElement.lang = language === 'de' ? 'de' : 'en';
    if (languageTouched) window.localStorage.setItem(LANGUAGE_KEY, language);
  }, [language, languageTouched]);

  const setThemePreference = (nextTheme) => {
    setThemeTouched(true);
    setTheme(typeof nextTheme === 'function' ? nextTheme : () => nextTheme);
  };

  const setLanguagePreference = (nextLanguage) => {
    setLanguageTouched(true);
    setLanguage(nextLanguage);
  };

  const applyPortfolioAdminState = (nextState) => {
    setPortfolioAdminState(mergePortfolioAdminState(nextState));
  };

  const portfolioData = useMemo(
    () => getComposedPortfolioData(language, portfolioAdminState),
    [language, portfolioAdminState],
  );

  const value = useMemo(
    () => ({
      theme,
      language,
      copy: siteCopy[language],
      portfolioData,
      portfolioAdminState,
      sectionVisibility: portfolioData.sectionVisibility,
      setTheme: setThemePreference,
      setLanguage: setLanguagePreference,
      setPortfolioAdminState: applyPortfolioAdminState,
      toggleTheme: () => setThemePreference((current) => (current === 'dark' ? 'light' : 'dark')),
    }),
    [language, portfolioAdminState, portfolioData, theme],
  );

  return (
    <SitePreferencesContext.Provider value={value}>
      {children}
    </SitePreferencesContext.Provider>
  );
}

export function useSitePreferences() {
  const context = useContext(SitePreferencesContext);
  if (!context) {
    throw new Error('useSitePreferences must be used inside SitePreferencesProvider');
  }
  return context;
}
