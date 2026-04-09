import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../lib/authContext';
import { supabase } from '../../lib/supabase';
import Colors from '../../constants/Colors';
import { GlassPanel } from '../../components/GlassPanel';
import { StatusBadge } from '../../components/StatusBadge';

/**
 * INVESTIGATOR DASHBOARD (Threat Intel Heavy)
 */
function InvestigatorDashboard() {
  const [cases, setCases] = React.useState<any[]>([]);
  const [alerts, setAlerts] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchData() {
      // Get assigned cases
      const { data: casesData } = await supabase
        .from('cases')
        .select('*')
        .order('created_at', { ascending: false });

      // Get high/critical findings (alerts)
      const { data: findingsData } = await supabase
        .from('osint_findings')
        .select('*')
        .in('risk_level', ['high', 'critical'])
        .order('created_at', { ascending: false })
        .limit(5);

      if (casesData) setCases(casesData);
      if (findingsData) setAlerts(findingsData);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) return <View style={{ padding: 40, alignItems: 'center' }}><Text style={{ color: Colors.dark.primary }}>Loading intel...</Text></View>;

  const activeCases = cases.filter(c => c.status === 'open' || c.status === 'in_progress');

  return (
    <>
      <View style={styles.statsGrid}>
        <GlassPanel style={styles.statCard}>
          <LinearGradient colors={['rgba(59, 130, 246, 0.2)', 'transparent']} style={styles.statGradient} />
          <Feather name="activity" size={24} color={Colors.dark.primary} style={styles.statIcon} />
          <Text style={styles.statValue}>{activeCases.length}</Text>
          <Text style={styles.statLabel}>Active Targets</Text>
        </GlassPanel>
        <GlassPanel style={styles.statCard}>
          <LinearGradient colors={['rgba(245, 158, 11, 0.2)', 'transparent']} style={styles.statGradient} />
          <Feather name="alert-triangle" size={24} color={Colors.dark.warning} style={styles.statIcon} />
          <Text style={styles.statValue}>{alerts.length}</Text>
          <Text style={styles.statLabel}>High/Critical Alerts</Text>
        </GlassPanel>
      </View>

      <Text style={styles.sectionTitle}>ACTIVE INTELLIGENCE SESSIONS</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
        {activeCases.map((inv) => (
          <GlassPanel key={inv.id} style={styles.investigationCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.caseId}>{inv.case_number}</Text>
              <StatusBadge status={inv.status} />
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.targetName}>{inv.title || 'Unknown Target'}</Text>
              <Text style={styles.targetType}>Priority: {inv.priority?.toUpperCase() || 'NORMAL'}</Text>
            </View>
          </GlassPanel>
        ))}
        {activeCases.length === 0 && (
          <Text style={{ color: '#71717a', fontStyle: 'italic', paddingLeft: 20 }}>No active sessions.</Text>
        )}
      </ScrollView>

      <Text style={[styles.sectionTitle, { marginTop: 24 }]}>INTEL FEEDS</Text>
      <View style={styles.alertsContainer}>
        {alerts.map((alert) => (
          <GlassPanel key={alert.id} style={styles.alertCard}>
            <View style={styles.alertIconWrapper}>
              <Feather 
                name={alert.risk_level === 'critical' ? 'crosshair' : 'radio'} 
                size={16} 
                color={alert.risk_level === 'critical' ? Colors.dark.destructive : Colors.dark.warning} 
              />
            </View>
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle} numberOfLines={1}>{alert.finding_type || 'Threat Detected'}</Text>
              <Text style={styles.alertDesc} numberOfLines={2}>{alert.title || alert.description}</Text>
            </View>
          </GlassPanel>
        ))}
        {alerts.length === 0 && (
          <Text style={{ color: '#71717a', fontStyle: 'italic', paddingLeft: 4 }}>No critical findings reported.</Text>
        )}
      </View>
    </>
  );
}

/**
 * CLIENT / CUSTOMER DASHBOARD (Sanitized, clean overview)
 */
function ClientDashboard() {
  const [cases, setCases] = React.useState<any[]>([]);
  const [reports, setReports] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchData() {
      const { data: casesData } = await supabase
        .from('cases')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: reportsData } = await supabase
        .from('reports')
        .select('*, cases(case_number)')
        .eq('is_visible_to_client', true)
        .order('created_at', { ascending: false });

      if (casesData) setCases(casesData);
      if (reportsData) setReports(reportsData);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) return <View style={{ padding: 40, alignItems: 'center' }}><Text style={{ color: '#10b981' }}>Loading secure portal...</Text></View>;

  const activeCases = cases.filter(c => c.status !== 'closed' && c.status !== 'cancelled');
  const finalizedReports = reports.filter(r => r.status === 'final' || r.status === 'delivered');

  return (
    <>
      <View style={styles.statsGrid}>
        <GlassPanel style={styles.statCard}>
          <LinearGradient colors={['rgba(16, 185, 129, 0.2)', 'transparent']} style={styles.statGradient} />
          <Feather name="folder" size={24} color="#10b981" style={styles.statIcon} />
          <Text style={styles.statValue}>{activeCases.length}</Text>
          <Text style={styles.statLabel}>Cases in Progress</Text>
        </GlassPanel>
      </View>

      <Text style={styles.sectionTitle}>YOUR ONGOING CASES</Text>
      <View style={styles.alertsContainer}>
        {activeCases.map((inv) => (
          <GlassPanel key={inv.id} style={[styles.alertCard, { paddingVertical: 20 }]}>
             <View style={styles.alertContent}>
              <Text style={styles.caseId}>{inv.case_number}</Text>
              <Text style={styles.targetName}>{inv.title || 'Case Investigation'}</Text>
            </View>
            <StatusBadge status={inv.status} />
          </GlassPanel>
        ))}
         {activeCases.length === 0 && (
          <Text style={{ color: '#71717a', fontStyle: 'italic', paddingLeft: 4 }}>No ongoing cases.</Text>
        )}
      </View>

      <Text style={[styles.sectionTitle, { marginTop: 24 }]}>FINALIZED REPORTS</Text>
      <View style={styles.alertsContainer}>
        {finalizedReports.length > 0 ? finalizedReports.map((report) => (
          <GlassPanel key={report.id} style={styles.alertCard}>
             <View style={[styles.alertIconWrapper, { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.2)', borderWidth: 1 }]}>
               <Feather name="file-text" size={16} color="#10b981" />
             </View>
             <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>{report.report_title || 'Report Generated'}</Text>
              <Text style={styles.alertDesc}>{report.cases?.case_number} documentation available for download securely on web platform.</Text>
            </View>
          </GlassPanel>
        )) : (
          <Text style={{ color: '#71717a', fontStyle: 'italic', paddingLeft: 4 }}>No reports finalized yet.</Text>
        )}
      </View>
    </>
  );
}

/**
 * ADMIN DASHBOARD (System Wide Scope)
 */
function AdminDashboard() {
  const [stats, setStats] = React.useState({ totalCases: 0, pendingTasks: 0, agentCount: 0 });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchData() {
      const { count: casesCount } = await supabase.from('cases').select('*', { count: 'exact', head: true });
      const { count: agentsCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'investigator');

      setStats({
        totalCases: casesCount || 0,
        agentCount: agentsCount || 0,
        pendingTasks: 0, 
      });
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) return <View style={{ padding: 40, alignItems: 'center' }}><Text style={{ color: '#8b5cf6' }}>Loading system nodes...</Text></View>;

  return (
    <>
      <View style={styles.statsGrid}>
        <GlassPanel style={styles.statCard}>
          <LinearGradient colors={['rgba(139, 92, 246, 0.2)', 'transparent']} style={styles.statGradient} />
          <Feather name="users" size={24} color="#8b5cf6" style={styles.statIcon} />
          <Text style={styles.statValue}>{stats.agentCount}</Text>
          <Text style={styles.statLabel}>Active Agents</Text>
        </GlassPanel>
        <GlassPanel style={styles.statCard}>
          <LinearGradient colors={['rgba(59, 130, 246, 0.2)', 'transparent']} style={styles.statGradient} />
          <Feather name="server" size={24} color="#3b82f6" style={styles.statIcon} />
          <Text style={styles.statValue}>100%</Text>
          <Text style={styles.statLabel}>System Health</Text>
        </GlassPanel>
      </View>

      <Text style={styles.sectionTitle}>SYSTEM OVERVIEW</Text>
      <GlassPanel style={{ padding: 24 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
          <Text style={{ color: '#71717a' }}>Total Cases In System</Text>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>{stats.totalCases}</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
          <Text style={{ color: '#71717a' }}>Pending Agent Approvals</Text>
          <View style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', paddingHorizontal: 8, borderRadius: 4 }}>
            <Text style={{ color: Colors.dark.destructive, fontWeight: 'bold' }}>0</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ color: '#71717a' }}>Data Sources Connected</Text>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>8/8</Text>
        </View>
      </GlassPanel>
    </>
  );
}


/**
 * MAIN DASHBOARD EXPORT
 */
export default function DashboardScreen() {
  const { profile } = useAuth();
  
  const renderDashboardLayout = () => {
    switch (profile?.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'client':
        return <ClientDashboard />;
      case 'investigator':
      default:
        return <InvestigatorDashboard />;
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.name}>{profile?.full_name || 'User'}</Text>
        </View>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
          style={styles.roleBadge}
        >
          <Text style={[
            styles.roleText, 
            profile?.role === 'admin' ? { color: '#8b5cf6' } : 
            profile?.role === 'client' ? { color: '#10b981' } : { color: Colors.dark.primary }
          ]}>
            {profile?.role?.toUpperCase() || 'INVESTIGATOR'}
          </Text>
        </LinearGradient>
      </View>

      {renderDashboardLayout()}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark.background },
  content: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 },
  greeting: { color: '#71717a', fontSize: 14, letterSpacing: 1 },
  name: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginTop: 4 },
  roleBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' },
  roleText: { fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
  statsGrid: { flexDirection: 'row', gap: 16, marginBottom: 32 },
  statCard: { flex: 1, padding: 20, position: 'relative' },
  statGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 60, opacity: 0.5 },
  statIcon: { marginBottom: 16 },
  statValue: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  statLabel: { color: '#71717a', fontSize: 12, marginTop: 4, letterSpacing: 0.5 },
  sectionTitle: { color: '#fff', fontSize: 12, fontWeight: 'bold', letterSpacing: 2, marginBottom: 16 },
  horizontalScroll: { marginHorizontal: -20, paddingHorizontal: 20 },
  investigationCard: { width: 280, padding: 16, marginRight: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  caseId: { color: '#71717a', fontSize: 12, fontWeight: 'bold', letterSpacing: 1 },
  cardInfo: { flex: 1 },
  targetName: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  targetType: { color: '#8b5cf6', fontSize: 12, marginTop: 4 },
  alertsContainer: { gap: 12 },
  alertCard: { flexDirection: 'row', padding: 16, alignItems: 'center' },
  alertIconWrapper: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255, 255, 255, 0.05)', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  alertContent: { flex: 1 },
  alertTitle: { color: '#fff', fontWeight: 'bold', fontSize: 14, marginBottom: 2 },
  alertDesc: { color: '#71717a', fontSize: 12 },
});
