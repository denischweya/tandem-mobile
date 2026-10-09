import { describeAvailability } from './StatusDot';
import { colors } from '@/theme';

// This is the mapping the accessibility requirement leans on (blueprint §136: "Do not
// communicate availability using color alone") - every caller that renders a status dot is
// trusted to surface `label`, not just `color`. A test that only asserted "a colour comes
// back" could never fail from a mis-mapped colour or a missing label, so each case asserts
// both the exact colour token and the exact label.
describe('describeAvailability', () => {
  it('maps free to the purple accent colour and the label "Free"', () => {
    expect(describeAvailability('free')).toEqual({ color: colors.accent2[500], label: 'Free' });
  });

  it('maps maybe to the light-pink accent colour and the label "Maybe"', () => {
    expect(describeAvailability('maybe')).toEqual({ color: colors.accent[300], label: 'Maybe' });
  });

  it('maps busy to the neutral colour and the label "Busy"', () => {
    expect(describeAvailability('busy')).toEqual({ color: colors.neutral[400], label: 'Busy' });
  });

  it('gives each of the three statuses a distinct colour', () => {
    const colorsUsed = (['free', 'maybe', 'busy'] as const).map(
      (status) => describeAvailability(status).color,
    );
    expect(new Set(colorsUsed).size).toBe(3);
  });
});
