import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Button,
  CheckIcon,
  ChevronRightIcon,
  Chip,
  ResponsiveContainer,
  SelectCircle,
  Switch,
} from '@/components';
import {
  colors,
  fontSize,
  headingStyle,
  radii,
  sizes,
  spacing,
  subStyle,
  labelStyle,
} from '@/theme';
import { addMinutes } from '../makeAPlan/dates';
import { CANDIDATE_SLOTS } from '../makeAPlan/fixtures';
import { usePlanDraftStore } from '../makeAPlan/planDraftStore';
import { formatPlanDate, formatTimeRange } from '../home/formatting';
import { defaultCalendarChoice } from './calendar';
import {
  CALENDAR_OPTIONS,
  DEFAULT_SELECTED_REMINDER_IDS,
  PLAN_LOCATION,
  REMINDER_OPTIONS,
  type CalendarChoiceId,
  type ReminderOffsetId,
} from './fixtures';
import { toggleReminder } from './reminders';

export interface ConfirmScreenProps {
  onDone: () => void;
}

/**
 * Screen 3f: "Confirmed: each person picks their own calendar + reminders." Reached from the
 * make-a-plan flow's "Confirm" action (screen 3d, `app/make-a-plan/best-times.tsx`) via
 * `app/plan/confirm.tsx`. Reads the slot the user actually selected from
 * `usePlanDraftStore`'s `confirmedSlotId` (falling back to the first candidate only if that
 * is somehow unset - it is always set by the route just before pushing here) rather than
 * assuming the top-ranked one, so this screen always matches whichever time was really
 * confirmed. The headline ("Dinner is on") is built from the draft's own `planName`, not
 * hard-coded, for the same reason.
 *
 * Calendar-choice invariant (hard constraint #3, blueprint §27 / ADR 0004): the choice below
 * is per-person and explicit - exactly one of *this* person's own calendars (or "Don't add"),
 * picked by *this* person. Nothing here reads or writes another attendee's calendar, and
 * there is no plan-wide "add to everyone's calendar" control anywhere on this screen.
 *
 * Rendered as a normal full-screen push, not a native modal presentation - the reference
 * draws this as a bottom sheet over a dimmed backdrop, but a `transparentModal` presentation
 * behaves inconsistently between Expo Router's web and native renderers for a slice this
 * small to carry the risk of. The sheet's look (dark backdrop, rounded-top sheet anchored to
 * the bottom) is reproduced inside this screen's own layout instead; standard stack back
 * navigation (the hardware/gesture back, or a browser's back button) remains the way out
 * without confirming, matching the reference's own lack of an explicit close affordance.
 */
export function ConfirmScreen({ onDone }: ConfirmScreenProps) {
  const insets = useSafeAreaInsets();
  const planName = usePlanDraftStore((s) => s.planName);
  const confirmedSlotId = usePlanDraftStore((s) => s.confirmedSlotId);

  const [calendarChoice, setCalendarChoice] = useState<CalendarChoiceId>(
    defaultCalendarChoice(CALENDAR_OPTIONS),
  );
  const [remindersOn, setRemindersOn] = useState(true);
  const [selectedReminders, setSelectedReminders] = useState<ReminderOffsetId[]>(
    DEFAULT_SELECTED_REMINDER_IDS,
  );

  const slot =
    CANDIDATE_SLOTS.find((candidate) => candidate.id === confirmedSlotId) ?? CANDIDATE_SLOTS[0];
  if (!slot) return null;

  const end = addMinutes(slot.start, slot.durationMinutes);
  const scheduleLine = `${formatPlanDate(slot.start, slot.timeZone)} · ${formatTimeRange(
    slot.start,
    end,
    slot.timeZone,
  )} · ${PLAN_LOCATION}`;

  return (
    <ResponsiveContainer>
      <View style={{ flex: 1, backgroundColor: colors.neutral[700] }}>
        <View style={{ flex: 1 }} />
        <View
          style={{
            maxHeight: '88%',
            backgroundColor: colors.bg,
            borderTopLeftRadius: 36,
            borderTopRightRadius: 36,
          }}
        >
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              paddingHorizontal: spacing.xxxl,
              paddingTop: spacing.md,
              paddingBottom: insets.bottom + spacing.xxl,
              gap: spacing.xxl,
            }}
          >
            <View
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              style={{
                width: 40,
                height: 5,
                borderRadius: 999,
                backgroundColor: colors.neutral[300],
                alignSelf: 'center',
              }}
            />

            <View style={{ flexDirection: 'row', gap: spacing.xl, alignItems: 'center' }}>
              <View
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 26,
                  backgroundColor: colors.accent2[500],
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CheckIcon size={26} color={colors.bg} />
              </View>
              <View style={{ gap: 2 }}>
                <Text accessibilityRole="header" style={headingStyle(fontSize.confirmHeadline)}>
                  {planName} is on
                </Text>
                <Text style={subStyle}>{scheduleLine}</Text>
              </View>
            </View>

            <View style={{ gap: 4 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={labelStyle}>Add to calendar</Text>
                <Text style={[subStyle, { fontSize: 12 }]}>Last used</Text>
              </View>
              {CALENDAR_OPTIONS.map((option) => {
                const checked = option.id === calendarChoice;
                const label = `${option.label}${option.subtitle ? `, ${option.subtitle}` : ''}${checked ? ', selected' : ''}`;
                return (
                  <Pressable
                    key={option.id}
                    onPress={() => setCalendarChoice(option.id)}
                    accessibilityRole="radio"
                    accessibilityState={{ checked }}
                    accessibilityLabel={label}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: spacing.md,
                      minHeight: sizes.minTouchTarget,
                      paddingVertical: spacing.sm,
                    }}
                  >
                    <View
                      accessibilityElementsHidden
                      importantForAccessibility="no-hide-descendants"
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: spacing.md,
                        flex: 1,
                      }}
                    >
                      <SelectCircle checked={checked} size={22} accessibilityLabel={option.label} />
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontWeight: '600',
                            color: option.id === 'none' ? colors.neutral[700] : colors.text,
                          }}
                        >
                          {option.label}
                        </Text>
                        {option.subtitle ? <Text style={subStyle}>{option.subtitle}</Text> : null}
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>

            <View style={{ gap: spacing.md }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Text style={labelStyle}>Remind me</Text>
                <Switch
                  value={remindersOn}
                  onValueChange={setRemindersOn}
                  accessibilityLabel="Remind me"
                />
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  gap: spacing.sm,
                  flexWrap: 'wrap',
                  opacity: remindersOn ? 1 : 0.4,
                }}
                pointerEvents={remindersOn ? 'auto' : 'none'}
              >
                {REMINDER_OPTIONS.map((option) => {
                  const selected = selectedReminders.includes(option.id);
                  return (
                    <Chip
                      key={option.id}
                      label={option.label}
                      selected={selected}
                      onPress={() =>
                        setSelectedReminders((current) => toggleReminder(current, option.id))
                      }
                      accessibilityLabel={`${option.label} before, ${selected ? 'on' : 'off'}`}
                    />
                  );
                })}
              </View>
              <Text style={subStyle}>Push notifications to this iPhone.</Text>
            </View>

            <View
              accessible
              accessibilityLabel="Event details: title and plan link only, good for shared work calendars. Currently Minimal."
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: spacing.lg,
                borderRadius: radii.card,
                backgroundColor: colors.neutral[100],
              }}
            >
              <View
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
                style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
              >
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={{ fontWeight: '600', fontSize: 14, color: colors.text }}>
                    Event details
                  </Text>
                  <Text style={[subStyle, { fontSize: 12 }]}>
                    Title + plan link only. Good for shared work calendars.
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text style={{ fontSize: 14, color: colors.neutral[700] }}>Minimal</Text>
                  <ChevronRightIcon size={16} color={colors.neutral[700]} />
                </View>
              </View>
            </View>

            <Button label="Done" onPress={onDone} />
          </ScrollView>
        </View>
      </View>
    </ResponsiveContainer>
  );
}
