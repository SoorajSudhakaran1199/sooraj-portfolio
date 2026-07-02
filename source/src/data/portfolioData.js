import kebaThesis from '../assets/images/projects/keba-thesis.jpeg';
import vacuumBot from '../assets/images/projects/vaccumbot.jpeg';
import vrWorkshop from '../assets/images/projects/VR.jpeg';
import activeSuspension from '../assets/images/projects/matlab.jpeg';
import serviceRobot from '../assets/images/projects/arduino-service-robot.webp';
import heroSoorajRoboticsCompositeHq from '../assets/images/projects/hero-sooraj-robotics-composite-hq.webp';
import kebaLogo from '../assets/images/logos/keba.png';
import ndtLogo from '../assets/images/logos/ndt Company logo.png';
import thdLogo from '../assets/images/logos/th-deggendorf.png';
import ktuLogo from '../assets/images/logos/APJ_Abdul_Kalam_Technological_University_logo.png';
import rosCertificate from '../assets/documents/certificates/ros_robot_operating_system_edx.pdf';
import teleroboticsCertificate from '../assets/documents/certificates/telerobotics.pdf';
import urRobotCertificate from '../assets/documents/certificates/ur robot.pdf';

export const personal = {
  name: 'Sooraj Sudhakaran',
  initials: 'S',
  role: 'Robotics & Automation Engineer',
  eyebrow: 'Robotics & Automation Engineer',
  headline: 'Hi, I am Sooraj Sudhakaran',
  subtitle:
    'Robotics, automation, and simulation engineering for systems that move from planning logic to reliable execution.',
  intro:
    'I build robot workflows, ROS-driven autonomy, and validation tools with the discipline required for industrial environments.',
  summary:
    'Robotics and mechatronics engineer based in Stuttgart, with an India-to-Germany path across industrial robotics, ROS autonomy, simulation, and deployment-focused engineering.',
  location: 'Stuttgart, Germany',
  origin: 'Kerala, India',
  availability: 'Available for full-time Robotics, Automation, and Simulation Engineering roles',
  email: 'soorajsudhakaran1199@gmail.com',
  phone: '',
  resumeUrl: 'Sooraj-Sudhakaran-Resume-Overview.html',
  websiteUpdatedAt: '2026-06-30T12:00:00+02:00',
  social: {
    linkedin: 'https://www.linkedin.com/in/sooraj-sudhakaran1999',
    github: 'https://github.com/SoorajSudhakaran1199',
    email: 'mailto:soorajsudhakaran1199@gmail.com',
  },
};

export const heroAssets = {
  composite: heroSoorajRoboticsCompositeHq,
};

export const navItems = [
  { label: 'About', href: '#about', id: 'about' },
  { label: 'Projects', href: '#projects', id: 'projects' },
  { label: 'Skills', href: '#skills', id: 'skills' },
  { label: 'Experience', href: '#experience', id: 'experience' },
  { label: 'Education', href: '#education', id: 'education' },
  { label: 'Recommendations', href: '#recommendations', id: 'recommendations' },
  { label: 'Contact', href: '#contact', id: 'contact' },
];

export const skillChips = ['ROS', 'Python', 'C++', 'MATLAB', 'Unity', 'Simulink'];

export const stats = [
  { label: 'Robotics Systems', value: 5, suffix: '+', detail: 'ROS, industrial robotics, service robotics, and simulation work', icon: 'Bot' },
  { label: 'Engineering Years', value: 3, suffix: '+', detail: 'Industrial, academic, and deployment-oriented engineering practice', icon: 'BriefcaseBusiness' },
  { label: 'Countries', value: 2, suffix: '', detail: 'Engineering experience shaped across India and Germany', icon: 'Globe2' },
  { label: 'Automation Focus', value: 100, suffix: '%', detail: 'Built around practical robotic systems and disciplined execution', icon: 'Zap' },
];

export const projects = [
  {
    title: 'KEBA Industrial Robotics Workflow',
    featured: true,
    image: kebaThesis,
    period: 'September 2025 to March 2026',
    priority: 'Flagship industrial robotics case',
    description:
      'A 6-axis industrial robot workflow connecting motion planning, drag&bot validation, waypoint generation, and cell-aware execution logic.',
    result:
      'Delivered a lightweight joint-path planner that generates interpolated waypoints for robot-program simulation validation.',
    cardBullets: [
      '6-axis industrial robot workflow with planning, validation, and execution context.',
      'Waypoint interpolation and robot-program simulation validation for repeatable review.',
      'Built around KEBA/drag&bot industrial automation expectations.',
    ],
    evidenceBullets: [
      'Motion-planning logic',
      'Simulation validation',
      'Industrial workflow context',
    ],
    proofLinks: [],
    tech: ['KEBA', 'drag&bot', 'Python', 'ROS 1', 'ROS 2', 'WebSockets'],
    caseStudy: {
      focus: 'Industrial robot workflow for machine-operation scenarios',
      problem:
        'Industrial robot tasks need a repeatable way to move from planned joint motion into validated simulation data without losing deployment context.',
      role:
        'Designed and implemented the planning logic, waypoint interpolation flow, validation structure, and recruiter-readable thesis case study around the KEBA/drag&bot environment.',
      architecture:
        'Planning input -> joint-path interpolation -> waypoint generation -> drag&bot robot-program simulation -> deployment-aware review.',
      toolsUsed: ['Python', 'KEBA context', 'drag&bot', 'ROS concepts', 'WebSockets', 'Robot-program simulation workflow'],
      improvement:
        'Extend the workflow with deeper collision-check feedback, richer visualization, and a tighter bridge from simulation output into controller-ready execution steps.',
      challenge:
        'Translate a 6-axis robot workflow into a validated planning path that can connect motion logic, waypoint generation, and simulation review.',
      approach: [
        'Structured the workflow around planning, robot-program simulation validation, and deployment-aware waypoint review.',
        'Built a lightweight joint-path planner to generate interpolated robot waypoints for repeatable testing.',
        'Kept the logic aligned with KEBA and drag&bot context so the work remains relevant to industrial robotics environments.',
      ],
      deliverables: [
        'Joint-path planning workflow',
        'Simulation-ready robot-program validation',
        'Collision-aware execution thinking',
        'Recruiter-readable thesis case study',
      ],
      details: [
        'Workflow designed around robot planning, waypoint interpolation, and validation readiness.',
        'Simulation validation supports repeatable review of generated joint paths in a robot-programming workflow.',
        'The project connects robotics software thinking with industrial controller and deployment context.',
      ],
      impact:
        'Shows the strongest industrial robotics signal in the portfolio: planning logic, simulation validation, and practical deployment discipline.',
    },
  },
  {
    title: 'Autonomous Vacuum Robot',
    image: vacuumBot,
    period: 'March 2024 to June 2024',
    priority: 'ROS autonomy proof',
    description:
      'A ROS autonomy stack for mapping, localization, obstacle-aware navigation, and simulated cleaning coverage.',
    result:
      'Built an end-to-end navigation flow from SLAM map generation to sensor-informed path execution.',
    cardBullets: [
      'ROS navigation flow connecting SLAM, localization, and obstacle-aware movement.',
      'Gazebo/RViz validation for robot state, mapping, and path behavior.',
      'Clear mobile-robot autonomy evidence with a public GitHub reference.',
    ],
    evidenceBullets: [
      'SLAM mapping',
      'Navigation stack',
      'GitHub source reference',
    ],
    tech: ['ROS', 'Gazebo', 'RViz', 'Python', 'SLAM'],
    sourceUrl: 'https://github.com/SoorajSudhakaran1199/vaccumbot',
    sourceLabel: 'Open GitHub',
    proofLinks: [
      { type: 'github', url: 'https://github.com/SoorajSudhakaran1199/vaccumbot' },
    ],
    caseStudy: {
      focus: 'ROS autonomy stack for mobile robot navigation',
      problem:
        'A mobile robot needs a complete autonomy flow that connects mapping, localization, obstacle-aware movement, and navigation validation.',
      role:
        'Built and organized the ROS-based autonomy workflow, connected simulation and visualization tools, and documented the navigation behavior as a technical case study.',
      architecture:
        'Sensor/simulation input -> SLAM map generation -> localization -> path planning -> obstacle-aware navigation -> Gazebo/RViz validation.',
      toolsUsed: ['ROS', 'Gazebo', 'RViz', 'Python', 'SLAM', 'Navigation stack concepts'],
      improvement:
        'Improve robustness with stronger sensor-fusion handling, cleaner recovery behavior, and broader real-world test scenarios beyond simulation.',
      challenge:
        'Create a mobile robotics workflow that can map an environment, localize, avoid obstacles, and navigate using a ROS-based stack.',
      approach: [
        'Used SLAM, localization, and path-planning concepts to connect mapping with navigation behavior.',
        'Validated robot state and navigation behavior with Gazebo and RViz tooling.',
        'Focused on an end-to-end autonomy flow instead of isolated feature demonstrations.',
      ],
      deliverables: [
        'ROS navigation workflow',
        'SLAM-based mapping path',
        'Obstacle-aware movement logic',
        'GitHub project reference',
      ],
      details: [
        'Uses ROS ecosystem tooling to connect mapping, localization, navigation, and visualization.',
        'Gazebo and RViz provide simulation and debugging context for robot behavior.',
        'The project demonstrates autonomy fundamentals through a complete mobile robot flow.',
      ],
      impact:
        'Demonstrates practical autonomy fundamentals across ROS, simulation, perception context, and navigation execution.',
    },
  },
  {
    title: 'Automated Arduino-Based Service Robot',
    image: serviceRobot,
    period: 'Mechatronics project',
    priority: 'Embedded mechatronics proof',
    description:
      'An Arduino-based service robot concept using line tracking, sensor integration, and structured movement logic for hospitality-support scenarios.',
    result:
      'Built a working mechatronic robot prototype that connects embedded control, sensor feedback, and physical robot behavior.',
    cardBullets: [
      'Physical robot prototype using Arduino control and sensor feedback.',
      'Line-tracking behavior tied to motor control and structured movement logic.',
      'Hands-on hardware signal across wiring, testing, and mechatronic iteration.',
    ],
    evidenceBullets: [
      'Embedded control',
      'Sensor feedback',
      'Physical prototype',
    ],
    proofLinks: [],
    tech: ['Arduino', 'Embedded Control', 'Sensors', 'Line Tracking', 'Robot Design'],
    caseStudy: {
      focus: 'Embedded mechatronic robot prototype for service automation',
      problem:
        'A physical service robot concept needs dependable embedded behavior that can follow a path, react to sensor input, and demonstrate useful automation logic.',
      role:
        'Built the prototype logic around Arduino control, sensor feedback, line-following behavior, physical testing, and mechatronic iteration.',
      architecture:
        'Sensor input -> Arduino decision logic -> motor control -> line-tracking movement -> physical behavior validation.',
      toolsUsed: ['Arduino', 'Embedded C/C++ concepts', 'IR/line sensors', 'Motor control', 'Robot chassis', 'Prototype testing'],
      improvement:
        'Add stronger obstacle handling, modular wiring, battery-state monitoring, and a cleaner enclosure for a more production-like prototype.',
      challenge:
        'Build a compact service robot concept that can follow a defined path, react to sensor input, and demonstrate practical automation behavior.',
      approach: [
        'Used Arduino-based control logic to coordinate movement behavior and sensor-driven decisions.',
        'Integrated line-tracking and sensor feedback to support structured navigation in a controlled environment.',
        'Focused on a physical prototype that demonstrates mechatronics fundamentals rather than a purely software simulation.',
      ],
      deliverables: [
        'Arduino-based robot prototype',
        'Line-tracking behavior',
        'Sensor-integrated movement logic',
        'Mechatronic service-robot concept',
      ],
      details: [
        'Physical robot behavior is driven by embedded control logic rather than a visual-only concept.',
        'Sensor feedback supports line-following behavior in a constrained operating path.',
        'The project strengthens the portfolio with hands-on hardware, wiring, testing, and mechatronic iteration.',
      ],
      impact:
        'Adds a hands-on embedded robotics signal to the portfolio, showing Sooraj can work from physical hardware behavior through control logic.',
    },
  },
  {
    title: 'VR Machine Operation Workshop',
    image: vrWorkshop,
    period: 'March 2024 to June 2024',
    priority: 'Simulation and XR proof',
    description:
      'An immersive Unity/XR machine-operation workshop translating industrial procedures into an interactive training environment.',
    result:
      'Connected spatial interaction, realistic machine motion, and workshop flow into a usable simulation experience.',
    cardBullets: [
      'Unity/XR training workflow for industrial machine-operation procedures.',
      'Spatial interaction and guided process flow built into a usable simulation.',
      'Shows simulation communication for engineering and training contexts.',
    ],
    evidenceBullets: [
      'Unity simulation',
      'XR interaction flow',
      'Training UX',
    ],
    proofLinks: [],
    tech: ['Unity', 'C#', 'VR', 'XR', 'Simulation'],
    caseStudy: {
      focus: 'Immersive simulation for machine-operation training',
      problem:
        'Industrial machine-operation steps can be difficult to communicate through static documentation, especially when spatial interaction and process flow matter.',
      role:
        'Developed the Unity/XR simulation environment, interaction flow, machine-operation logic, and training-oriented user experience.',
      architecture:
        'Unity scene model -> interaction triggers -> machine-operation sequence -> user feedback -> VR/XR training flow.',
      toolsUsed: ['Unity', 'C#', 'VR/XR interaction', '3D scene design', 'Simulation logic', 'Training UX'],
      improvement:
        'Add analytics for trainee actions, more guided error states, and a richer library of machine-operation scenarios.',
      challenge:
        'Turn machine-operation logic into an interactive workshop where users can understand process flow through spatial interaction.',
      approach: [
        'Built the training environment in Unity with VR/XR interaction patterns.',
        'Mapped machine-operation steps into a guided simulation flow with realistic movement behavior.',
        'Balanced technical simulation detail with usability for training and demonstration.',
      ],
      deliverables: [
        'Unity workshop environment',
        'VR/XR interaction flow',
        'Machine-operation simulation logic',
        'Training-focused user experience',
      ],
      details: [
        'Unity and C# were used to structure interaction, scene behavior, and machine-operation flow.',
        'The simulation translates technical machine steps into an immersive user-facing training experience.',
        'The project shows the ability to communicate engineering systems through spatial simulation.',
      ],
      impact:
        'Connects robotics-adjacent simulation, interaction design, and industrial training into a polished engineering presentation.',
    },
  },
  {
    title: 'Active Suspension System Modeling',
    image: activeSuspension,
    period: 'October 2023 to January 2024',
    priority: 'Controls and modeling proof',
    description:
      'A MATLAB/Simulink model of active suspension dynamics with hydraulic actuation and system-response analysis.',
    result:
      'Created a structured simulation model for comparing dynamic suspension behavior and control response.',
    cardBullets: [
      'MATLAB/Simulink model for active suspension response analysis.',
      'Hydraulic actuation and control behavior represented in simulation.',
      'Connects mechanical engineering fundamentals with control-system thinking.',
    ],
    evidenceBullets: [
      'Dynamic modeling',
      'Control response',
      'Simulation analysis',
    ],
    proofLinks: [],
    tech: ['MATLAB', 'Simulink', 'Control Modeling', 'Simulation'],
    caseStudy: {
      focus: 'Dynamic system modeling and simulation response analysis',
      problem:
        'Active suspension behavior needs a structured model to compare dynamic response, hydraulic actuation, and control behavior before physical implementation.',
      role:
        'Modeled the system in MATLAB/Simulink, structured the actuation and dynamic-response analysis, and interpreted simulation behavior.',
      architecture:
        'Vehicle/system inputs -> dynamic suspension model -> hydraulic actuation representation -> control response -> simulation output analysis.',
      toolsUsed: ['MATLAB', 'Simulink', 'Control modeling', 'Hydraulic system representation', 'Response analysis'],
      improvement:
        'Add deeper controller tuning, parameter sensitivity analysis, and comparison against measured or reference suspension data.',
      challenge:
        'Model active suspension behavior with hydraulic actuation and analyze system response using MATLAB/Simulink.',
      approach: [
        'Represented dynamic system behavior through a structured Simulink model.',
        'Used simulation outputs to compare response characteristics and control behavior.',
        'Applied mechanical-system understanding to a controls and simulation-focused problem.',
      ],
      deliverables: [
        'MATLAB/Simulink model',
        'Hydraulic actuation representation',
        'Dynamic response analysis',
        'Control-modeling project reference',
      ],
      details: [
        'The model represents mechanical dynamics and hydraulic actuation in a simulation-first workflow.',
        'Simulink outputs support analysis of response behavior and control-system characteristics.',
        'The project links mechanical engineering fundamentals with simulation and controls thinking.',
      ],
      impact:
        'Shows simulation discipline, control-modeling fundamentals, and the mechanical engineering foundation behind the robotics profile.',
    },
  },
];

export const skillGroups = [
  {
    title: 'Robotics',
    icon: 'Bot',
    summary: 'Robot behavior, planning, navigation, and execution logic for practical autonomy.',
    skills: ['ROS', 'ROS 2', 'SLAM', 'Navigation', 'Motion planning', 'Collision-aware execution'],
  },
  {
    title: 'Programming',
    icon: 'Code2',
    summary: 'Implementation stack for robotics tools, simulation interfaces, and control logic.',
    skills: ['Python', 'C++', 'C#', 'MATLAB', 'WebSockets', 'OpenCV'],
  },
  {
    title: 'Simulation',
    icon: 'Boxes',
    summary: 'Simulation-led design, validation, and iteration across robotic and dynamic systems.',
    skills: ['Gazebo', 'RViz', 'Unity', 'VR/XR', 'MATLAB/Simulink', 'Dynamic modeling'],
  },
  {
    title: 'Automation',
    icon: 'Workflow',
    summary: 'Industrial robotics workflows, controller context, and deployment-ready thinking.',
    skills: ['Industrial robotics', 'KEBA systems', 'drag&bot', 'HMI/controller training', 'Workflow automation'],
  },
  {
    title: 'Tools',
    icon: 'Wrench',
    summary: 'Engineering design, validation, and development environments used across projects.',
    skills: ['Git/GitHub', 'Ubuntu/Linux', 'SOLIDWORKS', 'AutoCAD', 'ANSYS', 'Blender'],
  },
];

export const experiences = [
  {
    role: 'Working Student, Industrial Robotics',
    company: 'KEBA Group',
    date: 'Current role',
    location: 'Stuttgart, Baden-Württemberg, Germany',
    logo: kebaLogo,
    description:
      'Industrial robotics and automation work in a live engineering environment, focused on reliable implementation, robot workflows, and deployment context.',
    highlights: ['Industrial robotics', 'Robot programming', 'Automation workflows', 'Deployment context'],
    details: {
      focus: 'Industrial robotics implementation inside a professional automation environment.',
      responsibilities: [
        'Support robotics and automation work connected to industrial implementation and deployment context.',
        'Contribute to robot workflow thinking, system reliability, and practical engineering execution.',
        'Work with a professional engineering rhythm shaped by documentation, review, and implementation discipline.',
      ],
      outcomes: [
        'Strengthened hands-on exposure to industrial robotics systems and automation workflows.',
        'Built stronger context around how robotics logic moves from prototype thinking into deployment-aware engineering.',
        'Developed a recruiter-relevant profile around robot programming, workflow validation, and industrial execution.',
      ],
      environment: ['Industrial robotics', 'Automation workflows', 'Robot programming', 'Deployment context'],
    },
  },
  {
    role: 'Master Thesis - Industrial Robotics / KEBA Group',
    company: 'KEBA Group and drag&bot environment',
    date: 'September 2025 to March 2026',
    location: 'Stuttgart, Germany',
    logo: kebaLogo,
    description:
      'Developed a programming-oriented 6-axis industrial robot workflow for machine operation, including joint/path planning, waypoint generation, collision-zone logic, re-grip sequencing, drag&bot validation, and robot-program simulation validation.',
    highlights: ['6-axis robot programming', 'Joint/path planner', 'drag&bot cell validation', 'Industrial machine operation'],
    details: {
      focus: 'Master thesis work connecting industrial 6-axis robot programming, machine-operation workflow design, and simulation-backed validation.',
      responsibilities: [
        'Designed an industrial machine-operation workflow around 6-axis manipulator motion, joint/path planning, waypoint generation, and validation readiness.',
        'Developed a lightweight robot path planner for interpolated waypoint generation and robot-program simulation review.',
        'Structured collision-zone thinking, re-grip sequencing, drag&bot cell validation, and execution-oriented robot programming logic into a cohesive thesis workflow.',
      ],
      outcomes: [
        'Produced the strongest industrial robotics case study in the portfolio.',
        'Demonstrated practical robot-programming logic, workflow architecture, and simulation validation in a realistic 6-axis industrial robotics context.',
        'Connected academic thesis execution with industrial automation expectations around machine tending, cell validation, and execution-ready review.',
      ],
      environment: ['KEBA context', 'drag&bot cell validation', 'Python', '6-axis robot programming', 'Industrial automation workflow'],
    },
  },
  {
    role: 'Non-Destructive Testing Technician',
    company: 'United Engineering and Construction Co.',
    date: 'February 2022 to September 2022',
    location: 'Kochi, India',
    logo: ndtLogo,
    description:
      'Built industrial discipline through inspection activity, technical reporting, quality procedures, and accountability in field engineering conditions.',
    highlights: ['NDT inspection', 'Quality procedures', 'Technical reporting', 'Industrial discipline'],
    details: {
      focus: 'Field-level engineering discipline through inspection, documentation, and quality-focused industrial work.',
      responsibilities: [
        'Supported inspection activity under industrial quality and safety expectations.',
        'Prepared technical reporting and worked with procedure-driven engineering documentation.',
        'Operated in field conditions where accuracy, accountability, and process discipline mattered.',
      ],
      outcomes: [
        'Built a strong foundation in industrial discipline before moving deeper into robotics and automation.',
        'Developed careful documentation habits and practical awareness of real engineering environments.',
        'Added field-level quality experience to the robotics and simulation profile.',
      ],
      environment: ['NDT inspection', 'Quality procedures', 'Technical reports', 'Field engineering'],
    },
  },
];

export const education = [
  {
    degree: 'M.Eng. Mechatronics and Cyber-Physical Systems',
    university: 'Technische Hochschule Deggendorf',
    specialization: 'Robotics, autonomous systems, cyber-physical systems, additive manufacturing, and human-machine interaction.',
    country: 'Germany',
    year: 'March 2023 to Present',
    logo: thdLogo,
    url: 'https://www.th-deg.de/',
  },
  {
    degree: 'B.Tech. Mechanical Engineering',
    university: 'APJ Abdul Kalam Technological University',
    specialization: 'Mechanical engineering foundation across CAD, CAE, programming fundamentals, thermal engineering, fluid systems, and core design principles.',
    country: 'India',
    year: 'August 2017 to July 2021',
    logo: ktuLogo,
    url: 'https://ktu.edu.in/university/about',
  },
];

export const certificates = [
  {
    title: 'Robot Operating System, edX',
    description: 'Structured ROS training aligned with robotics workflows, autonomy concepts, and practical system integration.',
    url: rosCertificate,
  },
  {
    title: 'Telerobotics',
    description: 'Robotics learning focused on remote operation, human-in-the-loop systems, and teleoperation fundamentals.',
    url: teleroboticsCertificate,
  },
  {
    title: 'Universal Robots Core Training',
    description: 'Industrial robot training signal supporting practical robot operation, setup, and automation workflow understanding.',
    url: urRobotCertificate,
  },
  {
    title: 'Non-Destructive Testing Level 2',
    description: 'Industrial quality and inspection background supporting structured engineering judgment and technical reporting.',
    url: 'https://certification.asnt.org/certification/asnt-ndt-level-ii-',
  },
];

export const recommendations = [
  {
    verified: true,
    name: 'Saif Abdullah',
    role: 'Robotic Software Engineer',
    company: 'KEBA AG',
    quote:
      'It is a pleasure having Sooraj in our department for his Master’s work. Even in the early stages of his thesis, he has proven to be a highly motivated and collaborative team member. He bridges the gap between robotics theory and practical coding exceptionally well. His proactive approach to problem-solving and his dedication to high-quality work make him a great asset to our current project.',
    avatar: null,
    linkedin: '',
  },
  {
    placeholder: true,
    name: 'Industrial Reference Slot',
    role: 'Engineering lead or collaborator',
    company: 'Approved source pending',
    quote:
      'Prepared for a real professional reference connected to robotics, automation, industrial execution, or project collaboration.',
    avatar: null,
    linkedin: personal.social.linkedin,
  },
  {
    placeholder: true,
    name: 'Academic Reference Slot',
    role: 'Professor or thesis reviewer',
    company: 'Approved source pending',
    quote:
      'Reserved for a verified academic recommendation. No rating, invented quote, or unapproved testimonial is shown here.',
    avatar: null,
    linkedin: personal.social.linkedin,
  },
];

const localizedData = {
  de: {
    personal: {
      role: 'Robotik- & Automationsingenieur',
      eyebrow: 'Robotik- & Automationsingenieur',
      subtitle:
        'Robotik, Automation und Simulation Engineering für Systeme von Planungslogik bis zuverlässiger Ausführung.',
      intro:
        'Ich entwickle Robotik-Workflows, ROS-basierte Autonomie und Validierungstools mit industrieller Disziplin.',
      summary:
        'Robotik- und Mechatronikingenieur in Stuttgart mit einem Indien-Deutschland-Weg über Industrierobotik, ROS-Autonomie, Simulation und umsetzungsnahes Engineering.',
      location: 'Stuttgart, Deutschland',
      origin: 'Kerala, Indien',
      availability: 'Offen für Vollzeitrollen in Robotik, Automation und Simulation Engineering',
    },
    stats: [
      { label: 'Robotiksysteme', detail: 'ROS, Industrierobotik, Service-Robotik und Simulationsarbeit' },
      { label: 'Engineering-Jahre', detail: 'Industrielle, akademische und umsetzungsorientierte Engineering-Praxis' },
      { label: 'Länder', detail: 'Engineering-Erfahrung geprägt durch Indien und Deutschland' },
      { label: 'Automationsfokus', detail: 'Auf praktische Robotiksysteme und disziplinierte Umsetzung ausgerichtet' },
    ],
    projects: [
      {
        title: 'KEBA Industrierobotik-Workflow',
        period: 'September 2025 bis März 2026',
        priority: 'Flagship Case für Industrierobotik',
        description:
          'Ein 6-Achs-Industrieroboter-Workflow, der Bewegungsplanung, drag&bot-Validierung, Wegpunktgenerierung und zellbewusste Ausführungslogik verbindet.',
        result:
          'Entwicklung eines schlanken Joint-Path-Planners, der interpolierte Wegpunkte für Roboterprogramm-Simulationsvalidierung erzeugt.',
        cardBullets: [
          '6-Achs-Industrieroboter-Workflow mit Planung, Validierung und Ausführungskontext.',
          'Wegpunkt-Interpolation und Roboterprogramm-Simulationsvalidierung für wiederholbare Prüfung.',
          'Auf KEBA/drag&bot und industrielle Automationserwartungen ausgerichtet.',
        ],
        evidenceBullets: [
          'Motion-Planning-Logik',
          'Simulationsvalidierung',
          'Industrieller Workflow-Kontext',
        ],
        sourceLabel: 'Quelle öffnen',
        caseStudy: {
          focus: 'Industrieller Roboter-Workflow für Maschinenbedienungsszenarien',
          problem:
            'Industrielle Roboteraufgaben brauchen einen wiederholbaren Weg von geplanter Gelenkbewegung zu validierten Simulationsdaten, ohne den Deployment-Kontext zu verlieren.',
          role:
            'Planungslogik, Wegpunkt-Interpolation, Validierungsstruktur und eine recruiter-lesbare Thesis Case Study rund um KEBA/drag&bot entworfen und umgesetzt.',
          architecture:
            'Planungseingabe -> Joint-Path-Interpolation -> Wegpunktgenerierung -> drag&bot-Roboterprogramm-Simulation -> deployment-bewusste Prüfung.',
          toolsUsed: ['Python', 'KEBA-Kontext', 'drag&bot', 'ROS-Konzepte', 'WebSockets', 'Roboterprogramm-Simulationsworkflow'],
          improvement:
            'Den Workflow mit tieferem Collision-Check-Feedback, stärkerer Visualisierung und einer engeren Brücke von Simulation zu controllerbereiten Ausführungsschritten erweitern.',
          challenge:
            'Einen 6-Achs-Roboter-Workflow in einen validierten Planungspfad übersetzen, der Bewegungslogik, Wegpunktgenerierung und Simulationsprüfung verbindet.',
          approach: [
            'Workflow um Planung, Roboterprogramm-Simulationsvalidierung und deployment-bewusste Wegpunktprüfung strukturiert.',
            'Einen schlanken Joint-Path-Planner zur Erzeugung interpolierter Roboterwegpunkte für wiederholbare Tests aufgebaut.',
            'Logik im KEBA- und drag&bot-Kontext gehalten, damit die Arbeit für industrielle Robotikumgebungen relevant bleibt.',
          ],
          deliverables: [
            'Joint-Path-Planungsworkflow',
            'Simulationsfähige Roboterprogramm-Validierung',
            'Kollisionsbewusstes Ausführungsdenken',
            'Recruiter-lesbare Thesis Case Study',
          ],
          details: [
            'Workflow um Roboterplanung, Wegpunkt-Interpolation und Validierungsbereitschaft aufgebaut.',
            'Simulationsvalidierung unterstützt wiederholbare Prüfung generierter Joint Paths in einem Roboterprogrammierungsworkflow.',
            'Das Projekt verbindet Robotiksoftware-Denken mit industriellem Controller- und Deployment-Kontext.',
          ],
          impact:
            'Zeigt das stärkste Industrierobotik-Signal im Portfolio: Planungslogik, Simulationsvalidierung und praktische Deployment-Disziplin.',
        },
      },
      {
        title: 'Autonomer Vakuumroboter',
        period: 'März 2024 bis Juni 2024',
        priority: 'ROS-Autonomie-Beleg',
        description:
          'Ein ROS-Autonomie-Stack für Mapping, Lokalisierung, hindernisbewusste Navigation und simulierte Reinigungsabdeckung.',
        result:
          'Aufbau eines End-to-End-Navigationsflusses von SLAM-Kartenerstellung bis sensorinformierter Pfadausführung.',
        cardBullets: [
          'ROS-Navigationsfluss mit SLAM, Lokalisierung und hindernisbewusster Bewegung.',
          'Gazebo/RViz-Validierung für Roboterzustand, Mapping und Pfadverhalten.',
          'Klarer Mobile-Robot-Autonomiebeleg mit öffentlicher GitHub-Referenz.',
        ],
        evidenceBullets: [
          'SLAM-Mapping',
          'Navigation Stack',
          'GitHub-Quellreferenz',
        ],
        sourceLabel: 'GitHub öffnen',
        caseStudy: {
          focus: 'ROS-Autonomie-Stack für mobile Roboternavigation',
          problem:
            'Ein mobiler Roboter braucht einen vollständigen Autonomiefluss, der Mapping, Lokalisierung, hindernisbewusste Bewegung und Navigationsvalidierung verbindet.',
          role:
            'ROS-basierten Autonomie-Workflow aufgebaut, Simulations- und Visualisierungstools verbunden und das Navigationsverhalten als technische Case Study dokumentiert.',
          architecture:
            'Sensor-/Simulationseingabe -> SLAM-Kartenerstellung -> Lokalisierung -> Pfadplanung -> hindernisbewusste Navigation -> Gazebo/RViz-Validierung.',
          toolsUsed: ['ROS', 'Gazebo', 'RViz', 'Python', 'SLAM', 'Navigation-Stack-Konzepte'],
          improvement:
            'Robustheit durch stärkere Sensorfusion, saubereres Recovery-Verhalten und breitere reale Testszenarien über Simulation hinaus verbessern.',
          challenge:
            'Einen Mobile-Robotics-Workflow erstellen, der Umgebung kartiert, lokalisiert, Hindernisse vermeidet und mit ROS-basierter Architektur navigiert.',
          approach: [
            'SLAM-, Lokalisierungs- und Pfadplanungskonzepte genutzt, um Mapping mit Navigationsverhalten zu verbinden.',
            'Roboterzustand und Navigationsverhalten mit Gazebo und RViz validiert.',
            'Fokus auf einen vollständigen Autonomiefluss statt isolierter Feature-Demos gelegt.',
          ],
          deliverables: [
            'ROS-Navigationsworkflow',
            'SLAM-basierter Mapping-Pfad',
            'Hindernisbewusste Bewegungslogik',
            'GitHub-Projektreferenz',
          ],
          details: [
            'Nutzt ROS-Ökosystem-Tools für Mapping, Lokalisierung, Navigation und Visualisierung.',
            'Gazebo und RViz liefern Simulations- und Debugging-Kontext für Roboterverhalten.',
            'Das Projekt zeigt Autonomiegrundlagen in einem vollständigen Mobile-Robot-Flow.',
          ],
          impact:
            'Demonstriert praktische Autonomiegrundlagen über ROS, Simulation, Perzeptionskontext und Navigationsausführung.',
        },
      },
      {
        title: 'Arduino-basierter Service-Roboter',
        period: 'Mechatronikprojekt',
        priority: 'Embedded-Mechatronik-Beleg',
        description:
          'Ein Arduino-basierter Service-Roboter mit Linienverfolgung, Sensorintegration und strukturierter Bewegungslogik für Hospitality-Szenarien.',
        result:
          'Aufbau eines funktionierenden mechatronischen Prototyps, der Embedded Control, Sensorfeedback und physisches Roboterverhalten verbindet.',
        cardBullets: [
          'Physischer Roboterprototyp mit Arduino-Steuerung und Sensorfeedback.',
          'Linienverfolgung verbunden mit Motorsteuerung und strukturierter Bewegungslogik.',
          'Hands-on-Hardwaresignal über Verkabelung, Tests und mechatronische Iteration.',
        ],
        evidenceBullets: [
          'Embedded Control',
          'Sensorfeedback',
          'Physischer Prototyp',
        ],
        tech: ['Arduino', 'Embedded Control', 'Sensoren', 'Linienverfolgung', 'Robotikdesign'],
        caseStudy: {
          focus: 'Embedded-mechatronischer Prototyp für Service-Automation',
          problem:
            'Ein physischer Service-Roboter braucht zuverlässiges Embedded-Verhalten, um einem Pfad zu folgen, auf Sensorinput zu reagieren und nützliche Automationslogik zu zeigen.',
          role:
            'Prototyplogik um Arduino-Steuerung, Sensorfeedback, Linienverfolgung, physische Tests und mechatronische Iteration aufgebaut.',
          architecture:
            'Sensoreingang -> Arduino-Entscheidungslogik -> Motorsteuerung -> Linienverfolgung -> Validierung des physischen Verhaltens.',
          toolsUsed: ['Arduino', 'Embedded-C/C++-Konzepte', 'IR-/Liniensensoren', 'Motorsteuerung', 'Roboterchassis', 'Prototyptests'],
          improvement:
            'Stärkere Hindernisbehandlung, modularere Verkabelung, Batteriestatus-Überwachung und ein saubereres Gehäuse für einen produktionsnäheren Prototyp ergänzen.',
          challenge:
            'Ein kompaktes Service-Roboter-Konzept bauen, das einem definierten Pfad folgt, auf Sensorinput reagiert und praktische Automationslogik zeigt.',
          approach: [
            'Arduino-basierte Steuerungslogik genutzt, um Bewegungsverhalten und sensorgetriebene Entscheidungen zu koordinieren.',
            'Linienverfolgung und Sensorfeedback integriert, um strukturierte Navigation in kontrollierter Umgebung zu unterstützen.',
            'Fokus auf einen physischen Prototyp gelegt, der Mechatronikgrundlagen zeigt, statt nur Software-Simulation.',
          ],
          deliverables: [
            'Arduino-basierter Roboterprototyp',
            'Linienverfolgungsverhalten',
            'Sensorintegrierte Bewegungslogik',
            'Mechatronisches Service-Roboter-Konzept',
          ],
          details: [
            'Physisches Roboterverhalten wird durch Embedded-Control-Logik statt nur visuellem Konzept bestimmt.',
            'Sensorfeedback unterstützt Linienverfolgung in einem begrenzten Betriebspfad.',
            'Das Projekt stärkt das Portfolio mit Hardware, Verkabelung, Tests und mechatronischer Iteration.',
          ],
          impact:
            'Ergänzt ein hands-on Embedded-Robotik-Signal und zeigt Arbeit von physischem Hardwareverhalten bis Control-Logik.',
        },
      },
      {
        title: 'VR-Workshop für Maschinenbedienung',
        period: 'März 2024 bis Juni 2024',
        priority: 'Simulation- und XR-Beleg',
        description:
          'Eine immersive Unity/XR-Schulungsumgebung, die industrielle Abläufe in ein interaktives Training übersetzt.',
        result:
          'Räumliche Interaktion, realistische Maschinenbewegung und Workshop-Ablauf zu einer nutzbaren Simulation verbunden.',
        cardBullets: [
          'Unity/XR-Training-Workflow für industrielle Maschinenbedienungsabläufe.',
          'Räumliche Interaktion und geführter Prozessfluss in einer nutzbaren Simulation.',
          'Zeigt Simulationskommunikation für Engineering- und Trainingskontexte.',
        ],
        evidenceBullets: [
          'Unity-Simulation',
          'XR-Interaktionsfluss',
          'Training UX',
        ],
        tech: ['Unity', 'C#', 'VR', 'XR', 'Simulation'],
        caseStudy: {
          focus: 'Immersive Simulation für Maschinenbedienungs-Training',
          problem:
            'Industrielle Bedienabläufe lassen sich schwer nur über statische Dokumentation vermitteln, wenn räumliche Interaktion und Prozessfluss wichtig sind.',
          role:
            'Unity/XR-Simulationsumgebung, Interaktionsfluss, Maschinenbedienungslogik und trainingsorientierte User Experience entwickelt.',
          architecture:
            'Unity-Szenenmodell -> Interaktionstrigger -> Bediensequenz -> Nutzerfeedback -> VR/XR-Trainingsfluss.',
          toolsUsed: ['Unity', 'C#', 'VR/XR-Interaktion', '3D-Szenendesign', 'Simulationslogik', 'Training UX'],
          improvement:
            'Analytik für Nutzeraktionen, geführte Fehlerzustände und eine breitere Bibliothek von Maschinenbedienungsszenarien ergänzen.',
          challenge:
            'Maschinenbedienungslogik in einen interaktiven Workshop übertragen, in dem Nutzer Prozessfluss durch räumliche Interaktion verstehen.',
          approach: [
            'Trainingsumgebung in Unity mit VR/XR-Interaktionsmustern aufgebaut.',
            'Maschinenbedienungsschritte in einen geführten Simulationsfluss mit realistischer Bewegung übersetzt.',
            'Technische Simulationstiefe mit Nutzbarkeit für Training und Demonstration ausbalanciert.',
          ],
          deliverables: [
            'Unity-Workshop-Umgebung',
            'VR/XR-Interaktionsfluss',
            'Maschinenbedienungs-Simulationslogik',
            'Trainingsorientierte User Experience',
          ],
          details: [
            'Unity und C# strukturieren Interaktion, Szenenverhalten und Maschinenbedienungsablauf.',
            'Die Simulation übersetzt technische Maschinenschritte in eine immersive Trainingsumgebung.',
            'Das Projekt zeigt, wie Engineering-Systeme über räumliche Simulation vermittelt werden können.',
          ],
          impact:
            'Verbindet robotiknahe Simulation, Interaktionsdesign und industrielles Training zu einer professionellen Engineering-Präsentation.',
        },
      },
      {
        title: 'Modellierung eines aktiven Fahrwerksystems',
        period: 'Oktober 2023 bis Januar 2024',
        priority: 'Regelung- und Modellierungsbeleg',
        description:
          'Ein MATLAB/Simulink-Modell aktiver Fahrwerksdynamik mit hydraulischer Aktuation und Systemantwortanalyse.',
        result:
          'Erstellung eines strukturierten Simulationsmodells zum Vergleich dynamischen Fahrwerksverhaltens und Regelantwort.',
        cardBullets: [
          'MATLAB/Simulink-Modell zur Analyse des aktiven Fahrwerksverhaltens.',
          'Hydraulische Aktuation und Regelverhalten in der Simulation dargestellt.',
          'Verbindet Maschinenbaugrundlagen mit Control-System-Denken.',
        ],
        evidenceBullets: [
          'Dynamische Modellierung',
          'Regelantwort',
          'Simulationsanalyse',
        ],
        tech: ['MATLAB', 'Simulink', 'Regelungsmodellierung', 'Simulation'],
        caseStudy: {
          focus: 'Dynamische Systemmodellierung und Analyse der Simulationsantwort',
          problem:
            'Aktives Fahrwerksverhalten braucht ein strukturiertes Modell, um dynamische Antwort, hydraulische Aktuation und Regelverhalten vor physischer Umsetzung zu vergleichen.',
          role:
            'System in MATLAB/Simulink modelliert, Aktuation und dynamische Antwortanalyse strukturiert und Simulationsverhalten interpretiert.',
          architecture:
            'Fahrzeug-/Systemeingaben -> dynamisches Fahrwerksmodell -> hydraulische Aktuationsdarstellung -> Regelantwort -> Analyse der Simulationsergebnisse.',
          toolsUsed: ['MATLAB', 'Simulink', 'Regelungsmodellierung', 'Hydrauliksystem-Darstellung', 'Antwortanalyse'],
          improvement:
            'Tieferes Controller-Tuning, Parametersensitivitätsanalyse und Vergleich mit Mess- oder Referenzdaten ergänzen.',
          challenge:
            'Aktives Fahrwerksverhalten mit hydraulischer Aktuation modellieren und Systemantwort mit MATLAB/Simulink analysieren.',
          approach: [
            'Dynamisches Systemverhalten über ein strukturiertes Simulink-Modell dargestellt.',
            'Simulationsergebnisse genutzt, um Antwortcharakteristiken und Regelverhalten zu vergleichen.',
            'Mechanisches Systemverständnis auf eine regelungs- und simulationsorientierte Aufgabe angewendet.',
          ],
          deliverables: [
            'MATLAB/Simulink-Modell',
            'Darstellung hydraulischer Aktuation',
            'Analyse dynamischer Systemantwort',
            'Regelungsmodellierungs-Projektreferenz',
          ],
          details: [
            'Das Modell bildet mechanische Dynamik und hydraulische Aktuation in einem simulationsgeführten Workflow ab.',
            'Simulink-Ausgaben unterstützen die Analyse von Antwortverhalten und Regelungscharakteristik.',
            'Das Projekt verbindet Maschinenbaugrundlagen mit Simulation und Regelungstechnik.',
          ],
          impact:
            'Zeigt Simulationsdisziplin, Regelungsmodellierungs-Grundlagen und die mechanische Basis hinter dem Robotikprofil.',
        },
      },
    ],
    skillGroups: [
      {
        title: 'Robotik',
        summary: 'Roboterverhalten, Planung, Navigation und Ausführungslogik für praktische Autonomie.',
        skills: ['ROS', 'ROS 2', 'SLAM', 'Navigation', 'Bewegungsplanung', 'Kollisionsbewusste Ausführung'],
      },
      {
        title: 'Programmierung',
        summary: 'Implementierungsstack für Robotiktools, Simulationsschnittstellen und Control-Logik.',
        skills: ['Python', 'C++', 'C#', 'MATLAB', 'WebSockets', 'OpenCV'],
      },
      {
        title: 'Simulation',
        summary: 'Simulationsgeführtes Design, Validierung und Iteration über Robotik- und dynamische Systeme.',
        skills: ['Gazebo', 'RViz', 'Unity', 'VR/XR', 'MATLAB/Simulink', 'Dynamische Modellierung'],
      },
      {
        title: 'Automation',
        summary: 'Industrielle Robotik-Workflows, Controller-Kontext und deployment-bewusstes Denken.',
        skills: ['Industrierobotik', 'KEBA-Systeme', 'drag&bot', 'HMI-/Controller-Training', 'Workflow-Automation'],
      },
      {
        title: 'Tools',
        summary: 'Engineering-, Validierungs- und Entwicklungsumgebungen aus Projekten und Praxis.',
        skills: ['Git/GitHub', 'Ubuntu/Linux', 'SOLIDWORKS', 'AutoCAD', 'ANSYS', 'Blender'],
      },
    ],
    experiences: [
      {
        role: 'Werkstudent, Industrierobotik',
        date: 'Aktuelle Rolle',
        location: 'Stuttgart, Baden-Württemberg, Deutschland',
        description:
          'Industrierobotik- und Automationsarbeit in einer realen Engineering-Umgebung mit Fokus auf zuverlässige Umsetzung, Roboter-Workflows und Deployment-Kontext.',
        highlights: ['Industrierobotik', 'Roboterprogrammierung', 'Automationsworkflows', 'Deployment-Kontext'],
        details: {
          focus: 'Industrierobotik-Umsetzung in einer professionellen Automationsumgebung.',
          responsibilities: [
            'Robotik- und Automationsarbeit mit Bezug zu industrieller Umsetzung und Deployment-Kontext unterstützen.',
            'Zu Roboter-Workflow-Denken, Systemzuverlässigkeit und praktischer Engineering-Ausführung beitragen.',
            'In einem professionellen Engineering-Rhythmus arbeiten, geprägt durch Dokumentation, Review und Implementierungsdisziplin.',
          ],
          outcomes: [
            'Hands-on-Einblick in Industrierobotiksysteme und Automationsworkflows gestärkt.',
            'Stärkeres Verständnis aufgebaut, wie Robotiklogik von Prototypdenken zu deployment-bewusstem Engineering geht.',
            'Recruiter-relevantes Profil rund um Roboterprogrammierung, Workflow-Validierung und industrielle Umsetzung entwickelt.',
          ],
          environment: ['Industrierobotik', 'Automationsworkflows', 'Roboterprogrammierung', 'Deployment-Kontext'],
        },
      },
      {
        role: 'Masterarbeit - Industrierobotik / KEBA Group',
        company: 'KEBA Group und drag&bot-Umgebung',
        date: 'September 2025 bis März 2026',
        location: 'Stuttgart, Deutschland',
        description:
          'Entwicklung eines programmierorientierten 6-Achs-Industrieroboter-Workflows für Maschinenbedienung inklusive Joint-/Path-Planung, Wegpunktgenerierung, Kollisionszonen-Logik, Re-Grip-Sequenzierung, drag&bot-Validierung und Roboterprogramm-Simulationsvalidierung.',
        highlights: ['6-Achs-Roboterprogrammierung', 'Joint-/Path-Planner', 'drag&bot-Zellvalidierung', 'Industrielle Maschinenbedienung'],
        details: {
          focus: 'Masterarbeit, die industrielle 6-Achs-Roboterprogrammierung, Maschinenbedienungs-Workflowdesign und simulationsgestützte Validierung verbindet.',
          responsibilities: [
            'Industriellen Maschinenbedienungs-Workflow um 6-Achs-Manipulatorbewegung, Joint-/Path-Planung, Wegpunktgenerierung und Validierungsbereitschaft entworfen.',
            'Schlanken Roboterpfad-Planer für interpolierte Wegpunktgenerierung und Roboterprogramm-Simulationsreview entwickelt.',
            'Kollisionszonen-Denken, Re-Grip-Sequenzierung, drag&bot-Zellvalidierung und ausführungsorientierte Roboterprogrammierungslogik in einen zusammenhängenden Thesis-Workflow strukturiert.',
          ],
          outcomes: [
            'Stärkste Industrierobotik-Case-Study im Portfolio erzeugt.',
            'Praxisnahe Roboterprogrammierungslogik, Workflow-Architektur und Simulationsvalidierung in realistischem 6-Achs-Industrierobotik-Kontext demonstriert.',
            'Akademische Thesis-Umsetzung mit industriellen Automationserwartungen rund um Maschinenbedienung, Zellvalidierung und ausführungsbereite Prüfung verbunden.',
          ],
          environment: ['KEBA-Kontext', 'drag&bot-Zellvalidierung', 'Python', '6-Achs-Roboterprogrammierung', 'Industrieller Automationsworkflow'],
        },
      },
      {
        role: 'Techniker für zerstörungsfreie Prüfung',
        company: 'United Engineering and Construction Co.',
        date: 'Februar 2022 bis September 2022',
        location: 'Kochi, Indien',
        description:
          'Industrielle Disziplin durch Prüftätigkeit, technische Berichte, Qualitätsverfahren und Verantwortung unter Feldbedingungen aufgebaut.',
        highlights: ['NDT-Prüfung', 'Qualitätsverfahren', 'Technische Berichte', 'Industrielle Disziplin'],
        details: {
          focus: 'Feldnahe Engineering-Disziplin durch Prüfung, Dokumentation und qualitätsorientierte industrielle Arbeit.',
          responsibilities: [
            'Prüftätigkeiten unter industriellen Qualitäts- und Sicherheitserwartungen unterstützt.',
            'Technische Berichte erstellt und mit verfahrensorientierter Engineering-Dokumentation gearbeitet.',
            'Unter Feldbedingungen gearbeitet, in denen Genauigkeit, Verantwortung und Prozessdisziplin entscheidend waren.',
          ],
          outcomes: [
            'Starke Grundlage industrieller Disziplin vor dem tieferen Einstieg in Robotik und Automation aufgebaut.',
            'Sorgfältige Dokumentationsgewohnheiten und praktisches Bewusstsein für reale Engineering-Umgebungen entwickelt.',
            'Feldnahe Qualitätserfahrung zum Robotik- und Simulationsprofil ergänzt.',
          ],
          environment: ['NDT-Prüfung', 'Qualitätsverfahren', 'Technische Berichte', 'Field Engineering'],
        },
      },
    ],
    education: [
      {
        degree: 'M.Eng. Mechatronik und Cyber-Physical Systems',
        specialization: 'Robotik, autonome Systeme, cyber-physische Systeme, additive Fertigung und Mensch-Maschine-Interaktion.',
        country: 'Deutschland',
        year: 'März 2023 bis heute',
      },
      {
        degree: 'B.Tech. Maschinenbau',
        specialization: 'Maschinenbaugrundlagen über CAD, CAE, Programmiergrundlagen, Thermodynamik, Fluidsysteme und zentrale Konstruktionsprinzipien.',
        country: 'Indien',
        year: 'August 2017 bis Juli 2021',
      },
    ],
    certificates: [
      {
        title: 'Robot Operating System, edX',
        description: 'Strukturiertes ROS-Training passend zu Robotik-Workflows, Autonomiekonzepten und praktischer Systemintegration.',
      },
      {
        title: 'Telerobotics',
        description: 'Robotiklernen mit Fokus auf Fernbedienung, Human-in-the-Loop-Systeme und Teleoperationsgrundlagen.',
      },
      {
        title: 'Universal Robots Core Training',
        description: 'Industrieroboter-Training als Signal für praktische Bedienung, Setup und Automationsworkflow-Verständnis.',
      },
      {
        title: 'Zerstörungsfreie Prüfung Level 2',
        description: 'Industrieller Qualitäts- und Prüfhintergrund zur Unterstützung strukturierten Engineering-Urteils und technischer Berichte.',
      },
    ],
    recommendations: [
      {
        role: 'Robotik-Softwareingenieur',
        quote:
          'Es ist eine Freude, Sooraj bei seiner Masterarbeit in unserer Abteilung zu haben. Schon in der frühen Phase seiner Thesis hat er sich als sehr motiviertes und kollaboratives Teammitglied gezeigt. Er verbindet Robotiktheorie und praktische Programmierung außergewöhnlich gut. Seine proaktive Problemlösung und sein Einsatz für hochwertige Arbeit machen ihn zu einer großen Unterstützung für unser aktuelles Projekt.',
      },
      {
        name: 'Industrielle Referenz',
        role: 'Engineering Lead oder Projektpartner',
        company: 'Freigegebene Quelle ausstehend',
        quote:
          'Vorbereitet für eine echte professionelle Referenz mit Bezug zu Robotik, Automation, industrieller Umsetzung oder Projektzusammenarbeit.',
      },
      {
        name: 'Akademische Referenz',
        role: 'Professor oder Thesis Reviewer',
        company: 'Freigegebene Quelle ausstehend',
        quote:
          'Reserviert für eine verifizierte akademische Empfehlung. Keine Bewertung, erfundene Aussage oder ungeprüfte Referenz wird hier angezeigt.',
      },
    ],
  },
};

const mergeDeep = (base, translation = {}) => {
  if (!translation || typeof translation !== 'object') return base;
  return Object.entries(translation).reduce((next, [key, value]) => {
    if (
      value
      && typeof value === 'object'
      && !Array.isArray(value)
      && base?.[key]
      && typeof base[key] === 'object'
      && !Array.isArray(base[key])
    ) {
      return { ...next, [key]: mergeDeep(base[key], value) };
    }
    return { ...next, [key]: value };
  }, { ...base });
};

const mergeArrayByIndex = (baseItems, translatedItems = []) => (
  baseItems.map((item, index) => mergeDeep(item, translatedItems[index]))
);

export function getLocalizedPortfolioData(language = 'en') {
  const translations = localizedData[language];

  if (!translations) {
    return {
      personal,
      navItems,
      skillChips,
      stats,
      projects,
      skillGroups,
      experiences,
      education,
      certificates,
      recommendations,
      heroAssets,
    };
  }

  return {
    personal: mergeDeep(personal, translations.personal),
    navItems,
    skillChips,
    stats: mergeArrayByIndex(stats, translations.stats),
    projects: mergeArrayByIndex(projects, translations.projects),
    skillGroups: mergeArrayByIndex(skillGroups, translations.skillGroups),
    experiences: mergeArrayByIndex(experiences, translations.experiences),
    education: mergeArrayByIndex(education, translations.education),
    certificates: mergeArrayByIndex(certificates, translations.certificates),
    recommendations: mergeArrayByIndex(recommendations, translations.recommendations),
    heroAssets,
  };
}

export function localizeRecommendation(item, language = 'en') {
  if (language !== 'de' || !item) return item;

  const isSaifReference = item.source_key === 'saif-abdullah-keba-reference'
    || (
      String(item.name || '').trim().toLowerCase() === 'saif abdullah'
      && String(item.company || '').trim().toLowerCase() === 'keba ag'
    );

  if (!isSaifReference) return item;

  const [saifTranslation] = localizedData.de.recommendations;
  return mergeDeep(item, saifTranslation);
}

export const chatbot = {
  quickPrompts: [
    'Tell me about Sooraj',
    'Explain the KEBA project',
    'What technologies does he use?',
    'Show me his projects',
    'Open Resume Overview',
    'How can I contact him?',
  ],
  responses: [
    {
      match: ['tell me about sooraj', 'about', 'who is sooraj', 'introduce'],
      response:
        'Sooraj Sudhakaran is a robotics and automation engineer based in Stuttgart. His work centers on industrial robotics, ROS autonomy, motion planning, simulation, and deployment-minded engineering.',
    },
    {
      match: ['keba', 'thesis', 'industrial robotics', 'robotics thesis'],
      response:
        'The KEBA thesis focuses on a 6-axis autonomous robot workflow for machine-operation scenarios. It combines motion planning, collision-aware behavior, drag&bot simulation validation, and a web-based joint-path planner for waypoint generation.',
    },
    {
      match: ['technologies', 'tools', 'skills', 'stack'],
      response:
        'His core stack includes ROS, ROS 2, Python, C++, C#, MATLAB, Simulink, Unity, Gazebo, RViz, OpenCV, WebSockets, SOLIDWORKS, AutoCAD, ANSYS, Ubuntu, and Git/GitHub.',
    },
    {
      match: ['projects', 'project', 'show me his projects'],
      response:
        'The strongest project signals are the KEBA industrial robotics workflow, ROS autonomous vacuum robot, Arduino-based service robot, VR machine-operation workshop, and MATLAB/Simulink active suspension model.',
    },
    {
      match: ['download resume', 'resume', 'cv'],
      response:
        'This portfolio includes a downloadable recruiter overview built from Sooraj\'s real portfolio content. For the latest CV version, contact him directly by email or LinkedIn.',
      action: { label: 'Open Resume Overview', href: personal.resumeUrl },
    },
    {
      match: ['contact', 'email', 'hire', 'reach'],
      response:
        'You can reach Sooraj at soorajsudhakaran1199@gmail.com, connect on LinkedIn, or review his robotics and software work on GitHub.',
      action: { label: 'Email Sooraj', href: personal.social.email },
    },
  ],
};
