// PulseSense — Insight Card Component
// Displays a single health insight with icon, title, message, and severity badge

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, withDelay, Easing } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';
import { spacing, borderRadius } from '../../constants/spacing';
import { typography } from '../../constants/typography';
import type { HealthInsight } from '../../engine/healthInsights';

// ── Color map per insight type ───────────────────────────────────────────────

const typeColors: Record<HealthInsight['type'], { icon: string; bg: string; badge: string }> = {
  warning: { icon: colors.warning, bg: colors.warningSurface, badge: colors.warning },
  info: { icon: colors.primary, bg: colors.primarySurface, badge: colors.primary },
  positive: { icon: colors.success, bg: colors.successSurface, badge: colors.success },
};

// ── Severity label map ───────────────────────────────────────────────────────

const severityLabel: Record<HealthInsight['severity'], string> = {
  low: 'Info',
  medium: 'Caution',
  high: 'Alert',
};

interface InsightCardProps {
  insight: HealthInsight;
  index?: number;
}

export function InsightCard({ insight, index = 0 }: InsightCardProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    const delay = index * 100;
    opacity.value = withDelay(delay, withTiming(1, { duration: 400, easing: Easing.out(Easing.ease) }));
    translateY.value = withDelay(delay, withSpring(0, { damping: 18, stiffness: 150 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const colors_ = typeColors[insight.type];

  return (
    <Animated.View style={[styles.card, animatedStyle]}>
      <View style={styles.row}>
        {/* Icon */}
        <View style={[styles.iconWrap, { backgroundColor: colors_.bg }]}>
          <Ionicons name={insight.icon as keyof typeof Ionicons.glyphMap} size={20} color={colors_.icon} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1}>
              {insight.title}
            </Text>
            <View style={[styles.badge, { backgroundColor: colors_.badge }]}>
              <Text style={styles.badgeText}>{severityLabel[insight.severity]}</Text>
            </View>
          </View>
          <Text style={styles.message}>{insight.message}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.space4,
    marginBottom: spacing.space3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.space3,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.space1,
  },
  title: {
    ...typography.bodyMedium,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.space2,
  },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    ...typography.badge,
    color: '#fff',
    textTransform: 'uppercase',
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 19,
  },
});
