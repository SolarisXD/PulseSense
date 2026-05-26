// PulseSense — Medications List Screen

import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useColors } from '../../hooks/useColors';
import { fonts } from '../../constants/typography';
import { spacing, borderRadius } from '../../constants/spacing';
import { DosageDisplay } from '../../components/medications/DosageDisplay';
import { getDB } from '../../hooks/useDB';
import { getMedications, toggleMedicationActive, deleteMedication } from '../../db/queries/medications';
import { Button } from '../../components/ui/Button';
import { checkDrugInteractions } from '../../engine/drugInteractions';
import type { InteractionResult } from '../../engine/drugInteractions';

export function MedicationsListScreen({ navigation }: any) {
  const c = useColors();
  const [medications, setMedications] = useState<any[]>([]);
  const [interactionsExpanded, setInteractionsExpanded] = useState(false);

  const activeMedNames = useMemo(
    () => medications
      .filter((m) => m.is_active)
      .flatMap((m) => m.items.map((item: any) => item.medicine_name)),
    [medications]
  );

  const interactions = useMemo(
    () => activeMedNames.length >= 2
      ? checkDrugInteractions(activeMedNames)
      : [],
    [activeMedNames]
  );

  const hasInteractions = interactions.length > 0;

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
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <FlatList
        data={medications}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: c.surface }, !item.is_active && styles.cardInactive]}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={[styles.date, { color: c.textPrimary }]}>Rx: {item.prescription_date}</Text>
                <Text style={[styles.doctor, { color: c.textSecondary }]}>Dr. {item.prescribing_doctor || 'Unknown'}</Text>
              </View>
              <TouchableOpacity onPress={() => handleToggle(item.id)}>
                <Text style={[styles.statusBadge, item.is_active ? [styles.activeBadge, { color: c.success, backgroundColor: c.successSurface }] : [styles.inactiveBadge, { color: c.textSecondary, backgroundColor: c.surfaceAlt }]]}>
                  {item.is_active ? 'Active' : 'Inactive'}
                </Text>
              </TouchableOpacity>
            </View>
            {item.diagnosis_notes && <Text style={[styles.diagnosis, { color: c.textSecondary }]}>{item.diagnosis_notes}</Text>}
            {item.items.map((med: any) => (
              <View key={med.id} style={[styles.medItem, { borderTopColor: c.borderLight }]}>
                <View style={styles.medInfo}>
                  <Text style={[styles.medName, { color: c.textPrimary }]}>{med.medicine_name}</Text>
                  <Text style={[styles.medStrength, { color: c.textSecondary }]}>{med.strength || ''}</Text>
                </View>
                <DosageDisplay morning={med.dose_morning} afternoon={med.dose_afternoon} night={med.dose_night} />
                {med.timing && <Text style={[styles.medTiming, { color: c.textSecondary }]}>{med.timing.replace('_', ' ')}</Text>}
                {med.duration && <Text style={[styles.medDuration, { color: c.textSecondary }]}>{med.duration}</Text>}
              </View>
            ))}
            <View style={styles.actionsRow}>
              <TouchableOpacity onPress={() => navigation.navigate('AddMedication', { medication: item })}>
                <Text style={[styles.editText, { color: c.primary }]}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <Text style={[styles.deleteText, { color: c.danger }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: c.textSecondary }]}>No prescriptions yet</Text>
            <Text style={[styles.emptyHint, { color: c.textDisabled }]}>Tap below to add your first prescription</Text>
          </View>
        }
        ListFooterComponent={
          medications.length > 0 ? (
            <View style={[styles.interactionSection, { backgroundColor: c.surface, borderColor: c.borderLight }]}>
              <TouchableOpacity style={styles.interactionHeader} onPress={() => setInteractionsExpanded(!interactionsExpanded)} activeOpacity={0.7}>
                <View style={styles.interactionHeaderLeft}>
                  <Ionicons name="flask" size={16} color={hasInteractions ? c.danger : c.success} />
                  <Text style={[styles.interactionTitle, { color: c.textPrimary }]}>Drug Interaction Check</Text>
                </View>
                <View style={styles.interactionHeaderRight}>
                  {activeMedNames.length >= 2 && (
                    <View style={[styles.interactionCount, { backgroundColor: hasInteractions ? c.dangerSurface : c.successSurface }]}>
                      <Text style={[styles.interactionCountText, { color: hasInteractions ? c.danger : c.success }]}>
                        {hasInteractions ? interactions.length : '0'}
                      </Text>
                    </View>
                  )}
                  <Ionicons name={interactionsExpanded ? 'chevron-up' : 'chevron-down'} size={16} color={c.textSecondary} />
                </View>
              </TouchableOpacity>

              {interactionsExpanded && (
                <View style={styles.interactionBody}>
                  {activeMedNames.length < 2 ? (
                    <Text style={[styles.interactionInfo, { color: c.textSecondary }]}>
                      Add at least 2 active medications to check for potential interactions.
                    </Text>
                  ) : !hasInteractions ? (
                    <View style={styles.interactionSafe}>
                      <Ionicons name="checkmark-circle" size={20} color={c.success} />
                      <Text style={[styles.interactionSafeText, { color: c.success }]}>No interactions detected</Text>
                    </View>
                  ) : (
                    <>
                      {interactions.map((interaction: InteractionResult, idx: number) => (
                        <View key={idx} style={[styles.interactionCard, { borderLeftColor: interaction.severity === 'major' ? c.danger : interaction.severity === 'moderate' ? c.warning : c.primary }]}>
                          <View style={styles.interactionCardHeader}>
                            <View style={[styles.severityBadge, { backgroundColor: interaction.severity === 'major' ? c.dangerSurface : interaction.severity === 'moderate' ? c.warningSurface : c.primarySurface }]}>
                              <Text style={[styles.severityText, { color: interaction.severity === 'major' ? c.danger : interaction.severity === 'moderate' ? c.warning : c.primary }]}>
                                {interaction.severity.toUpperCase()}
                              </Text>
                            </View>
                          </View>
                          <Text style={[styles.interactionDrugPair, { color: c.textPrimary }]}>
                            {interaction.drugA} ↔ {interaction.drugB}
                          </Text>
                          <Text style={[styles.interactionEffect, { color: c.textSecondary }]}>
                            {interaction.effect}
                          </Text>
                          <View style={[styles.recommendationBox, { backgroundColor: c.surfaceAlt }]}>
                            <Ionicons name="bulb-outline" size={14} color={c.primary} style={{ marginRight: spacing.space1 }} />
                            <Text style={[styles.recommendationText, { color: c.textPrimary }]}>
                              {interaction.recommendation}
                            </Text>
                          </View>
                        </View>
                      ))}
                      <Text style={[styles.disclaimer, { color: c.textDisabled }]}>
                        This is not a substitute for professional medical advice. Always consult your doctor or pharmacist.
                      </Text>
                    </>
                  )}
                </View>
              )}
            </View>
          ) : null
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
  container: { flex: 1 },
  listContent: { padding: spacing.space4, paddingBottom: 100 },
  card: { borderRadius: borderRadius.md, padding: spacing.space4, marginBottom: spacing.space3, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 2, elevation: 1 },
  cardInactive: { opacity: 0.6 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.space2 },
  date: { fontSize: 14, fontWeight: '600', fontFamily: fonts.body },
  doctor: { fontSize: 12, fontFamily: fonts.body, marginTop: 2 },
  statusBadge: { fontSize: 10, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, fontFamily: fonts.body },
  activeBadge: {},
  inactiveBadge: {},
  diagnosis: { fontSize: 12, fontFamily: fonts.body, marginBottom: spacing.space3, fontStyle: 'italic' },
  medItem: { paddingVertical: spacing.space2, borderTopWidth: 1 },
  medInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.space1 },
  medName: { fontSize: 14, fontWeight: '500', fontFamily: fonts.body },
  medStrength: { fontSize: 12, fontFamily: fonts.body, marginLeft: spacing.space2 },
  medTiming: { fontSize: 11, fontFamily: fonts.body, marginTop: 2 },
  medDuration: { fontSize: 11, fontFamily: fonts.body },
  actionsRow: { marginTop: spacing.space3, flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.space4 },
  editText: { fontSize: 12, fontFamily: fonts.body, fontWeight: '600' },
  deleteText: { fontSize: 12, fontFamily: fonts.body },
  empty: { padding: spacing.space12, alignItems: 'center' },
  emptyText: { fontSize: 16, fontWeight: '500', fontFamily: fonts.body },
  emptyHint: { fontSize: 12, fontFamily: fonts.body, marginTop: spacing.space2 },
  fab: { position: 'absolute', bottom: 20, left: spacing.space4, right: spacing.space4 },
  interactionSection: { borderRadius: borderRadius.md, borderWidth: 1, marginTop: spacing.space4, padding: spacing.space3, overflow: 'hidden' },
  interactionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  interactionHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.space2 },
  interactionHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.space2 },
  interactionTitle: { fontSize: 14, fontWeight: '600', fontFamily: fonts.body },
  interactionCount: { minWidth: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  interactionCountText: { fontSize: 11, fontWeight: '700', fontFamily: fonts.body },
  interactionBody: { marginTop: spacing.space3 },
  interactionInfo: { fontSize: 12, fontFamily: fonts.body, lineHeight: 18 },
  interactionSafe: { flexDirection: 'row', alignItems: 'center', gap: spacing.space2 },
  interactionSafeText: { fontSize: 13, fontWeight: '500', fontFamily: fonts.body },
  interactionCard: { borderLeftWidth: 3, borderRadius: borderRadius.sm, padding: spacing.space3, marginBottom: spacing.space3, paddingLeft: spacing.space3 },
  interactionCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.space2 },
  severityBadge: { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  severityText: { fontSize: 10, fontWeight: '700', fontFamily: fonts.body },
  interactionDrugPair: { fontSize: 13, fontWeight: '600', fontFamily: fonts.body, marginBottom: spacing.space1 },
  interactionEffect: { fontSize: 12, fontFamily: fonts.body, lineHeight: 17, marginBottom: spacing.space2 },
  recommendationBox: { flexDirection: 'row', alignItems: 'flex-start', borderRadius: borderRadius.sm, padding: spacing.space2 },
  recommendationText: { fontSize: 12, fontFamily: fonts.body, lineHeight: 17, flex: 1 },
  disclaimer: { fontSize: 10, fontFamily: fonts.body, fontStyle: 'italic', marginTop: spacing.space2, textAlign: 'center' },
});
