export type ColorPalette = typeof darkColors;

export const darkColors = {
  primary:       '#4361EE',
  primaryLight:  '#7B90F5',
  primaryDark:   '#2D45D4',
  accent:        '#FF9F1C',

  success:       '#2DC653',
  successLight:  '#0D2916',
  error:         '#EF4444',
  errorLight:    '#2A0D0D',
  warning:       '#F59E0B',
  warningLight:  '#2A1F05',

  background:    '#0C0F1D',
  card:          '#151929',
  cardAlt:       '#0F1220',
  overlay:       'rgba(0,0,0,0.65)',

  text:          '#E8EEFF',
  textSecondary: '#7B87B8',
  textLight:     '#454F7A',
  textInverse:   '#0C0F1D',

  border:        '#232B4A',
  borderLight:   '#1A2038',
  inputBg:       '#0F1220',

  navBar:        '#080B16',
  navInactive:   '#3D4870',

  shadow: 'rgba(0,0,0,0.60)',
  white:  '#FFFFFF',
  black:  '#000000',
};

export const lightColors: ColorPalette = {
  primary:       '#4361EE',
  primaryLight:  '#7B90F5',
  primaryDark:   '#2D45D4',
  accent:        '#E8890A',

  success:       '#16A34A',
  successLight:  '#DCFCE7',
  error:         '#DC2626',
  errorLight:    '#FEE2E2',
  warning:       '#D97706',
  warningLight:  '#FEF3C7',

  background:    '#F0F2FA',
  card:          '#FFFFFF',
  cardAlt:       '#F5F7FF',
  overlay:       'rgba(0,0,0,0.35)',

  text:          '#0F1220',
  textSecondary: '#4B5578',
  textLight:     '#8892B0',
  textInverse:   '#FFFFFF',

  border:        '#DDE1F0',
  borderLight:   '#E8ECF8',
  inputBg:       '#F5F7FF',

  navBar:        '#FFFFFF',
  navInactive:   '#8892B0',

  shadow: 'rgba(0,0,0,0.10)',
  white:  '#FFFFFF',
  black:  '#000000',
};

export const oledColors: ColorPalette = {
  ...darkColors,
  background:    '#000000',
  card:          '#0A0A0A',
  cardAlt:       '#050505',
  navBar:        '#000000',
  inputBg:       '#050505',
  border:        '#1A1A2E',
  borderLight:   '#0D0D1A',
};

// Static fallback — keeps existing `import { Colors }` working
export const Colors = darkColors;
