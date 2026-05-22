// PulseSense — Default Settings Seeds

export interface SeedSetting {
  key: string;
  value: string;
}

export const SEED_SETTINGS: SeedSetting[] = [
  { key: 'temp_unit', value: 'C' },
  { key: 'weight_unit', value: 'kg' },
  { key: 'glucose_unit', value: 'mg/dL' },
  { key: 'height_unit', value: 'cm' },
  { key: 'bp_default_position', value: 'sitting' },
  { key: 'onboarding_complete', value: 'false' },
  { key: 'emergency_number', value: '112' },
  { key: 'dark_mode', value: 'false' },
  { key: 'medication_reminders', value: 'false' },
  { key: 'reminder_morning', value: '08:00' },
  { key: 'reminder_afternoon', value: '14:00' },
  { key: 'reminder_night', value: '21:00' },
];
