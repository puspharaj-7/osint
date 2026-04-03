import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, FolderSearch, Activity, Shield, Settings, UserCheck, UserX, ChevronDown, FileText, Eye } from 'lucide-react';
import { useAuth } from '@/lib/authContext';
import { getAllProfiles, setUserActive, setUserRole } from '@/services/authService';
import { getCases } from '@/services/caseService';
import { getAuditLog } from '@/services/auditService';
import { Button } from '@/components/ui/button';
import AnimatedCounter from '@/components/AnimatedCounter';
import StatusBadge from '@/components/StatusBadge';
import type { Profile, Case, AuditLog } from '@/lib/database.types';

export default function AdminDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [auditLog, setAuditLog] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getAllProfiles(), getCases(), getAuditLog(10)])
      .then(([p, c, a]) => { setProfiles(p); setCases(c); setAuditLog(a); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const roleColors: Record<string, string> = {
    admin: 'text-destructive',
    manager: 'text-warning',
    investigator: 'text-primary',
    client: 'text-accent',
  };

  const byRole = (r: string) => profiles.filter(p => p.role === r).length;
  const byStatus = (s: string) => cases.filter(c => c.status === s).length;

  const stats = [
    { label: 'Total Users', value: profiles.length, icon: Users, color: 'text-primary', border: 'border-primary/20', bg: 'bg-primary/5' },
    { label: 'Active Cases', value: byStatus('in_progress') + byStatus('open'), icon: FolderSearch, color: 'text-accent', border: 'border-accent/20', bg: 'bg-accent/5' },
    { label: 'Closed Cases', value: byStatus('closed'), icon: Activity, color: 'text-green-400', border: 'border-green-400/20', bg: 'bg-green-400/5' },
    { label: 'Total Cases', value: cases.length, icon: Shield, color: 'text-warning', border: 'border-warning/20', bg: 'bg-warning/5' },
  ];

  const handleToggleActive = async (u: Profile) => {
    setUpdatingUser(u.id);
    try {
      await setUserActive(u.id, !u.is_active);
      setProfiles(prev => prev.map(p => p.id === u.id ? { ...p, is_active: !u.is_active } : p));
    } catch (e) { console.error(e); }
    finally { setUpdatingUser(null); }
  };

  const handleRoleChange = async (u: Profile, newRole: Profile['role']) => {
    setUpdatingUser(u.id);
    try {
      await setUserRole(u.id, newRole);
      setProfiles(prev => prev.map(p => p.id === u.id ? { ...p, role: newRole } : p));
    } catch (e) { console.error(e); }
    finally { setUpdatingUser(null); }
  };

  return (
    <div className="p-4 sm:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground tracking-wider">ADMIN DASHBOARD</h1>
          <p className="text-sm text-muted-foreground mt-1">System overview and user management</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/admin/panel')} className="font-display tracking-wider gap-2 text-xs border-border hover:border-primary/40">
            <Settings className="w-3.5 h-3.5" /> Admin Panel
          </Button>
          <Button onClick={() => navigate('/new-investigation')} className="bg-primary text-primary-foreground font-display tracking-wider gap-2 text-xs neon-glow">
            <FolderSearch className="w-3.5 h-3.5" /> New Case
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className={`glass-panel p-5 border ${s.border} ${s.bg}`}>
            <div className="flex items-center justify-between mb-3">
              <s.icon className={`w-4 h-4 ${s.color}`} />
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-display">{s.label}</span>
            </div>
            <p className={`text-4xl font-display font-bold ${s.color}`}>
              {loading ? '—' : <AnimatedCounter value={s.value} />}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Role breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {(['admin', 'manager', 'investigator', 'client'] as const).map(r => (
          <div key={r} className="glass-panel p-4 flex items-center gap-3">
            <div className={`text-2xl font-display font-bold ${roleColors[r]}`}>{loading ? '—' : byRole(r)}</div>
            <div>
              <p className={`text-xs font-display capitalize font-semibold ${roleColors[r]}`}>{r}s</p>
              <p className="text-[10px] text-muted-foreground">registered</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* User Management */}
        <div className="glass-panel p-6">
          <h2 className="font-display text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2 mb-5">
            <Users className="w-3.5 h-3.5 text-primary" /> User Management
          </h2>
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {loading && <p className="text-xs text-muted-foreground text-center py-6">Loading users…</p>}
            {profiles.filter(p => p.id !== profile?.id).map(u => (
              <div key={u.id} className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${u.is_active ? 'border-border/30 bg-secondary/20' : 'border-destructive/20 bg-destructive/5 opacity-60'}`}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-display font-bold text-white shrink-0"
                  style={{ background: 'linear-gradient(135deg, hsl(160 80% 35%), hsl(200 70% 40%))' }}>
                  {u.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate font-medium">{u.full_name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{u.email}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Role selector */}
                  <div className="relative">
                    <select
                      value={u.role}
                      onChange={e => handleRoleChange(u, e.target.value as Profile['role'])}
                      disabled={updatingUser === u.id}
                      className={`text-[10px] font-display uppercase tracking-wider pr-4 pl-2 py-1 rounded border border-border/40 bg-secondary/50 ${roleColors[u.role]} appearance-none cursor-pointer focus:outline-none focus:border-primary/40`}
                    >
                      {['admin', 'manager', 'investigator', 'client'].map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 text-muted-foreground pointer-events-none" />
                  </div>
                  {/* Toggle active */}
                  <button onClick={() => handleToggleActive(u)} disabled={updatingUser === u.id}
                    className={`p-1.5 rounded transition-colors ${u.is_active ? 'text-green-400 hover:bg-destructive/10 hover:text-destructive' : 'text-destructive hover:bg-green-400/10 hover:text-green-400'}`}
                    title={u.is_active ? 'Deactivate' : 'Activate'}>
                    {u.is_active ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Audit Log */}
        <div className="glass-panel p-6">
          <h2 className="font-display text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2 mb-5">
            <FileText className="w-3.5 h-3.5 text-warning" /> Audit Log
          </h2>
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {loading && <p className="text-xs text-muted-foreground text-center py-6">Loading logs…</p>}
            {auditLog.length === 0 && !loading && (
              <p className="text-xs text-muted-foreground text-center py-6">No audit events yet</p>
            )}
            {auditLog.map(log => (
              <div key={log.id} className="p-3 rounded-lg border border-border/20 bg-secondary/10">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs text-foreground font-medium">{log.action}</p>
                  <span className="text-[10px] text-muted-foreground font-display shrink-0">
                    {new Date(log.created_at).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {(log as AuditLog & { performer?: Profile }).performer?.full_name ?? 'System'}
                  {log.table_name && ` · ${log.table_name}`}
                </p>
              </div>
            ))}
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/cases')} className="mt-3 text-xs text-muted-foreground hover:text-foreground w-full gap-1">
            <Eye className="w-3 h-3" /> View All Cases
          </Button>
        </div>
      </div>
    </div>
  );
}
