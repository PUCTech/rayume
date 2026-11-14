"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { Page, Span } from "../templates/pdf";
import type { Entry } from "../app/data";
import { plain, regions, type Box, type Bullet } from "./regions";
import { Run, Written, type Dir, type Geometry } from "./inplace";
import { strip, type Added } from "./tex";

// entries get more room than their bullets, so a bullet's box sits inside its entry's
const grow = (b: Box, pad: number): Box => ({ x: b.x - pad, y: b.y - pad / 2, w: b.w + pad * 2, h: b.h + pad });
const inside = (b: Box, x: number, y: number) => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h;
const at = (b: Box) => ({ left: b.x, top: b.y, width: b.w, height: b.h });
const ease = "transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none";
const small = "rounded-full px-3 py-1.5 text-[13px] font-medium transition pointer-coarse:py-2.5";

export const label = (e: Entry) => (e.type === "professional" ? e.organization : e.title);

// what's being written: a bullet on the page, any other run of text, or a bullet the PDF doesn't have yet
export type Target = { kind: "bullet"; id: string } | { kind: "run"; key: string } | { kind: "new"; id: string; after: string };
const same = (a: Target | null, b: Target) => !!a && a.kind === b.kind && (a.kind === "run" ? a.key === (b as typeof a).key : a.id === (b as { id: string }).id);

// a bullet written on the page: what it is, where it goes, the page's own text it replaces, and its place
// among bullets that follow the same one
type Item = { key: string; t: Target; g: Geometry; hide: HTMLElement[]; order: number };

// The page's own text is pdf.js's DOM, not React's: hidden where something is written over it, moved down or
// up with the bullets above it.
const paint = (spans: Span[], hidden: Set<HTMLElement>, moved: (y: number) => number) => {
  for (const s of spans) {
    s.el.style.visibility = hidden.has(s.el) ? "hidden" : "";
    const d = moved(s.y);
    s.el.style.translate = d ? `0 ${d}px` : "";
  }
};

// the tops of a bullet's lines, one per row
const rowsOf = (lines: Bullet["lines"]) => lines.reduce<number[]>((ys, l) => (ys.some((y) => Math.abs(y - l.y) < l.h / 2) ? ys : [...ys, l.y]), []);

// A strip of the page's graphics (its rules; the text is real text), copied at the canvas's resolution so a
// written bullet that gained or lost lines can slide the rules under it with the text.
function Band({ page, from, to, top }: { page: Page; from: number; to: number; top: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const src = page.el.querySelector("canvas");
    const c = ref.current;
    if (!src || !c || to <= from) return;
    const k = src.width / page.width;
    c.width = src.width;
    c.height = Math.ceil((to - from) * k);
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.drawImage(src, 0, from * k, src.width, (to - from) * k, 0, 0, c.width, c.height);
  }, [page, from, to]);
  return <canvas ref={ref} aria-hidden style={{ left: 0, top, width: page.width, height: Math.max(0, to - from) }} className="absolute" />;
}

// Over each PDF page: the page as you write on it, and the entry under the pointer.
// Clicking any text writes there, the caret where you clicked: a bullet (inplace.tsx's Written), or any other
// run, like a title or a date (Run). A press that travels is a drag, which selects text instead. The entry
// under the pointer shows a dotted box and an Ask Rayume button, which focuses it: the rest of the page dims,
// checkboxes in the margin pick its bullets, and a bar offers all of them, writing yourself or asking Rayume.
// What's written replaces the PDF's own text, which is hidden; a bullet that gains or loses lines moves the
// text under it and slides the rules in bands, and clicks are mapped back through the same offsets. It all
// stays until the re-typeset PDF arrives. onDrawn reports each newly measured page.
export function Overlay({
  page,
  entries,
  selected,
  picked,
  pending,
  editing,
  editAt,
  editStart,
  runKeys,
  text,
  busy,
  onSelect,
  onToggle,
  onAll,
  onAsk,
  onEdit,
  onCommit,
  onCancel,
  onSplit,
  onRemove,
  onLive,
  onDrawn,
}: {
  page: Page;
  entries: Entry[];
  selected: string | null;
  picked: string[];
  pending: { bullets: string[]; runs: string[]; added: Added[] };
  editing: Target | null;
  editAt?: { x: number; y: number };
  editStart?: number;
  runKeys: Record<string, string>;
  text: (t: Target) => string;
  busy: boolean;
  onSelect: (id: string | null) => void;
  onToggle: (bulletId: string) => void;
  onAll: () => void;
  onAsk: () => void;
  onEdit: (t: Target, at?: { x: number; y: number }, start?: number) => void;
  onCommit: (t: Target, text: string) => void;
  onCancel: () => void;
  onSplit: (before: string, after: string) => void;
  onRemove: () => void;
  onLive: (text: string, at: number) => void;
  onDrawn: (page: Page) => void;
}) {
  const found = useMemo(() => regions(page.spans, entries).map((r) => ({ ...r, ...grow(r, 8), bullets: r.bullets.map((b) => ({ ...b, ...grow(b, 3) })) })), [page, entries]);
  const [hover, setHover] = useState<string | null>(null);
  const [deltas, setDeltas] = useState<Record<string, number>>({});
  // where the pointer went down: a click is a press that didn't travel, anything longer was a drag
  const down = useRef<[number, number] | null>(null);
  const focus = found.find((r) => r.id === selected);
  const bullets = useMemo(() => found.flatMap((r) => r.bullets.map((b) => ({ ...b, right: r.x + r.w - 8 }))), [found]);

  // the page's hanging indent and line spacing, read off bullets that wrap
  const measure = useMemo(() => {
    const conts = bullets.flatMap((b) => b.lines.filter((l) => l.y > b.lines[0].y + b.lines[0].h / 2));
    const steps = bullets.flatMap((b) => {
      const ys = rowsOf(b.lines);
      return ys.length > 1 ? [ys[1] - ys[0]] : [];
    });
    // the bullets' own font is the one most of their text is set in: a bullet may open in bold
    const set = new Map<string, number>();
    for (const l of bullets.flatMap((b) => b.lines)) if (l.font) set.set(l.font, (set.get(l.font) ?? 0) + l.text.length);
    const font = [...set].sort((a, b) => b[1] - a[1])[0]?.[0];
    return { indent: conts.length ? Math.min(...conts.map((l) => l.x)) : undefined, lh: steps.length ? Math.min(...steps) : undefined, font };
  }, [bullets]);
  // the PDF's bold and italic faces, if anything on the page is set in them
  const faces = useMemo(() => ({ bold: page.spans.find((s) => s.bold && !s.italic)?.font, italic: page.spans.find((s) => s.italic && !s.bold)?.font }), [page]);

  // the runs that aren't bullets, each with its key: "n:text" for the nth run with that text as the PDF first
  // had it, skipping the ones already rewritten (they show their new text, matched back through runKeys)
  const runs = useMemo(() => {
    const ofBullets = new Set(bullets.flatMap((b) => b.lines.map((l) => l.el)));
    const counts = new Map<string, number>();
    const used = new Set<string>();
    const right = Math.max(...page.spans.map((s) => s.x + s.w));
    return page.spans
      .filter((s) => !ofBullets.has(s.el) && s.text.trim() !== "•")
      .map((s) => {
        const was = Object.entries(runKeys).find(([k, v]) => v === s.text && !used.has(k))?.[0];
        if (was) used.add(was);
        let n = counts.get(s.text) ?? 0;
        while (`${n}:${s.text}` in runKeys) n++;
        if (!was) counts.set(s.text, n + 1);
        const middle = Math.abs(s.x + s.w / 2 - page.width / 2) < 2;
        const caps = /\p{L}/u.test(s.text) && s.text === s.text.toUpperCase();
        return { s, key: was ?? `${n}:${s.text}`, align: right - (s.x + s.w) < 2 ? ("right" as const) : middle ? ("center" as const) : ("left" as const), caps };
      });
  }, [page, bullets, runKeys]);

  // where a "• Text" run's words start, measured on its text, from the page's left edge
  const wordsAt = (el: HTMLElement) => {
    const node = el.firstChild;
    const i = node?.textContent?.search(/[^•\s]/) ?? -1;
    if (!node || i < 0) return undefined;
    const r = document.createRange();
    r.setStart(node, i);
    r.setEnd(node, i + 1);
    return r.getBoundingClientRect().left - page.el.getBoundingClientRect().left;
  };

  const geometry = (b: (typeof bullets)[number]): { g: Geometry; hide: HTMLElement[] } => {
    const first = b.lines[0];
    // the text as the PDF shows it, to find where it starts after a label
    const words = plain(strip(entries.flatMap((e) => e.bullets).find((x) => x.id === b.id)?.text ?? ""));
    // "• Text" runs bullet and text together; a lone "•" may be followed by a bold label, then the text
    const lead = /^•\s*\S/.test(first.text) ? 0 : Math.max(0, b.lines.findIndex((l, i) => i > 0 && words.startsWith(plain(l.text).slice(0, 8))));
    const run = b.lines[lead];
    const size = run.size ?? first.h;
    const left = measure.indent ?? first.x + size;
    const lh = measure.lh ?? size * 1.2;
    return {
      g: { left, firstX: lead === 0 ? (wordsAt(first.el) ?? left) : run.x, right: b.right, top: first.y - (lh - first.h) / 2, lh, rows: rowsOf(b.lines).length, font: measure.font ?? run.font ?? "", size, glyph: lead === 0 ? first.x : undefined },
      hide: b.lines.slice(lead).map((l) => l.el),
    };
  };

  // the bullets written on the page, top to bottom, with how far the ones above push each: those being edited
  // or waiting for the PDF, and new ones, placed under the bullet they follow
  const written = useMemo(() => {
    const onPage: Item[] = bullets.flatMap((b) => {
      const t: Target = { kind: "bullet", id: b.id };
      return same(editing, t) || pending.bullets.includes(b.id) ? [{ key: b.id, t, ...geometry(b), order: 0 }] : [];
    });
    const fresh = [...pending.added, ...(editing?.kind === "new" && !pending.added.some((a) => a.id === editing.id) ? [{ id: editing.id, after: editing.after, text: "" }] : [])];
    const placed: Item[] = [];
    const anchorOf = (id: string) => [...onPage, ...placed].find((w) => w.key === id) ?? bullets.flatMap((b) => (b.id === id ? [geometry(b)] : []))[0];
    fresh.forEach((a, i) => {
      const anchor = anchorOf(a.after);
      if (!anchor) return;
      const g = { ...anchor.g, firstX: anchor.g.left, top: anchor.g.top + anchor.g.rows * anchor.g.lh, rows: 0, glyph: anchor.g.glyph ?? anchor.g.left - anchor.g.size };
      placed.push({ key: a.id, t: { kind: "new", id: a.id, after: a.after }, g, hide: [], order: i + 1 });
    });
    const list = [...onPage, ...placed].sort((a, b) => a.g.top - b.g.top || a.order - b.order);
    const gained = list.map((w) => deltas[w.key] ?? 0);
    return list.map((w, i) => {
      const offset = gained.slice(0, i).reduce((sum, d) => sum + d, 0);
      return { ...w, offset, moved: offset + gained[i], from: w.g.top + w.g.rows * w.g.lh };
    });
    // geometry reads bullets, text and the page's measures
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bullets, editing, pending, deltas, measure]);
  const movedAt = (y: number) => written.findLast((w) => y >= w.from - 0.5)?.moved ?? 0;

  const writtenRuns = runs.filter((r) => same(editing, { kind: "run", key: r.key }) || pending.runs.includes(r.key));

  useLayoutEffect(() => paint(page.spans, new Set([...written.flatMap((w) => w.hide), ...writtenRuns.map((r) => r.s.el)]), movedAt));
  useEffect(() => () => paint(page.spans, new Set(), () => 0), [page]);

  // An arrow key past a field's edge: the caret goes on into the text next to it, as in a document. ↑ and ↓
  // take the nearest line above or below, at the same place across; ← and → the text before or after in
  // reading order, at its end or start.
  const nav = (from: Target, dir: Dir, x: number) => {
    const stops = [
      ...bullets.flatMap((b) => b.lines.map((l) => ({ t: { kind: "bullet", id: b.id } as Target, x: l.x, y: l.y, w: l.w, h: l.h }))),
      ...runs.map((r) => ({ t: { kind: "run", key: r.key } as Target, x: r.s.x, y: r.s.y, w: r.s.w, h: r.s.h })),
    ];
    // a bullet the PDF doesn't have yet stands where it's written
    const own = stops.some((s) => same(from, s.t))
      ? stops.filter((s) => same(from, s.t))
      : written.flatMap((w) => (same(from, w.t) ? [{ t: w.t, x: w.g.left, y: w.g.top, w: 0, h: w.g.lh }] : []));
    if (!own.length) return;
    const others = stops.filter((s) => !same(from, s.t));
    if (dir === "left" || dir === "right") {
      // reading order: by line, runs of different fonts on one line sitting a little apart in height
      type Stop = (typeof stops)[number];
      const reading = (a: Stop, b: Stop) => (Math.abs(a.y + a.h / 2 - b.y - b.h / 2) < Math.min(a.h, b.h) / 2 ? a.x - b.x : a.y - b.y);
      const side = others.filter((s) => reading(s, own[0]) < 0 === (dir === "left")).sort(reading);
      const to = dir === "left" ? side.at(-1) : side[0];
      return to && onEdit(to.t, undefined, dir === "left" ? Infinity : 0);
    }
    const up = dir === "up";
    const edge = up ? Math.min(...own.map((s) => s.y)) : Math.max(...own.map((s) => s.y + s.h));
    const beyond = others.filter((s) => (up ? s.y + s.h / 2 < edge : s.y + s.h / 2 > edge));
    if (!beyond.length) return;
    const y = up ? Math.max(...beyond.map((s) => s.y)) : Math.min(...beyond.map((s) => s.y));
    const at = page.el.getBoundingClientRect();
    const px = x - at.left;
    const away = (s: (typeof stops)[number]) => Math.max(s.x - px, px - (s.x + s.w), 0);
    const to = beyond.filter((s) => Math.abs(s.y - y) < s.h / 2).sort((a, b) => away(a) - away(b))[0];
    // a point inside the line, so the caret lands in it even from further right than it runs
    onEdit(to.t, { x: at.left + Math.min(Math.max(px, to.x + 1), to.x + to.w - 1), y: at.top + to.y + movedAt(to.y) + to.h / 2 }, up ? Infinity : 0);
  };

  // a point as it would be on the PDF before anything slid, or the written bullet it falls on
  const unshift = (y: number): { y: number; on?: Target } => {
    for (let i = written.length - 1; i >= 0; i--) {
      const w = written[i];
      const top = w.g.top + w.offset;
      if (y >= top + w.g.rows * w.g.lh + (deltas[w.key] ?? 0)) return { y: y - w.moved };
      if (y >= top) return { y, on: w.t };
    }
    return { y };
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps -- once per measured page, not per new callback
  useEffect(() => onDrawn(page), [page]);

  useEffect(() => {
    const el = page.el;
    const point = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      return [e.clientX - r.left, e.clientY - r.top] as const;
    };
    const onDown = (e: PointerEvent) => (down.current = [e.clientX, e.clientY]);
    // on pointerup, not click: pdf.js moves its end-of-content element while you press, and a browser drops
    // the click when the pressed element moves
    const onUp = (e: PointerEvent) => {
      const [dx, dy] = down.current ?? [e.clientX, e.clientY];
      if (e.button !== 0 || (e.target as Element).closest("[data-overlay-ui]") || Math.hypot(e.clientX - dx, e.clientY - dy) > 4) return;
      const [x, raw] = point(e);
      const { y, on } = unshift(raw);
      const where = { x: e.clientX, y: e.clientY };
      if (on) return onEdit(on, where);
      // the checkboxes sit in the margin left of the focused entry
      const box = focus?.bullets.find((b) => x >= focus.x - 24 && x < focus.x && y >= b.y && y <= b.y + b.h);
      if (box) return onToggle(box.id);
      const bullet = bullets.find((b) => inside(b, x, y));
      if (bullet) return onEdit({ kind: "bullet", id: bullet.id }, where);
      const run = runs.find((r) => inside(grow(r.s, 2), x, y));
      if (run) return onEdit({ kind: "run", key: run.key }, where);
      if (focus && inside(focus, x, y)) return;
      onSelect(found.find((r) => inside(r, x, y))?.id ?? null);
    };
    const onMove = (e: PointerEvent) => {
      const [x, raw] = point(e);
      const { y } = unshift(raw);
      // the margin left of an entry counts as the entry, so its Ask Rayume button can be reached
      setHover(found.find((r) => inside({ ...r, x: r.x - 32, w: r.w + 32 }, x, y))?.id ?? null);
    };
    const onLeave = () => setHover(null);
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  });

  // the bar sits under the focused entry, or over it when there's no room below
  const bar = focus && (focus.y + focus.h + 52 < page.height ? focus.y + focus.h + 8 : Math.max(8, focus.y - 48));
  const all = focus && focus.bullets.length > 0 && focus.bullets.every((b) => picked.includes(b.id));
  const total = written.at(-1)?.moved ?? 0;
  const quiet = !!(selected || editing || written.length || writtenRuns.length);
  const run = (r: (typeof runs)[number]) => r.s as Span & { font: string; size: number };

  return (
    <>
      {/* under the text: the rules, slid in bands under written bullets that changed height */}
      <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden">
        {written.some((w) => w.moved) &&
          written.map((w, i) => <Band key={w.key} page={page} from={w.from} to={written[i + 1]?.from ?? page.height} top={w.from + w.moved} />)}
        {total < 0 && <div aria-hidden style={{ left: 0, top: page.height + total, width: page.width, height: -total }} className="absolute bg-white" />}
      </div>

      {/* over the text: what's written, the entry boxes, focus and its bar */}
      <div className="pointer-events-none absolute inset-0 z-[3] overflow-hidden">
        {written.map((w) => (
          <Written
            key={w.key}
            g={w.g}
            offset={w.offset}
            text={text(w.t)}
            editing={same(editing, w.t)}
            at={same(editing, w.t) ? editAt : undefined}
            start={same(editing, w.t) ? editStart : undefined}
            busy={busy}
            onCommit={(t) => onCommit(w.t, t)}
            onCancel={onCancel}
            onSplit={onSplit}
            onRemove={onRemove}
            onLive={onLive}
            onNav={(dir, x) => nav(w.t, dir, x)}
            faces={faces}
            onDelta={(d) => setDeltas((ds) => (ds[w.key] === d ? ds : { ...ds, [w.key]: d }))}
          />
        ))}
        {writtenRuns.map((r) => (
          <Run
            key={r.key}
            {...run(r)}
            align={r.align}
            caps={r.caps}
            pageWidth={page.width}
            offset={movedAt(r.s.y)}
            text={text({ kind: "run", key: r.key })}
            editing={same(editing, { kind: "run", key: r.key })}
            at={same(editing, { kind: "run", key: r.key }) ? editAt : undefined}
            busy={busy}
            start={same(editing, { kind: "run", key: r.key }) ? editStart : undefined}
            onCommit={(t) => onCommit({ kind: "run", key: r.key }, t)}
            onCancel={onCancel}
            onLive={onLive}
            onNav={(dir, x) => nav({ kind: "run", key: r.key }, dir, x)}
          />
        ))}

        {found.map((r) => {
          const entry = entries.find((e) => e.id === r.id)!;
          const on = r.id === selected;
          return (
            <div
              key={r.id}
              style={at(r)}
              className={`absolute rounded-lg ${ease} starting:opacity-0 ${
                on
                  ? "border-2 border-accent shadow-[0_0_0_200vmax_rgb(244_240_234/0.75)]"
                  : // only the entry under the pointer shows its box, as an editor's text frames do
                    `border border-dashed ${quiet ? "opacity-0" : hover === r.id ? "border-accent/60 bg-accent/[0.04]" : "border-transparent"}`
              }`}
            >
              {/* in the page's left margin, where it covers none of the entry's text */}
              <button
                type="button"
                data-overlay-ui
                onClick={() => onSelect(r.id)}
                aria-label={`Ask Rayume about ${label(entry)}`}
                title="Ask Rayume"
                className={`pointer-events-auto absolute top-0 -left-7 grid size-5 place-items-center rounded-full bg-accent-deep text-[11px] text-white shadow-sm transition duration-300 hover:scale-110 focus:opacity-100 motion-reduce:transition-none ${
                  !quiet && hover === r.id ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
              >
                <span aria-hidden>✦</span>
              </button>
            </div>
          );
        })}

        {focus?.bullets.map((b) => {
          const on = picked.includes(b.id);
          return (
            <div key={b.id}>
              <div style={at(b)} className={`absolute rounded-md border ${ease} starting:opacity-0 ${on ? "border-accent bg-accent/10" : "border-dashed border-accent/40"}`} />
              {/* in the margin left of the entry, clear of its border */}
              <span
                style={{ left: focus.x - 20, top: b.y + 3 }}
                className={`absolute grid size-3.5 place-items-center rounded-full border ${ease} starting:opacity-0 ${on ? "border-accent-deep bg-accent-deep text-white" : "border-ink/30 bg-white"}`}
              >
                {on && (
                  <svg aria-hidden viewBox="0 0 12 12" className="size-2.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m3 6.2 2 1.8 4-4" />
                  </svg>
                )}
              </span>
            </div>
          );
        })}

        {focus && (
          <div
            key={focus.id}
            data-overlay-ui
            role="toolbar"
            aria-label={`${label(entries.find((e) => e.id === focus.id)!)} actions`}
            style={{ left: Math.max(8, Math.min(focus.x, page.width - 372)), top: bar }}
            className={`pointer-events-auto absolute flex items-center gap-1 rounded-full bg-paper p-1 shadow-[0_10px_28px_-10px_rgb(22_27_34/0.45)] ring-1 ring-ink/10 ${ease} starting:translate-y-1 starting:opacity-0`}
          >
            {focus.bullets.length > 0 && (
              <button type="button" onClick={onAll} className={`${small} text-ink/70 hover:bg-ink/5 hover:text-ink`}>
                {all ? "Clear" : "All bullets"}
              </button>
            )}
            {focus.bullets.length > 0 && (
              <button
                type="button"
                onClick={() => onEdit({ kind: "bullet", id: focus.bullets.find((b) => picked.includes(b.id))?.id ?? focus.bullets[0].id })}
                className={`${small} text-ink/70 hover:bg-ink/5 hover:text-ink`}
              >
                Write it myself
              </button>
            )}
            <button type="button" onClick={onAsk} className={`${small} bg-accent-deep text-white hover:bg-[color-mix(in_oklab,var(--color-accent)_45%,var(--color-accent-deep))]`}>
              Ask Rayume{picked.length ? ` · ${picked.length}` : ""}
            </button>
            <button type="button" onClick={() => onSelect(null)} aria-label="Close" className="grid size-7 place-items-center rounded-full text-ink/50 transition hover:bg-ink/5 hover:text-ink pointer-coarse:size-9">
              <svg aria-hidden viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="m6 6 8 8M14 6l-8 8" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </>
  );
}
