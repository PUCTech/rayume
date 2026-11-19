# Docs to-do

> Status: **current**. Places where the code and the docs disagree, or where a feature needs something the docs don't have yet (a column, a route, a setting). Filled by `/docs-check`, resolved by hand. Product context: [`../PROJECT.md`](../PROJECT.md).

Each item is one file. Resolving an item means changing the doc, the code or both, in the same PR, and then **deleting the file** and its row below. Git history keeps the record.

## Naming

```
docs/todo/<kind>-<short-slug>.md
```

| Kind | Means |
|------|-------|
| `contradiction` | Code and a doc say different things |
| `missing-schema` | A feature needs a table or column that `database/README.md` lacks |
| `missing-endpoint` | The frontend needs a route, field or error that `backend/endpoints/` lacks |
| `missing-doc` | New behaviour no doc describes |
| `scope` | Drifts toward out-of-scope features (`PROJECT.md`) |
| `security` | Misses a requirement from `security/README.md` |

## Template

```markdown
# <One-line title>

> Kind: `<kind>`. Found: YYYY-MM-DD by `/docs-check` on `<branch>` (`<commit>`).
> Blocks: <what can't be built or merged until this is settled, or "nothing">.

## What the code does

`path/to/file.tsx:42`: one or two lines, with a short quote.

## What the docs say

[`docs/x/README.md#section`](../x/README.md#section): the quote, or "nothing".

## Proposed change

The doc edit to make, e.g. `resumes.pinned_at timestamptz null`: why, and which endpoint returns it.

## Options

Only when the code might be what's wrong: A) change the doc ... B) change the code ...
```

## Index

| Item | Kind | Blocks |
|------|------|--------|
| [`contradiction-status-colours.md`](contradiction-status-colours.md) | `contradiction` | Nothing; recolours the frontend's error, warning and destructive states to the status scheme |
| [`missing-schema-job-applications.md`](missing-schema-job-applications.md) | `missing-schema` | Moving `/jobs` off localStorage |
| [`scope-application-tracking.md`](scope-application-tracking.md) | `scope` | Building `/jobs`' backend; the tailoring review needs `POST /resumes` to return proposals |
| [`contradiction-auth-built-status.md`](contradiction-auth-built-status.md) | `contradiction` | Nothing; docs still say auth isn't built |
| [`missing-doc-refresh-client-rules.md`](missing-doc-refresh-client-rules.md) | `missing-doc` | Wiring the frontend auth forms; choosing production domains |
| [`security-auth-rate-limiting.md`](security-auth-rate-limiting.md) | `security` | Deploying the API publicly |
| [`security-proxy-client-ip.md`](security-proxy-client-ip.md) | `security` | IP-based rate limiting; any use of `logs.ip` after deploying |
