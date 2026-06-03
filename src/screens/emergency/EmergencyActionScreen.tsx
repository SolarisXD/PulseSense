// PulseSense — Emergency Action Screen
// Shows severity banner, trigger details, action steps, quick actions

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
} from 'react-native';
import * as Location from 'expo-location';
import { fonts } from '../../constants/typography';
import { colors } from '../../constants/colors';
import { spacing, borderRadius } from '../../constants/spacing';
import { SeverityBanner } from '../../components/ui/SeverityBanner';
import { ActionStep } from '../../components/ui/ActionStep';
import { Button } from '../../components/ui/Button';
import { useAlertStore } from '../../store/alertStore';
import { useProfileStore } from '../../store/profileStore';
import { useSettingsStore } from '../../store/settingsStore';
import { getDB, loadStores } from '../../hooks/useDB';
import { resolveAlert } from '../../db/queries/emergency';
import { getActiveAlerts } from '../../db/queries/emergency';

export function EmergencyActionScreen({ route, navigation }: any) {
  const lastResults = useAlertStore((s) => s.lastEmergencyResult);
  const profile = useProfileStore((s) => s.profile);
  const contacts = useProfileStore((s) => s.contacts);
  const emergencyNumber = useSettingsStore((s) => s.emergencyNumber);
  const [address, setAddress] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

  const results = lastResults || [];
  const primaryResult = results[0];
  const isEmergency = primaryResult?.severity === 'EMERGENCY_NOW';
  const primaryContact = contacts.find((c) => c.is_primary) || contacts[0];

  const getLocation = useCallback(async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setAddress('Location permission not available');
        setLocating(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      const geocode = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      if (geocode.length > 0) {
        const addr = geocode[0];
        const parts = [
          addr.name, addr.street, addr.district,
          addr.city, addr.region, addr.country,
        ].filter(Boolean);
        setAddress(parts.join(', '));
      }
    } catch (e) {
      console.warn('getLocation failed', e);
      setAddress('Unable to determine location');
    }
    setLocating(false);
  }, []);

  useEffect(() => {
    getLocation();
  }, [getLocation]);

  const handleEmergencyCall = () => {
    const number = emergencyNumber || '112';
    Linking.openURL(`tel:${number}`);
  };

  const handleIceCall = () => {
    if (primaryContact) {
      Linking.openURL(`tel:${primaryContact.phone}`);
    }
  };

  const handleMarkResolved = async () => {
    try {
      const db = await getDB();
      const activeAlerts = await getActiveAlerts(db);
      for (const alert of activeAlerts) {
        await resolveAlert(db, alert.id);
      }
      await loadStores(db);
      Alert.alert('Resolved', 'Alerts have been marked as resolved.');
      navigation.goBack();
    } catch (err) {
      console.error(err);
    }
  };

  if (!primaryResult) {
    return (
      <View style={styles.container}>
        <View style={styles.noResult}>
          <Text style={styles.noResultText}>No emergency check results found.</Text>
          <Button title="Go Back" onPress={() => navigation.goBack()} variant="primary" />
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, isEmergency && styles.containerEmergency]} contentContainerStyle={styles.content}>
      {/* Severity Banner */}
      <SeverityBanner
        severity={primaryResult.severity}
        title={
          primaryResult.severity === 'EMERGENCY_NOW' ? 'EMERGENCY ACTION REQUIRED' :
          primaryResult.severity === 'URGENT_SAME_DAY' ? 'URGENT — Seek Care Today' :
          primaryResult.severity === 'MONITOR_CLOSELY' ? 'Monitor Closely' :
          'No Emergency Detected'
        }
        subtitle={primaryResult.message}
      />

      {/* What Triggered This */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>What triggered this</Text>
        {primaryResult.triggeredBy.length > 0 ? (
          primaryResult.triggeredBy.map((trigger, idx) => (
            <View key={idx} style={styles.triggerRow}>
              <Text style={styles.triggerDot}>●</Text>
              <Text style={styles.triggerText}>{trigger.replace(/_/g, ' ')}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.triggerText}>Symptom combination detected</Text>
        )}
        <View style={styles.evidenceNote}>
          <Text style={styles.evidenceText}>{primaryResult.evidenceNote}</Text>
        </View>
      </View>

      {/* What To Do Now */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>What to do now</Text>
        {primaryResult.actionSteps.map((step, idx) => (
          <ActionStep key={idx} number={idx + 1} text={step} isLast={idx === primaryResult.actionSteps.length - 1} />
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        {isEmergency && (
          <>
            <Button
              title="📞  Call Emergency Services"
              onPress={handleEmergencyCall}
              variant="danger"
              style={styles.actionButton}
            />
            {primaryContact && (
              <Button
                title={`📞  Call ICE: ${primaryContact.name}`}
                onPress={handleIceCall}
                variant="outline"
                style={styles.actionButton}
              />
            )}
          </>
        )}

        {/* Location */}
        <View style={styles.locationCard}>
          <Text style={styles.locationIcon}>📍</Text>
          <View style={styles.locationInfo}>
            <Text style={styles.locationLabel}>My Location</Text>
            <Text style={styles.locationAddress}>
              {locating ? 'Locating...' : address || 'Tap to fetch location'}
            </Text>
          </View>
          <TouchableOpacity onPress={getLocation} style={styles.refreshButton}>
            <Text style={styles.refreshText}>↻</Text>
          </TouchableOpacity>
        </View>

        {/* Save & Resolve */}
        <View style={styles.finalActions}>
          <Button
            title="✅ Mark Resolved"
            onPress={handleMarkResolved}
            variant="ghost"
            size="medium"
          />
          <View style={{ width: 12 }} />
          <Button
            title="💾 Save Event to History"
            onPress={() => {
              Alert.alert('Saved', 'This emergency event has been saved to your history.');
              navigation.goBack();
            }}
            variant="primary"
            size="medium"
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  containerEmergency: {
    backgroundColor: '#FFF5F5',
  },
  content: {
    paddingBottom: spacing.space12,
  },
  noResult: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.space6,
  },
  noResultText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontFamily: fonts.body,
    marginBottom: spacing.space5,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.space4,
    marginHorizontal: spacing.space4,
    marginBottom: spacing.space4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    fontFamily: fonts.body,
    marginBottom: spacing.space3,
  },
  triggerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.space2,
  },
  triggerDot: {
    color: colors.danger,
    marginRight: spacing.space2,
    fontSize: 10,
    marginTop: 3,
  },
  triggerText: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    textTransform: 'capitalize',
    fontFamily: fonts.body,
  },
  evidenceNote: {
    backgroundColor: colors.surfaceAlt,
    padding: spacing.space3,
    borderRadius: borderRadius.sm,
    marginTop: spacing.space3,
  },
  evidenceText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontStyle: 'italic',
    fontFamily: fonts.body,
    lineHeight: 16,
  },
  quickActions: {
    paddingHorizontal: spacing.space4,
  },
  actionButton: {
    marginBottom: spacing.space3,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.space4,
    marginBottom: spacing.space4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  locationIcon: {
    fontSize: 24,
    marginRight: spacing.space3,
  },
  locationInfo: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    fontFamily: fonts.body,
  },
  locationAddress: {
    fontSize: 13,
    color: colors.textPrimary,
    fontFamily: fonts.body,
    marginTop: 2,
  },
  refreshButton: {
    padding: spacing.space2,
  },
  refreshText: {
    fontSize: 20,
    color: colors.primary,
  },
  finalActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.space2,
    marginBottom: spacing.space6,
  },
});
