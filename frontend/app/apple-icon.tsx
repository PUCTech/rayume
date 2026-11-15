import { ImageResponse } from "next/og";
import { Mark, accent } from "./banner";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// The icon iOS uses for a saved link or a home screen: the favicon's manta on its ultramarine tile, as a PNG
// (iOS doesn't take the SVG). Its corners stay square; iOS rounds them itself.
export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: accent }}>
        <Mark height={124} color="#fff" />
      </div>
    ),
    size,
  );
}
