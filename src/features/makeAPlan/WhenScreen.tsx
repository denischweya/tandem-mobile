import { Pressable, ScrollView, Text, View } from 'react-native';
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
import { colors, headingStyle, radii, sizes, spacing, subStyle } from '@/theme';
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
  /** Opens screen 3h to connect (or review) the calendars this search reads from - the
   * destination the "Change" row below did not have until this task. */
  onChangeCalendars: () => void;
}

/**
 * Screen 3c: "Step 2: when + how long, and where availability comes from". A quick-choice
 * row, a 7-day strip, a daytime/evening/any-time segment, duration chips, and a read-only
 * summary of which calendars feed the next screen's availability search.
 *
 * "Using Google · Personal, Work" stays presentational - there is still no live binding from
 * this summary line to the real per-calendar settings (`src/features/calendars`), only to
 * what the fixture already said here; wiring the two together was out of scope for closing
 * the dead end below (see this task's report, "ambiguity calls"). "Change" is no longer
 * inert, though: it now opens screen 3h (`/settings/calendars/connect`) - "asked in context",
 * exactly the screen this affordance existed to reach once a destination existed.
 */
export function WhenScreen({ onBack, onNext, onChangeCalendars }: WhenScreenProps) {
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
            <Pressable
              onPress={onChangeCalendars}
              accessibilityRole="button"
              accessibilityLabel="Change calendars"
              hitSlop={8}
              style={{ minHeight: sizes.minTouchTarget, justifyContent: 'center' }}
            >
              <Text style={{ fontSize: 13, color: colors.accent[700] }}>Change</Text>
            </Pressable>
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
