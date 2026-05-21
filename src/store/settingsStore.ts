// PulseSense — Settings Store (Zustand)

import { create } from 'zustand';

interface SettingsState {
  tempUnit: 'C' | 'F';
  weightUnit: 'kg' | 'lbs';
  glucoseUnit: 'mg/dL' | 'mmol/L';
  heightUnit: 'cm' | 'ft_in';
  bpDefaultPosition: 'sitting' | 'standing' | 'lying';
  emergencyNumber: string;
  onboardingComplete: boolean;
  isLoading: boolean;

  setTempUnit: (unit: 'C' | 'F') => void;
  setWeightUnit: (unit: 'kg' | 'lbs') => void;
  setGlucoseUnit: (unit: 'mg/dL' | 'mmol/L') => void;
  setHeightUnit: (unit: 'cm' | 'ft_in') => void;
  setBpDefaultPosition: (pos: 'sitting' | 'standing' | 'lying') => void;
  setEmergencyNumber: (num: string) => void;
  setOnboardingComplete: (val: boolean) => void;
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
  isLoading: true,

  setTempUnit: (tempUnit) => set({ tempUnit }),
  setWeightUnit: (weightUnit) => set({ weightUnit }),
  setGlucoseUnit: (glucoseUnit) => set({ glucoseUnit }),
  setHeightUnit: (heightUnit) => set({ heightUnit }),
  setBpDefaultPosition: (bpDefaultPosition) => set({ bpDefaultPosition }),
  setEmergencyNumber: (emergencyNumber) => set({ emergencyNumber }),
  setOnboardingComplete: (onboardingComplete) => set({ onboardingComplete }),
  setLoading: (isLoading) => set({ isLoading }),

  hydrate: (settings) =>
    set({
      tempUnit: (settings.temp_unit as 'C' | 'F') || 'C',
      weightUnit: (settings.weight_unit as 'kg' | 'lbs') || 'kg',
      glucoseUnit: (settings.glucose_unit as 'mg/dL' | 'mmol/L') || 'mg/dL',
      heightUnit: (settings.height_unit as 'cm' | 'ft_in') || 'cm',
      bpDefaultPosition: (settings.bp_default_position as 'sitting' | 'standing' | 'lying') || 'sitting',
      emergencyNumber: settings.emergency_number || '112',
      onboardingComplete: settings.onboarding_complete === 'true',
      isLoading: false,
    }),
}));
