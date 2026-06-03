// PulseSense — Profile Store (Zustand)

import { create } from 'zustand';
import type { ProfileRow } from '../db/queries/profile';
import type { EmergencyContactRow } from '../db/queries/contacts';
import type { ConditionRow } from '../db/queries/conditions';
import type { AllergyRow } from '../db/queries/allergies';

interface ProfileState {
  profile: ProfileRow | null;
  contacts: EmergencyContactRow[];
  conditions: ConditionRow[];
  allergies: AllergyRow[];
  isLoading: boolean;

  // Actions
  setProfile: (profile: ProfileRow | null) => void;
  setContacts: (contacts: EmergencyContactRow[]) => void;
  setConditions: (conditions: ConditionRow[]) => void;
  setAllergies: (allergies: AllergyRow[]) => void;
  setLoading: (loading: boolean) => void;
  clear: () => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  contacts: [],
  conditions: [],
  allergies: [],
  isLoading: true,

  setProfile: (profile) => set({ profile }),
  setContacts: (contacts) => set({ contacts }),
  setConditions: (conditions) => set({ conditions }),
  setAllergies: (allergies) => set({ allergies }),
  setLoading: (isLoading) => set({ isLoading }),
  clear: () =>
    set({
      profile: null,
      contacts: [],
      conditions: [],
      allergies: [],
    }),
}));
