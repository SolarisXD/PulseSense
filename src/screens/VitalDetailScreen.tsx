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
import { colors } from '../constants/colors';
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
  // Uses VitalStatus union from utils/vitalStatus: 'normal' | 'warning' | 'danger' | 'unknown'
  const statusColors: Record<string, string> = {
    normal: colors.success,
    warning: colors.warning,
    danger: colors.danger,
    unknown: colors.textDisabled,
  };

  const lineColor = chartColor || statusColors[status] || colors.primary;

  return (
    <View style={[styles.vitalCard, { borderLeftColor: statusColors[status] || colors.textDisabled }]}>
      <View style={styles.vitalCardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.vitalLabel}>{label}</Text>
          <Text style={[styles.vitalValue, { color: statusColors[status] || colors.textPrimary }]}>
            {value}
          </Text>
          <Text style={styles.vitalStatus}>{status.charAt(0).toUpperCase() + status.slice(1)}</Text>
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
        chartColor: colors.primary,
      });
    }
    if (log.pulse != null) {
      items.push({
        label: 'Pulse',
        value: `${log.pulse} bpm`,
        status: getPulseStatus(log.pulse),
        chartData: extractTrend(allLogs, (l) => l.pulse),
        chartColor: colors.primaryLight,
      });
    }
    if (log.spo2 != null) {
      items.push({
        label: 'SpO2',
        value: `${log.spo2}%`,
        status: getSpo2Status(log.spo2),
        chartData: extractTrend(allLogs, (l) => l.spo2),
        chartColor: colors.success,
      });
    }
    if (log.glucose_value != null) {
      items.push({
        label: 'Glucose',
        value: `${log.glucose_value} ${log.glucose_unit}${log.glucose_context ? ` (${log.glucose_context})` : ''}`,
        status: getGlucoseStatus(log.glucose_value, log.glucose_context),
        chartData: extractTrend(allLogs, (l) => l.glucose_value),
        chartColor: colors.warning,
      });
    }
    if (log.temp_value != null) {
      items.push({
        label: 'Temperature',
        value: `${log.temp_value}°${log.temp_unit || 'C'}`,
        status: getTempStatus(log.temp_value),
        chartData: extractTrend(allLogs, (l) => l.temp_value),
        chartColor: colors.urgent,
      });
    }
    if (log.weight_value != null) {
      items.push({
        label: 'Weight',
        value: `${log.weight_value} ${log.weight_unit || 'kg'}`,
        status: 'normal' as VitalStatus,
        chartData: extractTrend(allLogs, (l) => l.weight_value),
        chartColor: colors.primary,
      });
    }
    if (log.pain_level != null) {
      items.push({
        label: 'Pain Level',
        value: `${log.pain_level}/10${log.pain_location ? ` - ${log.pain_location}` : ''}`,
        status: getPainStatus(log.pain_level),
        chartData: extractTrend(allLogs, (l) => l.pain_level),
        chartColor: log.pain_level >= 7 ? colors.danger : log.pain_level >= 4 ? colors.warning : colors.success,
      });
    }

    return items;
  }, [log, allLogs]);

  if (!log) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFound}>Vital log not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.date}>{formatDisplayDate(log.logged_at_display)}</Text>
        <Text style={styles.time}>{formatDisplayTime(log.logged_at_display)}</Text>
      </View>

      {/* Vital Cards with Sparkline Trends */}
      {vitals.length > 0 && (
        <Text style={styles.trendsLabel}>Latest Reading & 14-Day Trend</Text>
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
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No vital readings in this log entry</Text>
        </View>
      )}

      {/* Notes */}
      {log.notes ? (
        <View style={styles.notesSection}>
          <Text style={styles.notesLabel}>Notes</Text>
          <Text style={styles.notesText}>{log.notes}</Text>
        </View>
      ) : null}

      {log.pain_notes ? (
        <View style={styles.notesSection}>
          <Text style={styles.notesLabel}>Pain Notes</Text>
          <Text style={styles.notesText}>{log.pain_notes}</Text>
        </View>
      ) : null}

      {/* Nearby Logs */}
      {nearbyLogs.length > 0 && (
        <View style={styles.nearbySection}>
          <Text style={styles.nearbyTitle}>Recent Readings</Text>
          {nearbyLogs.map((nearby) => (
            <TouchableOpacity
              key={nearby.id}
              style={styles.nearbyRow}
              onPress={() => navigation.replace('VitalDetail', { logId: nearby.id })}
            >
              <Text style={styles.nearbyDate}>
                {formatDisplayDate(nearby.logged_at_display)} {formatDisplayTime(nearby.logged_at_display)}
              </Text>
              <Text style={styles.nearbySummary}>
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
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.space4,
    paddingBottom: spacing.space12,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  notFound: {
    fontSize: 16,
    color: colors.textSecondary,
    fontFamily: fonts.body,
  },
  header: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.space4,
    marginBottom: spacing.space4,
    alignItems: 'center',
  },
  date: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    fontFamily: fonts.body,
  },
  time: {
    fontSize: 14,
    color: colors.textSecondary,
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
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.space4,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  vitalLabel: {
    fontSize: 12,
    color: colors.textSecondary,
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
    color: colors.textDisabled,
    fontFamily: fonts.body,
    marginTop: 2,
  },
  trendsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: fonts.body,
    marginBottom: spacing.space3,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.space8,
    alignItems: 'center',
    marginBottom: spacing.space4,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: fonts.body,
  },
  notesSection: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: borderRadius.md,
    padding: spacing.space4,
    marginBottom: spacing.space4,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    fontFamily: fonts.body,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.space2,
  },
  notesText: {
    fontSize: 14,
    color: colors.textPrimary,
    fontFamily: fonts.body,
    lineHeight: 20,
  },
  nearbySection: {
    marginTop: spacing.space2,
  },
  nearbyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    fontFamily: fonts.body,
    marginBottom: spacing.space3,
  },
  nearbyRow: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.space3,
    marginBottom: spacing.space2,
  },
  nearbyDate: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textPrimary,
    fontFamily: fonts.body,
  },
  nearbySummary: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: fonts.body,
    marginTop: 2,
  },
});
