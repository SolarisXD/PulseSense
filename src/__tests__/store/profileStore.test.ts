import { useProfileStore } from '../../store/profileStore';

beforeEach(() => {
  useProfileStore.getState().clear();
});

describe('profileStore', () => {
  it('starts with default state', () => {
    const state = useProfileStore.getState();
    expect(state.profile).toBeNull();
    expect(state.contacts).toEqual([]);
    expect(state.conditions).toEqual([]);
    expect(state.allergies).toEqual([]);
    expect(state.isLoading).toBe(true);
  });

  it('setProfile stores profile', () => {
    const profile = { id: 1, full_name: 'John Doe', dob: '15/05/1990', sex: 'Male', sex_other_text: null, blood_group: 'A+', height_value: null, height_unit: 'cm', height_ft: null, height_in: null, photo_uri: null, created_at: '', updated_at: '' };
    useProfileStore.getState().setProfile(profile);
    expect(useProfileStore.getState().profile).toEqual(profile);
  });

  it('setProfile can set to null', () => {
    useProfileStore.getState().setProfile(null);
    expect(useProfileStore.getState().profile).toBeNull();
  });

  it('setContacts stores contacts', () => {
    const contacts = [{ id: 1, name: 'Emergency Contact', relationship: 'Spouse', phone: '+1234567890', contact_type: 'emergency', is_primary: 1, sort_order: 0, created_at: '' }];
    useProfileStore.getState().setContacts(contacts);
    expect(useProfileStore.getState().contacts).toEqual(contacts);
  });

  it('setConditions stores conditions', () => {
    const conditions = [{ id: 1, name: 'Hypertension', type: 'chronic', diagnosed_date: '01/01/2020', severity: 'mild', notes: null, is_active: 1, sort_order: 0, created_at: '', updated_at: '' }];
    useProfileStore.getState().setConditions(conditions);
    expect(useProfileStore.getState().conditions).toEqual(conditions);
  });

  it('setAllergies stores allergies', () => {
    const allergies = [{ id: 1, name: 'Peanuts', category: 'food', reaction: 'Hives', severity: 'severe', is_active: 1, created_at: '' }];
    useProfileStore.getState().setAllergies(allergies);
    expect(useProfileStore.getState().allergies).toEqual(allergies);
  });

  it('setLoading updates loading state', () => {
    useProfileStore.getState().setLoading(false);
    expect(useProfileStore.getState().isLoading).toBe(false);
  });

  it('clear resets to defaults', () => {
    useProfileStore.getState().setProfile({ id: 1, full_name: 'Test', dob: '', sex: 'Male', sex_other_text: null, blood_group: null, height_value: null, height_unit: 'cm', height_ft: null, height_in: null, photo_uri: null, created_at: '', updated_at: '' });
    useProfileStore.getState().clear();
    expect(useProfileStore.getState().profile).toBeNull();
    expect(useProfileStore.getState().contacts).toEqual([]);
    expect(useProfileStore.getState().isLoading).toBe(true);
  });
});
