import type { Span } from "../templates/pdf";
import type { Entry } from "../app/data";

export type Box = { x: number; y: number; w: number; h: number };
// a bullet keeps its runs of text (lines), which say where its text starts, its font and its line spacing
export type Bullet = Box & { id: string; lines: Span[] };
export type Region = Box & { id: string; bullets: Bullet[] };

const sections = new Set(["experience", "projects", "education", "certifications", "technical skills"]);

// NFKC turns the PDF's ligatures (ﬁ) back into letters; LaTeX sets curly quotes where the data has straight ones
export const plain = (t: string) =>
  t.normalize("NFKC").toLowerCase().replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, " ").trim();

const union = (spans: Span[]): Box => {
  const x = Math.min(...spans.map((s) => s.x));
  const y = Math.min(...spans.map((s) => s.y));
  return { x, y, w: Math.max(...spans.map((s) => s.x + s.w)) - x, h: Math.max(...spans.map((s) => s.y + s.h)) - y };
};

// Where each entry sits on a page, found from its text: an entry starts at its header (the organization
// for a job, the title otherwise) and runs until the next entry or section heading. Its bullets start at
// the runs that begin with "•" and take the wrapped lines after them. Spans come in reading order, as
// pdf.js lays them out. Entries or bullets the page doesn't show are left out.
export function regions(spans: Span[], entries: Entry[]): Region[] {
  const runs = spans.map((s) => ({ ...s, p: plain(s.text) }));
  const starts = entries
    .flatMap((e) => {
      const head = plain(e.type === "professional" ? e.organization : e.title);
      const i = head ? runs.findIndex((r) => r.p.startsWith(head)) : -1;
      return i < 0 ? [] : [{ e, i }];
    })
    .sort((a, b) => a.i - b.i);
  const stops = runs.flatMap((r, i) => (sections.has(r.p) ? [i] : []));

  return starts.map(({ e, i }, k) => {
    const end = Math.min(starts[k + 1]?.i ?? runs.length, stops.find((j) => j > i) ?? runs.length);
    const own = runs.slice(i, end);
    // "• Text" opens a bullet, and so does a lone "•" that starts a line (before a bold label, say);
    // a lone "•" mid-line is a separator in a header
    const marks = own.flatMap((r, j) =>
      /^•\s*\S/.test(r.text) || (r.text.trim() === "•" && (j === 0 || own[j - 1].y + own[j - 1].h / 2 < r.y)) ? [j] : [],
    );
    const bullets = marks.flatMap((j, m) => {
      const lines = own.slice(j, marks[m + 1] ?? own.length);
      const said = plain(lines.map((l) => l.text).join(" ").replace(/^•\s*/, ""));
      // either side can carry extra words: the PDF a label like "Relevant Activities:", the data a longer ending
      const bullet = e.bullets.find((b) => plain(b.text).includes(said.slice(0, 30)) || said.includes(plain(b.text).slice(0, 30)));
      return bullet ? [{ id: bullet.id, ...union(lines), lines }] : [];
    });
    return { id: e.id, ...union(own), bullets };
  });
}
