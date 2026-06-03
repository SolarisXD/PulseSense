function createMockDb() {
  return {
    execAsync: jest.fn().mockResolvedValue(undefined),
    runAsync: jest.fn().mockResolvedValue(undefined),
    getAllAsync: jest.fn().mockResolvedValue([]),
    getFirstAsync: jest.fn().mockResolvedValue(null),
  };
}

export const openDatabaseAsync = jest.fn().mockImplementation(() => Promise.resolve(createMockDb()));
export type SQLiteDatabase = ReturnType<typeof createMockDb>;
