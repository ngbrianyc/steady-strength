import {
  findNorm,
  percentileFor,
  plainLanguageForPercentile,
  scoreBenchmark,
  summarizeBenchmark,
} from "@/lib/scoring";
import normsData from "@/data/norms.json";
import type { BenchmarkResult, Norm, TestKey } from "@/types/models";

const NORMS = normsData as Norm[];

function result(testKey: TestKey, percentile: number | null, rawValue = 0): BenchmarkResult {
  return { id: testKey, profileId: "p", testKey, rawValue, percentile, takenAt: "" };
}

describe("norm data integrity", () => {
  it("only contains tests that have published norms", () => {
    const scoredTests = new Set(NORMS.map((n) => n.testKey));
    expect([...scoredTests].sort()).toEqual(["sit_and_reach", "sit_to_stand"]);
  });

  it("has no rows below age 60, which the Senior Fitness Test does not cover", () => {
    expect(NORMS.every((n) => n.ageMin >= 60)).toBe(true);
  });

  it("covers both sexes across the published brackets", () => {
    for (const testKey of ["sit_to_stand", "sit_and_reach"] as const) {
      for (const sex of ["female", "male"] as const) {
        const rows = NORMS.filter((n) => n.testKey === testKey && n.sex === sex);
        expect(rows.length).toBe(7); // 60-64 through 90-94
      }
    }
  });

  it("uses the three published bands and leaves no gaps within a row", () => {
    for (const norm of NORMS) {
      expect(norm.percentileBands).toHaveLength(3);
      const sorted = [...norm.percentileBands].sort((a, b) => a.minValue - b.minValue);
      for (const band of sorted) {
        expect(band.minValue).toBeLessThanOrEqual(band.maxValue);
      }
      for (let i = 0; i < sorted.length - 1; i++) {
        // Bands must not overlap, or a value could match the wrong one first.
        expect(sorted[i].maxValue).toBeLessThan(sorted[i + 1].minValue);
      }
    }
  });
});

describe("findNorm", () => {
  it("finds the bracket matching test, sex and age", () => {
    const norm = findNorm("sit_to_stand", "female", 62);
    expect(norm?.ageMin).toBe(60);
    expect(norm?.ageMax).toBe(64);
  });

  it("returns undefined under 60, since no published norm applies", () => {
    expect(findNorm("sit_to_stand", "female", 57)).toBeUndefined();
  });

  it("returns undefined for tests with no validated norms", () => {
    expect(findNorm("timed_carry", "female", 67)).toBeUndefined();
    expect(findNorm("push_up", "female", 67)).toBeUndefined();
    expect(findNorm("single_leg_balance", "female", 67)).toBeUndefined();
  });
});

describe("percentileFor", () => {
  it("places a value inside the published normal range at the middle band", () => {
    const norm = findNorm("sit_to_stand", "female", 62)!; // normal range 12-17
    expect(percentileFor(norm, 14)).toBe(50);
  });

  it("places a value below the normal range in the lowest band", () => {
    const norm = findNorm("sit_to_stand", "female", 62)!;
    expect(percentileFor(norm, 8)).toBe(12);
  });

  it("places a value above the normal range in the top band", () => {
    const norm = findNorm("sit_to_stand", "female", 62)!;
    expect(percentileFor(norm, 22)).toBe(88);
  });

  it("handles negative sit-and-reach values, where short of the toes is negative", () => {
    const norm = findNorm("sit_and_reach", "female", 62)!; // normal range -0.5 to 5.0 in
    expect(percentileFor(norm, 2)).toBe(50);
    expect(percentileFor(norm, -4)).toBe(12);
    expect(percentileFor(norm, 8)).toBe(88);
  });
});

describe("scoreBenchmark", () => {
  it("scores a covered test for a covered age", () => {
    expect(scoreBenchmark("sit_to_stand", "female", 67, 13)).toEqual({ percentile: 50 });
  });

  it("returns null under 60 rather than stretching the nearest bracket", () => {
    expect(scoreBenchmark("sit_to_stand", "female", 56, 13)).toBeNull();
  });

  it("returns null for tests with no validated norms", () => {
    expect(scoreBenchmark("timed_carry", "female", 67, 16)).toBeNull();
  });
});

describe("plainLanguageForPercentile", () => {
  it("never uses the phrase 'below average'", () => {
    for (let p = 0; p <= 100; p += 5) {
      expect(plainLanguageForPercentile(p).toLowerCase()).not.toContain("below average");
    }
  });

  it("frames low scores as room to improve", () => {
    expect(plainLanguageForPercentile(12)).toMatch(/room to improve/);
  });
});

describe("summarizeBenchmark", () => {
  it("ranks weakest areas using only tests that were actually scored", () => {
    const summary = summarizeBenchmark([
      result("sit_to_stand", 12),
      result("sit_and_reach", 88),
      result("timed_carry", null, 16),
      result("push_up", null, 1),
      result("single_leg_balance", null, 2),
    ]);
    // sit_and_reach scored above the normal range, so it is not a weak area.
    expect(summary.weakestTestKeys).toEqual(["sit_to_stand"]);
    expect(summary.unscoredTestKeys.sort()).toEqual([
      "push_up",
      "single_leg_balance",
      "timed_carry",
    ]);
  });

  it("never claims an unscored test is a weak area", () => {
    const summary = summarizeBenchmark([
      result("sit_to_stand", 88),
      result("timed_carry", null, 40),
    ]);
    expect(summary.weakestTestKeys).not.toContain("timed_carry");
  });

  it("tells an under-60 user their results are tracked against themselves", () => {
    const summary = summarizeBenchmark([
      result("sit_to_stand", null, 13),
      result("sit_and_reach", null, 2),
    ]);
    expect(summary.weakestTestKeys).toEqual([]);
    expect(summary.paragraph).toMatch(/your own results/);
    expect(summary.paragraph.toLowerCase()).not.toContain("below average");
  });

  it("mentions that unscored results are kept as a starting point", () => {
    const summary = summarizeBenchmark([
      result("sit_to_stand", 50),
      result("sit_and_reach", 12),
      result("timed_carry", null, 16),
    ]);
    expect(summary.paragraph).toMatch(/starting point/);
  });

  it("uses plural agreement for two weakest areas", () => {
    const summary = summarizeBenchmark([
      result("sit_to_stand", 12),
      result("sit_and_reach", 12),
    ]);
    expect(summary.paragraph).toContain("are where you have the most room to improve");
  });

  it("flags no weak areas when everything scored within the normal range", () => {
    const summary = summarizeBenchmark([
      result("sit_to_stand", 50),
      result("sit_and_reach", 88),
    ]);
    expect(summary.weakestTestKeys).toEqual([]);
    expect(summary.paragraph).toMatch(/within the usual range/);
    expect(summary.paragraph.toLowerCase()).not.toContain("below average");
  });
});
