# Session 2026-11-14-1334

> Branch: `feat/frontend-polish` · Commits: `eeabad7`..`e52a977` · Author: raulkolaric

## Summary

Set out to update the docs and polish the resume editor, and grew into four pieces: Rayume's chat rebuilt as a full assistant-ui chatbot, Experience management (labelled form, any job removable, sorted by date, a settings page), an Overleaf-style Code mode on CodeMirror, and rendering that keeps up with typing (~1.1 s to ~0.3 s from keystroke to page, same pixels). It ended with link-preview banners, a design for compiling LaTeX in production, and everything in PR [#16](https://github.com/PUCTech/rayume/pull/16).

## Done

- **Docs brought up to date** (`eeabad7`, by a subagent): [`PROJECT.md`](../../PROJECT.md) current state and routes, backend settings and schemas, the security doc's "what exists today", the design doc without the deleted landing gallery.
- **Editor polish** (`1f8029d`, `403d9be`, `35bbc36`, [`editor.tsx`](../../../frontend/app/resumes/editor.tsx)):
  - a chat fold button; both panels **slide** open and closed (flex-grow eased only while a button folds them, content kept at its least width and clipped while sliding).
  - **Code mode Preview fixed:** the box around the viewer had no `min-h-0`, so Code grew to the whole LaTeX (1921px in an 804px panel) and pushed Preview and Render off screen.
  - the "Ask Rayume" focus mode (✦ button, dimmed page, checkboxes, bar) is **gone**; selecting any text on the PDF or in Code shows **Send to chat**, which quotes it in the composer and opens the chat if folded.
- **Zoom** ([`pdf.tsx`](../../../frontend/app/templates/pdf.tsx)): pinch on trackpads (ctrl+wheel), Safari (gesture events) and phones (two touches). It follows the fingers with CSS `zoom` around the pinch point, then redraws sharp at the new size once the gesture pauses. Opens at 75%.
- **Experience** (`403d9be` by a subagent, then `52d1416`, [`content.tsx`](../../../frontend/app/resumes/content.tsx), [`tex.ts`](../../../frontend/app/resumes/tex.ts)):
  - every field labelled; job dates as month/year with a "Current" checkbox; Add experience, add/delete bullet, Remove experience; a save-state line at the top of the panel.
  - **[`/settings/experience`](../../../frontend/app/settings/experience/)** edits the same master-resume document, linked from the editor and the `/resumes` avatar.
  - **any job can be removed** (the body's own too), and Experience is **sorted by date**, current first. Experience is now ordered blocks (`blocksOf`), with `doc.order` and `doc.hidden`. **`rekey`** maps every saved edit to its job across an add, remove or re-sort, since edits are keyed as "the nth time this text appears". An assert script checks it (scratchpad `jobs.ts`; no test runner).
  - jobs added from the form can be selected on the PDF like the original ones.
- **Code mode on CodeMirror 6** ([`code.tsx`](../../../frontend/app/templates/code.tsx), [`viewer.tsx`](../../../frontend/app/templates/viewer.tsx)): line numbers, folding, ⌘F find/replace, bracket matching and closing, `\command` completion (the file's own macros first), ⌘↵ / ⌘S render (`Prec.highest`, ahead of the default Mod-Enter), an Auto render toggle, error lines that jump to their line, a Sections menu, a `.tex` download. Themes stay CSS variables. The template pages get it too.
- **Rayume as an assistant-ui chatbot** (`f773e82` → `d9f2dd4` → `ad79692`, [`chat.tsx`](../../../frontend/app/app/chat.tsx), [`components/assistant-ui/`](../../../frontend/components/assistant-ui/)):
  - `Thread` and `ThreadList` copied in from the assistant-ui shadcn registry (`base-nova`), recoloured to our palette ([`globals.css`](../../../frontend/app/globals.css) maps the shadcn tokens to paper/ink/mist/ultramarine).
  - a local runtime per chat under `useRemoteThreadListRuntime` (in-memory list, chats titled from their first message), with Rayume as a scripted `ChatModelAdapter`: streamed text and a reasoning note.
  - **resume actions as tool calls** (`defineToolkit`, render-only `backend` tools, `display: "standalone"`): "Replace in resume" and "Add to resume" store their result, so the card says it's done after switching chats.
  - edit and resend, regenerate with ‹ 1/2 › branches, stop, copy, feedback, read aloud, dictation, image/text attachments, starter suggestions and follow-ups. Quotes ride as composer attachments (type `quote`), shown as quote chips.
- **Rendering ~3.5x faster** (`7a31fb8`), measured in the editor from keystroke to page swap. Every stage was checked pixel by pixel against a plain compile (Classic, and Jake, whose `\label`/`\ref` needs two passes):

  | Stage | Before | After |
  |---|---|---|
  | Wait before rendering | ~713 ms | ~8 ms |
  | Server, new text | ~260–300 ms | ~177 ms |
  | Server, text seen before | ~260 ms | ~3 ms |
  | Client redraw | ~100 ms | ~60 ms |

  - [`/api/render`](../../../frontend/app/api/render/route.ts): one warm working copy that keeps the `.aux`, so Tectonic reruns TeX only when references change. `resumes/` is copied only when it changed; an LRU of recent inputs; compiles serialised; a failed compile clears its aux.
  - the editor and the form render each keystroke, with one render in flight and the newest queued; saves (undo steps) still wait for a pause.
  - pdf.js: one shared `PDFWorker` instead of a new worker per render.
- **Link previews** (`5f65b81`): [`opengraph-image.tsx`](../../../frontend/app/opengraph-image.tsx) (the landing's headline beside a tilted real Classic render with a Rayume bubble), one banner per template ([`templates/[id]/opengraph-image.tsx`](../../../frontend/app/templates/[id]/opengraph-image.tsx), alt per template via `generateImageMetadata`), `twitter-image` twins, an `apple-icon` from the favicon's manta, `metadataBase` on the production address, `theme-color`. [`share.ts`](../../../frontend/app/share.ts) sets title, description, Open Graph and X together on public pages. Fonts as TTFs in [`assets/fonts`](../../../frontend/assets/fonts/).
- **Render worker design** (`e52a977`, [`render-worker.md`](../../backend/architecture/render-worker.md)): why `/api/render` can't ship, and a compile sandbox for production. It holds no secrets and has no egress; each compile runs in its own `bwrap` jail with `tectonic --untrusted -C` and limits, and it keeps the ~0.3 s live preview. A dispatcher holding the DB and storage credentials serves stored renders. Also: the API, a Dockerfile and a rollout. [`renders.md`](../../backend/endpoints/renders.md), [`database/README.md`](../../database/README.md) and [`security/README.md`](../../security/README.md) point to it.
- **Research for the team** (subagent): five chat UI libraries ranked (assistant-ui, AI Elements, prompt-kit, CopilotKit, Deep Chat); assistant-ui picked.
- **PR [#16](https://github.com/PUCTech/rayume/pull/16)** opened for the branch (#15 had merged), description updated as work landed.
- **Libraries:** added `@assistant-ui/react`, `@assistant-ui/react-markdown`, `assistant-stream`, CodeMirror (`codemirror`, `@codemirror/*`, `@lezer/highlight`), `clsx`, `tailwind-merge`, `class-variance-authority`, `tw-animate-css`, `tw-shimmer`, `remark-gfm`, `zustand`; removed `use-stick-to-bottom`. [`components.json`](../../../frontend/components.json) points the shadcn CLI at the assistant-ui registry; [`lib/utils.ts`](../../../frontend/lib/utils.ts) holds `cn`.
- **Outside the repo:** a scratchpad Python venv with fontTools, to convert Geist Serif from woff2 to TTF.

## Decisions

| Decision | Why |
|----------|-----|
| Keep `/resumes/[id]`; no `/{user}/resumes/master` | The editor is private and the session knows the user. A username at the root collides with `/resumes`, `/templates`, `/login`… and breaks links when it changes. A username belongs in a future public, read-only share page (user dropped it for now). |
| assistant-ui's own components (`Thread`, `ThreadList`), not just its primitives | The first pass kept our look on primitives; the user wanted the library's chatbot. Copied in shadcn-style, so they're ours to edit. |
| `useLocalRuntime` + thread list, not the external store | The local runtime handles branching, edit, regenerate, cancel, tool results and every adapter natively; the scripted Rayume is just a model adapter that a real model later replaces. |
| Resume actions as standalone tool calls | The shape a real LLM backend uses (tools with results), and a press stores its result so the card remembers. Standalone, or they fold into "1 tool call". |
| No model selector, full-page sidebar or floating modal | Fake while Rayume is scripted, and they don't fit a 400px side panel. |
| Removed the focus mode for Send to chat | Asked for: a selection plus one button is simpler than focusing entries and ticking bullets. |
| Any job can be removed, the body's own included | "The user says what's on their resume." Body jobs are hidden, added ones deleted. |
| `rekey` instead of moving Experience to structured jobs | Keeps the run-key model the page and the form already share; one function maps edits across any structural change, checked by asserts. |
| Date sort: current first, then end, then start; dates read from what the resume says now | Newest first is how resumes read; a live preview doesn't re-sort (half-typed dates would jump), the save does. |
| Render optimisations only where output stays identical | The ask was "without tradeoffs": each change was checked pixel by pixel. `-r 0` was rejected (Jake needs two passes) in favour of keeping the aux, which reruns only when needed. |
| No preamble format | Tectonic can dump and load one (via its format cache), but XeTeX refuses to dump with native fonts loaded, and working around it risks the output; at most ~55 ms. |
| No engine change (pdfTeX, TeXpresso, WASM) for now | pdfTeX changes output; TeXpresso renders to its own viewer, not PDF bytes; WASM is slower per compile. Written up in the worker doc's open questions. |
| PDF opens at 75% | Read the user's "the default zoom level is 75%, change this" as "make it 75%". |
| Production compiling in a no-secrets sandbox with a `bwrap` jail per compile | A container per job (the security doc's first sketch) costs 300–800 ms to start, too slow for typing; the jail gives per-job isolation in a few ms, and the machine has nothing worth stealing. |
| Banners built with the site, assets read at module scope | With Cache Components, an image route can't read files while it answers (see Problems). |

## Problems found

- **Code mode Preview off screen:** missing `min-h-0` (see Done).
- **⌘↵ in Code inserted a blank line:** CodeMirror's default keymap takes Mod-Enter; our keymap now has `Prec.highest`.
- **The shadcn CLI installed an unrelated npm package called `cn`** instead of writing its helper, twice; removed, with imports pointed at `lib/utils.ts`.
- **shadcn's `accent` is a hover grey, ours is ultramarine:** the copied components were repointed to `muted`.
- **The rewrite card folded into "1 tool call":** tool UIs need `display: "standalone"`.
- **Tectonic was silently running TeX twice per render** in a fresh directory; the second pass changed only `CreationDate` and `/ID`.
- **Tectonic reads all of stdin before starting,** so a pre-warmed engine pool can't work with stock Tectonic.
- **Tectonic's format generator only reads the bundle;** a custom format had to be dumped by hand and placed in its cache, then XeTeX refused it ("Can't \dump a format with native fonts").
- **pdf.js started a new worker per document** (~40 ms of every redraw).
- **Link previews:** a page's `openGraph` replaced the layout's, image included, so pages using `share()` lost the banner. Page config also beats a segment's own image file, so templates now name theirs explicitly.
- **Template banners returned 500 in production only:** with Cache Components, an image route reading files per request fails at request time. Fixed by reading every render and font at module scope; all 15 image routes then returned 200 on `next start`.
- **The dev server cached image responses,** so a fixed banner kept showing the old one until a production build.
- **A synthetic ⌘Z dispatched on `window` threw** (`e.target.closest` on `window`): test-only, real key events target an element.
- **A test expectation was wrong, not the code:** two current jobs sort by start date.

## Open

- **Production rendering isn't built:** follow the rollout in [`render-worker.md`](../../backend/architecture/render-worker.md): `sandbox/` service, the attack-table tests against the image, `/api/render` forwarding with `COMPILE_TOKEN`, then the dispatcher. Check that `bwrap` gets user namespaces on a real Fly machine first.
- **In-browser TeX** (BusyTeX) for the live preview: offered as a time-boxed prototype measuring first load and per-keystroke time against Tectonic; not started.
- **The settings page shows every section,** Contact first. The user asked what was meant; offered: show only Experience, or keep all and open on it. Unanswered.
- **The chat:** chats live in memory (lost on reload), feedback goes nowhere, the reasoning text is canned with the scripted replies. With the API: a `RemoteThreadListAdapter` on `/chats` and a model call in `run`.
- **Removing one of the body's jobs** is tracked by its position in `body.tex`; inserting a job into that file before it would move the removal.
- **Code mode's auto render** still waits 1.2 s (to avoid flashing errors on half-typed commands).
- **Not checked:**
  - phone widths (the toolbar looked cramped at 390px) and the chat on a phone.
  - real pinch on hardware, Safari gestures, dictation and read-aloud.
  - AltaCV/Awesome on the faster render path.
  - how Slack, WhatsApp, X, LinkedIn and iMessage actually show the banners: they cache previews, so a link shared before the deploy may keep its old one (X's Card Validator and LinkedIn's Post Inspector refresh them).
- **The worker doc's diagram wasn't rendered locally** (fetching the Mermaid CLI was blocked); GitHub will show any syntax error.
- **Lint warnings** remain in the copied assistant-ui components (their `Image` component); none in our code.
- Still open from before: no frontend test runner (`tex.ts`, `rekey` and the escaper deserve kept tests), the four Overleaf templates don't read the shared body, everything signed-in is localStorage until the API has `/resumes` and `/experiences`.
