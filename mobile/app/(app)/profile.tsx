import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
  Switch,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../lib/authContext';
import { signOut } from '../../services/authService';
import { supabase } from '../../lib/supabase';
import Colors from '../../constants/Colors';
import { GlassPanel } from '../../components/GlassPanel';

// ─── Role Config ──────────────────────────────────────────────────────────────
const ROLE_CONFIG: Record<string, { color: string; gradient: [string, string]; label: string; icon: string }> = {
  admin:       { color: '#8b5cf6', gradient: ['rgba(139, 92, 246, 0.25)', 'rgba(139, 92, 246, 0)'],  label: 'SYSTEM ADMIN',    icon: 'shield' },
  investigator:{ color: '#3b82f6', gradient: ['rgba(59, 130, 246, 0.25)',  'rgba(59, 130, 246, 0)'],  label: 'INVESTIGATOR',    icon: 'search' },
  client:      { color: '#10b981', gradient: ['rgba(16, 185, 129, 0.25)',  'rgba(16, 185, 129, 0)'],  label: 'CLIENT',          icon: 'briefcase' },
  manager:     { color: '#f59e0b', gradient: ['rgba(245, 158, 11, 0.25)',  'rgba(245, 158, 11, 0)'],  label: 'MANAGER',         icon: 'layers' },
};

// ─── Stat Tile ─────────────────────────────────────────────────────────────────
function StatTile({ value, label, icon, color }: { value: string | number; label: string; icon: string; color: string }) {
  return (
    <GlassPanel style={styles.statTile}>
      <Feather name={icon as any} size={18} color={color} style={{ marginBottom: 10 }} />
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </GlassPanel>
  );
}

// ─── Section Row ───────────────────────────────────────────────────────────────
function SettingRow({
  icon,
  iconColor,
  iconBg,
  title,
  description,
  onPress,
  rightNode,
  dangerous,
}: {
  icon: string;
  iconColor: string;
  iconBg: string;
  title: string;
  description?: string;
  onPress?: () => void;
  rightNode?: React.ReactNode;
  dangerous?: boolean;
}) {
  return (
    <TouchableOpacity style={styles.settingRow} onPress={onPress} activeOpacity={0.7} disabled={!onPress && !rightNode}>
      <View style={[styles.settingIcon, { backgroundColor: iconBg }]}>
        <Feather name={icon as any} size={17} color={iconColor} />
      </View>
      <View style={styles.settingText}>
        <Text style={[styles.settingTitle, dangerous && { color: Colors.dark.destructive }]}>{title}</Text>
        {description ? <Text style={styles.settingDesc}>{description}</Text> : null}
      </View>
      {rightNode ?? <Feather name="chevron-right" size={18} color="#3f3f46" />}
    </TouchableOpacity>
  );
}

// ─── Main Screen ───────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const { profile } = useAuth();
  const role = profile?.role ?? 'investigator';
  const roleConf = ROLE_CONFIG[role] ?? ROLE_CONFIG.investigator;

  // Stats
  const [stats, setStats] = useState({ cases: 0, findings: 0, reports: 0 });
  const [notifications, setNotifications] = useState(true);

  // Avatar pulse animation
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.06, duration: 1800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1,    duration: 1800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // Fade-in on mount
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  // Fetch stats
  useEffect(() => {
    if (!profile) return;
    async function load() {
      const [{ count: cases }, { count: findings }, { count: reports }] = await Promise.all([
        supabase.from('cases').select('*', { count: 'exact', head: true }),
        supabase.from('osint_findings').select('*', { count: 'exact', head: true }),
        supabase.from('reports').select('*', { count: 'exact', head: true }),
      ]);
      setStats({ cases: cases ?? 0, findings: findings ?? 0, reports: reports ?? 0 });
    }
    load();
  }, [profile]);

  // Helpers
  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'OP';

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '—';

  const handleSignOut = () => {
    Alert.alert(
      'Terminate Session',
      'You will be securely logged out. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', style: 'destructive', onPress: signOut },
      ]
    );
  };

  return (
    <Animated.View style={[styles.root, { opacity: fadeAnim }]}>
      {/* Background accent */}
      <LinearGradient
        colors={roleConf.gradient}
        style={styles.bgAccent}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero Header ── */}
        <View style={styles.hero}>
          {/* Pulsing ring */}
          <Animated.View style={[styles.avatarRing, { borderColor: roleConf.color + '55', transform: [{ scale: pulse }] }]}>
            <LinearGradient
              colors={[roleConf.color, '#1e1e2e']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>{initials}</Text>
            </LinearGradient>
          </Animated.View>

          {/* Name & meta */}
          <Text style={styles.name}>{profile?.full_name || 'Operative'}</Text>
          <Text style={styles.email}>{profile?.email || '—'}</Text>

          {/* Role badge */}
          <View style={[styles.roleBadge, { borderColor: roleConf.color + '55', backgroundColor: roleConf.color + '18' }]}>
            <Feather name={roleConf.icon as any} size={11} color={roleConf.color} style={{ marginRight: 6 }} />
            <Text style={[styles.roleText, { color: roleConf.color }]}>{roleConf.label}</Text>
          </View>

          {/* Member since */}
          <Text style={styles.memberSince}>
            <Text style={{ color: '#71717a' }}>Member since </Text>
            <Text style={{ color: '#a1a1aa' }}>{memberSince}</Text>
          </Text>
        </View>

        {/* ── Stats Row ── */}
        <View style={styles.statsRow}>
          <StatTile value={stats.cases}    label="Cases"    icon="folder"    color={roleConf.color} />
          <StatTile value={stats.findings} label="Findings" icon="radio"     color={Colors.dark.warning} />
          <StatTile value={stats.reports}  label="Reports"  icon="file-text" color={Colors.dark.success} />
        </View>

        {/* ── Account Settings ── */}
        <Text style={styles.sectionHeader}>ACCOUNT SETTINGS</Text>
        <GlassPanel style={styles.card}>
          <SettingRow
            icon="user"
            iconColor={roleConf.color}
            iconBg={roleConf.color + '20'}
            title="Edit Profile"
            description="Update name, phone and avatar"
          />
          <View style={styles.divider} />
          <SettingRow
            icon="lock"
            iconColor="#f59e0b"
            iconBg="rgba(245, 158, 11, 0.15)"
            title="Change Password"
            description="Update your authentication credentials"
          />
          <View style={styles.divider} />
          <SettingRow
            icon="key"
            iconColor="#8b5cf6"
            iconBg="rgba(139, 92, 246, 0.15)"
            title="Security Clearances"
            description="Manage API keys and access tokens"
          />
        </GlassPanel>

        {/* ── Preferences ── */}
        <Text style={styles.sectionHeader}>PREFERENCES</Text>
        <GlassPanel style={styles.card}>
          <SettingRow
            icon="bell"
            iconColor="#3b82f6"
            iconBg="rgba(59, 130, 246, 0.15)"
            title="System Alerts"
            description="Push notifications for critical events"
            rightNode={
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: '#27272a', true: roleConf.color + '80' }}
                thumbColor={notifications ? roleConf.color : '#71717a'}
              />
            }
          />
          <View style={styles.divider} />
          <SettingRow
            icon="moon"
            iconColor="#6366f1"
            iconBg="rgba(99, 102, 241, 0.15)"
            title="Dark Mode"
            description="Always active — OSINT standard"
            rightNode={
              <View style={styles.lockedBadge}>
                <Text style={styles.lockedText}>ON</Text>
              </View>
            }
          />
        </GlassPanel>

        {/* ── Support ── */}
        <Text style={styles.sectionHeader}>SUPPORT</Text>
        <GlassPanel style={styles.card}>
          <SettingRow
            icon="help-circle"
            iconColor="#10b981"
            iconBg="rgba(16, 185, 129, 0.15)"
            title="Help & Documentation"
            description="Guides and platform usage manuals"
          />
          <View style={styles.divider} />
          <SettingRow
            icon="flag"
            iconColor="#f59e0b"
            iconBg="rgba(245, 158, 11, 0.15)"
            title="Report an Issue"
            description="Submit a bug or feedback"
          />
        </GlassPanel>

        {/* ── System / Danger Zone ── */}
        <Text style={styles.sectionHeader}>SYSTEM</Text>
        <GlassPanel style={styles.card}>
          <SettingRow
            icon="log-out"
            iconColor={Colors.dark.destructive}
            iconBg="rgba(239, 68, 68, 0.12)"
            title="Terminate Session"
            description="Securely log out of the platform"
            onPress={handleSignOut}
            dangerous
            rightNode={null}
          />
        </GlassPanel>

        {/* Version */}
        <View style={styles.versionBlock}>
          <View style={styles.versionDot} />
          <Text style={styles.version}>OSINT Platform  ·  v1.0.0 (Build 824)  ·  Secure Build</Text>
          <View style={styles.versionDot} />
        </View>
      </ScrollView>
    </Animated.View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  bgAccent: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 340,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 48 },

  // ─── Hero
  hero: {
    alignItems: 'center',
    paddingTop: 52,
    paddingBottom: 32,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  avatarRing: {
    padding: 4,
    borderRadius: 70,
    borderWidth: 2,
    marginBottom: 20,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
    letterSpacing: 3,
  },
  name: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  email: {
    color: '#71717a',
    fontSize: 14,
    marginBottom: 14,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 14,
  },
  roleText: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  memberSince: {
    fontSize: 12,
  },

  // ─── Stats
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
  },
  statTile: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
  },
  statValue: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    color: '#71717a',
    fontSize: 11,
    letterSpacing: 0.5,
  },

  // ─── Section
  sectionHeader: {
    color: '#52525b',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginLeft: 24,
    marginTop: 28,
    marginBottom: 10,
  },
  card: {
    marginHorizontal: 16,
    padding: 0,
    overflow: 'hidden',
  },

  // ─── Row
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  settingIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  settingText: { flex: 1 },
  settingTitle: {
    color: '#e4e4e7',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingDesc: {
    color: '#52525b',
    fontSize: 12,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    marginLeft: 68,
  },

  // ─── Misc
  lockedBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  lockedText: {
    color: '#6366f1',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  versionBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 44,
    gap: 8,
  },
  versionDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#3f3f46',
  },
  version: {
    color: '#3f3f46',
    fontSize: 11,
    letterSpacing: 0.3,
  },
});
