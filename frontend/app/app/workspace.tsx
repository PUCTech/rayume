import type { Message, Mode } from "./chat";
import type { Quote } from "./resume";
import { postings, refined, type Entry } from "./data";

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
