import type { Calendar, CalendarProvider, ConnectedCalendarAccount } from './fixtures';

// Pure calendar-permission logic for screens 3h (connect) and 3i (settings). Kept framework-
// free so the product's central privacy/permission invariants are testable without rendering
// anything - the same split `ranking.ts`, `voting.ts` and `calendar.ts` already use elsewhere
// in this app.
//
// The one rule every function here protects: reading free/busy ("busy") and writing events
// ("add") are two separate permissions per calendar (blueprint §27 / §28). Nothing in this
// module ever reads one field to decide the other, and `toggleCalendarPermission` only ever
// writes the single field its caller named.

export type CalendarPermissionKind = 'busy' | 'add';

/**
 * Flips exactly one permission (`busy` or `add`) on exactly one calendar, immutably - the
 * independence this whole screen exists to prove. Every other calendar, and the untouched
 * permission on this one, come back bit-for-bit identical to what was passed in.
 */
export function toggleCalendarPermission(
  calendars: Calendar[],
  calendarId: string,
  kind: CalendarPermissionKind,
): Calendar[] {
  return calendars.map((calendar) =>
    calendar.id === calendarId
      ? {
          ...calendar,
          permissions: { ...calendar.permissions, [kind]: !calendar.permissions[kind] },
        }
      : calendar,
  );
}

/** A screen-reader label that always names the calendar, the permission, and its new state -
 * never colour alone (blueprint §136, hard constraint #4). Used as every `Switch`'s
 * `accessibilityLabel` on screen 3i, and unit-tested here on its own so the wording for "on"
 * vs "off" can never silently drift from what `Switch`'s own `accessibilityState` reports. */
export function describePermissionToggle(
  calendarName: string,
  kind: CalendarPermissionKind,
  value: boolean,
): string {
  const action = kind === 'busy' ? 'Show when busy' : 'Add plan events';
  return `${action} on ${calendarName}, ${value ? 'on' : 'off'}`;
}

/** All calendars belonging to one connected account, in fixture order. */
export function calendarsForAccount(calendars: Calendar[], accountId: string): Calendar[] {
  return calendars.filter((calendar) => calendar.accountId === accountId);
}

/** A calendar with neither permission on is rendered muted on screen 3i (the reference's grey
 * "Birthdays" row) - derived from its actual permissions rather than a separate hand-set flag,
 * so a calendar can never drift out of sync with the toggles that are supposed to describe it. */
export function isCalendarInactive(calendar: Calendar): boolean {
  return !calendar.permissions.busy && !calendar.permissions.add;
}

const PROVIDER_LABEL: Record<CalendarProvider, string> = {
  google: 'Google',
  microsoft: 'Microsoft',
  apple: 'Apple',
};

const PROVIDER_IDENTIFIER: Record<CalendarProvider, string> = {
  google: 'Connected via Google',
  microsoft: 'Connected via Microsoft',
  apple: 'On this iPhone',
};

/**
 * Screen 3h's "Continue with..." mock connection. Idempotent by provider: connecting a
 * provider that is already connected returns the same arrays, unchanged - pressing "Continue
 * with Google" twice (or landing on 3h a second time from 3i's "Connect another calendar")
 * can never create a second Google account or duplicate a calendar.
 *
 * A freshly connected calendar starts `{ busy: true, add: false }` - reading free/busy is the
 * entire point of connecting (the screen's own promise: "we'll only check when you're busy"),
 * but the write permission is never granted silently (blueprint §27/§28, hard constraint #3):
 * it starts off and stays off until the user explicitly turns it on, here or later in
 * Settings.
 */
export function connectProvider(
  accounts: ConnectedCalendarAccount[],
  calendars: Calendar[],
  provider: CalendarProvider,
): { accounts: ConnectedCalendarAccount[]; calendars: Calendar[] } {
  if (accounts.some((account) => account.provider === provider)) {
    return { accounts, calendars };
  }

  const accountId = `${provider}-1`;
  const newAccount: ConnectedCalendarAccount = {
    id: accountId,
    provider,
    providerLabel: PROVIDER_LABEL[provider],
    identifier: PROVIDER_IDENTIFIER[provider],
  };
  const newCalendar: Calendar = {
    id: `${accountId}-personal`,
    accountId,
    name: 'Personal',
    permissions: { busy: true, add: false },
  };

  return { accounts: [...accounts, newAccount], calendars: [...calendars, newCalendar] };
}

/**
 * Clears one account's `needsReauth` flag (screen 3i's "Sign in again"), and nothing else.
 * Every calendar under that account keeps exactly the permissions it already had - a lapsed
 * connection coming back does not silently re-grant "busy" or "add" on the user's behalf; it
 * only makes the toggles interactive again, at whatever state they were last left in.
 */
export function reauthenticateAccount(
  accounts: ConnectedCalendarAccount[],
  accountId: string,
): ConnectedCalendarAccount[] {
  return accounts.map((account) =>
    account.id === accountId ? { ...account, needsReauth: false } : account,
  );
}
