# Configuration

> Status: **draft**. Code: `Settings` in [`db.py`](../../../backend/src/backend/db.py). Template: [`backend/.env.example`](../../../backend/.env.example).

## How settings are read

`Settings` is a pydantic-settings class. Each field is read from an environment variable of the same name (case-insensitive), falling back to `backend/.env`, then to the field's default.

```
environment variable  >  backend/.env  >  default in Settings
```

A required field with no value stops the app at startup with a validation error, instead of failing at the first query.

| File | In git | Purpose |
|------|--------|---------|
| `backend/.env.example` | yes | Every setting with safe local values. Add new settings here |
| `backend/.env` | no (gitignored) | Your local copy: `cp backend/.env.example backend/.env` |

`.env` is found relative to `db.py`, so it works from any working directory. In CI and production there is no `.env`: set real environment variables instead. Anything that imports `backend.main` (including the tests) needs `DATABASE_URL` set.

## Settings

| Variable | Required | Default | Meaning |
|----------|----------|---------|---------|
| `DATABASE_URL` | yes | - | SQLAlchemy URL, `postgresql+psycopg://user:password@host:port/db`. Locally it matches the `db` service in [`compose.yaml`](../../../compose.yaml) |
| `CORS_ORIGINS` | no | `["http://localhost:3000"]` | JSON list of frontend origins allowed to call the API from a browser |

Never commit real secrets. The password in `compose.yaml` and `.env.example` is for the local database only.

## CORS

A browser blocks a page on one **origin** (scheme + host + port) from reading responses from another, unless the server allows it. `localhost:3000` (Next.js) and `localhost:8000` (the API) are different origins, so every browser call to the API goes through `CORSMiddleware` in `main.py`.

```mermaid
sequenceDiagram
  participant B as Browser on :3000
  participant A as API on :8000
  B->>A: OPTIONS /me (preflight: may origin :3000 call this?)
  A-->>B: Access-Control-Allow-Origin: http://localhost:3000
  B->>A: GET /me
  A-->>B: response, readable by the page
```

| Setting | Value | Why |
|---------|-------|-----|
| `allow_origins` | `settings.cors_origins` | Production sets its own frontend URL without a code change |
| `allow_credentials` | `True` | The refresh token is a cookie ([`auth.md`](../endpoints/auth.md)); the frontend sends it with `fetch(url, { credentials: "include" })` |
| `allow_methods`, `allow_headers` | `*` | Needed for `Authorization: Bearer` and JSON bodies |

Gotchas:

- `http://localhost:3000` and `http://127.0.0.1:3000` are different origins. Use `localhost`, or list both.
- Never use `["*"]` as origins: browsers reject it together with credentials, and it would let any site call the API as the user.
- CORS is enforced by browsers only. curl and Postman ignore it, so "works in Postman, fails in the app" usually means a missing origin.
