const SUPABASE_URL = 'https://ofltnlwdwyjnsapqprlw.supabase.co';
const SUPABASE_REST_URL = `${SUPABASE_URL}/rest/v1`;
const SUPABASE_AUTH_URL = `${SUPABASE_URL}/auth/v1`;
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_LC3P3UNYF3lr-5MIP2pA6Q_T6m4Tjn6';
const RECOMMENDATIONS_TABLE = 'portfolio_recommendations';
const ADMIN_SESSION_KEY = 'portfolio-recommendation-admin-session';
export const ADMIN_AUTO_SIGN_OUT_MS = 60000;
const APPROVED_RECOMMENDATION_COLUMNS = 'id,name,role,company,linkedin,quote,created_at,approved_at';
const APPROVED_RECOMMENDATION_COLUMNS_WITH_SOURCE = `id,source_key,name,role,company,linkedin,quote,created_at,approved_at`;
const ADMIN_RECOMMENDATION_COLUMNS = 'id,name,role,company,linkedin,quote,status,created_at,approved_at,rejected_at';
const ADMIN_RECOMMENDATION_COLUMNS_WITH_SOURCE = `id,source_key,name,role,company,linkedin,quote,status,created_at,approved_at,rejected_at`;
const SAIF_REFERENCE = {
  source_key: 'saif-abdullah-keba-reference',
  name: 'Saif Abdullah',
  role: 'Robotic Software Engineer',
  company: 'KEBA AG',
  linkedin: null,
  quote: 'It is a pleasure having Sooraj in our department for his Master’s work. Even in the early stages of his thesis, he has proven to be a highly motivated and collaborative team member. He bridges the gap between robotics theory and practical coding exceptionally well. His proactive approach to problem-solving and his dedication to high-quality work make him a great asset to our current project.',
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

const isMissingSourceKeyColumn = (error) => /\bsource_key\b.*\bdoes not exist\b/i.test(String(error?.message || error || ''));

async function fetchRecommendationsWithFallback({ token = '', select, fallbackSelect, filters = {} }) {
  const buildParams = (columns) => new URLSearchParams({
    select: columns,
    ...filters,
  });

  try {
    const response = await fetch(`${SUPABASE_REST_URL}/${RECOMMENDATIONS_TABLE}?${buildParams(select)}`, {
      headers: getHeaders(token),
    });
    return await parseResponse(response);
  } catch (error) {
    if (!fallbackSelect || !isMissingSourceKeyColumn(error)) throw error;
    const response = await fetch(`${SUPABASE_REST_URL}/${RECOMMENDATIONS_TABLE}?${buildParams(fallbackSelect)}`, {
      headers: getHeaders(token),
    });
    return parseResponse(response);
  }
}

export function getStoredAdminSession() {
  if (typeof window !== 'undefined') {
    window.sessionStorage.removeItem(ADMIN_SESSION_KEY);
  }
  return null;
}

export function clearStoredAdminSession() {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(ADMIN_SESSION_KEY);
}

export async function signInRecommendationAdmin(email, password) {
  const response = await fetch(`${SUPABASE_AUTH_URL}/token?grant_type=password`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      email,
      password,
    }),
  });
  const data = await parseResponse(response);
  const signedInEmail = String(data?.user?.email || '').toLowerCase();

  if (!data?.access_token || !signedInEmail) {
    throw new Error('Admin sign-in did not return a valid session.');
  }

  const session = {
    accessToken: data.access_token,
    refreshToken: '',
    email: signedInEmail,
    expiresAt: data.expires_at || 0,
  };
  return session;
}

export async function fetchApprovedRecommendations() {
  return fetchRecommendationsWithFallback({
    select: APPROVED_RECOMMENDATION_COLUMNS_WITH_SOURCE,
    fallbackSelect: APPROVED_RECOMMENDATION_COLUMNS,
    filters: {
      status: 'eq.approved',
      order: 'approved_at.desc.nullslast,created_at.desc',
    },
  });
}

export async function submitRecommendationDraft(recommendation) {
  const response = await fetch(`${SUPABASE_REST_URL}/${RECOMMENDATIONS_TABLE}`, {
    method: 'POST',
    headers: {
      ...getHeaders(),
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      name: recommendation.name,
      role: recommendation.role,
      company: recommendation.company,
      linkedin: recommendation.linkedin || null,
      quote: recommendation.quote,
      status: 'pending',
    }),
  });
  await parseResponse(response);
  return recommendation;
}

export async function fetchAdminRecommendations(token) {
  return fetchRecommendationsWithFallback({
    token,
    select: ADMIN_RECOMMENDATION_COLUMNS_WITH_SOURCE,
    fallbackSelect: ADMIN_RECOMMENDATION_COLUMNS,
    filters: {
      order: 'created_at.desc',
    },
  });
}

export async function updateRecommendationStatus(token, id, status) {
  const timestamp = new Date().toISOString();
  const body = {
    status,
    approved_at: status === 'approved' ? timestamp : null,
    rejected_at: status === 'rejected' ? timestamp : null,
  };

  const patchRecommendation = async (select) => {
    const params = new URLSearchParams({
      id: `eq.${id}`,
      select,
    });
    const response = await fetch(`${SUPABASE_REST_URL}/${RECOMMENDATIONS_TABLE}?${params}`, {
      method: 'PATCH',
      headers: {
        ...getHeaders(token),
        Prefer: 'return=representation',
      },
      body: JSON.stringify(body),
    });
    const data = await parseResponse(response);
    return Array.isArray(data) ? data[0] : data;
  };

  try {
    const updated = await patchRecommendation(ADMIN_RECOMMENDATION_COLUMNS_WITH_SOURCE);
    if (!updated?.id) throw new Error('Recommendation status was not updated.');
    return updated;
  } catch (error) {
    if (!isMissingSourceKeyColumn(error)) throw error;
  }

  const updated = await patchRecommendation(ADMIN_RECOMMENDATION_COLUMNS);
  if (!updated?.id) throw new Error('Recommendation status was not updated.');
  return updated;
}

export async function updateRecommendationStatusMinimal(token, id, status) {
  const timestamp = new Date().toISOString();
  const response = await fetch(`${SUPABASE_REST_URL}/${RECOMMENDATIONS_TABLE}?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: {
      ...getHeaders(token),
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      status,
      approved_at: status === 'approved' ? timestamp : null,
      rejected_at: status === 'rejected' ? timestamp : null,
    }),
  });
  await parseResponse(response);
  return null;
}

async function postSaifReference(token, payload) {
  const response = await fetch(`${SUPABASE_REST_URL}/${RECOMMENDATIONS_TABLE}`, {
    method: 'POST',
    headers: {
      ...getHeaders(token),
      Prefer: 'return=representation',
    },
    body: JSON.stringify(payload),
  });
  const data = await parseResponse(response);
  return Array.isArray(data) ? data[0] : data;
}

export async function addSaifRecommendation(token) {
  const timestamp = new Date().toISOString();

  try {
    return await postSaifReference(token, {
      ...SAIF_REFERENCE,
      status: 'approved',
      approved_at: timestamp,
      rejected_at: null,
    });
  } catch (error) {
    const canUsePendingFallback = isMissingSourceKeyColumn(error)
      || /row-level security|violates row-level security|policy/i.test(String(error?.message || error || ''));
    if (!canUsePendingFallback) throw error;

    const inserted = await postSaifReference(token, {
      name: SAIF_REFERENCE.name,
      role: SAIF_REFERENCE.role,
      company: SAIF_REFERENCE.company,
      linkedin: SAIF_REFERENCE.linkedin,
      quote: SAIF_REFERENCE.quote,
      status: 'pending',
    });

    if (inserted?.id) {
      await updateRecommendationStatus(token, inserted.id, 'approved');
    }

    return inserted;
  }
}

export async function deleteRecommendation(token, id) {
  const response = await fetch(`${SUPABASE_REST_URL}/${RECOMMENDATIONS_TABLE}?id=eq.${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: getHeaders(token),
  });
  return parseResponse(response);
}
