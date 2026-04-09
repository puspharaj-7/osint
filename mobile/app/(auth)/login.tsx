import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { signIn, signUp } from '../../services/authService';
import Colors from '../../constants/Colors';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [requestInvestigator, setRequestInvestigator] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Entrance animations
  const fadeAnim   = useRef(new Animated.Value(0)).current;
  const slideAnim  = useRef(new Animated.Value(40)).current;
  const logoScale  = useRef(new Animated.Value(0.8)).current;
  const orb1Anim   = useRef(new Animated.Value(0)).current;
  const orb2Anim   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Floating orbs
    Animated.loop(
      Animated.sequence([
        Animated.timing(orb1Anim, { toValue: 1, duration: 4000, useNativeDriver: true }),
        Animated.timing(orb1Anim, { toValue: 0, duration: 4000, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(orb2Anim, { toValue: 1, duration: 5500, useNativeDriver: true }),
        Animated.timing(orb2Anim, { toValue: 0, duration: 5500, useNativeDriver: true }),
      ])
    ).start();

    // Content entrance
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 700, delay: 100, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, delay: 100, useNativeDriver: true }),
      Animated.spring(logoScale, { toValue: 1, tension: 60, friction: 8, delay: 150, useNativeDriver: true }),
    ]).start();
  }, []);

  // Re-animate form when switching modes
  const formSlide = useRef(new Animated.Value(0)).current;
  const switchMode = (login: boolean) => {
    Animated.sequence([
      Animated.timing(formSlide, { toValue: -10, duration: 100, useNativeDriver: true }),
      Animated.timing(formSlide, { toValue: 0,   duration: 200, useNativeDriver: true }),
    ]).start();
    setIsLogin(login);
  };

  const orb1Y = orb1Anim.interpolate({ inputRange: [0, 1], outputRange: [0, -20] });
  const orb2Y = orb2Anim.interpolate({ inputRange: [0, 1], outputRange: [0, 15] });

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim() || (!isLogin && !fullName.trim())) {
      Alert.alert('Missing Fields', 'Please fill out all required fields.');
      return;
    }
    setLoading(true);
    try {
      if (isLogin) {
        // signIn triggers AuthContext → index.tsx auto-redirects to (app)/dashboard
        await signIn(email.trim(), password);
      } else {
        const role = requestInvestigator ? 'investigator' : 'client';
        await signUp(email.trim(), password, fullName.trim(), role);
        Alert.alert(
          'Account Created',
          requestInvestigator
            ? 'Your Investigator account requires Admin approval before you can access the platform.'
            : 'Check your email to verify your account, then log in.',
          [{ text: 'OK', onPress: () => switchMode(true) }]
        );
      }
    } catch (err: any) {
      Alert.alert('Authentication Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputBorder = (field: string) =>
    focusedField === field ? Colors.dark.primary + '80' : Colors.dark.border;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.root}
    >
      {/* ── Background ── */}
      <LinearGradient
        colors={['#040407', '#09090b', '#0d0d14']}
        style={StyleSheet.absoluteFill}
      />

      {/* Floating accent orbs */}
      <Animated.View style={[styles.orb, styles.orb1, { transform: [{ translateY: orb1Y }] }]} />
      <Animated.View style={[styles.orb, styles.orb2, { transform: [{ translateY: orb2Y }] }]} />

      {/* Scan-line effect */}
      <View style={styles.scanLines} pointerEvents="none">
        {Array.from({ length: 30 }).map((_, i) => (
          <View key={i} style={styles.scanLine} />
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.content,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* ── Brand ── */}
          <Animated.View style={[styles.brand, { transform: [{ scale: logoScale }] }]}>
            <View style={styles.logoRing}>
              <LinearGradient
                colors={['#1e40af', '#3b82f6']}
                style={styles.logoGradient}
              >
                <Feather name="search" size={28} color="#fff" />
              </LinearGradient>
            </View>
            <Text style={styles.wordmark}>OSINT</Text>
            <Text style={styles.tagline}>INTELLIGENCE PLATFORM</Text>
            <View style={styles.classifiedBadge}>
              <View style={styles.classifiedDot} />
              <Text style={styles.classifiedText}>SECURE ACCESS REQUIRED</Text>
            </View>
          </Animated.View>

          {/* ── Card ── */}
          <Animated.View style={[styles.card, { transform: [{ translateY: formSlide }] }]}>
            {/* Glass shimmer top border */}
            <LinearGradient
              colors={['rgba(59,130,246,0.6)', 'rgba(59,130,246,0)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.cardTopBorder}
            />

            {/* Toggle */}
            <View style={styles.toggle}>
              {(['LOGIN', 'REGISTER'] as const).map((label, i) => {
                const active = isLogin === (i === 0);
                return (
                  <TouchableOpacity
                    key={label}
                    style={[styles.toggleBtn, active && styles.toggleBtnActive]}
                    onPress={() => switchMode(i === 0)}
                  >
                    {active && (
                      <LinearGradient
                        colors={['rgba(59,130,246,0.25)', 'rgba(59,130,246,0.05)']}
                        style={StyleSheet.absoluteFill}
                      />
                    )}
                    <Text style={[styles.toggleText, active && styles.toggleTextActive]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Full Name (Register only) */}
            {!isLogin && (
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>FULL NAME</Text>
                <View style={[styles.inputWrap, { borderColor: inputBorder('name') }]}>
                  <Feather name="user" size={16} color={focusedField === 'name' ? Colors.dark.primary : '#52525b'} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Jane Doe"
                    placeholderTextColor="#3f3f46"
                    value={fullName}
                    onChangeText={setFullName}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
              </View>
            )}

            {/* Email */}
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>EMAIL ADDRESS</Text>
              <View style={[styles.inputWrap, { borderColor: inputBorder('email') }]}>
                <Feather name="mail" size={16} color={focusedField === 'email' ? Colors.dark.primary : '#52525b'} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="operative@agency.gov"
                  placeholderTextColor="#3f3f46"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>PASSWORD</Text>
              <View style={[styles.inputWrap, { borderColor: inputBorder('pass') }]}>
                <Feather name="lock" size={16} color={focusedField === 'pass' ? Colors.dark.primary : '#52525b'} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="••••••••••••"
                  placeholderTextColor="#3f3f46"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  onFocus={() => setFocusedField('pass')}
                  onBlur={() => setFocusedField(null)}
                />
                <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={styles.eyeBtn}>
                  <Feather name={showPassword ? 'eye-off' : 'eye'} size={16} color="#52525b" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Investigator checkbox */}
            {!isLogin && (
              <TouchableOpacity
                style={styles.checkRow}
                onPress={() => setRequestInvestigator(v => !v)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, requestInvestigator && styles.checkboxOn]}>
                  {requestInvestigator && <Feather name="check" size={11} color="#fff" />}
                </View>
                <Text style={styles.checkLabel}>
                  Request Investigator access{' '}
                  <Text style={{ color: Colors.dark.warning }}>(requires Admin approval)</Text>
                </Text>
              </TouchableOpacity>
            )}

            {/* Submit */}
            <TouchableOpacity
              style={[styles.submitBtn, loading && { opacity: 0.7 }]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#1d4ed8', '#3b82f6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitGradient}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={styles.submitText}>
                      {isLogin ? 'ACCESS SYSTEM' : 'CREATE ACCOUNT'}
                    </Text>
                    <Feather name="arrow-right" size={18} color="#fff" style={{ marginLeft: 8 }} />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Footer note */}
            <View style={styles.footerRow}>
              <Feather name="shield" size={11} color="#3f3f46" />
              <Text style={styles.footerText}>
                Authorized personnel only · All sessions are monitored
              </Text>
            </View>
          </Animated.View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#09090b' },

  orb: { position: 'absolute', borderRadius: 999 },
  orb1: {
    width: 280, height: 280,
    top: -80, left: -80,
    backgroundColor: 'rgba(59, 130, 246, 0.07)',
  },
  orb2: {
    width: 220, height: 220,
    bottom: 60, right: -60,
    backgroundColor: 'rgba(139, 92, 246, 0.06)',
  },

  scanLines: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    gap: 18,
    overflow: 'hidden',
  },
  scanLine: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.015)',
  },

  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  content: { width: '100%' },

  // Brand
  brand: { alignItems: 'center', marginBottom: 36 },
  logoRing: {
    padding: 3,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    marginBottom: 16,
  },
  logoGradient: {
    width: 64, height: 64,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmark: {
    color: '#fff',
    fontSize: 34,
    fontWeight: 'bold',
    letterSpacing: 6,
    marginBottom: 4,
  },
  tagline: {
    color: '#3b82f6',
    fontSize: 10,
    letterSpacing: 4,
    marginBottom: 14,
  },
  classifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  classifiedDot: {
    width: 5, height: 5,
    borderRadius: 3,
    backgroundColor: '#ef4444',
  },
  classifiedText: {
    color: '#ef4444',
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 2,
  },

  // Card
  card: {
    backgroundColor: 'rgba(24, 24, 27, 0.95)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: 24,
    overflow: 'hidden',
  },
  cardTopBorder: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 1,
  },

  // Toggle
  toggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 10,
    padding: 4,
    marginBottom: 24,
    gap: 4,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    overflow: 'hidden',
  },
  toggleBtnActive: {
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  toggleText: {
    color: '#52525b',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  toggleTextActive: { color: '#e4e4e7' },

  // Fields
  fieldBlock: { marginBottom: 16 },
  fieldLabel: {
    color: '#52525b',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 8,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderWidth: 1,
    borderRadius: 10,
    height: 50,
  },
  inputIcon: { paddingHorizontal: 14 },
  input: { flex: 1, color: '#e4e4e7', fontSize: 15, paddingRight: 12 },
  eyeBtn: { paddingHorizontal: 14 },

  // Checkbox
  checkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 10,
  },
  checkbox: {
    width: 18, height: 18,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#3f3f46',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    flexShrink: 0,
  },
  checkboxOn: {
    backgroundColor: Colors.dark.primary,
    borderColor: Colors.dark.primary,
  },
  checkLabel: { color: '#71717a', fontSize: 12, flex: 1, lineHeight: 18 },

  // Submit
  submitBtn: { marginTop: 8, borderRadius: 12, overflow: 'hidden' },
  submitGradient: {
    flexDirection: 'row',
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
    letterSpacing: 1.5,
  },

  // Footer
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 20,
  },
  footerText: {
    color: '#3f3f46',
    fontSize: 11,
    textAlign: 'center',
  },
});
