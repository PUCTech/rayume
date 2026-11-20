import Link from "next/link";
import type { Article } from "../content";
import { Checklist, Cite, Example, Note } from "../parts";

export const article: Article = {
  slug: "interview-prep",
  title: "How to prepare for a tech interview",
  description: "The stages of an early-career tech interview, what each one tests, and how to answer with stories from your own resume.",
  updated: "2026-11-17",
  minutes: 7,
  author: "The Rayume team",
  sections: [
    {
      id: "pipeline",
      title: "The usual pipeline",
      body: (
        <>
          <p>Most early-career loops are built from the same four parts, in some order and with different names.</p>
          <ol>
            <li>
              <strong>Recruiter screen.</strong> A short call about your background, the role, logistics and, often, work authorization. GitLab’s handbook lays its process
              out as application, screening call, an assessment for some roles, a technical interview for some roles, then team interviews.
              <Cite n={1} />
            </li>
            <li>
              <strong>Online assessment or take-home.</strong> Timed coding problems, or a small project. Nubank’s take-home runs about two weeks, and “what matters is
              demonstrating structured thinking”; you don’t have to finish it.
              <Cite n={2} />
            </li>
            <li>
              <strong>Technical interviews.</strong> Live coding with an engineer. For Google’s phone screen: “Be prepared to write around 20-30 lines of code in your
              strongest language.”
              <Cite n={3} /> Amazon describes “a potential combination of verbal and coding exercises.”
              <Cite n={4} />
            </li>
            <li>
              <strong>Behavioral.</strong> Questions about what you’ve done. At Amazon, “each interviewer will typically ask two or three questions about successes or
              challenges,” tied to its Leadership Principles.
              <Cite n={4} />
            </li>
          </ol>
          <p>
            System design is light or absent for interns and new grads. Nubank keeps its architecture interview for senior candidates,
            <Cite n={2} /> and Google’s guide lists design for the levels where it applies.
            <Cite n={3} /> If someone does ask a junior to design a URL shortener, they mostly want to watch you reason out loud.
          </p>
        </>
      ),
    },
    {
      id: "nubank",
      title: "One loop in detail: Nubank",
      body: (
        <>
          <p>Nubank publishes its process for software engineers, and it’s a good map of the practical style many companies have moved to:</p>
          <ol>
            <li>Application form, about a week.</li>
            <li>Take-home exercise, about two weeks.</li>
            <li>
              Pair programming with a Nubank engineer: “explaining your reasoning, receiving feedback, and adapting solutions in real time.”
            </li>
            <li>Architecture, for senior candidates only.</li>
            <li>Engineering interview: algorithms, logic, system design.</li>
            <li>A culture interview with talent acquisition, asking for “past experiences showing collaboration and adaptability.”</li>
          </ol>
          <blockquote>
            “Curiosity, asking questions, and openness are more valuable than perfection.”
            <Cite n={2} />
          </blockquote>
          <p>
            Big US tech still tests data structures and algorithms head on; Google’s and Amazon’s guides say so.
            <Cite n={3} />
            <Cite n={4} /> Loops like Nubank’s lean on take-homes and pairing. Prepare for both: the core algorithm topics below, plus reading code you didn’t write and
            talking while you change it.
          </p>
        </>
      ),
    },
    {
      id: "technical",
      title: "Technical rounds, by Google’s own advice",
      body: (
        <>
          <p>
            Google’s software engineer prep guide is old enough to tell you there’s no IDE and to practice on a whiteboard (most loops now use a shared editor), but its advice
            on how to behave holds up well:
            <Cite n={3} />
          </p>
          <ul>
            <li>“We want to understand how you think, so explain your thought process and decision making throughout the interview.”</li>
            <li>“Many of the questions will be deliberately open-ended… feel free to ask specific questions if you need clarification.”</li>
            <li>“If necessary, start with the brute force solution and improve on it — just let the interviewer know that’s what you’re doing and why.”</li>
            <li>“Don’t stress about small syntactical errors.”</li>
          </ul>
          <p>
            Its sequence: clarify the problem, explain your approach, write the code, and finally: “Optimize the code, follow it with test cases and find any bugs.” The topics it
            lists are arrays, linked lists, stacks, queues, hash maps, trees, heaps, graphs (BFS and DFS), sorting, recursion, dynamic programming and Big-O, and it recommends
            <em> Cracking the Coding Interview</em>.
            <Cite n={3} />
          </p>
          <p>
            Practice out loud. Solving a problem in silence and solving it while narrating are different skills, and only the second one is being tested.
          </p>
          <h3>Take-homes and pairing</h3>
          <p>
            A take-home is graded by someone reading your code later, so make it easy to read. Add a README that says how to run it, what you chose and why, and what you’d
            do with more time. Unfinished with a clear plan beats finished and baffling; Nubank says outright that you don’t need to finish.
            <Cite n={2} />
          </p>
          <p>
            Pairing rounds are closer to a normal workday. Read the existing code before changing it, say what you’re about to try, and take the interviewer’s hints as
            hints. They’re watching how you take feedback as much as what you type.
          </p>
        </>
      ),
    },
    {
      id: "star",
      title: "Behavioral answers with STAR",
      body: (
        <>
          <p>
            Amazon defines STAR as “a structured method of responding to a question by discussing the specific situation, task, action, and result.”
            <Cite n={4} /> The idea behind behavioral interviews is that what you did before predicts what you’ll do next, so they want a real story, not your philosophy of
            teamwork.
          </p>
          <h3>A worked example</h3>
          <p>
            Take a line from the <Link href="/resources/resume-guide">resume guide</Link>: “Built the class-schedule screen of a React Native campus app used by 1,200 PUC-SP
            students, cutting load time from 3.1 s to 0.8 s by caching timetables offline.” The question: <em>tell me about a time something went wrong close to a deadline.</em>
          </p>
          <ul>
            <li>
              <strong>Situation.</strong> Two weeks before enrollment, our campus app’s schedule screen took over three seconds to load on university Wi-Fi, and our 40 beta
              testers were complaining.
            </li>
            <li>
              <strong>Task.</strong> The screen was mine. It had to be usable before 1,200 students opened it on the same morning.
            </li>
            <li>
              <strong>Action.</strong> I profiled it and found we re-fetched the whole timetable every time the screen opened. I cached it on the device, refreshed it in the
              background, and told the team I’d drop the dark-mode feature I owned to get it done in time.
            </li>
            <li>
              <strong>Result.</strong> Load time went from 3.1 s to 0.8 s, we launched on schedule, and the team reused the caching for the grades screen.
            </li>
          </ul>
          <p>
            Notice the “I” in the action: the interviewer is hiring you, not your group. The result has numbers, and it’s the same numbers as the resume. Out loud, that’s about
            90 seconds. Stop there and let them ask.
          </p>
          <h3>Have five or six ready</h3>
          <p>
            A conflict on a team project. A bug you chased for too long. A deadline. A failure, and what changed afterwards. Something you had to learn fast. Something you led.
            Tie each one to a line on your resume, and one story can answer several questions.
          </p>
        </>
      ),
    },
    {
      id: "your-resume",
      title: "Walk through your resume line by line",
      body: (
        <>
          <p>
            Every bullet is a question waiting to happen. Before each interview, open the version of the resume you sent for that job and, for every line, answer: what did
            I do, as opposed to the team? Why that stack? How did I measure that number? What would I do differently?
          </p>
          <p>
            If you can’t answer, rewrite or cut the line before the interview, not during it. Gupy warns that inflated descriptions hurt you “quando chegar à análise
            humana”,
            <Cite n={5} /> and Bock treated any lie on a resume as disqualifying.
            <Cite n={6} /> The interview is where that human analysis happens.
          </p>
          <Example
            before="Architected a scalable microservices infrastructure."
            after="Split a course project’s monolith into two FastAPI services so the scraper could crash and restart without taking the API down."
            note="The first invites a system design grilling you can’t win. The second starts a conversation you can lead."
          />
        </>
      ),
    },
    {
      id: "questions",
      title: "Questions to ask them",
      body: (
        <>
          <p>
            You’ll get five minutes at the end. Use them; “no questions” reads as no interest. These are our suggestions, not anyone’s official list:
          </p>
          <ul>
            <li>What does the first 90 days look like for someone in this role?</li>
            <li>How is code reviewed, and how quickly do juniors get feedback?</li>
            <li>What has the team shipped recently?</li>
            <li>What separates the interns or new grads who do really well here?</li>
            <li>What does the rest of the process look like, and when should I expect to hear back?</li>
          </ul>
          <p>
            Skip anything the careers page already answers. They can tell. Save salary questions for after the offer; the{" "}
            <Link href="/resources/first-offer">offer guide</Link> covers how to handle them.
          </p>
        </>
      ),
    },
    {
      id: "brazil",
      title: "In Brazil: processos seletivos and English",
      body: (
        <>
          <p>
            Estágio and trainee programs at large Brazilian companies run as processos seletivos with their own stages: application, online tests (logic and technical),
            a group dynamic or live case, and final interviews. The format changes every edition, so read that year’s program page rather than last year’s blog post.
          </p>
          <p>
            The group dynamic has no US equivalent. It rewards building on other people’s ideas and keeping the group on time more than winning the argument.
          </p>
          <h3>Interviewing in English</h3>
          <p>
            US remote roles interview in English, and the resume should match: Gupy’s guidance is to write it in the language of the posting.
            <Cite n={7} /> Fluency is a real differentiator here. Brazil ranked 75th of 123 countries on the EF English Proficiency Index 2025, a “low proficiency” score of
            482, with speaking (464) and writing (442) below reading (516).
            <Cite n={8} /> The test takers are self-selected, so read it loosely, but the pattern is familiar: plenty of people read English docs all day and rarely speak it.
          </p>
          <p>
            Close that gap on purpose. Do practice problems narrating in English. Record your STAR stories in English and listen back. In the recruiter screen, ask which
            rounds will be in English; we couldn’t find any company documenting this for Brazilian candidates, so ask rather than assume.
          </p>
        </>
      ),
    },
    {
      id: "night-before",
      title: "The night before",
      body: (
        <>
          <Checklist
            id="interview-night-before"
            items={[
              { label: "Re-read the posting", detail: "Mark the three requirements that matter most and pick a story for each." },
              { label: "Re-read the resume you sent", detail: "The tailored version for this job, not your master copy." },
              { label: "Know the format", detail: "Which round, how long, who you’re meeting, which tool. Ask the recruiter if nobody said." },
              { label: "Test your setup", detail: "Camera, microphone, the shared-editor link, a charger in reach." },
              { label: "Pick your language", detail: "Your strongest programming language, and stick with it all the way through." },
              { label: "Write down your questions", detail: "Two or three, on paper beside you." },
              { label: "Go to sleep", detail: "One more problem at 1 a.m. won’t change the outcome. Rest will." },
            ]}
          />
          <Note>
            <p>If you slip mid-interview, say so and fix it. Nubank’s line about curiosity over perfection applies to everyone.</p>
          </Note>
        </>
      ),
    },
  ],
  sources: [
    { title: "Candidate handbook page", publisher: "GitLab Handbook", url: "https://handbook.gitlab.com/handbook/hiring/candidate-faq" },
    { title: "What is the hiring process like for software engineers at Nubank?", publisher: "Building Nubank", url: "https://building.nu.com/what-is-the-interview-process-like-for-software-engineers-at-nubank/" },
    { title: "Google interview prep guide: software engineer", publisher: "Google, copy hosted by HBCU Connect", url: "https://hbcuconnect.com/ads/google/GoogleSE.pdf" },
    { title: "Interview prep for technical roles", publisher: "Amazon Jobs", url: "https://amazon.jobs/content/en/how-we-hire/university/additional-tech" },
    { title: "Como passar pelos agentes de IA da Gupy", publisher: "Gupy", url: "https://www.gupy.io/blog-do-emprego/como-passar-pela-ia-da-gupy" },
    { title: "The biggest mistakes Google sees in CVs (Laszlo Bock)", publisher: "World Economic Forum", url: "https://www.weforum.org/stories/2014/12/the-biggest-mistakes-google-sees-in-cvs/" },
    { title: "Veja dicas e boas práticas para o seu currículo na Gupy", publisher: "Gupy", url: "https://www.gupy.io/blog-do-emprego/boas-praticas-curriculo-gupy" },
    { title: "EF EPI 2025 fact sheet: Brazil", publisher: "EF Education First", url: "https://www.ef.com/assetscdn/cefcom-epi-site/fact-sheets/2025/ef-epi-fact-sheet-brazil-english.pdf" },
  ],
};
