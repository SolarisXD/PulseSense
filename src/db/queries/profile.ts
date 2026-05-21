// PulseSense — Profile Queries

import type { SQLiteDatabase } from 'expo-sqlite';

export interface ProfileRow {
  id: number;
  full_name: string;
  dob: string;
  sex: string;
  sex_other_text: string | null;
  blood_group: string | null;
  height_value: number | null;
  height_unit: string;
  height_ft: number | null;
  height_in: number | null;
  photo_uri: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileInput {
  full_name: string;
  dob: string;
  sex: string;
  sex_other_text?: string | null;
  blood_group?: string | null;
  height_value?: number | null;
  height_unit?: string;
  height_ft?: number | null;
  height_in?: number | null;
  photo_uri?: string | null;
}

export async function getProfile(db: SQLiteDatabase): Promise<ProfileRow | null> {
  const row = await db.getFirstAsync<ProfileRow>('SELECT * FROM profile LIMIT 1');
  return row || null;
}

export async function hasProfile(db: SQLiteDatabase): Promise<boolean> {
  const row = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM profile');
  return (row?.count ?? 0) > 0;
}

export async function insertProfile(db: SQLiteDatabase, data: ProfileInput): Promise<number> {
  const result = await db.runAsync(
    `INSERT INTO profile (full_name, dob, sex, sex_other_text, blood_group, height_value, height_unit, height_ft, height_in, photo_uri)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.full_name,
      data.dob,
      data.sex,
      data.sex_other_text ?? null,
      data.blood_group ?? null,
      data.height_value ?? null,
      data.height_unit ?? 'cm',
      data.height_ft ?? null,
      data.height_in ?? null,
      data.photo_uri ?? null,
    ]
  );
  return result.lastInsertRowId;
}

export async function updateProfile(db: SQLiteDatabase, data: ProfileInput): Promise<void> {
  await db.runAsync(
    `UPDATE profile SET
      full_name = ?, dob = ?, sex = ?, sex_other_text = ?, blood_group = ?,
      height_value = ?, height_unit = ?, height_ft = ?, height_in = ?, photo_uri = ?,
      updated_at = datetime('now')
     WHERE id = 1`,
    [
      data.full_name,
      data.dob,
      data.sex,
      data.sex_other_text ?? null,
      data.blood_group ?? null,
      data.height_value ?? null,
      data.height_unit ?? 'cm',
      data.height_ft ?? null,
      data.height_in ?? null,
      data.photo_uri ?? null,
    ]
  );
}

export async function updateProfilePhoto(db: SQLiteDatabase, uri: string): Promise<void> {
  await db.runAsync(
    `UPDATE profile SET photo_uri = ?, updated_at = datetime('now') WHERE id = 1`,
    [uri]
  );
}
