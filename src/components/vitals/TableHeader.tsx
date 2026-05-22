// PulseSense — Table Header for History Screen
// Sticky header row

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { fonts } from '../../constants/typography';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';

interface TableHeaderProps {
  columns: string[];
}

export function TableHeader({ columns }: TableHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.dateTimeCol}>
        <Text style={styles.headerText}>Date</Text>
        <Text style={styles.headerText}>Time</Text>
      </View>
      {columns.map((col, idx) => (
        <View key={idx} style={styles.col}>
          <Text style={styles.headerText}>{col}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    paddingVertical: spacing.space3,
    paddingHorizontal: spacing.space3,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dateTimeCol: {
    width: 70,
    marginRight: spacing.space2,
  },
  col: {
    flex: 1,
    alignItems: 'center',
    minWidth: 50,
  },
  headerText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: fonts.body,
  },
});
