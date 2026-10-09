import { View, Text } from 'react-native';
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
}

/**
 * The reference's highlighted "Your next plan" card: a `Card` on `--color-accent-2-100`
 * composed with the plan's title, schedule, relative countdown, attendee `AvatarGroup`, and a
 * calendar-confirmation row. There is no Plan Overview screen yet in this slice (mocked data
 * only - see fixtures.ts), so the card is informational, not a navigation target: it carries
 * one combined accessibility label rather than exposing a tap target with nowhere to go.
 */
export function PlanCard({
  title,
  scheduleLine,
  relativeLabel,
  attendees,
  attendeesLabel,
  inCalendar,
}: PlanCardProps) {
  const combinedLabel = `Next plan: ${title}, ${scheduleLine}, ${relativeLabel}${
    inCalendar ? ', in your calendar' : ''
  }`;

  return (
    <View accessible accessibilityLabel={combinedLabel} accessibilityRole="summary">
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
    </View>
  );
}
