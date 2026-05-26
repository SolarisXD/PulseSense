// PulseSense — Vital Input Field
// Number input with label, unit, and live status badge

import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { fonts } from '../../constants/typography';
import { useColors } from '../../hooks/useColors';
import { spacing, borderRadius } from '../../constants/spacing';
import { VitalStatusBadge } from '../ui/VitalStatusBadge';
import type { VitalStatus } from '../../utils/vitalStatus';

interface VitalInputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  unit?: string;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'decimal-pad';
  status?: VitalStatus;
  statusLabel?: string;
}

export function VitalInputField({
  label,
  value,
  onChangeText,
  unit,
  placeholder,
  keyboardType = 'decimal-pad',
  status,
}: VitalInputFieldProps) {
  const c = useColors();
  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={[styles.label, { color: c.textSecondary }]}>{label}</Text>
        {status && <VitalStatusBadge status={status} size="small" />}
      </View>
      <View style={[styles.inputWrapper, { borderColor: status === 'danger' ? c.danger : status === 'warning' ? c.warning : c.border, backgroundColor: c.surface }]}>
        <TextInput
          style={[styles.input, { color: c.textPrimary }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={c.textDisabled}
          keyboardType={keyboardType}
          maxLength={6}
        />
        {unit && <Text style={[styles.unit, { color: c.textSecondary }]}>{unit}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: spacing.space3,
  },
  labelRow: {
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
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderWidth: 1.5,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.space3,
  },

  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: fonts.mono,
    paddingVertical: 0,
    height: '100%',
  },
  unit: {
    fontSize: 12,
    fontFamily: fonts.body,
    marginLeft: spacing.space2,
  },
});
