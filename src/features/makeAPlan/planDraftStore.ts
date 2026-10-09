import { create } from 'zustand';
import { datesForQuickChoice } from './dates';
import {
  mockNow,
  PLAN_CATEGORIES,
  SAVED_GROUPS,
  type DurationOptionId,
  type QuickChoiceId,
  type TimeOfDayId,
} from './fixtures';
import type { AttendeeSelection } from './ranking';

// The one piece of client state this flow needs: the plan being built, carried across three
// separate Expo Router screens (3b -> 3c -> 3d). There is no plan-creation API yet (same
// "mocked, not invented" situation as `./fixtures.ts`), so this is a plain in-memory store for
// the mocked flow, not a cache in front of a real endpoint - `zustand` is already a declared
// dependency of this project (unused until now) and is the obvious, already-sanctioned tool
// for sharing state between stack screens without inventing route params or a Context
// provider for a single, short-lived flow.

function defaultAttendeesForGroup(groupId: string): AttendeeSelection[] {
  const group = SAVED_GROUPS.find((candidate) => candidate.id === groupId);
  return (group?.members ?? []).map((member) => ({
    personId: member.personId,
    role: member.role,
    included: true,
  }));
}

const DEFAULT_GROUP_ID = 'the-boys';

export interface PlanDraftState {
  categoryId: string;
  planName: string;
  selectedGroupId: string | null;
  attendees: AttendeeSelection[];

  quickChoiceId: QuickChoiceId;
  selectedDayNumbers: number[];
  timeOfDayId: TimeOfDayId;
  durationId: DurationOptionId;

  setCategory: (categoryId: string) => void;
  setPlanName: (name: string) => void;
  selectGroup: (groupId: string) => void;
  /** Only ever changes an `optional` attendee's `included` flag - `required`/`guest` rows
   * have no handler wired to this on screen 3b, so this is never called for them. Guarded
   * here too, defensively, so a future caller can't silently start blocking a time on a
   * required person's behalf. */
  toggleOptionalAttendee: (personId: string) => void;
  setQuickChoice: (choice: QuickChoiceId) => void;
  toggleDay: (dayOfMonth: number) => void;
  setTimeOfDay: (id: TimeOfDayId) => void;
  setDuration: (id: DurationOptionId) => void;
  reset: () => void;
}

const initialState = {
  categoryId: PLAN_CATEGORIES[0]?.id ?? 'dinner',
  planName: PLAN_CATEGORIES[0]?.label ?? 'Dinner',
  selectedGroupId: DEFAULT_GROUP_ID,
  attendees: defaultAttendeesForGroup(DEFAULT_GROUP_ID),

  quickChoiceId: 'thisWeekend' as QuickChoiceId,
  selectedDayNumbers: Array.from(
    datesForQuickChoice('thisWeekend', mockNow, 'Africa/Nairobi'),
  ).sort((a, b) => a - b),
  timeOfDayId: 'evening' as TimeOfDayId,
  durationId: '2h' as DurationOptionId,
};

export const usePlanDraftStore = create<PlanDraftState>((set, get) => ({
  ...initialState,

  setCategory: (categoryId) => set({ categoryId }),
  setPlanName: (planName) => set({ planName }),

  selectGroup: (groupId) =>
    set({ selectedGroupId: groupId, attendees: defaultAttendeesForGroup(groupId) }),

  toggleOptionalAttendee: (personId) =>
    set({
      attendees: get().attendees.map((attendee) =>
        attendee.personId === personId && attendee.role === 'optional'
          ? { ...attendee, included: !attendee.included }
          : attendee,
      ),
    }),

  setQuickChoice: (choice) =>
    set({
      quickChoiceId: choice,
      // "Pick dates" hands control to the day strip itself rather than imposing a preset -
      // see `datesForQuickChoice`'s own doc comment for why it has no case for this one.
      selectedDayNumbers:
        choice === 'pickDates'
          ? get().selectedDayNumbers
          : Array.from(datesForQuickChoice(choice, mockNow, 'Africa/Nairobi')).sort(
              (a, b) => a - b,
            ),
    }),

  toggleDay: (dayOfMonth) =>
    set((state) => {
      const isSelected = state.selectedDayNumbers.includes(dayOfMonth);
      const next = isSelected
        ? state.selectedDayNumbers.filter((day) => day !== dayOfMonth)
        : [...state.selectedDayNumbers, dayOfMonth].sort((a, b) => a - b);
      // A manual edit no longer matches any preset's exact day set, so the active chip
      // becomes "Pick dates" - the same way typing in a search box deselects a quick filter.
      return { selectedDayNumbers: next, quickChoiceId: 'pickDates' };
    }),

  setTimeOfDay: (timeOfDayId) => set({ timeOfDayId }),
  setDuration: (durationId) => set({ durationId }),

  reset: () =>
    set({
      ...initialState,
      attendees: defaultAttendeesForGroup(DEFAULT_GROUP_ID),
    }),
}));
