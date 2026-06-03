// PulseSense — Severity Banner
// Full-width colored banner for emergency action screen

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '../../constants/spacing';
import { fonts } from '../../constants/typography';
import { useColors } from '../../hooks/useColors';
import type { SeverityLevel } from '../../constants/rules';

interface SeverityBannerProps {
  severity: SeverityLevel;
  title: string;
  subtitle?: string;
}

export const SeverityBanner = React.memo(function SeverityBanner({ severity, title, subtitle }: SeverityBannerProps) {
  const c = useColors();

  const severityConfig: Record<SeverityLevel, { bg: string; icon: keyof typeof Ionicons.glyphMap; iconColor: string }> = {
    EMERGENCY_NOW: { bg: c.emergencyBg, icon: 'alert-circle', iconColor: '#FFFFFF' },
    URGENT_SAME_DAY: { bg: c.urgentBg, icon: 'warning', iconColor: '#FFFFFF' },
    MONITOR_CLOSELY: { bg: c.monitorBg, icon: 'eye-outline', iconColor: '#FFFFFF' },
    LOG_ONLY: { bg: c.safeBg, icon: 'checkmark-circle', iconColor: '#FFFFFF' },
  };

  const config = severityConfig[severity] || severityConfig.LOG_ONLY;

  return (
    <View style={[styles.banner, { backgroundColor: config.bg }]}>
      <Ionicons name={config.icon} size={28} color={config.iconColor} style={styles.icon} />
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: c.emergencyText }]}>{title}</Text>
        {subtitle && <Text style={[styles.subtitle, { color: c.emergencyText }]}>{subtitle}</Text>}
      </View>
    </View>
  );
});



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
    fontFamily: fonts.display,
  },
  subtitle: {
    fontSize: 13,
    opacity: 0.9,
    fontFamily: fonts.body,
    marginTop: 2,
  },
});
