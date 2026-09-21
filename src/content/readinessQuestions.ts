import type { ReadinessFlag } from "@/types/models";

export interface ReadinessQuestionDef {
  flag: ReadinessFlag;
  question: string;
}

export const READINESS_QUESTIONS: ReadinessQuestionDef[] = [
  { flag: "chest_pain_on_exertion", question: "Do you ever feel chest pain during physical activity?" },
  { flag: "recent_surgery", question: "Have you had surgery in the last 3 months?" },
  { flag: "balance_or_falls", question: "Do you have problems with balance, or have you fallen recently?" },
  {
    flag: "joint_pain_limits_daily_activity",
    question: "Does joint pain limit things you do every day?",
  },
  {
    flag: "doctor_advised_against_exercise",
    question: "Has a doctor ever told you not to exercise?",
  },
];
