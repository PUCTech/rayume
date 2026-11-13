# Sessions

> Status: **current**. One report per working session, written on request at the end of it. Product context: [`../PROJECT.md`](../PROJECT.md).

A session report records what a session achieved, why things were decided the way they were, and what's left. Commits say *what* changed; these say *why*, and what to pick up next.

## Naming

Each session is a folder named after the local date and time (24h) the report was written:

```
docs/sessions/YYYY-MM-DD-HHMM/README.md
```

e.g. `2026-11-12-1129/`. Sortable, readable, and unique to the minute. Screenshots or other files for that session go in the same folder.

## Template

```markdown
# Session YYYY-MM-DD-HHMM

> Branch: `<branch>` · Commits: `<first>`..`<last>` · Author: <name>

## Summary

Two or three sentences: what the session set out to do and where it ended.

## Done

- What was built or changed, with links to code and docs.

## Decisions

| Decision | Why |
|----------|-----|
| ... | ... |

## Problems found

Bugs caught, wrong assumptions, things that didn't work.

## Open

- Left for next time, with enough context to start without rereading the session.
```

## Index

| Session | Branch | Summary |
|---------|--------|---------|
| [`2026-11-12-1130`](2026-11-12-1130/README.md) | `feat/backend-db` | Local Postgres, SQLAlchemy models for the full schema, CORS, backend docs reorganised |
| [`2026-11-12-2036`](2026-11-12-2036/README.md) | `feat/backend-db` | Backend README for interns (setup, Windows, file guide), schema verified, templates seeded |
