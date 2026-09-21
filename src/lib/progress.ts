import type { Program, BenchmarkResult, SessionLog } from "@/types/models";
import { startOfLocalDay } from "@/lib/dates";
import { trainingDayKeys } from "@/lib/schedule";

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;
const REBENCHMARK_WEEKS = 8;
const STREAK_GAP_TOLERANCE_DAYS = 10; // a session up to ~1.5 weeks late still continues the streak

/**
 * A workout produces one session_log row *per exercise*, so streaks and counts
 * are derived from distinct training days rather than row counts — otherwise a
 * single six-exercise workout would read as a six-session streak.
 */
function trainingDaysDescending(sessionLogs: SessionLog[]): number[] {
  return trainingDayKeys(sessionLogs)
    .map((k) => startOfLocalDay(k).getTime())
    .sort((a, b) => b - a);
}

export function countSessions(sessionLogs: SessionLog[]): number {
  return trainingDaysDescending(sessionLogs).length;
}

/**
 * Consecutive most-recent training days without a gap larger than the tolerance.
 * Deliberately forgiving: a missed week breaks the streak quietly rather than
 * punishing a single late session, and there is no "streak lost!" messaging —
 * see progressMessageForStreak below.
 */
export function computeStreak(sessionLogs: SessionLog[]): number {
  const days = trainingDaysDescending(sessionLogs);
  if (days.length === 0) return 0;

  let streak = 1;
  for (let i = 0; i < days.length - 1; i++) {
    const gapDays = (days[i] - days[i + 1]) / DAY_MS;
    if (gapDays <= STREAK_GAP_TOLERANCE_DAYS) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export function progressMessageForStreak(streak: number, sessionLogs: SessionLog[]): string {
  if (sessionLogs.length === 0) return "Your first session is a great place to start.";
  const mostRecent = [...sessionLogs].sort(
    (a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime()
  )[0];
  const daysSinceLast = (Date.now() - new Date(mostRecent.performedAt).getTime()) / DAY_MS;

  if (daysSinceLast > STREAK_GAP_TOLERANCE_DAYS) {
    return "It's been a little while — whenever you're ready, your next session is right here.";
  }
  if (streak >= 2) return `${streak} sessions in a row. Steady progress.`;
  return "Nice work getting a session in.";
}

export function weeksSinceProgramStart(program: Program, now: number = Date.now()): number {
  const start = new Date(program.generatedAt).getTime();
  return (now - start) / WEEK_MS;
}

export function shouldPromptRebenchmark(
  program: Program,
  benchmarkResults: BenchmarkResult[],
  now: number = Date.now()
): boolean {
  if (weeksSinceProgramStart(program, now) < REBENCHMARK_WEEKS) return false;
  const rebenchmarkDueAt = new Date(program.generatedAt).getTime() + REBENCHMARK_WEEKS * WEEK_MS;
  const hasRetestedSince = benchmarkResults.some(
    (r) => new Date(r.takenAt).getTime() >= rebenchmarkDueAt
  );
  return !hasRetestedSince;
}
