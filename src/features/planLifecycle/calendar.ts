import type { CalendarChoiceId, CalendarOption, CalendarSyncEntry } from './fixtures';

// Pure calendar logic shared by screen 3f (which calendar to pre-select) and screen 3g (sync
// status + the fixable-failure retry). Kept separate from `./fixtures` (plain mock data) for
// the same reason `ranking.ts` is separate from `makeAPlan/fixtures.ts`: this is scoring/state
// logic, not data.

/**
 * The calendar option screen 3f pre-selects: the one flagged `lastUsed`, falling back to the
 * first option if none is flagged, so a caller always gets a valid id back rather than
 * `undefined`.
 */
export function defaultCalendarChoice(options: CalendarOption[]): CalendarChoiceId {
  const lastUsed = options.find((option) => option.lastUsed);
  return (lastUsed ?? options[0])?.id ?? 'none';
}

/** How many of a plan's calendar syncs are in a failed, fixable state (hard constraint #4) -
 * screen 3g's "one failure the user can act on". */
export function countFailedSyncs(entries: CalendarSyncEntry[]): number {
  return entries.filter((entry) => entry.status === 'failed').length;
}

/**
 * Simulates a successful retry: flips the matching entry back to `synced` and clears its
 * failure reason, leaving every other entry untouched. Never mutates `entries` - there is no
 * real calendar-sync backend in this slice to call (same "mocked, not invented" situation as
 * everywhere else), so this stands in for "the retry worked".
 */
export function retryCalendarSync(
  entries: CalendarSyncEntry[],
  id: CalendarChoiceId,
): CalendarSyncEntry[] {
  return entries.map((entry) =>
    entry.id === id ? { ...entry, status: 'synced' as const, failureReason: undefined } : entry,
  );
}
