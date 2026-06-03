import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { spacing } from '../../constants/spacing';
import { fonts } from '../../constants/typography';
import { AppLogo } from './AppLogo';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen = React.memo(function SplashScreen({ onFinish }: SplashScreenProps) {
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const outerRingScale = useRef(new Animated.Value(1)).current;
  const innerRingScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
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

    Animated.timing(taglineOpacity, {
      toValue: 1,
      duration: 500,
      delay: 500,
      useNativeDriver: true,
    }).start();

    const outerLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(outerRingScale, {
          toValue: 1.08,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(outerRingScale, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    outerLoop.start();

    const innerLoop = Animated.loop(
      Animated.sequence([
        Animated.delay(400),
        Animated.timing(innerRingScale, {
          toValue: 1.05,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(innerRingScale, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    innerLoop.start();

    const timer = setTimeout(() => {
      Animated.timing(logoOpacity, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }).start(() => {
        outerLoop.stop();
        innerLoop.stop();
        onFinish();
      });
    }, 2200);

    return () => {
      clearTimeout(timer);
      outerLoop.stop();
      innerLoop.stop();
    };
  }, []);

  return (
    <View style={[styles.splash, { backgroundColor: '#1A5F7A' }]}>
      <LinearGradient
        colors={['#0A2535', '#0F3A4D', 'transparent', 'transparent', '#0F3A4D', '#0A2535']}
        locations={[0, 0.12, 0.35, 0.65, 0.88, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <Animated.View style={{ opacity: logoOpacity, transform: [{ scale: logoScale }] }}>
        <View style={styles.splashLogoContainer}>
          <Animated.View style={[styles.splashRingOuter, { transform: [{ scale: outerRingScale }] }]} />
          <Animated.View style={[styles.splashRingInner, { transform: [{ scale: innerRingScale }] }]} />
          <View style={styles.splashLogoInner}>
            <AppLogo size={64} />
          </View>
        </View>
        <Text style={styles.splashTitle}>PulseSense</Text>
        <Animated.Text style={[styles.splashTagline, { opacity: taglineOpacity }]}>
          Your personal health companion
        </Animated.Text>
      </Animated.View>
    </View>
  );
});

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
  splashRingOuter: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  splashRingInner: {
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

});
