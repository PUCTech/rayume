import { GeistSerifRegular } from "geist/font/serif/regular";
import Link from "next/link";
import type { Template } from "./data";
import { Viewer } from "./viewer";

const serif = GeistSerifRegular.className;

// a template's PDF/code viewer and its details, led by the one thing to do here: use it; the full page and
// the grid's drawer both render it
// shortcut: Use this template goes to signup with the template in the URL, which signup doesn't read yet;
// start a resume in it (POST /resumes with template) once there's a session.
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
        <ul aria-label="What it's like" className="mt-4 flex flex-wrap gap-1.5">
          {[t.ats ? "ATS-friendly" : "Two columns can confuse ATS", t.color, t.density].map((f) => (
            <li key={f} className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-ink/70 ring-1 ring-ink/10">
              {f}
            </li>
          ))}
        </ul>
        <div className="mt-6 flex flex-col gap-2.5">
          <Link
            href={`/signup?template=${t.file}`}
            className="inline-flex items-center justify-center rounded-full bg-accent-deep px-5 py-3 text-[15px] font-medium text-white shadow-[0_8px_24px_-8px_color-mix(in_srgb,var(--color-accent)_70%,transparent),inset_0_1px_0_rgb(255_255_255/0.25)] transition hover:bg-[color-mix(in_oklab,var(--color-accent)_45%,var(--color-accent-deep))] active:scale-[0.97]"
          >
            Use this template
          </Link>
          <a href={`/resumes/${t.file}.pdf`} download className="inline-flex items-center justify-center rounded-full px-5 py-3 text-[15px] font-medium text-ink/75 ring-1 ring-ink/10 transition hover:text-ink hover:ring-ink/25">
            Download PDF
          </a>
        </div>
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
