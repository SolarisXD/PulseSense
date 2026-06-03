jest.mock('../../db/migrations', () => ({
  runMigrations: jest.fn().mockResolvedValue(undefined),
}));

describe('database module', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('getDBInstance always returns null (no longer cached)', () => {
    const { getDBInstance } = require('../../db/database');
    expect(getDBInstance()).toBeNull();
  });

  it('getDB opens database and returns instance', async () => {
    const { getDB } = require('../../db/database');
    const db = await getDB();
    expect(db).toBeDefined();
    expect(typeof db.getAllAsync).toBe('function');
  });

  it('getDB returns a new object each call', async () => {
    const { getDB } = require('../../db/database');
    const db1 = await getDB();
    const db2 = await getDB();
    expect(db1).not.toBe(db2);
    expect(db1.getAllAsync).toBeDefined();
    expect(db2.getAllAsync).toBeDefined();
  });

  it('initializeDatabase runs migrations once', async () => {
    const { runMigrations } = require('../../db/migrations');
    const { initializeDatabase } = require('../../db/database');
    await initializeDatabase();
    expect(runMigrations).toHaveBeenCalledTimes(1);
  });

  it('getDB does not re-run migrations after init', async () => {
    const { runMigrations } = require('../../db/migrations');
    const { initializeDatabase, getDB } = require('../../db/database');
    await initializeDatabase();
    jest.clearAllMocks();
    await getDB();
    expect(runMigrations).not.toHaveBeenCalled();
  });
});
