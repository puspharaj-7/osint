import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Activity, AlertTriangle, Shield, FolderSearch, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mockInvestigations, allAlerts } from '@/lib/mock-data';
import RiskGauge from '@/components/RiskGauge';
import StatusBadge from '@/components/StatusBadge';

const Dashboard = () => {
  const navigate = useNavigate();
  const activeCount = mockInvestigations.filter(i => i.status === 'active').length;
  const unreadAlerts = allAlerts.filter(a => !a.read).length;
  const avgRisk = Math.round(mockInvestigations.reduce((sum, i) => sum + i.riskScore, 0) / mockInvestigations.length);

  const stats = [
    { label: 'Active Cases', value: activeCount, icon: FolderSearch, color: 'text-primary' },
    { label: 'Total Cases', value: mockInvestigations.length, icon: Activity, color: 'text-accent' },
    { label: 'Unread Alerts', value: unreadAlerts, icon: AlertTriangle, color: 'text-warning' },
    { label: 'Avg Risk Score', value: avgRisk, icon: Shield, color: 'text-destructive' },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground tracking-wider">COMMAND CENTER</h1>
          <p className="text-sm text-muted-foreground mt-1">Investigation overview and active intelligence</p>
        </div>
        <Button onClick={() => navigate('/new-investigation')} className="bg-primary text-primary-foreground hover:bg-primary/90 font-display tracking-wider">
          <Plus className="w-4 h-4 mr-2" /> NEW INVESTIGATION
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-panel p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-display">{stat.label}</span>
            </div>
            <p className={`text-3xl font-display font-bold ${stat.color}`}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Recent Investigations */}
        <div className="col-span-2 glass-panel p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-sm font-semibold text-foreground uppercase tracking-wider">Recent Investigations</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/cases')} className="text-muted-foreground hover:text-foreground text-xs">
              View All <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
          <div className="space-y-3">
            {mockInvestigations.map((inv, i) => (
              <motion.div
                key={inv.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                onClick={() => navigate(`/cases/${inv.id}`)}
                className="flex items-center justify-between p-4 rounded-md bg-secondary/50 border border-border/50 cursor-pointer hover:border-primary/30 transition-all"
              >
                <div className="flex items-center gap-4">
                  <RiskGauge score={inv.riskScore} size="sm" />
                  <div>
                    <p className="font-medium text-foreground">{inv.target}</p>
                    <p className="text-xs text-muted-foreground font-display">{inv.caseId} · {inv.targetType}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={inv.riskLevel} variant="risk" />
                  <StatusBadge status={inv.status} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div className="glass-panel p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-sm font-semibold text-foreground uppercase tracking-wider">Recent Alerts</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/alerts')} className="text-muted-foreground hover:text-foreground text-xs">
              View All <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
          <div className="space-y-3">
            {allAlerts.slice(0, 5).map((alert, i) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className={`p-3 rounded-md border ${alert.read ? 'bg-secondary/30 border-border/30' : 'bg-secondary/50 border-border/50'}`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-sm font-medium text-foreground">{alert.title}</p>
                  {!alert.read && <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1">{alert.description}</p>
                <div className="flex items-center justify-between mt-2">
                  <StatusBadge status={alert.severity} variant="severity" />
                  <span className="text-[10px] text-muted-foreground font-display">{alert.caseId}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
