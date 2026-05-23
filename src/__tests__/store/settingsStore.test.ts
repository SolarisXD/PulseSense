import { useSettingsStore } from '../../store/settingsStore';

beforeEach(() => {
  useSettingsStore.setState({
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
    isLoading: true,
  });
});

describe('settingsStore', () => {
  it('has default values', () => {
    const state = useSettingsStore.getState();
    expect(state.tempUnit).toBe('C');
    expect(state.emergencyNumber).toBe('112');
    expect(state.onboardingComplete).toBe(false);
  });

  it.each([
    ['setTempUnit', 'F' as const],
    ['setWeightUnit', 'lbs' as const],
    ['setGlucoseUnit', 'mmol/L' as const],
    ['setHeightUnit', 'ft_in' as const],
    ['setBpDefaultPosition', 'standing' as const],
    ['setOnboardingComplete', true as const],
    ['setMedicationReminders', true as const],
  ])('%s updates setting', (setter, value) => {
    const store = useSettingsStore.getState() as any;
    store[setter](value);
    const key = setter.replace('set', '').charAt(0).toLowerCase() + setter.replace('set', '').slice(1);
    expect((useSettingsStore.getState() as any)[key]).toBe(value);
  });

  it('setEmergencyNumber updates number', () => {
    useSettingsStore.getState().setEmergencyNumber('999');
    expect(useSettingsStore.getState().emergencyNumber).toBe('999');
  });

  it('setLoading updates loading state', () => {
    useSettingsStore.getState().setLoading(false);
    expect(useSettingsStore.getState().isLoading).toBe(false);
  });

  describe('hydrate', () => {
    it('hydrates from key-value settings object', () => {
      useSettingsStore.getState().hydrate({
        temp_unit: 'F',
        weight_unit: 'lbs',
        glucose_unit: 'mmol/L',
        height_unit: 'ft_in',
        bp_default_position: 'lying',
        emergency_number: '999',
        onboarding_complete: 'true',
        medication_reminders: 'true',
        reminder_morning: '07:00',
        reminder_afternoon: '13:00',
        reminder_night: '22:00',
      });
      const s = useSettingsStore.getState();
      expect(s.tempUnit).toBe('F');
      expect(s.weightUnit).toBe('lbs');
      expect(s.glucoseUnit).toBe('mmol/L');
      expect(s.onboardingComplete).toBe(true);
      expect(s.medicationReminders).toBe(true);
      expect(s.emergencyNumber).toBe('999');
      expect(s.isLoading).toBe(false);
    });

    it('falls back to defaults for missing keys', () => {
      useSettingsStore.getState().hydrate({});
      const s = useSettingsStore.getState();
      expect(s.tempUnit).toBe('C');
      expect(s.emergencyNumber).toBe('112');
      expect(s.isLoading).toBe(false);
    });
  });
});
