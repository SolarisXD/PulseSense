// PulseSense — Profile Screen

import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Linking, Platform, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '../../hooks/useColors';
import { useThemeStore } from '../../store/themeStore';
import { colorsDark } from '../../constants/colorsDark';
import { spacing, borderRadius } from '../../constants/spacing';
import { fonts } from '../../constants/typography';
import { useProfileStore } from '../../store/profileStore';
import { useAgeCalculator } from '../../hooks/useAgeCalculator';
import { getDB, loadStores } from '../../hooks/useDB';
import { archiveCondition } from '../../db/queries/conditions';
import { deleteAllergy } from '../../db/queries/allergies';
import { deleteContact } from '../../db/queries/contacts';
import { deleteMedication } from '../../db/queries/medications';
import { AnimatedSection } from '../../components/ui/AnimatedSection';
import { ConditionCard } from '../../components/conditions/ConditionCard';
import { DosageDisplay } from '../../components/medications/DosageDisplay';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';


export function ProfileScreen({ navigation }: any) {
  const c = useColors();
  const isDark = useThemeStore((s) => s.isDark);
  const profile = useProfileStore((s) => s.profile);
  const contacts = useProfileStore((s) => s.contacts);
  const conditions = useProfileStore((s) => s.conditions);
  const allergies = useProfileStore((s) => s.allergies);
  const age = useAgeCalculator();
  const [loading, setLoading] = useState(true);

  const gradientColors = useMemo(
    () => (isDark ? colorsDark.bgGradientVitals : ['#F0F4F8', '#E8EEF4'] as const) as readonly string[],
    [isDark],
  );

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

  const handleCall = useCallback((phone: string) => {
    const url = Platform.OS === 'android' ? `tel:${phone}` : `telprompt:${phone}`;
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Phone calls are not supported on this device.');
      }
    });
  }, []);

  const doctorContacts = contacts.filter((c) => c.contact_type === 'doctor');
  const emergencyContacts = contacts.filter((c) => c.contact_type !== 'doctor');

  const severityColor = (sev: string | null) => {
    switch (sev) {
      case 'severe': return c.danger;
      case 'moderate': return c.warning;
      case 'mild': return c.success;
      default: return c.primary;
    }
  };

  // ---------- Skeleton Loading State ----------
  if (loading) {
    return (
<LinearGradient colors={gradientColors as any} style={styles.gradient}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={{ alignItems: 'center', paddingVertical: 32, marginBottom: 16 }}>
            <Skeleton.Circle size={84} style={{ marginBottom: 16 }} />
            <Skeleton.Box width={160} height={26} style={{ marginBottom: 8 }} />
            <Skeleton.Box width={100} height={14} />
          </View>
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
    <LinearGradient colors={gradientColors as any} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <AnimatedSection index={0}>
          <View style={styles.profileHeader}>
            {profile?.photo_uri ? (
              <Image source={{ uri: profile.photo_uri }} style={styles.avatarLargeImage} />
            ) : (
              <View style={[styles.avatarLarge, { backgroundColor: c.primarySurface }]}>
                <Text style={[styles.avatarLargeText, { color: c.primary }]}>
                  {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                </Text>
              </View>
            )}
            <Text style={[styles.profileName, { color: c.textPrimary }]}>{profile?.full_name || 'User'}</Text>
            <Text style={[styles.profileAge, { color: c.textSecondary }]}>
              {profile?.dob ? `DOB: ${profile.dob}  ·  ${age || ''}` : age || ''}
            </Text>
            <View style={styles.profileMeta}>
              <Text style={[styles.profileMetaText, { color: c.textSecondary }]}>
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
                <Ionicons name="call-outline" size={16} color={c.primary} />
                <Text style={[styles.sectionTitle, { color: c.textPrimary }]}>Emergency Contacts</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('AddContact')} activeOpacity={0.7}>
                <View style={styles.addButton}>
                  <Ionicons name="add" size={16} color={c.primary} />
                  <Text style={[styles.addLink, { color: c.primary }]}>Add</Text>
                </View>
              </TouchableOpacity>
            </View>

            {doctorContacts.length > 0 && (
              <>
                <Text style={[styles.subsectionLabel, { color: c.textSecondary }]}>Doctors</Text>
                {doctorContacts.map((contact) => (
                  <View key={contact.id} style={[styles.contactRow, { backgroundColor: c.surface }]}>
                    <TouchableOpacity style={styles.contactInfoArea} onPress={() => handleDeleteContact(contact.id)} activeOpacity={0.7}>
                      <View style={[styles.contactAvatar, { backgroundColor: c.primarySurface }]}>
                        <Ionicons name="medkit-outline" size={18} color={c.primary} />
                      </View>
                      <View style={styles.contactInfo}>
                        <Text style={[styles.contactName, { color: c.textPrimary }]}>{contact.name}</Text>
                        <Text style={[styles.contactDetail, { color: c.textSecondary }]}>{contact.relationship || ''} {contact.phone}</Text>
                      </View>
                    </TouchableOpacity>
                    <View style={styles.contactActions}>
                      {contact.is_primary ? (
                        <View style={[styles.primaryBadge, { backgroundColor: c.primarySurface }]}>
                          <Text style={[styles.primaryBadgeText, { color: c.primary }]}>PRIMARY</Text>
                        </View>
                      ) : null}
                      <TouchableOpacity style={[styles.callButton, { backgroundColor: c.success }]} onPress={() => handleCall(contact.phone)} activeOpacity={0.7}>
                        <Ionicons name="call" size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </>
            )}

            {emergencyContacts.length > 0 && (
              <>
                {doctorContacts.length > 0 && <View style={[styles.subsectionDivider, { backgroundColor: c.borderLight }]} />}
                <Text style={[styles.subsectionLabel, { color: c.textSecondary }]}>Emergency Contacts</Text>
                {emergencyContacts.map((contact) => (
                  <View key={contact.id} style={[styles.contactRow, { backgroundColor: c.surface }]}>
                    <TouchableOpacity style={styles.contactInfoArea} onPress={() => handleDeleteContact(contact.id)} activeOpacity={0.7}>
                      <View style={[styles.contactAvatar, { backgroundColor: c.primarySurface }]}>
                        <Ionicons name="person" size={18} color={c.primary} />
                      </View>
                      <View style={styles.contactInfo}>
                        <Text style={[styles.contactName, { color: c.textPrimary }]}>{contact.name}</Text>
                        <Text style={[styles.contactDetail, { color: c.textSecondary }]}>{contact.relationship || ''} {contact.phone}</Text>
                      </View>
                    </TouchableOpacity>
                    <View style={styles.contactActions}>
                      {contact.is_primary ? (
                        <View style={[styles.primaryBadge, { backgroundColor: c.primarySurface }]}>
                          <Text style={[styles.primaryBadgeText, { color: c.primary }]}>PRIMARY</Text>
                        </View>
                      ) : null}
                      <TouchableOpacity style={[styles.callButton, { backgroundColor: c.success }]} onPress={() => handleCall(contact.phone)} activeOpacity={0.7}>
                        <Ionicons name="call" size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </>
            )}

            {contacts.length === 0 && (
              <Text style={[styles.emptyText, { color: c.textDisabled }]}>No emergency contacts added</Text>
            )}
          </View>
        </AnimatedSection>

        {/* Conditions */}
        <AnimatedSection index={2}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderLeft}>
                <Ionicons name="medical-outline" size={16} color={c.primary} />
                <Text style={[styles.sectionTitle, { color: c.textPrimary }]}>Conditions</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('AddCondition')} activeOpacity={0.7}>
                <View style={styles.addButton}>
                  <Ionicons name="add" size={16} color={c.primary} />
                  <Text style={[styles.addLink, { color: c.primary }]}>Add</Text>
                </View>
              </TouchableOpacity>
            </View>
            {conditions.length === 0 ? (
              <Text style={[styles.emptyText, { color: c.textDisabled }]}>No conditions added</Text>
            ) : (
              conditions.map((cond) => (
                <ConditionCard
                  key={cond.id}
                  name={cond.name}
                  type={cond.type}
                  diagnosedDate={cond.diagnosed_date}
                  severity={cond.severity}
                  notes={cond.notes}
                  onPress={() => navigation.navigate('EditCondition', { conditionId: cond.id })}
                  onArchive={() => handleArchiveCondition(cond.id)}
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
                <Ionicons name="warning-outline" size={16} color={c.primary} />
                <Text style={[styles.sectionTitle, { color: c.textPrimary }]}>Allergies</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('AddAllergy')} activeOpacity={0.7}>
                <View style={styles.addButton}>
                  <Ionicons name="add" size={16} color={c.primary} />
                  <Text style={[styles.addLink, { color: c.primary }]}>Add</Text>
                </View>
              </TouchableOpacity>
            </View>
            <View style={styles.allergyChips}>
              {allergies.length === 0 ? (
                <Text style={[styles.emptyText, { color: c.textDisabled }]}>No allergies added</Text>
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
                <Ionicons name="medkit-outline" size={16} color={c.primary} />
                <Text style={[styles.sectionTitle, { color: c.textPrimary }]}>Medications</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('AddMedication')} activeOpacity={0.7}>
                <View style={styles.addButton}>
                  <Ionicons name="add" size={16} color={c.primary} />
                  <Text style={[styles.addLink, { color: c.primary }]}>Add</Text>
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
          <View style={[styles.actionsSection, { backgroundColor: c.surface }]}>
            <TouchableOpacity style={styles.actionRow} onPress={() => navigation.navigate('EditProfile')} activeOpacity={0.7}>
              <Ionicons name="create-outline" size={20} color={c.textSecondary} />
              <Text style={[styles.actionText, { color: c.textPrimary }]}>Edit Profile</Text>
              <Ionicons name="chevron-forward" size={16} color={c.textDisabled} />
            </TouchableOpacity>
            <View style={[styles.actionDivider, { backgroundColor: c.borderLight }]} />
            <TouchableOpacity style={styles.actionRow} onPress={() => navigation.navigate('Settings')} activeOpacity={0.7}>
              <Ionicons name="settings-outline" size={20} color={c.textSecondary} />
              <Text style={[styles.actionText, { color: c.textPrimary }]}>Settings</Text>
              <Ionicons name="chevron-forward" size={16} color={c.textDisabled} />
            </TouchableOpacity>
            <View style={[styles.actionDivider, { backgroundColor: c.borderLight }]} />
            <TouchableOpacity style={styles.actionRow} onPress={() => navigation.navigate('Export', { preSelectedType: 'medical_id' })} activeOpacity={0.7}>
              <Ionicons name="document-text-outline" size={20} color={c.textSecondary} />
              <Text style={[styles.actionText, { color: c.textPrimary }]}>Export Medical ID</Text>
              <Ionicons name="chevron-forward" size={16} color={c.textDisabled} />
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
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.space4,
    borderWidth: 3,
    borderColor: 'rgba(26,95,122,0.1)',
  },
  avatarLargeImage: {
    width: 84,
    height: 84,
    borderRadius: 42,
    marginBottom: spacing.space4,
    borderWidth: 3,
    borderColor: 'rgba(26,95,122,0.1)',
  },
  avatarLargeText: {
    fontSize: 34,
    fontWeight: '700',
    fontFamily: fonts.display,
  },
  profileName: {
    fontSize: 26,
    fontWeight: '700',
    fontFamily: fonts.display,
    letterSpacing: -0.3,
    marginBottom: spacing.space1,
  },
  profileAge: {
    fontSize: 14,
    fontFamily: fonts.body,
    marginBottom: spacing.space2,
  },
  profileMeta: {
    marginTop: spacing.space1,
  },
  profileMetaText: {
    fontSize: 13,
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
    fontFamily: fonts.display,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  addLink: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: fonts.body,
  },
  subsectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: fonts.body,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.space2,
    marginTop: spacing.space1,
  },
  subsectionDivider: {
    height: 1,
    marginVertical: spacing.space3,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  contactInfoArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.space3,
  },
  contactAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactInfo: {
    flex: 1,
  },
  contactActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.space2,
  },
  callButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactName: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: fonts.body,
  },
  contactDetail: {
    fontSize: 12,
    fontFamily: fonts.body,
    marginTop: 2,
  },
  primaryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  primaryBadgeText: {
    fontSize: 10,
    fontWeight: '700',
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
    fontFamily: fonts.body,
    fontStyle: 'italic',
  },
  actionsSection: {
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
    fontFamily: fonts.body,
    fontWeight: '500',
  },
  actionDivider: {
    height: 1,
    marginHorizontal: spacing.space4,
  },
});
