# Session 2026-11-19-1717

> Branch: `ci/github-actions` → `feat/auth-rate-limit` · Commits: `1f14266`..`538bd16` · Author: raulkolaric

## Summary

The session started with questions about Docker and CI/CD: how many containers, whether to build an image per commit, and what the hosts already do. The answers came straight from the render-worker design. The repo then got its first GitHub Actions: backend tests and frontend lint/build, merged as PR #27. PR #28 tested CI with a real change: per-IP rate limits on login and register, which resolves the rate-limiting to-do. Both checks are green.

## Done

- **CI workflows** (`1f14266`, PR #27, merged):
  - [`.github/workflows/backend.yml`](../../../.github/workflows/backend.yml), **Backend / Test**: a Postgres 18 service set up like [`compose.yaml`](../../../compose.yaml), `uv sync --locked`, create the tables with the one-liner from [`backend/README.md`](../../../backend/README.md), then `uv run pytest`.
  - [`.github/workflows/frontend.yml`](../../../.github/workflows/frontend.yml), **Frontend / Lint and build**: Node 24, `npm ci`, `npm run lint`, `npm run build`.
  - Both run on every PR and every push to `main`, cancel a run when a newer push replaces it, and give every step a name.
- **Dummy `JWT_SECRET` in CI** (`1e861bc`): see Problems found.
- **Docs:** a CI section under "How we work" in [`docs/PROJECT.md`](../../PROJECT.md) (`1f14266`, corrected in `636759e`).
- **Auth rate limits** (`538bd16`, PR #28, open), in [`routers/auth.py`](../../../backend/src/backend/routers/auth.py):
  - `check_rate_limit` counts recent rows in `logs` for one event and one IP.
  - Login: 10 `auth.login_failed` in 15 min → `429 {"detail": "rate_limited"}`, `Retry-After: 900`.
  - Register: 5 sign-ups in 1 h → `429`, `Retry-After: 3600`. Register's `auth.login` row now stores `ip`.
  - Thresholds are documented in [`auth.md`](../../backend/endpoints/auth.md).
- **Tests** in [`test_auth.py`](../../../backend/tests/test_auth.py):
  - 3 new tests (limit hit, old failures forgotten, register limit), using the documentation IP `203.0.113.7`.
  - `events()` and the refresh-family check now count only rows written in the test's own transaction (`created_at >= now()`).
  - 28 passed on a used dev database and on a fresh Postgres, and green on GitHub.
- **To-dos:** deleted `security-auth-rate-limiting.md` and its index row. [`security-proxy-client-ip.md`](../../todo/security-proxy-client-ip.md) now says it blocks the public deploy, because the limits count per IP.
- **Outside the repo:** the user reported setting `Backend / Test` and `Frontend / Lint and build` as required checks in `main-ruleset` and turning on secret scanning and push protection. I didn't re-check either.

## Decisions

| Decision | Why |
|----------|-----|
| Separate containers for the API and the LaTeX sandbox | [`render-worker.md`](../../backend/architecture/render-worker.md) requires the sandbox to hold no secrets and have no egress. In one container with FastAPI, `\input{/proc/self/environ}` could print the DB URL and API keys into a PDF. |
| No image build, registry or deploy pipeline in CI | Vercel already builds the frontend from git (a preview per PR). Fly/Render build from a Dockerfile on push. A hand-written build → push → deploy pipeline adds nothing for the MVP. An image job comes when `sandbox/` exists, to run the attack payloads against it. |
| No path filters on the workflows | Once checks are required, a filtered workflow that never runs blocks the PR. Both jobs are fast (~25 s and ~1 min). |
| No separate `tsc` step in the frontend job | `next build` already type-checks. Lint warnings (9 today) don't fail the job, only errors do. |
| Create the tables in CI with the README one-liner | There's no `create_all` in the code and no migrations yet. CI does what a new developer does. |
| Rate limits counted from `logs`, not in memory or with a library | `logs` is shared by every API instance and survives restarts. `ix_logs_event_created` already exists. No new dependency or table. This is the approach the to-do proposed. |
| Login checks the limit before the password, and blocks even the right password | A blocked attempt costs no argon2 hash and writes no log row. Letting the right password through would let an attacker keep guessing. |
| The register limit counts `auth.login` rows that have an `ip` | Only register's row stores an ip, so no new event name was needed and existing tests that count `auth.login` didn't change. It's an implicit rule, so there's a comment at the check and a line in `auth.md`. |
| Fixed the fragile tests in the same PR | The PR touched `test_auth.py` anyway, and filtering on `now()` was a one-line change. |

## Problems found

- **First CI run failed at "Create tables":** `ValidationError` for `Settings`. The step runs outside pytest, so `conftest.py` never sets `JWT_SECRET`. Locally it came from `backend/.env`. Fixed with a dummy value in the job env.
- **3 `test_auth` tests failed on a used dev database:** they counted every `auth.login` log row and every refresh token in the table, including rows left by Postman testing. CI was never affected because it starts empty. Fixed in PR #28.
- **`next build` once exited 1** after a successful build, with an advisory/upgrade nudge from Next in the output. A rerun exited 0 and CI passes. It looked like a flaky post-build check. I didn't follow the nudge's instructions.
- **I first wrote "no deploys yet" in `PROJECT.md`**, but the PR's checks showed Vercel was already connected. Corrected in `636759e`.

## Open

- **Review and merge PR #28** (`feat/auth-rate-limit`).
- **Before a public API deploy:** [`security-proxy-client-ip.md`](../../todo/security-proxy-client-ip.md). Without `--proxy-headers --forwarded-allow-ips=<Fly range>`, every client shares the proxy's IP and one rate limit.
- **Dependabot:** a `.github/dependabot.yml` for `uv`, `npm` and `github-actions` on a weekly schedule. Discussed but not written.
- **Backend deploy:** not set up. Fly (`gru`) and its git integration is the plan.
- **Sandbox image job** in CI once `sandbox/` exists (rollout step 2 in `render-worker.md`).
- **Linter for the backend:** none yet. `ruff` as a dev dependency would add one step.
- From earlier sessions: `get_current_user` and `GET /me`, then `/experiences` and `/resumes`, plus the other to-dos in [`docs/todo/`](../../todo/README.md).
