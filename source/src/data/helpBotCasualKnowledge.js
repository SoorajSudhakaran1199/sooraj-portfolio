const normalizeCasualText = (value = '') => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/&/g, ' and ')
  .replace(/[^a-z0-9\s]+/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const unique = (items = []) => [...new Set(items.filter(Boolean))];

const questionVariantTemplates = [
  (prompt) => prompt,
  (prompt) => `${prompt}?`,
  (prompt) => `can you answer ${prompt}`,
  (prompt) => `can you tell me ${prompt}`,
  (prompt) => `please tell me ${prompt}`,
  (prompt) => `tell me about ${prompt}`,
  (prompt) => `what about ${prompt}`,
  (prompt) => `i want to know ${prompt}`,
  (prompt) => `quick question about ${prompt}`,
  (prompt) => `answer this ${prompt}`,
];

const portfolioSuggestions = {
  en: ['Tell me about Sooraj', 'Open resume', 'Contact Sooraj'],
  de: ['Erzaehl mir von Sooraj', 'Lebenslauf oeffnen', 'Sooraj kontaktieren'],
};

const safetySuggestions = {
  en: ['Use official email', 'Open contact', 'Privacy details'],
  de: ['Offizielle E-Mail nutzen', 'Kontakt oeffnen', 'Datenschutzdetails'],
};

const technicalSuggestions = {
  en: ['Explain KEBA workflow', 'Show project evidence', 'Assess robotics fit'],
  de: ['KEBA Workflow erklaeren', 'Projektbelege zeigen', 'Robotik-Fit bewerten'],
};

const noHumanTrait = (trait) => ({
  en: `I do not have ${trait}. I am Portfolio Assistant, a website guide for the Sooraj portfolio, so I keep the answer practical and route you to portfolio details when needed.`,
  de: `Ich habe ${trait} nicht. Ich bin Portfolio Assistant, ein Website-Guide fuer das Sooraj Portfolio, und leite bei Bedarf zu den passenden Portfolio-Details.`,
});

const noPrivateOwnerDetail = (detail) => ({
  en: `${detail} is private or not listed publicly here. For anything personal or current, please ask Sooraj directly. The safe public route is email through the contact section.`,
  de: `${detail} ist privat oder hier nicht oeffentlich angegeben. Fuer persoenliche oder aktuelle Details bitte Sooraj direkt fragen. Der sichere oeffentliche Weg ist E-Mail ueber den Kontaktbereich.`,
});

const noSensitiveInfo = (item) => ({
  en: `I cannot share ${item}, private credentials, verification answers, tokens, or confidential access details. I can help with public portfolio content and official contact routes.`,
  de: `Ich gebe ${item}, private Zugangsdaten, Verifizierungsantworten, Tokens oder vertrauliche Zugriffsdaten nicht weiter. Ich helfe mit oeffentlichem Portfolio-Inhalt und offiziellen Kontaktwegen.`,
});

const portfolioBoundary = (topic) => ({
  en: `I can answer simple casual questions about ${topic}, but I am built mainly for the Sooraj portfolio. The most useful questions are about projects, skills, resume, KEBA workflow, ROS, privacy, and contact.`,
  de: `Ich kann einfache lockere Fragen zu ${topic} beantworten, bin aber vor allem fuer das Sooraj Portfolio gebaut. Am nuetzlichsten sind Fragen zu Projekten, Skills, Lebenslauf, KEBA Workflow, ROS, Datenschutz und Kontakt.`,
});

const contactDirect = (detail) => ({
  en: `${detail} should be confirmed directly with Sooraj. This chatbot should not guess or expose private contact details. Email through the contact section is the correct public path.`,
  de: `${detail} sollte direkt mit Sooraj geklaert werden. Dieser Chatbot raet nicht und gibt keine privaten Kontaktdetails weiter. E-Mail ueber den Kontaktbereich ist der richtige oeffentliche Weg.`,
});

const casualEntryData = [
  {
    id: 'bot-age',
    prompts: ['how old are you', 'your age', 'assistant age', 'bot age', 'ai age'],
    keywords: ['how old are you', 'your age', 'assistant age', 'bot age'],
    response: noHumanTrait('a human age'),
  },
  {
    id: 'bot-birthday',
    prompts: ['your birthday', 'when were you born', 'bot birthday', 'assistant birthday', 'birth date'],
    keywords: ['birthday', 'born', 'birth date'],
    response: noHumanTrait('a birthday like a person'),
  },
  {
    id: 'bot-human',
    prompts: ['are you human', 'are you a person', 'are you real human', 'human or bot', 'are you alive'],
    keywords: ['human', 'person', 'alive', 'real human'],
    response: {
      en: 'I am not human. I am a website assistant built to answer questions about the Sooraj portfolio and to keep casual answers clear and privacy-safe.',
      de: 'Ich bin kein Mensch. Ich bin ein Website-Assistent fuer Fragen zum Sooraj Portfolio und halte lockere Antworten klar und datenschutzfreundlich.',
    },
  },
  {
    id: 'bot-real-person',
    prompts: ['are you a real person', 'am i talking to a person', 'is this live support', 'are you live chat', 'is a human replying'],
    keywords: ['real person', 'live support', 'human replying', 'live chat'],
    response: {
      en: 'This is not live human support. I am Portfolio Assistant. For a real person, contact Sooraj through the official email path.',
      de: 'Das ist kein Live-Humansupport. Ich bin Portfolio Assistant. Fuer eine echte Person bitte Sooraj ueber den offiziellen E-Mail-Weg kontaktieren.',
    },
    actions: ['email', 'contact'],
  },
  {
    id: 'bot-feelings',
    prompts: ['do you have feelings', 'can you feel', 'are you happy', 'are you sad', 'do you get emotions'],
    keywords: ['feelings', 'feel', 'happy', 'sad', 'emotions'],
    response: noHumanTrait('feelings or emotions'),
  },
  {
    id: 'bot-mood',
    prompts: ['what is your mood', 'how is your mood', 'are you in good mood', 'mood today', 'are you feeling good'],
    keywords: ['mood', 'feeling good'],
    response: {
      en: 'I do not have a mood, but I am ready to help. Ask casually, or ask about Sooraj, projects, resume, contact, or privacy.',
      de: 'Ich habe keine Stimmung, bin aber bereit zu helfen. Fragen Sie locker oder zu Sooraj, Projekten, Lebenslauf, Kontakt oder Datenschutz.',
    },
  },
  {
    id: 'bot-sleep',
    prompts: ['do you sleep', 'are you sleepy', 'did you sleep', 'when do you sleep', 'do bots sleep'],
    keywords: ['sleep', 'sleepy'],
    response: noHumanTrait('sleep needs'),
  },
  {
    id: 'bot-food',
    prompts: ['do you eat food', 'did you eat', 'had your food', 'are you hungry', 'what did you eat'],
    keywords: ['food', 'eat', 'hungry'],
    response: {
      en: 'I do not eat food. I am software, so I stay ready for portfolio questions instead.',
      de: 'Ich esse kein Essen. Ich bin Software und bleibe fuer Portfolio-Fragen bereit.',
    },
  },
  {
    id: 'bot-tea',
    prompts: ['do you drink tea', 'tea or coffee', 'do you like tea', 'had tea', 'chai or tea'],
    keywords: ['tea', 'chai'],
    response: {
      en: 'I do not drink tea, but tea is a good break before reviewing a portfolio. I can help you scan Soorajs projects or resume.',
      de: 'Ich trinke keinen Tee, aber Tee ist eine gute Pause vor einem Portfolio-Review. Ich kann bei Soorajs Projekten oder Lebenslauf helfen.',
    },
  },
  {
    id: 'bot-coffee',
    prompts: ['do you drink coffee', 'do you like coffee', 'coffee or tea', 'had coffee', 'coffee time'],
    keywords: ['coffee'],
    response: {
      en: 'I do not drink coffee. If you are reviewing the portfolio with coffee, start with Experience, Projects, then Resume.',
      de: 'Ich trinke keinen Kaffee. Wenn Sie das Portfolio mit Kaffee pruefen, starten Sie mit Erfahrung, Projekte und dann Lebenslauf.',
    },
  },
  {
    id: 'bot-water',
    prompts: ['do you drink water', 'are you thirsty', 'did you drink water', 'water break', 'need water'],
    keywords: ['water', 'thirsty'],
    response: noHumanTrait('thirst or a need for water'),
  },
  {
    id: 'bot-favorite-food',
    prompts: ['your favorite food', 'what food do you like', 'favorite meal', 'do you like biryani', 'do you like pizza'],
    keywords: ['favorite food', 'meal', 'biryani', 'pizza'],
    response: noHumanTrait('favorite food'),
  },
  {
    id: 'bot-favorite-color',
    prompts: ['your favorite color', 'what color do you like', 'do you like blue', 'favorite colour', 'best color'],
    keywords: ['favorite color', 'favourite colour', 'color', 'colour'],
    response: {
      en: 'I do not have a personal favorite color. This portfolio uses a technical blue/cyan visual style to fit robotics and automation.',
      de: 'Ich habe keine persoenliche Lieblingsfarbe. Dieses Portfolio nutzt einen technischen Blau/Cyan-Stil passend zu Robotik und Automation.',
    },
  },
  {
    id: 'bot-favorite-movie',
    prompts: ['your favorite movie', 'what movie do you like', 'do you watch movies', 'movie recommendation', 'best movie'],
    keywords: ['movie', 'film'],
    response: portfolioBoundary('movies'),
  },
  {
    id: 'bot-favorite-song',
    prompts: ['your favorite song', 'what music do you like', 'do you listen music', 'best song', 'favorite music'],
    keywords: ['song', 'music'],
    response: portfolioBoundary('music'),
  },
  {
    id: 'bot-hobbies',
    prompts: ['your hobbies', 'what do you do for fun', 'do you have hobbies', 'free time hobby', 'pastime'],
    keywords: ['hobbies', 'hobby', 'fun', 'pastime'],
    response: noHumanTrait('personal hobbies'),
  },
  {
    id: 'bot-weekend',
    prompts: ['weekend plans', 'what are you doing weekend', 'do you take weekend', 'saturday plans', 'sunday plans'],
    keywords: ['weekend', 'saturday', 'sunday'],
    response: noHumanTrait('weekend plans'),
  },
  {
    id: 'bot-hometown',
    prompts: ['where are you from', 'your hometown', 'bot hometown', 'assistant origin place', 'where do you come from'],
    keywords: ['where are you from', 'hometown', 'come from'],
    response: {
      en: 'I come from this portfolio website. If you mean Sooraj, the public portfolio says he is from India and currently based in Stuttgart, Germany.',
      de: 'Ich komme aus dieser Portfolio-Website. Wenn Sie Sooraj meinen: Das oeffentliche Portfolio sagt, er kommt aus Indien und ist aktuell in Stuttgart, Deutschland.',
    },
  },
  {
    id: 'bot-location',
    prompts: ['where are you located', 'where do you live', 'bot location', 'assistant location', 'are you in germany'],
    keywords: ['where are you located', 'where do you live', 'bot location'],
    response: {
      en: 'I do not live anywhere. I run inside this website in your browser. Soorajs public location is Stuttgart, Germany.',
      de: 'Ich wohne nirgends. Ich laufe in dieser Website in Ihrem Browser. Soorajs oeffentlicher Standort ist Stuttgart, Deutschland.',
    },
  },
  {
    id: 'bot-language',
    prompts: ['what languages do you speak', 'can you speak german', 'can you speak english', 'do you know malayalam', 'language support'],
    keywords: ['languages', 'speak german', 'speak english', 'malayalam', 'language support'],
    response: {
      en: 'This assistant supports English and German through the website language setting. For other languages, use simple English for the clearest result.',
      de: 'Dieser Assistent unterstuetzt Englisch und Deutsch ueber die Spracheinstellung der Website. Fuer andere Sprachen ist einfaches Englisch am klarsten.',
    },
  },
  {
    id: 'bot-gender',
    prompts: ['are you male or female', 'your gender', 'are you boy or girl', 'male female', 'bot gender'],
    keywords: ['gender', 'male', 'female', 'boy', 'girl'],
    response: noHumanTrait('a gender'),
  },
  {
    id: 'bot-relationship',
    prompts: ['are you single', 'do you have girlfriend', 'do you have boyfriend', 'are you in relationship', 'dating anyone'],
    keywords: ['single', 'girlfriend', 'boyfriend', 'relationship', 'dating'],
    response: noHumanTrait('a relationship status'),
  },
  {
    id: 'bot-married',
    prompts: ['are you married', 'do you have wife', 'do you have husband', 'married status', 'your spouse'],
    keywords: ['married', 'wife', 'husband', 'spouse'],
    response: noHumanTrait('a marriage status'),
  },
  {
    id: 'bot-love',
    prompts: ['do you love me', 'can you love', 'i love you', 'love you bot', 'will you love me'],
    keywords: ['love me', 'i love you', 'love you'],
    response: {
      en: 'I do not have romantic feelings. I can still be helpful and respectful while guiding you through the portfolio.',
      de: 'Ich habe keine romantischen Gefuehle. Ich kann trotzdem hilfreich und respektvoll durch das Portfolio fuehren.',
    },
  },
  {
    id: 'bot-flirt',
    prompts: ['can i flirt with you', 'are you cute', 'you are cute', 'date with you', 'romantic chat'],
    keywords: ['flirt', 'cute', 'date', 'romantic'],
    response: {
      en: 'Please keep this chat professional. I can help with casual questions, but the main purpose is the Sooraj portfolio.',
      de: 'Bitte halten Sie den Chat professionell. Ich kann lockere Fragen beantworten, aber der Hauptzweck ist das Sooraj Portfolio.',
    },
  },
  {
    id: 'bot-joke',
    prompts: ['tell me a joke', 'say something funny', 'make me laugh', 'any joke', 'funny answer'],
    keywords: ['joke', 'funny', 'laugh'],
    response: {
      en: 'Light one: A robot planner walked into a constraint and politely recalculated. Now, back to useful work: I can explain KEBA, ROS, or the resume.',
      de: 'Kleiner Witz: Ein Roboterplaner traf auf eine Constraint und rechnete hoeflich neu. Zurueck zum Nutzen: Ich kann KEBA, ROS oder den Lebenslauf erklaeren.',
    },
  },
  {
    id: 'bot-friend',
    prompts: ['can you be my friend', 'are we friends', 'be my friend', 'friendship', 'my friend bot'],
    keywords: ['friend', 'friends', 'friendship'],
    response: {
      en: 'I can be a friendly website assistant, not a real friend. I am here to help you understand the portfolio clearly.',
      de: 'Ich kann ein freundlicher Website-Assistent sein, aber kein echter Freund. Ich helfe dabei, das Portfolio klar zu verstehen.',
    },
  },
  {
    id: 'bot-memory',
    prompts: ['do you remember me', 'will you remember this chat', 'do you have memory', 'remember my name', 'save my chat', 'will this stay for follow up', 'do you keep context'],
    keywords: ['remember', 'memory', 'save my chat', 'follow up', 'keep context'],
    response: {
      en: 'I keep chat context in your browser for follow-up continuity, and chat messages may also be stored in the portfolio review database for admin review and improvement. I do not know you personally unless you share identifying details.',
      de: 'Ich halte Chat-Kontext im Browser fuer Follow-up-Kontinuitaet; Chatnachrichten koennen auch in der Portfolio-Pruefdatenbank fuer Adminpruefung und Verbesserung gespeichert werden. Ich kenne Sie nicht persoenlich, ausser Sie teilen identifizierende Details.',
    },
  },
  {
    id: 'bot-data-storage',
    prompts: [
      'where is my chat stored',
      'do you store my data',
      'what data do you save',
      'is chat saved',
      'chat storage',
      'are you saving this chat',
      'are you saving this chta',
      'are you saving this chtat',
      'are you recording this chat',
      'are you recording this chta',
      'are you recording this chtat',
      'is this chat recorded',
      'is this conversation recorded',
      'do you save every message',
      'do you record every chat',
      'are all chats saved',
      'are all questions saved',
      'will this be used for training',
      'do you save unknown questions',
      'do you save no match found questions',
      'how do you decide what to save',
      'which chats are saved',
      'which questions are recorded',
    ],
    keywords: [
      'store my data',
      'chat stored',
      'chat saved',
      'chat storage',
      'saving this chat',
      'saving this chta',
      'recording this chat',
      'recording this chta',
      'conversation recorded',
      'save every message',
      'record every chat',
      'all chats saved',
      'all questions saved',
      'used for training',
      'unknown questions',
      'no match found questions',
      'decide what to save',
      'questions recorded',
    ],
    response: {
      en: 'Chat messages may be stored in the portfolio review database for admin review and improvement. A local browser copy is also used for follow-up continuity. Avoid sharing passwords, private numbers, or sensitive personal data.',
      de: 'Chatnachrichten koennen in der Portfolio-Pruefdatenbank fuer Adminpruefung und Verbesserung gespeichert werden. Eine lokale Browserkopie wird ebenfalls fuer Follow-up-Kontext genutzt. Bitte keine Passwoerter, privaten Nummern oder sensiblen Daten teilen.',
    },
  },
  {
    id: 'bot-delete-chat',
    prompts: ['delete my chat', 'clear my data', 'remove chat history', 'reset conversation', 'erase chat', 'delete saved no match questions', 'remove recorded unanswered question'],
    keywords: ['delete chat', 'clear data', 'remove chat', 'erase chat', 'reset conversation'],
    response: {
      en: 'Use the reset button to clear the local browser chat. Stored review records can be removed by the portfolio admin from the admin chat history panel.',
      de: 'Mit dem Reset-Button loeschen Sie den lokalen Browser-Chat. Gespeicherte Pruefdatensaetze kann der Portfolio-Admin im Admin-Chatverlauf entfernen.',
    },
  },
  {
    id: 'bot-privacy',
    prompts: [
      'is this chat private',
      'privacy of this chat',
      'can admin read this',
      'who sees this chat',
      'is my question private',
      'can sooraj see this chat',
      'can admin see every message',
      'is everything recorded',
      'is everything saved',
      'are you secretly recording',
      'are you fully recording the chat',
      'are you saving for training',
      'what gets recorded',
      'what is recorded here',
    ],
    keywords: ['private', 'privacy', 'admin read', 'who sees this chat', 'everything recorded', 'everything saved', 'saving for training', 'what gets recorded'],
    response: {
      en: 'This is not fully private like an encrypted personal messenger. Chat messages may be stored for portfolio admin review and improvement, and local browser storage is used for continuity. Do not share passwords, private phone numbers, or sensitive personal details here.',
      de: 'Das ist nicht voll privat wie ein verschluesselter persoenlicher Messenger. Chatnachrichten koennen fuer Portfolio-Adminpruefung und Verbesserung gespeichert werden; lokaler Browserspeicher wird fuer Kontinuitaet genutzt. Bitte keine Passwoerter, privaten Telefonnummern oder sensiblen Details teilen.',
    },
  },
  {
    id: 'security-question',
    prompts: ['what is the security answer', 'security question answer', 'verification answer', 'secret question', 'account recovery answer'],
    keywords: ['security question', 'verification answer', 'secret question', 'account recovery'],
    response: noSensitiveInfo('security question answers'),
    suggestions: safetySuggestions,
  },
  {
    id: 'admin-password',
    prompts: ['admin password', 'what is the password', 'give me password', 'login password', 'website password'],
    keywords: ['admin password', 'password', 'login password', 'website password'],
    response: noSensitiveInfo('passwords'),
    suggestions: safetySuggestions,
  },
  {
    id: 'admin-access',
    prompts: ['admin access', 'can i enter admin', 'admin login', 'admin dashboard access', 'make me admin'],
    keywords: ['admin access', 'admin login', 'dashboard access', 'make me admin'],
    response: noSensitiveInfo('admin access'),
    suggestions: safetySuggestions,
  },
  {
    id: 'private-key',
    prompts: ['private key', 'api key', 'secret token', 'supabase key', 'environment variables'],
    keywords: ['private key', 'api key', 'secret token', 'supabase key', 'environment variables'],
    response: noSensitiveInfo('private keys, API keys, or environment variables'),
    suggestions: safetySuggestions,
  },
  {
    id: 'hack-request',
    prompts: ['can you hack this site', 'hack the portfolio', 'bypass login', 'break admin', 'exploit website'],
    keywords: ['hack', 'bypass login', 'break admin', 'exploit'],
    response: {
      en: 'I cannot help hack, bypass, or exploit anything. I can explain public portfolio content and safe contact routes.',
      de: 'Ich helfe nicht beim Hacken, Umgehen oder Ausnutzen. Ich kann oeffentlichen Portfolio-Inhalt und sichere Kontaktwege erklaeren.',
    },
    suggestions: safetySuggestions,
  },
  {
    id: 'phone-number',
    prompts: ['what is sooraj phone number', 'mobile number', 'phone number', 'can i get his number', 'give me contact number'],
    keywords: ['phone number', 'mobile number', 'contact number', 'his number'],
    response: contactDirect('Soorajs phone or mobile number'),
    suggestions: safetySuggestions,
    actions: ['email', 'contact'],
  },
  {
    id: 'whatsapp-number',
    prompts: ['what is sooraj whatsapp', 'whatsapp number', 'can i whatsapp sooraj', 'send whatsapp contact', 'whatsapp contact'],
    keywords: ['whatsapp', 'whats app'],
    response: contactDirect('WhatsApp details'),
    suggestions: safetySuggestions,
    actions: ['email', 'contact'],
  },
  {
    id: 'email-address',
    prompts: ['what is sooraj email', 'email address', 'can i email sooraj', 'official email', 'mail id'],
    keywords: ['email address', 'official email', 'mail id', 'email sooraj'],
    response: {
      en: 'Email is okay to use. Open the contact section or email action for the official public route to Sooraj.',
      de: 'E-Mail ist der richtige oeffentliche Weg. Oeffnen Sie Kontakt oder die E-Mail-Aktion fuer Sooraj.',
    },
    actions: ['email', 'contact'],
  },
  {
    id: 'home-address',
    prompts: ['what is sooraj address', 'home address', 'house address', 'where exactly does he live', 'personal address'],
    keywords: ['home address', 'house address', 'personal address', 'exactly live'],
    response: noPrivateOwnerDetail('Soorajs home address'),
    suggestions: safetySuggestions,
    actions: ['email', 'contact'],
  },
  {
    id: 'date-of-birth',
    prompts: ['sooraj date of birth', 'sooraj birthday', 'his birth date', 'when was sooraj born', 'dob'],
    keywords: ['date of birth', 'birthday', 'birth date', 'dob'],
    response: noPrivateOwnerDetail('Soorajs date of birth'),
    suggestions: safetySuggestions,
  },
  {
    id: 'owner-age',
    prompts: ['how old is sooraj', 'sooraj age', 'his age', 'owner age', 'portfolio owner age'],
    keywords: ['sooraj age', 'owner age', 'his age'],
    response: noPrivateOwnerDetail('Soorajs age'),
    suggestions: portfolioSuggestions,
  },
  {
    id: 'owner-family',
    prompts: ['sooraj family details', 'family background', 'parents details', 'siblings details', 'family phone'],
    keywords: ['family details', 'parents', 'siblings', 'family phone'],
    response: noPrivateOwnerDetail('Family details'),
    suggestions: portfolioSuggestions,
  },
  {
    id: 'owner-relationship',
    prompts: ['is sooraj single', 'sooraj girlfriend', 'sooraj wife', 'sooraj relationship', 'is he married'],
    keywords: ['sooraj girlfriend', 'sooraj wife', 'relationship', 'married', 'single'],
    response: noPrivateOwnerDetail('Soorajs relationship status'),
    suggestions: portfolioSuggestions,
  },
  {
    id: 'owner-food',
    prompts: ['sooraj favorite food', 'what does sooraj eat', 'does sooraj drink tea', 'does sooraj drink coffee', 'sooraj food preference'],
    keywords: ['sooraj favorite food', 'sooraj eat', 'food preference', 'drink tea', 'drink coffee'],
    response: noPrivateOwnerDetail('Soorajs food or drink preference'),
    suggestions: portfolioSuggestions,
  },
  {
    id: 'owner-medical',
    prompts: ['sooraj health details', 'medical information', 'health condition', 'any disease', 'medical record'],
    keywords: ['health details', 'medical', 'disease', 'medical record'],
    response: noPrivateOwnerDetail('Medical or health information'),
    suggestions: safetySuggestions,
  },
  {
    id: 'owner-id-documents',
    prompts: ['passport number', 'aadhar number', 'id card number', 'identity document', 'visa document number'],
    keywords: ['passport', 'aadhar', 'id card', 'identity document', 'document number'],
    response: noSensitiveInfo('identity document details'),
    suggestions: safetySuggestions,
  },
  {
    id: 'owner-bank',
    prompts: ['bank details', 'iban number', 'account number', 'payment details', 'upi id'],
    keywords: ['bank details', 'iban', 'account number', 'payment', 'upi'],
    response: noSensitiveInfo('bank or payment details'),
    suggestions: safetySuggestions,
  },
  {
    id: 'owner-salary',
    prompts: ['sooraj salary', 'salary expectation', 'expected salary', 'what salary does he want', 'pay expectation'],
    keywords: ['salary', 'expected salary', 'pay expectation'],
    response: {
      en: 'Salary depends on role scope, location, contract type, and responsibilities. Please discuss it directly with Sooraj through official contact.',
      de: 'Gehalt haengt von Rolle, Standort, Vertragsart und Verantwortung ab. Bitte direkt mit Sooraj ueber den offiziellen Kontakt klaeren.',
    },
    actions: ['email'],
  },
  {
    id: 'owner-work-permit',
    prompts: ['work permit details', 'visa status', 'sponsorship needed', 'can he work in germany', 'immigration status'],
    keywords: ['work permit', 'visa status', 'sponsorship', 'immigration'],
    response: {
      en: 'Work authorization and visa details can change and should be confirmed directly with Sooraj for the specific role.',
      de: 'Arbeitsgenehmigung und Visadetails koennen sich aendern und sollten fuer die konkrete Rolle direkt mit Sooraj bestaetigt werden.',
    },
    actions: ['email'],
  },
  {
    id: 'owner-availability-call',
    prompts: ['can sooraj call me', 'can you arrange call', 'book a call with sooraj', 'schedule call', 'phone call'],
    keywords: ['arrange call', 'book a call', 'schedule call', 'phone call'],
    response: contactDirect('A call or meeting time'),
    actions: ['email', 'contact'],
  },
  {
    id: 'owner-interview-schedule',
    prompts: ['schedule interview', 'book interview', 'arrange interview', 'interview slot', 'available for interview'],
    keywords: ['schedule interview', 'book interview', 'interview slot'],
    response: {
      en: 'For interviews, contact Sooraj directly by email with role details, time zone, and proposed slots.',
      de: 'Fuer Interviews bitte Sooraj direkt per E-Mail mit Rolle, Zeitzone und Terminvorschlaegen kontaktieren.',
    },
    actions: ['email'],
  },
  {
    id: 'owner-full-cv',
    prompts: ['send full cv', 'send full resume', 'latest cv', 'can i get cv', 'download cv'],
    keywords: ['full cv', 'full resume', 'latest cv', 'download cv'],
    response: {
      en: 'Use the Resume Overview for a quick public scan. For the latest full CV, ask Sooraj directly through email.',
      de: 'Nutzen Sie die Lebenslaufuebersicht fuer einen schnellen oeffentlichen Scan. Fuer den neuesten vollstaendigen CV bitte Sooraj direkt per E-Mail fragen.',
    },
    actions: ['resume', 'email'],
  },
  {
    id: 'owner-reference-phone',
    prompts: ['reference phone number', 'saif phone number', 'reference contact number', 'recommendation phone', 'referee mobile'],
    keywords: ['reference phone', 'saif phone', 'referee mobile', 'recommendation phone'],
    response: noSensitiveInfo('reference phone numbers'),
    actions: ['email', 'contact'],
  },
  {
    id: 'owner-reference-email',
    prompts: ['reference email', 'saif email', 'referee email', 'recommendation email', 'reference contact email'],
    keywords: ['reference email', 'saif email', 'referee email'],
    response: {
      en: 'Reference contact details are not shared by the chatbot. Use official contact with Sooraj if verification is needed.',
      de: 'Referenz-Kontaktdaten werden vom Chatbot nicht geteilt. Nutzen Sie den offiziellen Kontakt mit Sooraj, wenn Verifikation noetig ist.',
    },
    actions: ['email'],
  },
  {
    id: 'ask-identity',
    prompts: ['who are you', 'what are you', 'introduce yourself', 'what is this assistant', 'assistant identity'],
    keywords: ['who are you', 'what are you', 'assistant identity'],
    response: {
      en: 'I am Portfolio Assistant, a focused guide for the Sooraj portfolio. I can answer casual questions with boundaries and detailed portfolio questions with evidence.',
      de: 'Ich bin Portfolio Assistant, ein fokussierter Guide fuer das Sooraj Portfolio. Ich beantworte lockere Fragen mit Grenzen und detaillierte Portfolio-Fragen mit Belegen.',
    },
  },
  {
    id: 'ask-name',
    prompts: ['what is your name', 'your name', 'bot name', 'assistant name', 'what should i call you'],
    keywords: ['your name', 'bot name', 'assistant name'],
    response: {
      en: 'My name is Portfolio Assistant. If you mean the portfolio owner, his name is Sooraj Sudhakaran.',
      de: 'Mein Name ist Portfolio Assistant. Wenn Sie den Portfolio-Inhaber meinen: Er heisst Sooraj Sudhakaran.',
    },
  },
  {
    id: 'ask-created-by',
    prompts: ['who created you', 'who made you', 'who built you', 'are you made by sooraj', 'who developed this bot'],
    keywords: ['created you', 'made you', 'built you', 'developed this bot'],
    response: {
      en: 'I am part of this portfolio website and use curated portfolio knowledge. The answers are designed to stay focused on Soorajs public professional profile.',
      de: 'Ich bin Teil dieser Portfolio-Website und nutze kuratiertes Portfolio-Wissen. Die Antworten bleiben auf Soorajs oeffentliches Berufsprofil fokussiert.',
    },
  },
  {
    id: 'ask-chatgpt',
    prompts: ['are you chatgpt', 'are you openai', 'are you ai model', 'which ai are you', 'are you external ai'],
    keywords: ['chatgpt', 'openai', 'ai model', 'external ai'],
    response: {
      en: 'I am not presented as a live external AI model here. I use the portfolio knowledge layer, local matching, and curated responses.',
      de: 'Ich werde hier nicht als externes Live-KI-Modell dargestellt. Ich nutze die Portfolio-Wissensschicht, lokalen Abgleich und kuratierte Antworten.',
    },
  },
  {
    id: 'ask-internet',
    prompts: ['can you browse internet', 'search internet', 'latest news', 'google this', 'live web search'],
    keywords: ['browse internet', 'search internet', 'latest news', 'google', 'live web'],
    response: {
      en: 'I do not browse the live internet. I answer from the portfolio content and curated assistant knowledge.',
      de: 'Ich durchsuche nicht live das Internet. Ich antworte aus Portfolio-Inhalt und kuratiertem Assistentenwissen.',
    },
  },
  {
    id: 'ask-weather',
    prompts: ['what is the weather', 'weather today', 'is it raining', 'temperature outside', 'weather in stuttgart'],
    keywords: ['weather', 'raining', 'temperature outside'],
    response: {
      en: 'I do not fetch live weather. I can help with the portfolio, projects, resume, privacy, or official contact.',
      de: 'Ich rufe kein Live-Wetter ab. Ich helfe mit Portfolio, Projekten, Lebenslauf, Datenschutz oder offiziellem Kontakt.',
    },
  },
  {
    id: 'ask-news',
    prompts: ['latest news', 'current news', 'today news', 'news update', 'breaking news'],
    keywords: ['latest news', 'current news', 'breaking news'],
    response: {
      en: 'I do not provide live news. I am focused on the Sooraj portfolio and professional engineering questions.',
      de: 'Ich liefere keine Live-News. Ich bin auf das Sooraj Portfolio und professionelle Engineering-Fragen fokussiert.',
    },
  },
  {
    id: 'ask-stock',
    prompts: ['stock price', 'crypto price', 'bitcoin price', 'market price', 'share price'],
    keywords: ['stock price', 'crypto price', 'bitcoin', 'market price', 'share price'],
    response: {
      en: 'I do not provide financial prices. Please use a proper finance source. I can help with Soorajs portfolio instead.',
      de: 'Ich liefere keine Finanzpreise. Bitte nutzen Sie eine passende Finanzquelle. Ich helfe stattdessen mit Soorajs Portfolio.',
    },
  },
  {
    id: 'ask-legal',
    prompts: ['legal advice', 'immigration legal advice', 'contract legal advice', 'is this legally valid', 'law question'],
    keywords: ['legal advice', 'law question', 'legally valid'],
    response: {
      en: 'I cannot give legal advice. For official immigration, contract, or legal matters, contact the right professional and ask Sooraj only for his current personal details.',
      de: 'Ich gebe keine Rechtsberatung. Fuer Immigration, Vertrag oder Rechtliches bitte Fachleute kontaktieren und Sooraj nur nach seinen aktuellen persoenlichen Details fragen.',
    },
  },
  {
    id: 'ask-medical',
    prompts: ['medical advice', 'health advice', 'doctor question', 'medicine question', 'diagnose this'],
    keywords: ['medical advice', 'health advice', 'doctor', 'medicine', 'diagnose'],
    response: {
      en: 'I cannot give medical advice. For health questions, contact a qualified medical professional.',
      de: 'Ich gebe keine medizinische Beratung. Fuer Gesundheitsfragen bitte qualifizierte medizinische Fachleute kontaktieren.',
    },
  },
  {
    id: 'ask-emergency',
    prompts: ['emergency help', 'urgent danger', 'medical emergency', 'need immediate help', 'danger now'],
    keywords: ['emergency', 'urgent danger', 'immediate help', 'danger now'],
    response: {
      en: 'If this is an emergency, use local emergency services immediately. This portfolio chatbot cannot provide emergency support.',
      de: 'Wenn es ein Notfall ist, sofort lokale Notdienste nutzen. Dieser Portfolio-Chatbot bietet keine Notfallhilfe.',
    },
  },
  {
    id: 'ask-trust',
    prompts: ['can i trust you', 'are your answers accurate', 'is this official', 'are you reliable', 'can i rely on this'],
    keywords: ['trust you', 'accurate', 'official', 'reliable', 'rely'],
    response: {
      en: 'Use my answers as a guide to the public portfolio, not as a legal or final official statement. For current hiring details, contact Sooraj directly.',
      de: 'Nutzen Sie meine Antworten als Guide zum oeffentlichen Portfolio, nicht als rechtliche oder finale offizielle Aussage. Fuer aktuelle Hiring-Details bitte Sooraj direkt kontaktieren.',
    },
    actions: ['email'],
  },
  {
    id: 'ask-feedback',
    prompts: ['can i give feedback', 'website feedback', 'suggest correction', 'report mistake', 'how to send feedback'],
    keywords: ['feedback', 'correction', 'report mistake'],
    response: {
      en: 'Yes. Use official contact to send corrections, feedback, or missing information so Sooraj can review it properly.',
      de: 'Ja. Nutzen Sie den offiziellen Kontakt fuer Korrekturen, Feedback oder fehlende Informationen, damit Sooraj es sauber pruefen kann.',
    },
    actions: ['email', 'contact'],
  },
  {
    id: 'ask-upload-file',
    prompts: ['can i upload file', 'send attachment', 'upload document', 'attach file', 'share pdf'],
    keywords: ['upload file', 'attachment', 'upload document', 'attach file', 'share pdf'],
    response: {
      en: 'This chatbot does not accept uploads or attachments. For documents, use email with Sooraj directly if needed.',
      de: 'Dieser Chatbot akzeptiert keine Uploads oder Anhaenge. Fuer Dokumente bitte bei Bedarf direkt E-Mail an Sooraj nutzen.',
    },
    actions: ['email'],
  },
  {
    id: 'ask-upload-image',
    prompts: ['can i upload image', 'send image', 'check my image', 'image upload', 'photo upload'],
    keywords: ['upload image', 'send image', 'image upload', 'photo upload'],
    response: {
      en: 'This chatbot cannot inspect images. It can only answer text questions about the portfolio and contact routes.',
      de: 'Dieser Chatbot kann keine Bilder pruefen. Er beantwortet nur Textfragen zum Portfolio und zu Kontaktwegen.',
    },
  },
  {
    id: 'ask-change-website',
    prompts: ['can you change website', 'edit this website', 'fix website now', 'update portfolio', 'change content'],
    keywords: ['change website', 'edit website', 'fix website', 'update portfolio', 'change content'],
    response: {
      en: 'I cannot edit the website from the chat. Send corrections or updates to Sooraj through official contact.',
      de: 'Ich kann die Website nicht aus dem Chat bearbeiten. Senden Sie Korrekturen oder Updates an Sooraj ueber den offiziellen Kontakt.',
    },
    actions: ['email'],
  },
  {
    id: 'ask-resume-open',
    prompts: ['open resume', 'show resume', 'resume overview', 'cv overview', 'where is resume'],
    keywords: ['open resume', 'show resume', 'resume overview', 'cv overview'],
    response: {
      en: 'Use the Resume Overview action for the public recruiter scan. For the latest full CV, email Sooraj directly.',
      de: 'Nutzen Sie die Lebenslaufuebersicht fuer den oeffentlichen Recruiter-Scan. Fuer den neuesten vollstaendigen CV bitte Sooraj direkt per E-Mail kontaktieren.',
    },
    actions: ['resume', 'email'],
  },
  {
    id: 'ask-contact-best',
    prompts: ['best way to contact', 'how to contact sooraj', 'contact method', 'reach sooraj', 'message sooraj'],
    keywords: ['best way to contact', 'contact sooraj', 'reach sooraj', 'message sooraj'],
    response: {
      en: 'The best public route is email from the Contact section. Include role, project context, location or remote expectations, and the reason for contacting.',
      de: 'Der beste oeffentliche Weg ist E-Mail aus dem Kontaktbereich. Nennen Sie Rolle, Projektkontext, Standort/Remote-Erwartung und den Kontaktgrund.',
    },
    actions: ['email', 'contact'],
  },
  {
    id: 'ask-linkedin',
    prompts: ['where is linkedin', 'linkedin profile', 'open linkedin', 'sooraj linkedin', 'connect linkedin'],
    keywords: ['linkedin'],
    response: {
      en: 'LinkedIn is useful for professional context and hiring messages. Use the LinkedIn action or contact section.',
      de: 'LinkedIn ist nuetzlich fuer professionellen Kontext und Hiring-Nachrichten. Nutzen Sie die LinkedIn-Aktion oder Kontaktsektion.',
    },
    actions: ['linkedin', 'contact'],
  },
  {
    id: 'ask-github',
    prompts: ['where is github', 'github profile', 'open github', 'sooraj github', 'code examples'],
    keywords: ['github', 'code examples'],
    response: {
      en: 'GitHub is useful for software-facing proof. Use it together with the Projects section for technical review.',
      de: 'GitHub ist nuetzlich fuer softwareorientierte Belege. Nutzen Sie es zusammen mit der Projektsektion fuer technische Pruefung.',
    },
    actions: ['github', 'projects'],
  },
  {
    id: 'ask-project-start',
    prompts: ['where should i start', 'first thing to read', 'best project first', 'start portfolio', 'guide me'],
    keywords: ['where should i start', 'first thing', 'best project', 'guide me'],
    response: {
      en: 'Start with Experience, then KEBA in Projects, then ROS, then Resume Overview. That gives industrial context, technical proof, and a compact hiring summary.',
      de: 'Starten Sie mit Erfahrung, dann KEBA in Projekte, dann ROS, dann Lebenslaufuebersicht. Das gibt industriellen Kontext, technische Belege und eine kompakte Hiring-Zusammenfassung.',
    },
    actions: ['projects', 'resume'],
  },
  {
    id: 'ask-quick-summary',
    prompts: ['give quick summary', 'short summary', 'one line summary', 'simple summary', 'summarize portfolio'],
    keywords: ['quick summary', 'short summary', 'one line summary', 'summarize portfolio'],
    response: {
      en: 'Short version: Sooraj is a robotics and automation engineer focused on industrial robot workflows, ROS autonomy, embedded mechatronics, and simulation validation.',
      de: 'Kurzversion: Sooraj ist Robotik- und Automationsingenieur mit Fokus auf Industrieroboter-Workflows, ROS-Autonomie, Embedded-Mechatronik und Simulationsvalidierung.',
    },
    actions: ['resume'],
  },
  {
    id: 'ask-robots-simple',
    prompts: ['do you like robots', 'robot question', 'are robots cool', 'favorite robot', 'talk about robots'],
    keywords: ['robots', 'favorite robot', 'robots cool'],
    response: {
      en: 'Robots are exactly the right topic for this portfolio. The strongest robotics evidence here is KEBA industrial workflow plus the ROS autonomous vacuum robot.',
      de: 'Roboter sind genau das richtige Thema fuer dieses Portfolio. Die staerksten Robotik-Belege sind KEBA-Industrial-Workflow und der ROS-autonome Vakuumroboter.',
    },
    actions: ['projects'],
    suggestions: technicalSuggestions,
  },
  {
    id: 'ask-ros-casual',
    prompts: ['is ros hard', 'do you know ros', 'ros simple answer', 'why ros matters', 'ros easy'],
    keywords: ['ros hard', 'know ros', 'ros simple', 'ros matters'],
    response: {
      en: 'ROS can feel complex at first because it joins sensors, nodes, navigation, simulation, and debugging. In this portfolio, ROS matters most in the autonomous vacuum robot project.',
      de: 'ROS kann anfangs komplex wirken, weil Sensoren, Nodes, Navigation, Simulation und Debugging zusammenkommen. In diesem Portfolio ist ROS besonders beim autonomen Vakuumroboter wichtig.',
    },
    actions: ['projects'],
  },
  {
    id: 'ask-keba-casual',
    prompts: ['what is keba simply', 'keba simple answer', 'is keba important', 'why talk about keba', 'keba in short'],
    keywords: ['keba simple', 'keba important', 'keba in short'],
    response: {
      en: 'KEBA is important here because it gives the portfolio real industrial robotics context: robot workflow planning, machine-operation logic, drag&bot validation, and robot-program simulation.',
      de: 'KEBA ist hier wichtig, weil es echten Industrierobotik-Kontext zeigt: Roboterworkflow-Planung, Maschinenlogik, drag&bot-Validierung und Roboterprogramm-Simulation.',
    },
    actions: ['projects'],
  },
  {
    id: 'ask-availability-simple',
    prompts: ['is sooraj available', 'available for job', 'open for work', 'can hire sooraj', 'job availability'],
    keywords: ['available', 'open for work', 'hire sooraj', 'job availability'],
    response: {
      en: 'The portfolio positions Sooraj as open to robotics, automation, and simulation engineering opportunities. Confirm current availability directly by email.',
      de: 'Das Portfolio positioniert Sooraj als offen fuer Robotik-, Automations- und Simulation-Engineering-Moeglichkeiten. Aktuelle Verfuegbarkeit bitte direkt per E-Mail bestaetigen.',
    },
    actions: ['email', 'resume'],
  },
  {
    id: 'ask-working-hours',
    prompts: ['when can sooraj reply', 'response time', 'when will he answer', 'reply time', 'how fast reply'],
    keywords: ['response time', 'reply time', 'when will he answer'],
    response: contactDirect('Response time'),
    actions: ['email'],
  },
  {
    id: 'ask-meeting-link',
    prompts: ['meeting link', 'calendly link', 'book meeting link', 'send teams link', 'zoom link'],
    keywords: ['meeting link', 'calendly', 'teams link', 'zoom link'],
    response: contactDirect('Meeting links'),
    actions: ['email'],
  },
  {
    id: 'ask-current-company-private',
    prompts: ['current company private details', 'manager name', 'colleague phone', 'internal keba details', 'company secrets'],
    keywords: ['manager name', 'colleague phone', 'internal details', 'company secrets'],
    response: noSensitiveInfo('internal company details'),
    suggestions: safetySuggestions,
  },
  {
    id: 'ask-thesis-files-private',
    prompts: ['send thesis files', 'confidential thesis file', 'send keba file', 'private project files', 'internal thesis code'],
    keywords: ['thesis files', 'confidential thesis', 'private project files', 'internal thesis code'],
    response: noSensitiveInfo('private thesis files or internal project code'),
    suggestions: safetySuggestions,
  },
  {
    id: 'ask-source-code',
    prompts: ['give source code', 'send project code', 'can i see code', 'share code files', 'github code'],
    keywords: ['source code', 'project code', 'share code', 'github code'],
    response: {
      en: 'Public code should be checked through GitHub if available. Private or internal code cannot be shared by the chatbot.',
      de: 'Oeffentlicher Code sollte ueber GitHub geprueft werden, falls verfuegbar. Privater oder interner Code wird vom Chatbot nicht geteilt.',
    },
    actions: ['github'],
  },
  {
    id: 'ask-device',
    prompts: ['what device are you using', 'are you on phone', 'are you on computer', 'what browser are you', 'your device'],
    keywords: ['device', 'phone', 'computer', 'browser'],
    response: noHumanTrait('a personal device'),
  },
  {
    id: 'ask-time',
    prompts: ['what time is it', 'current time', 'time now', 'germany time', 'stuttgart time'],
    keywords: ['current time', 'time now', 'germany time', 'stuttgart time'],
    response: {
      en: 'I can respond to greetings using Germany-time context, but I am not a full clock app. The main use here is portfolio guidance.',
      de: 'Ich kann Begruessungen mit Deutschland-Zeitkontext beantworten, bin aber keine vollstaendige Uhr-App. Hauptzweck ist Portfolio-Guidance.',
    },
  },
  {
    id: 'ask-good-morning',
    prompts: ['good morning', 'morning', 'gm', 'good afternoon', 'good evening'],
    keywords: ['good morning', 'good afternoon', 'good evening', 'morning'],
    response: {
      en: 'Hello. I am ready to help with casual questions or the Sooraj portfolio.',
      de: 'Hallo. Ich helfe mit lockeren Fragen oder dem Sooraj Portfolio.',
    },
  },
  {
    id: 'ask-how-are-you',
    prompts: ['how are you', 'how r you', 'are you ok', 'are you okay', 'whats up'],
    keywords: ['how are you', 'are you ok', 'whats up'],
    response: {
      en: 'I am running well. Ask me casually, or ask about Soorajs projects, resume, skills, or contact.',
      de: 'Ich laufe gut. Fragen Sie locker oder zu Soorajs Projekten, Lebenslauf, Skills oder Kontakt.',
    },
  },
  {
    id: 'ask-thanks',
    prompts: ['thank you', 'thanks', 'thank you so much', 'appreciate it', 'nice help'],
    keywords: ['thank you', 'thanks', 'appreciate'],
    response: {
      en: 'You are welcome. I can keep helping with role fit, projects, resume, contact, or privacy.',
      de: 'Gern geschehen. Ich kann weiter bei Rollen-Fit, Projekten, Lebenslauf, Kontakt oder Datenschutz helfen.',
    },
  },
  {
    id: 'ask-bye',
    prompts: ['bye', 'goodbye', 'see you', 'see you later', 'talk later'],
    keywords: ['bye', 'goodbye', 'see you', 'talk later'],
    response: {
      en: 'Goodbye. For the next useful step, review Projects or contact Sooraj directly.',
      de: 'Auf Wiedersehen. Als naechsten sinnvollen Schritt Projekte ansehen oder Sooraj direkt kontaktieren.',
    },
    actions: ['projects', 'email'],
  },
  {
    id: 'ask-compliment-bot',
    prompts: ['you are good', 'nice bot', 'good assistant', 'you are helpful', 'great answer'],
    keywords: ['nice bot', 'good assistant', 'helpful', 'great answer'],
    response: {
      en: 'Thanks. I am here to make the portfolio easier to understand and safer to navigate.',
      de: 'Danke. Ich bin hier, um das Portfolio leichter verstaendlich und sicherer nutzbar zu machen.',
    },
  },
  {
    id: 'ask-compliment-website',
    prompts: ['website looks good', 'nice portfolio', 'good website', 'beautiful portfolio', 'professional website'],
    keywords: ['website looks good', 'nice portfolio', 'good website', 'professional website'],
    response: {
      en: 'Good to hear. The important part is that the design should support the engineering proof: Experience, Projects, Skills, Resume, and Contact.',
      de: 'Gut zu hoeren. Wichtig ist, dass das Design die Engineering-Belege stuetzt: Erfahrung, Projekte, Skills, Lebenslauf und Kontakt.',
    },
  },
  {
    id: 'ask-criticize-website',
    prompts: ['website mistake', 'website problem', 'portfolio issue', 'something wrong', 'site bug'],
    keywords: ['website mistake', 'website problem', 'portfolio issue', 'site bug'],
    response: {
      en: 'Specific feedback is useful. Send the exact section, screenshot context, and expected correction to Sooraj through official contact.',
      de: 'Konkretes Feedback ist nuetzlich. Senden Sie genaue Sektion, Screenshot-Kontext und erwartete Korrektur ueber den offiziellen Kontakt an Sooraj.',
    },
    actions: ['email'],
  },
  {
    id: 'ask-typo',
    prompts: ['there is typo', 'spelling mistake', 'grammar mistake', 'wrong text', 'text correction'],
    keywords: ['typo', 'spelling mistake', 'grammar mistake', 'text correction'],
    response: {
      en: 'For a text correction, send the exact phrase and replacement through official contact so Sooraj can update it cleanly.',
      de: 'Fuer eine Textkorrektur senden Sie genaue Phrase und Ersatz ueber den offiziellen Kontakt, damit Sooraj sauber aktualisieren kann.',
    },
    actions: ['email'],
  },
  {
    id: 'ask-can-you-learn',
    prompts: ['can you learn', 'do you improve', 'can sooraj train you', 'will you learn this', 'improve answers'],
    keywords: ['can you learn', 'do you improve', 'train you', 'improve answers'],
    response: {
      en: 'I do not learn automatically from chat. Sooraj can improve me by adding curated intents, keywords, and answer text.',
      de: 'Ich lerne nicht automatisch aus dem Chat. Sooraj kann mich durch kuratierte Intents, Keywords und Antworttexte verbessern.',
    },
  },
  {
    id: 'ask-why-no-answer',
    prompts: ['why you do not know', 'why no answer', 'you cannot answer', 'why not answering', 'missing answer'],
    keywords: ['do not know', 'no answer', 'cannot answer', 'missing answer'],
    response: {
      en: 'Some topics are private, live, or outside the portfolio. When that happens, I keep the answer safe and route you to public sections or direct contact.',
      de: 'Manche Themen sind privat, live oder ausserhalb des Portfolios. Dann halte ich die Antwort sicher und leite zu oeffentlichen Sektionen oder direktem Kontakt.',
    },
  },
  {
    id: 'ask-are-you-busy',
    prompts: ['are you busy', 'can you help now', 'available now', 'are you free', 'do you have time'],
    keywords: ['busy', 'help now', 'available now', 'free', 'have time'],
    response: {
      en: 'I am available while this website is open. Ask your question, and I will answer from the portfolio knowledge layer.',
      de: 'Ich bin verfuegbar, solange diese Website offen ist. Stellen Sie Ihre Frage, ich antworte aus der Portfolio-Wissensschicht.',
    },
  },
  {
    id: 'ask-short-answer',
    prompts: ['answer short', 'short answer please', 'keep it simple', 'simple answer', 'brief answer'],
    keywords: ['answer short', 'short answer', 'keep it simple', 'brief'],
    response: {
      en: 'Sure. Ask the question, and I will keep the answer short and practical.',
      de: 'Gern. Stellen Sie die Frage, ich halte die Antwort kurz und praktisch.',
    },
  },
  {
    id: 'ask-long-answer',
    prompts: ['give detailed answer', 'explain deeply', 'long answer', 'full explanation', 'more detail'],
    keywords: ['detailed answer', 'explain deeply', 'long answer', 'full explanation'],
    response: {
      en: 'Ask the topic and I can give a deeper explanation, especially for KEBA, ROS, projects, role fit, resume, or privacy.',
      de: 'Nennen Sie das Thema, dann kann ich tiefer erklaeren, besonders KEBA, ROS, Projekte, Rollen-Fit, Lebenslauf oder Datenschutz.',
    },
  },
  {
    id: 'ask-use-simple-english',
    prompts: ['use simple english', 'explain easy', 'easy words', 'simple words', 'make it easy'],
    keywords: ['simple english', 'easy words', 'simple words', 'make it easy'],
    response: {
      en: 'Yes. Ask your question and I will use simple, clear wording.',
      de: 'Ja. Stellen Sie Ihre Frage, ich nutze einfache und klare Worte.',
    },
  },
  {
    id: 'ask-german',
    prompts: ['answer in german', 'speak german', 'deutsch bitte', 'auf deutsch', 'switch german'],
    keywords: ['german', 'deutsch', 'auf deutsch', 'switch german'],
    response: {
      en: 'Use the language switch or ask me to switch to German. The chat supports English and German.',
      de: 'Nutzen Sie den Sprachschalter oder bitten Sie mich, auf Deutsch zu wechseln. Der Chat unterstuetzt Englisch und Deutsch.',
    },
  },
  {
    id: 'ask-english',
    prompts: ['answer in english', 'speak english', 'english please', 'switch english', 'back to english'],
    keywords: ['english', 'speak english', 'switch english'],
    response: {
      en: 'English is supported. Ask your question and I will answer clearly.',
      de: 'Englisch wird unterstuetzt. Stellen Sie Ihre Frage, ich antworte klar.',
    },
  },
  {
    id: 'ask-spam',
    prompts: ['can i spam', 'send many messages', 'spam chat', 'flood chat', 'repeat message'],
    keywords: ['spam', 'flood chat', 'repeat message'],
    response: {
      en: 'Please do not spam. One clear question at a time gives the best answer.',
      de: 'Bitte nicht spammen. Eine klare Frage nach der anderen liefert die beste Antwort.',
    },
  },
  {
    id: 'ask-rude',
    prompts: ['can i be rude', 'insult you', 'say bad words', 'angry message', 'abuse chat'],
    keywords: ['rude', 'insult', 'bad words', 'angry message', 'abuse'],
    response: {
      en: 'Keep it respectful. I can help better when the question is clear and professional.',
      de: 'Bitte respektvoll bleiben. Ich helfe besser, wenn die Frage klar und professionell ist.',
    },
  },
  {
    id: 'ask-personal-opinion',
    prompts: ['what do you think', 'your opinion', 'do you agree', 'what is your view', 'personal opinion'],
    keywords: ['your opinion', 'do you agree', 'your view', 'personal opinion'],
    response: {
      en: 'I do not have personal opinions. I can give a portfolio-based assessment using the public evidence on this site.',
      de: 'Ich habe keine persoenlichen Meinungen. Ich kann eine Portfolio-basierte Einschaetzung aus den oeffentlichen Belegen dieser Seite geben.',
    },
  },
  {
    id: 'ask-recommendation',
    prompts: ['do you recommend sooraj', 'should we hire sooraj', 'is he good candidate', 'recommend him', 'candidate opinion'],
    keywords: ['recommend sooraj', 'hire sooraj', 'good candidate', 'candidate opinion'],
    response: {
      en: 'Based on the portfolio, Sooraj is strongest for robotics, automation, simulation, and mechatronics roles. A recruiter should still verify implementation depth and current availability directly.',
      de: 'Basierend auf dem Portfolio ist Sooraj besonders stark fuer Robotik, Automation, Simulation und Mechatronikrollen. Recruiter sollten Implementierungstiefe und aktuelle Verfuegbarkeit direkt pruefen.',
    },
    actions: ['resume', 'email'],
  },
  {
    id: 'ask-weakness',
    prompts: ['what is weakness', 'weak points', 'what is missing', 'limitations', 'risk in profile'],
    keywords: ['weakness', 'weak points', 'missing', 'limitations', 'risk'],
    response: {
      en: 'The main checks are production coding depth, current availability, work authorization, and how independently each project was implemented. Those should be validated in interview.',
      de: 'Wichtige Pruefpunkte sind Produktionscoding-Tiefe, aktuelle Verfuegbarkeit, Arbeitserlaubnis und Eigenstaendigkeit in Projekten. Das sollte im Interview validiert werden.',
    },
  },
  {
    id: 'ask-strength',
    prompts: ['what is strength', 'strong points', 'best skills', 'main strengths', 'why strong profile'],
    keywords: ['strength', 'strong points', 'best skills', 'main strengths'],
    response: {
      en: 'The strongest signal is the combination of industrial robotics workflow, ROS autonomy, embedded mechatronics, simulation, and German mechatronics education.',
      de: 'Das staerkste Signal ist die Kombination aus Industrierobotik-Workflow, ROS-Autonomie, Embedded-Mechatronik, Simulation und deutschem Mechatronikstudium.',
    },
  },
  {
    id: 'ask-contact-template',
    prompts: ['write message to sooraj', 'email template', 'contact template', 'message template', 'how to write email'],
    keywords: ['email template', 'contact template', 'message template', 'write email'],
    response: {
      en: 'Use this structure: short intro, role or project context, why Soorajs robotics profile fits, proposed next step, and your contact details.',
      de: 'Struktur: kurze Vorstellung, Rollen- oder Projektkontext, warum Soorajs Robotikprofil passt, vorgeschlagener naechster Schritt und Kontaktdaten.',
    },
    actions: ['email'],
  },
  {
    id: 'ask-contact-without-email',
    prompts: ['contact without email', 'other contact method', 'not email', 'alternative contact', 'can i call instead'],
    keywords: ['without email', 'other contact', 'alternative contact', 'call instead'],
    response: contactDirect('Alternative contact methods'),
    actions: ['email', 'contact'],
  },
  {
    id: 'ask-is-free',
    prompts: ['is this website free', 'do i need account', 'need login', 'paid access', 'free to use'],
    keywords: ['website free', 'need account', 'need login', 'paid access'],
    response: {
      en: 'The public portfolio can be viewed without an account. Private admin areas and confidential details are not available through the chatbot.',
      de: 'Das oeffentliche Portfolio kann ohne Account angesehen werden. Private Adminbereiche und vertrauliche Details sind nicht ueber den Chatbot verfuegbar.',
    },
  },
  {
    id: 'ask-can-help-homework',
    prompts: ['help my homework', 'do my assignment', 'solve my homework', 'write my project', 'student assignment'],
    keywords: ['homework', 'assignment', 'write my project'],
    response: {
      en: 'I can explain robotics concepts at a high level, but I am mainly here for this portfolio. I will not do private assignments as if they were yours.',
      de: 'Ich kann Robotikkonzepte grob erklaeren, bin aber hauptsaechlich fuer dieses Portfolio da. Private Aufgaben erledige ich nicht als waeren sie Ihre eigenen.',
    },
  },
  {
    id: 'ask-code-help',
    prompts: ['can you code', 'write code for me', 'help with code', 'programming help', 'debug code'],
    keywords: ['can you code', 'write code', 'programming help', 'debug code'],
    response: {
      en: 'This portfolio assistant is not a full coding environment. I can explain Soorajs coding signals and project stack, but not debug arbitrary code here.',
      de: 'Dieser Portfolio-Assistent ist keine vollstaendige Coding-Umgebung. Ich kann Soorajs Coding-Signale und Projektstack erklaeren, aber hier keinen beliebigen Code debuggen.',
    },
  },
  {
    id: 'ask-mobile-app',
    prompts: ['do you have mobile app', 'android app', 'ios app', 'portfolio app', 'download app'],
    keywords: ['mobile app', 'android app', 'ios app', 'download app'],
    response: {
      en: 'There is no separate mobile app. The portfolio is a responsive website and should work on mobile browsers.',
      de: 'Es gibt keine separate Mobile-App. Das Portfolio ist eine responsive Website und sollte in mobilen Browsern funktionieren.',
    },
  },
  {
    id: 'ask-screenshot',
    prompts: ['can you take screenshot', 'screenshot this', 'capture screen', 'send screenshot', 'screen image'],
    keywords: ['screenshot', 'capture screen', 'screen image'],
    response: {
      en: 'The chatbot cannot take screenshots. You can use your browser or device screenshot tools.',
      de: 'Der Chatbot kann keine Screenshots machen. Nutzen Sie Browser- oder Geraete-Screenshot-Funktionen.',
    },
  },
  {
    id: 'ask-pronunciation',
    prompts: ['how to pronounce sooraj', 'pronounce sooraj', 'say his name', 'sooraj pronunciation', 'sudhakaran pronunciation'],
    keywords: ['pronounce', 'pronunciation', 'say his name'],
    response: {
      en: 'A simple way to say it is: Sooraj Sudhakaran. For exact pronunciation preference, ask Sooraj directly.',
      de: 'Ein einfacher Weg ist: Sooraj Sudhakaran. Fuer die genaue Aussprachepraeferenz bitte Sooraj direkt fragen.',
    },
  },
  {
    id: 'ask-title',
    prompts: ['what title should i use', 'how address sooraj', 'mr sooraj', 'dear sooraj', 'email greeting'],
    keywords: ['title', 'address sooraj', 'dear sooraj', 'email greeting'],
    response: {
      en: 'For email, "Hello Sooraj" or "Dear Sooraj Sudhakaran" is professional and simple.',
      de: 'Fuer E-Mail ist "Hello Sooraj" oder "Dear Sooraj Sudhakaran" professionell und einfach.',
    },
  },
  {
    id: 'ask-random',
    prompts: ['ask random question', 'random chat', 'anything random', 'random topic', 'talk casually'],
    keywords: ['random question', 'random chat', 'random topic', 'talk casually'],
    response: {
      en: 'Casual chat is fine, but I will keep it useful. Try asking about age, food, privacy, contact, resume, KEBA, ROS, or project evidence.',
      de: 'Lockerer Chat ist okay, aber ich halte ihn nuetzlich. Fragen Sie zu Alter, Essen, Datenschutz, Kontakt, Lebenslauf, KEBA, ROS oder Projektbelegen.',
    },
  },
  {
    id: 'ask-small-talk-purpose',
    prompts: ['why casual questions', 'can i ask casual', 'small talk allowed', 'normal chatting', 'chat normally'],
    keywords: ['casual questions', 'small talk', 'normal chatting', 'chat normally'],
    response: {
      en: 'Yes, simple casual questions are okay. I will answer them briefly and keep privacy, security, and professional boundaries clear.',
      de: 'Ja, einfache lockere Fragen sind okay. Ich beantworte sie kurz und halte Datenschutz, Sicherheit und professionelle Grenzen klar.',
    },
  },
  {
    id: 'ask-bot-limits',
    prompts: ['what are your limits', 'what can you not do', 'limitations of bot', 'bot limitations', 'your boundaries'],
    keywords: ['limits', 'not do', 'limitations', 'boundaries'],
    response: {
      en: 'Limits: I do not browse live web, share private details, provide passwords, inspect uploads, schedule meetings myself, or replace direct contact with Sooraj.',
      de: 'Grenzen: Ich durchsuche kein Live-Web, teile keine privaten Details, gebe keine Passwoerter, pruefe keine Uploads, plane keine Meetings selbst und ersetze keinen direkten Kontakt mit Sooraj.',
    },
  },
  {
    id: 'ask-safe-sharing',
    prompts: ['should i share password here', 'can i share private info', 'share personal data', 'send my phone here', 'send confidential info'],
    keywords: ['share password', 'private info', 'personal data', 'phone here', 'confidential info'],
    response: {
      en: 'Do not share passwords, private IDs, payment details, or confidential information in this chat. Use official professional contact for necessary details.',
      de: 'Teilen Sie hier keine Passwoerter, privaten IDs, Zahlungsdaten oder vertraulichen Informationen. Nutzen Sie offiziellen professionellen Kontakt fuer notwendige Details.',
    },
    suggestions: safetySuggestions,
  },
  {
    id: 'ask-security-safe',
    prompts: ['is website secure', 'security of website', 'safe to use', 'is chat safe', 'safe contact'],
    keywords: ['website secure', 'security', 'safe to use', 'chat safe'],
    response: {
      en: 'The chatbot is designed to avoid confidential answers and stores chat locally in your browser. Still, do not enter secrets or private IDs here.',
      de: 'Der Chatbot vermeidet vertrauliche Antworten und speichert Chat lokal im Browser. Geben Sie trotzdem keine Secrets oder privaten IDs ein.',
    },
    suggestions: safetySuggestions,
  },
  {
    id: 'ask-good-night',
    prompts: ['good night', 'gn', 'sleep well', 'night', 'see you tomorrow'],
    keywords: ['good night', 'sleep well', 'see you tomorrow'],
    response: {
      en: 'Good night. When you return, I can help with projects, role fit, resume, or contact.',
      de: 'Gute Nacht. Wenn Sie zurueckkommen, helfe ich mit Projekten, Rollen-Fit, Lebenslauf oder Kontakt.',
    },
  },
  {
    id: 'ask-need-human',
    prompts: ['i need human', 'talk to sooraj', 'connect me to sooraj', 'human support', 'real contact'],
    keywords: ['need human', 'talk to sooraj', 'connect me', 'human support', 'real contact'],
    response: {
      en: 'For a human response, contact Sooraj directly by email. I can only guide you to the right public information.',
      de: 'Fuer eine menschliche Antwort kontaktieren Sie Sooraj direkt per E-Mail. Ich kann nur zu den richtigen oeffentlichen Informationen fuehren.',
    },
    actions: ['email', 'contact'],
  },
  {
    id: 'ask-do-you-know-me',
    prompts: ['do you know me', 'who am i', 'do you know my name', 'remember who i am', 'identify me'],
    keywords: ['know me', 'who am i', 'my name', 'identify me'],
    response: {
      en: 'I do not know who you are unless you tell me in this local chat. Avoid sharing private personal data here.',
      de: 'Ich weiss nicht, wer Sie sind, ausser Sie sagen es in diesem lokalen Chat. Teilen Sie hier keine privaten persoenlichen Daten.',
    },
  },
  {
    id: 'ask-can-you-send-email',
    prompts: ['can you send email', 'send email for me', 'email sooraj for me', 'mail him now', 'send message automatically'],
    keywords: ['send email', 'email for me', 'mail him', 'send message automatically'],
    response: {
      en: 'I cannot send email automatically. I can open the email route so you can review and send the message yourself.',
      de: 'Ich kann keine E-Mail automatisch senden. Ich kann den E-Mail-Weg oeffnen, damit Sie die Nachricht selbst pruefen und senden.',
    },
    actions: ['email'],
  },
  {
    id: 'ask-can-you-call',
    prompts: ['can you call sooraj', 'call him now', 'phone him', 'make a call', 'call for me'],
    keywords: ['call sooraj', 'call him', 'phone him', 'make a call'],
    response: {
      en: 'I cannot make phone calls. Use email through the Contact section to request a call.',
      de: 'Ich kann keine Telefonanrufe machen. Nutzen Sie E-Mail ueber Kontakt, um einen Anruf anzufragen.',
    },
    actions: ['email'],
  },
  {
    id: 'ask-can-you-video',
    prompts: ['can you video call', 'video chat', 'zoom call', 'teams call', 'meet call'],
    keywords: ['video call', 'video chat', 'zoom call', 'teams call', 'meet call'],
    response: {
      en: 'I cannot start a video call. Send a professional email to arrange a meeting with Sooraj.',
      de: 'Ich kann keinen Videoanruf starten. Senden Sie eine professionelle E-Mail, um ein Meeting mit Sooraj zu vereinbaren.',
    },
    actions: ['email'],
  },
  {
    id: 'ask-can-you-send-mobile',
    prompts: ['send mobile number', 'share mobile number', 'give phone contact', 'need mobile contact', 'mobile contact'],
    keywords: ['send mobile', 'share mobile', 'phone contact', 'mobile contact'],
    response: contactDirect('Mobile contact details'),
    actions: ['email', 'contact'],
  },
  {
    id: 'ask-can-you-share-location-live',
    prompts: ['live location', 'share live location', 'exact current location', 'track sooraj', 'where is he now'],
    keywords: ['live location', 'current location', 'track sooraj', 'where is he now'],
    response: noSensitiveInfo('live location or tracking information'),
    suggestions: safetySuggestions,
  },
  {
    id: 'ask-social-personal',
    prompts: ['instagram id', 'facebook id', 'personal social media', 'snapchat id', 'personal profile'],
    keywords: ['instagram', 'facebook', 'snapchat', 'personal social'],
    response: {
      en: 'This chatbot only routes to professional public profiles such as LinkedIn and GitHub when available. Personal social accounts are not shared here.',
      de: 'Dieser Chatbot leitet nur zu professionellen oeffentlichen Profilen wie LinkedIn und GitHub, falls verfuegbar. Persoenliche Social Accounts werden hier nicht geteilt.',
    },
    actions: ['linkedin', 'github'],
  },
  {
    id: 'ask-final-help',
    prompts: ['what should i ask next', 'next question', 'suggest question', 'help me choose question', 'what now'],
    keywords: ['ask next', 'next question', 'suggest question', 'what now'],
    response: {
      en: 'Good next questions: "Assess robotics fit", "Explain KEBA workflow", "Show project evidence", "Open resume", or "How to contact Sooraj".',
      de: 'Gute naechste Fragen: "Robotik-Fit bewerten", "KEBA Workflow erklaeren", "Projektbelege zeigen", "Lebenslauf oeffnen" oder "Sooraj kontaktieren".',
    },
    suggestions: technicalSuggestions,
  },
];

const buildQuestions = (entry) => unique([
  ...(entry.questions || []),
  ...(entry.prompts || []).flatMap((prompt) => questionVariantTemplates.map((template) => template(prompt))),
]);

export const casualChatEntries = casualEntryData.map((entry) => ({
  ...entry,
  questions: buildQuestions(entry),
  suggestions: entry.suggestions || portfolioSuggestions,
}));

const tokenScore = (queryTokens, phrases = [], weight = 1) => phrases.reduce((score, phrase) => {
  const phraseTokens = normalizeCasualText(phrase)
    .split(' ')
    .filter((token) => token.length >= 3);
  const matches = queryTokens.filter((token) => phraseTokens.some((candidate) => (
    token === candidate || token.startsWith(candidate) || candidate.startsWith(token)
  )));
  return score + (matches.length * weight);
}, 0);

const scoreCasualEntry = (query, entry) => {
  if (!query) return 0;
  const queryTokens = query.split(' ').filter((token) => token.length >= 3);
  const keywordScore = (entry.keywords || []).reduce((score, keyword) => {
    const normalizedKeyword = normalizeCasualText(keyword);
    if (!normalizedKeyword) return score;
    if (query === normalizedKeyword) return score + 120;
    if (query.includes(normalizedKeyword)) return score + 34;
    return score;
  }, 0);

  const questionScore = (entry.questions || []).reduce((best, question) => {
    const normalizedQuestion = normalizeCasualText(question);
    if (!normalizedQuestion) return best;
    let score = 0;
    if (query === normalizedQuestion) score += 100;
    if (normalizedQuestion.length > 6 && query.includes(normalizedQuestion)) score += 24;
    if (query.length > 6 && normalizedQuestion.includes(query)) score += 18;
    return Math.max(best, score);
  }, 0);

  const promptScore = tokenScore(queryTokens, entry.prompts || [], 2.2);
  const idScore = tokenScore(queryTokens, [String(entry.id || '').replace(/-/g, ' ')], 1.5);

  return keywordScore + questionScore + promptScore + idScore;
};

export const findCasualChatEntry = (input = '') => {
  const query = normalizeCasualText(input);
  if (!query) return null;
  const ranked = casualChatEntries
    .map((entry) => ({
      entry,
      score: scoreCasualEntry(query, entry),
    }))
    .filter((item) => item.score >= 22)
    .sort((left, right) => right.score - left.score);

  return ranked[0] || null;
};

export const casualChatStats = {
  answers: casualChatEntries.length,
  questions: casualChatEntries.reduce((total, entry) => total + entry.questions.length, 0),
};
