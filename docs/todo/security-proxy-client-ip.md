# Logged IPs will be the proxy's address in production

> Kind: `security`. Found: 2026-11-19 by hand reviewing PR #25 on `feat/polish` (`185845b`).
> Blocks: an IP-based rate limit ([`security-auth-rate-limiting.md`](security-auth-rate-limiting.md)), and any use of `logs.ip` after deploying.

## What the code does

`backend/src/backend/routers/auth.py` (`login`): `client_ip = request.client.host if request.client else None`. Behind Fly's proxy, that's the proxy's address, so every `auth.login_failed` row gets the same IP.

## What the docs say

[`docs/database/README.md`](../database/README.md): "`ip` is the client IP (`inet`), for security events." Nothing about proxies.

## Proposed change

No code change: run uvicorn with `--proxy-headers --forwarded-allow-ips=<Fly's proxy range>` so `request.client.host` is the real client, and never trust `X-Forwarded-For` from anywhere else (a client could forge it). Write this down in the deploy docs when the API's hosting is set up.
