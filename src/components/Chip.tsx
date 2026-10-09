import { Pressable, Text } from 'react-native';
import { colors, fontSize, radii, sizes, spacing } from '@/theme';

export interface ChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  /** Defaults to `label` - override when the visible text needs a fuller spoken form (e.g.
   * "The Boys, 4 people" rather than the chip's own compact "The Boys · 4"). */
  accessibilityLabel?: string;
  /**
   * Override the selected-state background/text colour pair. Every existing caller (3b/3c's
   * category/group/date/duration pickers) leaves these unset and gets the original
   * accent2-purple/white "on" look unchanged. Added for screen 3e's three-way vote chip
   * (✓/?/✕), which needs `describeAvailability`'s own free/maybe/busy colours rather than one
   * fixed "selected" colour - see hard constraint #1 ("never colour alone") and
   * `src/features/planLifecycle/voting.ts`'s `describeVoteChoice`, which is what supplies
   * these two colours there so the vote chip can never drift from `StatusDot`'s mapping.
   */
  activeBackgroundColor?: string;
  activeTextColor?: string;
  /** Fixed width/height, for the vote chip's square icon-only shape (screen 3e) rather than
   * the default auto-width text pill. */
  size?: number;
}

/**
 * The reference's `.chip`/`.chip.on` - a pill-shaped choice used for every single-pick-from-a-
 * row control across screens 3b/3c (plan category, saved group, quick date choice, duration)
 * and, via `activeBackgroundColor`/`activeTextColor`, screen 3e's vote chip. Generic: it has
 * no opinion on *which* chooser it belongs to, so a screen owns the list of chips and which
 * one is "on".
 *
 * The reference draws this at 36px tall, short of the 44pt accessible touch-target floor
 * (hard constraint #5) - `hitSlop` extends the tappable area by 4px on every side (36 + 4 + 4
 * = 44) without changing the chip's visible size.
 */
export function Chip({
  label,
  selected,
  onPress,
  accessibilityLabel,
  activeBackgroundColor,
  activeTextColor,
  size,
}: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ selected }}
      hitSlop={4}
      style={({ pressed }) => ({
        height: size ?? sizes.chipHeight,
        width: size,
        paddingHorizontal: size ? 0 : spacing.xl,
        borderRadius: radii.pill,
        backgroundColor: selected
          ? (activeBackgroundColor ?? colors.accent2[500])
          : colors.neutral[100],
        alignItems: 'center',
        justifyContent: 'center',
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <Text
        style={{
          fontSize: fontSize.chip,
          fontWeight: '500',
          color: selected ? (activeTextColor ?? colors.bg) : colors.text,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
