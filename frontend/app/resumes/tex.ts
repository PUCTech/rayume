import { plain } from "./regions";

// Every change written on the page, applied to the pristine LaTeX each time it's typeset:
// bullets by id ("" deletes one), added bullets after the bullet they follow, any other run of text
// (a title, a date, a skill line) by "occurrence:original text", the nth run with that text on the page,
// and projects added from the chat, at the top of Projects. A project's bullets are "<project id>-<n>".
export type Added = { id: string; after: string; text: string };
export type Project = { id: string; title: string; bullets: string[] };
// projects is optional: documents kept in a browser before it existed don't have it
export type Doc = { bullets: Record<string, string>; runs: Record<string, string>; added: Added[]; projects?: Project[] };
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
};
export const toTex = (s: string) => s.replace(/[\\{}$&#_%~^–—‘’“”…]/g, (c) => escapes[c] ?? `\\${c}`).replace(/\s+/g, " ").trim();

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
export function withDoc(body: string, doc: Doc, bullets: { id: string; text: string }[]) {
  const counts = new Map<string, number>();
  const projects = (doc.projects ?? []).flatMap((p) => [
    `\\textbf{${toTex(p.title)}}`,
    "\\begin{itemize}",
    ...p.bullets.map((b) => `\\item ${toTex(b)}`),
    "\\end{itemize}",
    "\\vspace{3pt}",
  ]);
  const source = body.split("\n").flatMap((line) => (line === "\\ressection{Projects}" ? [line, ...projects] : [line]));
  bullets = [...bullets, ...projectBullets(doc)];
  const lines = source.map((line) => {
    if (line.startsWith("\\item ")) {
      const said = plain(fromTex(line.slice(6)));
      const id = bullets.find((b) => said.includes(plain(b.text).slice(0, 30)))?.id;
      const to = id === undefined ? undefined : doc.bullets[id];
      const label = line.slice(6).match(/^\\textbf\{[^}]*\}\s*/)?.[0] ?? "";
      return { id, line: to === undefined ? line : to ? `\\item ${label}${toTex(to)}` : null };
    }
    // the nth run with a text is the nth match outside the bullets, in page order
    let out = line;
    for (const [key, to] of Object.entries(doc.runs)) {
      const [, n, text] = key.match(/^(\d+):([\s\S]*)$/)!;
      out = out.replace(pattern(text), (m) => {
        const seen = counts.get(key) ?? 0;
        counts.set(key, seen + 1);
        return seen === Number(n) ? toTex(to) : m;
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
