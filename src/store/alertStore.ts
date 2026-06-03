// PulseSense — Alert Store (Zustand)

import { create } from 'zustand';
import type { AlertRow } from '../db/queries/emergency';
import type { RuleResult } from '../constants/rules';

interface AlertState {
  activeAlerts: AlertRow[];
  lastEmergencyResult: RuleResult[] | null;
  lastEmergencyEventId: number | null;

  setActiveAlerts: (alerts: AlertRow[]) => void;
  addAlert: (alert: AlertRow) => void;
  removeAlert: (id: number) => void;
  setLastEmergencyResult: (result: RuleResult[] | null) => void;
  setLastEmergencyEventId: (id: number | null) => void;
  clear: () => void;
}

export const useAlertStore = create<AlertState>((set) => ({
  activeAlerts: [],
  lastEmergencyResult: null,
  lastEmergencyEventId: null,

  setActiveAlerts: (activeAlerts) => set({ activeAlerts }),
  addAlert: (alert) =>
    set((state) => ({ activeAlerts: [alert, ...state.activeAlerts].slice(0, 100) })),
  removeAlert: (id) =>
    set((state) => ({
      activeAlerts: state.activeAlerts.filter((a) => a.id !== id),
    })),
  setLastEmergencyResult: (lastEmergencyResult) => set({ lastEmergencyResult }),
  setLastEmergencyEventId: (lastEmergencyEventId) => set({ lastEmergencyEventId }),
  clear: () =>
    set({
      activeAlerts: [],
      lastEmergencyResult: null,
      lastEmergencyEventId: null,
    }),
}));
