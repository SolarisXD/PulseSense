// PulseSense — Profile Screen
// Shows profile info, contacts, conditions, allergies, medications
// Updated with fonts and icons

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, withDelay, Easing } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius } from '../../constants/spacing';
import { fonts } from '../../constants/typography';
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
import { Skeleton } from '../../components/ui/Skeleton';

// Animated section component
function AnimatedSection({ children, index = 0 }: { children: React.ReactNode; index?: number }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    const delay = 200 + index * 100;
    opacity.value = withDelay(delay, withTiming(1, { duration: 450, easing: Easing.out(Easing.ease) }));
    translateY.value = withDelay(delay, withSpring(0, { damping: 16, stiffness: 150 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
}

export function ProfileScreen({ navigation }: any) {
  const profile = useProfileStore((s) => s.profile);
  const contacts = useProfileStore((s) => s.contacts);
  const conditions = useProfileStore((s) => s.conditions);
  const allergies = useProfileStore((s) => s.allergies);
  const age = useAgeCalculator();
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      reloadData();
    }, [])
  );

  const reloadData = async () => {
    setLoading(true);
    try {
      const db = await getDB();
      await loadStores(db);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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

  // ---------- Skeleton Loading State ----------
  if (loading) {
    return (
      <LinearGradient colors={['#F0F4F8', '#E8EEF4']} style={styles.gradient}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Avatar skeleton */}
          <View style={{ alignItems: 'center', paddingVertical: 32, marginBottom: 16 }}>
            <Skeleton.Circle size={84} style={{ marginBottom: 16 }} />
            <Skeleton.Box width={160} height={26} style={{ marginBottom: 8 }} />
            <Skeleton.Box width={100} height={14} />
          </View>

          {/* Section skeletons */}
          <View style={{ marginBottom: 20 }}>
            <Skeleton.Box width={160} height={16} style={{ marginBottom: 12 }} />
            {[0, 1].map((i) => (
              <Skeleton.Box key={i} width="100%" height={52} borderRadius={10} style={{ marginBottom: 8 }} />
            ))}
          </View>
          <View style={{ marginBottom: 20 }}>
            <Skeleton.Box width={120} height={16} style={{ marginBottom: 12 }} />
            <Skeleton.Card height={80} />
          </View>
          <View style={{ marginBottom: 20 }}>
            <Skeleton.Box width={100} height={16} style={{ marginBottom: 12 }} />
            <Skeleton.Box width={200} height={32} borderRadius={16} />
          </View>
          <View style={{ marginBottom: 20 }}>
            <Skeleton.Box width={130} height={16} style={{ marginBottom: 12 }} />
            <Skeleton.Box width={180} height={38} borderRadius={10} />
          </View>
          <View style={{ marginBottom: 20 }}>
            <Skeleton.Box width="100%" height={96} borderRadius={10} />
          </View>
        </ScrollView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#F0F4F8', '#E8EEF4']} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <AnimatedSection index={0}>
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
        </AnimatedSection>

        {/* Emergency Contacts */}
        <AnimatedSection index={1}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderLeft}>
                <Ionicons name="call-outline" size={16} color={colors.primary} />
                <Text style={styles.sectionTitle}>Emergency Contacts</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('AddContact')} activeOpacity={0.7}>
                <View style={styles.addButton}>
                  <Ionicons name="add" size={16} color={colors.primary} />
                  <Text style={styles.addLink}>Add</Text>
                </View>
              </TouchableOpacity>
            </View>
            {contacts.length === 0 ? (
              <Text style={styles.emptyText}>No emergency contacts added</Text>
            ) : (
              contacts.map((c) => (
                <TouchableOpacity key={c.id} style={styles.contactRow} onPress={() => handleDeleteContact(c.id)} activeOpacity={0.7}>
                  <View style={styles.contactAvatar}>
                    <Ionicons name="person" size={20} color={colors.primary} />
                  </View>
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactName}>{c.name}</Text>
                    <Text style={styles.contactDetail}>{c.relationship || ''} {c.phone}</Text>
                  </View>
                  {c.is_primary ? (
                    <View style={styles.primaryBadge}>
                      <Text style={styles.primaryBadgeText}>PRIMARY</Text>
                    </View>
                  ) : null}
                  <Ionicons name="chevron-forward" size={16} color={colors.textDisabled} />
                </TouchableOpacity>
              ))
            )}
          </View>
        </AnimatedSection>

        {/* Conditions */}
        <AnimatedSection index={2}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderLeft}>
                <Ionicons name="medical-outline" size={16} color={colors.primary} />
                <Text style={styles.sectionTitle}>Conditions</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('AddCondition')} activeOpacity={0.7}>
                <View style={styles.addButton}>
                  <Ionicons name="add" size={16} color={colors.primary} />
                  <Text style={styles.addLink}>Add</Text>
                </View>
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
        </AnimatedSection>

        {/* Allergies */}
        <AnimatedSection index={3}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderLeft}>
                <Ionicons name="warning-outline" size={16} color={colors.primary} />
                <Text style={styles.sectionTitle}>Allergies</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('AddAllergy')} activeOpacity={0.7}>
                <View style={styles.addButton}>
                  <Ionicons name="add" size={16} color={colors.primary} />
                  <Text style={styles.addLink}>Add</Text>
                </View>
              </TouchableOpacity>
            </View>
            <View style={styles.allergyChips}>
              {allergies.length === 0 ? (
                <Text style={styles.emptyText}>No allergies added</Text>
              ) : (
                allergies.map((a) => (
                  <TouchableOpacity
                    key={a.id}
                    style={[styles.allergyChip, { backgroundColor: severityColor(a.severity) + '18' }]}
                    onPress={() => handleDeleteAllergy(a.id)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.allergyDot, { backgroundColor: severityColor(a.severity) }]} />
                    <Text style={[styles.allergyText, { color: severityColor(a.severity) }]}>
                      {a.name}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          </View>
        </AnimatedSection>

        {/* Medications */}
        <AnimatedSection index={4}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderLeft}>
                <Ionicons name="medkit-outline" size={16} color={colors.primary} />
                <Text style={styles.sectionTitle}>Medications</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('AddMedication')} activeOpacity={0.7}>
                <View style={styles.addButton}>
                  <Ionicons name="add" size={16} color={colors.primary} />
                  <Text style={styles.addLink}>Add</Text>
                </View>
              </TouchableOpacity>
            </View>
            <Button
              title="View All Medications"
              onPress={() => navigation.navigate('MedicationsList')}
              variant="ghost"
              size="medium"
            />
          </View>
        </AnimatedSection>

        {/* Actions */}
        <AnimatedSection index={5}>
          <View style={styles.actionsSection}>
            <TouchableOpacity style={styles.actionRow} onPress={() => navigation.navigate('EditProfile')} activeOpacity={0.7}>
              <Ionicons name="create-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.actionText}>Edit Profile</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textDisabled} />
            </TouchableOpacity>
            <View style={styles.actionDivider} />
            <TouchableOpacity style={styles.actionRow} onPress={() => navigation.navigate('Export', { preSelectedType: 'medical_id' })} activeOpacity={0.7}>
              <Ionicons name="document-text-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.actionText}>Export Medical ID</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textDisabled} />
            </TouchableOpacity>
          </View>
        </AnimatedSection>

        <View style={{ height: spacing.space12 }} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
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
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.space4,
    borderWidth: 3,
    borderColor: 'rgba(26,95,122,0.1)',
  },
  avatarLargeText: {
    fontSize: 34,
    fontWeight: '700',
    color: colors.primary,
    fontFamily: fonts.display,
  },
  profileName: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.textPrimary,
    fontFamily: fonts.display,
    letterSpacing: -0.3,
    marginBottom: spacing.space1,
  },
  profileAge: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: fonts.body,
    marginBottom: spacing.space2,
  },
  profileMeta: {
    marginTop: spacing.space1,
  },
  profileMetaText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontFamily: fonts.body,
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
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.space2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    fontFamily: fonts.display,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  addLink: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    fontFamily: fonts.body,
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
    gap: spacing.space3,
  },
  contactAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    fontFamily: fonts.body,
  },
  contactDetail: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: fonts.body,
    marginTop: 2,
  },
  primaryBadge: {
    backgroundColor: colors.primarySurface,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  primaryBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
    fontFamily: fonts.body,
  },
  allergyChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  allergyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.space2,
    paddingHorizontal: spacing.space3,
    borderRadius: borderRadius.full,
    marginRight: spacing.space2,
    marginBottom: spacing.space2,
    gap: spacing.space1 + 2,
  },
  allergyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  allergyText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: fonts.body,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textDisabled,
    fontFamily: fonts.body,
    fontStyle: 'italic',
  },
  actionsSection: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    marginTop: spacing.space4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.space4,
    gap: spacing.space3,
  },
  actionText: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
    fontFamily: fonts.body,
    fontWeight: '500',
  },
  actionDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginHorizontal: spacing.space4,
  },
});
