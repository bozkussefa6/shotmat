import React from 'react';
import { View, Text } from 'react-native';
import { Layout } from '../styles/GlobalStyles';

export default function AppToolbar({ left, title, right, titleStyle, style }) {
  return (
    <View style={[Layout.toolbar, style]}>
      <View style={Layout.toolbarSide}>
        {left || null}
      </View>
      <View style={Layout.toolbarCenter}>
        {title != null && title !== '' ? (
          typeof title === 'string' ? (
            <Text style={[Layout.toolbarTitle, titleStyle]} numberOfLines={1}>
              {title}
            </Text>
          ) : (
            title
          )
        ) : null}
      </View>
      <View style={Layout.toolbarSideRight}>
        {right || null}
      </View>
    </View>
  );
}
