import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FolderSearch, Download, CheckCircle, Clock, AlertCircle, FileText, MessageCircle, ChevronRight } from 'lucide-react';
import { useAuth } from '@/lib/authContext';
import { getClientByProfileId } from '@/services/clientService';
import { getCases } from '@/services/caseService';
import { getClientReports } from '@/services/reportService';
import { Button } from '@/components/ui/button';
import type { Case, Report, Client } from '@/lib/database.types';

const STATUS_CONFIG: Record<string, { label: string; icon: typeof Clock; color: string; bg: string; border: string }> = {
  open:        { label: 'Case Opened',      icon: FolderSearch, color: 'text-primary',    bg: 'bg-primary/10',    border: 'border-primary/30' },
  in_progress: { label: 'Investigation Underway', icon: AlertCircle, color: 'text-warning', bg: 'bg-warning/10',   border: 'border-warning/30' },
  on_hold:     { label: 'On Hold',          icon: Clock,        color: 'text-muted-foreground', bg: 'bg-secondary/30', border: 'border-border/30' },
  closed:      { label: 'Case Closed',      icon: CheckCircle,  color: 'text-green-400',  bg: 'bg-green-400/10', border: 'border-green-400/30' },
  cancelled:   { label: 'Cancelled',        icon: AlertCircle,  color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/30' },
};

const TIMELINE_STEPS = ['open', 'in_progress', 'closed'];

export default function ClientPortal() {
  const { profile } = useAuth();
  const [client, setClient] = useState<Client | null>(null);
  const [cases, setCases] = useState<Case[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    const load = async () => {
      try {
        const cl = await getClientByProfileId(profile.id);
        setClient(cl);
        const allCases = await getCases(); // RLS returns only own cases
        setCases(allCases);
        if (allCases[0]) {
          setSelectedCase(allCases[0]);
          const r = await getClientReports(allCases[0].id);
          setReports(r);
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [profile]);

  const handleSelectCase = async (c: Case) => {
    setSelectedCase(c);
    const r = await getClientReports(c.id);
    setReports(r);
  };

  const statusConfig = selectedCase ? STATUS_CONFIG[selectedCase.status] ?? STATUS_CONFIG.open : STATUS_CONFIG.open;
  const StatusIcon = statusConfig.icon;

  const currentStep = selectedCase ? TIMELINE_STEPS.indexOf(selectedCase.status) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-center">
          <FolderSearch className="w-8 h-8 text-primary/40 mx-auto mb-3" />
          <p className="text-xs text-muted-foreground font-display tracking-wider">Loading your case…</p>
        </motion.div>
      </div>
    );
  }

  if (cases.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
          <FolderSearch className="w-8 h-8 text-muted-foreground/40" />
        </div>
        <h2 className="font-display text-xl font-bold text-foreground tracking-wider">No Cases Found</h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          No investigations have been opened for your account yet. Contact your case manager for details.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold text-foreground tracking-wider">
          Welcome, {profile?.full_name?.split(' ')[0]}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your investigation portal — track your case status and download reports.
        </p>
      </motion.div>

      {/* Case selector (if multiple cases) */}
      {cases.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {cases.map(c => (
            <button key={c.id} onClick={() => handleSelectCase(c)}
              className={`shrink-0 px-4 py-2 rounded-lg border text-xs font-display uppercase tracking-wider transition-all ${selectedCase?.id === c.id ? 'bg-primary/10 border-primary/40 text-primary' : 'border-border/30 text-muted-foreground hover:border-border/60'}`}>
              {c.case_number}
            </button>
          ))}
        </div>
      )}

      {selectedCase && (
        <>
          {/* Case Status Card */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className={`glass-panel p-6 border ${statusConfig.border}`}>
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <p className="text-xs font-display text-muted-foreground uppercase tracking-widest mb-1">{selectedCase.case_number}</p>
                <h2 className="font-display text-xl font-bold text-foreground">{selectedCase.title}</h2>
                {selectedCase.description && (
                  <p className="text-sm text-muted-foreground mt-1 max-w-lg">{selectedCase.description}</p>
                )}
              </div>
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${statusConfig.bg} border ${statusConfig.border} shrink-0`}>
                <StatusIcon className={`w-4 h-4 ${statusConfig.color}`} />
                <span className={`text-xs font-display font-semibold uppercase tracking-wider ${statusConfig.color}`}>
                  {statusConfig.label}
                </span>
              </div>
            </div>

            {/* Progress Timeline */}
            <div className="mt-6">
              <p className="text-[10px] font-display text-muted-foreground uppercase tracking-widest mb-4">Progress</p>
              <div className="relative flex items-center">
                {TIMELINE_STEPS.map((step, idx) => {
                  const cfg = STATUS_CONFIG[step];
                  const StepIcon = cfg.icon;
                  const isCompleted = idx <= currentStep;
                  const isActive = idx === currentStep;
                  return (
                    <div key={step} className="flex-1 flex flex-col items-center">
                      <div className="relative flex items-center w-full">
                        {idx > 0 && (
                          <div className={`flex-1 h-0.5 ${isCompleted ? 'bg-primary' : 'bg-border/30'} transition-colors duration-500`} />
                        )}
                        <motion.div
                          animate={isActive ? { scale: [1, 1.15, 1] } : {}}
                          transition={{ repeat: Infinity, duration: 2 }}
                          className={`w-8 h-8 rounded-full flex items-center justify-center border-2 shrink-0 z-10 transition-all duration-300 ${isCompleted ? 'bg-primary/20 border-primary' : 'bg-secondary border-border/30'}`}
                        >
                          <StepIcon className={`w-3.5 h-3.5 ${isCompleted ? 'text-primary' : 'text-muted-foreground'}`} />
                        </motion.div>
                        {idx < TIMELINE_STEPS.length - 1 && (
                          <div className={`flex-1 h-0.5 ${idx < currentStep ? 'bg-primary' : 'bg-border/30'} transition-colors duration-500`} />
                        )}
                      </div>
                      <p className={`mt-2 text-[9px] font-display uppercase tracking-wider text-center ${isCompleted ? 'text-primary' : 'text-muted-foreground/50'}`}>
                        {cfg.label.split(' ')[0]}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Meta info */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 pt-5 border-t border-border/20">
              {selectedCase.due_date && (
                <div>
                  <p className="text-[10px] text-muted-foreground font-display uppercase tracking-wider">Expected By</p>
                  <p className="text-sm text-foreground font-medium mt-0.5">{new Date(selectedCase.due_date).toLocaleDateString()}</p>
                </div>
              )}
              <div>
                <p className="text-[10px] text-muted-foreground font-display uppercase tracking-wider">Opened</p>
                <p className="text-sm text-foreground font-medium mt-0.5">{new Date(selectedCase.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground font-display uppercase tracking-wider">Priority</p>
                <p className={`text-sm font-semibold font-display uppercase mt-0.5 ${selectedCase.priority === 'urgent' ? 'text-destructive' : selectedCase.priority === 'high' ? 'text-warning' : 'text-muted-foreground'}`}>
                  {selectedCase.priority}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Delivered Reports */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="glass-panel p-6">
            <h2 className="font-display text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2 mb-5">
              <FileText className="w-3.5 h-3.5 text-primary" /> Reports
            </h2>
            {reports.length === 0 ? (
              <div className="py-8 text-center">
                <FileText className="w-8 h-8 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No reports available yet.</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Reports will appear here once delivered by the investigator.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reports.map(r => (
                  <motion.div key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex items-center gap-4 p-4 rounded-lg border border-green-400/20 bg-green-400/5">
                    <div className="w-10 h-10 rounded-lg bg-green-400/10 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{r.report_title}</p>
                      <p className="text-[10px] text-muted-foreground font-display mt-0.5">
                        Delivered {new Date(r.updated_at).toLocaleDateString()}
                        {r.overall_risk !== 'none' && ` · Risk: ${r.overall_risk.toUpperCase()}`}
                      </p>
                    </div>
                    <Button size="sm" className="gap-2 bg-green-400/10 text-green-400 hover:bg-green-400/20 border border-green-400/30 shrink-0 font-display text-xs">
                      <Download className="w-3.5 h-3.5" /> Download
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Contact */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="glass-panel p-6">
            <h2 className="font-display text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2 mb-4">
              <MessageCircle className="w-3.5 h-3.5 text-accent" /> Contact Your Case Manager
            </h2>
            <div className="flex gap-3">
              <textarea
                placeholder="Send a message to your case manager…"
                rows={3}
                className="flex-1 px-3 py-2 text-sm rounded-lg bg-secondary/50 border border-border/40 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 resize-none"
              />
              <Button className="self-end gap-2 bg-accent/20 text-accent hover:bg-accent/30 border border-accent/30 font-display text-xs">
                Send <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
