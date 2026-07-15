const SUPABASE_URL = 'https://ofltnlwdwyjnsapqprlw.supabase.co';
const SUPABASE_REST_URL = `${SUPABASE_URL}/rest/v1`;
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_LC3P3UNYF3lr-5MIP2pA6Q_T6m4Tjn6';
const CHATBOT_HISTORY_TABLE = 'portfolio_chatbot_history';
const CHATBOT_HISTORY_SESSION_KEY = 'portfolio-help-bot-history-session-v1';

function getHeaders(token = '') {
  return {
    apikey: SUPABASE_PUBLISHABLE_KEY,
    Authorization: `Bearer ${token || SUPABASE_PUBLISHABLE_KEY}`,
    'Content-Type': 'application/json',
  };
}

async function parseResponse(response) {
  if (response.ok) {
    if (response.status === 204) return null;
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  }

  let details = '';
  try {
    const body = await response.json();
    details = body?.message || body?.error_description || body?.error || '';
  } catch {
    details = await response.text().catch(() => '');
  }

  throw new Error(details || `Request failed with status ${response.status}.`);
}

const cleanText = (value = '', limit = 4000) => String(value || '').trim().slice(0, limit);

function createClientId() {
  if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  return `chat-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function getChatbotHistorySessionId() {
  if (typeof window === 'undefined') return createClientId();
  const existing = window.localStorage.getItem(CHATBOT_HISTORY_SESSION_KEY);
  if (existing) return existing;
  const next = createClientId();
  window.localStorage.setItem(CHATBOT_HISTORY_SESSION_KEY, next);
  return next;
}

export function clearChatbotHistorySessionId() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(CHATBOT_HISTORY_SESSION_KEY);
}

export async function recordChatbotMessage({
  sessionId,
  language = 'en',
  role = 'assistant',
  text = '',
  match = null,
  source = 'chatbot',
} = {}) {
  const message = cleanText(text);
  if (!message || typeof window === 'undefined') return null;

  const payload = {
    session_id: cleanText(sessionId || getChatbotHistorySessionId(), 140),
    role: role === 'user' ? 'user' : 'assistant',
    message,
    language: language === 'de' ? 'de' : 'en',
    intent_id: cleanText(match?.intentId, 160) || null,
    topic: cleanText(match?.topic, 120) || null,
    page_url: cleanText(window.location?.href, 700) || null,
    user_agent: cleanText(window.navigator?.userAgent, 700) || null,
    metadata: {
      source,
      score: Number.isFinite(match?.score) ? Math.round(match.score) : null,
      recordedAtClient: new Date().toISOString(),
    },
  };

  const response = await fetch(`${SUPABASE_REST_URL}/${CHATBOT_HISTORY_TABLE}`, {
    method: 'POST',
    headers: {
      ...getHeaders(),
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(payload),
  });
  await parseResponse(response);
  return null;
}

export async function fetchChatbotHistory(token, limit = 300) {
  const params = new URLSearchParams({
    select: 'id,session_id,role,message,language,intent_id,topic,page_url,user_agent,metadata,created_at',
    order: 'created_at.desc',
    limit: String(limit),
  });

  const response = await fetch(`${SUPABASE_REST_URL}/${CHATBOT_HISTORY_TABLE}?${params}`, {
    headers: getHeaders(token),
  });
  const data = await parseResponse(response);
  return Array.isArray(data) ? data : [];
}

export async function deleteChatbotSession(token, sessionId) {
  const response = await fetch(`${SUPABASE_REST_URL}/${CHATBOT_HISTORY_TABLE}?session_id=eq.${encodeURIComponent(sessionId)}`, {
    method: 'DELETE',
    headers: getHeaders(token),
  });
  return parseResponse(response);
}
