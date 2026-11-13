# Session 2026-11-12-1130

> Branch: `feat/backend-db` · Commits: `19e6126`..`cf228e3` · Author: Raul Kolaric

## Summary

Started the backend's data layer from a FastAPI walkthrough: a local Postgres in Docker Compose, SQLAlchemy models for all eight tables in the accepted schema, Pydantic shapes for the jsonb columns, settings from `.env` and CORS for the frontend. The backend docs were reorganised so the API contract and the implementation notes live side by side. The `/templates` route was deliberately left for later.

## Done

- **Local Postgres** (`19e6126`): Postgres 18 as the `db` service in [`compose.yaml`](../../../compose.yaml), run through Colima instead of Docker Desktop. [`backend/.env.example`](../../../backend/.env.example) holds `DATABASE_URL`. A new `backend/.gitignore` keeps `.env` and `__pycache__/` out, and the `.pyc` files that had been committed were untracked.
- **Data layer** (`75863d3`):
  - [`db.py`](../../../backend/src/backend/db.py): `Settings` (pydantic-settings), engine, declarative `Base` that applies the `text` / `timestamptz` conventions, and the `get_db` dependency.
  - [`models.py`](../../../backend/src/backend/models.py): the eight tables, four enums, foreign keys with their delete rules, and every index and constraint from [`database/README.md`](../../database/README.md).
  - [`schemas.py`](../../../backend/src/backend/schemas.py): `ExperienceData`, `ResumeContent` and `Link`, which validate what goes inside the jsonb columns.
  - Checked against the running database inside a rolled-back transaction: tables, enums, defaults, `timestamptz`, case-insensitive usernames.
- **CORS** (`75863d3`): origins come from `CORS_ORIGINS` (default `http://localhost:3000`), with `allow_credentials=True` for the refresh cookie. Checked with a real preflight request: the allowed origin is accepted, a foreign one gets `400`.
- **Docs** (`cf228e3`): `docs/endpoints/` moved to [`docs/backend/endpoints/`](../../backend/endpoints/README.md). New [`docs/backend/README.md`](../../backend/README.md) (stack, running locally) and [`docs/backend/architecture/`](../../backend/architecture/README.md) (code layout, [data layer](../../backend/architecture/data-layer.md), [configuration](../../backend/architecture/configuration.md)). Every link to the old path was updated, including three frontend comments. This folder, `docs/sessions/`, was started.
- **Editor, outside the repo:** Neovim scroll lag fixed by turning off `mini.animate`'s scroll and cursor animations; `render-markdown.nvim` added for viewing `.md` files in nvim.

## Decisions

| Decision | Why |
|----------|-----|
| Docker Compose for Postgres, via Colima | Every teammate gets the same database with one command, and CI/CD needs a compose file anyway. Colima means no Docker Desktop. |
| `compose.yaml` at the repo root, not in `backend/` | It will grow to include the backend and frontend services for the pipeline |
| Pydantic shapes for the jsonb columns now; HTTP bodies later | Postgres can't validate inside jsonb, and the docs require AI output to be validated. Request and response bodies belong with the routes that use them. |
| `public_id` from `secrets.token_urlsafe(9)` | Gives the 12 URL-safe characters the docs ask for without adding a nanoid dependency |
| `users.name` and `users.email` are `NOT NULL` | Register requires both. See the open question about OAuth below. |
| `CORS_ORIGINS` comes from settings | Production sets its own frontend URL without a code change |
| Docs split into `backend/endpoints/` (contract) and `backend/architecture/` (implementation) | They change for different reasons and are read by different people. `database/` stays shared at the top level. |
| Session folders named `YYYY-MM-DD-HHMM`, not a hash | Equally unique, but readable and sortable |

## Problems found

- **Username index bug, caught before commit.** `func.lower("username")` builds an index on `lower('username')`, a constant, so every user after the first would have been rejected. The first test passed for the wrong reason, because it only checked that a duplicate failed. Fixed with `text("lower(username)")` and re-tested in both directions: different usernames are allowed and `raul`/`RAUL` is blocked.
- **`.pyc` files were committed** because the backend had no `.gitignore`. They are now untracked and ignored.
- **The template spec doesn't match the table.** [`templates.md`](../../backend/endpoints/templates.md) returns `author` and `license`, but the `templates` table has no such columns.

## Open

- **`GET /templates`** and `GET /templates/{slug}` with the `q` / `tag` filters, which was left on purpose. Needs a `TemplateOut` / `TemplateDetail` response schema with `from_attributes=True`.
- **Migrations:** add Alembic. Nothing creates the tables yet; `Base.metadata.create_all(engine)` is a stopgap only.
- **Seed templates** from `frontend/app/templates/data.ts`.
- **Team questions:** add `author` / `license` to `templates`, or drop them from the spec? And should `email` be nullable for GitHub accounts that keep their email private?
- **CI:** importing `backend.main` needs `DATABASE_URL`, so the pipeline must set it (or start the compose `db` service) before running pytest.
- **Not pushed:** `feat/backend-db` exists only locally. Open PRs that touch `docs/endpoints/` will conflict with the move.
- `~/.docker/config.json` still uses Docker Desktop's credential helper (`credsStore: "desktop"`). If Docker Desktop is uninstalled, run `brew install docker docker-credential-helper`.
