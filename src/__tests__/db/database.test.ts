jest.mock('../../db/migrations', () => ({
  runMigrations: jest.fn().mockResolvedValue(undefined),
}));

describe('database module', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('getDBInstance returns null before first getDB call', () => {
    const { getDBInstance } = require('../../db/database');
    expect(getDBInstance()).toBeNull();
  });

  it('getDBInstance returns cached db after getDB', async () => {
    const { getDB, getDBInstance } = require('../../db/database');
    const db = await getDB();
    expect(getDBInstance()).toBe(db);
  });

  it('getDB returns same cached instance on subsequent calls', async () => {
    const { getDB } = require('../../db/database');
    const db1 = await getDB();
    const db2 = await getDB();
    expect(db1).toBe(db2);
    expect(db1.getAllAsync).toBeDefined();
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
