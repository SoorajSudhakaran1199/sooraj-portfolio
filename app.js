const STORAGE_THEME_KEY = "theme";
const STORAGE_LANGUAGE_KEY = "site-language";
const STORAGE_DETAIL_ORIGIN_PREFIX = "detail-origin:";
const STORAGE_RETURN_TARGET_KEY = "detail-return-target";
const STORAGE_FEEDBACK_STATS_KEY = "feedback-form-stats";
const STORAGE_PUBLIC_REVIEWS_KEY = "public-feedback-reviews";
const STORAGE_FEEDBACK_LAST_SUBMISSION_KEY = "feedback-last-submission";
const STORAGE_FEEDBACK_LAST_SUBMISSION_PERSISTED_KEY = "feedback-last-submission-persisted";
const STORAGE_HOMEPAGE_REVIEW_PROMPT_KEY = "homepage-review-prompt-state";
const STORAGE_PUBLIC_SITE_DEFAULTS_KEY = "public-site-defaults";
const STORAGE_HELP_BOT_STATE_KEY = "portfolio-help-bot-state";
const REVIEW_PROMPT_ELIGIBLE_PAGES = new Set(["index.html", "portfolio-map.html", "journey.html"]);
const SUPABASE_SUBMISSION_EVENTS_TABLE = "portfolio_submission_events";
const SUPABASE_PUBLIC_REVIEWS_TABLE = "portfolio_public_reviews";
const SUPABASE_SITE_STATE_TABLE = "portfolio_site_state";
const SUPABASE_HELP_BOT_SESSIONS_TABLE = "portfolio_help_bot_sessions";
const SUPABASE_SITE_UPDATE_STATE_ID = "public_site_update";
const SUPABASE_REVIEW_PROMPT_STATE_ID = "public_review_prompt";
const SUPABASE_SITE_DEFAULTS_STATE_ID = "public_site_defaults";
const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";
const WEB3FORMS_ACCESS_KEY = "d419d102-cb71-4958-b6e7-06fb6001803b";
const GOOGLE_ANALYTICS_ID = "G-00H12CYMW0";
const CLARITY_PROJECT_ID = "vz7zebyj7z";
const REQUEST_CV_PAGE = "request-cv.html";
const SUPABASE_URL = "https://ofltnlwdwyjnsapqprlw.supabase.co";
const SUPABASE_REST_URL = `${SUPABASE_URL}/rest/v1`;
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_LC3P3UNYF3lr-5MIP2pA6Q_T6m4Tjn6";
const SUPABASE_ADMIN_EMAIL = "soorajsudhakaran4@gmail.com";
const SUPABASE_SCRIPT_URL = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
const DAY_IN_MS = 24 * 60 * 60 * 1000;
const HOMEPAGE_REVIEW_PROMPT_DELAY_MS = 15000;
const HOMEPAGE_REVIEW_PROMPT_SCROLL_RATIO = 0.35;
const HOMEPAGE_REVIEW_PROMPT_COOLDOWN_MS = DAY_IN_MS;
const HOMEPAGE_REVIEW_PROMPT_SUBMISSION_SUPPRESS_MS = 30 * DAY_IN_MS;
const DEFAULT_REVIEW_PROMPT_SETTINGS = Object.freeze({
  enabled: true,
  showEveryVisit: false,
  delaySeconds: HOMEPAGE_REVIEW_PROMPT_DELAY_MS / 1000,
  scrollPercent: HOMEPAGE_REVIEW_PROMPT_SCROLL_RATIO * 100,
  cooldownDays: HOMEPAGE_REVIEW_PROMPT_COOLDOWN_MS / DAY_IN_MS,
  suppressAfterSubmissionDays: HOMEPAGE_REVIEW_PROMPT_SUBMISSION_SUPPRESS_MS / DAY_IN_MS,
  triggerOnFinalSection: true,
  eligiblePages: {
    index: true,
    portfolioMap: true,
    journey: true
  }
});
const DEFAULT_PUBLIC_SITE_DEFAULTS = Object.freeze({
  theme: "dark",
  language: "en"
});
let supabaseClientPromise = null;
let supabaseClient = null;
let adminSessionActive = false;
let sharedSubmissionStatsCache = null;
let sharedSubmissionStatsPromise = null;
let sharedPublicReviewsCache = null;
let sharedPublicReviewsPromise = null;
let sharedReviewPromptSettingsCache = null;
let sharedReviewPromptSettingsPromise = null;
let sharedPublicSiteDefaultsCache = null;
let sharedPublicSiteDefaultsPromise = null;
let sharedSubmissionStatsSource = "unknown";
let sharedPublicReviewsSource = "unknown";
const REQUEST_CV_LINKS = {
  en: REQUEST_CV_PAGE,
  de: REQUEST_CV_PAGE
};
const FEEDBACK_MAIL_TEMPLATES = {
  en: {
    subjects: {
      feedback: "Feedback on your portfolio website",
      contact: "Contact request from your portfolio website"
    },
    greeting: "Hello Sooraj Sudhakaran,",
    intros: {
      feedback: "I would like to share feedback about your website.",
      contact: "I would like to contact you regarding your portfolio and profile."
    },
    closing: "Best regards,",
    labels: {
      messageType: "Message type",
      firstName: "First name",
      lastName: "Last name",
      name: "Full name",
      email: "Email",
      country: "Country",
      phone: "Phone number",
      company: "Company or organization",
      role: "Role or title",
      referenceLink: "LinkedIn or website",
      section: "Page or section",
      rating: "Rating",
      category: "Category",
      subjectLine: "Subject",
      responsePreference: "Preferred response",
      timeline: "Timeline",
      reviewVisibility: "Review visibility",
      comments: "Comments",
      suggestion: "Suggested improvement"
    }
  },
  de: {
    subjects: {
      feedback: "Feedback zu Ihrer Portfolio-Website",
      contact: "Kontaktanfrage ueber Ihre Portfolio-Website"
    },
    greeting: "Hallo Sooraj Sudhakaran,",
    intros: {
      feedback: "ich moechte Ihnen Feedback zu Ihrer Website senden.",
      contact: "ich moechte Sie bezueglich Ihres Portfolios und Profils kontaktieren."
    },
    closing: "Mit freundlichen Grüßen",
    labels: {
      messageType: "Nachrichtentyp",
      firstName: "Vorname",
      lastName: "Nachname",
      name: "Vollstaendiger Name",
      email: "E-Mail",
      country: "Land",
      phone: "Telefonnummer",
      company: "Unternehmen oder Organisation",
      role: "Rolle oder Titel",
      referenceLink: "LinkedIn oder Website",
      section: "Seite oder Bereich",
      rating: "Bewertung",
      category: "Kategorie",
      subjectLine: "Betreff",
      responsePreference: "Bevorzugte Rueckmeldung",
      timeline: "Zeitrahmen",
      reviewVisibility: "Sichtbarkeit der Bewertung",
      comments: "Kommentar",
      suggestion: "Vorgeschlagene Verbesserung"
    }
  }
};

const COUNTRY_OPTIONS = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Antigua and Barbuda",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahamas",
  "Bahrain",
  "Bangladesh",
  "Barbados",
  "Belarus",
  "Belgium",
  "Belize",
  "Benin",
  "Bhutan",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Botswana",
  "Brazil",
  "Brunei",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Cabo Verde",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Central African Republic",
  "Chad",
  "Chile",
  "China",
  "Colombia",
  "Comoros",
  "Congo",
  "Costa Rica",
  "Cote d'Ivoire",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czech Republic",
  "Democratic Republic of the Congo",
  "Denmark",
  "Djibouti",
  "Dominica",
  "Dominican Republic",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Equatorial Guinea",
  "Eritrea",
  "Estonia",
  "Eswatini",
  "Ethiopia",
  "Fiji",
  "Finland",
  "France",
  "Gabon",
  "Gambia",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Grenada",
  "Guatemala",
  "Guinea",
  "Guinea-Bissau",
  "Guyana",
  "Haiti",
  "Honduras",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kiribati",
  "Kosovo",
  "Kuwait",
  "Kyrgyzstan",
  "Laos",
  "Latvia",
  "Lebanon",
  "Lesotho",
  "Liberia",
  "Libya",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Madagascar",
  "Malawi",
  "Malaysia",
  "Maldives",
  "Mali",
  "Malta",
  "Marshall Islands",
  "Mauritania",
  "Mauritius",
  "Mexico",
  "Micronesia",
  "Moldova",
  "Monaco",
  "Mongolia",
  "Montenegro",
  "Morocco",
  "Mozambique",
  "Myanmar",
  "Namibia",
  "Nauru",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Nicaragua",
  "Niger",
  "Nigeria",
  "North Korea",
  "North Macedonia",
  "Norway",
  "Oman",
  "Pakistan",
  "Palau",
  "Palestine",
  "Panama",
  "Papua New Guinea",
  "Paraguay",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Russia",
  "Rwanda",
  "Saint Kitts and Nevis",
  "Saint Lucia",
  "Saint Vincent and the Grenadines",
  "Samoa",
  "San Marino",
  "Sao Tome and Principe",
  "Saudi Arabia",
  "Senegal",
  "Serbia",
  "Seychelles",
  "Sierra Leone",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "Solomon Islands",
  "Somalia",
  "South Africa",
  "South Korea",
  "South Sudan",
  "Spain",
  "Sri Lanka",
  "Sudan",
  "Suriname",
  "Sweden",
  "Switzerland",
  "Syria",
  "Taiwan",
  "Tajikistan",
  "Tanzania",
  "Thailand",
  "Timor-Leste",
  "Togo",
  "Tonga",
  "Trinidad and Tobago",
  "Tunisia",
  "Turkey",
  "Turkmenistan",
  "Tuvalu",
  "Uganda",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Uruguay",
  "Uzbekistan",
  "Vanuatu",
  "Vatican City",
  "Venezuela",
  "Vietnam",
  "Yemen",
  "Zambia",
  "Zimbabwe"
];

let countryCodeLookupCache = null;

function normalizeCountryLookupKey(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "and")
    .replace(/[().']/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function getCountryCodeLookup() {
  if (countryCodeLookupCache) return countryCodeLookupCache;

  const lookup = new Map();

  try {
    if (typeof Intl !== "undefined" && typeof Intl.DisplayNames === "function" && typeof Intl.supportedValuesOf === "function") {
      const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
      Intl.supportedValuesOf("region").forEach((code) => {
        const label = regionNames.of(code);
        if (label && label !== code) {
          lookup.set(normalizeCountryLookupKey(label), code);
        }
      });
    }
  } catch {
    // Some engines throw for Intl.supportedValuesOf("region").
    // Fall back to the explicit aliases below instead of breaking the review UI.
  }

  const aliases = {
    argentina: "AR",
    australia: "AU",
    austria: "AT",
    bangladesh: "BD",
    belgium: "BE",
    bolivia: "BO",
    brazil: "BR",
    brunei: "BN",
    canada: "CA",
    "cabo verde": "CV",
    china: "CN",
    congo: "CG",
    "cote divoire": "CI",
    "czech republic": "CZ",
    denmark: "DK",
    "democratic republic of the congo": "CD",
    egypt: "EG",
    eswatini: "SZ",
    finland: "FI",
    france: "FR",
    germany: "DE",
    ghana: "GH",
    greece: "GR",
    india: "IN",
    indonesia: "ID",
    iran: "IR",
    iraq: "IQ",
    ireland: "IE",
    israel: "IL",
    italy: "IT",
    japan: "JP",
    kosovo: "XK",
    laos: "LA",
    malaysia: "MY",
    micronesia: "FM",
    moldova: "MD",
    netherlands: "NL",
    "new zealand": "NZ",
    myanmar: "MM",
    "north korea": "KP",
    norway: "NO",
    pakistan: "PK",
    palestine: "PS",
    philippines: "PH",
    poland: "PL",
    portugal: "PT",
    qatar: "QA",
    russia: "RU",
    "saudi arabia": "SA",
    singapore: "SG",
    "south africa": "ZA",
    "south korea": "KR",
    spain: "ES",
    "sri lanka": "LK",
    sweden: "SE",
    switzerland: "CH",
    syria: "SY",
    taiwan: "TW",
    tanzania: "TZ",
    thailand: "TH",
    turkey: "TR",
    ukraine: "UA",
    "united arab emirates": "AE",
    "united kingdom": "GB",
    "united states": "US",
    venezuela: "VE",
    vietnam: "VN"
  };

  Object.entries(aliases).forEach(([label, code]) => {
    lookup.set(label, code);
  });

  countryCodeLookupCache = lookup;
  return lookup;
}

function regionCodeToFlag(code) {
  const normalized = String(code || "").trim().toUpperCase();
  if (normalized === "XK") return "🇽🇰";
  if (!/^[A-Z]{2}$/.test(normalized)) return "🌐";
  return Array.from(normalized, (character) => String.fromCodePoint(127397 + character.charCodeAt(0))).join("");
}

function getCountryDisplayMeta(country, fallbackLabel = "Unknown") {
  const label = String(country || "").trim();
  if (!label) {
    return { label: fallbackLabel, flag: "🌐", isUnknown: true };
  }

  const regionCode = getCountryCodeLookup().get(normalizeCountryLookupKey(label)) || "";
  return {
    label,
    flag: regionCode ? regionCodeToFlag(regionCode) : "🌐",
    isUnknown: !regionCode
  };
}

function getEmptySubmissionStats() {
  return { total: 0, countries: {}, submissions: [] };
}

function getEmptyPublicReviews() {
  return [];
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };
    return entities[character] || character;
  });
}

function createClientUuid() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (character) => {
    const random = Math.random() * 16 | 0;
    const value = character === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

function populateCountrySelects(scope = document) {
  const selects = Array.from(scope.querySelectorAll("select[data-country-select]"));
  if (!selects.length) return;

  selects.forEach((select) => {
    const currentValue = String(select.value || select.dataset.selectedCountry || "").trim();
    const placeholder = select.getAttribute("data-country-placeholder") || "Select country";

    select.innerHTML = "";

    const placeholderOption = document.createElement("option");
    placeholderOption.value = "";
    placeholderOption.textContent = placeholder;
    if (select.required) {
      placeholderOption.disabled = true;
    }
    placeholderOption.selected = !currentValue;
    select.append(placeholderOption);

    COUNTRY_OPTIONS.forEach((country) => {
      const option = document.createElement("option");
      option.value = country;
      option.textContent = country;
      option.selected = country === currentValue;
      select.append(option);
    });
  });
}

function normalizeSubmissionEntry(entry) {
  if (!entry || typeof entry !== "object") return null;

  const ratingValue = Number(entry.rating_value);
  const ratingLabel = Number.isFinite(ratingValue) && ratingValue > 0
    ? `${ratingValue}/5`
    : String(entry.rating || "").trim();

  return {
    id: String(entry.id || `${Date.now()}`),
    type: entry.type || "feedback",
    country: String(entry.country || "").trim(),
    submittedAt: entry.created_at || entry.submittedAt || new Date().toISOString(),
    subject: String(entry.subject || "").trim(),
    rating: ratingLabel
  };
}

function normalizePublicReviewEntry(entry) {
  if (!entry || typeof entry !== "object") return null;

  const ratingValue = Number(
    entry.rating_value ??
    entry.ratingValue ??
    Number.parseInt(String(entry.rating || "").split("/")[0], 10)
  );
  const reviewerName = String(entry.reviewer_name || entry.reviewerName || "").trim();
  const reviewText = String(entry.review_text || entry.reviewText || "").trim();

  if (!reviewerName || !reviewText) return null;

  return {
    id: String(entry.id || ""),
    reviewerName,
    company: String(entry.company || "").trim(),
    country: String(entry.country || "").trim(),
    ratingValue: Number.isFinite(ratingValue) && ratingValue > 0 ? ratingValue : null,
    rating: Number.isFinite(ratingValue) && ratingValue > 0 ? `${ratingValue}/5` : "",
    reviewTitle: String(entry.review_title || entry.reviewTitle || "").trim(),
    reviewText,
    isPinned: Boolean(entry.is_pinned ?? entry.isPinned),
    adminReply: String(entry.admin_reply || entry.adminReply || "").trim(),
    adminReplyCreatedAt: entry.admin_reply_created_at || entry.adminReplyCreatedAt || "",
    submittedAt: entry.created_at || entry.submittedAt || new Date().toISOString()
  };
}

function normalizeHelpBotSessionTranscriptEntry(entry) {
  if (!entry || typeof entry !== "object") return null;
  const sender = entry.sender === "user" ? "user" : "bot";
  const text = String(entry.text || "").trim();
  if (!text) return null;
  return { sender, text };
}

function normalizeHelpBotSessionEntry(entry) {
  if (!entry || typeof entry !== "object") return null;
  const sessionId = String(entry.session_id || entry.sessionId || "").trim();
  if (!sessionId) return null;
  const transcript = Array.isArray(entry.transcript_json || entry.transcriptJson)
    ? (entry.transcript_json || entry.transcriptJson).map(normalizeHelpBotSessionTranscriptEntry).filter(Boolean)
    : [];
  return {
    sessionId,
    createdAt: entry.created_at || entry.createdAt || "",
    updatedAt: entry.updated_at || entry.updatedAt || "",
    endedAt: entry.ended_at || entry.endedAt || "",
    pagePath: String(entry.page_path || entry.pagePath || "").trim(),
    roleId: String(entry.role_id || entry.roleId || "").trim(),
    visitorName: String(entry.visitor_name || entry.visitorName || "").trim(),
    visitorPosition: String(entry.visitor_position || entry.visitorPosition || "").trim(),
    visitorOrganization: String(entry.visitor_organization || entry.visitorOrganization || "").trim(),
    studentUniversity: String(entry.student_university || entry.studentUniversity || "").trim(),
    messageCount: Math.max(0, Number.parseInt(String(entry.message_count || entry.messageCount || transcript.length || 0), 10) || 0),
    transcript
  };
}

function buildSubmissionStats(submissions = []) {
  const normalizedSubmissions = submissions
    .map(normalizeSubmissionEntry)
    .filter(Boolean)
    .sort((a, b) => new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime());

  const countries = {};
  normalizedSubmissions.forEach((entry) => {
    if (!entry.country) return;
    countries[entry.country] = (Number(countries[entry.country]) || 0) + 1;
  });

  return {
    total: normalizedSubmissions.length,
    countries,
    submissions: normalizedSubmissions
  };
}

function buildPublicReviews(reviews = []) {
  return reviews
    .map(normalizePublicReviewEntry)
    .filter(Boolean)
    .sort((a, b) => new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime());
}

function filterPublicReviews(publicReviews = [], filter = "all") {
  if (filter === "pinned") {
    return publicReviews.filter((review) => review?.isPinned);
  }

  if (filter === "unpinned") {
    return publicReviews.filter((review) => !review?.isPinned);
  }

  return publicReviews;
}

function loadStoredSubmissionStats() {
  try {
    const raw = localStorage.getItem(STORAGE_FEEDBACK_STATS_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (!parsed || typeof parsed !== "object") {
      return getEmptySubmissionStats();
    }

    return buildSubmissionStats(Array.isArray(parsed.submissions) ? parsed.submissions : []);
  } catch {
    return getEmptySubmissionStats();
  }
}

function saveStoredSubmissionStats(stats) {
  localStorage.setItem(STORAGE_FEEDBACK_STATS_KEY, JSON.stringify(stats));
}

function loadStoredPublicReviews() {
  try {
    const raw = localStorage.getItem(STORAGE_PUBLIC_REVIEWS_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return buildPublicReviews(Array.isArray(parsed) ? parsed : []);
  } catch {
    return getEmptyPublicReviews();
  }
}

function saveStoredPublicReviews(reviews) {
  localStorage.setItem(STORAGE_PUBLIC_REVIEWS_KEY, JSON.stringify(reviews));
}

async function fetchSupabaseRest(path, { method = "GET", body = null, authToken = SUPABASE_PUBLISHABLE_KEY, prefer = "" } = {}) {
  const headers = {
    apikey: SUPABASE_PUBLISHABLE_KEY,
    Authorization: `Bearer ${authToken}`,
    Accept: "application/json"
  };

  if (body !== null) {
    headers["Content-Type"] = "application/json";
  }

  if (prefer) {
    headers.Prefer = prefer;
  }

  const response = await fetch(`${SUPABASE_REST_URL}/${path}`, {
    method,
    headers,
    body: body === null ? undefined : JSON.stringify(body)
  });

  const raw = await response.text();
  const data = raw ? JSON.parse(raw) : null;

  if (!response.ok) {
    throw new Error(data?.message || data?.error || `Supabase REST request failed with ${response.status}`);
  }

  return data;
}

function parseSubmissionRatingValue(entry) {
  return Number.parseInt(String(entry?.rating || "").split("/")[0], 10);
}

function getSubmissionTypeLabel(type, lang) {
  if (type === "contact") {
    return lang === "de" ? "Kontaktanfrage" : "Contact request";
  }

  if (type === "cv") {
    return lang === "de" ? "CV-Anfrage" : "CV request";
  }

  return lang === "de" ? "Feedback" : "Feedback";
}

function recordStoredSubmissionStat(submission) {
  const stats = loadStoredSubmissionStats();
  stats.submissions.push(normalizeSubmissionEntry(submission));
  const nextStats = buildSubmissionStats(stats.submissions);
  saveStoredSubmissionStats(nextStats);
  return nextStats;
}

function recordStoredPublicReview(review) {
  const reviews = loadStoredPublicReviews();
  reviews.push(normalizePublicReviewEntry(review));
  const nextReviews = buildPublicReviews(reviews);
  saveStoredPublicReviews(nextReviews);
  return nextReviews;
}

function updateStoredPublicReview(id, updater) {
  const reviews = loadStoredPublicReviews();
  let didUpdate = false;
  const nextReviews = reviews.map((entry) => {
    if (entry.id !== id) return entry;
    didUpdate = true;
    return normalizePublicReviewEntry(updater(entry));
  }).filter(Boolean);

  if (!didUpdate) {
    return null;
  }

  const sortedReviews = buildPublicReviews(nextReviews);
  saveStoredPublicReviews(sortedReviews);
  return sortedReviews;
}

function clearStoredSubmissionStats() {
  saveStoredSubmissionStats(getEmptySubmissionStats());
}

function clearStoredPublicReviews() {
  saveStoredPublicReviews(getEmptyPublicReviews());
}

function deleteStoredSubmissionStat(id) {
  const stats = loadStoredSubmissionStats();
  const submissions = Array.isArray(stats.submissions) ? stats.submissions : [];
  const nextSubmissions = submissions.filter((entry) => entry.id !== id);
  if (nextSubmissions.length === submissions.length) {
    return false;
  }

  saveStoredSubmissionStats(buildSubmissionStats(nextSubmissions));
  return true;
}

function deleteStoredPublicReview(id) {
  const reviews = loadStoredPublicReviews();
  const nextReviews = reviews.filter((entry) => entry.id !== id);
  if (nextReviews.length === reviews.length) {
    return false;
  }

  saveStoredPublicReviews(buildPublicReviews(nextReviews));
  return true;
}

function setSharedSubmissionStatsCache(stats) {
  sharedSubmissionStatsCache = buildSubmissionStats(stats?.submissions || stats || []);
  return sharedSubmissionStatsCache;
}

function setSharedPublicReviewsCache(reviews) {
  sharedPublicReviewsCache = buildPublicReviews(reviews);
  return sharedPublicReviewsCache;
}

async function loadSharedSubmissionStats({ forceRefresh = false } = {}) {
  if (!forceRefresh && sharedSubmissionStatsCache) {
    return sharedSubmissionStatsCache;
  }

  if (!forceRefresh && sharedSubmissionStatsPromise) {
    return sharedSubmissionStatsPromise;
  }

  sharedSubmissionStatsPromise = (async () => {
    try {
      const data = await fetchSupabaseRest(
        `${SUPABASE_SUBMISSION_EVENTS_TABLE}?select=id,type,country,rating_value,created_at&order=created_at.desc`
      );
      sharedSubmissionStatsSource = "remote";
      return setSharedSubmissionStatsCache(buildSubmissionStats(data || []));
    } catch {
      sharedSubmissionStatsSource = "local";
      return loadStoredSubmissionStats();
    } finally {
      sharedSubmissionStatsPromise = null;
    }
  })();

  return sharedSubmissionStatsPromise;
}

async function loadSharedPublicReviews({ forceRefresh = false } = {}) {
  if (!forceRefresh && sharedPublicReviewsCache) {
    return sharedPublicReviewsCache;
  }

  if (!forceRefresh && sharedPublicReviewsPromise) {
    return sharedPublicReviewsPromise;
  }

  sharedPublicReviewsPromise = (async () => {
    try {
      let data;

      try {
        data = await fetchSupabaseRest(
          `${SUPABASE_PUBLIC_REVIEWS_TABLE}?select=id,reviewer_name,company,country,rating_value,review_title,review_text,is_pinned,admin_reply,admin_reply_created_at,created_at&order=created_at.desc`
        );
      } catch {
        data = await fetchSupabaseRest(
          `${SUPABASE_PUBLIC_REVIEWS_TABLE}?select=id,reviewer_name,company,country,rating_value,review_title,review_text,admin_reply,admin_reply_created_at,created_at&order=created_at.desc`
        );
      }

      sharedPublicReviewsSource = "remote";
      return setSharedPublicReviewsCache(data || []);
    } catch {
      sharedPublicReviewsSource = "unavailable";
      return setSharedPublicReviewsCache(getEmptyPublicReviews());
    } finally {
      sharedPublicReviewsPromise = null;
    }
  })();

  return sharedPublicReviewsPromise;
}

async function recordSharedSubmissionEvent(submission) {
  const localStats = recordStoredSubmissionStat(submission);

  try {
    const ratingValue = parseSubmissionRatingValue(submission);
    const payload = {
      id: submission?.id || createClientUuid(),
      type: submission?.type || "feedback",
      country: String(submission?.country || "").trim() || null,
      rating_value: Number.isFinite(ratingValue) && ratingValue > 0 ? ratingValue : null
    };
    await fetchSupabaseRest(SUPABASE_SUBMISSION_EVENTS_TABLE, {
      method: "POST",
      body: payload,
      prefer: "return=minimal"
    });
    sharedSubmissionStatsSource = "remote";
    return await loadSharedSubmissionStats({ forceRefresh: true });
  } catch {
    sharedSubmissionStatsSource = "local";
    return localStats;
  }
}

async function recordSharedPublicReview(review) {
  const normalizedReview = normalizePublicReviewEntry(review);
  if (!normalizedReview) {
    return loadSharedPublicReviews();
  }

  try {
    const payload = {
      id: normalizedReview.id,
      reviewer_name: normalizedReview.reviewerName,
      company: normalizedReview.company || null,
      country: normalizedReview.country || null,
      rating_value: normalizedReview.ratingValue,
      review_title: normalizedReview.reviewTitle || null,
      review_text: normalizedReview.reviewText
    };
    await fetchSupabaseRest(SUPABASE_PUBLIC_REVIEWS_TABLE, {
      method: "POST",
      body: payload,
      prefer: "return=minimal"
    });
    sharedPublicReviewsSource = "remote";
    return await loadSharedPublicReviews({ forceRefresh: true });
  } catch {
    sharedPublicReviewsSource = "unavailable";
    throw new Error("Public review could not be saved to the shared website store.");
  }
}

async function updateSharedPublicReviewAdminState(id, { replyText, isPinned } = {}) {
  const payload = {};

  if (typeof replyText === "string") {
    const trimmedReply = String(replyText || "").trim();
    payload.admin_reply = trimmedReply || null;
    payload.admin_reply_created_at = trimmedReply ? new Date().toISOString() : null;
  }

  if (typeof isPinned === "boolean") {
    payload.is_pinned = isPinned;
  }

  if (!Object.keys(payload).length) {
    return loadSharedPublicReviews();
  }

  try {
    const supabase = await getSupabaseClient();
    const { error } = await supabase
      .from(SUPABASE_PUBLIC_REVIEWS_TABLE)
      .update(payload)
      .eq("id", id);

    if (error) throw error;
    sharedPublicReviewsSource = "remote";
    return await loadSharedPublicReviews({ forceRefresh: true });
  } catch {
    sharedPublicReviewsSource = "unavailable";
    throw new Error("Public review reply could not be saved to the shared website store.");
  }
}

async function saveSharedPublicReviewReply(id, replyText) {
  return updateSharedPublicReviewAdminState(id, { replyText });
}

async function setSharedPublicReviewPinned(id, isPinned) {
  return updateSharedPublicReviewAdminState(id, { isPinned });
}

async function clearSharedSubmissionEvents() {
  clearStoredSubmissionStats();
  clearStoredPublicReviews();

  try {
    const supabase = await getSupabaseClient();
    const [{ error: submissionError }, { error: publicReviewError }] = await Promise.all([
      supabase
        .from(SUPABASE_SUBMISSION_EVENTS_TABLE)
        .delete()
        .not("id", "is", null),
      supabase
        .from(SUPABASE_PUBLIC_REVIEWS_TABLE)
        .delete()
        .not("id", "is", null)
    ]);
    if (submissionError) throw submissionError;
    if (publicReviewError) throw publicReviewError;
    sharedSubmissionStatsSource = "remote";
    sharedPublicReviewsSource = "remote";
    setSharedPublicReviewsCache(getEmptyPublicReviews());
    return setSharedSubmissionStatsCache(getEmptySubmissionStats());
  } catch {
    sharedSubmissionStatsSource = "local";
    sharedPublicReviewsSource = "unavailable";
    return getEmptySubmissionStats();
  }
}

async function deleteSharedSubmissionEvent(id) {
  const localDeleted = deleteStoredSubmissionStat(id);
  deleteStoredPublicReview(id);

  try {
    const supabase = await getSupabaseClient();
    const [{ error: submissionError }, { error: publicReviewError }] = await Promise.all([
      supabase
        .from(SUPABASE_SUBMISSION_EVENTS_TABLE)
        .delete()
        .eq("id", id),
      supabase
        .from(SUPABASE_PUBLIC_REVIEWS_TABLE)
        .delete()
        .eq("id", id)
    ]);
    if (submissionError) throw submissionError;
    if (publicReviewError) throw publicReviewError;
    sharedSubmissionStatsSource = "remote";
    sharedPublicReviewsSource = "remote";
    await loadSharedPublicReviews({ forceRefresh: true });
    return await loadSharedSubmissionStats({ forceRefresh: true });
  } catch {
    sharedSubmissionStatsSource = "local";
    sharedPublicReviewsSource = "unavailable";
    return localDeleted ? loadStoredSubmissionStats() : null;
  }
}

async function renderSubmissionSummary({ scope = document, lang = resolveInitialLanguage(), isAdminMode = getAdminModeState(), forceRefresh = false } = {}) {
  const statsTotal = scope.querySelector("[data-feedback-stats-total]");
  const statsCvTotal = scope.querySelector("[data-feedback-stats-cv-total]");
  const statsCountries = scope.querySelector("[data-feedback-stats-countries]");
  const statsAdmin = scope.querySelector("[data-feedback-stats-admin]");
  const statsAdminNote = scope.querySelector("[data-feedback-stats-admin-note]");
  const statsLog = scope.querySelector("[data-feedback-stats-log]");
  const statsLogList = scope.querySelector("[data-feedback-stats-log-list]");

  if (!statsTotal && !statsCvTotal && !statsCountries && !statsLogList) {
    return null;
  }

  const stats = await loadSharedSubmissionStats({ forceRefresh });
  const emptyText = lang === "de" ? "Noch keine Eintraege gespeichert." : "No submissions recorded yet.";
  const emptyLogText = lang === "de" ? "Keine Uebermittlungen verfuegbar." : "No submissions available.";
  const feedbackEntries = Array.isArray(stats.submissions)
    ? stats.submissions.filter((entry) => entry?.type === "feedback")
    : [];
  const cvEntries = Array.isArray(stats.submissions)
    ? stats.submissions.filter((entry) => entry?.type === "cv")
    : [];
  const countryEntries = Object.entries(stats.countries || {}).sort((a, b) => Number(b[1]) - Number(a[1]));
  const submissionEntries = Array.isArray(stats.submissions) ? [...stats.submissions] : [];

  if (statsAdmin) {
    statsAdmin.hidden = !isAdminMode;
  }
  if (statsLog) {
    statsLog.hidden = !isAdminMode;
  }
  if (statsAdminNote) {
    statsAdminNote.textContent = lang === "de" ? "Private Admin-Steuerung" : "Private admin control";
  }

  if (statsTotal) {
    statsTotal.textContent = String(stats.total || 0);
  }
  if (statsCvTotal) {
    statsCvTotal.textContent = String(cvEntries.length);
  }

  if (statsCountries) {
    statsCountries.innerHTML = "";
    if (!countryEntries.length) {
      const empty = document.createElement("span");
      empty.className = "feedback-stats-empty";
      empty.textContent = emptyText;
      statsCountries.append(empty);
    } else {
      countryEntries.forEach(([country, count]) => {
        const row = document.createElement("div");
        row.className = "feedback-stats-country-item";
        row.innerHTML = `<span class="feedback-stats-country-name">${country}</span><strong class="feedback-stats-country-count">${count}</strong>`;
        statsCountries.append(row);
      });
    }
  }

  if (statsLogList) {
    statsLogList.innerHTML = "";
    if (!submissionEntries.length) {
      const empty = document.createElement("span");
      empty.className = "feedback-stats-empty";
      empty.textContent = emptyLogText;
      statsLogList.append(empty);
    } else {
      submissionEntries
        .sort((a, b) => new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime())
        .forEach((entry) => {
          const item = document.createElement("div");
          item.className = "feedback-stats-log-item";
          const typeLabel = getSubmissionTypeLabel(entry.type, lang);
          const timeLabel = entry.submittedAt
            ? formatUpdatedTimestamp(new Date(entry.submittedAt), lang)
            : "";

          item.innerHTML = `
            <div class="feedback-stats-log-copy">
              <strong>${typeLabel}</strong>
              <small>${entry.country || "-"}${timeLabel ? ` • ${timeLabel}` : ""}</small>
            </div>
            <button class="btn btn-secondary btn-small" type="button" data-feedback-stats-delete="${entry.id}">${lang === "de" ? "Loeschen" : "Delete"}</button>
          `;
          statsLogList.append(item);
        });
    }
  }

  return {
    stats,
    feedbackEntries,
    cvEntries,
    ratings: feedbackEntries
      .map(parseSubmissionRatingValue)
      .filter((value) => Number.isFinite(value) && value > 0)
  };
}

function getPublicReviewUiCopy(lang) {
  return lang === "de"
    ? {
        noRatings: "Noch keine Bewertungen",
        noReviews: "Noch keine öffentlichen Bewertungen.",
        featuredEmpty: "Noch keine hervorgehobenen Bewertungen.",
        archiveEmpty: "Noch keine archivierten Bewertungen.",
        awaiting: "Noch keine bewertete Rückmeldung vorhanden.",
        countries: "Laender",
        basedOn: (count) => `Basierend auf ${count} bewerteten oeffentlichen Rueckmeldungen`,
        ratingLabel: (value) => `${value} von 5`,
        reviewBadge: "Oeffentliche Bewertung",
        pinnedBadge: "📌 Vom Admin hervorgehoben",
        countryFallback: "Land nicht angegeben",
        viewPublicReviews: "Oeffentliche Bewertungen ansehen",
        publicReplyLabel: "Oeffentliche Antwort",
        verifiedOwnerReply: "Verifiziert",
        adminToolsLabel: "Admin-Aktionen",
        adminToolsDescription: "Antwort veroeffentlichen, diese Bewertung auf der Startseite fixieren oder aus der Website entfernen.",
        replyFieldLabel: "Oeffentliche Antwort",
        replyPlaceholder: "Oeffentliche Antwort auf diese Bewertung schreiben",
        saveReply: "Antwort veroeffentlichen",
        updateReply: "Antwort aktualisieren",
        pinReview: "📌 Bewertung hervorheben",
        unpinReview: "Hervorhebung entfernen",
        deleteReview: "Bewertung loeschen",
        deleteConfirm: "Diese oeffentliche Bewertung wirklich loeschen?",
        replySaved: "Oeffentliche Antwort gespeichert.",
        reviewDeleted: "Bewertung geloescht.",
        adminError: "Die Admin-Aktion konnte nicht abgeschlossen werden."
      }
    : {
        noRatings: "No ratings yet",
        noReviews: "No public reviews yet.",
        featuredEmpty: "No featured reviews yet.",
        archiveEmpty: "No archived reviews yet.",
        awaiting: "Awaiting first rated review.",
        countries: "countries",
        basedOn: (count) => `Based on ${count} rated public reviews`,
        ratingLabel: (value) => `${value} out of 5`,
        reviewBadge: "Public review",
        pinnedBadge: "📌 Pinned by admin",
        countryFallback: "Country not shared",
        viewPublicReviews: "View public reviews",
        publicReplyLabel: "Public reply",
        verifiedOwnerReply: "Verified",
        adminToolsLabel: "Admin actions",
        adminToolsDescription: "Publish a visible reply, pin this review to the homepage, or remove it from the website.",
        replyFieldLabel: "Public reply",
        replyPlaceholder: "Write a public reply to this review",
        saveReply: "Publish reply",
        updateReply: "Update reply",
        pinReview: "📌 Pin review",
        unpinReview: "Remove pin",
        deleteReview: "Delete review",
        deleteConfirm: "Delete this public review?",
        replySaved: "Public reply saved.",
        reviewDeleted: "Review deleted.",
        adminError: "The admin action could not be completed."
      };
}

function calculatePublicReviewMetrics(publicReviews = []) {
  const ratings = publicReviews
    .map((entry) => Number(entry?.ratingValue))
    .filter((value) => Number.isFinite(value) && value > 0);
  const average = ratings.length
    ? ratings.reduce((sum, value) => sum + value, 0) / ratings.length
    : 0;

  const countryCounts = {};
  publicReviews.forEach((entry) => {
    const country = String(entry?.country || "").trim();
    const key = country || "__unknown__";
    countryCounts[key] = (countryCounts[key] || 0) + 1;
  });

  return {
    ratings,
    average,
    countryEntries: Object.entries(countryCounts).sort((a, b) => Number(b[1]) - Number(a[1]))
  };
}

async function renderPublicReviewLists({ scope = document, forceRefresh = false, publicReviews: providedPublicReviews = null } = {}) {
  const reviewLists = Array.from(scope.querySelectorAll("[data-public-review-list]"));
  if (!reviewLists.length) return [];

  const lang = resolveInitialLanguage();
  const copy = getPublicReviewUiCopy(lang);
  const isAdminMode = getAdminModeState();
  const publicReviews = Array.isArray(providedPublicReviews)
    ? buildPublicReviews(providedPublicReviews)
    : await loadSharedPublicReviews({ forceRefresh });

  reviewLists.forEach((list) => {
    const filter = list.getAttribute("data-public-review-filter") || "all";
    const filteredReviews = filterPublicReviews(publicReviews, filter);
    const limit = Number.parseInt(list.getAttribute("data-public-review-limit") || "", 10);
    const visibleReviews = Number.isFinite(limit) && limit > 0
      ? filteredReviews.slice(0, limit)
      : filteredReviews;
    renderPublicReviewListContent({
      list,
      reviews: visibleReviews,
      copy,
      lang,
      isAdminMode,
      filter
    });

    const block = list.closest("[data-public-review-block]");
    if (block instanceof HTMLElement && filter === "pinned") {
      block.hidden = !isAdminMode && filteredReviews.length === 0;
    }
  });

  return publicReviews;
}

function renderPublicReviewListContent({ list, reviews, copy, lang, isAdminMode, filter = "all" }) {
  if (!(list instanceof HTMLElement)) return;

  list.innerHTML = "";

  if (!reviews.length) {
    const empty = document.createElement("span");
    empty.className = "feedback-stats-empty";
    empty.textContent = filter === "pinned"
      ? copy.featuredEmpty
      : filter === "unpinned"
        ? copy.archiveEmpty
        : copy.noReviews;
    list.append(empty);
    return;
  }

  reviews.forEach((review) => {
    const card = document.createElement("article");
    card.className = `feedback-public-review-card${review.isPinned ? " is-pinned" : ""}`;

    const countryMeta = getCountryDisplayMeta(review.country, copy.countryFallback);
    const countryLabel = `${countryMeta.flag} ${countryMeta.label}`;
    const companyLabel = String(review.company || "").trim();
    const submittedDate = review.submittedAt ? new Date(review.submittedAt) : null;
    const submittedLabel = submittedDate && !Number.isNaN(submittedDate.getTime())
      ? formatUpdatedTimestamp(submittedDate, lang)
      : "";
    const ratingLabel = review.ratingValue
      ? `${review.ratingValue}/5`
      : copy.reviewBadge;
    const metaParts = [companyLabel, countryLabel, submittedLabel].filter(Boolean);
    const replyDate = review.adminReplyCreatedAt ? new Date(review.adminReplyCreatedAt) : null;
    const replyDateLabel = replyDate && !Number.isNaN(replyDate.getTime())
      ? formatUpdatedTimestamp(replyDate, lang)
      : "";
    const reviewerInitials = review.reviewerName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "R";
    const reviewTitle = String(review.reviewTitle || "").trim();
    const reviewText = String(review.reviewText || "").trim();
    const shouldShowReviewTitle = reviewTitle && reviewTitle.toLowerCase() !== reviewText.toLowerCase();
    const pinBadge = review.isPinned
      ? `<span class="feedback-public-review-pin-badge">${escapeHtml(copy.pinnedBadge)}</span>`
      : "";
    const replyBlock = review.adminReply
      ? `
        <div class="feedback-public-review-reply-shell">
          <div class="feedback-public-review-reply">
            <div class="feedback-public-review-reply-head">
              <div class="feedback-public-review-reply-brand">
                <span class="feedback-public-review-reply-mark" aria-hidden="true"></span>
                <div class="feedback-public-review-reply-copy">
                  <div class="feedback-public-review-reply-topline">
                    <strong class="feedback-public-review-reply-owner">Sooraj Sudhakaran</strong>
                    <span class="feedback-public-review-verified-badge"><span aria-hidden="true">✓</span>${escapeHtml(copy.verifiedOwnerReply)}</span>
                  </div>
                  <span class="feedback-public-review-reply-label">${escapeHtml(copy.publicReplyLabel)}</span>
                </div>
              </div>
              ${replyDateLabel ? `<small class="feedback-public-review-reply-date">${escapeHtml(replyDateLabel)}</small>` : ""}
            </div>
            <p class="feedback-public-review-reply-text">${escapeHtml(review.adminReply)}</p>
          </div>
        </div>
      `
      : "";
    const adminControls = isAdminMode
      ? `
        <form class="feedback-public-review-admin-form" data-public-review-admin-form="${escapeHtml(review.id)}">
          <div class="feedback-public-review-admin-head">
            <span class="feedback-public-review-admin-kicker">${escapeHtml(copy.adminToolsLabel)}</span>
            <p class="feedback-public-review-admin-copy">${escapeHtml(copy.adminToolsDescription)}</p>
          </div>
          <label class="feedback-public-review-admin-field">
            <span>${escapeHtml(copy.replyFieldLabel)}</span>
            <textarea name="adminReply" rows="3" placeholder="${escapeHtml(copy.replyPlaceholder)}">${escapeHtml(review.adminReply || "")}</textarea>
          </label>
          <div class="feedback-public-review-admin-actions">
            <button class="btn btn-secondary btn-small" type="submit">${escapeHtml(review.adminReply ? copy.updateReply : copy.saveReply)}</button>
            <button class="btn btn-secondary btn-small feedback-public-review-pin${review.isPinned ? " is-active" : ""}" type="button" data-public-review-pin="${escapeHtml(review.id)}" data-public-review-pin-state="${review.isPinned ? "pinned" : "unpinned"}">${escapeHtml(review.isPinned ? copy.unpinReview : copy.pinReview)}</button>
            <button class="btn btn-secondary btn-small feedback-public-review-delete" type="button" data-public-review-delete="${escapeHtml(review.id)}">${escapeHtml(copy.deleteReview)}</button>
          </div>
        </form>
      `
      : "";

    card.innerHTML = `
      <div class="feedback-public-review-head">
        <div class="feedback-public-review-profile">
          <span class="feedback-public-review-avatar" aria-hidden="true">${escapeHtml(reviewerInitials)}</span>
          <div class="feedback-public-review-identity">
            <div class="feedback-public-review-topline">
              <div class="feedback-public-review-heading">
                <strong class="feedback-public-review-name">${escapeHtml(review.reviewerName)}</strong>
                ${pinBadge}
              </div>
              <span class="feedback-public-review-rating">${escapeHtml(ratingLabel)}</span>
            </div>
            <span class="feedback-public-review-meta">${escapeHtml(metaParts.join(" • "))}</span>
          </div>
        </div>
      </div>
      <div class="feedback-public-review-body">
        ${shouldShowReviewTitle ? `<span class="feedback-public-review-title">${escapeHtml(reviewTitle)}</span>` : ""}
        <p class="feedback-public-review-text">${escapeHtml(review.reviewText)}</p>
      </div>
      ${replyBlock}
      ${adminControls}
    `;

    list.append(card);
  });
}

function setupPublicReviewPanels() {
  const triggers = Array.from(document.querySelectorAll("[data-public-review-toggle]"));
  if (!triggers.length) return;

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const targetId = trigger.getAttribute("aria-controls");
      if (!targetId) return;
      const panel = document.getElementById(targetId);
      if (!(panel instanceof HTMLDetailsElement)) return;
      panel.open = true;
      panel.scrollIntoView({ behavior: "smooth", block: "start" });
      const summary = panel.querySelector("summary");
      if (summary instanceof HTMLElement) {
        window.setTimeout(() => summary.focus({ preventScroll: true }), 180);
      }
    });
  });
}

async function refreshPublicReviewUi({ forceRefresh = true } = {}) {
  const publicReviews = await loadSharedPublicReviews({ forceRefresh });
  await Promise.all([
    renderPublicReviewLists({ scope: document, forceRefresh, publicReviews }),
    setupPublicReviewSummary({ publicReviews }),
    renderSubmissionSummary({
      scope: document,
      lang: resolveInitialLanguage(),
      isAdminMode: getAdminModeState(),
      forceRefresh
    })
  ]);
  setupAdminWorkspace();
}

function setupPublicReviewAutoRefresh() {
  const hasReviewUi = document.querySelector("[data-public-review-section]")
    || document.querySelector("[data-feedback-thankyou-review-panel]")
    || document.querySelector("[data-public-review-list]");
  if (!hasReviewUi) return;

  let refreshPromise = null;
  const runRefresh = () => {
    if (refreshPromise) return refreshPromise;
    refreshPromise = refreshPublicReviewUi({ forceRefresh: true }).finally(() => {
      refreshPromise = null;
    });
    return refreshPromise;
  };

  window.addEventListener("pageshow", () => {
    runRefresh();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      runRefresh();
    }
  });

  window.addEventListener("focus", () => {
    runRefresh();
  });
}

function setupPublicReviewAdminActions() {
  document.addEventListener("submit", async (event) => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;

    const reviewId = form.getAttribute("data-public-review-admin-form");
    if (!reviewId || !getAdminModeState()) return;

    event.preventDefault();

    const lang = resolveInitialLanguage();
    const copy = getPublicReviewUiCopy(lang);
    const textarea = form.querySelector('textarea[name="adminReply"]');
    const submitButton = form.querySelector('button[type="submit"]');
    const replyText = textarea instanceof HTMLTextAreaElement ? textarea.value : "";

    if (submitButton instanceof HTMLButtonElement) {
      submitButton.disabled = true;
      submitButton.setAttribute("aria-busy", "true");
    }

    try {
      await saveSharedPublicReviewReply(reviewId, replyText);
      await refreshPublicReviewUi({ forceRefresh: true });
    } catch {
      window.alert(copy.adminError);
    } finally {
      if (submitButton instanceof HTMLButtonElement) {
        submitButton.disabled = false;
        submitButton.removeAttribute("aria-busy");
      }
    }
  });

  document.addEventListener("click", async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const pinId = target.getAttribute("data-public-review-pin");
    if (pinId && getAdminModeState()) {
      const shouldPin = target.getAttribute("data-public-review-pin-state") !== "pinned";

      if (target instanceof HTMLButtonElement) {
        target.disabled = true;
        target.setAttribute("aria-busy", "true");
      }

      try {
        await setSharedPublicReviewPinned(pinId, shouldPin);
        await refreshPublicReviewUi({ forceRefresh: true });
      } catch {
        window.alert(resolveInitialLanguage() === "de"
          ? getPublicReviewUiCopy("de").adminError
          : getPublicReviewUiCopy("en").adminError);
      } finally {
        if (target instanceof HTMLButtonElement) {
          target.disabled = false;
          target.removeAttribute("aria-busy");
        }
      }
      return;
    }

    const deleteId = target.getAttribute("data-public-review-delete");
    if (!deleteId || !getAdminModeState()) return;

    const lang = resolveInitialLanguage();
    const copy = getPublicReviewUiCopy(lang);
    if (!window.confirm(copy.deleteConfirm)) {
      return;
    }

    if (target instanceof HTMLButtonElement) {
      target.disabled = true;
      target.setAttribute("aria-busy", "true");
    }

    try {
      await deleteSharedSubmissionEvent(deleteId);
      await refreshPublicReviewUi({ forceRefresh: true });
    } catch {
      window.alert(copy.adminError);
    } finally {
      if (target instanceof HTMLButtonElement) {
        target.disabled = false;
        target.removeAttribute("aria-busy");
      }
    }
  });
}

const LANGUAGE_TEXT = {
  de: {
    "Robotics and Automation": "Robotik und Automatisierung",
    "Professional journey": "Beruflicher Werdegang",
    "Project detail": "Projektdetail",
    "Experience detail": "Erfahrungsdetail",
    "Thesis detail": "Thesis-Detail",
    "KEBA experience": "KEBA-Erfahrung",
    "Toggle theme": "Design wechseln",
    "Language switcher": "Sprachauswahl",
    "About": "Über mich",
    "Skills": "Kompetenzen",
    "Experience": "Erfahrung",
    "Journey": "Werdegang",
    "Projects": "Projekte",
    "Education": "Ausbildung",
    "Visit university website": "Website der Hochschule",
    "Certificates": "Zertifikate",
    "Contact": "Kontakt",
    "Where I Fit": "Wo ich passe",
    "Portfolio": "Portfolio",
    "Back to Portfolio": "Zurück zum Portfolio",
    "Back to Projects": "Zurück zu den Projekten",
    "Back to Experience": "Zurück zur Erfahrung",
    "Contact Me": "Kontakt aufnehmen",
    "Request CV": "CV anfragen",
    "GitHub": "GitHub",
    "LinkedIn": "LinkedIn",
    "Get in touch": "Kontakt",
    "Use the links below to contact me, review where I fit best, explore my work, or request my CV directly by email.": "Nutzen Sie die folgenden Links, um mich zu kontaktieren, passende Rollen zu prüfen, meine Arbeit anzusehen oder meinen CV direkt per E-Mail anzufordern.",
    "Check Where I Fit": "Wo ich passe",
    "Check how this profile aligns with your role description, team needs, and deployment context.": "Pruefen Sie, wie dieses Profil zu Ihrer Rollenbeschreibung, den Anforderungen Ihres Teams und dem Einsatzkontext passt.",
    "Robotics engineer based in Stuttgart, Germany": "Robotikingenieur mit Standort Stuttgart, Deutschland",
    "Building robotics that work outside the demo.": "Robotik entwickeln, die auch außerhalb der Demo funktioniert.",
    "I am Sooraj Sudhakaran, a mechatronics engineer focused on industrial robotics, automation, motion planning, ROS workflows, simulation-driven development, and deployment-ready engineering. My work sits at the point where control logic, robot behavior, and practical implementation have to hold up in the real world.": "Ich bin Sooraj Sudhakaran, Mechatronikingenieur mit Fokus auf industrielle Robotik, Automatisierung, Motion Planning, ROS-Workflows, simulationsgestützte Entwicklung und einsatzreife Technik. Meine Arbeit liegt dort, wo Steuerlogik, Roboterverhalten und praktische Umsetzung in der realen Welt bestehen müssen.",
    "Recruiter: Check Where I Fit": "Recruiter: Wo ich passe",
    "My Journey": "Mein Werdegang",
    "Explore": "Mehr",
    "Open to full-time roles": "Offen für Vollzeitstellen",
    "Robotics, automation, Unity and immersive simulation, and autonomous systems opportunities": "Möglichkeiten in Robotik, Automatisierung, Unity und immersiver Simulation sowie autonomen Systemen",
    "Career progression": "Karriereverlauf",
    "Full context": "Vollständiger Kontext",
    "ROS and ROS 2": "ROS und ROS 2",
    "Navigation, workflows, integration, autonomy": "Navigation, Workflows, Integration, Autonomie",
    "Python and C++": "Python und C++",
    "Control logic, robotics tooling, engineering implementation": "Steuerlogik, Robotik-Tooling, technische Umsetzung",
    "Simulation to deployment": "Von Simulation zu Einsatz",
    "Industrial robotics, motion planning, cell constraints": "Industrierobotik, Motion Planning, Zellgrenzen",
    "Current snapshot": "Aktueller Überblick",
    "Active in Stuttgart": "Aktiv in Stuttgart",
    "Stuttgart, Germany": "Stuttgart, Deutschland",
    "Current role": "Aktuelle Rolle",
    "Active now": "Aktuell",
    "Working Student, KEBA Group": "Werkstudent, KEBA Group",
    "Industrial robotics and automation, Stuttgart": "Industrierobotik und Automatisierung, Stuttgart",
    "Click to review current work": "Klicken, um die aktuelle Tätigkeit anzusehen",
    "Current academic phase": "Aktuelle Studienphase",
    "Current master's track": "Aktueller Masterpfad",
    "Master’s Thesis in Industrial Robotics": "Masterarbeit in Industrierobotik",
    "M.Eng. MCPS, TH Deggendorf": "M.Eng. MCPS, TH Deggendorf",
    "M.Eng. Mechatronics and Cyber-Physical Systems": "M.Eng. Mechatronik und Cyber-Physical Systems",
    "Click to review TH Deggendorf study": "Klicken, um das Studium an der TH Deggendorf anzusehen",
    "Focus areas": "Schwerpunkte",
    "Motion planning, ROS, simulation": "Motion Planning, ROS, Simulation",
    "Deployment-ready engineering focus": "Fokus auf einsatzreife Technik",
    "Languages spoken": "Sprachen",
    "English, Malayalam, German": "Englisch, Malayalam, Deutsch",
    "English C1, German A2, Malayalam native": "Englisch C1, Deutsch A2, Malayalam Muttersprache",
    "Clear positioning for recruiters, hiring managers, and engineering teams.": "Klare Positionierung für Recruiter, Hiring Manager und Engineering-Teams.",
    "What I bring": "Was ich mitbringe",
    "My background combines mechanical engineering fundamentals with advanced mechatronics and cyber-physical systems study in Germany. I work across robotics software, control-oriented thinking, simulation, sensor integration, and industrial implementation.": "Mein Hintergrund verbindet Grundlagen des Maschinenbaus mit fortgeschrittenem Studium in Mechatronik und Cyber-Physical Systems in Deutschland. Ich arbeite an Robotiksoftware, regelungsorientiertem Denken, Simulation, Sensorintegration und industrieller Umsetzung.",
    "I am especially interested in roles where robot behavior, reliability, and engineering practicality matter more than polished prototypes.": "Ich interessiere mich besonders für Rollen, in denen Roboterverhalten, Zuverlässigkeit und technische Praxistauglichkeit wichtiger sind als perfekt wirkende Prototypen.",
    "Where I fit best": "Wo ich am besten passe",
    "A recruiter-facing shortlist of the roles that match best, with direct evidence and one clear page to review each fit in detail.": "Eine recruiter-orientierte Kurzliste der Rollen, die am besten passen, mit direkter Evidenz und einer klaren Detailseite pro Passung.",
    "Robotics roles": "Robotikrollen",
    "Software + systems": "Software + Systeme",
    "Industrial fit": "Industrielle Passung",
    "Role fit area": "Passender Bereich",
    "Industrial robotics": "Industrierobotik",
    "Best fit for live automation environments": "Beste Passung für reale Automatisierungsumgebungen",
    "Best match for deployment-oriented robotics, programming, motion planning, and industrial execution context.": "Beste Passung für einsatzorientierte Robotik, Programmierung, Motion Planning und industrielle Ausführung.",
    "KEBA robotics experience and related industrial evidence": "KEBA-Robotikerfahrung und relevante industrielle Evidenz",
    "Includes KEBA role, thesis, training, events, and supporting robotics evidence in one page.": "Enthält KEBA-Rolle, Thesis, Training, Veranstaltungen und ergänzende Robotik-Evidenz auf einer Seite.",
    "Click Here to See Why I Fit": "Hier klicken: Warum ich passe",
    "Click": "Klick",
    "Autonomous systems": "Autonome Systeme",
    "Strong fit for perception-to-action workflows": "Starke Passung für Perception-to-Action-Workflows",
    "Strong fit for ROS, autonomy, sensor integration, and perception-to-action workflows.": "Starke Passung für ROS, Autonomie, Sensorintegration und Perception-to-Action-Workflows.",
    "Related project": "Zugehöriges Projekt",
    "Autonomous vacuum robot in ROS": "Autonomer Staubsaugerroboter in ROS",
    "Shows SLAM, localization, path planning, and sensor-driven autonomy in ROS.": "Zeigt SLAM, Lokalisierung, Pfadplanung und sensorgetriebene Autonomie in ROS.",
    "Motion planning and simulation": "Motion Planning und Simulation",
    "Strong for engineer-ready execution logic": "Stark für technisch umsetzbare Ausführungslogik",
    "Strong fit for simulation-led engineering, controls thinking, and implementation-oriented analysis.": "Starke Passung für simulationsgetriebene Entwicklung, Regelungsdenken und umsetzungsorientierte Analyse.",
    "Engineering optimization study": "Studie zur technischen Optimierung",
    "Shows simulation, analysis, and engineering trade-off reasoning.": "Zeigt Simulation, Analyse und technisches Abwägen.",
    "AR, VR and XR engineering": "AR-, VR- und XR-Engineering",
    "Good fit for immersive training and prototyping": "Gute Passung für immersives Training und Prototyping",
    "Good fit for simulation-based training, immersive workflows, and digital engineering environments.": "Gute Passung für simulationsbasiertes Training, immersive Workflows und digitale Engineering-Umgebungen.",
    "VR machine operation workshop": "VR-Werkstatt für Maschinenbedienung",
    "Shows Unity-based VR interaction and training-oriented simulation design.": "Zeigt Unity-basierte VR-Interaktion und trainingsorientiertes Simulationsdesign.",
    "Overall profile summary": "Zusammenfassung des Profils",
    "Overall, the profile combines KEBA industrial robotics exposure, ROS and autonomy work, simulation-led engineering, immersive VR/XR projects, technical training, and industrial events in one practical engineering portfolio.": "Insgesamt verbindet das Profil KEBA-Erfahrung in Industrierobotik, ROS- und Autonomiearbeit, simulationsgetriebene Entwicklung, immersive VR/XR-Projekte, technisches Training und Industrie-Events in einem praxisnahen Engineering-Portfolio.",
    "If this matches your role, use the contact option below.": "Wenn das zu Ihrer Rolle passt, nutzen Sie bitte die Kontaktoption unten.",
    "Contact Me to Get in Touch": "Kontakt aufnehmen",
    "Core Skills": "Kernkompetenzen",
    "Technical areas I work in most confidently today, with software emphasis highlighted where it matters.": "Technische Bereiche, in denen ich heute am sichersten arbeite, mit betonter Software-Komponente dort, wo sie wichtig ist.",
    "Robotics Software": "Robotiksoftware",
    "Robotics": "Robotik",
    "ROS and ROS 2, robot programming, trajectory planning, navigation, SLAM, and collision-aware execution.": "ROS und ROS 2, Roboterprogrammierung, Trajektorienplanung, Navigation, SLAM und kollisionsbewusste Ausführung.",
    "Core software workflow for autonomy, robot behavior, and execution logic.": "Zentraler Software-Workflow für Autonomie, Roboterverhalten und Ausführungslogik.",
    "Software Stack": "Software-Stack",
    "Programming and simulation": "Programmierung und Simulation",
    "Python, C++, C#, MATLAB, Simulink, Unity, VR, XR, and simulation-driven development workflows.": "Python, C++, C#, MATLAB, Simulink, Unity, VR, XR und simulationsgetriebene Entwicklungsworkflows.",
    "Primary software toolchain for engineering logic, simulation, and development.": "Primäres Software-Tooling für Engineering-Logik, Simulation und Entwicklung.",
    "Sensor and tooling": "Sensorik und Tooling",
    "Sensors, vision, and engineering tools": "Sensoren, Vision und Engineering-Tools",
    "LiDAR, radar, OpenCV, sensor integration, GitHub, Ubuntu, SOLIDWORKS, AutoCAD, ANSYS, and Blender.": "LiDAR, Radar, OpenCV, Sensorintegration, GitHub, Ubuntu, SOLIDWORKS, AutoCAD, ANSYS und Blender.",
    "Supporting stack across perception, tooling, CAD, and practical robotics workflows.": "Ergänzender Stack für Perception, Tooling, CAD und praktische Robotik-Workflows.",
    "Mechanical and systems foundation": "Mechanische und systemische Grundlage",
    "Mechanical engineering foundation": "Grundlage Maschinenbau",
    "CAD design, FEA, optimization, mechatronics integration, system thinking, and manufacturing awareness.": "CAD-Design, FEA, Optimierung, mechatronische Integration, Systemdenken und Fertigungsverständnis.",
    "Foundation that supports robotics implementation with engineering depth.": "Grundlage, die Robotikumsetzung mit technischer Tiefe unterstützt.",
    "Experience": "Erfahrung",
    "Recent work shaped by real industrial context, robotics implementation, and practical engineering responsibility.": "Aktuelle Arbeit geprägt durch industriellen Kontext, Robotikumsetzung und praktische Verantwortung.",
    "Current professional direction": "Aktuelle berufliche Richtung",
    "Industrial robotics with deployment-ready engineering focus": "Industrierobotik mit einsatzreifem Engineering-Fokus",
    "Current work is centered on robotics implementation, industrial execution constraints, and planning-to-deployment thinking.": "Die aktuelle Arbeit konzentriert sich auf Robotik-Implementierung, industrielle Ausführungsgrenzen und ein Denken von der Planung bis zum Einsatz.",
    "Industrial robotics, live deployment constraints, and engineer-ready execution": "Industrierobotik, reale Einsatzgrenzen und technisch einsatzreife Umsetzung",
    "Current": "Aktuell",
    "Parallel track": "Parallel",
    "Focus": "Fokus",
    "Master’s thesis in industrial robotics": "Masterarbeit in Industrierobotik",
    "Programming, planning, deployment readiness": "Programmierung, Planung, Einsatzreife",
    "CURRENT ROLE": "AKTUELLE ROLLE",
    "Active role": "Aktive Rolle",
    "Master’s Thesis, KEBA Group": "Masterarbeit, KEBA Group",
    "Master’s thesis": "Masterarbeit",
    "Stuttgart, Baden-Wurttemberg, Germany": "Stuttgart, Baden-Württemberg, Deutschland",
    "Industrial robotics and automation work in a live engineering environment, focused on implementation quality and deployment context.": "Arbeit in Industrierobotik und Automatisierung in einem realen Engineering-Umfeld, mit Fokus auf Umsetzungsqualität und Einsatzkontext.",
    "Robot programming": "Roboterprogrammierung",
    "Deployment context": "Einsatzkontext",
    "Built a 6-axis autonomous robot workflow for machine operation and developed a lightweight web-based joint path planner to generate automatic waypoints for drag&bot simulation testing.": "Entwickelte einen autonomen 6-Achs-Roboterworkflow für die Maschinenbedienung und einen leichten webbasierten Gelenkpfadplaner zur automatischen Erzeugung von Wegpunkten für Tests in drag&bot-Simulationen.",
    "Built a 6-axis autonomous robot workflow for machine operation and developed a lightweight web-based joint path planner to generate automatic waypoints for drag&amp;bot simulation testing.": "Entwickelte einen autonomen 6-Achs-Roboterworkflow für die Maschinenbedienung und einen leichten webbasierten Gelenkpfadplaner zur automatischen Erzeugung von Wegpunkten für Tests in drag&bot-Simulationen.",
    "Motion planning": "Motion Planning",
    "Joint path planner": "Gelenkpfadplaner",
    "Collision-aware execution": "Kollisionsbewusste Ausführung",
    "Cell constraints": "Zellgrenzen",
    "Click Here to View Details": "Hier klicken: Details",
    "Master thesis highlight": "Thesis-Highlight",
    "Industrial robotics, not just theory": "Industrierobotik, nicht nur Theorie",
    "The strongest thread in my recent work is the translation of robotics theory into an actual industrial context. My thesis centered on a 6-axis autonomous robot workflow in the KEBA and drag&bot ecosystem, with attention to motion planning, operational constraints, and reliable execution.": "Der stärkste rote Faden meiner aktuellen Arbeit ist die Übertragung von Robotiktheorie in einen realen industriellen Kontext. Meine Thesis konzentrierte sich auf einen autonomen 6-Achs-Roboterworkflow im KEBA- und drag&bot-Umfeld, mit Fokus auf Motion Planning, operative Grenzen und zuverlässige Ausführung.",
    "I also designed and developed a lightweight web-based joint path planner to enter start and goal joint angles, generate interpolated waypoints, visualize the result, and export CSV files for drag&amp;bot simulation validation.": "Ich habe außerdem einen leichten webbasierten Gelenkpfadplaner konzipiert und entwickelt, mit dem Start- und Zielgelenkwinkel eingegeben, interpolierte Wegpunkte erzeugt, das Ergebnis visualisiert und CSV-Dateien für die Validierung in drag&bot-Simulationen exportiert werden können.",
    "Robot programming for real machine interaction.": "Roboterprogrammierung für reale Maschineninteraktion.",
    "Motion planning and re-grip logic for practical tasks.": "Motion Planning und Re-Grip-Logik für praktische Aufgaben.",
    "Automatic waypoint generation for simulation workflow support.": "Automatische Wegpunkterzeugung zur Unterstützung von Simulations-Workflows.",
    "Collision-aware behavior shaped by cell constraints.": "Kollisionsbewusstes Verhalten unter Berücksichtigung von Zellgrenzen.",
    "Integration thinking focused on deployment readiness.": "Integrationsdenken mit Fokus auf Einsatzreife.",
    "Built industrial discipline through inspection work, reporting, quality procedures, and engineering accountability.": "Industrielle Disziplin durch Prüfarbeit, Berichtswesen, Qualitätsprozesse und technische Verantwortlichkeit aufgebaut.",
    "Inspection": "Prüfung",
    "Quality procedures": "Qualitätsprozesse",
    "Industrial discipline": "Industrielle Disziplin",
    "February 2022 to September 2022": "Februar 2022 bis September 2022",
    "March 2024 to June 2024": "März 2024 bis Juni 2024",
    "October 2023 to January 2024": "Oktober 2023 bis Januar 2024",
    "July 2021": "Juli 2021",
    "March 2023 to Present": "März 2023 bis heute",
    "August 2017 to July 2021": "August 2017 bis Juli 2021",
    "September 2025 to March 2026": "September 2025 bis März 2026",
    "November 25 to 27, 2025": "25. bis 27. November 2025",
    "March 24 to 26, 2026": "24. bis 26. März 2026",
    "Selected Projects": "Ausgewählte Projekte",
    "Portfolio work spanning robotics, immersive simulation, optimization, and mechatronic systems.": "Portfolioarbeit aus Robotik, immersiver Simulation, Optimierung und mechatronischen Systemen.",
    "Designed an autonomous vacuum robot using SLAM, localization, obstacle detection, sensor fusion, and path planning.": "Entwickelte einen autonomen Staubsaugerroboter mit SLAM, Lokalisierung, Hinderniserkennung, Sensorfusion und Pfadplanung.",
    "Built an immersive workshop in Unity to simulate machine operation with spatial interaction, realistic movement, and training-focused flow.": "Entwickelte in Unity eine immersive Werkstatt zur Simulation von Maschinenbedienung mit räumlicher Interaktion, realistischer Bewegung und trainingsorientiertem Ablauf.",
    "Applied FEA-driven optimization in SOLIDWORKS to reduce weight and material use while preparing the design for additive manufacturing.": "Setzte FEA-gestützte Optimierung in SOLIDWORKS ein, um Gewicht und Materialeinsatz zu reduzieren und das Design auf additive Fertigung vorzubereiten.",
    "Modeled an active suspension system in MATLAB Simulink with hydraulic actuation for real-time behavior analysis and performance study.": "Modellierte ein aktives Fahrwerk in MATLAB Simulink mit hydraulischer Aktorik für Echtzeitverhaltensanalyse und Leistungsbewertung.",
    "Automated Mechatronic Service Robot": "Automatisierter mechatronischer Serviceroboter",
    "Created an Arduino-based service robot with line tracking and sensor integration for smoother navigation in hospitality support scenarios.": "Entwickelte einen Arduino-basierten Serviceroboter mit Linienverfolgung und Sensorintegration für sicherere Navigation in serviceorientierten Szenarien.",
    "For More Details Click Here": "Für mehr Details hier klicken",
    "Education": "Ausbildung",
    "Academic track from mechanical engineering in India to mechatronics and cyber-physical systems in Germany.": "Akademischer Weg vom Maschinenbau in Indien zu Mechatronik und Cyber-Physical Systems in Deutschland.",
    "Certificates": "Zertifikate",
    "Important certifications and training across robotics, quality, and engineering tools.": "Wichtige Zertifizierungen und Trainings aus Robotik, Qualität und Engineering-Tools.",
    "View Certificate": "Zertifikat ansehen",
    "File not included locally": "Datei lokal nicht enthalten",
    "Events, Exhibitions, and Training": "Veranstaltungen, Messen und Trainings",
    "Trade fairs, technical training, and professional participation that support the industrial side of this portfolio.": "Fachmessen, technisches Training und berufliche Teilnahme, die die industrielle Seite dieses Portfolios unterstützen.",
    "Accomplishments": "Erfolge",
    "Signals of leadership, recognition, and direction beyond course lists and tool names.": "Hinweise auf Führung, Anerkennung und Richtung über Kurslisten und Toolnamen hinaus.",
    "Best Bachelor Project Award": "Auszeichnung für das beste Bachelorprojekt",
    "Department Association Leadership": "Führung im Fachschaftsverband",
    "Design Recognition": "Design-Auszeichnung",
    "Autodesk design workshop selection and appreciation": "Auswahl und Anerkennung für einen Autodesk-Design-Workshop",
    "Selected as 1 of 3 students from a 120-student batch for an Autodesk design workshop conducted by the official Autodesk team at Providence College of Engineering, with added exposure to FDM 3D printing workflows.": "Als 1 von 3 Studierenden aus einem Jahrgang von 120 für einen Autodesk-Design-Workshop ausgewählt, der vom offiziellen Autodesk-Team am Providence College of Engineering durchgeführt wurde, mit zusätzlichem Einblick in FDM-3D-Druck-Workflows.",
    "Cross-domain engineering portfolio": "Bereichsübergreifendes Engineering-Portfolio",
    "Travel Footprint": "Reiseprofil",
    "Countries explored": "Erkundete Länder",
    "Germany lived experience": "Deutschland im gelebten Alltag",
    "Living in different German states added local perspective beyond study alone and made the transition more practical and grounded.": "Das Leben in verschiedenen deutschen Bundesländern brachte eine lokale Perspektive über das Studium hinaus und machte den Übergang praktischer und greifbarer.",
    "Bavaria": "Bayern",
    "Thuringia": "Thüringen",
    "Baden-Wurttemberg": "Baden-Württemberg",
    "Transition": "Übergang",
    "Milestones": "Meilensteine",
    "Developer signal": "Developer-Signal",
    "Travel": "Reisen",
    "Meaning": "Bedeutung",
    "Connect": "Kontakt",
    "From school excellence to industrial robotics in Germany": "Von schulischer Exzellenz zur Industrierobotik in Deutschland",
    "The story behind.": "Die Geschichte dahinter.",
    "This page traces the path from school foundations in India, through leadership and engineering training, to graduate study, robotics software work, and industrial execution in Germany. It explains not only what I studied, but how the technical direction became clear over time.": "Diese Seite zeigt den Weg von den schulischen Grundlagen in Indien über Führung und technische Ausbildung bis hin zum Masterstudium, zur Robotik-Softwarearbeit und zur industriellen Umsetzung in Deutschland. Sie erklärt nicht nur, was ich studiert habe, sondern auch, wie die technische Richtung im Laufe der Zeit klar wurde.",
    "School": "Schule",
    "Academic base": "Akademische Basis",
    "Mechanical engineering": "Maschinenbau",
    "System foundation": "Systemische Grundlage",
    "Leadership": "Führung",
    "Responsibility": "Verantwortung",
    "Germany": "Deutschland",
    "Advanced study": "Fortgeschrittenes Studium",
    "Industrial direction": "Industrielle Ausrichtung",
    "Score in 10th standard": "Ergebnis in der 10. Klasse",
    "Department association roles during engineering": "Rollen in der Fachschaft während des Studiums",
    "Academic and industrial transition into robotics": "Akademischer und industrieller Übergang in die Robotik",
    "Journey snapshot": "Überblick zum Werdegang",
    "Developer + robotics profile": "Developer- und Robotikprofil",
    "From mechanical engineering foundations to industrial robotics": "Von den Grundlagen des Maschinenbaus zur Industrierobotik",
    "A progression shaped by academic consistency, leadership, project work, workflow scripting, simulation-driven thinking, and a deliberate move toward industrial robotics.": "Ein Weg, geprägt von akademischer Beständigkeit, Führung, Projektarbeit, Workflow-Skripting, simulationsgestütztem Denken und einem bewussten Schritt in Richtung Industrierobotik.",
    "Current phase": "Aktuelle Phase",
    "M.Eng. and industrial robotics work": "M.Eng. und Arbeit in der Industrierobotik",
    "Shift made": "Vollzogener Wandel",
    "From mechanical systems to cyber-physical and robotic systems": "Von mechanischen Systemen zu cyber-physischen und robotischen Systemen",
    "Core theme": "Kernmotiv",
    "Long-term engineering growth with practical relevance": "Langfristiges technisches Wachstum mit Praxisbezug",
    "Developer signal": "Developer-Signal",
    "Workflow scripting, simulation support, technical communication": "Workflow-Skripting, Simulationsunterstützung, technische Kommunikation",
    "International transition": "Internationaler Übergang",
    "India to Germany": "Indien nach Deutschland",
    "The move was not a reset. It was a continuation of a direction already taking shape through engineering study, project work, and the decision to move toward robotics at a higher level.": "Der Umzug war kein Neustart. Er war die Fortsetzung einer Richtung, die sich bereits durch Studium, Projektarbeit und die bewusste Entscheidung für Robotik auf höherem Niveau abzeichnete.",
    "School foundation": "Schulische Grundlage",
    "Master’s in Germany": "Master in Deutschland",
    "Schooling, B.Tech, leadership, early career foundation": "Schule, B.Tech, Führung, frühe berufliche Grundlage",
    "M.Eng, thesis work, and industrial robotics exposure": "M.Eng., Thesis-Arbeit und Einblick in die Industrierobotik",
    "Route overview": "Routenüberblick",
    "A clearer timeline of the stages that shaped the move from academic discipline to industrial robotics.": "Ein klarerer Zeitstrahl der Phasen, die den Weg von akademischer Disziplin zur Industrierobotik geprägt haben.",
    "The journey is not only academic. It also shows how the profile developed on the software and systems side.": "Der Weg ist nicht nur akademisch. Er zeigt auch, wie sich das Profil auf der Software- und Systemseite entwickelt hat.",
    "Software and workflow thinking": "Software- und Workflow-Denken",
    "The direction moved beyond pure mechanical design into structured workflow logic, scripting support, and robotics-oriented software thinking.": "Die Ausrichtung ging über reines mechanisches Design hinaus und entwickelte sich hin zu strukturierter Workflow-Logik, Skripting-Unterstützung und softwareorientiertem Denken in der Robotik.",
    "ROS workflows": "ROS-Workflows",
    "Tooling support": "Tooling-Unterstützung",
    "Systems integration mindset": "Mindset für Systemintegration",
    "The profile combines mechanical understanding, cyber-physical systems study, and industrial robotics context instead of staying in a single narrow lane.": "Das Profil verbindet mechanisches Verständnis, das Studium cyber-physischer Systeme und den Kontext der Industrierobotik, statt in einer engen Disziplin zu bleiben.",
    "Mechanical base": "Mechanische Basis",
    "Cyber-physical systems": "Cyber-physische Systeme",
    "Simulation to execution": "Von der Simulation zur Ausführung",
    "Project and thesis work show an approach that connects simulation, validation, controller-side constraints, and practical execution logic.": "Projekt- und Thesis-Arbeit zeigen einen Ansatz, der Simulation, Validierung, controllerseitige Randbedingungen und praktische Ausführungslogik verbindet.",
    "Simulation": "Simulation",
    "Validation": "Validierung",
    "Execution logic": "Ausführungslogik",
    "Technical communication and ownership": "Technische Kommunikation und Verantwortung",
    "Leadership, presentations, reporting discipline, and recruiter-facing clarity show that the work can be explained, documented, and carried responsibly.": "Führung, Präsentationen, Berichtsdiziplin und recruiter-taugliche Klarheit zeigen, dass die Arbeit verständlich erklärt, dokumentiert und verantwortungsvoll getragen werden kann.",
    "Presentations": "Präsentationen",
    "Reporting": "Berichtswesen",
    "Ownership": "Verantwortung",
    "What this journey shows": "Was dieser Weg zeigt",
    "School years": "Schuljahre",
    "Built a strong academic base through the CBSE curriculum at Sree Narayana Central School.": "Aufbau einer starken akademischen Grundlage durch den CBSE-Lehrplan an der Sree Narayana Central School.",
    "Scored 98% in 10th standard.": "98 % in der 10. Klasse erreicht.",
    "Developed consistency in mathematics, science, and disciplined study habits.": "Beständigkeit in Mathematik, Naturwissenschaften und disziplinierten Lerngewohnheiten entwickelt.",
    "2017 to 2021": "2017 bis 2021",
    "Completed B.Tech in Mechanical Engineering and built the core systems-thinking base behind the later robotics direction.": "B.Tech im Maschinenbau abgeschlossen und die systemische Grundlage für die spätere Robotik-Ausrichtung aufgebaut.",
    "Strengthened mechanical design, manufacturing, and engineering fundamentals.": "Mechanisches Design, Fertigung und technische Grundlagen gestärkt.",
    "Built the technical base that later expanded into mechatronics, simulation, and robotics.": "Die technische Basis geschaffen, die später in Mechatronik, Simulation und Robotik erweitert wurde.",
    "During engineering years": "Während des Studiums",
    "Leadership and project recognition": "Führung und Projektauszeichnung",
    "University life also developed responsibility, coordination, and confidence through leadership and project work.": "Das Hochschulleben hat außerdem Verantwortung, Koordination und Selbstvertrauen durch Führung und Projektarbeit gefördert.",
    "Served in leadership roles in the Mechanical Engineering Department Association.": "Führungsrollen in der Fachschaft Maschinenbau übernommen.",
    "Received best project recognition for the service robot built during the pandemic period.": "Auszeichnung für das beste Projekt für den während der Pandemie gebauten Serviceroboter erhalten.",
    "2022": "2022",
    "Industrial foundation": "Industrielle Grundlage",
    "Worked in non-destructive testing and gained direct exposure to inspection quality, reporting discipline, and industrial responsibility.": "In der zerstörungsfreien Prüfung gearbeitet und direkten Einblick in Prüfqualität, Berichtswesen und industrielle Verantwortung gewonnen.",
    "Built respect for process discipline and technical accountability.": "Respekt für Prozessdisziplin und technische Verantwortung aufgebaut.",
    "Added early real-world engineering exposure before the robotics specialization phase.": "Frühe reale Engineering-Erfahrung vor der Spezialisierung auf Robotik gesammelt.",
    "2023 to present": "2023 bis heute",
    "Advanced study and industrial robotics in Germany": "Weiterführendes Studium und Industrierobotik in Deutschland",
    "Moved to Germany for advanced study at Technische Hochschule Deggendorf and progressed into industrial robotics work through the KEBA thesis and working student role.": "Für ein weiterführendes Studium an der Technischen Hochschule Deggendorf nach Deutschland gekommen und über die KEBA-Thesis sowie die Werkstudentenrolle in die Industrierobotik eingestiegen.",
    "M.Eng. in Mechatronics and Cyber-Physical Systems in Germany.": "M.Eng. in Mechatronik und Cyber-Physical Systems in Deutschland.",
    "Industrial robotics exposure through KEBA Group and drag&bot.": "Einblick in die Industrierobotik durch KEBA Group und drag&bot.",
    "KEBA Group profile": "KEBA Group Profil",
    "KEBA Group industrial robotics experience": "Industrierobotik-Erfahrung bei KEBA Group",
    "KEBA experience overview": "KEBA-Erfahrungsueberblick",
    "A clearer view of the working student role and the parallel thesis path": "Ein klarerer Blick auf die Werkstudentenrolle und den parallelen Thesis-Weg",
    "This page now groups the KEBA story into a readable flow: overall context first, then responsibilities, then thesis-linked robotics work, and finally the industrial exposure around it.": "Diese Seite ordnet die KEBA-Story nun in einen gut lesbaren Ablauf: zuerst der Gesamtkontext, dann die Aufgaben, danach die thesisnahe Robotikarbeit und schliesslich die industrielle Einbettung.",
    "KEBA overview": "KEBA-Überblick",
    "This page brings together the full KEBA-related profile: working student responsibilities, the parallel master's thesis in industrial robotics, technical training, project presentations, and exhibition participation that together show an industrially grounded robotics direction.": "Diese Seite bündelt das vollständige KEBA-bezogene Profil: Werkstudententätigkeit, die parallele Masterarbeit in Industrierobotik, technisches Training, Projektpräsentationen und Messebeteiligung, die gemeinsam eine industriell fundierte Robotik-Ausrichtung zeigen.",
    "If you are hiring for robotics or automation, this page is designed to work as one KEBA-focused review page. It combines the working student role, the parallel thesis, KEBA and drag&bot training, technical presentations, and KEBA exhibition participation in one place.": "Wenn Sie für Robotik oder Automatisierung einstellen, ist diese Seite als KEBA-fokussierte Übersichtsseite gedacht. Sie bündelt die Werkstudentenrolle, die parallele Thesis, KEBA- und drag&bot-Trainings, technische Präsentationen und KEBA-Messebeteiligung an einem Ort.",
    "Role and growth": "Rolle und Entwicklung",
    "What the working student experience added beyond coursework": "Was die Werkstudentenerfahrung ueber das Studium hinaus hinzugefuegt hat",
    "The value of this role is that it sits close to real engineering routines, so the portfolio signal is not only academic robotics work but industrial judgment and communication around deployment-facing systems.": "Der Wert dieser Rolle liegt in der Naehe zu echten Engineering-Abläufen. Das Portfoliosignal ist daher nicht nur akademische Robotikarbeit, sondern auch industrielles Urteilsvermoegen und Kommunikation rund um einsatznahe Systeme.",
    "Thesis-linked robotics work": "Thesis-verknuepfte Robotikarbeit",
    "The deeper robotics track that ran in parallel with the role": "Die vertiefte Robotikspur, die parallel zur Rolle lief",
    "Industrial exposure": "Industrielle Einbindung",
    "Training, presentations, and public-facing KEBA participation": "Training, Praesentationen und oeffentliche KEBA-Praesenz",
    "Related pages for the full KEBA context": "Verwandte Seiten fuer den gesamten KEBA-Kontext",
    "Use these pages if you want the thesis breakdown, the full portfolio map, or the journey context around this industrial robotics track.": "Nutzen Sie diese Seiten, wenn Sie die Thesis im Detail, die gesamte Portfolio-Karte oder den Weg hinter dieser Industrierobotik-Ausrichtung sehen moechten.",
    "Company": "Unternehmen",
    "Location": "Standort",
    "Focus": "Fokus",
    "Industrial robotics, automation, thesis and training": "Industrierobotik, Automatisierung, Thesis und Training",
    "Contact for Robotics Roles": "Kontakt für Robotikrollen",
    "Open for conversations": "Offen für Gespräche",
    "If you are hiring for robotics, automation, Unity and simulation work, controls, or autonomous systems work, email is the fastest way to reach me.": "Wenn Sie für Robotik, Automatisierung, Unity- und Simulationsarbeit, Regelungstechnik oder autonome Systeme einstellen, ist E-Mail der schnellste Weg, mich zu erreichen.",
    "Back to Where I Fit Best": "Zurück zu passenden Rollen",
    "Industrial robotics thesis at KEBA Group": "Masterarbeit in Industrierobotik bei KEBA Group",
    "The thesis focused on translating robotics logic into industrial machine-operation workflows. It connected planning, execution, and deployment constraints instead of stopping at simulation-only results.": "Die Thesis konzentrierte sich darauf, Robotiklogik in industrielle Maschinenbedienungs-Workflows zu übertragen. Sie verband Planung, Ausführung und Einsatzgrenzen, statt bei reinen Simulationsergebnissen stehenzubleiben.",
    "The thesis focused on translating robotics logic into industrial machine-operation workflows. It connected planning, execution, and deployment constraints rather than stopping at simulation-only results.": "Die Thesis konzentrierte sich darauf, Robotiklogik in industrielle Maschinenbedienungs-Workflows zu übertragen. Sie verband Planung, Ausführung und Einsatzgrenzen, anstatt bei reinen Simulationsergebnissen stehenzubleiben.",
    "Thesis overview": "Thesis-Ueberblick",
    "From robot planning logic to industrial execution thinking": "Von Roboter-Planungslogik zu industriellem Ausfuehrungsdenken",
    "This page now reads as a case study: first the problem and objective, then the technical scope, then the tooling contribution, and finally the industrial value of the work.": "Diese Seite liest sich nun wie eine Fallstudie: zuerst Problem und Ziel, dann der technische Umfang, danach der Tooling-Beitrag und schliesslich der industrielle Mehrwert der Arbeit.",
    "What this experience strengthened": "Was diese Erfahrung gestärkt hat",
    "View thesis details": "Thesis-Details ansehen",
    "Problem space": "Problemstellung",
    "System objective": "Systemziel",
    "The thesis focused on a 6-axis autonomous robot workflow for machine operation. The goal was not only to demonstrate movement, but to make the complete operation flow practical enough for industrial execution logic.": "Die Thesis konzentrierte sich auf einen autonomen 6-Achs-Roboterworkflow für die Maschinenbedienung. Das Ziel war nicht nur, Bewegung zu demonstrieren, sondern den gesamten Ablauf praxisnah genug für industrielle Ausführungslogik zu gestalten.",
    "The strongest signal here is not only robotics implementation, but the ability to connect planning, gripping, machine interaction, and deployment limits inside one industrial workflow.": "Das staerkste Signal hier ist nicht nur Robotik-Implementierung, sondern die Faehigkeit, Planung, Greiflogik, Maschineninteraktion und Einsatzgrenzen in einem industriellen Workflow zusammenzufuehren.",
    "Core technical scope": "Kern des technischen Umfangs",
    "What the thesis had to solve in practice": "Was die Thesis in der Praxis loesen musste",
    "Key work areas": "Zentrale Arbeitsbereiche",
    "Tooling and delivery": "Tooling und Umsetzung",
    "Internal tooling, communication, and industrial context": "Internes Tooling, Kommunikation und industrieller Kontext",
    "Joint path planner contribution": "Beitrag zum Gelenkpfadplaner",
    "Engineering challenges addressed": "Bearbeitete Engineering-Herausforderungen",
    "Why this thesis matters": "Warum diese Thesis wichtig ist",
    "Technical value and portfolio relevance": "Technischer Mehrwert und Portfolio-Relevanz",
    "Technical value": "Technischer Mehrwert",
    "Presentation and collaboration": "Präsentation und Zusammenarbeit",
    "Supporting industrial exposure": "Begleitende Industrieerfahrung",
    "Acknowledgement": "Danksagung",
    "Special thanks to Martin Naumann for his guidance and support during this master's thesis work in the KEBA and drag&bot environment. His supervision, technical input, and practical perspective were valuable in shaping the work from simulation and planning toward industrial execution thinking.": "Besonderer Dank gilt Martin Naumann fuer seine Begleitung und Unterstuetzung waehrend dieser Masterarbeit im KEBA- und drag&bot-Umfeld. Seine Betreuung, technischen Impulse und praktische Perspektive waren wertvoll, um die Arbeit von Simulation und Planung hin zu industriellem Ausfuehrungsdenken weiterzuentwickeln.",
    "Special thanks to Martin Naumann for his guidance and support during this master's thesis work in the KEBA and drag&amp;bot environment. His supervision, technical input, and practical perspective were valuable in shaping the work from simulation and planning toward industrial execution thinking.": "Besonderer Dank gilt Martin Naumann fuer seine Begleitung und Unterstuetzung waehrend dieser Masterarbeit im KEBA- und drag&bot-Umfeld. Seine Betreuung, technischen Impulse und praktische Perspektive waren wertvoll, um die Arbeit von Simulation und Planung hin zu industriellem Ausfuehrungsdenken weiterzuentwickeln.",
    "Non-Destructive Testing Technician": "ZfP-Techniker",
    "This role built industrial discipline before the robotics-focused phase of my career. It strengthened accuracy, technical reporting habits, and responsibility in engineering-quality environments.": "Diese Rolle hat vor der robotikorientierten Phase meiner Laufbahn industrielle Disziplin aufgebaut. Sie stärkte Genauigkeit, technisches Berichtswesen und Verantwortung in qualitätskritischen Engineering-Umgebungen.",
    "What the role involved": "Aufgaben der Rolle",
    "Industrial environment": "Industrielles Umfeld",
    "What it added": "Was sie ergänzt hat",
    "Transferable value": "Übertragbarer Mehrwert",
    "Why it still matters in the portfolio": "Warum sie im Portfolio weiterhin wichtig ist",
    "Why it matters in the portfolio": "Warum es im Portfolio wichtig ist",
    "Professional foundation carried forward": "Mitgenommene berufliche Grundlage",
    "Simulation project": "Simulationsprojekt",
    "Design optimization": "Konstruktionsoptimierung",
    "ROS project": "ROS-Projekt",
    "Immersive simulation": "Immersive Simulation",
    "Award-winning healthcare support concept": "Ausgezeichnetes Konzept zur Unterstützung im Gesundheitsbereich",
    "Software and languages used": "Verwendete Software und Sprachen",
    "Core technical tools used for system modeling and simulation workflow.": "Zentrale technische Werkzeuge für Modellierung und Simulationsworkflow.",
    "Core robotics software and technical workflow used in this autonomy project.": "Zentrale Robotiksoftware und technischer Workflow dieses Autonomieprojekts.",
    "Core engineering tools used in the optimization and analysis workflow.": "Zentrale Engineering-Tools für den Optimierungs- und Analyseworkflow.",
    "Core immersive tools and development stack used in this project.": "Zentrale immersive Tools und Entwicklungs-Stack dieses Projekts.",
    "Core embedded and control-side tools used in the robot build.": "Zentrale Embedded- und Steuerungswerkzeuge beim Aufbau des Roboters.",
    "Software and tools used": "Verwendete Software und Werkzeuge",
    "Continue": "Weiter",
    "Return to the portfolio or get in touch.": "Zurück zum Portfolio oder Kontakt aufnehmen.",
    "Core robotics software, simulation tools, and engineering platforms used across the KEBA working student role and the parallel thesis workflow.": "Zentrale Robotiksoftware, Simulationstools und Engineering-Plattformen, die in der KEBA-Werkstudentenrolle und im parallelen Thesis-Workflow verwendet wurden.",
    "Workflow scripting and robotics support tooling": "Workflow-Skripting und unterstützendes Robotik-Tooling",
    "ROS 1": "ROS 1",
    "Robot integration and legacy workflow understanding": "Roboterintegration und Verständnis bestehender Workflows",
    "ROS 2": "ROS 2",
    "Modern robotics communication and workflow architecture": "Moderne Robotik-Kommunikation und Workflow-Architektur",
    "drag&bot": "drag&bot",
    "Robot programming, simulation checks, and workflow validation": "Roboterprogrammierung, Simulationsprüfungen und Workflow-Validierung",
    "Blender": "Blender",
    "3D visualization and supporting geometry preparation": "3D-Visualisierung und vorbereitende Geometriearbeit",
    "Mechanical design context and engineering support": "Mechanischer Konstruktionskontext und Engineering-Unterstützung",
    "KeMotion": "KeMotion",
    "KEBA robot controller environment and industrial execution context": "KEBA-Robotercontroller-Umgebung und industrieller Ausführungskontext",
    "KEBA robot controller": "KEBA-Robotercontroller",
    "Controller-side understanding for deployment-oriented robotics work": "Controller-seitiges Verständnis für einsatzorientierte Robotikarbeit",
    "MATLAB": "MATLAB",
    "Simulink": "Simulink",
    "Control modeling": "Regelungsmodellierung",
    "Dynamic response study": "Untersuchung des Dynamikverhaltens",
    "ROS": "ROS",
    "Python": "Python",
    "SLAM": "SLAM",
    "Unity": "Unity",
    "C#": "C#",
    "VR": "VR",
    "SOLIDWORKS": "SOLIDWORKS",
    "Finite element analysis": "Finite-Elemente-Analyse",
    "Optimization": "Optimierung",
    "Arduino": "Arduino",
    "Embedded C/C++": "Embedded C/C++",
    "Sensor integration": "Sensorintegration",
    "Tools": "Werkzeuge",
    "Period": "Zeitraum",
    "Theme": "Thema",
    "Stack": "Stack",
    "Repository": "Repository",
    "Open GitHub repository": "GitHub-Repository öffnen",
    "Category": "Kategorie",
    "Platform": "Plattform",
    "Date": "Datum",
    "Recognition": "Auszeichnung",
    "Objective": "Zielsetzung",
    "Goal": "Ziel",
    "Main work": "Hauptarbeit",
    "Main components": "Hauptkomponenten",
    "Main aim": "Hauptziel",
    "System build": "Systemaufbau",
    "Why it mattered": "Warum es wichtig war",
    "Recognition and visibility": "Anerkennung und Sichtbarkeit",
    "Robotics relevance": "Robotik-Relevanz",
    "Why it still fits the portfolio": "Warum es weiterhin ins Portfolio passt",
    "Active Suspension System Modeling": "Modellierung eines aktiven Fahrwerks",
    "This modeling project examined how an active suspension system could be simulated for dynamic response and performance behavior using MATLAB Simulink.": "Dieses Modellierungsprojekt untersuchte, wie ein aktives Fahrwerkssystem mit MATLAB Simulink für Dynamikverhalten und Leistungsanalyse simuliert werden kann.",
    "Dynamic system modeling": "Dynamische Systemmodellierung",
    "Numerical analysis and modeling": "Numerische Analyse und Modellierung",
    "Block-diagram simulation": "Blockdiagramm-Simulation",
    "Model suspension behavior under active control using simulation rather than physical prototyping.": "Das Verhalten eines Fahrwerks unter aktiver Regelung durch Simulation statt durch physischen Prototypenbau modellieren.",
    "Hydraulic actuator-based suspension logic.": "Fahrwerkslogik mit hydraulischer Aktorik.",
    "System-response analysis.": "Analyse des Systemverhaltens.",
    "Simulation-focused performance study.": "Simulationsorientierte Leistungsuntersuchung.",
    "The project shows comfort with modeling, systems thinking, and engineering analysis in dynamic environments.": "Das Projekt zeigt Sicherheit in Modellierung, Systemdenken und technischer Analyse in dynamischen Umgebungen.",
    "It expands the portfolio from robotics and CAD into control-oriented simulation work.": "Es erweitert das Portfolio von Robotik und CAD in Richtung regelungsorientierter Simulationsarbeit.",
    "Autonomous Vacuum Robot in ROS": "Autonomer Staubsaugerroboter in ROS",
    "This project focused on autonomous movement, localization, and environmental awareness inside a ROS-based workflow.": "Dieses Projekt konzentrierte sich auf autonome Bewegung, Lokalisierung und Umgebungswahrnehmung in einem ROS-basierten Workflow.",
    "ROS, SLAM, autonomy": "ROS, SLAM, Autonomie",
    "ROS, Gazebo, RViz": "ROS, Gazebo, RViz",
    "Robot middleware and integration": "Robotik-Middleware und Integration",
    "Robot scripting and workflow logic": "Roboterskripting und Workflow-Logik",
    "Localization and mapping": "Lokalisierung und Kartierung",
    "Gazebo": "Gazebo",
    "Robot simulation and environment testing": "Robotersimulation und Umgebungstests",
    "RViz": "RViz",
    "Visualization, debugging, and robot-state review": "Visualisierung, Debugging und Überprüfung des Roboterzustands",
    "Robot visualization and debugging workflow": "Workflow für Robotervisualisierung und Debugging",
    "WebSockets": "WebSockets",
    "Realtime communication for web-based tooling": "Echtzeitkommunikation für webbasierte Tools",
    "KEBA controller programming": "KEBA-Controller-Programmierung",
    "Controller-side programming and industrial execution logic": "Controllerseitige Programmierung und industrielle Ausführungslogik",
    "Sensor integration and I/O understanding": "Sensorintegration und Verständnis von I/O-Schnittstellen",
    "Middleware transition across existing and modern robot workflows": "Middleware-Übergang zwischen bestehenden und modernen Roboter-Workflows",
    "Simulation validation and robot program testing": "Simulationsvalidierung und Test von Roboterprogrammen",
    "Core robotics software, controller-side tooling, and communication stack used in the industrial thesis workflow.": "Zentrale Robotiksoftware, controllerseitige Werkzeuge und Kommunikations-Stack, die im industriellen Thesis-Workflow verwendet wurden.",
    "Create a robot capable of autonomous navigation while responding to environment changes and maintaining useful coverage behavior.": "Einen Roboter entwickeln, der autonom navigieren kann, auf Umweltänderungen reagiert und dabei ein sinnvolles Abdeckungsverhalten beibehält.",
    "SLAM-based localization.": "SLAM-basierte Lokalisierung.",
    "Obstacle detection and path planning.": "Hinderniserkennung und Pfadplanung.",
    "Sensor-driven decision flow.": "Sensorgetriebene Entscheidungslogik.",
    "This project shows practical robotics software integration across perception, navigation, and motion logic.": "Dieses Projekt zeigt praktische Integration von Robotiksoftware über Perception, Navigation und Bewegungslogik hinweg.",
    "It is one of the clearest academic-to-practical ROS projects in the portfolio.": "Es ist eines der klarsten ROS-Projekte im Portfolio, das den Übergang von akademischer Arbeit zur Praxis zeigt.",
    "VR Machine Operation Workshop": "VR-Werkstatt für Maschinenbedienung",
    "This project explored how immersive interaction can be used for machine-operation understanding, training flow, and simulation realism.": "Dieses Projekt untersuchte, wie immersive Interaktion für das Verständnis von Maschinenbedienung, Trainingsabläufe und realistische Simulation eingesetzt werden kann.",
    "Unity, VR, simulation": "Unity, VR, Simulation",
    "Training environment": "Trainingsumgebung",
    "Environment and interaction build": "Umgebungs- und Interaktionsaufbau",
    "Interaction and workflow logic": "Interaktions- und Workflow-Logik",
    "Immersive training workflow": "Immersiver Trainingsworkflow",
    "Develop a VR workshop environment that makes machine interaction more intuitive and realistic for user training.": "Eine VR-Werkstattumgebung entwickeln, die die Maschineninteraktion für das Nutzertraining intuitiver und realistischer macht.",
    "Environment design in Unity.": "Umgebungsdesign in Unity.",
    "Interactive user flow and machine-operation sequence design.": "Interaktiver Nutzerablauf und Gestaltung der Maschinenbedienungssequenz.",
    "Simulation-driven user experience thinking.": "Simulationsgetriebenes UX-Denken.",
    "The project shows cross-domain strength: simulation, interaction design, spatial thinking, and engineering communication through immersive systems.": "Das Projekt zeigt bereichsübergreifende Stärke: Simulation, Interaktionsdesign, räumliches Denken und technische Kommunikation durch immersive Systeme.",
    "It broadens the portfolio beyond classical robotics while staying close to industrial training and human-machine interaction.": "Es erweitert das Portfolio über klassische Robotik hinaus und bleibt zugleich nah an industriellem Training und Mensch-Maschine-Interaktion.",
    "Topology Optimized Temporary Bag Sealer": "Topologieoptimierter temporärer Beutelverschließer",
    "This project focused on reducing weight and material use through topology optimization while keeping the design practical for manufacturing.": "Dieses Projekt konzentrierte sich darauf, Gewicht und Materialeinsatz durch Topologieoptimierung zu reduzieren und das Design gleichzeitig fertigungsgerecht zu halten.",
    "Optimization for manufacturability": "Optimierung für Herstellbarkeit",
    "CAD modeling and design": "CAD-Modellierung und Konstruktion",
    "Structural evaluation": "Strukturelle Bewertung",
    "Weight and material reduction": "Gewichts- und Materialreduktion",
    "Use structural analysis and optimization methods to improve efficiency without losing functional strength.": "Strukturanalyse und Optimierungsmethoden einsetzen, um die Effizienz zu verbessern, ohne funktionale Festigkeit zu verlieren.",
    "Topology optimization workflow.": "Workflow zur Topologieoptimierung.",
    "Finite element analysis review.": "Überprüfung der Finite-Elemente-Analyse.",
    "Design adjustment for additive manufacturing readiness.": "Anpassung des Designs für additive Fertigungsreife.",
    "This project shows mechanical reasoning, analysis-driven design, and engineering trade-off handling.": "Dieses Projekt zeigt mechanisches Verständnis, analysegetriebenes Design und den Umgang mit technischen Zielkonflikten.",
    "It shows that my portfolio includes strong engineering fundamentals beyond software-only work.": "Es zeigt, dass mein Portfolio starke technische Grundlagen über reine Softwarearbeit hinaus umfasst.",
    "Automated Mechatronic Service Robot": "Automatisierter mechatronischer Serviceroboter",
    "This Arduino-based mechatronic robot was built during the pandemic period with the aim of supporting patient-care scenarios through safer assisted movement, reduced direct contact, and practical service delivery in a constrained environment.": "Dieser Arduino-basierte mechatronische Roboter wurde während der Pandemie entwickelt, um Patientenszenarien durch sicherere unterstützte Bewegung, reduzierten direkten Kontakt und praktische Servicelogik in einer begrenzten Umgebung zu unterstützen.",
    "Arduino and embedded robotics": "Arduino und Embedded-Robotik",
    "Controller and prototyping base": "Controller- und Prototyping-Basis",
    "Robot logic and control flow": "Roboterlogik und Steuerungsablauf",
    "Navigation and line tracking": "Navigation und Linienverfolgung",
    "The project was created in the context of the COVID-19 period, with the practical idea of using a service robot to support patient-care activity while reducing unnecessary person-to-person contact.": "Das Projekt entstand im Kontext der COVID-19-Zeit mit der praktischen Idee, einen Serviceroboter zur Unterstützung patientenbezogener Aufgaben einzusetzen und dabei unnötigen direkten Personenkontakt zu reduzieren.",
    "Arduino-based controller architecture for the robot workflow.": "Arduino-basierte Controller-Architektur für den Roboter-Workflow.",
    "Mechatronic integration of sensors, drive behavior, and movement control.": "Mechatronische Integration von Sensoren, Fahrverhalten und Bewegungssteuerung.",
    "Line-following and navigation logic for reliable guided motion.": "Logik für Linienverfolgung und Navigation zur zuverlässigen geführten Bewegung.",
    "Early robotics implementation focused on function, safety, and simplicity.": "Frühe Robotik-Umsetzung mit Fokus auf Funktion, Sicherheit und Einfachheit.",
    "This was not just a student hardware prototype. It was shaped around a socially relevant use case: helping with care-oriented service tasks during a time when reduced exposure and assisted delivery had real value.": "Dies war nicht nur ein studentischer Hardware-Prototyp. Es wurde rund um einen gesellschaftlich relevanten Anwendungsfall entwickelt: Unterstützung bei serviceorientierten Pflegeaufgaben in einer Zeit, in der reduzierte Exposition und unterstützte Übergabe einen echten Wert hatten.",
    "The project later received Best Bachelor Project recognition and also gained newspaper headline visibility, which strengthened it as both a technical and impact-oriented project in the portfolio.": "Das Projekt erhielt später die Auszeichnung als bestes Bachelorprojekt und bekam zudem Sichtbarkeit in der Presse, was es im Portfolio sowohl technisch als auch inhaltlich stärkte.",
    "It shows an early but meaningful robotics foundation: embedded control with Arduino, sensor-based navigation, robot behavior thinking, and the ability to connect engineering work to a real human-centered problem.": "Es zeigt eine frühe, aber bedeutende Grundlage in der Robotik: Embedded-Steuerung mit Arduino, sensorbasierte Navigation, Denken in Roboterverhalten und die Fähigkeit, technische Arbeit mit einem realen menschenzentrierten Problem zu verbinden.",
    "This project supports the current robotics profile because it demonstrates hands-on building, real-world motivation, autonomous movement logic, and recognized execution quality before the later move into ROS, simulation, and industrial robotics.": "Dieses Projekt stützt das heutige Robotikprofil, weil es praktischen Aufbau, reale Motivation, autonome Bewegungslogik und anerkannte Umsetzungsqualität bereits vor dem späteren Schritt zu ROS, Simulation und Industrierobotik zeigt."
  }
};

function loadSiteAnalytics() {
  if (window.__portfolioAnalyticsLoaded) {
    return;
  }

  window.__portfolioAnalyticsLoaded = true;

  if (GOOGLE_ANALYTICS_ID) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function gtag() {
      window.dataLayer.push(arguments);
    };

    const gaScript = document.createElement("script");
    gaScript.async = true;
    gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}`;
    document.head.appendChild(gaScript);

    window.gtag("js", new Date());
    window.gtag("config", GOOGLE_ANALYTICS_ID, {
      anonymize_ip: true,
      transport_type: "beacon"
    });
  }

  if (CLARITY_PROJECT_ID && typeof window.clarity !== "function") {
    (function(c, l, a, r, i, t, y) {
      c[a] = c[a] || function() {
        (c[a].q = c[a].q || []).push(arguments);
      };
      t = l.createElement(r);
      t.async = 1;
      t.src = `https://www.clarity.ms/tag/${i}`;
      y = l.getElementsByTagName(r)[0];
      y.parentNode.insertBefore(t, y);
    })(window, document, "clarity", "script", CLARITY_PROJECT_ID);
  }
}

function trackAnalyticsEvent(name, params = {}) {
  if (typeof window.gtag === "function") {
    window.gtag("event", name, params);
  }

  if (typeof window.clarity === "function") {
    try {
      window.clarity("event", name);
    } catch {
      // Ignore provider-specific event issues without breaking site behavior.
    }
  }
}

function setupAnalyticsClickTracking() {
  const trackedHrefPatterns = [
    /request-cv\.html/i,
    /feedback\.html/i,
    /journey\.html/i,
    /github\.com\/SoorajSudhakaran1199/i,
    /linkedin\.com\/in\/sooraj-sudhakaran1999/i,
    /^mailto:/i
  ];

  document.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target.closest("a, button") : null;
    if (!target) {
      return;
    }

    const href = target instanceof HTMLAnchorElement ? target.getAttribute("href") || "" : "";
    const text = (target.textContent || "").replace(/\s+/g, " ").trim().slice(0, 120);
    const normalizedHref = href ? new URL(href, window.location.href).toString() : "";
    const isTrackedButton = target.classList.contains("btn") || target.closest(".nav") || target instanceof HTMLButtonElement;
    const isTrackedLink = trackedHrefPatterns.some((pattern) => pattern.test(href));

    if (!isTrackedButton && !isTrackedLink) {
      return;
    }

    let eventName = "cta_click";
    if (/^mailto:/i.test(href)) {
      eventName = "contact_click";
    } else if (/request-cv\.html/i.test(href) || /request cv/i.test(text)) {
      eventName = "request_cv_click";
    } else if (/feedback\.html/i.test(href)) {
      eventName = "feedback_form_open";
    } else if (/journey\.html/i.test(href)) {
      eventName = "journey_open";
    } else if (/github\.com\/SoorajSudhakaran1199/i.test(href)) {
      eventName = "github_click";
    } else if (/linkedin\.com\/in\/sooraj-sudhakaran1999/i.test(href)) {
      eventName = "linkedin_click";
    } else if (target.closest(".nav")) {
      eventName = "navigation_click";
    }

    trackAnalyticsEvent(eventName, {
      page_path: window.location.pathname,
      link_text: text || "untitled",
      link_url: normalizedHref || window.location.href,
      interaction_type: target.tagName.toLowerCase()
    });
  }, true);
}

const META_TRANSLATIONS = {
  de: {
    title: {
      "Sooraj Sudhakaran | Robotics and Automation Engineer": "Sooraj Sudhakaran | Robotik- und Automatisierungsingenieur",
      "Sooraj Sudhakaran | Journey": "Sooraj Sudhakaran | Werdegang",
      "Request CV | Sooraj Sudhakaran": "CV anfragen | Sooraj Sudhakaran",
      "KEBA Group Industrial Robotics Experience | Sooraj Sudhakaran": "KEBA Group Industrierobotik-Erfahrung | Sooraj Sudhakaran",
      "Master's Thesis at KEBA Group | Sooraj Sudhakaran": "Masterarbeit bei KEBA Group | Sooraj Sudhakaran",
      "Non-Destructive Testing Technician | Sooraj Sudhakaran": "ZfP-Techniker | Sooraj Sudhakaran",
      "Active Suspension System Modeling | Sooraj Sudhakaran": "Modellierung eines aktiven Fahrwerks | Sooraj Sudhakaran",
      "Autonomous Vacuum Robot in ROS | Sooraj Sudhakaran": "Autonomer Staubsaugerroboter in ROS | Sooraj Sudhakaran",
      "VR Machine Operation Workshop | Sooraj Sudhakaran": "VR-Werkstatt für Maschinenbedienung | Sooraj Sudhakaran",
      "Topology Optimized Temporary Bag Sealer | Sooraj Sudhakaran": "Topologieoptimierter temporärer Beutelverschließer | Sooraj Sudhakaran",
      "Automated Mechatronic Service Robot | Sooraj Sudhakaran": "Automatisierter mechatronischer Serviceroboter | Sooraj Sudhakaran"
    },
    description: {
      "Portfolio of Sooraj Sudhakaran, a robotics and automation engineer in Germany focused on ROS, industrial robotics, motion planning, simulation, and deployment-ready systems.": "Portfolio von Sooraj Sudhakaran, Robotik- und Automatisierungsingenieur in Deutschland mit Fokus auf ROS, Industrierobotik, Motion Planning, Simulation und einsatzreife Systeme.",
      "The academic and professional journey of Sooraj Sudhakaran, from school achievements in India to mechatronics and industrial robotics work in Germany.": "Der akademische und berufliche Werdegang von Sooraj Sudhakaran, von schulischen Erfolgen in Indien bis zu Mechatronik und Industrierobotik in Deutschland.",
      "Request the latest CV of Sooraj Sudhakaran through a structured website form. Submit your email address and the requested CV will be sent by email.": "Fordern Sie den aktuellen CV von Sooraj Sudhakaran ueber ein strukturiertes Website-Formular an. Geben Sie Ihre E-Mail-Adresse an, damit der angeforderte CV per E-Mail gesendet werden kann.",
      "Combined KEBA Group experience page covering working student work, master's thesis context, industrial robotics training, and exhibition participation.": "Kombinierte Erfahrungsseite zur KEBA Group mit Werkstudententätigkeit, Masterarbeitskontext, Training in Industrierobotik und Messebeteiligung.",
      "Detailed case study for Sooraj Sudhakaran's master's thesis in industrial robotics at KEBA Group.": "Detaillierte Fallstudie zu Sooraj Sudhakarans Masterarbeit in Industrierobotik bei KEBA Group.",
      "Detailed experience page for Sooraj Sudhakaran's role as a Non-Destructive Testing Technician.": "Detaillierte Erfahrungsseite zu Sooraj Sudhakarans Rolle als ZfP-Techniker.",
      "Detailed project page for active suspension system modeling in MATLAB Simulink.": "Detaillierte Projektseite zur Modellierung eines aktiven Fahrwerks in MATLAB Simulink.",
      "Detailed project page for an autonomous vacuum robot built in ROS.": "Detaillierte Projektseite zu einem autonomen Staubsaugerroboter in ROS.",
      "Detailed project page for the VR machine operation workshop built in Unity.": "Detaillierte Projektseite zur in Unity entwickelten VR-Werkstatt für Maschinenbedienung.",
      "Detailed project page for topology optimization and FEA-driven design work.": "Detaillierte Projektseite zu Topologieoptimierung und FEA-gestützter Designarbeit.",
      "Detailed page for the award-winning automated mechatronic service robot project built as a healthcare-support concept during the pandemic period.": "Detaillierte Seite zum ausgezeichneten Projekt eines automatisierten mechatronischen Serviceroboters, entwickelt als Unterstützungskonzept im Gesundheitsbereich während der Pandemie."
    }
  }
};

Object.assign(LANGUAGE_TEXT.de, {
  "Explore by topic": "Nach Themen erkunden",
  "Direct paths for industrial robotics, ROS projects, simulation work, and recruiter review.": "Direkte Wege zu Industrierobotik, ROS-Projekten, Simulationsarbeit und Recruiter-Kontext.",
  "Industrial robotics": "Industrierobotik",
  "Thesis, deployment workflow, and KEBA experience": "Thesis, Deployment-Workflow und KEBA-Erfahrung",
  "Best if you are searching for industrial robotics thesis work, robot programming, deployment-oriented planning, or KEBA Group context.": "Ideal, wenn Sie nach einer Masterarbeit in Industrierobotik, Roboterprogrammierung, einsatzorientierter Planung oder KEBA-Group-Kontext suchen.",
  "ROS and autonomy": "ROS und Autonomie",
  "Autonomous systems and robotics software work": "Autonome Systeme und Robotik-Softwarearbeit",
  "Best if you are looking for ROS projects, autonomous robot behavior, simulation workflow, or robotics software integration.": "Ideal, wenn Sie nach ROS-Projekten, autonomem Roboterverhalten, Simulations-Workflows oder Robotik-Softwareintegration suchen.",
  "Simulation and controls": "Simulation und Regelung",
  "Simulation, VR, and engineering analysis": "Simulation, VR und technische Analyse",
  "Best if you want immersive simulation work, control-system modeling, optimization, or multi-domain engineering examples.": "Ideal, wenn Sie immersive Simulation, Regelungsmodellierung, Optimierung oder bereichsuebergreifende Engineering-Beispiele suchen.",
  "Portfolio navigation": "Portfolio-Navigation",
  "Use the portfolio map and contact pages": "Portfolio-Map und Kontaktseiten nutzen",
  "Best if you want a full crawlable overview of the portfolio, direct recruiter contact, or the structured feedback and contact form.": "Ideal, wenn Sie eine vollstaendig crawlbare Uebersicht des Portfolios, direkten Recruiter-Kontakt oder das strukturierte Feedback- und Kontaktformular suchen.",
  "Open portfolio map": "Portfolio-Map oeffnen",
  "View topic links": "Themenlinks anzeigen",
  "Open to see direct paths across the portfolio.": "Oeffnen, um direkte Wege durch das Portfolio zu sehen.",
  "Common portfolio questions": "Haeufige Portfolio-Fragen",
  "Direct answers for the main topics recruiters, engineering teams, and search visitors usually look for first.": "Direkte Antworten auf die Hauptthemen, nach denen Recruiter, Engineering-Teams und Suchbesucher meistens zuerst suchen.",
  "View common questions": "Haeufige Fragen anzeigen",
  "Open to see recruiter and search-friendly answers.": "Oeffnen, um recruiter- und suchfreundliche Antworten zu sehen.",
  "Where can I find the industrial robotics thesis?": "Wo finde ich die Masterarbeit in Industrierobotik?",
  "You can find the industrial robotics thesis in the Experience section of the portfolio and directly on the master's thesis page. That page covers the thesis work, planning-to-deployment workflow, and industrial robotics context in full detail.": "Sie finden die Masterarbeit in Industrierobotik im Bereich Erfahrung des Portfolios und direkt auf der Thesis-Seite. Diese Seite zeigt die Thesis-Arbeit, den Workflow von Planung bis Deployment und den Kontext der Industrierobotik im Detail.",
  "Open experience section": "Erfahrungsbereich oeffnen",
  "Which ROS and autonomous robotics projects are included?": "Welche ROS- und autonomen Robotikprojekte sind enthalten?",
  "The main ROS page is the autonomous vacuum robot project. The service robot project adds another robotics systems example, and the journey page gives the broader developer and robotics profile.": "Die zentrale ROS-Seite ist das Projekt zum autonomen Staubsaugerroboter. Das Serviceroboter-Projekt ergänzt ein weiteres Robotiksystem-Beispiel, und die Journey-Seite zeigt das breitere Entwickler- und Robotikprofil.",
  "Does this portfolio include robotics and automation experience in Germany?": "Enthaelt dieses Portfolio Robotik- und Automatisierungserfahrung in Deutschland?",
  "Yes. The website includes KEBA Group experience in Stuttgart, industrial robotics thesis work, and a journey page showing the transition from India to Germany in academic and professional context.": "Ja. Die Website enthaelt KEBA-Group-Erfahrung in Stuttgart, eine Masterarbeit in Industrierobotik und eine Journey-Seite, die den Wechsel von Indien nach Deutschland im akademischen und beruflichen Kontext zeigt.",
  "Is this portfolio relevant for robotics, automation, simulation, and controls roles?": "Ist dieses Portfolio relevant fuer Rollen in Robotik, Automatisierung, Simulation und Regelung?",
  "Yes. The portfolio combines industrial robotics, ROS software work, simulation, VR, controls, optimization, and recruiter-ready contact paths for direct outreach.": "Ja. Das Portfolio kombiniert Industrierobotik, ROS-Softwarearbeit, Simulation, VR, Regelung, Optimierung und Recruiter-taugliche Kontaktwege fuer direkte Anfragen.",
  "Review skills": "Skills ansehen",
  "Open contact section": "Kontaktbereich oeffnen",
  "Portfolio Map": "Portfolio-Map",
  "Portfolio map": "Portfolio-Map",
  "Portfolio view switch": "Portfolio-Ansicht umschalten",
  "Detailed portfolio": "Detailliertes Portfolio",
  "Use this page to explore the full portfolio structure.": "Nutzen Sie diese Seite, um die vollstaendige Portfoliostruktur zu erkunden.",
  "This page links the main robotics, industrial automation, thesis, project, journey, and contact pages of the website in one crawlable overview.": "Diese Seite verlinkt die wichtigsten Robotik-, Industrieautomatisierungs-, Thesis-, Projekt-, Werdegangs- und Kontaktseiten der Website in einer crawlbaren Uebersicht.",
  "Use the map for a fast structured overview of the main robotics, industrial automation, thesis, project, journey, and contact pages. Open the detailed portfolio when you want the full evidence and longer explanations.": "Nutzen Sie die Map fuer einen schnellen strukturierten Ueberblick ueber die wichtigsten Seiten zu Robotik, Industrieautomatisierung, Thesis, Projekten, Werdegang und Kontakt. Oeffnen Sie das detaillierte Portfolio, wenn Sie die vollstaendigen Nachweise und ausfuehrlicheren Erlaeuterungen sehen moechten.",
  "Open detailed portfolio": "Detailliertes Portfolio oeffnen",
  "Use the detailed portfolio for the full project, experience, and recruiter-ready context.": "Nutzen Sie das detaillierte Portfolio fuer die vollstaendige Projekt-, Erfahrungs- und recruiter-taugliche Einordnung.",
  "Best entry points": "Beste Einstiegsseiten",
  "Start here if you want the strongest pages first.": "Beginnen Sie hier, wenn Sie zuerst die staerksten Seiten sehen moechten.",
  "Industrial robotics thesis": "Masterarbeit in Industrierobotik",
  "The strongest page for industrial robotics thesis work, deployment-oriented thinking, and robot programming context.": "Die staerkste Seite fuer eine Masterarbeit in Industrierobotik, einsatzorientiertes Denken und Kontext zur Roboterprogrammierung.",
  "Open thesis page": "Thesis-Seite oeffnen",
  "KEBA industrial robotics experience": "KEBA-Erfahrung in Industrierobotik",
  "Best page for working student exposure, industrial robotics context, training, and exhibition participation.": "Die beste Seite fuer Werkstudentenerfahrung, Industrierobotik-Kontext, Training und Messeteilnahme.",
  "Open KEBA experience": "KEBA-Erfahrung oeffnen",
  "ROS and autonomous systems": "ROS und autonome Systeme",
  "Best page for ROS workflow, autonomous robot behavior, localization, and simulation-led robotics software work.": "Die beste Seite fuer ROS-Workflows, autonomes Roboterverhalten, Lokalisierung und simulationsgestuetzte Robotik-Softwarearbeit.",
  "Open ROS project": "ROS-Projekt oeffnen",
  "Comment visibility": "Kommentarsichtbarkeit",
  "Choose public or private comment": "Oeffentlichen oder privaten Kommentar waehlen",
  "This selection is required for feedback comments": "Diese Auswahl ist fuer Feedback-Kommentare erforderlich",
  "Private comment": "Privater Kommentar",
  "Your comment stays visible only to Sooraj Sudhakaran.": "Ihr Kommentar bleibt nur fuer Sooraj Sudhakaran sichtbar.",
  "Publish on website": "Auf der Website veroeffentlichen",
  "After writing a feedback comment, choose whether it stays private or can appear publicly with your name and country.": "Nachdem Sie einen Feedback-Kommentar geschrieben haben, waehlen Sie, ob er privat bleibt oder mit Ihrem Namen und Land oeffentlich angezeigt werden darf.",
  "View public comments": "Oeffentliche Kommentare ansehen",
  "Experience pages": "Erfahrungsseiten",
  "Professional and academic experience pages related to robotics, industrial automation, and engineering practice.": "Berufliche und akademische Erfahrungsseiten zu Robotik, Industrieautomatisierung und technischer Praxis.",
  "Project pages": "Projektseiten",
  "Robotics, VR, controls, optimization, and mechatronic project pages.": "Projektseiten zu Robotik, VR, Regelung, Optimierung und mechatronischen Systemen.",
  "Contact and navigation": "Kontakt und Navigation",
  "Direct links for recruiter contact, feedback, and profile review.": "Direkte Links fuer Recruiter-Kontakt, Feedback und Profilpruefung.",
  "Contact paths": "Kontaktwege",
  "Public profile links": "Oeffentliche Profil-Links",
  "Related pages for industrial robotics context": "Verwandte Seiten fuer den Kontext Industrierobotik",
  "Use these pages if you want the surrounding recruiter context, industrial robotics experience, or the full portfolio map.": "Nutzen Sie diese Seiten fuer weiteren Recruiter-Kontext, Industrierobotik-Erfahrung oder die vollstaendige Portfolio-Map.",
  "Related pages for ROS and robotics context": "Verwandte Seiten fuer ROS- und Robotik-Kontext",
  "Use these pages if you want the broader robotics profile, industrial robotics thesis context, or a full overview of the portfolio structure.": "Nutzen Sie diese Seiten fuer das breitere Robotikprofil, den Kontext der Industrierobotik-Thesis oder eine vollstaendige Uebersicht der Portfoliostruktur.",
  "Recent work shaped by real industrial context, robotics implementation, and practical engineering responsibility.": "Aktuelle Arbeit, geprägt von realem industriellem Kontext, Robotikumsetzung und praktischer technischer Verantwortung.",
  "Current professional direction": "Aktuelle berufliche Ausrichtung",
  "Portfolio work spanning robotics, immersive simulation, optimization, and mechatronic systems.": "Portfolioarbeit aus Robotik, immersiver Simulation, Optimierung und mechatronischen Systemen.",
  "Academic progression from mechanical engineering into mechatronics and cyber-physical systems.": "Akademische Entwicklung vom Maschinenbau hin zu Mechatronik und cyber-physischen Systemen.",
  "Robotics Certificate": "Robotik-Zertifikat",
  "Telerobotics": "Telerobotik",
  "Additional robotics learning supporting remote operation and systems understanding.": "Ergänzende Robotik-Weiterbildung zur Unterstützung von Fernbedienung und Systemverständnis.",
  "Quality Certification": "Qualitätszertifizierung",
  "Industrial Practice": "Industrielle Praxis",
  "Process Piping and Quality Control": "Prozessrohrleitungsbau und Qualitätskontrolle",
  "Supporting knowledge in industrial process quality and engineering practice.": "Ergänzendes Wissen zu industrieller Prozessqualität und technischer Praxis.",
  "Mechatronics Training": "Mechatronik-Training",
  "Internship in Mechatronics": "Praktikum in Mechatronik",
  "Relevant training in mechatronics fundamentals and interdisciplinary systems thinking.": "Relevantes Training in mechatronischen Grundlagen und interdisziplinärem Systemdenken.",
  "KEBA Validation": "KEBA-Nachweis",
  "Industrial Thesis or Internship Certificate, KEBA Group": "Industrie-Thesis- oder Praktikumszertifikat, KEBA Group",
  "Direct industrial validation tied to the robotics and automation phase of the portfolio.": "Direkter Industrienachweis im Zusammenhang mit der Robotik- und Automatisierungsphase des Portfolios.",
  "Design Tooling": "Design-Tooling",
  "AutoCAD Workshop": "AutoCAD-Workshop",
  "Additional design tooling exposure supporting engineering drafting and technical preparation.": "Zusätzliche Erfahrung mit Design-Tools zur Unterstützung technischer Zeichnung und fachlicher Vorbereitung.",
  "Safety Training": "Sicherheitstraining",
  "Robotics safety regulation and real robot workshop training": "Training zu Robotersicherheitsvorschriften und Realroboter-Workshop",
  "Hands-on robotics safety training conducted with the KEBA and drag&bot team, focused on safety expectations, workshop practice, and real robot operation in an industrial setting.": "Praxisnahes Robotiksicherheitstraining mit dem KEBA- und drag&bot-Team, mit Fokus auf Sicherheitsanforderungen, Werkstattpraxis und den Betrieb realer Roboter im industriellen Umfeld.",
  "View Details": "Details ansehen",
  "KEBA Training": "KEBA-Training",
  "KEBA robotic HMI and controller training": "KEBA-Training zu robotischem HMI und Controller",
  "Internal KEBA Group training covering robotic HMI interaction, controller understanding, and practical system familiarity.": "Internes Training der KEBA Group zu robotischer HMI-Interaktion, Controller-Verständnis und praktischer Systemvertrautheit.",
  "Professional Communication": "Professionelle Kommunikation",
  "Project presentations to international team members": "Projektpräsentationen für internationale Teammitglieder",
  "Presented and explained robotics-related project work within KEBA Group Stuttgart to international team members, strengthening technical communication in a multicultural engineering environment.": "Robotikbezogene Projektarbeit innerhalb der KEBA Group Stuttgart internationalen Teammitgliedern präsentiert und erläutert und damit die technische Kommunikation in einem multikulturellen Engineering-Umfeld gestärkt.",
  "Exhibition Participation": "Messeteilnahme",
  "Participated in the SPS Nuremberg 2025 exhibition as part of the KEBA booth presence.": "An der SPS Nuremberg 2025 als Teil des KEBA-Messestands teilgenommen.",
  "Participated in Exhibition as KEBA Group": "Teilnahme an der Messe als Teil der KEBA Group",
  "embedded world 2026, Nuremberg": "embedded world 2026, Nürnberg",
  "Visited embedded world 2026 in Nuremberg as a visitor for exposure to industrial automation, embedded systems, and product-oriented engineering trends.": "Die embedded world 2026 in Nürnberg als Besucher besucht, um Einblicke in industrielle Automatisierung, Embedded Systems und produktorientierte Engineering-Trends zu gewinnen.",
  "March 10 to 12, 2026": "10. bis 12. März 2026",
  "Nuremberg": "Nürnberg",
  "Participated in the LogiMAT Stuttgart 2026 exhibition as part of the KEBA booth presence for intralogistics and automation solutions.": "An der LogiMAT Stuttgart 2026 als Teil des KEBA-Messestands für Intralogistik- und Automatisierungslösungen teilgenommen.",
  "Signals of leadership, recognition, and direction beyond course lists and tool names.": "Signale für Führung, Anerkennung und fachliche Richtung über Kurslisten und Toolnamen hinaus.",
  "Recognized in 2021 for an automated mechatronic robot developed for hospitality service enhancement.": "2021 für einen automatisierten mechatronischen Roboter ausgezeichnet, der zur Verbesserung von Serviceabläufen entwickelt wurde.",
  "Served in leadership roles within the Mechanical Engineering Department Association, building coordination and communication skills early.": "Früh Führungsrollen in der Fachschaft Maschinenbau übernommen und dadurch Koordinations- und Kommunikationsfähigkeiten aufgebaut.",
  "Industrial Robotics Thesis Experience": "Erfahrung aus einer Masterarbeit in Industrierobotik",
  "Worked in a real industrial automation context involving robot programming, cell constraints, and deployment-oriented thinking.": "In einem realen industriellen Automatisierungskontext gearbeitet, mit Roboterprogrammierung, Zellgrenzen und einsatzorientiertem Denken.",
  "Multi-domain Profile": "Bereichsübergreifendes Profil",
  "Built work across robotics, VR training, CAD optimization, simulation, and mechatronic systems rather than staying in a single narrow lane.": "Arbeit über Robotik, VR-Training, CAD-Optimierung, Simulation und mechatronische Systeme hinweg aufgebaut, statt in einem engen Bereich zu bleiben.",
  "The story behind the profile matters here: school foundation, leadership, the move to Germany, and the shift into industrial robotics.": "Die Geschichte hinter dem Profil ist hier wichtig: schulische Grundlage, Führung, der Wechsel nach Deutschland und der Übergang in die Industrierobotik.",
  "The portfolio is stronger when the transition is visible. This path runs from CBSE school roots and engineering leadership in India to master’s study, thesis work, and robotics experience in Germany.": "Das Portfolio wird stärker, wenn der Übergang sichtbar ist. Dieser Weg reicht von den CBSE-Schulwurzeln und technischer Führung in Indien bis zu Masterstudium, Thesis-Arbeit und Robotikerfahrung in Deutschland.",
  "98% in 10th": "98 % in der 10. Klasse",
  "Leadership roles": "Führungsrollen",
  "Best project recognition": "Auszeichnung für das beste Projekt",
  "Germany transition": "Wechsel nach Deutschland",
  "Explore the full journey": "Den vollständigen Werdegang ansehen",
  "Open the full journey page to see the India-to-Germany transition, milestones, travel footprint, and the full story behind the portfolio.": "Öffnen Sie die vollständige Werdegangsseite, um den Übergang von Indien nach Deutschland, die Meilensteine, das Reiseprofil und die ganze Geschichte hinter dem Portfolio zu sehen.",
  "Open Full Journey": "Vollständigen Werdegang öffnen",
  "Required for recruiter context": "Wichtig für den Recruiter-Kontext",
  "Reviews and rating": "Bewertungen und Gesamtbewertung",
  "Public feedback summary for the portfolio experience.": "Öffentliche Zusammenfassung der Bewertungen und Rückmeldungen zum Portfolio.",
  "Public feedback": "Öffentliches Feedback",
  "Portfolio reception": "Resonanz auf das Portfolio",
  "A quick view of structured feedback, average rating, and website reach based on submitted reviews.": "Ein kompakter Überblick über strukturiertes Feedback, die Durchschnittsbewertung und die Reichweite der Website auf Basis eingereichter Bewertungen.",
  "Awaiting first rated review.": "Noch keine bewertete Rückmeldung vorhanden.",
  "Overall rating": "Gesamtbewertung",
  "Reviews received": "Erhaltene Bewertungen",
  "Website reach": "Reichweite der Website",
  "Rating distribution": "Bewertungsverteilung",
  "Based on submitted feedback": "Basierend auf eingereichtem Feedback",
  "Top reach": "Top-Länder",
  "Countries reached": "Erreichte Länder",
  "No public reviews yet.": "Noch keine öffentlichen Bewertungen.",
  "Fast access for recruiters, collaborators, and engineering teams.": "Schneller Zugang für Recruiter, Kooperationspartner und Engineering-Teams.",
  "Professional contact options for recruiters, collaborators, and engineering teams.": "Professionelle Kontaktoptionen für Recruiter, Kooperationspartner und Engineering-Teams.",
  "Professional details": "Berufliche Angaben",
  "Business contact": "Geschäftlicher Kontakt",
  "Contact and hiring enquiries": "Kontakt- und Recruiting-Anfragen",
  "For recruiter outreach, collaboration requests, CV enquiries, or technical discussions, email remains the fastest and most reliable contact channel.": "Fuer Recruiter-Anfragen, Kooperationsanfragen, CV-Anfragen oder technische Gespraeche bleibt E-Mail der schnellste und verlaesslichste Kontaktkanal.",
  "Primary channel": "Primärer Kanal",
  "Direct email contact": "Direkter E-Mail-Kontakt",
  "Typical use": "Typischer Einsatz",
  "Recruiter outreach, collaboration, and CV requests": "Recruiter-Anfragen, Zusammenarbeit und CV-Anfragen",
  "Response approach": "Rückmeldungsansatz",
  "Professional enquiries are reviewed carefully and followed up when relevant.": "Professionelle Anfragen werden sorgfaeltig geprueft und bei Relevanz weiterverfolgt.",
  "Profiles": "Profile",
  "Languages": "Sprachen",
  "English (C1), German (A2), Malayalam (Native)": "Englisch (C1), Deutsch (A2), Malayalam (Muttersprache)",
  "See Full Journey": "Vollständigen Werdegang ansehen",
  "Email": "E-Mail",
  "Core professional details for direct contact, role alignment, and profile review.": "Wichtige berufliche Angaben fuer direkten Kontakt, Rollenabgleich und Profilpruefung.",
  "Website feedback": "Website-Feedback",
  "Use the structured feedback form for website comments": "Verwenden Sie das strukturierte Feedback-Formular fuer Website-Kommentare",
  "Share portfolio feedback, content corrections, translation notes, or design suggestions through the dedicated form.": "Teilen Sie Portfolio-Feedback, Inhaltskorrekturen, Uebersetzungshinweise oder Designvorschlaege ueber das dafuer vorgesehene Formular.",
  "For comments about the portfolio, content, translation, or design, use the dedicated feedback form.": "Fuer Kommentare zum Portfolio, zu Inhalten, Uebersetzungen oder zum Design verwenden Sie bitte das dafuer vorgesehene Feedback-Formular.",
  "Focus areas": "Fokusbereiche",
  "Robotics, automation, Unity simulation, controls": "Robotik, Automatisierung, Unity-Simulation, Steuerungstechnik",
  "Feedback": "Feedback",
  "Feedback and contact form": "Feedback- und Kontaktformular",
  "Feedback navigation": "Feedback-Navigation",
  "Overview": "Überblick",
  "Feedback form": "Feedback-Formular",
  "Privacy": "Privatsphäre",
  "Feedback and contact": "Feedback und Kontakt",
  "Send feedback or contact me directly.": "Senden Sie Feedback oder kontaktieren Sie mich direkt.",
  "Use this page to share feedback about the portfolio or send a direct contact request. The form submits directly through the website and is not posted publicly.": "Nutzen Sie diese Seite, um Feedback zum Portfolio zu geben oder eine direkte Kontaktanfrage zu senden. Das Formular wird direkt ueber die Website uebermittelt und nicht oeffentlich veroeffentlicht.",
    "Add your review": "Eigene Bewertung hinzufuegen",
    "Join the conversation": "Am Gespraech teilnehmen",
    "Add a public review or send a private message.": "Fuegen Sie eine oeffentliche Bewertung hinzu oder senden Sie eine private Nachricht.",
    "Publish your review for visitors, or use the contact form for direct professional outreach.": "Veroeffentlichen Sie Ihre Bewertung fuer Besucher oder nutzen Sie das Kontaktformular fuer direkte professionelle Anfragen.",
    "Featured reviews": "Hervorgehobene Bewertungen",
    "Admin-pinned reviews shown directly on the homepage": "Vom Admin fixierte Bewertungen, die direkt auf der Startseite gezeigt werden.",
    "Published reviews": "Veroeffentlichte Bewertungen",
    "Show all reviews": "Alle Bewertungen anzeigen",
    "Read public reviews": "Oeffentliche Bewertungen lesen",
    "Read every published review and owner reply": "Alle veroeffentlichten Bewertungen und sichtbaren Antworten lesen",
    "Read public reviews and visible owner replies": "Oeffentliche Bewertungen und sichtbare Antworten des Website-Betreibers lesen",
    "Review archive": "Bewertungsarchiv",
    "No featured reviews yet.": "Noch keine hervorgehobenen Bewertungen.",
    "No archived reviews yet.": "Noch keine archivierten Bewertungen.",
    "Open Feedback Form": "Feedback-Formular öffnen",
  "Open feedback form": "Feedback-Formular oeffnen",
  "Open contact form": "Kontaktformular oeffnen",
  "Guidance": "Hinweise",
  "Before you submit": "Vor dem Absenden",
  "Short notes for using this form correctly.": "Kurze Hinweise zur korrekten Nutzung dieses Formulars.",
  "Select feedback or contact to start.": "Waehlen Sie Feedback oder Kontakt, um zu starten.",
  "Choose a form.": "Waehlen Sie ein Formular.",
  "Choose the form you want to open.": "Waehlen Sie das Formular, das Sie oeffnen moechten.",
  "Use feedback for website comments and reviews. Use contact for direct professional enquiries.": "Verwenden Sie Feedback fuer Website-Kommentare und Bewertungen. Verwenden Sie Kontakt fuer direkte professionelle Anfragen.",
  "Direct website submission": "Direkte Website-Uebermittlung",
  "Both forms are sent through the website. Contact stays private. Reviews become public only if you allow it.": "Beide Formulare werden ueber die Website uebermittelt. Kontakt bleibt privat. Bewertungen werden nur oeffentlich, wenn Sie es erlauben.",
  "Choose one option to open the correct form. Contact stays private. Reviews are public only if you allow it.": "Waehlen Sie eine Option, um das passende Formular zu oeffnen. Kontakt bleibt privat. Bewertungen sind nur dann oeffentlich, wenn Sie es erlauben.",
  "Comments, corrections, suggestions, reviews": "Kommentare, Korrekturen, Vorschlaege, Bewertungen",
  "Recruiter message, collaboration, enquiry": "Recruiter-Nachricht, Zusammenarbeit, Anfrage",
  "Choose the right path": "Den richtigen Weg waehlen",
  "Choose feedback or contact.": "Feedback oder Kontakt waehlen.",
  "Use the feedback form for website comments and portfolio suggestions, or choose the contact form for direct professional enquiries. Both go directly through the website.": "Verwenden Sie das Feedback-Formular fuer Website-Kommentare und Portfolio-Vorschlaege oder das Kontaktformular fuer direkte professionelle Anfragen. Beide Wege gehen direkt ueber die Website.",
  "Submission method": "Uebermittlungsweg",
  "Website form": "Website-Formular",
  "Sent directly through the website.": "Direkt ueber die Website uebermittelt.",
  "Direct submission": "Direkte Uebermittlung",
  "Your message is sent straight through the website.": "Ihre Nachricht wird direkt ueber die Website gesendet.",
  "Private by default": "Standardmaessig privat",
  "Visibility": "Sichtbarkeit",
  "Public only if you choose to publish a review.": "Oeffentlich nur, wenn Sie eine Bewertung zur Veroeffentlichung freigeben.",
  "Nothing is public unless you explicitly publish a review.": "Nichts wird oeffentlich sichtbar, ausser Sie geben eine Bewertung ausdruecklich frei.",
  "Process": "Ablauf",
  "Choose, complete, submit": "Waehlen, ausfuellen, absenden",
  "Select the right form, add details, and send.": "Das passende Formular waehlen, Angaben ausfuellen und absenden.",
  "Clear next step": "Klarer naechster Schritt",
  "Choose the correct form, complete the details, and submit.": "Waehlen Sie das richtige Formular, fuellen Sie die Angaben aus und senden Sie es ab.",
  "Choose a form below": "Unten ein Formular waehlen",
  "How it works": "So funktioniert es",
  "Review how this form works before you start.": "Pruefen Sie vor dem Start, wie dieses Formular funktioniert.",
  "View guidance": "Hinweise anzeigen",
  "Show notes": "Hinweise anzeigen",
  "Click to expand": "Zum Oeffnen klicken",
  "Required fields are marked with a red star.": "Pflichtfelder sind mit einem roten Stern markiert.",
  "Select either the feedback form or the contact form before filling details.": "Waehlen Sie vor dem Ausfuellen entweder das Feedback-Formular oder das Kontaktformular.",
  "Your message is submitted through the website and is not posted publicly.": "Ihre Nachricht wird ueber die Website uebermittelt und nicht oeffentlich angezeigt.",
  "Your message is private by default unless you choose to publish it as a public review.": "Ihre Nachricht bleibt standardmaessig privat, sofern Sie sie nicht als oeffentliche Bewertung freigeben.",
  "Feedback or direct contact": "Feedback oder direkter Kontakt",
  "You can use the form for website feedback or a direct contact request.": "Sie koennen das Formular fuer Website-Feedback oder eine direkte Kontaktanfrage verwenden.",
  "The form submits directly through the website without opening your email app.": "Das Formular wird direkt ueber die Website uebermittelt, ohne Ihre E-Mail-App zu oeffnen.",
  "It is not posted publicly on the website.": "Es wird nicht öffentlich auf der Website veröffentlicht.",
  "Submitted messages are delivered to the site owner for review and follow-up.": "Uebermittelte Nachrichten werden dem Website-Betreiber zur Pruefung und Rueckmeldung zugestellt.",
  "Use this form for professional feedback, recruiter outreach, or direct contact. Required fields are marked with a red star.": "Verwenden Sie dieses Formular fuer professionelles Feedback, Recruiter-Anfragen oder direkten Kontakt. Pflichtfelder sind mit einem roten Stern markiert.",
  "Step 1": "Schritt 1",
  "Select message type": "Nachrichtentyp waehlen",
  "Open": "Oeffnen",
  "Click to continue": "Zum Fortfahren klicken",
  "Choose whether you want to open the feedback form or the contact form.": "Waehlen Sie, ob Sie das Feedback-Formular oder das Kontaktformular oeffnen moechten.",
  "Share website feedback, design comments, corrections, or suggestions.": "Teilen Sie Website-Feedback, Designhinweise, Korrekturen oder Vorschlaege mit.",
  "Send a direct professional enquiry, recruiter message, or collaboration request.": "Senden Sie eine direkte professionelle Anfrage, eine Recruiter-Nachricht oder eine Anfrage zur Zusammenarbeit.",
  "A clear path from choosing the right form to sending the message correctly.": "Ein klarer Ablauf von der richtigen Formularwahl bis zur korrekten Uebermittlung Ihrer Nachricht.",
  "How this page works": "So funktioniert diese Seite",
  "Choose feedback form for website comments, corrections, suggestions, and public reviews.": "Waehlen Sie das Feedback-Formular fuer Website-Kommentare, Korrekturen, Vorschlaege und oeffentliche Bewertungen.",
  "Choose contact form for recruiter outreach, collaboration, or direct professional enquiries.": "Waehlen Sie das Kontaktformular fuer Recruiter-Anfragen, Zusammenarbeit oder direkte professionelle Anfragen.",
  "Complete the required fields marked with a red star and submit directly through the website.": "Fuellen Sie die mit einem roten Stern markierten Pflichtfelder aus und senden Sie direkt ueber die Website ab.",
  "Privacy and visibility": "Privatsphaere und Sichtbarkeit",
  "Private by default. Public only if you choose it.": "Standardmaessig privat. Oeffentlich nur, wenn Sie es auswaehlen.",
  "Simple rules for what stays private and what can appear publicly.": "Einfache Regeln dazu, was privat bleibt und was oeffentlich erscheinen kann.",
  "Private messages": "Private Nachrichten",
  "Contact requests stay private and are visible only to Sooraj Sudhakaran.": "Kontaktanfragen bleiben privat und sind nur fuer Sooraj Sudhakaran sichtbar.",
  "Contact requests stay private.": "Kontaktanfragen bleiben privat.",
  "Feedback comments appear publicly only if you choose the public review option yourself.": "Feedback-Kommentare erscheinen nur dann oeffentlich, wenn Sie selbst die Option fuer eine oeffentliche Bewertung auswaehlen.",
  "Feedback is public only when you select Public.": "Feedback ist nur dann oeffentlich, wenn Sie Oeffentlich auswaehlen.",
  "What gets shown": "Was angezeigt wird",
  "Public reviews can show your name, country, rating, and comment for other visitors to read.": "Oeffentliche Bewertungen koennen Ihren Namen, Ihr Land, Ihre Bewertung und Ihren Kommentar fuer andere Besucher anzeigen.",
  "Shown publicly": "Oeffentlich sichtbar",
  "Name, country, rating, and comment.": "Name, Land, Bewertung und Kommentar.",
  "Choose message type": "Nachrichtentyp waehlen",
  "Select either Feedback form or Contact form to continue.": "Waehlen Sie zum Fortfahren entweder das Feedback-Formular oder das Kontaktformular.",
  "Use this form to send a direct contact request. Only the essential business details are required.": "Verwenden Sie dieses Formular fuer eine direkte Kontaktanfrage. Es werden nur die wesentlichen geschaeftlichen Angaben abgefragt.",
  "Contact form": "Kontaktformular",
  "This form submits your details directly through the website. Nothing is published publicly.": "Dieses Formular uebermittelt Ihre Angaben direkt ueber die Website. Nichts wird oeffentlich veroeffentlicht.",
  "Form sections": "Formularabschnitte",
  "Your details": "Ihre Angaben",
  "Provide the sender details that should appear in the message.": "Geben Sie die Absenderangaben an, die in der Nachricht erscheinen sollen.",
  "Provide the essential contact details for your business enquiry.": "Geben Sie die wesentlichen Kontaktdaten fuer Ihre geschaeftliche Anfrage an.",
  "Name": "Name",
  "First name": "Vorname",
  "Last name": "Nachname",
  "Required": "Erforderlich",
  "Your first name": "Ihr Vorname",
  "Your last name": "Ihr Nachname",
  "Email": "E-Mail",
  "your@email.com": "ihre@email.de",
  "Country": "Land",
  "Germany, India, United States, etc.": "Deutschland, Indien, Vereinigte Staaten usw.",
  "Select country": "Land auswaehlen",
  "Select country (optional)": "Land auswaehlen (optional)",
  "Phone number": "Telefonnummer",
  "+49 123 456 7890": "+49 123 456 7890",
  "Message type": "Nachrichtentyp",
  "Contact request": "Kontaktanfrage",
  "Company or organization": "Unternehmen oder Organisation",
  "Company name": "Unternehmensname",
  "Role or title": "Rolle oder Titel",
  "LinkedIn or website": "LinkedIn oder Website",
  "Recruiter, hiring manager, student, etc.": "Recruiter, Hiring Manager, Student usw.",
  "Recruiter, hiring manager, engineer, student, etc.": "Recruiter, Hiring Manager, Ingenieur, Student usw.",
  "Page or section": "Seite oder Bereich",
  "General website": "Gesamte Website",
  "Overall website experience": "Gesamteindruck der Website",
  "Portfolio homepage": "Portfolio-Startseite",
  "Journey page": "Werdegang-Seite",
  "KEBA experience page": "KEBA-Erfahrungsseite",
  "Project detail page": "Projekt-Detailseite",
  "Translation and language switcher": "Übersetzung und Sprachumschaltung",
  "Additional context": "Zusätzlicher Kontext",
  "These details help classify the message and make follow-up easier.": "Diese Angaben helfen dabei, die Nachricht einzuordnen und die Rueckmeldung zu erleichtern.",
  "Rating": "Bewertung",
  "Category": "Kategorie",
  "Feedback category": "Feedback-Kategorie",
  "Choose a category": "Kategorie waehlen",
  "Positive feedback": "Positives Feedback",
  "General feedback": "Allgemeines Feedback",
  "Design": "Design",
  "Content": "Inhalt",
  "Translation": "Übersetzung",
  "Bug": "Fehler",
  "Suggestion": "Vorschlag",
  "Hiring opportunity": "Karrierechance",
  "Collaboration": "Zusammenarbeit",
  "General enquiry": "Allgemeine Anfrage",
  "Subject": "Betreff",
  "Short subject for your message": "Kurzer Betreff fuer Ihre Nachricht",
  "Preferred response": "Bevorzugte Rueckmeldung",
  "No preference": "Keine Praeferenz",
  "Email response": "Antwort per E-Mail",
  "Schedule a call": "Telefonat vereinbaren",
  "LinkedIn response": "Antwort ueber LinkedIn",
  "Timeline": "Zeitrahmen",
  "No specific timeline": "Kein bestimmter Zeitrahmen",
  "As soon as possible": "So bald wie moeglich",
  "Within this week": "Innerhalb dieser Woche",
  "Within this month": "Innerhalb dieses Monats",
  "Flexible": "Flexibel",
  "Website rating": "Website-Bewertung",
  "Your message": "Ihre Nachricht",
  "Write the main message clearly. Use suggested improvement for recommendations or next steps.": "Formulieren Sie die Hauptnachricht klar. Nutzen Sie das Feld fuer Verbesserungsvorschlaege bei Empfehlungen oder naechsten Schritten.",
  "Write your message clearly and professionally.": "Formulieren Sie Ihre Nachricht klar und professionell.",
  "Review visibility": "Sichtbarkeit der Bewertung",
  "Choose whether your review stays private or can appear publicly with your name and country.": "Waehlen Sie, ob Ihre Bewertung privat bleibt oder mit Ihrem Namen und Land oeffentlich angezeigt werden darf.",
  "Choose public or private review": "Oeffentliche oder private Bewertung waehlen",
  "Private is selected by default": "Privat ist standardmaessig ausgewaehlt",
  "Private review": "Private Bewertung",
  "Your message stays private between you and the site owner.": "Ihre Nachricht bleibt privat zwischen Ihnen und dem Website-Betreiber.",
  "Public review": "Oeffentliche Bewertung",
  "Your rating and comment can be shown publicly with your name and country.": "Ihre Bewertung und Ihr Kommentar koennen oeffentlich mit Ihrem Namen und Land angezeigt werden.",
  "Publish comment": "Kommentar veroeffentlichen",
  "Select one option": "Eine Option auswaehlen",
  "Choose whether this feedback comment stays private for Sooraj Sudhakaran or appears publicly on the website with your name and country.": "Waehlen Sie, ob dieser Feedback-Kommentar nur fuer Sooraj Sudhakaran privat bleibt oder mit Ihrem Namen und Land oeffentlich auf der Website erscheint.",
  "Private": "Privat",
  "Public": "Oeffentlich",
  "Select Private or Public": "Privat oder oeffentlich auswaehlen",
  "Choose one option to decide whether your review stays visible only to Sooraj Sudhakaran or can appear publicly for all visitors.": "Waehlen Sie eine Option, damit klar ist, ob Ihre Bewertung nur fuer Sooraj Sudhakaran sichtbar bleibt oder fuer alle Besucher oeffentlich erscheinen darf.",
  "Comments": "Kommentar",
  "Describe your feedback or observation.": "Beschreiben Sie Ihr Feedback oder Ihre Beobachtung.",
  "Write your message, enquiry, or reason for contact.": "Schreiben Sie Ihre Nachricht, Anfrage oder den Grund Ihrer Kontaktaufnahme.",
  "Include the issue, suggestion, or context you want to share.": "Nennen Sie das Thema, den Vorschlag oder den relevanten Kontext, den Sie teilen möchten.",
  "Include the reason for your contact, relevant context, and any next step you expect.": "Nennen Sie den Anlass Ihrer Kontaktaufnahme, den relevanten Kontext und den gewuenschten naechsten Schritt.",
  "Suggested improvement": "Vorgeschlagene Verbesserung",
  "Share a suggested change, if any.": "Teilen Sie eine vorgeschlagene Aenderung mit, falls vorhanden.",
  "Review and submit": "Pruefen und absenden",
  "Confirm that the information is ready to be submitted through the website.": "Bestaetigen Sie, dass die Angaben bereit zur Uebermittlung ueber die Website sind.",
  "I understand that this form submits my message directly through the website.": "Ich verstehe, dass dieses Formular meine Nachricht direkt ueber die Website uebermittelt.",
  "The form submits directly through the website and delivers your message to the site owner.": "Das Formular wird direkt ueber die Website uebermittelt und stellt Ihre Nachricht dem Website-Betreiber zu.",
  "This contact form submits your message directly through the website.": "Dieses Kontaktformular uebermittelt Ihre Nachricht direkt ueber die Website.",
  "The contact form submits directly through the website and delivers your enquiry to the site owner.": "Das Kontaktformular wird direkt ueber die Website uebermittelt und stellt Ihre Anfrage dem Website-Betreiber zu.",
  "Submit Message": "Nachricht absenden",
  "Submit Form": "Formular absenden",
  "Back to Contact": "Zurück zu Kontakt",
  "Submission received": "Uebermittlung erhalten",
  "Confirmation navigation": "Bestaetigungsnavigation",
  "Thank you for your message.": "Vielen Dank fuer Ihre Nachricht.",
  "Your form was submitted successfully.": "Ihr Formular wurde erfolgreich gesendet.",
  "Your submission was received successfully through the website.": "Ihre Uebermittlung wurde erfolgreich ueber die Website empfangen.",
  "Submission summary": "Uebermittlungsuebersicht",
  "Submission type": "Uebermittlungstyp",
  "Status": "Status",
  "Delivered to site owner": "An den Website-Betreiber zugestellt",
  "Submitted successfully": "Erfolgreich uebermittelt",
  "Next step": "Naechster Schritt",
  "Website feedback is reviewed for future improvements.": "Website-Feedback wird fuer kuenftige Verbesserungen geprueft.",
  "Professional contact requests are reviewed carefully and followed up when relevant.": "Professionelle Kontaktanfragen werden sorgfaeltig geprueft und bei Relevanz weiterverfolgt.",
  "Submit another form": "Weiteres Formular absenden",
  "Submit new form": "Neues Formular senden",
  "Feedback received": "Feedback erhalten",
  "Contact request received": "Kontaktanfrage erhalten",
  "Submission type": "Uebermittlungstyp",
  "Submitted at": "Uebermittelt am",
  "View submission status": "Uebermittlungsstatus anzeigen",
  "View status": "Status anzeigen",
  "View reviews and rating": "Bewertungen und Gesamtbewertung anzeigen",
  "View public reviews and rating": "Oeffentliche Bewertungen und Gesamtbewertung anzeigen",
  "Required before submit": "Vor dem Absenden erforderlich",
  "Submission time": "Uebermittlungszeit",
  "Submission channel": "Uebermittlungskanal",
  "Submitted through the website form.": "Ueber das Website-Formular uebermittelt.",
  "Next review step": "Naechster Pruefschritt",
  "Received successfully and delivered to the site owner.": "Erfolgreich empfangen und an den Website-Betreiber zugestellt.",
  "Received successfully through the website form and delivered to the site owner.": "Erfolgreich ueber das Website-Formular empfangen und an den Website-Betreiber zugestellt.",
  "Reviews": "Bewertungen",
  "Average rating": "Durchschnittsbewertung",
  "No ratings yet": "Noch keine Bewertungen",
  "Conditions": "Bedingungen",
  "Short privacy notes for this form.": "Kurze Hinweise zu Datenschutz und Verarbeitung dieses Formulars.",
  "Show privacy notes": "Datenschutzhinweise anzeigen",
  "Submission": "Uebermittlung",
  "Messages are sent through the website directly to the site owner.": "Nachrichten werden ueber die Website direkt an den Website-Betreiber gesendet.",
  "Review the form conditions, handling, and expected use before submitting.": "Pruefen Sie vor dem Absenden die Bedingungen, den Umgang mit den Angaben und die vorgesehene Verwendung des Formulars.",
  "View conditions": "Bedingungen anzeigen",
  "Submission method": "Versandmethode",
  "This form submits your message directly through the website and delivers it to the site owner.": "Dieses Formular uebermittelt Ihre Nachricht direkt ueber die Website und stellt sie dem Website-Betreiber zu.",
  "Confidentiality": "Vertraulichkeit",
  "Messages from this page are not published on the website or displayed publicly.": "Nachrichten von dieser Seite werden nicht auf der Website veroeffentlicht oder oeffentlich angezeigt.",
  "Messages from this form are not published on the website.": "Nachrichten aus diesem Formular werden nicht auf der Website veroeffentlicht.",
  "Reviews stay private unless you explicitly choose the public review option.": "Bewertungen bleiben privat, sofern Sie nicht ausdruecklich die oeffentliche Bewertungsoption waehlen.",
  "Access and handling": "Zugriff und Verarbeitung",
  "Submitted messages are reviewed privately by the site owner as part of the normal contact and feedback process.": "Uebermittelte Nachrichten werden vom Website-Betreiber vertraulich im normalen Kontakt- und Feedbackprozess geprueft.",
  "Handling": "Verarbeitung",
  "Submitted messages are reviewed privately for follow-up when relevant.": "Uebermittelte Nachrichten werden vertraulich geprueft und bei Relevanz weiterverfolgt.",
  "Response note": "Hinweis zur Rueckmeldung",
  "Sending a message does not guarantee an immediate response, but professional enquiries are reviewed carefully.": "Das Senden einer Nachricht garantiert keine sofortige Rueckmeldung, aber professionelle Anfragen werden sorgfaeltig geprueft.",
  "Submission summary": "Uebermittlungsuebersicht",
  "Shared overview of successful form submissions and CV requests.": "Gemeinsame Uebersicht erfolgreicher Formularuebermittlungen und CV-Anfragen.",
  "View submission summary": "Uebermittlungsuebersicht anzeigen",
  "Private unless you choose Public for a feedback review.": "Privat, sofern Sie fuer eine Feedback-Bewertung nicht Oeffentlich waehlen.",
  "Public reviews can show your name, country, rating, and comment.": "Oeffentliche Bewertungen koennen Ihren Namen, Ihr Land, Ihre Bewertung und Ihren Kommentar anzeigen.",
  "Shared review and submission sections appear after successful submission.": "Gemeinsame Bereiche fuer Bewertungen und Uebermittlungen erscheinen nach erfolgreicher Uebermittlung.",
  "Recorded submissions": "Erfasste Uebermittlungen",
  "Total successful submissions": "Erfolgreiche Uebermittlungen gesamt",
  "Country distribution": "Laenderverteilung",
  "Shared website reach": "Gemeinsame Website-Reichweite",
  "No submissions recorded yet.": "Noch keine Eintraege gespeichert.",
  "Refresh status": "Status aktualisieren",
  "Clear status": "Status leeren",
  "Private admin control": "Private Admin-Steuerung",
  "Status refreshed just now.": "Status wurde gerade aktualisiert.",
  "Status cleared. Submission summary reset to zero.": "Status geloescht. Die Uebersicht wurde auf null zurueckgesetzt.",
  "Submission log": "Uebermittlungsprotokoll",
  "Private admin view": "Private Admin-Ansicht",
  "No submissions available.": "Keine Uebermittlungen verfuegbar.",
  "Delete": "Loeschen",
  "Entry deleted.": "Eintrag geloescht.",
  "Public reviews": "Oeffentliche Bewertungen",
  "Public review comments": "Oeffentliche Bewertungskommentare",
  "Professional reviews published by visitors who chose to share them publicly.": "Professionelle Bewertungen von Besuchern, die ihre Rueckmeldung oeffentlich teilen wollten.",
  "Professional feedback from visitors who explicitly chose to publish their review.": "Professionelles Feedback von Besuchern, die ihre Bewertung ausdruecklich zur Veroeffentlichung freigegeben haben.",
  "Published comments from visitors.": "Veroeffentlichte Kommentare von Besuchern.",
  "Expand public reviews": "Oeffentliche Bewertungen erweitern",
  "View public reviews": "Oeffentliche Bewertungen ansehen",
  "Review list": "Bewertungsliste",
  "Click to expand or collapse": "Zum Oeffnen oder Schliessen klicken",
  "View public review comments": "Oeffentliche Bewertungskommentare ansehen",
  "Expand to read published feedback": "Zum Lesen veroeffentlichter Rueckmeldungen erweitern",
  "Simple process": "Einfacher Ablauf",
  "Three quick steps to complete the form.": "Drei kurze Schritte zum Ausfuellen des Formulars.",
  "Choose form": "Formular waehlen",
  "Feedback or contact.": "Feedback oder Kontakt.",
  "Fill details": "Angaben ausfuellen",
  "Add the required information.": "Erforderliche Angaben eintragen.",
  "Submit": "Absenden",
  "Send it through the website.": "Ueber die Website absenden.",
  "Country not shared": "Land nicht angegeben",
  "Feedback": "Feedback",
  "Contact request": "Kontaktanfrage",
  "Privacy and handling": "Datenschutz und Umgang",
  "Messages from this page are submitted directly through the website and are not published on the website.": "Nachrichten von dieser Seite werden direkt ueber die Website uebermittelt und nicht auf der Website veroeffentlicht.",
  "Visibility": "Sichtbarkeit",
  "Your message is not displayed publicly on the website.": "Ihre Nachricht wird nicht oeffentlich auf der Website angezeigt.",
  "Access": "Zugriff",
  "Only the sender and the site owner can review the email after it is sent.": "Nur die absendende Person und der Website-Betreiber koennen die E-Mail nach dem Versand einsehen.",
  "Appropriate use": "Geeignete Verwendung",
  "Use this form for recruiter enquiries, professional contact, website feedback, bug reports, or content corrections.": "Verwenden Sie dieses Formular fuer Recruiter-Anfragen, professionellen Kontakt, Website-Feedback, Fehlermeldungen oder inhaltliche Korrekturen.",
  "Use this form for design feedback, content corrections, translation notes, bug reports, recruiter enquiries, or direct contact requests.": "Verwenden Sie dieses Formular fuer Design-Feedback, inhaltliche Korrekturen, Uebersetzungshinweise, Fehlermeldungen, Recruiter-Anfragen oder direkte Kontaktanfragen.",
  "Use the links below to contact me, review where I fit best, explore my work, or request my CV through the website form.": "Nutzen Sie die folgenden Links, um mich zu kontaktieren, passende Rollen zu pruefen, meine Arbeit anzusehen oder meinen CV ueber das Website-Formular anzufordern.",
  "For recruiter outreach, collaboration requests, CV enquiries, or technical discussions, direct email and the structured website forms are the fastest contact channels.": "Fuer Recruiter-Anfragen, Kooperationsanfragen, CV-Anfragen oder technische Gespraeche sind direkte E-Mails und die strukturierten Website-Formulare die schnellsten Kontaktwege.",
  "Thank you": "Vielen Dank",
  "Your message has been submitted.": "Ihre Nachricht wurde uebermittelt.",
  "Your form was submitted successfully. Thank you for your feedback or enquiry.": "Ihr Formular wurde erfolgreich uebermittelt. Vielen Dank fuer Ihr Feedback oder Ihre Anfrage.",
  "Return to Portfolio": "Zurück zum Portfolio",
  "CV request form": "CV-Anfrageformular",
  "CV request": "CV-Anfrage",
  "Request the latest CV directly.": "Den aktuellen CV direkt anfragen.",
  "Use this page to request Sooraj Sudhakaran's latest CV. Submit your email address and the requested CV will be sent to you by email.": "Nutzen Sie diese Seite, um den aktuellen CV von Sooraj Sudhakaran anzufragen. Geben Sie Ihre E-Mail-Adresse an, damit der angeforderte CV per E-Mail gesendet werden kann.",
  "Open CV Request": "CV-Anfrage oeffnen",
  "Use the structured website form below to request the latest CV by email.": "Nutzen Sie das strukturierte Website-Formular unten, um den aktuellen CV per E-Mail anzufragen.",
  "Automated request": "Automatische Anfrage",
  "The request below is prepared automatically and sent through the website.": "Die folgende Anfrage wird automatisch vorbereitet und ueber die Website gesendet.",
  "Request type": "Anfragetyp",
  "Requested document": "Angefordertes Dokument",
  "Delivery note": "Hinweis zur Zustellung",
  "Latest CV": "Aktueller CV",
  "The requested CV will be sent to the email address you provide below.": "Der angeforderte CV wird an die E-Mail-Adresse gesendet, die Sie unten angeben.",
  "Provide the email address where the requested CV should be sent. Only the email field is mandatory.": "Geben Sie die E-Mail-Adresse an, an die der angeforderte CV gesendet werden soll. Nur das E-Mail-Feld ist verpflichtend.",
  "Full name": "Vollstaendiger Name",
  "Your full name": "Ihr voller Name",
  "Company name": "Name des Unternehmens",
  "Germany, India, United States, etc.": "Deutschland, Indien, Vereinigte Staaten usw.",
  "Additional note": "Zusaetzliche Notiz",
  "Optional message or context for the CV request.": "Optionale Nachricht oder Kontext zur CV-Anfrage.",
  "If relevant, mention the role, company, or reason for the request.": "Falls relevant, nennen Sie die Rolle, das Unternehmen oder den Grund der Anfrage.",
  "Request summary": "Anfragezusammenfassung",
  "This CV request will be submitted through the website and reviewed for email follow-up.": "Diese CV-Anfrage wird ueber die Website uebermittelt und fuer die Rueckmeldung per E-Mail geprueft.",
  "Submit CV Request": "CV-Anfrage absenden",
  "Before you request": "Vor der Anfrage",
  "Short notes for using this CV request form correctly.": "Kurze Hinweise zur korrekten Nutzung dieses CV-Anfrageformulars.",
  "Enter the email address where the CV should be sent.": "Geben Sie die E-Mail-Adresse an, an die der CV gesendet werden soll.",
  "Add your company or role only if relevant.": "Geben Sie Unternehmen oder Rolle nur an, wenn es relevant ist.",
  "Requests are sent through the website and reviewed privately.": "Anfragen werden ueber die Website gesendet und privat geprueft.",
  "Privacy and delivery": "Datenschutz und Zustellung",
  "Short privacy notes for CV requests.": "Kurze Datenschutzhinweise fuer CV-Anfragen.",
  "CV requests are sent through the website directly to the site owner.": "CV-Anfragen werden ueber die Website direkt an den Website-Betreiber gesendet.",
  "Delivery": "Zustellung",
  "The requested CV is sent by email to the address provided in the form.": "Der angeforderte CV wird per E-Mail an die im Formular angegebene Adresse gesendet.",
  "Requests are reviewed privately and handled for relevant professional follow-up.": "Anfragen werden privat geprueft und fuer relevantes professionelles Follow-up bearbeitet.",
  "Shared overview of successful website form submissions and CV requests.": "Gemeinsame Uebersicht erfolgreicher Website-Formularuebermittlungen und CV-Anfragen.",
  "CV requests": "CV-Anfragen",
  "Total CV requests": "Gesamte CV-Anfragen"
});

Object.assign(META_TRANSLATIONS.de.title, {
  "Journey from India to Germany | Sooraj Sudhakaran": "Weg von Indien nach Deutschland | Sooraj Sudhakaran",
  "Feedback and Contact | Sooraj Sudhakaran": "Feedback und Kontakt | Sooraj Sudhakaran",
  "Request CV | Sooraj Sudhakaran": "CV anfragen | Sooraj Sudhakaran",
  "Portfolio Map | Sooraj Sudhakaran": "Portfolio-Map | Sooraj Sudhakaran",
  "Feedback and Contact Form | Sooraj Sudhakaran": "Feedback- und Kontaktformular | Sooraj Sudhakaran",
  "Submission received | Sooraj Sudhakaran": "Uebermittlung erhalten | Sooraj Sudhakaran"
});

Object.assign(META_TRANSLATIONS.de.description, {
  "Journey page covering Sooraj Sudhakaran's path from school and engineering foundations in India to graduate study, robotics software work, and industrial robotics experience in Germany.": "Werdegangsseite zu Sooraj Sudhakarans Weg von schulischen und technischen Grundlagen in Indien bis zu Masterstudium, Robotik-Softwarearbeit und Industrierobotik-Erfahrung in Deutschland.",
  "Feedback and contact form for sharing comments, corrections, recruiter enquiries, or direct contact requests about Sooraj Sudhakaran's portfolio website.": "Feedback- und Kontaktformular zum Teilen von Kommentaren, Korrekturen, Recruiter-Anfragen oder direkten Kontaktanfragen zur Portfolio-Website von Sooraj Sudhakaran.",
  "Request the latest CV of Sooraj Sudhakaran through a structured website form. Submit your email address and the requested CV will be sent by email.": "Fordern Sie den aktuellen CV von Sooraj Sudhakaran ueber ein strukturiertes Website-Formular an. Geben Sie Ihre E-Mail-Adresse an, damit der angeforderte CV per E-Mail gesendet werden kann.",
  "Portfolio map page linking the main robotics, industrial automation, thesis, project, journey, and contact pages of Sooraj Sudhakaran's website.": "Portfolio-Map-Seite mit Verlinkungen zu den wichtigsten Robotik-, Industrieautomatisierungs-, Thesis-, Projekt-, Werdegangs- und Kontaktseiten der Website von Sooraj Sudhakaran.",
  "Feedback and contact form for sharing comments or sending a direct enquiry about Sooraj Sudhakaran's portfolio website.": "Feedback- und Kontaktformular zum Teilen von Kommentaren oder zum direkten Kontakt bezueglich der Portfolio-Website von Sooraj Sudhakaran.",
  "Confirmation page for successful feedback or contact form submissions on Sooraj Sudhakaran's portfolio website.": "Bestaetigungsseite fuer erfolgreiche Feedback- oder Kontaktformular-Uebermittlungen auf der Portfolio-Website von Sooraj Sudhakaran.",
  "Confirmation page for successful feedback, contact, or CV request submissions on Sooraj Sudhakaran's portfolio website.": "Bestaetigungsseite fuer erfolgreiche Feedback-, Kontakt- oder CV-Anfrage-Uebermittlungen auf der Portfolio-Website von Sooraj Sudhakaran."
});

function resolveInitialLanguage() {
  const saved = localStorage.getItem(STORAGE_LANGUAGE_KEY);
  if (saved === "de" || saved === "en") {
    return saved;
  }

  return loadStoredPublicSiteDefaults().language;
}

function normalizeText(text) {
  return text.replace(/\s+/g, " ").trim();
}

function preserveWhitespace(original, translated) {
  const leading = original.match(/^\s*/)?.[0] || "";
  const trailing = original.match(/\s*$/)?.[0] || "";
  return `${leading}${translated}${trailing}`;
}

function translateDocument(lang) {
  const dictionary = LANGUAGE_TEXT[lang] || {};
  document.documentElement.setAttribute("lang", lang === "de" ? "de" : "en");

  if (!document.documentElement.dataset.originalTitle) {
    document.documentElement.dataset.originalTitle = document.title;
  }
  const desc = document.querySelector('meta[name="description"]');
  if (desc && !desc.dataset.originalContent) {
    desc.dataset.originalContent = desc.getAttribute("content") || "";
  }

  const titleMap = META_TRANSLATIONS[lang]?.title || {};
  const descMap = META_TRANSLATIONS[lang]?.description || {};
  document.title = lang === "de"
    ? (titleMap[document.documentElement.dataset.originalTitle] || document.documentElement.dataset.originalTitle)
    : document.documentElement.dataset.originalTitle;
  if (desc) {
    desc.setAttribute(
      "content",
      lang === "de" ? (descMap[desc.dataset.originalContent] || desc.dataset.originalContent) : desc.dataset.originalContent
    );
  }

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      if (["SCRIPT", "STYLE", "NOSCRIPT", "SVG", "TITLE"].includes(parent.tagName)) return NodeFilter.FILTER_REJECT;
      if (parent.closest(".lang-switcher")) return NodeFilter.FILTER_REJECT;
      return normalizeText(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    }
  });

  const nodes = [];
  let current = walker.nextNode();
  while (current) {
    nodes.push(current);
    current = walker.nextNode();
  }

  nodes.forEach((node) => {
    if (!node.__originalText) node.__originalText = node.nodeValue;
    const normalized = normalizeText(node.__originalText);
    if (!normalized) return;
    if (lang === "de" && dictionary[normalized]) {
      node.nodeValue = preserveWhitespace(node.__originalText, dictionary[normalized]);
    } else {
      node.nodeValue = node.__originalText;
    }
  });

  document.querySelectorAll('[aria-label]').forEach((element) => {
    if (!element.dataset.originalAriaLabel) {
      element.dataset.originalAriaLabel = element.getAttribute("aria-label");
    }
    const original = element.dataset.originalAriaLabel;
    const translated = lang === "de" && dictionary[original] ? dictionary[original] : original;
    element.setAttribute("aria-label", translated);
  });

  document.querySelectorAll("[placeholder]").forEach((element) => {
    if (!element.dataset.originalPlaceholder) {
      element.dataset.originalPlaceholder = element.getAttribute("placeholder") || "";
    }
    const original = element.dataset.originalPlaceholder;
    const translated = lang === "de" && dictionary[original] ? dictionary[original] : original;
    element.setAttribute("placeholder", translated);
  });

  document.querySelectorAll("[data-country-placeholder]").forEach((element) => {
    if (!element.dataset.originalCountryPlaceholder) {
      element.dataset.originalCountryPlaceholder = element.getAttribute("data-country-placeholder") || "";
    }
    const original = element.dataset.originalCountryPlaceholder;
    const translated = lang === "de" && dictionary[original] ? dictionary[original] : original;
    element.setAttribute("data-country-placeholder", translated);
  });

  document.querySelectorAll("[data-request-cv-link]").forEach((link) => {
    link.setAttribute("href", REQUEST_CV_LINKS[lang]);
  });

  document.querySelectorAll(".lang-option").forEach((button) => {
    const active = button.dataset.lang === lang;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
  });

  document.documentElement.setAttribute("data-lang-ready", "true");
}

function setupLanguageSwitcher() {
  const navActions = document.querySelector(".nav-actions");
  if (!navActions || navActions.querySelector(".lang-switcher")) return;

  const switcher = document.createElement("div");
  switcher.className = "lang-switcher";
  switcher.setAttribute("role", "group");
  switcher.setAttribute("aria-label", "Language switcher");
  switcher.innerHTML = `
    <button class="lang-option" type="button" data-lang="en" aria-pressed="true">
      <span class="lang-flags lang-flag-en" aria-hidden="true"></span>
      <span class="lang-code">EN</span>
    </button>
    <button class="lang-option" type="button" data-lang="de" aria-pressed="false">
      <span class="lang-flags lang-flag-de" aria-hidden="true"></span>
      <span class="lang-code">DE</span>
    </button>
  `;

  const themeToggle = navActions.querySelector("[data-theme-toggle]");
  navActions.insertBefore(switcher, themeToggle || navActions.firstChild);

  switcher.querySelectorAll(".lang-option").forEach((button) => {
    button.addEventListener("click", () => {
      const lang = button.dataset.lang === "de" ? "de" : "en";
      const current = resolveInitialLanguage();
      if (lang === current) return;
      localStorage.setItem(STORAGE_LANGUAGE_KEY, lang);
      document.documentElement.setAttribute("lang", lang);
      document.documentElement.setAttribute("data-lang-ready", "false");
      window.location.reload();
    });
  });

  translateDocument(resolveInitialLanguage());
}

function resolveInitialTheme() {
  const saved = localStorage.getItem(STORAGE_THEME_KEY);
  if (saved === "light" || saved === "dark") return saved;
  return loadStoredPublicSiteDefaults().theme;
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

function setupThemeToggle() {
  const toggles = document.querySelectorAll("[data-theme-toggle]");
  if (!toggles.length) return;
  const lang = document.documentElement.lang === "de" ? "de" : "en";
  const copy = lang === "de"
    ? {
        darkMode: "Dunkelmodus",
        switchToLight: "Zum Hellmodus wechseln",
        switchToDark: "Zum Dunkelmodus wechseln"
      }
    : {
        darkMode: "Dark mode",
        switchToLight: "Switch to light mode",
        switchToDark: "Switch to dark mode"
      };

  const syncToggleState = (toggle) => {
    const current = document.documentElement.getAttribute("data-theme") || "dark";
    const isDark = current === "dark";
    toggle.dataset.themeState = current;
    toggle.setAttribute("aria-label", isDark ? copy.switchToLight : copy.switchToDark);
    toggle.setAttribute("title", isDark ? copy.switchToLight : copy.switchToDark);
  };

  toggles.forEach((toggle) => {
    if (!toggle.querySelector(".theme-toggle-track")) {
      toggle.innerHTML = `
        <span class="theme-toggle-track" aria-hidden="true">
          <span class="theme-toggle-switch-label">${copy.darkMode}</span>
          <span class="theme-toggle-switch-control">
            <span class="theme-toggle-switch-state theme-toggle-switch-state-off">
              <span class="theme-toggle-switch-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="4"></circle>
                  <path d="M12 2.8v2.2"></path>
                  <path d="M12 19v2.2"></path>
                  <path d="m4.93 4.93 1.56 1.56"></path>
                  <path d="m17.51 17.51 1.56 1.56"></path>
                  <path d="M2.8 12H5"></path>
                  <path d="M19 12h2.2"></path>
                  <path d="m4.93 19.07 1.56-1.56"></path>
                  <path d="m17.51 6.49 1.56-1.56"></path>
                </svg>
              </span>
            </span>
            <span class="theme-toggle-switch-state theme-toggle-switch-state-on">
              <span class="theme-toggle-switch-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 12.4A8.9 8.9 0 1 1 11.6 3a7 7 0 0 0 9.4 9.4z"></path>
                </svg>
              </span>
            </span>
            <span class="theme-toggle-switch-thumb">
              <span class="theme-toggle-switch-thumb-core"></span>
            </span>
          </span>
        </span>
      `;
    }

    syncToggleState(toggle);
    toggle.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme") || "dark";
      const next = current === "dark" ? "light" : "dark";
      applyTheme(next);
      localStorage.setItem(STORAGE_THEME_KEY, next);
      toggles.forEach((item) => syncToggleState(item));
    });
  });
}

function setupFooterDeclaration() {
  const footerInner = document.querySelector(".footer-inner");
  if (!footerInner || footerInner.querySelector("[data-footer-declaration]")) return;

  const lang = document.documentElement.lang === "de" ? "de" : "en";
  const copy = lang === "de"
    ? {
        button: "Entwicklungsnotiz",
        title: "Entwicklungsnotiz",
        body: "Diese Portfolio-Website wurde mit Unterstuetzung generativer KI-Werkzeuge fuer einzelne Bildideen, Iterationen und Skriptentwicklung weiterentwickelt. Konzeption, Auswahl, fachliche Pruefung, Anpassung und finale Integration wurden von Sooraj Sudhakaran uebernommen."
      }
    : {
        button: "Development note",
        title: "Development note",
        body: "This portfolio website was developed with assistance from generative AI tools for selected image ideas, iteration support, and script development. Concept direction, selection, technical review, adaptation, and final integration were completed by Sooraj Sudhakaran."
      };

  const copyright = footerInner.querySelector("p");
  let meta = footerInner.querySelector(".footer-meta");
  if (!meta) {
    meta = document.createElement("div");
    meta.className = "footer-meta";
    if (copyright) {
      footerInner.insertBefore(meta, copyright);
      meta.appendChild(copyright);
    } else {
      footerInner.insertBefore(meta, footerInner.firstChild);
    }
  }

  const disclosure = document.createElement("div");
  disclosure.className = "footer-declaration";
  disclosure.dataset.footerDeclaration = "true";
  disclosure.innerHTML = `
    <button type="button" class="footer-declaration-trigger" aria-label="${copy.button}">
      <span class="footer-declaration-icon" aria-hidden="true">i</span>
      <span class="footer-declaration-label">${copy.button}</span>
    </button>
    <div class="footer-declaration-panel">
      <strong>${copy.title}</strong>
      <p>${copy.body}</p>
    </div>
  `;
  meta.appendChild(disclosure);
}

function setupMobileNav() {
  const navInner = document.querySelector(".nav-inner");
  const navLinks = navInner?.querySelector(".nav-links");
  const navActions = navInner?.querySelector(".nav-actions");
  if (!navInner || !navLinks || !navActions || navInner.querySelector("[data-mobile-nav-toggle]")) return;

  const lang = document.documentElement.lang === "de" ? "de" : "en";
  const labels = lang === "de"
    ? { open: "Navigation oeffnen", close: "Navigation schliessen" }
    : { open: "Open navigation", close: "Close navigation" };

  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "mobile-nav-toggle";
  toggle.dataset.mobileNavToggle = "true";
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-label", labels.open);
  toggle.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
      <path d="M4 7h16"></path>
      <path d="M4 12h16"></path>
      <path d="M4 17h16"></path>
    </svg>
  `;

  const brand = navInner.querySelector(".brand");
  if (brand?.nextSibling) {
    navInner.insertBefore(toggle, brand.nextSibling);
  } else {
    navInner.appendChild(toggle);
  }

  const mediaQuery = window.matchMedia("(max-width: 780px)");
  const setOpen = (open) => {
    const isOpen = Boolean(open) && mediaQuery.matches;
    navInner.classList.toggle("is-mobile-open", isOpen);
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    toggle.setAttribute("aria-label", isOpen ? labels.close : labels.open);
  };

  toggle.addEventListener("click", () => {
    setOpen(!navInner.classList.contains("is-mobile-open"));
  });

  navInner.querySelectorAll('.nav-links a[href], .nav-actions a[href]').forEach((link) => {
    link.addEventListener("click", () => {
      if (!mediaQuery.matches) return;
      setOpen(false);
    });
  });

  const handleViewportChange = () => {
    if (!mediaQuery.matches) {
      setOpen(false);
    }
  };

  if (typeof mediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener("change", handleViewportChange);
  } else if (typeof mediaQuery.addListener === "function") {
    mediaQuery.addListener(handleViewportChange);
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setOpen(false);
    }
  });
}

function setupReveal() {
  const items = document.querySelectorAll(".reveal-on-scroll");
  if (!items.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    items.forEach((item) => item.classList.add("visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -48px 0px",
    }
  );

  items.forEach((item) => observer.observe(item));
}

function setupActiveNav() {
  const sections = document.querySelectorAll("main section[id]");
  const links = document.querySelectorAll('.nav-links a[href^="#"]');
  if (!sections.length || !links.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) => link.classList.remove("active-link"));
        const active = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
        if (active) active.classList.add("active-link");
      });
    },
    {
      threshold: 0.35,
      rootMargin: "-20% 0px -55% 0px",
    }
  );

  sections.forEach((section) => observer.observe(section));
}

function getScrollOffset() {
  const nav = document.querySelector(".nav");
  const updateBar = document.querySelector(".top-update-bar");
  const navHeight = nav ? nav.getBoundingClientRect().height : 0;
  const updateBarHeight = updateBar && !updateBar.hidden ? updateBar.getBoundingClientRect().height : 0;
  const extraGap = window.innerWidth < 780 ? 18 : 12;
  return navHeight + updateBarHeight + extraGap;
}

function setupSmoothAnchorScroll() {
  const samePageAnchors = document.querySelectorAll('a[href^="#"]');
  if (!samePageAnchors.length) return;

  samePageAnchors.forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      const id = href?.slice(1);
      if (!id) return;

      const target = document.getElementById(id);
      if (!target) return;

      event.preventDefault();
      const targetTop = target.getBoundingClientRect().top + window.scrollY - getScrollOffset();
      window.history.replaceState(null, "", `#${id}`);
      window.scrollTo({
        top: Math.max(targetTop, 0),
        behavior: "smooth"
      });
    });
  });
}

function setupSectionTargetHighlight() {
  const targetMap = new Map(
    Array.from(document.querySelectorAll("main [id]")).map((element) => [element.id, element])
  );
  if (!targetMap.size) return;

  let clearTimer = null;

  const highlightTarget = (id) => {
    const target = targetMap.get(id);
    if (!target) return;
    const highlightElement = target.matches("section") ? target : target;
    const highlightClass = target.matches("section") ? "section-target-highlight" : "target-card-highlight";
    highlightElement.classList.remove(highlightClass);
    window.requestAnimationFrame(() => {
      highlightElement.classList.add(highlightClass);
    });
    window.clearTimeout(clearTimer);
    clearTimer = window.setTimeout(() => {
      highlightElement.classList.remove(highlightClass);
    }, 2200);
  };

  document.addEventListener("click", (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    const id = link.getAttribute("href")?.slice(1);
    if (!id || !targetMap.has(id)) return;
    window.setTimeout(() => highlightTarget(id), 180);
  });

  window.addEventListener("hashchange", () => {
    const id = window.location.hash.replace(/^#/, "");
    if (!id) return;
    highlightTarget(id);
  });

  const initialId = window.location.hash.replace(/^#/, "");
  if (initialId && targetMap.has(initialId)) {
    window.setTimeout(() => highlightTarget(initialId), 220);
  }
}

function getCurrentPageName() {
  return window.location.pathname.split("/").pop() || "index.html";
}

function loadStoredJson(storage, key) {
  try {
    return JSON.parse(storage.getItem(key) || "null");
  } catch {
    return null;
  }
}

function saveStoredJson(storage, key, value) {
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage write failures without breaking the site.
  }
}

function parseStoredTimestamp(value) {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function clampNumber(value, min, max, fallback) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return fallback;
  return Math.min(max, Math.max(min, numericValue));
}

function normalizePublicSiteDefaults(raw = null) {
  const source = raw && typeof raw === "object" ? raw : {};
  const theme = source.theme === "light" ? "light" : "dark";
  const language = source.language === "de" ? "de" : "en";

  return { theme, language };
}

function loadStoredPublicSiteDefaults() {
  return normalizePublicSiteDefaults(loadStoredJson(localStorage, STORAGE_PUBLIC_SITE_DEFAULTS_KEY));
}

function saveStoredPublicSiteDefaults(defaults) {
  saveStoredJson(localStorage, STORAGE_PUBLIC_SITE_DEFAULTS_KEY, normalizePublicSiteDefaults(defaults));
}

function getReviewPromptPageKey(pageName = getCurrentPageName()) {
  if (pageName === "index.html") return "index";
  if (pageName === "portfolio-map.html") return "portfolioMap";
  if (pageName === "journey.html") return "journey";
  return null;
}

function normalizeReviewPromptSettings(raw = null) {
  const defaults = DEFAULT_REVIEW_PROMPT_SETTINGS;
  const source = raw && typeof raw === "object" ? raw : {};
  const eligiblePages = source.eligiblePages && typeof source.eligiblePages === "object"
    ? source.eligiblePages
    : {};

  return {
    enabled: source.enabled !== false,
    showEveryVisit: Boolean(source.showEveryVisit),
    delaySeconds: clampNumber(source.delaySeconds, 0, 300, defaults.delaySeconds),
    scrollPercent: clampNumber(source.scrollPercent, 0, 100, defaults.scrollPercent),
    cooldownDays: clampNumber(source.cooldownDays, 0, 365, defaults.cooldownDays),
    suppressAfterSubmissionDays: clampNumber(
      source.suppressAfterSubmissionDays,
      0,
      365,
      defaults.suppressAfterSubmissionDays
    ),
    triggerOnFinalSection: source.triggerOnFinalSection !== false,
    eligiblePages: {
      index: eligiblePages.index !== false,
      portfolioMap: eligiblePages.portfolioMap !== false,
      journey: eligiblePages.journey !== false
    }
  };
}

function isReviewPromptEnabledForPage(settings, pageName = getCurrentPageName()) {
  const pageKey = getReviewPromptPageKey(pageName);
  if (!pageKey || !REVIEW_PROMPT_ELIGIBLE_PAGES.has(pageName)) return false;
  return Boolean(settings?.enabled) && Boolean(settings?.eligiblePages?.[pageKey]);
}

function persistRecentSubmission(record) {
  if (!record || !record.submittedAt) return;
  saveStoredJson(localStorage, STORAGE_FEEDBACK_LAST_SUBMISSION_PERSISTED_KEY, record);
}

function loadRecentSubmissionRecord() {
  const sessionRecord = loadStoredJson(sessionStorage, STORAGE_FEEDBACK_LAST_SUBMISSION_KEY);
  const persistedRecord = loadStoredJson(localStorage, STORAGE_FEEDBACK_LAST_SUBMISSION_PERSISTED_KEY);
  const sessionTime = parseStoredTimestamp(sessionRecord?.submittedAt);
  const persistedTime = parseStoredTimestamp(persistedRecord?.submittedAt);
  return sessionTime >= persistedTime ? sessionRecord : persistedRecord;
}

function getHomepageReviewPromptCopy(lang) {
  return lang === "de"
    ? {
        kicker: "Portfolio-Feedback",
        intro: "Hallo, ich bin Sooraj.",
        personaNote: "Danke, dass Sie mein Portfolio pruefen.",
        title: "Moechten Sie mich schnell erreichen?",
        body: "Senden Sie eine direkte Kontaktanfrage oder hinterlassen Sie kurzes Portfolio-Feedback.",
        primary: "Feedback senden",
        connect: "Sooraj kontaktieren",
        secondary: "Spaeter",
        note: "Ihre Daten bleiben privat. Ich antworte in der Regel per E-Mail.",
        close: "Bewertungs-Hinweis schliessen",
        contactTitle: "Direkte Kontaktanfrage",
        contactBody: "Teilen Sie Ihre Daten unten mit. Die Kontaktanfrage wird direkt per E-Mail an Sooraj Sudhakaran gesendet.",
        contactNameLabel: "Vollstaendiger Name",
        contactNamePlaceholder: "Ihr voller Name",
        contactEmailLabel: "E-Mail",
        contactEmailPlaceholder: "name@beispiel.de",
        contactCompanyLabel: "Unternehmen oder Universitaet",
        contactCompanyPlaceholder: "Unternehmens- oder Hochschulname",
        contactCountryLabel: "Land",
        contactCountryPlaceholder: "Land auswaehlen",
        contactCancel: "Abbrechen",
        contactSubmit: "Kontaktanfrage senden",
        contactSubmitting: "Wird gesendet...",
        contactSuccess: "Kontaktanfrage erfolgreich gesendet.",
        contactError: "Die Uebermittlung ist fehlgeschlagen. Bitte pruefen Sie Ihre Verbindung und versuchen Sie es erneut.",
        contactSummaryError: "Bitte fuellen Sie die markierten Felder korrekt aus.",
        contactRequiredError: "Dieses Feld ist erforderlich.",
        contactEmailError: "Geben Sie eine gueltige E-Mail-Adresse ein.",
        contactInvalidError: "Geben Sie einen gueltigen Wert ein.",
        contactClose: "Kontaktformular schliessen",
        contactSubject: "Neue Kontaktanfrage ueber den Portfolio-Hinweis",
        contactRequestTypeLabel: "Anfragetyp",
        contactRequestTypeValue: "Direkte Kontaktanfrage",
        contactMailGreeting: "Hallo Sooraj Sudhakaran,",
        contactMailIntro: "eine Besucherin oder ein Besucher Ihrer Portfolio-Website moechte direkt mit Ihnen Kontakt aufnehmen.",
        contactMailPageLabel: "Seite",
        contactMailReplyNote: "Bitte antworten Sie direkt an die oben angegebene E-Mail-Adresse."
      }
    : {
        kicker: "Portfolio feedback",
        intro: "Hi, I'm Sooraj.",
        personaNote: "Thanks for reviewing my portfolio.",
        title: "Want a quick way to reach me?",
        body: "Send a direct contact request or leave short portfolio feedback.",
        primary: "Leave feedback",
        connect: "Contact Sooraj",
        secondary: "Maybe later",
        note: "Your details stay private. I usually reply by email.",
        close: "Dismiss review prompt",
        contactTitle: "Request direct contact",
        contactBody: "Share your details below and the contact request will be sent directly to Sooraj Sudhakaran by email.",
        contactNameLabel: "Full name",
        contactNamePlaceholder: "Your full name",
        contactEmailLabel: "Email",
        contactEmailPlaceholder: "your@email.com",
        contactCompanyLabel: "Company or university",
        contactCompanyPlaceholder: "Company or university name",
        contactCountryLabel: "Country",
        contactCountryPlaceholder: "Select country",
        contactCancel: "Cancel",
        contactSubmit: "Send contact request",
        contactSubmitting: "Sending...",
        contactSuccess: "Contact request sent successfully.",
        contactError: "Submission failed. Please check your connection and try again.",
        contactSummaryError: "Please complete the highlighted fields correctly.",
        contactRequiredError: "This field is required.",
        contactEmailError: "Enter a valid email address.",
        contactInvalidError: "Enter a valid value.",
        contactClose: "Close contact form",
        contactSubject: "New contact request from the portfolio prompt",
        contactRequestTypeLabel: "Request type",
        contactRequestTypeValue: "Direct contact request",
        contactMailGreeting: "Hello Sooraj Sudhakaran,",
        contactMailIntro: "A visitor on your portfolio website wants to contact you directly.",
        contactMailPageLabel: "Page",
        contactMailReplyNote: "Please reply directly to the email address above."
      };
}

function createHomepageContactRequestModal(copy, { onSuccess, onToggle } = {}) {
  const modal = document.createElement("div");
  modal.className = "review-prompt-modal";
  modal.hidden = true;
  modal.innerHTML = `
    <div class="review-prompt-modal-backdrop" data-review-prompt-modal-close></div>
    <div class="review-prompt-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="review-prompt-contact-title">
      <button class="review-prompt-modal-close" type="button" data-review-prompt-modal-close aria-label="${escapeHtml(copy.contactClose)}">x</button>
      <div class="review-prompt-modal-head">
        <span class="review-prompt-kicker">${escapeHtml(copy.connect)}</span>
        <h2 id="review-prompt-contact-title">${escapeHtml(copy.contactTitle)}</h2>
        <p>${escapeHtml(copy.contactBody)}</p>
      </div>
      <form class="review-prompt-contact-form" data-review-prompt-contact-form action="${WEB3FORMS_ENDPOINT}" method="POST" novalidate>
        <input type="hidden" name="access_key" value="${WEB3FORMS_ACCESS_KEY}" />
        <input type="hidden" name="from_name" value="Sooraj Sudhakaran Portfolio" />
        <input type="hidden" name="subject" value="${escapeHtml(copy.contactSubject)}" />
        <input type="checkbox" name="botcheck" tabindex="-1" autocomplete="off" hidden />
        <div class="feedback-grid review-prompt-contact-grid">
          <label class="feedback-field">
            <span>${escapeHtml(copy.contactNameLabel)} <span class="feedback-required-star" aria-hidden="true">*</span></span>
            <input type="text" name="fullName" autocomplete="name" placeholder="${escapeHtml(copy.contactNamePlaceholder)}" required />
          </label>
          <label class="feedback-field">
            <span>${escapeHtml(copy.contactEmailLabel)} <span class="feedback-required-star" aria-hidden="true">*</span></span>
            <input type="email" name="email" autocomplete="email" inputmode="email" placeholder="${escapeHtml(copy.contactEmailPlaceholder)}" required />
          </label>
          <label class="feedback-field">
            <span>${escapeHtml(copy.contactCompanyLabel)} <span class="feedback-required-star" aria-hidden="true">*</span></span>
            <input type="text" name="company" autocomplete="organization" placeholder="${escapeHtml(copy.contactCompanyPlaceholder)}" required />
          </label>
          <label class="feedback-field">
            <span>${escapeHtml(copy.contactCountryLabel)} <span class="feedback-required-star" aria-hidden="true">*</span></span>
            <select name="country" data-country-select data-country-placeholder="${escapeHtml(copy.contactCountryPlaceholder)}" required></select>
          </label>
        </div>
        <p class="review-prompt-contact-status" data-review-prompt-contact-status hidden></p>
        <div class="review-prompt-contact-actions">
          <button class="btn btn-secondary" type="button" data-review-prompt-modal-close>${escapeHtml(copy.contactCancel)}</button>
          <button class="btn btn-primary" type="submit" data-review-prompt-contact-submit>${escapeHtml(copy.contactSubmit)}</button>
        </div>
      </form>
    </div>
  `;
  document.body.append(modal);
  populateCountrySelects(modal);

  const form = modal.querySelector("[data-review-prompt-contact-form]");
  const submitButton = modal.querySelector("[data-review-prompt-contact-submit]");
  const status = modal.querySelector("[data-review-prompt-contact-status]");
  const fields = Array.from(modal.querySelectorAll("input, select"));
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  let lastFocusedElement = null;

  const setStatus = (message = "", state = "error") => {
    if (!status) return;
    status.textContent = message;
    status.dataset.state = state;
    status.hidden = !message;
  };

  const clearStatus = () => {
    if (!status) return;
    status.textContent = "";
    status.hidden = true;
    delete status.dataset.state;
  };

  const getValidationTarget = (field) => field.closest(".feedback-field");

  const getValidationMessageElement = (field) => {
    const target = getValidationTarget(field);
    if (!target) return null;

    let message = target.querySelector(".feedback-validation-message");
    if (message) return message;

    message = document.createElement("small");
    message.className = "feedback-validation-message";
    message.hidden = true;
    target.append(message);
    return message;
  };

  const getFieldErrorMessage = (field) => {
    if (field.validity.valueMissing) return copy.contactRequiredError;
    if (field instanceof HTMLInputElement && field.type === "email") {
      const value = String(field.value || "").trim();
      if (field.validity.typeMismatch || (value && !emailPattern.test(value))) {
        return copy.contactEmailError;
      }
    }
    return copy.contactInvalidError;
  };

  const clearInvalidState = (field) => {
    const target = getValidationTarget(field);
    const message = getValidationMessageElement(field);

    target?.classList.remove("is-invalid", "invalid-bounce");
    if (message) {
      message.textContent = "";
      message.hidden = true;
    }
    field.removeAttribute("aria-invalid");
  };

  const showInvalidState = (field) => {
    const target = getValidationTarget(field);
    const message = getValidationMessageElement(field);
    if (!target) return;

    target.classList.remove("invalid-bounce");
    void target.offsetWidth;
    target.classList.add("is-invalid", "invalid-bounce");
    if (message) {
      message.textContent = getFieldErrorMessage(field);
      message.hidden = false;
    }
    field.setAttribute("aria-invalid", "true");
  };

  const normalizeFieldValue = (field) => {
    if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) {
      field.value = field.value.trim();
    }
  };

  const syncFieldValidity = (field) => {
    normalizeFieldValue(field);

    const value = String(field.value || "").trim();
    if (field.required && !value) {
      field.setCustomValidity(copy.contactRequiredError);
      return;
    }

    if (field instanceof HTMLInputElement && field.type === "email" && value && !emailPattern.test(value)) {
      field.setCustomValidity(copy.contactEmailError);
      return;
    }

    field.setCustomValidity("");
  };

  const refreshFieldValidationState = (field, shouldHighlight = false) => {
    syncFieldValidity(field);

    if (shouldHighlight && !field.checkValidity()) {
      showInvalidState(field);
      return;
    }

    clearInvalidState(field);
  };

  const getRequiredFields = () =>
    Array.from(form?.querySelectorAll("[required]") || []).filter((field) => !field.disabled);

  const isFormReady = () =>
    getRequiredFields().every((field) => {
      syncFieldValidity(field);
      return field.checkValidity();
    });

  const updateSubmitState = () => {
    if (submitButton) {
      submitButton.disabled = !isFormReady();
    }
  };

  const resetFormState = ({ preserveStatus = false } = {}) => {
    form?.reset();
    if (form) {
      delete form.dataset.showValidation;
    }
    populateCountrySelects(modal);
    if (!preserveStatus) {
      clearStatus();
    }
    fields.forEach((field) => clearInvalidState(field));
    updateSubmitState();
  };

  const closeModal = ({ restoreFocus = true } = {}) => {
    if (modal.hidden) return;
    modal.hidden = true;
    document.body.classList.remove("review-prompt-modal-open");
    if (typeof onToggle === "function") {
      onToggle(false);
    }
    clearStatus();
    if (restoreFocus && lastFocusedElement instanceof HTMLElement) {
      window.setTimeout(() => lastFocusedElement.focus({ preventScroll: true }), 0);
    }
  };

  const openModal = (trigger = document.activeElement) => {
    lastFocusedElement = trigger instanceof HTMLElement ? trigger : null;
    resetFormState();
    modal.hidden = false;
    document.body.classList.add("review-prompt-modal-open");
    if (typeof onToggle === "function") {
      onToggle(true);
    }
    form?.querySelector('input[name="fullName"]')?.focus();
  };

  fields.forEach((field) => {
    field.addEventListener("input", () => {
      clearStatus();
      refreshFieldValidationState(field, form?.dataset.showValidation === "true");
      updateSubmitState();
    });

    field.addEventListener("blur", () => {
      clearStatus();
      refreshFieldValidationState(field, form?.dataset.showValidation === "true");
      updateSubmitState();
    });
  });

  modal.querySelectorAll("[data-review-prompt-modal-close]").forEach((element) => {
    element.addEventListener("click", () => closeModal());
  });

  modal.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.stopPropagation();
      closeModal();
    }
  });

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearStatus();
    form.dataset.showValidation = "true";

    const requiredFields = getRequiredFields();
    requiredFields.forEach((field) => refreshFieldValidationState(field, true));
    updateSubmitState();

    if (!isFormReady()) {
      setStatus(copy.contactSummaryError, "error");
      const firstInvalidField = requiredFields.find((field) => !field.checkValidity());
      firstInvalidField?.focus({ preventScroll: true });
      return;
    }

    const formData = new FormData(form);
    const value = (name) => String(formData.get(name) || "").trim();
    const fullName = value("fullName");
    const email = value("email");
    const company = value("company");
    const country = value("country");
    const submittedAt = new Date().toISOString();
    const lines = [
      copy.contactMailGreeting,
      "",
      copy.contactMailIntro,
      "",
      `${copy.contactRequestTypeLabel}: ${copy.contactRequestTypeValue}`,
      `${copy.contactNameLabel}: ${fullName}`,
      `${copy.contactEmailLabel}: ${email}`,
      `${copy.contactCompanyLabel}: ${company}`,
      `${copy.contactCountryLabel}: ${country}`,
      `${copy.contactMailPageLabel}: ${window.location.pathname}`,
      "",
      copy.contactMailReplyNote
    ];

    formData.set("subject", copy.contactSubject);
    formData.set("from_name", "Sooraj Sudhakaran Portfolio");
    formData.set("replyto", email);
    formData.set("message", lines.join("\r\n"));

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.setAttribute("aria-busy", "true");
      submitButton.textContent = copy.contactSubmitting;
    }

    try {
      const response = await fetch(form.getAttribute("action") || WEB3FORMS_ENDPOINT, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json"
        }
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || result?.success === false) {
        throw new Error(result?.message || "Submission failed");
      }

      const submissionRecord = {
        type: "contact",
        submittedAt
      };
      sessionStorage.setItem(STORAGE_FEEDBACK_LAST_SUBMISSION_KEY, JSON.stringify(submissionRecord));
      persistRecentSubmission(submissionRecord);
      await recordSharedSubmissionEvent({
        id: createClientUuid(),
        type: "contact",
        country,
        submittedAt,
        subject: copy.contactSubject
      });
      trackAnalyticsEvent("homepage_review_prompt_contact_submit_success", {
        page_path: window.location.pathname,
        has_company: company ? "yes" : "no",
        has_country: country ? "yes" : "no"
      });

      resetFormState({ preserveStatus: true });
      setStatus(copy.contactSuccess, "success");
      window.setTimeout(() => {
        closeModal({ restoreFocus: false });
        onSuccess?.(submissionRecord);
      }, 900);
    } catch {
      trackAnalyticsEvent("homepage_review_prompt_contact_submit_error", {
        page_path: window.location.pathname
      });
      setStatus(copy.contactError, "error");
    } finally {
      if (submitButton) {
        submitButton.removeAttribute("aria-busy");
        submitButton.textContent = copy.contactSubmit;
      }
      updateSubmitState();
    }
  });

  updateSubmitState();

  return {
    openModal,
    closeModal,
    isOpen: () => !modal.hidden
  };
}

function getHomepageReviewPromptCooldownAnchor(state) {
  return Math.max(
    parseStoredTimestamp(state?.dismissedAt),
    parseStoredTimestamp(state?.startedAt),
    parseStoredTimestamp(state?.shownAt)
  );
}

function shouldSkipHomepageReviewPrompt(settings) {
  if (adminSessionActive || !isReviewPromptEnabledForPage(settings)) {
    return true;
  }

  const recentSubmission = loadRecentSubmissionRecord();
  const submittedAt = parseStoredTimestamp(recentSubmission?.submittedAt);
  const suppressWindowMs = clampNumber(
    settings?.suppressAfterSubmissionDays,
    0,
    365,
    DEFAULT_REVIEW_PROMPT_SETTINGS.suppressAfterSubmissionDays
  ) * DAY_IN_MS;
  if (submittedAt && suppressWindowMs > 0 && Date.now() - submittedAt < suppressWindowMs) {
    return true;
  }

  if (settings?.showEveryVisit) {
    return false;
  }

  const promptState = loadStoredJson(localStorage, STORAGE_HOMEPAGE_REVIEW_PROMPT_KEY);
  const lastPromptAt = getHomepageReviewPromptCooldownAnchor(promptState);
  const cooldownMs = clampNumber(
    settings?.cooldownDays,
    0,
    365,
    DEFAULT_REVIEW_PROMPT_SETTINGS.cooldownDays
  ) * DAY_IN_MS;
  if (lastPromptAt && cooldownMs > 0 && Date.now() - lastPromptAt < cooldownMs) {
    return true;
  }

  return false;
}

function getOriginSectionId(link) {
  const linkedSection = link.closest("section[id]");
  if (linkedSection) return linkedSection.id;

  const explicitSections = ["projects", "experience", "about", "education", "certificates", "contact", "journey-preview"];
  const matchedId = explicitSections.find((id) => Boolean(link.closest(`#${id}`)));
  if (matchedId) return matchedId;

  return window.location.hash.replace(/^#/, "") || "";
}

function classifyOrigin(pageName, sectionId) {
  if (sectionId === "projects" || /^project-/.test(pageName)) return "projects";
  if (sectionId === "experience" || /^experience-/.test(pageName)) return "experience";
  if (pageName === "journey.html" || sectionId === "journey-preview") return "journey";
  return "portfolio";
}

function getDetailBackLabel(originType, lang) {
  const labels = {
    en: {
      projects: "Back to Projects",
      experience: "Back to Experience",
      journey: "Back to Journey",
      portfolio: "Back to Portfolio"
    },
    de: {
      projects: "Zurück zu den Projekten",
      experience: "Zurück zur Erfahrung",
      journey: "Zurück zum Werdegang",
      portfolio: "Zurück zum Portfolio"
    }
  };

  return labels[lang]?.[originType] || labels.en[originType] || labels[lang].portfolio;
}

function buildOriginUrl(pageName, sectionId) {
  return `${pageName}${sectionId ? `#${sectionId}` : ""}`;
}

function storeReturnTarget(origin) {
  if (!origin?.pageName) return;

  try {
    window.sessionStorage.setItem(
      STORAGE_RETURN_TARGET_KEY,
      JSON.stringify({
        pageName: origin.pageName,
        sectionId: origin.sectionId,
        scrollY: Math.max(origin.scrollY || 0, 0)
      })
    );
  } catch (error) {
    // Ignore storage write issues and allow normal navigation.
  }
}

function getStoredDetailOrigin(detailPageName) {
  try {
    const raw = window.sessionStorage.getItem(`${STORAGE_DETAIL_ORIGIN_PREFIX}${detailPageName}`);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

function setupDetailOriginTracking() {
  const detailLinkSelector = 'a[href$=".html"], a[href*=".html#"]';

  document.querySelectorAll(detailLinkSelector).forEach((link) => {
    link.addEventListener("click", () => {
      const href = link.getAttribute("href");
      if (!href) return;

      let destination;
      try {
        destination = new URL(href, window.location.href);
      } catch (error) {
        return;
      }

      const detailPageName = destination.pathname.split("/").pop() || "";
      if (!/^(project|experience)-.+\.html$/.test(detailPageName)) return;

      const pageName = getCurrentPageName();
      const sectionId = getOriginSectionId(link);
      const origin = {
        pageName,
        sectionId,
        originType: classifyOrigin(pageName, sectionId),
        url: buildOriginUrl(pageName, sectionId),
        scrollY: Math.max(window.scrollY || 0, 0)
      };

      try {
        window.sessionStorage.setItem(
          `${STORAGE_DETAIL_ORIGIN_PREFIX}${detailPageName}`,
          JSON.stringify(origin)
        );
      } catch (error) {
        // Ignore storage write issues and fall back to static back links.
      }
    });
  });
}

function getDetailOriginForPage(detailPageName = getCurrentPageName()) {
  if (!/^(project|experience)-.+\.html$/.test(detailPageName)) return null;

  const isProjectDetail = /^project-/.test(detailPageName);
  const defaultOrigin = isProjectDetail
    ? {
        pageName: "index.html",
        sectionId: "projects",
        originType: "projects",
        url: "index.html#projects",
        scrollY: 0
      }
    : {
        pageName: "index.html",
        sectionId: "experience",
        originType: "experience",
        url: "index.html#experience",
        scrollY: 0
      };

  return getStoredDetailOrigin(detailPageName) || defaultOrigin;
}

function setupSmartDetailBack() {
  if (!document.body.classList.contains("detail-page")) return;
  if (document.body.classList.contains("feedback-page")) return;
  if (document.body.classList.contains("portfolio-map-page")) return;

  const origin = getDetailOriginForPage();
  if (!origin) return;

  const lang = resolveInitialLanguage();
  const label = getDetailBackLabel(origin.originType, lang);
  const buttons = document.querySelectorAll(".detail-back, .nav-actions .btn-ghost");

  buttons.forEach((button) => {
    button.setAttribute("href", origin.url);
    button.textContent = label;
    button.addEventListener("click", () => {
      storeReturnTarget(origin);
    });
  });
}

function getSafeSameOriginReferrerHref() {
  if (!document.referrer) return "";

  try {
    const referrer = new URL(document.referrer);
    const current = new URL(window.location.href);
    if (referrer.origin !== current.origin) return "";
    if (
      referrer.pathname === current.pathname &&
      referrer.search === current.search &&
      referrer.hash === current.hash
    ) {
      return "";
    }

    return `${referrer.pathname}${referrer.search}${referrer.hash}`;
  } catch (error) {
    return "";
  }
}

function getVisibleBackButtonCopy(lang) {
  return lang === "de"
    ? {
        button: "Zurueck",
        portfolio: "Zurueck zum Portfolio",
        contact: "Zurueck zu Kontakt",
        feedback: "Zurueck zum Feedback-Formular"
      }
    : {
        button: "Back",
        portfolio: "Back to Portfolio",
        contact: "Back to Contact",
        feedback: "Back to Feedback form"
      };
}

function getVisibleBackButtonConfig() {
  const pageName = getCurrentPageName();
  if (pageName === "index.html") return null;

  const lang = resolveInitialLanguage();
  const copy = getVisibleBackButtonCopy(lang);
  const detailOrigin = getDetailOriginForPage(pageName);

  if (detailOrigin) {
    return {
      href: detailOrigin.url,
      label: copy.button,
      ariaLabel: getDetailBackLabel(detailOrigin.originType, lang),
      origin: detailOrigin
    };
  }

  const referrerHref = getSafeSameOriginReferrerHref();
  const fallbackTargets = {
    "journey.html": { href: "index.html#journey-preview", ariaLabel: copy.portfolio },
    "feedback.html": { href: "index.html#contact", ariaLabel: copy.contact },
    "request-cv.html": { href: "index.html#contact", ariaLabel: copy.contact },
    "feedback-thank-you.html": { href: "feedback.html", ariaLabel: copy.feedback },
    "portfolio-map.html": { href: "index.html", ariaLabel: copy.portfolio }
  };
  const fallback = fallbackTargets[pageName] || { href: "index.html", ariaLabel: copy.portfolio };

  return {
    href: referrerHref || fallback.href,
    label: copy.button,
    ariaLabel: fallback.ariaLabel
  };
}

function setupVisibleBackButton() {
  const config = getVisibleBackButtonConfig();
  if (!config) return;
  if (document.querySelector("[data-page-back-button]")) return;

  const button = document.createElement("a");
  button.className = "page-back-button";
  button.href = config.href;
  button.setAttribute("data-page-back-button", "");
  button.setAttribute("aria-label", config.ariaLabel);
  button.setAttribute("title", config.ariaLabel);
  button.innerHTML = `
    <span class="page-back-button-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="m15 18-6-6 6-6"></path>
        <path d="M21 12H9"></path>
      </svg>
    </span>
    <span class="page-back-button-label">${config.label}</span>
  `;

  if (config.origin) {
    button.addEventListener("click", () => {
      storeReturnTarget(config.origin);
    });
  }

  document.body.classList.add("has-page-back-button");
  const shell = document.querySelector(".page-shell");
  (shell || document.body).append(button);
}

function setupStoredReturnPosition() {
  let stored;
  try {
    stored = window.sessionStorage.getItem(STORAGE_RETURN_TARGET_KEY);
  } catch (error) {
    stored = null;
  }
  if (!stored) return;

  let target;
  try {
    target = JSON.parse(stored);
  } catch (error) {
    window.sessionStorage.removeItem(STORAGE_RETURN_TARGET_KEY);
    return;
  }

  if (!target || target.pageName !== getCurrentPageName()) return;

  const restore = () => {
    window.scrollTo({ top: Math.max(target.scrollY || 0, 0), behavior: "auto" });
    if (target.sectionId) {
      const section = document.getElementById(target.sectionId);
      if (section) {
        section.classList.remove("section-target-highlight");
        window.requestAnimationFrame(() => {
          section.classList.add("section-target-highlight");
          window.setTimeout(() => section.classList.remove("section-target-highlight"), 2200);
        });
      }
    }
    window.sessionStorage.removeItem(STORAGE_RETURN_TARGET_KEY);
  };

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(restore);
  });
}

function createHelpBotHomeTarget(id) {
  return { type: "section", page: "index.html", id };
}

function createHelpBotPageTarget(href, hash = "") {
  return { type: "page", href, hash };
}

function createHelpBotExternalTarget(href) {
  return { type: "external", href };
}

function createHelpBotCvTarget() {
  return createHelpBotPageTarget("request-cv.html");
}

function createHelpBotContactFormTarget() {
  return createHelpBotPageTarget("feedback.html?type=contact", "feedback-form");
}

function getPortfolioHelpBotConfig(lang) {
  if (lang === "de") {
    return {
      nudgeBadge: "AI Assistant",
      nudge: "Hallo, ich bin der AI Assistant von Sooraj. Kann ich Ihnen etwas schneller zeigen?",
      launcher: "Chat mit Sooraj oeffnen",
      badge: "AI Assistant von Sooraj",
      assistantName: "AI Assistant",
      typingAnnouncement: "Der AI Assistant schreibt gerade.",
      title: "AI Assistant von Sooraj",
      lead: "Ich fuehre Sie persoenlich durch Projekte, Erfahrung, Reviews, CV und Kontakt.",
      endChat: "Chat beenden",
      continueChat: "Chat fortsetzen",
      startFresh: "Neu starten",
      resumeQuestion: "Willkommen zurueck. Moechten Sie dort weitermachen, wo Sie aufgehoert haben, oder einen neuen Chat beginnen?",
      ended: "Der Chat wurde beendet. Oeffnen Sie den Assistenten jederzeit fuer einen neuen Start.",
      reset: "Neu starten",
      close: "Chat schliessen",
      welcome: "Hallo, ich bin der AI Assistant von Sooraj Sudhakaran. Ich helfe Ihnen dabei, diese Website schneller zu nutzen und die richtigen Bereiche zu finden.",
      askName: "Bevor ich Sie weiterfuehre: Wie darf ich Sie ansprechen?",
      askNamePlaceholder: "Geben Sie Ihren Namen ein",
      askNameSubmit: "Senden",
      askNameGreeting: (name) => `Willkommen ${name} 👋😊 Ich freue mich, Sie heute durch die Website zu begleiten.`,
      askUniversity: (name) => `Schoen, dass Sie da sind, ${name} 👋 Welche Hochschule oder Universitaet kann ich heute mit Ihrem Weg verknuepfen?`,
      askUniversityPlaceholder: "Hochschule oder Universitaet eingeben",
      askUniversitySubmit: "Weiter",
      askUniversitySkip: "Ohne Hochschule starten",
      askUniversityAdd: "Hochschule doch angeben",
      askUniversityContinue: "Ohne Hochschule fortsetzen",
      askUniversityConfirmGeneric: (university) => `Nur zur Sicherheit 😊 Meinen Sie ${university}?`,
      askUniversityConfirmDeggendorf: "Ohh 😄 Meinen Sie die Deggendorf Institute of Technology, Germany?",
      askUniversityConfirmKtu: "Ohh 😄 Meinen Sie die APJ Abdul Kalam Technological University?",
      askUniversityConfirmYes: "Ja, genau",
      askUniversityConfirmRetype: "Nein, neu eingeben",
      askUniversitySameMatch: (name) => `Wow ${name} 😄✨ Das ist ein direkter Match mit dem aktuellen Master-in-Mechatronics-Weg meines Bosses in Deutschland. Dadurch fuehlt sich diese Verbindung gleich besonders nah und spannend an.`,
      askUniversityKtuMatch: (name) => `Wow ${name} 😄✨ Das passt direkt zum Bachelor-in-Mechanical-Engineering-Weg meines Bosses in Indien. Dadurch wird dieser Austausch gleich noch interessanter und naeher.`,
      askUniversitySaved: (name) => `Sehr schoen ${name} 😊 Danke fuer Ihre Hochschulangabe. Ich behalte das im Hinterkopf und fuehre Sie passend weiter.`,
      askUniversitySkipped: (name) => `Ohh ${name} 😅 Damit verpassen Sie gerade den kleinen Match mit einem Hochschulweg, den ich gut kenne. Aber kein Problem 😊 Wir koennen direkt weitermachen oder Ihre Hochschule doch noch hinzufuegen.`,
      askUniversityRetype: "Kein Problem 😊 Schreiben Sie Ihre Hochschule einfach noch einmal.",
      askNameContinuePrompt: (name) => `Soll ich mit ${name} weitermachen oder wollen Sie den Namen lieber noch einmal neu starten?`,
      askNameContinueYes: "Ja, weiter",
      askNameContinueRestart: "Nein, neu starten",
      askNameRestarting: "Lassen Sie uns ganz entspannt neu starten. Keine Sorge 😊",
      askNameBossPrompt: (name) => `${name} klingt fast wie der Name meines Bosses 😄 Darf ich Sie wirklich ${name} nennen?`,
      askNameBossYes: "Ja, nennen Sie mich so",
      askNameBossRetype: "Nein, Namen neu eingeben",
      askNameBossRetypePrompt: "Alles klar 😊 Dann geben Sie Ihren Namen bitte noch einmal ein.",
      askNameInvalid: "Das sieht fuer mich noch nicht wie ein richtiger Name aus. Bitte geben Sie Ihren korrekten Namen ein.",
      searchWebsiteLabel: "🔍 Website durchsuchen",
      searchWebsitePrompt: "Geben Sie ein Stichwort, eine Rolle, ein Tool oder ein Thema ein. Ich suche dann die passende Stelle auf der Website fuer Sie.",
      searchWebsitePlaceholder: "Zum Beispiel ROS, Thesis, KEBA, Journey, CV ...",
      searchWebsiteSubmit: "Suchen",
      searchWebsiteSearching: "Ich suche gerade die passende Stelle auf der Website ...",
      searchWebsiteDeepSearching: "Ich starte gerade eine tiefere Suche ueber die Website ...",
      searchWebsiteQuestionFound: (label) => `Meinen Sie diese Frage?\n${label}`,
      searchWebsiteQuestionFoundMultiple: "Ich habe mehrere passende Fragen gefunden. Meinen Sie eine von diesen?",
      searchWebsiteFound: (label) => `Ich habe einen guten Treffer gefunden: ${label}. Moechten Sie diesen Bereich jetzt oeffnen?`,
      searchWebsiteFoundMultiple: "Ich habe mehrere passende Treffer gefunden. Meinen Sie einen dieser Bereiche?",
      searchWebsiteAnswerYes: "Ja, diese Frage beantworten",
      searchWebsiteAnswerNo: "Nein, noch einmal fragen",
      searchWebsiteOpenYes: "Ja, bitte oeffnen",
      searchWebsiteOpenNo: "Nein, noch einmal suchen",
      searchWebsiteRetryPrompt: "Suche fehlgeschlagen. Bitte versuchen Sie jetzt genau ein Stichwort. Ich suche noch einmal.",
      searchWebsiteDeepRetryPrompt: "Suche erneut fehlgeschlagen. Bitte geben Sie jetzt nur ein praezises Stichwort ein. Ich starte direkt eine tiefere Suche.",
      searchWebsiteNoResult: "Ich konnte die Frage noch nicht sauber verstehen. Wenn Sie moechten, kann ich Sooraj diese Frage direkt weitergeben.\nSie koennen jetzt einen Kontaktweg starten, erneut fragen oder ins Hauptmenue zurueckgehen.",
      searchWebsiteMainMenu: "Zum Hauptmenue",
      searchWebsiteContact: "Sooraj fragen",
      searchWebsiteAskAgain: "Noch einmal fragen",
      visitorProfileConsent: "Hallo Besucher 👋 Moechten Sie ein paar kurze Angaben wie Ihren Namen, Ihre Position und Ihre Organisation teilen, damit ich Sie passender ansprechen kann?",
      visitorProfileShare: "Ja, ich teile das",
      visitorProfileSkip: "Nein, direkt weiter",
      visitorNamePrompt: "Wie darf ich Sie ansprechen?",
      visitorNamePlaceholder: "Namen eingeben",
      visitorNameSubmit: "Weiter",
      visitorNameSkip: "Ohne Namen weiter",
      visitorPositionPrompt: "Welche Position oder Rolle haben Sie aktuell?",
      visitorPositionPlaceholder: "Position eingeben",
      visitorPositionSubmit: "Weiter",
      visitorPositionSkip: "Ohne Position weiter",
      visitorOrganizationPrompt: "Zu welcher Organisation oder welchem Unternehmen gehoeren Sie?",
      visitorOrganizationPlaceholder: "Organisation eingeben",
      visitorOrganizationSubmit: "Fertig",
      visitorOrganizationSkip: "Ohne Organisation weiter",
      visitorProfileThanks: (name, position, organisation) => {
        const details = [name, position, organisation].filter(Boolean);
        if (!details.length) return "Kein Problem 👋 Ich fuehre Sie trotzdem passend weiter.";
        return `Danke ${name || "Ihnen"} 👋 Ich habe ${details.join(" • ")} im Blick und richte die naechsten Schritte jetzt etwas passender fuer Sie aus.`;
      },
      feedbackPrompt: (name = "") => name
        ? `Bevor Sie gehen, ${name}: Moechten Sie, dass ich Ihre Bewertung direkt hier im Chat aufnehme?`
        : "Bevor Sie gehen: Moechten Sie, dass ich Ihre Bewertung direkt hier im Chat aufnehme?",
      feedbackPromptCollectHere: "Ja, starten Sie die Bewertungsrunde",
      feedbackPublicOption: "Oeffentliche Bewertung",
      feedbackPrivateOption: "Privates Feedback",
      recruiterContactPrompt: "Moechten Sie zuerst Sooraj kontaktieren oder direkt seinen CV anfragen?",
      recruiterContactChooseContact: "Sooraj kontaktieren",
      recruiterContactChooseCv: "CV anfragen",
      recruiterContactNamePrompt: "Welchen Namen soll ich fuer die Kontaktanfrage verwenden?",
      recruiterContactNamePlaceholder: "Vollstaendigen Namen eingeben",
      recruiterContactEmailPrompt: "Welche E-Mail-Adresse soll ich fuer die Kontaktanfrage verwenden?",
      recruiterContactEmailPlaceholder: "E-Mail-Adresse eingeben",
      recruiterContactCountryPrompt: "Aus welchem Land schreiben Sie?",
      recruiterContactCountryPlaceholder: "Land eingeben",
      recruiterContactMessagePrompt: "Welche Nachricht soll ich an Sooraj senden?",
      recruiterContactMessagePlaceholder: "Kontaktanfrage eingeben",
      recruiterContactSubmit: "Kontaktanfrage senden",
      recruiterCvEmailPrompt: "An welche E-Mail-Adresse soll der CV gesendet werden?",
      recruiterCvEmailPlaceholder: "E-Mail-Adresse eingeben",
      recruiterCvSubmit: "CV-Anfrage senden",
      recruiterInvalidMessage: "Bitte schreiben Sie eine etwas klarere Nachricht.",
      recruiterContactSuccess: (name = "") => name ? `Vielen Dank, ${name}. Ihre Kontaktanfrage wurde ueber den Chat gesendet.` : "Vielen Dank. Ihre Kontaktanfrage wurde ueber den Chat gesendet.",
      recruiterCvSuccess: (name = "") => name ? `Vielen Dank, ${name}. Die CV-Anfrage wurde ueber den Chat gesendet.` : "Vielen Dank. Die CV-Anfrage wurde ueber den Chat gesendet.",
      recruiterContactAskCvAfter: "Moechten Sie fuer Ihre Validierung jetzt auch Soorajs CV anfragen?",
      recruiterCvAskContactAfter: "Moechten Sie jetzt auch direkt eine Kontaktanfrage an Sooraj senden?",
      recruiterFollowupYesCv: "Ja, CV anfragen",
      recruiterFollowupYesContact: "Ja, Kontaktanfrage senden",
      recruiterFollowupNo: "Nein, hier abschliessen",
      recruiterUsingSameEmailForCv: "Ich verwende dafuer die E-Mail-Adresse aus Ihrer Kontaktanfrage.",
      recruiterSubmissionError: "Die Uebermittlung ist gerade fehlgeschlagen. Bitte versuchen Sie es noch einmal.",
      feedbackSkipOption: "Ohne Bewertung beenden",
      feedbackSkipConfirmPromptStudent: (name = "") => name
        ? `Ohh ${name} 😅 Ich werde unseren Chat aus Sicherheitsgruenden an Sooraj weitergeben, damit er sieht, dass ich wirklich nach einer Bewertung gefragt habe.\nWenn Sie mich sicher halten wollen, lassen Sie bitte eine kurze Bewertung da. Ich sammle alles direkt hier im Chat, ohne das grosse Feedback-Formular.\nSind Sie sicher, dass Sie ohne Bewertung weitergehen moechten?`
        : `Ohh 😅 Ich werde unseren Chat aus Sicherheitsgruenden an Sooraj weitergeben, damit er sieht, dass ich wirklich nach einer Bewertung gefragt habe.\nWenn Sie mich sicher halten wollen, lassen Sie bitte eine kurze Bewertung da. Ich sammle alles direkt hier im Chat, ohne das grosse Feedback-Formular.\nSind Sie sicher, dass Sie ohne Bewertung weitergehen moechten?`,
      feedbackSkipConfirmLeave: "Nein, ohne Bewertung beenden",
      feedbackSkipConfirmReview: "Ja, ich schreibe eine Bewertung",
      feedbackStudentReviewModePrompt: "Danke 😊 Soll ich die Bewertung direkt hier im Chat fuer Sie aufnehmen?",
      feedbackStudentReviewModeChat: "Ja, starten Sie die Bewertungsrunde",
      feedbackIntro: (mode) => mode === "public"
        ? "Gerne. Ich sammle jetzt die Pflichtangaben fuer eine oeffentliche Bewertung direkt aus diesem Chat."
        : "Gerne. Ich sammle jetzt die Pflichtangaben fuer ein privates Feedback direkt aus diesem Chat.",
      feedbackUsingName: (name) => `Ich verwende Ihren Namen als ${name}.`,
      feedbackNamePrompt: "Welchen Namen soll ich fuer dieses Feedback verwenden?",
      feedbackNamePlaceholder: "Ihren Namen eingeben",
      feedbackCompanyPrompt: "Von welchem Unternehmen, welcher Organisation oder Hochschule kommen Sie?",
      feedbackCompanyPlaceholder: "Unternehmen, Organisation oder Hochschule",
      feedbackEmailPrompt: "Welche E-Mail-Adresse soll ich mit diesem Feedback speichern?",
      feedbackEmailPlaceholder: "E-Mail-Adresse eingeben",
      feedbackCountryPrompt: "Aus welchem Land schreiben Sie?",
      feedbackCountryPlaceholder: "Land eingeben",
      feedbackRatingPrompt: "Wie bewerten Sie die Website insgesamt?",
      feedbackCommentPrompt: (mode) => mode === "public"
        ? "Schreiben Sie jetzt bitte Ihren Bewertungstext. Dieser Text kann nach Freigabe oeffentlich erscheinen."
        : "Schreiben Sie jetzt bitte Ihr privates Feedback. Dieser Text bleibt privat.",
      feedbackCommentPlaceholder: (mode) => mode === "public"
        ? "Ihre oeffentliche Bewertung"
        : "Ihr privates Feedback",
      feedbackContinue: "Weiter",
      feedbackSubmitPublic: "Bewertung senden",
      feedbackSubmitPrivate: "Feedback senden",
      feedbackRetry: "Erneut senden",
      feedbackEdit: "Text anpassen",
      feedbackOpenPage: "Feedback-Seite oeffnen",
      feedbackInvalidName: "Bitte geben Sie einen Namen ein.",
      feedbackInvalidCompany: "Bitte geben Sie Unternehmen, Organisation oder Hochschule an.",
      feedbackInvalidEmail: "Bitte geben Sie eine gueltige E-Mail-Adresse ein.",
      feedbackInvalidCountry: "Bitte geben Sie ein Land ein.",
      feedbackInvalidComments: "Bitte schreiben Sie einen etwas laengeren Kommentar.",
      feedbackFailure: "Die Uebermittlung hat gerade nicht funktioniert. Sie koennen es erneut versuchen, Ihren Text anpassen oder die Feedback-Seite direkt oeffnen.",
      feedbackSuccess: (name = "") => name ? `Vielen Dank fuer Ihr Feedback, ${name}. Bis bald.` : "Vielen Dank fuer Ihr Feedback. Bis bald.",
      feedbackSkipFarewell: (name = "") => name ? `Vielen Dank, ${name}. Bis bald.` : "Vielen Dank. Bis bald.",
      feedbackSkipFarewellStudent: (name = "") => name ? `Vielen Dank, ${name} 😔 Ich habe den Chat jetzt an meinen Boss weitergegeben, damit er sieht, dass ich wirklich nach einer Bewertung gefragt habe. Bis zum naechsten Mal.` : "Vielen Dank 😔 Ich habe den Chat jetzt an meinen Boss weitergegeben, damit er sieht, dass ich wirklich nach einer Bewertung gefragt habe. Bis zum naechsten Mal.",
      roleQuestion: "Damit ich Sie passender begleiten kann: In welchem Kontext besuchen Sie die Website heute?",
      optionPrompt: "Wobei soll ich Ihnen als Naechstes helfen?",
      roles: {
        recruiter: {
          label: "Recruiter",
          intro: "Ich priorisiere jetzt die staerksten Einstiegsseiten fuer Rollen-Fit, industrielle Erfahrung, Thesis, Reviews und schnellen Kontakt.",
          prompt: "Was moechten Sie zuerst pruefen?",
          topics: [
            {
              id: "fit",
              label: "Rollen-Fit",
              response: "Starten Sie mit dem Rollen-Fit-Bereich. Dort sehen Sie am schnellsten, wo das Portfolio fuer Robotik, Automatisierung, Simulation, Regelung und softwareorientierte Engineering-Rollen am staerksten ist.",
              actions: [
                { label: "Where I Fit", target: createHelpBotHomeTarget("where-i-fit") },
                { label: "CV anfragen", target: createHelpBotPageTarget("request-cv.html") },
                { label: "Kontakt", target: createHelpBotHomeTarget("contact") }
              ]
            },
            {
              id: "projects",
              label: "Top-Projekte",
              response: "Fuer einen schnellen technischen Scan eignen sich besonders der ROS-Vakuumroboter, der Service-Roboter und die Portfolio-Map als Uebersicht ueber alle relevanten Seiten.",
              actions: [
                { label: "Autonomer Vakuumroboter", target: createHelpBotPageTarget("project-autonomous-vacuum-robot.html") },
                { label: "Service-Roboter", target: createHelpBotPageTarget("project-service-robot.html") },
                { label: "Portfolio-Map", target: createHelpBotPageTarget("portfolio-map.html") }
              ]
            },
            {
              id: "experience",
              label: "Industrie-Erfahrung",
              response: "Der staerkste berufliche Nachweis ist die KEBA-Linie: Master-Thesis plus Werkstudentenrolle in Deutschland. Diese Kombination zeigt industriellen Kontext und technische Umsetzung.",
              actions: [
                { label: "KEBA Master-Thesis", target: createHelpBotPageTarget("experience-masters-thesis-keba.html") },
                { label: "KEBA Werkstudent", target: createHelpBotPageTarget("experience-working-student-keba.html") },
                { label: "Werdegang", target: createHelpBotPageTarget("journey.html") }
              ]
            },
            {
              id: "reviews",
              label: "Reviews und Glaubwuerdigkeit",
              response: "Sie koennen die hervorgehobenen Reviews direkt auf der Startseite lesen oder die komplette Feedback-Seite fuer oeffentliche Reviews und Kontaktwege oeffnen.",
              actions: [
                { label: "Reviews auf der Startseite", target: createHelpBotHomeTarget("reviews") },
                { label: "Feedback-Seite", target: createHelpBotPageTarget("feedback.html") },
                { label: "Kontakt", target: createHelpBotHomeTarget("contact") }
              ]
            },
            {
              id: "contact",
              label: "CV und Kontakt",
              response: "Wenn das Profil bereits passt, ist der schnellste naechste Schritt die CV-Anfrage oder direkter Kontakt ueber die Kontaktsektion.",
              actions: [
                { label: "CV anfragen", target: createHelpBotCvTarget() },
                { label: "Kontaktformular", target: createHelpBotContactFormTarget() },
                { label: "Kontaktbereich", target: createHelpBotHomeTarget("contact") }
              ]
            }
          ]
        },
        hiringManager: {
          label: "Hiring Manager",
          intro: "Ich fokussiere jetzt auf industrielle Belege, Umsetzungsnaehe, technische Tiefe und direkte Kontaktwege.",
          prompt: "Welchen Nachweis moechten Sie zuerst sehen?",
          topics: [
            {
              id: "industrial",
              label: "Industrie-Robotik",
              response: "Am aussagekraeftigsten sind die KEBA-Seiten. Sie zeigen den industriellen Kontext, Planungslogik und die Arbeit in Deutschland am deutlichsten.",
              actions: [
                { label: "KEBA Master-Thesis", target: createHelpBotPageTarget("experience-masters-thesis-keba.html") },
                { label: "KEBA Werkstudent", target: createHelpBotPageTarget("experience-working-student-keba.html") },
                { label: "Erfahrungsbereich", target: createHelpBotHomeTarget("experience") }
              ]
            },
            {
              id: "delivery",
              label: "Umsetzungsnaehe",
              response: "Wenn Sie sehen wollen, wie Theorie in praktische Umsetzung uebergeht, sind Thesis, Projektseiten und die Portfolio-Map die schnellsten Einstiege.",
              actions: [
                { label: "Portfolio-Map", target: createHelpBotPageTarget("portfolio-map.html") },
                { label: "Vakuumroboter", target: createHelpBotPageTarget("project-autonomous-vacuum-robot.html") },
                { label: "Topologie-Bag-Sealer", target: createHelpBotPageTarget("project-topology-bag-sealer.html") }
              ]
            },
            {
              id: "proof",
              label: "Projekt-Nachweise",
              response: "Fuer die technische Arbeitsprobe sind vor allem Robotik- und mechatronische Projektseiten sinnvoll. Sie decken Robotiksoftware, Steuerung und Systemdenken ab.",
              actions: [
                { label: "Service-Roboter", target: createHelpBotPageTarget("project-service-robot.html") },
                { label: "Aktive Fahrwerksregelung", target: createHelpBotPageTarget("project-active-suspension.html") },
                { label: "Projektbereich", target: createHelpBotHomeTarget("projects") }
              ]
            },
            {
              id: "reviews",
              label: "Reviews",
              response: "Die Reviews geben Ihnen eine schnelle Aussenperspektive. Oeffnen Sie die Review-Sektion oder die Feedback-Seite fuer den gesamten Review-Kontext.",
              actions: [
                { label: "Reviews", target: createHelpBotHomeTarget("reviews") },
                { label: "Feedback-Seite", target: createHelpBotPageTarget("feedback.html") },
                { label: "Kontakt", target: createHelpBotHomeTarget("contact") }
              ]
            },
            {
              id: "contact",
              label: "Kontakt",
              response: "Wenn Sie bereits einen guten Eindruck haben, fuehren CV-Anfrage, Kontaktbereich und LinkedIn am schnellsten weiter.",
              actions: [
                { label: "CV anfragen", target: createHelpBotCvTarget() },
                { label: "Kontaktformular", target: createHelpBotContactFormTarget() },
                { label: "Kontaktbereich", target: createHelpBotHomeTarget("contact") }
              ]
            }
          ]
        },
        student: {
          label: "Student",
          intro: "Ich fuehre Sie jetzt eher durch Studium, Werdegang, Thesis, Zertifikate und ausgewaehlte Projekte.",
          prompt: "Was moechten Sie zuerst sehen?",
          topics: [
            {
              id: "journey",
              label: "Studium und Werdegang",
              response: "Die Journey-Seite zeigt den Weg von Indien nach Deutschland und verbindet Ausbildung, Uebergaenge und technische Richtung sichtbar.",
              actions: [
                { label: "Journey", target: createHelpBotPageTarget("journey.html") },
                { label: "Bildung", target: createHelpBotHomeTarget("education") },
                { label: "About", target: createHelpBotHomeTarget("about") }
              ]
            },
            {
              id: "thesis",
              label: "Master-Thesis",
              response: "Die KEBA-Thesis ist die beste Seite, wenn Sie sehen wollen, wie akademische Arbeit in einen industriellen Robotik-Kontext uebergeht.",
              actions: [
                { label: "KEBA Master-Thesis", target: createHelpBotPageTarget("experience-masters-thesis-keba.html") },
                { label: "Erfahrung", target: createHelpBotHomeTarget("experience") },
                { label: "Reviews", target: createHelpBotHomeTarget("reviews") }
              ]
            },
            {
              id: "projects",
              label: "Projekte",
              response: "Fuer einen kompakten Projektueberblick eignen sich der Vakuumroboter, der Service-Roboter und die Portfolio-Map.",
              actions: [
                { label: "Vakuumroboter", target: createHelpBotPageTarget("project-autonomous-vacuum-robot.html") },
                { label: "Service-Roboter", target: createHelpBotPageTarget("project-service-robot.html") },
                { label: "Portfolio-Map", target: createHelpBotPageTarget("portfolio-map.html") }
              ]
            },
            {
              id: "certificates",
              label: "Zertifikate",
              response: "Im Zertifikate-Bereich finden Sie die kompakteste Sammlung zusaetzlicher Nachweise neben Studium und Projekten.",
              actions: [
                { label: "Zertifikate", target: createHelpBotHomeTarget("certificates") },
                { label: "Bildung", target: createHelpBotHomeTarget("education") },
                { label: "Journey", target: createHelpBotPageTarget("journey.html") }
              ]
            },
            {
              id: "reviews",
              label: "Reviews",
              response: "Wenn Sie sehen moechten, wie andere die Website und das Profil wahrnehmen, lesen Sie die hervorgehobenen Reviews oder die komplette Feedback-Seite.",
              actions: [
                { label: "Reviews", target: createHelpBotHomeTarget("reviews") },
                { label: "Feedback-Seite", target: createHelpBotPageTarget("feedback.html") },
                { label: "Kontakt", target: createHelpBotHomeTarget("contact") }
              ]
            },
            {
              id: "contact",
              label: "Kontakt",
              response: "Fuer direkte Fragen fuehren Kontaktbereich und Feedback-Seite am schnellsten weiter.",
              actions: [
                { label: "Kontaktformular", target: createHelpBotContactFormTarget() },
                { label: "Kontaktbereich", target: createHelpBotHomeTarget("contact") },
                { label: "CV anfragen", target: createHelpBotCvTarget() }
              ]
            }
          ]
        },
        collaborator: {
          label: "Kollaborationspartner",
          intro: "Ich fokussiere jetzt auf technischen Stack, Projektlogik, GitHub, Portfolio-Map und Kontaktwege.",
          prompt: "Womit soll ich Sie zuerst weiterleiten?",
          topics: [
            {
              id: "stack",
              label: "Technischer Stack",
              response: "Beginnen Sie mit dem Skills-Bereich und pruefen Sie danach die Projektseiten, damit Werkzeuge und Anwendung direkt zusammen sichtbar werden.",
              actions: [
                { label: "Skills", target: createHelpBotHomeTarget("skills") },
                { label: "Projektbereich", target: createHelpBotHomeTarget("projects") },
                { label: "GitHub", target: createHelpBotExternalTarget("https://github.com/SoorajSudhakaran1199") }
              ]
            },
            {
              id: "projects",
              label: "Projekt-Logik",
              response: "Fuer den technischen Ablauf und das Systemdenken eignen sich Portfolio-Map, Vakuumroboter und Service-Roboter als bester Einstieg.",
              actions: [
                { label: "Portfolio-Map", target: createHelpBotPageTarget("portfolio-map.html") },
                { label: "Vakuumroboter", target: createHelpBotPageTarget("project-autonomous-vacuum-robot.html") },
                { label: "Service-Roboter", target: createHelpBotPageTarget("project-service-robot.html") }
              ]
            },
            {
              id: "github",
              label: "GitHub und Map",
              response: "Wenn Sie das Profil schnell strukturiert sichten wollen, kombinieren Sie GitHub mit der Portfolio-Map fuer einen schnelleren Ueberblick.",
              actions: [
                { label: "GitHub", target: createHelpBotExternalTarget("https://github.com/SoorajSudhakaran1199") },
                { label: "Portfolio-Map", target: createHelpBotPageTarget("portfolio-map.html") },
                { label: "Journey", target: createHelpBotPageTarget("journey.html") }
              ]
            },
            {
              id: "journey",
              label: "Werdegang",
              response: "Die Journey-Seite verbindet Hintergrund, Standortwechsel nach Deutschland und technische Entwicklung in einer zusammenhaengenden Geschichte.",
              actions: [
                { label: "Journey", target: createHelpBotPageTarget("journey.html") },
                { label: "About", target: createHelpBotHomeTarget("about") },
                { label: "Erfahrung", target: createHelpBotHomeTarget("experience") }
              ]
            },
            {
              id: "reviews",
              label: "Reviews",
              response: "Reviews helfen, die Aussenwahrnehmung schnell einzuordnen. Sie koennen die Startseiten-Reviews oder die Feedback-Seite oeffnen.",
              actions: [
                { label: "Reviews", target: createHelpBotHomeTarget("reviews") },
                { label: "Feedback-Seite", target: createHelpBotPageTarget("feedback.html") },
                { label: "Kontakt", target: createHelpBotHomeTarget("contact") }
              ]
            },
            {
              id: "contact",
              label: "Kontakt",
              response: "Fuer Zusammenarbeit oder technische Rueckfragen fuehren Kontaktbereich, Feedback-Seite und LinkedIn am schnellsten weiter.",
              actions: [
                { label: "Kontaktformular", target: createHelpBotContactFormTarget() },
                { label: "Kontaktbereich", target: createHelpBotHomeTarget("contact") },
                { label: "CV anfragen", target: createHelpBotCvTarget() }
              ]
            }
          ]
        },
        visitor: {
          label: "Besucher",
          intro: "Ich gebe Ihnen jetzt einen schnellen Einstieg ueber Ueberblick, Projekte, Werdegang, Reviews und Kontakt.",
          prompt: "Womit moechten Sie beginnen?",
          topics: [
            {
              id: "overview",
              label: "Ueberblick",
              response: "Beginnen Sie mit About, Experience und Where I Fit. Damit erhalten Sie den schnellsten Gesamteindruck von Profil, Richtung und Rolle.",
              actions: [
                { label: "About", target: createHelpBotHomeTarget("about") },
                { label: "Erfahrung", target: createHelpBotHomeTarget("experience") },
                { label: "Where I Fit", target: createHelpBotHomeTarget("where-i-fit") }
              ]
            },
            {
              id: "projects",
              label: "Ausgewaehlte Projekte",
              response: "Wenn Sie direkt in die Arbeit einsteigen wollen, fuehren Projektbereich, Vakuumroboter und Portfolio-Map am schnellsten weiter.",
              actions: [
                { label: "Projektbereich", target: createHelpBotHomeTarget("projects") },
                { label: "Vakuumroboter", target: createHelpBotPageTarget("project-autonomous-vacuum-robot.html") },
                { label: "Portfolio-Map", target: createHelpBotPageTarget("portfolio-map.html") }
              ]
            },
            {
              id: "journey",
              label: "Journey",
              response: "Die Journey-Seite zeigt den persoenlichen und technischen Weg kompakt und ist gut geeignet, wenn Sie den Hintergrund hinter dem Portfolio verstehen wollen.",
              actions: [
                { label: "Journey", target: createHelpBotPageTarget("journey.html") },
                { label: "Bildung", target: createHelpBotHomeTarget("education") },
                { label: "Erfahrung", target: createHelpBotHomeTarget("experience") }
              ]
            },
            {
              id: "reviews",
              label: "Reviews",
              response: "Lesen Sie die hervorgehobenen Reviews direkt auf der Startseite oder oeffnen Sie die Feedback-Seite fuer den ganzen Review- und Kontaktkontext.",
              actions: [
                { label: "Reviews", target: createHelpBotHomeTarget("reviews") },
                { label: "Feedback-Seite", target: createHelpBotPageTarget("feedback.html") },
                { label: "Kontakt", target: createHelpBotHomeTarget("contact") }
              ]
            },
            {
              id: "contact",
              label: "Kontakt",
              response: "Wenn Sie direkt eine Frage stellen moechten, fuehren Kontaktbereich und Feedback-Seite am schnellsten weiter.",
              actions: [
                { label: "Kontaktformular", target: createHelpBotContactFormTarget() },
                { label: "Kontaktbereich", target: createHelpBotHomeTarget("contact") },
                { label: "CV anfragen", target: createHelpBotCvTarget() }
              ]
            }
          ]
        }
      }
    };
  }

  return {
    nudgeBadge: "AI Assistant",
    nudge: "Hi, I am the AI Assistant of Sooraj. Want help finding something faster?",
    launcher: "Open chat with Sooraj",
    badge: "AI Assistant of Sooraj",
    assistantName: "AI Assistant",
    typingAnnouncement: "The AI Assistant is typing.",
    title: "AI Assistant of Sooraj",
    lead: "I can personally guide you through my projects, experience, reviews, CV, and contact paths.",
    endChat: "End chat",
    continueChat: "Continue chat",
    startFresh: "Start fresh",
    resumeQuestion: "Welcome back. Would you like to continue where you left off or start a new chat?",
    ended: "The chat has ended. Open the assistant any time to start again.",
    reset: "Start over",
    close: "Close chat",
    welcome: "Hi, I am the AI Assistant of Sooraj Sudhakaran. I can help guide you through the website and quickly take you to the right sections.",
    askName: "Before I guide you further, what should I call you?",
    askNamePlaceholder: "Type your name",
    askNameSubmit: "Send",
    askNameGreeting: (name) => `Welcome ${name} 👋😊 I am here to help guide you through the website today.`,
    askUniversity: (name) => `Glad you are here, ${name} 👋 Which university should I connect your path with today?`,
    askUniversityPlaceholder: "Type your university",
    askUniversitySubmit: "Continue",
    askUniversitySkip: "Start without university",
    askUniversityAdd: "Add university",
    askUniversityContinue: "Continue without university",
    askUniversityConfirmGeneric: (university) => `Just to confirm 😊 are you from ${university}?`,
    askUniversityConfirmDeggendorf: "Ohh 😄 are you from Deggendorf Institute of Technology, Germany?",
    askUniversityConfirmKtu: "Ohh 😄 are you from APJ Abdul Kalam Technological University?",
    askUniversityConfirmYes: "Yes, that's right",
    askUniversityConfirmRetype: "No, type again",
    askUniversitySameMatch: (name) => `Wow ${name} 😄✨ That is a direct match with my boss's current Master's in Mechatronics path in Germany. That makes this connection feel especially close and interesting.`,
    askUniversityKtuMatch: (name) => `Wow ${name} 😄✨ That links directly to my boss's Bachelor's in Mechanical Engineering path in India. That makes this exchange feel even more connected and interesting.`,
    askUniversitySaved: (name) => `Nice ${name} 😊 Thanks for sharing your university details. I’ll keep that in mind while I guide you.`,
    askUniversitySkipped: (name) => `Ohh ${name} 😅 you just missed the little chance to match with a university path I know well. That is okay though 😊 We can continue, or you can still add your university now.`,
    askUniversityRetype: "No problem 😊 Please type your university once more.",
    askNameContinuePrompt: (name) => `Shall I continue with ${name}, or would you like to restart and correct the name first?`,
    askNameContinueYes: "Yes, continue",
    askNameContinueRestart: "No, start again",
    askNameRestarting: "Let’s start again. Don’t worry 😊",
    askNameBossPrompt: (name) => `${name} sounds very similar to my boss's name 😄 May I still call you ${name}?`,
    askNameBossYes: "Yes, call me that",
    askNameBossRetype: "No, type my name again",
    askNameBossRetypePrompt: "All right 😊 Please type your name once more.",
    askNameInvalid: "That does not look like a real name yet. Please enter your correct name.",
    searchWebsiteLabel: "❓ Ask a question",
    searchWebsitePrompt: "Ask any question, keyword, role, tool, or topic you want. I’ll search the website and route you to the closest matching place.",
    searchWebsitePlaceholder: "For example ROS, thesis, KEBA, journey, CV ...",
    searchWebsiteSubmit: "Ask",
    searchWebsiteSearching: "I’m searching the website for the closest match ...",
    searchWebsiteDeepSearching: "I’m running a deeper search across the website now ...",
    searchWebsiteQuestionFound: (label) => `Did you mean this question?\n${label}`,
    searchWebsiteQuestionFoundMultiple: "I found multiple matching questions. Did you mean any of these?",
    searchWebsiteFound: (label) => `I found a strong match: ${label}. Would you like me to open that section now?`,
    searchWebsiteFoundMultiple: "I found multiple relevant matches. Are you asking for one of these sections?",
    searchWebsiteAnswerYes: "Yes, answer this",
    searchWebsiteAnswerNo: "No, ask again",
    searchWebsiteOpenYes: "Yes, open it",
    searchWebsiteOpenNo: "No, search once more",
    searchWebsiteRetryPrompt: "Search failed. Please try exactly one keyword now, and I’ll search again.",
    searchWebsiteDeepRetryPrompt: "Search failed again. Please enter only one precise keyword now, and I’ll run a deeper search right away.",
    searchWebsiteNoResult: "I still could not understand the question clearly. If you want, I can pass this question to Sooraj directly.\nYou can start a contact request now, ask again, or go back to the main menu.",
    searchWebsiteMainMenu: "Go to main menu",
    searchWebsiteContact: "Ask Sooraj",
    searchWebsiteAskAgain: "Ask again",
    visitorProfileConsent: "Hi visitor 👋 Would you be willing to share a few quick details like your name, position, and organisation so I can address you better?",
    visitorProfileShare: "Yes, I’ll share",
    visitorProfileSkip: "No, continue directly",
    visitorNamePrompt: "What should I call you?",
    visitorNamePlaceholder: "Type your name",
    visitorNameSubmit: "Continue",
    visitorNameSkip: "Continue without name",
    visitorPositionPrompt: "What is your current position or role?",
    visitorPositionPlaceholder: "Type your position",
    visitorPositionSubmit: "Continue",
    visitorPositionSkip: "Continue without position",
    visitorOrganizationPrompt: "Which organisation or company are you from?",
    visitorOrganizationPlaceholder: "Type your organisation",
    visitorOrganizationSubmit: "Finish",
    visitorOrganizationSkip: "Continue without organisation",
    visitorProfileThanks: (name, position, organisation) => {
      const details = [name, position, organisation].filter(Boolean);
      if (!details.length) return "No problem 👋 I’ll still guide you properly from here.";
      return `Thanks ${name || "there"} 👋 I’ll keep ${details.join(" • ")} in mind and tailor the next steps a bit more closely for you.`;
    },
    feedbackPrompt: (name = "") => name
      ? `Before you go, ${name}, would you like me to take your review here in the chat?`
      : "Before you go, would you like me to take your review here in the chat?",
    feedbackPromptCollectHere: "Yes, start the review session",
    feedbackPublicOption: "Public review",
    feedbackPrivateOption: "Private feedback",
    recruiterContactPrompt: "Would you like to contact Sooraj first, or request his CV first?",
    recruiterContactChooseContact: "Contact Sooraj",
    recruiterContactChooseCv: "Request CV",
    recruiterContactNamePrompt: "What name should I use for the contact request?",
    recruiterContactNamePlaceholder: "Type your full name",
    recruiterContactEmailPrompt: "Which email address should I use for the contact request?",
    recruiterContactEmailPlaceholder: "Type your email address",
    recruiterContactCountryPrompt: "Which country are you writing from?",
    recruiterContactCountryPlaceholder: "Type your country",
    recruiterContactMessagePrompt: "What message should I send to Sooraj?",
    recruiterContactMessagePlaceholder: "Type your contact message",
    recruiterContactSubmit: "Send contact request",
    recruiterCvEmailPrompt: "Which email address should receive the CV?",
    recruiterCvEmailPlaceholder: "Type your email address",
    recruiterCvSubmit: "Send CV request",
    recruiterInvalidMessage: "Please write a slightly clearer message.",
    recruiterContactSuccess: (name = "") => name ? `Thank you, ${name}. Your contact request was sent through the chat.` : "Thank you. Your contact request was sent through the chat.",
    recruiterCvSuccess: (name = "") => name ? `Thank you, ${name}. The CV request was sent through the chat.` : "Thank you. The CV request was sent through the chat.",
    recruiterContactAskCvAfter: "Would you also like to request Sooraj's CV for your validation now?",
    recruiterCvAskContactAfter: "Would you also like to send a direct contact request to Sooraj now?",
    recruiterFollowupYesCv: "Yes, request CV",
    recruiterFollowupYesContact: "Yes, send contact request",
    recruiterFollowupNo: "No, finish here",
    recruiterUsingSameEmailForCv: "I’ll use the email address from your contact request for that.",
    recruiterSubmissionError: "The submission did not go through just now. Please try again.",
    feedbackSkipOption: "End without review",
    feedbackSkipConfirmPromptStudent: (name = "") => name
      ? `Ohh ${name} 😅 I will send our chat to Sooraj for safety so he can see that I really did ask for a review.\nIf you want to keep me safe, please leave a short review. I can collect everything right here in the chat, so you do not need to open the large feedback form.\nAre you sure you want to continue without a review?`
      : `Ohh 😅 I will send our chat to Sooraj for safety so he can see that I really did ask for a review.\nIf you want to keep me safe, please leave a short review. I can collect everything right here in the chat, so you do not need to open the large feedback form.\nAre you sure you want to continue without a review?`,
      feedbackSkipConfirmLeave: "No, end without review",
      feedbackSkipConfirmReview: "Yes, I’ll add a review",
    feedbackStudentReviewModePrompt: "Thank you 😊 Shall I take your review directly here in the chat?",
    feedbackStudentReviewModeChat: "Yes, start the review session",
    feedbackIntro: (mode) => mode === "public"
      ? "Great. I’ll collect the required details for a public review directly inside this chat."
      : "Great. I’ll collect the required details for private feedback directly inside this chat.",
    feedbackUsingName: (name) => `I’ll use your name as ${name}.`,
    feedbackNamePrompt: "What name should I use for this feedback?",
    feedbackNamePlaceholder: "Type your name",
    feedbackCompanyPrompt: "Which company, organisation, or university should I mention?",
    feedbackCompanyPlaceholder: "Company, organisation, or university",
    feedbackEmailPrompt: "Which email address should I attach to this feedback?",
    feedbackEmailPlaceholder: "Type your email address",
    feedbackCountryPrompt: "Which country are you writing from?",
    feedbackCountryPlaceholder: "Type your country",
    feedbackRatingPrompt: "How would you rate the website overall?",
    feedbackCommentPrompt: (mode) => mode === "public"
      ? "Please write your review comment now. This text can appear publicly after approval."
      : "Please write your private feedback now. This stays private.",
    feedbackCommentPlaceholder: (mode) => mode === "public"
      ? "Type your public review"
      : "Type your private feedback",
    feedbackContinue: "Continue",
    feedbackSubmitPublic: "Submit review",
    feedbackSubmitPrivate: "Send feedback",
    feedbackRetry: "Try again",
    feedbackEdit: "Edit text",
    feedbackOpenPage: "Open feedback page",
    feedbackInvalidName: "Please enter your name.",
    feedbackInvalidCompany: "Please enter your company, organisation, or university.",
    feedbackInvalidEmail: "Please enter a valid email address.",
    feedbackInvalidCountry: "Please enter your country.",
    feedbackInvalidComments: "Please write a slightly longer comment.",
    feedbackFailure: "The submission did not go through just now. You can try again, adjust your text, or open the feedback page directly.",
    feedbackSuccess: (name = "") => name ? `Thank you for your feedback, ${name}. See you again.` : "Thank you for your feedback. See you again.",
    feedbackSkipFarewell: (name = "") => name ? `Thank you, ${name}. See you again.` : "Thank you. See you again.",
    feedbackSkipFarewellStudent: (name = "") => name ? `Thank you, ${name} 😔 I have sent this chat to my boss so he can see that I really did ask for a review. See you next time.` : "Thank you 😔 I have sent this chat to my boss so he can see that I really did ask for a review. See you next time.",
    roleQuestion: "So I can guide you more appropriately, may I ask in what context you are visiting the website today?",
    optionPrompt: "What should I help you with next?",
    roles: {
      recruiter: {
        label: "Recruiter",
        intro: "I’ll prioritise the strongest hiring paths now: role fit, industrial experience, thesis work, reviews, and fast contact options.",
        prompt: "What would you like to evaluate first?",
        topics: [
          {
            id: "fit",
            label: "Best role fit",
            response: "Start with the role-fit section. It gives the fastest summary of where the portfolio is strongest for robotics, automation, simulation, controls, and software-facing engineering roles.",
            actions: [
              { label: "Check Where I Fit", target: createHelpBotHomeTarget("where-i-fit") },
              { label: "Request CV", target: createHelpBotPageTarget("request-cv.html") },
              { label: "Go to contact", target: createHelpBotHomeTarget("contact") }
            ]
          },
          {
            id: "projects",
            label: "Top projects",
            response: "For a quick technical scan, start with the ROS autonomous vacuum robot, the service robot, and the portfolio map for a faster overview of the portfolio structure.",
            actions: [
              { label: "Autonomous vacuum robot", target: createHelpBotPageTarget("project-autonomous-vacuum-robot.html") },
              { label: "Service robot", target: createHelpBotPageTarget("project-service-robot.html") },
              { label: "Portfolio map", target: createHelpBotPageTarget("portfolio-map.html") }
            ]
          },
          {
            id: "experience",
            label: "Industrial experience",
            response: "The strongest professional proof is the KEBA path: master's thesis plus working-student experience in Germany. Together they show industrial context and technical execution.",
            actions: [
              { label: "KEBA master's thesis", target: createHelpBotPageTarget("experience-masters-thesis-keba.html") },
              { label: "KEBA working student role", target: createHelpBotPageTarget("experience-working-student-keba.html") },
              { label: "Journey page", target: createHelpBotPageTarget("journey.html") }
            ]
          },
          {
            id: "reviews",
            label: "Reviews and credibility",
            response: "You can read featured reviews directly on the homepage or open the full feedback page for public reviews and direct contact paths.",
            actions: [
              { label: "Open reviews section", target: createHelpBotHomeTarget("reviews") },
              { label: "Open feedback page", target: createHelpBotPageTarget("feedback.html") },
              { label: "Go to contact", target: createHelpBotHomeTarget("contact") }
            ]
          },
          {
            id: "contact",
            label: "CV and contact",
            response: "If the profile already looks relevant, the fastest next step is the CV request page or direct contact through the contact section.",
            actions: [
              { label: "Request CV", target: createHelpBotCvTarget() },
              { label: "Open contact form", target: createHelpBotContactFormTarget() },
              { label: "Open contact section", target: createHelpBotHomeTarget("contact") }
            ]
          }
        ]
      },
      hiringManager: {
        label: "Hiring manager",
        intro: "I’ll focus on industrial proof, delivery-ready work, technical depth, and direct hiring paths.",
        prompt: "Which proof would you like to review first?",
        topics: [
          {
            id: "industrial",
            label: "Industrial robotics proof",
            response: "The clearest industrial proof is on the KEBA pages. They show the industrial environment, planning logic, and applied robotics work most directly.",
            actions: [
              { label: "KEBA master's thesis", target: createHelpBotPageTarget("experience-masters-thesis-keba.html") },
              { label: "KEBA working student role", target: createHelpBotPageTarget("experience-working-student-keba.html") },
              { label: "Experience section", target: createHelpBotHomeTarget("experience") }
            ]
          },
          {
            id: "delivery",
            label: "Delivery-ready work",
            response: "If you want to see how study, engineering logic, and practical implementation connect, start with the thesis, project pages, and the portfolio map.",
            actions: [
              { label: "Portfolio map", target: createHelpBotPageTarget("portfolio-map.html") },
              { label: "Autonomous vacuum robot", target: createHelpBotPageTarget("project-autonomous-vacuum-robot.html") },
              { label: "Topology bag sealer", target: createHelpBotPageTarget("project-topology-bag-sealer.html") }
            ]
          },
          {
            id: "proof",
            label: "Project evidence",
            response: "For technical working proof, the robotics and mechatronics project pages are the best scan. They cover robotics software, controls thinking, and systems engineering.",
            actions: [
              { label: "Service robot", target: createHelpBotPageTarget("project-service-robot.html") },
              { label: "Active suspension", target: createHelpBotPageTarget("project-active-suspension.html") },
              { label: "Projects section", target: createHelpBotHomeTarget("projects") }
            ]
          },
          {
            id: "reviews",
            label: "Reviews and references",
            response: "Reviews give a fast outside-in perspective. Open the reviews section or the feedback page for the full review context.",
            actions: [
              { label: "Open reviews", target: createHelpBotHomeTarget("reviews") },
              { label: "Open feedback page", target: createHelpBotPageTarget("feedback.html") },
              { label: "Open contact", target: createHelpBotHomeTarget("contact") }
            ]
          },
          {
            id: "contact",
            label: "Contact paths",
            response: "If you already have a strong signal, the quickest next step is CV request, direct contact, or LinkedIn.",
            actions: [
              { label: "Request CV", target: createHelpBotCvTarget() },
              { label: "Open contact form", target: createHelpBotContactFormTarget() },
              { label: "Open contact section", target: createHelpBotHomeTarget("contact") }
            ]
          }
        ]
      },
      student: {
        label: "Student",
        intro: "I’ll guide you through the study path, journey, thesis, certificates, and selected projects.",
        prompt: "What would you like to see first?",
        topics: [
          {
            id: "journey",
            label: "Study and journey",
            response: "The journey page is the best place to understand the path from India to Germany and how the academic route connects to the technical direction.",
            actions: [
              { label: "Open journey page", target: createHelpBotPageTarget("journey.html") },
              { label: "Open education section", target: createHelpBotHomeTarget("education") },
              { label: "Open about section", target: createHelpBotHomeTarget("about") }
            ]
          },
          {
            id: "thesis",
            label: "Master's thesis",
            response: "The KEBA thesis page is the strongest example of academic work moving into an industrial robotics setting.",
            actions: [
              { label: "Open KEBA thesis page", target: createHelpBotPageTarget("experience-masters-thesis-keba.html") },
              { label: "Open experience section", target: createHelpBotHomeTarget("experience") },
              { label: "Read reviews", target: createHelpBotHomeTarget("reviews") }
            ]
          },
          {
            id: "projects",
            label: "Projects",
            response: "For a compact project view, the autonomous vacuum robot, service robot, and portfolio map are the best starting points.",
            actions: [
              { label: "Autonomous vacuum robot", target: createHelpBotPageTarget("project-autonomous-vacuum-robot.html") },
              { label: "Service robot", target: createHelpBotPageTarget("project-service-robot.html") },
              { label: "Portfolio map", target: createHelpBotPageTarget("portfolio-map.html") }
            ]
          },
          {
            id: "certificates",
            label: "Certificates",
            response: "The certificates section is the fastest place to review additional proof alongside education and projects.",
            actions: [
              { label: "Open certificates", target: createHelpBotHomeTarget("certificates") },
              { label: "Open education", target: createHelpBotHomeTarget("education") },
              { label: "Open journey", target: createHelpBotPageTarget("journey.html") }
            ]
          },
          {
            id: "reviews",
            label: "Reviews",
            response: "If you want to see how others respond to the site and profile, open the featured reviews or the full feedback page.",
            actions: [
              { label: "Open reviews", target: createHelpBotHomeTarget("reviews") },
              { label: "Open feedback page", target: createHelpBotPageTarget("feedback.html") },
              { label: "Open contact", target: createHelpBotHomeTarget("contact") }
            ]
          },
          {
            id: "contact",
            label: "Contact",
            response: "For direct questions, the contact section and feedback page are the fastest routes.",
            actions: [
              { label: "Open contact form", target: createHelpBotContactFormTarget() },
              { label: "Open contact section", target: createHelpBotHomeTarget("contact") },
              { label: "Request CV", target: createHelpBotCvTarget() }
            ]
          }
        ]
      },
      collaborator: {
        label: "Collaborator",
        intro: "I’ll focus on the technical stack, project logic, GitHub, the portfolio map, and contact paths.",
        prompt: "Where should I route you first?",
        topics: [
          {
            id: "stack",
            label: "Technical stack",
            response: "Start with the skills section and then cross-check it with the project pages so tools and applied work are visible together.",
            actions: [
              { label: "Open skills section", target: createHelpBotHomeTarget("skills") },
              { label: "Open projects section", target: createHelpBotHomeTarget("projects") },
              { label: "Open GitHub", target: createHelpBotExternalTarget("https://github.com/SoorajSudhakaran1199") }
            ]
          },
          {
            id: "projects",
            label: "Project walkthrough",
            response: "For systems thinking and implementation flow, the portfolio map, autonomous vacuum robot, and service robot are the strongest entry points.",
            actions: [
              { label: "Open portfolio map", target: createHelpBotPageTarget("portfolio-map.html") },
              { label: "Autonomous vacuum robot", target: createHelpBotPageTarget("project-autonomous-vacuum-robot.html") },
              { label: "Service robot", target: createHelpBotPageTarget("project-service-robot.html") }
            ]
          },
          {
            id: "github",
            label: "GitHub and map",
            response: "If you want a faster structural scan, combine GitHub with the portfolio map for both code-facing and website-facing overview.",
            actions: [
              { label: "Open GitHub", target: createHelpBotExternalTarget("https://github.com/SoorajSudhakaran1199") },
              { label: "Open portfolio map", target: createHelpBotPageTarget("portfolio-map.html") },
              { label: "Open journey page", target: createHelpBotPageTarget("journey.html") }
            ]
          },
          {
            id: "journey",
            label: "Journey and context",
            response: "The journey page connects background, the move to Germany, and the technical direction in one place.",
            actions: [
              { label: "Open journey page", target: createHelpBotPageTarget("journey.html") },
              { label: "Open about section", target: createHelpBotHomeTarget("about") },
              { label: "Open experience section", target: createHelpBotHomeTarget("experience") }
            ]
          },
          {
            id: "reviews",
            label: "Reviews",
            response: "Reviews are useful for a quick outside-in impression. You can open the homepage reviews or the feedback page.",
            actions: [
              { label: "Open reviews", target: createHelpBotHomeTarget("reviews") },
              { label: "Open feedback page", target: createHelpBotPageTarget("feedback.html") },
              { label: "Open contact", target: createHelpBotHomeTarget("contact") }
            ]
          },
          {
            id: "contact",
            label: "Contact",
            response: "For collaboration or technical discussion, the contact section, feedback page, and LinkedIn are the fastest next steps.",
            actions: [
              { label: "Open contact form", target: createHelpBotContactFormTarget() },
              { label: "Open contact section", target: createHelpBotHomeTarget("contact") },
              { label: "Request CV", target: createHelpBotCvTarget() }
            ]
          }
        ]
      },
      visitor: {
        label: "General visitor",
        intro: "I’ll give you a fast path through the overview, projects, journey, reviews, and contact pages.",
        prompt: "Where would you like to start?",
        topics: [
          {
            id: "overview",
            label: "Start with overview",
            response: "Start with About, Experience, and Where I Fit. That gives the quickest overall picture of the profile, direction, and strongest role areas.",
            actions: [
              { label: "Open about section", target: createHelpBotHomeTarget("about") },
              { label: "Open experience section", target: createHelpBotHomeTarget("experience") },
              { label: "Open Where I Fit", target: createHelpBotHomeTarget("where-i-fit") }
            ]
          },
          {
            id: "projects",
            label: "Featured projects",
            response: "If you want to jump straight into the work, go to the projects section, the autonomous vacuum robot page, or the portfolio map.",
            actions: [
              { label: "Open projects section", target: createHelpBotHomeTarget("projects") },
              { label: "Autonomous vacuum robot", target: createHelpBotPageTarget("project-autonomous-vacuum-robot.html") },
              { label: "Open portfolio map", target: createHelpBotPageTarget("portfolio-map.html") }
            ]
          },
          {
            id: "journey",
            label: "Journey",
            response: "The journey page is the best place if you want the story behind the portfolio, not only the project list.",
            actions: [
              { label: "Open journey page", target: createHelpBotPageTarget("journey.html") },
              { label: "Open education section", target: createHelpBotHomeTarget("education") },
              { label: "Open experience section", target: createHelpBotHomeTarget("experience") }
            ]
          },
          {
            id: "reviews",
            label: "Reviews",
            response: "You can read the featured reviews directly on the homepage or open the feedback page for the full review and contact context.",
            actions: [
              { label: "Open reviews", target: createHelpBotHomeTarget("reviews") },
              { label: "Open feedback page", target: createHelpBotPageTarget("feedback.html") },
              { label: "Open contact", target: createHelpBotHomeTarget("contact") }
            ]
          },
          {
            id: "contact",
            label: "Contact",
            response: "If you already know what you need, the contact section and feedback page are the fastest routes.",
            actions: [
              { label: "Open contact section", target: createHelpBotHomeTarget("contact") },
              { label: "Open feedback page", target: createHelpBotPageTarget("feedback.html") },
              { label: "Open LinkedIn", target: createHelpBotExternalTarget("https://www.linkedin.com/in/sooraj-sudhakaran1999") }
            ]
          }
        ]
      }
    }
  };
}

function getPortfolioHelpBotArtMarkup(className = "") {
  const normalizedClass = className ? ` ${className}` : "";
  return `<img src="assets/images/help-bot-chatbot.svg" alt="" aria-hidden="true" class="help-bot-art${normalizedClass}" />`;
}

function getPortfolioHelpBotDeeperCopy(lang, roleId, topicId) {
  const deepPrompts = lang === "de"
    ? {
        explainMore: "Mehr erklaeren",
        otherTopics: "Andere Themen",
        prompt: "Moechten Sie einen tieferen Ueberblick zu diesem Bereich?",
        fallback: "Ich kann Ihnen dazu einen tieferen Ueberblick geben und Sie danach direkt zur passenden Seite weiterfuehren."
      }
    : {
        explainMore: "Explain more",
        otherTopics: "Other topics",
        prompt: "Would you like a deeper overview of this section?",
        fallback: "I can give you a deeper overview of this area and then route you directly to the most relevant page."
      };

  const details = {
    en: {
      recruiter: {
        fit: "This section is a recruiter-facing summary layer. It groups the portfolio into likely role matches such as robotics software, industrial automation, simulation, controls, and systems-oriented engineering.\nIt is useful when you want a fast decision on relevance before opening detail pages. The goal is not only to list skills, but to show where the profile is strongest in hiring terms.",
        projects: "This path is about technical proof. The project selection combines robotics software, embedded and mechatronic thinking, and practical engineering implementation across different difficulty levels.\nIt helps you quickly judge how I handle autonomy, simulation, system integration, and engineering execution instead of only reading a profile summary.",
        experience: "This section is the strongest professional evidence line in the portfolio. It connects master's thesis work and industrial working-student experience in Germany, which gives stronger hiring credibility than isolated academic projects.\nIt is the right place if you want to evaluate readiness for industrial robotics and structured engineering environments.",
        reviews: "This section adds outside-in credibility. It shows how other people responded to the work, the portfolio, and the professional impression created by the profile.\nIt works best as a supporting layer after you have seen projects or experience, because it reinforces trust and professionalism.",
        contact: "This path is for moving from evaluation to action. It keeps CV request, direct contact, and LinkedIn close together so a recruiter does not have to search for the next hiring step.\nIt is intentionally simple and conversion-oriented."
      },
      hiringManager: {
        industrial: "This section is aimed at proof of industrial relevance. The KEBA work shows planning context, robotics execution, and engineering work in a real company setting rather than only in coursework.\nIf you are evaluating practical readiness, this is one of the strongest parts of the portfolio.",
        delivery: "This path focuses on whether the work looks deliverable, not only technically interesting. It links portfolio map, thesis, and projects to show how I move from concept and simulation into structured implementation.\nThat makes it useful for managers checking execution potential.",
        proof: "This section is about technical evidence. It uses selected projects to show systems thinking, motion and control logic, robotics integration, and the ability to explain engineering work clearly.\nIt helps answer whether the portfolio has enough substance beyond a standard resume.",
        reviews: "This review path helps you see outside perception after you have looked at technical or professional proof. It is useful as a validation layer for trust, communication, and credibility.\nIt should support a hiring decision, not replace the technical evidence.",
        contact: "This path is for moving into real hiring action. It keeps the CV request and direct contact steps immediately available once the profile looks relevant.\nIt is designed to reduce friction at the decision point."
      },
      student: {
        journey: "This section is about the overall path behind the portfolio. It connects the move from India to Germany, academic development, engineering direction, and how robotics became the stronger focus over time.\nIt is useful if you want context, motivation, and study progression rather than only a project list.",
        thesis: "This section is about the master's thesis as a bridge between higher study and industrial robotics. It shows that the academic track did not stay theoretical but moved into company-facing technical work.\nIt is one of the strongest pages for understanding advanced study with practical relevance.",
        projects: "This section gives a broader view of technical learning through implementation. The selected projects show how robotics, mechatronics, and engineering logic were applied in different formats rather than only described in text.\nIt helps students see how academic foundations can translate into real project work.",
        certificates: "This section works as a supporting layer around the main degree and project pages. It adds smaller but useful signals of continued learning, tooling exposure, and structured self-development.\nIt is best read together with education and project sections.",
        reviews: "This path shows how the website and profile are perceived by others. For students, it is useful as a credibility and presentation layer after looking at study and project pages.\nIt shows how the overall portfolio comes across to visitors.",
        contact: "This path keeps the next human step simple. If a student wants to ask a question, connect, or discuss the journey, this section provides the fastest route.\nIt is meant to reduce friction between interest and outreach."
      },
      collaborator: {
        stack: "This section is about tools and engineering foundations. It should be read as a capability map, showing which technologies and working modes appear most often across the portfolio.\nIt becomes more meaningful when paired with project pages that show those tools in action.",
        projects: "This path is about how technical work is structured. It is useful for collaborators who want to understand system logic, implementation style, and how different projects connect to robotics and mechatronics thinking.\nIt gives a better picture than tools alone.",
        github: "This path combines the public code-facing identity with the portfolio structure. It helps collaborators see both the external presentation and the code-centered profile.\nThat makes it useful for technical screening before a deeper conversation.",
        journey: "This section adds the human and professional context behind the technical work. It connects background, education, relocation, and the direction toward robotics work in Germany.\nIt is useful when collaboration depends on understanding the overall path, not only current projects.",
        reviews: "This review path acts as a trust layer. It can help collaborators understand how the profile is perceived in terms of professionalism, clarity, and presentation.\nIt is supportive context rather than the core technical evidence.",
        contact: "This path is the direct collaboration route. It keeps communication simple once there is enough interest from the technical or portfolio side.\nIt is intended to make outreach easy and immediate."
      },
      visitor: {
        overview: "This section is the fastest way to understand the whole portfolio without reading every page. It combines profile direction, relevant experience, and role-fit thinking into one starting layer.\nIt is ideal for first-time visitors who want orientation before going deeper.",
        projects: "This section is the work-facing side of the portfolio. It shows selected engineering projects so a visitor can understand the technical range more quickly than through biography alone.\nIt is the best place to move from impression to proof.",
        journey: "This section explains the story behind the portfolio. It gives context to the technical work by showing the academic path, the move to Germany, and the progression into robotics.\nIt is useful if you want the narrative behind the profile.",
        reviews: "This section provides outside feedback from visitors and reviewers. It adds a sense of trust and reception after you have seen the portfolio content itself.\nIt helps answer how the profile is perceived by others.",
        contact: "This section is the direct communication path. It is for visitors who already know they want to ask something, reach out, or continue the conversation.\nIt keeps the final next step simple."
      }
    },
    de: {
      recruiter: {
        fit: "Dieser Bereich ist eine recruiter-orientierte Zusammenfassung. Er ordnet das Portfolio nach moeglichen Rollen wie Robotiksoftware, Industrieautomatisierung, Simulation, Regelung und systemnahem Engineering.\nEr ist sinnvoll, wenn Sie zuerst schnell pruefen moechten, wie gut das Profil generell zu einer Stelle passt, bevor Sie Detailseiten oeffnen.",
        projects: "Dieser Pfad zeigt vor allem technische Belege. Die Projektwahl verbindet Robotiksoftware, mechatronisches Denken und praktische Engineering-Umsetzung ueber unterschiedliche Schwierigkeitsgrade hinweg.\nSo koennen Sie schneller bewerten, wie ich mit Autonomie, Simulation, Integration und technischer Umsetzung umgehe.",
        experience: "Dieser Bereich ist die staerkste berufliche Nachweislinie im Portfolio. Er verbindet die Master-Thesis mit der Werkstudentenrolle in Deutschland und ist dadurch als Hiring-Signal staerker als einzelne Studienprojekte.\nWenn Sie industrielle Robotik-Erfahrung pruefen wollen, ist dies ein sehr relevanter Einstieg.",
        reviews: "Dieser Bereich fuegt eine Aussenperspektive hinzu. Er zeigt, wie andere auf die Arbeit, das Portfolio und den professionellen Eindruck reagieren.\nAm besten wirkt er als zusaetzliche Vertrauensebene nach Projekten oder Erfahrung.",
        contact: "Dieser Pfad ist fuer den Uebergang von Bewertung zu Handlung gedacht. CV-Anfrage, direkter Kontakt und LinkedIn bleiben bewusst nah beieinander, damit Recruiter schnell weitergehen koennen.\nDer Bereich ist klar und conversion-orientiert gehalten."
      },
      hiringManager: {
        industrial: "Dieser Bereich fokussiert den Nachweis industrieller Relevanz. Die KEBA-Seiten zeigen Planungskontext, Robotikarbeit und technische Umsetzung in einer realen Unternehmensumgebung statt nur im Studienrahmen.\nWenn Sie praktische Einsatzfaehigkeit beurteilen wollen, ist das einer der staerksten Portfolio-Teile.",
        delivery: "Dieser Pfad fragt eher nach Umsetzungsnaehe als nur nach interessanter Technik. Portfolio-Map, Thesis und Projekte zeigen gemeinsam, wie ich von Konzept und Simulation in eine strukturierte Umsetzung gehe.\nDas ist besonders fuer Hiring Manager nuetzlich.",
        proof: "Dieser Bereich sammelt technische Belege. Ausgewaehlte Projekte zeigen Systemdenken, Bewegungs- und Regelungslogik, Robotik-Integration und die Faehigkeit, technische Arbeit klar zu erklaeren.\nSo laesst sich besser einschaetzen, ob das Portfolio ueber einen Standard-Lebenslauf hinaus Substanz hat.",
        reviews: "Der Review-Pfad zeigt die Aussenwahrnehmung, nachdem Sie technische oder berufliche Nachweise gesehen haben. Er ist als Vertrauens- und Kommunikationsschicht sinnvoll.\nEr soll die fachlichen Belege unterstuetzen, nicht ersetzen.",
        contact: "Dieser Pfad fuehrt in den naechsten Hiring-Schritt. Sobald das Profil relevant wirkt, liegen CV-Anfrage und direkter Kontakt sofort bereit.\nDas reduziert Reibung am Entscheidungspunkt."
      },
      student: {
        journey: "Dieser Bereich zeigt den Gesamtweg hinter dem Portfolio. Er verbindet den Wechsel von Indien nach Deutschland, die akademische Entwicklung und die technische Richtung hin zur Robotik.\nEr ist sinnvoll, wenn Sie Motivation, Kontext und Studienweg verstehen moechten und nicht nur Projekte sehen wollen.",
        thesis: "Dieser Bereich zeigt die Master-Thesis als Bruecke zwischen weiterfuehrendem Studium und industrieller Robotik. Er macht sichtbar, dass der akademische Weg nicht theoretisch geblieben ist, sondern in reale technische Arbeit uebergegangen ist.\nDas ist eine der staerksten Seiten fuer fortgeschrittenes Studium mit Praxisbezug.",
        projects: "Dieser Bereich zeigt Lernen durch Umsetzung. Die Projekte machen sichtbar, wie Robotik, Mechatronik und technisches Denken praktisch angewendet wurden, statt nur beschrieben zu werden.\nFuer Studierende ist das hilfreich, um den Uebergang von Studium zu Projektarbeit zu sehen.",
        certificates: "Dieser Bereich ist eine unterstuetzende Ebene neben Studium und Projekten. Er zeigt kleinere, aber nuetzliche Signale fuer kontinuierliches Lernen, Tool-Erfahrung und strukturierte Weiterentwicklung.\nAm meisten Wert hat er zusammen mit Bildung und Projekten.",
        reviews: "Dieser Pfad zeigt, wie die Website und das Profil auf andere wirken. Fuer Studierende ist das vor allem als Glaubwuerdigkeits- und Praesentationsschicht interessant, nachdem Studium und Projekte gesehen wurden.\nEr zeigt den Gesamteindruck des Portfolios.",
        contact: "Dieser Pfad macht den menschlichen naechsten Schritt leicht. Wer Fragen stellen, sich vernetzen oder den Weg besprechen will, kommt hier am schnellsten weiter.\nDer Bereich senkt die Huerde zwischen Interesse und Kontakt."
      },
      collaborator: {
        stack: "Dieser Bereich zeigt Werkzeuge und technische Grundlagen. Er sollte als Faehigkeitskarte gelesen werden, also welche Technologien und Arbeitsweisen im Portfolio am haeufigsten auftauchen.\nBesonders aussagekraeftig wird er zusammen mit den Projektseiten, wo die Tools in Anwendung sichtbar werden.",
        projects: "Dieser Pfad zeigt, wie technische Arbeit strukturiert ist. Er ist sinnvoll fuer Kollaborationspartner, die Systemlogik, Umsetzungsstil und die Verbindung zwischen Robotik und mechatronischem Denken verstehen wollen.\nDas gibt meist mehr Aussagekraft als eine reine Tool-Liste.",
        github: "Dieser Pfad kombiniert die code-orientierte Oeffentlichkeit mit der Struktur des Portfolios. So sehen Kollaborationspartner sowohl die technische Aussenwirkung als auch die inhaltliche Website-Struktur.\nDas hilft bei einer schnellen technischen Einordnung.",
        journey: "Dieser Bereich fuegt den menschlichen und professionellen Kontext hinter der Technik hinzu. Er verbindet Hintergrund, Ausbildung, den Wechsel nach Deutschland und die Entwicklung hin zur Robotikarbeit.\nDas ist hilfreich, wenn Zusammenarbeit auch von Gesamtverstaendnis lebt.",
        reviews: "Dieser Review-Pfad ist eher eine Vertrauensebene. Er hilft einzuordnen, wie Profil, Professionalitaet und Praesentation auf andere wirken.\nEr ist unterstuetzender Kontext und nicht der Kern des technischen Nachweises.",
        contact: "Dieser Pfad ist die direkte Kollaborationsroute. Sobald von technischer oder Portfolio-Seite genug Interesse da ist, fuehrt er schnell in eine echte Kommunikation.\nEr soll Zusammenarbeit moeglichst einfach machen."
      },
      visitor: {
        overview: "Dieser Bereich ist der schnellste Weg, das gesamte Portfolio zu verstehen, ohne jede Seite einzeln zu lesen. Profilrichtung, relevante Erfahrung und Rollen-Fit werden hier zusammengefuehrt.\nDas ist ideal fuer Erstbesucher, die zuerst Orientierung wollen.",
        projects: "Dieser Bereich ist die arbeitsbezogene Seite des Portfolios. Er zeigt ausgewaehlte Engineering-Projekte, damit Besucher die technische Breite schneller erfassen koennen als nur ueber eine Biografie.\nHier geht es vom Eindruck zum Beleg.",
        journey: "Dieser Bereich erklaert die Geschichte hinter dem Portfolio. Er gibt dem technischen Inhalt Kontext durch Studienweg, den Wechsel nach Deutschland und die Entwicklung hin zur Robotik.\nEr ist sinnvoll, wenn Sie die Erzaehlung hinter dem Profil sehen wollen.",
        reviews: "Dieser Bereich zeigt Rueckmeldungen von Besuchern und Reviewern. Er fuegt nach dem Portfolio-Inhalt eine weitere Vertrauens- und Eindrucksebene hinzu.\nSo laesst sich besser einschaetzen, wie das Profil auf andere wirkt.",
        contact: "Dieser Bereich ist der direkte Kommunikationspfad. Er ist fuer Besucher gedacht, die bereits wissen, dass sie fragen, schreiben oder die Unterhaltung fortsetzen moechten.\nDer naechste Schritt bleibt bewusst einfach."
      }
    }
  };

  const languageMap = details[lang === "de" ? "de" : "en"] || details.en;
  return {
    ...deepPrompts,
    detail: languageMap?.[roleId]?.[topicId] || deepPrompts.fallback
  };
}

function getPortfolioHelpBotResumeMessage(lang, roleId, pageName, lastNavTarget = null, visitorName = "") {
  const topicMap = {
    student: {
      journey: lang === "de" ? "Journey" : "the journey",
      thesis: lang === "de" ? "die Master-Thesis" : "the master's thesis",
      projects: lang === "de" ? "die Projekte" : "the projects",
      certificates: lang === "de" ? "die Zertifikate" : "the certificates",
      reviews: lang === "de" ? "die Reviews" : "the reviews",
      contact: lang === "de" ? "den Kontaktbereich" : "the contact section"
    },
    recruiter: {
      fit: lang === "de" ? "den Rollen-Fit" : "role fit",
      projects: lang === "de" ? "die Projekte" : "the projects",
      experience: lang === "de" ? "die Erfahrung" : "the experience section",
      reviews: lang === "de" ? "die Reviews" : "the reviews",
      contact: lang === "de" ? "den Kontaktweg" : "the contact path"
    },
    hiringManager: {
      industrial: lang === "de" ? "die Industrie-Robotik-Nachweise" : "the industrial robotics proof",
      delivery: lang === "de" ? "die Umsetzungsnaehe" : "the delivery-ready work",
      proof: lang === "de" ? "die Projekt-Nachweise" : "the project evidence",
      reviews: lang === "de" ? "die Reviews" : "the reviews",
      contact: lang === "de" ? "den Kontaktweg" : "the contact path"
    },
    collaborator: {
      stack: lang === "de" ? "den technischen Stack" : "the technical stack",
      projects: lang === "de" ? "die Projektlogik" : "the project walkthrough",
      github: "GitHub",
      journey: lang === "de" ? "den Werdegang" : "the journey context",
      reviews: lang === "de" ? "die Reviews" : "the reviews",
      contact: lang === "de" ? "den Kontaktweg" : "the contact path"
    },
    visitor: {
      overview: lang === "de" ? "den Ueberblick" : "the overview",
      projects: lang === "de" ? "die Projekte" : "the projects",
      journey: "Journey",
      reviews: lang === "de" ? "die Reviews" : "the reviews",
      contact: lang === "de" ? "den Kontaktbereich" : "the contact section"
    }
  };

  const fromHash = lastNavTarget?.id ? String(lastNavTarget.id).trim() : "";
  const roleTopicLabel = topicMap?.[roleId]?.[fromHash] || "";

  const safeVisitorName = String(visitorName || "").trim();

  if (lang === "de") {
    if (roleId === "student" && safeVisitorName) {
      if (/^project-/.test(pageName)) {
        return roleTopicLabel
          ? `Willkommen zurueck, ${safeVisitorName} 😊 Ich hoffe, das Projekt war hilfreich. Sie kamen zuletzt ueber ${roleTopicLabel}. Soll ich Sie von dort weiterfuehren oder neu starten?`
          : `Willkommen zurueck, ${safeVisitorName} 😊 Ich bin wieder fuer Sie da. Moechten Sie dort weitermachen, wo Sie aufgehoert haben, oder neu starten?`;
      }

      if (/^experience-/.test(pageName)) {
        return roleTopicLabel
          ? `Willkommen zurueck, ${safeVisitorName} 😊 Ich hoffe, diese Erfahrungsseite war hilfreich. Sie kamen zuletzt ueber ${roleTopicLabel}. Soll ich Sie von dort weiterfuehren oder neu starten?`
          : `Willkommen zurueck, ${safeVisitorName} 😊 Ich begleite Sie gern weiter. Moechten Sie dort weitermachen, wo Sie aufgehoert haben, oder neu starten?`;
      }

      return roleTopicLabel
        ? `Willkommen zurueck, ${safeVisitorName} 😊 Ich helfe Ihnen gern weiter. Sie kamen zuletzt ueber ${roleTopicLabel}. Moechten Sie den Chat fortsetzen oder neu beginnen?`
        : `Willkommen zurueck, ${safeVisitorName} 😊 Ich helfe Ihnen gern weiter. Moechten Sie den Chat fortsetzen oder neu beginnen?`;
    }

    if (/^project-/.test(pageName)) {
      return roleTopicLabel
        ? `Willkommen zurueck. Ich hoffe, das Projekt war hilfreich. Sie kamen zuletzt ueber ${roleTopicLabel}. Moechten Sie dort weitermachen oder lieber einen neuen Chat starten?`
        : "Willkommen zurueck. Ich hoffe, das Projekt war hilfreich. Moechten Sie dort weitermachen, wo Sie aufgehoert haben, oder lieber einen neuen Chat starten?";
    }

    if (/^experience-/.test(pageName)) {
      return roleTopicLabel
        ? `Willkommen zurueck. Ich hoffe, diese Erfahrungsseite war hilfreich. Sie kamen zuletzt ueber ${roleTopicLabel}. Moechten Sie dort weitermachen oder einen neuen Chat beginnen?`
        : "Willkommen zurueck. Ich hoffe, diese Erfahrungsseite war hilfreich. Moechten Sie dort weitermachen, wo Sie aufgehoert haben, oder einen neuen Chat beginnen?";
    }

    return roleTopicLabel
      ? `Willkommen zurueck. Ich hoffe, der letzte Bereich war hilfreich. Sie kamen zuletzt ueber ${roleTopicLabel}. Moechten Sie den Chat fortsetzen oder neu beginnen?`
      : "Willkommen zurueck. Ich hoffe, der letzte Bereich war hilfreich. Moechten Sie den Chat fortsetzen oder neu beginnen?";
  }

  if (roleId === "student" && safeVisitorName) {
    if (/^project-/.test(pageName)) {
      return roleTopicLabel
        ? `Welcome back, ${safeVisitorName} 😊 I hope that project was useful. You last came here through ${roleTopicLabel}. Shall I continue from there or start fresh?`
        : `Welcome back, ${safeVisitorName} 😊 I am here to help again. Would you like to continue where you left off or start fresh?`;
    }

    if (/^experience-/.test(pageName)) {
      return roleTopicLabel
        ? `Welcome back, ${safeVisitorName} 😊 I hope that experience page was useful. You last came here through ${roleTopicLabel}. Shall I continue from there or start fresh?`
        : `Welcome back, ${safeVisitorName} 😊 I am happy to guide you again. Would you like to continue where you left off or start fresh?`;
    }

    return roleTopicLabel
      ? `Welcome back, ${safeVisitorName} 😊 I can keep helping you from ${roleTopicLabel}. Would you like to continue or start fresh?`
      : `Welcome back, ${safeVisitorName} 😊 I can help you again from here. Would you like to continue or start fresh?`;
  }

  if (/^project-/.test(pageName)) {
    return roleTopicLabel
      ? `Welcome back. I hope that project was useful. You last came here through ${roleTopicLabel}. Would you like to continue from there or start a new chat?`
      : "Welcome back. I hope that project was useful. Would you like to continue where you left off or start a new chat?";
  }

  if (/^experience-/.test(pageName)) {
    return roleTopicLabel
      ? `Welcome back. I hope that experience page was useful. You last came here through ${roleTopicLabel}. Would you like to continue from there or start a new chat?`
      : "Welcome back. I hope that experience page was useful. Would you like to continue where you left off or start a new chat?";
  }

  return roleTopicLabel
    ? `Welcome back. I hope the last section was useful. You last came here through ${roleTopicLabel}. Would you like to continue from there or start a new chat?`
    : "Welcome back. I hope the last section was useful. Would you like to continue where you left off or start a new chat?";
}

function resolveHelpBotTargetHref(target) {
  if (!target || typeof target !== "object") return "index.html";
  if (target.type === "external") return target.href || "index.html";
  if (target.type === "page") {
    return `${target.href || "index.html"}${target.hash ? `#${target.hash}` : ""}`;
  }
  if (target.type === "section") {
    const page = target.page || getCurrentPageName();
    return `${page === getCurrentPageName() ? "" : page}${target.id ? `#${target.id}` : ""}` || "index.html";
  }
  return "index.html";
}

function navigateHelpBotTarget(target, closePanel = () => {}) {
  const href = resolveHelpBotTargetHref(target);
  if (target?.type === "external") {
    closePanel();
    window.open(href, "_blank", "noopener,noreferrer");
    return;
  }

  const destination = new URL(href, window.location.href);
  const current = new URL(window.location.href);
  const isSamePage = destination.pathname === current.pathname && destination.search === current.search;

  if (isSamePage && destination.hash) {
    const id = destination.hash.replace(/^#/, "");
    const element = document.getElementById(id);
    if (element) {
      closePanel();
      const targetTop = element.getBoundingClientRect().top + window.scrollY - getScrollOffset();
      window.history.replaceState(null, "", `#${id}`);
      window.scrollTo({
        top: Math.max(targetTop, 0),
        behavior: "smooth"
      });
      return;
    }
  }

  closePanel();
  window.location.assign(href);
}

function setupPortfolioHelpBot() {
  if (document.querySelector("[data-help-bot-root]")) return;

  const HELP_BOT_NUDGE_INITIAL_DELAY_MS = 1200;
  const HELP_BOT_NUDGE_AUTO_HIDE_MS = 5200;
  const HELP_BOT_NUDGE_RESHOW_MS = 28000;
  const HELP_BOT_NUDGE_MAX_RESHOWS = 1;
  const HELP_BOT_STATE_VERSION = 10;
  const HELP_BOT_STATE_TTL_MS = 1000 * 60 * 60 * 24 * 7;
  const HELP_BOT_REMOTE_MAX_MESSAGES = 60;
  const HELP_BOT_REMOTE_SYNC_DELAY_MS = 1200;
  const HELP_BOT_STATE_MAX_MESSAGES = 28;
  const HELP_BOT_QUESTION_BANK_PATH = "assets/data/help-bot-question-bank.json";
  const HELP_BOT_QUESTION_RETRY_LIMIT = 5;
  const HELP_BOT_FOCUSABLE_SELECTOR = [
    "a[href]",
    "button:not([disabled])",
    "textarea:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "[tabindex]:not([tabindex='-1'])"
  ].join(",");
  const PANEL_TITLE_ID = "help-bot-panel-title";
  const PANEL_LEAD_ID = "help-bot-panel-lead";

  const root = document.createElement("div");
  root.className = "help-bot";
  root.dataset.helpBotRoot = "true";
  root.innerHTML = `
    <button class="help-bot-backdrop" type="button" aria-label="Close"></button>
    <section class="help-bot-panel" role="dialog" aria-modal="true" aria-hidden="true" aria-labelledby="${PANEL_TITLE_ID}" aria-describedby="${PANEL_LEAD_ID}" tabindex="-1">
      <div class="help-bot-panel-head">
        <div class="help-bot-panel-brand">
          <span class="help-bot-panel-mark">${getPortfolioHelpBotArtMarkup("help-bot-art-panel")}</span>
          <div class="help-bot-panel-copy">
            <span class="help-bot-panel-badge"></span>
            <strong class="help-bot-panel-title" id="${PANEL_TITLE_ID}"></strong>
            <p class="help-bot-panel-lead" id="${PANEL_LEAD_ID}"></p>
          </div>
        </div>
        <div class="help-bot-panel-actions">
          <button class="help-bot-head-btn" type="button" data-help-bot-reset></button>
          <button class="help-bot-head-btn help-bot-head-btn-close" type="button" data-help-bot-close>&times;</button>
        </div>
      </div>
      <div class="help-bot-messages"></div>
      <div class="help-bot-composer" hidden>
        <form class="help-bot-composer-form" data-help-bot-composer-form>
          <input class="help-bot-composer-input" type="text" name="helpBotComposer" maxlength="40" autocomplete="given-name" />
          <textarea class="help-bot-composer-textarea" name="helpBotComposerLong" rows="4" maxlength="1200" hidden></textarea>
          <button class="help-bot-composer-submit" type="submit"></button>
        </form>
        <p class="help-bot-composer-note" data-help-bot-composer-note hidden></p>
      </div>
    </section>
    <div class="sr-only help-bot-live-region" data-help-bot-live aria-live="polite" aria-atomic="false"></div>
    <div class="help-bot-dock">
      <div class="help-bot-nudge" aria-live="polite">
        <div class="help-bot-nudge-body">
          <span class="help-bot-nudge-badge"></span>
          <p class="help-bot-nudge-text"></p>
        </div>
        <button class="help-bot-nudge-close" type="button" data-help-bot-nudge-close aria-label="Close">&times;</button>
      </div>
      <button class="help-bot-launcher" type="button" aria-expanded="false">
        <span class="help-bot-launcher-orbit"></span>
        <span class="help-bot-launcher-core">
          <span class="help-bot-launcher-mark">${getPortfolioHelpBotArtMarkup("help-bot-art-launcher")}</span>
        </span>
      </button>
    </div>
  `;

  document.body.append(root);

  const backdrop = root.querySelector(".help-bot-backdrop");
  const panel = root.querySelector(".help-bot-panel");
  const launcher = root.querySelector(".help-bot-launcher");
  const nudge = root.querySelector(".help-bot-nudge");
  const nudgeBadge = root.querySelector(".help-bot-nudge-badge");
  const nudgeText = root.querySelector(".help-bot-nudge-text");
  const nudgeCloseButton = root.querySelector("[data-help-bot-nudge-close]");
  const badge = root.querySelector(".help-bot-panel-badge");
  const title = root.querySelector(".help-bot-panel-title");
  const lead = root.querySelector(".help-bot-panel-lead");
  const resetButton = root.querySelector("[data-help-bot-reset]");
  const closeButton = root.querySelector("[data-help-bot-close]");
  const messages = root.querySelector(".help-bot-messages");
  const composer = root.querySelector(".help-bot-composer");
  const composerForm = root.querySelector("[data-help-bot-composer-form]");
  const composerInput = root.querySelector(".help-bot-composer-input");
  const composerTextarea = root.querySelector(".help-bot-composer-textarea");
  const composerSubmit = root.querySelector(".help-bot-composer-submit");
  const composerNote = root.querySelector("[data-help-bot-composer-note]");
  const liveRegion = root.querySelector("[data-help-bot-live]");

  let currentLang = resolveInitialLanguage();
  let config = getPortfolioHelpBotConfig(currentLang);
  let currentRoleId = "";
  let hasConversationBooted = false;
  let nudgeHideTimer = 0;
  let nudgeReshowTimer = 0;
  let nudgeReshowCount = 0;
  let hasDismissedNudge = false;
  let activeTypingIndicator = null;
  let responseToken = 0;
  let lastFocusedElement = null;
  let inlineNudgeOverrideMessage = "";
  let hoverNudgeTimer = 0;
  const currentPageName = getCurrentPageName();

  const normalizeVisitorName = (value) => String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 40);

  const INVALID_VISITOR_NAME_WORDS = new Set([
    "a", "aa", "aaa", "ab", "abc", "bot", "chat", "ello", "hallo", "hello", "hey", "hi",
    "hola", "hii", "hlo", "me", "name", "no", "ok", "s", "sa", "ss", "srj", "test", "user", "yo"
  ]);

  const isPlausibleVisitorName = (value = "") => {
    const normalized = normalizeVisitorName(value);
    if (!normalized) return false;
    const compact = normalized.toLowerCase().replace(/[^a-z]/g, "");
    if (compact.length < 3) return false;
    if (INVALID_VISITOR_NAME_WORDS.has(compact)) return false;
    if (/^(.)\1+$/.test(compact)) return false;
    if (!/[a-z]{3,}/.test(compact)) return false;
    return true;
  };

  const normalizeUniversityName = (value) => String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 90);

  const normalizeVisitorPosition = (value) => String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);

  const normalizeVisitorOrganization = (value) => String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);

  const normalizeFeedbackName = (value) => String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);

  const normalizeFeedbackCompany = (value) => String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);

  const normalizeFeedbackEmail = (value) => String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);

  const normalizeFeedbackCountry = (value) => String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);

  const normalizeFeedbackComments = (value) => String(value || "")
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, 1200);

  const isValidFeedbackEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
  const HELP_BOT_FEEDBACK_FIELDS = ["name", "company", "email", "country", "comments"];
  const HELP_BOT_PENDING_INPUT_KINDS = ["visitor-name", "visitor-position", "visitor-organization", "student-university", "chat-feedback", "recruiter-request", "website-search"];
  const HELP_BOT_RECRUITER_REQUEST_FIELDS = ["fullName", "email", "country", "message"];

  const roleNeedsNamePrompt = (roleId) => roleId === "student";
  const roleUsesVisitorName = (roleId) => roleId === "student" || roleId === "visitor";
  const isBossLikeVisitorName = (value) => {
    const key = normalizeVisitorName(value)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "");
    if (!key) return false;
    return key === "sooraj"
      || key === "srj"
      || key === "sudhakaran"
      || key === "soorajsudhakaran"
      || key === "sudhakaransooraj";
  };

  const normalizeUniversityKey = (value) => normalizeUniversityName(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

  const isDeggendorfUniversity = (value) => {
    const key = normalizeUniversityKey(value);
    if (!key) return false;
    return key === "thd"
      || key === "dit"
      || key === "deg"
      || key.includes("deggendorf")
      || key.includes("deggendorf institute of technology")
      || key.includes("technical university of deggendorf")
      || key.includes("th deggendorf");
  };

  const isKtuUniversity = (value) => {
    const key = normalizeUniversityKey(value);
    if (!key) return false;
    return key === "ktu"
      || key.includes("abdul kalam")
      || key.includes("kalam technical")
      || key.includes("kalam technological")
      || key.includes("apj")
      || key.includes("kerala technical")
      || key.includes("kerala technological")
      || key.includes("sree buddha")
      || key === "sbc"
      || key === "sbce"
      || key.includes("sree buddha college")
      || key.includes("sree buddha college of engineering");
  };

  const normalizeHelpBotUniversityCandidate = (raw) => {
    const source = raw && typeof raw === "object" ? raw : {};
    const typed = normalizeUniversityName(source.typed);
    const canonical = normalizeUniversityName(source.canonical);
    const matchType = ["generic", "deggendorf", "ktu"].includes(String(source.matchType || "").trim())
      ? String(source.matchType || "").trim()
      : "";
    if (!typed || !canonical || !matchType) return null;
    return { typed, canonical, matchType };
  };

  const inferUniversityCandidate = (value) => {
    const typed = normalizeUniversityName(value);
    if (!typed) return null;
    if (isDeggendorfUniversity(typed)) {
      return {
        typed,
        canonical: currentLang === "de"
          ? "Deggendorf Institute of Technology, Germany"
          : "Deggendorf Institute of Technology, Germany",
        matchType: "deggendorf"
      };
    }
    if (isKtuUniversity(typed)) {
      return {
        typed,
        canonical: "APJ Abdul Kalam Technological University",
        matchType: "ktu"
      };
    }
    return {
      typed,
      canonical: typed,
      matchType: "generic"
    };
  };

  const getUniversityConfirmPrompt = (candidate) => {
    if (!candidate) return "";
    if (candidate.matchType === "deggendorf") return config.askUniversityConfirmDeggendorf;
    if (candidate.matchType === "ktu") return config.askUniversityConfirmKtu;
    return config.askUniversityConfirmGeneric(candidate.canonical);
  };

  const getUniversityConfirmOptions = () => withEndChatOption([
    {
      kind: "student-university-confirm",
      id: "yes",
      label: config.askUniversityConfirmYes
    },
    {
      kind: "student-university-confirm",
      id: "retype",
      label: config.askUniversityConfirmRetype
    }
  ]);

  const getStudentNameContinueOptions = () => withEndChatOption([
    {
      kind: "student-name-confirm",
      id: "continue",
      label: config.askNameContinueYes
    },
    {
      kind: "student-name-confirm",
      id: "restart",
      label: config.askNameContinueRestart
    }
  ]);

  const getStudentBossNameOptions = () => withEndChatOption([
    {
      kind: "student-name-boss",
      id: "yes",
      label: config.askNameBossYes
    },
    {
      kind: "student-name-boss",
      id: "retype",
      label: config.askNameBossRetype
    }
  ]);

  const getVisitorProfileConsentOptions = () => withEndChatOption([
    {
      kind: "visitor-profile",
      id: "share",
      label: config.visitorProfileShare
    },
    {
      kind: "visitor-profile",
      id: "skip",
      label: config.visitorProfileSkip
    }
  ]);

  const getVisitorFieldSkipOption = (field) => {
    if (field === "name") {
      return {
        kind: "visitor-field-skip",
        id: "name",
        label: config.visitorNameSkip
      };
    }
    if (field === "position") {
      return {
        kind: "visitor-field-skip",
        id: "position",
        label: config.visitorPositionSkip
      };
    }
    return {
      kind: "visitor-field-skip",
      id: "organization",
      label: config.visitorOrganizationSkip
    };
  };

  const getVisitorName = () => normalizeVisitorName(helpBotState.visitorName);
  const getStudentUniversity = () => normalizeUniversityName(helpBotState.studentUniversity);
  const getVisitorPosition = () => normalizeVisitorPosition(helpBotState.visitorPosition);
  const getVisitorOrganization = () => normalizeVisitorOrganization(helpBotState.visitorOrganization);

  const normalizeHelpBotFeedbackDraft = (raw) => {
    const source = raw && typeof raw === "object" ? raw : {};
    const mode = ["public", "private"].includes(String(source.mode || "").trim())
      ? String(source.mode || "").trim()
      : "";
    const field = HELP_BOT_FEEDBACK_FIELDS.includes(String(source.field || "").trim())
      ? String(source.field || "").trim()
      : "";
    const rating = ["1", "2", "3", "4", "5"].includes(String(source.rating || "").trim())
      ? String(source.rating || "").trim()
      : "";

    return {
      mode,
      field: mode ? field : "",
      name: mode ? normalizeFeedbackName(source.name) : "",
      company: mode ? normalizeFeedbackCompany(source.company) : "",
      email: mode ? normalizeFeedbackEmail(source.email) : "",
      country: mode ? normalizeFeedbackCountry(source.country) : "",
      rating: mode ? rating : "",
      comments: mode ? normalizeFeedbackComments(source.comments) : ""
    };
  };

  const getChatFeedbackDraft = () => normalizeHelpBotFeedbackDraft(helpBotState.chatFeedbackDraft);

  const normalizeHelpBotRecruiterRequestDraft = (raw) => {
    const source = raw && typeof raw === "object" ? raw : {};
    const type = ["contact", "cv"].includes(String(source.type || "").trim())
      ? String(source.type || "").trim()
      : "";
    const field = HELP_BOT_RECRUITER_REQUEST_FIELDS.includes(String(source.field || "").trim())
      ? String(source.field || "").trim()
      : "";
    return {
      type,
      field: type ? field : "",
      fullName: type ? normalizeFeedbackName(source.fullName) : "",
      email: type ? normalizeFeedbackEmail(source.email) : "",
      country: type ? normalizeFeedbackCountry(source.country) : "",
      message: type ? normalizeFeedbackComments(source.message).slice(0, 800) : "",
      company: type ? normalizeFeedbackCompany(source.company) : "",
      role: type ? normalizeVisitorPosition(source.role) : "",
      note: type ? normalizeFeedbackComments(source.note).slice(0, 800) : ""
    };
  };

  const getRecruiterRequestDraft = () => normalizeHelpBotRecruiterRequestDraft(helpBotState.recruiterRequestDraft);

  const personalizeForNamedVisitor = (text, roleId = currentRoleId) => {
    const name = getVisitorName();
    if (!name || !roleUsesVisitorName(roleId)) return text;
    const message = String(text || "").trim();
    if (!message) return message;
    return `${name}, ${message}`;
  };

  const getComposerMode = () => {
    if (helpBotState.pendingInputKind === "website-search") {
      return {
        placeholder: config.searchWebsitePlaceholder,
        submit: config.searchWebsiteSubmit,
        maxLength: 120,
        inputKind: "input",
        inputType: "text",
        autocomplete: "off"
      };
    }

    if (helpBotState.pendingInputKind === "recruiter-request") {
      const draft = getRecruiterRequestDraft();
      switch (draft.field) {
        case "email":
          return {
            placeholder: draft.type === "cv" ? config.recruiterCvEmailPlaceholder : config.recruiterContactEmailPlaceholder,
            submit: draft.type === "cv" ? config.recruiterCvSubmit : config.feedbackContinue,
            maxLength: 160,
            inputKind: "input",
            inputType: "email",
            autocomplete: "email"
          };
        case "country":
          return {
            placeholder: config.recruiterContactCountryPlaceholder,
            submit: config.feedbackContinue,
            maxLength: 80,
            inputKind: "input",
            inputType: "text",
            autocomplete: "country-name"
          };
        case "message":
          return {
            placeholder: config.recruiterContactMessagePlaceholder,
            submit: config.recruiterContactSubmit,
            maxLength: 800,
            inputKind: "textarea",
            inputType: "text",
            autocomplete: "off"
          };
        case "fullName":
        default:
          return {
            placeholder: config.recruiterContactNamePlaceholder,
            submit: config.feedbackContinue,
            maxLength: 80,
            inputKind: "input",
            inputType: "text",
            autocomplete: "name"
          };
      }
    }

    if (helpBotState.pendingInputKind === "chat-feedback") {
      const draft = getChatFeedbackDraft();
      const mode = draft.mode || "private";
      switch (draft.field) {
        case "company":
          return {
            placeholder: config.feedbackCompanyPlaceholder,
            submit: config.feedbackContinue,
            maxLength: 120,
            inputKind: "input",
            inputType: "text",
            autocomplete: "organization"
          };
        case "email":
          return {
            placeholder: config.feedbackEmailPlaceholder,
            submit: config.feedbackContinue,
            maxLength: 160,
            inputKind: "input",
            inputType: "email",
            autocomplete: "email"
          };
        case "country":
          return {
            placeholder: config.feedbackCountryPlaceholder,
            submit: config.feedbackContinue,
            maxLength: 80,
            inputKind: "input",
            inputType: "text",
            autocomplete: "country-name"
          };
        case "comments":
          return {
            placeholder: config.feedbackCommentPlaceholder(mode),
            submit: mode === "public" ? config.feedbackSubmitPublic : config.feedbackSubmitPrivate,
            maxLength: 1200,
            inputKind: "textarea",
            inputType: "text",
            autocomplete: "off"
          };
        case "name":
        default:
          return {
            placeholder: config.feedbackNamePlaceholder,
            submit: config.feedbackContinue,
            maxLength: 80,
            inputKind: "input",
            inputType: "text",
            autocomplete: "name"
          };
      }
    }

    if (helpBotState.pendingInputKind === "visitor-name") {
      return {
        placeholder: config.askNamePlaceholder,
        submit: config.askNameSubmit,
        maxLength: 40,
        inputKind: "input",
        inputType: "text",
        autocomplete: "name"
      };
    }

    if (helpBotState.pendingInputKind === "visitor-position") {
      return {
        placeholder: config.visitorPositionPlaceholder,
        submit: config.visitorPositionSubmit,
        maxLength: 80,
        inputKind: "input",
        inputType: "text",
        autocomplete: "organization-title"
      };
    }
    if (helpBotState.pendingInputKind === "visitor-organization") {
      return {
        placeholder: config.visitorOrganizationPlaceholder,
        submit: config.visitorOrganizationSubmit,
        maxLength: 120,
        inputKind: "input",
        inputType: "text",
        autocomplete: "organization"
      };
    }
    if (helpBotState.pendingInputKind === "student-university") {
      return {
        placeholder: config.askUniversityPlaceholder,
        submit: config.askUniversitySubmit,
        maxLength: 90,
        inputKind: "input",
        inputType: "text",
        autocomplete: "organization"
      };
    }
    return {
      placeholder: config.searchWebsitePlaceholder,
      submit: config.searchWebsiteSubmit,
      maxLength: 120,
      inputKind: "input",
      inputType: "text",
      autocomplete: "off"
    };
  };

  const normalizeHelpBotOption = (option) => {
    if (!option || typeof option !== "object") return null;
    const label = String(option.label || "").trim();
    const kind = String(option.kind || "").trim();
    const id = String(option.id || "").trim();
    if (!label || !kind || !id) return null;
    const badge = String(option.badge || "").trim();
    return { label, kind, id, ...(badge ? { badge } : {}) };
  };

  const normalizeHelpBotAction = (action) => {
    if (!action || typeof action !== "object") return null;
    const label = String(action.label || "").trim();
    const target = action.target && typeof action.target === "object" ? action.target : null;
    if (!label || !target) return null;
    const badge = String(action.badge || "").trim();
    return { label, target, ...(badge ? { badge } : {}) };
  };

  const normalizeHelpBotCard = (card) => {
    if (!card || typeof card !== "object") return null;
    const title = String(card.title || "").trim();
    const text = String(card.text || "").trim();
    if (!title || !text) return null;
    const badge = String(card.badge || "").trim();
    return { title, text, ...(badge ? { badge } : {}) };
  };

  const normalizeHelpBotMessage = (message) => {
    if (!message || typeof message !== "object") return null;
    const sender = message.sender === "user" ? "user" : "bot";
    const text = String(message.text || "").trim();
    if (!text) return null;
    return {
      sender,
      text,
      actions: Array.isArray(message.actions) ? message.actions.map(normalizeHelpBotAction).filter(Boolean) : [],
      inlineOptions: Array.isArray(message.inlineOptions) ? message.inlineOptions.map(normalizeHelpBotOption).filter(Boolean) : [],
      cards: Array.isArray(message.cards) ? message.cards.map(normalizeHelpBotCard).filter(Boolean) : []
    };
  };

  const normalizeHelpBotState = (raw) => {
    const source = raw && typeof raw === "object" ? raw : {};
    const version = Number(source.version || 0);
    const updatedAt = Number(source.updatedAt || 0);
    if (version !== HELP_BOT_STATE_VERSION || !updatedAt || Date.now() - updatedAt > HELP_BOT_STATE_TTL_MS) {
      return {
        version: HELP_BOT_STATE_VERSION,
        updatedAt: Date.now(),
        messages: [],
        currentRoleId: "",
        visitorName: "",
        visitorPosition: "",
        visitorOrganization: "",
        studentUniversity: "",
        studentUniversityCandidate: null,
        chatFeedbackDraft: normalizeHelpBotFeedbackDraft(null),
        recruiterRequestDraft: normalizeHelpBotRecruiterRequestDraft(null),
        websiteSearchQuery: "",
        websiteSearchAttempts: 0,
        websiteSearchResult: null,
        websiteSearchResults: [],
        remoteSessionId: "",
        remoteSessionPersisted: false,
        pendingInputKind: "",
        pendingTopicId: "",
        pendingTourStepId: "",
        hasConversationBooted: false,
        lastPageName: currentPageName,
        pendingResumePrompt: false,
        lastNavTarget: null,
        topicTrail: [],
        studentCornerNudgeSeen: false
      };
    }
    const messagesList = Array.isArray(source.messages)
      ? source.messages.map(normalizeHelpBotMessage).filter(Boolean).slice(-HELP_BOT_STATE_MAX_MESSAGES)
      : [];
    return {
      version: HELP_BOT_STATE_VERSION,
      updatedAt,
      messages: messagesList,
      currentRoleId: String(source.currentRoleId || "").trim(),
      visitorName: normalizeVisitorName(source.visitorName),
      visitorPosition: normalizeVisitorPosition(source.visitorPosition),
      visitorOrganization: normalizeVisitorOrganization(source.visitorOrganization),
      studentUniversity: normalizeUniversityName(source.studentUniversity),
      studentUniversityCandidate: normalizeHelpBotUniversityCandidate(source.studentUniversityCandidate),
      chatFeedbackDraft: normalizeHelpBotFeedbackDraft(source.chatFeedbackDraft),
      recruiterRequestDraft: normalizeHelpBotRecruiterRequestDraft(source.recruiterRequestDraft),
      websiteSearchQuery: String(source.websiteSearchQuery || "").trim().slice(0, 120),
      websiteSearchAttempts: Math.max(0, Math.min(5, Number(source.websiteSearchAttempts || 0))),
      websiteSearchResult: source.websiteSearchResult && typeof source.websiteSearchResult === "object"
        ? {
            kind: String(source.websiteSearchResult.kind || "section").trim(),
            label: String(source.websiteSearchResult.label || "").trim(),
            answerId: String(source.websiteSearchResult.answerId || "").trim(),
            target: source.websiteSearchResult.target && typeof source.websiteSearchResult.target === "object"
              ? source.websiteSearchResult.target
              : null
        }
        : null,
      websiteSearchResults: Array.isArray(source.websiteSearchResults)
        ? source.websiteSearchResults
          .map((entry) => entry && typeof entry === "object"
            ? {
                kind: String(entry.kind || "section").trim(),
                label: String(entry.label || "").trim(),
                answerId: String(entry.answerId || "").trim(),
                target: entry.target && typeof entry.target === "object" ? entry.target : null
              }
            : null)
          .filter((entry) => entry?.label && (entry?.target || entry?.answerId))
          .slice(0, 4)
        : [],
      remoteSessionId: String(source.remoteSessionId || "").trim(),
      remoteSessionPersisted: Boolean(source.remoteSessionPersisted),
      pendingInputKind: HELP_BOT_PENDING_INPUT_KINDS.includes(String(source.pendingInputKind || "").trim())
        ? String(source.pendingInputKind || "").trim()
        : "",
      pendingTopicId: String(source.pendingTopicId || "").trim(),
      pendingTourStepId: String(source.pendingTourStepId || "").trim(),
      hasConversationBooted: Boolean(source.hasConversationBooted) && messagesList.length > 0,
      lastPageName: String(source.lastPageName || "").trim() || currentPageName,
      pendingResumePrompt: Boolean(source.pendingResumePrompt) && messagesList.length > 0,
      lastNavTarget: source.lastNavTarget && typeof source.lastNavTarget === "object" ? source.lastNavTarget : null,
      studentCornerNudgeSeen: Boolean(source.studentCornerNudgeSeen),
      topicTrail: Array.isArray(source.topicTrail)
        ? source.topicTrail
          .map((entry) => {
            if (!entry || typeof entry !== "object") return null;
            const roleId = String(entry.roleId || "").trim();
            const topicId = String(entry.topicId || "").trim();
            const label = String(entry.label || "").trim();
            return roleId && topicId && label ? { roleId, topicId, label } : null;
          })
          .filter(Boolean)
          .slice(-12)
        : []
    };
  };

  let helpBotState = normalizeHelpBotState(loadStoredJson(localStorage, STORAGE_HELP_BOT_STATE_KEY));
  if (helpBotState.messages.length && helpBotState.lastPageName !== currentPageName) {
    helpBotState.pendingResumePrompt = true;
  }
  helpBotState.lastPageName = currentPageName;
  currentRoleId = helpBotState.currentRoleId;
  hasConversationBooted = helpBotState.hasConversationBooted;

  const persistHelpBotState = () => {
    helpBotState.version = HELP_BOT_STATE_VERSION;
    helpBotState.updatedAt = Date.now();
    helpBotState.currentRoleId = currentRoleId;
    helpBotState.visitorName = normalizeVisitorName(helpBotState.visitorName);
    helpBotState.visitorPosition = normalizeVisitorPosition(helpBotState.visitorPosition);
    helpBotState.visitorOrganization = normalizeVisitorOrganization(helpBotState.visitorOrganization);
    helpBotState.studentUniversity = normalizeUniversityName(helpBotState.studentUniversity);
    helpBotState.studentUniversityCandidate = normalizeHelpBotUniversityCandidate(helpBotState.studentUniversityCandidate);
    helpBotState.chatFeedbackDraft = normalizeHelpBotFeedbackDraft(helpBotState.chatFeedbackDraft);
    helpBotState.recruiterRequestDraft = normalizeHelpBotRecruiterRequestDraft(helpBotState.recruiterRequestDraft);
    helpBotState.websiteSearchQuery = String(helpBotState.websiteSearchQuery || "").trim().slice(0, 120);
    helpBotState.websiteSearchAttempts = Math.max(0, Math.min(5, Number(helpBotState.websiteSearchAttempts || 0)));
    helpBotState.websiteSearchResult = helpBotState.websiteSearchResult && typeof helpBotState.websiteSearchResult === "object"
      ? {
          kind: String(helpBotState.websiteSearchResult.kind || "section").trim(),
          label: String(helpBotState.websiteSearchResult.label || "").trim(),
          answerId: String(helpBotState.websiteSearchResult.answerId || "").trim(),
          target: helpBotState.websiteSearchResult.target && typeof helpBotState.websiteSearchResult.target === "object"
            ? helpBotState.websiteSearchResult.target
            : null
        }
      : null;
    helpBotState.websiteSearchResults = Array.isArray(helpBotState.websiteSearchResults)
      ? helpBotState.websiteSearchResults
        .map((entry) => entry && typeof entry === "object"
          ? {
              kind: String(entry.kind || "section").trim(),
              label: String(entry.label || "").trim(),
              answerId: String(entry.answerId || "").trim(),
              target: entry.target && typeof entry.target === "object" ? entry.target : null
            }
          : null)
        .filter((entry) => entry?.label && (entry?.target || entry?.answerId))
        .slice(0, 4)
      : [];
    helpBotState.remoteSessionId = String(helpBotState.remoteSessionId || "").trim();
    helpBotState.remoteSessionPersisted = Boolean(helpBotState.remoteSessionPersisted) && Boolean(helpBotState.remoteSessionId);
    helpBotState.pendingInputKind = HELP_BOT_PENDING_INPUT_KINDS.includes(helpBotState.pendingInputKind)
      ? helpBotState.pendingInputKind
      : "";
    helpBotState.pendingTopicId = String(helpBotState.pendingTopicId || "").trim();
    helpBotState.pendingTourStepId = String(helpBotState.pendingTourStepId || "").trim();
    helpBotState.messages = helpBotState.messages.slice(-HELP_BOT_STATE_MAX_MESSAGES);
    helpBotState.topicTrail = Array.isArray(helpBotState.topicTrail) ? helpBotState.topicTrail.slice(-12) : [];
    helpBotState.studentCornerNudgeSeen = Boolean(helpBotState.studentCornerNudgeSeen);
    helpBotState.hasConversationBooted = hasConversationBooted && helpBotState.messages.length > 0;
    helpBotState.lastPageName = currentPageName;
    saveStoredJson(localStorage, STORAGE_HELP_BOT_STATE_KEY, helpBotState);
  };

  const clearHelpBotState = () => {
    window.clearTimeout(helpBotRemoteSyncTimer);
    helpBotState = normalizeHelpBotState(null);
    currentRoleId = "";
    hasConversationBooted = false;
    try {
      localStorage.removeItem(STORAGE_HELP_BOT_STATE_KEY);
    } catch {
      // Ignore storage failures without breaking the assistant UI.
    }
  };

  let helpBotRemoteSyncTimer = 0;
  let helpBotRemoteSyncSignature = "";

  const getHelpBotRemoteSessionId = () => {
    const existingId = String(helpBotState.remoteSessionId || "").trim();
    if (existingId) return existingId;
    const nextId = window.crypto?.randomUUID?.()
      || `helpbot-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    helpBotState.remoteSessionId = nextId;
    helpBotState.remoteSessionPersisted = false;
    saveStoredJson(localStorage, STORAGE_HELP_BOT_STATE_KEY, helpBotState);
    return nextId;
  };

  const buildHelpBotRemoteSessionSnapshot = ({ endedAt = "" } = {}) => {
    if (getAdminModeState()) return null;
    if (!currentRoleId && !hasConversationBooted) return null;
    const normalizedEndedAt = String(endedAt || "").trim();
    const transcript = helpBotState.messages
      .slice(-HELP_BOT_REMOTE_MAX_MESSAGES)
      .map((message) => normalizeHelpBotSessionTranscriptEntry({
        sender: message.sender,
        text: message.text
      }))
      .filter(Boolean);
    if (!transcript.some((entry) => entry.sender === "user")) return null;

    const sessionId = getHelpBotRemoteSessionId();
    const nowIso = new Date().toISOString();
    const snapshot = {
      session_id: sessionId,
      updated_at: nowIso,
      page_path: window.location.pathname || `/${currentPageName}`,
      role_id: currentRoleId || null,
      visitor_name: getVisitorName() || null,
      visitor_position: getVisitorPosition() || null,
      visitor_organization: getVisitorOrganization() || null,
      student_university: getStudentUniversity() || null,
      message_count: transcript.length,
      transcript_json: transcript
    };
    if (!helpBotState.remoteSessionPersisted) {
      snapshot.created_at = nowIso;
    }
    if (normalizedEndedAt) {
      snapshot.ended_at = normalizedEndedAt;
    }

    return {
      payload: snapshot,
      signature: JSON.stringify({
        session_id: snapshot.session_id,
        remoteSessionPersisted: Boolean(helpBotState.remoteSessionPersisted),
        page_path: snapshot.page_path,
        role_id: snapshot.role_id,
        visitor_name: snapshot.visitor_name,
        visitor_position: snapshot.visitor_position,
        visitor_organization: snapshot.visitor_organization,
        student_university: snapshot.student_university,
        message_count: snapshot.message_count,
        transcript_json: snapshot.transcript_json,
        ended_at: snapshot.ended_at
      })
    };
  };

  const syncHelpBotRemoteSession = async ({ endedAt = "" } = {}) => {
    const snapshot = buildHelpBotRemoteSessionSnapshot({ endedAt });
    if (!snapshot || snapshot.signature === helpBotRemoteSyncSignature) return;
    try {
      const supabase = await getSupabaseClient();
      const request = helpBotState.remoteSessionPersisted
        ? supabase
          .from(SUPABASE_HELP_BOT_SESSIONS_TABLE)
          .update(snapshot.payload)
          .eq("session_id", snapshot.payload.session_id)
        : supabase
          .from(SUPABASE_HELP_BOT_SESSIONS_TABLE)
          .insert(snapshot.payload);
      const { error } = await request;
      if (error) throw error;
      if (!helpBotState.remoteSessionPersisted) {
        helpBotState.remoteSessionPersisted = true;
        saveStoredJson(localStorage, STORAGE_HELP_BOT_STATE_KEY, helpBotState);
      }
      helpBotRemoteSyncSignature = snapshot.signature;
    } catch {
      // Ignore remote sync failures so the local chat flow remains stable.
    }
  };

  const queueHelpBotRemoteSessionSync = ({ immediate = false, endedAt = "" } = {}) => {
    window.clearTimeout(helpBotRemoteSyncTimer);
    if (immediate) {
      void syncHelpBotRemoteSession({ endedAt });
      return;
    }
    helpBotRemoteSyncTimer = window.setTimeout(() => {
      void syncHelpBotRemoteSession({ endedAt });
    }, HELP_BOT_REMOTE_SYNC_DELAY_MS);
  };

  persistHelpBotState();

  const clearNudgeTimers = () => {
    window.clearTimeout(nudgeHideTimer);
    window.clearTimeout(nudgeReshowTimer);
    window.clearTimeout(hoverNudgeTimer);
    nudgeHideTimer = 0;
    nudgeReshowTimer = 0;
    hoverNudgeTimer = 0;
  };

  const shouldUseStudentCornerNudge = () => (currentRoleId === "student" || currentRoleId === "visitor")
    && Boolean(getVisitorName())
    && hasConversationBooted;

  const getStudentCornerNudgeText = () => {
    const visitorName = getVisitorName();
    if (!visitorName) return config.nudge;
    return currentLang === "de"
      ? `Hi ${visitorName} 😊 Kann ich Ihnen bei etwas helfen?`
      : `Hi ${visitorName} 😊 Can I help you with something?`;
  };

  const getStudentInlineNudgeText = () => {
    const visitorName = getVisitorName();
    if (!visitorName) return config.nudge;
    return currentLang === "de"
      ? `Hi ${visitorName} 😊`
      : `Hi ${visitorName} 😊`;
  };

  const setNudgeMessage = (message = "") => {
    if (nudgeText) nudgeText.textContent = String(message || "").trim() || config.nudge;
  };

  const setInlineNudgeOverride = (message = "") => {
    inlineNudgeOverrideMessage = String(message || "").trim();
  };

  const syncInlineStudentNudge = () => {
    if (!root || !nudge) return;
    const shouldShowOverride = root.classList.contains("is-open") && Boolean(inlineNudgeOverrideMessage);
    const shouldShow = shouldShowOverride || (root.classList.contains("is-open")
      && currentRoleId === "student"
      && Boolean(getVisitorName())
      && hasConversationBooted);
    root.classList.toggle("is-inline-nudge-visible", shouldShow);
    if (shouldShowOverride) {
      setNudgeMessage(inlineNudgeOverrideMessage);
      return;
    }
    if (shouldShow) {
      setNudgeMessage(getStudentInlineNudgeText());
      return;
    }
    if (!root.classList.contains("is-nudge-visible")) {
      setNudgeMessage(config.nudge);
    }
  };

  const hideNudge = ({ scheduleNext = true } = {}) => {
    root.classList.remove("is-nudge-visible");
    window.clearTimeout(nudgeHideTimer);
    nudgeHideTimer = 0;
    if (shouldUseStudentCornerNudge()) return;
    if (scheduleNext && !root.classList.contains("is-open") && !hasDismissedNudge && nudgeReshowCount < HELP_BOT_NUDGE_MAX_RESHOWS) {
      nudgeReshowTimer = window.setTimeout(() => {
        if (root.classList.contains("is-open") || hasDismissedNudge || nudgeReshowCount >= HELP_BOT_NUDGE_MAX_RESHOWS) return;
        nudgeReshowCount += 1;
        setNudgeMessage(config.nudge);
        root.classList.add("is-nudge-visible");
        nudgeHideTimer = window.setTimeout(() => {
          hideNudge({ scheduleNext: true });
        }, HELP_BOT_NUDGE_AUTO_HIDE_MS);
      }, HELP_BOT_NUDGE_RESHOW_MS);
    }
  };

  const showNudge = ({ delay = 0, force = false } = {}) => {
    if (hasDismissedNudge && !force) return;
    window.clearTimeout(nudgeReshowTimer);
    nudgeReshowTimer = window.setTimeout(() => {
      if (root.classList.contains("is-open")) return;
      if (shouldUseStudentCornerNudge()) {
        setNudgeMessage(getStudentCornerNudgeText());
        helpBotState.studentCornerNudgeSeen = true;
        persistHelpBotState();
        root.classList.add("is-nudge-visible");
        window.clearTimeout(nudgeHideTimer);
        nudgeHideTimer = 0;
        return;
      }
      setNudgeMessage(config.nudge);
      root.classList.add("is-nudge-visible");
      window.clearTimeout(nudgeHideTimer);
      nudgeHideTimer = window.setTimeout(() => {
        hideNudge({ scheduleNext: true });
      }, HELP_BOT_NUDGE_AUTO_HIDE_MS);
    }, delay);
  };

  const withEndChatOption = (items = [], endChatOverrides = {}) => {
    const normalizedItems = Array.isArray(items) ? items.filter(Boolean) : [];
    return normalizedItems.some((item) => item.kind === "end-chat")
      ? normalizedItems
      : [...normalizedItems, { kind: "end-chat", id: "end-chat", label: config.endChat, ...endChatOverrides }];
  };

  const getRoleOptions = () => withEndChatOption(
    dedupeHelpBotOptions([
      ...["recruiter", "student", "visitor"]
        .map((id) => (config.roles[id] ? [id, config.roles[id]] : null))
        .filter(Boolean)
        .map(([id, role]) => ({
        kind: "role",
        id,
        label: role.label
      })),
      {
        kind: "website-search-start",
        id: "search",
        label: config.searchWebsiteLabel
      }
    ])
  );

  const dedupeHelpBotOptions = (items = []) => {
    const seen = new Set();
    return (Array.isArray(items) ? items : []).filter((item) => {
      if (!item || !item.kind || !item.id || !item.label) return false;
      const key = `${item.kind}:${item.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  const findRoleTopic = (roleId, topicId) => {
    const role = config.roles[roleId];
    return role?.topics.find((entry) => entry.id === topicId) || null;
  };

  const createTopicOption = (roleId, topicId) => {
    const topic = findRoleTopic(roleId, topicId);
    return topic ? { kind: "topic", id: topic.id, label: topic.label } : null;
  };

  const createBadgedAction = (label, target, badge = "") => ({
    label,
    target,
    ...(badge ? { badge } : {})
  });

  const createBadgedOption = (kind, id, label, badge = "") => ({
    kind,
    id,
    label,
    ...(badge ? { badge } : {})
  });

  const getReviewPathStartOption = () => (
    currentLang === "de"
      ? createBadgedOption("review-path-start", "review-path-start", "Review-Ansichten", "Vertrauen")
      : createBadgedOption("review-path-start", "review-path-start", "Review paths", "Trust")
  );

  const getTopicTrail = () => (Array.isArray(helpBotState.topicTrail) ? helpBotState.topicTrail : []);

  const recordTopicTrail = (roleId, topic) => {
    if (!roleId || !topic?.id || !topic?.label) return;
    const nextEntry = { roleId, topicId: topic.id, label: topic.label };
    const nextTrail = getTopicTrail()
      .filter((entry) => !(entry.roleId === roleId && entry.topicId === topic.id))
      .concat(nextEntry)
      .slice(-12);
    helpBotState.topicTrail = nextTrail;
    persistHelpBotState();
  };

  const getRoleMilestoneSummary = (roleId = currentRoleId) => {
    const roleTrail = getTopicTrail().filter((entry) => entry.roleId === roleId);
    if (roleTrail.length < 2) return null;
    const lastTwo = roleTrail.slice(-2);
    if (currentLang === "de") {
      return {
        text: `Sie haben bereits ${lastTwo[0].label} und ${lastTwo[1].label} angesehen.`,
        badge: "Fortschritt"
      };
    }
    return {
      text: `You have already reviewed ${lastTwo[0].label} and ${lastTwo[1].label}.`,
      badge: "Progress"
    };
  };

  const getTopicConfidenceLine = (roleId, topicId) => {
    const map = {
      en: {
        recruiter: {
          fit: "This is one of the strongest early screening sections.",
          projects: "This is one of the strongest proof layers for technical screening.",
          experience: "This is one of the strongest hiring signals in the portfolio.",
          reviews: "This is a trust layer, best after projects or experience.",
          contact: "This is the highest-conversion path once the profile looks relevant."
        },
        hiringManager: {
          industrial: "This is one of the strongest management-facing proof sections.",
          delivery: "This is useful when you want implementation evidence, not only interest.",
          proof: "This is one of the strongest technical substantiation layers.",
          reviews: "This is a supporting trust layer after technical proof.",
          contact: "This is the most direct next action path."
        },
        student: {
          journey: "This is the strongest context section for the study path.",
          thesis: "This is one of the strongest academic-to-industry bridge pages.",
          projects: "This is the clearest practical learning section.",
          certificates: "This is a supporting proof layer around the core study path.",
          reviews: "This is more about outside perception than technical depth.",
          contact: "This is the easiest human next step."
        },
        collaborator: {
          stack: "This is the fastest capability map.",
          projects: "This is the best systems-thinking checkpoint.",
          github: "This is the fastest code-facing identity path.",
          journey: "This is stronger for context than for technical proof.",
          reviews: "This is a support layer for trust and presentation.",
          contact: "This is the easiest collaboration handoff."
        },
        visitor: {
          overview: "This is the fastest orientation layer.",
          projects: "This is the strongest proof-first path.",
          journey: "This is the strongest story-first path.",
          reviews: "This is a trust and reception layer.",
          contact: "This is the direct continuation path."
        }
      },
      de: {
        recruiter: {
          fit: "Das ist einer der staerksten Bereiche fuer ein erstes Screening.",
          projects: "Das ist eine der staerksten technischen Nachweis-Ebenen.",
          experience: "Das ist eines der staerksten Hiring-Signale im Portfolio.",
          reviews: "Das ist eher eine Vertrauensebene nach Projekten oder Erfahrung.",
          contact: "Das ist der direkteste Conversion-Pfad, wenn das Profil passt."
        },
        hiringManager: {
          industrial: "Das ist einer der staerksten management-orientierten Nachweisbereiche.",
          delivery: "Das ist hilfreich, wenn Sie Umsetzungsnaehe statt nur Interesse sehen wollen.",
          proof: "Das ist eine der staerksten Ebenen fuer technische Substanz.",
          reviews: "Das ist eine unterstuetzende Vertrauensebene nach dem technischen Nachweis.",
          contact: "Das ist der direkteste naechste Handlungspfad."
        },
        student: {
          journey: "Das ist der staerkste Kontextbereich fuer den Studienweg.",
          thesis: "Das ist eine der staerksten Brueckenseiten zwischen Studium und Industrie.",
          projects: "Das ist der klarste Bereich fuer praktisches Lernen durch Umsetzung.",
          certificates: "Das ist eine unterstuetzende Nachweis-Ebene um den Kern des Studienwegs.",
          reviews: "Das zeigt eher Aussenwahrnehmung als technische Tiefe.",
          contact: "Das ist der einfachste menschliche naechste Schritt."
        },
        collaborator: {
          stack: "Das ist die schnellste Faehigkeitskarte.",
          projects: "Das ist der beste Checkpoint fuer Systemdenken.",
          github: "Das ist der schnellste code-orientierte Einstieg.",
          journey: "Das ist staerker fuer Kontext als fuer technischen Nachweis.",
          reviews: "Das ist eine unterstuetzende Ebene fuer Vertrauen und Praesentation.",
          contact: "Das ist die einfachste Kollaborations-Uebergabe."
        },
        visitor: {
          overview: "Das ist die schnellste Orientierungsebene.",
          projects: "Das ist der staerkste beweisorientierte Einstieg.",
          journey: "Das ist der staerkste story-orientierte Einstieg.",
          reviews: "Das ist eine Vertrauens- und Eindrucksebene.",
          contact: "Das ist der direkte Fortsetzungspfad."
        }
      }
    };

    const languageMap = map[currentLang === "de" ? "de" : "en"];
    return languageMap?.[roleId]?.[topicId] || "";
  };

  const getTransitionLead = (kind, roleId = currentRoleId) => {
    const byLang = currentLang === "de"
      ? {
          role: roleId === "recruiter" || roleId === "hiringManager"
            ? "Ich richte das jetzt auf eine schnellere Bewertung aus."
            : "Ich richte das jetzt auf Ihren Besuchstyp aus.",
          topic: "Lassen Sie mich den naechsten sinnvollen Einstieg eingrenzen.",
          continue: "Gut, ich knuepfe an den letzten sinnvollen Punkt an.",
          quick: "Hier ist der kompakteste Bewertungsweg.",
          tour: "Ich fuehre Sie jetzt Schritt fuer Schritt durch die wichtigsten Bereiche der gesamten Website.",
          review: "Ich kann die Reviews nach dem hilfreichsten Blick sortieren."
        }
      : {
          role: roleId === "recruiter" || roleId === "hiringManager"
            ? "I’ll tighten this into a faster evaluation path."
            : "I’ll tailor this around your visitor path.",
          topic: "Let me narrow this down to the strongest next checkpoint.",
          continue: "I’ll pick up from the strongest next point.",
          quick: "Here is the most compact evaluation route.",
          tour: "I’ll guide you step by step through the key sections of the full website.",
          review: "I can sort the reviews by the most useful view."
        };
    return byLang[kind] || "";
  };

  const prependLead = (lead, text) => (lead ? `${lead}\n${text}` : text);

  const getRoleSummaryCards = (roleId = currentRoleId) => {
    if (roleId === "recruiter") {
      return currentLang === "de"
        ? [
            { badge: "Hiring", title: "Industrielle Robotik", text: "KEBA Thesis + Werkstudent in Deutschland." },
            { badge: "Proof", title: "Technische Projekte", text: "ROS, Robotik, Systemintegration, Controls." },
            { badge: "Trust", title: "Reviews", text: "Oeffentliche Rueckmeldungen und sichtbare Owner-Replys." },
            { badge: "Action", title: "CV / Kontakt", text: "Direkte Hiring-Pfade ohne Umwege." }
          ]
        : [
            { badge: "Hiring", title: "Industrial robotics", text: "KEBA thesis plus working-student proof in Germany." },
            { badge: "Proof", title: "Technical projects", text: "ROS, robotics, systems integration, and controls." },
            { badge: "Trust", title: "Reviews", text: "Public feedback and visible owner replies." },
            { badge: "Action", title: "CV / contact", text: "Direct hiring paths without friction." }
          ];
    }
    if (roleId === "hiringManager") {
      return currentLang === "de"
        ? [
            { badge: "Proof", title: "Industrie-Umfeld", text: "KEBA liefert den klarsten realen Einsatzkontext." },
            { badge: "Delivery", title: "Umsetzung", text: "Portfolio-Map und Projektseiten zeigen Delivery-Logik." },
            { badge: "Depth", title: "Technische Substanz", text: "Robotik, Regelung, Simulation und Integration." },
            { badge: "Action", title: "Naechster Schritt", text: "CV, Kontakt und direkte Bewertungspfad." }
          ]
        : [
            { badge: "Proof", title: "Industrial context", text: "KEBA gives the clearest real-world environment." },
            { badge: "Delivery", title: "Implementation", text: "The portfolio map and projects show delivery logic." },
            { badge: "Depth", title: "Technical substance", text: "Robotics, controls, simulation, and integration." },
            { badge: "Action", title: "Next step", text: "CV, contact, and fast evaluation paths." }
          ];
    }
    return [];
  };

  const getTourSteps = () => (
    currentLang === "de"
      ? [
          {
            id: "overview",
            badge: "Schritt 1",
            label: "Profil-Ueberblick",
            text: "Diese Station gibt zuerst den schnellsten Gesamtblick auf Soorajs Profil, Richtung und Robotik-Schwerpunkt. Sie verbindet About, Where I Fit und die wichtigsten Signale auf der Startseite.",
            detail: "Der Ueberblick ist die schnellste Einstiegsebene fuer das ganze Portfolio. Hier sehen Besucher zuerst, wie sich Sooraj zwischen Robotik, Mechatronik, Automatisierung und industrieller Arbeit positioniert.\nEr ist bewusst als Orientierungsbereich gedacht, bevor man tiefer in Erfahrung, Journey oder Projekte geht.",
            deepDetail: "Inhaltlich verbindet dieser Bereich Profiltext, Rollen-Fit, kurze Kernbotschaften und die wichtigsten Navigationspfade der Website. Dadurch koennen Recruiter, Studierende und allgemeine Besucher schnell erkennen, welche Seiten danach den groessten Mehrwert liefern.\nWenn man diesen Bereich gut liest, versteht man bereits den roten Faden des gesamten Portfolios.",
            action: createBadgedAction("Zum Ueberblick", createHelpBotHomeTarget("about"), "Start")
          },
          {
            id: "experience",
            badge: "Schritt 2",
            label: "Erfahrung",
            text: "Dieser Bereich fasst Soorajs drei wichtigsten Erfahrungsstationen zusammen: KEBA Master-Thesis, KEBA Werkstudent und die fruehere NDT-Techniker-Erfahrung bei United Engineering. Er zeigt, wie sich der Weg von technischer Grundlage zu industrieller Robotik entwickelt hat.",
            detail: "Die Erfahrungssektion ist eine der wichtigsten professionellen Ebenen der Website. Sie verbindet fruehere technische Industrieerfahrung mit der spaeteren Robotik- und Automatisierungsrichtung in Deutschland.\nGerade die KEBA-Linie macht sichtbar, dass Sooraj nicht nur Studienprojekte zeigt, sondern auch in einem industriellen Umfeld gearbeitet hat.",
            deepDetail: "Im Zusammenspiel zeigen die Stationen verschiedene Blickwinkel: fruehe technische Praxis, industrielle Verantwortung und der Uebergang in anspruchsvollere Robotikarbeit. Dadurch wirkt der Bereich fuer Recruiter und Hiring-Entscheidungen deutlich staerker als eine isolierte Liste von Jobs.\nEr ist gleichzeitig der beste Einstieg, wenn man berufliche Reife, Umfeld und Entwicklung logisch verstehen will.",
            action: createBadgedAction("Zur Erfahrungssektion", createHelpBotHomeTarget("experience"), "Proof")
          },
          {
            id: "journey",
            badge: "Schritt 3",
            label: "Journey",
            text: "Die Journey-Seite erzaehlt den Weg von Indien nach Deutschland und verbindet Ausbildung, persoenliche Entwicklung und den Einstieg in Robotik. Sie ist die beste Story-Seite des gesamten Portfolios.",
            detail: "Journey gibt dem Portfolio Kontext. Statt nur Stationen aufzulisten, zeigt dieser Bereich, wie sich Studium, Standortwechsel, Karriereentscheidung und Robotikinteresse ueber die Zeit entwickelt haben.\nDas macht ihn besonders wertvoll fuer Besucher, die nicht nur technische Nachweise, sondern auch Motivation und Richtung verstehen wollen.",
            deepDetail: "Die Seite verbindet akademische Entwicklung, kulturellen Wechsel, neue Arbeitsumfelder und den Uebergang in eine staerkere industrielle Robotik-Ausrichtung. Dadurch wird klar, dass hinter den Projekten und Erfahrungen ein konsistenter Weg steht.\nSie ist deshalb nicht nur eine Erzaehlung, sondern auch ein strategischer Kontextbereich fuer das ganze Portfolio.",
            action: createBadgedAction("Journey oeffnen", createHelpBotPageTarget("journey.html"), "Story")
          },
          {
            id: "projects",
            badge: "Schritt 4",
            label: "Projekte",
            text: "Dieser Bereich zeigt die eigentliche Arbeitsprobe. Hier sieht man Robotik-, Mechatronik- und Systemprojekte wie den autonomen Vakuumroboter, den Service-Roboter und weitere technische Arbeiten.",
            detail: "Die Projektsektion ist die staerkste technische Beweisschicht des Portfolios. Sie zeigt, wie Sooraj mit Robotiksoftware, Systemintegration, Simulation, Controls und praktischer Umsetzung umgeht.\nDadurch laesst sich viel besser einschaetzen, wie theoretisches Wissen in reale Arbeit uebersetzt wird.",
            deepDetail: "Zusammen decken die Projekte unterschiedliche Tiefen ab: autonome Robotik, serviceorientierte Systeme, mechatronische Loesungen, Regelung und integratives Engineering. Das ist wichtig, weil der Bereich nicht nur ein einzelnes Highlight zeigt, sondern eine breitere technische Spannweite.\nFuer viele Besucher ist dies die zentrale Seite, um Substanz statt nur Zusammenfassung zu sehen.",
            action: createBadgedAction("Projektbereich oeffnen", createHelpBotHomeTarget("projects"), "Work")
          },
          {
            id: "education",
            badge: "Schritt 5",
            label: "Bildung",
            text: "Hier sieht man die akademische Grundlage hinter dem Portfolio. Der Bildungsbereich verbindet Bachelor, Master und die technische Basis, auf der die spaetere Robotikarbeit aufbaut.",
            detail: "Die Bildungssektion zeigt den formalen Studienweg und die Schwerpunkte, die Sooraj spaeter in Projekten und Erfahrung weitergefuehrt hat. Sie ist besonders hilfreich, wenn jemand zuerst die akademische Grundlage verstehen moechte.\nZusammen mit Journey und Thesis ergibt sie ein klares Bild von der Lern- und Entwicklungsrichtung.",
            deepDetail: "Gerade im Zusammenspiel mit der Deutschland-Station wird sichtbar, wie der Bildungsweg nicht isoliert geblieben ist, sondern direkt in industrielle Robotik und angewandte Projektarbeit uebergegangen ist. Dadurch ist dieser Bereich mehr als nur eine Liste von Abschluessen.\nEr zeigt, wie die akademische Basis systematisch in reale technische Richtung erweitert wurde.",
            action: createBadgedAction("Bildung oeffnen", createHelpBotHomeTarget("education"), "Study")
          },
          {
            id: "certificates",
            badge: "Schritt 6",
            label: "Zertifikate",
            text: "Der Zertifikate-Bereich ist eine unterstuetzende Nachweisschicht neben Studium und Projekten. Er zeigt zusaetzliche Lernsignale, Tool-Exposure und strukturierte Weiterentwicklung.",
            detail: "Zertifikate sind im Portfolio nicht als Hauptbeweis gedacht, sondern als ergaenzende Schicht. Sie unterstuetzen den Eindruck, dass neben Studium und Arbeit auch kontinuierliches Lernen stattgefunden hat.\nAm meisten Wert haben sie deshalb zusammen mit den groesseren Bereichen wie Projekten, Bildung und Journey.",
            deepDetail: "Dieser Bereich ist besonders dann hilfreich, wenn Besucher nach kleineren, aber verifizierbaren Lernstationen suchen. Er zeigt, dass die Entwicklung nicht nur aus grossen Projekten und Rollen bestand, sondern auch aus bewusstem skill-bezogenem Aufbau.\nDadurch staerkt er den Gesamteindruck von Disziplin und Lernbereitschaft.",
            action: createBadgedAction("Zertifikate oeffnen", createHelpBotHomeTarget("certificates"), "Proof")
          },
          {
            id: "reviews",
            badge: "Schritt 7",
            label: "Reviews",
            text: "Die Review-Sektion zeigt, wie andere das Portfolio und den professionellen Eindruck wahrnehmen. Sie fuegt eine Vertrauens- und Aussenperspektive zu den eigentlichen Inhalten hinzu.",
            detail: "Reviews sind besonders wertvoll, nachdem man Ueberblick, Erfahrung oder Projekte gesehen hat. Dann funktionieren sie als Vertrauensschicht und bestaetigen, wie die Website und das Profil bei anderen ankommen.\nSie ersetzen keine technischen Belege, verstaerken aber Glaubwuerdigkeit und Professionalitaet.",
            deepDetail: "Durch hervorgehobene Reviews, Archivansicht und sichtbare Owner-Replys wird nicht nur der Kommentar selbst sichtbar, sondern auch, wie mit Rueckmeldungen umgegangen wird. Das macht die Sektion interessanter als eine einfache Testimonials-Leiste.\nFuer Recruiter und allgemeine Besucher ist das oft die staerkste soziale Validierung auf der Website.",
            action: createBadgedAction("Reviews oeffnen", createHelpBotHomeTarget("reviews"), "Trust")
          },
          {
            id: "contact",
            badge: "Schritt 8",
            label: "Kontakt",
            text: "Die letzte Station macht aus Interesse eine echte naechste Handlung. Hier fuehren Kontaktformular, Request-CV-Pfad und direkte Kontaktwege sauber zusammen.",
            detail: "Die Kontaktsektion ist bewusst einfach gehalten, damit Besucher nach dem Lesen nicht erst nach dem naechsten Schritt suchen muessen. Gerade nach Projekten, Reviews oder Erfahrung ist das der logische Abschluss.\nSie ist deshalb weniger Informationsbereich und mehr handlungsorientierter Uebergang.",
            deepDetail: "Mit Kontaktformular, CV-Anfrage und weiteren direkten Wegen ist diese Station auf niedrige Reibung optimiert. Das ist wichtig, weil ein starkes Portfolio ohne klaren Abschluss oft unnoetig Wirkung verliert.\nHier wird die Website von einer reinen Darstellung in eine konkrete Anschlussmoeglichkeit verwandelt.",
            action: createBadgedAction("Kontakt oeffnen", createHelpBotContactFormTarget(), "Action")
          }
        ]
      : [
          {
            id: "overview",
            badge: "Step 1",
            label: "Profile overview",
            text: "This stop gives the fastest overall picture of Sooraj's profile, direction, and robotics focus. It connects the About area, role fit, and the main homepage signals.",
            detail: "The overview section is the fastest orientation layer in the entire website. It shows Sooraj's current profile in Germany, his mechatronics and robotics direction, and the clearest entry points for visitors who want to evaluate fit, industrial relevance, or project depth.\nInstead of making people search manually, this section quickly frames what the website is about and where the strongest proof sits.",
            deepDetail: "At a deeper level, this section brings together the homepage introduction, the current snapshot, the role-fit framing, and the strongest navigation paths into one decision layer. A recruiter can quickly understand the robotics and automation positioning, a student can see the education-to-industry path, and a general visitor can understand how the website is structured before opening deeper pages.\nIt is not only an introduction. It is the place where the portfolio establishes location, direction, professional intent, and the logic for the rest of the site.",
            action: createBadgedAction("Open overview", createHelpBotHomeTarget("about"), "Start")
          },
          {
            id: "experience",
            badge: "Step 2",
            label: "Experience",
            text: "This section brings together Sooraj's three strongest experience layers: the KEBA master's thesis, the KEBA working-student role, and the earlier NDT technician experience at United Engineering. It shows how his path moved from technical foundation into industrial robotics.",
            detail: "The experience section is one of the strongest proof layers on the website because it connects three different forms of engineering maturity. It starts with NDT and industrial discipline, moves into the KEBA working-student environment in Stuttgart, and then reaches the industrial robotics thesis with planning, controller logic, simulation, and deployment-facing work.\nThat gives the visitor a much clearer picture than a simple list of job titles.",
            deepDetail: "Inside this section, you can see what Sooraj actually did and what he learned in each stage. The NDT role built reporting discipline, inspection accuracy, standards awareness, and process responsibility. The KEBA working-student role added industrial robotics exposure, controller and HMI familiarity, simulation and validation support, technical presentations, and exhibition participation. The KEBA thesis then pushed that into deeper robotics engineering with a 6-axis workflow, machine interaction, collision-aware logic, path planning support, controller-side thinking, and industrial execution constraints.\nTaken together, the section explains not only where he worked, but how his work evolved from industrial discipline into practical robotics engineering in Germany.",
            action: createBadgedAction("Open experience section", createHelpBotHomeTarget("experience"), "Proof")
          },
          {
            id: "journey",
            badge: "Step 3",
            label: "Journey",
            text: "The journey page tells the path from India to Germany and connects study, personal growth, and the move into robotics. It is the strongest story-driven page in the whole portfolio.",
            detail: "Journey gives the website the human and strategic context behind the technical sections. It explains how Sooraj moved from India to Germany, how the academic path developed, and how that transition supported the shift toward robotics, automation, and industrial work.\nIt is especially useful for visitors who want to understand motivation, growth, and direction instead of seeing only isolated project or job entries.",
            deepDetail: "At a deeper level, the Journey page shows how different parts of the portfolio connect into one continuous path: bachelor studies in India, the move into a master's in Germany, the adaptation to a new environment, and the transition into KEBA-related industrial robotics work. It helps explain why the later projects, thesis work, and portfolio direction are coherent rather than random.\nThis is also where the website shows personal development, international transition, and career intent in a more readable way than the homepage alone.",
            action: createBadgedAction("Open journey page", createHelpBotPageTarget("journey.html"), "Story")
          },
          {
            id: "projects",
            badge: "Step 4",
            label: "Projects",
            text: "This is the actual work sample section. It shows robotics, mechatronics, and systems projects like the autonomous vacuum robot, service robot, and other technical builds.",
            detail: "The projects section is the strongest technical work-sample layer in the portfolio. It includes robotics and mechatronics projects such as the ROS-based autonomous vacuum robot, the automated service robot, and other simulation or systems-oriented builds.\nThis section helps visitors judge how Sooraj turns engineering theory into implementation through software, control logic, simulation, sensors, and system behavior.",
            deepDetail: "The projects section shows different kinds of technical work rather than repeating the same pattern. The autonomous vacuum robot highlights ROS, Gazebo, RViz, localization, obstacle handling, and path planning. The service robot highlights Arduino-based implementation, line tracking, sensor integration, and practical mechatronic thinking. Other projects extend the range into simulation and modeling, such as active suspension analysis in MATLAB and Simulink.\nBecause of that spread, this section shows both robotics software capability and broader engineering execution across autonomy, control, and system-level problem solving.",
            action: createBadgedAction("Open projects section", createHelpBotHomeTarget("projects"), "Work")
          },
          {
            id: "education",
            badge: "Step 5",
            label: "Education",
            text: "This section shows the academic foundation behind the portfolio. It connects the bachelor's, the master's, and the study base behind the later robotics direction.",
            detail: "The education section explains the formal study path behind the technical work shown elsewhere in the website. It connects the bachelor's foundation in mechanical engineering in India with the master's path in mechatronics in Germany.\nThat makes it easier to understand how the robotics direction was built on a real academic base rather than appearing suddenly only in projects.",
            deepDetail: "At a deeper level, this section shows how the study path created the foundation for later industrial and robotics-focused work. The bachelor's layer built mechanical engineering fundamentals, while the master's path in Germany moved that base toward mechatronics, robotics, and closer industry relevance. When visitors read this together with the journey and KEBA thesis work, they can see how the academic route directly supported later hands-on implementation, industrial exposure, and stronger robotics specialization.\nSo this section is not only about degrees. It explains how the knowledge base was formed and then extended into practical engineering direction.",
            action: createBadgedAction("Open education section", createHelpBotHomeTarget("education"), "Study")
          },
          {
            id: "certificates",
            badge: "Step 6",
            label: "Certificates",
            text: "The certificates section is a supporting proof layer next to study and projects. It shows extra learning signals, tool exposure, and structured self-development.",
            detail: "The certificates section works as a supporting proof layer around the main study, project, and experience content. It shows that learning continued through shorter structured milestones as well, including robotics and KEBA-related training signals.\nThis helps reinforce that the development path was consistent, not limited only to one thesis or one job.",
            deepDetail: "At a deeper level, this section shows how Sooraj kept building capability through targeted learning and validation beyond the bigger headline items. It includes certificate-based evidence around robotics topics, KEBA validation, training exposure, and professional participation. On its own, this section is not the strongest proof layer. But together with projects, education, and KEBA experience, it helps confirm a pattern of continuous skill-building, curiosity, and professional follow-through.\nThat makes the website feel more complete and disciplined instead of relying only on one or two major portfolio highlights.",
            action: createBadgedAction("Open certificates", createHelpBotHomeTarget("certificates"), "Proof")
          },
          {
            id: "reviews",
            badge: "Step 7",
            label: "Reviews",
            text: "The reviews section shows how other people perceive the portfolio and the professional impression around it. It adds an outside trust layer to the technical content.",
            detail: "The reviews section gives outside validation around the technical content and the overall professionalism of the website. It works best after someone has already seen the overview, experience, or projects, because then the reviews reinforce an impression that has already started to form.\nIt is a trust layer rather than a technical proof layer.",
            deepDetail: "This section is stronger than a simple testimonial strip because it includes featured reviews, the archive view, visible owner replies, and moderation-aware public presentation. That means visitors do not only see praise. They also see how communication and follow-up are handled around the portfolio. For recruiters and general visitors, this becomes the social proof layer that supports credibility after the more technical sections have already done the main work.\nIn practice, it helps the site feel more trustworthy, more active, and more professionally maintained.",
            action: createBadgedAction("Open reviews", createHelpBotHomeTarget("reviews"), "Trust")
          },
          {
            id: "contact",
            badge: "Step 8",
            label: "Contact",
            text: "The final stop turns interest into a real next step. It brings together the contact form, CV request path, and the main contact routes in one clean ending section.",
            detail: "The contact section is the action layer of the website. After someone has gone through projects, experience, journey, or reviews, this is where they can move from interest into a real next step through the contact form, CV request route, or direct follow-up path.\nIts job is to keep that transition clear and low-friction.",
            deepDetail: "This section is intentionally built to remove hesitation at the end of the portfolio journey. Instead of making visitors search again, it gives a clear route for contacting Sooraj, requesting the CV, or continuing a hiring or networking conversation. That makes it especially important after the stronger proof sections, because a good portfolio loses impact if the closing action is weak or hidden.\nSo this final section is less about explaining background and more about converting attention into an actual professional next step.",
            action: createBadgedAction("Open contact", createHelpBotContactFormTarget(), "Action")
          }
        ]
  );

  const getTourStep = (stepId = "") => getTourSteps().find((step) => step.id === stepId) || null;

  const getTourNextStep = (currentStepId = "") => {
    const steps = getTourSteps();
    const currentIndex = steps.findIndex((step) => step.id === currentStepId);
    return currentIndex >= 0 ? steps[currentIndex + 1] || null : steps[0] || null;
  };

  const getTourStartOption = () => (
    currentLang === "de"
      ? createBadgedOption("tour-start", "tour-start", "Portfolio-Tour", "Gefuehrt")
      : createBadgedOption("tour-start", "tour-start", "Portfolio tour", "Guided")
  );

  const getTourSummaryOptions = (stepId = "") => {
    const step = getTourStep(stepId);
    const nextStep = getTourNextStep(stepId);
    return withEndChatOption(dedupeHelpBotOptions([
      ...(nextStep ? [createBadgedOption("tour-step", nextStep.id, currentLang === "de" ? "Naechster Bereich" : "Next section", nextStep.badge)] : []),
      ...(step?.action ? [createBadgedOption("tour-open-page", step.id, currentLang === "de" ? "Detailseite ansehen" : "View detail page", currentLang === "de" ? "Direkt" : "Direct")] : []),
      createBadgedOption("tour-more", "tour-more", currentLang === "de" ? "Mehr erklaeren" : "Explain more", currentLang === "de" ? "Mehr" : "More"),
      createBadgedOption("tour-other-topic", "tour-other-topic", currentLang === "de" ? "Andere Themen" : "Other topic", currentLang === "de" ? "Chat" : "Chat"),
      createBadgedOption("tour-back-start", "tour-back-start", currentLang === "de" ? "Zurueck zum Start" : "Back to start", currentLang === "de" ? "Reset" : "Reset")
    ]));
  };

  const getTourDetailChoiceOptions = (stepId = "") => {
    const step = getTourStep(stepId);
    const nextStep = getTourNextStep(stepId);
    return withEndChatOption(dedupeHelpBotOptions([
      ...(step?.action ? [createBadgedOption("tour-open-page", step.id, currentLang === "de" ? "Detailseite ansehen" : "View detail page", currentLang === "de" ? "Direkt" : "Direct")] : []),
      createBadgedOption("tour-explain", stepId, currentLang === "de" ? "Hier genauer erklaeren" : "Explain here", currentLang === "de" ? "Chat" : "Chat"),
      ...(nextStep ? [createBadgedOption("tour-step", nextStep.id, currentLang === "de" ? "Naechster Bereich" : "Next section", nextStep.badge)] : []),
      createBadgedOption("tour-other-topic", "tour-other-topic", currentLang === "de" ? "Andere Themen" : "Other topic", currentLang === "de" ? "Wechseln" : "Switch"),
      createBadgedOption("tour-back-start", "tour-back-start", currentLang === "de" ? "Zurueck zum Start" : "Back to start", currentLang === "de" ? "Reset" : "Reset")
    ]));
  };

  const getTourExplainOptions = (stepId = "", { allowDeeper = true } = {}) => {
    const step = getTourStep(stepId);
    const nextStep = getTourNextStep(stepId);
    return withEndChatOption(dedupeHelpBotOptions([
      ...(nextStep ? [createBadgedOption("tour-step", nextStep.id, currentLang === "de" ? "Naechster Bereich" : "Next section", nextStep.badge)] : []),
      ...(step?.action ? [createBadgedOption("tour-open-page", step.id, currentLang === "de" ? "Detailseite ansehen" : "View detail page", currentLang === "de" ? "Direkt" : "Direct")] : []),
      ...(allowDeeper ? [createBadgedOption("tour-explain-deeper", stepId, currentLang === "de" ? "Mehr Details hier" : "More detail here", currentLang === "de" ? "Tiefe" : "Depth")] : []),
      createBadgedOption("tour-other-topic", "tour-other-topic", currentLang === "de" ? "Andere Themen" : "Other topic", currentLang === "de" ? "Wechseln" : "Switch"),
      createBadgedOption("tour-back-start", "tour-back-start", currentLang === "de" ? "Zurueck zum Start" : "Back to start", currentLang === "de" ? "Reset" : "Reset")
    ]));
  };

  const getTourOpeningText = () => (
    currentLang === "de"
      ? `${getTransitionLead("tour", currentRoleId)}\nIch starte mit einem kurzen Ueberblick und fuehre danach nacheinander durch Erfahrung, Journey, Projekte, Bildung, Zertifikate, Reviews und den Kontaktweg.`
      : `${getTransitionLead("tour", currentRoleId)}\nI’ll begin with a short overview and then walk through experience, journey, projects, education, certificates, reviews, and the contact path in order.`
  );

  const getTourSummaryFollowUpText = () => (
    currentLang === "de"
      ? "Unten koennen Sie direkt zum naechsten Bereich gehen, die passende Detailseite ansehen oder sich diesen Abschnitt genauer erklaeren lassen."
      : "Below, you can move to the next section, view the matching detail page, or let me explain this section in more depth."
  );

  const getTourDetailChoiceText = (step) => (
    currentLang === "de"
      ? `Ich kann ${step.label.toLowerCase()} hier Schritt fuer Schritt weiter erklaeren oder direkt die passende Detailseite im Portfolio oeffnen.\nWie moechten Sie weitermachen?`
      : `I can walk you through ${step.label.toLowerCase()} in the chat or open the matching detailed page in the portfolio.\nHow would you like to continue?`
  );

  const getTourExplainedPromptText = (stepId = "", isDeeper = false) => {
    const nextStep = getTourNextStep(stepId);
    if (currentLang === "de") {
      if (nextStep) {
        return isDeeper
          ? `Wenn Sie moechten, kann ich jetzt direkt mit ${nextStep.label} weitermachen, noch tiefer in diesem Bereich bleiben oder die passende Seite fuer Sie oeffnen.`
          : `Wenn Sie moechten, kann ich jetzt direkt mit ${nextStep.label} weitermachen, hier noch tiefer erklaeren oder die passende Seite fuer Sie oeffnen.`;
      }
      return isDeeper
        ? "Sie sind jetzt am Ende der Tour. Ich kann hier noch weiter vertiefen, die passende Seite oeffnen oder zu anderen Themen wechseln."
        : "Sie sind jetzt am Ende der Tour. Ich kann hier noch tiefer erklaeren, die passende Seite oeffnen oder zu anderen Themen wechseln.";
    }
    if (nextStep) {
      return isDeeper
        ? `If you want, I can continue straight into ${nextStep.label}, stay even deeper in this section, or open the matching page for you.`
        : `If you want, I can continue straight into ${nextStep.label}, go deeper here, or open the matching page for you.`;
    }
    return isDeeper
      ? "You are at the end of the tour. I can stay even deeper here, open the matching page, or switch to another topic."
      : "You are at the end of the tour. I can go deeper here, open the matching page, or switch to another topic.";
  };

  const clearPendingTourStep = () => {
    helpBotState.pendingTourStepId = "";
    persistHelpBotState();
  };

  const setPendingTourStep = (stepId = "") => {
    helpBotState.pendingTourStepId = String(stepId || "").trim();
    persistHelpBotState();
  };

  const getPendingTourStep = () => getTourStep(helpBotState.pendingTourStepId);

  const getTourOtherTopicOptions = () => {
    const role = config.roles[currentRoleId];
    if (!role) {
      return getRoleOptions();
    }
    return withEndChatOption(dedupeHelpBotOptions([
      ...getTopicOptions(role),
      getTourStartOption(),
      createBadgedOption("tour-back-start", "tour-back-start", currentLang === "de" ? "Zurueck zum Start" : "Back to start", currentLang === "de" ? "Reset" : "Reset")
    ]));
  };

  const openTourStepPage = (stepId = "") => {
    const step = getTourStep(stepId);
    if (!step?.action?.target) return;

    appendMessage({
      sender: "user",
      text: currentLang === "de" ? "Ja, Detailseite oeffnen" : "Yes, open detail page"
    });
    helpBotState.lastNavTarget = step.action.target;
    clearPendingTourStep();
    persistHelpBotState();
    trackAnalyticsEvent("help_bot_tour_page_opened", {
      page_path: window.location.pathname,
      lang: currentLang,
      role: currentRoleId || "unassigned",
      step: step.id
    });
    navigateHelpBotTarget(step.action.target, () => setOpen(false));
  };

  const explainTourStep = async (stepId = "", { deeper = false } = {}) => {
    const step = getTourStep(stepId);
    if (!step) return;

    responseToken += 1;
    const token = responseToken;
    clearTypingIndicator();
    setPendingTourStep(step.id);
    appendMessage({
      sender: "user",
      text: deeper
        ? (currentLang === "de" ? "Mehr Details hier" : "More detail here")
        : (currentLang === "de" ? "Hier erklaeren" : "Explain here")
    });
    setOptions([], "");
    await queueBotReply({
      text: `${deeper ? step.deepDetail : step.detail}\n${getTourExplainedPromptText(step.id, deeper)}`,
      delay: deeper ? 520 : 460,
      token,
      inlineOptions: getTourExplainOptions(step.id, { allowDeeper: !deeper })
    });

    if (token !== responseToken) return;
    trackAnalyticsEvent("help_bot_tour_explained", {
      page_path: window.location.pathname,
      lang: currentLang,
      role: currentRoleId || "unassigned",
      step: step.id,
      depth: deeper ? "deep" : "detail"
    });
  };

  const chooseTourStepDetailMode = async () => {
    const step = getPendingTourStep();
    if (!step) return;

    responseToken += 1;
    const token = responseToken;
    clearTypingIndicator();
    appendMessage({
      sender: "user",
      text: currentLang === "de" ? "Mehr Details" : "More details"
    });
    setOptions([], "");
    await queueBotReply({
      text: getTourDetailChoiceText(step),
      delay: 360,
      token,
      inlineOptions: getTourDetailChoiceOptions(step.id)
    });
  };

  const showTourOtherTopics = async () => {
    responseToken += 1;
    const token = responseToken;
    clearTypingIndicator();
    appendMessage({
      sender: "user",
      text: currentLang === "de" ? "Andere Themen" : "Other topic"
    });
    clearPendingTourStep();
    setOptions([], "");
    await queueBotReply({
      text: currentLang === "de"
        ? "Gerne. Waehlen Sie den Bereich, den ich als Naechstes erklaeren oder oeffnen soll."
        : "Sure. Choose the area you would like me to explain or open next.",
      delay: 360,
      token,
      inlineOptions: getTourOtherTopicOptions()
    });
  };

  const getReviewPathOptions = () => withEndChatOption(dedupeHelpBotOptions([
    createBadgedOption("review-path", "featured", currentLang === "de" ? "Hervorgehobene Reviews" : "Featured reviews", currentLang === "de" ? "Startseite" : "Homepage"),
    createBadgedOption("review-path", "all", currentLang === "de" ? "Alle oeffentlichen Reviews" : "All public reviews", currentLang === "de" ? "Archiv" : "Archive"),
    createBadgedOption("review-path", "replies", currentLang === "de" ? "Reviews mit Owner-Reply" : "Reviews with owner replies", currentLang === "de" ? "Antworten" : "Replies"),
    createBadgedOption("review-path", "contact", currentLang === "de" ? "Kontakt statt Reviews" : "Contact instead", currentLang === "de" ? "Aktion" : "Action")
  ]));

  let helpBotQuestionBankPromise = null;

  const loadHelpBotQuestionBank = async () => {
    if (helpBotQuestionBankPromise) return helpBotQuestionBankPromise;
    helpBotQuestionBankPromise = fetch(HELP_BOT_QUESTION_BANK_PATH, { cache: "no-cache" })
      .then((response) => {
        if (!response.ok) throw new Error("Question bank not available");
        return response.json();
      })
      .then((payload) => {
        const intents = Array.isArray(payload?.intents)
          ? payload.intents
            .map((entry) => {
              if (!entry || typeof entry !== "object") return null;
              const id = String(entry.id || "").trim();
              const keywords = Array.isArray(entry.keywords)
                ? entry.keywords.map((item) => String(item || "").trim()).filter(Boolean)
                : [];
              const questions = Array.isArray(entry.questions)
                ? entry.questions.map((item) => String(item || "").trim()).filter(Boolean)
                : [];
              return id && questions.length ? { id, keywords, questions } : null;
            })
            .filter(Boolean)
          : [];
        return { intents };
      })
      .catch(() => ({ intents: [] }));
    return helpBotQuestionBankPromise;
  };

  const looksLikeQuestionSearch = (query = "") => {
    const normalized = String(query || "").trim().toLowerCase();
    if (!normalized) return false;
    const rawTokens = normalized.split(/\s+/).filter(Boolean);
    const lead = rawTokens[0] || "";
    return normalized.includes("?")
      || rawTokens.length >= 5
      || ["what", "where", "who", "which", "when", "why", "how", "can", "does", "is", "are", "explain", "tell"].includes(lead);
  };

  const getWebsiteQuestionAnswerEntry = (answerId = "") => {
    if (currentLang === "de") {
      const deAnswers = {
        "about-profile": {
          text: "Wenn Sie Soorajs Gesamtprofil schnell verstehen wollen, beginnen Sie mit About, Experience und Where I Fit. Dort sehen Sie die technische Richtung zwischen Robotik, Mechatronik, Simulation, immersiven Projekten und industriellem Kontext in Deutschland.",
          actions: [
            createBadgedAction("About", createHelpBotHomeTarget("about"), "Start"),
            createBadgedAction("Erfahrung", createHelpBotHomeTarget("experience"), "Proof"),
            createBadgedAction("Where I Fit", createHelpBotHomeTarget("where-i-fit"), "Fit")
          ]
        },
        "experience-overview": {
          text: "Soorajs allgemeine Experience-Sektion ist am staerksten in drei Teilen: die aktuelle KEBA Werkstudentenrolle in industrieller Robotik, die parallele KEBA Master-Thesis mit planungs- und ausfuehrungsnaher Robotikarbeit und die fruehere industrielle Grundlage als NDT-Techniker in Indien. Zusammen zeigen diese Seiten aktuelle Robotikrichtung, Thesis-Tiefe und fruehere industrielle Verantwortung.",
          actions: [
            createBadgedAction("Erfahrung oeffnen", createHelpBotHomeTarget("experience"), "Proof"),
            createBadgedAction("KEBA Werkstudent", createHelpBotPageTarget("experience-working-student-keba.html"), "Current"),
            createBadgedAction("KEBA Master-Thesis", createHelpBotPageTarget("experience-masters-thesis-keba.html"), "Thesis"),
            createBadgedAction("NDT Rolle", createHelpBotPageTarget("experience-ndt-technician.html"), "Base")
          ]
        },
        "robotics-experience": {
          text: "Soorajs staerkste Robotik-Erfahrung liegt in drei Ebenen: in der KEBA Master-Thesis zur industriellen Robotik, in der parallelen KEBA Werkstudentenrolle im Live-Industrieumfeld und in Robotikprojekten wie dem autonomen Vakuumroboter und dem Service-Roboter. Zusammen zeigen diese Seiten Robotiksoftware, Motion Planning, Robot Programming, Simulation und umsetzungsnahe Engineering-Logik.",
          actions: [
            createBadgedAction("Erfahrung oeffnen", createHelpBotHomeTarget("experience"), "Proof"),
            createBadgedAction("KEBA Master-Thesis", createHelpBotPageTarget("experience-masters-thesis-keba.html"), "Robotik"),
            createBadgedAction("KEBA Werkstudent", createHelpBotPageTarget("experience-working-student-keba.html"), "Industrie"),
            createBadgedAction("Vakuumroboter", createHelpBotPageTarget("project-autonomous-vacuum-robot.html"), "ROS")
          ]
        },
        "vr-immersive": {
          text: "Die staerkste immersive Erfahrung im Portfolio ist der VR Machine Operation Workshop. Dort hat Sooraj in Unity und C# eine trainingsorientierte Simulationsumgebung fuer Maschinenbedienung, raeumliche Interaktion und realistischere Nutzerfuehrung aufgebaut. Die cleareste Evidenz liegt also im VR/XR-Bereich, nicht in einem separaten AR-only Produktfall.",
          actions: [
            createBadgedAction("VR-Workshop", createHelpBotPageTarget("project-vr-machine-workshop.html"), "VR"),
            createBadgedAction("Where I Fit", createHelpBotHomeTarget("where-i-fit"), "Fit"),
            createBadgedAction("Skills", createHelpBotHomeTarget("skills"), "Stack")
          ]
        },
        "journey-india-germany": {
          text: "Der Weg von Indien nach Deutschland ist klar aufgebaut. Erst kamen Schulbasis und B.Tech in Mechanical Engineering in Indien, dann 2022 die industrielle Grundlage ueber Non-Destructive Testing in Kochi, und ab 2023 der Wechsel nach Deutschland fuer den M.Eng. in Mechatronics and Cyber-Physical Systems an der TH Deggendorf. Von dort fuehrte der Weg weiter in die KEBA Werkstudentenrolle und die parallele Master-Thesis in industrieller Robotik in Stuttgart.",
          actions: [
            createBadgedAction("Journey oeffnen", createHelpBotPageTarget("journey.html"), "Story"),
            createBadgedAction("Bildung", createHelpBotHomeTarget("education"), "Study"),
            createBadgedAction("KEBA Erfahrung", createHelpBotHomeTarget("experience"), "Proof")
          ]
        },
        "bachelor-path": {
          text: "Soorajs Bachelor-Phase lief von August 2017 bis Juli 2021 als B.Tech in Mechanical Engineering an der APJ Abdul Kalam Technological University. In dieser Zeit wurden Mechanical Design, Manufacturing, CAD/CAE und die technischen Grundlagen aufgebaut. Parallel dazu entstanden Leadership-Erfahrung und das spaeter ausgezeichnete Service-Roboter-Projekt, bevor danach erst die Industriephase in Indien und dann Deutschland folgten.",
          actions: [
            createBadgedAction("Bildungsbereich", createHelpBotHomeTarget("education"), "Study"),
            createBadgedAction("Journey", createHelpBotPageTarget("journey.html"), "Context"),
            createBadgedAction("Service-Roboter", createHelpBotPageTarget("project-service-robot.html"), "Award")
          ]
        },
        "current-role-germany": {
          text: "Die aktuelle Rolle in Deutschland ist Werkstudent bei der KEBA Group in Stuttgart, Baden-Wuerttemberg. Der Schwerpunkt liegt auf industrieller Robotik und Automation in einem echten Engineering-Umfeld, also auf Robot Programming, Implementierungsqualitaet und Deployment-Kontext. Parallel dazu laeuft die Master-Thesis in industrieller Robotik mit Fokus auf 6-Achs-Workflow, Motion Planning und umsetzungsnaher Ausfuehrung.",
          actions: [
            createBadgedAction("KEBA Werkstudent", createHelpBotPageTarget("experience-working-student-keba.html"), "Current"),
            createBadgedAction("KEBA Master-Thesis", createHelpBotPageTarget("experience-masters-thesis-keba.html"), "Parallel"),
            createBadgedAction("Kontakt", createHelpBotContactFormTarget(), "Action")
          ]
        },
        "germany-location": {
          text: "Der aktuelle berufliche Ankerpunkt ist Stuttgart in Deutschland, weil dort die KEBA Werkstudentenrolle und die Thesis-nahe Robotikarbeit liegen. Die akademische Spur fuehrt ueber die TH Deggendorf, und die Journey-Seite nennt ausserdem gelebte Erfahrung in Bayern, Thueringen und Baden-Wuerttemberg.",
          actions: [
            createBadgedAction("Travel-Footprint", createHelpBotPageTarget("journey.html", "travel"), "Travel"),
            createBadgedAction("KEBA Rolle", createHelpBotPageTarget("experience-working-student-keba.html"), "Current"),
            createBadgedAction("Bildung", createHelpBotHomeTarget("education"), "Study")
          ]
        },
        "travel-footprint": {
          text: "Die Travel-Footprint-Sektion ist nach Indien, internationale Laender und gelebte Deutschland-Erfahrung getrennt. In Indien nennt das Portfolio Kerala, Tamil Nadu, Rajasthan und Goa. International werden Deutschland, Bahrain, Katar, Oesterreich, die Schweiz, Tschechien und Luxemburg genannt. Fuer Deutschland werden gelebte Erfahrung in Bayern, Thueringen und Baden-Wuerttemberg hervorgehoben.",
          actions: [
            createBadgedAction("Travel-Footprint", createHelpBotPageTarget("journey.html", "travel"), "Travel"),
            createBadgedAction("Journey", createHelpBotPageTarget("journey.html"), "Story"),
            createBadgedAction("KEBA Rolle", createHelpBotPageTarget("experience-working-student-keba.html"), "Germany")
          ]
        },
        "projects-all": {
          text: "Die Projektsektion deckt fuenf Hauptprojekte ab. 1. Der autonome Vakuumroboter in ROS zeigt SLAM, Lokalisierung und Navigation. 2. Der VR Machine Operation Workshop zeigt Unity-basierte immersive Trainingssimulation. 3. Active Suspension zeigt MATLAB- und Simulink-basierte Modellierung und Controls-Denken. 4. Der Topology Bag Sealer zeigt SOLIDWORKS-, FEA- und Optimierungsarbeit. 5. Der Service-Roboter zeigt eine fruehe Arduino-basierte Robotikbasis mit Best-Bachelor-Project-Auszeichnung.",
          actions: [
            createBadgedAction("Projektbereich", createHelpBotHomeTarget("projects"), "Overview"),
            createBadgedAction("Vakuumroboter", createHelpBotPageTarget("project-autonomous-vacuum-robot.html"), "ROS"),
            createBadgedAction("VR-Workshop", createHelpBotPageTarget("project-vr-machine-workshop.html"), "VR"),
            createBadgedAction("Fahrwerksregelung", createHelpBotPageTarget("project-active-suspension.html"), "MATLAB")
          ]
        },
        "thesis-detail": {
          text: "Die Master-Thesis bei KEBA lief von September 2025 bis Maerz 2026 und fokussierte eine 6-Achs-Robotik fuer Maschinenoperation. Entscheidend war nicht nur Simulation, sondern das Verbinden von Planung, Greiflogik, Zellgeometrie und deployment-naher Ausfuehrung. Dazu kam ein leichtgewichtiges webbasiertes Joint-Path-Planner-Tool fuer Waypoints und drag&bot-Simulationsvalidierung.",
          actions: [
            createBadgedAction("Master-Thesis", createHelpBotPageTarget("experience-masters-thesis-keba.html"), "Robotics"),
            createBadgedAction("KEBA Erfahrung", createHelpBotPageTarget("experience-working-student-keba.html"), "Context"),
            createBadgedAction("Journey", createHelpBotPageTarget("journey.html"), "Story")
          ]
        },
        "ros-project": {
          text: "Der autonome Vakuumroboter ist das klarste ROS-Projekt im Portfolio. Er zeigt SLAM-basierte Lokalisierung, Hinderniserkennung, Pfadplanung, sensorgetriebene Entscheidungslogik sowie den Workflow mit ROS, Gazebo und RViz. Das Projekt ist einer der direktesten Nachweise fuer Robotiksoftware und autonome Navigation.",
          actions: [
            createBadgedAction("ROS-Projekt", createHelpBotPageTarget("project-autonomous-vacuum-robot.html"), "ROS"),
            createBadgedAction("KEBA Master-Thesis", createHelpBotPageTarget("experience-masters-thesis-keba.html"), "Related"),
            createBadgedAction("Projektbereich", createHelpBotHomeTarget("projects"), "Overview")
          ]
        },
        "service-robot-detail": {
          text: "Der Service-Roboter ist eine fruehe, aber wichtige Robotikbasis im Portfolio. Das Arduino-basierte System entstand im Juli 2021 fuer patientennahe Service-Szenarien waehrend der Pandemie und verband Sensorintegration, Line-Following, Bewegungslogik und eine reale, menschenzentrierte Problemstellung. Spaeter erhielt das Projekt die Best-Bachelor-Project-Auszeichnung.",
          actions: [
            createBadgedAction("Service-Roboter", createHelpBotPageTarget("project-service-robot.html"), "Award"),
            createBadgedAction("Bildung", createHelpBotHomeTarget("education"), "Bachelor"),
            createBadgedAction("Projektbereich", createHelpBotHomeTarget("projects"), "Overview")
          ]
        },
        "active-suspension-detail": {
          text: "Das Active-Suspension-Projekt zeigt MATLAB- und Simulink-basierte Modellierung fuer dynamisches Systemverhalten. Untersucht wurden hydraulische Aktuatorlogik, Systemantwort und simulationsgetriebene Leistungsanalyse. Damit beweist diese Seite Systems Thinking, Controls-Denken und technische Analyse jenseits klassischer Robotikseiten.",
          actions: [
            createBadgedAction("Active Suspension", createHelpBotPageTarget("project-active-suspension.html"), "MATLAB"),
            createBadgedAction("Where I Fit", createHelpBotHomeTarget("where-i-fit"), "Fit"),
            createBadgedAction("Skills", createHelpBotHomeTarget("skills"), "Stack")
          ]
        },
        "topology-detail": {
          text: "Der Topology Bag Sealer ist die staerkste SOLIDWORKS- und FEA-nahe Designseite im Portfolio. Die Arbeit fokussierte Gewichts- und Materialreduktion durch Topologieoptimierung, ohne die Fertigbarkeit aus dem Blick zu verlieren. Dadurch zeigt die Seite mechanisches Denken, Analyse-getriebene Konstruktion und Engineering-Trade-offs.",
          actions: [
            createBadgedAction("Topology Bag Sealer", createHelpBotPageTarget("project-topology-bag-sealer.html"), "SOLIDWORKS"),
            createBadgedAction("Skills", createHelpBotHomeTarget("skills"), "Tools"),
            createBadgedAction("Projektbereich", createHelpBotHomeTarget("projects"), "Overview")
          ]
        },
        "reviews": {
          text: "Die Review-Sektion ist die Vertrauensebene des Portfolios. Dort sehen Sie hervorgehobene, vom Admin gepinnte Reviews, das Archiv oeffentlicher Reviews, die Gesamtbewertung, Reichweite nach Laendern und sichtbare Owner-Replies. Wenn Sie pruefen wollen, wie das Profil von anderen wahrgenommen wird, ist das der richtige Bereich.",
          actions: [
            createBadgedAction("Reviews oeffnen", createHelpBotHomeTarget("reviews"), "Trust"),
            createBadgedAction("Feedback-Seite", createHelpBotPageTarget("feedback.html"), "Archive"),
            createBadgedAction("Kontakt", createHelpBotContactFormTarget(), "Action")
          ]
        },
        "robotics-fit": {
          text: "Fuer Robotik passt Sooraj am staerksten zu industrieller Robotik, autonomen Systemen und motion-planning-naher Engineering-Arbeit. Die besten Belege liegen in der KEBA Erfahrung, der Master-Thesis, dem ROS-Vakuumroboter und der allgemeinen Experience-Sektion. Diese Kombination deckt Industrieumfeld, Robotiksoftware, Planung und Umsetzung ab.",
          actions: [
            createBadgedAction("Where I Fit", createHelpBotHomeTarget("where-i-fit"), "Fit"),
            createBadgedAction("KEBA Erfahrung", createHelpBotPageTarget("experience-working-student-keba.html"), "Industry"),
            createBadgedAction("ROS-Projekt", createHelpBotPageTarget("project-autonomous-vacuum-robot.html"), "Proof")
          ]
        },
        "immersive-fit": {
          text: "Fuer AR/VR/XR liegt der staerkste Match in immersiver Trainings- und Simulationsarbeit. Die klarste Evidenz ist der VR Machine Operation Workshop in Unity mit C# und raeumlicher Interaktion. Das Profil ist hier also am glaubwuerdigsten fuer VR/XR-Workflows, HMI-nahe Trainingssimulation und interaktive Engineering-Prototypen.",
          actions: [
            createBadgedAction("VR-Workshop", createHelpBotPageTarget("project-vr-machine-workshop.html"), "VR"),
            createBadgedAction("Where I Fit", createHelpBotHomeTarget("where-i-fit"), "Fit"),
            createBadgedAction("Skills", createHelpBotHomeTarget("skills"), "Stack")
          ]
        },
        "simulation-fit": {
          text: "Fuer MATLAB-, Simulink- und Simulationsrollen liegt die staerkste Evidenz im Active-Suspension-Projekt, im allgemeinen simulation-led Engineering-Profil und in der These, dass Sooraj Systeme nicht nur modelliert, sondern in Richtung Ausfuehrungslogik denkt. Das Profil passt hier gut zu controls-naher Modellierung, Simulationsvalidierung und systemorientierter Analyse.",
          actions: [
            createBadgedAction("Active Suspension", createHelpBotPageTarget("project-active-suspension.html"), "MATLAB"),
            createBadgedAction("Where I Fit", createHelpBotHomeTarget("where-i-fit"), "Fit"),
            createBadgedAction("Skills", createHelpBotHomeTarget("skills"), "Stack")
          ]
        },
        "design-fit": {
          text: "Fuer SOLIDWORKS- und designnahe Rollen zeigt das Portfolio vor allem den Topology Bag Sealer mit FEA-getriebener Optimierung sowie die mechanische Basis aus dem Bachelor. Dazu kommen Tool-Erfahrung mit SOLIDWORKS, AutoCAD, ANSYS und Blender. Das Profil ist also nicht nur softwarelastig, sondern hat eine saubere Mechanical-Engineering-Seite.",
          actions: [
            createBadgedAction("Topology Bag Sealer", createHelpBotPageTarget("project-topology-bag-sealer.html"), "SOLIDWORKS"),
            createBadgedAction("Skills", createHelpBotHomeTarget("skills"), "Tools"),
            createBadgedAction("Bildung", createHelpBotHomeTarget("education"), "Base")
          ]
        },
        "skills-overview": {
          text: "Die Skills lassen sich in vier Gruppen lesen. 1. Robotik: ROS, ROS 2, Robot Programming, Trajectory Planning, Navigation und SLAM. 2. Programming und Simulation: Python, C++, C#, MATLAB, Simulink, Unity, VR und XR. 3. Sensing und Tools: LiDAR, Radar, OpenCV, GitHub, Ubuntu, SOLIDWORKS, AutoCAD, ANSYS und Blender. 4. Engineering-Disziplin: Design Validation, Reporting, Industrial Context und deployment-orientiertes Problem Solving.",
          actions: [
            createBadgedAction("Skills", createHelpBotHomeTarget("skills"), "Stack"),
            createBadgedAction("Projektbereich", createHelpBotHomeTarget("projects"), "Proof"),
            createBadgedAction("KEBA Erfahrung", createHelpBotPageTarget("experience-working-student-keba.html"), "Industry")
          ]
        },
        "contact": {
          text: "Sie koennen Sooraj direkt ueber die Kontaktwege der Website erreichen. Am schnellsten sind Kontaktformular und CV-Anfrage. Wenn Sie moechten, kann ich Sie direkt in den Kontaktpfad fuehren oder die CV-Anfrage starten, damit die Verbindung sauber ueber die Website laeuft.",
          actions: [
            createBadgedAction("Kontakt anfragen", createHelpBotContactFormTarget(), "Action"),
            createBadgedAction("CV anfragen", createHelpBotCvTarget(), "CV"),
            createBadgedAction("Kontaktbereich", createHelpBotHomeTarget("contact"), "Direct")
          ]
        }
      };
      return deAnswers[answerId] || null;
    }

    const enAnswers = {
      "about-profile": {
        text: "If you want the clearest overall picture of Sooraj, start with About, Experience, and Where I Fit. Those sections show the technical direction across robotics, mechatronics, simulation, immersive work, and industrial context in Germany.",
        actions: [
          createBadgedAction("Open about section", createHelpBotHomeTarget("about"), "Start"),
          createBadgedAction("Open experience section", createHelpBotHomeTarget("experience"), "Proof"),
          createBadgedAction("Open Where I Fit", createHelpBotHomeTarget("where-i-fit"), "Fit")
        ]
      },
      "experience-overview": {
        text: "Sooraj's broader experience section is strongest in three parts: the current KEBA working-student role in industrial robotics, the parallel KEBA master's thesis with planning- and execution-facing robotics work, and the earlier industrial foundation as an NDT technician in India. Together those pages show current robotics direction, thesis depth, and earlier engineering responsibility.",
        actions: [
          createBadgedAction("Open experience section", createHelpBotHomeTarget("experience"), "Proof"),
          createBadgedAction("KEBA working student role", createHelpBotPageTarget("experience-working-student-keba.html"), "Current"),
          createBadgedAction("KEBA master's thesis", createHelpBotPageTarget("experience-masters-thesis-keba.html"), "Thesis"),
          createBadgedAction("NDT technician role", createHelpBotPageTarget("experience-ndt-technician.html"), "Base")
        ]
      },
      "robotics-experience": {
        text: "Sooraj's strongest robotics experience is spread across three layers: the KEBA master's thesis in industrial robotics, the parallel KEBA working-student role in a live industrial environment, and robotics projects like the autonomous vacuum robot and the service robot. Together those pages show robotics software, motion planning, robot programming, simulation, and deployment-facing engineering logic.",
        actions: [
          createBadgedAction("Open experience section", createHelpBotHomeTarget("experience"), "Proof"),
          createBadgedAction("KEBA master's thesis", createHelpBotPageTarget("experience-masters-thesis-keba.html"), "Robotics"),
          createBadgedAction("KEBA working student role", createHelpBotPageTarget("experience-working-student-keba.html"), "Industry"),
          createBadgedAction("Autonomous vacuum robot", createHelpBotPageTarget("project-autonomous-vacuum-robot.html"), "ROS")
        ]
      },
      "vr-immersive": {
        text: "Sooraj's clearest immersive engineering experience is the VR Machine Operation Workshop. That project uses Unity and C# to build a training-oriented simulation environment for machine operation, spatial interaction, and realistic user flow. So the strongest evidence is in VR/XR-style work rather than in a separate AR-only product case.",
        actions: [
          createBadgedAction("Open VR workshop", createHelpBotPageTarget("project-vr-machine-workshop.html"), "VR"),
          createBadgedAction("Open Where I Fit", createHelpBotHomeTarget("where-i-fit"), "Fit"),
          createBadgedAction("Open skills", createHelpBotHomeTarget("skills"), "Stack")
        ]
      },
      "journey-india-germany": {
        text: "The India-to-Germany path is structured clearly. It starts with school foundation and a B.Tech in Mechanical Engineering in India, then adds the 2022 industrial foundation through non-destructive testing in Kochi, and from March 2023 moves into Germany for the M.Eng. in Mechatronics and Cyber-Physical Systems at TH Deggendorf. From there the profile grows into the KEBA working-student role and the parallel industrial robotics thesis in Stuttgart.",
        actions: [
          createBadgedAction("Open journey page", createHelpBotPageTarget("journey.html"), "Story"),
          createBadgedAction("Open education section", createHelpBotHomeTarget("education"), "Study"),
          createBadgedAction("Open experience section", createHelpBotHomeTarget("experience"), "Proof")
        ]
      },
      "bachelor-path": {
        text: "Sooraj's bachelor's phase ran from August 2017 to July 2021 as a B.Tech in Mechanical Engineering at APJ Abdul Kalam Technological University. That period built the base in mechanical design, manufacturing, CAD/CAE, and engineering fundamentals. It also included leadership work and the later award-winning service robot project before the next steps into industry and then Germany.",
        actions: [
          createBadgedAction("Open education section", createHelpBotHomeTarget("education"), "Study"),
          createBadgedAction("Open journey page", createHelpBotPageTarget("journey.html"), "Context"),
          createBadgedAction("Open service robot", createHelpBotPageTarget("project-service-robot.html"), "Award")
        ]
      },
      "current-role-germany": {
        text: "The current role in Germany is Working Student at KEBA Group in Stuttgart, Baden-Wuerttemberg. The work is centered on industrial robotics and automation in a live engineering environment, with focus on robot programming, implementation quality, and deployment context. In parallel, Sooraj is also doing the master's thesis in industrial robotics with a 6-axis workflow, motion planning, and execution-facing constraints.",
        actions: [
          createBadgedAction("Open KEBA working student role", createHelpBotPageTarget("experience-working-student-keba.html"), "Current"),
          createBadgedAction("Open KEBA master's thesis", createHelpBotPageTarget("experience-masters-thesis-keba.html"), "Parallel"),
          createBadgedAction("Open contact form", createHelpBotContactFormTarget(), "Action")
        ]
      },
      "germany-location": {
        text: "The current professional base is Stuttgart, Germany, because that is where the KEBA role and thesis-linked robotics work are anchored. The academic path is tied to TH Deggendorf, and the journey page also highlights lived experience across Bavaria, Thuringia, and Baden-Wuerttemberg.",
        actions: [
          createBadgedAction("Open travel footprint", createHelpBotPageTarget("journey.html", "travel"), "Travel"),
          createBadgedAction("Open KEBA role", createHelpBotPageTarget("experience-working-student-keba.html"), "Current"),
          createBadgedAction("Open education section", createHelpBotHomeTarget("education"), "Study")
        ]
      },
      "travel-footprint": {
        text: "The travel footprint is split into India, international countries, and Germany lived experience. In India the portfolio lists Kerala, Tamil Nadu, Rajasthan, and Goa. The countries explored list includes Germany, Bahrain, Qatar, Austria, Switzerland, Czech Republic, and Luxembourg. For Germany specifically, the journey page highlights lived experience across Bavaria, Thuringia, and Baden-Wuerttemberg.",
        actions: [
          createBadgedAction("Open travel footprint", createHelpBotPageTarget("journey.html", "travel"), "Travel"),
          createBadgedAction("Open journey page", createHelpBotPageTarget("journey.html"), "Story"),
          createBadgedAction("Open KEBA role", createHelpBotPageTarget("experience-working-student-keba.html"), "Germany")
        ]
      },
      "projects-all": {
        text: "The projects section covers five main projects. 1. Autonomous Vacuum Robot in ROS for SLAM, localization, and navigation. 2. VR Machine Operation Workshop for Unity-based immersive training simulation. 3. Active Suspension System Modeling for MATLAB and Simulink-based controls thinking. 4. Topology Optimized Temporary Bag Sealer for SOLIDWORKS, FEA, and optimization. 5. Automated Mechatronic Service Robot for early Arduino-based robotics and the Best Bachelor Project award.",
        actions: [
          createBadgedAction("Open projects section", createHelpBotHomeTarget("projects"), "Overview"),
          createBadgedAction("Autonomous vacuum robot", createHelpBotPageTarget("project-autonomous-vacuum-robot.html"), "ROS"),
          createBadgedAction("VR workshop", createHelpBotPageTarget("project-vr-machine-workshop.html"), "VR"),
          createBadgedAction("Active suspension", createHelpBotPageTarget("project-active-suspension.html"), "MATLAB")
        ]
      },
      "thesis-detail": {
        text: "The master's thesis at KEBA ran from September 2025 to March 2026 and focused on a 6-axis industrial robotics workflow for machine operation. The important point is that it was not only about simulation. It connected planning, gripping logic, cell geometry, and deployment-facing execution. It also included a lightweight web-based joint path planner for waypoints and drag&bot simulation validation.",
        actions: [
          createBadgedAction("Open master's thesis", createHelpBotPageTarget("experience-masters-thesis-keba.html"), "Robotics"),
          createBadgedAction("Open KEBA experience", createHelpBotPageTarget("experience-working-student-keba.html"), "Context"),
          createBadgedAction("Open journey page", createHelpBotPageTarget("journey.html"), "Story")
        ]
      },
      "ros-project": {
        text: "The autonomous vacuum robot is the clearest ROS project in the portfolio. It shows SLAM-based localization, obstacle detection, path planning, sensor-driven decision logic, and the working stack across ROS, Gazebo, and RViz. It is one of the most direct pieces of evidence for robotics software and autonomous navigation work.",
        actions: [
          createBadgedAction("Open ROS project", createHelpBotPageTarget("project-autonomous-vacuum-robot.html"), "ROS"),
          createBadgedAction("Open KEBA master's thesis", createHelpBotPageTarget("experience-masters-thesis-keba.html"), "Related"),
          createBadgedAction("Open projects section", createHelpBotHomeTarget("projects"), "Overview")
        ]
      },
      "service-robot-detail": {
        text: "The service robot is an early but important robotics foundation in the portfolio. Built in July 2021, the Arduino-based system was shaped around patient-care support during the pandemic and combined sensor integration, line-following, guided movement, and a real human-centered use case. It later received Best Bachelor Project recognition.",
        actions: [
          createBadgedAction("Open service robot", createHelpBotPageTarget("project-service-robot.html"), "Award"),
          createBadgedAction("Open education section", createHelpBotHomeTarget("education"), "Bachelor"),
          createBadgedAction("Open projects section", createHelpBotHomeTarget("projects"), "Overview")
        ]
      },
      "active-suspension-detail": {
        text: "The Active Suspension project shows MATLAB and Simulink-based modeling for dynamic system behavior. It focuses on hydraulic actuator logic, system response, and simulation-led performance study. That makes it one of the clearer controls and system-analysis pages in the portfolio beyond the robotics-specific pages.",
        actions: [
          createBadgedAction("Open Active Suspension", createHelpBotPageTarget("project-active-suspension.html"), "MATLAB"),
          createBadgedAction("Open Where I Fit", createHelpBotHomeTarget("where-i-fit"), "Fit"),
          createBadgedAction("Open skills", createHelpBotHomeTarget("skills"), "Stack")
        ]
      },
      "topology-detail": {
        text: "The Topology Bag Sealer is the strongest SolidWorks and FEA-oriented design page in the portfolio. It focused on weight and material reduction through topology optimization while still keeping manufacturability practical. So it demonstrates mechanical reasoning, analysis-driven design, and engineering trade-off handling.",
        actions: [
          createBadgedAction("Open Topology Bag Sealer", createHelpBotPageTarget("project-topology-bag-sealer.html"), "SOLIDWORKS"),
          createBadgedAction("Open skills", createHelpBotHomeTarget("skills"), "Tools"),
          createBadgedAction("Open projects section", createHelpBotHomeTarget("projects"), "Overview")
        ]
      },
      "reviews": {
        text: "The reviews section is the trust layer of the portfolio. It shows featured admin-pinned reviews, the archive of public reviews, overall rating, reach by country, and visible owner replies. If you want to understand how the profile is being received by others, that is the right section to read.",
        actions: [
          createBadgedAction("Open reviews", createHelpBotHomeTarget("reviews"), "Trust"),
          createBadgedAction("Open feedback page", createHelpBotPageTarget("feedback.html"), "Archive"),
          createBadgedAction("Open contact", createHelpBotContactFormTarget(), "Action")
        ]
      },
      "robotics-fit": {
        text: "For robotics, Sooraj fits best in industrial robotics, autonomous systems, and motion-planning-oriented engineering roles. The strongest evidence comes from the KEBA experience, the master's thesis, the ROS vacuum robot, and the broader experience section. That combination covers industrial context, robotics software, planning, and execution.",
        actions: [
          createBadgedAction("Open Where I Fit", createHelpBotHomeTarget("where-i-fit"), "Fit"),
          createBadgedAction("Open KEBA experience", createHelpBotPageTarget("experience-working-student-keba.html"), "Industry"),
          createBadgedAction("Open ROS project", createHelpBotPageTarget("project-autonomous-vacuum-robot.html"), "Proof")
        ]
      },
      "immersive-fit": {
        text: "For AR, VR, XR, or MR-style work, the strongest fit is in immersive training and simulation engineering. The clearest evidence is the VR Machine Operation Workshop in Unity with C# and spatial interaction design. So the profile is most credible here for VR/XR workflows, HMI-adjacent training simulation, and interactive engineering prototypes.",
        actions: [
          createBadgedAction("Open VR workshop", createHelpBotPageTarget("project-vr-machine-workshop.html"), "VR"),
          createBadgedAction("Open Where I Fit", createHelpBotHomeTarget("where-i-fit"), "Fit"),
          createBadgedAction("Open skills", createHelpBotHomeTarget("skills"), "Stack")
        ]
      },
      "simulation-fit": {
        text: "For MATLAB, Simulink, and simulation roles, the strongest evidence is the Active Suspension project, the simulation-led engineering profile, and the wider pattern that Sooraj connects modeling with execution logic rather than stopping at theory. That makes the profile a good match for control-oriented simulation, system modeling, and validation-heavy engineering work.",
        actions: [
          createBadgedAction("Open Active Suspension", createHelpBotPageTarget("project-active-suspension.html"), "MATLAB"),
          createBadgedAction("Open Where I Fit", createHelpBotHomeTarget("where-i-fit"), "Fit"),
          createBadgedAction("Open skills", createHelpBotHomeTarget("skills"), "Stack")
        ]
      },
      "design-fit": {
        text: "For SolidWorks and design-oriented roles, the strongest proof is the Topology Bag Sealer with FEA-driven optimization and manufacturability thinking, supported by the mechanical engineering base from the bachelor's path. The skills section also shows SolidWorks, AutoCAD, ANSYS, and Blender, so the profile is not software-only; it still has a clear mechanical-design side.",
        actions: [
          createBadgedAction("Open Topology Bag Sealer", createHelpBotPageTarget("project-topology-bag-sealer.html"), "SOLIDWORKS"),
          createBadgedAction("Open skills", createHelpBotHomeTarget("skills"), "Tools"),
          createBadgedAction("Open education section", createHelpBotHomeTarget("education"), "Base")
        ]
      },
      "skills-overview": {
        text: "The skills section reads best in four groups. 1. Robotics: ROS, ROS 2, robot programming, trajectory planning, navigation, and SLAM. 2. Programming and simulation: Python, C++, C#, MATLAB, Simulink, Unity, VR, and XR. 3. Sensing and tools: LiDAR, radar, OpenCV, GitHub, Ubuntu, SOLIDWORKS, AutoCAD, ANSYS, and Blender. 4. Engineering discipline: design validation, technical reporting, industrial context, and deployment-focused problem solving.",
        actions: [
          createBadgedAction("Open skills", createHelpBotHomeTarget("skills"), "Stack"),
          createBadgedAction("Open projects section", createHelpBotHomeTarget("projects"), "Proof"),
          createBadgedAction("Open KEBA experience", createHelpBotPageTarget("experience-working-student-keba.html"), "Industry")
        ]
      },
      "contact": {
        text: "You can reach Sooraj through the website contact paths directly. The fastest routes are the contact form and the CV request flow. If you want, I can help connect you by taking you straight into the contact path or the CV request path through the website.",
        actions: [
          createBadgedAction("Request contact", createHelpBotContactFormTarget(), "Action"),
          createBadgedAction("Request CV", createHelpBotCvTarget(), "CV"),
          createBadgedAction("Open contact section", createHelpBotHomeTarget("contact"), "Direct")
        ]
      }
    };
    return enAnswers[answerId] || null;
  };

  const findWebsiteQuestionMatches = async (query, { deep = false } = {}) => {
    const normalizedQuery = String(query || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
    const tokens = getRelevantSearchTokens(normalizedQuery);
    if (!tokens.length) return [];
    const bank = await loadHelpBotQuestionBank();
    if (!Array.isArray(bank?.intents) || !bank.intents.length) return [];

    const scoreQuestion = (question = "", keywords = []) => {
      const questionNormalized = String(question || "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .trim();
      const questionTokens = getRelevantSearchTokens(questionNormalized);
      const keywordParts = Array.isArray(keywords)
        ? keywords
          .map((keyword) => getSearchPhraseParts(keyword))
          .filter((part) => part.normalized)
        : [];
      const keywordTokens = [...new Set(keywordParts.flatMap((part) => getRelevantSearchTokens(part.normalized)))];
      const keywordPhraseMatches = keywordParts.filter((part) => (
        part.normalized
        && normalizedQuery.length >= 3
        && (normalizedQuery.includes(part.normalized) || part.normalized.includes(normalizedQuery))
      )).length;
      const questionTokenMatches = tokens.filter((token) => questionTokens.some((candidate) => isSearchTokenRelated(token, candidate)));
      const keywordTokenMatches = tokens.filter((token) => keywordTokens.some((candidate) => isSearchTokenRelated(token, candidate)));
      const overlap = new Set([...questionTokenMatches, ...keywordTokenMatches]).size;
      const exact = normalizedQuery === questionNormalized;
      const strongPhrase = normalizedQuery.length >= 6 && (questionNormalized.includes(normalizedQuery) || normalizedQuery.includes(questionNormalized));
      const ratio = overlap / Math.max(tokens.length, 1);
      if (!exact && !strongPhrase && !keywordPhraseMatches && overlap < Math.min(tokens.length, 2)) return 0;
      let score = (overlap * 4) + (keywordTokenMatches.length * 2) + (keywordPhraseMatches * 3);
      if (exact) score += 18;
      if (strongPhrase) score += 10;
      if (keywordPhraseMatches) score += 6;
      if (overlap === tokens.length && tokens.length > 1) score += 8;
      if (ratio >= 0.75) score += 8;
      else if (ratio >= 0.55) score += 5;
      if (deep && ratio >= 0.4) score += 4;
      return score;
    };

    const ranked = bank.intents
      .map((intent) => {
        const bestQuestion = intent.questions
          .map((question) => ({ question, score: scoreQuestion(question, intent.keywords) }))
          .sort((left, right) => right.score - left.score)[0];
        const keywordOnlyScore = scoreQuestion("", intent.keywords);
        const bestScore = Math.max(bestQuestion?.score || 0, keywordOnlyScore);
        if (bestScore <= 0) return null;
        const threshold = deep ? 7 : 9;
        if (bestScore < threshold) return null;
        return {
          kind: "question",
          answerId: intent.id,
          label: bestQuestion?.question || intent.questions?.[0] || intent.id,
          score: bestScore
        };
      })
      .filter(Boolean)
      .sort((left, right) => right.score - left.score);

    return ranked.slice(0, 4);
  };

  const getWebsiteSearchIndex = () => ([
    {
      label: currentLang === "de" ? "About Sooraj" : "About Sooraj",
      target: createHelpBotHomeTarget("about"),
      keywords: ["about", "about sooraj", "sooraj", "profile", "overview", "introduction", "who is sooraj"]
    },
    {
      label: currentLang === "de" ? "Erfahrungsbereich" : "Experience section",
      target: createHelpBotHomeTarget("experience"),
      keywords: ["experience", "industrial", "keba", "working student", "thesis", "ndt", "robotics", "automation", "germany"]
    },
    {
      label: currentLang === "de" ? "KEBA Master-Thesis" : "KEBA master's thesis",
      target: createHelpBotPageTarget("experience-masters-thesis-keba.html"),
      keywords: ["thesis", "master thesis", "keba thesis", "industrial robotics", "robot programming", "deployment", "6 axis"]
    },
    {
      label: currentLang === "de" ? "KEBA Werkstudent" : "KEBA working student role",
      target: createHelpBotPageTarget("experience-working-student-keba.html"),
      keywords: ["working student", "werkstudent", "keba", "industrial robotics", "training", "exhibition"]
    },
    {
      label: currentLang === "de" ? "Journey-Seite" : "Journey page",
      target: createHelpBotPageTarget("journey.html"),
      keywords: ["journey", "path", "india", "germany", "transition", "background", "story", "travel"]
    },
    {
      label: currentLang === "de" ? "Projektbereich" : "Projects section",
      target: createHelpBotHomeTarget("projects"),
      keywords: ["projects", "project", "robotics projects", "portfolio work", "technical work"]
    },
    {
      label: currentLang === "de" ? "Autonomer Vakuumroboter" : "Autonomous vacuum robot",
      target: createHelpBotPageTarget("project-autonomous-vacuum-robot.html"),
      keywords: ["ros", "vacuum", "slam", "autonomous robot", "gazebo", "rviz", "robotics software"]
    },
    {
      label: currentLang === "de" ? "Service-Roboter" : "Service robot",
      target: createHelpBotPageTarget("project-service-robot.html"),
      keywords: ["service robot", "robot arm", "robotics", "mechanical design", "systems"]
    },
    {
      label: currentLang === "de" ? "Aktive Fahrwerksregelung" : "Active suspension project",
      target: createHelpBotPageTarget("project-active-suspension.html"),
      keywords: ["active suspension", "matlab", "simulink", "simulation", "controls", "dynamics"]
    },
    {
      label: currentLang === "de" ? "Topology-Bag-Sealer" : "Topology bag sealer",
      target: createHelpBotPageTarget("project-topology-bag-sealer.html"),
      keywords: ["topology", "solidworks", "fea", "mechanical design", "optimization", "bag sealer"]
    },
    {
      label: currentLang === "de" ? "Portfolio-Map" : "Portfolio map",
      target: createHelpBotPageTarget("portfolio-map.html"),
      keywords: ["portfolio map", "site map", "overview", "all pages", "crawlable overview"]
    },
    {
      label: currentLang === "de" ? "Where I Fit" : "Where I Fit",
      target: createHelpBotHomeTarget("where-i-fit"),
      keywords: ["where i fit", "role fit", "best fit", "roles", "recruiter"]
    },
    {
      label: currentLang === "de" ? "Review-Bereich" : "Reviews section",
      target: createHelpBotHomeTarget("reviews"),
      keywords: ["reviews", "feedback", "credibility", "public review", "trust"]
    },
    {
      label: currentLang === "de" ? "Kontaktbereich" : "Contact section",
      target: createHelpBotHomeTarget("contact"),
      keywords: ["contact", "email", "reach out", "message", "hire", "talk"]
    },
    {
      label: currentLang === "de" ? "CV-Anfrage" : "CV request",
      target: createHelpBotCvTarget(),
      keywords: ["cv", "resume", "request cv", "request resume"]
    },
    {
      label: currentLang === "de" ? "Zertifikate" : "Certificates section",
      target: createHelpBotHomeTarget("certificates"),
      keywords: ["certificates", "certifications", "training", "validation"]
    },
    {
      label: currentLang === "de" ? "Bildungsbereich" : "Education section",
      target: createHelpBotHomeTarget("education"),
      keywords: ["education", "study", "university", "degree", "master", "bachelor"]
    }
  ]);

  const getWebsiteQuestionAnswer = (query = "") => {
    const normalizedQuery = String(query || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
    const tokens = normalizeSearchTokens(normalizedQuery)
      .filter((token) => token.length >= 2);
    if (!tokens.length) return null;

    const hasTerm = (value = "") => {
      const target = String(value || "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .trim();
      if (!target) return false;
      if (target.includes(" ")) return normalizedQuery.includes(target);
      return tokens.some((token) => (
        token === target
        || token.startsWith(target)
        || target.startsWith(token)
        || (target.length >= 4 && token.includes(target))
      ));
    };

    const hasAny = (values = []) => values.some((value) => hasTerm(value));
    const hasAll = (values = []) => values.every((value) => hasTerm(value));
    const scoreMatches = (values = [], weight = 1) => values.reduce((score, value) => score + (hasTerm(value) ? weight : 0), 0);
    const scoreIf = (condition, points) => (condition ? points : 0);

    const definitions = currentLang === "de"
      ? [
          {
            id: "experience-overview",
            minScore: 5,
            score: () => (
              scoreMatches(["erfahrung", "experience", "karriere", "arbeit", "beruflich", "rollen", "jobs"], 2)
            ),
            text: "Soorajs allgemeine Experience-Sektion ist am staerksten in drei Teilen: die aktuelle KEBA Werkstudentenrolle in industrieller Robotik, die parallele KEBA Master-Thesis mit planungs- und ausfuehrungsnaher Robotikarbeit und die fruehere industrielle Grundlage als NDT-Techniker in Indien. Zusammen zeigen diese Seiten aktuelle Robotikrichtung, Thesis-Tiefe und fruehere industrielle Verantwortung.",
            actions: [
              createBadgedAction("Erfahrung oeffnen", createHelpBotHomeTarget("experience"), "Proof"),
              createBadgedAction("KEBA Werkstudent", createHelpBotPageTarget("experience-working-student-keba.html"), "Current"),
              createBadgedAction("KEBA Master-Thesis", createHelpBotPageTarget("experience-masters-thesis-keba.html"), "Thesis"),
              createBadgedAction("NDT Rolle", createHelpBotPageTarget("experience-ndt-technician.html"), "Base")
            ]
          },
          {
            id: "robotics-experience",
            minScore: 6,
            score: () => (
              scoreMatches(["robotik", "robotics", "automation", "industrielle robotik", "mechatronik"], 3)
              + scoreMatches(["erfahrung", "experience", "keba", "werkstudent", "thesis", "projekte"], 2)
            ),
            text: "Soorajs staerkste Robotik-Erfahrung liegt in drei Ebenen: in der KEBA Master-Thesis zur industriellen Robotik, in der parallelen KEBA Werkstudentenrolle im Live-Industrieumfeld und in Robotikprojekten wie dem autonomen Vakuumroboter und dem Service-Roboter. Zusammen zeigen diese Seiten Robotiksoftware, Motion Planning, Robot Programming, Simulation und umsetzungsnahe Engineering-Logik.",
            actions: [
              createBadgedAction("Erfahrung oeffnen", createHelpBotHomeTarget("experience"), "Proof"),
              createBadgedAction("KEBA Master-Thesis", createHelpBotPageTarget("experience-masters-thesis-keba.html"), "Robotik"),
              createBadgedAction("KEBA Werkstudent", createHelpBotPageTarget("experience-working-student-keba.html"), "Industrie"),
              createBadgedAction("Vakuumroboter", createHelpBotPageTarget("project-autonomous-vacuum-robot.html"), "ROS")
            ]
          },
          {
            id: "vr-immersive",
            minScore: 5,
            score: () => (
              scoreMatches(["vr", "xr", "ar", "mr", "unity", "immersive"], 3)
              + scoreMatches(["workshop", "maschine", "machine", "training", "interaction"], 2)
            ),
            text: "Die staerkste immersive Erfahrung im Portfolio ist der VR Machine Operation Workshop. Dort hat Sooraj in Unity und C# eine trainingsorientierte Simulationsumgebung fuer Maschinenbedienung, raeumliche Interaktion und realistischere Nutzerfuehrung aufgebaut. Die cleareste Evidenz liegt also im VR/XR-Bereich, nicht in einem separaten AR-only Produktfall.",
            actions: [
              createBadgedAction("VR-Workshop", createHelpBotPageTarget("project-vr-machine-workshop.html"), "VR"),
              createBadgedAction("Where I Fit", createHelpBotHomeTarget("where-i-fit"), "Fit"),
              createBadgedAction("Skills", createHelpBotHomeTarget("skills"), "Stack")
            ]
          },
          {
            id: "journey-india-germany",
            minScore: 6,
            score: () => (
              scoreIf(hasAll(["india", "germany"]), 6)
              + scoreMatches(["journey", "weg", "path", "story", "transition", "move"], 2)
              + scoreMatches(["bachelor", "master", "studium", "robotik"], 1)
            ),
            text: "Der Weg von Indien nach Deutschland ist klar aufgebaut. Erst kamen Schulbasis und B.Tech in Mechanical Engineering in Indien, dann 2022 die industrielle Grundlage ueber Non-Destructive Testing in Kochi, und ab 2023 der Wechsel nach Deutschland fuer den M.Eng. in Mechatronics and Cyber-Physical Systems an der TH Deggendorf. Von dort fuehrte der Weg weiter in die KEBA Werkstudentenrolle und die parallele Master-Thesis in industrieller Robotik in Stuttgart.",
            actions: [
              createBadgedAction("Journey oeffnen", createHelpBotPageTarget("journey.html"), "Story"),
              createBadgedAction("Bildung", createHelpBotHomeTarget("education"), "Study"),
              createBadgedAction("KEBA Erfahrung", createHelpBotHomeTarget("experience"), "Proof")
            ]
          },
          {
            id: "bachelor-path",
            minScore: 5,
            score: () => (
              scoreMatches(["bachelor", "btech", "mechanical engineering", "mechanik", "mechanical"], 3)
              + scoreMatches(["india", "jahr", "year", "ktu", "apj", "university"], 2)
            ),
            text: "Soorajs Bachelor-Phase lief von August 2017 bis Juli 2021 als B.Tech in Mechanical Engineering an der APJ Abdul Kalam Technological University. In dieser Zeit wurden Mechanical Design, Manufacturing, CAD/CAE und die technischen Grundlagen aufgebaut. Parallel dazu entstanden Leadership-Erfahrung und das spaeter ausgezeichnete Service-Roboter-Projekt, bevor danach erst die Industriephase in Indien und dann Deutschland folgten.",
            actions: [
              createBadgedAction("Bildungsbereich", createHelpBotHomeTarget("education"), "Study"),
              createBadgedAction("Journey", createHelpBotPageTarget("journey.html"), "Context"),
              createBadgedAction("Service-Roboter", createHelpBotPageTarget("project-service-robot.html"), "Award")
            ]
          },
          {
            id: "current-role-germany",
            minScore: 5,
            score: () => (
              scoreMatches(["current role", "aktuelle rolle", "werkstudent", "working student", "workstudent", "job"], 3)
              + scoreMatches(["germany", "stuttgart", "keba", "current", "role"], 2)
            ),
            text: "Die aktuelle Rolle in Deutschland ist Werkstudent bei der KEBA Group in Stuttgart, Baden-Wuerttemberg. Der Schwerpunkt liegt auf industrieller Robotik und Automation in einem echten Engineering-Umfeld, also auf Robot Programming, Implementierungsqualitaet und Deployment-Kontext. Parallel dazu laeuft die Master-Thesis in industrieller Robotik mit Fokus auf 6-Achs-Workflow, Motion Planning und umsetzungsnaher Ausfuehrung.",
            actions: [
              createBadgedAction("KEBA Werkstudent", createHelpBotPageTarget("experience-working-student-keba.html"), "Current"),
              createBadgedAction("KEBA Master-Thesis", createHelpBotPageTarget("experience-masters-thesis-keba.html"), "Parallel"),
              createBadgedAction("Kontakt", createHelpBotContactFormTarget(), "Action")
            ]
          },
          {
            id: "germany-location",
            minScore: 5,
            score: () => (
              scoreMatches(["where", "wo", "stay", "staying", "live", "living", "based", "location"], 2)
              + scoreMatches(["germany", "stuttgart", "deggendorf", "bavaria", "baden"], 2)
            ),
            text: "Der aktuelle berufliche Ankerpunkt ist Stuttgart in Deutschland, weil dort die KEBA Werkstudentenrolle und die Thesis-nahe Robotikarbeit liegen. Die akademische Spur fuehrt ueber die TH Deggendorf, und die Journey-Seite nennt ausserdem gelebte Erfahrung in Bayern, Thueringen und Baden-Wuerttemberg.",
            actions: [
              createBadgedAction("Journey Travel", createHelpBotPageTarget("journey.html", "travel"), "Travel"),
              createBadgedAction("KEBA Rolle", createHelpBotPageTarget("experience-working-student-keba.html"), "Current"),
              createBadgedAction("Bildung", createHelpBotHomeTarget("education"), "Study")
            ]
          },
          {
            id: "travel-footprint",
            minScore: 5,
            score: () => (
              scoreMatches(["travel", "visited", "places", "orte", "countries", "explored", "footprint"], 3)
              + scoreMatches(["india", "indian", "germany", "deutschland"], 2)
            ),
            text: "Die Travel-Footprint-Sektion ist nach Indien, internationale Laender und gelebte Deutschland-Erfahrung getrennt. In Indien nennt das Portfolio Kerala, Tamil Nadu, Rajasthan und Goa. International werden Deutschland, Bahrain, Katar, Oesterreich, die Schweiz, Tschechien und Luxemburg genannt. Fuer Deutschland werden gelebte Erfahrung in Bayern, Thueringen und Baden-Wuerttemberg hervorgehoben.",
            actions: [
              createBadgedAction("Travel-Footprint", createHelpBotPageTarget("journey.html", "travel"), "Travel"),
              createBadgedAction("Journey", createHelpBotPageTarget("journey.html"), "Story"),
              createBadgedAction("KEBA Rolle", createHelpBotPageTarget("experience-working-student-keba.html"), "Germany")
            ]
          },
          {
            id: "projects-all",
            minScore: 5,
            score: () => (
              scoreMatches(["project", "projects", "projekte", "portfolio work", "technical work"], 3)
              + scoreMatches(["all", "explain", "liste", "show", "what all"], 1)
            ),
            text: "Die Projektsektion deckt fuenf Hauptprojekte ab. 1. Der autonome Vakuumroboter in ROS zeigt SLAM, Lokalisierung und Navigation. 2. Der VR Machine Operation Workshop zeigt Unity-basierte immersive Trainingssimulation. 3. Active Suspension zeigt MATLAB- und Simulink-basierte Modellierung und Controls-Denken. 4. Der Topology Bag Sealer zeigt SOLIDWORKS-, FEA- und Optimierungsarbeit. 5. Der Service-Roboter zeigt eine fruehe Arduino-basierte Robotikbasis mit Best-Bachelor-Project-Auszeichnung.",
            actions: [
              createBadgedAction("Projektbereich", createHelpBotHomeTarget("projects"), "Overview"),
              createBadgedAction("Vakuumroboter", createHelpBotPageTarget("project-autonomous-vacuum-robot.html"), "ROS"),
              createBadgedAction("VR-Workshop", createHelpBotPageTarget("project-vr-machine-workshop.html"), "VR"),
              createBadgedAction("Fahrwerksregelung", createHelpBotPageTarget("project-active-suspension.html"), "MATLAB")
            ]
          },
          {
            id: "reviews",
            minScore: 4,
            score: () => (
              scoreMatches(["review", "reviews", "feedback", "trust", "credibility"], 3)
              + scoreMatches(["public", "reply", "archive", "rating"], 1)
            ),
            text: "Die Review-Sektion ist die Vertrauensebene des Portfolios. Dort sehen Sie hervorgehobene, vom Admin gepinnte Reviews, das Archiv oeffentlicher Reviews, die Gesamtbewertung, Reichweite nach Laendern und sichtbare Owner-Replies. Wenn Sie pruefen wollen, wie das Profil von anderen wahrgenommen wird, ist das der richtige Bereich.",
            actions: [
              createBadgedAction("Reviews oeffnen", createHelpBotHomeTarget("reviews"), "Trust"),
              createBadgedAction("Feedback-Seite", createHelpBotPageTarget("feedback.html"), "Archive"),
              createBadgedAction("Kontakt", createHelpBotContactFormTarget(), "Action")
            ]
          },
          {
            id: "robotics-fit",
            minScore: 5,
            score: () => (
              scoreMatches(["fit", "rolle", "role", "best", "suited"], 2)
              + scoreMatches(["robotics", "robotik", "automation", "autonomous", "industry"], 3)
            ),
            text: "Fuer Robotik passt Sooraj am staerksten zu industrieller Robotik, autonomen Systemen und motion-planning-naher Engineering-Arbeit. Die besten Belege liegen in der KEBA Erfahrung, der Master-Thesis, dem ROS-Vakuumroboter und der allgemeinen Experience-Sektion. Diese Kombination deckt Industrieumfeld, Robotiksoftware, Planung und Umsetzung ab.",
            actions: [
              createBadgedAction("Where I Fit", createHelpBotHomeTarget("where-i-fit"), "Fit"),
              createBadgedAction("KEBA Erfahrung", createHelpBotPageTarget("experience-working-student-keba.html"), "Industry"),
              createBadgedAction("ROS-Projekt", createHelpBotPageTarget("project-autonomous-vacuum-robot.html"), "Proof")
            ]
          },
          {
            id: "immersive-fit",
            minScore: 5,
            score: () => (
              scoreMatches(["fit", "rolle", "role", "best", "suited"], 2)
              + scoreMatches(["ar", "vr", "xr", "mr", "unity", "immersive"], 3)
            ),
            text: "Fuer AR/VR/XR liegt der staerkste Match in immersiver Trainings- und Simulationsarbeit. Die klarste Evidenz ist der VR Machine Operation Workshop in Unity mit C# und raeumlicher Interaktion. Das Profil ist hier also am glaubwuerdigsten fuer VR/XR-Workflows, HMI-nahe Trainingssimulation und interaktive Engineering-Prototypen.",
            actions: [
              createBadgedAction("VR-Workshop", createHelpBotPageTarget("project-vr-machine-workshop.html"), "VR"),
              createBadgedAction("Where I Fit", createHelpBotHomeTarget("where-i-fit"), "Fit"),
              createBadgedAction("Skills", createHelpBotHomeTarget("skills"), "Stack")
            ]
          },
          {
            id: "simulation-fit",
            minScore: 5,
            score: () => (
              scoreMatches(["fit", "rolle", "role", "best", "suited"], 2)
              + scoreMatches(["matlab", "simulink", "simulation", "controls", "control"], 3)
            ),
            text: "Fuer MATLAB-, Simulink- und Simulationsrollen liegt die staerkste Evidenz im Active-Suspension-Projekt, im allgemeinen simulation-led Engineering-Profil und in der These, dass Sooraj Systeme nicht nur modelliert, sondern in Richtung Ausfuehrungslogik denkt. Das Profil passt hier gut zu controls-naher Modellierung, Simulationsvalidierung und systemorientierter Analyse.",
            actions: [
              createBadgedAction("Active Suspension", createHelpBotPageTarget("project-active-suspension.html"), "MATLAB"),
              createBadgedAction("Where I Fit", createHelpBotHomeTarget("where-i-fit"), "Fit"),
              createBadgedAction("Skills", createHelpBotHomeTarget("skills"), "Stack")
            ]
          },
          {
            id: "design-fit",
            minScore: 5,
            score: () => (
              scoreMatches(["solidworks", "cad", "design", "fea", "optimization", "optimierung"], 3)
              + scoreMatches(["fit", "rolle", "project", "projekt"], 1)
            ),
            text: "Fuer SOLIDWORKS- und designnahe Rollen zeigt das Portfolio vor allem den Topology Bag Sealer mit FEA-getriebener Optimierung sowie die mechanische Basis aus dem Bachelor. Dazu kommen Tool-Erfahrung mit SOLIDWORKS, AutoCAD, ANSYS und Blender. Das Profil ist also nicht nur softwarelastig, sondern hat eine saubere Mechanical-Engineering-Seite.",
            actions: [
              createBadgedAction("Topology Bag Sealer", createHelpBotPageTarget("project-topology-bag-sealer.html"), "SOLIDWORKS"),
              createBadgedAction("Skills", createHelpBotHomeTarget("skills"), "Tools"),
              createBadgedAction("Bildung", createHelpBotHomeTarget("education"), "Base")
            ]
          },
          {
            id: "skills-overview",
            minScore: 5,
            score: () => (
              scoreMatches(["skills", "skill", "tools", "stack", "software"], 3)
              + scoreMatches(["robotics", "matlab", "solidworks", "unity", "python", "c"], 1)
            ),
            text: "Die Skills lassen sich in vier Gruppen lesen. 1. Robotik: ROS, ROS 2, Robot Programming, Trajectory Planning, Navigation und SLAM. 2. Programming und Simulation: Python, C++, C#, MATLAB, Simulink, Unity, VR und XR. 3. Sensing und Tools: LiDAR, Radar, OpenCV, GitHub, Ubuntu, SOLIDWORKS, AutoCAD, ANSYS und Blender. 4. Engineering-Disziplin: Design Validation, Reporting, Industrial Context und deployment-orientiertes Problem Solving.",
            actions: [
              createBadgedAction("Skills", createHelpBotHomeTarget("skills"), "Stack"),
              createBadgedAction("Projektbereich", createHelpBotHomeTarget("projects"), "Proof"),
              createBadgedAction("KEBA Erfahrung", createHelpBotPageTarget("experience-working-student-keba.html"), "Industry")
            ]
          },
          {
            id: "contact",
            minScore: 4,
            score: () => (
              scoreMatches(["contact", "kontakt", "cv", "resume", "email", "hire", "reach"], 3)
              + scoreMatches(["message", "connect", "request", "talk"], 1)
            ),
            text: "Sie koennen Sooraj direkt ueber die Kontaktwege der Website erreichen. Am schnellsten sind Kontaktformular und CV-Anfrage. Wenn Sie moechten, kann ich Sie direkt in den Kontaktpfad fuehren oder die CV-Anfrage starten, damit die Verbindung sauber ueber die Website laeuft.",
            actions: [
              createBadgedAction("Kontakt anfragen", createHelpBotContactFormTarget(), "Action"),
              createBadgedAction("CV anfragen", createHelpBotCvTarget(), "CV"),
              createBadgedAction("Kontaktbereich", createHelpBotHomeTarget("contact"), "Direct")
            ]
          },
          {
            id: "about-profile",
            minScore: 4,
            score: () => (
              scoreMatches(["about", "profil", "profile", "overview", "introduction", "sooraj"], 2)
              + scoreMatches(["who", "background", "summary", "direction"], 1)
            ),
            text: "Wenn Sie Soorajs Gesamtprofil schnell verstehen wollen, beginnen Sie mit About, Experience und Where I Fit. Dort sehen Sie die technische Richtung zwischen Robotik, Mechatronik, Simulation, immersiven Projekten und industriellem Kontext in Deutschland.",
            actions: [
              createBadgedAction("About", createHelpBotHomeTarget("about"), "Start"),
              createBadgedAction("Erfahrung", createHelpBotHomeTarget("experience"), "Proof"),
              createBadgedAction("Where I Fit", createHelpBotHomeTarget("where-i-fit"), "Fit")
            ]
          }
        ]
      : [
          {
            id: "experience-overview",
            minScore: 5,
            score: () => (
              scoreMatches(["experience", "career", "background", "work", "professional", "roles", "jobs"], 2)
            ),
            text: "Sooraj's broader experience section is strongest in three parts: the current KEBA working-student role in industrial robotics, the parallel KEBA master's thesis with planning- and execution-facing robotics work, and the earlier industrial foundation as an NDT technician in India. Together those pages show current robotics direction, thesis depth, and earlier engineering responsibility.",
            actions: [
              createBadgedAction("Open experience section", createHelpBotHomeTarget("experience"), "Proof"),
              createBadgedAction("KEBA working student role", createHelpBotPageTarget("experience-working-student-keba.html"), "Current"),
              createBadgedAction("KEBA master's thesis", createHelpBotPageTarget("experience-masters-thesis-keba.html"), "Thesis"),
              createBadgedAction("NDT technician role", createHelpBotPageTarget("experience-ndt-technician.html"), "Base")
            ]
          },
          {
            id: "robotics-experience",
            minScore: 6,
            score: () => (
              scoreMatches(["robotics", "automation", "industrial robotics", "mechatronics"], 3)
              + scoreMatches(["experience", "keba", "working student", "workstudent", "thesis", "project", "projects"], 2)
            ),
            text: "Sooraj's strongest robotics experience is spread across three layers: the KEBA master's thesis in industrial robotics, the parallel KEBA working-student role in a live industrial environment, and robotics projects like the autonomous vacuum robot and the service robot. Together those pages show robotics software, motion planning, robot programming, simulation, and deployment-facing engineering logic.",
            actions: [
              createBadgedAction("Open experience section", createHelpBotHomeTarget("experience"), "Proof"),
              createBadgedAction("KEBA master's thesis", createHelpBotPageTarget("experience-masters-thesis-keba.html"), "Robotics"),
              createBadgedAction("KEBA working student role", createHelpBotPageTarget("experience-working-student-keba.html"), "Industry"),
              createBadgedAction("Autonomous vacuum robot", createHelpBotPageTarget("project-autonomous-vacuum-robot.html"), "ROS")
            ]
          },
          {
            id: "vr-immersive",
            minScore: 5,
            score: () => (
              scoreMatches(["vr", "xr", "ar", "mr", "unity", "immersive"], 3)
              + scoreMatches(["workshop", "machine", "training", "interaction"], 2)
            ),
            text: "Sooraj's clearest immersive engineering experience is the VR Machine Operation Workshop. That project uses Unity and C# to build a training-oriented simulation environment for machine operation, spatial interaction, and realistic user flow. So the strongest evidence is in VR/XR-style work rather than in a separate AR-only product case.",
            actions: [
              createBadgedAction("Open VR workshop", createHelpBotPageTarget("project-vr-machine-workshop.html"), "VR"),
              createBadgedAction("Open Where I Fit", createHelpBotHomeTarget("where-i-fit"), "Fit"),
              createBadgedAction("Open skills", createHelpBotHomeTarget("skills"), "Stack")
            ]
          },
          {
            id: "journey-india-germany",
            minScore: 6,
            score: () => (
              scoreIf(hasAll(["india", "germany"]), 6)
              + scoreMatches(["journey", "path", "story", "transition", "move"], 2)
              + scoreMatches(["bachelor", "master", "study", "robotics"], 1)
            ),
            text: "The India-to-Germany path is structured clearly. It starts with school foundation and a B.Tech in Mechanical Engineering in India, then adds the 2022 industrial foundation through non-destructive testing in Kochi, and from March 2023 moves into Germany for the M.Eng. in Mechatronics and Cyber-Physical Systems at TH Deggendorf. From there the profile grows into the KEBA working-student role and the parallel industrial robotics thesis in Stuttgart.",
            actions: [
              createBadgedAction("Open journey page", createHelpBotPageTarget("journey.html"), "Story"),
              createBadgedAction("Open education section", createHelpBotHomeTarget("education"), "Study"),
              createBadgedAction("Open experience section", createHelpBotHomeTarget("experience"), "Proof")
            ]
          },
          {
            id: "bachelor-path",
            minScore: 5,
            score: () => (
              scoreMatches(["bachelor", "btech", "mechanical engineering", "mechanical"], 3)
              + scoreMatches(["india", "year", "ktu", "apj", "university"], 2)
            ),
            text: "Sooraj's bachelor's phase ran from August 2017 to July 2021 as a B.Tech in Mechanical Engineering at APJ Abdul Kalam Technological University. That period built the base in mechanical design, manufacturing, CAD/CAE, and engineering fundamentals. It also included leadership work and the later award-winning service robot project before the next steps into industry and then Germany.",
            actions: [
              createBadgedAction("Open education section", createHelpBotHomeTarget("education"), "Study"),
              createBadgedAction("Open journey page", createHelpBotPageTarget("journey.html"), "Context"),
              createBadgedAction("Open service robot", createHelpBotPageTarget("project-service-robot.html"), "Award")
            ]
          },
          {
            id: "current-role-germany",
            minScore: 5,
            score: () => (
              scoreMatches(["current role", "working student", "workstudent", "werkstudent", "current", "role", "job"], 3)
              + scoreMatches(["germany", "stuttgart", "keba"], 2)
            ),
            text: "The current role in Germany is Working Student at KEBA Group in Stuttgart, Baden-Wuerttemberg. The work is centered on industrial robotics and automation in a live engineering environment, with focus on robot programming, implementation quality, and deployment context. In parallel, Sooraj is also doing the master's thesis in industrial robotics with a 6-axis workflow, motion planning, and execution-facing constraints.",
            actions: [
              createBadgedAction("Open KEBA working student role", createHelpBotPageTarget("experience-working-student-keba.html"), "Current"),
              createBadgedAction("Open KEBA master's thesis", createHelpBotPageTarget("experience-masters-thesis-keba.html"), "Parallel"),
              createBadgedAction("Open contact form", createHelpBotContactFormTarget(), "Action")
            ]
          },
          {
            id: "germany-location",
            minScore: 5,
            score: () => (
              scoreMatches(["where", "stay", "staying", "live", "living", "based", "location"], 2)
              + scoreMatches(["germany", "stuttgart", "deggendorf", "bavaria", "baden"], 2)
            ),
            text: "The current professional base is Stuttgart, Germany, because that is where the KEBA role and thesis-linked robotics work are anchored. The academic path is tied to TH Deggendorf, and the journey page also highlights lived experience across Bavaria, Thuringia, and Baden-Wuerttemberg.",
            actions: [
              createBadgedAction("Open travel footprint", createHelpBotPageTarget("journey.html", "travel"), "Travel"),
              createBadgedAction("Open KEBA role", createHelpBotPageTarget("experience-working-student-keba.html"), "Current"),
              createBadgedAction("Open education section", createHelpBotHomeTarget("education"), "Study")
            ]
          },
          {
            id: "travel-footprint",
            minScore: 5,
            score: () => (
              scoreMatches(["travel", "visited", "places", "countries", "explored", "footprint"], 3)
              + scoreMatches(["india", "indian", "germany"], 2)
            ),
            text: "The travel footprint is split into India, international countries, and Germany lived experience. In India the portfolio lists Kerala, Tamil Nadu, Rajasthan, and Goa. The countries explored list includes Germany, Bahrain, Qatar, Austria, Switzerland, Czech Republic, and Luxembourg. For Germany specifically, the journey page highlights lived experience across Bavaria, Thuringia, and Baden-Wuerttemberg.",
            actions: [
              createBadgedAction("Open travel footprint", createHelpBotPageTarget("journey.html", "travel"), "Travel"),
              createBadgedAction("Open journey page", createHelpBotPageTarget("journey.html"), "Story"),
              createBadgedAction("Open KEBA role", createHelpBotPageTarget("experience-working-student-keba.html"), "Germany")
            ]
          },
          {
            id: "projects-all",
            minScore: 5,
            score: () => (
              scoreMatches(["project", "projects", "portfolio work", "technical work"], 3)
              + scoreMatches(["all", "explain", "list", "show"], 1)
            ),
            text: "The projects section covers five main projects. 1. Autonomous Vacuum Robot in ROS for SLAM, localization, and navigation. 2. VR Machine Operation Workshop for Unity-based immersive training simulation. 3. Active Suspension System Modeling for MATLAB and Simulink-based controls thinking. 4. Topology Optimized Temporary Bag Sealer for SOLIDWORKS, FEA, and optimization. 5. Automated Mechatronic Service Robot for early Arduino-based robotics and the Best Bachelor Project award.",
            actions: [
              createBadgedAction("Open projects section", createHelpBotHomeTarget("projects"), "Overview"),
              createBadgedAction("Autonomous vacuum robot", createHelpBotPageTarget("project-autonomous-vacuum-robot.html"), "ROS"),
              createBadgedAction("VR workshop", createHelpBotPageTarget("project-vr-machine-workshop.html"), "VR"),
              createBadgedAction("Active suspension", createHelpBotPageTarget("project-active-suspension.html"), "MATLAB")
            ]
          },
          {
            id: "reviews",
            minScore: 4,
            score: () => (
              scoreMatches(["review", "reviews", "feedback", "trust", "credibility"], 3)
              + scoreMatches(["public", "reply", "archive", "rating"], 1)
            ),
            text: "The reviews section is the trust layer of the portfolio. It shows featured admin-pinned reviews, the archive of public reviews, overall rating, reach by country, and visible owner replies. If you want to understand how the profile is being received by others, that is the right section to read.",
            actions: [
              createBadgedAction("Open reviews", createHelpBotHomeTarget("reviews"), "Trust"),
              createBadgedAction("Open feedback page", createHelpBotPageTarget("feedback.html"), "Archive"),
              createBadgedAction("Open contact", createHelpBotContactFormTarget(), "Action")
            ]
          },
          {
            id: "robotics-fit",
            minScore: 5,
            score: () => (
              scoreMatches(["fit", "role", "best", "suited"], 2)
              + scoreMatches(["robotics", "automation", "autonomous", "industry"], 3)
            ),
            text: "For robotics, Sooraj fits best in industrial robotics, autonomous systems, and motion-planning-oriented engineering roles. The strongest evidence comes from the KEBA experience, the master's thesis, the ROS vacuum robot, and the broader experience section. That combination covers industrial context, robotics software, planning, and execution.",
            actions: [
              createBadgedAction("Open Where I Fit", createHelpBotHomeTarget("where-i-fit"), "Fit"),
              createBadgedAction("Open KEBA experience", createHelpBotPageTarget("experience-working-student-keba.html"), "Industry"),
              createBadgedAction("Open ROS project", createHelpBotPageTarget("project-autonomous-vacuum-robot.html"), "Proof")
            ]
          },
          {
            id: "immersive-fit",
            minScore: 5,
            score: () => (
              scoreMatches(["fit", "role", "best", "suited"], 2)
              + scoreMatches(["ar", "vr", "xr", "mr", "unity", "immersive"], 3)
            ),
            text: "For AR, VR, XR, or MR-style work, the strongest fit is in immersive training and simulation engineering. The clearest evidence is the VR Machine Operation Workshop in Unity with C# and spatial interaction design. So the profile is most credible here for VR/XR workflows, HMI-adjacent training simulation, and interactive engineering prototypes.",
            actions: [
              createBadgedAction("Open VR workshop", createHelpBotPageTarget("project-vr-machine-workshop.html"), "VR"),
              createBadgedAction("Open Where I Fit", createHelpBotHomeTarget("where-i-fit"), "Fit"),
              createBadgedAction("Open skills", createHelpBotHomeTarget("skills"), "Stack")
            ]
          },
          {
            id: "simulation-fit",
            minScore: 5,
            score: () => (
              scoreMatches(["fit", "role", "best", "suited"], 2)
              + scoreMatches(["matlab", "simulink", "simulation", "controls", "control"], 3)
            ),
            text: "For MATLAB, Simulink, and simulation roles, the strongest evidence is the Active Suspension project, the simulation-led engineering profile, and the wider pattern that Sooraj connects modeling with execution logic rather than stopping at theory. That makes the profile a good match for control-oriented simulation, system modeling, and validation-heavy engineering work.",
            actions: [
              createBadgedAction("Open Active Suspension", createHelpBotPageTarget("project-active-suspension.html"), "MATLAB"),
              createBadgedAction("Open Where I Fit", createHelpBotHomeTarget("where-i-fit"), "Fit"),
              createBadgedAction("Open skills", createHelpBotHomeTarget("skills"), "Stack")
            ]
          },
          {
            id: "design-fit",
            minScore: 5,
            score: () => (
              scoreMatches(["solidworks", "cad", "design", "fea", "optimization"], 3)
              + scoreMatches(["fit", "role", "project"], 1)
            ),
            text: "For SolidWorks and design-oriented roles, the strongest proof is the Topology Bag Sealer with FEA-driven optimization and manufacturability thinking, supported by the mechanical engineering base from the bachelor's path. The skills section also shows SolidWorks, AutoCAD, ANSYS, and Blender, so the profile is not software-only; it still has a clear mechanical-design side.",
            actions: [
              createBadgedAction("Open Topology Bag Sealer", createHelpBotPageTarget("project-topology-bag-sealer.html"), "SOLIDWORKS"),
              createBadgedAction("Open skills", createHelpBotHomeTarget("skills"), "Tools"),
              createBadgedAction("Open education section", createHelpBotHomeTarget("education"), "Base")
            ]
          },
          {
            id: "skills-overview",
            minScore: 5,
            score: () => (
              scoreMatches(["skills", "skill", "tools", "stack", "software"], 3)
              + scoreMatches(["robotics", "matlab", "solidworks", "unity", "python", "c"], 1)
            ),
            text: "The skills section reads best in four groups. 1. Robotics: ROS, ROS 2, robot programming, trajectory planning, navigation, and SLAM. 2. Programming and simulation: Python, C++, C#, MATLAB, Simulink, Unity, VR, and XR. 3. Sensing and tools: LiDAR, radar, OpenCV, GitHub, Ubuntu, SOLIDWORKS, AutoCAD, ANSYS, and Blender. 4. Engineering discipline: design validation, technical reporting, industrial context, and deployment-focused problem solving.",
            actions: [
              createBadgedAction("Open skills", createHelpBotHomeTarget("skills"), "Stack"),
              createBadgedAction("Open projects section", createHelpBotHomeTarget("projects"), "Proof"),
              createBadgedAction("Open KEBA experience", createHelpBotPageTarget("experience-working-student-keba.html"), "Industry")
            ]
          },
          {
            id: "contact",
            minScore: 4,
            score: () => (
              scoreMatches(["contact", "cv", "resume", "email", "hire", "reach"], 3)
              + scoreMatches(["message", "connect", "request", "talk"], 1)
            ),
            text: "You can reach Sooraj through the website contact paths directly. The fastest routes are the contact form and the CV request flow. If you want, I can help connect you by taking you straight into the contact path or the CV request path through the website.",
            actions: [
              createBadgedAction("Request contact", createHelpBotContactFormTarget(), "Action"),
              createBadgedAction("Request CV", createHelpBotCvTarget(), "CV"),
              createBadgedAction("Open contact section", createHelpBotHomeTarget("contact"), "Direct")
            ]
          },
          {
            id: "about-profile",
            minScore: 4,
            score: () => (
              scoreMatches(["about", "profile", "overview", "introduction", "sooraj"], 2)
              + scoreMatches(["who", "background", "summary", "direction"], 1)
            ),
            text: "If you want the clearest overall picture of Sooraj, start with About, Experience, and Where I Fit. Those sections show the technical direction across robotics, mechatronics, simulation, immersive work, and industrial context in Germany.",
            actions: [
              createBadgedAction("Open about section", createHelpBotHomeTarget("about"), "Start"),
              createBadgedAction("Open experience section", createHelpBotHomeTarget("experience"), "Proof"),
              createBadgedAction("Open Where I Fit", createHelpBotHomeTarget("where-i-fit"), "Fit")
            ]
          }
        ];

    const ranked = definitions
      .map((definition) => {
        const score = typeof definition.score === "function" ? definition.score() : 0;
        if (score < definition.minScore) return null;
        return { ...definition, score };
      })
      .filter(Boolean)
      .sort((left, right) => right.score - left.score);

    return ranked[0] || null;
  };

  const SEARCH_STOP_WORDS = new Set([
    "a", "an", "and", "are", "about", "at", "can", "describe", "do", "does", "explain", "for",
    "from", "get", "give", "has", "have", "i", "in", "is", "it", "know", "like", "me", "my",
    "of", "on", "or", "please", "regarding", "search", "section", "show", "tell", "that", "the",
    "this", "to", "want", "what", "where", "with", "you", "your"
  ]);
  const SEARCH_LOW_SIGNAL_TOKENS = new Set(["page", "pages", "portfolio", "site", "website", "sooraj"]);

  const normalizeSearchTokens = (value = "") => String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter((token) => token && !SEARCH_STOP_WORDS.has(token));

  const getRelevantSearchTokens = (value = "") => {
    const tokens = normalizeSearchTokens(value).filter((token) => token.length >= 2);
    const filtered = tokens.filter((token) => !SEARCH_LOW_SIGNAL_TOKENS.has(token));
    return filtered.length ? filtered : tokens;
  };

  const isSearchTokenRelated = (leftToken = "", rightToken = "") => {
    const left = String(leftToken || "").toLowerCase().trim();
    const right = String(rightToken || "").toLowerCase().trim();
    if (!left || !right) return false;
    if (left === right) return true;
    if (left.length >= 4 && right.length >= 4 && (left.startsWith(right) || right.startsWith(left))) return true;
    if (left.length < 5 || right.length < 5) return false;
    if (left.includes(right) || right.includes(left)) return true;
    if (Math.abs(left.length - right.length) > 1) return false;

    let leftIndex = 0;
    let rightIndex = 0;
    let mismatches = 0;
    while (leftIndex < left.length && rightIndex < right.length) {
      if (left[leftIndex] === right[rightIndex]) {
        leftIndex += 1;
        rightIndex += 1;
        continue;
      }
      mismatches += 1;
      if (mismatches > 1) return false;
      if (left.length > right.length) {
        leftIndex += 1;
      } else if (right.length > left.length) {
        rightIndex += 1;
      } else {
        leftIndex += 1;
        rightIndex += 1;
      }
    }
    return mismatches + (left.length - leftIndex) + (right.length - rightIndex) <= 1;
  };

  const getSearchPhraseParts = (value = "") => ({
    normalized: String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim(),
    tokens: normalizeSearchTokens(value)
  });

  const hasSearchWordMatch = (token, words = []) => {
    if (!token || !Array.isArray(words) || !words.length) return false;
    if (words.includes(token)) return true;
    if (token.length >= 4) return words.some((word) => word.startsWith(token));
    return false;
  };

  const findWebsiteSearchMatches = (query, { deep = false } = {}) => {
    const normalizedQuery = String(query || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
    const tokens = normalizeSearchTokens(normalizedQuery)
      .filter((token) => token.length >= 2);
    if (!tokens.length) return [];
    const ranked = getWebsiteSearchIndex()
      .map((entry) => {
        const phrases = [entry.label, ...(entry.keywords || [])]
          .map((value) => getSearchPhraseParts(value))
          .filter((value) => value.normalized);
        const phraseTexts = phrases.map((value) => value.normalized);
        const wordSet = [...new Set(phrases.flatMap((value) => value.tokens))];
        let score = 0;
        const exactPhraseMatch = phraseTexts.includes(normalizedQuery);
        const strongPhraseMatch = normalizedQuery.length >= 4 && phraseTexts.some((value) => value.includes(normalizedQuery));
        const matchedTokenCount = tokens.reduce((count, token) => count + (hasSearchWordMatch(token, wordSet) ? 1 : 0), 0);
        const allTokensMatched = matchedTokenCount === tokens.length;

        if (exactPhraseMatch) score += 16;
        if (strongPhraseMatch) score += 8;
        if (allTokensMatched && tokens.length > 1) score += 7;
        score += matchedTokenCount * 3;
        if (deep) {
          if (tokens.length > 1 && matchedTokenCount >= Math.max(2, Math.ceil(tokens.length * 0.7))) score += 4;
          if (normalizedQuery.length >= 4 && phraseTexts.some((value) => value.includes(normalizedQuery) || normalizedQuery.includes(value))) score += 3;
        }
        const singleToken = tokens.length === 1;
        const isQualifiedMatch = exactPhraseMatch
          || strongPhraseMatch
          || allTokensMatched
          || (!singleToken && matchedTokenCount >= Math.max(2, Math.ceil(tokens.length * 0.6)))
          || (deep && matchedTokenCount >= Math.max(1, Math.ceil(tokens.length * 0.5) + (singleToken ? 0 : 1)));

        if (!isQualifiedMatch) return null;
        return { entry, score };
      })
      .filter((entry) => entry && entry.score > 0)
      .sort((left, right) => right.score - left.score);
    return ranked
      .slice(0, 4)
      .map((entry) => entry.entry);
  };

  const getWebsiteSearchResultOptions = () => {
    const isQuestionResult = helpBotState.websiteSearchResult?.kind === "question";
    return withEndChatOption([
      createBadgedOption(
        "website-search-result",
        "open",
        isQuestionResult ? config.searchWebsiteAnswerYes : config.searchWebsiteOpenYes,
        currentLang === "de" ? "Treffer" : "Match"
      ),
      createBadgedOption(
        "website-search-result",
        "retry",
        isQuestionResult ? config.searchWebsiteAnswerNo : config.searchWebsiteOpenNo,
        currentLang === "de" ? "Erneut" : "Retry"
      )
    ]);
  };

  const getWebsiteSearchMatchOptions = () => withEndChatOption(dedupeHelpBotOptions([
    ...(Array.isArray(helpBotState.websiteSearchResults) ? helpBotState.websiteSearchResults : [])
      .map((entry, index) => entry?.label && (entry?.target || entry?.answerId)
        ? createBadgedOption(
            "website-search-match",
            String(index),
            `${index + 1}. ${entry.label}`,
            currentLang === "de" ? `Treffer ${index + 1}` : `Match ${index + 1}`
          )
        : null)
      .filter(Boolean),
    createBadgedOption("website-search-result", "retry", config.searchWebsiteAskAgain, currentLang === "de" ? "Erneut" : "Retry")
  ]));

  const getWebsiteSearchFallbackOptions = () => withEndChatOption([
    createBadgedOption("website-search-fallback", "contact", config.searchWebsiteContact, currentLang === "de" ? "Aktion" : "Action"),
    createBadgedOption("website-search-fallback", "retry", config.searchWebsiteAskAgain, currentLang === "de" ? "Erneut" : "Retry"),
    createBadgedOption("website-search-fallback", "menu", config.searchWebsiteMainMenu, currentLang === "de" ? "Menue" : "Menu")
  ]);

  const getReviewPathResponse = (pathId) => {
    const responses = currentLang === "de"
      ? {
          featured: {
            label: "Hervorgehobene Reviews",
            text: "Die hervorgehobenen Reviews sind die schnellste Vertrauensebene auf der Startseite. Dort sehen Sie die vom Admin ausgewaehlten staerksten Rueckmeldungen zuerst.",
            actions: [
              createBadgedAction("Zu Featured Reviews", createHelpBotHomeTarget("reviews"), "Startseite"),
              createBadgedAction("Zu Kontakt", createHelpBotHomeTarget("contact"), "Action")
            ]
          },
          all: {
            label: "Alle oeffentlichen Reviews",
            text: "Wenn Sie ein breiteres Bild wollen, oeffnen Sie das komplette Review-Archiv. Dort sehen Sie die gesamte oeffentliche Rueckmeldungsbasis statt nur der hervorgehobenen Auswahl.",
            actions: [
              createBadgedAction("Zu allen Reviews", createHelpBotHomeTarget("homepage-public-reviews"), "Archiv"),
              createBadgedAction("Feedback-Seite", createHelpBotPageTarget("feedback.html"), "Detail")
            ]
          },
          replies: {
            label: "Reviews mit Owner-Reply",
            text: "Reviews mit sichtbaren Owner-Replys sind sinnvoll, wenn Sie Ton, Professionalitaet und Reaktionsstil schneller einschaetzen wollen.",
            actions: [
              createBadgedAction("Feedback-Seite oeffnen", createHelpBotPageTarget("feedback.html"), "Replies"),
              createBadgedAction("Zu Featured Reviews", createHelpBotHomeTarget("reviews"), "Startseite")
            ]
          },
          contact: {
            label: "Kontakt statt Reviews",
            text: "Wenn Sie bereits genug Vertrauen haben, ist der direkte Kontaktweg meist sinnvoller als weitere Reviews.",
            actions: [
              createBadgedAction("Zu Kontakt", createHelpBotHomeTarget("contact"), "Action"),
              createBadgedAction("CV anfragen", createHelpBotPageTarget("request-cv.html"), "CV")
            ]
          }
        }
      : {
          featured: {
            label: "Featured reviews",
            text: "Featured reviews are the fastest trust layer on the homepage. They surface the strongest admin-picked feedback first.",
            actions: [
              createBadgedAction("Open featured reviews", createHelpBotHomeTarget("reviews"), "Homepage"),
              createBadgedAction("Go to contact", createHelpBotHomeTarget("contact"), "Action")
            ]
          },
          all: {
            label: "All public reviews",
            text: "If you want a broader read, open the full public review archive. That gives you the wider signal instead of only the featured selection.",
            actions: [
              createBadgedAction("Open all reviews", createHelpBotHomeTarget("homepage-public-reviews"), "Archive"),
              createBadgedAction("Open feedback page", createHelpBotPageTarget("feedback.html"), "Detail")
            ]
          },
          replies: {
            label: "Reviews with owner replies",
            text: "Reviews with visible owner replies are useful when you want to assess tone, professionalism, and response quality more quickly.",
            actions: [
              createBadgedAction("Open feedback page", createHelpBotPageTarget("feedback.html"), "Replies"),
              createBadgedAction("Open featured reviews", createHelpBotHomeTarget("reviews"), "Homepage")
            ]
          },
          contact: {
            label: "Contact instead",
            text: "If the trust signal already feels strong, direct contact is often more useful than reading more reviews.",
            actions: [
              createBadgedAction("Open contact form", createHelpBotContactFormTarget(), "Action"),
              createBadgedAction("Request CV", createHelpBotCvTarget(), "CV")
            ]
          }
        };

    return responses[pathId] || responses.featured;
  };

  const getPageAwareOpening = () => {
    if (/^project-/.test(currentPageName)) {
      return currentLang === "de"
        ? {
            text: "Sie befinden sich bereits auf einer Projektseite. Ich kann diesen Projektbeleg einordnen, aehnliche Robotikarbeit zeigen oder Sie direkt zum naechsten starken Nachweis fuehren."
          }
        : {
            text: "You are already on a project page. I can frame this project, show similar robotics work, or route you to the next strongest proof."
          };
    }
    if (/^experience-/.test(currentPageName)) {
      return currentLang === "de"
        ? {
            text: "Sie befinden sich bereits auf einer Erfahrungsseite. Ich kann diesen Karrierebeleg mit Projekten, Reviews oder dem direkten Kontakt verbinden."
          }
        : {
            text: "You are already on an experience page. I can connect this career proof to projects, reviews, or a direct contact path."
          };
    }
    if (currentPageName === "feedback.html") {
      return currentLang === "de"
        ? {
            text: "Sie sind bereits im Review- und Feedback-Bereich. Ich kann Vertrauenssignale, Featured Reviews oder den direkten Kontakt sortieren.",
            inlineOptions: withEndChatOption([getReviewPathStartOption(), getTourStartOption()])
          }
        : {
            text: "You are already in the review and feedback area. I can sort trust signals, featured reviews, or direct contact from here.",
            inlineOptions: withEndChatOption([getReviewPathStartOption(), getTourStartOption()])
          };
    }
    if (currentPageName === "journey.html") {
      return currentLang === "de"
        ? {
            text: "Sie sind auf der Journey-Seite. Ich kann jetzt den Weg mit Projekten, Thesis, Erfahrung oder Kontakt verbinden."
          }
        : {
            text: "You are on the journey page. I can now connect that story to projects, the thesis, experience, or contact."
          };
    }
    return currentLang === "de"
      ? {
          text: "Wenn Sie moechten, kann ich Sie auch in einer kompakten Vier-Schritte-Tour durch das Portfolio fuehren.",
          inlineOptions: withEndChatOption([getTourStartOption()])
        }
      : {
          text: "If you prefer, I can also guide you through the portfolio in a compact four-step tour.",
          inlineOptions: withEndChatOption([getTourStartOption()])
        };
  };

  const getQuickPathOption = (roleId = currentRoleId) => {
    if (roleId !== "recruiter" && roleId !== "hiringManager") return null;
    if (currentLang === "de") {
      return {
        kind: "quick-path",
        id: "quick",
        label: roleId === "recruiter" ? "60-Sekunden-Hiring-Check" : "60-Sekunden-Proof-Check"
      };
    }
    return {
      kind: "quick-path",
      id: "quick",
      label: roleId === "recruiter" ? "60-second hiring view" : "60-second proof scan"
    };
  };

  const getQuickPathCopy = (roleId = currentRoleId) => {
    if (currentLang === "de") {
      if (roleId === "hiringManager") {
        return {
          response: "Hier ist der schnellste Management-Scan.\n1. Die KEBA-Linie zeigt industrielle Relevanz.\n2. Ausgewaehlte Projekte zeigen Umsetzung und technische Tiefe.\n3. Reviews staerken den externen Eindruck.\n4. Wenn es passt, liegen CV und Kontakt direkt bereit.",
          detail: "Dieser Schnellpfad ist fuer eine erste Management-Entscheidung gedacht. Er verbindet industrielle Nachweise, technische Umsetzungsbeispiele, Reviews und direkten Kontakt in einer kompakten Reihenfolge.\nDamit laesst sich das Portfolio schneller einschaetzen, ohne jede Seite einzeln suchen zu muessen.",
          actions: [
            { label: "KEBA Master-Thesis", target: createHelpBotPageTarget("experience-masters-thesis-keba.html") },
            { label: "Projektbereich", target: createHelpBotHomeTarget("projects") },
            { label: "Reviews", target: createHelpBotHomeTarget("reviews") },
            { label: "CV anfragen", target: createHelpBotPageTarget("request-cv.html") }
          ]
        };
      }
      return {
        response: "Hier ist der schnellste Recruiter-Scan.\n1. Rollen-Fit zeigt die staerksten Match-Bereiche.\n2. Die KEBA-Linie zeigt industrielle Robotik-Erfahrung in Deutschland.\n3. Reviews liefern zusaetzliche Glaubwuerdigkeit.\n4. Wenn der Eindruck passt, fuehren CV und Kontakt direkt weiter.",
        detail: "Dieser Schnellpfad ist fuer eine erste Hiring-Entscheidung gedacht. Er reduziert die wichtigsten Einstiege auf Rollen-Fit, industrielle Nachweise, Vertrauensebene und direkten Kontakt.\nSo koennen Recruiter das Profil in kurzer Zeit strukturiert bewerten und danach gezielt vertiefen.",
        actions: [
          { label: "Where I Fit", target: createHelpBotHomeTarget("where-i-fit") },
          { label: "KEBA Master-Thesis", target: createHelpBotPageTarget("experience-masters-thesis-keba.html") },
          { label: "Reviews", target: createHelpBotHomeTarget("reviews") },
          { label: "CV anfragen", target: createHelpBotPageTarget("request-cv.html") }
        ]
      };
    }

    if (roleId === "hiringManager") {
      return {
        response: "Here is the fastest management scan.\n1. The KEBA path shows industrial relevance.\n2. Selected projects show technical delivery and implementation depth.\n3. Reviews add outside-in credibility.\n4. If the signal looks right, CV and contact are ready immediately.",
        detail: "This quick path is designed for an early management decision. It combines industrial proof, delivery-oriented project evidence, reviews, and direct contact into one short evaluation flow.\nThat reduces the time needed to judge whether the portfolio is worth deeper review.",
        actions: [
          { label: "KEBA master's thesis", target: createHelpBotPageTarget("experience-masters-thesis-keba.html") },
          { label: "Open projects section", target: createHelpBotHomeTarget("projects") },
          { label: "Open reviews", target: createHelpBotHomeTarget("reviews") },
          { label: "Request CV", target: createHelpBotPageTarget("request-cv.html") }
        ]
      };
    }

    return {
      response: "Here is the fastest recruiter scan.\n1. Role fit surfaces the strongest match areas.\n2. The KEBA path shows industrial robotics proof in Germany.\n3. Reviews add external credibility.\n4. If the profile looks relevant, CV and contact are one step away.",
      detail: "This quick path is designed for an early hiring decision. It compresses role fit, industrial proof, trust signals, and direct contact into one recruiter-friendly flow.\nThat makes the portfolio faster to evaluate before you move into detail pages.",
      actions: [
        { label: "Check Where I Fit", target: createHelpBotHomeTarget("where-i-fit") },
        { label: "KEBA master's thesis", target: createHelpBotPageTarget("experience-masters-thesis-keba.html") },
        { label: "Open reviews", target: createHelpBotHomeTarget("reviews") },
        { label: "Request CV", target: createHelpBotPageTarget("request-cv.html") }
      ]
    };
  };

  const getTopicDeeperCopy = (roleId, topicId) => {
    if (topicId === "quick") {
      const base = getQuickPathCopy(roleId);
      return currentLang === "de"
        ? {
            explainMore: "Mehr erklaeren",
            otherTopics: "Andere Themen",
            prompt: "Soll ich diesen Schnellpfad kurz vertiefen oder gleich spezifischer weiterleiten?",
            detail: base.detail
          }
        : {
            explainMore: "Explain more",
            otherTopics: "Other topics",
            prompt: "Would you like a deeper version of this quick path or should I route you more specifically?",
            detail: base.detail
          };
    }
    return getPortfolioHelpBotDeeperCopy(currentLang, roleId, topicId);
  };

  const getRoleFitStartOption = () => (
    currentLang === "de"
      ? { kind: "role-fit-start", id: "role-fit-start", label: "Rolle abgleichen" }
      : { kind: "role-fit-start", id: "role-fit-start", label: "Match a specific role" }
  );

  const getRoleFitChoiceOptions = () => withEndChatOption(dedupeHelpBotOptions([
    {
      kind: "role-fit",
      id: "robotics",
      label: currentLang === "de" ? "Robotikingenieur" : "Robotics engineer"
    },
    {
      kind: "role-fit",
      id: "automation",
      label: currentLang === "de" ? "Automatisierungsingenieur" : "Automation engineer"
    },
    {
      kind: "role-fit",
      id: "simulation",
      label: currentLang === "de" ? "Simulationsingenieur" : "Simulation engineer"
    },
    {
      kind: "role-fit",
      id: "controls",
      label: currentLang === "de" ? "Controls / Software" : "Controls / software"
    },
    {
      kind: "role-fit",
      id: "mechatronics",
      label: currentLang === "de" ? "Mechatronikingenieur" : "Mechatronics engineer"
    },
    {
      kind: "topic-other",
      id: "topic-other",
      label: getTopicDeeperCopy(currentRoleId, helpBotState.pendingTopicId).otherTopics
    }
  ]));

  const getRoleFitQuestionText = () => {
    if (currentLang === "de") {
      return currentRoleId === "hiringManager"
        ? "Welche Zielrolle soll ich gegen dieses Portfolio abgleichen?"
        : "Welche Rolle soll ich gegen dieses Portfolio abgleichen?";
    }
    return currentRoleId === "hiringManager"
      ? "Which target role should I evaluate this portfolio against?"
      : "Which role should I match against this portfolio?";
  };

  const getRoleFitResponse = (fitId) => {
    const copy = {
      en: {
        robotics: {
          label: "Robotics engineer",
          text: "For a robotics engineer path, the strongest proof is the KEBA thesis, the autonomous vacuum robot, and the service robot.\nTogether they show robotics software, systems thinking, and applied implementation in a practical setting.",
          actions: [
            { label: "KEBA master's thesis", target: createHelpBotPageTarget("experience-masters-thesis-keba.html") },
            { label: "Autonomous vacuum robot", target: createHelpBotPageTarget("project-autonomous-vacuum-robot.html") },
            { label: "Service robot", target: createHelpBotPageTarget("project-service-robot.html") },
            { label: "Request CV", target: createHelpBotPageTarget("request-cv.html") }
          ]
        },
        automation: {
          label: "Automation engineer",
          text: "For an automation engineer path, the strongest signal is the KEBA industrial line plus systems-oriented project work.\nThat combination shows structured engineering, industrial context, and practical mechatronic execution.",
          actions: [
            { label: "KEBA working student role", target: createHelpBotPageTarget("experience-working-student-keba.html") },
            { label: "KEBA master's thesis", target: createHelpBotPageTarget("experience-masters-thesis-keba.html") },
            { label: "Where I Fit", target: createHelpBotHomeTarget("where-i-fit") },
            { label: "Open contact", target: createHelpBotHomeTarget("contact") }
          ]
        },
        simulation: {
          label: "Simulation engineer",
          text: "For a simulation-oriented role, the portfolio is strongest where modelling, controls thinking, and system behaviour are visible.\nThe active suspension work, the project set, and the portfolio map are the fastest proof points.",
          actions: [
            { label: "Active suspension", target: createHelpBotPageTarget("project-active-suspension.html") },
            { label: "Portfolio map", target: createHelpBotPageTarget("portfolio-map.html") },
            { label: "Projects section", target: createHelpBotHomeTarget("projects") },
            { label: "Request CV", target: createHelpBotPageTarget("request-cv.html") }
          ]
        },
        controls: {
          label: "Controls / software",
          text: "For controls or software-facing engineering, the strongest proof is in robotics implementation, control logic, and systems integration.\nThe service robot, active suspension, and selected robotics projects are the right next pages.",
          actions: [
            { label: "Service robot", target: createHelpBotPageTarget("project-service-robot.html") },
            { label: "Active suspension", target: createHelpBotPageTarget("project-active-suspension.html") },
            { label: "Open skills section", target: createHelpBotHomeTarget("skills") },
            { label: "Open contact", target: createHelpBotHomeTarget("contact") }
          ]
        },
        mechatronics: {
          label: "Mechatronics engineer",
          text: "For a mechatronics engineer path, the portfolio is strongest where hardware-thinking, system integration, and applied engineering come together.\nThe topology bag sealer, active suspension, and KEBA experience create the clearest combined signal.",
          actions: [
            { label: "Topology bag sealer", target: createHelpBotPageTarget("project-topology-bag-sealer.html") },
            { label: "Active suspension", target: createHelpBotPageTarget("project-active-suspension.html") },
            { label: "KEBA experience", target: createHelpBotHomeTarget("experience") },
            { label: "Request CV", target: createHelpBotPageTarget("request-cv.html") }
          ]
        }
      },
      de: {
        robotics: {
          label: "Robotikingenieur",
          text: "Fuer eine Robotikingenieur-Rolle sind die staerksten Belege die KEBA-Thesis, der autonome Vakuumroboter und der Service-Roboter.\nGemeinsam zeigen sie Robotiksoftware, Systemdenken und praktische Umsetzung in einem anwendungsnahen Kontext.",
          actions: [
            { label: "KEBA Master-Thesis", target: createHelpBotPageTarget("experience-masters-thesis-keba.html") },
            { label: "Autonomer Vakuumroboter", target: createHelpBotPageTarget("project-autonomous-vacuum-robot.html") },
            { label: "Service-Roboter", target: createHelpBotPageTarget("project-service-robot.html") },
            { label: "CV anfragen", target: createHelpBotPageTarget("request-cv.html") }
          ]
        },
        automation: {
          label: "Automatisierungsingenieur",
          text: "Fuer eine Automatisierungsrolle ist das staerkste Signal die industrielle KEBA-Linie zusammen mit systemorientierter Projektarbeit.\nDiese Kombination zeigt strukturiertes Engineering, industriellen Kontext und praktische mechatronische Umsetzung.",
          actions: [
            { label: "KEBA Werkstudent", target: createHelpBotPageTarget("experience-working-student-keba.html") },
            { label: "KEBA Master-Thesis", target: createHelpBotPageTarget("experience-masters-thesis-keba.html") },
            { label: "Where I Fit", target: createHelpBotHomeTarget("where-i-fit") },
            { label: "Kontakt", target: createHelpBotHomeTarget("contact") }
          ]
        },
        simulation: {
          label: "Simulationsingenieur",
          text: "Fuer eine simulationsnahe Rolle ist das Portfolio dort am staerksten, wo Modellierung, Regelungsdenken und Systemverhalten sichtbar werden.\nDie aktive Fahrwerksregelung, die Projekte und die Portfolio-Map sind dafuer die schnellsten Belege.",
          actions: [
            { label: "Aktive Fahrwerksregelung", target: createHelpBotPageTarget("project-active-suspension.html") },
            { label: "Portfolio-Map", target: createHelpBotPageTarget("portfolio-map.html") },
            { label: "Projektbereich", target: createHelpBotHomeTarget("projects") },
            { label: "CV anfragen", target: createHelpBotPageTarget("request-cv.html") }
          ]
        },
        controls: {
          label: "Controls / Software",
          text: "Fuer Controls- oder softwareorientiertes Engineering liegen die staerksten Belege in Robotik-Umsetzung, Regelungslogik und Systemintegration.\nDer Service-Roboter, die aktive Fahrwerksregelung und die Robotikprojekte sind die richtigen naechsten Seiten.",
          actions: [
            { label: "Service-Roboter", target: createHelpBotPageTarget("project-service-robot.html") },
            { label: "Aktive Fahrwerksregelung", target: createHelpBotPageTarget("project-active-suspension.html") },
            { label: "Skills", target: createHelpBotHomeTarget("skills") },
            { label: "Kontakt", target: createHelpBotHomeTarget("contact") }
          ]
        },
        mechatronics: {
          label: "Mechatronikingenieur",
          text: "Fuer eine Mechatronikrolle ist das Portfolio dort am staerksten, wo Hardware-Denken, Systemintegration und angewandtes Engineering zusammenkommen.\nDer Topology-Bag-Sealer, die aktive Fahrwerksregelung und die KEBA-Erfahrung liefern zusammen das klarste Signal.",
          actions: [
            { label: "Topology-Bag-Sealer", target: createHelpBotPageTarget("project-topology-bag-sealer.html") },
            { label: "Aktive Fahrwerksregelung", target: createHelpBotPageTarget("project-active-suspension.html") },
            { label: "KEBA Erfahrung", target: createHelpBotHomeTarget("experience") },
            { label: "CV anfragen", target: createHelpBotPageTarget("request-cv.html") }
          ]
        }
      }
    };

    const languageMap = copy[currentLang === "de" ? "de" : "en"];
    return languageMap[fitId] || languageMap.robotics;
  };

  const getSuggestedTopicIds = (roleId, topicId) => {
    const map = {
      recruiter: {
        quick: ["fit", "experience", "reviews"],
        fit: ["projects", "experience", "reviews"],
        projects: ["experience", "fit", "reviews"],
        experience: ["projects", "reviews", "contact"],
        reviews: ["fit", "projects", "contact"],
        contact: ["fit", "projects", "reviews"]
      },
      hiringManager: {
        quick: ["industrial", "proof", "reviews"],
        industrial: ["delivery", "proof", "contact"],
        delivery: ["proof", "industrial", "contact"],
        proof: ["industrial", "reviews", "contact"],
        reviews: ["proof", "contact", "industrial"],
        contact: ["industrial", "proof", "reviews"]
      },
      student: {
        journey: ["thesis", "projects", "certificates"],
        thesis: ["journey", "projects", "reviews"],
        projects: ["thesis", "journey", "certificates"],
        certificates: ["journey", "projects", "contact"],
        reviews: ["projects", "journey", "contact"],
        contact: ["journey", "projects", "reviews"]
      },
      collaborator: {
        stack: ["projects", "github", "contact"],
        projects: ["stack", "github", "reviews"],
        github: ["projects", "stack", "contact"],
        journey: ["projects", "reviews", "contact"],
        reviews: ["projects", "contact", "journey"],
        contact: ["projects", "github", "reviews"]
      },
      visitor: {
        overview: ["projects", "journey", "reviews"],
        projects: ["overview", "journey", "contact"],
        journey: ["projects", "reviews", "contact"],
        reviews: ["projects", "contact", "overview"],
        contact: ["projects", "reviews", "overview"]
      }
    };

    return map?.[roleId]?.[topicId] || [];
  };

  const getSuggestedTopicOptions = (roleId, topicId) => dedupeHelpBotOptions(
    getSuggestedTopicIds(roleId, topicId)
      .map((suggestedId) => createTopicOption(roleId, suggestedId))
      .map((option, index) => option ? { ...option, badge: index === 0 ? (currentLang === "de" ? "Empfohlen" : "Recommended") : (currentLang === "de" ? "Weiter" : "Next") } : null)
      .filter(Boolean)
  );

  const getTopicOptions = (role) => {
    const topicOptions = Array.isArray(role?.topics)
      ? role.topics.map((topic) => ({
          kind: "topic",
          id: topic.id,
          label: topic.label
        }))
      : [];
    const quickPath = getQuickPathOption(currentRoleId);
    return withEndChatOption(dedupeHelpBotOptions([
      getTourStartOption(),
      ...(quickPath ? [quickPath] : []),
      ...topicOptions
    ]));
  };

  const getResumeChoiceOptions = () => ([
    { kind: "continue-chat", id: "continue", label: config.continueChat },
    { kind: "start-over", id: "start-over", label: config.startFresh },
    { kind: "end-chat", id: "end-chat", label: config.endChat }
  ]);

  const getTopicPromptOptions = () => {
    const topicId = helpBotState.pendingTopicId;
    const copy = getTopicDeeperCopy(currentRoleId, topicId);
    const includeRoleFit = (currentRoleId === "recruiter" || currentRoleId === "hiringManager")
      && (topicId === "fit" || topicId === "quick");
    const includeReviewPaths = topicId === "reviews";
    return withEndChatOption(dedupeHelpBotOptions([
      createBadgedOption("topic-more", "topic-more", copy.explainMore, currentLang === "de" ? "Mehr" : "More"),
      ...(includeRoleFit ? [{ ...getRoleFitStartOption(), badge: currentLang === "de" ? "Smart" : "Smart" }] : []),
      ...(includeReviewPaths ? [getReviewPathStartOption()] : []),
      ...getSuggestedTopicOptions(currentRoleId, topicId).slice(0, 2),
      createBadgedOption("topic-other", "topic-other", copy.otherTopics, currentLang === "de" ? "Wechseln" : "Switch")
    ]));
  };

  const getTopicContinueOptions = (roleId, topicId) => {
    const includeRoleFit = (roleId === "recruiter" || roleId === "hiringManager") && topicId === "fit";
    const includeReviewPaths = topicId === "reviews";
    return withEndChatOption(dedupeHelpBotOptions([
      ...(includeRoleFit ? [{ ...getRoleFitStartOption(), badge: "Smart" }] : []),
      ...(includeReviewPaths ? [getReviewPathStartOption()] : []),
      ...getSuggestedTopicOptions(roleId, topicId).slice(0, 2),
      createBadgedOption("topic-other", "topic-other", getTopicDeeperCopy(roleId, topicId).otherTopics, currentLang === "de" ? "Wechseln" : "Switch"),
      getTourStartOption()
    ]));
  };

  const getTopicStayPromptText = (roleId, topicId) => {
    const recommendedNextLabel = getRecommendedNextTopicLabel(roleId, topicId);
    if (currentLang === "de") {
      return recommendedNextLabel
        ? `Moechten Sie mehr Details zu diesem Bereich, direkt die Detailseite oeffnen oder soll ich Sie als Naechstes zu ${recommendedNextLabel} weiterfuehren?`
        : "Moechten Sie mehr Details zu diesem Bereich oder direkt die passende Detailseite oeffnen?";
    }
    return recommendedNextLabel
      ? `Would you like more detail on this section, open the direct detail page, or should I take you next to ${recommendedNextLabel}?`
      : "Would you like more detail on this section or open the direct detail page?";
  };

  const getTopicStayPromptOptions = (roleId, topicId) => {
    const deepCopy = getTopicDeeperCopy(roleId, topicId);
    const primaryAction = getTopicPrimaryAction(getPendingTopic());
    const includeRoleFit = (roleId === "recruiter" || roleId === "hiringManager") && topicId === "fit";
    const includeReviewPaths = topicId === "reviews";
    return withEndChatOption(dedupeHelpBotOptions([
      createBadgedOption("topic-more", "topic-more", deepCopy.explainMore, currentLang === "de" ? "Mehr" : "More"),
      ...(primaryAction ? [createBadgedOption("topic-detail-open", "topic-detail-open", currentLang === "de" ? "Detailseite oeffnen" : "Open detail page", currentLang === "de" ? "Direkt" : "Direct")] : []),
      ...(includeRoleFit ? [{ ...getRoleFitStartOption(), badge: "Smart" }] : []),
      ...(includeReviewPaths ? [getReviewPathStartOption()] : []),
      ...getSuggestedTopicOptions(roleId, topicId).slice(0, 2),
      createBadgedOption("topic-other", "topic-other", deepCopy.otherTopics, currentLang === "de" ? "Wechseln" : "Switch")
    ]));
  };

  const getRecommendedNextTopicLabel = (roleId, topicId) => {
    const nextOption = getSuggestedTopicOptions(roleId, topicId)[0];
    return nextOption?.label || "";
  };

  const getTopicDecisionPromptText = () => (
    roleUsesVisitorName(currentRoleId)
      ? personalizeForNamedVisitor(currentLang === "de"
        ? "Moechten Sie mehr Details zu diesem Bereich sehen?"
        : "Would you like to see more details about this section?")
      : currentLang === "de"
      ? "Moechten Sie mehr Details zu diesem Bereich sehen?"
      : "Would you like to see more details about this section?"
  );

  const getTopicDecisionOptions = () => withEndChatOption([
    {
      kind: "topic-detail-open",
      id: "topic-detail-open",
      label: currentLang === "de" ? "Ja, Details oeffnen" : "Yes, open details"
    },
    {
      kind: "topic-detail-skip",
      id: "topic-detail-skip",
      label: currentLang === "de" ? "Nein, im Chat bleiben" : "No, continue here"
    }
  ]);

  const getPendingTopic = () => {
    const role = config.roles[currentRoleId];
    return role?.topics.find((entry) => entry.id === helpBotState.pendingTopicId) || null;
  };

  const getTopicPrimaryAction = (topic) => {
    if (!topic?.actions?.length) return null;
    return normalizeHelpBotAction(topic.actions[0]);
  };

  const getResumeFollowUp = () => {
    const milestone = getRoleMilestoneSummary(currentRoleId);
    if (/^project-/.test(currentPageName)) {
      if (currentRoleId === "student") {
        return {
          text: `${currentLang === "de"
            ? "Wie wirkt dieses Projekt auf Sie? Ich kann Sie zum Lernpfad, zur Master-Thesis oder zu den Zertifikaten weiterfuehren."
            : "How does this project look to you? I can route you to the learning path, the master's thesis, or the certificates next."}${milestone ? `\n${milestone.text}` : ""}`,
          actions: [
            createBadgedAction(currentLang === "de" ? "Journey" : "Journey", createHelpBotPageTarget("journey.html"), currentLang === "de" ? "Empfohlen" : "Recommended"),
            createBadgedAction(currentLang === "de" ? "Master-Thesis" : "Master's thesis", createHelpBotPageTarget("experience-masters-thesis-keba.html"), currentLang === "de" ? "Weiter" : "Next"),
            createBadgedAction(currentLang === "de" ? "Zertifikate" : "Certificates", createHelpBotHomeTarget("certificates"), currentLang === "de" ? "Proof" : "Proof"),
            createBadgedAction(currentLang === "de" ? "Kontaktformular" : "Contact form", createHelpBotContactFormTarget(), currentLang === "de" ? "Aktion" : "Action")
          ],
          inlineOptions: withEndChatOption(dedupeHelpBotOptions([
            { ...createTopicOption("student", "thesis"), badge: currentLang === "de" ? "Empfohlen" : "Recommended" },
            createTopicOption("student", "journey"),
            createTopicOption("student", "certificates"),
            getTourStartOption()
          ])),
          cards: getRoleSummaryCards(currentRoleId)
        };
      }

      if (currentRoleId === "recruiter" || currentRoleId === "hiringManager") {
        return {
          text: `${currentLang === "de"
            ? "Ist dieses Projekt interessant fuer Ihre Anforderung? Ich kann Sie zu weiteren Robotik-Nachweisen, zum Rollen-Fit oder direkt zu meinem Kontaktweg weiterfuehren."
            : "Does this project look relevant for your requirement? I can route you to more robotics proof, role fit, or directly to my contact path."}${milestone ? `\n${milestone.text}` : ""}\n${currentLang === "de" ? "Wenn Sie bereits genug Signal haben, sind CV oder Kontakt jetzt der sauberste Abschluss." : "If the signal already looks strong, CV or contact is the cleanest close from here."}`,
          actions: [
            createBadgedAction(currentLang === "de" ? "Weitere Projekte" : "More projects", createHelpBotHomeTarget("projects"), currentLang === "de" ? "Proof" : "Proof"),
            createBadgedAction(currentLang === "de" ? "Where I Fit" : "Where I Fit", createHelpBotHomeTarget("where-i-fit"), currentLang === "de" ? "Smart" : "Smart"),
            createBadgedAction(currentLang === "de" ? "CV anfragen" : "Request CV", createHelpBotCvTarget(), "CV"),
            createBadgedAction(currentLang === "de" ? "Kontaktformular" : "Contact form", createHelpBotContactFormTarget(), currentLang === "de" ? "Direkt" : "Direct")
          ],
          inlineOptions: withEndChatOption(dedupeHelpBotOptions([
            { ...getRoleFitStartOption(), badge: currentLang === "de" ? "Smart" : "Smart" },
            { ...createTopicOption(currentRoleId, currentRoleId === "recruiter" ? "experience" : "industrial"), badge: currentLang === "de" ? "Empfohlen" : "Recommended" },
            createTopicOption(currentRoleId, "reviews"),
            getTourStartOption()
          ])),
          cards: getRoleSummaryCards(currentRoleId)
        };
      }

      return {
        text: currentLang === "de"
          ? "Moechten Sie weitere technische Beispiele sehen oder direkt zu GitHub, Journey oder Kontakt weitergehen?"
          : "Would you like to see more technical examples or jump to GitHub, the journey page, or contact next?",
        actions: [
          createBadgedAction(currentLang === "de" ? "Weitere Projekte" : "More projects", createHelpBotHomeTarget("projects"), currentLang === "de" ? "Empfohlen" : "Recommended"),
          createBadgedAction("GitHub", createHelpBotExternalTarget("https://github.com/SoorajSudhakaran1199"), "Code"),
          createBadgedAction(currentLang === "de" ? "Journey" : "Journey", createHelpBotPageTarget("journey.html"), currentLang === "de" ? "Kontext" : "Context"),
          createBadgedAction(currentLang === "de" ? "Kontaktformular" : "Contact form", createHelpBotContactFormTarget(), currentLang === "de" ? "Aktion" : "Action")
        ],
        inlineOptions: withEndChatOption(dedupeHelpBotOptions([
          { ...createTopicOption(currentRoleId, "projects"), badge: currentLang === "de" ? "Empfohlen" : "Recommended" },
          createTopicOption(currentRoleId, "journey"),
          createTopicOption(currentRoleId, "contact"),
          getTourStartOption()
        ]))
      };
    }

    if (/^experience-/.test(currentPageName)) {
      return {
        text: currentLang === "de"
          ? "Moechten Sie eine weitere Erfahrungsseite pruefen, Reviews lesen oder direkt Kontakt aufnehmen?"
          : "Would you like to review another experience page, read reviews, or move directly to contact?",
        actions: [
          { label: currentLang === "de" ? "Erfahrung" : "Experience", target: createHelpBotHomeTarget("experience") },
          { label: currentLang === "de" ? "Reviews" : "Reviews", target: createHelpBotHomeTarget("reviews") },
          { label: currentLang === "de" ? "Journey" : "Journey", target: createHelpBotPageTarget("journey.html") },
          { label: currentLang === "de" ? "Kontaktformular" : "Contact form", target: createHelpBotContactFormTarget() }
        ],
        inlineOptions: withEndChatOption(dedupeHelpBotOptions([
          createTopicOption(currentRoleId, currentRoleId === "recruiter" ? "projects" : currentRoleId === "hiringManager" ? "proof" : "journey"),
          createTopicOption(currentRoleId, "reviews"),
          createTopicOption(currentRoleId, "contact")
        ]))
      };
    }

    if (currentPageName === "journey.html") {
      return {
        text: currentLang === "de"
          ? "Hilft Ihnen dieser Werdegang bereits weiter? Ich kann jetzt zu Projekten, Erfahrung, Reviews oder direktem Kontakt fuehren."
          : "Is this journey page giving you the context you needed? I can route you next to projects, experience, reviews, or direct contact.",
        actions: [
          { label: currentLang === "de" ? "Projekte" : "Projects", target: createHelpBotHomeTarget("projects") },
          { label: currentLang === "de" ? "Erfahrung" : "Experience", target: createHelpBotHomeTarget("experience") },
          { label: currentLang === "de" ? "Reviews" : "Reviews", target: createHelpBotHomeTarget("reviews") },
          { label: currentLang === "de" ? "Kontaktformular" : "Contact form", target: createHelpBotContactFormTarget() }
        ],
        inlineOptions: withEndChatOption(dedupeHelpBotOptions([
          createTopicOption(currentRoleId, "projects"),
          createTopicOption(currentRoleId, "reviews"),
          createTopicOption(currentRoleId, "contact")
        ]))
      };
    }

    if (currentPageName === "feedback.html") {
      return {
        text: `${currentLang === "de"
          ? "Nachdem Sie die Reviews gesehen haben, soll ich Ihnen die staerksten Projekte zeigen oder direkt zum Kontaktweg fuehren?"
          : "Now that you've seen the reviews, would you like me to surface the strongest projects next or take you straight to contact?"}${milestone ? `\n${milestone.text}` : ""}`,
        actions: [
          createBadgedAction(currentLang === "de" ? "Projekte" : "Projects", createHelpBotHomeTarget("projects"), currentLang === "de" ? "Empfohlen" : "Recommended"),
          createBadgedAction(currentLang === "de" ? "Where I Fit" : "Where I Fit", createHelpBotHomeTarget("where-i-fit"), "Smart"),
          createBadgedAction(currentLang === "de" ? "CV anfragen" : "Request CV", createHelpBotCvTarget(), "CV"),
          createBadgedAction(currentLang === "de" ? "Kontaktformular" : "Contact form", createHelpBotContactFormTarget(), currentLang === "de" ? "Direkt" : "Direct")
        ],
        inlineOptions: withEndChatOption(dedupeHelpBotOptions([
          getReviewPathStartOption(),
          { ...createTopicOption(currentRoleId, "projects"), badge: currentLang === "de" ? "Empfohlen" : "Recommended" },
          createTopicOption(currentRoleId, "contact"),
          ...(currentRoleId === "recruiter" || currentRoleId === "hiringManager" ? [{ ...getRoleFitStartOption(), badge: "Smart" }] : []),
          getTourStartOption()
        ]))
      };
    }

    if (currentRoleId === "student") {
      return {
        text: currentLang === "de"
          ? "Soll ich Sie als Naechstes durch Journey, Thesis, Zertifikate oder den Kontaktbereich fuehren?"
          : "Shall I guide you next through the journey, thesis, certificates, or the contact section?",
        actions: [
          { label: currentLang === "de" ? "Journey" : "Journey", target: createHelpBotPageTarget("journey.html") },
          { label: currentLang === "de" ? "Master-Thesis" : "Master's thesis", target: createHelpBotPageTarget("experience-masters-thesis-keba.html") },
          { label: currentLang === "de" ? "Zertifikate" : "Certificates", target: createHelpBotHomeTarget("certificates") },
          { label: currentLang === "de" ? "Kontaktformular" : "Contact form", target: createHelpBotContactFormTarget() }
        ],
        inlineOptions: withEndChatOption(dedupeHelpBotOptions([
          createTopicOption("student", "journey"),
          createTopicOption("student", "thesis"),
          createTopicOption("student", "certificates")
        ]))
      };
    }

    if (currentRoleId === "recruiter" || currentRoleId === "hiringManager") {
      return {
        text: `${currentLang === "de"
          ? "Moechten Sie weiter Projekte, Erfahrung, Reviews oder direkt meinen Kontaktweg pruefen?"
          : "Would you like to keep reviewing projects, experience, reviews, or take the direct path to contact me?"}${milestone ? `\n${milestone.text}` : ""}\n${currentLang === "de" ? "Wenn Sie bereits ein gutes Bild haben, sind CV oder Kontakt jetzt der professionelle Abschluss." : "If you already have a good signal, CV or contact is the professional close from here."}`,
        actions: [
          createBadgedAction(currentLang === "de" ? "Projekte" : "Projects", createHelpBotHomeTarget("projects"), currentLang === "de" ? "Proof" : "Proof"),
          createBadgedAction(currentLang === "de" ? "Erfahrung" : "Experience", createHelpBotHomeTarget("experience"), currentLang === "de" ? "Empfohlen" : "Recommended"),
          createBadgedAction(currentLang === "de" ? "Reviews" : "Reviews", createHelpBotHomeTarget("reviews"), currentLang === "de" ? "Trust" : "Trust"),
          createBadgedAction(currentLang === "de" ? "CV anfragen" : "Request CV", createHelpBotCvTarget(), "CV"),
          createBadgedAction(currentLang === "de" ? "Kontaktformular" : "Contact form", createHelpBotContactFormTarget(), currentLang === "de" ? "Direkt" : "Direct")
        ],
        inlineOptions: withEndChatOption(dedupeHelpBotOptions([
          { ...getQuickPathOption(currentRoleId), badge: currentLang === "de" ? "Schnell" : "Fast" },
          { ...getRoleFitStartOption(), badge: "Smart" },
          { ...createTopicOption(currentRoleId, currentRoleId === "recruiter" ? "experience" : "proof"), badge: currentLang === "de" ? "Empfohlen" : "Recommended" },
          createTopicOption(currentRoleId, "reviews"),
          getTourStartOption()
        ])),
        cards: getRoleSummaryCards(currentRoleId)
      };
    }

    return {
      text: currentLang === "de"
        ? "Moechten Sie weiterfuehrend Projekte, Journey, Reviews oder den Kontaktbereich oeffnen?"
        : "Would you like to continue with projects, the journey page, reviews, or the contact section?",
      actions: [
        { label: currentLang === "de" ? "Projekte" : "Projects", target: createHelpBotHomeTarget("projects") },
        { label: currentLang === "de" ? "Journey" : "Journey", target: createHelpBotPageTarget("journey.html") },
        { label: currentLang === "de" ? "Reviews" : "Reviews", target: createHelpBotHomeTarget("reviews") },
        { label: currentLang === "de" ? "Kontaktformular" : "Contact form", target: createHelpBotContactFormTarget() }
      ],
      inlineOptions: withEndChatOption(dedupeHelpBotOptions([
        createTopicOption(currentRoleId, "projects"),
        createTopicOption(currentRoleId, "reviews"),
        createTopicOption(currentRoleId, "contact")
      ]))
    };
  };

  const setOpen = (shouldOpen) => {
    const wasOpen = root.classList.contains("is-open");
    if (shouldOpen === wasOpen) return;
    root.classList.toggle("is-open", shouldOpen);
    document.body.classList.toggle("help-bot-open", shouldOpen);
    root.classList.remove("is-inline-nudge-visible");
    launcher?.setAttribute("aria-expanded", shouldOpen ? "true" : "false");
    launcher?.setAttribute("aria-label", config.launcher);
    panel?.setAttribute("aria-hidden", shouldOpen ? "false" : "true");
    if (shouldOpen) {
      lastFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : launcher;
      clearNudgeTimers();
      root.classList.remove("is-nudge-visible");
      setInlineNudgeOverride("");
      if (currentPageName === "index.html") {
        setNudgeMessage(config.nudge);
      }
      if (!hasConversationBooted) {
        resetConversation();
      } else {
        currentRoleId = helpBotState.currentRoleId;
        renderStoredConversation();
        if (helpBotState.pendingResumePrompt && currentPageName !== "index.html") {
          appendMessage({
            sender: "bot",
            text: getPortfolioHelpBotResumeMessage(
              currentLang,
              currentRoleId,
              currentPageName,
              helpBotState.lastNavTarget,
              getVisitorName()
            ),
            inlineOptions: getResumeChoiceOptions()
          });
          helpBotState.pendingResumePrompt = false;
          persistHelpBotState();
        } else if (helpBotState.pendingResumePrompt) {
          helpBotState.pendingResumePrompt = false;
          persistHelpBotState();
        }
      }
      trackAnalyticsEvent("help_bot_opened", {
        page_path: window.location.pathname,
        lang: currentLang
      });
      syncInlineStudentNudge();
      window.requestAnimationFrame(() => {
        if (composer && !composer.hidden) {
          const activeField = composerTextarea && !composerTextarea.hidden ? composerTextarea : composerInput;
          activeField?.focus({ preventScroll: true });
          return;
        }
        (closeButton || panel).focus({ preventScroll: true });
      });
    } else {
      setInlineNudgeOverride("");
      if (helpBotState.messages.length >= 2 && (currentRoleId || hasConversationBooted)) {
        queueHelpBotRemoteSessionSync({ immediate: true });
      }
      clearNudgeTimers();
      showNudge({
        delay: shouldUseStudentCornerNudge() ? 0 : HELP_BOT_NUDGE_RESHOW_MS,
        force: shouldUseStudentCornerNudge()
      });
      syncInlineStudentNudge();
      if (lastFocusedElement && document.contains(lastFocusedElement)) {
        window.requestAnimationFrame(() => {
          lastFocusedElement.focus({ preventScroll: true });
        });
      }
    }
  };

  const setStaticCopy = () => {
    const composerMode = getComposerMode();
    const composerField = composerMode.inputKind === "textarea" ? composerTextarea : composerInput;
    const inactiveField = composerMode.inputKind === "textarea" ? composerInput : composerTextarea;
    if (nudgeBadge) nudgeBadge.textContent = config.nudgeBadge;
    badge.textContent = config.badge;
    title.textContent = config.title;
    lead.textContent = config.lead;
    resetButton.textContent = config.reset;
    backdrop.setAttribute("aria-label", config.close);
    closeButton.setAttribute("aria-label", config.close);
    setNudgeMessage(config.nudge);
    nudgeCloseButton.setAttribute("aria-label", config.close);
    launcher.setAttribute("aria-label", config.launcher);
    if (composerInput && composerTextarea && composerField) {
      composerInput.hidden = composerMode.inputKind === "textarea";
      composerTextarea.hidden = composerMode.inputKind !== "textarea";
      composerInput.type = composerMode.inputType || "text";
      composerInput.autocomplete = composerMode.autocomplete || "off";
      composerTextarea.autocomplete = "off";
      composerField.placeholder = composerMode.placeholder;
      composerField.setAttribute("aria-label", composerMode.placeholder);
      composerField.maxLength = composerMode.maxLength;
      inactiveField.value = "";
      inactiveField.removeAttribute("aria-invalid");
    }
    if (composerSubmit) {
      composerSubmit.textContent = composerMode.submit;
      composerSubmit.setAttribute("aria-label", composerMode.submit);
    }
    syncInlineStudentNudge();
  };

  const getActiveComposerField = () => (composerTextarea && !composerTextarea.hidden ? composerTextarea : composerInput);

  const clearComposerNote = () => {
    if (!composerNote) return;
    composerNote.textContent = "";
    composerNote.hidden = true;
    delete composerNote.dataset.state;
    composerInput?.removeAttribute("aria-invalid");
    composerTextarea?.removeAttribute("aria-invalid");
  };

  const setComposerNote = (message = "", state = "error") => {
    if (!composerNote) return;
    composerNote.textContent = message;
    composerNote.hidden = !message;
    composerNote.dataset.state = state;
    const activeField = getActiveComposerField();
    if (message) {
      activeField?.setAttribute("aria-invalid", state === "error" ? "true" : "false");
    } else {
      activeField?.removeAttribute("aria-invalid");
    }
  };

  const focusComposerInput = () => {
    if (!composer || composer.hidden) return;
    window.requestAnimationFrame(() => {
      const activeField = getActiveComposerField();
      activeField?.focus({ preventScroll: true });
      if (activeField instanceof HTMLInputElement || activeField instanceof HTMLTextAreaElement) {
        activeField.select();
      }
    });
  };

  const hideComposer = ({ clearValue = true } = {}) => {
    if (!composer) return;
    composer.hidden = true;
    root.classList.remove("is-composer-visible");
    if (clearValue) {
      if (composerInput) composerInput.value = "";
      if (composerTextarea) composerTextarea.value = "";
    }
    clearComposerNote();
  };

  const showComposer = () => {
    if (!composer) return;
    composer.hidden = false;
    root.classList.add("is-composer-visible");
    clearComposerNote();
    if (helpBotState.pendingInputKind === "chat-feedback") {
      const draft = getChatFeedbackDraft();
      const activeField = getActiveComposerField();
      const draftValue = draft?.field && typeof draft[draft.field] === "string" ? draft[draft.field] : "";
      if (activeField) {
        activeField.value = draftValue || "";
      }
    }
    focusComposerInput();
  };

  const syncComposerState = () => {
    if (HELP_BOT_PENDING_INPUT_KINDS.includes(helpBotState.pendingInputKind)) {
      showComposer();
      return;
    }
    hideComposer();
  };

  const renderStoredConversation = () => {
    clearTypingIndicator();
    if (liveRegion) liveRegion.textContent = "";
    messages.innerHTML = "";
    helpBotState.messages.forEach((message) => {
      appendMessage({
        sender: message.sender,
        text: message.text,
        actions: message.actions,
        inlineOptions: message.inlineOptions,
        cards: message.cards,
        persist: false
      });
    });
    syncComposerState();
    setOptions([], "");
  };

  const scrollMessagesToEnd = () => {
    messages.scrollTo({
      top: messages.scrollHeight,
      behavior: "smooth"
    });
  };

  const createBotMessageFrame = () => {
    const item = document.createElement("div");
    item.className = "help-bot-message is-bot";

    const avatar = document.createElement("span");
    avatar.className = "help-bot-message-avatar";
    avatar.innerHTML = getPortfolioHelpBotArtMarkup("help-bot-art-avatar");

    const stack = document.createElement("div");
    stack.className = "help-bot-message-stack";

    const name = document.createElement("span");
    name.className = "help-bot-message-name";
    name.textContent = config.assistantName;

    const bubble = document.createElement("div");
    bubble.className = "help-bot-bubble";

    stack.append(name, bubble);
    item.append(avatar, stack);

    return { item, bubble };
  };

  const clearTypingIndicator = () => {
    activeTypingIndicator?.remove();
    activeTypingIndicator = null;
  };

  const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

  const escapeRegExp = (value = "") => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const getHelpBotEmphasisTerms = () => {
    const roleLabels = Object.values(config.roles || {})
      .map((role) => role?.label)
      .filter(Boolean);
    const tourLabels = getTourSteps().map((step) => step.label).filter(Boolean);
    const dynamicTerms = [
      getVisitorName(),
      getStudentUniversity(),
      config.assistantTitle,
      config.assistantName,
      ...roleLabels,
      ...tourLabels
    ];
    const staticTerms = currentLang === "de"
      ? [
          "KEBA Group",
          "United Engineering",
          "Deggendorf Institute of Technology, Germany",
          "APJ Abdul Kalam Technological University",
          "Master in Mechatronics",
          "Bachelor in Mechanical Engineering",
          "Deutschland",
          "Indien",
          "Robotik",
          "Mechatronik",
          "Automatisierung",
          "ROS",
          "Gazebo",
          "RViz",
          "Python",
          "CV",
          "Journey",
          "Reviews",
          "Kontakt",
          "Projekte",
          "Erfahrung",
          "Bildung",
          "Zertifikate",
          "Profil-Ueberblick",
          "Detailseite",
          "Naechster Bereich"
        ]
      : [
          "KEBA Group",
          "United Engineering",
          "Deggendorf Institute of Technology, Germany",
          "APJ Abdul Kalam Technological University",
          "Master's in Mechatronics",
          "Bachelor's in Mechanical Engineering",
          "Germany",
          "India",
          "robotics",
          "mechatronics",
          "automation",
          "ROS",
          "Gazebo",
          "RViz",
          "Python",
          "CV",
          "Journey",
          "Reviews",
          "Contact",
          "Projects",
          "Experience",
          "Education",
          "Certificates",
          "Profile overview",
          "detail page",
          "Next section",
          "View detail page",
          "Important",
          "Ask a question",
          "main menu"
        ];
    return Array.from(new Set([...dynamicTerms, ...staticTerms]
      .map((term) => String(term || "").trim())
      .filter((term) => term.length >= 2)))
      .sort((left, right) => right.length - left.length);
  };

  const getEmphasisRanges = (text = "", terms = []) => {
    const ranges = [];
    terms.forEach((term) => {
      const regex = new RegExp(escapeRegExp(term), "gi");
      let match;
      while ((match = regex.exec(text))) {
        const start = match.index;
        const end = start + match[0].length;
        if (!ranges.some((range) => start < range.end && end > range.start)) {
          ranges.push({ start, end });
        }
      }
    });
    return ranges.sort((left, right) => left.start - right.start);
  };

  const appendFormattedLine = (paragraph, line = "", sender = "bot") => {
    const content = String(line || "");
    if (!content) return;
    if (sender !== "bot") {
      paragraph.textContent = content;
      return;
    }
    const ranges = getEmphasisRanges(content, getHelpBotEmphasisTerms());
    if (!ranges.length) {
      paragraph.textContent = content;
      return;
    }
    let cursor = 0;
    ranges.forEach((range) => {
      if (range.start > cursor) {
        paragraph.append(document.createTextNode(content.slice(cursor, range.start)));
      }
      const strong = document.createElement("strong");
      strong.textContent = content.slice(range.start, range.end);
      paragraph.append(strong);
      cursor = range.end;
    });
    if (cursor < content.length) {
      paragraph.append(document.createTextNode(content.slice(cursor)));
    }
  };

  const showTypingIndicator = () => {
    clearTypingIndicator();
    if (liveRegion) liveRegion.textContent = config.typingAnnouncement;
    const { item, bubble } = createBotMessageFrame();
    bubble.classList.add("is-typing");
    bubble.setAttribute("aria-hidden", "true");
    bubble.innerHTML = `
      <span class="help-bot-typing" aria-hidden="true">
        <span></span>
        <span></span>
        <span></span>
      </span>
    `;
    messages.append(item);
    activeTypingIndicator = item;
    window.requestAnimationFrame(scrollMessagesToEnd);
  };

  const queueBotReply = async ({ text = "", actions = [], delay = 520, token = responseToken, inlineOptions = [], cards = [] } = {}) => {
    showTypingIndicator();
    await wait(delay);
    if (token !== responseToken) return;
    clearTypingIndicator();
    appendMessage({ sender: "bot", text, actions, inlineOptions, cards });
  };

  const appendMessage = ({ sender = "bot", text = "", actions = [], inlineOptions = [], cards = [], persist = true }) => {
    const item = document.createElement("div");
    item.className = `help-bot-message is-${sender}`;

    const bubble = document.createElement("div");
    bubble.className = "help-bot-bubble";

    text.split("\n").filter(Boolean).forEach((line) => {
      const paragraph = document.createElement("p");
      appendFormattedLine(paragraph, line, sender);
      bubble.append(paragraph);
    });

    if (actions.length) {
      const actionRow = document.createElement("div");
      actionRow.className = "help-bot-message-actions";

      actions.forEach((action) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "help-bot-message-link";
        if (action.badge) {
          const badgeEl = document.createElement("span");
          badgeEl.className = "help-bot-button-badge";
          badgeEl.textContent = action.badge;
          button.append(badgeEl);
        }
        const labelEl = document.createElement("span");
        labelEl.className = "help-bot-button-label";
        labelEl.textContent = action.label;
        button.append(labelEl);
        button.dataset.helpBotNav = "true";
        button.dataset.helpBotTarget = encodeURIComponent(JSON.stringify(action.target));
        actionRow.append(button);
      });

      bubble.append(actionRow);
    }

    if (cards.length) {
      const cardGrid = document.createElement("div");
      cardGrid.className = "help-bot-cards";

      cards.forEach((card) => {
        const article = document.createElement("article");
        article.className = "help-bot-card";
        if (card.badge) {
          const badgeEl = document.createElement("span");
          badgeEl.className = "help-bot-card-badge";
          badgeEl.textContent = card.badge;
          article.append(badgeEl);
        }
        const titleEl = document.createElement("strong");
        titleEl.className = "help-bot-card-title";
        titleEl.textContent = card.title;
        const textEl = document.createElement("p");
        textEl.className = "help-bot-card-text";
        textEl.textContent = card.text;
        article.append(titleEl, textEl);
        cardGrid.append(article);
      });

      bubble.append(cardGrid);
    }

    if (inlineOptions.length) {
      const optionRow = document.createElement("div");
      optionRow.className = "help-bot-message-options";

      inlineOptions.forEach((option) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "help-bot-message-option";
        if (option.priority === "low") {
          button.classList.add("is-low-priority");
        }
        if (option.badge) {
          const badgeEl = document.createElement("span");
          badgeEl.className = "help-bot-button-badge";
          badgeEl.textContent = option.badge;
          button.append(badgeEl);
        }
        const labelEl = document.createElement("span");
        labelEl.className = "help-bot-button-label";
        labelEl.textContent = option.label;
        button.append(labelEl);
        button.dataset.helpBotOptionKind = option.kind;
        button.dataset.helpBotOptionId = option.id;
        optionRow.append(button);
      });

      bubble.append(optionRow);
    }

    if (sender === "bot") {
      const frame = createBotMessageFrame();
      frame.bubble.replaceWith(bubble);
      frame.item.querySelector(".help-bot-message-stack")?.replaceChildren(
        frame.item.querySelector(".help-bot-message-name"),
        bubble
      );
      messages.append(frame.item);
    } else {
      item.append(bubble);
      messages.append(item);
    }
    if (sender === "bot" && liveRegion && persist) {
      liveRegion.textContent = String(text || "").trim();
    }
    if (persist) {
      helpBotState.messages.push({
        sender,
        text: String(text || "").trim(),
        actions: actions.map(normalizeHelpBotAction).filter(Boolean),
        inlineOptions: inlineOptions.map(normalizeHelpBotOption).filter(Boolean),
        cards: cards.map(normalizeHelpBotCard).filter(Boolean)
      });
      persistHelpBotState();
      if (hasConversationBooted || sender === "user" || currentRoleId) {
        queueHelpBotRemoteSessionSync();
      }
    }
    if (root.classList.contains("is-open")) {
      setStaticCopy();
      syncComposerState();
    }
    window.requestAnimationFrame(scrollMessagesToEnd);
  };

  const setOptions = (items = [], prompt = config.optionPrompt) => {
    void items;
    void prompt;
  };

  const clearChatFeedbackDraft = () => {
    helpBotState.chatFeedbackDraft = normalizeHelpBotFeedbackDraft(null);
    if (helpBotState.pendingInputKind === "chat-feedback") {
      helpBotState.pendingInputKind = "";
    }
  };

  const clearRecruiterRequestDraft = () => {
    helpBotState.recruiterRequestDraft = normalizeHelpBotRecruiterRequestDraft(null);
    if (helpBotState.pendingInputKind === "recruiter-request") {
      helpBotState.pendingInputKind = "";
    }
  };

  const getFeedbackPromptName = () => {
    const visitorName = getVisitorName();
    return roleUsesVisitorName(currentRoleId) && visitorName ? visitorName : "";
  };

  const getFeedbackChoiceOptions = () => dedupeHelpBotOptions([
    createBadgedOption("feedback-choice", "collect", config.feedbackPromptCollectHere, currentLang === "de" ? "Chat" : "Chat"),
    createBadgedOption("feedback-choice", "skip", config.feedbackSkipOption, currentLang === "de" ? "Schliessen" : "Close")
  ]);

  const getFeedbackSkipConfirmOptions = () => dedupeHelpBotOptions([
    createBadgedOption("feedback-skip-confirm", "leave", config.feedbackSkipConfirmLeave, currentLang === "de" ? "Beenden" : "Leave"),
    createBadgedOption("feedback-skip-confirm", "review", config.feedbackSkipConfirmReview, currentLang === "de" ? "Bewertung" : "Review")
  ]);

  const getFeedbackStudentReviewModeOptions = () => dedupeHelpBotOptions([
    createBadgedOption("feedback-student-review-mode", "chat", config.feedbackStudentReviewModeChat, currentLang === "de" ? "Direkt" : "Chat"),
    createBadgedOption("feedback-skip-confirm", "leave", config.feedbackSkipConfirmLeave, currentLang === "de" ? "Beenden" : "Leave")
  ]);

  const getRecruiterContactCvOptions = () => withEndChatOption([
    createBadgedOption("recruiter-intake-choice", "contact", config.recruiterContactChooseContact, currentLang === "de" ? "Kontakt" : "Contact"),
    createBadgedOption("recruiter-intake-choice", "cv", config.recruiterContactChooseCv, "CV")
  ]);

  const getRecruiterFollowupOptions = (nextType) => withEndChatOption([
    createBadgedOption(
      "recruiter-intake-followup",
      nextType,
      nextType === "cv" ? config.recruiterFollowupYesCv : config.recruiterFollowupYesContact,
      nextType === "cv" ? "CV" : (currentLang === "de" ? "Kontakt" : "Contact")
    ),
    createBadgedOption("recruiter-intake-followup", "finish", config.recruiterFollowupNo, currentLang === "de" ? "Ende" : "Finish")
  ]);

  const getFeedbackRatingOptions = () => dedupeHelpBotOptions([
    createBadgedOption("feedback-rating", "5", "5 / 5", currentLang === "de" ? "Top" : "Top"),
    createBadgedOption("feedback-rating", "4", "4 / 5", currentLang === "de" ? "Stark" : "Strong"),
    createBadgedOption("feedback-rating", "3", "3 / 5", currentLang === "de" ? "Solide" : "Solid"),
    createBadgedOption("feedback-rating", "2", "2 / 5", currentLang === "de" ? "Niedrig" : "Low"),
    createBadgedOption("feedback-rating", "1", "1 / 5", currentLang === "de" ? "Schwach" : "Weak"),
    createBadgedOption("feedback-choice", "skip", config.feedbackSkipOption, currentLang === "de" ? "Schliessen" : "Close")
  ]);

  const getChatFeedbackFieldPrompt = (field, mode) => {
    switch (field) {
      case "company":
        return config.feedbackCompanyPrompt;
      case "email":
        return config.feedbackEmailPrompt;
      case "country":
        return config.feedbackCountryPrompt;
      case "comments":
        return config.feedbackCommentPrompt(mode);
      case "name":
      default:
        return config.feedbackNamePrompt;
    }
  };

  const buildChatFeedbackDerivedSubject = (message = "", fallback = "") => {
    const normalizedMessage = String(message || "").replace(/\s+/g, " ").trim();
    if (normalizedMessage) {
      return normalizedMessage.length > 72
        ? `${normalizedMessage.slice(0, 69).trimEnd()}...`
        : normalizedMessage;
    }
    return String(fallback || "").trim();
  };

  const promptChatFeedbackField = async (field, token = responseToken) => {
    const draft = getChatFeedbackDraft();
    if (!draft.mode || !HELP_BOT_FEEDBACK_FIELDS.includes(field)) return;
    helpBotState.pendingInputKind = "chat-feedback";
    helpBotState.chatFeedbackDraft = { ...draft, field };
    persistHelpBotState();
    setStaticCopy();
    await queueBotReply({
      text: getChatFeedbackFieldPrompt(field, draft.mode),
      delay: 420,
      token
    });
    if (token !== responseToken) return;
    showComposer();
  };

  const promptChatFeedbackRating = async (token = responseToken) => {
    const draft = getChatFeedbackDraft();
    if (!draft.mode) return;
    helpBotState.pendingInputKind = "";
    helpBotState.chatFeedbackDraft = { ...draft, field: "" };
    persistHelpBotState();
    setStaticCopy();
    hideComposer();
    await queueBotReply({
      text: config.feedbackRatingPrompt,
      delay: 420,
      token,
      inlineOptions: getFeedbackRatingOptions()
    });
  };

  const beginEndChatFlow = async () => {
    responseToken += 1;
    const token = responseToken;
    clearTypingIndicator();
    clearChatFeedbackDraft();
    clearRecruiterRequestDraft();
    persistHelpBotState();
    hideComposer();
    setOptions([], "");
    await queueBotReply({
      text: config.feedbackPrompt(getFeedbackPromptName()),
      delay: 360,
      token,
      inlineOptions: getFeedbackChoiceOptions()
    });
  };

  const finishChatWithFarewell = async (text) => {
    responseToken += 1;
    const token = responseToken;
    clearTypingIndicator();
    clearChatFeedbackDraft();
    clearRecruiterRequestDraft();
    persistHelpBotState();
    hideComposer();
    await queueBotReply({
      text,
      delay: 320,
      token
    });
    if (token !== responseToken) return;
    await wait(950);
    if (token !== responseToken) return;
    endConversation({ showExitNudge: false });
  };

  const getNamedFarewellText = (value) => {
    if (typeof value === "function") return value(getVisitorName());
    return value;
  };

  const submitChatFeedback = async () => {
    const draft = getChatFeedbackDraft();
    if (!draft.mode || !draft.name || !draft.company || !draft.email || !draft.country || !draft.rating || !draft.comments) {
      return false;
    }

    responseToken += 1;
    const token = responseToken;
    clearTypingIndicator();
    hideComposer({ clearValue: false });
    clearComposerNote();
    showTypingIndicator();

    const lang = currentLang === "de" ? "de" : "en";
    const template = FEEDBACK_MAIL_TEMPLATES[lang] || FEEDBACK_MAIL_TEMPLATES.en;
    const submittedAt = new Date().toISOString();
    const submissionId = createClientUuid();
    const reviewVisibility = draft.mode === "public" ? "public" : "private";
    const reviewVisibilityLabel = draft.mode === "public"
      ? (lang === "de" ? "Oeffentlich" : "Public")
      : (lang === "de" ? "Privat" : "Private");
    const baseSubject = template.subjects?.feedback || "Feedback on your portfolio website";
    const derivedSubject = buildChatFeedbackDerivedSubject(
      draft.comments,
      lang === "de" ? "AI Assistant Chat Feedback" : "AI Assistant chat feedback"
    );
    const finalSubject = derivedSubject ? `${baseSubject}: ${derivedSubject}` : baseSubject;
    const sourceLabel = lang === "de" ? "Quelle" : "Source";
    const sourceValue = lang === "de" ? "AI Assistant Chat" : "AI Assistant chat";
    const sectionValue = lang === "de"
      ? `${currentPageName} ueber den AI Assistant`
      : `${currentPageName} via AI Assistant`;

    const lines = [
      template.greeting,
      "",
      template.intros?.feedback || "",
      "",
      `${template.labels.messageType}: ${lang === "de" ? "Feedback" : "Feedback"}`,
      `${sourceLabel}: ${sourceValue}`,
      `${template.labels.name}: ${draft.name}`,
      `${template.labels.email}: ${draft.email}`,
      `${template.labels.country}: ${draft.country}`,
      `${template.labels.company}: ${draft.company}`,
      `${template.labels.section}: ${sectionValue}`,
      `${template.labels.rating}: ${draft.rating}`,
      `${template.labels.reviewVisibility}: ${reviewVisibilityLabel}`,
      "",
      `${template.labels.comments}:`,
      draft.comments,
      "",
      template.closing,
      draft.name
    ];

    const requestBody = new FormData();
    requestBody.set("access_key", WEB3FORMS_ACCESS_KEY);
    requestBody.set("subject", finalSubject);
    requestBody.set("from_name", "Sooraj Sudhakaran Portfolio");
    requestBody.set("replyto", draft.email);
    requestBody.set("message", lines.join("\r\n"));
    requestBody.set("botcheck", "");

    try {
      const response = await fetch(WEB3FORMS_ENDPOINT, {
        method: "POST",
        body: requestBody,
        headers: {
          Accept: "application/json"
        }
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || result?.success === false) {
        throw new Error(result?.message || "Submission failed");
      }

      let publicReviewPublished = false;
      await recordSharedSubmissionEvent({
        id: submissionId,
        type: "feedback",
        country: draft.country,
        submittedAt,
        subject: derivedSubject,
        rating: draft.rating
      });

      if (draft.mode === "public") {
        try {
          await recordSharedPublicReview({
            id: submissionId,
            reviewerName: draft.name,
            company: draft.company,
            country: draft.country,
            rating: draft.rating,
            reviewTitle: derivedSubject,
            reviewText: draft.comments,
            submittedAt
          });
          publicReviewPublished = true;
        } catch {
          publicReviewPublished = false;
        }
      }

      const submissionRecord = {
        type: "feedback",
        submittedAt,
        reviewVisibility,
        publicReviewRequested: draft.mode === "public",
        publicReviewPublished
      };

      sessionStorage.setItem(STORAGE_FEEDBACK_LAST_SUBMISSION_KEY, JSON.stringify(submissionRecord));
      persistRecentSubmission(submissionRecord);
      trackAnalyticsEvent("help_bot_feedback_submit_success", {
        page_path: window.location.pathname,
        lang: currentLang,
        review_visibility: reviewVisibility,
        role: currentRoleId || "unassigned"
      });

      clearTypingIndicator();
      clearChatFeedbackDraft();
      persistHelpBotState();
      await queueBotReply({
        text: getNamedFarewellText(config.feedbackSuccess),
        delay: 320,
        token
      });
      if (token !== responseToken) return true;
      await wait(950);
      if (token !== responseToken) return true;
      endConversation({ showExitNudge: false });
      return true;
    } catch {
      clearTypingIndicator();
      helpBotState.pendingInputKind = "";
      helpBotState.chatFeedbackDraft = { ...draft, field: "comments" };
      persistHelpBotState();
      trackAnalyticsEvent("help_bot_feedback_submit_error", {
        page_path: window.location.pathname,
        lang: currentLang,
        review_visibility: reviewVisibility,
        role: currentRoleId || "unassigned"
      });
      await queueBotReply({
        text: config.feedbackFailure,
        delay: 320,
        token,
        actions: [
          createBadgedAction(config.feedbackOpenPage, createHelpBotPageTarget("feedback.html", "feedback-form"), currentLang === "de" ? "Seite" : "Page")
        ],
        inlineOptions: dedupeHelpBotOptions([
          createBadgedOption("feedback-retry", "feedback-retry", config.feedbackRetry, currentLang === "de" ? "Erneut" : "Retry"),
          createBadgedOption("feedback-edit", "feedback-edit", config.feedbackEdit, currentLang === "de" ? "Text" : "Edit"),
          createBadgedOption("feedback-choice", "skip", config.feedbackSkipOption, currentLang === "de" ? "Schliessen" : "Close")
        ])
      });
      return false;
    }
  };

  const selectFeedbackChoice = async (choiceId) => {
    const label = choiceId === "collect"
        ? config.feedbackPromptCollectHere
        : choiceId === "public"
          ? config.feedbackPublicOption
          : choiceId === "private"
            ? config.feedbackPrivateOption
            : config.feedbackSkipOption;
    appendMessage({ sender: "user", text: label });

    if (choiceId === "collect") {
      responseToken += 1;
      const token = responseToken;
      clearTypingIndicator();
      hideComposer();
      await queueBotReply({
        text: currentLang === "de"
          ? "Gerne. Soll ich dafuer eine oeffentliche Bewertung oder ein privates Feedback direkt hier im Chat sammeln?"
          : "Sure. Should I collect a public review or private feedback for that directly here in the chat?",
        delay: 360,
        token,
        inlineOptions: dedupeHelpBotOptions([
          createBadgedOption("feedback-choice", "public", config.feedbackPublicOption, currentLang === "de" ? "Oeffentlich" : "Public"),
          createBadgedOption("feedback-choice", "private", config.feedbackPrivateOption, currentLang === "de" ? "Privat" : "Private"),
          createBadgedOption("feedback-choice", "skip", config.feedbackSkipOption, currentLang === "de" ? "Schliessen" : "Close")
        ])
      });
      return;
    }

    if (choiceId === "skip") {
      if (currentRoleId === "student") {
        responseToken += 1;
        const token = responseToken;
        clearTypingIndicator();
        hideComposer();
        await queueBotReply({
          text: config.feedbackSkipConfirmPromptStudent(getVisitorName()),
          delay: 420,
          token,
          inlineOptions: getFeedbackSkipConfirmOptions()
        });
        return;
      }
      await finishChatWithFarewell(getNamedFarewellText(config.feedbackSkipFarewell));
      return;
    }

    responseToken += 1;
    const token = responseToken;
    clearTypingIndicator();
    const visitorName = getVisitorName();
    const shouldReuseVisitorName = roleUsesVisitorName(currentRoleId) && visitorName;
    helpBotState.chatFeedbackDraft = normalizeHelpBotFeedbackDraft({
      mode: choiceId,
      name: shouldReuseVisitorName ? visitorName : "",
      field: shouldReuseVisitorName ? "company" : "name"
    });
    helpBotState.pendingInputKind = "";
    persistHelpBotState();
    hideComposer();
    setOptions([], "");
    await queueBotReply({
      text: shouldReuseVisitorName
        ? `${config.feedbackIntro(choiceId)}\n${config.feedbackUsingName(visitorName)}`
        : config.feedbackIntro(choiceId),
      delay: 420,
      token
    });
    if (token !== responseToken) return;
    await promptChatFeedbackField(shouldReuseVisitorName ? "company" : "name", token);
  };

  const selectFeedbackSkipConfirm = async (decisionId) => {
    if (decisionId === "review") {
      appendMessage({ sender: "user", text: config.feedbackSkipConfirmReview });
      responseToken += 1;
      const token = responseToken;
      clearTypingIndicator();
      await queueBotReply({
        text: config.feedbackStudentReviewModePrompt,
        delay: 360,
        token,
        inlineOptions: getFeedbackStudentReviewModeOptions()
      });
      return;
    }

    appendMessage({ sender: "user", text: config.feedbackSkipConfirmLeave });
    await finishChatWithFarewell(getNamedFarewellText(currentRoleId === "student" ? config.feedbackSkipFarewellStudent : config.feedbackSkipFarewell));
  };

  const selectFeedbackStudentReviewMode = async (modeId) => {
    if (modeId === "chat") {
      appendMessage({ sender: "user", text: config.feedbackStudentReviewModeChat });
      await selectFeedbackChoice("public");
      return;
    }
  };

  const selectFeedbackRating = async (rating) => {
    const normalizedRating = ["1", "2", "3", "4", "5"].includes(String(rating || "").trim())
      ? String(rating || "").trim()
      : "";
    if (!normalizedRating) return;

    responseToken += 1;
    const token = responseToken;
    clearTypingIndicator();
    helpBotState.chatFeedbackDraft = {
      ...getChatFeedbackDraft(),
      rating: normalizedRating,
      field: "comments"
    };
    helpBotState.pendingInputKind = "";
    persistHelpBotState();
    appendMessage({ sender: "user", text: `${normalizedRating} / 5` });
    setOptions([], "");
    await promptChatFeedbackField("comments", token);
  };

  const retryChatFeedbackSubmit = async () => {
    appendMessage({ sender: "user", text: config.feedbackRetry });
    await submitChatFeedback();
  };

  const editChatFeedbackComments = async () => {
    appendMessage({ sender: "user", text: config.feedbackEdit });
    responseToken += 1;
    const token = responseToken;
    clearTypingIndicator();
    await promptChatFeedbackField("comments", token);
  };

  const promptForVisitorName = async (roleId, token = responseToken) => {
    const role = config.roles[roleId];
    if (!role) return;
    helpBotState.pendingInputKind = "visitor-name";
    helpBotState.pendingTopicId = "";
    persistHelpBotState();
    setStaticCopy();
    await queueBotReply({
      text: config.askName,
      delay: 420,
      token,
      inlineOptions: withEndChatOption([])
    });
    if (token !== responseToken) return;
    showComposer();
  };

  const promptVisitorProfileConsent = async (token = responseToken) => {
    helpBotState.pendingInputKind = "";
    persistHelpBotState();
    hideComposer();
    await queueBotReply({
      text: config.visitorProfileConsent,
      delay: 420,
      token,
      inlineOptions: getVisitorProfileConsentOptions()
    });
  };

  const promptVisitorProfileField = async (field, token = responseToken) => {
    let text = config.visitorNamePrompt;
    let option = getVisitorFieldSkipOption("name");
    if (field === "position") {
      text = config.visitorPositionPrompt;
      option = getVisitorFieldSkipOption("position");
      helpBotState.pendingInputKind = "visitor-position";
    } else if (field === "organization") {
      text = config.visitorOrganizationPrompt;
      option = getVisitorFieldSkipOption("organization");
      helpBotState.pendingInputKind = "visitor-organization";
    } else {
      helpBotState.pendingInputKind = "visitor-name";
    }
    persistHelpBotState();
    setStaticCopy();
    await queueBotReply({
      text,
      delay: 360,
      token,
      inlineOptions: withEndChatOption([option])
    });
    if (token !== responseToken) return;
    showComposer();
  };

  const continueVisitorAfterProfile = async (token = responseToken) => {
    helpBotState.pendingInputKind = "";
    persistHelpBotState();
    hideComposer();
    await queueBotReply({
      text: config.visitorProfileThanks(getVisitorName(), getVisitorPosition(), getVisitorOrganization()),
      delay: 360,
      token
    });
    if (token !== responseToken) return;
    await continueRoleFlow("visitor", token);
  };

  const handleVisitorProfileChoice = async (choiceId) => {
    appendMessage({ sender: "user", text: choiceId === "share" ? config.visitorProfileShare : config.visitorProfileSkip });
    responseToken += 1;
    const token = responseToken;
    clearTypingIndicator();
    if (choiceId === "skip") {
      helpBotState.pendingInputKind = "";
      persistHelpBotState();
      await continueRoleFlow("visitor", token);
      return;
    }
    await promptVisitorProfileField("name", token);
  };

  const handleVisitorFieldSkip = async (fieldId) => {
    const skipLabel = fieldId === "name"
      ? config.visitorNameSkip
      : fieldId === "position"
        ? config.visitorPositionSkip
        : config.visitorOrganizationSkip;
    appendMessage({ sender: "user", text: skipLabel });
    if (fieldId === "name") {
      helpBotState.visitorName = "";
      responseToken += 1;
      const token = responseToken;
      clearTypingIndicator();
      await promptVisitorProfileField("position", token);
      return;
    }
    if (fieldId === "position") {
      helpBotState.visitorPosition = "";
      responseToken += 1;
      const token = responseToken;
      clearTypingIndicator();
      await promptVisitorProfileField("organization", token);
      return;
    }
    helpBotState.visitorOrganization = "";
    responseToken += 1;
    const token = responseToken;
    clearTypingIndicator();
    await continueVisitorAfterProfile(token);
  };

  const promptForStudentUniversity = async (token = responseToken) => {
    const visitorName = getVisitorName();
    helpBotState.pendingInputKind = "student-university";
    helpBotState.studentUniversityCandidate = null;
    persistHelpBotState();
    setStaticCopy();
    await queueBotReply({
      text: config.askUniversity(visitorName),
      delay: 420,
      token,
      inlineOptions: withEndChatOption([])
    });
    if (token !== responseToken) return;
    showComposer();
  };

  const continueRoleFlow = async (roleId, token = responseToken, { greetName = "" } = {}) => {
    const role = config.roles[roleId];
    if (!role) return;

    if (greetName) {
      await queueBotReply({
        text: config.askNameGreeting(greetName),
        delay: 420,
        token
      });
      if (token !== responseToken) return;
    }

    if (roleId === "visitor" && (getVisitorPosition() || getVisitorOrganization())) {
      const contextBits = [getVisitorPosition(), getVisitorOrganization()].filter(Boolean);
      await queueBotReply({
        text: currentLang === "de"
          ? `Ich richte das jetzt mit Blick auf ${contextBits.join(" bei ")} etwas gezielter aus.`
          : `I’ll tailor this a bit more closely around ${contextBits.join(" at ")}.`,
        delay: 340,
        token
      });
      if (token !== responseToken) return;
    }

    await queueBotReply({
      text: personalizeForNamedVisitor(prependLead(getTransitionLead("role", roleId), role.intro), roleId),
      delay: 560,
      token
    });
    if (token !== responseToken) return;

    await queueBotReply({
      text: personalizeForNamedVisitor(role.prompt, roleId),
      delay: 420,
      token,
      inlineOptions: getTopicOptions(role),
      cards: getRoleSummaryCards(roleId)
    });
    if (token !== responseToken) return;

    setOptions([], "");
  };

  const continueStudentAfterUniversity = async () => {
    responseToken += 1;
    const token = responseToken;
    clearTypingIndicator();
    helpBotState.pendingInputKind = "";
    helpBotState.studentUniversityCandidate = null;
    persistHelpBotState();
    hideComposer();

    await continueRoleFlow("student", token);
  };

  const promptStudentNameContinue = async (token = responseToken) => {
    const visitorName = getVisitorName();
    await queueBotReply({
      text: config.askNameContinuePrompt(visitorName),
      delay: 360,
      token,
      inlineOptions: getStudentNameContinueOptions()
    });
  };

  const handleStudentNameContinue = async (decisionId) => {
    if (decisionId === "restart") {
      appendMessage({ sender: "user", text: config.askNameContinueRestart });
      responseToken += 1;
      const token = responseToken;
      clearTypingIndicator();
      await queueBotReply({
        text: config.askNameRestarting,
        delay: 320,
        token
      });
      if (token !== responseToken) return;
      await wait(720);
      if (token !== responseToken) return;
      resetConversation();
      return;
    }

    appendMessage({ sender: "user", text: config.askNameContinueYes });
    responseToken += 1;
    const token = responseToken;
    clearTypingIndicator();
    await continueRoleFlow("student", token);
  };

  const handleStudentBossName = async (decisionId) => {
    const visitorName = getVisitorName();
    if (!visitorName) return;

    if (decisionId === "retype") {
      appendMessage({ sender: "user", text: config.askNameBossRetype });
      responseToken += 1;
      const token = responseToken;
      clearTypingIndicator();
      helpBotState.visitorName = "";
      helpBotState.pendingInputKind = "visitor-name";
      persistHelpBotState();
      hideComposer();
      await queueBotReply({
        text: config.askNameBossRetypePrompt,
        delay: 320,
        token,
        inlineOptions: withEndChatOption([])
      });
      if (token !== responseToken) return;
      showComposer();
      return;
    }

    appendMessage({ sender: "user", text: config.askNameBossYes });
    responseToken += 1;
    const token = responseToken;
    clearTypingIndicator();
    await queueBotReply({
      text: config.askNameGreeting(visitorName),
      delay: 380,
      token
    });
    if (token !== responseToken) return;
    await promptForStudentUniversity(token);
  };

  const confirmStudentUniversity = async (decisionId) => {
    const candidate = normalizeHelpBotUniversityCandidate(helpBotState.studentUniversityCandidate);
    if (!candidate) return;

    responseToken += 1;
    const token = responseToken;
    clearTypingIndicator();
    setOptions([], "");

    if (decisionId === "retype") {
      appendMessage({ sender: "user", text: config.askUniversityConfirmRetype });
      helpBotState.studentUniversityCandidate = null;
      helpBotState.pendingInputKind = "student-university";
      persistHelpBotState();
      await queueBotReply({
        text: config.askUniversityRetype,
        delay: 340,
        token
      });
      if (token !== responseToken) return;
      setStaticCopy();
      showComposer();
      return;
    }

    appendMessage({ sender: "user", text: config.askUniversityConfirmYes });
    helpBotState.studentUniversity = candidate.canonical;
    helpBotState.studentUniversityCandidate = null;
    helpBotState.pendingInputKind = "";
    persistHelpBotState();
    await queueBotReply({
      text: candidate.matchType === "deggendorf"
        ? config.askUniversitySameMatch(getVisitorName())
        : candidate.matchType === "ktu"
          ? config.askUniversityKtuMatch(getVisitorName())
          : config.askUniversitySaved(getVisitorName(), candidate.canonical),
      delay: 420,
      token
    });
    if (token !== responseToken) return;
    await promptStudentNameContinue(token);
  };

  const resetConversation = async () => {
    if (helpBotState.messages.length >= 2 && (currentRoleId || hasConversationBooted)) {
      queueHelpBotRemoteSessionSync({ immediate: true, endedAt: new Date().toISOString() });
    }
    responseToken += 1;
    const token = responseToken;
    hasConversationBooted = true;
    currentLang = resolveInitialLanguage();
    config = getPortfolioHelpBotConfig(currentLang);
    currentRoleId = "";
    helpBotState.visitorName = "";
    helpBotState.visitorPosition = "";
    helpBotState.visitorOrganization = "";
    helpBotState.studentUniversity = "";
    helpBotState.studentUniversityCandidate = null;
    helpBotState.remoteSessionId = "";
    helpBotState.remoteSessionPersisted = false;
    helpBotState.websiteSearchQuery = "";
    helpBotState.websiteSearchAttempts = 0;
    helpBotState.websiteSearchResult = null;
    helpBotState.websiteSearchResults = [];
    clearChatFeedbackDraft();
    clearRecruiterRequestDraft();
    helpBotState.pendingInputKind = "";
    helpBotState.pendingTopicId = "";
    helpBotState.pendingTourStepId = "";
    setStaticCopy();
    clearTypingIndicator();
    hideComposer();
    messages.innerHTML = "";
    helpBotState.messages = [];
    helpBotState.topicTrail = [];
    helpBotState.pendingResumePrompt = false;
    helpBotState.lastNavTarget = null;
    persistHelpBotState();
    setOptions([], "");
    await queueBotReply({ text: config.welcome, delay: 420, token });
    if (token !== responseToken) return;
    await queueBotReply({
      text: config.roleQuestion,
      delay: 520,
      token,
      inlineOptions: getRoleOptions()
    });
    if (token !== responseToken) return;
    setOptions([], "");
  };

  const selectRole = async (roleId) => {
    const role = config.roles[roleId];
    if (!role) return;

    responseToken += 1;
    const token = responseToken;
    clearTypingIndicator();
    currentRoleId = roleId;
    clearChatFeedbackDraft();
    helpBotState.studentUniversityCandidate = null;
    helpBotState.pendingInputKind = "";
    helpBotState.pendingTopicId = "";
    helpBotState.pendingTourStepId = "";
    persistHelpBotState();
    appendMessage({ sender: "user", text: role.label });
    setOptions([], "");
    if (roleId === "visitor") {
      if (helpBotState.visitorName || helpBotState.visitorPosition || helpBotState.visitorOrganization) {
        await continueRoleFlow(roleId, token);
      } else {
        await promptVisitorProfileConsent(token);
      }
      if (token !== responseToken) return;
    } else if (roleNeedsNamePrompt(roleId) && !helpBotState.visitorName) {
      await promptForVisitorName(roleId, token);
      if (token !== responseToken) return;
    } else if (roleId === "student" && !getStudentUniversity()) {
      await queueBotReply({
        text: config.askNameGreeting(getVisitorName()),
        delay: 420,
        token
      });
      if (token !== responseToken) return;
      await promptForStudentUniversity(token);
      if (token !== responseToken) return;
    } else {
      await continueRoleFlow(roleId, token);
      if (token !== responseToken) return;
    }

    trackAnalyticsEvent("help_bot_role_selected", {
      page_path: window.location.pathname,
      lang: currentLang,
      role: roleId
    });
  };

  const openQuickPath = async () => {
    if (currentRoleId !== "recruiter" && currentRoleId !== "hiringManager") return;

    responseToken += 1;
    const token = responseToken;
    clearTypingIndicator();
    helpBotState.pendingTopicId = "quick";
    persistHelpBotState();
    appendMessage({ sender: "user", text: getQuickPathOption(currentRoleId)?.label || "" });
    setOptions([], "");
    const quickCopy = getQuickPathCopy(currentRoleId);
    await queueBotReply({
      text: prependLead(getTransitionLead("quick", currentRoleId), quickCopy.response),
      actions: quickCopy.actions.map((action, index) => ({
        ...action,
        badge: action.badge || (index === 0 ? (currentLang === "de" ? "Schnellster Start" : "Fastest start") : "")
      })),
      delay: 540,
      token,
      cards: getRoleSummaryCards(currentRoleId)
    });
    if (token !== responseToken) return;
    const deepCopy = getTopicDeeperCopy(currentRoleId, "quick");
    await queueBotReply({
      text: deepCopy.prompt,
      delay: 420,
      token,
      inlineOptions: getTopicPromptOptions()
    });
    if (token !== responseToken) return;
    setOptions([], "");

    trackAnalyticsEvent("help_bot_quick_path_selected", {
      page_path: window.location.pathname,
      lang: currentLang,
      role: currentRoleId
    });
  };

  const getNextRecruiterRequestField = (draft) => {
    if (!draft.type) return "";
    if (draft.type === "contact") {
      if (!draft.fullName) return "fullName";
      if (!draft.email) return "email";
      if (!draft.country) return "country";
      if (!draft.message) return "message";
      return "";
    }
    if (!draft.email) return "email";
    return "";
  };

  const promptRecruiterRequestField = async (field, token = responseToken) => {
    const draft = getRecruiterRequestDraft();
    if (!draft.type || !field) return;
    helpBotState.pendingInputKind = "recruiter-request";
    helpBotState.recruiterRequestDraft = { ...draft, field };
    persistHelpBotState();
    setStaticCopy();
    let text = config.recruiterContactNamePrompt;
    if (field === "email") {
      text = draft.type === "cv" ? config.recruiterCvEmailPrompt : config.recruiterContactEmailPrompt;
    } else if (field === "country") {
      text = config.recruiterContactCountryPrompt;
    } else if (field === "message") {
      text = config.recruiterContactMessagePrompt;
    }
    await queueBotReply({
      text,
      delay: 360,
      token,
      inlineOptions: withEndChatOption([])
    });
    if (token !== responseToken) return;
    showComposer();
  };

  const beginRecruiterRequestFlow = async (type, seed = {}, token = responseToken) => {
    const nextDraft = normalizeHelpBotRecruiterRequestDraft({
      type,
      fullName: seed.fullName || "",
      email: seed.email || "",
      country: seed.country || "",
      message: seed.message || "",
      company: seed.company || "",
      role: seed.role || (currentRoleId === "recruiter" ? "Recruiter" : ""),
      note: seed.note || ""
    });
    helpBotState.recruiterRequestDraft = nextDraft;
    persistHelpBotState();
    hideComposer();
    const nextField = getNextRecruiterRequestField(nextDraft);
    if (!nextField) return;
    await promptRecruiterRequestField(nextField, token);
  };

  const submitRecruiterContactRequest = async () => {
    const draft = getRecruiterRequestDraft();
    if (!draft.fullName || !draft.email || !draft.country || !draft.message) return false;

    responseToken += 1;
    const token = responseToken;
    clearTypingIndicator();
    hideComposer({ clearValue: false });
    showTypingIndicator();

    const lang = currentLang === "de" ? "de" : "en";
    const template = FEEDBACK_MAIL_TEMPLATES[lang] || FEEDBACK_MAIL_TEMPLATES.en;
    const submittedAt = new Date().toISOString();
    const submissionId = createClientUuid();
    const lines = [
      template.greeting,
      "",
      template.intros?.contact || "",
      "",
      `${lang === "de" ? "Quelle" : "Source"}: ${lang === "de" ? "AI Assistant Chat" : "AI Assistant chat"}`,
      `${template.labels.name}: ${draft.fullName}`,
      `${template.labels.email}: ${draft.email}`,
      `${template.labels.country}: ${draft.country}`,
      `${template.labels.role}: ${draft.role || "Recruiter"}`,
      "",
      `${lang === "de" ? "Nachricht" : "Message"}:`,
      draft.message,
      "",
      template.closing,
      draft.fullName
    ];

    const requestBody = new FormData();
    requestBody.set("access_key", WEB3FORMS_ACCESS_KEY);
    requestBody.set("subject", template.subjects?.contact || "Contact request from your portfolio website");
    requestBody.set("from_name", "Sooraj Sudhakaran Portfolio");
    requestBody.set("replyto", draft.email);
    requestBody.set("message", lines.join("\r\n"));
    requestBody.set("botcheck", "");

    try {
      const response = await fetch(WEB3FORMS_ENDPOINT, {
        method: "POST",
        body: requestBody,
        headers: { Accept: "application/json" }
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || result?.success === false) throw new Error(result?.message || "Submission failed");

      await recordSharedSubmissionEvent({
        id: submissionId,
        type: "contact",
        country: draft.country,
        submittedAt,
        subject: lang === "de" ? "Kontaktanfrage" : "Contact request"
      });
      sessionStorage.setItem(STORAGE_FEEDBACK_LAST_SUBMISSION_KEY, JSON.stringify({ type: "contact", submittedAt }));
      persistRecentSubmission({ type: "contact", submittedAt });
      clearTypingIndicator();
      helpBotState.recruiterRequestDraft = normalizeHelpBotRecruiterRequestDraft({
        type: "cv",
        fullName: draft.fullName,
        email: draft.email,
        country: draft.country,
        company: draft.company,
        role: draft.role || "Recruiter"
      });
      helpBotState.pendingInputKind = "";
      persistHelpBotState();
      await queueBotReply({
        text: config.recruiterContactSuccess(draft.fullName),
        delay: 320,
        token
      });
      if (token !== responseToken) return true;
      await queueBotReply({
        text: `${config.recruiterUsingSameEmailForCv}\n${config.recruiterContactAskCvAfter}`,
        delay: 360,
        token,
        inlineOptions: getRecruiterFollowupOptions("cv")
      });
      return true;
    } catch {
      clearTypingIndicator();
      helpBotState.pendingInputKind = "";
      persistHelpBotState();
      await queueBotReply({
        text: config.recruiterSubmissionError,
        delay: 320,
        token,
        inlineOptions: withEndChatOption([])
      });
      return false;
    }
  };

  const submitRecruiterCvRequest = async () => {
    const draft = getRecruiterRequestDraft();
    if (!draft.email) return false;

    responseToken += 1;
    const token = responseToken;
    clearTypingIndicator();
    hideComposer({ clearValue: false });
    showTypingIndicator();

    const lang = currentLang === "de" ? "de" : "en";
    const submittedAt = new Date().toISOString();
    const subject = lang === "de" ? "Neue CV-Anfrage ueber die Portfolio-Website" : "New CV request from the portfolio website";
    const lines = [
      lang === "de" ? "Hallo Sooraj Sudhakaran," : "Hello Sooraj Sudhakaran,",
      "",
      lang === "de"
        ? "eine Besucherin oder ein Besucher Ihres AI Assistant Chats hat Ihren CV angefragt."
        : "A visitor requested your CV through the AI Assistant chat.",
      "",
      `${lang === "de" ? "Anfragetyp" : "Request type"}: ${lang === "de" ? "CV-Anfrage" : "CV request"}`,
      `${lang === "de" ? "E-Mail" : "Email"}: ${draft.email}`
    ];
    if (draft.fullName) lines.push(`${lang === "de" ? "Name" : "Name"}: ${draft.fullName}`);
    if (draft.country) lines.push(`${lang === "de" ? "Land" : "Country"}: ${draft.country}`);
    if (draft.role) lines.push(`${lang === "de" ? "Rolle" : "Role"}: ${draft.role}`);
    lines.push("", lang === "de"
      ? "Der angeforderte CV soll an die oben genannte E-Mail-Adresse gesendet werden."
      : "The requested CV should be sent to the email address above.");

    const requestBody = new FormData();
    requestBody.set("access_key", WEB3FORMS_ACCESS_KEY);
    requestBody.set("subject", subject);
    requestBody.set("from_name", "Sooraj Sudhakaran Portfolio");
    requestBody.set("replyto", draft.email);
    requestBody.set("message", lines.join("\r\n"));
    requestBody.set("botcheck", "");

    try {
      const response = await fetch(WEB3FORMS_ENDPOINT, {
        method: "POST",
        body: requestBody,
        headers: { Accept: "application/json" }
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || result?.success === false) throw new Error(result?.message || "Submission failed");

      await recordSharedSubmissionEvent({
        id: createClientUuid(),
        type: "cv",
        country: draft.country,
        submittedAt,
        subject: lang === "de" ? "CV-Anfrage" : "CV request"
      });
      sessionStorage.setItem(STORAGE_FEEDBACK_LAST_SUBMISSION_KEY, JSON.stringify({ type: "cv", submittedAt }));
      persistRecentSubmission({ type: "cv", submittedAt });
      clearTypingIndicator();
      helpBotState.recruiterRequestDraft = normalizeHelpBotRecruiterRequestDraft({
        type: "contact",
        fullName: draft.fullName,
        email: draft.email,
        country: draft.country,
        role: draft.role || "Recruiter"
      });
      helpBotState.pendingInputKind = "";
      persistHelpBotState();
      await queueBotReply({
        text: config.recruiterCvSuccess(draft.fullName),
        delay: 320,
        token
      });
      if (token !== responseToken) return true;
      await queueBotReply({
        text: config.recruiterCvAskContactAfter,
        delay: 360,
        token,
        inlineOptions: getRecruiterFollowupOptions("contact")
      });
      return true;
    } catch {
      clearTypingIndicator();
      helpBotState.pendingInputKind = "";
      persistHelpBotState();
      await queueBotReply({
        text: config.recruiterSubmissionError,
        delay: 320,
        token,
        inlineOptions: withEndChatOption([])
      });
      return false;
    }
  };

  const startRecruiterContactCvFlow = async (token = responseToken) => {
    clearRecruiterRequestDraft();
    persistHelpBotState();
    hideComposer();
    await queueBotReply({
      text: config.recruiterContactPrompt,
      delay: 360,
      token,
      inlineOptions: getRecruiterContactCvOptions()
    });
  };

  const handleRecruiterIntakeChoice = async (choiceId) => {
    appendMessage({ sender: "user", text: choiceId === "cv" ? config.recruiterContactChooseCv : config.recruiterContactChooseContact });
    responseToken += 1;
    const token = responseToken;
    clearTypingIndicator();
    await beginRecruiterRequestFlow(choiceId === "cv" ? "cv" : "contact", {}, token);
  };

  const handleRecruiterIntakeFollowup = async (choiceId) => {
    if (choiceId === "finish") {
      appendMessage({ sender: "user", text: config.recruiterFollowupNo });
      await finishChatWithFarewell(getNamedFarewellText(config.feedbackSkipFarewell));
      return;
    }
    appendMessage({ sender: "user", text: choiceId === "cv" ? config.recruiterFollowupYesCv : config.recruiterFollowupYesContact });
    responseToken += 1;
    const token = responseToken;
    clearTypingIndicator();
    const seed = getRecruiterRequestDraft();
    if (choiceId === "cv" && seed.email) {
      await queueBotReply({
        text: config.recruiterUsingSameEmailForCv,
        delay: 280,
        token
      });
      if (token !== responseToken) return;
      await submitRecruiterCvRequest();
      return;
    }
    await beginRecruiterRequestFlow(choiceId === "cv" ? "cv" : "contact", seed, token);
  };

  const startWebsiteSearchFlow = async (token = responseToken, { retry = false } = {}) => {
    helpBotState.pendingInputKind = "website-search";
    helpBotState.websiteSearchResult = null;
    helpBotState.websiteSearchResults = [];
    persistHelpBotState();
    hideComposer();
    await queueBotReply({
      text: retry
        ? (helpBotState.websiteSearchAttempts >= 2 ? config.searchWebsiteDeepRetryPrompt : config.searchWebsiteRetryPrompt)
        : config.searchWebsitePrompt,
      delay: 320,
      token,
      inlineOptions: withEndChatOption([])
    });
    if (token !== responseToken) return;
    showComposer();
  };

  const answerWebsiteQuestion = async (result, token = responseToken) => {
    const answer = getWebsiteQuestionAnswerEntry(result?.answerId) || getWebsiteQuestionAnswer(result?.label || "");
    if (!answer) return false;
    helpBotState.websiteSearchResult = result && typeof result === "object" ? result : null;
    helpBotState.websiteSearchResults = [];
    helpBotState.pendingInputKind = "website-search";
    persistHelpBotState();
    await queueBotReply({
      text: answer.text,
      actions: answer.actions,
      delay: 260,
      token,
      inlineOptions: withEndChatOption([])
    });
    if (token !== responseToken) return true;
    setStaticCopy();
    showComposer();
    return true;
  };

  const runWebsiteSearch = async (query) => {
    responseToken += 1;
    const token = responseToken;
    clearTypingIndicator();
    hideComposer({ clearValue: false });
    const previousAttempts = Number(helpBotState.websiteSearchAttempts || 0);
    const nextAttempts = previousAttempts + 1;
    helpBotState.pendingInputKind = "";
    helpBotState.websiteSearchQuery = String(query || "").trim();
    helpBotState.websiteSearchAttempts = nextAttempts;
    persistHelpBotState();
    appendMessage({ sender: "user", text: query });

    showTypingIndicator();
    await wait(nextAttempts >= 2 ? 1250 : 850);
    if (token !== responseToken) return;
    clearTypingIndicator();

    const isQuestionSearch = looksLikeQuestionSearch(query);
    const useExpandedSearch = isQuestionSearch || nextAttempts >= 2;

    if (isQuestionSearch) {
      const questionMatches = await findWebsiteQuestionMatches(query, { deep: useExpandedSearch });
      if (token !== responseToken) return;
      if (questionMatches.length) {
        helpBotState.websiteSearchResults = questionMatches.map((entry) => ({
          kind: "question",
          label: entry.label,
          answerId: entry.answerId,
          target: null
        }));
        helpBotState.websiteSearchResult = questionMatches[0]
          ? {
              kind: "question",
              label: questionMatches[0].label,
              answerId: questionMatches[0].answerId,
              target: null
            }
          : null;
        persistHelpBotState();
        if (questionMatches.length > 1) {
          await queueBotReply({
            text: nextAttempts >= 2
              ? `${config.searchWebsiteDeepSearching}\n${config.searchWebsiteQuestionFoundMultiple}`
              : config.searchWebsiteQuestionFoundMultiple,
            delay: 260,
            token,
            inlineOptions: getWebsiteSearchMatchOptions()
          });
          return;
        }
        await queueBotReply({
          text: nextAttempts >= 2
            ? `${config.searchWebsiteDeepSearching}\n${config.searchWebsiteQuestionFound(questionMatches[0].label)}`
            : config.searchWebsiteQuestionFound(questionMatches[0].label),
          delay: 260,
          token,
          inlineOptions: getWebsiteSearchResultOptions()
        });
        return;
      }
    }

    const answer = getWebsiteQuestionAnswer(query);
    if (answer) {
      helpBotState.websiteSearchResult = null;
      helpBotState.websiteSearchResults = [];
      helpBotState.pendingInputKind = "website-search";
      persistHelpBotState();
      await queueBotReply({
        text: answer.text,
        actions: answer.actions,
        delay: 260,
        token,
        inlineOptions: withEndChatOption([])
      });
      if (token !== responseToken) return;
      setStaticCopy();
      showComposer();
      return;
    }

    const matches = findWebsiteSearchMatches(query, { deep: useExpandedSearch });
    if (matches.length) {
      helpBotState.websiteSearchResults = matches.map((entry) => ({ label: entry.label, target: entry.target }));
      helpBotState.websiteSearchResult = matches[0] ? { label: matches[0].label, target: matches[0].target } : null;
      persistHelpBotState();
      if (matches.length > 1) {
        await queueBotReply({
          text: nextAttempts >= 2
            ? `${config.searchWebsiteDeepSearching}\n${config.searchWebsiteFoundMultiple}`
            : config.searchWebsiteFoundMultiple,
          delay: 260,
          token,
          inlineOptions: getWebsiteSearchMatchOptions()
        });
        return;
      }
      await queueBotReply({
        text: nextAttempts >= 2
          ? `${config.searchWebsiteDeepSearching}\n${config.searchWebsiteFound(matches[0].label)}`
          : config.searchWebsiteFound(matches[0].label),
        delay: 260,
        token,
        inlineOptions: getWebsiteSearchResultOptions()
      });
      return;
    }

    helpBotState.websiteSearchResult = null;
    helpBotState.websiteSearchResults = [];
    persistHelpBotState();
    if (nextAttempts >= HELP_BOT_QUESTION_RETRY_LIMIT) {
      await queueBotReply({
        text: config.searchWebsiteNoResult,
        delay: 260,
        token,
        inlineOptions: getWebsiteSearchFallbackOptions()
      });
      return;
    }

    await startWebsiteSearchFlow(token, { retry: true });
  };

  const handleWebsiteSearchResult = async (decisionId) => {
    const result = helpBotState.websiteSearchResult;
    if (!result) return;
    const isQuestionResult = result.kind === "question";
    appendMessage({
      sender: "user",
      text: decisionId === "open"
        ? (isQuestionResult ? config.searchWebsiteAnswerYes : config.searchWebsiteOpenYes)
        : (isQuestionResult ? config.searchWebsiteAnswerNo : config.searchWebsiteOpenNo)
    });
    if (decisionId === "open") {
      if (isQuestionResult) {
        responseToken += 1;
        const token = responseToken;
        clearTypingIndicator();
        await answerWebsiteQuestion(result, token);
        return;
      }
      if (!result?.target) return;
      helpBotState.lastNavTarget = result.target;
      persistHelpBotState();
      navigateHelpBotTarget(result.target, () => setOpen(false));
      return;
    }
    responseToken += 1;
    const token = responseToken;
    clearTypingIndicator();
    helpBotState.websiteSearchAttempts = Math.min(HELP_BOT_QUESTION_RETRY_LIMIT, Number(helpBotState.websiteSearchAttempts || 0) + 1);
    persistHelpBotState();
    if (helpBotState.websiteSearchAttempts >= HELP_BOT_QUESTION_RETRY_LIMIT) {
      await queueBotReply({
        text: config.searchWebsiteNoResult,
        delay: 260,
        token,
        inlineOptions: getWebsiteSearchFallbackOptions()
      });
      return;
    }
    await startWebsiteSearchFlow(token, { retry: true });
  };

  const handleWebsiteSearchMatch = async (matchId) => {
    const matches = Array.isArray(helpBotState.websiteSearchResults) ? helpBotState.websiteSearchResults : [];
    const result = matches[Number(matchId)];
    if (!result) return;
    appendMessage({ sender: "user", text: result.label });
    helpBotState.websiteSearchResult = result;
    persistHelpBotState();
    if (result.kind === "question") {
      responseToken += 1;
      const token = responseToken;
      clearTypingIndicator();
      await answerWebsiteQuestion(result, token);
      return;
    }
    if (!result?.target) return;
    helpBotState.lastNavTarget = result.target;
    persistHelpBotState();
    navigateHelpBotTarget(result.target, () => setOpen(false));
  };

  const handleWebsiteSearchFallback = async (choiceId) => {
    appendMessage({
      sender: "user",
      text: choiceId === "contact"
        ? config.searchWebsiteContact
        : choiceId === "retry"
          ? config.searchWebsiteAskAgain
          : config.searchWebsiteMainMenu
    });
    if (choiceId === "contact") {
      responseToken += 1;
      const token = responseToken;
      clearTypingIndicator();
      await beginRecruiterRequestFlow("contact", {
        fullName: getVisitorName(),
        role: currentRoleId === "recruiter" ? "Recruiter" : currentRoleId === "student" ? "Student" : "Visitor",
        message: (currentLang === "de"
          ? `Frage aus dem AI Assistant Chat:\n${helpBotState.websiteSearchQuery || ""}\n\nBitte helfen Sie mir bei dieser Frage.`
          : `Question from the AI Assistant chat:\n${helpBotState.websiteSearchQuery || ""}\n\nPlease help me with this question.`)
      }, token);
      return;
    }
    if (choiceId === "retry") {
      responseToken += 1;
      const token = responseToken;
      clearTypingIndicator();
      helpBotState.websiteSearchAttempts = 0;
      helpBotState.websiteSearchResult = null;
      helpBotState.websiteSearchResults = [];
      persistHelpBotState();
      await startWebsiteSearchFlow(token, { retry: true });
      return;
    }
    responseToken += 1;
    const token = responseToken;
    clearTypingIndicator();
    await queueBotReply({
      text: currentLang === "de"
        ? "Gerne. Ich bringe Sie direkt zur Hauptauswahl zurueck. Dort kann ich gezielter weiterhelfen."
        : "Sure. I’ll take you straight back to the main menu. I can guide you more clearly from there.",
      delay: 280,
      token
    });
    if (token !== responseToken) return;
    resetConversation();
  };

  const selectTopic = async (topicId) => {
    const role = config.roles[currentRoleId];
    const topic = role?.topics.find((entry) => entry.id === topicId);
    if (!topic) return;

    responseToken += 1;
    const token = responseToken;
    clearTypingIndicator();
    helpBotState.pendingTopicId = topic.id;
    recordTopicTrail(currentRoleId, topic);
    persistHelpBotState();
    appendMessage({ sender: "user", text: topic.label });
    setOptions([], "");
    if (currentRoleId === "recruiter" && topic.id === "contact") {
      await startRecruiterContactCvFlow(token);
      return;
    }
    const confidence = getTopicConfidenceLine(currentRoleId, topic.id);
    const milestone = getRoleMilestoneSummary(currentRoleId);
    const composedTopicText = [
      prependLead(getTransitionLead("topic", currentRoleId), topic.response),
      confidence,
      milestone?.text || ""
    ].filter(Boolean).join("\n");
    await queueBotReply({
      text: roleUsesVisitorName(currentRoleId) ? personalizeForNamedVisitor(composedTopicText) : composedTopicText,
      delay: 520,
      token
    });
    if (token !== responseToken) return;
    await queueBotReply({
      text: getTopicDecisionPromptText(),
      delay: 380,
      token,
      inlineOptions: getTopicDecisionOptions()
    });
    if (token !== responseToken) return;
    setOptions([], "");

    trackAnalyticsEvent("help_bot_topic_selected", {
      page_path: window.location.pathname,
      lang: currentLang,
      role: currentRoleId,
      topic: topicId
    });
  };

  const explainTopicMore = async () => {
    const role = config.roles[currentRoleId];
    const topic = helpBotState.pendingTopicId === "quick"
      ? {
          id: "quick",
          label: getQuickPathOption(currentRoleId)?.label || "",
          actions: getQuickPathCopy(currentRoleId).actions
        }
      : role?.topics.find((entry) => entry.id === helpBotState.pendingTopicId);
    if (!topic) return;

    responseToken += 1;
    const token = responseToken;
    clearTypingIndicator();
    const deepCopy = getTopicDeeperCopy(currentRoleId, topic.id);
    appendMessage({ sender: "user", text: deepCopy.explainMore });
    setOptions([], "");
    await queueBotReply({
      text: `${deepCopy.detail}\n${currentLang === "de" ? "Wenn Sie die komplette Seite oeffnen moechten, waehlen Sie unten den passenden Detailweg. Danach kann ich den naechsten sinnvollen Bereich direkt weiterfuehren." : "If you would like the full page, use one of the detail paths below. After that, I can keep routing you to the strongest next area."}`,
      actions: topic.actions.map((action, index) => ({
        ...action,
        badge: action.badge || (index === 0 ? (currentLang === "de" ? "Empfohlen" : "Recommended") : "")
      })),
      delay: 560,
      token,
      inlineOptions: withEndChatOption(dedupeHelpBotOptions([
        ...((currentRoleId === "recruiter" || currentRoleId === "hiringManager") && (topic.id === "fit" || topic.id === "quick")
          ? [{ ...getRoleFitStartOption(), badge: currentLang === "de" ? "Smart" : "Smart" }]
          : []),
        ...(topic.id === "reviews" ? [getReviewPathStartOption()] : []),
        ...getSuggestedTopicOptions(currentRoleId, topic.id),
        getTourStartOption(),
        createBadgedOption("topic-other", "topic-other", deepCopy.otherTopics, currentLang === "de" ? "Wechseln" : "Switch")
      ]))
    });
  };

  const openPendingTopicDetails = () => {
    const topic = getPendingTopic();
    const primaryAction = getTopicPrimaryAction(topic);
    if (!topic || !primaryAction?.target) return;

    appendMessage({
      sender: "user",
      text: currentLang === "de" ? "Ja, Details oeffnen" : "Yes, open details"
    });
    helpBotState.lastNavTarget = primaryAction.target;
    persistHelpBotState();
    trackAnalyticsEvent("help_bot_topic_detail_opened", {
      page_path: window.location.pathname,
      lang: currentLang,
      role: currentRoleId,
      topic: topic.id
    });
    navigateHelpBotTarget(primaryAction.target, () => setOpen(false));
  };

  const continueAfterTopicOverview = async () => {
    const topic = getPendingTopic();
    if (!topic) return;
    const deepCopy = getTopicDeeperCopy(currentRoleId, topic.id);
    const overviewText = roleUsesVisitorName(currentRoleId)
      ? personalizeForNamedVisitor(deepCopy.detail)
      : deepCopy.detail;

    responseToken += 1;
    const token = responseToken;
    clearTypingIndicator();
    appendMessage({
      sender: "user",
      text: currentLang === "de" ? "Nein, im Chat bleiben" : "No, continue here"
    });
    setOptions([], "");
    await queueBotReply({
      text: overviewText,
      delay: 420,
      token,
      actions: topic.actions.slice(0, 2).map((action, index) => ({
        ...action,
        badge: action.badge || (index === 0 ? (currentLang === "de" ? "Start hier" : "Start here") : "")
      }))
    });
    if (token !== responseToken) return;
    await queueBotReply({
      text: roleUsesVisitorName(currentRoleId)
        ? personalizeForNamedVisitor(getTopicStayPromptText(currentRoleId, topic.id))
        : getTopicStayPromptText(currentRoleId, topic.id),
      delay: 360,
      token,
      inlineOptions: getTopicStayPromptOptions(currentRoleId, topic.id)
    });
  };

  const showOtherTopics = async () => {
    const role = config.roles[currentRoleId];
    if (!role) return;

    responseToken += 1;
    const token = responseToken;
    clearTypingIndicator();
    const deepCopy = getTopicDeeperCopy(currentRoleId, helpBotState.pendingTopicId);
    appendMessage({ sender: "user", text: deepCopy.otherTopics });
    setOptions([], "");
    await queueBotReply({
      text: prependLead(getTransitionLead("continue", currentRoleId), currentLang === "de"
        ? "Gerne. Waehlen Sie den naechsten Bereich, den ich erklaeren soll."
        : "Sure. Choose the next area you want me to explain."),
      delay: 420,
      token,
      inlineOptions: getTopicOptions(role)
    });
  };

  const continueConversation = async () => {
    responseToken += 1;
    const token = responseToken;
    clearTypingIndicator();
    appendMessage({ sender: "user", text: config.continueChat });
    setOptions([], "");
    const followUp = getResumeFollowUp();
    await queueBotReply({
      text: roleUsesVisitorName(currentRoleId)
        ? personalizeForNamedVisitor(prependLead(getTransitionLead("continue", currentRoleId), followUp.text))
        : prependLead(getTransitionLead("continue", currentRoleId), followUp.text),
      actions: followUp.actions,
      delay: 540,
      token,
      cards: followUp.cards || [],
      inlineOptions: followUp.inlineOptions || withEndChatOption([])
    });
  };

  const startRoleFitFlow = async () => {
    if (currentRoleId !== "recruiter" && currentRoleId !== "hiringManager") return;

    responseToken += 1;
    const token = responseToken;
    clearTypingIndicator();
    appendMessage({ sender: "user", text: getRoleFitStartOption().label });
    setOptions([], "");
    await queueBotReply({
      text: prependLead(getTransitionLead("role", currentRoleId), getRoleFitQuestionText()),
      delay: 420,
      token,
      inlineOptions: getRoleFitChoiceOptions()
    });
  };

  const selectRoleFit = async (fitId) => {
    if (!fitId) return;

    responseToken += 1;
    const token = responseToken;
    clearTypingIndicator();
    const fitCopy = getRoleFitResponse(fitId);
    appendMessage({ sender: "user", text: fitCopy.label });
    setOptions([], "");
    await queueBotReply({
      text: `${fitCopy.text}\n${currentLang === "de" ? "Wenn diese Rolle gut passt, fuehren CV, Kontakt oder ein weiterer Nachweis als naechster Schritt am besten weiter." : "If this role looks relevant, the cleanest next step is CV, contact, or one more proof page."}`,
      actions: fitCopy.actions,
      delay: 520,
      token,
      inlineOptions: withEndChatOption(dedupeHelpBotOptions([
        createTopicOption(currentRoleId, currentRoleId === "recruiter" ? "projects" : "proof"),
        createTopicOption(currentRoleId, "reviews"),
        createTopicOption(currentRoleId, "contact"),
        getQuickPathOption(currentRoleId),
        getTourStartOption()
      ]))
    });

    trackAnalyticsEvent("help_bot_role_fit_selected", {
      page_path: window.location.pathname,
      lang: currentLang,
      role: currentRoleId,
      fit: fitId
    });
  };

  const startPortfolioTour = async () => {
    responseToken += 1;
    const token = responseToken;
    clearTypingIndicator();
    appendMessage({ sender: "user", text: getTourStartOption().label });
    setOptions([], "");
    const steps = getTourSteps();
    const firstStep = steps[0];
    if (!firstStep) return;
    setPendingTourStep(firstStep.id);
    await queueBotReply({
      text: getTourOpeningText(),
      delay: 460,
      token,
      cards: steps.map((step) => ({ badge: step.badge, title: step.label, text: step.text }))
    });
    if (token !== responseToken) return;
    await queueBotReply({
      text: `${firstStep.text}\n${getTourSummaryFollowUpText()}`,
      delay: 420,
      token,
      inlineOptions: getTourSummaryOptions(firstStep.id)
    });

    trackAnalyticsEvent("help_bot_tour_started", {
      page_path: window.location.pathname,
      lang: currentLang,
      role: currentRoleId || "unassigned"
    });
  };

  const selectTourStep = async (stepId) => {
    const step = getTourSteps().find((entry) => entry.id === stepId);
    if (!step) return;

    responseToken += 1;
    const token = responseToken;
    clearTypingIndicator();
    appendMessage({ sender: "user", text: step.label });
    setPendingTourStep(step.id);
    setOptions([], "");
    await queueBotReply({
      text: `${step.text}\n${getTourSummaryFollowUpText()}`,
      delay: 480,
      token,
      inlineOptions: getTourSummaryOptions(step.id)
    });

    trackAnalyticsEvent("help_bot_tour_step_selected", {
      page_path: window.location.pathname,
      lang: currentLang,
      step: stepId
    });
  };

  const startReviewPathFlow = async () => {
    responseToken += 1;
    const token = responseToken;
    clearTypingIndicator();
    appendMessage({ sender: "user", text: getReviewPathStartOption().label });
    setOptions([], "");
    await queueBotReply({
      text: `${getTransitionLead("review", currentRoleId)}\n${currentLang === "de" ? "Welche Review-Ansicht hilft Ihnen gerade am meisten?" : "Which review view would help you most right now?"}`,
      delay: 420,
      token,
      inlineOptions: getReviewPathOptions()
    });

    trackAnalyticsEvent("help_bot_review_paths_opened", {
      page_path: window.location.pathname,
      lang: currentLang,
      role: currentRoleId || "unassigned"
    });
  };

  const selectReviewPath = async (pathId) => {
    const reviewCopy = getReviewPathResponse(pathId);
    if (!reviewCopy) return;

    responseToken += 1;
    const token = responseToken;
    clearTypingIndicator();
    appendMessage({ sender: "user", text: reviewCopy.label });
    setOptions([], "");
    await queueBotReply({
      text: reviewCopy.text,
      actions: reviewCopy.actions,
      delay: 440,
      token,
      inlineOptions: withEndChatOption(dedupeHelpBotOptions([
        getReviewPathStartOption(),
        getTourStartOption(),
        createTopicOption(currentRoleId, "projects"),
        createTopicOption(currentRoleId, "contact")
      ]))
    });

    trackAnalyticsEvent("help_bot_review_path_selected", {
      page_path: window.location.pathname,
      lang: currentLang,
      path: pathId,
      role: currentRoleId || "unassigned"
    });
  };

  const endConversation = ({ showExitNudge = true } = {}) => {
    responseToken += 1;
    clearTypingIndicator();
    hideComposer();
    if (helpBotState.messages.length >= 2 && (currentRoleId || hasConversationBooted)) {
      queueHelpBotRemoteSessionSync({ immediate: true, endedAt: new Date().toISOString() });
    }
    clearHelpBotState();
    if (liveRegion) liveRegion.textContent = "";
    messages.innerHTML = "";
    setOptions([], "");
    setOpen(false);
    setNudgeMessage(showExitNudge ? config.ended : config.nudge);
    if (showExitNudge) {
      showNudge({ delay: 900 });
    }
  };

  root.addEventListener("click", (event) => {
    const optionButton = event.target.closest("[data-help-bot-option-kind]");
    if (optionButton) {
      const kind = optionButton.getAttribute("data-help-bot-option-kind");
      const id = optionButton.getAttribute("data-help-bot-option-id") || "";
      if (kind === "role") {
        selectRole(id);
      } else if (kind === "website-search-start") {
        appendMessage({ sender: "user", text: config.searchWebsiteLabel });
        responseToken += 1;
        const token = responseToken;
        clearTypingIndicator();
        startWebsiteSearchFlow(token);
      } else if (kind === "tour-start") {
        startPortfolioTour();
      } else if (kind === "tour-step") {
        selectTourStep(id);
      } else if (kind === "tour-more") {
        chooseTourStepDetailMode();
      } else if (kind === "tour-open-page") {
        openTourStepPage(id);
      } else if (kind === "tour-explain") {
        explainTourStep(id);
      } else if (kind === "tour-explain-deeper") {
        explainTourStep(id, { deeper: true });
      } else if (kind === "tour-other-topic") {
        showTourOtherTopics();
      } else if (kind === "tour-back-start") {
        appendMessage({ sender: "user", text: currentLang === "de" ? "Zurueck zum Start" : "Back to start" });
        resetConversation();
      } else if (kind === "quick-path") {
        openQuickPath();
      } else if (kind === "topic") {
        selectTopic(id);
      } else if (kind === "topic-detail-open") {
        openPendingTopicDetails();
      } else if (kind === "topic-detail-skip") {
        continueAfterTopicOverview();
      } else if (kind === "topic-more") {
        explainTopicMore();
      } else if (kind === "topic-other") {
        showOtherTopics();
      } else if (kind === "review-path-start") {
        startReviewPathFlow();
      } else if (kind === "review-path") {
        selectReviewPath(id);
      } else if (kind === "feedback-choice") {
        selectFeedbackChoice(id);
      } else if (kind === "feedback-skip-confirm") {
        selectFeedbackSkipConfirm(id);
      } else if (kind === "feedback-student-review-mode") {
        selectFeedbackStudentReviewMode(id);
      } else if (kind === "recruiter-intake-choice") {
        handleRecruiterIntakeChoice(id);
      } else if (kind === "recruiter-intake-followup") {
        handleRecruiterIntakeFollowup(id);
      } else if (kind === "website-search-result") {
        handleWebsiteSearchResult(id);
      } else if (kind === "website-search-match") {
        handleWebsiteSearchMatch(id);
      } else if (kind === "website-search-fallback") {
        handleWebsiteSearchFallback(id);
      } else if (kind === "visitor-profile") {
        handleVisitorProfileChoice(id);
      } else if (kind === "visitor-field-skip") {
        handleVisitorFieldSkip(id);
      } else if (kind === "feedback-rating") {
        selectFeedbackRating(id);
      } else if (kind === "feedback-retry") {
        retryChatFeedbackSubmit();
      } else if (kind === "feedback-edit") {
        editChatFeedbackComments();
      } else if (kind === "role-fit-start") {
        startRoleFitFlow();
      } else if (kind === "role-fit") {
        selectRoleFit(id);
      } else if (kind === "student-university-confirm") {
        confirmStudentUniversity(id);
      } else if (kind === "student-name-confirm") {
        handleStudentNameContinue(id);
      } else if (kind === "student-name-boss") {
        handleStudentBossName(id);
      } else if (kind === "continue-chat") {
        continueConversation();
      } else if (kind === "start-over") {
        appendMessage({ sender: "user", text: config.startFresh });
        resetConversation();
      } else if (kind === "end-chat") {
        appendMessage({ sender: "user", text: config.endChat });
        beginEndChatFlow();
      }
      return;
    }

    const navButton = event.target.closest("[data-help-bot-nav]");
    if (navButton) {
      const targetRaw = navButton.getAttribute("data-help-bot-target") || "";
      try {
        const target = JSON.parse(decodeURIComponent(targetRaw));
        helpBotState.lastNavTarget = target;
        persistHelpBotState();
        trackAnalyticsEvent("help_bot_navigation", {
          page_path: window.location.pathname,
          lang: currentLang,
          role: currentRoleId || "unassigned"
        });
        navigateHelpBotTarget(target, () => setOpen(false));
      } catch {
        // Ignore malformed action payloads without breaking the UI.
      }
      return;
    }

    if (event.target.closest(".help-bot-launcher")) {
      setOpen(!root.classList.contains("is-open"));
      return;
    }

    if (event.target.closest("[data-help-bot-nudge-close]")) {
      hasDismissedNudge = true;
      clearNudgeTimers();
      hideNudge({ scheduleNext: false });
      return;
    }

    if (event.target.closest("[data-help-bot-close]") || event.target.closest(".help-bot-backdrop")) {
      setOpen(false);
      return;
    }

    if (event.target.closest("[data-help-bot-reset]")) {
      resetConversation();
    }
  });

  launcher?.addEventListener("mouseenter", () => {
    if (root.classList.contains("is-open")) return;
    clearNudgeTimers();
    setInlineNudgeOverride("");
    setNudgeMessage(shouldUseStudentCornerNudge() ? getStudentCornerNudgeText() : config.nudge);
    root.classList.add("is-nudge-visible");
    hoverNudgeTimer = window.setTimeout(() => {
      if (!root.classList.contains("is-open")) {
        hideNudge({ scheduleNext: false });
      }
    }, 2600);
  });

  launcher?.addEventListener("mouseleave", () => {
    if (root.classList.contains("is-open")) return;
    window.clearTimeout(hoverNudgeTimer);
    hoverNudgeTimer = 0;
    hideNudge({ scheduleNext: false });
  });

  composerForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const activeComposerField = getActiveComposerField();
    const composerValue = activeComposerField?.value || "";
    clearComposerNote();

    if (helpBotState.pendingInputKind === "visitor-name") {
      const visitorName = normalizeVisitorName(composerValue);
      if (!visitorName) {
        setInlineNudgeOverride(currentLang === "de"
          ? "Hmm... das sieht noch nicht wie ein richtiger Name aus. Geben Sie bitte Ihren korrekten Namen ein 👋"
          : "Hmm... that does not look like a real name yet. Please enter your correct name 👋");
        syncInlineStudentNudge();
        focusComposerInput();
        return;
      }
      if (!isPlausibleVisitorName(visitorName)) {
        setInlineNudgeOverride(currentLang === "de"
          ? "Hmm... ich glaube, das ist noch kein echter Name. Geben Sie bitte Ihren korrekten Namen ein 👋"
          : "Hmm... I know that is not a real name yet. Please enter your correct name 👋");
        syncInlineStudentNudge();
        focusComposerInput();
        return;
      }

      responseToken += 1;
      const token = responseToken;
      clearTypingIndicator();
      setInlineNudgeOverride("");
      helpBotState.visitorName = visitorName;
      helpBotState.pendingInputKind = "";
      persistHelpBotState();
      syncInlineStudentNudge();
      appendMessage({ sender: "user", text: visitorName });
      hideComposer();
      if (currentRoleId === "student") {
        if (isBossLikeVisitorName(visitorName)) {
          await queueBotReply({
            text: config.askNameBossPrompt(visitorName),
            delay: 360,
            token,
            inlineOptions: getStudentBossNameOptions()
          });
          return;
        }
        await queueBotReply({
          text: config.askNameGreeting(visitorName),
          delay: 420,
          token
        });
        if (token !== responseToken) return;
        await promptForStudentUniversity(token);
        return;
      }
      if (currentRoleId === "visitor") {
        await queueBotReply({
          text: currentLang === "de"
            ? `Willkommen ${visitorName} 👋 Ich richte den restlichen Weg jetzt etwas persoenlicher fuer Sie aus.`
            : `Welcome ${visitorName} 👋 I’ll make the rest of the path a bit more personal for you now.`,
          delay: 340,
          token
        });
        if (token !== responseToken) return;
        await promptVisitorProfileField("position", token);
        return;
      }
      await continueRoleFlow(currentRoleId, token, { greetName: visitorName });
      return;
    }

    if (helpBotState.pendingInputKind === "visitor-position") {
      const visitorPosition = normalizeVisitorPosition(composerValue);
      if (!visitorPosition) {
        focusComposerInput();
        return;
      }

      responseToken += 1;
      const token = responseToken;
      clearTypingIndicator();
      helpBotState.visitorPosition = visitorPosition;
      helpBotState.pendingInputKind = "";
      persistHelpBotState();
      appendMessage({ sender: "user", text: visitorPosition });
      hideComposer();
      await promptVisitorProfileField("organization", token);
      return;
    }

    if (helpBotState.pendingInputKind === "recruiter-request") {
      const draft = getRecruiterRequestDraft();
      if (!draft.type || !draft.field) return;

      let normalizedValue = "";
      let errorMessage = "";
      if (draft.field === "fullName") {
        normalizedValue = normalizeFeedbackName(composerValue);
        if (!normalizedValue) errorMessage = config.feedbackInvalidName;
      } else if (draft.field === "email") {
        normalizedValue = normalizeFeedbackEmail(composerValue);
        if (!normalizedValue || !isValidFeedbackEmail(normalizedValue)) errorMessage = config.feedbackInvalidEmail;
      } else if (draft.field === "country") {
        normalizedValue = normalizeFeedbackCountry(composerValue);
        if (!normalizedValue) errorMessage = config.feedbackInvalidCountry;
      } else if (draft.field === "message") {
        normalizedValue = normalizeFeedbackComments(composerValue).slice(0, 800);
        if (!normalizedValue || normalizedValue.length < 12) errorMessage = config.recruiterInvalidMessage;
      }

      if (errorMessage) {
        setComposerNote(errorMessage);
        focusComposerInput();
        return;
      }

      responseToken += 1;
      const token = responseToken;
      clearTypingIndicator();
      helpBotState.recruiterRequestDraft = {
        ...draft,
        [draft.field]: normalizedValue
      };
      helpBotState.pendingInputKind = "";
      persistHelpBotState();
      appendMessage({ sender: "user", text: normalizedValue });
      hideComposer();

      const nextField = getNextRecruiterRequestField(getRecruiterRequestDraft());
      if (nextField) {
        await promptRecruiterRequestField(nextField, token);
        return;
      }

      if (draft.type === "contact") {
        await submitRecruiterContactRequest();
        return;
      }

      await submitRecruiterCvRequest();
      return;
    }

    if (helpBotState.pendingInputKind === "website-search") {
      const query = String(composerValue || "").replace(/\s+/g, " ").trim().slice(0, 120);
      if (!query) {
        focusComposerInput();
        return;
      }
      await runWebsiteSearch(query);
      return;
    }

    if (helpBotState.pendingInputKind === "visitor-organization") {
      const visitorOrganization = normalizeVisitorOrganization(composerValue);
      if (!visitorOrganization) {
        focusComposerInput();
        return;
      }

      responseToken += 1;
      const token = responseToken;
      clearTypingIndicator();
      helpBotState.visitorOrganization = visitorOrganization;
      helpBotState.pendingInputKind = "";
      persistHelpBotState();
      appendMessage({ sender: "user", text: visitorOrganization });
      hideComposer();
      await continueVisitorAfterProfile(token);
      return;
    }

    if (helpBotState.pendingInputKind === "chat-feedback") {
      const draft = getChatFeedbackDraft();
      let normalizedValue = "";
      let errorMessage = "";

      if (draft.field === "name") {
        normalizedValue = normalizeFeedbackName(composerValue);
        if (!normalizedValue) errorMessage = config.feedbackInvalidName;
      } else if (draft.field === "company") {
        normalizedValue = normalizeFeedbackCompany(composerValue);
        if (!normalizedValue) errorMessage = config.feedbackInvalidCompany;
      } else if (draft.field === "email") {
        normalizedValue = normalizeFeedbackEmail(composerValue);
        if (!isValidFeedbackEmail(normalizedValue)) errorMessage = config.feedbackInvalidEmail;
      } else if (draft.field === "country") {
        normalizedValue = normalizeFeedbackCountry(composerValue);
        if (!normalizedValue) errorMessage = config.feedbackInvalidCountry;
      } else if (draft.field === "comments") {
        normalizedValue = normalizeFeedbackComments(composerValue);
        if (normalizedValue.length < 12) errorMessage = config.feedbackInvalidComments;
      }

      if (errorMessage) {
        setComposerNote(errorMessage);
        focusComposerInput();
        return;
      }

      if (!draft.field) return;

      responseToken += 1;
      const token = responseToken;
      clearTypingIndicator();
      helpBotState.chatFeedbackDraft = {
        ...draft,
        [draft.field]: normalizedValue
      };
      helpBotState.pendingInputKind = "";
      persistHelpBotState();
      appendMessage({ sender: "user", text: normalizedValue });
      hideComposer();

      if (draft.field === "name") {
        await promptChatFeedbackField("company", token);
        return;
      }
      if (draft.field === "company") {
        await promptChatFeedbackField("email", token);
        return;
      }
      if (draft.field === "email") {
        await promptChatFeedbackField("country", token);
        return;
      }
      if (draft.field === "country") {
        await promptChatFeedbackRating(token);
        return;
      }
      if (draft.field === "comments") {
        helpBotState.chatFeedbackDraft = {
          ...getChatFeedbackDraft(),
          comments: normalizedValue
        };
        persistHelpBotState();
        await submitChatFeedback();
        return;
      }
      return;
    }

    if (helpBotState.pendingInputKind !== "student-university") return;

    const universityName = normalizeUniversityName(composerValue);
    if (!universityName) {
      focusComposerInput();
      return;
    }

    responseToken += 1;
    const token = responseToken;
    clearTypingIndicator();
    const candidate = inferUniversityCandidate(universityName);
    helpBotState.studentUniversityCandidate = candidate;
    helpBotState.pendingInputKind = "";
    persistHelpBotState();
    appendMessage({ sender: "user", text: universityName });
    hideComposer();
    await queueBotReply({
      text: getUniversityConfirmPrompt(candidate),
      delay: 420,
      token,
      inlineOptions: getUniversityConfirmOptions()
    });
  });

  document.addEventListener("keydown", (event) => {
    if (!root.classList.contains("is-open")) return;
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }
    if (event.key === "Tab") {
      const focusableElements = Array.from(panel.querySelectorAll(HELP_BOT_FOCUSABLE_SELECTOR))
        .filter((element) => !element.hasAttribute("disabled")
          && element.getAttribute("aria-hidden") !== "true"
          && element.getClientRects().length > 0);
      if (!focusableElements.length) {
        event.preventDefault();
        panel.focus({ preventScroll: true });
        return;
      }
      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;
      if (event.shiftKey && activeElement === first) {
        event.preventDefault();
        last.focus({ preventScroll: true });
      } else if (!event.shiftKey && activeElement === last) {
        event.preventDefault();
        first.focus({ preventScroll: true });
      }
    }
  });

  const langObserver = new MutationObserver(() => {
    const nextLang = resolveInitialLanguage();
    if (nextLang === currentLang) return;
    if (root.classList.contains("is-open")) {
      resetConversation();
      return;
    }
    currentLang = nextLang;
    config = getPortfolioHelpBotConfig(currentLang);
    clearHelpBotState();
    responseToken += 1;
    clearTypingIndicator();
    if (liveRegion) liveRegion.textContent = "";
    messages.innerHTML = "";
    setOptions([], "");
    setStaticCopy();
  });

  langObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["lang"]
  });

  setStaticCopy();
  showNudge({ delay: HELP_BOT_NUDGE_INITIAL_DELAY_MS });
}

function resolveMotionProfile() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return "static";
  }

  const width = window.innerWidth || document.documentElement.clientWidth || 0;
  const height = window.innerHeight || document.documentElement.clientHeight || 0;
  const area = width * height;
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const dpr = window.devicePixelRatio || 1;
  const deviceMemory = Number(window.navigator?.deviceMemory || 0);
  const hardwareThreads = Number(window.navigator?.hardwareConcurrency || 0);

  if (
    coarsePointer ||
    area <= 520000 ||
    dpr >= 2.2 ||
    (deviceMemory && deviceMemory <= 4) ||
    (hardwareThreads && hardwareThreads <= 4)
  ) {
    return "lite";
  }

  return "full";
}

class ParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { alpha: true, desynchronized: true }) || canvas.getContext("2d");
    this.pageMode = document.body.classList.contains("journey-page") ? "journey" : "portfolio";
    this.particles = [];
    this.orbs = [];
    this.pointer = { x: null, y: null, radius: 220 };
    this.motionProfile = "full";
    this.isStatic = false;
    this.isReduced = false;
    this.viewportWidth = window.innerWidth || 0;
    this.viewportHeight = window.innerHeight || 0;
    this.dpr = 1;
    this.particleCount = 0;
    this.connectionDistance = 0;
    this.animationFrame = null;
    this.resizeTimer = null;
    this.resizeUiTimer = null;
    this.targetFrameMs = 1000 / 36;
    this.lastFrameTime = 0;

    if (!this.ctx) return;

    this.applyMotionProfile();
    this.resize();
    this.seed();
    this.attachEvents();
    this.start();
  }

  attachEvents() {
    window.addEventListener("resize", () => {
      document.body.classList.add("is-resizing");
      window.clearTimeout(this.resizeUiTimer);
      window.clearTimeout(this.resizeTimer);
      this.resizeUiTimer = window.setTimeout(() => {
        document.body.classList.remove("is-resizing");
      }, 260);
      this.resizeTimer = window.setTimeout(() => {
        this.applyMotionProfile();
        this.resize();
        this.seed();
        this.start();
      }, 160);
    });

    window.addEventListener("pointermove", (event) => {
      this.pointer.x = event.clientX;
      this.pointer.y = event.clientY;
    }, { passive: true });

    window.addEventListener("pointerdown", (event) => {
      this.pointer.x = event.clientX;
      this.pointer.y = event.clientY;
    }, { passive: true });

    window.addEventListener("pointerup", () => {
      this.pointer.x = null;
      this.pointer.y = null;
    }, { passive: true });

    window.addEventListener("pointercancel", () => {
      this.pointer.x = null;
      this.pointer.y = null;
    }, { passive: true });

    window.addEventListener("pointerout", (event) => {
      if (event.relatedTarget) return;
      this.pointer.x = null;
      this.pointer.y = null;
    }, { passive: true });

    window.addEventListener("blur", () => {
      this.pointer.x = null;
      this.pointer.y = null;
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        this.stop();
        return;
      }

      this.lastFrameTime = 0;
      this.start();
    });
  }

  resize() {
    this.viewportWidth = window.innerWidth || 0;
    this.viewportHeight = window.innerHeight || 0;
    this.dpr = Math.min(window.devicePixelRatio || 1, this.getMaxPixelRatio());
    this.canvas.width = Math.round(this.viewportWidth * this.dpr);
    this.canvas.height = Math.round(this.viewportHeight * this.dpr);
    this.canvas.style.width = `${this.viewportWidth}px`;
    this.canvas.style.height = `${this.viewportHeight}px`;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  applyMotionProfile() {
    this.motionProfile = resolveMotionProfile();
    this.isStatic = this.motionProfile === "static";
    this.isReduced = this.motionProfile !== "full";
    this.particleCount = this.getParticleCount();
    this.connectionDistance = this.getConnectionDistance();
    this.pointer.radius = this.getPointerRadius();
    this.targetFrameMs = this.motionProfile === "full"
      ? 1000 / 40
      : this.motionProfile === "lite"
        ? 1000 / 28
        : 1000 / 10;
  }

  getMaxPixelRatio() {
    if (this.motionProfile === "full") {
      return this.pageMode === "journey" ? 1.5 : 1.8;
    }

    return this.pageMode === "journey" ? 1.2 : 1.35;
  }

  getParticleCount() {
    const areaFactor = Math.min(
      Math.max(((this.viewportWidth || window.innerWidth) * (this.viewportHeight || window.innerHeight)) / 900000, 0.78),
      1.45
    );

    if (this.pageMode === "journey") {
      const base = this.motionProfile === "full"
        ? 56
        : this.motionProfile === "lite"
          ? 32
          : 20;
      return Math.round(base * areaFactor);
    }

    const base = this.motionProfile === "full"
      ? 78
      : this.motionProfile === "lite"
        ? 44
        : 28;
    return Math.round(base * areaFactor);
  }

  getConnectionDistance() {
    if (this.pageMode === "journey") {
      return this.motionProfile === "full" ? 134 : 94;
    }
    return this.motionProfile === "full" ? 158 : 118;
  }

  getParticleSpeed() {
    if (this.pageMode === "journey") {
      return this.motionProfile === "full" ? 0.2 : 0.12;
    }

    return this.motionProfile === "full" ? 0.34 : 0.2;
  }

  getOrbCount() {
    return this.motionProfile === "full" ? 4 : this.motionProfile === "lite" ? 3 : 2;
  }

  getPointerRadius() {
    if (this.motionProfile === "full") {
      return this.pageMode === "journey" ? 190 : 230;
    }

    return this.motionProfile === "static" ? 0 : this.pageMode === "journey" ? 130 : 160;
  }

  seed() {
    const speed = this.getParticleSpeed();
    this.particles = Array.from({ length: this.particleCount }, () => ({
      x: Math.random() * this.viewportWidth,
      y: Math.random() * this.viewportHeight,
      r: this.pageMode === "journey" ? (Math.random() > 0.82 ? 2.4 : 1.25) : (Math.random() > 0.8 ? 2.9 : 1.6),
      vx: (Math.random() - 0.5) * speed,
      vy: (Math.random() - 0.5) * speed,
      pulse: Math.random() * Math.PI * 2
    }));

    this.orbs = Array.from({ length: this.getOrbCount() }, (_, index) => ({
      x: (this.viewportWidth / (this.getOrbCount() + 1)) * (index + 1),
      y: Math.random() * this.viewportHeight,
      r: this.pageMode === "journey"
        ? (this.motionProfile === "full" ? 132 + index * 12 : 92 + index * 8)
        : (this.motionProfile === "full" ? 164 + index * 18 : 112 + index * 10),
      drift: this.pageMode === "journey"
        ? (this.motionProfile === "full" ? 0.065 + index * 0.018 : 0.048 + index * 0.014)
        : (this.motionProfile === "full" ? 0.1 + index * 0.028 : 0.075 + index * 0.018),
      phase: Math.random() * Math.PI * 2
    }));
  }

  colors() {
    const light = document.documentElement.getAttribute("data-theme") === "light";
    if (this.pageMode === "journey") {
      return {
        base: light ? "rgba(55,117,148," : "rgba(112,176,196,",
        accent: light ? "rgba(164,117,61," : "rgba(208,164,108,",
        glow: light ? 0.1 : 0.05,
        accentGlow: light ? 0.14 : 0.09,
        point: light ? 0.96 : 0.85,
        trail: light ? 0.3 : 0.16,
        connection: light ? 0.36 : 0.22,
        pointer: light ? 0.5 : 0.34,
        orbCore: light ? 0.14 : 0.08,
        orbOuter: light ? 0.065 : 0.035,
        bandBase: light ? 0.18 : 0.1,
        bandAccent: light ? 0.16 : 0.09,
      };
    }
    return {
      base: light ? "rgba(18,86,198," : "rgba(128,184,255,",
      accent: light ? "rgba(6,124,101," : "rgba(89,226,188,",
      glow: light ? 0.11 : 0.05,
      accentGlow: light ? 0.15 : 0.09,
      point: light ? 0.98 : 0.85,
      trail: light ? 0.28 : 0.16,
      connection: light ? 0.52 : 0.34,
      pointer: light ? 0.66 : 0.5,
      orbCore: light ? 0.15 : 0.12,
      orbOuter: light ? 0.075 : 0.05,
      bandBase: light ? 0.18 : 0.1,
      bandAccent: light ? 0.14 : 0.08,
    };
  }

  drawFrame() {
    const { base, accent, glow, accentGlow, point, trail, connection, pointer } = this.colors();
    this.ctx.clearRect(0, 0, this.viewportWidth, this.viewportHeight);
    this.drawAtmosphere();

    this.particles.forEach((particle, index) => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.pulse += 0.032;

      if (particle.x < 0 || particle.x > this.viewportWidth) particle.vx *= -1;
      if (particle.y < 0 || particle.y > this.viewportHeight) particle.vy *= -1;

      const glowRadius = particle.r * (index % 6 === 0 ? (this.pageMode === "journey" ? 4.2 : 5.8) : 2.6 + Math.sin(particle.pulse) * 0.8);
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, glowRadius, 0, Math.PI * 2);
      this.ctx.fillStyle = `${index % 7 === 0 ? accent : base}${index % 7 === 0 ? accentGlow : glow})`;
      this.ctx.fill();

      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
      this.ctx.fillStyle = `${index % 7 === 0 ? accent : base}${point})`;
      this.ctx.fill();

      if (this.pageMode === "journey") {
        this.ctx.beginPath();
        this.ctx.strokeStyle = `${index % 6 === 0 ? accent : base}${trail})`;
        this.ctx.lineWidth = 0.8;
        this.ctx.moveTo(particle.x, particle.y - 10);
        this.ctx.lineTo(particle.x, particle.y + 18);
        this.ctx.stroke();
      }

      if (this.pageMode !== "journey") {
      for (let j = index + 1; j < this.particles.length; j += 1) {
        const next = this.particles[j];
        const dx = particle.x - next.x;
        const dy = particle.y - next.y;
        const distance = Math.hypot(dx, dy);
        if (distance > this.connectionDistance) continue;

        const opacity = 1 - distance / this.connectionDistance;
        this.ctx.beginPath();
        this.ctx.strokeStyle = `${index % 8 === 0 ? accent : base}${opacity * connection})`;
        this.ctx.lineWidth = index % 8 === 0 ? (this.pageMode === "journey" ? 1.1 : 1.4) : 1;
        this.ctx.moveTo(particle.x, particle.y);
        this.ctx.lineTo(next.x, next.y);
        this.ctx.stroke();
      }
      }

      if (this.pointer.x === null || this.pointer.y === null || this.pointer.radius <= 0) return;
      const pdx = particle.x - this.pointer.x;
      const pdy = particle.y - this.pointer.y;
      const pointerDistance = Math.hypot(pdx, pdy);
      if (pointerDistance > this.pointer.radius) return;

      const pointerOpacity = 1 - pointerDistance / this.pointer.radius;
      this.ctx.beginPath();
      this.ctx.strokeStyle = `${accent}${pointerOpacity * pointer})`;
      this.ctx.lineWidth = this.pageMode === "journey" ? 1.1 : 1.6;
      this.ctx.moveTo(particle.x, particle.y);
      this.ctx.lineTo(this.pointer.x, this.pointer.y);
      this.ctx.stroke();
    });
  }

  animate() {
    if (this.isStatic) {
      this.drawFrame();
      this.animationFrame = null;
      return;
    }

    const now = performance.now();
    if (!this.lastFrameTime || now - this.lastFrameTime >= this.targetFrameMs) {
      this.drawFrame();
      this.lastFrameTime = now;
    }
    this.animationFrame = window.requestAnimationFrame(() => this.animate());
  }

  start() {
    if (!this.ctx) return;
    if (this.animationFrame) return;
    this.lastFrameTime = 0;
    this.animate();
  }

  stop() {
    if (this.animationFrame) {
      window.cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  drawAtmosphere() {
    const { base, accent, orbCore, orbOuter, bandBase, bandAccent } = this.colors();
    this.orbs.forEach((orb, index) => {
      orb.phase += orb.drift * 0.01;
      const x = orb.x + Math.sin(orb.phase) * (this.pageMode === "journey" ? 90 : 60);
      const y = orb.y + Math.cos(orb.phase * 0.8) * (this.pageMode === "journey" ? 18 : 40);
      const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, orb.r);
      gradient.addColorStop(0, `${index % 2 === 0 ? accent : base}${orbCore})`);
      gradient.addColorStop(0.45, `${index % 2 === 0 ? accent : base}${orbOuter})`);
      gradient.addColorStop(1, `${index % 2 === 0 ? accent : base}0)`);
      this.ctx.beginPath();
      this.ctx.fillStyle = gradient;
      this.ctx.arc(x, y, orb.r, 0, Math.PI * 2);
      this.ctx.fill();
    });

    if (this.pageMode === "journey") {
      this.drawJourneyBands(base, accent, bandBase, bandAccent);
    }
  }

  drawJourneyBands(base, accent, bandBase, bandAccent) {
    const bandA = this.ctx.createLinearGradient(0, this.viewportHeight * 0.28, this.viewportWidth, this.viewportHeight * 0.42);
    bandA.addColorStop(0, `${base}0)`);
    bandA.addColorStop(0.35, `${base}${bandBase})`);
    bandA.addColorStop(0.65, `${accent}${bandAccent})`);
    bandA.addColorStop(1, `${accent}0)`);
    this.ctx.fillStyle = bandA;
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.viewportHeight * 0.25);
    this.ctx.bezierCurveTo(
      this.viewportWidth * 0.2,
      this.viewportHeight * 0.18,
      this.viewportWidth * 0.48,
      this.viewportHeight * 0.38,
      this.viewportWidth,
      this.viewportHeight * 0.24
    );
    this.ctx.lineTo(this.viewportWidth, this.viewportHeight * 0.4);
    this.ctx.bezierCurveTo(
      this.viewportWidth * 0.68,
      this.viewportHeight * 0.52,
      this.viewportWidth * 0.34,
      this.viewportHeight * 0.3,
      0,
      this.viewportHeight * 0.42
    );
    this.ctx.closePath();
    this.ctx.fill();
  }
}

function setupParticles() {
  const canvas = document.getElementById("bg-canvas");
  if (!canvas) return;
  new ParticleSystem(canvas);
}

class RouteGlobe {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    if (!this.ctx) return;
    this.motionProfile = resolveMotionProfile();
    this.isStatic = false;
    this.isReduced = false;
    this.rotation = -35;
    this.routePhase = 0;
    this.india = { lat: 20.5937, lon: 78.9629 };
    this.germany = { lat: 51.1657, lon: 10.4515 };
    this.landShapes = [
      [
        { lat: 36, lon: -10 },
        { lat: 44, lon: 8 },
        { lat: 55, lon: 20 },
        { lat: 61, lon: 40 },
        { lat: 55, lon: 70 },
        { lat: 42, lon: 88 },
        { lat: 24, lon: 94 },
        { lat: 7, lon: 79 },
        { lat: 13, lon: 58 },
        { lat: 24, lon: 42 }
      ],
      [
        { lat: 7, lon: 68 },
        { lat: 13, lon: 72 },
        { lat: 24, lon: 78 },
        { lat: 27, lon: 88 },
        { lat: 19, lon: 91 },
        { lat: 8, lon: 81 }
      ],
      [
        { lat: 36, lon: -18 },
        { lat: 28, lon: 10 },
        { lat: 29, lon: 30 },
        { lat: 12, lon: 41 },
        { lat: -3, lon: 39 },
        { lat: -18, lon: 26 },
        { lat: -33, lon: 18 },
        { lat: -12, lon: -6 }
      ]
    ];
    this.resize();
    window.addEventListener("resize", () => this.resize());
    this.targetFrameMs = 1000 / 36;
    this.lastFrameTime = 0;
    this.animate();
  }

  resize() {
    const size = Math.min(this.canvas.clientWidth || 240, this.canvas.clientHeight || 240);
    const ratio = window.devicePixelRatio || 1;
    this.canvas.width = size * ratio;
    this.canvas.height = size * ratio;
    this.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    this.size = size;
    this.cx = size / 2;
    this.cy = size / 2;
    this.radius = size * 0.42;
  }

  project(lat, lon) {
    const latR = lat * Math.PI / 180;
    const lonR = (lon + this.rotation) * Math.PI / 180;
    const x = Math.cos(latR) * Math.sin(lonR);
    const y = Math.sin(latR);
    const z = Math.cos(latR) * Math.cos(lonR);
    return { x: this.cx + x * this.radius, y: this.cy - y * this.radius, z };
  }

  drawSphere() {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(this.cx, this.cy + this.radius * 0.98, this.radius * 0.78, 0, Math.PI * 2);
    this.ctx.fillStyle = "rgba(5, 10, 18, 0.22)";
    this.ctx.filter = "blur(10px)";
    this.ctx.fill();
    this.ctx.restore();

    const gradient = this.ctx.createRadialGradient(this.cx - this.radius * 0.35, this.cy - this.radius * 0.42, this.radius * 0.08, this.cx, this.cy, this.radius);
    gradient.addColorStop(0, "rgba(184, 223, 255, 0.26)");
    gradient.addColorStop(0.3, "rgba(67, 114, 162, 0.28)");
    gradient.addColorStop(0.72, "rgba(20, 38, 66, 0.34)");
    gradient.addColorStop(1, "rgba(6, 12, 24, 0.24)");
    this.ctx.beginPath();
    this.ctx.arc(this.cx, this.cy, this.radius, 0, Math.PI * 2);
    this.ctx.fillStyle = gradient;
    this.ctx.fill();
    this.ctx.strokeStyle = "rgba(128, 184, 255, 0.24)";
    this.ctx.lineWidth = 1.15;
    this.ctx.stroke();

    const specular = this.ctx.createRadialGradient(
      this.cx - this.radius * 0.33,
      this.cy - this.radius * 0.38,
      this.radius * 0.04,
      this.cx - this.radius * 0.22,
      this.cy - this.radius * 0.24,
      this.radius * 0.52
    );
    specular.addColorStop(0, "rgba(255, 255, 255, 0.16)");
    specular.addColorStop(1, "rgba(255, 255, 255, 0)");
    this.ctx.beginPath();
    this.ctx.arc(this.cx, this.cy, this.radius, 0, Math.PI * 2);
    this.ctx.fillStyle = specular;
    this.ctx.fill();
  }

  drawGrid() {
    const latLines = [-45, 0, 45];
    const lonLines = [-120, -60, 0, 60, 120];
    lonLines.forEach((lon) => {
      this.ctx.beginPath();
      let drawing = false;
      for (let lat = -80; lat <= 80; lat += 4) {
        const p = this.project(lat, lon);
        if (p.z <= 0) {
          drawing = false;
          continue;
        }
        if (!drawing) {
          this.ctx.moveTo(p.x, p.y);
          drawing = true;
        } else {
          this.ctx.lineTo(p.x, p.y);
        }
      }
      this.ctx.strokeStyle = "rgba(128, 184, 255, 0.16)";
      this.ctx.lineWidth = 0.75;
      this.ctx.stroke();
    });
    latLines.forEach((lat) => {
      this.ctx.beginPath();
      let drawing = false;
      for (let lon = -180; lon <= 180; lon += 4) {
        const p = this.project(lat, lon);
        if (p.z <= 0) {
          drawing = false;
          continue;
        }
        if (!drawing) {
          this.ctx.moveTo(p.x, p.y);
          drawing = true;
        } else {
          this.ctx.lineTo(p.x, p.y);
        }
      }
      this.ctx.strokeStyle = "rgba(89, 226, 188, 0.14)";
      this.ctx.lineWidth = 0.75;
      this.ctx.stroke();
    });
  }

  drawLand() {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(this.cx, this.cy, this.radius - 1, 0, Math.PI * 2);
    this.ctx.clip();
    this.landShapes.forEach((shape) => {
      this.ctx.beginPath();
      let drawing = false;
      shape.forEach((point) => {
        const p = this.project(point.lat, point.lon);
        if (p.z <= 0) return;
        if (!drawing) {
          this.ctx.moveTo(p.x, p.y);
          drawing = true;
        } else {
          this.ctx.lineTo(p.x, p.y);
        }
      });
      if (!drawing) return;
      this.ctx.closePath();
      this.ctx.fillStyle = "rgba(103, 220, 188, 0.26)";
      this.ctx.fill();
    });
    this.ctx.restore();
  }

  drawRoute() {
    const points = [];
    for (let i = 0; i <= 48; i += 1) {
      const t = i / 48;
      const lat = this.india.lat + (this.germany.lat - this.india.lat) * t + Math.sin(t * Math.PI) * 18;
      const lon = this.india.lon + (this.germany.lon - this.india.lon) * t;
      const p = this.project(lat, lon);
      if (p.z > 0) points.push(p);
    }
    if (points.length < 2) return;

    this.ctx.beginPath();
    this.ctx.moveTo(points[0].x, points[0].y);
    points.slice(1).forEach((p) => this.ctx.lineTo(p.x, p.y));
    this.ctx.strokeStyle = "rgba(255, 194, 104, 0.18)";
    this.ctx.lineWidth = 5.5;
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.moveTo(points[0].x, points[0].y);
    points.slice(1).forEach((p) => this.ctx.lineTo(p.x, p.y));
    this.ctx.strokeStyle = "rgba(255, 194, 104, 0.68)";
    this.ctx.lineWidth = 1.7;
    this.ctx.setLineDash([4, 4]);
    this.ctx.stroke();
    this.ctx.setLineDash([]);
    const t = (Math.sin(this.routePhase) + 1) / 2;
    const point = points[Math.min(points.length - 1, Math.floor(t * (points.length - 1)))];
    this.ctx.beginPath();
    this.ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
    this.ctx.fillStyle = "rgba(255, 194, 104, 0.96)";
    this.ctx.fill();
    this.ctx.beginPath();
    this.ctx.arc(point.x, point.y, 11.5, 0, Math.PI * 2);
    this.ctx.fillStyle = "rgba(255, 194, 104, 0.14)";
    this.ctx.fill();
  }

  drawMarker(point, fill) {
    const p = this.project(point.lat, point.lon);
    if (p.z <= 0) return;
    this.ctx.beginPath();
    this.ctx.arc(p.x, p.y, 9.5, 0, Math.PI * 2);
    this.ctx.fillStyle = fill.replace("0.98", "0.14");
    this.ctx.fill();
    this.ctx.beginPath();
    this.ctx.arc(p.x, p.y, 4.2, 0, Math.PI * 2);
    this.ctx.fillStyle = fill;
    this.ctx.fill();
  }

  drawFrame() {
    this.ctx.clearRect(0, 0, this.size, this.size);
    this.drawSphere();
    this.drawGrid();
    this.drawLand();
    this.drawRoute();
    this.drawMarker(this.india, "rgba(128, 184, 255, 0.98)");
    this.drawMarker(this.germany, "rgba(89, 226, 188, 0.98)");
    this.rotation += 0.14;
    this.routePhase += 0.028;
  }

  animate() {
    const now = performance.now();
    if (!this.lastFrameTime || now - this.lastFrameTime >= this.targetFrameMs) {
      this.drawFrame();
      this.lastFrameTime = now;
    }
    window.requestAnimationFrame(() => this.animate());
  }
}

function setupRouteGlobe() {
  const canvas = document.querySelector(".route-globe-canvas");
  if (!canvas) return;
  new RouteGlobe(canvas);
}

function loadSupabaseBrowserClient() {
  if (window.supabase?.createClient) {
    return Promise.resolve(window.supabase);
  }

  if (!supabaseClientPromise) {
    supabaseClientPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = SUPABASE_SCRIPT_URL;
      script.async = true;
      script.onload = () => {
        if (window.supabase?.createClient) {
          resolve(window.supabase);
        } else {
          reject(new Error("Supabase client did not load."));
        }
      };
      script.onerror = () => reject(new Error("Failed to load Supabase client."));
      document.head.appendChild(script);
    });
  }

  return supabaseClientPromise;
}

async function getSupabaseClient() {
  if (supabaseClient) return supabaseClient;

  const supabaseBrowser = await loadSupabaseBrowserClient();
  supabaseClient = supabaseBrowser.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false
    }
  });
  return supabaseClient;
}

function updateAdminSessionState(session) {
  const email = session?.user?.email?.toLowerCase() || "";
  adminSessionActive = email === SUPABASE_ADMIN_EMAIL.toLowerCase();
  return adminSessionActive;
}

async function initializeAdminAuth() {
  try {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    updateAdminSessionState(data?.session || null);
    supabase.auth.onAuthStateChange((_event, session) => {
      updateAdminSessionState(session);
    });
  } catch (error) {
    adminSessionActive = false;
  }
}

function getAdminModeState() {
  return adminSessionActive;
}

function setupAdminWorkspace() {
  const existing = document.querySelector("[data-admin-workspace]");
  if (!getAdminModeState()) {
    existing?.remove();
    return;
  }

  const lang = resolveInitialLanguage();
  const copy = lang === "de"
    ? {
        badge: "Adminmodus aktiv",
        scope: "Private Browser-Sitzung",
        title: "Verwaltungstools sind fuer diese Ansicht aktiv.",
        lead: "Sie koennen oeffentliche Bewertungen moderieren, die Update-Zeit steuern und private Uebermittlungsdaten dort einsehen, wo sie verfuegbar sind.",
        activeTools: "Auf dieser Seite aktiv",
        defaultsTool: "Oeffentliche Theme- und Sprach-Standards setzen",
        updateTool: "Geteilte Update-Zeit aktualisieren",
        reviewsTool: "Oeffentliche Bewertungen beantworten oder loeschen",
        submissionsTool: "Private Uebermittlungsuebersicht einsehen",
        chatbotTool: "Private Chatbot-Protokolle ansehen oder loeschen",
        promptTool: "Review-Prompt fuer Besucher anpassen",
        defaultsAction: "Site-Standards",
        refreshAction: "Update-Zeit aktualisieren",
        reviewsAction: "Zu Bewertungen",
        summaryAction: "Zur Uebersicht",
        chatbotAction: "Chatbot-Logs",
        promptAction: "Prompt-Einstellungen",
        reviewSyncLabel: "Public-Review-Sync",
        reviewSyncRemote: "Live fuer alle Besucher",
        reviewSyncUnavailable: "Gemeinsame Veroeffentlichung nicht verfuegbar"
      }
    : {
        badge: "Admin mode active",
        scope: "Private browser session",
        title: "Management tools are active for this view.",
        lead: "You can moderate public reviews, control the shared update time, and inspect private submission data where it is available.",
        activeTools: "Active on this page",
        defaultsTool: "Set the public theme and language defaults",
        updateTool: "Refresh the shared update timestamp",
        reviewsTool: "Reply to or remove public reviews",
        submissionsTool: "Inspect the private submission summary",
        chatbotTool: "Inspect or delete private chatbot logs",
        promptTool: "Adjust the visitor review prompt",
        defaultsAction: "Site defaults",
        refreshAction: "Refresh update time",
        reviewsAction: "Go to reviews",
        summaryAction: "Open summary",
        chatbotAction: "Chatbot logs",
        promptAction: "Prompt settings",
        reviewSyncLabel: "Public review sync",
        reviewSyncRemote: "Live for all visitors",
        reviewSyncUnavailable: "Shared publishing unavailable"
      };

  const refreshButton = document.querySelector(".top-update-admin-btn");
  const reviewPanel = document.getElementById("homepage-public-reviews")
    || document.querySelector("[data-feedback-thankyou-review-panel]");
  const reviewSection = document.querySelector("[data-public-review-section]")
    || document.getElementById("reviews")
    || reviewPanel
    || document.querySelector("[data-public-review-list]");
  const summaryPanel = document.querySelector("[data-feedback-thankyou-summary-panel]");
  const submissionLog = document.querySelector("[data-feedback-stats-log]");
  const toolLabels = [copy.defaultsTool, copy.promptTool, copy.chatbotTool];
  const actions = [];
  const reviewSyncState = sharedPublicReviewsSource === "remote"
    ? copy.reviewSyncRemote
    : copy.reviewSyncUnavailable;

  actions.push({ type: "defaults", label: copy.defaultsAction });
  actions.push({ type: "chatbot", label: copy.chatbotAction });

  if (refreshButton) {
    toolLabels.push(copy.updateTool);
    actions.push({ type: "refresh", label: copy.refreshAction });
  }
  if (reviewSection) {
    toolLabels.push(copy.reviewsTool);
    actions.push({ type: "reviews", label: copy.reviewsAction });
  }
  if (summaryPanel || submissionLog) {
    toolLabels.push(copy.submissionsTool);
    actions.push({ type: "summary", label: copy.summaryAction });
  }
  actions.push({ type: "prompt", label: copy.promptAction });

  if (!toolLabels.length) {
    existing?.remove();
    return;
  }

  const panel = existing || document.createElement("section");
  panel.className = "admin-workspace";
  panel.dataset.adminWorkspace = "true";
  panel.innerHTML = `
    <div class="container admin-workspace-inner">
      <div class="admin-workspace-copy">
        <div class="admin-workspace-head">
          <span class="admin-workspace-badge">${copy.badge}</span>
          <span class="admin-workspace-scope">${copy.scope}</span>
        </div>
        <h2>${copy.title}</h2>
        <p>${copy.lead}</p>
        <div class="admin-workspace-sync">
          <span class="admin-workspace-tools-label">${copy.reviewSyncLabel}</span>
          <span class="admin-workspace-tool">${reviewSyncState}</span>
        </div>
        <div class="admin-workspace-tools">
          <span class="admin-workspace-tools-label">${copy.activeTools}</span>
          <div class="admin-workspace-tool-list">
            ${toolLabels.map((label) => `<span class="admin-workspace-tool">${label}</span>`).join("")}
          </div>
        </div>
      </div>
      <div class="admin-workspace-actions">
        ${actions.map((action) => `<button class="btn btn-secondary btn-small" type="button" data-admin-workspace-action="${action.type}">${action.label}</button>`).join("")}
      </div>
      <div class="admin-site-defaults-panel" data-admin-site-defaults-panel></div>
      <div class="admin-review-prompt-panel" data-admin-review-prompt-panel></div>
      <div class="admin-help-bot-panel" data-admin-help-bot-panel></div>
    </div>
  `;

  const anchor = document.querySelector(".top-update-bar");
  const main = document.querySelector("main");
  if (anchor) {
    anchor.insertAdjacentElement("afterend", panel);
  } else if (main) {
    main.insertAdjacentElement("afterbegin", panel);
  } else {
    return;
  }

  panel.querySelectorAll("[data-admin-workspace-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.getAttribute("data-admin-workspace-action");

      if (action === "refresh" && refreshButton instanceof HTMLButtonElement) {
        refreshButton.click();
        return;
      }

      if (action === "defaults") {
        const defaultsPanel = panel.querySelector("[data-admin-site-defaults-panel]");
        if (defaultsPanel instanceof HTMLElement) {
          defaultsPanel.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        return;
      }

      if (action === "reviews" && reviewSection instanceof HTMLElement) {
        if (reviewPanel instanceof HTMLDetailsElement) {
          reviewPanel.open = true;
        }
        reviewSection.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }

      if (action === "summary") {
        if (summaryPanel instanceof HTMLDetailsElement) {
          summaryPanel.open = true;
          summaryPanel.scrollIntoView({ behavior: "smooth", block: "start" });
          return;
        }

        if (submissionLog instanceof HTMLElement) {
          submissionLog.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        return;
      }

      if (action === "prompt") {
        const promptPanel = panel.querySelector("[data-admin-review-prompt-panel]");
        if (promptPanel instanceof HTMLElement) {
          promptPanel.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        return;
      }

      if (action === "chatbot") {
        const chatPanel = panel.querySelector("[data-admin-help-bot-panel]");
        if (chatPanel instanceof HTMLElement) {
          chatPanel.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    });
  });

  renderAdminSiteDefaultsControls(panel);
  renderAdminReviewPromptControls(panel);
  renderAdminHelpBotControls(panel);
}

async function renderAdminSiteDefaultsControls(workspacePanel = document.querySelector("[data-admin-workspace]")) {
  const panel = workspacePanel instanceof HTMLElement
    ? workspacePanel.querySelector("[data-admin-site-defaults-panel]")
    : null;
  if (!(panel instanceof HTMLElement)) return;

  if (!getAdminModeState()) {
    panel.replaceChildren();
    return;
  }

  const lang = resolveInitialLanguage();
  const copy = lang === "de"
    ? {
        title: "Oeffentliche Site-Standards",
        lead: "Legen Sie die Standardansicht fuer neue Besucher fest. Gespeichert werden der oeffentliche Standard fuer Theme und Sprache. Besucher mit eigener Browser-Auswahl behalten ihre persoenliche Einstellung.",
        theme: "Standard-Theme",
        themeDark: "Dunkel",
        themeLight: "Hell",
        language: "Standardsprache",
        languageEn: "Englisch",
        languageDe: "Deutsch",
        save: "Site-Standards speichern",
        reset: "Auf Standard zuruecksetzen",
        saved: "Site-Standards gespeichert.",
        saveError: "Speichern fehlgeschlagen. Pruefen Sie die Site-State-Tabelle in Supabase.",
        note: "Diese Werte gelten oeffentlich als Standard. Persoenliche Browser-Auswahlen fuer Theme oder Sprache haben weiter Vorrang."
      }
    : {
        title: "Public site defaults",
        lead: "Set the default experience for new visitors. This saves the public default theme and language. Visitors who already chose their own browser preference keep their personal setting.",
        theme: "Default theme",
        themeDark: "Dark",
        themeLight: "Light",
        language: "Default language",
        languageEn: "English",
        languageDe: "German",
        save: "Save site defaults",
        reset: "Restore defaults",
        saved: "Site defaults saved.",
        saveError: "Saving failed. Check the site-state table in Supabase.",
        note: "These values act as the public default. Personal browser choices for theme or language still take priority."
      };
  const defaults = await loadSharedPublicSiteDefaults();

  panel.innerHTML = `
    <div class="admin-review-prompt-card">
      <div class="admin-review-prompt-head">
        <h3>${copy.title}</h3>
        <p>${copy.lead}</p>
      </div>
      <form class="admin-review-prompt-form" data-admin-site-defaults-form>
        <div class="admin-review-prompt-grid admin-site-defaults-grid">
          <label class="admin-review-prompt-field">
            <span>${copy.theme}</span>
            <select name="theme">
              <option value="dark"${defaults.theme === "dark" ? " selected" : ""}>${copy.themeDark}</option>
              <option value="light"${defaults.theme === "light" ? " selected" : ""}>${copy.themeLight}</option>
            </select>
          </label>
          <label class="admin-review-prompt-field">
            <span>${copy.language}</span>
            <select name="language">
              <option value="en"${defaults.language === "en" ? " selected" : ""}>${copy.languageEn}</option>
              <option value="de"${defaults.language === "de" ? " selected" : ""}>${copy.languageDe}</option>
            </select>
          </label>
        </div>
        <p class="admin-review-prompt-note">${copy.note}</p>
        <div class="admin-review-prompt-actions">
          <button class="btn btn-secondary btn-small" type="button" data-admin-site-defaults-reset>${copy.reset}</button>
          <button class="btn btn-small" type="submit">${copy.save}</button>
        </div>
        <p class="admin-review-prompt-status" data-admin-site-defaults-status hidden></p>
      </form>
    </div>
  `;

  const form = panel.querySelector("[data-admin-site-defaults-form]");
  const resetButton = panel.querySelector("[data-admin-site-defaults-reset]");
  const status = panel.querySelector("[data-admin-site-defaults-status]");
  const applyDefaultsToForm = (nextDefaults) => {
    if (!(form instanceof HTMLFormElement)) return;
    const normalizedDefaults = normalizePublicSiteDefaults(nextDefaults);
    const themeField = form.elements.namedItem("theme");
    const languageField = form.elements.namedItem("language");
    if (themeField instanceof HTMLSelectElement) themeField.value = normalizedDefaults.theme;
    if (languageField instanceof HTMLSelectElement) languageField.value = normalizedDefaults.language;
  };

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!(form instanceof HTMLFormElement)) return;

    const themeField = form.elements.namedItem("theme");
    const languageField = form.elements.namedItem("language");
    const nextDefaults = normalizePublicSiteDefaults({
      theme: themeField instanceof HTMLSelectElement ? themeField.value : undefined,
      language: languageField instanceof HTMLSelectElement ? languageField.value : undefined
    });

    try {
      await saveSharedPublicSiteDefaults(nextDefaults);
      localStorage.setItem(STORAGE_THEME_KEY, nextDefaults.theme);
      localStorage.setItem(STORAGE_LANGUAGE_KEY, nextDefaults.language);
      if (status instanceof HTMLElement) {
        status.hidden = false;
        status.dataset.state = "success";
        status.textContent = copy.saved;
      }
      window.setTimeout(() => {
        window.location.reload();
      }, 420);
    } catch {
      if (status instanceof HTMLElement) {
        status.hidden = false;
        status.dataset.state = "error";
        status.textContent = copy.saveError;
      }
    }
  });

  resetButton?.addEventListener("click", () => {
    applyDefaultsToForm(DEFAULT_PUBLIC_SITE_DEFAULTS);
    if (status instanceof HTMLElement) {
      status.hidden = true;
      status.textContent = "";
      status.dataset.state = "";
    }
  });
}

async function renderAdminReviewPromptControls(workspacePanel = document.querySelector("[data-admin-workspace]")) {
  const panel = workspacePanel instanceof HTMLElement
    ? workspacePanel.querySelector("[data-admin-review-prompt-panel]")
    : null;
  if (!(panel instanceof HTMLElement)) return;

  if (!getAdminModeState()) {
    panel.replaceChildren();
    return;
  }

  const lang = resolveInitialLanguage();
  const copy = lang === "de"
    ? {
        title: "Review-Prompt-Regeln",
        lead: "Steuern Sie, wann der oeffentliche Bewertungs-Hinweis fuer Besucher erscheint. Die Einstellungen gelten fuer alle Besucher, sobald sie gespeichert sind.",
        enabled: "Prompt aktivieren",
        everyVisit: "Bei jedem berechtigten Besuch anzeigen",
        delay: "Verzoegerung in Sekunden",
        scroll: "Scroll-Schwelle in Prozent",
        cooldown: "Ausblendung nach Anzeige in Tagen",
        suppress: "Nach Formularversand ausblenden in Tagen",
        finalSection: "Auch beim direkten Sprung zum letzten Abschnitt ausloesen",
        pages: "Aktive Seiten",
        pageIndex: "Detailed portfolio",
        pageMap: "Portfolio map",
        pageJourney: "Journey",
        save: "Prompt-Einstellungen speichern",
        reset: "Standardwerte einsetzen",
        saved: "Prompt-Einstellungen gespeichert.",
        saveError: "Speichern fehlgeschlagen. Fuehren Sie bei Bedarf das aktuelle Supabase-SQL fuer die Site-State-Spalte aus.",
        note: "0 Tage deaktiviert die jeweilige Sperre. 'Bei jedem Besuch' ignoriert nur die Prompt-Cooldown-Sperre."
      }
    : {
        title: "Review prompt rules",
        lead: "Control when the public review prompt appears for visitors. Saved settings apply to all visitors.",
        enabled: "Enable prompt",
        everyVisit: "Show on every eligible visit",
        delay: "Delay in seconds",
        scroll: "Scroll threshold in percent",
        cooldown: "Hide after prompt in days",
        suppress: "Suppress after submission in days",
        finalSection: "Also trigger when the visitor jumps straight to the final section",
        pages: "Active pages",
        pageIndex: "Detailed portfolio",
        pageMap: "Portfolio map",
        pageJourney: "Journey",
        save: "Save prompt settings",
        reset: "Restore defaults",
        saved: "Prompt settings saved.",
        saveError: "Saving failed. Run the latest Supabase SQL if the site-state settings column is missing.",
        note: "A value of 0 disables that blocker. 'Show on every visit' only bypasses the prompt cooldown."
      };
  const settings = await loadSharedReviewPromptSettings();

  panel.innerHTML = `
    <div class="admin-review-prompt-card">
      <div class="admin-review-prompt-head">
        <h3>${copy.title}</h3>
        <p>${copy.lead}</p>
      </div>
      <form class="admin-review-prompt-form" data-admin-review-prompt-form>
        <div class="admin-review-prompt-grid">
          <label class="admin-review-prompt-toggle">
            <input type="checkbox" name="enabled" ${settings.enabled ? "checked" : ""}>
            <span>${copy.enabled}</span>
          </label>
          <label class="admin-review-prompt-toggle">
            <input type="checkbox" name="showEveryVisit" ${settings.showEveryVisit ? "checked" : ""}>
            <span>${copy.everyVisit}</span>
          </label>
          <label class="admin-review-prompt-field">
            <span>${copy.delay}</span>
            <input type="number" name="delaySeconds" min="0" max="300" step="1" value="${settings.delaySeconds}">
          </label>
          <label class="admin-review-prompt-field">
            <span>${copy.scroll}</span>
            <input type="number" name="scrollPercent" min="0" max="100" step="1" value="${settings.scrollPercent}">
          </label>
          <label class="admin-review-prompt-field">
            <span>${copy.cooldown}</span>
            <input type="number" name="cooldownDays" min="0" max="365" step="1" value="${settings.cooldownDays}">
          </label>
          <label class="admin-review-prompt-field">
            <span>${copy.suppress}</span>
            <input type="number" name="suppressAfterSubmissionDays" min="0" max="365" step="1" value="${settings.suppressAfterSubmissionDays}">
          </label>
        </div>
        <label class="admin-review-prompt-toggle admin-review-prompt-toggle-wide">
          <input type="checkbox" name="triggerOnFinalSection" ${settings.triggerOnFinalSection ? "checked" : ""}>
          <span>${copy.finalSection}</span>
        </label>
        <fieldset class="admin-review-prompt-pages">
          <legend>${copy.pages}</legend>
          <label class="admin-review-prompt-toggle">
            <input type="checkbox" name="pageIndex" ${settings.eligiblePages.index ? "checked" : ""}>
            <span>${copy.pageIndex}</span>
          </label>
          <label class="admin-review-prompt-toggle">
            <input type="checkbox" name="pageMap" ${settings.eligiblePages.portfolioMap ? "checked" : ""}>
            <span>${copy.pageMap}</span>
          </label>
          <label class="admin-review-prompt-toggle">
            <input type="checkbox" name="pageJourney" ${settings.eligiblePages.journey ? "checked" : ""}>
            <span>${copy.pageJourney}</span>
          </label>
        </fieldset>
        <p class="admin-review-prompt-note">${copy.note}</p>
        <div class="admin-review-prompt-actions">
          <button class="btn btn-secondary btn-small" type="button" data-admin-review-prompt-reset>${copy.reset}</button>
          <button class="btn btn-small" type="submit">${copy.save}</button>
        </div>
        <p class="admin-review-prompt-status" data-admin-review-prompt-status hidden></p>
      </form>
    </div>
  `;

  const form = panel.querySelector("[data-admin-review-prompt-form]");
  const resetButton = panel.querySelector("[data-admin-review-prompt-reset]");
  const status = panel.querySelector("[data-admin-review-prompt-status]");
  const getField = (name) => (
    form instanceof HTMLFormElement
      ? form.elements.namedItem(name)
      : null
  );
  const getCheckbox = (name) => {
    const field = getField(name);
    return field instanceof HTMLInputElement ? field : null;
  };
  const getNumberInput = (name) => {
    const field = getField(name);
    return field instanceof HTMLInputElement ? field : null;
  };

  const applySettingsToForm = (nextSettings) => {
    if (!(form instanceof HTMLFormElement)) return;
    const enabledField = getCheckbox("enabled");
    const everyVisitField = getCheckbox("showEveryVisit");
    const delayField = getNumberInput("delaySeconds");
    const scrollField = getNumberInput("scrollPercent");
    const cooldownField = getNumberInput("cooldownDays");
    const suppressField = getNumberInput("suppressAfterSubmissionDays");
    const finalSectionField = getCheckbox("triggerOnFinalSection");
    const pageIndexField = getCheckbox("pageIndex");
    const pageMapField = getCheckbox("pageMap");
    const pageJourneyField = getCheckbox("pageJourney");

    if (enabledField) enabledField.checked = nextSettings.enabled;
    if (everyVisitField) everyVisitField.checked = nextSettings.showEveryVisit;
    if (delayField) delayField.value = String(nextSettings.delaySeconds);
    if (scrollField) scrollField.value = String(nextSettings.scrollPercent);
    if (cooldownField) cooldownField.value = String(nextSettings.cooldownDays);
    if (suppressField) suppressField.value = String(nextSettings.suppressAfterSubmissionDays);
    if (finalSectionField) finalSectionField.checked = nextSettings.triggerOnFinalSection;
    if (pageIndexField) pageIndexField.checked = nextSettings.eligiblePages.index;
    if (pageMapField) pageMapField.checked = nextSettings.eligiblePages.portfolioMap;
    if (pageJourneyField) pageJourneyField.checked = nextSettings.eligiblePages.journey;
  };

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!(form instanceof HTMLFormElement)) return;
    const enabledField = getCheckbox("enabled");
    const everyVisitField = getCheckbox("showEveryVisit");
    const delayField = getNumberInput("delaySeconds");
    const scrollField = getNumberInput("scrollPercent");
    const cooldownField = getNumberInput("cooldownDays");
    const suppressField = getNumberInput("suppressAfterSubmissionDays");
    const finalSectionField = getCheckbox("triggerOnFinalSection");
    const pageIndexField = getCheckbox("pageIndex");
    const pageMapField = getCheckbox("pageMap");
    const pageJourneyField = getCheckbox("pageJourney");
    const nextSettings = normalizeReviewPromptSettings({
      enabled: enabledField?.checked,
      showEveryVisit: everyVisitField?.checked,
      delaySeconds: delayField?.value,
      scrollPercent: scrollField?.value,
      cooldownDays: cooldownField?.value,
      suppressAfterSubmissionDays: suppressField?.value,
      triggerOnFinalSection: finalSectionField?.checked,
      eligiblePages: {
        index: pageIndexField?.checked,
        portfolioMap: pageMapField?.checked,
        journey: pageJourneyField?.checked
      }
    });

    try {
      await saveSharedReviewPromptSettings(nextSettings);
      if (status instanceof HTMLElement) {
        status.hidden = false;
        status.dataset.state = "success";
        status.textContent = copy.saved;
      }
    } catch {
      if (status instanceof HTMLElement) {
        status.hidden = false;
        status.dataset.state = "error";
        status.textContent = copy.saveError;
      }
    }
  });

  resetButton?.addEventListener("click", () => {
    applySettingsToForm(normalizeReviewPromptSettings());
    if (status instanceof HTMLElement) {
      status.hidden = true;
      status.textContent = "";
      status.dataset.state = "";
    }
  });
}

async function renderAdminHelpBotControls(workspacePanel = document.querySelector("[data-admin-workspace]")) {
  const panel = workspacePanel instanceof HTMLElement
    ? workspacePanel.querySelector("[data-admin-help-bot-panel]")
    : null;
  if (!(panel instanceof HTMLElement)) return;

  if (!getAdminModeState()) {
    panel.replaceChildren();
    return;
  }

  const lang = resolveInitialLanguage();
  const copy = lang === "de"
    ? {
        title: "Chatbot-Protokolle",
        lead: "Diese kompakte Uebersicht speichert private Chatbot-Sitzungen getrennt vom Review-System. Gespeichert werden die Bot-Nachrichten sowie die vom Besucher eingegebenen Texte und geklickten Auswahltexte.",
        note: "Aus Speichergruenden wird pro Sitzung nur ein kompaktes Transcript gespeichert. Oeffentliche Reviews bleiben davon getrennt.",
        empty: "Noch keine gespeicherten Chatbot-Sitzungen.",
        refresh: "Neu laden",
        delete: "Loeschen",
        deleting: "Loeschen...",
        deleteError: "Loeschen fehlgeschlagen. Pruefen Sie die Chatbot-SQL-Tabelle und die Admin-Policies in Supabase.",
        messages: "Nachrichten",
        role: "Rolle",
        page: "Seite",
        updated: "Aktualisiert",
        ended: "Beendet",
        visitor: "Besucher",
        position: "Position",
        organization: "Organisation",
        university: "Hochschule",
        transcript: "Transcript anzeigen",
        bot: "Bot",
        user: "Besucher",
        anonymous: "Ohne Namen",
        roleLabels: {
          recruiter: "Recruiter",
          student: "Student",
          visitor: "Allgemeiner Besucher"
        }
      }
    : {
        title: "Chatbot logs",
        lead: "This compact panel stores private chatbot sessions separately from the review system. It keeps the bot messages plus the text entered by the visitor and the labels of the options they clicked.",
        note: "To reduce storage, each session is stored as one compact transcript record. Public reviews stay separate from this data.",
        empty: "No chatbot sessions have been saved yet.",
        refresh: "Refresh",
        delete: "Delete",
        deleting: "Deleting...",
        deleteError: "Deleting failed. Check the chatbot SQL table and the admin policies in Supabase.",
        messages: "Messages",
        role: "Role",
        page: "Page",
        updated: "Updated",
        ended: "Ended",
        visitor: "Visitor",
        position: "Position",
        organization: "Organization",
        university: "University",
        transcript: "View transcript",
        bot: "Bot",
        user: "Visitor",
        anonymous: "Unnamed",
        roleLabels: {
          recruiter: "Recruiter",
          student: "Student",
          visitor: "General visitor"
        }
      };

  const render = async () => {
    panel.innerHTML = `
      <div class="admin-review-prompt-card">
        <div class="admin-review-prompt-head">
          <h3>${copy.title}</h3>
          <p>${copy.lead}</p>
        </div>
        <p class="admin-review-prompt-note">${copy.note}</p>
        <div class="admin-review-prompt-actions">
          <button class="btn btn-secondary btn-small" type="button" data-admin-help-bot-refresh>${copy.refresh}</button>
        </div>
        <div class="admin-help-bot-list" data-admin-help-bot-list></div>
      </div>
    `;

    const refreshButton = panel.querySelector("[data-admin-help-bot-refresh]");
    refreshButton?.addEventListener("click", () => {
      render();
    });

    const list = panel.querySelector("[data-admin-help-bot-list]");
    if (!(list instanceof HTMLElement)) return;

    const sessions = await fetchHelpBotSessions({ limit: 20 });
    if (!sessions.length) {
      list.innerHTML = `<p class="admin-help-bot-empty">${copy.empty}</p>`;
      return;
    }

    list.innerHTML = sessions.map((session, index) => {
      const roleLabel = copy.roleLabels[session.roleId] || session.roleId || "-";
      const updatedLabel = session.updatedAt
        ? formatUpdatedTimestamp(new Date(session.updatedAt), lang)
        : "-";
      const endedLabel = session.endedAt
        ? formatUpdatedTimestamp(new Date(session.endedAt), lang)
        : "—";
      const pageLabel = session.pagePath || "-";
      const transcriptMarkup = session.transcript.map((entry) => `
        <div class="admin-help-bot-transcript-line is-${escapeHtml(entry.sender)}">
          <span class="admin-help-bot-transcript-role">${escapeHtml(entry.sender === "user" ? copy.user : copy.bot)}</span>
          <p>${escapeHtml(entry.text)}</p>
        </div>
      `).join("");
      const detailFacts = [
        `${copy.role}: ${roleLabel}`,
        `${copy.page}: ${pageLabel}`,
        `${copy.updated}: ${updatedLabel}`,
        `${copy.ended}: ${endedLabel}`
      ];
      if (session.visitorName) detailFacts.push(`${copy.visitor}: ${session.visitorName}`);
      if (session.visitorPosition) detailFacts.push(`${copy.position}: ${session.visitorPosition}`);
      if (session.visitorOrganization) detailFacts.push(`${copy.organization}: ${session.visitorOrganization}`);
      if (session.studentUniversity) detailFacts.push(`${copy.university}: ${session.studentUniversity}`);

      return `
        <details class="admin-help-bot-session"${index === 0 ? " open" : ""}>
          <summary class="admin-help-bot-session-summary">
            <div class="admin-help-bot-session-copy">
              <strong>${escapeHtml(session.visitorName || roleLabel || copy.anonymous)}</strong>
              <span>${escapeHtml(roleLabel)} • ${escapeHtml(updatedLabel)} • ${escapeHtml(`${session.messageCount} ${copy.messages}`)}</span>
            </div>
            <span class="admin-help-bot-session-action">${copy.transcript}</span>
          </summary>
          <div class="admin-help-bot-session-body">
            <div class="admin-help-bot-session-meta">
              ${detailFacts.map((item) => `<span class="admin-workspace-tool">${escapeHtml(item)}</span>`).join("")}
            </div>
            <div class="admin-help-bot-transcript">
              ${transcriptMarkup}
            </div>
            <div class="admin-review-prompt-actions">
              <button class="btn btn-secondary btn-small" type="button" data-admin-help-bot-delete="${escapeHtml(session.sessionId)}">${copy.delete}</button>
            </div>
          </div>
        </details>
      `;
    }).join("");

    list.querySelectorAll("[data-admin-help-bot-delete]").forEach((button) => {
      button.addEventListener("click", async () => {
        const sessionId = button.getAttribute("data-admin-help-bot-delete") || "";
        if (!sessionId) return;
        button.disabled = true;
        button.textContent = copy.deleting;
        try {
          await deleteHelpBotSession(sessionId);
          await render();
        } catch {
          button.disabled = false;
          button.textContent = copy.delete;
          window.alert(copy.deleteError);
        }
      });
    });
  };

  await render();
}

function setupAdminModeControl() {
  const navActions = document.querySelector(".nav-actions");
  if (!navActions || navActions.querySelector("[data-admin-mode-switch]")) return;

  const lang = document.documentElement.lang === "de" ? "de" : "en";
  const copy = lang === "de"
    ? {
        groupLabel: "Seitenmodus",
        adminMode: "Admin",
        on: "Ein",
        off: "Aus",
        modalTitle: "Adminmodus aktivieren",
        modalBody: "Melden Sie sich mit dem gesicherten Admin-Konto an, um die privaten Verwaltungsfunktionen in diesem Browser zu aktivieren.",
        passwordLabel: "Passwort",
        passwordPlaceholder: "Admin-Passwort eingeben",
        cancel: "Abbrechen",
        enable: "Aktivieren",
        signingIn: "Anmeldung...",
        incorrect: "Die Anmeldung war nicht erfolgreich.",
        unavailable: "Die sichere Admin-Anmeldung ist momentan nicht verfuegbar."
      }
    : {
        groupLabel: "Site mode",
        adminMode: "Admin",
        on: "On",
        off: "Off",
        modalTitle: "Enable admin mode",
        modalBody: "Sign in with the secured admin account to enable the private management controls in this browser.",
        passwordLabel: "Password",
        passwordPlaceholder: "Enter admin password",
        cancel: "Cancel",
        enable: "Enable",
        signingIn: "Signing in...",
        incorrect: "Sign-in was not successful.",
        unavailable: "Secure admin sign-in is currently unavailable."
      };

  const isAdminMode = getAdminModeState();
  const switcher = document.createElement("div");
  switcher.className = "admin-mode-switch";
  switcher.dataset.adminModeSwitch = "true";
  switcher.setAttribute("role", "group");
  switcher.setAttribute("aria-label", copy.groupLabel);
  switcher.dataset.state = isAdminMode ? "on" : "off";
  switcher.innerHTML = `
    <span class="admin-mode-label">${copy.adminMode}</span>
    <button
      type="button"
      class="admin-mode-toggle"
      data-admin-mode-toggle
      role="switch"
      aria-checked="${String(isAdminMode)}"
      aria-label="${copy.adminMode}: ${isAdminMode ? copy.on : copy.off}"
    >
      <span class="admin-mode-toggle-track">
        <span class="admin-mode-toggle-state admin-mode-toggle-state-off" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round">
            <path d="M7 7l10 10"></path>
            <path d="M17 7 7 17"></path>
          </svg>
        </span>
        <span class="admin-mode-toggle-state admin-mode-toggle-state-on" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round">
            <path d="m6 12 4 4 8-8"></path>
          </svg>
        </span>
        <span class="admin-mode-toggle-thumb" aria-hidden="true">
          <span class="admin-mode-toggle-thumb-core"></span>
        </span>
      </span>
    </button>
  `;
  const toggleButton = switcher.querySelector("[data-admin-mode-toggle]");
  const portfolioSwitch = navActions.querySelector(".portfolio-view-switch");
  const themeToggle = navActions.querySelector("[data-theme-toggle]");
  if (portfolioSwitch) {
    portfolioSwitch.insertAdjacentElement("afterend", switcher);
  } else if (themeToggle) {
    themeToggle.insertAdjacentElement("afterend", switcher);
  } else {
    navActions.appendChild(switcher);
  }

  const modal = document.createElement("div");
  modal.className = "admin-auth-modal";
  modal.hidden = true;
  modal.innerHTML = `
    <div class="admin-auth-backdrop" data-admin-auth-close></div>
    <div class="admin-auth-dialog" role="dialog" aria-modal="true" aria-labelledby="admin-auth-title">
      <div class="admin-auth-head">
        <h2 id="admin-auth-title">${copy.modalTitle}</h2>
        <p>${copy.modalBody}</p>
      </div>
      <form class="admin-auth-form">
        <label class="admin-auth-field">
          <span>${copy.passwordLabel}</span>
          <input type="password" name="admin_password" autocomplete="current-password" placeholder="${copy.passwordPlaceholder}" required>
        </label>
        <p class="admin-auth-error" hidden>${copy.incorrect}</p>
        <div class="admin-auth-actions">
          <button type="button" class="btn btn-small btn-ghost" data-admin-auth-close>${copy.cancel}</button>
          <button type="submit" class="btn btn-small btn-primary">${copy.enable}</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(modal);

  const passwordInput = modal.querySelector('input[name="admin_password"]');
  const errorText = modal.querySelector(".admin-auth-error");
  const form = modal.querySelector(".admin-auth-form");
  const submitButton = form?.querySelector('button[type="submit"]');

  const openModal = () => {
    modal.hidden = false;
    if (errorText) errorText.hidden = true;
    if (passwordInput) {
      passwordInput.value = "";
      window.requestAnimationFrame(() => passwordInput.focus());
    }
    document.body.classList.add("admin-modal-open");
  };

  const closeModal = () => {
    modal.hidden = true;
    document.body.classList.remove("admin-modal-open");
  };

  const updateToggleState = (active) => {
    switcher.dataset.state = active ? "on" : "off";
    document.documentElement.setAttribute("data-admin-mode", active ? "on" : "off");
    toggleButton?.setAttribute("aria-checked", String(active));
    toggleButton?.setAttribute("aria-label", `${copy.adminMode}: ${active ? copy.on : copy.off}`);
  };

  updateToggleState(isAdminMode);

  toggleButton?.addEventListener("click", async () => {
    if (getAdminModeState()) {
      try {
        const supabase = await getSupabaseClient();
        await supabase.auth.signOut();
      } catch (error) {
        adminSessionActive = false;
      }

      updateToggleState(false);
      window.location.reload();
      return;
    }

    openModal();
  });

  modal.querySelectorAll("[data-admin-auth-close]").forEach((element) => {
    element.addEventListener("click", closeModal);
  });

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.hidden) {
      closeModal();
    }
  });

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const password = passwordInput?.value ?? "";
    if (errorText) errorText.hidden = true;

    const runSignIn = async () => {
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = copy.signingIn;
      }

      try {
        const supabase = await getSupabaseClient();
        const { data, error } = await supabase.auth.signInWithPassword({
          email: SUPABASE_ADMIN_EMAIL,
          password
        });

        if (error || !updateAdminSessionState(data?.session || null)) {
          await supabase.auth.signOut().catch(() => {});
          throw error || new Error("Unauthorized admin account.");
        }

        closeModal();
        window.location.reload();
      } catch (error) {
        if (errorText) {
          errorText.hidden = false;
          errorText.textContent = /load Supabase client|Secure admin sign-in/i.test(String(error?.message || ""))
            ? copy.unavailable
            : copy.incorrect;
        }
        if (passwordInput) {
          passwordInput.focus();
          passwordInput.select();
        }
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = copy.enable;
        }
      }
    };

    runSignIn();
  });
}

function setupHomepageSectionFilter() {
  const filterableSections = [
    "about",
    "skills",
    "experience",
    "thesis-highlight",
    "projects",
    "education",
    "certificates",
    "events-training",
    "accomplishments",
    "journey-preview",
    "contact",
    "explore-topics",
    "faq",
    "reviews"
  ]
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const navActions = document.querySelector(".nav-actions");
  if (!filterableSections.length || !navActions || navActions.querySelector("[data-section-filter-toggle]")) {
    return;
  }

  const lang = document.documentElement.lang === "de" ? "de" : "en";
  const labels = {
    en: {
      trigger: "Filter sections",
      title: "Filter homepage sections",
      body: "Select one or more sections to focus on. The hero area stays visible, and only the selected sections from About onward will remain on the page.",
      apply: "Apply filter",
      clear: "Show all",
      cancel: "Close"
    },
    de: {
      trigger: "Bereiche filtern",
      title: "Startseiten-Bereiche filtern",
      body: "Waehlen Sie einen oder mehrere Bereiche aus. Der Hero-Bereich bleibt sichtbar, und ab \"Ueber mich\" werden nur die ausgewaehlten Bereiche angezeigt.",
      apply: "Filter anwenden",
      clear: "Alle anzeigen",
      cancel: "Schliessen"
    }
  }[lang];

  const sectionLabelMap = {
    about: lang === "de" ? "Ueber mich" : "About",
    skills: lang === "de" ? "Kompetenzen" : "Skills",
    experience: lang === "de" ? "Erfahrung" : "Experience",
    "thesis-highlight": lang === "de" ? "Thesis-Highlight" : "Thesis highlight",
    projects: lang === "de" ? "Projekte" : "Projects",
    education: lang === "de" ? "Ausbildung" : "Education",
    certificates: lang === "de" ? "Zertifikate" : "Certificates",
    "events-training": lang === "de" ? "Veranstaltungen und Training" : "Events and training",
    accomplishments: lang === "de" ? "Erfolge" : "Accomplishments",
    "journey-preview": lang === "de" ? "Werdegang" : "Journey",
    contact: lang === "de" ? "Kontakt" : "Contact",
    "explore-topics": lang === "de" ? "Nach Themen erkunden" : "Explore by topic",
    faq: lang === "de" ? "Portfolio-Fragen" : "Common questions",
    reviews: lang === "de" ? "Bewertungen" : "Reviews"
  };

  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "section-filter-toggle";
  toggle.dataset.sectionFilterToggle = "true";
  toggle.setAttribute("aria-label", labels.trigger);
  toggle.setAttribute("title", labels.trigger);
  toggle.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <path d="M4 6h16"/>
      <path d="M7 12h10"/>
      <path d="M10 18h4"/>
    </svg>
    <span class="sr-only">${labels.trigger}</span>
  `;
  navActions.insertBefore(toggle, navActions.lastElementChild || null);

  const modal = document.createElement("div");
  modal.className = "section-filter-modal";
  modal.hidden = true;
  modal.innerHTML = `
    <div class="section-filter-backdrop" data-section-filter-close></div>
    <div class="section-filter-dialog" role="dialog" aria-modal="true" aria-labelledby="section-filter-title">
      <div class="section-filter-head">
        <h2 id="section-filter-title">${labels.title}</h2>
        <p>${labels.body}</p>
      </div>
      <form class="section-filter-form">
        <div class="section-filter-grid">
          ${filterableSections.map((section) => `
            <label class="section-filter-option">
              <input type="checkbox" name="section_filter" value="${section.id}">
              <span>${sectionLabelMap[section.id] || section.id}</span>
            </label>
          `).join("")}
        </div>
        <div class="section-filter-actions">
          <button type="button" class="btn btn-small btn-ghost" data-section-filter-clear>${labels.clear}</button>
          <div class="section-filter-actions-right">
            <button type="button" class="btn btn-small btn-ghost" data-section-filter-close>${labels.cancel}</button>
            <button type="submit" class="btn btn-small btn-primary">${labels.apply}</button>
          </div>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(modal);

  const form = modal.querySelector(".section-filter-form");
  const inputs = Array.from(modal.querySelectorAll('input[name="section_filter"]'));
  const hashLinks = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
  const selectedIds = new Set();

  const updateFilterButtonState = () => {
    const count = selectedIds.size;
    if (count > 0) {
      toggle.dataset.count = String(count);
      toggle.classList.add("has-active-filter");
    } else {
      delete toggle.dataset.count;
      toggle.classList.remove("has-active-filter");
    }
  };

  const applyFilterSelection = () => {
    const hasActiveFilter = selectedIds.size > 0;

    filterableSections.forEach((section) => {
      section.hidden = hasActiveFilter && !selectedIds.has(section.id);
    });

    hashLinks.forEach((link) => {
      const targetId = link.getAttribute("href")?.slice(1);
      if (!targetId || !filterableSections.some((section) => section.id === targetId)) return;
      const isVisible = !hasActiveFilter || selectedIds.has(targetId);
      link.classList.toggle("is-filter-muted", !isVisible);
      link.setAttribute("aria-disabled", String(!isVisible));
      link.tabIndex = isVisible ? 0 : -1;
    });

    updateFilterButtonState();

    if (hasActiveFilter) {
      const firstVisible = filterableSections.find((section) => selectedIds.has(section.id) && !section.hidden);
      firstVisible?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const syncInputs = () => {
    inputs.forEach((input) => {
      input.checked = selectedIds.has(input.value);
    });
  };

  const openModal = () => {
    syncInputs();
    modal.hidden = false;
    document.body.classList.add("section-filter-open");
    modal.querySelector('input[name="section_filter"]')?.focus();
  };

  const closeModal = () => {
    modal.hidden = true;
    document.body.classList.remove("section-filter-open");
  };

  toggle.addEventListener("click", openModal);

  modal.querySelectorAll("[data-section-filter-close]").forEach((element) => {
    element.addEventListener("click", closeModal);
  });

  modal.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeModal();
  });

  modal.querySelector("[data-section-filter-clear]")?.addEventListener("click", () => {
    selectedIds.clear();
    syncInputs();
    applyFilterSelection();
    closeModal();
  });

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    selectedIds.clear();
    inputs.forEach((input) => {
      if (input.checked) selectedIds.add(input.value);
    });
    applyFilterSelection();
    closeModal();
  });

  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.hidden) {
      closeModal();
    }
  });
}

function setupFeedbackForm() {
  const form = document.querySelector("[data-feedback-form]");
  if (!form) return;
  form.noValidate = true;

  const isAdminMode = getAdminModeState();
  const formCard = document.querySelector("[data-feedback-form-card]");
  const feedbackPage = document.querySelector("[data-feedback-page]");
  const formTitle = document.querySelector("[data-feedback-form-title]");
  const formContent = document.querySelector("[data-feedback-form-content]");
  const formNav = document.querySelector("[data-feedback-form-nav]");
  const submitButton = form.querySelector("[data-feedback-submit]");
  const messageTypeFields = Array.from(form.querySelectorAll('[name="messageType"]'));
  const typeSection = form.querySelector(".feedback-type-section");
  const continueButton = form.querySelector("[data-feedback-mode-continue]");
  const changeModeLink = form.querySelector("[data-feedback-mode-change]");
  const firstNameField = form.querySelector('[name="firstName"]');
  const lastNameField = form.querySelector('[name="lastName"]');
  const companyField = form.querySelector('[name="company"]');
  const firstNameLabel = document.querySelector("[data-feedback-first-name-label]");
  const firstNameInput = document.querySelector("[data-feedback-first-name-input]");
  const lastNameFieldWrapper = document.querySelector("[data-feedback-last-name-field]");
  const companyLabel = document.querySelector("[data-feedback-company-label]");
  const companyInput = document.querySelector("[data-feedback-company-input]");
  const responsePreferenceField = form.querySelector('[name="responsePreference"]');
  const referenceLinkField = form.querySelector('[name="referenceLink"]');
  const phoneField = form.querySelector('[name="phone"]');
  const phoneFieldWrapper = form.querySelector("[data-feedback-phone-field]");
  const feedbackOnlySections = Array.from(form.querySelectorAll("[data-feedback-only]"));
  const feedbackNavLinks = Array.from(document.querySelectorAll("[data-feedback-nav-link='feedback']"));
  const conditionalStars = Array.from(form.querySelectorAll(".feedback-required-star-conditional"));
  const detailsSection = form.querySelector('[aria-labelledby="feedback-details-heading"]');
  const formDescription = document.querySelector("[data-feedback-form-description]");
  const typeDescription = document.querySelector("[data-feedback-type-description]");
  const detailsDescription = document.querySelector("[data-feedback-details-description]");
  const noteTitle = document.querySelector("[data-feedback-note-title]");
  const noteCopy = document.querySelector("[data-feedback-note-copy]");
  const messageDescription = document.querySelector("[data-feedback-message-description]");
  const heroEyebrow = document.querySelector("[data-feedback-hero-eyebrow]");
  const heroTitle = document.querySelector("[data-feedback-hero-title]");
  const heroLead = document.querySelector("[data-feedback-hero-lead]");
  const heroPrimary = document.querySelector("[data-feedback-hero-primary]");
  const postformGrid = document.querySelector("[data-feedback-postform-grid]");
  const heroEntryButtons = Array.from(document.querySelectorAll("[data-feedback-entry-choice]"));
  const reviewVisibilitySection = document.querySelector("[data-feedback-review-visibility-section]");
  const reviewVisibilityPanel = document.querySelector("[data-feedback-review-visibility-panel]");
  const reviewVisibilityDescription = document.querySelector("[data-feedback-review-visibility-description]");
  const reviewVisibilityNoteTitle = document.querySelector("[data-feedback-review-visibility-note-title]");
  const reviewVisibilityNoteBody = document.querySelector("[data-feedback-review-visibility-note-body]");
  const reviewVisibilityFields = Array.from(form.querySelectorAll("[data-feedback-review-visibility-field]"));
  const commentsLabel = document.querySelector("[data-feedback-comments-label]");
  const commentsInput = document.querySelector("[data-feedback-comments-input]");
  const commentsHint = document.querySelector("[data-feedback-comments-hint]");
  const formStatus = document.querySelector("[data-feedback-status]");
  const footerCopy = document.querySelector("[data-feedback-footer-copy]");
  const statsTotal = document.querySelector("[data-feedback-stats-total]");
  const statsCountries = document.querySelector("[data-feedback-stats-countries]");
  const statsAdmin = document.querySelector("[data-feedback-stats-admin]");
  const statsRefreshButton = document.querySelector("[data-feedback-stats-refresh]");
  const statsClearButton = document.querySelector("[data-feedback-stats-clear]");
  const statsAdminNote = document.querySelector("[data-feedback-stats-admin-note]");
  const statsLog = document.querySelector("[data-feedback-stats-log]");
  const statsLogList = document.querySelector("[data-feedback-stats-log-list]");
  const flowFields = formContent
    ? Array.from(formContent.querySelectorAll("input, textarea, select"))
    : [];
  const mobileFeedbackLayout = window.matchMedia("(max-width: 780px)");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const requestedMode = (() => {
    const type = new URLSearchParams(window.location.search).get("type");
    return type === "feedback" || type === "contact" ? type : "";
  })();
  let feedbackEntryMode = requestedMode ? "direct" : "chooser";

  const getRequiredFields = () =>
    Array.from(form.querySelectorAll("[required]")).filter((field) => !field.disabled);

  const getSelectedMessageType = () =>
    messageTypeFields.find((field) => field.checked)?.value || "";

  const getSelectedOptionLabel = (field) =>
    field instanceof HTMLSelectElement
      ? String(field.selectedOptions?.[0]?.textContent || "").trim()
      : "";

  const buildFeedbackModeUrl = (mode) => {
    const url = new URL(window.location.pathname, window.location.href);
    url.searchParams.set("type", mode);
    url.hash = "feedback-form";
    return url.toString();
  };

  let lastSelectedMessageType = getSelectedMessageType();

  if (requestedMode) {
    const requestedField = messageTypeFields.find((field) => field.value === requestedMode);
    if (requestedField) {
      requestedField.checked = true;
      lastSelectedMessageType = requestedMode;
    }
  }

  const revealActiveFormSection = () => {
    if (!mobileFeedbackLayout.matches || !detailsSection || formContent?.hidden) return;

    const targetTop = detailsSection.getBoundingClientRect().top + window.scrollY - getScrollOffset();
    const targetViewportTop = detailsSection.getBoundingClientRect().top;
    const targetAlreadyVisible =
      targetViewportTop >= getScrollOffset() &&
      targetViewportTop <= window.innerHeight * 0.45;

    if (targetAlreadyVisible) return;

    window.scrollTo({
      top: Math.max(targetTop - 8, 0),
      behavior: prefersReducedMotion.matches ? "auto" : "smooth"
    });
  };

  const renderFeedbackStats = (forceRefresh = false) => {
    return renderSubmissionSummary({
      scope: document,
      lang: resolveInitialLanguage(),
      isAdminMode: getAdminModeState(),
      forceRefresh
    });
  };

  const recordFeedbackStat = async (submission, publicReview = null) => {
    await recordSharedSubmissionEvent(submission);
    let publicReviewPublished = false;
    if (publicReview) {
      try {
        await recordSharedPublicReview(publicReview);
        publicReviewPublished = true;
      } catch {
        publicReviewPublished = false;
      }
    }
    await renderFeedbackStats(true);
    return { publicReviewPublished };
  };

  const refreshStatsStatus = async () => {
    await renderFeedbackStats(true);
    if (statsAdminNote) {
      statsAdminNote.textContent = resolveInitialLanguage() === "de"
        ? "Status wurde gerade aktualisiert."
        : "Status refreshed just now.";
    }
  };

  const clearStatsStatus = async () => {
    await clearSharedSubmissionEvents();
    await renderFeedbackStats(true);
    if (statsAdminNote) {
      statsAdminNote.textContent = resolveInitialLanguage() === "de"
        ? "Status geloescht. Die Uebersicht wurde auf null zurueckgesetzt."
        : "Status cleared. Submission summary reset to zero.";
    }
  };

  const deleteFeedbackStat = async (id) => {
    const deletedStats = await deleteSharedSubmissionEvent(id);
    if (!deletedStats) return;
    await renderFeedbackStats(true);

    if (statsAdminNote) {
      statsAdminNote.textContent = resolveInitialLanguage() === "de"
        ? "Eintrag geloescht."
        : "Entry deleted.";
    }
  };

  const setFormStatus = (message = "", state = "error") => {
    if (!formStatus) return;
    formStatus.textContent = message;
    formStatus.dataset.state = state;
    formStatus.hidden = !message;
  };

  const clearFormStatus = () => {
    if (!formStatus) return;
    formStatus.textContent = "";
    formStatus.hidden = true;
    delete formStatus.dataset.state;
  };

  const getCommentVisibilitySelection = () =>
    reviewVisibilityFields.find((field) => field.checked)?.value || "";

  const buildDerivedSubject = (message = "", fallback = "") => {
    const normalizedMessage = String(message || "").replace(/\s+/g, " ").trim();
    if (normalizedMessage) {
      return normalizedMessage.length > 72
        ? `${normalizedMessage.slice(0, 69).trimEnd()}...`
        : normalizedMessage;
    }
    return String(fallback || "").trim();
  };

  const getReviewVisibilityNoteCopy = (selection = "", lang = resolveInitialLanguage()) => {
    const copy = lang === "de"
      ? {
          defaultTitle: "Privat oder oeffentlich auswaehlen",
          defaultBody: "Waehlen Sie eine Option, damit klar ist, ob Ihre Bewertung nur fuer Sooraj Sudhakaran sichtbar bleibt oder fuer alle Besucher oeffentlich erscheinen darf.",
          privateTitle: "Private Bewertung",
          privateBody: "Wenn Sie Privat waehlen, bleibt Ihr Kommentar nur fuer Sooraj Sudhakaran sichtbar und wird nicht in den oeffentlichen Bewertungen angezeigt.",
          publicTitle: "Oeffentliche Bewertung",
          publicBody: "Wenn Sie Oeffentlich waehlen, koennen Ihr Name, Ihr Land, Ihre Bewertung und Ihr Kommentar in den oeffentlichen Bewertungen fuer alle Besucher angezeigt werden."
        }
      : {
          defaultTitle: "Select Private or Public",
          defaultBody: "Choose one option to decide whether your review stays visible only to Sooraj Sudhakaran or can appear publicly for all visitors.",
          privateTitle: "Private review",
          privateBody: "If you choose Private, your comment stays visible only to Sooraj Sudhakaran and will not appear in public reviews.",
          publicTitle: "Public review",
          publicBody: "If you choose Public, your name, country, rating, and comment can appear in public reviews for all visitors to read."
        };

    if (selection === "private") {
      return { title: copy.privateTitle, body: copy.privateBody };
    }

    if (selection === "public") {
      return { title: copy.publicTitle, body: copy.publicBody };
    }

    return { title: copy.defaultTitle, body: copy.defaultBody };
  };

  const syncReviewVisibilityNote = () => {
    const noteCopy = getReviewVisibilityNoteCopy(getCommentVisibilitySelection());
    if (reviewVisibilityNoteTitle) {
      reviewVisibilityNoteTitle.textContent = noteCopy.title;
    }
    if (reviewVisibilityNoteBody) {
      reviewVisibilityNoteBody.textContent = noteCopy.body;
    }
  };

  const shouldShowCommentVisibilitySection = () =>
    feedbackEntryMode === "direct" && getSelectedMessageType() === "feedback";

  const shouldRequireCommentVisibility = () =>
    shouldShowCommentVisibilitySection();

  const clearReviewVisibilityState = () => {
    if (reviewVisibilityPanel) {
      reviewVisibilityPanel.classList.remove("is-invalid");
      reviewVisibilityPanel.classList.remove("invalid-bounce");
    }

    reviewVisibilityFields.forEach((field) => {
      field.removeAttribute("aria-invalid");
    });

    const message = reviewVisibilityPanel?.querySelector(".feedback-validation-message");
    if (message) {
      message.textContent = "";
      message.hidden = true;
    }
  };

  const showReviewVisibilityState = () => {
    if (!reviewVisibilityPanel) return;

    reviewVisibilityPanel.classList.remove("invalid-bounce");
    void reviewVisibilityPanel.offsetWidth;
    reviewVisibilityPanel.classList.add("is-invalid");
    reviewVisibilityPanel.classList.add("invalid-bounce");

    reviewVisibilityFields.forEach((field) => {
      field.setAttribute("aria-invalid", "true");
    });

    let message = reviewVisibilityPanel.querySelector(".feedback-validation-message");
    if (!message) {
      message = document.createElement("small");
      message.className = "feedback-validation-message";
      reviewVisibilityPanel.append(message);
    }
    message.textContent = resolveInitialLanguage() === "de"
      ? "Waehlen Sie, ob Ihr Kommentar privat bleibt oder oeffentlich angezeigt werden darf."
      : "Choose whether your comment stays private or is published on the website.";
    message.hidden = false;
  };

  const syncReviewVisibilityState = (shouldHighlight = false) => {
    const shouldShowSection = shouldShowCommentVisibilitySection();
    const shouldRequire = shouldRequireCommentVisibility();

    if (reviewVisibilitySection) {
      reviewVisibilitySection.hidden = !shouldShowSection;
    }

    reviewVisibilityFields.forEach((field) => {
      field.disabled = !shouldRequire;
      if (!shouldRequire) {
        field.checked = false;
      }
    });

    if (!shouldShowSection) {
      clearReviewVisibilityState();
      return true;
    }

    if (!shouldRequire) {
      clearReviewVisibilityState();
      return true;
    }

    const hasSelection = Boolean(getCommentVisibilitySelection());
    if (!hasSelection && shouldHighlight) {
      showReviewVisibilityState();
      return false;
    }

    clearReviewVisibilityState();
    return hasSelection;
  };

  const getValidationTarget = (field) => {
    if (field instanceof HTMLInputElement && field.type === "checkbox") {
      return field.closest(".feedback-consent");
    }

    return field.closest(".feedback-field");
  };

  const getValidationMessageElement = (field) => {
    const target = getValidationTarget(field);
    if (!target) return null;

    let message = target.querySelector(".feedback-validation-message");
    if (message) return message;

    message = document.createElement("small");
    message.className = "feedback-validation-message";
    message.hidden = true;
    target.append(message);
    return message;
  };

  const getFieldErrorMessage = (field) => {
    const lang = resolveInitialLanguage();
    const copy = lang === "de"
      ? {
          required: "Dieses Feld ist erforderlich.",
          checkbox: "Diese Bestaetigung ist erforderlich.",
          email: "Geben Sie eine gueltige E-Mail-Adresse ein.",
          invalid: "Geben Sie einen gueltigen Wert ein."
        }
      : {
          required: "This field is required.",
          checkbox: "This confirmation is required.",
          email: "Enter a valid email address.",
          invalid: "Enter a valid value."
        };

    if (field instanceof HTMLInputElement && field.type === "checkbox") {
      return copy.checkbox;
    }

    if (field.validity.valueMissing) {
      return copy.required;
    }

    if (field instanceof HTMLInputElement && field.type === "email" && field.validity.typeMismatch) {
      return copy.email;
    }

    return copy.invalid;
  };

  const clearInvalidState = (field) => {
    const target = getValidationTarget(field);
    const message = getValidationMessageElement(field);

    if (target) {
      target.classList.remove("is-invalid");
      target.classList.remove("invalid-bounce");
    }

    if (message) {
      message.textContent = "";
      message.hidden = true;
    }

    if (
      field instanceof HTMLInputElement ||
      field instanceof HTMLTextAreaElement ||
      field instanceof HTMLSelectElement
    ) {
      field.removeAttribute("aria-invalid");
    }
  };

  const showInvalidState = (field) => {
    const target = getValidationTarget(field);
    const message = getValidationMessageElement(field);
    if (!target) return;

    target.classList.remove("invalid-bounce");
    void target.offsetWidth;
    target.classList.add("is-invalid");
    target.classList.add("invalid-bounce");

    if (message) {
      message.textContent = getFieldErrorMessage(field);
      message.hidden = false;
    }

    if (
      field instanceof HTMLInputElement ||
      field instanceof HTMLTextAreaElement ||
      field instanceof HTMLSelectElement
    ) {
      field.setAttribute("aria-invalid", "true");
    }
  };

  const applyModeState = () => {
    const mode = getSelectedMessageType();
    const hasSelection = Boolean(mode);
    const isContactMode = mode === "contact";
    const showFormFlow = feedbackEntryMode === "direct" && hasSelection;
    const lang = resolveInitialLanguage();
    const copy = lang === "de"
      ? {
          initialTitle: "Nachrichtentyp waehlen",
          feedbackTitle: "Feedback-Formular",
          contactTitle: "Kontaktformular",
          initialDescription: "Waehlen Sie Feedback oder Kontakt, um zu starten.",
          feedbackDescription: "Fuer Website-Feedback, Korrekturen und Bewertungen.",
          contactDescription: "Fuer direkte professionelle Anfragen.",
          initialTypeDescription: "Waehlen Sie das Formular, das Sie oeffnen moechten.",
          selectedTypeDescription: "Sie koennen den Typ vor dem Absenden noch aendern.",
          feedbackDetailsDescription: "Geben Sie Ihre Absenderdaten ein.",
          contactDetailsDescription: "Geben Sie Ihren Namen, Ihre E-Mail-Adresse, Ihr Unternehmen und Ihr Land ein.",
          feedbackNoteTitle: "Feedback-Formular",
          contactNoteTitle: "Kontaktformular",
          feedbackNoteCopy: "Direkte Uebermittlung ueber die Website. Oeffentlich nur bei Freigabe.",
          contactNoteCopy: "Direkte private Uebermittlung ueber die Website.",
          feedbackFirstNameLabel: "Vorname",
          contactFirstNameLabel: 'Name <span class="feedback-required-star" aria-hidden="true">*</span>',
          feedbackFirstNamePlaceholder: "Ihr Vorname",
          contactFirstNamePlaceholder: "Ihr vollstaendiger Name",
          feedbackCompanyLabel: 'Unternehmensname oder Hochschulname <span class="feedback-required-star" aria-hidden="true">*</span>',
          contactCompanyLabel: "Firmenname",
          feedbackCompanyPlaceholder: "Unternehmensname oder Hochschulname",
          contactCompanyPlaceholder: "Firmenname",
          feedbackMessageDescription: "Schreiben Sie Ihr Feedback klar und direkt.",
          contactMessageDescription: "Schreiben Sie Ihre Nachricht klar und professionell.",
          initialHeroEyebrow: "Passenden Weg waehlen",
          feedbackHeroEyebrow: "Portfolio-Feedback",
          contactHeroEyebrow: "Direkter Kontakt",
          initialHeroTitle: "Feedback oder Kontakt klar auswaehlen.",
          feedbackHeroTitle: "Website-Feedback klar senden.",
          contactHeroTitle: "Direkte Kontaktanfrage senden.",
          initialHeroLead: "Verwenden Sie das Feedback-Formular fuer Hinweise zur Website und das Kontaktformular fuer professionelle Anfragen. Beide Wege werden direkt ueber die Website uebermittelt.",
          feedbackHeroLead: "Nutzen Sie dieses Formular fuer Website-Feedback, Korrekturen, Vorschlaege und oeffentliche oder private Bewertungen. Alles geht direkt an Sooraj Sudhakaran.",
          contactHeroLead: "Nutzen Sie dieses Formular fuer Recruiter-Anfragen, Kooperationen und direkte professionelle Nachrichten. Diese Kontaktanfrage bleibt privat.",
          initialHeroPrimary: "Formular unten waehlen",
          feedbackHeroPrimary: "Zum Feedback-Formular",
          contactHeroPrimary: "Zum Kontaktformular",
          reviewVisibilityDescription: "Nachdem Sie einen Feedback-Kommentar geschrieben haben, waehlen Sie, ob er privat bleibt oder mit Ihrem Namen und Land oeffentlich angezeigt werden darf.",
          feedbackCommentsLabel: 'Kommentar <span class="feedback-required-star" aria-hidden="true">*</span>',
          contactCommentsLabel: 'Nachricht <span class="feedback-required-star" aria-hidden="true">*</span>',
          feedbackCommentsPlaceholder: "Beschreiben Sie Ihr Feedback oder Ihre Beobachtung.",
          contactCommentsPlaceholder: "Schreiben Sie Ihre Nachricht, Anfrage oder Ihren Kontaktgrund.",
          feedbackCommentsHint: "Nennen Sie das Thema, den Vorschlag oder den relevanten Kontext, den Sie teilen möchten.",
          contactCommentsHint: "Nennen Sie den Anlass Ihrer Kontaktaufnahme, relevanten Kontext und den gewuenschten naechsten Schritt.",
          feedbackFooter: "Ihre Nachricht wird direkt ueber die Website uebermittelt.",
          contactFooter: "Ihre Anfrage wird direkt ueber die Website uebermittelt.",
          feedbackSubmit: "Nachricht absenden",
          contactSubmit: "Formular absenden",
          continueFeedback: "Weiter zum Feedback-Formular",
          continueContact: "Weiter zum Kontaktformular",
          continueDefault: "Zum Formular weiter",
          changeType: "Anderes Formular waehlen",
          invalidSummary: "Bitte fuellen Sie die markierten Pflichtfelder korrekt aus.",
          submitting: "Wird gesendet...",
          submitError: "Die Uebermittlung ist fehlgeschlagen. Bitte pruefen Sie Ihre Verbindung und versuchen Sie es erneut."
        }
      : {
          initialTitle: "Choose message type",
          feedbackTitle: "Feedback form",
          contactTitle: "Contact form",
          initialDescription: "Select feedback or contact to start.",
          feedbackDescription: "For website feedback, corrections, and reviews.",
          contactDescription: "For direct professional enquiries.",
          initialTypeDescription: "Choose the form you want to open.",
          selectedTypeDescription: "You can change the form type before submitting.",
          feedbackDetailsDescription: "Add your sender details.",
          contactDetailsDescription: "Add your name, email, company, and country.",
          feedbackNoteTitle: "Feedback form",
          contactNoteTitle: "Contact form",
          feedbackNoteCopy: "Direct website submission. Public only if you allow it.",
          contactNoteCopy: "Direct private submission through the website.",
          feedbackFirstNameLabel: "First name",
          contactFirstNameLabel: 'Name <span class="feedback-required-star" aria-hidden="true">*</span>',
          feedbackFirstNamePlaceholder: "Your first name",
          contactFirstNamePlaceholder: "Your full name",
          feedbackCompanyLabel: 'Company or university name <span class="feedback-required-star" aria-hidden="true">*</span>',
          contactCompanyLabel: "Company name",
          feedbackCompanyPlaceholder: "Company or university name",
          contactCompanyPlaceholder: "Company name",
          feedbackMessageDescription: "Write your feedback clearly.",
          contactMessageDescription: "Write your message clearly and professionally.",
          initialHeroEyebrow: "Choose the right path",
          feedbackHeroEyebrow: "Portfolio feedback",
          contactHeroEyebrow: "Direct contact",
          initialHeroTitle: "Choose feedback or contact clearly.",
          feedbackHeroTitle: "Share website feedback clearly.",
          contactHeroTitle: "Send a direct contact request.",
          initialHeroLead: "Use the feedback form for website comments and suggestions, or choose the contact form for recruiter outreach and direct professional enquiries. Both are sent through the website.",
          feedbackHeroLead: "Use this form for website feedback, corrections, suggestions, and private or public reviews. Your submission goes directly to Sooraj Sudhakaran.",
          contactHeroLead: "Use this form for recruiter outreach, collaborations, and direct professional messages. This contact request stays private.",
          initialHeroPrimary: "Choose a form below",
          feedbackHeroPrimary: "Jump to feedback form",
          contactHeroPrimary: "Jump to contact form",
          reviewVisibilityDescription: "After writing a feedback comment, choose whether it stays private or can appear publicly with your name and country.",
          feedbackCommentsLabel: 'Comments <span class="feedback-required-star" aria-hidden="true">*</span>',
          contactCommentsLabel: 'Message <span class="feedback-required-star" aria-hidden="true">*</span>',
          feedbackCommentsPlaceholder: "Describe your feedback or observation.",
          contactCommentsPlaceholder: "Write your message, enquiry, or reason for contact.",
          feedbackCommentsHint: "Include the issue, suggestion, or context you want to share.",
          contactCommentsHint: "Include the reason for your contact, relevant context, and any next step you expect.",
          feedbackFooter: "Your message is submitted directly through the website.",
          contactFooter: "Your enquiry is submitted directly through the website.",
          feedbackSubmit: "Submit Message",
          contactSubmit: "Submit Form",
          continueFeedback: "Continue to feedback details",
          continueContact: "Continue to contact details",
          continueDefault: "Continue to details",
          changeType: "Choose another form",
          invalidSummary: "Please complete the highlighted required fields correctly.",
          submitting: "Submitting...",
          submitError: "Submission failed. Please check your connection and try again."
        };

    form.dataset.mode = mode || "unselected";
    form.dataset.entryMode = feedbackEntryMode;
    if (document.body.classList.contains("feedback-page")) {
      document.body.dataset.feedbackMode = mode || "unselected";
      document.body.dataset.feedbackEntryMode = feedbackEntryMode;
    }
    if (feedbackPage) {
      feedbackPage.dataset.mode = mode || "unselected";
      feedbackPage.dataset.entryMode = feedbackEntryMode;
    }
    if (formCard) {
      formCard.dataset.mode = mode || "unselected";
      formCard.dataset.entryMode = feedbackEntryMode;
      formCard.hidden = !showFormFlow;
    }

    if (postformGrid) {
      postformGrid.hidden = !showFormFlow;
    }

    heroEntryButtons.forEach((button) => {
      const isActiveChoice = showFormFlow && button.getAttribute("data-feedback-entry-choice") === mode;
      button.classList.toggle("is-active", isActiveChoice);
      button.setAttribute("aria-current", isActiveChoice ? "page" : "false");
    });

    if (formContent) {
      formContent.hidden = !showFormFlow;
    }

    flowFields.forEach((field) => {
      field.disabled = !showFormFlow;
    });

    feedbackOnlySections.forEach((element) => {
      element.hidden = !showFormFlow || isContactMode;
      element.querySelectorAll("input, textarea, select").forEach((field) => {
        field.disabled = !showFormFlow || isContactMode;
      });
    });

    feedbackNavLinks.forEach((link) => {
      link.hidden = !showFormFlow || isContactMode;
    });

    if (formNav) {
      formNav.hidden = !showFormFlow || isContactMode;
    }

    if (typeSection) {
      typeSection.hidden = showFormFlow;
    }

    if (continueButton) {
      continueButton.disabled = !hasSelection;
      continueButton.textContent = !hasSelection
        ? copy.continueDefault
        : isContactMode
          ? copy.continueContact
          : copy.continueFeedback;
    }

    if (changeModeLink) {
      changeModeLink.hidden = !showFormFlow;
      changeModeLink.textContent = copy.changeType;
    }

    if (firstNameField) {
      firstNameField.required = showFormFlow && isContactMode;
      if (!showFormFlow || !isContactMode) {
        clearInvalidState(firstNameField);
      }
    }

    if (lastNameFieldWrapper) {
      lastNameFieldWrapper.hidden = !showFormFlow || isContactMode;
    }

    if (lastNameField) {
      lastNameField.disabled = !showFormFlow || isContactMode;
      lastNameField.required = showFormFlow && !isContactMode;
      if (!showFormFlow || isContactMode) {
        lastNameField.value = "";
        clearInvalidState(lastNameField);
      }
    }

    if (companyField) {
      companyField.required = showFormFlow && !isContactMode;
      if (!showFormFlow || isContactMode) {
        clearInvalidState(companyField);
      }
    }

    const responsePreference = String(responsePreferenceField?.value || "");
    const needsCallNumber = showFormFlow && !isContactMode && responsePreference === "call-response";
    const needsLinkedProfile = showFormFlow && !isContactMode && responsePreference === "linkedin-response";

    if (phoneFieldWrapper) {
      phoneFieldWrapper.hidden = !needsCallNumber;
    }

    if (phoneField) {
      phoneField.disabled = !needsCallNumber;
      phoneField.required = needsCallNumber;
      if (!needsCallNumber) {
        phoneField.value = "";
        clearInvalidState(phoneField);
      }
    }

    if (referenceLinkField) {
      referenceLinkField.required = needsLinkedProfile;
      if (!needsLinkedProfile) {
        clearInvalidState(referenceLinkField);
      }
    }

    conditionalStars.forEach((star) => {
      const requirement = star.getAttribute("data-feedback-required-for");
      const shouldShow = showFormFlow && (
        (requirement === "contact" && isContactMode) ||
        (requirement === "linkedin-response" && needsLinkedProfile) ||
        (requirement === "call-response" && needsCallNumber)
      );
      star.hidden = !shouldShow;
    });

    if (formTitle) {
      formTitle.textContent = !hasSelection
        ? copy.initialTitle
        : isContactMode
          ? copy.contactTitle
          : copy.feedbackTitle;
    }

    if (formDescription) {
      formDescription.textContent = !hasSelection
        ? copy.initialDescription
        : isContactMode
          ? copy.contactDescription
          : copy.feedbackDescription;
    }

    if (heroEyebrow) {
      heroEyebrow.textContent = !hasSelection
        ? copy.initialHeroEyebrow
        : isContactMode
          ? copy.contactHeroEyebrow
          : copy.feedbackHeroEyebrow;
    }

    if (heroTitle) {
      heroTitle.textContent = !hasSelection
        ? copy.initialHeroTitle
        : isContactMode
          ? copy.contactHeroTitle
          : copy.feedbackHeroTitle;
    }

    if (heroLead) {
      heroLead.textContent = !hasSelection
        ? copy.initialHeroLead
        : isContactMode
          ? copy.contactHeroLead
          : copy.feedbackHeroLead;
    }

    if (heroPrimary) {
      heroPrimary.textContent = !hasSelection
        ? copy.initialHeroPrimary
        : isContactMode
          ? copy.contactHeroPrimary
          : copy.feedbackHeroPrimary;
      heroPrimary.setAttribute("href", "#feedback-form");
    }

    if (typeDescription) {
      typeDescription.textContent = hasSelection ? copy.selectedTypeDescription : copy.initialTypeDescription;
    }

    if (detailsDescription) {
      detailsDescription.textContent = isContactMode ? copy.contactDetailsDescription : copy.feedbackDetailsDescription;
    }

    if (firstNameLabel) {
      firstNameLabel.innerHTML = isContactMode ? copy.contactFirstNameLabel : copy.feedbackFirstNameLabel;
    }

    if (firstNameInput) {
      firstNameInput.setAttribute(
        "placeholder",
        isContactMode ? copy.contactFirstNamePlaceholder : copy.feedbackFirstNamePlaceholder
      );
      firstNameInput.setAttribute("autocomplete", isContactMode ? "name" : "given-name");
    }

    if (companyLabel) {
      companyLabel.innerHTML = isContactMode ? copy.contactCompanyLabel : copy.feedbackCompanyLabel;
    }

    if (companyInput) {
      companyInput.setAttribute(
        "placeholder",
        isContactMode ? copy.contactCompanyPlaceholder : copy.feedbackCompanyPlaceholder
      );
    }

    if (noteTitle) {
      noteTitle.textContent = isContactMode ? copy.contactNoteTitle : copy.feedbackNoteTitle;
    }

    if (noteCopy) {
      noteCopy.textContent = isContactMode ? copy.contactNoteCopy : copy.feedbackNoteCopy;
    }

    if (messageDescription) {
      messageDescription.textContent = isContactMode ? copy.contactMessageDescription : copy.feedbackMessageDescription;
    }

    if (reviewVisibilityDescription) {
      reviewVisibilityDescription.textContent = copy.reviewVisibilityDescription;
    }
    syncReviewVisibilityNote();

    if (commentsLabel) {
      commentsLabel.innerHTML = isContactMode ? copy.contactCommentsLabel : copy.feedbackCommentsLabel;
    }

    if (commentsInput) {
      commentsInput.setAttribute(
        "placeholder",
        isContactMode ? copy.contactCommentsPlaceholder : copy.feedbackCommentsPlaceholder
      );
    }

    if (commentsHint) {
      commentsHint.textContent = isContactMode ? copy.contactCommentsHint : copy.feedbackCommentsHint;
    }

    if (footerCopy) {
      footerCopy.textContent = isContactMode ? copy.contactFooter : copy.feedbackFooter;
    }

    if (submitButton) {
      submitButton.textContent = isContactMode ? copy.contactSubmit : copy.feedbackSubmit;
    }

    getRequiredFields().forEach((field) => {
      syncFieldValidity(field);
      clearInvalidState(field);
    });
    syncReviewVisibilityState();
  };

  const normalizeFieldValue = (field) => {
    if (
      (field instanceof HTMLInputElement && field.type !== "checkbox") ||
      field instanceof HTMLTextAreaElement
    ) {
      field.value = field.value.trim();
    }
  };

  const syncFieldValidity = (field) => {
    if (
      !(
        field instanceof HTMLInputElement ||
        field instanceof HTMLTextAreaElement ||
        field instanceof HTMLSelectElement
      )
    ) {
      return;
    }

    if (!field.required) {
      field.setCustomValidity("");
      return;
    }

    if (field instanceof HTMLInputElement && field.type === "checkbox") {
      field.setCustomValidity(field.checked ? "" : "Please check this field.");
      return;
    }

    if (!String(field.value || "").trim()) {
      field.setCustomValidity("Please fill out this field.");
      return;
    }

    field.setCustomValidity("");
  };

  const refreshFieldValidationState = (field, shouldHighlight = false) => {
    syncFieldValidity(field);

    if (shouldHighlight && !field.checkValidity()) {
      showInvalidState(field);
      return;
    }

    clearInvalidState(field);
  };

  const isFeedbackFormReady = () =>
    getRequiredFields().every((field) => {
      syncFieldValidity(field);
      return field.checkValidity();
    });

  const updateSubmitState = () => {
    if (!submitButton) return;
    submitButton.disabled = !getSelectedMessageType();
  };

  form.querySelectorAll("input, textarea, select").forEach((field) => {
    field.addEventListener("input", () => {
      clearFormStatus();
      refreshFieldValidationState(field, form.dataset.showValidation === "true");
      syncReviewVisibilityState(form.dataset.showValidation === "true");
      updateSubmitState();
    });

    field.addEventListener("blur", () => {
      normalizeFieldValue(field);
      clearFormStatus();
      refreshFieldValidationState(field, form.dataset.showValidation === "true");
      syncReviewVisibilityState(form.dataset.showValidation === "true");
      updateSubmitState();
    });
  });

  reviewVisibilityFields.forEach((field) => {
    field.addEventListener("change", () => {
      clearFormStatus();
      syncReviewVisibilityNote();
      syncReviewVisibilityState(form.dataset.showValidation === "true");
    });
  });

  messageTypeFields.forEach((field) => {
    field.addEventListener("change", () => {
      const selectedMode = getSelectedMessageType();
      if (feedbackEntryMode === "chooser" && selectedMode) {
        window.location.href = buildFeedbackModeUrl(selectedMode);
        return;
      }
      applyModeState();
      updateSubmitState();
      lastSelectedMessageType = getSelectedMessageType();
    });
  });

  if (continueButton) {
    continueButton.addEventListener("click", () => {
      const selectedMode = getSelectedMessageType();
      if (!selectedMode) return;
      window.location.href = buildFeedbackModeUrl(selectedMode);
    });
  }

  if (changeModeLink) {
    changeModeLink.addEventListener("click", () => {
      feedbackEntryMode = "chooser";
      applyModeState();
      updateSubmitState();
    });
  }

  if (responsePreferenceField) {
    responsePreferenceField.addEventListener("change", () => {
      applyModeState();
      updateSubmitState();
    });
  }

  renderFeedbackStats();
  if (statsAdmin) {
    statsAdmin.hidden = !isAdminMode;
  }
  if (statsLog) {
    statsLog.hidden = !isAdminMode;
  }
  if (statsAdminNote) {
    statsAdminNote.textContent = resolveInitialLanguage() === "de"
      ? "Private Admin-Steuerung"
      : "Private admin control";
  }
  if (statsRefreshButton) {
    statsRefreshButton.hidden = !isAdminMode;
    statsRefreshButton.addEventListener("click", async () => {
      await refreshStatsStatus();
    });
  }
  if (statsClearButton) {
    statsClearButton.hidden = !isAdminMode;
    statsClearButton.addEventListener("click", async () => {
      await clearStatsStatus();
    });
  }
  if (statsLogList) {
    statsLogList.addEventListener("click", async (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const id = target.getAttribute("data-feedback-stats-delete");
      if (!id || !isAdminMode) return;
      await deleteFeedbackStat(id);
    });
  }
  applyModeState();
  updateSubmitState();

  if (feedbackEntryMode === "direct" && requestedMode) {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        revealActiveFormSection();
      });
    });
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    clearFormStatus();
    form.dataset.showValidation = "true";
    const requiredFields = getRequiredFields();

    requiredFields.forEach((field) => {
      normalizeFieldValue(field);
      refreshFieldValidationState(field, true);
    });

    updateSubmitState();
    const isReviewVisibilityReady = syncReviewVisibilityState(true);
    if (!isFeedbackFormReady()) {
      const lang = resolveInitialLanguage();
      const invalidSummary = lang === "de"
        ? "Bitte fuellen Sie die markierten Pflichtfelder korrekt aus."
        : "Please complete the highlighted required fields correctly.";
      setFormStatus(invalidSummary, "error");
    const firstInvalidField = requiredFields.find((field) => !field.checkValidity());
      const firstInvalidTarget = firstInvalidField ? getValidationTarget(firstInvalidField) : null;

      if (firstInvalidField) {
        firstInvalidField.focus({ preventScroll: true });
      }

      if (firstInvalidTarget) {
        firstInvalidTarget.scrollIntoView({ behavior: "smooth", block: "center" });
      }

      return;
    }

    if (!isReviewVisibilityReady) {
      const invalidSummary = resolveInitialLanguage() === "de"
        ? "Bitte waehlen Sie, ob Ihr Feedback-Kommentar privat bleibt oder oeffentlich angezeigt werden darf."
        : "Please choose whether your feedback comment stays private or is published on the website.";
      setFormStatus(invalidSummary, "error");
      reviewVisibilityPanel?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const lang = resolveInitialLanguage();
    const template = FEEDBACK_MAIL_TEMPLATES[lang] || FEEDBACK_MAIL_TEMPLATES.en;
    const data = new FormData(form);
    const value = (name) => String(data.get(name) || "").trim();

    const messageType = value("messageType") || "feedback";
    const baseSubject = template.subjects?.[messageType] || template.subjects?.feedback || "";
    const intro = template.intros?.[messageType] || template.intros?.feedback || "";
    const messageTypeLabel =
      messageType === "contact"
        ? lang === "de"
          ? "Kontaktanfrage"
          : "Contact request"
        : lang === "de"
          ? "Feedback"
          : "Feedback";
    const firstName = value("firstName");
    const lastName = value("lastName");
    const fullName = [firstName, lastName].filter(Boolean).join(" ");
    const email = value("email");
    const country = value("country");
    const phone = value("phone");
    const company = value("company");
    const role = value("role");
    const referenceLink = value("referenceLink");
    const section = value("section");
    const rating = value("rating");
    const category = value("category");
    const responsePreferenceValue = value("responsePreference");
    const responsePreference = getSelectedOptionLabel(responsePreferenceField);
    const timeline = value("timeline");
    const reviewVisibility = messageType === "feedback"
      ? value("reviewVisibility") || "private"
      : "private";
    const reviewVisibilityLabel = messageType === "feedback"
      ? reviewVisibility === "public"
        ? lang === "de"
          ? "Oeffentlich"
          : "Public"
        : lang === "de"
          ? "Privat"
          : "Private"
      : "";
    const comments = value("comments");
    const suggestion = value("suggestion");
    const submittedAt = new Date().toISOString();
    const submissionId = createClientUuid();
    const derivedSubject = buildDerivedSubject(comments, category || baseSubject);
    const commentsOutputLabel = messageType === "contact"
      ? lang === "de"
        ? "Nachricht"
        : "Message"
      : template.labels.comments;

    const lines = [
      template.greeting,
      "",
      intro,
      ""
    ];

    if (messageType === "feedback") {
      lines.push(`${template.labels.messageType}: ${messageTypeLabel}`);
    }

    lines.push(
      `${template.labels.name}: ${fullName || lastName || firstName}`,
      `${template.labels.email}: ${email}`,
      `${template.labels.country}: ${country}`
    );

    if (phone) lines.push(`${template.labels.phone}: ${phone}`);
    if (company) lines.push(`${template.labels.company}: ${company}`);
    if (role) lines.push(`${template.labels.role}: ${role}`);
    if (referenceLink) lines.push(`${template.labels.referenceLink}: ${referenceLink}`);
    if (section) lines.push(`${template.labels.section}: ${section}`);
    if (rating) lines.push(`${template.labels.rating}: ${rating}`);
    if (category) lines.push(`${template.labels.category}: ${category}`);
    if (responsePreference) lines.push(`${template.labels.responsePreference}: ${responsePreference}`);
    if (timeline) lines.push(`${template.labels.timeline}: ${timeline}`);
    if (reviewVisibilityLabel) lines.push(`${template.labels.reviewVisibility}: ${reviewVisibilityLabel}`);

    lines.push("", `${commentsOutputLabel}:`, comments);

    if (suggestion) {
      lines.push("", `${template.labels.suggestion}:`, suggestion);
    }

    lines.push("", template.closing, fullName || lastName || firstName);

    const finalSubject = derivedSubject ? `${baseSubject}: ${derivedSubject}` : baseSubject;
    const requestBody = new FormData(form);
    requestBody.set("subject", finalSubject);
    requestBody.set("from_name", "Sooraj Sudhakaran Portfolio");
    requestBody.set("replyto", email);
    requestBody.set("message", lines.join("\r\n"));

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.setAttribute("aria-busy", "true");
      submitButton.textContent = lang === "de" ? "Wird gesendet..." : "Submitting...";
    }

    try {
      const response = await fetch(form.getAttribute("action") || WEB3FORMS_ENDPOINT, {
        method: "POST",
        body: requestBody,
        headers: {
          Accept: "application/json"
        }
      });

      const result = await response.json().catch(() => null);
      if (!response.ok || result?.success === false) {
        throw new Error(result?.message || "Submission failed");
      }

      const publicReview = messageType === "feedback" && reviewVisibility === "public"
        ? {
            id: submissionId,
            reviewerName: fullName || lastName || firstName,
            company,
            country,
            rating,
            reviewTitle: derivedSubject || category || "",
            reviewText: comments,
            submittedAt
          }
        : null;

      const recordResult = await recordFeedbackStat({
        id: submissionId,
        type: messageType,
        country,
        submittedAt,
        subject: derivedSubject || category || "",
        rating
      }, publicReview);
      trackAnalyticsEvent("form_submit_success", {
        page_path: window.location.pathname,
        message_type: messageType,
        response_preference: responsePreferenceValue || "not_specified",
        has_rating: rating ? "yes" : "no",
        review_visibility: reviewVisibility
      });
      sessionStorage.setItem(
        STORAGE_FEEDBACK_LAST_SUBMISSION_KEY,
        JSON.stringify({
          type: messageType,
          submittedAt,
          reviewVisibility,
          publicReviewRequested: Boolean(publicReview),
          publicReviewPublished: Boolean(publicReview) && Boolean(recordResult?.publicReviewPublished)
        })
      );
      persistRecentSubmission({
        type: messageType,
        submittedAt,
        reviewVisibility,
        publicReviewRequested: Boolean(publicReview),
        publicReviewPublished: Boolean(publicReview) && Boolean(recordResult?.publicReviewPublished)
      });
      form.reset();
      delete form.dataset.showValidation;
      clearFormStatus();
      applyModeState();
      updateSubmitState();
      const thankYouUrl = new URL("feedback-thank-you.html", window.location.href);
      thankYouUrl.searchParams.set("type", messageType);
      window.location.href = thankYouUrl.toString();
    } catch {
      const submitError = lang === "de"
        ? "Die Uebermittlung ist fehlgeschlagen. Bitte pruefen Sie Ihre Verbindung und versuchen Sie es erneut."
        : "Submission failed. Please check your connection and try again.";
      trackAnalyticsEvent("form_submit_error", {
        page_path: window.location.pathname,
        message_type: messageType
      });
      setFormStatus(submitError, "error");
    } finally {
      if (submitButton) {
        submitButton.removeAttribute("aria-busy");
        const isContactMode = getSelectedMessageType() === "contact";
        submitButton.textContent = lang === "de"
          ? isContactMode
            ? "Formular absenden"
            : "Nachricht absenden"
          : isContactMode
            ? "Submit Form"
            : "Submit Message";
        submitButton.disabled = !getSelectedMessageType();
      }
      updateSubmitState();
    }
  });
}

function setupRequestCvForm() {
  const form = document.querySelector("[data-request-cv-form]");
  if (!form) return;
  form.noValidate = true;

  const submitButton = form.querySelector("[data-request-cv-submit]");
  const formStatus = document.querySelector("[data-request-cv-status]");
  const statsAdminNote = document.querySelector("[data-feedback-stats-admin-note]");
  const statsRefreshButton = document.querySelector("[data-feedback-stats-refresh]");
  const statsClearButton = document.querySelector("[data-feedback-stats-clear]");
  const statsLogList = document.querySelector("[data-feedback-stats-log-list]");

  const getRequiredFields = () =>
    Array.from(form.querySelectorAll("[required]")).filter((field) => !field.disabled);

  const setFormStatus = (message = "", state = "error") => {
    if (!formStatus) return;
    formStatus.textContent = message;
    formStatus.dataset.state = state;
    formStatus.hidden = !message;
  };

  const clearFormStatus = () => {
    if (!formStatus) return;
    formStatus.textContent = "";
    formStatus.hidden = true;
    delete formStatus.dataset.state;
  };

  const getValidationTarget = (field) => field.closest(".feedback-field");

  const getValidationMessageElement = (field) => {
    const target = getValidationTarget(field);
    if (!target) return null;

    let message = target.querySelector(".feedback-validation-message");
    if (message) return message;

    message = document.createElement("small");
    message.className = "feedback-validation-message";
    message.hidden = true;
    target.append(message);
    return message;
  };

  const getFieldErrorMessage = (field) => {
    const lang = resolveInitialLanguage();
    const copy = lang === "de"
      ? {
          required: "Dieses Feld ist erforderlich.",
          email: "Geben Sie eine gueltige E-Mail-Adresse ein.",
          invalid: "Geben Sie einen gueltigen Wert ein."
        }
      : {
          required: "This field is required.",
          email: "Enter a valid email address.",
          invalid: "Enter a valid value."
        };

    if (field.validity.valueMissing) return copy.required;
    if (field instanceof HTMLInputElement && field.type === "email" && field.validity.typeMismatch) {
      return copy.email;
    }

    return copy.invalid;
  };

  const clearInvalidState = (field) => {
    const target = getValidationTarget(field);
    const message = getValidationMessageElement(field);

    if (target) {
      target.classList.remove("is-invalid", "invalid-bounce");
    }

    if (message) {
      message.textContent = "";
      message.hidden = true;
    }

    if (
      field instanceof HTMLInputElement ||
      field instanceof HTMLTextAreaElement ||
      field instanceof HTMLSelectElement
    ) {
      field.removeAttribute("aria-invalid");
    }
  };

  const showInvalidState = (field) => {
    const target = getValidationTarget(field);
    const message = getValidationMessageElement(field);
    if (!target) return;

    target.classList.remove("invalid-bounce");
    void target.offsetWidth;
    target.classList.add("is-invalid", "invalid-bounce");

    if (message) {
      message.textContent = getFieldErrorMessage(field);
      message.hidden = false;
    }

    if (
      field instanceof HTMLInputElement ||
      field instanceof HTMLTextAreaElement ||
      field instanceof HTMLSelectElement
    ) {
      field.setAttribute("aria-invalid", "true");
    }
  };

  const normalizeFieldValue = (field) => {
    if (
      (field instanceof HTMLInputElement && field.type !== "checkbox") ||
      field instanceof HTMLTextAreaElement
    ) {
      field.value = field.value.trim();
    }
  };

  const syncFieldValidity = (field) => {
    if (
      !(
        field instanceof HTMLInputElement ||
        field instanceof HTMLTextAreaElement ||
        field instanceof HTMLSelectElement
      )
    ) {
      return;
    }

    if (!field.required) {
      field.setCustomValidity("");
      return;
    }

    if (!String(field.value || "").trim()) {
      field.setCustomValidity("Please fill out this field.");
      return;
    }

    field.setCustomValidity("");
  };

  const refreshFieldValidationState = (field, shouldHighlight = false) => {
    syncFieldValidity(field);

    if (shouldHighlight && !field.checkValidity()) {
      showInvalidState(field);
      return;
    }

    clearInvalidState(field);
  };

  const isFormReady = () =>
    getRequiredFields().every((field) => {
      syncFieldValidity(field);
      return field.checkValidity();
    });

  const updateSubmitState = () => {
    if (!submitButton) return;
    submitButton.disabled = !isFormReady();
  };

  const renderRequestCvStats = (forceRefresh = false) => {
    return renderSubmissionSummary({
      scope: document,
      lang: resolveInitialLanguage(),
      isAdminMode: getAdminModeState(),
      forceRefresh
    });
  };

  form.querySelectorAll("input, textarea, select").forEach((field) => {
    field.addEventListener("input", () => {
      clearFormStatus();
      refreshFieldValidationState(field, form.dataset.showValidation === "true");
      updateSubmitState();
    });

    field.addEventListener("blur", () => {
      normalizeFieldValue(field);
      clearFormStatus();
      refreshFieldValidationState(field, form.dataset.showValidation === "true");
      updateSubmitState();
    });
  });

  renderRequestCvStats();
  if (statsRefreshButton) {
    statsRefreshButton.addEventListener("click", async () => {
      await renderRequestCvStats(true);
      if (statsAdminNote) {
        statsAdminNote.textContent = resolveInitialLanguage() === "de"
          ? "Status wurde gerade aktualisiert."
          : "Status refreshed just now.";
      }
    });
  }
  if (statsClearButton) {
    statsClearButton.addEventListener("click", async () => {
      await clearSharedSubmissionEvents();
      await renderRequestCvStats(true);
      if (statsAdminNote) {
        statsAdminNote.textContent = resolveInitialLanguage() === "de"
          ? "Status geloescht. Die Uebersicht wurde auf null zurueckgesetzt."
          : "Status cleared. Submission summary reset to zero.";
      }
    });
  }
  if (statsLogList) {
    statsLogList.addEventListener("click", async (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const id = target.getAttribute("data-feedback-stats-delete");
      if (!id || !getAdminModeState()) return;
      if (!await deleteSharedSubmissionEvent(id)) return;
      await renderRequestCvStats(true);
      if (statsAdminNote) {
        statsAdminNote.textContent = resolveInitialLanguage() === "de"
          ? "Eintrag geloescht."
          : "Entry deleted.";
      }
    });
  }
  updateSubmitState();

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    clearFormStatus();
    form.dataset.showValidation = "true";
    const requiredFields = getRequiredFields();

    requiredFields.forEach((field) => {
      normalizeFieldValue(field);
      refreshFieldValidationState(field, true);
    });

    updateSubmitState();
    if (!isFormReady()) {
      const lang = resolveInitialLanguage();
      const invalidSummary = lang === "de"
        ? "Bitte fuellen Sie die markierten Pflichtfelder korrekt aus."
        : "Please complete the highlighted required fields correctly.";
      setFormStatus(invalidSummary, "error");
      const firstInvalidField = requiredFields.find((field) => !field.checkValidity());
      const firstInvalidTarget = firstInvalidField ? getValidationTarget(firstInvalidField) : null;

      if (firstInvalidField) {
        firstInvalidField.focus({ preventScroll: true });
      }

      if (firstInvalidTarget) {
        firstInvalidTarget.scrollIntoView({ behavior: "smooth", block: "center" });
      }

      return;
    }

    const lang = resolveInitialLanguage();
    const formData = new FormData(form);
    const value = (name) => String(formData.get(name) || "").trim();
    const fullName = value("fullName");
    const company = value("company");
    const role = value("role");
    const email = value("email");
    const country = value("country");
    const note = value("note");
    const subject = lang === "de" ? "Neue CV-Anfrage ueber die Portfolio-Website" : "New CV request from the portfolio website";
    const lines = [
      lang === "de" ? "Hallo Sooraj Sudhakaran," : "Hello Sooraj Sudhakaran,",
      "",
      lang === "de"
        ? "eine Besucherin oder ein Besucher Ihrer Website hat Ihren aktuellen CV angefragt."
        : "A visitor requested your latest CV from the website.",
      "",
      `${lang === "de" ? "Anfragetyp" : "Request type"}: ${lang === "de" ? "CV-Anfrage" : "CV request"}`,
      `${lang === "de" ? "E-Mail" : "Email"}: ${email}`
    ];

    if (fullName) lines.push(`${lang === "de" ? "Name" : "Name"}: ${fullName}`);
    if (company) lines.push(`${lang === "de" ? "Unternehmen" : "Company"}: ${company}`);
    if (role) lines.push(`${lang === "de" ? "Rolle" : "Role"}: ${role}`);
    if (country) lines.push(`${lang === "de" ? "Land" : "Country"}: ${country}`);
    if (note) {
      lines.push("", `${lang === "de" ? "Zusätzliche Notiz" : "Additional note"}:`, note);
    }

    lines.push(
      "",
      lang === "de"
        ? "Die angeforderte CV-Datei soll an die oben angegebene E-Mail-Adresse gesendet werden."
        : "The requested CV should be sent to the email address above."
    );

    formData.set("subject", subject);
    formData.set("from_name", "Sooraj Sudhakaran Portfolio");
    formData.set("replyto", email);
    formData.set("message", lines.join("\r\n"));

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.setAttribute("aria-busy", "true");
      submitButton.textContent = lang === "de" ? "Wird gesendet..." : "Submitting...";
    }

    try {
      const response = await fetch(form.getAttribute("action") || WEB3FORMS_ENDPOINT, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json"
        }
      });

      const result = await response.json().catch(() => null);
      if (!response.ok || result?.success === false) {
        throw new Error(result?.message || "Submission failed");
      }

      await recordSharedSubmissionEvent({
        id: createClientUuid(),
        type: "cv",
        country,
        submittedAt: new Date().toISOString(),
        subject: lang === "de" ? "CV-Anfrage" : "CV request"
      });
      await renderRequestCvStats(true);
      trackAnalyticsEvent("cv_request_submit_success", {
        page_path: window.location.pathname,
        has_company: company ? "yes" : "no",
        has_country: country ? "yes" : "no"
      });
      sessionStorage.setItem(
        STORAGE_FEEDBACK_LAST_SUBMISSION_KEY,
        JSON.stringify({
          type: "cv",
          submittedAt: new Date().toISOString()
        })
      );
      persistRecentSubmission({
        type: "cv",
        submittedAt: new Date().toISOString()
      });
      form.reset();
      delete form.dataset.showValidation;
      clearFormStatus();
      updateSubmitState();
      const thankYouUrl = new URL("feedback-thank-you.html", window.location.href);
      thankYouUrl.searchParams.set("type", "cv");
      window.location.href = thankYouUrl.toString();
    } catch {
      const submitError = lang === "de"
        ? "Die Uebermittlung ist fehlgeschlagen. Bitte pruefen Sie Ihre Verbindung und versuchen Sie es erneut."
        : "Submission failed. Please check your connection and try again.";
      trackAnalyticsEvent("cv_request_submit_error", {
        page_path: window.location.pathname
      });
      setFormStatus(submitError, "error");
    } finally {
      if (submitButton) {
        submitButton.removeAttribute("aria-busy");
        submitButton.textContent = lang === "de" ? "CV-Anfrage absenden" : "Submit CV Request";
      }
      updateSubmitState();
    }
  });
}

async function setupFeedbackThankYouPage() {
  const title = document.querySelector("[data-feedback-thankyou-title]");
  if (!title) return;

  const statusValue = document.querySelector("[data-feedback-thankyou-status]");
  const reviewCountValue = document.querySelector("[data-feedback-thankyou-review-count]");
  const averageRatingValue = document.querySelector("[data-feedback-thankyou-average-rating]");
  const lead = document.querySelector("[data-feedback-thankyou-lead]");
  const publicReviewNote = document.querySelector("[data-feedback-thankyou-public-note]");
  const primaryLinks = Array.from(document.querySelectorAll("[data-feedback-thankyou-primary-link]"));
  const reviewTrigger = document.querySelector("[data-feedback-thankyou-review-trigger]");
  const reviewPanel = document.querySelector("[data-feedback-thankyou-review-panel]");
  const summaryTrigger = document.querySelector("[data-feedback-thankyou-summary-trigger]");
  const summaryPanel = document.querySelector("[data-feedback-thankyou-summary-panel]");
  const panelTriggers = Array.from(document.querySelectorAll("[data-feedback-panel-trigger]"));
  let storedSubmission = null;
  try {
    storedSubmission = JSON.parse(sessionStorage.getItem(STORAGE_FEEDBACK_LAST_SUBMISSION_KEY) || "null");
  } catch {
    storedSubmission = null;
  }

  const requestedType = storedSubmission?.type || new URLSearchParams(window.location.search).get("type");
  const mode = requestedType === "contact"
    ? "contact"
    : requestedType === "cv"
      ? "cv"
      : "feedback";
  const lang = resolveInitialLanguage();
  const submittedAt = storedSubmission?.submittedAt
    ? new Date(storedSubmission.submittedAt)
    : new Date();
  const submittedAtLabel = Number.isNaN(submittedAt.getTime())
    ? ""
    : formatUpdatedTimestamp(submittedAt, lang);
  const publicReviews = await loadSharedPublicReviews();
  const { ratings, average } = calculatePublicReviewMetrics(publicReviews);
  const averageRating = ratings.length
    ? `${average.toFixed(1)}/5`
    : "";

  const copy = lang === "de"
    ? {
        feedbackTitle: "Feedback erhalten",
        contactTitle: "Kontaktanfrage erhalten",
        cvTitle: "CV-Anfrage erhalten",
        lead: "Ihr Formular wurde erfolgreich gesendet.",
        cvLead: "Vielen Dank. Ihre CV-Anfrage wurde erfolgreich uebermittelt. Sooraj Sudhakaran sendet den angeforderten CV per E-Mail.",
        status: "Erfolgreich gesendet",
        cvStatus: "CV-Anfrage uebermittelt",
        cvPrimary: "Neue CV-Anfrage",
        noRatings: "Noch keine Bewertungen",
        publicReviewPublished: "Ihre oeffentliche Bewertung ist jetzt fuer alle Website-Besucher sichtbar.",
        publicReviewUnavailable: "Ihre Nachricht wurde empfangen, aber die oeffentliche Bewertung konnte nicht fuer alle Besucher veroeffentlicht werden. Bitte richten Sie den gemeinsamen Reviewspeicher ein oder versuchen Sie es spaeter erneut."
      }
    : {
        feedbackTitle: "Feedback received",
        contactTitle: "Contact request received",
        cvTitle: "CV request received",
        lead: "Your form was submitted successfully.",
        cvLead: "Thank you. Your CV request was submitted successfully. Sooraj Sudhakaran will send the requested CV by email.",
        status: "Submitted successfully",
        cvStatus: "CV request submitted",
        cvPrimary: "Submit another CV request",
        noRatings: "No ratings yet",
        publicReviewPublished: "Your public review is now visible to all website visitors.",
        publicReviewUnavailable: "Your message was received, but the public review could not be published for all visitors. Set up the shared review store or try again later."
      };

  title.textContent = mode === "contact"
    ? copy.contactTitle
    : mode === "cv"
      ? copy.cvTitle
      : copy.feedbackTitle;
  if (lead) {
    lead.textContent = mode === "cv" ? copy.cvLead : copy.lead;
  }
  if (statusValue) {
    statusValue.textContent = mode === "cv" ? copy.cvStatus : copy.status;
  }
  if (reviewCountValue) {
    reviewCountValue.textContent = String(publicReviews.length);
  }
  if (averageRatingValue) {
    averageRatingValue.textContent = averageRating || copy.noRatings;
  }
  if (publicReviewNote) {
    const reviewVisibility = String(storedSubmission?.reviewVisibility || "");
    const publicReviewRequested = Boolean(storedSubmission?.publicReviewRequested || reviewVisibility === "public");
    const publicReviewPublished = Boolean(storedSubmission?.publicReviewPublished);
    const noteText = mode === "feedback" && publicReviewRequested
      ? (publicReviewPublished ? copy.publicReviewPublished : copy.publicReviewUnavailable)
      : "";
    publicReviewNote.textContent = noteText;
    publicReviewNote.hidden = !noteText;
  }
  await renderPublicReviewLists({ scope: document });
  await renderSubmissionSummary({
    scope: document,
    lang,
    isAdminMode: getAdminModeState()
  });
  setupAdminWorkspace();
  primaryLinks.forEach((link) => {
    if (!(link instanceof HTMLAnchorElement)) return;
    if (mode === "cv") {
      link.href = REQUEST_CV_PAGE;
      link.textContent = copy.cvPrimary;
    } else {
      link.href = "feedback.html";
      link.textContent = lang === "de" ? "Neues Formular senden" : "Submit new form";
    }
  });
  if (reviewTrigger) {
    reviewTrigger.hidden = mode === "cv";
  }
  if (reviewPanel) {
    reviewPanel.hidden = mode === "cv";
    if (mode === "cv" && reviewPanel instanceof HTMLDetailsElement) {
      reviewPanel.open = false;
    }
  }
  if (summaryTrigger) {
    summaryTrigger.hidden = false;
  }
  if (summaryPanel) {
    summaryPanel.hidden = false;
  }

  panelTriggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const targetId = trigger.getAttribute("data-feedback-panel-trigger");
      if (!targetId) return;
      const panel = document.getElementById(targetId);
      if (!(panel instanceof HTMLDetailsElement)) return;
      panel.open = true;
      panel.scrollIntoView({ behavior: "smooth", block: "start" });
      const summary = panel.querySelector("summary");
      if (summary instanceof HTMLElement) {
        window.setTimeout(() => summary.focus({ preventScroll: true }), 180);
      }
    });
  });
}

async function setupPublicReviewSummary({ publicReviews: providedPublicReviews = null, forceRefresh = false } = {}) {
  const section = document.querySelector("[data-public-review-section]");
  if (!section) return;

  const averageValue = document.querySelector("[data-public-review-average]");
  const metricAverageValue = document.querySelector("[data-public-review-metric-average]");
  const reviewCountValue = document.querySelector("[data-public-review-count]");
  const reachValue = document.querySelector("[data-public-review-reach]");
  const reachFlags = document.querySelector("[data-public-review-reach-flags]");
  const captionValue = document.querySelector("[data-public-review-caption]");
  const distributionList = document.querySelector("[data-public-review-distribution]");
  const countryList = document.querySelector("[data-public-review-countries]");
  const starsShell = document.querySelector("[data-public-review-stars-shell]");
  const starsFill = document.querySelector("[data-public-review-stars-fill]");

  const lang = resolveInitialLanguage();
  const copy = getPublicReviewUiCopy(lang);

  const publicReviews = Array.isArray(providedPublicReviews)
    ? buildPublicReviews(providedPublicReviews)
    : await loadSharedPublicReviews({ forceRefresh });
  const { ratings, average, countryEntries } = calculatePublicReviewMetrics(publicReviews);
  const averageLabel = ratings.length ? `${average.toFixed(1)}/5` : copy.noRatings;
  const reviewCount = publicReviews.length;
  const reachCount = countryEntries.length;

  if (averageValue) {
    averageValue.textContent = averageLabel;
  }
  if (metricAverageValue) {
    metricAverageValue.textContent = averageLabel;
  }
  if (reviewCountValue) {
    reviewCountValue.textContent = String(reviewCount);
  }
  if (reachValue) {
    reachValue.textContent = `${reachCount} ${copy.countries}`;
  }
  if (reachFlags) {
    reachFlags.innerHTML = "";
    if (!countryEntries.length) {
      reachFlags.hidden = true;
    } else {
      reachFlags.hidden = false;
      countryEntries.slice(0, 8).forEach(([country]) => {
        const countryMeta = getCountryDisplayMeta(country === "__unknown__" ? "" : country, copy.countryFallback);
        const flag = document.createElement("span");
        flag.className = "review-reach-flag";
        flag.textContent = countryMeta.flag;
        flag.setAttribute("title", countryMeta.label);
        flag.setAttribute("aria-label", countryMeta.label);
        reachFlags.append(flag);
      });
    }
  }
  if (captionValue) {
    captionValue.textContent = ratings.length ? copy.basedOn(ratings.length) : copy.awaiting;
  }
  if (starsShell) {
    starsShell.setAttribute("aria-label", ratings.length ? copy.ratingLabel(average.toFixed(1)) : copy.noRatings);
  }
  if (starsFill) {
    starsFill.style.width = `${Math.max(0, Math.min(100, (average / 5) * 100))}%`;
  }

  if (distributionList) {
    distributionList.innerHTML = "";
    if (!ratings.length) {
      const empty = document.createElement("span");
      empty.className = "feedback-stats-empty";
      empty.textContent = copy.noReviews;
      distributionList.append(empty);
    } else {
      [5, 4, 3, 2, 1].forEach((ratingValue) => {
        const count = ratings.filter((value) => value === ratingValue).length;
        const row = document.createElement("div");
        row.className = "review-distribution-row";
        const width = `${(count / ratings.length) * 100}%`;
        row.innerHTML = `
          <span class="review-distribution-label">${ratingValue}★</span>
          <span class="review-distribution-bar"><span class="review-distribution-bar-fill" style="width: ${width}"></span></span>
          <strong class="review-distribution-count">${count}</strong>
        `;
        distributionList.append(row);
      });
    }
  }

  if (countryList) {
    countryList.innerHTML = "";
    if (!countryEntries.length) {
      const empty = document.createElement("span");
      empty.className = "feedback-stats-empty";
      empty.textContent = copy.noReviews;
      countryList.append(empty);
    } else {
      countryEntries.slice(0, 4).forEach(([country, count]) => {
        const countryMeta = getCountryDisplayMeta(country === "__unknown__" ? "" : country, copy.countryFallback);
        const item = document.createElement("span");
        item.className = "review-country-chip";
        item.innerHTML = `<span class="review-country-flag" aria-hidden="true">${escapeHtml(countryMeta.flag)}</span><span>${escapeHtml(countryMeta.label)} · ${escapeHtml(count)}</span>`;
        countryList.append(item);
      });
    }
  }
}

const SITE_UPDATE_TRACKED_FILES = [
  "index.html",
  "journey.html",
  "feedback.html",
  "request-cv.html",
  "feedback-thank-you.html",
  "experience-working-student-keba.html",
  "experience-masters-thesis-keba.html",
  "experience-ndt-technician.html",
  "project-autonomous-vacuum-robot.html",
  "project-vr-machine-workshop.html",
  "project-active-suspension.html",
  "project-topology-bag-sealer.html",
  "project-service-robot.html",
  "style.css",
  "app.js"
];

function formatUpdatedTimestamp(date, lang) {
  const locale = lang === "de" ? "de-DE" : "en-GB";
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function getUpdateAgeState(date, lang) {
  const ageMs = Date.now() - date.getTime();
  const ageDays = ageMs / (1000 * 60 * 60 * 24);

  if (ageDays > 30) {
    return lang === "de"
      ? { key: "stale", badge: "Aelter", hint: "Mehr als 30 Tage alt" }
      : { key: "stale", badge: "Older", hint: "More than 30 days old" };
  }

  if (ageDays > 7) {
    return lang === "de"
      ? { key: "review", badge: "Pruefen", hint: "Mehr als 7 Tage alt" }
      : { key: "review", badge: "Review", hint: "More than 7 days old" };
  }

  return lang === "de"
    ? { key: "fresh", badge: "Aktuell", hint: "Innerhalb der letzten 7 Tage aktualisiert" }
    : { key: "fresh", badge: "Updated", hint: "Updated within the last 7 days" };
}

async function fetchModifiedAt(pathname) {
  const resourceUrl = new URL(pathname, window.location.href);
  const requestOptions = {
    cache: "no-store",
    headers: {
      "Cache-Control": "no-cache"
    }
  };

  for (const method of ["HEAD", "GET"]) {
    try {
      const response = await fetch(resourceUrl, {
        ...requestOptions,
        method
      });
      if (!response.ok) continue;
      const header = response.headers.get("last-modified");
      if (!header) continue;
      const modifiedAt = new Date(header);
      if (!Number.isNaN(modifiedAt.getTime())) return modifiedAt;
    } catch (error) {
      continue;
    }
  }

  return null;
}

async function resolveLatestSiteUpdate() {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  const trackedPaths = Array.from(new Set([currentPage, ...SITE_UPDATE_TRACKED_FILES]));
  const dates = await Promise.all(trackedPaths.map(fetchModifiedAt));
  const validDates = dates.filter(Boolean);

  if (!validDates.length) {
    const fallback = new Date(document.lastModified);
    return Number.isNaN(fallback.getTime()) ? null : fallback;
  }

  return validDates.reduce((latest, candidate) => (
    candidate > latest ? candidate : latest
  ));
}

async function fetchSharedSiteUpdateOverride() {
  try {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
      .from(SUPABASE_SITE_STATE_TABLE)
      .select("updated_at")
      .eq("id", SUPABASE_SITE_UPDATE_STATE_ID)
      .maybeSingle();

    if (error || !data?.updated_at) {
      return null;
    }

    const overrideDate = new Date(data.updated_at);
    return Number.isNaN(overrideDate.getTime()) ? null : overrideDate;
  } catch {
    return null;
  }
}

async function saveSharedSiteUpdateOverride(date) {
  const supabase = await getSupabaseClient();
  const { error } = await supabase
    .from(SUPABASE_SITE_STATE_TABLE)
    .upsert(
      {
        id: SUPABASE_SITE_UPDATE_STATE_ID,
        updated_at: date.toISOString()
      },
      { onConflict: "id" }
    );

  if (error) {
    throw error;
  }
}

async function fetchSharedReviewPromptSettings() {
  try {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
      .from(SUPABASE_SITE_STATE_TABLE)
      .select("settings")
      .eq("id", SUPABASE_REVIEW_PROMPT_STATE_ID)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return normalizeReviewPromptSettings(data?.settings);
  } catch {
    return normalizeReviewPromptSettings();
  }
}

async function fetchSharedPublicSiteDefaults() {
  try {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
      .from(SUPABASE_SITE_STATE_TABLE)
      .select("settings")
      .eq("id", SUPABASE_SITE_DEFAULTS_STATE_ID)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return normalizePublicSiteDefaults(data?.settings);
  } catch {
    return loadStoredPublicSiteDefaults();
  }
}

async function loadSharedPublicSiteDefaults({ forceRefresh = false } = {}) {
  if (!forceRefresh && sharedPublicSiteDefaultsCache) {
    return sharedPublicSiteDefaultsCache;
  }

  if (!forceRefresh && sharedPublicSiteDefaultsPromise) {
    return sharedPublicSiteDefaultsPromise;
  }

  sharedPublicSiteDefaultsPromise = fetchSharedPublicSiteDefaults()
    .then((defaults) => {
      const normalizedDefaults = normalizePublicSiteDefaults(defaults);
      sharedPublicSiteDefaultsCache = normalizedDefaults;
      saveStoredPublicSiteDefaults(normalizedDefaults);
      return normalizedDefaults;
    })
    .finally(() => {
      sharedPublicSiteDefaultsPromise = null;
    });

  return sharedPublicSiteDefaultsPromise;
}

async function saveSharedPublicSiteDefaults(defaults) {
  const normalizedDefaults = normalizePublicSiteDefaults(defaults);
  const supabase = await getSupabaseClient();
  const { error } = await supabase
    .from(SUPABASE_SITE_STATE_TABLE)
    .upsert(
      {
        id: SUPABASE_SITE_DEFAULTS_STATE_ID,
        updated_at: new Date().toISOString(),
        settings: normalizedDefaults
      },
      { onConflict: "id" }
    );

  if (error) {
    throw error;
  }

  sharedPublicSiteDefaultsCache = normalizedDefaults;
  saveStoredPublicSiteDefaults(normalizedDefaults);
  return normalizedDefaults;
}

async function hydrateSharedPublicSiteDefaults({ forceRefresh = false } = {}) {
  await loadSharedPublicSiteDefaults({ forceRefresh });
}

async function loadSharedReviewPromptSettings({ forceRefresh = false } = {}) {
  if (!forceRefresh && sharedReviewPromptSettingsCache) {
    return sharedReviewPromptSettingsCache;
  }

  if (!forceRefresh && sharedReviewPromptSettingsPromise) {
    return sharedReviewPromptSettingsPromise;
  }

  sharedReviewPromptSettingsPromise = fetchSharedReviewPromptSettings()
    .then((settings) => {
      sharedReviewPromptSettingsCache = settings;
      return settings;
    })
    .finally(() => {
      sharedReviewPromptSettingsPromise = null;
    });

  return sharedReviewPromptSettingsPromise;
}

async function saveSharedReviewPromptSettings(settings) {
  const normalizedSettings = normalizeReviewPromptSettings(settings);
  const supabase = await getSupabaseClient();
  const { error } = await supabase
    .from(SUPABASE_SITE_STATE_TABLE)
    .upsert(
      {
        id: SUPABASE_REVIEW_PROMPT_STATE_ID,
        updated_at: new Date().toISOString(),
        settings: normalizedSettings
      },
      { onConflict: "id" }
    );

  if (error) {
    throw error;
  }

  sharedReviewPromptSettingsCache = normalizedSettings;
  return normalizedSettings;
}

async function fetchHelpBotSessions({ limit = 20 } = {}) {
  try {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
      .from(SUPABASE_HELP_BOT_SESSIONS_TABLE)
      .select("session_id,created_at,updated_at,ended_at,page_path,role_id,visitor_name,visitor_position,visitor_organization,student_university,message_count,transcript_json")
      .order("updated_at", { ascending: false })
      .limit(Math.max(1, Math.min(50, Number(limit) || 20)));

    if (error) {
      throw error;
    }

    return Array.isArray(data)
      ? data.map(normalizeHelpBotSessionEntry).filter(Boolean)
      : [];
  } catch {
    return [];
  }
}

async function deleteHelpBotSession(sessionId) {
  const normalizedId = String(sessionId || "").trim();
  if (!normalizedId) {
    throw new Error("Missing chatbot session id.");
  }

  const supabase = await getSupabaseClient();
  const { error } = await supabase
    .from(SUPABASE_HELP_BOT_SESSIONS_TABLE)
    .delete()
    .eq("session_id", normalizedId);

  if (error) {
    throw error;
  }
}

async function setupLastUpdated() {
  const isAdminMode = getAdminModeState();
  const fallbackModifiedAt = new Date(document.lastModified);
  if (Number.isNaN(fallbackModifiedAt.getTime())) return;

  const lang = document.documentElement.lang === "de" ? "de" : "en";
  const label = lang === "de" ? "Zuletzt aktualisiert" : "Last updated";
  const adminButtonLabel = lang === "de" ? "Update-Zeit aktualisieren" : "Refresh update time";
  const nav = document.querySelector(".nav");
  if (!nav) return;

  const populateUpdateBar = (targetBar) => {
    const container = document.createElement("div");
    container.className = "container top-update-inner";

    const text = document.createElement("span");
    text.className = "top-update-text";

    const icon = document.createElement("span");
    icon.className = "top-update-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = "↻";

    const badge = document.createElement("span");
    badge.className = "top-update-badge";

    const meta = document.createElement("span");
    meta.className = "top-update-meta";

    text.append(icon, badge, meta);

    const adminButton = document.createElement("button");
    adminButton.type = "button";
    adminButton.className = "top-update-admin-btn";
    adminButton.hidden = true;
    adminButton.textContent = adminButtonLabel;

    container.append(text, adminButton);
    targetBar.replaceChildren(container);
  };

  let bar = nav.nextElementSibling;
  if (!bar || !bar.classList.contains("top-update-bar")) {
    bar = document.createElement("div");
    bar.className = "top-update-bar";
    populateUpdateBar(bar);
    nav.insertAdjacentElement("afterend", bar);
  } else if (!bar.querySelector(".top-update-text")) {
    populateUpdateBar(bar);
  }

  const text = bar.querySelector(".top-update-text");
  const adminButton = bar.querySelector(".top-update-admin-btn");
  if (!text) return;
  const badge = text.querySelector(".top-update-badge");
  const meta = text.querySelector(".top-update-meta");
  const applyUpdateState = (date) => {
    const state = getUpdateAgeState(date, lang);
    text.dataset.updateAge = state.key;
    text.setAttribute("title", state.hint);
    if (badge) {
      badge.textContent = state.badge;
    }
    if (meta) {
      meta.textContent = `${label}: ${formatUpdatedTimestamp(date, lang)}`;
    }
  };

  applyUpdateState(fallbackModifiedAt);

  const [latestModifiedAt, sharedOverrideDate] = await Promise.all([
    resolveLatestSiteUpdate(),
    fetchSharedSiteUpdateOverride()
  ]);
  const effectiveDate = sharedOverrideDate && (!latestModifiedAt || sharedOverrideDate > latestModifiedAt)
    ? sharedOverrideDate
    : latestModifiedAt;

  if (effectiveDate) {
    applyUpdateState(effectiveDate);
  }

  if (!adminButton) return;
  adminButton.textContent = adminButtonLabel;
  adminButton.hidden = !isAdminMode;
  adminButton.addEventListener("click", async () => {
    const now = new Date();
    try {
      await saveSharedSiteUpdateOverride(now);
      applyUpdateState(now);
    } catch (error) {
      // Keep the current visible state if the shared update write fails.
    }
  });
}

function decorateContactLinks() {
  const specs = [
    {
      match: (href, link) => /(^|\/)request-cv\.html(?:$|[?#])/i.test(href) || /\brequest cv\b/i.test(link.textContent || ""),
      icon: "assets/images/request cv.png",
      typeClass: "icon-request-cv",
      alt: ""
    },
    {
      match: (href, link) => href.startsWith("mailto:soorajsudhakaran1199@gmail.com") || /\b(contact|email)\b/i.test(link.textContent || ""),
      icon: "assets/images/Contacts_icon_(2022).svg.png",
      typeClass: "icon-contact",
      alt: ""
    },
    {
      match: (href) => href.includes("github.com/SoorajSudhakaran1199"),
      icon: "assets/images/GitHub_Invertocat_Logo.svg",
      typeClass: "icon-github",
      alt: ""
    },
    {
      match: (href) => href.includes("linkedin.com/in/sooraj-sudhakaran1999"),
      icon: "assets/images/LinkedIn_icon.svg.png",
      typeClass: "icon-linkedin",
      alt: ""
    },
    {
      match: (href, link) => /(^|\/|#)journey\.html$|journey\.html|#journey-preview/.test(href) || /\b(journey|werdegang)\b/i.test(link.textContent || ""),
      icon: "assets/images/my journey .webp",
      typeClass: "icon-journey",
      alt: ""
    },
    {
      match: (href, link) => /#(about|where-i-fit)$/.test(href) || /\b(where i fit|wo ich passe|role match)\b/i.test(link.textContent || ""),
      icon: "assets/images/check where i fit logo.webp",
      typeClass: "icon-fit",
      alt: ""
    }
  ];

  document.querySelectorAll("a[href]").forEach((link) => {
    if (link.closest(".nav")) return;

    const href = link.getAttribute("href") || "";
    const spec = specs.find((item) => item.match(href, link));
    if (!spec) return;

    const isButton = link.classList.contains("btn");
    link.classList.add("link-with-icon", spec.typeClass);

    if (isButton) {
      link.classList.add("btn-with-icon");
      if (spec.typeClass === "icon-github") {
        link.classList.add("btn-social", "btn-github");
      }
      if (spec.typeClass === "icon-linkedin") {
        link.classList.add("btn-social", "btn-linkedin");
      }
    }

    if (link.querySelector(".link-icon")) return;

    const iconWrap = document.createElement("span");
    iconWrap.className = "link-icon";
    iconWrap.setAttribute("aria-hidden", "true");

    const img = document.createElement("img");
    img.src = spec.icon;
    img.alt = spec.alt;
    img.decoding = "async";
    iconWrap.appendChild(img);

    link.prepend(iconWrap);
  });
}

async function setupHomepageReviewPrompt() {
  const settings = await loadSharedReviewPromptSettings();
  if (shouldSkipHomepageReviewPrompt(settings)) return;

  const lang = resolveInitialLanguage();
  const copy = getHomepageReviewPromptCopy(lang);
  const prompt = document.createElement("aside");
  prompt.className = "review-prompt";
  prompt.hidden = true;
  prompt.setAttribute("aria-hidden", "true");
  prompt.setAttribute("aria-live", "polite");
  prompt.innerHTML = `
    <button class="review-prompt-close" type="button" aria-label="${escapeHtml(copy.close)}">x</button>
    <div class="review-prompt-persona">
      <span class="review-prompt-avatar" aria-hidden="true">
        <img src="assets/images/profile/sooraj-sudhakaran-profile.jpeg" alt="" />
      </span>
      <div class="review-prompt-persona-copy">
        <span class="review-prompt-kicker">${escapeHtml(copy.kicker)}</span>
        <p class="review-prompt-intro">${escapeHtml(copy.intro)}</p>
        <p class="review-prompt-persona-note">${escapeHtml(copy.personaNote)}</p>
      </div>
    </div>
    <h2 class="review-prompt-title">${escapeHtml(copy.title)}</h2>
    <p class="review-prompt-copy">${escapeHtml(copy.body)}</p>
    <div class="review-prompt-actions">
      <button class="review-prompt-action review-prompt-action-primary review-prompt-action-contact" type="button">${escapeHtml(copy.connect)}</button>
      <a class="review-prompt-action review-prompt-action-feedback" href="feedback.html?type=feedback#feedback-form">${escapeHtml(copy.primary)}</a>
    </div>
    <button class="review-prompt-action review-prompt-action-secondary" type="button">${escapeHtml(copy.secondary)}</button>
    <p class="review-prompt-note">${escapeHtml(copy.note)}</p>
  `;
  document.body.append(prompt);

  const dismissButton = prompt.querySelector(".review-prompt-close");
  const secondaryButton = prompt.querySelector(".review-prompt-action-secondary");
  const feedbackLink = prompt.querySelector(".review-prompt-action-feedback");
  const contactButton = prompt.querySelector(".review-prompt-action-contact");
  const sectionNodes = Array.from(document.querySelectorAll("main section[id], section[id]"));
  const lastSection = sectionNodes.length ? sectionNodes[sectionNodes.length - 1] : null;
  const scrollThreshold = clampNumber(
    settings.scrollPercent,
    0,
    100,
    DEFAULT_REVIEW_PROMPT_SETTINGS.scrollPercent
  ) / 100;
  const delayMs = clampNumber(
    settings.delaySeconds,
    0,
    300,
    DEFAULT_REVIEW_PROMPT_SETTINGS.delaySeconds
  ) * 1000;
  let delayReached = false;
  let engagementReached = false;
  let isVisible = false;
  let isContactModalOpen = false;

  const syncPromptLayoutState = () => {
    const shouldReserveSpace = isVisible && !isContactModalOpen;
    document.body.classList.toggle("review-prompt-active", shouldReserveSpace);
    if (shouldReserveSpace) {
      const nextOffset = Math.ceil(prompt.getBoundingClientRect().height + 18);
      document.body.style.setProperty("--review-prompt-offset", `${nextOffset}px`);
      return;
    }
    document.body.style.removeProperty("--review-prompt-offset");
  };

  const recordPromptState = (patch) => {
    const currentState = loadStoredJson(localStorage, STORAGE_HOMEPAGE_REVIEW_PROMPT_KEY) || {};
    saveStoredJson(localStorage, STORAGE_HOMEPAGE_REVIEW_PROMPT_KEY, {
      ...currentState,
      ...patch
    });
  };

  const contactModal = createHomepageContactRequestModal(copy, {
    onToggle: (open) => {
      isContactModalOpen = Boolean(open);
      syncPromptLayoutState();
    },
    onSuccess: (submissionRecord) => {
      recordPromptState({
        startedAt: submissionRecord.submittedAt
      });
      hidePrompt("submitted");
    }
  });

  const hidePrompt = (reason) => {
    if (contactModal.isOpen()) {
      contactModal.closeModal({ restoreFocus: false });
    }
    if (!isVisible) return;

    isVisible = false;
    prompt.classList.remove("is-visible");
    prompt.setAttribute("aria-hidden", "true");
    syncPromptLayoutState();
    window.setTimeout(() => {
      prompt.hidden = true;
    }, 220);

    if (reason === "dismissed") {
      recordPromptState({ dismissedAt: new Date().toISOString() });
      trackAnalyticsEvent("homepage_review_prompt_dismissed", {
        page_path: window.location.pathname
      });
    }
  };

  const maybeShowPrompt = () => {
    if (isVisible || !delayReached || !engagementReached || shouldSkipHomepageReviewPrompt(settings)) {
      return;
    }

    isVisible = true;
    recordPromptState({ shownAt: new Date().toISOString() });
    prompt.hidden = false;
    prompt.setAttribute("aria-hidden", "false");
    window.requestAnimationFrame(() => {
      prompt.classList.add("is-visible");
      syncPromptLayoutState();
    });
    trackAnalyticsEvent("homepage_review_prompt_shown", {
      page_path: window.location.pathname
    });
  };

  const handleScrollProgress = () => {
    const scrollRange = Math.max(document.documentElement.scrollHeight - window.innerHeight, 0);
    const progress = scrollRange > 0 ? window.scrollY / scrollRange : 1;
    const lastSectionReached = settings.triggerOnFinalSection && lastSection instanceof HTMLElement
      ? lastSection.getBoundingClientRect().top <= window.innerHeight * 0.9
      : false;
    if (progress >= scrollThreshold || lastSectionReached) {
      engagementReached = true;
      window.removeEventListener("scroll", handleScrollProgress);
      maybeShowPrompt();
    }
  };

  window.setTimeout(() => {
    delayReached = true;
    maybeShowPrompt();
  }, delayMs);

  window.addEventListener("scroll", handleScrollProgress, { passive: true });
  handleScrollProgress();

  dismissButton?.addEventListener("click", () => {
    hidePrompt("dismissed");
  });

  secondaryButton?.addEventListener("click", () => {
    hidePrompt("dismissed");
  });

  contactButton?.addEventListener("click", () => {
    const startedAt = new Date().toISOString();
    recordPromptState({ startedAt });
    trackAnalyticsEvent("homepage_review_prompt_contact_opened", {
      page_path: window.location.pathname
    });
    contactModal.openModal(contactButton);
  });

  feedbackLink?.addEventListener("click", () => {
    recordPromptState({ startedAt: new Date().toISOString() });
    trackAnalyticsEvent("homepage_review_prompt_started", {
      page_path: window.location.pathname
    });
  });

  if (typeof ResizeObserver === "function") {
    const resizeObserver = new ResizeObserver(() => {
      syncPromptLayoutState();
    });
    resizeObserver.observe(prompt);
  }

  window.addEventListener("resize", syncPromptLayoutState, { passive: true });
  syncPromptLayoutState();

  document.addEventListener("keydown", (event) => {
    if (contactModal.isOpen()) return;
    if (event.key === "Escape") {
      hidePrompt("dismissed");
    }
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  loadSiteAnalytics();
  setupAnalyticsClickTracking();
  await hydrateSharedPublicSiteDefaults();
  applyTheme(resolveInitialTheme());
  setupLanguageSwitcher();
  setupThemeToggle();
  setupFooterDeclaration();
  populateCountrySelects();

  // Start the shared visual systems first so public visitors still get
  // the animated background even if auth or admin-only UI loads slowly.
  setupParticles();
  setupRouteGlobe();

  await initializeAdminAuth();
  setupAdminModeControl();
  setupHomepageSectionFilter();
  setupMobileNav();
  setupReveal();
  setupSmoothAnchorScroll();
  setupActiveNav();
  setupSectionTargetHighlight();
  setupDetailOriginTracking();
  setupSmartDetailBack();
  setupVisibleBackButton();
  setupPortfolioHelpBot();
  setupFeedbackForm();
  setupRequestCvForm();
  setupFeedbackThankYouPage();
  await setupLastUpdated();
  setupPublicReviewPanels();
  setupPublicReviewAdminActions();
  setupPublicReviewAutoRefresh();
  await refreshPublicReviewUi({ forceRefresh: true });
  await setupHomepageReviewPrompt();
  setupAdminWorkspace();
  setupStoredReturnPosition();
  decorateContactLinks();
});
