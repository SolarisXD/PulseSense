// PulseSense — App Navigator
// Root Stack → Splash → Onboarding OR Main Tabs

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Animated, Dimensions } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../constants/spacing';

// Screens
import { WelcomeScreen } from '../screens/onboarding/WelcomeScreen';
import { FeaturesScreen } from '../screens/onboarding/FeaturesScreen';
import { SetupProfileScreen } from '../screens/onboarding/SetupProfileScreen';
import { ReadyScreen } from '../screens/onboarding/ReadyScreen';
import { HomeScreen } from '../screens/tabs/HomeScreen';
import { VitalsScreen } from '../screens/tabs/VitalsScreen';
import { HistoryScreen } from '../screens/tabs/HistoryScreen';
import { ProfileScreen } from '../screens/tabs/ProfileScreen';
import { AlertsScreen } from '../screens/tabs/AlertsScreen';
import { EmergencyCheckScreen } from '../screens/emergency/EmergencyCheckScreen';
import { EmergencyActionScreen } from '../screens/emergency/EmergencyActionScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { ExportScreen } from '../screens/export/ExportScreen';
import { AddContactScreen } from '../screens/AddContactScreen';
import { AddConditionScreen } from '../screens/conditions/AddConditionScreen';
import { AddAllergyScreen } from '../screens/AddAllergyScreen';
import { MedicationsListScreen } from '../screens/medications/MedicationsListScreen';
import { AddMedicationScreen } from '../screens/medications/AddMedicationScreen';
import { EditProfileScreen } from '../screens/EditProfileScreen';
import { CustomVitalsScreen } from '../screens/CustomVitalsScreen';
import { VitalDetailScreen } from '../screens/VitalDetailScreen';

// Hooks & Stores
import { useDB } from '../hooks/useDB';
import { useProfileStore } from '../store/profileStore';
import { useSettingsStore } from '../store/settingsStore';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// ----------- Splash Screen -----------
function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [scaleAnim] = useState(new Animated.Value(0.85));
  const [opacityAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        damping: 10,
        stiffness: 100,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => onFinish());
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View style={[styles.splash, { opacity: opacityAnim }]}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <View style={styles.splashLogo}>
          <Text style={styles.splashIcon}>❤️</Text>
        </View>
        <Text style={styles.splashTitle}>PulseSense</Text>
        <Text style={styles.splashTagline}>Your personal health companion</Text>
      </Animated.View>
    </Animated.View>
  );
}

// ----------- Onboarding Stack -----------
function OnboardingStack() {
  const [screenIndex, setScreenIndex] = useState(0);
  const onboardingComplete = useSettingsStore((s) => s.setOnboardingComplete);
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
    <ReadyScreen key="ready" onComplete={() => onboardingComplete(true)} />,
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
      {/* Progress dots */}
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

// ----------- Tab Navigator -----------
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';
          switch (route.name) {
            case 'HomeTab': iconName = focused ? 'home' : 'home-outline'; break;
            case 'VitalsTab': iconName = focused ? 'pulse' : 'pulse-outline'; break;
            case 'HistoryTab': iconName = focused ? 'bar-chart' : 'bar-chart-outline'; break;
            case 'ProfileTab': iconName = focused ? 'person-circle' : 'person-circle-outline'; break;
            case 'AlertsTab': iconName = focused ? 'notifications' : 'notifications-outline'; break;
          }
          return (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name={iconName} size={size} color={color} />
              {focused && <View style={styles.tabIndicator} />}
            </View>
          );
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textDisabled,
        tabBarStyle: {
          backgroundColor: 'rgba(255,255,255,0.92)',
          borderTopColor: 'rgba(233,237,242,0.8)',
          height: 64,
          paddingBottom: 8,
          paddingTop: 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          fontFamily: 'Inter',
        },
        headerStyle: {
          backgroundColor: colors.surface,
          shadowColor: 'transparent',
          elevation: 0,
        },
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '600',
          color: colors.textPrimary,
          fontFamily: 'Inter',
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ title: 'Home', headerShown: false }} />
      <Tab.Screen name="VitalsTab" component={VitalsScreen} options={{ title: 'Log Vitals' }} />
      <Tab.Screen name="HistoryTab" component={HistoryScreen} options={{ title: 'History' }} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ title: 'Profile' }} />
      <Tab.Screen name="AlertsTab" component={AlertsScreen} options={{ title: 'Alerts' }} />
    </Tab.Navigator>
  );
}

// ----------- Root Navigator -----------
export function AppNavigator() {
  const { isReady, isLoading, error } = useDB();
  const profileExists = !!useProfileStore((s) => s.profile);
  const onboardingComplete = useSettingsStore((s) => s.onboardingComplete);
  const setOnboardingComplete = useSettingsStore((s) => s.setOnboardingComplete);
  const [showSplash, setShowSplash] = useState(true);
  const [initialRoute, setInitialRoute] = useState<'onboarding' | 'main' | null>(null);

  useEffect(() => {
    if (!isLoading && isReady) {
      if (profileExists && onboardingComplete) {
        setInitialRoute('main');
      } else {
        setInitialRoute('onboarding');
      }
    }
  }, [isLoading, isReady, profileExists, onboardingComplete]);

  // If store was updated (onboarding just completed), switch to main
  useEffect(() => {
    if (onboardingComplete && initialRoute === 'onboarding') {
      setInitialRoute('main');
    }
  }, [onboardingComplete, initialRoute]);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (isLoading || !initialRoute) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loading}>
        <Text style={styles.errorText}>Failed to initialize database</Text>
        <Text style={styles.errorDetail}>{error}</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {initialRoute === 'onboarding' ? (
          <Stack.Screen name="Onboarding" component={OnboardingStack} />
        ) : (
          <>
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen name="EmergencyCheck" component={EmergencyCheckScreen} options={{ headerShown: true, title: 'Emergency Check', headerTintColor: colors.danger, headerStyle: { backgroundColor: colors.surface, shadowColor: 'transparent', elevation: 0 } }} />
            <Stack.Screen name="EmergencyAction" component={EmergencyActionScreen} options={{ headerShown: true, title: 'Action Required', headerTintColor: '#FFFFFF', headerStyle: { backgroundColor: colors.danger, shadowColor: 'transparent', elevation: 0 } }} />
            <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: true, title: 'Settings' }} />
            <Stack.Screen name="Export" component={ExportScreen} options={{ headerShown: true, title: 'Export' }} />
            <Stack.Screen name="AddContact" component={AddContactScreen} options={{ headerShown: true, title: 'Add Contact' }} />
            <Stack.Screen name="AddCondition" component={AddConditionScreen} options={{ headerShown: true, title: 'Add Condition' }} />
            <Stack.Screen name="EditCondition" component={AddConditionScreen} options={{ headerShown: true, title: 'Edit Condition' }} />
            <Stack.Screen name="AddAllergy" component={AddAllergyScreen} options={{ headerShown: true, title: 'Add Allergy' }} />
            <Stack.Screen name="MedicationsList" component={MedicationsListScreen} options={{ headerShown: true, title: 'Medications' }} />
            <Stack.Screen name="AddMedication" component={AddMedicationScreen} options={{ headerShown: true, title: 'Add Prescription' }} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ headerShown: true, title: 'Edit Profile' }} />
            <Stack.Screen name="CustomVitals" component={CustomVitalsScreen} options={{ headerShown: true, title: 'Custom Vitals' }} />
            <Stack.Screen name="VitalDetail" component={VitalDetailScreen} options={{ headerShown: true, title: 'Vital Details' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashLogo: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.space4,
    alignSelf: 'center',
  },
  splashIcon: {
    fontSize: 44,
  },
  splashTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Inter',
    textAlign: 'center',
  },
  splashTagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontFamily: 'Inter',
    textAlign: 'center',
    marginTop: spacing.space2,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.danger,
    fontFamily: 'Inter',
    marginBottom: spacing.space2,
  },
  errorDetail: {
    fontSize: 13,
    color: colors.textSecondary,
    fontFamily: 'Inter',
  },
  tabIndicator: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.primary,
    marginTop: 2,
  },
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
