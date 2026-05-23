import { generateInsights, type HealthInsight } from '../../engine/healthInsights';
import type { VitalLogRow } from '../../db/queries/vitals';

function makeVital(overrides: Partial<VitalLogRow> & { logged_at_iso: string }): VitalLogRow {
  return {
    id: 0,
    logged_at_display: '',
    bp_sys: null,
    bp_dia: null,
    bp_position: null,
    pulse: null,
    spo2: null,
    glucose_value: null,
    glucose_unit: 'mg/dL',
    glucose_context: null,
    temp_value: null,
    temp_unit: 'C',
    weight_value: null,
    weight_unit: 'kg',
    pain_level: null,
    pain_location: null,
    pain_notes: null,
    notes: null,
    is_deleted: 0,
    created_at: '',
    ...overrides,
  };
}

describe('generateInsights', () => {
  it('returns "No Vitals Logged" insight when vitals array is empty', () => {
    const insights = generateInsights([]);
    expect(insights).toHaveLength(1);
    expect(insights[0].title).toBe('No Vitals Logged');
    expect(insights[0].type).toBe('info');
  });

  describe('BP Elevation Trend', () => {
    it('detects elevated BP when last 3 readings have sys >= 130', () => {
      const vitals = [
        makeVital({ logged_at_iso: '2026-05-20T10:00:00', bp_sys: 135, bp_dia: 85 }),
        makeVital({ logged_at_iso: '2026-05-21T10:00:00', bp_sys: 132, bp_dia: 80 }),
        makeVital({ logged_at_iso: '2026-05-22T10:00:00', bp_sys: 140, bp_dia: 90 }),
      ];
      const insights = generateInsights(vitals);
      const bpInsight = insights.find((i) => i.vitalType === 'bp');
      expect(bpInsight).toBeDefined();
      expect(bpInsight!.type).toBe('warning');
      expect(bpInsight!.title).toContain('Elevated Blood Pressure');
    });

    it('does NOT trigger BP elevation for fewer than 3 readings', () => {
      const vitals = [
        makeVital({ logged_at_iso: '2026-05-22T10:00:00', bp_sys: 135, bp_dia: 85 }),
      ];
      const insights = generateInsights(vitals);
      expect(insights.find((i) => i.vitalType === 'bp')).toBeUndefined();
    });
  });

  describe('BP Drop Trend', () => {
    it('detects a significant BP drop between consecutive readings', () => {
      const vitals = [
        makeVital({ logged_at_iso: '2026-05-21T10:00:00', bp_sys: 150, bp_dia: 90 }),
        makeVital({ logged_at_iso: '2026-05-22T10:00:00', bp_sys: 120, bp_dia: 80 }),
      ];
      const insights = generateInsights(vitals);
      const dropInsight = insights.find((i) => i.title === 'Blood Pressure Drop');
      expect(dropInsight).toBeDefined();
      expect(dropInsight!.type).toBe('warning');
    });

    it('does NOT trigger for small drops (< 20 systolic)', () => {
      const vitals = [
        makeVital({ logged_at_iso: '2026-05-21T10:00:00', bp_sys: 130, bp_dia: 85 }),
        makeVital({ logged_at_iso: '2026-05-22T10:00:00', bp_sys: 125, bp_dia: 80 }),
      ];
      const insights = generateInsights(vitals);
      expect(insights.find((i) => i.title === 'Blood Pressure Drop')).toBeUndefined();
    });
  });

  describe('Pulse Elevation Trend', () => {
    it('detects elevated pulse when last 2 readings > 100 bpm', () => {
      const vitals = [
        makeVital({ logged_at_iso: '2026-05-21T10:00:00', pulse: 105 }),
        makeVital({ logged_at_iso: '2026-05-22T10:00:00', pulse: 110 }),
      ];
      const insights = generateInsights(vitals);
      const pulseInsight = insights.find((i) => i.title === 'Elevated Heart Rate');
      expect(pulseInsight).toBeDefined();
      expect(pulseInsight!.type).toBe('warning');
    });
  });

  describe('SpO2 Concern', () => {
    it('detects low SpO2 when latest reading < 95%', () => {
      const vitals = [
        makeVital({ logged_at_iso: '2026-05-22T10:00:00', spo2: 92 }),
      ];
      const insights = generateInsights(vitals);
      const spo2Insight = insights.find((i) => i.title === 'Low Oxygen Level');
      expect(spo2Insight).toBeDefined();
      expect(spo2Insight!.type).toBe('warning');
    });

    it('does NOT trigger for normal SpO2 (>= 95%)', () => {
      const vitals = [
        makeVital({ logged_at_iso: '2026-05-22T10:00:00', spo2: 97 }),
      ];
      const insights = generateInsights(vitals);
      expect(insights.find((i) => i.title === 'Low Oxygen Level')).toBeUndefined();
    });
  });

  describe('Glucose Pattern', () => {
    it('detects elevated fasting glucose', () => {
      const vitals = [
        makeVital({ logged_at_iso: '2026-05-22T10:00:00', glucose_value: 120, glucose_context: 'fasting' }),
      ];
      const insights = generateInsights(vitals);
      const gluInsight = insights.find((i) => i.title === 'Elevated Fasting Glucose');
      expect(gluInsight).toBeDefined();
      expect(gluInsight!.type).toBe('warning');
    });

    it('detects elevated random glucose', () => {
      const vitals = [
        makeVital({ logged_at_iso: '2026-05-22T10:00:00', glucose_value: 160, glucose_context: 'post-meal' }),
      ];
      const insights = generateInsights(vitals);
      const gluInsight = insights.find((i) => i.title === 'Elevated Glucose Reading');
      expect(gluInsight).toBeDefined();
      expect(gluInsight!.type).toBe('info');
    });
  });

  describe('Weight Change', () => {
    it('detects significant weight increase', () => {
      const vitals = [
        makeVital({ logged_at_iso: '2026-05-20T10:00:00', weight_value: 70 }),
        makeVital({ logged_at_iso: '2026-05-22T10:00:00', weight_value: 73 }),
      ];
      const insights = generateInsights(vitals);
      const wtInsight = insights.find((i) => i.title === 'Weight Change Detected');
      expect(wtInsight).toBeDefined();
      expect(wtInsight!.message).toContain('increased');
    });

    it('detects significant weight decrease', () => {
      const vitals = [
        makeVital({ logged_at_iso: '2026-05-20T10:00:00', weight_value: 75 }),
        makeVital({ logged_at_iso: '2026-05-22T10:00:00', weight_value: 72 }),
      ];
      const insights = generateInsights(vitals);
      const wtInsight = insights.find((i) => i.title === 'Weight Change Detected');
      expect(wtInsight).toBeDefined();
      expect(wtInsight!.message).toContain('decreased');
    });

    it('does NOT trigger for small changes (< 2 kg)', () => {
      const vitals = [
        makeVital({ logged_at_iso: '2026-05-20T10:00:00', weight_value: 70 }),
        makeVital({ logged_at_iso: '2026-05-22T10:00:00', weight_value: 70.5 }),
      ];
      const insights = generateInsights(vitals);
      expect(insights.find((i) => i.title === 'Weight Change Detected')).toBeUndefined();
    });
  });

  describe('No Recent Vitals', () => {
    it('warns when no vitals for 7+ days', () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 10);
      const iso = oldDate.toISOString();
      const vitals = [makeVital({ logged_at_iso: iso })];
      const insights = generateInsights(vitals);
      const noVitalInsight = insights.find((i) => i.title === 'No Recent Vitals');
      expect(noVitalInsight).toBeDefined();
      expect(noVitalInsight!.type).toBe('info');
    });
  });

  describe('Consistent Readings (positive insight)', () => {
    it('shows "All Vitals Normal" when vitals span >= 1 day and no warnings', () => {
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const vitals = [
        makeVital({ logged_at_iso: yesterday.toISOString(), bp_sys: 118, bp_dia: 78, pulse: 72, spo2: 97 }),
        makeVital({ logged_at_iso: now.toISOString(), bp_sys: 120, bp_dia: 80, pulse: 75, spo2: 98 }),
      ];
      const insights = generateInsights(vitals);
      const positive = insights.find((i) => i.title === 'All Vitals Normal');
      expect(positive).toBeDefined();
      expect(positive!.type).toBe('positive');
    });

    it('does NOT show positive insight when there are warnings', () => {
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString();
      const nowStr = now.toISOString();
      const vitals = [
        makeVital({ logged_at_iso: yesterdayStr, bp_sys: 118, bp_dia: 78, spo2: 97 }),
        makeVital({ logged_at_iso: nowStr, bp_sys: 120, bp_dia: 80, spo2: 92 }),
      ];
      const insights = generateInsights(vitals);
      expect(insights.find((i) => i.title === 'All Vitals Normal')).toBeUndefined();
    });
  });

  describe('Output structure', () => {
    it('each insight has required fields', () => {
      const vitals = [makeVital({ logged_at_iso: new Date().toISOString(), spo2: 92 })];
      const insights = generateInsights(vitals);
      for (const insight of insights) {
        expect(insight).toMatchObject({
          id: expect.any(String),
          type: expect.any(String),
          icon: expect.any(String),
          title: expect.any(String),
          message: expect.any(String),
          vitalType: expect.any(String),
          severity: expect.stringMatching(/^(low|medium|high)$/),
        });
      }
    });

    it('generates unique IDs for each insight', () => {
      const vitals = [
        makeVital({ logged_at_iso: '2026-05-20T10:00:00', bp_sys: 135, bp_dia: 85 }),
        makeVital({ logged_at_iso: '2026-05-21T10:00:00', bp_sys: 132, bp_dia: 80 }),
        makeVital({ logged_at_iso: '2026-05-22T10:00:00', bp_sys: 140, bp_dia: 90, spo2: 92 }),
      ];
      const insights = generateInsights(vitals);
      const ids = insights.map((i) => i.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });
});
