import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { share } from "../../../share";
import { posts } from "../../posts";
import { ArticlePage } from "../../article";

type Params = PageProps<"/resources/blog/[slug]">["params"];

// Cache Components needs at least one param to validate the route, so with no posts yet a placeholder 404s
export function generateStaticParams() {
  return posts.length ? posts.map((p) => ({ slug: p.slug })) : [{ slug: "none" }];
}

const find = async (params: Params) => {
  const { slug } = await params;
  const i = posts.findIndex((p) => p.slug === slug);
  if (i < 0) notFound();
  return i;
};

export async function generateMetadata({ params }: PageProps<"/resources/blog/[slug]">): Promise<Metadata> {
  const p = posts[await find(params)];
  return share(`${p.title} · Rayume blog`, p.description);
}

// reading params outside <Suspense> would block the navigation; the posts are prerendered, so the fallback barely shows
export default function PostPage({ params }: PageProps<"/resources/blog/[slug]">) {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <Post params={params} />
    </Suspense>
  );
}

async function Post({ params }: { params: Params }) {
  const i = await find(params);
  // newest first, so the previous entry in the list is the newer post
  const newer = posts[i - 1];
  const older = posts[i + 1];
  return (
    <ArticlePage
      article={posts[i]}
      trail={[
        { href: "/resources", label: "Resources" },
        { href: "/resources/blog", label: "Blog" },
      ]}
      prev={older && { href: `/resources/blog/${older.slug}`, title: older.title, label: "Older post" }}
      next={newer && { href: `/resources/blog/${newer.slug}`, title: newer.title, label: "Newer post" }}
    />
  );
}
