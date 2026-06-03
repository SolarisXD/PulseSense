// PulseSense — Medications Queries

import type { SQLiteDatabase } from 'expo-sqlite';

export interface MedicationRow {
  id: number;
  prescription_date: string;
  prescribing_doctor: string | null;
  diagnosis_notes: string | null;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface MedicationItemRow {
  id: number;
  medication_id: number;
  medicine_name: string;
  dose_morning: number;
  dose_afternoon: number;
  dose_night: number;
  timing: string | null;
  timing_custom: string | null;
  duration: string | null;
  strength: string | null;
  notes: string | null;
  sort_order: number;
  created_at: string;
}

export interface MedicationInput {
  prescription_date: string;
  prescribing_doctor?: string | null;
  diagnosis_notes?: string | null;
}

export interface MedicationItemInput {
  medicine_name: string;
  dose_morning?: number;
  dose_afternoon?: number;
  dose_night?: number;
  timing?: string | null;
  timing_custom?: string | null;
  duration?: string | null;
  strength?: string | null;
  notes?: string | null;
}

async function getMedicationsWithItems(
  db: SQLiteDatabase,
  whereClause: string,
  params: any[] = []
): Promise<(MedicationRow & { items: MedicationItemRow[] })[]> {
  const meds = await db.getAllAsync<MedicationRow>(
    `SELECT * FROM medications ${whereClause} ORDER BY created_at DESC`,
    params
  );
  if (meds.length === 0) return [];

  const ids = meds.map((m) => m.id);
  const placeholders = ids.map(() => '?').join(',');
  const items = await db.getAllAsync<MedicationItemRow>(
    `SELECT * FROM medication_items WHERE medication_id IN (${placeholders}) ORDER BY sort_order ASC, id ASC`,
    ids
  );

  const itemsByMedId: Record<number, MedicationItemRow[]> = {};
  for (const item of items) {
    if (!itemsByMedId[item.medication_id]) itemsByMedId[item.medication_id] = [];
    itemsByMedId[item.medication_id].push(item);
  }

  return meds.map((med) => ({
    ...med,
    items: itemsByMedId[med.id] || [],
  }));
}

export async function getMedications(db: SQLiteDatabase): Promise<(MedicationRow & { items: MedicationItemRow[] })[]> {
  return getMedicationsWithItems(db, '');
}

export async function getActiveMedications(db: SQLiteDatabase): Promise<(MedicationRow & { items: MedicationItemRow[] })[]> {
  return getMedicationsWithItems(db, 'WHERE is_active = 1');
}

export async function insertMedication(
  db: SQLiteDatabase,
  data: MedicationInput,
  items: MedicationItemInput[]
): Promise<number> {
  await db.runAsync('BEGIN TRANSACTION');
  try {
    const medResult = await db.runAsync(
      `INSERT INTO medications (prescription_date, prescribing_doctor, diagnosis_notes)
       VALUES (?, ?, ?)`,
      [data.prescription_date, data.prescribing_doctor ?? null, data.diagnosis_notes ?? null]
    );
    const medicationId = medResult.lastInsertRowId;

    if (items.length > 0) {
      const placeholders = items.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').join(',');
      const values: any[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        values.push(
          medicationId, item.medicine_name, item.dose_morning ?? 0, item.dose_afternoon ?? 0,
          item.dose_night ?? 0, item.timing ?? null, item.timing_custom ?? null,
          item.duration ?? null, item.strength ?? null, item.notes ?? null, i
        );
      }
      await db.runAsync(
        `INSERT INTO medication_items (medication_id, medicine_name, dose_morning, dose_afternoon, dose_night, timing, timing_custom, duration, strength, notes, sort_order) VALUES ${placeholders}`,
        values
      );
    }

    await db.runAsync('COMMIT');
    return medResult.lastInsertRowId;
  } catch (e) {
    await db.runAsync('ROLLBACK');
    throw e;
  }
}

export async function updateMedication(
  db: SQLiteDatabase,
  id: number,
  data: MedicationInput
): Promise<void> {
  await db.runAsync(
    `UPDATE medications SET prescription_date = ?, prescribing_doctor = ?, diagnosis_notes = ?,
     updated_at = datetime('now') WHERE id = ?`,
    [data.prescription_date, data.prescribing_doctor ?? null, data.diagnosis_notes ?? null, id]
  );
}

export async function toggleMedicationActive(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync(
    `UPDATE medications SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END,
     updated_at = datetime('now') WHERE id = ?`,
    [id]
  );
}

export async function updateMedicationItems(
  db: SQLiteDatabase,
  medicationId: number,
  items: MedicationItemInput[]
): Promise<void> {
  await db.runAsync('BEGIN TRANSACTION');
  try {
    await db.runAsync('DELETE FROM medication_items WHERE medication_id = ?', [medicationId]);

    if (items.length > 0) {
      const placeholders = items.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').join(',');
      const values: any[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        values.push(
          medicationId, item.medicine_name, item.dose_morning ?? 0, item.dose_afternoon ?? 0,
          item.dose_night ?? 0, item.timing ?? null, item.timing_custom ?? null,
          item.duration ?? null, item.strength ?? null, item.notes ?? null, i
        );
      }
      await db.runAsync(
        `INSERT INTO medication_items (medication_id, medicine_name, dose_morning, dose_afternoon, dose_night, timing, timing_custom, duration, strength, notes, sort_order) VALUES ${placeholders}`,
        values
      );
    }

    await db.runAsync('COMMIT');
  } catch (e) {
    await db.runAsync('ROLLBACK');
    throw e;
  }
}

export async function deleteMedication(db: SQLiteDatabase, id: number): Promise<void> {
  // CASCADE will delete medication_items
  await db.runAsync('DELETE FROM medications WHERE id = ?', [id]);
}
