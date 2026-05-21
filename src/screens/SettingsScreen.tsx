// PulseSense — Settings Screen

import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Alert, TextInput, Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import { fonts } from '../constants/typography';
import { colors, spacing, borderRadius } from '../constants/spacing';
import { useSettingsStore } from '../store/settingsStore';
import { getDB } from '../hooks/useDB';
import { setSetting } from '../db/queries/settings';

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
  const settings = useSettingsStore();
  const [emergencyModalVisible, setEmergencyModalVisible] = useState(false);
  const [emergencyEditValue, setEmergencyEditValue] = useState('');

  const handleChange = async (storeKey: string, dbKey: string, value: string) => {
    try {
      const db = await getDB();
      await setSetting(db, dbKey, value);
      // Update store
      const setterMap: Record<string, (val: any) => void> = {
        tempUnit: settings.setTempUnit,
        weightUnit: settings.setWeightUnit,
        glucoseUnit: settings.setGlucoseUnit,
        heightUnit: settings.setHeightUnit,
        bpDefaultPosition: settings.setBpDefaultPosition,
      };
      setterMap[storeKey]?.(value);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to save setting.');
    }
  };

  const currentValue = (storeKey: string): string => {
    const map: Record<string, string> = {
      tempUnit: settings.tempUnit,
      weightUnit: settings.weightUnit,
      glucoseUnit: settings.glucoseUnit,
      heightUnit: settings.heightUnit,
      bpDefaultPosition: settings.bpDefaultPosition,
    };
    return map[storeKey] || '';
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Units</Text>
      {Object.entries(UNIT_OPTIONS).map(([storeKey, config]) => (
        <View key={storeKey} style={styles.settingGroup}>
          <Text style={styles.settingLabel}>{config.label}</Text>
          <View style={styles.optionsRow}>
            {config.options.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.optionChip,
                  currentValue(storeKey) === opt.value && styles.optionChipSelected,
                ]}
                onPress={() => handleChange(storeKey, config.key, opt.value)}
              >
                <Text
                  style={[
                    styles.optionText,
                    currentValue(storeKey) === opt.value && styles.optionTextSelected,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      <Text style={[styles.sectionTitle, { marginTop: spacing.space6 }]}>Emergency</Text>
      <View style={styles.settingGroup}>
        <Text style={styles.settingLabel}>Emergency Number</Text>
        <TouchableOpacity
          style={styles.editRow}
          onPress={() => {
            setEmergencyEditValue(settings.emergencyNumber);
            setEmergencyModalVisible(true);
          }}
        >
          <Text style={styles.editRowValue}>{settings.emergencyNumber}</Text>
          <Text style={styles.editRowAction}>Change</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.sectionTitle, { marginTop: spacing.space6 }]}>Data</Text>
      <TouchableOpacity
        style={styles.linkRow}
        onPress={() => navigation.navigate('CustomVitals')}
      >
        <Text style={styles.linkText}>Manage Custom Vitals</Text>
        <Text style={styles.linkArrow}>→</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.linkRow}
        onPress={() => navigation.navigate('Export')}
      >
        <Text style={styles.linkText}>Export All Data as PDF</Text>
        <Text style={styles.linkArrow}>→</Text>
      </TouchableOpacity>

      <Text style={[styles.sectionTitle, { marginTop: spacing.space6 }]}>About</Text>
      <View style={styles.aboutCard}>
        <Text style={styles.aboutText}>PulseSense v1.0.0</Text>
        <Text style={styles.aboutPrivacy}>
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
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Emergency Number</Text>
            <TextInput
              style={styles.modalInput}
              value={emergencyEditValue}
              onChangeText={setEmergencyEditValue}
              placeholder="Enter emergency number"
              placeholderTextColor={colors.textDisabled}
              keyboardType="phone-pad"
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setEmergencyModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={async () => {
                  if (emergencyEditValue.trim()) {
                    try {
                      const db = await getDB();
                      await setSetting(db, 'emergency_number', emergencyEditValue.trim());
                      settings.setEmergencyNumber(emergencyEditValue.trim());
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
});
