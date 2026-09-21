// Data model, mirroring supabase/schema.sql. Kept as the single source of
// truth for shapes shared across scoring, program generation, and UI.

export type Sex = "female" | "male";

export type ActivityLevel = "rarely_active" | "some_walking" | "regularly_active";

export type Equipment = "none" | "bands" | "dumbbells" | "full_gym";

export type ReadinessFlag =
  | "chest_pain_on_exertion"
  | "recent_surgery"
  | "balance_or_falls"
  | "joint_pain_limits_daily_activity"
  | "doctor_advised_against_exercise";

export interface Profile {
  id: string;
  age: number;
  sex: Sex;
  activityLevel: ActivityLevel;
  equipment: Equipment[];
  readinessFlags: ReadinessFlag[];
  createdAt: string;
}

export type TestKey =
  | "sit_to_stand"
  | "timed_carry"
  | "single_leg_balance"
  | "push_up"
  | "sit_and_reach";

export interface BenchmarkResult {
  id: string;
  profileId: string;
  testKey: TestKey;
  rawValue: number;
  /**
   * null when no published norm applies — either the test has no validated
   * population data (timed carry, push-up, balance) or the user is under 60,
   * which the Senior Fitness Test does not cover. See data/NORMS_SOURCE.md.
   * Such results are tracked against the user's own baseline instead.
   */
  percentile: number | null;
  takenAt: string;
}

export type MovementPattern = "hinge" | "squat_or_press" | "push" | "pull" | "carry_or_core" | "balance";

export interface Exercise {
  id: string;
  name: string;
  pattern: MovementPattern;
  equipmentRequired: Equipment[];
  isSeated: boolean;
  isSupported: boolean;
  videoUrl: string | null;
  cues: string[];
  commonMistake: string;
  substituteIds: string[];
  contraindicatedFlags: ReadinessFlag[];
  jargonGloss?: Record<string, string>;
}

export interface PercentileBand {
  minPercentile: number;
  maxPercentile: number;
  minValue: number;
  maxValue: number;
}

export interface Norm {
  id: string;
  testKey: TestKey;
  sex: Sex;
  ageMin: number;
  ageMax: number;
  percentileBands: PercentileBand[];
  higherIsBetter: boolean;
  unit: string;
}

export interface Program {
  id: string;
  profileId: string;
  generatedAt: string;
  active: boolean;
}

export interface ProgramExercise {
  id: string;
  programId: string;
  exerciseId: string;
  dayIndex: number; // 0 or 1, for the 2x/week structure
  targetSets: number;
  targetRepMin: number;
  targetRepMax: number;
  targetLoad: number | null; // null when load isn't adjustable (bodyweight/bands)
  loadIncrement: number | null;
}

export interface SetLogEntry {
  setIndex: number;
  reps: number;
  load: number | null;
}

export interface SessionLog {
  id: string;
  profileId: string;
  programExerciseId: string;
  performedAt: string;
  sets: SetLogEntry[];
}

export type AgeBracket = "under_55" | "55_plus";

export function ageBracketFor(age: number): AgeBracket {
  return age >= 55 ? "55_plus" : "under_55";
}
