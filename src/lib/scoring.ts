import type { BenchmarkResult, Norm, Sex, TestKey } from "@/types/models";
import normsData from "@/data/norms.json";

const NORMS = normsData as Norm[];

export const TEST_LABELS: Record<TestKey, string> = {
  sit_to_stand: "Lower-body strength",
  timed_carry: "Grip and core strength",
  single_leg_balance: "Balance",
  push_up: "Upper-body strength",
  sit_and_reach: "Flexibility",
};

export function findNorm(testKey: TestKey, sex: Sex, age: number): Norm | undefined {
  return NORMS.find(
    (n) => n.testKey === testKey && n.sex === sex && age >= n.ageMin && age <= n.ageMax
  );
}

/** Clamps a raw value to the nearest defined band and returns the midpoint percentile for that band. */
export function percentileFor(norm: Norm, rawValue: number): number {
  const bands = norm.percentileBands;
  const match = bands.find((b) => rawValue >= b.minValue && rawValue <= b.maxValue);
  if (match) {
    return Math.round((match.minPercentile + match.maxPercentile) / 2);
  }
  // Out of range: clamp to the nearest band by value, then take that band's
  // outward edge. Which edge depends on direction: for a lower-is-better test
  // (timed carry) the band holding the *lowest* values is the best-performing
  // one, so the percentile ordering runs opposite to the value ordering.
  const sorted = [...bands].sort((a, b) => a.minValue - b.minValue);
  const lowestValueBand = sorted[0];
  const highestValueBand = sorted[sorted.length - 1];

  if (rawValue < lowestValueBand.minValue) {
    return norm.higherIsBetter ? lowestValueBand.minPercentile : lowestValueBand.maxPercentile;
  }
  return norm.higherIsBetter ? highestValueBand.maxPercentile : highestValueBand.minPercentile;
}

export function scoreBenchmark(
  testKey: TestKey,
  sex: Sex,
  age: number,
  rawValue: number
): { percentile: number } | null {
  const norm = findNorm(testKey, sex, age);
  if (!norm) return null;
  return { percentile: percentileFor(norm, rawValue) };
}

/**
 * Plain-language summary rules (spec non-negotiables):
 * - never show a raw percentile without interpretation
 * - never use the phrase "below average"
 * - frame low scores as "the area with the most room to improve"
 */
export function plainLanguageForPercentile(percentile: number): string {
  if (percentile >= 75) return "one of your strongest areas right now";
  if (percentile >= 50) return "a solid, steady area for you";
  if (percentile >= 25) return "coming along, with clear room to grow";
  return "the area with the most room to improve";
}

export interface BenchmarkSummary {
  paragraph: string;
  /** Drawn only from tests that have a published norm; may be empty. */
  weakestTestKeys: TestKey[];
  /** Tests recorded as raw values because no norm applies to them. */
  unscoredTestKeys: TestKey[];
}

/** A result only counts toward ranking if it was actually scored against a norm. */
function isScored(r: BenchmarkResult): r is BenchmarkResult & { percentile: number } {
  return r.percentile !== null;
}

export function summarizeBenchmark(results: BenchmarkResult[]): BenchmarkSummary {
  const scored = results.filter(isScored).sort((a, b) => a.percentile - b.percentile);
  const unscoredTestKeys = results.filter((r) => r.percentile === null).map((r) => r.testKey);

  // Only a result below the published normal range counts as a weak area. With
  // just two scored tests, blindly taking "the two weakest" would brand a
  // strong result a weakness and skew the program toward it.
  const weakest = scored.filter((r) => r.percentile < 25).slice(0, 2);
  const strongest = scored[scored.length - 1];

  const weakestNames = weakest.map((r) => TEST_LABELS[r.testKey].toLowerCase());
  const parts: string[] = [];

  if (scored.length === 0) {
    parts.push(
      "We've recorded your starting numbers. There aren't published comparisons for your age group on these tests, so we'll measure your progress against your own results when you re-test."
    );
  } else {
    if (strongest && strongest.percentile >= 50 && scored.length > 1) {
      parts.push(
        `${capitalize(TEST_LABELS[strongest.testKey].toLowerCase())} is ${plainLanguageForPercentile(strongest.percentile)}.`
      );
    }
    if (weakestNames.length === 0) {
      parts.push(
        "Everything we could compare came out within the usual range for your age, so we'll build steadily from here."
      );
    }
    if (weakestNames.length > 0) {
      // Phrased as a relative statement ("where you have the most room") rather
      // than reusing plainLanguageForPercentile: the two weakest are the weakest
      // by definition, so this stays accurate even when both score well.
      const plural = weakestNames.length > 1;
      parts.push(
        `${capitalize(weakestNames.join(" and "))} ${plural ? "are" : "is"} where you have the most room to improve right now — that's exactly what your first few weeks of training will focus on.`
      );
    }
    if (unscoredTestKeys.length > 0) {
      parts.push(
        "Your other results are recorded as a starting point, and we'll compare them to your own numbers when you re-test."
      );
    }
  }

  return {
    paragraph: parts.join(" "),
    weakestTestKeys: weakest.map((r) => r.testKey),
    unscoredTestKeys,
  };
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
