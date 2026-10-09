import type { ReactNode } from 'react';
import { View, Text, Pressable } from 'react-native';
import { colors, sizes, spacing, subStyle } from '@/theme';
import { ChevronRightIcon } from './icons';

export interface ListRowProps {
  /** Decorative leading element (the reference's small pink attention dot on "Needs you"
   * rows). Hidden from assistive tech - the row's own accessibility label carries the
   * meaning, never the dot's colour. */
  leading?: ReactNode;
  title: string;
  subtitle?: string;
  /** Replaces the default trailing chevron when provided. */
  trailing?: ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
}

/** The reference's `.li` row: a generic, reusable list row - no "needs you" domain knowledge
 * lives here, so any future screen's list (Plans, Members, Tasks) can use it unchanged. */
export function ListRow({
  leading,
  title,
  subtitle,
  trailing,
  onPress,
  accessibilityLabel,
}: ListRowProps) {
  const label = accessibilityLabel ?? [title, subtitle].filter(Boolean).join(', ');

  const content = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        minHeight: sizes.minTouchTarget,
        paddingVertical: spacing.md,
      }}
    >
      {leading ? (
        <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          {leading}
        </View>
      ) : null}
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ fontWeight: '600', color: colors.text }}>{title}</Text>
        {subtitle ? <Text style={subStyle}>{subtitle}</Text> : null}
      </View>
      {trailing !== undefined ? (
        trailing
      ) : (
        <ChevronRightIcon size={sizes.chevronIcon} color={colors.neutral[500]} />
      )}
    </View>
  );

  if (!onPress) {
    return (
      <View accessible accessibilityLabel={label}>
        {content}
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
    >
      {content}
    </Pressable>
  );
}
