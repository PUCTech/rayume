# Session 2026-11-12-2036

> Branch: `feat/backend-db` · Commits: `2636b5b`..`d13cba3` · Author: Raul Kolaric

## Summary

Turned the backend's empty README into an onboarding guide for the interns, checked the live database against the accepted schema, and loaded the frontend's template gallery into it. The branch was pushed to GitHub for the first time. Along the way the local Neovim setup was fixed so `.env` is visible.

## Done

- **Backend README** ([`backend/README.md`](../../../backend/README.md)):
  - Step-by-step local setup (`2636b5b`): tools, `.env`, starting Postgres, creating the tables, running the API and the tests, a daily routine, common tasks and troubleshooting.
  - Windows commands (`22efdad`): `winget` installs, Docker Desktop instead of Colima, a PowerShell daily routine without `&&`, and Windows-specific troubleshooting.
  - A file-by-file guide (`d13cba3`): a request-flow diagram (browser → FastAPI → session → ORM → psycopg → Postgres) and, for every file, what it does, why it exists and which technology it touches.
- **Schema check:** compared the live Postgres with [`docs/database/README.md`](../../database/README.md), covering columns, types, nullability, defaults, the 4 enums, foreign keys and their delete rules, unique constraints and indexes. Everything matched except `templates.tags` (see below), which is fixed.
- **Template seed** (`a2852cd`): [`seed.py`](../../../backend/src/backend/seed.py) upserts the 6 gallery templates (`slug`, `name`, `tags`, `tex_source` from `frontend/resumes/*.tex`, `preview_url`). Run with `uv run python -m backend.seed`. Ran twice to confirm it doesn't create duplicates.
- **Local database:** tables created with `create_all` and seeded. Rainfrog (`brew install rainfrog`) suggested as a terminal UI for browsing it.
- **Pushed** `feat/backend-db` to `origin`. No PR opened yet.
- **Editor, outside the repo:** the snacks.nvim explorer now shows dotfiles and git-ignored files (so `backend/.env` is visible), still hiding `.git`, `node_modules`, `.venv` and `__pycache__`.

## Decisions

| Decision | Why |
|----------|-----|
| `backend/.env` stays out of git; `.env.example` is the committed template | Later `.env` will hold real secrets (Gemini key, JWT key, production URLs), and a committed secret stays in the git history. |
| Windows instructions target native PowerShell, not WSL | Fewer moving parts for interns, and every command except `colima` and `&&` works unchanged. |
| Seed data typed out in `seed.py` instead of parsed from `data.ts` | Parsing TypeScript from Python is fragile, and the list only has six entries. The cost is that a new template has to be added in both files. |
| `preview_url` points to the frontend's `/resumes/<slug>.png` | It's the image the gallery already serves. It should move to object storage once renders exist. |
| `tex_source` stored exactly as the file reads | Inlining `\input{common}` / `\input{body}` should wait until the render worker shows what format it needs. |
| Tags are layout plus source (`one-column`, `overleaf`, `rayume`) | They're the only categories `data.ts` already has. |

## Problems found

- **`templates.tags` was `varchar[]`, not `text[]`.** `Base`'s `str → Text` mapping doesn't reach inside `ARRAY(String)`. Changed it to `ARRAY(Text)`, then dropped and recreated the tables, which were still empty.
- **The first README called the internal `id` an integer.** It's a `uuid`. Fixed in `22efdad`.
- **The first test-requirements note was wrong.** It said the tests need the database running; they only need `.env`. Fixed before the first commit.
- **Pyright can't resolve imports** in `backend/` from Neovim. The editor is probably not finding `backend/.venv`. The code runs fine.

## Open

- **Open a PR** for `feat/backend-db`. Check first for open PRs that touch `docs/endpoints/`, because they will conflict with the move to `docs/backend/endpoints/`.
- **Windows instructions are untested.** Ask an intern on Windows to run through them and report what's off.
- **Still open from the previous session:** Alembic migrations (replacing `create_all`), `GET /templates`, the `author` / `license` question (`data.ts` has them, the table doesn't), nullable `email` for GitHub accounts, and `DATABASE_URL` in CI.
- `.playwright-mcp/` is untracked tool output; add it to `.gitignore`.
- Point Pyright at `backend/.venv` (for example a `[tool.pyright]` section with `venvPath` / `venv`).
