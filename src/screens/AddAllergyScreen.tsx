// PulseSense — Add Allergy Screen

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useColors } from '../hooks/useColors';
import { fonts } from '../constants/typography';
import { spacing, borderRadius } from '../constants/spacing';
import { chipStyles } from '../constants/chipStyles';
import { Button } from '../components/ui/Button';
import { getDB, loadStores } from '../hooks/useDB';
import { insertAllergy } from '../db/queries/allergies';

const SEVERITY_OPTIONS = ['mild', 'moderate', 'severe', 'life-threatening'];
const CATEGORY_OPTIONS = ['drug', 'food', 'environmental', 'other'];

export function AddAllergyScreen({ navigation }: any) {
  const c = useColors();
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

  const severColor = (s: string) => ({ backgroundColor: s === 'life-threatening' || s === 'severe' ? c.danger + '20' : s === 'moderate' ? c.warning + '20' : c.success + '20' });
  const severTextColor = (s: string) => ({ color: s === 'life-threatening' || s === 'severe' ? c.danger : s === 'moderate' ? c.warning : c.success });

  return (
    <ScrollView style={[styles.container, { backgroundColor: c.background }]} contentContainerStyle={styles.content}>
      <Text style={[styles.label, { color: c.textSecondary }]}>ALLERGEN *</Text>
      <TextInput style={[styles.input, { borderColor: c.border, color: c.textPrimary, backgroundColor: c.surface }]} value={name} onChangeText={setName} placeholder="e.g. Penicillin, Shellfish" placeholderTextColor={c.textDisabled} />

      <Text style={[styles.label, { color: c.textSecondary }]}>CATEGORY</Text>
      <View style={styles.optionsRow}>
        {CATEGORY_OPTIONS.map((cat) => (
          <TouchableOpacity key={cat} style={[chipStyles.chip, category === cat && chipStyles.chipSelected]} onPress={() => setCategory(cat)}>
            <Text style={[chipStyles.chipText, category === cat && chipStyles.chipTextSelected]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.label, { color: c.textSecondary }]}>SEVERITY</Text>
      <View style={styles.optionsRow}>
        {SEVERITY_OPTIONS.map((s) => (
          <TouchableOpacity key={s} style={[chipStyles.chip, severity === s ? chipStyles.chipSelected : undefined, severColor(s)]} onPress={() => setSeverity(s)}>
            <Text style={[chipStyles.chipText, severity === s ? severTextColor(s) : undefined]}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.label, { color: c.textSecondary }]}>REACTION</Text>
      <TextInput style={[styles.input, { borderColor: c.border, color: c.textPrimary, backgroundColor: c.surface }]} value={reaction} onChangeText={setReaction} placeholder="e.g. Hives, swelling" placeholderTextColor={c.textDisabled} />

      <Button title={saving ? 'Saving...' : 'Save Allergy'} onPress={handleSave} loading={saving} disabled={!name.trim()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.space4 },
  label: { fontSize: 12, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: fonts.body, marginBottom: spacing.space2, marginTop: spacing.space4 },
  input: { height: 48, borderWidth: 1.5, borderRadius: borderRadius.sm, paddingHorizontal: spacing.space3, fontSize: 15, fontFamily: fonts.body, marginBottom: spacing.space2 },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.space2 },
});
