import {
  insertVitalLog,
  getLatestVitalLogs,
  getVitalLogsByDateRange,
  getLatestPerVital,
  softDeleteVitalLog,
} from '../../../db/queries/vitals';
import type { VitalLogRow, VitalLogInput } from '../../../db/queries/vitals';

describe('vitals query module', () => {
  it('exports insertVitalLog as a function', () => {
    expect(typeof insertVitalLog).toBe('function');
  });

  it('exports getLatestVitalLogs as a function', () => {
    expect(typeof getLatestVitalLogs).toBe('function');
  });

  it('exports getVitalLogsByDateRange as a function', () => {
    expect(typeof getVitalLogsByDateRange).toBe('function');
  });

  it('exports getLatestPerVital as a function', () => {
    expect(typeof getLatestPerVital).toBe('function');
  });

  it('exports softDeleteVitalLog as a function', () => {
    expect(typeof softDeleteVitalLog).toBe('function');
  });

  it('exports VitalLogRow interface', () => {
    // Type-only — verify it's exported by checking a usage compiles
    const row: VitalLogRow = {
      id: 1,
      logged_at_display: '01/01/2026 10:00',
      logged_at_iso: '2026-01-01T10:00:00',
      created_at: '',
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
    };
    expect(row.id).toBe(1);
  });

  it('exports VitalLogInput interface', () => {
    const input: VitalLogInput = {
      logged_at_display: '01/01/2026 10:00',
      logged_at_iso: '2026-01-01T10:00:00',
    };
    expect(input.logged_at_display).toBe('01/01/2026 10:00');
  });
});
