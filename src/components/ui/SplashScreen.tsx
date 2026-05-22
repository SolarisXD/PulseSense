import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { spacing } from '../../constants/spacing';
import { fonts } from '../../constants/typography';

interface SplashScreenProps {
  onFinish: () => void;
}

export function SplashScreen({ onFinish }: SplashScreenProps) {
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;

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
});
