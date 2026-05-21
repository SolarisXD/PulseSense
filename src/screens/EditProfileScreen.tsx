// PulseSense — Edit Profile Screen

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, Platform, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { fonts } from '../constants/typography';
import { colors, spacing, borderRadius } from '../constants/spacing';
import { Button } from '../components/ui/Button';
import { useProfileStore } from '../store/profileStore';
import { useDateInput } from '../hooks/useDateInput';
import { getDB, loadStores } from '../hooks/useDB';
import { updateProfile, updateProfilePhoto } from '../db/queries/profile';

const SEX_OPTIONS = ['Male', 'Female', 'Non-binary', 'Transgender Male', 'Transgender Female', 'Genderqueer', 'Intersex', 'Prefer not to say'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'];

export function EditProfileScreen({ navigation }: any) {
  const profile = useProfileStore((s) => s.profile);
  const [name, setName] = useState(profile?.full_name || '');
  const dobInput = useDateInput();
  React.useEffect(() => { if (profile?.dob) dobInput.setValue(profile.dob); }, []);
  const [sex, setSex] = useState(profile?.sex || '');
  const [showSexPicker, setShowSexPicker] = useState(false);
  const [bloodGroup, setBloodGroup] = useState(profile?.blood_group || '');
  const [showBloodPicker, setShowBloodPicker] = useState(false);
  const [photo, setPhoto] = useState(profile?.photo_uri || '');
  const [saving, setSaving] = useState(false);

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
    setSaving(true);
    try {
      const db = await getDB();
      await updateProfile(db, {
        full_name: name.trim(),
        dob: dobInput.value || profile?.dob || '',
        sex: sex || profile?.sex || '',
        blood_group: bloodGroup || profile?.blood_group || null,
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      {/* Photo */}
      <TouchableOpacity style={styles.photoContainer} onPress={handlePickPhoto}>
        <View style={styles.photoCircle}>
          {photo ? (
            <Image source={{ uri: photo }} style={styles.photoImage} />
          ) : (
            <Text style={styles.photoInitial}>{name?.charAt(0)?.toUpperCase() || 'U'}</Text>
          )}
        </View>
        <Text style={styles.photoLabel}>Change Photo</Text>
      </TouchableOpacity>

      <Text style={styles.label}>FULL NAME *</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Full name" placeholderTextColor={colors.textDisabled} />

      <Text style={styles.label}>DATE OF BIRTH</Text>
      <TextInput style={styles.input} value={dobInput.value} onChangeText={dobInput.handleChange} placeholder="DD/MM/YYYY" placeholderTextColor={colors.textDisabled} keyboardType="number-pad" maxLength={10} />

      <Text style={styles.label}>SEX</Text>
      <TouchableOpacity style={styles.input} onPress={() => setShowSexPicker(!showSexPicker)}>
        <Text style={[styles.inputText, !sex && { color: colors.textDisabled }]}>{sex || 'Select sex'}</Text>
      </TouchableOpacity>
      {showSexPicker && SEX_OPTIONS.map((opt) => (
        <TouchableOpacity key={opt} style={[styles.pickerOption, sex === opt && styles.pickerSelected]} onPress={() => { setSex(opt); setShowSexPicker(false); }}>
          <Text style={[styles.pickerText, sex === opt && styles.pickerTextSelected]}>{opt}</Text>
        </TouchableOpacity>
      ))}

      <Text style={styles.label}>BLOOD GROUP</Text>
      <TouchableOpacity style={styles.input} onPress={() => setShowBloodPicker(!showBloodPicker)}>
        <Text style={[styles.inputText, !bloodGroup && { color: colors.textDisabled }]}>{bloodGroup || 'Select blood group'}</Text>
      </TouchableOpacity>
      {showBloodPicker && BLOOD_GROUPS.map((bg) => (
        <TouchableOpacity key={bg} style={[styles.pickerOption, bloodGroup === bg && styles.pickerSelected]} onPress={() => { setBloodGroup(bg); setShowBloodPicker(false); }}>
          <Text style={[styles.pickerText, bloodGroup === bg && styles.pickerTextSelected]}>{bg}</Text>
        </TouchableOpacity>
      ))}

      <Button title={saving ? 'Saving...' : 'Save Profile'} onPress={handleSave} loading={saving} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.space4 },
  photoContainer: { alignItems: 'center', marginBottom: spacing.space6 },
  photoCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primarySurface, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.space2 },
  photoInitial: { fontSize: 32, fontWeight: '700', color: colors.primary, fontFamily: fonts.body },
  photoImage: { width: 80, height: 80, borderRadius: 40 },
  photoEmoji: { fontSize: 32 },
  photoLabel: { fontSize: 13, color: colors.primary, fontWeight: '500', fontFamily: fonts.body },
  label: { fontSize: 12, fontWeight: '500', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: fonts.body, marginBottom: spacing.space2, marginTop: spacing.space4 },
  input: { height: 48, borderWidth: 1.5, borderColor: colors.border, borderRadius: borderRadius.sm, paddingHorizontal: spacing.space3, fontSize: 15, color: colors.textPrimary, fontFamily: fonts.body, backgroundColor: colors.surface, justifyContent: 'center', marginBottom: spacing.space2 },
  inputText: { fontSize: 15, color: colors.textPrimary, fontFamily: fonts.body },
  pickerOption: { paddingVertical: spacing.space3, paddingHorizontal: spacing.space4, borderBottomWidth: 1, borderBottomColor: colors.borderLight, backgroundColor: colors.surface },
  pickerSelected: { backgroundColor: colors.primarySurface },
  pickerText: { fontSize: 14, color: colors.textPrimary, fontFamily: fonts.body },
  pickerTextSelected: { color: colors.primary, fontWeight: '600' },
});
