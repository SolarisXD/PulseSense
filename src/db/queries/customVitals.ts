// PulseSense — Custom Vitals Queries

import type { SQLiteDatabase } from 'expo-sqlite';

export interface CustomVitalDefinitionRow {
  id: number;
  name: string;
  unit: string;
  normal_min: number | null;
  normal_max: number | null;
  notes: string | null;
  is_active: number;
  sort_order: number;
  created_at: string;
}

export interface CustomVitalLogRow {
  id: number;
  vital_definition_id: number;
  vital_log_id: number | null;
  logged_at_display: string | null;
  logged_at_iso: string | null;
  value: number;
  notes: string | null;
  created_at: string;
}

export interface CustomVitalDefinitionInput {
  name: string;
  unit: string;
  normal_min?: number | null;
  normal_max?: number | null;
  notes?: string | null;
}

export async function getCustomVitalDefinitions(db: SQLiteDatabase): Promise<CustomVitalDefinitionRow[]> {
  const rows = await db.getAllAsync<CustomVitalDefinitionRow>(
    'SELECT * FROM custom_vital_definitions WHERE is_active = 1 ORDER BY sort_order ASC, name ASC'
  );
  return rows;
}

export async function getAllCustomVitalDefinitions(db: SQLiteDatabase): Promise<CustomVitalDefinitionRow[]> {
  const rows = await db.getAllAsync<CustomVitalDefinitionRow>(
    'SELECT * FROM custom_vital_definitions ORDER BY sort_order ASC, name ASC'
  );
  return rows;
}

export async function insertCustomVitalDefinition(
  db: SQLiteDatabase,
  data: CustomVitalDefinitionInput
): Promise<number> {
  const result = await db.runAsync(
    `INSERT INTO custom_vital_definitions (name, unit, normal_min, normal_max, notes)
     VALUES (?, ?, ?, ?, ?)`,
    [data.name, data.unit, data.normal_min ?? null, data.normal_max ?? null, data.notes ?? null]
  );
  return result.lastInsertRowId;
}

export async function updateCustomVitalDefinition(
  db: SQLiteDatabase,
  id: number,
  data: CustomVitalDefinitionInput
): Promise<void> {
  await db.runAsync(
    `UPDATE custom_vital_definitions SET name = ?, unit = ?, normal_min = ?, normal_max = ?, notes = ?
     WHERE id = ?`,
    [data.name, data.unit, data.normal_min ?? null, data.normal_max ?? null, data.notes ?? null, id]
  );
}

export async function toggleCustomVitalActive(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync(
    `UPDATE custom_vital_definitions SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END WHERE id = ?`,
    [id]
  );
}

export async function deleteCustomVitalDefinition(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('DELETE FROM custom_vital_definitions WHERE id = ?', [id]);
}

export async function insertCustomVitalLog(
  db: SQLiteDatabase,
  data: {
    vital_definition_id: number;
    vital_log_id?: number | null;
    logged_at_display?: string | null;
    logged_at_iso?: string | null;
    value: number;
    notes?: string | null;
  }
): Promise<number> {
  const result = await db.runAsync(
    `INSERT INTO custom_vital_logs (vital_definition_id, vital_log_id, logged_at_display, logged_at_iso, value, notes)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      data.vital_definition_id,
      data.vital_log_id ?? null,
      data.logged_at_display ?? null,
      data.logged_at_iso ?? null,
      data.value,
      data.notes ?? null,
    ]
  );
  return result.lastInsertRowId;
}

export async function getCustomVitalLogs(
  db: SQLiteDatabase,
  definitionId: number,
  startIso?: string,
  endIso?: string
): Promise<CustomVitalLogRow[]> {
  let query = 'SELECT * FROM custom_vital_logs WHERE vital_definition_id = ?';
  const params: (string | number)[] = [definitionId];

  if (startIso && endIso) {
    query += ' AND logged_at_iso >= ? AND logged_at_iso <= ?';
    params.push(startIso, endIso);
  }

  query += ' ORDER BY logged_at_iso DESC';

  const rows = await db.getAllAsync<CustomVitalLogRow>(query, params);
  return rows;
}

export async function getLatestCustomVitalLogs(
  db: SQLiteDatabase
): Promise<(CustomVitalLogRow & { definition_name: string; unit: string })[]> {
  const rows = await db.getAllAsync<
    CustomVitalLogRow & { definition_name: string; unit: string }
  >(
    `SELECT cvl.*, cvd.name as definition_name, cvd.unit
     FROM custom_vital_logs cvl
     JOIN custom_vital_definitions cvd ON cvl.vital_definition_id = cvd.id
     WHERE cvl.id IN (
       SELECT MAX(id) FROM custom_vital_logs GROUP BY vital_definition_id
     )
     ORDER BY cvl.created_at DESC`
  );
  return rows;
}
