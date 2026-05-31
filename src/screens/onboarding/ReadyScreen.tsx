// PulseSense — Onboarding: Ready Screen

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { fonts } from '../../constants/typography';
import { Button } from '../../components/ui/Button';

interface ReadyScreenProps {
  onComplete: () => void;
}

export function ReadyScreen({ onComplete }: ReadyScreenProps) {
  const [disclaimerAccepted, setDisclaimerAccepted] = React.useState(false);

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
        <TouchableOpacity
          style={styles.disclaimerRow}
          onPress={() => setDisclaimerAccepted(!disclaimerAccepted)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, disclaimerAccepted && styles.checkboxChecked]}>
            {disclaimerAccepted && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
          </View>
          <Text style={styles.disclaimerText}>
            I understand PulseSense is <Text style={{ fontWeight: '700' }}>not a medical device</Text> and does not provide diagnosis or treatment. In an emergency, I will call emergency services.
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.footer}>
        <Button
          title="Go to Home →"
          onPress={onComplete}
          variant={disclaimerAccepted ? 'primary' : 'disabled'}
          disabled={!disclaimerAccepted}
        />
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
  disclaimerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.warningSurface,
    padding: spacing.space4,
    borderRadius: 10,
    maxWidth: 320,
    marginTop: spacing.space5,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.space3,
    marginTop: 1,
    backgroundColor: colors.surface,
  },
  checkboxChecked: {
    borderColor: colors.danger,
    backgroundColor: colors.danger,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 12,
    color: colors.danger,
    lineHeight: 17,
    fontFamily: fonts.body,
  },
  footer: {
    paddingBottom: spacing.space12,
  },
});
