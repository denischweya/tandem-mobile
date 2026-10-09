import type { Availability } from '@/components';
import { colors } from '@/theme';
import { mockNow as homeMockNow, personAvatarColor, personAvatarTextColor } from '../home/fixtures';

// There is no Plans API yet (same situation as `src/features/home/fixtures.ts` - see that
// file's header comment). This module is the one place mock data for the "make a plan" flow
// (screens 3b "what + who", 3c "when + how long", 3d "best times") lives, typed the way a
// real `/api/v1/plans` response would be: plain data values, never a UI concern like a hex
// colour. When a real endpoint exists, this file's exports are what gets replaced.
//
// `mockNow`, and the Sarah/James/Mary/Mike/Denis avatar colours, are re-exported from the
// Home dashboard's fixture rather than re-declared, so the two mocked slices of the app agree
// with each other: this flow's "today" is the same Monday 5 October the Home header reads,
// and the Sat 10 Oct 7-9 PM slot a user would confirm on screen 3d is the exact instant
// Home's "Your next plan" card already shows as booked.

export const mockNow = homeMockNow;

/** The plan's organiser - always a plan member, never shown in the "who's coming" invite
 * list (you don't invite yourself), and always in the "blocking" set screen 3d's ranking
 * uses (see `rankCandidates` in `./ranking.ts`). */
export const ORGANIZER_ID = 'denis';

export interface Person {
  id: string;
  firstName: string;
  initials: string;
  avatarColor: string;
  avatarTextColor?: string;
  /** Screen 3c's "3 of 4 people have calendars connected" line reads this - a person with no
   * connected calendar (the design's guest, Mary) is asked for their availability by
   * invite-link instead of it being read automatically. */
  hasCalendarConnection: boolean;
}

// A handful of generic placeholder members so the "Family" and "Football" saved groups have
// real rosters matching their chip counts ("· 6", "· 10"), even though the transcribed design
// frame never shows their individual rows (only "The Boys" is expanded). Cycled across a
// short palette of theme neutral/accent2 tones rather than each getting a bespoke colour,
// since none of them appear individually in the reference.
const PLACEHOLDER_PALETTE = [
  colors.neutral[200],
  colors.accent2[100],
  colors.neutral[300],
  colors.accent[100],
  colors.accent2[200],
  colors.neutral[400],
] as const;

function placeholderPerson(id: string, firstName: string, index: number): Person {
  return {
    id,
    firstName,
    initials: firstName.slice(0, 1).toUpperCase(),
    avatarColor: PLACEHOLDER_PALETTE[index % PLACEHOLDER_PALETTE.length] ?? colors.neutral[200],
    hasCalendarConnection: true,
  };
}

export const PEOPLE: Record<string, Person> = {
  denis: {
    id: 'denis',
    firstName: 'Denis',
    initials: 'D',
    avatarColor: personAvatarColor['denis'] ?? colors.text,
    avatarTextColor: personAvatarTextColor['denis'],
    hasCalendarConnection: true,
  },
  sarah: {
    id: 'sarah',
    firstName: 'Sarah',
    initials: 'S',
    avatarColor: personAvatarColor['sarah'] ?? colors.accent[200],
    hasCalendarConnection: true,
  },
  james: {
    id: 'james',
    firstName: 'James',
    initials: 'J',
    avatarColor: personAvatarColor['james'] ?? colors.accent2[300],
    hasCalendarConnection: true,
  },
  mary: {
    id: 'mary',
    firstName: 'Mary',
    initials: 'M',
    avatarColor: personAvatarColor['mary'] ?? colors.neutral[300],
    // The design's guest: "joins by link, no app needed" (3b) / "will be asked for her
    // availability by link" (3c) - the one person in the default group with no calendar
    // connection to read.
    hasCalendarConnection: false,
  },
  mike: {
    id: 'mike',
    firstName: 'Mike',
    initials: 'Mi',
    avatarColor: personAvatarColor['mike'] ?? colors.accent[100],
    hasCalendarConnection: true,
  },
  grace: placeholderPerson('grace', 'Grace', 0),
  peter: placeholderPerson('peter', 'Peter', 1),
  agnes: placeholderPerson('agnes', 'Agnes', 2),
  tom: placeholderPerson('tom', 'Tom', 3),
  leah: placeholderPerson('leah', 'Leah', 4),
  kevin: placeholderPerson('kevin', 'Kevin', 0),
  brian: placeholderPerson('brian', 'Brian', 1),
  felix: placeholderPerson('felix', 'Felix', 2),
  omar: placeholderPerson('omar', 'Omar', 3),
  victor: placeholderPerson('victor', 'Victor', 4),
  dan: placeholderPerson('dan', 'Dan', 5),
  eric: placeholderPerson('eric', 'Eric', 0),
  paul: placeholderPerson('paul', 'Paul', 1),
  samuel: placeholderPerson('samuel', 'Samuel', 2),
};

/** A person's standing within one specific plan's invite list - not a property of `Person`
 * itself, since the same person is "required" on one plan and "optional" on another.
 * Mirrors the three statuses the reference draws on screen 3b: `required` and `guest` rows
 * are locked "in" (the UI doesn't let you remove them here); `optional` is the only role a
 * person can be toggled out of the plan from this screen - see `AttendeeSelection.included`
 * below and `computeBlockingPeople` in `./ranking.ts`, which is the thing that actually reads
 * this field to decide whose availability can block a candidate time. */
export type AttendeeRole = 'required' | 'optional' | 'guest';

export interface GroupMember {
  personId: string;
  role: AttendeeRole;
}

export interface SavedGroup {
  id: string;
  name: string;
  members: GroupMember[];
}

export const SAVED_GROUPS: SavedGroup[] = [
  {
    id: 'the-boys',
    name: 'The Boys',
    members: [
      { personId: 'sarah', role: 'required' },
      { personId: 'james', role: 'required' },
      { personId: 'mary', role: 'guest' },
      { personId: 'mike', role: 'optional' },
    ],
  },
  {
    id: 'family',
    name: 'Family',
    members: [
      { personId: 'grace', role: 'required' },
      { personId: 'peter', role: 'required' },
      { personId: 'agnes', role: 'required' },
      { personId: 'tom', role: 'required' },
      { personId: 'leah', role: 'required' },
      { personId: 'mary', role: 'required' },
    ],
  },
  {
    id: 'football',
    name: 'Football',
    members: [
      { personId: 'kevin', role: 'required' },
      { personId: 'brian', role: 'required' },
      { personId: 'felix', role: 'required' },
      { personId: 'omar', role: 'required' },
      { personId: 'victor', role: 'required' },
      { personId: 'dan', role: 'required' },
      { personId: 'eric', role: 'required' },
      { personId: 'paul', role: 'required' },
      { personId: 'samuel', role: 'required' },
      { personId: 'mike', role: 'required' },
    ],
  },
];

export interface PlanCategory {
  id: string;
  label: string;
}

export const PLAN_CATEGORIES: PlanCategory[] = [
  { id: 'dinner', label: 'Dinner' },
  { id: 'drinks', label: 'Drinks' },
  { id: 'sport', label: 'Sport' },
  { id: 'travel', label: 'Travel' },
  { id: 'party', label: 'Party' },
  { id: 'other', label: 'Other' },
];

export type QuickChoiceId = 'tonight' | 'tomorrow' | 'thisWeekend' | 'nextWeek' | 'pickDates';

export const QUICK_CHOICES: { id: QuickChoiceId; label: string }[] = [
  { id: 'tonight', label: 'Tonight' },
  { id: 'tomorrow', label: 'Tomorrow' },
  { id: 'thisWeekend', label: 'This weekend' },
  { id: 'nextWeek', label: 'Next week' },
  { id: 'pickDates', label: 'Pick dates' },
];

export type TimeOfDayId = 'daytime' | 'evening' | 'anytime';

export const TIME_OF_DAY_OPTIONS: { id: TimeOfDayId; label: string }[] = [
  { id: 'daytime', label: 'Daytime' },
  { id: 'evening', label: 'Evening' },
  { id: 'anytime', label: 'Any time' },
];

export type DurationOptionId = '1h' | '2h' | '3h' | 'allDay' | 'custom';

export interface DurationOption {
  id: DurationOptionId;
  label: string;
  /** Minutes to add to a candidate's start time to compute its end time. `null` for the two
   * options with no fixed length ("All day" has no single end time; "Custom" has not been
   * given one by any picker UI in this slice - see the make-a-plan report's ambiguity
   * section). */
  minutes: number | null;
}

export const DURATION_OPTIONS: DurationOption[] = [
  { id: '1h', label: '1 h', minutes: 60 },
  { id: '2h', label: '2 h', minutes: 120 },
  { id: '3h', label: '3 h', minutes: 180 },
  { id: 'allDay', label: 'All day', minutes: null },
  { id: 'custom', label: 'Custom', minutes: null },
];

export interface AvailabilityEntry {
  personId: string;
  status: Availability;
}

export interface CandidateSlot {
  id: string;
  /** UTC instant, per blueprint §171.4 - every persisted timestamp is UTC (this fixture
   * mirrors that even though nothing persists it yet, same as `NextPlan.startsAt` in
   * `src/features/home/fixtures.ts`). */
  start: Date;
  durationMinutes: number;
  timeZone: string;
  availability: AvailabilityEntry[];
  /** A soft-constraint score contribution baked into the fixture (blueprint §21's "+15
   * preferred hours" / "+10 weekend preference" style scoring), standing in for whatever the
   * real availability engine would compute from working/preferred-hours rules. Higher is
   * more preferred. */
  preferenceBonus: number;
  /** A short, human-readable reason the *slot* ranks where it does ("...usually meet on
   * Saturday evenings") - never a reason an individual *person* is unavailable. Only the
   * top-ranked slot has one in the reference; see the privacy note rendered on screen 3d. */
  insight?: string;
}

export const CANDIDATE_SLOTS: CandidateSlot[] = [
  {
    id: 'slot-sat-7pm',
    // Sat 10 Oct, 19:00 Africa/Nairobi - the exact instant Home's fixture already shows as
    // the confirmed "Your next plan" card (`src/features/home/fixtures.ts`'s `nextPlan`).
    start: new Date('2026-10-10T16:00:00Z'),
    durationMinutes: 120,
    timeZone: 'Africa/Nairobi',
    availability: [
      { personId: 'denis', status: 'free' },
      { personId: 'sarah', status: 'free' },
      { personId: 'james', status: 'free' },
      { personId: 'mary', status: 'free' },
    ],
    preferenceBonus: 20,
    insight: "Everyone's free, and The Boys usually meet on Saturday evenings.",
  },
  {
    id: 'slot-sat-6pm',
    start: new Date('2026-10-10T15:00:00Z'), // 18:00 Africa/Nairobi
    durationMinutes: 120,
    timeZone: 'Africa/Nairobi',
    availability: [
      { personId: 'denis', status: 'free' },
      { personId: 'sarah', status: 'free' },
      { personId: 'james', status: 'free' },
      { personId: 'mary', status: 'free' },
    ],
    preferenceBonus: 5,
  },
  {
    id: 'slot-fri-7pm',
    start: new Date('2026-10-09T16:00:00Z'), // 19:00 Africa/Nairobi
    durationMinutes: 120,
    timeZone: 'Africa/Nairobi',
    availability: [
      { personId: 'denis', status: 'free' },
      { personId: 'sarah', status: 'free' },
      { personId: 'james', status: 'free' },
      { personId: 'mary', status: 'maybe' },
    ],
    preferenceBonus: 5,
  },
  {
    id: 'slot-sun-5pm',
    start: new Date('2026-10-11T14:00:00Z'), // 17:00 Africa/Nairobi
    durationMinutes: 120,
    timeZone: 'Africa/Nairobi',
    availability: [
      { personId: 'denis', status: 'free' },
      { personId: 'sarah', status: 'free' },
      { personId: 'james', status: 'busy' },
      { personId: 'mary', status: 'free' },
    ],
    preferenceBonus: 0,
  },
];
