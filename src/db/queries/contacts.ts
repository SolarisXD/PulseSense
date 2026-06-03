// PulseSense — Emergency Contacts Queries

import type { SQLiteDatabase } from 'expo-sqlite';

export interface EmergencyContactRow {
  id: number;
  name: string;
  relationship: string | null;
  phone: string;
  contact_type: 'doctor' | 'emergency';
  is_primary: number;
  sort_order: number;
  created_at: string;
}

export interface EmergencyContactInput {
  name: string;
  relationship?: string | null;
  phone: string;
  contact_type?: 'doctor' | 'emergency';
  is_primary?: number;
  sort_order?: number;
}

export async function getContacts(db: SQLiteDatabase): Promise<EmergencyContactRow[]> {
  const rows = await db.getAllAsync<EmergencyContactRow>(
    'SELECT * FROM emergency_contacts ORDER BY sort_order ASC, id ASC'
  );
  return rows;
}

// @unused
export async function getPrimaryContact(db: SQLiteDatabase): Promise<EmergencyContactRow | null> {
  const row = await db.getFirstAsync<EmergencyContactRow>(
    'SELECT * FROM emergency_contacts WHERE is_primary = 1 LIMIT 1'
  );
  return row || null;
}

export async function insertContact(db: SQLiteDatabase, data: EmergencyContactInput): Promise<number> {
  const result = await db.runAsync(
    `INSERT INTO emergency_contacts (name, relationship, phone, contact_type, is_primary, sort_order)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      data.name,
      data.relationship ?? null,
      data.phone,
      data.contact_type ?? 'emergency',
      data.is_primary ?? 0,
      data.sort_order ?? 0,
    ]
  );
  return result.lastInsertRowId;
}

// @unused
export async function updateContact(db: SQLiteDatabase, id: number, data: EmergencyContactInput): Promise<void> {
  await db.runAsync(
    `UPDATE emergency_contacts SET name = ?, relationship = ?, phone = ?, contact_type = ?, is_primary = ?, sort_order = ?
     WHERE id = ?`,
    [data.name, data.relationship ?? null, data.phone, data.contact_type ?? 'emergency', data.is_primary ?? 0, data.sort_order ?? 0, id]
  );
}

export async function deleteContact(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('DELETE FROM emergency_contacts WHERE id = ?', [id]);
}

// @unused
export async function setPrimaryContact(db: SQLiteDatabase, id: number): Promise<void> {
  await db.execAsync('BEGIN');
  try {
    await db.runAsync('UPDATE emergency_contacts SET is_primary = 0');
    await db.runAsync('UPDATE emergency_contacts SET is_primary = 1 WHERE id = ?', [id]);
    await db.execAsync('COMMIT');
  } catch (e) {
    await db.execAsync('ROLLBACK');
    throw e;
  }
}
