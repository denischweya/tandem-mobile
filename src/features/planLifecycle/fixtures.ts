import type { Availability } from '@/components';
import { colors } from '@/theme';
import { personAvatarColor, personAvatarTextColor } from '../home/fixtures';

// There is no Plans/voting/calendar-sync API yet (same situation as
// `src/features/home/fixtures.ts` and `src/features/makeAPlan/fixtures.ts` - see either
// file's header comment). This module is the one place mock data for screens 3e (voting), 3f
// (confirm) and 3g (plan detail) lives, typed the way real responses would be: plain data
// values, never a UI concern like a hex colour. When real endpoints exist, this file's
// exports are what gets replaced.
//
// Screen 3e's "Football" plan and screen 3g's "Dinner" plan are two independent mocked
// scenarios, not two views onto whatever the user just drafted in `src/features/makeAPlan`:
// 3e is the destination for "Let everyone vote" (screen 3d), but there is no voting-poll
// backend to turn the draft's ranked candidates into a real poll, so it renders the
// reference's own worked example instead (see `VotingScreen`'s header comment). 3g is reached
// from Home's already-confirmed "Your next plan" card - the Dinner plan Home has shown since
// before this session's make-a-plan flow, not a continuation of it (see
// `PlanDetailScreen`'s header comment). Only 3f (reached from 3d's "Confirm") genuinely
// reads the live draft, via `usePlanDraftStore`'s `confirmedSlotId`.

// ---------------------------------------------------------------------------------------------
// Screen 3e - voting
// ---------------------------------------------------------------------------------------------

export interface VotingPerson {
  id: string;
  firstName: string;
  initials: string;
  avatarColor: string;
  /** Explicit `undefined` accepted, not just omission - see `Avatar.textColor` and finding
   * I6, spec §14.1. */
  avatarTextColor?: string | undefined;
}

/** The signed-in user throughout this app's mocked data (Home, make-a-plan) is Denis - this
 * screen keeps that consistent rather than introducing a different "you". */
export const VOTING_VIEWER_ID = 'denis';

export const VOTING_PEOPLE: Record<string, VotingPerson> = {
  denis: {
    id: 'denis',
    firstName: 'Denis',
    initials: 'D',
    avatarColor: personAvatarColor['denis'] ?? colors.text,
    avatarTextColor: personAvatarTextColor['denis'],
  },
  sarah: {
    id: 'sarah',
    firstName: 'Sarah',
    initials: 'S',
    avatarColor: personAvatarColor['sarah'] ?? colors.accent[200],
  },
  james: {
    id: 'james',
    firstName: 'James',
    initials: 'J',
    avatarColor: personAvatarColor['james'] ?? colors.accent2[300],
  },
  mike: {
    id: 'mike',
    firstName: 'Mike',
    initials: 'Mi',
    avatarColor: personAvatarColor['mike'] ?? colors.accent[100],
  },
  kofi: {
    id: 'kofi',
    firstName: 'Kofi',
    initials: 'K',
    avatarColor: personAvatarColor['kofi'] ?? colors.accent2[200],
  },
};

export const VOTING_PEOPLE_IDS = Object.keys(VOTING_PEOPLE);

export interface VoteCandidate {
  id: string;
  start: Date;
  timeZone: string;
}

export const VOTING_TIME_ZONE = 'Africa/Nairobi';

export const VOTING_CANDIDATES: VoteCandidate[] = [
  { id: 'vote-sat-4pm', start: new Date('2026-10-10T13:00:00Z'), timeZone: VOTING_TIME_ZONE }, // Sat 10 Oct, 4 PM
  { id: 'vote-sun-10am', start: new Date('2026-10-11T07:00:00Z'), timeZone: VOTING_TIME_ZONE }, // Sun 11 Oct, 10 AM
  { id: 'vote-thu-8pm', start: new Date('2026-10-08T17:00:00Z'), timeZone: VOTING_TIME_ZONE }, // Thu 8 Oct, 8 PM
];

/** Voting closes Thu 8 Oct, 6 PM Africa/Nairobi. */
export const VOTING_CLOSES_AT = new Date('2026-10-08T15:00:00Z');

export interface VoteEntry {
  personId: string;
  candidateId: string;
  /**
   * Reuses `Availability` ('free'/'maybe'/'busy') rather than inventing a parallel
   * 'yes'/'maybe'/'no' enum - a vote on a candidate time *is* a self-reported availability for
   * that slot. See `src/features/planLifecycle/voting.ts`'s header comment for the full
   * rationale, including why this is also what hard constraint #1 ("never colour alone")
   * needs here.
   */
  choice: Availability;
}

export const INITIAL_VOTES: VoteEntry[] = [
  // Denis (the viewer) has gone through all three candidates.
  { personId: 'denis', candidateId: 'vote-sat-4pm', choice: 'free' },
  { personId: 'denis', candidateId: 'vote-sun-10am', choice: 'maybe' },
  { personId: 'denis', candidateId: 'vote-thu-8pm', choice: 'busy' },
  // Sarah and James have also gone through all three - together with Denis, that's the "3 of
  // 5 voted" the header reads. Their individual choices are never rendered anywhere (hard
  // constraint #2), so the exact values here only need to be valid, not meaningful.
  { personId: 'sarah', candidateId: 'vote-sat-4pm', choice: 'free' },
  { personId: 'sarah', candidateId: 'vote-sun-10am', choice: 'free' },
  { personId: 'sarah', candidateId: 'vote-thu-8pm', choice: 'maybe' },
  { personId: 'james', candidateId: 'vote-sat-4pm', choice: 'free' },
  { personId: 'james', candidateId: 'vote-sun-10am', choice: 'busy' },
  { personId: 'james', candidateId: 'vote-thu-8pm', choice: 'busy' },
  // Mike has only responded to the Saturday slot so far; Kofi only to the Sunday one - neither
  // has finished voting, which is what keeps the header at "3 of 5" rather than "5 of 5".
  { personId: 'mike', candidateId: 'vote-sat-4pm', choice: 'maybe' },
  { personId: 'kofi', candidateId: 'vote-sun-10am', choice: 'free' },
];

export interface SharedItem {
  id: string;
  label: string;
}

export const VOTING_SHARED_ITEMS_TOTAL = 5;

export const VOTING_SHARED_ITEMS_PREVIEW: SharedItem[] = [
  { id: 'booking-pdf', label: 'kasarani-booking.pdf' },
  { id: 'pitch-map', label: 'Pitch map' },
  { id: 'photos', label: '3 photos' },
];

export interface VotingChatMessage {
  id: string;
  authorId: string;
  text: string;
}

export const VOTING_CHAT: VotingChatMessage[] = [
  { id: 'msg-1', authorId: 'sarah', text: "Saturday works, I'll bring bibs" },
  { id: 'msg-2', authorId: VOTING_VIEWER_ID, text: 'Same. Pitch is booked till 6' },
];

export const VOTING_PLAN = {
  id: 'football',
  title: 'Football',
  groupName: 'The Boys',
  locationLabel: 'Kasarani 5-a-side',
};

// ---------------------------------------------------------------------------------------------
// Screen 3f - confirm (calendar + reminders)
// ---------------------------------------------------------------------------------------------

export type CalendarChoiceId = 'personal' | 'work' | 'family' | 'none';

export interface CalendarOption {
  id: CalendarChoiceId;
  label: string;
  subtitle: string;
  /** Flags the option screen 3f pre-selects - see `calendar.ts`'s `defaultCalendarChoice`.
   * Explicit `undefined` accepted, not just omission, because test fixtures construct this
   * conditionally - see finding I6, spec §14.1. */
  lastUsed?: boolean | undefined;
}

export const CALENDAR_OPTIONS: CalendarOption[] = [
  { id: 'personal', label: 'Personal', subtitle: 'Google Calendar', lastUsed: true },
  { id: 'work', label: 'Work', subtitle: 'Google Calendar' },
  { id: 'family', label: 'Family', subtitle: 'Apple Calendar, on this iPhone' },
  { id: 'none', label: "Don't add", subtitle: '' },
];

export type ReminderOffsetId = '1w' | '3d' | '1d' | '1h' | '30m';

export interface ReminderOption {
  id: ReminderOffsetId;
  label: string;
  minutesBefore: number;
}

export const REMINDER_OPTIONS: ReminderOption[] = [
  { id: '1w', label: '1 week', minutesBefore: 7 * 24 * 60 },
  { id: '3d', label: '3 days', minutesBefore: 3 * 24 * 60 },
  { id: '1d', label: '1 day', minutesBefore: 24 * 60 },
  { id: '1h', label: '1 hour', minutesBefore: 60 },
  { id: '30m', label: '30 min', minutesBefore: 30 },
];

export const DEFAULT_SELECTED_REMINDER_IDS: ReminderOffsetId[] = ['1d', '1h'];

// `src/features/makeAPlan`'s 3b/3c steps never collect a location - the confirm/detail
// screens' "Westlands" deliberately reuses Home's already-confirmed Dinner plan's location
// (`src/features/home/fixtures.ts`'s `nextPlan.location`) rather than inventing an unrelated
// one, for the same continuity reason that flow's `mockNow` is re-exported from Home's fixture.
export const PLAN_LOCATION = 'Westlands';
export const PLAN_LOCATION_FULL = 'Westlands, Nairobi';

// ---------------------------------------------------------------------------------------------
// Screen 3g - plan detail
// ---------------------------------------------------------------------------------------------

export type PlanPersonStatus = 'confirmed' | 'pending';

export interface PlanPerson {
  id: string;
  firstName: string;
  initials: string;
  avatarColor: string;
  /** Explicit `undefined` accepted, not just omission - see `Avatar.textColor` and finding
   * I6, spec §14.1. */
  avatarTextColor?: string | undefined;
  /** "organiser" / "guest, hasn't replied" - never a reason, same privacy rule as everywhere
   * else in this app. */
  roleLabel?: string;
  status: PlanPersonStatus;
}

export type CalendarSyncStatus = 'synced' | 'failed';

export interface CalendarSyncEntry {
  id: CalendarChoiceId;
  calendarLabel: string;
  provider: string;
  status: CalendarSyncStatus;
  /** User-facing, non-technical reason - never a raw backend error (spec §135, hard
   * constraint #4). Explicit `undefined` accepted, not just omission, because
   * `retryCalendarSync` clears it in place - see finding I6, spec §14.1. */
  failureReason?: string | undefined;
}

export interface PlanDetail {
  id: string;
  title: string;
  startsAt: Date;
  endsAt: Date;
  timeZone: string;
  locationLabel: string;
  people: PlanPerson[];
  calendarSync: CalendarSyncEntry[];
  reminderIds: ReminderOffsetId[];
}

// Keyed by id so a future `/api/v1/plans/:id` can replace the lookup without reshaping the
// screen. Only `plan-dinner` exists in this mocked slice - the same plan, and the same id, as
// `src/features/home/fixtures.ts`'s `nextPlan`.
export const PLAN_DETAILS: Record<string, PlanDetail> = {
  'plan-dinner': {
    id: 'plan-dinner',
    title: 'Dinner',
    startsAt: new Date('2026-10-10T16:00:00Z'), // Sat 10 Oct, 7 PM Africa/Nairobi
    endsAt: new Date('2026-10-10T18:00:00Z'), // 9 PM Africa/Nairobi
    timeZone: 'Africa/Nairobi',
    locationLabel: PLAN_LOCATION_FULL,
    people: [
      {
        id: 'denis',
        firstName: 'Denis',
        initials: 'D',
        avatarColor: personAvatarColor['denis'] ?? colors.text,
        avatarTextColor: personAvatarTextColor['denis'],
        roleLabel: 'organiser',
        status: 'confirmed',
      },
      {
        id: 'sarah',
        firstName: 'Sarah',
        initials: 'S',
        avatarColor: personAvatarColor['sarah'] ?? colors.accent[200],
        status: 'confirmed',
      },
      {
        id: 'james',
        firstName: 'James',
        initials: 'J',
        avatarColor: personAvatarColor['james'] ?? colors.accent2[300],
        status: 'confirmed',
      },
      {
        id: 'mary',
        firstName: 'Mary',
        initials: 'M',
        avatarColor: personAvatarColor['mary'] ?? colors.neutral[300],
        roleLabel: "guest, hasn't replied",
        status: 'pending',
      },
    ],
    calendarSync: [
      { id: 'personal', calendarLabel: 'Personal', provider: 'Google', status: 'synced' },
      {
        id: 'work',
        calendarLabel: 'Work',
        provider: 'Google',
        status: 'failed',
        failureReason: 'Google needs you to sign in again',
      },
    ],
    reminderIds: ['1d', '1h'],
  },
};

export function getPlanDetail(id: string): PlanDetail | undefined {
  return PLAN_DETAILS[id];
}
