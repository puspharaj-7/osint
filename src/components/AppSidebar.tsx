import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/lib/store';
import { useAuth } from '@/lib/authContext';
import { signOut, getDashboardPath } from '@/services/authService';
import type { UserRole } from '@/lib/database.types';
import {
  LayoutDashboard, Plus, FolderSearch, Network, Bell, Shield,
  LogOut, Search, X, Radio, Settings,
} from 'lucide-react';
import LiveClock from './LiveClock';

type NavItem = { to: string; icon: typeof LayoutDashboard; label: string };

const navByRole: Record<UserRole, NavItem[]> = {
  admin: [
    { to: '/admin/dashboard',  icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/new-investigation', icon: Plus,           label: 'New Investigation' },
    { to: '/cases',            icon: FolderSearch,    label: 'All Cases' },
    { to: '/graph',            icon: Network,         label: 'Graph Intelligence' },
    { to: '/alerts',           icon: Bell,            label: 'Alerts Center' },
    { to: '/admin/panel',      icon: Shield,          label: 'Admin Panel' },
  ],
  manager: [
    { to: '/manager/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/new-investigation', icon: Plus,            label: 'New Case' },
    { to: '/cases',             icon: FolderSearch,    label: 'All Cases' },
    { to: '/alerts',            icon: Bell,            label: 'Alerts Center' },
  ],
  investigator: [
    { to: '/investigator/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/new-investigation',      icon: Plus,            label: 'New Investigation' },
    { to: '/cases',                  icon: FolderSearch,    label: 'My Cases' },
    { to: '/graph',                  icon: Network,         label: 'Graph Intelligence' },
    { to: '/alerts',                 icon: Bell,            label: 'Alerts Center' },
  ],
  client: [], // uses ClientLayout — no sidebar
};

const roleLabels: Record<UserRole, { label: string; color: string }> = {
  admin:        { label: 'Admin',        color: 'text-destructive' },
  manager:      { label: 'Manager',      color: 'text-warning' },
  investigator: { label: 'Investigator', color: 'text-primary' },
  client:       { label: 'Client',       color: 'text-accent' },
};

interface AppSidebarProps {
  isOpen?: boolean;
  setIsOpen?: (v: boolean) => void;
}

const AppSidebar = ({ isOpen, setIsOpen }: AppSidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state: { alerts } } = useStore();
  const { profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const unreadCount = alerts.filter(a => !a.read).length;
  const role = profile?.role ?? 'investigator';
  const navItems = navByRole[role] ?? [];
  const roleMeta = roleLabels[role];

  const initials = profile?.full_name
    ?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? '??';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/cases?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <aside className={`fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border flex flex-col z-50 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>

      {/* Brand */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center border border-primary/25">
              <Search className="w-4 h-4 text-primary" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full">
                <span className="absolute inset-0 rounded-full bg-primary animate-status-ping opacity-75" />
              </span>
            </div>
            <div>
              <h1 className="font-display text-sm font-bold text-foreground tracking-wider">OSIRIS</h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-status-ping" />
                <p className="text-[10px] text-green-400/80 tracking-widest uppercase font-display">Operational</p>
              </div>
            </div>
          </div>
          <button className="md:hidden text-muted-foreground hover:text-foreground" onClick={() => setIsOpen?.(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input type="text" placeholder="Global search..."
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-md bg-sidebar-accent/50 border border-sidebar-border text-xs text-sidebar-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-display" />
        </form>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="text-[10px] font-display uppercase tracking-widest text-muted-foreground/50 px-3 mb-3">Navigation</p>
        {navItems.map((item) => {
          const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + '/');
          return (
            <div key={item.to} className="relative">
              <AnimatePresence>
                {isActive && (
                  <motion.div layoutId="sidebar-active-bar"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r-full"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
                )}
              </AnimatePresence>
              <NavLink to={item.to} onClick={() => setIsOpen?.(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all ${isActive
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground border border-transparent'}`}>
                <item.icon className="w-4 h-4 shrink-0" />
                <span className="font-medium flex-1">{item.label}</span>
                {item.to === '/alerts' && unreadCount > 0 && (
                  <span className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse-glow">
                    {unreadCount}
                  </span>
                )}
              </NavLink>
            </div>
          );
        })}

        {/* System Status */}
        <div className="pt-4">
          <p className="text-[10px] font-display uppercase tracking-widest text-muted-foreground/50 px-3 mb-3">System</p>
          <div className="px-3 py-2 rounded-md border border-border/30 bg-secondary/20 space-y-2">
            {[{ label: 'API Gateway', ok: true }, { label: 'Scan Engine', ok: true }, { label: 'Auth', ok: true }].map(s => (
              <div key={s.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Radio className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[11px] text-muted-foreground font-display">{s.label}</span>
                </div>
                <span className={`text-[10px] font-display ${s.ok ? 'text-green-400' : 'text-destructive'}`}>{s.ok ? 'OK' : 'ERR'}</span>
              </div>
            ))}
          </div>
        </div>
      </nav>

      {/* User footer */}
      <div className="p-4 border-t border-sidebar-border">
        {/* Role badge */}
        <div className="mb-3 px-3">
          <span className={`text-[10px] font-display uppercase tracking-widest ${roleMeta.color}`}>
            {roleMeta.label}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-display font-bold text-white shrink-0"
            style={{ background: 'linear-gradient(135deg, hsl(160 80% 35%), hsl(200 70% 40%))' }}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{profile?.full_name ?? 'Loading…'}</p>
            <LiveClock />
          </div>
          <button onClick={handleSignOut}
            className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded hover:bg-destructive/10"
            title="Sign out">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AppSidebar;