// PulseSense — Home Screen
// Greeting, Emergency button, latest vitals cards, alerts

import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, borderRadius } from '../../constants/spacing';
import { useProfileStore } from '../../store/profileStore';
import { useAlertStore } from '../../store/alertStore';
import { useAgeCalculator } from '../../hooks/useAgeCalculator';
import { getDB, loadStores } from '../../hooks/useDB';
import { getLatestPerVital } from '../../db/queries/vitals';
import { formatTodayDisplay } from '../../utils/dateUtils';
import {
  getBpStatus, getPulseStatus, getSpo2Status,
  getGlucoseStatus, getTempStatus, getPainStatus,
  type VitalStatus,
} from '../../utils/vitalStatus';
import { EmergencyButton } from '../../components/emergency/EmergencyButton';
import { VitalCard } from '../../components/vitals/VitalCard';
import { AlertRow } from '../../components/ui/AlertRow';
import { Button } from '../../components/ui/Button';

export function HomeScreen({ navigation }: any) {
  const profile = useProfileStore((s) => s.profile);
  const age = useAgeCalculator();
  const activeAlerts = useAlertStore((s) => s.activeAlerts);
  const [latestVitals, setLatestVitals] = useState<Record<string, any>>({});
  const [refreshing, setRefreshing] = useState(false);

  const loadVitals = useCallback(async () => {
    try {
      const db = await getDB();
      const vitals = await getLatestPerVital(db);
      setLatestVitals(vitals);
    } catch (err) {
      console.error('Failed to load vitals:', err);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadVitals();
    }, [loadVitals])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const db = await getDB();
      await loadStores(db);
      await loadVitals();
    } catch (err) {
      console.error(err);
    }
    setRefreshing(false);
  }, [loadVitals]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const getTimeAgo = (iso: string) => {
    const now = new Date();
    const d = new Date(iso);
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  const unresolvedEmergencies = activeAlerts.filter(
    (a) => a.severity_level === 'EMERGENCY_NOW' || a.severity_level === 'URGENT_SAME_DAY'
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Greeting Header */}
      <View style={styles.greetingRow}>
        <View>
          <Text style={styles.greeting}>{greeting},</Text>
          <Text style={styles.name}>{profile?.full_name || 'User'}</Text>
          {age ? <Text style={styles.age}>{age}</Text> : null}
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('ProfileTab')}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <Text style={styles.date}>{formatTodayDisplay()}</Text>

      {/* Emergency Button */}
      <EmergencyButton onPress={() => navigation.navigate('EmergencyCheck')} />

      {/* Active Alerts Banner */}
      {unresolvedEmergencies.length > 0 && (
        <View style={styles.alertsSection}>
          <Text style={styles.sectionTitle}>Active Alerts</Text>
          {unresolvedEmergencies.slice(0, 3).map((alert) => (
            <AlertRow
              key={alert.id}
              title={alert.title}
              message={alert.message}
              severity={alert.severity_level as any}
              timestamp={alert.created_at}
              onPress={() => navigation.navigate('AlertsTab')}
            />
          ))}
        </View>
      )}

      {/* Latest Vitals */}
      <View style={styles.vitalsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Latest Vitals</Text>
          <TouchableOpacity onPress={() => navigation.navigate('HistoryTab')}>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.vitalsScroll}>
          {latestVitals.bp && (
            <VitalCard
              name="BP"
              value={`${latestVitals.bp.bp_sys ?? '--'}/${latestVitals.bp.bp_dia ?? '--'}`}
              status={getBpStatus(latestVitals.bp.bp_sys, latestVitals.bp.bp_dia)}
              timeAgo={getTimeAgo(latestVitals.bp.logged_at_iso)}
              icon="❤️"
              onPress={() => navigation.navigate('HistoryTab')}
            />
          )}
          {latestVitals.pulse && (
            <VitalCard
              name="Pulse"
              value={String(latestVitals.pulse.pulse)}
              unit="bpm"
              status={getPulseStatus(latestVitals.pulse.pulse)}
              timeAgo={getTimeAgo(latestVitals.pulse.logged_at_iso)}
              icon="💓"
              onPress={() => navigation.navigate('HistoryTab')}
            />
          )}
          {latestVitals.spo2 && (
            <VitalCard
              name="SpO2"
              value={String(latestVitals.spo2.spo2)}
              unit="%"
              status={getSpo2Status(latestVitals.spo2.spo2)}
              timeAgo={getTimeAgo(latestVitals.spo2.logged_at_iso)}
              icon="🫁"
              onPress={() => navigation.navigate('HistoryTab')}
            />
          )}
          {latestVitals.glucose && (
            <VitalCard
              name="Glucose"
              value={String(latestVitals.glucose.glucose_value)}
              status={getGlucoseStatus(latestVitals.glucose.glucose_value, latestVitals.glucose.glucose_context)}
              timeAgo={getTimeAgo(latestVitals.glucose.logged_at_iso)}
              icon="🩸"
              onPress={() => navigation.navigate('HistoryTab')}
            />
          )}
          {latestVitals.temperature && (
            <VitalCard
              name="Temp"
              value={String(latestVitals.temperature.temp_value)}
              unit="°C"
              status={getTempStatus(latestVitals.temperature.temp_value)}
              timeAgo={getTimeAgo(latestVitals.temperature.logged_at_iso)}
              icon="🌡️"
              onPress={() => navigation.navigate('HistoryTab')}
            />
          )}
          {latestVitals.weight && (
            <VitalCard
              name="Weight"
              value={String(latestVitals.weight.weight_value)}
              unit="kg"
              status="normal"
              timeAgo={getTimeAgo(latestVitals.weight.logged_at_iso)}
              icon="⚖️"
              onPress={() => navigation.navigate('HistoryTab')}
            />
          )}
          {latestVitals.pain && (
            <VitalCard
              name="Pain"
              value={`${latestVitals.pain.pain_level}/10`}
              status={getPainStatus(latestVitals.pain.pain_level)}
              timeAgo={getTimeAgo(latestVitals.pain.logged_at_iso)}
              icon="🤕"
              onPress={() => navigation.navigate('HistoryTab')}
            />
          )}
          {Object.keys(latestVitals).length === 0 && (
            <View style={styles.emptyVitals}>
              <Text style={styles.emptyText}>No vitals logged yet</Text>
              <Text style={styles.emptyHint}>Tap "Log a Vital" to get started</Text>
            </View>
          )}
        </ScrollView>
      </View>

      {/* Quick Log Button */}
      <Button
        title="+ Log a Vital"
        onPress={() => navigation.navigate('VitalsTab')}
        variant="outline"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.space4,
    paddingBottom: spacing.space12,
  },
  greetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.space1,
  },
  greeting: {
    fontSize: 16,
    color: colors.textSecondary,
    fontFamily: 'Inter',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    fontFamily: 'Inter',
  },
  age: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'Inter',
    marginTop: 2,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
    fontFamily: 'Inter',
  },
  date: {
    fontSize: 12,
    color: colors.textDisabled,
    fontFamily: 'Inter',
    marginBottom: spacing.space5,
  },
  alertsSection: {
    marginBottom: spacing.space4,
  },
  vitalsSection: {
    marginBottom: spacing.space4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.space3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    fontFamily: 'Inter',
    marginBottom: spacing.space2,
  },
  viewAll: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500',
    fontFamily: 'Inter',
  },
  vitalsScroll: {
    marginBottom: spacing.space3,
  },
  emptyVitals: {
    width: 200,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: borderRadius.md,
    padding: spacing.space4,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontFamily: 'Inter',
    fontWeight: '500',
  },
  emptyHint: {
    fontSize: 11,
    color: colors.textDisabled,
    fontFamily: 'Inter',
    marginTop: 4,
  },
});
