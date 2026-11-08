import type { Metadata } from "next";
import Link from "next/link";
import { LegalDoc, type Section } from "../doc";
import { legal } from "../info";

export const metadata: Metadata = {
  title: "Terms of Service · Rayume",
  description: "The terms for using Rayume: accounts, your content, AI-written text, templates and liability.",
};

const mail = <a href={`mailto:${legal.email}`}>{legal.email}</a>;

const sections: Section[] = [
  {
    id: "agreement",
    title: "Agreement",
    body: (
      <>
        <p>
          These Terms of Service (&ldquo;Terms&rdquo;) are an agreement between you and {legal.controller} (&ldquo;Rayume&rdquo;,
          &ldquo;we&rdquo;, &ldquo;us&rdquo;) about your use of the Rayume website, web app, API and browser extension (the
          &ldquo;Service&rdquo;). By creating an account or using the Service you accept these Terms and our{" "}
          <Link href="/legal/privacy">Privacy Policy</Link>. If you don&apos;t agree, don&apos;t use the Service.
        </p>
      </>
    ),
  },
  {
    id: "service",
    title: "The Service",
    body: (
      <>
        <p>
          Rayume helps you write your professional experience once, tailor it to job postings with the help of AI, and export it as resumes
          typeset in LaTeX. Rayume is a candidate tool: it is not a job board, a recruiter or an employment agency, and it does not apply to
          jobs for you.
        </p>
        <p>
          The Service is in <strong>beta</strong> and currently free. Features may change, be added or be removed, and the Service may be
          unavailable at times. We will tell you in advance before charging for anything you already use.
        </p>
      </>
    ),
  },
  {
    id: "account",
    title: "Your account",
    body: (
      <ul>
        <li>You must be at least {legal.minimumAge} years old, and have a parent or guardian&apos;s permission if the law where you live requires it.</li>
        <li>Give us accurate information and keep your sign-in details secure. You are responsible for what happens in your account.</li>
        <li>Your username must not impersonate someone else or infringe their rights. We may reclaim usernames that do.</li>
        <li>Tell us at {mail} if you think someone else has accessed your account.</li>
      </ul>
    ),
  },
  {
    id: "content",
    title: "Your content",
    body: (
      <>
        <p>
          <strong>It stays yours.</strong> Everything you write or upload (your experiences, profile, job postings, pictures) and the
          resumes made from it (&ldquo;Your Content&rdquo;) belongs to you. You can export or delete it at any time.
        </p>
        <p>
          <strong>The license you give us.</strong> You grant us a worldwide, non-exclusive, royalty-free license to host, store, copy,
          process, adapt and display Your Content only as needed to run the Service for you: for example, to send your text to our AI
          provider, compile your PDFs and show your public profile. This license ends when you delete Your Content, except for copies we must
          keep by law or that remain briefly in backups.
        </p>
        <p>
          <strong>Your responsibility.</strong> You confirm that Your Content is truthful, that you have the right to use it, and that it
          doesn&apos;t include other people&apos;s personal data without a lawful reason. Job descriptions you save are for your own use.
        </p>
      </>
    ),
  },
  {
    id: "ai",
    title: "AI-written text",
    body: (
      <>
        <p>
          Rayume uses AI to suggest wording, extract skills and tailor your resume. AI can make mistakes, invent details or overstate what
          you did.
        </p>
        <ul>
          <li>
            <strong>You are responsible for your resume.</strong> Review every line before you use it, and only claim experience, results
            and skills that are true. Misrepresenting yourself to an employer can have serious consequences.
          </li>
          <li>
            To the extent the law allows, you own the text the Service generates for you, and you may use it however you like, including
            commercially. Similar text may be generated for other users.
          </li>
          <li>
            <strong>No guarantees about outcomes.</strong> We design resumes to be readable by applicant tracking systems, but every
            employer and system is different. We don&apos;t promise interviews, offers or any particular result.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "rules",
    title: "Acceptable use",
    body: (
      <>
        <p>Don&apos;t use the Service to:</p>
        <ul>
          <li>create resumes for other people without their permission, or impersonate anyone;</li>
          <li>upload content that is illegal, infringing, defamatory, or that contains malware;</li>
          <li>break the law, including anti-discrimination, privacy and intellectual property laws;</li>
          <li>access other users&apos; data, probe or break our security, or get around usage limits;</li>
          <li>scrape, overload or reverse engineer the Service, or use it to build a competing product; or</li>
          <li>use the browser extension on pages or in ways that break those websites&apos; terms.</li>
        </ul>
      </>
    ),
  },
  {
    id: "ours",
    title: "Our rights and third-party templates",
    body: (
      <>
        <p>
          The Service, including its software, design, brand and our own templates, belongs to us and our licensors. These Terms give you a
          personal, revocable, non-transferable right to use it for your own job search, and nothing else.
        </p>
        <p>
          Some resume templates are open-source works by third parties (for example Jake&apos;s Resume under the MIT License, and Awesome
          CV, AltaCV and moderncv under the LaTeX Project Public License). They remain subject to their own licenses, and their authors are
          credited in our source code.
        </p>
        <p>
          If you send us feedback or ideas, we may use them without any obligation to you. If you believe content on the Service infringes
          your rights, write to {mail} with the details.
        </p>
      </>
    ),
  },
  {
    id: "ending",
    title: "Ending your account",
    body: (
      <>
        <p>
          You can delete your account at any time in the app, and ask us to erase your data permanently as described in the{" "}
          <Link href="/legal/privacy#retention">Privacy Policy</Link>.
        </p>
        <p>
          We may suspend or close your account if you seriously or repeatedly break these Terms, if the law requires it, or to protect other
          users or the Service. Unless that would be unlawful or create a risk, we will tell you why and give you a chance to export Your
          Content first. If we shut the Service down, we will give you reasonable notice to export it.
        </p>
      </>
    ),
  },
  {
    id: "liability",
    title: "Disclaimers and liability",
    body: (
      <>
        <p>
          We work hard to keep the Service reliable and your data safe. Because it is a free beta, we provide it &ldquo;as is&rdquo; and
          &ldquo;as available&rdquo;, and, to the extent the law allows, we disclaim implied warranties such as merchantability, fitness for
          a particular purpose and non-infringement.
        </p>
        <p>
          To the extent the law allows, we are not liable for indirect or consequential losses, such as lost job opportunities or lost
          profits, and our total liability for any claim related to the Service is limited to the greater of the amount you paid us in the
          12 months before the claim or US$50.
        </p>
        <p>
          <strong>Your statutory rights come first.</strong> Nothing in these Terms limits rights you have as a consumer that cannot be waived
          by contract, including under the Brazilian Consumer Defense Code (Law No. 8,078/1990) and the consumer protection laws of your US
          state, or our liability for fraud, gross negligence or wilful misconduct.
        </p>
      </>
    ),
  },
  {
    id: "law",
    title: "Governing law and disputes",
    body: (
      <>
        <p>
          These Terms are governed by the laws of Brazil. If you are a consumer, you may bring a claim in the courts of the place where you
          live, and you keep the protection of the mandatory laws of your country or state. There is no arbitration agreement and no class
          action waiver in these Terms.
        </p>
        <p>Before going to court, please write to {mail}: most problems can be solved quickly that way.</p>
      </>
    ),
  },
  {
    id: "changes",
    title: "Changes to these Terms",
    body: (
      <p>
        We may update these Terms as the Service evolves. We will change the date at the top and, for material changes, tell you in the app
        or by email at least 15 days before they take effect. If you keep using the Service after that, the new Terms apply; if you
        don&apos;t agree, you can delete your account.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact",
    body: (
      <p>
        Questions about these Terms? Write to {mail}. If any part of these Terms is found unenforceable, the rest stays in effect. These Terms
        and our policies are the whole agreement between you and us about the Service.
      </p>
    ),
  },
];

export default function Terms() {
  return (
    <LegalDoc
      title="Terms of Service"
      intro={
        <p>
          The rules for using Rayume, written to be read. They apply to users in Brazil, the United States and everywhere else, and they
          never take away the consumer rights the law where you live gives you.
        </p>
      }
      summary={[
        `You need to be ${legal.minimumAge} or older, and you're responsible for your account.`,
        "Your content and the resumes made from it are yours. We use them only to run the Service for you.",
        "AI drafts text; you check it. Only claim what's true, and we can't promise interviews or offers.",
        "Rayume is a free beta, provided as is, and your consumer rights always come first.",
        "Brazilian law applies, and you can go to court where you live.",
      ]}
      sections={sections}
    />
  );
}
