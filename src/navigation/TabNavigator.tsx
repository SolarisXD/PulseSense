import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { colorsDark } from '../constants/colorsDark';
import { fonts } from '../constants/typography';
import { useThemeStore } from '../store/themeStore';
import { useSettingsStore, FONT_SCALE_MULTIPLIERS } from '../store/settingsStore';
import { scaleSize } from '../constants/typography';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';
import { HomeScreen } from '../screens/tabs/HomeScreen';
import { VitalsScreen } from '../screens/tabs/VitalsScreen';
import { HistoryScreen } from '../screens/tabs/HistoryScreen';
import { ProfileScreen } from '../screens/tabs/ProfileScreen';
import { AlertsScreen } from '../screens/tabs/AlertsScreen';

const Tab = createBottomTabNavigator();

export function TabNavigator() {
  const isDark = useThemeStore((s) => s.isDark);
  const activeColors = useMemo(() => (isDark ? { ...colors, ...colorsDark } : colors), [isDark]);

  const homeTabScreen = useMemo(() => (props: any) => (
    <ErrorBoundary colors={activeColors} iconName="home-outline" title="Home Error"><HomeScreen {...props} /></ErrorBoundary>
  ), [activeColors]);

  const vitalsTabScreen = useMemo(() => (props: any) => (
    <ErrorBoundary colors={activeColors} iconName="pulse-outline" title="Vitals Error"><VitalsScreen {...props} /></ErrorBoundary>
  ), [activeColors]);

  const historyTabScreen = useMemo(() => (props: any) => (
    <ErrorBoundary colors={activeColors} iconName="bar-chart-outline" title="History Error"><HistoryScreen {...props} /></ErrorBoundary>
  ), [activeColors]);

  const profileTabScreen = useMemo(() => (props: any) => (
    <ErrorBoundary colors={activeColors} iconName="person-circle-outline" title="Profile Error"><ProfileScreen {...props} /></ErrorBoundary>
  ), [activeColors]);

  const alertsTabScreen = useMemo(() => (props: any) => (
    <ErrorBoundary colors={activeColors} iconName="notifications-outline" title="Alerts Error"><AlertsScreen {...props} /></ErrorBoundary>
  ), [activeColors]);
  const insets = useSafeAreaInsets();
  const fontScale = useSettingsStore((s) => s.fontScale);
  const fs = FONT_SCALE_MULTIPLIERS[fontScale];

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
              {focused && <View style={[styles.tabIndicator, { backgroundColor: activeColors.primary }]} />}
            </View>
          );
        },
        tabBarActiveTintColor: activeColors.primary,
        tabBarInactiveTintColor: activeColors.textDisabled,
        tabBarStyle: {
          backgroundColor: activeColors.tabBarBg,
          borderTopColor: activeColors.tabBarBorder,
          borderTopWidth: 0.5,
          height: 56 + Math.max(insets.bottom, spacing.space3),
          paddingBottom: Math.max(insets.bottom, spacing.space2),
          paddingTop: 6,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.06,
          shadowRadius: 12,
          elevation: 10,
        },
        tabBarLabelStyle: {
          fontSize: scaleSize(10, fs),
          fontWeight: '500',
          fontFamily: fonts.body,
          letterSpacing: 0.3,
        },
        headerStyle: {
          backgroundColor: activeColors.surface,
          shadowColor: 'transparent',
          elevation: 0,
          borderBottomWidth: 0.5,
          borderBottomColor: activeColors.borderLight,
        },
        headerTitleStyle: {
          fontSize: scaleSize(18, fs),
          fontWeight: '600',
          color: activeColors.textPrimary,
          fontFamily: fonts.display,
        },
        headerTitleContainerStyle: {
          paddingHorizontal: spacing.space4,
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={homeTabScreen} options={{ title: 'Home', headerShown: false }} />
      <Tab.Screen name="VitalsTab" component={vitalsTabScreen} options={{ title: 'Log Vitals' }} />
      <Tab.Screen name="HistoryTab" component={historyTabScreen} options={{ title: 'History' }} />
      <Tab.Screen name="ProfileTab" component={profileTabScreen} options={{ title: 'Profile' }} />
      <Tab.Screen name="AlertsTab" component={alertsTabScreen} options={{ title: 'Alerts' }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabIndicator: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 2,
  },
});
