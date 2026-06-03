import {
  insertSymptomEvent,
  insertRuleTriggers,
  saveEmergencyEvent,
  getSymptomEvents,
  getRuleTriggersForEvent,
  insertAlert,
  getActiveAlerts,
  getAllAlerts,
  resolveAlert,
} from '../../../db/queries/emergency';
import type { SymptomEventRow, RuleTriggerRow, AlertRow } from '../../../db/queries/emergency';

describe('emergency query module', () => {
  it('exports insertSymptomEvent as a function', () => {
    expect(typeof insertSymptomEvent).toBe('function');
  });

  it('exports insertRuleTriggers as a function', () => {
    expect(typeof insertRuleTriggers).toBe('function');
  });

  it('exports saveEmergencyEvent as a function', () => {
    expect(typeof saveEmergencyEvent).toBe('function');
  });

  it('exports getSymptomEvents as a function', () => {
    expect(typeof getSymptomEvents).toBe('function');
  });

  it('exports getRuleTriggersForEvent as a function', () => {
    expect(typeof getRuleTriggersForEvent).toBe('function');
  });

  it('exports insertAlert as a function', () => {
    expect(typeof insertAlert).toBe('function');
  });

  it('exports getActiveAlerts as a function', () => {
    expect(typeof getActiveAlerts).toBe('function');
  });

  it('exports getAllAlerts as a function', () => {
    expect(typeof getAllAlerts).toBe('function');
  });

  it('exports resolveAlert as a function', () => {
    expect(typeof resolveAlert).toBe('function');
  });

  it('exports AlertRow interface', () => {
    const alert: AlertRow = {
      id: 1,
      source: 'rule_engine',
      type: 'emergency',
      severity_level: 'EMERGENCY_NOW',
      title: 'Test Alert',
      message: 'Alert message',
      vitals_snapshot: null,
      symptom_event_id: null,
      vital_log_id: null,
      is_resolved: 0,
      resolved_at: null,
      created_at: '',
    };
    expect(alert.title).toBe('Test Alert');
  });

  it('exports SymptomEventRow interface', () => {
    const event: SymptomEventRow = {
      id: 1,
      occurred_at: '2026-01-01T10:00:00',
      sym_balance_loss: 0,
      sym_vision_change: 0,
      sym_face_droop: 0,
      sym_arm_weakness: 0,
      sym_speech_difficulty: 0,
      sym_chest_discomfort: 0,
      sym_upper_body_pain: 0,
      sym_shortness_breath: 0,
      sym_cold_sweat: 0,
      sym_nausea: 0,
      sym_lightheadedness: 0,
      sym_rapid_heartbeat: 0,
      sym_unconscious: 0,
      sym_not_breathing: 0,
      sym_severe_bleeding: 0,
      sym_anaphylaxis: 0,
      sym_fainting: 0,
      sym_seizure: 0,
      spo2_at_event: null,
      pulse_at_event: null,
      bp_sys_at_event: null,
      bp_dia_at_event: null,
      notes: null,
      created_at: '',
    };
    expect(event.id).toBe(1);
  });
});
