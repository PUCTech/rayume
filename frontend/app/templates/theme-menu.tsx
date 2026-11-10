"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

type Palette = { bg: string; command: string; brace: string };

// Slides its children open beside the PDF/Code switch, to their real width: a grid column from 0fr
// to 1fr eases all the way, where a max-width guess stops dead partway. Inert while closed.
export function Reveal({ show, children }: { show: boolean; children: ReactNode }) {
  return (
    <div
      inert={!show}
      className={`grid transition-[grid-template-columns,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${show ? "grid-cols-[1fr] opacity-100" : "grid-cols-[0fr] opacity-0"}`}
    >
      <div className="min-w-0 overflow-hidden pr-1">{children}</div>
    </div>
  );
}

// a theme's background with dots in its command and brace colors
function Swatch({ p }: { p: Palette }) {
  return (
    <span aria-hidden style={{ background: p.bg }} className="flex size-5 shrink-0 items-center justify-center gap-0.5 rounded-md ring-1 ring-ink/10">
      <span style={{ background: p.command }} className="size-1.5 rounded-full" />
      <span style={{ background: p.brace }} className="size-1.5 rounded-full" />
    </span>
  );
}

// The code theme picker for the viewer's pill. The trigger slides open left of the PDF/Code switch
// (hidden while the PDF shows); the listbox drops below the pill, outside the trigger's clipping.
export function ThemeMenu<T extends string>({
  themes,
  value,
  onChange,
  hidden,
}: {
  themes: Record<T, Palette>;
  value: T;
  onChange: (t: T) => void;
  hidden: boolean;
}) {
  const [open, setOpen] = useState(false);
  const shown = open && !hidden;
  const trigger = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const names = Object.keys(themes) as T[];
  const options = () => [...(list.current?.querySelectorAll<HTMLElement>("[role=option]") ?? [])];

  useEffect(() => {
    if (!shown) return;
    list.current?.querySelector<HTMLElement>("[aria-selected=true]")?.focus();
    const outside = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!list.current?.contains(t) && !trigger.current?.contains(t)) setOpen(false);
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [shown]);

  const close = () => {
    setOpen(false);
    trigger.current?.focus();
  };
  const pick = (t: T) => {
    onChange(t);
    close();
  };

  const onKey = (e: KeyboardEvent) => {
    const items = options();
    const i = items.indexOf(document.activeElement as HTMLElement);
    const move = (n: number) => {
      e.preventDefault();
      items[(n + items.length) % items.length]?.focus();
    };
    if (e.key === "ArrowDown") move(i + 1);
    else if (e.key === "ArrowUp") move(i - 1);
    else if (e.key === "Home") move(0);
    else if (e.key === "End") move(items.length - 1);
    else if (e.key === "Tab") setOpen(false);
    else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      pick(names[i]);
    } else if (e.key === "Escape") {
      // only the menu closes; the drawer listens for Escape on window
      e.preventDefault();
      e.stopPropagation();
      close();
    }
  };

  return (
    <>
      <Reveal show={!hidden}>
        <button
          ref={trigger}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={shown}
          aria-label={`Code theme: ${value}`}
          onClick={() => setOpen((o) => !o)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown" || e.key === "ArrowUp") {
              e.preventDefault();
              setOpen(true);
            }
          }}
          className="flex items-center gap-2 whitespace-nowrap rounded-full py-1.5 pl-1.5 pr-2.5 text-sm font-medium text-ink/70 transition hover:bg-ink/5 hover:text-ink focus-visible:outline-offset-[-2px] aria-expanded:bg-ink/5 aria-expanded:text-ink"
        >
          <Swatch p={themes[value]} />
          {value}
          <svg aria-hidden viewBox="0 0 20 20" className={`size-4 text-ink/50 transition-transform duration-300 ease-out ${shown ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 8 4 4 4-4" />
          </svg>
        </button>
      </Reveal>

      <ul
        ref={list}
        role="listbox"
        aria-label="Code theme"
        inert={!shown}
        onKeyDown={onKey}
        className={`absolute right-0 top-full z-20 mt-2 w-60 origin-top-right rounded-2xl bg-paper p-1.5 shadow-[0_18px_48px_-16px_rgb(22_27_34/0.35)] ring-1 ring-ink/10 transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${shown ? "scale-100 opacity-100" : "pointer-events-none -translate-y-1 scale-95 opacity-0 duration-150"}`}
      >
        {names.map((t, i) => (
          <li
            key={t}
            role="option"
            aria-selected={t === value}
            tabIndex={-1}
            onClick={() => pick(t)}
            // each option arrives a beat after the one above it
            style={{ transitionDelay: shown ? `${40 + i * 30}ms` : "0ms" }}
            className={`flex cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2 text-sm text-ink/80 outline-none transition-[opacity,translate,background-color] duration-300 ease-out hover:bg-ink/5 focus:bg-ink/5 aria-selected:font-medium aria-selected:text-ink motion-reduce:transition-none ${shown ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0"}`}
          >
            <Swatch p={themes[t]} />
            <span className="flex-1">{t}</span>
            {t === value && (
              <svg aria-hidden viewBox="0 0 20 20" className="size-4 text-accent-text" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m5 10.5 3.2 3L15 7" />
              </svg>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}
