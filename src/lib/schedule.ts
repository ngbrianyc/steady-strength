import type { SessionLog } from "@/types/models";
import { addDays, daysBetween, localDayKey, type DayKey } from "@/lib/dates";

/**
 * Full-body resistance work needs recovery between sessions, so the program
 * puts at least one full rest day between training days (train Monday -> next
 * session Wednesday). That spacing, not a weekly quota, is the rule that
 * matters physiologically.
 *
 * Deliberately no cap on sessions per week: for a sedentary beginner the real
 * risk is doing too little, and blocking a motivated user would cost more than
 * the occasional extra session. Rest days are guidance the user can override,
 * consistent with the readiness screen being a soft gate rather than a block.
 */
export const MIN_DAYS_BETWEEN_SESSIONS = 2;

export type SessionAvailability =
  | { state: "available" }
  | { state: "completed_today" }
  | { state: "rest_day"; nextSessionAt: Date; daysUntilNext: number };

export function trainingDayKeys(sessionLogs: SessionLog[]): DayKey[] {
  const keys = new Set(sessionLogs.map((l) => localDayKey(l.performedAt)));
  return [...keys].sort((a, b) => (a < b ? 1 : a > b ? -1 : 0)); // most recent first
}

export function sessionAvailability(
  sessionLogs: SessionLog[],
  now: Date = new Date()
): SessionAvailability {
  const days = trainingDayKeys(sessionLogs);
  if (days.length === 0) return { state: "available" };

  const today = localDayKey(now);
  const lastTrained = days[0];
  const elapsed = daysBetween(lastTrained, today);

  if (elapsed <= 0) return { state: "completed_today" };

  if (elapsed < MIN_DAYS_BETWEEN_SESSIONS) {
    return {
      state: "rest_day",
      nextSessionAt: addDays(lastTrained, MIN_DAYS_BETWEEN_SESSIONS),
      daysUntilNext: MIN_DAYS_BETWEEN_SESSIONS - elapsed,
    };
  }

  return { state: "available" };
}

export function restDayMessage(daysUntilNext: number): string {
  if (daysUntilNext <= 1) return "Your next session is tomorrow.";
  return `Your next session is in ${daysUntilNext} days.`;
}
