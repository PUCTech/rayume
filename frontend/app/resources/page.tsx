import type { Metadata } from "next";
import Link from "next/link";
import { GeistSerifRegular } from "geist/font/serif/regular";
import { share } from "../share";
import { guides } from "./articles";
import { posts } from "./posts";
import { Latest } from "./post-list";

const serif = GeistSerifRegular.className;

export const metadata: Metadata = share(
  "Resources · Rayume",
  "Free guides for your first tech job: writing the resume, getting it past applicant tracking systems, and preparing for the interview.",
);

// The resources index, laid out like a publication's contents page: the guides in the order a job hunt
// needs them, then the newest posts, and no blog section at all until there is a post.
export default function ResourcesIndex() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-16 sm:px-6 lg:pt-24">
      <header className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-end">
        <h1 className={`${serif} text-[clamp(2.6rem,5vw,4rem)] leading-[1.02] tracking-[-0.03em]`}>Resources</h1>
        <p className="max-w-[34rem] text-[19px] leading-[1.55] text-ink/70 lg:justify-self-end">
          Free guides for landing your first tech job, from the first draft of your resume to the last interview. No email required.
        </p>
      </header>

      <section aria-labelledby="guides-h" className="mt-16">
        <h2 id="guides-h" className="text-sm text-ink/60">
          The guides, in the order a job hunt needs them
        </h2>
        <ol className="mt-4 border-t border-ink">
          {guides.map((g, i) => (
            <li key={g.slug} className="border-b border-ink/10">
              <Link
                href={`/resources/${g.slug}`}
                className="group grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-4 gap-y-3 py-8 sm:grid-cols-[4rem_minmax(0,1fr)] lg:grid-cols-[5rem_minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-x-10 lg:py-10"
              >
                <span aria-hidden className={`${serif} text-4xl leading-none text-accent lg:text-5xl`}>
                  {i + 1}
                </span>
                <h3 className={`${serif} text-[clamp(1.9rem,3.4vw,2.75rem)] leading-[1.02] tracking-[-0.025em] decoration-1 underline-offset-[6px] group-hover:underline`}>
                  {g.title}
                </h3>
                <div className="col-start-2 lg:col-start-3">
                  <p className="text-[15px] leading-relaxed text-ink/70">{g.description}</p>
                  <p className="mt-3 text-sm text-ink/55">{g.minutes} min read</p>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <Latest posts={posts} />
    </div>
  );
}
