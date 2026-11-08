import type { ReactNode } from "react";
import Link from "next/link";
import { GeistSerifRegular } from "geist/font/serif/regular";
import { legal } from "./info";

const serif = GeistSerifRegular.className;

export type Section = { id: string; title: string; body: ReactNode };

// Long-form styles for legal text, kept in one place so all three documents read the same.
const prose =
  "text-[15px] leading-[1.75] text-ink/80 [&_a]:font-medium [&_a]:text-verm-text [&_a]:underline [&_a]:underline-offset-2 [&_h3]:mt-8 [&_h3]:text-base [&_h3]:font-medium [&_h3]:text-ink [&_li]:mt-2 [&_ol]:mt-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mt-4 [&_strong]:font-medium [&_strong]:text-ink [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-5";

export function LegalDoc({
  title,
  intro,
  summary,
  sections,
}: {
  title: string;
  intro: ReactNode;
  summary: string[];
  sections: Section[];
}) {
  return (
    <article className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-4 pb-24 pt-16 sm:px-6 lg:grid-cols-[14rem_1fr] lg:pt-24">
      <nav aria-label="On this page" className="hidden lg:block">
        <div className="sticky top-28">
          <Link href="/legal" className="text-sm text-ink/50 transition hover:text-ink">
            Legal
          </Link>
          <ol className="mt-4 space-y-2 border-l border-ink/10 text-sm">
            {sections.map((s, i) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="-ml-px block border-l border-transparent py-0.5 pl-4 text-ink/60 transition hover:border-verm hover:text-ink">
                  {i + 1}. {s.title}
                </a>
              </li>
            ))}
          </ol>
        </div>
      </nav>

      <div className="min-w-0 max-w-[44rem]">
        <p className="text-sm text-ink/50">Last updated {legal.updated}</p>
        <h1 className={`${serif} mt-3 text-[clamp(2.6rem,5vw,4rem)] leading-[1.02] tracking-[-0.03em]`}>{title}</h1>
        <div className={`${prose} mt-6 text-lg leading-relaxed`}>{intro}</div>

        <aside aria-label="The short version" className="mt-10 rounded-[28px] bg-mist p-6 sm:p-7">
          <h2 className="font-medium">The short version</h2>
          <ul className="mt-4 space-y-3 text-[15px] leading-relaxed text-ink/80">
            {summary.map((line) => (
              <li key={line} className="flex gap-3">
                <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-verm" />
                {line}
              </li>
            ))}
          </ul>
        </aside>

        {sections.map((s, i) => (
          <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`} className="mt-14 scroll-mt-28">
            <h2 id={`${s.id}-h`} className={`${serif} text-[1.75rem] leading-tight tracking-[-0.02em]`}>
              <span className="mr-3 text-verm">{i + 1}</span>
              {s.title}
            </h2>
            <div className={prose}>{s.body}</div>
          </section>
        ))}
      </div>
    </article>
  );
}

// A plain, readable table for data inventories.
export function Table({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow-[0_1px_2px_rgb(22_27_34/0.08)]">
      <table className="w-full min-w-[36rem] border-collapse text-left text-sm leading-relaxed">
        <thead>
          <tr className="border-b border-ink/10 text-ink">
            {head.map((h) => (
              <th key={h} scope="col" className="px-4 py-3 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-ink/5 align-top last:border-0">
              {r.map((c, j) => (
                <td key={j} className={`px-4 py-3 ${j === 0 ? "font-medium text-ink" : "text-ink/75"}`}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
