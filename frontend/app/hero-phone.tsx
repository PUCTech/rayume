"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { Mark } from "./logo";

const question = "What did you actually do at Lumen Labs?";
const reply =
  "ok so i was the junior dev on basically everything, front and back. rebuilt the scheduling dashboard for 1,200 clinics and got it from 3.8s to 1.1s with pagination and redis caching, shipped the stripe billing with zero double charges, and reviewed PRs for the two interns";

const enter = "transition duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none";
// bg-transparent drops the browser's yellow <mark> fill, which showed through the sweep
const mark =
  "rounded bg-transparent bg-linear-to-r from-accent/20 to-accent/20 bg-no-repeat bg-size-[100%_100%] px-0.5 text-ink transition-[background-size] duration-700 ease-out starting:bg-size-[0%_100%] motion-reduce:transition-none";

const noop = () => () => {};
const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

// Phones and tablets: the hero's lens is desktop only, so a before/after sits between the pitch and the
// buttons instead, sized off the screen height so the whole hero fits the first screen. The left note
// gets its highlights; the right panel is a chat where Rayume asks and he types a long answer (it
// scrolls up and blurs out at the top), then it turns into his new resume, zooming out from his name
// until the whole page fits. Then it loops. Reduced motion shows the finished resume, still.
export function PhoneHero() {
  const reduced = useSyncExternalStore(noop, reducedMotion, () => false);
  const [phase, setPhase] = useState<"chat" | "pdf">("chat");
  const [typed, setTyped] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [shift, setShift] = useState(0);
  const box = useRef<HTMLDivElement>(null);
  const feed = useRef<HTMLDivElement>(null);
  const pdf = useRef<HTMLDivElement>(null);
  const show = reduced ? "pdf" : phase;

  // the chat: a beat, then the reply types two characters at a time, then a pause before the resume
  useEffect(() => {
    if (reduced) return;
    const timers: number[] = [];
    let i = 0;
    const tick = () => {
      i = Math.min(reply.length, i + 2);
      setTyped(i);
      timers.push(window.setTimeout(i < reply.length ? tick : () => setPhase("pdf"), i < reply.length ? 32 : 900));
    };
    timers.push(window.setTimeout(tick, 1100));
    return () => timers.forEach(clearTimeout);
  }, [cycle, reduced]);

  // the resume: zoom out from his name until the page fits, hold, then start over
  useEffect(() => {
    if (phase !== "pdf" || reduced) return;
    const zoom = pdf.current?.animate([{ scale: "3.4" }, { scale: "1" }], {
      duration: 2600,
      delay: 250,
      easing: "cubic-bezier(0.65, 0, 0.35, 1)",
      fill: "both",
    });
    const again = window.setTimeout(() => {
      setPhase("chat");
      setTyped(0);
      setCycle((c) => c + 1);
    }, 6500);
    return () => {
      clearTimeout(again);
      zoom?.cancel();
    };
  }, [phase, reduced]);

  // as the reply grows past the panel, slide it up so the newest line stays in view
  useEffect(() => {
    const ro = new ResizeObserver(() => setShift(Math.max(0, (feed.current?.offsetHeight ?? 0) - (box.current?.clientHeight ?? 0))));
    if (feed.current) ro.observe(feed.current);
    if (box.current) ro.observe(box.current);
    return () => ro.disconnect();
  }, []);

  return (
    // the height tracks the screen steeply: ~88px on a 568px-tall phone, ~200px on 844px, capped at 14rem
    <div aria-hidden className="relative mx-auto mt-6 h-[clamp(5.5rem,41.7svh-9.3rem,14rem)] w-full max-w-sm lg:hidden">
      {/* the note fills the box and fades its text out at the bottom when a short screen squeezes it */}
      <div
        className={`${enter} absolute bottom-0 left-0 top-3 w-[58%] -rotate-3 overflow-hidden rounded-2xl bg-white p-3.5 text-[11px] leading-snug text-ink/55 shadow-[0_1px_2px_rgb(22_27_34/0.08),0_12px_32px_-16px_rgb(22_27_34/0.3)] starting:-translate-x-4 starting:opacity-0`}
      >
        <div className="h-full [mask-image:linear-gradient(to_bottom,black_75%,transparent)]">
          <p className="text-ink/35">work??</p>
          <p className="mt-1">
            junior dev at <mark className={`${mark} delay-[1.1s]`}>lumen labs</mark>, front + back, made the dashboard faster
          </p>
          <p className="mt-2 text-ink/35">projects??</p>
          <p className="mt-1">
            puc cafeteria app, like <mark className={`${mark} delay-[1.5s]`}>2k students</mark> use it
          </p>
        </div>
      </div>

      <div className={`${enter} glass absolute right-0 top-0 h-full w-[56%] rotate-2 rounded-[22px] p-2 delay-150 starting:translate-y-4 starting:opacity-0`}>
        <div className="relative h-full overflow-hidden rounded-xl bg-white">
          {/* the chat; the feed is masked and blurred toward the top so lines melt away as they rise */}
          <div ref={box} className={`absolute inset-0 transition-opacity duration-500 ${show === "chat" ? "opacity-100" : "opacity-0"}`}>
            <div className="absolute inset-0 overflow-hidden px-2.5 pb-2.5 [mask-image:linear-gradient(to_bottom,transparent,black_45%)]">
              <div
                ref={feed}
                style={{ transform: `translateY(-${shift}px)` }}
                className="flex flex-col gap-1.5 pt-2.5 text-[10.5px] leading-snug transition-transform duration-300 ease-out"
              >
                <div key={`q${cycle}`} className={`${enter} flex items-start gap-1.5 starting:translate-y-2 starting:opacity-0`}>
                  <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-accent-deep text-white">
                    <Mark className="h-2.5 w-auto" />
                  </span>
                  <p className="rounded-xl rounded-tl-sm bg-mist px-2 py-1.5 text-ink/80">{question}</p>
                </div>
                {typed > 0 && (
                  <p className="ml-4 self-end rounded-xl rounded-tr-sm bg-accent-deep px-2 py-1.5 text-white">
                    {reply.slice(0, typed)}
                    {typed < reply.length && <span className="ml-px inline-block h-[1em] w-px translate-y-[0.15em] animate-pulse bg-white" />}
                  </p>
                )}
              </div>
            </div>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-2/5 backdrop-blur-[1.5px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
          </div>

          {/* the new resume: starts zoomed on his name, the animation pulls back until the page fits */}
          <div className={`absolute inset-0 transition-opacity duration-500 ${show === "pdf" ? "opacity-100" : "opacity-0"}`}>
            <div ref={pdf} className="absolute inset-0 origin-[50%_5%] scale-[3.4] motion-reduce:scale-100">
              <Image src="/resumes/classic.png" alt="" fill sizes="(min-width: 640px) 640px, 160vw" className="object-contain" />
            </div>
          </div>
        </div>
      </div>

      <span
        className={`${enter} absolute bottom-0 left-[44%] grid size-9 -translate-x-1/2 place-items-center rounded-full bg-accent-deep text-white shadow-[0_8px_20px_-8px_color-mix(in_srgb,var(--color-accent)_80%,transparent)] delay-500 starting:scale-0`}
      >
        <svg viewBox="0 0 20 20" className="size-4 animate-[nudge_2.4s_ease-in-out_2s_infinite] motion-reduce:animate-none" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 10h11m-4-4 4 4-4 4" />
        </svg>
      </span>
    </div>
  );
}
