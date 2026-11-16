"use client";

import { useEffect, useState } from "react";

const prefix = "Glide through ";
// three words each and short enough to stay on one line at 320 px, so every version breaks the same way
const endings = ["the job hunt.", "every job post.", "the ATS filters.", "the job hunt."];
const full = prefix + endings[0];
const lines = [...new Set(endings)].map((e) => prefix + e);
const cut = prefix.length - 1;

// Always two lines, broken by hand after "Glide through": the short line on top, the three-word ending
// below and never wrapped. The typed text, the invisible sizers and the reduced-motion line all go
// through here, so the shape never changes while typing.
function Lines({ text, caret }: { text: string; caret?: string }) {
  const top = text.slice(0, cut);
  const bottom = text.slice(prefix.length);
  const mark = caret && <span className={caret} />;
  return (
    <>
      <span className="block">
        {top}
        {text.length <= prefix.length && mark}
      </span>
      <span className="block whitespace-nowrap">
        {bottom}
        {text.length > prefix.length && mark}
      </span>
    </>
  );
}

// Every frame of the typewriter as [delay before it, text]: the slogan types out, then the ending is
// deleted and retyped a few times, landing back on the slogan. It plays once and stops, so it never
// becomes ambient motion outside the ocean band.
const frames: [number, string][] = [];
let prev = "";
for (const [i, e] of endings.entries()) {
  const keep = i === 0 ? 0 : prefix.length;
  if (i > 0) for (let n = prev.length - 1; n >= keep; n--) frames.push([n === prev.length - 1 ? 2200 : 28, prev.slice(0, n)]);
  const next = prefix + e;
  for (let n = keep + 1; n <= next.length; n++) frames.push([n === keep + 1 ? (i === 0 ? 500 : 260) : 55, next.slice(0, n)]);
  prev = next;
}

// The full slogan is always in the DOM for screen readers; the typing is aria-hidden. Reduced motion is
// pure CSS (the typed layer hides, the full line shows), so the server and first client render match.
export function Slogan({ className }: { className: string }) {
  const [step, setStep] = useState(-1);
  const done = step === frames.length - 1;

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || done) return;
    const t = setTimeout(() => setStep((s) => s + 1), frames[step + 1][0]);
    return () => clearTimeout(t);
  }, [step, done]);

  return (
    <p className={className}>
      <span className="sr-only">{full}</span>
      {/* every version stacked in one cell, invisible: the box is as big as the longest, so typing never reflows */}
      <span aria-hidden className="grid">
        {lines.map((l) => (
          <span key={l} className={`col-start-1 row-start-1 invisible ${l === full ? "motion-reduce:visible" : ""}`}>
            <Lines text={l} />
          </span>
        ))}
        <span className="col-start-1 row-start-1 motion-reduce:hidden">
          <Lines
            text={step < 0 ? "" : frames[step][1]}
            caret={`ml-1 inline-block h-[0.78em] w-[3px] rounded-full bg-white align-baseline ${done ? "opacity-0 transition-opacity duration-700" : "animate-pulse"}`}
          />
        </span>
      </span>
    </p>
  );
}
