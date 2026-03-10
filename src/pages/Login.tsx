import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Lock, User, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background grid-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary/10 border border-primary/20 mb-4 animate-pulse-glow">
            <Search className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground tracking-wider mb-1">OSIRIS</h1>
          <p className="text-sm text-muted-foreground tracking-widest uppercase">OSINT Intelligence Platform</p>
        </div>

        <div className="glass-panel p-8">
          <h2 className="font-display text-lg font-semibold text-foreground mb-6">Secure Login</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="analyst@agency.gov"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="pl-10 bg-secondary border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="pl-10 bg-secondary border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20"
              />
            </div>
            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-display tracking-wider">
              ACCESS SYSTEM <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>
          <p className="text-xs text-muted-foreground text-center mt-6">
            Authorized personnel only. All activity is monitored and logged.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
