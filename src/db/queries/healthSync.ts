import type { SQLiteDatabase } from 'expo-sqlite';
import type { SyncMetadata } from '../../engine/healthPlatformTypes';

export interface HealthSyncRow {
  id: number;
  last_import_at: string | null;
  last_export_at: string | null;
  import_count: number;
  export_count: number;
}

export async function ensureHealthSyncSchema(db: SQLiteDatabase): Promise<void> {
  await db.runAsync(
    `CREATE TABLE IF NOT EXISTS health_sync (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      last_import_at TEXT,
      last_export_at TEXT,
      import_count INTEGER DEFAULT 0,
      export_count INTEGER DEFAULT 0
    )`
  );
  await db.runAsync(
    `INSERT OR IGNORE INTO health_sync (id) VALUES (1)`
  );
}

export async function getSyncMetadata(db: SQLiteDatabase): Promise<SyncMetadata> {
  const row = await db.getFirstAsync<HealthSyncRow>(
    'SELECT * FROM health_sync WHERE id = 1'
  );
  if (!row) {
    return { lastImportAt: null, lastExportAt: null, importCount: 0, exportCount: 0 };
  }
  return {
    lastImportAt: row.last_import_at ?? null,
    lastExportAt: row.last_export_at ?? null,
    importCount: row.import_count,
    exportCount: row.export_count,
  };
}

export async function recordImport(db: SQLiteDatabase, importedCount: number): Promise<void> {
  await db.runAsync(
    `UPDATE health_sync SET
      last_import_at = datetime('now'),
      import_count = import_count + ?
    WHERE id = 1`,
    [importedCount]
  );
}

export async function recordExport(db: SQLiteDatabase, exportedCount: number): Promise<void> {
  await db.runAsync(
    `UPDATE health_sync SET
      last_export_at = datetime('now'),
      export_count = export_count + ?
    WHERE id = 1`,
    [exportedCount]
  );
}
