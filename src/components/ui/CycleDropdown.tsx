import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../hooks/useColors';
import { spacing, borderRadius } from '../../constants/spacing';
import { fonts } from '../../constants/typography';

interface CycleDropdownProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  formatValue?: (value: string) => string;
}

export const CycleDropdown = React.memo(function CycleDropdown({ label, value, options, onChange, formatValue }: CycleDropdownProps) {
  const c = useColors();
  const cycle = () => {
    const idx = options.indexOf(value);
    const next = options[(idx + 1) % options.length];
    onChange(next);
  };

  return (
    <TouchableOpacity style={[styles.dropdown, { borderColor: c.border, backgroundColor: c.surface }]} onPress={cycle} activeOpacity={0.7} accessibilityLabel="Cycle through options">
      <Text style={[styles.label, { color: c.textSecondary }]}>{label}</Text>
      <View style={styles.valueRow}>
        <Text style={[styles.value, { color: c.textPrimary }]}>{formatValue ? formatValue(value) : value}</Text>
        <Ionicons name="chevron-down" size={14} color={c.textSecondary} />
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 44,
    borderWidth: 1.5,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.space3,
    marginTop: spacing.space2,
  },
  label: {
    fontSize: 12,
    fontFamily: fonts.body,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  value: {
    fontSize: 14,
    fontFamily: fonts.body,
    textTransform: 'capitalize',
  },
});
