// PulseSense — Vital Status Badge
// Colored dot + label (Normal / Borderline / High-Low / Unknown)

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { fonts } from '../../constants/typography';
import { useColors } from '../../hooks/useColors';
import { spacing, borderRadius } from '../../constants/spacing';
import type { VitalStatus } from '../../utils/vitalStatus';

interface VitalStatusBadgeProps {
  status: VitalStatus;
  size?: 'small' | 'medium';
}

export const VitalStatusBadge = React.memo(function VitalStatusBadge({ status, size = 'medium' }: VitalStatusBadgeProps) {
  const c = useColors();

  const statusConfig: Record<VitalStatus, { dotColor: string; bg: string; textColor: string; label: string }> = {
    normal: { dotColor: c.success, bg: c.successSurface, textColor: '#065F46', label: 'Normal' },
    warning: { dotColor: c.warning, bg: c.warningSurface, textColor: '#92400E', label: 'Borderline' },
    danger: { dotColor: c.danger, bg: c.dangerSurface, textColor: '#991B1B', label: 'High/Low' },
    unknown: { dotColor: c.textDisabled, bg: c.surfaceAlt, textColor: c.textSecondary, label: 'Unknown' },
  };

  const config = statusConfig[status] || statusConfig.unknown;

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }, size === 'small' && styles.badgeSmall]}>
      <View style={[styles.dot, { backgroundColor: config.dotColor }, size === 'small' && styles.dotSmall]} />
      <Text style={[styles.label, { color: config.textColor }, size === 'small' && styles.labelSmall]}>
        {config.label}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.space2,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  badgeSmall: {
    paddingHorizontal: spacing.space2 - 2,
    paddingVertical: 1,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: spacing.space1 + 2,
  },
  dotSmall: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginRight: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    fontFamily: fonts.body,
  },
  labelSmall: {
    fontSize: 9,
  },
});
