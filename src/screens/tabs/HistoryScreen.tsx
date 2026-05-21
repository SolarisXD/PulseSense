// PulseSense — History Screen
// Filterable tabular view of vitals with color-coded status

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, borderRadius } from '../../constants/spacing';
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

const ALL_VITALS = 'all';
const VITAL_OPTIONS = [
  { key: ALL_VITALS, label: 'All Vitals' },
  { key: 'bp', label: 'Blood Pressure' },
  { key: 'pulse', label: 'Pulse' },
  { key: 'spo2', label: 'SpO2' },
  { key: 'glucose', label: 'Glucose' },
  { key: 'temp', label: 'Temperature' },
  { key: 'weight', label: 'Weight' },
  { key: 'pain', label: 'Pain' },
];

export function HistoryScreen({ navigation }: any) {
  const [selectedFilter, setSelectedFilter] = useState(ALL_VITALS);
  const [vitalLogs, setVitalLogs] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadVitals();
    }, [selectedFilter])
  );

  const loadVitals = async () => {
    try {
      const db = await getDB();
      const range = getLast30DaysRange();
      const logs = await getVitalLogsByDateRange(db, range.start, range.end);
      setVitalLogs(logs);
    } catch (err) {
      console.error(err);
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
            >
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
            <Text style={styles.emptyText}>No vitals recorded in the last 30 days</Text>
            <Text style={styles.emptyHint}>Log your first vital from the Log tab</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
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
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  filterChip: {
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
    fontFamily: 'Inter',
  },
  filterTextSelected: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingBottom: spacing.space12,
  },
  empty: {
    padding: spacing.space8,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: colors.textSecondary,
    fontFamily: 'Inter',
    fontWeight: '500',
  },
  emptyHint: {
    fontSize: 12,
    color: colors.textDisabled,
    fontFamily: 'Inter',
    marginTop: spacing.space2,
  },
  exportBar: {
    padding: spacing.space4,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    alignItems: 'center',
  },
});
