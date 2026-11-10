import { Fragment } from "react";
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

function Tick({ v, accent = false }: { v: Mark3; accent?: boolean }) {
  const label = { yes: "Yes", part: "Partly", no: "No" }[v];
  return (
    <span className="inline-flex items-center gap-2">
      <span
        aria-hidden
        className={`grid size-6 place-items-center rounded-full text-[13px] ${
          v === "yes" ? (accent ? "bg-verm-deep text-white" : "bg-ink text-white") : v === "part" ? "bg-ink/10 text-ink/70" : "text-ink/30"
        }`}
      >
        {v === "yes" ? "✓" : v === "part" ? "~" : "–"}
      </span>
      <span className="sr-only">{label}</span>
    </span>
  );
}


const btn = "inline-flex items-center justify-center rounded-full px-6 py-3.5 text-[15px] font-medium transition active:scale-[0.97]";
const primary = `${btn} bg-verm-deep text-white shadow-[0_8px_24px_-8px_color-mix(in_srgb,var(--color-verm)_70%,transparent),inset_0_1px_0_rgb(255_255_255/0.25)] hover:bg-[color-mix(in_oklab,var(--color-verm)_45%,var(--color-verm-deep))]`;

export default function Landing() {
  return (
    <div className="min-h-screen overflow-x-clip bg-paper font-sans text-ink antialiased">
      <Refraction />

      <Nav serif={serif} />

      {/* hero */}
      <section className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 px-4 pb-24 pt-16 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:gap-10 lg:pt-24">
        <div aria-hidden className="pointer-events-none absolute right-[-10%] top-16 -z-0 size-[34rem] rounded-full bg-verm/35 blur-[110px] max-lg:hidden" />
        <div className="relative">
          <h1 className={`${serif} text-[clamp(3.1rem,7.4vw,6.4rem)] leading-[1.04] tracking-[-0.035em]`}>
            Your day to day tool to jobhunt.
          </h1>
          <p className="mt-7 max-w-[34rem] text-[19px] leading-[1.55] text-ink/70">
            Turn class projects, hackathons and internships into a resume recruiters actually read. Rayume
            writes it with you, tailors it to every posting and typesets it in LaTeX.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a href="#" className={primary}>Build my resume</a>
            <a href="#templates" className={`glass ${btn} text-ink hover:bg-white/40`}>See the templates</a>
          </div>
          <p className="mt-5 text-sm text-ink/50">Free while in beta. Sign in with GitHub or Google.</p>
        </div>
        <div className="relative mx-auto w-full max-w-[29rem]">
          <Lens />
        </div>
      </section>

      {/* vermilion band: what counts as experience */}
      <section aria-labelledby="sources" className="relative overflow-hidden bg-verm py-24 text-ink sm:py-32">
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
              <article key={s.from} className={`glass rounded-[28px] p-6 sm:p-7 ${i % 2 ? "md:translate-y-10" : ""}`}>
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
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 size-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-verm/25 blur-[120px]" />
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
        <div className="relative mt-12 overflow-x-auto">
          <table className="w-full min-w-[52rem] table-fixed border-separate border-spacing-0 text-left text-[15px]">
            <colgroup>
              <col className="w-40" />
              <col className="w-32" span={4} />
              <col />
            </colgroup>
            <thead>
              <tr className="text-sm text-ink/55">
                <th scope="col" className="pb-4 font-normal"><span className="sr-only">Tool</span></th>
                <th scope="col" className="pb-4 font-normal">Reads well in ATS</th>
                <th scope="col" className="pb-4 font-normal">Writes it with you</th>
                <th scope="col" className="pb-4 font-normal">Tailors to each job</th>
                <th scope="col" className="pb-4 font-normal">No code</th>
                <th scope="col" className="pb-4 font-normal"><span className="sr-only">Note</span></th>
              </tr>
            </thead>
            <tbody>
              {compare.map((r) => {
                const us = !r.brand;
                // our row: a vermilion outline drawn on the cells (rows can't take a border radius)
                const cell = us ? "border-y-2 border-verm bg-white py-[18px]" : "border-t border-ink/10 py-5";
                return (
                  <Fragment key={r.name}>
                    <tr className={us ? "shadow-[0_18px_44px_-22px_color-mix(in_srgb,var(--color-verm)_75%,transparent)]" : ""}>
                      <th scope="row" className={`${cell} pl-4 ${us ? "rounded-l-2xl border-l-2" : ""} font-medium`}>
                        <span className="inline-flex items-center gap-2.5">
                          {r.brand ? <BrandMark brand={r.brand} className="size-4 text-ink/70" /> : <Mark className="h-5 w-auto text-verm" />}
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
          <div aria-hidden className="pointer-events-none absolute left-1/2 top-[150%] size-[46rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-verm/70 blur-[100px]" />
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
