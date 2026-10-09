import { View, Text, Pressable } from 'react-native';
import { colors, labelStyle, sizes, spacing } from '@/theme';
import { Avatar } from './Avatar';
import { describeAvailability, type Availability } from './StatusDot';

export interface MemberListPerson {
  id: string;
  firstName: string;
  initials: string;
  avatarColor: string;
  avatarTextColor?: string;
  availability: Availability;
}

export interface MemberListProps {
  title: string;
  people: MemberListPerson[];
  /** Omit to render "See all" as inert, labelled text rather than a dead button - this slice
   * has no destination screen for it yet. Pass a handler once one exists. */
  onSeeAll?: () => void;
}

/** The reference's "Your people this week": a label row (with a "See all" affordance) above
 * a horizontal row of named avatars, each carrying a non-colour-only availability badge. */
export function MemberList({ title, people, onSeeAll }: MemberListProps) {
  return (
    <View style={{ gap: spacing.lg }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={labelStyle}>{title}</Text>
        {onSeeAll ? (
          <Pressable
            onPress={onSeeAll}
            accessibilityRole="button"
            accessibilityLabel={`See all ${title.toLowerCase()}`}
            hitSlop={8}
            style={{ minHeight: sizes.minTouchTarget, justifyContent: 'center' }}
          >
            <Text style={{ fontSize: 13, color: colors.neutral[600] }}>See all</Text>
          </Pressable>
        ) : (
          <Text style={{ fontSize: 13, color: colors.neutral[600] }}>See all</Text>
        )}
      </View>

      <View style={{ flexDirection: 'row', gap: spacing.xl }}>
        {people.map((person) => {
          const { label: availabilityLabel } = describeAvailability(person.availability);
          return (
            <View
              key={person.id}
              accessible
              accessibilityLabel={`${person.firstName}, ${availabilityLabel.toLowerCase()}`}
              style={{ alignItems: 'center', gap: 6 }}
            >
              <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
                <Avatar
                  label={person.initials}
                  size={sizes.avatarLg}
                  backgroundColor={person.avatarColor}
                  textColor={person.avatarTextColor}
                  status={person.availability}
                  decorative
                />
              </View>
              <Text style={{ fontSize: 12, color: colors.text }}>{person.firstName}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
