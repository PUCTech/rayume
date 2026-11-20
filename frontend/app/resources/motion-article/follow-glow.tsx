"use client";

import { useEffect, useRef } from "react";

// The dark panel's ultramarine glow, drifting toward a mouse pointer inside the panel and back to rest when it
// leaves. It answers the pointer only: touch, pen and reduced motion keep it where the server put it.
export function FollowGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const glow = ref.current!;
    const panel = glow.parentElement!;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = panel.getBoundingClientRect();
      // the glow rests centred 3rem under the panel's bottom edge (see its classes); offset from there
      glow.style.transform = `translate(${e.clientX - r.left - r.width / 2}px, ${e.clientY - r.top - (r.height - 48)}px)`;
    };
    const rest = () => (glow.style.transform = "");
    panel.addEventListener("pointermove", move);
    panel.addEventListener("pointerleave", rest);
    return () => {
      panel.removeEventListener("pointermove", move);
      panel.removeEventListener("pointerleave", rest);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute -bottom-48 left-1/2 size-[30rem] -translate-x-1/2 rounded-full bg-accent/60 blur-[100px] transition-transform duration-700 ease-out"
    />
  );
}
