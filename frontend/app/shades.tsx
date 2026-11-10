"use client";

import { useEffect, useSyncExternalStore, type CSSProperties } from "react";
import { accent, shades } from "./palette";

const KEY = `rayume-shade-${accent}`;

// the picked shade lives in a module-level store backed by localStorage (which may be blocked)
let picked: number | null = null;
const listeners = new Set<() => void>();

function read() {
  if (picked === null) {
    try {
      const n = Number(localStorage.getItem(KEY));
      picked = shades[n] ? n : 0;
    } catch {
      picked = 0;
    }
  }
  return picked;
}

function pick(n: number) {
  picked = n;
  try {
    localStorage.setItem(KEY, String(n));
  } catch {}
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

// shortcut: test-branch tool for picking an accent shade; delete it once the colour is decided
export function ShadeToggle() {
  const i = useSyncExternalStore(subscribe, read, () => 0);

  useEffect(() => {
    const s = shades[i];
    const root = document.documentElement.style;
    root.setProperty("--color-verm", s.base);
    root.setProperty("--color-verm-deep", s.deep);
    root.setProperty("--color-verm-text", s.text);
  }, [i]);

  return (
    <div
      role="group"
      aria-label={`${accent} shades`}
      className="glass fixed! bottom-4 left-4 z-50 flex items-center gap-2 rounded-full p-2 pr-4 text-[13px] font-medium"
    >
      {shades.map((s, n) => (
        <button
          key={s.name}
          type="button"
          title={s.name}
          aria-pressed={n === i}
          onClick={() => pick(n)}
          style={{ background: s.base, "--tw-ring-color": n === i ? s.text : "transparent" } as CSSProperties}
          className="size-7 cursor-pointer rounded-full ring-2 ring-offset-2 ring-offset-paper transition hover:scale-110 active:scale-95 motion-reduce:transition-none"
        >
          <span className="sr-only">{s.name}</span>
        </button>
      ))}
      <span className="ml-1 w-24 text-ink/70">{shades[i].name}</span>
    </div>
  );
}
