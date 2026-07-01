import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography } from '../styles/GlobalStyles';

const SIZES = {
  sm: { shotSize: 18, matSize: 18, gap: 0 },
  md: { shotSize: 26, matSize: 26, gap: 0 },
  lg: { shotSize: 36, matSize: 36, gap: 0 },
  xl: { shotSize: 44, matSize: 44, gap: 0 },
};

export default function AppLogo({ size = 'md', variant = 'default' }) {
  const cfg = SIZES[size] || SIZES.md;
  const matColor = variant === 'premium' ? Colors.primaryLight : Colors.primary;

  return (
    <View style={styles.row}>
      <Text style={[styles.shot, { fontSize: cfg.shotSize }]}>Shot</Text>
      <Text style={[styles.mat, { fontSize: cfg.matSize, color: matColor }]}>Mat</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  shot: {
    ...Typography.h2,
    color: Colors.textPrimary,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  mat: {
    ...Typography.h2,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
