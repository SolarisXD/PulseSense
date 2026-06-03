import {
  getMedications,
  getActiveMedications,
  insertMedication,
  updateMedication,
  toggleMedicationActive,
  updateMedicationItems,
  deleteMedication,
} from '../../../db/queries/medications';
import type { MedicationRow, MedicationItemRow, MedicationInput, MedicationItemInput } from '../../../db/queries/medications';

describe('medications query module', () => {
  it('exports getMedications as a function', () => {
    expect(typeof getMedications).toBe('function');
  });

  it('exports getActiveMedications as a function', () => {
    expect(typeof getActiveMedications).toBe('function');
  });

  it('exports insertMedication as a function', () => {
    expect(typeof insertMedication).toBe('function');
  });

  it('exports updateMedication as a function', () => {
    expect(typeof updateMedication).toBe('function');
  });

  it('exports toggleMedicationActive as a function', () => {
    expect(typeof toggleMedicationActive).toBe('function');
  });

  it('exports updateMedicationItems as a function', () => {
    expect(typeof updateMedicationItems).toBe('function');
  });

  it('exports deleteMedication as a function', () => {
    expect(typeof deleteMedication).toBe('function');
  });

  it('exports MedicationRow interface', () => {
    const row: MedicationRow = {
      id: 1,
      prescription_date: '2026-01-15',
      prescribing_doctor: null,
      diagnosis_notes: null,
      is_active: 1,
      created_at: '',
      updated_at: '',
    };
    expect(row.is_active).toBe(1);
  });

  it('exports MedicationInput interface', () => {
    const input: MedicationInput = { prescription_date: '2026-01-15' };
    expect(input.prescription_date).toBe('2026-01-15');
  });

  it('exports MedicationItemInput interface', () => {
    const item: MedicationItemInput = { medicine_name: 'Aspirin' };
    expect(item.medicine_name).toBe('Aspirin');
  });
});
