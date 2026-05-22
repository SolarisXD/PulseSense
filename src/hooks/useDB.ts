// PulseSense — Database Hook
// Opens SQLite DB, runs migrations, seeds settings, and hydrates stores

import { useEffect, useState, useCallback } from 'react';
import * as SQLite from 'expo-sqlite';
import { runMigrations } from '../db/migrations';
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

let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function getDB(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) return dbInstance;
  dbInstance = await SQLite.openDatabaseAsync('pulsesense.db');
  return dbInstance;
}

export async function initializeDatabase(): Promise<SQLite.SQLiteDatabase> {
  const db = await getDB();
  await runMigrations(db);
  return db;
}

export async function loadStores(db: SQLite.SQLiteDatabase): Promise<void> {
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

  return { isReady, isLoading: profileLoading, error, db: dbInstance };
}

export async function checkOnboardingStatus(db: SQLite.SQLiteDatabase): Promise<boolean> {
  const profile = await hasProfile(db);
  const { onboardingComplete } = useSettingsStore.getState();
  return profile && onboardingComplete;
}
