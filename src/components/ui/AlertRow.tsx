// PulseSense — Alert Row Component

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../hooks/useColors';
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

export const AlertRow = React.memo(function AlertRow({ title, message, severity, timestamp, isResolved, onPress }: AlertRowProps) {
  const c = useColors();
  const severityConfig: Record<SeverityLevel, { icon: keyof typeof Ionicons.glyphMap; color: string; bg: string }> = {
    EMERGENCY_NOW: { icon: 'alert-circle', color: c.danger, bg: c.dangerSurface },
    URGENT_SAME_DAY: { icon: 'warning', color: c.urgent, bg: c.warningSurface },
    MONITOR_CLOSELY: { icon: 'information-circle', color: c.primary, bg: c.primarySurface },
    LOG_ONLY: { icon: 'checkmark-circle', color: c.success, bg: c.successSurface },
  };
  const config = severityConfig[severity] || severityConfig.LOG_ONLY;

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: c.surface, borderLeftColor: config.color }]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
      accessibilityLabel="View alert details"
    >
      <View style={styles.header}>
        <Ionicons name={config.icon} size={16} color={config.color} />
        <Text style={[styles.title, { color: isResolved ? c.textDisabled : c.textPrimary }, isResolved && styles.resolved]} numberOfLines={1}>{title}</Text>
        {isResolved && <Text style={[styles.resolvedBadge, { color: c.textSecondary, backgroundColor: c.surfaceAlt }]}>Resolved</Text>}
      </View>
      <Text style={[styles.message, { color: c.textSecondary }]} numberOfLines={2}>{message}</Text>
      <Text style={[styles.timestamp, { color: c.textDisabled }]}>{timestamp}</Text>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
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
    fontFamily: fonts.body,
  },
  resolved: {
    textDecorationLine: 'line-through',
  },
  resolvedBadge: {
    fontSize: 10,
    fontFamily: fonts.body,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  message: {
    fontSize: 12,
    fontFamily: fonts.body,
    marginBottom: spacing.space1,
  },
  timestamp: {
    fontSize: 10,
    fontFamily: fonts.body,
  },
});
