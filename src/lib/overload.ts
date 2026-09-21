import type { SetLogEntry } from "@/types/models";

export interface Prescription {
  targetSets: number;
  targetRepMin: number;
  targetRepMax: number;
  /** null when the exercise has no adjustable load (bodyweight, fixed-resistance band). */
  targetLoad: number | null;
  /** smallest load increment available for this exercise; null when load isn't adjustable. */
  loadIncrement: number | null;
}

function isAdjustable(p: Prescription): boolean {
  return p.targetLoad !== null && p.loadIncrement !== null;
}

function allSetsAtTopOfRange(sets: SetLogEntry[], p: Prescription): boolean {
  if (sets.length < p.targetSets) return false;
  return sets.every((s) => s.reps >= p.targetRepMax);
}

function anySetBelowBottomOfRange(sets: SetLogEntry[], p: Prescription): boolean {
  if (sets.length === 0) return false;
  return sets.some((s) => s.reps < p.targetRepMin);
}

/**
 * Pure progressive-overload rule, decoupled from UI and storage so it can be
 * unit tested and tuned independently.
 *
 *   if all sets completed at top of prescribed rep range:
 *       if load is adjustable -> increase load by smallest increment, reps stay at prescribed range
 *       else -> increase target reps by 1 (both ends of the range, to preserve range width)
 *   if any set fell below bottom of range for two consecutive sessions:
 *       decrease load by one increment
 *   else:
 *       repeat prescription
 */
export function nextPrescription(
  current: Prescription,
  lastSessionSets: SetLogEntry[],
  previousSessionSets: SetLogEntry[] = []
): Prescription {
  if (allSetsAtTopOfRange(lastSessionSets, current)) {
    if (isAdjustable(current)) {
      return {
        ...current,
        targetLoad: current.targetLoad! + current.loadIncrement!,
      };
    }
    return {
      ...current,
      targetRepMin: current.targetRepMin + 1,
      targetRepMax: current.targetRepMax + 1,
    };
  }

  const failedLastTwoSessions =
    anySetBelowBottomOfRange(lastSessionSets, current) &&
    anySetBelowBottomOfRange(previousSessionSets, current);

  if (failedLastTwoSessions && isAdjustable(current)) {
    return {
      ...current,
      targetLoad: Math.max(0, current.targetLoad! - current.loadIncrement!),
    };
  }

  return { ...current };
}
