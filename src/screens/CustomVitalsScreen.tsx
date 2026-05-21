// PulseSense — Custom Vitals Management Screen

import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { fonts } from '../constants/typography';
import { colors, spacing, borderRadius } from '../constants/spacing';
import { Button } from '../components/ui/Button';
import { getDB } from '../hooks/useDB';
import { getCustomVitalDefinitions, insertCustomVitalDefinition, toggleCustomVitalActive, deleteCustomVitalDefinition } from '../db/queries/customVitals';

export function CustomVitalsScreen() {
  const [defs, setDefs] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('');
  const [normalMin, setNormalMin] = useState('');
  const [normalMax, setNormalMax] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useFocusEffect(useCallback(() => { loadDefs(); }, []));

  const loadDefs = async () => {
    const db = await getDB();
    const all = await getCustomVitalDefinitions(db);
    setDefs(all);
  };

  const handleAdd = async () => {
    if (!name.trim() || !unit.trim()) { Alert.alert('Required', 'Name and unit are required.'); return; }
    setSaving(true);
    try {
      const db = await getDB();
      await insertCustomVitalDefinition(db, {
        name: name.trim(),
        unit: unit.trim(),
        normal_min: normalMin ? parseFloat(normalMin) : null,
        normal_max: normalMax ? parseFloat(normalMax) : null,
        notes: notes || null,
      });
      setName(''); setUnit(''); setNormalMin(''); setNormalMax(''); setNotes('');
      setShowForm(false);
      await loadDefs();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save.');
    }
    setSaving(false);
  };

  const handleDelete = (id: number) => {
    Alert.alert('Delete', 'Delete this custom vital?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        const db = await getDB();
        await deleteCustomVitalDefinition(db, id);
        await loadDefs();
      }},
    ]);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={defs}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={[styles.card, !item.is_active && styles.cardInactive]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardName}>{item.name}</Text>
              <Text style={styles.cardUnit}>{item.unit}</Text>
            </View>
            <Text style={styles.cardRange}>
              Normal: {item.normal_min ?? '-'} — {item.normal_max ?? '-'}
            </Text>
            {item.notes && <Text style={styles.cardNotes}>{item.notes}</Text>}
            <View style={styles.cardActions}>
              <TouchableOpacity onPress={async () => {
                const db = await getDB();
                await toggleCustomVitalActive(db, item.id);
                await loadDefs();
              }}>
                <Text style={styles.actionText}>{item.is_active ? 'Deactivate' : 'Activate'}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <Text style={[styles.actionText, { color: colors.danger }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyText}>No custom vitals defined</Text></View>}
        contentContainerStyle={styles.listContent}
      />
      {showForm ? (
        <View style={styles.form}>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Name (e.g. Cholesterol)" placeholderTextColor={colors.textDisabled} />
          <TextInput style={styles.input} value={unit} onChangeText={setUnit} placeholder="Unit (e.g. mg/dL)" placeholderTextColor={colors.textDisabled} />
          <View style={styles.row}>
            <TextInput style={[styles.input, { flex: 1, marginRight: spacing.space2 }]} value={normalMin} onChangeText={setNormalMin} placeholder="Normal min" placeholderTextColor={colors.textDisabled} keyboardType="decimal-pad" />
            <TextInput style={[styles.input, { flex: 1 }]} value={normalMax} onChangeText={setNormalMax} placeholder="Normal max" placeholderTextColor={colors.textDisabled} keyboardType="decimal-pad" />
          </View>
          <TextInput style={[styles.input]} value={notes} onChangeText={setNotes} placeholder="Notes (optional)" placeholderTextColor={colors.textDisabled} />
          <View style={styles.formButtons}>
            <Button title="Cancel" onPress={() => setShowForm(false)} variant="ghost" size="medium" />
            <View style={{ width: 12 }} />
            <Button title={saving ? 'Saving...' : 'Save'} onPress={handleAdd} loading={saving} size="medium" disabled={!name.trim() || !unit.trim()} />
          </View>
        </View>
      ) : (
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowForm(true)}>
          <Text style={styles.addBtnText}>+ Add Custom Vital</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  listContent: { padding: spacing.space4, paddingBottom: 100 },
  card: { backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.space4, marginBottom: spacing.space3, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 2, elevation: 1 },
  cardInactive: { opacity: 0.5 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardName: { fontSize: 15, fontWeight: '600', color: colors.textPrimary, fontFamily: fonts.body },
  cardUnit: { fontSize: 13, color: colors.textSecondary, fontFamily: fonts.body },
  cardRange: { fontSize: 12, color: colors.textSecondary, fontFamily: fonts.body, marginTop: spacing.space1 },
  cardNotes: { fontSize: 11, color: colors.textDisabled, fontFamily: fonts.body, marginTop: spacing.space1, fontStyle: 'italic' },
  cardActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: spacing.space3, gap: spacing.space4 },
  actionText: { fontSize: 12, color: colors.primary, fontWeight: '500', fontFamily: fonts.body },
  empty: { padding: spacing.space12, alignItems: 'center' },
  emptyText: { fontSize: 14, color: colors.textSecondary, fontFamily: fonts.body },
  form: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: colors.surface, padding: spacing.space4, borderTopLeftRadius: borderRadius.lg, borderTopRightRadius: borderRadius.lg, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 10 },
  input: { height: 44, borderWidth: 1.5, borderColor: colors.border, borderRadius: borderRadius.sm, paddingHorizontal: spacing.space3, fontSize: 14, color: colors.textPrimary, fontFamily: fonts.body, marginBottom: spacing.space2, backgroundColor: colors.surface },
  row: { flexDirection: 'row' },
  formButtons: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: spacing.space2 },
  addBtn: { position: 'absolute', bottom: 20, left: spacing.space4, right: spacing.space4, backgroundColor: colors.primary, borderRadius: borderRadius.md, padding: spacing.space4, alignItems: 'center' },
  addBtnText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF', fontFamily: fonts.body },
});
