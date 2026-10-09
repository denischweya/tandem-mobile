import type { ViewStyle } from 'react-native';
import { colors } from './colors';

// Source: `--shadow-sm/md/lg` in the design reference, each `0 Ypx BLURpx rgba(236,28,127,A)`.
// React Native has no CSS `box-shadow`; the closest cross-platform shape is the
// shadowColor/shadowOffset/shadowOpacity/shadowRadius quartet, which react-native-web
// translates back into a real `box-shadow` on web and which iOS honours natively.
// `elevation` is Android's equivalent (it has no blur/spread of its own), approximated from
// the same Y offset the CSS uses.
function shadow(
  offsetY: number,
  blurRadius: number,
  opacity: number,
  elevation: number,
): ViewStyle {
  return {
    shadowColor: colors.accent[500],
    shadowOffset: { width: 0, height: offsetY },
    shadowOpacity: opacity,
    shadowRadius: blurRadius,
    elevation,
  };
}

export const shadows = {
  sm: shadow(1, 3, 0.1, 2),
  md: shadow(8, 24, 0.14, 8),
  lg: shadow(20, 48, 0.18, 16),
} as const;
