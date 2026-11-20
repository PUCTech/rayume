"use client";

import type { PointerEvent, ReactNode } from "react";

const vars = ["--rx", "--ry", "--px", "--py"];

// A frame that tilts toward the pointer while its child shifts the other way (motion.css). It only writes CSS
// variables, no re-render; the CSS ignores them on touch screens and under reduced motion.
export function Tilt({ className = "", children }: { className?: string; children: ReactNode }) {
  function move(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType === "touch") return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--rx", `${(-y * 7).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${(x * 7).toFixed(2)}deg`);
    el.style.setProperty("--px", `${(-x * 10).toFixed(1)}px`);
    el.style.setProperty("--py", `${(-y * 10).toFixed(1)}px`);
  }
  function leave(e: PointerEvent<HTMLDivElement>) {
    for (const v of vars) e.currentTarget.style.removeProperty(v);
  }
  return (
    <div data-tilt="" onPointerMove={move} onPointerLeave={leave} className={`overflow-hidden rounded-[22px] ${className}`}>
      {children}
    </div>
  );
}
