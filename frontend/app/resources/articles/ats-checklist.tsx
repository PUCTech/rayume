import Link from "next/link";
import type { Article } from "../content";
import { Checklist, Cite, Note } from "../parts";

export const article: Article = {
  slug: "ats-checklist",
  title: "The ATS checklist",
  description: "What applicant tracking systems really do with your resume, and the checks to run before every application.",
  updated: "2026-11-17",
  minutes: 6,
  author: "The Rayume team",
  sections: [
    {
      id: "myth",
      title: "The 75% myth",
      body: (
        <>
          <p>
            You’ve seen the line: 75% of resumes are rejected by an ATS before a human ever reads them. It’s on resume-builder landing pages and in a thousand LinkedIn posts.
            It has no study behind it.
          </p>
          <p>
            Followed back, the number leads to Preptel, a resume-optimization startup that used it in marketing around 2012, sold software to beat applicant tracking
            systems, shut down in 2013 and never published a methodology.
            <Cite n={1} /> We couldn’t find the original release either; the trail rests on several secondary write-ups that agree with each other. So: a company
            selling a fix for ATS rejection announced that ATS rejection was everywhere. Hard to imagine a more neutral source.
          </p>
          <p>
            Recruiters describe something else. Enhancv, which sells a resume builder, interviewed 25 US recruiters in 2025, and 23 said their ATS doesn’t auto-reject
            anyone for formatting, content or design.
            <Cite n={2} /> It’s a small, vendor-run sample, and Enhancv says itself it isn’t representative, but the quotes are hard to misread. “The ATS systems that I’ve
            worked with don’t automatically disposition people,” one recruiter told them. “We have to go in and do it.”
            <Cite n={2} />
          </p>
          <p>
            Gupy says the same about its own ranking: “a ordenação, por si só, não elimina ninguém. Ela apenas organiza a lista.”
            <Cite n={3} />
          </p>
          <p>
            The myth survives because it’s useful to the people repeating it. A scary number sells resume scanners, keyword reports and “ATS-proof” templates. It also
            makes silence after an application feel like a machine’s fault, which is easier to hear than “two hundred people applied by Tuesday”.
          </p>
        </>
      ),
    },
    {
      id: "what-ats-do",
      title: "What an ATS actually does",
      body: (
        <>
          <p>Four jobs, roughly in this order:</p>
          <ol>
            <li>
              <strong>Parse.</strong> It reads your file and fills fields: name, contacts, employers, dates, education. When parsing goes wrong, Greenhouse’s result is “a
              partial resume parse that will need to be manually corrected and verified.”
              <Cite n={4} /> That means a recruiter looking at a half-empty profile.
            </li>
            <li>
              <strong>Store.</strong> Your application becomes a row the recruiting team can search. Jobscan, which sells keyword-matching tools, calls an ATS “a searchable
              database recruiters use to filter candidates”, and in its 2025 survey of 384 recruiters, 76.4% said they filter by skill keywords first.
              <Cite n={5} />
            </li>
            <li>
              <strong>Rank.</strong> Some systems order candidates by fit. Gupy’s AI does, and per Gupy the ranking only organizes the list.
              <Cite n={3} /> AI screening is less widespread than the hype suggests: in NACE’s 2025 spring survey, 11% of US employers said they use AI to screen resumes.
              <Cite n={6} />
            </li>
            <li>
              <strong>Knock out.</strong> Automatic rejection happens on requirements the company marks as mandatory: work authorization, a certification, availability,
              location. Gupy says its auto-rejection works only that way,
              <Cite n={7} /> and in Enhancv’s interviews these knockout questions were the real automatic filter.
              <Cite n={2} />
            </li>
          </ol>
          <h3>The part that’s true</h3>
          <p>
            Harvard Business School and Accenture surveyed more than 2,250 executives in the US, UK and Germany for their 2021 <em>Hidden Workers</em> report. More than 90% of
            employers use their systems to initially filter or rank candidates, and 88% agreed that qualified high-skills candidates get vetted out “because they do not match
            the exact criteria established by the job description.”
            <Cite n={8} /> That 88% is what employers believe, not a measured rejection rate, but the risk it describes is real.
          </p>
          <p>
            It just isn’t a robot shredding your PDF. It’s a ranking that rewards exact matches, a knockout question you answered carelessly, and a recruiter typing
            “PostgreSQL” into a search box. So the checklist has two halves: make the file parse cleanly, and make the content match the posting, honestly.
          </p>
        </>
      ),
    },
    {
      id: "layout",
      title: "Layout",
      body: (
        <>
          <p>
            Greenhouse publishes what breaks its parser: “graphics, photos, or word art”, “tables, headers, and footers”, “columned layouts”, and resumes uploaded as
            images.
            <Cite n={4} /> Gupy’s candidate guidance says much the same.
            <Cite n={9} />
          </p>
          <Checklist
            id="ats-layout"
            items={[
              {
                label: "One column",
                detail: (
                  <>
                    Gupy warns that two columns can mix or overlap when the text is extracted.
                    <Cite n={9} /> Humans like it better too: in Ladders’ eye-tracking study, multiple columns did worst.
                    <Cite n={10} />
                  </>
                ),
              },
              {
                label: "No tables for layout",
                detail: (
                  <>
                    Tables are on Greenhouse’s list of things it can’t interpret.
                    <Cite n={4} />
                  </>
                ),
              },
              { label: "Contact details in the body, not the page header or footer", detail: "Headers and footers are on the same list, and your phone number is the last thing you want skipped." },
              {
                label: "No photo, icons, graphics or word art",
                detail: (
                  <>
                    Gupy: “Não insira imagens nem fotos.”
                    <Cite n={9} /> Icon fonts are sneakier: the envelope next to your email can come out as a stray character.
                  </>
                ),
              },
              {
                label: "Plain section headings",
                detail: (
                  <>
                    Education, Experience, Projects, Skills. Not “My journey”, and no symbols in the headings.
                    <Cite n={11} />
                  </>
                ),
              },
              {
                label: "A standard font, 10 pt or larger",
                detail: (
                  <>
                    The Tech Interview Handbook’s rule of thumb.
                    <Cite n={11} />
                  </>
                ),
              },
            ]}
          />
        </>
      ),
    },
    {
      id: "content",
      title: "Content and keywords",
      body: (
        <>
          <p>
            Keywords matter because people search with them, not because a parser counts them. Use the posting’s words for things you really know, and nothing past that.
          </p>
          <Checklist
            id="ats-content"
            items={[
              { label: "Use the posting’s exact terms for skills you have", detail: "If it says PostgreSQL, don’t write only “Postgres”. Spell out an abbreviation once: “continuous integration (CI)”." },
              {
                label: "Write in the language of the posting",
                detail: (
                  <>
                    Gupy’s AI compares the job description’s text with your resume’s and doesn’t translate. English posting, English resume.
                    <Cite n={9} />
                  </>
                ),
              },
              { label: "Put the most relevant project first", detail: "A recruiter reads top down, and so does the person deciding on the ranking." },
              { label: "One date format everywhere", detail: "“Mar 2025 – Present”, the same way on every line. No vendor documents this; it’s simply good practice." },
              {
                label: "Add Inc., LLC or Ltda. when it’s part of an employer’s name",
                detail: (
                  <>
                    Greenhouse says company names without identifiers can confuse its parser.
                    <Cite n={4} />
                  </>
                ),
              },
              {
                label: "No hidden text",
                detail: (
                  <>
                    White-text keywords and prompt injections get caught. In Greenhouse’s 2025 survey, 22% of hiring managers said they’d found hidden prompt injections in
                    resumes.
                    <Cite n={12} />
                  </>
                ),
              },
              {
                label: "Nothing you can’t defend in an interview",
                detail: (
                  <>
                    Gupy: “Descrições infladas ou irreais podem prejudicar sua candidatura quando chegar à análise humana.”
                    <Cite n={7} />
                  </>
                ),
              },
            ]}
          />
        </>
      ),
    },
    {
      id: "file",
      title: "File",
      body: (
        <>
          <Checklist
            id="ats-file"
            items={[
              {
                label: "Real text, not a scan",
                detail: "Open the PDF, select all, paste into a plain-text editor. Every word should come out, in reading order.",
              },
              {
                label: "Under 2.5 MB",
                detail: (
                  <>
                    “Greenhouse Recruiting can’t parse resumes larger than 2.5MB.”
                    <Cite n={4} /> A photo is usually what makes a resume heavy.
                  </>
                ),
              },
              {
                label: "PDF, or DOCX when asked",
                detail: (
                  <>
                    Greenhouse takes DOC, DOCX, PDF, RTF and TXT.
                    <Cite n={13} /> Gupy asks for DOC or DOCX.
                    <Cite n={9} />
                  </>
                ),
              },
              { label: "A file name a recruiter can find", detail: "Firstname-Lastname-Resume.pdf. Not resume_final_v3.pdf." },
            ]}
          />
          <Note>
            <p>
              Rayume’s Classic, Modern and Jake’s Resume templates are one column with no icons, and pass the copy-paste test. Our gallery also has AltaCV, Awesome CV and
              moderncv, which look lovely and leak icon characters into the text. We wrote up <Link href="/resources/blog/why-we-write-resumes-in-latex">what we found</Link>.
            </p>
          </Note>
        </>
      ),
    },
    {
      id: "before-apply",
      title: "Before you hit apply",
      body: (
        <>
          <Checklist
            id="ats-apply"
            items={[
              { label: "Answer knockout questions truthfully", detail: "They’re the filter that really rejects automatically, and a wrong “yes” on work authorization surfaces later anyway." },
              {
                label: "Check every field the system filled in",
                detail: (
                  <>
                    On Gupy, companies see your profile fields rather than the file you uploaded, so fix whatever the parser got wrong.
                    <Cite n={9} />
                  </>
                ),
              },
              {
                label: "Apply early",
                detail: (
                  <>
                    One recruiter told Enhancv she reviews “first-come, first-served, just because I don’t have the time to go through and review that many resumes.”
                    <Cite n={2} />
                  </>
                ),
              },
              {
                label: "Tailor this copy to this posting",
                detail: (
                  <>
                    Reorder, swap projects, match the terms. <Link href="/resources/blog/what-tailoring-should-change">Where the line is</Link>.
                  </>
                ),
              },
              { label: "Read it once as a person would", detail: "Software is the first reader. A human decides." },
            ]}
          />
        </>
      ),
    },
  ],
  sources: [
    { title: "Claim analyzed: 75% ATS rejection", publisher: "lenz.io", url: "https://lenz.io/c/ats-applicant-tracking-system-75-percent-rejection-rate-bc6fd7d4" },
    { title: "Does ATS reject resumes?", publisher: "Enhancv", url: "https://enhancv.com/blog/does-ats-reject-resumes/" },
    { title: "Ordenação de pessoas candidatas", publisher: "Gupy", url: "https://www.gupy.io/inteligencia-artificial/ordenacao-de-pessoas-candidatas-em-vagas" },
    { title: "Unsuccessful resume parse", publisher: "Greenhouse Support", url: "https://support.greenhouse.io/hc/en-us/articles/200989175-Unsuccessful-resume-parse" },
    { title: "ATS-ready resumes", publisher: "Jobscan", url: "https://www.jobscan.co/organizations/ats-ready-resumes/" },
    { title: "Job Outlook 2025 Spring Update", publisher: "NACE", url: "https://naceweb.org/research/reports/job-outlook/2025/spring-update" },
    { title: "Como passar pelos agentes de IA da Gupy", publisher: "Gupy", url: "https://www.gupy.io/blog-do-emprego/como-passar-pela-ia-da-gupy" },
    { title: "Hidden workers: untapped talent", publisher: "Harvard Business School and Accenture", url: "https://www.hbs.edu/managing-the-future-of-work/research/hidden-workers-untapped-talent" },
    { title: "Veja dicas e boas práticas para o seu currículo na Gupy", publisher: "Gupy", url: "https://www.gupy.io/blog-do-emprego/boas-praticas-curriculo-gupy" },
    { title: "Recruiters spend 7.4 seconds looking at your resume", publisher: "HR Dive", url: "https://www.hrdive.com/news/recruiters-spend-74-seconds-looking-at-your-resume/541582/" },
    { title: "Resume guide", publisher: "Tech Interview Handbook", url: "https://www.techinterviewhandbook.org/resume/" },
    { title: "2025 AI in Hiring Report", publisher: "Greenhouse", url: "https://www.greenhouse.com/newsroom/an-ai-trust-crisis-70-of-hiring-managers-trust-ai-to-make-faster-and-better-hiring-decisions-only-8-of-job-seekers-call-it-fair" },
    { title: "Supported formats for resumes, cover letters and other candidate uploads", publisher: "Greenhouse Support", url: "https://support.greenhouse.io/hc/en-us/articles/360052218132" },
  ],
};
