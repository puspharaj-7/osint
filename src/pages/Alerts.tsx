import { motion } from 'framer-motion';
import { Bell, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/store';
import StatusBadge from '@/components/StatusBadge';

const Alerts = () => {
  const { state: { alerts }, dispatch } = useStore();

  const markAllRead = () => {
    alerts.forEach(a => {
      if (!a.read) dispatch({ type: 'MARK_ALERT_READ', payload: a.id });
    });
  };

  const unreadCount = alerts.filter(a => !a.read).length;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground tracking-wider">ALERTS CENTER</h1>
          <p className="text-sm text-muted-foreground">{unreadCount} unread alert{unreadCount !== 1 ? 's' : ''}</p>
        </div>
        <Button variant="ghost" onClick={markAllRead} className="text-muted-foreground hover:text-foreground text-sm">
          <Check className="w-4 h-4 mr-1" /> Mark All Read
        </Button>
      </div>

      <div className="space-y-3">
        {alerts.map((alert, i) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`glass-panel p-5 ${!alert.read ? 'border-l-2 border-l-primary' : ''}`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <Bell className={`w-4 h-4 ${!alert.read ? 'text-primary' : 'text-muted-foreground'}`} />
                <div>
                  <p className="text-sm font-medium text-foreground">{alert.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{alert.description}</p>
                </div>
              </div>
              <StatusBadge status={alert.severity} variant="severity" />
            </div>
            <div className="flex items-center justify-between mt-3 pl-7">
              <span className="text-[10px] font-display text-primary">{alert.caseId}</span>
              <span className="text-[10px] font-display text-muted-foreground">{new Date(alert.timestamp).toLocaleString()}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Alerts;
