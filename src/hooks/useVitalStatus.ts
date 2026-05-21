// PulseSense — Vital Status Hook
// Provides real-time vital status for form inputs

import { useMemo } from 'react';
import {
  getBpStatus,
  getPulseStatus,
  getSpo2Status,
  getGlucoseStatus,
  getTempStatus,
  getPainStatus,
  statusToLabel,
  statusToColor,
  type VitalStatus,
} from '../utils/vitalStatus';

interface VitalStatusResult {
  status: VitalStatus;
  label: string;
  color: string;
}

export function useBpStatus(sys: number | null, dia: number | null): VitalStatusResult {
  return useMemo(() => {
    const status = getBpStatus(sys, dia);
    return { status, label: statusToLabel(status), color: statusToColor(status) };
  }, [sys, dia]);
}

export function usePulseStatus(bpm: number | null): VitalStatusResult {
  return useMemo(() => {
    const status = getPulseStatus(bpm);
    return { status, label: statusToLabel(status), color: statusToColor(status) };
  }, [bpm]);
}

export function useSpo2Status(spo2: number | null): VitalStatusResult {
  return useMemo(() => {
    const status = getSpo2Status(spo2);
    return { status, label: statusToLabel(status), color: statusToColor(status) };
  }, [spo2]);
}

export function useGlucoseStatus(value: number | null, context: string | null): VitalStatusResult {
  return useMemo(() => {
    const status = getGlucoseStatus(value, context);
    return { status, label: statusToLabel(status), color: statusToColor(status) };
  }, [value, context]);
}

export function useTempStatus(value: number | null): VitalStatusResult {
  return useMemo(() => {
    const status = getTempStatus(value);
    return { status, label: statusToLabel(status), color: statusToColor(status) };
  }, [value]);
}

export function usePainStatus(level: number | null): VitalStatusResult {
  return useMemo(() => {
    const status = getPainStatus(level);
    return { status, label: statusToLabel(status), color: statusToColor(status) };
  }, [level]);
}
