import type { Metadata } from "next";
import Link from "next/link";
import { GeistSerifRegular } from "geist/font/serif/regular";
import { share } from "../share";
import { guides } from "./articles";
import { posts } from "./posts";
import { Latest } from "./post-list";
import { HomeButton, TryRayume } from "./article";

const serif = GeistSerifRegular.className;

export const metadata: Metadata = share(
  "Resources · Rayume",
  "Free guides for your first tech job: writing the resume, getting it past applicant tracking systems, and preparing for the interview.",
);

// the hunt in three stages, each saying what the reader walks away with; a guide missing here lands in "More"
const stageList = [
  { name: "Write it", outcome: "A one-page resume, and a GitHub that backs it up.", slugs: ["resume-guide", "github-profile"] },
  { name: "Send it", outcome: "A file that parses, and applications people answer.", slugs: ["ats-checklist", "applications"] },
  { name: "Land it", outcome: "Stories for the interview, and an offer you understand.", slugs: ["interview-prep", "first-offer"] },
];
const placed = stageList.flatMap((s) => s.slugs);
const stages = [
  ...stageList.map((s) => ({ ...s, guides: guides.filter((g) => s.slugs.includes(g.slug)) })),
  { name: "More", outcome: "", guides: guides.filter((g) => !placed.includes(g.slug)) },
].filter((s) => s.guides.length);

// The resources index, laid out like a publication's contents page: the guides by stage of the hunt, then
// the newest posts (no blog section at all until there is a post), then the call to try Rayume.
export default function ResourcesIndex() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-16 sm:px-6 lg:pt-24">
      <header className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-end">
        <div>
          <HomeButton />
          <h1 className={`${serif} mt-4 text-[clamp(2.25rem,4vw,3.25rem)] leading-[1.02] tracking-[-0.03em]`}>Resources</h1>
        </div>
        <p className="max-w-[34rem] text-[19px] leading-[1.55] text-ink/70 lg:justify-self-end">
          Free guides for landing your first tech job, from the first draft of your resume to the last interview. No email required.
        </p>
      </header>

      <section aria-labelledby="guides-h" className="mt-16">
        <h2 id="guides-h" className="sr-only">
          Guides
        </h2>
        {stages.map((st) => (
          <div key={st.name} className="grid grid-cols-1 gap-x-10 border-t border-ink pt-6 lg:grid-cols-[13rem_minmax(0,1fr)] lg:pt-8 [&+&]:mt-10">
            <div>
              <h3 className={`${serif} text-xl leading-tight`}>{st.name}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink/60">{st.outcome}</p>
            </div>
            <ol className="mt-2 divide-y divide-ink/10 lg:-mt-6">
              {st.guides.map((g) => {
                const i = guides.indexOf(g);
                return (
                  <li key={g.slug}>
                    <Link
                      href={`/resources/${g.slug}`}
                      className="group grid grid-cols-[2rem_minmax(0,1fr)] gap-x-4 gap-y-2 py-6 lg:grid-cols-[2.5rem_minmax(0,1fr)_minmax(0,1fr)] lg:gap-x-8"
                    >
                      <span aria-hidden className="pt-1 text-sm font-medium tabular-nums text-accent-text">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h4 className={`${serif} text-2xl leading-[1.15] tracking-[-0.015em] decoration-1 underline-offset-4 group-hover:underline`}>{g.title}</h4>
                      <div className="col-start-2 lg:col-start-3">
                        <p className="text-[15px] leading-relaxed text-ink/70">{g.description}</p>
                        <p className="mt-3 flex flex-wrap items-center gap-3 text-sm text-ink/55">
                          {i === 0 && <span className="rounded-full bg-accent-deep px-2.5 py-0.5 text-xs text-white">Start here</span>}
                          {g.minutes} min read
                        </p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </div>
        ))}
      </section>

      <Latest posts={posts} />

      <TryRayume className="mt-24" />
    </div>
  );
}
