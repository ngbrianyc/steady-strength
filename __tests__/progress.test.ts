import {
  computeStreak,
  countSessions,
  progressMessageForStreak,
  shouldPromptRebenchmark,
} from "@/lib/progress";
import type { Program, SessionLog } from "@/types/models";

const DAY_MS = 24 * 60 * 60 * 1000;

function logsForDay(daysAgo: number, count: number): SessionLog[] {
  const at = new Date(Date.now() - daysAgo * DAY_MS).toISOString();
  return Array.from({ length: count }, (_, i) => ({
    id: `log-${daysAgo}-${i}`,
    profileId: "p",
    programExerciseId: `pe-${i}`,
    performedAt: at,
    sets: [{ setIndex: 0, reps: 10, load: null }],
  }));
}

describe("countSessions", () => {
  it("counts one workout as one session even though each exercise logs a row", () => {
    expect(countSessions(logsForDay(0, 6))).toBe(1);
  });

  it("counts separate training days separately", () => {
    expect(countSessions([...logsForDay(0, 6), ...logsForDay(3, 6)])).toBe(2);
  });

  it("is zero with no logs", () => {
    expect(countSessions([])).toBe(0);
  });
});

describe("computeStreak", () => {
  it("does not inflate the streak by counting per-exercise rows", () => {
    // Regression: a single six-exercise workout previously read as a streak of 6.
    expect(computeStreak(logsForDay(0, 6))).toBe(1);
  });

  it("counts consecutive training days within the tolerance", () => {
    const logs = [...logsForDay(0, 6), ...logsForDay(3, 6), ...logsForDay(7, 6)];
    expect(computeStreak(logs)).toBe(3);
  });

  it("breaks the streak when a gap exceeds the tolerance", () => {
    const logs = [...logsForDay(0, 6), ...logsForDay(30, 6)];
    expect(computeStreak(logs)).toBe(1);
  });

  it("is zero with no logs", () => {
    expect(computeStreak([])).toBe(0);
  });
});

describe("progressMessageForStreak", () => {
  it("uses a neutral, non-guilting message after a long gap", () => {
    const logs = logsForDay(21, 6);
    const msg = progressMessageForStreak(computeStreak(logs), logs).toLowerCase();
    expect(msg).toContain("whenever you're ready");
    expect(msg).not.toMatch(/don't break|streak lost|you failed|missed|behind/);
  });

  it("is encouraging but plain for a first session", () => {
    expect(progressMessageForStreak(0, [])).toMatch(/great place to start/);
  });
});

describe("shouldPromptRebenchmark", () => {
  const program: Program = {
    id: "prog",
    profileId: "p",
    generatedAt: new Date(Date.now() - 9 * 7 * DAY_MS).toISOString(),
    active: true,
  };

  it("prompts after 8 weeks with no retest", () => {
    expect(shouldPromptRebenchmark(program, [])).toBe(true);
  });

  it("does not prompt before 8 weeks", () => {
    const fresh: Program = { ...program, generatedAt: new Date().toISOString() };
    expect(shouldPromptRebenchmark(fresh, [])).toBe(false);
  });

  it("stops prompting once a retest has happened since the due date", () => {
    const retest = [
      {
        id: "b",
        profileId: "p",
        testKey: "push_up" as const,
        rawValue: 5,
        percentile: 50,
        takenAt: new Date().toISOString(),
      },
    ];
    expect(shouldPromptRebenchmark(program, retest)).toBe(false);
  });
});
