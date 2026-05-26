import type { SQLiteDatabase } from 'expo-sqlite';

const TABLES = [
  'rule_triggers',
  'alerts',
  'custom_vital_logs',
  'vital_logs',
  'symptom_events',
  'medication_items',
  'medications',
  'custom_vital_definitions',
  'allergies',
  'conditions',
  'emergency_contacts',
  'profile',
  'settings',
] as const;

export async function deleteAllData(db: SQLiteDatabase): Promise<void> {
  await db.execAsync('BEGIN TRANSACTION');
  try {
    for (const table of TABLES) {
      await db.runAsync(`DELETE FROM ${table}`);
    }
    await db.execAsync('COMMIT');
  } catch (err) {
    await db.execAsync('ROLLBACK');
    throw err;
  }
}
