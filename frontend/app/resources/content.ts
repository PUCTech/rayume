import type { ReactNode } from "react";

// The contract between the resources pages (layout, design) and their writing. A guide or a post is data:
// sections of JSX, in plain elements (p, h3, ul, ol, li, strong, em, a, blockquote, table, code) plus the
// parts in parts.tsx. The pages decide how it all looks; the writing never sets a class.
export type Section = { id: string; title: string; body: ReactNode };
export type Article = {
  slug: string;
  title: string;
  // one or two sentences: the index card, the page's lede and its meta description
  description: string;
  // YYYY-MM-DD
  updated: string;
  // reading time, rounded
  minutes: number;
  // who wrote it, as the byline shows it
  author: string;
  sections: Section[];
  // where a claim comes from: shown at the end, numbered as cited in the text with <Cite n={1} />
  sources?: { title: string; publisher: string; url: string }[];
};
