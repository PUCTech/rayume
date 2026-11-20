# Session 2026-11-19-2343

> Branch: `chore/next-security-upgrade` (from `main`) · Commits: `90748c9` · Author: raulkolaric

## Summary

A short maintenance session to settle the Next.js security advisory left open in [`2026-11-19-2333`](../2026-11-19-2333/README.md), then scan both apps for known vulnerabilities. Next went to 16.4.6, three vulnerable backend dependencies were bumped, and both `npm audit` and `pip-audit` now report nothing.

## Done

- **Next 16.4.2 → 16.4.6** (`90748c9`): `next` and `eslint-config-next` in [`frontend/package.json`](../../../frontend/package.json), still pinned exactly like before. `npm audit fix` also cleared a moderate `minimatch` advisory (DoS through globparts) that came in through `typescript-eslint`, which is a dev-only dependency.
- **Backend lock** ([`backend/uv.lock`](../../../backend/uv.lock)): `pyasn1` 0.6.4 → 0.6.5 (4 CVEs, pulled in by `google-genai` → `google-auth`), `dnspython` 2.9.0 → 2.9.2 and `opentelemetry-api` 1.45.1 → 1.45.2, each with one CVE. These are packages pulled in by other packages, so `pyproject.toml` is unchanged.
- **Checks:**
  - `tsc --noEmit` is clean. `npm run lint` shows 0 errors (9 warnings, none of them new).
  - `next build` passes with no advisory.
  - `next start` smoke test: `/`, `/templates`, `/resumes`, `/resumes/demo`, `/login`, `/resources` and `/legal` return 200. `POST /api/render` returns 404 in production, as [`render-worker.md`](../../backend/architecture/render-worker.md) requires.
  - Backend: `pytest` passes 28 of 28.
- **Security scan:** `npm audit` (all deps and production only) and `pip-audit` on the exported lock both report 0 known vulnerabilities. A grep for `dangerouslySetInnerHTML` finds only the two allowed uses: the fixed-string theme script in [`layout.tsx`](../../../frontend/app/layout.tsx) and the editor field behind `safe` in [`inplace.tsx`](../../../frontend/app/resumes/inplace.tsx).

## Decisions

| Decision | Why |
|----------|-----|
| `npm install --save-exact` rather than `next upgrade --agent=security` | It's a patch bump inside 16.4. Pinning the exact version keeps the existing exact pins, so the diff is just two version strings and the lockfile. |
| New branch `chore/next-security-upgrade` from `origin/main` | The user asked for one. `feat/auth-rate-limit` had nothing beyond `main`, which was already merged. |
| Bumped the backend's indirect dependencies with `uv lock --upgrade-package` | Each CVE had a patch release. Upgrading only the named packages keeps the rest of the lock unchanged. |

## Problems found

- **Response hardening is missing (not fixed):** `next start` sends `X-Powered-By: Next.js` and no `Content-Security-Policy` or `X-Frame-Options`. This was already true before the upgrade. The fix is `poweredByHeader: false` plus a `headers()` block in [`next.config.ts`](../../../frontend/next.config.ts).
- **Stale editor diagnostics:** right after the branch switch and `npm install`, the IDE showed type errors such as a missing `next/link` declaration. `tsc` was clean, so they were stale.

## Open

- **Security headers** on the frontend (see above). A CSP has to allow the theme script and `pdfjs-dist`.
- **Not checked by eye:** pages were only checked for a 200 status code, not looked at in a browser.
- From earlier sessions: the fact check in `first-offer`, the footer guide list, [`security-proxy-client-ip.md`](../../todo/security-proxy-client-ip.md), `GET /me`, then `/experiences` and `/resumes`.
