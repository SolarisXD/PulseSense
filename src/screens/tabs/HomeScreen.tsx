// PulseSense — Home Screen

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
import { useColors } from '../../hooks/useColors';
import { colorsDark } from '../../constants/colorsDark';
import { useThemeStore } from '../../store/themeStore';
import { spacing, borderRadius } from '../../constants/spacing';
import { fonts, scaleSize } from '../../constants/typography';
import { useProfileStore } from '../../store/profileStore';
import { useAlertStore } from '../../store/alertStore';
import { useAgeCalculator } from '../../hooks/useAgeCalculator';
import { getDB, loadStores } from '../../hooks/useDB';
import { getLatestPerVital } from '../../db/queries/vitals';
import { getLatestCustomVitalLogs } from '../../db/queries/customVitals';
import { getCustomVitalStatus } from '../../utils/vitalStatus';
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
import { useSettingsStore, FONT_SCALE_MULTIPLIERS } from '../../store/settingsStore';

const { width } = Dimensions.get('window');

const quickActionDefs = [
  { icon: 'pulse-outline' as const, label: 'Log Vital', colorKey: 'primary' as const, nav: 'VitalsTab' },
  { icon: 'medkit-outline' as const, label: 'Emergency', colorKey: 'danger' as const, nav: 'EmergencyCheck' },
  { icon: 'bar-chart-outline' as const, label: 'History', colorKey: 'primaryLight' as const, nav: 'HistoryTab' },
];

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

export function HomeScreen({ navigation }: any) {
  const c = useColors();
  const isDark = useThemeStore((s) => s.isDark);
  const profile = useProfileStore((s) => s.profile);
  const age = useAgeCalculator();
  const activeAlerts = useAlertStore((s) => s.activeAlerts);
  const [latestVitals, setLatestVitals] = useState<Record<string, any>>({});
  const [latestCustomVitals, setLatestCustomVitals] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const { insights, loading: insightsLoading } = useHealthInsights();
  const fontScale = useSettingsStore((s) => s.fontScale);
  const fs = FONT_SCALE_MULTIPLIERS[fontScale];
  const sc = useMemo(() => createStyles(fs), [fs]);

  const gradientColors = useMemo(
    () => (isDark ? colorsDark.bgGradientHome : ['#F0F4F8', '#E8EEF4', '#E4ECF2'] as const) as readonly string[],
    [isDark],
  );

  const loadVitals = useCallback(async () => {
    setLoading(true);
    try {
      const db = await getDB();
      const vitals = await getLatestPerVital(db);
      setLatestVitals(vitals);
      const custom = await getLatestCustomVitalLogs(db);
      setLatestCustomVitals(custom);
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
    if (diffMs < 0) return 'Just now';
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  const unresolvedEmergencies = activeAlerts.filter(
    (a) => a.severity_level === 'EMERGENCY_NOW' || a.severity_level === 'URGENT_SAME_DAY'
  );

  const bannerStatus = useMemo(() => {
    if (insights.length === 0) return null;
    const hasWarning = insights.some((i) => i.type === 'warning');
    const hasInfo = insights.some((i) => i.type === 'info');
    const warningCount = insights.filter((i) => i.type === 'warning').length;
    if (hasWarning) {
      return { type: 'warning' as const, icon: 'alert-triangle' as const, color: c.danger, bg: c.dangerSurface, title: 'Needs Attention', message: `${warningCount} health item${warningCount > 1 ? 's' : ''} flagged for review` };
    }
    if (hasInfo) {
      return { type: 'info' as const, icon: 'information-circle' as const, color: c.primary, bg: c.primarySurface, title: 'Health Updates', message: 'Review your insights for important health information' };
    }
    return { type: 'positive' as const, icon: 'checkmark-circle' as const, color: c.success, bg: c.successSurface, title: 'All Clear', message: 'All vitals in normal range — keep up the good habits!' };
  }, [insights, c]);

  const sortedInsights = useMemo(() => {
    const severityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
    const typeOrder: Record<string, number> = { warning: 0, info: 1, positive: 2 };
    return [...insights].sort((a, b) => {
      const sev = (severityOrder[a.severity] ?? 2) - (severityOrder[b.severity] ?? 2);
      if (sev !== 0) return sev;
      return (typeOrder[a.type] ?? 2) - (typeOrder[b.type] ?? 2);
    });
  }, [insights]);

  const vitalCards = useMemo(() => {
    const cards: Array<{ key: string; component: React.ReactNode }> = [];
    vitalCardConfigs.forEach((config) => {
      const data = latestVitals[config.dataKey];
      if (!data) return;
      const unit = config.getUnit ? config.getUnit(data) : config.staticUnit;
      cards.push({
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
            index={cards.length}
          />
        ),
      });
    });
    return cards;
  }, [latestVitals, navigation, c.primary, c.danger, c.primaryLight]);

  if (loading) {
    return (
      <LinearGradient colors={['#F0F4F8', '#E8EEF4', '#E4ECF2']} style={sc.gradient}>
        <ScrollView style={sc.container} contentContainerStyle={sc.content} showsVerticalScrollIndicator={false}>
          <View style={sc.greetingRow}>
            <View style={{ flex: 1 }}>
              <Skeleton.Box width={120} height={14} style={{ marginBottom: 8 }} />
              <Skeleton.Box width={180} height={28} style={{ marginBottom: 6 }} />
              <Skeleton.Box width={100} height={12} />
            </View>
            <Skeleton.Circle size={46} />
          </View>
          <Skeleton.Box width="100%" height={64} borderRadius={10} style={{ marginBottom: 24 }} />
          <View style={sc.sectionHeader}>
            <Skeleton.Box width={16} height={16} borderRadius={8} />
            <Skeleton.Box width={120} height={16} />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={sc.vitalsScroll}>
            <Skeleton.Box width={135} height={110} borderRadius={10} style={{ marginRight: 12 }} />
            <Skeleton.Box width={135} height={110} borderRadius={10} style={{ marginRight: 12 }} />
            <Skeleton.Box width={135} height={110} borderRadius={10} />
          </ScrollView>
          <Skeleton.Box width="100%" height={48} borderRadius={10} />
        </ScrollView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={gradientColors as any}
      style={sc.gradient}
    >
      <ScrollView
        style={sc.container}
        contentContainerStyle={sc.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.primary} />}
        showsVerticalScrollIndicator={false}
      >
        <AnimatedSection index={0}>
          <View style={sc.greetingRow}>
            <View style={{ flex: 1, marginRight: spacing.space3 }}>
              <Text style={[sc.greetingSub, { color: c.textSecondary }]}>{greeting}</Text>
              <View style={sc.nameRow}>
                <Text style={[sc.name, { color: c.textPrimary }]}>{profile?.full_name || 'User'}</Text>
                {age ? <Text style={[sc.ageDot, { color: c.textDisabled }]}>·</Text> : null}
                {age ? <Text style={[sc.age, { color: c.textSecondary }]}>{age}</Text> : null}
              </View>
              {profile?.dob ? (
                <Text style={[sc.dobText, { color: c.textDisabled }]}>DOB: {profile.dob}</Text>
              ) : null}
              <Text style={[sc.date, { color: c.textDisabled }]}>{formatTodayDisplay()}</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('ProfileTab')} activeOpacity={0.7}>
              {profile?.photo_uri ? (
                <Image source={{ uri: profile.photo_uri }} style={sc.avatarImage} />
              ) : (
                <View style={[sc.avatarCircle, { backgroundColor: c.primarySurface }]}>
                  <Text style={[sc.avatarText, { color: c.primary }]}>
                    {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </AnimatedSection>

        {bannerStatus && (
          <AnimatedSection index={1}>
            <TouchableOpacity
              style={[sc.banner, { backgroundColor: bannerStatus.bg }]}
              onPress={() => navigation.navigate(bannerStatus.type === 'warning' ? 'AlertsTab' : 'HistoryTab')}
              activeOpacity={0.8}
            >
              <View style={[sc.bannerIcon, { backgroundColor: bannerStatus.color + '25' }]}>
                <Ionicons name={bannerStatus.icon as keyof typeof Ionicons.glyphMap} size={22} color={bannerStatus.color} />
              </View>
              <View style={sc.bannerContent}>
                <Text style={[sc.bannerTitle, { color: bannerStatus.color }]}>{bannerStatus.title}</Text>
                <Text style={[sc.bannerMessage, { color: c.textSecondary }]}>{bannerStatus.message}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={bannerStatus.color} />
            </TouchableOpacity>
          </AnimatedSection>
        )}

        <AnimatedSection index={2}>
          <View style={sc.quickActionsRow}>
            {quickActionDefs.map((action) => {
              const actionColor = c[action.colorKey];
              return (
                <TouchableOpacity
                  key={action.label}
                  style={[sc.quickActionCard, { backgroundColor: c.surface }]}
                  onPress={() => navigation.navigate(action.nav)}
                  activeOpacity={0.7}
                >
                  <View style={[sc.quickActionIcon, { backgroundColor: actionColor + '18' }]}>
                    <Ionicons name={action.icon} size={20} color={actionColor} />
                  </View>
                  <Text style={[sc.quickActionLabel, { color: c.textSecondary }]}>{action.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </AnimatedSection>

        <AnimatedSection index={3}>
          <EmergencyButton onPress={() => navigation.navigate('EmergencyCheck')} />
        </AnimatedSection>

        {unresolvedEmergencies.length > 0 && (
        <AnimatedSection index={4}>
            <View style={sc.sectionHeader}>
              <Ionicons name="notifications" size={16} color={c.danger} />
              <Text style={[sc.sectionTitle, { color: c.textPrimary }]}>Active Alerts</Text>
              <View style={[sc.alertCount, { backgroundColor: c.dangerSurface }]}>
                <Text style={[sc.alertCountText, { color: c.danger }]}>{unresolvedEmergencies.length}</Text>
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

        <AnimatedSection index={5}>
          <View style={sc.sectionHeader}>
            <Ionicons name="bulb" size={16} color={c.primaryLight} />
            <Text style={[sc.sectionTitle, { color: c.textPrimary }]}>Health Insights</Text>
            {sortedInsights.length > 0 && (
              <Text style={[sc.insightCount, { color: c.textDisabled }]}>{sortedInsights.length} item{sortedInsights.length !== 1 ? 's' : ''}</Text>
            )}
          </View>
          {insightsLoading ? (
            <Skeleton.Box width="100%" height={80} borderRadius={10} style={{ marginBottom: 12 }} />
          ) : sortedInsights.length > 0 ? (
            sortedInsights.map((insight, i) => (
              <InsightCard key={insight.id} insight={insight} index={i} />
            ))
          ) : (
            <View style={sc.emptyInsights}>
              <Ionicons name="bulb-outline" size={24} color={c.textDisabled} />
              <Text style={[sc.emptyInsightsText, { color: c.textSecondary }]}>No insights yet — keep logging your vitals!</Text>
            </View>
          )}
        </AnimatedSection>

        <AnimatedSection index={6}>
          <View style={sc.sectionHeader}>
            <Ionicons name="pulse" size={16} color={c.primary} />
            <Text style={[sc.sectionTitle, { color: c.textPrimary }]}>Latest Vitals</Text>
            <TouchableOpacity onPress={() => navigation.navigate('HistoryTab')}>
              <Text style={[sc.viewAll, { color: c.primary }]}>View All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={sc.vitalsScroll}>
            {vitalCards.length > 0 || latestCustomVitals.length > 0 ? (
              <>
                {vitalCards.map((vc) => vc.component)}
                {latestCustomVitals.map((cv, idx) => (
                  <VitalCard
                    key={`cv-${cv.id}`}
                    name={cv.definition_name}
                    value={String(cv.value)}
                    unit={cv.unit}
                    status={getCustomVitalStatus(cv.value, null, null)}
                    timeAgo={getTimeAgo(cv.logged_at_iso || cv.created_at)}
                    iconName="flask-outline"
                    onPress={() => navigation.navigate('HistoryTab')}
                    index={idx + vitalCards.length}
                  />
                ))}
              </>
            ) : (
              <View style={[sc.emptyVitals, { backgroundColor: c.surface, borderColor: c.borderLight }]}>
                <Ionicons name="heart-outline" size={28} color={c.textDisabled} />
                <Text style={[sc.emptyText, { color: c.textSecondary }]}>No vitals logged yet</Text>
                <Text style={[sc.emptyHint, { color: c.textDisabled }]}>Tap "Log a Vital" to get started</Text>
              </View>
            )}
          </ScrollView>
        </AnimatedSection>

        <AnimatedSection index={7}>
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

function createStyles(fs: number) { const fn = (size: number) => scaleSize(size, fs); return StyleSheet.create({
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
    fontSize: fn(14),
    fontFamily: fonts.body,
    marginBottom: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
  },
  name: {
    fontSize: fn(26),
    fontWeight: '700',
    fontFamily: fonts.display,
    letterSpacing: -0.3,
  },
  ageDot: {
    fontSize: fn(18),
    fontFamily: fonts.body,
    marginHorizontal: 6,
  },
  age: {
    fontSize: fn(14),
    fontFamily: fonts.body,
  },
  dobText: {
    fontSize: fn(12),
    fontFamily: fonts.body,
    marginTop: 2,
  },
  date: {
    fontSize: fn(12),
    fontFamily: fonts.body,
    marginTop: 2,
  },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
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
    fontSize: fn(18),
    fontWeight: '600',
    fontFamily: fonts.display,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.space3,
    gap: spacing.space2,
  },
  sectionTitle: {
    fontSize: fn(16),
    fontWeight: '600',
    fontFamily: fonts.display,
    flex: 1,
  },
  alertCount: {
    paddingHorizontal: 7,
    paddingVertical: 1,
    borderRadius: 9,
    minWidth: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertCountText: {
    fontSize: fn(11),
    fontWeight: '700',
    fontFamily: fonts.body,
  },
  viewAll: {
    fontSize: fn(13),
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
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    gap: spacing.space1,
  },
  emptyText: {
    fontSize: fn(14),
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
    fontSize: fn(13),
    fontFamily: fonts.body,
    textAlign: 'center',
  },
  emptyHint: {
    fontSize: fn(11),
    fontFamily: fonts.body,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.md,
    padding: spacing.space4,
    marginBottom: spacing.space3,
  },
  bannerIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.space3,
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: fn(15),
    fontWeight: '600',
    fontFamily: fonts.display,
    marginBottom: 2,
  },
  bannerMessage: {
    fontSize: fn(12),
    fontFamily: fonts.body,
    lineHeight: 16,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: spacing.space2,
    marginBottom: spacing.space4,
  },
  quickActionCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.space3,
    borderRadius: borderRadius.md,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  quickActionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.space1 + 2,
  },
  quickActionLabel: {
    fontSize: fn(11),
    fontWeight: '500',
    fontFamily: fonts.body,
  },
  insightCount: {
    fontSize: fn(12),
    fontFamily: fonts.body,
  },
}); }
