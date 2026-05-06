import { StyleSheet } from 'react-native';

export const Typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },

  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    xxxl: 30,
    hero: 36,
  },

  weights: {
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
    extraBold: '800',
  },

  lineHeights: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
};

export const TextStyles = StyleSheet.create({
  hero: {
    fontSize: Typography.sizes.hero,
    fontWeight: Typography.weights.bold,
    lineHeight: Typography.sizes.hero * Typography.lineHeights.tight,
  },
  h1: {
    fontSize: Typography.sizes.xxxl,
    fontWeight: Typography.weights.bold,
    lineHeight: Typography.sizes.xxxl * Typography.lineHeights.tight,
  },
  h2: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    lineHeight: Typography.sizes.xxl * Typography.lineHeights.tight,
  },
  h3: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.semiBold,
    lineHeight: Typography.sizes.xl * Typography.lineHeights.normal,
  },
  body: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.regular,
    lineHeight: Typography.sizes.md * Typography.lineHeights.relaxed,
  },
  bodyMedium: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
    lineHeight: Typography.sizes.md * Typography.lineHeights.normal,
  },
  caption: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.regular,
    lineHeight: Typography.sizes.sm * Typography.lineHeights.normal,
  },
  label: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semiBold,
    lineHeight: Typography.sizes.sm * Typography.lineHeights.normal,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  small: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.regular,
    lineHeight: Typography.sizes.xs * Typography.lineHeights.normal,
  },
});

export default Typography;
