import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Rect, Line } from 'react-native-svg';
import { Colors, Typography } from '../styles/GlobalStyles';
import { APP_NAME } from '../constants/brand';

const SIZES = {
  sm: { box: 32, icon: 28, fontSize: 16, gap: 6 },
  md: { box: 48, icon: 42, fontSize: 22, gap: 8 },
  lg: { box: 96, icon: 88, fontSize: 32, gap: 12 },
};

function ShotGlassMark({ size, variant = 'default' }) {
  const s = size;
  const gold = variant === 'premium' ? Colors.primaryLight : Colors.primary;
  const liquid = Colors.danger;

  return (
    <Svg width={s} height={s} viewBox="0 0 100 100">
      <Rect x="0" y="0" width="100" height="100" rx="22" fill={Colors.background} />
      <Path
        d="M38 18 L62 18 L58 58 Q56 72 50 72 Q44 72 42 58 Z"
        fill="none"
        stroke={gold}
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <Path
        d="M44 58 L56 58 L54 78 Q53 82 50 82 Q47 82 46 78 Z"
        fill={gold}
        opacity={0.35}
      />
      <Rect x="42" y="52" width="16" height="8" rx="2" fill={liquid} opacity={0.9} />
      <Line x1="22" y1="88" x2="78" y2="88" stroke={gold} strokeWidth="3" strokeLinecap="round" opacity={0.6} />
      {variant === 'premium' && (
        <Path
          d="M50 8 L54 16 L62 16 L56 22 L58 30 L50 26 L42 30 L44 22 L38 16 L46 16 Z"
          fill={gold}
        />
      )}
    </Svg>
  );
}

/**
 * AppLogo — brand mark + optional wordmark.
 * Props: size ('sm'|'md'|'lg'), showName, variant ('default'|'premium'|'iconOnly')
 */
export default function AppLogo({ size = 'md', showName = true, variant = 'default' }) {
  const cfg = SIZES[size] || SIZES.md;

  if (variant === 'iconOnly' || !showName) {
    return (
      <View style={styles.iconOnly}>
        <ShotGlassMark size={cfg.box} variant={variant} />
      </View>
    );
  }

  return (
    <View style={[styles.row, { gap: cfg.gap }]}>
      <ShotGlassMark size={cfg.box} variant={variant} />
      <Text style={[styles.name, { fontSize: cfg.fontSize }]}>{APP_NAME}</Text>
    </View>
  );
}

export { ShotGlassMark };

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconOnly: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    ...Typography.h2,
    color: Colors.primary,
    letterSpacing: 1,
    fontWeight: '800',
  },
});
