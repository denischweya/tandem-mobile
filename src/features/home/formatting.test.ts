import {
  formatClockTime,
  formatDateTimeComma,
  formatGreeting,
  formatHeaderDate,
  formatHourLabel,
  formatPlanDate,
  formatRelativeDays,
  formatScheduleLine,
  formatTimeRange,
  formatVotingDeadline,
  formatWeekdayAbbr,
} from './formatting';

const NAIROBI = 'Africa/Nairobi'; // UTC+3, no DST - the zone the Home dashboard fixture uses.

describe('formatHeaderDate', () => {
  it('renders "Monday 5 October" for the fixture\'s mock "now"', () => {
    // 06:30 UTC on 2026-10-05 is 09:30 in Africa/Nairobi (UTC+3) - still the 5th there.
    expect(formatHeaderDate(new Date('2026-10-05T06:30:00Z'), NAIROBI)).toBe('Monday 5 October');
  });

  it('crosses the date forward when the zone is already into the next day', () => {
    // 22:00 UTC on 2026-10-05 is 01:00 on the 6th in Nairobi - a case a formatter that
    // ignored the timezone argument (just reading the UTC date) would get wrong.
    expect(formatHeaderDate(new Date('2026-10-05T22:00:00Z'), NAIROBI)).toBe('Tuesday 6 October');
  });

  it('reads a different calendar date in a different timezone for the same instant', () => {
    // Proves the timezone argument is doing real work: the same instant renders as two
    // different dates depending on the zone given.
    expect(formatHeaderDate(new Date('2026-10-05T22:00:00Z'), 'America/Los_Angeles')).toBe(
      'Monday 5 October',
    );
  });
});

describe('formatGreeting', () => {
  it('says good morning before midday', () => {
    expect(formatGreeting(new Date('2026-10-05T06:30:00Z'), NAIROBI)).toBe('Good morning');
  });

  it('says good afternoon in the afternoon', () => {
    expect(formatGreeting(new Date('2026-10-05T12:30:00Z'), NAIROBI)).toBe('Good afternoon');
  });

  it('says good evening in the evening', () => {
    expect(formatGreeting(new Date('2026-10-05T17:30:00Z'), NAIROBI)).toBe('Good evening');
  });
});

describe('formatPlanDate and formatClockTime', () => {
  it('renders the fixture plan\'s start as "Sat 10 Oct" and "7:00 PM"', () => {
    const startsAt = new Date('2026-10-10T16:00:00Z'); // 19:00 in Africa/Nairobi
    expect(formatPlanDate(startsAt, NAIROBI)).toBe('Sat 10 Oct');
    expect(formatClockTime(startsAt, NAIROBI)).toBe('7:00 PM');
  });

  it('pads single-digit minutes and keeps 12 for noon', () => {
    expect(formatClockTime(new Date('2026-10-10T09:00:00Z'), NAIROBI)).toBe('12:00 PM');
    expect(formatClockTime(new Date('2026-10-10T09:05:00Z'), NAIROBI)).toBe('12:05 PM');
  });

  it('combines date, time and location into the schedule line', () => {
    expect(formatScheduleLine(new Date('2026-10-10T16:00:00Z'), NAIROBI, 'Westlands')).toBe(
      'Sat 10 Oct · 7:00 PM · Westlands',
    );
  });
});

describe('formatWeekdayAbbr', () => {
  it('renders just the abbreviated weekday for the day-strip ("Sat" for 10 Oct 2026)', () => {
    expect(formatWeekdayAbbr(new Date('2026-10-10T16:00:00Z'), NAIROBI)).toBe('Sat');
  });
});

describe('formatTimeRange', () => {
  it('drops the repeated AM/PM suffix when both ends share a period ("7:00 – 9:00 PM")', () => {
    const start = new Date('2026-10-10T16:00:00Z'); // 19:00 Nairobi
    const end = new Date('2026-10-10T18:00:00Z'); // 21:00 Nairobi
    expect(formatTimeRange(start, end, NAIROBI)).toBe('7:00 – 9:00 PM');
  });

  it('keeps both AM/PM suffixes when the range crosses noon', () => {
    const start = new Date('2026-10-10T08:30:00Z'); // 11:30 Nairobi (AM)
    const end = new Date('2026-10-10T10:00:00Z'); // 13:00 Nairobi (PM)
    expect(formatTimeRange(start, end, NAIROBI)).toBe('11:30 AM – 1:00 PM');
  });
});

describe('formatHourLabel', () => {
  it('drops ":00" on an exact hour ("6 PM")', () => {
    expect(formatHourLabel(new Date('2026-10-08T15:00:00Z'), NAIROBI)).toBe('6 PM');
  });

  it('keeps the minutes when not on the hour ("6:05 PM")', () => {
    expect(formatHourLabel(new Date('2026-10-08T15:05:00Z'), NAIROBI)).toBe('6:05 PM');
  });

  it('renders a morning hour as AM ("10 AM")', () => {
    expect(formatHourLabel(new Date('2026-10-11T07:00:00Z'), NAIROBI)).toBe('10 AM');
  });
});

describe('formatVotingDeadline', () => {
  it('renders "Thu 6 PM" for the voting fixture\'s close time', () => {
    expect(formatVotingDeadline(new Date('2026-10-08T15:00:00Z'), NAIROBI)).toBe('Thu 6 PM');
  });
});

describe('formatDateTimeComma', () => {
  it('joins the compact date and clock time with a comma ("Fri 9 Oct, 7:00 PM")', () => {
    expect(formatDateTimeComma(new Date('2026-10-09T16:00:00Z'), NAIROBI)).toBe(
      'Fri 9 Oct, 7:00 PM',
    );
  });
});

describe('formatRelativeDays', () => {
  const nairobiMidnight = (isoDatePart: string) => new Date(`${isoDatePart}T06:30:00Z`);

  it('renders "in 5 days" for the fixture\'s now/plan pair', () => {
    expect(
      formatRelativeDays(nairobiMidnight('2026-10-05'), new Date('2026-10-10T16:00:00Z'), NAIROBI),
    ).toBe('in 5 days');
  });

  it('renders "today" for the same calendar day', () => {
    expect(
      formatRelativeDays(nairobiMidnight('2026-10-05'), new Date('2026-10-05T18:00:00Z'), NAIROBI),
    ).toBe('today');
  });

  it('renders "tomorrow" for the next calendar day', () => {
    expect(
      formatRelativeDays(nairobiMidnight('2026-10-05'), new Date('2026-10-06T01:00:00Z'), NAIROBI),
    ).toBe('tomorrow');
  });

  it('renders a past date as "N days ago"', () => {
    expect(
      formatRelativeDays(nairobiMidnight('2026-10-10'), new Date('2026-10-05T06:30:00Z'), NAIROBI),
    ).toBe('5 days ago');
  });
});
