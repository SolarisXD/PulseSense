import {
  buildMedicalIdHtml,
  buildVitalsReportHtml,
  buildMedicationsHtml,
  buildAlertsHtml,
  buildFullReportHtml,
  wrapHtml,
} from '../../export/pdfTemplates';

const mockProfile = {
  full_name: 'Jane Doe',
  dob: '15/05/1990',
  blood_group: 'A+',
  sex: 'Female',
};

const emptyArr: any[] = [];

describe('pdfTemplates', () => {
  describe('headerHtml (embedded in each template)', () => {
    it('includes DOB in the rendered output', () => {
      const html = buildMedicalIdHtml(mockProfile, emptyArr, emptyArr, emptyArr);
      expect(html).toContain('15/05/1990');
    });

    it('includes calculated age', () => {
      const html = buildMedicalIdHtml(mockProfile, emptyArr, emptyArr, emptyArr);
      expect(html).toMatch(/yrs/);
      expect(html).toMatch(/months old/);
    });

    it('includes report generated date', () => {
      const html = buildMedicalIdHtml(mockProfile, emptyArr, emptyArr, emptyArr);
      expect(html).toMatch(/Report generated:/);
    });

    it('includes patient name', () => {
      const html = buildMedicalIdHtml(mockProfile, emptyArr, emptyArr, emptyArr);
      expect(html).toContain('Jane Doe');
    });

    it('includes blood group', () => {
      const html = buildMedicalIdHtml(mockProfile, emptyArr, emptyArr, emptyArr);
      expect(html).toContain('A+');
    });

    it('includes sex', () => {
      const html = buildMedicalIdHtml(mockProfile, emptyArr, emptyArr, emptyArr);
      expect(html).toContain('Female');
    });
  });

  describe('disclaimer', () => {
    it('is included in Medical ID PDF in bold', () => {
      const html = buildMedicalIdHtml(mockProfile, emptyArr, emptyArr, emptyArr);
      const wrapped = wrapHtml(html);
      expect(wrapped).toContain('font-weight: bold');
      expect(wrapped).toContain('for informational use only');
    });

    it('is included in Vitals Report PDF', () => {
      const html = buildVitalsReportHtml(mockProfile, [], []);
      const wrapped = wrapHtml(html);
      expect(wrapped).toContain('font-weight: bold');
      expect(wrapped).toContain('for informational use only');
    });

    it('is included in Medications PDF', () => {
      const html = buildMedicationsHtml(mockProfile, []);
      const wrapped = wrapHtml(html);
      expect(wrapped).toContain('font-weight: bold');
    });

    it('is included in Alerts PDF', () => {
      const html = buildAlertsHtml([]);
      const wrapped = wrapHtml(html);
      expect(wrapped).toContain('font-weight: bold');
    });

    it('is included in Full Report PDF', () => {
      const html = buildFullReportHtml(mockProfile, emptyArr, emptyArr, emptyArr, [], []);
      expect(html).toContain('font-weight: bold');
    });
  });

  describe('Medical ID', () => {
    it('includes conditions section', () => {
      const conditions = [{ name: 'Asthma', type: 'chronic', severity: 'mild', diagnosed_date: '01/01/2020', notes: 'Well controlled' }];
      const html = buildMedicalIdHtml(mockProfile, conditions, emptyArr, emptyArr);
      expect(html).toContain('Medical Conditions');
      expect(html).toContain('Asthma');
    });

    it('includes allergies section', () => {
      const allergies = [{ name: 'Peanuts', severity: 'severe', reaction: 'Anaphylaxis' }];
      const html = buildMedicalIdHtml(mockProfile, emptyArr, allergies, emptyArr);
      expect(html).toContain('Allergies');
      expect(html).toContain('Peanuts');
    });

    it('includes emergency contacts section', () => {
      const contacts = [{ name: 'John Doe', relationship: 'Spouse', phone: '+1234567890', contact_type: 'emergency' }];
      const html = buildMedicalIdHtml(mockProfile, emptyArr, emptyArr, contacts);
      expect(html).toContain('Emergency Contacts');
      expect(html).toContain('John Doe');
    });

    it('shows empty state messages when no data', () => {
      const html = buildMedicalIdHtml(mockProfile, emptyArr, emptyArr, emptyArr);
      expect(html).toContain('No conditions recorded');
      expect(html).toContain('No allergies recorded');
      expect(html).toContain('No emergency contacts');
    });
  });

  describe('Vitals Report', () => {
    const mockVitals = [{
      logged_at_display: '22/05/2026 14:30',
      bp_sys: 120, bp_dia: 80,
      pulse: 72, spo2: 97,
      glucose_value: 90, glucose_unit: 'mg/dL', glucose_context: 'fasting',
      temp_value: 36.6, temp_unit: 'C',
      weight_value: 70, weight_unit: 'kg',
      pain_level: 2, pain_location: null,
      notes: 'Feeling good today',
    }];

    it('includes notes column when vitals have notes', () => {
      const html = buildVitalsReportHtml(mockProfile, mockVitals, ['bp']);
      expect(html).toContain('Notes');
      expect(html).toContain('Feeling good today');
    });

    it('omits notes column when no vitals have notes', () => {
      const vitalsNoNotes = [{ ...mockVitals[0], notes: null }];
      const html = buildVitalsReportHtml(mockProfile, vitalsNoNotes, ['bp']);
      expect(html).not.toContain('<th>Notes</th>');
    });

    it('includes date/time column', () => {
      const html = buildVitalsReportHtml(mockProfile, mockVitals, ['pulse']);
      expect(html).toContain('22/05/2026 14:30');
      expect(html).toContain('72 bpm');
    });

    it('shows empty state when no vitals', () => {
      const html = buildVitalsReportHtml(mockProfile, [], ['bp']);
      expect(html).toContain('No vitals recorded');
    });
  });

  describe('Full Report', () => {
    it('includes Medical ID sections', () => {
      const html = buildFullReportHtml(mockProfile, emptyArr, emptyArr, emptyArr, [], []);
      expect(html).toContain('Medical Conditions');
      expect(html).toContain('Allergies');
      expect(html).toContain('Emergency Contacts');
    });

    it('includes Medications section', () => {
      const medications = [{
        prescription_date: '01/01/2026',
        prescribing_doctor: 'Dr. Smith',
        diagnosis_notes: null,
        is_active: 1,
        items: [{ medicine_name: 'Lisinopril', strength: '10mg', dose_morning: 1, dose_afternoon: 0, dose_night: 0, timing: 'Morning', duration: 'Ongoing' }],
      }];
      const html = buildFullReportHtml(mockProfile, emptyArr, emptyArr, emptyArr, medications, []);
      expect(html).toContain('Medications');
      expect(html).toContain('Lisinopril');
    });

    it('includes Alerts section', () => {
      const alerts = [{ title: 'Chest Pain Alert', message: 'Patient reported chest discomfort', severity_level: 'EMERGENCY_NOW', created_at: '2026-05-22T14:30:00' }];
      const html = buildFullReportHtml(mockProfile, emptyArr, emptyArr, emptyArr, [], alerts);
      expect(html).toContain('Emergency Alerts History');
      expect(html).toContain('Chest Pain Alert');
    });

    it('has only ONE header with patient name (not duplicated)', () => {
      const html = buildFullReportHtml(mockProfile, emptyArr, emptyArr, emptyArr, [], []);
      const occurrences = html.match(/Medical Record — Jane Doe/g);
      expect(occurrences).toHaveLength(1);
    });
  });

  describe('wrapHtml', () => {
    it('includes watermark', () => {
      const wrapped = wrapHtml('<div>test</div>');
      expect(wrapped).toContain('PulseSense');
      expect(wrapped).toContain('watermark');
    });

    it('includes base styles', () => {
      const wrapped = wrapHtml('<div>test</div>');
      expect(wrapped).toContain('Helvetica');
      expect(wrapped).toContain('report-header');
    });

    it('wraps content in html/body tags', () => {
      const wrapped = wrapHtml('<div>test</div>');
      expect(wrapped).toContain('<html>');
      expect(wrapped).toContain('</html>');
    });
  });
});
