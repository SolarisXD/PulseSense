// PulseSense — Vitals Log Screen (Tab entry point)
// Shows vital selector and logs vitals — with motion, proper icons, refined UI

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AnimatedRN, { useSharedValue, useAnimatedStyle, withSpring, withTiming, Easing } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../constants/colors';
import { spacing, borderRadius } from '../../constants/spacing';
import { fonts } from '../../constants/typography';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { VitalInputField } from '../../components/vitals/VitalInputField';
import { VitalFormSection } from '../../components/vitals/VitalFormSection';
import { PainSlider } from '../../components/vitals/PainSlider';
import { CycleDropdown } from '../../components/ui/CycleDropdown';
import { getDB } from '../../hooks/useDB';
import { insertVitalLog } from '../../db/queries/vitals';
import { getCustomVitalDefinitions } from '../../db/queries/customVitals';
import { insertCustomVitalLog } from '../../db/queries/customVitals';
import { evaluateVitalThresholds } from '../../engine/ruleEngine';
import { insertAlert, getActiveAlerts } from '../../db/queries/emergency';
import { useAlertStore } from '../../store/alertStore';
import { getBpStatus, getPulseStatus, getSpo2Status, getTempStatus } from '../../utils/vitalStatus';
import { tryParseNumber, tryParseInt, hasInvalidNumber } from '../../utils/vitalFormHelpers';
import { nowDisplay, isFutureDate, displayToIso } from '../../utils/dateUtils';
import { useSettingsStore } from '../../store/settingsStore';

interface VitalToggle {
  key: string;
  label: string;
  iconName: keyof typeof Ionicons.glyphMap;
  selected: boolean;
}

export function VitalsScreen({ navigation }: any) {
  const settings = useSettingsStore();
  const [showSelector, setShowSelector] = useState(true);
  const [selectedVitals, setSelectedVitals] = useState<string[]>([]);
  const [dateTime, setDateTime] = useState(nowDisplay());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Form values
  const [bpSys, setBpSys] = useState('');
  const [bpDia, setBpDia] = useState('');
  const [bpPosition, setBpPosition] = useState(settings.bpDefaultPosition);
  const [pulse, setPulse] = useState('');
  const [spo2, setSpo2] = useState('');
  const [glucose, setGlucose] = useState('');
  const [glucoseContext, setGlucoseContext] = useState('random');
  const [temp, setTemp] = useState('');
  const [weight, setWeight] = useState('');
  const [painLevel, setPainLevel] = useState(0);
  const [painLocation, setPainLocation] = useState('');
  const [painNotes, setPainNotes] = useState('');
  const [generalNotes, setGeneralNotes] = useState('');
  const [customDefs, setCustomDefs] = useState<any[]>([]);
  const [customValues, setCustomValues] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);

  // Entrance animation
  const pageOpacity = useSharedValue(0);
  useEffect(() => {
    pageOpacity.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.ease) });
  }, []);

  const pageStyle = useAnimatedStyle(() => ({ opacity: pageOpacity.value }));

  useFocusEffect(
    useCallback(() => {
      loadCustomDefs();
    }, [])
  );

  const loadCustomDefs = async () => {
    setLoading(true);
    try {
      const db = await getDB();
      const defs = await getCustomVitalDefinitions(db);
      setCustomDefs(defs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const vitalOptions: VitalToggle[] = [
    { key: 'bp', label: 'Blood Pressure', iconName: 'heart-half', selected: selectedVitals.includes('bp') },
    { key: 'pulse', label: 'Pulse', iconName: 'pulse', selected: selectedVitals.includes('pulse') },
    { key: 'spo2', label: 'SpO2', iconName: 'analytics-outline', selected: selectedVitals.includes('spo2') },
    { key: 'glucose', label: 'Glucose', iconName: 'water-outline', selected: selectedVitals.includes('glucose') },
    { key: 'temp', label: 'Temperature', iconName: 'thermometer-outline', selected: selectedVitals.includes('temp') },
    { key: 'weight', label: 'Weight', iconName: 'scale-outline', selected: selectedVitals.includes('weight') },
    { key: 'pain', label: 'Pain Level', iconName: 'bandage-outline', selected: selectedVitals.includes('pain') },
  ];

  const toggleVital = (key: string) => {
    setSelectedVitals((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleSave = async () => {
    if (selectedVitals.length === 0) {
      Alert.alert('Select Vitals', 'Please select at least one vital to log.');
      return;
    }

    if (isFutureDate(dateTime)) {
      Alert.alert('Invalid Date', 'Future dates are not allowed.');
      return;
    }

    setSaving(true);
    try {
      const parsedBpSys = tryParseInt(bpSys);
      const parsedBpDia = tryParseInt(bpDia);
      const parsedPulse = tryParseInt(pulse);
      const parsedSpo2 = tryParseNumber(spo2);
      const parsedGlucose = tryParseNumber(glucose);
      const parsedTemp = tryParseNumber(temp);
      const parsedWeight = tryParseNumber(weight);

      if (hasInvalidNumber(parsedBpSys, parsedBpDia, parsedPulse, parsedSpo2, parsedGlucose, parsedTemp, parsedWeight)) {
        Alert.alert('Invalid Input', 'Please enter valid numbers for vital signs.');
        setSaving(false);
        return;
      }

      const db = await getDB();
      const loggedAtIso = displayToIso(dateTime);

      const logId = await insertVitalLog(db, {
        logged_at_display: dateTime,
        logged_at_iso: loggedAtIso,
        bp_sys: parsedBpSys,
        bp_dia: parsedBpDia,
        bp_position: bpPosition,
        pulse: parsedPulse,
        spo2: parsedSpo2,
        glucose_value: parsedGlucose,
        glucose_unit: settings.glucoseUnit,
        glucose_context: glucose ? glucoseContext : null,
        temp_value: parsedTemp,
        temp_unit: settings.tempUnit,
        weight_value: parsedWeight,
        weight_unit: settings.weightUnit,
        pain_level: selectedVitals.includes('pain') ? painLevel : null,
        pain_location: painLocation || null,
        pain_notes: painNotes || null,
        notes: generalNotes || null,
      });

      for (const def of customDefs) {
        const val = customValues[def.id];
        if (val) {
          const parsedVal = parseFloat(val);
          if (isNaN(parsedVal)) {
            Alert.alert('Invalid Input', `Please enter a valid number for "${def.name}".`);
            setSaving(false);
            return;
          }
          await insertCustomVitalLog(db, {
            vital_definition_id: def.id,
            vital_log_id: logId,
            logged_at_display: dateTime,
            logged_at_iso: loggedAtIso,
            value: parsedVal,
          });
        }
      }

      const alert = evaluateVitalThresholds({
        bp_sys: parsedBpSys,
        bp_dia: parsedBpDia,
        pulse: parsedPulse,
        spo2: parsedSpo2,
        temp_value: parsedTemp,
        glucose_value: parsedGlucose,
        glucose_context: glucoseContext,
        pain_level: painLevel,
      });

      if (alert) {
        await insertAlert(db, { ...alert, vital_log_id: logId, symptom_event_id: null, vitals_snapshot: null });
        const activeAlerts = await getActiveAlerts(db);
        useAlertStore.getState().setActiveAlerts(activeAlerts);
      }

      setSaving(false);
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        resetForm();
      }, 2000);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to save vitals. Please try again.');
      setSaving(false);
    }
  };

  const resetForm = () => {
    setSelectedVitals([]);
    setShowSelector(true);
    setDateTime(nowDisplay());
    setBpSys(''); setBpDia(''); setPulse(''); setSpo2('');
    setGlucose(''); setTemp(''); setWeight(''); setPainLevel(0);
    setPainLocation(''); setPainNotes(''); setGeneralNotes('');
    setCustomValues({});
  };

  // Animated success state
  const savedScale = useRef(new Animated.Value(0.9)).current;
  const savedOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (saved) {
      savedScale.setValue(0.9);
      savedOpacity.setValue(0);
      Animated.parallel([
        Animated.spring(savedScale, { toValue: 1, useNativeDriver: true, damping: 12, stiffness: 200 }),
        Animated.timing(savedOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();
    }
  }, [saved]);

  if (saved) {
    return (
      <LinearGradient colors={['#F0F4F8', '#E8EEF4']} style={styles.savedContainer}>
        <Animated.View
          style={[
            styles.savedCard,
            { opacity: savedOpacity, transform: [{ scale: savedScale }] },
          ]}
        >
          <View style={styles.savedIconContainer}>
            <Ionicons name="checkmark-circle" size={56} color={colors.success} />
          </View>
          <Text style={styles.savedTitle}>Reading Saved!</Text>
          <Text style={styles.savedSub}>Vitals have been recorded successfully.</Text>
          <View style={styles.savedButtons}>
            <Button title="Log Another" onPress={() => { setSaved(false); resetForm(); }} variant="outline" size="medium" />
            <View style={{ width: 12 }} />
            <Button title="Back to Home" onPress={() => { navigation.navigate('HomeTab'); }} variant="primary" size="medium" />
          </View>
        </Animated.View>
      </LinearGradient>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <AnimatedRN.View style={[{ flex: 1 }, pageStyle]}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {/* Vital Selector */}
          {showSelector ? (
            loading ? (
              <View>
                <Skeleton.Box width={220} height={26} style={{ marginBottom: 8 }} />
                <Skeleton.Box width={160} height={14} style={{ marginBottom: 24 }} />
                <View style={styles.vitalGrid}>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton.Box key={i} width={100} height={38} borderRadius={19} style={{ marginRight: 8, marginBottom: 8 }} />
                  ))}
                </View>
                <Skeleton.Box width="100%" height={48} borderRadius={10} />
              </View>
            ) : (
            <View>
              <Text style={styles.heading}>What would you like to log?</Text>
              <Text style={styles.subtext}>Select one or more vitals</Text>
              <View style={styles.vitalGrid}>
                {vitalOptions.map((v) => (
                  <TouchableOpacity
                    key={v.key}
                    style={[styles.vitalChip, v.selected && styles.vitalChipSelected]}
                    onPress={() => toggleVital(v.key)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={v.iconName}
                      size={18}
                      color={v.selected ? colors.primary : colors.textSecondary}
                      style={{ marginRight: spacing.space2 }}
                    />
                    <Text style={[styles.vitalChipLabel, v.selected && styles.vitalChipLabelSelected]}>
                      {v.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {customDefs.length > 0 && (
                <View style={styles.customSection}>
                  <Text style={styles.sectionLabel}>CUSTOM VITALS</Text>
                  <View style={styles.vitalGrid}>
                    {customDefs.map((def) => (
                      <TouchableOpacity
                        key={def.id}
                        style={[styles.vitalChip, selectedVitals.includes(`custom_${def.id}`) && styles.vitalChipSelected]}
                        onPress={() => toggleVital(`custom_${def.id}`)}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="flask-outline" size={18} color={selectedVitals.includes(`custom_${def.id}`) ? colors.primary : colors.textSecondary} style={{ marginRight: spacing.space2 }} />
                        <Text style={styles.vitalChipLabel}>{def.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              <Button
                title="Log Selected"
                onPress={() => setShowSelector(false)}
                disabled={selectedVitals.length === 0}
              />
            </View>
          )
        ) : (
            /* Vital Form */
            <View>
              <TouchableOpacity onPress={() => setShowSelector(true)} style={styles.changeSelection}>
                <Ionicons name="arrow-back" size={16} color={colors.primary} />
                <Text style={styles.changeSelectionText}> Change selection</Text>
              </TouchableOpacity>

              {/* Date/Time Field */}
              <View style={styles.field}>
                <Text style={styles.label}>READING TAKEN AT</Text>
                <View style={styles.dateInputRow}>
                  <Ionicons name="time-outline" size={18} color={colors.textSecondary} style={{ marginRight: spacing.space2 }} />
                  <TextInput
                    style={styles.dateInput}
                    value={dateTime}
                    onChangeText={setDateTime}
                    placeholder="DD/MM/YYYY HH:MM"
                    placeholderTextColor={colors.textDisabled}
                    keyboardType="default"
                  />
                </View>
              </View>

              {selectedVitals.includes('bp') && (
                <VitalFormSection icon="heart-half" title="Blood Pressure">
                  <View style={styles.bpRow}>
                    <VitalInputField
                      label="Systolic"
                      value={bpSys}
                      onChangeText={setBpSys}
                      unit="mmHg"
                      placeholder="120"
                      status={bpSys ? getBpStatus(parseInt(bpSys, 10), bpDia ? parseInt(bpDia, 10) : null) : undefined}
                    />
                    <View style={{ width: 12 }} />
                    <VitalInputField
                      label="Diastolic"
                      value={bpDia}
                      onChangeText={setBpDia}
                      unit="mmHg"
                      placeholder="80"
                      status={bpDia ? getBpStatus(bpSys ? parseInt(bpSys, 10) : null, parseInt(bpDia, 10)) : undefined}
                    />
                  </View>
                  <CycleDropdown
                    label="Position"
                    value={bpPosition}
                    options={['sitting', 'standing', 'lying']}
                    onChange={(v) => setBpPosition(v as 'sitting' | 'standing' | 'lying')}
                  />
                </VitalFormSection>
              )}

              {selectedVitals.includes('pulse') && (
                <VitalFormSection icon="pulse" title="Pulse">
                  <VitalInputField
                    label="Pulse"
                    value={pulse}
                    onChangeText={setPulse}
                    unit="bpm"
                    placeholder="72"
                    status={pulse ? getPulseStatus(parseInt(pulse, 10)) : undefined}
                  />
                </VitalFormSection>
              )}

              {selectedVitals.includes('spo2') && (
                <VitalFormSection icon="analytics-outline" title="SpO2">
                  <VitalInputField
                    label="SpO2"
                    value={spo2}
                    onChangeText={setSpo2}
                    unit="%"
                    placeholder="98"
                    status={spo2 ? getSpo2Status(parseFloat(spo2)) : undefined}
                  />
                </VitalFormSection>
              )}

              {selectedVitals.includes('glucose') && (
                <VitalFormSection icon="water-outline" title="Glucose">
                  <VitalInputField label="Glucose" value={glucose} onChangeText={setGlucose} unit={settings.glucoseUnit} placeholder="100" />
                  <CycleDropdown
                    label="Context"
                    value={glucoseContext}
                    options={['fasting', 'post_meal', 'random', 'pre_meal']}
                    onChange={setGlucoseContext}
                    formatValue={(v) => v.replace('_', ' ')}
                  />
                </VitalFormSection>
              )}

              {selectedVitals.includes('temp') && (
                <VitalFormSection icon="thermometer-outline" title="Temperature">
                  <VitalInputField label="Temperature" value={temp} onChangeText={setTemp} unit={`°${settings.tempUnit}`} placeholder="36.6" status={temp ? getTempStatus(parseFloat(temp)) : undefined} />
                </VitalFormSection>
              )}

              {selectedVitals.includes('weight') && (
                <VitalFormSection icon="scale-outline" title="Weight">
                  <VitalInputField label="Weight" value={weight} onChangeText={setWeight} unit={settings.weightUnit} placeholder="70" />
                </VitalFormSection>
              )}

              {selectedVitals.includes('pain') && (
                <VitalFormSection icon="bandage-outline" title="Pain Level">
                  <PainSlider value={painLevel} onChange={setPainLevel} />
                  <VitalInputField label="Location of Pain" value={painLocation} onChangeText={setPainLocation} placeholder="e.g. Lower back" keyboardType="default" />
                  <VitalInputField label="Pain Notes" value={painNotes} onChangeText={setPainNotes} placeholder="Any details about the pain" keyboardType="default" />
                </VitalFormSection>
              )}

              {customDefs.filter((d) => selectedVitals.includes(`custom_${d.id}`)).map((def) => (
                <VitalFormSection key={def.id} icon="flask-outline" title={def.name}>
                  <VitalInputField
                    label={def.name}
                    value={customValues[def.id] || ''}
                    onChangeText={(t) => setCustomValues((prev) => ({ ...prev, [def.id]: t }))}
                    unit={def.unit}
                    placeholder={`Normal: ${def.normal_min || '-'} - ${def.normal_max || '-'}`}
                  />
                </VitalFormSection>
              ))}

              {/* General Notes */}
              <View style={styles.field}>
                <Text style={styles.label}>NOTES (optional)</Text>
                <TextInput
                  style={[styles.input, styles.multilineInput]}
                  value={generalNotes}
                  onChangeText={setGeneralNotes}
                  placeholder="General notes for this reading"
                  placeholderTextColor={colors.textDisabled}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <Button title={saving ? 'Saving...' : 'Save Reading'} onPress={handleSave} loading={saving} />
            </View>
          )}
        </ScrollView>
      </AnimatedRN.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
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
  vitalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.space5,
  },
  vitalChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.space3,
    paddingHorizontal: spacing.space4,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginRight: spacing.space2,
    marginBottom: spacing.space2,
  },
  vitalChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySurface,
  },
  vitalChipLabel: {
    fontSize: 13,
    color: colors.textPrimary,
    fontFamily: fonts.body,
    fontWeight: '500',
  },
  vitalChipLabelSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  customSection: {
    marginBottom: spacing.space4,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 0.5,
    fontFamily: fonts.body,
    marginBottom: spacing.space2,
  },
  changeSelection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.space5,
  },
  changeSelectionText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
    fontFamily: fonts.body,
  },
  field: {
    marginBottom: spacing.space4,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: fonts.body,
    marginBottom: spacing.space2,
  },
  dateInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.space3,
  },
  dateInput: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
    fontFamily: fonts.mono,
    paddingVertical: 0,
  },
  input: {
    height: 48,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.space3,
    fontSize: 15,
    color: colors.textPrimary,
    fontFamily: fonts.body,
  },
  multilineInput: {
    height: 80,
    paddingTop: spacing.space3,
    textAlignVertical: 'top',
  },
  bpRow: {
    flexDirection: 'row',
  },
  savedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.space6,
  },
  savedCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.space8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    width: '100%',
    maxWidth: 320,
  },
  savedIconContainer: {
    marginBottom: spacing.space4,
  },
  savedTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    fontFamily: fonts.display,
    marginBottom: spacing.space2,
  },
  savedSub: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: fonts.body,
    marginBottom: spacing.space6,
    textAlign: 'center',
  },
  savedButtons: {
    flexDirection: 'row',
  },
});
