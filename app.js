const STORAGE_THEME_KEY = "theme";
const STORAGE_LANGUAGE_KEY = "site-language";
const STORAGE_DETAIL_ORIGIN_PREFIX = "detail-origin:";
const STORAGE_RETURN_TARGET_KEY = "detail-return-target";
const STORAGE_FEEDBACK_STATS_KEY = "feedback-form-stats";
const STORAGE_FEEDBACK_LAST_SUBMISSION_KEY = "feedback-last-submission";
const STORAGE_SITE_UPDATE_OVERRIDE_KEY = "portfolio-site-update-override";
const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";
const GOOGLE_ANALYTICS_ID = "G-00H12CYMW0";
const CLARITY_PROJECT_ID = "vz7zebyj7z";
const SUPABASE_URL = "https://ofltnlwdwyjnsapqprlw.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_LC3P3UNYF3lr-5MIP2pA6Q_T6m4Tjn6";
const SUPABASE_ADMIN_EMAIL = "soorajsudhakaran4@gmail.com";
const SUPABASE_SCRIPT_URL = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
let supabaseClientPromise = null;
let supabaseClient = null;
let adminSessionActive = false;
const REQUEST_CV_LINKS = {
  en: "mailto:soorajsudhakaran1199@gmail.com?subject=Request%20for%20CV&body=Hi%20Sooraj%20Sudhakaran%2C%0D%0A%0D%0AI%20am%20interested%20in%20your%20profile%20for%20a%20relevant%20opportunity.%20Please%20share%20your%20latest%20CV%20with%20me%20via%20email.%0D%0A%0D%0AThank%20you%2C%0D%0A%5BYour%20Name%5D%0D%0A%5BCompany%20/%20Role%5D",
  de: "mailto:soorajsudhakaran1199@gmail.com?subject=Anfrage%20nach%20CV&body=Hallo%20Sooraj%20Sudhakaran%2C%0D%0A%0D%0AIch%20interessiere%20mich%20f%C3%BCr%20Ihr%20Profil%20im%20Rahmen%20einer%20passenden%20Position.%20Bitte%20senden%20Sie%20mir%20Ihren%20aktuellen%20CV%20per%20E-Mail%20zu.%0D%0A%0D%0AVielen%20Dank%2C%0D%0A%5BIhr%20Name%5D%0D%0A%5BUnternehmen%20/%20Rolle%5D"
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
      comments: "Kommentar",
      suggestion: "Vorgeschlagene Verbesserung"
    }
  }
};

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
    "KEBA overview": "KEBA-Überblick",
    "This page brings together the full KEBA-related profile: working student responsibilities, the parallel master's thesis in industrial robotics, technical training, project presentations, and exhibition participation that together show an industrially grounded robotics direction.": "Diese Seite bündelt das vollständige KEBA-bezogene Profil: Werkstudententätigkeit, die parallele Masterarbeit in Industrierobotik, technisches Training, Projektpräsentationen und Messebeteiligung, die gemeinsam eine industriell fundierte Robotik-Ausrichtung zeigen.",
    "If you are hiring for robotics or automation, this page is designed to work as one KEBA-focused review page. It combines the working student role, the parallel thesis, KEBA and drag&bot training, technical presentations, and KEBA exhibition participation in one place.": "Wenn Sie für Robotik oder Automatisierung einstellen, ist diese Seite als KEBA-fokussierte Übersichtsseite gedacht. Sie bündelt die Werkstudentenrolle, die parallele Thesis, KEBA- und drag&bot-Trainings, technische Präsentationen und KEBA-Messebeteiligung an einem Ort.",
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
    "What this experience strengthened": "Was diese Erfahrung gestärkt hat",
    "View thesis details": "Thesis-Details ansehen",
    "Problem space": "Problemstellung",
    "System objective": "Systemziel",
    "The thesis focused on a 6-axis autonomous robot workflow for machine operation. The goal was not only to demonstrate movement, but to make the complete operation flow practical enough for industrial execution logic.": "Die Thesis konzentrierte sich auf einen autonomen 6-Achs-Roboterworkflow für die Maschinenbedienung. Das Ziel war nicht nur, Bewegung zu demonstrieren, sondern den gesamten Ablauf praxisnah genug für industrielle Ausführungslogik zu gestalten.",
    "Key work areas": "Zentrale Arbeitsbereiche",
    "Joint path planner contribution": "Beitrag zum Gelenkpfadplaner",
    "Engineering challenges addressed": "Bearbeitete Engineering-Herausforderungen",
    "Technical value": "Technischer Mehrwert",
    "Presentation and collaboration": "Präsentation und Zusammenarbeit",
    "Supporting industrial exposure": "Begleitende Industrieerfahrung",
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
    } else if (/feedback\.html/i.test(href)) {
      eventName = "feedback_form_open";
    } else if (/journey\.html/i.test(href)) {
      eventName = "journey_open";
    } else if (/github\.com\/SoorajSudhakaran1199/i.test(href)) {
      eventName = "github_click";
    } else if (/linkedin\.com\/in\/sooraj-sudhakaran1999/i.test(href)) {
      eventName = "linkedin_click";
    } else if (/request cv/i.test(text)) {
      eventName = "request_cv_click";
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
  "Use this page to explore the full portfolio structure.": "Nutzen Sie diese Seite, um die vollstaendige Portfoliostruktur zu erkunden.",
  "This page links the main robotics, industrial automation, thesis, project, journey, and contact pages of the website in one crawlable overview.": "Diese Seite verlinkt die wichtigsten Robotik-, Industrieautomatisierungs-, Thesis-, Projekt-, Werdegangs- und Kontaktseiten der Website in einer crawlbaren Uebersicht.",
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
  "Open Feedback Form": "Feedback-Formular öffnen",
  "Guidance": "Hinweise",
  "Before you submit": "Vor dem Absenden",
  "Short notes for using this form correctly.": "Kurze Hinweise zur korrekten Nutzung dieses Formulars.",
  "How it works": "So funktioniert es",
  "Review how this form works before you start.": "Pruefen Sie vor dem Start, wie dieses Formular funktioniert.",
  "View guidance": "Hinweise anzeigen",
  "Show notes": "Hinweise anzeigen",
  "Click to expand": "Zum Oeffnen klicken",
  "Required fields are marked with a red star.": "Pflichtfelder sind mit einem roten Stern markiert.",
  "Select either the feedback form or the contact form before filling details.": "Waehlen Sie vor dem Ausfuellen entweder das Feedback-Formular oder das Kontaktformular.",
  "Your message is submitted through the website and is not posted publicly.": "Ihre Nachricht wird ueber die Website uebermittelt und nicht oeffentlich angezeigt.",
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
  "Access and handling": "Zugriff und Verarbeitung",
  "Submitted messages are reviewed privately by the site owner as part of the normal contact and feedback process.": "Uebermittelte Nachrichten werden vom Website-Betreiber vertraulich im normalen Kontakt- und Feedbackprozess geprueft.",
  "Handling": "Verarbeitung",
  "Submitted messages are reviewed privately for follow-up when relevant.": "Uebermittelte Nachrichten werden vertraulich geprueft und bei Relevanz weiterverfolgt.",
  "Response note": "Hinweis zur Rueckmeldung",
  "Sending a message does not guarantee an immediate response, but professional enquiries are reviewed carefully.": "Das Senden einer Nachricht garantiert keine sofortige Rueckmeldung, aber professionelle Anfragen werden sorgfaeltig geprueft.",
  "Submission summary": "Uebermittlungsuebersicht",
  "Local overview of successful form submissions recorded in this browser.": "Lokale Uebersicht erfolgreicher Formularuebermittlungen, die in diesem Browser aufgezeichnet wurden.",
  "View submission summary": "Uebermittlungsuebersicht anzeigen",
  "Recorded submissions": "Erfasste Uebermittlungen",
  "Total successful submissions": "Erfolgreiche Uebermittlungen gesamt",
  "Country distribution": "Laenderverteilung",
  "Recorded on this browser only": "Nur in diesem Browser erfasst",
  "No submissions recorded yet.": "Noch keine Eintraege gespeichert.",
  "Refresh status": "Status aktualisieren",
  "Clear status": "Status leeren",
  "Private admin control": "Private Admin-Steuerung",
  "Status refreshed just now.": "Status wurde gerade aktualisiert.",
  "Status cleared. Submission summary reset to zero.": "Status geloescht. Die Uebersicht wurde auf null zurueckgesetzt.",
  "Submission log": "Uebermittlungsprotokoll",
  "Private admin view": "Private Admin-Ansicht",
  "No local submissions available.": "Keine lokalen Uebermittlungen verfuegbar.",
  "Delete": "Loeschen",
  "Entry deleted.": "Eintrag geloescht.",
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
  "Thank you": "Vielen Dank",
  "Your message has been submitted.": "Ihre Nachricht wurde uebermittelt.",
  "Your form was submitted successfully. Thank you for your feedback or enquiry.": "Ihr Formular wurde erfolgreich uebermittelt. Vielen Dank fuer Ihr Feedback oder Ihre Anfrage.",
  "Return to Portfolio": "Zurück zum Portfolio"
});

Object.assign(META_TRANSLATIONS.de.title, {
  "Journey from India to Germany | Sooraj Sudhakaran": "Weg von Indien nach Deutschland | Sooraj Sudhakaran",
  "Feedback and Contact | Sooraj Sudhakaran": "Feedback und Kontakt | Sooraj Sudhakaran",
  "Portfolio Map | Sooraj Sudhakaran": "Portfolio-Map | Sooraj Sudhakaran",
  "Feedback and Contact Form | Sooraj Sudhakaran": "Feedback- und Kontaktformular | Sooraj Sudhakaran",
  "Submission received | Sooraj Sudhakaran": "Uebermittlung erhalten | Sooraj Sudhakaran"
});

Object.assign(META_TRANSLATIONS.de.description, {
  "Journey page covering Sooraj Sudhakaran's path from school and engineering foundations in India to graduate study, robotics software work, and industrial robotics experience in Germany.": "Werdegangsseite zu Sooraj Sudhakarans Weg von schulischen und technischen Grundlagen in Indien bis zu Masterstudium, Robotik-Softwarearbeit und Industrierobotik-Erfahrung in Deutschland.",
  "Feedback and contact form for sharing comments, corrections, recruiter enquiries, or direct contact requests about Sooraj Sudhakaran's portfolio website.": "Feedback- und Kontaktformular zum Teilen von Kommentaren, Korrekturen, Recruiter-Anfragen oder direkten Kontaktanfragen zur Portfolio-Website von Sooraj Sudhakaran.",
  "Portfolio map page linking the main robotics, industrial automation, thesis, project, journey, and contact pages of Sooraj Sudhakaran's website.": "Portfolio-Map-Seite mit Verlinkungen zu den wichtigsten Robotik-, Industrieautomatisierungs-, Thesis-, Projekt-, Werdegangs- und Kontaktseiten der Website von Sooraj Sudhakaran.",
  "Feedback and contact form for sharing comments or sending a direct enquiry about Sooraj Sudhakaran's portfolio website.": "Feedback- und Kontaktformular zum Teilen von Kommentaren oder zum direkten Kontakt bezueglich der Portfolio-Website von Sooraj Sudhakaran.",
  "Confirmation page for successful feedback or contact form submissions on Sooraj Sudhakaran's portfolio website.": "Bestaetigungsseite fuer erfolgreiche Feedback- oder Kontaktformular-Uebermittlungen auf der Portfolio-Website von Sooraj Sudhakaran."
});

function resolveInitialLanguage() {
  const saved = localStorage.getItem(STORAGE_LANGUAGE_KEY);
  return saved === "de" ? "de" : "en";
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

  document.querySelectorAll('a[href^="mailto:soorajsudhakaran1199@gmail.com?subject="]').forEach((link) => {
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
      <span class="lang-flags" aria-hidden="true">🇬🇧</span>
      <span class="lang-code">EN</span>
    </button>
    <button class="lang-option" type="button" data-lang="de" aria-pressed="false">
      <span class="lang-flags" aria-hidden="true">🇩🇪</span>
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
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

function setupThemeToggle() {
  const toggles = document.querySelectorAll("[data-theme-toggle]");
  if (!toggles.length) return;

  toggles.forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme") || "dark";
      const next = current === "dark" ? "light" : "dark";
      applyTheme(next);
      localStorage.setItem(STORAGE_THEME_KEY, next);
    });
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

function setupSmartDetailBack() {
  if (!document.body.classList.contains("detail-page")) return;
  if (document.body.classList.contains("feedback-page")) return;

  const detailPageName = getCurrentPageName();
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

  const origin = getStoredDetailOrigin(detailPageName) || defaultOrigin;
  const lang = resolveInitialLanguage();
  const label = getDetailBackLabel(origin.originType, lang);
  const buttons = document.querySelectorAll(".detail-back, .nav-actions .btn-ghost");

  buttons.forEach((button) => {
    button.setAttribute("href", origin.url);
    button.textContent = label;
    button.addEventListener("click", () => {
      try {
        window.sessionStorage.setItem(
          STORAGE_RETURN_TARGET_KEY,
          JSON.stringify({
            pageName: origin.pageName,
            sectionId: origin.sectionId,
            scrollY: origin.scrollY
          })
        );
      } catch (error) {
        // Ignore storage write issues and allow normal navigation.
      }
    });
  });
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

class ParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.pageMode = document.body.classList.contains("journey-page") ? "journey" : "portfolio";
    this.particles = [];
    this.pointer = { x: null, y: null, radius: 240 };
    this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.particleCount = this.reducedMotion ? 0 : this.getParticleCount();
    this.connectionDistance = this.getConnectionDistance();
    this.animationFrame = null;
    this.orbs = [];
    this.resizeTimer = null;
    this.resizeUiTimer = null;

    if (!this.ctx || this.reducedMotion) return;

    this.resize();
    this.seed();
    this.attachEvents();
    this.animate();
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
        this.particleCount = this.getParticleCount();
        this.connectionDistance = this.getConnectionDistance();
        this.resize();
        this.seed();
      }, 160);
    });

    window.addEventListener("mousemove", (event) => {
      this.pointer.x = event.clientX;
      this.pointer.y = event.clientY;
    });

    window.addEventListener("mouseout", () => {
      this.pointer.x = null;
      this.pointer.y = null;
    });
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  getParticleCount() {
    if (this.pageMode === "journey") {
      return window.innerWidth < 768 ? 40 : 90;
    }
    return window.innerWidth < 768 ? 55 : 130;
  }

  getConnectionDistance() {
    if (this.pageMode === "journey") {
      return window.innerWidth < 768 ? 105 : 150;
    }
    return window.innerWidth < 768 ? 135 : 185;
  }

  seed() {
    this.particles = Array.from({ length: this.particleCount }, () => ({
      x: Math.random() * this.canvas.width,
      y: Math.random() * this.canvas.height,
      r: this.pageMode === "journey" ? (Math.random() > 0.82 ? 2.4 : 1.25) : (Math.random() > 0.8 ? 2.9 : 1.6),
      vx: (Math.random() - 0.5) * (this.pageMode === "journey" ? 0.26 : 0.52),
      vy: (Math.random() - 0.5) * (this.pageMode === "journey" ? 0.26 : 0.52),
      pulse: Math.random() * Math.PI * 2,
    }));
    this.orbs = Array.from({ length: 4 }, (_, index) => ({
      x: (this.canvas.width / 5) * (index + 1),
      y: Math.random() * this.canvas.height,
      r: this.pageMode === "journey"
        ? (window.innerWidth < 768 ? 95 + index * 8 : 135 + index * 14)
        : (window.innerWidth < 768 ? 120 + index * 10 : 180 + index * 20),
      drift: this.pageMode === "journey" ? 0.08 + index * 0.03 : 0.15 + index * 0.04,
      phase: Math.random() * Math.PI * 2,
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

  animate() {
    const { base, accent, glow, accentGlow, point, trail, connection, pointer } = this.colors();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawAtmosphere();

    this.particles.forEach((particle, index) => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.pulse += 0.04;

      if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1;
      if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1;

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

      if (this.pointer.x === null || this.pointer.y === null) return;
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

    this.animationFrame = window.requestAnimationFrame(() => this.animate());
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
    const bandA = this.ctx.createLinearGradient(0, this.canvas.height * 0.28, this.canvas.width, this.canvas.height * 0.42);
    bandA.addColorStop(0, `${base}0)`);
    bandA.addColorStop(0.35, `${base}${bandBase})`);
    bandA.addColorStop(0.65, `${accent}${bandAccent})`);
    bandA.addColorStop(1, `${accent}0)`);
    this.ctx.fillStyle = bandA;
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.canvas.height * 0.25);
    this.ctx.bezierCurveTo(
      this.canvas.width * 0.2,
      this.canvas.height * 0.18,
      this.canvas.width * 0.48,
      this.canvas.height * 0.38,
      this.canvas.width,
      this.canvas.height * 0.24
    );
    this.ctx.lineTo(this.canvas.width, this.canvas.height * 0.4);
    this.ctx.bezierCurveTo(
      this.canvas.width * 0.68,
      this.canvas.height * 0.52,
      this.canvas.width * 0.34,
      this.canvas.height * 0.3,
      0,
      this.canvas.height * 0.42
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
    this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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

  animate() {
    this.ctx.clearRect(0, 0, this.size, this.size);
    this.drawSphere();
    this.drawGrid();
    this.drawLand();
    this.drawRoute();
    this.drawMarker(this.india, "rgba(128, 184, 255, 0.98)");
    this.drawMarker(this.germany, "rgba(89, 226, 188, 0.98)");
    if (!this.reducedMotion) {
      this.rotation += 0.18;
      this.routePhase += 0.035;
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

function setupAdminModeControl() {
  const navActions = document.querySelector(".nav-actions");
  if (!navActions || navActions.querySelector("[data-admin-mode-switch]")) return;

  const lang = document.documentElement.lang === "de" ? "de" : "en";
  const copy = lang === "de"
    ? {
        groupLabel: "Seitenmodus",
        userMode: "Nutzermodus",
        adminMode: "Adminmodus",
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
        userMode: "User mode",
        adminMode: "Admin mode",
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

  const userButton = document.createElement("button");
  userButton.type = "button";
  userButton.className = "admin-mode-option";
  userButton.dataset.mode = "user";
  userButton.textContent = copy.userMode;
  userButton.setAttribute("aria-pressed", String(!isAdminMode));

  const adminButton = document.createElement("button");
  adminButton.type = "button";
  adminButton.className = "admin-mode-option";
  adminButton.dataset.mode = "admin";
  adminButton.textContent = copy.adminMode;
  adminButton.setAttribute("aria-pressed", String(isAdminMode));

  if (isAdminMode) {
    adminButton.classList.add("is-active");
  } else {
    userButton.classList.add("is-active");
  }

  switcher.append(userButton, adminButton);
  navActions.insertBefore(switcher, navActions.firstChild);

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

  userButton.addEventListener("click", async () => {
    if (!getAdminModeState()) return;
    localStorage.removeItem(STORAGE_SITE_UPDATE_OVERRIDE_KEY);

    try {
      const supabase = await getSupabaseClient();
      await supabase.auth.signOut();
    } catch (error) {
      adminSessionActive = false;
    }

    window.location.reload();
  });

  adminButton.addEventListener("click", () => {
    if (getAdminModeState()) return;
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
  };

  const closeModal = () => {
    modal.hidden = true;
    document.body.classList.remove("section-filter-open");
  };

  toggle.addEventListener("click", openModal);

  modal.querySelectorAll("[data-section-filter-close]").forEach((element) => {
    element.addEventListener("click", closeModal);
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
  const formTitle = document.querySelector("[data-feedback-form-title]");
  const formContent = document.querySelector("[data-feedback-form-content]");
  const formNav = document.querySelector("[data-feedback-form-nav]");
  const submitButton = form.querySelector("[data-feedback-submit]");
  const messageTypeFields = Array.from(form.querySelectorAll('[name="messageType"]'));
  const companyField = form.querySelector('[name="company"]');
  const responsePreferenceField = form.querySelector('[name="responsePreference"]');
  const referenceLinkField = form.querySelector('[name="referenceLink"]');
  const phoneField = form.querySelector('[name="phone"]');
  const phoneFieldWrapper = form.querySelector("[data-feedback-phone-field]");
  const feedbackOnlySections = Array.from(form.querySelectorAll("[data-feedback-only]"));
  const feedbackNavLinks = Array.from(document.querySelectorAll("[data-feedback-nav-link='feedback']"));
  const conditionalStars = Array.from(form.querySelectorAll(".feedback-required-star-conditional"));
  const formDescription = document.querySelector("[data-feedback-form-description]");
  const typeDescription = document.querySelector("[data-feedback-type-description]");
  const detailsDescription = document.querySelector("[data-feedback-details-description]");
  const noteTitle = document.querySelector("[data-feedback-note-title]");
  const noteCopy = document.querySelector("[data-feedback-note-copy]");
  const messageDescription = document.querySelector("[data-feedback-message-description]");
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

  const getRequiredFields = () =>
    Array.from(form.querySelectorAll("[required]")).filter((field) => !field.disabled);

  const getSelectedMessageType = () =>
    messageTypeFields.find((field) => field.checked)?.value || "";

  const loadFeedbackStats = () => {
    try {
      const raw = localStorage.getItem(STORAGE_FEEDBACK_STATS_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      if (!parsed || typeof parsed !== "object") {
        return { total: 0, countries: {}, submissions: [] };
      }

      return {
        total: Number(parsed.total) || 0,
        countries: parsed.countries && typeof parsed.countries === "object" ? parsed.countries : {},
        submissions: Array.isArray(parsed.submissions) ? parsed.submissions : []
      };
    } catch {
      return { total: 0, countries: {}, submissions: [] };
    }
  };

  const saveFeedbackStats = (stats) => {
    localStorage.setItem(STORAGE_FEEDBACK_STATS_KEY, JSON.stringify(stats));
  };

  const renderFeedbackStats = () => {
    if (!statsTotal || !statsCountries) return;

    const lang = resolveInitialLanguage();
    const stats = loadFeedbackStats();
    const emptyText = lang === "de" ? "Noch keine Eintraege gespeichert." : "No submissions recorded yet.";
    const emptyLogText = lang === "de" ? "Keine lokalen Uebermittlungen verfuegbar." : "No local submissions available.";
    const countryEntries = Object.entries(stats.countries || {}).sort((a, b) => Number(b[1]) - Number(a[1]));
    const submissionEntries = Array.isArray(stats.submissions) ? [...stats.submissions] : [];

    statsTotal.textContent = String(stats.total || 0);
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

    if (!statsLogList) return;
    statsLogList.innerHTML = "";

    if (!submissionEntries.length) {
      const empty = document.createElement("span");
      empty.className = "feedback-stats-empty";
      empty.textContent = emptyLogText;
      statsLogList.append(empty);
      return;
    }

    submissionEntries
      .sort((a, b) => new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime())
      .forEach((entry) => {
        const item = document.createElement("div");
        item.className = "feedback-stats-log-item";
        const typeLabel = entry.type === "contact"
          ? (lang === "de" ? "Kontaktanfrage" : "Contact request")
          : (lang === "de" ? "Feedback" : "Feedback");
        const timeLabel = entry.submittedAt
          ? formatUpdatedTimestamp(new Date(entry.submittedAt), lang)
          : "";
        const subjectLabel = entry.subject ? `<span>${entry.subject}</span>` : "";

        item.innerHTML = `
          <div class="feedback-stats-log-copy">
            <strong>${typeLabel}</strong>
            <small>${entry.country || "-"}${timeLabel ? ` • ${timeLabel}` : ""}</small>
            ${subjectLabel}
          </div>
          <button class="btn btn-secondary btn-small" type="button" data-feedback-stats-delete="${entry.id}">${lang === "de" ? "Loeschen" : "Delete"}</button>
        `;
        statsLogList.append(item);
      });
  };

  const recordFeedbackStat = (submission) => {
    const normalizedCountry = String(submission?.country || "").trim();
    if (!normalizedCountry) return;

    const stats = loadFeedbackStats();
    stats.total = (Number(stats.total) || 0) + 1;
    stats.countries[normalizedCountry] = (Number(stats.countries[normalizedCountry]) || 0) + 1;
    stats.submissions = Array.isArray(stats.submissions) ? stats.submissions : [];
    stats.submissions.push({
      id: submission?.id || `${Date.now()}`,
      type: submission?.type || "feedback",
      country: normalizedCountry,
      submittedAt: submission?.submittedAt || new Date().toISOString(),
      subject: String(submission?.subject || "").trim(),
      rating: String(submission?.rating || "").trim()
    });
    saveFeedbackStats(stats);
    renderFeedbackStats();
  };

  const refreshStatsStatus = () => {
    renderFeedbackStats();
    if (statsAdminNote) {
      statsAdminNote.textContent = resolveInitialLanguage() === "de"
        ? "Status wurde gerade aktualisiert."
        : "Status refreshed just now.";
    }
  };

  const clearStatsStatus = () => {
    saveFeedbackStats({ total: 0, countries: {}, submissions: [] });
    renderFeedbackStats();
    if (statsAdminNote) {
      statsAdminNote.textContent = resolveInitialLanguage() === "de"
        ? "Status geloescht. Die Uebersicht wurde auf null zurueckgesetzt."
        : "Status cleared. Submission summary reset to zero.";
    }
  };

  const deleteFeedbackStat = (id) => {
    const stats = loadFeedbackStats();
    const submissions = Array.isArray(stats.submissions) ? stats.submissions : [];
    const nextSubmissions = submissions.filter((entry) => entry.id !== id);
    if (nextSubmissions.length === submissions.length) return;

    const nextCountries = {};
    nextSubmissions.forEach((entry) => {
      const key = String(entry.country || "").trim();
      if (!key) return;
      nextCountries[key] = (Number(nextCountries[key]) || 0) + 1;
    });

    saveFeedbackStats({
      total: nextSubmissions.length,
      countries: nextCountries,
      submissions: nextSubmissions
    });
    renderFeedbackStats();

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
    const lang = resolveInitialLanguage();
    const copy = lang === "de"
      ? {
          initialTitle: "Nachrichtentyp waehlen",
          feedbackTitle: "Feedback-Formular",
          contactTitle: "Kontaktformular",
          initialDescription: "Waehlen Sie zum Fortfahren entweder das Feedback-Formular oder das Kontaktformular.",
          feedbackDescription: "Verwenden Sie dieses Formular fuer professionelles Feedback, Korrekturen, Vorschlaege oder Website-Hinweise. Pflichtfelder sind mit einem roten Stern markiert.",
          contactDescription: "Verwenden Sie dieses Formular fuer eine direkte Kontaktanfrage. Es werden nur die wesentlichen Angaben abgefragt.",
          initialTypeDescription: "Waehlen Sie, ob Sie das Feedback-Formular oder das Kontaktformular oeffnen moechten.",
          selectedTypeDescription: "Sie koennen diese Auswahl jederzeit vor dem Absenden aendern.",
          feedbackDetailsDescription: "Geben Sie die Absenderdaten an, die in der Nachricht erscheinen sollen.",
          contactDetailsDescription: "Geben Sie die wesentlichen Kontaktdaten fuer Ihre Anfrage an.",
          feedbackNoteTitle: "Feedback-Formular",
          contactNoteTitle: "Kontaktformular",
          feedbackNoteCopy: "Dieses Formular uebermittelt Ihre Angaben direkt ueber die Website. Nichts wird oeffentlich veroeffentlicht.",
          contactNoteCopy: "Dieses Kontaktformular uebermittelt Ihre Nachricht direkt ueber die Website.",
          feedbackMessageDescription: "Formulieren Sie die Hauptnachricht klar. Nutzen Sie das Feld fuer Verbesserungsvorschlaege bei Empfehlungen oder naechsten Schritten.",
          contactMessageDescription: "Formulieren Sie Ihre Nachricht klar und professionell.",
          feedbackCommentsLabel: 'Kommentar <span class="feedback-required-star" aria-hidden="true">*</span>',
          contactCommentsLabel: 'Nachricht <span class="feedback-required-star" aria-hidden="true">*</span>',
          feedbackCommentsPlaceholder: "Beschreiben Sie Ihr Feedback oder Ihre Beobachtung.",
          contactCommentsPlaceholder: "Schreiben Sie Ihre Nachricht, Anfrage oder Ihren Kontaktgrund.",
          feedbackCommentsHint: "Nennen Sie das Thema, den Vorschlag oder den relevanten Kontext, den Sie teilen möchten.",
          contactCommentsHint: "Nennen Sie den Anlass Ihrer Kontaktaufnahme, relevanten Kontext und den gewuenschten naechsten Schritt.",
          feedbackFooter: "Das Formular wird direkt ueber die Website uebermittelt und stellt Ihre Nachricht dem Website-Betreiber zu.",
          contactFooter: "Das Kontaktformular wird direkt ueber die Website uebermittelt und stellt Ihre Anfrage dem Website-Betreiber zu.",
          feedbackSubmit: "Nachricht absenden",
          contactSubmit: "Formular absenden",
          invalidSummary: "Bitte fuellen Sie die markierten Pflichtfelder korrekt aus.",
          submitting: "Wird gesendet...",
          submitError: "Die Uebermittlung ist fehlgeschlagen. Bitte pruefen Sie Ihre Verbindung und versuchen Sie es erneut."
        }
      : {
          initialTitle: "Choose message type",
          feedbackTitle: "Feedback form",
          contactTitle: "Contact form",
          initialDescription: "Select either Feedback form or Contact form to continue.",
          feedbackDescription: "Use this form for professional feedback, corrections, suggestions, or website observations. Required fields are marked with a red star.",
          contactDescription: "Use this form to send a direct contact request. Only the essential business details are required.",
          initialTypeDescription: "Choose whether you want to open the feedback form or the contact form.",
          selectedTypeDescription: "You can change this selection at any time before submitting.",
          feedbackDetailsDescription: "Provide the sender details that should appear in the message.",
          contactDetailsDescription: "Provide the essential contact details for your business enquiry.",
          feedbackNoteTitle: "Feedback form",
          contactNoteTitle: "Contact form",
          feedbackNoteCopy: "This form submits your details directly through the website. Nothing is published publicly.",
          contactNoteCopy: "This contact form submits your message directly through the website.",
          feedbackMessageDescription: "Write the main message clearly. Use suggested improvement for recommendations or next steps.",
          contactMessageDescription: "Write your message clearly and professionally.",
          feedbackCommentsLabel: 'Comments <span class="feedback-required-star" aria-hidden="true">*</span>',
          contactCommentsLabel: 'Message <span class="feedback-required-star" aria-hidden="true">*</span>',
          feedbackCommentsPlaceholder: "Describe your feedback or observation.",
          contactCommentsPlaceholder: "Write your message, enquiry, or reason for contact.",
          feedbackCommentsHint: "Include the issue, suggestion, or context you want to share.",
          contactCommentsHint: "Include the reason for your contact, relevant context, and any next step you expect.",
          feedbackFooter: "The form submits directly through the website and delivers your message to the site owner.",
          contactFooter: "The contact form submits directly through the website and delivers your enquiry to the site owner.",
          feedbackSubmit: "Submit Message",
          contactSubmit: "Submit Form",
          invalidSummary: "Please complete the highlighted required fields correctly.",
          submitting: "Submitting...",
          submitError: "Submission failed. Please check your connection and try again."
        };

    form.dataset.mode = mode || "unselected";
    if (formCard) {
      formCard.dataset.mode = mode || "unselected";
    }

    if (formContent) {
      formContent.hidden = !hasSelection;
    }

    flowFields.forEach((field) => {
      field.disabled = !hasSelection;
    });

    feedbackOnlySections.forEach((element) => {
      element.hidden = !hasSelection || isContactMode;
      element.querySelectorAll("input, textarea, select").forEach((field) => {
        field.disabled = !hasSelection || isContactMode;
      });
    });

    feedbackNavLinks.forEach((link) => {
      link.hidden = !hasSelection || isContactMode;
    });

    if (formNav) {
      formNav.hidden = !hasSelection || isContactMode;
    }

    if (companyField) {
      companyField.required = hasSelection && isContactMode;
    }

    const responsePreference = String(responsePreferenceField?.value || "");
    const needsCallNumber = hasSelection && !isContactMode && responsePreference === "Schedule a call";
    const needsLinkedProfile = hasSelection && !isContactMode && responsePreference === "LinkedIn response";

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
      const shouldShow = hasSelection && (
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

    if (typeDescription) {
      typeDescription.textContent = hasSelection ? copy.selectedTypeDescription : copy.initialTypeDescription;
    }

    if (detailsDescription) {
      detailsDescription.textContent = isContactMode ? copy.contactDetailsDescription : copy.feedbackDetailsDescription;
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
      updateSubmitState();
    });

    field.addEventListener("blur", () => {
      normalizeFieldValue(field);
      clearFormStatus();
      refreshFieldValidationState(field, form.dataset.showValidation === "true");
      updateSubmitState();
    });
  });

  messageTypeFields.forEach((field) => {
    field.addEventListener("change", () => {
      applyModeState();
      updateSubmitState();
    });
  });

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
    statsRefreshButton.addEventListener("click", () => {
      refreshStatsStatus();
    });
  }
  if (statsClearButton) {
    statsClearButton.hidden = !isAdminMode;
    statsClearButton.addEventListener("click", () => {
      clearStatsStatus();
    });
  }
  if (statsLogList) {
    statsLogList.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const id = target.getAttribute("data-feedback-stats-delete");
      if (!id || !isAdminMode) return;
      deleteFeedbackStat(id);
    });
  }
  applyModeState();
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
    const subjectLine = value("subjectLine");
    const responsePreference = value("responsePreference");
    const timeline = value("timeline");
    const comments = value("comments");
    const suggestion = value("suggestion");
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

    if (subjectLine) {
      lines.push(`${template.labels.subjectLine}: ${subjectLine}`);
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

    lines.push("", `${commentsOutputLabel}:`, comments);

    if (suggestion) {
      lines.push("", `${template.labels.suggestion}:`, suggestion);
    }

    lines.push("", template.closing, fullName || lastName || firstName);

    const finalSubject = subjectLine ? `${baseSubject}: ${subjectLine}` : baseSubject;
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

      recordFeedbackStat({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        type: messageType,
        country,
        submittedAt: new Date().toISOString(),
        subject: subjectLine || category || "",
        rating
      });
      trackAnalyticsEvent("form_submit_success", {
        page_path: window.location.pathname,
        message_type: messageType,
        response_preference: responsePreference || "not_specified",
        has_rating: rating ? "yes" : "no"
      });
      sessionStorage.setItem(
        STORAGE_FEEDBACK_LAST_SUBMISSION_KEY,
        JSON.stringify({
          type: messageType,
          submittedAt: new Date().toISOString()
        })
      );
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

function setupFeedbackThankYouPage() {
  const title = document.querySelector("[data-feedback-thankyou-title]");
  if (!title) return;

  const statusValue = document.querySelector("[data-feedback-thankyou-status]");
  const reviewCountValue = document.querySelector("[data-feedback-thankyou-review-count]");
  const averageRatingValue = document.querySelector("[data-feedback-thankyou-average-rating]");
  const lead = document.querySelector("[data-feedback-thankyou-lead]");
  const panelTriggers = Array.from(document.querySelectorAll("[data-feedback-panel-trigger]"));
  let storedSubmission = null;
  try {
    storedSubmission = JSON.parse(sessionStorage.getItem(STORAGE_FEEDBACK_LAST_SUBMISSION_KEY) || "null");
  } catch {
    storedSubmission = null;
  }

  const mode = (storedSubmission?.type || new URLSearchParams(window.location.search).get("type")) === "contact"
    ? "contact"
    : "feedback";
  const lang = resolveInitialLanguage();
  const submittedAt = storedSubmission?.submittedAt
    ? new Date(storedSubmission.submittedAt)
    : new Date();
  const submittedAtLabel = Number.isNaN(submittedAt.getTime())
    ? ""
    : formatUpdatedTimestamp(submittedAt, lang);
  let storedStats = { total: 0, countries: {}, submissions: [] };
  try {
    storedStats = JSON.parse(localStorage.getItem(STORAGE_FEEDBACK_STATS_KEY) || "null") || storedStats;
  } catch {
    storedStats = { total: 0, countries: {}, submissions: [] };
  }

  const feedbackReviews = Array.isArray(storedStats.submissions)
    ? storedStats.submissions.filter((entry) => entry?.type === "feedback")
    : [];
  const ratings = feedbackReviews
    .map((entry) => Number.parseInt(String(entry?.rating || "").split("/")[0], 10))
    .filter((value) => Number.isFinite(value) && value > 0);
  const averageRating = ratings.length
    ? `${(ratings.reduce((sum, value) => sum + value, 0) / ratings.length).toFixed(1)}/5`
    : "";

  const copy = lang === "de"
    ? {
        feedbackTitle: "Feedback erhalten",
        contactTitle: "Kontaktanfrage erhalten",
        lead: "Ihr Formular wurde erfolgreich gesendet.",
        status: "Erfolgreich gesendet",
        noRatings: "Noch keine Bewertungen"
      }
    : {
        feedbackTitle: "Feedback received",
        contactTitle: "Contact request received",
        lead: "Your form was submitted successfully.",
        status: "Submitted successfully",
        noRatings: "No ratings yet"
      };

  title.textContent = mode === "contact" ? copy.contactTitle : copy.feedbackTitle;
  if (lead) {
    lead.textContent = copy.lead;
  }
  if (statusValue) {
    statusValue.textContent = copy.status;
  }
  if (reviewCountValue) {
    reviewCountValue.textContent = String(feedbackReviews.length);
  }
  if (averageRatingValue) {
    averageRatingValue.textContent = averageRating || copy.noRatings;
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

function loadStoredFeedbackStats() {
  try {
    const raw = localStorage.getItem(STORAGE_FEEDBACK_STATS_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (!parsed || typeof parsed !== "object") {
      return { total: 0, countries: {}, submissions: [] };
    }

    return {
      total: Number(parsed.total) || 0,
      countries: parsed.countries && typeof parsed.countries === "object" ? parsed.countries : {},
      submissions: Array.isArray(parsed.submissions) ? parsed.submissions : []
    };
  } catch {
    return { total: 0, countries: {}, submissions: [] };
  }
}

function setupPublicReviewSummary() {
  const section = document.querySelector("[data-public-review-section]");
  if (!section) return;

  const averageValue = document.querySelector("[data-public-review-average]");
  const metricAverageValue = document.querySelector("[data-public-review-metric-average]");
  const reviewCountValue = document.querySelector("[data-public-review-count]");
  const reachValue = document.querySelector("[data-public-review-reach]");
  const captionValue = document.querySelector("[data-public-review-caption]");
  const distributionList = document.querySelector("[data-public-review-distribution]");
  const countryList = document.querySelector("[data-public-review-countries]");
  const starsShell = document.querySelector("[data-public-review-stars-shell]");
  const starsFill = document.querySelector("[data-public-review-stars-fill]");

  const lang = resolveInitialLanguage();
  const copy = lang === "de"
    ? {
        noRatings: "Noch keine Bewertungen",
        noReviews: "Noch keine öffentlichen Bewertungen.",
        awaiting: "Noch keine bewertete Rückmeldung vorhanden.",
        countries: "Länder",
        basedOn: (count) => `Basierend auf ${count} bewerteten Rückmeldungen`,
        ratingLabel: (value) => `${value} von 5`,
        reviews: "Bewertungen"
      }
    : {
        noRatings: "No ratings yet",
        noReviews: "No public reviews yet.",
        awaiting: "Awaiting first rated review.",
        countries: "countries",
        basedOn: (count) => `Based on ${count} rated reviews`,
        ratingLabel: (value) => `${value} out of 5`,
        reviews: "reviews"
      };

  const stats = loadStoredFeedbackStats();
  const feedbackEntries = Array.isArray(stats.submissions)
    ? stats.submissions.filter((entry) => entry?.type === "feedback")
    : [];
  const ratings = feedbackEntries
    .map((entry) => Number.parseInt(String(entry?.rating || "").split("/")[0], 10))
    .filter((value) => Number.isFinite(value) && value > 0);

  const average = ratings.length
    ? ratings.reduce((sum, value) => sum + value, 0) / ratings.length
    : 0;
  const averageLabel = ratings.length ? `${average.toFixed(1)}/5` : copy.noRatings;
  const reviewCount = feedbackEntries.length;

  const countryCounts = {};
  feedbackEntries.forEach((entry) => {
    const country = String(entry?.country || "").trim();
    if (!country) return;
    countryCounts[country] = (countryCounts[country] || 0) + 1;
  });
  const countryEntries = Object.entries(countryCounts).sort((a, b) => Number(b[1]) - Number(a[1]));
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
        const item = document.createElement("span");
        item.className = "review-country-chip";
        item.textContent = `${country} · ${count}`;
        countryList.append(item);
      });
    }
  }
}

const SITE_UPDATE_TRACKED_FILES = [
  "index.html",
  "journey.html",
  "feedback.html",
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

async function setupLastUpdated() {
  const isAdminMode = getAdminModeState();
  const fallbackModifiedAt = new Date(document.lastModified);
  if (Number.isNaN(fallbackModifiedAt.getTime())) return;

  const lang = document.documentElement.lang === "de" ? "de" : "en";
  const label = lang === "de" ? "Zuletzt aktualisiert" : "Last updated";
  const adminButtonLabel = lang === "de" ? "Update-Zeit aktualisieren" : "Refresh update time";
  const nav = document.querySelector(".nav");
  if (!nav) return;

  let bar = nav.nextElementSibling;
  if (!bar || !bar.classList.contains("top-update-bar")) {
    bar = document.createElement("div");
    bar.className = "top-update-bar";

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
    bar.appendChild(container);
    nav.insertAdjacentElement("afterend", bar);
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

  const storedOverride = isAdminMode ? localStorage.getItem(STORAGE_SITE_UPDATE_OVERRIDE_KEY) : null;
  const overrideDate = storedOverride ? new Date(storedOverride) : null;
  const hasValidOverride = overrideDate && !Number.isNaN(overrideDate.getTime());

  applyUpdateState(hasValidOverride ? overrideDate : fallbackModifiedAt);

  const latestModifiedAt = await resolveLatestSiteUpdate();
  const effectiveDate = hasValidOverride && (!latestModifiedAt || overrideDate > latestModifiedAt)
    ? overrideDate
    : latestModifiedAt;

  if (effectiveDate) {
    applyUpdateState(effectiveDate);
  }

  if (!adminButton) return;
  adminButton.textContent = adminButtonLabel;
  adminButton.hidden = !isAdminMode;
  adminButton.addEventListener("click", () => {
    const now = new Date();
    localStorage.setItem(STORAGE_SITE_UPDATE_OVERRIDE_KEY, now.toISOString());
    applyUpdateState(now);
  });
}

function decorateContactLinks() {
  const specs = [
    {
      match: (href) => href.startsWith("mailto:soorajsudhakaran1199@gmail.com") && href.includes("subject=Request%20for%20CV"),
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
      match: (href, link) => /#about$/.test(href) || /\b(where i fit|wo ich passe|role match)\b/i.test(link.textContent || ""),
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

document.addEventListener("DOMContentLoaded", async () => {
  loadSiteAnalytics();
  setupAnalyticsClickTracking();
  applyTheme(resolveInitialTheme());
  setupLanguageSwitcher();
  setupThemeToggle();
  await initializeAdminAuth();
  setupAdminModeControl();
  setupHomepageSectionFilter();
  setupReveal();
  setupActiveNav();
  setupSectionTargetHighlight();
  setupDetailOriginTracking();
  setupSmartDetailBack();
  setupParticles();
  setupRouteGlobe();
  setupFeedbackForm();
  setupFeedbackThankYouPage();
  setupPublicReviewSummary();
  setupLastUpdated();
  setupStoredReturnPosition();
  decorateContactLinks();
});
