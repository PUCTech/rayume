# Session 2026-11-13-2150

> Branch: `feat/frontend-polish` · Commits: `ffd10a6` (everything after it is still uncommitted) · Author: raulkolaric

## Summary

Started a frontend polish branch and fixed the signup form, then spent most of the session on a resume editor where you change the real LaTeX PDF by writing on it, and on reshaping the signed-in part of the site around it: one `/resumes` home and a full-page editor per resume, replacing the `/app` workspace. Along the way the landing page got a "prism" liquid glass look and a new section, the templates page was rebuilt for density and real filters, and the GitHub OAuth app credentials were added to the backend. Only the signup work is committed.

## Done

- **Branch:** pulled `main` (PR #14 merged) and created `feat/frontend-polish`.
- **Signup and login** (`ffd10a6`, [`(auth)/form.tsx`](../../../frontend/app/(auth)/form.tsx)): a confirm-password field that unfolds 2s after the password is first focused or typed in, easing the layout down; the browser's validation bubbles replaced by inline messages in pastel vermilion (new `error` / `error-text` tokens in [`globals.css`](../../../frontend/app/globals.css)), with a fade-in and a short shake.
- **Resumes, the signed-in home** ([`resumes/home.tsx`](../../../frontend/app/resumes/home.tsx)): an app bar (no marketing nav or footer), a dense grid of small cards, tabs All / Tailored / General, search and sort, a menu per card (Open, Download PDF, Duplicate, Delete). The **Master resume** is always the first card. **New resume** starts from the master or tailors it to a saved job, and a **Saved jobs, no resume yet** strip offers Tailor for jobs with no resume. The list lives in the browser for now ([`resumes/store.ts`](../../../frontend/app/resumes/store.ts)).
- **The editor, a page per resume** (`/resumes/[id]`, [`resumes/editor.tsx`](../../../frontend/app/resumes/editor.tsx), [`[id]/open.tsx`](../../../frontend/app/resumes/[id]/open.tsx)): a top bar (back, title, one-page warning, Download PDF, Rayume chat toggle), the PDF across the width and the chat on the right.
  - **Writing on the PDF** ([`overlay.tsx`](../../../frontend/app/resumes/overlay.tsx), [`inplace.tsx`](../../../frontend/app/resumes/inplace.tsx)): a click on any text puts the caret where you clicked (bullets, titles, companies, dates, locations, the name, skill lines). The text is set in the PDF's own embedded font and size, and the page re-flows live as a bullet gains or loses lines. Enter splits a bullet, Backspace on an empty one deletes it, Esc cancels, ↑/↓ move between bullets, ⌘Z / ⇧⌘Z undo and redo.
  - **Into the real LaTeX** ([`tex.ts`](../../../frontend/app/resumes/tex.ts), [`regions.ts`](../../../frontend/app/resumes/regions.ts)): every change goes into a document applied to the pristine [`body.tex`](../../../frontend/resumes/body.tex), escaped, and typeset through [`/api/render`](../../../frontend/app/api/render/route.ts) (now accepts a body) in about 0.4s. Code mode shows the template with the body written in, kept in sync. Edits are kept per resume in localStorage.
  - **Rayume:** select text in the PDF or the code and "Paste into chat" (several quotes at once); focus an entry via its ✦ button, pick bullets with the margin checkboxes and ask for rewrites; "Replace in resume" and "Add to resume" (a new project) go into the PDF.
  - **Master vs the rest:** on the master, edits are what new resumes start from; on another resume, a bar offers **Update from master** once the master changed since. Tailored resumes get a job chip with the posting's keywords, marked covered or missing from the resume's current text.
- **PDF viewer** ([`templates/pdf.tsx`](../../../frontend/app/templates/pdf.tsx), [`pdf.css`](../../../frontend/app/templates/pdf.css)): selectable text through pdf.js's `TextLayerBuilder`, zoom (fit to width by default, never pushing the chat aside), an overlay hook, and in the editor only, text as real DOM text in the embedded fonts with the canvas holding just the rules.
- **Templates page** ([`templates/browser.tsx`](../../../frontend/app/templates/browser.tsx), [`panel.tsx`](../../../frontend/app/templates/panel.tsx), [`data.ts`](../../../frontend/app/templates/data.ts)): a one-row header with search, a sticky filter bar (ATS-friendly, layout, colour, density, sort), a 4-column grid, and "Use this template" on cards and in the detail panel (goes to `/signup?template=…`).
- **Landing page** ([`page.tsx`](../../../frontend/app/page.tsx), [`prism.css`](../../../frontend/app/prism.css), [`lens.tsx`](../../../frontend/app/lens.tsx)): prism glass (uneven rainbow rim, pink and cyan edge light, light blur and bend) on the header, the four band cards and three buttons; "Build my resume" → `/signup`, "See the templates" → `/templates`; the gallery section replaced by **Edit it like a document**, linking to the editor.
- **Favicon** ([`app/icon.svg`](../../../frontend/app/icon.svg)): the manta mark on an ultramarine tile, replacing Next's default `favicon.ico`.
- **`/app` retired:** redirects to `/resumes`; the sidebar workspace and HTML resume are deleted, keeping only the chat's scripted replies.
- **GitHub OAuth app `rayume-dev`:** callback `http://localhost:8000/auth/github/callback`; `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` declared in [`db.py`](../../../backend/src/backend/db.py) and listed in [`.env.example`](../../../backend/.env.example).
- **Outside the repo:** the GitHub OAuth app itself, and the credentials in `backend/.env` (git-ignored).

## Decisions

| Decision | Why |
|----------|-----|
| One signed-in app: `/resumes` home plus `/resumes/[id]` editor; `/app` redirects | Neither the old gallery page nor the sidebar workspace held up, and the editor deserved its own page rather than a drawer. Chosen by the user over fixing `/app` or polishing `/resumes`. |
| The Master Resume replaces the UI's "main resume" | The schema has no main resume: the master is the `experiences` table, and resumes are snapshots. |
| No automatic sync between a resume and the master | Resumes are snapshots on purpose, and a resume entry keeps no experience id. Master changes reach a resume through Update from master (the API's `regenerate`). |
| Job postings shown where they matter (job chip, New resume, Saved jobs strip), no jobs page | Keywords versus the resume is the useful view, and it fits the existing `keywords` field. |
| The editor shows the PDF's text as DOM text in its own embedded fonts, never an image of it | Needed to put a caret on the page and re-flow it; the user rejected a canvas copy. Each run is placed on the PDF's baseline and justified with word spacing. |
| Templates show pdf.js's canvas render, not DOM text | DOM text lost AltaCV's colours, icons and metrics. Reverted at the user's request. |
| Edits saved on Enter or blur, not per keystroke | Typesetting takes about 0.4s; the page re-flows locally while you type and the real PDF swaps in under it. |
| Prism glass only on the header, the four cards and three buttons | It read as too much everywhere; light surfaces keep their white frosting so text stays readable. |
| One bend pattern drawn once, not `feTurbulence` per frame | The ocean behind the glass animates, so every backdrop filter re-runs each frame; generating noise every time made it lag. |
| Classic as the master's template | The schema has no preferred-template field, and the user asked not to change it. |
| Resume list, edits and master changes in localStorage | The API has no `/resumes` or `/experiences` routes yet; each is marked with a `shortcut:` comment. |
| Typographic punctuation spelled the LaTeX way (`--`, `'`) | The resume fonts have no glyph for a typed "–" or "’", which silently vanished from the PDF. |

## Problems found

- **The user's dev server served stale CSS** from `globals.css` several times (auth error colours, the PDF text layer); new CSS lives next to its component (`pdf.css`, `prism.css`).
- **pdf.js text selection jumped** across gaps until switching from the bare `TextLayer` to `TextLayerBuilder`.
- **A typeset landing mid-sentence threw away what was being typed;** fixed by keeping the typed text and caret in state and committing a blur only if the field is still on the page.
- **Clicks after pressing on text were dropped** because pdf.js moves its end-of-content element during a press; the overlay listens for pointerup instead.
- **A math-font "•" sat too high and justified lines drifted;** fixed with baseline nudges and word spacing per run.
- **Arrow-key navigation lost the bullet's edit;** it now saves before moving.
- **A pydantic-settings `.env` with unknown keys would have stopped the API from starting;** fixed by declaring the GitHub fields.
- **Only Classic and Modern build from `body.tex`.** Jake's, Awesome CV, AltaCV and moderncv carry their own copy of the text, so editor changes and Update from master don't reach their PDFs. The editor now says so on those templates.

## Open

- **Commit the session's work.** Everything after `ffd10a6` is uncommitted (landing, templates, `/resumes`, editor, favicon, backend settings). `favicon.ico` and `gallery.tsx` deletions are already staged.
- **Convert the four Overleaf templates to read the shared content,** so every template renders from one source (the API's `ResumeContent`). AltaCV's two columns are the hardest.
- **Editor with coloured templates:** DOM text is forced to black, so Modern, Awesome CV and AltaCV lose colours and icons while editing.
- **Wire to the API when it exists:** `GET/POST/PATCH /resumes`, `PATCH /experiences` for master edits, `POST /resumes` with `job_posting_id` for AI tailoring, `regenerate`, and the AI chat routes (the chat is scripted). Signup should read `?template=`.
- **Small editor gaps:** the PDF doesn't refit when the chat is hidden; the job-chip popover only closes from its own button; "Paste a new posting" isn't built.
- **The editor polish loop** started with `/loop` is still scheduled for this session.
- Add `.playwright-mcp/` to `.gitignore`.
