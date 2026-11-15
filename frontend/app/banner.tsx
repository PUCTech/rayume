import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { ReactNode } from "react";
import { MARK_D } from "./logo";

// What the link previews (opengraph-image.tsx, here and under /templates/[id]) are drawn with: the site's
// paper, ink and ultramarine, its Geist Serif and Geist (TTFs in assets/fonts, since the image renderer reads
// neither woff2 nor next/font), and the manta. Read once, when the images are built.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
const font = (file: string) => readFile(join(process.cwd(), "assets/fonts", file));
export const fonts = async () => [
  { name: "Geist Serif", data: await font("GeistSerif-Regular.ttf"), weight: 400 as const, style: "normal" as const },
  { name: "Geist", data: await font("Geist-Regular.ttf"), weight: 400 as const, style: "normal" as const },
  { name: "Geist", data: await font("Geist-Medium.ttf"), weight: 500 as const, style: "normal" as const },
];
// a template's real render (public/resumes), as the image's <img> takes it
export const render = async (file: string) => `data:image/png;base64,${await readFile(join(process.cwd(), "public/resumes", `${file}.png`), "base64")}`;

export const ink = "#161b22";
export const paper = "#f4f0ea";
export const accent = "#271bf4";

export function Mark({ height, color = ink }: { height: number; color?: string }) {
  return (
    <svg width={(height * 182) / 243} height={height} viewBox="0 0 182 243">
      <path d={MARK_D} fill={color} fillRule="evenodd" />
    </svg>
  );
}

// The frame every preview shares: paper with the ultramarine glow the landing's hero has, the wordmark top
// left, the address bottom left, and the picture on the right
export function Frame({ eyebrow, children, picture }: { eyebrow?: string; children: ReactNode; picture: ReactNode }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        overflow: "hidden",
        color: ink,
        fontFamily: "Geist",
        backgroundColor: paper,
        backgroundImage: "radial-gradient(circle at 88% 18%, rgba(67, 56, 245, 0.32), rgba(67, 56, 245, 0) 46%)",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", width: 640, padding: "64px 0 56px 72px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Mark height={42} />
          <span style={{ fontFamily: "Geist Serif", fontSize: 40, letterSpacing: -0.8 }}>Rayume</span>
          {eyebrow && <span style={{ marginLeft: 6, fontSize: 24, color: "rgba(22, 27, 34, 0.5)" }}>{eyebrow}</span>}
        </div>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>{children}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 22, color: "rgba(22, 27, 34, 0.55)" }}>
          <span style={{ display: "flex", padding: "8px 16px", borderRadius: 999, backgroundColor: accent, color: "#fff", fontWeight: 500 }}>Free while in beta</span>
          rayume.vercel.app
        </div>
      </div>
      {picture}
    </div>
  );
}

// a page of a resume as a sheet of paper, cut off by the bottom edge of the preview
export function Sheet({ src, width, rotate = 0, style }: { src: string; width: number; rotate?: number; style?: object }) {
  return (
    <div
      style={{
        display: "flex",
        position: "absolute",
        width,
        transform: `rotate(${rotate}deg)`,
        borderRadius: 6,
        backgroundColor: "#fff",
        boxShadow: "0 2px 6px rgba(22, 27, 34, 0.08), 0 40px 80px -24px rgba(22, 27, 34, 0.35)",
        overflow: "hidden",
        ...style,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- the image renderer draws plain <img> */}
      <img src={src} width={width} height={(width * 2589) / 2000} alt="" />
    </div>
  );
}
