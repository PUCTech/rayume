import Link from "next/link";
import type { Article } from "../content";
import { Cite, Example, Note } from "../parts";

export const post: Article = {
  slug: "resume-verbs",
  title: "Verbs that say what you did",
  description: "“Responsible for”, “helped with” and “worked on” hide your work. “Spearheaded” and “leveraged” hide it differently. How to pick the plain verb that’s true.",
  updated: "2026-11-15",
  minutes: 3,
  author: "The Rayume team",
  sections: [
    {
      id: "first-word",
      title: "The first word does most of the work",
      body: (
        <>
          <p>
            A reader skimming your resume reads the start of each bullet and decides whether to read the rest. That first word is a verb, and it should say what{" "}
            <em>you</em> did. Harvard’s career office lists “using passive language instead of ‘action’ words” among the top resume mistakes, and tells students not to use
            personal pronouns.
            <Cite n={1} /> Laszlo Bock’s formula starts the same way: “start with an active verb”.
            <Cite n={2} />
          </p>
          <p>Two kinds of verbs fail that test, and they fail in opposite directions.</p>
        </>
      ),
    },
    {
      id: "too-weak",
      title: "Too weak: verbs that hide you",
      body: (
        <>
          <p>
            “Responsible for”, “worked on”, “helped with”, “participated in”, “assisted in”, “involved in”. They describe being near the work. A reader can’t tell whether you
            wrote the code or watched someone else write it, and they’ll assume the second.
          </p>
          <Example
            before="Responsible for the backend of the app."
            after="Wrote the FastAPI backend for a campus events app: 14 endpoints, JWT auth and a Postgres schema with 9 tables."
          />
          <Example
            before="Helped with the migration to TypeScript."
            after="Migrated 40 of the app’s 120 React components to TypeScript, fixing 23 type errors the old code was hiding."
            note="If you did part of something, the fix isn’t “helped”. It’s saying which part, with a number."
          />
        </>
      ),
    },
    {
      id: "too-loud",
      title: "Too loud: verbs from a thesaurus",
      body: (
        <>
          <p>
            “Spearheaded”, “orchestrated”, “leveraged”, “synergized”, “revolutionized”. These come from resume-builder verb lists and, more and more, from AI drafts. On a
            student resume they read as inflation, and an interviewer will happily ask what exactly you spearheaded on a three-person course project.
          </p>
          <Example
            before="Spearheaded the end-to-end orchestration of a cutting-edge data pipeline leveraging Python."
            after="Built a Python pipeline that pulls 50,000 rows a day from the city’s open bus data into Postgres, replacing a manual weekly CSV download."
          />
        </>
      ),
    },
    {
      id: "plain-verbs",
      title: "Plain verbs, sorted by what you did",
      body: (
        <>
          <table>
            <thead>
              <tr>
                <th>What you did</th>
                <th>Verbs</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Made something new</td>
                <td>Built, wrote, designed, created, shipped, launched</td>
              </tr>
              <tr>
                <td>Made something better</td>
                <td>Cut, reduced, sped up, raised, improved, simplified</td>
              </tr>
              <tr>
                <td>Replaced something</td>
                <td>Migrated, rewrote, replaced, moved, upgraded</td>
              </tr>
              <tr>
                <td>Saved people time</td>
                <td>Automated, scripted, removed, consolidated</td>
              </tr>
              <tr>
                <td>Found or fixed problems</td>
                <td>Fixed, debugged, diagnosed, tested, profiled</td>
              </tr>
              <tr>
                <td>Worked with people</td>
                <td>Led, taught, mentored, coordinated, organized, presented</td>
              </tr>
              <tr>
                <td>Worked with data</td>
                <td>Analyzed, modeled, measured, cleaned, visualized</td>
              </tr>
            </tbody>
          </table>
          <p>
            “Led” is the one to be careful with. Use it if people did what you said, not because you were the one who created the group chat.
          </p>
        </>
      ),
    },
    {
      id: "tense",
      title: "Tense, and the verb you repeat",
      body: (
        <>
          <p>
            Past tense for anything finished, present tense for the role you’re in now. Don’t mix them inside one entry. And don’t start every bullet with “Developed”.
            Repeating a verb three times on a page is fine; seven times means the bullets all sound the same, and probably are.
          </p>
          <Note>
            <p>
              The verb has to match the rest of the bullet. “Cut load time” needs a before-and-after number to follow it. The{" "}
              <Link href="/resources/resume-guide#numbers">resume guide</Link> covers finding numbers when you think you have none.
            </p>
          </Note>
        </>
      ),
    },
  ],
  sources: [
    { title: "Create a strong resume", publisher: "Harvard FAS Office of Career Services", url: "https://careerservices.fas.harvard.edu/resources/create-a-strong-resume" },
    { title: "My personal formula for a winning resume (Laszlo Bock)", publisher: "LinkedIn, copy hosted by Cal State LA", url: "https://www.calstatela.edu/sites/default/files/formula_for_a_winning_resume.docx" },
  ],
};
