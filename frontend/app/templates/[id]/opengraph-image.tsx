import { ImageResponse } from "next/og";
import { Frame, Sheet, contentType, fonts, render, size } from "../../banner";
import { templates } from "../data";

export function generateStaticParams() {
  return templates.map((t) => ({ id: t.file }));
}

// every template's render and the fonts, read at module scope, once: with Cache Components an image route
// can't read files while it answers, only before
const [renders, faces] = await Promise.all([Promise.all(templates.map((t) => render(t.file))), fonts()]);

const named = (id: string) => templates.find((x) => x.file === id) ?? templates[0];
// one image per template, its alt naming it
export function generateImageMetadata({ params }: { params: { id: string } }) {
  const t = named(params.id);
  return [{ id: "card", size, contentType, alt: `The ${t.name} resume template, filled in with a real resume, on Rayume` }];
}

// A template's own preview: its name, what it is, and its real render, upright like a page on a desk
export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = named(id);
  const facts = [t.layout, t.color, t.density, t.ats ? "ATS-friendly" : null].filter(Boolean).join(" · ");
  // the license by its short name, so the credit stays on one line
  const license = t.license.replace("LaTeX Project Public License", "LPPL");
  return new ImageResponse(
    (
      <Frame eyebrow="templates" picture={<Sheet src={renders[templates.indexOf(t)]} width={440} style={{ right: 80, top: 64 }} />}>
        <div style={{ display: "flex", fontFamily: "Geist Serif", fontSize: 88, lineHeight: 1.02, letterSpacing: -2.8 }}>{t.name}</div>
        <div style={{ display: "flex", marginTop: 22, fontSize: 26, color: "rgba(22, 27, 34, 0.7)" }}>{facts}</div>
        <div style={{ display: "flex", marginTop: 14, fontSize: 22, color: "rgba(22, 27, 34, 0.5)" }}>
          {t.source === "Rayume" ? `By Rayume · ${license}` : `By ${t.author} on ${t.source} · ${license}`}
        </div>
      </Frame>
    ),
    { width: 1200, height: 630, fonts: faces },
  );
}
