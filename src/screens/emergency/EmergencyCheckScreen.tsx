// PulseSense — Emergency Check Screen
// Symptom checklist by category with optional quick vitals

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
import { colors, spacing, borderRadius } from '../../constants/spacing';
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
    icon: '🧠',
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
    icon: '❤️',
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
    icon: '🫁',
    symptoms: [
      { key: 'shortness_breath', label: 'Sudden severe breathlessness' },
    ],
  },
  {
    id: 'consciousness',
    label: 'Unconscious / Not Breathing',
    icon: '🆘',
    symptoms: [
      { key: 'unconscious', label: 'Unconscious / unresponsive' },
      { key: 'not_breathing', label: 'Not breathing normally' },
    ],
  },
  {
    id: 'bleeding',
    label: 'Severe Bleeding',
    icon: '🩸',
    symptoms: [
      { key: 'severe_bleeding', label: 'Severe / uncontrolled bleeding' },
    ],
  },
  {
    id: 'allergy',
    label: 'Severe Allergic Reaction',
    icon: '⚠️',
    symptoms: [
      { key: 'anaphylaxis', label: 'Signs of anaphylaxis (swelling, hives, wheezing)' },
    ],
  },
  {
    id: 'other',
    label: 'Other / Not Sure',
    icon: '❓',
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
      // Validate numeric inputs — guard against NaN from invalid text
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

      // Save to DB
      const db = await getDB();
      const eventId = await insertSymptomEvent(db, input, nowIso());
      await insertRuleTriggers(db, eventId, results);

      // Create alert for highest severity
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

      // Update alert store
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>What is happening?</Text>
      <Text style={styles.subtext}>Select all symptoms that apply</Text>

      {CATEGORIES.map((cat) => (
        <View key={cat.id} style={styles.categoryContainer}>
          <TouchableOpacity
            style={styles.categoryCard}
            onPress={() => setExpandedCategory(expandedCategory === cat.id ? null : cat.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.categoryIcon}>{cat.icon}</Text>
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryLabel}>{cat.label}</Text>
              {expandedCategory === cat.id && (
                <Text style={styles.selectedCount}>
                  {cat.symptoms.filter((s) => symptoms[s.key as keyof SymptomInput]).length} selected
                </Text>
              )}
            </View>
            <Text style={styles.expandIcon}>{expandedCategory === cat.id ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {expandedCategory === cat.id && (
            <View style={styles.symptomList}>
              {cat.symptoms.map((symp) => (
                <TouchableOpacity
                  key={symp.key}
                  style={[
                    styles.symptomRow,
                    symptoms[symp.key as keyof SymptomInput] ? styles.symptomRowSelected : undefined,
                  ]}
                  onPress={() => toggleSymptom(symp.key as keyof SymptomInput)}
                >
                  <View style={[
                    styles.checkbox,
                    symptoms[symp.key as keyof SymptomInput] ? styles.checkboxSelected : undefined,
                  ]}>
                    {symptoms[symp.key as keyof SymptomInput] && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </View>
                  <Text style={[
                    styles.symptomLabel,
                    symptoms[symp.key as keyof SymptomInput] ? styles.symptomLabelSelected : undefined,
                  ]}>
                    {symp.label}
                  </Text>
                </TouchableOpacity>
              ))}
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
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    fontFamily: 'Inter',
    marginBottom: spacing.space2,
  },
  subtext: {
    fontSize: 13,
    color: colors.textSecondary,
    fontFamily: 'Inter',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: spacing.space3,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    fontFamily: 'Inter',
  },
  selectedCount: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '500',
    fontFamily: 'Inter',
    marginTop: 2,
  },
  expandIcon: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  symptomList: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: borderRadius.md,
    borderBottomRightRadius: borderRadius.md,
    padding: spacing.space3,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
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
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  symptomLabel: {
    fontSize: 14,
    color: colors.textPrimary,
    fontFamily: 'Inter',
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
    fontFamily: 'Inter',
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
    fontFamily: 'Inter',
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
    fontFamily: 'RobotoMono',
  },
});
