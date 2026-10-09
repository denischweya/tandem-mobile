import { Fragment } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeftIcon, PlusIcon, ResponsiveContainer, Switch } from '@/components';
import { colors, fontSize, headingStyle, labelStyle, sizes, spacing, subStyle } from '@/theme';
import type { Calendar, ConnectedCalendarAccount } from './fixtures';
import {
  calendarsForAccount,
  describePermissionToggle,
  isCalendarInactive,
  type CalendarPermissionKind,
} from './permissions';
import { useCalendarSettingsStore } from './store';

export interface CalendarSettingsScreenProps {
  onBack: () => void;
  onConnectAnother: () => void;
}

interface CalendarRowProps {
  calendar: Calendar;
  disabled: boolean;
  onToggle: (kind: CalendarPermissionKind) => void;
}

function CalendarRow({ calendar, disabled, onToggle }: CalendarRowProps) {
  const muted = isCalendarInactive(calendar);

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        minHeight: sizes.minTouchTarget,
      }}
    >
      <Text
        style={{
          flex: 1,
          fontWeight: muted ? '400' : '500',
          color: muted ? colors.neutral[600] : colors.text,
        }}
      >
        {calendar.name}
      </Text>
      <View style={{ width: sizes.toggleTrackWidth, alignItems: 'center' }}>
        <Switch
          value={calendar.permissions.busy}
          onValueChange={() => onToggle('busy')}
          disabled={disabled}
          accessibilityLabel={describePermissionToggle(
            calendar.name,
            'busy',
            calendar.permissions.busy,
          )}
        />
      </View>
      <View style={{ width: sizes.toggleTrackWidth, alignItems: 'center' }}>
        <Switch
          value={calendar.permissions.add}
          onValueChange={() => onToggle('add')}
          disabled={disabled}
          accessibilityLabel={describePermissionToggle(
            calendar.name,
            'add',
            calendar.permissions.add,
          )}
        />
      </View>
    </View>
  );
}

function AccountGroup({
  account,
  calendars,
  onToggle,
  onReauthenticate,
}: {
  account: ConnectedCalendarAccount;
  calendars: Calendar[];
  onToggle: (calendarId: string, kind: CalendarPermissionKind) => void;
  onReauthenticate: () => void;
}) {
  return (
    <View style={{ gap: spacing.xxs }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingVertical: spacing.xs,
        }}
      >
        <Text style={{ fontWeight: '700', color: colors.text }}>{account.providerLabel}</Text>
        {account.needsReauth ? (
          <Pressable
            onPress={onReauthenticate}
            accessibilityRole="button"
            accessibilityLabel={`Sign in again to ${account.providerLabel}`}
            hitSlop={8}
            style={{ minHeight: sizes.minTouchTarget, justifyContent: 'center' }}
          >
            <Text style={{ fontSize: 13, fontWeight: '600', color: colors.accent[700] }}>
              Sign in again
            </Text>
          </Pressable>
        ) : (
          <Text style={subStyle}>{account.identifier}</Text>
        )}
      </View>
      {calendars.map((calendar, index) => (
        <Fragment key={calendar.id}>
          {index > 0 ? <View style={{ height: 1, backgroundColor: colors.neutral[200] }} /> : null}
          <CalendarRow
            calendar={calendar}
            disabled={account.needsReauth ?? false}
            onToggle={(kind) => onToggle(calendar.id, kind)}
          />
        </Fragment>
      ))}
    </View>
  );
}

/**
 * Screen 3i: "Settings: read for free/busy vs. add events, per calendar." Its own standing
 * settings route (`app/settings/calendars/index.tsx`) - reached after connecting a calendar
 * on screen 3h, and the destination its own "Connect another calendar" row sends back to 3h
 * for.
 *
 * Permission invariant (blueprint §27/§28, hard constraint #3): "Busy" and "Add" are rendered
 * and wired as two fully independent `Switch`es per calendar, never one toggle standing in for
 * both - see `./permissions.ts`'s `toggleCalendarPermission`, which only ever writes the one
 * field its caller named. A calendar with neither permission on (`isCalendarInactive`) renders
 * its name muted, derived from its actual permissions rather than a separate flag. An account
 * that has lapsed (`needsReauth`) renders both of its calendars' toggles dimmed and
 * non-interactive via `Switch`'s own `disabled` prop - there is nothing valid to read or write
 * until "Sign in again" clears that flag, and clearing it never itself changes a permission
 * (see `reauthenticateAccount`).
 */
export function CalendarSettingsScreen({ onBack, onConnectAnother }: CalendarSettingsScreenProps) {
  const insets = useSafeAreaInsets();
  const accounts = useCalendarSettingsStore((s) => s.accounts);
  const calendars = useCalendarSettingsStore((s) => s.calendars);
  const togglePermission = useCalendarSettingsStore((s) => s.togglePermission);
  const reauthenticate = useCalendarSettingsStore((s) => s.reauthenticate);

  return (
    <ResponsiveContainer>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + spacing.xl,
          paddingHorizontal: spacing.xxxl,
          paddingBottom: insets.bottom + spacing.xxl,
          gap: spacing.xxl,
        }}
      >
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={8}
          style={{
            minWidth: sizes.minTouchTarget,
            minHeight: sizes.minTouchTarget,
            alignItems: 'flex-start',
            justifyContent: 'center',
          }}
        >
          <ChevronLeftIcon size={sizes.flowHeaderIcon} color={colors.text} />
        </Pressable>

        <View style={{ gap: spacing.xs }}>
          <Text accessibilityRole="header" style={headingStyle(fontSize.heading)}>
            Calendars
          </Text>
          <Text style={subStyle}>
            Choose which calendars show when you&rsquo;re busy, and where plans can be added.
          </Text>
        </View>

        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.xl }}
        >
          <Text
            style={{
              ...labelStyle,
              fontSize: 10,
              width: sizes.toggleTrackWidth,
              textAlign: 'center',
            }}
          >
            Busy
          </Text>
          <Text
            style={{
              ...labelStyle,
              fontSize: 10,
              width: sizes.toggleTrackWidth,
              textAlign: 'center',
            }}
          >
            Add
          </Text>
        </View>

        <View style={{ gap: spacing.xxl }}>
          {accounts.map((account) => (
            <AccountGroup
              key={account.id}
              account={account}
              calendars={calendarsForAccount(calendars, account.id)}
              onToggle={(calendarId, kind) => togglePermission(calendarId, kind)}
              onReauthenticate={() => reauthenticate(account.id)}
            />
          ))}
        </View>

        <Pressable
          onPress={onConnectAnother}
          accessibilityRole="button"
          accessibilityLabel="Connect another calendar"
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
            minHeight: sizes.minTouchTarget,
          }}
        >
          <PlusIcon size={20} color={colors.accent[700]} />
          <Text style={{ color: colors.accent[700], fontWeight: '600', fontSize: fontSize.body }}>
            Connect another calendar
          </Text>
        </Pressable>
      </ScrollView>
    </ResponsiveContainer>
  );
}
