// Verbatim transcription of the design handoff's CSS custom properties
// (`design-3a-reference.md`, "Design tokens" section). Every colour used by a screen must
// resolve through this module rather than a hardcoded hex literal, so that a future palette
// change is a one-file edit.
//
// Naming mirrors the source custom properties: `--color-accent-500` is `colors.accent[500]`,
// `--color-neutral-400` is `colors.neutral[400]`, and so on. `accent` is the brief's primary
// pink; `accent2` is the secondary purple (the CSS source's `--color-accent-2-*`).

export const colors = {
  bg: '#ffffff',
  surface: '#faf5f7',
  text: '#2a1a26',

  neutral: {
    100: '#faf4f7',
    200: '#f3e9ee',
    300: '#e7d9e0',
    400: '#cdb9c3',
    500: '#a8929d',
    600: '#85707b',
    700: '#66535d',
    800: '#4a3a43',
    900: '#2f222a',
  },

  // Bright pink. Primary: main buttons, selections, "needs you".
  accent: {
    100: '#ffeef5',
    200: '#ffd6e7',
    300: '#ffadcf',
    400: '#ff6fa8',
    500: '#ec1c7f',
    600: '#cc0f6b',
    700: '#a80c58',
    800: '#7f0943',
    900: '#55062d',
  },

  // Purple. Secondary: secondary buttons, active chips, "free" and "confirmed".
  accent2: {
    100: '#f4edff',
    200: '#e6d7ff',
    300: '#ccafff',
    400: '#a97cff',
    500: '#8a3ffc',
    600: '#7226e6',
    700: '#5b1bbd',
    800: '#43148c',
    900: '#2d0d5e',
  },
} as const;

export type ColorScale = typeof colors.neutral;
export type NeutralShade = keyof ColorScale;
