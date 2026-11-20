# Session 2026-11-19-2333

> Branch: `feat/auth-rate-limit` (after PR #28 merged) · Commits: `d6fc52b`..`c95fc3d` · Author: raulkolaric

## Summary

A frontend session on `/resources`, run mostly through parallel subagents with strict file ownership. The section went from three guides to six plus six posts, got new geometric covers, an index that opens on a fading preview of the first guide beside a compact list, and motion that answers the reader. Two rules came out of the user's feedback and went into the design doc: no one-word lines, and no filler copy. The session also added dark mode behind a developer flag and an authoring guide for new guides and posts.

## Done

- **Content** (`d6fc52b`): three new guides, [`github-profile`](../../../frontend/app/resources/articles/github-profile.tsx), [`applications`](../../../frontend/app/resources/articles/applications.tsx) and [`first-offer`](../../../frontend/app/resources/articles/first-offer.tsx), with route folders, in job-hunt order in [`articles/index.ts`](../../../frontend/app/resources/articles/index.ts). Three new posts: [`english-resume-brazilian-applicants`](../../../frontend/app/resources/posts/english-resume-brazilian-applicants.tsx), [`resume-verbs`](../../../frontend/app/resources/posts/resume-verbs.tsx) and [`junior-resume-mistakes`](../../../frontend/app/resources/posts/junior-resume-mistakes.tsx). All are cross-linked with the existing pieces.
- **Content parts** in [`parts.tsx`](../../../frontend/app/resources/parts.tsx):
  - `Example` and `Note` have a clearer hierarchy (icon plus word labels, an accent or warning bar).
  - New parts: `Takeaways`, `Steps`, `DoDont`.
  - [`checklist.tsx`](../../../frontend/app/resources/checklist.tsx) has a progress bar, an "All done" state and "Start over".
- **Covers** in [`cover.tsx`](../../../frontend/app/resources/cover.tsx):
  - The hand-drawn SVGs became geometric ones in tokens only: three bespoke covers, plus four families generated from the slug for any other post.
  - Each cover plays its story once when it first scrolls into view (`ecd0e9d`, [`covers/`](../../../frontend/app/resources/covers/)).
- **Article page** ([`article.tsx`](../../../frontend/app/resources/article.tsx), [`toc.tsx`](../../../frontend/app/resources/toc.tsx)):
  - The table of contents marks the section in view, with a sliding marker.
  - A reading progress bar, breadcrumbs, and "#" links to sections in the margin.
  - "Keep reading" prev/next works for posts too, and the last guide hands over to the blog.
  - Print styles.
  - Shared `TryRayume` closing panel whose glow follows the pointer.
- **Index** ([`page.tsx`](../../../frontend/app/resources/page.tsx), `ecd0e9d`):
  - Opens on the first two sections of `guides[0]`, masked out into a "Read the guide" button.
  - A compact sticky sidebar lists all six guides.
  - The blog and `TryRayume` follow underneath. Smaller titles throughout.
- **Motion** ([`motion/`](../../../frontend/app/resources/motion/), [`motion-article/`](../../../frontend/app/resources/motion-article/)):
  - A rise-in on load.
  - One ring on "Start here".
  - Hover underlines that draw in.
  - Cover tilt toward the pointer.
  - Checklist tick draw with a one-time spark burst.
  - Before/after examples that play once.
  - All CSS or small IntersectionObserver islands, off under reduced motion, and complete without JS.
- **No one-word lines:** a base rule in [`globals.css`](../../../frontend/app/globals.css) (`text-wrap: balance` on headings, `pretty` on text), written into [`docs/design/README.md`](../../design/README.md) with "shorter phrase on top" and a ` ` fix for titles.
- **Dark mode** (`c95fc3d`):
  - `NEXT_PUBLIC_FLAG_DARK_MODE`, read only in [`lib/flags.ts`](../../../frontend/lib/flags.ts), listed in a new [`frontend/.env.example`](../../../frontend/.env.example).
  - The existing tokens get dark values, plus two new tokens, `surface` and `on-ink`.
  - A pre-paint script in [`layout.tsx`](../../../frontend/app/layout.tsx) follows the system.
  - About 51 `bg-white` became `bg-surface` and about 14 `text-white` became `text-on-ink` across the app. A `data-theme="light"` scope keeps photo scrims and ink panels light.
  - All 66 changed pairs pass AA. The palette is in the design doc's "Dark mode (flagged)" section.
- **Authoring guide:** [`docs/resources/README.md`](../../resources/README.md) covers how to add a guide or post, every field and part, sources, voice and a pre-PR checklist. A row for it is in [`CLAUDE.md`](../../../CLAUDE.md).
- **Docs:** the `/resources` and dark mode lines in [`docs/PROJECT.md`](../../PROJECT.md), and one line in [`docs/security/README.md`](../../security/README.md) on the fixed-string theme script.
- **Outside the repo:** a memory note that UI copy must be useful (no counts, labels or kickers that restate the screen).

## Decisions

| Decision | Why |
|----------|-----|
| Subagents with disjoint file ownership in one checkout | The user wanted parallel agents and to watch the result live on `:3000`. Worktrees would have hidden the work from that dev server. Ownership changed by message when a file moved (e.g. `cover.tsx` from polish to the image agent). |
| No ambient or looping motion: everything plays once or answers the pointer | The design doc keeps ambient motion to the landing's ocean band. "Magical" was done with story-once reveals and responses to hover and clicks. Generic fade-in on every section was left out for the same reason. |
| Covers already on screen at load don't play | Replaying them would flash the finished server drawing blank after hydration. They only get the hover effect. |
| One global `text-wrap` rule, not per-heading classes | It fixes one-word lines site-wide in one place. CSS can't guarantee "shorter on top", so titles that wrap badly get a hand-placed ` `. |
| Removed the stage groups ("Write it / Send it / Land it") | The user found them ugly in the sidebar. The `guides` order already carries the job-hunt order, and the numbers show it. |
| Dark mode as a developer flag with no toggle | The user's call: it's for building and checking dark, not a user feature yet. A visible toggle first confused things: on a light Mac "system" and "light" look the same, so its first click seemed to do nothing. |
| Dark through redefined tokens, not `dark:` classes | Components adapt with no per-component branches, and the flag off computes to today's exact colours. |
| Soften Rayume claims in articles ("being built to…") | `docs/PROJECT.md` says the AI and tailoring aren't built. The `TryRayume` pitch was kept as marketing copy like the landing. |
| Kept working on `feat/auth-rate-limit` after #28 merged | The rule is no new branches unless asked, so the PR comes from this branch with only the new commits. |

## Problems found

- **New CSS didn't show at first:** the `:3000` dev server kept serving an old `globals.css` chunk for a while after the edit, so `text-wrap` computed to `auto`. It picked up on a later reload, with no restart needed.
- **The section "#" link wrapped onto its own empty line** under article headings on phones. It now sits in the left margin and only shows on `lg`.
- **`/resources/blog/[slug]` and `guide.tsx` briefly failed tsc** while the layout agent renamed `back` to `trail`. Fixed within the same agent's work.
- **The dark "Skip the blank page" panel** turned cream with white text. It is now scoped `data-theme="light"`.
- **All-caps tracked stage labels** went against the design doc. They were changed to sentence case, then the stages were removed.
- **`next build` printed a security advisory for Next 16.4.2** and recommended `next upgrade --agent=security`. A rerun built fine. The upgrade was not run.
- **Shared Playwright tab:** agents navigated each other's tab. They switched to their own tabs or headless Chromium.

## Open

- **Review the facts:** the CLT vs PJ year table in `first-offer` needs a check by someone who knows Brazilian labour law. Two citations (Constitution art. 7, Lei 8.036) were added from memory, not opened.
- **Next.js security advisory:** decide whether to upgrade from 16.4.2.
- **Footer** lists 3 of the 6 guides by hand.
- **Not looked at by eye:** the cover tilt and Glyph stroke-draw in Safari and Firefox, the Stack and Grid cover families (no post uses them yet), and the dark signed-in pages (`/resumes`, `/jobs`, the editor). `viewport.themeColor` stays paper in dark.
- **The sticky sidebar** barely holds on `lg`: the preview is about as tall as the list.
- **Checklist ticks are stored by position:** insert new items at the end, or change the id.
- From earlier sessions: [`security-proxy-client-ip.md`](../../todo/security-proxy-client-ip.md) before a public API deploy, `GET /me`, then `/experiences` and `/resumes`.
