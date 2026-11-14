import type { Metadata } from "next";
import { share } from "../../share";
import Link from "next/link";
import { LegalDoc, Table, type Section } from "../doc";
import { legal } from "../info";

export const metadata: Metadata = share("Cookie Policy · Rayume", "The two strictly necessary cookies Rayume uses, and why there is no cookie banner.");

const sections: Section[] = [
  {
    id: "what",
    title: "What cookies are",
    body: (
      <p>
        Cookies are small text files a website stores in your browser so it can remember something between pages or visits, such as the fact
        that you are signed in. Similar technologies include local storage. This policy covers all of them.
      </p>
    ),
  },
  {
    id: "ours",
    title: "The cookies we use",
    body: (
      <>
        <p>Rayume uses two cookies, both strictly necessary for signing in. That is the complete list.</p>
        <Table
          head={["Cookie", "Purpose", "Duration", "Type"]}
          rows={[
            [
              <code key="r">refresh_token</code>,
              "Keeps you signed in. It holds a random session token, is unreadable by scripts (HttpOnly), is sent only over HTTPS and only to our sign-in endpoints, and changes every time it is used.",
              `Until you sign out, or ${legal.sessionDays} days after you signed in, whichever comes first`,
              "First-party, strictly necessary",
            ],
            [
              <code key="o">oauth_state</code>,
              "Protects sign-in with GitHub or Google from forged requests by checking that the response belongs to the sign-in you started.",
              "10 minutes, or until sign-in finishes",
              "First-party, strictly necessary",
            ],
          ]}
        />
        <p>
          We don&apos;t use analytics, advertising, social media or tracking cookies, and no third party sets cookies through Rayume. GitHub
          and Google set their own cookies on their own sites when you sign in with them, under their policies. We don&apos;t store personal
          data in your browser&apos;s local storage.
        </p>
      </>
    ),
  },
  {
    id: "consent",
    title: "Why there's no cookie banner",
    body: (
      <>
        <p>
          Strictly necessary cookies don&apos;t require consent. Under the LGPD, and following the ANPD&apos;s guidance on cookies, we rely
          on the performance of our contract with you and our legitimate interest in keeping your account secure (LGPD Art. 7, V and IX).
          US state privacy laws don&apos;t require consent for them either, and because we don&apos;t sell or share data for advertising,
          there is nothing to opt out of.
        </p>
        <p>
          If we ever add cookies that aren&apos;t strictly necessary, such as analytics, we will update this policy first and ask for your
          consent before setting them.
        </p>
      </>
    ),
  },
  {
    id: "control",
    title: "Controlling cookies",
    body: (
      <p>
        You can block or delete cookies in your browser settings. If you block the two cookies above, you won&apos;t be able to stay signed
        in, but the public pages of the site still work. Signing out deletes the <code>refresh_token</code> cookie and ends that session.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact",
    body: (
      <p>
        Questions? Write to <a href={`mailto:${legal.email}`}>{legal.email}</a>. For how we handle personal data in general, see the{" "}
        <Link href="/legal/privacy">Privacy Policy</Link>.
      </p>
    ),
  },
];

export default function Cookies() {
  return (
    <LegalDoc
      title="Cookie Policy"
      intro={<p>Rayume keeps cookies to the minimum it needs to sign you in, and nothing more.</p>}
      summary={[
        "We use exactly two cookies, both to keep you signed in securely.",
        "No analytics, advertising or tracking cookies, and no third-party cookies.",
        "Strictly necessary cookies don't need consent, so there's no banner.",
        "If that ever changes, we'll ask first.",
      ]}
      sections={sections}
    />
  );
}
