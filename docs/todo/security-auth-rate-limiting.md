# Auth routes have no rate limit, and every failed login writes a log row

> Kind: `security`. Found: 2026-11-19 by hand reviewing PR #25 on `feat/polish` (`185845b`).
> Blocks: deploying the API publicly. Fine for local development.

## What the code does

`backend/src/backend/routers/auth.py`: `/auth/register` and `/auth/login` accept unlimited requests. Nothing in `backend/src/` or `pyproject.toml` limits them, and no route returns `429`. Each failed login inserts and commits an `auth.login_failed` row in `logs`, so an unauthenticated script can both guess passwords and grow `logs` as fast as it can send requests.

PR #25 lists this under Follow-ups: "Add rate limiting for registration and sign-in."

## What the docs say

[`docs/backend/endpoints/auth.md`](../backend/endpoints/auth.md): register and login both list `429 rate limited`. [`docs/security/README.md`](../security/README.md): rate-limit AI routes (auth isn't named, but the endpoint docs require it).

## Proposed change

Drive the limit from `logs`, which already exists and is shared by every API instance (an in-memory limiter resets on restart and isn't shared):

- Login: more than ~10 `auth.login_failed` from the same `ip` in the last 15 minutes → `429`. One query on `ix_logs_event_created`; costs one read per attempt.
- Register: the same idea on successful `auth.login` events from register, or a per-IP count of new users.
- Return `429` with `{"detail": "rate_limited"}` and a `Retry-After` header, and document the thresholds in `auth.md`.

Needs [`security-proxy-client-ip.md`](security-proxy-client-ip.md) first, or every request counts against the proxy's IP.
