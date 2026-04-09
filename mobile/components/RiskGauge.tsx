import React from 'react';
import { View, StyleSheet } from 'react-native';

interface Props {
  score: number;
}

export function RiskGauge({ score }: Props) {
  const getRiskColor = (s: number) => {
    if (s >= 70) return '#ef4444'; // critical
    if (s >= 40) return '#f59e0b'; // warning
    return '#10b981'; // safe
  };

  const riskColor = getRiskColor(score);

  return (
    <View style={styles.gaugeContainer}>
      <View style={[styles.gaugeFill, { height: `${score}%`, backgroundColor: riskColor }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  gaugeContainer: {
    width: 6,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  gaugeFill: {
    width: '100%',
    borderRadius: 4,
  },
});
