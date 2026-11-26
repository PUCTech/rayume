# Backend rules

> Status: **current**. The checklist for every change to [`backend/`](../../backend/), by people and agents. Context: [`README.md`](README.md).

A PR that adds or changes a route is done only when the code, its tests, its doc and its Postman request all agree.

## Before you write code

1. Read [`CLAUDE.md`](../../CLAUDE.md), then [`../database/README.md`](../database/README.md), the route's file in [`endpoints/`](endpoints/README.md) and [`architecture/`](architecture/README.md). For auth, AI calls, uploads or rendering, also read [`../security/README.md`](../security/README.md).
2. Check [`../todo/`](../todo/README.md) for open items in the area you're touching.
3. Build what the endpoint doc says: path, fields, status codes, `detail` codes, limits. If the code has to differ, change the doc in the same PR and say why in the PR description.

## Every route has a Postman request

[`postman/collections/Rayume API/`](../../postman/collections/) is the hand-kept catalogue: **one request per route**, one folder per resource. This applies to the routes you add, to the routes you change, and to any route you find without a request, even if someone else added it. Fix it in your PR, or log a to-do if it's out of scope.

- **Where:** `postman/collections/Rayume API/<Resource>/<Verb noun>.request.yaml`, e.g. `Auth/Login.request.yaml`. A new resource folder gets a `.resources/definition.yaml` with `$kind: collection`.
- **Auth:** private routes inherit `Bearer {{accessToken}}` from the collection (with auto-refresh); don't set auth on them. Public folders set `auth` to `type: noauth` in their `definition.yaml`, like `Auth/` and `Templates/`.
- **Shape:** copy an existing request. Use `{{baseUrl}}` and environment variables, never a hard-coded host, id or token. Add an `afterResponse` script that checks the status and one key field, and saves ids the next request needs (as **List templates** saves `templateSlug`).
- **Keep it in sync:** when a route's path, method, body, query parameters or success status changes, update its request in the same PR. When a route is removed, delete its file.
- **Environment:** new variables go in [`postman/environments/local.environment.yaml`](../../postman/environments/) with empty or fake values. Tokens and passwords are never real.
- **Don't hand-edit** the generated `postman/collections/FastAPI/` collection or `postman/specs/`. Postman regenerates them from FastAPI's `/openapi.json`. Improve the spec at the source (route `responses=`, docstrings, Pydantic models).
- Ordered scenarios (register → login → refresh → reuse) belong in pytest, not in Postman.

Check that the two lists match before you open the PR:

```bash
# routes the app serves (from backend/)
DATABASE_URL=postgresql+psycopg://x:x@localhost/x JWT_SECRET=test-secret-test-secret-test-secret-1234 \
  uv run python -c "from backend.main import app
for p, ops in app.openapi()['paths'].items():
    [print(m.upper(), p) for m in ops]"

# requests in the catalogue (from the repo root)
grep -rhE '^(url|method):' "postman/collections/Rayume API" | paste - -
```

## Code

- Follow the layout in [`architecture/`](architecture/README.md): one `APIRouter` per resource in `routers/`, Pydantic shapes in `schemas.py`, imports only go downward.
- Only `public_id` (or `slug`) leaves the API, never a `uuid`. Someone else's resource returns **404**, never 403.
- Validate jsonb with Pydantic before saving. Never log secrets, tokens or resume/job content.
- A new setting goes in `.env.example`. A new column goes in [`../database/README.md`](../database/README.md) in the same PR.
- Declare error responses on the route (`responses={409: {"description": "email_taken"}}`) so `/docs` and the Postman import show them.

## Tests

- Each new route gets pytest tests for its success case and every documented error.
- Use fake values only (see [`configuration.md`](architecture/configuration.md)). Never commit `.env`.
- Run `uv run pytest -q` in `backend/` before you push. Tests that need Postgres fail without Docker: say so in the PR, don't skip or fake them.

## The PR

- One focused change, conventional commit messages (`feat(auth): …`), English.
- The description lists the routes added or changed and confirms their Postman requests and endpoint doc are updated.
