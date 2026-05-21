// PulseSense — App Navigator
// Root Stack → Splash → Onboarding OR Main Tabs
// Glassmorphism tab bar + animated splash

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Animated, Dimensions } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing } from '../constants/spacing';
import { fonts } from '../constants/typography';

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

const { width, height } = Dimensions.get('window');

// ----------- Splash Screen -----------
function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Logo entrance
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        useNativeDriver: true,
        damping: 12,
        stiffness: 100,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();

    // Tagline fade in (delayed)
    Animated.timing(taglineOpacity, {
      toValue: 1,
      duration: 500,
      delay: 500,
      useNativeDriver: true,
    }).start();

    // Pulse animation on the ECG line
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseScale, {
          toValue: 1.03,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseScale, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();

    const timer = setTimeout(() => {
      Animated.timing(logoOpacity, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }).start(() => onFinish());
    }, 2000);

    return () => {
      clearTimeout(timer);
      pulseLoop.stop();
    };
  }, []);

  return (
    <LinearGradient
      colors={['#1A5F7A', '#154A61', '#0F3A4D']}
      style={styles.splash}
    >
      <Animated.View style={{ opacity: logoOpacity, transform: [{ scale: logoScale }] }}>
        {/* Logo icon */}
        <View style={styles.splashLogoContainer}>
          <Animated.View style={[styles.splashRing, { transform: [{ scale: pulseScale }] }]} />
          <View style={styles.splashLogoInner}>
            <Ionicons name="heart" size={36} color="#FFFFFF" />
          </View>
        </View>
        <Text style={styles.splashTitle}>PulseSense</Text>
        <Animated.Text style={[styles.splashTagline, { opacity: taglineOpacity }]}>
          Your personal health companion
        </Animated.Text>
      </Animated.View>

      {/* Decorative dots */}
      <View style={styles.splashDots}>
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            style={[styles.splashDot, { opacity: 0.3 + i * 0.15 }]}
          />
        ))}
      </View>
    </LinearGradient>
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
          backgroundColor: colors.tabBarBg,
          borderTopColor: colors.tabBarBorder,
          borderTopWidth: 0.5,
          height: 68,
          paddingBottom: 10,
          paddingTop: 6,
          // Frosted glass effect
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.06,
          shadowRadius: 12,
          elevation: 10,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          fontFamily: fonts.body,
          letterSpacing: 0.3,
        },
        headerStyle: {
          backgroundColor: colors.surface,
          shadowColor: 'transparent',
          elevation: 0,
          borderBottomWidth: 0.5,
          borderBottomColor: colors.borderLight,
        },
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '600',
          color: colors.textPrimary,
          fontFamily: fonts.display,
        },
        headerTitleContainerStyle: {
          paddingHorizontal: spacing.space4,
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
            <Stack.Screen name="EmergencyCheck" component={EmergencyCheckScreen} options={{ headerShown: true, title: 'Emergency Check', headerTintColor: colors.danger, headerStyle: { backgroundColor: colors.surface, shadowColor: 'transparent', elevation: 0, borderBottomWidth: 0.5, borderBottomColor: colors.borderLight }, headerTitleStyle: { fontFamily: fonts.display, fontSize: 18, fontWeight: '600', color: colors.textPrimary }, headerTitleContainerStyle: { paddingHorizontal: spacing.space4 } }} />
            <Stack.Screen name="EmergencyAction" component={EmergencyActionScreen} options={{ headerShown: true, title: 'Action Required', headerTintColor: '#FFFFFF', headerStyle: { backgroundColor: colors.danger, shadowColor: 'transparent', elevation: 0 }, headerTitleStyle: { fontFamily: fonts.display, fontSize: 18, fontWeight: '700', color: '#FFFFFF' } }} />
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashLogoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: spacing.space5,
  },
  splashRing: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  splashLogoInner: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: fonts.display,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  splashTagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    fontFamily: fonts.body,
    textAlign: 'center',
    marginTop: spacing.space2,
    letterSpacing: 0.3,
  },
  splashDots: {
    position: 'absolute',
    bottom: 60,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  splashDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
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
    fontFamily: fonts.body,
    marginBottom: spacing.space2,
  },
  errorDetail: {
    fontSize: 13,
    color: colors.textSecondary,
    fontFamily: fonts.body,
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
