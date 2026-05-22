import type { VitalLogRow } from '../db/queries/vitals';
import {
  getBpStatus, getPulseStatus, getSpo2Status,
  getGlucoseStatus, getTempStatus, getPainStatus,
  type VitalStatus,
} from './vitalStatus';

export const VITAL_TYPE_KEYS = ['bp', 'pulse', 'spo2', 'glucose', 'temp', 'weight', 'pain'] as const;
export type VitalTypeKey = typeof VITAL_TYPE_KEYS[number];

export interface VitalCell {
  value: string;
  status: VitalStatus;
}

export function formatVitalCell(type: string, row: VitalLogRow): VitalCell {
  switch (type) {
    case 'bp':
      return {
        value: row.bp_sys != null && row.bp_dia != null ? `${row.bp_sys}/${row.bp_dia}` : '-',
        status: row.bp_sys != null ? getBpStatus(row.bp_sys, row.bp_dia) : 'unknown',
      };
    case 'pulse':
      return {
        value: row.pulse != null ? `${row.pulse} bpm` : '-',
        status: row.pulse != null ? getPulseStatus(row.pulse) : 'unknown',
      };
    case 'spo2':
      return {
        value: row.spo2 != null ? `${row.spo2}%` : '-',
        status: row.spo2 != null ? getSpo2Status(row.spo2) : 'unknown',
      };
    case 'glucose':
      return {
        value: row.glucose_value != null ? `${row.glucose_value} ${row.glucose_unit || 'mg/dL'}` : '-',
        status: row.glucose_value != null ? getGlucoseStatus(row.glucose_value, row.glucose_context) : 'unknown',
      };
    case 'temp':
      return {
        value: row.temp_value != null ? `${row.temp_value}°${row.temp_unit || 'C'}` : '-',
        status: row.temp_value != null ? getTempStatus(row.temp_value) : 'unknown',
      };
    case 'weight':
      return {
        value: row.weight_value != null ? `${row.weight_value} ${row.weight_unit || 'kg'}` : '-',
        status: 'normal' as VitalStatus,
      };
    case 'pain':
      return {
        value: row.pain_level != null ? `${row.pain_level}/10` : '-',
        status: row.pain_level != null ? getPainStatus(row.pain_level) : 'unknown',
      };
    default:
      return { value: '-', status: 'unknown' };
  }
}

export function formatVitalRawValue(type: string, row: VitalLogRow): string | null {
  switch (type) {
    case 'bp': return row.bp_sys ? `${row.bp_sys}/${row.bp_dia}` : null;
    case 'pulse': return row.pulse != null ? String(row.pulse) : null;
    case 'spo2': return row.spo2 != null ? `${row.spo2}%` : null;
    case 'glucose': return row.glucose_value != null ? `${row.glucose_value} ${row.glucose_unit || 'mg/dL'}${row.glucose_context ? ` (${row.glucose_context})` : ''}` : null;
    case 'temp': return row.temp_value != null ? `${row.temp_value}°${row.temp_unit || 'C'}` : null;
    case 'weight': return row.weight_value != null ? `${row.weight_value} ${row.weight_unit || 'kg'}` : null;
    case 'pain': return row.pain_level != null ? `${row.pain_level}/10` : null;
    default: return null;
  }
}

export function formatVitalHtmlCell(type: string, row: {
  bp_sys?: number | null; bp_dia?: number | null;
  pulse?: number | null; spo2?: number | null;
  glucose_value?: number | null; glucose_unit?: string; glucose_context?: string | null;
  temp_value?: number | null; temp_unit?: string;
  weight_value?: number | null; weight_unit?: string;
  pain_level?: number | null; pain_location?: string | null;
}): string {
  switch (type) {
    case 'bp': return row.bp_sys ? `${row.bp_sys}/${row.bp_dia} mmHg` : '-';
    case 'pulse': return row.pulse != null ? `${row.pulse} bpm` : '-';
    case 'spo2': return row.spo2 != null ? `${row.spo2}%` : '-';
    case 'glucose': return row.glucose_value != null ? `${row.glucose_value} ${row.glucose_unit || 'mg/dL'}${row.glucose_context ? ` (${row.glucose_context})` : ''}` : '-';
    case 'temp': return row.temp_value != null ? `${row.temp_value}°${row.temp_unit || 'C'}` : '-';
    case 'weight': return row.weight_value != null ? `${row.weight_value} ${row.weight_unit || 'kg'}` : '-';
    case 'pain': return row.pain_level != null ? `${row.pain_level}/10 ${row.pain_location || ''}` : '-';
    default: return '-';
  }
}

export const VITAL_LABELS: Record<string, string> = {
  bp: 'BP',
  pulse: 'Pulse',
  spo2: 'SpO2',
  glucose: 'Glucose',
  temp: 'Temp',
  weight: 'Weight',
  pain: 'Pain',
};

export const VITAL_HEADERS: Record<string, string> = {
  bp: 'BP (mmHg)',
  pulse: 'Pulse (bpm)',
  spo2: 'SpO2 (%)',
  glucose: 'Glucose',
  temp: 'Temp',
  weight: 'Weight',
  pain: 'Pain',
};

export const VITAL_ICONS = {
  bp: 'heart-half',
  pulse: 'pulse',
  spo2: 'analytics-outline',
  glucose: 'water-outline',
  temp: 'thermometer-outline',
  weight: 'scale-outline',
  pain: 'bandage-outline',
} as const;

export interface VitalConfigItem {
  key: string;
  label: string;
  icon: string;
  header: string;
}

export const VITAL_CONFIG: VitalConfigItem[] = VITAL_TYPE_KEYS.map((key) => ({
  key,
  label: VITAL_LABELS[key],
  icon: VITAL_ICONS[key],
  header: VITAL_HEADERS[key],
}));
