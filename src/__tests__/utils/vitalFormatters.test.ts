import { formatVitalCell, formatVitalRawValue, formatVitalHtmlCell, VITAL_CONFIG } from '../../utils/vitalFormatters';
import type { VitalLogRow } from '../../db/queries/vitals';

function makeRow(overrides: Partial<VitalLogRow> = {}): VitalLogRow {
  return {
    id: 1,
    logged_at_display: '22/05/2026 14:30',
    logged_at_iso: '2026-05-22T14:30:00',
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

describe('formatVitalCell', () => {
  it('formats BP value with status', () => {
    const row = makeRow({ bp_sys: 120, bp_dia: 80 });
    const cell = formatVitalCell('bp', row);
    expect(cell.value).toBe('120/80');
    expect(cell.status).toBe('normal');
  });

  it('formats BP with danger status', () => {
    const row = makeRow({ bp_sys: 150, bp_dia: 95 });
    const cell = formatVitalCell('bp', row);
    expect(cell.status).toBe('danger');
  });

  it('formats pulse value', () => {
    const row = makeRow({ pulse: 72 });
    const cell = formatVitalCell('pulse', row);
    expect(cell.value).toBe('72 bpm');
  });

  it('formats SpO2 value', () => {
    const row = makeRow({ spo2: 97 });
    const cell = formatVitalCell('spo2', row);
    expect(cell.value).toBe('97%');
  });

  it('formats glucose with unit', () => {
    const row = makeRow({ glucose_value: 110, glucose_unit: 'mg/dL' });
    const cell = formatVitalCell('glucose', row);
    expect(cell.value).toBe('110 mg/dL');
  });

  it('formats temp with degree symbol', () => {
    const row = makeRow({ temp_value: 36.6, temp_unit: 'C' });
    const cell = formatVitalCell('temp', row);
    expect(cell.value).toBe('36.6°C');
  });

  it('formats weight with unit', () => {
    const row = makeRow({ weight_value: 72.5, weight_unit: 'kg' });
    const cell = formatVitalCell('weight', row);
    expect(cell.value).toBe('72.5 kg');
  });

  it('formats pain level', () => {
    const row = makeRow({ pain_level: 5 });
    const cell = formatVitalCell('pain', row);
    expect(cell.value).toBe('5/10');
    expect(cell.status).toBe('warning');
  });

  it('returns dash for missing values', () => {
    const row = makeRow();
    expect(formatVitalCell('bp', row).value).toBe('-');
    expect(formatVitalCell('pulse', row).value).toBe('-');
    expect(formatVitalCell('spo2', row).value).toBe('-');
  });

  it('returns unknown for unrecognized type', () => {
    const row = makeRow();
    const cell = formatVitalCell('invalid', row);
    expect(cell.value).toBe('-');
    expect(cell.status).toBe('unknown');
  });
});

describe('formatVitalRawValue', () => {
  it('returns formatted raw values', () => {
    const row = makeRow({ bp_sys: 120, bp_dia: 80, pulse: 75, spo2: 98 });
    expect(formatVitalRawValue('bp', row)).toBe('120/80');
    expect(formatVitalRawValue('pulse', row)).toBe('75');
    expect(formatVitalRawValue('spo2', row)).toBe('98%');
  });

  it('returns null for null values', () => {
    const row = makeRow();
    expect(formatVitalRawValue('bp', row)).toBeNull();
    expect(formatVitalRawValue('glucose', row)).toBeNull();
  });
});

describe('formatVitalHtmlCell', () => {
  it('formats HTML-safe cell values', () => {
    const row = { bp_sys: 120, bp_dia: 80, pulse: 75, spo2: 98, glucose_value: 100, glucose_unit: 'mg/dL', glucose_context: 'fasting', temp_value: 36.6, temp_unit: 'C', weight_value: 70, weight_unit: 'kg', pain_level: 3, pain_location: 'Lower back' };
    expect(formatVitalHtmlCell('bp', row)).toBe('120/80 mmHg');
    expect(formatVitalHtmlCell('pulse', row)).toBe('75 bpm');
    expect(formatVitalHtmlCell('glucose', row)).toContain('100');
    expect(formatVitalHtmlCell('glucose', row)).toContain('fasting');
    expect(formatVitalHtmlCell('pain', row)).toContain('Lower back');
  });

  it('returns dash for missing values', () => {
    expect(formatVitalHtmlCell('bp', {})).toBe('-');
  });
});

describe('VITAL_CONFIG', () => {
  it('contains all vital type keys', () => {
    const keys = VITAL_CONFIG.map((c) => c.key);
    expect(keys).toEqual(['bp', 'pulse', 'spo2', 'glucose', 'temp', 'weight', 'pain']);
  });

  it('each entry has required fields', () => {
    for (const config of VITAL_CONFIG) {
      expect(config).toMatchObject({
        key: expect.any(String),
        label: expect.any(String),
        icon: expect.any(String),
        header: expect.any(String),
      });
    }
  });
});
