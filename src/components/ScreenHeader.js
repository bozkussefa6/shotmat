import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Layout, Typography } from '../styles/GlobalStyles';

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
    <View style={[Layout.toolbar, style]}>
      <View style={Layout.toolbarSide}>
        {onBack ? (
          <TouchableOpacity onPress={onBack} style={Layout.toolbarAction} hitSlop={8}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
        ) : null}
      </View>
      <View style={Layout.toolbarCenter}>
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
      <View style={Layout.toolbarSideRight}>
        {right || null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    ...Typography.h3,
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
});
