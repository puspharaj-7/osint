import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldOff, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/authContext';
import { getDashboardPath } from '@/services/authService';

export default function Forbidden() {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const handleBack = () => {
    if (profile) navigate(getDashboardPath(profile.role));
    else navigate('/');
  };

  return (
    <div className="min-h-screen bg-background grid-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        <motion.div
          animate={{ rotate: [0, -5, 5, -5, 0] }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-destructive/10 border border-destructive/20 mb-6"
        >
          <ShieldOff className="w-10 h-10 text-destructive" />
        </motion.div>

        <h1 className="font-display text-4xl font-bold text-foreground tracking-wider mb-2">
          403
        </h1>
        <h2 className="font-display text-lg font-semibold text-destructive uppercase tracking-widest mb-4">
          Access Denied
        </h2>
        <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
          You do not have the required clearance to access this area.
          All unauthorised access attempts are logged and monitored.
        </p>

        <Button
          onClick={handleBack}
          variant="outline"
          className="border-border hover:border-primary/40 font-display tracking-wider gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Dashboard
        </Button>
      </motion.div>
    </div>
  );
}
