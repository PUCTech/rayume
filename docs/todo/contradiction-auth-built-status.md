# The docs still say auth isn't built, and don't list auth_session.py

> Kind: `contradiction`. Found: 2026-11-19 by hand reviewing PR #25 on `feat/polish` (`185845b`).
> Blocks: nothing.

## What the code does

`backend/src/backend/routers/auth.py` serves `POST /auth/register`, `/auth/login`, `/auth/refresh` and `/auth/logout`. Session helpers (cookie, token family, row lock) live in a new module, `backend/src/backend/auth_session.py`.

## What the docs say

- [`docs/backend/endpoints/README.md`](../backend/endpoints/README.md): "Built so far: `GET /health`, `GET /templates`, `GET /templates/{slug}`."
- [`docs/PROJECT.md`](../PROJECT.md) current state: "Next: JWT auth plus the `/experiences` and `/resumes` routes."
- [`docs/backend/README.md`](../backend/README.md) layout: `main.py`, `routers/`, `db.py`, `models.py`, `schemas.py`. No `auth_session.py`, `security.py` or `config.py`.

## Proposed change

Add the four auth routes to "Built so far", move email auth to built in `PROJECT.md` (OAuth, `/me` and the bearer dependency still to do), and add `config.py`, `security.py` and `auth_session.py` to the layout with one line each.
