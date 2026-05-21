// PulseSense — Input Field Component
// Standard text input with label, error state, and optional unit badge

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ViewStyle,
  TextInputProps,
} from 'react-native';
import { colors, spacing, borderRadius } from '../../constants/spacing';

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
  unit?: string;
  rightComponent?: React.ReactNode;
  containerStyle?: ViewStyle;
}

export function Input({
  label,
  error,
  unit,
  rightComponent,
  containerStyle,
  style,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const borderColor = error
    ? colors.danger
    : isFocused
    ? colors.primary
    : colors.border;

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrapper, { borderColor }]}>
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={colors.textSecondary}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {unit && <Text style={styles.unit}>{unit}</Text>}
        {rightComponent}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.space4,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.space2,
    fontFamily: 'Inter',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderWidth: 1.5,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.space3,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    fontFamily: 'Inter',
    paddingVertical: 0,
    height: '100%',
  },
  unit: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'Inter',
    marginLeft: spacing.space2,
  },
  error: {
    fontSize: 11,
    color: colors.danger,
    fontFamily: 'Inter',
    marginTop: spacing.space1,
  },
});
