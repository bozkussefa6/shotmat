import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Layout } from '../styles/GlobalStyles';

const DEFAULT_EDGES = ['top', 'left', 'right'];

export default function ScreenSafeArea({ children, edges = DEFAULT_EDGES, style }) {
  const insets = useSafeAreaInsets();

  const safeStyle = {
    paddingTop: edges.includes('top') ? insets.top : 0,
    paddingBottom: edges.includes('bottom') ? insets.bottom : 0,
    paddingLeft: edges.includes('left') ? insets.left : 0,
    paddingRight: edges.includes('right') ? insets.right : 0,
  };

  return (
    <View style={[Layout.screen, safeStyle, style]}>
      {children}
    </View>
  );
}
