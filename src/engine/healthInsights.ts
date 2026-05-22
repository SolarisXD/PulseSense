// PulseSense — Health Insights Engine
// Analyzes vital logs for trends and generates natural-language insight messages
// Pure TypeScript — no external dependencies, no side effects

import type { VitalLogRow } from '../db/queries/vitals';

export interface HealthInsight {
  id: string;
  type: 'warning' | 'info' | 'positive';
  icon: string;
  title: string;
  message: string;
  vitalType: string;
  severity: 'low' | 'medium' | 'high';
}

// ── Threshold Constants ──────────────────────────────────────────────────────

const BP_ELEVATED_SYS = 130;
const BP_DROP_THRESHOLD = 20;
const PULSE_ELEVATED = 100;
const SPO2_LOW = 95;
const GLUCOSE_RANDOM_HIGH = 140;
const GLUCOSE_FASTING_HIGH = 100;
const WEIGHT_CHANGE_THRESHOLD = 2;
const NO_VITALS_DAYS = 7;
const BP_CONSECUTIVE_COUNT = 3;
const PULSE_CONSECUTIVE_COUNT = 2;

// ── Helpers ──────────────────────────────────────────────────────────────────

let _idCounter = 0;

function nextId(): string {
  _idCounter += 1;
  return `hi-${Date.now()}-${_idCounter}`;
}

/** Sort vitals oldest → newest for trend analysis */
function toChronological(vitals: VitalLogRow[]): VitalLogRow[] {
  return [...vitals].sort((a, b) => {
    const ta = new Date(a.logged_at_iso).getTime();
    const tb = new Date(b.logged_at_iso).getTime();
    if (isNaN(ta)) return 1;
    if (isNaN(tb)) return -1;
    return ta - tb;
  });
}

/** Calculate whole days elapsed since an ISO date string */
function daysSince(isoDate: string): number {
  const ms = Date.now() - new Date(isoDate).getTime();
  return isNaN(ms) ? Infinity : ms / (1000 * 60 * 60 * 24);
}

/** Check if a value is non-null */
function isPresent(val: number | null | undefined): val is number {
  return val !== null && val !== undefined;
}

// ── Detection Functions ──────────────────────────────────────────────────────

interface DetectionResult {
  type: 'warning' | 'info' | 'positive';
  icon: string;
  title: string;
  message: string;
  vitalType: string;
  severity: 'low' | 'medium' | 'high';
}

function detectBpElevationTrend(chrono: VitalLogRow[]): DetectionResult | null {
  const readings = chrono.filter((r) => isPresent(r.bp_sys));
  if (readings.length < BP_CONSECUTIVE_COUNT) return null;

  // Check the most recent BP_CONSECUTIVE_COUNT readings
  const lastN = readings.slice(-BP_CONSECUTIVE_COUNT);
  const allElevated = lastN.every((r) => (r.bp_sys as number) >= BP_ELEVATED_SYS);

  if (!allElevated) return null;

  return {
    type: 'warning',
    icon: 'trending-up',
    title: 'Elevated Blood Pressure',
    message: `Your BP has been elevated (≥${BP_ELEVATED_SYS} systolic) for the last ${BP_CONSECUTIVE_COUNT} readings. Consider monitoring closely and consulting your doctor.`,
    vitalType: 'bp',
    severity: 'high',
  };
}

function detectBpDropTrend(chrono: VitalLogRow[]): DetectionResult | null {
  const readings = chrono.filter((r) => isPresent(r.bp_sys));
  if (readings.length < 2) return null;

  const latest = readings[readings.length - 1];
  const previous = readings[readings.length - 2];
  const drop = (previous.bp_sys as number) - (latest.bp_sys as number);

  if (drop < BP_DROP_THRESHOLD) return null;

  return {
    type: 'warning',
    icon: 'trending-down',
    title: 'Blood Pressure Drop',
    message: `Your systolic BP dropped by ${Math.round(drop)} points since your last reading. If you feel dizzy or lightheaded, seek medical advice.`,
    vitalType: 'bp',
    severity: 'high',
  };
}

function detectPulseElevationTrend(chrono: VitalLogRow[]): DetectionResult | null {
  const readings = chrono.filter((r) => isPresent(r.pulse));
  if (readings.length < PULSE_CONSECUTIVE_COUNT) return null;

  const lastN = readings.slice(-PULSE_CONSECUTIVE_COUNT);
  const allElevated = lastN.every((r) => (r.pulse as number) > PULSE_ELEVATED);

  if (!allElevated) return null;

  return {
    type: 'warning',
    icon: 'heart',
    title: 'Elevated Heart Rate',
    message: `Your resting pulse has been above ${PULSE_ELEVATED} bpm for the last ${PULSE_CONSECUTIVE_COUNT} readings. Monitor closely and stay hydrated.`,
    vitalType: 'pulse',
    severity: 'medium',
  };
}

function detectSpo2Concern(chrono: VitalLogRow[]): DetectionResult | null {
  const readings = chrono.filter((r) => isPresent(r.spo2));
  if (readings.length === 0) return null;

  const latest = readings[readings.length - 1];
  const spo2 = latest.spo2 as number;

  if (spo2 >= SPO2_LOW) return null;

  return {
    type: 'warning',
    icon: 'analytics',
    title: 'Low Oxygen Level',
    message: `Your latest SpO₂ reading is ${spo2}%, which is below the normal range (≥95%). Rest and recheck in 10 minutes.`,
    vitalType: 'spo2',
    severity: 'high',
  };
}

function detectGlucosePattern(chrono: VitalLogRow[]): DetectionResult | null {
  const readings = chrono.filter((r) => isPresent(r.glucose_value));
  if (readings.length === 0) return null;

  const latest = readings[readings.length - 1];
  const value = latest.glucose_value as number;
  const context = latest.glucose_context;

  if (context === 'fasting' && value > GLUCOSE_FASTING_HIGH) {
    return {
      type: 'warning',
      icon: 'water',
      title: 'Elevated Fasting Glucose',
      message: `Your fasting glucose is ${value} mg/dL — above the normal threshold (${GLUCOSE_FASTING_HIGH} mg/dL). Consider reviewing your diet and consulting your doctor.`,
      vitalType: 'glucose',
      severity: 'medium',
    };
  }

  if (context !== 'fasting' && value > GLUCOSE_RANDOM_HIGH) {
    return {
      type: 'info',
      icon: 'water',
      title: 'Elevated Glucose Reading',
      message: `Your glucose is ${value} mg/dL, which is above ${GLUCOSE_RANDOM_HIGH} mg/dL. Monitor your levels and stay hydrated.`,
      vitalType: 'glucose',
      severity: 'low',
    };
  }

  return null;
}

function detectWeightChange(chrono: VitalLogRow[]): DetectionResult | null {
  const readings = chrono.filter((r) => isPresent(r.weight_value));
  if (readings.length < 2) return null;

  const latest = readings[readings.length - 1];
  const previous = readings[readings.length - 2];
  const diff = (latest.weight_value as number) - (previous.weight_value as number);
  const absDiff = Math.abs(diff);

  if (absDiff < WEIGHT_CHANGE_THRESHOLD) return null;

  const message =
    diff > 0
      ? `Your weight has increased by ${absDiff.toFixed(1)} kg since your last reading.`
      : `Your weight has decreased by ${absDiff.toFixed(1)} kg since your last reading.`;

  return {
    type: 'info',
    icon: 'scale-outline',
    title: 'Weight Change Detected',
    message,
    vitalType: 'weight',
    severity: absDiff >= 3 ? 'medium' : 'low',
  };
}

function detectNoRecentVitals(chrono: VitalLogRow[]): DetectionResult | null {
  if (chrono.length === 0) return null;

  const latest = chrono[chrono.length - 1];
  const elapsed = daysSince(latest.logged_at_iso);

  if (elapsed < NO_VITALS_DAYS) return null;

  const daysAgo = Math.floor(elapsed);

  return {
    type: 'info',
    icon: 'alert-circle-outline',
    title: 'No Recent Vitals',
    message: `It's been ${daysAgo} day${daysAgo === 1 ? '' : 's'} since your last vital log. Try to log at least once daily for better trend tracking.`,
    vitalType: 'general',
    severity: 'low',
  };
}

function detectConsistentReadings(
  chrono: VitalLogRow[],
  hasWarnings: boolean
): DetectionResult | null {
  if (chrono.length === 0) return null;
  if (hasWarnings) return null;

  // Only fire if vitals span at least 2 days (meaningful consistency)
  const first = chrono[0];
  const last = chrono[chrono.length - 1];
  const span = daysSince(first.logged_at_iso) - daysSince(last.logged_at_iso);

  if (span < 1) return null;

  return {
    type: 'positive',
    icon: 'checkmark-circle',
    title: 'All Vitals Normal',
    message: 'All vitals are in normal range. Great job! Keep up the good habits.',
    vitalType: 'general',
    severity: 'low',
  };
}

// ── Public API ───────────────────────────────────────────────────────────────

export function generateInsights(vitals: VitalLogRow[]): HealthInsight[] {
  if (vitals.length === 0) {
    return [
      {
        id: nextId(),
        type: 'info',
        icon: 'information-circle-outline',
        title: 'No Vitals Logged',
        message: 'Start logging your vitals to receive personalized health insights and trend detection.',
        vitalType: 'general',
        severity: 'low',
      },
    ];
  }

  const chrono = toChronological(vitals);
  const detections: DetectionResult[] = [];

  // Run each detector; null = no insight triggered
  const checks: Array<DetectionResult | null> = [
    detectBpElevationTrend(chrono),
    detectBpDropTrend(chrono),
    detectPulseElevationTrend(chrono),
    detectSpo2Concern(chrono),
    detectGlucosePattern(chrono),
    detectWeightChange(chrono),
    detectNoRecentVitals(chrono),
  ];

  for (const result of checks) {
    if (result !== null) detections.push(result);
  }

  const hasWarnings = detections.some((d) => d.type === 'warning');
  const consistent = detectConsistentReadings(chrono, hasWarnings);
  if (consistent !== null) detections.push(consistent);

  return detections.map((d) => ({
    ...d,
    id: nextId(),
  }));
}
