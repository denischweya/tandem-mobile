import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Avatar,
  Button,
  LockIcon,
  ResponsiveContainer,
  SelectCircle,
  StatusDot,
  StepHeader,
  describeAvailability,
} from '@/components';
import { colors, fontSize, headingStyle, radii, sizes, spacing, subStyle } from '@/theme';
import {
  formatClockTime,
  formatPlanDate,
  formatTimeRange,
  formatWeekdayAbbr,
} from '../home/formatting';
import {
  CANDIDATE_SLOTS,
  DURATION_OPTIONS,
  ORGANIZER_ID,
  PEOPLE,
  PLAN_CATEGORIES,
  QUICK_CHOICES,
  TIME_OF_DAY_OPTIONS,
} from './fixtures';
import { usePlanDraftStore } from './planDraftStore';
import {
  computeBlockingPeople,
  formatCompactAvailabilitySummary,
  formatTopAvailabilitySummary,
  rankCandidates,
  slotAvailabilityByPerson,
  type RankedSlot,
} from './ranking';

export interface BestTimesScreenProps {
  onBack: () => void;
  /** "Confirm" - called with the selected candidate's slot id, so the caller (the route in
   * `app/make-a-plan/best-times.tsx`) can carry it to screen 3f (`/plan/confirm`) via
   * `usePlanDraftStore`'s `confirmedSlotId`. */
  onConfirm: (slotId: string) => void;
  /** "Let everyone vote" - takes no slot id: screen 3e is reached from here but renders its
   * own independent mocked poll rather than a live transformation of the ranked candidates
   * (see `VotingScreen`'s header comment for why). */
  onVote: () => void;
}

/** "evenings" for the segmented "Evening" choice, matching the reference's summary line
 * exactly; the other two options already read naturally as-is. */
function timeOfDaySummaryLabel(label: string): string {
  return label === 'Evening' ? 'evenings' : label.toLowerCase();
}

/** "Confirm Sat, 7 PM" - the reference's exact phrasing, built from the selected slot's own
 * start time rather than hand-typed, so it always matches whichever slot is actually
 * selected. */
function confirmButtonLabel(ranked: RankedSlot): string {
  return `Confirm ${formatWeekdayAbbr(ranked.slot.start, ranked.slot.timeZone)}, ${formatClockTime(
    ranked.slot.start,
    ranked.slot.timeZone,
  )}`;
}

/**
 * Screen 3d: "Best times: ranked, free/maybe/busy only, confirm or vote". Renders
 * `rankCandidates`'s output - the top slot gets the reference's highlighted card (a bordered
 * outline, a fraction badge, a named avatar row, and the one `insight` string the fixture
 * carries); every other slot gets the compact "N free[ · Name status]" row. Tapping any row
 * selects it as the one "Confirm" would act on.
 *
 * Privacy invariant (hard constraint #6): nothing rendered here is a reason. Every per-person
 * detail is a `free`/`maybe`/`busy` word (via `StatusDot`/`describeAvailability`, so it is
 * never colour-only either - hard constraint #5), and `slot.insight` - the only free-text
 * field in play - describes the *slot* ("...usually meet on Saturday evenings"), never why a
 * person is unavailable. The reference's own footer line ("Only free, maybe or busy is
 * shared. Never event details.") is rendered verbatim as a real, standing confirmation of
 * that rule, not just a design note.
 */
export function BestTimesScreen({ onBack, onConfirm, onVote }: BestTimesScreenProps) {
  const insets = useSafeAreaInsets();
  const categoryId = usePlanDraftStore((s) => s.categoryId);
  const quickChoiceId = usePlanDraftStore((s) => s.quickChoiceId);
  const timeOfDayId = usePlanDraftStore((s) => s.timeOfDayId);
  const durationId = usePlanDraftStore((s) => s.durationId);
  const attendees = usePlanDraftStore((s) => s.attendees);

  const blockingPeople = computeBlockingPeople(attendees, ORGANIZER_ID);
  const ranked = rankCandidates(CANDIDATE_SLOTS, blockingPeople, PEOPLE);
  const topSlot = ranked[0];

  const [selectedSlotId, setSelectedSlotId] = useState<string | undefined>(topSlot?.slot.id);
  const selected = ranked.find((r) => r.slot.id === selectedSlotId) ?? topSlot;

  const categoryLabel = PLAN_CATEGORIES.find((c) => c.id === categoryId)?.label ?? 'Plan';
  const quickChoiceLabel = QUICK_CHOICES.find((c) => c.id === quickChoiceId)?.label ?? '';
  const timeOfDayLabel = TIME_OF_DAY_OPTIONS.find((t) => t.id === timeOfDayId)?.label ?? '';
  const durationLabel = DURATION_OPTIONS.find((d) => d.id === durationId)?.label ?? '';
  // Matches screen 3b's "Next · N people" exactly - the invite list, not counting the
  // organiser (who never appears in that list either). This is a different count from
  // `blockingPeople.length`: the two happen to agree in the default fixture (Mike is
  // invited-but-non-blocking, the organiser is blocking-but-not-invited - they cancel out),
  // but they measure different things and shouldn't be conflated.
  const invitedCount = attendees.filter((a) => a.included).length;

  const subtitle = [
    categoryLabel,
    `${quickChoiceLabel}, ${timeOfDaySummaryLabel(timeOfDayLabel)}`,
    durationLabel,
    `${invitedCount} people`,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <ResponsiveContainer>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + spacing.xl,
          paddingHorizontal: spacing.xxxl,
          gap: spacing.lg,
          paddingBottom: spacing.huge,
        }}
      >
        <StepHeader leadingIcon="back" onLeadingPress={onBack} totalSteps={3} completedSteps={3} />

        <View style={{ gap: 6 }}>
          <Text accessibilityRole="header" style={headingStyle(32)}>
            Best times
          </Text>
          <Text style={subStyle}>{subtitle}</Text>
        </View>

        <View style={{ gap: spacing.sm }}>
          {ranked.map((candidate) =>
            candidate.rank === 1 ? (
              <TopCandidateCard
                key={candidate.slot.id}
                ranked={candidate}
                blockingPeople={blockingPeople}
                selected={candidate.slot.id === selectedSlotId}
                onSelect={() => setSelectedSlotId(candidate.slot.id)}
              />
            ) : (
              <CompactCandidateRow
                key={candidate.slot.id}
                ranked={candidate}
                selected={candidate.slot.id === selectedSlotId}
                onSelect={() => setSelectedSlotId(candidate.slot.id)}
              />
            ),
          )}
        </View>

        <View
          style={{
            flexDirection: 'row',
            gap: spacing.sm,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <LockIcon size={14} color={colors.neutral[600]} />
          <Text style={[subStyle, { fontSize: 12 }]}>
            Only free, maybe or busy is shared. Never event details.
          </Text>
        </View>
      </ScrollView>

      <View
        style={{
          gap: spacing.md,
          paddingHorizontal: spacing.xxxl,
          paddingBottom: insets.bottom + spacing.xxl,
          paddingTop: spacing.md,
        }}
      >
        <Button
          label={selected ? confirmButtonLabel(selected) : 'Confirm'}
          onPress={() => {
            if (selected) onConfirm(selected.slot.id);
          }}
        />
        <Button label="Let everyone vote" variant="secondary" onPress={onVote} />
      </View>
    </ResponsiveContainer>
  );
}

interface TopCandidateCardProps {
  ranked: RankedSlot;
  blockingPeople: string[];
  selected: boolean;
  onSelect: () => void;
}

function TopCandidateCard({ ranked, blockingPeople, selected, onSelect }: TopCandidateCardProps) {
  const { slot, summary, end } = ranked;
  const dateLabel = formatPlanDate(slot.start, slot.timeZone);
  const timeLabel = formatTimeRange(slot.start, end, slot.timeZone);
  const perPerson = slotAvailabilityByPerson(slot, blockingPeople);

  const avatarsLabel = perPerson
    .map(
      (p) =>
        `${PEOPLE[p.personId]?.firstName ?? 'Someone'} ${describeAvailability(p.status).label.toLowerCase()}`,
    )
    .join(', ');

  return (
    <View
      accessible
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={`${dateLabel}, ${timeLabel}, ${formatTopAvailabilitySummary(summary)}, ${avatarsLabel}${
        slot.insight ? `, ${slot.insight}` : ''
      }`}
      style={{
        gap: spacing.lg,
        padding: spacing.xl,
        borderRadius: radii.card,
        backgroundColor: colors.bg,
        borderWidth: 2,
        borderColor: colors.text,
      }}
    >
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}
      >
        <View style={{ gap: 2 }}>
          <Text style={headingStyle(fontSize.cardTitle)}>{dateLabel}</Text>
          <Text style={{ fontSize: 15, color: colors.text }}>{timeLabel}</Text>
        </View>
        <SelectCircle
          checked={selected}
          size={sizes.selectCircleLg}
          onPress={onSelect}
          accessibilityLabel={`Select ${dateLabel}, ${timeLabel}`}
        />
      </View>

      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <View style={{ flexDirection: 'row', gap: spacing.xs }}>
          {perPerson.map((p) => {
            const person = PEOPLE[p.personId];
            if (!person) return null;
            return (
              <Avatar
                key={p.personId}
                label={person.initials}
                size={sizes.avatarXs}
                backgroundColor={person.avatarColor}
                textColor={person.avatarTextColor}
                status={p.status}
                statusDotSize={sizes.statusDotXs}
                decorative
              />
            );
          })}
        </View>
        <Text style={{ fontWeight: '600', color: colors.accent2[700] }}>
          {formatTopAvailabilitySummary(summary)}
        </Text>
      </View>

      {slot.insight ? (
        <Text
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={[subStyle, { lineHeight: 18 }]}
        >
          {slot.insight}
        </Text>
      ) : null}
    </View>
  );
}

interface CompactCandidateRowProps {
  ranked: RankedSlot;
  selected: boolean;
  onSelect: () => void;
}

function CompactCandidateRow({ ranked, selected, onSelect }: CompactCandidateRowProps) {
  const { slot, summary } = ranked;
  const dateLabel = formatPlanDate(slot.start, slot.timeZone);
  const startLabel = formatClockTime(slot.start, slot.timeZone);
  const summaryText = formatCompactAvailabilitySummary(summary);

  return (
    <View
      accessible
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={`${dateLabel}, ${startLabel}, ${summaryText}`}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.xl,
        borderRadius: radii.card,
        backgroundColor: colors.neutral[100],
        gap: spacing.md,
      }}
    >
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={{ flex: 1, gap: 4 }}
      >
        <Text style={{ fontWeight: '600', color: colors.text }}>
          {dateLabel} · {startLabel}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          {Array.from({ length: summary.freeCount }, (_, index) => (
            <StatusDot
              key={`free-${index}`}
              status="free"
              size={8}
              borderColor={colors.neutral[100]}
            />
          ))}
          {summary.exceptions.map((exception) => (
            <StatusDot
              key={exception.personId}
              status={exception.status}
              size={8}
              borderColor={colors.neutral[100]}
            />
          ))}
          <Text style={[subStyle, { marginLeft: 6 }]}>{summaryText}</Text>
        </View>
      </View>
      <SelectCircle
        checked={selected}
        onPress={onSelect}
        accessibilityLabel={`Select ${dateLabel}, ${startLabel}`}
      />
    </View>
  );
}
