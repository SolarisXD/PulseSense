// PulseSense — Emergency Event Queries (symptom_events, rule_triggers, alerts)

import type { SQLiteDatabase } from 'expo-sqlite';
import type { SymptomInput, RuleResult } from '../../constants/rules';

export interface SymptomEventRow {
  id: number;
  occurred_at: string;
  sym_balance_loss: number;
  sym_vision_change: number;
  sym_face_droop: number;
  sym_arm_weakness: number;
  sym_speech_difficulty: number;
  sym_chest_discomfort: number;
  sym_upper_body_pain: number;
  sym_shortness_breath: number;
  sym_cold_sweat: number;
  sym_nausea: number;
  sym_lightheadedness: number;
  sym_rapid_heartbeat: number;
  sym_unconscious: number;
  sym_not_breathing: number;
  sym_severe_bleeding: number;
  sym_anaphylaxis: number;
  sym_fainting: number;
  sym_seizure: number;
  spo2_at_event: number | null;
  pulse_at_event: number | null;
  bp_sys_at_event: number | null;
  bp_dia_at_event: number | null;
  notes: string | null;
  created_at: string;
}

export interface RuleTriggerRow {
  id: number;
  symptom_event_id: number;
  rule_id: string;
  rule_category: string;
  severity_level: string;
  triggered_conditions: string;
  user_message: string;
  action_steps: string | null;
  triggered_at: string;
}

export interface AlertRow {
  id: number;
  source: string;
  type: string;
  severity_level: string;
  title: string;
  message: string;
  vitals_snapshot: string | null;
  symptom_event_id: number | null;
  vital_log_id: number | null;
  is_resolved: number;
  resolved_at: string | null;
  created_at: string;
}

export async function insertSymptomEvent(
  db: SQLiteDatabase,
  input: SymptomInput,
  occurredAt: string
): Promise<number> {
  const result = await db.runAsync(
    `INSERT INTO symptom_events (
      occurred_at,
      sym_balance_loss, sym_vision_change, sym_face_droop, sym_arm_weakness, sym_speech_difficulty,
      sym_chest_discomfort, sym_upper_body_pain, sym_shortness_breath, sym_cold_sweat,
      sym_nausea, sym_lightheadedness, sym_rapid_heartbeat,
      sym_unconscious, sym_not_breathing, sym_severe_bleeding, sym_anaphylaxis,
      sym_fainting, sym_seizure,
      spo2_at_event, pulse_at_event, bp_sys_at_event, bp_dia_at_event
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      occurredAt,
      input.balance_loss ? 1 : 0, input.vision_change ? 1 : 0,
      input.face_droop ? 1 : 0, input.arm_weakness ? 1 : 0, input.speech_difficulty ? 1 : 0,
      input.chest_discomfort ? 1 : 0, input.upper_body_pain ? 1 : 0,
      input.shortness_breath ? 1 : 0, input.cold_sweat ? 1 : 0,
      input.nausea ? 1 : 0, input.lightheadedness ? 1 : 0, input.rapid_heartbeat ? 1 : 0,
      input.unconscious ? 1 : 0, input.not_breathing ? 1 : 0,
      input.severe_bleeding ? 1 : 0, input.anaphylaxis ? 1 : 0,
      input.fainting ? 1 : 0, input.seizure ? 1 : 0,
      input.spo2 ?? null, input.pulse ?? null, input.bp_sys ?? null, input.bp_dia ?? null,
    ]
  );
  return result.lastInsertRowId;
}

export async function insertRuleTriggers(
  db: SQLiteDatabase,
  symptomEventId: number,
  results: RuleResult[]
): Promise<void> {
  for (const r of results) {
    await db.runAsync(
      `INSERT INTO rule_triggers (symptom_event_id, rule_id, rule_category, severity_level, triggered_conditions, user_message, action_steps)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        symptomEventId,
        r.ruleId,
        r.category,
        r.severity,
        JSON.stringify(r.triggeredBy),
        r.message,
        JSON.stringify(r.actionSteps),
      ]
    );
  }
}

export async function getSymptomEvents(db: SQLiteDatabase): Promise<SymptomEventRow[]> {
  const rows = await db.getAllAsync<SymptomEventRow>(
    'SELECT * FROM symptom_events ORDER BY occurred_at DESC LIMIT 50'
  );
  return rows;
}

export async function getRuleTriggersForEvent(
  db: SQLiteDatabase,
  eventId: number
): Promise<RuleTriggerRow[]> {
  const rows = await db.getAllAsync<RuleTriggerRow>(
    'SELECT * FROM rule_triggers WHERE symptom_event_id = ?',
    [eventId]
  );
  return rows;
}

// Alerts
export async function insertAlert(
  db: SQLiteDatabase,
  data: Omit<AlertRow, 'id' | 'created_at' | 'resolved_at' | 'is_resolved'>
): Promise<number> {
  const result = await db.runAsync(
    `INSERT INTO alerts (source, type, severity_level, title, message, vitals_snapshot, symptom_event_id, vital_log_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.source, data.type, data.severity_level, data.title, data.message,
      data.vitals_snapshot, data.symptom_event_id, data.vital_log_id,
    ]
  );
  return result.lastInsertRowId;
}

export async function getActiveAlerts(db: SQLiteDatabase): Promise<AlertRow[]> {
  const rows = await db.getAllAsync<AlertRow>(
    `SELECT * FROM alerts WHERE is_resolved = 0 ORDER BY created_at DESC`
  );
  return rows;
}

export async function getAllAlerts(db: SQLiteDatabase): Promise<AlertRow[]> {
  const rows = await db.getAllAsync<AlertRow>(
    'SELECT * FROM alerts ORDER BY created_at DESC LIMIT 100'
  );
  return rows;
}

export async function resolveAlert(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync(
    `UPDATE alerts SET is_resolved = 1, resolved_at = datetime('now') WHERE id = ?`,
    [id]
  );
}
