import { Pressable, View } from 'react-native';
import { colors, sizes } from '@/theme';
import { CheckIcon } from './icons';

export type SelectCircleTone = 'accent' | 'muted';

export interface SelectCircleProps {
  checked: boolean;
  /** `accent` (pink, the reference's default `.chk.on`) for a selection that counts toward
   * the plan; `muted` (the reference's grey override on 3b's "Optional" row) for one that is
   * included but deliberately played down. Only matters while `checked`. */
  tone?: SelectCircleTone;
  size?: number;
  /** Omit for a locked, display-only mark (3b's "Required"/"Guest" rows, which this UI does
   * not let you uncheck). Provide to make it a toggle (3b's "Optional" row; 3d's slot picker).
   * Explicit `undefined` accepted, not just omission, because callers compute this
   * conditionally - see finding I6, spec §14.1. */
  onPress?: (() => void) | undefined;
  accessibilityLabel: string;
}

/**
 * The reference's `.chk`/`.chk.on` circular mark - used both as a per-member inclusion toggle
 * (screen 3b) and as a candidate-slot picker (screen 3d). Deliberately generic: it carries no
 * "member" or "slot" domain knowledge, only a checked state, a colour tone, and an optional
 * tap handler.
 *
 * The reference draws this at 24-26px, short of the 44pt touch-target floor (hard constraint
 * #5) - `hitSlop` tops the tappable area up to 44px on every side without resizing the mark.
 */
export function SelectCircle({
  checked,
  tone = 'accent',
  size = sizes.selectCircleSm,
  onPress,
  accessibilityLabel,
}: SelectCircleProps) {
  const fillColor = tone === 'accent' ? colors.accent[500] : colors.neutral[500];
  const hitSlop = Math.ceil((sizes.minTouchTarget - size) / 2);

  const mark = (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 2,
        borderColor: checked ? fillColor : colors.neutral[400],
        backgroundColor: checked ? fillColor : 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {checked ? <CheckIcon size={size * 0.54} color={colors.bg} /> : null}
    </View>
  );

  if (!onPress) {
    return (
      <View
        accessible
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ selected: checked }}
      >
        {mark}
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked }}
      hitSlop={hitSlop}
    >
      {mark}
    </Pressable>
  );
}
