import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../hooks/useColors';
import { spacing, borderRadius } from '../../constants/spacing';
import { fonts } from '../../constants/typography';

interface VitalFormSectionProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  children: React.ReactNode;
}

export function VitalFormSection({ icon, title, children }: VitalFormSectionProps) {
  const c = useColors();
  return (
    <View style={[styles.section, { backgroundColor: c.surface }]}>
      <View style={styles.header}>
        <Ionicons name={icon} size={18} color={c.primary} />
        <Text style={[styles.title, { color: c.textPrimary }]}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    borderRadius: borderRadius.md,
    padding: spacing.space4,
    marginBottom: spacing.space4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.space3,
    gap: spacing.space2,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: fonts.display,
  },
});
