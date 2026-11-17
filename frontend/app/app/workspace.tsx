import type { Message, Mode, Reply } from "./chat";
import type { Quote } from "./resume";
import { postings, refined, type Entry, type Posting } from "./data";

const hardSkills = (list: Entry[]) => {
  const n = new Map<string, number>();
  list.forEach((e) => e.hard_skills.forEach((s) => n.set(s, (n.get(s) ?? 0) + 1)));
  return [...n].sort((a, b) => b[1] - a[1]);
};
const softSkills = (list: Entry[]) => [...new Set(list.flatMap((e) => e.soft_skills))];

// What Rayume answers in each mode. shortcut: scripted until the API's AI routes exist
// (POST /experiences and /experiences/{id}/refine, POST /resumes for tailoring); replace with fetches then.
export function answer(mode: Mode, text: string, quote: Quote | null, list: Entry[]): Omit<Message, "id" | "from"> {
  if (mode === "refine") {
    if (quote?.bulletId && refined[quote.bulletId])
      return { text: "Here's a sharper version that leads with the result:", suggestion: { bulletId: quote.bulletId, text: refined[quote.bulletId] } };
    if (quote) return { text: "That part isn't one of your bullets. Paste a bullet and I'll rewrite it around its impact." };
    return { text: "Select a line on your resume and paste it here, and I'll rewrite it around its impact." };
  }
  if (mode === "add") {
    const said = [quote?.text, text].filter(Boolean).join(" ").trim();
    if (!said) return { text: "Tell me about it in your own words: where, when, what you did and what changed because of it." };
    const bullets = said
      .split(/(?<=[.!?])\s+/)
      .filter((s) => s.length > 3)
      .map((s, i) => ({ id: `new-${Date.now()}-${i}`, text: s[0].toUpperCase() + s.slice(1).replace(/[.!?]?$/, ".") }));
    const today = new Date().toISOString().slice(0, 7);
    return {
      text: "Here's a draft entry. Check it, then add it to your Master Resume.",
      draft: { entry: { id: `new-${Date.now()}`, type: "project", title: "New experience", organization: "", start: today, end: today, bullets, hard_skills: [], soft_skills: [] } },
    };
  }
  if (mode === "tailor") {
    const posting = postings.find((p) => (text + " " + (quote?.text ?? "")).toLowerCase().includes(p.company.toLowerCase())) ?? (text || quote ? postings[0] : undefined);
    if (!posting) return { text: "Which job? Paste the posting, or pick one you saved:", postings };
    const covered = posting.keywords.length - posting.missing.length;
    return {
      text: `${posting.company}'s ${posting.title} posting asks for ${posting.keywords.length} things and your Master Resume covers ${covered}. Missing: ${posting.missing.join(" and ")}. I'd lead with the Lumen Labs billing and dashboard work. Want the tailored version?`,
      tailored: { posting },
    };
  }
  const hard = hardSkills(list);
  return { text: `Across your entries I found ${hard.length} hard skills and ${softSkills(list).length} soft skills. The ones you use most come first.`, skills: { hard, soft: softSkills(list) } };
}

const said = (text: string, word: string) => new RegExp(`(^|[^a-z])${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}($|[^a-z])`, "i").test(text);
const and = (words: string[]) => (words.length < 2 ? words.join("") : `${words.slice(0, -1).join(", ")} and ${words.at(-1)}`);

// Rayume tailoring a resume to a job (POST /resumes with job_posting_id), held to the security doc's rules so
// the real call can take its place: it only rewrites bullets the resume has, by their id; it takes no fact
// from the posting (no employer, date, link, email or phone), and invents no experience. It picks the
// bullets whose rewrite says what the job asks for, and leaves the job's missing skills unclaimed.
// current is a bullet's text in this resume now, which a proposal starts from.
// shortcut: scripted from the canned rewrites (data.ts refined); POST /resumes with job_posting_id replaces it,
// returning per-bullet proposals (docs/todo/scope-application-tracking.md)
export function tailoring(job: Posting, list: Entry[], current: (bulletId: string) => string): Reply {
  if (!job.keywords.length)
    return { text: `I haven't read what ${job.company} asks for yet: this job has no requirements extracted, so there's nothing honest to tailor to. Open it in the editor and make it yours.` };
  const asked = job.keywords.filter((k) => !job.missing.includes(k));
  const proposals = list
    .flatMap((e) => e.bullets)
    .flatMap((b) => {
      const after = refined[b.id];
      const uses = after ? asked.filter((k) => said(after, k)) : [];
      const before = current(b.id);
      return uses.length && before !== after ? [{ bulletId: b.id, before, after, uses }] : [];
    })
    .sort((a, b) => b.uses.length - a.uses.length)
    .slice(0, 4);
  if (!proposals.length) return { text: `None of your bullets show what ${job.company} asks for, so I left the resume as it is. Open it in the editor to change it yourself.` };
  const used = [...new Set(proposals.flatMap((p) => p.uses))];
  return {
    text: `I tailored this resume to ${job.company}'s ${job.title} posting. ${proposals.length === 1 ? "One bullet already shows" : `${proposals.length} bullets already show`} what they ask for (${and(used)}), so I rewrote ${proposals.length === 1 ? "it" : "them"} to lead with it.${job.missing.length ? ` I left ${and(job.missing)} out: nothing in your experience shows ${job.missing.length === 1 ? "it" : "them"}.` : ""} Replace or skip each one.`,
    proposals,
  };
}

// an answer while reviewing a tailoring: a shorter take on a proposal ("make the second one shorter"),
// cut from its own text, or a pointer to the editor
export function tailorAnswer(text: string, proposals: { bulletId: string; after: string }[]): Reply {
  const t = text.toLowerCase();
  const n = ["first", "second", "third", "fourth"].findIndex((w, i) => t.includes(w) || t.includes(String(i + 1)));
  const p = proposals[n] ?? proposals.at(-1);
  if (p && /short|cut|trim|concise/.test(t)) {
    const short = p.after.split(/(?<=[a-z0-9)])[,;] | (?:with|while|by|from) /i)[0].replace(/[.,;]?$/, ".");
    if (short !== p.after) return { text: "Here's a shorter one, cut from the same line:", suggestion: { bulletId: p.bulletId, text: short } };
  }
  return { text: "I can make a change shorter: say which one. For anything else, open the resume in the editor and change the line yourself, or select it there and ask me." };
}
