// PulseSense — Add Emergency Contact Screen

import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { fonts } from '../constants/typography';
import { spacing, borderRadius } from '../constants/spacing';
import { Button } from '../components/ui/Button';
import { getDB, loadStores } from '../hooks/useDB';
import { insertContact } from '../db/queries/contacts';
import { useColors } from '../hooks/useColors';

export function AddContactScreen({ navigation }: any) {
  const c = useColors();
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
    <ScrollView style={[styles.container, { backgroundColor: c.background }]} contentContainerStyle={styles.content}>
      <Text style={[styles.label, { color: c.textSecondary }]}>NAME *</Text>
      <TextInput
        style={[styles.input, { borderColor: c.border, color: c.textPrimary, backgroundColor: c.surface }]}
        value={name}
        onChangeText={setName}
        placeholder="Contact name"
        placeholderTextColor={c.textDisabled}
      />

      <Text style={[styles.label, { color: c.textSecondary }]}>RELATIONSHIP</Text>
      <TextInput
        style={[styles.input, { borderColor: c.border, color: c.textPrimary, backgroundColor: c.surface }]}
        value={relationship}
        onChangeText={setRelationship}
        placeholder="e.g. Spouse, Parent, Doctor"
        placeholderTextColor={c.textDisabled}
      />

      <Text style={[styles.label, { color: c.textSecondary }]}>PHONE *</Text>
      <TextInput
        style={[styles.input, { borderColor: c.border, color: c.textPrimary, backgroundColor: c.surface }]}
        value={phone}
        onChangeText={setPhone}
        placeholder="Phone number"
        placeholderTextColor={c.textDisabled}
        keyboardType="phone-pad"
      />

      <Text style={[styles.label, { color: c.textSecondary }]}>CONTACT TYPE</Text>
      <View style={styles.typeToggle}>
        <TouchableOpacity
          style={[styles.typeOption, { borderColor: c.border, backgroundColor: c.surface }, contactType === 'doctor' && { borderColor: c.primary, backgroundColor: c.primarySurface }]}
          onPress={() => setContactType('doctor')}
        >
          <Text style={[styles.typeOptionText, { color: c.textPrimary }, contactType === 'doctor' && { color: c.primary }]}>Doctor</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.typeOption, { borderColor: c.border, backgroundColor: c.surface }, contactType === 'emergency' && { borderColor: c.primary, backgroundColor: c.primarySurface }]}
          onPress={() => setContactType('emergency')}
        >
          <Text style={[styles.typeOptionText, { color: c.textPrimary }, contactType === 'emergency' && { color: c.primary }]}>Emergency Contact</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.primaryRow} onPress={() => setIsPrimary(!isPrimary)}>
        <View style={[styles.checkbox, { borderColor: c.border }, isPrimary && { borderColor: c.primary, backgroundColor: c.primary }]}>
          {isPrimary && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={[styles.primaryLabel, { color: c.textPrimary }]}>Set as primary ICE contact</Text>
      </TouchableOpacity>

      <Button title={saving ? 'Saving...' : 'Save Contact'} onPress={handleSave} loading={saving} disabled={!name.trim() || !phone.trim()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.space4 },
  label: { fontSize: 12, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: fonts.body, marginBottom: spacing.space2, marginTop: spacing.space4 },
  input: { height: 48, borderWidth: 1.5, borderRadius: borderRadius.sm, paddingHorizontal: spacing.space3, fontSize: 15, fontFamily: fonts.body, marginBottom: spacing.space2 },
  primaryRow: { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.space5 },
  checkbox: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginRight: spacing.space3 },
  checkmark: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  primaryLabel: { fontSize: 14, fontFamily: fonts.body },
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
  },
  typeOptionText: {
    fontSize: 13,
    fontWeight: '500',
    fontFamily: fonts.body,
  },
});
