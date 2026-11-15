# Rayume

## Rule: consult the docs first, every chat

This file loads at the start of every session, including after `/clear`. Before you write code, plan, review or answer anything about the project:

1. Use the summary below to find which doc covers the task.
2. **Read that doc in full** before you act. The summary is only a map: the docs hold the contracts, limits and edge cases.
3. Read the latest session report in `docs/sessions/` (see the index in `docs/sessions/README.md`) to see what was left open.
4. If the code and a doc disagree, say so. Update the doc in the same PR that changes the behaviour.
5. Check `docs/todo/` for open items in the area you're touching. `/docs-check` logs new mismatches there.

| Task | Read first |
|------|------------|
| Anything | `docs/PROJECT.md` (scope, stack, current state) |
| Backend feature | `docs/database/README.md` → `docs/backend/endpoints/<resource>.md` → `docs/backend/architecture/` |
| A page or UI | `docs/design/README.md` |
| LaTeX rendering, AI calls, auth, uploads | `docs/security/README.md` (+ `docs/backend/architecture/render-worker.md` for rendering) |
| Resuming work | newest `docs/sessions/YYYY-MM-DD-HHMM/README.md` |

---

## Documentation summary

### Product (`docs/PROJECT.md`)

- PUCTech university project by Raul Kolaric, Lorenzo Cunha and Thierry Nadjarian, with a ~2-month MVP window. Ship a focused MVP rather than breadth.
- **What it does:** generates ATS-friendly LaTeX resumes for tech students and early-career devs (Gen Z). AI writes and tailors the content, and the user never touches LaTeX.
- **MVP:** in-house JWT auth (GitHub, Google, email; the directors require that no auth library is used), the Master Resume, job tailoring (web + browser extension), a template gallery with live previews of the user's own data, and PDF export.
- **AI** (Gemini via `google-genai`) always uses structured JSON outputs. It does three jobs: refine/extract skills, tailor to a job, and map data to templates.
- **Out of scope:** job board, recruiter tools, ATS scoring, pricing, scrapers/alerts, auto-apply. Flag the drift if a task heads toward these; don't build them.
- **Language:** user copy is English first with pt-BR. Code, commits and docs are in English. Weekly report issues are in pt-BR.
- **Stack:** `backend/` uses Python ≥3.14, FastAPI, SQLAlchemy 2, psycopg 3, uv and pytest. `frontend/` uses Next.js 16 App Router, React 19, TS, Tailwind 4 and Geist, with no test runner. `frontend/resumes/` holds the LaTeX sample sources (Tectonic). Dev ports: Next on `:3000`, API on `:8000`.
- **Workflow:** `main` is protected (PR + 1 approval, merge commits only, no force push).
- **Current state:**
  - Frontend built: landing, `/templates`, auth forms (not wired), `/legal`, `/resumes` home, the `/resumes/[id]` editor (writes on the real PDF, chat panel, Code mode).
  - Everything signed-in is a localStorage demo.
  - Backend built: `/health`, `GET /templates`, `GET /templates/{slug}`, all models, `seed.py`. No migrations yet (`create_all`).
  - **Next:** JWT auth plus the `/experiences` and `/resumes` routes.

### Database (`docs/database/README.md`, accepted)

- 8 tables: `users`, `experiences`, `job_postings`, `resumes`, `resume_renders`, `templates`, `refresh_tokens`, `logs`. Proposal history is in `docs/database/sketch/`; never edit another member's sketch.
- **Conventions:**
  - `uuid` PKs that never leave the backend; the API uses a 12-char `public_id` instead (templates use `slug`).
  - Every timestamp is `timestamptz`. `created_at` goes on all tables, `updated_at` on mutable ones.
  - Index every FK.
- **Auth:**
  - Access JWT: ~15 min, not stored. Use a fixed algorithm and validate `exp`/`iss`/`aud`, plus `sub` = `public_id` of a user that isn't disabled.
  - Refresh token: only its SHA-256 hash is stored. Families with rotation and reuse detection (reuse revokes the whole family), 30-day fixed deadline.
  - Passwords are hashed with argon2.
- **users:** `username` is unique on `lower()` and matches `^[a-z0-9_-]+$` (3–30 chars, reserved names blocked). Soft delete with `disabled_at`. No age column. `links` is jsonb.
- **experiences:** `raw_text` holds what the user typed, `data` the AI's structured output. Templates render from `data` only.
- **resumes:** each row is one version, with `unique (public_id, version)` and the highest version as current. `content` is a complete, immutable snapshot. Every change inserts a new row.
- **resume_renders:** an async queue (`queued → running → ok | failed`) deduplicated by `content_hash`.
- **logs:** append-only, kept 90 days. Never log secrets, tokens or resume/job content.

### API (`docs/backend/endpoints/`, draft)

- One file per resource: `auth`, `users`, `experiences`, `job-postings`, `resumes`, `renders`, `templates`. `README.md` has the full route table.
- **Conventions:**
  - JSON with snake_case fields and only public ids. Times are ISO 8601 UTC.
  - Bearer token on private routes. The refresh token travels in an HttpOnly cookie with `Path=/auth`.
  - **Someone else's resource returns 404**, never 403. PATCH is partial. No pagination.
  - AI calls are synchronous and log `ai.call`. When the AI fails, return `502` and save nothing.
- **Errors:** `{"detail": ...}`, using 400, 401, 404, 409, 413, 422, 429 and 502.
- **Known schema gap:** add `resume_renders.template_id` before building the gallery previews.

### Backend architecture (`docs/backend/README.md`, `docs/backend/architecture/`)

- **Layout:** `src/backend/` holds `main.py` (app, CORS, routers), `routers/<resource>.py` (one `APIRouter` each, mirroring the endpoint docs), `db.py` (settings, engine, `Base`, `get_db`), `models.py` (tables) and `schemas.py` (Pydantic shapes for jsonb columns and HTTP bodies). Imports only go downward.
- **Run:**
  ```
  docker compose up -d --wait
  cd backend && uv run fastapi dev src/backend/main.py
  ```
  Tests: `uv run pytest`.
- **Config:** pydantic-settings reads env vars, then `backend/.env`, then defaults. Add every new setting to `.env.example`. `DATABASE_URL` is required. CORS origins come from settings and must never be `*`.
- **Data layer:**
  - Validate jsonb with Pydantic before saving (`ExperienceData`, `ResumeContent`, `Link`).
  - Use `text("lower(username)")` for expression indexes, not `func.lower`.
  - When adding a column, update `docs/database/README.md` in the same PR.
- **Render worker** (design only, not built):
  - In production, LaTeX compiles in a Fly.io sandbox (`gru`) that holds no secrets and has no egress. Each compile runs in a `bwrap` jail with `tectonic --untrusted -C` and prlimits.
  - `/api/render` forwards to it for live preview (~0.3 s per keystroke).
  - A dispatcher with DB access claims queued renders, calls the sandbox and uploads the files.
  - Today `/api/render` is **dev-only** (404 outside `next dev`) and must never be deployed as is.

### Design system (`docs/design/README.md`, accepted)

- **Look:** warm paper, navy ink and one ultramarine accent. Liquid glass only where there is colour behind it.
- **Tokens:** only these, never raw hex.
  - `paper #F4F0EA`, `ink #161B22`, `mist #E9E3D9`.
  - `accent #4338F5` for fields. White text only; ink on accent fails contrast.
  - `accent-deep #271BF4` for buttons with white text.
  - `accent-text #180BEA` for small accent text.
- **Type:** Geist Serif (one weight, no italic) for display headings, Geist Sans for everything else. Sentence case. Never colour or italicise a single word in a headline.
- **Layout:** `max-w-6xl`, `px-4 sm:px-6`, `py-28 lg:py-36`, left-aligned. Grids start at `grid-cols-1`.
- **Responsive:**
  - `lg` switches compositions. Build a separate phone version instead of squeezing desktop.
  - Never scroll sideways. On phones, the hero must fit on the first screen.
  - Inputs use 16px text on mobile, and touch targets are 44px tall.
- **Glass:** `glass`, `glass-dark` and `glass-prism` (prism only on the nav, band cards and a few buttons). Never on flat paper.
- **Shape:** every interactive element is a pill. Shadows are tinted navy or ultramarine, never grey.
- **Buttons:** primary uses `bg-accent-deep`. Secondary uses glass on paper or colour, dark glass on ink, and an ink pill in the nav. Labels are verbs, with no arrows.
- **Motion:** it must answer the user or tell the story. Ambient motion lives only in the ocean band. Always respect `prefers-reduced-motion` and pause motion off screen.
- **Copy:** plain and direct, a little sassy about competitors, never about the user. No exclamation marks.
- **Accessibility:** every pair passes AA. Focus ring is 2px `accent-text`.
- **Build approach:** Tailwind first, server components by default. Reuse the existing class strings; add no new colours, fonts or radii.

### Security (`docs/security/README.md`, draft)

- **LaTeX injection:**
  - Every string reaches a template through one `tex_escape`: `tex.ts` in the frontend and `tex_escape` in the backend. Never concatenate user text into TeX.
  - Links are http(s)/mailto only and percent-encoded for `\href`.
  - The sandbox is the backstop. Compile logs are never returned.
- **Prompt injection** (job postings are untrusted, and so is model output):
  - Facts (employer, dates, contacts, links) are copied from the DB, not the model. Reject unknown `experience_ids`.
  - Strip new URLs, emails and phone numbers from model text.
  - JSON schema + Pydantic validation with length caps. Wrap untrusted text in delimiters.
  - Rate-limit AI routes and set `max_output_tokens`.
- **Usual web threats:** 404 against IDOR, a strict JWT, cookie-only refresh tokens, `oauth_state` checks, no `dangerouslySetInnerHTML` (except the editor field behind `safe`), byte-checked uploads, no fetching of user URLs (SSRF), signed URLs.
- Review checklists for render-worker PRs and AI-call PRs are at the end of the doc.

### Docs to-do (`docs/todo/README.md`)

- One file per mismatch between code and docs (contradiction, missing column/route/doc, scope drift, security gap), written by `/docs-check`. Resolve an item in the same PR that fixes it, then delete its file and its index row.

### Sessions (`docs/sessions/README.md`)

- One report per working session at `docs/sessions/YYYY-MM-DD-HHMM/README.md`, written from the template there, with a row added to the index. Reports record why decisions were made and what's left to do.
