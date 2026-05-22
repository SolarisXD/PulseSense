// PulseSense — Alert Row Component

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';
import { spacing, borderRadius } from '../../constants/spacing';
import { fonts } from '../../constants/typography';
import type { SeverityLevel } from '../../constants/rules';

interface AlertRowProps {
  title: string;
  message: string;
  severity: SeverityLevel;
  timestamp: string;
  isResolved?: boolean;
  onPress?: () => void;
}

const severityConfig: Record<SeverityLevel, { icon: keyof typeof Ionicons.glyphMap; color: string; bg: string }> = {
  EMERGENCY_NOW: { icon: 'alert-circle', color: colors.danger, bg: colors.dangerSurface },
  URGENT_SAME_DAY: { icon: 'warning', color: colors.urgent, bg: colors.warningSurface },
  MONITOR_CLOSELY: { icon: 'information-circle', color: colors.primary, bg: colors.primarySurface },
  LOG_ONLY: { icon: 'checkmark-circle', color: colors.success, bg: colors.successSurface },
};

export function AlertRow({ title, message, severity, timestamp, isResolved, onPress }: AlertRowProps) {
  const config = severityConfig[severity] || severityConfig.LOG_ONLY;

  return (
    <TouchableOpacity
      style={[styles.container, { borderLeftColor: config.color }]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <View style={styles.header}>
        <Ionicons name={config.icon} size={16} color={config.color} />
        <Text style={[styles.title, isResolved && styles.resolved]} numberOfLines={1}>{title}</Text>
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
    marginRight: spacing.space2,
  },
  title: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    fontFamily: fonts.body,
  },
  resolved: {
    textDecorationLine: 'line-through',
    color: colors.textDisabled,
  },
  resolvedBadge: {
    fontSize: 10,
    color: colors.textSecondary,
    fontFamily: fonts.body,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  message: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: fonts.body,
    marginBottom: spacing.space1,
  },
  timestamp: {
    fontSize: 10,
    color: colors.textDisabled,
    fontFamily: fonts.body,
  },
});
