import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography } from '../styles/GlobalStyles';
import { APP_NAME } from '../constants/brand';

const SIZES = {
  sm: { fontSize: 18 },
  md: { fontSize: 26 },
  lg: { fontSize: 36 },
  xl: { fontSize: 44 },
};

export default function AppLogo({ size = 'md', variant = 'default' }) {
  const cfg = SIZES[size] || SIZES.md;
  const color = variant === 'premium' ? Colors.primaryLight : Colors.primary;

  return (
    <View style={styles.row}>
      <Text style={[styles.name, { fontSize: cfg.fontSize, color }]}>{APP_NAME}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  name: {
    ...Typography.h2,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
