// PulseSense — Home Screen
// Gradient atmosphere, staggered motion entrance, proper icons, refined hierarchy

import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Dimensions,
  Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';
import { spacing, borderRadius } from '../../constants/spacing';
import { fonts } from '../../constants/typography';
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
import { AnimatedSection } from '../../components/ui/AnimatedSection';
import { EmergencyButton } from '../../components/emergency/EmergencyButton';
import { VitalCard } from '../../components/vitals/VitalCard';
import { AlertRow } from '../../components/ui/AlertRow';
import type { SeverityLevel } from '../../constants/rules';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { useHealthInsights } from '../../hooks/useHealthInsights';
import { InsightCard } from '../../components/health/InsightCard';

const { width } = Dimensions.get('window');

export function HomeScreen({ navigation }: any) {
  const profile = useProfileStore((s) => s.profile);
  const age = useAgeCalculator();
  const activeAlerts = useAlertStore((s) => s.activeAlerts);
  const [latestVitals, setLatestVitals] = useState<Record<string, any>>({});
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const { insights, loading: insightsLoading } = useHealthInsights();

  const loadVitals = useCallback(async () => {
    setLoading(true);
    try {
      const db = await getDB();
      const vitals = await getLatestPerVital(db);
      setLatestVitals(vitals);
    } catch (err) {
      console.error('Failed to load vitals:', err);
    } finally {
      setLoading(false);
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

  const vitalCardConfigs: Array<{
    dataKey: string;
    cardKey: string;
    name: string;
    getValue: (data: any) => string;
    getStatus: (data: any) => VitalStatus;
    iconName: keyof typeof Ionicons.glyphMap;
    getUnit?: (data: any) => string | undefined;
    staticUnit?: string;
  }> = [
    { dataKey: 'bp', cardKey: 'bp', name: 'BP', iconName: 'heart-half', getValue: (d) => `${d.bp_sys ?? '--'}/${d.bp_dia ?? '--'}`, getStatus: (d) => getBpStatus(d.bp_sys, d.bp_dia) },
    { dataKey: 'pulse', cardKey: 'pulse', name: 'Pulse', staticUnit: 'bpm', iconName: 'pulse', getValue: (d) => String(d.pulse), getStatus: (d) => getPulseStatus(d.pulse) },
    { dataKey: 'spo2', cardKey: 'spo2', name: 'SpO2', staticUnit: '%', iconName: 'analytics-outline', getValue: (d) => String(d.spo2), getStatus: (d) => getSpo2Status(d.spo2) },
    { dataKey: 'glucose', cardKey: 'glucose', name: 'Glucose', iconName: 'water-outline', getValue: (d) => String(d.glucose_value), getStatus: (d) => getGlucoseStatus(d.glucose_value, d.glucose_context), getUnit: (d) => d.glucose_unit || 'mg/dL' },
    { dataKey: 'temperature', cardKey: 'temp', name: 'Temp', staticUnit: '°C', iconName: 'thermometer-outline', getValue: (d) => String(d.temp_value), getStatus: (d) => getTempStatus(d.temp_value) },
    { dataKey: 'weight', cardKey: 'weight', name: 'Weight', staticUnit: 'kg', iconName: 'scale-outline', getValue: (d) => String(d.weight_value), getStatus: () => 'normal' as VitalStatus },
    { dataKey: 'pain', cardKey: 'pain', name: 'Pain', iconName: 'bandage-outline', getValue: (d) => `${d.pain_level}/10`, getStatus: (d) => getPainStatus(d.pain_level) },
  ];

  const vitalCards: Array<{ key: string; component: React.ReactNode }> = [];

  vitalCardConfigs.forEach((config) => {
    const data = latestVitals[config.dataKey];
    if (!data) return;
    const unit = config.getUnit ? config.getUnit(data) : config.staticUnit;
    vitalCards.push({
      key: config.cardKey,
      component: (
        <VitalCard
          key={config.cardKey}
          name={config.name}
          value={config.getValue(data)}
          unit={unit}
          status={config.getStatus(data)}
          timeAgo={getTimeAgo(data.logged_at_iso)}
          iconName={config.iconName}
          onPress={() => navigation.navigate('HistoryTab')}
          index={vitalCards.length}
        />
      ),
    });
  });

  // ---------- Skeleton Loading State ----------
  if (loading) {
    return (
      <LinearGradient colors={['#F0F4F8', '#E8EEF4', '#E4ECF2']} style={styles.gradient}>
        <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Greeting skeleton */}
          <View style={styles.greetingRow}>
            <View style={{ flex: 1 }}>
              <Skeleton.Box width={120} height={14} style={{ marginBottom: 8 }} />
              <Skeleton.Box width={180} height={28} style={{ marginBottom: 6 }} />
              <Skeleton.Box width={100} height={12} />
            </View>
            <Skeleton.Circle size={46} />
          </View>

          {/* Emergency button skeleton */}
          <Skeleton.Box width="100%" height={64} borderRadius={10} style={{ marginBottom: 24 }} />

          {/* Latest Vitals skeleton */}
          <View style={styles.sectionHeader}>
            <Skeleton.Box width={16} height={16} borderRadius={8} />
            <Skeleton.Box width={120} height={16} />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.vitalsScroll}>
            <Skeleton.Box width={135} height={110} borderRadius={10} style={{ marginRight: 12 }} />
            <Skeleton.Box width={135} height={110} borderRadius={10} style={{ marginRight: 12 }} />
            <Skeleton.Box width={135} height={110} borderRadius={10} />
          </ScrollView>

          {/* Log a Vital skeleton */}
          <Skeleton.Box width="100%" height={48} borderRadius={10} />
        </ScrollView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#F0F4F8', '#E8EEF4', '#E4ECF2']}
      style={styles.gradient}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting Header */}
        <AnimatedSection index={0}>
          <View style={styles.greetingRow}>
            <View>
              <Text style={styles.greetingSub}>{greeting}</Text>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{profile?.full_name || 'User'}</Text>
                {age ? <Text style={styles.ageDot}>·</Text> : null}
                {age ? <Text style={styles.age}>{age}</Text> : null}
              </View>
              {profile?.dob ? (
                <Text style={styles.dobText}>DOB: {profile.dob}</Text>
              ) : null}
              <Text style={styles.date}>{formatTodayDisplay()}</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('ProfileTab')} activeOpacity={0.7}>
              {profile?.photo_uri ? (
                <Image source={{ uri: profile.photo_uri }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>
                    {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </AnimatedSection>

        {/* Emergency Button */}
        <AnimatedSection index={1}>
          <EmergencyButton onPress={() => navigation.navigate('EmergencyCheck')} />
        </AnimatedSection>

        {/* Active Alerts */}
        {unresolvedEmergencies.length > 0 && (
          <AnimatedSection index={2}>
            <View style={styles.sectionHeader}>
              <Ionicons name="notifications" size={16} color={colors.danger} />
              <Text style={styles.sectionTitle}>Active Alerts</Text>
              <View style={styles.alertCount}>
                <Text style={styles.alertCountText}>{unresolvedEmergencies.length}</Text>
              </View>
            </View>
            {unresolvedEmergencies.slice(0, 3).map((alert) => (
              <AlertRow
                key={alert.id}
                title={alert.title}
                message={alert.message}
                severity={alert.severity_level as SeverityLevel}
                timestamp={alert.created_at}
                onPress={() => navigation.navigate('AlertsTab')}
              />
            ))}
          </AnimatedSection>
        )}

        {/* Health Insights */}
        <AnimatedSection index={3}>
          <View style={styles.sectionHeader}>
            <Ionicons name="bulb" size={16} color={colors.primaryLight} />
            <Text style={styles.sectionTitle}>Health Insights</Text>
          </View>
          {insightsLoading ? (
            <Skeleton.Box width="100%" height={80} borderRadius={10} style={{ marginBottom: 12 }} />
          ) : insights.length > 0 ? (
            insights.slice(0, 3).map((insight, i) => (
              <InsightCard key={insight.id} insight={insight} index={i} />
            ))
          ) : (
            <View style={styles.emptyInsights}>
              <Ionicons name="bulb-outline" size={24} color={colors.textDisabled} />
              <Text style={styles.emptyInsightsText}>No insights yet — keep logging your vitals!</Text>
            </View>
          )}
        </AnimatedSection>

        {/* Latest Vitals */}
        <AnimatedSection index={4}>
          <View style={styles.sectionHeader}>
            <Ionicons name="pulse" size={16} color={colors.primary} />
            <Text style={styles.sectionTitle}>Latest Vitals</Text>
            <TouchableOpacity onPress={() => navigation.navigate('HistoryTab')}>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.vitalsScroll}>
            {vitalCards.length > 0 ? (
              vitalCards.map((vc) => vc.component)
            ) : (
              <View style={styles.emptyVitals}>
                <Ionicons name="heart-outline" size={28} color={colors.textDisabled} />
                <Text style={styles.emptyText}>No vitals logged yet</Text>
                <Text style={styles.emptyHint}>Tap "Log a Vital" to get started</Text>
              </View>
            )}
          </ScrollView>
        </AnimatedSection>

        {/* Quick Log Button */}
        <AnimatedSection index={5}>
          <Button
            title="+ Log a Vital"
            onPress={() => navigation.navigate('VitalsTab')}
            variant="outline"
          />
        </AnimatedSection>

        <View style={{ height: spacing.space6 }} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.space4,
    paddingTop: spacing.space12,
    paddingBottom: spacing.space12,
  },
  greetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.space5,
  },
  greetingSub: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: fonts.body,
    marginBottom: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
  },
  name: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.textPrimary,
    fontFamily: fonts.display,
    letterSpacing: -0.3,
  },
  ageDot: {
    fontSize: 18,
    color: colors.textDisabled,
    fontFamily: fonts.body,
    marginHorizontal: 6,
  },
  age: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: fonts.body,
  },
  dobText: {
    fontSize: 12,
    color: colors.textDisabled,
    fontFamily: fonts.body,
    marginTop: 2,
  },
  date: {
    fontSize: 12,
    color: colors.textDisabled,
    fontFamily: fonts.body,
    marginTop: 2,
  },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(26,95,122,0.1)',
  },
  avatarImage: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: 'rgba(26,95,122,0.1)',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
    fontFamily: fonts.display,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.space3,
    gap: spacing.space2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    fontFamily: fonts.display,
    flex: 1,
  },
  alertCount: {
    backgroundColor: colors.dangerSurface,
    paddingHorizontal: 7,
    paddingVertical: 1,
    borderRadius: 9,
    minWidth: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.danger,
    fontFamily: fonts.body,
  },
  viewAll: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500',
    fontFamily: fonts.body,
  },
  vitalsScroll: {
    marginBottom: spacing.space4,
  },
  emptyVitals: {
    width: width - spacing.space4 * 2,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderStyle: 'dashed',
    gap: spacing.space1,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: fonts.body,
    fontWeight: '500',
  },
  emptyInsights: {
    paddingVertical: spacing.space5,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.space2,
    marginBottom: spacing.space3,
  },
  emptyInsightsText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontFamily: fonts.body,
    textAlign: 'center',
  },
  emptyHint: {
    fontSize: 11,
    color: colors.textDisabled,
    fontFamily: fonts.body,
  },
});
