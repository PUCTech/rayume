import type { Metadata } from "next";
import Link from "next/link";
import { templates } from "../data";
import { TemplateDetail, load } from "../detail";

export function generateStaticParams() {
  return templates.map((t) => ({ id: t.file }));
}

export async function generateMetadata({ params }: PageProps<"/templates/[id]">): Promise<Metadata> {
  const { t } = await load((await params).id);
  return { title: `${t.name} · Rayume templates`, description: t.abstract };
}

export default function TemplatePage({ params }: PageProps<"/templates/[id]">) {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-6">
      <Link href="/templates" className="text-sm font-medium text-ink/60 transition hover:text-ink">
        ← All templates
      </Link>
      <div className="mt-6 overflow-hidden rounded-[28px] bg-paper shadow-[0_24px_80px_-32px_rgb(22_27_34/0.35)] ring-1 ring-ink/10 lg:h-[calc(100vh-10rem)]">
        <TemplateDetail params={params} />
      </div>
    </div>
  );
}
