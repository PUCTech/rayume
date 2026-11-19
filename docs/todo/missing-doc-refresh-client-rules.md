# Refresh tokens add two rules nobody has written down: one refresh at a time, and same-site domains

> Kind: `missing-doc`. Found: 2026-11-19 by hand reviewing PR #25 on `feat/polish` (`185845b`).
> Blocks: wiring the frontend auth forms, and choosing production domains.

## What the code does

`backend/src/backend/routers/auth.py` (`rotate_refresh_token`): a refresh token that was already rotated is treated as stolen, and its whole family is revoked. `backend/src/backend/auth_session.py` (`set_refresh_cookie`): `SameSite=Lax; Secure; Path=/auth`.

## What the docs say

[`docs/backend/endpoints/auth.md`](../backend/endpoints/auth.md) describes rotation, reuse detection and the cookie flags, but not what they demand of the client or the deploy.

## Proposed change

Add to `auth.md`:

1. **One refresh at a time per browser.** Two tabs refreshing with the same cookie at the same moment: the second looks like reuse and logs the user out everywhere. The frontend must share one in-flight refresh (one promise in the tab, plus a cross-tab lock such as `navigator.locks` or a `BroadcastChannel`).
2. **The API and the frontend must be same-site** (e.g. `rayume.app` and `api.rayume.app`). A `SameSite=Lax` cookie isn't sent on a cross-site `fetch`, so a Vercel domain calling a Fly domain would silently never refresh. The browser extension needs host permission for the API.
