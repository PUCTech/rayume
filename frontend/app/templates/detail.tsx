import { readFile } from "node:fs/promises";
import { Suspense } from "react";
import path from "node:path";
import { notFound } from "next/navigation";
import { templates, type Template } from "./data";
import { Detail } from "./panel";

// every template's LaTeX source from resumes/, keyed by file; small enough to hand to the grid whole
export async function sources() {
  "use cache";
  const tex = await Promise.all(templates.map((t) => readFile(path.join(process.cwd(), "resumes", `${t.file}.tex`), "utf8")));
  return Object.fromEntries(templates.map((t, i) => [t.file, tex[i]]));
}

export async function load(id: string) {
  const t: Template | undefined = templates.find((x) => x.file === id);
  if (!t) notFound();
  return { t, tex: (await sources())[t.file] };
}

// the full page streams the template in: reading params outside <Suspense> would block the navigation
export function TemplateDetail({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div className="min-h-[75vh] animate-pulse bg-mist lg:h-full" />}>
      <Loaded params={params} />
    </Suspense>
  );
}

async function Loaded({ params }: { params: Promise<{ id: string }> }) {
  const { t, tex } = await load((await params).id);
  return <Detail t={t} tex={tex} />;
}
