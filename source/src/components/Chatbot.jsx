import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bot, RotateCcw, Send, X } from 'lucide-react';
import { useSitePreferences } from '../context/SitePreferencesContext.jsx';
import useDialogA11y from '../hooks/useDialogA11y.js';
import {
  buildInitialHelpBotMessage,
  findHelpBotAnswer,
  getHelpBotQuickPrompts,
} from '../data/helpBotKnowledge.js';

const CHATBOT_SESSION_KEY = 'portfolio-help-bot-session-v12';
const MIN_TYPING_DELAY_MS = 700;
const MAX_TYPING_DELAY_MS = 3200;
const TYPING_DELAY_BASE_MS = 420;
const TYPING_DELAY_PER_CHAR_MS = 13;

const normalizeInput = (value = '') => String(value || '')
  .toLowerCase()
  .replace(/[^a-z0-9äöüß\s]+/gi, ' ')
  .replace(/\s+/g, ' ')
  .trim();

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
  const [messages, setMessages] = useState(() => loadStoredSession(language) || createInitialMessages(language));
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [pendingLanguageSwitch, setPendingLanguageSwitch] = useState('');
  const [pendingSpellingConfirmation, setPendingSpellingConfirmation] = useState(null);
  const scrollRef = useRef(null);
  const typingTimer = useRef(null);
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
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open, isTyping]);

  useEffect(() => () => window.clearTimeout(typingTimer.current), []);

  const resetChat = () => {
    window.clearTimeout(typingTimer.current);
    responseIdRef.current += 1;
    clearStoredSession();
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
        setIsTyping(false);
      });
  };

  const sendMessage = (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setMessages((current) => [...current, { from: 'user', text: trimmed }]);
    setInput('');

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
      (message) => setPendingSpellingConfirmation(message.confirmation || null),
    );
  };

  const submit = (event) => {
    event.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.aside
            className="assistant-panel fixed inset-x-2 bottom-2 z-[60] flex h-[min(760px,calc(100svh-1rem))] w-auto flex-col overflow-hidden rounded-[1.35rem] border border-white/15 bg-ink-950/94 shadow-glow backdrop-blur-2xl sm:inset-x-auto sm:bottom-6 sm:right-6 sm:h-[min(720px,calc(100vh-3rem))] sm:w-[440px] sm:rounded-3xl xl:w-[460px]"
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
                <button type="button" className="focus-outline rounded-xl p-2 text-slate-300 hover:bg-white/10 hover:text-white" onClick={() => setOpen(false)} aria-label={chatbotCopy.close}>
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
              <div className="chat-scrollbar mb-3 flex gap-2 overflow-x-auto pb-1" aria-label={chatbotCopy.quickQuestions}>
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
              <form onSubmit={submit} className="flex gap-2">
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  disabled={isTyping}
                  className="assistant-input min-h-11 min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-electric-300 disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-12"
                  placeholder={chatbotCopy.placeholder}
                />
                <button type="submit" disabled={isTyping} className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-electric-500 text-white transition hover:bg-electric-400 disabled:cursor-not-allowed disabled:opacity-60 sm:h-12 sm:w-12" aria-label={chatbotCopy.send}>
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
