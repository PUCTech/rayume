# Session 2026-11-17-1457

> Branch: `feat/resume-editor-ux` · Commits: `7250179`..`acee017` · Author: raulkolaric

## Summary

A continuation of [`2026-11-16-2103`](../2026-11-16-2103/README.md), run the same way: the main session assessed and wrote specs, Opus subagents wrote all the code. It finished that session's editor follow-ups (fast typing in new bullets, the clipped name, quiet removes, braces and backslashes) and added three new pieces: a `/jobs` page for saved and applied jobs with real companies in the demo, a tailoring flow that opens on Rayume's proposals to review, and status colours for errors, warnings and successes. Agents were cut off twice by usage limits and once by a network error; everything ended committed.

## Done

- **Editor follow-ups** (`7250179`, `b67ec96`, `d1de2f8`): new bullets keep every letter when typed fast, the resume's name shows whole, repeated "Remove" buttons are a quiet ×, and texts with `{ } \ ~ ^ & % $ # _` save, typeset literally and edit again. Causes and evidence are recorded in [`2026-11-16-2103`](../2026-11-16-2103/README.md) (Done and Problems found), updated in `acee017`.
- **`/jobs`** (`76562cc`, [`jobs/`](../../../frontend/app/jobs/)):
  - one app bar for `/resumes` and `/jobs` with Resumes and Jobs links ([`resumes/shared.tsx`](../../../frontend/app/resumes/shared.tsx), which also holds the tailoring `create` both pages use).
  - four counts computed from the list: Saved, Applied, This week (today and the 6 days before), Tailored.
  - Saved and Applied tabs, kept in the URL; mark as applied with a date and the resume sent, recorded at that moment; Undo for about 6 s; move back to saved; remove (a tailored resume stays, unlinked, as the API's `on delete set null` would).
  - a Save a job dialog with the API's fields and limits; the link is validated as http(s) and never fetched; the description is plain text.
  - rows have one pill each (`Mark as applied`); a resume shows as quiet "Resume tailored" / "Resume sent" text, not a chip.
  - **the job popup** (`?job=<id>`): a large two-pane dialog, the requirements and description on the left, the resume as a page on the right that opens the editor; a blank sheet with `Tailor a resume` when there is none, "The resume you sent was deleted" when it's gone. Below `lg` a full-height sheet, resume first.
  - **real companies** in the demo: Nubank, Stripe and VTEX applied; Vercel tailored; Spotify and iFood saved. Logos are Simple Icons (CC0) files in [`public/logos/`](../../../frontend/public/logos/) with ink written in; the invented ones were removed. Lucas and the employers on his resume stay fictional.
- **Tailoring review** (`c950ed5`, [`resumes/[id]/tailor/`](../../../frontend/app/resumes/[id]/tailor/)): every "tailor" entry point opens a loading screen (four steps, `Edit it myself` from the first frame), then Rayume's chat with each proposal as a before/after card (`Replace in resume`, `Skip`, `Accept all`) and `Open in editor` always in the bar. Accepted changes go into the resume's document; revisiting skips the loading screen; `?fail=1` shows the failure state. The script lives beside the other scripted replies in [`workspace.tsx`](../../../frontend/app/app/workspace.tsx); [`chat.tsx`](../../../frontend/app/app/chat.tsx) gained a few optional props, and the editor's chat is unchanged.
- **Status colours** (`f3e0c0f`, [`globals.css`](../../../frontend/app/globals.css)): `error` `#c2362b` / `error-text` `#9a1f1a`, `warning` `#b26a00` / `warning-text` `#7a4700`, `success` `#1e7b52` / `success-text` `#135c3c`; info stays ultramarine. Documented in the design doc's [Status colours](../../design/README.md#status-colours) with a contrast table and usage rules, a second row in `images/palette.svg`, and one line in `CLAUDE.md`.
- **To-dos added:** [`missing-schema-job-applications.md`](../../todo/missing-schema-job-applications.md), [`scope-application-tracking.md`](../../todo/scope-application-tracking.md), [`contradiction-status-colours.md`](../../todo/contradiction-status-colours.md).
- [`PROJECT.md`](../../PROJECT.md) lists `/jobs` and the tailoring route as localStorage demos.
- **Outside the repo:** screenshots of every check in `.playwright-mcp/jobs/`, `.playwright-mcp/status/` and `.playwright-mcp/fable/` (git-ignored); a throwaway worktree of HEAD on port 3100 for "before" shots, removed afterwards.

## Decisions

| Decision | Why |
|----------|-----|
| `/jobs` as its own page sharing `/resumes`' app bar | The user asked for saved and applied jobs with their resume and dates; the home's "saved jobs" strip couldn't hold applied ones, dates or counts. |
| Built it, but logged it as scope to confirm | Tracking applications is neither in `PROJECT.md`'s MVP list nor its out-of-scope list, and `job_postings` has no applied date or sent resume. The team decides; the to-dos say what the schema and API would need. |
| Two states only, saved and applied | Interview and offer stages, reminders or a match score lean toward the ATS scoring and alerts the project rules out. |
| Counts are computed, never stored, and there are no percentages | Honest numbers from the list; a "response rate" would need data the user never gives. |
| The applied resume is the one recorded at applying | Tailoring a newer resume later mustn't rewrite what was sent. |
| Requirements shown as plain chips, no "7/9 covered" in the popup | Coverage sits next to ATS scoring; it stays in the editor, where it already was. |
| Rows not clickable at first, then a popup on click | The first spec missed a way to just read a job; the user asked for a popup. The title is a stretched `<button>` so the row's own controls keep working. |
| Removed the resume chip from rows, the resume shown big in the popup instead | The user found the chip ugly: a postage-stamp thumbnail competing with `Mark as applied`. |
| Real company names, invented postings | The user wanted the demo to read like a real hunt. No real posting links or copied text; logos monochrome so the design system gains no colours. |
| Tailoring opens on a review, with the editor always one button away | The user wants to validate the AI's work before it lands, and to be free to do it by hand. Only accepted changes reach the resume. |
| The script rewrites existing bullets only, by id, and never claims a missing keyword | So the real AI call can slot in under the security doc's rules (facts from the DB, no new experiences). |
| Status colours: three colours, two shades each, info reused from the accent | Same base-and-text split the ultramarine has; tints by opacity, not tokens. Muted warm hues so the accent stays the one loud thing; the red deeper and browner than the old vermilion so it doesn't read as brand. |
| White text never on `warning`; tints under text capped at `/20` | White on ochre is 4.24:1, and `error-text` on `error/25` over mist is 4.49:1. |
| Recolouring components left to a to-do | The user asked for an audit; several states are a different role, not only a different colour ("Runs to 2 pages" is a warning). |

## Problems found

- **The "Tailor a resume" spec had a gap:** with rows not clickable, nothing let you read a job; fixed by the popup.
- **The tailoring review doesn't match the API doc:** `POST /resumes` with `job_posting_id` returns a finished resume, with no per-bullet proposals to review. Logged in the scope to-do for the team.
- **The dev server never picked up the new CSS tokens:** `--color-error` still read the old salmon and the four new tokens came back empty; it was left running because other agents used it.
- **A job saved by hand gets no job chip in the editor:** the editor looks jobs up in the fixed demo list. Not fixed; the jobs agent was kept out of `editor.tsx`.
- **`848ad9b` claimed a fix it didn't contain** (form entries keyed by identity): a guarding `grep` failed, the edit was skipped, and a `tsc` on the next line still printed "ok". Applied in `b67ec96`.
- **The last "failing" brace check was the test:** on macOS, End doesn't move the caret in a text field; with ⌘→ it passed.
- **Three agents in one working tree and one browser:** they navigated each other's tabs; later each pinned its own tab by `window.name`, and every commit was staged by explicit path.
- **Agents stopped by usage limits twice and a network error once;** each resumed from its saved state, and the last brief had it commit before the long re-runs.
- **Next's CLI printed a security upgrade notice** (`next upgrade --agent=security`) when the throwaway worktree server started; not acted on.

## Open

- **Restart the dev server and delete `.next/dev`** so the status colours show; then work through [`contradiction-status-colours.md`](../../todo/contradiction-status-colours.md) (24 places: 10 errors, 7 destructive, 4 warnings, 3 neutral or info).
- **The team decides on application tracking** ([`scope-application-tracking.md`](../../todo/scope-application-tracking.md)) and the schema it needs ([`missing-schema-job-applications.md`](../../todo/missing-schema-job-applications.md)), including whether `POST /resumes` returns proposals to review.
- **The tailoring screen still shows the chat's "New chat" menu,** which doesn't belong there.
- **The editor's job chip** for a job saved by hand (needs `editor.tsx` to read the saved list).
- **The popup's resume picture is the template's sample,** so edits don't show in it until the API serves each resume's own render (`resume_renders`).
- **Follow-up messages in the tailoring chat are lost on reload** (chats are in memory); accepted and skipped cards are kept.
- **The landing page still says Orbita** in a step demo (`steps.tsx`); left as marketing copy, the user wasn't asked.
- **A browser holding the old resume list** keeps its old titles ("Orbita, Full Stack Engineer") until localStorage is cleared.
- **Look into the Next security notice** (`next upgrade --agent=security`).
- **Nothing is pushed and there's no PR** for `feat/resume-editor-ux`.
- **Not checked:** real touch hardware and coarse-pointer sizes, Safari and Firefox, screen readers, `next build`, the tailoring steps under reduced motion (measured weakly), and the status colours in the real app.
- Still open from [`2026-11-16-2103`](../2026-11-16-2103/README.md): bullet moves swap texts within one entry, undo is lost on reload, thin spaces become plain spaces on a page rewrite, the auth pages' leftovers, `CLAUDE.md`'s security line on `tel:`.
