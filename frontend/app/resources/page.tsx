import type { Metadata } from "next";
import Link from "next/link";
import { GeistSerifRegular } from "geist/font/serif/regular";
import { share } from "../share";
import { guides } from "./articles";
import { posts } from "./posts";
import { Latest } from "./post-list";
import { day, primary, prose, TryRayume } from "./article";
import { rise } from "./motion/rise";
import "./motion/motion.css";

const serif = GeistSerifRegular.className;

export const metadata: Metadata = share(
  "Resources · Rayume",
  "Free guides for your first tech job: writing the resume, getting it past applicant tracking systems, and preparing for the interview.",
);

const first = guides[0];
// the opening the preview shows; the rest fades out
const opening = first.sections.slice(0, 2);

// The resources index: the first guide's opening beside the list of every guide, then the newest posts
// (no blog section at all until there is a post), then the call to try Rayume.
export default function ResourcesIndex() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-16 sm:px-6 lg:pt-24">
      {/* phone: the preview, then the list; desktop: the list as a sticky sidebar left of the preview */}
      <div className="grid grid-cols-1 gap-x-16 gap-y-16 lg:grid-cols-[15rem_minmax(0,1fr)]">
        {/* the guides are read in order, so the page opens on the first one: its header and opening, fading out
            into the link to read on */}
        <article
          aria-labelledby="first-h"
          className="min-w-0 lg:col-start-2 lg:row-start-1"
        >
          <h1 className={`${rise} text-sm font-medium text-ink/55`}>
            Resources
          </h1>
          <h2
            id="first-h"
            className={`${serif} ${rise} mt-3 max-w-[48rem] text-[clamp(2.1rem,4.4vw,3.5rem)] leading-[1.04] tracking-[-0.03em]`}
          >
            {first.title}
          </h2>
          <p
            className={`${rise} mt-6 max-w-[40rem] text-[19px] leading-[1.55] text-ink/75 motion-safe:delay-150`}
          >
            {first.description}
          </p>
          <p
            className={`${rise} mt-6 flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink/55 motion-safe:delay-200`}
          >
            <span>By {first.author}</span>
            <span>
              Updated <time dateTime={first.updated}>{day(first.updated)}</time>
            </span>
            <span>{first.minutes} min read</span>
          </p>
          {/* the opening sections, capped and masked into the paper; source marks are hidden because the sources
              they point to live on the guide's own page */}
          <div
            className={`${rise} mt-10 max-h-[34rem] max-w-[44rem] overflow-hidden [mask-image:linear-gradient(to_bottom,black_55%,transparent)] motion-safe:delay-300 lg:max-h-[44rem]`}
          >
            {opening.map((sec, k) => (
              <section
                key={sec.id}
                aria-labelledby={`${sec.id}-h`}
                className={k ? "mt-12" : ""}
              >
                <h3
                  id={`${sec.id}-h`}
                  className={`${serif} text-[1.75rem] leading-tight tracking-[-0.02em]`}
                >
                  {sec.title}
                </h3>
                <div className={`${prose} lg:text-[17px] [&_sup]:hidden`}>
                  {sec.body}
                </div>
              </section>
            ))}
          </div>
          <Link href={`/resources/${first.slug}`} className={`${primary} mt-2`}>
            Read the guide
          </Link>
        </article>

        <nav
          aria-labelledby="guides-h"
          className="lg:sticky lg:top-28 lg:col-start-1 lg:row-start-1 lg:self-start"
        >
          <h2 id="guides-h" className={`${serif} text-xl leading-tight`}>
            All guides
          </h2>
          <ol className="mt-4 border-t border-ink">
            {guides.map((g, i) => {
              return (
                // staggered in on load, in reading order
                <li
                  key={g.slug}
                  className={`${rise} border-b border-ink/10`}
                  style={{ animationDelay: `${300 + i * 70}ms` }}
                >
                  {/* hover or focus: a mist panel settles behind the row, the number steps forward, the title
                          underlines. The previewed guide keeps its panel */}
                  <Link
                    href={`/resources/${g.slug}`}
                    className={`group relative isolate grid min-h-11 grid-cols-[1.75rem_minmax(0,1fr)] gap-x-2 py-3 before:absolute before:-inset-x-3 before:inset-y-1 before:-z-10 before:rounded-2xl before:bg-mist before:transition-opacity before:duration-300 hover:before:opacity-100 focus-visible:before:opacity-100 motion-reduce:before:transition-none ${i === 0 ? "" : "before:opacity-0"}`}
                  >
                    <span
                      aria-hidden
                      className="pt-0.5 text-sm font-medium tabular-nums text-accent-text transition-transform duration-300 ease-out motion-safe:group-hover:translate-x-0.5 motion-safe:group-focus-visible:translate-x-0.5"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-balance text-[15px] font-medium leading-snug">
                        <span className="draw-line">{g.title}</span>
                      </span>
                      <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink/55">
                        {i === 0 && (
                          <span
                            data-cue
                            className="relative rounded-full bg-accent-deep px-2 py-0.5 text-white"
                          >
                            Start here
                          </span>
                        )}
                        {g.minutes} min read
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>

      <Latest posts={posts} />

      <TryRayume className="mt-24" />
    </div>
  );
}
