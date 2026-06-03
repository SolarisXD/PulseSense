// PulseSense — Dosage Display Component
// Renders 1-0-1 with M/A/N labels

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { fonts } from '../../constants/typography';
import { useColors } from '../../hooks/useColors';
import { spacing, borderRadius } from '../../constants/spacing';

interface DosageDisplayProps {
  morning: number;
  afternoon: number;
  night: number;
}

const DosageSlot = React.memo(function DosageSlot({ label, active }: { label: string; active: boolean }) {
  const c = useColors();
  return (
    <View style={[styles.slot, { backgroundColor: active ? c.primary : c.borderLight }]}>
      <Text style={[styles.slotLabel, { color: active ? '#FFFFFF' : c.textDisabled }]}>
        {label}
      </Text>
    </View>
  );
});

export const DosageDisplay = React.memo(function DosageDisplay({ morning, afternoon, night }: DosageDisplayProps) {
  const c = useColors();

  return (
    <View style={styles.container}>
      <DosageSlot label="M" active={morning === 1} />
      <Text style={[styles.separator, { color: c.textSecondary }]}>-</Text>
      <DosageSlot label="A" active={afternoon === 1} />
      <Text style={[styles.separator, { color: c.textSecondary }]}>-</Text>
      <DosageSlot label="N" active={night === 1} />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  separator: {
    fontSize: 12,
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
  slotLabel: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: fonts.body,
  },
});
