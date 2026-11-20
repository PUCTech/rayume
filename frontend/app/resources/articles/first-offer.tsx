import Link from "next/link";
import type { Article } from "../content";
import { Checklist, Cite, DoDont, Example, Note, Steps, Takeaways } from "../parts";

export const article: Article = {
  slug: "first-offer",
  title: "Your first offer: read\u00a0it, then negotiate\u00a0it",
  description: "What’s in a first offer in Brazil and the US, what the estágio law guarantees, CLT versus PJ, and how to ask for more without risking it.",
  updated: "2026-11-19",
  minutes: 9,
  author: "The Rayume team",
  sections: [
    {
      id: "in-writing",
      title: "Get it in writing first",
      body: (
        <>
          <p>
            A phone call that says “we’d like to make you an offer” is good news, not an offer. Thank them, say you’re excited, and ask for the details in writing before you
            react to any number. “Get everything in writing” is the first of Haseeb Qureshi’s ten rules for negotiating a job offer, and the rest build on it.
            <Cite n={1} />
          </p>
          <Takeaways
            items={[
              "Don’t react to a number until you have the whole offer in writing.",
              "Compare total compensation, not the salary line.",
              "In Brazil, know what the estágio law and the CLT guarantee before you compare offers.",
              "Asking politely for more almost never costs you the offer. Ask once, with a reason.",
            ]}
          />
        </>
      ),
    },
    {
      id: "whats-in-it",
      title: "What’s in an offer",
      body: (
        <>
          <p>
            The salary is one line. Patrick McKenzie’s classic essay on negotiation puts it plainly: “salary is only one component of the total compensation package.”
            <Cite n={2} /> Read every line of what you’re sent, and ask about anything that’s missing.
          </p>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>What to check</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Pay</td>
                <td>Monthly or yearly, gross, and how often it’s paid. For interns, the bolsa.</td>
              </tr>
              <tr>
                <td>Contract type</td>
                <td>Estágio, CLT or PJ in Brazil; full-time employee or contractor in the US.</td>
              </tr>
              <tr>
                <td>Benefits</td>
                <td>Health plan (and for dependants), meal and food vouchers, transport, gym, education budget.</td>
              </tr>
              <tr>
                <td>Equity or bonus</td>
                <td>How much, vesting schedule, cliff, and whether a bonus is guaranteed or a target.</td>
              </tr>
              <tr>
                <td>Hours and place</td>
                <td>Weekly hours, remote, hybrid or office, and which city.</td>
              </tr>
              <tr>
                <td>Start date and deadline</td>
                <td>When you start, and when they need your answer.</td>
              </tr>
              <tr>
                <td>Conversion</td>
                <td>For internships: is there a path to a full-time offer, and when is it decided?</td>
              </tr>
            </tbody>
          </table>
        </>
      ),
    },
    {
      id: "estagio",
      title: "In Brazil: what the estágio law guarantees",
      body: (
        <>
          <p>
            An estágio isn’t a job contract under the CLT. It’s governed by Lei 11.788/2008, and some of its rules aren’t up for negotiation, which makes comparing offers
            easier. For a higher-education student in a non-mandatory estágio, the law says:
          </p>
          <ul>
            <li>
              <strong>Hours:</strong> at most 6 hours a day and 30 a week.
              <Cite n={3} />
            </li>
            <li>
              <strong>Pay:</strong> the bolsa and the auxílio-transporte are compulsory.
              <Cite n={3} />
            </li>
            <li>
              <strong>Insurance:</strong> the company has to take out personal accident insurance for you.
              <Cite n={3} />
            </li>
            <li>
              <strong>Time off:</strong> after a year, 30 days of recesso, preferably during school holidays.
              <Cite n={3} />
            </li>
            <li>
              <strong>Length:</strong> at most 2 years at the same company.
              <Cite n={3} />
            </li>
          </ul>
          <p>
            So between two estágio offers, compare the bolsa, the benefits on top (health plan, meal voucher), what you’ll learn, and the chance of being hired at the end.
            An offer of 40 hours a week for an estágio isn’t a better deal. It’s against the law.
          </p>
        </>
      ),
    },
    {
      id: "clt-pj",
      title: "CLT or PJ: compare the whole year",
      body: (
        <>
          <p>
            For a junior role in Brazil you may be offered a CLT contract or asked to work as a PJ, invoicing through your own company. The monthly number on a PJ offer is
            usually higher, and it isn’t comparable to the CLT number without some arithmetic.
          </p>
          <p>
            Under the Constitution, CLT workers get a 13th salary, paid vacation with an extra third on top, and FGTS,
            <Cite n={4} /> which the employer deposits at 8% of your pay each month.
            <Cite n={5} /> As a PJ, none of that is automatic, and you pay your own taxes and accountant.
          </p>
          <table>
            <thead>
              <tr>
                <th>Over a year</th>
                <th>CLT at R$ 5,000/month</th>
                <th>PJ at R$ 5,000/month</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>12 monthly salaries</td>
                <td>R$ 60,000</td>
                <td>R$ 60,000</td>
              </tr>
              <tr>
                <td>13th salary</td>
                <td>R$ 5,000</td>
                <td>None</td>
              </tr>
              <tr>
                <td>Extra third on vacation</td>
                <td>R$ 1,667</td>
                <td>None, and unpaid if you stop invoicing</td>
              </tr>
              <tr>
                <td>FGTS (8%, on salaries, 13th and vacation)</td>
                <td>about R$ 5,330</td>
                <td>None</td>
              </tr>
              <tr>
                <td>Gross before taxes</td>
                <td>about R$ 72,000</td>
                <td>R$ 60,000, minus taxes and accountant</td>
              </tr>
            </tbody>
          </table>
          <p>
            The same monthly number is worth roughly 20% more as CLT before you even count taxes, benefits or job security. Do this sum before comparing, and ask a PJ offer
            whether it includes paid time off and a health plan. Taxes differ for each person, so treat the table as the shape of the comparison, not your tax return.
          </p>
          <Note kind="warning">
            <p>
              A “PJ” arrangement where you have a boss, fixed hours and no other clients can be treated as a disguised employment relationship. That’s a legal question
              beyond this guide, but it’s worth knowing the term <em>pejotização</em> before you sign.
            </p>
          </Note>
        </>
      ),
    },
    {
      id: "negotiate",
      title: "Should you negotiate a first offer?",
      body: (
        <>
          <p>
            Usually, yes, politely. The Tech Interview Handbook says “the initial offer that you are given is never the best package that the company can offer” and that
            “recruiters expect candidates to negotiate.”
            <Cite n={6} /> McKenzie goes further: “always, as a matter of policy, negotiate all offers.”
            <Cite n={2} />
          </p>
          <p>Be realistic about where the room is, though:</p>
          <ul>
            <li>
              <strong>Internships</strong> at large companies often pay a fixed rate to the whole cohort. Ask anyway, but expect the movement to be in start date, location or
              relocation help rather than pay.
            </li>
            <li>
              <strong>Junior full-time offers</strong> usually have a band. There’s often room inside it, and a sign-on bonus is easier for a company to give than salary.
            </li>
            <li>
              <strong>Startups</strong> may have less cash and more flexibility on equity, title, remote work or an early review.
            </li>
          </ul>
          <p>
            Asking once, with a reason and a positive tone, almost never makes a company withdraw an offer. If it does, you’ve learned something about the place you were
            about to join.
          </p>
        </>
      ),
    },
    {
      id: "how-to-ask",
      title: "How to ask",
      body: (
        <>
          <Steps
            items={[
              {
                title: "Do your homework",
                detail: "Look up what the role pays: Glassdoor, levels.fyi for larger companies, your university’s career office, friends a year ahead of you.",
              },
              {
                title: "Say yes to the company before you talk money",
                detail: (
                  <>
                    Make it clear you want to join. Qureshi’s rules are blunt about this: “Always be positive” and “Be winnable”.
                    <Cite n={1} />
                  </>
                ),
              },
              {
                title: "Ask for something specific, with a reason",
                detail: "A number or a change, and why: another offer, the market data you found, the cost of moving.",
              },
              {
                title: "Then stop talking",
                detail: "Let them come back to you. They’ll often need a day to check with someone.",
              },
              { title: "Get the final version in writing", detail: "Read it again before you sign." },
            ]}
          />
          <Example
            before="Is this the best you can do? I was hoping for more."
            after="Thank you, I’m really excited about the team and I’d like to make this work. Based on what I’ve seen for junior backend roles in São Paulo, I was expecting closer to R$ 6,500. Is there flexibility on the base, or on a sign-on bonus?"
            beforeLabel="Vague"
            afterLabel="Specific"
            note="Enthusiasm first, a number with a reason, and two ways for them to say yes."
          />
          <DoDont
            do={[
              "Negotiate by email if you get nervous on calls. It’s normal and gives you time to think.",
              "Mention another offer only if it’s real, and be ready to share it.",
              "Ask about the whole package: start date, remote days, education budget, equipment.",
            ]}
            dont={[
              "Invent a competing offer. Recruiters talk, and some will ask for the letter.",
              "Accept verbally and then try to negotiate.",
              "Apologise for asking. You’re having a normal business conversation.",
            ]}
          />
        </>
      ),
    },
    {
      id: "expectation",
      title: "The “salary expectation” box",
      body: (
        <>
          <p>
            McKenzie’s rule is “Never give a number.”
            <Cite n={2} /> It works in a conversation, where you can steer back to fit and value. It doesn’t work on a Brazilian application form with a required{" "}
            <em>pretensão salarial</em> field that won’t let you submit without one.
          </p>
          <p>When you can’t dodge it:</p>
          <ul>
            <li>Research first, then give a range whose bottom is a number you’d be happy with.</li>
            <li>Say whether it’s monthly or yearly, gross, and CLT or PJ, since those change the meaning completely.</li>
            <li>In a conversation, add “depending on the full package”, which keeps benefits on the table.</li>
          </ul>
          <Note>
            <p>For an estágio, the bolsa is often published in the posting. If it is, that box is a formality. Put the published number.</p>
          </Note>
        </>
      ),
    },
    {
      id: "deadlines",
      title: "Deadlines, multiple offers and saying no",
      body: (
        <>
          <p>
            Offers come with a deadline. If you’re waiting on another company, ask for more time: a week is a normal request. Tell the other company you have an offer and
            ask whether they can speed up. Many will.
          </p>
          <p>
            An offer that expires in 24 hours, sometimes called an exploding offer, is pressure, not a necessity. McKenzie’s advice is to refuse them;
            <Cite n={2} /> the practical version is to ask for a reasonable extension and see how they react.
          </p>
          <p>
            Declining is fine, and doing it well matters because tech is small. Reply quickly, thank the people who interviewed you by name, and leave the door open.
            Qureshi’s second rule is “Always keep the door open.”
            <Cite n={1} /> The recruiter you turn down this year may be hiring for your next job.
          </p>
          <Note kind="warning">
            <p>
              Once you’ve accepted an offer in writing, stop interviewing elsewhere. Reneging on an accepted offer burns the bridge with that company, and many university career
              offices have policies against it.
            </p>
          </Note>
        </>
      ),
    },
    {
      id: "checklist",
      title: "Before you sign",
      body: (
        <>
          <Checklist
            id="offer-before-sign"
            items={[
              { label: "Whole offer in writing", detail: "Pay, contract type, benefits, hours, place, start date." },
              { label: "Compared over a year", detail: "13th, vacation and FGTS counted for CLT; taxes and unpaid leave for PJ." },
              { label: "Estágio rules checked", detail: "30 hours a week at most, bolsa and auxílio-transporte, insurance, recesso." },
              { label: "Market range researched", detail: "At least two sources for the role and city." },
              { label: "Asked once for what you want", detail: "Specific, with a reason, in a positive tone." },
              { label: "Final version re-read", detail: "Every change you agreed on appears in the document you sign." },
              { label: "Other processes closed politely", detail: "A short thank-you to each company you’re turning down." },
            ]}
          />
          <p>
            Signed? Update your master resume with the new role the day you start, while you still remember what the team was working on. Future you, writing next year’s
            bullets, will be grateful. The <Link href="/resources/resume-guide">resume guide</Link> covers how to write them.
          </p>
        </>
      ),
    },
  ],
  sources: [
    { title: "Ten rules for negotiating a job offer", publisher: "Haseeb Qureshi", url: "https://haseebq.com/my-ten-rules-for-negotiating-a-job-offer/" },
    { title: "Salary negotiation: make more money, be more valued", publisher: "Kalzumeus (Patrick McKenzie)", url: "https://www.kalzumeus.com/2012/01/23/salary-negotiation/" },
    { title: "Lei nº 11.788, de 25 de setembro de 2008", publisher: "Planalto", url: "https://www.planalto.gov.br/ccivil_03/_ato2007-2010/2008/lei/l11788.htm" },
    { title: "Constituição da República Federativa do Brasil de 1988, art. 7º", publisher: "Planalto", url: "https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm" },
    { title: "Lei nº 8.036, de 11 de maio de 1990 (FGTS), art. 15", publisher: "Planalto", url: "https://www.planalto.gov.br/ccivil_03/leis/l8036consol.htm" },
    { title: "What you need to know about negotiation", publisher: "Tech Interview Handbook", url: "https://www.techinterviewhandbook.org/negotiation/" },
  ],
};
