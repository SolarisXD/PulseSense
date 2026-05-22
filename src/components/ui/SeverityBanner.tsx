// PulseSense — Severity Banner
// Full-width colored banner for emergency action screen

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { fonts } from '../../constants/typography';
import type { SeverityLevel } from '../../constants/rules';

interface SeverityBannerProps {
  severity: SeverityLevel;
  title: string;
  subtitle?: string;
}

const severityConfig: Record<SeverityLevel, { bg: string; icon: keyof typeof Ionicons.glyphMap; iconColor: string }> = {
  EMERGENCY_NOW: { bg: colors.emergencyBg, icon: 'alert-circle', iconColor: '#FFFFFF' },
  URGENT_SAME_DAY: { bg: colors.urgentBg, icon: 'warning', iconColor: '#FFFFFF' },
  MONITOR_CLOSELY: { bg: colors.monitorBg, icon: 'eye-outline', iconColor: '#FFFFFF' },
  LOG_ONLY: { bg: colors.safeBg, icon: 'checkmark-circle', iconColor: '#FFFFFF' },
};

export function SeverityBanner({ severity, title, subtitle }: SeverityBannerProps) {
  const config = severityConfig[severity] || severityConfig.LOG_ONLY;

  return (
    <View style={[styles.banner, { backgroundColor: config.bg }]}>
      <Ionicons name={config.icon} size={28} color={config.iconColor} style={styles.icon} />
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
    marginRight: spacing.space3,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.emergencyText,
    fontFamily: fonts.display,
  },
  subtitle: {
    fontSize: 13,
    color: colors.emergencyText,
    opacity: 0.9,
    fontFamily: fonts.body,
    marginTop: 2,
  },
});
