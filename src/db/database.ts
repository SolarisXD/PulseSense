import * as SQLite from 'expo-sqlite';
import { runMigrations } from './migrations';
import { ensureHealthSyncSchema } from './queries/healthSync';

let migrationsRan = false;
let initPromise: Promise<void> | null = null;

export function getDBInstance(): SQLite.SQLiteDatabase | null {
  return null;
}

export function closeDB(): void {
  migrationsRan = false;
  initPromise = null;
}

export async function getDB(): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync('pulsesense.db');
  if (!migrationsRan) {
    if (!initPromise) {
      initPromise = (async () => {
        await runMigrations(db);
        await ensureHealthSyncSchema(db);
        migrationsRan = true;
      })();
    }
    await initPromise;
  }
  // Run unconditionally on every connection — callers that queue behind initPromise
  // open a fresh handle and must have FK enforcement regardless of timing.
  await db.execAsync('PRAGMA foreign_keys = ON;');
  return db;
}

export async function initializeDatabase(): Promise<SQLite.SQLiteDatabase> {
  return getDB();
}
