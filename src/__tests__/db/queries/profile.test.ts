import {
  getProfile,
  hasProfile,
  insertProfile,
  updateProfile,
  updateProfilePhoto,
} from '../../../db/queries/profile';
import type { ProfileRow, ProfileInput } from '../../../db/queries/profile';

describe('profile query module', () => {
  it('exports getProfile as a function', () => {
    expect(typeof getProfile).toBe('function');
  });

  it('exports hasProfile as a function', () => {
    expect(typeof hasProfile).toBe('function');
  });

  it('exports insertProfile as a function', () => {
    expect(typeof insertProfile).toBe('function');
  });

  it('exports updateProfile as a function', () => {
    expect(typeof updateProfile).toBe('function');
  });

  it('exports updateProfilePhoto as a function', () => {
    expect(typeof updateProfilePhoto).toBe('function');
  });

  it('exports ProfileRow interface', () => {
    const row: ProfileRow = {
      id: 1,
      full_name: 'Jane Doe',
      dob: '15/05/1990',
      sex: 'Female',
      sex_other_text: null,
      blood_group: null,
      height_value: null,
      height_unit: 'cm',
      height_ft: null,
      height_in: null,
      photo_uri: null,
      created_at: '',
      updated_at: '',
    };
    expect(row.full_name).toBe('Jane Doe');
  });

  it('exports ProfileInput interface', () => {
    const input: ProfileInput = { full_name: 'Jane', dob: '15/05/1990', sex: 'Female' };
    expect(input.full_name).toBe('Jane');
  });
});
