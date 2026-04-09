import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { Redirect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../lib/authContext';
import { signOut } from '../services/authService';
import Colors from '../constants/Colors';

// ─── Premium Splash / Loading Screen ─────────────────────────────────────────
function SplashScreen() {
  const pulseAnim  = useRef(new Animated.Value(1)).current;
  const fadeAnim   = useRef(new Animated.Value(0)).current;
  const dotAnim1   = useRef(new Animated.Value(0.3)).current;
  const dotAnim2   = useRef(new Animated.Value(0.3)).current;
  const dotAnim3   = useRef(new Animated.Value(0.3)).current;
  const orbAnim    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();

    // Logo pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 1200, useNativeDriver: true }),
      ])
    ).start();

    // Background orb drift
    Animated.loop(
      Animated.sequence([
        Animated.timing(orbAnim, { toValue: 1, duration: 3500, useNativeDriver: true }),
        Animated.timing(orbAnim, { toValue: 0, duration: 3500, useNativeDriver: true }),
      ])
    ).start();

    // Staggered loading dots
    const dotSequence = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0.3, duration: 400, useNativeDriver: true }),
          Animated.delay(800),
        ])
      ).start();

    dotSequence(dotAnim1, 0);
    dotSequence(dotAnim2, 200);
    dotSequence(dotAnim3, 400);
  }, []);

  const orbY = orbAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -25] });

  return (
    <Animated.View style={[styles.splash, { opacity: fadeAnim }]}>
      <LinearGradient
        colors={['#040407', '#09090b', '#0c0c13']}
        style={StyleSheet.absoluteFill}
      />

      {/* Drifting orbs */}
      <Animated.View style={[styles.splashOrb, styles.splashOrb1, { transform: [{ translateY: orbY }] }]} />
      <Animated.View style={[styles.splashOrb, styles.splashOrb2]} />

      {/* Scan lines */}
      <View style={styles.scanLines} pointerEvents="none">
        {Array.from({ length: 40 }).map((_, i) => (
          <View key={i} style={styles.scanLine} />
        ))}
      </View>

      {/* Logo mark */}
      <Animated.View style={[styles.logoWrap, { transform: [{ scale: pulseAnim }] }]}>
        <View style={styles.logoRing}>
          <LinearGradient
            colors={['#1e40af', '#3b82f6']}
            style={styles.logoGradient}
          >
            <Feather name="search" size={32} color="#fff" />
          </LinearGradient>
        </View>
      </Animated.View>

      <Text style={styles.splashWordmark}>OSINT</Text>
      <Text style={styles.splashTagline}>INTELLIGENCE PLATFORM</Text>

      {/* Loading dots */}
      <View style={styles.dotsRow}>
        {[dotAnim1, dotAnim2, dotAnim3].map((dot, i) => (
          <Animated.View key={i} style={[styles.dot, { opacity: dot }]} />
        ))}
      </View>

      <Text style={styles.splashStatus}>ESTABLISHING SECURE CONNECTION</Text>
    </Animated.View>
  );
}

// ─── Clearance Pending Screen ─────────────────────────────────────────────────
function ClearancePendingScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  return (
    <Animated.View style={[styles.pendingWrap, { opacity: fadeAnim }]}>
      <LinearGradient
        colors={['#040407', '#09090b']}
        style={StyleSheet.absoluteFill}
      />

      {/* Amber orb */}
      <View style={styles.pendingOrb} />

      <View style={styles.pendingIconWrap}>
        <LinearGradient
          colors={['rgba(245,158,11,0.2)', 'rgba(245,158,11,0.05)']}
          style={styles.pendingIconBg}
        >
          <Feather name="shield" size={40} color={Colors.dark.warning} />
        </LinearGradient>
      </View>

      <Text style={styles.pendingTitle}>Clearance Pending</Text>
      <Text style={styles.pendingSubtitle}>INVESTIGATOR ACCESS REVIEW</Text>
      <Text style={styles.pendingBody}>
        Your account has been created and is awaiting Administrator approval.
        You will be notified once your clearance is granted.
      </Text>

      <View style={styles.pendingDivider} />

      <View style={styles.pendingInfoRow}>
        <Feather name="clock" size={13} color="#52525b" />
        <Text style={styles.pendingInfoText}>Average approval time: 24–48 hours</Text>
      </View>

      <TouchableOpacity style={styles.pendingBtn} onPress={signOut} activeOpacity={0.8}>
        <Feather name="log-out" size={15} color={Colors.dark.warning} style={{ marginRight: 8 }} />
        <Text style={styles.pendingBtnText}>Return to Login</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Root Gate ────────────────────────────────────────────────────────────────
export default function Index() {
  const { user, profile, loading } = useAuth();

  // 1. Show premium splash while checking session
  if (loading) {
    return <SplashScreen />;
  }

  // 2. Authenticated + profile loaded
  if (user && profile) {
    // Investigators require admin activation
    if (profile.role === 'investigator' && !profile.is_active) {
      return <ClearancePendingScreen />;
    }
    // All other roles → go straight to dashboard
    return <Redirect href="/(app)/dashboard" />;
  }

  // 3. Not authenticated → Login
  return <Redirect href="/(auth)/login" />;
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // ── Splash
  splash: {
    flex: 1,
    backgroundColor: '#09090b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashOrb: { position: 'absolute', borderRadius: 999 },
  splashOrb1: {
    width: 320, height: 320,
    top: -80, left: -80,
    backgroundColor: 'rgba(59, 130, 246, 0.06)',
  },
  splashOrb2: {
    width: 250, height: 250,
    bottom: 40, right: -60,
    backgroundColor: 'rgba(139, 92, 246, 0.05)',
  },
  scanLines: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    gap: 18,
    overflow: 'hidden',
  },
  scanLine: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.015)',
  },
  logoWrap: { marginBottom: 24 },
  logoRing: {
    padding: 3,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  logoGradient: {
    width: 80, height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashWordmark: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
    letterSpacing: 8,
    marginBottom: 6,
  },
  splashTagline: {
    color: '#3b82f6',
    fontSize: 10,
    letterSpacing: 4,
    marginBottom: 36,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  dot: {
    width: 6, height: 6,
    borderRadius: 3,
    backgroundColor: '#3b82f6',
  },
  splashStatus: {
    color: '#27272a',
    fontSize: 9,
    letterSpacing: 2,
  },

  // ── Pending
  pendingWrap: {
    flex: 1,
    backgroundColor: '#09090b',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  pendingOrb: {
    position: 'absolute',
    width: 300, height: 300,
    borderRadius: 999,
    top: -60, right: -60,
    backgroundColor: 'rgba(245, 158, 11, 0.04)',
  },
  pendingIconWrap: { marginBottom: 24 },
  pendingIconBg: {
    width: 96, height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  pendingTitle: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  pendingSubtitle: {
    color: Colors.dark.warning,
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  pendingBody: {
    color: '#71717a',
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 28,
  },
  pendingDivider: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginBottom: 20,
  },
  pendingInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 28,
  },
  pendingInfoText: {
    color: '#52525b',
    fontSize: 12,
  },
  pendingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  pendingBtnText: {
    color: Colors.dark.warning,
    fontWeight: '600',
    fontSize: 14,
  },
});
