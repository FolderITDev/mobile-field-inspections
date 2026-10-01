import { cubicBezier, Easing } from 'react-native-reanimated';

/**
 * Field Inspections design tokens: the field journal.
 * All colors are documented in DESIGN.md; the extra roles below were contrast-checked
 * (control borders ≥ 3:1 on surface, tertiary text ≥ 3.5:1 on canvas).
 * `attention` marks findings and is always paired with an icon and a word.
 */
const light = {
  canvas: '#F3F1E9',
  surface: '#FFFDF8',
  /** Elevated control on a `fill` track, such as a segmented thumb. */
  raised: '#FFFDF8',
  fill: '#E8E6DC',
  ink: '#163330',
  muted: '#53645E',
  tertiary: '#6F7E77',
  accent: '#1D5B4F',
  accentSubtle: '#E1ECE4',
  onAccent: '#FFFFFF',
  attention: '#A44730',
  attentionSubtle: '#F7E4DC',
  rule: '#D3D9CE',
  control: '#7F8E87',
  imageOutline: 'rgba(0, 0, 0, 0.1)',
};

export type Palette = typeof light;

const dark: Palette = {
  canvas: '#111E1C',
  surface: '#1B2B27',
  raised: '#2C4039',
  fill: '#22342F',
  ink: '#EEF4EF',
  muted: '#B5C8BD',
  tertiary: '#86998F',
  accent: '#9CD1B0',
  accentSubtle: '#1E3A30',
  onAccent: '#11241C',
  attention: '#E99C80',
  attentionSubtle: '#3A2620',
  rule: '#3A4D45',
  control: '#6A7F74',
  imageOutline: 'rgba(255, 255, 255, 0.1)',
};

export const palettes = { light, dark } as const;

export const fonts = {
  regular: 'DMSans_400Regular',
  medium: 'DMSans_500Medium',
  semibold: 'DMSans_600SemiBold',
  serif: 'Newsreader_500Medium',
} as const;

/** Open 4-point rhythm. `gutter` is the screen edge inset. */
export const space = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  gutter: 20,
} as const;

/** Continuous 12–16 pt corners for content surfaces; rules do the structure. */
export const radius = {
  sm: 6,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

/**
 * Newsreader is the sparse editorial voice (site names, prompts, numerals);
 * DM Sans carries everything a person reads quickly or acts on.
 */
export const type = {
  display: {
    fontFamily: fonts.serif,
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -0.6,
    maxScale: 1.4,
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: -0.3,
    maxScale: 1.6,
  },
  headline: {
    fontFamily: fonts.semibold,
    fontSize: 17,
    lineHeight: 23,
    letterSpacing: -0.2,
    maxScale: 2,
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0,
    maxScale: 2,
  },
  button: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: -0.1,
    maxScale: 1.6,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: 0,
    maxScale: 2,
  },
  subhead: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0,
    maxScale: 2,
  },
  footnote: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.1,
    maxScale: 2,
  },
  eyebrow: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.8,
    maxScale: 1.8,
  },
  ordinal: {
    fontFamily: fonts.serif,
    fontSize: 22,
    lineHeight: 26,
    letterSpacing: -0.2,
    maxScale: 1.4,
  },
} as const;

export type TypeVariant = keyof typeof type;

/**
 * Motion vocabulary. Only meaningful state changes move: progress, answers,
 * completion. UI motion stays under 300 ms; navigation uses the platform.
 */
export const motion = {
  duration: { press: 120, quick: 160, base: 220, enter: 260, progress: 300 },
  /** For Reanimated CSS transitions (`transitionTimingFunction`). */
  css: {
    easeOut: cubicBezier(0.23, 1, 0.32, 1),
    easeInOut: cubicBezier(0.77, 0, 0.175, 1),
  },
  /** For layout animations and `withTiming`. */
  easing: {
    easeOut: Easing.bezier(0.23, 1, 0.32, 1),
    easeInOut: Easing.bezier(0.77, 0, 0.175, 1),
  },
  pressScale: 0.97,
} as const;

/** Minimum comfortable touch target (iOS 44 pt, Android 48 dp). */
export const hitTarget = 48;
