"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useRouter } from "next/navigation";

// The template opened from the grid: a panel on the right, leaving a strip of the grid to click off.
// Closing goes back in history, so the URL returns to /templates with the grid as it was.
export function Drawer({ children }: { children: ReactNode }) {
  const router = useRouter();
  const root = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  // fade out first, then go back; a DOM flag rather than state, because Next keeps the closed drawer
  // mounted but hidden and a forward navigation shows it again, effects re-run, state doesn't reset
  const close = () => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return router.back();
    root.current?.setAttribute("data-closing", "");
    setTimeout(() => router.back(), 200);
  };

  useEffect(() => {
    root.current?.removeAttribute("data-closing");
    panel.current?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Esc inside the code editor stays there, so it can't throw away edits
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !(e.target instanceof HTMLTextAreaElement) && close();
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
    // close only reads refs and the router
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  return (
    <div ref={root} className="group fixed inset-0 z-50">
      <div
        aria-hidden
        onClick={close}
        className="absolute inset-0 bg-ink/20 backdrop-blur-[2px] transition duration-500 ease-out group-data-closing:opacity-0 group-data-closing:duration-200 starting:opacity-0"
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tpl-title"
        tabIndex={-1}
        className="absolute inset-y-2 left-12 right-2 overflow-y-auto rounded-[28px] bg-paper shadow-[0_24px_80px_-24px_rgb(22_27_34/0.5)] outline-none transition duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-data-closing:translate-x-6 group-data-closing:opacity-0 group-data-closing:duration-200 group-data-closing:ease-in starting:translate-x-10 starting:opacity-0 motion-reduce:transition-none md:left-auto md:w-[min(76rem,calc(100vw-10rem))] lg:overflow-hidden"
      >
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute right-4 top-4 z-20 grid size-10 place-items-center rounded-full text-ink/60 transition hover:bg-ink/5 hover:text-ink"
        >
          <svg aria-hidden viewBox="0 0 20 20" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="m5 5 10 10M15 5 5 15" />
          </svg>
        </button>
        {children}
      </div>
    </div>
  );
}
