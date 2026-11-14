// Real renders of Lucas's resume, compiled from resumes/*.tex: the team's template, four of the
// most used resume templates on Overleaf, and a vermilion variant of ours. All six are open source.
// file is the id in /templates/{file} and the basename in resumes/ and public/resumes/.
// ats: a single reading order a parser can follow (two columns can scramble it); color: accent colour or
// black only; density: how much fits per page; popular: rank by use on Overleaf, our two after theirs.
// shortcut: these are set by hand here; move them to the API's template tags (backend seed.py) when
// the page reads templates from GET /templates.
export const templates = [
  {
    name: "Classic",
    file: "classic",
    ats: true,
    color: "Black & white",
    density: "Compact",
    popular: 5,
    layout: "One column",
    source: "Rayume",
    author: "Rayume",
    license: "MIT",
    abstract:
      "Our own one-column template: a Times serif, uppercase name, bold section titles over a thin rule, and 0.45 inch margins so a full first job fits on one page.",
  },
  {
    name: "Jake's Resume",
    file: "jake",
    ats: true,
    color: "Black & white",
    density: "Compact",
    popular: 1,
    layout: "One column",
    source: "Overleaf",
    author: "Jake Gutierrez",
    license: "MIT",
    abstract:
      "A one-column resume based on sb2nov/resume, and one of the most used resume templates on Overleaf. Small caps section titles, a dense, scannable layout and nothing a parser can trip on.",
  },
  {
    name: "Awesome CV",
    file: "awesome",
    ats: true,
    color: "Color",
    density: "Roomy",
    popular: 2,
    layout: "One column",
    source: "Overleaf",
    author: "Byungjin Park",
    license: "LaTeX Project Public License 1.3c",
    abstract:
      "A modern CV class with a large light-and-bold name, colored section titles and right-aligned dates. Ours is a renamed copy that builds with XeTeX and draws its icons from fontawesome5.",
  },
  {
    name: "AltaCV",
    file: "altacv",
    ats: false,
    color: "Color",
    density: "Compact",
    popular: 4,
    layout: "Two column",
    source: "Overleaf",
    author: "LianTze Lim",
    // from Overleaf's "a year ago", read in November 2026
    updated: "2025",
    license: "LaTeX Project Public License 1.3c",
    abstract:
      "This is a bare bones CV created using altacv.cls (v1.7.4, 30 Jul 2025), which is based on the style of Marissa Mayer's CV created by BusinessInsider using enhancv.",
  },
  {
    name: "moderncv",
    file: "moderncv",
    ats: true,
    color: "Black & white",
    density: "Roomy",
    popular: 3,
    layout: "One column",
    source: "Overleaf",
    author: "Xavier Danaus",
    license: "LaTeX Project Public License 1.3c",
    abstract:
      "One of the most used CV classes on CTAN and Overleaf, here in its banking style: a centered header with the contact line under it, and section titles set over a full-width rule.",
  },
  {
    name: "Modern",
    file: "modern",
    ats: true,
    color: "Color",
    density: "Compact",
    popular: 6,
    layout: "One column",
    source: "Rayume",
    author: "Rayume",
    license: "MIT",
    abstract:
      "Classic's content in Helvetica, with a larger left-aligned name and vermilion section titles and rules. Same margins, same one page.",
  },
];

export type Template = (typeof templates)[number] & { updated?: string };
