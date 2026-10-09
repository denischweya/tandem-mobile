import { Pressable, View } from 'react-native';
import { colors, radii, shadows, sizes } from '@/theme';

export interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  accessibilityLabel: string;
  /** Renders the track dimmed (the reference's `opacity:.45`) and ignores presses. Added for
   * screen 3i's calendars whose account has lapsed ("Sign in again") - there is nothing valid
   * to toggle until the account is reauthenticated, so the control must not look selectable,
   * not just look unselected. */
  disabled?: boolean;
}

/**
 * The reference's `.tg`/`.tg.on` sliding toggle - screen 3f's "Remind me" master switch. No
 * existing component covers this shape (`SelectCircle` is a circular check mark, not a
 * sliding track), so this is a new, generic primitive: it carries no "reminder" knowledge of
 * its own, only an on/off value and a change handler.
 *
 * The reference draws this at 44x26, short of the 44pt touch-target floor on its vertical
 * axis (hard constraint #5) - `hitSlop` tops the tappable area up to 44px vertically without
 * resizing the track, the same technique `SegmentedControl` uses for its own under-height row.
 */
export function Switch({
  value,
  onValueChange,
  accessibilityLabel,
  disabled = false,
}: SwitchProps) {
  const verticalHitSlop = Math.ceil((sizes.minTouchTarget - sizes.toggleTrackHeight) / 2);
  const thumbInset = 3;

  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: value, disabled }}
      hitSlop={{ top: verticalHitSlop, bottom: verticalHitSlop, left: 8, right: 8 }}
      style={{
        width: sizes.toggleTrackWidth,
        height: sizes.toggleTrackHeight,
        borderRadius: radii.pill,
        backgroundColor: value ? colors.accent2[500] : colors.neutral[300],
        justifyContent: 'center',
        opacity: disabled ? 0.45 : 1,
      }}
    >
      <View
        style={[
          {
            position: 'absolute',
            top: thumbInset,
            left: value ? sizes.toggleTrackWidth - sizes.toggleThumb - thumbInset : thumbInset,
            width: sizes.toggleThumb,
            height: sizes.toggleThumb,
            borderRadius: sizes.toggleThumb / 2,
            backgroundColor: colors.bg,
          },
          shadows.sm,
        ]}
      />
    </Pressable>
  );
}
