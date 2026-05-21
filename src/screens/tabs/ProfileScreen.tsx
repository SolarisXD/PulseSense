// PulseSense — Profile Screen
// Shows profile info, contacts, conditions, allergies, medications

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, borderRadius } from '../../constants/spacing';
import { useProfileStore } from '../../store/profileStore';
import { useAgeCalculator } from '../../hooks/useAgeCalculator';
import { getDB, loadStores } from '../../hooks/useDB';
import { archiveCondition } from '../../db/queries/conditions';
import { deleteAllergy } from '../../db/queries/allergies';
import { deleteContact } from '../../db/queries/contacts';
import { deleteMedication } from '../../db/queries/medications';
import { ConditionCard } from '../../components/conditions/ConditionCard';
import { DosageDisplay } from '../../components/medications/DosageDisplay';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export function ProfileScreen({ navigation }: any) {
  const profile = useProfileStore((s) => s.profile);
  const contacts = useProfileStore((s) => s.contacts);
  const conditions = useProfileStore((s) => s.conditions);
  const allergies = useProfileStore((s) => s.allergies);
  const age = useAgeCalculator();

  useFocusEffect(
    React.useCallback(() => {
      reloadData();
    }, [])
  );

  const reloadData = async () => {
    try {
      const db = await getDB();
      await loadStores(db);
    } catch (err) {
      console.error(err);
    }
  };

  const handleArchiveCondition = (id: number) => {
    Alert.alert('Archive Condition', 'Move this condition to archive?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Archive', style: 'destructive', onPress: async () => {
        const db = await getDB();
        await archiveCondition(db, id);
        await loadStores(db);
      }},
    ]);
  };

  const handleDeleteAllergy = (id: number) => {
    Alert.alert('Delete Allergy', 'Remove this allergy?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        const db = await getDB();
        await deleteAllergy(db, id);
        await loadStores(db);
      }},
    ]);
  };

  const handleDeleteContact = (id: number) => {
    Alert.alert('Delete Contact', 'Remove this emergency contact?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        const db = await getDB();
        await deleteContact(db, id);
        await loadStores(db);
      }},
    ]);
  };

  const severityColor = (sev: string | null) => {
    switch (sev) {
      case 'severe': return colors.danger;
      case 'moderate': return colors.warning;
      case 'mild': return colors.success;
      default: return colors.primary;
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarLargeText}>
            {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
          </Text>
        </View>
        <Text style={styles.profileName}>{profile?.full_name || 'User'}</Text>
        {age ? <Text style={styles.profileAge}>{age}</Text> : null}
        <View style={styles.profileMeta}>
          <Text style={styles.profileMetaText}>
            {profile?.blood_group ? `Blood: ${profile.blood_group}` : ''}
            {profile?.blood_group && profile?.sex ? '  |  ' : ''}
            {profile?.sex || ''}
          </Text>
        </View>
      </View>

      {/* Emergency Contacts */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Emergency Contacts</Text>
          <TouchableOpacity onPress={() => navigation.navigate('AddContact')}>
            <Text style={styles.addLink}>+ Add</Text>
          </TouchableOpacity>
        </View>
        {contacts.length === 0 ? (
          <Text style={styles.emptyText}>No emergency contacts added</Text>
        ) : (
          contacts.map((c) => (
            <TouchableOpacity key={c.id} style={styles.contactRow} onPress={() => handleDeleteContact(c.id)}>
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{c.name}</Text>
                <Text style={styles.contactDetail}>{c.relationship || ''} {c.phone}</Text>
              </View>
              {c.is_primary ? <Text style={styles.primaryBadge}>PRIMARY</Text> : null}
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Conditions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Conditions</Text>
          <TouchableOpacity onPress={() => navigation.navigate('AddCondition')}>
            <Text style={styles.addLink}>+ Add</Text>
          </TouchableOpacity>
        </View>
        {conditions.length === 0 ? (
          <Text style={styles.emptyText}>No conditions added</Text>
        ) : (
          conditions.map((c) => (
            <ConditionCard
              key={c.id}
              name={c.name}
              type={c.type}
              diagnosedDate={c.diagnosed_date}
              severity={c.severity}
              notes={c.notes}
              onPress={() => navigation.navigate('EditCondition', { conditionId: c.id })}
              onArchive={() => handleArchiveCondition(c.id)}
            />
          ))
        )}
      </View>

      {/* Allergies */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Allergies</Text>
          <TouchableOpacity onPress={() => navigation.navigate('AddAllergy')}>
            <Text style={styles.addLink}>+ Add</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.allergyChips}>
          {allergies.length === 0 ? (
            <Text style={styles.emptyText}>No allergies added</Text>
          ) : (
            allergies.map((a) => (
              <TouchableOpacity
                key={a.id}
                style={[styles.allergyChip, { backgroundColor: severityColor(a.severity) + '20' }]}
                onPress={() => handleDeleteAllergy(a.id)}
              >
                <Text style={[styles.allergyText, { color: severityColor(a.severity) }]}>
                  {a.name}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      </View>

      {/* Medications */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Medications</Text>
          <TouchableOpacity onPress={() => navigation.navigate('AddMedication')}>
            <Text style={styles.addLink}>+ Add</Text>
          </TouchableOpacity>
        </View>
        <Button
          title="View All Medications"
          onPress={() => navigation.navigate('MedicationsList')}
          variant="ghost"
          size="medium"
        />
      </View>

      {/* Edit Profile Button */}
      <View style={styles.editSection}>
        <Button
          title="✏️  Edit Profile"
          onPress={() => navigation.navigate('EditProfile')}
          variant="outline"
        />
      </View>

      {/* Export Medical ID */}
      <View style={{ marginTop: spacing.space3 }}>
        <Button
          title="🆔  Export Medical ID"
          onPress={() => navigation.navigate('Export', { preSelectedType: 'medical_id' })}
          variant="ghost"
        />
      </View>

      <View style={{ height: spacing.space12 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.space4,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: spacing.space6,
    marginBottom: spacing.space4,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.space4,
  },
  avatarLargeText: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary,
    fontFamily: 'Inter',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    fontFamily: 'Inter',
    marginBottom: spacing.space1,
  },
  profileAge: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Inter',
    marginBottom: spacing.space2,
  },
  profileMeta: {
    marginTop: spacing.space1,
  },
  profileMetaText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontFamily: 'Inter',
  },
  section: {
    marginBottom: spacing.space5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.space3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    fontFamily: 'Inter',
  },
  addLink: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.space4,
    marginBottom: spacing.space2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    fontFamily: 'Inter',
  },
  contactDetail: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'Inter',
    marginTop: 2,
  },
  primaryBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
    backgroundColor: colors.primarySurface,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    fontFamily: 'Inter',
  },
  allergyChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  allergyChip: {
    paddingVertical: spacing.space2,
    paddingHorizontal: spacing.space3,
    borderRadius: borderRadius.full,
    marginRight: spacing.space2,
    marginBottom: spacing.space2,
  },
  allergyText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  emptyText: {
    fontSize: 13,
    color: colors.textDisabled,
    fontFamily: 'Inter',
    fontStyle: 'italic',
  },
  editSection: {
    marginTop: spacing.space4,
  },
});
