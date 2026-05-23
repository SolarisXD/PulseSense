import { evaluateSymptoms, evaluateVitalThresholds } from '../../engine/ruleEngine';
import type { SymptomInput } from '../../constants/rules';

describe('evaluateSymptoms', () => {
  it('returns NO_EMERGENCY when no symptoms present', () => {
    const input: SymptomInput = {};
    const results = evaluateSymptoms(input);
    expect(results).toHaveLength(1);
    expect(results[0].ruleId).toBe('NO_EMERGENCY');
    expect(results[0].severity).toBe('LOG_ONLY');
  });

  describe('Cardiac Arrest (RULE 1)', () => {
    it('triggers CARDIAC_ARREST when unconscious AND not_breathing', () => {
      const input: SymptomInput = { unconscious: true, not_breathing: true };
      const results = evaluateSymptoms(input);
      const cardiac = results.find((r) => r.ruleId === 'CARDIAC_ARREST');
      expect(cardiac).toBeDefined();
      expect(cardiac!.severity).toBe('EMERGENCY_NOW');
      expect(cardiac!.isHardOverride).toBe(true);
    });

    it('does NOT trigger cardiac arrest if only one flag set', () => {
      const input: SymptomInput = { unconscious: true };
      const results = evaluateSymptoms(input);
      expect(results.find((r) => r.ruleId === 'CARDIAC_ARREST')).toBeUndefined();
    });
  });

  describe('Stroke (RULE 2 - BEFAST)', () => {
    it.each([
      ['balance_loss', { balance_loss: true }],
      ['vision_change', { vision_change: true }],
      ['face_droop', { face_droop: true }],
      ['arm_weakness', { arm_weakness: true }],
      ['speech_difficulty', { speech_difficulty: true }],
    ])('triggers STROKE_BEFAST when %s is true', (_, symptom) => {
      const results = evaluateSymptoms(symptom);
      const stroke = results.find((r) => r.ruleId === 'STROKE_BEFAST');
      expect(stroke).toBeDefined();
      expect(stroke!.severity).toBe('EMERGENCY_NOW');
      expect(stroke!.isHardOverride).toBe(true);
    });

    it('triggers stroke with multiple BEFAST signs', () => {
      const input: SymptomInput = {
        face_droop: true,
        arm_weakness: true,
        speech_difficulty: true,
      };
      const results = evaluateSymptoms(input);
      const stroke = results.find((r) => r.ruleId === 'STROKE_BEFAST');
      expect(stroke).toBeDefined();
      expect(stroke!.triggeredBy).toEqual(
        expect.arrayContaining(['face_droop', 'arm_weakness', 'speech_difficulty'])
      );
    });
  });

  describe('Heart Attack (RULE 3)', () => {
    it('triggers HEART_ATTACK with chest_discomfort alone', () => {
      const results = evaluateSymptoms({ chest_discomfort: true });
      expect(results.find((r) => r.ruleId === 'HEART_ATTACK')).toBeDefined();
    });

    it('triggers HEART_ATTACK when 2+ associated symptoms without chest discomfort', () => {
      const results = evaluateSymptoms({
        upper_body_pain: true,
        cold_sweat: true,
        nausea: true,
      });
      const ha = results.find((r) => r.ruleId === 'HEART_ATTACK');
      expect(ha).toBeDefined();
      expect(ha!.severity).toBe('EMERGENCY_NOW');
      expect(ha!.isHardOverride).toBe(false);
    });

    it('does NOT trigger HEART_ATTACK with only 1 associated symptom', () => {
      const results = evaluateSymptoms({ nausea: true });
      expect(results.find((r) => r.ruleId === 'HEART_ATTACK')).toBeUndefined();
    });
  });

  describe('SpO2 Assessment (RULE 4)', () => {
    it('triggers SPO2_CRITICAL when SpO2 < 90', () => {
      const results = evaluateSymptoms({ spo2: 85 });
      const critical = results.find((r) => r.ruleId === 'SPO2_CRITICAL');
      expect(critical).toBeDefined();
      expect(critical!.severity).toBe('EMERGENCY_NOW');
      expect(critical!.isHardOverride).toBe(true);
    });

    it('triggers SPO2_LOW when SpO2 90-94', () => {
      const results = evaluateSymptoms({ spo2: 92 });
      const low = results.find((r) => r.ruleId === 'SPO2_LOW');
      expect(low).toBeDefined();
      expect(low!.severity).toBe('URGENT_SAME_DAY');
      expect(low!.isHardOverride).toBe(false);
    });

    it('does NOT trigger SpO2 rule when SpO2 >= 95', () => {
      const results = evaluateSymptoms({ spo2: 97 });
      expect(results.find((r) => r.ruleId.startsWith('SPO2'))).toBeUndefined();
    });
  });

  describe('Severe Bleeding (RULE 5)', () => {
    it('triggers SEVERE_BLEEDING when flag set', () => {
      const results = evaluateSymptoms({ severe_bleeding: true });
      expect(results.find((r) => r.ruleId === 'SEVERE_BLEEDING')).toBeDefined();
    });
  });

  describe('Anaphylaxis (RULE 6)', () => {
    it('triggers ANAPHYLAXIS when flag set', () => {
      const results = evaluateSymptoms({ anaphylaxis: true });
      expect(results.find((r) => r.ruleId === 'ANAPHYLAXIS')).toBeDefined();
    });
  });

  describe('Seizure (RULE 7)', () => {
    it('triggers SEIZURE when flag set', () => {
      const results = evaluateSymptoms({ seizure: true });
      expect(results.find((r) => r.ruleId === 'SEIZURE')).toBeDefined();
    });
  });

  describe('Pulse Assessment', () => {
    it('triggers PULSE_HIGH when pulse > 120', () => {
      const results = evaluateSymptoms({ pulse: 130 });
      expect(results.find((r) => r.ruleId === 'PULSE_HIGH')).toBeDefined();
    });

    it('triggers PULSE_LOW when pulse < 50', () => {
      const results = evaluateSymptoms({ pulse: 45 });
      expect(results.find((r) => r.ruleId === 'PULSE_LOW')).toBeDefined();
    });

    it('does not trigger pulse rule when pulse is normal', () => {
      const results = evaluateSymptoms({ pulse: 75 });
      expect(results.find((r) => r.ruleId === 'PULSE_HIGH' || r.ruleId === 'PULSE_LOW')).toBeUndefined();
    });
  });

  describe('Sort Order', () => {
    it('places hard overrides before non-hard-override results', () => {
      const input: SymptomInput = {
        unconscious: true,
        not_breathing: true,
        chest_discomfort: true,
        seizure: true,
      };
      const results = evaluateSymptoms(input);
      const firstResult = results[0];
      expect(firstResult.isHardOverride).toBe(true);
    });

    it('sorts by severity after hard override flag', () => {
      const input: SymptomInput = {
        chest_discomfort: true,
        pulse: 130,
      };
      const results = evaluateSymptoms(input);
      const haIdx = results.findIndex((r) => r.ruleId === 'HEART_ATTACK');
      const pulseIdx = results.findIndex((r) => r.ruleId === 'PULSE_HIGH');
      expect(haIdx).toBeLessThan(pulseIdx);
    });
  });

  describe('Multiple simultaneous emergencies', () => {
    it('can return multiple emergency results', () => {
      const input: SymptomInput = {
        unconscious: true,
        not_breathing: true,
        severe_bleeding: true,
        seizure: true,
      };
      const results = evaluateSymptoms(input);
      const emergencyRules = results.filter((r) => r.severity === 'EMERGENCY_NOW');
      expect(emergencyRules.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Edge cases', () => {
    it('handles undefined pulse and spo2 gracefully', () => {
      const results = evaluateSymptoms({ chest_discomfort: true });
      expect(results.find((r) => r.ruleId === 'HEART_ATTACK')).toBeDefined();
      expect(results.find((r) => r.ruleId === 'NO_EMERGENCY')).toBeUndefined();
    });

    it('handles null-like values safely', () => {
      const results = evaluateSymptoms({ spo2: undefined, pulse: undefined });
      const noEmerg = results.find((r) => r.ruleId === 'NO_EMERGENCY');
      expect(noEmerg).toBeDefined();
    });

    it('triggers LOG_ONLY when nothing matches', () => {
      const results = evaluateSymptoms({});
      expect(results[0].severity).toBe('LOG_ONLY');
      expect(results[0].ruleId).toBe('NO_EMERGENCY');
    });
  });
});

describe('evaluateVitalThresholds', () => {
  it('returns null for normal vitals', () => {
    const result = evaluateVitalThresholds({
      bp_sys: 120,
      bp_dia: 80,
      spo2: 97,
      pulse: 75,
    });
    expect(result).toBeNull();
  });

  it('returns emergency alert for SpO2 < 90', () => {
    const result = evaluateVitalThresholds({ spo2: 85 });
    expect(result).not.toBeNull();
    expect(result!.type).toBe('emergency');
    expect(result!.severity_level).toBe('EMERGENCY_NOW');
  });

  it('returns warning alert for SpO2 < 95 but >= 90', () => {
    const result = evaluateVitalThresholds({ spo2: 92 });
    expect(result).not.toBeNull();
    expect(result!.type).toBe('warning');
    expect(result!.severity_level).toBe('URGENT_SAME_DAY');
  });

  it('returns emergency alert for hypertensive crisis (systolic >= 180)', () => {
    const result = evaluateVitalThresholds({ bp_sys: 185, bp_dia: 100 });
    expect(result).not.toBeNull();
    expect(result!.type).toBe('emergency');
    expect(result!.title).toContain('Hypertensive Crisis');
  });

  it('returns emergency alert for hypertensive crisis (diastolic >= 120)', () => {
    const result = evaluateVitalThresholds({ bp_sys: 160, bp_dia: 125 });
    expect(result).not.toBeNull();
    expect(result!.type).toBe('emergency');
  });

  it('returns null when no vital data provided', () => {
    const result = evaluateVitalThresholds({});
    expect(result).toBeNull();
  });

  it('handles SpO2 priority over BP (SpO2 checked first)', () => {
    const result = evaluateVitalThresholds({ spo2: 85, bp_sys: 190, bp_dia: 110 });
    expect(result).not.toBeNull();
    expect(result!.title).toContain('SpO2');
  });
});
