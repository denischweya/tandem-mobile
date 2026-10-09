import type { CalendarOption, CalendarSyncEntry } from './fixtures';
import { countFailedSyncs, defaultCalendarChoice, retryCalendarSync } from './calendar';

const OPTIONS: CalendarOption[] = [
  { id: 'personal', label: 'Personal', subtitle: 'Google Calendar', lastUsed: true },
  { id: 'work', label: 'Work', subtitle: 'Google Calendar' },
  { id: 'family', label: 'Family', subtitle: 'Apple Calendar, on this iPhone' },
  { id: 'none', label: "Don't add", subtitle: '' },
];

describe('defaultCalendarChoice', () => {
  it('picks the option flagged lastUsed', () => {
    expect(defaultCalendarChoice(OPTIONS)).toBe('personal');
  });

  it('falls back to the first option when none is flagged', () => {
    const noFlags = OPTIONS.map((option) => ({ ...option, lastUsed: undefined }));
    expect(defaultCalendarChoice(noFlags)).toBe('personal');
  });

  it('falls back to "none" for an empty option list', () => {
    expect(defaultCalendarChoice([])).toBe('none');
  });
});

const SYNC_ENTRIES: CalendarSyncEntry[] = [
  { id: 'personal', calendarLabel: 'Personal', provider: 'Google', status: 'synced' },
  {
    id: 'work',
    calendarLabel: 'Work',
    provider: 'Google',
    status: 'failed',
    failureReason: 'Google needs you to sign in again',
  },
];

describe('countFailedSyncs', () => {
  it('counts exactly the failed entries (hard constraint #4: "one failure the user can act on")', () => {
    expect(countFailedSyncs(SYNC_ENTRIES)).toBe(1);
  });

  it('is zero when every entry is synced', () => {
    const allSynced = SYNC_ENTRIES.map((entry) => ({ ...entry, status: 'synced' as const }));
    expect(countFailedSyncs(allSynced)).toBe(0);
  });
});

describe('retryCalendarSync', () => {
  it('flips the matching failed entry back to synced and clears its failure reason', () => {
    const next = retryCalendarSync(SYNC_ENTRIES, 'work');
    expect(next.find((entry) => entry.id === 'work')).toEqual({
      id: 'work',
      calendarLabel: 'Work',
      provider: 'Google',
      status: 'synced',
    });
  });

  it('leaves every other entry untouched', () => {
    const next = retryCalendarSync(SYNC_ENTRIES, 'work');
    expect(next.find((entry) => entry.id === 'personal')).toEqual(SYNC_ENTRIES[0]);
  });

  it('is a no-op when the id does not match any entry', () => {
    expect(retryCalendarSync(SYNC_ENTRIES, 'family')).toEqual(SYNC_ENTRIES);
  });

  it('does not mutate the input array', () => {
    const before = SYNC_ENTRIES.map((entry) => ({ ...entry }));
    retryCalendarSync(SYNC_ENTRIES, 'work');
    expect(SYNC_ENTRIES).toEqual(before);
  });
});
