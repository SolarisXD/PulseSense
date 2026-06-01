// PulseSense — Onboarding: Welcome Screen

import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing } from '../../constants/spacing';
import { fonts } from '../../constants/typography';
import { Button } from '../../components/ui/Button';
import { AppLogo } from '../../components/ui/AppLogo';

interface WelcomeScreenProps {
  onNext: () => void;
}

export function WelcomeScreen({ onNext }: WelcomeScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={['#1A5F7A', '#154A61', '#0F3A4D']}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(insets.top, spacing.space6),
            paddingBottom: Math.max(insets.bottom, spacing.space6),
          },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.illustrationContainer}>
          <View style={styles.logoContainer}>
            <View style={styles.ring} />
            <View style={styles.logoInner}>
              <AppLogo size={72} />
            </View>
          </View>
          <Text style={styles.appName}>PulseSense</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.heading}>Your personal health{'\n'}companion</Text>
          <Text style={styles.subtext}>
            Track vitals, manage medications, and know what to do in a medical emergency — all offline, all on your device.
          </Text>
        </View>

        <View style={styles.footer}>
          <Button
            title="Get Started"
            onPress={onNext}
            variant="primary"
            style={{ backgroundColor: '#FFFFFF' }}
            textStyle={{ color: '#1A5F7A' }}
          />
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.space6,
    justifyContent: 'space-between',
  },
  illustrationContainer: {
    flex: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.space8,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: spacing.space4,
  },
  ring: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  logoInner: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: fonts.display,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: spacing.space4,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 34,
    fontFamily: fonts.display,
    letterSpacing: -0.3,
    marginBottom: spacing.space4,
    textAlign: 'center',
  },
  subtext: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 22,
    textAlign: 'center',
    fontFamily: fonts.body,
    paddingHorizontal: spacing.space4,
  },
  footer: {
    width: '100%',
    paddingBottom: spacing.space6,
  },
});
