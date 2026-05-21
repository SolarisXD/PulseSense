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

export async function getMedications(db: SQLiteDatabase): Promise<(MedicationRow & { items: MedicationItemRow[] })[]> {
  const meds = await db.getAllAsync<MedicationRow>(
    'SELECT * FROM medications ORDER BY created_at DESC'
  );
  const result: (MedicationRow & { items: MedicationItemRow[] })[] = [];
  for (const med of meds) {
    const items = await db.getAllAsync<MedicationItemRow>(
      'SELECT * FROM medication_items WHERE medication_id = ? ORDER BY sort_order ASC, id ASC',
      [med.id]
    );
    result.push({ ...med, items });
  }
  return result;
}

export async function getActiveMedications(db: SQLiteDatabase): Promise<(MedicationRow & { items: MedicationItemRow[] })[]> {
  const meds = await db.getAllAsync<MedicationRow>(
    'SELECT * FROM medications WHERE is_active = 1 ORDER BY created_at DESC'
  );
  const result: (MedicationRow & { items: MedicationItemRow[] })[] = [];
  for (const med of meds) {
    const items = await db.getAllAsync<MedicationItemRow>(
      'SELECT * FROM medication_items WHERE medication_id = ? ORDER BY sort_order ASC, id ASC',
      [med.id]
    );
    result.push({ ...med, items });
  }
  return result;
}

export async function insertMedication(
  db: SQLiteDatabase,
  data: MedicationInput,
  items: MedicationItemInput[]
): Promise<number> {
  const medResult = await db.runAsync(
    `INSERT INTO medications (prescription_date, prescribing_doctor, diagnosis_notes)
     VALUES (?, ?, ?)`,
    [data.prescription_date, data.prescribing_doctor ?? null, data.diagnosis_notes ?? null]
  );
  const medicationId = medResult.lastInsertRowId;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    await db.runAsync(
      `INSERT INTO medication_items (medication_id, medicine_name, dose_morning, dose_afternoon, dose_night, timing, timing_custom, duration, strength, notes, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        medicationId,
        item.medicine_name,
        item.dose_morning ?? 0,
        item.dose_afternoon ?? 0,
        item.dose_night ?? 0,
        item.timing ?? null,
        item.timing_custom ?? null,
        item.duration ?? null,
        item.strength ?? null,
        item.notes ?? null,
        i,
      ]
    );
  }

  return medicationId;
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

export async function deleteMedication(db: SQLiteDatabase, id: number): Promise<void> {
  // CASCADE will delete medication_items
  await db.runAsync('DELETE FROM medications WHERE id = ?', [id]);
}
