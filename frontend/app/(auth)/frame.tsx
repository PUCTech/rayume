"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

// The photo panel's frame. shortcut: /signup tries the photo edge to edge, /login keeps the rounded
// inset, so both can be compared; once one is picked, fold its classes back into layout.tsx.
export function Frame({ children }: { children: ReactNode }) {
  const full = usePathname() === "/signup";
  return (
    <aside className={`hidden w-1/2 shrink-0 lg:block ${full ? "" : "p-3"}`}>
      <div className={`sticky overflow-hidden bg-[#0d5f8a] ${full ? "top-0 h-screen" : "top-3 h-[calc(100vh-1.5rem)] rounded-[36px]"}`}>
        {children}
      </div>
    </aside>
  );
}
