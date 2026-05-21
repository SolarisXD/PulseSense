// PulseSense — Severity Banner
// Full-width colored banner for emergency action screen

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import type { SeverityLevel } from '../../constants/rules';

interface SeverityBannerProps {
  severity: SeverityLevel;
  title: string;
  subtitle?: string;
}

const severityConfig: Record<SeverityLevel, { bg: string; icon: string }> = {
  EMERGENCY_NOW: { bg: colors.emergencyBg, icon: '🚨' },
  URGENT_SAME_DAY: { bg: colors.urgentBg, icon: '⚠️' },
  MONITOR_CLOSELY: { bg: colors.monitorBg, icon: '👁️' },
  LOG_ONLY: { bg: colors.safeBg, icon: '✅' },
};

export function SeverityBanner({ severity, title, subtitle }: SeverityBannerProps) {
  const config = severityConfig[severity];

  return (
    <View style={[styles.banner, { backgroundColor: config.bg }]}>
      <Text style={styles.icon}>{config.icon}</Text>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.space4,
    marginBottom: spacing.space4,
  },
  icon: {
    fontSize: 28,
    marginRight: spacing.space3,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.emergencyText,
    fontFamily: 'Inter',
  },
  subtitle: {
    fontSize: 13,
    color: colors.emergencyText,
    opacity: 0.9,
    fontFamily: 'Inter',
    marginTop: 2,
  },
});
