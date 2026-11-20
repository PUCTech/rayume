import Link from "next/link";
import type { Article } from "../content";
import { Cite, Example, Note, Takeaways } from "../parts";

export const post: Article = {
  slug: "junior-resume-mistakes",
  title: "Ten mistakes on junior tech resumes, and the fix for each",
  description: "The skills list with 30 items, the links that 404, “Javascript” and “Github”. Small things a reader notices in the first look, each one fixable in minutes.",
  updated: "2026-11-08",
  minutes: 5,
  author: "The Rayume team",
  sections: [
    {
      id: "why-small",
      title: "Why small things cost so much",
      body: (
        <>
          <p>
            A junior resume rarely loses because of one big flaw. It loses to a pile of small ones that each say “didn’t check”. Laszlo Bock, who ran hiring at Google, put
            typos first on his list of the most common resume mistakes.
            <Cite n={1} /> None of the ten below takes more than a few minutes to fix.
          </p>
          <Takeaways
            title="The quick version"
            items={[
              "Spell tech names the way their owners do.",
              "Every link works, from a logged-out browser.",
              "A short skills list you can defend beats a long one you can’t.",
              "One column, one page, no bars, no photo.",
            ]}
          />
        </>
      ),
    },
    {
      id: "names",
      title: "1. Misspelled tech names",
      body: (
        <>
          <p>
            JavaScript, TypeScript, GitHub, PostgreSQL, Node.js, React, Next.js, MySQL, iOS. “Javascript”, “Github”, “NodeJS”, “Postgre” and “React.JS” are the giveaways. A
            reader who knows the tools notices, and a reader who doesn’t is searching for the exact string. Copy the spelling from the tool’s own website.
          </p>
        </>
      ),
    },
    {
      id: "skills-dump",
      title: "2. A skills list with 30 items",
      body: (
        <>
          <p>
            Listing every technology you’ve touched makes the reader guess which ones you actually know, and they’ll guess low. Keep what you could answer an interview
            question on, grouped by kind, and make sure each one shows up in a project.
          </p>
          <Example
            before="Skills: HTML, CSS, JavaScript, React, Angular, Vue, Svelte, Node, Python, Java, C, C++, C#, Go, Rust, Kotlin, Swift, SQL, MongoDB, Firebase, AWS, Azure, GCP, Docker, Kubernetes, Git, Linux, Figma, Excel, Word"
            after="Languages: TypeScript, Python, SQL. Frameworks: React, Next.js, FastAPI. Tools: PostgreSQL, Docker, Git, GitHub Actions."
          />
        </>
      ),
    },
    {
      id: "office",
      title: "3. “Proficient in Microsoft Office”",
      body: (
        <p>
          On a software resume it uses a line and lowers the average. The same goes for “Windows” and “Internet”. If a role really needs spreadsheet skills (data, product
          ops), say what you did with them instead: “Built the club’s budget model in Google Sheets”.
        </p>
      ),
    },
    {
      id: "dead-links",
      title: "4. Links that don’t work",
      body: (
        <>
          <p>
            A private repo shows a 404 to everyone but you. A Heroku demo from 2022 is probably gone. A portfolio on a free subdomain might now be someone else’s. Open
            every link on the PDF in a private window before each round of applications.
          </p>
          <p>
            The <Link href="/resources/github-profile">GitHub guide</Link> covers what the reader should find when the link does work.
          </p>
        </>
      ),
    },
    {
      id: "tutorial-projects",
      title: "5. Tutorial projects presented as your own idea",
      body: (
        <>
          <p>
            The weather app, the to-do list, the Netflix clone. Readers have seen them hundreds of times and can often name the YouTube video. A tutorial project is fine if
            you changed something real and say what. If you didn’t, cut it and keep the one project that was yours.
          </p>
          <Example
            before="Netflix clone — React, Firebase"
            after="Movie watchlist for my friends, based on a React tutorial; added shared lists and a Postgres backend with row-level permissions. 15 weekly users."
          />
        </>
      ),
    },
    {
      id: "objective",
      title: "6. An objective statement",
      body: (
        <p>
          “Motivated student seeking an opportunity to grow my skills in a dynamic company.” Every junior resume could say it, so it says nothing, and it takes the most
          valuable lines on the page. The Tech Interview Handbook lists the objective among things to leave out.
          <Cite n={2} /> If you want a summary line, make it a specific one: what you build and what you’re looking for.
        </p>
      ),
    },
    {
      id: "design",
      title: "7. A design that fights the reader",
      body: (
        <>
          <p>
            Two columns, icons for every contact detail, skill bars, a photo, a coloured sidebar. They look good in the template gallery of a design tool and badly
            everywhere else: in a parser, on a recruiter’s laptop, on paper. Ladders’ eye-tracking study found cluttered layouts and multiple columns did worst.
            <Cite n={3} />
          </p>
          <Note kind="warning">
            <p>“Python ●●●●○” is the worst of them. Four out of five compared to what? A parser reads it as junk, and a person reads it as a guess.</p>
          </Note>
        </>
      ),
    },
    {
      id: "dates",
      title: "8. Dates in three different formats",
      body: (
        <p>
          “03/2024”, “March 2024” and “2024.1” on the same page. Pick one format, “Mar 2024 – Jun 2025”, and use it everywhere, aligned in the same place on each line. For
          a degree you haven’t finished, write “Expected Dec 2027” so nobody wonders whether you dropped out.
        </p>
      ),
    },
    {
      id: "coursework",
      title: "9. Every course you’ve ever taken",
      body: (
        <p>
          Intro to Programming, Calculus I and Discrete Math are on every CS transcript. If you list coursework at all, pick three or four that match the job, like
          Distributed Systems for an infrastructure role, and put them on one line under Education.
        </p>
      ),
    },
    {
      id: "paragraphs",
      title: "10. Paragraphs instead of bullets",
      body: (
        <>
          <p>
            A block of five lines under a job title doesn’t get read. Break it into two or three bullets, one result each, each starting with a verb. The{" "}
            <Link href="/resources/blog/resume-verbs">post on verbs</Link> covers which ones.
          </p>
          <p>
            Then read the whole page aloud once. It’s the cheapest proofreading there is, and it catches the typo Bock warned about.
          </p>
        </>
      ),
    },
  ],
  sources: [
    { title: "The biggest mistakes Google sees in CVs (Laszlo Bock)", publisher: "World Economic Forum", url: "https://www.weforum.org/stories/2014/12/the-biggest-mistakes-google-sees-in-cvs/" },
    { title: "Resume guide", publisher: "Tech Interview Handbook", url: "https://www.techinterviewhandbook.org/resume/" },
    { title: "Recruiters spend 7.4 seconds looking at your resume", publisher: "HR Dive", url: "https://www.hrdive.com/news/recruiters-spend-74-seconds-looking-at-your-resume/541582/" },
  ],
};
