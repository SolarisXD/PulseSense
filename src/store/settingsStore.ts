// PulseSense — Settings Store (Zustand)

import { create } from 'zustand';

export type FontScale = 'extra-small' | 'small' | 'normal' | 'large' | 'extra-large';

export const FONT_SCALE_MULTIPLIERS: Record<FontScale, number> = {
  'extra-small': 0.7,
  small: 0.85,
  normal: 1,
  large: 1.15,
  'extra-large': 1.3,
};

interface SettingsState {
  tempUnit: 'C' | 'F';
  weightUnit: 'kg' | 'lbs';
  glucoseUnit: 'mg/dL' | 'mmol/L';
  heightUnit: 'cm' | 'ft_in';
  bpDefaultPosition: 'sitting' | 'standing' | 'lying';
  emergencyNumber: string;
  onboardingComplete: boolean;
  medicationReminders: boolean;
  reminderMorningTime: string;
  reminderAfternoonTime: string;
  reminderNightTime: string;
  fontScale: FontScale;
  isLoading: boolean;

  setTempUnit: (unit: 'C' | 'F') => void;
  setWeightUnit: (unit: 'kg' | 'lbs') => void;
  setGlucoseUnit: (unit: 'mg/dL' | 'mmol/L') => void;
  setHeightUnit: (unit: 'cm' | 'ft_in') => void;
  setBpDefaultPosition: (pos: 'sitting' | 'standing' | 'lying') => void;
  setEmergencyNumber: (num: string) => void;
  setOnboardingComplete: (val: boolean) => void;
  setMedicationReminders: (val: boolean) => void;
  setReminderMorningTime: (val: string) => void;
  setReminderAfternoonTime: (val: string) => void;
  setReminderNightTime: (val: string) => void;
  setFontScale: (val: FontScale) => void;
  setLoading: (loading: boolean) => void;
  hydrate: (settings: Record<string, string>) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  tempUnit: 'C',
  weightUnit: 'kg',
  glucoseUnit: 'mg/dL',
  heightUnit: 'cm',
  bpDefaultPosition: 'sitting',
  emergencyNumber: '112',
  onboardingComplete: false,
  medicationReminders: false,
  reminderMorningTime: '08:00',
  reminderAfternoonTime: '14:00',
  reminderNightTime: '21:00',
  fontScale: 'normal',
  isLoading: true,

  setTempUnit: (tempUnit) => set({ tempUnit }),
  setWeightUnit: (weightUnit) => set({ weightUnit }),
  setGlucoseUnit: (glucoseUnit) => set({ glucoseUnit }),
  setHeightUnit: (heightUnit) => set({ heightUnit }),
  setBpDefaultPosition: (bpDefaultPosition) => set({ bpDefaultPosition }),
  setEmergencyNumber: (emergencyNumber) => set({ emergencyNumber }),
  setOnboardingComplete: (onboardingComplete) => set({ onboardingComplete }),
  setMedicationReminders: (medicationReminders) => set({ medicationReminders }),
  setReminderMorningTime: (reminderMorningTime) => set({ reminderMorningTime }),
  setReminderAfternoonTime: (reminderAfternoonTime) => set({ reminderAfternoonTime }),
  setReminderNightTime: (reminderNightTime) => set({ reminderNightTime }),
  setFontScale: (fontScale) => set({ fontScale }),
  setLoading: (isLoading) => set({ isLoading }),

  hydrate: (settings) =>
    set({
      tempUnit: ['C', 'F'].includes(settings.temp_unit) ? (settings.temp_unit as 'C' | 'F') : 'C',
      weightUnit: ['kg', 'lbs'].includes(settings.weight_unit) ? (settings.weight_unit as 'kg' | 'lbs') : 'kg',
      glucoseUnit: ['mg/dL', 'mmol/L'].includes(settings.glucose_unit) ? (settings.glucose_unit as 'mg/dL' | 'mmol/L') : 'mg/dL',
      heightUnit: ['cm', 'ft_in'].includes(settings.height_unit) ? (settings.height_unit as 'cm' | 'ft_in') : 'cm',
      bpDefaultPosition: ['sitting', 'standing', 'lying'].includes(settings.bp_default_position) ? (settings.bp_default_position as 'sitting' | 'standing' | 'lying') : 'sitting',
      emergencyNumber: settings.emergency_number || '112',
      onboardingComplete: settings.onboarding_complete === 'true',
      medicationReminders: settings.medication_reminders === 'true',
      reminderMorningTime: settings.reminder_morning || '08:00',
      reminderAfternoonTime: settings.reminder_afternoon || '14:00',
      reminderNightTime: settings.reminder_night || '21:00',
      fontScale: (['extra-small', 'small', 'normal', 'large', 'extra-large'] as FontScale[]).includes(settings.font_scale as FontScale) ? (settings.font_scale as FontScale) : 'normal',
      isLoading: false,
    }),
}));
