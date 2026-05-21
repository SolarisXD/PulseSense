// PulseSense — Alerts Screen
// History of all alerts with severity indicators

import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing } from '../../constants/spacing';
import { AlertRow } from '../../components/ui/AlertRow';
import { getDB } from '../../hooks/useDB';
import { getAllAlerts, resolveAlert } from '../../db/queries/emergency';
import { loadStores } from '../../hooks/useDB';
import type { AlertRow as AlertRowType } from '../../db/queries/emergency';

export function AlertsScreen() {
  const [alerts, setAlerts] = useState<AlertRowType[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadAlerts();
    }, [])
  );

  const loadAlerts = async () => {
    try {
      const db = await getDB();
      const allAlerts = await getAllAlerts(db);
      setAlerts(allAlerts);
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolve = async (id: number) => {
    try {
      const db = await getDB();
      await resolveAlert(db, id);
      await loadAlerts();
      await loadStores(db);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={alerts}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <AlertRow
            title={item.title}
            message={item.message}
            severity={item.severity_level as any}
            timestamp={item.created_at}
            isResolved={item.is_resolved === 1}
            onPress={item.is_resolved ? undefined : () => handleResolve(item.id)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyText}>No alerts yet</Text>
            <Text style={styles.emptyHint}>
              Alerts will appear when vital readings are outside normal range or after emergency checks.
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: spacing.space4,
    paddingBottom: spacing.space12,
  },
  empty: {
    padding: spacing.space12,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.space4,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    fontFamily: 'Inter',
    marginBottom: spacing.space3,
  },
  emptyHint: {
    fontSize: 13,
    color: colors.textSecondary,
    fontFamily: 'Inter',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: spacing.space8,
  },
});
