// PulseSense — History Screen
// Filterable tabular view of vitals with color-coded status
// Updated with motion and refined typography

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, Easing } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';
import { spacing, borderRadius } from '../../constants/spacing';
import { fonts } from '../../constants/typography';
import { TableHeader } from '../../components/vitals/TableHeader';
import { TableRow } from '../../components/vitals/TableRow';
import { Input } from '../../components/ui/Input';
import { getDB, loadStores } from '../../hooks/useDB';
import { getVitalLogsByDateRange } from '../../db/queries/vitals';
import { getLast30DaysRange, formatDisplayDate, formatDisplayTime } from '../../utils/dateUtils';
import { formatVitalCell, VITAL_LABELS, VITAL_TYPE_KEYS, VITAL_CONFIG } from '../../utils/vitalFormatters';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';

const ALL_VITALS = 'all';
const VITAL_OPTIONS: { key: string; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: ALL_VITALS, label: 'All Vitals', icon: 'grid-outline' },
  ...VITAL_CONFIG.map((v) => ({ key: v.key, label: v.label, icon: v.icon as keyof typeof Ionicons.glyphMap })),
];

const DATE_RANGE_OPTIONS = [
  { key: '7d', label: '7 Days' },
  { key: '30d', label: '30 Days' },
  { key: '90d', label: '90 Days' },
  { key: 'all', label: 'All Time' },
] as const;

type DateRangeKey = typeof DATE_RANGE_OPTIONS[number]['key'];

function getDateRange(key: DateRangeKey): { start: string; end: string } {
  if (key === 'all') {
    return { start: '2000-01-01T00:00:00', end: '2099-12-31T23:59:59' };
  }
  const days = key === '7d' ? 7 : key === '30d' ? 30 : 90;
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - days);
  const fmt = (d: Date) => {
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${yyyy}-${mm}-${dd}`;
  };
  return {
    start: `${fmt(start)}T00:00:00`,
    end: `${fmt(end)}T23:59:59`,
  };
}

export function HistoryScreen({ navigation }: any) {
  const [selectedFilter, setSelectedFilter] = useState(ALL_VITALS);
  const [vitalLogs, setVitalLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRangeKey, setDateRangeKey] = useState<DateRangeKey>('30d');

  const loadVitals = useCallback(async () => {
    setLoading(true);
    try {
      const db = await getDB();
      const range = getDateRange(dateRangeKey);
      const logs = await getVitalLogsByDateRange(db, range.start, range.end);
      setVitalLogs(logs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [dateRangeKey]);

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
      const range = getDateRange(dateRangeKey);
      const logs = await getVitalLogsByDateRange(db, range.start, range.end);
      setVitalLogs(logs);
    } catch (err) {
      console.error(err);
    }
    setRefreshing(false);
  }, [dateRangeKey]);

  const getColumns = () => {
    if (selectedFilter === ALL_VITALS) {
      return VITAL_TYPE_KEYS;
    }
    return [selectedFilter];
  };

  const getCellData = (log: any) => {
    const cols = getColumns();
    return cols.map((col) => formatVitalCell(col, log));
  };

  const searchedLogs = useMemo(() => {
    if (!searchQuery.trim()) return vitalLogs;
    const q = searchQuery.toLowerCase();
    return vitalLogs.filter((log) => {
      const searchable = [
        log.logged_at_display,
        log.notes,
        log.pain_location,
        log.bp_position,
        log.glucose_context,
        ...(log.bp_sys ? [`${log.bp_sys}/${log.bp_dia}`] : []),
      ];
      return searchable.some((s) => s && s.toLowerCase().includes(q));
    });
  }, [vitalLogs, searchQuery]);

  const filteredLogs = searchedLogs.filter((log) => {
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
      {/* Search Bar */}
      <View style={styles.searchBar}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={16} color={colors.textDisabled} style={{ marginRight: spacing.space2 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search readings, notes..."
            placeholderTextColor={colors.textDisabled}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={16} color={colors.textDisabled} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Date Range Selector */}
      <View style={styles.dateRangeBar}>
        {DATE_RANGE_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.key}
            style={[styles.dateChip, dateRangeKey === opt.key && styles.dateChipSelected]}
            onPress={() => setDateRangeKey(opt.key)}
            activeOpacity={0.7}
          >
            <Text style={[styles.dateChipText, dateRangeKey === opt.key && styles.dateChipTextSelected]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Vital Filter Bar */}
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        ListHeaderComponent={<TableHeader columns={getColumns().map((k) => VITAL_LABELS[k] || k)} />}
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
            <Text style={styles.emptyText}>
              {searchQuery ? 'No matching readings found' : 'No vitals recorded in this range'}
            </Text>
            <Text style={styles.emptyHint}>
              {searchQuery ? 'Try a different search term' : 'Log your first vital from the Log tab'}
            </Text>
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
  searchBar: {
    paddingHorizontal: spacing.space4,
    paddingVertical: spacing.space3,
    backgroundColor: colors.surface,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.borderLight,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.space3,
    height: 38,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: colors.textPrimary,
    fontFamily: fonts.body,
    padding: 0,
  },
  dateRangeBar: {
    flexDirection: 'row',
    paddingVertical: spacing.space2,
    paddingHorizontal: spacing.space4,
    backgroundColor: colors.surface,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.borderLight,
    gap: spacing.space2,
  },
  dateChip: {
    paddingVertical: spacing.space1 + 2,
    paddingHorizontal: spacing.space3,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  dateChipSelected: {
    backgroundColor: colors.primarySurface,
    borderColor: colors.primary,
  },
  dateChipText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textSecondary,
    fontFamily: fonts.body,
  },
  dateChipTextSelected: {
    color: colors.primary,
    fontWeight: '600',
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
