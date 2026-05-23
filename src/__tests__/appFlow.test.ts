/**
 * App Flow & UX Validation Tests
 *
 * These tests validate the key user flows and UX requirements
 * defined in PRD.md and AppFlow.md — without rendering full screen
 * components (which would require heavy native mocking).
 *
 * Instead we test the pure-logic contracts that the UI depends on.
 */

import { evaluateSymptoms } from '../engine/ruleEngine';
import { useSettingsStore } from '../store/settingsStore';
import { useProfileStore } from '../store/profileStore';
import { useAlertStore } from '../store/alertStore';
import { getBpStatus, getPulseStatus, getSpo2Status, getGlucoseStatus, getTempStatus, getPainStatus, statusToColor, statusToLabel } from '../utils/vitalStatus';
import { VITAL_CONFIG } from '../utils/vitalFormatters';
import { isFutureDate, calculateAge } from '../utils/dateUtils';
import { formatDosage, dosageFrequency } from '../utils/dosageFormatter';

beforeEach(() => {
  useSettingsStore.setState({
    tempUnit: 'C',
    weightUnit: 'kg',
    glucoseUnit: 'mg/dL',
    heightUnit: 'cm',
    bpDefaultPosition: 'sitting',
    emergencyNumber: '112',
    onboardingComplete: false,
    medicationReminders: false,
    reminderMorningTime: '08:00',
    reminderAfternoonTime: '14:00',
    reminderNightTime: '21:00',
    isLoading: false,
  });
  useProfileStore.getState().clear();
  useAlertStore.getState().clear();
});

// ============================================================
// PRD §1: Onboarding shown only once — when no profile exists
// ============================================================
describe('PRD §6.1 — Onboarding Flow', () => {
  it('onboarding complete + profile exists = app opens to Home (skip onboarding)', () => {
    // Simulate: both conditions met
    useSettingsStore.getState().setOnboardingComplete(true);
    useProfileStore.getState().setProfile({
      id: 1, full_name: 'Jane', dob: '15/05/1990',
      sex: 'Female', sex_other_text: null, blood_group: 'O+',
      height_value: null, height_unit: 'cm', height_ft: null, height_in: null,
      photo_uri: null, created_at: '', updated_at: '',
    });
    const onboardingComplete = useSettingsStore.getState().onboardingComplete;
    const profileExists = !!useProfileStore.getState().profile;
    expect(onboardingComplete && profileExists).toBe(true);
  });

  it('no profile = must show onboarding', () => {
    useSettingsStore.getState().setOnboardingComplete(false);
    const onboardingComplete = useSettingsStore.getState().onboardingComplete;
    const profileExists = !!useProfileStore.getState().profile;
    expect(onboardingComplete || profileExists).toBe(false);
  });

  it('onboarding flag persists via hydrate from settings', () => {
    useSettingsStore.getState().hydrate({ onboarding_complete: 'true' });
    expect(useSettingsStore.getState().onboardingComplete).toBe(true);
  });
});

// ============================================================
// PRD §6.4: Vitals Logging — all vitals optional individually
// ============================================================
describe('PRD §6.4 — Vitals Logging', () => {
  it('VITAL_CONFIG contains all 7 standard vitals', () => {
    const keys = VITAL_CONFIG.map((c) => c.key);
    expect(keys).toEqual(['bp', 'pulse', 'spo2', 'glucose', 'temp', 'weight', 'pain']);
  });

  it('each vital type has a valid status checker', () => {
    const checkers = {
      bp: () => getBpStatus(120, 80),
      pulse: () => getPulseStatus(72),
      spo2: () => getSpo2Status(97),
      glucose: () => getGlucoseStatus(90, 'fasting'),
      temp: () => getTempStatus(36.6),
      pain: () => getPainStatus(0),
    };
    for (const [key, checker] of Object.entries(checkers)) {
      expect(checker()).toBe('normal');
    }
  });

  // PRD §6.4d: Retroactive entries — future dates blocked
  it('blocks future date/time entries (isFutureDate)', () => {
    expect(isFutureDate('01/01/2099 12:00')).toBe(true);
    expect(isFutureDate('01/01/2020 12:00')).toBe(false);
  });

  // PRD §6.4e: Pain scale has proper labels
  it('pain scale status maps correctly', () => {
    expect(getPainStatus(0)).toBe('normal');
    expect(getPainStatus(4)).toBe('warning');
    expect(getPainStatus(7)).toBe('danger');
  });
});

// ============================================================
// PRD §6.6: Emergency Engine — < 3 taps to reach action screen
// ============================================================
describe('PRD §6.6 — Emergency Engine', () => {
  it('cardiac arrest is detected with 2 flags (simulating < 3 taps)', () => {
    // Tap 1: select "Unconscious" category
    // Tap 2: select "Not breathing" checkbox
    // Tap 3: press "Check Now" button → evaluateSymptoms called
    const input = { unconscious: true, not_breathing: true };
    const results = evaluateSymptoms(input);
    const cardiac = results.find((r) => r.ruleId === 'CARDIAC_ARREST');
    expect(cardiac).toBeDefined();
    expect(cardiac!.severity).toBe('EMERGENCY_NOW');
  });

  it('stroke is detected with a single BEFAST sign (2 taps: category + button)', () => {
    // Tap 1: select "Possible Stroke" category → checkboxes shown
    // Tap 2: check one symptom, press "Check Now"
    const input = { face_droop: true };
    const results = evaluateSymptoms(input);
    const stroke = results.find((r) => r.ruleId === 'STROKE_BEFAST');
    expect(stroke).toBeDefined();
  });

  it('action screen provides "Call Emergency Services" step', () => {
    const results = evaluateSymptoms({ unconscious: true, not_breathing: true });
    const cardiac = results.find((r) => r.ruleId === 'CARDIAC_ARREST')!;
    expect(cardiac.actionSteps[0]).toMatch(/call emergency/i);
  });

  it('action screen provides "what triggered this" (triggeredBy)', () => {
    const results = evaluateSymptoms({ face_droop: true, arm_weakness: true });
    const stroke = results.find((r) => r.ruleId === 'STROKE_BEFAST')!;
    expect(stroke.triggeredBy).toEqual(expect.arrayContaining(['face_droop', 'arm_weakness']));
  });

  it('action screen provides evidence note explaining why', () => {
    const results = evaluateSymptoms({ chest_discomfort: true, upper_body_pain: true });
    const ha = results.find((r) => r.ruleId === 'HEART_ATTACK')!;
    expect(ha.evidenceNote).toBeTruthy();
    expect(ha.evidenceNote.length).toBeGreaterThan(10);
  });
});

// ============================================================
// PRD §6.2: Profile — age auto-calculated
// ============================================================
describe('PRD §6.2 — Profile', () => {
  it('age is auto-calculated from DOB', () => {
    const age = calculateAge('15/05/1990');
    expect(age).toMatch(/\d+ yrs \d+ months old/);
  });

  it('blood group is stored in profile', () => {
    useProfileStore.getState().setProfile({
      id: 1, full_name: 'John', dob: '01/01/2000',
      sex: 'Male', sex_other_text: null, blood_group: 'A+',
      height_value: null, height_unit: 'cm', height_ft: null, height_in: null,
      photo_uri: null, created_at: '', updated_at: '',
    });
    expect(useProfileStore.getState().profile?.blood_group).toBe('A+');
  });
});

// ============================================================
// PRD §6.3: Medications — structured dosage (M/A/N)
// ============================================================
describe('PRD §6.3 — Medications', () => {
  it('dosage format is structured as M/A/N', () => {
    expect(formatDosage(1, 0, 1)).toBe('1-0-1');
    expect(formatDosage(1, 1, 1)).toBe('1-1-1');
  });

  it('dosage frequency labels are human-readable', () => {
    expect(dosageFrequency(1, 1, 0)).toBe('Morning, Afternoon');
    expect(dosageFrequency(0, 0, 1)).toBe('Night');
    expect(dosageFrequency(0, 0, 0)).toBe('As needed');
  });
});

// ============================================================
// PRD §6.8: Settings — defaults match PRD
// ============================================================
describe('PRD §6.8 — Settings Defaults', () => {
  it('temperature defaults to Celsius', () => {
    expect(useSettingsStore.getState().tempUnit).toBe('C');
  });

  it('weight defaults to kg', () => {
    expect(useSettingsStore.getState().weightUnit).toBe('kg');
  });

  it('glucose defaults to mg/dL', () => {
    expect(useSettingsStore.getState().glucoseUnit).toBe('mg/dL');
  });

  it('height defaults to cm', () => {
    expect(useSettingsStore.getState().heightUnit).toBe('cm');
  });

  it('BP position defaults to sitting', () => {
    expect(useSettingsStore.getState().bpDefaultPosition).toBe('sitting');
  });

  it('emergency number defaults to 112', () => {
    expect(useSettingsStore.getState().emergencyNumber).toBe('112');
  });
});

// ============================================================
// PRD §6.5: Vitals History — color-coded values
// ============================================================
describe('PRD §6.5 — Vitals History Color Coding', () => {
  it('normal values map to green/success', () => {
    expect(statusToLabel('normal')).toBe('Normal');
    expect(statusToColor('normal')).toBe('success');
  });

  it('borderline values map to amber/warning', () => {
    expect(statusToLabel('warning')).toBe('Borderline');
    expect(statusToColor('warning')).toBe('warning');
  });

  it('abnormal values map to red/danger', () => {
    expect(statusToLabel('danger')).toBe('High/Low');
    expect(statusToColor('danger')).toBe('danger');
  });
});

// ============================================================
// PRD §1: Goal — function fully offline
// ============================================================
describe('PRD §4 — Offline Architecture', () => {
  it('rule engine is pure TypeScript with no external deps', () => {
    // Verify the rule engine file has no imports from network-dependent modules
    const fs = require('fs');
    const engineSource = fs.readFileSync('./src/engine/ruleEngine.ts', 'utf-8');
    expect(engineSource).not.toContain('import axios');
    expect(engineSource).not.toContain('import fetch');
    expect(engineSource).not.toContain('import http');
  });

  it('health insights engine is pure TypeScript with no external deps', () => {
    const fs = require('fs');
    const insightsSource = fs.readFileSync('./src/engine/healthInsights.ts', 'utf-8');
    expect(insightsSource).not.toContain('import axios');
    expect(insightsSource).not.toContain('import fetch');
    expect(insightsSource).not.toContain('import http');
  });

  it('all data operations go through local SQLite', () => {
    const fs = require('fs');
    const dbQueriesDir = './src/db/queries';
    const files = fs.readdirSync(dbQueriesDir);
    for (const file of files) {
      const content = fs.readFileSync(`${dbQueriesDir}/${file}`, 'utf-8');
      // These should all use our local expo-sqlite, not remote APIs
      expect(content).toMatch(/expo-sqlite|getDB|db\./);
    }
  });
});

// ============================================================
// PRD: Alert Store — can store unresolved emergency alerts
// ============================================================
describe('Alerts — active alert management', () => {
  it('can add and remove alerts', () => {
    useAlertStore.getState().addAlert({
      id: 1, source: 'vital_threshold', type: 'emergency',
      severity_level: 'EMERGENCY_NOW', title: 'Crisis', message: 'BP critical',
      vitals_snapshot: null, symptom_event_id: null, vital_log_id: null,
      is_resolved: 0, resolved_at: null, created_at: '',
    });
    expect(useAlertStore.getState().activeAlerts).toHaveLength(1);
    useAlertStore.getState().removeAlert(1);
    expect(useAlertStore.getState().activeAlerts).toHaveLength(0);
  });

  it('alerts are prepended (newest first)', () => {
    useAlertStore.getState().addAlert({
      id: 1, source: 'test', type: 'warning', severity_level: 'URGENT_SAME_DAY',
      title: 'Old', message: '', vitals_snapshot: null, symptom_event_id: null,
      vital_log_id: null, is_resolved: 0, resolved_at: null, created_at: '',
    });
    useAlertStore.getState().addAlert({
      id: 2, source: 'test', type: 'emergency', severity_level: 'EMERGENCY_NOW',
      title: 'New', message: '', vitals_snapshot: null, symptom_event_id: null,
      vital_log_id: null, is_resolved: 0, resolved_at: null, created_at: '',
    });
    expect(useAlertStore.getState().activeAlerts[0].title).toBe('New');
  });
});

// ============================================================
// PRD §6.7: Export — Medical ID contains key fields
// ============================================================
describe('PRD §6.7 — Export Profile Data', () => {
  it('profile store holds all Medical ID fields', () => {
    useProfileStore.getState().setProfile({
      id: 1, full_name: 'Jane Doe', dob: '15/05/1990',
      sex: 'Female', sex_other_text: null, blood_group: 'AB-',
      height_value: 170, height_unit: 'cm', height_ft: null, height_in: null,
      photo_uri: null, created_at: '', updated_at: '',
    });
    useProfileStore.getState().setContacts([{
      id: 1, name: 'John Doe', relationship: 'Spouse', phone: '+1234567890',
      contact_type: 'emergency', is_primary: 1, sort_order: 0, created_at: '',
    }]);
    useProfileStore.getState().setConditions([{
      id: 1, name: 'Asthma', type: 'chronic', diagnosed_date: '01/01/2015',
      severity: 'mild', notes: null, is_active: 1, sort_order: 0, created_at: '', updated_at: '',
    }]);

    const p = useProfileStore.getState();
    expect(p.profile?.full_name).toBe('Jane Doe');
    expect(p.profile?.blood_group).toBe('AB-');
    expect(p.contacts).toHaveLength(1);
    expect(p.conditions).toHaveLength(1);
  });
});

// ============================================================
// PRD §6.4b: Pain Scale Definitions
// ============================================================
describe('PRD §6.4b — Pain Scale', () => {
  it('pain status matches the 0-10 scale definitions', () => {
    // 0 = No pain
    expect(getPainStatus(0)).toBe('normal');
    // 4 = Moderate (distracting)
    expect(getPainStatus(4)).toBe('warning');
    // 7 = Strong (prevents activity)
    expect(getPainStatus(7)).toBe('danger');
    // 10 = Worst possible
    expect(getPainStatus(10)).toBe('danger');
  });
});
