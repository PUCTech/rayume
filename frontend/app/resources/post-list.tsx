import Link from "next/link";
import { GeistSerifRegular } from "geist/font/serif/regular";
import type { Article } from "./content";
import { day } from "./article";

const serif = GeistSerifRegular.className;

// a column of posts as rows: date, title, description; the blog page shows the date in its own column
export function PostList({ posts, compact = false }: { posts: Article[]; compact?: boolean }) {
  return (
    <ul className={`divide-y divide-ink/10 ${compact ? "-mt-6" : "border-t border-ink"}`}>
      {posts.map((p) => (
        <li key={p.slug}>
          <Link href={`/resources/blog/${p.slug}`} className={`group grid gap-2 py-6 ${compact ? "" : "sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-8"}`}>
            <time dateTime={p.updated} className="text-sm text-ink/55 sm:pt-1">
              {day(p.updated)}
            </time>
            <span className="min-w-0">
              <span className={`${serif} block text-2xl leading-tight tracking-[-0.015em] decoration-1 underline-offset-4 group-hover:underline`}>{p.title}</span>
              <span className={`mt-2 block text-[15px] leading-relaxed text-ink/70 ${compact ? "line-clamp-2" : ""}`}>{p.description}</span>
              {!compact && <span className="mt-3 block text-sm text-ink/55">{p.minutes} min read</span>}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

// the index's blog section: the newest post as the lead, up to three more beside it, nothing without posts
export function Latest({ posts }: { posts: Article[] }) {
  const [lead, ...more] = posts;
  const rest = more.slice(0, 3);
  if (!lead) return null;
  return (
    <section aria-labelledby="blog-h" className="mt-24">
      <div className="flex items-end justify-between gap-6">
        <h2 id="blog-h" className={`${serif} text-[clamp(2.2rem,4vw,3rem)] leading-none tracking-[-0.03em]`}>
          From the blog
        </h2>
        <Link href="/resources/blog" className="inline-flex min-h-11 items-center text-sm font-medium text-accent-text underline underline-offset-2">
          All posts
        </Link>
      </div>
      <div className={`mt-6 grid grid-cols-1 gap-10 border-t border-ink pt-8 ${rest.length ? "lg:grid-cols-[1.2fr_1fr]" : ""}`}>
        <Link href={`/resources/blog/${lead.slug}`} className="group flex flex-col rounded-[28px] bg-mist p-6 sm:p-8">
          <time dateTime={lead.updated} className="text-sm text-ink/55">
            {day(lead.updated)}
          </time>
          <h3 className={`${serif} mt-4 max-w-xl text-[clamp(1.75rem,3vw,2.4rem)] leading-[1.05] tracking-[-0.02em] decoration-1 underline-offset-[6px] group-hover:underline`}>
            {lead.title}
          </h3>
          <p className="mt-4 max-w-[34rem] text-[15px] leading-relaxed text-ink/70">{lead.description}</p>
          <p className="mt-6 text-sm text-ink/55 lg:mt-auto lg:pt-6">{lead.minutes} min read</p>
        </Link>
        {rest.length > 0 && <PostList posts={rest} compact />}
      </div>
    </section>
  );
}
