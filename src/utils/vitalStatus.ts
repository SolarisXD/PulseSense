// PulseSense — Vital Status Threshold Checker
// Returns 'normal' | 'warning' | 'danger' based on adult reference ranges

export type VitalStatus = 'normal' | 'warning' | 'danger' | 'unknown';

export function getBpStatus(sys: number | null, dia: number | null): VitalStatus {
  if (sys === null || dia === null) return 'unknown';
  if (sys >= 140 || dia >= 90 || sys < 80 || dia < 60) return 'danger';
  if (sys >= 121 || dia >= 81 || sys < 90) return 'warning';
  return 'normal';
}

export function getPulseStatus(bpm: number | null): VitalStatus {
  if (bpm === null) return 'unknown';
  if (bpm > 120 || bpm < 50) return 'danger';
  if (bpm > 100 || bpm < 60) return 'warning';
  return 'normal';
}

export function getSpo2Status(spo2: number | null): VitalStatus {
  if (spo2 === null) return 'unknown';
  if (spo2 < 90) return 'danger';
  if (spo2 < 95) return 'warning';
  return 'normal';
}

export function getGlucoseStatus(value: number | null, context: string | null): VitalStatus {
  if (value === null) return 'unknown';
  // Fasting reference ranges
  if (context === 'fasting') {
    if (value > 200 || value < 60) return 'danger';
    if (value >= 100 || value <= 69) return 'warning';
    return 'normal';
  }
  // Random / post-meal
  if (value > 200 || value < 60) return 'danger';
  if (value >= 140 || value <= 69) return 'warning';
  return 'normal';
}

export function getTempStatus(value: number | null): VitalStatus {
  if (value === null) return 'unknown';
  if (value > 38.0 || value < 35.5) return 'danger';
  if (value > 37.2 || value < 36.1) return 'warning';
  return 'normal';
}

export function getPainStatus(level: number | null): VitalStatus {
  if (level === null) return 'unknown';
  if (level >= 7) return 'danger';
  if (level >= 4) return 'warning';
  return 'normal';
}

export function statusToColor(status: VitalStatus): string {
  switch (status) {
    case 'normal':
      return 'success';
    case 'warning':
      return 'warning';
    case 'danger':
      return 'danger';
    default:
      return 'textSecondary';
  }
}

export function statusToLabel(status: VitalStatus): string {
  switch (status) {
    case 'normal':
      return 'Normal';
    case 'warning':
      return 'Borderline';
    case 'danger':
      return 'High/Low';
    default:
      return 'Unknown';
  }
}

export function getCustomVitalStatus(
  value: number,
  normalMin: number | null,
  normalMax: number | null
): VitalStatus {
  if (normalMin === null && normalMax === null) return 'normal';
  if (normalMin !== null && value < normalMin) return 'danger';
  if (normalMax !== null && value > normalMax) return 'danger';
  return 'normal';
}
