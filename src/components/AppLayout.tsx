import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AppSidebar from './AppSidebar';
import LiveClock from './LiveClock';

const routeLabels: Record<string, string> = {
  '/dashboard': 'Command Center',
  '/new-investigation': 'New Investigation',
  '/cases': 'Case Files',
  '/graph': 'Graph Intelligence',
  '/alerts': 'Alerts Center',
  '/admin': 'Admin Panel',
};

const AppLayout = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  // Determine breadcrumb
  const baseRoute = '/' + location.pathname.split('/')[1];
  const pageLabel = routeLabels[baseRoute] ?? 'OSIRIS';
  const isDetailPage = location.pathname.split('/').length > 2;

  return (
    <div className="min-h-screen bg-background grid-bg">
      <AppSidebar isOpen={isMobileOpen} setIsOpen={setIsMobileOpen} />

      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-background/90 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center border border-primary/20">
            <div className="w-3 h-3 bg-primary rounded-sm" />
          </div>
          <span className="font-display font-bold tracking-wider text-sm">OSIRIS</span>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setIsMobileOpen(true)} className="p-2">
          <Menu className="w-5 h-5" />
        </Button>
      </div>

      {/* Desktop Top Header Bar */}
      <div className="hidden md:flex md:ml-64 items-center justify-between px-8 py-3 border-b border-border/40 bg-background/60 backdrop-blur-md sticky top-0 z-30">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-display">
          <span className="text-muted-foreground/60 uppercase tracking-wider">OSIRIS</span>
          <span className="text-muted-foreground/40">/</span>
          <span className="text-muted-foreground uppercase tracking-wider">{pageLabel}</span>
          {isDetailPage && (
            <>
              <span className="text-muted-foreground/40">/</span>
              <span className="text-primary uppercase tracking-wider">Detail</span>
            </>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-1.5 text-[11px] font-display text-green-400/80">
            <CheckCircle className="w-3 h-3" />
            <span className="uppercase tracking-wider">System Operational</span>
          </div>
          <div className="w-px h-4 bg-border" />
          <LiveClock />
        </div>
      </div>

      <main className="md:ml-64 min-h-screen pb-12 md:pb-0">
        <Outlet />
      </main>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </div>
  );
};

export default AppLayout;
