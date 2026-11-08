# Rayume: Project Context

> AI-oriented brief. Read this first to understand what Rayume is, what we are building, and what is in or out of scope.
> Source of truth for the product pitch: `README.md` (Portuguese). This file restates it for agents, in English.
> Last updated: 2026-11-08.

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
| [`endpoints/README.md`](endpoints/README.md) | draft | Every API route, parameters, errors |
| [`design/README.md`](design/README.md) | accepted | Colours, type, glass, components; the style for every page |

Building a backend feature: read the schema, then its endpoint file. Building a page: read the design system first.

## Current stack (as of November 2026)

Monorepo:

| Path | What |
|------|------|
| `backend/` | Python ≥3.14, FastAPI, SQLAlchemy 2, psycopg 3 (PostgreSQL), pydantic-settings, `google-genai` (Gemini as the LLM provider). Managed with `uv`. Tests: pytest. |
| `frontend/` | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4 (theme tokens and glass utilities in `app/globals.css`), Geist Sans + Geist Serif (`geist`). |
| `frontend/resumes/` | LaTeX sources of the sample resumes shown on the site, built with Tectonic and rendered by `render.py` (`uv`, PyMuPDF) into `frontend/public/resumes/`. |
| `postman/` | API collection plus local environment. |
| `docs/` | Agent-facing docs (see the docs map above). |

Local dev: Next on `:3000`, FastAPI on `:8000` (CORS is already configured for this).

## Current state

- **Decided:** the database schema, the API surface (draft) and the visual design.
- **Built:** the landing page at `/`, with real LaTeX renders in the hero and the template gallery. The backend has only `/health`.
- **Next:** SQLAlchemy models and the in-house JWT auth, then the login and Master Resume pages.

Most of the MVP features above are still to be built.
