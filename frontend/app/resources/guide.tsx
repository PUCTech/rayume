import type { Metadata } from "next";
import { share } from "../share";
import { guides } from "./articles";
import { posts } from "./posts";
import { ArticlePage } from "./article";

// Each guide has its own static route folder (no params to wait on, so the page is fully prerendered);
// these two build its metadata and page from the guide with that slug, linking its neighbours in `guides`.
const at = (slug: string) => {
  const i = guides.findIndex((g) => g.slug === slug);
  if (i < 0) throw new Error(`No guide with slug "${slug}" in articles/index.ts`);
  return i;
};

export const guideMeta = (slug: string): Metadata => {
  const g = guides[at(slug)];
  return share(`${g.title} · Rayume`, g.description);
};

export function Guide({ slug }: { slug: string }) {
  const i = at(slug);
  const prev = guides[i - 1];
  const next = guides[i + 1];
  return (
    <ArticlePage
      article={guides[i]}
      trail={[{ href: "/resources", label: "Resources" }]}
      prev={prev && { href: `/resources/${prev.slug}`, title: prev.title, label: "Previous guide" }}
      // the last guide hands over to the blog, so the series never ends on a dead end
      next={
        next
          ? { href: `/resources/${next.slug}`, title: next.title, label: "Next guide" }
          : posts.length
            ? { href: "/resources/blog", title: "Read the blog", label: "That was the last guide" }
            : undefined
      }
    />
  );
}
