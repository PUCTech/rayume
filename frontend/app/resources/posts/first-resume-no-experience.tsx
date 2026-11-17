import Link from "next/link";
import type { Article } from "../content";
import { Cite, Example } from "../parts";

export const post: Article = {
  slug: "first-resume-no-experience",
  title: "Your first resume with no job experience",
  description: "No internship yet is a normal place to start. Projects, coursework, TA work and even a supermarket job can fill a page with real evidence.",
  updated: "2026-10-28",
  minutes: 3,
  author: "The Rayume team",
  sections: [
    {
      id: "more-than-you-think",
      title: "You have more than you think",
      body: (
        <>
          <p>
            When Laszlo Bock, then head of hiring at Google, explained how to measure work that seems unmeasurable, he reached for a grocery store:
          </p>
          <blockquote>
            “‘Served 85 customers per day with 100% accuracy’ sounds good, even if the customers are people you rang up at a grocery store.”
            <Cite n={1} />
          </blockquote>
          <p>
            And a restaurant: “achieving 120% of dessert sales targets (compared to an average of 98%)”.
            <Cite n={1} /> The point isn’t that waiting tables is tech experience. It’s that something measured beats something impressive.
          </p>
          <p>
            Employers aren’t only scanning for job titles anyway. In NACE’s survey of 237 US employers, nearly 90% look for evidence of problem-solving on a resume and nearly
            80% for teamwork.
            <Cite n={2} /> You can show both without ever having had a tech job.
          </p>
        </>
      ),
    },
    {
      id: "where",
      title: "What goes where",
      body: (
        <>
          <p>
            <strong>Education goes first.</strong> You’re a student, and the reader knows it. The Tech Interview Handbook puts education at the top for anyone still
            studying.
            <Cite n={3} /> Add three or four relevant courses only if they match the job (Databases for a backend role, Computer Graphics for a game studio). Nobody needs to
            see Intro to Programming. Leave the GPA off unless it’s strong: fewer than 40% of US employers screen by it.
            <Cite n={4} />
          </p>
          <p>
            <strong>Projects are your experience.</strong> At least two, each name linked to the repo or a live demo, with your own part spelled out.
            <Cite n={3} /> A course project counts. A bot you wrote for your friends’ Discord server counts. Something you never finished counts if you can say what you
            learned and what you’d do next.
          </p>
          <p>
            <strong>Experience is anything someone relied on you for.</strong> A part-time job, monitoria, freelance work, the family business, organizing an event.
          </p>
          <p>
            <strong>Skills come last, and your projects back them up.</strong> If Docker is in the skills line, a project should mention Docker. A reader who can’t find a
            skill used anywhere on the page will assume it came from a tutorial, and they’ll often be right.
          </p>
        </>
      ),
    },
    {
      id: "lines",
      title: "Lines you could write today",
      body: (
        <>
          <p>Each one follows Bock’s formula: what you achieved, measured against something, and how.</p>
          <Example
            before="Cashier at a supermarket."
            after="Served about 80 customers per shift at a supermarket checkout, with the lowest cash-drawer discrepancy on a team of 9 for six months."
          />
          <Example
            before="Made a Discord bot."
            after="Built a TypeScript Discord bot that schedules study sessions for 3 university servers (900 members); 40 stars on GitHub."
          />
          <Example
            before="Final project for the Databases course."
            after="Designed the schema for a library-loans system in the Databases course; adding two indexes cut the slowest report from 12 s to 0.4 s."
          />
          <Example
            before="Helped organize a hackathon."
            after="Co-organized a 200-person student hackathon: raised R$ 15,000 from four sponsors and coordinated 12 volunteers on the day."
            note="Shows teamwork and initiative without the word “teamwork” anywhere."
          />
          <p>
            Every number has to be true and explainable. If you counted customers by feel, say “about”. The <Link href="/resources/resume-guide">resume guide</Link> has more on
            finding numbers when you think you have none.
          </p>
        </>
      ),
    },
    {
      id: "internship",
      title: "Then go get the internship",
      body: (
        <>
          <p>
            This resume has one job: getting you the first internship. After that, the internship does most of the work. In NACE’s Job Outlook 2026, an internship at the
            employer’s own organization or in its industry tops the list of tiebreakers between two equal candidates.
            <Cite n={5} /> In Brazil, that’s the estágio, and it belongs under Experience.
          </p>
          <p>
            One Brazil-specific cleanup while you’re at it. Old templates still ask for a photo, date of birth, estado civil and CPF. Leave them all out. Lei 9.029/1995
            prohibits discrimination in hiring on grounds including sex, race, marital status, family situation and age,
            <Cite n={6} /> and Gupy tells candidates plainly: “Não insira imagens nem fotos.”
            <Cite n={7} /> City and state is all the address anyone needs.
          </p>
        </>
      ),
    },
  ],
  sources: [
    { title: "My personal formula for a winning resume (Laszlo Bock)", publisher: "LinkedIn, copy hosted by Cal State LA", url: "https://www.calstatela.edu/sites/default/files/formula_for_a_winning_resume.docx" },
    { title: "What are employers looking for when reviewing college students’ resumes?", publisher: "NACE", url: "https://naceweb.org/talent-acquisition/candidate-selection/what-employers-seek-on-a-resume" },
    { title: "Resume guide", publisher: "Tech Interview Handbook", url: "https://www.techinterviewhandbook.org/resume/" },
    { title: "Job Outlook 2025 Spring Update", publisher: "NACE", url: "https://naceweb.org/research/reports/job-outlook/2025/spring-update" },
    { title: "Internship experience often the deciding factor between equal candidates", publisher: "NACE", url: "https://naceweb.org/talent-acquisition/candidate-selection/internship-experience-often-the-deciding-factor-between-equal-candidates" },
    { title: "Lei nº 9.029, de 13 de abril de 1995", publisher: "Planalto", url: "https://www.planalto.gov.br/ccivil_03/leis/l9029.htm" },
    { title: "Veja dicas e boas práticas para o seu currículo na Gupy", publisher: "Gupy", url: "https://www.gupy.io/blog-do-emprego/boas-praticas-curriculo-gupy" },
  ],
};
