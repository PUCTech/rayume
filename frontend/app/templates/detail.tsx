import { readFile } from "node:fs/promises";
import { Suspense } from "react";
import path from "node:path";
import { notFound } from "next/navigation";
import { GeistSerifRegular } from "geist/font/serif/regular";
import { templates, type Template } from "./data";
import { Viewer } from "./viewer";

const serif = GeistSerifRegular.className;

// shared by the full page and the drawer: the template plus its LaTeX source from resumes/
export async function load(id: string) {
  "use cache";
  const t: Template | undefined = templates.find((x) => x.file === id);
  if (!t) notFound();
  const tex = await readFile(path.join(process.cwd(), "resumes", `${t.file}.tex`), "utf8");
  return { t, tex };
}

// Both routes stream the template in: reading params outside <Suspense> would block the navigation.
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

function Detail({ t, tex }: { t: Template; tex: string }) {
  const facts = [
    ["Author", t.author],
    ["Last updated", t.updated],
    ["License", t.license],
  ].filter(([, v]) => v);

  return (
    <div className="flex flex-col lg:h-full lg:flex-row">
      <Viewer file={t.file} name={t.name} tex={tex} />
      <aside className="shrink-0 border-t border-ink/10 p-6 lg:w-80 lg:overflow-y-auto lg:border-l lg:border-t-0 lg:p-8">
        <h1 id="tpl-title" className={`${serif} pr-12 text-3xl leading-tight tracking-[-0.02em]`}>
          {t.name}
        </h1>
        <p className="mt-2 text-sm text-ink/55">
          {t.layout} · {t.source}
        </p>
        <dl className="mt-8 space-y-4 text-sm">
          {facts.map(([k, v]) => (
            <div key={k}>
              <dt className="text-xs font-medium uppercase tracking-wide text-ink/50">{k}</dt>
              <dd className="mt-1">{v}</dd>
            </div>
          ))}
        </dl>
        <h2 className="mt-8 text-xs font-medium uppercase tracking-wide text-ink/50">Abstract</h2>
        <p className="mt-2 text-[15px] leading-relaxed text-ink/75">{t.abstract}</p>
      </aside>
    </div>
  );
}
