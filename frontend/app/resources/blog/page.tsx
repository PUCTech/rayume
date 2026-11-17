import type { Metadata } from "next";
import Link from "next/link";
import { GeistSerifRegular } from "geist/font/serif/regular";
import { share } from "../../share";
import { guides } from "../articles";
import { posts } from "../posts";
import { PostList } from "../post-list";

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
          <Link href="/resources" className="text-sm font-medium text-ink/55 transition hover:text-ink">
            Resources
          </Link>
          <h1 className={`${serif} mt-4 text-[clamp(2.6rem,5vw,4rem)] leading-[1.02] tracking-[-0.03em]`}>Blog</h1>
        </div>
        <p className="max-w-[34rem] text-[19px] leading-[1.55] text-ink/70 lg:justify-self-end">
          Shorter notes on resumes, applicant tracking systems and the hiring side of tech, newest first.
        </p>
      </header>

      <div className="mt-14 max-w-4xl">
        {posts.length ? (
          <PostList posts={posts} />
        ) : (
          <section aria-labelledby="empty-h" className="rounded-[28px] bg-mist p-6 sm:p-8">
            <h2 id="empty-h" className="font-medium">
              No posts yet
            </h2>
            <p className="mt-2 max-w-[34rem] text-[15px] leading-relaxed text-ink/70">
              The first ones are being written. Until then, the guides cover the whole hunt.
            </p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {guides.map((g) => (
                <li key={g.slug}>
                  <Link href={`/resources/${g.slug}`} className="inline-flex min-h-11 items-center rounded-full bg-paper px-5 text-[15px] font-medium text-ink transition hover:bg-white">
                    {g.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
