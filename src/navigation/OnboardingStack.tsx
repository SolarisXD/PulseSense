import React, { useState, useRef, useCallback } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { useSettingsStore } from '../store/settingsStore';
import { WelcomeScreen } from '../screens/onboarding/WelcomeScreen';
import { FeaturesScreen } from '../screens/onboarding/FeaturesScreen';
import { SetupProfileScreen } from '../screens/onboarding/SetupProfileScreen';
import { ReadyScreen } from '../screens/onboarding/ReadyScreen';
import { getDB } from '../hooks/useDB';
import { setOnboardingComplete as setOnboardingCompleteDb } from '../db/queries/settings';

export function OnboardingStack() {
  const [screenIndex, setScreenIndex] = useState(0);
  const setOnboardingComplete = useSettingsStore((s) => s.setOnboardingComplete);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

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

  const handleOnboardingComplete = useCallback(async () => {
    try {
      const db = await getDB();
      await setOnboardingCompleteDb(db);
    } catch (err) {
      console.warn('Failed to save onboarding completion:', err);
    }
    setOnboardingComplete(true);
  }, [setOnboardingComplete]);

  const screens = [
    <WelcomeScreen key="welcome" onNext={() => goToScreen(1)} />,
    <FeaturesScreen key="features" onNext={() => goToScreen(2)} onBack={() => goToScreen(0)} />,
    <SetupProfileScreen key="setup" onComplete={() => goToScreen(3)} onBack={() => goToScreen(1)} />,
    <ReadyScreen key="ready" onComplete={handleOnboardingComplete} />,
  ];

  return (
    <View style={{ flex: 1, backgroundColor: screenIndex === 0 ? '#1A5F7A' : colors.surface }}>
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
      {screenIndex > 0 && screenIndex < screens.length - 1 && (
        <View
          style={[
            styles.progressDots,
            {
              paddingBottom: Math.max(insets.bottom, spacing.space6),
            },
          ]}
        >
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
    paddingTop: spacing.space2,
    backgroundColor: colors.surface,
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
