import Link from "next/link";
import { Mark } from "./logo";

// shortcut: entries without an href are plain text until their pages exist, then they become links
const columns: [string, [string, string?][]][] = [
  ["Product", [["How it works", "/#how"], ["Templates", "/#templates"], ["Browser extension"], ["Job tailoring"]]],
  ["Resources", [["Resume guide"], ["ATS checklist"], ["Interview prep"], ["Blog"]]],
  ["Company", [["About"], ["Team"], ["Contact"], ["GitHub"]]],
  ["Legal", [["Privacy", "/legal/privacy"], ["Terms", "/legal/terms"], ["Cookies", "/legal/cookies"]]],
];

export function Footer({ serif }: { serif: string }) {
  return (
    <footer className="mx-auto max-w-6xl px-4 pb-10 pt-20 text-sm sm:px-6">
      <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-[1.6fr_repeat(4,1fr)]">
        <div className="col-span-2 md:col-span-1">
          <Link href="/" className="inline-flex items-center gap-2" aria-label="Rayume home">
            <Mark className="h-6 w-auto" />
            <span className={`${serif} text-[22px] leading-none`}>Rayume</span>
          </Link>
          <p className="mt-4 max-w-60 leading-relaxed text-ink/60">Your day to day tool to jobhunt.</p>
        </div>
        {columns.map(([title, items]) => (
          <div key={title}>
            <h3 className="font-medium">{title}</h3>
            <ul className="mt-4 space-y-3 text-ink/60">
              {items.map(([label, href]) => (
                <li key={label}>
                  {href ? (
                    <Link href={href} className="transition hover:text-ink">
                      {label}
                    </Link>
                  ) : (
                    label
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-16 flex flex-col gap-3 border-t border-ink/10 pt-6 text-ink/50 sm:flex-row sm:items-center sm:justify-between">
        <p>© 2026 Rayume. Made by three students at PUCTech.</p>
        <p>English  |  Português</p>
      </div>
    </footer>
  );
}
