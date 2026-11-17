// Demo data for the signed-in workspace: Lucas Mendes's Master Resume (the same fictional person as
// resumes/body.tex), shaped like the API's Experience and Resume objects in docs/backend/endpoints.
// shortcut: static until the API serves /me, /experiences, /resumes and /job-postings; swap these for fetches then.
// The job postings' companies are real names used as demo data; the postings themselves are invented.

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
  {
    id: "meta",
    type: "certification",
    title: "Meta Front-End Developer Professional Certificate",
    organization: "Coursera",
    start: "2023-01",
    end: "2023-01",
    bullets: [],
    hard_skills: ["React"],
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

// Job postings, shaped like the API's JobPosting (docs/backend/endpoints/job-postings.md); logo is a demo asset
// in public/logos/, not part of the schema. saved is created_at. applied (a day, YYYY-MM-DD) and sent (the id
// of the resume that went with it) are the user's own record of applying, which the schema can't hold yet
// (docs/todo/missing-schema-job-applications.md). The companies are real names used as demo data; the postings,
// their text and the dates are invented. Dates agree with resumes/data.ts: a job is saved before its
// resume was last edited and applied on or after that.
export type Posting = {
  id: string;
  title: string;
  company: string;
  url?: string;
  description: string;
  keywords: string[];
  missing: string[];
  logo?: string;
  saved: string;
  applied?: string;
  sent?: string;
};
export const postings: Posting[] = [
  {
    id: "nubank",
    title: "Software Engineer, Full Stack",
    company: "Nubank",
    logo: "nubank",
    keywords: ["React", "TypeScript", "Clojure", "Kafka", "PostgreSQL", "testing", "design collaboration", "mentoring"],
    missing: ["Clojure", "Kafka"],
    description: "We're looking for a full stack engineer to join one of the teams behind the screens customers use every day to manage their money.\n\nWhat you'd do:\n- Build web features end to end, from React and TypeScript interfaces to the Clojure services behind them\n- Work with designers and product managers from the first sketch to the release\n- Write tests and review your teammates' code\n- Help newer engineers find their feet\n\nWhat we ask for:\n- Experience shipping web applications with React and TypeScript\n- Comfort working with relational data, such as PostgreSQL\n- Curiosity about functional programming; Clojure and Kafka are a plus, not a requirement",
    saved: "2026-11-05",
    applied: "2026-11-12",
    sent: "r1",
  },
  {
    id: "stripe",
    title: "Backend Engineer, Payments",
    company: "Stripe",
    logo: "stripe",
    url: "https://stripe.com/jobs",
    keywords: ["Ruby", "Java", "API design", "idempotency", "PostgreSQL", "Redis", "AWS", "on-call"],
    missing: ["Ruby", "Java", "on-call"],
    description: "The Payments team builds the APIs businesses use to accept and move money, and the systems that keep those APIs correct when the network isn't.\n\nWhat you'd do:\n- Design and build backend services in Ruby and Java\n- Make every operation safe to retry, with idempotency built in from the start\n- Own your services in production, including an on-call rotation\n- Write clear API documentation for the developers who rely on it\n\nWhat we ask for:\n- Experience building and running backend services\n- A solid grasp of relational databases (PostgreSQL) and caching (Redis)\n- Some time on AWS or another cloud\n- Care for API design and the people who use your APIs",
    saved: "2026-10-30",
    applied: "2026-11-05",
    sent: "r2",
  },
  {
    id: "vercel",
    title: "Frontend Engineer",
    company: "Vercel",
    logo: "vercel",
    url: "https://vercel.com/careers",
    keywords: ["React", "TypeScript", "Next.js", "accessibility", "design systems", "Figma", "testing"],
    missing: ["design systems"],
    description: "We're hiring a frontend engineer to work on the dashboard developers use to deploy and run their projects.\n\nWhat you'd do:\n- Build product features in React, TypeScript and Next.js\n- Grow the design system with our designers in Figma\n- Keep every screen accessible, from keyboard to screen reader\n- Keep the test suite honest\n\nWhat we ask for:\n- Strong React and TypeScript\n- Experience with Next.js or a similar framework\n- Working knowledge of accessibility\n- Design systems experience is a plus",
    saved: "2026-10-28",
  },
  {
    id: "vtex",
    title: "Software Engineer II",
    company: "VTEX",
    logo: "vtex",
    keywords: ["TypeScript", "Node.js", "React", "GraphQL", "AWS", "code review", "Kubernetes"],
    missing: ["GraphQL", "Kubernetes"],
    description: "Join a product team building commerce features for retailers around the world.\n\nWhat you'd do:\n- Build TypeScript services in Node.js and the GraphQL APIs that expose them\n- Build React components for storefronts\n- Ship to AWS, on Kubernetes\n- Review code every day and help keep the codebase healthy\n\nWhat we ask for:\n- Two or more years building with TypeScript and Node.js\n- Experience with React\n- Some time on AWS\n- GraphQL and Kubernetes are a plus",
    saved: "2026-10-20",
    applied: "2026-10-27",
    sent: "r5",
  },
  {
    id: "spotify",
    title: "Data Engineer, Early Career",
    company: "Spotify",
    logo: "spotify",
    url: "https://www.lifeatspotify.com",
    keywords: ["Python", "SQL", "Scala", "Apache Beam", "BigQuery", "GCP", "data modeling"],
    missing: ["Scala", "Apache Beam", "BigQuery", "GCP"],
    description: "An early-career role on a data team that builds the pipelines behind listening insights.\n\nWhat you'd do:\n- Build and look after batch pipelines in Python, SQL and Scala, using Apache Beam on Google Cloud\n- Model data so other teams can query it in BigQuery\n- Monitor data quality and fix what breaks\n\nWhat we ask for:\n- Good Python and SQL\n- An understanding of data modeling\n- Interest in distributed data processing; Scala, Beam and GCP can be learned on the job",
    saved: "2026-11-14",
  },
  {
    id: "ifood",
    title: "Backend Developer",
    company: "iFood",
    logo: "ifood",
    keywords: ["Kotlin", "Java", "Spring", "PostgreSQL", "Kafka", "AWS", "microservices"],
    missing: ["Kotlin", "Java", "Spring", "Kafka"],
    description: "We're looking for a backend developer to work on the services that get orders from restaurants to people's doors.\n\nWhat you'd do:\n- Build microservices in Kotlin with Spring\n- Publish and consume events over Kafka\n- Run your services on AWS, with PostgreSQL behind them\n\nWhat we ask for:\n- Experience with a JVM language (Kotlin or Java)\n- Familiarity with relational databases\n- Interest in event-driven systems",
    saved: "2026-11-15",
  },
];

