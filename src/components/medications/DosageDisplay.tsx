// PulseSense — Dosage Display Component
// Renders 1-0-1 with M/A/N labels

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { fonts } from '../../constants/typography';
import { colors } from '../../constants/colors';
import { spacing, borderRadius } from '../../constants/spacing';

interface DosageDisplayProps {
  morning: number;
  afternoon: number;
  night: number;
}

export function DosageDisplay({ morning, afternoon, night }: DosageDisplayProps) {
  return (
    <View style={styles.container}>
      <DosageSlot label="M" active={morning === 1} />
      <Text style={styles.separator}>-</Text>
      <DosageSlot label="A" active={afternoon === 1} />
      <Text style={styles.separator}>-</Text>
      <DosageSlot label="N" active={night === 1} />
    </View>
  );
}

function DosageSlot({ label, active }: { label: string; active: boolean }) {
  return (
    <View style={[styles.slot, active ? styles.slotActive : styles.slotInactive]}>
      <Text style={[styles.slotLabel, active ? styles.slotLabelActive : styles.slotLabelInactive]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  separator: {
    fontSize: 12,
    color: colors.textSecondary,
    marginHorizontal: 2,
    fontFamily: fonts.body,
  },
  slot: {
    width: 22,
    height: 22,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotActive: {
    backgroundColor: colors.primary,
  },
  slotInactive: {
    backgroundColor: colors.borderLight,
  },
  slotLabel: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: fonts.body,
  },
  slotLabelActive: {
    color: '#FFFFFF',
  },
  slotLabelInactive: {
    color: colors.textDisabled,
  },
});
