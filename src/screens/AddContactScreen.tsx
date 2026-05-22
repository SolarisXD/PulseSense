// PulseSense — Add Emergency Contact Screen

import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { fonts } from '../constants/typography';
import { colors } from '../constants/colors';
import { spacing, borderRadius } from '../constants/spacing';
import { Button } from '../components/ui/Button';
import { getDB, loadStores } from '../hooks/useDB';
import { insertContact } from '../db/queries/contacts';

export function AddContactScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [phone, setPhone] = useState('');
  const [contactType, setContactType] = useState<'doctor' | 'emergency'>('emergency');
  const [isPrimary, setIsPrimary] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert('Required', 'Name and phone number are required.');
      return;
    }
    setSaving(true);
    try {
      const db = await getDB();
      await insertContact(db, { name: name.trim(), relationship: relationship || null, phone: phone.trim(), contact_type: contactType, is_primary: isPrimary ? 1 : 0 });
      await loadStores(db);
      navigation.goBack();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to save contact.');
    }
    setSaving(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>NAME *</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Contact name" placeholderTextColor={colors.textDisabled} />

      <Text style={styles.label}>RELATIONSHIP</Text>
      <TextInput style={styles.input} value={relationship} onChangeText={setRelationship} placeholder="e.g. Spouse, Parent, Doctor" placeholderTextColor={colors.textDisabled} />

      <Text style={styles.label}>PHONE *</Text>
      <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="Phone number" placeholderTextColor={colors.textDisabled} keyboardType="phone-pad" />

      <Text style={styles.label}>CONTACT TYPE</Text>
      <View style={styles.typeToggle}>
        <TouchableOpacity
          style={[styles.typeOption, contactType === 'doctor' && styles.typeOptionSelected]}
          onPress={() => setContactType('doctor')}
        >
          <Text style={[styles.typeOptionText, contactType === 'doctor' && styles.typeOptionTextSelected]}>Doctor</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.typeOption, contactType === 'emergency' && styles.typeOptionSelected]}
          onPress={() => setContactType('emergency')}
        >
          <Text style={[styles.typeOptionText, contactType === 'emergency' && styles.typeOptionTextSelected]}>Emergency Contact</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.primaryRow} onPress={() => setIsPrimary(!isPrimary)}>
        <View style={[styles.checkbox, isPrimary && styles.checkboxSelected]}>
          {isPrimary && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={styles.primaryLabel}>Set as primary ICE contact</Text>
      </TouchableOpacity>

      <Button title={saving ? 'Saving...' : 'Save Contact'} onPress={handleSave} loading={saving} disabled={!name.trim() || !phone.trim()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.space4 },
  label: { fontSize: 12, fontWeight: '500', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: fonts.body, marginBottom: spacing.space2, marginTop: spacing.space4 },
  input: { height: 48, borderWidth: 1.5, borderColor: colors.border, borderRadius: borderRadius.sm, paddingHorizontal: spacing.space3, fontSize: 15, color: colors.textPrimary, fontFamily: fonts.body, backgroundColor: colors.surface, marginBottom: spacing.space2 },
  primaryRow: { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.space5 },
  checkbox: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', marginRight: spacing.space3 },
  checkboxSelected: { borderColor: colors.primary, backgroundColor: colors.primary },
  checkmark: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  primaryLabel: { fontSize: 14, color: colors.textPrimary, fontFamily: fonts.body },
  typeToggle: {
    flexDirection: 'row',
    marginBottom: spacing.space2,
    gap: spacing.space2,
  },
  typeOption: {
    flex: 1,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  typeOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySurface,
  },
  typeOptionText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textPrimary,
    fontFamily: fonts.body,
  },
  typeOptionTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
});
