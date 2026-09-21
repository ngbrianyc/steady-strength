import type {
  Equipment,
  Exercise,
  MovementPattern,
  Profile,
  ProgramExercise,
  TestKey,
} from "@/types/models";
import { EXERCISES } from "@/data/exerciseRepo";

/**
 * Balance is a standing requirement, not a bonus earned by a weak test result.
 * Two reasons: the balance test has no published norms we can score against
 * (see data/NORMS_SOURCE.md), so weakness can't be detected that way at all;
 * and supported balance work carries essentially no risk while falls are the
 * costliest outcome for this population. The safe default is to include it for
 * everyone rather than to wait for evidence someone needs it.
 */
const REQUIRED_PATTERNS: MovementPattern[] = [
  "hinge",
  "squat_or_press",
  "push",
  "pull",
  "carry_or_core",
  "balance",
];

/** Which movement pattern most directly addresses a weak result on a given benchmark test. */
const PATTERN_FOR_WEAK_TEST: Record<TestKey, MovementPattern> = {
  sit_to_stand: "squat_or_press",
  timed_carry: "carry_or_core",
  single_leg_balance: "balance",
  push_up: "push",
  sit_and_reach: "hinge",
};

export function hasRequiredEquipment(exercise: Exercise, owned: Equipment[]): boolean {
  return exercise.equipmentRequired.every(
    (req) => req === "none" || owned.includes(req) || owned.includes("full_gym")
  );
}

export function isContraindicated(exercise: Exercise, profile: Profile): boolean {
  return exercise.contraindicatedFlags.some((f) => profile.readinessFlags.includes(f));
}

export function eligibleExercises(profile: Profile): Exercise[] {
  return EXERCISES.filter(
    (ex) => hasRequiredEquipment(ex, profile.equipment) && !isContraindicated(ex, profile)
  );
}

function equipmentTierScore(exercise: Exercise, owned: Equipment[]): number {
  // Prefer heavier, adjustable-load equipment when the user owns it, since
  // progressive overload works better with a loadable exercise than a
  // bodyweight one (see src/lib/overload.ts). Safety (seated/supported) is
  // scored separately and takes priority over this.
  if (exercise.equipmentRequired.includes("dumbbells") && owned.includes("dumbbells")) return 2;
  if (exercise.equipmentRequired.includes("bands") && owned.includes("bands")) return 1;
  return 0;
}

function pickForPattern(
  pattern: MovementPattern,
  candidates: Exercise[],
  owned: Equipment[],
  preferSeatedOrSupported: boolean,
  exclude: Set<string>
): Exercise | undefined {
  const inPattern = candidates.filter((ex) => ex.pattern === pattern && !exclude.has(ex.id));
  if (inPattern.length === 0) return undefined;

  const ranked = [...inPattern].sort((a, b) => {
    if (preferSeatedOrSupported) {
      const aSafe = a.isSeated || a.isSupported ? 1 : 0;
      const bSafe = b.isSeated || b.isSupported ? 1 : 0;
      if (aSafe !== bSafe) return bSafe - aSafe;
    }
    return equipmentTierScore(b, owned) - equipmentTierScore(a, owned);
  });

  return ranked[0];
}

export interface SelectedExercise {
  exercise: Exercise;
  reason: "core_pattern" | "weak_area";
}

/**
 * Chooses one exercise per required pattern (hinge, squat/press, push, pull, carry/core),
 * then adds a bonus exercise for each weak benchmark area not already covered by a
 * required pattern (currently only "balance").
 */
export function selectExercisesForProfile(
  profile: Profile,
  weakestTestKeys: TestKey[] = []
): SelectedExercise[] {
  const candidates = eligibleExercises(profile);
  const preferSupported = profile.readinessFlags.length > 0;
  const chosen: SelectedExercise[] = [];
  const usedIds = new Set<string>();

  for (const pattern of REQUIRED_PATTERNS) {
    const picked = pickForPattern(pattern, candidates, profile.equipment, preferSupported, usedIds);
    if (picked) {
      chosen.push({ exercise: picked, reason: "core_pattern" });
      usedIds.add(picked.id);
    }
  }

  const weakPatterns = new Set(
    weakestTestKeys.map((k) => PATTERN_FOR_WEAK_TEST[k]).filter((p) => !REQUIRED_PATTERNS.includes(p))
  );
  for (const pattern of weakPatterns) {
    const picked = pickForPattern(pattern, candidates, profile.equipment, preferSupported, usedIds);
    if (picked) {
      chosen.push({ exercise: picked, reason: "weak_area" });
      usedIds.add(picked.id);
    }
  }

  return chosen;
}

const DEFAULT_DUMBBELL_LOAD = 5;
const DEFAULT_DUMBBELL_INCREMENT = 2.5;

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/**
 * Balance holds start from the user's own measured stance time rather than a
 * fixed target: prescribing a 20-second hold to someone who managed two is
 * both impossible and discouraging. The program exercise is chair-supported,
 * so the target sits a little above the unsupported benchmark figure.
 */
function balanceHoldTarget(baselineSeconds: number | null): { min: number; max: number } {
  if (baselineSeconds === null || Number.isNaN(baselineSeconds)) {
    return { min: 10, max: 20 };
  }
  return {
    min: clamp(Math.round(baselineSeconds * 0.75), 5, 20),
    max: clamp(Math.round(baselineSeconds * 1.25), 10, 30),
  };
}

function defaultPrescription(
  exercise: Exercise,
  rawResults: Partial<Record<TestKey, number>>
): {
  targetSets: number;
  targetRepMin: number;
  targetRepMax: number;
  targetLoad: number | null;
  loadIncrement: number | null;
} {
  const usesDumbbells = exercise.equipmentRequired.includes("dumbbells");
  if (exercise.pattern === "balance") {
    // Reps field doubles as seconds held for balance work at this MVP stage.
    const hold = balanceHoldTarget(rawResults.single_leg_balance ?? null);
    return {
      targetSets: 2,
      targetRepMin: hold.min,
      targetRepMax: hold.max,
      targetLoad: null,
      loadIncrement: null,
    };
  }
  return {
    targetSets: 2,
    targetRepMin: 8,
    targetRepMax: 12,
    targetLoad: usesDumbbells ? DEFAULT_DUMBBELL_LOAD : null,
    loadIncrement: usesDumbbells ? DEFAULT_DUMBBELL_INCREMENT : null,
  };
}

/**
 * Builds the program_exercise rows for a freshly generated 2x/week program.
 * Both training days use the same exercise selection (full-body, full-body),
 * as separate rows so each day's load/reps can progress independently.
 */
export function buildProgramExercises(
  programId: string,
  profile: Profile,
  weakestTestKeys: TestKey[] = [],
  /** Raw benchmark values, used to pitch starting targets at measured ability. */
  rawResults: Partial<Record<TestKey, number>> = {}
): Omit<ProgramExercise, "id">[] {
  const selected = selectExercisesForProfile(profile, weakestTestKeys);
  const rows: Omit<ProgramExercise, "id">[] = [];

  for (const dayIndex of [0, 1]) {
    for (const { exercise } of selected) {
      const rx = defaultPrescription(exercise, rawResults);
      rows.push({
        programId,
        exerciseId: exercise.id,
        dayIndex,
        ...rx,
      });
    }
  }

  return rows;
}
