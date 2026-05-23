import { runMigrations } from '../../db/migrations';

const mockGetFirstAsync = jest.fn();
const mockExecAsync = jest.fn().mockResolvedValue(undefined);
const mockRunAsync = jest.fn().mockResolvedValue(undefined);
const mockGetAllAsync = jest.fn();

const mockDb = {
  getFirstAsync: mockGetFirstAsync,
  execAsync: mockExecAsync,
  runAsync: mockRunAsync,
  getAllAsync: mockGetAllAsync,
} as any;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('runMigrations', () => {
  it('runs full migration when no version found (fresh DB)', async () => {
    mockGetFirstAsync.mockRejectedValueOnce(new Error('table not found'));
    mockGetAllAsync.mockResolvedValue([]);
    await runMigrations(mockDb);

    expect(mockExecAsync).toHaveBeenCalled();
    expect(mockRunAsync).toHaveBeenCalled();
    // Should set version to SCHEMA_VERSION
    expect(mockRunAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT OR REPLACE INTO settings'),
      expect.arrayContaining(['2'])
    );
  });

  it('skips migration when already at current version', async () => {
    mockGetFirstAsync.mockResolvedValue({ value: '2' });
    await runMigrations(mockDb);

    expect(mockExecAsync).not.toHaveBeenCalled();
    expect(mockRunAsync).not.toHaveBeenCalled();
  });

  it('runs v2 migration when upgrading from v1', async () => {
    mockGetFirstAsync.mockResolvedValue({ value: '1' });
    mockGetAllAsync.mockResolvedValue([]);

    await runMigrations(mockDb);

    // Should add contact_type column
    expect(mockExecAsync).toHaveBeenCalledWith(
      expect.stringContaining('ALTER TABLE emergency_contacts ADD COLUMN contact_type')
    );
    // Should enable foreign keys
    expect(mockExecAsync).toHaveBeenCalledWith('PRAGMA foreign_keys = ON;');
  });

  it('does not add contact_type column if it already exists', async () => {
    mockGetFirstAsync.mockResolvedValue({ value: '1' });
    mockGetAllAsync.mockResolvedValue([{ name: 'contact_type' }]);

    await runMigrations(mockDb);

    // Should NOT try to add the column
    expect(mockExecAsync).not.toHaveBeenCalledWith(
      expect.stringContaining('ALTER TABLE emergency_contacts ADD COLUMN contact_type')
    );
  });

  it('creates indexes after migration', async () => {
    mockGetFirstAsync.mockRejectedValueOnce(new Error('no table'));
    mockGetAllAsync.mockResolvedValue([]);
    await runMigrations(mockDb);

    const execCalls = mockExecAsync.mock.calls.map((c: any[]) => c[0]);
    expect(execCalls.some((s: string) => s.includes('CREATE INDEX'))).toBe(true);
  });

  it('seeds default settings', async () => {
    mockGetFirstAsync.mockRejectedValueOnce(new Error('no table'));
    mockGetAllAsync.mockResolvedValue([]);
    await runMigrations(mockDb);

    expect(mockRunAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT OR IGNORE INTO settings'),
      expect.arrayContaining([expect.any(String), expect.any(String)])
    );
  });
});
