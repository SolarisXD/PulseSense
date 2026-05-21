// PulseSense — Home Screen
// Gradient atmosphere, staggered motion entrance, proper icons, refined hierarchy

import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, withDelay, Easing } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../../constants/spacing';
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
import { EmergencyButton } from '../../components/emergency/EmergencyButton';
import { VitalCard } from '../../components/vitals/VitalCard';
import { AlertRow } from '../../components/ui/AlertRow';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';

const { width } = Dimensions.get('window');

// Animated section component for staggered entrance
function AnimatedSection({ children, index = 0, style }: { children: React.ReactNode; index?: number; style?: any }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(24);

  useEffect(() => {
    const delay = 300 + index * 120;
    opacity.value = withDelay(delay, withTiming(1, { duration: 500, easing: Easing.out(Easing.ease) }));
    translateY.value = withDelay(delay, withSpring(0, { damping: 18, stiffness: 140 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>;
}

export function HomeScreen({ navigation }: any) {
  const profile = useProfileStore((s) => s.profile);
  const age = useAgeCalculator();
  const activeAlerts = useAlertStore((s) => s.activeAlerts);
  const [latestVitals, setLatestVitals] = useState<Record<string, any>>({});
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

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

  // Vitals icon map
  const vitalIconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
    bp: 'heart-half',
    pulse: 'pulse',
    spo2: 'analytics-outline',
    glucose: 'water-outline',
    temperature: 'thermometer-outline',
    weight: 'scale-outline',
    pain: 'bandage-outline',
  };

  const vitalCards: Array<{ key: string; component: React.ReactNode }> = [];

  if (latestVitals.bp) {
    vitalCards.push({
      key: 'bp',
      component: (
        <VitalCard
          key="bp"
          name="BP"
          value={`${latestVitals.bp.bp_sys ?? '--'}/${latestVitals.bp.bp_dia ?? '--'}`}
          status={getBpStatus(latestVitals.bp.bp_sys, latestVitals.bp.bp_dia)}
          timeAgo={getTimeAgo(latestVitals.bp.logged_at_iso)}
          iconName={vitalIconMap.bp}
          onPress={() => navigation.navigate('HistoryTab')}
          index={0}
        />
      ),
    });
  }
  if (latestVitals.pulse) {
    vitalCards.push({
      key: 'pulse',
      component: (
        <VitalCard
          key="pulse"
          name="Pulse"
          value={String(latestVitals.pulse.pulse)}
          unit="bpm"
          status={getPulseStatus(latestVitals.pulse.pulse)}
          timeAgo={getTimeAgo(latestVitals.pulse.logged_at_iso)}
          iconName={vitalIconMap.pulse}
          onPress={() => navigation.navigate('HistoryTab')}
          index={1}
        />
      ),
    });
  }
  if (latestVitals.spo2) {
    vitalCards.push({
      key: 'spo2',
      component: (
        <VitalCard
          key="spo2"
          name="SpO2"
          value={String(latestVitals.spo2.spo2)}
          unit="%"
          status={getSpo2Status(latestVitals.spo2.spo2)}
          timeAgo={getTimeAgo(latestVitals.spo2.logged_at_iso)}
          iconName={vitalIconMap.spo2}
          onPress={() => navigation.navigate('HistoryTab')}
          index={2}
        />
      ),
    });
  }
  if (latestVitals.glucose) {
    vitalCards.push({
      key: 'glucose',
      component: (
        <VitalCard
          key="glucose"
          name="Glucose"
          value={String(latestVitals.glucose.glucose_value)}
          status={getGlucoseStatus(latestVitals.glucose.glucose_value, latestVitals.glucose.glucose_context)}
          timeAgo={getTimeAgo(latestVitals.glucose.logged_at_iso)}
          iconName={vitalIconMap.glucose}
          onPress={() => navigation.navigate('HistoryTab')}
          index={3}
        />
      ),
    });
  }
  if (latestVitals.temperature) {
    vitalCards.push({
      key: 'temp',
      component: (
        <VitalCard
          key="temp"
          name="Temp"
          value={String(latestVitals.temperature.temp_value)}
          unit="°C"
          status={getTempStatus(latestVitals.temperature.temp_value)}
          timeAgo={getTimeAgo(latestVitals.temperature.logged_at_iso)}
          iconName={vitalIconMap.temperature}
          onPress={() => navigation.navigate('HistoryTab')}
          index={4}
        />
      ),
    });
  }
  if (latestVitals.weight) {
    vitalCards.push({
      key: 'weight',
      component: (
        <VitalCard
          key="weight"
          name="Weight"
          value={String(latestVitals.weight.weight_value)}
          unit="kg"
          status="normal"
          timeAgo={getTimeAgo(latestVitals.weight.logged_at_iso)}
          iconName={vitalIconMap.weight}
          onPress={() => navigation.navigate('HistoryTab')}
          index={5}
        />
      ),
    });
  }
  if (latestVitals.pain) {
    vitalCards.push({
      key: 'pain',
      component: (
        <VitalCard
          key="pain"
          name="Pain"
          value={`${latestVitals.pain.pain_level}/10`}
          status={getPainStatus(latestVitals.pain.pain_level)}
          timeAgo={getTimeAgo(latestVitals.pain.logged_at_iso)}
          iconName={vitalIconMap.pain}
          onPress={() => navigation.navigate('HistoryTab')}
          index={6}
        />
      ),
    });
  }

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
              <Text style={styles.date}>{formatTodayDisplay()}</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('ProfileTab')} activeOpacity={0.7}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>
                  {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                </Text>
              </View>
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
                severity={alert.severity_level as any}
                timestamp={alert.created_at}
                onPress={() => navigation.navigate('AlertsTab')}
              />
            ))}
          </AnimatedSection>
        )}

        {/* Latest Vitals */}
        <AnimatedSection index={3}>
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
        <AnimatedSection index={4}>
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
  emptyHint: {
    fontSize: 11,
    color: colors.textDisabled,
    fontFamily: fonts.body,
  },
});
