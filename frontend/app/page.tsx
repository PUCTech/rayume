import { Fragment } from "react";
import Image from "next/image";
import { GeistSerifRegular } from "geist/font/serif/regular";
import { BrandMark, type Brand } from "./brands";
import { Mark } from "./logo";
import { Lens, Refraction } from "./lens";
import { Nav } from "./nav";
import { Footer } from "./footer";
import { OceanScene } from "./ocean";
import { Steps } from "./steps";
import { Gallery } from "./gallery";

const serif = GeistSerifRegular.className;

const sources = [
  {
    from: "A class project",
    line: "Designed the PostgreSQL schema for a 5-person course project and wrote its migration scripts",
    skills: ["SQL", "Teamwork"],
  },
  {
    from: "A part-time job",
    line: "Handled 40+ customer requests a shift at a campus bookstore during semester rush",
    skills: ["Communication", "Working under pressure"],
  },
  {
    from: "A weekend hackathon",
    line: "Shipped a working React prototype in 36 hours and pitched it to a panel of engineers",
    skills: ["React", "Shipping fast"],
  },
  {
    from: "A student club",
    line: "Organized 8 workshops for 200+ students as events lead of the coding club",
    skills: ["Leadership", "Planning"],
  },
];


type Mark3 = "yes" | "part" | "no";
const criteria = [
  ["Reads well in ATS", "ATS"],
  ["Writes it with you", "Writes"],
  ["Tailors to each job", "Tailors"],
  ["No code", "No code"],
];
// cells: reads well in ATS, writes it with you, tailors to each job, no code
const compare: { name: string; brand?: Brand; cells: Mark3[]; note: string }[] = [
  { name: "Rayume", cells: ["yes", "yes", "yes", "yes"], note: "Writes it, tailors it, typesets it. You just hit send." },
  { name: "Canva", brand: "canva", cells: ["part", "part", "no", "yes"], note: "Gorgeous, until the ATS reads it as alphabet soup." },
  { name: "Word", brand: "word", cells: ["yes", "part", "no", "yes"], note: "Move one bullet and a mystery page two appears." },
  { name: "Google Docs", brand: "docs", cells: ["yes", "part", "no", "yes"], note: "Free, fine, and identical to the other 400 applicants." },
  { name: "Notion", brand: "notion", cells: ["no", "part", "no", "yes"], note: "Cute as a link. Exports like a ransom note." },
  { name: "Overleaf", brand: "overleaf", cells: ["yes", "no", "no", "no"], note: "Stunning, right after you spend a weekend learning LaTeX." },
  { name: "ChatGPT", brand: "openai", cells: ["no", "yes", "part", "yes"], note: "Calls you “synergy-driven.” Formatting not included." },
];

function Tick({ v, accent = false, small = false }: { v: Mark3; accent?: boolean; small?: boolean }) {
  const label = { yes: "Yes", part: "Partly", no: "No" }[v];
  return (
    <span className="inline-flex items-center gap-2">
      <span
        aria-hidden
        className={`grid place-items-center rounded-full ${small ? "size-5 text-[11px]" : "size-6 text-[13px]"} ${
          v === "yes" ? (accent ? "bg-accent-deep text-white" : "bg-ink text-white") : v === "part" ? "bg-ink/10 text-ink/70" : "text-ink/30"
        }`}
      >
        {v === "yes" ? "✓" : v === "part" ? "~" : "–"}
      </span>
      <span className="sr-only">{label}</span>
    </span>
  );
}


// Phones and tablets: the hero's lens is desktop only, so a small before/after sits between the pitch
// and the buttons instead, sized off the screen height so the whole hero fits the first screen.
function MobileHero() {
  return (
    // the height tracks the screen steeply: ~88px on a 568px-tall phone, ~200px on 844px, capped at 14rem
    <div aria-hidden className="relative mx-auto mt-6 h-[clamp(5.5rem,41.7svh-9.3rem,14rem)] w-full max-w-sm lg:hidden">
      {/* the note fills the box and fades its text out at the bottom when a short screen squeezes it */}
      <div className="absolute bottom-0 left-0 top-3 w-[58%] -rotate-3 overflow-hidden rounded-2xl bg-white p-3.5 text-[11px] leading-snug text-ink/55 shadow-[0_1px_2px_rgb(22_27_34/0.08),0_12px_32px_-16px_rgb(22_27_34/0.3)]">
        <div className="h-full [mask-image:linear-gradient(to_bottom,black_75%,transparent)]">
          <p className="text-ink/35">work??</p>
          <p className="mt-1">junior dev at lumen labs, front + back, made the dashboard faster</p>
          <p className="mt-2 text-ink/35">projects??</p>
          <p className="mt-1">puc cafeteria app, like 2k students use it</p>
        </div>
      </div>
      <div className="glass absolute right-0 top-0 h-full w-[56%] rotate-2 rounded-[22px] p-2 transition duration-700 ease-out starting:translate-y-3 starting:opacity-0 motion-reduce:transition-none">
        <div className="relative h-full overflow-hidden rounded-xl bg-white">
          <Image src="/resumes/classic.png" alt="" fill priority sizes="(min-width: 640px) 220px, 56vw" className="object-cover object-top" />
        </div>
      </div>
      <span className="absolute bottom-0 left-[44%] grid size-9 -translate-x-1/2 place-items-center rounded-full bg-accent-deep text-white shadow-[0_8px_20px_-8px_color-mix(in_srgb,var(--color-accent)_80%,transparent)]">
        <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 10h11m-4-4 4 4-4 4" />
        </svg>
      </span>
    </div>
  );
}

// Phones and tablets: the wide comparison table becomes our card plus a scoreboard of the rest, with the
// four criteria as short headings over small marks and each tool's line underneath. No sideways scroll.
function PhoneCompare() {
  const [us, ...rest] = compare;
  return (
    <div className="mt-10 lg:hidden">
      <div className="rounded-3xl border-2 border-accent bg-white p-5 shadow-[0_18px_44px_-22px_color-mix(in_srgb,var(--color-accent)_75%,transparent)]">
        <p className="flex items-center gap-2.5 font-medium">
          <Mark className="h-5 w-auto text-accent" />
          {us.name}
        </p>
        <p className="mt-2 text-[17px] font-medium leading-snug">{us.note}</p>
        <ul className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2.5 text-sm">
          {criteria.map(([label]) => (
            <li key={label} className="flex items-center gap-2">
              <Tick v="yes" accent small />
              {label}
            </li>
          ))}
        </ul>
      </div>
      <table className="mt-8 w-full table-fixed border-separate border-spacing-0 text-left">
        <caption className="sr-only">How other tools compare</caption>
        <colgroup>
          <col />
          <col className="w-11" span={4} />
        </colgroup>
        <thead>
          <tr className="text-[11px] text-ink/50">
            <th scope="col" className="pb-2 font-normal"><span className="sr-only">Tool</span></th>
            {criteria.map(([label, short]) => (
              <th key={label} scope="col" className="pb-2 text-center font-normal leading-tight">
                <abbr title={label} className="no-underline">{short}</abbr>
              </th>
            ))}
          </tr>
        </thead>
        {rest.map((r) => (
          <tbody key={r.name}>
            <tr>
              <th scope="row" className="border-t border-ink/10 pt-3.5 font-medium">
                <span className="inline-flex items-center gap-2.5">
                  <BrandMark brand={r.brand!} className="size-4 shrink-0 text-ink/70" />
                  {r.name}
                </span>
              </th>
              {r.cells.map((c, i) => (
                <td key={i} className="border-t border-ink/10 pt-3.5 text-center"><Tick v={c} small /></td>
              ))}
            </tr>
            <tr>
              <td colSpan={5} className="pb-3.5 pt-1 text-sm leading-snug text-ink/60">{r.note}</td>
            </tr>
          </tbody>
        ))}
      </table>
    </div>
  );
}

const btn = "inline-flex items-center justify-center rounded-full px-6 py-3.5 text-[15px] font-medium transition active:scale-[0.97]";
const primary = `${btn} bg-accent-deep text-white shadow-[0_8px_24px_-8px_color-mix(in_srgb,var(--color-accent)_70%,transparent),inset_0_1px_0_rgb(255_255_255/0.25)] hover:bg-[color-mix(in_oklab,var(--color-accent)_45%,var(--color-accent-deep))]`;

export default function Landing() {
  return (
    <div className="min-h-screen overflow-x-clip bg-paper font-sans text-ink antialiased">
      <Refraction />

      <Nav serif={serif} />

      {/* hero */}
      <section className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 px-4 pb-24 pt-8 sm:px-6 sm:pt-16 lg:grid-cols-[1.08fr_0.92fr] lg:gap-10 lg:pt-24">
        <div aria-hidden className="pointer-events-none absolute right-[-10%] top-16 -z-0 size-[34rem] rounded-full bg-accent/35 blur-[110px] max-lg:hidden" />
        <div className="relative">
          <h1 className={`${serif} text-[clamp(2.5rem,7.4vw,6.4rem)] leading-[1.04] tracking-[-0.035em]`}>
            Your day to day tool to jobhunt.
          </h1>
          <p className="mt-5 max-w-[34rem] text-[17px] leading-[1.55] text-ink/70 sm:mt-7 sm:text-[19px]">
            Turn class projects, hackathons and internships into a resume recruiters actually read. Rayume
            writes it with you, tailors it to every posting and typesets it in LaTeX.
          </p>
          <MobileHero />
          {/* side by side from 360px so the whole hero fits the first screen of a phone */}
          <div className="mt-6 flex flex-col gap-3 min-[360px]:flex-row lg:mt-9">
            <a href="#" className={`${primary} max-sm:flex-1 max-sm:px-4`}>Build my resume</a>
            <a href="#templates" className={`glass ${btn} text-ink hover:bg-white/40 max-sm:flex-1 max-sm:px-4`}>See the templates</a>
          </div>
          <p className="mt-5 text-sm text-ink/50">Free while in beta. Sign in with GitHub or Google.</p>
        </div>
        <div className="relative mx-auto w-full max-w-[29rem] max-lg:hidden">
          <Lens />
        </div>
      </section>

      {/* accent band: what counts as experience. White text: navy on ultramarine is only 2.6:1 */}
      <section aria-labelledby="sources" className="relative overflow-hidden bg-accent py-24 text-white sm:py-32">
        <OceanScene />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <h2 id="sources" className={`${serif} max-w-3xl text-[clamp(2.4rem,5vw,4.2rem)] leading-[1] tracking-[-0.03em]`}>
            Entry level doesn&apos;t mean an empty page.
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-relaxed">
            Most first resumes undersell. The things you did between classes are real experience, and Rayume pulls
            out the hard and soft skills hiding in them.
          </p>
          <div className="mt-14 grid gap-4 md:grid-cols-2">
            {sources.map((s, i) => (
              <article key={s.from} className={`glass glass-dark rounded-[28px] p-6 sm:p-7 ${i % 2 ? "md:translate-y-10" : ""}`}>
                <p className="text-sm">{s.from}</p>
                <p className={`${serif} mt-3 text-[22px] leading-snug sm:text-2xl`}>{s.line}</p>
                <ul className="mt-5 flex flex-wrap gap-2" aria-label="Skills found">
                  {s.skills.map((k) => (
                    <li key={k} className="rounded-full bg-ink px-3 py-1 text-[13px] font-medium text-white">{k}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* how it works: a real sequence, so it is numbered */}
      <section id="how" aria-labelledby="how-h" className="mx-auto max-w-6xl px-4 py-28 sm:px-6 lg:py-36">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-end">
          <h2 id="how-h" className={`${serif} text-[clamp(2.4rem,4.6vw,3.8rem)] leading-[1] tracking-[-0.03em]`}>
            Three steps, then you&apos;re applying.
          </h2>
          <p className="max-w-md text-lg leading-relaxed text-ink/65 lg:justify-self-end">
            Write your story once. Every application after that takes a couple of minutes.
          </p>
        </div>
        <Steps serif={serif} />
      </section>

      {/* templates */}
      <section id="templates" aria-labelledby="tpl-h" className="relative overflow-hidden bg-mist py-28 lg:py-36">
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 size-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/25 blur-[120px]" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <Gallery>
            <div>
              <h2 id="tpl-h" className={`${serif} max-w-xl text-[clamp(2.4rem,4.6vw,3.8rem)] leading-[1] tracking-[-0.03em]`}>
                Every template, already filled in with you.
              </h2>
              <p className="mt-5 max-w-md text-lg leading-relaxed text-ink/65">
                The Overleaf favorites, filled in with your real name, projects and skills. Compare, then switch with one tap.
              </p>
            </div>
          </Gallery>
        </div>
      </section>

      {/* comparison */}
      <section id="why" aria-labelledby="why-h" className="mx-auto max-w-6xl px-4 py-28 sm:px-6 lg:py-36">
        <h2 id="why-h" className={`${serif} max-w-2xl text-[clamp(2.4rem,4.6vw,3.8rem)] leading-[1] tracking-[-0.03em]`}>
          Why not just use what you already have?
        </h2>
        <PhoneCompare />
        <div className="relative mt-12 overflow-x-auto max-lg:hidden">
          <table className="w-full min-w-[52rem] table-fixed border-separate border-spacing-0 text-left text-[15px]">
            <colgroup>
              <col className="w-40" />
              <col className="w-32" span={4} />
              <col />
            </colgroup>
            <thead>
              <tr className="text-sm text-ink/55">
                <th scope="col" className="pb-4 font-normal"><span className="sr-only">Tool</span></th>
                {criteria.map(([label]) => (
                  <th key={label} scope="col" className="pb-4 font-normal">{label}</th>
                ))}
                <th scope="col" className="pb-4 font-normal"><span className="sr-only">Note</span></th>
              </tr>
            </thead>
            <tbody>
              {compare.map((r) => {
                const us = !r.brand;
                // our row: an accent outline drawn on the cells (rows can't take a border radius)
                const cell = us ? "border-y-2 border-accent bg-white py-[18px]" : "border-t border-ink/10 py-5";
                return (
                  <Fragment key={r.name}>
                    <tr className={us ? "shadow-[0_18px_44px_-22px_color-mix(in_srgb,var(--color-accent)_75%,transparent)]" : ""}>
                      <th scope="row" className={`${cell} pl-4 ${us ? "rounded-l-2xl border-l-2" : ""} font-medium`}>
                        <span className="inline-flex items-center gap-2.5">
                          {r.brand ? <BrandMark brand={r.brand} className="size-4 text-ink/70" /> : <Mark className="h-5 w-auto text-accent" />}
                          {r.name}
                        </span>
                      </th>
                      {r.cells.map((c, i) => (
                        <td key={i} className={cell}><Tick v={c} accent={us} /></td>
                      ))}
                      <td className={`${cell} pr-4 ${us ? "rounded-r-2xl border-r-2 font-medium text-ink" : "text-ink/60"}`}>{r.note}</td>
                    </tr>
                    {us && <tr aria-hidden><td colSpan={6} className="h-4" /></tr>}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* final call */}
      <section className="px-4 pb-6 sm:px-6">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[36px] bg-ink px-6 py-24 text-center text-white sm:py-32">
          <div aria-hidden className="pointer-events-none absolute left-1/2 top-[150%] size-[46rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/70 blur-[100px]" />
          <Mark className="relative mx-auto h-14 w-auto text-paper" />
          <h2 className={`${serif} relative mx-auto mt-8 max-w-3xl text-[clamp(2.4rem,5.4vw,4.6rem)] leading-[1] tracking-[-0.03em]`}>
            Your first tech job starts with one good page.
          </h2>
          <p className="relative mx-auto mt-6 max-w-md text-lg text-white/70">
            Write it once. Tailor it in minutes. Send it with confidence.
          </p>
          <div className="relative mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <a href="#" className={primary}>Build my resume</a>
            <a href="#" className={`glass glass-dark ${btn} text-white hover:bg-white/15`}>Get the extension</a>
          </div>
        </div>
      </section>

      <Footer serif={serif} />
    </div>
  );
}
