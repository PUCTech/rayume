import type { Metadata, Viewport } from "next";
import { share, site } from "./share";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./prism.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// The site's metadata and link preview, which every page starts from (public pages set their own title and
// description with share()). The preview image is app/opengraph-image.tsx; metadataBase makes its URL
// absolute, as previews need, on the production address even from a preview deployment.
const description = "Turn class projects, hackathons and internships into LaTeX resumes tailored to every job.";
export const metadata: Metadata = {
  metadataBase: new URL(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL ?? "rayume.vercel.app"}`),
  applicationName: site,
  ...share("Rayume", description),
  openGraph: { type: "website", siteName: site, locale: "en_US", url: "/", title: "Rayume: your day to day tool to jobhunt", description },
  twitter: { card: "summary_large_image", title: "Rayume: your day to day tool to jobhunt", description },
};
// the paper the pages are on, for the browser's bar on phones
export const viewport: Viewport = { themeColor: "#f4f0ea" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
