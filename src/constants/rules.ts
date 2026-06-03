// PulseSense — Emergency Rule Definitions
// Each rule maps to a specific emergency pathway

export type SeverityLevel = 'EMERGENCY_NOW' | 'URGENT_SAME_DAY' | 'MONITOR_CLOSELY' | 'LOG_ONLY';

export interface SymptomInput {
  // Stroke / BEFAST
  balance_loss?: boolean;
  vision_change?: boolean;
  face_droop?: boolean;
  arm_weakness?: boolean;
  speech_difficulty?: boolean;

  // Heart Attack
  chest_discomfort?: boolean;
  upper_body_pain?: boolean;
  shortness_breath?: boolean;
  cold_sweat?: boolean;
  nausea?: boolean;
  lightheadedness?: boolean;
  rapid_heartbeat?: boolean;

  // Critical
  unconscious?: boolean;
  not_breathing?: boolean;
  severe_bleeding?: boolean;
  anaphylaxis?: boolean;

  // Other
  fainting?: boolean;
  seizure?: boolean;

  // Vitals
  spo2?: number;
  pulse?: number;
  bp_sys?: number;
  bp_dia?: number;
}

export interface RuleResult {
  severity: SeverityLevel;
  ruleId: string;
  category: string;
  message: string;
  triggeredBy: string[];
  actionSteps: string[];
  isHardOverride: boolean;
  evidenceNote: string;
}

export const SEVERITY_ORDER: Record<SeverityLevel, number> = {
  EMERGENCY_NOW: 0,
  URGENT_SAME_DAY: 1,
  MONITOR_CLOSELY: 2,
  LOG_ONLY: 3,
};


