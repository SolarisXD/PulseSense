// PulseSense — Medications List Screen

import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, borderRadius } from '../../constants/spacing';
import { DosageDisplay } from '../../components/medications/DosageDisplay';
import { getDB } from '../../hooks/useDB';
import { getMedications, toggleMedicationActive, deleteMedication } from '../../db/queries/medications';
import { Button } from '../../components/ui/Button';

export function MedicationsListScreen({ navigation }: any) {
  const [medications, setMedications] = useState<any[]>([]);

  useFocusEffect(useCallback(() => { loadMeds(); }, []));

  const loadMeds = async () => {
    try {
      const db = await getDB();
      const meds = await getMedications(db);
      setMedications(meds);
    } catch (err) { console.error(err); }
  };

  const handleToggle = async (id: number) => {
    const db = await getDB();
    await toggleMedicationActive(db, id);
    await loadMeds();
  };

  const handleDelete = (id: number) => {
    Alert.alert('Delete', 'Delete this prescription?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        const db = await getDB();
        await deleteMedication(db, id);
        await loadMeds();
      }},
    ]);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={medications}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={[styles.card, !item.is_active && styles.cardInactive]}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.date}>Rx: {item.prescription_date}</Text>
                <Text style={styles.doctor}>Dr. {item.prescribing_doctor || 'Unknown'}</Text>
              </View>
              <TouchableOpacity onPress={() => handleToggle(item.id)}>
                <Text style={[styles.statusBadge, item.is_active ? styles.activeBadge : styles.inactiveBadge]}>
                  {item.is_active ? 'Active' : 'Inactive'}
                </Text>
              </TouchableOpacity>
            </View>
            {item.diagnosis_notes && <Text style={styles.diagnosis}>{item.diagnosis_notes}</Text>}
            {item.items.map((med: any) => (
              <View key={med.id} style={styles.medItem}>
                <View style={styles.medInfo}>
                  <Text style={styles.medName}>{med.medicine_name}</Text>
                  <Text style={styles.medStrength}>{med.strength || ''}</Text>
                </View>
                <DosageDisplay morning={med.dose_morning} afternoon={med.dose_afternoon} night={med.dose_night} />
                {med.timing && <Text style={styles.medTiming}>{med.timing.replace('_', ' ')}</Text>}
                {med.duration && <Text style={styles.medDuration}>{med.duration}</Text>}
              </View>
            ))}
            <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No prescriptions yet</Text>
            <Text style={styles.emptyHint}>Tap below to add your first prescription</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
      <View style={styles.fab}>
        <Button title="+ Add Prescription" onPress={() => navigation.navigate('AddMedication')} variant="primary" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  listContent: { padding: spacing.space4, paddingBottom: 100 },
  card: { backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.space4, marginBottom: spacing.space3, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 2, elevation: 1 },
  cardInactive: { opacity: 0.6 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.space2 },
  date: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, fontFamily: 'Inter' },
  doctor: { fontSize: 12, color: colors.textSecondary, fontFamily: 'Inter', marginTop: 2 },
  statusBadge: { fontSize: 10, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, fontFamily: 'Inter' },
  activeBadge: { color: colors.success, backgroundColor: colors.successSurface },
  inactiveBadge: { color: colors.textSecondary, backgroundColor: colors.surfaceAlt },
  diagnosis: { fontSize: 12, color: colors.textSecondary, fontFamily: 'Inter', marginBottom: spacing.space3, fontStyle: 'italic' },
  medItem: { paddingVertical: spacing.space2, borderTopWidth: 1, borderTopColor: colors.borderLight },
  medInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.space1 },
  medName: { fontSize: 14, fontWeight: '500', color: colors.textPrimary, fontFamily: 'Inter' },
  medStrength: { fontSize: 12, color: colors.textSecondary, fontFamily: 'Inter', marginLeft: spacing.space2 },
  medTiming: { fontSize: 11, color: colors.textSecondary, fontFamily: 'Inter', marginTop: 2 },
  medDuration: { fontSize: 11, color: colors.textSecondary, fontFamily: 'Inter' },
  deleteBtn: { marginTop: spacing.space3, alignItems: 'flex-end' },
  deleteText: { fontSize: 12, color: colors.danger, fontFamily: 'Inter' },
  empty: { padding: spacing.space12, alignItems: 'center' },
  emptyText: { fontSize: 16, fontWeight: '500', color: colors.textSecondary, fontFamily: 'Inter' },
  emptyHint: { fontSize: 12, color: colors.textDisabled, fontFamily: 'Inter', marginTop: spacing.space2 },
  fab: { position: 'absolute', bottom: 20, left: spacing.space4, right: spacing.space4 },
});
