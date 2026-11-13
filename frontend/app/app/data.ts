// Demo data for the signed-in workspace: Lucas Mendes's Master Resume (the same fictional person as
// resumes/body.tex), shaped like the API's Experience and Resume objects in docs/backend/endpoints.
// shortcut: static until the API serves /me, /experiences, /resumes and /job-postings; swap these for fetches then.

export type Bullet = { id: string; text: string };
export type Entry = {
  id: string;
  type: "professional" | "project" | "education" | "certification";
  title: string;
  organization: string;
  start: string; // YYYY-MM, like the API
  end: string | null; // null means current
  location?: string;
  stack?: string;
  note?: string;
  bullets: Bullet[];
  hard_skills: string[];
  soft_skills: string[];
};

export const profile = {
  name: "Lucas Mendes",
  profession: "Full Stack Developer",
  email: "lucas@lucasmendes.dev",
  phone: "+55 11 98765-4321",
  address: "São Paulo, Brazil",
  links: ["LinkedIn", "GitHub", "Portfolio"],
};

const b = (id: string, ...texts: string[]) => texts.map((text, i) => ({ id: `${id}-${i + 1}`, text }));

export const entries: Entry[] = [
  {
    id: "lumen",
    type: "professional",
    title: "Junior Full Stack Engineer",
    organization: "Lumen Labs",
    start: "2025-02",
    end: null,
    location: "São Paulo, Brazil",
    bullets: b(
      "lumen",
      "Ship features end to end for a B2B scheduling platform used by 1,200 clinics, from PostgreSQL migrations and Node.js APIs to React interfaces.",
      "Cut the main dashboard's median load time from 3.8 s to 1.1 s with cursor pagination, Redis caching and lazy-loaded charts.",
      "Built the Stripe billing integration (subscriptions, webhooks, idempotent retries), now processing over R$ 2M per month with zero double charges.",
      "Review pull requests and mentor two interns on testing; raised backend test coverage from 41% to 78%.",
    ),
    hard_skills: ["PostgreSQL", "Node.js", "React", "Redis", "Stripe"],
    soft_skills: ["Mentoring", "Ownership"],
  },
  {
    id: "trilha",
    type: "professional",
    title: "Software Engineering Intern",
    organization: "Trilha",
    start: "2024-07",
    end: "2025-01",
    location: "São Paulo, Brazil (Hybrid)",
    bullets: b(
      "trilha",
      "Built the course progress API in TypeScript and NestJS for 30,000 students, with role-based access for teachers and admins.",
      "Rewrote the quiz editor in React with drag-and-drop and autosave, cutting teacher-reported content errors by 35%.",
      "Set up GitHub Actions pipelines with linting, tests and preview deployments for every pull request.",
    ),
    hard_skills: ["TypeScript", "NestJS", "React", "GitHub Actions"],
    soft_skills: ["User empathy"],
  },
  {
    id: "quintal",
    type: "professional",
    title: "Frontend Developer Intern",
    organization: "Quintal Logística",
    start: "2024-01",
    end: "2024-06",
    location: "São Paulo, Brazil",
    bullets: b(
      "quintal",
      "Developed a real-time delivery tracking map with Next.js and WebSockets covering 400 daily routes.",
      "Turned Figma designs into a library of 40+ accessible React components shared across three internal apps.",
    ),
    hard_skills: ["Next.js", "WebSockets", "Figma", "Accessibility"],
    soft_skills: ["Design collaboration"],
  },
  {
    id: "bandejao",
    type: "project",
    title: "Bandejão PUC",
    organization: "",
    stack: "Next.js, Supabase, PostgreSQL, PWA",
    start: "2024-03",
    end: "2024-08",
    bullets: b(
      "bandejao",
      "Built a progressive web app that publishes the PUC-SP cafeteria menu and live queue estimates, used by about 2,000 students each month.",
      "Scraped and normalized weekly menus with a scheduled Python job and modeled allergens and ratings in PostgreSQL.",
    ),
    hard_skills: ["Next.js", "Supabase", "Python"],
    soft_skills: ["Product thinking"],
  },
  {
    id: "pixkit",
    type: "project",
    title: "pix-kit",
    organization: "",
    stack: "TypeScript, open source",
    start: "2023-09",
    end: "2023-12",
    bullets: b("pixkit", "Published an npm library that generates and validates Pix payment QR codes, with full test coverage and 300+ GitHub stars."),
    hard_skills: ["TypeScript", "Testing"],
    soft_skills: ["Open-source collaboration"],
  },
  {
    id: "rota",
    type: "project",
    title: "Rota Segura",
    organization: "",
    stack: "React Native, FastAPI, PostGIS",
    note: "2nd place, HackPUC 2023",
    start: "2023-05",
    end: "2023-05",
    bullets: b(
      "rota",
      "Led a team of four to build in 36 hours a mobile app that suggests well-lit walking routes around campus using open city lighting data.",
      "Wrote the routing API in FastAPI with PostGIS spatial queries and pitched the product to a panel of engineers and investors.",
    ),
    hard_skills: ["React Native", "FastAPI", "PostGIS"],
    soft_skills: ["Leadership", "Pitching"],
  },
  {
    id: "puc",
    type: "education",
    title: "B.S. in Computer Science",
    organization: "Pontifical Catholic University of São Paulo (PUC-SP)",
    start: "2022-02",
    end: "2026-12",
    note: "Expected",
    bullets: b("puc", "Member, PUC Tech League; Teaching Assistant, Data Structures (2023); Organizer, PUC-SP Academic Week (2024)."),
    hard_skills: ["Data structures"],
    soft_skills: ["Teaching", "Event organization"],
  },
  {
    id: "aws",
    type: "certification",
    title: "AWS Certified Cloud Practitioner",
    organization: "Amazon Web Services",
    start: "2025-04",
    end: "2025-04",
    bullets: [],
    hard_skills: ["AWS"],
    soft_skills: [],
  },
];

export const skillGroups: [string, string][] = [
  ["Languages", "TypeScript, JavaScript, Python, SQL, HTML/CSS"],
  ["Frontend", "React, Next.js, TailwindCSS, React Query, Playwright"],
  ["Backend", "Node.js, NestJS, FastAPI, REST, GraphQL, WebSockets"],
  ["Data & Cloud", "PostgreSQL, Redis, Prisma, Docker, AWS (ECS, S3, RDS), Vercel"],
];

// What the Refine mode answers for a quoted bullet: the same facts, led by the result.
// shortcut: canned until POST /experiences/{id}/refine exists; the API's structured output replaces this.
export const refined: Record<string, string> = {
  "lumen-1": "Delivered features end to end, from PostgreSQL migrations to React screens, for a scheduling platform 1,200 clinics run their day on.",
  "lumen-2": "Made the main dashboard 3.5x faster (3.8 s to 1.1 s median) with cursor pagination, Redis caching and lazy-loaded charts.",
  "lumen-3": "Process R$ 2M+ a month through the Stripe billing I built (subscriptions, webhooks, idempotent retries) with zero double charges.",
  "lumen-4": "Raised backend test coverage from 41% to 78% while mentoring two interns on testing and reviewing their pull requests.",
  "trilha-1": "Serve 30,000 students through the course progress API I built in TypeScript and NestJS, with role-based access for teachers and admins.",
  "trilha-2": "Cut teacher-reported content errors by 35% by rebuilding the quiz editor in React with drag-and-drop and autosave.",
  "trilha-3": "Gave every pull request linting, tests and a preview deployment by setting up the team's GitHub Actions pipelines.",
  "quintal-1": "Track 400 deliveries a day live on the map I built with Next.js and WebSockets.",
  "quintal-2": "Shipped 40+ accessible React components, built from Figma, that three internal apps now share.",
  "bandejao-1": "Reach about 2,000 students a month with a PWA that publishes the PUC-SP cafeteria menu and live queue estimates.",
  "rota-1": "Led a team of four to 2nd place at HackPUC with a mobile app, built in 36 hours, that routes students along well-lit streets.",
};

export type Saved = { id: string; title: string; template: string; version: number; job?: string; updated: string };
export const resumes: Saved[] = [
  { id: "r1", title: "Orbita, Full Stack Engineer", template: "Jake's Resume", version: 3, job: "orbita", updated: "2026-11-09" },
  { id: "r2", title: "Vela Pay, Backend Engineer", template: "Classic", version: 1, job: "vela", updated: "2026-11-04" },
  { id: "r3", title: "General, one page", template: "Modern", version: 5, updated: "2026-10-28" },
];

export type Posting = { id: string; title: string; company: string; keywords: string[]; missing: string[] };
export const postings: Posting[] = [
  {
    id: "orbita",
    title: "Full Stack Engineer",
    company: "Orbita",
    keywords: ["React", "TypeScript", "Node.js", "PostgreSQL", "design collaboration", "testing", "GraphQL", "Kubernetes", "mentoring"],
    missing: ["GraphQL", "Kubernetes"],
  },
  {
    id: "vela",
    title: "Backend Engineer, Payments",
    company: "Vela Pay",
    keywords: ["Node.js", "Stripe", "idempotency", "PostgreSQL", "Redis", "AWS", "on-call", "Go"],
    missing: ["Go", "on-call"],
  },
];

const month = new Intl.DateTimeFormat("en", { month: "long", year: "numeric", timeZone: "UTC" });
export const when = (ym: string) => month.format(new Date(`${ym}-01T00:00:00Z`));
export const span = (e: Entry) => (e.start === e.end ? when(e.start) : `${when(e.start)} – ${e.end ? when(e.end) : "Present"}`);
