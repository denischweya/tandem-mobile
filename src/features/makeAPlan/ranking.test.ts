import { CANDIDATE_SLOTS, ORGANIZER_ID, PEOPLE } from './fixtures';
import {
  computeBlockingPeople,
  formatCalendarCoverageSentence,
  formatCompactAvailabilitySummary,
  formatTopAvailabilitySummary,
  describeCalendarCoverage,
  rankCandidates,
  scoreSlot,
  slotAvailabilityByPerson,
  summarizeSlotAvailability,
  type AttendeeSelection,
} from './ranking';

// Mirrors the design's default "The Boys" invite list exactly: Sarah/James required, Mary a
// guest, Mike optional. These three tests' fixtures are deliberately the same shape screen
// 3b hands off to 3d in the real flow.
const BOYS_ATTENDEES: AttendeeSelection[] = [
  { personId: 'sarah', role: 'required', included: true },
  { personId: 'james', role: 'required', included: true },
  { personId: 'mary', role: 'guest', included: true },
  { personId: 'mike', role: 'optional', included: true },
];

describe('computeBlockingPeople', () => {
  it('includes the organiser plus every required/guest attendee, excluding optional', () => {
    const blocking = computeBlockingPeople(BOYS_ATTENDEES, ORGANIZER_ID);
    expect(blocking.sort()).toEqual(['denis', 'james', 'mary', 'sarah'].sort());
    expect(blocking).not.toContain('mike');
  });

  it('drops an optional attendee even when included is true', () => {
    const attendees: AttendeeSelection[] = [{ personId: 'mike', role: 'optional', included: true }];
    expect(computeBlockingPeople(attendees, ORGANIZER_ID)).toEqual([ORGANIZER_ID]);
  });

  it('excludes an attendee the user has unchecked', () => {
    const attendees: AttendeeSelection[] = [
      { personId: 'sarah', role: 'required', included: false },
    ];
    expect(computeBlockingPeople(attendees, ORGANIZER_ID)).toEqual([ORGANIZER_ID]);
  });
});

describe('summarizeSlotAvailability', () => {
  const blockingIds = ['denis', 'sarah', 'james', 'mary'];

  it('counts every blocking person free on the top slot (4/4)', () => {
    const slot = CANDIDATE_SLOTS.find((s) => s.id === 'slot-sat-7pm');
    if (!slot) throw new Error('fixture missing slot-sat-7pm');
    const summary = summarizeSlotAvailability(slot, blockingIds, PEOPLE);
    expect(summary).toEqual({ freeCount: 4, totalCount: 4, exceptions: [] });
  });

  it('names Mary as a "maybe" exception on the Friday slot', () => {
    const slot = CANDIDATE_SLOTS.find((s) => s.id === 'slot-fri-7pm');
    if (!slot) throw new Error('fixture missing slot-fri-7pm');
    const summary = summarizeSlotAvailability(slot, blockingIds, PEOPLE);
    expect(summary.freeCount).toBe(3);
    expect(summary.exceptions).toEqual([{ personId: 'mary', firstName: 'Mary', status: 'maybe' }]);
  });

  it('names James as a "busy" exception on the Sunday slot', () => {
    const slot = CANDIDATE_SLOTS.find((s) => s.id === 'slot-sun-5pm');
    if (!slot) throw new Error('fixture missing slot-sun-5pm');
    const summary = summarizeSlotAvailability(slot, blockingIds, PEOPLE);
    expect(summary.freeCount).toBe(3);
    expect(summary.exceptions).toEqual([{ personId: 'james', firstName: 'James', status: 'busy' }]);
  });

  it('treats a blocking person missing from the slot entirely as busy, never free', () => {
    const slot = CANDIDATE_SLOTS.find((s) => s.id === 'slot-sat-7pm');
    if (!slot) throw new Error('fixture missing slot-sat-7pm');
    const summary = summarizeSlotAvailability(slot, [...blockingIds, 'mike'], PEOPLE);
    expect(summary.totalCount).toBe(5);
    expect(summary.exceptions).toEqual([{ personId: 'mike', firstName: 'Mike', status: 'busy' }]);
  });
});

describe('slotAvailabilityByPerson', () => {
  it("returns every blocking person's status, including the free ones, for the top slot", () => {
    const slot = CANDIDATE_SLOTS.find((s) => s.id === 'slot-sat-7pm');
    if (!slot) throw new Error('fixture missing slot-sat-7pm');
    expect(slotAvailabilityByPerson(slot, ['denis', 'sarah', 'james', 'mary'])).toEqual([
      { personId: 'denis', status: 'free' },
      { personId: 'sarah', status: 'free' },
      { personId: 'james', status: 'free' },
      { personId: 'mary', status: 'free' },
    ]);
  });

  it("agrees with summarizeSlotAvailability's exceptions on the Sunday slot", () => {
    const slot = CANDIDATE_SLOTS.find((s) => s.id === 'slot-sun-5pm');
    if (!slot) throw new Error('fixture missing slot-sun-5pm');
    const blocking = ['denis', 'sarah', 'james', 'mary'];
    expect(slotAvailabilityByPerson(slot, blocking)).toEqual([
      { personId: 'denis', status: 'free' },
      { personId: 'sarah', status: 'free' },
      { personId: 'james', status: 'busy' },
      { personId: 'mary', status: 'free' },
    ]);
  });
});

describe('scoreSlot', () => {
  it('penalises a maybe less than a busy for the same free count', () => {
    const maybeSummary = {
      freeCount: 3,
      totalCount: 4,
      exceptions: [{ personId: 'x', firstName: 'X', status: 'maybe' as const }],
    };
    const busySummary = {
      freeCount: 3,
      totalCount: 4,
      exceptions: [{ personId: 'x', firstName: 'X', status: 'busy' as const }],
    };
    expect(scoreSlot(maybeSummary, 0)).toBeGreaterThan(scoreSlot(busySummary, 0));
  });

  it('lets preferenceBonus break a tie between two fully-free slots', () => {
    const allFree = { freeCount: 4, totalCount: 4, exceptions: [] };
    expect(scoreSlot(allFree, 20)).toBeGreaterThan(scoreSlot(allFree, 5));
  });

  it('never lets preferenceBonus outweigh a difference in free count', () => {
    const fullyFree = { freeCount: 4, totalCount: 4, exceptions: [] };
    const oneBusy = {
      freeCount: 3,
      totalCount: 4,
      exceptions: [{ personId: 'x', firstName: 'X', status: 'busy' as const }],
    };
    // Even a generous preference bonus on the worse slot shouldn't out-score full availability.
    expect(scoreSlot(fullyFree, 0)).toBeGreaterThan(scoreSlot(oneBusy, 39));
  });
});

describe('rankCandidates', () => {
  const blockingIds = computeBlockingPeople(BOYS_ATTENDEES, ORGANIZER_ID);

  it('orders the fixture slots exactly as the reference shows them', () => {
    const ranked = rankCandidates(CANDIDATE_SLOTS, blockingIds, PEOPLE);
    expect(ranked.map((r) => r.slot.id)).toEqual([
      'slot-sat-7pm',
      'slot-sat-6pm',
      'slot-fri-7pm',
      'slot-sun-5pm',
    ]);
    expect(ranked.map((r) => r.rank)).toEqual([1, 2, 3, 4]);
  });

  it("computes each ranked slot's end time from its start + duration", () => {
    const ranked = rankCandidates(CANDIDATE_SLOTS, blockingIds, PEOPLE);
    const top = ranked[0];
    expect(top).toBeDefined();
    expect(top?.end).toEqual(new Date('2026-10-10T18:00:00Z')); // +120min
  });
});

describe('formatTopAvailabilitySummary / formatCompactAvailabilitySummary', () => {
  it('formats a fully-free slot as "N/N free"', () => {
    expect(formatTopAvailabilitySummary({ freeCount: 4, totalCount: 4, exceptions: [] })).toBe(
      '4/4 free',
    );
  });

  it('formats a fully-free compact slot with no exception clause', () => {
    expect(formatCompactAvailabilitySummary({ freeCount: 4, totalCount: 4, exceptions: [] })).toBe(
      '4 free',
    );
  });

  it('names a single maybe exception, lower-cased, never a reason', () => {
    expect(
      formatCompactAvailabilitySummary({
        freeCount: 3,
        totalCount: 4,
        exceptions: [{ personId: 'mary', firstName: 'Mary', status: 'maybe' }],
      }),
    ).toBe('3 free · Mary maybe');
  });

  it('names a single busy exception, lower-cased, never a reason', () => {
    expect(
      formatCompactAvailabilitySummary({
        freeCount: 3,
        totalCount: 4,
        exceptions: [{ personId: 'james', firstName: 'James', status: 'busy' }],
      }),
    ).toBe('3 free · James busy');
  });
});

describe('describeCalendarCoverage / formatCalendarCoverageSentence', () => {
  const blockingIds = computeBlockingPeople(BOYS_ATTENDEES, ORGANIZER_ID);

  it('counts 3 of 4 connected, with Mary needing a link, for the default Boys invite', () => {
    const coverage = describeCalendarCoverage(blockingIds, PEOPLE);
    expect(coverage).toEqual({ connectedCount: 3, totalCount: 4, namesNeedingLink: ['Mary'] });
    expect(formatCalendarCoverageSentence(coverage)).toBe(
      '3 of 4 people have calendars connected. Mary will be asked for their availability by link.',
    );
  });

  it('omits the second sentence when everyone has a calendar connected', () => {
    const coverage = describeCalendarCoverage(['denis', 'sarah', 'james'], PEOPLE);
    expect(formatCalendarCoverageSentence(coverage)).toBe(
      '3 of 3 people have calendars connected.',
    );
  });
});
