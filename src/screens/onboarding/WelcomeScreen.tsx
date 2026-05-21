// PulseSense — Onboarding: Welcome Screen

import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { colors, spacing, borderRadius } from '../../constants/spacing';
import { Button } from '../../components/ui/Button';

const { width } = Dimensions.get('window');

interface WelcomeScreenProps {
  onNext: () => void;
}

export function WelcomeScreen({ onNext }: WelcomeScreenProps) {
  return (
    <View style={styles.container}>
      <View style={styles.illustrationContainer}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoIcon}>❤️</Text>
        </View>
        <Text style={styles.appName}>PulseSense</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.heading}>Your personal health{'\n'}companion</Text>
        <Text style={styles.subtext}>
          Track vitals, manage medications, and know what to do in a medical emergency — all offline, all on your device.
        </Text>
      </View>
      <View style={styles.footer}>
        <Button title="Get Started" onPress={onNext} variant="primary" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.space6,
  },
  illustrationContainer: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.space4,
  },
  logoIcon: {
    fontSize: 48,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
    fontFamily: 'Inter',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 34,
    fontFamily: 'Inter',
    marginBottom: spacing.space4,
    textAlign: 'center',
  },
  subtext: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    textAlign: 'center',
    fontFamily: 'Inter',
    paddingHorizontal: spacing.space4,
  },
  footer: {
    paddingBottom: spacing.space12,
  },
});
