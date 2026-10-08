import { toZonedParts } from '@tandem/shared';

it('can import and execute the shared package under Jest', () => {
  const parts = toZonedParts(new Date('2026-10-10T16:30:00Z'), 'Africa/Nairobi');
  expect(parts).toEqual({ year: 2026, month: 10, day: 10, hour: 19, minute: 30 });
});
