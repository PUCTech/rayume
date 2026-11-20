import Link from "next/link";
import type { Article } from "../content";
import { Checklist, Cite, DoDont, Example, Note, Steps, Takeaways } from "../parts";

export const article: Article = {
  slug: "github-profile",
  title: "Your GitHub profile and projects, as a reader sees them",
  description: "The links on your resume get clicked. What a recruiter or engineer finds in the first minute on your GitHub, and how to make it back up every line.",
  updated: "2026-11-19",
  minutes: 7,
  author: "The Rayume team",
  sections: [
    {
      id: "who-clicks",
      title: "Who clicks, and what they look at",
      body: (
        <>
          <p>
            A recruiter screening fifty resumes won’t read your code. An engineer deciding whether to bring you in for an interview might, and so will the interviewer the
            night before. The Tech Interview Handbook lists a GitHub URL among the good-to-have contact details and asks you to link every project name “to GitHub or
            somewhere the hiring manager can view your project.”
            <Cite n={1} />
          </p>
          <p>Nobody reads your whole account. In the first minute, a reader sees roughly this, in this order:</p>
          <ol>
            <li>Your name, photo or avatar, and the one-line bio.</li>
            <li>The profile README, if you have one.</li>
            <li>The pinned repositories.</li>
            <li>Whichever pinned repo matches the resume line that made them curious, and its README.</li>
          </ol>
          <Takeaways
            items={[
              "Readers look at your bio, profile README and pins. Almost nobody scrolls further.",
              "Pin every project that’s on your resume, so the click from the PDF lands somewhere familiar.",
              "Each pinned README says what it is, why it exists, the stack, how to run it and what you did.",
              "Remove noise and leaked secrets before the link goes on a resume.",
            ]}
          />
          <p>
            The contribution graph is the last thing that matters and the first thing people worry about. A wall of green squares is easy to fake and says nothing about
            quality. Three solid, documented projects beat a year of daily commits to a dotfiles repo.
          </p>
        </>
      ),
    },
    {
      id: "profile-readme",
      title: "A profile README in five lines",
      body: (
        <>
          <p>
            GitHub shows a README at the top of your profile when you create a public repository whose name matches your username, with a <code>README.md</code> in its
            root.
            <Cite n={2} /> Use it. It’s the only place on GitHub where you choose the first thing a stranger reads.
          </p>
          <p>Keep it short. It’s a business card, not a homepage:</p>
          <ul>
            <li>Who you are, in one line: “CS student at PUC-SP, graduating Dec 2027. Backend and data.”</li>
            <li>What you’re building now, linked.</li>
            <li>Two or three things you’ve shipped, each with one number.</li>
            <li>How to reach you: email or LinkedIn.</li>
          </ul>
          <Example
            before="Hi there, I’m a passionate developer who loves to code. (Then a waving-hand emoji, 40 technology badges, a GIF and a visitor counter.)"
            after="CS student at PUC-SP, graduating Dec 2027. I build backends in Python and Go. Right now: a FastAPI service that turns bus GPS feeds into arrival times for 3 São Paulo lines."
            note="Badges and stat cards fill the screen without saying anything you can check. One specific project says more than forty logos."
          />
          <Note kind="warning">
            <p>
              The auto-generated “top languages” card counts bytes, so one vendored JavaScript bundle can make a Python developer look like a frontend dev. Leave it off.
            </p>
          </Note>
        </>
      ),
    },
    {
      id: "pins",
      title: "Pin what you want to talk about",
      body: (
        <>
          <p>
            You can pin up to six repositories and gists, combined.
            <Cite n={3} /> Without pins, GitHub shows popular repositories instead, which for most students means a forked course template and a tutorial clone.
          </p>
          <p>Pick pins the way you pick resume projects:</p>
          <ul>
            <li>Every project on your resume is pinned, so the click from the PDF lands somewhere familiar.</li>
            <li>The work you’d most like to be asked about comes first.</li>
            <li>Range beats repetition: one API, one frontend, one data notebook says more than three to-do apps.</li>
            <li>Four good pins beat six where two are filler. You don’t have to use all the slots.</li>
          </ul>
          <p>
            Give each pinned repo a one-line description and a few topics in its About box. That line is what shows on the pin card, and “No description provided” is the
            GitHub version of a blank page.
          </p>
        </>
      ),
    },
    {
      id: "project-readme",
      title: "The project README is the interview before the interview",
      body: (
        <>
          <p>
            An engineer who clicks through from your resume gives the README about thirty seconds. Answer their questions in the order they’ll ask them:
          </p>
          <Steps
            items={[
              { title: "What is it?", detail: "One sentence, plain words. Then a screenshot, a GIF or a link to a live demo." },
              { title: "Why does it exist?", detail: "The problem, in two lines. “My university’s timetable site takes 9 seconds to load on mobile” beats “A schedule app.”" },
              { title: "What’s it built with?", detail: "The stack, in the same words your resume uses." },
              {
                title: "How do I run it?",
                detail: (
                  <>
                    Commands you can copy and paste. If it needs an API key, say which one and include a <code>.env.example</code>.
                  </>
                ),
              },
              { title: "What did you do?", detail: "On a team project, say which parts were yours. The interviewer is going to ask anyway." },
              { title: "What’s next, or what you’d change", detail: "Optional, and underrated. It shows judgment, and judgment is what juniors get hired for." },
            ]}
          />
          <Example
            before="# my-app — Final project. Made with React."
            after="# Bandejão — Shows today’s menu for the 4 PUC-SP cafeterias and lets students rate dishes. 300 weekly users in the 2026 spring term. Next.js, PostgreSQL, deployed on Vercel. Live: bandejao.example.com"
            note="A reader knows what it is, that people use it, and the stack, before scrolling."
          />
        </>
      ),
    },
    {
      id: "clean-up",
      title: "Clean up before you put the link on a resume",
      body: (
        <>
          <p>A link is an invitation to look around. Spend an hour on this once.</p>
          <DoDont
            do={[
              "Archive or make private the half-finished experiments, empty repos and course templates you never touched.",
              "Keep a tutorial clone only if you changed something real, and say what in its README.",
              "Write real commit messages from now on. You don’t need to rewrite the past.",
              "Use the same name and email on your commits as on your resume, so a reader can tell the work is yours.",
            ]}
            dont={[
              "Leave forks you never committed to on your profile. They’re noise.",
              "Pin a straight copy of a YouTube to-do app.",
              "Let “asdf”, “fix” and “aaaaa” be the history of your best project.",
              "Link a private repo. Everyone except you sees a 404.",
            ]}
          />
          <Note kind="warning">
            <p>
              Search your repos for committed secrets: <code>.env</code> files, API keys, database URLs. Deleting the file in a new commit doesn’t remove it from history.
              Revoke and rotate the key first, then clean up. A leaked key on a portfolio repo is the one thing worse than no portfolio.
            </p>
          </Note>
          <p>
            If most of your real work sits in private repos (an estágio, a client, a course that forbids publishing solutions), say so in your profile README. GitHub also
            has a setting to count private contributions on your graph without showing what they were.
          </p>
        </>
      ),
    },
    {
      id: "portfolio",
      title: "Do you need a portfolio site?",
      body: (
        <>
          <p>
            For backend, data and infrastructure roles, usually not. A clean GitHub does the job, and a portfolio that’s a template with three cards linking back to
            GitHub adds a click and nothing else.
          </p>
          <p>
            For frontend and design-adjacent roles, yes, because the site is the project. Then it has to be fast, accessible and work on a phone, since that’s exactly what
            the reader will check. Put the Lighthouse score in its README if it’s good.
          </p>
          <p>Either way, a live demo of a project beats a portfolio about the project. Deploy things. Free tiers exist for exactly this.</p>
        </>
      ),
    },
    {
      id: "repo-to-resume",
      title: "From repo to resume line",
      body: (
        <>
          <p>
            The repo and the resume should tell the same story at two zoom levels. The resume line makes a claim; the repo lets anyone check it. Write the line with the{" "}
            <Link href="/resources/resume-guide#xyz">XYZ formula</Link>, then make sure the number in it can be found or reproduced from the README.
          </p>
          <Example
            before="Weather app — React, API"
            after="Built a weather PWA in React that caches forecasts offline; Lighthouse performance 54 to 96 after code-splitting and image compression. github.com/anasouza/tempo"
            note="The repo’s README shows both Lighthouse runs. The claim and the evidence are one click apart."
          />
          <Example
            before="Contributed to open source."
            after="Fixed a date-parsing bug in an open-source Brazilian holiday library (2 merged PRs, 1,400 stars); added tests for 12 state-level holidays."
            note="Name the project if it’s well known, link the PRs, and count what got merged, not what you opened."
          />
          <p>
            Rayume builds project lines from what you enter in your master resume, so this is also the moment to paste the real numbers in. The AI can reword a claim. It
            can’t invent the Lighthouse score.
          </p>
        </>
      ),
    },
    {
      id: "checklist",
      title: "Before you add the link",
      body: (
        <>
          <Checklist
            id="github-before-link"
            items={[
              { label: "Profile README exists", detail: "Who you are, what you’re building, how to reach you. No badge wall." },
              { label: "Resume projects are pinned", detail: "Every project on the PDF is one click from your profile." },
              { label: "Every pin has a description", detail: "One line in the About box, plus topics." },
              { label: "Each pinned README answers the five questions", detail: "What, why, stack, how to run, what you did." },
              { label: "A demo or screenshot near the top", detail: "Live link if it’s deployed, an image if it isn’t." },
              { label: "No secrets in history", detail: "Keys revoked and rotated if anything ever leaked." },
              { label: "Noise archived", detail: "Empty repos, untouched forks and course templates out of sight." },
              { label: "Links on the resume work", detail: "Open each one in a private window. Private repos show a 404 to everyone else." },
            ]}
          />
        </>
      ),
    },
  ],
  sources: [
    { title: "Resume guide", publisher: "Tech Interview Handbook", url: "https://www.techinterviewhandbook.org/resume/" },
    {
      title: "Managing your profile README",
      publisher: "GitHub Docs",
      url: "https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-github-profile/customizing-your-profile/managing-your-profile-readme",
    },
    {
      title: "Pinning items to your profile",
      publisher: "GitHub Docs",
      url: "https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-github-profile/customizing-your-profile/pinning-items-to-your-profile",
    },
  ],
};
