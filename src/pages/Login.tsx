import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Lock, User, ArrowRight, Phone, Eye, EyeOff, UserPlus, LogIn, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { signIn, signUp, getDashboardPath } from '@/services/authService';
import { useAuth } from '@/lib/authContext';

type Tab = 'login' | 'register';

export default function Login() {
  const navigate = useNavigate();
  const { profile, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<Tab>('login');
  const [waitForProfile, setWaitForProfile] = useState(false);

  // Auto-redirect if already logged in and profile is loaded
  useEffect(() => {
    console.log('[Login] current state:', { profile, authLoading });
    if (profile && !authLoading) {
      console.log('[Login] Redirecting to:', getDashboardPath(profile.role));
      navigate(getDashboardPath(profile.role), { replace: true });
    }
  }, [profile, authLoading, navigate]);

  // Sign-in state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  // Register state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [showRegPass, setShowRegPass] = useState(false);
  const [registered, setRegistered] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setError(null);
    setLoading(true);
    try {
      await signIn(email, password);
      // Profile is fetched by authContext's onAuthStateChange.
      // useEffect above will navigate once profile is ready.
      setWaitForProfile(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed. Check your credentials.');
      setLoading(false);
    }
    // Don't setLoading(false) on success — keep showing "Authenticating…"
    // until the useEffect navigates away.
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword) { setError('Name, email and password are required.'); return; }
    if (regPassword !== regConfirm) { setError('Passwords do not match.'); return; }
    if (regPassword.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setError(null);
    setLoading(true);
    try {
      await signUp({ email: regEmail, password: regPassword, full_name: regName, phone: regPhone || undefined, role: 'client' });
      setRegistered(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background grid-bg flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-md">

        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary/10 border border-primary/20 mb-4 animate-pulse-glow">
            <Search className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground tracking-wider mb-1">OSIRIS</h1>
          <p className="text-sm text-muted-foreground tracking-widest uppercase">OSINT Intelligence Platform</p>
        </div>

        <div className="glass-panel p-8">
          {/* Tabs */}
          <div className="flex rounded-lg border border-border/40 bg-secondary/30 p-1 mb-6">
            {(['login', 'register'] as Tab[]).map(t => (
              <button key={t} onClick={() => { setTab(t); setError(null); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-xs font-display uppercase tracking-wider transition-all duration-200 ${tab === t ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
                {t === 'login' ? <LogIn className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
                {t === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* ── SIGN IN ── */}
            {tab === 'login' && (
              <motion.form key="login" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} transition={{ duration: 0.2 }}
                onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground font-display uppercase tracking-wider mb-1.5 block">Email</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input type="email" placeholder="analyst@agency.gov" value={email} onChange={e => setEmail(e.target.value)}
                      className="pl-10 bg-secondary border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-display uppercase tracking-wider mb-1.5 block">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input type={showPass ? 'text' : 'password'} placeholder="••••••••••••" value={password} onChange={e => setPassword(e.target.value)}
                      className="pl-10 pr-10 bg-secondary border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20" />
                    <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {error && <p className="text-xs text-destructive border border-destructive/20 bg-destructive/5 rounded-md px-3 py-2">{error}</p>}
                <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-display tracking-wider neon-glow">
                  {loading ? 'Authenticating…' : <><span>ACCESS SYSTEM</span> <ArrowRight className="w-4 h-4 ml-2" /></>}
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-4">
                  Authorized personnel only. All activity is monitored and logged.
                </p>
              </motion.form>
            )}

            {/* ── REGISTER ── */}
            {tab === 'register' && !registered && (
              <motion.form key="register" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}
                onSubmit={handleRegister} className="space-y-4">
                <p className="text-xs text-muted-foreground border border-border/30 bg-secondary/20 rounded-md px-3 py-2 leading-relaxed">
                  Client self-registration. Your account will be linked to your case by the team.
                </p>
                <div>
                  <label className="text-xs text-muted-foreground font-display uppercase tracking-wider mb-1.5 block">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input type="text" placeholder="John Smith" value={regName} onChange={e => setRegName(e.target.value)}
                      className="pl-10 bg-secondary border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-display uppercase tracking-wider mb-1.5 block">Email</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input type="email" placeholder="you@company.com" value={regEmail} onChange={e => setRegEmail(e.target.value)}
                      className="pl-10 bg-secondary border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-display uppercase tracking-wider mb-1.5 block">Phone <span className="normal-case opacity-60">(optional)</span></label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input type="tel" placeholder="+91 98765 43210" value={regPhone} onChange={e => setRegPhone(e.target.value)}
                      className="pl-10 bg-secondary border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground font-display uppercase tracking-wider mb-1.5 block">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input type={showRegPass ? 'text' : 'password'} placeholder="Min 8 chars" value={regPassword} onChange={e => setRegPassword(e.target.value)}
                        className="pl-10 pr-8 bg-secondary border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20" />
                      <button type="button" onClick={() => setShowRegPass(v => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showRegPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground font-display uppercase tracking-wider mb-1.5 block">Confirm</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input type="password" placeholder="Repeat" value={regConfirm} onChange={e => setRegConfirm(e.target.value)}
                        className="pl-10 bg-secondary border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20" />
                    </div>
                  </div>
                </div>
                {error && <p className="text-xs text-destructive border border-destructive/20 bg-destructive/5 rounded-md px-3 py-2">{error}</p>}
                <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-display tracking-wider neon-glow">
                  {loading ? 'Creating account…' : <><span>CREATE ACCOUNT</span> <ArrowRight className="w-4 h-4 ml-2" /></>}
                </Button>
              </motion.form>
            )}

            {/* ── REGISTER SUCCESS ── */}
            {tab === 'register' && registered && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6 space-y-4">
                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 0.5 }}
                  className="w-14 h-14 rounded-full bg-green-400/10 border border-green-400/30 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-7 h-7 text-green-400" />
                </motion.div>
                <div>
                  <p className="font-display font-semibold text-foreground">Account Created</p>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    Check your email <span className="text-foreground font-medium">{regEmail}</span> to confirm your account, then sign in to access your portal.
                  </p>
                </div>
                <Button variant="outline" onClick={() => { setTab('login'); setRegistered(false); setEmail(regEmail); }}
                  className="font-display tracking-wider border-border hover:border-primary/40">
                  Back to Sign In
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
