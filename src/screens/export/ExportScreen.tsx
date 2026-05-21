// PulseSense — Export Screen
// Choose export type, configure options, generate & share PDF

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { fonts } from '../../constants/typography';
import { colors, spacing, borderRadius } from '../../constants/spacing';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/ui/Button';
import { ExportTypeCard } from '../../components/export/ExportTypeCard';
import { generateExport, sharePdf } from '../../export/exportService';
import type { ExportType } from '../../export/exportService';

const EXPORT_TYPES: { type: ExportType; iconName: keyof typeof Ionicons.glyphMap; title: string; desc: string }[] = [
  { type: 'medical_id', iconName: 'card-outline', title: 'Medical ID', desc: 'Name, DOB, blood group, conditions, allergies, emergency contacts — one page' },
  { type: 'vitals_report', iconName: 'analytics-outline', title: 'Vitals Report', desc: 'Tabular history of selected vitals with date range' },
  { type: 'medications', iconName: 'medkit-outline', title: 'Medications', desc: 'All active prescriptions with dosage table' },
  { type: 'alerts', iconName: 'notifications-outline', title: 'Emergency Alerts', desc: 'Log of emergency events with severity and timestamp' },
  { type: 'full_report', iconName: 'document-text-outline', title: 'Full Report', desc: 'All of the above combined' },
];

const VITAL_TYPES = [
  { key: 'bp', label: 'Blood Pressure' },
  { key: 'pulse', label: 'Pulse' },
  { key: 'spo2', label: 'SpO2' },
  { key: 'glucose', label: 'Glucose' },
  { key: 'temperature', label: 'Temperature' },
  { key: 'weight', label: 'Weight' },
  { key: 'pain', label: 'Pain' },
];

export function ExportScreen({ route }: any) {
  const initialType = route?.params?.preSelectedType || null;
  const [selectedType, setSelectedType] = useState<ExportType | null>(initialType);

  // Map HistoryScreen vital keys ('temp', 'glucose') → ExportScreen keys ('temperature', 'glucose')
  const vitalKeyMap: Record<string, string> = {
    bp: 'bp', pulse: 'pulse', spo2: 'spo2',
    glucose: 'glucose', temp: 'temperature', weight: 'weight', pain: 'pain',
  };
  const preFilterVital = route?.params?.preFilterVital
    ? vitalKeyMap[route.params.preFilterVital]
    : null;

  const [selectedVitals, setSelectedVitals] = useState<string[]>(
    preFilterVital ? [preFilterVital] : ['bp', 'pulse', 'spo2', 'glucose', 'temperature', 'weight', 'pain']
  );
  const [generating, setGenerating] = useState(false);
  const [pdfUri, setPdfUri] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!selectedType) return;
    setGenerating(true);
    setPdfUri(null);

    try {
      const uri = await generateExport({
        type: selectedType,
        vitalTypes: selectedType === 'vitals_report' ? selectedVitals : undefined,
      });
      setPdfUri(uri);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to generate PDF. Please try again.');
    }

    setGenerating(false);
  };

  const handleShare = async () => {
    if (!pdfUri) return;
    try {
      await sharePdf(pdfUri);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to share PDF.');
    }
  };

  const toggleVital = (key: string) => {
    setSelectedVitals((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Export Report</Text>
      <Text style={styles.subtext}>Choose what to include in your PDF export</Text>

      {/* Export Type Selection */}
      <Text style={styles.sectionLabel}>Step 1: Choose Export Type</Text>
      {EXPORT_TYPES.map((et) => (
        <ExportTypeCard
          key={et.type}
          title={et.title}
          description={et.desc}
          iconName={et.iconName}
          selected={selectedType === et.type}
          onPress={() => setSelectedType(et.type)}
        />
      ))}

      {/* Vital Type Selection (for vitals_report) */}
      {selectedType === 'vitals_report' && (
        <View style={styles.vitalSelector}>
          <Text style={styles.sectionLabel}>Step 2: Select Vitals</Text>
          <View style={styles.vitalGrid}>
            {VITAL_TYPES.map((vt) => (
              <TouchableOpacity
                key={vt.key}
                style={[styles.vitalChip, selectedVitals.includes(vt.key) && styles.vitalChipSelected]}
                onPress={() => toggleVital(vt.key)}
              >
                <Text style={[styles.vitalChipText, selectedVitals.includes(vt.key) && styles.vitalChipTextSelected]}>
                  {vt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Generate */}
      <Button
        title={generating ? 'Generating PDF...' : 'Generate PDF'}
        onPress={handleGenerate}
        disabled={!selectedType || generating}
        loading={generating}
        style={{ marginTop: spacing.space4 }}
      />

      {/* Share after generation */}
      {pdfUri && !generating && (
        <View style={styles.successCard}>
          <Ionicons name="checkmark-circle" size={36} color={colors.success} style={{ marginBottom: spacing.space3 }} />
          <Text style={styles.successText}>PDF generated successfully!</Text>
          <Button
            title="Share PDF"
            onPress={handleShare}
            variant="primary"
          />
        </View>
      )}

      <View style={{ height: spacing.space12 }} />
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
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    fontFamily: fonts.display,
    letterSpacing: -0.3,
    marginBottom: spacing.space2,
  },
  subtext: {
    fontSize: 13,
    color: colors.textSecondary,
    fontFamily: fonts.body,
    marginBottom: spacing.space5,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: fonts.body,
    marginBottom: spacing.space3,
    marginTop: spacing.space4,
  },
  vitalSelector: {
    marginTop: spacing.space2,
  },
  vitalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  vitalChip: {
    paddingVertical: spacing.space2 + 2,
    paddingHorizontal: spacing.space4,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginRight: spacing.space2,
    marginBottom: spacing.space2,
    backgroundColor: colors.surface,
  },
  vitalChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySurface,
  },
  vitalChipText: {
    fontSize: 12,
    color: colors.textPrimary,
    fontFamily: fonts.body,
  },
  vitalChipTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  successCard: {
    backgroundColor: colors.successSurface,
    borderRadius: borderRadius.md,
    padding: spacing.space6,
    alignItems: 'center',
    marginTop: spacing.space5,
  },
  successIcon: {
    marginBottom: spacing.space3,
  },
  successText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#065F46',
    fontFamily: fonts.body,
    marginBottom: spacing.space4,
  },
});
