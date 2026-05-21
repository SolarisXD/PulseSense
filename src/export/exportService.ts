// PulseSense — Export Service
// Orchestrates: data fetch → HTML template build → expo-print → expo-sharing → cleanup

import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { getDB } from '../hooks/useDB';
import { getProfile } from '../db/queries/profile';
import { getConditions } from '../db/queries/conditions';
import { getAllergies } from '../db/queries/allergies';
import { getContacts } from '../db/queries/contacts';
import { getActiveMedications } from '../db/queries/medications';
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

export type ExportType = 'medical_id' | 'vitals_report' | 'medications' | 'alerts' | 'full_report';

export interface ExportOptions {
  type: ExportType;
  vitalTypes?: string[]; // for vitals_report
  dateRange?: { start: string; end: string }; // for vitals_report
}

async function getExportData() {
  const db = await getDB();
  const [profile, conditions, allergies, contacts, medications, alerts] = await Promise.all([
    getProfile(db),
    getConditions(db),
    getAllergies(db),
    getContacts(db),
    getActiveMedications(db),
    getAllAlerts(db),
  ]);
  return { profile, conditions, allergies, contacts, medications, alerts };
}

export async function generateExport(options: ExportOptions): Promise<string> {
  const data = await getExportData();
  if (!data.profile) throw new Error('Profile not found');

  let html: string;

  switch (options.type) {
    case 'medical_id':
      html = wrapHtml(buildMedicalIdHtml(
        data.profile,
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
        data.profile,
        vitals,
        options.vitalTypes || ['bp', 'pulse', 'spo2', 'glucose', 'temperature', 'weight', 'pain']
      ));
      break;
    }

    case 'medications':
      html = wrapHtml(buildMedicationsHtml(data.profile, data.medications));
      break;

    case 'alerts':
      html = wrapHtml(buildAlertsHtml(data.alerts));
      break;

    case 'full_report':
      html = buildFullReportHtml(
        data.profile,
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
    const info = await FileSystem.getInfoAsync(uri);
    if (info.exists) {
      await FileSystem.deleteAsync(uri, { idempotent: true });
    }
  } catch {
    // Non-critical cleanup, ignore errors
  }
}

export async function exportAndShare(options: ExportOptions): Promise<void> {
  const uri = await generateExport(options);
  await sharePdf(uri);
  // expo-print writes to the OS temp/cache directory which is cleaned up
  // automatically by the OS. No explicit cleanup needed — deferred cleanup
  // can race with the share target reading the file.
}
