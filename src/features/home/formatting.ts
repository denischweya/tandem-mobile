import { toZonedParts, type ZonedParts } from '@tandem/shared';

// Every display string on the Home dashboard that depends on a point in time is produced
// here, through `toZonedParts` - never by hand-formatting a `Date` with its own (UTC, by
// default, on a server/CI box with no local zone set) idea of "now". This is also the
// constraint hard constraint #4 of the home-dashboard task: `toZonedParts` must do real work,
// proven by a verification step that greps the compiled bundle for the string
// "Africa/Nairobi" - the header date, the greeting, and the plan's schedule line all go
// through it.
//
// `toZonedParts` gives numeric wall-clock parts (year/month/day/hour/minute) but no weekday
// or month name, so those are looked up from the numeric parts below rather than re-running a
// second `Intl.DateTimeFormat` with `weekday`/`month` options - one formatter call per
// instant, not two.

const WEEKDAY_FULL = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;
const WEEKDAY_ABBR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
const MONTH_FULL = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;
const MONTH_ABBR = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

/** Day-of-week for a zoned date, 0 = Sunday. The parts are a wall-clock date with no timezone
 * of their own at this point, so this reads `getUTCDay()` off a UTC-anchored construction of
 * those same y/m/d numbers - deliberately not `new Date(y, m, d)`, which would reinterpret
 * them in whatever zone the host process happens to run in. */
function weekdayIndex(parts: Pick<ZonedParts, 'year' | 'month' | 'day'>): number {
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day)).getUTCDay();
}

// `noUncheckedIndexedAccess` is on, so indexing these fixed-length tuples with a computed
// `number` (rather than a literal) types as `T | undefined` even though `weekdayIndex` is
// provably 0-6 and `parts.month` is provably 1-12. These two lookups make that explicit and
// fall back defensively rather than letting "undefined" silently leak into rendered text.
function weekdayName(
  parts: Pick<ZonedParts, 'year' | 'month' | 'day'>,
  style: 'full' | 'abbr',
): string {
  const index = weekdayIndex(parts);
  return (style === 'full' ? WEEKDAY_FULL[index] : WEEKDAY_ABBR[index]) ?? '';
}

function monthName(month: number, style: 'full' | 'abbr'): string {
  return (style === 'full' ? MONTH_FULL[month - 1] : MONTH_ABBR[month - 1]) ?? '';
}

/** "Monday 5 October" - the header's date line. */
export function formatHeaderDate(instant: Date, timeZone: string): string {
  const parts = toZonedParts(instant, timeZone);
  return `${weekdayName(parts, 'full')} ${parts.day} ${monthName(parts.month, 'full')}`;
}

/** "Good morning" / "Good afternoon" / "Good evening", by the hour in the given zone. */
export function formatGreeting(instant: Date, timeZone: string): string {
  const { hour } = toZonedParts(instant, timeZone);
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

/** "Sat 10 Oct" - the compact date used on a plan's schedule line. */
export function formatPlanDate(instant: Date, timeZone: string): string {
  const parts = toZonedParts(instant, timeZone);
  return `${weekdayName(parts, 'abbr')} ${parts.day} ${monthName(parts.month, 'abbr')}`;
}

/** "7:00 PM" - 12-hour clock, no leading zero on the hour, matching the reference exactly. */
export function formatClockTime(instant: Date, timeZone: string): string {
  const { hour, minute } = toZonedParts(instant, timeZone);
  const period = hour < 12 ? 'AM' : 'PM';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${minute.toString().padStart(2, '0')} ${period}`;
}

/** "Sat 10 Oct · 7:00 PM · Westlands" - the full schedule line on `PlanCard`. */
export function formatScheduleLine(instant: Date, timeZone: string, location: string): string {
  return `${formatPlanDate(instant, timeZone)} · ${formatClockTime(instant, timeZone)} · ${location}`;
}

/**
 * "in 5 days" / "tomorrow" / "today" / "N days ago", counting whole calendar days between
 * `from` and `to` *in the given zone* - not a raw millisecond difference, which would give
 * the wrong day count for any pair of instants that straddle a timezone's own midnight
 * differently than UTC's.
 */
export function formatRelativeDays(from: Date, to: Date, timeZone: string): string {
  const fromParts = toZonedParts(from, timeZone);
  const toParts = toZonedParts(to, timeZone);
  const fromDay = Date.UTC(fromParts.year, fromParts.month - 1, fromParts.day);
  const toDay = Date.UTC(toParts.year, toParts.month - 1, toParts.day);
  const diffDays = Math.round((toDay - fromDay) / 86_400_000);

  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'tomorrow';
  if (diffDays === -1) return 'yesterday';
  if (diffDays > 1) return `in ${diffDays} days`;
  return `${Math.abs(diffDays)} days ago`;
}
