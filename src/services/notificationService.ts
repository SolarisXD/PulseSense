import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { getDB } from '../hooks/useDB';
import { getActiveMedications } from '../db/queries/medications';

const CHANNEL_ID = 'medication-reminders';

const IS_NOTIFICATIONS_AVAILABLE: boolean = (() => {
  try {
    if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) {
      return false;
    }
    return Platform.OS !== 'web';
  } catch {
    return false;
  }
})();

type NotificationsModule = typeof import('expo-notifications');

let _notificationsModule: NotificationsModule | null = null;

async function getNotifications(): Promise<NotificationsModule | null> {
  if (!IS_NOTIFICATIONS_AVAILABLE) return null;
  if (_notificationsModule) return _notificationsModule;
  try {
    _notificationsModule = await import('expo-notifications');
    return _notificationsModule;
  } catch {
    return null;
  }
}

export function initializeNotificationHandler(): void {
  getNotifications().then((mod) => {
    if (!mod) return;
    try {
      mod.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });
    } catch {}
  });
}

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  const mod = await getNotifications();
  if (!mod) return;
  try {
    await mod.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Medication Reminders',
      importance: mod.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      sound: 'default',
    });
  } catch {}
}

export async function requestNotificationPermissions(): Promise<boolean> {
  const mod = await getNotifications();
  if (!mod) return false;

  await ensureAndroidChannel();

  try {
    const { status: existingStatus } = await mod.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await mod.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });
      finalStatus = status;
    }

    return finalStatus === 'granted';
  } catch {
    return false;
  }
}

function reminderIdentifiers(identifier: string): { morning: string; afternoon: string; night: string } {
  return {
    morning: `med-${identifier}-morning`,
    afternoon: `med-${identifier}-afternoon`,
    night: `med-${identifier}-night`,
  };
}

function parseTime(timeStr: string): { hour: number; minute: number } {
  const parts = timeStr.split(':');
  return {
    hour: Math.min(23, Math.max(0, parseInt(parts[0], 10) || 0)),
    minute: Math.min(59, Math.max(0, parseInt(parts[1], 10) || 0)),
  };
}

function timingLabel(timing: string | null): string {
  switch (timing) {
    case 'before_meal': return ' before meals';
    case 'after_meal': return ' after meals';
    case 'with_meal': return ' with meals';
    case 'morning': return ' in the morning';
    case 'evening': return ' in the evening';
    case 'bedtime': return ' at bedtime';
    default: return '';
  }
}

async function scheduleSlot(
  identifier: string,
  slot: 'morning' | 'afternoon' | 'night',
  medicineName: string,
  hour: number,
  minute: number,
  timing: string | null,
): Promise<void> {
  const mod = await getNotifications();
  if (!mod) return;

  await ensureAndroidChannel();

  try {
    const label = slot.charAt(0).toUpperCase() + slot.slice(1);
    const ids = reminderIdentifiers(identifier);

    await mod.scheduleNotificationAsync({
      identifier: ids[slot],
      content: {
        title: 'Medication Reminder',
        body: `Time to take ${medicineName}${timingLabel(timing)} — ${label} dose`,
        data: { type: 'medication-reminder', identifier, slot, medicineName },
        sound: 'default',
      },
      trigger: {
        type: mod.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
        channelId: Platform.OS === 'android' ? CHANNEL_ID : undefined,
      },
    });
  } catch {}
}

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

  await cancelMedicationReminders(identifier);

  const morning = parseTime(morningTime);
  const afternoon = parseTime(afternoonTime);
  const night = parseTime(nightTime);

  const tasks: Promise<void>[] = [];

  if (doseMorning > 0) {
    tasks.push(scheduleSlot(identifier, 'morning', medicineName, morning.hour, morning.minute, timing));
  }
  if (doseAfternoon > 0) {
    tasks.push(scheduleSlot(identifier, 'afternoon', medicineName, afternoon.hour, afternoon.minute, timing));
  }
  if (doseNight > 0) {
    tasks.push(scheduleSlot(identifier, 'night', medicineName, night.hour, night.minute, timing));
  }

  await Promise.all(tasks);
}

export async function cancelAllMedicationReminders(): Promise<void> {
  const mod = await getNotifications();
  if (!mod) return;
  try {
    await mod.cancelAllScheduledNotificationsAsync();
  } catch {}
}

export async function cancelMedicationReminders(identifier: string): Promise<void> {
  const mod = await getNotifications();
  if (!mod) return;

  const ids = reminderIdentifiers(identifier);
  await Promise.all([
    mod.cancelScheduledNotificationAsync(ids.morning).catch(() => {}),
    mod.cancelScheduledNotificationAsync(ids.afternoon).catch(() => {}),
    mod.cancelScheduledNotificationAsync(ids.night).catch(() => {}),
  ]);
}

export async function rescheduleAllMedicationReminders(
  morningTime: string,
  afternoonTime: string,
  nightTime: string,
): Promise<void> {
  const mod = await getNotifications();
  if (!mod) return;

  await cancelAllMedicationReminders();

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
