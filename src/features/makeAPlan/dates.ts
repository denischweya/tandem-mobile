import { toZonedParts } from '@tandem/shared';
import { formatWeekdayAbbr } from '../home/formatting';
import type { QuickChoiceId } from './fixtures';

// Pure date-selection logic for screen 3c's "When?" step - which calendar days the 7-day
// strip shows, and which of them a quick-choice chip ("Tonight", "This weekend", ...)
// pre-selects. Kept separate from `./fixtures` (plain mock data) and `./ranking` (the 3d
// availability/scoring math) because this is its own concern: calendar-date arithmetic, not
// data or scoring.

/** Adds whole minutes to an instant. Not timezone-sensitive - adding minutes to a UTC instant
 * needs no wall-clock awareness, unlike *displaying* that instant (which does, via
 * `toZonedParts`/the formatters in `../home/formatting`). */
export function addMinutes(instant: Date, minutes: number): Date {
  return new Date(instant.getTime() + minutes * 60_000);
}

export interface WeekStripDay {
  id: string;
  date: Date;
  weekdayAbbr: string;
  dayOfMonth: number;
}

/**
 * The Monday-start week containing `referenceNow`, as 7 day entries - the reference's screen
 * 3c day strip. Each day is anchored at 12:00 UTC (not midnight) specifically so that reading
 * it back through `timeZone` can't roll it onto the adjacent calendar date: midnight UTC is
 * already the *previous* evening in any zone west of Greenwich, which would make, say,
 * Monday's cell quietly read back as "Sun" for a US timezone. A mid-day anchor has room on
 * both sides for any realistic UTC offset (-12 to +14).
 */
export function getWeekStripDays(referenceNow: Date, timeZone: string): WeekStripDay[] {
  const parts = toZonedParts(referenceNow, timeZone);
  const anchor = Date.UTC(parts.year, parts.month - 1, parts.day, 12, 0, 0);
  // 0 (Sun) - 6 (Sat) -> days since the most recent Monday (Monday itself -> 0).
  const weekday = new Date(anchor).getUTCDay();
  const daysSinceMonday = (weekday + 6) % 7;
  const monday = anchor - daysSinceMonday * 86_400_000;

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday + index * 86_400_000);
    return {
      id: date.toISOString(),
      date,
      weekdayAbbr: formatWeekdayAbbr(date, timeZone),
      dayOfMonth: toZonedParts(date, timeZone).day,
    };
  });
}

/**
 * Which day-of-month numbers a quick-choice preset selects, within whatever week
 * `getWeekStripDays` is currently showing. `pickDates` has no entry here - selecting it is
 * handled by the screen as "leave today's manual selection alone", not as a preset that
 * computes a set of days (see the make-a-plan report's ambiguity section).
 *
 * `nextWeek` returns an empty set: the day strip only ever shows a single Monday-start week
 * (`referenceNow`'s), and "next week" has no days in that week to highlight. A real
 * implementation would page the strip itself forward; this mock keeps the strip fixed and
 * flags the gap rather than silently highlighting the wrong days.
 */
export function datesForQuickChoice(
  choice: Exclude<QuickChoiceId, 'pickDates'>,
  referenceNow: Date,
  timeZone: string,
): Set<number> {
  const days = getWeekStripDays(referenceNow, timeZone);
  const todayParts = toZonedParts(referenceNow, timeZone);

  switch (choice) {
    case 'tonight':
      return new Set([todayParts.day]);
    case 'tomorrow': {
      // "Tomorrow" only has a day to highlight when it falls inside the same Monday-start
      // week the strip shows - i.e. referenceNow isn't a Sunday. (The fixture's referenceNow
      // is a Monday, so this is exercised; a Sunday "today" is the one case this mock strip
      // can't represent, same limitation as `nextWeek` below.)
      const todayIndex = days.findIndex((day) => day.dayOfMonth === todayParts.day);
      const tomorrow = todayIndex >= 0 && todayIndex < 6 ? days[todayIndex + 1] : undefined;
      return new Set(tomorrow ? [tomorrow.dayOfMonth] : []);
    }
    case 'thisWeekend': {
      // Fri/Sat/Sun - matches the reference's highlighted trio exactly (indices 4-6 of a
      // Monday-start week).
      return new Set(days.slice(4, 7).map((day) => day.dayOfMonth));
    }
    case 'nextWeek':
      return new Set();
  }
}
