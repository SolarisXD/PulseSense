import * as SQLite from 'expo-sqlite';
import { runMigrations } from './migrations';

let dbInstance: SQLite.SQLiteDatabase | null = null;

export function getDBInstance(): SQLite.SQLiteDatabase | null {
  return dbInstance;
}

export async function getDB(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) return dbInstance;
  dbInstance = await SQLite.openDatabaseAsync('pulsesense.db');
  return dbInstance;
}

export async function initializeDatabase(): Promise<SQLite.SQLiteDatabase> {
  const db = await getDB();
  await runMigrations(db);
  return db;
}
