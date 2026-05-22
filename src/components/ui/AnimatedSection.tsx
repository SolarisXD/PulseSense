import React, { useEffect } from 'react';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, withDelay, Easing } from 'react-native-reanimated';

interface AnimatedSectionProps {
  children: React.ReactNode;
  index?: number;
  style?: any;
  baseDelay?: number;
  staggeredDelay?: number;
  translateY?: number;
}

export function AnimatedSection({
  children,
  index = 0,
  style,
  baseDelay = 300,
  staggeredDelay = 120,
  translateY = 24,
}: AnimatedSectionProps) {
  const opacity = useSharedValue(0);
  const y = useSharedValue(translateY);

  useEffect(() => {
    const delay = baseDelay + index * staggeredDelay;
    opacity.value = withDelay(delay, withTiming(1, { duration: 500, easing: Easing.out(Easing.ease) }));
    y.value = withDelay(delay, withSpring(0, { damping: 18, stiffness: 140 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: y.value }],
  }));

  return <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>;
}
