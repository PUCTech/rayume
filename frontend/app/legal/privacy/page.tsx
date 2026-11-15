import type { Metadata } from "next";
import { share } from "../../share";
import Link from "next/link";
import { LegalDoc, Table, type Section } from "../doc";
import { legal } from "../info";

export const metadata: Metadata = share("Privacy Policy · Rayume", "What Rayume collects, why, who processes it, how long it is kept and your rights in Brazil and the United States.");

const mail = <a href={`mailto:${legal.email}`}>{legal.email}</a>;

const sections: Section[] = [
  {
    id: "who",
    title: "Who we are",
    body: (
      <>
        <p>
          Rayume is operated by {legal.controller} (&ldquo;Rayume&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;). For the purposes of
          Brazil&apos;s General Data Protection Law (Lei Geral de Proteção de Dados, Law No. 13,709/2018, the &ldquo;LGPD&rdquo;) and
          US state privacy laws, we are the <strong>controller</strong> of the personal data described here: we decide why and how it is
          processed.
        </p>
        <p>
          This policy covers the Rayume website, web app, API and browser extension (the &ldquo;Service&rdquo;). It does not cover
          third-party sites you visit, including job boards you use the extension on, or GitHub and Google when you use them to sign in.
        </p>
      </>
    ),
  },
  {
    id: "collect",
    title: "What we collect",
    body: (
      <>
        <p>We only collect what we need to build, tailor and export your resumes, keep your account secure and run the Service.</p>
        <Table
          head={["Category", "What it includes", "Where it comes from"]}
          rows={[
            ["Account", "Name, email address, username, password (stored only as a one-way hash), language preference", "You"],
            [
              "Sign-in with GitHub or Google",
              "Your account ID at that provider, and the name, email and profile picture it shares with us",
              "GitHub or Google, when you choose to sign in with them",
            ],
            [
              "Profile",
              "Profession, summary, phone number, location, links (for example LinkedIn or a portfolio) and profile picture, all optional",
              "You",
            ],
            [
              "Career content",
              "What you write about your experience, education, projects and skills; the structured version our AI produces from it; your resumes and every saved version of them; the PDFs and previews we compile",
              "You, and our processing of what you provide",
            ],
            [
              "Job postings",
              "Title, company, link and description of jobs you save, and the keywords we extract from them",
              "You, or the browser extension when you choose to capture a page",
            ],
            [
              "Security and usage records",
              "Sign-in and account events, the IP address they came from, a record of each AI request (model, size, time, success) and errors",
              "Collected automatically when you use the Service",
            ],
            ["Session cookies", "A sign-in session token and a short-lived sign-in check, both described in the Cookie Policy", "Set by the Service"],
          ]}
        />
        <h3>What we don&apos;t collect</h3>
        <ul>
          <li>We don&apos;t use advertising, analytics or tracking cookies, and we don&apos;t build advertising profiles.</li>
          <li>We don&apos;t ask for payment details. Rayume is free during its beta.</li>
          <li>
            We don&apos;t ask for sensitive personal data, such as health, religion, ethnicity, political opinions, sex life or biometric data
            (LGPD Art. 5, II). Resumes rarely need it, so please don&apos;t include it. If you choose to, it is processed only to produce the
            resume you asked for.
          </li>
          <li>Our security logs never contain your passwords, tokens or the content of your resumes and job postings.</li>
        </ul>
      </>
    ),
  },
  {
    id: "use",
    title: "How we use it, and our legal bases",
    body: (
      <>
        <p>
          The LGPD requires a legal basis for every use of personal data (Art. 7). This is what we do with your data and the basis we
          rely on for each:
        </p>
        <Table
          head={["Purpose", "Data used", "Legal basis (LGPD)"]}
          rows={[
            [
              "Create and run your account, including sign-in with GitHub or Google",
              "Account, sign-in, session cookies",
              "Performance of a contract (Art. 7, V)",
            ],
            [
              "Write, structure and tailor your resume content with AI, compile it in LaTeX and keep its version history",
              "Profile, career content, job postings",
              "Performance of a contract (Art. 7, V)",
            ],
            [
              "Show your public profile page, if you fill it in",
              "Username, name, profession, summary, picture, links",
              "Performance of a contract (Art. 7, V)",
            ],
            [
              "Keep the Service and your account secure: detect stolen sessions, abuse and failed sign-ins",
              "Security and usage records, session cookies",
              "Legitimate interests (Art. 7, IX)",
            ],
            [
              "Fix bugs and keep AI costs and quality under control",
              "Security and usage records (never your content)",
              "Legitimate interests (Art. 7, IX)",
            ],
            ["Answer you when you contact us", "Your message and contact details", "Performance of a contract or legitimate interests"],
            [
              "Comply with the law and respond to valid legal requests",
              "Whatever the request lawfully requires",
              "Compliance with a legal obligation (Art. 7, II) and exercise of rights in proceedings (Art. 7, VI)",
            ],
          ]}
        />
        <p>
          Where we rely on legitimate interests, we have weighed them against your rights, we use the minimum data needed, and you can
          object (see <a href="#rights">Your rights</a>). We don&apos;t use your career content to market to you, we don&apos;t sell it, and
          we don&apos;t use it to train AI models.
        </p>
      </>
    ),
  },
  {
    id: "ai",
    title: "How AI is used",
    body: (
      <>
        <p>
          Rayume uses Google&apos;s Gemini models, through the Gemini API, to rewrite your experience, pick out hard and soft skills, match
          your experience to a job posting and fit your content to a template. When you ask for one of these, we send Google the text
          needed for that request (for example one experience entry, or your entries plus a job description). Google returns a structured
          result, which we validate and store in your account.
        </p>
        <ul>
          <li>
            Google acts as our service provider (processor) for these requests. We use the Gemini API under terms in which Google does not
            use the content of our requests to train or improve its models.
          </li>
          <li>
            Nothing Rayume&apos;s AI does produces a legal or similarly significant decision about you: it drafts text that you review, edit
            or discard. You can always change or delete what it wrote, and under LGPD Art. 20 you can ask us to explain or review any
            automated processing that affects your interests.
          </li>
          <li>AI output can be wrong. Check every line before you send a resume to an employer.</li>
        </ul>
      </>
    ),
  },
  {
    id: "share",
    title: "Who we share it with",
    body: (
      <>
        <p>We don&apos;t sell your personal data, and we don&apos;t share it for cross-context behavioral advertising. We share it only:</p>
        <ul>
          <li>
            <strong>With service providers</strong> that run parts of the Service on our behalf and may only use your data to provide it to
            us: hosting and database providers, file storage for your PDFs and pictures, and Google for the Gemini API. They are bound by
            contract to protect it.
          </li>
          <li>
            <strong>With GitHub or Google</strong>, only to the extent needed to sign you in, when you choose to use them.
          </li>
          <li>
            <strong>Publicly</strong>, for your public profile page (<code>/u/your-username</code>), which shows your username, name,
            profession, summary, picture and links. Your email, phone number, location and resumes are never shown there. Leave those fields
            empty if you don&apos;t want them public.
          </li>
          <li>
            <strong>When the law requires it</strong>, in response to a valid order from a court or authority, or to protect the rights,
            property or safety of our users, the public or us.
          </li>
          <li>
            <strong>If the project changes hands</strong>, for example if it becomes a company, with the new operator, who must keep the
            promises in this policy or ask for your consent to new ones.
          </li>
        </ul>
        <p>Resumes and PDFs you download and send to employers are shared by you, under those employers&apos; own privacy policies.</p>
      </>
    ),
  },
  {
    id: "transfers",
    title: "International transfers",
    body: (
      <>
        <p>
          Our providers may process data in the United States and other countries, so your data may be transferred out of Brazil. We make
          these transfers only as the LGPD allows (Art. 33), relying on contractual safeguards such as the standard contractual clauses
          approved by Brazil&apos;s National Data Protection Authority (ANPD), and we require providers to protect your data to a standard
          compatible with the LGPD.
        </p>
      </>
    ),
  },
  {
    id: "retention",
    title: "How long we keep it",
    body: (
      <>
        <Table
          head={["Data", "How long"]}
          rows={[
            ["Account, profile, career content, resumes and job postings", "While your account is active, and until you ask us to erase it"],
            ["Compiled PDFs and previews", "While the resume version they belong to exists"],
            [
              "Sign-in sessions",
              `Up to ${legal.sessionDays} days from sign-in; ended sessions are kept until that deadline so we can detect stolen tokens, then deleted`,
            ],
            ["Security and usage records", `${legal.logRetentionDays} days, then deleted automatically`],
            ["Messages you send us", "As long as needed to answer you and keep a record of the request"],
          ]}
        />
        <p>
          <strong>Disabling vs. erasing.</strong> When you delete your account in the app, it is disabled immediately: you are signed out
          everywhere and nobody can see it, including your public profile, but the data stays so you can change your mind. To erase it
          permanently, write to {mail}. We will delete it from our systems, except data we must keep by law, and it will also leave our
          providers&apos; backups as they cycle.
        </p>
      </>
    ),
  },
  {
    id: "security",
    title: "Security",
    body: (
      <>
        <ul>
          <li>Passwords are hashed with a modern password hashing algorithm; we never store or see them in plain text.</li>
          <li>Session tokens are stored only as hashes, rotate on every use, and a reused stolen token ends the whole session.</li>
          <li>All traffic is encrypted in transit (HTTPS). Your PDFs live in private storage and are served through short-lived links.</li>
          <li>Every request only ever reads the data of the signed-in user, and access to production systems is limited to the team.</li>
        </ul>
        <p>
          No system is perfectly secure. If a security incident creates a relevant risk or damage to you, we will notify you and, where
          required, the ANPD (LGPD Art. 48) and US state authorities, within the timeframes the law sets.
        </p>
      </>
    ),
  },
  {
    id: "rights",
    title: "Your rights",
    body: (
      <>
        <h3>Everyone</h3>
        <p>
          Wherever you live, you can ask us to tell you what data we hold about you, give you a copy, correct it, export it, or erase it.
          You can edit or delete most of your data yourself in the app. For anything else, write to {mail}. We may ask you to confirm your
          identity, usually by replying from your account&apos;s email address. We won&apos;t charge you or treat you differently for
          exercising your rights.
        </p>
        <h3>Brazil (LGPD)</h3>
        <p>Under LGPD Art. 18 you have the right to:</p>
        <ol>
          <li>confirmation that we process your data, and access to it;</li>
          <li>correction of incomplete, inaccurate or outdated data;</li>
          <li>anonymization, blocking or deletion of unnecessary or excessive data, or data processed unlawfully;</li>
          <li>portability of your data to another provider;</li>
          <li>deletion of data processed with your consent;</li>
          <li>information about the entities we share your data with;</li>
          <li>information about the possibility of not giving consent, and its consequences;</li>
          <li>withdrawal of consent; and</li>
          <li>objection to processing based on legitimate interests, if it doesn&apos;t comply with the LGPD.</li>
        </ol>
        <p>
          We answer access requests within 15 days (Art. 19). You can also complain to the National Data Protection Authority (Autoridade
          Nacional de Proteção de Dados, ANPD) at <a href="https://www.gov.br/anpd">gov.br/anpd</a>, and to consumer protection bodies.
        </p>
        <h3>United States</h3>
        <p>
          Depending on your state (including California under the CCPA as amended by the CPRA, and states such as Virginia, Colorado,
          Connecticut, Utah, Texas and Oregon), you may have the right to know what personal information we collect, use and disclose; to
          access and get a portable copy of it; to correct it; to delete it; and to opt out of its sale, sharing for targeted advertising,
          and profiling. We honor these requests for all US users, whether or not a particular law applies to us.
        </p>
        <ul>
          <li>
            <strong>Categories collected in the last 12 months:</strong> identifiers (name, email, username, IP address, account IDs);
            professional or employment-related information (your career content and resumes); internet or other electronic network
            activity (security and usage records); and account login credentials, which are sensitive personal information we use only to
            sign you in.
          </li>
          <li>
            <strong>Sources, purposes and recipients</strong> are described in <a href="#collect">What we collect</a>,{" "}
            <a href="#use">How we use it</a> and <a href="#share">Who we share it with</a>.
          </li>
          <li>
            <strong>Sale and sharing:</strong> we do not sell personal information or share it for cross-context behavioral advertising,
            and we have not done so in the last 12 months. We honor Global Privacy Control signals anyway.
          </li>
          <li>
            <strong>Authorized agents and appeals:</strong> you can use an authorized agent, and if we decline a request you can appeal by
            replying to our answer. We respond within 45 days, as US state laws require.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "children",
    title: "Children and teenagers",
    body: (
      <p>
        Rayume is for people aged {legal.minimumAge} and over, and is not directed to children under 13 (US Children&apos;s Online Privacy
        Protection Act). If you are under 18, you may need a parent or guardian&apos;s permission where you live. We process teenagers&apos;
        data only in their best interest, as LGPD Art. 14 requires. If we learn we hold data from someone under {legal.minimumAge}, we
        delete it. Parents or guardians can contact us at {mail}.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to this policy",
    body: (
      <p>
        We will update this policy when the Service or the law changes, and change the date at the top. If a change materially affects how
        we use data we already hold, we will tell you in the app or by email before it takes effect, and ask for your consent where the law
        requires it.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact and data protection officer",
    body: (
      <>
        <p>
          For any privacy question or request, write to {mail}. This address also reaches our data protection officer (encarregado), who
          handles requests from data subjects and the ANPD (LGPD Art. 41).
        </p>
        <p>
          See also our <Link href="/legal/terms">Terms of Service</Link> and <Link href="/legal/cookies">Cookie Policy</Link>.
        </p>
      </>
    ),
  },
];

export default function Privacy() {
  return (
    <LegalDoc
      title="Privacy Policy"
      intro={
        <p>
          Rayume turns your experience into resumes, so it holds some of the most personal information you have: your career. This policy
          explains exactly what we collect, why, and how to control it, for users in Brazil, the United States and everywhere else.
        </p>
      }
      summary={[
        "We collect your account details, the career content you write, the jobs you save and the resumes we make from them.",
        "Google's Gemini API processes your text to write and tailor resumes, and is not allowed to train on it.",
        "We don't sell your data, show ads, or use tracking cookies.",
        "Your public profile shows only your name, profession, summary, picture and links, if you fill them in.",
        "Security logs are deleted after 90 days. Everything else stays until you ask us to erase it.",
        `Write to ${legal.email} to access, correct, export or erase your data.`,
      ]}
      sections={sections}
    />
  );
}
