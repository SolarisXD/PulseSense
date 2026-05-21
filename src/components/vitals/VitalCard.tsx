// PulseSense — Vital Summary Card (Home Screen)
// Horizontal scroll card showing latest reading per vital type

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius } from '../../constants/spacing';
import { VitalStatusBadge } from '../ui/VitalStatusBadge';
import type { VitalStatus } from '../../utils/vitalStatus';

interface VitalCardProps {
  name: string;
  value: string;
  unit?: string;
  status: VitalStatus;
  timeAgo?: string;
  icon: string;
  onPress?: () => void;
}

export function VitalCard({ name, value, unit, status, timeAgo, icon, onPress }: VitalCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.name}>{name}</Text>
      </View>
      <Text style={styles.value}>
        {value}
        {unit && <Text style={styles.unit}> {unit}</Text>}
      </Text>
      <View style={styles.footer}>
        <VitalStatusBadge status={status} size="small" />
        {timeAgo && <Text style={styles.timeAgo}>{timeAgo}</Text>}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.space3,
    marginRight: spacing.space3,
    width: 130,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.space2,
  },
  icon: {
    fontSize: 14,
    marginRight: spacing.space1 + 2,
  },
  name: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: 'Inter',
  },
  value: {
    fontSize: 20,
    fontWeight: '500',
    color: colors.textPrimary,
    fontFamily: 'RobotoMono',
    marginBottom: spacing.space2,
  },
  unit: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'Inter',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeAgo: {
    fontSize: 10,
    color: colors.textDisabled,
    fontFamily: 'Inter',
  },
});
