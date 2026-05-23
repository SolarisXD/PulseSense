import { SEED_SETTINGS } from '../../db/seeds';

describe('SEED_SETTINGS', () => {
  it('has required default settings', () => {
    const keys = SEED_SETTINGS.map((s) => s.key);
    expect(keys).toContain('temp_unit');
    expect(keys).toContain('weight_unit');
    expect(keys).toContain('glucose_unit');
    expect(keys).toContain('height_unit');
    expect(keys).toContain('bp_default_position');
    expect(keys).toContain('emergency_number');
    expect(keys).toContain('onboarding_complete');
    expect(keys).toContain('dark_mode');
    expect(keys).toContain('medication_reminders');
  });

  it('has non-empty values for all seeds', () => {
    for (const seed of SEED_SETTINGS) {
      expect(seed.key).toBeTruthy();
      expect(seed.value).toBeDefined();
    }
  });

  it('default emergency number is 112', () => {
    const emerg = SEED_SETTINGS.find((s) => s.key === 'emergency_number');
    expect(emerg?.value).toBe('112');
  });

  it('default onboarding is false', () => {
    const onboarding = SEED_SETTINGS.find((s) => s.key === 'onboarding_complete');
    expect(onboarding?.value).toBe('false');
  });
});
