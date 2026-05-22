// PulseSense — Database Hook
// Opens SQLite DB, runs migrations, seeds settings, and hydrates stores

import { useEffect, useState, useCallback } from 'react';
import type { SQLiteDatabase } from 'expo-sqlite';
import { getDB, initializeDatabase, getDBInstance } from '../db/database';
import { getProfile, hasProfile } from '../db/queries/profile';
import { getContacts } from '../db/queries/contacts';
import { getConditions } from '../db/queries/conditions';
import { getAllergies } from '../db/queries/allergies';
import { getAllSettings } from '../db/queries/settings';
import { getActiveAlerts } from '../db/queries/emergency';
import { useProfileStore } from '../store/profileStore';
import { useSettingsStore } from '../store/settingsStore';
import { useThemeStore } from '../store/themeStore';
import { useAlertStore } from '../store/alertStore';

export { getDB, initializeDatabase };

export async function loadStores(db: SQLiteDatabase): Promise<void> {
  const [profile, contacts, conditions, allergies, settings, alerts] = await Promise.all([
    getProfile(db),
    getContacts(db),
    getConditions(db),
    getAllergies(db),
    getAllSettings(db),
    getActiveAlerts(db),
  ]);

  useProfileStore.getState().setProfile(profile);
  useProfileStore.getState().setContacts(contacts);
  useProfileStore.getState().setConditions(conditions);
  useProfileStore.getState().setAllergies(allergies);

  // Convert settings array to record
  const settingsRecord: Record<string, string> = {};
  for (const s of settings) {
    settingsRecord[s.key] = s.value;
  }
  useSettingsStore.getState().hydrate(settingsRecord);
  useThemeStore.getState().hydrate(settingsRecord.dark_mode || 'false');
  useAlertStore.getState().setActiveAlerts(alerts);
}

export function useDB() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const profileLoading = useProfileStore((s) => s.isLoading);
  const setProfileLoading = useProfileStore((s) => s.setLoading);

  const init = useCallback(async () => {
    try {
      const db = await initializeDatabase();
      await loadStores(db);
      setProfileLoading(false);
      setIsReady(true);
    } catch (err) {
      console.error('[useDB] Init error:', err);
      setError(err instanceof Error ? err.message : 'Database initialization failed');
      setProfileLoading(false);
    }
  }, [setProfileLoading]);

  useEffect(() => {
    init();
  }, [init]);

  return { isReady, isLoading: profileLoading, error, db: getDBInstance() };
}

export async function checkOnboardingStatus(db: SQLiteDatabase): Promise<boolean> {
  const profile = await hasProfile(db);
  const { onboardingComplete } = useSettingsStore.getState();
  return profile && onboardingComplete;
}
