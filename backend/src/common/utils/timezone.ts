/**
 * Vietnam is a single fixed UTC+7 offset year-round — no DST, ever. That means all conversion
 * here can be plain integer arithmetic instead of a timezone database lookup: correct today,
 * correct in 50 years, and correct regardless of the host machine's `TZ` or Postgres session
 * timezone, since neither is ever consulted.
 */
export const APP_TIMEZONE = 'Asia/Ho_Chi_Minh';
export const VN_UTC_OFFSET_MINUTES = 7 * 60;

const DATE_ONLY_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Minutes since local midnight, e.g. "09:30" -> 570. */
export function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function minutesToTimeString(minutes: number): string {
  const h = Math.floor(minutes / 60)
    .toString()
    .padStart(2, '0');
  const m = (minutes % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

/** Combines a "YYYY-MM-DD" local calendar date with local minutes-since-midnight into the
 * correct UTC instant, without ever touching the host's timezone. */
export function localWallClockToUtc(dateStr: string, minutesSinceMidnight: number): Date {
  const match = DATE_ONLY_RE.exec(dateStr);
  if (!match) throw new Error(`Invalid date "${dateStr}", expected YYYY-MM-DD`);
  const [, year, month, day] = match;
  // Date.UTC treats its inputs as already being UTC wall-clock fields — since VN is UTC+7, a
  // local wall-clock time is always `offset` minutes AHEAD of the UTC instant it names.
  const utcMillis =
    Date.UTC(Number(year), Number(month) - 1, Number(day), 0, minutesSinceMidnight, 0, 0) -
    VN_UTC_OFFSET_MINUTES * 60 * 1000;
  return new Date(utcMillis);
}

/** [startOfDayUtc, endOfDayUtc) for a given local calendar date — the UTC instant range that
 * covers the entire local day, used to bound DB range queries. */
export function localDayRangeUtc(dateStr: string): { startUtc: Date; endUtc: Date } {
  return {
    startUtc: localWallClockToUtc(dateStr, 0),
    endUtc: localWallClockToUtc(dateStr, 24 * 60),
  };
}

/** Day of week for a local calendar date, 0=Sunday..6=Saturday — matches JS `Date#getDay()`
 * convention, computed without ever constructing a Date in the host's local timezone. */
export function localDayOfWeek(dateStr: string): number {
  const match = DATE_ONLY_RE.exec(dateStr);
  if (!match) throw new Error(`Invalid date "${dateStr}", expected YYYY-MM-DD`);
  const [, year, month, day] = match;
  return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day))).getUTCDay();
}

/** Renders a UTC instant as local "YYYY-MM-DD" — the inverse direction, used for grouping
 * (e.g. reports "by Vietnam day", not by UTC day) without relying on host/session timezone. */
export function utcToLocalDateString(date: Date): string {
  const localMillis = date.getTime() + VN_UTC_OFFSET_MINUTES * 60 * 1000;
  const local = new Date(localMillis);
  const year = local.getUTCFullYear();
  const month = (local.getUTCMonth() + 1).toString().padStart(2, '0');
  const day = local.getUTCDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}
