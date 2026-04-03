import { Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/authContext';
import type { UserRole } from '@/lib/database.types';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-background grid-bg flex items-center justify-center">
      <motion.div
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="flex flex-col items-center gap-4"
      >
        <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center animate-pulse-glow">
          <Search className="w-6 h-6 text-primary" />
        </div>
        <p className="text-xs text-muted-foreground font-display tracking-widest uppercase">
          Authenticating…
        </p>
      </motion.div>
    </div>
  );
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/" replace />;
  if (!profile) return <Navigate to="/" replace />;
  if (!allowedRoles.includes(profile.role)) return <Navigate to="/forbidden" replace />;

  return <>{children}</>;
}
