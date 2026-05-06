export { Colors, default as colors } from './colors';
export { Typography, TextStyles } from './typography';

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  round: 999,
};

export const Shadows = {
  small: {
    boxShadow: '0 2px 4px rgba(139, 91, 41, 0.08)',
    elevation: 2,
  },
  medium: {
    boxShadow: '0 4px 8px rgba(139, 91, 41, 0.12)',
    elevation: 4,
  },
  large: {
    boxShadow: '0 8px 16px rgba(139, 91, 41, 0.15)',
    elevation: 8,
  },
};
