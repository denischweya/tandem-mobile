import { Platform, type TextStyle } from 'react-native';
import { colors } from './colors';

// Source: `--font-heading` / `--font-body` in the design reference, plus the `.t`, `.lbl` and
// `.sub` component classes. React Native's StyleSheet has no `font-stretch`, so the
// reference's "SF Pro Display Condensed" cannot be reproduced literally on native - there is
// no condensed system font to name there. The approximation, used only for `heading`, is a
// bold weight with slightly tightened letter-spacing, which reads closer to the reference than
// the unmodified system font would. Android's "sans-serif-condensed" is a real condensed
// family and is used directly. Web keeps the verbatim CSS font stack, condensed and all,
// because the browser can actually render it.
export const fontFamily = {
  heading: Platform.select({
    ios: 'System',
    android: 'sans-serif-condensed',
    default: '-apple-system, BlinkMacSystemFont, "SF Pro Display Condensed", system-ui, sans-serif',
  }),
  body: Platform.select({
    ios: 'System',
    android: 'sans-serif',
    default: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
  }),
} as const;

// Every font-size literal used by screen 3a, named for where it appears rather than for its
// pixel value, so a redesign changes one line instead of a find-and-replace.
export const fontSize = {
  tabLabel: 10,
  label: 12,
  caption: 13,
  chip: 14,
  body: 15,
  button: 17,
  planTitle: 30,
  heading: 34,

  // Added for screens 3b/3c/3d: the "What are you planning?"/"When?"/"Best times" page
  // titles (32), the "Who's coming?"/"How long?" section headings (26), and the 3d
  // top-candidate card's date title (24).
  screenTitle: 32,
  sectionHeading: 26,
  cardTitle: 24,

  // Added for screens 3e/3f/3g: the voting screen's "Football" title (34, same as `heading`
  // - reused, not restated), the confirm sheet's "Dinner is on" headline (28), and the plan
  // detail screen's "Dinner" title (40, bigger than any existing heading so far).
  confirmHeadline: 28,
  planDetailTitle: 40,
} as const;

/** `.t` from the reference: the condensed heading style, parameterised by size. */
export function headingStyle(size: number): TextStyle {
  return {
    fontFamily: fontFamily.heading,
    fontWeight: '700',
    letterSpacing: -0.3,
    lineHeight: size * 1.05,
    color: colors.text,
    fontSize: size,
  };
}

/** `.lbl` from the reference: small uppercase section label. */
export const labelStyle: TextStyle = {
  fontFamily: fontFamily.body,
  fontSize: fontSize.label,
  fontWeight: '600',
  letterSpacing: 0.7,
  textTransform: 'uppercase',
  color: colors.neutral[600],
};

/** `.sub` from the reference: muted secondary line under a title. */
export const subStyle: TextStyle = {
  fontFamily: fontFamily.body,
  fontSize: fontSize.caption,
  color: colors.neutral[600],
};

export const bodyStyle: TextStyle = {
  fontFamily: fontFamily.body,
  fontSize: fontSize.body,
  color: colors.text,
};
