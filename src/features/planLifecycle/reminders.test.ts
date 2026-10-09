import type { ReminderOffsetId, ReminderOption } from './fixtures';
import { computeReminderInstant, formatReminderLine, toggleReminder } from './reminders';

const NAIROBI = 'Africa/Nairobi';
const EVENT_START = new Date('2026-10-10T16:00:00Z'); // Sat 10 Oct, 7 PM Africa/Nairobi

describe('computeReminderInstant', () => {
  it('subtracts the given minutes from the event start', () => {
    expect(computeReminderInstant(EVENT_START, 60)).toEqual(new Date('2026-10-10T15:00:00Z'));
  });

  it('subtracts a full day for a 1440-minute reminder', () => {
    expect(computeReminderInstant(EVENT_START, 24 * 60)).toEqual(new Date('2026-10-09T16:00:00Z'));
  });

  it('is a no-op for zero minutes', () => {
    expect(computeReminderInstant(EVENT_START, 0)).toEqual(EVENT_START);
  });
});

describe('formatReminderLine', () => {
  it('renders "Fri 9 Oct, 7:00 PM · 1 day before" for a 1-day-before reminder', () => {
    const option: ReminderOption = { id: '1d', label: '1 day', minutesBefore: 24 * 60 };
    expect(formatReminderLine(EVENT_START, NAIROBI, option)).toBe(
      'Fri 9 Oct, 7:00 PM · 1 day before',
    );
  });

  it('renders "Sat 10 Oct, 6:00 PM · 1 hour before" for a 1-hour-before reminder', () => {
    const option: ReminderOption = { id: '1h', label: '1 hour', minutesBefore: 60 };
    expect(formatReminderLine(EVENT_START, NAIROBI, option)).toBe(
      'Sat 10 Oct, 6:00 PM · 1 hour before',
    );
  });
});

describe('toggleReminder', () => {
  it('adds an id not already selected', () => {
    expect(toggleReminder(['1d'], '1h')).toEqual(['1d', '1h']);
  });

  it('removes an id already selected', () => {
    expect(toggleReminder(['1d', '1h'], '1d')).toEqual(['1h']);
  });

  it('does not mutate the input array', () => {
    const selected: ReminderOffsetId[] = ['1d'];
    toggleReminder(selected, '1h');
    expect(selected).toEqual(['1d']);
  });
});
