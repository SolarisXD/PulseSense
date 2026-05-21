// PulseSense — Add Allergy Screen

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { colors, spacing, borderRadius } from '../constants/spacing';
import { Button } from '../components/ui/Button';
import { getDB, loadStores } from '../hooks/useDB';
import { insertAllergy } from '../db/queries/allergies';

const SEVERITY_OPTIONS = ['mild', 'moderate', 'severe', 'life-threatening'];
const CATEGORY_OPTIONS = ['drug', 'food', 'environmental', 'other'];

export function AddAllergyScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [reaction, setReaction] = useState('');
  const [severity, setSeverity] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Allergen name is required.');
      return;
    }
    setSaving(true);
    try {
      const db = await getDB();
      await insertAllergy(db, { name: name.trim(), category: category || null, reaction: reaction || null, severity: severity || null });
      await loadStores(db);
      navigation.goBack();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to save allergy.');
    }
    setSaving(false);
  };

  const severColor = (s: string) => ({ backgroundColor: s === 'life-threatening' || s === 'severe' ? colors.danger + '20' : s === 'moderate' ? colors.warning + '20' : colors.success + '20' });
  const severTextColor = (s: string) => ({ color: s === 'life-threatening' || s === 'severe' ? colors.danger : s === 'moderate' ? colors.warning : colors.success });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>ALLERGEN *</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. Penicillin, Shellfish" placeholderTextColor={colors.textDisabled} />

      <Text style={styles.label}>CATEGORY</Text>
      <View style={styles.optionsRow}>
        {CATEGORY_OPTIONS.map((c) => (
          <TouchableOpacity key={c} style={[styles.chip, category === c && styles.chipSelected]} onPress={() => setCategory(c)}>
            <Text style={[styles.chipText, category === c && styles.chipTextSelected]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>SEVERITY</Text>
      <View style={styles.optionsRow}>
        {SEVERITY_OPTIONS.map((s) => (
          <TouchableOpacity key={s} style={[styles.chip, severity === s ? styles.chipSelected : undefined, severColor(s)]} onPress={() => setSeverity(s)}>
            <Text style={[styles.chipText, severity === s ? severTextColor(s) : undefined]}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>REACTION</Text>
      <TextInput style={styles.input} value={reaction} onChangeText={setReaction} placeholder="e.g. Hives, swelling" placeholderTextColor={colors.textDisabled} />

      <Button title={saving ? 'Saving...' : 'Save Allergy'} onPress={handleSave} loading={saving} disabled={!name.trim()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.space4 },
  label: { fontSize: 12, fontWeight: '500', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: 'Inter', marginBottom: spacing.space2, marginTop: spacing.space4 },
  input: { height: 48, borderWidth: 1.5, borderColor: colors.border, borderRadius: borderRadius.sm, paddingHorizontal: spacing.space3, fontSize: 15, color: colors.textPrimary, fontFamily: 'Inter', backgroundColor: colors.surface, marginBottom: spacing.space2 },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.space2 },
  chip: { paddingVertical: spacing.space2, paddingHorizontal: spacing.space4, borderRadius: borderRadius.full, borderWidth: 1.5, borderColor: colors.border, marginRight: spacing.space2, marginBottom: spacing.space2 },
  chipSelected: { borderColor: colors.primary },
  chipText: { fontSize: 12, color: colors.textPrimary, fontFamily: 'Inter' },
  chipTextSelected: { fontWeight: '600', color: colors.primary },
});
