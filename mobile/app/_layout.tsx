import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '../lib/authContext';
import { ThemeProvider, DarkTheme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';

// ─── Auth Guard ───────────────────────────────────────────────────────────────
// Lives INSIDE AuthProvider so it can access useAuth.
// Watches auth state changes and drives navigation reactively.
function AuthGuard() {
  const { user, profile, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Don't redirect while the session is still being resolved
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inAppGroup  = segments[0] === '(app)';

    if (user && profile) {
      // Investigator awaiting admin approval — send to the pending screen (index)
      if (profile.role === 'investigator' && !profile.is_active) {
        if (inAuthGroup || inAppGroup) {
          router.replace('/');
        }
        return;
      }
      // Fully authenticated — send into the app
      if (inAuthGroup || segments[0] === undefined) {
        router.replace('/(app)/dashboard');
      }
    } else {
      // Not authenticated — send to login
      if (!inAuthGroup) {
        router.replace('/(auth)/login');
      }
    }
  }, [user, profile, loading]);

  return null;
}

// ─── Root Layout ──────────────────────────────────────────────────────────────
export default function RootLayout() {
  return (
    <ThemeProvider value={DarkTheme}>
      <AuthProvider>
        {/* Guard runs silently alongside the navigator */}
        <AuthGuard />
        <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
          {/* Splash / gate */}
          <Stack.Screen name="index" options={{ headerShown: false }} />
          {/* Login / Register */}
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          {/* Main app (tabs: dashboard, cases, profile) */}
          <Stack.Screen name="(app)" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="light" />
      </AuthProvider>
    </ThemeProvider>
  );
}
