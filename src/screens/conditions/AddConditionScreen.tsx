import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { fonts } from '../../constants/typography';
import { colors } from '../../constants/colors';
import { spacing, borderRadius } from '../../constants/spacing';
import { chipStyles } from '../../constants/chipStyles';
import { Button } from '../../components/ui/Button';
import { useDateInput } from '../../hooks/useDateInput';
import { getDB, loadStores } from '../../hooks/useDB';
import { insertCondition, updateCondition, getConditionById } from '../../db/queries/conditions';

const CONDITION_TYPES = ['chronic', 'acute', 'genetic', 'autoimmune', 'other'];
const SEVERITY_OPTIONS = ['mild', 'moderate', 'severe'];

export function AddConditionScreen({ navigation, route }: any) {
  const conditionId = route?.params?.conditionId ?? null;
  const isEditing = !!conditionId;

  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const dobInput = useDateInput();
  const [severity, setSeverity] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (conditionId) {
      loadCondition(conditionId);
    }
  }, [conditionId]);

  const loadCondition = async (id: number) => {
    try {
      const db = await getDB();
      const cond = await getConditionById(db, id);
      if (cond) {
        setName(cond.name);
        setType(cond.type || '');
        if (cond.diagnosed_date) dobInput.setValue(cond.diagnosed_date);
        setSeverity(cond.severity || '');
        setNotes(cond.notes || '');
      }
    } catch (err) {
      console.error('Failed to load condition:', err);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Condition name is required.');
      return;
    }
    setSaving(true);
    try {
      const db = await getDB();
      const data = {
        name: name.trim(),
        type: type || null,
        diagnosed_date: dobInput.value || null,
        severity: severity || null,
        notes: notes || null,
      };
      if (isEditing) {
        await updateCondition(db, conditionId, data);
      } else {
        await insertCondition(db, data);
      }
      await loadStores(db);
      navigation.goBack();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to save condition.');
    }
    setSaving(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>CONDITION NAME *</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. Type 2 Diabetes" placeholderTextColor={colors.textDisabled} />

      <Text style={styles.label}>TYPE</Text>
      <View style={styles.optionsRow}>
        {CONDITION_TYPES.map((t) => (
          <TouchableOpacity key={t} style={[chipStyles.chip, type === t && chipStyles.chipSelected]} onPress={() => setType(t)}>
            <Text style={[chipStyles.chipText, type === t && chipStyles.chipTextSelected]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>DIAGNOSED DATE</Text>
      <TextInput style={styles.input} value={dobInput.value} onChangeText={dobInput.handleChange} placeholder="DD/MM/YYYY" placeholderTextColor={colors.textDisabled} keyboardType="number-pad" maxLength={10} />

      <Text style={styles.label}>SEVERITY</Text>
      <View style={styles.optionsRow}>
        {SEVERITY_OPTIONS.map((s) => (
          <TouchableOpacity key={s} style={[chipStyles.chip, severity === s && chipStyles.chipSelected]} onPress={() => setSeverity(s)}>
            <Text style={[chipStyles.chipText, severity === s && chipStyles.chipTextSelected]}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>NOTES</Text>
      <TextInput style={[styles.input, styles.multiline]} value={notes} onChangeText={setNotes} placeholder="Additional notes" placeholderTextColor={colors.textDisabled} multiline numberOfLines={3} />

      <Button title={saving ? 'Saving...' : (isEditing ? 'Update Condition' : 'Save Condition')} onPress={handleSave} loading={saving} disabled={!name.trim()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.space4 },
  label: { fontSize: 12, fontWeight: '500', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: fonts.body, marginBottom: spacing.space2, marginTop: spacing.space4 },
  input: { height: 48, borderWidth: 1.5, borderColor: colors.border, borderRadius: borderRadius.sm, paddingHorizontal: spacing.space3, fontSize: 15, color: colors.textPrimary, fontFamily: fonts.body, backgroundColor: colors.surface, marginBottom: spacing.space2 },
  multiline: { height: 80, paddingTop: spacing.space3, textAlignVertical: 'top' },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.space2 },
});