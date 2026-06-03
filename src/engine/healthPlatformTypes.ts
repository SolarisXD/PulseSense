export type HealthVitalType = 'heart_rate' | 'blood_pressure' | 'weight' | 'oxygen_saturation' | 'steps';

export type HealthPlatform = 'apple_health' | 'health_connect';

export type ConnectionStatus = 'unavailable' | 'not_connected' | 'connected';

export interface HealthVitalSample {
  value: number;
  date: string;
  type: HealthVitalType;
  unit: string;
}

export interface BPHealthSample {
  systolic: number;
  diastolic: number;
  date: string;
}

export interface SyncMetadata {
  lastImportAt: string | null;
  lastExportAt: string | null;
  importCount: number;
  exportCount: number;
}

export interface HealthPermission {
  read: boolean;
  write: boolean;
}

export interface HealthPermissions {
  heart_rate: HealthPermission;
  blood_pressure: HealthPermission;
  weight: HealthPermission;
  oxygen_saturation: HealthPermission;
  steps: HealthPermission;
}

// @unused
export type SyncDirection = 'import' | 'export';

// @unused
export interface SyncResult {
  direction: SyncDirection;
  vitalLogsCreated: number;
  healthRecordsWritten: number;
  completedAt: string;
}
