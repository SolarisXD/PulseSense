// PulseSense — Edit Profile Screen

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, Platform, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { fonts } from '../constants/typography';
import { useColors } from '../hooks/useColors';
import { spacing, borderRadius } from '../constants/spacing';
import { Button } from '../components/ui/Button';
import { useProfileStore } from '../store/profileStore';
import { useDateInput } from '../hooks/useDateInput';
import { useSettingsStore } from '../store/settingsStore';
import { getDB, loadStores } from '../hooks/useDB';
import { updateProfile, updateProfilePhoto } from '../db/queries/profile';

const SEX_OPTIONS = ['Male', 'Female', 'Non-binary', 'Transgender Male', 'Transgender Female', 'Genderqueer', 'Intersex', 'Prefer not to say'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'];

export function EditProfileScreen({ navigation }: any) {
  const c = useColors();
  const profile = useProfileStore((s) => s.profile);
  const [name, setName] = useState(profile?.full_name || '');
  const dobInput = useDateInput();

  useEffect(() => {
    if (profile?.dob) dobInput.setValue(profile.dob);
  }, [profile?.dob]);
  const [sex, setSex] = useState(profile?.sex || '');
  const [showSexPicker, setShowSexPicker] = useState(false);
  const [bloodGroup, setBloodGroup] = useState(profile?.blood_group || '');
  const [showBloodPicker, setShowBloodPicker] = useState(false);
  const [heightCm, setHeightCm] = useState(profile?.height_unit === 'cm' && profile?.height_value ? String(profile.height_value) : '');
  const [heightFt, setHeightFt] = useState(profile?.height_unit === 'ft_in' && profile?.height_ft ? String(profile.height_ft) : '');
  const [heightIn, setHeightIn] = useState(profile?.height_unit === 'ft_in' && profile?.height_in ? String(profile.height_in) : '');
  const [photo, setPhoto] = useState(profile?.photo_uri || '');
  const [saving, setSaving] = useState(false);
  const heightUnit = useSettingsStore((s) => s.heightUnit);

  const handlePickPhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8 });
      if (!result.canceled && result.assets[0]) {
        setPhoto(result.assets[0].uri);
        const db = await getDB();
        await updateProfilePhoto(db, result.assets[0].uri);
        await loadStores(db);
      }
    } catch (err) {
      console.error('Photo pick error:', err);
      Alert.alert('Error', 'Failed to select photo.');
    }
  };

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('Required', 'Name is required.'); return; }
    if (!photo) { Alert.alert('Required', 'A profile photo is required. Please add one.'); return; }
    setSaving(true);
    try {
      const db = await getDB();
      await updateProfile(db, {
        full_name: name.trim(),
        dob: dobInput.value || profile?.dob || '',
        sex: sex || profile?.sex || '',
        blood_group: bloodGroup || profile?.blood_group || null,
        height_value: heightUnit === 'cm' ? (heightCm ? parseFloat(heightCm) : null) : null,
        height_unit: heightUnit,
        height_ft: heightUnit === 'ft_in' ? (heightFt ? parseInt(heightFt, 10) : null) : null,
        height_in: heightUnit === 'ft_in' ? (heightIn ? parseFloat(heightIn) : null) : null,
        photo_uri: photo || null,
      });
      await loadStores(db);
      navigation.goBack();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to update profile.');
    }
    setSaving(false);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: c.background }]} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      {/* Photo */}
      <TouchableOpacity style={styles.photoContainer} onPress={handlePickPhoto}>
        <View style={[styles.photoCircle, { backgroundColor: c.primarySurface }]}>
          {photo ? (
            <Image source={{ uri: photo }} style={styles.photoImage} />
          ) : (
            <Text style={[styles.photoInitial, { color: c.primary }]}>{name?.charAt(0)?.toUpperCase() || 'U'}</Text>
          )}
        </View>
        <Text style={[styles.photoLabel, { color: c.primary }]}>Change Photo</Text>
      </TouchableOpacity>

      <Text style={[styles.label, { color: c.textSecondary }]}>FULL NAME *</Text>
      <TextInput style={[styles.input, { borderColor: c.border, color: c.textPrimary, backgroundColor: c.surface }]} value={name} onChangeText={setName} placeholder="Full name" placeholderTextColor={c.textDisabled} />

      <Text style={[styles.label, { color: c.textSecondary }]}>DATE OF BIRTH</Text>
      <TextInput style={[styles.input, { borderColor: c.border, color: c.textPrimary, backgroundColor: c.surface }]} value={dobInput.value} onChangeText={dobInput.handleChange} placeholder="DD/MM/YYYY" placeholderTextColor={c.textDisabled} keyboardType="number-pad" maxLength={10} />

      <Text style={[styles.label, { color: c.textSecondary }]}>SEX</Text>
      <TouchableOpacity style={[styles.input, { borderColor: c.border, color: c.textPrimary, backgroundColor: c.surface }]} onPress={() => setShowSexPicker(!showSexPicker)}>
        <Text style={[styles.inputText, { color: c.textPrimary }, !sex && { color: c.textDisabled }]}>{sex || 'Select sex'}</Text>
      </TouchableOpacity>
      {showSexPicker && SEX_OPTIONS.map((opt) => (
        <TouchableOpacity key={opt} style={[styles.pickerOption, { borderBottomColor: c.borderLight, backgroundColor: c.surface }, sex === opt && { backgroundColor: c.primarySurface }]} onPress={() => { setSex(opt); setShowSexPicker(false); }}>
          <Text style={[styles.pickerText, { color: c.textPrimary }, sex === opt && { color: c.primary, fontWeight: '600' }]}>{opt}</Text>
        </TouchableOpacity>
      ))}

      <Text style={[styles.label, { color: c.textSecondary }]}>BLOOD GROUP</Text>
      <TouchableOpacity style={[styles.input, { borderColor: c.border, color: c.textPrimary, backgroundColor: c.surface }]} onPress={() => setShowBloodPicker(!showBloodPicker)}>
        <Text style={[styles.inputText, { color: c.textPrimary }, !bloodGroup && { color: c.textDisabled }]}>{bloodGroup || 'Select blood group'}</Text>
      </TouchableOpacity>
      {showBloodPicker && BLOOD_GROUPS.map((bg) => (
        <TouchableOpacity key={bg} style={[styles.pickerOption, { borderBottomColor: c.borderLight, backgroundColor: c.surface }, bloodGroup === bg && { backgroundColor: c.primarySurface }]} onPress={() => { setBloodGroup(bg); setShowBloodPicker(false); }}>
          <Text style={[styles.pickerText, { color: c.textPrimary }, bloodGroup === bg && { color: c.primary, fontWeight: '600' }]}>{bg}</Text>
        </TouchableOpacity>
      ))}

      <Text style={[styles.label, { color: c.textSecondary }]}>HEIGHT ({heightUnit === 'cm' ? 'cm' : 'ft/in'})</Text>
      {heightUnit === 'cm' ? (
        <TextInput
          style={[styles.input, { borderColor: c.border, color: c.textPrimary, backgroundColor: c.surface }]}
          value={heightCm}
          onChangeText={setHeightCm}
          placeholder="e.g. 175"
          placeholderTextColor={c.textDisabled}
          keyboardType="decimal-pad"
        />
      ) : (
        <View style={{ flexDirection: 'row', gap: spacing.space2 }}>
          <View style={{ flex: 1 }}>
            <TextInput
              style={[styles.input, { borderColor: c.border, color: c.textPrimary, backgroundColor: c.surface }]}
              value={heightFt}
              onChangeText={setHeightFt}
              placeholder="ft"
              placeholderTextColor={c.textDisabled}
              keyboardType="number-pad"
            />
          </View>
          <View style={{ flex: 1 }}>
            <TextInput
              style={[styles.input, { borderColor: c.border, color: c.textPrimary, backgroundColor: c.surface }]}
              value={heightIn}
              onChangeText={setHeightIn}
              placeholder="in"
              placeholderTextColor={c.textDisabled}
              keyboardType="decimal-pad"
            />
          </View>
        </View>
      )}

      <Button title={saving ? 'Saving...' : 'Save Profile'} onPress={handleSave} loading={saving} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.space4 },
  photoContainer: { alignItems: 'center', marginBottom: spacing.space6 },
  photoCircle: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.space2 },
  photoInitial: { fontSize: 32, fontWeight: '700', fontFamily: fonts.body },
  photoImage: { width: 80, height: 80, borderRadius: 40 },
  photoEmoji: { fontSize: 32 },
  photoLabel: { fontSize: 13, fontWeight: '500', fontFamily: fonts.body },
  label: { fontSize: 12, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: fonts.body, marginBottom: spacing.space2, marginTop: spacing.space4 },
  input: { height: 48, borderWidth: 1.5, borderRadius: borderRadius.sm, paddingHorizontal: spacing.space3, fontSize: 15, fontFamily: fonts.body, justifyContent: 'center', marginBottom: spacing.space2 },
  inputText: { fontSize: 15, fontFamily: fonts.body },
  pickerOption: { paddingVertical: spacing.space3, paddingHorizontal: spacing.space4, borderBottomWidth: 1 },
  pickerText: { fontSize: 14, fontFamily: fonts.body },
});
