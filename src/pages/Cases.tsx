import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Trash2, Filter, Plus, LayoutGrid, List, ChevronUp, ChevronDown, FolderSearch } from 'lucide-react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import RiskGauge from '@/components/RiskGauge';
import StatusBadge from '@/components/StatusBadge';

const statusOptions = ['all', 'active', 'completed', 'pending', 'archived'] as const;
const riskOptions = ['all', 'critical', 'high', 'medium', 'low'] as const;
type SortKey = 'caseId' | 'target' | 'riskScore' | 'status' | 'updatedAt';

const riskColor = (score: number) => score >= 70 ? '#ef4444' : score >= 40 ? '#f59e0b' : '#10b981';

const Cases = () => {
  const navigate = useNavigate();
  const { state: { investigations }, dispatch } = useStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [sortKey, setSortKey] = useState<SortKey>('updatedAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const filtered = useMemo(() => {
    const base = investigations.filter(inv => {
      const matchSearch =
        search === '' ||
        inv.target.toLowerCase().includes(search.toLowerCase()) ||
        inv.caseId.toLowerCase().includes(search.toLowerCase()) ||
        inv.targetType.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || inv.status === statusFilter;
      const matchRisk = riskFilter === 'all' || inv.riskLevel === riskFilter;
      return matchSearch && matchStatus && matchRisk;
    });

    return [...base].sort((a, b) => {
      let av: string | number = a[sortKey] as string | number;
      let bv: string | number = b[sortKey] as string | number;
      if (sortKey === 'updatedAt') { av = new Date(av as string).getTime(); bv = new Date(bv as string).getTime(); }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [investigations, search, statusFilter, riskFilter, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const handleDelete = (id: string) => {
    dispatch({ type: 'DELETE_INVESTIGATION', payload: id });
    setConfirmDelete(null);
  };

  const SortIcon = ({ col }: { col: SortKey }) => (
    <span className="ml-1 inline-flex flex-col leading-none">
      <ChevronUp className={`w-2.5 h-2.5 ${sortKey === col && sortDir === 'asc' ? 'text-primary' : 'text-muted-foreground/30'}`} />
      <ChevronDown className={`w-2.5 h-2.5 ${sortKey === col && sortDir === 'desc' ? 'text-primary' : 'text-muted-foreground/30'}`} />
    </span>
  );

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
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center glass-panel p-1 gap-0.5">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded transition-all ${viewMode === 'table' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              title="Table view"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded transition-all ${viewMode === 'grid' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              title="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
          <Button onClick={() => navigate('/new-investigation')} className="bg-primary text-primary-foreground hover:bg-primary/90 font-display tracking-wider">
            <Plus className="w-4 h-4 mr-2" /> NEW INVESTIGATION
          </Button>
        </div>
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
          <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
          <div className="flex gap-1 flex-wrap">
            {statusOptions.map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2.5 py-1 rounded text-xs font-display uppercase tracking-wider border transition-all ${
                  statusFilter === s
                    ? 'bg-primary/20 text-primary border-primary/40'
                    : 'text-muted-foreground border-border/50 hover:border-primary/30 hover:text-foreground'
                }`}
              >{s}</button>
            ))}
          </div>
          <div className="flex gap-1 flex-wrap">
            {riskOptions.map(r => (
              <button
                key={r}
                onClick={() => setRiskFilter(r)}
                className={`px-2.5 py-1 rounded text-xs font-display uppercase tracking-wider border transition-all ${
                  riskFilter === r
                    ? 'bg-accent/20 text-accent border-accent/40'
                    : 'text-muted-foreground border-border/50 hover:border-accent/30 hover:text-foreground'
                }`}
              >{r}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel py-16 flex flex-col items-center gap-4"
        >
          <FolderSearch className="w-14 h-14 text-muted-foreground/20 animate-float" />
          <p className="text-sm text-muted-foreground">
            {investigations.length === 0 ? 'No cases yet. Start a new investigation.' : 'No cases match your search or filters.'}
          </p>
          {investigations.length === 0 && (
            <Button onClick={() => navigate('/new-investigation')} variant="outline" size="sm" className="mt-2 border-primary/30 text-primary hover:bg-primary/10">
              <Plus className="w-4 h-4 mr-1" /> Start Investigation
            </Button>
          )}
        </motion.div>
      )}

      {/* GRID VIEW */}
      <AnimatePresence mode="wait">
        {viewMode === 'grid' && filtered.length > 0 && (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filtered.map((inv, i) => (
              <motion.div
                key={inv.id}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => navigate(`/cases/${inv.id}`)}
                className="glass-panel overflow-hidden cursor-pointer hover:border-primary/40 hover:neon-glow transition-all group"
              >
                {/* Risk strip */}
                <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${riskColor(inv.riskScore)}, transparent)` }} />
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{inv.target}</p>
                      <p className="text-xs text-muted-foreground font-display">{inv.caseId} · {inv.targetType}</p>
                    </div>
                    <RiskGauge score={inv.riskScore} size="sm" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={inv.status} />
                      <StatusBadge status={inv.riskLevel} variant="risk" />
                    </div>
                    <span className="text-[10px] text-muted-foreground font-display">{new Date(inv.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* TABLE VIEW */}
        {viewMode === 'table' && filtered.length > 0 && (
          <motion.div
            key="table"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="glass-panel overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="border-b border-border">
                    {([ ['caseId', 'Case ID'], ['target', 'Target'], ['riskScore', 'Risk'], ['status', 'Status'], ['updatedAt', 'Updated'] ] as [SortKey, string][]).map(([key, label]) => (
                      <th
                        key={key}
                        onClick={() => handleSort(key)}
                        className="text-left p-4 text-xs font-display uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none"
                      >
                        <span className="inline-flex items-center gap-1">
                          {label}
                          <SortIcon col={key} />
                        </span>
                      </th>
                    ))}
                    <th className="p-4 w-12" />
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filtered.map((inv, i) => (
                      <motion.tr
                        key={inv.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: i * 0.03 }}
                        className="border-b border-border/40 hover:bg-secondary/30 transition-colors group"
                      >
                        <td className="p-4 font-display text-sm text-primary cursor-pointer" onClick={() => navigate(`/cases/${inv.id}`)}>
                          {inv.caseId}
                        </td>
                        <td className="p-4 text-sm text-foreground font-medium cursor-pointer" onClick={() => navigate(`/cases/${inv.id}`)}>
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-5 rounded-full shrink-0" style={{ backgroundColor: riskColor(inv.riskScore) }} />
                            {inv.target}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex justify-start items-center gap-2">
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
                              <button onClick={() => handleDelete(inv.id)} className="text-[10px] font-display text-destructive hover:text-destructive/80 border border-destructive/40 rounded px-1.5 py-0.5">CONFIRM</button>
                              <button onClick={() => setConfirmDelete(null)} className="text-[10px] font-display text-muted-foreground hover:text-foreground border border-border/50 rounded px-1.5 py-0.5">CANCEL</button>
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Cases;
