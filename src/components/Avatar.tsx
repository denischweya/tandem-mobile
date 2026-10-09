import { View, Text } from 'react-native';
import { colors, sizes } from '@/theme';
import { StatusDot, type Availability } from './StatusDot';

export interface AvatarProps {
  /** 1-2 letter initials rendered inside the circle (the reference's `.av` content). */
  label: string;
  /** Diameter in px. Defaults to the reference's base `.av` size. */
  size?: number;
  backgroundColor: string;
  textColor?: string;
  /** The surface this avatar sits on, used for its own ring and for the status dot's ring -
   * both borders must match whatever is behind the avatar (a card, the plain background,
   * another avatar it overlaps) or the ring reads as a visible seam instead of a gap. */
  borderColor?: string;
  /** Availability badge in the bottom-right corner, as seen in "Your people this week". */
  status?: Availability;
  /** Diameter of the status-dot badge. Defaults to the reference's badge size for a 52px
   * avatar ("Your people this week") - pass `sizes.statusDotXs` for the smaller 28px avatars
   * screen 3d uses on a candidate slot's attendee row, so the badge stays proportional. */
  statusDotSize?: number;
  /**
   * When this avatar is one of several carrying the same combined label (an AvatarGroup, or
   * a MemberList cell that labels its own wrapping element), the avatar itself must be
   * invisible to assistive tech so the label is announced once, not once per avatar. Leave
   * this false for a standalone avatar that should announce `accessibilityLabel` itself.
   */
  decorative?: boolean;
  /** Required unless `decorative` is true: what a screen reader announces for this avatar. */
  accessibilityLabel?: string;
}

export function Avatar({
  label,
  size = sizes.avatarSm,
  backgroundColor,
  textColor = colors.text,
  borderColor = colors.bg,
  status,
  statusDotSize,
  decorative = false,
  accessibilityLabel,
}: AvatarProps) {
  const fontSize = size <= sizes.avatarSm ? 13 : 17;

  return (
    <View
      accessible={!decorative}
      accessibilityElementsHidden={decorative}
      importantForAccessibility={decorative ? 'no-hide-descendants' : 'yes'}
      accessibilityLabel={decorative ? undefined : accessibilityLabel}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor,
      }}
    >
      <Text style={{ fontSize, fontWeight: '600', color: textColor }}>{label}</Text>
      {status ? <StatusDot status={status} size={statusDotSize} borderColor={borderColor} /> : null}
    </View>
  );
}
