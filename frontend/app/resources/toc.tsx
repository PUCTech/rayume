"use client";

import { useEffect, useRef, useState } from "react";

type Item = { id: string; title: string };

// px from the top of the viewport where a section counts as "being read": just under the sticky nav
const LINE = 140;

// The article's side contents (desktop) with the section being read marked, plus a thin reading progress bar
// across the top of the window. Both follow the scroll directly, so there is nothing to tone down for reduced motion.
export function Toc({ items }: { items: Item[] }) {
  const [active, setActive] = useState(items[0]?.id);
  const bar = useRef<HTMLDivElement>(null);

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
      if (bar.current) bar.current.style.transform = `scaleX(${p})`;
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
        <div ref={bar} className="h-full origin-left scale-x-0 bg-accent" />
      </div>
      <nav aria-label="On this page" className="hidden lg:block print:hidden">
        <div className="sticky top-28 max-h-[calc(100dvh-8rem)] overflow-y-auto">
          <p className="text-sm text-ink/50">On this page</p>
          <ol className="mt-4 space-y-2 border-l border-ink/10 text-sm">
            {items.map((s) => {
              const on = s.id === active;
              return (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    aria-current={on ? "location" : undefined}
                    className={`-ml-px block border-l py-0.5 pl-4 transition hover:border-accent hover:text-ink ${on ? "border-accent font-medium text-ink" : "border-transparent text-ink/60"}`}
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
