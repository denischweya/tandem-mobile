import { View } from 'react-native';
import { colors, sizes } from '@/theme';

// The three availability states shown on a person's avatar in "Your people this week".
// Keeping this union here (rather than inline-ing 'free' | 'maybe' | 'busy' at every call
// site) is what makes `describeAvailability` exhaustive-checkable: adding a fourth status
// forces a compile error everywhere this switch lives until it is handled.
export type Availability = 'free' | 'maybe' | 'busy';

export interface AvailabilityAppearance {
  /** The dot's fill colour. */
  color: string;
  /** The human-readable word for this status - never conveyed by colour alone (blueprint
   * §136: "Do not communicate availability using color alone"). Every caller that renders a
   * dot must surface this as a text or accessibility label. */
  label: string;
}

/**
 * Pure mapping from availability status to its colour + text label. Exported on its own
 * (rather than folded into the `StatusDot` component) so the mapping itself - the thing most
 * likely to be mis-typed when a new status is added - is directly unit-testable without
 * rendering anything.
 */
export function describeAvailability(status: Availability): AvailabilityAppearance {
  switch (status) {
    case 'free':
      return { color: colors.accent2[500], label: 'Free' };
    case 'maybe':
      return { color: colors.accent[300], label: 'Maybe' };
    case 'busy':
      return { color: colors.neutral[400], label: 'Busy' };
  }
}

interface StatusDotProps {
  status: Availability;
  /** Diameter in px. Defaults to the reference's `.sd` size used on 52px avatars. */
  size?: number;
  /** The colour the dot's border should blend into (the surface it sits on). */
  borderColor?: string;
}

/**
 * The small coloured dot badge on a person's avatar. Always decorative: the status word
 * itself must be read by a screen reader from the accessibility label the *caller* builds
 * (typically combining a person's name with `describeAvailability(status).label`), not from
 * this dot in isolation - a lone dot with no visible neighbour text would otherwise be the
 * colour-only signal the accessibility requirement forbids.
 */
export function StatusDot({
  status,
  size = sizes.statusDotLg,
  borderColor = colors.bg,
}: StatusDotProps) {
  const { color } = describeAvailability(status);
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{
        position: 'absolute',
        right: -2,
        bottom: -2,
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 2,
        borderColor,
        backgroundColor: color,
      }}
    />
  );
}
