import { Pressable, Text } from 'react-native';
import { colors, fontSize, radii, sizes, spacing } from '@/theme';

export interface ChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  /** Defaults to `label` - override when the visible text needs a fuller spoken form (e.g.
   * "The Boys, 4 people" rather than the chip's own compact "The Boys · 4"). */
  accessibilityLabel?: string;
}

/**
 * The reference's `.chip`/`.chip.on` - a pill-shaped choice used for every single-pick-from-a-
 * row control across screens 3b/3c (plan category, saved group, quick date choice, duration).
 * Generic: it has no opinion on *which* chooser it belongs to, so a screen owns the list of
 * chips and which one is "on".
 *
 * The reference draws this at 36px tall, short of the 44pt accessible touch-target floor
 * (hard constraint #5) - `hitSlop` extends the tappable area by 4px on every side (36 + 4 + 4
 * = 44) without changing the chip's visible size.
 */
export function Chip({ label, selected, onPress, accessibilityLabel }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ selected }}
      hitSlop={4}
      style={({ pressed }) => ({
        height: sizes.chipHeight,
        paddingHorizontal: spacing.xl,
        borderRadius: radii.pill,
        backgroundColor: selected ? colors.accent2[500] : colors.neutral[100],
        alignItems: 'center',
        justifyContent: 'center',
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <Text
        style={{
          fontSize: fontSize.chip,
          fontWeight: '500',
          color: selected ? colors.bg : colors.text,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
