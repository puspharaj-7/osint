import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Network, FileText, Clock, MessageSquare, Brain, Shield, Fingerprint, Download, Calendar, ChevronDown, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/store';
import { exportCaseToPDF } from '@/lib/pdf-export';
import RiskGauge from '@/components/RiskGauge';
import StatusBadge from '@/components/StatusBadge';
import { useState, useEffect, useRef } from 'react';

/* ── Typewriter hook ── */
const useTypewriter = (text: string, speed = 18) => {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const idx = useRef(0);
  useEffect(() => {
    idx.current = 0;
    setDisplayed('');
    setDone(false);
    const iv = setInterval(() => {
      if (idx.current < text.length) {
        setDisplayed(text.slice(0, idx.current + 1));
        idx.current++;
      } else {
        setDone(true);
        clearInterval(iv);
      }
    }, speed);
    return () => clearInterval(iv);
  }, [text, speed]);
  return { displayed, done };
};

/* ── Copy button ── */
const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button onClick={copy} title="Copy" className="text-muted-foreground hover:text-foreground transition-colors">
      {copied ? <Check className="w-3 h-3 text-primary" /> : <Copy className="w-3 h-3" />}
    </button>
  );
};

/* ── Progress bar ── */
const ScoreBar = ({ score, color }: { score: number; color: string }) => (
  <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden mt-2">
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: `${score}%` }}
      transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
      className="h-full rounded-full"
      style={{ backgroundColor: color }}
    />
  </div>
);

const sourceColors: Record<string, string> = {
  haveibeenpwned: 'bg-destructive/20 text-destructive border-destructive/30',
  virustotal: 'bg-warning/20 text-warning border-warning/30',
  whoisxml: 'bg-accent/20 text-accent border-accent/30',
  opensanctions: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  opencorporates: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'hunter.io': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  ipinfo: 'bg-green-500/20 text-green-400 border-green-500/30',
  abstractapi: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
};

const CaseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state: { investigations } } = useStore();
  const inv = investigations.find(i => i.id === id);
  const [expandedEvidence, setExpandedEvidence] = useState<Set<string>>(new Set());

  if (!inv) {
    return (
      <div className="p-8 text-center mt-20">
        <h2 className="text-xl font-display text-foreground mb-4">Investigation Not Found</h2>
        <Button onClick={() => navigate('/cases')}>Return to Cases</Button>
      </div>
    );
  }

  const aiSummary = `The subject "${inv.target}" appears associated with ${inv.evidence.length} intelligence sources. ${
    inv.alerts.length > 0 ? `There are ${inv.alerts.length} active alerts requiring attention. ` : ''
  }${inv.evidence.find(e => e.type === 'breach') ? 'The email appears in known breach databases. ' : ''}${
    inv.evidence.find(e => e.type === 'domain') ? 'Domain registration timing may warrant further investigation. ' : ''
  }

Risk Level: ${inv.riskLevel.toUpperCase()}
Recommendation: ${
    inv.riskScore >= 70 ? 'Immediate deep investigation recommended.' : inv.riskScore >= 40 ? 'Further investigation required.' : 'Low risk — routine monitoring sufficient.'
  }`;

  const { displayed: typedSummary } = useTypewriter(aiSummary, 16);

  const riskBarColor = inv.riskScore >= 70 ? '#ef4444' : inv.riskScore >= 40 ? '#f59e0b' : '#10b981';
  const confColor = inv.identityConfidence >= 70 ? '#10b981' : inv.identityConfidence >= 40 ? '#f59e0b' : '#ef4444';

  const toggleEvidence = (id: string) => {
    setExpandedEvidence(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="p-4 sm:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/cases')} className="text-muted-foreground hover:text-foreground self-start sm:self-auto">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-display text-2xl font-bold text-foreground tracking-wider">{inv.target}</h1>
            <StatusBadge status={inv.status} />
            <StatusBadge status={inv.riskLevel} variant="risk" />
          </div>
          <p className="text-sm text-muted-foreground font-display">{inv.caseId} · {inv.targetType} · Scan: {inv.scanStatus}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => exportCaseToPDF(inv)} className="text-muted-foreground hover:text-foreground">
            <Download className="w-4 h-4 mr-1" /> Export PDF
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigate(`/graph?case=${inv.id}`)} className="text-accent hover:text-accent/80">
            <Network className="w-4 h-4 mr-1" /> View Graph
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column */}
        <div className="space-y-5">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel p-5 flex flex-col items-center">
            <RiskGauge score={inv.riskScore} size="lg" label="Risk Score" />
            <ScoreBar score={inv.riskScore} color={riskBarColor} />
            <p className="text-[10px] font-display text-muted-foreground/60 mt-1.5 uppercase tracking-wider">
              {inv.riskScore}% risk level
            </p>
          </motion.div>

          <div className="glass-panel p-5 flex flex-col items-center">
            <RiskGauge score={inv.identityConfidence} size="md" label="Identity Confidence" />
            <ScoreBar score={inv.identityConfidence} color={confColor} />
            <p className="text-[10px] font-display text-muted-foreground/60 mt-1.5 uppercase tracking-wider">
              {inv.identityConfidence}% confidence
            </p>
          </div>

          <div className="glass-panel p-5">
            <h3 className="font-display text-xs uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
              <Calendar className="w-3 h-3" /> Schedule Scan
            </h3>
            <select className="w-full h-9 rounded-md bg-secondary border border-border text-foreground text-xs px-3 font-display focus:border-primary focus:outline-none mb-3">
              <option value="none">Manual only</option>
              <option value="daily">Daily scan</option>
              <option value="weekly">Weekly scan</option>
              <option value="monthly">Monthly scan</option>
            </select>
            <Button variant="secondary" className="w-full text-xs h-8">Update Schedule</Button>
          </div>

          <div className="glass-panel p-5">
            <h3 className="font-display text-xs uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
              <Fingerprint className="w-3 h-3" /> Inputs
            </h3>
            <div className="space-y-2">
              {inv.inputs.map((input, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded bg-secondary/30 border border-border/20">
                  <span className="text-[10px] font-display uppercase tracking-wider text-muted-foreground w-14 shrink-0">{input.type}</span>
                  <span className="text-xs text-foreground truncate">{input.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center */}
        <div className="col-span-1 lg:col-span-2 space-y-5">
          {/* Typewriter AI Summary */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel p-5 gradient-border glow-border">
            <h3 className="font-display text-xs uppercase tracking-wider text-primary mb-3 flex items-center gap-2">
              <Brain className="w-3 h-3" /> AI Investigation Summary
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            </h3>
            <p className="text-sm text-foreground/90 whitespace-pre-line leading-relaxed font-mono">
              {typedSummary}
              <span className="inline-block w-0.5 h-4 bg-primary ml-0.5 animate-pulse align-middle" />
            </p>
          </motion.div>

          {/* Evidence — collapsible */}
          <div className="glass-panel p-5">
            <h3 className="font-display text-xs uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
              <FileText className="w-3 h-3" /> Evidence Sources ({inv.evidence.length})
            </h3>
            <div className="space-y-2.5">
              {inv.evidence.map((ev, i) => {
                const sc = sourceColors[ev.source.toLowerCase()] ?? 'bg-primary/20 text-primary border-primary/30';
                const isOpen = expandedEvidence.has(ev.id);
                return (
                  <motion.div
                    key={ev.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                    className="rounded-lg bg-secondary/40 border border-border/40 overflow-hidden"
                  >
                    {/* Collapsed header — always visible */}
                    <button
                      onClick={() => toggleEvidence(ev.id)}
                      className="w-full flex items-center justify-between p-3.5 hover:bg-secondary/60 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-display border shrink-0 ${sc}`}>{ev.source}</span>
                        <span className="text-sm font-medium text-foreground truncate">{ev.title}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] text-muted-foreground font-display">{ev.confidence}% CONF.</span>
                        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                      </div>
                    </button>

                    {/* Expanded content */}
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-3.5 pb-3.5">
                            <div className="relative bg-background/50 p-3 rounded border border-border/20">
                              <div className="absolute top-2 right-2">
                                <CopyButton text={ev.content} />
                              </div>
                              <p className="text-xs text-muted-foreground whitespace-pre-line pr-6">{ev.content}</p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
              {inv.evidence.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">Scan in progress — evidence will appear here</p>
              )}
            </div>
          </div>

          {/* Alerts */}
          {inv.alerts.length > 0 && (
            <div className="glass-panel p-5">
              <h3 className="font-display text-xs uppercase tracking-wider text-warning mb-4 flex items-center gap-2">
                <Shield className="w-3 h-3" /> Key Alerts ({inv.alerts.length})
              </h3>
              <div className="space-y-2">
                {inv.alerts.map(alert => (
                  <div key={alert.id} className="p-3 rounded-md bg-secondary/30 border border-border/30">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground">{alert.title}</span>
                      <StatusBadge status={alert.severity} variant="severity" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{alert.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* Timeline */}
          <div className="glass-panel p-5">
            <h3 className="font-display text-xs uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
              <Clock className="w-3 h-3" /> Timeline
            </h3>
            <div className="space-y-1">
              {inv.timeline.map((entry, i) => {
                const dotColor = entry.type === 'alert' ? 'bg-warning' : entry.type === 'discovery' ? 'bg-primary' : 'bg-muted-foreground';
                const borderColor = entry.type === 'alert' ? 'border-l-warning/40' : entry.type === 'discovery' ? 'border-l-primary/40' : 'border-l-border/30';
                return (
                  <div key={entry.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${dotColor}`} />
                      {i < inv.timeline.length - 1 && <div className="w-px flex-1 bg-border/40 mt-1" />}
                    </div>
                    <div className={`pb-3 pl-2 border-l-2 border-transparent ${borderColor} flex-1`}>
                      <p className="text-xs text-foreground">{entry.event}</p>
                      <p className="text-[10px] text-muted-foreground font-display mt-0.5">
                        {new Date(entry.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div className="glass-panel p-5">
            <h3 className="font-display text-xs uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
              <MessageSquare className="w-3 h-3" /> Investigator Notes
            </h3>
            <div className="space-y-2">
              {inv.notes.map((note, i) => (
                <p key={i} className="text-xs text-foreground/80 p-3 rounded-md bg-secondary/30 border border-border/30 leading-relaxed">{note}</p>
              ))}
              {inv.notes.length === 0 && (
                <p className="text-xs text-muted-foreground italic">No notes yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseDetails;
