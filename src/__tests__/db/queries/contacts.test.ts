import {
  getContacts,
  getPrimaryContact,
  insertContact,
  updateContact,
  deleteContact,
  setPrimaryContact,
} from '../../../db/queries/contacts';
import type { EmergencyContactRow, EmergencyContactInput } from '../../../db/queries/contacts';

describe('contacts query module', () => {
  it('exports getContacts as a function', () => {
    expect(typeof getContacts).toBe('function');
  });

  it('exports getPrimaryContact as a function', () => {
    expect(typeof getPrimaryContact).toBe('function');
  });

  it('exports insertContact as a function', () => {
    expect(typeof insertContact).toBe('function');
  });

  it('exports updateContact as a function', () => {
    expect(typeof updateContact).toBe('function');
  });

  it('exports deleteContact as a function', () => {
    expect(typeof deleteContact).toBe('function');
  });

  it('exports setPrimaryContact as a function', () => {
    expect(typeof setPrimaryContact).toBe('function');
  });

  it('exports EmergencyContactRow interface', () => {
    const row: EmergencyContactRow = {
      id: 1,
      name: 'Jane Doe',
      relationship: null,
      phone: '555-0100',
      contact_type: 'emergency',
      is_primary: 1,
      sort_order: 0,
      created_at: '',
    };
    expect(row.name).toBe('Jane Doe');
  });

  it('exports EmergencyContactInput interface', () => {
    const input: EmergencyContactInput = { name: 'John', phone: '555-0101' };
    expect(input.phone).toBe('555-0101');
  });
});
