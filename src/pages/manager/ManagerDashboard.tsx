import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FolderSearch, AlertTriangle, CheckCircle, Clock, Users, ArrowRight, FileText, Plus } from 'lucide-react';
import { getCases } from '@/services/caseService';
import { getReports } from '@/services/reportService';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/StatusBadge';
import AnimatedCounter from '@/components/AnimatedCounter';
import type { Case, Report } from '@/lib/database.types';

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const [cases, setCases] = useState<Case[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getCases(), getReports()])
      .then(([c, r]) => { setCases(c); setReports(r); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const byStatus = (s: string) => cases.filter(c => c.status === s).length;
  const unassigned = cases.filter(c => !c.assigned_to && c.status !== 'closed' && c.status !== 'cancelled');
  const pendingApproval = reports.filter(r => r.status === 'review');

  const stats = [
    { label: 'Total Cases', value: cases.length, icon: FolderSearch, color: 'text-primary', border: 'border-primary/20', bg: 'bg-primary/5' },
    { label: 'Open', value: byStatus('open'), icon: Clock, color: 'text-warning', border: 'border-warning/20', bg: 'bg-warning/5' },
    { label: 'In Progress', value: byStatus('in_progress'), icon: AlertTriangle, color: 'text-accent', border: 'border-accent/20', bg: 'bg-accent/5' },
    { label: 'Closed', value: byStatus('closed'), icon: CheckCircle, color: 'text-green-400', border: 'border-green-400/20', bg: 'bg-green-400/5' },
  ];

  return (
    <div className="p-4 sm:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground tracking-wider">MANAGER DASHBOARD</h1>
          <p className="text-sm text-muted-foreground mt-1">Case oversight and report approvals</p>
        </div>
        <Button onClick={() => navigate('/new-investigation')} className="bg-primary text-primary-foreground font-display tracking-wider gap-2 text-xs neon-glow">
          <Plus className="w-3.5 h-3.5" /> New Case
        </Button>
      </div>

      {/* Alerts */}
      {(unassigned.length > 0 || pendingApproval.length > 0) && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {unassigned.length > 0 && (
            <div className="flex items-center gap-3 p-4 rounded-lg border border-warning/30 bg-warning/5 cursor-pointer hover:border-warning/50 transition-colors" onClick={() => navigate('/cases')}>
              <AlertTriangle className="w-5 h-5 text-warning shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-warning">{unassigned.length} Unassigned Case{unassigned.length > 1 ? 's' : ''}</p>
                <p className="text-xs text-muted-foreground">Assign investigators to continue</p>
              </div>
              <ArrowRight className="w-4 h-4 text-warning" />
            </div>
          )}
          {pendingApproval.length > 0 && (
            <div className="flex items-center gap-3 p-4 rounded-lg border border-primary/30 bg-primary/5 cursor-pointer hover:border-primary/50 transition-colors">
              <FileText className="w-5 h-5 text-primary shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-primary">{pendingApproval.length} Report{pendingApproval.length > 1 ? 's' : ''} Awaiting Approval</p>
                <p className="text-xs text-muted-foreground">Review and approve to deliver</p>
              </div>
              <ArrowRight className="w-4 h-4 text-primary" />
            </div>
          )}
        </motion.div>
      )}

      {/* Stats */}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* All Cases */}
        <div className="lg:col-span-2 glass-panel p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
              <FolderSearch className="w-3.5 h-3.5 text-primary" /> All Cases
            </h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/cases')} className="text-xs text-muted-foreground">
              View All <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {loading && <p className="text-xs text-muted-foreground text-center py-6">Loading cases…</p>}
            {cases.length === 0 && !loading && (
              <p className="text-xs text-muted-foreground text-center py-6">No cases found</p>
            )}
            {cases.slice(0, 8).map((c) => (
              <motion.div key={c.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                onClick={() => navigate(`/cases/${c.id}`)}
                className="flex items-center gap-3 p-3 rounded-lg border border-border/30 bg-secondary/20 cursor-pointer hover:border-primary/40 hover:bg-secondary/40 transition-all group">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground font-medium truncate group-hover:text-primary transition-colors">{c.title}</p>
                  <p className="text-[10px] text-muted-foreground font-display">{c.case_number} · {c.client?.full_name ?? 'No client'}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {!c.assigned_to && <span className="text-[9px] text-warning font-display uppercase tracking-wider border border-warning/30 px-1.5 py-0.5 rounded">Unassigned</span>}
                  <StatusBadge status={c.priority} variant="risk" />
                  <StatusBadge status={c.status} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Reports Pending Approval */}
        <div className="glass-panel p-6">
          <h2 className="font-display text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2 mb-5">
            <FileText className="w-3.5 h-3.5 text-warning" /> Pending Approval
          </h2>
          <div className="space-y-2.5">
            {loading && <p className="text-xs text-muted-foreground text-center py-6">Loading…</p>}
            {pendingApproval.length === 0 && !loading && (
              <div className="py-8 text-center">
                <CheckCircle className="w-8 h-8 text-green-400/40 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">All reports reviewed</p>
              </div>
            )}
            {pendingApproval.map(r => (
              <div key={r.id} className="p-3 rounded-lg border border-warning/20 bg-warning/5 space-y-1.5">
                <p className="text-xs text-foreground font-medium">{r.report_title}</p>
                <p className="text-[10px] text-muted-foreground font-display">{(r as Report & { case?: Case }).case?.case_number}</p>
                <div className="flex gap-1.5 mt-2">
                  <Button size="sm" className="h-6 text-[10px] font-display bg-primary/20 text-primary hover:bg-primary/30 border border-primary/30 flex-1">
                    Review
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-border/20">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs font-display text-muted-foreground uppercase tracking-wider">Workload</span>
            </div>
            <div className="space-y-1.5">
              {['open', 'in_progress', 'on_hold'].map(s => (
                <div key={s} className="flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground capitalize">{s.replace('_', ' ')}</span>
                  <span className="text-[11px] font-display font-bold text-foreground">{byStatus(s)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
