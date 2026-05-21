// PulseSense — Export Type Card Component
// Selectable card for export type picker with Ionicons

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fonts } from '../../constants/typography';
import { colors, spacing, borderRadius } from '../../constants/spacing';

interface ExportTypeCardProps {
  title: string;
  description: string;
  iconName: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  selected: boolean;
  onPress: () => void;
}

export function ExportTypeCard({ title, description, iconName, iconColor, selected, onPress }: ExportTypeCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, selected && styles.cardSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, selected && styles.iconContainerSelected]}>
        <Ionicons
          name={iconName}
          size={20}
          color={selected ? '#FFFFFF' : iconColor || colors.primary}
        />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.title, selected && styles.titleSelected]}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
        {selected && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.space4,
    marginBottom: spacing.space3,
    borderWidth: 1.5,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  cardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySurface,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.space3,
  },
  iconContainerSelected: {
    backgroundColor: colors.primary,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    fontFamily: fonts.body,
  },
  titleSelected: {
    color: colors.primary,
  },
  description: {
    fontSize: 11,
    color: colors.textSecondary,
    fontFamily: fonts.body,
    marginTop: 2,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
});
