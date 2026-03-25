import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Trash2, Filter, Plus } from 'lucide-react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import RiskGauge from '@/components/RiskGauge';
import StatusBadge from '@/components/StatusBadge';

const statusOptions = ['all', 'active', 'completed', 'pending', 'archived'] as const;
const riskOptions = ['all', 'critical', 'high', 'medium', 'low'] as const;

const Cases = () => {
  const navigate = useNavigate();
  const { state: { investigations }, dispatch } = useStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filtered = investigations.filter(inv => {
    const matchSearch =
      search === '' ||
      inv.target.toLowerCase().includes(search.toLowerCase()) ||
      inv.caseId.toLowerCase().includes(search.toLowerCase()) ||
      inv.targetType.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || inv.status === statusFilter;
    const matchRisk = riskFilter === 'all' || inv.riskLevel === riskFilter;
    return matchSearch && matchStatus && matchRisk;
  });

  const handleDelete = (id: string) => {
    dispatch({ type: 'DELETE_INVESTIGATION', payload: id });
    setConfirmDelete(null);
  };

  return (
    <div className="p-4 sm:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground tracking-wider">CASE FILES</h1>
          <p className="text-sm text-muted-foreground">
            {filtered.length} of {investigations.length} investigation{investigations.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={() => navigate('/new-investigation')} className="bg-primary text-primary-foreground hover:bg-primary/90 font-display tracking-wider">
          <Plus className="w-4 h-4 mr-2" /> NEW INVESTIGATION
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="glass-panel p-4 mb-6 flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search target, case ID, type..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 bg-secondary border-border text-foreground placeholder:text-muted-foreground focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <div className="flex gap-1">
            {statusOptions.map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2.5 py-1 rounded text-xs font-display uppercase tracking-wider border transition-all ${
                  statusFilter === s
                    ? 'bg-primary/20 text-primary border-primary/40'
                    : 'text-muted-foreground border-border/50 hover:border-primary/30 hover:text-foreground'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex gap-1">
            {riskOptions.map(r => (
              <button
                key={r}
                onClick={() => setRiskFilter(r)}
                className={`px-2.5 py-1 rounded text-xs font-display uppercase tracking-wider border transition-all ${
                  riskFilter === r
                    ? 'bg-accent/20 text-accent border-accent/40'
                    : 'text-muted-foreground border-border/50 hover:border-accent/30 hover:text-foreground'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-xs font-display uppercase tracking-wider text-muted-foreground">Case ID</th>
                <th className="text-left p-4 text-xs font-display uppercase tracking-wider text-muted-foreground">Target</th>
                <th className="text-left p-4 text-xs font-display uppercase tracking-wider text-muted-foreground hidden sm:table-cell">Type</th>
                <th className="text-center p-4 text-xs font-display uppercase tracking-wider text-muted-foreground">Risk</th>
                <th className="text-left p-4 text-xs font-display uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="text-left p-4 text-xs font-display uppercase tracking-wider text-muted-foreground hidden md:table-cell">Updated</th>
                <th className="p-4 w-12"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-muted-foreground text-sm">
                    {investigations.length === 0
                      ? 'No cases yet. Start a new investigation.'
                      : 'No cases match your search/filter criteria.'}
                  </td>
                </tr>
              )}
              <AnimatePresence>
                {filtered.map((inv, i) => (
                  <motion.tr
                    key={inv.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-b border-border/50 hover:bg-secondary/30 transition-colors group"
                  >
                    <td
                      className="p-4 font-display text-sm text-primary cursor-pointer"
                      onClick={() => navigate(`/cases/${inv.id}`)}
                    >
                      {inv.caseId}
                    </td>
                    <td
                      className="p-4 text-sm text-foreground font-medium cursor-pointer"
                      onClick={() => navigate(`/cases/${inv.id}`)}
                    >
                      {inv.target}
                    </td>
                    <td className="p-4 text-sm text-muted-foreground hidden sm:table-cell">{inv.targetType}</td>
                    <td className="p-4">
                      <div className="flex justify-center">
                        <RiskGauge score={inv.riskScore} size="sm" />
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={inv.status} />
                        <StatusBadge status={inv.riskLevel} variant="risk" />
                      </div>
                    </td>
                    <td className="p-4 text-xs text-muted-foreground font-display hidden md:table-cell">
                      {new Date(inv.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      {confirmDelete === inv.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(inv.id)}
                            className="text-[10px] font-display text-destructive hover:text-destructive/80 border border-destructive/40 rounded px-1.5 py-0.5"
                          >
                            CONFIRM
                          </button>
                          <button
                            onClick={() => setConfirmDelete(null)}
                            className="text-[10px] font-display text-muted-foreground hover:text-foreground border border-border/50 rounded px-1.5 py-0.5"
                          >
                            CANCEL
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={e => { e.stopPropagation(); setConfirmDelete(inv.id); }}
                          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Cases;
