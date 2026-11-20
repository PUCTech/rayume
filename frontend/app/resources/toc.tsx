"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

type Item = { id: string; title: string };

// px from the top of the viewport where a section counts as "being read": just under the sticky nav
const LINE = 140;

// The article's side contents (desktop) with the section being read marked, plus a thin reading progress bar
// across the top of the window. The bar follows the scroll directly; the marker springs from item to item
// (instant under reduced motion). Until it has been measured, the active link draws its own border instead.
export function Toc({ items }: { items: Item[] }) {
  const [active, setActive] = useState(items[0]?.id);
  const bar = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLOListElement>(null);
  const [mark, setMark] = useState<{ top: number; height: number }>();

  // the active link's box, read again when the active section or the layout (wrapping titles) changes
  useLayoutEffect(() => {
    const measure = () => {
      const a = list.current?.querySelector<HTMLElement>("[aria-current]");
      if (a) setMark({ top: a.offsetTop, height: a.offsetHeight });
    };
    measure();
    addEventListener("resize", measure);
    return () => removeEventListener("resize", measure);
  }, [active]);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const els = items.map((s) => document.getElementById(s.id)).filter((el) => el !== null);
      if (!els.length) return;
      let current = els[0].id;
      for (const el of els) if (el.getBoundingClientRect().top <= LINE) current = el.id;
      setActive(current);
      const top = els[0].getBoundingClientRect().top;
      const bottom = els[els.length - 1].getBoundingClientRect().bottom;
      const p = Math.min(1, Math.max(0, (window.innerHeight / 2 - top) / (bottom - top)));
      if (bar.current) {
        bar.current.style.transform = `translateX(${(p - 1) * 100}%)`;
        bar.current.style.opacity = p > 0 ? "1" : "0";
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [items]);

  return (
    <>
      <div aria-hidden className="fixed inset-x-0 top-0 z-50 h-0.5 print:hidden">
        {/* slid in rather than scaled, so the glow at its leading edge keeps its shape */}
        <div
          ref={bar}
          className="relative h-full -translate-x-full bg-accent opacity-0 after:absolute after:inset-y-0 after:right-0 after:w-10 after:rounded-full after:shadow-[0_0_10px_2px_color-mix(in_srgb,var(--color-accent)_70%,transparent)]"
        />
      </div>
      <nav aria-label="On this page" className="hidden lg:block print:hidden">
        <div className="sticky top-28 max-h-[calc(100dvh-8rem)] overflow-y-auto">
          <p className="text-sm text-ink/50">On this page</p>
          <ol ref={list} className="relative mt-4 space-y-2 border-l border-ink/10 text-sm">
            {mark && (
              <li
                aria-hidden
                className="absolute -left-px top-0 w-px bg-accent transition-[translate,height] duration-500 ease-[cubic-bezier(0.34,1.4,0.64,1)] motion-reduce:transition-none"
                style={{ translate: `0 ${mark.top}px`, height: mark.height }}
              />
            )}
            {items.map((s) => {
              const on = s.id === active;
              return (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    aria-current={on ? "location" : undefined}
                    className={`-ml-px block border-l py-0.5 pl-4 transition hover:border-accent hover:text-ink ${on ? `font-medium text-ink ${mark ? "border-transparent" : "border-accent"}` : "border-transparent text-ink/60"}`}
                  >
                    {s.title}
                  </a>
                </li>
              );
            })}
          </ol>
        </div>
      </nav>
    </>
  );
}
