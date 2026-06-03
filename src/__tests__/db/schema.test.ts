import { SCHEMA_VERSION, CREATE_TABLES, CREATE_INDEXES } from '../../db/schema';

describe('schema', () => {
  it('has version 2', () => {
    expect(SCHEMA_VERSION).toBe(2);
  });

  it('has 13 CREATE TABLE statements', () => {
    expect(CREATE_TABLES).toHaveLength(13);
  });

  it('each CREATE TABLE has IF NOT EXISTS', () => {
    for (const stmt of CREATE_TABLES) {
      expect(stmt).toContain('CREATE TABLE IF NOT EXISTS');
    }
  });

  it('has 17 CREATE INDEX statements', () => {
    expect(CREATE_INDEXES).toHaveLength(17);
  });

  describe('individual tables', () => {
    const allStatements = CREATE_TABLES.join(' ');

    it('includes settings table', () => {
      expect(allStatements).toContain('CREATE TABLE IF NOT EXISTS settings');
    });

    it('includes profile table', () => {
      expect(allStatements).toContain('CREATE TABLE IF NOT EXISTS profile');
    });

    it('includes emergency_contacts table', () => {
      expect(allStatements).toContain('CREATE TABLE IF NOT EXISTS emergency_contacts');
    });

    it('includes conditions table', () => {
      expect(allStatements).toContain('CREATE TABLE IF NOT EXISTS conditions');
    });

    it('includes allergies table', () => {
      expect(allStatements).toContain('CREATE TABLE IF NOT EXISTS allergies');
    });

    it('includes medications table', () => {
      expect(allStatements).toContain('CREATE TABLE IF NOT EXISTS medications');
    });

    it('includes medication_items table', () => {
      expect(allStatements).toContain('CREATE TABLE IF NOT EXISTS medication_items');
    });

    it('includes vital_logs table', () => {
      expect(allStatements).toContain('CREATE TABLE IF NOT EXISTS vital_logs');
    });

    it('includes symptom_events table', () => {
      expect(allStatements).toContain('CREATE TABLE IF NOT EXISTS symptom_events');
    });

    it('includes alerts table', () => {
      expect(allStatements).toContain('CREATE TABLE IF NOT EXISTS alerts');
    });
  });

  describe('vital_logs columns', () => {
    const vitalLogsSQL = CREATE_TABLES.find((s) => s.includes('vital_logs'))!;

    it('has bp_sys column', () => {
      expect(vitalLogsSQL).toContain('bp_sys');
    });

    it('has logged_at_iso column', () => {
      expect(vitalLogsSQL).toContain('logged_at_iso');
    });

    it('has spo2 column', () => {
      expect(vitalLogsSQL).toContain('spo2');
    });
  });

  describe('symptom_events columns', () => {
    const symptomSQL = CREATE_TABLES.find((s) => s.includes('symptom_events'))!;

    it('has BEFAST symptom columns', () => {
      expect(symptomSQL).toContain('sym_balance_loss');
      expect(symptomSQL).toContain('sym_face_droop');
      expect(symptomSQL).toContain('sym_speech_difficulty');
    });

    it('has critical symptom columns', () => {
      expect(symptomSQL).toContain('sym_unconscious');
      expect(symptomSQL).toContain('sym_not_breathing');
      expect(symptomSQL).toContain('sym_severe_bleeding');
    });

    it('has vitals at event columns', () => {
      expect(symptomSQL).toContain('spo2_at_event');
      expect(symptomSQL).toContain('pulse_at_event');
    });
  });
});
