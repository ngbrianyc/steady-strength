import { EXERCISES, getExerciseById } from "@/data/exerciseRepo";
import { selectExercisesForProfile } from "@/lib/programGenerator";
import type { MovementPattern, Profile, ReadinessFlag } from "@/types/models";

const REQUIRED_PATTERNS: MovementPattern[] = [
  "hinge",
  "squat_or_press",
  "push",
  "pull",
  "carry_or_core",
];

const ALL_FLAGS: ReadinessFlag[] = [
  "chest_pain_on_exertion",
  "recent_surgery",
  "balance_or_falls",
  "joint_pain_limits_daily_activity",
  "doctor_advised_against_exercise",
];

function makeProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: "p",
    age: 67,
    sex: "female",
    activityLevel: "rarely_active",
    equipment: ["none"],
    readinessFlags: [],
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("exercise library integrity", () => {
  it("every substitute id resolves to a real exercise", () => {
    for (const ex of EXERCISES) {
      for (const sid of ex.substituteIds) {
        expect(getExerciseById(sid)).toBeDefined();
      }
    }
  });

  it("no exercise lists itself as its own substitute", () => {
    for (const ex of EXERCISES) {
      expect(ex.substituteIds).not.toContain(ex.id);
    }
  });
});

describe("non-negotiable: every exercise has a seated variant", () => {
  // The seated fallback must not depend on equipment the user may not own,
  // otherwise a no-equipment user has no seated option at all.
  it("every exercise is seated, or substitutes to a seated no-equipment exercise", () => {
    const offenders: string[] = [];
    for (const ex of EXERCISES) {
      if (ex.isSeated) continue;
      const hasBodyweightSeatedSub = ex.substituteIds
        .map(getExerciseById)
        .some((s) => s && s.isSeated && s.equipmentRequired.every((e) => e === "none"));
      if (!hasBodyweightSeatedSub) offenders.push(ex.id);
    }
    expect(offenders).toEqual([]);
  });
});

describe("program generation stays safe for at-risk, no-equipment profiles", () => {
  it("gives a complete program to a no-equipment profile", () => {
    const selected = selectExercisesForProfile(makeProfile({ equipment: ["none"] }));
    const patterns = selected.map((s) => s.exercise.pattern);
    for (const required of REQUIRED_PATTERNS) {
      expect(patterns).toContain(required);
    }
  });

  it("only selects seated or supported exercises when a readiness flag is set, even with no equipment", () => {
    for (const flag of ALL_FLAGS) {
      const profile = makeProfile({ equipment: ["none"], readinessFlags: [flag] });
      const selected = selectExercisesForProfile(profile);
      const unsupported = selected
        .filter((s) => !s.exercise.isSeated && !s.exercise.isSupported)
        .map((s) => `${flag}: ${s.exercise.id}`);
      expect(unsupported).toEqual([]);
    }
  });

  it("still covers every required pattern for a flagged, no-equipment profile", () => {
    const profile = makeProfile({
      equipment: ["none"],
      readinessFlags: ["balance_or_falls"],
    });
    const patterns = selectExercisesForProfile(profile).map((s) => s.exercise.pattern);
    for (const required of REQUIRED_PATTERNS) {
      expect(patterns).toContain(required);
    }
  });
});
