import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Avatar,
  ChatIcon,
  CheckIcon,
  ChevronLeftIcon,
  ResponsiveContainer,
  ShareIcon,
  Tag,
  WarningIcon,
} from '@/components';
import {
  colors,
  fontSize,
  headingStyle,
  labelStyle,
  radii,
  sizes,
  spacing,
  subStyle,
} from '@/theme';
import { formatHeaderDate, formatTimeRange } from '../home/formatting';
import { countFailedSyncs, retryCalendarSync } from './calendar';
import { getPlanDetail, REMINDER_OPTIONS, type CalendarSyncEntry } from './fixtures';
import { formatReminderLine } from './reminders';

export interface PlanDetailScreenProps {
  planId: string;
  onBack: () => void;
}

interface SecondaryPillButtonProps {
  label: string;
  onPress: () => void;
  textColor?: string;
}

/**
 * The reference's `.sbtn` pill for this screen's two bottom actions - light accent2 fill with
 * accent2-dark text, and (on "Cancel plan" only) a pink text override. Not the existing
 * `Button` component's `secondary` variant: that one renders a solid accent2-500 fill with
 * white text (matching the design this app's 3d screen already shipped with), which is a
 * different look from this screen's reference markup, and `Button`'s text colour is not
 * overridable via its `style` prop (only the container is). Rather than change `Button`'s own
 * secondary styling - which 3d already depends on - this is a small, local, one-off pill,
 * the same "build a local subcomponent when the shared primitive doesn't quite fit" choice
 * `BestTimesScreen`'s `TopCandidateCard`/`CompactCandidateRow` already make.
 */
function SecondaryPillButton({ label, onPress, textColor }: SecondaryPillButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => ({
        flex: 1,
        minHeight: sizes.minTouchTarget,
        height: 54,
        borderRadius: radii.pill,
        backgroundColor: colors.accent2[100],
        alignItems: 'center',
        justifyContent: 'center',
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <Text
        style={{
          fontSize: fontSize.button,
          fontWeight: '600',
          color: textColor ?? colors.accent2[800],
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

interface DisabledHeaderIconProps {
  Icon: typeof ShareIcon;
  accessibilityLabel: string;
}

/** A header icon with no destination in this slice (no share sheet, no plan-chat screen) -
 * rendered disabled rather than wired to nowhere, the same treatment `TabBar` already uses
 * for its own unimplemented destinations. */
function DisabledHeaderIcon({ Icon, accessibilityLabel }: DisabledHeaderIconProps) {
  return (
    <Pressable
      disabled
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: true }}
      style={{
        minWidth: sizes.minTouchTarget,
        minHeight: sizes.minTouchTarget,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon size={sizes.headerActionIcon} color={colors.neutral[400]} />
    </Pressable>
  );
}

/**
 * Screen 3g: "Plan detail: people, calendar sync status (with a fixable failure),
 * reminders." Reached from Home's "Your next plan" card (`PlanCard`'s `onPress`, in
 * `src/features/home/HomeScreen.tsx`) via `app/plan/[id].tsx` - the already-confirmed Dinner
 * plan Home has shown since before this session's make-a-plan flow, not a continuation of
 * whatever was just drafted in 3b/3c/3d (see `fixtures.ts`'s header comment).
 *
 * Sync-failure invariant (hard constraint #4, spec §135): "Couldn't add to Work" / "Google
 * needs you to sign in again" is the entire user-facing message - a friendly, actionable
 * sentence, never a raw backend error code or stack trace - paired with a "Retry" that
 * actually resolves the failure (`retryCalendarSync`), not a label that merely claims to.
 */
export function PlanDetailScreen({ planId, onBack }: PlanDetailScreenProps) {
  const insets = useSafeAreaInsets();
  const plan = getPlanDetail(planId);
  const [calendarSync, setCalendarSync] = useState<CalendarSyncEntry[]>(plan?.calendarSync ?? []);
  const [nudgedIds, setNudgedIds] = useState<string[]>([]);

  if (!plan) {
    return (
      <ResponsiveContainer>
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xxxl }}
        >
          <Text style={subStyle}>This plan isn&apos;t available.</Text>
        </View>
      </ResponsiveContainer>
    );
  }

  const failedCount = countFailedSyncs(calendarSync);

  return (
    <ResponsiveContainer>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: insets.top + spacing.lg,
          paddingHorizontal: spacing.xxxl,
          gap: spacing.xl,
          paddingBottom: spacing.xl,
        }}
      >
        <View
          style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <Pressable
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Back to Home"
            hitSlop={8}
            style={{
              minWidth: sizes.minTouchTarget,
              minHeight: sizes.minTouchTarget,
              justifyContent: 'center',
            }}
          >
            <ChevronLeftIcon size={sizes.flowHeaderIcon} color={colors.text} />
          </Pressable>
          <View style={{ flexDirection: 'row', gap: spacing.xl }}>
            <DisabledHeaderIcon Icon={ShareIcon} accessibilityLabel="Share plan" />
            <DisabledHeaderIcon Icon={ChatIcon} accessibilityLabel="Plan chat" />
          </View>
        </View>

        <View style={{ gap: spacing.sm }}>
          <Tag tone="accent2" label="Confirmed" />
          <Text accessibilityRole="header" style={headingStyle(fontSize.planDetailTitle)}>
            {plan.title}
          </Text>
          <View style={{ gap: 2 }}>
            <Text style={{ fontSize: 17, color: colors.text }}>
              {formatHeaderDate(plan.startsAt, plan.timeZone)}
            </Text>
            <Text style={{ fontSize: 17, color: colors.text }}>
              {formatTimeRange(plan.startsAt, plan.endsAt, plan.timeZone)}
            </Text>
            <Text style={[subStyle, { fontSize: 15 }]}>{plan.locationLabel}</Text>
          </View>
        </View>

        <View>
          <Text style={[labelStyle, { marginBottom: 4 }]}>People</Text>
          {plan.people.map((person) => {
            const isNudged = nudgedIds.includes(person.id);
            return (
              <View
                key={person.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.md,
                  paddingVertical: 9,
                }}
              >
                <Avatar
                  label={person.initials}
                  size={32}
                  backgroundColor={person.avatarColor}
                  textColor={person.avatarTextColor}
                  decorative
                />
                <Text style={{ flex: 1, color: colors.text }}>
                  {person.firstName}
                  {person.roleLabel ? <Text style={subStyle}> · {person.roleLabel}</Text> : null}
                </Text>
                {person.status === 'confirmed' ? (
                  <CheckIcon size={18} color={colors.accent2[700]} />
                ) : isNudged ? (
                  <Text style={[subStyle, { fontWeight: '600' }]}>Nudged</Text>
                ) : (
                  <Pressable
                    onPress={() => setNudgedIds((current) => [...current, person.id])}
                    accessibilityRole="button"
                    accessibilityLabel={`Nudge ${person.firstName}`}
                    hitSlop={8}
                    style={{ minHeight: sizes.minTouchTarget, justifyContent: 'center' }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: '600', color: colors.accent[700] }}>
                      Nudge
                    </Text>
                  </Pressable>
                )}
              </View>
            );
          })}
        </View>

        <View style={{ gap: spacing.sm }}>
          <Text style={labelStyle}>Your calendars</Text>
          {calendarSync.map((entry) =>
            entry.status === 'synced' ? (
              <View
                key={entry.id}
                accessible
                accessibilityLabel={`Added to ${entry.calendarLabel}, ${entry.provider}`}
                style={{ flexDirection: 'row', alignItems: 'center' }}
              >
                <View
                  accessibilityElementsHidden
                  importantForAccessibility="no-hide-descendants"
                  style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 }}
                >
                  <CheckIcon size={18} color={colors.accent2[700]} />
                  <Text style={{ flex: 1, fontSize: 15, color: colors.text }}>
                    Added to {entry.calendarLabel}
                  </Text>
                  <Text style={subStyle}>{entry.provider}</Text>
                </View>
              </View>
            ) : (
              <View
                key={entry.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.md,
                  padding: spacing.lg,
                  borderRadius: 18,
                  backgroundColor: colors.accent[100],
                }}
              >
                <WarningIcon size={18} color={colors.accent[800]} markColor={colors.bg} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: colors.accent[900] }}>
                    Couldn&apos;t add to {entry.calendarLabel}
                  </Text>
                  {entry.failureReason ? (
                    <Text style={{ fontSize: 12, color: colors.accent[800] }}>
                      {entry.failureReason}
                    </Text>
                  ) : null}
                </View>
                <Pressable
                  onPress={() => setCalendarSync((current) => retryCalendarSync(current, entry.id))}
                  accessibilityRole="button"
                  accessibilityLabel={`Retry adding to ${entry.calendarLabel}`}
                  hitSlop={8}
                  style={{
                    minHeight: sizes.minTouchTarget,
                    justifyContent: 'center',
                    paddingHorizontal: 14,
                    borderRadius: 999,
                    backgroundColor: colors.accent[500],
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: '600', color: colors.bg }}>Retry</Text>
                </Pressable>
              </View>
            ),
          )}
          {failedCount === 0 ? (
            <Text style={[subStyle, { fontSize: 12 }]}>Every calendar is up to date.</Text>
          ) : null}
        </View>

        <View style={{ gap: 6 }}>
          <Text style={labelStyle}>Reminders</Text>
          {plan.reminderIds.map((id) => {
            const option = REMINDER_OPTIONS.find((candidate) => candidate.id === id);
            if (!option) return null;
            return (
              <Text key={id} style={{ fontSize: 15, color: colors.text }}>
                {formatReminderLine(plan.startsAt, plan.timeZone, option)}
              </Text>
            );
          })}
        </View>
      </ScrollView>

      <View
        style={{
          flexDirection: 'row',
          gap: spacing.sm,
          paddingHorizontal: spacing.xxxl,
          paddingBottom: insets.bottom + spacing.md,
          paddingTop: spacing.sm,
        }}
      >
        <SecondaryPillButton
          label="Change time"
          // No "change time" flow exists in this slice - same no-op convention as 3b's
          // invite-link button (`WhatWhoScreen.tsx`).
          onPress={() => {}}
        />
        <SecondaryPillButton
          label="Cancel plan"
          onPress={() => {}}
          textColor={colors.accent[800]}
        />
      </View>
    </ResponsiveContainer>
  );
}
