import React, { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../hooks/useColors';
import { spacing, borderRadius } from '../../constants/spacing';
import { fonts } from '../../constants/typography';

interface DataPoint {
  value: number;
  date: string;
}

interface VitalChartCardProps {
  title: string;
  data: DataPoint[];
  data2?: DataPoint[];
  color: string;
  color2?: string;
  unit: string;
  icon: keyof typeof Ionicons.glyphMap;
  label?: string;
  label2?: string;
  noOfSections?: number;
  maxValue?: number;
  formatYLabel?: (label: string) => string;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_H_PADDING = spacing.space4 * 2;
const CHART_CONTAINER_PADDING = spacing.space4;
const CHART_VISIBLE_WIDTH = SCREEN_WIDTH - CARD_H_PADDING - CHART_CONTAINER_PADDING * 2;
const MIN_POINT_SPACING = 60;

function shortDate(display: string): string {
  const [datePart] = display.split(' ');
  if (!datePart) return '';
  const [d, m] = datePart.split('/');
  return `${parseInt(m)}/${parseInt(d)}`;
}

export const VitalChartCard = React.memo(function VitalChartCard({
  title,
  unit,
  icon,
  data,
  data2,
  color,
  color2,
  label: legendLabel,
  label2: legendLabel2,
  noOfSections = 4,
  maxValue,
  formatYLabel,
}: VitalChartCardProps) {
  const c = useColors();

  const chartDates = useMemo(() => {
    return [...data].reverse().map((pt) => pt.date);
  }, [data]);

  const chartData = useMemo(() => {
    const sorted = [...data].reverse();
    const interval = Math.max(1, Math.floor(sorted.length / 5));
    return sorted.map((pt, i) => ({
      value: pt.value,
      label: i % interval === 0 ? shortDate(pt.date) : undefined,
    }));
  }, [data]);

  const chartData2 = useMemo(() => {
    if (!data2 || data2.length === 0) return undefined;
    const sorted = [...data2].reverse();
    return sorted.map((pt) => ({
      value: pt.value,
    }));
  }, [data2]);

  const chartWidth = useMemo(() => {
    if (chartData.length === 0) return CHART_VISIBLE_WIDTH;
    const dynamic = chartData.length * MIN_POINT_SPACING;
    return Math.max(CHART_VISIBLE_WIDTH, Math.min(dynamic, CHART_VISIBLE_WIDTH * 2));
  }, [chartData]);

  const hasData = chartData.length > 0;
  const hasTwoLines = !!chartData2 && chartData2.length > 0;

  const pointerLabelCb = useCallback((items: any[], pointerIndex: number) => {
    const dateStr = chartDates[pointerIndex] || '';
    return (
      <View style={[styles.tooltip, { backgroundColor: c.surface, shadowColor: c.shadowSubtle }]}>
        <Text style={[styles.tooltipDate, { color: c.textSecondary }]}>{dateStr}</Text>
        <Text style={[styles.tooltipValue, { color }]}>
          {items[0]?.value} {unit}
        </Text>
        {hasTwoLines && items[1] && (
          <Text style={[styles.tooltipValue, { color: color2 || c.primary }]}>
            {items[1]?.value} {unit}
          </Text>
        )}
      </View>
    );
  }, [chartDates, c.surface, c.shadowSubtle, c.textSecondary, color, unit, hasTwoLines, color2, c.primary]);

  const pointerConfig = useMemo(() => ({
    pointerStripHeight: 180,
    pointerStripWidth: 1,
    pointerStripColor: c.border,
    pointerColor: color,
    pointerLabelWidth: hasTwoLines ? 130 : 100,
    pointerLabelHeight: 70,
    autoAdjustPointerLabelPosition: true,
    pointerLabelComponent: pointerLabelCb,
  }), [c.border, color, hasTwoLines, pointerLabelCb]);

  return (
    <View style={[styles.card, { backgroundColor: c.surface, shadowColor: c.shadowSubtle }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name={icon} size={18} color={color} />
          <Text style={[styles.title, { color: c.textPrimary }]}>{title}</Text>
          <Text style={[styles.unit, { color: c.textSecondary }]}>({unit})</Text>
        </View>
        {hasData && (
          <Text style={[styles.count, { color: c.textDisabled }]}>
            {data.length} readings
          </Text>
        )}
      </View>

      {hasData ? (
        <View style={styles.chartContainer}>
          <LineChart
            data={chartData}
            {...(hasTwoLines ? { data2: chartData2 } : {})}
            width={chartWidth}
            height={180}
            color={color}
            {...(hasTwoLines && color2 ? { color2 } : {})}
            thickness={2.5}
            dataPointsColor={color}
            {...(hasTwoLines && color2 ? { dataPointsColor2: color2 } : {})}
            dataPointsRadius={3}
            curved
            isAnimated
            animationDuration={400}
            showVerticalLines
            verticalLinesColor={c.borderLight}
            yAxisThickness={1}
            xAxisThickness={1}
            yAxisColor={c.border}
            xAxisColor={c.border}
            yAxisTextStyle={{ color: c.textSecondary, fontSize: 10, fontFamily: fonts.mono }}
            xAxisLabelTextStyle={{ color: c.textDisabled, fontSize: 9 }}
            noOfSections={noOfSections}
            maxValue={maxValue}
            disableScroll={chartWidth <= CHART_VISIBLE_WIDTH}
            initialSpacing={20}
            endSpacing={20}
            yAxisLabelWidth={38}
            {...(formatYLabel ? { formatYLabel } : {})}
            pointerConfig={pointerConfig}
          />
          {hasTwoLines && (
            <View style={[styles.legend, { borderTopColor: c.borderLight }]}>
              {legendLabel && (
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: color }]} />
                  <Text style={[styles.legendText, { color: c.textSecondary }]}>{legendLabel}</Text>
                </View>
              )}
              {legendLabel2 && (
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: color2 || c.primary }]} />
                  <Text style={[styles.legendText, { color: c.textSecondary }]}>{legendLabel2}</Text>
                </View>
              )}
            </View>
          )}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: c.textDisabled }]}>
            No readings in this range
          </Text>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.space4,
    marginBottom: spacing.space3,
    padding: spacing.space4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.space3,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.space2,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: fonts.body,
  },
  unit: {
    fontSize: 12,
    fontFamily: fonts.body,
  },
  count: {
    fontSize: 11,
    fontFamily: fonts.body,
  },
  chartContainer: {
    overflow: 'hidden',
    borderRadius: borderRadius.sm,
  },
  emptyState: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 13,
    fontFamily: fonts.body,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.space5,
    marginTop: spacing.space3,
    paddingTop: spacing.space2,
    borderTopWidth: 0.5,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.space1 + 2,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    fontFamily: fonts.body,
  },
  tooltip: {
    paddingHorizontal: spacing.space3,
    paddingVertical: spacing.space2,
    borderRadius: borderRadius.sm,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  tooltipDate: {
    fontSize: 10,
    fontFamily: fonts.body,
    marginBottom: 2,
  },
  tooltipValue: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: fonts.mono,
  },
});
