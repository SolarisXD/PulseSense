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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../constants/colors';
import { spacing, borderRadius } from '../../constants/spacing';
import { fonts } from '../../constants/typography';
import { Button } from '../../components/ui/Button';
import { useDateInput } from '../../hooks/useDateInput';
import { getDB } from '../../hooks/useDB';
import { insertProfile, updateProfilePhoto } from '../../db/queries/profile';
import { loadStores } from '../../hooks/useDB';
import { useSettingsStore } from '../../store/settingsStore';
import { saveProfilePhotoLocally } from '../../utils/profilePhoto';

interface SetupProfileScreenProps {
  onComplete: () => void;
  onBack?: () => void;
}

const SEX_OPTIONS = [
  'Male', 'Female', 'Non-binary', 'Transgender Male',
  'Transgender Female', 'Genderqueer', 'Intersex', 'Prefer not to say',
];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'];

function isValidDate(dateString: string): boolean {
  const reg = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  if (!reg.test(dateString)) return false;

  const [, dayStr, monthStr, yearStr] = dateString.match(reg) || [];
  const day = parseInt(dayStr, 10);
  const month = parseInt(monthStr, 10);
  const year = parseInt(yearStr, 10);

  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;

  const monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  if (isLeapYear) {
    monthDays[1] = 29;
  }

  if (day > monthDays[month - 1]) return false;

  const dobDate = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (dobDate > today) return false;

  const minYear = today.getFullYear() - 120;
  if (year < minYear) return false;

  return true;
}

export function SetupProfileScreen({ onComplete, onBack }: SetupProfileScreenProps) {
  const insets = useSafeAreaInsets();
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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const heightUnit = useSettingsStore((s) => s.heightUnit);

  const handleNameChange = (val: string) => {
    setName(val);
    if (errors.name) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.name;
        return next;
      });
    }
  };

  const handleDobChange = (text: string) => {
    dobInput.handleChange(text);
    if (errors.dob) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.dob;
        return next;
      });
    }
  };

  const handleSexSelect = (opt: string) => {
    setSex(opt);
    setShowSexPicker(false);
    if (errors.sex) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.sex;
        return next;
      });
    }
  };

  const handleHeightCmChange = (val: string) => {
    setHeightCm(val);
    if (errors.height) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.height;
        return next;
      });
    }
  };

  const handleHeightFtChange = (val: string) => {
    setHeightFt(val);
    if (errors.height) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.height;
        return next;
      });
    }
  };

  const handleHeightInChange = (val: string) => {
    setHeightIn(val);
    if (errors.height) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.height;
        return next;
      });
    }
  };

  const handlePickPhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8 });
      if (!result.canceled && result.assets[0]) {
        const savedUri = await saveProfilePhotoLocally(result.assets[0].uri);
        setPhoto(savedUri);
        if (errors.photo) {
          setErrors((prev) => {
            const next = { ...prev };
            delete next.photo;
            return next;
          });
        }
      }
    } catch (err) {
      console.error('Photo pick error:', err);
      Alert.alert('Error', 'Failed to select photo.');
    }
  };

  const handleSave = async () => {
    const newErrors: Record<string, string> = {};

    // 1. Photo validation
    if (!photo) {
      newErrors.photo = 'Profile photo is required.';
    }

    // 2. Name validation
    const nameTrimmed = name.trim();
    if (!nameTrimmed) {
      newErrors.name = 'Full name is required.';
    } else if (nameTrimmed.length > 100) {
      newErrors.name = 'Name is too long.';
    }

    // 3. DOB validation
    if (!dobInput.value) {
      newErrors.dob = 'Date of birth is required.';
    } else if (!isValidDate(dobInput.value)) {
      newErrors.dob = 'Please enter a valid date in DD/MM/YYYY format.';
    }

    // 4. Sex validation
    if (!sex) {
      newErrors.sex = 'Sex is required.';
    }

    // 5. Height validation
    if (heightUnit === 'cm' && heightCm.trim().length > 0) {
      const val = parseFloat(heightCm);
      if (isNaN(val) || val < 30 || val > 250) {
        newErrors.height = 'Height must be between 30 and 250 cm.';
      }
    } else if (heightUnit === 'ft_in') {
      const hasFt = heightFt.trim().length > 0;
      const hasIn = heightIn.trim().length > 0;
      if (hasFt || hasIn) {
        const ftVal = parseInt(heightFt, 10);
        const inVal = heightIn ? parseFloat(heightIn) : 0;
        if (isNaN(ftVal) || ftVal < 1 || ftVal > 8) {
          newErrors.height = 'Feet must be between 1 and 8.';
        } else if (isNaN(inVal) || inVal < 0 || inVal >= 12) {
          newErrors.height = 'Inches must be between 0 and 11.99.';
        }
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setError('Please correct the highlighted fields before proceeding.');
      return;
    }

    setSaving(true);
    setError('');
    setErrors({});
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
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(insets.top, spacing.space6),
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.heading}>Set up your profile</Text>
          <Text style={styles.subtext}>This information stays on your device and is used for Medical ID exports.</Text>
        </View>

        {/* Row 1: Profile Photo & Full Name */}
        <View style={styles.photoAndNameRow}>
          <View style={styles.photoColumn}>
            <Text style={styles.label}>PHOTO *</Text>
            <TouchableOpacity style={styles.photoWrapper} onPress={handlePickPhoto} activeOpacity={0.7}>
              <View style={[styles.photoCircle, errors.photo && styles.photoCircleError]}>
                {photo ? (
                  <Image source={{ uri: photo }} style={styles.photoImage} />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Ionicons name="camera-outline" size={24} color={errors.photo ? colors.danger : colors.primary} />
                    <Text style={[styles.photoPlaceholderText, errors.photo && { color: colors.danger }]}>Add</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
            {photo.length > 0 && (
              <TouchableOpacity onPress={handlePickPhoto}>
                <Text style={styles.changePhotoText}>Change</Text>
              </TouchableOpacity>
            )}
            {errors.photo ? <Text style={styles.fieldErrorText}>{errors.photo}</Text> : null}
          </View>

          <View style={styles.nameColumn}>
            <Text style={styles.label}>FULL NAME *</Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              value={name}
              onChangeText={handleNameChange}
              placeholder="Enter your full name"
              placeholderTextColor={colors.textDisabled}
            />
            {errors.name ? <Text style={styles.fieldErrorText}>{errors.name}</Text> : null}
          </View>
        </View>

        {/* Row 2: DOB & Sex */}
        <View style={styles.row}>
          <View style={[styles.column, { flex: 1.1 }]}>
            <Text style={styles.label}>DATE OF BIRTH *</Text>
            <TextInput
              style={[styles.input, errors.dob && styles.inputError]}
              value={dobInput.value}
              onChangeText={handleDobChange}
              placeholder="DD/MM/YYYY"
              placeholderTextColor={colors.textDisabled}
              keyboardType="number-pad"
              maxLength={10}
            />
            {errors.dob ? <Text style={styles.fieldErrorText}>{errors.dob}</Text> : null}
          </View>

          <View style={[styles.column, { flex: 1.5 }]}>
            <Text style={styles.label}>SEX *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollChips}>
              {SEX_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[
                    styles.chip,
                    sex === opt && styles.chipSelected,
                    errors.sex && styles.chipError,
                  ]}
                  onPress={() => handleSexSelect(opt)}
                >
                  <Text style={[styles.chipText, sex === opt && styles.chipTextSelected]}>
                    {opt}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {errors.sex ? <Text style={styles.fieldErrorText}>{errors.sex}</Text> : null}
          </View>
        </View>

        {/* Row 3: Blood Group & Height */}
        <View style={styles.row}>
          <View style={[styles.column, { flex: 1.5 }]}>
            <Text style={styles.label}>BLOOD GROUP (optional)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollChips}>
              {BLOOD_GROUPS.map((bg) => (
                <TouchableOpacity
                  key={bg}
                  style={[
                    styles.chip,
                    bloodGroup === bg && styles.chipSelected,
                  ]}
                  onPress={() => setBloodGroup(bg)}
                >
                  <Text style={[styles.chipText, bloodGroup === bg && styles.chipTextSelected]}>
                    {bg}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={[styles.column, { flex: 1.1 }]}>
            <Text style={styles.label}>HEIGHT ({heightUnit === 'cm' ? 'cm' : 'ft/in'})</Text>
            {heightUnit === 'cm' ? (
              <TextInput
                style={[styles.input, errors.height && styles.inputError]}
                value={heightCm}
                onChangeText={handleHeightCmChange}
                placeholder="e.g. 175"
                placeholderTextColor={colors.textDisabled}
                keyboardType="decimal-pad"
              />
            ) : (
              <View style={{ flexDirection: 'row', gap: spacing.space1 }}>
                <View style={{ flex: 1 }}>
                  <TextInput
                    style={[styles.input, errors.height && styles.inputError, { paddingHorizontal: spacing.space1 }]}
                    value={heightFt}
                    onChangeText={handleHeightFtChange}
                    placeholder="ft"
                    placeholderTextColor={colors.textDisabled}
                    keyboardType="number-pad"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <TextInput
                    style={[styles.input, errors.height && styles.inputError, { paddingHorizontal: spacing.space1 }]}
                    value={heightIn}
                    onChangeText={handleHeightInChange}
                    placeholder="in"
                    placeholderTextColor={colors.textDisabled}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>
            )}
            {errors.height ? <Text style={styles.fieldErrorText}>{errors.height}</Text> : null}
          </View>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>

      <View
        style={[
          styles.footerRow,
          {
            paddingBottom: spacing.space4,
          },
        ]}
      >
        {onBack ? (
          <>
            <View style={{ flex: 1 }}>
              <Button title="Back" onPress={onBack} variant="outline" size="full" />
            </View>
            <View style={{ width: spacing.space3 }} />
            <View style={{ flex: 2 }}>
              <Button
                title={saving ? 'Saving...' : 'Continue'}
                onPress={handleSave}
                loading={saving}
                size="full"
              />
            </View>
          </>
        ) : (
          <Button
            title={saving ? 'Saving...' : 'Continue'}
            onPress={handleSave}
            loading={saving}
            size="full"
          />
        )}
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
    paddingHorizontal: spacing.space5,
    paddingBottom: spacing.space8,
  },
  header: {
    marginBottom: spacing.space5,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    fontFamily: fonts.display,
    letterSpacing: -0.3,
    marginBottom: spacing.space1,
    textAlign: 'center',
  },
  subtext: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    fontFamily: fonts.body,
    lineHeight: 18,
  },
  photoAndNameRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.space4,
    marginBottom: spacing.space4,
  },
  photoColumn: {
    alignItems: 'center',
    width: 80,
  },
  nameColumn: {
    flex: 1,
  },
  photoWrapper: {
    alignItems: 'center',
    marginTop: spacing.space1,
  },
  photoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  photoImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  photoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoPlaceholderText: {
    fontSize: 10,
    color: colors.primary,
    fontFamily: fonts.body,
    marginTop: 2,
  },
  changePhotoText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '500',
    fontFamily: fonts.body,
    textAlign: 'center',
    marginTop: 2,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.space4,
    marginBottom: spacing.space4,
  },
  column: {
    justifyContent: 'flex-start',
  },
  scrollChips: {
    gap: spacing.space2,
    paddingVertical: spacing.space1,
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: spacing.space3,
    height: 48,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  chipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySurface,
  },
  chipError: {
    borderColor: colors.danger,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textPrimary,
    fontFamily: fonts.body,
  },
  chipTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
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
  error: {
    fontSize: 12,
    color: colors.danger,
    fontFamily: fonts.body,
    textAlign: 'center',
    marginTop: spacing.space2,
  },
  photoCircleError: {
    borderColor: colors.danger,
  },
  inputError: {
    borderColor: colors.danger,
  },
  fieldErrorText: {
    fontSize: 11,
    color: colors.danger,
    fontFamily: fonts.body,
    marginTop: spacing.space1,
    paddingHorizontal: spacing.space1,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.space6,
    paddingTop: spacing.space3,
  },
});
