# Resources: writing guides and blog posts

> Status: **current**. How to add a guide or a post to `/resources`, with care. Code: [`frontend/app/resources/`](../../frontend/app/resources/).
> Read with [`../design/README.md`](../design/README.md) (Voice and copy, Typography, Motion) and [`../PROJECT.md`](../PROJECT.md) (scope, current state).

A guide or a post is **data**: an `Article` object whose sections are JSX in plain elements plus the parts in `parts.tsx`. The pages decide how it looks. The writing never sets a class.

## Contents

- [Guide or post?](#guide-or-post)
- [Add a guide](#add-a-guide)
- [Add a post](#add-a-post)
- [The Article fields](#the-article-fields)
- [Elements and parts](#elements-and-parts)
- [Sources and citations](#sources-and-citations)
- [Voice and copy](#voice-and-copy)
- [Scope guardrails](#scope-guardrails)
- [Before you open a PR](#before-you-open-a-pr)

## Where things live

| File | What it holds |
|------|---------------|
| `content.ts` | The `Article` and `Section` types: the contract |
| `parts.tsx` | `Example`, `Note`, `Takeaways`, `Steps`, `DoDont`, `Checklist`, `Cite` |
| `checklist.tsx` | How a `Checklist` ticks and remembers (localStorage) |
| `articles/<slug>.tsx`, `articles/index.ts` | One file per guide; `guides`, in job-hunt order |
| `<slug>/page.tsx` | One static route folder per guide |
| `guide.tsx` | Builds a guide's page and metadata from its slug, links its neighbours |
| `posts/<slug>.tsx`, `posts/index.ts` | One file per post; `posts`, newest first |
| `blog/[slug]/page.tsx` | One dynamic route for every post (static params from `posts`) |
| `page.tsx` | The index: the first guide's opening, the list of every guide, the latest posts |
| `cover.tsx`, `covers/` | Post covers: bespoke per slug, or generated from the slug |
| `article.tsx` | The one page every guide and post renders through |

## Guide or post?

| | Guide | Post |
|---|---|---|
| Purpose | The reference for one stage of the job hunt. Complete, sourced, kept up to date | One idea, one mistake, one opinion. Can be Rayume's own view or a finding |
| Length | 6 to 10 min, 1,300 to 2,300 words, 6 to 11 sections | 3 to 5 min, 500 to 950 words, 4 or 5 sections (more for a numbered list) |
| Tone | Calm and complete. Ends on something to do (often a `Checklist`) | Sharper, more opinion. Links back to the guide that goes deeper |
| Lives at | `/resources/{slug}` | `/resources/blog/{slug}` |
| Listed on | The index's sidebar list; the blog page's "Start with the guides" chips; the previous and next guide links | The blog page (all, with covers); the index's "From the blog" (the newest as lead, three more beside it); the older and newer post links |

Guides are read in order. `guides` in `articles/index.ts` is that order: the index lists them in it, numbered 01 to 06 in a sidebar, and each guide's "Next guide" link follows it; the last one hands over to the blog. Put a new guide where it falls in the job hunt (write, send, land).

The index opens on **`guides[0]`'s first two sections**, capped in height and faded out, with its `<Cite>` marks hidden. If you change the first guide or its opening, those sections have to read well alone and get to the point in the first two paragraphs.

## Add a guide

1. **Write `articles/<slug>.tsx`.** Export `article` (guides export `article`, posts export `post`).

   ```tsx
   import Link from "next/link";
   import type { Article } from "../content";
   import { Checklist, Cite, Example, Note } from "../parts";

   export const article: Article = {
     slug: "salary-research",
     title: "How to find out what a junior role pays",
     description: "Where real salary numbers for interns and juniors come from in Brazil and the US, and how to read them before an offer arrives.",
     updated: "2026-11-20",
     minutes: 7,
     author: "The Rayume team",
     sections: [
       {
         id: "why-know",
         title: "Know the number before they say it",
         body: (
           <>
             <p>
               A claim that needs a source, then its mark.
               <Cite n={1} />
             </p>
           </>
         ),
       },
       // ...
     ],
     sources: [{ title: "Page title as published", publisher: "Publisher", url: "https://example.org/the-page" }],
   };
   ```

2. **Add it to `articles/index.ts`** at its place in the hunt, not at the end by default:

   ```ts
   import { article as salaryResearch } from "./salary-research";

   export const guides = [resumeGuide, githubProfile, atsChecklist, applications, interviewPrep, salaryResearch, firstOffer];
   ```

3. **Add the route folder** `salary-research/page.tsx`, a copy of `resume-guide/page.tsx` with the slug changed. The slug in both lines must match the article's, or the build throws `No guide with slug "…" in articles/index.ts`.

   ```tsx
   import { Guide, guideMeta } from "../guide";

   export const metadata = guideMeta("salary-research");

   export default function Page() {
     return <Guide slug="salary-research" />;
   }
   ```

4. **Update [`docs/PROJECT.md`](../PROJECT.md)**: the `/resources` line counts the guides and lists their slugs.
5. Optional: the footer's Resources column (`app/footer.tsx`) lists a hand-picked three guides. Change it only on purpose.

## Add a post

1. **Write `posts/<slug>.tsx`.** Same shape, exported as `post`:

   ```tsx
   import Link from "next/link";
   import type { Article } from "../content";
   import { Cite, Example } from "../parts";

   export const post: Article = {
     slug: "readme-before-resume",
     title: "Write the README before the resume line",
     description: "If you can’t explain a project in its README, the bullet about it won’t hold up in the interview either. A short case for writing them in that order.",
     updated: "2026-11-20",
     minutes: 3,
     author: "The Rayume team",
     sections: [
       // ...
     ],
     sources: [],
   };
   ```

   With no sources, leave `sources` out rather than passing `[]`; both render nothing.

2. **Add it to `posts/index.ts`, newest first** (the list's order is the order on the blog, and its first entry is the index's lead post):

   ```ts
   import { post as readmeFirst } from "./readme-before-resume";

   export const posts: Article[] = [readmeFirst, englishResume, verbs, whyLatex, juniorMistakes, tailoring, firstResume];
   ```

   No route folder: `blog/[slug]/page.tsx` prerenders every slug in `posts`.

3. **The cover.** Nothing to do for a generated one. `Cover` seeds a random source with the slug and picks one of four families (`Stack`, `Grid`, `Terminal`, `Glyph`), so the cover is the same on every render. Changing the slug changes the cover.

### A bespoke cover

Worth it for a post the index will lead with for a while. Three posts have one today (`why-we-write-resumes-in-latex`, `what-tailoring-should-change`, `first-resume-no-experience`).

1. In `cover.tsx`, write a drawing function next to `Latex`, `Tailoring` and `First`:

   ```tsx
   function ReadmeFirst({ r, sheet }: P) {
     return (
       <>
         <Dots />
         <Resume r={r} x={40} y={36} w={84} h={126} fill={sheet} hot={0} />
         <Bar x={150} y={60} w={120} color={c.accent} opacity={1} />
       </>
     );
   }
   ```

2. Add it to `drawings` under the post's exact slug: `"readme-before-resume": ReadmeFirst,`.

Rules for a drawing:
- The canvas is the `viewBox` `0 0 320 220` (`W`, `H`). Colours come only from `c` (mist, paper, ink, accent, deep), which maps to the theme tokens. `sheet` is the colour of a page lying on the cover.
- Use `r()` for any variation, never `Math.random()`: server and browser must draw the same thing.
- Reuse `Dots`, `Page`, `Bar` and `Resume` before drawing from scratch.
- The cover is decorative (`aria-hidden`); the title says it all. No text that matters.
- Motion is optional, through the `cv-*` classes in `covers/covers.css`, with `v(i, delay)` for the stagger. Every story animates **from** a start frame **to** the element's natural state, and only once `covers/play.tsx` has armed the svg. So the drawing as written is the finished frame: no JS, reduced motion and a cover already on screen show it as is. Keep it that way.

## The Article fields

| Field | Rule |
|---|---|
| `slug` | Lowercase kebab-case, English, no dates, no stop-word padding: `first-offer`, `resume-verbs`. It's the URL, the key in `guides`/`posts`, the route folder name (guides) and the cover seed (posts). Never rename a published one: links break and a post's cover changes |
| `title` | Sentence case, no final full stop, no exclamation mark. It's the `h1`, the index card, and the tab and link-preview title (`{title} · Rayume`, or `· Rayume blog` for posts). See [one-word lines](#voice-and-copy) for wrapping |
| `description` | One or two sentences, **110 to 160 characters**. It's the lede under the title, the card text on the index and blog, and the meta description (search results cut around 155 to 160). Says what the reader gets, concretely. No "In this guide, we…" |
| `updated` | `YYYY-MM-DD`, read as a calendar day in UTC (`day()` in `article.tsx`), shown as "November 20, 2026". Bump it for a real content change, not a typo. On a post it's also the date the lists show, so if you bump it, move the post in `posts/index.ts` to keep newest first |
| `minutes` | Words in the sections divided by 200, rounded. The existing pieces sit at 180 to 230 words a minute. Count with the command below |
| `author` | As the byline shows it after "By". Every piece uses `"The Rayume team"`; keep it unless a named author is agreed |
| `sections` | `{ id, title, body }`. See below |
| `sources` | Optional. `{ title, publisher, url }`, in citation order. See [Sources](#sources-and-citations) |

```bash
# words in a piece's sections, roughly (tags stripped); divide by 200
sed -n '/sections:/,/sources:/p' frontend/app/resources/articles/<slug>.tsx | sed 's/<[^>]*>//g' | wc -w
```

**Section `id`**: lowercase kebab-case, short, stable (people share `#anchors`; the `#` link beside each heading hands them out). Unique within the piece. Don't use `sources` (the Sources block takes it) or anything ending in `-h` (each heading gets `{id}-h`). Name it after the idea, not the position: `xyz`, not `section-5`.

**Section `title`**: sentence case, and it doubles as the contents entry, in a 14rem sidebar on desktop and a folded "On this page" list on phones. Keep it under about 50 characters so the contents reads as a list of the piece's argument. A numbered listicle post may number its titles (`"1. Misspelled tech names"`).

## Elements and parts

**Plain elements**, as listed in `content.ts`: `p`, `h3`, `ul`, `ol`, `li`, `strong`, `em`, `a`, `blockquote`, `table` (with `thead`, `tbody`, `tr`, `th`, `td`), `code`. The section title is the `h2`; inside a body, use `h3` only (the prose styles nothing deeper). Wrap a body in a fragment `<>…</>`.

- **Never set `className` or `style`** in the writing. If something needs a new look, it needs a new part, which is a design change, not a writing one.
- **Links inside the site use `next/link`**: `<Link href="/resources/ats-checklist">ATS checklist</Link>`. Lint fails on a plain `<a>` to a site page (`@next/next/no-html-link-for-pages`). Link guides and posts to each other wherever one goes deeper; the house pattern is a short phrase as the link text, never "click here".
- **External links** go in `sources` with a `<Cite>`, not inline `<a>`. If an inline external link is truly needed, `https://` only, to the page itself (no shorteners, no tracking parameters).
- `strong` for the label at the start of a list item (`<strong>Photo:</strong> out.`); `em` for one word of stress, rarely; `code` for file names, repo names, commands and things a reader would type (`Firstname-Lastname-Resume.pdf`, `jakegut/resume`).
- `blockquote` for a quote long enough to stand alone, with its `<Cite>` inside.
- `table` for real comparisons with two or more columns of data (the CLT vs PJ table in `first-offer`). It scrolls sideways inside itself on phones; keep it to three or four short columns.
- In JSX text, use `’` and `“ ”` (typographic quotes), as every piece does. A plain `'` in JSX text is a lint error.

**The parts** (`import { … } from "../parts"`). Their looks belong to the design pass; their props stay.

### `Example`: a line rewritten

A weak version struck through, then the strong one, with an optional `note` on why. Plays once on the way in (finished state with reduced motion).

```tsx
<Example
  before="Responsible for testing."
  after="Raised test coverage on my estágio team’s billing service from 41% to 78% by writing 120 pytest cases for the invoice and refund flows."
  note="“Responsible for” describes a job ad. Start with what you did."
/>
```

Use it for resume lines, READMEs, messages: anything the reader will rewrite. `beforeLabel` and `afterLabel` (default Before, After) rename the sides when it's not a rewrite: `beforeLabel="Vague" afterLabel="Specific"`. Make the "after" believable for a student (a course project, an estágio, a club), with a number and its baseline. Don't use it for two options that are both fine.

### `Note`: a tip or a warning

```tsx
<Note kind="warning">
  <p>Deleting the file in a new commit doesn’t remove it from history. Revoke and rotate the key first.</p>
</Note>
```

`kind` is `"tip"` (default, labelled "Tip") or `"warning"` ("Watch out"); `title` renames the label. Children are paragraphs. One per section at most, and only for something worth stopping for: a common mistake, a myth corrected, a shortcut. A paragraph that is just more prose stays a paragraph.

### `Takeaways`: the short version

```tsx
<Takeaways
  title="The quick version"
  items={["Spell tech names the way their owners do.", "Every link works, from a logged-out browser."]}
/>
```

`title` defaults to "In short". Three to five items, each a full sentence a skimmer could act on. Put it first or last in the piece, **not both**; the guides put it in the first section.

### `Steps`: a sequence followed in order

```tsx
<Steps
  items={[
    { title: "What is it?", detail: "One sentence, plain words. Then a screenshot or a live demo." },
    { title: "How do I run it?", detail: <>Commands to copy. Include a <code>.env.example</code>.</> },
  ]}
/>
```

Only for a real order (do this, then this). A list where order doesn't matter is a plain `ul`. `detail` is optional.

### `DoDont`: what to do and what to skip

```tsx
<DoDont
  do={["Archive the empty repos and untouched course templates."]}
  dont={["Link a private repo. Everyone except you sees a 404."]}
/>
```

Two short lists, side by side (stacked on phones). Three to five items each, parallel where you can. The Don't side says why in a few words.

### `Checklist`: things to tick off

```tsx
<Checklist
  id="salary-before-call"
  items={[
    { label: "Two sources for the range", detail: "One survey, one posting with a published band." },
    { label: "Your number written down" },
  ]}
/>
```

Ticks are kept in the reader's browser under `rayume:checklist:{id}`, as the **indices** of the ticked items.
- `id` is unique **across the whole site**, prefixed with the piece's topic: `ats-layout`, `github-before-link`, `offer-before-sign`. Check with `grep -rn 'id="' frontend/app/resources/articles frontend/app/resources/posts`.
- Once published, add new items at the end or change the `id`: reordering or inserting shifts what returning readers see ticked.
- `label` is short and checkable (a state, not advice); `detail` says how to check it. Five to ten items. Usually the guide's last section.

### `Cite`: a numbered source mark

`<Cite n={3} />`, right after the claim, after the punctuation, on its own line in the JSX. See below.

## Sources and citations

- **Only real URLs you have opened** and read, that say what you claim. Never a URL from memory, a search snippet or a model's suggestion. If you can't open it, it isn't a source.
- Prefer the primary source: the law on Planalto, the company's own docs (GitHub Docs, Greenhouse Support), the survey's publisher (NACE). A secondary report is fine when the original isn't public; name both (`"LinkedIn, copy hosted by Cal State LA"`).
- `title` is the page's own title; `publisher` the organization. Each URL appears once in `sources` (the list is keyed by URL).
- **Numbering**: `n` is the source's 1-based position in `sources`, and the mark links to `#source-{n}`. Number in order of first citation, and reuse a number when you cite the same source again. Re-number everything if you insert a source in the middle.
- **What needs a source**: every number, percentage, date, law, quote, and every claim about how a named product or company behaves (an ATS, a job site, an employer). Quote the exact words, translated in the text if needed, Portuguese kept when the wording matters.
- **What doesn't**: advice and judgment ("Cut the weakest bullet. Don't shrink the font."), and examples the piece made up, which must read as examples.
- **Unsourced claims are softened**: "usually", "in our experience", "most recruiters we've read". Never invent a statistic, and never pass off a guess as a finding.
- When a popular claim is shaky, say so and why, as the 7.4-seconds section in `resume-guide` does. That candour is the voice.

## Voice and copy

From [`design/README.md`](../design/README.md#voice-and-copy), applied to long form:

- **English**, written for a Gen Z student or junior dev hunting a first tech job. There is no pt-BR version of the resources yet (the code has no translation mechanism for them). Brazilian terms (estágio, CLT, PJ, monitoria) stay in Portuguese and are explained once.
- **Plain and direct.** Second person, short sentences, the advice first. "Put education first while you're still in school." Not "It is generally recommended that…".
- **A little sassy about competitors and bad advice, never about the reader.** "Plenty of blogs garble it." Fine. Mocking someone for a 30-item skills list is not.
- **No exclamation marks. No filler lines** ("Let's dive in", "In today's competitive market", "Great question"). Every paragraph either teaches, proves or tells the reader what to do.
- **Specific beats adjective.** "From 900 ms to 180 ms", "2nd of 48 teams". Examples use believable, specific details (a PUC-SP course project, a São Paulo fintech estágio).
- **Sentence case** for titles, section titles, `h3`, labels.
- **Brazil and the US** wherever the answer differs (photos, documents, contracts, file formats, Gupy vs Greenhouse). Say which country each rule is for.
- **No one-word lines.** `globals.css` balances headings and sets `pretty` on text; don't fight it. When a title wraps, the **shorter phrase goes on top**. If balance leaves the top line longer, glue the words that must stay together with a non-breaking space so the break falls at the phrase boundary. In a title string, ` `, as `first-offer` does:

  ```ts
  title: "Your first offer: read it, then negotiate it",
  ```

  In JSX text, write `{" "}` between the words. Check the result at both 1440 and 375.
- **Rayume only as it is.** Check the current state in [`PROJECT.md`](../PROJECT.md#current-state) before writing a sentence about Rayume. Today the AI, tailoring, PDF export and the extension are **not built**; the signed-in app is a localStorage demo. Describe what is shipped (the template gallery, the LaTeX templates and what we measured on them) as fact, and anything else as design or intent ("We designed tailoring so that…"), never as a feature the reader can use today. One mention of Rayume per piece, where it's relevant; every page already ends with the call to try it.

## Scope guardrails

Rayume is candidate-only (see [`PROJECT.md`](../PROJECT.md#out-of-scope-do-not-build)). A piece can *explain* how applicant tracking systems or job sites work; it never presents Rayume as doing what's out of scope:

- no job board or job listings, no "jobs we found for you";
- no ATS scoring or "your resume scores 87%", ours or anyone's offered as a product;
- no auto-apply, no scrapers or job alerts;
- no pricing, plans or "free for now";
- no recruiter-side tools.

If a topic heads there, flag it to the team instead of writing it.

## Before you open a PR

From `frontend/`:

- [ ] `npx tsc --noEmit` passes.
- [ ] `npm run lint` has no errors (CI fails only on errors), and `npm run build` succeeds (CI runs both; the build also catches a missing guide slug).
- [ ] Viewed at **1440 px and 375 px** in `npm run dev`: the title, every section title and the index card have no one-word lines; tables don't push the page sideways.
- [ ] The contents (sidebar and the phone's "On this page") read as a list of the argument, in order.
- [ ] Every `Checklist` `id` is unique site-wide; ticking, Start over and a reload all work.
- [ ] Every in-site `Link` lands on a real page; every source URL opens and says what it's cited for; every `Cite n` points at the right source.
- [ ] With reduced motion on (macOS: Accessibility, Display, Reduce motion), `Example`s, covers and checklists show their finished state.
- [ ] The piece shows where it should: the guide in its place in the `/resources` list and in the next/previous chain; the post first on `/resources/blog` with its cover.
- [ ] `description` is 110 to 160 characters; `minutes` matches the word count; `updated` is today.
- [ ] No claim about an unbuilt Rayume feature; nothing out of scope.
- [ ] A guide added or removed: `docs/PROJECT.md` updated in the same PR.

Then follow the repo's workflow ([`CLAUDE.md`](../../CLAUDE.md), [`PROJECT.md`](../PROJECT.md#how-we-work)): a branch, never a push to `main`; a pull request with one approval; commits in English in the existing style, `feat(resources): add the salary research guide` or `docs(resources): …` for this file. If the code and this doc disagree, fix the doc in the same PR.
