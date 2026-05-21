// PulseSense — Settings Queries

import type { SQLiteDatabase } from 'expo-sqlite';

export interface SettingRow {
  key: string;
  value: string;
  updated_at: string;
}

export async function getSetting(db: SQLiteDatabase, key: string): Promise<string | null> {
  const row = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM settings WHERE key = ?',
    [key]
  );
  return row?.value ?? null;
}

export async function setSetting(db: SQLiteDatabase, key: string, value: string): Promise<void> {
  await db.runAsync(
    `INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, datetime('now'))`,
    [key, value]
  );
}

export async function getAllSettings(db: SQLiteDatabase): Promise<SettingRow[]> {
  const rows = await db.getAllAsync<SettingRow>('SELECT * FROM settings');
  return rows;
}

export async function getMultipleSettings(
  db: SQLiteDatabase,
  keys: string[]
): Promise<Record<string, string>> {
  const placeholders = keys.map(() => '?').join(',');
  const rows = await db.getAllAsync<{ key: string; value: string }>(
    `SELECT key, value FROM settings WHERE key IN (${placeholders})`,
    keys
  );
  const result: Record<string, string> = {};
  for (const row of rows) {
    result[row.key] = row.value;
  }
  // Fill defaults for any missing
  for (const key of keys) {
    if (!result[key]) result[key] = '';
  }
  return result;
}

export async function isOnboardingComplete(db: SQLiteDatabase): Promise<boolean> {
  const value = await getSetting(db, 'onboarding_complete');
  return value === 'true';
}

export async function setOnboardingComplete(db: SQLiteDatabase): Promise<void> {
  await setSetting(db, 'onboarding_complete', 'true');
}
