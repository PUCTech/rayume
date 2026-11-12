import { GeistSerifRegular } from "geist/font/serif/regular";
import type { Template } from "./data";
import { Viewer } from "./viewer";

const serif = GeistSerifRegular.className;

// a template's PDF/code viewer and its details; the full page and the grid's drawer both render it
export function Detail({ t, tex }: { t: Template; tex: string }) {
  const facts = [
    ["Author", t.author],
    ["Last updated", t.updated],
    ["License", t.license],
  ].filter(([, v]) => v);

  return (
    <div className="flex flex-col lg:h-full lg:flex-row">
      <Viewer file={t.file} name={t.name} tex={tex} />
      <aside className="shrink-0 border-t border-ink/10 p-6 lg:w-80 lg:overflow-y-auto lg:border-l lg:border-t-0 lg:p-8">
        <h1 id="tpl-title" className={`${serif} text-3xl lg:pr-12 leading-tight tracking-[-0.02em]`}>
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
        <p className="mt-2 max-w-prose text-[15px] leading-relaxed text-ink/75">{t.abstract}</p>
      </aside>
    </div>
  );
}
