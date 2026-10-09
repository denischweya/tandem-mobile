import type { ReactNode } from 'react';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radii, shadows, sizes } from '@/theme';
import type { ButtonVariant } from './Button';

export interface IconButtonProps {
  icon: ReactNode;
  onPress: () => void;
  variant?: ButtonVariant;
  accessibilityLabel: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * A square, icon-only sibling of `Button` - the reference's `.sbtn` used with no text, next to
 * the primary "Next" pill on screen 3b (an icon-only action has no visible label to fall back
 * on, so `accessibilityLabel` is required rather than optional here, unlike `Button`'s). Same
 * two variants, same 44pt-floor rule.
 */
export function IconButton({
  icon,
  onPress,
  variant = 'secondary',
  accessibilityLabel,
  style,
}: IconButtonProps) {
  const backgroundColor = variant === 'primary' ? colors.accent[500] : colors.accent2[100];

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        {
          width: sizes.fabHeight,
          height: sizes.fabHeight,
          minWidth: sizes.minTouchTarget,
          minHeight: sizes.minTouchTarget,
          borderRadius: radii.pill,
          backgroundColor,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed ? 0.85 : 1,
          ...shadows.sm,
        },
        style,
      ]}
    >
      {icon}
    </Pressable>
  );
}
