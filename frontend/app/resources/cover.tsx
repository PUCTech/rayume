import type { ReactNode } from "react";
import { GeistSerifRegular } from "geist/font/serif/regular";

const serif = GeistSerifRegular.className;
const c = { mist: "var(--color-mist)", paper: "var(--color-paper)", ink: "var(--color-ink)", accent: "var(--color-accent)", deep: "var(--color-accent-deep)" };
const W = 320;
const H = 220;

// a small seeded random source, so a post's cover is the same on every render (server and browser alike)
function random(seed: string) {
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}
type R = () => number;
const pick = <T,>(r: R, xs: readonly T[]) => xs[Math.floor(r() * xs.length)];
const between = (r: R, a: number, b: number) => a + r() * (b - a);

// sheet: the colour of a page lying on the cover (the opposite of the cover's own ground)
type P = { r: R; sheet: string; slug: string };

// a fine dot grid, the engineering-paper ground every cover shares
function Dots({ step = 16, opacity = 0.16 }: { step?: number; opacity?: number }) {
  const dots: ReactNode[] = [];
  for (let x = step; x < W; x += step) for (let y = step; y < H; y += step) dots.push(<circle key={`${x}-${y}`} cx={x} cy={y} r={0.7} />);
  return (
    <g fill={c.ink} opacity={opacity}>
      {dots}
    </g>
  );
}

// a page with a soft navy shadow
function Page({ x, y, w, h, fill, children }: { x: number; y: number; w: number; h: number; fill: string; children?: ReactNode }) {
  return (
    <g>
      <rect x={x + 3} y={y + 5} width={w} height={h} rx={4} fill={c.ink} opacity={0.08} />
      <rect x={x} y={y} width={w} height={h} rx={4} fill={fill} stroke={c.ink} strokeOpacity={0.14} strokeWidth={0.75} />
      {children}
    </g>
  );
}

// a line of text, abstracted into a bar
function Bar({ x, y, w, h = 3, color = c.ink, opacity = 0.22 }: { x: number; y: number; w: number; h?: number; color?: string; opacity?: number }) {
  return <rect x={x} y={y} width={Math.max(w, h)} height={h} rx={h / 2} fill={color} opacity={opacity} />;
}

// a resume, abstracted: name, contact line, then sections of a rule and a few bullets
function Resume({ r, x, y, w, h, fill, hot = -1, sections = 3, dashed = false }: { r: R; x: number; y: number; w: number; h: number; fill: string; hot?: number; sections?: number; dashed?: boolean }) {
  const pad = w * 0.12;
  const inner = w - pad * 2;
  const rows: ReactNode[] = [];
  let cy = y + pad + 14;
  const gap = (h - pad * 2 - 20) / sections;
  for (let s = 0; s < sections; s++) {
    rows.push(<Bar key={`h${s}`} x={x + pad} y={cy} w={inner * 0.3} h={3.5} opacity={0.6} />);
    rows.push(<line key={`l${s}`} x1={x + pad} x2={x + pad + inner} y1={cy + 7} y2={cy + 7} stroke={c.ink} strokeOpacity={0.18} strokeWidth={0.75} />);
    const n = Math.max(1, Math.floor((gap - 16) / 8));
    for (let i = 0; i < n; i++) {
      const by = cy + 13 + i * 8;
      const bw = inner * between(r, 0.55, 0.95);
      const isHot = s === hot && i === 0;
      rows.push(
        dashed && s > 0 ? (
          <line key={`b${s}-${i}`} x1={x + pad} x2={x + pad + bw} y1={by + 1.5} y2={by + 1.5} stroke={c.ink} strokeOpacity={0.25} strokeWidth={1} strokeDasharray="2 3" strokeLinecap="round" />
        ) : (
          <Bar key={`b${s}-${i}`} x={x + pad} y={by} w={bw} color={isHot ? c.accent : c.ink} opacity={isHot ? 1 : 0.2} />
        ),
      );
    }
    cy += gap;
  }
  return (
    <Page x={x} y={y} w={w} h={h} fill={fill}>
      <Bar x={x + pad} y={y + pad} w={inner * 0.5} h={5} opacity={0.85} />
      <Bar x={x + pad} y={y + pad + 8} w={inner * 0.7} h={2} opacity={0.25} />
      {rows}
    </Page>
  );
}

// --- the three posts ---------------------------------------------------------------------------------------------

// LaTeX: the source on the left, set in ink like a terminal; the typeset page it becomes on the right
function Latex({ r, sheet }: P) {
  const code = [
    ["\\section", 0.5, true],
    ["", 0.78, false],
    ["", 0.62, false],
    ["\\item", 0.7, true],
    ["", 0.5, false],
    ["\\item", 0.66, true],
    ["", 0.42, false],
  ] as const;
  return (
    <>
      <Dots />
      <rect x={28} y={40} width={140} height={140} rx={10} fill={c.ink} />
      <circle cx={42} cy={53} r={2.5} fill={c.paper} opacity={0.3} />
      <circle cx={51} cy={53} r={2.5} fill={c.paper} opacity={0.3} />
      <circle cx={60} cy={53} r={2.5} fill={c.paper} opacity={0.3} />
      {code.map(([kw, w], i) => (
        <g key={i}>
          <text x={40} y={80 + i * 13} fontSize={7} fontFamily="ui-monospace, monospace" fill={c.paper} opacity={0.35}>
            {String(i + 1).padStart(2, "0")}
          </text>
          {kw ? (
            <text x={56} y={80 + i * 13} fontSize={8} fontFamily="ui-monospace, monospace" fill={c.accent}>
              {kw}
              <tspan fill={c.paper} opacity={0.5}>{"{ }"}</tspan>
            </text>
          ) : (
            <rect x={64} y={75 + i * 13} width={90 * w} height={3} rx={1.5} fill={c.paper} opacity={0.25} />
          )}
        </g>
      ))}
      <path d="M 176 110 H 190" stroke={c.accent} strokeWidth={2} strokeLinecap="round" />
      <path d="M 186 105 L 191 110 L 186 115" fill="none" stroke={c.accent} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Resume r={r} x={200} y={30} w={96} h={160} fill={sheet} hot={0} sections={3} />
      <text x={292} y={208} textAnchor="end" fontSize={15} className={serif} fill={c.ink}>
        T<tspan dy={3}>E</tspan>
        <tspan dy={-3}>X</tspan>
      </text>
    </>
  );
}

// Tailoring: a job posting on the left; the lines of the resume that answer it move to the top, joined by rules
function Tailoring({ r, sheet }: P) {
  const ys = [76, 100, 124];
  const ts = [70, 82, 94];
  return (
    <>
      <Dots />
      <Page x={30} y={44} w={104} h={132} fill={c.ink}>
        <rect x={42} y={56} width={22} height={22} rx={11} fill={c.accent} />
        <rect x={70} y={60} width={50} height={4} rx={2} fill={c.paper} opacity={0.8} />
        <rect x={70} y={69} width={34} height={3} rx={1.5} fill={c.paper} opacity={0.35} />
        {ys.map((y, i) => (
          <g key={y}>
            <rect x={42} y={y + 14} width={6} height={6} rx={3} fill={c.accent} />
            <rect x={54} y={y + 15} width={[64, 52, 58][i]} height={3.5} rx={1.75} fill={c.paper} opacity={0.6} />
          </g>
        ))}
        <rect x={42} y={150} width={70} height={3} rx={1.5} fill={c.paper} opacity={0.2} />
        <rect x={42} y={158} width={50} height={3} rx={1.5} fill={c.paper} opacity={0.2} />
      </Page>
      <Page x={196} y={28} w={96} h={164} fill={sheet}>
        <Bar x={208} y={40} w={46} h={5} opacity={0.85} />
        <Bar x={208} y={49} w={60} h={2} opacity={0.25} />
        <line x1={208} x2={280} y1={62} y2={62} stroke={c.ink} strokeOpacity={0.18} strokeWidth={0.75} />
        {ts.map((y, i) => (
          <Bar key={y} x={214} y={y} w={[56, 48, 60][i]} color={c.accent} opacity={1} />
        ))}
        {[110, 118, 126, 140, 148, 156, 164, 172].map((y) => (
          <Bar key={y} x={208} y={y} w={72 * between(r, 0.5, 0.95)} />
        ))}
      </Page>
      {ys.map((y, i) => (
        <g key={y}>
          <path d={`M 134 ${y + 17} C 165 ${y + 17}, 170 ${ts[i] + 1.5}, 206 ${ts[i] + 1.5}`} fill="none" stroke={c.accent} strokeWidth={1.25} />
          <circle cx={208} cy={ts[i] + 1.5} r={2.5} fill={c.accent} />
        </g>
      ))}
    </>
  );
}

// First resume: one page, its first section set, the rest still placeholders, a cursor waiting
function First({ r, sheet }: P) {
  return (
    <>
      <Dots />
      <circle cx={232} cy={92} r={58} fill={c.accent} opacity={0.12} />
      <Resume r={r} x={112} y={22} w={110} h={176} fill={sheet} sections={4} dashed />
      <rect x={124} y={58} width={2} height={14} fill={c.accent} />
      <g transform="translate(236 128)">
        <circle r={20} fill={c.deep} />
        <path d="M -7 0 H 7 M 0 -7 V 7" stroke={c.paper} strokeWidth={2.5} strokeLinecap="round" />
      </g>
      <text x={40} y={190} fontSize={34} className={serif} fill={c.ink} opacity={0.9}>
        01
      </text>
    </>
  );
}

// --- the generated covers, for every other slug --------------------------------------------------------------------

// a stack of pages fanned from one corner, the top one carrying the accent
function Stack({ r, sheet }: P) {
  const n = 3;
  const x0 = between(r, 50, 150);
  const hot = Math.floor(between(r, 0, 3));
  return (
    <>
      <Dots />
      {Array.from({ length: n }, (_, i) => (
        <Resume key={i} r={r} x={x0 + i * 26} y={50 - i * 12} w={96} h={150} fill={sheet} hot={i === n - 1 ? hot : -1} sections={3} />
      ))}
    </>
  );
}

// a modular grid, one cell in accent and one quarter-circle, Swiss-poster style
function Grid({ r, sheet }: P) {
  const cols = 6;
  const rows = 4;
  const s = 40;
  const ox = (W - cols * s) / 2;
  const oy = (H - rows * s) / 2;
  const hot = [Math.floor(r() * cols), Math.floor(r() * rows)];
  let arc = [Math.floor(r() * cols), Math.floor(r() * rows)];
  if (arc[0] === hot[0] && arc[1] === hot[1]) arc = [(arc[0] + 2) % cols, arc[1]];
  const corner = pick(r, [0, 1, 2, 3] as const);
  const filled = new Set(Array.from({ length: 5 }, () => `${Math.floor(r() * cols)}-${Math.floor(r() * rows)}`));
  const cells: ReactNode[] = [];
  for (let i = 0; i < cols; i++)
    for (let j = 0; j < rows; j++) {
      const x = ox + i * s;
      const y = oy + j * s;
      const key = `${i}-${j}`;
      if (i === hot[0] && j === hot[1]) cells.push(<rect key={key} x={x} y={y} width={s} height={s} fill={c.accent} />);
      else if (i === arc[0] && j === arc[1]) {
        // a quarter circle filling the cell, centred on one of its corners
        const quarter = [`M ${x} ${y} h ${s} a ${s} ${s} 0 0 1 ${-s} ${s} z`, `M ${x + s} ${y} v ${s} a ${s} ${s} 0 0 1 ${-s} ${-s} z`, `M ${x} ${y + s} v ${-s} a ${s} ${s} 0 0 1 ${s} ${s} z`, `M ${x + s} ${y + s} h ${-s} a ${s} ${s} 0 0 1 ${s} ${-s} z`][corner];
        cells.push(
          <g key={key}>
            <rect x={x} y={y} width={s} height={s} fill={sheet} />
            <path d={quarter} fill={c.ink} />
          </g>,
        );
      } else if (filled.has(key)) cells.push(<rect key={key} x={x} y={y} width={s} height={s} fill={sheet} />);
    }
  return (
    <>
      {cells}
      <g stroke={c.ink} strokeOpacity={0.14} strokeWidth={0.75}>
        {Array.from({ length: cols + 1 }, (_, i) => (
          <line key={`v${i}`} x1={ox + i * s} x2={ox + i * s} y1={oy} y2={oy + rows * s} />
        ))}
        {Array.from({ length: rows + 1 }, (_, j) => (
          <line key={`h${j}`} x1={ox} x2={ox + cols * s} y1={oy + j * s} y2={oy + j * s} />
        ))}
      </g>
    </>
  );
}

// an ink terminal with bars of output, one line highlighted, and a prompt cursor
function Terminal({ r }: P) {
  const x = between(r, 34, 70);
  const w = 216;
  const lines = 8;
  const hot = Math.floor(between(r, 1, lines - 1));
  return (
    <>
      <Dots />
      <rect x={x + 4} y={42} width={w} height={146} rx={10} fill={c.ink} opacity={0.1} />
      <rect x={x} y={36} width={w} height={146} rx={10} fill={c.ink} />
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={x + 14 + i * 9} cy={49} r={2.5} fill={c.paper} opacity={0.3} />
      ))}
      {Array.from({ length: lines }, (_, i) => {
        const y = 68 + i * 12;
        const indent = pick(r, [0, 0, 12, 24]);
        const bw = between(r, 40, w - 60 - indent);
        return i === hot ? (
          <g key={i}>
            <rect x={x + 8} y={y - 4} width={w - 16} height={11} rx={3} fill={c.accent} />
            <rect x={x + 24 + indent} y={y} width={bw} height={3} rx={1.5} fill={c.paper} opacity={0.9} />
          </g>
        ) : (
          <rect key={i} x={x + 24 + indent} y={y} width={bw} height={3} rx={1.5} fill={c.paper} opacity={0.28} />
        );
      })}
      <path d={`M ${x + 14} 166 l 4 3 l -4 3`} fill="none" stroke={c.accent} strokeWidth={1.5} />
      <rect x={x + 24} y={164} width={6} height={10} fill={c.paper} opacity={0.8} />
    </>
  );
}

// one large serif glyph from the slug, on a baseline grid, beside a small page
function Glyph({ r, sheet, slug }: P) {
  const letter = (slug.match(/[a-z]/i)?.[0] ?? "R").toUpperCase();
  const left = r() < 0.5;
  const gx = left ? 40 : 170;
  return (
    <>
      <g stroke={c.ink} strokeOpacity={0.12} strokeWidth={0.75}>
        {Array.from({ length: 10 }, (_, i) => (
          <line key={i} x1={0} x2={W} y1={22 + i * 20} y2={22 + i * 20} />
        ))}
      </g>
      <line x1={0} x2={W} y1={162} y2={162} stroke={c.accent} strokeWidth={1.5} />
      <text x={gx} y={162} fontSize={150} className={serif} fill={c.ink}>
        {letter}
      </text>
      <circle cx={gx + between(r, 90, 115)} cy={between(r, 50, 80)} r={12} fill={c.accent} />
      <Resume r={r} x={left ? 200 : 40} y={36} w={84} h={126} fill={sheet} hot={Math.floor(r() * 3)} sections={3} />
    </>
  );
}

const families = [Stack, Grid, Terminal, Glyph] as const;

const drawings: Record<string, (p: P) => ReactNode> = {
  "why-we-write-resumes-in-latex": Latex,
  "what-tailoring-should-change": Tailoring,
  "first-resume-no-experience": First,
};

// A post's cover: a geometric composition made in code, in the site's own colours; decorative (the title says it
// all). Known posts get their own; any other slug gets one of a few families, seeded by the slug so it never changes.
// It sits on mist, or on paper when it's inside a mist card
export function Cover({ slug, onMist = false, className = "" }: { slug: string; onMist?: boolean; className?: string }) {
  const r = random(slug);
  const sheet = onMist ? c.mist : c.paper;
  const Drawing = drawings[slug];
  const Family = families[Math.floor(r() * families.length)];
  return (
    <svg aria-hidden viewBox={`0 0 ${W} ${H}`} className={`block aspect-[32/22] w-full rounded-[22px] ${onMist ? "bg-paper" : "bg-mist"} ${className}`}>
      {Drawing ? <Drawing r={r} sheet={sheet} slug={slug} /> : <Family r={r} sheet={sheet} slug={slug} />}
    </svg>
  );
}
