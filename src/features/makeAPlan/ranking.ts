import type { Availability } from '@/components';
import { describeAvailability } from '@/components';
import { addMinutes } from './dates';
import type { AttendeeRole, CandidateSlot, Person } from './fixtures';

// The screen 3d logic: who a candidate time has to work for ("blocking" people), how free
// each candidate actually is for exactly that set, and the ranked order the design shows
// (Sat 7 PM > Sat 6 PM > Fri 7 PM > Sun 5 PM). Kept pure and framework-free so it is testable
// without rendering anything - the same split `StatusDot.ts`/`describeAvailability` already
// uses in this codebase.
//
// Privacy invariant (blueprint §136/§154, the task's hard constraint #6): every value this
// module produces is a count or a `free`/`maybe`/`busy` status - never a reason. `CandidateSlot.insight`
// is the one piece of free text involved, and it describes why the *slot* ranks well (a
// group habit), never why a *person* is unavailable - there is no field anywhere here that
// could carry "Sarah has a dentist appointment".

export interface AttendeeSelection {
  personId: string;
  role: AttendeeRole;
  /** Whether this attendee is still part of the plan. Only ever toggled for `optional`
   * attendees in this slice - `required`/`guest` rows are locked included on screen 3b. */
  included: boolean;
}

/**
 * The set of people whose availability a candidate time must satisfy: the organiser plus
 * every included attendee *except* `optional` ones - optional attendees are, by definition
 * (the 3b copy: "won't block a time"), never part of this set, regardless of their own
 * `included` flag.
 */
export function computeBlockingPeople(
  attendees: AttendeeSelection[],
  organizerId: string,
): string[] {
  const blocking = attendees
    .filter((attendee) => attendee.included && attendee.role !== 'optional')
    .map((attendee) => attendee.personId);
  return [organizerId, ...blocking.filter((id) => id !== organizerId)];
}

export interface AvailabilityException {
  personId: string;
  firstName: string;
  status: Availability;
}

export interface SlotAvailabilitySummary {
  freeCount: number;
  totalCount: number;
  /** Blocking people who are not free, each carrying only their status word - never a
   * reason. Ordered the same as `blockingPersonIds`. */
  exceptions: AvailabilityException[];
}

/**
 * Narrows a candidate slot's availability entries down to the blocking set, counting how
 * many are free and naming (by first name + status word only) the ones that aren't. A
 * blocking person with no entry for this slot is treated as `busy` (fail safe: an unknown
 * state must never read as "free").
 */
/** A blocking person's status for one slot, defaulting to `busy` when the fixture has no
 * entry for them (fail safe: an unknown state must never read as "free"). Shared by
 * `summarizeSlotAvailability` and `slotAvailabilityByPerson` so the two can't disagree. */
function statusFor(slot: CandidateSlot, personId: string): Availability {
  const entry = slot.availability.find((candidate) => candidate.personId === personId);
  return entry?.status ?? 'busy';
}

export function summarizeSlotAvailability(
  slot: CandidateSlot,
  blockingPersonIds: string[],
  people: Record<string, Person>,
): SlotAvailabilitySummary {
  let freeCount = 0;
  const exceptions: AvailabilityException[] = [];

  for (const personId of blockingPersonIds) {
    const status = statusFor(slot, personId);
    if (status === 'free') {
      freeCount += 1;
    } else {
      exceptions.push({
        personId,
        firstName: people[personId]?.firstName ?? 'Someone',
        status,
      });
    }
  }

  return { freeCount, totalCount: blockingPersonIds.length, exceptions };
}

export interface PersonAvailability {
  personId: string;
  status: Availability;
}

/**
 * Every blocking person's status for one slot, in `blockingPersonIds` order - the data
 * behind screen 3d's top-candidate avatar row (each avatar needs its *own* status dot, not
 * just the aggregate free count `summarizeSlotAvailability` returns).
 */
export function slotAvailabilityByPerson(
  slot: CandidateSlot,
  blockingPersonIds: string[],
): PersonAvailability[] {
  return blockingPersonIds.map((personId) => ({ personId, status: statusFor(slot, personId) }));
}

const MAYBE_PENALTY = 15;
const BUSY_PENALTY = 40;
const FREE_POINTS = 100;

/**
 * A slot's rank score: every blocking person free is worth far more than any amount of soft
 * preference (so availability always dominates), a `maybe` costs less than a `busy` (an
 * unconfirmed person is a better bet than an unavailable one), and `preferenceBonus` (the
 * fixture's stand-in for blueprint §21's soft-constraint scoring - preferred hours, weekend
 * fit, etc.) only breaks ties between otherwise-equal availability.
 */
export function scoreSlot(summary: SlotAvailabilitySummary, preferenceBonus: number): number {
  const maybeCount = summary.exceptions.filter((e) => e.status === 'maybe').length;
  const busyCount = summary.exceptions.filter((e) => e.status === 'busy').length;
  return (
    summary.freeCount * FREE_POINTS -
    maybeCount * MAYBE_PENALTY -
    busyCount * BUSY_PENALTY +
    preferenceBonus
  );
}

export interface RankedSlot {
  slot: CandidateSlot;
  rank: number;
  score: number;
  summary: SlotAvailabilitySummary;
  end: Date;
}

/**
 * Sorts candidates best-first: highest score wins; ties break by earliest start time, so the
 * order is deterministic rather than dependent on the input array's own order.
 */
export function rankCandidates(
  slots: CandidateSlot[],
  blockingPersonIds: string[],
  people: Record<string, Person>,
): RankedSlot[] {
  return slots
    .map((slot) => {
      const summary = summarizeSlotAvailability(slot, blockingPersonIds, people);
      return {
        slot,
        score: scoreSlot(summary, slot.preferenceBonus),
        summary,
        end: addMinutes(slot.start, slot.durationMinutes),
      };
    })
    .sort((a, b) => b.score - a.score || a.slot.start.getTime() - b.slot.start.getTime())
    .map((ranked, index) => ({ ...ranked, rank: index + 1 }));
}

/** "4/4 free" - the top-ranked slot's badge. */
export function formatTopAvailabilitySummary(summary: SlotAvailabilitySummary): string {
  return `${summary.freeCount}/${summary.totalCount} free`;
}

/**
 * "4 free" or "3 free · Mary maybe" - every other ranked slot's compact line. Names every
 * exception with its status word only (never a reason), matching the reference exactly for
 * the single-exception case and extending the same join for more than one.
 */
export function formatCompactAvailabilitySummary(summary: SlotAvailabilitySummary): string {
  const base = `${summary.freeCount} free`;
  if (summary.exceptions.length === 0) return base;

  const named = summary.exceptions
    .map(
      (exception) =>
        `${exception.firstName} ${describeAvailability(exception.status).label.toLowerCase()}`,
    )
    .join(', ');
  return `${base} · ${named}`;
}

export interface CalendarCoverage {
  connectedCount: number;
  totalCount: number;
  namesNeedingLink: string[];
}

/** Screen 3c's "N of M people have calendars connected" input data. */
export function describeCalendarCoverage(
  blockingPersonIds: string[],
  people: Record<string, Person>,
): CalendarCoverage {
  const namesNeedingLink: string[] = [];
  let connectedCount = 0;

  for (const personId of blockingPersonIds) {
    const person = people[personId];
    if (person?.hasCalendarConnection) {
      connectedCount += 1;
    } else {
      namesNeedingLink.push(person?.firstName ?? 'Someone');
    }
  }

  return { connectedCount, totalCount: blockingPersonIds.length, namesNeedingLink };
}

/**
 * "3 of 4 people have calendars connected. Mary will be asked for their availability by
 * link." - joins 2+ names as "Mary and James" rather than a comma list, and omits the second
 * sentence entirely when everyone is connected. Deliberately uses the gender-neutral "their"
 * throughout (the reference's transcribed "her" only happens to fit this fixture's one name,
 * Mary - a reusable sentence builder can't assume every future name is "her").
 */
export function formatCalendarCoverageSentence(coverage: CalendarCoverage): string {
  const first = `${coverage.connectedCount} of ${coverage.totalCount} people have calendars connected.`;
  if (coverage.namesNeedingLink.length === 0) return first;

  const names =
    coverage.namesNeedingLink.length === 1
      ? coverage.namesNeedingLink[0]
      : `${coverage.namesNeedingLink.slice(0, -1).join(', ')} and ${coverage.namesNeedingLink.at(-1)}`;
  const verb = coverage.namesNeedingLink.length === 1 ? 'will be asked' : 'will each be asked';
  return `${first} ${names} ${verb} for their availability by link.`;
}
