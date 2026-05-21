// PulseSense — Onboarding: Features Screen

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../../constants/spacing';
import { fonts } from '../../constants/typography';
import { Button } from '../../components/ui/Button';

interface FeaturesScreenProps {
  onNext: () => void;
}

const features = [
  { icon: 'alert-circle' as const, title: 'Emergency Triage', desc: 'Guided step-by-step action for medical emergencies — offline.', color: colors.danger },
  { icon: 'pulse' as const, title: 'Vitals Tracking', desc: 'Log BP, SpO2, glucose, temperature, weight, pain — one at a time or together.', color: colors.primary },
  { icon: 'medkit-outline' as const, title: 'Medications', desc: 'Track prescriptions with structured dosage in Morning/Afternoon/Night format.', color: colors.primaryLight },
  { icon: 'document-text-outline' as const, title: 'PDF Export', desc: 'Generate lab-report-quality PDFs — Medical ID, vitals history, and more.', color: colors.primary },
];

export function FeaturesScreen({ onNext }: FeaturesScreenProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>What PulseSense does</Text>
        <Text style={styles.subtext}>Everything you need to manage your health, in one place.</Text>
      </View>
      <View style={styles.featuresList}>
        {features.map((f, idx) => (
          <View key={idx} style={styles.featureRow}>
            <View style={[styles.featureIconContainer, { backgroundColor: f.color + '15' }]}>
              <Ionicons name={f.icon} size={24} color={f.color} />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureDesc}>{f.desc}</Text>
            </View>
          </View>
        ))}
      </View>
      <View style={styles.footer}>
        <Button title="Next" onPress={onNext} variant="primary" />
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
  header: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: spacing.space6,
  },
  heading: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 32,
    fontFamily: fonts.display,
    letterSpacing: -0.3,
    marginBottom: spacing.space3,
    textAlign: 'center',
  },
  subtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    fontFamily: fonts.body,
  },
  featuresList: {
    flex: 2,
    justifyContent: 'center',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.space5,
  },
  featureIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.space4,
    marginTop: 2,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    fontFamily: fonts.display,
    marginBottom: spacing.space1,
  },
  featureDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    fontFamily: fonts.body,
  },
  footer: {
    paddingBottom: spacing.space12,
  },
});
