// PulseSense — Button Component

import React, { useCallback, useRef } from 'react';
import {
  TouchableWithoutFeedback,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { useColors } from '../../hooks/useColors';
import { spacing, borderRadius } from '../../constants/spacing';
import { fonts } from '../../constants/typography';

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
  const c = useColors();
  const isDisabled = disabled || variant === 'disabled';
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const handlePressIn = useCallback(() => {
    if (!isDisabled && !loading) {
      scale.value = withSpring(0.97, { damping: 15, stiffness: 200 });
    }
  }, [isDisabled, loading]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 12, stiffness: 250 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const variantStyles: Record<string, any> = {
    primary: { backgroundColor: c.primary },
    danger: {
      backgroundColor: c.danger,
      shadowColor: c.danger,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: c.primary,
    },
    ghost: { backgroundColor: 'transparent' },
    disabled: { backgroundColor: c.borderLight },
  };

  const textVariantStyles: Record<string, any> = {
    primary: { color: '#FFFFFF' },
    danger: { color: '#FFFFFF' },
    outline: { color: c.primary },
    ghost: { color: c.textSecondary },
    disabled: { color: c.textDisabled },
  };

  const containerStyles = [
    styles.base,
    styles[`size_${size}`],
    variantStyles[variant],
    isDisabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    textVariantStyles[variant],
    size === 'small' && styles.textSmall,
    textStyle,
  ];

  return (
    <TouchableWithoutFeedback
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      disabled={isDisabled || loading}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityRole="button"
    >
      <Animated.View style={[containerStyles, animatedStyle]}>
        {loading ? (
          <ActivityIndicator
            color={variant === 'primary' || variant === 'danger' ? '#FFFFFF' : c.primary}
            size="small"
          />
        ) : (
          <Text style={textStyles}>{title}</Text>
        )}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
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
    fontSize: 15,
    fontWeight: '600',
    fontFamily: fonts.body,
    letterSpacing: 0.3,
  },
  textSmall: {
    fontSize: 12,
  },
  disabled: {
    opacity: 0.6,
  },
});
