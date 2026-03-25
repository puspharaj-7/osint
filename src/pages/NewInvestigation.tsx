import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Search, Zap, Radar, AlertTriangle, CheckCircle, Circle, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useScanRunner, useStore } from '@/lib/store';

const inputTypes = [
  { value: 'name', label: 'Name', placeholder: 'John Doe' },
  { value: 'email', label: 'Email', placeholder: 'john@example.com' },
  { value: 'phone', label: 'Phone', placeholder: '+1234567890' },
  { value: 'username', label: 'Username', placeholder: '@johndoe' },
  { value: 'domain', label: 'Domain', placeholder: 'example.com' },
  { value: 'ip', label: 'IP Address', placeholder: '192.168.1.1' },
  { value: 'company', label: 'Company', placeholder: 'Acme Corp' },
  { value: 'address', label: 'Address', placeholder: '123 Main St' },
  { value: 'social', label: 'Social URL', placeholder: 'https://linkedin.com/in/...' },
];

interface InputField { id: number; type: string; value: string; }

const steps = [
  { label: 'Identifiers', desc: 'Enter target data' },
  { label: 'Scan Type', desc: 'Choose depth' },
  { label: 'Launch', desc: 'Run investigation' },
];

const NewInvestigation = () => {
  const navigate = useNavigate();
  const { startScan } = useScanRunner();
  const { dispatch } = useStore();
  const [fields, setFields] = useState<InputField[]>([{ id: 1, type: 'name', value: '' }]);
  const [scanning, setScanning] = useState(false);
  const [scanLog, setScanLog] = useState<string[]>([]);
  const [scanStep, setScanStep] = useState<string>('');
  const [activeStep, setActiveStep] = useState(0);

  const addField = () => setFields(prev => [...prev, { id: Date.now(), type: 'email', value: '' }]);
  const removeField = (id: number) => { if (fields.length > 1) setFields(prev => prev.filter(f => f.id !== id)); };
  const updateField = (id: number, key: 'type' | 'value', val: string) =>
    setFields(prev => prev.map(f => f.id === id ? { ...f, [key]: val } : f));

  const hasInput = fields.some(f => f.value.trim().length > 0);

  const startInvestigation = async () => {
    setScanning(true);
    setScanLog([]);
    setActiveStep(2);
    const validFields = fields.filter(f => f.value.trim().length > 0);
    const primaryTarget = validFields[0]?.value || 'Unknown Target';
    const primaryType = validFields[0]?.type || 'unknown';
    const newCaseId = `CASE-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const investigationId = `inv_${Date.now()}`;

    dispatch({
      type: 'ADD_INVESTIGATION',
      payload: {
        id: investigationId, caseId: newCaseId, target: primaryTarget, targetType: primaryType,
        status: 'pending', riskScore: 0, riskLevel: 'low', identityConfidence: 0,
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        inputs: validFields, alerts: [], evidence: [],
        timeline: [{ id: `t_${Date.now()}`, timestamp: new Date().toISOString(), event: 'Investigation initiated', type: 'scan' }],
        notes: [], scanStatus: 'quick',
      }
    });

    try {
      await startScan(investigationId, validFields, (step) => {
        setScanStep(step);
        setScanLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${step}`]);
      });
      navigate(`/cases/${investigationId}`);
    } catch (err) {
      console.error(err);
      setScanning(false);
      setScanLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Scan failed — check console`]);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold text-foreground tracking-wider mb-1">NEW INVESTIGATION</h1>
        <p className="text-sm text-muted-foreground mb-8">Enter one or more identifiers to begin intelligence gathering</p>

        {/* Stepper */}
        <div className="flex items-center gap-0 mb-8">
          {steps.map((s, i) => {
            const isDone = i < activeStep || (scanning && i <= 2);
            const isCurrent = i === activeStep && !scanning;
            return (
              <div key={s.label} className="flex items-center flex-1">
                <div
                  className={`flex flex-col items-center cursor-pointer group`}
                  onClick={() => !scanning && setActiveStep(i)}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                    isDone ? 'bg-primary border-primary' : isCurrent ? 'border-primary bg-primary/10' : 'border-border bg-secondary/30'
                  }`}>
                    {isDone
                      ? <CheckCircle className="w-4 h-4 text-primary-foreground" />
                      : <Circle className={`w-4 h-4 ${isCurrent ? 'text-primary' : 'text-muted-foreground'}`} />
                    }
                  </div>
                  <p className={`text-[10px] font-display uppercase tracking-wider mt-1.5 ${isCurrent ? 'text-primary' : isDone ? 'text-primary/70' : 'text-muted-foreground'}`}>{s.label}</p>
                  <p className="text-[9px] text-muted-foreground/60 hidden sm:block">{s.desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-px mx-2 transition-all ${i < activeStep ? 'bg-primary/50' : 'bg-border/40'}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* API Key Warning */}
        <div className="glass-panel p-5 mb-5">
          <div className="p-3.5 rounded-md border border-warning/30 bg-warning/5 flex items-start gap-3 mb-5">
            <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-warning font-display">API Keys Required</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Configure your API keys in the <code className="text-foreground bg-secondary px-1 rounded">.env</code> file. Copy <code className="text-foreground bg-secondary px-1 rounded">.env.example</code> and restart the dev server.
              </p>
            </div>
          </div>

          <h2 className="font-display text-sm font-semibold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
            <ChevronRight className="w-4 h-4 text-primary" /> Target Identifiers
          </h2>
          <div className="space-y-3">
            <AnimatePresence>
              {fields.map((field, i) => {
                const typeConfig = inputTypes.find(t => t.value === field.type);
                return (
                  <motion.div
                    key={field.id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16, height: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
                  >
                    <select
                      value={field.type}
                      onChange={e => updateField(field.id, 'type', e.target.value)}
                      className="w-full sm:w-36 h-10 rounded-md bg-secondary border border-border text-foreground text-sm px-3 font-display focus:border-primary focus:outline-none"
                    >
                      {inputTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                    <Input
                      placeholder={typeConfig?.placeholder}
                      value={field.value}
                      onChange={e => updateField(field.id, 'value', e.target.value)}
                      className="flex-1 bg-secondary border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20"
                    />
                    {fields.length > 1 && (
                      <button onClick={() => removeField(field.id)} className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded hover:bg-destructive/10">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
          <Button variant="ghost" onClick={addField} className="mt-3 text-muted-foreground hover:text-foreground text-sm">
            <Plus className="w-4 h-4 mr-1" /> Add Identifier
          </Button>
        </div>

        {/* Scan Options */}
        <div className="glass-panel p-5 mb-5">
          <h2 className="font-display text-sm font-semibold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
            <ChevronRight className="w-4 h-4 text-primary" /> Scan Options
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-all cursor-pointer">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-primary" />
                <span className="font-display text-sm font-semibold text-foreground">Quick Scan</span>
              </div>
              <p className="text-xs text-muted-foreground">Breach databases, sanctions lists, basic domain info, social signals. Results in seconds.</p>
            </div>
            <div className="p-4 rounded-lg border border-accent/30 bg-accent/5 hover:bg-accent/10 transition-all cursor-pointer">
              <div className="flex items-center gap-2 mb-2">
                <Radar className="w-4 h-4 text-accent" />
                <span className="font-display text-sm font-semibold text-foreground">Deep Scan</span>
              </div>
              <p className="text-xs text-muted-foreground">DNS intelligence, WHOIS, social discovery, IP analysis, company registry. Runs asynchronously.</p>
            </div>
          </div>
        </div>

        {/* Scan Log */}
        <AnimatePresence>
          {scanLog.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="glass-panel p-4 mb-5 overflow-hidden"
            >
              <p className="text-[10px] font-display uppercase tracking-wider text-primary mb-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Scan Log
              </p>
              <div className="space-y-1 max-h-36 overflow-y-auto">
                {scanLog.map((line, i) => (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-muted-foreground font-mono"
                  >
                    {line}
                  </motion.p>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Launch Button */}
        <Button
          onClick={startInvestigation}
          disabled={scanning || !hasInput}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-display tracking-wider h-12 text-base neon-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {scanning ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              {scanStep ? scanStep.toUpperCase() : 'INITIATING SCAN...'}
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Search className="w-4 h-4" /> LAUNCH INVESTIGATION
            </span>
          )}
        </Button>
      </motion.div>
    </div>
  );
};

export default NewInvestigation;
