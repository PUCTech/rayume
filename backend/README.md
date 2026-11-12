# Rayume backend

The API behind Rayume: **FastAPI** for HTTP, **SQLAlchemy** as the ORM (Python classes that map to database tables), and **PostgreSQL** as the database, which runs locally in Docker so everyone gets the exact same setup.

Right now the backend has its data layer and three routes: `/health`, `GET /templates` and `GET /templates/{slug}`. The other routes are still to come. See [What's here so far](#whats-here-so-far).

> More depth: [`docs/backend/`](../docs/backend/README.md) covers the stack, the [API contract](../docs/backend/endpoints/README.md) and the [architecture](../docs/backend/architecture/README.md). The tables are specified in [`docs/database/`](../docs/database/README.md).

> **Windows users:** run everything in **PowerShell** (Windows Terminal opens it by default). Almost every command below works the same there. Where Windows is different, there's a separate **Windows** block or note.

---

## 1. Install the tools (once per machine)

You need two things:

| Tool | Why | macOS | Windows (PowerShell) |
|------|-----|-------|----------------------|
| [uv](https://docs.astral.sh/uv/) | Installs the right Python (3.14), creates the virtualenv and installs dependencies. You don't need to install Python yourself. | `brew install uv` | `winget install --id=astral-sh.uv -e` |
| A Docker engine | Runs Postgres in a container | `brew install colima docker docker-compose` (or use Docker Desktop if you already have it) | `winget install -e --id Docker.DockerDesktop` |

On macOS we use [Colima](https://github.com/abiosoft/colima) instead of Docker Desktop. It's a free, lightweight engine, and the normal `docker` commands work with it.

On Windows, Docker Desktop runs on top of WSL2. The installer turns WSL2 on for you if it isn't already, and may ask you to restart. After installing, **open a new PowerShell window**, so it can find the new `uv` and `docker` commands.

On Linux, install Docker Engine with your package manager.

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

These work as they are in PowerShell too: `cp` is a built-in shortcut for `Copy-Item` there, and forward slashes in paths are fine.

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

**Windows:** skip `colima start`. Instead, open **Docker Desktop** from the Start menu and wait until it says the engine is running. Then run `docker compose up -d --wait`.

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

Then fill the `templates` table with the gallery from the frontend (the six LaTeX templates in `frontend/resumes/`). From `backend/`:

```bash
uv run python -m backend.seed
```

This is also safe to run again: it updates the templates that already exist instead of duplicating them. The other tables stay empty until the app writes to them.

## 5. Run the API

From `backend/`:

```bash
uv run fastapi dev src/backend/main.py
```

The API runs on **http://localhost:8000** and restarts by itself every time you save a file.

Open these in your browser:

- <http://localhost:8000/health> should show `{"ok": true}`.
- <http://localhost:8000/templates> should list the 6 templates from step 4. Try `?q=modern` or `?tag=overleaf&tag=one-column`, or open one with <http://localhost:8000/templates/jake>.
- <http://localhost:8000/docs> is interactive API documentation that FastAPI generates for you. You can call every route from there.

Stop the server with `Ctrl+C`.

## 6. Run the tests

From `backend/`:

```bash
uv run pytest
```

You need `backend/.env` (step 2) and the database running (step 3), with the tables created (step 4). The template tests insert their own rows inside a transaction and roll it back at the end, so they never change your data and don't need the seed.

---

## Daily routine

Once everything is set up, starting work is just:

```bash
colima start                                          # Colima only, after a reboot
docker compose up -d --wait                           # from the repo root
cd backend && uv run fastapi dev src/backend/main.py
```

**Windows (PowerShell):** open Docker Desktop first, then:

```powershell
docker compose up -d --wait                           # from the repo root
cd backend
uv run fastapi dev src/backend/main.py
```

`cd` gets its own line because the older Windows PowerShell 5.1 that comes with Windows doesn't understand `&&`.

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
| Reload the templates after changing a `.tex` file | `uv run python -m backend.seed` | `backend/` |

## What's here so far

```
rayume/
├── compose.yaml           the local Postgres container
└── backend/
    ├── .env.example       template for your .env
    ├── .env               your local settings (you create it, git ignores it)
    ├── .gitignore         keeps .env, .venv/ and __pycache__/ out of git
    ├── pyproject.toml     project metadata and dependencies
    ├── uv.lock            the exact version of every dependency
    ├── src/backend/
    │   ├── main.py        the FastAPI app: CORS and the routes
    │   ├── db.py          settings, database connection, Base, get_db()
    │   ├── models.py      the 8 tables as Python classes (the ORM layer)
    │   ├── schemas.py     Pydantic shapes for the data inside jsonb columns
    │   └── seed.py        loads the frontend's templates into the database
    └── tests/
        ├── test_health.py    checks that /health answers
        └── test_templates.py checks /templates against a real database
```

### How the pieces fit together

```
browser / frontend (Next.js, :3000)
        │  HTTP request
        ▼
main.py        FastAPI receives it, checks CORS, picks the route
        │  route asks for a session with Depends(get_db)
        ▼
db.py          opens a SQLAlchemy Session on the engine (settings come from .env)
        │  you work with Python objects from models.py ...
        ▼
models.py      ... and SQLAlchemy (the ORM) turns them into SQL
        │  psycopg (the driver) sends that SQL over the network
        ▼
PostgreSQL     running in Docker, started by compose.yaml (:5432)
```

`schemas.py` sits beside this flow. Before JSON data goes into a `jsonb` column, a Pydantic model in `schemas.py` checks that it has the right shape.

### Each file, one by one

**`compose.yaml`** (repo root) · *Docker Compose, PostgreSQL*
Describes the Postgres 18 container: its user, password and database name (all `rayume`), port `5432`, a volume so your data survives restarts, and a health check so `docker compose up --wait` knows when it's ready. **Why:** everyone gets the same database with one command, without installing Postgres on their machine. It lives at the repo root, not in `backend/`, because it will later also start the backend and frontend for the CI/CD pipeline.

**`backend/.env.example`** · *pydantic-settings*
A template listing every setting the backend needs (`DATABASE_URL`, `CORS_ORIGINS`), filled with values that work locally. **Why:** it's committed so a newcomer knows exactly what to configure. You copy it to `.env`.

**`backend/.env`** · *pydantic-settings*
Your own copy of the settings. `db.py` reads it on startup. **Why it's not in git:** later it will hold real secrets (API keys, production passwords), and anything committed stays in the git history forever. Production and CI set these values as environment variables instead.

**`backend/.gitignore`** · *git*
Keeps `.env`, the virtualenv `.venv/` and Python's compiled `__pycache__/` files out of git. **Why:** they're local to each machine or generated automatically, and committing them causes noise and conflicts. Before this file existed, `.pyc` files had been committed by accident.

**`backend/pyproject.toml` and `backend/uv.lock`** · *uv*
`pyproject.toml` lists the dependencies we chose (FastAPI, SQLAlchemy, psycopg, pydantic-settings, ...). `uv.lock` pins the exact version of each one and of everything they depend on. **Why:** `uv sync` installs the same versions on every machine, so "works on my machine" problems don't come from version differences. Change them with `uv add`, not by hand, and commit both files.

**`src/backend/main.py`** · *FastAPI, CORS*
Creates the FastAPI `app`. That's what `uv run fastapi dev` starts. It adds the **CORS** middleware: browsers block a page on `localhost:3000` from calling an API on `localhost:8000` unless the API explicitly allows it, so we allow the origins listed in `CORS_ORIGINS`. `allow_credentials=True` lets the browser send the refresh-token cookie later. It holds the routes: `/health`, which shows the server is up, and `GET /templates` / `GET /templates/{slug}` for the gallery (see [`templates.md`](../docs/backend/endpoints/templates.md)). **Why:** it's the entry point. New routes get plugged in here, until there are enough to split them into one `APIRouter` file per resource.

**`src/backend/db.py`** · *pydantic-settings, SQLAlchemy, psycopg*
Four things, all about connecting to the database:
- `Settings` reads `.env` and checks it. If `DATABASE_URL` is missing, the app refuses to start with a clear error instead of failing later.
- `engine` is SQLAlchemy's connection to Postgres. The `+psycopg` in `DATABASE_URL` tells it to use the psycopg driver.
- `Base` is the parent class of every model. It applies the team rule *every `str` is `text`, every `datetime` is `timestamptz`*, so you never write `String(255)` or a plain `DateTime`.
- `get_db()` is a FastAPI dependency that gives a route a database session and closes it when the request ends. Use it like this: `def my_route(db: Annotated[Session, Depends(get_db)])`.

**`src/backend/models.py`** · *SQLAlchemy ORM, PostgreSQL*
The 8 tables from [`docs/database/`](../docs/database/README.md), written as Python classes. This is the **ORM** (Object-Relational Mapper): instead of writing SQL by hand, you work with Python objects, `User(name="Ana")`, `db.add(user)`, `select(User)`, and SQLAlchemy writes the SQL. The file also defines:
- the 4 enums (`ExperienceType`, `RenderKind`, ...), which become real Postgres enum types;
- foreign keys and what happens on delete (cascade, set null, restrict);
- every index and unique constraint, including the case-insensitive username index;
- `new_public_id()`, which makes the short random ids that show up in URLs. Never put the internal `uuid` `id` in a URL.

**Why:** one place defines the database's structure, and `Base.metadata.create_all()` builds the tables from it (step 4). When Alembic arrives, it will compare these classes with the database to generate migrations.

**`src/backend/schemas.py`** · *Pydantic*
Pydantic models for data crossing a boundary. First, the JSON stored inside `jsonb` columns: `ExperienceData` (what the AI extracts from an experience), `ResumeContent` (a full resume snapshot) and `Link`. **Why:** Postgres stores any JSON in a `jsonb` column without checking it, and AI output can be malformed. These models reject bad data before it reaches the database. The difference from `models.py`: models describe *tables*, schemas describe *the shape of data*. Second, HTTP bodies: `TemplateOut` and `TemplateDetail` decide which fields `/templates` returns. `from_attributes=True` lets them read a SQLAlchemy object directly, and anything not listed (like the internal `id`) is left out of the JSON.

**`src/backend/seed.py`** · *SQLAlchemy, PostgreSQL*
Fills the `templates` table with the 6 LaTeX templates from the frontend's gallery. It reads the `.tex` files from `frontend/resumes/` and uses a Postgres *upsert* (`INSERT ... ON CONFLICT DO UPDATE`), so running it again updates the rows instead of duplicating them. **Why:** the app needs templates to exist before anyone can render a resume, and a script means everyone gets the same data. The six templates are also listed in `frontend/app/templates/data.ts`, so a new template has to be added in both places.

**`tests/test_health.py`** · *pytest, FastAPI TestClient*
Calls `/health` through FastAPI's `TestClient`, without starting a real server, and checks the response. **Why:** it's the smallest possible test, proving the app starts and the test setup works. Real tests will follow the same pattern.

**`tests/test_templates.py`** · *pytest, SQLAlchemy, PostgreSQL*
Tests `/templates` against the real database: ordering, case-insensitive search, repeated tags and the `404`. A fixture opens a transaction, inserts three test templates, swaps `get_db` for a session inside that transaction (`app.dependency_overrides`), and rolls everything back afterwards. **Why:** testing against real Postgres catches what a fake wouldn't (array `@>`, `ILIKE`), and the rollback keeps your local data untouched. Use this fixture as the model for future database tests.

## Troubleshooting

**`Cannot connect to the Docker daemon`** (on Windows: `error during connect` or `open //./pipe/docker_engine`)
The engine isn't running. With Colima, run `colima start`. With Docker Desktop, open the app and wait until it says the engine is running.

**`port 5432 is already allocated` / `address already in use`**
Another Postgres is already running on your machine.
- macOS: probably one installed with Homebrew. Stop it with `brew services stop postgresql` (or whichever version you have).
- Windows: probably one installed with the EDB installer, running as a Windows service. Find its name with `Get-Service *postgres*`, then stop it from a PowerShell opened **as Administrator** with `Stop-Service <name>` (for example `Stop-Service postgresql-x64-17`).

Then run `docker compose up -d --wait` again.

**Windows: `uv` or `docker` is not recognized**
The terminal was opened before you installed them. Close it and open a new PowerShell window.

**Windows: `running scripts is disabled on this system`**
This happens if you try to activate the virtualenv by hand. You don't need to: `uv run` uses it automatically.

**`ValidationError ... database_url Field required`**
`backend/.env` is missing. Go back to step 2 and run `cp backend/.env.example backend/.env`.

**`connection refused` on port 5432**
The database isn't running. Start it (step 3) and check `docker compose ps`.

**`relation "users" does not exist`**
The tables haven't been created yet. Run step 4.

**The browser shows a CORS error when the frontend calls the API**
The frontend's URL has to be listed in `CORS_ORIGINS` in your `.env`. Restart the API after you change `.env`.
