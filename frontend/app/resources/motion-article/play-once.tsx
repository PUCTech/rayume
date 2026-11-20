"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// A figure that plays its story once, the way the landing's steps do: CSS transitions keyed off `data-play`.
// The server and no-JS render have no attribute, which is the finished state. It is only armed ("wait") when it
// starts below the fold and motion is allowed, so nothing on screen ever hides, then plays ("go") once its top
// passes 65% of the screen height. Printing plays it too, so paper never gets the waiting state.
export function PlayOnce({ className, children }: { className: string; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const [play, setPlay] = useState<"wait" | "go">();

  useEffect(() => {
    const el = ref.current!;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || el.getBoundingClientRect().top < innerHeight) return;
    setPlay("wait");
    const go = () => {
      setPlay("go");
      io.disconnect();
      removeEventListener("beforeprint", go);
    };
    const io = new IntersectionObserver(([e]) => e.isIntersecting && go(), { rootMargin: "0px 0px -35% 0px" });
    io.observe(el);
    addEventListener("beforeprint", go);
    return () => {
      io.disconnect();
      removeEventListener("beforeprint", go);
    };
  }, []);

  return (
    <figure ref={ref} data-play={play} className={className}>
      {children}
    </figure>
  );
}
