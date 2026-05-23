// PulseSense — Conditions Queries

import type { SQLiteDatabase } from 'expo-sqlite';

export interface ConditionRow {
  id: number;
  name: string;
  type: string | null;
  diagnosed_date: string | null;
  severity: string | null;
  notes: string | null;
  is_active: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ConditionInput {
  name: string;
  type?: string | null;
  diagnosed_date?: string | null;
  severity?: string | null;
  notes?: string | null;
  is_active?: number;
}

export async function getConditions(db: SQLiteDatabase): Promise<ConditionRow[]> {
  const rows = await db.getAllAsync<ConditionRow>(
    'SELECT * FROM conditions WHERE is_active = 1 ORDER BY sort_order ASC, id ASC'
  );
  return rows;
}

export async function getAllConditions(db: SQLiteDatabase): Promise<ConditionRow[]> {
  const rows = await db.getAllAsync<ConditionRow>(
    'SELECT * FROM conditions ORDER BY sort_order ASC, id ASC'
  );
  return rows;
}

export async function insertCondition(db: SQLiteDatabase, data: ConditionInput): Promise<number> {
  const result = await db.runAsync(
    `INSERT INTO conditions (name, type, diagnosed_date, severity, notes, is_active, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      data.name,
      data.type ?? null,
      data.diagnosed_date ?? null,
      data.severity ?? null,
      data.notes ?? null,
      data.is_active ?? 1,
      0,
    ]
  );
  return result.lastInsertRowId;
}

export async function updateCondition(db: SQLiteDatabase, id: number, data: ConditionInput): Promise<void> {
  await db.runAsync(
    `UPDATE conditions SET name = ?, type = ?, diagnosed_date = ?, severity = ?, notes = ?,
     is_active = ?, updated_at = datetime('now') WHERE id = ?`,
    [data.name, data.type ?? null, data.diagnosed_date ?? null, data.severity ?? null, data.notes ?? null, data.is_active ?? 1, id]
  );
}

export async function archiveCondition(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync(
    `UPDATE conditions SET is_active = 0, updated_at = datetime('now') WHERE id = ?`,
    [id]
  );
}

export async function getConditionById(db: SQLiteDatabase, id: number): Promise<ConditionRow | null> {
  const row = await db.getFirstAsync<ConditionRow>('SELECT * FROM conditions WHERE id = ?', [id]);
  return row || null;
}

export async function deleteCondition(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('DELETE FROM conditions WHERE id = ?', [id]);
}
