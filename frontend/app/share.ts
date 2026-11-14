import type { Metadata } from "next";

// A public page's metadata with its link preview: the same title and description for the tab, Open Graph
// (Slack, WhatsApp, LinkedIn, iMessage) and X. Metadata merges shallowly, so a page that set only its title
// would share as "Rayume"; this sets all three together.
export const site = "Rayume";
// The image goes along too: openGraph set here replaces the layout's, image included, and wins over an
// opengraph-image file in the page's own segment. image is a page's own (a template's), the site's banner
// otherwise: the opengraph-image route and its twitter-image twin.
type Image = { og: string; x: string; alt: string };
const banner: Image = { og: "/opengraph-image", x: "/twitter-image", alt: "Rayume: your day to day tool to jobhunt" };
export const share = (title: string, description: string, image = banner): Metadata => ({
  title,
  description,
  openGraph: { type: "website", siteName: site, locale: "en_US", title, description, images: [{ url: image.og, width: 1200, height: 630, alt: image.alt }] },
  twitter: { card: "summary_large_image", title, description, images: [{ url: image.x, width: 1200, height: 630, alt: image.alt }] },
});
