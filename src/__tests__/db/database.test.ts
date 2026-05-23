jest.mock('../../db/migrations', () => ({
  runMigrations: jest.fn().mockResolvedValue(undefined),
}));

import { getDBInstance, getDB, initializeDatabase } from '../../db/database';

describe('database module', () => {
  beforeEach(() => {
    (getDB as any)._reset?.();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('getDBInstance returns null before initialization', () => {
    expect(getDBInstance()).toBeNull();
  });

  it('getDB opens database and returns instance', async () => {
    const db = await getDB();
    expect(db).toBeDefined();
    expect(getDBInstance()).toBe(db);
  });

  it('getDB returns same instance on subsequent calls', async () => {
    const db1 = await getDB();
    const db2 = await getDB();
    expect(db1).toBe(db2);
  });

  it('initializeDatabase runs migrations', async () => {
    const { runMigrations } = require('../../db/migrations');
    const db = await initializeDatabase();
    expect(runMigrations).toHaveBeenCalledWith(db);
  });
});
