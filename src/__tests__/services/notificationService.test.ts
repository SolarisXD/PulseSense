jest.mock('expo-constants', () => ({
  default: {
    executionEnvironment: 'standalone',
  },
  ExecutionEnvironment: {
    StoreClient: 'storeClient',
    Standalone: 'standalone',
    Bare: 'bare',
  },
}));

import {
  initializeNotificationHandler,
  requestNotificationPermissions,
  scheduleMedicationReminder,
  cancelAllMedicationReminders,
  cancelMedicationReminders,
  rescheduleAllMedicationReminders,
} from '../../services/notificationService';

describe('notificationService module', () => {
  it('exports initializeNotificationHandler as a function', () => {
    expect(typeof initializeNotificationHandler).toBe('function');
  });

  it('exports requestNotificationPermissions as a function', () => {
    expect(typeof requestNotificationPermissions).toBe('function');
  });

  it('exports scheduleMedicationReminder as a function', () => {
    expect(typeof scheduleMedicationReminder).toBe('function');
  });

  it('exports cancelAllMedicationReminders as a function', () => {
    expect(typeof cancelAllMedicationReminders).toBe('function');
  });

  it('exports cancelMedicationReminders as a function', () => {
    expect(typeof cancelMedicationReminders).toBe('function');
  });

  it('exports rescheduleAllMedicationReminders as a function', () => {
    expect(typeof rescheduleAllMedicationReminders).toBe('function');
  });
});
