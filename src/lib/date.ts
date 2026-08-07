// Helpers for date-only values (e.g. <input type="date">).
//
// `new Date("YYYY-MM-DD")` is parsed by JS as UTC midnight, not local midnight —
// in UTC+7 that silently shifts the intended local calendar date/time backward by
// 7 hours (can even roll it back a day when formatted, or make a same-day expiry
// look already-past). Always build/read these via local Y/M/D components instead.

/** Format a Date (or ISO string) as "YYYY-MM-DD" using local calendar components. */
export function toDateInputValue(value: string | Date): string {
  const d = typeof value === "string" ? new Date(value) : value;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Parse a "YYYY-MM-DD" input value as local midnight (not UTC midnight). */
export function dateInputToLocalDate(value: string): Date {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

/** Parse a "YYYY-MM-DD" input value into an ISO string at local midnight. */
export function dateInputToIso(value: string): string {
  return dateInputToLocalDate(value).toISOString();
}

/** ISO string for the end of the local day (23:59:59.999) of a "YYYY-MM-DD" input value — use when a manually-picked date should stay usable through that whole day, and as an inclusive-enough upper bound for range filters covering that day. */
export function dateInputToEndOfDayIso(value: string): string {
  const d = dateInputToLocalDate(value);
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
}

/**
 * Expiry timestamp for a package granted "now", `validityDays` days from now —
 * floored at the end of today. Plain `now + validityDays*24h` breaks for
 * validityDays = 0 (same-day passes): it computes to essentially "now", so by
 * the time the request reaches the server, `expires_at <= server's now()` is
 * already true and the grant is rejected as expired on arrival. Same-day
 * passes are supposed to last through the rest of the day they're granted,
 * so floor at end-of-today instead of a razor-thin "now".
 */
export function expiryFromNow(validityDays: number): Date {
  const plusDays = new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000);
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);
  return plusDays > endOfToday ? plusDays : endOfToday;
}
