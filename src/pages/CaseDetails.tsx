import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Network, FileText, Clock, MessageSquare, Brain, Shield, Fingerprint, Download, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/store';
import { exportCaseToPDF } from '@/lib/pdf-export';
import RiskGauge from '@/components/RiskGauge';
import StatusBadge from '@/components/StatusBadge';

const CaseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state: { investigations } } = useStore();
  
  const inv = investigations.find(i => i.id === id);

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

  return (
    <div className="p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/cases')} className="text-muted-foreground hover:text-foreground self-start sm:self-auto">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
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
        {/* Left Column - Metrics */}
        <div className="space-y-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel p-5 flex flex-col items-center">
            <RiskGauge score={inv.riskScore} size="lg" label="Risk Score" />
          </motion.div>
          <div className="glass-panel p-5 flex flex-col items-center">
            <RiskGauge score={inv.identityConfidence} size="md" label="Identity Confidence" />
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
                <div key={i} className="flex items-center gap-2">
                  <span className="text-[10px] font-display uppercase tracking-wider text-muted-foreground w-14">{input.type}</span>
                  <span className="text-sm text-foreground truncate">{input.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center - Evidence + AI Summary */}
        <div className="col-span-1 lg:col-span-2 space-y-6">
          {/* AI Summary */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel p-5 glow-border">
            <h3 className="font-display text-xs uppercase tracking-wider text-primary mb-3 flex items-center gap-2">
              <Brain className="w-3 h-3" /> AI Investigation Summary
            </h3>
            <p className="text-sm text-foreground/90 whitespace-pre-line leading-relaxed">{aiSummary}</p>
          </motion.div>

         {/* Evidence */}
          <div className="glass-panel p-5">
            <h3 className="font-display text-xs uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
              <FileText className="w-3 h-3" /> Evidence Sources ({inv.evidence.length})
            </h3>
            <div className="space-y-3">
              {inv.evidence.map((ev, i) => {
                let sourceColor = 'bg-primary/20 text-primary border-primary/30';
                switch (ev.source.toLowerCase()) {
                  case 'haveibeenpwned': sourceColor = 'bg-destructive/20 text-destructive border-destructive/30'; break;
                  case 'virustotal': sourceColor = 'bg-warning/20 text-warning border-warning/30'; break;
                  case 'whoisxml': sourceColor = 'bg-accent/20 text-accent border-accent/30'; break;
                  case 'opensanctions': sourceColor = 'bg-purple-500/20 text-purple-400 border-purple-500/30'; break;
                  case 'opencorporates': sourceColor = 'bg-blue-500/20 text-blue-400 border-blue-500/30'; break;
                  case 'hunter.io': sourceColor = 'bg-orange-500/20 text-orange-400 border-orange-500/30'; break;
                  case 'ipinfo': sourceColor = 'bg-green-500/20 text-green-400 border-green-500/30'; break;
                  case 'abstractapi': sourceColor = 'bg-pink-500/20 text-pink-400 border-pink-500/30'; break;
                }

                return (
                  <motion.div
                    key={ev.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="p-4 rounded-md bg-secondary/50 border border-border/50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-display border ${sourceColor}`}>
                          {ev.source}
                        </span>
                        <span className="text-sm font-medium text-foreground">{ev.title}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground font-display px-2 py-0.5 rounded bg-background border border-border">
                        {ev.confidence}% CONF.
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground whitespace-pre-line bg-background/50 p-2 rounded border border-border/20 mt-2">{ev.content}</p>
                  </motion.div>
                );
              })}
              {inv.evidence.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Scan in progress — evidence will appear here</p>
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

        {/* Right Column - Timeline + Notes */}
        <div className="space-y-6">
          <div className="glass-panel p-5">
            <h3 className="font-display text-xs uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
              <Clock className="w-3 h-3" /> Timeline
            </h3>
            <div className="space-y-3">
              {inv.timeline.map((entry, i) => (
                <div key={entry.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-2 h-2 rounded-full mt-1.5 ${
                      entry.type === 'alert' ? 'bg-warning' : entry.type === 'discovery' ? 'bg-primary' : 'bg-muted-foreground'
                    }`} />
                    {i < inv.timeline.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                  </div>
                  <div className="pb-3">
                    <p className="text-xs text-foreground">{entry.event}</p>
                    <p className="text-[10px] text-muted-foreground font-display mt-0.5">
                      {new Date(entry.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel p-5">
            <h3 className="font-display text-xs uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
              <MessageSquare className="w-3 h-3" /> Investigator Notes
            </h3>
            <div className="space-y-2">
              {inv.notes.map((note, i) => (
                <p key={i} className="text-xs text-foreground/80 p-2 rounded bg-secondary/30 border border-border/30">{note}</p>
              ))}
              {inv.notes.length === 0 && <p className="text-xs text-muted-foreground">No notes yet</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseDetails;
