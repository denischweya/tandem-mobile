import type { Calendar, ConnectedCalendarAccount } from './fixtures';
import {
  calendarsForAccount,
  connectProvider,
  describePermissionToggle,
  isCalendarInactive,
  reauthenticateAccount,
  toggleCalendarPermission,
} from './permissions';

const CALENDARS: Calendar[] = [
  {
    id: 'cal-personal',
    accountId: 'google-1',
    name: 'Personal',
    permissions: { busy: true, add: true },
  },
  { id: 'cal-work', accountId: 'google-1', name: 'Work', permissions: { busy: true, add: false } },
  {
    id: 'cal-birthdays',
    accountId: 'google-1',
    name: 'Birthdays',
    permissions: { busy: false, add: false },
  },
  {
    id: 'cal-family',
    accountId: 'apple-1',
    name: 'Family',
    permissions: { busy: true, add: true },
  },
];

const ACCOUNTS: ConnectedCalendarAccount[] = [
  { id: 'google-1', provider: 'google', providerLabel: 'Google', identifier: 'denis@gmail.com' },
  {
    id: 'microsoft-1',
    provider: 'microsoft',
    providerLabel: 'Microsoft',
    identifier: 'denis@outlook.com',
    needsReauth: true,
  },
];

describe('toggleCalendarPermission', () => {
  it('flips only the named permission, leaving its sibling untouched', () => {
    const next = toggleCalendarPermission(CALENDARS, 'cal-personal', 'busy');
    const personal = next.find((c) => c.id === 'cal-personal');
    expect(personal?.permissions.busy).toBe(false); // flipped
    expect(personal?.permissions.add).toBe(true); // untouched - the central invariant
  });

  it('flips "add" without touching "busy" on the same calendar', () => {
    const next = toggleCalendarPermission(CALENDARS, 'cal-work', 'add');
    const work = next.find((c) => c.id === 'cal-work');
    expect(work?.permissions.add).toBe(true); // flipped
    expect(work?.permissions.busy).toBe(true); // untouched
  });

  it('never changes a calendar other than the one named', () => {
    const next = toggleCalendarPermission(CALENDARS, 'cal-personal', 'busy');
    const untouched = next.filter((c) => c.id !== 'cal-personal');
    expect(untouched).toEqual(CALENDARS.filter((c) => c.id !== 'cal-personal'));
  });

  it('does not mutate the input array', () => {
    const before = CALENDARS.map((c) => ({ ...c, permissions: { ...c.permissions } }));
    toggleCalendarPermission(CALENDARS, 'cal-personal', 'busy');
    expect(CALENDARS).toEqual(before);
  });

  it('is reversible: toggling the same permission twice returns to the original value', () => {
    const once = toggleCalendarPermission(CALENDARS, 'cal-birthdays', 'busy');
    const twice = toggleCalendarPermission(once, 'cal-birthdays', 'busy');
    expect(twice.find((c) => c.id === 'cal-birthdays')?.permissions).toEqual(
      CALENDARS.find((c) => c.id === 'cal-birthdays')?.permissions,
    );
  });
});

describe('describePermissionToggle', () => {
  it('names the calendar, the permission and the new state for "busy"', () => {
    expect(describePermissionToggle('Personal', 'busy', true)).toBe(
      'Show when busy on Personal, on',
    );
    expect(describePermissionToggle('Personal', 'busy', false)).toBe(
      'Show when busy on Personal, off',
    );
  });

  it('names the calendar, the permission and the new state for "add"', () => {
    expect(describePermissionToggle('Work', 'add', true)).toBe('Add plan events on Work, on');
  });
});

describe('calendarsForAccount', () => {
  it('returns only the calendars belonging to the given account, in order', () => {
    expect(calendarsForAccount(CALENDARS, 'google-1').map((c) => c.id)).toEqual([
      'cal-personal',
      'cal-work',
      'cal-birthdays',
    ]);
  });

  it('returns an empty list for an account with no calendars', () => {
    expect(calendarsForAccount(CALENDARS, 'microsoft-1')).toEqual([]);
  });
});

describe('isCalendarInactive', () => {
  it('is true only when both permissions are off', () => {
    expect(
      isCalendarInactive({
        id: 'x',
        accountId: 'a',
        name: 'X',
        permissions: { busy: false, add: false },
      }),
    ).toBe(true);
  });

  it('is false when either permission is on', () => {
    expect(
      isCalendarInactive({
        id: 'x',
        accountId: 'a',
        name: 'X',
        permissions: { busy: true, add: false },
      }),
    ).toBe(false);
    expect(
      isCalendarInactive({
        id: 'x',
        accountId: 'a',
        name: 'X',
        permissions: { busy: false, add: true },
      }),
    ).toBe(false);
  });
});

describe('connectProvider', () => {
  it('adds a new account and calendar for a provider not yet connected', () => {
    const { accounts, calendars } = connectProvider(ACCOUNTS, CALENDARS, 'apple');
    expect(accounts).toHaveLength(ACCOUNTS.length + 1);
    expect(calendars).toHaveLength(CALENDARS.length + 1);
    const appleAccount = accounts.find((a) => a.provider === 'apple');
    expect(appleAccount).toBeDefined();
    // Looked up by the exact id `connectProvider` mints, not just "any calendar on this
    // account" - the fixture's own `cal-family` already uses `accountId: 'apple-1'`, so a
    // looser lookup could pass by accidentally matching pre-existing data instead of the
    // calendar this call actually created.
    const appleCalendar = calendars.find((c) => c.id === `${appleAccount?.id}-personal`);
    expect(appleCalendar?.permissions).toEqual({ busy: true, add: false }); // read on, write ask-every-time
  });

  it('is idempotent: connecting an already-connected provider changes nothing', () => {
    const result = connectProvider(ACCOUNTS, CALENDARS, 'google');
    expect(result.accounts).toBe(ACCOUNTS); // same reference - genuinely untouched
    expect(result.calendars).toBe(CALENDARS);
  });

  it('never grants the write permission by default - only read (free/busy)', () => {
    const { accounts, calendars } = connectProvider([], [], 'google');
    const account = accounts[0];
    const calendar = calendars.find((c) => c.accountId === account?.id);
    expect(calendar?.permissions.add).toBe(false);
    expect(calendar?.permissions.busy).toBe(true);
  });
});

describe('reauthenticateAccount', () => {
  it('clears needsReauth for the named account only', () => {
    const next = reauthenticateAccount(ACCOUNTS, 'microsoft-1');
    expect(next.find((a) => a.id === 'microsoft-1')?.needsReauth).toBe(false);
    expect(next.find((a) => a.id === 'google-1')).toEqual(
      ACCOUNTS.find((a) => a.id === 'google-1'),
    );
  });

  it('does not mutate the input array', () => {
    const before = ACCOUNTS.map((a) => ({ ...a }));
    reauthenticateAccount(ACCOUNTS, 'microsoft-1');
    expect(ACCOUNTS).toEqual(before);
  });
});
