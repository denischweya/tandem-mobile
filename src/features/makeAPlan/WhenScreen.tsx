import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Button,
  CalendarGlyphIcon,
  Chip,
  DayStrip,
  ResponsiveContainer,
  SegmentedControl,
  StepHeader,
} from '@/components';
import { colors, headingStyle, radii, spacing, subStyle } from '@/theme';
import { getWeekStripDays } from './dates';
import {
  mockNow,
  ORGANIZER_ID,
  PEOPLE,
  QUICK_CHOICES,
  DURATION_OPTIONS,
  TIME_OF_DAY_OPTIONS,
} from './fixtures';
import { usePlanDraftStore } from './planDraftStore';
import {
  computeBlockingPeople,
  describeCalendarCoverage,
  formatCalendarCoverageSentence,
} from './ranking';

const TIME_ZONE = 'Africa/Nairobi';

export interface WhenScreenProps {
  onBack: () => void;
  onNext: () => void;
}

/**
 * Screen 3c: "Step 2: when + how long, and where availability comes from". A quick-choice
 * row, a 7-day strip, a daytime/evening/any-time segment, duration chips, and a read-only
 * summary of which calendars feed the next screen's availability search.
 *
 * "Using Google · Personal, Work" and the "Change" affordance are presentational only -
 * there is no calendar-connections screen in this slice to change *to* (same situation as
 * the Home report's "See all"), so "Change" renders as inert, labelled text rather than a
 * dead button, matching that established convention.
 */
export function WhenScreen({ onBack, onNext }: WhenScreenProps) {
  const insets = useSafeAreaInsets();
  const quickChoiceId = usePlanDraftStore((s) => s.quickChoiceId);
  const selectedDayNumbers = usePlanDraftStore((s) => s.selectedDayNumbers);
  const timeOfDayId = usePlanDraftStore((s) => s.timeOfDayId);
  const durationId = usePlanDraftStore((s) => s.durationId);
  const attendees = usePlanDraftStore((s) => s.attendees);
  const setQuickChoice = usePlanDraftStore((s) => s.setQuickChoice);
  const toggleDay = usePlanDraftStore((s) => s.toggleDay);
  const setTimeOfDay = usePlanDraftStore((s) => s.setTimeOfDay);
  const setDuration = usePlanDraftStore((s) => s.setDuration);

  const weekDays = getWeekStripDays(mockNow, TIME_ZONE);
  const dayStripItems = weekDays.map((day) => ({
    id: day.id,
    weekdayAbbr: day.weekdayAbbr,
    dayOfMonth: day.dayOfMonth,
    selected: selectedDayNumbers.includes(day.dayOfMonth),
  }));

  const blockingPeople = computeBlockingPeople(attendees, ORGANIZER_ID);
  const coverage = describeCalendarCoverage(blockingPeople, PEOPLE);

  return (
    <ResponsiveContainer>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + spacing.xl,
          paddingHorizontal: spacing.xxxl,
          gap: spacing.xxxl,
          paddingBottom: spacing.huge,
        }}
      >
        <StepHeader leadingIcon="back" onLeadingPress={onBack} totalSteps={3} completedSteps={2} />

        <View style={{ gap: spacing.lg }}>
          <Text accessibilityRole="header" style={headingStyle(32)}>
            When?
          </Text>

          <View
            accessibilityRole="radiogroup"
            accessibilityLabel="Quick date choices"
            style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' }}
          >
            {QUICK_CHOICES.map((choice) => (
              <Chip
                key={choice.id}
                label={choice.label}
                selected={choice.id === quickChoiceId}
                onPress={() => setQuickChoice(choice.id)}
              />
            ))}
          </View>

          <DayStrip
            days={dayStripItems}
            onToggleDay={(id) => {
              const day = dayStripItems.find((d) => d.id === id);
              if (day) toggleDay(day.dayOfMonth);
            }}
          />

          <SegmentedControl
            options={TIME_OF_DAY_OPTIONS}
            selectedId={timeOfDayId}
            onSelect={(id) => setTimeOfDay(id as typeof timeOfDayId)}
            accessibilityLabel="Time of day"
          />
        </View>

        <View style={{ gap: spacing.lg }}>
          <Text accessibilityRole="header" style={headingStyle(26)}>
            How long?
          </Text>
          <View
            accessibilityRole="radiogroup"
            accessibilityLabel="Duration"
            style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' }}
          >
            {DURATION_OPTIONS.map((option) => (
              <Chip
                key={option.id}
                label={option.label}
                selected={option.id === durationId}
                onPress={() => setDuration(option.id)}
              />
            ))}
          </View>
        </View>

        <View
          style={{
            gap: spacing.sm,
            padding: spacing.xl,
            borderRadius: radii.card,
            backgroundColor: colors.neutral[100],
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <CalendarGlyphIcon size={20} color={colors.accent2[700]} />
            <Text style={{ flex: 1, fontWeight: '600', fontSize: 14, color: colors.text }}>
              Using Google · Personal, Work
            </Text>
            <Text style={{ fontSize: 13, color: colors.accent[700] }}>Change</Text>
          </View>
          <Text style={[subStyle, { lineHeight: 18 }]}>
            {formatCalendarCoverageSentence(coverage)}
          </Text>
        </View>
      </ScrollView>

      <View
        style={{
          paddingHorizontal: spacing.xxxl,
          paddingBottom: insets.bottom + spacing.xxl,
          paddingTop: spacing.md,
        }}
      >
        <Button label="Find best times" onPress={onNext} />
      </View>
    </ResponsiveContainer>
  );
}
