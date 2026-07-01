import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography } from '../styles/GlobalStyles';
import { getInitials, getAvatarColor } from '../utils/playerAvatar';

const SIZES = {
  xs: { box: 24, fontSize: 10 },
  sm: { box: 32, fontSize: 12 },
  md: { box: 40, fontSize: 14 },
  lg: { box: 56, fontSize: 20 },
  xl: { box: 72, fontSize: 26 },
};

export default function PlayerAvatar({
  player,
  name: nameProp,
  color: colorProp,
  size = 'md',
  selected = false,
  style,
}) {
  const name = nameProp || player?.name || '';
  const color = getAvatarColor(name, colorProp || player?.color);
  const cfg = SIZES[size] || SIZES.md;
  const initials = getInitials(name);

  return (
    <View
      style={[
        styles.avatar,
        {
          width: cfg.box,
          height: cfg.box,
          borderRadius: cfg.box / 2,
          backgroundColor: color,
        },
        selected && styles.selected,
        style,
      ]}
    >
      <Text style={[styles.initials, { fontSize: cfg.fontSize }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    ...Typography.button,
    color: Colors.textPrimary,
    fontWeight: '800',
  },
  selected: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
});
