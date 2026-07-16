import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bot, CheckCircle2, Mail, RotateCcw, Send, ShieldCheck, X } from 'lucide-react';
import { useSitePreferences } from '../context/SitePreferencesContext.jsx';
import useDialogA11y from '../hooks/useDialogA11y.js';
import {
  buildInitialHelpBotMessage,
  findHelpBotAnswer,
  getHelpBotQuickPrompts,
} from '../data/helpBotKnowledge.js';
import {
  clearChatbotHistorySessionId,
  getChatbotHistorySessionId,
  recordChatbotMessage,
  saveChatbotLead,
} from '../lib/chatbotHistoryService.js';

const CHATBOT_SESSION_KEY = 'portfolio-help-bot-session-v12';
const CHATBOT_LEAD_KEY = 'portfolio-help-bot-lead-v1';
const LEAD_PROMPT_MESSAGE_THRESHOLD = 5;
const LEAD_INACTIVITY_MS = 45000;
const EXIT_PROMPT_COOLDOWN_MS = 90000;
const MIN_TYPING_DELAY_MS = 700;
const MAX_TYPING_DELAY_MS = 3200;
const TYPING_DELAY_BASE_MS = 420;
const TYPING_DELAY_PER_CHAR_MS = 13;

const normalizeInput = (value = '') => String(value || '')
  .toLowerCase()
  .replace(/[^a-z0-9äöüß\s]+/gi, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const emptyLeadState = () => ({
  status: 'idle',
  name: '',
  email: '',
  companyOrUniversity: '',
  roleOrTitle: '',
  source: '',
  askedAt: '',
  savedAt: '',
});

const activeLeadStatuses = new Set(['asking-name', 'asking-email', 'asking-company', 'asking-role', 'confirming']);

const commonEmailDomainCorrections = {
  'gamil.com': 'gmail.com',
  'gmial.com': 'gmail.com',
  'gmai.com': 'gmail.com',
  'gmail.co': 'gmail.com',
  'gmail.con': 'gmail.com',
  'gnail.com': 'gmail.com',
  'hotmial.com': 'hotmail.com',
  'hotmai.com': 'hotmail.com',
  'outlok.com': 'outlook.com',
  'outloo.com': 'outlook.com',
  'yaho.com': 'yahoo.com',
  'yahoo.con': 'yahoo.com',
  'icloud.con': 'icloud.com',
};

const knownEmailDomains = new Set([
  'gmail.com',
  'googlemail.com',
  'outlook.com',
  'hotmail.com',
  'live.com',
  'yahoo.com',
  'icloud.com',
  'proton.me',
  'protonmail.com',
  'gmx.de',
  'web.de',
  't-online.de',
]);

function createInitialMessages(language) {
  return [buildInitialHelpBotMessage(language)];
}

function normalizeStoredMessages(messages) {
  if (!Array.isArray(messages)) return [];
  return messages
    .map((message) => ({
      from: message?.from === 'user' ? 'user' : 'assistant',
      text: String(message?.text || '').trim(),
      suggestions: Array.isArray(message?.suggestions) ? message.suggestions.filter(Boolean) : [],
      actions: Array.isArray(message?.actions) ? message.actions.filter(Boolean) : [],
      action: message?.action || '',
      match: message?.match && typeof message.match === 'object' ? message.match : null,
    }))
    .filter((message) => message.text);
}

function loadStoredSession(language) {
  if (typeof window === 'undefined') return null;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(CHATBOT_SESSION_KEY) || 'null');
    if (!parsed || parsed.language !== language) return null;
    const messages = normalizeStoredMessages(parsed.messages);
    return messages.length ? messages : null;
  } catch {
    return null;
  }
}

function saveStoredSession(language, messages) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(CHATBOT_SESSION_KEY, JSON.stringify({
    language,
    updatedAt: new Date().toISOString(),
    messages: normalizeStoredMessages(messages).slice(-48),
  }));
}

function clearStoredSession() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(CHATBOT_SESSION_KEY);
}

function normalizeLeadState(value) {
  const state = value && typeof value === 'object' ? value : {};
  const status = ['idle', 'asking-name', 'asking-email', 'asking-company', 'asking-role', 'confirming', 'saved', 'skipped'].includes(state.status)
    ? state.status
    : 'idle';

  return {
    ...emptyLeadState(),
    status,
    name: String(state.name || '').trim().slice(0, 120),
    email: String(state.email || '').trim().slice(0, 180),
    companyOrUniversity: String(state.companyOrUniversity || '').trim().slice(0, 180),
    roleOrTitle: String(state.roleOrTitle || '').trim().slice(0, 160),
    source: String(state.source || '').trim().slice(0, 80),
    askedAt: String(state.askedAt || '').trim(),
    savedAt: String(state.savedAt || '').trim(),
  };
}

function loadStoredLeadState(sessionId) {
  if (typeof window === 'undefined') return emptyLeadState();
  try {
    const parsed = JSON.parse(window.localStorage.getItem(CHATBOT_LEAD_KEY) || 'null');
    if (!parsed || parsed.sessionId !== sessionId) return emptyLeadState();
    return normalizeLeadState(parsed.state);
  } catch {
    return emptyLeadState();
  }
}

function saveStoredLeadState(sessionId, state) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(CHATBOT_LEAD_KEY, JSON.stringify({
    sessionId,
    updatedAt: new Date().toISOString(),
    state: normalizeLeadState(state),
  }));
}

function clearStoredLeadState() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(CHATBOT_LEAD_KEY);
}

function getTypingDelay(message) {
  const textLength = String(message?.text || '').length;
  const suggestionCount = Array.isArray(message?.suggestions) ? message.suggestions.length : 0;
  const actionCount = Array.isArray(message?.actions) ? message.actions.length : 0;
  const calculatedDelay = TYPING_DELAY_BASE_MS
    + (textLength * TYPING_DELAY_PER_CHAR_MS)
    + (Math.min(suggestionCount, 5) * 35)
    + (actionCount * 90);

  return Math.min(MAX_TYPING_DELAY_MS, Math.max(MIN_TYPING_DELAY_MS, calculatedDelay));
}

function isModerationMessage(message) {
  return message?.match?.topic === 'moderation'
    || message?.match?.intentId === 'moderation-disallowed-language';
}

function getMessageBubbleClass(message) {
  const baseClass = 'assistant-message-bubble max-w-[92%] rounded-[1.15rem] px-3.5 py-2.5 text-[13px] leading-6 sm:max-w-[88%] sm:rounded-2xl sm:px-4 sm:py-3 sm:text-sm';

  if (message.from === 'user') {
    return `${baseClass} assistant-message-user bg-electric-500 text-white shadow-glow-soft`;
  }

  if (isModerationMessage(message)) {
    return `${baseClass} assistant-message-alert border border-red-300/45 text-white shadow-card`;
  }

  return `${baseClass} assistant-message-bot border border-white/10 bg-white/[0.065] text-slate-200 shadow-card`;
}

function getRequestedChatLanguage(text, currentLanguage) {
  const normalized = normalizeInput(text);
  if (!normalized) return '';

  const wantsGerman = /\b(german|deutsch|deutsche|auf deutsch|in deutsch|speak german|talk german|switch to german|change to german|translate to german|german language|sprich deutsch|auf deutsch wechseln)\b/.test(normalized);
  const wantsEnglish = /\b(english|englisch|speak english|talk english|switch to english|change to english|translate to english|english language|back to english|sprich englisch|auf englisch wechseln)\b/.test(normalized);

  if (wantsGerman && currentLanguage !== 'de') return 'de';
  if (wantsEnglish && currentLanguage !== 'en') return 'en';
  if (wantsGerman && currentLanguage === 'de') return 'already-de';
  if (wantsEnglish && currentLanguage === 'en') return 'already-en';
  return '';
}

function isConfirmYes(text) {
  return /\b(yes|yeah|yep|sure|ok|okay|confirm|please do|switch|ja|jawohl|bitte)\b/i.test(text);
}

function isConfirmNo(text) {
  return /\b(no|nope|cancel|stop|keep|stay|not now|nein|abbrechen)\b/i.test(text);
}

function isLeadSkip(text) {
  return /\b(skip|not now|no thanks|no thank you|later|cancel|stop|nein|später|spaeter|abbrechen)\b/i.test(text);
}

function isValidLeadName(text) {
  const cleaned = String(text || '').trim();
  return cleaned.length >= 2 && /[a-zA-ZÄÖÜäöüß]/.test(cleaned);
}

function isValidLeadEmail(text) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(String(text || '').trim());
}

function analyzeLeadEmail(text) {
  const email = String(text || '').trim().toLowerCase();
  const basicMatch = email.match(/^([^@\s]+)@([^@\s]+)$/);
  if (!basicMatch) {
    return {
      valid: false,
      message: 'Email must include one @ sign, for example name@gmail.com.',
    };
  }

  const [, localPart, domain] = basicMatch;
  const suggestedDomain = commonEmailDomainCorrections[domain];
  if (suggestedDomain) {
    return {
      valid: false,
      suggestion: `${localPart}@${suggestedDomain}`,
      message: `Did you mean ${localPart}@${suggestedDomain}?`,
    };
  }

  const domainLabels = domain.split('.');
  const hasValidDomain = domainLabels.length >= 2
    && domainLabels.every((label) => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label))
    && /^[a-z]{2,24}$/.test(domainLabels[domainLabels.length - 1]);

  if (!isValidLeadEmail(email) || !hasValidDomain) {
    return {
      valid: false,
      message: 'Email domain does not look valid. Please check the spelling after @.',
    };
  }

  return {
    valid: true,
    email,
    knownDomain: knownEmailDomains.has(domain),
  };
}

function isValidLeadCompany(text) {
  return String(text || '').trim().length >= 2;
}

function getLeadIntroMessage(language, source = 'chatbot') {
  const isExitPrompt = source === 'exit-intent' || source === 'chat-close' || source === 'inactivity';
  return {
    from: 'assistant',
    text: language === 'de'
      ? isExitPrompt
        ? 'Danke fuer Ihren Besuch in Soorajs Portfolio. Wenn Sie eine Rueckmeldung von Sooraj wuenschen, nennen Sie bitte zuerst Ihren Namen. Sie koennen jederzeit "skip" schreiben.'
        : 'Sie haben mehrere Fragen gestellt. Wenn Sooraj bei Bedarf nachfassen soll, nennen Sie bitte zuerst Ihren Namen. Sie koennen jederzeit "skip" schreiben.'
      : isExitPrompt
        ? 'Thanks for visiting Sooraj’s portfolio. If you would like Sooraj to follow up, please share your name first. You can type "skip" anytime.'
        : 'You have explored a few portfolio questions. If you would like Sooraj to follow up, please share your name first. You can type "skip" anytime.',
    suggestions: language === 'de' ? ['Skip'] : ['Skip for now'],
    match: {
      intentId: 'lead-capture-name',
      topic: 'leadCapture',
      score: 100,
    },
  };
}

function getLeadAskEmailMessage(language, name) {
  return {
    from: 'assistant',
    text: language === 'de'
      ? `Danke, ${name}. Bitte teilen Sie Ihre E-Mail-Adresse, damit Sooraj Sie kontaktieren kann.`
      : `Thanks, ${name}. Please share your email address so Sooraj can contact you.`,
    suggestions: language === 'de' ? ['Skip'] : ['Skip for now'],
    match: {
      intentId: 'lead-capture-email',
      topic: 'leadCapture',
      score: 100,
    },
  };
}

function getLeadAskCompanyMessage(language) {
  return {
    from: 'assistant',
    text: language === 'de'
      ? 'Bitte nennen Sie auch Ihr Unternehmen oder Ihre Universitaet.'
      : 'Please also share your company or university.',
    suggestions: language === 'de' ? ['Skip'] : ['Skip for now'],
    match: {
      intentId: 'lead-capture-company',
      topic: 'leadCapture',
      score: 100,
    },
  };
}

function getLeadAskRoleMessage(language) {
  return {
    from: 'assistant',
    text: language === 'de'
      ? 'Optional: Welche Rolle oder Position soll ich notieren? Sie koennen "skip" schreiben.'
      : 'Optional: what role or title should I note? You can type "skip".',
    suggestions: language === 'de' ? ['Skip'] : ['Skip role/title'],
    match: {
      intentId: 'lead-capture-role',
      topic: 'leadCapture',
      score: 100,
    },
  };
}

function getLeadConfirmMessage(language, leadState) {
  const roleLine = leadState.roleOrTitle ? `\nRole/Title: ${leadState.roleOrTitle}` : '';
  return {
    from: 'assistant',
    text: language === 'de'
      ? `Bitte bestaetigen Sie die Angaben:\nName: ${leadState.name}\nE-Mail: ${leadState.email}\nUnternehmen/Universitaet: ${leadState.companyOrUniversity}${roleLine}\nIst das korrekt?`
      : `Please confirm these details:\nName: ${leadState.name}\nEmail: ${leadState.email}\nCompany/University: ${leadState.companyOrUniversity}${roleLine}\nIs this correct?`,
    suggestions: language === 'de' ? ['Ja, korrekt', 'Nein, neu eingeben'] : ['Yes, correct', 'No, edit'],
    match: {
      intentId: 'lead-capture-confirm',
      topic: 'leadCapture',
      score: 100,
    },
  };
}

function getLeadRetryMessage(language, field) {
  const textByField = {
    name: language === 'de'
      ? 'Der Name wirkt zu kurz. Bitte geben Sie einen vollstaendigen Namen ein oder schreiben Sie "skip".'
      : 'That name looks too short. Please enter a full name or type "skip".',
    email: language === 'de'
      ? 'Diese E-Mail-Adresse wirkt nicht vollstaendig. Bitte pruefen Sie sie einmal oder schreiben Sie "skip".'
      : 'That email does not look complete. Please check it once or type "skip".',
    company: language === 'de'
      ? 'Bitte nennen Sie ein Unternehmen oder eine Universitaet, oder schreiben Sie "skip".'
      : 'Please enter a company or university, or type "skip".',
  };

  return {
    from: 'assistant',
    text: textByField[field] || textByField.name,
    suggestions: language === 'de' ? ['Skip'] : ['Skip for now'],
    match: {
      intentId: `lead-capture-${field}-retry`,
      topic: 'leadCapture',
      score: 100,
    },
  };
}

function getLeadSkippedMessage(language) {
  return {
    from: 'assistant',
    text: language === 'de'
      ? 'Kein Problem. Ich frage in dieser Sitzung nicht erneut. Sie koennen Sooraj jederzeit ueber die Kontaktsektion erreichen.'
      : 'No problem. I will not ask again in this session. You can still contact Sooraj anytime from the contact section.',
    suggestions: language === 'de'
      ? ['Sooraj kontaktieren', 'Lebenslauf öffnen']
      : ['Contact Sooraj', 'Open resume'],
    match: {
      intentId: 'lead-capture-skipped',
      topic: 'leadCapture',
      score: 100,
    },
  };
}

function getLeadSavedMessage(language, name) {
  return {
    from: 'assistant',
    text: language === 'de'
      ? `Danke, ${name}. Ich habe die Kontaktdaten fuer Soorajs Follow-up gespeichert.`
      : `Thank you, ${name}. I saved the contact details for Sooraj’s follow-up.`,
    suggestions: language === 'de'
      ? ['KEBA-Workflow erklären', 'Projektbelege zeigen']
      : ['Explain KEBA workflow', 'Show project evidence'],
    match: {
      intentId: 'lead-capture-saved',
      topic: 'leadCapture',
      score: 100,
    },
  };
}

function getLanguageSwitchConfirmation(targetLanguage, currentLanguage) {
  if (targetLanguage === 'de') {
    return {
      from: 'assistant',
      text: currentLanguage === 'de'
        ? 'Soll ich wirklich auf Deutsch weitersprechen?'
        : 'Are you sure you want me to switch to German from here?',
      suggestions: currentLanguage === 'de'
        ? ['Ja, Deutsch', 'Nein, weiter so']
        : ['Yes, switch to German', 'No, keep English'],
    };
  }

  return {
    from: 'assistant',
    text: currentLanguage === 'de'
      ? 'Sind Sie sicher, dass ich ab jetzt Englisch sprechen soll?'
      : 'Are you sure you want me to switch to English from here?',
    suggestions: currentLanguage === 'de'
      ? ['Ja, Englisch', 'Nein, Deutsch behalten']
      : ['Yes, switch to English', 'No, keep English'],
  };
}

function getLanguageAlreadyMessage(language) {
  return {
    from: 'assistant',
    text: language === 'de'
      ? 'Ich spreche bereits Deutsch. Fragen Sie mich gern nach Sooraj, KEBA, ROS, Skills, Lebenslauf oder Kontakt.'
      : 'I am already speaking English. Ask me about Sooraj, KEBA, ROS, skills, resume, or contact.',
    suggestions: language === 'de'
      ? ['Erzähl mir von Sooraj', 'KEBA-Workflow erklären', 'Sooraj kontaktieren']
      : ['Tell me about Sooraj', 'Explain KEBA workflow', 'Contact Sooraj'],
  };
}

function getLanguageSwitchedMessage(targetLanguage) {
  return {
    from: 'assistant',
    text: targetLanguage === 'de'
      ? 'Ja, ich spreche ab jetzt Deutsch. Fragen Sie mich nach Sooraj, Robotik-Fit, KEBA Workflow, ROS-Projekten, Skills, Lebenslauf oder Kontakt.'
      : 'Yes, I will speak English from here. Ask me about Sooraj, robotics fit, KEBA workflow, ROS projects, skills, resume, or contact.',
    suggestions: targetLanguage === 'de'
      ? ['Erzähl mir von Sooraj', 'KEBA-Workflow erklären', 'Lebenslauf öffnen']
      : ['Tell me about Sooraj', 'Explain KEBA workflow', 'Open resume'],
  };
}

function getLanguageSwitchCancelledMessage(language) {
  return {
    from: 'assistant',
    text: language === 'de'
      ? 'Okay, ich behalte die aktuelle Sprache.'
      : 'Okay, I will keep the current language.',
    suggestions: language === 'de'
      ? ['Robotik-Fit bewerten', 'KEBA-Workflow erklären', 'Projektbelege zeigen']
      : ['Assess robotics fit', 'Explain KEBA workflow', 'Show project evidence'],
  };
}

function getNoMatchMessage(language, fallbackSuggestions) {
  return {
    from: 'assistant',
    text: language === 'de'
      ? 'Kein Treffer gefunden. Fragen Sie nach Robotik-Fit, KEBA Workflow, ROS-Projekten, Skills, Erfahrung, Lebenslauf, Datenschutz oder Kontakt.'
      : 'No match found. Ask about robotics fit, KEBA workflow, ROS projects, skills, experience, resume, privacy, or contact.',
    suggestions: fallbackSuggestions,
    match: {
      intentId: 'spelling-confirmation-rejected',
      score: 0,
      topic: 'noMatch',
    },
  };
}

function buildAssistantMessage(answer, fallbackSuggestions) {
  return {
    from: 'assistant',
    text: answer.response,
    actions: answer.actions,
    suggestions: answer.suggestions || fallbackSuggestions,
    match: answer.match,
    confirmation: answer.confirmation || null,
  };
}

export default function Chatbot() {
  const { copy, language, portfolioData, setLanguage } = useSitePreferences();
  const { personal } = portfolioData;
  const chatbotCopy = copy.chatbot;
  const [open, setOpen] = useState(false);
  const panelRef = useDialogA11y(open, () => setOpen(false), { lockScroll: false });
  const [exitPromptOpen, setExitPromptOpen] = useState(false);
  const [leadForm, setLeadForm] = useState({
    name: '',
    email: '',
    companyOrUniversity: '',
    roleOrTitle: '',
  });
  const [leadFormError, setLeadFormError] = useState('');
  const [leadEmailSuggestion, setLeadEmailSuggestion] = useState('');
  const [leadFormSaving, setLeadFormSaving] = useState(false);
  const [messages, setMessages] = useState(() => loadStoredSession(language) || createInitialMessages(language));
  const [input, setInput] = useState('');
  const [inputFocused, setInputFocused] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [pendingLanguageSwitch, setPendingLanguageSwitch] = useState('');
  const [pendingSpellingConfirmation, setPendingSpellingConfirmation] = useState(null);
  const [leadState, setLeadState] = useState(() => loadStoredLeadState(getChatbotHistorySessionId()));
  const scrollRef = useRef(null);
  const typingTimer = useRef(null);
  const historySessionIdRef = useRef(getChatbotHistorySessionId());
  const leadStateRef = useRef(leadState);
  const isTypingRef = useRef(isTyping);
  const promptLeadRef = useRef(null);
  const lastExitPromptAtRef = useRef(0);
  const responseIdRef = useRef(0);
  const skipLanguageResetRef = useRef(false);
  const quickPrompts = useMemo(
    () => getHelpBotQuickPrompts(language, chatbotCopy.prompts),
    [chatbotCopy.prompts, language],
  );

  useEffect(() => {
    if (skipLanguageResetRef.current) {
      skipLanguageResetRef.current = false;
      setInput('');
      setIsTyping(false);
      setPendingSpellingConfirmation(null);
      window.clearTimeout(typingTimer.current);
      responseIdRef.current += 1;
      return;
    }
    setMessages(loadStoredSession(language) || createInitialMessages(language));
    setInput('');
    setIsTyping(false);
    setPendingLanguageSwitch('');
    setPendingSpellingConfirmation(null);
    window.clearTimeout(typingTimer.current);
    responseIdRef.current += 1;
  }, [language]);

  useEffect(() => {
    saveStoredSession(language, messages);
  }, [language, messages]);

  useEffect(() => {
    leadStateRef.current = leadState;
    saveStoredLeadState(historySessionIdRef.current, leadState);
  }, [leadState]);

  useEffect(() => {
    isTypingRef.current = isTyping;
  }, [isTyping]);

  useEffect(() => {
    if (!open || typeof window === 'undefined') return undefined;

    const root = document.documentElement;
    const updateViewportVars = () => {
      const visualViewport = window.visualViewport;
      const visualHeight = Math.round(visualViewport?.height || window.innerHeight);
      const visualOffsetTop = Math.round(visualViewport?.offsetTop || 0);
      const keyboardInset = Math.max(0, Math.round(window.innerHeight - visualHeight - visualOffsetTop));

      root.style.setProperty('--assistant-visual-height', `${visualHeight}px`);
      root.style.setProperty('--assistant-keyboard-inset', `${keyboardInset}px`);
      root.style.setProperty('--assistant-visual-offset-top', `${visualOffsetTop}px`);
    };

    updateViewportVars();
    window.addEventListener('resize', updateViewportVars);
    window.visualViewport?.addEventListener('resize', updateViewportVars);
    window.visualViewport?.addEventListener('scroll', updateViewportVars);

    return () => {
      window.removeEventListener('resize', updateViewportVars);
      window.visualViewport?.removeEventListener('resize', updateViewportVars);
      window.visualViewport?.removeEventListener('scroll', updateViewportVars);
      root.style.removeProperty('--assistant-visual-height');
      root.style.removeProperty('--assistant-keyboard-inset');
      root.style.removeProperty('--assistant-visual-offset-top');
    };
  }, [open]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open, isTyping]);

  useEffect(() => () => window.clearTimeout(typingTimer.current), []);

  useEffect(() => {
    if (!open) setInputFocused(false);
  }, [open]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const handleBeforeUnload = (event) => {
      const hasVisitorMessages = messages.some((message) => message.from === 'user');
      const currentLead = leadStateRef.current || emptyLeadState();
      if (!hasVisitorMessages || currentLead.status === 'saved' || currentLead.status === 'skipped') return;

      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [messages]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    let inactivityTimer;
    const resetInactivityTimer = () => {
      window.clearTimeout(inactivityTimer);
      inactivityTimer = window.setTimeout(() => {
        promptLeadRef.current?.('inactivity');
      }, LEAD_INACTIVITY_MS);
    };

    const handleExitIntent = (event) => {
      if (event.clientY <= 8) {
        promptLeadRef.current?.('exit-intent', { center: true });
      }
    };

    const activityEvents = ['pointerdown', 'keydown', 'scroll', 'touchstart'];
    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, resetInactivityTimer, { passive: true });
    });
    document.addEventListener('mouseleave', handleExitIntent);
    resetInactivityTimer();

    return () => {
      window.clearTimeout(inactivityTimer);
      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, resetInactivityTimer);
      });
      document.removeEventListener('mouseleave', handleExitIntent);
    };
  }, []);

  const resetChat = () => {
    window.clearTimeout(typingTimer.current);
    responseIdRef.current += 1;
    clearStoredSession();
    clearStoredLeadState();
    clearChatbotHistorySessionId();
    historySessionIdRef.current = getChatbotHistorySessionId();
    const nextLeadState = emptyLeadState();
    leadStateRef.current = nextLeadState;
    setLeadState(nextLeadState);
    setExitPromptOpen(false);
    setLeadForm({ name: '', email: '', companyOrUniversity: '', roleOrTitle: '' });
    setLeadFormError('');
    setLeadEmailSuggestion('');
    setLeadFormSaving(false);
    setIsTyping(false);
    setPendingLanguageSwitch('');
    setPendingSpellingConfirmation(null);
    setInput('');
    setMessages(createInitialMessages(language));
  };

  const queueAssistantMessage = (messageFactory, afterAppend) => {
    const responseId = responseIdRef.current + 1;
    responseIdRef.current = responseId;
    setIsTyping(true);
    window.clearTimeout(typingTimer.current);
    const startedAt = Date.now();
    let messageResult;

    try {
      messageResult = typeof messageFactory === 'function' ? messageFactory() : messageFactory;
    } catch {
      messageResult = Promise.reject(new Error('Chatbot reply failed'));
    }

    Promise.resolve(messageResult)
      .then((message) => {
        if (responseIdRef.current !== responseId) return;
        const remainingDelay = Math.max(120, getTypingDelay(message) - (Date.now() - startedAt));
        typingTimer.current = window.setTimeout(() => {
          if (responseIdRef.current !== responseId) return;
          setMessages((current) => [...current, message]);
          recordChatbotMessage({
            sessionId: historySessionIdRef.current,
            language,
            role: 'assistant',
            text: message.text,
            match: message.match,
            source: 'assistant-reply',
          }).catch(() => null);
          setIsTyping(false);
          if (typeof afterAppend === 'function') afterAppend(message);
        }, remainingDelay);
      })
      .catch(() => {
        if (responseIdRef.current !== responseId) return;
        setMessages((current) => [
          ...current,
          {
            from: 'assistant',
            text: language === 'de'
              ? 'Ich konnte diese Antwort gerade nicht laden. Bitte versuchen Sie es noch einmal oder fragen Sie nach Projekten, Skills, Lebenslauf oder Kontakt.'
              : 'I could not load that answer right now. Please try again, or ask about projects, skills, resume, or contact.',
            suggestions: chatbotCopy.defaultSuggestions,
          },
        ]);
        recordChatbotMessage({
          sessionId: historySessionIdRef.current,
          language,
          role: 'assistant',
          text: language === 'de'
            ? 'Ich konnte diese Antwort gerade nicht laden. Bitte versuchen Sie es noch einmal oder fragen Sie nach Projekten, Skills, Lebenslauf oder Kontakt.'
            : 'I could not load that answer right now. Please try again, or ask about projects, skills, resume, or contact.',
          source: 'assistant-error',
        }).catch(() => null);
        setIsTyping(false);
      });
  };

  const canPromptForLead = () => {
    const currentLead = leadStateRef.current || emptyLeadState();
    if (currentLead.status !== 'idle') return false;
    if (isTypingRef.current) return false;
    if (exitPromptOpen) return false;
    return true;
  };

  const showCenteredLeadPrompt = (source = 'exit-intent') => {
    if (!canPromptForLead()) return false;
    const now = Date.now();
    if (now - lastExitPromptAtRef.current < EXIT_PROMPT_COOLDOWN_MS) return false;

    lastExitPromptAtRef.current = now;
    setLeadForm({
      name: '',
      email: '',
      companyOrUniversity: '',
      roleOrTitle: '',
    });
    setLeadFormError('');
    setLeadEmailSuggestion('');
    setOpen(false);
    setExitPromptOpen(true);

    const nextLeadState = {
      ...emptyLeadState(),
      source,
      askedAt: new Date().toISOString(),
    };
    leadStateRef.current = nextLeadState;
    setLeadState(nextLeadState);
    return true;
  };

  const promptForLead = (source = 'chatbot') => {
    if (!canPromptForLead()) return false;

    const nextLeadState = {
      ...emptyLeadState(),
      status: 'asking-name',
      source,
      askedAt: new Date().toISOString(),
    };

    leadStateRef.current = nextLeadState;
    setLeadState(nextLeadState);
    setOpen(true);
    queueAssistantMessage(getLeadIntroMessage(language, source));
    return true;
  };

  promptLeadRef.current = (source = 'chatbot', options = {}) => (
    options.center ? showCenteredLeadPrompt(source) : promptForLead(source)
  );

  const skipLeadCapture = () => {
    const nextLeadState = {
      ...leadStateRef.current,
      status: 'skipped',
    };
    leadStateRef.current = nextLeadState;
    setLeadState(nextLeadState);
    queueAssistantMessage(getLeadSkippedMessage(language));
  };

  const handleLeadCaptureInput = (trimmed) => {
    const currentLead = leadStateRef.current || emptyLeadState();

    if (isLeadSkip(trimmed) && currentLead.status !== 'asking-role') {
      skipLeadCapture();
      return true;
    }

    if (currentLead.status === 'asking-name') {
      if (!isValidLeadName(trimmed)) {
        queueAssistantMessage(getLeadRetryMessage(language, 'name'));
        return true;
      }

      const nextLeadState = {
        ...currentLead,
        status: 'asking-email',
        name: trimmed.slice(0, 120),
      };
      leadStateRef.current = nextLeadState;
      setLeadState(nextLeadState);
      queueAssistantMessage(getLeadAskEmailMessage(language, nextLeadState.name));
      return true;
    }

    if (currentLead.status === 'asking-email') {
      const emailCheck = analyzeLeadEmail(trimmed);
      if (!emailCheck.valid) {
        queueAssistantMessage({
          ...getLeadRetryMessage(language, 'email'),
          text: emailCheck.suggestion
            ? emailCheck.message
            : getLeadRetryMessage(language, 'email').text,
          suggestions: emailCheck.suggestion
            ? [emailCheck.suggestion, 'Skip for now']
            : getLeadRetryMessage(language, 'email').suggestions,
        });
        return true;
      }

      const nextLeadState = {
        ...currentLead,
        status: 'asking-company',
        email: emailCheck.email.slice(0, 180),
      };
      leadStateRef.current = nextLeadState;
      setLeadState(nextLeadState);
      queueAssistantMessage(getLeadAskCompanyMessage(language));
      return true;
    }

    if (currentLead.status === 'asking-company') {
      if (!isValidLeadCompany(trimmed)) {
        queueAssistantMessage(getLeadRetryMessage(language, 'company'));
        return true;
      }

      const nextLeadState = {
        ...currentLead,
        status: 'asking-role',
        companyOrUniversity: trimmed.slice(0, 180),
      };
      leadStateRef.current = nextLeadState;
      setLeadState(nextLeadState);
      queueAssistantMessage(getLeadAskRoleMessage(language));
      return true;
    }

    if (currentLead.status === 'asking-role') {
      const nextLeadState = {
        ...currentLead,
        status: 'confirming',
        roleOrTitle: isLeadSkip(trimmed) ? '' : trimmed.slice(0, 160),
      };
      leadStateRef.current = nextLeadState;
      setLeadState(nextLeadState);
      queueAssistantMessage(getLeadConfirmMessage(language, nextLeadState));
      return true;
    }

    if (currentLead.status === 'confirming') {
      if (isConfirmYes(trimmed)) {
        queueAssistantMessage(
          async () => {
            try {
              await saveChatbotLead({
                sessionId: historySessionIdRef.current,
                name: currentLead.name,
                email: currentLead.email,
                companyOrUniversity: currentLead.companyOrUniversity,
                roleOrTitle: currentLead.roleOrTitle,
                source: currentLead.source || 'chatbot-lead-capture',
              });
              const savedLeadState = {
                ...currentLead,
                status: 'saved',
                savedAt: new Date().toISOString(),
              };
              leadStateRef.current = savedLeadState;
              setLeadState(savedLeadState);
              return getLeadSavedMessage(language, currentLead.name);
            } catch {
              return {
                from: 'assistant',
                text: language === 'de'
                  ? 'Ich konnte die Kontaktdaten gerade nicht speichern. Bitte nutzen Sie die Kontaktsektion oder versuchen Sie es spaeter erneut.'
                  : 'I could not save the contact details right now. Please use the contact section or try again later.',
                suggestions: language === 'de' ? ['Sooraj kontaktieren'] : ['Contact Sooraj'],
                match: {
                  intentId: 'lead-capture-save-failed',
                  topic: 'leadCapture',
                  score: 100,
                },
              };
            }
          },
        );
        return true;
      }

      if (isConfirmNo(trimmed)) {
        const nextLeadState = {
          ...emptyLeadState(),
          status: 'asking-name',
          source: currentLead.source || 'chatbot-lead-capture-edit',
          askedAt: currentLead.askedAt || new Date().toISOString(),
        };
        leadStateRef.current = nextLeadState;
        setLeadState(nextLeadState);
        queueAssistantMessage({
          ...getLeadIntroMessage(language, 'chatbot'),
          text: language === 'de'
            ? 'Kein Problem. Bitte geben Sie den Namen erneut ein, oder schreiben Sie "skip".'
            : 'No problem. Please enter the name again, or type "skip".',
        });
        return true;
      }

      queueAssistantMessage({
        from: 'assistant',
        text: language === 'de'
          ? 'Bitte bestaetigen Sie mit Ja oder Nein.'
          : 'Please confirm with yes or no.',
        suggestions: language === 'de' ? ['Ja', 'Nein'] : ['Yes', 'No'],
      });
      return true;
    }

    return false;
  };

  const sendMessage = (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const userMessageCount = messages.filter((message) => message.from === 'user').length + 1;

    setMessages((current) => [...current, { from: 'user', text: trimmed }]);
    recordChatbotMessage({
      sessionId: historySessionIdRef.current,
      language,
      role: 'user',
      text: trimmed,
      source: 'visitor-message',
    }).catch(() => null);
    setInput('');

    if (activeLeadStatuses.has(leadStateRef.current?.status)) {
      if (handleLeadCaptureInput(trimmed)) return;
    }

    if (pendingSpellingConfirmation) {
      if (isConfirmYes(trimmed)) {
        const confirmedInput = pendingSpellingConfirmation.input;
        setPendingSpellingConfirmation(null);
        queueAssistantMessage(() => findHelpBotAnswer(confirmedInput, language, { skipConfirmation: true })
          .then((answer) => buildAssistantMessage(answer, chatbotCopy.defaultSuggestions)));
        return;
      }

      if (isConfirmNo(trimmed)) {
        setPendingSpellingConfirmation(null);
        queueAssistantMessage(getNoMatchMessage(language, chatbotCopy.defaultSuggestions));
        return;
      }

      setPendingSpellingConfirmation(null);
    }

    if (pendingLanguageSwitch) {
      if (isConfirmYes(trimmed)) {
        const targetLanguage = pendingLanguageSwitch;
        setPendingLanguageSwitch('');
        queueAssistantMessage(
          getLanguageSwitchedMessage(targetLanguage),
          () => {
            skipLanguageResetRef.current = true;
            setLanguage(targetLanguage);
          },
        );
        return;
      }

      if (isConfirmNo(trimmed)) {
        setPendingLanguageSwitch('');
        queueAssistantMessage(getLanguageSwitchCancelledMessage(language));
        return;
      }

      queueAssistantMessage({
        from: 'assistant',
        text: language === 'de'
          ? 'Bitte bestätigen Sie zuerst: Ja zum Sprachwechsel oder Nein, um die aktuelle Sprache zu behalten.'
          : 'Please confirm first: yes to switch language, or no to keep the current language.',
        suggestions: language === 'de'
          ? ['Ja', 'Nein']
          : ['Yes', 'No'],
      });
      return;
    }

    const requestedLanguage = getRequestedChatLanguage(trimmed, language);
    if (requestedLanguage === 'already-de' || requestedLanguage === 'already-en') {
      queueAssistantMessage(getLanguageAlreadyMessage(language));
      return;
    }

    if (requestedLanguage === 'de' || requestedLanguage === 'en') {
      setPendingLanguageSwitch(requestedLanguage);
      queueAssistantMessage(getLanguageSwitchConfirmation(requestedLanguage, language));
      return;
    }

    queueAssistantMessage(
      () => findHelpBotAnswer(trimmed, language)
        .then((answer) => buildAssistantMessage(answer, chatbotCopy.defaultSuggestions)),
      (message) => {
        setPendingSpellingConfirmation(message.confirmation || null);
        if (userMessageCount >= LEAD_PROMPT_MESSAGE_THRESHOLD) {
          window.setTimeout(() => {
            promptLeadRef.current?.('continued-chat');
          }, 420);
        }
      },
    );
  };

  const submit = (event) => {
    event.preventDefault();
    sendMessage(input);
  };

  const focusInput = () => {
    setInputFocused(true);
    window.setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 160);
  };

  const blurInput = () => {
    window.setTimeout(() => setInputFocused(false), 120);
  };

  const dismissExitPrompt = () => {
    const nextLeadState = {
      ...leadStateRef.current,
      status: 'skipped',
    };
    leadStateRef.current = nextLeadState;
    setLeadState(nextLeadState);
    setExitPromptOpen(false);
    setLeadFormError('');
    setLeadEmailSuggestion('');
  };

  const continueExitPromptInChat = () => {
    const source = leadStateRef.current?.source || 'exit-prompt-chat';
    const nextLeadState = {
      ...emptyLeadState(),
      status: 'asking-name',
      source,
      askedAt: leadStateRef.current?.askedAt || new Date().toISOString(),
    };
    leadStateRef.current = nextLeadState;
    setLeadState(nextLeadState);
    setExitPromptOpen(false);
    setLeadFormError('');
    setLeadEmailSuggestion('');
    setOpen(true);
    queueAssistantMessage(getLeadIntroMessage(language, source));
  };

  const updateLeadForm = (field, value) => {
    setLeadForm((current) => ({
      ...current,
      [field]: value,
    }));
    setLeadFormError('');
    if (field === 'email') setLeadEmailSuggestion('');
  };

  const submitExitLeadForm = async (event) => {
    event.preventDefault();
    const name = leadForm.name.trim();
    const companyOrUniversity = leadForm.companyOrUniversity.trim();
    const roleOrTitle = leadForm.roleOrTitle.trim();
    const emailCheck = analyzeLeadEmail(leadForm.email);

    if (!isValidLeadName(name)) {
      setLeadFormError('Please enter a full name before saving.');
      return;
    }

    if (!emailCheck.valid) {
      setLeadEmailSuggestion(emailCheck.suggestion || '');
      setLeadFormError(emailCheck.message || 'Please enter a valid email address.');
      return;
    }

    if (!isValidLeadCompany(companyOrUniversity)) {
      setLeadFormError('Please enter a company or university before saving.');
      return;
    }

    setLeadFormSaving(true);
    setLeadFormError('');
    setLeadEmailSuggestion('');

    try {
      await saveChatbotLead({
        sessionId: historySessionIdRef.current,
        name,
        email: emailCheck.email,
        companyOrUniversity,
        roleOrTitle,
        source: leadStateRef.current?.source || 'center-exit-prompt',
      });
      const savedLeadState = {
        ...emptyLeadState(),
        status: 'saved',
        name,
        email: emailCheck.email,
        companyOrUniversity,
        roleOrTitle,
        source: leadStateRef.current?.source || 'center-exit-prompt',
        askedAt: leadStateRef.current?.askedAt || new Date().toISOString(),
        savedAt: new Date().toISOString(),
      };
      leadStateRef.current = savedLeadState;
      setLeadState(savedLeadState);
      setExitPromptOpen(false);
      setOpen(true);
      queueAssistantMessage(getLeadSavedMessage(language, name));
    } catch {
      setLeadFormError('I could not save the contact details right now. Please try again or use the contact section.');
    } finally {
      setLeadFormSaving(false);
    }
  };

  const closeChatbot = () => {
    const hasVisitorMessages = messages.some((message) => message.from === 'user');
    if (hasVisitorMessages && showCenteredLeadPrompt('chat-close')) return;
    setOpen(false);
  };

  return (
    <>
      <AnimatePresence>
        {exitPromptOpen && (
          <motion.div
            className="assistant-exit-backdrop"
            role="dialog"
            aria-modal="true"
            aria-labelledby="assistant-exit-title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) dismissExitPrompt();
            }}
          >
            <motion.form
              className="assistant-exit-card"
              onSubmit={submitExitLeadForm}
              initial={{ opacity: 0, y: 18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.24, ease: 'easeOut' }}
            >
              <div className="assistant-exit-card-header">
                <span>
                  <ShieldCheck size={18} />
                </span>
                <button type="button" onClick={dismissExitPrompt} aria-label="Close contact prompt">
                  <X size={18} />
                </button>
              </div>
              <p className="assistant-exit-kicker">Before you leave</p>
              <h2 id="assistant-exit-title">Thanks for visiting Sooraj’s portfolio.</h2>
              <p className="assistant-exit-copy">
                If you would like Sooraj to follow up, share your name, email, and company or university. You can also continue without sharing.
              </p>

              <div className="assistant-exit-grid">
                <label>
                  <span>Name</span>
                  <input
                    value={leadForm.name}
                    onChange={(event) => updateLeadForm('name', event.target.value)}
                    autoComplete="name"
                    placeholder="Your name"
                  />
                </label>
                <label>
                  <span>Email</span>
                  <input
                    value={leadForm.email}
                    onChange={(event) => updateLeadForm('email', event.target.value)}
                    autoComplete="email"
                    inputMode="email"
                    placeholder="name@gmail.com"
                  />
                </label>
                <label>
                  <span>Company / University</span>
                  <input
                    value={leadForm.companyOrUniversity}
                    onChange={(event) => updateLeadForm('companyOrUniversity', event.target.value)}
                    autoComplete="organization"
                    placeholder="Company or university"
                  />
                </label>
                <label>
                  <span>Role / Title <small>optional</small></span>
                  <input
                    value={leadForm.roleOrTitle}
                    onChange={(event) => updateLeadForm('roleOrTitle', event.target.value)}
                    autoComplete="organization-title"
                    placeholder="Recruiter, engineer, student..."
                  />
                </label>
              </div>

              {leadFormError && (
                <div className="assistant-exit-error">
                  <Mail size={16} />
                  <p>{leadFormError}</p>
                  {leadEmailSuggestion && (
                    <button
                      type="button"
                      onClick={() => {
                        updateLeadForm('email', leadEmailSuggestion);
                        setLeadEmailSuggestion('');
                      }}
                    >
                      Use {leadEmailSuggestion}
                    </button>
                  )}
                </div>
              )}

              <div className="assistant-exit-note">
                <CheckCircle2 size={16} />
                <p>Email format and common provider domains are checked before saving. Private company or university domains are checked for valid domain format.</p>
              </div>

              <div className="assistant-exit-actions">
                <button type="button" onClick={dismissExitPrompt} className="assistant-exit-secondary">
                  Continue without sharing
                </button>
                <button type="button" onClick={continueExitPromptInChat} className="assistant-exit-secondary">
                  Ask in chat
                </button>
                <button type="submit" className="assistant-exit-primary" disabled={leadFormSaving}>
                  {leadFormSaving ? 'Saving...' : 'Share details'}
                  <Send size={16} />
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}

        {open && (
          <motion.aside
            className={`assistant-panel fixed inset-x-2 bottom-2 z-[60] flex h-[min(760px,calc(100svh-1rem))] w-auto flex-col overflow-hidden rounded-[1.35rem] border border-white/15 bg-ink-950/94 shadow-glow backdrop-blur-2xl sm:inset-x-auto sm:bottom-6 sm:right-6 sm:h-[min(720px,calc(100vh-3rem))] sm:w-[440px] sm:rounded-3xl xl:w-[460px] ${inputFocused ? 'is-keyboard-active' : ''}`}
            ref={panelRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="assistant-title"
            initial={{ opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 22, scale: 0.96 }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
            aria-label={chatbotCopy.title}
          >
            <div className="assistant-header flex shrink-0 items-center justify-between border-b border-white/10 bg-white/[0.045] p-3 sm:p-4">
              <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                <div className="relative grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-electric-500/18 text-electric-300 sm:h-11 sm:w-11">
                  <Bot size={22} />
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-ink-950 bg-signal-green" />
                </div>
                <div className="min-w-0">
                  <h2 id="assistant-title" className="text-sm font-bold text-white">{chatbotCopy.title}</h2>
                  <p className="truncate text-[11px] text-slate-400 sm:text-xs">{chatbotCopy.status}</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button type="button" className="focus-outline rounded-xl p-2 text-slate-300 hover:bg-white/10 hover:text-white" onClick={resetChat} aria-label={chatbotCopy.reset} title={chatbotCopy.reset}>
                  <RotateCcw size={17} />
                </button>
                <button type="button" className="focus-outline rounded-xl p-2 text-slate-300 hover:bg-white/10 hover:text-white" onClick={closeChatbot} aria-label={chatbotCopy.close}>
                  <X size={18} />
                </button>
              </div>
            </div>

            <div ref={scrollRef} className="chat-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto p-3 sm:p-4">
              {messages.map((message, index) => (
                <motion.div
                  key={`${message.from}-${index}`}
                  className={`flex ${message.from === 'user' ? 'justify-end' : 'justify-start'}`}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                >
                  <div
                    className={getMessageBubbleClass(message)}
                  >
                    <p>{message.text}</p>
                    {message.suggestions?.length ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {message.suggestions.map((suggestion) => (
                          <button
                            key={suggestion}
                            type="button"
                            onClick={() => sendMessage(suggestion)}
                            className="assistant-suggestion rounded-full border border-electric-300/20 bg-electric-500/10 px-2.5 py-1 text-[11px] font-semibold text-electric-200 transition hover:border-electric-300/55 hover:bg-electric-500/20"
                            disabled={isTyping}
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    ) : null}
                    {message.actions?.length ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {message.actions.map((action) => (
                          <a
                            key={`${action.label}-${action.href}`}
                            href={action.href}
                            target={action.external ? '_blank' : undefined}
                            rel={action.external ? 'noreferrer' : undefined}
                            className="assistant-action-link inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/20"
                          >
                            {action.label}
                          </a>
                        ))}
                      </div>
                    ) : null}
                    {message.action && (
                      <a
                        href={message.action === 'resume' ? personal.resumeUrl : personal.social.email}
                        className="assistant-action-link mt-3 inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/20"
                      >
                        {message.action === 'resume' ? chatbotCopy.resumeAction : chatbotCopy.emailAction}
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <motion.div className="flex justify-start" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} aria-live="polite">
                  <div className="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/[0.065] px-4 py-3 shadow-card" aria-label={chatbotCopy.typing}>
                    <span className="sr-only">{chatbotCopy.typing}</span>
                    <span className="assistant-typing-dot h-2 w-2 rounded-full bg-electric-300" />
                    <span className="assistant-typing-dot h-2 w-2 rounded-full bg-electric-300" />
                    <span className="assistant-typing-dot h-2 w-2 rounded-full bg-electric-300" />
                  </div>
                </motion.div>
              )}
            </div>

            <div className="assistant-composer shrink-0 border-t border-white/10 bg-ink-950/70 p-3 backdrop-blur-xl sm:p-4">
              <div className="assistant-quick-prompts chat-scrollbar mb-3 flex gap-2 overflow-x-auto pb-1" aria-label={chatbotCopy.quickQuestions}>
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    className="assistant-quick-prompt shrink-0 rounded-full border border-white/10 bg-white/[0.045] px-3 py-2 text-left text-[11px] font-semibold text-slate-200 transition hover:border-electric-300/50 hover:bg-electric-500/10 disabled:cursor-not-allowed disabled:opacity-50 sm:px-3.5 sm:text-xs"
                    onClick={() => sendMessage(prompt)}
                    disabled={isTyping}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
              <form onSubmit={submit} className="assistant-form flex gap-2">
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onFocus={focusInput}
                  onBlur={blurInput}
                  disabled={isTyping}
                  className="assistant-input min-h-11 min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-electric-300 disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-12"
                  placeholder={chatbotCopy.placeholder}
                  enterKeyHint="send"
                />
                <button type="submit" disabled={isTyping} className="assistant-send-button grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-electric-500 text-white transition hover:bg-electric-400 disabled:cursor-not-allowed disabled:opacity-60 sm:h-12 sm:w-12" aria-label={chatbotCopy.send}>
                  <Send size={18} />
                </button>
              </form>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <button
        type="button"
        className="assistant-launch fixed bottom-20 right-4 z-[59] grid h-14 w-14 place-items-center rounded-full bg-electric-500 text-white shadow-glow transition hover:-translate-y-1 hover:bg-electric-400 sm:bottom-6 sm:right-6 sm:h-16 sm:w-16"
        onClick={() => setOpen((value) => !value)}
        aria-label={chatbotCopy.open}
      >
        <span className="absolute inset-0 rounded-full animate-pulse-glow" />
        {open ? <X size={24} /> : <Bot size={27} />}
      </button>
    </>
  );
}
