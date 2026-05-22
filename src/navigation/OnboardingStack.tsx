import React, { useState, useRef, useCallback } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { useSettingsStore } from '../store/settingsStore';
import { WelcomeScreen } from '../screens/onboarding/WelcomeScreen';
import { FeaturesScreen } from '../screens/onboarding/FeaturesScreen';
import { SetupProfileScreen } from '../screens/onboarding/SetupProfileScreen';
import { ReadyScreen } from '../screens/onboarding/ReadyScreen';

export function OnboardingStack() {
  const [screenIndex, setScreenIndex] = useState(0);
  const setOnboardingComplete = useSettingsStore((s) => s.setOnboardingComplete);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const goToScreen = useCallback((nextIndex: number) => {
    setScreenIndex(nextIndex);
    slideAnim.setValue(30);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      damping: 20,
      stiffness: 150,
    }).start();
  }, [slideAnim]);

  const screens = [
    <WelcomeScreen key="welcome" onNext={() => goToScreen(1)} />,
    <FeaturesScreen key="features" onNext={() => goToScreen(2)} />,
    <SetupProfileScreen key="setup" onComplete={() => goToScreen(3)} />,
    <ReadyScreen key="ready" onComplete={() => setOnboardingComplete(true)} />,
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <Animated.View
        key={screenIndex}
        style={[
          { flex: 1 },
          {
            opacity: slideAnim.interpolate({
              inputRange: [0, 30],
              outputRange: [1, 0],
            }),
            transform: [{
              translateX: slideAnim.interpolate({
                inputRange: [0, 30],
                outputRange: [0, 40],
              }),
            }],
          },
        ]}
      >
        {screens[screenIndex]}
      </Animated.View>
      {screenIndex < screens.length - 1 && (
        <View style={styles.progressDots}>
          {screens.map((_, idx) => (
            <View
              key={idx}
              style={[
                styles.dot,
                idx === screenIndex && styles.dotActive,
                idx < screenIndex && styles.dotCompleted,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  progressDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: spacing.space8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
    marginHorizontal: 4,
  },
  dotActive: {
    width: 24,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  dotCompleted: {
    backgroundColor: colors.primaryLight,
  },
});
