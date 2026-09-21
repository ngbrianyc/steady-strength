import type { AgeBracket } from "@/types/models";

export interface LearnEntry {
  id: string;
  topic: "mortality" | "cognition" | "bone_density" | "fall_risk";
  title: string;
  citation: string; // author, year, publication
  plainLanguageFinding: string;
}

/**
 * Real published studies, summarized in plain language — not quoted verbatim.
 * These are general research findings, not personalized medical advice; the
 * app never tells a user what their personal risk is (see non-negotiables).
 */
const CONTENT_55_PLUS: LearnEntry[] = [
  {
    id: "mortality-momma-2022",
    topic: "mortality",
    title: "Strength training and living longer",
    citation: "Momma et al., 2022, British Journal of Sports Medicine",
    plainLanguageFinding:
      "This review pooled many studies and found that adults who did muscle-strengthening activity regularly had a lower rate of death from any cause over the study periods, compared with adults who did none — with the biggest benefit showing up at roughly 30-60 minutes a week.",
  },
  {
    id: "cognition-northey-2018",
    topic: "cognition",
    title: "Strength training and thinking skills",
    citation: "Northey et al., 2018, British Journal of Sports Medicine",
    plainLanguageFinding:
      "This review of exercise trials in adults over 50 found that resistance training was linked to measurable improvements in cognitive function, including memory and processing speed, over the course of the study programs.",
  },
  {
    id: "bone-watson-2018",
    topic: "bone_density",
    title: "Strength training and bone density",
    citation: "Watson et al., 2018, Journal of Bone and Mineral Research (the LIFTMOR trial)",
    plainLanguageFinding:
      "In this trial, postmenopausal women with low bone density who did supervised, progressively heavier resistance training for 8 months saw improvements in spine and hip bone density, compared with a group doing a low-intensity home program.",
  },
  {
    id: "falls-sherrington-2019",
    topic: "fall_risk",
    title: "Exercise and fall prevention",
    citation: "Sherrington et al., 2019, Cochrane Database of Systematic Reviews",
    plainLanguageFinding:
      "This large review of fall-prevention trials found that exercise programs emphasizing balance and functional strength reduced the rate of falls in community-dwelling older adults, compared with usual care.",
  },
];

// v2 scope: a distinct content library for the younger/aesthetics persona.
// For now, under-55 users see the same evidence base, since the underlying
// physiology (strength, bone, cognition, fall risk later in life) still applies.
const CONTENT_UNDER_55: LearnEntry[] = CONTENT_55_PLUS;

export function learnContentFor(bracket: AgeBracket): LearnEntry[] {
  return bracket === "55_plus" ? CONTENT_55_PLUS : CONTENT_UNDER_55;
}
