/**
 * Training days are grouped by the user's *local* calendar day, not the UTC day.
 * An ISO timestamp's first 10 characters are the UTC date, which rolls over
 * mid-evening in western timezones — an 6pm Monday session would be filed under
 * Tuesday and merge with Tuesday's, breaking streaks and rest-day spacing.
 */

export type DayKey = string; // "YYYY-MM-DD" in local time

const pad = (n: number) => String(n).padStart(2, "0");

export function localDayKey(value: string | number | Date): DayKey {
  const d = value instanceof Date ? value : new Date(value);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Local midnight for a day key, so day arithmetic is unaffected by time of day. */
export function startOfLocalDay(key: DayKey): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(key: DayKey, days: number): Date {
  const d = startOfLocalDay(key);
  d.setDate(d.getDate() + days);
  return d;
}

/** Whole calendar days from `from` to `to`; negative when `to` is earlier. */
export function daysBetween(from: DayKey, to: DayKey): number {
  const ms = startOfLocalDay(to).getTime() - startOfLocalDay(from).getTime();
  return Math.round(ms / (24 * 60 * 60 * 1000));
}
