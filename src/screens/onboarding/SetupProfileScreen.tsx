// PulseSense — Onboarding: Setup Profile Screen
// Form for name, DOB, sex, blood group (minimal for onboarding)

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  Image,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';
import { spacing, borderRadius } from '../../constants/spacing';
import { fonts } from '../../constants/typography';
import { Button } from '../../components/ui/Button';
import { useDateInput } from '../../hooks/useDateInput';
import { getDB } from '../../hooks/useDB';
import { insertProfile, updateProfilePhoto } from '../../db/queries/profile';
import { setOnboardingComplete } from '../../db/queries/settings';
import { loadStores } from '../../hooks/useDB';
import { useSettingsStore } from '../../store/settingsStore';

interface SetupProfileScreenProps {
  onComplete: () => void;
}

const SEX_OPTIONS = [
  'Male', 'Female', 'Non-binary', 'Transgender Male',
  'Transgender Female', 'Genderqueer', 'Intersex', 'Prefer not to say',
];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'];

export function SetupProfileScreen({ onComplete }: SetupProfileScreenProps) {
  const [name, setName] = useState('');
  const dobInput = useDateInput();
  const [showSexPicker, setShowSexPicker] = useState(false);
  const [sex, setSex] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [showBloodPicker, setShowBloodPicker] = useState(false);
  const [heightCm, setHeightCm] = useState('');
  const [heightFt, setHeightFt] = useState('');
  const [heightIn, setHeightIn] = useState('');
  const [photo, setPhoto] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const heightUnit = useSettingsStore((s) => s.heightUnit);

  const canSave = name.trim().length > 0 && dobInput.value.length === 10 && sex.length > 0 && photo.length > 0;

  const handlePickPhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8 });
      if (!result.canceled && result.assets[0]) {
        setPhoto(result.assets[0].uri);
      }
    } catch (err) {
      console.error('Photo pick error:', err);
      Alert.alert('Error', 'Failed to select photo.');
    }
  };

  const handleSave = async () => {
    if (!canSave) {
      setError('Please add a profile photo, name, date of birth, and sex.');
      return;
    }
    if (!photo) {
      setError('A profile photo is required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const db = await getDB();
      await insertProfile(db, {
        full_name: name.trim(),
        dob: dobInput.value,
        sex,
        blood_group: bloodGroup || null,
        height_value: heightUnit === 'cm' ? (heightCm ? parseFloat(heightCm) : null) : null,
        height_unit: heightUnit,
        height_ft: heightUnit === 'ft_in' ? (heightFt ? parseInt(heightFt, 10) : null) : null,
        height_in: heightUnit === 'ft_in' ? (heightIn ? parseFloat(heightIn) : null) : null,
        photo_uri: photo,
      });
      if (photo) {
        await updateProfilePhoto(db, photo);
      }
      await setOnboardingComplete(db);
      await loadStores(db);
      onComplete();
    } catch (err) {
      setError('Failed to save profile. Please try again.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.heading}>Set up your profile</Text>
          <Text style={styles.subtext}>This information stays on your device and is used for Medical ID exports.</Text>
        </View>

        {/* Profile Photo */}
        <View style={styles.field}>
          <Text style={styles.label}>PROFILE PHOTO *</Text>
          <TouchableOpacity style={styles.photoWrapper} onPress={handlePickPhoto} activeOpacity={0.7}>
            <View style={styles.photoCircle}>
              {photo ? (
                <Image source={{ uri: photo }} style={styles.photoImage} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Ionicons name="camera-outline" size={28} color={colors.primary} />
                  <Text style={styles.photoPlaceholderText}>Tap to add photo</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
          {photo.length > 0 && (
            <TouchableOpacity onPress={handlePickPhoto}>
              <Text style={styles.changePhotoText}>Change Photo</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Full Name */}
        <View style={styles.field}>
          <Text style={styles.label}>FULL NAME *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter your full name"
            placeholderTextColor={colors.textDisabled}
          />
        </View>

        {/* DOB */}
        <View style={styles.field}>
          <Text style={styles.label}>DATE OF BIRTH *</Text>
          <TextInput
            style={styles.input}
            value={dobInput.value}
            onChangeText={dobInput.handleChange}
            placeholder="DD/MM/YYYY"
            placeholderTextColor={colors.textDisabled}
            keyboardType="number-pad"
            maxLength={10}
          />
        </View>

        {/* Sex */}
        <View style={styles.field}>
          <Text style={styles.label}>SEX *</Text>
          <TouchableOpacity style={styles.input} onPress={() => setShowSexPicker(!showSexPicker)}>
            <Text style={[styles.inputText, !sex && styles.placeholder]}>
              {sex || 'Select sex'}
            </Text>
          </TouchableOpacity>
          {showSexPicker && (
            <View style={styles.pickerContainer}>
              {SEX_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[styles.pickerOption, sex === opt && styles.pickerOptionSelected]}
                  onPress={() => { setSex(opt); setShowSexPicker(false); }}
                >
                  <Text style={[styles.pickerText, sex === opt && styles.pickerTextSelected]}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Blood Group */}
        <View style={styles.field}>
          <Text style={styles.label}>BLOOD GROUP (optional)</Text>
          <TouchableOpacity style={styles.input} onPress={() => setShowBloodPicker(!showBloodPicker)}>
            <Text style={[styles.inputText, !bloodGroup && styles.placeholder]}>
              {bloodGroup || 'Select blood group'}
            </Text>
          </TouchableOpacity>
          {showBloodPicker && (
            <View style={styles.pickerContainer}>
              {BLOOD_GROUPS.map((bg) => (
                <TouchableOpacity
                  key={bg}
                  style={[styles.pickerOption, bloodGroup === bg && styles.pickerOptionSelected]}
                  onPress={() => { setBloodGroup(bg); setShowBloodPicker(false); }}
                >
                  <Text style={[styles.pickerText, bloodGroup === bg && styles.pickerTextSelected]}>{bg}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Height */}
        <View style={styles.field}>
          <Text style={styles.label}>HEIGHT ({heightUnit === 'cm' ? 'cm' : 'ft/in'})</Text>
          {heightUnit === 'cm' ? (
            <TextInput
              style={styles.input}
              value={heightCm}
              onChangeText={setHeightCm}
              placeholder="e.g. 175"
              placeholderTextColor={colors.textDisabled}
              keyboardType="decimal-pad"
            />
          ) : (
            <View style={{ flexDirection: 'row', gap: spacing.space2 }}>
              <View style={{ flex: 1 }}>
                <TextInput
                  style={styles.input}
                  value={heightFt}
                  onChangeText={setHeightFt}
                  placeholder="ft"
                  placeholderTextColor={colors.textDisabled}
                  keyboardType="number-pad"
                />
              </View>
              <View style={{ flex: 1 }}>
                <TextInput
                  style={styles.input}
                  value={heightIn}
                  onChangeText={setHeightIn}
                  placeholder="in"
                  placeholderTextColor={colors.textDisabled}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
          )}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>

      <View style={styles.footer}>
        <Button title={saving ? 'Saving...' : 'Continue'} onPress={handleSave} loading={saving} disabled={!canSave} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.space6,
    paddingTop: spacing.space8,
    paddingBottom: spacing.space4,
  },
  header: {
    marginBottom: spacing.space8,
  },
  heading: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.textPrimary,
    fontFamily: fonts.display,
    letterSpacing: -0.3,
    marginBottom: spacing.space3,
    textAlign: 'center',
  },
  subtext: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    fontFamily: fonts.body,
    lineHeight: 18,
  },
  field: {
    marginBottom: spacing.space4,
  },
  photoWrapper: {
    alignItems: 'center',
    marginBottom: spacing.space2,
    marginTop: spacing.space2,
  },
  photoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  photoImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  photoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoPlaceholderText: {
    fontSize: 10,
    color: colors.primary,
    fontFamily: fonts.body,
    marginTop: 4,
  },
  changePhotoText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
    fontFamily: fonts.body,
    textAlign: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: fonts.body,
    marginBottom: spacing.space2,
  },
  input: {
    height: 48,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.space3,
    fontSize: 15,
    color: colors.textPrimary,
    fontFamily: fonts.body,
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  inputText: {
    fontSize: 15,
    color: colors.textPrimary,
    fontFamily: fonts.body,
  },
  placeholder: {
    color: colors.textDisabled,
  },
  pickerContainer: {
    marginTop: spacing.space2,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  pickerOption: {
    paddingVertical: spacing.space3,
    paddingHorizontal: spacing.space4,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  pickerOptionSelected: {
    backgroundColor: colors.primarySurface,
  },
  pickerText: {
    fontSize: 14,
    color: colors.textPrimary,
    fontFamily: fonts.body,
  },
  pickerTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  error: {
    fontSize: 12,
    color: colors.danger,
    fontFamily: fonts.body,
    textAlign: 'center',
    marginTop: spacing.space2,
  },
  footer: {
    paddingHorizontal: spacing.space6,
    paddingBottom: spacing.space8,
    paddingTop: spacing.space3,
  },
});
