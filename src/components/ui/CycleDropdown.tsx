import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';
import { spacing, borderRadius } from '../../constants/spacing';
import { fonts } from '../../constants/typography';

interface CycleDropdownProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  formatValue?: (value: string) => string;
}

export function CycleDropdown({ label, value, options, onChange, formatValue }: CycleDropdownProps) {
  const cycle = () => {
    const idx = options.indexOf(value);
    const next = options[(idx + 1) % options.length];
    onChange(next);
  };

  return (
    <TouchableOpacity style={styles.dropdown} onPress={cycle} activeOpacity={0.7}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.valueRow}>
        <Text style={styles.value}>{formatValue ? formatValue(value) : value}</Text>
        <Ionicons name="chevron-down" size={14} color={colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 44,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.space3,
    marginTop: spacing.space2,
  },
  label: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: fonts.body,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  value: {
    fontSize: 14,
    color: colors.textPrimary,
    fontFamily: fonts.body,
    textTransform: 'capitalize',
  },
});
