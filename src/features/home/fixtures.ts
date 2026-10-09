import { colors } from '@/theme';
import type { Availability } from '@/components';

// There is no Home API endpoint yet - Plans 2 and 3 of this cycle build Plans, membership
// and invitations server-side (see docs/specs/2026-10-06-cycle-1-foundation-tracer-design.md
// §8). This module is the one place mock data for the Home dashboard lives, typed the way a
// real response would be: plain data values (strings, a `Date`, an availability enum), never
// a UI concern like a colour. When a real `/api/v1/me/home` (or equivalent) shape exists, this
// file's exports are what gets replaced - nothing else in `src/features/home` or
// `src/components` should need to change, since both only consume these types.

export interface PlanAttendee {
  id: string;
  firstName: string;
  initials: string;
}

export interface NextPlan {
  id: string;
  title: string;
  location: string;
  /** The plan's start instant in UTC, per blueprint §171.4 - every persisted timestamp is
   * UTC, and this fixture mirrors that even though nothing persists it yet. */
  startsAt: Date;
  /** IANA zone the plan's wall-clock time is meant to be read in (§171.5). */
  timeZone: string;
  attendees: PlanAttendee[];
  inCalendar: boolean;
}

export interface NeedsYouItem {
  id: string;
  title: string;
  subtitle: string;
}

export interface Person {
  id: string;
  firstName: string;
  initials: string;
  availability: Availability;
}

export interface HomeDashboardData {
  currentUserFirstName: string;
  /** The instant "now" is evaluated at, in UTC - passed explicitly (rather than read from
   * `Date.now()` deep inside a formatter) so the header date, the plan's relative countdown
   * and the greeting are all testable against a fixed instant. */
  now: Date;
  timeZone: string;
  nextPlan: NextPlan;
  needsYou: NeedsYouItem[];
  people: Person[];
}

// Avatar fill colours are a presentation concern, not part of the data model above - a real
// API response has no opinion on hex codes. They are looked up separately, by person id, so
// swapping this fixture for a live response later only means deleting this map's use, not
// reshaping `HomeDashboardData`.
export const personAvatarColor: Record<string, string> = {
  denis: colors.text,
  sarah: colors.accent[200],
  james: colors.accent2[300],
  mary: colors.neutral[300],
  mike: colors.accent[100],
  kofi: colors.accent2[200],
};

export const personAvatarTextColor: Record<string, string> = {
  denis: colors.bg,
};

// A fixed instant rather than `new Date()` - this is mock data standing in for a future API
// response, and the whole point of the fixture (the header reading "Monday 5 October", the
// plan landing exactly "in 5 days" on "Sat 10 Oct") only holds together at one specific
// instant. A live clock would make the header correct forever but the "in 5 days" line wrong
// within a day of whenever this is read. 06:30 UTC is 09:30 in the fixture's Africa/Nairobi,
// which is what makes the header read "Good morning".
export const mockNow = new Date('2026-10-05T06:30:00Z');

export function getHomeDashboardFixture(now: Date): HomeDashboardData {
  return {
    currentUserFirstName: 'Denis',
    now,
    timeZone: 'Africa/Nairobi',
    nextPlan: {
      id: 'plan-dinner',
      title: 'Dinner',
      location: 'Westlands',
      startsAt: new Date('2026-10-10T16:00:00Z'), // Sat 10 Oct, 19:00 Africa/Nairobi (UTC+3)
      timeZone: 'Africa/Nairobi',
      attendees: [
        { id: 'sarah', firstName: 'Sarah', initials: 'S' },
        { id: 'james', firstName: 'James', initials: 'J' },
        { id: 'mary', firstName: 'Mary', initials: 'M' },
        { id: 'denis', firstName: 'Denis', initials: 'D' },
      ],
      inCalendar: true,
    },
    needsYou: [
      { id: 'football', title: 'Football', subtitle: 'Vote on 3 times · closes Thu' },
      { id: 'weekend-trip', title: 'Weekend trip', subtitle: "Mary asked when you're free" },
    ],
    people: [
      { id: 'sarah', firstName: 'Sarah', initials: 'S', availability: 'free' },
      { id: 'james', firstName: 'James', initials: 'J', availability: 'free' },
      { id: 'mary', firstName: 'Mary', initials: 'M', availability: 'maybe' },
      { id: 'mike', firstName: 'Mike', initials: 'Mi', availability: 'busy' },
      { id: 'kofi', firstName: 'Kofi', initials: 'K', availability: 'free' },
    ],
  };
}
