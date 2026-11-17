import Link from "next/link";
import { GeistSerifRegular } from "geist/font/serif/regular";
import { prose as base } from "../prose";
import type { Article } from "./content";

const serif = GeistSerifRegular.className;

// the legal pages' long-form style, plus the elements guides use and legal text doesn't
const prose = `${base} [&_em]:italic [&_blockquote]:mt-6 [&_blockquote]:border-l-2 [&_blockquote]:border-ink/20 [&_blockquote]:pl-5 [&_blockquote]:text-ink [&_code]:rounded-md [&_code]:bg-mist [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.88em] [&_code]:text-ink [&_table]:mt-6 [&_table]:block [&_table]:max-w-full [&_table]:overflow-x-auto [&_table]:text-sm [&_th]:border-b [&_th]:border-ink/15 [&_th]:py-2 [&_th]:pr-5 [&_th]:text-left [&_th]:align-bottom [&_th]:font-medium [&_th]:text-ink [&_td]:border-b [&_td]:border-ink/5 [&_td]:py-2 [&_td]:pr-5 [&_td]:align-top`;

const btn = "inline-flex items-center justify-center rounded-full px-6 py-3.5 text-[15px] font-medium transition active:scale-[0.97]";
const primary = `${btn} bg-accent-deep text-white shadow-[0_8px_24px_-8px_color-mix(in_srgb,var(--color-accent)_70%,transparent),inset_0_1px_0_rgb(255_255_255/0.25)] hover:bg-[color-mix(in_oklab,var(--color-accent)_45%,var(--color-accent-deep))]`;

// "2026-11-17" as "November 17, 2026", read as a calendar day so no time zone moves it
export const day = (d: string) =>
  new Date(`${d}T00:00:00Z`).toLocaleDateString("en-US", { timeZone: "UTC", month: "long", day: "numeric", year: "numeric" });

type Neighbour = { href: string; title: string; label: string };

// One page for a guide or a blog post: header, contents, sections, sources, a call to try Rayume, neighbours.
export function ArticlePage({ article: a, back, prev, next }: { article: Article; back: { href: string; label: string }; prev?: Neighbour; next?: Neighbour }) {
  const toc = [...a.sections.map((s) => ({ id: s.id, title: s.title })), ...(a.sources?.length ? [{ id: "sources", title: "Sources" }] : [])];

  return (
    <article className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-4 pb-24 pt-16 sm:px-6 lg:grid-cols-[14rem_1fr] lg:pt-24">
      <nav aria-label="On this page" className="hidden lg:block">
        <div className="sticky top-28 max-h-[calc(100dvh-8rem)] overflow-y-auto">
          <p className="text-sm text-ink/50">On this page</p>
          <ol className="mt-4 space-y-2 border-l border-ink/10 text-sm">
            {toc.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="-ml-px block border-l border-transparent py-0.5 pl-4 text-ink/60 transition hover:border-accent hover:text-ink">
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </div>
      </nav>

      <div className="min-w-0 max-w-[44rem]">
        <Link href={back.href} className="text-sm font-medium text-ink/55 transition hover:text-ink">
          {back.label}
        </Link>
        <h1 className={`${serif} mt-4 text-[clamp(2.6rem,5vw,4rem)] leading-[1.02] tracking-[-0.03em]`}>{a.title}</h1>
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
          <details className="group mt-10 rounded-[28px] ring-1 ring-ink/10 lg:hidden">
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
          <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`} className="mt-14 scroll-mt-28">
            <h2 id={`${s.id}-h`} className={`${serif} text-[1.75rem] leading-tight tracking-[-0.02em]`}>
              {s.title}
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

        <aside aria-labelledby="try-h" className="relative mt-16 overflow-hidden rounded-[28px] bg-ink px-6 py-12 text-white sm:px-10">
          <div aria-hidden className="pointer-events-none absolute -bottom-48 left-1/2 size-[30rem] -translate-x-1/2 rounded-full bg-accent/60 blur-[100px]" />
          <h2 id="try-h" className={`${serif} relative max-w-md text-[clamp(1.9rem,3.6vw,2.6rem)] leading-[1.05] tracking-[-0.02em]`}>
            Skip the blank page.
          </h2>
          <p className="relative mt-4 max-w-md text-white/70">
            Tell Rayume what you did, in your own words. It writes the bullets, sets them in a template that parses, and tailors them to each job.
          </p>
          <Link href="/signup" className={`${primary} relative mt-8`}>
            Build my resume
          </Link>
        </aside>

        {(prev || next) && (
          <nav aria-label="Keep reading" className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[prev, next].map(
              (n, i) =>
                n && (
                  <Link
                    key={n.href}
                    href={n.href}
                    className={`group rounded-[26px] bg-mist p-5 transition ring-1 ring-transparent hover:ring-ink/15 sm:p-6 ${i === 1 ? "sm:col-start-2 sm:text-right" : ""}`}
                  >
                    <span className="block text-sm text-ink/55">{n.label}</span>
                    <span className="mt-1 block font-medium group-hover:underline group-hover:underline-offset-4">{n.title}</span>
                  </Link>
                ),
            )}
          </nav>
        )}
      </div>
    </article>
  );
}
