const SUPABASE_URL = 'https://ofltnlwdwyjnsapqprlw.supabase.co';
const SUPABASE_REST_URL = `${SUPABASE_URL}/rest/v1`;
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_LC3P3UNYF3lr-5MIP2pA6Q_T6m4Tjn6';
const SITE_STATE_TABLE = 'portfolio_site_state';
export const REDESIGN_ADMIN_STATE_ID = 'redesign_admin_state';
export const PUBLIC_SITE_UPDATE_STATE_ID = 'public_site_update';

export const sectionKeys = [
  'about',
  'stats',
  'projects',
  'skills',
  'experience',
  'education',
  'recommendations',
  'contact',
  'chatbot',
];

export const defaultPortfolioAdminState = {
  version: 1,
  defaults: {
    theme: 'dark',
    language: 'en',
  },
  sectionVisibility: {
    about: true,
    stats: true,
    projects: true,
    skills: true,
    experience: true,
    education: true,
    recommendations: true,
    contact: true,
    chatbot: true,
  },
  personalOverrides: {},
  additions: {
    projects: [],
    experiences: [],
    education: [],
    certificates: [],
  },
  websiteUpdatedAt: '',
  emailNotifications: {
    enabled: true,
    to: 'soorajsudhakaran1199@gmail.com',
    provider: 'supabase-edge-function',
  },
};

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

const cleanString = (value = '') => String(value || '').trim();

function normalizeList(items) {
  return Array.isArray(items)
    ? items
      .filter((item) => item && typeof item === 'object')
      .map((item) => ({
        ...item,
        id: cleanString(item.id) || `admin-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      }))
    : [];
}

export function mergePortfolioAdminState(state = {}) {
  const defaults = state?.defaults && typeof state.defaults === 'object' ? state.defaults : {};
  const visibility = state?.sectionVisibility && typeof state.sectionVisibility === 'object'
    ? state.sectionVisibility
    : {};
  const additions = state?.additions && typeof state.additions === 'object' ? state.additions : {};

  return {
    ...defaultPortfolioAdminState,
    ...state,
    defaults: {
      ...defaultPortfolioAdminState.defaults,
      ...defaults,
      theme: defaults.theme === 'light' ? 'light' : 'dark',
      language: defaults.language === 'de' ? 'de' : 'en',
    },
    sectionVisibility: sectionKeys.reduce((next, key) => ({
      ...next,
      [key]: visibility[key] !== false,
    }), {}),
    personalOverrides: state?.personalOverrides && typeof state.personalOverrides === 'object'
      ? state.personalOverrides
      : {},
    additions: {
      projects: normalizeList(additions.projects),
      experiences: normalizeList(additions.experiences),
      education: normalizeList(additions.education),
      certificates: normalizeList(additions.certificates),
    },
    websiteUpdatedAt: cleanString(state?.websiteUpdatedAt),
    emailNotifications: {
      ...defaultPortfolioAdminState.emailNotifications,
      ...(state?.emailNotifications && typeof state.emailNotifications === 'object' ? state.emailNotifications : {}),
      enabled: state?.emailNotifications?.enabled !== false,
      to: cleanString(state?.emailNotifications?.to) || defaultPortfolioAdminState.emailNotifications.to,
    },
  };
}

export async function fetchPortfolioAdminState(token = '') {
  const params = new URLSearchParams({
    id: `eq.${REDESIGN_ADMIN_STATE_ID}`,
    select: 'id,updated_at,settings',
    limit: '1',
  });

  const response = await fetch(`${SUPABASE_REST_URL}/${SITE_STATE_TABLE}?${params}`, {
    headers: getHeaders(token),
  });
  const data = await parseResponse(response);
  const record = Array.isArray(data) ? data[0] : data;
  return mergePortfolioAdminState({
    ...(record?.settings || {}),
    websiteUpdatedAt: record?.settings?.websiteUpdatedAt || record?.updated_at || '',
  });
}

export async function fetchPublicPortfolioAdminState() {
  try {
    return await fetchPortfolioAdminState();
  } catch {
    return defaultPortfolioAdminState;
  }
}

export async function savePortfolioAdminState(token, state) {
  const nextState = mergePortfolioAdminState(state);
  const response = await fetch(`${SUPABASE_REST_URL}/${SITE_STATE_TABLE}?on_conflict=id`, {
    method: 'POST',
    headers: {
      ...getHeaders(token),
      Prefer: 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify({
      id: REDESIGN_ADMIN_STATE_ID,
      updated_at: nextState.websiteUpdatedAt || new Date().toISOString(),
      settings: nextState,
    }),
  });
  const data = await parseResponse(response);
  const record = Array.isArray(data) ? data[0] : data;
  return mergePortfolioAdminState(record?.settings || nextState);
}

export async function resetWebsiteUpdatedAt(token, state) {
  const timestamp = new Date().toISOString();
  const nextState = mergePortfolioAdminState({
    ...state,
    websiteUpdatedAt: timestamp,
  });

  await savePortfolioAdminState(token, nextState);

  await fetch(`${SUPABASE_REST_URL}/${SITE_STATE_TABLE}?on_conflict=id`, {
    method: 'POST',
    headers: {
      ...getHeaders(token),
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify({
      id: PUBLIC_SITE_UPDATE_STATE_ID,
      updated_at: timestamp,
      settings: {},
    }),
  }).then(parseResponse);

  return nextState;
}

export async function notifyRecommendationSubmission(recommendation, notificationSettings = {}) {
  if (notificationSettings.enabled === false) return null;

  const response = await fetch(`${SUPABASE_URL}/functions/v1/recommendation-notify`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      to: notificationSettings.to || defaultPortfolioAdminState.emailNotifications.to,
      recommendation: {
        name: cleanString(recommendation.name),
        role: cleanString(recommendation.role),
        company: cleanString(recommendation.company),
        linkedin: cleanString(recommendation.linkedin),
        quote: cleanString(recommendation.quote),
      },
    }),
  });

  if (!response.ok) return null;
  return parseResponse(response);
}
