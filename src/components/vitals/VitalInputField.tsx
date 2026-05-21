// PulseSense — Vital Input Field
// Number input with label, unit, and live status badge

import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { fonts } from '../../constants/typography';
import { colors, spacing, borderRadius } from '../../constants/spacing';
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
  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {status && <VitalStatusBadge status={status} size="small" />}
      </View>
      <View style={[styles.inputWrapper, status === 'danger' && styles.inputDanger, status === 'warning' && styles.inputWarning]}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textDisabled}
          keyboardType={keyboardType}
          maxLength={6}
        />
        {unit && <Text style={styles.unit}>{unit}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: fonts.body,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.space3,
  },
  inputDanger: {
    borderColor: colors.danger,
  },
  inputWarning: {
    borderColor: colors.warning,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    fontFamily: fonts.mono,
    paddingVertical: 0,
    height: '100%',
  },
  unit: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: fonts.body,
    marginLeft: spacing.space2,
  },
});
