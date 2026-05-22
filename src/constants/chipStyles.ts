import { StyleSheet } from 'react-native';
import { colors } from './colors';
import { spacing, borderRadius } from './spacing';
import { fonts } from './typography';

export const chipStyles = StyleSheet.create({
  chip: {
    paddingVertical: spacing.space2,
    paddingHorizontal: spacing.space4,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginRight: spacing.space2,
    marginBottom: spacing.space2,
  },
  chipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySurface,
  },
  chipText: {
    fontSize: 12,
    color: colors.textPrimary,
    fontFamily: fonts.body,
  },
  chipTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
});
