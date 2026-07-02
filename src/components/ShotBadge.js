import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { Colors, Typography, BorderRadius, Spacing } from '../styles/GlobalStyles';

/**
 * ShotBadge — unified penalty-point indicator used across all screens.
 *
 * Props:
 *   count    — number of penalty points to display (omit to show icon only)
 *   size     — 'sm' | 'md' | 'lg' | 'xl'  (default: 'md'; xl for decorative card icons)
 *   variant  — 'badge' | 'inline' | 'icon'
 *              badge  : rounded pill with background (for lists/cards)
 *              inline : plain icon + number side by side, no background
 *              icon   : just the icon, no count
 */
export default function ShotBadge({ count, size = 'md', variant = 'badge' }) {
  const cfg = SIZE_CONFIG[size] || SIZE_CONFIG.md;

  if (variant === 'icon') {
    return (
      <MaterialCommunityIcons name="flag" size={cfg.iconSize} color={Colors.danger} />
    );
  }

  if (variant === 'inline') {
    return (
      <View style={styles.inlineRow}>
        <MaterialCommunityIcons name="flag" size={cfg.iconSize} color={Colors.danger} />
        {count !== undefined && (
          <Text style={[styles.inlineCount, { fontSize: cfg.fontSize }]}>{count}</Text>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.badge, cfg.badgePadding]}>
      <MaterialCommunityIcons name="flag" size={cfg.iconSize} color={Colors.danger} />
      {count !== undefined && (
        <Text style={[styles.badgeCount, { fontSize: cfg.fontSize }]}>{count}</Text>
      )}
    </View>
  );
}

const SIZE_CONFIG = {
  sm: { iconSize: 12, fontSize: 12, badgePadding: { paddingHorizontal: 6, paddingVertical: 2 } },
  md: { iconSize: 16, fontSize: 13, badgePadding: { paddingHorizontal: 8, paddingVertical: 3 } },
  lg: { iconSize: 22, fontSize: 16, badgePadding: { paddingHorizontal: 10, paddingVertical: 5 } },
  xl: { iconSize: 36, fontSize: 18, badgePadding: { paddingHorizontal: 12, paddingVertical: 6 } },
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.danger + '22',
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.danger + '66',
  },
  badgeCount: {
    color: Colors.danger,
    fontWeight: '700',
  },
  inlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  inlineCount: {
    color: Colors.danger,
    fontWeight: '700',
  },
});
