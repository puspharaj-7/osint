import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, X, Search, Zap, Radar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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

interface InputField {
  id: number;
  type: string;
  value: string;
}

const NewInvestigation = () => {
  const navigate = useNavigate();
  const [fields, setFields] = useState<InputField[]>([
    { id: 1, type: 'name', value: '' },
  ]);
  const [scanning, setScanning] = useState(false);

  const addField = () => {
    setFields(prev => [...prev, { id: Date.now(), type: 'email', value: '' }]);
  };

  const removeField = (id: number) => {
    if (fields.length > 1) {
      setFields(prev => prev.filter(f => f.id !== id));
    }
  };

  const updateField = (id: number, key: 'type' | 'value', val: string) => {
    setFields(prev => prev.map(f => f.id === id ? { ...f, [key]: val } : f));
  };

  const startInvestigation = () => {
    setScanning(true);
    setTimeout(() => {
      navigate('/cases/1');
    }, 2000);
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold text-foreground tracking-wider mb-1">NEW INVESTIGATION</h1>
        <p className="text-sm text-muted-foreground mb-8">Enter one or more identifiers to begin intelligence gathering</p>

        <div className="glass-panel p-6 mb-6">
          <h2 className="font-display text-sm font-semibold text-foreground uppercase tracking-wider mb-4">Target Identifiers</h2>
          <div className="space-y-3">
            {fields.map((field, i) => {
              const typeConfig = inputTypes.find(t => t.value === field.type);
              return (
                <motion.div
                  key={field.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3"
                >
                  <select
                    value={field.type}
                    onChange={e => updateField(field.id, 'type', e.target.value)}
                    className="w-36 h-10 rounded-md bg-secondary border border-border text-foreground text-sm px-3 font-display focus:border-primary focus:outline-none"
                  >
                    {inputTypes.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                  <Input
                    placeholder={typeConfig?.placeholder}
                    value={field.value}
                    onChange={e => updateField(field.id, 'value', e.target.value)}
                    className="flex-1 bg-secondary border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20"
                  />
                  {fields.length > 1 && (
                    <button onClick={() => removeField(field.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>
          <Button variant="ghost" onClick={addField} className="mt-3 text-muted-foreground hover:text-foreground text-sm">
            <Plus className="w-4 h-4 mr-1" /> Add Identifier
          </Button>
        </div>

        <div className="glass-panel p-6 mb-6">
          <h2 className="font-display text-sm font-semibold text-foreground uppercase tracking-wider mb-4">Scan Options</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-md border border-primary/30 bg-primary/5">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-primary" />
                <span className="font-display text-sm font-semibold text-foreground">Quick Scan</span>
              </div>
              <p className="text-xs text-muted-foreground">Breach databases, sanctions lists, basic domain info, social signals. Results in seconds.</p>
            </div>
            <div className="p-4 rounded-md border border-accent/30 bg-accent/5">
              <div className="flex items-center gap-2 mb-2">
                <Radar className="w-4 h-4 text-accent" />
                <span className="font-display text-sm font-semibold text-foreground">Deep Scan</span>
              </div>
              <p className="text-xs text-muted-foreground">DNS intelligence, WHOIS, social discovery, IP analysis, company registry. Runs asynchronously.</p>
            </div>
          </div>
        </div>

        <Button
          onClick={startInvestigation}
          disabled={scanning || fields.every(f => !f.value.trim())}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-display tracking-wider h-12 text-base"
        >
          {scanning ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              INITIATING SCAN...
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
