import { Fragment, type ReactNode } from "react";
import Image from "next/image";
import { GeistSerifRegular } from "geist/font/serif/regular";
import { BrandMark, type Brand } from "./brands";
import { Mark } from "./logo";
import { Lens, Refraction } from "./lens";
import { Nav } from "./nav";

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

const steps: { title: string; body: string; demo: ReactNode }[] = [
  {
    title: "Tell Rayume what you've done",
    body: "In your own words, as messy as you like. It asks follow-up questions and keeps everything in one Master Resume you only write once.",
    demo: (
      <div className="rounded-2xl bg-white p-4 text-sm shadow-[0_1px_2px_rgb(22_27_34/0.08)]">
        <p className="text-ink/45">worked on the uni app team, did the login screen and fixed a bunch of bugs</p>
        <p className="mt-3 rounded-xl bg-paper px-3 py-2 text-ink/80">
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
          You&apos;ll build features in <mark className="rounded bg-verm/15 px-1 text-verm-text">React</mark> and{" "}
          <mark className="rounded bg-verm/15 px-1 text-verm-text">TypeScript</mark>, work closely with design, and{" "}
          <mark className="rounded bg-verm/15 px-1 text-verm-text">explain your work clearly</mark> to the team.
        </p>
        <p className="mt-3 text-xs text-ink/50">3 of 4 requirements matched in your Master Resume</p>
      </div>
    ),
  },
  {
    title: "Download a PDF that gets read",
    body: "Typeset in LaTeX, the format senior engineers swear by, and laid out so applicant tracking systems parse every line.",
    demo: (
      <div className="flex items-center gap-3 rounded-2xl bg-white p-4 text-sm shadow-[0_1px_2px_rgb(22_27_34/0.08)]">
        <span className="grid size-10 place-items-center rounded-xl bg-verm text-xs font-semibold text-white">PDF</span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium">lucas-mendes-orbita.pdf</span>
          <span className="block text-xs text-ink/50">1 page, ready to send</span>
        </span>
        <span className="rounded-full bg-ink px-3 py-1.5 text-xs text-white">Download</span>
      </div>
    ),
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

const footer: [string, string[]][] = [
  ["Product", ["How it works", "Templates", "Browser extension", "Job tailoring"]],
  ["Resources", ["Resume guide", "ATS checklist", "Interview prep", "Blog"]],
  ["Company", ["About", "Team", "Contact", "GitHub"]],
  ["Legal", ["Privacy", "Terms", "Cookies"]],
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

// Real renders of Lucas's resume, compiled from resumes/*.tex: the team's template, four of the
// most used resume templates on Overleaf, and a vermilion variant of ours.
const templates = [
  { name: "Classic", file: "classic", layout: "One column" },
  { name: "Jake's Resume", file: "jake", layout: "One column" },
  { name: "Awesome CV", file: "awesome", layout: "One column" },
  { name: "AltaCV", file: "altacv", layout: "Two column" },
  { name: "moderncv", file: "moderncv", layout: "One column" },
  { name: "Modern", file: "modern", layout: "One column" },
] as const;

const btn = "inline-flex items-center justify-center rounded-full px-6 py-3.5 text-[15px] font-medium transition active:scale-[0.97]";
const primary = `${btn} bg-verm-deep text-white shadow-[0_8px_24px_-8px_rgb(242_84_45/0.7),inset_0_1px_0_rgb(255_255_255/0.25)] hover:bg-[#E5471F]`;

export default function Landing() {
  return (
    <div className="min-h-screen overflow-x-clip bg-paper font-sans text-ink antialiased">
      <Refraction />

      <Nav serif={serif} />

      {/* hero */}
      <section className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 px-4 pb-24 pt-16 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:gap-10 lg:pt-24">
        <div aria-hidden className="pointer-events-none absolute right-[-10%] top-16 -z-0 size-[34rem] rounded-full bg-verm/35 blur-[110px] max-lg:hidden" />
        <div className="relative">
          <h1 className={`${serif} text-[clamp(3.1rem,7.4vw,6.4rem)] leading-[0.94] tracking-[-0.035em]`}>
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
        <Mark className="pointer-events-none absolute -left-40 top-56 h-[34rem] w-auto -rotate-12 text-[#FF7A4D]" />
        <Mark className="pointer-events-none absolute -right-20 bottom-[-6rem] h-[30rem] w-auto rotate-[160deg] text-[#C73A17]" />
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
      <section id="how" aria-labelledby="how-h" className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-4 py-28 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:py-36">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <h2 id="how-h" className={`${serif} text-[clamp(2.4rem,4.6vw,3.8rem)] leading-[1] tracking-[-0.03em]`}>
            Three steps, then you&apos;re applying.
          </h2>
          <p className="mt-5 max-w-sm text-lg leading-relaxed text-ink/65">
            Write your story once. Every application after that takes a couple of minutes.
          </p>
        </div>
        <ol className="space-y-4">
          {steps.map((s, i) => (
            <li key={s.title} className="grid grid-cols-1 items-start gap-5 rounded-[28px] bg-mist p-5 sm:grid-cols-[1fr_1.15fr] sm:gap-6 sm:p-6">
              <div>
                <h3 className="flex items-baseline gap-3 text-lg font-medium tracking-tight">
                  <span className={`${serif} text-3xl leading-none text-verm`}>{i + 1}</span>
                  {s.title}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-ink/65">{s.body}</p>
              </div>
              {s.demo}
            </li>
          ))}
        </ol>
      </section>

      {/* templates */}
      <section id="templates" aria-labelledby="tpl-h" className="relative overflow-hidden bg-mist py-28 lg:py-36">
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 size-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-verm/25 blur-[120px]" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 id="tpl-h" className={`${serif} max-w-xl text-[clamp(2.4rem,4.6vw,3.8rem)] leading-[1] tracking-[-0.03em]`}>
                Every template, already filled in with you.
              </h2>
              <p className="mt-5 max-w-md text-lg leading-relaxed text-ink/65">
                The Overleaf favorites, filled in with your real name, projects and skills. Compare, then switch with one tap.
              </p>
            </div>
            <div role="tablist" aria-label="Filter templates" className="glass flex max-w-full gap-1 self-start overflow-x-auto rounded-full p-1 text-sm md:self-auto">
              {["All", "One column", "Two column"].map((t, i) => (
                <button
                  key={t}
                  role="tab"
                  aria-selected={i === 0}
                  className={`shrink-0 rounded-full px-4 py-2 transition ${i === 0 ? "bg-ink text-white" : "text-ink/70 hover:bg-white/50"}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-14 grid grid-cols-2 gap-5 lg:grid-cols-3">
            {templates.map((t, i) => (
              <figure key={t.file} className={`glass rounded-[26px] p-3 ${i === 1 ? "ring-2 ring-verm" : ""}`}>
                <div className="relative aspect-[8.5/11] overflow-hidden rounded-xl bg-white shadow-[0_1px_2px_rgb(22_27_34/0.08),0_12px_32px_-16px_rgb(22_27_34/0.3)]">
                  <Image
                    src={`/resumes/${t.file}.png`}
                    alt={`Lucas Mendes's resume in the ${t.name} template`}
                    fill
                    sizes="(min-width: 1024px) 360px, 45vw"
                    className="object-cover"
                  />
                </div>
                <figcaption className="flex items-center justify-between px-1.5 pb-1 pt-3 text-sm font-medium">
                  {t.name}
                  {i === 1 ? (
                    <span className="rounded-full bg-verm-deep px-2.5 py-0.5 text-xs text-white">Selected</span>
                  ) : (
                    <span className="text-xs font-normal text-ink/50">{t.layout}</span>
                  )}
                </figcaption>
              </figure>
            ))}
          </div>
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
                    <tr className={us ? "shadow-[0_18px_44px_-22px_rgb(242_84_45/0.75)]" : ""}>
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

      {/* shortcut: footer entries are plain text until their pages exist, then they become links */}
      <footer className="mx-auto max-w-6xl px-4 pb-10 pt-20 text-sm sm:px-6">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-[1.6fr_repeat(4,1fr)]">
          <div className="col-span-2 md:col-span-1">
            <span className="inline-flex items-center gap-2">
              <Mark className="h-6 w-auto" />
              <span className={`${serif} text-[22px] leading-none`}>Rayume</span>
            </span>
            <p className="mt-4 max-w-60 leading-relaxed text-ink/60">Your day to day tool to jobhunt.</p>
          </div>
          {footer.map(([title, items]) => (
            <div key={title}>
              <h3 className="font-medium">{title}</h3>
              <ul className="mt-4 space-y-3 text-ink/60">
                {items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-16 flex flex-col gap-3 border-t border-ink/10 pt-6 text-ink/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Rayume. Made by three students at PUCTech.</p>
          <p>English  |  Português</p>
        </div>
      </footer>
    </div>
  );
}
