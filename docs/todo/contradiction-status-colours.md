# Recolour every error, warning, success and destructive state to the status scheme

> Kind: `contradiction`. Found: 2026-11-16 by hand on `feat/resume-editor-ux` (`b67ec96`), when the status colours were added to the design system.
> Blocks: nothing. Asked for as "see the errors and change the colours of them".

## What the code does

Everything that isn't calm wears the error colour, whether it is an error or not. The token values changed under the existing class names in the commit that added the scheme (`error` went from salmon `#f4a28c` to brick `#C2362B`, `error-text` from `#b8401f` to `#9A1F1A`), so every place below **already looks different**: a deeper red, and the `/20` and `/25` tints are much heavier than the old pastel ones. Line numbers are from `b67ec96` plus uncommitted work; `/jobs` was still in progress.

### Really errors (keep `error` / `error-text`, check the pattern)

| Where | What | Uses now | Under the scheme |
|---|---|---|---|
| `frontend/app/(auth)/form.tsx:9` | Auth input, invalid | `aria-invalid:ring-2 ring-error`, `focus:ring-error-text` | Right. Ring is `error`; the focused ring in `error-text` can stay or go to `error` |
| `frontend/app/(auth)/form.tsx:14` | `FieldError` message (auth forms and `/jobs` dialog) | `text-error-text`, `role="alert"` | Right |
| `frontend/app/(auth)/form.tsx:16` | `FieldError` icon | `fill-error` circle, white `!` | Right (white on `error` 5.45:1) |
| `frontend/app/jobs/dialog.tsx:81,86,93,102` | Save dialog field errors | `FieldError` + `input` from form.tsx | Right, inherits the above |
| `frontend/app/jobs/dialog.tsx:98` | "N left" counter past the limit | `text-error-text` when `left < 0`, `text-ink/50` before | Right, it blocks saving. Before 0 it could be `warning-text` near the limit, or stay `ink/50` |
| `frontend/app/jobs/jobs.tsx:382,384` | "When did you apply" date field | `ring-error`, `text-error-text` alert | Right, but no icon: add the `FieldError` icon (or use `FieldError`) so colour isn't the only signal beyond the words |
| `frontend/components/assistant-ui/elements/thread.aui.tsx:567` | Message error box | `border-destructive bg-destructive/10 text-destructive` (+ `dark:text-red-200`) | Error, but off-pattern: should be `bg-error/15` (`/12` on white), `text-error-text`, no border, plus an icon. Drop the `dark:` raw colours |
| `frontend/components/assistant-ui/elements/attachment.aui.tsx:167,195` | Attachment failed: tile ring, alert icon | `after:ring-destructive/60`, `text-destructive` icon | Error. Ring and icon should be `error` (base for marks); check the tile has words or `sr-only` text |
| `frontend/components/assistant-ui/elements/tool-fallback.aui.tsx:969` | Tool approval error text | `text-destructive` | Right (`destructive` maps to `error-text`) |
| `frontend/components/ui/input.tsx:11`, `textarea.tsx:9`, `button.tsx:6` | shadcn invalid state | `aria-invalid:border-destructive ring-destructive/20` | Border and ring are marks: should be `error`, not `error-text`. Remove the `dark:` variants (no dark mode) |

### Destructive actions (error role)

| Where | What | Uses now | Under the scheme |
|---|---|---|---|
| `frontend/app/resumes/home.tsx:171` | Menu "Delete" | `text-error-text` | Right. If a confirm step is added, its button is a solid `bg-error` with white text |
| `frontend/app/jobs/jobs.tsx:265` | Menu remove a job | `text-error-text` | Right, same as home |
| `frontend/app/resumes/content.tsx:466` | Remove (x) on an entry, arms on first press | `hover:bg-error/25 text-error-text`, armed `bg-error/25` | Destructive, but `/25` is over the cap: use `/15` (`/12` on white). The x is an icon, `aria-label` already worded |
| `frontend/app/resumes/content.tsx:477` | Worded "Remove ..." / "Press again to remove" | same `/25` tint | Text on `error/25` over `mist/60` is **4.67:1**, legal but over the `/20` cap; on plain mist it would be 4.49 and fail. Drop to `/15` |
| `frontend/app/resumes/content.tsx:659` | Delete bullet (x) | `hover:bg-error/25 hover:text-error-text` | Same: `/15` (`/12` on the white bullet card) |
| `frontend/components/assistant-ui/elements/thread-list.aui.tsx:451` | Thread menu "Delete" | `text-destructive hover:bg-destructive/10` | Right |
| `frontend/components/ui/button.tsx:17-18` | `destructive` variant | `bg-destructive/10 text-destructive` | Fine as a quiet destructive. Not used anywhere today |

### Wearing the error colour but really warnings

| Where | What | Uses now | Under the scheme |
|---|---|---|---|
| `frontend/app/resumes/editor.tsx:589` | "Runs to N pages" badge | `bg-error/20 text-error-text` | **Warning**: a two-page resume is a problem to fix, not a failure. `bg-warning/15 text-warning-text` plus an icon (`TriangleAlert`) |
| `frontend/app/resumes/editor.tsx:576` | Job keyword chip, missing state | `bg-error/20 text-error-text`, `·` mark, `sr-only` "(missing)" | **Warning** (or neutral): a missing keyword is advice. `bg-warning/12` (the popover is white) with `text-warning-text`; covered chips stay `accent` |
| `frontend/components/assistant-ui/elements/thread.aui.tsx:567` | Message stale state | raw `amber-500/40`, `amber-500/10`, `text-amber-800`, `dark:` amber | **Warning**: `bg-warning/15 text-warning-text`, no raw amber |
| `frontend/components/assistant-ui/elements/thread.aui.tsx:571` | "Resume" button on a stale message | raw `border-amber-500/40 hover:bg-amber-500/15` | Neutral secondary button; it is an action, not a status. Use the house secondary pill |

### Wearing the error colour but really neutral or info

| Where | What | Uses now | Under the scheme |
|---|---|---|---|
| `frontend/app/resumes/editor.tsx:663` | "This template keeps its own copy" bar | `bg-error/15 text-ink/75` | **Info**: nothing is wrong, it's a limitation. `bg-accent/10` with `text-accent-text` or ink, or `bg-mist` like the "master resume changed" bar under it (line 668) |
| `frontend/app/resumes/editor.tsx:531,538` | "PDF can't be typeset here" (render failed) | `title` + "PDF preview is off" in `text-ink/40` | Already neutral, no status colour. Fine; optionally a `warning` icon. There is no longer a coloured bar for it |
| `frontend/components/assistant-ui/elements/thread.aui.tsx:534` | Stop dictation button | `text-destructive` | **Neutral**: stopping a recording isn't destructive. `text-ink` (or `accent-text` for "recording") |

### Not status (leave alone)

Google logo fills in `frontend/app/(auth)/form.tsx:77-80` (brand), syntax-theme hex in `frontend/app/templates/viewer.tsx:16-20`, banner hex in `frontend/app/banner.tsx:20-22`. The editor's "Saved" tick (`editor.tsx:536`, `text-accent-text`) is a calm state, not a success moment: keep it.

## What the docs say

[`docs/design/README.md#status-colours`](../design/README.md#status-colours): words in the `-text` shade, icons and rings in the base; a message is a `/15` tint on paper or mist, `/12` on white, **never past `/20` under text**; white text only on `error` and `success`; colour is never the only signal; a status colour only means its status.

## Proposed change

Recolour each row to its role above. Counts: 10 errors, 7 destructive actions, 4 warnings, 3 neutral/info. Contrast after the token change, before any recolouring: nothing fails AA yet (the `/20` badge and chips are 5.35:1 on paper and 5.99:1 on white; the `/25` worded remove is 4.67:1), but the three `/25` tints break the new `/20` cap and the warning-shaped states read as errors.

`--color-destructive` stays mapped to `error-text` (every shadcn/assistant-ui use is text or a tint under text); the border and ring uses in `components/ui/` should switch to `error` directly.

How to check: each state seen in the browser at 1440 and 390 (auth field error, `/jobs` dialog and date field, the "Runs to" badge, keyword popover, content form removes armed and hovered, home and `/jobs` delete, the template bar, an assistant error and a stale message); contrast measured for every text-on-tint pair; a screen reader label wherever colour was the only signal.
