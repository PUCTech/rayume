"use client";

import { useEffect, useRef, type ReactNode } from "react";
import "./covers.css";

// The cover's <svg>. Arms its story only for a cover that will scroll into view later, then plays it once on entry.
// Server render, no JS, reduced motion and a cover already on screen at load all keep the finished drawing.
export function Play({ viewBox, className, children }: { viewBox: string; className: string; children: ReactNode }) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const box = el.getBoundingClientRect();
    if (box.top < innerHeight && box.bottom > 0) return;
    el.dataset.cv = "armed";
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        el.dataset.cv = "play";
        io.disconnect();
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <svg ref={ref} aria-hidden viewBox={viewBox} className={`cv-cover ${className}`}>
      {children}
    </svg>
  );
}
