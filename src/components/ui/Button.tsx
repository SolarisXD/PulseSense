// PulseSense — Button Component
// Variants: primary, danger, outline, ghost, disabled

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, spacing, borderRadius, minTapTarget } from '../../constants/spacing';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'danger' | 'outline' | 'ghost' | 'disabled';
  size?: 'full' | 'medium' | 'small';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  accessibilityLabel?: string;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'full',
  loading = false,
  disabled = false,
  style,
  textStyle,
  accessibilityLabel,
}: ButtonProps) {
  const isDisabled = disabled || variant === 'disabled';

  const containerStyles = [
    styles.base,
    styles[`variant_${variant}`],
    styles[`size_${size}`],
    isDisabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`text_${variant}`],
    size === 'small' && styles.textSmall,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={containerStyles}
      onPress={onPress}
      disabled={isDisabled || loading}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityRole="button"
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' || variant === 'danger' ? '#FFFFFF' : colors.primary}
          size="small"
        />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
  },
  variant_primary: {
    backgroundColor: colors.primary,
  },
  variant_danger: {
    backgroundColor: colors.danger,
  },
  variant_outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  variant_ghost: {
    backgroundColor: 'transparent',
  },
  variant_disabled: {
    backgroundColor: colors.borderLight,
  },
  size_full: {
    width: '100%',
    height: 48,
  },
  size_medium: {
    height: 44,
    paddingHorizontal: 20,
  },
  size_small: {
    height: 36,
    paddingHorizontal: 14,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  text_primary: {
    color: '#FFFFFF',
  },
  text_danger: {
    color: '#FFFFFF',
  },
  text_outline: {
    color: colors.primary,
  },
  text_ghost: {
    color: colors.textSecondary,
  },
  text_disabled: {
    color: colors.textDisabled,
  },
  textSmall: {
    fontSize: 12,
  },
  disabled: {
    opacity: 0.6,
  },
});
