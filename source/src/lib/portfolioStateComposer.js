import { getLocalizedPortfolioData } from '../data/portfolioData.js';
import { mergePortfolioAdminState } from './portfolioAdminService.js';

const splitList = (value = '') => String(value || '')
  .split(/\n|,/)
  .map((item) => item.trim())
  .filter(Boolean);

const cleanString = (value = '') => String(value || '').trim();

function getSectionVisibility(state) {
  const merged = mergePortfolioAdminState(state);
  return merged.sectionVisibility;
}

function normalizeProject(item = {}, fallback = {}) {
  const title = cleanString(item.title) || 'New portfolio project';
  const description = cleanString(item.description) || cleanString(fallback.description) || 'Project summary pending.';
  const result = cleanString(item.result) || cleanString(fallback.result) || description;
  const tech = splitList(item.tech).length ? splitList(item.tech) : ['Portfolio update'];
  const cardBullets = splitList(item.cardBullets).length ? splitList(item.cardBullets) : [description];
  const evidenceBullets = splitList(item.evidenceBullets).length ? splitList(item.evidenceBullets) : [result];

  return {
    ...fallback,
    ...item,
    title,
    image: cleanString(item.imageUrl) || item.image || fallback.image,
    period: cleanString(item.period) || cleanString(fallback.period) || 'Portfolio update',
    priority: cleanString(item.priority) || 'Admin-added portfolio item',
    description,
    result,
    cardBullets,
    evidenceBullets,
    proofLinks: [],
    tech,
    caseStudy: {
      ...(fallback.caseStudy || {}),
      focus: cleanString(item.focus) || description,
      problem: cleanString(item.problem) || description,
      role: cleanString(item.role) || 'Added from the portfolio admin panel for public review.',
      architecture: cleanString(item.architecture) || 'Portfolio-admin entry -> public project card -> case-study detail view.',
      toolsUsed: tech,
      improvement: cleanString(item.improvement) || 'Keep this entry updated with more specific proof, visuals, and results.',
      challenge: cleanString(item.challenge) || description,
      approach: cardBullets,
      deliverables: evidenceBullets,
      details: splitList(item.details).length ? splitList(item.details) : [description],
      impact: cleanString(item.impact) || result,
    },
  };
}

function normalizeExperience(item = {}, fallback = {}) {
  const role = cleanString(item.role) || 'New experience entry';
  const company = cleanString(item.company) || 'Company pending';
  const description = cleanString(item.description) || 'Experience summary pending.';
  const highlights = splitList(item.highlights).length ? splitList(item.highlights) : ['Admin-added experience'];

  return {
    ...fallback,
    ...item,
    role,
    company,
    logo: cleanString(item.logoUrl) || item.logo || fallback.logo,
    date: cleanString(item.date) || 'Timeline pending',
    location: cleanString(item.location) || 'Location pending',
    description,
    highlights,
    details: {
      ...(fallback.details || {}),
      focus: cleanString(item.focus) || description,
      responsibilities: splitList(item.responsibilities).length ? splitList(item.responsibilities) : highlights,
      outcomes: splitList(item.outcomes).length ? splitList(item.outcomes) : [description],
      environment: splitList(item.environment).length ? splitList(item.environment) : highlights,
    },
  };
}

function normalizeEducation(item = {}, fallback = {}) {
  return {
    ...fallback,
    ...item,
    logo: cleanString(item.logoUrl) || item.logo || fallback.logo,
    year: cleanString(item.year) || 'Year pending',
    degree: cleanString(item.degree) || 'New education entry',
    university: cleanString(item.university) || 'Institution pending',
    country: cleanString(item.country) || 'Country pending',
    specialization: cleanString(item.specialization) || 'Education details pending.',
    url: cleanString(item.url) || fallback.url || '#education',
  };
}

function normalizeCertificate(item = {}, fallback = {}) {
  return {
    ...fallback,
    ...item,
    title: cleanString(item.title) || 'New certificate',
    description: cleanString(item.description) || 'Certificate details pending.',
    url: cleanString(item.url) || fallback.url || '#education',
  };
}

export function getComposedPortfolioData(language = 'en', adminState = {}) {
  const baseData = getLocalizedPortfolioData(language);
  const mergedState = mergePortfolioAdminState(adminState);
  const fallbackProject = baseData.projects[0] || {};
  const fallbackExperience = baseData.experiences[0] || {};
  const fallbackEducation = baseData.education[0] || {};
  const fallbackCertificate = baseData.certificates[0] || {};

  const personal = {
    ...baseData.personal,
    ...Object.fromEntries(
      Object.entries(mergedState.personalOverrides || {})
        .map(([key, value]) => [key, cleanString(value)])
        .filter(([, value]) => value),
    ),
    websiteUpdatedAt: mergedState.websiteUpdatedAt || baseData.personal.websiteUpdatedAt,
  };

  if (personal.email) {
    personal.social = {
      ...baseData.personal.social,
      ...personal.social,
      email: `mailto:${personal.email}`,
    };
  }

  return {
    ...baseData,
    personal,
    projects: [
      ...mergedState.additions.projects.map((item) => normalizeProject(item, fallbackProject)),
      ...baseData.projects,
    ],
    experiences: [
      ...mergedState.additions.experiences.map((item) => normalizeExperience(item, fallbackExperience)),
      ...baseData.experiences,
    ],
    education: [
      ...mergedState.additions.education.map((item) => normalizeEducation(item, fallbackEducation)),
      ...baseData.education,
    ],
    certificates: [
      ...mergedState.additions.certificates.map((item) => normalizeCertificate(item, fallbackCertificate)),
      ...baseData.certificates,
    ],
    sectionVisibility: getSectionVisibility(mergedState),
    adminState: mergedState,
  };
}
