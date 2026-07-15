import { getLocalizedPortfolioData, personal } from './portfolioData.js';
import { casualChatEntries, casualChatStats, findCasualChatEntry } from './helpBotCasualKnowledge.js';

const MIN_MATCH_SCORE = 8;
const DIRECT_MATCH_SCORE = 30;
const FUZZY_CONFIRMATION_SCORE = 72;
const QUESTION_BANK_BASE_STATS = {
  intents: 196,
  questions: 2850,
};

const DISALLOWED_INPUT_PATTERN = /\b(fuck|fucking|shit|bitch|asshole|bastard|cunt|dick|motherfucker|idiot|stupid)\b/i;
const CONFIDENTIAL_DATA_PATTERN = /\b(password|passcode|pin code|login credential|admin access|private key|api key|secret key|access token|auth token|environment variable|database credential|backend secret|phone number|mobile number|personal number|home address|house address|residential address|street address|exact address|date of birth|birth date|birthday|family details|parent details|sibling details|relationship status|girlfriend|boyfriend|wife|husband|medical record|health condition|disease|passport number|passport copy|aadhar|aadhaar|identity card|id card number|visa document number|residence permit number|bank account|bank details|iban|upi id|payment details|credit card|debit card|salary slip|current salary|manager name|colleague phone|reference phone|referee phone|company secret|internal keba|confidential thesis|private project file|internal source code)\b/i;

const STOP_WORDS = new Set([
  'a', 'about', 'am', 'an', 'and', 'any', 'are', 'as', 'at', 'be', 'but', 'by', 'can', 'could',
  'der', 'die', 'das', 'dem', 'den', 'des', 'do', 'does', 'du', 'for', 'from', 'give', 'has',
  'have', 'he', 'her', 'here', 'him', 'his', 'how', 'i', 'ich', 'im', 'in', 'is', 'it', 'me',
  'mein', 'mit', 'of', 'on', 'or', 'please', 'show', 'so', 'tell', 'that', 'the', 'this', 'to',
  'und', 'was', 'what', 'when', 'where', 'which', 'who', 'why', 'wie', 'with', 'you', 'your',
]);

let questionBankIntentPromise = null;
let fuzzyCandidatePromise = null;

const buildIntent = (id, keywords = [], questions = []) => ({ id, keywords, questions });

const EXTRA_INTENTS = [
  buildIntent('recruiter-screen-summary', ['recruiter screen', 'hiring screen', 'shortlist', 'candidate summary', 'screening notes'], [
    'Give me a recruiter screening summary.',
    'How should a recruiter evaluate Sooraj quickly?',
    'Is Sooraj worth shortlisting?',
    'Summarize Sooraj for hiring review.',
  ]),
  buildIntent('recruiter-risk-review', ['risk', 'gaps', 'concerns', 'limitations', 'missing proof', 'hiring risk'], [
    'What are the hiring risks?',
    'What gaps should a recruiter check?',
    'What is missing from the portfolio?',
    'What should I verify before interviewing Sooraj?',
  ]),
  buildIntent('recruiter-interview-plan', ['interview plan', 'screening questions', 'technical interview', 'interview topics'], [
    'What should I ask Sooraj in an interview?',
    'Give me technical interview questions for Sooraj.',
    'How should I interview him for robotics?',
    'What interview plan fits this profile?',
  ]),
  buildIntent('role-robotics-software', ['robotics software engineer', 'robot software', 'software robotics role', 'robotics developer'], [
    'How well does Sooraj fit a robotics software engineer role?',
    'Is Sooraj suitable for robot software engineering?',
    'Assess him for a robotics developer position.',
  ]),
  buildIntent('role-automation-engineer', ['automation engineer', 'industrial automation', 'automation role', 'factory automation'], [
    'Does Sooraj fit an automation engineer role?',
    'How suitable is he for industrial automation?',
    'Assess Sooraj for automation engineering.',
  ]),
  buildIntent('role-simulation-engineer', ['simulation engineer', 'simulation role', 'digital twin', 'modeling simulation'], [
    'Does Sooraj fit simulation engineering?',
    'Assess Sooraj for a simulation engineer role.',
    'How strong is his simulation profile?',
  ]),
  buildIntent('role-mechatronics-engineer', ['mechatronics engineer', 'mechatronics role', 'mechanical plus software', 'electromechanical'], [
    'Does Sooraj fit a mechatronics role?',
    'How does his profile fit mechatronics engineering?',
  ]),
  buildIntent('role-ros-developer', ['ros developer', 'ros engineer', 'ros role', 'ros navigation'], [
    'Does Sooraj fit a ROS developer role?',
    'How strong is Sooraj in ROS?',
    'Assess Sooraj for ROS engineering.',
  ]),
  buildIntent('technical-depth-overview', ['technical depth', 'engineering depth', 'deep technical', 'technical signal'], [
    'How technically deep is this portfolio?',
    'What is the strongest technical signal?',
    'Explain the technical depth.',
  ]),
  buildIntent('robotics-basics', ['what is robotics', 'robotics meaning', 'robotics basics', 'robotics explanation'], [
    'What is robotics?',
    'Explain robotics simply.',
    'How does robotics connect to this portfolio?',
  ]),
  buildIntent('ros-basics', ['what is ros', 'ros basics', 'robot operating system', 'ros explanation'], [
    'What is ROS?',
    'Explain Robot Operating System.',
    'Why is ROS important for Sooraj?',
  ]),
  buildIntent('ros2-basics', ['ros2', 'ros 2', 'ros two', 'ros1 vs ros2'], [
    'What is ROS 2?',
    'Does Sooraj know ROS 2?',
    'What is the difference between ROS and ROS 2?',
  ]),
  buildIntent('slam-basics', ['slam', 'mapping', 'localization', 'simultaneous localization mapping'], [
    'What is SLAM?',
    'Explain mapping and localization.',
    'How does SLAM relate to the vacuum robot project?',
  ]),
  buildIntent('motion-planning-basics', ['motion planning', 'path planning', 'trajectory planning', 'waypoints'], [
    'What is motion planning?',
    'Explain path planning in robotics.',
    'How does Sooraj show motion planning?',
  ]),
  buildIntent('collision-avoidance-basics', ['collision avoidance', 'collision checking', 'obstacle avoidance', 'safe motion'], [
    'What is collision avoidance?',
    'How does collision-aware robotics appear in the portfolio?',
  ]),
  buildIntent('gazebo-rviz-basics', ['gazebo', 'rviz', 'robot simulation tools', 'visualization tools'], [
    'What are Gazebo and RViz?',
    'How are Gazebo and RViz used in Sooraj’s projects?',
  ]),
  buildIntent('matlab-simulink-basics', ['matlab', 'simulink', 'control modeling', 'dynamic modeling'], [
    'How does Sooraj use MATLAB and Simulink?',
    'What does the active suspension project prove?',
  ]),
  buildIntent('unity-xr-basics', ['unity', 'csharp', 'c#', 'xr', 'virtual reality', 'vr training'], [
    'How does Sooraj use Unity?',
    'Explain the VR workshop technically.',
  ]),
  buildIntent('embedded-arduino-basics', ['arduino', 'embedded', 'sensors', 'motor control', 'line tracking'], [
    'What embedded experience does Sooraj have?',
    'Explain the Arduino service robot.',
  ]),
  buildIntent('python-cpp-balance', ['python c++', 'programming languages', 'coding stack', 'software stack'], [
    'What programming languages does Sooraj use?',
    'How strong is his coding stack?',
    'Explain his Python and C++ balance.',
  ]),
  buildIntent('mechanical-software-integration', ['mechanical software integration', 'mechatronics integration', 'mechanical to software'], [
    'How does Sooraj combine mechanical and software engineering?',
    'Is his profile more mechanical or software?',
  ]),
  buildIntent('industrial-context', ['industrial context', 'deployment context', 'factory floor', 'real world engineering'], [
    'What industrial context does Sooraj have?',
    'Does the portfolio show real-world engineering?',
  ]),
  buildIntent('keba-company-context', ['keba', 'keba group', 'keba context', 'industrial robotics at keba'], [
    'Why is KEBA important in this portfolio?',
    'What does KEBA add to Sooraj’s profile?',
  ]),
  buildIntent('dragbot-context', ['drag and bot', 'drag&bot', 'dragbot', 'robot workflow platform'], [
    'What is drag&bot in the thesis context?',
    'How does drag&bot relate to Sooraj’s work?',
  ]),
  buildIntent('project-comparison', ['compare projects', 'best project', 'project ranking', 'strongest project'], [
    'Compare Sooraj’s projects.',
    'Which project is strongest?',
    'Rank the portfolio projects.',
  ]),
  buildIntent('project-timeline', ['project timeline', 'chronology', 'when projects', 'project dates'], [
    'What is the project timeline?',
    'When did Sooraj do these projects?',
  ]),
  buildIntent('portfolio-navigation', ['navigate site', 'where should i go', 'site navigation', 'portfolio guide'], [
    'Guide me through the portfolio.',
    'Where should I start on this site?',
    'What section should I open first?',
  ]),
  buildIntent('recommendation-submit-flow', ['submit recommendation', 'add recommendation', 'recommend sooraj', 'write recommendation'], [
    'How can someone recommend Sooraj?',
    'How does the recommendation form work?',
    'Where do I add a recommendation?',
  ]),
  buildIntent('recommendation-admin-flow', ['approve recommendation', 'admin review recommendation', 'pending recommendation', 'verification flow'], [
    'How does admin verify recommendations?',
    'How are recommendations approved?',
    'Does pending verification really work?',
  ]),
  buildIntent('supabase-status', ['supabase', 'backend table', 'live database', 'recommendations table'], [
    'Is the Supabase backend connected?',
    'What database table is needed?',
    'Why are recommendations not saving live?',
  ]),
  buildIntent('privacy-local-storage', ['local storage', 'browser storage', 'chat storage', 'privacy storage'], [
    'Where are chat messages stored?',
    'Does the chatbot save my data?',
    'Explain localStorage privacy.',
  ]),
  buildIntent('website-stack-deep', ['react vite', 'website stack', 'frontend stack', 'how website built'], [
    'How is this website built?',
    'Explain the portfolio tech stack.',
    'Is this a React website?',
  ]),
  buildIntent('quality-of-portfolio', ['portfolio quality', 'website quality', 'is website good', 'portfolio review'], [
    'Is this portfolio good?',
    'Review the quality of the portfolio.',
    'What makes this portfolio strong?',
  ]),
  buildIntent('portfolio-improvements', ['portfolio improvements', 'improve website', 'missing improvements', 'what to improve'], [
    'How can this portfolio be improved?',
    'What should Sooraj improve on the website?',
  ]),
  buildIntent('certification-overview', ['certificates', 'certifications', 'training certificates', 'credentials'], [
    'What certificates does Sooraj have?',
    'Explain Sooraj’s certifications.',
  ]),
  buildIntent('education-germany', ['thd', 'deggendorf', 'masters germany', 'mechatronics cyber physical'], [
    'What is Sooraj studying in Germany?',
    'Explain his THD education.',
  ]),
  buildIntent('education-india', ['ktu', 'btech', 'mechanical engineering india', 'bachelor india'], [
    'What did Sooraj study in India?',
    'Explain his bachelor background.',
  ]),
  buildIntent('ndt-experience', ['ndt', 'non destructive testing', 'inspection', 'quality inspection'], [
    'What is Sooraj’s NDT experience?',
    'How does NDT help the Sooraj portfolio?',
  ]),
  buildIntent('cover-letter-help', ['cover letter', 'application summary', 'write application', 'motivation letter'], [
    'Can you help write a cover letter summary?',
    'Give me an application summary for Sooraj.',
  ]),
  buildIntent('cv-bullet-help', ['cv bullets', 'resume bullets', 'cv wording', 'resume wording'], [
    'Give resume bullets for Sooraj.',
    'How should Sooraj describe his projects on a CV?',
  ]),
  buildIntent('learning-roadmap', ['learning roadmap', 'what should he learn', 'next skills', 'skill roadmap'], [
    'What should Sooraj learn next?',
    'Give a learning roadmap for this profile.',
  ]),
  buildIntent('portfolio-for-students', ['student advice', 'students', 'learn from portfolio', 'how to build portfolio'], [
    'What can students learn from this portfolio?',
    'How can a student use this site as a model?',
  ]),
  buildIntent('portfolio-for-recruiters', ['recruiter advice', 'recruiters', 'hiring manager', 'talent acquisition'], [
    'How should recruiters use this portfolio?',
    'What should hiring managers look at?',
  ]),
  buildIntent('general-ai-question', ['artificial intelligence', 'ai basics', 'machine learning', 'ai explanation'], [
    'What is AI?',
    'What is machine learning?',
    'How does AI relate to robotics?',
  ]),
  buildIntent('general-control-systems', ['control systems', 'pid', 'feedback control', 'controller'], [
    'What are control systems?',
    'How do controls relate to robotics?',
  ]),
  buildIntent('general-sensors', ['sensors', 'sensor fusion', 'lidar', 'camera sensor', 'encoder'], [
    'What sensors are used in robotics?',
    'Explain sensors in robotics.',
  ]),
  buildIntent('general-digital-twin', ['digital twin', 'virtual commissioning', 'simulation twin'], [
    'What is a digital twin?',
    'How does simulation relate to digital twins?',
  ]),
  buildIntent('general-industry-4', ['industry 4.0', 'smart manufacturing', 'industrial iot', 'iiot'], [
    'What is Industry 4.0?',
    'How does Sooraj fit smart manufacturing?',
  ]),
  buildIntent('general-autonomous-robot', ['autonomous robot', 'autonomy', 'mobile robot autonomy'], [
    'What is an autonomous robot?',
    'How does Sooraj show autonomy experience?',
  ]),
  buildIntent('general-industrial-robot', ['industrial robot', 'six axis robot', '6 axis robot', 'robot arm'], [
    'What is an industrial robot?',
    'How does the 6-axis robot project matter?',
  ]),
  buildIntent('general-service-robot', ['service robot', 'hospitality robot', 'line following robot'], [
    'What is a service robot?',
    'How does Sooraj’s service robot work?',
  ]),
  buildIntent('general-hmi', ['hmi', 'human machine interface', 'operator interface'], [
    'What is HMI?',
    'How does HMI relate to automation?',
  ]),
  buildIntent('general-websockets', ['websocket', 'websockets', 'real time communication'], [
    'What are WebSockets?',
    'Why are WebSockets useful in robotics tools?',
  ]),
  buildIntent('general-robot-program-simulation', ['robot program simulation', 'robot programming simulation', 'waypoint validation', 'validation data'], [
    'Why does robot-program simulation matter in the KEBA project?',
    'How does waypoint validation work?',
  ]),
  buildIntent('general-git-github', ['git', 'github', 'version control', 'source code'], [
    'Why does GitHub matter for this portfolio?',
    'How should I read Sooraj’s GitHub signal?',
  ]),
  buildIntent('general-professional-summary', ['professional summary', 'elevator pitch', 'pitch', 'short intro'], [
    'Give me an elevator pitch for Sooraj.',
    'Summarize Sooraj in two sentences.',
  ]),
  buildIntent('general-long-profile', ['detailed profile', 'long summary', 'full profile', 'deep profile'], [
    'Give me a detailed profile of Sooraj.',
    'Explain the whole portfolio in detail.',
  ]),
  buildIntent('general-contact-message', ['contact message', 'email template', 'message sooraj', 'reach out template'], [
    'Write a message to contact Sooraj.',
    'Give me an email template for Sooraj.',
  ]),
  buildIntent('general-reference-meaning', ['reference meaning', 'recommendation meaning', 'testimonial', 'professional reference'], [
    'What does the recommendation section mean?',
    'Why are verified references important?',
  ]),
  buildIntent('general-out-of-scope', ['weather', 'news', 'stock price', 'sports', 'random facts'], [
    'Can you tell me the weather?',
    'Give me news.',
    'What is the stock price?',
  ]),
  buildIntent('career-complete-history', ['complete career', 'career history', 'career timeline', 'professional journey', 'employment chronology'], [
    'Explain Sooraj’s complete career history.',
    'What is his professional journey from the beginning?',
    'List his roles in chronological order.',
    'How did his career move from mechanical engineering to robotics?',
    'What did he do before joining KEBA?',
  ]),
  buildIntent('career-responsibilities', ['career responsibilities', 'job responsibilities', 'work duties', 'role responsibilities', 'daily work'], [
    'What were Sooraj’s responsibilities in each role?',
    'What kind of work does he do at KEBA?',
    'What were his duties as an NDT technician?',
    'Describe his industrial robotics responsibilities.',
    'What does he work on professionally?',
  ]),
  buildIntent('career-achievements', ['career achievements', 'professional achievements', 'key outcomes', 'career highlights', 'major accomplishment'], [
    'What are Sooraj’s biggest career achievements?',
    'What professional outcomes has he delivered?',
    'What is his strongest accomplishment?',
    'Which results in the portfolio matter most to recruiters?',
    'What has he achieved in robotics and automation?',
  ]),
  buildIntent('career-target-roles', ['target roles', 'desired jobs', 'suitable positions', 'career opportunities', 'jobs applying'], [
    'What jobs is Sooraj looking for?',
    'Which roles should he apply for?',
    'What positions best match his career?',
    'Is he suitable for robotics and automation jobs?',
    'What is his ideal next role?',
  ]),
  buildIntent('career-hiring-evidence', ['hiring evidence', 'proof of skills', 'candidate evidence', 'why hire', 'recruiter proof'], [
    'What evidence supports hiring Sooraj?',
    'How does the portfolio prove his skills?',
    'What should a recruiter verify?',
    'Which projects demonstrate job readiness?',
    'Why should a robotics company interview him?',
  ]),
  buildIntent('education-complete-history', ['complete education', 'academic history', 'education timeline', 'degrees completed', 'study background'], [
    'Explain Sooraj’s complete education history.',
    'What degrees has Sooraj studied?',
    'Where and when did he study?',
    'What is his academic timeline?',
    'How does his education support a robotics career?',
  ]),
  buildIntent('portfolio-project-proof', ['project proof', 'technical evidence', 'project outcomes', 'project responsibilities', 'project contribution'], [
    'What did Sooraj personally contribute to each project?',
    'Which portfolio projects have technical proof?',
    'What tools and outcomes are shown for each project?',
    'Which project best proves industrial robotics ability?',
    'How do his projects support his career claims?',
  ]),
  buildIntent('career-application-status', ['application status', 'job availability', 'start date', 'notice period', 'relocation', 'remote work'], [
    'Is Sooraj available for work?',
    'When can he start a new job?',
    'Is he open to relocation or remote work?',
    'What is his notice period?',
    'How can a recruiter discuss availability?',
  ]),
];

const loadQuestionBankIntents = async () => {
  if (questionBankIntentPromise) return questionBankIntentPromise;
  questionBankIntentPromise = import('./helpBotQuestionBank.json')
    .then((module) => {
      const payload = module.default || module;
      const baseIntents = Array.isArray(payload?.intents) ? payload.intents : [];
      return [...baseIntents, ...EXTRA_INTENTS];
    })
    .catch(() => []);
  return questionBankIntentPromise;
};

export const helpBotQuestionBankStats = {
  ...QUESTION_BANK_BASE_STATS,
  intents: QUESTION_BANK_BASE_STATS.intents + casualChatStats.answers,
  questions: QUESTION_BANK_BASE_STATS.questions + casualChatStats.questions,
  casualAnswers: casualChatStats.answers,
  casualQuestions: casualChatStats.questions,
};

const normalizeText = (value = '') => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/&/g, ' and ')
  .replace(/[^a-z0-9\s]+/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const getTokens = (value = '') => normalizeText(value)
  .split(' ')
  .filter((token) => token.length >= 3 && !STOP_WORDS.has(token));

const unique = (items = []) => [...new Set(items.filter(Boolean))];

const relatedToken = (left, right) => {
  if (!left || !right) return false;
  if (left === right) return true;
  if (left.length < 4 || right.length < 4) return false;
  return left.startsWith(right) || right.startsWith(left) || left.includes(right) || right.includes(left);
};

const scorePhrase = (query, queryTokens, phrase = '', weight = 1) => {
  const normalizedPhrase = normalizeText(phrase);
  if (!normalizedPhrase) return 0;

  let score = 0;
  if (query === normalizedPhrase) score += 80 * weight;
  if (normalizedPhrase.length >= 5 && query.includes(normalizedPhrase)) score += 22 * weight;
  if (query.length >= 7 && normalizedPhrase.includes(query)) score += 16 * weight;

  const phraseTokens = getTokens(normalizedPhrase);
  if (!phraseTokens.length || !queryTokens.length) return score;

  const matched = queryTokens.filter((token) => phraseTokens.some((candidate) => relatedToken(token, candidate)));
  const exact = queryTokens.filter((token) => phraseTokens.includes(token));
  const coverage = matched.length / Math.max(queryTokens.length, 1);

  score += matched.length * 3 * weight;
  score += exact.length * 2 * weight;
  if (coverage >= 0.75 && queryTokens.length > 1) score += 10 * weight;
  if (coverage >= 1 && queryTokens.length > 1) score += 8 * weight;

  return score;
};

const scoreIntent = (query, intent) => {
  const queryTokens = getTokens(query);
  if (!queryTokens.length) return 0;

  const keywords = Array.isArray(intent.keywords) ? intent.keywords : [];
  const questions = Array.isArray(intent.questions) ? intent.questions : [];
  const idPhrase = String(intent.id || '').replace(/-/g, ' ');

  const keywordScore = keywords.reduce((total, keyword) => total + scorePhrase(query, queryTokens, keyword, 1.35), 0);
  const questionScore = questions.reduce((best, question) => Math.max(best, scorePhrase(query, queryTokens, question, 1)), 0);
  const idScore = scorePhrase(query, queryTokens, idPhrase, 0.85);

  return keywordScore + questionScore + idScore;
};

const editDistance = (left = '', right = '') => {
  if (left === right) return 0;
  if (!left) return right.length;
  if (!right) return left.length;

  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  const current = Array.from({ length: right.length + 1 }, () => 0);

  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    current[0] = leftIndex;

    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      const cost = left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1;
      current[rightIndex] = Math.min(
        previous[rightIndex] + 1,
        current[rightIndex - 1] + 1,
        previous[rightIndex - 1] + cost,
      );
    }

    previous.splice(0, previous.length, ...current);
  }

  return previous[right.length];
};

const hasSingleAdjacentTransposition = (left = '', right = '') => {
  if (left.length !== right.length || left.length < 4) return false;
  const mismatches = [];

  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) mismatches.push(index);
    if (mismatches.length > 2) return false;
  }

  return mismatches.length === 2
    && mismatches[1] === mismatches[0] + 1
    && left[mismatches[0]] === right[mismatches[1]]
    && left[mismatches[1]] === right[mismatches[0]];
};

const tokenSimilarity = (left, right) => {
  if (!left || !right) return 0;
  if (left === right) return 1;
  if (relatedToken(left, right)) return 0.94;
  if (left.length < 4 || right.length < 4) return 0;
  if (hasSingleAdjacentTransposition(left, right)) return 0.9;

  const distance = editDistance(left, right);
  const length = Math.max(left.length, right.length);
  const allowedDistance = length <= 5 ? 1 : length <= 9 ? 2 : 3;
  if (distance > allowedDistance) return 0;

  return Math.max(0, 1 - (distance / length));
};

const fuzzyPhraseScore = (query, phrase = '') => {
  const queryTokens = getTokens(query);
  const phraseTokens = getTokens(phrase);
  if (!queryTokens.length || !phraseTokens.length) return 0;

  let totalSimilarity = 0;
  let changedTokenCount = 0;
  const matchedPhraseIndexes = new Set();

  queryTokens.forEach((queryToken) => {
    const best = phraseTokens.reduce((currentBest, phraseToken, phraseIndex) => {
      const similarity = tokenSimilarity(queryToken, phraseToken);
      return similarity > currentBest.similarity
        ? { similarity, phraseToken, phraseIndex }
        : currentBest;
    }, { similarity: 0, phraseToken: '', phraseIndex: -1 });

    if (best.similarity >= 0.72) {
      totalSimilarity += best.similarity;
      matchedPhraseIndexes.add(best.phraseIndex);
      if (queryToken !== best.phraseToken) changedTokenCount += 1;
    }
  });

  const queryCoverage = matchedPhraseIndexes.size
    ? Math.min(queryTokens.length, matchedPhraseIndexes.size) / queryTokens.length
    : 0;
  const phraseCoverage = matchedPhraseIndexes.size / phraseTokens.length;

  if (queryCoverage < 0.67) return 0;
  if (queryTokens.length === 1 && totalSimilarity < 0.78) return 0;

  const similarityAverage = totalSimilarity / queryTokens.length;
  const changedBonus = changedTokenCount ? 10 : 0;

  return (queryCoverage * 44) + (phraseCoverage * 18) + (similarityAverage * 38) + changedBonus;
};

const getIntentPhrases = (intent) => unique([
  ...(Array.isArray(intent.keywords) ? intent.keywords : []),
  ...(Array.isArray(intent.questions) ? intent.questions : []),
  String(intent.id || '').replace(/-/g, ' '),
]);

const loadFuzzyCandidates = async () => {
  if (fuzzyCandidatePromise) return fuzzyCandidatePromise;
  fuzzyCandidatePromise = loadQuestionBankIntents().then((intents) => [
    ...intents.flatMap((intent) => getIntentPhrases(intent).map((phrase) => ({
      type: 'intent',
      intent,
      phrase,
    }))),
    ...casualChatEntries.flatMap((entry) => unique([
      ...(Array.isArray(entry.keywords) ? entry.keywords : []),
      ...(Array.isArray(entry.prompts) ? entry.prompts : []),
    ]).map((phrase) => ({
      type: 'casual',
      entry,
      phrase,
    }))),
  ]);
  return fuzzyCandidatePromise;
};

const findFuzzyConfirmationMatch = async (input = '') => {
  const query = normalizeText(input);
  if (!query || getTokens(query).length === 0) return null;
  const candidates = await loadFuzzyCandidates();

  const ranked = candidates
    .map((candidate) => ({
      ...candidate,
      score: fuzzyPhraseScore(query, candidate.phrase),
    }))
    .filter((candidate) => candidate.score >= FUZZY_CONFIRMATION_SCORE)
    .sort((left, right) => right.score - left.score);

  return ranked[0] || null;
};

const findMatchingIntent = async (input = '') => {
  const query = normalizeText(input);
  if (!query) return null;
  const intents = await loadQuestionBankIntents();

  const ranked = intents
    .map((intent) => ({
      intent,
      score: scoreIntent(query, intent),
    }))
    .filter((entry) => entry.score >= MIN_MATCH_SCORE)
    .sort((left, right) => right.score - left.score);

  return ranked[0] || null;
};

const topicByIntentId = {
  'experience-overview': 'experience',
  'experience-duration': 'experienceDuration',
  'experience-details': 'experienceDetails',
  'robotics-experience': 'robotics',
  'vr-immersive': 'vr',
  'journey-india-germany': 'journey',
  'bachelor-path': 'bachelorDetails',
  'education-locations': 'educationDetails',
  'current-role-germany': 'experience',
  'germany-location': 'location',
  'travel-footprint': 'journey',
  'projects-all': 'projects',
  'thesis-detail': 'thesis',
  'ros-project': 'ros',
  'service-robot-detail': 'serviceRobot',
  'active-suspension-detail': 'activeSuspension',
  'topology-detail': 'topology',
  reviews: 'reviews',
  'review-fields-details': 'reviews',
  'review-company-details': 'reviews',
  'review-country-details': 'reviews',
  'review-company-lookup': 'reviews',
  'review-country-lookup': 'reviews',
  'robotics-fit': 'roleFit',
  'immersive-fit': 'roleFit',
  'simulation-fit': 'roleFit',
  'design-fit': 'roleFit',
  'skills-overview': 'skills',
  'job-search-status': 'availability',
  'profile-overview': 'profile',
  'chat-greeting': 'greeting',
  'portfolio-sections-overview': 'siteTour',
  'contact-section-details': 'contact',
  'feedback-vs-contact': 'contact',
  'assistant-training': 'assistantTraining',
  'assistant-behind-you': 'botIdentity',
  'sooraj-training': 'assistantTraining',
  'password-request': 'confidential',
  'owner-name': 'ownerName',
  'bot-name': 'botName',
  'bot-age': 'botAge',
  'bot-gender': 'botGender',
  'bot-origin': 'botOrigin',
  'chat-privacy': 'privacy',
  'confidential-followup': 'confidential',
  contact: 'contact',
  'about-profile': 'profile',
  'owner-personal-overview': 'profile',
  'owner-age': 'ownerPersonal',
  'owner-origin': 'ownerPersonal',
  'owner-location': 'location',
  'owner-nationality': 'ownerPersonal',
  'owner-work-permit': 'ownerPersonal',
  'owner-relationship-status': 'ownerPrivate',
  'owner-gender': 'ownerPersonal',
  'owner-color-boundary': 'ownerPrivate',
  'bot-color': 'botIdentity',
  'bot-location': 'botIdentity',
  'assistant-german-language': 'language',
  'owner-languages': 'language',
  'sooraj-german-language': 'language',
  'linkedin-profile': 'linkedin',
  'website-build-details': 'website',
  'chatbot-build-details': 'website',
  'github-profile': 'github',
  'image-upload-request': 'image',
  'chat-with-assistant-direct': 'botIdentity',
  'connect-to-sooraj-direct': 'contact',
  'cv-request-path': 'resume',
  'portfolio-overview-download': 'resume',
  'official-contact-email': 'contact',
  'contact-response-time': 'contact',
  'availability-details': 'availability',
  'work-mode-preference': 'workMode',
  'relocation-details': 'relocation',
  'sponsorship-details': 'sponsorship',
  'notice-period-details': 'noticePeriod',
  'chat-data-deletion': 'privacy',
  'eu-chatbot-compliance': 'privacy',
  'casual-funny-chat': 'smallTalk',
  'identity-confusion': 'botIdentity',
  'live-support-expectation': 'botIdentity',
  'translation-help': 'language',
  'theme-switch': 'theme',
  'owner-private-boundary': 'ownerPrivate',
  'bot-relationship-boundary': 'botIdentity',
  'bot-affection-chat': 'smallTalk',
  'bot-compliment-chat': 'smallTalk',
  'bot-playful-chat': 'smallTalk',
  'bot-hostile-chat': 'critical',
  'bot-critical-comment': 'critical',
  'bot-supervision': 'botIdentity',
  'bot-human-relationship-boundary': 'botIdentity',
  'owner-critical-comment': 'critical',
  'website-critical-comment': 'critical',
  'bot-romantic-chat': 'botIdentity',
  'bot-food-drink': 'botIdentity',
  'bot-body-needs': 'botIdentity',
  'bot-transport-world': 'botIdentity',
  'bot-nature-world': 'botIdentity',
  'bot-device-world': 'botIdentity',
  'tell-me-about-sooraj': 'profile',
  'why-hire-sooraj': 'interview',
  'top-strengths': 'interview',
  'development-area': 'interview',
  'biggest-achievement': 'interview',
  'problem-solving-style': 'interview',
  'teamwork-style': 'interview',
  'leadership-style': 'interview',
  'career-goals': 'interview',
  'why-robotics': 'interview',
  'why-germany': 'journey',
  'why-keba': 'thesis',
  'current-best-role-fit': 'roleFit',
  'recruiter-top-3-pages': 'recruiterPath',
  'student-top-3-pages': 'studentPath',
  'site-quick-tour': 'siteTour',
  'detailed-portfolio-vs-map': 'siteTour',
  'portfolio-pdf-vs-cv': 'resume',
  'salary-expectation-details': 'salary',
  'software-mechanical-balance': 'skills',
  'best-project-to-start': 'bestProject',
  'website-last-updated': 'websiteUpdated',
  'recruiter-screen-summary': 'recruiterScreen',
  'recruiter-risk-review': 'recruiterRisk',
  'recruiter-interview-plan': 'interviewPlan',
  'role-robotics-software': 'roleRoboticsSoftware',
  'role-automation-engineer': 'roleAutomationEngineer',
  'role-simulation-engineer': 'roleSimulationEngineer',
  'role-mechatronics-engineer': 'roleMechatronicsEngineer',
  'role-ros-developer': 'roleRosDeveloper',
  'technical-depth-overview': 'technicalDepth',
  'robotics-basics': 'roboticsBasics',
  'ros-basics': 'rosBasics',
  'ros2-basics': 'ros2Basics',
  'slam-basics': 'slamBasics',
  'motion-planning-basics': 'motionPlanningBasics',
  'collision-avoidance-basics': 'collisionAvoidanceBasics',
  'gazebo-rviz-basics': 'gazeboRvizBasics',
  'matlab-simulink-basics': 'matlabSimulinkBasics',
  'unity-xr-basics': 'unityXrBasics',
  'embedded-arduino-basics': 'embeddedArduinoBasics',
  'python-cpp-balance': 'pythonCppBalance',
  'mechanical-software-integration': 'mechanicalSoftwareIntegration',
  'industrial-context': 'industrialContext',
  'keba-company-context': 'kebaDeep',
  'dragbot-context': 'dragbotContext',
  'project-comparison': 'projectComparison',
  'project-timeline': 'projectTimeline',
  'portfolio-navigation': 'siteTour',
  'recommendation-submit-flow': 'recommendationSubmit',
  'recommendation-admin-flow': 'recommendationAdmin',
  'supabase-status': 'supabaseStatus',
  'privacy-local-storage': 'privacy',
  'website-stack-deep': 'websiteStack',
  'quality-of-portfolio': 'portfolioQuality',
  'portfolio-improvements': 'portfolioImprovements',
  'certification-overview': 'certifications',
  'education-germany': 'educationGermany',
  'education-india': 'bachelorDetails',
  'ndt-experience': 'ndtExperience',
  'cover-letter-help': 'coverLetter',
  'cv-bullet-help': 'cvBullets',
  'learning-roadmap': 'learningRoadmap',
  'portfolio-for-students': 'studentGuide',
  'portfolio-for-recruiters': 'recruiterGuide',
  'general-ai-question': 'aiBasics',
  'general-control-systems': 'controlSystemsBasics',
  'general-sensors': 'sensorBasics',
  'general-digital-twin': 'digitalTwinBasics',
  'general-industry-4': 'industryFourBasics',
  'general-autonomous-robot': 'autonomousRobotBasics',
  'general-industrial-robot': 'industrialRobotBasics',
  'general-service-robot': 'serviceRobotBasics',
  'general-hmi': 'hmiBasics',
  'general-websockets': 'websocketsBasics',
  'general-robot-program-simulation': 'robotProgramSimulationBasics',
  'general-git-github': 'github',
  'general-professional-summary': 'professionalPitch',
  'general-long-profile': 'longProfile',
  'general-contact-message': 'contactMessage',
  'general-reference-meaning': 'referenceMeaning',
  'general-out-of-scope': 'outOfScope',
  'career-complete-history': 'experienceDetails',
  'career-responsibilities': 'experienceDetails',
  'career-achievements': 'biggestAchievement',
  'career-target-roles': 'roleFit',
  'career-hiring-evidence': 'recruiterScreen',
  'education-complete-history': 'educationDetails',
  'portfolio-project-proof': 'projects',
  'career-application-status': 'availability',
};

const t = (language, english, german = english) => (language === 'de' ? german : english);

const makeAction = (label, href, options = {}) => ({ label, href, ...options });
const sectionAction = (language, id, enLabel, deLabel = enLabel) => makeAction(t(language, enLabel, deLabel), `#${id}`);
const emailAction = (language) => makeAction(t(language, 'Email Sooraj', 'Sooraj per E-Mail kontaktieren'), personal.social.email);
const resumeAction = (language) => makeAction(t(language, 'Open Resume Overview', 'Lebenslaufübersicht öffnen'), personal.resumeUrl);
const linkedinAction = (language) => makeAction(t(language, 'Open LinkedIn', 'LinkedIn öffnen'), personal.social.linkedin, { external: true });
const githubAction = (language) => makeAction(t(language, 'Open GitHub', 'GitHub öffnen'), personal.social.github, { external: true });

const defaultSuggestions = (language) => t(language,
  ['Assess robotics fit', 'Give interview questions', 'Explain ROS', 'Show project evidence'],
  ['Robotik-Fit bewerten', 'Interviewfragen geben', 'ROS erklären', 'Projektbelege zeigen']);

const localizedCasualValue = (language, value, fallback) => {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object') {
    return language === 'de'
      ? value.de || value.en || fallback
      : value.en || value.de || fallback;
  }
  return value || fallback;
};

const resolveCasualActions = (actionIds = [], language = 'en') => {
  const actions = {
    contact: sectionAction(language, 'contact', 'Open Contact', 'Kontakt oeffnen'),
    email: emailAction(language),
    github: githubAction(language),
    linkedin: linkedinAction(language),
    projects: sectionAction(language, 'projects', 'Open Projects', 'Projekte oeffnen'),
    resume: resumeAction(language),
  };

  return unique(actionIds).map((actionId) => actions[actionId]).filter(Boolean);
};

const casualChatAnswer = (match, language) => {
  const entry = match?.entry || {};
  const response = localizedCasualValue(language, entry.response, t(language,
    'I can answer simple casual questions, but I am most useful for Sooraj portfolio questions.',
    'Ich kann einfache lockere Fragen beantworten, bin aber am nuetzlichsten fuer Fragen zum Sooraj Portfolio.'));
  const suggestions = localizedCasualValue(language, entry.suggestions, defaultSuggestions(language));

  return {
    response,
    suggestions,
    actions: resolveCasualActions(entry.actions || [], language),
    match: {
      intentId: `casual-${entry.id || 'small-talk'}`,
      score: Math.round(match?.score || 100),
      topic: 'casual',
    },
  };
};

const spellingConfirmationAnswer = (language, candidate, originalInput = '') => {
  const suggestedText = String(candidate?.phrase || '').trim();

  return {
    response: t(language,
      `Did you mean "${suggestedText}"?`,
      `Meinten Sie "${suggestedText}"?`),
    suggestions: t(language,
      ['Yes, answer this', 'No, no match'],
      ['Ja, beantworten', 'Nein, kein Treffer']),
    actions: [],
    confirmation: {
      input: suggestedText,
      label: suggestedText,
      originalInput: String(originalInput || '').trim(),
    },
    match: {
      intentId: `spelling-confirmation-${candidate?.type || 'match'}`,
      score: Math.round(candidate?.score || 0),
      topic: 'spellingConfirmation',
    },
  };
};

const noMatchAnswer = (language) => ({
  response: t(language,
    'No match found. Try asking about robotics fit, KEBA workflow, ROS projects, skills, experience, resume, reviews, privacy, or contact.',
    'Kein Treffer gefunden. Fragen Sie nach Robotik-Fit, KEBA Workflow, ROS-Projekten, Skills, Erfahrung, Lebenslauf, Referenzen, Datenschutz oder Kontakt.'),
  suggestions: defaultSuggestions(language),
  actions: [sectionAction(language, 'projects', 'Open Projects', 'Projekte oeffnen'), emailAction(language)],
  match: {
    intentId: 'no-match',
    score: 0,
    topic: 'noMatch',
  },
});

const moderationAnswer = (language) => ({
  response: t(language,
    'Please keep the chat respectful. I can help with Sooraj’s robotics fit, KEBA workflow, ROS projects, skills, resume, references, privacy, or contact.',
    'Bitte bleiben Sie im Chat respektvoll. Ich kann bei Soorajs Robotik-Fit, KEBA Workflow, ROS-Projekten, Skills, Lebenslauf, Referenzen, Datenschutz oder Kontakt helfen.'),
  suggestions: defaultSuggestions(language),
  actions: [],
  match: {
    intentId: 'moderation-disallowed-language',
    score: 100,
    topic: 'moderation',
  },
});

const getGermanyTimeContext = () => {
  const date = new Date();
  let hour = date.getHours();
  let label = '';

  try {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Berlin',
      hour: '2-digit',
      hour12: false,
      timeZoneName: 'short',
    }).formatToParts(date);
    const hourPart = parts.find((part) => part.type === 'hour')?.value;
    const zonePart = parts.find((part) => part.type === 'timeZoneName')?.value;
    hour = Number(hourPart);
    label = zonePart || 'Germany time';
  } catch {
    label = 'Germany time';
  }

  const period = hour >= 5 && hour < 12
    ? 'morning'
    : hour >= 12 && hour < 18
      ? 'afternoon'
      : hour >= 18 && hour < 22
        ? 'evening'
        : 'night';

  return { hour, period, label };
};

const getRequestedGreetingPeriod = (input = '') => {
  const normalized = normalizeText(input);
  if (/\b(good morning|guten morgen)\b/.test(normalized)) return 'morning';
  if (/\b(good afternoon|guten tag)\b/.test(normalized)) return 'afternoon';
  if (/\b(good evening|guten abend)\b/.test(normalized)) return 'evening';
  return '';
};

const directAnswerTopic = (input = '') => {
  const normalized = normalizeText(input);
  if (!normalized) return '';
  if (DISALLOWED_INPUT_PATTERN.test(input)) return 'moderation';
  if (CONFIDENTIAL_DATA_PATTERN.test(input)) return 'confidential';
  if (
    /\b(chat|chta|chtat|conversation|question|questions|message|messages|transcript|data)\b.*\b(save|saved|saving|store|stored|storing|record|recorded|recording|log|logged|logging|collect|collected|collecting|train|training)\b/.test(normalized)
    || /\b(save|saved|saving|store|stored|storing|record|recorded|recording|log|logged|logging|collect|collected|collecting|train|training)\b.*\b(chat|chta|chtat|conversation|question|questions|message|messages|transcript|data)\b/.test(normalized)
    || /\b(no match|unanswered|unknown question|cant answer|cannot answer|do not know|dont know)\b.*\b(save|saved|store|stored|record|recorded|log|training|train)\b/.test(normalized)
  ) return 'privacy';
  if (/\b(are you gay|r u gay|you gay|are you lesbian|are you straight|sexual orientation|your orientation)\b/.test(normalized)) return 'botOrientation';
  if (/\b(is sooraj gay|sooraj gay|owner gay|is he gay|his orientation|sooraj orientation)\b/.test(normalized)) return 'ownerPrivate';
  if (/\b(had your food|have you eaten|did you eat|did u eat|had food|are you hungry|do you eat|what did you eat|food|drink|coffee|tea)\b/.test(normalized)) return 'botFood';
  if (/^(name|your name|what is your name|whats your name|who are you|bot name|chatbot name|assistant name)$/.test(normalized)) return 'botName';
  if (/^(owner name|sooraj name|what is sooraj name|who is sooraj)$/.test(normalized)) return 'ownerName';
  if (/\b(how old are you|your age|bot age|chatbot age|assistant age)\b/.test(normalized)) return 'botAge';
  if (/\b(how are you|how r you|how do you do|are you okay|are you ok|whats up|what is up|sup)\b/.test(normalized)) return 'botStatus';
  if (/\b(thank you|thanks|thankyou|danke)\b/.test(normalized)) return 'thanks';
  if (/\b(bye|goodbye|see you|see ya|tschuss)\b/.test(normalized)) return 'goodbye';
  if (/\b(what can you do|help me|help|options|topics)\b/.test(normalized)) return 'capabilities';
  if (/\b(weather|current news|latest news|stock price|sports score|live score|lottery|crypto price)\b/.test(normalized)) return 'outOfScope';
  if (/\b(tell me about sooraj|about sooraj|who is sooraj|sooraj profile|introduce sooraj|describe sooraj)\b/.test(normalized)) return 'profile';
  if (/\b(erzahl mir von sooraj|erzaehl mir von sooraj|uber sooraj|ueber sooraj|wer ist sooraj|profil sooraj|sooraj vorstellen)\b/.test(normalized)) return 'profile';
  if (/\b(robotik fit|fit bewerten|rollen fit|warum sooraj einstellen|sooraj einstellen|einstellen)\b/.test(normalized)) return 'roleFit';
  if (/\b(interviewfragen|interview fragen|technisches interview|bewerbungsgesprach|bewerbungsgespraech|screening fragen)\b/.test(normalized)) return 'interviewPlan';
  if (/\b(recruiter zusammenfassung|recruiter summary|kurzprofil|einstellungs summary|screening zusammenfassung)\b/.test(normalized)) return 'recruiterScreen';
  if (/\b(projektbelege|projekt belege|projekte zeigen|projekte ansehen|projekt evidence)\b/.test(normalized)) return 'projects';
  if (/\b(technischer stack|technischen stack|technologie stack|skills prufen|skills pruefen|kompetenzen)\b/.test(normalized)) return 'skills';
  if (/\b(how many months.*experience|months of experience|month experience|experience duration|total work experience|years of experience|how long.*worked professionally)\b/.test(normalized)) return 'experienceDuration';
  if (/\b(experience details|work history|employment history|job details|role details|companies.*worked|professional experience timeline)\b/.test(normalized)) return 'experienceDetails';
  if (/\b(how long.*b tech|how long.*btech|b tech.*how many years|btech.*how many years|bachelor.*how many years|bachelor duration|btech duration|where.*b tech|where.*btech|where.*bachelor|bachelor timeline)\b/.test(normalized)) return 'bachelorDetails';
  if (/\b(where.*study|where.*studied|when.*study|universities.*attend|education history|education details|academic history|study locations|college.*university)\b/.test(normalized)) return 'educationDetails';
  if (/\b(lebenslauf offnen|lebenslauf oeffnen|lebenslauf|cv offnen|cv oeffnen|resume offnen|resume oeffnen)\b/.test(normalized)) return 'resume';
  if (/\b(kontakt aufnehmen|sooraj kontaktieren|kontakt zu sooraj|email sooraj|e mail sooraj)\b/.test(normalized)) return 'contact';
  if (/\b(projekte vergleichen|projektvergleich|projekte vergleich|starkstes projekt|staerkstes projekt|bestes startprojekt)\b/.test(normalized)) return 'projectComparison';
  if (/\b(admin verifizierung|admin verifikation|empfehlung verifizieren|empfehlungen freigeben|empfehlungen prufen|empfehlungen pruefen)\b/.test(normalized)) return 'recommendationAdmin';
  if (/\b(ros erklaren|ros erklaeren|slam erklaren|slam erklaeren)\b/.test(normalized)) return 'rosBasics';
  if (/\b(keba workflow erklaren|keba workflow erklaeren|keba projekt erklaren|keba projekt erklaeren)\b/.test(normalized)) return 'thesis';
  if (/\b(recruiter summary|screening summary|shortlist|hiring screen|candidate summary)\b/.test(normalized)) return 'recruiterScreen';
  if (/\b(hiring risk|recruiter risk|what gaps|portfolio gaps|what should i verify|concerns|limitations)\b/.test(normalized)) return 'recruiterRisk';
  if (/\b(interview questions|interview plan|technical interview|what should i ask|screening questions)\b/.test(normalized)) return 'interviewPlan';
  if (/\b(robotics software engineer|robot software engineer|robotics developer|robot software role)\b/.test(normalized)) return 'roleRoboticsSoftware';
  if (/\b(automation engineer|industrial automation role|factory automation)\b/.test(normalized)) return 'roleAutomationEngineer';
  if (/\b(simulation engineer|simulation role|digital twin role)\b/.test(normalized)) return 'roleSimulationEngineer';
  if (/\b(mechatronics engineer|mechatronics role|mechanical and software)\b/.test(normalized)) return 'roleMechatronicsEngineer';
  if (/\b(ros developer|ros engineer|ros role)\b/.test(normalized)) return 'roleRosDeveloper';
  if (/\b(technical depth|engineering depth|technical signal|deep technical)\b/.test(normalized)) return 'technicalDepth';
  if (/\b(what is robotics|robotics basics|explain robotics|robotics meaning)\b/.test(normalized)) return 'roboticsBasics';
  if (/\b(what is ros|robot operating system|ros basics|explain ros)\b/.test(normalized)) return 'rosBasics';
  if (/\b(what is ros 2|ros2|ros two|ros1 vs ros2)\b/.test(normalized)) return 'ros2Basics';
  if (/\b(what is slam|slam basics|mapping and localization|simultaneous localization)\b/.test(normalized)) return 'slamBasics';
  if (/\b(motion planning|path planning|trajectory planning|waypoints)\b/.test(normalized)) return 'motionPlanningBasics';
  if (/\b(collision avoidance|obstacle avoidance|collision checking|safe motion)\b/.test(normalized)) return 'collisionAvoidanceBasics';
  if (/\b(gazebo|rviz|robot simulation tools)\b/.test(normalized)) return 'gazeboRvizBasics';
  if (/\b(matlab|simulink|active suspension|control modeling)\b/.test(normalized)) return 'matlabSimulinkBasics';
  if (/\b(unity|xr|virtual reality|vr workshop|csharp|c sharp)\b/.test(normalized)) return 'unityXrBasics';
  if (/\b(arduino|embedded|line tracking|motor control|service robot)\b/.test(normalized)) return 'embeddedArduinoBasics';
  if (/\b(python and c|python c|c\+\+|programming languages|coding stack)\b/.test(normalized)) return 'pythonCppBalance';
  if (/\b(mechanical software integration|mechatronics integration|mechanical or software)\b/.test(normalized)) return 'mechanicalSoftwareIntegration';
  if (/\b(keba|dragbot|drag and bot|drag bot|thesis workflow)\b/.test(normalized)) return 'thesis';
  if (/\b(compare projects|project comparison|strongest project|rank projects)\b/.test(normalized)) return 'projectComparison';
  if (/\b(project timeline|timeline|chronology|when did)\b/.test(normalized)) return 'projectTimeline';
  if (/\b(submit recommendation|add recommendation|write recommendation|recommend sooraj)\b/.test(normalized)) return 'recommendationSubmit';
  if (/\b(approve recommendation|admin review|pending recommendation|verify recommendation|verification flow)\b/.test(normalized)) return 'recommendationAdmin';
  if (/\b(supabase|backend table|live database|recommendations table)\b/.test(normalized)) return 'supabaseStatus';
  if (/\b(website stack|react vite|how website built|frontend stack)\b/.test(normalized)) return 'websiteStack';
  if (/\b(portfolio quality|website quality|is portfolio good|portfolio review)\b/.test(normalized)) return 'portfolioQuality';
  if (/\b(portfolio improvement|improve website|what to improve)\b/.test(normalized)) return 'portfolioImprovements';
  if (/\b(certificates|certifications|credentials|training certificate)\b/.test(normalized)) return 'certifications';
  if (/\b(cover letter|motivation letter|application summary)\b/.test(normalized)) return 'coverLetter';
  if (/\b(cv bullets|resume bullets|cv wording|resume wording)\b/.test(normalized)) return 'cvBullets';
  if (/\b(learning roadmap|next skills|what should he learn|skill roadmap)\b/.test(normalized)) return 'learningRoadmap';
  if (/\b(student advice|students learn|build portfolio)\b/.test(normalized)) return 'studentGuide';
  if (/\b(recruiter guide|hiring manager|how should recruiters)\b/.test(normalized)) return 'recruiterGuide';
  if (/\b(what is ai|artificial intelligence|machine learning|ai basics)\b/.test(normalized)) return 'aiBasics';
  if (/\b(control systems|pid|feedback control|controller)\b/.test(normalized)) return 'controlSystemsBasics';
  if (/\b(sensor fusion|lidar|camera sensor|encoder|robot sensors)\b/.test(normalized)) return 'sensorBasics';
  if (/\b(digital twin|virtual commissioning|simulation twin)\b/.test(normalized)) return 'digitalTwinBasics';
  if (/\b(industry 4|smart manufacturing|industrial iot|iiot)\b/.test(normalized)) return 'industryFourBasics';
  if (/\b(professional summary|elevator pitch|short intro|two sentence summary)\b/.test(normalized)) return 'professionalPitch';
  if (/\b(detailed profile|long summary|full profile|whole portfolio)\b/.test(normalized)) return 'longProfile';
  if (/\b(contact message|email template|message sooraj|reach out template)\b/.test(normalized)) return 'contactMessage';
  if (/\b(good morning|good afternoon|good evening|guten morgen|guten tag|guten abend)\b/.test(normalized)) return 'timeGreeting';
  if (/\b(good morning|good afternoon|good evening|hello|hi|hey)\b/.test(normalized)) return 'greeting';
  return '';
};

export const getHelpBotQuickPrompts = (language, currentPrompts = []) => unique([
  ...(Array.isArray(currentPrompts) ? currentPrompts : []),
  ...t(language,
    ['Tell me about Sooraj', 'Why hire Sooraj?', 'Best project to start', 'Contact Sooraj'],
    ['Erzähl mir von Sooraj', 'Warum Sooraj einstellen?', 'Bestes Startprojekt', 'Sooraj kontaktieren']),
]).slice(0, 12);

const topicAnswer = (topic, language, input = '') => {
  const {
    education,
    experiences,
    personal,
    projects,
    recommendations,
    skillGroups,
  } = getLocalizedPortfolioData(language);
  const projectNames = projects.map((project) => project.title).join(', ');
  const skillNames = skillGroups.flatMap((group) => group.skills).slice(0, 18).join(', ');
  const verifiedReference = recommendations.find((item) => item.verified);
  const currentExperience = experiences[0];
  const thesisExperience = experiences.find((item) => normalizeText(item.role).includes('thesis') || normalizeText(item.role).includes('masterarbeit'));
  const masterEducation = education[0];
  const bachelorEducation = education[1];
  const common = {
    suggestions: defaultSuggestions(language),
    actions: [],
  };

  switch (topic) {
    case 'greeting':
      return {
        ...common,
        response: t(language,
          'Hello. I am Portfolio Assistant, the guide for this website. Ask me about Sooraj, robotics fit, KEBA workflow, ROS projects, skills, resume, references, privacy, or contact.',
          'Hallo. Ich bin Portfolio Assistant, der Guide fuer diese Website. Fragen Sie nach Sooraj, Robotik-Fit, KEBA Workflow, ROS-Projekten, Skills, Lebenslauf, Referenzen, Datenschutz oder Kontakt.'),
        suggestions: t(language,
          ['Assess robotics fit', 'Explain KEBA workflow', 'Open resume'],
          ['Robotik-Fit bewerten', 'KEBA-Workflow erklären', 'Lebenslauf öffnen']),
      };

    case 'timeGreeting': {
      const requestedPeriod = getRequestedGreetingPeriod(input);
      const germanyTime = getGermanyTimeContext();
      const correctGreeting = germanyTime.period === 'morning'
        ? t(language, 'good morning', 'guten Morgen')
        : germanyTime.period === 'afternoon'
          ? t(language, 'good afternoon', 'guten Tag')
          : germanyTime.period === 'evening'
            ? t(language, 'good evening', 'guten Abend')
            : t(language, 'hello', 'hallo');
      const requestedMatches = requestedPeriod && requestedPeriod === germanyTime.period;

      return {
        ...common,
        response: requestedMatches
          ? t(language,
            `Yes, ${correctGreeting}. I am ready to help with the Sooraj portfolio, KEBA workflow, ROS projects, skills, resume, or contact path.`,
            `Ja, ${correctGreeting}. Ich helfe gern bei Soorajs Robotikprofil, KEBA Workflow, ROS-Projekten, Skills, Lebenslauf oder Kontaktweg.`)
          : t(language,
            `In Germany it is ${germanyTime.period} right now${germanyTime.label ? ` (${germanyTime.label})` : ''}, so ${correctGreeting}. I can help with the Sooraj portfolio, KEBA workflow, ROS projects, skills, resume, or contact path.`,
            `In Deutschland ist gerade ${germanyTime.period}${germanyTime.label ? ` (${germanyTime.label})` : ''}, daher ${correctGreeting}. Ich helfe bei Soorajs Robotikprofil, KEBA Workflow, ROS-Projekten, Skills, Lebenslauf oder Kontaktweg.`),
        suggestions: t(language,
          ['Tell me about Sooraj', 'Explain KEBA workflow', 'Open resume'],
          ['Erzaehl mir von Sooraj', 'KEBA Workflow erklaeren', 'Lebenslauf oeffnen']),
      };
    }

    case 'profile':
      return {
        ...common,
        response: t(language,
          `${personal.name} is a ${personal.role} based in ${personal.location}. His portfolio centers on industrial robotics, ROS autonomy, embedded mechatronics, simulation validation, and deployment-minded engineering.`,
          `${personal.name} ist ${personal.role} in ${personal.location}. Das Portfolio fokussiert Industrierobotik, ROS-Autonomie, Embedded-Mechatronik, Simulationsvalidierung und umsetzungsnahes Engineering.`),
        actions: [sectionAction(language, 'about', 'Open About', 'About oeffnen'), sectionAction(language, 'experience', 'Open Experience', 'Erfahrung oeffnen')],
      };

    case 'experience':
      return {
        ...common,
        response: t(language,
          `Experience signal: ${currentExperience.role} at ${currentExperience.company}, the ${thesisExperience?.role || 'KEBA thesis'} work, and earlier industrial NDT discipline. The strongest thread is practical robotics work in a German industrial automation context.`,
          `Erfahrungssignal: ${currentExperience.role} bei ${currentExperience.company}, die ${thesisExperience?.role || 'KEBA Thesis'} und fruehere industrielle NDT-Disziplin. Der staerkste rote Faden ist praktische Robotikarbeit im deutschen Automationsumfeld.`),
        actions: [sectionAction(language, 'experience', 'Open Experience', 'Erfahrung oeffnen')],
      };

    case 'experienceDuration':
      return {
        ...common,
        response: t(language,
          'The dated portfolio entries show about 13 elapsed months in total: roughly 7 months as an NDT Technician (February–September 2022) and 6 months for the KEBA industrial-robotics thesis (September 2025–March 2026). Sooraj also has a current Working Student role at KEBA, but its start date is not listed, so an exact overall professional-experience total cannot be verified yet. The portfolio separately summarizes 3+ years of broader engineering practice, including industrial, academic, project, and deployment-oriented work.',
          'Die datierten Portfolio-Eintraege zeigen insgesamt etwa 13 verstrichene Monate: rund 7 Monate als NDT-Techniker (Februar–September 2022) und 6 Monate fuer die KEBA-Industrierobotik-Thesis (September 2025–Maerz 2026). Dazu kommt eine aktuelle Werkstudentenrolle bei KEBA, deren Startdatum nicht angegeben ist; deshalb ist die exakte gesamte Berufserfahrung noch nicht verifizierbar. Das Portfolio nennt separat 3+ Jahre breitere Engineering-Praxis einschliesslich Industrie-, Studien-, Projekt- und Deployment-Arbeit.'),
        actions: [sectionAction(language, 'experience', 'Open Experience', 'Erfahrung oeffnen')],
        suggestions: t(language,
          ['Show all experience details', 'Where did he study?', 'How long was his B.Tech?'],
          ['Alle Erfahrungsdetails zeigen', 'Wo hat er studiert?', 'Wie lange dauerte sein B.Tech?']),
      };

    case 'experienceDetails':
      return {
        ...common,
        response: t(language,
          'Sooraj’s experience has three listed parts: (1) current Working Student in Industrial Robotics at KEBA Group in Stuttgart, supporting robot programming, automation workflows, reliability, and deployment-aware implementation; (2) Master Thesis with KEBA/drag&bot from September 2025 to March 2026, developing a 6-axis robot workflow with path planning, waypoint generation, collision-zone logic, re-grip sequencing, and simulation validation; and (3) NDT Technician at United Engineering and Construction Co. in Kochi from February to September 2022, covering inspection, quality procedures, safety-conscious field work, documentation, and technical reporting.',
          'Soorajs Erfahrung besteht aus drei Eintraegen: (1) aktuelle Werkstudentenrolle in Industrierobotik bei KEBA Group in Stuttgart mit Roboterprogrammierung, Automationsworkflows, Zuverlaessigkeit und deploymentnaher Umsetzung; (2) Master Thesis mit KEBA/drag&bot von September 2025 bis Maerz 2026 zu einem 6-Achs-Roboterworkflow mit Pfadplanung, Waypoints, Kollisionszonen, Re-Grip-Sequenzen und Simulationsvalidierung; und (3) NDT-Techniker bei United Engineering and Construction Co. in Kochi von Februar bis September 2022 mit Inspektion, Qualitaetsverfahren, sicherheitsbewusster Feldarbeit, Dokumentation und technischem Reporting.'),
        actions: [sectionAction(language, 'experience', 'Open Experience', 'Erfahrung oeffnen'), resumeAction(language)],
      };

    case 'bachelorDetails':
      return {
        ...common,
        response: t(language,
          `${personal.name} completed a four-year B.Tech. in Mechanical Engineering at ${bachelorEducation.university} in India, from August 2017 to July 2021. The degree covered a mechanical-engineering foundation including CAD, CAE, programming fundamentals, thermal engineering, fluid systems, and core design principles before his later mechatronics and robotics studies in Germany.`,
          `${personal.name} absolvierte einen vierjaehrigen B.Tech. in Mechanical Engineering an der ${bachelorEducation.university} in Indien, von August 2017 bis Juli 2021. Das Studium vermittelte Grundlagen in CAD, CAE, Programmierung, Thermodynamik, Fluidsystemen und Konstruktion vor dem spaeteren Mechatronik- und Robotikstudium in Deutschland.`),
        actions: [sectionAction(language, 'education', 'Open Education', 'Ausbildung oeffnen')],
        suggestions: t(language,
          ['Where is he studying in Germany?', 'Show experience details', 'Explain his India-to-Germany journey'],
          ['Wo studiert er in Deutschland?', 'Erfahrungsdetails zeigen', 'Indien-Deutschland-Weg erklaeren']),
      };

    case 'educationDetails':
      return {
        ...common,
        response: t(language,
          `Sooraj studied in both India and Germany. He completed a four-year B.Tech. in Mechanical Engineering at ${bachelorEducation.university}, India, from August 2017 to July 2021. He then began an M.Eng. in Mechatronics and Cyber-Physical Systems at ${masterEducation.university}, Germany, in March 2023; the portfolio lists it as ongoing.`,
          `Sooraj studierte in Indien und Deutschland. Er absolvierte von August 2017 bis Juli 2021 einen vierjaehrigen B.Tech. in Mechanical Engineering an der ${bachelorEducation.university} in Indien. Im Maerz 2023 begann er einen M.Eng. in Mechatronics and Cyber-Physical Systems an der ${masterEducation.university} in Deutschland; im Portfolio ist das Studium als laufend angegeben.`),
        actions: [sectionAction(language, 'education', 'Open Education', 'Ausbildung oeffnen')],
      };

    case 'robotics':
      return {
        ...common,
        response: t(language,
          'The Sooraj portfolio combines industrial robot workflow thinking, ROS/mobile-robot fundamentals, embedded prototype work, simulation, and mechatronics. That makes the portfolio stronger than a pure software-only or CAD-only presentation.',
          'Sein Robotikprofil verbindet Industrieroboter-Workflow, ROS/Mobile-Robotik-Grundlagen, Embedded-Prototypen, Simulation und Mechatronik. Dadurch ist das Profil staerker als ein reines Software- oder CAD-Portfolio.'),
        actions: [sectionAction(language, 'projects', 'Open Projects', 'Projekte oeffnen'), sectionAction(language, 'skills', 'Open Skills', 'Skills oeffnen')],
      };

    case 'projects':
      return {
        ...common,
        response: t(language,
          `Project evidence in this portfolio includes: ${projectNames}. The best first scan is KEBA for industrial robotics, then the ROS vacuum robot for autonomy, then Arduino service robot for embedded mechatronics.`,
          `Projektbelege in diesem Portfolio: ${projectNames}. Der beste erste Scan ist KEBA fuer Industrierobotik, danach der ROS-Vakuumroboter fuer Autonomie und der Arduino-Service-Roboter fuer Embedded-Mechatronik.`),
        actions: [sectionAction(language, 'projects', 'Open Projects', 'Projekte oeffnen')],
      };

    case 'thesis':
      return {
        ...common,
        response: t(language,
          'The KEBA thesis is the flagship industrial robotics case study: programming-oriented 6-axis manipulator workflow design, joint/path planning, waypoint interpolation, drag&bot cell validation, collision-zone thinking, re-grip sequencing, machine-operation logic, and robot-program simulation validation. It reads like industrial robot-programming work, not only a simulation exercise.',
          'Die KEBA Thesis ist die staerkste Case Study fuer Industrierobotik: programmierorientiertes 6-Achs-Manipulator-Workflowdesign, Joint-/Path-Planung, Waypoint-Interpolation, drag&bot-Zellvalidierung, Kollisionszonen-Denken, Re-Grip-Sequenzierung, Maschinenbedienungslogik und Roboterprogramm-Simulationsvalidierung. Das wirkt wie industrielle Roboterprogrammierung, nicht nur wie eine Simulationsuebung.'),
        actions: [sectionAction(language, 'projects', 'Open KEBA project area', 'KEBA Projektbereich oeffnen')],
        suggestions: t(language,
          ['Review technical stack', 'Show project evidence', 'Assess robotics fit'],
          ['Technischen Stack pruefen', 'Projektbelege zeigen', 'Robotik-Fit bewerten']),
      };

    case 'ros':
      return {
        ...common,
        response: t(language,
          'The ROS autonomy project shows SLAM mapping, localization, navigation flow, obstacle-aware behavior, Gazebo simulation, and RViz validation. It is the clearest mobile robotics software proof in the portfolio.',
          'Das ROS-Autonomieprojekt zeigt SLAM Mapping, Lokalisierung, Navigation, hindernisbewusstes Verhalten, Gazebo-Simulation und RViz-Validierung. Es ist der klarste Mobile-Robotics-Softwarebeleg im Portfolio.'),
        actions: [sectionAction(language, 'projects', 'Open Projects', 'Projekte oeffnen'), githubAction(language)],
      };

    case 'serviceRobot':
      return {
        ...common,
        response: t(language,
          'The Arduino service robot adds hands-on embedded evidence: sensor feedback, line tracking, motor control, physical prototype validation, and mechatronic behavior beyond screen-only simulation.',
          'Der Arduino-Service-Roboter liefert Embedded-Nachweis: Sensorfeedback, Line Tracking, Motorsteuerung, physische Prototypvalidierung und mechatronisches Verhalten jenseits reiner Simulation.'),
        actions: [sectionAction(language, 'projects', 'Open Projects', 'Projekte oeffnen')],
      };

    case 'activeSuspension':
      return {
        ...common,
        response: t(language,
          'The active suspension work shows MATLAB/Simulink dynamic-system modeling, hydraulic actuation thinking, response analysis, and controls-oriented engineering judgment.',
          'Das Active-Suspension-Projekt zeigt MATLAB/Simulink-Systemmodellierung, hydraulische Aktuation, Antwortanalyse und regelungstechnisches Engineering-Urteil.'),
        actions: [sectionAction(language, 'projects', 'Open Projects', 'Projekte oeffnen')],
      };

    case 'vr':
      return {
        ...common,
        response: t(language,
          'The VR workshop shows Unity/XR simulation skill: translating machine-operation logic into an interactive training environment with spatial interaction and realistic process flow.',
          'Der VR-Workshop zeigt Unity/XR-Simulationskompetenz: Maschinenbedienung wird in eine interaktive Trainingsumgebung mit raeumlicher Interaktion und Prozessfluss uebersetzt.'),
        actions: [sectionAction(language, 'projects', 'Open Projects', 'Projekte oeffnen')],
      };

    case 'topology':
      return {
        ...common,
        response: t(language,
          'The older topology/bag-sealer work is not a separate detailed card in this portfolio yet. The project section currently prioritizes robotics, ROS, embedded service robotics, VR simulation, and active suspension modeling.',
          'Die aeltere Topology/Bag-Sealer-Arbeit ist in diesem Portfolio noch keine eigene Detailkarte. Die Projektsektion priorisiert aktuell Robotik, ROS, Embedded-Service-Robotik, VR-Simulation und Active Suspension Modeling.'),
        actions: [sectionAction(language, 'projects', 'Open current project section', 'Aktuelle Projekte oeffnen')],
      };

    case 'education':
      return {
        ...common,
        response: t(language,
          `Education path: ${masterEducation.degree} at ${masterEducation.university}, built on ${bachelorEducation.degree} from ${bachelorEducation.university}. That bridges mechanics, controls, software, and automation systems.`,
          `Ausbildungsweg: ${masterEducation.degree} an der ${masterEducation.university}, aufgebaut auf ${bachelorEducation.degree} der ${bachelorEducation.university}. Das verbindet Mechanik, Regelung, Software und Automationssysteme.`),
        actions: [sectionAction(language, 'education', 'Open Education', 'Ausbildung oeffnen')],
      };

    case 'location':
      return {
        ...common,
        response: t(language,
          `${personal.name} is based in ${personal.location}, with an India-to-Germany engineering path. The portfolio presents that as a practical profile for German robotics, automation, and simulation roles.`,
          `${personal.name} ist in ${personal.location} und hat einen Engineering-Weg von Indien nach Deutschland. Das Portfolio positioniert ihn fuer Robotik-, Automations- und Simulationsrollen in Deutschland.`),
        actions: [sectionAction(language, 'about', 'Open About', 'About oeffnen'), sectionAction(language, 'contact', 'Open Contact', 'Kontakt oeffnen')],
      };

    case 'journey':
      return {
        ...common,
        response: t(language,
          'The India-to-Germany journey matters because the profile combines a mechanical engineering foundation from India with German mechatronics, cyber-physical systems, industrial robotics, and KEBA exposure.',
          'Der Weg von Indien nach Deutschland ist wichtig, weil das Profil eine Mechanical-Engineering-Basis aus Indien mit deutscher Mechatronik, cyber-physischen Systemen, Industrierobotik und KEBA-Erfahrung verbindet.'),
        actions: [sectionAction(language, 'about', 'Open About', 'About oeffnen'), sectionAction(language, 'education', 'Open Education', 'Ausbildung oeffnen')],
      };

    case 'skills':
      return {
        ...common,
        response: t(language,
          `Core stack: ${skillNames}. The pattern is model-to-validation engineering across robotics software, simulation, controls, and automation workflows.`,
          `Kernstack: ${skillNames}. Das Muster ist Engineering vom Modell bis zur Validierung ueber Robotiksoftware, Simulation, Regelung und Automationsworkflows.`),
        actions: [sectionAction(language, 'skills', 'Open Skills', 'Skills oeffnen')],
      };

    case 'roleFit':
      return {
        ...common,
        response: t(language,
          'Strong fit: Robotics Software Engineer, Automation Engineer, Simulation Engineer, ROS Developer, Mechatronics Engineer, and Industrial Robotics Engineer. Best signal: he connects workflow logic, simulation validation, and practical industrial context.',
          'Starker Fit: Robotics Software Engineer, Automation Engineer, Simulation Engineer, ROS Developer, Mechatronics Engineer und Industrial Robotics Engineer. Staerkstes Signal: Workflow-Logik, Simulationsvalidierung und industrieller Kontext.'),
        actions: [sectionAction(language, 'experience', 'Open Experience', 'Erfahrung oeffnen'), resumeAction(language)],
      };

    case 'recruiterPath':
      return {
        ...common,
        response: t(language,
          'For a recruiter scan, start with Experience, then Projects, then Resume Overview. That sequence shows industrial context, technical proof, and the compact CV-style summary.',
          'Fuer Recruiter: zuerst Erfahrung, dann Projekte, dann Lebenslaufuebersicht. Diese Reihenfolge zeigt industriellen Kontext, technische Belege und die kompakte CV-Zusammenfassung.'),
        actions: [sectionAction(language, 'experience', 'Open Experience', 'Erfahrung oeffnen'), sectionAction(language, 'projects', 'Open Projects', 'Projekte oeffnen'), resumeAction(language)],
      };

    case 'studentPath':
      return {
        ...common,
        response: t(language,
          'For students, the best path is Projects, Skills, and Education. It shows how classroom topics become ROS, simulation, embedded control, and industrial robotics case studies.',
          'Fuer Studierende ist der beste Pfad: Projekte, Skills und Ausbildung. Das zeigt, wie Studieninhalte zu ROS, Simulation, Embedded Control und Industrierobotik-Case-Studies werden.'),
        actions: [sectionAction(language, 'projects', 'Open Projects', 'Projekte oeffnen'), sectionAction(language, 'education', 'Open Education', 'Ausbildung oeffnen')],
      };

    case 'reviews':
      return {
        ...common,
        response: t(language,
          verifiedReference
            ? `The portfolio includes a verified reference from ${verifiedReference.name}, ${verifiedReference.role} at ${verifiedReference.company}. It highlights motivation, collaboration, problem solving, and the bridge between robotics theory and practical coding.`
            : 'The portfolio has a recommendations section for verified professional references and pending public recommendations.',
          verifiedReference
            ? `Das Portfolio enthaelt eine verifizierte Referenz von ${verifiedReference.name}, ${verifiedReference.role} bei ${verifiedReference.company}. Sie betont Motivation, Zusammenarbeit, Problemloesung und die Verbindung von Robotiktheorie mit praktischer Programmierung.`
            : 'Das Portfolio hat eine Empfehlungssektion fuer verifizierte professionelle Referenzen und pending Empfehlungen.'),
        actions: [sectionAction(language, 'contact', 'Contact Sooraj', 'Sooraj kontaktieren')],
      };

    case 'contact':
      return {
        ...common,
        response: t(language,
          `For hiring, collaboration, or technical discussion, email is the fastest route: ${personal.email}. Include role context, project scope, location or remote expectation, and the robotics or automation problem.`,
          `Fuer Recruiting, Kollaboration oder technische Abstimmung ist E-Mail der schnellste Weg: ${personal.email}. Gut sind Rolle, Projektumfang, Standort/Remote-Erwartung und das Robotik- oder Automationsproblem.`),
        actions: [emailAction(language), sectionAction(language, 'contact', 'Open Contact', 'Kontakt oeffnen')],
        suggestions: t(language,
          ['Open resume', 'Assess robotics fit', 'Explain KEBA workflow'],
          ['Lebenslauf oeffnen', 'Robotik-Fit bewerten', 'KEBA Workflow erklaeren']),
      };

    case 'resume':
      return {
        ...common,
        response: t(language,
          'Use the Resume Overview for a compact recruiter scan. For the latest full CV version, contact Sooraj directly through email or LinkedIn.',
          'Nutzen Sie die Lebenslaufuebersicht fuer einen kompakten Recruiter-Scan. Fuer die neueste vollstaendige CV-Version kontaktieren Sie Sooraj direkt per E-Mail oder LinkedIn.'),
        actions: [resumeAction(language), emailAction(language)],
      };

    case 'linkedin':
      return {
        ...common,
        response: t(language,
          'LinkedIn is the best external profile for professional context, hiring messages, and verified network signals.',
          'LinkedIn ist das beste externe Profil fuer professionellen Kontext, Hiring-Nachrichten und verifizierbare Netzwerksignale.'),
        actions: [linkedinAction(language), emailAction(language)],
      };

    case 'github':
      return {
        ...common,
        response: t(language,
          'GitHub is useful for reviewing software-facing proof, especially ROS/autonomy and implementation-oriented project work.',
          'GitHub ist nuetzlich fuer softwareorientierte Nachweise, besonders ROS/Autonomie und implementierungsnahe Projektarbeit.'),
        actions: [githubAction(language), sectionAction(language, 'projects', 'Open Projects', 'Projekte oeffnen')],
      };

    case 'availability':
      return {
        ...common,
        response: t(language,
          personal.availability,
          'Offen fuer Vollzeitrollen in Robotik, Automation und Simulation Engineering. Fuer verbindliche Details bitte direkt per E-Mail Kontakt aufnehmen.'),
        actions: [emailAction(language), resumeAction(language)],
      };

    case 'workMode':
      return {
        ...common,
        response: t(language,
          'The portfolio is strongest for Germany-facing robotics, automation, and simulation roles. Exact onsite, hybrid, or remote expectations should be confirmed directly with Sooraj.',
          'Das Portfolio passt besonders zu Deutschland-orientierten Robotik-, Automations- und Simulationsrollen. Onsite-, Hybrid- oder Remote-Erwartungen sollten direkt mit Sooraj geklaert werden.'),
        actions: [emailAction(language)],
      };

    case 'relocation':
      return {
        ...common,
        response: t(language,
          `${personal.name} is currently based in ${personal.location}. Relocation or location-specific expectations should be discussed directly for the role.`,
          `${personal.name} ist aktuell in ${personal.location}. Relocation- oder Standortdetails sollten direkt fuer die konkrete Rolle besprochen werden.`),
        actions: [emailAction(language)],
      };

    case 'sponsorship':
      return {
        ...common,
        response: t(language,
          'For work authorization or sponsorship details, use direct contact. The chatbot should not invent legal or immigration status beyond what the portfolio states.',
          'Fuer Arbeitsgenehmigung oder Sponsorship bitte direkt Kontakt aufnehmen. Der Chatbot erfindet keinen rechtlichen oder Immigration-Status ausserhalb der Portfolioangaben.'),
        actions: [emailAction(language)],
      };

    case 'noticePeriod':
      return {
        ...common,
        response: t(language,
          'Notice period is recruiter-specific information. Please contact Sooraj directly so he can answer with the current and role-appropriate detail.',
          'Die Kuendigungsfrist ist recruiter-spezifische Information. Bitte Sooraj direkt kontaktieren, damit er aktuell und passend zur Rolle antworten kann.'),
        actions: [emailAction(language)],
      };

    case 'salary':
      return {
        ...common,
        response: t(language,
          'Salary expectation is intentionally not answered by the chatbot. It depends on role scope, location, contract type, and responsibilities, so it should be discussed directly with Sooraj.',
          'Gehaltsvorstellung wird absichtlich nicht vom Chatbot beantwortet. Sie haengt von Rolle, Standort, Vertragsart und Verantwortung ab und sollte direkt mit Sooraj besprochen werden.'),
        actions: [emailAction(language)],
      };

    case 'privacy':
      return {
        ...common,
        response: t(language,
          'Chat messages may be recorded in the portfolio review database for admin review and improvement, and a local browser copy is used for follow-up continuity. Admin access is password protected. Please do not share passwords, private phone numbers, or sensitive personal data here.',
          'Chatnachrichten koennen in der Portfolio-Pruefdatenbank fuer Adminpruefung und Verbesserung gespeichert werden; eine lokale Browserkopie wird fuer Follow-up-Kontinuitaet genutzt. Der Adminzugang ist passwortgeschuetzt. Bitte teilen Sie hier keine Passwoerter, privaten Telefonnummern oder sensiblen persoenlichen Daten.'),
      };

    case 'assistantTraining':
      return {
        ...common,
        response: t(language,
          'This assistant is not a live external AI model. It uses the portfolio question bank, a local matcher, and curated answer topics. Sooraj can improve it by adding intents, keywords, and answer text.',
          'Dieser Assistent ist kein externes Live-KI-Modell. Er nutzt die Portfolio-Fragenbank, lokalen Abgleich und kuratierte Antwortthemen. Sooraj kann ihn durch neue Intents, Keywords und Antworten verbessern.'),
      };

    case 'botName':
      return {
        ...common,
        response: t(language,
          'My name is Portfolio Assistant. I am the guide for this website. If you mean the portfolio owner, his name is Sooraj Sudhakaran.',
          'Mein Name ist Portfolio Assistant. Ich bin der Guide fuer diese Website. Wenn Sie den Portfolio-Inhaber meinen: Er heisst Sooraj Sudhakaran.'),
        actions: [sectionAction(language, 'about', 'Open About', 'About oeffnen')],
      };

    case 'ownerName':
      return {
        ...common,
        response: t(language,
          `The portfolio owner is ${personal.name}. This site presents his robotics, automation, simulation, education, projects, references, and contact routes.`,
          `Der Portfolio-Inhaber ist ${personal.name}. Diese Seite zeigt Robotik, Automation, Simulation, Ausbildung, Projekte, Referenzen und Kontaktwege.`),
        actions: [sectionAction(language, 'about', 'Open About', 'About oeffnen')],
      };

    case 'botAge':
      return {
        ...common,
        response: t(language,
          'I do not have a human age. I am a website assistant built from the portfolio question bank and curated answer logic.',
          'Ich habe kein menschliches Alter. Ich bin ein Website-Assistent, gebaut aus der Portfolio-Fragenbank und kuratierter Antwortlogik.'),
      };

    case 'botOrientation':
      return {
        ...common,
        response: t(language,
          'I do not have a sexual orientation. I am software for this portfolio, so the useful questions for me are about Sooraj’s engineering profile, robotics projects, skills, resume, references, or contact.',
          'Ich habe keine sexuelle Orientierung. Ich bin Software fuer dieses Portfolio. Sinnvolle Fragen an mich sind Soorajs Engineering-Profil, Robotikprojekte, Skills, Lebenslauf, Referenzen oder Kontakt.'),
        suggestions: t(language,
          ['Tell me about Sooraj', 'Show project evidence', 'Contact Sooraj'],
          ['Erzaehl mir von Sooraj', 'Projektbelege zeigen', 'Sooraj kontaktieren']),
      };

    case 'botFood':
      return {
        ...common,
        response: t(language,
          'I do not eat or drink because I am a website assistant. I am ready to help with portfolio questions, especially robotics fit, KEBA workflow, ROS projects, skills, resume, and contact.',
          'Ich esse und trinke nicht, weil ich ein Website-Assistent bin. Ich helfe gern bei Portfolio-Fragen, besonders Robotik-Fit, KEBA Workflow, ROS-Projekten, Skills, Lebenslauf und Kontakt.'),
        suggestions: t(language,
          ['Assess robotics fit', 'Explain KEBA workflow', 'Show project evidence'],
          ['Robotik-Fit bewerten', 'KEBA Workflow erklaeren', 'Projektbelege zeigen']),
      };

    case 'botStatus':
      return {
        ...common,
        response: t(language,
          'I am running well and ready to help. Ask me about Sooraj’s robotics experience, KEBA workflow, ROS projects, skills, resume, recommendations, or contact path.',
          'Mir geht es gut und ich bin bereit zu helfen. Fragen Sie nach Soorajs Robotik-Erfahrung, KEBA Workflow, ROS-Projekten, Skills, Lebenslauf, Empfehlungen oder Kontaktweg.'),
        suggestions: t(language,
          ['Tell me about Sooraj', 'Explain KEBA workflow', 'Contact Sooraj'],
          ['Erzaehl mir von Sooraj', 'KEBA Workflow erklaeren', 'Sooraj kontaktieren']),
      };

    case 'thanks':
      return {
        ...common,
        response: t(language,
          'You are welcome. I can keep helping with role fit, project evidence, resume, or contact.',
          'Gern geschehen. Ich kann weiter bei Rollen-Fit, Projektbelegen, Lebenslauf oder Kontakt helfen.'),
      };

    case 'goodbye':
      return {
        ...common,
        response: t(language,
          'Goodbye. The best next step is to review the projects or contact Sooraj directly when you are ready.',
          'Auf Wiedersehen. Der beste naechste Schritt ist, die Projekte zu pruefen oder Sooraj direkt zu kontaktieren.'),
        actions: [sectionAction(language, 'projects', 'Open Projects', 'Projekte oeffnen'), emailAction(language)],
      };

    case 'capabilities':
      return {
        ...common,
        response: t(language,
          'I can summarize Sooraj’s profile, explain KEBA and ROS projects, compare role fit, list skills, route you to resume/contact, answer privacy questions, and guide recruiters or students through the portfolio.',
          'Ich kann Soorajs Profil zusammenfassen, KEBA- und ROS-Projekte erklaeren, Rollen-Fit vergleichen, Skills listen, zu Lebenslauf/Kontakt fuehren, Datenschutzfragen beantworten und Recruiter oder Studierende durch das Portfolio leiten.'),
        suggestions: t(language,
          ['Assess robotics fit', 'Explain KEBA workflow', 'Open resume'],
          ['Robotik-Fit bewerten', 'KEBA Workflow erklaeren', 'Lebenslauf oeffnen']),
      };

    case 'botGender':
      return {
        ...common,
        response: t(language,
          'I do not have a gender. I am a software assistant for Sooraj’s portfolio.',
          'Ich habe kein Geschlecht. Ich bin ein Software-Assistent fuer Soorajs Portfolio.'),
      };

    case 'botOrigin':
      return {
        ...common,
        response: t(language,
          'I come from this portfolio website: a chatbot using the portfolio question bank and curated portfolio-specific answers.',
          'Ich komme aus dieser Portfolio-Website: ein Chatbot mit Portfolio-Fragenbank und kuratierten portfolio-spezifischen Antworten.'),
      };

    case 'botIdentity':
      return {
        ...common,
        response: t(language,
          'I am Portfolio Assistant, a website guide for this portfolio. I do not replace Sooraj, do not have personal feelings, and cannot provide live human support. I can route you to the right portfolio evidence or contact path.',
          'Ich bin Portfolio Assistant, ein Website-Guide fuer dieses Portfolio. Ich ersetze Sooraj nicht, habe keine persoenlichen Gefuehle und biete keinen Live-Humansupport. Ich kann zu passenden Portfolio-Belegen oder Kontaktwegen fuehren.'),
        actions: [sectionAction(language, 'projects', 'Open Projects', 'Projekte oeffnen'), emailAction(language)],
      };

    case 'confidential':
      return {
        ...common,
        response: t(language,
          'I cannot provide passwords, admin access, private keys, tokens, backend details, or confidential personal information. I can help with public portfolio content, project evidence, resume routing, and contact.',
          'Ich gebe keine Passwoerter, Admin-Zugaenge, Private Keys, Tokens, Backenddetails oder vertraulichen persoenlichen Informationen weiter. Ich helfe mit oeffentlichem Portfolio-Inhalt, Projektbelegen, Lebenslauf und Kontakt.'),
        actions: [sectionAction(language, 'contact', 'Use official contact', 'Offiziellen Kontakt nutzen')],
      };

    case 'ownerPersonal':
      return {
        ...common,
        response: t(language,
          `${personal.name} is from ${personal.origin} and is now based in ${personal.location}. Public portfolio details focus on engineering background, education, projects, and professional contact paths.`,
          `${personal.name} kommt aus ${personal.origin} und ist jetzt in ${personal.location}. Oeffentliche Portfolioangaben fokussieren Engineering-Hintergrund, Ausbildung, Projekte und professionelle Kontaktwege.`),
        actions: [sectionAction(language, 'about', 'Open About', 'About oeffnen')],
      };

    case 'ownerPrivate':
      return {
        ...common,
        response: t(language,
          'That is private or not relevant to evaluating the portfolio. The useful public signals are engineering work, robotics fit, project evidence, education, references, and contact routes.',
          'Das ist privat oder fuer die Portfolio-Bewertung nicht relevant. Nuetzliche oeffentliche Signale sind Engineering-Arbeit, Robotik-Fit, Projektbelege, Ausbildung, Referenzen und Kontaktwege.'),
        actions: [sectionAction(language, 'projects', 'Open Projects', 'Projekte oeffnen')],
      };

    case 'language':
      return {
        ...common,
        response: t(language,
          'This portfolio supports English and German through the language toggle in the navigation. Sooraj works in an international engineering context and the profile is suitable for Germany-facing roles.',
          'Dieses Portfolio unterstuetzt Englisch und Deutsch ueber den Sprachschalter in der Navigation. Sooraj arbeitet in internationalem Engineering-Kontext und das Profil passt zu Deutschland-orientierten Rollen.'),
      };

    case 'website':
      return {
        ...common,
        response: t(language,
          'This website is a React/Vite portfolio with animated sections, project case-study modals, language and theme preferences, local recommendation drafts, and a chatbot backed by the portfolio question bank.',
          'Diese Website ist ein React/Vite-Portfolio mit animierten Sektionen, Projekt-Case-Study-Modals, Sprach- und Theme-Praeferenzen, lokalen Empfehlungsentwuerfen und einem Chatbot auf Basis der Portfolio-Fragenbank.'),
        actions: [sectionAction(language, 'about', 'Open About', 'About oeffnen')],
      };

    case 'siteTour':
      return {
        ...common,
        response: t(language,
          'Quick tour: About gives the profile, Experience shows industrial context, Projects gives technical proof, Skills summarizes the stack, Education validates the academic path, and Contact converts the next step.',
          'Schnelltour: About zeigt das Profil, Erfahrung den industriellen Kontext, Projekte die technischen Belege, Skills den Stack, Ausbildung den akademischen Weg und Kontakt den naechsten Schritt.'),
        actions: [
          sectionAction(language, 'about', 'About'),
          sectionAction(language, 'experience', 'Experience', 'Erfahrung'),
          sectionAction(language, 'projects', 'Projects', 'Projekte'),
        ],
      };

    case 'image':
      return {
        ...common,
        response: t(language,
          'This chatbot cannot process image uploads. The portfolio uses images only as visual evidence for profile and project context.',
          'Dieser Chatbot kann keine Bild-Uploads verarbeiten. Das Portfolio nutzt Bilder nur als visuelle Belege fuer Profil- und Projektkontext.'),
      };

    case 'theme':
      return {
        ...common,
        response: t(language,
          'Use the theme button in the navigation to switch light and dark mode. The preference is saved locally in your browser.',
          'Nutzen Sie den Theme-Button in der Navigation fuer Hell-/Dunkelmodus. Die Auswahl wird lokal im Browser gespeichert.'),
      };

    case 'smallTalk':
      return {
        ...common,
        response: t(language,
          'I can keep it light, but I am most useful for portfolio questions: robotics fit, KEBA workflow, ROS projects, resume, contact, and engineering evidence.',
          'Ich kann locker antworten, bin aber am nuetzlichsten fuer Portfolio-Fragen: Robotik-Fit, KEBA Workflow, ROS-Projekte, Lebenslauf, Kontakt und Engineering-Belege.'),
      };

    case 'critical':
      return {
        ...common,
        response: t(language,
          'Fair criticism is useful when it is specific. For this portfolio, the strongest review points are clarity of project evidence, role fit, industrial context, and whether the next contact step is easy.',
          'Sachliche Kritik ist nuetzlich, wenn sie konkret ist. Bei diesem Portfolio sind die wichtigsten Pruefpunkte Projektbelege, Rollen-Fit, industrieller Kontext und ein einfacher Kontaktweg.'),
        actions: [sectionAction(language, 'projects', 'Review Projects', 'Projekte pruefen'), sectionAction(language, 'contact', 'Send feedback', 'Feedback senden')],
      };

    case 'interview':
      return {
        ...common,
        response: t(language,
          'Interview summary: Sooraj is strongest where robotics software, mechatronics, simulation, and industrial workflow meet. His best proof is the KEBA robotics workflow, supported by ROS autonomy, embedded service robot work, and simulation projects.',
          'Interview-Zusammenfassung: Sooraj ist am staerksten dort, wo Robotiksoftware, Mechatronik, Simulation und industrieller Workflow zusammenkommen. Der staerkste Beleg ist der KEBA-Robotik-Workflow, ergaenzt durch ROS-Autonomie, Embedded-Service-Robotik und Simulation.'),
        actions: [sectionAction(language, 'projects', 'Open Projects', 'Projekte oeffnen'), resumeAction(language)],
      };

    case 'bestProject':
      return {
        ...common,
        response: t(language,
          'Start with the KEBA Industrial Robotics Workflow if you are hiring for robotics or automation. Start with the ROS Autonomous Vacuum Robot if you want mobile robotics software proof.',
          'Starten Sie mit dem KEBA Industrial Robotics Workflow fuer Robotik- oder Automationsrollen. Starten Sie mit dem ROS Autonomous Vacuum Robot, wenn Mobile-Robotics-Software im Fokus steht.'),
        actions: [sectionAction(language, 'projects', 'Open Projects', 'Projekte oeffnen')],
      };

    case 'recruiterScreen':
      return {
        ...common,
        response: t(language,
          'Recruiter screen: Sooraj is a robotics and automation candidate with a mechatronics base, German master’s education, KEBA industrial robotics exposure, ROS/mobile-robot project evidence, embedded Arduino prototype work, Unity/VR simulation, and MATLAB/Simulink modeling. The strongest fit is a role where robotics software, automation workflow, simulation validation, and practical engineering execution meet.',
          'Recruiter-Screen: Sooraj ist ein Robotik- und Automationskandidat mit Mechatronikbasis, deutschem Masterstudium, KEBA-Industrierobotikbezug, ROS/Mobile-Robotik-Belegen, Embedded-Arduino-Prototyp, Unity/VR-Simulation und MATLAB/Simulink-Modellierung. Der staerkste Fit liegt dort, wo Robotiksoftware, Automationsworkflow, Simulationsvalidierung und praktische Umsetzung zusammenkommen.'),
        actions: [resumeAction(language), sectionAction(language, 'projects', 'Open Projects', 'Projekte oeffnen')],
        suggestions: t(language,
          ['What are the hiring risks?', 'Give interview questions', 'Assess robotics software fit'],
          ['Welche Risiken pruefen?', 'Interviewfragen geben', 'Robotiksoftware-Fit bewerten']),
      };

    case 'recruiterRisk':
      return {
        ...common,
        response: t(language,
          'Recruiter checks: verify the depth of production coding, confirm current availability and work authorization directly, ask for GitHub or thesis artefacts where possible, and probe how independently he implemented each project. The portfolio is strongest on direction and project evidence; interview should validate implementation depth, debugging habits, and real deployment exposure.',
          'Recruiter-Pruefpunkte: Tiefe der Produktionsprogrammierung pruefen, aktuelle Verfuegbarkeit und Arbeitserlaubnis direkt bestaetigen, nach GitHub- oder Thesis-Artefakten fragen und klaeren, wie eigenstaendig die Projekte umgesetzt wurden. Das Portfolio ist stark in Richtung und Projektbelegen; das Interview sollte Implementierungstiefe, Debugging-Gewohnheiten und reale Deployment-Erfahrung validieren.'),
        actions: [emailAction(language), resumeAction(language)],
      };

    case 'interviewPlan':
      return {
        ...common,
        response: t(language,
          'Interview plan: 1. Ask him to whiteboard the KEBA workflow from planning input to robot-program simulation validation. 2. Ask how he would handle collision checks, recovery behavior, and edge cases. 3. Probe ROS navigation: map, localization, planner, RViz/Gazebo debugging. 4. Ask for a debugging story from Arduino or simulation work. 5. Close with role fit: what part of robotics software, automation, or simulation he wants to own.',
          'Interviewplan: 1. KEBA Workflow vom Planning Input bis Waypoint Export und Validierung whiteboarden lassen. 2. Collision Checks, Recovery und Edge Cases abfragen. 3. ROS Navigation pruefen: Map, Lokalisierung, Planner, RViz/Gazebo Debugging. 4. Debugging Story aus Arduino oder Simulation fragen. 5. Mit Rollen-Fit schliessen: welchen Teil von Robotiksoftware, Automation oder Simulation er uebernehmen will.'),
        actions: [sectionAction(language, 'projects', 'Open Projects', 'Projekte oeffnen')],
      };

    case 'roleRoboticsSoftware':
      return {
        ...common,
        response: t(language,
          'Robotics Software Engineer fit: good early-career fit, especially for roles involving ROS, robot workflow tooling, simulation validation, Python/C++ support, and integration with mechanical or automation context. Best proof: KEBA workflow plus ROS vacuum robot. Interview should test code structure, algorithms, debugging, and how he handles messy robot behavior.',
          'Robotics-Software-Engineer-Fit: guter Early-Career-Fit, besonders fuer ROS, Robot-Workflow-Tools, Simulationsvalidierung, Python/C++ Support und Integration mit Mechanik- oder Automationskontext. Bester Beleg: KEBA Workflow plus ROS-Vakuumroboter. Im Interview Code-Struktur, Algorithmen, Debugging und Umgang mit unklaren Robotikproblemen pruefen.'),
        actions: [sectionAction(language, 'projects', 'Open Projects', 'Projekte oeffnen'), githubAction(language)],
      };

    case 'roleAutomationEngineer':
      return {
        ...common,
        response: t(language,
          'Automation Engineer fit: strong where industrial robot workflows, machine-operation logic, simulation, and practical validation matter. KEBA exposure is the strongest signal. He is especially relevant for teams that need someone who can understand robotic motion, machine context, tooling, and documentation rather than only isolated code.',
          'Automation-Engineer-Fit: stark, wo Industrieroboter-Workflows, Maschinenlogik, Simulation und praktische Validierung zaehlen. KEBA ist das staerkste Signal. Besonders relevant fuer Teams, die Robotermotion, Maschinenkontext, Tooling und Dokumentation brauchen, nicht nur isolierten Code.'),
        actions: [sectionAction(language, 'experience', 'Open Experience', 'Erfahrung oeffnen')],
      };

    case 'roleSimulationEngineer':
      return {
        ...common,
        response: t(language,
          'Simulation Engineer fit: good fit for robotics simulation, validation workflows, Unity/XR training simulation, MATLAB/Simulink system modeling, and Gazebo/RViz robotics validation. The portfolio shows simulation as an engineering decision tool, not only as visualization.',
          'Simulation-Engineer-Fit: guter Fit fuer Robotiksimulation, Validierungsworkflows, Unity/XR-Trainingssimulation, MATLAB/Simulink-Systemmodellierung und Gazebo/RViz-Validierung. Das Portfolio zeigt Simulation als Engineering-Werkzeug, nicht nur als Visualisierung.'),
        actions: [sectionAction(language, 'projects', 'Open Projects', 'Projekte oeffnen')],
      };

    case 'roleMechatronicsEngineer':
      return {
        ...common,
        response: t(language,
          'Mechatronics Engineer fit: strong because the profile joins mechanical fundamentals, cyber-physical systems, embedded control, sensors, simulation, and robotics workflows. The Arduino service robot and active suspension work support the mechatronics side; KEBA and ROS support the robotics software side.',
          'Mechatronics-Engineer-Fit: stark, weil das Profil Mechanikgrundlagen, cyber-physische Systeme, Embedded Control, Sensorik, Simulation und Robotikworkflows verbindet. Arduino-Service-Roboter und Active Suspension staerken die Mechatronikseite; KEBA und ROS staerken die Robotiksoftwareseite.'),
        actions: [sectionAction(language, 'skills', 'Open Skills', 'Skills oeffnen')],
      };

    case 'roleRosDeveloper':
      return {
        ...common,
        response: t(language,
          'ROS Developer fit: best for junior or early-career ROS roles involving navigation, Gazebo/RViz validation, Python support, and integration tasks. The vacuum robot project is the clearest ROS proof; the KEBA workflow adds industrial robot planning context.',
          'ROS-Developer-Fit: am besten fuer Junior- oder Early-Career-ROS-Rollen mit Navigation, Gazebo/RViz-Validierung, Python-Support und Integration. Der Vakuumroboter ist der klarste ROS-Beleg; der KEBA Workflow ergaenzt Industrieroboter-Planungskontext.'),
        actions: [sectionAction(language, 'projects', 'Open ROS project', 'ROS-Projekt oeffnen'), githubAction(language)],
      };

    case 'technicalDepth':
      return {
        ...common,
        response: t(language,
          'Technical depth appears in three layers: robotics workflow architecture, simulation/validation tooling, and physical or system-level engineering. KEBA shows planning-to-validation structure; ROS shows autonomy stack thinking; Arduino shows embedded hardware behavior; MATLAB/Simulink shows dynamic modeling; Unity shows interactive simulation.',
          'Technische Tiefe zeigt sich in drei Ebenen: Robotik-Workflow-Architektur, Simulation/Validierung und physische bzw. systemische Engineering-Arbeit. KEBA zeigt Planning-to-Validation-Struktur; ROS zeigt Autonomie-Stack-Denken; Arduino zeigt Embedded-Hardwareverhalten; MATLAB/Simulink zeigt Dynamikmodellierung; Unity zeigt interaktive Simulation.'),
        actions: [sectionAction(language, 'projects', 'Open Projects', 'Projekte oeffnen'), sectionAction(language, 'skills', 'Open Skills', 'Skills oeffnen')],
      };

    case 'roboticsBasics':
      return {
        ...common,
        response: t(language,
          'Robotics combines mechanics, electronics, sensing, control, software, and decision logic so a machine can act in the physical world. In Sooraj’s portfolio, robotics appears through industrial robot workflow planning, ROS navigation, embedded service robot behavior, simulation validation, and mechatronics education.',
          'Robotik verbindet Mechanik, Elektronik, Sensorik, Regelung, Software und Entscheidungslogik, damit eine Maschine in der physischen Welt handeln kann. In Soorajs Portfolio erscheint Robotik durch Industrieroboter-Workflowplanung, ROS-Navigation, Embedded-Service-Roboter, Simulationsvalidierung und Mechatronikstudium.'),
        actions: [sectionAction(language, 'projects', 'Open Robotics Projects', 'Robotikprojekte oeffnen')],
      };

    case 'rosBasics':
      return {
        ...common,
        response: t(language,
          'ROS, Robot Operating System, is a robotics middleware ecosystem. It helps connect nodes for sensors, mapping, planning, control, visualization, and simulation. In this portfolio it matters because the autonomous vacuum robot uses ROS concepts around SLAM, navigation, Gazebo, and RViz.',
          'ROS, Robot Operating System, ist ein Middleware-Oekosystem fuer Robotik. Es verbindet Nodes fuer Sensorik, Mapping, Planung, Kontrolle, Visualisierung und Simulation. In diesem Portfolio ist es wichtig, weil der autonome Vakuumroboter ROS-Konzepte rund um SLAM, Navigation, Gazebo und RViz nutzt.'),
        actions: [sectionAction(language, 'projects', 'Open ROS Project', 'ROS-Projekt oeffnen')],
      };

    case 'ros2Basics':
      return {
        ...common,
        response: t(language,
          'ROS 2 is the newer ROS generation with stronger support for distributed systems, real-time direction, DDS communication, lifecycle management, and industrial use cases. The portfolio mentions ROS and ROS 2 in the robotics stack; for hiring, ask which parts he has used hands-on and where he wants deeper production exposure.',
          'ROS 2 ist die neuere ROS-Generation mit staerkerem Fokus auf verteilte Systeme, Real-Time-Richtung, DDS-Kommunikation, Lifecycle Management und industrielle Use Cases. Das Portfolio nennt ROS und ROS 2 im Robotikstack; im Hiring sollte man fragen, welche Teile er praktisch genutzt hat und wo er tiefere Produktionserfahrung aufbauen will.'),
        actions: [sectionAction(language, 'skills', 'Open Skills', 'Skills oeffnen')],
      };

    case 'slamBasics':
      return {
        ...common,
        response: t(language,
          'SLAM means Simultaneous Localization and Mapping. A robot builds or uses a map while estimating where it is inside that map. In the vacuum robot project, SLAM is part of the autonomy story: map generation, localization, obstacle-aware navigation, and validation through Gazebo/RViz.',
          'SLAM bedeutet Simultaneous Localization and Mapping. Ein Roboter baut oder nutzt eine Karte und schaetzt gleichzeitig seine Position darin. Im Vakuumroboterprojekt gehoert SLAM zur Autonomie-Story: Kartenerzeugung, Lokalisierung, hindernisbewusste Navigation und Validierung mit Gazebo/RViz.'),
        actions: [sectionAction(language, 'projects', 'Open Vacuum Robot Project', 'Vakuumroboter-Projekt oeffnen')],
      };

    case 'motionPlanningBasics':
      return {
        ...common,
        response: t(language,
          'Motion planning decides how a robot should move from one state to another while respecting constraints such as reachability, smoothness, obstacles, and task goals. Sooraj’s KEBA case shows this through joint-path planning, waypoint interpolation, robot-program simulation, and validation-ready review.',
          'Motion Planning entscheidet, wie ein Roboter von einem Zustand in einen anderen kommt und Constraints wie Erreichbarkeit, Glattheit, Hindernisse und Aufgabenlogik beachtet. Soorajs KEBA Case zeigt das durch Joint-Path Planning, Waypoint-Interpolation, Roboterprogramm-Simulation und validierungsbereite Pruefung.'),
        actions: [sectionAction(language, 'projects', 'Open KEBA Project', 'KEBA-Projekt oeffnen')],
      };

    case 'collisionAvoidanceBasics':
      return {
        ...common,
        response: t(language,
          'Collision avoidance means planning or controlling robot motion so it does not hit obstacles, fixtures, machines, people, or itself. In this portfolio it appears as collision-aware execution thinking in the KEBA workflow and obstacle-aware behavior in the ROS vacuum robot.',
          'Collision Avoidance bedeutet, Roboterbewegung so zu planen oder zu steuern, dass keine Hindernisse, Vorrichtungen, Maschinen, Menschen oder der Roboter selbst kollidiert. Im Portfolio erscheint es als kollisionsbewusstes Denken im KEBA Workflow und hindernisbewusstes Verhalten beim ROS-Vakuumroboter.'),
        actions: [sectionAction(language, 'projects', 'Open Projects', 'Projekte oeffnen')],
      };

    case 'gazeboRvizBasics':
      return {
        ...common,
        response: t(language,
          'Gazebo is used for robot simulation, while RViz is used for visualization and debugging of robot state, sensor data, maps, frames, and planning output. Together they help validate robot behavior before real-world testing. In Sooraj’s portfolio they support the ROS autonomy project.',
          'Gazebo dient der Robotersimulation, RViz der Visualisierung und dem Debugging von Robot State, Sensordaten, Karten, Frames und Planning Output. Zusammen helfen sie, Roboterverhalten vor realen Tests zu validieren. In Soorajs Portfolio stuetzen sie das ROS-Autonomieprojekt.'),
        actions: [sectionAction(language, 'projects', 'Open ROS Project', 'ROS-Projekt oeffnen')],
      };

    case 'matlabSimulinkBasics':
      return {
        ...common,
        response: t(language,
          'MATLAB and Simulink are useful for modeling dynamics, controls, and system response. Sooraj’s active suspension project uses this signal: dynamic system behavior, hydraulic actuation thinking, response analysis, and control-modeling discipline.',
          'MATLAB und Simulink sind nuetzlich fuer Dynamikmodellierung, Regelung und Systemantwort. Soorajs Active-Suspension-Projekt nutzt dieses Signal: dynamisches Systemverhalten, hydraulische Aktuation, Antwortanalyse und Control-Modeling-Disziplin.'),
        actions: [sectionAction(language, 'projects', 'Open Active Suspension Project', 'Active-Suspension-Projekt oeffnen')],
      };

    case 'unityXrBasics':
      return {
        ...common,
        response: t(language,
          'Unity/XR work is relevant when engineering processes need spatial interaction, training, or simulation. The VR machine-operation workshop shows that Sooraj can translate machine steps into an interactive environment, combining C#, scene logic, process flow, and user interaction.',
          'Unity/XR ist relevant, wenn Engineering-Prozesse raeumliche Interaktion, Training oder Simulation brauchen. Der VR Machine Operation Workshop zeigt, dass Sooraj Maschinenschritte in eine interaktive Umgebung uebersetzen kann: C#, Szenenlogik, Prozessfluss und User Interaction.'),
        actions: [sectionAction(language, 'projects', 'Open VR Project', 'VR-Projekt oeffnen')],
      };

    case 'embeddedArduinoBasics':
      return {
        ...common,
        response: t(language,
          'Embedded robotics connects code to physical behavior. The Arduino service robot demonstrates sensor feedback, line tracking, motor control, and prototype validation. That matters because robotics candidates need to understand that real machines behave differently from clean simulations.',
          'Embedded Robotics verbindet Code mit physischem Verhalten. Der Arduino-Service-Roboter zeigt Sensorfeedback, Line Tracking, Motorsteuerung und Prototypvalidierung. Das ist wichtig, weil Robotikkandidaten verstehen muessen, dass reale Maschinen anders reagieren als saubere Simulationen.'),
        actions: [sectionAction(language, 'projects', 'Open Service Robot Project', 'Service-Roboter-Projekt oeffnen')],
      };

    case 'pythonCppBalance':
      return {
        ...common,
        response: t(language,
          'Programming signal: Python is the clearest implementation language in the portfolio, especially for robotics workflow tooling and robot-program simulation logic. C++ is part of the robotics stack expectation, C# appears through Unity, and MATLAB/Simulink supports modeling. For a software-heavy role, interview should test code quality and C++ depth directly.',
          'Programmiersignal: Python ist die klarste Implementierungssprache im Portfolio, besonders fuer Robotik-Workflow-Tooling und Roboterprogramm-Simulationslogik. C++ gehoert zur Robotikstack-Erwartung, C# erscheint durch Unity, MATLAB/Simulink durch Modellierung. Fuer softwarelastige Rollen sollte Codequalitaet und C++-Tiefe direkt geprueft werden.'),
        actions: [sectionAction(language, 'skills', 'Open Skills', 'Skills oeffnen'), githubAction(language)],
      };

    case 'mechanicalSoftwareIntegration':
      return {
        ...common,
        response: t(language,
          'The profile is not purely mechanical and not purely software. It is a mechatronics profile: mechanical engineering foundation, cyber-physical systems education, robotics software projects, simulation, embedded control, and industrial automation context. That is valuable for teams where robot software must respect physical constraints.',
          'Das Profil ist weder rein mechanisch noch rein softwareorientiert. Es ist ein Mechatronikprofil: Maschinenbaubasis, Cyber-Physical-Systems-Ausbildung, Robotiksoftwareprojekte, Simulation, Embedded Control und industrieller Automationskontext. Wertvoll fuer Teams, in denen Robotersoftware physische Grenzen beachten muss.'),
        actions: [sectionAction(language, 'education', 'Open Education', 'Ausbildung oeffnen'), sectionAction(language, 'skills', 'Open Skills', 'Skills oeffnen')],
      };

    case 'industrialContext':
      return {
        ...common,
        response: t(language,
          'Industrial context comes from KEBA robotics and earlier NDT field discipline. KEBA adds automation and industrial robot workflow exposure; NDT adds procedure, quality, safety, reporting, and accountability. Together they make the portfolio more practical than a classroom-only project list.',
          'Industrieller Kontext kommt aus KEBA-Robotik und frueherer NDT-Felddisziplin. KEBA bringt Automation und Industrieroboter-Workflow, NDT bringt Verfahren, Qualitaet, Sicherheit, Reporting und Verantwortlichkeit. Zusammen ist das Portfolio praktischer als eine reine Studienprojektliste.'),
        actions: [sectionAction(language, 'experience', 'Open Experience', 'Erfahrung oeffnen')],
      };

    case 'kebaDeep':
      return {
        ...common,
        response: t(language,
          'KEBA is important because it moves the portfolio toward industrial robotics and robot programming, not hobby robotics only. The portfolio frames KEBA around 6-axis manipulator workflow design, joint/path planning, drag&bot cell validation, waypoint generation, collision-zone logic, machine-operation sequencing, and deployment-aware engineering.',
          'KEBA ist wichtig, weil es das Portfolio Richtung Industrierobotik und Roboterprogrammierung bewegt, nicht nur Hobbyrobotik. Das Portfolio rahmt KEBA ueber 6-Achs-Manipulator-Workflowdesign, Joint-/Path-Planung, drag&bot-Zellvalidierung, Waypoint-Erzeugung, Kollisionszonen-Logik, Maschinenbedienungs-Sequenzierung und deploymentnahes Engineering.'),
        actions: [sectionAction(language, 'projects', 'Open KEBA Project', 'KEBA-Projekt oeffnen'), sectionAction(language, 'experience', 'Open Experience', 'Erfahrung oeffnen')],
      };

    case 'dragbotContext':
      return {
        ...common,
        response: t(language,
          'drag&bot context matters because it connects robot workflow planning with a practical industrial automation environment. In the portfolio, it is used as the validation and workflow context around the KEBA thesis rather than as a standalone marketing claim.',
          'drag&bot ist wichtig, weil es Robotik-Workflowplanung mit einem praktischen industriellen Automationsumfeld verbindet. Im Portfolio ist es Validierungs- und Workflow-Kontext der KEBA Thesis, nicht nur ein isoliertes Buzzword.'),
        actions: [sectionAction(language, 'projects', 'Open KEBA Project', 'KEBA-Projekt oeffnen')],
      };

    case 'projectComparison':
      return {
        ...common,
        response: t(language,
          'Project comparison: KEBA is strongest for industrial robotics and workflow planning. ROS vacuum robot is strongest for mobile autonomy software. Arduino service robot is strongest for embedded mechatronics. VR workshop is strongest for interactive simulation/training. Active suspension is strongest for controls and dynamic modeling.',
          'Projektvergleich: KEBA ist am staerksten fuer Industrierobotik und Workflowplanung. ROS-Vakuumroboter fuer Mobile-Autonomy-Software. Arduino-Service-Roboter fuer Embedded-Mechatronik. VR Workshop fuer interaktive Simulation/Training. Active Suspension fuer Regelung und Dynamikmodellierung.'),
        actions: [sectionAction(language, 'projects', 'Open Projects', 'Projekte oeffnen')],
      };

    case 'projectTimeline':
      return {
        ...common,
        response: t(language,
          'Timeline pattern: mechanical engineering foundation first, then NDT industrial discipline, then German mechatronics/cyber-physical systems education, then robotics/simulation projects, then KEBA industrial robotics and thesis work. The trajectory moves from fundamentals toward applied robotics.',
          'Timeline-Muster: zuerst Mechanical-Engineering-Basis, dann NDT-Industriedisziplin, danach deutsches Mechatronik/Cyber-Physical-Systems-Studium, dann Robotik-/Simulationsprojekte und schliesslich KEBA-Industrierobotik/Thesis. Die Entwicklung geht von Grundlagen zu angewandter Robotik.'),
        actions: [sectionAction(language, 'experience', 'Open Experience', 'Erfahrung oeffnen'), sectionAction(language, 'education', 'Open Education', 'Ausbildung oeffnen')],
      };

    case 'recommendationSubmit':
      return {
        ...common,
        response: t(language,
          'To recommend Sooraj, open the Recommendations section and use Add Recommendation. A good submission should include real name, role, company or university, optional LinkedIn, and a concrete statement about work observed. It is submitted as pending until admin verification approves public display.',
          'Um Sooraj zu empfehlen, die Sektion Empfehlungen oeffnen und Empfehlung hinzufuegen nutzen. Gute Eintraege enthalten echten Namen, Rolle, Unternehmen oder Hochschule, optional LinkedIn und eine konkrete Aussage zur beobachteten Arbeit. Der Eintrag bleibt pending, bis Admin-Verifizierung die oeffentliche Anzeige freigibt.'),
        actions: [sectionAction(language, 'recommendations', 'Open Recommendations', 'Empfehlungen oeffnen')],
      };

    case 'recommendationAdmin':
      return {
        ...common,
        response: t(language,
          'Recommendation admin flow: visitor submissions are stored as pending in the Supabase recommendations table. Admin signs in through Admin Review, checks the profile and text, then approves, rejects, or deletes. Public cards load only approved entries plus the static verified reference.',
          'Recommendation-Admin-Flow: Besucher-Eintraege werden als pending in der Supabase-Recommendations-Tabelle gespeichert. Admin meldet sich ueber Admin Review an, prueft Profil und Text und kann freigeben, ablehnen oder loeschen. Oeffentlich geladen werden nur approved Eintraege plus statische verifizierte Referenz.'),
        actions: [sectionAction(language, 'recommendations', 'Open Recommendations', 'Empfehlungen oeffnen')],
      };

    case 'supabaseStatus':
      return {
        ...common,
        response: t(language,
          'The frontend is wired for Supabase recommendations, but the live database must contain the portfolio_recommendations table and RLS policies from the SQL file. If that SQL is not applied, public submission and admin approval will fail with a missing-table error.',
          'Das Frontend ist fuer Supabase-Empfehlungen verdrahtet, aber die Live-Datenbank braucht die Tabelle portfolio_recommendations und RLS Policies aus der SQL-Datei. Ohne angewendetes SQL schlagen Submission und Admin Approval mit Missing-Table-Fehler fehl.'),
        actions: [sectionAction(language, 'recommendations', 'Open Recommendations', 'Empfehlungen oeffnen')],
      };

    case 'websiteStack':
      return {
        ...common,
        response: t(language,
          'Website stack: React, Vite, Tailwind-style utility classes, Framer Motion animations, Lucide icons, local language/theme preferences, generated production dist files, and a curated chatbot knowledge layer. Supabase is used for the live recommendation/admin backend once the SQL table exists.',
          'Website-Stack: React, Vite, Tailwind-artige Utility-Klassen, Framer Motion Animationen, Lucide Icons, lokale Sprach-/Theme-Praeferenzen, generierte Production-Dist-Dateien und eine kuratierte Chatbot-Knowledge-Layer. Supabase dient fuer Live-Recommendation/Admin-Backend, sobald die SQL-Tabelle existiert.'),
        actions: [sectionAction(language, 'about', 'Open About', 'About oeffnen')],
      };

    case 'portfolioQuality':
      return {
        ...common,
        response: t(language,
          'Portfolio quality: strong visual polish, clear robotics positioning, useful project modals, bilingual support, resume route, certificates, and chatbot guidance. The best professional signal is that it connects projects to role fit instead of only listing tools. The main quality dependency is keeping claims current and ensuring backend features are fully applied in Supabase.',
          'Portfolio-Qualitaet: starke visuelle Ausarbeitung, klare Robotikpositionierung, nuetzliche Projektmodals, Bilingualitaet, Resume-Route, Zertifikate und Chatbot-Fuehrung. Das beste professionelle Signal ist, dass Projekte mit Rollen-Fit verbunden werden statt nur Tools zu listen. Wichtig bleibt, Claims aktuell zu halten und Backend-Features in Supabase voll anzuwenden.'),
        actions: [sectionAction(language, 'projects', 'Open Projects', 'Projekte oeffnen')],
      };

    case 'portfolioImprovements':
      return {
        ...common,
        response: t(language,
          'Best improvements: add deeper code artefact links, publish a short thesis/demo video, show one architecture diagram per major project, add measurable outcomes where available, keep the update date current, and confirm Supabase recommendation approval is live. For hiring, the next strongest upgrade would be concise code samples or technical write-ups.',
          'Beste Verbesserungen: tiefere Code-Artefakt-Links, kurzes Thesis/Demo-Video, je Hauptprojekt ein Architekturdiagramm, messbare Outcomes wo vorhanden, Update-Datum aktuell halten und Supabase-Recommendation-Approval live bestaetigen. Fuer Hiring waeren Code Samples oder technische Write-ups der staerkste naechste Schritt.'),
        actions: [sectionAction(language, 'projects', 'Review Projects', 'Projekte pruefen')],
      };

    case 'certifications':
      return {
        ...common,
        response: t(language,
          'Certificates shown include ROS training, Telerobotics, Universal Robots core training, and NDT Level 2. Together they support robot software awareness, remote/interactive robotics concepts, industrial robot practice, and field-level quality discipline.',
          'Gezeigte Zertifikate umfassen ROS Training, Telerobotics, Universal Robots Core Training und NDT Level 2. Zusammen stuetzen sie Robotiksoftware-Verstaendnis, remote/interaktive Robotikkonzepte, Industrieroboterpraxis und feldnahe Qualitaetsdisziplin.'),
        actions: [sectionAction(language, 'education', 'Open Education', 'Ausbildung oeffnen')],
      };

    case 'educationGermany':
      return {
        ...common,
        response: t(language,
          'In Germany, Sooraj studies M.Eng. Mechatronics and Cyber-Physical Systems at Technische Hochschule Deggendorf. This supports robotics, autonomous systems, cyber-physical systems, additive manufacturing, and human-machine interaction.',
          'In Deutschland studiert Sooraj M.Eng. Mechatronics and Cyber-Physical Systems an der Technischen Hochschule Deggendorf. Das stuetzt Robotik, autonome Systeme, cyber-physische Systeme, additive Fertigung und Mensch-Maschine-Interaktion.'),
        actions: [sectionAction(language, 'education', 'Open Education', 'Ausbildung oeffnen')],
      };

    case 'educationIndia':
      return {
        ...common,
        response: t(language,
          'In India, Sooraj completed B.Tech. Mechanical Engineering through APJ Abdul Kalam Technological University. That gives the mechanical foundation behind later robotics, simulation, controls, CAD/CAE, and mechatronics work.',
          'In Indien absolvierte Sooraj B.Tech. Mechanical Engineering ueber die APJ Abdul Kalam Technological University. Das liefert die mechanische Grundlage fuer spaetere Robotik, Simulation, Regelung, CAD/CAE und Mechatronik.'),
        actions: [sectionAction(language, 'education', 'Open Education', 'Ausbildung oeffnen')],
      };

    case 'ndtExperience':
      return {
        ...common,
        response: t(language,
          'NDT experience matters because it shows industrial discipline: inspection procedures, accuracy, safety awareness, technical reporting, and quality mindset. It is not robotics software, but it strengthens the practical engineering judgment behind the Sooraj portfolio.',
          'NDT-Erfahrung ist wichtig, weil sie industrielle Disziplin zeigt: Pruefverfahren, Genauigkeit, Sicherheitsbewusstsein, technisches Reporting und Qualitaetsdenken. Es ist keine Robotiksoftware, staerkt aber das praktische Engineering-Urteil hinter dem Robotikprofil.'),
        actions: [sectionAction(language, 'experience', 'Open Experience', 'Erfahrung oeffnen')],
      };

    case 'coverLetter':
      return {
        ...common,
        response: t(language,
          'Cover-letter angle: present Sooraj as a mechatronics and robotics engineer who connects robot workflow logic, simulation validation, embedded prototypes, and industrial automation context. Emphasize KEBA robotics exposure, ROS autonomy work, and the ability to bridge mechanical constraints with software implementation.',
          'Cover-Letter-Winkel: Sooraj als Mechatronik- und Robotikingenieur darstellen, der Robot-Workflow-Logik, Simulationsvalidierung, Embedded-Prototypen und industriellen Automationskontext verbindet. KEBA-Robotikbezug, ROS-Autonomie und die Bruecke zwischen physischen Constraints und Softwareumsetzung betonen.'),
        actions: [resumeAction(language), emailAction(language)],
      };

    case 'cvBullets':
      return {
        ...common,
        response: t(language,
          'CV bullet examples: Developed a 6-axis robot workflow with waypoint interpolation and robot-program simulation validation. Built ROS-based autonomous navigation flow with SLAM, Gazebo, and RViz validation. Created Arduino service robot prototype using sensor feedback, line tracking, and motor-control logic. Modeled active suspension dynamics in MATLAB/Simulink for response analysis.',
          'CV-Bullet-Beispiele: Entwickelte 6-Achs-Robotikworkflow mit Waypoint-Interpolation und Roboterprogramm-Simulationsvalidierung. Baute ROS-basierte autonome Navigation mit SLAM, Gazebo und RViz-Validierung. Erstellte Arduino-Service-Roboter-Prototyp mit Sensorfeedback, Line Tracking und Motorsteuerung. Modellierte Active-Suspension-Dynamik in MATLAB/Simulink fuer Antwortanalyse.'),
        actions: [resumeAction(language)],
      };

    case 'learningRoadmap':
      return {
        ...common,
        response: t(language,
          'Learning roadmap: deepen ROS 2, C++ robotics patterns, MoveIt or motion planning, perception basics, Linux debugging, testing/CI for robotics code, and one polished public technical write-up. For industrial automation, add PLC/HMI awareness and safety/commissioning vocabulary.',
          'Learning Roadmap: ROS 2 vertiefen, C++-Robotikpatterns, MoveIt oder Motion Planning, Perception-Grundlagen, Linux-Debugging, Testing/CI fuer Robotikcode und ein polierter oeffentlicher Technical Write-up. Fuer Industrieautomation PLC/HMI-Bewusstsein und Safety/Commissioning-Vokabular ergaenzen.'),
        actions: [sectionAction(language, 'skills', 'Open Skills', 'Skills oeffnen')],
      };

    case 'studentGuide':
      return {
        ...common,
        response: t(language,
          'For students, this portfolio is useful because it shows how to connect academic work to proof: every project should answer what problem it solved, what tools were used, what the system architecture was, what result came out, and what would be improved next.',
          'Fuer Studierende ist dieses Portfolio nuetzlich, weil es zeigt, wie akademische Arbeit zu Belegen wird: Jedes Projekt sollte Problem, Tools, Systemarchitektur, Ergebnis und naechste Verbesserung beantworten.'),
        actions: [sectionAction(language, 'projects', 'Open Projects', 'Projekte oeffnen')],
      };

    case 'recruiterGuide':
      return {
        ...common,
        response: t(language,
          'For recruiters, use this order: read the hero for positioning, Experience for industrial context, Projects for proof, Recommendations for trust, Resume Overview for compact details, then Contact. If hiring for robotics, inspect KEBA first; if hiring for software autonomy, inspect ROS first.',
          'Fuer Recruiter: Reihenfolge Hero fuer Positionierung, Erfahrung fuer industriellen Kontext, Projekte fuer Belege, Empfehlungen fuer Vertrauen, Resume Overview fuer kompakte Details, dann Kontakt. Fuer Robotik-Hiring zuerst KEBA pruefen; fuer Software-Autonomie zuerst ROS.'),
        actions: [sectionAction(language, 'experience', 'Open Experience', 'Erfahrung oeffnen'), sectionAction(language, 'recommendations', 'Open Recommendations', 'Empfehlungen oeffnen')],
      };

    case 'aiBasics':
      return {
        ...common,
        response: t(language,
          'AI is software that performs tasks normally associated with human reasoning, perception, language, or decision-making. In robotics, AI can support perception, planning, autonomy, and adaptation. This portfolio is more robotics/simulation focused than AI-model focused, but AI and robotics overlap strongly in autonomous systems.',
          'KI ist Software, die Aufgaben uebernimmt, die sonst mit menschlichem Denken, Wahrnehmung, Sprache oder Entscheidungsfindung verbunden sind. In der Robotik kann KI Perception, Planung, Autonomie und Anpassung unterstuetzen. Dieses Portfolio ist staerker Robotik/Simulation als KI-Modell-fokussiert, aber KI und Robotik ueberlappen stark bei autonomen Systemen.'),
        suggestions: t(language,
          ['What is ROS?', 'What is SLAM?', 'Assess robotics fit'],
          ['Was ist ROS?', 'Was ist SLAM?', 'Robotik-Fit bewerten']),
      };

    case 'controlSystemsBasics':
      return {
        ...common,
        response: t(language,
          'Control systems use feedback to make a system behave as desired. In robotics, controls affect motors, joints, trajectories, stability, and response. Sooraj’s active suspension modeling and mechatronics background support this area, while the robotics projects show how control thinking connects to motion and validation.',
          'Regelungssysteme nutzen Feedback, damit ein System gewuenschtes Verhalten zeigt. In Robotik beeinflusst Regelung Motoren, Gelenke, Trajektorien, Stabilitaet und Antwortverhalten. Soorajs Active-Suspension-Modellierung und Mechatronikbasis stuetzen diesen Bereich; die Robotikprojekte zeigen die Verbindung zu Motion und Validierung.'),
        actions: [sectionAction(language, 'projects', 'Open Projects', 'Projekte oeffnen')],
      };

    case 'sensorBasics':
      return {
        ...common,
        response: t(language,
          'Robotics sensors can include encoders, IMUs, cameras, LiDAR, ultrasonic sensors, force sensors, and line sensors. They help robots understand position, environment, motion, and task state. In Sooraj’s portfolio, sensors are most visible in the ROS autonomy and Arduino service robot contexts.',
          'Robotiksensoren koennen Encoder, IMUs, Kameras, LiDAR, Ultraschall, Kraftsensoren und Linesensoren umfassen. Sie helfen Robotern, Position, Umgebung, Bewegung und Aufgabenstatus zu verstehen. In Soorajs Portfolio sind Sensoren besonders bei ROS-Autonomie und Arduino-Service-Roboter sichtbar.'),
        actions: [sectionAction(language, 'projects', 'Open Projects', 'Projekte oeffnen')],
      };

    case 'digitalTwinBasics':
      return {
        ...common,
        response: t(language,
          'A digital twin is a virtual representation of a physical system used for analysis, simulation, monitoring, or validation. Sooraj’s simulation projects are not presented as full industrial digital twins, but they show the same direction: use virtual models to test behavior before physical deployment.',
          'Ein Digital Twin ist eine virtuelle Darstellung eines physischen Systems fuer Analyse, Simulation, Monitoring oder Validierung. Soorajs Simulationsprojekte sind keine vollstaendigen industriellen Digital Twins, zeigen aber die gleiche Richtung: virtuelle Modelle nutzen, um Verhalten vor physischem Deployment zu testen.'),
        actions: [sectionAction(language, 'projects', 'Open Simulation Projects', 'Simulationsprojekte oeffnen')],
      };

    case 'industryFourBasics':
      return {
        ...common,
        response: t(language,
          'Industry 4.0 means connected, data-aware, automated manufacturing systems. Sooraj’s fit is around robotics workflow, automation logic, simulation validation, and mechatronics, not around enterprise IT alone. KEBA and industrial robotics are the best portfolio links to smart manufacturing.',
          'Industry 4.0 bedeutet vernetzte, datenbewusste und automatisierte Fertigungssysteme. Soorajs Fit liegt bei Robotikworkflow, Automationslogik, Simulationsvalidierung und Mechatronik, nicht nur Enterprise IT. KEBA und Industrierobotik sind die besten Portfolio-Verbindungen zu Smart Manufacturing.'),
        actions: [sectionAction(language, 'experience', 'Open Experience', 'Erfahrung oeffnen')],
      };

    case 'autonomousRobotBasics':
      return {
        ...common,
        response: t(language,
          'An autonomous robot senses its environment, estimates state, plans actions, and executes movement with limited human control. Sooraj’s vacuum robot is the clearest autonomy example because it uses mapping, localization, obstacle-aware navigation, and ROS simulation/visualization tools.',
          'Ein autonomer Roboter nimmt seine Umgebung wahr, schaetzt seinen Zustand, plant Aktionen und fuehrt Bewegungen mit begrenzter menschlicher Kontrolle aus. Soorajs Vakuumroboter ist das klarste Autonomiebeispiel durch Mapping, Lokalisierung, hindernisbewusste Navigation und ROS-Simulations-/Visualisierungstools.'),
        actions: [sectionAction(language, 'projects', 'Open Vacuum Robot Project', 'Vakuumroboter-Projekt oeffnen')],
      };

    case 'industrialRobotBasics':
      return {
        ...common,
        response: t(language,
          'An industrial robot is usually a programmable manipulator used in production tasks such as handling, welding, assembly, inspection, or machine tending. The KEBA project is relevant because it focuses on a 6-axis robot workflow and machine-operation planning rather than only a toy robot example.',
          'Ein Industrieroboter ist meist ein programmierbarer Manipulator fuer Produktionsaufgaben wie Handling, Schweissen, Montage, Inspektion oder Machine Tending. Das KEBA-Projekt ist relevant, weil es einen 6-Achs-Roboter-Workflow und Maschinenbedienungsplanung fokussiert, nicht nur ein Toy-Robot-Beispiel.'),
        actions: [sectionAction(language, 'projects', 'Open KEBA Project', 'KEBA-Projekt oeffnen')],
      };

    case 'serviceRobotBasics':
      return {
        ...common,
        response: t(language,
          'A service robot performs useful tasks for people or environments outside classic industrial robot cells. Sooraj’s service robot is an Arduino-based prototype, valuable because it shows embedded behavior, sensing, line tracking, and physical validation.',
          'Ein Service-Roboter erfuellt nuetzliche Aufgaben fuer Menschen oder Umgebungen ausserhalb klassischer Industrieroboterzellen. Soorajs Service-Roboter ist ein Arduino-Prototyp, wertvoll durch Embedded-Verhalten, Sensorik, Line Tracking und physische Validierung.'),
        actions: [sectionAction(language, 'projects', 'Open Service Robot Project', 'Service-Roboter-Projekt oeffnen')],
      };

    case 'hmiBasics':
      return {
        ...common,
        response: t(language,
          'HMI means Human-Machine Interface: the screen, controls, or interaction layer operators use to run a machine. It matters in automation because good engineering is not only robot motion; operators need clear status, commands, feedback, and safe control paths.',
          'HMI bedeutet Human-Machine Interface: Bildschirm, Bedienelemente oder Interaktionsschicht, ueber die Bediener eine Maschine steuern. In Automation ist das wichtig, weil gutes Engineering nicht nur Robotermotion ist; Operatoren brauchen klaren Status, Befehle, Feedback und sichere Steuerwege.'),
        suggestions: t(language,
          ['Explain industrial automation', 'Explain KEBA workflow', 'Assess automation fit'],
          ['Industrieautomation erklaeren', 'KEBA Workflow erklaeren', 'Automation-Fit bewerten']),
      };

    case 'websocketsBasics':
      return {
        ...common,
        response: t(language,
          'WebSockets allow real-time two-way communication between software components. In robotics or automation tools, that can be useful for live status, commands, telemetry, or dashboard updates. In the portfolio, WebSockets appear as part of the KEBA/workflow tooling context.',
          'WebSockets ermoeglichen Echtzeit-Kommunikation in beide Richtungen zwischen Softwarekomponenten. In Robotik- oder Automationstools ist das nuetzlich fuer Live-Status, Befehle, Telemetrie oder Dashboard-Updates. Im Portfolio erscheinen WebSockets im KEBA/Workflow-Tooling-Kontext.'),
        actions: [sectionAction(language, 'skills', 'Open Skills', 'Skills oeffnen')],
      };

    case 'robotProgramSimulationBasics':
      return {
        ...common,
        response: t(language,
          'Robot-program simulation is important when generated robot waypoints need to be inspected, replayed, validated, or reviewed before industrial execution. In the KEBA project, the simulation workflow connects planning logic with drag&bot validation and robot-program review.',
          'Roboterprogramm-Simulation ist wichtig, wenn generierte Roboter-Waypoints vor industrieller Ausfuehrung geprueft, wiederholt, validiert oder bewertet werden sollen. Im KEBA-Projekt verbindet der Simulationsworkflow Planning-Logik mit drag&bot-Validierung und Roboterprogramm-Review.'),
        actions: [sectionAction(language, 'projects', 'Open KEBA Project', 'KEBA-Projekt oeffnen')],
      };

    case 'professionalPitch':
      return {
        ...common,
        response: t(language,
          'Elevator pitch: Sooraj Sudhakaran is a robotics and automation engineer in Stuttgart who combines mechatronics, ROS autonomy, industrial robot workflow planning, embedded prototypes, and simulation validation. His strongest signal is the ability to connect physical engineering constraints with practical software and automation workflows.',
          'Elevator Pitch: Sooraj Sudhakaran ist ein Robotik- und Automationsingenieur in Stuttgart, der Mechatronik, ROS-Autonomie, Industrieroboter-Workflowplanung, Embedded-Prototypen und Simulationsvalidierung verbindet. Sein staerkstes Signal ist die Verbindung physischer Engineering-Constraints mit praktischer Software und Automationsworkflows.'),
        actions: [resumeAction(language), sectionAction(language, 'contact', 'Contact Sooraj', 'Sooraj kontaktieren')],
      };

    case 'longProfile':
      return {
        ...common,
        response: t(language,
          'Detailed profile: Sooraj’s portfolio presents a mechatronics-to-robotics path. He has a mechanical engineering base from India, is studying mechatronics and cyber-physical systems in Germany, and is building a profile around industrial robotics, ROS autonomy, simulation, embedded systems, and automation workflows. KEBA is the flagship industrial robotics signal; ROS vacuum robot shows autonomy; Arduino service robot shows physical embedded behavior; Unity/VR and MATLAB/Simulink show simulation range.',
          'Detailprofil: Soorajs Portfolio zeigt einen Weg von Mechatronik zu Robotik. Er hat eine Maschinenbaubasis aus Indien, studiert Mechatronics and Cyber-Physical Systems in Deutschland und baut ein Profil rund um Industrierobotik, ROS-Autonomie, Simulation, Embedded Systems und Automationsworkflows. KEBA ist das Flagship-Signal fuer Industrierobotik; ROS-Vakuumroboter zeigt Autonomie; Arduino-Service-Roboter zeigt physisches Embedded-Verhalten; Unity/VR und MATLAB/Simulink zeigen Simulationsbreite.'),
        actions: [sectionAction(language, 'about', 'Open About', 'About oeffnen'), sectionAction(language, 'projects', 'Open Projects', 'Projekte oeffnen')],
      };

    case 'contactMessage':
      return {
        ...common,
        response: t(language,
          `Suggested message: Hello Sooraj, I reviewed your robotics portfolio and would like to discuss a potential opportunity related to robotics, automation, or simulation engineering. The most relevant parts for us are your KEBA robotics workflow, ROS project, and mechatronics background. Could we schedule a short conversation?`,
          `Vorschlag: Hallo Sooraj, ich habe Ihr Robotikportfolio angesehen und moechte eine moegliche Gelegenheit im Bereich Robotik, Automation oder Simulation Engineering besprechen. Fuer uns sind besonders Ihr KEBA-Robotikworkflow, das ROS-Projekt und Ihr Mechatronikhintergrund relevant. Koennen wir ein kurzes Gespraech vereinbaren?`),
        actions: [emailAction(language), linkedinAction(language)],
      };

    case 'referenceMeaning':
      return {
        ...common,
        response: t(language,
          'A verified recommendation is a trust signal from someone connected to real work or study context. In this portfolio, recommendations should only become public after Sooraj verifies the identity/context and approves display. That prevents random or unverified praise from weakening the professional signal.',
          'Eine verifizierte Empfehlung ist ein Vertrauenssignal von jemandem mit echtem Arbeits- oder Studienkontext. In diesem Portfolio sollten Empfehlungen erst oeffentlich erscheinen, wenn Sooraj Identitaet/Kontext prueft und die Anzeige freigibt. Das verhindert, dass zufaelliges oder unverifiziertes Lob das professionelle Signal schwaecht.'),
        actions: [sectionAction(language, 'recommendations', 'Open Recommendations', 'Empfehlungen oeffnen')],
      };

    case 'outOfScope':
      return {
        ...common,
        response: t(language,
          'I am not a general live internet assistant. I do not fetch current weather, news, stocks, sports, or private data. I am best used for the Sooraj portfolio: projects, skills, resume, recommendations, privacy, and contact routes.',
          'Ich bin kein allgemeiner Live-Internet-Assistent. Ich rufe kein aktuelles Wetter, News, Aktien, Sport oder private Daten ab. Am besten bin ich fuer dieses Portfolio: Soorajs Robotikprofil, Projekte, Skills, Lebenslauf, Empfehlungen, Datenschutz und Kontaktwege.'),
        suggestions: defaultSuggestions(language),
      };

    case 'websiteUpdated':
      return {
        ...common,
        response: t(language,
          `The portfolio data marks the website update time as ${new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(personal.websiteUpdatedAt))}.`,
          `Die Portfolio-Daten markieren die Website-Aktualisierung als ${new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(personal.websiteUpdatedAt))}.`),
      };

    default:
      return {
        ...common,
        response: t(language,
          'I found a related portfolio question, but this website does not have a dedicated detailed answer for that exact topic yet. The safest path is to review the public sections or contact Sooraj directly.',
          'Ich habe eine verwandte Portfolio-Frage gefunden, aber diese Website hat fuer genau dieses Thema noch keine eigene Detailantwort. Am sichersten ist die oeffentliche Sektion oder direkter Kontakt mit Sooraj.'),
        actions: [sectionAction(language, 'projects', 'Open Projects', 'Projekte oeffnen'), emailAction(language)],
      };
  }
};

export const findHelpBotAnswer = async (input = '', language = 'en', options = {}) => {
  const directTopic = directAnswerTopic(input);
  if (directTopic === 'moderation') return moderationAnswer(language);
  if (directTopic === 'confidential') {
    const answer = topicAnswer(directTopic, language, input);
    return {
      ...answer,
      suggestions: answer.suggestions || defaultSuggestions(language),
      actions: answer.actions || [],
      match: {
        intentId: 'direct-confidential',
        score: 100,
        topic: directTopic,
      },
    };
  }
  if (directTopic === 'timeGreeting' || directTopic === 'profile') {
    const answer = topicAnswer(directTopic, language, input);
    return {
      ...answer,
      suggestions: answer.suggestions || defaultSuggestions(language),
      actions: answer.actions || [],
      match: {
        intentId: `direct-${directTopic}`,
        score: 100,
        topic: directTopic,
      },
    };
  }

  const casualMatch = findCasualChatEntry(input);
  if (casualMatch) return casualChatAnswer(casualMatch, language);

  if (directTopic) {
    const answer = topicAnswer(directTopic, language, input);
    return {
      ...answer,
      suggestions: answer.suggestions || defaultSuggestions(language),
      actions: answer.actions || [],
      match: {
        intentId: `direct-${directTopic}`,
        score: 100,
        topic: directTopic,
      },
    };
  }

  const matched = await findMatchingIntent(input);

  if (!options.skipConfirmation && (!matched || matched.score < DIRECT_MATCH_SCORE)) {
    const fuzzyMatch = await findFuzzyConfirmationMatch(input);
    if (fuzzyMatch) return spellingConfirmationAnswer(language, fuzzyMatch, input);
  }

  if (!matched || matched.score < DIRECT_MATCH_SCORE) {
    return noMatchAnswer(language);
  }

  const intentId = String(matched.intent.id || '').trim();
  const topic = topicByIntentId[intentId] || 'default';
  const answer = topicAnswer(topic, language, input);

  return {
    ...answer,
    suggestions: answer.suggestions || defaultSuggestions(language),
    actions: answer.actions || [],
    match: {
      intentId,
      score: Math.round(matched.score),
      topic,
    },
  };
};

export const buildInitialHelpBotMessage = (language = 'en') => ({
  from: 'assistant',
  text: t(language,
    'Hi, I am Portfolio Assistant. I can answer portfolio and engineering questions about Sooraj, role fit, recruiter screening, interview planning, KEBA workflow, ROS, SLAM, simulation, embedded systems, CV wording, recommendations, privacy, and contact.',
    'Hallo, ich bin Portfolio Assistant. Ich beantworte Portfolio- und Engineering-Fragen zu Sooraj, Rollen-Fit, Recruiter-Screening, Interviewplanung, KEBA Workflow, ROS, SLAM, Simulation, Embedded Systems, CV-Texten, Empfehlungen, Datenschutz und Kontakt.'),
  suggestions: defaultSuggestions(language),
});
