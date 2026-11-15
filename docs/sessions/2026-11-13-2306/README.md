# Session 2026-11-13-2306

> Branch: `feat/frontend-polish` · Commits: `c2efe19`..`36f5f50` · Author: raulkolaric

## Summary

Set out to make the resume editor feel like Google Docs while the page stays a real LaTeX PDF. It ended with the page behaving as one document (a caret that walks across everything, text that saves as you write, one undo history), real bold, italic and underline, a toolbar with the document's font, size and margins, a content form on the left that edits what the page couldn't (links above all), and the chat on the right, both panels resizable and collapsible. The previous session's uncommitted work was committed first.

## Done

- **Committed the previous session's work** in four commits (`c2efe19`, `4b00f97`, `3554e7e`, `702e3d5`): backend settings, templates and viewer, the `/resumes` editor, landing and favicon. A root [`.gitignore`](../../../.gitignore) now leaves out `.playwright-mcp/` and `.DS_Store`.
- **The page as one document** (`b36c931`, [`inplace.tsx`](../../../frontend/app/resumes/inplace.tsx), [`overlay.tsx`](../../../frontend/app/resumes/overlay.tsx)):
  - ←/→ at a field's edge go into the text before or after it in reading order; ↑/↓ go to the nearest line above or below, at the same place across. Bullets, titles, dates and locations alike; the field you leave is saved.
  - **Saves as you write:** a 0.7s pause saves the text and typesets it, the field keeping its text, focus and caret over the new page. Never an empty bullet, which would delete it.
  - **One undo history:** ⌘Z takes back typing not saved yet, then steps through the document's changes. The toolbar's undo and redo grey out when there's nothing to step to.
- **Bold, italic, underline** ([`tex.ts`](../../../frontend/app/resumes/tex.ts)): bullets carry them as `<b>`, `<i>`, `<u>`, written to LaTeX as `\textbf`, `\textit`, `\underline`. While typing they show in the PDF's own bold and italic faces, found by the fonts' PostScript names ([`pdf.tsx`](../../../frontend/app/templates/pdf.tsx), [`pdf.css`](../../../frontend/app/templates/pdf.css)). Enter inside formatted text splits the bullet and keeps the formatting on both halves. Paste goes in as plain text.
- **Toolbar** ([`editor.tsx`](../../../frontend/app/resumes/editor.tsx)): content-panel toggle, undo, redo, font (Times, Palatino, Charter, Latin Modern, Helvetica), type size (10/11/12 pt), margins (narrow, wide), B / I / U, a symbols menu (– — → × ≈ ≥ ≤ ± °), and "Saving… / Saved in this browser". Font, size and margins are written into the template's preamble (`styled` in `tex.ts`); all combinations were compiled with Tectonic on Classic and Modern.
- **Content form, the left panel** (`36f5f50`, [`content.tsx`](../../../frontend/app/resumes/content.tsx)): an accordion with a section per section of the resume, read off the LaTeX body (`outline` in `tex.ts`), each entry a card with its texts and bullets. It writes the same changes the page does, so both stay in step. Bullets can be edited, deleted and added.
  - **Links:** each underlined header text (email, phone, LinkedIn, GitHub, Portfolio) takes an address, set as `\href` in the PDF. Web, mail and phone addresses only.
- **Panels:** content on the left, chat on the right, both dragged to resize and folded from their buttons or by dragging shut; under 1024px they start folded. The PDF now redraws to fit when its box changes width.
- **Chat** ([`chat.tsx`](../../../frontend/app/app/chat.tsx)): stays on the newest message unless you've scrolled up, with a button back down; messages and the typing dots animate.
- **Libraries added:** `react-resizable-panels` 4 (panels), `@base-ui/react` 1.9 (accordion, selects), `motion` (chat animation), `use-stick-to-bottom` (chat scroll), `lucide-react` (icons).

## Decisions

| Decision | Why |
|----------|-----|
| Save on a pause in the typing, as well as on Enter and blur | A document never asks to be saved. Reverses last session's "saved on Enter or blur": the field already survived the page being swapped under it, so a save mid-sentence costs nothing visible. |
| Esc only drops what was typed since the last save | Follows from saving as you write; ⌘Z takes back the rest. |
| Bold, italic, underline and symbols in bullets only | Any other text is matched back to the LaTeX by its whole text; a bold word splits it into several runs in the PDF and the match is lost. |
| Formatting kept as `<b>`/`<i>`/`<u>` in the bullet's text, `&` and `<` escaped | It's what a contenteditable produces; one small serialiser, and only those three tags are ever rendered or turned into LaTeX. |
| Bold and italic faces found by PostScript name (`fontExtraProperties`) | pdf.js's bold/italic flags are empty for TeX's Type 1 fonts. |
| The content form is read off the LaTeX body, not the profile data | It follows whatever the body contains, and its field keys are the page's run keys, so the form and the page write one document. |
| A link is a URL kept beside the underlined text | The body only underlines; nothing in it held an address. |
| The symbols menu is plain buttons, not a menu component | A menu takes focus, which would take the caret out of the text the symbol goes into. |
| Base UI, resizable-panels, motion, stick-to-bottom, lucide; not assistant-ui or AI Elements | Asked for current libraries to make the editor nicer. The two chat kits are built around a live model runtime, and the chat is still scripted. |
| A folded panel's content is hidden, not clipped | With no width its content spilled and made the page scroll sideways. |

## Problems found

- **pdf.js reported no font as bold or italic;** fixed by asking for the fonts' names and reading the face from them.
- **A bullet opening in bold was set entirely in bold while edited:** the field took its font from the first run. It now takes the font most of the page's bullet text is set in.
- **Splitting a bullet inside bold left a space inside the tag,** which LaTeX printed as an indent; spaces are trimmed inside the opening and closing marks.
- **Editing the name on the page a second time was silently lost:** the template sets it in capitals, so the edit was never matched back to its run. Runs in capitals are now matched whatever their case.
- **The folded chat spilled past the screen** on narrow windows (see Decisions).
- **Runs of different fonts on one line sit at slightly different heights,** which broke left/right order; reading order now compares lines with a tolerance.

## Open

- **Editing a bullet in the form drops its bold, italic and underline:** the form writes plain text.
- **Bold-italic together shows in Times while typing,** then in the real face once typeset.
- **No reordering, and no adding whole entries from the form;** new experiences still come through the chat, as projects.
- **Links aren't clickable in the on-screen preview** (no annotation layer), only in the downloaded PDF.
- **A save landing mid-selection collapses the selection** to a caret; an undo step ends the edit.
- **Not checked:** Safari and Firefox, a two-page resume, zoom other than 100%, dragging the panel handles by hand, the look of the form on a phone.
- **No test runner in the frontend:** the LaTeX escaping, links, outline and preamble checks were one-off scripts. `tex.ts` is the file that most deserves kept tests.
- Still open from last session: the four Overleaf templates don't read the shared body (the form and the font/size/margin controls don't reach them), coloured templates lose colour while editing, and everything is in localStorage until the API has `/resumes` and `/experiences`.
- Swap the scripted chat for the real one when the AI routes exist; assistant-ui or AI Elements fit then.
