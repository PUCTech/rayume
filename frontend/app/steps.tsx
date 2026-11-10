"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";

// Each demo plays once when the steps scroll into view; --d staggers the cards.
// Reduced motion skips the transitions and shows the finished state.
const anim = "transition duration-500 ease-out motion-reduce:transition-none";

const steps = [
  {
    title: "Tell Rayume what you've done",
    body: "In your own words, as messy as you like. It asks follow-up questions and keeps everything in one Master Resume you only write once.",
    demo: (
      <div className="rounded-2xl bg-white p-4 text-sm shadow-[0_1px_2px_rgb(22_27_34/0.08)]">
        <p
          className={`${anim} text-ink/45 duration-[1400ms] ease-linear [clip-path:inset(0_100%_0_0)] delay-[calc(var(--d)_+_0.5s)] group-data-seen:[clip-path:inset(0_0_0_0)]`}
        >
          worked on the uni app team, did the login screen and fixed a bunch of bugs
        </p>
        <p
          className={`${anim} mt-3 translate-y-2 rounded-xl bg-paper px-3 py-2 text-ink/80 opacity-0 delay-[calc(var(--d)_+_2s)] group-data-seen:translate-y-0 group-data-seen:opacity-100`}
        >
          How many people used the app? Roughly how many bugs did you close?
        </p>
      </div>
    ),
  },
  {
    title: "Paste the job you want",
    body: "From the app, or one click with the browser extension. Rayume reads what the posting asks for and picks what fits from your experience.",
    demo: (
      <div className="rounded-2xl bg-white p-4 text-sm leading-relaxed shadow-[0_1px_2px_rgb(22_27_34/0.08)]">
        <p className="font-medium">Full Stack Engineer, Orbita</p>
        <p className="mt-2 text-ink/60">
          You&apos;ll build features in <Keyword delay="0.5s">React</Keyword> and <Keyword delay="0.8s">TypeScript</Keyword>, work
          closely with design, and <Keyword delay="1.1s">explain your work clearly</Keyword> to the team.
        </p>
        <p className={`${anim} mt-3 text-xs text-ink/50 opacity-0 delay-[calc(var(--d)_+_1.5s)] group-data-seen:opacity-100`}>
          3 of 4 requirements matched in your Master Resume
        </p>
      </div>
    ),
  },
  {
    title: "Download a PDF that gets read",
    body: "Typeset in LaTeX, the format senior engineers swear by, and laid out so applicant tracking systems parse every line.",
    demo: (
      <>
        {/* the page prints top to bottom while the compile bar fills */}
        <div className="relative mb-3 h-36 overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgb(22_27_34/0.08)]">
          <Image
            src="/resumes/classic.png"
            alt=""
            fill
          draggable={false}
            sizes="320px"
            className={`${anim} object-cover object-top duration-[1100ms] ease-linear [clip-path:inset(0_0_100%_0)] delay-[calc(var(--d)_+_0.5s)] group-data-seen:[clip-path:inset(0_0_0_0)]`}
          />
        </div>
        <div className="flex items-center gap-3 rounded-2xl bg-white p-4 text-sm shadow-[0_1px_2px_rgb(22_27_34/0.08)]">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent text-xs font-semibold text-white">PDF</span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-medium">lucas-mendes-orbita.pdf</span>
            <span className="mt-1.5 block h-1 overflow-hidden rounded-full bg-ink/10">
              <span
                className={`${anim} block h-full origin-left scale-x-0 rounded-full bg-accent duration-[1100ms] delay-[calc(var(--d)_+_0.5s)] group-data-seen:scale-x-100`}
              />
            </span>
            {/* the status line swaps once the compile bar fills */}
            <span className="mt-1 grid text-xs">
              <span className={`${anim} col-start-1 row-start-1 text-ink/50 delay-[calc(var(--d)_+_1.6s)] group-data-seen:opacity-0`}>
                Compiling LaTeX…
              </span>
              <span className={`${anim} col-start-1 row-start-1 text-ink/50 opacity-0 delay-[calc(var(--d)_+_1.6s)] group-data-seen:opacity-100`}>
                1 page, ready to send
              </span>
            </span>
          </span>
          <span
            className={`${anim} rounded-full bg-ink px-3 py-1.5 text-xs text-white opacity-0 scale-90 delay-[calc(var(--d)_+_1.7s)] group-data-seen:scale-100 group-data-seen:opacity-100`}
          >
            Download
          </span>
        </div>
      </>
    ),
  },
];

function Keyword({ delay, children }: { delay: string; children: string }) {
  return (
    <mark
      style={{ "--k": delay } as CSSProperties}
      className={`${anim} rounded bg-transparent px-1 text-ink/60 delay-[calc(var(--d)_+_var(--k))] group-data-seen:bg-accent/15 group-data-seen:text-accent-text`}
    >
      {children}
    </mark>
  );
}

export function Steps({ serif }: { serif: string }) {
  const ref = useRef<HTMLOListElement>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        setSeen(true);
        io.disconnect();
      },
      { threshold: 0.35 },
    );
    io.observe(ref.current!);
    return () => io.disconnect();
  }, []);

  return (
    <ol ref={ref} data-seen={seen ? "" : undefined} className="group mt-14 grid grid-cols-1 gap-4 lg:grid-cols-3">
      {steps.map((s, i) => (
        <li
          key={s.title}
          style={{ "--d": `${i * 0.9}s` } as CSSProperties}
          className="flex flex-col rounded-[28px] bg-mist p-5 sm:p-6"
        >
          {/* together the three bars read as one progress line across the row */}
          <span aria-hidden className="block h-1 overflow-hidden rounded-full bg-ink/10">
            <span className={`${anim} block h-full origin-left scale-x-0 rounded-full bg-accent duration-700 delay-(--d) group-data-seen:scale-x-100`} />
          </span>
          <h3 className="mt-6 flex items-baseline gap-3 text-lg font-medium tracking-tight">
            <span className={`${serif} text-3xl leading-none text-accent`}>{i + 1}</span>
            {s.title}
          </h3>
          <p className="mt-2 text-[15px] leading-relaxed text-ink/65">{s.body}</p>
          <div className="mt-auto pt-6">{s.demo}</div>
        </li>
      ))}
    </ol>
  );
}
