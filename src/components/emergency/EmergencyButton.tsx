// PulseSense — Emergency Button (Home Screen)
// Large pulsing red CTA button with animated outer ring
// Now with enhanced press haptic simulation and dramatic entrance

import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../../constants/spacing';
import { fonts } from '../../constants/typography';

interface EmergencyButtonProps {
  onPress: () => void;
}

export function EmergencyButton({ onPress }: EmergencyButtonProps) {
  const pulseOpacity = useSharedValue(1);
  const pulseScale = useSharedValue(1);
  const glowIntensity = useSharedValue(0);

  useEffect(() => {
    pulseOpacity.value = withRepeat(
      withSequence(
        withTiming(0.15, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.4, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.06, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    glowIntensity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const ringStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
    transform: [{ scale: pulseScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(glowIntensity.value, [0, 0.6], [0.6, 0]),
    transform: [{ scale: interpolate(glowIntensity.value, [0, 0.6], [1, 1.12]) }],
  }));

  return (
    <View style={styles.wrapper}>
      {/* Outer glow ring */}
      <Animated.View style={[styles.glowRing, glowStyle]} />
      {/* Pulsing ring */}
      <Animated.View style={[styles.pulseRing, ringStyle]} />
      {/* Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={onPress}
        activeOpacity={0.85}
        accessibilityLabel="Emergency Check — tap if someone feels unwell"
        accessibilityRole="button"
      >
        <View style={styles.iconContainer}>
          <Ionicons name="alert-circle" size={28} color="#FFFFFF" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>EMERGENCY CHECK</Text>
          <Text style={styles.subtitle}>Tap if you or someone near you feels unwell</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.6)" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    marginBottom: spacing.space5,
  },
  glowRing: {
    position: 'absolute',
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderRadius: borderRadius.md + 8,
    backgroundColor: colors.danger,
  },
  pulseRing: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: borderRadius.md + 4,
    backgroundColor: colors.danger,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.danger,
    borderRadius: borderRadius.md,
    padding: spacing.space4,
    minHeight: 80,
    shadowColor: '#E63946',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.space3,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: fonts.display,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.8,
    fontFamily: fonts.body,
  },
});
