import { StyleSheet } from 'react-native';

export const Colors = {
  background: '#0A0A0A',
  surface: '#1A1A1A',
  card: '#242424',
  cardElevated: '#2E2E2E',
  primary: '#F5C518',
  primaryDark: '#D4A800',
  primaryLight: '#FFD740',
  danger: '#E63946',
  dangerDark: '#C0303C',
  success: '#2DC653',
  textPrimary: '#FFFFFF',
  textSecondary: '#AAAAAA',
  textMuted: '#666666',
  border: '#2A2A2A',
  borderLight: '#3A3A3A',
  overlay: 'rgba(0,0,0,0.7)',
  groupType: '#4A90D9',
  personalType: '#E8A838',
  dareType: '#E63946',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  full: 999,
};

export const Typography = {
  h1: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  h4: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  bodyMedium: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    color: Colors.textMuted,
    lineHeight: 16,
  },
  button: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  buttonSmall: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  questionText: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: 32,
    textAlign: 'center',
  },
};

export const Shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  modal: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  primary: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
};

export const Layout = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  screenPadded: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.md,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.card,
  },
  cardElevated: {
    backgroundColor: Colors.cardElevated,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.modal,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.sm,
  },
});

export const Buttons = StyleSheet.create({
  primary: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.primary,
  },
  primaryText: {
    ...Typography.button,
    color: Colors.background,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: {
    ...Typography.button,
    color: Colors.primary,
  },
  danger: {
    backgroundColor: Colors.danger,
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerText: {
    ...Typography.button,
    color: Colors.textPrimary,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostText: {
    ...Typography.buttonSmall,
    color: Colors.textSecondary,
  },
});

export const TypeColors = {
  group: Colors.groupType,
  personal: Colors.personalType,
  dare: Colors.dareType,
};

export const Gradients = {
  warmHeader: ['#1A1200', Colors.background],
  shareCard: ['#1A1200', Colors.background, Colors.background],
  premiumHero: ['#2A1800', '#1A1200', Colors.background],
  primaryButton: [Colors.primary, Colors.primaryDark],
};
