import { article as resumeGuide } from "./resume-guide";
import { article as githubProfile } from "./github-profile";
import { article as atsChecklist } from "./ats-checklist";
import { article as applications } from "./applications";
import { article as interviewPrep } from "./interview-prep";
import { article as firstOffer } from "./first-offer";

// the guides, in the order a job hunt needs them; each is served at /resources/{slug}
export const guides = [resumeGuide, githubProfile, atsChecklist, applications, interviewPrep, firstOffer];
