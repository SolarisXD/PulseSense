// PulseSense — Table Row for History Screen
// Alternating row with per-cell status coloring

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { fonts } from '../../constants/typography';
import { colors, spacing } from '../../constants/spacing';
import { VitalStatusBadge } from '../ui/VitalStatusBadge';
import type { VitalStatus } from '../../utils/vitalStatus';

interface CellData {
  value: string;
  status: VitalStatus;
}

interface TableRowProps {
  date: string;
  time: string;
  cells: CellData[];
  isEven: boolean;
  onPress?: () => void;
}

export function TableRow({ date, time, cells, isEven, onPress }: TableRowProps) {
  const content = (
    <View style={[styles.row, isEven && styles.rowEven]}>
      <View style={styles.dateTimeCol}>
        <Text style={styles.date}>{date}</Text>
        <Text style={styles.time}>{time}</Text>
      </View>
      {cells.map((cell, idx) => (
        <View key={idx} style={styles.cell}>
          <Text style={[styles.cellValue, cell.status !== 'normal' && cell.status !== 'unknown' ? { color: cell.status === 'danger' ? colors.danger : colors.warning } : {}]}>
            {cell.value}
          </Text>
        </View>
      ))}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.space3,
    paddingHorizontal: spacing.space3,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  rowEven: {
    backgroundColor: colors.surfaceAlt,
  },
  dateTimeCol: {
    width: 70,
    marginRight: spacing.space2,
  },
  date: {
    fontSize: 11,
    color: colors.textSecondary,
    fontFamily: fonts.body,
  },
  time: {
    fontSize: 11,
    color: colors.textSecondary,
    fontFamily: fonts.body,
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    minWidth: 50,
  },
  cellValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
    fontFamily: fonts.mono,
  },
});
