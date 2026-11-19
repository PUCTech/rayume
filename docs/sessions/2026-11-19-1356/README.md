# Session 2026-11-19-1356

> Branch: `feat/polish` · Commits: `185845b`..`276324a` · Author: raulkolaric

## Summary

A review of Thierry's email auth (PR #25: register, login, refresh, logout), merged from `main` into `feat/polish`. It got a 7/10: it follows [`auth.md`](../../backend/endpoints/auth.md) closely and handles races, but had no tests and no rate limit. The session added 13 auth tests and a Postman auth flow, logged four to-dos, settled the order for building the rest of the API, and opened [PR #26](https://github.com/PUCTech/rayume/pull/26).

## Done

- **Merged `origin/main`** into `feat/polish` (`185845b`), bringing in #25: [`auth_session.py`](../../../backend/src/backend/auth_session.py) and [`routers/auth.py`](../../../backend/src/backend/routers/auth.py).
- **Auth tests** (`15840d6`, [`tests/test_auth.py`](../../../backend/tests/test_auth.py)): 13 tests against the dev Postgres in a rolled-back transaction, like [`test_templates.py`](../../../backend/tests/test_templates.py).
  - Register: tokens, lowercasing, `409 email_taken` / `username_taken` (username case-insensitive), `422`.
  - Login: cookie flags. Wrong password and unknown email give the same `401`, and `auth.login_failed` has a null `user_id` for the unknown email. Disabled user gets `401`.
  - Refresh: rotation keeps one family and one deadline. Replaying a rotated token revokes the family, clears the cookie and logs `auth.refresh_reuse_detected`. Missing, unknown, expired or disabled gets `401`.
  - Logout: revokes only its own family, and returns `204` with no cookie.
  - [`tests/conftest.py`](../../../backend/tests/conftest.py) sets a test `JWT_SECRET` so the suite runs without one in `backend/.env`. Suite: 25 passed.
- **Postman** (`15840d6`): an Auth folder in [`rayume.postman_collection.json`](../../../postman/collections/) that runs register → 409 → wrong password → login → refresh → reuse (401) → family revoked (401) → login → logout → refresh (401). The [`local` environment](../../../postman/environments/) gains `email`, `username`, `password`, `name` and three token variables, typed as secrets.
- **To-dos** (`276324a`): [`security-auth-rate-limiting.md`](../../todo/security-auth-rate-limiting.md), [`security-proxy-client-ip.md`](../../todo/security-proxy-client-ip.md), [`missing-doc-refresh-client-rules.md`](../../todo/missing-doc-refresh-client-rules.md), [`contradiction-auth-built-status.md`](../../todo/contradiction-auth-built-status.md).
- **[PR #26](https://github.com/PUCTech/rayume/pull/26)** opened from `feat/polish`. The remote branch had been deleted after #24, so it was pushed again. The PR also carries `bcae083` (pr-reviewer in pt-BR), which wasn't merged before. Code-quality notes on #25 are under its Follow-ups.

## Decisions

| Decision | Why |
|----------|-----|
| API order: finish auth (`get_current_user`, `GET /me`, wire the forms), then `/experiences`, `/resumes`, `/renders`, `/job-postings` + tailoring, OAuth alongside, `/me` edits and public profiles last | Every private route and the "someone else's resource returns 404" check need a user. Experiences feed resumes, resumes feed renders and tailoring. Email login is enough to build on, so OAuth isn't blocking. |
| Starting with sign-in was right | It's the dependency of everything private, and #25 already did about 80% of it. |
| Rate limiting left alone for now | The user's call; #25 lists it as a follow-up. Logged as a to-do that blocks a public deploy. |
| Keep logging every failed login | OWASP recommends it and `auth.md` requires it. #25 logs the IP but not the typed email (which can be a pasted password), and the privacy policy already covers IPs. |
| Future rate limit counts `auth.login_failed` per IP in `logs` | `logs` is shared by every instance and survives restarts, unlike an in-memory limiter, and `ix_logs_event_created` makes it one indexed read. |
| Postman sends the refresh token as an explicit `Cookie` header, with the cookie jar off | The jar keeps the newest token, which would break the reuse step that must send the old one. A fresh account per run lets the collection be rerun against the dev database. |
| Code cleanups in the PR body, not in `docs/todo/` | `docs/todo/` is for code/doc mismatches. Duplicated `TokenResponse`/hashing, a stray import and a misleading log aren't mismatches. |

## Problems found

- **#25 had no tests and no rate limit.** The PR itself lists rate limiting as a follow-up, and its concurrency checks ran on SQLite, where the advisory lock is skipped.
- **The local `backend/.env` has no `JWT_SECRET`**, so the existing tests failed at import (`Settings` validation). Worked around with `tests/conftest.py`. The API itself won't start until it's added.
- **TestClient reports its host as `"testclient"`,** which isn't valid `inet` for `logs.ip`. The tests give the client `127.0.0.1`; it isn't an app bug.
- **Behind Fly's proxy, `request.client.host` is the proxy,** so `logs.ip` would hold the same address for everyone (to-do).
- **Two tabs refreshing at once log the user out** (the second looks like reuse), and `SameSite=Lax` needs same-site domains (to-do).
- **Refreshing after logout logs `auth.refresh_reuse_detected`**, a false alarm (PR Follow-ups).
- **Running the Postman collection was blocked:** writing a generated secret into `backend/.env` and starting the API was denied by the permission check, so the collection is valid JSON but hasn't been run live.

## Open

- **Add `JWT_SECRET` to `backend/.env`** (`python -c "import secrets; print(secrets.token_urlsafe(48))"`), start the API and run the Postman Auth folder with the `local` environment.
- **Get PR #26 reviewed and merged.**
- **Finish auth:** a `get_current_user` dependency (decode the bearer with `decode_access_token`, reject disabled users), `GET /me`, then wire the frontend login and signup forms, following [`missing-doc-refresh-client-rules.md`](../../todo/missing-doc-refresh-client-rules.md).
- **Before a public deploy:** [`security-auth-rate-limiting.md`](../../todo/security-auth-rate-limiting.md) and [`security-proxy-client-ip.md`](../../todo/security-proxy-client-ip.md).
- **Docs:** [`contradiction-auth-built-status.md`](../../todo/contradiction-auth-built-status.md). Mark auth as built and add `config.py`, `security.py` and `auth_session.py` to the backend layout.
- **Concurrent refresh/logout on real Postgres** is still untested; the tests are sequential.
