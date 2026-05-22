// PulseSense — Notification Service
// Local notification scheduling for medication reminders via expo-notifications

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { getDB } from '../hooks/useDB';
import { getActiveMedications } from '../db/queries/medications';

// ─── Notification Handler Setup ───────────────────────────────────────────
// Must be called once at app startup (module-level or early init)
export function initializeNotificationHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

// ─── Android Channel Setup ────────────────────────────────────────────────
const CHANNEL_ID = 'medication-reminders';

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Medication Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }
}

// ─── Permissions ──────────────────────────────────────────────────────────
export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    await ensureAndroidChannel();
    const { status } = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
      },
    });
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

// ─── Identifier Helpers ───────────────────────────────────────────────────
function reminderIdentifiers(
  identifier: string,
): { morning: string; afternoon: string; night: string } {
  return {
    morning: `med-${identifier}-morning`,
    afternoon: `med-${identifier}-afternoon`,
    night: `med-${identifier}-night`,
  };
}

// ─── Time Helpers ─────────────────────────────────────────────────────────
function parseTime(timeStr: string): { hour: number; minute: number } {
  const parts = timeStr.split(':');
  return {
    hour: Math.min(23, Math.max(0, parseInt(parts[0], 10) || 0)),
    minute: Math.min(59, Math.max(0, parseInt(parts[1], 10) || 0)),
  };
}

function timingLabel(timing: string | null): string {
  switch (timing) {
    case 'before_meal':
      return ' before meals';
    case 'after_meal':
      return ' after meals';
    case 'with_meal':
      return ' with meals';
    case 'morning':
      return ' in the morning';
    case 'evening':
      return ' in the evening';
    case 'bedtime':
      return ' at bedtime';
    default:
      return '';
  }
}

// ─── Schedule Single Slot ─────────────────────────────────────────────────
async function scheduleSlot(
  identifier: string,
  slot: 'morning' | 'afternoon' | 'night',
  medicineName: string,
  hour: number,
  minute: number,
  timing: string | null,
): Promise<void> {
  const label = slot.charAt(0).toUpperCase() + slot.slice(1);
  const ids = reminderIdentifiers(identifier);

  await Notifications.scheduleNotificationAsync({
    identifier: ids[slot],
    content: {
      title: '💊 Medication Reminder',
      body: `Time to take ${medicineName}${timingLabel(timing)} — ${label} dose`,
      data: {
        type: 'medication-reminder',
        identifier,
        slot,
        medicineName,
      },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      channelId: Platform.OS === 'android' ? CHANNEL_ID : undefined,
    },
  });
}

// ─── Schedule All Slots for One Medicine ──────────────────────────────────
export async function scheduleMedicationReminder(
  identifier: string,
  medicineName: string,
  doseMorning: number,
  doseAfternoon: number,
  doseNight: number,
  timing: string | null,
  morningTime: string,
  afternoonTime: string,
  nightTime: string,
): Promise<void> {
  const granted = await requestNotificationPermissions();
  if (!granted) return;

  // Cancel any existing notifications for this medication first
  await cancelMedicationReminders(identifier);

  const morning = parseTime(morningTime);
  const afternoon = parseTime(afternoonTime);
  const night = parseTime(nightTime);

  const tasks: Promise<void>[] = [];

  if (doseMorning > 0) {
    tasks.push(
      scheduleSlot(identifier, 'morning', medicineName, morning.hour, morning.minute, timing),
    );
  }
  if (doseAfternoon > 0) {
    tasks.push(
      scheduleSlot(identifier, 'afternoon', medicineName, afternoon.hour, afternoon.minute, timing),
    );
  }
  if (doseNight > 0) {
    tasks.push(
      scheduleSlot(identifier, 'night', medicineName, night.hour, night.minute, timing),
    );
  }

  await Promise.all(tasks);
}

// ─── Cancel All Reminders ─────────────────────────────────────────────────
export async function cancelAllMedicationReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// ─── Cancel Reminders for a Specific Medication ───────────────────────────
export async function cancelMedicationReminders(identifier: string): Promise<void> {
  const ids = reminderIdentifiers(identifier);
  await Promise.all([
    Notifications.cancelScheduledNotificationAsync(ids.morning).catch(() => {}),
    Notifications.cancelScheduledNotificationAsync(ids.afternoon).catch(() => {}),
    Notifications.cancelScheduledNotificationAsync(ids.night).catch(() => {}),
  ]);
}

// ─── Reschedule All Active Medications ─────────────────────────────────────
// Used when settings change (times updated or reminders toggled on)
export async function rescheduleAllMedicationReminders(
  morningTime: string,
  afternoonTime: string,
  nightTime: string,
): Promise<void> {
  // Cancel everything first
  await cancelAllMedicationReminders();

  // Fetch active medications from DB
  const db = await getDB();
  const medications = await getActiveMedications(db);

  const tasks: Promise<void>[] = [];

  for (const med of medications) {
    for (const item of med.items) {
      tasks.push(
        scheduleMedicationReminder(
          String(item.id),
          item.medicine_name,
          item.dose_morning,
          item.dose_afternoon,
          item.dose_night,
          item.timing,
          morningTime,
          afternoonTime,
          nightTime,
        ),
      );
    }
  }

  if (tasks.length > 0) {
    await Promise.all(tasks);
  }
}
