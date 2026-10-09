// The reference's gap/padding literals, named rather than restated as raw numbers wherever
// they recur across components (`.row` gap, card padding, avatar stack overlap, etc).
export const spacing = {
  xxs: 4,
  xs: 6,
  sm: 8,
  md: 12,
  lg: 14,
  xl: 18,
  xxl: 20,
  xxxl: 24,
  xxxxl: 28,
  huge: 32,
} as const;

export const radii = {
  sm: 8,
  card: 28,
  pill: 999,
  circle: 999,
} as const;

// Fixed sizes called out by the reference's component CSS (`.av`, `.sd`, `.pbtn`, `.tabbar`).
export const sizes = {
  avatarSm: 36,
  avatarLg: 52,
  statusDot: 12,
  statusDotLg: 14,
  chevronIcon: 18,
  checkIcon: 16,
  plusIcon: 20,
  tabIcon: 24,
  fabHeight: 52,
  tabBarHeight: 84,
  avatarStackOverlap: 10,
  minTouchTarget: 44,
} as const;
