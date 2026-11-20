"use client";

import { useEffect, useRef } from "react";

// The checklist's one-time "all done": a soft burst of accent and success sparks from the status line, about
// 0.8 s, then gone. Web Animations, so nothing loops and nothing stays; reduced motion gets the words alone.
const N = 10;

export function Sparks() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const dots = [...ref.current!.children] as HTMLElement[];
    const runs = dots.map((d, i) => {
      const a = (i / N) * Math.PI * 2 + 0.3;
      const r = 26 + (i % 3) * 9;
      return d.animate(
        [
          { transform: "translate(-50%,-50%) scale(0.4)", opacity: 1 },
          { opacity: 1, offset: 0.5 }, // fly out bright, fade only on the way to rest
          { transform: `translate(calc(-50% + ${Math.cos(a) * r}px), calc(-50% + ${Math.sin(a) * r}px)) scale(1)`, opacity: 0 },
        ],
        { duration: 650 + (i % 4) * 60, easing: "cubic-bezier(0.2,0.8,0.2,1)", fill: "forwards" },
      );
    });
    return () => runs.forEach((r) => r.cancel());
  }, []);

  return (
    <span ref={ref} aria-hidden className="pointer-events-none absolute left-[0.45rem] top-1/2">
      {Array.from({ length: N }, (_, i) => (
        <span key={i} className={`absolute size-1.5 rounded-full opacity-0 ${i % 2 ? "bg-success" : "bg-accent"}`} />
      ))}
    </span>
  );
}
