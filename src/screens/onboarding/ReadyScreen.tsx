// PulseSense — Onboarding: Ready Screen

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { fonts } from '../../constants/typography';
import { Button } from '../../components/ui/Button';

interface ReadyScreenProps {
  onComplete: () => void;
}

export function ReadyScreen({ onComplete }: ReadyScreenProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.checkCircle}>
          <Ionicons name="checkmark" size={40} color={colors.success} weight="bold" />
        </View>
        <Text style={styles.heading}>You're all set!</Text>
        <Text style={styles.subtext}>
          PulseSense is ready to use. Your data stays on this device — always.
        </Text>
        <View style={styles.privacyNote}>
          <Ionicons name="lock-closed-outline" size={20} color={colors.primary} style={{ marginRight: spacing.space3 }} />
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
    fontFamily: fonts.display,
    letterSpacing: -0.3,
    marginBottom: spacing.space4,
    textAlign: 'center',
  },
  subtext: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: fonts.body,
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
    marginRight: spacing.space3,
  },
  privacyText: {
    flex: 1,
    fontSize: 12,
    color: colors.primary,
    lineHeight: 16,
    fontFamily: fonts.body,
  },
  footer: {
    paddingBottom: spacing.space12,
  },
});
