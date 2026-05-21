// PulseSense — History Screen
// Filterable tabular view of vitals with color-coded status
// Updated with motion and refined typography

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, Easing } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../../constants/spacing';
import { fonts } from '../../constants/typography';
import { TableHeader } from '../../components/vitals/TableHeader';
import { TableRow } from '../../components/vitals/TableRow';
import { getDB } from '../../hooks/useDB';
import { getVitalLogsByDateRange } from '../../db/queries/vitals';
import { getLast30DaysRange, formatDisplayDate, formatDisplayTime } from '../../utils/dateUtils';
import {
  getBpStatus, getPulseStatus, getSpo2Status,
  getGlucoseStatus, getTempStatus, getPainStatus,
  type VitalStatus,
} from '../../utils/vitalStatus';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';

const ALL_VITALS = 'all';
const VITAL_OPTIONS = [
  { key: ALL_VITALS, label: 'All Vitals', icon: 'grid-outline' as const },
  { key: 'bp', label: 'BP', icon: 'heart-half' as const },
  { key: 'pulse', label: 'Pulse', icon: 'pulse' as const },
  { key: 'spo2', label: 'SpO2', icon: 'analytics-outline' as const },
  { key: 'glucose', label: 'Glucose', icon: 'water-outline' as const },
  { key: 'temp', label: 'Temp', icon: 'thermometer-outline' as const },
  { key: 'weight', label: 'Weight', icon: 'scale-outline' as const },
  { key: 'pain', label: 'Pain', icon: 'bandage-outline' as const },
];

export function HistoryScreen({ navigation }: any) {
  const [selectedFilter, setSelectedFilter] = useState(ALL_VITALS);
  const [vitalLogs, setVitalLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadVitals();
    }, [selectedFilter])
  );

  const loadVitals = async () => {
    setLoading(true);
    try {
      const db = await getDB();
      const range = getLast30DaysRange();
      const logs = await getVitalLogsByDateRange(db, range.start, range.end);
      setVitalLogs(logs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getColumns = () => {
    if (selectedFilter === ALL_VITALS) {
      return ['BP', 'Pulse', 'SpO2', 'Glucose', 'Temp', 'Weight', 'Pain'];
    }
    const map: Record<string, string> = {
      bp: 'BP', pulse: 'Pulse', spo2: 'SpO2',
      glucose: 'Glucose', temp: 'Temp', weight: 'Weight', pain: 'Pain',
    };
    return [map[selectedFilter] || selectedFilter];
  };

  const getCellData = (log: any) => {
    const cols = getColumns();
    return cols.map((col) => {
      switch (col) {
        case 'BP':
          return {
            value: log.bp_sys ? `${log.bp_sys}/${log.bp_dia}` : '-',
            status: log.bp_sys ? getBpStatus(log.bp_sys, log.bp_dia) : 'unknown' as VitalStatus,
          };
        case 'Pulse':
          return {
            value: log.pulse != null ? String(log.pulse) : '-',
            status: log.pulse != null ? getPulseStatus(log.pulse) : 'unknown' as VitalStatus,
          };
        case 'SpO2':
          return {
            value: log.spo2 != null ? `${log.spo2}%` : '-',
            status: log.spo2 != null ? getSpo2Status(log.spo2) : 'unknown' as VitalStatus,
          };
        case 'Glucose':
          return {
            value: log.glucose_value != null ? String(log.glucose_value) : '-',
            status: log.glucose_value != null ? getGlucoseStatus(log.glucose_value, log.glucose_context) : 'unknown' as VitalStatus,
          };
        case 'Temp':
          return {
            value: log.temp_value != null ? `${log.temp_value}°` : '-',
            status: log.temp_value != null ? getTempStatus(log.temp_value) : 'unknown' as VitalStatus,
          };
        case 'Weight':
          return { value: log.weight_value != null ? String(log.weight_value) : '-', status: 'normal' as VitalStatus };
        case 'Pain':
          return {
            value: log.pain_level != null ? `${log.pain_level}/10` : '-',
            status: log.pain_level != null ? getPainStatus(log.pain_level) : 'unknown' as VitalStatus,
          };
        default:
          return { value: '-', status: 'unknown' as VitalStatus };
      }
    });
  };

  const filteredLogs = vitalLogs.filter((log) => {
    if (selectedFilter === ALL_VITALS) return true;
    const hasData: Record<string, boolean> = {
      bp: log.bp_sys !== null,
      pulse: log.pulse !== null,
      spo2: log.spo2 !== null,
      glucose: log.glucose_value !== null,
      temp: log.temp_value !== null,
      weight: log.weight_value !== null,
      pain: log.pain_level !== null,
    };
    return hasData[selectedFilter] || false;
  });

  // ---------- Skeleton Loading State ----------
  if (loading) {
    return (
      <View style={styles.container}>
        {/* Filter bar skeleton */}
        <View style={styles.filterBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton.Box key={i} width={72} height={30} borderRadius={15} style={{ marginRight: 8 }} />
            ))}
          </ScrollView>
        </View>
        {/* Table rows skeleton */}
        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          {/* Table header skeleton */}
          <Skeleton.Box width="100%" height={32} borderRadius={6} style={{ marginBottom: 8 }} />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton.Box key={i} width="100%" height={44} borderRadius={6} style={{ marginBottom: 4 }} />
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Filter Bar */}
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {VITAL_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.key}
              style={[styles.filterChip, selectedFilter === opt.key && styles.filterChipSelected]}
              onPress={() => setSelectedFilter(opt.key)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={opt.icon}
                size={13}
                color={selectedFilter === opt.key ? '#FFFFFF' : colors.textSecondary}
                style={{ marginRight: 4 }}
              />
              <Text style={[styles.filterText, selectedFilter === opt.key && styles.filterTextSelected]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Table */}
      <FlatList
        data={filteredLogs}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={<TableHeader columns={getColumns()} />}
        renderItem={({ item, index }) => (
          <TableRow
            date={formatDisplayDate(item.logged_at_display)}
            time={formatDisplayTime(item.logged_at_display)}
            cells={getCellData(item)}
            isEven={index % 2 === 1}
            onPress={() => navigation.navigate('VitalDetail', { logId: item.id })}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="analytics-outline" size={48} color={colors.textDisabled} />
            <Text style={styles.emptyText}>No vitals recorded in the last 30 days</Text>
            <Text style={styles.emptyHint}>Log your first vital from the Log tab</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Export Button */}
      <View style={styles.exportBar}>
        <Button
          title="Export Selected"
          onPress={() => navigation.navigate('Export', {
            preSelectedType: 'vitals_report',
            preFilterVital: selectedFilter !== ALL_VITALS ? selectedFilter : undefined,
          })}
          variant="outline"
          size="medium"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  filterBar: {
    paddingVertical: spacing.space3,
    paddingHorizontal: spacing.space4,
    backgroundColor: colors.surface,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.borderLight,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.space2,
    paddingHorizontal: spacing.space4,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceAlt,
    marginRight: spacing.space2,
  },
  filterChipSelected: {
    backgroundColor: colors.primary,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
    fontFamily: fonts.body,
  },
  filterTextSelected: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingBottom: spacing.space12,
  },
  empty: {
    padding: spacing.space12,
    alignItems: 'center',
    gap: spacing.space2,
  },
  emptyText: {
    fontSize: 15,
    color: colors.textSecondary,
    fontFamily: fonts.body,
    fontWeight: '500',
  },
  emptyHint: {
    fontSize: 12,
    color: colors.textDisabled,
    fontFamily: fonts.body,
    marginTop: spacing.space1,
  },
  exportBar: {
    padding: spacing.space4,
    backgroundColor: colors.surface,
    borderTopWidth: 0.5,
    borderTopColor: colors.borderLight,
    alignItems: 'center',
  },
});
