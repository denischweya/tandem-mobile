// Mock data for the calendar-connection flow (screen 3h) and the per-calendar settings screen
// (screen 3i). Same situation as every other feature's `fixtures.ts` in this app - there is no
// calendar-connections API yet, so this is the one place that mock data lives, typed the way a
// real `/api/v1/calendar-accounts` response would be: plain data values, never a UI concern
// like a hex colour or a pixel size.

export type CalendarProvider = 'google' | 'microsoft' | 'apple';

export interface ConnectedCalendarAccount {
  id: string;
  provider: CalendarProvider;
  /** "Google" / "Apple" / "Microsoft" - the account-level heading on screen 3i. */
  providerLabel: string;
  /** The email (Google/Microsoft) or "On this iPhone" (a device-local Apple calendar, which
   * has no email) shown under the provider name - hidden on screen 3i while `needsReauth` is
   * true, replaced by the "Sign in again" action instead. */
  identifier: string;
  /** True once the provider's own sign-in has lapsed (the reference's Microsoft row). While
   * true, every calendar under this account renders its toggles dimmed and non-interactive
   * (see `CalendarSettingsScreen`) - reading or writing on a lapsed connection is not
   * something this app can actually do, so the UI must not let it look selectable. Cleared
   * only by `reauthenticateAccount` in `./permissions.ts`, which never flips a calendar's own
   * permissions back on as a side effect - a lapsed-then-restored account comes back exactly
   * as it was left, not silently re-granted. */
  needsReauth?: boolean;
}

export interface CalendarPermissions {
  /** Read-only: lets other plan members see this calendar's free/busy status for a candidate
   * time. Never event titles, locations, descriptions or attendees - blueprint §17 / §90. */
  busy: boolean;
  /** Write: this calendar is an eligible destination when a confirmed plan is added to a
   * calendar (the per-person, explicit choice `ConfirmScreen` already makes - see
   * `src/features/planLifecycle/ConfirmScreen.tsx`'s own calendar-choice invariant comment).
   * Turning this on here never itself writes an event; it only makes the calendar selectable
   * there. Independent of `busy` - blueprint §27 / §28 treat reading and writing as two
   * separate permissions, so this type gives them two separate fields rather than one
   * combined "connected" flag a UI could collapse into a single toggle. */
  add: boolean;
}

export interface Calendar {
  id: string;
  accountId: string;
  /** The calendar's own name, exactly as it exists under the provider account ("Personal",
   * "Work", "Birthdays", "Family"). Never a category this app infers from *which* provider
   * the account is - blueprint §13 / spec §15: personal vs work is the user's own choice, not
   * guessed from "Google = personal, Outlook = work". The Google account below carries one
   * calendar of each kind side by side, which is exactly why the name has to live on the
   * calendar, not the account. */
  name: string;
  permissions: CalendarPermissions;
}

// The signed-in user throughout this app's mocked data is Denis (Home, make-a-plan, voting) -
// this feature keeps that consistent rather than introducing a different "you". This is the
// settings screen's starting state: a user partway through connecting calendars, with one
// lapsed provider, so the screen has something of every shape (an active multi-calendar
// account, a single-calendar account, and a disabled one) to show.
export const CALENDAR_ACCOUNTS: ConnectedCalendarAccount[] = [
  { id: 'google-1', provider: 'google', providerLabel: 'Google', identifier: 'denis@gmail.com' },
  { id: 'apple-1', provider: 'apple', providerLabel: 'Apple', identifier: 'On this iPhone' },
  {
    id: 'microsoft-1',
    provider: 'microsoft',
    providerLabel: 'Microsoft',
    identifier: 'denis@outlook.com',
    needsReauth: true,
  },
];

export const CALENDARS: Calendar[] = [
  {
    id: 'google-1-personal',
    accountId: 'google-1',
    name: 'Personal',
    permissions: { busy: true, add: true },
  },
  {
    id: 'google-1-work',
    accountId: 'google-1',
    name: 'Work',
    permissions: { busy: true, add: false },
  },
  {
    id: 'google-1-birthdays',
    accountId: 'google-1',
    name: 'Birthdays',
    permissions: { busy: false, add: false },
  },
  {
    id: 'apple-1-family',
    accountId: 'apple-1',
    name: 'Family',
    permissions: { busy: true, add: true },
  },
  {
    id: 'microsoft-1-outlook-work',
    accountId: 'microsoft-1',
    name: 'Outlook · Work',
    permissions: { busy: false, add: false },
  },
];

/**
 * The event screen 3h's "You see" / "Friends see" comparison is built from - the same Sat 10
 * Oct instant `makeAPlan/fixtures.ts`'s `CANDIDATE_SLOTS` and `planLifecycle/fixtures.ts`'s
 * `VOTING_CANDIDATES` already use ("Sat 10 Oct" is this mocked user's recurring Saturday),
 * rather than an unrelated date invented just for this screen.
 */
export const PRIVACY_DEMO_EVENT = {
  title: 'Dentist',
  start: new Date('2026-10-10T13:00:00Z'), // Sat 10 Oct, 4:00 PM Africa/Nairobi
  end: new Date('2026-10-10T14:00:00Z'), // 5:00 PM Africa/Nairobi
  timeZone: 'Africa/Nairobi',
};
