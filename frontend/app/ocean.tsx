"use client";

import { useEffect, useRef } from "react";

// Underwater scene for the accent band: every shape is a lighter or darker accent, animated with SMIL
// so nothing runs per frame in JS. Paths for the mantas and seagrass are computed once at module load.

type Pt = [number, number];
const TAU = Math.PI * 2;
// derived from the accent tokens in globals.css, so the ocean follows the colour
const DEEP = "var(--ocean-deep)";
const SHADE = "var(--ocean-shade)";
const MID = "var(--ocean-mid)";
const LIGHT = "var(--ocean-light)";

const n = (v: number) => Math.round(v * 10) / 10;
const mid = (a: Pt, b: Pt): Pt => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
const xy = (p: Pt) => `${n(p[0])} ${n(p[1])}`;

// Closed smooth outline: quadratic curves between midpoints. A repeated point gives a sharp tip.
// Same point count in, same command structure out, so frames can be morphed with <animate d>.
function smooth(pts: Pt[]) {
  let d = `M${xy(mid(pts[pts.length - 1], pts[0]))}`;
  pts.forEach((p, i) => (d += `Q${xy(p)} ${xy(mid(p, pts[(i + 1) % pts.length]))}`));
  return `${d}Z`;
}

// Deterministic randomness so server and client render the same scene.
let seed = 11;
const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

/* Manta, head towards +x, half-span 100. Each wing is bent by a wave that leaves the root first and
   reaches the tip later, then the 3D wing is seen through a tilted camera so the beat reads on screen. */
const SPAN = [0, 0.2, 0.4, 0.6, 0.8, 1];
const lead = (s: number) => 0.32 - 0.27 * s - 0.2 * s ** 3;
const trail = (s: number) => -0.46 + 0.29 * s + 0.2 * Math.sin(Math.PI * s);

function mantaFrame(t: number) {
  const amp = 1;
  const lag = 1.5;
  const tilt = 0.4;
  let y = 0.17;
  let z = 0;
  const wing = SPAN.map((s, i) => {
    if (i) {
      const sm = (s + SPAN[i - 1]) / 2;
      const phi = amp * sm ** 1.3 * Math.sin(TAU * t - lag * sm);
      y += 1.05 * (s - SPAN[i - 1]) * Math.cos(phi);
      z += 1.05 * (s - SPAN[i - 1]) * Math.sin(phi);
    }
    return [y, z];
  });
  const at = (x: number, yy: number, zz: number, side: number): Pt => [
    x * 100,
    (side * yy * Math.cos(tilt) - zz * Math.sin(tilt)) * 100,
  ];
  const half = (side: number): Pt[] => [
    at(0.42, 0.05, 0, side),
    at(0.48, 0.09, 0, side),
    at(0.48, 0.09, 0, side),
    at(0.38, 0.145, 0, side),
    ...SPAN.slice(0, -1).map((s, i) => at(lead(s), wing[i][0], wing[i][1], side)),
    at(-0.17, wing[5][0], wing[5][1], side),
    at(-0.17, wing[5][0], wing[5][1], side),
    ...SPAN.slice(0, -1)
      .map((s, i) => at(trail(s), wing[i][0], wing[i][1], side))
      .reverse(),
    at(-0.52, 0.09, 0, side),
    at(-0.56, 0.02, 0, side),
  ];
  const tail: Pt = [-112, 4 * Math.sin(TAU * t - 2)];
  return smooth([[34, 0], ...half(1), tail, tail, ...half(-1).reverse()]);
}

const MANTA = Array.from({ length: 13 }, (_, i) => mantaFrame((i % 12) / 12)).join(";");

function Manta({ path, dur, flap, begin, scale, fill, opacity, haze }: {
  path: string;
  dur: number;
  flap: number;
  begin: number;
  scale: number;
  fill: string;
  opacity: number;
  haze?: boolean;
}) {
  return (
    <g filter={haze ? "url(#oc-haze)" : undefined}>
      <animateMotion path={path} dur={`${dur}s`} begin={`${begin}s`} rotate="auto" repeatCount="indefinite" />
      <path transform={`scale(${scale})`} d={MANTA.split(";")[0]} fill={fill} opacity={opacity}>
        <animate attributeName="d" values={MANTA} dur={`${flap}s`} begin={`${begin}s`} repeatCount="indefinite" />
      </path>
    </g>
  );
}

/* Seagrass blade: a tapered ribbon whose bend travels up from the root. Four frames at the tip's
   zero crossings and peaks, eased like a sine between them. */
const EASE = "0.61 1 0.88 1;0.12 0 0.39 0;0.61 1 0.88 1;0.12 0 0.39 0";

function blade(x: number, h: number, w: number, amp: number, lean: number) {
  const frame = (phase: number) => {
    const left: Pt[] = [];
    const right: Pt[] = [];
    for (let i = 0; i <= 5; i++) {
      const s = i / 5;
      const cx = x + lean * s * s + amp * s * s * Math.sin(phase + 1.8 * (1 - s));
      const half = (w / 2) * (1 - 0.8 * s);
      left.push([cx - half, 300 - h * s]);
      right.push([cx + half, 300 - h * s]);
    }
    const tip: Pt = [x + lean * 1.05 + amp * Math.sin(phase) * 1.05, 300 - h - 8];
    return smooth([...left, tip, tip, ...right.reverse()]);
  };
  return [0, 1, 2, 3, 0].map((k) => frame((k * TAU) / 4)).join(";");
}

const GRASS = Array.from({ length: 26 }, (_, i) => {
  const back = i % 2 === 0;
  return {
    x: -60 + i * 60 + rand() * 40,
    h: (back ? 120 : 90) + rand() * (back ? 130 : 110),
    w: 12 + rand() * 10,
    back,
    dur: 7 + rand() * 4,
    begin: -rand() * 10,
  };
})
  .map((g) => ({ ...g, d: blade(g.x, g.h, g.w, 10 + g.h * 0.08, (rand() - 0.35) * 50) }))
  .sort((a, b) => Number(b.back) - Number(a.back));

const SCHOOL = Array.from({ length: 15 }, () => {
  const a = rand() * TAU;
  const r = Math.sqrt(rand());
  return { x: n(Math.cos(a) * r * 70), y: n(Math.sin(a) * r * 34), dur: 2.6 + rand() * 2, wig: 0.7 + rand() * 0.4 };
});
const FISH = "M8 0C5-3.2-2-3.4-5-.6L-9.5-3.6-8 0-9.5 3.6-5 .6C-2 3.4 5 3.2 8 0Z";

const SNOW = Array.from({ length: 26 }, () => ({
  x: n(rand() * 100),
  r: n(0.8 + rand() * 1.2),
  dur: n(50 + rand() * 40),
  begin: n(-rand() * 90),
  sway: n(8 + rand() * 6),
}));
const BUBBLES = Array.from({ length: 12 }, () => ({
  x: n(5 + rand() * 90),
  r: n(1.6 + rand() * 2.8),
  dur: n(14 + rand() * 10),
  begin: n(-rand() * 24),
}));

// Slanted god rays from a sun beyond the top-right corner:
// [top x, top width, bottom shift, bottom width, length, shimmer s, begin s]
const RAYS = [
  [1180, 70, -330, 210, 860, 11, -2],
  [1030, 40, -300, 150, 760, 14, -7],
  [880, 90, -360, 260, 900, 9, -4],
  [700, 34, -250, 130, 680, 13, -9],
  [520, 60, -300, 200, 820, 16, -1],
  [300, 30, -220, 120, 640, 12, -6],
];

const CAUSTIC = "M0 0H200V200H0ZM-1.6 37.1Q20.1 9.9 33.9 14.8Q47.7 19.7 49.3 38.6Q50.9 57.5 20.4 66.7Q-10.1 75.9 -16.7 70.1Q-23.3 64.3 -1.6 37.1ZM198.4 37.1Q220.1 9.9 233.9 14.8Q247.7 19.7 249.3 38.6Q250.9 57.5 220.4 66.7Q189.9 75.9 183.3 70.1Q176.7 64.3 198.4 37.1ZM-3.2 98.7Q-8.8 80.7 21.7 71.5Q52.2 62.3 59.2 72.9Q66.2 83.4 63.4 101.5Q60.6 119.6 39 124.4Q17.4 129.1 10 122.9Q2.5 116.7 -3.2 98.7ZM196.9 98.7Q191.2 80.7 221.7 71.5Q252.2 62.3 259.2 72.9Q266.2 83.4 263.4 101.5Q260.6 119.6 239 124.4Q217.4 129.1 210 122.9Q202.5 116.7 196.9 98.7ZM60.2 6.3Q50.1 13.1 36.3 8.2Q22.5 3.3 13.8 -6.7Q5 -16.8 11.7 -40.5Q18.4 -64.3 40 -69.1Q61.6 -73.9 67.9 -67.5Q74.1 -61.1 72.2 -30.8Q70.2 -0.5 60.2 6.3ZM60.2 206.3Q50.1 213.1 36.3 208.2Q22.5 203.3 13.8 193.3Q5 183.2 11.7 159.5Q18.4 135.7 40 130.9Q61.6 126.1 67.9 132.5Q74.1 138.9 72.2 169.2Q70.2 199.5 60.2 206.3ZM64.9 67.8Q57.9 57.2 56.3 38.3Q54.7 19.4 64.8 12.6Q74.9 5.9 101.7 11.3Q128.4 16.6 133.4 37.5Q138.3 58.3 137.9 58.8Q137.4 59.2 104.7 68.8Q71.9 78.4 64.9 67.8ZM72.7 126.8Q66.4 120.4 69.2 102.3Q72 84.2 104.8 74.7Q137.5 65.1 133.1 100.1Q128.6 135.1 103.8 134.1Q78.9 133.1 72.7 126.8ZM103.6 4.7Q76.8 -0.6 78.8 -30.9Q80.7 -61.3 105.5 -60.3Q130.3 -59.3 131.3 -58.5Q132.2 -57.7 139.8 -35.8Q147.3 -14 138.8 -2Q130.3 10 103.6 4.7ZM103.6 204.7Q76.8 199.4 78.8 169.1Q80.7 138.7 105.5 139.7Q130.3 140.7 131.3 141.5Q132.2 142.3 139.8 164.2Q147.3 186 138.8 198Q130.3 210 103.6 204.7ZM-24.7 -11Q-1.6 -12.5 7.2 -2.4Q15.9 7.6 -5.8 34.8Q-27.5 62 -41.2 59.2Q-55 56.3 -59.9 35.4Q-64.9 14.5 -56.4 2.5Q-47.9 -9.5 -24.7 -11ZM-24.7 189Q-1.6 187.5 7.2 197.6Q15.9 207.6 -5.8 234.8Q-27.5 262 -41.2 259.2Q-55 256.3 -59.9 235.4Q-64.9 214.5 -56.4 202.5Q-47.9 190.5 -24.7 189ZM175.3 -11Q198.4 -12.5 207.2 -2.4Q215.9 7.6 194.2 34.8Q172.5 62 158.8 59.2Q145 56.3 140.1 35.4Q135.1 14.5 143.6 2.5Q152.1 -9.5 175.3 -11ZM175.3 189Q198.4 187.5 207.2 197.6Q215.9 207.6 194.2 234.8Q172.5 262 158.8 259.2Q145 256.3 140.1 235.4Q135.1 214.5 143.6 202.5Q152.1 190.5 175.3 189ZM138.6 98.9Q143.1 63.9 143.6 63.5Q144 63 157.8 65.9Q171.5 68.7 178.1 74.6Q184.6 80.4 190.3 98.4Q195.9 116.3 166 125.9Q136 135.5 135.1 134.7Q134.1 133.9 138.6 98.9ZM-32.1 131.1Q-2.1 121.6 5.3 127.8Q12.7 134 6 157.8Q-0.7 181.5 -23.8 183Q-46.9 184.5 -54.5 162.6Q-62.1 140.7 -32.1 131.1ZM167.9 131.1Q197.9 121.6 205.3 127.8Q212.7 134 206 157.8Q199.3 181.5 176.2 183Q153.1 184.5 145.5 162.6Q137.9 140.7 167.9 131.1Z";

export function OceanScene() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const svgs = [...root.querySelectorAll<SVGSVGElement>(":scope > svg")];
    const run = (on: boolean) => svgs.forEach((s) => (on ? s.unpauseAnimations() : s.pauseAnimations()));
    // reduced motion: freeze on a calm frame where the big manta sits in the open top-right
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      svgs.forEach((s) => s.setCurrentTime(14));
      return run(false);
    }
    const io = new IntersectionObserver(([e]) => run(e.isIntersecting));
    io.observe(root);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0">
      {/* depth: lit near the surface, a touch deeper at the floor */}
      <svg className="absolute inset-0 size-full">
        <defs>
          <linearGradient id="oc-depth" x2="0" y2="1">
            <stop offset="0" stopColor={LIGHT} stopOpacity="0.22" />
            <stop offset="0.45" stopColor={LIGHT} stopOpacity="0" />
            <stop offset="1" stopColor={DEEP} stopOpacity="0.16" />
          </linearGradient>
          <radialGradient id="oc-sun" cx="0.82" cy="0" r="0.5">
            <stop offset="0" stopColor={LIGHT} stopOpacity="0.35" />
            <stop offset="1" stopColor={LIGHT} stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#oc-depth)" />
        <rect width="100%" height="100%" fill="url(#oc-sun)" />
      </svg>

      {/* surface: caustic net and god rays, kept at natural size and cropped on narrow screens */}
      <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMin slice" className="absolute inset-x-0 top-0 h-[900px] w-full">
        <defs>
          <pattern id="oc-net-a" width="200" height="200" patternUnits="userSpaceOnUse">
            <path d={CAUSTIC} fill={LIGHT} fillRule="evenodd" />
            <animateTransform attributeName="patternTransform" type="translate" values="0 0;200 200" dur="38s" repeatCount="indefinite" />
          </pattern>
          <pattern id="oc-net-b" width="200" height="200" patternUnits="userSpaceOnUse" patternTransform="scale(1.45) rotate(24)">
            <path d={CAUSTIC} fill={LIGHT} fillRule="evenodd" />
            <animateTransform attributeName="patternTransform" type="translate" values="0 0;-200 200" dur="52s" additive="sum" repeatCount="indefinite" />
          </pattern>
          <linearGradient id="oc-fade" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" />
            <stop offset="1" stopColor="#000" />
          </linearGradient>
          <mask id="oc-surface">
            <rect width="1440" height="340" fill="url(#oc-fade)" />
          </mask>
          <linearGradient id="oc-ray" x2="0" y2="1">
            <stop offset="0" stopColor={LIGHT} stopOpacity="0.55" />
            <stop offset="1" stopColor={LIGHT} stopOpacity="0" />
          </linearGradient>
        </defs>
        <g mask="url(#oc-surface)">
          <rect width="1440" height="340" fill="url(#oc-net-a)" opacity="0.1" />
          <rect width="1440" height="340" fill="url(#oc-net-b)" opacity="0.08" />
        </g>
        {RAYS.map(([x, w, dx, bw, len, dur, begin]) => (
          <polygon key={x} points={`${x},-20 ${x + w},-20 ${x + dx + bw},${len} ${x + dx},${len}`} fill="url(#oc-ray)">
            <animate attributeName="opacity" values="0.25;0.8;0.4;0.25" dur={`${dur}s`} begin={`${begin}s`} repeatCount="indefinite" />
            <animateTransform attributeName="transform" type="skewX" values="0;-2.5;1;0" dur={`${dur * 1.7}s`} begin={`${begin}s`} repeatCount="indefinite" />
          </polygon>
        ))}
      </svg>

      {/* far water: scales with the width; phones get the right half of the scene, larger, so the hero manta stays */}
      <svg viewBox="0 0 1440 495" preserveAspectRatio="xMidYMax meet" className="absolute inset-x-0 top-0 h-[45%] w-full overflow-visible max-md:-left-[120%] max-md:w-[220%]">
        <defs>
          <filter id="oc-haze" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="1.6" />
          </filter>
        </defs>
        <Manta path="M860 -140C1050 60 1300 190 1720 170" dur={46} flap={7.5} begin={-36} scale={0.5} fill={MID} opacity={0.4} haze />
        <g>
          <animateMotion path="M1700 320C1450 250 1200 330 1050 420S750 640 -260 760" dur="40s" begin="-9s" rotate="auto" repeatCount="indefinite" />
          {SCHOOL.map((f, i) => (
            <g key={i} transform={`translate(${f.x * 1.3} ${f.y * 1.3}) scale(1.3)`}>
              <animateTransform attributeName="transform" type="translate" additive="sum" values={`0 0;${f.y / 6} ${f.x / 10};0 0`} dur={`${f.dur}s`} repeatCount="indefinite" />
              <path d={FISH} fill={SHADE} opacity="0.4">
                <animateTransform attributeName="transform" type="rotate" values="-7;7;-7" dur={`${f.wig}s`} repeatCount="indefinite" />
              </path>
            </g>
          ))}
        </g>
      </svg>

      {/* near water: one manta cruises behind the cards, the big one climbs through the open top-right */}
      <svg viewBox="0 0 1440 605" preserveAspectRatio="xMidYMid meet" className="absolute inset-x-0 top-[45%] h-[55%] w-full overflow-visible max-md:-left-[120%] max-md:w-[220%]">
        <Manta path="M-420 470C300 560 900 520 1820 300" dur={56} flap={6.8} begin={-30} scale={1} fill={SHADE} opacity={0.36} />
        <Manta path="M1720 760C1400 420 1260 160 1120 -800" dur={48} flap={6} begin={-20} scale={1.6} fill={DEEP} opacity={0.42} />
      </svg>

      {/* drifting snow and rising bubbles, in % so they cover any section size */}
      <svg className="absolute inset-0 size-full">
        {SNOW.map((s, i) => (
          <circle key={i} cx={`${s.x}%`} r={s.r} fill={LIGHT} opacity="0.45">
            <animate attributeName="cy" values="-2%;102%" dur={`${s.dur}s`} begin={`${s.begin}s`} repeatCount="indefinite" />
            <animate attributeName="cx" values={`${s.x}%;${s.x + 1.2}%;${s.x}%`} dur={`${s.sway}s`} begin={`${s.begin}s`} repeatCount="indefinite" />
          </circle>
        ))}
        {BUBBLES.map((b, i) => (
          <circle key={i} cx={`${b.x}%`} r={b.r} fill={LIGHT}>
            <animate attributeName="cy" values="104%;20%" dur={`${b.dur}s`} begin={`${b.begin}s`} repeatCount="indefinite" />
            <animate attributeName="cx" values={`${b.x}%;${b.x + 0.5}%;${b.x - 0.3}%;${b.x}%`} dur="4s" begin={`${b.begin}s`} repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;0.55;0.4;0" dur={`${b.dur}s`} begin={`${b.begin}s`} repeatCount="indefinite" />
          </circle>
        ))}
      </svg>

      {/* seabed and seagrass at natural size, cropped from the centre on narrow screens */}
      <svg viewBox="0 0 1440 300" preserveAspectRatio="xMidYMax slice" className="absolute inset-x-0 bottom-0 h-[300px] w-full overflow-visible">
        <path d="M-200 300V250C100 215 300 260 560 238S1000 205 1240 236 1560 230 1640 240V300Z" fill={MID} opacity="0.35" />
        {GRASS.map((g) => (
          <path key={g.x} d={g.d.split(";")[0]} fill={g.back ? MID : DEEP} opacity={g.back ? 0.4 : 0.42}>
            <animate attributeName="d" values={g.d} dur={`${g.dur}s`} begin={`${g.begin}s`} calcMode="spline" keyTimes="0;0.25;0.5;0.75;1" keySplines={EASE} repeatCount="indefinite" />
          </path>
        ))}
        <path d="M-200 300V272C150 258 420 286 760 268S1240 262 1640 274V300Z" fill={DEEP} opacity="0.3" />
      </svg>
    </div>
  );
}
