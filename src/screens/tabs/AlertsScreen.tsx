// PulseSense — Alerts Screen

import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../hooks/useColors';
import { spacing } from '../../constants/spacing';
import { fonts } from '../../constants/typography';
import { AlertRow } from '../../components/ui/AlertRow';
import { getDB } from '../../hooks/useDB';
import { getAllAlerts, resolveAlert } from '../../db/queries/emergency';
import { loadStores } from '../../hooks/useDB';
import type { AlertRow as AlertRowType } from '../../db/queries/emergency';
import type { SeverityLevel } from '../../constants/rules';

export function AlertsScreen() {
  const c = useColors();
  const [alerts, setAlerts] = useState<AlertRowType[]>([]);

  const loadAlerts = useCallback(async () => {
    try {
      const db = await getDB();
      const allAlerts = await getAllAlerts(db);
      setAlerts(allAlerts);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAlerts();
    }, [loadAlerts])
  );

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
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <FlatList
        data={alerts}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <AlertRow
            title={item.title}
            message={item.message}
            severity={item.severity_level as SeverityLevel}
            timestamp={item.created_at}
            isResolved={item.is_resolved === 1}
            onPress={item.is_resolved ? undefined : () => handleResolve(item.id)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={[styles.emptyIconContainer, { backgroundColor: c.surfaceAlt }]}>
              <Ionicons name="notifications-off-outline" size={48} color={c.textDisabled} />
            </View>
            <Text style={[styles.emptyText, { color: c.textPrimary }]}>No alerts yet</Text>
            <Text style={[styles.emptyHint, { color: c.textSecondary }]}>
              Alerts will appear when vital readings are outside normal range or after emergency checks.
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: spacing.space4,
    paddingBottom: spacing.space12,
  },
  empty: {
    padding: spacing.space12,
    alignItems: 'center',
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.space4,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: fonts.display,
    marginBottom: spacing.space3,
  },
  emptyHint: {
    fontSize: 13,
    fontFamily: fonts.body,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: spacing.space8,
  },
});
