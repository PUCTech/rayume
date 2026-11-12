# Rayume backend

The API behind Rayume: **FastAPI** for HTTP, **SQLAlchemy** as the ORM (Python classes that map to database tables), and **PostgreSQL** as the database, which runs locally in Docker so everyone gets the exact same setup.

Right now the backend has its data layer and one route (`/health`). Most of the other routes are still to come. See [What's here so far](#whats-here-so-far).

> More depth: [`docs/backend/`](../docs/backend/README.md) covers the stack, the [API contract](../docs/backend/endpoints/README.md) and the [architecture](../docs/backend/architecture/README.md). The tables are specified in [`docs/database/`](../docs/database/README.md).

---

## 1. Install the tools (once per machine)

You need two things:

| Tool | Why | Install (macOS) |
|------|-----|-----------------|
| [uv](https://docs.astral.sh/uv/) | Installs the right Python (3.14), creates the virtualenv and installs dependencies. You don't need to install Python yourself. | `brew install uv` |
| A Docker engine | Runs Postgres in a container | `brew install colima docker docker-compose` (or use Docker Desktop if you already have it) |

We use [Colima](https://github.com/abiosoft/colima) instead of Docker Desktop. It's a free, lightweight engine, and the normal `docker` commands work with it.

On Linux, install Docker Engine with your package manager. On Windows, use WSL2 with Docker Desktop.

Check that everything is there:

```bash
uv --version
docker --version
docker compose version
```

## 2. Set up the project (once per clone)

From the **repo root** (the `rayume/` folder):

```bash
# 1. Create your local config file from the template
cp backend/.env.example backend/.env

# 2. Install Python and all dependencies into backend/.venv
cd backend
uv sync
```

`backend/.env` holds your local settings and is git-ignored, so it never gets committed. The defaults already match the database from step 3, so you don't need to edit anything.

| Variable | What it is |
|----------|------------|
| `DATABASE_URL` | Where to find Postgres. The default points at the Docker container on `localhost:5432` (user, password and database are all `rayume`). |
| `CORS_ORIGINS` | Which frontend URLs may call the API from a browser. The default is the Next.js dev server, `http://localhost:3000`. |

## 3. Start the database

From the **repo root**:

```bash
colima start               # only with Colima, once after each reboot
docker compose up -d --wait
```

- `-d` runs Postgres in the background, so you get your terminal back.
- `--wait` returns only once Postgres is actually ready to accept connections.

Check that it's running:

```bash
docker compose ps          # STATUS should say "Up ... (healthy)"
```

Your data lives in a Docker volume, so it **survives** `docker compose down` and reboots. Only `docker compose down -v` deletes it.

## 4. Create the tables

There are no migrations yet (Alembic is on the to-do list), so for now you create the tables straight from the models. From `backend/`:

```bash
uv run python -c "import backend.models; from backend.db import Base, engine; Base.metadata.create_all(engine)"
```

It's safe to run more than once: tables that already exist are skipped. One catch: it **won't update** a table that already exists. If someone changes a model, reset your local database (see [Common tasks](#common-tasks)) and run it again.

To check it worked, open a SQL shell from the repo root and list the tables:

```bash
docker compose exec db psql -U rayume
```

```sql
\dt      -- should list 8 tables: users, experiences, resumes, ...
\q       -- quit
```

## 5. Run the API

From `backend/`:

```bash
uv run fastapi dev src/backend/main.py
```

The API runs on **http://localhost:8000** and restarts by itself every time you save a file.

Open these in your browser:

- <http://localhost:8000/health> should show `{"ok": true}`.
- <http://localhost:8000/docs> is interactive API documentation that FastAPI generates for you. You can call every route from there.

Stop the server with `Ctrl+C`.

## 6. Run the tests

From `backend/`:

```bash
uv run pytest
```

You need `backend/.env` (step 2), because importing the app reads `DATABASE_URL`. The current tests don't connect to the database, but tests that touch tables will need it running (step 3).

---

## Daily routine

Once everything is set up, starting work is just:

```bash
colima start                                          # Colima only, after a reboot
docker compose up -d --wait                           # from the repo root
cd backend && uv run fastapi dev src/backend/main.py
```

After pulling new changes, run `uv sync` in case someone added a dependency.

## Common tasks

| Task | Command | Run from |
|------|---------|----------|
| Install or refresh dependencies | `uv sync` | `backend/` |
| Add a dependency | `uv add <package>` (it updates `pyproject.toml` and `uv.lock`, so commit both) | `backend/` |
| Add a dev-only dependency | `uv add --dev <package>` | `backend/` |
| SQL shell | `docker compose exec db psql -U rayume` | repo root |
| Database logs | `docker compose logs db` | repo root |
| Stop Postgres (keeps your data) | `docker compose down` | repo root |
| Reset the database (**deletes all data**) | `docker compose down -v`, then steps 3 and 4 again | repo root |

## What's here so far

```
backend/
├── .env.example       template for your .env
├── pyproject.toml     dependencies (managed by uv; don't edit versions by hand)
├── src/backend/
│   ├── main.py        the FastAPI app, CORS setup and the /health route
│   ├── db.py          settings (read from .env), the database engine, Base, get_db()
│   ├── models.py      the 8 tables as SQLAlchemy classes, with enums, indexes and constraints
│   └── schemas.py     Pydantic shapes that validate what goes into the jsonb columns
└── tests/
```

The Postgres container itself is defined in [`compose.yaml`](../compose.yaml) at the repo root. It lives there because it will later hold the backend and frontend services too.

A few things that help when you start reading the code:

- **`get_db`** is a FastAPI dependency that gives a route a database session and closes it afterwards. Use it like this: `def my_route(db: Session = Depends(get_db))`.
- **Every `str` column is `text` and every `datetime` is `timestamptz`.** `Base` in `db.py` applies this for you, so don't add `String(255)` or a plain `DateTime`.
- **Public ids** (the ones that show up in URLs) come from `new_public_id()` in `models.py`. Never put the internal integer `id` in a URL.

## Troubleshooting

**`Cannot connect to the Docker daemon`**
The engine isn't running. With Colima, run `colima start`. With Docker Desktop, open the app.

**`port 5432 is already allocated` / `address already in use`**
Another Postgres is already running on your machine, probably one installed with Homebrew. Stop it with `brew services stop postgresql` (or whichever version you have), then run `docker compose up -d --wait` again.

**`ValidationError ... database_url Field required`**
`backend/.env` is missing. Go back to step 2 and run `cp backend/.env.example backend/.env`.

**`connection refused` on port 5432**
The database isn't running. Start it (step 3) and check `docker compose ps`.

**`relation "users" does not exist`**
The tables haven't been created yet. Run step 4.

**The browser shows a CORS error when the frontend calls the API**
The frontend's URL has to be listed in `CORS_ORIGINS` in your `.env`. Restart the API after you change `.env`.
