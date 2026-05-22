// PulseSense — Export Service
// Orchestrates: data fetch → HTML template build → expo-print → expo-sharing → cleanup

import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';
import { getDB } from '../hooks/useDB';
import { getProfile } from '../db/queries/profile';
import { getConditions } from '../db/queries/conditions';
import { getAllergies } from '../db/queries/allergies';
import { getContacts } from '../db/queries/contacts';
import { getMedications, getActiveMedications } from '../db/queries/medications';
import { getVitalLogsByDateRange } from '../db/queries/vitals';
import { getAllAlerts } from '../db/queries/emergency';
import { getLast30DaysRange } from '../utils/dateUtils';
import {
  buildMedicalIdHtml,
  buildVitalsReportHtml,
  buildMedicationsHtml,
  buildAlertsHtml,
  buildFullReportHtml,
  wrapHtml,
} from './pdfTemplates';
import {
  buildMedicalIdCsv,
  buildVitalsReportCsv,
  buildMedicationsCsv,
  buildAlertsCsv,
  buildFullReportCsv,
} from './csvExport';
import type { CsvExportData } from './csvExport';

export type ExportType = 'medical_id' | 'vitals_report' | 'medications' | 'alerts' | 'full_report';

export interface ExportOptions {
  type: ExportType;
  vitalTypes?: string[]; // for vitals_report
  dateRange?: { start: string; end: string }; // for vitals_report
}

async function getExportData(type: ExportType) {
  const db = await getDB();
  const profilePromise = type !== 'alerts' ? getProfile(db) : Promise.resolve(null);
  const conditionsPromise = type === 'medical_id' || type === 'full_report' ? getConditions(db) : Promise.resolve([]);
  const allergiesPromise = type === 'medical_id' || type === 'full_report' ? getAllergies(db) : Promise.resolve([]);
  const contactsPromise = type === 'medical_id' || type === 'full_report' ? getContacts(db) : Promise.resolve([]);
  const allMedsPromise = type === 'full_report' ? getMedications(db) : Promise.resolve([]);
  const activeMedsPromise = type === 'medications' || type === 'full_report' ? getActiveMedications(db) : Promise.resolve([]);
  const alertsPromise = type === 'alerts' || type === 'full_report' ? getAllAlerts(db) : Promise.resolve([]);

  const [profile, conditions, allergies, contacts, allMedications, activeMedications, alerts] = await Promise.all([
    profilePromise, conditionsPromise, allergiesPromise, contactsPromise,
    allMedsPromise, activeMedsPromise, alertsPromise,
  ]);

  const medications = type === 'full_report' ? allMedications : activeMedications;

  return { profile, conditions, allergies, contacts, medications, alerts };
}

export async function generateExport(options: ExportOptions): Promise<string> {
  const data = await getExportData(options.type);
  const { profile } = data;
  if (!profile) throw new Error('Profile not found');

  let html: string;

  switch (options.type) {
    case 'medical_id':
      html = wrapHtml(buildMedicalIdHtml(
        profile,
        data.conditions,
        data.allergies,
        data.contacts
      ));
      break;

    case 'vitals_report': {
      const range = options.dateRange || getLast30DaysRange();
      const db = await getDB();
      const vitals = await getVitalLogsByDateRange(db, range.start, range.end);
      html = wrapHtml(buildVitalsReportHtml(
        profile,
        vitals,
        options.vitalTypes || ['bp', 'pulse', 'spo2', 'glucose', 'temperature', 'weight', 'pain']
      ));
      break;
    }

    case 'medications':
      html = wrapHtml(buildMedicationsHtml(profile, data.medications));
      break;

    case 'alerts':
      html = wrapHtml(buildAlertsHtml(data.alerts));
      break;

    case 'full_report':
      html = buildFullReportHtml(
        profile,
        data.conditions,
        data.allergies,
        data.contacts,
        data.medications,
        data.alerts
      );
      break;

    default:
      throw new Error(`Unknown export type: ${options.type}`);
  }

  // Generate PDF
  const { uri } = await Print.printToFileAsync({ html, width: 595.28, height: 841.89 }); // A4
  return uri;
}

export async function sharePdf(uri: string): Promise<void> {
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Share PulseSense Report',
    });
  } else {
    throw new Error('Sharing is not available on this device');
  }
}

export async function cleanupPdf(uri: string): Promise<void> {
  try {
    const file = new File(uri);
    if (file.exists) {
      file.delete();
    }
  } catch {
    // Non-critical cleanup, ignore errors
  }
}

// ── CSV Export ──────────────────────────────────────────

export async function generateCsv(options: ExportOptions): Promise<string> {
  const raw = await getExportData(options.type);
  const { profile } = raw;
  if (!profile) throw new Error('Profile not found');

  let csvContent: string;

  switch (options.type) {
    case 'medical_id':
      csvContent = buildMedicalIdCsv(raw as CsvExportData);
      break;

    case 'vitals_report': {
      const range = options.dateRange || getLast30DaysRange();
      const db = await getDB();
      const vitals = await getVitalLogsByDateRange(db, range.start, range.end);
      csvContent = buildVitalsReportCsv(
        vitals,
        options.vitalTypes || ['bp', 'pulse', 'spo2', 'glucose', 'temperature', 'weight', 'pain']
      );
      break;
    }

    case 'medications':
      csvContent = buildMedicationsCsv(raw as CsvExportData);
      break;

    case 'alerts':
      csvContent = buildAlertsCsv(raw as CsvExportData);
      break;

    case 'full_report':
      csvContent = buildFullReportCsv(raw as CsvExportData);
      break;

    default:
      throw new Error(`Unknown export type: ${options.type}`);
  }

  const fileName = `PulseSense_${options.type}_${Date.now()}.csv`;
  const csvFile = new File(Paths.cache, fileName);
  csvFile.write(csvContent);
  return csvFile.uri;
}

export async function shareCsv(uri: string): Promise<void> {
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'text/csv',
      dialogTitle: 'Share PulseSense CSV Report',
    });
  } else {
    throw new Error('Sharing is not available on this device');
  }
}

export async function exportAndShare(options: ExportOptions, format: 'pdf' | 'csv' = 'pdf'): Promise<void> {
  if (format === 'csv') {
    const uri = await generateCsv(options);
    await shareCsv(uri);
  } else {
    const uri = await generateExport(options);
    await sharePdf(uri);
  }
  // Files written to OS temp/cache directory are cleaned up automatically by the OS
}
