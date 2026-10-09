import { View, Text, Pressable } from 'react-native';
import { colors, headingStyle, subStyle } from '@/theme';
import { Card } from './Card';
import { AvatarGroup, type AvatarGroupMember } from './AvatarGroup';
import { CheckIcon } from './icons';

export interface PlanCardProps {
  title: string;
  /** Pre-formatted "Sat 10 Oct · 7:00 PM · Westlands" - see src/features/home/formatting.ts
   * for how the date/time portion is produced from `toZonedParts`. */
  scheduleLine: string;
  /** Pre-formatted "in 5 days". */
  relativeLabel: string;
  attendees: AvatarGroupMember[];
  attendeesLabel: string;
  /** Whether the "In your calendar" confirmation row is shown. */
  inCalendar: boolean;
  /** Navigates to the plan's detail view (screen 3g). Omit to render the card as purely
   * informational, with one combined accessibility label - its original behaviour, from when
   * there was no detail screen for it to lead to. */
  onPress?: () => void;
}

/**
 * The reference's highlighted "Your next plan" card: a `Card` on `--color-accent-2-100`
 * composed with the plan's title, schedule, relative countdown, attendee `AvatarGroup`, and a
 * calendar-confirmation row. Screen 3g (the plan detail view) now exists, so when a caller
 * passes `onPress` the whole card becomes a single tap target to it - the same "one combined
 * label, one tap target" shape as before, now wrapped in a `Pressable` instead of a plain
 * `View` rather than exposing a smaller "View details" affordance inside the card.
 */
export function PlanCard({
  title,
  scheduleLine,
  relativeLabel,
  attendees,
  attendeesLabel,
  inCalendar,
  onPress,
}: PlanCardProps) {
  const combinedLabel = `Next plan: ${title}, ${scheduleLine}, ${relativeLabel}${
    inCalendar ? ', in your calendar' : ''
  }`;

  const content = (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Card backgroundColor={colors.accent2[100]}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <View style={{ gap: 4 }}>
            <Text style={headingStyle(30)}>{title}</Text>
            <Text style={{ fontSize: 15, color: colors.neutral[800] }}>{scheduleLine}</Text>
          </View>
          <Text style={{ fontSize: 13, fontWeight: '600', color: colors.accent2[800] }}>
            {relativeLabel}
          </Text>
        </View>

        <View
          style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <AvatarGroup
            members={attendees}
            borderColor={colors.accent2[100]}
            accessibilityLabel={attendeesLabel}
          />
          {inCalendar ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <CheckIcon size={16} color={colors.accent2[800]} />
              <Text style={[subStyle, { fontSize: 13, color: colors.accent2[800] }]}>
                In your calendar
              </Text>
            </View>
          ) : null}
        </View>
      </Card>
    </View>
  );

  if (!onPress) {
    return (
      <View accessible accessibilityLabel={combinedLabel} accessibilityRole="summary">
        {content}
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={combinedLabel}
      style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
    >
      {content}
    </Pressable>
  );
}
