// PulseSense — Add Prescription Screen

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { fonts } from '../../constants/typography';
import { colors } from '../../constants/colors';
import { spacing, borderRadius } from '../../constants/spacing';
import { Button } from '../../components/ui/Button';
import { DosageDisplay } from '../../components/medications/DosageDisplay';
import { getDB, loadStores } from '../../hooks/useDB';
import { insertMedication } from '../../db/queries/medications';
import { useSettingsStore } from '../../store/settingsStore';
import { scheduleMedicationReminder } from '../../services/notificationService';

const TIMING_OPTIONS = ['before_meal', 'after_meal', 'with_meal', 'morning', 'evening', 'bedtime', 'custom'];

interface MedicineRow {
  name: string;
  strength: string;
  morning: number;
  afternoon: number;
  night: number;
  timing: string;
  timingCustom: string;
  duration: string;
  notes: string;
}

export function AddMedicationScreen({ navigation }: any) {
  const [date, setDate] = useState('');
  const [doctor, setDoctor] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [medicines, setMedicines] = useState<MedicineRow[]>([
    { name: '', strength: '', morning: 0, afternoon: 0, night: 0, timing: '', timingCustom: '', duration: '', notes: '' },
  ]);
  const [saving, setSaving] = useState(false);
  const remindersEnabled = useSettingsStore((s) => s.medicationReminders);
  const reminderMorningTime = useSettingsStore((s) => s.reminderMorningTime);
  const reminderAfternoonTime = useSettingsStore((s) => s.reminderAfternoonTime);
  const reminderNightTime = useSettingsStore((s) => s.reminderNightTime);

  const updateMedicine = (idx: number, field: keyof MedicineRow, value: any) => {
    const updated = [...medicines];
    updated[idx] = { ...updated[idx], [field]: value };
    setMedicines(updated);
  };

  const addMedicine = () => {
    setMedicines([...medicines, { name: '', strength: '', morning: 0, afternoon: 0, night: 0, timing: '', timingCustom: '', duration: '', notes: '' }]);
  };

  const removeMedicine = (idx: number) => {
    if (medicines.length <= 1) return;
    setMedicines(medicines.filter((_, i) => i !== idx));
  };

  const toggleDose = (idx: number, slot: 'morning' | 'afternoon' | 'night') => {
    const updated = [...medicines];
    updated[idx][slot] = updated[idx][slot] === 1 ? 0 : 1;
    setMedicines(updated);
  };

  const handleSave = async () => {
    if (!date.trim()) {
      Alert.alert('Required', 'Prescription date is required.');
      return;
    }
    const validItems = medicines.filter((m) => m.name.trim());
    if (validItems.length === 0) {
      Alert.alert('Required', 'At least one medicine is required.');
      return;
    }
    setSaving(true);
    try {
      const db = await getDB();
      await insertMedication(
        db,
        { prescription_date: date.trim(), prescribing_doctor: doctor || null, diagnosis_notes: diagnosis || null },
        validItems.map((m) => ({
          medicine_name: m.name.trim(),
          strength: m.strength || null,
          dose_morning: m.morning,
          dose_afternoon: m.afternoon,
          dose_night: m.night,
          timing: m.timing || null,
          timing_custom: m.timingCustom || null,
          duration: m.duration || null,
          notes: m.notes || null,
        }))
      );
      await loadStores(db);

      // Schedule medication reminders if enabled
      if (remindersEnabled) {
        try {
          for (let i = 0; i < validItems.length; i++) {
            const item = validItems[i];
            const reminderId = `${item.name}-${i}-${Date.now()}`;
            await scheduleMedicationReminder(
              reminderId,
              item.name,
              item.morning,
              item.afternoon,
              item.night,
              item.timing || null,
              reminderMorningTime,
              reminderAfternoonTime,
              reminderNightTime,
            );
          }
        } catch (notifErr) {
          console.warn('Failed to schedule reminders:', notifErr);
        }
      }

      navigation.goBack();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to save prescription.');
    }
    setSaving(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.label}>PRESCRIPTION DATE *</Text>
      <TextInput style={styles.input} value={date} onChangeText={setDate} placeholder="DD/MM/YYYY" placeholderTextColor={colors.textDisabled} keyboardType="number-pad" maxLength={10} />

      <Text style={styles.label}>PRESCRIBING DOCTOR</Text>
      <TextInput style={styles.input} value={doctor} onChangeText={setDoctor} placeholder="Doctor's name" placeholderTextColor={colors.textDisabled} />

      <Text style={styles.label}>DIAGNOSIS / NOTES</Text>
      <TextInput style={[styles.input, styles.multiline]} value={diagnosis} onChangeText={setDiagnosis} placeholder="What this prescription is for" placeholderTextColor={colors.textDisabled} multiline numberOfLines={2} />

      <Text style={[styles.label, { marginTop: spacing.space6 }]}>MEDICINES</Text>
      {medicines.map((med, idx) => (
        <View key={idx} style={styles.medicineCard}>
          <View style={styles.medHeader}>
            <Text style={styles.medNumber}>Medicine #{idx + 1}</Text>
            {medicines.length > 1 && (
              <TouchableOpacity onPress={() => removeMedicine(idx)}>
                <Text style={styles.removeText}>Remove</Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.subLabel}>Name</Text>
          <TextInput style={styles.input} value={med.name} onChangeText={(t) => updateMedicine(idx, 'name', t)} placeholder="Medicine name" placeholderTextColor={colors.textDisabled} />

          <Text style={styles.subLabel}>Strength</Text>
          <TextInput style={styles.input} value={med.strength} onChangeText={(t) => updateMedicine(idx, 'strength', t)} placeholder="e.g. 500mg" placeholderTextColor={colors.textDisabled} />

          <Text style={styles.subLabel}>Dosage (M / A / N)</Text>
          <View style={styles.dosageRow}>
            <DosageDisplay morning={med.morning} afternoon={med.afternoon} night={med.night} />
            <View style={styles.dosageButtons}>
              <TouchableOpacity style={[styles.doseBtn, med.morning === 1 && styles.doseBtnActive]} onPress={() => toggleDose(idx, 'morning')}>
                <Text style={[styles.doseBtnText, med.morning === 1 && styles.doseBtnTextActive]}>M</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.doseBtn, med.afternoon === 1 && styles.doseBtnActive]} onPress={() => toggleDose(idx, 'afternoon')}>
                <Text style={[styles.doseBtnText, med.afternoon === 1 && styles.doseBtnTextActive]}>A</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.doseBtn, med.night === 1 && styles.doseBtnActive]} onPress={() => toggleDose(idx, 'night')}>
                <Text style={[styles.doseBtnText, med.night === 1 && styles.doseBtnTextActive]}>N</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.subLabel}>Timing</Text>
          <View style={styles.optionsRow}>
            {TIMING_OPTIONS.map((t) => (
              <TouchableOpacity key={t} style={[styles.tinyChip, med.timing === t && styles.chipSelected]} onPress={() => updateMedicine(idx, 'timing', t)}>
                <Text style={[styles.tinyChipText, med.timing === t && styles.chipTextSelected]}>{t.replace('_', ' ')}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.subLabel}>Duration</Text>
          <TextInput style={styles.input} value={med.duration} onChangeText={(t) => updateMedicine(idx, 'duration', t)} placeholder="e.g. 7 days, Ongoing" placeholderTextColor={colors.textDisabled} />
        </View>
      ))}

      <Button title="+ Add Another Medicine" onPress={addMedicine} variant="outline" style={{ marginBottom: spacing.space6 }} />
      <Button title={saving ? 'Saving...' : 'Save Prescription'} onPress={handleSave} loading={saving} disabled={!date.trim()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.space4, paddingBottom: spacing.space12 },
  label: { fontSize: 12, fontWeight: '500', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: fonts.body, marginBottom: spacing.space2, marginTop: spacing.space4 },
  subLabel: { fontSize: 11, color: colors.textSecondary, fontFamily: fonts.body, marginBottom: spacing.space1, marginTop: spacing.space3 },
  input: { height: 44, borderWidth: 1.5, borderColor: colors.border, borderRadius: borderRadius.sm, paddingHorizontal: spacing.space3, fontSize: 14, color: colors.textPrimary, fontFamily: fonts.body, backgroundColor: colors.surface, marginBottom: spacing.space2 },
  multiline: { height: 60, paddingTop: spacing.space3, textAlignVertical: 'top' },
  medicineCard: { backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.space4, marginBottom: spacing.space4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 2, elevation: 1 },
  medHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.space3 },
  medNumber: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, fontFamily: fonts.body },
  removeText: { fontSize: 12, color: colors.danger, fontFamily: fonts.body },
  dosageRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dosageButtons: { flexDirection: 'row' },
  doseBtn: { width: 32, height: 32, borderRadius: 6, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', marginLeft: spacing.space2 },
  doseBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  doseBtnText: { fontSize: 12, fontWeight: '700', color: colors.textSecondary, fontFamily: fonts.body },
  doseBtnTextActive: { color: '#FFFFFF' },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap' },
  tinyChip: { paddingVertical: spacing.space1 + 2, paddingHorizontal: spacing.space2 + 2, borderRadius: borderRadius.full, borderWidth: 1, borderColor: colors.border, marginRight: spacing.space1, marginBottom: spacing.space1 },
  tinyChipText: { fontSize: 10, color: colors.textPrimary, fontFamily: fonts.body },
  chipSelected: { borderColor: colors.primary, backgroundColor: colors.primarySurface },
  chipTextSelected: { color: colors.primary, fontWeight: '600' },
});
