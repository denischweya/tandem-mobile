import { formatDateTimeComma } from '../home/formatting';
import type { ReminderOffsetId, ReminderOption } from './fixtures';

// Pure reminder logic for screens 3f (pick reminders) and 3g (display them). The actual
// `toZonedParts` work lives in `src/features/home/formatting.ts` (the hard constraint: that
// file is the only place date/time text is produced) - this module only does plain
// millisecond arithmetic (`computeReminderInstant`, mirroring `makeAPlan/dates.ts`'s
// `addMinutes` with a negative offset) and composes already-formatted strings.

/**
 * Adds/removes `id` from `selected`, immutably - the reminder chip row's multi-select toggle
 * (unlike every other chip row in this app so far, more than one reminder can be "on" at
 * once).
 */
export function toggleReminder(
  selected: ReminderOffsetId[],
  id: ReminderOffsetId,
): ReminderOffsetId[] {
  return selected.includes(id) ? selected.filter((existing) => existing !== id) : [...selected, id];
}

/** The instant a reminder should fire: `minutesBefore` subtracted from the event's start.
 * Plain millisecond arithmetic, not timezone-sensitive - same as `makeAPlan/dates.ts`'s
 * `addMinutes`. */
export function computeReminderInstant(eventStart: Date, minutesBefore: number): Date {
  return new Date(eventStart.getTime() - minutesBefore * 60_000);
}

/**
 * "Fri 9 Oct, 7:00 PM · 1 day before" - screen 3g's reminder line, built from the event's own
 * start time and the chosen `ReminderOption` rather than hand-typed, so it can never drift
 * from whichever reminder is actually selected.
 */
export function formatReminderLine(
  eventStart: Date,
  timeZone: string,
  option: ReminderOption,
): string {
  const instant = computeReminderInstant(eventStart, option.minutesBefore);
  return `${formatDateTimeComma(instant, timeZone)} · ${option.label} before`;
}
