import { Outlet } from 'react-router-dom';
import { Search, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { signOut } from '@/services/authService';
import { useAuth } from '@/lib/authContext';
import { Button } from '@/components/ui/button';
import LiveClock from '@/components/LiveClock';

/** Minimal layout used exclusively by the Client Portal */
export default function ClientLayout() {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const initials = profile?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? '??';

  return (
    <div className="min-h-screen bg-background grid-bg">
      {/* Top header bar */}
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Search className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="font-display text-sm font-bold text-foreground tracking-wider leading-none">OSIRIS</p>
              <p className="text-[9px] text-muted-foreground tracking-widest uppercase">Client Portal</p>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <LiveClock />
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-display font-bold text-white"
                style={{ background: 'linear-gradient(135deg, hsl(160 80% 35%), hsl(200 70% 40%))' }}
              >
                {initials}
              </div>
              <span className="text-xs text-muted-foreground hidden sm:block truncate max-w-[120px]">
                {profile?.full_name}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 p-2"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
