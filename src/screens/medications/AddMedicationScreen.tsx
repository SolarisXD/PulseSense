// PulseSense — Add Prescription Screen

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useColors } from '../../hooks/useColors';
import { fonts } from '../../constants/typography';
import { spacing, borderRadius } from '../../constants/spacing';
import { Button } from '../../components/ui/Button';
import { DosageDisplay } from '../../components/medications/DosageDisplay';
import { getDB, loadStores } from '../../hooks/useDB';
import { insertMedication, updateMedication, updateMedicationItems } from '../../db/queries/medications';
import { useSettingsStore } from '../../store/settingsStore';
import { rescheduleAllMedicationReminders } from '../../services/notificationService';
import { formatDateInput } from '../../utils/dateUtils';

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

export function AddMedicationScreen({ navigation, route }: any) {
  const c = useColors();
  const editing = route?.params?.medication ?? null;
  const isEdit = !!editing;

  const [date, setDate] = useState('');
  const [doctor, setDoctor] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [medicines, setMedicines] = useState<MedicineRow[]>([
    { name: '', strength: '', morning: 0, afternoon: 0, night: 0, timing: '', timingCustom: '', duration: '', notes: '' },
  ]);

  useEffect(() => {
    navigation.setOptions({ title: isEdit ? 'Edit Prescription' : 'Add Prescription' });
    if (editing) {
      setDate(editing.prescription_date || '');
      setDoctor(editing.prescribing_doctor || '');
      setDiagnosis(editing.diagnosis_notes || '');
      if (editing.items?.length) {
        setMedicines(
          editing.items.map((item: any) => ({
            name: item.medicine_name || '',
            strength: item.strength || '',
            morning: item.dose_morning ?? 0,
            afternoon: item.dose_afternoon ?? 0,
            night: item.dose_night ?? 0,
            timing: item.timing || '',
            timingCustom: item.timing_custom || '',
            duration: item.duration || '',
            notes: item.notes || '',
          }))
        );
      }
    }
  }, [editing]);
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
      const itemsData = validItems.map((m) => ({
        medicine_name: m.name.trim(),
        strength: m.strength || null,
        dose_morning: m.morning,
        dose_afternoon: m.afternoon,
        dose_night: m.night,
        timing: m.timing || null,
        timing_custom: m.timingCustom || null,
        duration: m.duration || null,
        notes: m.notes || null,
      }));

      if (isEdit) {
        await updateMedication(
          db,
          editing.id,
          { prescription_date: date.trim(), prescribing_doctor: doctor || null, diagnosis_notes: diagnosis || null }
        );
        await updateMedicationItems(db, editing.id, itemsData);
        await loadStores(db);

        if (remindersEnabled) {
          try {
            await rescheduleAllMedicationReminders(
              reminderMorningTime,
              reminderAfternoonTime,
              reminderNightTime,
            );
          } catch (notifErr) {
            console.warn('Failed to schedule reminders:', notifErr);
          }
        }
      } else {
        await insertMedication(
          db,
          { prescription_date: date.trim(), prescribing_doctor: doctor || null, diagnosis_notes: diagnosis || null },
          itemsData
        );
        await loadStores(db);

        if (remindersEnabled) {
          try {
            await rescheduleAllMedicationReminders(
              reminderMorningTime,
              reminderAfternoonTime,
              reminderNightTime,
            );
          } catch (notifErr) {
            console.warn('Failed to schedule reminders:', notifErr);
          }
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
    <ScrollView style={[styles.container, { backgroundColor: c.background }]} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={[styles.label, { color: c.textSecondary }]}>PRESCRIPTION DATE *</Text>
      <TextInput style={[styles.input, { borderColor: c.border, color: c.textPrimary, backgroundColor: c.surface }]} value={date} onChangeText={(t) => setDate(formatDateInput(t))} placeholder="DD/MM/YYYY" placeholderTextColor={c.textDisabled} keyboardType="number-pad" maxLength={10} />

      <Text style={[styles.label, { color: c.textSecondary }]}>PRESCRIBING DOCTOR</Text>
      <TextInput style={[styles.input, { borderColor: c.border, color: c.textPrimary, backgroundColor: c.surface }]} value={doctor} onChangeText={setDoctor} placeholder="Doctor's name" placeholderTextColor={c.textDisabled} />

      <Text style={[styles.label, { color: c.textSecondary }]}>DIAGNOSIS / NOTES</Text>
      <TextInput style={[styles.input, styles.multiline, { borderColor: c.border, color: c.textPrimary, backgroundColor: c.surface }]} value={diagnosis} onChangeText={setDiagnosis} placeholder="What this prescription is for" placeholderTextColor={c.textDisabled} multiline numberOfLines={2} />

      <Text style={[styles.label, { marginTop: spacing.space6, color: c.textSecondary }]}>MEDICINES</Text>
      {medicines.map((med, idx) => (
        <View key={idx} style={[styles.medicineCard, { backgroundColor: c.surface }]}>
          <View style={styles.medHeader}>
            <Text style={[styles.medNumber, { color: c.textPrimary }]}>Medicine #{idx + 1}</Text>
            {medicines.length > 1 && (
              <TouchableOpacity onPress={() => removeMedicine(idx)}>
                <Text style={[styles.removeText, { color: c.danger }]}>Remove</Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={[styles.subLabel, { color: c.textSecondary }]}>Name</Text>
          <TextInput style={[styles.input, { borderColor: c.border, color: c.textPrimary, backgroundColor: c.surface }]} value={med.name} onChangeText={(t) => updateMedicine(idx, 'name', t)} placeholder="Medicine name" placeholderTextColor={c.textDisabled} />

          <Text style={[styles.subLabel, { color: c.textSecondary }]}>Strength</Text>
          <TextInput style={[styles.input, { borderColor: c.border, color: c.textPrimary, backgroundColor: c.surface }]} value={med.strength} onChangeText={(t) => updateMedicine(idx, 'strength', t)} placeholder="e.g. 500mg" placeholderTextColor={c.textDisabled} />

          <Text style={[styles.subLabel, { color: c.textSecondary }]}>Dosage (M / A / N)</Text>
          <View style={styles.dosageRow}>
            <DosageDisplay morning={med.morning} afternoon={med.afternoon} night={med.night} />
            <View style={styles.dosageButtons}>
              <TouchableOpacity style={[styles.doseBtn, { borderColor: c.border }, med.morning === 1 && { backgroundColor: c.primary, borderColor: c.primary }]} onPress={() => toggleDose(idx, 'morning')}>
                <Text style={[styles.doseBtnText, { color: c.textSecondary }, med.morning === 1 && { color: '#FFFFFF' }]}>M</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.doseBtn, { borderColor: c.border }, med.afternoon === 1 && { backgroundColor: c.primary, borderColor: c.primary }]} onPress={() => toggleDose(idx, 'afternoon')}>
                <Text style={[styles.doseBtnText, { color: c.textSecondary }, med.afternoon === 1 && { color: '#FFFFFF' }]}>A</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.doseBtn, { borderColor: c.border }, med.night === 1 && { backgroundColor: c.primary, borderColor: c.primary }]} onPress={() => toggleDose(idx, 'night')}>
                <Text style={[styles.doseBtnText, { color: c.textSecondary }, med.night === 1 && { color: '#FFFFFF' }]}>N</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={[styles.subLabel, { color: c.textSecondary }]}>Timing</Text>
          <View style={styles.optionsRow}>
            {TIMING_OPTIONS.map((t) => (
              <TouchableOpacity key={t} style={[styles.tinyChip, { borderColor: c.border, backgroundColor: c.surface }, med.timing === t && { borderColor: c.primary, backgroundColor: c.primarySurface }]} onPress={() => updateMedicine(idx, 'timing', t)}>
                <Text style={[styles.tinyChipText, { color: c.textPrimary }, med.timing === t && { color: c.primary }]}>{t.replace('_', ' ')}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.subLabel, { color: c.textSecondary }]}>Duration</Text>
          <TextInput style={[styles.input, { borderColor: c.border, color: c.textPrimary, backgroundColor: c.surface }]} value={med.duration} onChangeText={(t) => updateMedicine(idx, 'duration', t)} placeholder="e.g. 7 days, Ongoing" placeholderTextColor={c.textDisabled} />
        </View>
      ))}

      <Button title="+ Add Another Medicine" onPress={addMedicine} variant="outline" style={{ marginBottom: spacing.space6 }} />
      <Button title={saving ? 'Saving...' : isEdit ? 'Update Prescription' : 'Save Prescription'} onPress={handleSave} loading={saving} disabled={!date.trim()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.space4, paddingBottom: spacing.space12 },
  label: { fontSize: 12, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: fonts.body, marginBottom: spacing.space2, marginTop: spacing.space4 },
  subLabel: { fontSize: 11, fontFamily: fonts.body, marginBottom: spacing.space1, marginTop: spacing.space3 },
  input: { height: 44, borderWidth: 1.5, borderRadius: borderRadius.sm, paddingHorizontal: spacing.space3, fontSize: 14, fontFamily: fonts.body, marginBottom: spacing.space2 },
  multiline: { height: 60, paddingTop: spacing.space3, textAlignVertical: 'top' },
  medicineCard: { borderRadius: borderRadius.md, padding: spacing.space4, marginBottom: spacing.space4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 2, elevation: 1 },
  medHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.space3 },
  medNumber: { fontSize: 14, fontWeight: '600', fontFamily: fonts.body },
  removeText: { fontSize: 12, fontFamily: fonts.body },
  dosageRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dosageButtons: { flexDirection: 'row' },
  doseBtn: { width: 32, height: 32, borderRadius: 6, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', marginLeft: spacing.space2 },
  doseBtnText: { fontSize: 12, fontWeight: '700', fontFamily: fonts.body },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap' },
  tinyChip: { paddingVertical: spacing.space1 + 2, paddingHorizontal: spacing.space2 + 2, borderRadius: borderRadius.full, borderWidth: 1, marginRight: spacing.space1, marginBottom: spacing.space1 },
  tinyChipText: { fontSize: 10, fontFamily: fonts.body },
});
