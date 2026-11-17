import type { Article } from "../content";
import { post as whyLatex } from "./why-we-write-resumes-in-latex";
import { post as tailoring } from "./what-tailoring-should-change";
import { post as firstResume } from "./first-resume-no-experience";

// the blog's posts, newest first; each is served at /resources/blog/{slug}
export const posts: Article[] = [whyLatex, tailoring, firstResume];
