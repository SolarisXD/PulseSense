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
import { fonts } from '../../constants/typography';
import { useColors } from '../../hooks/useColors';
import { spacing, borderRadius } from '../../constants/spacing';

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
  unit?: string;
  rightComponent?: React.ReactNode;
  containerStyle?: ViewStyle;
}

export const Input = React.memo(function Input({
  label,
  error,
  unit,
  rightComponent,
  containerStyle,
  style,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const c = useColors();

  const borderColor = error
    ? c.danger
    : isFocused
    ? c.primary
    : c.border;

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={[styles.label, { color: c.textSecondary }]}>{label}</Text>
      <View style={[styles.inputWrapper, { borderColor, backgroundColor: c.surface }]}>
        <TextInput
          style={[styles.input, { color: c.textPrimary }, style]}
          placeholderTextColor={c.textSecondary}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {unit && <Text style={[styles.unit, { color: c.textSecondary }]}>{unit}</Text>}
        {rightComponent}
      </View>
      {error ? <Text style={[styles.error, { color: c.danger }]}>{error}</Text> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.space4,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.space2,
    fontFamily: fonts.body,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderWidth: 1.5,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.space3,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.body,
    paddingVertical: 0,
    height: '100%',
  },
  unit: {
    fontSize: 12,
    fontFamily: fonts.body,
    marginLeft: spacing.space2,
  },
  error: {
    fontSize: 11,
    fontFamily: fonts.body,
    marginTop: spacing.space1,
  },
});
