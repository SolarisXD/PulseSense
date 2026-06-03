// PulseSense — Action Step Component
// Numbered step for emergency action lists

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { fonts } from '../../constants/typography';
import { useColors } from '../../hooks/useColors';
import { spacing, borderRadius } from '../../constants/spacing';

interface ActionStepProps {
  number: number;
  text: string;
  isLast?: boolean;
}

export const ActionStep = React.memo(function ActionStep({ number, text, isLast = false }: ActionStepProps) {
  const c = useColors();

  return (
    <View style={[styles.container, isLast && styles.lastChild]}>
      <View style={[styles.circle, { backgroundColor: c.primarySurface }]}>
        <Text style={[styles.number, { color: c.primary }]}>{number}</Text>
      </View>
      <Text style={[styles.text, { color: c.textPrimary }]}>{text}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.space4,
  },
  lastChild: {
    marginBottom: 0,
  },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.space3,
    marginTop: -2,
  },
  number: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: fonts.body,
  },
  text: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.body,
  },
});
