import type { ReactNode } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, CloseIcon, ResponsiveContainer, describeAvailability } from '@/components';
import { colors, fontSize, headingStyle, radii, sizes, spacing, subStyle } from '@/theme';
import { formatTimeRange, formatWeekdayAbbr } from '../home/formatting';
import { PRIVACY_DEMO_EVENT } from './fixtures';
import { useCalendarSettingsStore } from './store';

export interface ConnectCalendarScreenProps {
  /** The close "x" and "I'll enter my availability myself" both decline the connection and
   * return to wherever this screen was opened from - there is nothing left to configure once
   * the user has said no, the same single "leave" destination a cancel and a close share on
   * every other flow in this app. */
  onBack: () => void;
  /** Fires after a provider is (mock-)connected - screen 3i is the only place its permissions
   * can actually be reviewed/changed, so every successful connection continues there. */
  onConnected: () => void;
}

interface LightPillButtonProps {
  label: string;
  onPress: () => void;
}

/**
 * The reference's `.sbtn` pill - light accent2 fill, dark accent2 text. Not `Button`'s own
 * `secondary` variant: that one is a solid accent2-500 fill with white text (matching screens
 * 3d/3e/3f, which already ship with that look), a different pair of colours from this
 * screen's reference markup. Same local-subcomponent choice `PlanDetailScreen`'s
 * `SecondaryPillButton` already makes for the identical mismatch.
 */
function LightPillButton({ label, onPress }: LightPillButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => ({
        minHeight: sizes.minTouchTarget,
        height: sizes.fabHeight,
        borderRadius: radii.pill,
        backgroundColor: colors.accent2[100],
        alignItems: 'center',
        justifyContent: 'center',
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <Text style={{ color: colors.accent2[800], fontSize: fontSize.button, fontWeight: '600' }}>
        {label}
      </Text>
    </Pressable>
  );
}

function PrivacyRow({
  label,
  children,
  isLast,
}: {
  label: string;
  children: ReactNode;
  isLast: boolean;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        paddingVertical: spacing.xl,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: colors.neutral[200],
      }}
    >
      <Text style={{ ...subStyle, fontSize: 11, width: 84 }}>{label}</Text>
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );
}

/**
 * Screen 3h: "Connect a calendar, asked in context, privacy shown not told." Reached from the
 * make-a-plan flow's "Change" affordance (screen 3c, `src/features/makeAPlan/WhenScreen.tsx`)
 * via `app/settings/calendars/connect.tsx`, and again from screen 3i's own "Connect another
 * calendar" row - both land here because both need the same thing: a new calendar connection.
 *
 * Privacy invariant (blueprint §17/§90, hard constraint #1): the "You see"/"Friends see" card
 * is this screen's entire argument, so it is built to actually contrast, not just assert -
 * "You see" renders the real event's title and time (`PRIVACY_DEMO_EVENT.title`, "Dentist");
 * "Friends see" renders only the word "Busy" plus the same time range, with a plain colour
 * dot that is never the only carrier of that meaning (the word "Busy" sits right next to it,
 * same rule as `StatusDot`/`describeAvailability`). There is no path through this component
 * that could put the event's title, or any other detail, into the "Friends see" row - the two
 * rows read from different fields of `PRIVACY_DEMO_EVENT` entirely (the first reads `.title`,
 * the second never does).
 */
export function ConnectCalendarScreen({ onBack, onConnected }: ConnectCalendarScreenProps) {
  const insets = useSafeAreaInsets();
  const connect = useCalendarSettingsStore((s) => s.connect);

  const demoTimeRange = formatTimeRange(
    PRIVACY_DEMO_EVENT.start,
    PRIVACY_DEMO_EVENT.end,
    PRIVACY_DEMO_EVENT.timeZone,
  );
  const demoTimeLine = `${formatWeekdayAbbr(PRIVACY_DEMO_EVENT.start, PRIVACY_DEMO_EVENT.timeZone)} ${demoTimeRange}`;
  const busyAppearance = describeAvailability('busy');

  function handleConnect(provider: 'google' | 'microsoft' | 'apple') {
    connect(provider);
    onConnected();
  }

  return (
    <ResponsiveContainer>
      {/* Scrollable, like every other full-screen flow in this app (`WhenScreen`,
          `WhatWhoScreen`, `ConfirmScreen`...) rather than a fixed `flex:1` column - this
          screen's privacy card plus three buttons is tall enough to clip on a short device or
          at a larger accessibility text size without a scroll fallback. The button stack stays
          a pinned sibling below, matching `WhenScreen`'s own "scrollable content, fixed primary
          action" layout. */}
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + spacing.xl,
          paddingHorizontal: spacing.xxxl,
          gap: spacing.xxxxl,
          paddingBottom: spacing.xl,
        }}
      >
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Close"
          hitSlop={8}
          style={{
            minWidth: sizes.minTouchTarget,
            minHeight: sizes.minTouchTarget,
            alignItems: 'flex-start',
            justifyContent: 'center',
          }}
        >
          <CloseIcon size={sizes.flowHeaderIcon} color={colors.text} />
        </Pressable>

        <View style={{ gap: spacing.md }}>
          <Text accessibilityRole="header" style={headingStyle(fontSize.heading)}>
            Find everyone&rsquo;s free time automatically
          </Text>
          <Text
            style={{
              fontSize: fontSize.connectSubhead,
              lineHeight: fontSize.connectSubhead * 1.45,
              color: colors.neutral[700],
            }}
          >
            Connect your calendar and we&rsquo;ll only check when you&rsquo;re busy.
          </Text>
        </View>

        <View
          style={{
            borderRadius: radii.card,
            backgroundColor: colors.neutral[100],
            paddingHorizontal: spacing.xl,
          }}
        >
          <PrivacyRow label="You see" isLast={false}>
            <Text style={{ fontWeight: '600', color: colors.text }}>
              {PRIVACY_DEMO_EVENT.title}
            </Text>
            <Text style={subStyle}>{demoTimeLine}</Text>
          </PrivacyRow>
          <PrivacyRow label="Friends see" isLast>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <View
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: busyAppearance.color,
                }}
              />
              <View>
                <Text style={{ fontWeight: '600', color: colors.text }}>
                  {busyAppearance.label}
                </Text>
                <Text style={subStyle}>{demoTimeLine}</Text>
              </View>
            </View>
          </PrivacyRow>
        </View>

        <Text style={{ ...subStyle, lineHeight: 20 }}>
          Your friends never see event names, locations or details. You can disconnect anytime and
          we delete what we cached.
        </Text>
      </ScrollView>

      <View
        style={{
          paddingHorizontal: spacing.xxxl,
          paddingBottom: insets.bottom + spacing.xxl,
          paddingTop: spacing.md,
          gap: spacing.md,
        }}
      >
        <Button label="Continue with Google" onPress={() => handleConnect('google')} />
        <LightPillButton
          label="Continue with Microsoft"
          onPress={() => handleConnect('microsoft')}
        />
        <LightPillButton
          label="Use Apple Calendar on this iPhone"
          onPress={() => handleConnect('apple')}
        />
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="I'll enter my availability myself"
          style={{
            minHeight: sizes.minTouchTarget,
            justifyContent: 'center',
            paddingTop: spacing.sm,
          }}
        >
          <Text
            style={{ textAlign: 'center', fontSize: fontSize.body, color: colors.neutral[700] }}
          >
            I&rsquo;ll enter my availability myself
          </Text>
        </Pressable>
      </View>
    </ResponsiveContainer>
  );
}
