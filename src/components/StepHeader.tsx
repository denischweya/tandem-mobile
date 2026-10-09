import { Pressable, View } from 'react-native';
import { colors, sizes, spacing } from '@/theme';
import { ChevronLeftIcon, CloseIcon } from './icons';

export interface StepHeaderProps {
  /** `close` (an "x") dismisses the whole flow back to wherever it started - the reference
   * uses this only on the flow's first step (3b), where there is no previous step to go back
   * to. `back` (a "<" chevron) returns to the previous step (3c, 3d). */
  leadingIcon: 'close' | 'back';
  onLeadingPress: () => void;
  totalSteps: number;
  /** 1-based: this many of the step bars render filled/dark; the rest render as the
   * unfilled neutral track. */
  completedSteps: number;
}

/**
 * The reference's shared step-flow header: a leading close/back control, a row of step
 * progress bars, and a blank trailing spacer the same width as the leading icon (so the step
 * bars stay visually centred). Used identically across screens 3b/3c/3d - lives in
 * `src/components` rather than the `make-a-plan` feature folder because any future multi-step
 * flow (e.g. onboarding) is this same shape.
 */
export function StepHeader({
  leadingIcon,
  onLeadingPress,
  totalSteps,
  completedSteps,
}: StepHeaderProps) {
  const Icon = leadingIcon === 'close' ? CloseIcon : ChevronLeftIcon;
  const label = leadingIcon === 'close' ? 'Close' : 'Back';

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <Pressable
        onPress={onLeadingPress}
        accessibilityRole="button"
        accessibilityLabel={label}
        hitSlop={8}
        style={{
          minWidth: sizes.minTouchTarget,
          minHeight: sizes.minTouchTarget,
          alignItems: 'flex-start',
          justifyContent: 'center',
        }}
      >
        <Icon size={sizes.flowHeaderIcon} color={colors.text} />
      </Pressable>

      <View
        accessible
        accessibilityLabel={`Step ${completedSteps} of ${totalSteps}`}
        style={{ flexDirection: 'row', gap: spacing.xs }}
      >
        {Array.from({ length: totalSteps }, (_, index) => (
          <View
            key={index}
            style={{
              width: sizes.stepBarWidth,
              height: sizes.stepBarHeight,
              borderRadius: sizes.stepBarHeight / 2,
              backgroundColor: index < completedSteps ? colors.text : colors.neutral[300],
            }}
          />
        ))}
      </View>

      <View style={{ width: sizes.flowHeaderIcon }} />
    </View>
  );
}
