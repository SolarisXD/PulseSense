// PulseSense — Main Entry Point
// Loads fonts, initializes database, and renders the app navigator

import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreenExpo from 'expo-splash-screen';
import { useFonts, Syne_400Regular, Syne_500Medium, Syne_600SemiBold, Syne_700Bold, Syne_800ExtraBold } from '@expo-google-fonts/syne';
import { Outfit_400Regular, Outfit_500Medium, Outfit_600SemiBold, Outfit_700Bold } from '@expo-google-fonts/outfit';
import { RobotoMono_400Regular, RobotoMono_500Medium } from '@expo-google-fonts/roboto-mono';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppNavigator } from './src/navigation/AppNavigator';
import { initializeNotificationHandler } from './src/services/notificationService';

// Prevent native splash from auto-hiding
SplashScreenExpo.preventAutoHideAsync();

initializeNotificationHandler();

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Syne: Syne_400Regular,
    Syne_400: Syne_400Regular,
    Syne_500: Syne_500Medium,
    Syne_600: Syne_600SemiBold,
    Syne_700: Syne_700Bold,
    Syne_800: Syne_800ExtraBold,
    Outfit: Outfit_400Regular,
    Outfit_400: Outfit_400Regular,
    Outfit_500: Outfit_500Medium,
    Outfit_600: Outfit_600SemiBold,
    Outfit_700: Outfit_700Bold,
    RobotoMono: RobotoMono_400Regular,
    RobotoMono_400: RobotoMono_400Regular,
    RobotoMono_500: RobotoMono_500Medium,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreenExpo.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar style="dark" />
      <AppNavigator />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A5F7A',
  },
});
