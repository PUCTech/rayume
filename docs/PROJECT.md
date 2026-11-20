# Rayume: Project Context

> AI-oriented brief. Read this first to understand what Rayume is, what we are building, and what is in or out of scope.
> Source of truth for the product pitch: `README.md` (Portuguese). This file restates it for agents, in English.
> Last updated: 2026-11-16.

## What we are

- A university project (PUCTech) built by a 3-person team: Raul Kolaric, Lorenzo Cunha, Thierry Nadjarian.
- Delivery window: **~2 months** for the MVP. Favor shipping a focused, working MVP over breadth.
- Target audience: **English-speaking tech students and early-career developers (Gen Z) looking for their first or next tech job**. User-facing copy is written in **English first**, with a **pt-BR translation**. Code, identifiers, commits and these docs are in English.

## The problem

Tech students and professionals struggle to present their experience, projects and skills in clear, professional resumes. Soft skills (communication, collaboration, leadership) get lost when a resume only lists technical knowledge.

Existing options force a trade-off:
- **Canva / Word / Google Docs / Notion**: easy, but poor ATS parsing (Canva, Notion) or generic layouts, and all writing is manual.
- **Overleaf (LaTeX)**: great typography, but requires coding and doesn't help with content.
- **Generic LLMs (ChatGPT)**: produce unstandardized text that still has to be formatted from scratch.

## The objective

**Rayume generates professional, ATS-friendly LaTeX resumes for tech people, using AI to write and tailor the content. The user never touches LaTeX.**

Differentiators:
1. LaTeX typographic quality with zero code.
2. AI specialized in tech careers that surfaces **both hard and soft skills** from real projects.
3. **Live preview gallery**: every template is rendered with the user's own data at the same time, so comparing layouts takes no rework.

## MVP features (in scope)

1. **Auth**: login via GitHub, Google and email. **JWT is implemented in-house, with no auth library**: the directors require it for learning purposes. Access + refresh tokens with rotation and reuse detection; see [`database/README.md`](database/README.md#auth-in-house-jwt).
2. **Master Resume** (Currículo Mestre): one central profile with experiences, education and projects. AI helps write entries and extract hard/soft skills.
3. **Job tailoring** (web + browser extension): capture a job description and generate a version of the resume tailored to it from the Master Resume.
4. **LaTeX template gallery**: search plus live preview rendered with the user's real data.
5. **PDF export**: LaTeX compiled transparently in the background into a clean, ATS-ready PDF.

Platforms: responsive web app plus a companion browser extension.

## How AI is used

LLM calls go through the API with **structured outputs (JSON schemas)**, never free-form text that gets parsed by hand. There are three uses:

1. **Refine and extract**: rewrite a raw experience or project with a focus on impact and results, and tag hard and soft skills.
2. **Tailor**: match job requirements and keywords against the Master Resume, pick the most relevant projects, and adjust the summary and terminology.
3. **Map to templates**: condense user data into a standardized JSON shape per template, respecting each template's sections and space limits, so the engine can fill and compile any LaTeX layout without breaking it.

## Out of scope (do not build)

Rayume is **candidate-only**. It is not a job board, a professional social network, or a recruiting tool for companies.

Future ideas, **not MVP**:
- Internal ATS / resume scoring against a job
- SaaS plans and pricing
- Job scraper and alerts
- Auto-apply to jobs
- Predictive success classifier

If a task drifts toward any of these, flag it instead of implementing it.

## Docs map

| Doc | Status | What it answers |
|-----|--------|-----------------|
| This file | current | What Rayume is, scope, stack |
| [`database/README.md`](database/README.md) | accepted | Tables, auth rules, versioning, renders, logs |
| [`backend/README.md`](backend/README.md) | draft | How the backend is built and run; links to every API route |
| [`backend/endpoints/README.md`](backend/endpoints/README.md) | draft | Every API route, parameters, errors |
| [`design/README.md`](design/README.md) | accepted | Colours, type, glass, components; the style for every page |
| [`security/README.md`](security/README.md) | draft | Threat model: LaTeX injection, prompt injection, review checklists |
| [`todo/README.md`](todo/README.md) | current | Where code and docs disagree, or a feature needs a column/route the docs lack |
| [`sessions/README.md`](sessions/README.md) | current | What each working session achieved, decided and left open |

Building a backend feature: read the schema, then its endpoint file. Building a page: read the design system first. Touching rendering or AI calls: read the threat model.

## Current stack (as of November 2026)

Monorepo:

| Path | What |
|------|------|
| `backend/` | Python ≥3.14, FastAPI, SQLAlchemy 2, psycopg 3 (PostgreSQL), pydantic-settings, `google-genai` (Gemini as the LLM provider). Managed with `uv`. Tests: pytest. |
| `frontend/` | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4 (theme tokens and glass utilities in `app/globals.css`), Geist Sans + Geist Serif (`geist`). `pdfjs-dist` for the PDF viewer and editor; `@base-ui/react`, `react-resizable-panels`, `motion`, `use-stick-to-bottom` and `lucide-react` in the editor. No test runner yet. |
| `frontend/resumes/` | LaTeX sources of the sample resumes shown on the site, built with Tectonic and rendered by `render.py` (`uv`, PyMuPDF) into `frontend/public/resumes/`. In development, `app/api/render` compiles them on request with the local Tectonic (404 outside `next dev`). |
| `postman/` | API collection plus local environment. |
| `docs/` | Agent-facing docs (see the docs map above). |

Local dev: Next on `:3000`, FastAPI on `:8000` (CORS is already configured for this).

## How we work

- **`main` is protected** (a requirement from the directors) by the `main-ruleset` repository ruleset:
  - every change goes through a **pull request with 1 approval**; approvals are dismissed when new commits are pushed, and review conversations must be resolved;
  - **force pushes and deleting `main` are blocked**;
  - only merge commits are allowed.
  - A direct push to `main` is rejected ("Changes must be made through a pull request"). Branch first, then open a PR.
  - Organization admins can still bypass the approval inside a PR.
- **CI** (GitHub Actions, `.github/workflows/`) runs on every PR and every push to `main`:
  - **Backend / Test**: `uv sync --locked`, create the tables in a Postgres 18 service, `uv run pytest`;
  - **Frontend / Lint and build**: `npm ci`, `npm run lint` (only errors fail it), `npm run build` (also type-checks).
  - Deploys are not in CI: the frontend deploys through Vercel's git integration (a preview per PR); the backend has no deploy yet.
- **Weekly report:** at the end of each week, a GitHub issue in **pt-BR** summarizes what reached `main` (merged PRs, key diagrams and designs, next steps). The first one is [#6](https://github.com/PUCTech/rayume/issues/6) (2 to 8 November 2026).

## Current state

- **Decided:** the database schema, the API surface (draft) and the visual design.
- **Built, frontend:**
  - `/`: the landing page (lens hero, prism glass on the nav, band cards and buttons, an "Edit it like a document" section).
  - `/templates` and `/templates/[id]`: the gallery with search, filters and a pdf.js viewer; "Use this template" goes to `/signup?template=…`.
  - `/login`, `/signup` (forms only, not wired to an API) and `/legal/*`.
  - `/resources`: six guides (`/resources/resume-guide`, `github-profile`, `ats-checklist`, `applications`, `interview-prep`, `first-offer`) and a blog (`/resources/blog`, `/resources/blog/[slug]`), written as data in `app/resources/articles/` and `posts/` against the contract in `content.ts` and `parts.tsx`. One article page for all of them (contents on the side on `lg` marking the section in view, a reading progress bar, breadcrumbs, sources, keep reading, a call to sign up); checklists tick and remember in localStorage. Linked from the footer.
  - `/resumes`: the signed-in home, a grid of resumes with the Master Resume first, new and tailored resumes, saved jobs. `/app` redirects here.
  - `/resumes/[id]`: the editor. You write on the real LaTeX PDF (one caret across the page, bold/italic/underline in bullets, Alt+↑/↓ moves a bullet within its entry, save while typing and on leaving, Esc keeps what was typed, undo), the resume renamed in place from its title with the save status beside it (`Saving…`, then `Saved`, its icon turning while the PDF is typeset), with a toolbar (font, size, margins that say their size, symbols, and Ask Rayume, ⌘J, which quotes the bullet the caret is in into the chat), a collapsible content form on the left (links labelled Email, Phone or Link by their text; links, jobs, projects, schools, certifications and skill lines put on and taken off, a section's heading leaving the PDF with its last entry and coming back with the next; a job's dates picked as month pills; in its bullets Enter splits or adds one, Backspace in an empty one removes it, Alt+↑/↓ moves it) and a collapsible Rayume chat on the right, folded from the bar's Rayume button. Below `lg` each panel opens over the whole width, one at a time. The page is shown at its real size (100% is the sheet's 816 CSS px), fitted to the width on opening, never above 100%, with a blank sheet in its place until it's drawn; after that it keeps its size whatever the panels do, scrolling sideways inside its box when wider, and refits to a window resize until you zoom yourself (the zoom's middle button fits it again). Changes are written into the LaTeX and re-typeset through the dev-only `/api/render`.
  - `/jobs`: the user's own saved and applied jobs, a localStorage demo seeded from the demo postings. Four counts worked out from the list (Saved, Applied, This week, Tailored), a GitHub-style grid of activity by day over six months and applications per week over eight, Saved and Applied tabs in the URL, a row per job with its date and whether a resume was tailored or sent, Mark as applied in a popover (the day, and which resume was sent) with Undo, Save a job and Edit in a dialog with the API's fields, and a job opening in a large dialog (`?job=`) with its requirements and description beside the resume as a page. `/resumes` and `/jobs` share one app bar, whose initials open the account menu (Personal information, Experience, Help and legal, Sign out). The schema can't hold the applied date or the sent resume, and application tracking isn't on the MVP list: see [`todo/missing-schema-job-applications.md`](todo/missing-schema-job-applications.md) and [`todo/scope-application-tracking.md`](todo/scope-application-tracking.md). The demo jobs are real companies' names on invented postings; Lucas and his employers stay fictional.
  - `/resumes/[id]/tailor`: tailoring a new resume to a job, from every Tailor entry point (`/jobs` rows and the job dialog, `/resumes`' New resume menu and saved jobs). A loading screen ticks through Rayume's steps (Edit it myself skips to the editor), then Rayume's chat opens with its proposals, beside Resume and Job tabs (the resume typeset again after each accepted change, dev only; the job's requirements and description): each a bullet's before and after, to replace or skip, plus Accept all; accepted ones go into the resume's document, so the editor opens on exactly those. Scripted in `app/workspace.tsx` (`tailoring`): it only rewrites existing bullets by id, takes no facts from the posting and leaves the job's missing skills unclaimed; a job with no keywords gets no proposals. `?fail=1` shows the failure state. Coming back shows the chat, not the loading. A demo of `POST /resumes` with `job_posting_id`, which as written returns a finished resume with no review step: see [`todo/scope-application-tracking.md`](todo/scope-application-tracking.md).
  - `/settings/profile`: Personal information, the fields `PATCH /me` takes with its limits and reserved usernames, a localStorage demo. The email shows but can't change (the API can't verify one yet); the language is stored, though there's no pt-BR copy yet.
  - Everything signed-in is a demo: resumes and edits live in localStorage and the chat is scripted, until the API has the routes.
- **Built, backend:** `GET /health`, `GET /templates`, `GET /templates/{slug}`; SQLAlchemy models for the whole schema; templates seeded by `seed.py`. No migrations yet (`create_all`).
- **Next:** the in-house JWT auth and the `/experiences` and `/resumes` routes, so the frontend can drop localStorage.

AI calls, job tailoring, the render worker, PDF export from the backend and the browser extension are still to be built.
