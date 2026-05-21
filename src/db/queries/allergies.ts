// PulseSense — Allergies Queries

import type { SQLiteDatabase } from 'expo-sqlite';

export interface AllergyRow {
  id: number;
  name: string;
  category: string | null;
  reaction: string | null;
  severity: string | null;
  is_active: number;
  created_at: string;
}

export interface AllergyInput {
  name: string;
  category?: string | null;
  reaction?: string | null;
  severity?: string | null;
}

export async function getAllergies(db: SQLiteDatabase): Promise<AllergyRow[]> {
  const rows = await db.getAllAsync<AllergyRow>(
    'SELECT * FROM allergies WHERE is_active = 1 ORDER BY id ASC'
  );
  return rows;
}

export async function insertAllergy(db: SQLiteDatabase, data: AllergyInput): Promise<number> {
  const result = await db.runAsync(
    `INSERT INTO allergies (name, category, reaction, severity)
     VALUES (?, ?, ?, ?)`,
    [data.name, data.category ?? null, data.reaction ?? null, data.severity ?? null]
  );
  return result.lastInsertRowId;
}

export async function updateAllergy(db: SQLiteDatabase, id: number, data: AllergyInput): Promise<void> {
  await db.runAsync(
    `UPDATE allergies SET name = ?, category = ?, reaction = ?, severity = ? WHERE id = ?`,
    [data.name, data.category ?? null, data.reaction ?? null, data.severity ?? null, id]
  );
}

export async function deleteAllergy(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('DELETE FROM allergies WHERE id = ?', [id]);
}
