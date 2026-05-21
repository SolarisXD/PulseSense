// PulseSense — Database Migration Runner
// Runs on each app startup to ensure schema is up to date

import type { SQLiteDatabase } from 'expo-sqlite';
import { SCHEMA_VERSION, CREATE_TABLES, CREATE_INDEXES } from './schema';
import { SEED_SETTINGS } from './seeds';

export async function runMigrations(db: SQLiteDatabase): Promise<void> {
  try {
    // Get current version (0 if settings table doesn't exist yet)
    let currentVersion = 0;
    try {
      const row = await db.getFirstAsync<{ value: string }>(
        `SELECT value FROM settings WHERE key = 'db_version'`
      );
      if (row) {
        currentVersion = parseInt(row.value, 10) || 0;
      }
    } catch {
      // settings table doesn't exist yet, that's fine
    }

    if (currentVersion >= SCHEMA_VERSION) {
      return; // Already up to date
    }

    // Run all table creation (IF NOT EXISTS handles idempotency)
    for (const stmt of CREATE_TABLES) {
      await db.execAsync(stmt);
    }

    // Enable foreign keys — must be done per-connection and BEFORE any DML
    await db.execAsync('PRAGMA foreign_keys = ON;');

    // Create indexes
    for (const idx of CREATE_INDEXES) {
      await db.execAsync(idx);
    }

    // Seed default settings
    for (const seed of SEED_SETTINGS) {
      await db.runAsync(
        `INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)`,
        [seed.key, seed.value]
      );
    }

    // Update version
    await db.runAsync(
      `INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES ('db_version', ?, datetime('now'))`,
      [String(SCHEMA_VERSION)]
    );

    console.log(`[DB] Migrated from v${currentVersion} to v${SCHEMA_VERSION}`);
  } catch (error) {
    console.error('[DB] Migration error:', error);
    throw error;
  }
}
