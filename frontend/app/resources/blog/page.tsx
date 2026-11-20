import type { Metadata } from "next";
import Link from "next/link";
import { GeistSerifRegular } from "geist/font/serif/regular";
import { share } from "../../share";
import { guides } from "../articles";
import { posts } from "../posts";
import { PostList } from "../post-list";
import { Crumbs } from "../article";
import { rise } from "../motion/rise";

const serif = GeistSerifRegular.className;

export const metadata: Metadata = share(
  "Blog · Rayume",
  "Notes from the Rayume team on resumes, applicant tracking systems and getting hired for your first tech job.",
);

export default function Blog() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-16 sm:px-6 lg:pt-24">
      <header className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-end">
        <div>
          <Crumbs trail={[{ href: "/resources", label: "Resources" }]} />
          <h1 className={`${serif} ${rise} mt-2 text-[clamp(2.25rem,4vw,3.25rem)] leading-[1.02] tracking-[-0.03em]`}>Blog</h1>
        </div>
        <p className={`${rise} max-w-[34rem] text-[19px] leading-[1.55] text-ink/70 motion-safe:delay-150 lg:justify-self-end`}>
          Shorter notes on resumes, applicant tracking systems and the hiring side of tech, newest first.
        </p>
      </header>

      {posts.length > 0 && (
        <div className="mt-14">
          <PostList posts={posts} />
        </div>
      )}

      {/* the way back to the long-form half of resources; with no posts yet it is the whole page */}
      <section aria-labelledby="guides-h" className="mt-16 rounded-[28px] bg-mist p-6 sm:p-8">
        <h2 id="guides-h" className="font-medium">
          {posts.length ? "Start with the guides" : "No posts yet"}
        </h2>
        {!posts.length && (
          <p className="mt-2 max-w-[34rem] text-[15px] leading-relaxed text-ink/70">
            The first ones are being written. Until then, the guides cover the whole hunt.
          </p>
        )}
        <ol className="mt-5 flex flex-wrap gap-2">
          {guides.map((g, i) => (
            <li key={g.slug}>
              <Link href={`/resources/${g.slug}`} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-paper px-5 text-[15px] font-medium text-ink transition hover:bg-white">
                <span aria-hidden className={`${serif} text-accent-text`}>
                  {i + 1}
                </span>
                {g.title}
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
