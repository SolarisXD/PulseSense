// PulseSense — Vitals Logging Queries

import type { SQLiteDatabase } from 'expo-sqlite';

export interface VitalLogRow {
  id: number;
  logged_at_display: string;
  logged_at_iso: string;
  created_at: string;
  bp_sys: number | null;
  bp_dia: number | null;
  bp_position: string | null;
  pulse: number | null;
  spo2: number | null;
  glucose_value: number | null;
  glucose_unit: string;
  glucose_context: string | null;
  temp_value: number | null;
  temp_unit: string;
  weight_value: number | null;
  weight_unit: string;
  pain_level: number | null;
  pain_location: string | null;
  pain_notes: string | null;
  notes: string | null;
  is_deleted: number;
}

export interface VitalLogInput {
  logged_at_display: string;
  logged_at_iso: string;
  bp_sys?: number | null;
  bp_dia?: number | null;
  bp_position?: string | null;
  pulse?: number | null;
  spo2?: number | null;
  glucose_value?: number | null;
  glucose_unit?: string;
  glucose_context?: string | null;
  temp_value?: number | null;
  temp_unit?: string;
  weight_value?: number | null;
  weight_unit?: string;
  pain_level?: number | null;
  pain_location?: string | null;
  pain_notes?: string | null;
  notes?: string | null;
}

export async function insertVitalLog(db: SQLiteDatabase, data: VitalLogInput): Promise<number> {
  const result = await db.runAsync(
    `INSERT INTO vital_logs (
      logged_at_display, logged_at_iso,
      bp_sys, bp_dia, bp_position,
      pulse, spo2,
      glucose_value, glucose_unit, glucose_context,
      temp_value, temp_unit,
      weight_value, weight_unit,
      pain_level, pain_location, pain_notes,
      notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.logged_at_display, data.logged_at_iso,
      data.bp_sys ?? null, data.bp_dia ?? null, data.bp_position ?? null,
      data.pulse ?? null, data.spo2 ?? null,
      data.glucose_value ?? null, data.glucose_unit ?? 'mg/dL', data.glucose_context ?? null,
      data.temp_value ?? null, data.temp_unit ?? 'C',
      data.weight_value ?? null, data.weight_unit ?? 'kg',
      data.pain_level ?? null, data.pain_location ?? null, data.pain_notes ?? null,
      data.notes ?? null,
    ]
  );
  return result.lastInsertRowId;
}

export async function getLatestVitalLogs(db: SQLiteDatabase): Promise<VitalLogRow[]> {
  const rows = await db.getAllAsync<VitalLogRow>(
    `SELECT * FROM vital_logs WHERE is_deleted = 0
     ORDER BY logged_at_iso DESC LIMIT 50`
  );
  return rows;
}

export async function getVitalLogsByDateRange(
  db: SQLiteDatabase,
  startIso: string,
  endIso: string
): Promise<VitalLogRow[]> {
  const rows = await db.getAllAsync<VitalLogRow>(
    `SELECT * FROM vital_logs WHERE is_deleted = 0
     AND logged_at_iso >= ? AND logged_at_iso <= ?
     ORDER BY logged_at_iso DESC`,
    [startIso, endIso]
  );
  return rows;
}

export async function getLatestPerVital(db: SQLiteDatabase): Promise<Record<string, VitalLogRow | null>> {
  const [bp, pulse, spo2, glucose, temperature, weight, pain] = await Promise.all([
    db.getFirstAsync<VitalLogRow>('SELECT * FROM vital_logs WHERE is_deleted = 0 AND (bp_sys IS NOT NULL OR bp_dia IS NOT NULL) ORDER BY logged_at_iso DESC LIMIT 1'),
    db.getFirstAsync<VitalLogRow>('SELECT * FROM vital_logs WHERE is_deleted = 0 AND pulse IS NOT NULL ORDER BY logged_at_iso DESC LIMIT 1'),
    db.getFirstAsync<VitalLogRow>('SELECT * FROM vital_logs WHERE is_deleted = 0 AND spo2 IS NOT NULL ORDER BY logged_at_iso DESC LIMIT 1'),
    db.getFirstAsync<VitalLogRow>('SELECT * FROM vital_logs WHERE is_deleted = 0 AND glucose_value IS NOT NULL ORDER BY logged_at_iso DESC LIMIT 1'),
    db.getFirstAsync<VitalLogRow>('SELECT * FROM vital_logs WHERE is_deleted = 0 AND temp_value IS NOT NULL ORDER BY logged_at_iso DESC LIMIT 1'),
    db.getFirstAsync<VitalLogRow>('SELECT * FROM vital_logs WHERE is_deleted = 0 AND weight_value IS NOT NULL ORDER BY logged_at_iso DESC LIMIT 1'),
    db.getFirstAsync<VitalLogRow>('SELECT * FROM vital_logs WHERE is_deleted = 0 AND pain_level IS NOT NULL ORDER BY logged_at_iso DESC LIMIT 1'),
  ]);

  return {
    bp: bp ?? null,
    pulse: pulse ?? null,
    spo2: spo2 ?? null,
    glucose: glucose ?? null,
    temperature: temperature ?? null,
    weight: weight ?? null,
    pain: pain ?? null,
  };
}

export async function softDeleteVitalLog(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('UPDATE vital_logs SET is_deleted = 1 WHERE id = ?', [id]);
}
