import { motion } from 'framer-motion';
import { Users, Settings, Activity, Database, Shield } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';

const modules = [
  { name: 'Breach Database Scanner', status: 'active', type: 'Quick Scan' },
  { name: 'Sanctions List Checker', status: 'active', type: 'Quick Scan' },
  { name: 'DNS Intelligence', status: 'active', type: 'Deep Scan' },
  { name: 'WHOIS Lookup', status: 'active', type: 'Deep Scan' },
  { name: 'Social Media Discovery', status: 'active', type: 'Deep Scan' },
  { name: 'IP Intelligence', status: 'pending', type: 'Deep Scan' },
  { name: 'Company Registry', status: 'active', type: 'Deep Scan' },
  { name: 'Phone Intelligence', status: 'pending', type: 'Deep Scan' },
  { name: 'Shodan Integration', status: 'pending', type: 'Deep Scan' },
];

const users = [
  { name: 'John Doe', role: 'Admin', status: 'active', cases: 12 },
  { name: 'Jane Smith', role: 'Investigator', status: 'active', cases: 8 },
  { name: 'Mike Johnson', role: 'Investigator', status: 'active', cases: 5 },
];

// Simulation of RBAC user role
const currentUserRole = 'admin'; // Change to 'analyst' to test RBAC

const Admin = () => {
  if (currentUserRole !== 'admin') {
    return (
      <div className="p-8 h-[calc(100vh-4rem)] flex flex-col items-center justify-center">
        <Shield className="w-16 h-16 text-destructive mb-4" />
        <h1 className="font-display text-2xl font-bold text-foreground tracking-wider mb-2">ACCESS DENIED</h1>
        <p className="text-muted-foreground text-center max-w-md">
          You do not have the required clearance level to access the Administrative Command Center.
        </p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="font-display text-2xl font-bold text-foreground tracking-wider mb-1">ADMIN PANEL</h1>
      <p className="text-sm text-muted-foreground mb-8">System configuration and user management</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Users, label: 'Users', value: '3' },
          { icon: Activity, label: 'Active Modules', value: '7' },
          { icon: Database, label: 'Total Cases', value: '25' },
          { icon: Settings, label: 'System Status', value: 'Online' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-panel p-5">
            <stat.icon className="w-5 h-5 text-primary mb-3" />
            <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-display">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6">
          <h2 className="font-display text-sm font-semibold text-foreground uppercase tracking-wider mb-4">OSINT Modules</h2>
          <div className="space-y-2">
            {modules.map(mod => (
              <div key={mod.name} className="flex items-center justify-between p-3 rounded-md bg-secondary/30 border border-border/30">
                <div>
                  <p className="text-sm text-foreground">{mod.name}</p>
                  <p className="text-[10px] text-muted-foreground font-display">{mod.type}</p>
                </div>
                <StatusBadge status={mod.status} />
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel p-6">
          <h2 className="font-display text-sm font-semibold text-foreground uppercase tracking-wider mb-4">User Management</h2>
          <div className="space-y-2">
            {users.map(user => (
              <div key={user.name} className="flex items-center justify-between p-3 rounded-md bg-secondary/30 border border-border/30">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <span className="text-xs font-display text-secondary-foreground">{user.name.split(' ').map(n => n[0]).join('')}</span>
                  </div>
                  <div>
                    <p className="text-sm text-foreground">{user.name}</p>
                    <p className="text-[10px] text-muted-foreground font-display">{user.cases} cases</p>
                  </div>
                </div>
                <StatusBadge status={user.role === 'Admin' ? 'active' : 'completed'} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
