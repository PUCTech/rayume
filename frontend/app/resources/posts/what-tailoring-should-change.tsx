import Link from "next/link";
import type { Article } from "../content";
import { Cite, Example } from "../parts";

export const post: Article = {
  slug: "what-tailoring-should-change",
  title: "What tailoring should and shouldn’t change",
  description: "Tailoring a resume to a job means changing words and order. It never means changing facts. Here is where the line sits.",
  updated: "2026-11-04",
  minutes: 4,
  author: "The Rayume team",
  sections: [
    {
      id: "why",
      title: "Why the same resume underperforms",
      body: (
        <>
          <p>
            Recruiters search. Jobscan, which sells keyword-matching tools, surveyed 384 recruiters in 2025: 76.4% filter candidates by skill keywords first, 59.7% by
            education, 55.3% by job title.
            <Cite n={1} /> Weigh it as vendor data, but it matches how these systems are built.
          </p>
          <p>
            The independent version is grimmer. In Harvard Business School and Accenture’s <em>Hidden Workers</em> study, 88% of employers agreed that qualified high-skills
            candidates are vetted out “because they do not match the exact criteria established by the job description.”
            <Cite n={2} /> In Brazil, Gupy’s AI compares “o texto da descrição da vaga e do seu currículo” and doesn’t translate between them,
            <Cite n={3} /> and its ranking rises with how well you fit the profile.
            <Cite n={4} />
          </p>
          <p>
            Exact criteria, compared as text. Send the same resume to fifty jobs and you have sent a slightly wrong resume fifty times.
          </p>
        </>
      ),
    },
    {
      id: "should",
      title: "What tailoring should change",
      body: (
        <>
          <ul>
            <li>
              <strong>The words for the same thing.</strong> The posting says PostgreSQL and you wrote Postgres. The posting says CI/CD and you wrote “deploy pipeline”. Use
              theirs.
            </li>
            <li>
              <strong>The order.</strong> For a data role, the pandas pipeline goes above the React app. For a frontend role, the other way round.
            </li>
            <li>
              <strong>Which projects appear.</strong> You have five and room for three. Pick the three this job cares about.
            </li>
            <li>
              <strong>The emphasis of a bullet.</strong> Same facts, different detail up front: the latency number for a backend role, the accessibility work for a frontend
              one.
            </li>
            <li>
              <strong>The language.</strong> English posting, English resume. Gupy says so outright.
              <Cite n={3} />
            </li>
          </ul>
          <Example
            before="Built a REST API in Python for a course project."
            after="Built a REST API in Python (FastAPI, PostgreSQL) for a course project, with tests running in CI on GitHub Actions."
            note="Tailored for a backend posting that lists FastAPI, PostgreSQL and CI. Every word added was already true; it just wasn’t on the page."
          />
          <h3>A ten-minute version</h3>
          <p>
            Paste the posting somewhere you can mark it up. Highlight every tool, language and skill it names. For each one, ask two questions: is it true of me, and does my
            resume say so in these exact words? The true-but-missing ones are your edits. The false ones stay off, however often the posting repeats them.
          </p>
          <p>
            Keep a master copy with everything you’ve done, and cut a tailored version from it for each application. Editing down is fast. Rewriting from scratch every time
            is how people end up with a typo in the company’s name.
          </p>
        </>
      ),
    },
    {
      id: "never",
      title: "What it should never change",
      body: (
        <>
          <p>
            Dates, employers, job titles, grades, and skills you don’t have. Kubernetes doesn’t go on the resume because the posting mentions it and you watched a video.
            Titles are where people slip most: translating “Estagiário de TI” to “IT Intern” for an English resume is fine. Turning it into “Software Engineer” because the
            posting asks for one isn’t.
          </p>
          <p>
            The practical reason is the interview. Every line is a question someone can ask, and a skill you invented falls apart in the first follow-up. Gupy warns that
            “descrições infladas ou irreais podem prejudicar sua candidatura quando chegar à análise humana”,
            <Cite n={5} /> and Laszlo Bock, who ran hiring at Google, treated any lie on a resume as disqualifying.
            <Cite n={6} />
          </p>
          <p>
            Then there are the tricks. In Greenhouse’s 2025 survey, 41% of US job seekers admitted to using prompt injections to get past AI screening, and 22% of hiring
            managers said they had caught hidden prompt injections in resumes; 65% had caught candidates using AI deceptively.
            <Cite n={7} /> White text on a white page stays hidden only until somebody presses select-all.
          </p>
        </>
      ),
    },
    {
      id: "rayume",
      title: "How we drew the line in Rayume",
      body: (
        <>
          <p>
            We designed Rayume’s tailoring around this split. The AI may reorder, choose which projects appear, and reword your entries to use the posting’s terms. Facts such
            as employers, dates, contact details and links are copied from your master resume rather than written by the model, and it can’t point to an experience you never
            entered.
          </p>
          <p>
            Tailoring is editing. If a change would make your resume say something you couldn’t explain in an interview, it isn’t tailoring any more. For the rest of the
            parser rules, see the <Link href="/resources/ats-checklist">ATS checklist</Link>; for the interview itself, the <Link href="/resources/interview-prep">interview guide</Link>.
          </p>
        </>
      ),
    },
  ],
  sources: [
    { title: "ATS-ready resumes", publisher: "Jobscan", url: "https://www.jobscan.co/organizations/ats-ready-resumes/" },
    { title: "Hidden workers: untapped talent", publisher: "Harvard Business School and Accenture", url: "https://www.hbs.edu/managing-the-future-of-work/research/hidden-workers-untapped-talent" },
    { title: "Veja dicas e boas práticas para o seu currículo na Gupy", publisher: "Gupy", url: "https://www.gupy.io/blog-do-emprego/boas-praticas-curriculo-gupy" },
    { title: "Ordenação de pessoas candidatas", publisher: "Gupy", url: "https://www.gupy.io/inteligencia-artificial/ordenacao-de-pessoas-candidatas-em-vagas" },
    { title: "Como passar pelos agentes de IA da Gupy", publisher: "Gupy", url: "https://www.gupy.io/blog-do-emprego/como-passar-pela-ia-da-gupy" },
    { title: "The biggest mistakes Google sees in CVs (Laszlo Bock)", publisher: "World Economic Forum", url: "https://www.weforum.org/stories/2014/12/the-biggest-mistakes-google-sees-in-cvs/" },
    { title: "2025 AI in Hiring Report", publisher: "Greenhouse", url: "https://www.greenhouse.com/newsroom/an-ai-trust-crisis-70-of-hiring-managers-trust-ai-to-make-faster-and-better-hiring-decisions-only-8-of-job-seekers-call-it-fair" },
  ],
};
