// PulseSense — Export Type Card Component
// Selectable card for export type picker with Ionicons

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fonts } from '../../constants/typography';
import { spacing, borderRadius } from '../../constants/spacing';
import { useColors } from '../../hooks/useColors';

interface ExportTypeCardProps {
  title: string;
  description: string;
  iconName: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  selected: boolean;
  onPress: () => void;
}

export const ExportTypeCard = React.memo(function ExportTypeCard({ title, description, iconName, iconColor, selected, onPress }: ExportTypeCardProps) {
  const c = useColors();
  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: c.surface, borderColor: c.border },
        selected && { borderColor: c.primary, backgroundColor: c.primarySurface },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityLabel="Select export type"
    >
      <View style={[styles.iconContainer, { backgroundColor: c.surfaceAlt }, selected && { backgroundColor: c.primary }]}>
        <Ionicons
          name={iconName}
          size={20}
          color={selected ? '#FFFFFF' : iconColor || c.primary}
        />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: c.textPrimary }, selected && { color: c.primary }]}>{title}</Text>
        <Text style={[styles.description, { color: c.textSecondary }]}>{description}</Text>
      </View>
      <View style={[styles.checkbox, { borderColor: c.border }, selected && { borderColor: c.primary, backgroundColor: c.primary }]}>
        {selected && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.md,
    padding: spacing.space4,
    marginBottom: spacing.space3,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.space3,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: fonts.body,
  },
  description: {
    fontSize: 11,
    fontFamily: fonts.body,
    marginTop: 2,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
