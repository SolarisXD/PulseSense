// PulseSense — Backup & Restore Service
// Exports all DB data as JSON for backup, imports JSON to restore

import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';
import { getDB, loadStores } from '../hooks/useDB';
import { SCHEMA_VERSION } from '../db/schema';

export interface BackupData {
  appName: string;
  schemaVersion: number;
  exportedAt: string;
  tables: Record<string, any[]>;
}

const ALL_TABLES = [
  'settings',
  'profile',
  'emergency_contacts',
  'conditions',
  'allergies',
  'medications',
  'medication_items',
  'vital_logs',
  'custom_vital_definitions',
  'custom_vital_logs',
  'symptom_events',
  'rule_triggers',
  'alerts',
] as const;

function formatTimestamp(): string {
  const now = new Date();
  const d = String(now.getDate()).padStart(2, '0');
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const y = now.getFullYear();
  const h = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  return `${d}${m}${y}_${h}${min}`;
}

export async function backupDatabase(): Promise<string> {
  const db = await getDB();

  // Export all tables
  const tables: Record<string, any[]> = {};
  for (const tableName of ALL_TABLES) {
    const rows = await db.getAllAsync<any>(`SELECT * FROM "${tableName}" ORDER BY id ASC`);
    tables[tableName] = rows;
  }

  const backup: BackupData = {
    appName: 'PulseSense',
    schemaVersion: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    tables,
  };

  const json = JSON.stringify(backup, null, 2);
  if (json.length > 50 * 1024 * 1024) {
    throw new Error('Backup too large (exceeds 50MB limit)');
  }
  const fileName = `PulseSense_Backup_${formatTimestamp()}.json`;
  const file = new File(Paths.cache, fileName);
  file.write(json);

  return file.uri;
}

export async function shareBackup(uri: string): Promise<void> {
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/json',
      dialogTitle: 'Share PulseSense Backup',
    });
  } else {
    throw new Error('Sharing is not available on this device');
  }
}

export async function performBackupAndShare(): Promise<void> {
  const uri = await backupDatabase();
  await shareBackup(uri);
}

export async function restoreDatabase(): Promise<{ success: boolean; message: string }> {
  // Pick a backup file
  const picked = await File.pickFileAsync(undefined, 'application/json');
  if (!picked) {
    return { success: false, message: 'No file selected' };
  }
  // pickFileAsync can return File | File[] — handle single file case
  const file = Array.isArray(picked) ? picked[0] : picked;
  if (!file) {
    return { success: false, message: 'No file selected' };
  }

  // Read file content
  const content = await file.text();
  let backup: BackupData;
  try {
    backup = JSON.parse(content);
  } catch (err) {
    console.warn('backupService: restore invalid JSON', err);
    return { success: false, message: 'Invalid backup file: not valid JSON' };
  }

  // Validate backup format
  if (!backup.appName || backup.appName !== 'PulseSense') {
    return { success: false, message: 'Invalid backup file: not a PulseSense backup' };
  }
  if (!backup.tables || typeof backup.tables !== 'object') {
    return { success: false, message: 'Invalid backup file: missing tables data' };
  }
  if (backup.schemaVersion > SCHEMA_VERSION) {
    return { success: false, message: `Backup schema v${backup.schemaVersion} is newer than current v${SCHEMA_VERSION}. Please update the app first.` };
  }

  const db = await getDB();

  try {
    // Wrap entire restore in a transaction
    await db.execAsync('BEGIN TRANSACTION');

    try {
      // Disable FK checks during restore to avoid constraint errors
      await db.execAsync('PRAGMA foreign_keys = OFF');

      // Clear all tables in reverse dependency order
      const clearOrder = [...ALL_TABLES].reverse();
      for (const tableName of clearOrder) {
        await db.runAsync(`DELETE FROM "${tableName}"`);
      }

      // Re-insert data
      for (const tableName of ALL_TABLES) {
        const rows = backup.tables[tableName] || [];
        if (rows.length === 0) continue;

        // Get column names from the first row
        const columns = Object.keys(rows[0]).filter((col) => col !== 'id');
        if (columns.length === 0) continue;

        // Sanitize column names: only allow valid identifiers
        const safeColumns = columns.filter((c) => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(c));
        if (safeColumns.length === 0) continue;

        const placeholders = safeColumns.map(() => '?').join(',');
        const colNames = safeColumns.map((c) => `"${c}"`).join(',');

        for (const row of rows) {
          const values = safeColumns.map((col) => {
            const val = row[col];
            return val === undefined ? null : val;
          });
          await db.runAsync(
            `INSERT INTO "${tableName}" (${colNames}) VALUES (${placeholders})`,
            values
          );
        }
      }

      await db.execAsync('PRAGMA foreign_keys = ON');
      await db.execAsync('COMMIT');
    } catch (err) {
      await db.execAsync('PRAGMA foreign_keys = ON');
      await db.execAsync('ROLLBACK');
      throw err;
    }
  } catch (err) {
    return {
      success: false,
      message: `Restore failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
    };
  }

  // Reload stores
  await loadStores(db);

  return { success: true, message: `Data restored successfully from backup created ${new Date(backup.exportedAt).toLocaleDateString()}` };
}
