# Backend

> Status: **draft**. FastAPI service in [`backend/`](../../backend/). Product context: [`../PROJECT.md`](../PROJECT.md).
> Tables are specified in [`../database/README.md`](../database/README.md); threats in [`../security/README.md`](../security/README.md).

## Contents

| Doc | What it answers |
|-----|-----------------|
| [`endpoints/`](endpoints/README.md) | **What** the API does: every route, its parameters, responses and errors |
| [`architecture/`](architecture/README.md) | **How** it's built: code layout, the data layer, configuration |

Building a feature: read its endpoint file for the contract, then the architecture docs for where the code goes.

## Stack

| Piece | Role |
|-------|------|
| FastAPI | HTTP routing, request validation, generated docs at `/docs` |
| Pydantic 2 | Validates data at every boundary (HTTP bodies, jsonb columns) |
| SQLAlchemy 2 | ORM: tables as Python classes |
| psycopg 3 | PostgreSQL driver used by SQLAlchemy |
| pydantic-settings | Reads configuration from the environment and `backend/.env` |
| PostgreSQL 18 | Database, run locally with Docker Compose |
| uv | Python version, virtualenv and dependencies |
| pytest | Tests |

## Run it locally

Prerequisites: [uv](https://docs.astral.sh/uv/) and a Docker engine. On macOS without Docker Desktop, [Colima](https://github.com/abiosoft/colima) works: `brew install colima`.

First time only, from the repo root:

```bash
cp backend/.env.example backend/.env
cd backend && uv sync
```

Every time:

```bash
colima start                               # macOS + Colima only, once per boot
docker compose up -d --wait                # Postgres on :5432, from the repo root
cd backend && uv run fastapi dev src/backend/main.py   # API on :8000, reloads on save
```

Check: <http://localhost:8000/health> returns `{"ok": true}`; <http://localhost:8000/docs> lists the routes.

| Task | Command |
|------|---------|
| Run the tests | `cd backend && uv run pytest` |
| SQL shell | `docker compose exec db psql -U rayume` |
| Database logs | `docker compose logs db` |
| Stop Postgres (keeps data) | `docker compose down` |
| Stop and **delete** all data | `docker compose down -v` |
