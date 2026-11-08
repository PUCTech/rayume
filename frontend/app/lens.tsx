"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import textLayer from "../resumes/classic-text.json";

// SVG displacement filter used by `.lg` as a backdrop-filter. Only Chromium renders url() in
// backdrop-filter; userAgentData is Chromium-only, so it doubles as the feature check.
export function Refraction() {
  useEffect(() => {
    if ("userAgentData" in navigator) document.documentElement.dataset.refract = "";
    return () => {
      delete document.documentElement.dataset.refract;
    };
  }, []);
  return (
    <svg width="0" height="0" className="absolute" aria-hidden>
      <filter id="lg-refract" x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.008 0.012" numOctaves="2" seed="4" result="noise" />
        <feGaussianBlur in="noise" stdDeviation="3" result="soft" />
        <feDisplacementMap in="SourceGraphic" in2="soft" scale="34" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>
  );
}

// Lucas's rough notes, each block placed where its section sits on the rendered page
// (tops measured from public/resumes/classic.pdf by resumes/render.py -v).
const notes: { top: string; label?: string; lines: string[] }[] = [
  { top: "2.5%", lines: ["lucas mendes", "cs @ puc-sp, graduating end of 2026"] },
  {
    top: "11.5%",
    label: "work??",
    lines: [
      "junior dev at lumen labs, front + back, made the dashboard way faster",
      "did the stripe payments thing, nobody got charged twice lol",
      "interned at trilha (nestjs api, quiz editor) and quintal (live delivery map)",
    ],
  },
  {
    top: "41%",
    label: "projects??",
    lines: ["puc cafeteria menu app, like 2k students use it", "hackathon app with safe walking routes, got 2nd"],
  },
  { top: "59%", label: "school", lines: ["comp sci at puc-sp, TA for data structures"] },
  { top: "71%", label: "skills??", lines: ["typescript react next node postgres docker, some aws"] },
];

function Notes() {
  return (
    <div className="absolute inset-0 bg-white px-[7%] text-ink/45">
      {notes.map((n) => (
        <div key={n.top} className="absolute inset-x-[7%] text-[12.5px] leading-[18px]" style={{ top: n.top }}>
          {n.label && <p className="mb-1 text-[11px] text-ink/30">{n.label}</p>}
          {n.lines.map((l, i) => (
            <p key={l} className={i === 0 && !n.label ? "text-[17px] leading-6" : "mt-1.5"}>
              {l}
            </p>
          ))}
        </div>
      ))}
    </div>
  );
}

export function Lens() {
  const stage = useRef<HTMLDivElement>(null);
  const userMoved = useRef(false);
  const [full, setFull] = useState(false);

  // One orchestrated moment: the lens drifts over the page until the visitor takes over.
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = stage.current!;
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      if (!userMoved.current) {
        const s = (t - t0) / 1000;
        el.style.setProperty("--x", `${50 + 28 * Math.sin(s * 0.55)}%`);
        el.style.setProperty("--y", `${44 + 30 * Math.sin(s * 0.8 + 1)}%`);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  function follow(e: React.PointerEvent) {
    if (e.pointerType !== "mouse") return;
    userMoved.current = true;
    const r = stage.current!.getBoundingClientRect();
    stage.current!.style.setProperty("--x", `${e.clientX - r.left}px`);
    stage.current!.style.setProperty("--y", `${e.clientY - r.top}px`);
  }

  return (
    <figure className="relative">
      {/* liquid-glass bezel around the page */}
      <div className="glass rounded-[34px] p-3">
        <div
          ref={stage}
          data-full={full ? "" : undefined}
          onPointerMove={follow}
          onPointerLeave={() => (userMoved.current = false)}
          className="group relative aspect-[8.5/11] overflow-hidden rounded-[24px] shadow-[0_1px_2px_rgb(22_27_34/0.1)] [--r:84px] [--x:62%] [--y:38%] [--zoom:2] transition-[--r,--zoom] duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] data-full:[--r:900px] data-full:[--zoom:1] motion-reduce:transition-none"
        >
          <div aria-hidden>
            <Notes />
          </div>
          {/* scaled around the pointer, so the clip radius is divided by the zoom to keep the lens size */}
          <div className="absolute inset-0 origin-[var(--x)_var(--y)] scale-(--zoom) bg-white [clip-path:circle(calc(var(--r)/var(--zoom))_at_var(--x)_var(--y))]">
            <Image
              src="/resumes/classic.svg"
              alt="Lucas Mendes's resume, typeset in LaTeX: three roles, three projects, education at PUC-SP, certifications and skills."
              fill
              priority
              unoptimized
              className="object-contain"
            />
            {/* invisible copy of the PDF's text, in PDF points, so the page can be selected and copied */}
            <svg
              aria-hidden
              viewBox="0 0 612 792"
              className="pointer-events-none absolute inset-0 size-full select-none font-serif selection:bg-verm/25 group-data-full:pointer-events-auto group-data-full:select-text"
            >
              {textLayer.map(([x, y, size, width, text], i) => (
                <text key={i} x={x} y={y} fontSize={size} textLength={width} lengthAdjust="spacingAndGlyphs" fill="transparent">
                  {text}
                </text>
              ))}
            </svg>
          </div>
          {/* the ring only magnifies: noise refraction here would garble the text */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-(--x) top-(--y) size-[calc(var(--r)*2)] -translate-1/2 rounded-full bg-white/[0.04] backdrop-saturate-160 shadow-[inset_0_2px_1px_rgb(255_255_255/0.95),inset_0_-2px_2px_rgb(22_27_34/0.12),inset_0_0_0_1px_rgb(255_255_255/0.6),inset_0_0_24px_rgb(255_255_255/0.35),0_18px_40px_-12px_rgb(22_27_34/0.35)] transition-opacity duration-400 group-data-full:opacity-0"
          />
        </div>
      </div>
      <figcaption className="mt-4 flex items-center justify-between gap-4 px-2 text-sm text-ink/60">
        <span>{full ? "The PDF Rayume compiled from those notes." : "The lens shows the resume Rayume wrote from the notes."}</span>
        <button
          type="button"
          onClick={() => setFull((f) => !f)}
          aria-pressed={full}
          className="glass shrink-0 rounded-full px-4 py-2 font-medium text-ink transition active:scale-95"
        >
          {full ? "Show the notes" : "Show the PDF"}
        </button>
      </figcaption>
    </figure>
  );
}
