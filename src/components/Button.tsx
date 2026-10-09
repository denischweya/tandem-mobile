import type { ReactNode } from 'react';
import { Pressable, Text, type StyleProp, type ViewStyle } from 'react-native';
import { colors, fontSize, radii, shadows, sizes } from '@/theme';

export type ButtonVariant = 'primary' | 'secondary';

export interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: ReactNode;
  /** Defaults to `label` - override when the visible text needs a fuller spoken form. */
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

/** The reference's `.pbtn` pill button (`--color-accent` primary / `--color-accent-2`
 * secondary), generic enough to serve both the floating "Make a plan" action here and any
 * future screen's primary action. Height is pinned at the 44pt accessible minimum even
 * though the reference draws it taller (52-54px) - the token just sets a floor. */
export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  accessibilityLabel,
  style,
}: ButtonProps) {
  const backgroundColor = variant === 'primary' ? colors.accent[500] : colors.accent2[500];

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      style={({ pressed }) => [
        {
          minHeight: sizes.minTouchTarget,
          height: sizes.fabHeight,
          borderRadius: radii.pill,
          backgroundColor,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          paddingHorizontal: 22,
          opacity: pressed ? 0.85 : 1,
          ...shadows.md,
        },
        style,
      ]}
    >
      {icon}
      <Text style={{ color: colors.bg, fontSize: fontSize.button, fontWeight: '600' }}>
        {label}
      </Text>
    </Pressable>
  );
}
