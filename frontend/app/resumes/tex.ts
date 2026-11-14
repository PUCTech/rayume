import { plain } from "./regions";

// Every change written on the page, applied to the pristine LaTeX each time it's typeset:
// bullets by id ("" deletes one), added bullets after the bullet they follow, any other run of text
// (a title, a date, a skill line) by "occurrence:original text", the nth run with that text on the page,
// and projects added from the chat, at the top of Projects. A project's bullets are "<project id>-<n>".
export type Added = { id: string; after: string; text: string };
export type Project = { id: string; title: string; bullets: string[] };
// projects is optional: documents kept in a browser before it existed don't have it
// links are the URLs behind the header's underlined texts, by the text the body first had; setup is the
// document's font, type size and margins, where they differ from the template's
export type Setup = { font?: string; size?: string; margin?: string };
export type Doc = { bullets: Record<string, string>; runs: Record<string, string>; added: Added[]; projects?: Project[]; links?: Record<string, string>; setup?: Setup };
export const blank: Doc = { bullets: {}, runs: {}, added: [], projects: [] };
export const projectBullets = (d: Doc) => (d.projects ?? []).flatMap((p) => p.bullets.map((text, i) => ({ id: `${p.id}-${i}`, text })));

export const fromTex = (s: string) =>
  s
    .replace(/\\[a-zA-Z]+\{([^}]*)\}/g, "$1")
    .replace(/\\,/g, " ")
    .replace(/\\([%$&#_{}])/g, "$1")
    .replace(/---/g, "—")
    .replace(/--/g, "–")
    .trim();

// every character LaTeX treats as markup is escaped, so typed text can't run commands; and typographic
// punctuation is spelled the LaTeX way, since the resume's fonts have no glyph for a typed "–" or "’"
const escapes: Record<string, string> = {
  "\\": "\\textbackslash{}",
  "~": "\\textasciitilde{}",
  "^": "\\textasciicircum{}",
  "–": "--",
  "—": "---",
  "‘": "`",
  "’": "'",
  "“": "``",
  "”": "''",
  "…": "\\ldots{}",
  "→": "$\\rightarrow$",
  "≈": "$\\approx$",
  "≥": "$\\geq$",
  "≤": "$\\leq$",
  "×": "\\texttimes{}",
  "±": "\\textpm{}",
  "°": "\\textdegree{}",
};
// the symbols the toolbar offers, each spelled in LaTeX above
export const symbols = ["–", "—", "→", "×", "≈", "≥", "≤", "±", "°"];
const escaped = (s: string) => s.replace(/[\\{}$&#_%~^–—‘’“”…→≈≥≤×±°]/g, (c) => escapes[c] ?? `\\${c}`);
const spaced = (s: string) => s.replace(/\s+/g, " ").trim();
export const esc = (s: string) => spaced(escaped(s));

// A bullet's text carries bold, italic and underline as <b>, <i> and <u>, its own "&" and "<" spelled &amp;
// and &lt; (inplace.tsx's marked writes it from the page; mark spells plain text that way). strip is the
// bare text, safe the HTML to show it with: nothing but those three tags gets through.
export const mark = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
export const strip = (s: string) => s.replace(/<\/?[biu]>/g, "").replace(/&(amp|lt);/g, (_, e) => (e === "amp" ? "&" : "<"));
export const safe = (s: string) => s.replace(/<(?!\/?[biu]>)/g, "&lt;");
const marks: Record<string, string> = { "<b>": "\\textbf{", "<i>": "\\textit{", "<u>": "\\underline{", "</b>": "}", "</i>": "}", "</u>": "}" };
// tags that don't pair up (a document tampered with in storage) would unbalance the braces: they're dropped
export const toTex = (s: string) => {
  const parts = s.split(/(<\/?[biu]>)/);
  const tags = parts.filter((_, i) => i % 2);
  const paired = tags.filter((t) => t[1] !== "/").length * 2 === tags.length;
  return spaced(parts.map((p, i) => (i % 2 ? (paired ? marks[p] : "") : escaped(strip(p)))).join(""));
};

// A run's text as it can be written in LaTeX: dashes as -- or ---, spaces as thin spaces or ties, symbols
// escaped. It must fill a whole argument or phrase, so "São Paulo, Brazil" doesn't match inside
// "São Paulo, Brazil (Hybrid)".
const spelled: Record<string, string> = { "–": "(?:--|–)", "—": "(?:---|—)", "’": "['’]", "‘": "[`‘]", "%": "\\\\%", $: "\\\\\\$", "&": "\\\\&", "#": "\\\\#", _: "\\\\_" };
const pattern = (t: string) =>
  new RegExp(
    `(?<=^|[{\\s])${[...t.normalize("NFKC").trim()]
      .map((c) => spelled[c] ?? (/\s/.test(c) ? "(?:\\\\,|~|\\s)+" : c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")))
      .join("")}(?=\\s*(?:[}\\\\$]|$))`,
    "gi",
  );

// The body with the document's changes. bullets is every bullet the page started with, to tell which
// "\item" line is which; a bold label opening an item (\textbf{Relevant Activities:}) stays when it's rewritten.
// A URL as \href takes it inside a macro's argument: web, mail and phone links only, nothing LaTeX reads
// as markup left bare. "" for anything else.
export const href = (u: string) => {
  try {
    const url = new URL(/^[a-z][a-z0-9+.-]*:/i.test(u.trim()) ? u.trim() : `https://${u.trim()}`);
    if (!/^(https?|mailto|tel):$/.test(url.protocol)) return "";
    return url.href.replace(/[\\{}^$~\s]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`).replace(/[%#&_]/g, "\\$&");
  } catch {
    return "";
  }
};

// The template with the document's setup: its type size in the class options, its font and margins set
// last in the preamble, over the template's own.
export const fonts: Record<string, { label: string; tex: string }> = {
  times: { label: "Times", tex: "\\usepackage{mathptmx}\\renewcommand{\\familydefault}{\\rmdefault}" },
  palatino: { label: "Palatino", tex: "\\usepackage{mathpazo}\\renewcommand{\\familydefault}{\\rmdefault}" },
  charter: { label: "Charter", tex: "\\usepackage{charter}\\renewcommand{\\familydefault}{\\rmdefault}" },
  modern: { label: "Latin Modern", tex: "\\usepackage{lmodern}\\renewcommand{\\familydefault}{\\rmdefault}" },
  helvetica: { label: "Helvetica", tex: "\\usepackage[scaled=0.92]{helvet}\\renewcommand{\\familydefault}{\\sfdefault}" },
};
export const sizes = ["10", "11", "12"];
export const margins: Record<string, string> = { narrow: "0.3in", wide: "0.7in" };
export function styled(template: string, setup: Setup = {}) {
  const extra = [fonts[setup.font ?? ""]?.tex, margins[setup.margin ?? ""] && `\\geometry{margin=${margins[setup.margin!]}}`].filter(Boolean);
  const sized = sizes.includes(setup.size ?? "") ? template.replace(/(\\documentclass\[)\d+pt/, `$1${setup.size}pt`) : template;
  return extra.length ? sized.replace("\\begin{document}", () => `${extra.join("\n")}\n\\begin{document}`) : sized;
}

// the body's lines with the projects added from the chat, at the top of Projects
const sourceOf = (body: string, doc: Doc) => {
  const projects = (doc.projects ?? []).flatMap((p) => [
    `\\textbf{${esc(p.title)}}`,
    "\\begin{itemize}",
    ...p.bullets.map((b) => `\\item ${esc(b)}`),
    "\\end{itemize}",
    "\\vspace{3pt}",
  ]);
  return body.split("\n").flatMap((line) => (line === "\\ressection{Projects}" ? [line, ...projects] : [line]));
};
// which bullet an "\item" line is, by what it says
const idOf = (line: string, bullets: { id: string; text: string }[]) => {
  const said = plain(fromTex(line.slice(6)));
  return bullets.find((b) => said.includes(plain(b.text).slice(0, 30)))?.id;
};

export function withDoc(body: string, doc: Doc, bullets: { id: string; text: string }[]) {
  const counts = new Map<string, number>();
  bullets = [...bullets, ...projectBullets(doc)];
  const lines = sourceOf(body, doc).map((line) => {
    if (line.startsWith("\\item ")) {
      const id = idOf(line, bullets);
      const to = id === undefined ? undefined : doc.bullets[id];
      const label = line.slice(6).match(/^\\textbf\{[^}]*\}\s*/)?.[0] ?? "";
      return { id, line: to === undefined ? line : to ? `\\item ${label}${toTex(to)}` : null };
    }
    // an underlined text with a URL kept for it becomes a link, whatever the text is changed to after
    let out = line.replace(/\\underline\{([^}]*)\}/g, (m, text) => {
      const url = href(doc.links?.[fromTex(text)] ?? "");
      return url ? `\\href{${url}}{${m}}` : m;
    });
    // the nth run with a text is the nth match outside the bullets, in page order
    for (const [key, to] of Object.entries(doc.runs)) {
      const [, n, text] = key.match(/^(\d+):([\s\S]*)$/)!;
      out = out.replace(pattern(text), (m) => {
        const seen = counts.get(key) ?? 0;
        counts.set(key, seen + 1);
        return seen === Number(n) ? esc(to) : m;
      });
    }
    return { id: undefined as string | undefined, line: out as string | null };
  });
  for (const a of doc.added) {
    const at = lines.findIndex((l) => l.id === a.after);
    if (at >= 0) lines.splice(at + 1, 0, { id: a.id, line: a.text ? `\\item ${toTex(a.text)}` : null });
  }
  return lines.flatMap((l) => (l.line === null ? [] : [l.line])).join("\n");
}

// The template with its body written in, so Code shows the whole resume and compiles on its own.
export const inline = (template: string, body: string) => template.replace("\\input{body}", () => body);

// The body as a form sees it (content.tsx): its sections, each a list of groups, a group being a line of
// texts (a job's company, place, title and dates; a skill line's label and values) and the bullets under
// it. Everything before the first section is one group, the header. A text's key is the run key the page
// gives it ("occurrence:text", counted the way withDoc finds it), so the form and the page write the same
// changes; link marks a text the body underlines, which can carry a URL.
export type Field = { key: string; was: string; hint?: string; link?: boolean };
export type Group = { fields: Field[]; items: string[] };
export type Section = { title: string; groups: Group[] };
const hints: Record<string, string[]> = { "\\role": ["Company", "Location", "Title", "Dates"], "\\resheader": ["Name"] };
export function outline(body: string, doc: Doc, bullets: { id: string; text: string }[]): Section[] {
  bullets = [...bullets, ...projectBullets(doc)];
  const sections: Section[] = [{ title: "Contact", groups: [{ fields: [], items: [] }] }];
  const source = sourceOf(body, doc);
  const texts = source.map((line) => (line.startsWith("\\item ") ? "" : line));
  texts.forEach((line, at) => {
    const section = sections.at(-1)!;
    if (!line) {
      const id = idOf(source[at], bullets);
      if (id) section.groups.at(-1)?.items.push(id);
      return;
    }
    if (/^(%|\\begin|\\end|\\vspace)/.test(line)) return;
    if (sections.length > 1) section.groups.push({ fields: [], items: [] });
    let queue: string[] = [];
    let last = 0;
    let before = "";
    const chunk = (end: number) => {
      const raw = line.slice(last, end);
      const was = fromTex(raw);
      if (!was) return;
      if (before === "\\ressection") return void sections.push({ title: was, groups: [] });
      const start = last + raw.search(/\S/);
      const seen = texts.slice(0, at).reduce((n, l) => n + [...l.matchAll(pattern(was))].length, 0) + [...line.matchAll(pattern(was))].filter((m) => m.index < start).length;
      sections.at(-1)!.groups.at(-1)?.fields.push({ key: `${seen}:${was}`, was, hint: queue.shift(), link: before === "\\underline" });
    };
    for (const m of line.matchAll(/\$[^$]*\$|\\\\(?:\[[^\]]*\])?|\\[a-zA-Z]+|[{}]/g)) {
      chunk(m.index);
      last = m.index + m[0].length;
      if (m[0] in hints) queue = [...hints[m[0]]];
      if (/^\\[a-zA-Z]/.test(m[0])) before = m[0];
      else if (m[0] === "}") before = "";
    }
    chunk(line.length);
  });
  return sections.map((s) => ({ ...s, groups: s.groups.filter((g) => g.fields.length || g.items.length) })).filter((s) => s.groups.length);
}
