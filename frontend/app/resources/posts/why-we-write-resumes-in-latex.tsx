import Link from "next/link";
import type { Article } from "../content";
import { Cite, Note } from "../parts";

export const post: Article = {
  slug: "why-we-write-resumes-in-latex",
  title: "Why we write resumes in LaTeX",
  description: "Good typography, a strict structure, and a text layer you can check. We pulled the text out of our own PDFs to see which templates hold up.",
  updated: "2026-11-12",
  minutes: 5,
  author: "The Rayume team",
  sections: [
    {
      id: "why",
      title: "The student template everyone forks",
      body: (
        <>
          <p>
            Overleaf, the browser-based LaTeX editor, passed 20 million users in 2025, according to its owner, Digital Science.
            <Cite n={1} /> Most of them are writing papers and theses. Spend an afternoon on CS career forums, though, and you’ll see how many are writing resumes.
          </p>
          <p>
            The template they reach for is Jake’s Resume: <code>jakegut/resume</code> on GitHub, 2,828 stars and about 740 forks, created in 2020 and now archived.
            <Cite n={2} /> It descends from <code>sb2nov/resume</code>, a 2015 template with 7,080 stars.
            <Cite n={3} /> Bold name centered at the top, education first, dates flush right: if you’ve seen a CS student’s resume lately, you’ve probably seen one of their
            grandchildren.
          </p>
          <p>
            The appeal is partly looks. TeX breaks lines by weighing the whole paragraph instead of filling one line at a time, kerns properly and spaces consistently. The
            bigger reason is that a template is a constraint. One column, standard headings, the same structure on every page. That happens to be what parsers want:
            Greenhouse lists “columned layouts” and “tables, headers, and footers” among the things it can’t interpret,
            <Cite n={4} /> and Gupy asks for a single column.
            <Cite n={5} />
          </p>
        </>
      ),
    },
    {
      id: "text-layer",
      title: "The part nobody sees",
      body: (
        <>
          <p>
            A PDF is two things at once: the picture you see, and the text a machine extracts. They can disagree. Jake’s template knows it. Line 60 of its source reads:
          </p>
          <blockquote>
            <code>% Ensure that generate pdf is machine readable/ATS parsable</code>
          </blockquote>
          <p>
            followed by <code>\pdfgentounicode=1</code>.
            <Cite n={2} /> The reason is ligatures. TeX joins pairs like “fi” and “ff” into single glyphs, and without a map from each glyph back to its letters, copying or
            searching the PDF can return garbage or drop letters. That setting, with <code>glyphtounicode</code>, adds the map in pdfTeX.
            <Cite n={6} /> “LaTeX resumes are ATS-friendly” is true only when the text layer is right.
          </p>
        </>
      ),
    },
    {
      id: "our-pdfs",
      title: "What we found in our own PDFs",
      body: (
        <>
          <p>
            Rayume compiles with Tectonic, which runs XeTeX rather than pdfTeX, so that line doesn’t apply to us. Rather than assume we were fine, we extracted the text from
            the six sample PDFs in our template gallery with pdf.js, the PDF engine inside Firefox.
          </p>
          <p>
            Ligatures: none. Not one ligature glyph in any of the six. “Certified”, “Pontifical” and “Figma” all came out as plain letters.
          </p>
          <p>
            Icons were another story. Three of the six, AltaCV, Awesome CV and moderncv, are popular community templates, and all three draw little icons beside the email
            and phone using icon fonts. On the page you see an envelope. In the text layer, this is the header of our AltaCV sample:
          </p>
          <blockquote>
            <code>LUCAS MENDES Full Stack Developer Ɵ lucas@lucasmendes.dev × +55 11 98765-4321</code>
          </blockquote>
          <p>
            Awesome CV gives <code>Ħ +55 11 98765-4321 | ć lucas@lucasmendes.dev</code>, and moderncv puts a <code>Ȳ</code> before the phone number. A parser filling a phone
            field now has to guess what Ħ means. Awesome CV’s small caps also come out as “COMPUTER SCiENCE”.
          </p>
          <p>
            The cause is simple once you see it. An icon font is a font whose letters happen to be pictures. The PDF still records a character code for every glyph, and
            when something extracts the text, it gets back whatever character that code stands for. For the phone icon in our Awesome CV sample, that’s a Latin capital H
            with a stroke.
          </p>
          <p>Our Classic, Modern and Jake’s Resume samples have none of this. Jake’s header extracts exactly as it reads:</p>
          <blockquote>
            <code>Lucas Mendes +55 11 98765-4321 | lucas@lucasmendes.dev | linkedin.com/in/lucasmendes</code>
          </blockquote>
          <p>
            Icons look nice and parse as garbage. We keep the icon templates in the gallery because people like them and a human reads the PDF in the end, but when an
            application goes through an ATS first, pick one without icons.
          </p>
        </>
      ),
    },
    {
      id: "limits",
      title: "Where LaTeX doesn’t save you",
      body: (
        <>
          <p>
            LaTeX isn’t magic. A two-column LaTeX CV with a sidebar has the same problem as a two-column design-tool export: the parser reads across the columns and your
            skills end up in the middle of a job description. AltaCV is built for sidebars, and it’s the one we’d steer away from when a posting goes through an ATS.
          </p>
          <p>
            Tables are subtler. Jake’s Resume uses a table on each entry to push the dates to the right margin, which sounds like exactly what Greenhouse warns about. In
            practice it extracts cleanly, as you can see above, because each row is still read left to right as one line. A table used for the whole page layout is a
            different matter.
          </p>
          <p>
            And LaTeX is hard to write. A missing brace turns into an error message that mentions a line you never touched, and an unescaped ampersand in “R&amp;D” breaks
            the build. That’s fine if you enjoy it. Most people applying for an internship don’t, which is why Rayume writes the LaTeX and you never see it. And no template, however well set, rescues a bullet that says “Responsible for testing”.
          </p>
        </>
      ),
    },
    {
      id: "check-yours",
      title: "Check any PDF in ten seconds",
      body: (
        <>
          <p>
            You don’t need pdf.js. Open the PDF, select all, copy, and paste into a plain-text editor. Look for letters missing around “fi” and “ff”, odd symbols next to your
            contact details, and sections out of order (two-column layouts tend to interleave). If you have Poppler installed, <code>pdftotext resume.pdf -</code> does the
            same from a terminal.
          </p>
          <p>
            If you find junk, the fix is usually to lose the decoration: drop the icons, or switch to a single-column template. Labels like “Email:” are uglier and
            parse perfectly. It works on any resume, LaTeX or not. Try it on one exported from a design tool, too; the results can be educational.
          </p>
          <Note>
            <p>
              The rest of the parser rules are in the <Link href="/resources/ats-checklist">ATS checklist</Link>.
            </p>
          </Note>
        </>
      ),
    },
  ],
  sources: [
    { title: "Digital Science launches new AI writing tools for 20+ million Overleaf users", publisher: "GlobeNewswire", url: "https://www.globenewswire.com/news-release/2025/06/24/3104021/0/en/Digital-Science-launches-new-cutting-edge-AI-writing-tools-for-20-million-Overleaf-users.html" },
    { title: "jakegut/resume", publisher: "GitHub", url: "https://github.com/jakegut/resume" },
    { title: "sb2nov/resume", publisher: "GitHub", url: "https://github.com/sb2nov/resume" },
    { title: "Unsuccessful resume parse", publisher: "Greenhouse Support", url: "https://support.greenhouse.io/hc/en-us/articles/200989175-Unsuccessful-resume-parse" },
    { title: "Veja dicas e boas práticas para o seu currículo na Gupy", publisher: "Gupy", url: "https://www.gupy.io/blog-do-emprego/boas-praticas-curriculo-gupy" },
    { title: "Ligatures and copy-paste in pdfTeX output", publisher: "TeX Live mailing list, TUG", url: "https://tug.org/pipermail/tex-live/2021-October/047518.html" },
  ],
};
