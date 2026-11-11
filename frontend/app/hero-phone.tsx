"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { Mark } from "./logo";

const question = "What did you actually do at Lumen Labs?";
const highlight = "Lumen Labs";
const reply =
  "ok so i was the junior dev on basically everything, front and back. rebuilt the scheduling dashboard for 1,200 clinics and got it from 3.8s to 1.1s with pagination and redis caching, shipped the stripe billing with zero double charges, and reviewed PRs for the two interns";

// where to aim on classic.png, as fractions of the page (measured from classic.pdf)
const PAGE = 2000 / 2589;
const NAME = { u: 0.5, v: 0.05, scale: 3.4 };
const LUMEN = { u: 0.045, v: 0.106, scale: 2.3 };

const enter = "transition duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none";
// whoever's turn it is comes to the front at full size; the other card sinks back, smaller and dimmer
const turn = (mine: boolean) =>
  `transition-[opacity,translate,scale,z-index] duration-500 ${mine ? "z-20 scale-100 opacity-100" : "z-10 scale-[0.93] opacity-75"}`;
const caret = "ml-px inline-block h-[1em] w-px translate-y-[0.15em] animate-pulse";

const noop = () => () => {};
const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

type Phase = "ask" | "reply" | "render" | "pdf";

// Phones and tablets: the hero's lens is desktop only, so a short story plays between the pitch and the
// buttons, sized off the screen height so the whole hero fits the first screen. Rayume (left) types a
// question and highlights what it's after; he (right) types a long answer that scrolls up out of view;
// the card whose turn it is comes to the front;
// a quick render; then his new resume, the camera on his name, gliding to the Lumen Labs entry to show
// what he did, then pulling back to the whole page. It loops. Reduced motion shows the end, still.
export function PhoneHero() {
  const reduced = useSyncExternalStore(noop, reducedMotion, () => false);
  const [phase, setPhase] = useState<Phase>("ask");
  const [asked, setAsked] = useState(0);
  const [typed, setTyped] = useState(0);
  const [cycle, setCycle] = useState(0);
  const feed = useRef<HTMLDivElement>(null);
  const pdf = useRef<HTMLDivElement>(null);
  const show = reduced ? "pdf" : phase;
  const q = reduced ? question.length : asked;

  // ask, then reply, then render: one chain of timers per cycle
  useEffect(() => {
    if (reduced) return;
    const timers: number[] = [];
    const later = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));
    let i = 0;
    let j = 0;
    const askTick = () => {
      setAsked(++i);
      if (i < question.length) later(38, askTick);
      else later(900, () => (setPhase("reply"), later(400, replyTick)));
    };
    const replyTick = () => {
      j = Math.min(reply.length, j + 2);
      setTyped(j);
      if (j < reply.length) later(32, replyTick);
      else later(700, () => (setPhase("render"), later(1300, () => setPhase("pdf"))));
    };
    later(700, askTick);
    return () => timers.forEach(clearTimeout);
  }, [cycle, reduced]);

  // the resume as a camera move: hold on his name, glide to Lumen Labs and hold, pull back to the page
  useEffect(() => {
    const el = pdf.current;
    if (phase !== "pdf" || reduced || !el) return;
    // the page is object-contain'ed, so aim points are converted from page fractions to box percentages
    const W = el.clientWidth;
    const H = el.clientHeight;
    const pw = Math.min(W, H * PAGE);
    const ph = pw / PAGE;
    const at = ({ u, v }: { u: number; v: number }) =>
      `${(((W - pw) / 2 + u * pw) / W) * 100}% ${(((H - ph) / 2 + v * ph) / H) * 100}%`;
    const name = { scale: String(NAME.scale), transformOrigin: at(NAME) };
    const lumen = { scale: String(LUMEN.scale), transformOrigin: at(LUMEN) };
    const page = { scale: "1", transformOrigin: "50% 50%" };
    const camera = el.animate(
      [
        { ...name, offset: 0 },
        { ...name, offset: 0.16 },
        { ...lumen, offset: 0.34 },
        { ...lumen, offset: 0.7 },
        { ...page, offset: 0.86 },
        { ...page, offset: 1 },
      ],
      { duration: 7500, easing: "ease-in-out", fill: "both" },
    );
    const again = window.setTimeout(() => {
      setPhase("ask");
      setAsked(0);
      setTyped(0);
      setCycle((c) => c + 1);
    }, 8600);
    return () => {
      clearTimeout(again);
      camera.cancel();
    };
  }, [phase, reduced]);

  // The reply sits on the bottom edge and grows upward; each new line would jump it up a line, so
  // play that jump back as a short slide (FLIP), which reads as the text drifting up.
  useEffect(() => {
    const el = feed.current;
    if (!el) return;
    let last = el.offsetHeight;
    const ro = new ResizeObserver(() => {
      const grew = el.offsetHeight - last;
      last = el.offsetHeight;
      if (grew > 0 && !reducedMotion()) el.animate([{ translate: `0 ${grew}px` }, { translate: "0 0" }], { duration: 260, easing: "ease-out" });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const lit = q === question.length;
  const h = question.indexOf(highlight);

  return (
    // the height tracks the screen steeply: ~88px on a 568px-tall phone, ~200px on 844px, capped at 14rem
    <div aria-hidden className="relative mx-auto mt-6 h-[clamp(5.5rem,41.7svh-9.3rem,14rem)] w-full max-w-sm lg:hidden">
      {/* Rayume asks; the card fills the box and fades its text out when a short screen squeezes it */}
      <div
        className={`${enter} ${turn(show === "ask")} absolute bottom-0 left-0 top-3 w-[58%] -rotate-3 overflow-hidden rounded-2xl bg-white p-3 shadow-[0_1px_2px_rgb(22_27_34/0.08),0_12px_32px_-16px_rgb(22_27_34/0.3)] starting:-translate-x-4 starting:opacity-0`}
      >
        <div className="h-full [mask-image:linear-gradient(to_bottom,black_75%,transparent)]">
          <p className="flex items-center gap-1.5 text-[10px] font-medium text-ink/45">
            <span className="grid size-4 place-items-center rounded-full bg-accent-deep text-white">
              <Mark className="h-2.5 w-auto" />
            </span>
            Rayume
          </p>
          <p className="mt-2 text-[12px] leading-snug text-ink/85">
            {question.slice(0, Math.min(q, h))}
            {q > h && (
              <mark
                className={`rounded bg-transparent bg-linear-to-r from-accent/20 to-accent/20 bg-no-repeat px-0.5 text-ink transition-[background-size] duration-700 ease-out motion-reduce:transition-none ${lit ? "bg-size-[100%_100%]" : "bg-size-[0%_100%]"}`}
              >
                {question.slice(h, Math.min(q, h + highlight.length))}
              </mark>
            )}
            {question.slice(h + highlight.length, q)}
            {!lit && <span className={`${caret} bg-ink/60`} />}
          </p>
        </div>
      </div>

      <div className={`${enter} ${turn(show !== "ask")} glass absolute right-0 top-0 h-full w-[56%] rotate-2 rounded-[22px] p-2 delay-150 starting:translate-y-4 starting:opacity-0`}>
        <div className="relative h-full overflow-hidden rounded-xl bg-white">
          {/* his answer, growing up from the bottom edge and scrolling out of the top */}
          <div className={`absolute inset-0 transition-opacity duration-500 ${show === "ask" || show === "reply" ? "opacity-100" : "opacity-0"}`}>
            {show === "ask" && (
              <span className="absolute bottom-2.5 right-2.5 flex gap-1 rounded-xl rounded-tr-sm bg-accent-deep/10 px-2 py-2">
                {[0, 1, 2].map((d) => (
                  <span key={d} style={{ animationDelay: `${d * 150}ms` }} className="size-1 animate-pulse rounded-full bg-accent-deep/60" />
                ))}
              </span>
            )}
            <div className="absolute inset-0 overflow-hidden px-2.5">
              <div ref={feed} className="absolute inset-x-2.5 bottom-2.5 flex flex-col text-[10.5px] leading-snug">
                {typed > 0 && (
                  <p className="ml-3 self-end rounded-xl rounded-tr-sm bg-accent-deep px-2 py-1.5 text-white">
                    {reply.slice(0, typed)}
                    {typed < reply.length && <span className={`${caret} bg-white`} />}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* a quick render between the answer and the resume */}
          {show === "render" && (
            <div className="absolute inset-0 grid place-content-center justify-items-center gap-2 text-[10.5px] text-ink/60">
              <Mark className="h-5 w-auto animate-pulse text-accent" />
              Compiling LaTeX…
              <span className="h-1 w-24 overflow-hidden rounded-full bg-ink/10">
                <span className="block h-full w-full rounded-full bg-accent-deep transition-[width] duration-[1100ms] ease-out starting:w-0" />
              </span>
            </div>
          )}

          {/* the new resume; the camera move above zooms and pans this layer */}
          <div className={`absolute inset-0 transition-opacity duration-500 ${show === "pdf" ? "opacity-100" : "opacity-0"}`}>
            <div ref={pdf} className="absolute inset-0 origin-[50%_5%] scale-[3.4] motion-reduce:scale-100">
              <Image src="/resumes/classic.png" alt="" fill sizes="(min-width: 640px) 640px, 160vw" className="object-contain" />
            </div>
          </div>
        </div>
      </div>

      <span
        className={`${enter} absolute bottom-0 left-[44%] z-30 grid size-9 -translate-x-1/2 place-items-center rounded-full bg-accent-deep text-white shadow-[0_8px_20px_-8px_color-mix(in_srgb,var(--color-accent)_80%,transparent)] delay-500 starting:scale-0`}
      >
        <svg viewBox="0 0 20 20" className="size-4 animate-[nudge_2.4s_ease-in-out_2s_infinite] motion-reduce:animate-none" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 10h11m-4-4 4 4-4 4" />
        </svg>
      </span>
    </div>
  );
}
