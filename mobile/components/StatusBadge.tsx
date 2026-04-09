import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  status: string;
}

export function StatusBadge({ status }: Props) {
  const getColor = (s: string) => {
    switch (s.toLowerCase()) {
      case 'active':
      case 'open':
        return { text: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' };
      case 'medium':
      case 'warning':
      case 'high':
        return { text: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' };
      case 'critical':
        return { text: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' };
      case 'completed':
      case 'closed':
        return { text: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' };
      default:
        return { text: '#71717a', bg: 'rgba(113, 113, 122, 0.15)' };
    }
  };

  const { text, bg } = getColor(status);

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color: text }]}>{status.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
