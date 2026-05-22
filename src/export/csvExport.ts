// PulseSense — CSV Export Generator
// Generates CSV strings for each export type

import { VITAL_HEADERS, formatVitalRawValue } from '../utils/vitalFormatters';
import type { VitalLogRow } from '../db/queries/vitals';

function escapeCsv(val: string | number | null | undefined): string {
  if (val == null) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function rowToCsv(values: (string | number | null | undefined)[]): string {
  return values.map(escapeCsv).join(',') + '\n';
}

export interface CsvExportData {
  profile: { full_name: string; dob: string; blood_group: string | null; sex: string | null };
  conditions: { name: string; type: string | null; severity: string | null; diagnosed_date: string | null; notes: string | null }[];
  allergies: { name: string; severity: string | null; reaction: string | null }[];
  contacts: { name: string; relationship: string | null; phone: string; contact_type?: string }[];
  medications: { prescription_date: string; prescribing_doctor: string | null; diagnosis_notes: string | null; is_active: number; items: { medicine_name: string; strength: string | null; dose_morning: number; dose_afternoon: number; dose_night: number; timing: string | null; duration: string | null }[] }[];
  alerts: { title: string; message: string; severity_level: string; created_at: string }[];
}

export function buildMedicalIdCsv(data: CsvExportData): string {
  let csv = '';
  csv += '=== MEDICAL ID EXPORT ===\n\n';
  csv += `Name,${escapeCsv(data.profile.full_name)}\n`;
  csv += `DOB,${escapeCsv(data.profile.dob)}\n`;
  csv += `Blood Group,${escapeCsv(data.profile.blood_group)}\n`;
  csv += `Sex,${escapeCsv(data.profile.sex)}\n\n`;

  csv += 'CONDITIONS\n';
  csv += rowToCsv(['Name', 'Type', 'Diagnosed Date', 'Severity', 'Notes']);
  for (const c of data.conditions) {
    csv += rowToCsv([c.name, c.type, c.diagnosed_date, c.severity, c.notes]);
  }
  if (data.conditions.length === 0) csv += 'No conditions recorded\n';
  csv += '\n';

  csv += 'ALLERGIES\n';
  csv += rowToCsv(['Name', 'Severity', 'Reaction']);
  for (const a of data.allergies) {
    csv += rowToCsv([a.name, a.severity, a.reaction]);
  }
  if (data.allergies.length === 0) csv += 'No allergies recorded\n';
  csv += '\n';

  csv += 'EMERGENCY CONTACTS\n';
  csv += rowToCsv(['Name', 'Relationship', 'Type', 'Phone']);
  for (const c of data.contacts) {
    csv += rowToCsv([c.name, c.relationship, c.contact_type === 'doctor' ? 'Doctor' : 'Emergency', c.phone]);
  }
  if (data.contacts.length === 0) csv += 'No contacts recorded\n';

  return csv;
}

export function buildVitalsReportCsv(
  vitals: VitalLogRow[],
  selectedTypes: string[]
): string {
  let csv = '=== VITALS REPORT EXPORT ===\n\n';
  csv += rowToCsv(['Date/Time', ...selectedTypes.map((t) => VITAL_HEADERS[t] || (t === 'temperature' ? VITAL_HEADERS.temp : t))]);

  for (const v of vitals) {
    const cells = selectedTypes.map((type) => {
      const normalizedType = type === 'temperature' ? 'temp' : type;
      return formatVitalRawValue(normalizedType, v);
    });
    csv += rowToCsv([v.logged_at_display, ...cells]);
  }
  if (vitals.length === 0) csv += 'No vitals recorded in selected range\n';

  return csv;
}

export function buildMedicationsCsv(data: CsvExportData): string {
  let csv = '=== MEDICATIONS EXPORT ===\n\n';
  csv += rowToCsv(['Prescription Date', 'Doctor', 'Diagnosis', 'Status']);
  for (const m of data.medications) {
    const status = m.is_active ? 'Active' : 'Inactive';
    csv += rowToCsv([m.prescription_date, m.prescribing_doctor, m.diagnosis_notes, status]);
    csv += rowToCsv(['Medicine', 'Strength', 'Dosage (M-A-N)', 'Timing', 'Duration']);
    for (const i of m.items) {
      const dose = `${i.dose_morning}-${i.dose_afternoon}-${i.dose_night}`;
      csv += rowToCsv([i.medicine_name, i.strength, dose, i.timing, i.duration]);
    }
    csv += '\n';
  }
  if (data.medications.length === 0) csv += 'No medications recorded\n';

  return csv;
}

export function buildAlertsCsv(data: CsvExportData): string {
  let csv = '=== EMERGENCY ALERTS EXPORT ===\n\n';
  csv += rowToCsv(['Date/Time', 'Severity', 'Title', 'Message']);
  for (const a of data.alerts) {
    csv += rowToCsv([a.created_at, a.severity_level, a.title, a.message]);
  }
  if (data.alerts.length === 0) csv += 'No alerts recorded\n';

  return csv;
}

export function buildFullReportCsv(data: CsvExportData): string {
  return (
    buildMedicalIdCsv(data) + '\n\n' +
    '=== VITALS ===\n(Vitals data not included in full CSV — use Vitals Report export)\n\n' +
    buildMedicationsCsv(data) + '\n' +
    buildAlertsCsv(data)
  );
}
