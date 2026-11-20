import Link from "next/link";
import type { Article } from "../content";
import { Checklist, Cite, DoDont, Example, Note, Steps, Takeaways } from "../parts";

export const article: Article = {
  slug: "applications",
  title: "Applying for internships: referrals, cover letters and cold messages",
  description: "Where early-career hires actually come from, when a cover letter is worth writing, and how to message an engineer without sounding like a template.",
  updated: "2026-11-19",
  minutes: 8,
  author: "The Rayume team",
  sections: [
    {
      id: "where-hires-come-from",
      title: "Where hires come from",
      body: (
        <>
          <p>
            Clicking apply on a public posting is the least efficient way into a company, and it’s still the way most people get their first job, because it’s the one
            that doesn’t need anyone’s help. You should do it. Just don’t do only that.
          </p>
          <p>
            Lever, an applicant tracking company, looked at over 4 million candidates in its customers’ systems and found employers hired about one in every 100. Through
            employee referrals the rate was 1 in 16; through the careers site and job postings, 1 in 152.
            <Cite n={1} /> The data is from 2016 and from one vendor’s customers, so read it as a direction, not a law. The direction is hard to miss.
          </p>
          <p>
            The same study found that 30% of referred candidates were considered underqualified.
            <Cite n={1} /> A referral gets your resume read by a person. It doesn’t get you the job, which is why the resume still has to hold up.
          </p>
          <Takeaways
            items={[
              "Apply publicly and ask for referrals. Do both.",
              "Write a cover letter when it’s asked for, or when it can explain something your resume can’t.",
              "Cold messages work when they’re short, specific and ask for something small.",
              "Track every application. The follow-ups are where people drop the ball.",
            ]}
          />
        </>
      ),
    },
    {
      id: "timing",
      title: "Apply early, and know the calendar",
      body: (
        <>
          <p>
            Internship hiring runs on a calendar, and it starts earlier than students expect. Large US tech companies often open summer internship postings the previous
            autumn and fill them on a rolling basis, so a posting that’s open in March may already be mostly decided. If a company you want has a specific season, put it in
            your calendar a year out.
          </p>
          <p>
            In Brazil, big companies run <em>programas de estágio</em> with fixed application windows, usually several rounds of tests and group dynamics, and a start date
            tied to the academic semester. Smaller companies and startups hire estagiários whenever they need one, which is why it pays to keep your Gupy and LinkedIn
            profiles current all year.
          </p>
          <Note>
            <p>
              Before you apply anywhere in Brazil, check what your course requires. The estágio law caps higher-education interns at 6 hours a day and 30 a week,
              <Cite n={2} /> and some universities add their own paperwork. The <Link href="/resources/first-offer">offer guide</Link> covers the rest of the rules.
            </p>
          </Note>
        </>
      ),
    },
    {
      id: "referrals",
      title: "How to ask for a referral",
      body: (
        <>
          <p>
            You don’t need a network to get a referral. You need one person who’s willing to vouch that you’re worth a look, and the easiest people to ask are the ones you
            already share something with: alumni of your university, former classmates, people from your coding club, hackathon or open-source project.
          </p>
          <Steps
            items={[
              { title: "Find the person", detail: "Search LinkedIn for engineers at the company who went to your university or share something specific with you." },
              { title: "Pick a real opening first", detail: "A referral is for a specific posting. Have the link ready." },
              { title: "Ask small", detail: "Ask whether they’d be open to referring you, and offer to send everything they need. Don’t ask for a job." },
              {
                title: "Make it a two-minute job for them",
                detail: "Send the posting link, your resume as a PDF, and two lines on why you fit, which they can paste into the referral form.",
              },
              { title: "Say thanks either way", detail: "And tell them what happened. People who refer you like to know." },
            ]}
          />
          <Example
            before="Hi, can you refer me to your company? Here is my CV."
            after="Hi Marina, I’m a 3rd-year CS student at PUC-SP too (I saw you were in the coding club). I’m applying for the 2027 backend internship at your team (link). Would you be open to referring me? I’ve attached my resume and a two-line summary you could paste. No worries at all if not."
            note="Shared context, a specific posting, an easy yes and an easy no."
          />
        </>
      ),
    },
    {
      id: "cover-letters",
      title: "Cover letters: when they’re worth writing",
      body: (
        <>
          <p>
            Ask whether cover letters matter and you’ll get every answer. The surveys you’ll find contradict each other, and nearly all of them come from companies that
            sell resume or cover letter tools. Jobscan, for one, collected figures ranging from recruiters who say cover letters don’t matter to its own data claiming they
            raise interview rates.
            <Cite n={3} /> In the same article, a career expert says that “within lower-level roles in STEM, there’s less emphasis on the cover letter”.
            <Cite n={3} />
          </p>
          <p>That matches what we see. For an internship in tech, write one when:</p>
          <ul>
            <li>
              <strong>The posting asks for it.</strong> Then it’s not optional, and a missing one reads as not following instructions.
            </li>
            <li>
              <strong>It’s a small company or a startup.</strong> A founder or the engineer who’ll be your manager may read it themselves.
            </li>
            <li>
              <strong>You have something to explain</strong> that doesn’t fit on a resume: you’re switching from another field, you’re moving to the city, you need a visa,
              your English is stronger than the resume can show.
            </li>
          </ul>
          <p>
            Skip it when the form doesn’t have a field for it, or when you’d be writing a generic one. A template letter with the company name swapped in is worse than none,
            because it proves the only thing you didn’t want proved.
          </p>
        </>
      ),
    },
    {
      id: "cover-letter-shape",
      title: "A cover letter in three paragraphs",
      body: (
        <>
          <p>
            Harvard’s career office says to keep letters “concise and factual, no more than a single page”.
            <Cite n={4} /> For an internship, half a page is plenty. Three paragraphs:
          </p>
          <Steps
            items={[
              {
                title: "Why this company, specifically",
                detail: "One thing you know about their product or engineering that made you apply. Not their mission statement copied back to them.",
              },
              {
                title: "One piece of evidence",
                detail: "The project or job that best matches the posting, told in three or four sentences with a number. Don’t repeat the whole resume.",
              },
              { title: "The close", detail: "What you’d like to happen next, and anything they need to know: start date, location, visa." },
            ]}
          />
          <Example
            before="I am writing to express my interest in the Software Engineering Intern position at your esteemed company. I am a hard-working and passionate student."
            after="I’ve used your open-source SDK in two projects, and the way it handles retries is why I’m applying for the backend internship. Last term I built a payment-reminder service in Go for a four-person course project that now sends 2,000 messages a week for a local gym."
            note="The first opening fits every company on earth. The second could only have been sent to this one."
          />
          <DoDont
            do={[
              "Address a person if you can find the name. “Dear hiring team” is fine if you can’t.",
              "Use the posting’s words for the skills you really have, as on your resume.",
              "Send it as a PDF with the same header as your resume.",
            ]}
            dont={[
              "Open with “I am writing to apply for…”. They know.",
              "Retell your resume in paragraphs.",
              "Paste an AI draft without rewriting it. Readers have seen “I am excited to leverage my skills” a thousand times this year.",
            ]}
          />
        </>
      ),
    },
    {
      id: "cold-messages",
      title: "Cold messages that get answers",
      body: (
        <>
          <p>
            Most people you message won’t answer. That’s normal, and it isn’t personal: engineers get a lot of messages. You raise the odds by being short, specific and easy
            to say yes to.
          </p>
          <ul>
            <li>
              <strong>Short:</strong> four sentences or fewer. A LinkedIn connection note has a character limit anyway.
            </li>
            <li>
              <strong>Specific:</strong> mention one real thing: their talk, their blog post, a repo, a feature they shipped.
            </li>
            <li>
              <strong>Small ask:</strong> one question, or fifteen minutes. “Can you get me a job” is not small.
            </li>
          </ul>
          <Example
            before="Hello, I am a student looking for opportunities. Are you hiring? I would love to connect."
            after="Hi Tiago, I read your post on moving the checkout service to Kotlin. I’m a CS student building something similar for a course project. Could I ask you one question about how you handled the migration of the database? Happy to keep it to email."
          />
          <Note kind="warning">
            <p>
              One follow-up after a week is fine. A third message is not. And never message the same person through LinkedIn, email and Instagram on the same day.
            </p>
          </Note>
        </>
      ),
    },
    {
      id: "tracking",
      title: "Track what you send",
      body: (
        <>
          <p>
            Once you’re past ten applications, you’ll forget which resume went where. A spreadsheet is enough: company, role, link to the posting, date applied, which
            version of the resume, who referred you, and the next step with a date.
          </p>
          <p>
            Save the posting text, not just the link. Postings get taken down, and you’ll want to re-read it the night before the interview. We’re designing Rayume to keep the posting next
            to each tailored resume for this reason. Then follow up: if two weeks pass with no answer, one polite email to the recruiter is normal.
          </p>
        </>
      ),
    },
    {
      id: "checklist",
      title: "Before you hit send",
      body: (
        <>
          <Checklist
            id="applications-before-send"
            items={[
              {
                label: "Resume tailored to this posting",
                detail: (
                  <>
                    See <Link href="/resources/blog/what-tailoring-should-change">what tailoring should change</Link>.
                  </>
                ),
              },
              {
                label: "Passed the ATS checklist",
                detail: (
                  <>
                    Text layer, simple layout, file name. The <Link href="/resources/ats-checklist">ATS checklist</Link> has all of it.
                  </>
                ),
              },
              { label: "Asked for a referral if you know anyone there", detail: "Even a second-degree connection is worth one polite message." },
              { label: "Cover letter only if it’s asked for or adds something", detail: "Specific to this company, half a page, PDF." },
              { label: "Company name spelled right everywhere", detail: "In the letter, the file name and the email subject." },
              { label: "Posting saved and logged in your tracker", detail: "With the date and the resume version you sent." },
              { label: "A follow-up date in your calendar", detail: "Two weeks out." },
            ]}
          />
          <p>
            Got the interview? The <Link href="/resources/interview-prep">interview guide</Link> is next.
          </p>
        </>
      ),
    },
  ],
  sources: [
    { title: "Lever study shows 1 in 100 candidates is hired", publisher: "SHRM", url: "https://shrm.org/topics-tools/news/talent-acquisition/lever-study-shows-1-100-candidates-hired" },
    { title: "Lei nº 11.788, de 25 de setembro de 2008", publisher: "Planalto", url: "https://www.planalto.gov.br/ccivil_03/_ato2007-2010/2008/lei/l11788.htm" },
    { title: "Do I need a cover letter?", publisher: "Jobscan", url: "https://www.jobscan.co/blog/should-you-include-cover-letter/" },
    { title: "Create a strong resume", publisher: "Harvard FAS Office of Career Services", url: "https://careerservices.fas.harvard.edu/resources/create-a-strong-resume" },
  ],
};
