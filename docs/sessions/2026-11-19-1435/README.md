# Session 2026-11-19-1435

> Branch: `feat/polish` · Commits: `40d7733`..`5ebde02` · Author: raulkolaric

## Summary

Postman v12 had turned `postman/` into its new Native Git layout on its own. After some research, the session adopted that layout instead of fighting it. The collection is now one request per route, has bearer auth with auto-refresh, and imports FastAPI's OpenAPI spec. The ordered auth scenario stays in pytest. The spec itself got richer so the import is useful. The API wouldn't start, which turned out to be a missing local `JWT_SECRET`.

## Done

- **Native Git layout** (`40d7733`): the two v2.1 JSON exports became v3 YAML under [`postman/collections/Rayume API/`](../../../postman/collections/) and [`postman/environments/`](../../../postman/environments/), one `*.request.yaml` per request. [`.postman/resources.yaml`](../../../.postman/resources.yaml) is committed, so a clone opens in the same Postman workspace.
- **One request per route:** `Auth/` keeps Register, Login, Refresh and Logout, each with a status check and a script that saves the tokens. The six scenario requests were deleted: email taken, wrong password, reuse, family revoked, login again, refresh after logout. `oldRefreshToken` left the `local` environment.
- **Collection auth** (`7de5b3f`): `Bearer {{accessToken}}` on the collection, so new private routes inherit it. A collection pre-request script calls `/auth/refresh` when the access token has under a minute left, skipping `/auth/*`. Both are in [`Rayume API/.resources/definition.yaml`](../../../postman/collections/Rayume%20API/.resources/definition.yaml).
- **OpenAPI import** (`7de5b3f`): Postman imported `/openapi.json` as [`postman/specs/FastAPI/index.json`](../../../postman/specs/) plus a generated `FastAPI` collection. [`.postman/workflows.yaml`](../../../.postman/workflows.yaml) keeps them in sync.
- **Richer OpenAPI spec** (`ffa2e61`):
  - [`main.py`](../../../backend/src/backend/main.py) titles the app "Rayume API" 0.1.0.
  - Every route in [`routers/auth.py`](../../../backend/src/backend/routers/auth.py) and [`routers/templates.py`](../../../backend/src/backend/routers/templates.py) has a one-line description.
  - [`schemas.py`](../../../backend/src/backend/schemas.py) gives the login and register fields examples.
  - Login, register and refresh declare their 401/409 responses.
  - Refresh and logout read the cookie through `Cookie(alias="refresh_token")` instead of `request.cookies`. Behaviour is unchanged, but the spec now lists the cookie. Suite: 25 passed.
- **Templates folder** (`5ebde02`): Postman's generated `templates-1` was rebuilt in the Auth style. **List templates** saves the first slug to `templateSlug`, and **Get template** uses it. The `q`/`tag` params are present but disabled. The generated placeholder examples are gone. Templates, Auth and Health are set to `noauth`. Checked against the dev API: 6 templates, `/templates/altacv` returns 200.
- **Outside the repo:** a generated `JWT_SECRET` was added to the local `backend/.env`, and the API starts again (`/health` → `{"ok":true}`). Untracked Postman scaffolding (`.postman/`, empty `postman/*` folders) was deleted once, then came back when the app reopened the folder and was kept.

## Decisions

| Decision | Why |
|----------|-----|
| Keep Postman's Native Git layout | Postman v12 rewrites the folder whenever the app opens it, so a hand-kept JSON export would keep fighting it. The layout is Postman's own standard, and one file per request diffs cleanly. |
| Postman is a catalogue: one request per route, grouped by resource | The usual pattern is resource folders for discovery, with ordered scenarios kept apart. The old Auth folder mixed both, so it had no clear shape. |
| The ordered auth scenario lives only in [`test_auth.py`](../../../backend/tests/test_auth.py) | pytest already covers it, runs in CI with no Postman account and isolates the database. A Postman copy would be a second thing to keep in sync. If one is wanted later, it goes in a `Workflows/` folder run by the Collection Runner. Flows is a visual automation tool with no documented assertions or CI. |
| Bearer auth set once on the collection, `noauth` on public folders | New private routes (`/experiences`, `/resumes`) work with no per-request setup, and public routes don't send a token they don't need. |
| The generated `FastAPI` collection is read-only; copy a request into `Rayume API` when a route lands | The spec sync overwrites hand edits. The hand collection keeps the scripts. |
| Improve the import at the source (FastAPI), not in Postman | Postman only knows what `/openapi.json` says. The same changes also improve FastAPI's `/docs`. |
| Squashed the "move JSONs" commit into `40d7733` | Postman had already rewritten the files when it was committed, so it held only deletions under a misleading message. It wasn't pushed yet. |

## Problems found

- **The API wouldn't start:** `ValidationError: jwt_secret Field required`. The local `backend/.env` predates auth. It was fixed locally, and teammates will hit the same error until they add `JWT_SECRET` (it's already in `.env.example`).
- **Newman can't run v3 collections.** Only the Postman CLI can, and only when the collection is linked to the cloud workspace. Nothing runs the collection in CI today.
- **Local View showed the Auth folder as empty** right after the import, even though its overview said "10". The files checked out against Postman's v3 schema, so it looked like an app refresh issue. It cleared up once the folder was rebuilt.
- **`.postman/workflows.yaml` syncs both ways**: spec → collection and collection → spec. FastAPI should be the only source of the spec.
- **The previous report's Postman links** pointed at the old JSON files. They now point at the `postman/` folders.

## Open

- **Remove `syncCollectionToSpec`** from [`.postman/workflows.yaml`](../../../.postman/workflows.yaml), or turn it off in the spec's sync settings.
- **Re-import the spec** from `http://localhost:8000/openapi.json` to pick up the new title, descriptions and examples. Rename the `FastAPI` spec and collection if they keep the old name.
- **Run the collection in the app:** Auth (Register → Login → Refresh → Logout), then Templates. The auto-refresh script hasn't been run live yet.
- **Tell the team** to add `JWT_SECRET` to their `backend/.env`.
- **Not done yet:** a mock server (needs a cloud push and saved examples), a `staging` environment, and Vault for the test password.
- **Docs:** `docs/PROJECT.md` describes `postman/` in one line. The layout and the one-request-per-route rule could get a short section there or in [`docs/backend/README.md`](../../backend/README.md).
- Everything from [`2026-11-19-1356`](../2026-11-19-1356/README.md) is still open apart from the `JWT_SECRET` item: PR #26, `get_current_user` and `GET /me`, and the auth to-dos.
