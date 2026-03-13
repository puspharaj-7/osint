import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStore } from '@/lib/store';
import RiskGauge from '@/components/RiskGauge';
import StatusBadge from '@/components/StatusBadge';

const Cases = () => {
  const navigate = useNavigate();
  const { state: { investigations } } = useStore();

  return (
    <div className="p-8">
      <h1 className="font-display text-2xl font-bold text-foreground tracking-wider mb-1">CASE FILES</h1>
      <p className="text-sm text-muted-foreground mb-8">All investigation cases</p>

      <div className="glass-panel overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-4 text-xs font-display uppercase tracking-wider text-muted-foreground">Case ID</th>
              <th className="text-left p-4 text-xs font-display uppercase tracking-wider text-muted-foreground">Target</th>
              <th className="text-left p-4 text-xs font-display uppercase tracking-wider text-muted-foreground">Type</th>
              <th className="text-center p-4 text-xs font-display uppercase tracking-wider text-muted-foreground">Risk</th>
              <th className="text-left p-4 text-xs font-display uppercase tracking-wider text-muted-foreground">Status</th>
              <th className="text-left p-4 text-xs font-display uppercase tracking-wider text-muted-foreground">Updated</th>
            </tr>
          </thead>
          <tbody>
            {investigations.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground text-sm">
                  No cases found. Start a new investigation to see results here.
                </td>
              </tr>
            )}
            {investigations.map((inv, i) => (
              <motion.tr
                key={inv.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => navigate(`/cases/${inv.id}`)}
                className="border-b border-border/50 cursor-pointer hover:bg-secondary/30 transition-colors"
              >
                <td className="p-4 font-display text-sm text-primary">{inv.caseId}</td>
                <td className="p-4 text-sm text-foreground font-medium">{inv.target}</td>
                <td className="p-4 text-sm text-muted-foreground">{inv.targetType}</td>
                <td className="p-4"><div className="flex justify-center"><RiskGauge score={inv.riskScore} size="sm" /></div></td>
                <td className="p-4"><StatusBadge status={inv.status} /></td>
                <td className="p-4 text-xs text-muted-foreground font-display">{new Date(inv.updatedAt).toLocaleDateString()}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Cases;
