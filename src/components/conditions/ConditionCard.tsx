// PulseSense — Condition Card Component
// Tappable card with left-colored border per severity

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../hooks/useColors';
import { spacing, borderRadius } from '../../constants/spacing';
import { fonts } from '../../constants/typography';

interface ConditionCardProps {
  name: string;
  type?: string | null;
  diagnosedDate?: string | null;
  severity?: string | null;
  notes?: string | null;
  onPress?: () => void;
  onArchive?: () => void;
}

export function ConditionCard({
  name,
  type,
  diagnosedDate,
  severity,
  notes,
  onPress,
  onArchive,
}: ConditionCardProps) {
  const c = useColors();
  const severityColors: Record<string, string> = {
    severe: c.danger,
    moderate: c.warning,
    mild: c.success,
  };
  const accentColor = severity ? severityColors[severity] || c.primary : c.primary;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: c.surface, borderLeftColor: accentColor }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={[styles.name, { color: c.textPrimary }]}>{name}</Text>
        {onArchive && (
          <TouchableOpacity onPress={onArchive} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="archive-outline" size={18} color={c.textDisabled} />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.metaRow}>
        {type && diagnosedDate && (
          <Text style={[styles.meta, { color: c.textSecondary }]}>{type} · </Text>
        )}
        {type && !diagnosedDate && (
          <Text style={[styles.meta, { color: c.textSecondary }]}>{type}</Text>
        )}
        {diagnosedDate && <Text style={[styles.meta, { color: c.textSecondary }]}>Since {diagnosedDate}</Text>}
      </View>
      {severity && (
        <View style={[styles.severityBadge, { backgroundColor: accentColor + '20' }]}>
          <Text style={[styles.severityText, { color: accentColor }]}>{severity}</Text>
        </View>
      )}
      {notes && <Text style={[styles.notes, { color: c.textSecondary }]}>{notes}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderLeftWidth: 4,
    borderRadius: borderRadius.md,
    padding: spacing.space4,
    marginBottom: spacing.space3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: fonts.body,
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.space1,
    marginBottom: spacing.space2,
  },
  meta: {
    fontSize: 12,
    fontFamily: fonts.body,
  },
  metaSep: {
    fontSize: 12,
  },
  severityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: spacing.space2,
  },
  severityText: {
    fontSize: 10,
    fontWeight: '600',
    fontFamily: fonts.body,
    textTransform: 'capitalize',
  },
  notes: {
    fontSize: 12,
    fontFamily: fonts.body,
    marginTop: spacing.space1,
  },
});
