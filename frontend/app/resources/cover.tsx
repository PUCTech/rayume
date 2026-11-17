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

// lines of body text on a sheet: n bars from (x, y), each a share of width w, the last of a paragraph shorter
function lines(r: () => number, x: number, y: number, w: number, n: number, gap = 7, color = c.ink, opacity = 0.22) {
  return Array.from({ length: n }, (_, i) => (
    <rect key={i} x={x} y={y + i * gap} width={w * (i === n - 1 ? 0.35 + r() * 0.3 : 0.78 + r() * 0.22)} height={2.6} rx={1.3} fill={color} opacity={opacity} />
  ));
}

// a white sheet with a navy-tinted shadow, rotated a touch
function Sheet({ x, y, w, h, tilt = 0, children }: { x: number; y: number; w: number; h: number; tilt?: number; children: ReactNode }) {
  return (
    <g transform={`rotate(${tilt} ${x + w / 2} ${y + h / 2})`}>
      <rect x={x} y={y + 4} width={w} height={h} rx={3} fill={c.ink} opacity={0.08} />
      <rect x={x} y={y} width={w} height={h} rx={3} fill="white" />
      {children}
    </g>
  );
}

// a typeset page, and a lens over one "fi": the letters a parser reads, not a ligature glyph
function Latex({ r }: { r: () => number }) {
  return (
    <>
      <Sheet x={46} y={26} w={136} h={176} tilt={-4}>
        <rect x={84} y={40} width={60} height={5} rx={2.5} fill={c.ink} opacity={0.85} />
        <rect x={70} y={50} width={88} height={2} rx={1} fill={c.ink} opacity={0.3} />
        {[64, 108, 152].map((y, s) => (
          <g key={y}>
            <rect x={58} y={y} width={34} height={3.2} rx={1.6} fill={c.ink} opacity={0.7} />
            <rect x={58} y={y + 6} width={112} height={1} fill={c.ink} opacity={0.35} />
            {lines(r, 58, y + 12, 112, s === 2 ? 3 : 4, 6.5)}
          </g>
        ))}
      </Sheet>
      <line x1={206} y1={128} x2={174} y2={160} stroke={c.ink} strokeWidth={7} strokeLinecap="round" />
      <circle cx={232} cy={98} r={46} fill={c.paper} stroke={c.accent} strokeWidth={5} />
      <text x={232} y={116} textAnchor="middle" className={serif} fontSize={52} fill={c.ink}>
        f<tspan fill={c.accent}>i</tspan>
      </text>
    </>
  );
}

// the same resume twice: on the right a few lines move up and some words turn ultramarine; the rest, the
// facts, stay exactly where they were
function Tailoring({ r }: { r: () => number }) {
  const rows = Array.from({ length: 9 }, () => 0.55 + r() * 0.4);
  const moved = [6, 2];
  const right = [...moved, ...rows.map((_, i) => i).filter((i) => !moved.includes(i))];
  const y = (i: number) => 52 + i * 15;
  return (
    <>
      {[34, 186].map((x, side) => (
        <Sheet key={x} x={x} y={30} w={100} h={170} tilt={side ? 3 : -3}>
          <rect x={x + 12} y={40} width={44} height={4} rx={2} fill={c.ink} opacity={0.8} />
          {(side ? right : rows.map((_, i) => i)).map((row, i) => (
            <g key={row}>
              <rect x={x + 12} y={y(i)} width={76 * rows[row]} height={3} rx={1.5} fill={c.ink} opacity={0.22} />
              {side === 1 && moved.includes(row) && <rect x={x + 12} y={y(i)} width={76 * rows[row] * 0.45} height={3} rx={1.5} fill={c.accent} />}
            </g>
          ))}
        </Sheet>
      ))}
      {moved.map((row, k) => (
        <path key={row} d={`M ${46 + 76 * rows[row]} ${y(row) + 1} C 160 ${y(row)}, 166 ${y(k) + 2}, 196 ${y(k) + 2}`} fill="none" stroke={c.accent} strokeWidth={2} strokeDasharray="4 4" strokeLinecap="round" />
      ))}
    </>
  );
}

// a first resume filling up: projects, coursework and a part-time job as blocks, one more being drawn in
function First({ r }: { r: () => number }) {
  const sections = [
    { y: 50, items: 2, accent: true },
    { y: 104, items: 2, accent: false },
    { y: 150, items: 1, accent: false },
  ];
  return (
    <>
      <Sheet x={88} y={22} w={144} h={180}>
        <rect x={102} y={34} width={56} height={5} rx={2.5} fill={c.ink} opacity={0.85} />
        {sections.map((s) => (
          <g key={s.y}>
            <rect x={102} y={s.y} width={30} height={3} rx={1.5} fill={c.ink} opacity={0.65} />
            {Array.from({ length: s.items }, (_, i) => (
              <g key={i}>
                <rect x={102} y={s.y + 8 + i * 20} width={116} height={15} rx={4} fill={s.accent ? c.accent : c.mist} opacity={s.accent ? 0.16 + i * 0.1 : 1} />
                {lines(r, 108, s.y + 13 + i * 20, 90, 2, 5, c.ink, 0.25)}
              </g>
            ))}
          </g>
        ))}
        <rect x={102} y={178} width={116} height={15} rx={4} fill="none" stroke={c.accent} strokeWidth={1.5} strokeDasharray="4 3" />
      </Sheet>
      <g transform="rotate(-38 236 172)">
        <rect x={222} y={166} width={64} height={12} rx={2} fill={c.deep} />
        <rect x={276} y={166} width={10} height={12} rx={2} fill={c.ink} opacity={0.7} />
        <path d="M 222 166 L 208 172 L 222 178 Z" fill={c.mist} />
        <path d="M 212 170.3 L 208 172 L 212 173.7 Z" fill={c.ink} />
      </g>
    </>
  );
}

// a plain typeset sheet, for a post with no drawing of its own yet
function Plain({ r }: { r: () => number }) {
  return (
    <Sheet x={100} y={26} w={120} h={170} tilt={-2}>
      <rect x={114} y={40} width={50} height={5} rx={2.5} fill={c.ink} opacity={0.85} />
      {lines(r, 114, 56, 92, 16)}
    </Sheet>
  );
}

const drawings: Record<string, (p: { r: () => number }) => ReactNode> = {
  "why-we-write-resumes-in-latex": Latex,
  "what-tailoring-should-change": Tailoring,
  "first-resume-no-experience": First,
};

// A post's cover: a drawing made in code, in the site's own colours, decorative (the title says it all). It sits
// on mist, or on paper when it's inside a mist card
export function Cover({ slug, onMist = false, className = "" }: { slug: string; onMist?: boolean; className?: string }) {
  const Drawing = drawings[slug] ?? Plain;
  return (
    <svg aria-hidden viewBox="0 0 320 220" className={`block aspect-[32/22] w-full rounded-[22px] ${onMist ? "bg-paper" : "bg-mist"} ${className}`}>
      <Drawing r={random(slug)} />
    </svg>
  );
}
