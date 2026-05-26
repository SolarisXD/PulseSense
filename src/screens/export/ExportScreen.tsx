import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { fonts } from '../../constants/typography';
import { spacing, borderRadius } from '../../constants/spacing';
import { VITAL_CONFIG } from '../../utils/vitalFormatters';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/ui/Button';
import { ExportTypeCard } from '../../components/export/ExportTypeCard';
import {
  generateExport,
  generateCsv,
  sharePdf,
  shareCsv,
  previewPdf,
} from '../../export/exportService';
import type { ExportType } from '../../export/exportService';
import { useColors } from '../../hooks/useColors';

type ExportFormat = 'pdf' | 'csv';

const EXPORT_TYPES: { type: ExportType; iconName: keyof typeof Ionicons.glyphMap; title: string; desc: string }[] = [
  { type: 'medical_id', iconName: 'card-outline', title: 'Medical ID', desc: 'Name, DOB, blood group, conditions, allergies, emergency contacts — one page' },
  { type: 'vitals_report', iconName: 'analytics-outline', title: 'Vitals Report', desc: 'Tabular history of selected vitals with date range' },
  { type: 'medications', iconName: 'medkit-outline', title: 'Medications', desc: 'All active prescriptions with dosage table' },
  { type: 'alerts', iconName: 'notifications-outline', title: 'Emergency Alerts', desc: 'Log of emergency events with severity and timestamp' },
  { type: 'full_report', iconName: 'document-text-outline', title: 'Full Report', desc: 'All of the above combined' },
];

const VITAL_TYPES = VITAL_CONFIG.map((v) => ({ key: v.key, label: v.label }));

export function ExportScreen({ route }: any) {
  const c = useColors();
  const initialType = route?.params?.preSelectedType || null;
  const [selectedType, setSelectedType] = useState<ExportType | null>(initialType);

  const preFilterVital = route?.params?.preFilterVital || null;

  const defaultVitals = VITAL_CONFIG.map((v) => v.key);
  const [selectedVitals, setSelectedVitals] = useState<string[]>(
    preFilterVital ? [preFilterVital] : defaultVitals
  );
  const [generating, setGenerating] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('pdf');
  const [resultUri, setResultUri] = useState<string | null>(null);

  const handlePreview = async () => {
    if (!selectedType || exportFormat !== 'pdf') return;
    setGenerating(true);
    try {
      const opts = {
        type: selectedType,
        vitalTypes: selectedType === 'vitals_report' ? selectedVitals : undefined,
      };
      await previewPdf(opts);
    } catch (err) {
      Alert.alert('Error', 'Failed to generate preview. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedType) return;
    setGenerating(true);
    setResultUri(null);

    try {
      const opts = {
        type: selectedType,
        vitalTypes: selectedType === 'vitals_report' ? selectedVitals : undefined,
      };
      const uri = exportFormat === 'csv' ? await generateCsv(opts) : await generateExport(opts);
      setResultUri(uri);
    } catch (err) {
      Alert.alert('Error', `Failed to generate ${exportFormat.toUpperCase()}. Please try again.`);
    }

    setGenerating(false);
  };

  const handleShare = async () => {
    if (!resultUri) return;
    try {
      if (exportFormat === 'csv') {
        await shareCsv(resultUri);
      } else {
        await sharePdf(resultUri);
      }
    } catch (err) {
      Alert.alert('Error', `Failed to share ${exportFormat.toUpperCase()}.`);
    }
  };

  const toggleVital = (key: string) => {
    setSelectedVitals((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const formatLabel = exportFormat === 'pdf' ? 'PDF' : 'CSV';

  return (
    <ScrollView style={[styles.container, { backgroundColor: c.background }]} contentContainerStyle={styles.content}>
      <Text style={[styles.heading, { color: c.textPrimary }]}>Export Report</Text>
      <Text style={[styles.subtext, { color: c.textSecondary }]}>Choose what to include in your export</Text>

      <Text style={[styles.sectionLabel, { color: c.textSecondary }]}>Step 1: Choose Export Type</Text>
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

      {selectedType === 'vitals_report' && (
        <View style={styles.vitalSelector}>
          <Text style={[styles.sectionLabel, { color: c.textSecondary }]}>Step 2: Select Vitals</Text>
          <View style={styles.vitalGrid}>
            {VITAL_TYPES.map((vt) => (
              <TouchableOpacity
                key={vt.key}
                style={[
                  styles.vitalChip,
                  { borderColor: c.border, backgroundColor: c.surface },
                  selectedVitals.includes(vt.key) && styles.vitalChipSelected,
                  selectedVitals.includes(vt.key) && { borderColor: c.primary, backgroundColor: c.primarySurface },
                ]}
                onPress={() => toggleVital(vt.key)}
              >
                <Text style={[
                  styles.vitalChipText,
                  { color: c.textPrimary },
                  selectedVitals.includes(vt.key) && styles.vitalChipTextSelected,
                  selectedVitals.includes(vt.key) && { color: c.primary },
                ]}>
                  {vt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {selectedType && (
        <View style={styles.formatSelector}>
          <Text style={[styles.sectionLabel, { color: c.textSecondary }]}>Step {selectedType === 'vitals_report' ? '3' : '2'}: Choose Format</Text>
          <View style={styles.formatRow}>
            <TouchableOpacity
              style={[
                styles.formatChip,
                { borderColor: c.border, backgroundColor: c.surface },
                exportFormat === 'pdf' && styles.formatChipSelected,
                exportFormat === 'pdf' && { borderColor: c.primary, backgroundColor: c.primary },
              ]}
              onPress={() => setExportFormat('pdf')}
              activeOpacity={0.7}
            >
              <Ionicons name="document-text" size={16} color={exportFormat === 'pdf' ? '#FFFFFF' : c.textSecondary} />
              <Text style={[
                styles.formatChipText,
                { color: c.textPrimary },
                exportFormat === 'pdf' && { color: '#FFFFFF' },
              ]}>
                PDF
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.formatChip,
                { borderColor: c.border, backgroundColor: c.surface },
                exportFormat === 'csv' && styles.formatChipSelected,
                exportFormat === 'csv' && { borderColor: c.primary, backgroundColor: c.primary },
              ]}
              onPress={() => setExportFormat('csv')}
              activeOpacity={0.7}
            >
              <Ionicons name="grid-outline" size={16} color={exportFormat === 'csv' ? '#FFFFFF' : c.textSecondary} />
              <Text style={[
                styles.formatChipText,
                { color: c.textPrimary },
                exportFormat === 'csv' && { color: '#FFFFFF' },
              ]}>
                CSV
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {exportFormat === 'pdf' && (
        <Button
          title={generating ? 'Preparing Preview...' : 'Preview PDF'}
          onPress={handlePreview}
          disabled={!selectedType || generating}
          loading={generating}
          variant="outline"
          style={{ marginTop: spacing.space4 }}
        />
      )}

      <Button
        title={generating ? `Generating ${formatLabel}...` : `Generate ${formatLabel}`}
        onPress={handleGenerate}
        disabled={!selectedType || generating}
        loading={generating}
        style={{ marginTop: spacing.space3 }}
      />

      {resultUri && !generating && (
        <View style={[styles.successCard, { backgroundColor: c.successSurface }]}>
          <Ionicons name="checkmark-circle" size={36} color={c.success} style={{ marginBottom: spacing.space3 }} />
          <Text style={[styles.successText, { color: c.success }]}>{formatLabel} generated successfully!</Text>
          <View style={styles.actionRow}>
            <Button
              title={`Share ${formatLabel}`}
              onPress={handleShare}
              variant="primary"
              style={{ flex: 1 }}
            />
            {exportFormat === 'pdf' && (
              <Button
                title="Preview"
                onPress={handlePreview}
                variant="outline"
                style={{ flex: 1, marginLeft: spacing.space3 }}
              />
            )}
          </View>
        </View>
      )}

      <View style={{ height: spacing.space12 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.space4,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: fonts.display,
    letterSpacing: -0.3,
    marginBottom: spacing.space2,
  },
  subtext: {
    fontSize: 13,
    fontFamily: fonts.body,
    marginBottom: spacing.space5,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
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
    marginRight: spacing.space2,
    marginBottom: spacing.space2,
  },
  vitalChipSelected: {
    // color properties moved inline — kept for conditional reference
  },
  vitalChipText: {
    fontSize: 12,
    fontFamily: fonts.body,
  },
  vitalChipTextSelected: {
    fontWeight: '600',
  },
  formatSelector: {
    marginTop: spacing.space2,
  },
  formatRow: {
    flexDirection: 'row',
    gap: spacing.space3,
  },
  formatChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.space2 + 2,
    paddingHorizontal: spacing.space5,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    gap: spacing.space2,
  },
  formatChipSelected: {
    // color properties moved inline — kept for conditional reference
  },
  formatChipText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: fonts.body,
  },
  successCard: {
    borderRadius: borderRadius.md,
    padding: spacing.space6,
    alignItems: 'center',
    marginTop: spacing.space5,
  },
  successText: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: fonts.body,
    marginBottom: spacing.space4,
  },
  actionRow: {
    flexDirection: 'row',
    width: '100%',
  },
});
