// ─────────────────────────────────────────────────────────────────
// Centralized static content for the portfolio
// Edit everything here — components import only what they need.
// ─────────────────────────────────────────────────────────────────

// ── Personal Info ──────────────────────────────────────────────

export const PERSONAL = {
  name: "Raven Luke Quinto",
  fullName: "Raven Luke E. Quinto",
  title: "Full Stack Web Developer",
  course: "BSIT",
  description:
    "I am Raven Luke E. Quinto, a Full Stack Web Developer and a recent BSIT graduate from Polytechnic University of the Philippines-Sta. Mesa, Manila.",
} as const;

// ── Navigation / Sections ──────────────────────────────────────

export const NAV_SECTIONS = [
  { id: "home", label: "01 HOME" },
  { id: "experience", label: "02 EXPERIENCE" },
  { id: "projects", label: "03 PROJECTS" },
  { id: "seminars", label: "04 SEMINARS & EVENTS" },
  { id: "contact", label: "05 CONTACT ME" },
] as const;

export type SectionId = (typeof NAV_SECTIONS)[number]["id"];

export const SECTIONS_ORDER = NAV_SECTIONS.map((s) => s.id);

export const SECTION_TITLES: Record<SectionId, string> = {
  home: "Home",
  experience: "Experience",
  projects: "Projects",
  seminars: "Seminars & Events",
  contact: "Contact",
};

// ── Home / Skills ──────────────────────────────────────────────

export const SKILLS: string[] = [
  // ── Programming Languages ──────────────────────────
  "JavaScript",
  "TypeScript",
  "HTML",
  "CSS",
  "Python",
  "R",
  "SQL",
  "C#",

  // ── Frameworks & Libraries ─────────────────────────
  "React",
  "Next.js",
  "Tailwind CSS",
  "Express.js",
  "React Native",
  "Angular",
  "Expo",
  "ASP.NET",

  // ── Backend & Cloud ────────────────────────────────
  "MongoDB",
  "Supabase",
  "PostgreSQL",
  "JSON",
  "AWS S3",
  "AWS CloudFront",
  "AWS Lambda",
  "AWS Route 53",
  "Azure DevOps",
  "Git",
  "Docker",

  // ── Design & Tools ─────────────────────────────────
  "Figma",
  "Node.js",
];

// ── Experience ─────────────────────────────────────────────────

export const EXPERIENCE_CARDS = [
  {
    category: "experience",
    title: "Centhesys at Creciendo Philippines Inc.",
    description: "EXP · Intern · Full Stack Web Developer — Mar to Jun 2026",
    content:
      "Designed and implemented a role-based access control (RBAC) system across the entire HRIS platform, building the role and module permission architecture, dynamic route protection, and enforcement logic used by all application modules. Developed a full payroll computation engine using a calendar-based approach handling premium pay, statutory deductions, withholding tax, and automated cron-based payslip generation. Built full-stack features from database schema and REST API design to responsive frontend interfaces across employee management, document handling with AWS S3, attendance tracking, and analytics dashboards. Improved platform performance by implementing lazy loading for cloud storage requests, centralizing global state management, and building reusable component architecture.",
    footer:
      "JavaScript · Next.js · Express.js · MongoDB · AWS S3, EC2 · Bitbucket",
  },
  {
    category: "experience",
    title: "RESBAC Capstone Project",
    description:
      "EXP · Member · Full Stack Web Developer & Project Manager — Jul to Dec 2025",
    content:
      "Conceptualized and developed a multi-platform disaster response system enabling barangays to map vulnerable populations and prioritize rescue operations in high-risk areas. Designed and implemented the Supabase (PostgreSQL) backend and database architecture supporting citizen profiles, vulnerability information, and barangay admin rescue data. Implemented frontend data pipelines for fetching, cleaning, and validating datasets used by the interface and received by machine learning APIs. Deployed the website using AWS S3, CloudFront, Route 53, and GoDaddy, and built the mobile application using React Native. Built and deployed ML servers (KMeans Clustering and XGBoost) using AWS Lambda and Docker. Led weekly sprint meetings, managed task allocations, and ensured timely accomplishments with consistent team communication.",
    footer:
      "React · React Native · Supabase · AWS S3, CF, R53, Lambda · Python",
  },
  {
    category: "experience",
    title: "PUPSLP Theater Ticketing System",
    description: "EXP · Full Stack Web Developer & Project Manager — 2026",
    content:
      "Designed and implemented the backend and database architecture in Supabase for event and audience ticketing management. Built a dynamic form builder that allows customizable ticketing form creation for any event, behaving similarly to Google Forms. Created frontend skeletons to establish core system workflows prior to UI/UX styling. Led weekly sprint meetings, task allocations, and revision review of accomplished features, applying Agile principles in practice.",
    footer: "Typescript · Next.js · Express.js · MongoDB",
  },
  {
    category: "education",
    title: "Polytechnic University of the Philippines",
    description: "EDU · BS in Information Technology — 2022 to 2026",
    content:
      "Consistent President's Lister from 1st to 4th year with a cumulative GWA of 1.24. DOST Scholar Undergraduate Grantee (2022–2026) under RA 7687. Active member of AWS Cloud Club PUP (Data Science Department for Skill Builder), Google Developer Students Club (Community Relations and Data/ML Team), DataCamp Scholar (2025), IBITS (2022–2025), Cisco NetConnect PUP (Community Partnership Team, Relations Dept.), and PUP Association of DOST Scholars (2022–2026).",
    footer: "PUP · DOST · GWA 1.24",
  },
  {
    category: "education",
    title: "Pamantasan ng Lungsod ng Valenzuela",
    description: "EDU · Senior High School (STEM) — 2020 to 2022",
    content:
      "Consistently recognized as an honor student throughout senior high school and regularly appointed group leader for collaborative projects and research activities.",
    footer: "PLV · STEM",
  },
];

// ── Projects ───────────────────────────────────────────────────

export const PROJECTS = [
  {
    title: "RESBAC — Capstone Research Project",
    description: "Multi-platform disaster response system",
    image: "/assets/projects/resbac/mob0.jpg",
    images: [
      "/assets/projects/resbac/mob0.jpg",
      "/assets/projects/resbac/mob1.jpg",
      "/assets/projects/resbac/mob2.jpg",
      "/assets/projects/resbac/mob3.jpg",
      "/assets/projects/resbac/mob4.jpg",
      "/assets/projects/resbac/mob5.jpg",
      "/assets/projects/resbac/mob6.jpg",
      "/assets/projects/resbac/web0.png",
      "/assets/projects/resbac/web1.png",
      "/assets/projects/resbac/web2.png",
      "/assets/projects/resbac/web3.png",
      "/assets/projects/resbac/web4.png",
      "/assets/projects/resbac/web5.png",
      "/assets/projects/resbac/web6.png",
      "/assets/projects/resbac/web7.png",
      "/assets/projects/resbac/web8.png",
    ],
    body: "RESBAC standing for Rescue and Emergency Support for Barangay At-Risk Citizens. Conceptualized and developed a multi-platform disaster response system enabling barangays to map vulnerable populations and prioritize rescue operations in high-risk areas, providing data-driven decision support for barangay rescuers. Designed and implemented the Supabase (PostgreSQL) backend and database architecture supporting citizen profiles, vulnerability information, and barangay admin rescue data. Implemented frontend data pipelines for fetching, cleaning, and validating datasets used by the interface and received by machine learning APIs. Deployed the website using AWS S3, CloudFront, Route 53, and GoDaddy, and built the mobile application using React Native. Built and deployed ML servers (KMeans Clustering and XGBoost) using AWS Lambda and Docker for containerization.",
    link: "https://resbac-admin.online/login",
  },
  {
    title: "Centhesys V1 — HRIS Platform",
    description: "SaaS HRIS Platform",
    image: "/assets/projects/centhesys/centhesys0.png",
    images: [
      "/assets/projects/centhesys/centhesys0.png",
      "/assets/projects/centhesys/centhesys1.jpg",
      "/assets/projects/centhesys/centhesys2.jpg",
    ],
    body: "Designed and implemented a role-based access control (RBAC) system across the entire HRIS platform, building the role and module permission architecture, dynamic route protection, and enforcement logic used by all application modules. Developed a full payroll computation engine using a calendar-based approach handling premium pay, statutory deductions, withholding tax, and automated cron-based payslip generation. Built full-stack features from database schema and REST API design to responsive frontend interfaces across employee management, document handling with AWS S3, attendance tracking, and analytics dashboards. Improved platform performance by implementing lazy loading for cloud storage requests, centralizing global state management, and building reusable component architecture.",
    link: "http://bpm.centhesys.com",
  },
  {
    title: "PigletGuard Mobile Website",
    description: "PigletGuard product landing page & demo booking",
    image: "/assets/projects/pigletguard/piglet0.png",
    images: [
      "/assets/projects/pigletguard/piglet0.png",
      "/assets/projects/pigletguard/piglet1.png",
      "/assets/projects/pigletguard/piglet2.png",
      "/assets/projects/pigletguard/piglet3.png",
      "/assets/projects/pigletguard/piglet4.png",
      "/assets/projects/pigletguard/piglet5.png",
      "/assets/projects/pigletguard/piglet6.png",
    ],
    body: "Designed and built the marketing and showcase website for PigletGuard, a pig-monitoring solution, using Next.js, TypeScript, and Tailwind CSS. Built a responsive single-page layout with dedicated Home, Solutions, Why, About Us, Pricing, and Contact sections, complete with custom SVG icon assets and PigletGuard branding. Implemented a Book a Demo flow with a booking form, pricing option selection, and a confirmation modal, backed by Supabase for storing demo requests. Added dynamic page-title management and a redesigned footer with social media links.",
    link: "https://pigwise.vercel.app/",
  },
  {
    title: "PUPSLP — Theater Ticketing System",
    description: "Event & audience ticketing management",
    image: "/assets/projects/pupslp/slp1.png",
    images: [
      "/assets/projects/pupslp/slp1.png",
      "/assets/projects/pupslp/slp2.png",
      "/assets/projects/pupslp/slp3.png",
      "/assets/projects/pupslp/slp4.png",
      "/assets/projects/pupslp/slp5.png",
    ],
    body: "Designed and implemented the backend and database architecture in Supabase for event and audience ticketing management. Built a dynamic form builder that allows customizable ticketing form creation for any event, behaving similarly to Google Forms. Created frontend skeletons to establish core system workflows prior to UI/UX styling. Led weekly sprint meetings, task allocations, and revision review of accomplished features, applying Agile principles in practice.",
  },
];

// ── Projects — demo images (shared with Expanded carousel) ─────

export const DEMO_IMAGES = PROJECTS.map((p) => p.image);

// ── Seminars ───────────────────────────────────────────────────

export const SEMINARS = [
  {
    number: "001",
    title: "WURI Research Competition",
    image: "/assets/seminars/wuri/wuri0.jpg",
    images: [
      "/assets/seminars/wuri/wuri0.jpg",
      "/assets/seminars/wuri/wuri1.jpg",
    ],
    body: "Placed 81st in Category A7 — Future-Oriented Responses to Global Uncertainty and Geopolitical Risk at the World University Ranking for Innovation (WURI) Research Competition, held on December 2025, for the capstone research project RESBAC.",
  },
  {
    number: "002",
    title: "RIST 5th PUP Research Pitching",
    image: "/assets/seminars/rist/rist-2.jpg",
    images: [
      "/assets/seminars/rist/rist-2.jpg",
      "/assets/seminars/rist/rist-3.jpg",
      "/assets/seminars/rist/rist-4.jpg",
      "/assets/seminars/rist/rist-cert.jpg",
    ],
    body: "Presented the capstone research project RESBAC at the 5th PUP Research Pitching Competition, organized by the PUP Research Institute for Science and Technology on November 7th of 2025. Delivered the pitch before a panel of judges and researchers across multiple disciplines.",
  },
  {
    number: "003",
    title: "GCP Fundamentals: Core Infrastructure",
    image: "/assets/seminars/gcp/gcp-thumb.jpg",
    images: [
      "/assets/seminars/gcp/gcp-thumb.jpg",
      "/assets/seminars/gcp/gcp-cert.png",
    ],
    body: "Completed an online training course on Google Cloud Platform (GCP) Fundamentals: Core Infrastructure, held on December 2nd of 2025, covering foundational cloud concepts including scalability, resiliency, and security. Gained introductory knowledge of Kubernetes and container orchestration principles.",
  },
  {
    number: "004",
    title: "ReactJS 101 Workshop — AWSCC PUP",
    image: "/assets/seminars/reactjs/reactjs-1.jpg",
    images: [
      "/assets/seminars/reactjs/reactjs-1.jpg",
      "/assets/seminars/reactjs/reactjs-2.jpg",
      "/assets/seminars/reactjs/reactjs-3.jpg",
    ],
    body: "Attended an onsite React JS fundamentals workshop hosted by AWS Cloud Club PUP at eCloudValley in June 21st of 2025. Acquired core React concepts and front-end development practices that served as the foundation for subsequent web development work.",
  },
  {
    number: "005",
    title: "CNCP Routing Success Webinar",
    image: "/assets/projects/cncp/cncp1.jpg",
    images: [
      "/assets/projects/cncp/cncp1.jpg",
      "/assets/projects/cncp/cncp2.jpg",
    ],
    body: "Hosted an online webinar for the Cisco NetConnect PUP (CNCP) Relations Department focused on building strategic connections and enhancing teamwork through insightful discussions.",
  },
];

// ── Socials ────────────────────────────────────────────────────

export const SOCIALS = [
  { name: "Linkedin", url: "https://www.linkedin.com/in/quintoravenluke/" },
  { name: "Github", url: "https://github.com/lukewarmraven" },
  { name: "Facebook", url: "https://www.facebook.com/ravenluke.quinto" },
  { name: "Email", url: "quintoravenluke@gmail.com" },
] as const;

// ── Contact ────────────────────────────────────────────────────

export const CONTACT_INFO = [
  { icon: "#", value: "09684319082", copyValue: "09684319082", label: "phone" },
  {
    icon: "@",
    value: "quintoravenluke@gmail.com",
    copyValue: "quintoravenluke@gmail.com",
    label: "email",
  },
  {
    icon: "  f",
    value: "/ravenluke.quinto",
    copyValue: "https://facebook.com/ravenluke.quinto",
    label: "facebook",
  },
] as const;

export const CONTACT_ASSETS = {
  frontCard: "/assets/contacts/Quinto-FrontCard.png",
  backCard: "/assets/contacts/Quinto-BackCard.png",
  qrCode: "/assets/contacts/portfolio_qr.png",
  downloadIcon: "/assets/misc/download-icon.png",
  qrIcon: "/assets/misc/qr-icon.png",
} as const;

// ── Shared UI strings ──────────────────────────────────────────

export const UI_STRINGS = {
  loading: "Loading...",
  failedToLoad: "Failed to load data.",
  noDetails: "No details available.",
  copied: "Copied!",
  scrollMore: "-- Scroll for more --",
  scrollEnd: "— End —",
  back: "← Back",
  current: "(current)",
  visitOtherVersions: "Visit other versions",
  version1: "Version 1",
  version2: "Version 2",
  version1Color: "#EC1D39",
  topRepos: "Top Repos",
} as const;

// ── UI Constants ───────────────────────────────────────────────

export const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

export const AVATAR_COLORS = [
  "#DC2626",
  "#0891B2",
  "#F59E0B",
  "#7C3AED",
  "#DB2777",
  "#2563EB",
  "#EA580C",
  "#65A30D",
] as const;

export const LASTFM_PERIODS = [
  { value: "7day" as const, label: "7 days" },
  { value: "1month" as const, label: "1 mo" },
  { value: "6month" as const, label: "6 mo" },
  { value: "12month" as const, label: "1 yr" },
  { value: "overall" as const, label: "all time" },
];

export const GITHUB_CONTRIBUTION_LEVELS = [
  "var(--color-border)",
  "#9be9a8",
  "#40c463",
  "#30a14e",
  "#216e39",
] as const;

export const GITHUB_DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""] as const;

export const GITHUB_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

// ── Version Switcher ───────────────────────────────────────────

export const VERSION_URLS = {
  v1: "https://quintoravenluke1.vercel.app/",
  v2: "https://quintoravenluke2.vercel.app/",
} as const;

export const BIRD_ASSET = "/assets/misc/bird.png";

export const STAR_ASSET = "/assets/misc/star.png";
