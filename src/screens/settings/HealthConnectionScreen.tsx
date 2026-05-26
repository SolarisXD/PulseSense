import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useColors } from '../../hooks/useColors';
import { fonts } from '../../constants/typography';
import { spacing, borderRadius } from '../../constants/spacing';
import { getDB } from '../../hooks/useDB';
import { getSyncMetadata, recordImport, recordExport, ensureHealthSyncSchema } from '../../db/queries/healthSync';
import { insertVitalLog } from '../../db/queries/vitals';
import {
  isHealthAvailable,
  getPlatform,
  getConnectionStatus,
  getHealthPermissions,
  requestHealthPermissions,
  disconnectHealth,
  readHeartRate,
  readBloodPressure,
  readWeight,
  readSteps,
  writeHeartRate,
  writeBloodPressure,
  writeWeight,
} from '../../engine/healthPlatform';
import type { ConnectionStatus as ConnStatus, HealthPermissions, SyncMetadata } from '../../engine/healthPlatformTypes';

type StatusState = 'checking' | 'unavailable' | 'not_connected' | 'connected';

export function HealthConnectionScreen() {
  const c = useColors();
  const [platform, setPlatform] = useState<string | null>(null);
  const [status, setStatus] = useState<StatusState>('checking');
  const [permissions, setPermissions] = useState<HealthPermissions | null>(null);
  const [syncMeta, setSyncMeta] = useState<SyncMetadata | null>(null);
  const [syncing, setSyncing] = useState<'none' | 'importing' | 'exporting'>('none');

  const refresh = useCallback(async () => {
    setStatus('checking');
    const plat = await getPlatform();
    setPlatform(plat);

    if (!plat) {
      setStatus('unavailable');
      return;
    }

    const available = await isHealthAvailable();
    if (!available) {
      setStatus('unavailable');
      return;
    }

    const connStatus = await getConnectionStatus();
    if (connStatus === 'connected') {
      setStatus('connected');
    } else {
      setStatus('not_connected');
    }

    const p = await getHealthPermissions();
    if (p) setPermissions(p);

    try {
      const db = await getDB();
      await ensureHealthSyncSchema(db);
      const meta = await getSyncMetadata(db);
      setSyncMeta(meta);
    } catch { /* ignore */ }
  }, []);

  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  const handleConnect = async () => {
    const granted = await requestHealthPermissions({
      heart_rate: { read: true, write: true },
      blood_pressure: { read: true, write: true },
      weight: { read: true, write: true },
      oxygen_saturation: { read: true, write: false },
      steps: { read: true, write: false },
    });
    if (granted) {
      Alert.alert('Connected', `Successfully connected to ${platform === 'apple_health' ? 'Apple Health' : 'Health Connect'}.`);
      await refresh();
    } else {
      Alert.alert('Permission Denied', 'Permission was not granted. Check your device settings.');
    }
  };

  const handleDisconnect = () => {
    Alert.alert(
      'Disconnect',
      `Disconnect from ${platform === 'apple_health' ? 'Apple Health' : 'Health Connect'}? This will revoke data access.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            await disconnectHealth();
            await refresh();
          },
        },
      ]
    );
  };

  const handleImport = async () => {
    setSyncing('importing');
    try {
      const db = await getDB();
      const end = new Date().toISOString();
      const start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

      const [hr, bp, w, steps] = await Promise.all([
        readHeartRate(start, end),
        readBloodPressure(start, end),
        readWeight(start, end),
        readSteps(start, end),
      ]);

      let importedCount = 0;

      for (const sample of hr) {
        if (sample.value > 0) {
          await insertVitalLog(db, {
            logged_at_display: new Date(sample.date).toLocaleString(),
            logged_at_iso: sample.date,
            pulse: Math.round(sample.value),
          });
          importedCount++;
        }
      }

      for (const sample of bp) {
        if (sample.systolic > 0 && sample.diastolic > 0) {
          await insertVitalLog(db, {
            logged_at_display: new Date(sample.date).toLocaleString(),
            logged_at_iso: sample.date,
            bp_sys: sample.systolic,
            bp_dia: sample.diastolic,
          });
          importedCount++;
        }
      }

      for (const sample of w) {
        if (sample.value > 0) {
          await insertVitalLog(db, {
            logged_at_display: new Date(sample.date).toLocaleString(),
            logged_at_iso: sample.date,
            weight_value: sample.value,
            weight_unit: 'kg',
          });
          importedCount++;
        }
      }

      await recordImport(db, importedCount);
      const meta = await getSyncMetadata(db);
      setSyncMeta(meta);

      Alert.alert(
        'Import Complete',
        `Found ${hr.length} heart rate, ${bp.length} BP, ${w.length} weight, and ${steps.length} step records.\nImported ${importedCount} new vitals.`
      );
    } catch (err) {
      console.error(err);
      Alert.alert('Import Error', 'Failed to import health data.');
    }
    setSyncing('none');
  };

  const handleExport = async () => {
    setSyncing('exporting');
    try {
      const db = await getDB();
      const { getVitalLogsByDateRange } = require('../../db/queries/vitals');
      const start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const end = new Date().toISOString();
      const logs = await getVitalLogsByDateRange(db, start, end);

      let exportedCount = 0;

      for (const log of logs) {
        if (log.pulse != null) {
          const ok = await writeHeartRate(log.pulse, log.logged_at_iso);
          if (ok) exportedCount++;
        }
        if (log.bp_sys != null && log.bp_dia != null) {
          const ok = await writeBloodPressure(log.bp_sys, log.bp_dia, log.logged_at_iso);
          if (ok) exportedCount++;
        }
        if (log.weight_value != null) {
          const ok = await writeWeight(log.weight_value, log.logged_at_iso);
          if (ok) exportedCount++;
        }
      }

      await recordExport(db, exportedCount);
      const meta = await getSyncMetadata(db);
      setSyncMeta(meta);

      Alert.alert('Export Complete', `Exported ${exportedCount} vital records to ${platform === 'apple_health' ? 'Apple Health' : 'Health Connect'}.`);
    } catch (err) {
      console.error(err);
      Alert.alert('Export Error', 'Failed to export health data.');
    }
    setSyncing('none');
  };

  const platformName = platform === 'apple_health' ? 'Apple Health' : platform === 'health_connect' ? 'Health Connect' : 'Health Platform';
  const iconName = platform === 'apple_health' ? 'logo-apple' : 'phone-portrait-outline';

  return (
    <ScrollView style={[styles.container, { backgroundColor: c.background }]} contentContainerStyle={styles.content}>
      <View style={[styles.statusCard, { backgroundColor: c.surface }]}>
        <View style={styles.statusRow}>
          <Ionicons
            name={status === 'connected' ? 'checkmark-circle' : status === 'not_connected' ? 'time-outline' : 'close-circle'}
            size={24}
            color={status === 'connected' ? c.success : status === 'not_connected' ? c.warning : c.danger}
          />
          <View style={styles.statusTextCol}>
            <Text style={[styles.statusLabel, { color: c.textPrimary }]}>Connection Status</Text>
            <Text style={[styles.statusValue, {
              color: status === 'connected' ? c.success : status === 'not_connected' ? c.warning : c.danger
            }]}>
              {status === 'checking' ? 'Checking...' :
               status === 'connected' ? 'Connected' :
               status === 'not_connected' ? 'Not Connected' : 'Unavailable'}
            </Text>
          </View>
        </View>
        <View style={[styles.divider, { backgroundColor: c.borderLight }]} />
        <View style={styles.platformRow}>
          <Ionicons name={iconName as any} size={20} color={c.textSecondary} />
          <Text style={[styles.platformText, { color: c.textSecondary }]}>Platform: {platformName}</Text>
        </View>
      </View>

      {status === 'connected' && permissions && (
        <View style={[styles.permissionsCard, { backgroundColor: c.surface }]}>
          <Text style={[styles.sectionTitle, { color: c.textPrimary }]}>Permissions</Text>
          {Object.entries(permissions).map(([type, access]) => (
            <View key={type} style={styles.permissionRow}>
              <Text style={[styles.permissionType, { color: c.textPrimary }]}>
                {type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
              </Text>
              <View style={styles.permissionIcons}>
                <Ionicons name={access.read ? 'checkmark-circle' : 'close-circle'} size={16} color={access.read ? c.success : c.danger} />
                <Text style={[styles.permissionLabel, { color: c.textSecondary }]}>Read</Text>
                {platform === 'apple_health' && (
                  <>
                    <Ionicons name={access.write ? 'checkmark-circle' : 'close-circle'} size={16} color={access.write ? c.success : c.danger} style={{ marginLeft: 12 }} />
                    <Text style={[styles.permissionLabel, { color: c.textSecondary }]}>Write</Text>
                  </>
                )}
              </View>
            </View>
          ))}
        </View>
      )}

      {status === 'connected' && syncMeta && (
        <View style={[styles.syncCard, { backgroundColor: c.surface }]}>
          <Text style={[styles.sectionTitle, { color: c.textPrimary }]}>Sync History</Text>
          <View style={styles.syncRow}>
            <Text style={[styles.syncLabel, { color: c.textSecondary }]}>Last Import</Text>
            <Text style={[styles.syncValue, { color: c.textPrimary }]}>
              {syncMeta.lastImportAt ? new Date(syncMeta.lastImportAt).toLocaleString() : 'Never'}
            </Text>
          </View>
          <View style={styles.syncRow}>
            <Text style={[styles.syncLabel, { color: c.textSecondary }]}>Total Imported</Text>
            <Text style={[styles.syncValue, { color: c.textPrimary }]}>{syncMeta.importCount} records</Text>
          </View>
          <View style={styles.syncRow}>
            <Text style={[styles.syncLabel, { color: c.textSecondary }]}>Last Export</Text>
            <Text style={[styles.syncValue, { color: c.textPrimary }]}>
              {syncMeta.lastExportAt ? new Date(syncMeta.lastExportAt).toLocaleString() : 'Never'}
            </Text>
          </View>
          <View style={styles.syncRow}>
            <Text style={[styles.syncLabel, { color: c.textSecondary }]}>Total Exported</Text>
            <Text style={[styles.syncValue, { color: c.textPrimary }]}>{syncMeta.exportCount} records</Text>
          </View>
        </View>
      )}

      {status === 'unavailable' && (
        <View style={[styles.unavailableCard, { backgroundColor: c.surface }]}>
          <Ionicons name="alert-circle-outline" size={32} color={c.warning} />
          <Text style={[styles.unavailableTitle, { color: c.textPrimary }]}>
            {platform ? `${platformName} Not Available` : 'Health Platform Not Supported'}
          </Text>
          <Text style={[styles.unavailableDesc, { color: c.textSecondary }]}>
            {platform === 'apple_health'
              ? 'Apple Health is only available on physical iOS devices. It may not work in simulators.'
              : 'Health Connect requires an Android device with the Health Connect app installed.'}
          </Text>
        </View>
      )}

      <View style={styles.actions}>
        {status === 'not_connected' && (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: c.primary }]}
            onPress={handleConnect}
          >
            <Ionicons name="link-outline" size={20} color="#fff" />
            <Text style={styles.actionBtnText}>Connect to {platformName}</Text>
          </TouchableOpacity>
        )}

        {status === 'connected' && (
          <>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: c.primary }]}
              onPress={handleImport}
              disabled={syncing !== 'none'}
            >
              {syncing === 'importing' ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Ionicons name="download-outline" size={20} color="#fff" />
              )}
              <Text style={styles.actionBtnText}>
                {syncing === 'importing' ? 'Importing...' : `Import from ${platformName}`}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: c.secondary }]}
              onPress={handleExport}
              disabled={syncing !== 'none'}
            >
              {syncing === 'exporting' ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
              )}
              <Text style={styles.actionBtnText}>
                {syncing === 'exporting' ? 'Exporting...' : `Export to ${platformName}`}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: c.danger }]}
              onPress={handleDisconnect}
              disabled={syncing !== 'none'}
            >
              <Ionicons name="link-outline" size={20} color="#fff" />
              <Text style={styles.actionBtnText}>Disconnect</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <View style={[styles.infoCard, { backgroundColor: c.surface }]}>
        <Text style={[styles.infoTitle, { color: c.textPrimary }]}>About Health Sync</Text>
        <Text style={[styles.infoText, { color: c.textSecondary }]}>
          {platform === 'apple_health'
            ? 'Sync your vitals with Apple Health. Import heart rate, blood pressure, weight, and steps from HealthKit. Export PulseSense vitals back to Apple Health. Data stays private on your device.'
            : platform === 'health_connect'
            ? 'Sync your vitals with Google Health Connect. Import heart rate, blood pressure, weight, and steps. Export PulseSense vitals back to Health Connect. Requires the Health Connect app on your Android device.'
            : 'Connect to your device\'s health platform to sync vitals between PulseSense and Apple Health or Google Health Connect.'}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.space4 },
  statusCard: { borderRadius: borderRadius.lg, padding: spacing.space5, marginBottom: spacing.space4 },
  statusRow: { flexDirection: 'row', alignItems: 'center' },
  statusTextCol: { marginLeft: spacing.space3 },
  statusLabel: { fontSize: 14, fontWeight: '600', fontFamily: fonts.body },
  statusValue: { fontSize: 16, fontWeight: '700', fontFamily: fonts.body, marginTop: 2 },
  divider: { height: 1, marginVertical: spacing.space4 },
  platformRow: { flexDirection: 'row', alignItems: 'center' },
  platformText: { fontSize: 13, fontFamily: fonts.body, marginLeft: spacing.space2 },
  sectionTitle: { fontSize: 14, fontWeight: '700', fontFamily: fonts.body, marginBottom: spacing.space3 },
  permissionsCard: { borderRadius: borderRadius.md, padding: spacing.space4, marginBottom: spacing.space4 },
  permissionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.space2 },
  permissionType: { fontSize: 13, fontWeight: '500', fontFamily: fonts.body, textTransform: 'capitalize' },
  permissionIcons: { flexDirection: 'row', alignItems: 'center' },
  permissionLabel: { fontSize: 11, fontFamily: fonts.body, marginLeft: 4 },
  syncCard: { borderRadius: borderRadius.md, padding: spacing.space4, marginBottom: spacing.space4 },
  syncRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.space2 },
  syncLabel: { fontSize: 13, fontFamily: fonts.body },
  syncValue: { fontSize: 13, fontWeight: '600', fontFamily: fonts.body },
  unavailableCard: { borderRadius: borderRadius.md, padding: spacing.space6, marginBottom: spacing.space4, alignItems: 'center' },
  unavailableTitle: { fontSize: 16, fontWeight: '600', fontFamily: fonts.body, marginTop: spacing.space3, textAlign: 'center' },
  unavailableDesc: { fontSize: 13, fontFamily: fonts.body, marginTop: spacing.space2, textAlign: 'center', lineHeight: 18 },
  actions: { gap: spacing.space3, marginBottom: spacing.space4 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: borderRadius.md, padding: spacing.space4, gap: spacing.space2 },
  actionBtnText: { fontSize: 15, fontWeight: '600', fontFamily: fonts.body, color: '#fff' },
  infoCard: { borderRadius: borderRadius.md, padding: spacing.space4 },
  infoTitle: { fontSize: 14, fontWeight: '600', fontFamily: fonts.body, marginBottom: spacing.space2 },
  infoText: { fontSize: 12, fontFamily: fonts.body, lineHeight: 18 },
});
