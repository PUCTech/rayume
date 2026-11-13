---
description: Write this session's report in docs/sessions/ and commit it
---

Write the report for the session we just had, following `docs/sessions/README.md` (naming, template, index).

1. Run `date "+%Y-%m-%d-%H%M"` for the folder name, and `git log` to find the commits made during this session and the current branch.
2. Read the most recent report in `docs/sessions/` to match its tone and level of detail.
3. Write `docs/sessions/<date-time>/README.md` from the template: Summary, Done, Decisions, Problems found, Open. Base it on this conversation, not only on the commits: the *why* behind decisions, bugs caught, and what's left. Link to the code and docs you mention. Put work done outside the repo (editor, machine setup) under a separate **Outside the repo** bullet in Done. Author: `git config user.name`.
4. Add a row to the Index table at the bottom of `docs/sessions/README.md`.
5. Commit only those two files as `docs(sessions): report for <date-time>`. Don't push.
6. Reply with the report's path and the commit hash, and remind me I can now run `/clear`.

If nothing happened worth recording (no commits and no decisions), say so and ask before writing a report.

$ARGUMENTS
