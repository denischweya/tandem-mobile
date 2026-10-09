import { addMinutes, datesForQuickChoice, getWeekStripDays } from './dates';

const NAIROBI = 'Africa/Nairobi';
// The fixtures' mockNow: Monday 5 October 2026, 06:30 UTC (09:30 Africa/Nairobi) - the same
// instant Home's dashboard fixture uses, so the two mocked slices of the app agree.
const MONDAY = new Date('2026-10-05T06:30:00Z');

describe('getWeekStripDays', () => {
  it('returns the Monday-start week containing referenceNow, as 7 days', () => {
    const days = getWeekStripDays(MONDAY, NAIROBI);
    expect(days.map((d) => d.weekdayAbbr)).toEqual([
      'Mon',
      'Tue',
      'Wed',
      'Thu',
      'Fri',
      'Sat',
      'Sun',
    ]);
    expect(days.map((d) => d.dayOfMonth)).toEqual([5, 6, 7, 8, 9, 10, 11]);
  });

  it('is stable for an instant already inside the week, not just its first day', () => {
    // Wednesday 7 Oct, evening UTC - still the same Mon 5-Sun 11 week.
    const wednesday = new Date('2026-10-07T20:00:00Z');
    const days = getWeekStripDays(wednesday, NAIROBI);
    expect(days.map((d) => d.dayOfMonth)).toEqual([5, 6, 7, 8, 9, 10, 11]);
  });
});

describe('datesForQuickChoice', () => {
  it('"tonight" selects just today', () => {
    expect(datesForQuickChoice('tonight', MONDAY, NAIROBI)).toEqual(new Set([5]));
  });

  it('"tomorrow" selects the next day', () => {
    expect(datesForQuickChoice('tomorrow', MONDAY, NAIROBI)).toEqual(new Set([6]));
  });

  it('"thisWeekend" selects Fri/Sat/Sun, matching the reference\'s highlighted trio', () => {
    expect(datesForQuickChoice('thisWeekend', MONDAY, NAIROBI)).toEqual(new Set([9, 10, 11]));
  });

  it('"nextWeek" selects nothing on this single-week strip', () => {
    expect(datesForQuickChoice('nextWeek', MONDAY, NAIROBI)).toEqual(new Set());
  });
});

describe('addMinutes', () => {
  it('adds whole minutes to an instant', () => {
    const start = new Date('2026-10-10T16:00:00Z');
    expect(addMinutes(start, 120)).toEqual(new Date('2026-10-10T18:00:00Z'));
  });

  it('is a no-op for zero minutes', () => {
    const start = new Date('2026-10-10T16:00:00Z');
    expect(addMinutes(start, 0)).toEqual(start);
  });
});
