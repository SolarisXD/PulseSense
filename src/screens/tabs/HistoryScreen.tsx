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
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../hooks/useColors';
import { colors } from '../../constants/colors';
import { spacing, borderRadius } from '../../constants/spacing';
import { fonts, scaleSize } from '../../constants/typography';
import { TableHeader } from '../../components/vitals/TableHeader';
import { TableRow } from '../../components/vitals/TableRow';
import { getDB, loadStores } from '../../hooks/useDB';
import { getVitalLogsByDateRange } from '../../db/queries/vitals';
import { getCustomVitalLogsByDateRange } from '../../db/queries/customVitals';
import { getLast30DaysRange, formatDisplayDate, formatDisplayTime } from '../../utils/dateUtils';
import { formatVitalCell, VITAL_LABELS, VITAL_TYPE_KEYS, VITAL_CONFIG } from '../../utils/vitalFormatters';
import { getCustomVitalStatus } from '../../utils/vitalStatus';
import type { VitalStatus } from '../../utils/vitalStatus';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { VitalChartCard } from '../../components/vitals/VitalChartCard';
import type { VitalLogRow } from '../../db/queries/vitals';
import type { CustomVitalLogRow } from '../../db/queries/customVitals';
import { useSettingsStore, FONT_SCALE_MULTIPLIERS } from '../../store/settingsStore';

// Memoized FlatList row component to avoid inline arrow function re-creation per render
const HistoryTableRow = React.memo(function HistoryTableRow({
  item,
  index,
  onNavigate,
  getCellData,
}: {
  item: any;
  index: number;
  onNavigate: (logId: number) => void;
  getCellData: (log: any) => any;
}) {
  return (
    <TableRow
      date={formatDisplayDate(item.logged_at_display)}
      time={formatDisplayTime(item.logged_at_display)}
      cells={getCellData(item)}
      isEven={index % 2 === 1}
      onPress={() => onNavigate(item.id)}
    />
  );
});

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

interface CustomVitalLookup {
  value: number;
  unit: string;
  normal_min: number | null;
  normal_max: number | null;
}

export function HistoryScreen({ navigation }: any) {
  const c = useColors();
  const fontScale = useSettingsStore((s) => s.fontScale);
  const fs = FONT_SCALE_MULTIPLIERS[fontScale];
  const sc = useMemo(() => createStyles(fs), [fs]);
  const [selectedFilter, setSelectedFilter] = useState(ALL_VITALS);
  const [vitalLogs, setVitalLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRangeKey, setDateRangeKey] = useState<DateRangeKey>('30d');
  const [customVitalsLookup, setCustomVitalsLookup] = useState<Record<number, Record<string, CustomVitalLookup>>>({});
  const [customVitalKeys, setCustomVitalKeys] = useState<string[]>([]);
  const [rawCustomLogs, setRawCustomLogs] = useState<(CustomVitalLogRow & { definition_name: string; unit: string })[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'charts'>('table');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const db = await getDB();
      const range = getDateRange(dateRangeKey);
      const logs = await getVitalLogsByDateRange(db, range.start, range.end);
      setVitalLogs(logs);

      const customLogs = await getCustomVitalLogsByDateRange(db, range.start, range.end);
      const lookup: Record<number, Record<string, CustomVitalLookup>> = {};
      const keys = new Set<string>();
      for (const cl of customLogs) {
        if (!cl.vital_log_id) continue;
        if (!lookup[cl.vital_log_id]) lookup[cl.vital_log_id] = {};
        lookup[cl.vital_log_id][cl.definition_name] = {
          value: cl.value,
          unit: cl.unit,
          normal_min: null,
          normal_max: null,
        };
        keys.add(cl.definition_name);
      }
      setCustomVitalsLookup(lookup);
      setCustomVitalKeys(Array.from(keys).sort());
      setRawCustomLogs(customLogs);
    } catch (err) {
      console.error(err);
  } finally {
    setLoading(false);
  }
}, [dateRangeKey]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const db = await getDB();
      await loadStores(db);
      const range = getDateRange(dateRangeKey);
      const logs = await getVitalLogsByDateRange(db, range.start, range.end);
      setVitalLogs(logs);

      const customLogs = await getCustomVitalLogsByDateRange(db, range.start, range.end);
      const lookup: Record<number, Record<string, CustomVitalLookup>> = {};
      const keys = new Set<string>();
      for (const cl of customLogs) {
        if (!cl.vital_log_id) continue;
        if (!lookup[cl.vital_log_id]) lookup[cl.vital_log_id] = {};
        lookup[cl.vital_log_id][cl.definition_name] = {
          value: cl.value,
          unit: cl.unit,
          normal_min: null,
          normal_max: null,
        };
        keys.add(cl.definition_name);
      }
      setCustomVitalsLookup(lookup);
      setCustomVitalKeys(Array.from(keys).sort());
      setRawCustomLogs(customLogs);
    } catch (err) {
      console.error(err);
    }
    setRefreshing(false);
  }, [dateRangeKey]);

  const allColumns = useMemo(() => {
    if (selectedFilter === ALL_VITALS) {
      return [...VITAL_TYPE_KEYS, ...customVitalKeys];
    }
    if (customVitalKeys.includes(selectedFilter)) {
      return [selectedFilter];
    }
    return [selectedFilter];
  }, [selectedFilter, customVitalKeys]);

  const allHeaders = useMemo(() => {
    const headers: Record<string, string> = { ...VITAL_LABELS };
    for (const key of customVitalKeys) {
      headers[key] = key;
    }
    return headers;
  }, [customVitalKeys]);

  const getCellData = useCallback((log: any) => {
    const lookup = customVitalsLookup[log.id] || {};
    return allColumns.map((col) => {
      if (VITAL_TYPE_KEYS.includes(col as any)) {
        return formatVitalCell(col, log);
      }
      const cv = lookup[col];
      if (cv) {
        return {
          value: `${cv.value} ${cv.unit}`,
          status: getCustomVitalStatus(cv.value, cv.normal_min, cv.normal_max),
        };
      }
      return { value: '-', status: 'unknown' as VitalStatus };
    });
  }, [customVitalsLookup, allColumns]);

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
    if (customVitalKeys.includes(selectedFilter)) {
      const lookup = customVitalsLookup[log.id] || {};
      return !!lookup[selectedFilter];
    }
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

  const customFilterOptions = useMemo(() => {
    return customVitalKeys.map((key) => ({
      key,
      label: key,
      icon: 'flask-outline' as keyof typeof Ionicons.glyphMap,
    }));
  }, [customVitalKeys]);

  const allOptions = useMemo(() => {
    return [...VITAL_OPTIONS, ...customFilterOptions];
  }, [customFilterOptions]);

  const onNavigateToDetail = useCallback((logId: number) => {
    navigation.navigate('VitalDetail', { logId });
  }, [navigation]);

  const renderTableRow = useCallback(({ item, index }: { item: any; index: number }) => (
    <HistoryTableRow
      item={item}
      index={index}
      onNavigate={onNavigateToDetail}
      getCellData={getCellData}
    />
  ), [onNavigateToDetail, getCellData]);

  const chartSections = useMemo(() => {
    const logs = vitalLogs;
    type ChartSection = {
      key: string; title: string; unit: string;
      icon: keyof typeof Ionicons.glyphMap;
      data: { value: number; date: string }[];
      data2?: { value: number; date: string }[];
      color: string; color2?: string;
      label?: string; label2?: string;
      maxValue?: number;
      noOfSections?: number;
      formatYLabel?: (val: string) => string;
    };
    const sections: ChartSection[] = [];
    const configs: {
      key: string; title: string; unit: string; icon: keyof typeof Ionicons.glyphMap;
      color: string; color2?: string; label?: string; label2?: string;
      extract1: (log: VitalLogRow) => number | null;
      extract2?: (log: VitalLogRow) => number | null;
      maxValue?: number; noOfSections?: number;
    }[] = [
      { key: 'bp', title: 'Blood Pressure', unit: 'mmHg', icon: 'heart-half', color: c.danger, color2: c.primary, label: 'Systolic', label2: 'Diastolic', extract1: (l) => l.bp_sys, extract2: (l) => l.bp_dia, maxValue: 200, noOfSections: 4 },
      { key: 'pulse', title: 'Pulse', unit: 'bpm', icon: 'pulse', color: c.primaryLight, extract1: (l) => l.pulse, maxValue: 180, noOfSections: 5 },
      { key: 'spo2', title: 'SpO2', unit: '%', icon: 'analytics-outline', color: c.success, extract1: (l) => l.spo2, maxValue: 100, noOfSections: 3 },
      { key: 'glucose', title: 'Glucose', unit: 'mg/dL', icon: 'water-outline', color: c.warning, extract1: (l) => l.glucose_value, maxValue: 300, noOfSections: 5 },
      { key: 'temp', title: 'Temperature', unit: '°C', icon: 'thermometer-outline', color: c.urgent, extract1: (l) => l.temp_value, maxValue: 42, noOfSections: 4 },
      { key: 'weight', title: 'Weight', unit: 'kg', icon: 'scale-outline', color: c.primary, extract1: (l) => l.weight_value, noOfSections: 4 },
      { key: 'pain', title: 'Pain Level', unit: '/10', icon: 'bandage-outline', color: c.danger, extract1: (l) => l.pain_level, maxValue: 10, noOfSections: 5 },
    ];
    for (const config of configs) {
      if (selectedFilter !== ALL_VITALS && selectedFilter !== config.key) continue;
      const data1: { value: number; date: string }[] = [];
      const data2: { value: number; date: string }[] = [];
      for (const log of logs) {
        const v1 = config.extract1(log);
        if (v1 !== null) data1.push({ value: v1, date: log.logged_at_display });
        if (config.extract2) {
          const v2 = config.extract2(log);
          if (v2 !== null) data2.push({ value: v2, date: log.logged_at_display });
        }
      }
      if (data1.length > 0) {
        sections.push({
          key: config.key, title: config.title, unit: config.unit, icon: config.icon,
          data: data1, data2: config.extract2 && data2.length > 0 ? data2 : undefined,
          color: config.color, color2: config.color2, label: config.label, label2: config.label2,
          maxValue: config.maxValue, noOfSections: config.noOfSections,
        });
      }
    }
    // Custom vitals
    for (const key of customVitalKeys) {
      if (selectedFilter !== ALL_VITALS && selectedFilter !== key) continue;
      const pts: { value: number; date: string }[] = [];
      let unit = '';
      for (const cl of rawCustomLogs) {
        if (cl.definition_name === key) {
          pts.push({ value: cl.value, date: cl.logged_at_display || '' });
          unit = cl.unit || '';
        }
      }
      if (pts.length > 0) {
        const values = pts.map(p => p.value);
        const minData = Math.min(...values);
        const maxData = Math.max(...values);
        const pad = Math.max((maxData - minData) * 0.1 || 1, 1);
        sections.push({
          key,
          title: key,
          unit,
          icon: 'flask-outline' as const,
          data: pts,
          color: c.primaryLight,
          maxValue: Math.ceil(maxData + pad),
          noOfSections: 4,
        });
      }
    }
    return sections;
  }, [vitalLogs, selectedFilter, c, customVitalKeys, rawCustomLogs]);

  if (loading) {
    return (
      <View style={[sc.container, { backgroundColor: c.background }]}>
        <View style={[sc.filterBar, { backgroundColor: c.surface }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton.Box key={i} width={72} height={30} borderRadius={15} style={{ marginRight: 8 }} />
            ))}
          </ScrollView>
        </View>
        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          <Skeleton.Box width="100%" height={32} borderRadius={6} style={{ marginBottom: 8 }} />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton.Box key={i} width="100%" height={44} borderRadius={6} style={{ marginBottom: 4 }} />
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={[sc.container, { backgroundColor: c.background }]}>
      {/* Search Bar */}
      <View style={[sc.searchBar, { backgroundColor: c.surface, borderBottomColor: c.borderLight }]}>
        <View style={[sc.searchInputContainer, { backgroundColor: c.surfaceAlt }]}>
          <Ionicons name="search" size={16} color={c.textDisabled} style={{ marginRight: spacing.space2 }} />
          <TextInput
            style={[sc.searchInput, { color: c.textPrimary }]}
            placeholder="Search readings, notes..."
            placeholderTextColor={c.textDisabled}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={16} color={c.textDisabled} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Date Range Selector */}
      <View style={[sc.dateRangeBar, { backgroundColor: c.surface, borderBottomColor: c.borderLight }]}>
        {DATE_RANGE_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.key}
            style={[sc.dateChip, { backgroundColor: c.surfaceAlt, borderColor: c.borderLight }, dateRangeKey === opt.key && { backgroundColor: c.primarySurface, borderColor: c.primary }]}
            onPress={() => setDateRangeKey(opt.key)}
            activeOpacity={0.7}
          >
            <Text style={[sc.dateChipText, { color: c.textSecondary }, dateRangeKey === opt.key && { color: c.primary }]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Vital Filter Bar */}
      <View style={[sc.filterBar, { backgroundColor: c.surface, borderBottomColor: c.borderLight }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {allOptions.map((opt) => (
            <TouchableOpacity
              key={opt.key}
              style={[sc.filterChip, { backgroundColor: c.surfaceAlt }, selectedFilter === opt.key && { backgroundColor: c.primary }]}
              onPress={() => setSelectedFilter(opt.key)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={opt.icon}
                size={13}
                color={selectedFilter === opt.key ? '#FFFFFF' : c.textSecondary}
                style={{ marginRight: 4 }}
              />
              <Text style={[sc.filterText, { color: c.textSecondary }, selectedFilter === opt.key && { color: '#FFFFFF' }]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* View Toggle */}
      <View style={[sc.toggleBar, { backgroundColor: c.surface, borderBottomColor: c.borderLight }]}>
        <TouchableOpacity
          style={[sc.toggleChip, viewMode === 'table' && { backgroundColor: c.primary }]}
          onPress={() => setViewMode('table')}
          activeOpacity={0.7}
        >
          <Ionicons name="list-outline" size={14} color={viewMode === 'table' ? '#FFFFFF' : c.textSecondary} style={{ marginRight: 4 }} />
          <Text style={[sc.toggleText, { color: viewMode === 'table' ? '#FFFFFF' : c.textSecondary }]}>Table</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[sc.toggleChip, viewMode === 'charts' && { backgroundColor: c.primary }]}
          onPress={() => setViewMode('charts')}
          activeOpacity={0.7}
        >
          <Ionicons name="trending-up-outline" size={14} color={viewMode === 'charts' ? '#FFFFFF' : c.textSecondary} style={{ marginRight: 4 }} />
          <Text style={[sc.toggleText, { color: viewMode === 'charts' ? '#FFFFFF' : c.textSecondary }]}>Charts</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {viewMode === 'table' ? (
        <FlatList
          data={filteredLogs}
          keyExtractor={(item) => String(item.id)}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.primary} />}
          ListHeaderComponent={<TableHeader columns={allColumns.map((k) => allHeaders[k] || k)} />}
          renderItem={renderTableRow}
          ListEmptyComponent={
            <View style={sc.empty}>
              <Ionicons name="analytics-outline" size={48} color={c.textDisabled} />
              <Text style={[sc.emptyText, { color: c.textSecondary }]}>
                {searchQuery ? 'No matching readings found' : 'No vitals recorded in this range'}
              </Text>
              <Text style={[sc.emptyHint, { color: c.textDisabled }]}>
                {searchQuery ? 'Try a different search term' : 'Log your first vital from the Log tab'}
              </Text>
            </View>
          }
          contentContainerStyle={sc.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <ScrollView
          style={sc.chartsScroll}
          contentContainerStyle={sc.chartsContent}
          showsVerticalScrollIndicator={false}
        >
          {chartSections.length > 0 ? (
            chartSections.map((s) => (
              <VitalChartCard
                key={s.key}
                title={s.title}
                unit={s.unit}
                icon={s.icon}
                data={s.data}
                data2={s.data2}
                color={s.color}
                color2={s.color2}
                label={s.label}
                label2={s.label2}
                maxValue={s.maxValue}
                noOfSections={s.noOfSections}
              />
            ))
          ) : (
            <View style={sc.empty}>
              <Ionicons name="analytics-outline" size={48} color={c.textDisabled} />
              <Text style={[sc.emptyText, { color: c.textSecondary }]}>
                No vitals recorded in this range
              </Text>
              <Text style={[sc.emptyHint, { color: c.textDisabled }]}>
                Log vitals from the Log tab to see trends
              </Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* Export Button */}
      <View style={[sc.exportBar, { backgroundColor: c.surface, borderTopColor: c.borderLight }]}>
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

function createStyles(fs: number) { const fn = (size: number) => scaleSize(size, fs); return StyleSheet.create({
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
    fontSize: fn(13),
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
    fontSize: fn(11),
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
    fontSize: fn(12),
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
    fontSize: fn(15),
    color: colors.textSecondary,
    fontFamily: fonts.body,
    fontWeight: '500',
  },
  emptyHint: {
    fontSize: fn(12),
    color: colors.textDisabled,
    fontFamily: fonts.body,
    marginTop: spacing.space1,
  },
  toggleBar: {
    flexDirection: 'row',
    paddingVertical: spacing.space2,
    paddingHorizontal: spacing.space4,
    backgroundColor: colors.surface,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.borderLight,
    gap: spacing.space2,
  },
  toggleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.space1 + 2,
    paddingHorizontal: spacing.space4,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceAlt,
  },
  toggleText: {
    fontSize: fn(12),
    fontWeight: '500',
    fontFamily: fonts.body,
  },
  chartsScroll: {
    flex: 1,
  },
  chartsContent: {
    paddingVertical: spacing.space3,
    paddingBottom: spacing.space12,
  },
  exportBar: {
    padding: spacing.space4,
    backgroundColor: colors.surface,
    borderTopWidth: 0.5,
    borderTopColor: colors.borderLight,
    alignItems: 'center',
  },
}); }