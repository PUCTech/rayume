"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { Mark } from "./logo";

const question = "What did you actually do at Lumen Labs?";
const highlight = "Lumen Labs";
const rant =
  "ok so lumen labs. technically i was the junior dev but honestly i was doing everything, front end, back end, the coffee machine, all of it. the scheduling dashboard took like 4 seconds to load and 1,200 clinics were mad about it, so i rebuilt it with pagination and redis caching and got it to 1.1s and nobody said thank you. then they handed me stripe billing, which is terrifying because it's real money, and i shipped it with zero double charges. ZERO. i was also reviewing PRs for two interns who were somehow better at git than me. i fixed the login screen like three separate times. there was a whole week where i was basically on call by myself. anyway";
const outro = "thats about it";
const answer = ["...sure", "making your new resume!"];
const wow = "wait, that's me?? WOW this is totally new";

// where to aim on the resume, as fractions of the page (measured from classic.pdf)
const PAGE = 612 / 792;
const NAME = { u: 0.5, v: 0.05, scale: 4.6 };
const LUMEN = { u: 0.045, v: 0.106, scale: 3.4 };
const BULLETS = { u: 0.4, v: 0.16, scale: 3.4 };

const enter = "transition duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none";
// whoever's turn it is comes to the front at full size; the other card sinks back, smaller and dimmer
const turn = (mine: boolean) =>
  `transition-[opacity,translate,scale,z-index] duration-500 ${mine ? "z-20 scale-100 opacity-100" : "z-10 scale-[0.93] opacity-75"}`;
const caret = "ml-px inline-block h-[1em] w-px translate-y-[0.15em] animate-pulse";
const bubble = "rounded-xl rounded-tr-sm bg-accent-deep px-2 py-1.5 text-white";
// Rayume's bubbles mirror his: mist, the tail on the left
const said = "self-start rounded-xl rounded-tl-sm bg-mist px-2 py-1.5";
const pop = "transition duration-300 ease-out starting:translate-y-1 starting:scale-95 starting:opacity-0";
const inOut = "cubic-bezier(0.65, 0, 0.35, 1)";

const noop = () => () => {};
const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

type Phase = "ask" | "rant" | "answer" | "render" | "resume";

// Phones and tablets: the hero's lens is desktop only, so a short story plays between the pitch and the
// buttons, sized off the screen height so the whole hero fits the first screen. Rayume (left) asks; he
// (right) rants, the lines flying up with a motion blur, then "thats about it"; Rayume says it's on it;
// his card compiles and becomes his new resume, the camera easing from his name to the Lumen Labs entry
// and its bullets with a motion blur on each move, then back to the page; he reacts. The card whose turn
// it is comes to the front. It loops. Reduced motion shows the finished resume, still.
export function PhoneHero() {
  const reduced = useSyncExternalStore(noop, reducedMotion, () => false);
  const [phase, setPhase] = useState<Phase>("ask");
  const [asked, setAsked] = useState(0);
  const [ranted, setRanted] = useState(0);
  const [done, setDone] = useState(false);
  const [answered, setAnswered] = useState(0);
  const [reacted, setReacted] = useState(false);
  const [cycle, setCycle] = useState(0);
  const feed = useRef<HTMLDivElement>(null);
  const lens = useRef<HTMLDivElement>(null);
  const camera = useRef<HTMLDivElement>(null);
  const show = reduced ? "resume" : phase;
  const q = reduced ? question.length : asked;
  const answerText = answer.join("\n");

  // the conversation: one chain of timers per cycle
  useEffect(() => {
    if (reduced) return;
    const timers: number[] = [];
    const later = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));
    let i = 0;
    const ask = () => {
      setAsked(++i);
      if (i < question.length) return later(38, ask);
      later(900, () => {
        setPhase("rant");
        i = 0;
        later(300, type);
      });
    };
    // he types fast: four characters a tick
    const type = () => {
      i = Math.min(rant.length, i + 4);
      setRanted(i);
      if (i < rant.length) return later(22, type);
      later(500, () => setDone(true));
      later(1500, () => {
        setPhase("answer");
        i = 0;
        later(400, reply);
      });
    };
    // Rayume pauses after "...sure" before the second line
    const reply = () => {
      setAnswered(++i);
      if (i < answerText.length) return later(i === answer[0].length ? 650 : 42, reply);
      later(900, () => {
        setPhase("render");
        later(1400, () => setPhase("resume"));
      });
    };
    later(700, ask);
    return () => timers.forEach(clearTimeout);
  }, [cycle, reduced, answerText]);

  // The resume as a camera move, eased in and out between holds: his name, the Lumen Labs entry, its
  // bullets, then the whole page. A second animation on the wrapper blurs each move at its peak, like a
  // motion blur, and clears it on the holds. Then he reacts and the story starts over.
  useEffect(() => {
    const el = camera.current;
    const blur = lens.current;
    if (show !== "resume" || reduced || !el || !blur) return;
    // the page is object-contain'ed, so aim points are converted from page fractions to box percentages
    const W = el.clientWidth;
    const H = el.clientHeight;
    const pw = Math.min(W, H * PAGE);
    const ph = pw / PAGE;
    const shot = ({ u, v, scale }: { u: number; v: number; scale: number }, offset: number) => ({
      offset,
      scale: String(scale),
      transformOrigin: `${(((W - pw) / 2 + u * pw) / W) * 100}% ${(((H - ph) / 2 + v * ph) / H) * 100}%`,
      easing: inOut,
    });
    const page = { u: 0.5, v: 0.5, scale: 1 };
    const T = 8600;
    const moves = el.animate(
      [shot(NAME, 0), shot(NAME, 0.16), shot(LUMEN, 0.29), shot(LUMEN, 0.43), shot(BULLETS, 0.53), shot(BULLETS, 0.7), shot(page, 0.84), shot(page, 1)],
      { duration: T, fill: "both" },
    );
    // [offset, blur px] pairs: sharp on every hold, peaking mid-move
    const blurs = [[0, 6], [0.06, 0], [0.16, 0], [0.225, 3], [0.29, 0], [0.43, 0], [0.48, 2.5], [0.53, 0], [0.7, 0], [0.77, 3.5], [0.84, 0], [1, 0]];
    const smear = blur.animate(
      blurs.map(([offset, px]) => ({ offset, filter: `blur(${px}px)`, easing: inOut })),
      { duration: T, fill: "both" },
    );
    const timers = [
      window.setTimeout(() => setReacted(true), T * 0.86),
      window.setTimeout(() => {
        setPhase("ask");
        setAsked(0);
        setRanted(0);
        setDone(false);
        setAnswered(0);
        setReacted(false);
        setCycle((c) => c + 1);
      }, T + 2600),
    ];
    return () => {
      timers.forEach(clearTimeout);
      moves.cancel();
      smear.cancel();
    };
  }, [show, reduced]);

  // The rant sits on the bottom edge and grows upward; each new line would jump it up a line, so play
  // the jump back as a quick slide with a blur (FLIP), which reads as text flying up.
  useEffect(() => {
    const el = feed.current;
    if (!el) return;
    let last = el.offsetHeight;
    const ro = new ResizeObserver(() => {
      const grew = el.offsetHeight - last;
      last = el.offsetHeight;
      if (grew > 0 && !reducedMotion())
        el.animate([{ translate: `0 ${grew}px`, filter: "blur(1.5px)" }, { translate: "0 0", filter: "blur(0)" }], { duration: 240, easing: "ease-out" });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const lit = q === question.length;
  const h = question.indexOf(highlight);
  const rayumesTurn = show === "ask" || show === "answer";
  const sure = answerText.slice(0, Math.min(answered, answer[0].length));
  const making = answerText.slice(answer[0].length + 1, answered);

  return (
    // the height tracks the screen steeply: ~88px on a 568px-tall phone, ~200px on 844px, capped at 14rem
    <div aria-hidden className="relative mx-auto mt-6 h-[clamp(5.5rem,41.7svh-9.3rem,14rem)] w-full max-w-sm lg:hidden">
      {/* Rayume; messages sit on the bottom edge so the newest stays in view on a short screen */}
      <div
        className={`${enter} ${turn(rayumesTurn)} absolute bottom-0 left-0 top-3 w-[58%] -rotate-3 overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgb(22_27_34/0.08),0_12px_32px_-16px_rgb(22_27_34/0.3)] starting:-translate-x-4 starting:opacity-0`}
      >
        <p className="absolute left-3 top-3 flex items-center gap-1.5 text-[10px] font-medium text-ink/45">
          <span className="grid size-4 place-items-center rounded-full bg-accent-deep text-white">
            <Mark className="h-2.5 w-auto" />
          </span>
          Rayume
        </p>
        <div className="absolute inset-x-3 bottom-3 top-9 flex flex-col justify-end gap-1.5 overflow-hidden text-[11.5px] leading-snug text-ink/85">
          <p className={said}>
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
          {answered > 0 && (
            <p className={`${pop} ${said} text-ink`}>
              {sure}
              {making && <br />}
              {making}
              {answered < answerText.length && <span className={`${caret} bg-ink/60`} />}
            </p>
          )}
        </div>
      </div>

      <div className={`${enter} ${turn(!rayumesTurn)} glass absolute right-0 top-0 h-full w-[56%] rotate-2 rounded-[22px] p-2 delay-150 starting:translate-y-4 starting:opacity-0`}>
        <div className="relative h-full overflow-hidden rounded-xl bg-white">
          {/* his side of the chat, growing up from the bottom edge and scrolling out of the top */}
          <div className={`absolute inset-0 transition-opacity duration-500 ${show === "render" || show === "resume" ? "opacity-0" : "opacity-100"}`}>
            {show === "ask" && (
              <span className="absolute bottom-2.5 right-2.5 flex gap-1 rounded-xl rounded-tr-sm bg-accent-deep/10 px-2 py-2">
                {[0, 1, 2].map((d) => (
                  <span key={d} style={{ animationDelay: `${d * 150}ms` }} className="size-1 animate-pulse rounded-full bg-accent-deep/60" />
                ))}
              </span>
            )}
            <div className="absolute inset-0 overflow-hidden px-2.5">
              <div ref={feed} className="absolute inset-x-2.5 bottom-2.5 flex flex-col items-end gap-1.5 text-[10.5px] leading-snug">
                {ranted > 0 && (
                  <p className={`ml-3 ${bubble}`}>
                    {rant.slice(0, ranted)}
                    {ranted < rant.length && <span className={`${caret} bg-white`} />}
                  </p>
                )}
                {done && <p className={`${pop} ${bubble}`}>{outro}</p>}
              </div>
            </div>
          </div>

          {/* the compile, in his card */}
          {show === "render" && (
            <div className="absolute inset-0 grid place-content-center justify-items-center gap-2 text-[10.5px] text-ink/60">
              <Mark className="h-5 w-auto animate-pulse text-accent" />
              Compiling LaTeX…
              <span className="h-1 w-24 overflow-hidden rounded-full bg-ink/10">
                <span className="block h-full w-full rounded-full bg-accent-deep transition-[width] duration-[1200ms] ease-in-out starting:w-0" />
              </span>
            </div>
          )}

          {/* his new resume (vector, so it stays sharp this far in); the camera moves the inner layer */}
          <div className={`absolute inset-0 transition-opacity duration-500 ${show === "resume" ? "opacity-100" : "opacity-0"}`}>
            <div ref={lens} className="absolute inset-0">
              <div ref={camera} className="absolute inset-0 origin-[50%_5%] scale-[4.6] motion-reduce:scale-100">
                <Image src="/resumes/classic.svg" alt="" fill unoptimized className="object-contain" />
              </div>
            </div>
            {reacted && <p className={`${pop} absolute bottom-2 left-4 right-2 text-[10.5px] leading-snug ${bubble}`}>{wow}</p>}
          </div>
        </div>
      </div>

    </div>
  );
}
