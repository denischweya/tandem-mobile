import { Pressable, Text, View } from 'react-native';
import { colors, radii, shadows, sizes, spacing } from '@/theme';

export interface SegmentedControlOption {
  id: string;
  label: string;
}

export interface SegmentedControlProps {
  options: SegmentedControlOption[];
  selectedId: string;
  onSelect: (id: string) => void;
  /** What a screen reader announces for the control as a whole (its individual segments are
   * also independently focusable buttons, each announcing its own label and selected state). */
  accessibilityLabel: string;
}

/**
 * The reference's time-of-day segmented control ("Daytime" / "Evening" / "Any time") - an
 * even-width row of options on a tinted track, with the selected option raised on a white
 * pill with a shadow. Generic over option count/labels so a later screen can reuse it for any
 * same-row, pick-exactly-one control.
 *
 * The reference draws each segment at 38px tall, short of the 44pt touch-target floor (hard
 * constraint #5) - `hitSlop` tops the tappable area up to 44px vertically without resizing the
 * segment.
 */
export function SegmentedControl({
  options,
  selectedId,
  onSelect,
  accessibilityLabel,
}: SegmentedControlProps) {
  const verticalHitSlop = Math.ceil((sizes.minTouchTarget - sizes.segmentHeight) / 2);

  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
      style={{
        flexDirection: 'row',
        backgroundColor: colors.neutral[100],
        borderRadius: radii.pill,
        padding: spacing.xxs,
        gap: spacing.xxs,
      }}
    >
      {options.map((option) => {
        const selected = option.id === selectedId;
        return (
          <Pressable
            key={option.id}
            onPress={() => onSelect(option.id)}
            accessibilityRole="tab"
            accessibilityLabel={option.label}
            accessibilityState={{ selected }}
            hitSlop={{ top: verticalHitSlop, bottom: verticalHitSlop }}
            style={[
              {
                flex: 1,
                height: sizes.segmentHeight,
                borderRadius: radii.pill,
                alignItems: 'center',
                justifyContent: 'center',
              },
              selected ? { backgroundColor: colors.bg, ...shadows.sm } : null,
            ]}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: selected ? '600' : '500',
                color: selected ? colors.text : colors.neutral[700],
              }}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
