# Session 2026-11-16-2103

> Branch: `feat/resume-editor-ux` · Commits: `f162f37`..`848ad9b` · Author: raulkolaric

## Summary

Set out to make the resume editor feel like Google Docs with LaTeX underneath: nothing typed is lost, less friction, more polish, more writing features. The sign-in and sign-up pages got a redesign on the side. All code was written by Opus subagents; the main session assessed the editor and wrote the specs. It ended with eight editor items shipped in six commits, and a follow-up round (a typing bug, three polish fixes) cut off when the session hit its usage limit.

## Done

- **Nothing typed is lost** (`f162f37`, [`editor.tsx`](../../../frontend/app/resumes/editor.tsx), [`inplace.tsx`](../../../frontend/app/resumes/inplace.tsx), [`store.ts`](../../../frontend/app/resumes/store.ts)):
  - Esc keeps the text and leaves the field (it used to discard it); ⌘Z takes it back.
  - Unsaved typing is saved on `pagehide`, when the tab is hidden, on leaving the editor and on ⌘S. A reload inside the 0.7 s save pause used to lose it.
  - The resume is renamed in place from its title; the tab title follows.
  - `"use client"` removed from [`content.tsx`](../../../frontend/app/resumes/content.tsx) and [`pdf.tsx`](../../../frontend/app/templates/pdf.tsx): only client components import them, which ends the "props must be serializable" warnings.
- **First polish pass** (`138cd92`): form fields and toolbar controls as pills; the chat input gets the 2px focus ring; below `lg` a side panel opens over the whole width, one at a time (on a phone they never opened); in the form's bullets Enter splits or adds, Backspace in an empty one removes, Alt+↑/↓ moves.
- **Auth pages** (`9b24790`, [`(auth)/`](../../../frontend/app/(auth)/)): a separate phone layout (photo band on top, the form on a sheet over it), an inset photo frame on desktop, a typewriter slogan ([`slogan.tsx`](../../../frontend/app/(auth)/slogan.tsx)) that always breaks as "Glide through" / three words, and five ray photos picked at random per request on the server (three new ones from Unsplash, credited on the photo and in the [design doc's Assets table](../../design/README.md#assets)).
- **The page has a real size** (`49f3a76`, [`pdf.tsx`](../../../frontend/app/templates/pdf.tsx)): when writing on the page, zoom is a share of the real sheet (100% = 816px). It opens fitted to the width (82% and 670px at 1440, where it used to be 539px with 6px text), and keeps its size whatever the panels and form sections do. Resizing the window refits until you zoom yourself; the middle zoom button is "Fit to width". A blank sheet shows where the page will land while it loads. `/templates` is unchanged.
- **One status, one chat toggle** (`49f3a76`): "Saved" sits by the resume's name; the toolbar's copy, the content panel's copy and the second chat button are gone. The settings page keeps its own status strip.
- **Writing on the page** (`49f3a76`, [`overlay.tsx`](../../../frontend/app/resumes/overlay.tsx)): Alt+↑/↓ moves the bullet you're in, keeping bold, italic and the caret's place. "Ask Rayume" in the toolbar (⌘J) quotes that bullet into the chat without selecting it first.
- **Contact fields** (`49f3a76`): labelled Email, Phone or Link by what the text is, with `mailto:`, `tel:` and `https://` placeholders. [`security/README.md`](../../security/README.md) now says links may be `tel:` too, as `href` in [`tex.ts`](../../../frontend/app/resumes/tex.ts) already allowed.
- **Dates picker** (`cd1425d`): two pills (`Feb 2025 – Present`), each opening a base-ui popover with a year stepper and a 4×3 month grid. "Present" is the end popover's first choice, replacing the checkbox. An end before the start can't be picked.
- **Margins say their size** (`cd1425d`): "Template margins", "Narrow margins (0.3 in)", "Wide margins (0.7 in)". The values didn't change (see Problems).
- **Add and remove** (`848ad9b`, [`tex.ts`](../../../frontend/app/resumes/tex.ts), [`content.tsx`](../../../frontend/app/resumes/content.tsx)): contact links, projects, education entries, certifications and skill lines can be added and taken off, each as one undo step. A section's heading goes with its last entry and comes back with a new one. Form entries are keyed by what they are, so the open one no longer jumps after a removal or a re-sort.
- [`PROJECT.md`](../../PROJECT.md)'s editor line was updated with each commit.
- **Outside the repo:** Playwright screenshots of every check are in `.playwright-mcp/` (git-ignored), the last round's under `.playwright-mcp/fable/`.

## Decisions

| Decision | Why |
|----------|-----|
| "Attrition" read as friction: places where work is lost, the user is stuck, or has to repeat themselves | The first agent reproduced five such holes in the browser before fixing them, instead of adding features on top. |
| Esc keeps the text | A document's Esc means "leave this field", never "throw it away". ⌘Z is the way back. |
| Zoom as a share of the real sheet, not of the box's width | The user's "the PDF jumps" came from the page being fitted to a width that changes with every panel. A fixed size can't jump, makes the percentage true, and let the page open a quarter larger. The first fix (`138cd92`, keep the size "while it still fits") left the label lying. |
| Save status beside the name; "Saved" keeps its wording while the PDF typesets | It was shown twice and the two disagreed for under a second on every keystroke. A spinner swaps for the check instead of the text changing. |
| Removal is one press in the editor, two on the settings page | The editor has ⌘Z; settings has no undo. |
| "Remove or add links, and that goes to other things too" read as every list on the resume | Done in priority order (links, then entries, then empty sections), each finished before the next. |
| An emptied section loses its heading | A heading with nothing under it is wrong on a resume; the form keeps the section so one can be added back. |
| Margin values left alone, labels changed | Measured, they were right (see Problems). |
| Dates picker on base-ui `Popover`, same surface as the toolbar's `Pick` | Native selects and a checkbox didn't fit the 320px panel; both menus should look like one family. |
| Ray photos only under the Unsplash licence, downloaded to the scratchpad and checked before copying in | The user asked for photos from the web; ten of thirteen candidates were dropped for being too bright, busy or dark behind the white slogan, or for showing people. |
| The random photo is picked on the server (`connection()` + `Math.random()` in a helper, under `<Suspense>`) | With `cacheComponents` on, this is the way to vary per request; the browser gets the photo the server chose, so no hydration mismatch and no swap after load. |
| Two alternate slogan endings reworded ("every job post.", "the ATS filters.") | The user wants no one- or two-word lines and the longer line at the bottom; the old endings were two words. The main slogan is unchanged. |
| No drag handles, word count or ⌘K links | Left out of this pass on purpose; offered to the user for a next one. |
| Coding delegated to subagents throughout; the main session only assesses | Asked for, twice. |

## Problems found

- **Fast typing into a new bullet drops letters** (Enter, then type: "Wrote the onboarding guide" became "Wrote te onboarding guie"), with "two children with the same key new-…" in the console. It predates this session (`9b24790` does it too). A new bullet that has been typeset is in the overlay's `written` list twice, as a page bullet and as a "new" one, so React remounts the field under the caret. **Not fixed**: see Open.
- **Margins were not inverted.** Narrow is 0.30in with a 7.90in text block, wide 0.70in and 7.10in, on Classic and Modern. The likely confusion: the default was labelled bare "Margins", and "Narrow" reads as a narrow column of text.
- **The IDE's TypeScript errors in `editor.tsx` were stale** every time they appeared (a missing `label` export, `onCancel`, `body`): `tsc --noEmit` passed on disk each time.
- **The session ran on Haiku at first by mistake**; the first three commits were orchestrated from it, with Opus agents doing the work.
- **Two agents shared one Playwright browser** for a while and kept navigating each other's tab; later agents used their own.
- **The `\underline` match in `withDoc` broke on escaped braces** once links could be added; it's now aware of nested braces.
- **`handled` in `Written` was cleared when an edit ended, not when it started**, so a field left by a move could re-commit its old text on blur.
- **Unsplash serves a browser check to `curl`**; photos were fetched from `images.unsplash.com` at `w=4000`.
- **The usage limit ended the last agent mid-task** (it resets at 23:30 America/Sao_Paulo).

## Open

- **The follow-up round was cut off at its first step.** The agent had only added a temporary trace line to [`overlay.tsx`](../../../frontend/app/resumes/overlay.tsx) (marked `TRACE-TEMP`, **uncommitted in the working tree**; remove it or let the agent finish). Its four items, all still to do:
  1. **The dropped-letters bug** above. Acceptance: exact text at 30 ms and 0 ms per key across Enter-type, three bullets in a row, a mid-bullet split and 5 s of continuous typing; the caret only ever advances by one; no "same key" warnings; Backspace, Esc, arrows, Alt+↑/↓ and ⌘Z unchanged.
  2. **The resume's name is clipped** to "Master resu..." in the header with the bar empty beside it; it should show in full when there's room.
  3. **"Remove link" is spelled out five times** in the Contact card; make it a quiet × like a bullet's, and the same wherever a worded remove button repeats down a list.
  4. **A form field with braces or backslashes doesn't save** (`C++ {templates}`, `AT&T \ R&D`).
  - Also check that the zoom pill doesn't permanently cover the page's last lines.
- **Nothing is pushed and there's no PR** for `feat/resume-editor-ux`.
- **`CLAUDE.md`'s security summary** still says links are http(s)/mailto only; the security doc now includes `tel:`.
- **Moving a bullet** swaps texts within one entry; a bold label opening an item stays in place. Real order needs the API's bullets as a list.
- **Undo history is lost on reload**, and without Tectonic, Download gives the template's original PDF.
- **Auth pages:** the forms still aren't wired; on a phone, sign-up has a large gap above its heading (the step bar's reserved space); the slogan wasn't checked between 430 and 1023px; Ty Feague's photo passed by eye only, its contrast wasn't measured; "the job hunt." is 8% narrower than "Glide through" above it.
- **Not checked:** real touch hardware and coarse-pointer sizes, Safari, pinch zoom, screen readers, and old saved documents that hold chat-added projects.
- An occasional `ERR_FILE_NOT_FOUND` on a revoked blob URL after a reload; not confirmed whether it's new.
- Still open from before: no frontend test runner, the four Overleaf templates don't read the shared body, everything signed-in is localStorage.
