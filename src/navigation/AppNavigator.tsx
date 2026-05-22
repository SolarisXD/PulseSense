import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { colorsDark } from '../constants/colorsDark';
import { fonts } from '../constants/typography';
import { useProfileStore } from '../store/profileStore';
import { useSettingsStore } from '../store/settingsStore';
import { useThemeStore } from '../store/themeStore';
import { useDB } from '../hooks/useDB';
import { screenHeader } from './headerOptions';
import { OnboardingStack } from './OnboardingStack';
import { TabNavigator } from './TabNavigator';
import { SplashScreen } from '../components/ui/SplashScreen';
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

const Stack = createStackNavigator();

export function AppNavigator() {
  const { isReady, isLoading, error } = useDB();
  const profileExists = !!useProfileStore((s) => s.profile);
  const onboardingComplete = useSettingsStore((s) => s.onboardingComplete);
  const setOnboardingComplete = useSettingsStore((s) => s.setOnboardingComplete);
  const isDark = useThemeStore((s) => s.isDark);
  const [showSplash, setShowSplash] = useState(true);
  const [initialRoute, setInitialRoute] = useState<'onboarding' | 'main' | null>(null);
  const activeColors = useMemo(() => (isDark ? { ...colors, ...colorsDark } : colors), [isDark]);

  useEffect(() => {
    if (!isLoading && isReady) {
      setInitialRoute(profileExists && onboardingComplete ? 'main' : 'onboarding');
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
      <View style={[styles.loading, { backgroundColor: activeColors.background }]}>
        <ActivityIndicator size="large" color={activeColors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.loading, { backgroundColor: activeColors.background }]}>
        <Text style={[styles.errorText, { color: activeColors.danger }]}>Failed to initialize database</Text>
        <Text style={[styles.errorDetail, { color: activeColors.textSecondary }]}>{error}</Text>
      </View>
    );
  }

  const h = (title: string) => screenHeader(title, activeColors);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {initialRoute === 'onboarding' ? (
          <Stack.Screen name="Onboarding" component={OnboardingStack} />
        ) : (
          <>
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen name="EmergencyCheck" component={EmergencyCheckScreen} options={h('Emergency Check')} />
            <Stack.Screen name="EmergencyAction" component={EmergencyActionScreen} options={screenHeader('Action Required', activeColors, true)} />
            <Stack.Screen name="Settings" component={SettingsScreen} options={h('Settings')} />
            <Stack.Screen name="Export" component={ExportScreen} options={h('Export')} />
            <Stack.Screen name="AddContact" component={AddContactScreen} options={h('Add Contact')} />
            <Stack.Screen name="AddCondition" component={AddConditionScreen} options={h('Add Condition')} />
            <Stack.Screen name="EditCondition" component={AddConditionScreen} options={h('Edit Condition')} />
            <Stack.Screen name="AddAllergy" component={AddAllergyScreen} options={h('Add Allergy')} />
            <Stack.Screen name="MedicationsList" component={MedicationsListScreen} options={h('Medications')} />
            <Stack.Screen name="AddMedication" component={AddMedicationScreen} options={h('Add Prescription')} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} options={h('Edit Profile')} />
            <Stack.Screen name="CustomVitals" component={CustomVitalsScreen} options={h('Custom Vitals')} />
            <Stack.Screen name="VitalDetail" component={VitalDetailScreen} options={h('Vital Details')} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: fonts.body,
    marginBottom: spacing.space2,
  },
  errorDetail: {
    fontSize: 13,
    fontFamily: fonts.body,
  },
});
