jest.mock('expo-file-system', () => ({
  File: {
    pickFileAsync: jest.fn().mockResolvedValue({ text: jest.fn().mockResolvedValue('{}') }),
  },
  Paths: {
    cache: '/mock/cache',
  },
}));

jest.mock('expo-file-system/legacy', () => ({
  writeAsStringAsync: jest.fn().mockResolvedValue(undefined),
  documentDirectory: '/mock/docs/',
  cacheDirectory: '/mock/cache/',
}));

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn().mockResolvedValue(true),
  shareAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../hooks/useDB', () => ({
  getDB: jest.fn().mockResolvedValue({
    getAllAsync: jest.fn().mockResolvedValue([]),
  }),
  loadStores: jest.fn().mockResolvedValue(undefined),
}));

import {
  backupDatabase,
  restoreDatabase,
  shareBackup,
  performBackupAndShare,
} from '../../services/backupService';
import type { BackupData } from '../../services/backupService';

describe('backupService module', () => {
  it('exports backupDatabase as a function', () => {
    expect(typeof backupDatabase).toBe('function');
  });

  it('exports restoreDatabase as a function', () => {
    expect(typeof restoreDatabase).toBe('function');
  });

  it('exports shareBackup as a function', () => {
    expect(typeof shareBackup).toBe('function');
  });

  it('exports performBackupAndShare as a function', () => {
    expect(typeof performBackupAndShare).toBe('function');
  });

  it('exports BackupData interface', () => {
    const data: BackupData = {
      appName: 'PulseSense',
      schemaVersion: 2,
      exportedAt: '2026-01-01T00:00:00.000Z',
      tables: {},
    };
    expect(data.appName).toBe('PulseSense');
    expect(data.schemaVersion).toBe(2);
  });
});
