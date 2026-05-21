// PulseSense — Alert Row Component

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius } from '../../constants/spacing';
import type { SeverityLevel } from '../../constants/rules';

interface AlertRowProps {
  title: string;
  message: string;
  severity: SeverityLevel;
  timestamp: string;
  isResolved?: boolean;
  onPress?: () => void;
}

const severityColors: Record<SeverityLevel, { icon: string; color: string; bg: string }> = {
  EMERGENCY_NOW: { icon: '🔴', color: colors.danger, bg: colors.dangerSurface },
  URGENT_SAME_DAY: { icon: '🟠', color: colors.urgent, bg: colors.warningSurface },
  MONITOR_CLOSELY: { icon: '🔵', color: colors.primary, bg: colors.primarySurface },
  LOG_ONLY: { icon: '🟢', color: colors.success, bg: colors.successSurface },
};

export function AlertRow({ title, message, severity, timestamp, isResolved, onPress }: AlertRowProps) {
  const config = severityColors[severity] || severityColors.LOG_ONLY;

  return (
    <TouchableOpacity
      style={[styles.container, { borderLeftColor: config.color }]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <View style={styles.header}>
        <Text style={styles.icon}>{config.icon}</Text>
        <Text style={[styles.title, isResolved && styles.resolved]}>{title}</Text>
        {isResolved && <Text style={styles.resolvedBadge}>Resolved</Text>}
      </View>
      <Text style={styles.message} numberOfLines={2}>{message}</Text>
      <Text style={styles.timestamp}>{timestamp}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderLeftWidth: 3,
    borderRadius: borderRadius.md,
    padding: spacing.space3,
    marginBottom: spacing.space2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.space1,
  },
  icon: {
    fontSize: 12,
    marginRight: spacing.space2,
  },
  title: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    fontFamily: 'Inter',
  },
  resolved: {
    textDecorationLine: 'line-through',
    color: colors.textDisabled,
  },
  resolvedBadge: {
    fontSize: 10,
    color: colors.textSecondary,
    fontFamily: 'Inter',
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  message: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'Inter',
    marginBottom: spacing.space1,
  },
  timestamp: {
    fontSize: 10,
    color: colors.textDisabled,
    fontFamily: 'Inter',
  },
});
