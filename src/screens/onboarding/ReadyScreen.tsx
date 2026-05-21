// PulseSense — Onboarding: Ready Screen

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../../constants/spacing';
import { Button } from '../../components/ui/Button';

interface ReadyScreenProps {
  onComplete: () => void;
}

export function ReadyScreen({ onComplete }: ReadyScreenProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.checkCircle}>
          <Text style={styles.checkmark}>✓</Text>
        </View>
        <Text style={styles.heading}>You're all set!</Text>
        <Text style={styles.subtext}>
          PulseSense is ready to use. Your data stays on this device — always.
        </Text>
        <View style={styles.privacyNote}>
          <Text style={styles.privacyIcon}>🔒</Text>
          <Text style={styles.privacyText}>
            All health data is stored locally. No cloud, no accounts, no tracking.
          </Text>
        </View>
      </View>
      <View style={styles.footer}>
        <Button title="Go to Home →" onPress={onComplete} variant="primary" />
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.successSurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.space6,
  },
  checkmark: {
    fontSize: 36,
    color: colors.success,
    fontWeight: '700',
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    fontFamily: 'Inter',
    marginBottom: spacing.space4,
    textAlign: 'center',
  },
  subtext: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: 'Inter',
    marginBottom: spacing.space8,
    paddingHorizontal: spacing.space4,
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primarySurface,
    padding: spacing.space4,
    borderRadius: 10,
    maxWidth: 300,
  },
  privacyIcon: {
    fontSize: 20,
    marginRight: spacing.space3,
  },
  privacyText: {
    flex: 1,
    fontSize: 12,
    color: colors.primary,
    lineHeight: 16,
    fontFamily: 'Inter',
  },
  footer: {
    paddingBottom: spacing.space12,
  },
});
