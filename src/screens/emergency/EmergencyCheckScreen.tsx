// PulseSense — Emergency Check Screen
// Symptom checklist by category with optional quick vitals
// Updated with proper icons and typography

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius } from '../../constants/spacing';
import { fonts } from '../../constants/typography';
import { Button } from '../../components/ui/Button';
import { evaluateSymptoms } from '../../engine/ruleEngine';
import { getDB } from '../../hooks/useDB';
import { insertSymptomEvent, insertRuleTriggers, insertAlert } from '../../db/queries/emergency';
import { useAlertStore } from '../../store/alertStore';
import type { SymptomInput, RuleResult } from '../../constants/rules';
import { nowIso } from '../../utils/dateUtils';

const CATEGORIES = [
  {
    id: 'stroke',
    label: 'Possible Stroke',
    icon: 'fitness-outline' as const,
    color: colors.danger,
    symptoms: [
      { key: 'balance_loss', label: 'Balance loss / dizziness' },
      { key: 'vision_change', label: 'Vision change / blurring' },
      { key: 'face_droop', label: 'Face drooping (one side)' },
      { key: 'arm_weakness', label: 'Arm weakness (one side)' },
      { key: 'speech_difficulty', label: 'Speech difficulty / slurred' },
    ],
  },
  {
    id: 'heart',
    label: 'Chest Pain / Heart Attack',
    icon: 'heart-half' as const,
    color: colors.danger,
    symptoms: [
      { key: 'chest_discomfort', label: 'Chest discomfort / pressure' },
      { key: 'upper_body_pain', label: 'Pain in arm, back, neck, jaw' },
      { key: 'shortness_breath', label: 'Shortness of breath' },
      { key: 'cold_sweat', label: 'Cold sweat' },
      { key: 'nausea', label: 'Nausea / indigestion' },
      { key: 'lightheadedness', label: 'Lightheadedness' },
      { key: 'rapid_heartbeat', label: 'Rapid or irregular heartbeat' },
    ],
  },
  {
    id: 'breathing',
    label: 'Trouble Breathing',
    icon: 'analytics-outline' as const,
    color: colors.urgent,
    symptoms: [
      { key: 'shortness_breath', label: 'Sudden severe breathlessness' },
    ],
  },
  {
    id: 'consciousness',
    label: 'Unconscious / Not Breathing',
    icon: 'medkit-outline' as const,
    color: colors.danger,
    symptoms: [
      { key: 'unconscious', label: 'Unconscious / unresponsive' },
      { key: 'not_breathing', label: 'Not breathing normally' },
    ],
  },
  {
    id: 'bleeding',
    label: 'Severe Bleeding',
    icon: 'water-outline' as const,
    color: colors.danger,
    symptoms: [
      { key: 'severe_bleeding', label: 'Severe / uncontrolled bleeding' },
    ],
  },
  {
    id: 'allergy',
    label: 'Severe Allergic Reaction',
    icon: 'warning-outline' as const,
    color: colors.urgent,
    symptoms: [
      { key: 'anaphylaxis', label: 'Signs of anaphylaxis (swelling, hives, wheezing)' },
    ],
  },
  {
    id: 'other',
    label: 'Other / Not Sure',
    icon: 'help-circle-outline' as const,
    color: colors.textSecondary,
    symptoms: [
      { key: 'fainting', label: 'Fainting / collapsed' },
      { key: 'seizure', label: 'Seizure / convulsions' },
    ],
  },
];

export function EmergencyCheckScreen({ navigation }: any) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [symptoms, setSymptoms] = useState<SymptomInput>({});
  const [spo2, setSpo2] = useState('');
  const [pulse, setPulse] = useState('');
  const [bpSys, setBpSys] = useState('');
  const [bpDia, setBpDia] = useState('');
  const [checking, setChecking] = useState(false);

  const toggleSymptom = (key: keyof SymptomInput) => {
    setSymptoms((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const hasAnySymptoms = Object.values(symptoms).some((v) => v);

  const handleCheck = async () => {
    if (!hasAnySymptoms && !spo2 && !pulse) {
      Alert.alert('No Symptoms', 'Please select at least one symptom or enter a vital reading.');
      return;
    }

    setChecking(true);
    try {
      const parsedSpo2 = spo2 ? parseFloat(spo2) : undefined;
      const parsedPulse = pulse ? parseInt(pulse, 10) : undefined;
      const parsedBpSys = bpSys ? parseInt(bpSys, 10) : undefined;
      const parsedBpDia = bpDia ? parseInt(bpDia, 10) : undefined;

      if ((spo2 && isNaN(parsedSpo2!)) || (pulse && isNaN(parsedPulse!)) ||
          (bpSys && isNaN(parsedBpSys!)) || (bpDia && isNaN(parsedBpDia!))) {
        Alert.alert('Invalid Input', 'Please enter valid numbers for vital signs.');
        setChecking(false);
        return;
      }

      const input: SymptomInput = {
        ...symptoms,
        spo2: parsedSpo2,
        pulse: parsedPulse,
        bp_sys: parsedBpSys,
        bp_dia: parsedBpDia,
      };

      const results = evaluateSymptoms(input);

      const db = await getDB();
      const eventId = await insertSymptomEvent(db, input, nowIso());
      await insertRuleTriggers(db, eventId, results);

      const highest = results[0];
      if (highest && highest.severity !== 'LOG_ONLY') {
        await insertAlert(db, {
          source: 'rule_engine',
          type: highest.severity === 'EMERGENCY_NOW' ? 'emergency' : 'warning',
          severity_level: highest.severity,
          title: highest.message.split('.')[0] || 'Alert',
          message: highest.message,
          vitals_snapshot: null,
          symptom_event_id: eventId,
          vital_log_id: null,
        });
      }

      useAlertStore.getState().setLastEmergencyResult(results);
      useAlertStore.getState().setLastEmergencyEventId(eventId);

      setChecking(false);
      navigation.navigate('EmergencyAction', { eventId });
    } catch (err) {
      console.error(err);
      setChecking(false);
      Alert.alert('Error', 'Failed to process emergency check.');
    }
  };

  const selectedCount = Object.values(symptoms).filter(Boolean).length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.heading}>What is happening?</Text>
      <Text style={styles.subtext}>Select all symptoms that apply</Text>

      {CATEGORIES.map((cat) => (
        <View key={cat.id} style={styles.categoryContainer}>
          <TouchableOpacity
            style={[styles.categoryCard, expandedCategory === cat.id && { borderColor: cat.color }]}
            onPress={() => setExpandedCategory(expandedCategory === cat.id ? null : cat.id)}
            activeOpacity={0.7}
          >
            <View style={[styles.categoryIconContainer, { backgroundColor: cat.color + '12' }]}>
              <Ionicons name={cat.icon} size={22} color={cat.color} />
            </View>
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryLabel}>{cat.label}</Text>
              {expandedCategory === cat.id && (
                <Text style={styles.selectedCount}>
                  {cat.symptoms.filter((s) => symptoms[s.key as keyof SymptomInput]).length} selected
                </Text>
              )}
            </View>
            <Ionicons
              name={expandedCategory === cat.id ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          {expandedCategory === cat.id && (
            <View style={styles.symptomList}>
              {cat.symptoms.map((symp) => {
                const isChecked = !!symptoms[symp.key as keyof SymptomInput];
                return (
                  <TouchableOpacity
                    key={symp.key}
                    style={[styles.symptomRow, isChecked && styles.symptomRowSelected]}
                    onPress={() => toggleSymptom(symp.key as keyof SymptomInput)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.checkbox, isChecked && styles.checkboxSelected]}>
                      {isChecked && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                    </View>
                    <Text style={[styles.symptomLabel, isChecked && styles.symptomLabelSelected]}>
                      {symp.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      ))}

      {/* Quick Vitals */}
      <View style={styles.quickVitals}>
        <Text style={styles.quickVitalsTitle}>Optional: Quick Vitals</Text>
        <View style={styles.vitalsRow}>
          <View style={styles.vitalInput}>
            <Text style={styles.vitalInputLabel}>SpO2 (%)</Text>
            <TextInput
              style={styles.vitalInputField}
              value={spo2}
              onChangeText={setSpo2}
              keyboardType="decimal-pad"
              placeholder="--"
              placeholderTextColor={colors.textDisabled}
              maxLength={4}
            />
          </View>
          <View style={styles.vitalInput}>
            <Text style={styles.vitalInputLabel}>Pulse (bpm)</Text>
            <TextInput
              style={styles.vitalInputField}
              value={pulse}
              onChangeText={setPulse}
              keyboardType="number-pad"
              placeholder="--"
              placeholderTextColor={colors.textDisabled}
              maxLength={3}
            />
          </View>
        </View>
        <View style={styles.vitalsRow}>
          <View style={styles.vitalInput}>
            <Text style={styles.vitalInputLabel}>BP Systolic</Text>
            <TextInput
              style={styles.vitalInputField}
              value={bpSys}
              onChangeText={setBpSys}
              keyboardType="number-pad"
              placeholder="--"
              placeholderTextColor={colors.textDisabled}
              maxLength={3}
            />
          </View>
          <View style={styles.vitalInput}>
            <Text style={styles.vitalInputLabel}>BP Diastolic</Text>
            <TextInput
              style={styles.vitalInputField}
              value={bpDia}
              onChangeText={setBpDia}
              keyboardType="number-pad"
              placeholder="--"
              placeholderTextColor={colors.textDisabled}
              maxLength={3}
            />
          </View>
        </View>
      </View>

      {/* Check Now */}
      <Button
        title={checking ? 'Checking...' : `Check Now ${selectedCount > 0 ? `(${selectedCount} symptoms)` : ''}`}
        onPress={handleCheck}
        variant="danger"
        loading={checking}
        disabled={!hasAnySymptoms && !spo2 && !pulse}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.space4,
    paddingBottom: spacing.space12,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    fontFamily: fonts.display,
    letterSpacing: -0.3,
    marginBottom: spacing.space2,
  },
  subtext: {
    fontSize: 13,
    color: colors.textSecondary,
    fontFamily: fonts.body,
    marginBottom: spacing.space5,
  },
  categoryContainer: {
    marginBottom: spacing.space3,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.space4,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  categoryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.space3,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    fontFamily: fonts.body,
  },
  selectedCount: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '500',
    fontFamily: fonts.body,
    marginTop: 2,
  },
  symptomList: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: borderRadius.md,
    borderBottomRightRadius: borderRadius.md,
    padding: spacing.space3,
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: colors.borderLight,
  },
  symptomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.space2 + 2,
  },
  symptomRowSelected: {
    backgroundColor: colors.primarySurface,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.space2,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.space3,
  },
  checkboxSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  symptomLabel: {
    fontSize: 14,
    color: colors.textPrimary,
    fontFamily: fonts.body,
  },
  symptomLabelSelected: {
    fontWeight: '600',
    color: colors.primary,
  },
  quickVitals: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.space4,
    marginBottom: spacing.space5,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  quickVitalsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    fontFamily: fonts.body,
    marginBottom: spacing.space3,
  },
  vitalsRow: {
    flexDirection: 'row',
    marginBottom: spacing.space2,
  },
  vitalInput: {
    flex: 1,
    marginRight: spacing.space3,
  },
  vitalInputLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.textSecondary,
    fontFamily: fonts.body,
    marginBottom: spacing.space1,
  },
  vitalInputField: {
    height: 40,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.space3,
    fontSize: 16,
    color: colors.textPrimary,
    fontFamily: fonts.mono,
  },
});
