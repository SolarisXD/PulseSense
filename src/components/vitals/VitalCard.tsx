// PulseSense — Vital Summary Card (Home Screen)

import React, { useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, withDelay, Easing } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../hooks/useColors';
import { spacing, borderRadius } from '../../constants/spacing';
import { fonts } from '../../constants/typography';
import { VitalStatusBadge } from '../ui/VitalStatusBadge';
import type { VitalStatus } from '../../utils/vitalStatus';

interface VitalCardProps {
  name: string;
  value: string;
  unit?: string;
  status: VitalStatus;
  timeAgo?: string;
  iconName: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  index?: number;
}

export function VitalCard({ name, value, unit, status, timeAgo, iconName, onPress, index = 0 }: VitalCardProps) {
  const c = useColors();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(16);

  useEffect(() => {
    const delay = 200 + index * 100;
    opacity.value = withDelay(delay, withTiming(1, { duration: 450, easing: Easing.out(Easing.ease) }));
    translateY.value = withDelay(delay, withSpring(0, { damping: 16, stiffness: 160 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Animated.View style={[styles.card, { backgroundColor: c.surface }, animatedStyle]}>
        <View style={styles.header}>
          <Ionicons name={iconName} size={14} color={c.textSecondary} />
          <Text style={[styles.name, { color: c.textSecondary }]}>{name}</Text>
        </View>
        <Text style={[styles.value, { color: c.textPrimary }]}>
          {value}
          {unit && <Text style={[styles.unit, { color: c.textSecondary }]}> {unit}</Text>}
        </Text>
        <View style={styles.footer}>
          <VitalStatusBadge status={status} size="small" />
          {timeAgo && <Text style={[styles.timeAgo, { color: c.textDisabled }]}>{timeAgo}</Text>}
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.md,
    padding: spacing.space3,
    marginRight: spacing.space3,
    width: 135,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.space2,
  },
  name: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontFamily: fonts.body,
    marginLeft: 4,
  },
  value: {
    fontSize: 22,
    fontWeight: '500',
    fontFamily: fonts.mono,
    marginBottom: spacing.space2,
  },
  unit: {
    fontSize: 12,
    fontFamily: fonts.body,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeAgo: {
    fontSize: 10,
    fontFamily: fonts.body,
  },
});
