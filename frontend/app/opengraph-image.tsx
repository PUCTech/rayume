import { ImageResponse } from "next/og";
import { Frame, Mark, Sheet, accent, fonts, render } from "./banner";

export { size, contentType } from "./banner";
export const alt = "Rayume: your day to day tool to jobhunt. Turn class projects, hackathons and internships into LaTeX resumes tailored to every job.";

// read at module scope, once, so the image is built with the site rather than on every crawler's visit
const [classic, faces] = await Promise.all([render("classic"), fonts()]);

// The preview a link to Rayume shows (Slack, WhatsApp, X, LinkedIn, iMessage): the landing's headline beside
// a real Classic render, with Rayume rewriting a line of it. Every page without its own uses this one.
export default function Image() {
  return new ImageResponse(
    (
      <Frame
        picture={
          <div style={{ display: "flex", position: "absolute", right: 0, top: 0, width: 560, height: 630 }}>
            <Sheet src={classic} width={430} rotate={-4} style={{ left: 80, top: 70 }} />
            {/* Rayume's reply, over the sheet's first job */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                position: "absolute",
                left: 10,
                top: 360,
                width: 380,
                padding: "16px 20px",
                borderRadius: 20,
                borderTopLeftRadius: 6,
                backgroundColor: accent,
                color: "#fff",
                fontSize: 21,
                lineHeight: 1.35,
                boxShadow: "0 24px 48px -16px rgba(39, 27, 244, 0.55)",
              }}
            >
              <div style={{ display: "flex", flexShrink: 0, marginTop: 2 }}>
                <Mark height={26} color="#fff" />
              </div>
              <span>Leads with the result: “Process R$ 2M+ a month through the Stripe billing I built.”</span>
            </div>
          </div>
        }
      >
        <div style={{ display: "flex", fontFamily: "Geist Serif", fontSize: 82, lineHeight: 1.03, letterSpacing: -2.6 }}>Your day to day tool to jobhunt.</div>
        <div style={{ display: "flex", marginTop: 26, fontSize: 27, lineHeight: 1.45, color: "rgba(22, 27, 34, 0.7)" }}>
          Turn class projects, hackathons and internships into LaTeX resumes tailored to every job.
        </div>
      </Frame>
    ),
    { width: 1200, height: 630, fonts: faces },
  );
}
