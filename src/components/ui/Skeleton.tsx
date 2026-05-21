// PulseSense — Skeleton Loading Component
// Reanimated pulsing placeholder for async data loading states
// Usage: <Skeleton.Box width={200} height={20} /> or <Skeleton.Circle size={48} /> or <Skeleton.Text lines={3} />

import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing, withDelay } from 'react-native-reanimated';
import { colors } from '../../constants/spacing';

// ---------- Core Skeleton Box ----------

interface SkeletonBoxProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle | ViewStyle[];
}

function SkeletonBox({ width = '100%', height = 16, borderRadius = 4, style }: SkeletonBoxProps) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withDelay(
      100,
      withRepeat(
        withTiming(0.35, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      ),
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: colors.surfaceAlt,
        },
        animatedStyle,
        style,
      ]}
    />
  );
}

// ---------- Sub-components ----------

interface SkeletonCircleProps {
  size?: number;
  style?: ViewStyle;
}

function SkeletonCircle({ size = 48, style }: SkeletonCircleProps) {
  return <SkeletonBox width={size} height={size} borderRadius={size / 2} style={style} />;
}

interface SkeletonTextProps {
  lines?: number;
  lineHeight?: number;
  spacing?: number;
  lastLineWidth?: number;
  style?: ViewStyle;
}

function SkeletonText({
  lines = 3,
  lineHeight = 14,
  spacing = 8,
  lastLineWidth = 60,
  style,
}: SkeletonTextProps) {
  return (
    <View style={[{ gap: spacing }, style]}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBox
          key={i}
          height={lineHeight}
          width={i === lines - 1 ? `${lastLineWidth}%` : '100%'}
        />
      ))}
    </View>
  );
}

interface SkeletonCardProps {
  height?: number;
  style?: ViewStyle;
}

function SkeletonCard({ height = 100, style }: SkeletonCardProps) {
  return (
    <SkeletonBox
      height={height}
      borderRadius={10}
      style={{ marginBottom: 12, ...style }}
    />
  );
}

// ---------- Export ----------

export const Skeleton = {
  Box: SkeletonBox,
  Circle: SkeletonCircle,
  Text: SkeletonText,
  Card: SkeletonCard,
};
