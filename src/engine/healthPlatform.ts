import { Platform } from 'react-native';
import type {
  ConnectionStatus,
  HealthVitalSample,
  BPHealthSample,
  HealthPermissions,
  SyncMetadata,
} from './healthPlatformTypes';

type PermissionMap = Record<string, { read: boolean; write: boolean }>;

interface IHealthAdapter {
  isAvailable(): Promise<boolean>;
  requestPermissions(permissions: PermissionMap): Promise<boolean>;
  getGrantedPermissions(): Promise<PermissionMap>;
  readHeartRate(startDate: string, endDate: string): Promise<HealthVitalSample[]>;
  readBloodPressure(startDate: string, endDate: string): Promise<BPHealthSample[]>;
  readWeight(startDate: string, endDate: string): Promise<HealthVitalSample[]>;
  readOxygenSaturation(startDate: string, endDate: string): Promise<HealthVitalSample[]>;
  readSteps(startDate: string, endDate: string): Promise<HealthVitalSample[]>;
  writeHeartRate(value: number, date: string): Promise<boolean>;
  writeBloodPressure(systolic: number, diastolic: number, date: string): Promise<boolean>;
  writeWeight(value: number, date: string, unit?: string): Promise<boolean>;
  disconnect(): Promise<void>;
}

function createAdapter(): IHealthAdapter | null {
  if (Platform.OS === 'ios') {
    return createIOSAdapter();
  }
  if (Platform.OS === 'android') {
    return createAndroidAdapter();
  }
  return null;
}

function createIOSAdapter(): IHealthAdapter {
  let initialized = false;
  let initPromise: Promise<void> | null = null;
  const AppleHealthKit = require('react-native-health').default;

  const perms = AppleHealthKit.Constants.Permissions;
  const units = AppleHealthKit.Constants.Units;

  function init(): Promise<void> {
    if (initialized) return Promise.resolve();
    if (initPromise) return initPromise;
    return initPromise = new Promise((resolve, reject) => {
      AppleHealthKit.initHealthKit(
        {
          permissions: {
            read: [
              perms.HeartRate,
              perms.BloodPressureSystolic,
              perms.BloodPressureDiastolic,
              perms.BodyMass,
              perms.OxygenSaturation,
              perms.StepCount,
            ],
            write: [
              perms.HeartRate,
              perms.BloodPressureSystolic,
              perms.BloodPressureDiastolic,
              perms.BodyMass,
            ],
          },
        },
        (err: string) => {
          if (err) { reject(new Error(err)); return; }
          initialized = true;
          resolve();
        }
      );
    });
  }

  return {
    async isAvailable(): Promise<boolean> {
      return new Promise((resolve) => {
        AppleHealthKit.isAvailable({}, (_err: unknown, available: boolean) => {
          resolve(available);
        });
      });
    },

    async requestPermissions(): Promise<boolean> {
      try {
        await init();
        return true;
      } catch {
        return false;
      }
    },

    async getGrantedPermissions(): Promise<PermissionMap> {
      try {
        await init();
        const healthPerms = {
          permissions: {
            read: [
              perms.HeartRate,
              perms.BloodPressureSystolic,
              perms.BloodPressureDiastolic,
              perms.BodyMass,
              perms.OxygenSaturation,
              perms.StepCount,
            ],
            write: [
              perms.HeartRate,
              perms.BloodPressureSystolic,
              perms.BloodPressureDiastolic,
              perms.BodyMass,
            ],
          },
        };
        return new Promise((resolve) => {
          AppleHealthKit.getAuthStatus(healthPerms, (_err: string, results: { permissions: { read: number[]; write: number[] } }) => {
            const authorized = (code: number) => code === 2;
            resolve({
              HeartRate: { read: authorized(results.permissions.read[0]), write: authorized(results.permissions.write[0]) },
              BloodPressure: { read: authorized(results.permissions.read[1]), write: authorized(results.permissions.write[1]) },
              BodyMass: { read: authorized(results.permissions.read[3]), write: authorized(results.permissions.write[2]) },
              OxygenSaturation: { read: authorized(results.permissions.read[4]), write: false },
              StepCount: { read: authorized(results.permissions.read[5]), write: false },
            });
          });
        });
      } catch {
        return {};
      }
    },

    async readHeartRate(startDate: string, endDate: string): Promise<HealthVitalSample[]> {
      await init();
      return new Promise((resolve, reject) => {
        AppleHealthKit.getHeartRateSamples(
          { startDate, endDate, ascending: true, limit: 500 },
          (err: string, results: Array<{ value: number; startDate: string }>) => {
            if (err) { reject(new Error(err)); return; }
            resolve(results.map((r) => ({ value: r.value, date: r.startDate, type: 'heart_rate' as const, unit: 'bpm' })));
          }
        );
      });
    },

    async readBloodPressure(startDate: string, endDate: string): Promise<BPHealthSample[]> {
      await init();
      return new Promise((resolve, reject) => {
        AppleHealthKit.getBloodPressureSamples(
          { startDate, endDate, ascending: true, limit: 500 },
          (err: string, results: Array<{ bloodPressureSystolicValue: number; bloodPressureDiastolicValue: number; startDate: string }>) => {
            if (err) { reject(new Error(err)); return; }
            resolve(results.map((r) => ({ systolic: r.bloodPressureSystolicValue, diastolic: r.bloodPressureDiastolicValue, date: r.startDate })));
          }
        );
      });
    },

    async readWeight(startDate: string, endDate: string): Promise<HealthVitalSample[]> {
      await init();
      return new Promise((resolve, reject) => {
        AppleHealthKit.getWeightSamples(
          { startDate, endDate, ascending: true, limit: 500, unit: 'kg' },
          (err: string, results: Array<{ value: number; startDate: string }>) => {
            if (err) { reject(new Error(err)); return; }
            resolve(results.map((r) => ({ value: r.value, date: r.startDate, type: 'weight' as const, unit: 'kg' })));
          }
        );
      });
    },

    async readOxygenSaturation(startDate: string, endDate: string): Promise<HealthVitalSample[]> {
      await init();
      return new Promise((resolve, reject) => {
        AppleHealthKit.getOxygenSaturationSamples(
          { startDate, endDate, ascending: true, limit: 500 },
          (err: string, results: Array<{ value: number; startDate: string }>) => {
            if (err) { reject(new Error(err)); return; }
            resolve(results.map((r) => ({ value: r.value, date: r.startDate, type: 'oxygen_saturation' as const, unit: '%' })));
          }
        );
      });
    },

    async readSteps(startDate: string, endDate: string): Promise<HealthVitalSample[]> {
      await init();
      return new Promise((resolve, reject) => {
        AppleHealthKit.getDailyStepCountSamples(
          { startDate, endDate, ascending: true, includeManuallyAdded: true },
          (err: string, results: Array<{ value: number; startDate: string }>) => {
            if (err) { reject(new Error(err)); return; }
            resolve(results.map((r) => ({ value: r.value, date: r.startDate, type: 'steps' as const, unit: 'count' })));
          }
        );
      });
    },

    async writeHeartRate(value: number, date: string): Promise<boolean> {
      await init();
      return new Promise((resolve, reject) => {
        AppleHealthKit.saveHeartRateSample(
          { value, startDate: date, endDate: date },
          (err: string) => {
            if (err) { reject(new Error(err)); return; }
            resolve(true);
          }
        );
      });
    },

    async writeBloodPressure(_systolic: number, _diastolic: number, _date: string): Promise<boolean> {
      return false;
    },

    async writeWeight(value: number, date: string, unit = 'kg'): Promise<boolean> {
      await init();
      return new Promise((resolve, reject) => {
        AppleHealthKit.saveWeight(
          { value, unit, startDate: date, endDate: date },
          (err: string) => {
            if (err) { reject(new Error(err)); return; }
            resolve(true);
          }
        );
      });
    },

    async disconnect(): Promise<void> {
      initialized = false;
    },
  };
}

function createAndroidAdapter(): IHealthAdapter {
  let initialized = false;
  let initPromise: Promise<void> | null = null;

  const HC = require('react-native-health-connect');

  async function ensureInit(): Promise<void> {
    if (initialized) return;
    if (initPromise) return initPromise;
    initPromise = (async () => {
      const status = await HC.getSdkStatus();
      if (status !== 3) throw new Error('Health Connect not available');
      await HC.initialize();
      initialized = true;
    })();
    return initPromise;
  }

  return {
    async isAvailable(): Promise<boolean> {
      try {
        const status = await HC.getSdkStatus();
        return status === 3;
      } catch {
        return false;
      }
    },

    async requestPermissions(permissions: PermissionMap): Promise<boolean> {
      try {
        await ensureInit();
        const perms: Array<{ accessType: string; recordType: string }> = [];
        for (const [type, access] of Object.entries(permissions)) {
          if (access.read) perms.push({ accessType: 'read', recordType: typeToHC(type) });
          if (access.write) perms.push({ accessType: 'write', recordType: typeToHC(type) });
        }
        const granted = await HC.requestPermission(perms);
        return granted.length > 0;
      } catch {
        return false;
      }
    },

    async getGrantedPermissions(): Promise<PermissionMap> {
      try {
        await ensureInit();
        const granted = await HC.getGrantedPermissions();
        const map: PermissionMap = {};
        for (const p of granted) {
          const type = hcToType(p.recordType);
          if (type) {
            if (!map[type]) map[type] = { read: false, write: false };
            if (p.accessType === 'read') map[type].read = true;
            if (p.accessType === 'write') map[type].write = true;
          }
        }
        return map;
      } catch {
        return {};
      }
    },

    async readHeartRate(startDate: string, endDate: string): Promise<HealthVitalSample[]> {
      await ensureInit();
      const result = await HC.readRecords('HeartRate', {
        timeRangeFilter: { operator: 'between', startTime: startDate, endTime: endDate },
        ascending: true,
        limit: 500,
      });
      return result.records.flatMap((r: any) =>
        (r.samples || []).map((s: any) => ({
          value: s.beatsPerMinute,
          date: r.time,
          type: 'heart_rate' as const,
          unit: 'bpm',
        }))
      );
    },

    async readBloodPressure(startDate: string, endDate: string): Promise<BPHealthSample[]> {
      await ensureInit();
      const result = await HC.readRecords('BloodPressure', {
        timeRangeFilter: { operator: 'between', startTime: startDate, endTime: endDate },
        ascending: true,
        limit: 500,
      });
      return result.records.map((r: any) => ({
        systolic: r.systolic?.inMillimetersOfMercury ?? 0,
        diastolic: r.diastolic?.inMillimetersOfMercury ?? 0,
        date: r.time,
      }));
    },

    async readWeight(startDate: string, endDate: string): Promise<HealthVitalSample[]> {
      await ensureInit();
      const result = await HC.readRecords('Weight', {
        timeRangeFilter: { operator: 'between', startTime: startDate, endTime: endDate },
        ascending: true,
        limit: 500,
      });
      return result.records.map((r: any) => ({
        value: r.weight?.inKilograms ?? 0,
        date: r.time,
        type: 'weight' as const,
        unit: 'kg',
      }));
    },

    async readOxygenSaturation(_startDate: string, _endDate: string): Promise<HealthVitalSample[]> {
      return [];
    },

    async readSteps(startDate: string, endDate: string): Promise<HealthVitalSample[]> {
      await ensureInit();
      const result = await HC.aggregateGroupByDuration({
        recordType: 'Steps',
        timeRangeFilter: { operator: 'between', startTime: startDate, endTime: endDate },
        duration: 'DAILY',
      });
      return (result || []).map((r: any) => ({
        value: r.result?.count ?? 0,
        date: r.startTime,
        type: 'steps' as const,
        unit: 'count',
      }));
    },

    async writeHeartRate(value: number, date: string): Promise<boolean> {
      await ensureInit();
      const record = {
        recordType: 'HeartRate' as const,
        time: date,
        samples: [{ beatsPerMinute: value }],
      };
      await HC.insertRecords([record]);
      return true;
    },

    async writeBloodPressure(systolic: number, diastolic: number, date: string): Promise<boolean> {
      await ensureInit();
      const record = {
        recordType: 'BloodPressure' as const,
        time: date,
        systolic: { inMillimetersOfMercury: systolic },
        diastolic: { inMillimetersOfMercury: diastolic },
        bodyPosition: 2,
        measurementLocation: 3,
      };
      await HC.insertRecords([record]);
      return true;
    },

    async writeWeight(value: number, date: string): Promise<boolean> {
      await ensureInit();
      const record = {
        recordType: 'Weight' as const,
        time: date,
        weight: { inKilograms: value },
      };
      await HC.insertRecords([record]);
      return true;
    },

    async disconnect(): Promise<void> {
      try {
        await HC.revokeAllPermissions();
      } catch { console.warn('healthPlatform: revokeAllPermissions failed'); }
      initialized = false;
    },
  };
}

const TYPE_TO_HC: Record<string, string> = {
  heart_rate: 'HeartRate',
  blood_pressure: 'BloodPressure',
  weight: 'Weight',
  steps: 'Steps',
  oxygen_saturation: 'OxygenSaturation',
};

const HC_TO_TYPE: Record<string, string> = {
  HeartRate: 'heart_rate',
  BloodPressure: 'blood_pressure',
  Weight: 'weight',
  Steps: 'steps',
  OxygenSaturation: 'oxygen_saturation',
};

function typeToHC(type: string): string {
  return TYPE_TO_HC[type] || type;
}

function hcToType(hcType: string): string | null {
  return HC_TO_TYPE[hcType] || null;
}

// ----- Public API -----

let adapter: IHealthAdapter | null = null;

async function getAdapter(): Promise<IHealthAdapter | null> {
  if (!adapter) {
    adapter = createAdapter();
  }
  return adapter;
}

export async function isHealthAvailable(): Promise<boolean> {
  const a = await getAdapter();
  if (!a) return false;
  try {
    return await a.isAvailable();
  } catch {
    return false;
  }
}

export async function getPlatform(): Promise<'apple_health' | 'health_connect' | null> {
  if (Platform.OS === 'ios') return 'apple_health';
  if (Platform.OS === 'android') return 'health_connect';
  return null;
}

export async function requestHealthPermissions(permissions: HealthPermissions): Promise<boolean> {
  const a = await getAdapter();
  if (!a) return false;
  const permMap: PermissionMap = {
    heart_rate: permissions.heart_rate,
    blood_pressure: permissions.blood_pressure,
    weight: permissions.weight,
    oxygen_saturation: permissions.oxygen_saturation,
    steps: permissions.steps,
  };
  try {
    return await a.requestPermissions(permMap);
  } catch {
    return false;
  }
}

export async function getHealthPermissions(): Promise<HealthPermissions | null> {
  const a = await getAdapter();
  if (!a) return null;
  try {
    const granted = await a.getGrantedPermissions();
    return {
      heart_rate: granted.heart_rate ?? { read: false, write: false },
      blood_pressure: granted.blood_pressure ?? { read: false, write: false },
      weight: granted.weight ?? { read: false, write: false },
      oxygen_saturation: granted.oxygen_saturation ?? { read: false, write: false },
      steps: granted.steps ?? { read: false, write: false },
    };
  } catch {
    return null;
  }
}

export async function readHeartRate(startDate: string, endDate: string): Promise<HealthVitalSample[]> {
  const a = await getAdapter();
  if (!a) return [];
  try { return await a.readHeartRate(startDate, endDate); }
  catch { return []; }
}

export async function readBloodPressure(startDate: string, endDate: string): Promise<BPHealthSample[]> {
  const a = await getAdapter();
  if (!a) return [];
  try { return await a.readBloodPressure(startDate, endDate); }
  catch { return []; }
}

export async function readWeight(startDate: string, endDate: string): Promise<HealthVitalSample[]> {
  const a = await getAdapter();
  if (!a) return [];
  try { return await a.readWeight(startDate, endDate); }
  catch { return []; }
}

export async function readOxygenSaturation(startDate: string, endDate: string): Promise<HealthVitalSample[]> {
  const a = await getAdapter();
  if (!a) return [];
  try { return await a.readOxygenSaturation(startDate, endDate); }
  catch { return []; }
}

export async function readSteps(startDate: string, endDate: string): Promise<HealthVitalSample[]> {
  const a = await getAdapter();
  if (!a) return [];
  try { return await a.readSteps(startDate, endDate); }
  catch { return []; }
}

export async function writeHeartRate(value: number, date: string): Promise<boolean> {
  const a = await getAdapter();
  if (!a) return false;
  try { return await a.writeHeartRate(value, date); }
  catch { return false; }
}

export async function writeBloodPressure(systolic: number, diastolic: number, date: string): Promise<boolean> {
  const a = await getAdapter();
  if (!a) return false;
  try { return await a.writeBloodPressure(systolic, diastolic, date); }
  catch { return false; }
}

export async function writeWeight(value: number, date: string, unit?: string): Promise<boolean> {
  const a = await getAdapter();
  if (!a) return false;
  try { return await a.writeWeight(value, date, unit); }
  catch { return false; }
}

export async function disconnectHealth(): Promise<void> {
  const a = await getAdapter();
  if (!a) return;
  try { await a.disconnect(); }
  catch { console.warn('healthPlatform: disconnect failed'); }
}

export async function getConnectionStatus(): Promise<ConnectionStatus> {
  const a = await getAdapter();
  if (!a) return 'unavailable';
  try {
    const available = await a.isAvailable();
    if (!available) return 'unavailable';
    const perms = await a.getGrantedPermissions();
    const hasAny = Object.values(perms).some((p) => p?.read || p?.write);
    return hasAny ? 'connected' : 'not_connected';
  } catch {
    return 'unavailable';
  }
}
