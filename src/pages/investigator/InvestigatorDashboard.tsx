import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Activity, AlertTriangle, Shield, FolderSearch, ArrowRight, TrendingUp, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/store';
import { useAuth } from '@/lib/authContext';
import RiskGauge from '@/components/RiskGauge';
import StatusBadge from '@/components/StatusBadge';
import AnimatedCounter from '@/components/AnimatedCounter';

export default function InvestigatorDashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { state: { investigations, alerts } } = useStore();

  const activeCount = investigations.filter(i => i.status === 'active').length;
  const unreadAlerts = alerts.filter(a => !a.read).length;
  const avgRisk = investigations.length > 0
    ? Math.round(investigations.reduce((sum, i) => sum + i.riskScore, 0) / investigations.length)
    : 0;
  const completedCount = investigations.filter(i => i.status === 'completed').length;

  const stats = [
    { label: 'My Active Cases', value: activeCount, icon: FolderSearch, color: 'text-primary', border: 'border-primary/20', bg: 'bg-primary/5', glow: false },
    { label: 'Total Scans', value: investigations.length, icon: Activity, color: 'text-accent', border: 'border-accent/20', bg: 'bg-accent/5', glow: false },
    { label: 'Alerts', value: unreadAlerts, icon: AlertTriangle, color: 'text-warning', border: 'border-warning/20', bg: 'bg-warning/5', glow: unreadAlerts > 0 },
    { label: 'Avg Risk', value: avgRisk, icon: Shield, color: avgRisk >= 70 ? 'text-destructive' : avgRisk >= 40 ? 'text-warning' : 'text-primary', border: avgRisk >= 70 ? 'border-destructive/20' : 'border-warning/20', bg: avgRisk >= 70 ? 'bg-destructive/5' : 'bg-warning/5', suffix: '%', glow: avgRisk >= 70 },
  ];

  const activityFeed = investigations
    .flatMap(inv => inv.timeline.map(t => ({ ...t, target: inv.target, caseId: inv.caseId })))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 8);

  const riskColor = (score: number) => score >= 70 ? '#ef4444' : score >= 40 ? '#f59e0b' : '#10b981';

  return (
    <div className="p-4 sm:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground tracking-wider">MY COMMAND CENTER</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome, <span className="text-foreground font-medium">{profile?.full_name}</span> — Active investigations and intelligence
          </p>
        </div>
        <Button onClick={() => navigate('/new-investigation')}
          className="bg-primary text-primary-foreground hover:bg-primary/90 font-display tracking-wider gap-2 neon-glow">
          <Plus className="w-4 h-4" /> NEW INVESTIGATION
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, type: 'spring', stiffness: 300, damping: 24 }}
            className={`glass-panel p-5 border ${stat.border} ${stat.bg} ${stat.glow ? 'neon-glow' : ''}`}>
            <div className="flex items-center justify-between mb-3">
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-display">{stat.label}</span>
            </div>
            <p className={`text-4xl font-display font-bold ${stat.color} mb-1`}>
              <AnimatedCounter value={stat.value} suffix={stat.suffix ?? ''} />
            </p>
            {stat.label === 'Avg Risk' && (
              <div className="w-full h-1.5 rounded-full bg-secondary mt-2 overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${avgRisk}%` }}
                  transition={{ delay: 0.6, duration: 0.8, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #10b981, #f59e0b, #ef4444)', backgroundSize: '200%', backgroundPosition: `${avgRisk}% 0` }} />
              </div>
            )}
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className={`w-3 h-3 ${stat.color} opacity-60`} />
              <span className="text-[10px] text-muted-foreground font-display">
                {stat.label === 'Total Scans' ? `${completedCount} completed` : ''}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Investigations */}
        <div className="col-span-1 lg:col-span-2 glass-panel p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
              <FolderSearch className="w-3.5 h-3.5 text-primary" /> My Investigations
            </h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/cases')} className="text-muted-foreground hover:text-foreground text-xs">
              View All <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
          <div className="space-y-2.5">
            {investigations.length === 0 && (
              <div className="py-12 flex flex-col items-center gap-3">
                <FolderSearch className="w-10 h-10 text-muted-foreground/20 animate-float" />
                <p className="text-sm text-muted-foreground">No investigations yet. Start a new one.</p>
              </div>
            )}
            {investigations.slice(0, 5).map((inv, i) => (
              <motion.div key={inv.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                onClick={() => navigate(`/cases/${inv.id}`)}
                className="flex items-center gap-4 p-4 rounded-lg bg-secondary/30 border border-border/30 cursor-pointer hover:border-primary/40 hover:bg-secondary/50 transition-all group">
                <div className="w-1 h-10 rounded-full shrink-0" style={{ backgroundColor: riskColor(inv.riskScore) }} />
                <RiskGauge score={inv.riskScore} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">{inv.target}</p>
                  <p className="text-xs text-muted-foreground font-display">{inv.caseId} · {inv.targetType}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge status={inv.riskLevel} variant="risk" />
                  <StatusBadge status={inv.status} />
                  <ArrowRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Alerts + Activity */}
        <div className="space-y-5">
          <div className="glass-panel p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-warning" /> Alerts
              </h2>
              <Button variant="ghost" size="sm" onClick={() => navigate('/alerts')} className="text-muted-foreground text-xs">
                View All <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
            <div className="space-y-2.5">
              {alerts.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No alerts</p>}
              {alerts.slice(0, 4).map((alert, i) => (
                <motion.div key={alert.id} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.08 }}
                  className={`p-3 rounded-md border transition-all ${alert.read ? 'bg-secondary/20 border-border/20 opacity-60' : 'bg-secondary/40 border-border/40'}`}>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-xs font-semibold text-foreground leading-tight">{alert.title}</p>
                    {!alert.read && <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1 shrink-0 animate-pulse" />}
                  </div>
                  <StatusBadge status={alert.severity} variant="severity" />
                </motion.div>
              ))}
            </div>
          </div>

          <div className="glass-panel p-5">
            <h2 className="font-display text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-2 mb-4">
              <Zap className="w-3.5 h-3.5 text-accent" /> Live Activity
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse ml-auto" />
            </h2>
            <div className="space-y-3">
              {activityFeed.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No activity yet</p>}
              {activityFeed.map((entry, i) => (
                <motion.div key={entry.id + i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.06 }}
                  className="flex items-start gap-2.5">
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${entry.type === 'alert' ? 'bg-warning' : entry.type === 'discovery' ? 'bg-primary' : 'bg-muted-foreground'}`} />
                  <div className="min-w-0">
                    <p className="text-[11px] text-foreground/80 truncate">{entry.event}</p>
                    <p className="text-[10px] text-muted-foreground font-display">{entry.target} · {new Date(entry.timestamp).toLocaleTimeString()}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
