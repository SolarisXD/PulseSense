// PulseSense — Vital Detail Screen
// Shows all readings from a single vital log entry with sparkline trends

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { useFocusEffect } from '@react-navigation/native';
import { fonts } from '../constants/typography';
import { useColors } from '../hooks/useColors';
import { spacing, borderRadius } from '../constants/spacing';
import { getDB } from '../hooks/useDB';
import { getVitalLogsByDateRange } from '../db/queries/vitals';
import type { VitalLogRow } from '../db/queries/vitals';
import { formatDisplayDate, formatDisplayTime, getLast30DaysRange } from '../utils/dateUtils';
import {
  getBpStatus, getPulseStatus, getSpo2Status,
  getGlucoseStatus, getTempStatus, getPainStatus,
  type VitalStatus,
} from '../utils/vitalStatus';



function VitalTag({
  label,
  value,
  status,
  chartData,
  chartColor,
}: {
  label: string;
  value: string;
  status: VitalStatus | 'unknown';
  chartData?: { value: number }[];
  chartColor?: string;
}) {
  const c = useColors();
  // Uses VitalStatus union from utils/vitalStatus: 'normal' | 'warning' | 'danger' | 'unknown'
  const statusColors: Record<string, string> = {
    normal: c.success,
    warning: c.warning,
    danger: c.danger,
    unknown: c.textDisabled,
  };

  const lineColor = chartColor || statusColors[status] || c.primary;

  return (
    <View style={[styles.vitalCard, { backgroundColor: c.surface, borderLeftColor: statusColors[status] || c.textDisabled }]}>
      <View style={styles.vitalCardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.vitalLabel, { color: c.textSecondary }]}>{label}</Text>
          <Text style={[styles.vitalValue, { color: statusColors[status] || c.textPrimary }]}>
            {value}
          </Text>
          <Text style={[styles.vitalStatus, { color: c.textDisabled }]}>{status.charAt(0).toUpperCase() + status.slice(1)}</Text>
        </View>
        {chartData && chartData.length > 1 && (
          <View style={styles.sparklineContainer}>
            <LineChart
              data={chartData}
              width={120}
              height={48}
              color={lineColor}
              thickness={2}
              hideDataPoints
              hideAxesAndRules
              hideRules
              yAxisThickness={0}
              xAxisThickness={0}
              isAnimated
              animationDuration={400}
              curved
              initialSpacing={0}
              endSpacing={0}
              adjustToWidth
            />
          </View>
        )}
      </View>
    </View>
  );
}

function extractTrend(
  logs: VitalLogRow[],
  extractor: (log: VitalLogRow) => number | null,
): { value: number }[] {
  const points: { value: number }[] = [];
  for (const log of logs) {
    const val = extractor(log);
    if (val !== null) {
      points.push({ value: val });
    }
  }
  return points.slice(-14).reverse();
}

export function VitalDetailScreen({ route, navigation }: any) {
  const c = useColors();
  const { logId } = route.params;
  const [log, setLog] = useState<VitalLogRow | null>(null);
  const [allLogs, setAllLogs] = useState<VitalLogRow[]>([]);
  const [nearbyLogs, setNearbyLogs] = useState<VitalLogRow[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadLog();
    }, [logId])
  );

  const loadLog = async () => {
    try {
      const db = await getDB();
      const range = getLast30DaysRange();
      const logs = await getVitalLogsByDateRange(db, range.start, range.end);
      const current = logs.find((l) => l.id === logId);
      setLog(current || null);
      setAllLogs(logs);
      setNearbyLogs(logs.filter((l) => l.id !== logId).slice(0, 5));
    } catch (err) {
      console.error('Failed to load vital detail:', err);
    }
  };

  const vitals = useMemo(() => {
    if (!log) return [];
    const items: {
      label: string; value: string; status: VitalStatus | 'unknown';
      chartData?: { value: number }[]; chartColor?: string;
    }[] = [];

    if (log.bp_sys != null || log.bp_dia != null) {
      items.push({
        label: 'Blood Pressure',
        value: `${log.bp_sys ?? '--'}/${log.bp_dia ?? '--'} ${log.bp_position ? `(${log.bp_position})` : ''}`,
        status: log.bp_sys ? getBpStatus(log.bp_sys, log.bp_dia ?? 0) : 'unknown',
        chartData: extractTrend(allLogs, (l) => l.bp_sys),
        chartColor: c.primary,
      });
    }
    if (log.pulse != null) {
      items.push({
        label: 'Pulse',
        value: `${log.pulse} bpm`,
        status: getPulseStatus(log.pulse),
        chartData: extractTrend(allLogs, (l) => l.pulse),
        chartColor: c.primaryLight,
      });
    }
    if (log.spo2 != null) {
      items.push({
        label: 'SpO2',
        value: `${log.spo2}%`,
        status: getSpo2Status(log.spo2),
        chartData: extractTrend(allLogs, (l) => l.spo2),
        chartColor: c.success,
      });
    }
    if (log.glucose_value != null) {
      items.push({
        label: 'Glucose',
        value: `${log.glucose_value} ${log.glucose_unit}${log.glucose_context ? ` (${log.glucose_context})` : ''}`,
        status: getGlucoseStatus(log.glucose_value, log.glucose_context),
        chartData: extractTrend(allLogs, (l) => l.glucose_value),
        chartColor: c.warning,
      });
    }
    if (log.temp_value != null) {
      items.push({
        label: 'Temperature',
        value: `${log.temp_value}°${log.temp_unit || 'C'}`,
        status: getTempStatus(log.temp_value),
        chartData: extractTrend(allLogs, (l) => l.temp_value),
        chartColor: c.urgent,
      });
    }
    if (log.weight_value != null) {
      items.push({
        label: 'Weight',
        value: `${log.weight_value} ${log.weight_unit || 'kg'}`,
        status: 'normal' as VitalStatus,
        chartData: extractTrend(allLogs, (l) => l.weight_value),
        chartColor: c.primary,
      });
    }
    if (log.pain_level != null) {
      items.push({
        label: 'Pain Level',
        value: `${log.pain_level}/10${log.pain_location ? ` - ${log.pain_location}` : ''}`,
        status: getPainStatus(log.pain_level),
        chartData: extractTrend(allLogs, (l) => l.pain_level),
        chartColor: log.pain_level >= 7 ? c.danger : log.pain_level >= 4 ? c.warning : c.success,
      });
    }

    return items;
  }, [log, allLogs, c]);

  if (!log) {
    return (
      <View style={[styles.center, { backgroundColor: c.background }]}>
        <Text style={[styles.notFound, { color: c.textSecondary }]}>Vital log not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: c.background }]} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: c.surface }]}>
        <Text style={[styles.date, { color: c.textPrimary }]}>{formatDisplayDate(log.logged_at_display)}</Text>
        <Text style={[styles.time, { color: c.textSecondary }]}>{formatDisplayTime(log.logged_at_display)}</Text>
      </View>

      {/* Vital Cards with Sparkline Trends */}
      {vitals.length > 0 && (
        <Text style={[styles.trendsLabel, { color: c.textSecondary }]}>Latest Reading & 14-Day Trend</Text>
      )}
      <View style={styles.vitalsGrid}>
        {vitals.map((v, i) => (
          <VitalTag
            key={i}
            label={v.label}
            value={v.value}
            status={v.status}
            chartData={v.chartData}
            chartColor={v.chartColor}
          />
        ))}
      </View>

      {vitals.length === 0 && (
        <View style={[styles.emptyCard, { backgroundColor: c.surface }]}>
          <Text style={[styles.emptyText, { color: c.textSecondary }]}>No vital readings in this log entry</Text>
        </View>
      )}

      {/* Notes */}
      {log.notes ? (
        <View style={[styles.notesSection, { backgroundColor: c.surfaceAlt }]}>
          <Text style={[styles.notesLabel, { color: c.textSecondary }]}>Notes</Text>
          <Text style={[styles.notesText, { color: c.textPrimary }]}>{log.notes}</Text>
        </View>
      ) : null}

      {log.pain_notes ? (
        <View style={[styles.notesSection, { backgroundColor: c.surfaceAlt }]}>
          <Text style={[styles.notesLabel, { color: c.textSecondary }]}>Pain Notes</Text>
          <Text style={[styles.notesText, { color: c.textPrimary }]}>{log.pain_notes}</Text>
        </View>
      ) : null}

      {/* Nearby Logs */}
      {nearbyLogs.length > 0 && (
        <View style={styles.nearbySection}>
          <Text style={[styles.nearbyTitle, { color: c.textPrimary }]}>Recent Readings</Text>
          {nearbyLogs.map((nearby) => (
            <TouchableOpacity
              key={nearby.id}
              style={[styles.nearbyRow, { backgroundColor: c.surface }]}
              onPress={() => navigation.replace('VitalDetail', { logId: nearby.id })}
            >
              <Text style={[styles.nearbyDate, { color: c.textPrimary }]}>
                {formatDisplayDate(nearby.logged_at_display)} {formatDisplayTime(nearby.logged_at_display)}
              </Text>
              <Text style={[styles.nearbySummary, { color: c.textSecondary }]}>
                {[
                  nearby.bp_sys ? `BP ${nearby.bp_sys}/${nearby.bp_dia}` : null,
                  nearby.pulse != null ? `Pulse ${nearby.pulse}` : null,
                  nearby.spo2 != null ? `SpO2 ${nearby.spo2}%` : null,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.space4,
    paddingBottom: spacing.space12,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFound: {
    fontSize: 16,
    fontFamily: fonts.body,
  },
  header: {
    borderRadius: borderRadius.md,
    padding: spacing.space4,
    marginBottom: spacing.space4,
    alignItems: 'center',
  },
  date: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: fonts.body,
  },
  time: {
    fontSize: 14,
    fontFamily: fonts.body,
    marginTop: spacing.space1,
  },
  vitalsGrid: {
    gap: spacing.space3,
    marginBottom: spacing.space4,
  },
  vitalCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sparklineContainer: {
    marginLeft: spacing.space3,
    overflow: 'hidden',
    borderRadius: borderRadius.sm,
  },
  vitalCard: {
    borderRadius: borderRadius.md,
    padding: spacing.space4,
    borderLeftWidth: 4,
  },
  vitalLabel: {
    fontSize: 12,
    fontFamily: fonts.body,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  vitalValue: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: fonts.mono,
    marginTop: spacing.space1,
  },
  vitalStatus: {
    fontSize: 12,
    fontFamily: fonts.body,
    marginTop: 2,
  },
  trendsLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: fonts.body,
    marginBottom: spacing.space3,
  },
  emptyCard: {
    borderRadius: borderRadius.md,
    padding: spacing.space8,
    alignItems: 'center',
    marginBottom: spacing.space4,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: fonts.body,
  },
  notesSection: {
    borderRadius: borderRadius.md,
    padding: spacing.space4,
    marginBottom: spacing.space4,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: fonts.body,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.space2,
  },
  notesText: {
    fontSize: 14,
    fontFamily: fonts.body,
    lineHeight: 20,
  },
  nearbySection: {
    marginTop: spacing.space2,
  },
  nearbyTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: fonts.body,
    marginBottom: spacing.space3,
  },
  nearbyRow: {
    borderRadius: borderRadius.md,
    padding: spacing.space3,
    marginBottom: spacing.space2,
  },
  nearbyDate: {
    fontSize: 13,
    fontWeight: '500',
    fontFamily: fonts.body,
  },
  nearbySummary: {
    fontSize: 12,
    fontFamily: fonts.body,
    marginTop: 2,
  },
});
