import { View } from 'react-native';
import { colors, sizes } from '@/theme';
import { Avatar } from './Avatar';

export interface AvatarGroupMember {
  id: string;
  label: string;
  backgroundColor: string;
  /** Explicit `undefined` accepted, not just omission - see `Avatar.textColor` and finding
   * I6, spec §14.1. */
  textColor?: string | undefined;
}

export interface AvatarGroupProps {
  members: AvatarGroupMember[];
  size?: number;
  /** The surface the stack sits on - each avatar's ring colour (the reference's `.stack .av`
   * on the purple plan card uses `--color-accent-2-100`, not the page background). */
  borderColor?: string;
  /** What a screen reader announces for the whole stack. The individual avatars are
   * decorative so this is announced exactly once. */
  accessibilityLabel: string;
}

/** The reference's `.stack` - overlapping avatars with a fixed negative margin, used for the
 * attendee row on "Your next plan". Unlike `MemberList`, these avatars carry no status dot
 * and no individual label; the group speaks as one unit. */
export function AvatarGroup({
  members,
  size = sizes.avatarSm,
  borderColor = colors.bg,
  accessibilityLabel,
}: AvatarGroupProps) {
  return (
    <View accessible accessibilityLabel={accessibilityLabel} style={{ flexDirection: 'row' }}>
      {members.map((member, index) => (
        <View
          key={member.id}
          style={index === 0 ? undefined : { marginLeft: -sizes.avatarStackOverlap }}
        >
          <Avatar
            label={member.label}
            size={size}
            backgroundColor={member.backgroundColor}
            textColor={member.textColor}
            borderColor={borderColor}
            decorative
          />
        </View>
      ))}
    </View>
  );
}
