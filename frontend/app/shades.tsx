"use client";

import { useEffect, useSyncExternalStore, type CSSProperties } from "react";
import { accents } from "./palette";

const KEY = "rayume-accent";

// the pick ("accent,shade") lives in a module-level store backed by localStorage (which may be blocked)
let picked: string | null = null;
const listeners = new Set<() => void>();

function parse(v: string | null): [number, number] {
  const [a, s] = (v ?? "").split(",").map(Number);
  return accents[a]?.shades[s] ? [a, s] : [0, 0];
}

function read() {
  if (picked === null) {
    try {
      picked = parse(localStorage.getItem(KEY)).join(",");
    } catch {
      picked = "0,0";
    }
  }
  return picked;
}

function pick(a: number, s: number) {
  picked = `${a},${s}`;
  try {
    localStorage.setItem(KEY, picked);
  } catch {}
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

const swatch =
  "size-7 cursor-pointer rounded-full ring-2 ring-offset-2 ring-offset-paper transition hover:scale-110 active:scale-95 motion-reduce:transition-none";
const ring = (on: boolean, color: string) => ({ "--tw-ring-color": on ? color : "transparent" }) as CSSProperties;

// shortcut: test-branch tool for picking an accent colour; delete it once the colour is decided
export function ShadeToggle() {
  const [a, s] = parse(useSyncExternalStore(subscribe, read, () => "0,0"));
  const accent = accents[a];

  useEffect(() => {
    const c = accents[a].shades[s];
    const root = document.documentElement.style;
    root.setProperty("--color-verm", c.base);
    root.setProperty("--color-verm-deep", c.deep);
    root.setProperty("--color-verm-text", c.text);
  }, [a, s]);

  return (
    <div className="glass fixed! bottom-4 right-4 z-50 flex flex-col gap-2.5 rounded-[26px] p-3 text-[13px] font-medium">
      <div role="group" aria-label="Accent colour" className="flex items-center gap-2">
        {accents.map((x, n) => (
          <button
            key={x.name}
            type="button"
            title={x.name}
            aria-pressed={n === a}
            onClick={() => pick(n, 0)}
            style={{ background: x.shades[0].base, ...ring(n === a, "var(--color-ink)") }}
            className={swatch}
          >
            <span className="sr-only">{x.name}</span>
          </button>
        ))}
      </div>
      <div role="group" aria-label={`${accent.name} shades`} className="flex items-center gap-2 border-t border-ink/10 pt-2.5">
        {accent.shades.map((x, n) => (
          <button
            key={x.name}
            type="button"
            title={x.name}
            aria-pressed={n === s}
            onClick={() => pick(a, n)}
            style={{ background: x.base, ...ring(n === s, x.text) }}
            className={swatch}
          >
            <span className="sr-only">{x.name}</span>
          </button>
        ))}
        <span className="ml-1 text-ink/70">
          {accent.name} · {accent.shades[s].name}
        </span>
      </div>
    </div>
  );
}
