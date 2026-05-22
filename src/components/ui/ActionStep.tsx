// PulseSense — Action Step Component
// Numbered step for emergency action lists

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { fonts } from '../../constants/typography';
import { colors } from '../../constants/colors';
import { spacing, borderRadius } from '../../constants/spacing';

interface ActionStepProps {
  number: number;
  text: string;
  isLast?: boolean;
}

export function ActionStep({ number, text, isLast = false }: ActionStepProps) {
  return (
    <View style={[styles.container, isLast && styles.lastChild]}>
      <View style={styles.circle}>
        <Text style={styles.number}>{number}</Text>
      </View>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

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
    backgroundColor: colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.space3,
    marginTop: -2,
  },
  number: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    fontFamily: fonts.body,
  },
  text: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
    fontFamily: fonts.body,
  },
});
