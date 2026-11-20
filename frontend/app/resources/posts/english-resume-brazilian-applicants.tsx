import Link from "next/link";
import type { Article } from "../content";
import { DoDont, Example, Note } from "../parts";

export const post: Article = {
  slug: "english-resume-brazilian-applicants",
  title: "Writing an English resume when Portuguese is your first language",
  description: "False friends, degree names, dates and grades: the translation slips that make a good Brazilian resume read oddly in English, and how to fix each one.",
  updated: "2026-11-19",
  minutes: 4,
  author: "The Rayume team",
  sections: [
    {
      id: "translate-meaning",
      title: "Translate what it means, not what it says",
      body: (
        <>
          <p>
            Most English resumes written by Brazilians are fine on grammar. What gives them away is a handful of words that look right and mean something else, plus
            Brazilian conventions for degrees, dates and grades that a US or European reader can’t decode. None of it will cost you an interview on its own. Together, they
            make a strong resume read like a translated one.
          </p>
          <p>Write the resume in English from the start if you can. When you translate, translate the meaning of each line, not its words.</p>
        </>
      ),
    },
    {
      id: "false-friends",
      title: "The false friends",
      body: (
        <>
          <table>
            <thead>
              <tr>
                <th>You might write</th>
                <th>It means</th>
                <th>Write instead</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Formation</td>
                <td>A shape, or soldiers in a line</td>
                <td>Education</td>
              </tr>
              <tr>
                <td>Acted as developer</td>
                <td>Pretended to be one</td>
                <td>Worked as a developer, or just the title</td>
              </tr>
              <tr>
                <td>I pretend to grow in the area</td>
                <td>I’m faking it</td>
                <td>I intend to, or I want to</td>
              </tr>
              <tr>
                <td>Realized a migration</td>
                <td>Noticed a migration</td>
                <td>Carried out, ran, or led a migration</td>
              </tr>
              <tr>
                <td>Attended clients</td>
                <td>Went to the clients’ events</td>
                <td>Supported, or served, clients</td>
              </tr>
              <tr>
                <td>Experiences in Python</td>
                <td>Several separate events involving Python</td>
                <td>Experience with Python</td>
              </tr>
              <tr>
                <td>Actually working at</td>
                <td>In fact working at</td>
                <td>Currently working at</td>
              </tr>
              <tr>
                <td>Professor at a course</td>
                <td>Usually a university faculty title</td>
                <td>Instructor, or teaching assistant</td>
              </tr>
            </tbody>
          </table>
          <Example
            before="Acted in the development of APIs and realized the migration of the database. Actually I am searching for opportunities in the area."
            after="Built 6 REST endpoints in FastAPI and led the migration from MySQL to PostgreSQL."
            note="Three false friends in two sentences. The second sentence goes entirely: a resume doesn’t say you’re looking. That’s what sending it means."
          />
        </>
      ),
    },
    {
      id: "degrees",
      title: "Degrees, courses and the TCC",
      body: (
        <>
          <ul>
            <li>
              <strong>Bacharelado em Ciência da Computação:</strong> “B.S. in Computer Science” or “Bachelor of Science in Computer Science”. Not “Bachelor in Computer
              Science Course”.
            </li>
            <li>
              <strong>Tecnólogo em Análise e Desenvolvimento de Sistemas:</strong> there’s no exact equivalent. “Associate-level degree in Systems Analysis and Development
              (Tecnólogo, 3 years)” tells the reader what it is.
            </li>
            <li>
              <strong>TCC:</strong> “Capstone project” or “Undergraduate thesis”. If it’s technical, list it under Projects with a link.
            </li>
            <li>
              <strong>Monitoria:</strong> “Teaching assistant”. <strong>Iniciação científica:</strong> “Undergraduate research assistant”, with the advisor and the funder (FAPESP,
              CNPq) if there is one.
            </li>
            <li>
              <strong>Estagiário:</strong> “Intern”, with the area: “Software Engineering Intern”, “Data Intern”. Don’t upgrade the title. The{" "}
              <Link href="/resources/blog/what-tailoring-should-change">tailoring post</Link> explains why.
            </li>
            <li>
              <strong>University names:</strong> keep them in Portuguese. “Pontifícia Universidade Católica de São Paulo (PUC-SP)”, not a translation nobody can search.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "dates-grades",
      title: "Dates, grades and phone numbers",
      body: (
        <>
          <p>
            <strong>Dates:</strong> “03/04/2025” is 3 April in Brazil and March 4 in the US. Even “03/2025” makes the reader stop and work it out. Write the month as a
            word: “Mar 2025 – Present”. For a degree in progress, “Expected Dec 2027”.
          </p>
          <p>
            <strong>Grades:</strong> a CR or média of 8.2 out of 10 doesn’t convert to a US GPA by any formula a recruiter trusts. Either leave it off, which is what most
            students should do anyway, or write it with its scale: “CR 8.2/10”. Never invent a 3.7.
          </p>
          <p>
            <strong>Phone:</strong> add the country code, “+55 11 91234-5678”, if you’re applying abroad or to remote roles. City: “São Paulo, Brazil”, since “SP” means
            nothing outside the country.
          </p>
        </>
      ),
    },
    {
      id: "english-level",
      title: "How to say how good your English is",
      body: (
        <>
          <p>
            “English: advanced” means different things to different people. Make it checkable: a CEFR level (“C1”) if you took a test, or evidence (“daily use with a US
            team during a 12-month estágio”). If the job is in English, the resume itself is your first writing sample, which is one more reason to get the false friends
            out.
          </p>
          <DoDont
            do={["Pick American or British spelling and stick to it.", "Use past tense for past roles and present for your current one.", "Ask a friend who reads English daily to check it once."]}
            dont={["Run the Portuguese version through a translator and send it unread.", "Mix “optimize” and “optimise” on the same page.", "Translate “inglês fluente” as “fluent English” if you’re not."]}
          />
          <Note>
            <p>
              Rayume writes your English resume from the facts in your master resume rather than translating your Portuguese text, so most of the false friends never get a
              chance to appear. Read the result anyway. It’s your name at the top.
            </p>
          </Note>
        </>
      ),
    },
  ],
};
