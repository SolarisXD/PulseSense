jest.mock('react-native', () => ({
  Platform: { OS: 'ios', select: (obj: any) => obj.ios },
}));

import {
  isHealthAvailable,
  getPlatform,
  requestHealthPermissions,
  getHealthPermissions,
  readHeartRate,
  readBloodPressure,
  readWeight,
  readOxygenSaturation,
  readSteps,
  writeHeartRate,
  writeBloodPressure,
  writeWeight,
  disconnectHealth,
  getConnectionStatus,
} from '../../engine/healthPlatform';
import type {
  ConnectionStatus,
  HealthVitalSample,
  BPHealthSample,
  HealthPermissions,
  HealthPermission,
  SyncMetadata,
} from '../../engine/healthPlatformTypes';

describe('healthPlatform module (iOS mock)', () => {
  it('exports isHealthAvailable as a function', () => {
    expect(typeof isHealthAvailable).toBe('function');
  });

  it('exports getPlatform as a function', () => {
    expect(typeof getPlatform).toBe('function');
  });

  it('getPlatform returns apple_health when Platform.OS is ios', async () => {
    const platform = await getPlatform();
    expect(platform).toBe('apple_health');
  });

  it('exports requestHealthPermissions as a function', () => {
    expect(typeof requestHealthPermissions).toBe('function');
  });

  it('exports getHealthPermissions as a function', () => {
    expect(typeof getHealthPermissions).toBe('function');
  });

  it('exports readHeartRate as a function', () => {
    expect(typeof readHeartRate).toBe('function');
  });

  it('exports readBloodPressure as a function', () => {
    expect(typeof readBloodPressure).toBe('function');
  });

  it('exports readWeight as a function', () => {
    expect(typeof readWeight).toBe('function');
  });

  it('exports readOxygenSaturation as a function', () => {
    expect(typeof readOxygenSaturation).toBe('function');
  });

  it('exports readSteps as a function', () => {
    expect(typeof readSteps).toBe('function');
  });

  it('exports writeHeartRate as a function', () => {
    expect(typeof writeHeartRate).toBe('function');
  });

  it('exports writeBloodPressure as a function', () => {
    expect(typeof writeBloodPressure).toBe('function');
  });

  it('exports writeWeight as a function', () => {
    expect(typeof writeWeight).toBe('function');
  });

  it('exports disconnectHealth as a function', () => {
    expect(typeof disconnectHealth).toBe('function');
  });

  it('exports getConnectionStatus as a function', () => {
    expect(typeof getConnectionStatus).toBe('function');
  });

  it('exports types from healthPlatformTypes', () => {
    const status: ConnectionStatus = 'unavailable';
    expect(status).toBe('unavailable');

    const sample: HealthVitalSample = { value: 72, date: '2026-01-01', type: 'heart_rate', unit: 'bpm' };
    expect(sample.type).toBe('heart_rate');

    const bp: BPHealthSample = { systolic: 120, diastolic: 80, date: '2026-01-01' };
    expect(bp.systolic).toBe(120);

    const perm: HealthPermission = { read: true, write: false };
    expect(perm.read).toBe(true);

    const perms: HealthPermissions = {
      heart_rate: { read: true, write: false },
      blood_pressure: { read: true, write: false },
      weight: { read: false, write: false },
      oxygen_saturation: { read: false, write: false },
      steps: { read: false, write: false },
    };
    expect(perms.heart_rate.read).toBe(true);

    const sync: SyncMetadata = { lastImportAt: null, lastExportAt: null, importCount: 0, exportCount: 0 };
    expect(sync.importCount).toBe(0);
  });
});
