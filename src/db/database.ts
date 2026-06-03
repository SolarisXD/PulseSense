import * as SQLite from 'expo-sqlite';
import { runMigrations } from './migrations';
import { ensureHealthSyncSchema } from './queries/healthSync';

let dbInstance: SQLite.SQLiteDatabase | null = null;
let dbInitPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export function getDBInstance(): SQLite.SQLiteDatabase | null {
  return dbInstance;
}

export function closeDB(): void {
  dbInstance = null;
  dbInitPromise = null;
}

export async function getDB(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) return dbInstance;
  if (!dbInitPromise) {
    dbInitPromise = SQLite.openDatabaseAsync('pulsesense.db').then(db => {
      dbInstance = db;
      return db;
    });
  }
  return dbInitPromise;
}

export async function initializeDatabase(): Promise<SQLite.SQLiteDatabase> {
  const db = await getDB();
  await runMigrations(db);
  await ensureHealthSyncSchema(db);
  return db;
}
