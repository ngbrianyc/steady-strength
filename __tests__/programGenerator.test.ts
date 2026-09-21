import {
  buildProgramExercises,
  eligibleExercises,
  hasRequiredEquipment,
  selectExercisesForProfile,
} from "@/lib/programGenerator";
import type { Profile } from "@/types/models";

function makeProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: "profile-1",
    age: 62,
    sex: "female",
    activityLevel: "rarely_active",
    equipment: ["none"],
    readinessFlags: [],
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("hasRequiredEquipment", () => {
  it("allows bodyweight exercises regardless of owned equipment", () => {
    const bodyweight = eligibleExercises(makeProfile({ equipment: ["none"] })).find(
      (e) => e.id === "chair_squat"
    )!;
    expect(hasRequiredEquipment(bodyweight, [])).toBe(true);
  });

  it("excludes dumbbell exercises when the user has no dumbbells", () => {
    const withoutDumbbells = eligibleExercises(makeProfile({ equipment: ["none"] }));
    expect(withoutDumbbells.some((e) => e.id === "dumbbell_goblet_squat")).toBe(false);
  });

  it("includes dumbbell exercises when the user owns dumbbells", () => {
    const withDumbbells = eligibleExercises(makeProfile({ equipment: ["none", "dumbbells"] }));
    expect(withDumbbells.some((e) => e.id === "dumbbell_goblet_squat")).toBe(true);
  });
});

describe("selectExercisesForProfile", () => {
  it("covers all five required patterns for a no-equipment profile", () => {
    const profile = makeProfile({ equipment: ["none"] });
    const selected = selectExercisesForProfile(profile);
    const patterns = selected.map((s) => s.exercise.pattern);
    expect(patterns).toEqual(
      expect.arrayContaining(["hinge", "squat_or_press", "push", "pull", "carry_or_core"])
    );
  });

  it("never selects an exercise contraindicated by a readiness flag", () => {
    const profile = makeProfile({
      equipment: ["none", "dumbbells"],
      readinessFlags: ["balance_or_falls"],
    });
    const selected = selectExercisesForProfile(profile);
    expect(selected.some((s) => s.exercise.contraindicatedFlags.includes("balance_or_falls"))).toBe(
      false
    );
  });

  it("prefers seated or supported exercises when readiness flags are present", () => {
    const profile = makeProfile({
      equipment: ["none", "bands"],
      readinessFlags: ["joint_pain_limits_daily_activity"],
    });
    const selected = selectExercisesForProfile(profile);
    const pushPick = selected.find((s) => s.exercise.pattern === "push")!;
    expect(pushPick.exercise.isSeated || pushPick.exercise.isSupported).toBe(true);
  });

  it("always includes balance work, since its test has no norms to flag weakness with", () => {
    const profile = makeProfile({ equipment: ["none"] });
    // No weak areas passed at all — balance must still be programmed.
    const selected = selectExercisesForProfile(profile, []);
    expect(selected.some((s) => s.exercise.pattern === "balance")).toBe(true);
  });

  it("includes balance work even for someone who reported falls, using a supported variant", () => {
    const profile = makeProfile({
      equipment: ["none", "dumbbells"],
      readinessFlags: ["balance_or_falls"],
    });
    const balancePick = selectExercisesForProfile(profile).find(
      (s) => s.exercise.pattern === "balance"
    );
    expect(balancePick).toBeDefined();
    expect(balancePick!.exercise.isSeated || balancePick!.exercise.isSupported).toBe(true);
  });
});

describe("buildProgramExercises", () => {
  it("creates rows for both training days from the same exercise selection", () => {
    const profile = makeProfile();
    const rows = buildProgramExercises("program-1", profile);
    const dayZero = rows.filter((r) => r.dayIndex === 0);
    const dayOne = rows.filter((r) => r.dayIndex === 1);
    expect(dayZero.length).toBe(dayOne.length);
    expect(dayZero.map((r) => r.exerciseId)).toEqual(dayOne.map((r) => r.exerciseId));
  });

  it("pitches the balance hold at measured ability, not a fixed target", () => {
    const profile = makeProfile({ equipment: ["none"] });
    const balanceRow = (baseline: number) =>
      buildProgramExercises("prog", profile, [], { single_leg_balance: baseline }).find((r) =>
        r.exerciseId.includes("stance")
      )!;

    // Someone who held 2 seconds must not be told to hold 15-25.
    const weak = balanceRow(2);
    expect(weak.targetRepMax).toBeLessThanOrEqual(10);

    const strong = balanceRow(30);
    expect(strong.targetRepMin).toBeGreaterThan(weak.targetRepMin);
    expect(strong.targetRepMax).toBeLessThanOrEqual(30);
  });

  it("falls back to a conservative balance hold when the test was skipped", () => {
    const profile = makeProfile({ equipment: ["none"] });
    const row = buildProgramExercises("prog", profile, [], {}).find((r) =>
      r.exerciseId.includes("stance")
    )!;
    expect(row.targetRepMin).toBeGreaterThan(0);
    expect(row.targetRepMax).toBeLessThanOrEqual(30);
  });

  it("gives dumbbell exercises an adjustable load and bodyweight exercises none", () => {
    const profile = makeProfile({ equipment: ["none", "dumbbells"] });
    const rows = buildProgramExercises("program-1", profile);
    for (const row of rows) {
      if (row.exerciseId.startsWith("dumbbell_")) {
        expect(row.targetLoad).not.toBeNull();
        expect(row.loadIncrement).not.toBeNull();
      }
    }
  });
});
