// PulseSense — Pain Slider Component (0-10)
// Color changes live: green (0-3) → amber (4-6) → red (7-10)

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { fonts } from '../../constants/typography';
import { useColors } from '../../hooks/useColors';
import { spacing, borderRadius } from '../../constants/spacing';

interface PainSliderProps {
  value: number;
  onChange: (value: number) => void;
}

const painLabels = [
  'No pain',
  'Barely noticeable',
  'Minor',
  'Noticeable',
  'Moderate',
  'Moderately strong',
  'Moderately stronger',
  'Strong',
  'Very strong',
  'Severe',
  'Worst possible',
];

const painDescriptions = [
  'No discomfort at all',
  'Very mild, rarely think about it',
  'Annoying, occasional sharp moments',
  'Distracting, can get used to it',
  'Ignorable during activity, still distracting',
  'Cannot ignore beyond a few minutes',
  'Avoiding normal activities, concentration affected',
  'Prevents normal activities',
  'Hard to do anything',
  'Cannot carry on a conversation',
  'Unbearable',
];

function getPainColor(level: number, c: ReturnType<typeof useColors>): string {
  if (level <= 3) return c.success;
  if (level <= 6) return c.warning;
  return c.danger;
}

export const PainSlider = React.memo(function PainSlider({ value, onChange }: PainSliderProps) {
  const c = useColors();
  const color = getPainColor(value, c);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.label, { color: c.textSecondary }]}>Pain Level</Text>
        <Text style={[styles.level, { color }]}>{value}/10</Text>
      </View>
      <View style={styles.descriptorRow}>
        <Text style={[styles.descriptor, { color }]}>{painLabels[value]}</Text>
      </View>
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={10}
        step={1}
        value={value}
        onValueChange={onChange}
        minimumTrackTintColor={color}
        maximumTrackTintColor={c.border}
        thumbTintColor={color}
      />
      <View style={styles.scaleRow}>
        <Text style={[styles.scaleText, { color: c.textDisabled }]}>0</Text>
        <Text style={[styles.scaleText, { color: c.textDisabled }]}>10</Text>
      </View>
      <Text style={[styles.description, { color: c.textSecondary }]}>{painDescriptions[value]}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.space4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.space2,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: fonts.body,
  },
  level: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: fonts.mono,
  },
  descriptorRow: {
    marginBottom: spacing.space2,
  },
  descriptor: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: fonts.body,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  scaleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.space2,
  },
  scaleText: {
    fontSize: 11,
    fontFamily: fonts.body,
  },
  description: {
    fontSize: 11,
    fontStyle: 'italic',
    fontFamily: fonts.body,
  },
});
