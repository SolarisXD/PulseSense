// PulseSense — Vitals Log Screen

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
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
import AnimatedRN, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '../../hooks/useColors';
import { useThemeStore } from '../../store/themeStore';
import { colorsDark } from '../../constants/colorsDark';
import { spacing, borderRadius } from '../../constants/spacing';
import { fonts, scaleSize } from '../../constants/typography';
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
import { useSettingsStore, FONT_SCALE_MULTIPLIERS } from '../../store/settingsStore';

const vitalOptionsConfig: Array<{ key: string; label: string; iconName: keyof typeof Ionicons.glyphMap }> = [
  { key: 'bp', label: 'Blood Pressure', iconName: 'heart-half' },
  { key: 'pulse', label: 'Pulse', iconName: 'pulse' },
  { key: 'spo2', label: 'SpO2', iconName: 'analytics-outline' },
  { key: 'glucose', label: 'Glucose', iconName: 'water-outline' },
  { key: 'temp', label: 'Temperature', iconName: 'thermometer-outline' },
  { key: 'weight', label: 'Weight', iconName: 'scale-outline' },
  { key: 'pain', label: 'Pain Level', iconName: 'bandage-outline' },
];

export function VitalsScreen({ navigation }: any) {
  const c = useColors();
  const isDark = useThemeStore((s) => s.isDark);
  const settings = useSettingsStore();
  const fontScale = useSettingsStore((s) => s.fontScale);
  const fs = FONT_SCALE_MULTIPLIERS[fontScale];
  const sc = useMemo(() => createStyles(fs), [fs]);
  const isSavingRef = useRef(false);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [showSelector, setShowSelector] = useState(true);
  const [selectedVitals, setSelectedVitals] = useState<string[]>([]);
  const [dateTime, setDateTime] = useState(nowDisplay());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

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

  const gradientColors = useMemo(
    () => (isDark ? colorsDark.bgGradientVitals : ['#F0F4F8', '#E8EEF4'] as const) as readonly string[],
    [isDark],
  );

  const pageOpacity = useSharedValue(0);
  useEffect(() => {
    pageOpacity.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.ease) });
  }, []);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
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

  const vitalOptions = useMemo(() =>
    vitalOptionsConfig.map((v) => ({ ...v, selected: selectedVitals.includes(v.key) })),
    [selectedVitals]
  );

  const toggleVital = (key: string) => {
    setSelectedVitals((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleSave = async () => {
    if (isSavingRef.current) return;
    if (selectedVitals.length === 0) {
      Alert.alert('Select Vitals', 'Please select at least one vital to log.');
      return;
    }

    if (isFutureDate(dateTime)) {
      Alert.alert('Invalid Date', 'Future dates are not allowed.');
      return;
    }

    isSavingRef.current = true;
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
      saveTimerRef.current = setTimeout(() => {
        setSaved(false);
        resetForm();
      }, 2000);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to save vitals. Please try again.');
      setSaving(false);
    } finally {
      isSavingRef.current = false;
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
      <LinearGradient colors={gradientColors as any} style={sc.savedContainer}>
        <Animated.View
          style={[
            sc.savedCard,
            { opacity: savedOpacity, transform: [{ scale: savedScale }], backgroundColor: c.surface },
          ]}
        >
          <View style={sc.savedIconContainer}>
            <Ionicons name="checkmark-circle" size={56} color={c.success} />
          </View>
          <Text style={[sc.savedTitle, { color: c.textPrimary }]}>Reading Saved!</Text>
          <Text style={[sc.savedSub, { color: c.textSecondary }]}>Vitals have been recorded successfully.</Text>
          <View style={sc.savedButtons}>
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
      style={[sc.container, { backgroundColor: c.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <AnimatedRN.View style={[{ flex: 1 }, pageStyle]}>
        <ScrollView contentContainerStyle={sc.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {showSelector ? (
            loading ? (
              <View>
                <Skeleton.Box width={220} height={26} style={{ marginBottom: 8 }} />
                <Skeleton.Box width={160} height={14} style={{ marginBottom: 24 }} />
                <View style={sc.vitalGrid}>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton.Box key={i} width={100} height={38} borderRadius={19} style={{ marginRight: 8, marginBottom: 8 }} />
                  ))}
                </View>
                <Skeleton.Box width="100%" height={48} borderRadius={10} />
              </View>
            ) : (
            <View>
              <Text style={[sc.heading, { color: c.textPrimary }]}>What would you like to log?</Text>
              <Text style={[sc.subtext, { color: c.textSecondary }]}>Select one or more vitals</Text>
              <View style={sc.vitalGrid}>
                {vitalOptions.map((v) => (
                  <TouchableOpacity
                    key={v.key}
                    style={[
                      sc.vitalChip,
                      { borderColor: c.border, backgroundColor: c.surface },
                      v.selected && { borderColor: c.primary, backgroundColor: c.primarySurface },
                    ]}
                    onPress={() => toggleVital(v.key)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={v.iconName}
                      size={18}
                      color={v.selected ? c.primary : c.textSecondary}
                      style={{ marginRight: spacing.space2 }}
                    />
                    <Text style={[sc.vitalChipLabel, { color: c.textPrimary }, v.selected && { color: c.primary }]}>
                      {v.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {customDefs.length > 0 && (
                <View style={sc.customSection}>
                  <Text style={[sc.sectionLabel, { color: c.textSecondary }]}>CUSTOM VITALS</Text>
                  <View style={sc.vitalGrid}>
                    {customDefs.map((def) => (
                      <TouchableOpacity
                        key={def.id}
                        style={[
                          sc.vitalChip,
                          { borderColor: c.border, backgroundColor: c.surface },
                          selectedVitals.includes(`custom_${def.id}`) && { borderColor: c.primary, backgroundColor: c.primarySurface },
                        ]}
                        onPress={() => toggleVital(`custom_${def.id}`)}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="flask-outline" size={18} color={selectedVitals.includes(`custom_${def.id}`) ? c.primary : c.textSecondary} style={{ marginRight: spacing.space2 }} />
                        <Text style={[sc.vitalChipLabel, { color: c.textPrimary }]}>{def.name}</Text>
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
            <View>
              <TouchableOpacity onPress={() => setShowSelector(true)} style={sc.changeSelection}>
                <Ionicons name="arrow-back" size={16} color={c.primary} />
                <Text style={[sc.changeSelectionText, { color: c.primary }]}> Change selection</Text>
              </TouchableOpacity>

              <View style={sc.field}>
                <Text style={[sc.label, { color: c.textSecondary }]}>READING TAKEN AT</Text>
                <View style={[sc.dateInputRow, { borderColor: c.border, backgroundColor: c.surface }]}>
                  <Ionicons name="time-outline" size={18} color={c.textSecondary} style={{ marginRight: spacing.space2 }} />
                  <TextInput
                    style={[sc.dateInput, { color: c.textPrimary }]}
                    value={dateTime}
                    onChangeText={setDateTime}
                    placeholder="DD/MM/YYYY HH:MM"
                    placeholderTextColor={c.textDisabled}
                    keyboardType="default"
                  />
                </View>
              </View>

              {selectedVitals.includes('bp') && (
                <VitalFormSection icon="heart-half" title="Blood Pressure">
                  <View style={sc.bpRow}>
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

              <View style={sc.field}>
                <Text style={[sc.label, { color: c.textSecondary }]}>NOTES (optional)</Text>
                <TextInput
                  style={[sc.input, sc.multilineInput, { borderColor: c.border, backgroundColor: c.surface, color: c.textPrimary }]}
                  value={generalNotes}
                  onChangeText={setGeneralNotes}
                  placeholder="General notes for this reading"
                  placeholderTextColor={c.textDisabled}
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

function createStyles(fs: number) { const fn = (size: number) => scaleSize(size, fs); return StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.space4,
    paddingBottom: spacing.space12,
  },
  heading: {
    fontSize: fn(24),
    fontWeight: '700',
    fontFamily: fonts.display,
    letterSpacing: -0.3,
    marginBottom: spacing.space2,
  },
  subtext: {
    fontSize: fn(13),
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
    marginRight: spacing.space2,
    marginBottom: spacing.space2,
  },
  vitalChipLabel: {
    fontSize: fn(13),
    fontFamily: fonts.body,
    fontWeight: '500',
  },
  customSection: {
    marginBottom: spacing.space4,
  },
  sectionLabel: {
    fontSize: fn(11),
    fontWeight: '600',
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
    fontSize: fn(14),
    fontWeight: '500',
    fontFamily: fonts.body,
  },
  field: {
    marginBottom: spacing.space4,
  },
  label: {
    fontSize: fn(12),
    fontWeight: '500',
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
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.space3,
  },
  dateInput: {
    flex: 1,
    fontSize: fn(15),
    fontFamily: fonts.mono,
    paddingVertical: 0,
  },
  input: {
    height: 48,
    borderWidth: 1.5,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.space3,
    fontSize: fn(15),
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
    fontSize: fn(22),
    fontWeight: '700',
    fontFamily: fonts.display,
    marginBottom: spacing.space2,
  },
  savedSub: {
    fontSize: fn(14),
    fontFamily: fonts.body,
    marginBottom: spacing.space6,
    textAlign: 'center',
  },
  savedButtons: {
    flexDirection: 'row',
  },
}); }
