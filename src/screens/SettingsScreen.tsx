// PulseSense — Settings Screen

import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Switch, StyleSheet,
  Alert, TextInput, Modal, KeyboardAvoidingView, Platform, Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fonts } from '../constants/typography';
import { colors } from '../constants/colors';
import { spacing, borderRadius } from '../constants/spacing';
import { colorsDark } from '../constants/colorsDark';
import { useSettingsStore } from '../store/settingsStore';
import { useThemeStore } from '../store/themeStore';
import { useProfileStore } from '../store/profileStore';
import { useAlertStore } from '../store/alertStore';
import { getDB } from '../hooks/useDB';
import { setSetting } from '../db/queries/settings';
import { deleteAllData } from '../db/queries/deleteProfile';
import {
  cancelAllMedicationReminders,
  rescheduleAllMedicationReminders,
  requestNotificationPermissions,
} from '../services/notificationService';
import { performBackupAndShare, restoreDatabase } from '../services/backupService';
import { Button } from '../components/ui/Button';

const UNIT_OPTIONS: Record<string, { key: string; label: string; options: { value: string; label: string }[] }> = {
  tempUnit: {
    key: 'temp_unit',
    label: 'Temperature Unit',
    options: [
      { value: 'C', label: '°C (Celsius)' },
      { value: 'F', label: '°F (Fahrenheit)' },
    ],
  },
  weightUnit: {
    key: 'weight_unit',
    label: 'Weight Unit',
    options: [
      { value: 'kg', label: 'Kilograms (kg)' },
      { value: 'lbs', label: 'Pounds (lbs)' },
    ],
  },
  glucoseUnit: {
    key: 'glucose_unit',
    label: 'Glucose Unit',
    options: [
      { value: 'mg/dL', label: 'mg/dL' },
      { value: 'mmol/L', label: 'mmol/L' },
    ],
  },
  heightUnit: {
    key: 'height_unit',
    label: 'Height Unit',
    options: [
      { value: 'cm', label: 'Centimeters (cm)' },
      { value: 'ft_in', label: 'Feet + Inches' },
    ],
  },
  bpDefaultPosition: {
    key: 'bp_default_position',
    label: 'Default BP Position',
    options: [
      { value: 'sitting', label: 'Sitting' },
      { value: 'standing', label: 'Standing' },
      { value: 'lying', label: 'Lying' },
    ],
  },
};

export function SettingsScreen({ navigation }: any) {
  const tempUnit = useSettingsStore((s) => s.tempUnit);
  const weightUnit = useSettingsStore((s) => s.weightUnit);
  const glucoseUnit = useSettingsStore((s) => s.glucoseUnit);
  const heightUnit = useSettingsStore((s) => s.heightUnit);
  const bpDefaultPosition = useSettingsStore((s) => s.bpDefaultPosition);
  const emergencyNumber = useSettingsStore((s) => s.emergencyNumber);
  const medicationReminders = useSettingsStore((s) => s.medicationReminders);
  const reminderMorningTime = useSettingsStore((s) => s.reminderMorningTime);
  const reminderAfternoonTime = useSettingsStore((s) => s.reminderAfternoonTime);
  const reminderNightTime = useSettingsStore((s) => s.reminderNightTime);
  const setTempUnit = useSettingsStore((s) => s.setTempUnit);
  const setWeightUnit = useSettingsStore((s) => s.setWeightUnit);
  const setGlucoseUnit = useSettingsStore((s) => s.setGlucoseUnit);
  const setHeightUnit = useSettingsStore((s) => s.setHeightUnit);
  const setBpDefaultPosition = useSettingsStore((s) => s.setBpDefaultPosition);
  const setEmergencyNumber = useSettingsStore((s) => s.setEmergencyNumber);
  const setMedicationReminders = useSettingsStore((s) => s.setMedicationReminders);
  const setReminderMorningTime = useSettingsStore((s) => s.setReminderMorningTime);
  const setReminderAfternoonTime = useSettingsStore((s) => s.setReminderAfternoonTime);
  const setReminderNightTime = useSettingsStore((s) => s.setReminderNightTime);
  const isDark = useThemeStore((s) => s.isDark);
  const setDark = useThemeStore((s) => s.setDark);
  const [backingUp, setBackingUp] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [emergencyModalVisible, setEmergencyModalVisible] = useState(false);
  const [emergencyEditValue, setEmergencyEditValue] = useState('');
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
  const [termsModalVisible, setTermsModalVisible] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    (async () => {
      const enabled = await requestNotificationPermissions();
      setNotificationsEnabled(enabled);
    })();
  }, []);

  const activeColors = isDark ? { ...colors, ...colorsDark } : colors;

  const handleChange = async (storeKey: string, dbKey: string, value: string) => {
    try {
      const db = await getDB();
      await setSetting(db, dbKey, value);
      const setters: Record<string, (val: any) => void> = {
        tempUnit: useSettingsStore.getState().setTempUnit,
        weightUnit: useSettingsStore.getState().setWeightUnit,
        glucoseUnit: useSettingsStore.getState().setGlucoseUnit,
        heightUnit: useSettingsStore.getState().setHeightUnit,
        bpDefaultPosition: useSettingsStore.getState().setBpDefaultPosition,
      };
      setters[storeKey]?.(value);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to save setting.');
    }
  };

  const currentValue = (storeKey: string): string => {
    const map: Record<string, string> = {
      tempUnit: tempUnit,
      weightUnit: weightUnit,
      glucoseUnit: glucoseUnit,
      heightUnit: heightUnit,
      bpDefaultPosition: bpDefaultPosition,
    };
    return map[storeKey] || '';
  };

  const saveReminderTimes = async () => {
    try {
      const db = await getDB();
      const state = useSettingsStore.getState();
      await Promise.all([
        setSetting(db, 'reminder_morning', state.reminderMorningTime),
        setSetting(db, 'reminder_afternoon', state.reminderAfternoonTime),
        setSetting(db, 'reminder_night', state.reminderNightTime),
      ]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProfile = () => {
    Alert.alert(
      'Delete Profile',
      'This will permanently delete ALL your data including profile, vitals, medical history, medications, conditions, allergies, emergency contacts, and settings.\n\nThis action CANNOT be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          style: 'destructive',
          onPress: () => {
            setDeleteConfirmText('');
            setDeleteModalVisible(true);
          },
        },
      ]
    );
  };

  const handleDeleteConfirm = async () => {
    const profileName = useProfileStore.getState().profile?.full_name || '';
    const expected = `DELETE ${profileName}`;
    if (deleteConfirmText.trim() !== expected) return;

    setDeleting(true);
    try {
      const db = await getDB();
      await deleteAllData(db);

      useProfileStore.getState().clear();
      useAlertStore.getState().clear();
      useSettingsStore.getState().setOnboardingComplete(false);

      await cancelAllMedicationReminders();

      setDeleteModalVisible(false);
      setDeleting(false);

      Alert.alert('Profile Deleted', 'All data has been permanently removed.');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to delete profile data.');
      setDeleting(false);
    }
  };

  const profileName = useProfileStore((s) => s.profile?.full_name || '');

  return (
    <ScrollView style={[styles.container, { backgroundColor: activeColors.background }]} contentContainerStyle={styles.content}>
      <Text style={[styles.sectionTitle, { color: activeColors.textSecondary }]}>Units</Text>
      {Object.entries(UNIT_OPTIONS).map(([storeKey, config]) => (
        <View key={storeKey} style={styles.settingGroup}>
          <Text style={[styles.settingLabel, { color: activeColors.textPrimary }]}>{config.label}</Text>
          <View style={styles.optionsRow}>
            {config.options.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                  style={[
                    styles.optionChip,
                    { borderColor: activeColors.border, backgroundColor: activeColors.surface },
                    currentValue(storeKey) === opt.value && { borderColor: activeColors.primary, backgroundColor: activeColors.primarySurface },
                  ]}
                  onPress={() => handleChange(storeKey, config.key, opt.value)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      { color: activeColors.textPrimary },
                      currentValue(storeKey) === opt.value && { color: activeColors.primary, fontWeight: '600' as const },
                    ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      <Text style={[styles.sectionTitle, { marginTop: spacing.space6, color: activeColors.textSecondary }]}>Appearance</Text>
      <TouchableOpacity
        style={[styles.linkRow, { backgroundColor: activeColors.surface }]}
        onPress={() => setDark(!isDark)}
      >
        <View style={styles.linkRowLeft}>
          <Ionicons
            name={isDark ? 'moon' : 'sunny-outline'}
            size={20}
            color={activeColors.textSecondary}
            style={{ marginRight: spacing.space3 }}
          />
          <Text style={[styles.linkText, { color: activeColors.textPrimary }]}>Dark Mode</Text>
        </View>
        <Switch
          value={isDark}
          onValueChange={setDark}
          trackColor={{ false: activeColors.border, true: activeColors.primaryLight }}
          thumbColor={isDark ? activeColors.primary : activeColors.textDisabled}
        />
      </TouchableOpacity>

      <Text style={[styles.sectionTitle, { marginTop: spacing.space6 }]}>Emergency</Text>
      <View style={styles.settingGroup}>
        <Text style={[styles.settingLabel, { color: activeColors.textPrimary }]}>Emergency Number</Text>
        <TouchableOpacity
          style={[styles.editRow, { backgroundColor: activeColors.surface }]}
          onPress={() => {
            setEmergencyEditValue(emergencyNumber);
            setEmergencyModalVisible(true);
          }}
        >
          <Text style={[styles.editRowValue, { color: activeColors.textPrimary }]}>{emergencyNumber}</Text>
          <Text style={[styles.editRowAction, { color: activeColors.primary }]}>Change</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.sectionTitle, { marginTop: spacing.space6, color: activeColors.textSecondary }]}>Notifications</Text>
      <TouchableOpacity
        style={[styles.linkRow, { backgroundColor: activeColors.surface }]}
        onPress={async () => {
          if (notificationsEnabled) {
            Alert.alert('Notifications', 'Push notifications are enabled. To disable, go to your device Settings.');
            return;
          }
          const granted = await requestNotificationPermissions();
          setNotificationsEnabled(granted);
          Alert.alert(
            'Notifications',
            granted ? 'Push notifications enabled' : 'Permission denied. Enable in Settings.'
          );
        }}
      >
        <View style={styles.linkRowLeft}>
          <Ionicons name="notifications-outline" size={20} color={activeColors.textSecondary} style={{ marginRight: spacing.space3 }} />
          <Text style={[styles.linkText, { color: activeColors.textPrimary }]}>Push Notifications</Text>
        </View>
        <View style={[styles.toggleDot, { borderColor: activeColors.border, backgroundColor: activeColors.surface }, notificationsEnabled && { borderColor: activeColors.primary, backgroundColor: activeColors.primary }]} />
      </TouchableOpacity>

      <Text style={[styles.sectionTitle, { marginTop: spacing.space6, color: activeColors.textSecondary }]}>Medication Reminders</Text>
      <TouchableOpacity
        style={[styles.linkRow, { backgroundColor: activeColors.surface }]}
        onPress={async () => {
          const next = !medicationReminders;
          try {
            const db = await getDB();
            await setSetting(db, 'medication_reminders', next ? 'true' : 'false');
            setMedicationReminders(next);

            if (next) {
              // Request permissions and schedule all active reminders
              const granted = await requestNotificationPermissions();
              if (granted) {
                await rescheduleAllMedicationReminders(
                  reminderMorningTime,
                  reminderAfternoonTime,
                  reminderNightTime,
                );
                Alert.alert('Reminders On', 'Medication reminders have been scheduled.');
              } else {
                Alert.alert('Permission Denied', 'Enable notifications in Settings to receive reminders.');
              }
            } else {
              await cancelAllMedicationReminders();
              Alert.alert('Reminders Off', 'All medication reminders have been cancelled.');
            }
          } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Failed to update reminder settings.');
          }
        }}
      >
        <View style={styles.linkRowLeft}>
          <Ionicons name="alarm-outline" size={20} color={activeColors.textSecondary} style={{ marginRight: spacing.space3 }} />
          <Text style={[styles.linkText, { color: activeColors.textPrimary }]}>Enable Reminders</Text>
        </View>
        <Switch
          value={medicationReminders}
          trackColor={{ false: activeColors.border, true: activeColors.primaryLight }}
          thumbColor={medicationReminders ? activeColors.primary : activeColors.textDisabled}
        />
      </TouchableOpacity>

      {medicationReminders && (
        <View style={[styles.timeSection, { backgroundColor: activeColors.surface }]}>
          <Text style={[styles.timeSectionLabel, { color: activeColors.textSecondary }]}>Reminder Times</Text>

          <View style={styles.timeRow}>
            <Text style={[styles.timeLabel, { color: activeColors.textPrimary }]}>Morning</Text>
            <TextInput
              style={[styles.timeInput, { borderColor: activeColors.border, color: activeColors.textPrimary, backgroundColor: activeColors.surfaceAlt }]}
              value={reminderMorningTime}
              onChangeText={(t) => {
                if (/^\d{0,2}:\d{0,2}$/.test(t) || t === '') {
                  setReminderMorningTime(t);
                }
              }}
              onBlur={async () => {
                const cleaned = reminderMorningTime.padEnd(5, '0').replace(/(\d{2}):(\d{2}).*/, '$1:$2');
                const valid = /^([01]\d|2[0-3]):[0-5]\d$/.test(cleaned) ? cleaned : '08:00';
                setReminderMorningTime(valid);
                await saveReminderTimes();
                const state = useSettingsStore.getState();
                if (state.medicationReminders) {
                  await rescheduleAllMedicationReminders(valid, state.reminderAfternoonTime, state.reminderNightTime);
                }
              }}
              placeholder="08:00"
              placeholderTextColor={activeColors.textDisabled}
              keyboardType="numbers-and-punctuation"
              maxLength={5}
            />
          </View>

          <View style={styles.timeRow}>
            <Text style={[styles.timeLabel, { color: activeColors.textPrimary }]}>Afternoon</Text>
            <TextInput
              style={[styles.timeInput, { borderColor: activeColors.border, color: activeColors.textPrimary, backgroundColor: activeColors.surfaceAlt }]}
              value={reminderAfternoonTime}
              onChangeText={(t) => {
                if (/^\d{0,2}:\d{0,2}$/.test(t) || t === '') {
                  setReminderAfternoonTime(t);
                }
              }}
              onBlur={async () => {
                const cleaned = reminderAfternoonTime.padEnd(5, '0').replace(/(\d{2}):(\d{2}).*/, '$1:$2');
                const valid = /^([01]\d|2[0-3]):[0-5]\d$/.test(cleaned) ? cleaned : '14:00';
                setReminderAfternoonTime(valid);
                await saveReminderTimes();
                const state = useSettingsStore.getState();
                if (state.medicationReminders) {
                  await rescheduleAllMedicationReminders(state.reminderMorningTime, valid, state.reminderNightTime);
                }
              }}
              placeholder="14:00"
              placeholderTextColor={activeColors.textDisabled}
              keyboardType="numbers-and-punctuation"
              maxLength={5}
            />
          </View>

          <View style={styles.timeRow}>
            <Text style={[styles.timeLabel, { color: activeColors.textPrimary }]}>Night</Text>
            <TextInput
              style={[styles.timeInput, { borderColor: activeColors.border, color: activeColors.textPrimary, backgroundColor: activeColors.surfaceAlt }]}
              value={reminderNightTime}
              onChangeText={(t) => {
                if (/^\d{0,2}:\d{0,2}$/.test(t) || t === '') {
                  setReminderNightTime(t);
                }
              }}
              onBlur={async () => {
                const cleaned = reminderNightTime.padEnd(5, '0').replace(/(\d{2}):(\d{2}).*/, '$1:$2');
                const valid = /^([01]\d|2[0-3]):[0-5]\d$/.test(cleaned) ? cleaned : '21:00';
                setReminderNightTime(valid);
                await saveReminderTimes();
                const state = useSettingsStore.getState();
                if (state.medicationReminders) {
                  await rescheduleAllMedicationReminders(state.reminderMorningTime, state.reminderAfternoonTime, valid);
                }
              }}
              placeholder="21:00"
              placeholderTextColor={activeColors.textDisabled}
              keyboardType="numbers-and-punctuation"
              maxLength={5}
            />
          </View>
        </View>
      )}

      <Text style={[styles.sectionTitle, { marginTop: spacing.space6, color: activeColors.textSecondary }]}>Privacy & Legal</Text>
      <TouchableOpacity
        style={[styles.linkRow, { backgroundColor: activeColors.surface }]}
        onPress={() => setPrivacyModalVisible(true)}
      >
        <View style={styles.linkRowLeft}>
          <Ionicons name="shield-checkmark-outline" size={20} color={activeColors.textSecondary} style={{ marginRight: spacing.space3 }} />
          <Text style={[styles.linkText, { color: activeColors.textPrimary }]}>Privacy Policy</Text>
        </View>
        <Text style={[styles.linkArrow, { color: activeColors.textSecondary }]}>→</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.linkRow, { backgroundColor: activeColors.surface }]}
        onPress={() => setTermsModalVisible(true)}
      >
        <View style={styles.linkRowLeft}>
          <Ionicons name="document-text-outline" size={20} color={activeColors.textSecondary} style={{ marginRight: spacing.space3 }} />
          <Text style={[styles.linkText, { color: activeColors.textPrimary }]}>Terms of Service</Text>
        </View>
        <Text style={[styles.linkArrow, { color: activeColors.textSecondary }]}>→</Text>
      </TouchableOpacity>

      <Text style={[styles.sectionTitle, { marginTop: spacing.space6, color: activeColors.textSecondary }]}>System</Text>
      <TouchableOpacity
        style={[styles.linkRow, { backgroundColor: activeColors.surface }]}
        onPress={() => Alert.alert('Check for Updates', 'PulseSense v1.0.0 — You are on the latest version.')}
      >
        <View style={styles.linkRowLeft}>
          <Ionicons name="cloud-download-outline" size={20} color={activeColors.textSecondary} style={{ marginRight: spacing.space3 }} />
          <Text style={[styles.linkText, { color: activeColors.textPrimary }]}>Check for Updates</Text>
        </View>
        <Text style={[styles.linkBadge, { color: activeColors.primary, backgroundColor: activeColors.primarySurface }]}>v1.0.0</Text>
      </TouchableOpacity>

      <Text style={[styles.sectionTitle, { marginTop: spacing.space6, color: activeColors.textSecondary }]}>Data</Text>
      <TouchableOpacity
        style={[styles.linkRow, { backgroundColor: activeColors.surface }]}
        onPress={() => navigation.navigate('CustomVitals')}
      >
        <View style={styles.linkRowLeft}>
          <Ionicons name="pulse-outline" size={20} color={activeColors.textSecondary} style={{ marginRight: spacing.space3 }} />
          <Text style={[styles.linkText, { color: activeColors.textPrimary }]}>Manage Custom Vitals</Text>
        </View>
        <Text style={[styles.linkArrow, { color: activeColors.textSecondary }]}>→</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.linkRow, { backgroundColor: activeColors.surface }]}
        onPress={() => navigation.navigate('HealthConnection')}
      >
        <View style={styles.linkRowLeft}>
          <Ionicons name="fitness-outline" size={20} color={activeColors.textSecondary} style={{ marginRight: spacing.space3 }} />
          <Text style={[styles.linkText, { color: activeColors.textPrimary }]}>Apple Health / Health Connect</Text>
        </View>
        <Text style={[styles.linkArrow, { color: activeColors.textSecondary }]}>→</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.linkRow, { backgroundColor: activeColors.surface }]}
        onPress={() => navigation.navigate('Export')}
      >
        <View style={styles.linkRowLeft}>
          <Ionicons name="download-outline" size={20} color={activeColors.textSecondary} style={{ marginRight: spacing.space3 }} />
          <Text style={[styles.linkText, { color: activeColors.textPrimary }]}>Export All Data as PDF</Text>
        </View>
        <Text style={[styles.linkArrow, { color: activeColors.textSecondary }]}>→</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.linkRow, { backgroundColor: activeColors.surface }]}
        onPress={async () => {
          setBackingUp(true);
          try {
            await performBackupAndShare();
          } catch (err) {
            Alert.alert('Backup Error', 'Failed to create backup. Please try again.');
            console.error(err);
          }
          setBackingUp(false);
        }}
        disabled={backingUp}
      >
        <View style={styles.linkRowLeft}>
          <Ionicons name="cloud-upload-outline" size={20} color={activeColors.textSecondary} style={{ marginRight: spacing.space3 }} />
          <Text style={[styles.linkText, { color: activeColors.textPrimary }]}>
            {backingUp ? 'Creating backup...' : 'Backup Data'}
          </Text>
        </View>
        <Ionicons name="share-outline" size={18} color={activeColors.textSecondary} />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.linkRow, { backgroundColor: activeColors.surface }]}
        onPress={() => {
          Alert.alert(
            'Restore Data',
            'This will replace ALL current data with the backup. This action cannot be undone. Continue?',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Restore',
                style: 'destructive',
                onPress: async () => {
                  setRestoring(true);
                  try {
                    const result = await restoreDatabase();
                    if (result.success) {
                      Alert.alert('Restore Complete', result.message);
                    } else {
                      Alert.alert('Restore Failed', result.message);
                    }
                  } catch (err) {
                    Alert.alert('Restore Error', 'Failed to restore data. Please try again.');
                    console.error(err);
                  }
                  setRestoring(false);
                },
              },
            ]
          );
        }}
        disabled={restoring}
      >
        <View style={styles.linkRowLeft}>
          <Ionicons name="cloud-download-outline" size={20} color={activeColors.textSecondary} style={{ marginRight: spacing.space3 }} />
          <Text style={[styles.linkText, { color: activeColors.textPrimary }]}>
            {restoring ? 'Restoring...' : 'Restore Data'}
          </Text>
        </View>
        <Ionicons name="folder-open-outline" size={18} color={activeColors.textSecondary} />
      </TouchableOpacity>

      <Text style={[styles.sectionTitle, { marginTop: spacing.space6, color: activeColors.danger }]}>Danger Zone</Text>
      <TouchableOpacity
        style={[styles.linkRow, { backgroundColor: activeColors.surface }]}
        onPress={handleDeleteProfile}
      >
        <View style={styles.linkRowLeft}>
          <Ionicons name="trash-outline" size={20} color={activeColors.danger} style={{ marginRight: spacing.space3 }} />
          <Text style={[styles.linkText, { color: activeColors.danger }]}>Delete Profile</Text>
        </View>
        <Text style={[styles.linkArrow, { color: activeColors.danger }]}>→</Text>
      </TouchableOpacity>

      <Text style={[styles.sectionTitle, { marginTop: spacing.space6, color: activeColors.textSecondary }]}>About</Text>
      <View style={[styles.aboutCard, { backgroundColor: activeColors.surface }]}>
        <Text style={[styles.aboutText, { color: activeColors.textPrimary }]}>PulseSense v1.0.0</Text>
        <Text style={[styles.aboutPrivacy, { color: activeColors.textSecondary }]}>
          All data stored locally on this device only. No data is sent to any server.
          PulseSense provides general health guidance and emergency checklists. It does not
          diagnose medical conditions. Always consult a qualified healthcare professional.
        </Text>
      </View>

      <View style={{ height: spacing.space12 }} />

      {/* Emergency Number Edit Modal (cross-platform) */}
      <Modal
        visible={emergencyModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEmergencyModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={[styles.modalOverlay, { backgroundColor: activeColors.overlay }]}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={[styles.modalCard, { backgroundColor: activeColors.surface }]}>
            <Text style={[styles.modalTitle, { color: activeColors.textPrimary }]}>Emergency Number</Text>
            <TextInput
              style={[styles.modalInput, { borderColor: activeColors.border, color: activeColors.textPrimary, backgroundColor: activeColors.surfaceAlt }]}
              value={emergencyEditValue}
              onChangeText={setEmergencyEditValue}
              placeholder="Enter emergency number"
              placeholderTextColor={activeColors.textDisabled}
              keyboardType="phone-pad"
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalCancelBtn, { borderColor: activeColors.border }]}
                onPress={() => setEmergencyModalVisible(false)}
              >
                <Text style={[styles.modalCancelText, { color: activeColors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSaveBtn, { backgroundColor: activeColors.primary }]}
                onPress={async () => {
                  if (emergencyEditValue.trim()) {
                    try {
                      const db = await getDB();
                      await setSetting(db, 'emergency_number', emergencyEditValue.trim());
                      setEmergencyNumber(emergencyEditValue.trim());
                    } catch (err) {
                      console.error(err);
                      Alert.alert('Error', 'Failed to save emergency number.');
                    }
                  }
                  setEmergencyModalVisible(false);
                }}
              >
                <Text style={styles.modalSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Privacy Policy Modal */}
      <Modal
        visible={privacyModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPrivacyModalVisible(false)}
      >
        <KeyboardAvoidingView style={[styles.modalOverlay, { backgroundColor: activeColors.overlay }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={[styles.modalCard, { backgroundColor: activeColors.surface }]}>
            <Text style={[styles.modalTitle, { color: activeColors.textPrimary }]}>Privacy Policy</Text>
            <ScrollView style={{ maxHeight: 300 }}>
              <Text style={[styles.modalBody, { color: activeColors.textSecondary }]}>
                PulseSense respects your privacy. All health data entered into this application
                is stored exclusively on your device using local SQLite storage.{'\n\n'}
                No personal information, health records, or usage data is transmitted to any
                external server, cloud service, or third party.{'\n\n'}
                PulseSense does not collect analytics, track your activity, or share data
                with advertisers.{'\n\n'}
                In the event of an emergency, data shown on screen may be read by emergency
                responders at your discretion. You are in full control of what information
                is displayed and shared.{'\n\n'}
                By using PulseSense, you acknowledge that the app is for informational and
                organizational purposes only and does not replace professional medical advice.
              </Text>
            </ScrollView>
            <TouchableOpacity style={[styles.modalSaveBtn, { backgroundColor: activeColors.primary }]} onPress={() => setPrivacyModalVisible(false)}>
              <Text style={styles.modalSaveText}>Close</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Terms of Service Modal */}
      <Modal
        visible={termsModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setTermsModalVisible(false)}
      >
        <KeyboardAvoidingView style={[styles.modalOverlay, { backgroundColor: activeColors.overlay }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={[styles.modalCard, { backgroundColor: activeColors.surface }]}>
            <Text style={[styles.modalTitle, { color: activeColors.textPrimary }]}>Terms of Service</Text>
            <ScrollView style={{ maxHeight: 300 }}>
              <Text style={[styles.modalBody, { color: activeColors.textSecondary }]}>
                By using PulseSense you agree to the following terms:{'\n\n'}
                1. PulseSense is a health information organizer and emergency checklist tool.
                It does NOT provide medical diagnosis, treatment, or advice.{'\n\n'}
                2. Always consult a qualified healthcare professional for medical decisions.
                Never disregard professional advice due to something read in PulseSense.{'\n\n'}
                3. You are responsible for the accuracy of data you enter. PulseSense does
                not verify medical information.{'\n\n'}
                4. In emergency situations, call your local emergency services immediately.
                Do not rely solely on PulseSense guidance.{'\n\n'}
                5. PulseSense is provided "as is" without warranty of any kind. The developers
                shall not be liable for any damages arising from use of this software.
              </Text>
            </ScrollView>
            <TouchableOpacity style={[styles.modalSaveBtn, { backgroundColor: activeColors.primary }]} onPress={() => setTermsModalVisible(false)}>
              <Text style={styles.modalSaveText}>Close</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Delete Profile Confirmation Modal */}
      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={[styles.modalOverlay, { backgroundColor: activeColors.overlay }]}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={[styles.deleteModalCard, { backgroundColor: activeColors.surface }]}>
            <View style={[styles.deleteIconCircle, { backgroundColor: activeColors.dangerSurface }]}>
              <Ionicons name="trash" size={28} color={activeColors.danger} />
            </View>

            <Text style={[styles.deleteModalTitle, { color: activeColors.textPrimary }]}>
              Delete Profile
            </Text>
            <Text style={[styles.deleteModalSubtitle, { color: activeColors.textSecondary }]}>
              This will permanently remove all data for:
            </Text>

            <View style={[styles.deleteDataCard, { backgroundColor: activeColors.dangerSurface }]}>
              {['Profile & Personal Info', 'Vitals History', 'Medications & Prescriptions',
                'Medical Conditions', 'Allergies', 'Emergency Contacts', 'Settings & Preferences',
              ].map((item) => (
                <View key={item} style={styles.deleteDataRow}>
                  <View style={[styles.deleteDataBullet, { backgroundColor: activeColors.danger }]} />
                  <Text style={[styles.deleteDataText, { color: activeColors.textPrimary }]}>{item}</Text>
                </View>
              ))}
            </View>

            <Text style={[styles.deleteConfirmLabel, { color: activeColors.textSecondary }]}>
              Type <Text style={{ fontWeight: '700', color: activeColors.danger }}>DELETE {profileName}</Text> to confirm
            </Text>

            <View style={styles.deleteInputRow}>
              <TextInput
                style={[
                  styles.deleteInput,
                  {
                    borderColor: deleteConfirmText.trim() === `DELETE ${profileName}`
                      ? activeColors.success
                      : activeColors.border,
                    color: activeColors.textPrimary,
                    backgroundColor: activeColors.surfaceAlt,
                  },
                ]}
                value={deleteConfirmText}
                onChangeText={setDeleteConfirmText}
                placeholder={`DELETE ${profileName}`}
                placeholderTextColor={activeColors.textDisabled}
                autoCapitalize="characters"
                autoFocus
                editable={!deleting}
              />
              {deleteConfirmText.trim() === `DELETE ${profileName}` && (
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={activeColors.success}
                  style={styles.deleteMatchIcon}
                />
              )}
            </View>

            <View style={styles.deleteModalButtons}>
              <TouchableOpacity
                style={[styles.deleteCancelBtn, { borderColor: activeColors.border }]}
                onPress={() => {
                  setDeleteModalVisible(false);
                  setDeleteConfirmText('');
                }}
                disabled={deleting}
              >
                <Text style={[styles.deleteCancelText, { color: activeColors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <View style={styles.deleteConfirmBtnWrap}>
                <Button
                  title={deleting ? 'Deleting...' : 'Delete Everything'}
                  onPress={handleDeleteConfirm}
                  variant={deleteConfirmText.trim() === `DELETE ${profileName}` ? 'danger' : 'disabled'}
                  size="medium"
                  loading={deleting}
                  disabled={deleteConfirmText.trim() !== `DELETE ${profileName}` || deleting}
                />
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: fonts.body,
    marginBottom: spacing.space4,
  },
  settingGroup: {
    marginBottom: spacing.space5,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
    fontFamily: fonts.body,
    marginBottom: spacing.space3,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  optionChip: {
    paddingVertical: spacing.space2 + 2,
    paddingHorizontal: spacing.space4,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginRight: spacing.space2,
    marginBottom: spacing.space2,
    backgroundColor: colors.surface,
  },
  optionChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySurface,
  },
  optionText: {
    fontSize: 13,
    color: colors.textPrimary,
    fontFamily: fonts.body,
  },
  optionTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  editRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.space4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  editRowValue: {
    fontSize: 16,
    color: colors.textPrimary,
    fontFamily: fonts.mono,
  },
  editRowAction: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500',
    fontFamily: fonts.body,
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  linkText: {
    fontSize: 15,
    color: colors.textPrimary,
    fontFamily: fonts.body,
  },
  linkArrow: {
    fontSize: 18,
    color: colors.textSecondary,
  },
  linkRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkBadge: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    fontFamily: fonts.body,
    backgroundColor: colors.primarySurface,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  toggleDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  toggleDotActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  timeSection: {
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
  timeSectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    fontFamily: fonts.body,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.space3,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.space3,
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
    fontFamily: fonts.body,
    flex: 1,
  },
  timeInput: {
    width: 80,
    height: 40,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.space3,
    fontSize: 16,
    color: colors.textPrimary,
    fontFamily: fonts.mono,
    backgroundColor: colors.surfaceAlt,
    textAlign: 'center',
  },
  aboutCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.space4,
  },
  aboutText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    fontFamily: fonts.body,
    marginBottom: spacing.space3,
  },
  aboutPrivacy: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
    fontFamily: fonts.body,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.space6,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.space6,
    width: '100%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    fontFamily: fonts.body,
    marginBottom: spacing.space4,
    textAlign: 'center',
  },
  modalBody: {
    fontSize: 13,
    color: colors.textSecondary,
    fontFamily: fonts.body,
    lineHeight: 20,
    marginBottom: spacing.space5,
  },
  modalInput: {
    height: 48,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.space3,
    fontSize: 18,
    color: colors.textPrimary,
    fontFamily: fonts.mono,
    backgroundColor: colors.surfaceAlt,
    textAlign: 'center',
    marginBottom: spacing.space5,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalCancelBtn: {
    flex: 1,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.space2,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    fontFamily: fonts.body,
  },
  modalSaveBtn: {
    flex: 1,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.space2,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
  },
  modalSaveText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: fonts.body,
  },
  deleteModalCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.space6,
    width: '100%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    alignItems: 'center',
  },
  deleteIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.space4,
  },
  deleteModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: fonts.display,
    color: colors.textPrimary,
    marginBottom: spacing.space1,
    textAlign: 'center',
  },
  deleteModalSubtitle: {
    fontSize: 13,
    fontFamily: fonts.body,
    color: colors.textSecondary,
    marginBottom: spacing.space4,
    textAlign: 'center',
  },
  deleteDataCard: {
    width: '100%',
    borderRadius: borderRadius.md,
    padding: spacing.space4,
    marginBottom: spacing.space5,
  },
  deleteDataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.space2,
  },
  deleteDataBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: spacing.space3,
  },
  deleteDataText: {
    fontSize: 13,
    fontFamily: fonts.body,
    color: colors.textPrimary,
  },
  deleteConfirmLabel: {
    fontSize: 13,
    fontFamily: fonts.body,
    color: colors.textSecondary,
    marginBottom: spacing.space3,
    textAlign: 'center',
  },
  deleteInputRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.space5,
  },
  deleteInput: {
    flex: 1,
    height: 48,
    borderWidth: 1.5,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.space3,
    fontSize: 16,
    fontFamily: fonts.mono,
    textAlign: 'center',
    letterSpacing: 1,
  },
  deleteMatchIcon: {
    marginLeft: spacing.space3,
  },
  deleteModalButtons: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.space3,
  },
  deleteCancelBtn: {
    flex: 1,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
  },
  deleteCancelText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: fonts.body,
  },
  deleteConfirmBtnWrap: {
    flex: 1,
  },
});
