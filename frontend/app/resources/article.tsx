import Link from "next/link";
import { GeistSerifRegular } from "geist/font/serif/regular";
import { prose as base } from "../prose";
import type { Article } from "./content";
import { Toc } from "./toc";
import { FollowGlow } from "./motion-article/follow-glow";

const serif = GeistSerifRegular.className;

// the legal pages' long-form style, plus the elements guides use and legal text doesn't
export const prose = `${base} [&_em]:italic [&_blockquote]:mt-6 [&_blockquote]:border-l-2 [&_blockquote]:border-ink/20 [&_blockquote]:pl-5 [&_blockquote]:text-ink [&_code]:rounded-md [&_code]:bg-mist [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.88em] [&_code]:text-ink [&_table]:mt-6 [&_table]:block [&_table]:max-w-full [&_table]:overflow-x-auto [&_table]:text-sm [&_th]:border-b [&_th]:border-ink/15 [&_th]:py-2 [&_th]:pr-5 [&_th]:text-left [&_th]:align-bottom [&_th]:font-medium [&_th]:text-ink [&_td]:border-b [&_td]:border-ink/5 [&_td]:py-2 [&_td]:pr-5 [&_td]:align-top`;

const btn = "inline-flex items-center justify-center rounded-full px-6 py-3.5 text-[15px] font-medium transition active:scale-[0.97]";
export const primary = `${btn} bg-accent-deep text-white shadow-[0_8px_24px_-8px_color-mix(in_srgb,var(--color-accent)_70%,transparent),inset_0_1px_0_rgb(255_255_255/0.25)] hover:bg-[color-mix(in_oklab,var(--color-accent)_45%,var(--color-accent-deep))]`;

// "2026-11-17" as "November 17, 2026", read as a calendar day so no time zone moves it
export const day = (d: string) =>
  new Date(`${d}T00:00:00Z`).toLocaleDateString("en-US", { timeZone: "UTC", month: "long", day: "numeric", year: "numeric" });

type Crumb = { href: string; label: string };
type Neighbour = Crumb & { title: string };

// where the page sits, as links up to the resources index; the page itself isn't repeated
export function Crumbs({ trail }: { trail: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="print:hidden">
      <ol className="flex flex-wrap items-center gap-x-2 text-sm font-medium text-ink/55">
        {trail.map((t, i) => (
          <li key={t.href} className="flex items-center gap-2">
            {i > 0 && <span aria-hidden className="text-ink/30">/</span>}
            <Link href={t.href} className="inline-flex min-h-11 items-center transition hover:text-ink">
              {t.label}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}

// One page for a guide or a blog post: header, contents, sections, sources, what to read next, a call to try Rayume.
export function ArticlePage({ article: a, trail, prev, next }: { article: Article; trail: Crumb[]; prev?: Neighbour; next?: Neighbour }) {
  const toc = [...a.sections.map((s) => ({ id: s.id, title: s.title })), ...(a.sources?.length ? [{ id: "sources", title: "Sources" }] : [])];

  return (
    <article className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-4 pb-24 pt-16 sm:px-6 lg:grid-cols-[14rem_1fr] lg:pt-24 print:block print:pt-0">
      <Toc items={toc} />

      <div className="min-w-0 max-w-[44rem]">
        <Crumbs trail={trail} />
        <h1 className={`${serif} mt-2 text-[clamp(2.1rem,3.6vw,3rem)] leading-[1.05] tracking-[-0.03em]`}>{a.title}</h1>
        <p className="mt-6 text-[19px] leading-[1.55] text-ink/75">{a.description}</p>
        <p className="mt-6 flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink/55">
          <span>By {a.author}</span>
          <span>
            Updated <time dateTime={a.updated}>{day(a.updated)}</time>
          </span>
          <span>{a.minutes} min read</span>
        </p>

        {/* the side contents is desktop only, so smaller screens get it folded here */}
        {toc.length > 1 && (
          <details className="group mt-10 rounded-[28px] ring-1 ring-ink/10 lg:hidden print:hidden">
            <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between px-6 font-medium [&::-webkit-details-marker]:hidden">
              On this page
              <span aria-hidden className="text-ink/45 transition group-open:rotate-45">+</span>
            </summary>
            <ol className="px-6 pb-4 text-[15px]">
              {toc.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="block py-2 text-ink/70 transition hover:text-ink">
                    {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </details>
        )}

        {a.sections.map((s) => (
          // the section is named by the title alone, so the anchor's label doesn't end up in it
          <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`} className="group/s mt-14 scroll-mt-28">
            <h2 className={`${serif} relative text-[1.75rem] leading-tight tracking-[-0.02em]`}>
              <span id={`${s.id}-h`}>{s.title}</span>
              {/* a link to share this section, in the margin on desktop (hover or focus) so it never wraps the title; touch has no hover */}
              <a
                href={`#${s.id}`}
                aria-label={`Link to ${s.title}`}
                className="absolute -left-7 top-0.5 hidden font-sans text-xl text-ink/30 opacity-0 lg:block transition hover:text-accent-text focus-visible:opacity-100 group-hover/s:opacity-100 print:hidden"
              >
                #
              </a>
            </h2>
            <div className={prose}>{s.body}</div>
          </section>
        ))}

        {a.sources?.length ? (
          <section id="sources" aria-labelledby="sources-h" className="mt-16 scroll-mt-28 border-t border-ink/10 pt-8">
            <h2 id="sources-h" className="font-medium">
              Sources
            </h2>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-ink/70 marker:text-ink/45">
              {a.sources.map((s, i) => (
                <li key={s.url} id={`source-${i + 1}`} className="scroll-mt-28 rounded-lg pl-1 target:bg-accent/10">
                  <a href={s.url} rel="noopener noreferrer" className="font-medium text-accent-text underline underline-offset-2 wrap-anywhere">
                    {s.title}
                  </a>
                  , {s.publisher}
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        {(prev || next) && (
          <nav aria-label="Keep reading" className="mt-16 grid grid-cols-1 gap-3 sm:grid-cols-2 print:hidden">
            {[prev, next].map(
              (n, i) =>
                n && (
                  <Link
                    key={n.href}
                    href={n.href}
                    // lifts on hover, and the title leans the way the link goes (back for previous, on for next)
                    className={`group rounded-[26px] bg-mist p-5 ring-1 ring-transparent transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_32px_-20px_rgb(22_27_34/0.35)] hover:ring-ink/15 motion-reduce:hover:translate-y-0 sm:p-6 ${i === 1 ? "sm:col-start-2 sm:text-right" : ""}`}
                  >
                    <span className="block text-sm text-ink/55">{n.label}</span>
                    <span
                      className={`mt-1 block font-medium transition-transform duration-300 group-hover:underline group-hover:underline-offset-4 ${i === 1 ? "motion-safe:group-hover:translate-x-1" : "motion-safe:group-hover:-translate-x-1"}`}
                    >
                      {n.title}
                    </span>
                  </Link>
                ),
            )}
          </nav>
        )}
        <TryRayume className="mt-10" />
      </div>
    </article>
  );
}

// the closing call to try Rayume, shared by every article and the resources index
export function TryRayume({ className = "" }: { className?: string }) {
  return (
    <aside aria-labelledby="try-h" data-theme="light" className={`relative overflow-hidden rounded-[28px] bg-ink px-6 py-12 text-white sm:px-10 print:hidden ${className}`}>
      <FollowGlow />
      <h2 id="try-h" className={`${serif} relative max-w-md text-[clamp(1.6rem,2.8vw,2.1rem)] leading-[1.1] tracking-[-0.02em]`}>
        Skip the blank page.
      </h2>
      <p className="relative mt-4 max-w-md text-white/70">
        Tell Rayume what you did, in your own words. It writes the bullets, sets them in a template that parses, and tailors them to each job.
      </p>
      <Link href="/signup" className={`${primary} relative mt-8`}>
        Build my resume
      </Link>
    </aside>
  );
}
