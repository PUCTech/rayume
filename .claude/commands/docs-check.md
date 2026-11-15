---
description: Check recent changes against docs/ and log every contradiction or gap as a to-do in docs/todo/
argument-hint: "[git range, e.g. HEAD~3..HEAD] (default: this branch since origin/main, plus uncommitted changes)"
---

Compare what the code now does with what `docs/` says, and record every mismatch as a to-do in `docs/todo/`, following `docs/todo/README.md`. **Don't change code or other docs**: this command only takes notes. Fixing them is a separate, explicit request.

## 1. Collect the changes

- **Range**: `$ARGUMENTS` if given. Otherwise `git fetch -q origin main`, then `git diff origin/main...HEAD` plus `git diff HEAD` (uncommitted) and untracked files from `git status -s`.
- Read the diffs, and the surrounding code whenever a diff alone doesn't show what a feature needs.

## 2. Check each change against the docs

Use the map in `CLAUDE.md` to pick the docs, and read them in full. For each change, look for:

| Kind | Example |
|------|---------|
| `contradiction` | The code does X and a doc says Y (a route returns 403 where the conventions say 404; a colour outside the tokens; an unescaped string reaching TeX) |
| `missing-schema` | The feature stores or reads data that `docs/database/README.md` has no table or column for (a "pinned" flag on resumes, a new jsonb field) |
| `missing-endpoint` | The frontend expects a route, field, parameter or error that `docs/backend/endpoints/` doesn't define |
| `missing-doc` | New behaviour that no doc describes (a page, a setting, an env var, a new component pattern) |
| `scope` | The change drifts toward something `docs/PROJECT.md` lists as out of scope |
| `security` | The change touches LaTeX, AI calls, auth or uploads without meeting the checklist in `docs/security/README.md` |

Frontend demos that run on localStorage count too: if the UI keeps data that the schema can't hold, that is a `missing-schema` item, because the API will need it later.

Skip things that are fine, and skip pure refactors, styling inside the tokens and copy edits.

## 3. Write the to-dos

1. Read `docs/todo/README.md` and every open item. **Don't duplicate**: if an item already covers the finding, add the new evidence to it instead of creating another.
2. One file per finding: `docs/todo/<kind>-<short-slug>.md`, from the template in `docs/todo/README.md`. Name the code (`path:line`), the doc (path and section) and quote both, so the conflict is clear without opening anything. Propose the doc change (for schema items, the exact column with its type, nullability and default), and add options when the code might be what's wrong rather than the doc.
3. Check the existing items too: if the code or docs now agree, delete that file (git history keeps it) and say so in your reply.
4. Update the index table in `docs/todo/README.md` so it matches the files in the folder.

## 4. Report

Reply with a short table: each item created, updated or resolved, its kind and one line on it. Point out anything that blocks backend work (schema and endpoint gaps first). Don't commit: I'll review the notes first.

If nothing conflicts, say so and write no files.
