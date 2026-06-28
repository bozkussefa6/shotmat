import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, Typography } from '../styles/GlobalStyles';

/**
 * Shared screen header with optional back button and subtitle.
 */
export default function ScreenHeader({
  title,
  subtitle,
  onBack,
  right,
  titleStyle,
  style,
}) {
  return (
    <View style={[styles.header, style]}>
      {onBack ? (
        <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={8}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
      ) : (
        <View style={styles.backPlaceholder} />
      )}
      <View style={styles.titleWrap}>
        {title ? (
          <Text style={[styles.title, titleStyle]} numberOfLines={1}>
            {title}
          </Text>
        ) : null}
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right ? <View style={styles.right}>{right}</View> : <View style={styles.backPlaceholder} />}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: 48,
  },
  backBtn: {
    padding: Spacing.xs,
  },
  backPlaceholder: {
    width: 32,
  },
  titleWrap: {
    flex: 1,
    marginHorizontal: Spacing.sm,
  },
  title: {
    ...Typography.h3,
  },
  subtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  right: {
    minWidth: 32,
    alignItems: 'flex-end',
  },
});
