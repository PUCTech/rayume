import type { ReactNode } from "react";
import { GeistSerifRegular } from "geist/font/serif/regular";

const serif = GeistSerifRegular.className;
const c = { paper: "var(--color-paper)", mist: "var(--color-mist)", ink: "var(--color-ink)", accent: "var(--color-accent)", deep: "var(--color-accent-deep)" };

// a small seeded random source, so a post's drawing is the same on every render (server and browser alike)
function random(seed: string) {
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

// The pen: everything is drawn as if by hand, in the manner of rough.js (not a dependency: these few lines are
// all it takes). A stroke wanders off the straight line through a jittered midpoint, misses its ends a little
// and goes over itself a second time, slightly off; fills are diagonal hatching inside the shape.
type R = () => number;
const j = (r: R, n: number) => (r() - 0.5) * 2 * n;

function stroke(r: R, x1: number, y1: number, x2: number, y2: number, wobble = 1.4) {
  const once = () => `M ${x1 + j(r, 1)} ${y1 + j(r, 1)} Q ${(x1 + x2) / 2 + j(r, wobble)} ${(y1 + y2) / 2 + j(r, wobble)} ${x2 + j(r, 1.5)} ${y2 + j(r, 1.5)}`;
  return `${once()} ${once()}`;
}

function Line({ r, x1, y1, x2, y2, color = c.ink, width = 1.5, opacity = 0.9, wobble }: { r: R; x1: number; y1: number; x2: number; y2: number; color?: string; width?: number; opacity?: number; wobble?: number }) {
  return <path d={stroke(r, x1, y1, x2, y2, wobble)} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" opacity={opacity} />;
}

// a box drawn as four strokes; hatched inside when given a colour
function Box({ r, x, y, w, h, color = c.ink, hatch, gap = 5, width = 1.5 }: { r: R; x: number; y: number; w: number; h: number; color?: string; hatch?: string; gap?: number; width?: number }) {
  const lines: ReactNode[] = [];
  if (hatch)
    // 45° lines across the box, each cut to its edges by hand
    for (let k = gap; k < w + h; k += gap) {
      const a = { x: x + Math.min(k, w), y: y + Math.max(0, k - w) };
      const b = { x: x + Math.max(0, k - h), y: y + Math.min(k, h) };
      lines.push(<Line key={k} r={r} x1={a.x} y1={a.y} x2={b.x} y2={b.y} color={hatch} width={1.1} opacity={0.75} wobble={0.6} />);
    }
  const d = [stroke(r, x, y, x + w, y), stroke(r, x + w, y, x + w, y + h), stroke(r, x + w, y + h, x, y + h), stroke(r, x, y + h, x, y)].join(" ");
  return (
    <>
      {lines}
      <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />
    </>
  );
}

// a circle that doesn't quite close: a ring of jittered points, gone round about one and a quarter times
function Ring({ r, cx, cy, rad, color, width = 2.5 }: { r: R; cx: number; cy: number; rad: number; color: string; width?: number }) {
  const start = r() * Math.PI * 2;
  const pts = Array.from({ length: 22 }, (_, i) => {
    const t = start + (i / 17) * Math.PI * 2;
    const k = rad + j(r, rad * 0.04);
    return [cx + Math.cos(t) * k, cy + Math.sin(t) * k];
  });
  // smoothed: each point is a control, the curve passing through the midpoints between them
  const mid = (a: number[], b: number[]) => `${(a[0] + b[0]) / 2} ${(a[1] + b[1]) / 2}`;
  const d = `M ${mid(pts[0], pts[1])} ${pts.slice(1, -1).map((p, i) => `Q ${p[0]} ${p[1]} ${mid(p, pts[i + 2])}`).join(" ")}`;
  return <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />;
}

// body text as a scribble: n wavy lines from (x, y), each a share of width w, the last one shorter
function Scribble({ r, x, y, w, n, gap = 7, color = c.ink, opacity = 0.45 }: { r: R; x: number; y: number; w: number; n: number; gap?: number; color?: string; opacity?: number }) {
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const len = w * (i === n - 1 && n > 1 ? 0.35 + r() * 0.3 : 0.75 + r() * 0.25);
        const steps = Math.max(3, Math.round(len / 9));
        const d = Array.from({ length: steps + 1 }, (_, s) => `${s ? "L" : "M"} ${x + (len * s) / steps} ${y + i * gap + j(r, 0.9)}`).join(" ");
        return <path key={i} d={d} fill="none" stroke={color} strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round" opacity={opacity} />;
      })}
    </>
  );
}

// a sheet of paper: white, outlined by hand, with a pencil-shaded edge on the right and bottom
function Sheet({ r, x, y, w, h, tilt = 0, children }: { r: R; x: number; y: number; w: number; h: number; tilt?: number; children: ReactNode }) {
  return (
    <g transform={`rotate(${tilt} ${x + w / 2} ${y + h / 2})`}>
      <path d={`M ${x + 6} ${y + h} L ${x + w} ${y + h} L ${x + w} ${y + 6} L ${x + w + 4} ${y + 10} L ${x + w + 4} ${y + h + 4} L ${x + 10} ${y + h + 4} Z`} fill={c.ink} opacity={0.12} />
      <rect x={x} y={y} width={w} height={h} fill="white" />
      <Box r={r} x={x} y={y} w={w} h={h} width={1.6} />
      {children}
    </g>
  );
}

// a typeset page, and a lens over one "fi": the letters a parser reads, not a ligature glyph
function Latex({ r }: { r: R }) {
  return (
    <>
      <Sheet r={r} x={46} y={28} w={136} h={172} tilt={-4}>
        <Line r={r} x1={86} y1={44} x2={142} y2={44} width={3.5} />
        <Scribble r={r} x={72} y={53} w={86} n={1} opacity={0.35} />
        {[66, 108, 150].map((y, s) => (
          <g key={y}>
            <Line r={r} x1={58} y1={y} x2={90} y2={y} width={2.4} />
            <Line r={r} x1={58} y1={y + 5} x2={170} y2={y + 5} width={0.9} opacity={0.5} />
            <Scribble r={r} x={58} y={y + 12} w={110} n={s === 2 ? 3 : 4} gap={6.5} />
          </g>
        ))}
      </Sheet>
      <Line r={r} x1={204} y1={130} x2={176} y2={160} width={7} wobble={0.8} />
      <circle cx={232} cy={98} r={44} fill={c.paper} />
      <Ring r={r} cx={232} cy={98} rad={44} color={c.accent} width={3.5} />
      <text x={232} y={116} textAnchor="middle" className={serif} fontSize={52} fill={c.ink}>
        f<tspan fill={c.accent}>i</tspan>
      </text>
      {/* "look here" ticks */}
      <Line r={r} x1={276} y1={44} x2={284} y2={34} color={c.accent} width={2} />
      <Line r={r} x1={284} y1={58} x2={296} y2={54} color={c.accent} width={2} />
    </>
  );
}

// the same resume twice: on the right two lines moved up, their key words hatched in ultramarine; the rest,
// the facts, stay exactly where they were
function Tailoring({ r }: { r: R }) {
  const rows = Array.from({ length: 9 }, () => 0.55 + r() * 0.4);
  const moved = [6, 2];
  const right = [...moved, ...rows.map((_, i) => i).filter((i) => !moved.includes(i))];
  const y = (i: number) => 56 + i * 15;
  return (
    <>
      {[34, 186].map((x, side) => (
        <Sheet key={x} r={r} x={x} y={30} w={100} h={172} tilt={side ? 3 : -3}>
          <Line r={r} x1={x + 12} y1={42} x2={x + 54} y2={42} width={3} />
          {(side ? right : rows.map((_, i) => i)).map((row, i) => (
            <g key={row}>
              <Scribble r={r} x={x + 12} y={y(i)} w={76 * rows[row]} n={1} />
              {side === 1 && moved.includes(row) && <Box r={r} x={x + 9} y={y(i) - 4} w={76 * rows[row] * 0.5} h={8} color={c.accent} hatch={c.accent} gap={3.5} width={1.4} />}
            </g>
          ))}
        </Sheet>
      ))}
      {moved.map((row, k) => {
        const x1 = 50 + 76 * rows[row];
        const y1 = y(row) + 2;
        const x2 = 192;
        const y2 = y(k);
        return (
          <g key={row}>
            <path d={`M ${x1} ${y1} C ${150 + j(r, 6)} ${y1 + j(r, 8)}, ${150 + j(r, 6)} ${y2 + j(r, 8)}, ${x2} ${y2}`} fill="none" stroke={c.accent} strokeWidth={2} strokeLinecap="round" />
            {/* the arrowhead, two quick strokes */}
            <Line r={r} x1={x2} y1={y2} x2={x2 - 7} y2={y2 - 5} color={c.accent} width={2} wobble={0.5} />
            <Line r={r} x1={x2} y1={y2} x2={x2 - 7} y2={y2 + 5} color={c.accent} width={2} wobble={0.5} />
          </g>
        );
      })}
    </>
  );
}

// a first resume filling up: project blocks hatched in ultramarine, coursework in ink, one more being drawn
function First({ r }: { r: R }) {
  const sections = [
    { y: 50, items: 2, accent: true },
    { y: 104, items: 2, accent: false },
    { y: 150, items: 1, accent: false },
  ];
  return (
    <>
      <Sheet r={r} x={88} y={22} w={144} h={182}>
        <Line r={r} x1={102} y1={36} x2={160} y2={36} width={3.5} />
        {sections.map((s) => (
          <g key={s.y}>
            <Line r={r} x1={102} y1={s.y} x2={132} y2={s.y} width={2.2} />
            {Array.from({ length: s.items }, (_, i) => (
              <g key={i}>
                <Box r={r} x={102} y={s.y + 7 + i * 20} w={116} h={15} color={s.accent ? c.accent : c.ink} hatch={s.accent ? c.accent : undefined} gap={6} width={1.3} />
                {!s.accent && <Scribble r={r} x={108} y={s.y + 15 + i * 20} w={90} n={1} opacity={0.4} />}
              </g>
            ))}
          </g>
        ))}
        {/* the one being added: dashed, half hatched */}
        <path d={stroke(r, 102, 180, 218, 180)} fill="none" stroke={c.accent} strokeWidth={1.4} strokeDasharray="4 4" strokeLinecap="round" />
        <path d={stroke(r, 102, 195, 218, 195)} fill="none" stroke={c.accent} strokeWidth={1.4} strokeDasharray="4 4" strokeLinecap="round" />
        {[108, 116, 124, 132].map((x) => (
          <Line key={x} r={r} x1={x} y1={194} x2={x + 10} y2={181} color={c.accent} width={1.1} opacity={0.75} wobble={0.5} />
        ))}
      </Sheet>
      {/* the pencil, its tip on the line being drawn */}
      <g transform="rotate(-35 150 188)">
        <rect x={150} y={182} width={70} height={12} fill={c.paper} />
        <Box r={r} x={150} y={182} w={70} h={12} color={c.ink} hatch={c.deep} gap={3} width={1.5} />
        <Box r={r} x={220} y={182} w={10} h={12} color={c.ink} width={1.5} />
        <path d="M 150 182 L 136 188 L 150 194" fill={c.paper} stroke={c.ink} strokeWidth={1.5} strokeLinejoin="round" />
        <path d="M 140.5 186 L 136 188 L 140.5 190 Z" fill={c.ink} />
      </g>
    </>
  );
}

// a plain sheet, for a post with no drawing of its own yet
function Plain({ r }: { r: R }) {
  return (
    <Sheet r={r} x={100} y={26} w={120} h={170} tilt={-2}>
      <Line r={r} x1={114} y1={42} x2={164} y2={42} width={3.5} />
      <Scribble r={r} x={114} y={58} w={92} n={16} />
    </Sheet>
  );
}

const drawings: Record<string, (p: { r: R }) => ReactNode> = {
  "why-we-write-resumes-in-latex": Latex,
  "what-tailoring-should-change": Tailoring,
  "first-resume-no-experience": First,
};

// A post's cover: a drawing made in code, as if by hand, in the site's own colours; decorative (the title says
// it all). It sits on mist, or on paper when it's inside a mist card
export function Cover({ slug, onMist = false, className = "" }: { slug: string; onMist?: boolean; className?: string }) {
  const Drawing = drawings[slug] ?? Plain;
  return (
    <svg aria-hidden viewBox="0 0 320 220" className={`block aspect-[32/22] w-full rounded-[22px] ${onMist ? "bg-paper" : "bg-mist"} ${className}`}>
      <Drawing r={random(slug)} />
    </svg>
  );
}
