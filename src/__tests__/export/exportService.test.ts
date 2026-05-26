jest.mock('../../hooks/useDB', () => ({
  getDB: jest.fn().mockResolvedValue({
    getAllAsync: jest.fn().mockResolvedValue([]),
    getFirstAsync: jest.fn().mockResolvedValue(null),
  }),
}));

jest.mock('../../db/queries/profile', () => ({
  getProfile: jest.fn().mockResolvedValue({
    full_name: 'Jane Doe', dob: '15/05/1990', blood_group: 'A+', sex: 'Female',
  }),
}));

jest.mock('../../db/queries/conditions', () => ({
  getConditions: jest.fn().mockResolvedValue([]),
}));

jest.mock('../../db/queries/allergies', () => ({
  getAllergies: jest.fn().mockResolvedValue([]),
}));

jest.mock('../../db/queries/contacts', () => ({
  getContacts: jest.fn().mockResolvedValue([]),
}));

jest.mock('../../db/queries/medications', () => ({
  getMedications: jest.fn().mockResolvedValue([]),
  getActiveMedications: jest.fn().mockResolvedValue([]),
}));

jest.mock('../../db/queries/vitals', () => ({
  getVitalLogsByDateRange: jest.fn().mockResolvedValue([]),
}));

jest.mock('../../db/queries/emergency', () => ({
  getAllAlerts: jest.fn().mockResolvedValue([]),
}));

jest.mock('expo-file-system/legacy', () => ({
  readAsStringAsync: jest.fn().mockResolvedValue('mockBase64Data'),
  EncodingType: { Base64: 'base64', UTF8: 'utf8' },
}));

jest.mock('expo-print', () => ({
  printToFileAsync: jest.fn().mockResolvedValue({ uri: 'file:///mock/test.pdf' }),
  printAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn().mockResolvedValue(true),
  shareAsync: jest.fn().mockResolvedValue(undefined),
}));

import { generateExport, generateExportHtml, previewPdf, sharePdf } from '../../export/exportService';
import * as Print from 'expo-print';

describe('exportService', () => {
  describe('generateExportHtml', () => {
    it('generates HTML for medical_id', async () => {
      const html = await generateExportHtml({ type: 'medical_id' });
      expect(html).toContain('Medical Record');
      expect(html).toContain('Jane Doe');
    });

    it('generates HTML containing disclaimer', async () => {
      const html = await generateExportHtml({ type: 'medical_id' });
      expect(html).toContain('font-weight: bold');
      expect(html).toContain('for informational use only');
    });

    it('throws when no profile found', async () => {
      const { getProfile } = require('../../db/queries/profile');
      getProfile.mockResolvedValueOnce(null);
      await expect(generateExportHtml({ type: 'medical_id' })).rejects.toThrow('Profile not found');
    });
  });

  describe('generateExport', () => {
    it('generates PDF file URI', async () => {
      const uri = await generateExport({ type: 'medical_id' });
      expect(uri).toBe('file:///mock/test.pdf');
    });

    it('calls printToFileAsync with HTML', async () => {
      await generateExport({ type: 'medical_id' });
      expect(Print.printToFileAsync).toHaveBeenCalledWith(
        expect.objectContaining({ html: expect.any(String), width: 595.28, height: 841.89 })
      );
    });
  });

  describe('previewPdf', () => {
    it('calls printAsync with HTML', async () => {
      await previewPdf({ type: 'medical_id' });
      expect(Print.printAsync).toHaveBeenCalledWith(
        expect.objectContaining({ html: expect.any(String), width: 595.28, height: 841.89 })
      );
    });
  });

  describe('sharePdf', () => {
    it('calls shareAsync with URI', async () => {
      const { shareAsync } = require('expo-sharing');
      await sharePdf('file:///test.pdf');
      expect(shareAsync).toHaveBeenCalledWith('file:///test.pdf', {
        mimeType: 'application/pdf',
        dialogTitle: 'Share PulseSense Report',
      });
    });
  });
});
