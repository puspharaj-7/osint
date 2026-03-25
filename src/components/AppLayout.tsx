import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AppSidebar from './AppSidebar';

const AppLayout = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background grid-bg">
      <AppSidebar isOpen={isMobileOpen} setIsOpen={setIsMobileOpen} />
      
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center">
            <div className="w-3 h-3 bg-primary rounded-sm" />
          </div>
          <span className="font-display font-bold tracking-wider text-sm">OSIRIS</span>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setIsMobileOpen(true)} className="p-2">
          <Menu className="w-5 h-5" />
        </Button>
      </div>

      <main className="md:ml-64 min-h-screen pt-4 md:pt-0 pb-12 md:pb-0">
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
