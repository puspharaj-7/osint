import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Colors from '../constants/Colors';

interface Props {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function GlassPanel({ children, style }: Props) {
  return (
    <View style={[styles.panel, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: Colors.dark.panel,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
});
