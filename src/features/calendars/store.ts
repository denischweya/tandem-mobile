import { create } from 'zustand';
import {
  CALENDAR_ACCOUNTS,
  CALENDARS,
  type Calendar,
  type CalendarProvider,
  type ConnectedCalendarAccount,
} from './fixtures';
import {
  connectProvider,
  reauthenticateAccount,
  toggleCalendarPermission,
  type CalendarPermissionKind,
} from './permissions';

// The state shared between screen 3h (connect) and screen 3i (settings), carried across the
// two Expo Router screens under `app/settings/calendars/` the same way `usePlanDraftStore`
// carries the make-a-plan draft across 3b/3c/3d - a plain in-memory store for mocked data,
// not a cache in front of a real endpoint (see `./fixtures.ts`'s header comment). Every
// mutation here delegates to the pure functions in `./permissions.ts`; this file only wires
// them to zustand's `set`/`get`, so the actual permission logic stays testable without a
// store at all (see `permissions.test.ts`).

export interface CalendarSettingsState {
  accounts: ConnectedCalendarAccount[];
  calendars: Calendar[];
  connect: (provider: CalendarProvider) => void;
  reauthenticate: (accountId: string) => void;
  togglePermission: (calendarId: string, kind: CalendarPermissionKind) => void;
  reset: () => void;
}

export const useCalendarSettingsStore = create<CalendarSettingsState>((set, get) => ({
  accounts: CALENDAR_ACCOUNTS,
  calendars: CALENDARS,

  connect: (provider) => {
    const { accounts, calendars } = connectProvider(get().accounts, get().calendars, provider);
    set({ accounts, calendars });
  },

  reauthenticate: (accountId) =>
    set({ accounts: reauthenticateAccount(get().accounts, accountId) }),

  togglePermission: (calendarId, kind) =>
    set({ calendars: toggleCalendarPermission(get().calendars, calendarId, kind) }),

  reset: () => set({ accounts: CALENDAR_ACCOUNTS, calendars: CALENDARS }),
}));
