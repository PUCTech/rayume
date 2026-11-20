import Link from "next/link";
import type { Article } from "../content";
import { Cite, Example, Note } from "../parts";

export const article: Article = {
  slug: "resume-guide",
  title: "How to write your first tech resume",
  description: "One page, the right order, bullets with numbers in them, and what to leave out in Brazil and the US. Everything sourced.",
  updated: "2026-11-17",
  minutes: 10,
  author: "The Rayume team",
  sections: [
    {
      id: "one-page",
      title: "Keep it to one page",
      body: (
        <>
          <p>
            If you’re a student or a recent grad, that’s the whole rule. The Tech Interview Handbook, a popular guide by a former Meta engineer, puts it flatly: “Use
            only 1 page for your resume.”
            <Cite n={1} /> Laszlo Bock, who ran hiring at Google, is reported to work on roughly one page per ten years of experience.
            <Cite n={2} /> Harvard’s career office hands its students one-page templates.
            <Cite n={3} />
          </p>
          <p>
            A second page doesn’t make you look more experienced. It makes the reader choose what to skip, and they will skip the wrong thing. When you run long, cut the
            weakest bullet. Don’t shrink the font.
          </p>
          <p>
            Bock’s description of the job is worth keeping in mind for everything below: “The sole purpose of a resume is to get you past that first screen and into an
            interview.”
            <Cite n={4} /> It isn’t your biography. It’s the case for one meeting.
          </p>
        </>
      ),
    },
    {
      id: "order",
      title: "Section order for students and new grads",
      body: (
        <>
          <p>
            Put education first while you’re still in school. Recruiters know you’re a student; hiding it fools no one. The Tech Interview Handbook recommends education at
            the top for anyone still studying or with under three years of experience.
            <Cite n={1} />
          </p>
          <h3>While you’re studying</h3>
          <ol>
            <li>
              <strong>Header:</strong> name, email, phone, city, GitHub, LinkedIn or portfolio.
            </li>
            <li>
              <strong>Education:</strong> university, degree, expected graduation month and year.
            </li>
            <li>
              <strong>Experience:</strong> internships, estágios, TA or monitoria work, part-time jobs.
            </li>
            <li>
              <strong>Projects:</strong> two or three, each one linked.
            </li>
            <li>
              <strong>Skills.</strong>
            </li>
            <li>
              <strong>Optional:</strong> hackathons, clubs, leadership, if they don’t already appear above.
            </li>
          </ol>
          <h3>Once you have real work experience</h3>
          <p>
            After a full-time job or a substantial internship, move Experience above Education, and let Education shrink to two lines. Drop the GPA unless it’s strong:
            fewer than 40% of US employers screen by GPA, a figure NACE has reported three years running.
            <Cite n={5} />
          </p>
          <p>
            The order matters less than what the reader finds in it. In NACE’s survey of 237 US employers, nearly 90% look for evidence of problem-solving on a resume and
            nearly 80% for teamwork; written communication, initiative, work ethic and technical skills each clear 70%.
            <Cite n={6} /> Note the word <em>evidence</em>. A skills list can’t show teamwork. A bullet about the four-person project you shipped can.
          </p>
        </>
      ),
    },
    {
      id: "projects",
      title: "Projects and hackathons",
      body: (
        <>
          <p>
            For a student, projects are experience. The Tech Interview Handbook asks for at least two, with your own contribution spelled out and each project name linked to
            somewhere it can be seen.
            <Cite n={1} />
          </p>
          <p>
            A project entry needs four things: the name, linked; one line on what it is; the stack; and one or two bullets on what <em>you</em> did and what came of it. If it
            was a team of four, say which part was yours. The interviewer is going to ask anyway.
          </p>
          <Example
            before="Built a campus app using React Native and Firebase."
            after="Built the class-schedule screen of a React Native campus app used by 1,200 PUC-SP students, cutting load time from 3.1 s to 0.8 s by caching timetables offline."
            note="Who used it, how many, which part was yours, and a before-and-after number."
          />
          <h3>Hackathons</h3>
          <p>
            A hackathon is a project with a deadline and a scoreboard, so write it like one: what you built, how long you had, the stack, and where you placed out of how
            many teams. “2nd of 48 teams” says more than “Finalist”, and far more than “Participated”.
          </p>
          <Example
            before="Participated in a university hackathon."
            after="Placed 2nd of 48 teams at a 36-hour hackathon with a Pix fraud-alert prototype; built the FastAPI scoring service and the demo dashboard."
          />
        </>
      ),
    },
    {
      id: "experience",
      title: "Internships, estágios and TA work",
      body: (
        <>
          <p>
            Internships are the strongest single signal US employers name. In NACE’s Job Outlook 2026, when employers choose between two otherwise equal candidates, an
            internship at their own organization and an internship in their industry are the top tiebreakers, ahead of leadership, extracurriculars and a GPA of 3.0 or
            higher.
            <Cite n={7} />
          </p>
          <p>
            In Brazil the equivalent is the estágio. List it under Experience with your real title (“Software Engineering Intern” or “Estagiário de Desenvolvimento”,
            matching the language of the resume), not in a separate box of its own. A year-long estágio at a fintech is a job. Write it like one.
          </p>
          <p>
            Teaching-assistant work counts too. A monitoria shows you understand a subject well enough to explain it, and it comes with numbers attached: how many students,
            how many hours, which course.
          </p>
          <Example
            before="Teaching assistant for Data Structures."
            after="Ran weekly lab sessions for 60 Data Structures students and wrote 14 autograded Python exercises the course reused the next semester."
          />
          <p>
            Jobs outside tech belong on the page if you have the room. Some of the best bullets Bock ever quoted came from a grocery store and a restaurant, which brings us to
            the formula.
          </p>
        </>
      ),
    },
    {
      id: "xyz",
      title: "Write bullets with the XYZ formula",
      body: (
        <>
          <p>
            Bock published it on LinkedIn in 2014, while he was head of People Operations at Google, and it’s still the best single rule for a bullet: “Accomplished [X] as
            measured by [Y] by doing [Z].”
            <Cite n={4} />
          </p>
          <blockquote>
            “In other words, start with an active verb, numerically measure what you accomplished, provide a baseline for comparison, and detail what you did to achieve your
            goal.”
            <Cite n={4} />
          </blockquote>
          <p>
            Plenty of blogs garble it into “X by doing Y, resulting in Z”. The wording above is the original, and the part people drop is the baseline. Here’s Bock’s own
            rewrite:
          </p>
          <Example
            before="Studied financial performance of companies and made investment recommendations."
            after="Improved portfolio performance by 12% ($1.2M) over one year by refining cost of capital calculations for information-poor markets and re-weighting portfolio based on resulting valuations."
            note={
              <>
                Bock’s example, word for word. “Adding ‘($1.2M)’ anticipates the reviewer’s question about whether 12% is a big deal or not.”
                <Cite n={4} />
              </>
            }
          />
          <p>The same move works on a student resume:</p>
          <Example
            before="Worked on the backend of a group project."
            after="Cut API p95 latency from 900 ms to 180 ms on a four-person course project by adding Redis caching and indexing the two slowest Postgres queries."
          />
          <Example
            before="Helped run the coding club."
            after="Grew the university coding club from 25 to 110 members in two semesters by running weekly problem-solving sessions and a first-year mentoring program."
          />
          <Example
            before="Responsible for testing."
            after="Raised test coverage on my estágio team’s billing service from 41% to 78% by writing 120 pytest cases for the invoice and refund flows."
            note="“Responsible for” describes a job ad. Start with what you did."
          />
        </>
      ),
    },
    {
      id: "numbers",
      title: "Numbers when you have no metrics",
      body: (
        <>
          <p>
            “I have nothing to measure” is the objection everyone raises, and Bock answered it in the same post: “You might feel like it’s hard to measure your work, but
            there is almost always something you can point to.”
            <Cite n={4} /> His examples aren’t from tech at all:
          </p>
          <blockquote>
            “‘Served 85 customers per day with 100% accuracy’ sounds good, even if the customers are people you rang up at a grocery store. It’s even more impressive if you
            can add, ‘…compared to an average of 70 customers at 90% accuracy for my peers.’”
            <Cite n={4} />
          </blockquote>
          <p>Things a student can count without a company dashboard:</p>
          <ul>
            <li>Users, downloads, GitHub stars or forks of something you built.</li>
            <li>Before and after: load time, bundle size, query time, build time.</li>
            <li>Test coverage, endpoints, screens.</li>
            <li>The size of the dataset you worked with.</li>
            <li>Placement out of how many teams, and the time limit.</li>
            <li>Students, hours and sessions for TA work; members and events for a club.</li>
          </ul>
          <p>
            Two rules. Every number needs a baseline, Bock’s Y: “180 ms” means little, “from 900 ms to 180 ms” means something. And every number has to survive “how did you
            measure that?” An estimate is fine if you can explain it in the interview. An invented number isn’t: Bock treats any lie on a resume as disqualifying.
            <Cite n={2} />
          </p>
          <Note>
            <p>No users yet? Measure on your own machine. “Raised the Lighthouse performance score from 54 to 92” is a real, checkable number.</p>
          </Note>
        </>
      ),
    },
    {
      id: "skills",
      title: "A skills section that holds up",
      body: (
        <>
          <p>
            Think of it as a lookup table, not a brag sheet. Recruiters search their applicant tracking system by skill (the{" "}
            <Link href="/resources/ats-checklist">ATS checklist</Link> has the numbers), so the names should be the ones in the posting, spelled the way the posting spells them.
          </p>
          <ul>
            <li>Group by kind, one line each: Languages, Frameworks, Databases, Tools.</li>
            <li>Name things precisely: “PostgreSQL”, not “databases”; “React”, not “frontend”.</li>
            <li>List only what you could take an interview question on. One weekend tutorial doesn’t make Rust a skill yet.</li>
            <li>Skip the bars and stars. “Python ●●●●○” means nothing to a person and parses as junk.</li>
            <li>Skip soft skills as a list. “Teamwork” in a skills line proves nothing; the bullet about the team project does.</li>
          </ul>
          <p>
            Spoken languages go here too, and for Brazilian readers this isn’t filler. If you’re applying to US remote roles, “English: fluent, daily use in an estágio” is
            worth a line. More on that in the <Link href="/resources/interview-prep">interview guide</Link>.
          </p>
        </>
      ),
    },
    {
      id: "links",
      title: "Links",
      body: (
        <>
          <p>
            GitHub, LinkedIn and a portfolio if you have one, in the header. Link each project name to its repo or live demo.
            <Cite n={1} />
          </p>
          <p>
            Show the address as text: <code>github.com/lucasm</code>, not the word “GitHub” with a link behind it. Hyperlinks get lost when a parser extracts the text or a
            recruiter prints the page; the address survives both. Then check what the links lead to. A reader who clicks through to a GitHub profile full of empty forks has
            learned something, and it isn’t good. The <Link href="/resources/github-profile">GitHub guide</Link> covers what they should find instead.
          </p>
        </>
      ),
    },
    {
      id: "leave-out",
      title: "What to leave out, in Brazil and the US",
      body: (
        <>
          <p>
            Brazilian resumes have traditionally carried a photo, age, estado civil, CPF or RG, and a full street address. None of it helps you, and some of it invites the
            exact discrimination the law prohibits.
          </p>
          <h3>In Brazil</h3>
          <p>
            Lei 9.029/1995, as amended in 2015, prohibits “qualquer prática discriminatória e limitativa para efeito de acesso à relação de trabalho” on grounds that include
            sex, origin, race, color, marital status, family situation, disability and age.
            <Cite n={8} /> There’s no reason to hand those over on page one. Vagas.com lists estado civil among the things not to include and notes that the LGPD treats a
            photo as sensitive data, because it can reveal racial or ethnic origin.
            <Cite n={9} /> Gupy’s own candidate guidance is blunter: “Não insira imagens nem fotos”, since its AI doesn’t read images and they can break the import.
            <Cite n={10} />
          </p>
          <ul>
            <li>
              <strong>Photo:</strong> out. Keep it for LinkedIn.
            </li>
            <li>
              <strong>Age or date of birth:</strong> out.
            </li>
            <li>
              <strong>Estado civil, children:</strong> out.
            </li>
            <li>
              <strong>CPF, RG:</strong> out. The company asks for them when it hires you, not before.
            </li>
            <li>
              <strong>Full address:</strong> city and state is enough. “São Paulo, SP.”
            </li>
          </ul>
          <h3>In the US</h3>
          <p>
            Harvard’s career office lists a picture, age and gender among the things a resume shouldn’t include,
            <Cite n={3} /> and Harvard Law School tells applicants to “save the headshot for LinkedIn.”
            <Cite n={11} /> US employers would rather not receive protected-class information at all.
          </p>
          <Note kind="warning">
            <p>
              A Brazilian job site’s article on photos claims that some countries, “como os Estados Unidos”, usually require one.
              <Cite n={9} /> It has it backwards. US norms are firmly against photos.
            </p>
          </Note>
          <h3>Everywhere</h3>
          <p>
            Also cut “references available on request” (everyone knows), the objective statement, your current employer’s phone number or email,
            <Cite n={1} /> and anything confidential about a past employer. Bock reported that 5 to 10% of the resumes he reviewed leaked confidential information, which on
            its own meant no hire.
            <Cite n={2} />
          </p>
        </>
      ),
    },
    {
      id: "file",
      title: "File format and file name",
      body: (
        <>
          <p>
            Send a PDF with real, selectable text unless the posting asks for something else. Greenhouse, an ATS that shows up all over US tech hiring, accepts DOC, DOCX,
            PDF, RTF and TXT,
            <Cite n={12} /> and the Tech Interview Handbook recommends PDF with highlightable text.
            <Cite n={1} /> Keep it light, too: “Greenhouse Recruiting can’t parse resumes larger than 2.5MB.”
            <Cite n={13} />
          </p>
          <p>
            To test a file, open it, select all, copy, and paste into a plain-text editor. If the text comes out complete and in order, a parser can read it.
          </p>
          <h3>Gupy and DOCX</h3>
          <p>
            Gupy is the exception that matters in Brazil. Its guidance says “Prefira salvar o documento no formato doc ou docx” and claims PDFs are read as images.
            <Cite n={10} /> That’s true of a scanned PDF, not of one with a text layer, but it’s their system. Two things to know. Gupy parses your file into its own profile
            fields, and that profile is what companies see, so after uploading, read every field it filled in and fix what it got wrong. And if a posting explicitly asks for
            DOCX, send DOCX. Rayume exports PDF only, so on Gupy that review step is on you.
          </p>
          <h3>The file name</h3>
          <p>
            <code>Firstname-Lastname-Resume.pdf</code>. No spaces, no “final_v3”, no “CV (2)”. No standard requires it; it just makes your file easy to find in a folder of
            200 downloads.
          </p>
        </>
      ),
    },
    {
      id: "seconds",
      title: "About the 7.4 seconds",
      body: (
        <>
          <p>
            You’ve probably read that recruiters spend six or seven seconds on a resume. The number comes from Ladders, a job-search company, whose 2018 eye-tracking study
            found an average initial screen of 7.4 seconds, up from about six in its 2012 edition.
            <Cite n={14} />
          </p>
          <p>
            Read it with care. The report never said how many recruiters took part, how experienced they were, or what jobs and resumes they looked at, and Ladders sells
            job-search services. Susan Gygax, a recruiter writing for ERE, called it a “vacuum metric” and pointed out that it implies about ten resumes a minute.
            <Cite n={15} />
          </p>
          <p>
            What the study said about layout is more useful than the number. Simple layouts, clear headings, bold titles and bulleted accomplishments held attention;
            cluttered pages, multiple columns and long sentences did worst.
            <Cite n={14} /> So take 7.4 seconds to mean “the first look is short”, not a stopwatch. Everything above is about making that first look count. Then run the page
            through the <Link href="/resources/ats-checklist">ATS checklist</Link>.
          </p>
        </>
      ),
    },
  ],
  sources: [
    { title: "Resume guide", publisher: "Tech Interview Handbook", url: "https://www.techinterviewhandbook.org/resume/" },
    { title: "The biggest mistakes Google sees in CVs (Laszlo Bock)", publisher: "World Economic Forum", url: "https://www.weforum.org/stories/2014/12/the-biggest-mistakes-google-sees-in-cvs/" },
    { title: "Create a strong resume", publisher: "Harvard FAS Office of Career Services", url: "https://careerservices.fas.harvard.edu/resources/create-a-strong-resume" },
    { title: "My personal formula for a winning resume (Laszlo Bock)", publisher: "LinkedIn, copy hosted by Cal State LA", url: "https://www.calstatela.edu/sites/default/files/formula_for_a_winning_resume.docx" },
    { title: "Job Outlook 2025 Spring Update", publisher: "NACE", url: "https://naceweb.org/research/reports/job-outlook/2025/spring-update" },
    { title: "What are employers looking for when reviewing college students’ resumes?", publisher: "NACE", url: "https://naceweb.org/talent-acquisition/candidate-selection/what-employers-seek-on-a-resume" },
    { title: "Internship experience often the deciding factor between equal candidates", publisher: "NACE", url: "https://naceweb.org/talent-acquisition/candidate-selection/internship-experience-often-the-deciding-factor-between-equal-candidates" },
    { title: "Lei nº 9.029, de 13 de abril de 1995", publisher: "Planalto", url: "https://www.planalto.gov.br/ccivil_03/leis/l9029.htm" },
    { title: "Devo colocar uma foto no currículo?", publisher: "Vagas.com", url: "https://www.vagas.com.br/blog/?p=3164" },
    { title: "Veja dicas e boas práticas para o seu currículo na Gupy", publisher: "Gupy", url: "https://www.gupy.io/blog-do-emprego/boas-praticas-curriculo-gupy" },
    { title: "Real talk: the resume", publisher: "Harvard Law School", url: "https://hls.harvard.edu/jdadmissions/apply-to-harvard-law-school/jdapplicants/application-toolkit/resume/real-talk-the-resume" },
    { title: "Supported formats for resumes, cover letters and other candidate uploads", publisher: "Greenhouse Support", url: "https://support.greenhouse.io/hc/en-us/articles/360052218132" },
    { title: "Unsuccessful resume parse", publisher: "Greenhouse Support", url: "https://support.greenhouse.io/hc/en-us/articles/200989175-Unsuccessful-resume-parse" },
    { title: "Recruiters spend 7.4 seconds looking at your resume", publisher: "HR Dive", url: "https://www.hrdive.com/news/recruiters-spend-74-seconds-looking-at-your-resume/541582/" },
    { title: "Is the 6-second resume scan a myth?", publisher: "ERE", url: "https://www.ere.net/articles/is-the-6-second-resume-scan-a-myth" },
  ],
};
