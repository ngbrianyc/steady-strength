import {
  exercisesDoneToday,
  restDayMessage,
  resumeIndexFor,
  sessionAvailability,
  trainingDayKeys,
} from "@/lib/schedule";
import { localDayKey } from "@/lib/dates";
import type { SessionLog } from "@/types/models";

/** A log at a local wall-clock time, N days ago. */
function logAt(daysAgo: number, hour = 10, id = "x"): SessionLog {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, 0, 0, 0);
  return {
    id: `log-${daysAgo}-${hour}-${id}`,
    profileId: "p",
    programExerciseId: `pe-${id}`,
    performedAt: d.toISOString(),
    sets: [{ setIndex: 0, reps: 10, load: null }],
  };
}

describe("trainingDayKeys", () => {
  it("collapses a whole workout's per-exercise rows into one training day", () => {
    const logs = [logAt(0, 10, "a"), logAt(0, 10, "b"), logAt(0, 10, "c")];
    expect(trainingDayKeys(logs)).toHaveLength(1);
  });

  it("keeps an evening session and the next morning's as separate local days", () => {
    // Regression: grouping on the UTC date merged these in western timezones.
    const logs = [logAt(1, 18), logAt(0, 9)];
    expect(trainingDayKeys(logs)).toHaveLength(2);
  });

  it("returns the most recent day first", () => {
    const logs = [logAt(5), logAt(0), logAt(3)];
    expect(trainingDayKeys(logs)[0]).toBe(localDayKey(new Date()));
  });
});

describe("sessionAvailability", () => {
  it("is available when nothing has been logged yet", () => {
    expect(sessionAvailability([]).state).toBe("available");
  });

  it("reports completed_today after training today", () => {
    expect(sessionAvailability([logAt(0)]).state).toBe("completed_today");
  });

  it("is a rest day the day after training", () => {
    const result = sessionAvailability([logAt(1)]);
    expect(result.state).toBe("rest_day");
    if (result.state === "rest_day") {
      expect(result.daysUntilNext).toBe(1);
    }
  });

  it("is available again two days after training", () => {
    expect(sessionAvailability([logAt(2)]).state).toBe("available");
  });

  it("is available after a long layoff, with no penalty", () => {
    expect(sessionAvailability([logAt(45)]).state).toBe("available");
  });

  it("uses the most recent training day, not the oldest", () => {
    expect(sessionAvailability([logAt(10), logAt(1)]).state).toBe("rest_day");
  });

  it("does not cap how many sessions a motivated user can do in a week", () => {
    // Trained 6, 4 and 2 days ago — spacing respected, so today is open.
    expect(sessionAvailability([logAt(6), logAt(4), logAt(2)]).state).toBe("available");
  });

  it("points at the correct next session date", () => {
    const result = sessionAvailability([logAt(1)]);
    if (result.state !== "rest_day") throw new Error("expected rest day");
    const expected = new Date();
    expected.setDate(expected.getDate() + 1);
    expect(localDayKey(result.nextSessionAt)).toBe(localDayKey(expected));
  });
});

describe("resuming an interrupted session", () => {
  const ids = ["pe-0", "pe-1", "pe-2", "pe-3", "pe-4", "pe-5"];

  function logFor(programExerciseId: string, daysAgo = 0): SessionLog {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    d.setHours(10, 0, 0, 0);
    return {
      id: `log-${programExerciseId}-${daysAgo}`,
      profileId: "p",
      programExerciseId,
      performedAt: d.toISOString(),
      sets: [{ setIndex: 0, reps: 10, load: null }],
    };
  }

  it("starts at the first exercise when nothing is logged", () => {
    expect(resumeIndexFor(ids, [])).toBe(0);
  });

  it("resumes after the exercises already finished today", () => {
    const logs = [logFor("pe-0"), logFor("pe-1"), logFor("pe-2")];
    expect(resumeIndexFor(ids, logs)).toBe(3);
  });

  it("ignores exercises finished on earlier days", () => {
    // Regression: yesterday's completed session must not skip today's exercises.
    const logs = ids.map((id) => logFor(id, 1));
    expect(resumeIndexFor(ids, logs)).toBe(0);
  });

  it("reports -1 only when every exercise is finished today", () => {
    const logs = ids.map((id) => logFor(id, 0));
    expect(resumeIndexFor(ids, logs)).toBe(-1);
  });

  it("does not treat a part-finished session as a completed one", () => {
    // Regression: one log per exercise meant a single finished exercise read as
    // "trained today" and locked the user out of finishing the session.
    const logs = [logFor("pe-0")];
    expect(resumeIndexFor(ids, logs)).toBeGreaterThan(0);
    expect(resumeIndexFor(ids, logs)).not.toBe(-1);
  });

  it("tracks which exercise ids are done today", () => {
    const done = exercisesDoneToday([logFor("pe-0"), logFor("pe-3"), logFor("pe-1", 2)]);
    expect(done.has("pe-0")).toBe(true);
    expect(done.has("pe-3")).toBe(true);
    expect(done.has("pe-1")).toBe(false);
  });
});

describe("restDayMessage", () => {
  it("says tomorrow for a one-day wait", () => {
    expect(restDayMessage(1)).toBe("Your next session is tomorrow.");
  });

  it("is neutral and carries no guilt language", () => {
    for (const d of [1, 2, 3]) {
      expect(restDayMessage(d).toLowerCase()).not.toMatch(/don't|must|should|behind|miss/);
    }
  });
});
