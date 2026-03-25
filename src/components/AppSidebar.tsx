import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '@/lib/store';
import {
  LayoutDashboard,
  Plus,
  FolderSearch,
  Network,
  Bell,
  Shield,
  LogOut,
  Search,
  X } from
'lucide-react';

const navItems = [
{ to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
{ to: '/new-investigation', icon: Plus, label: 'New Investigation' },
{ to: '/cases', icon: FolderSearch, label: 'Cases' },
{ to: '/graph', icon: Network, label: 'Graph Intelligence' },
{ to: '/alerts', icon: Bell, label: 'Alerts Center' },
{ to: '/admin', icon: Shield, label: 'Admin Panel' }];


// Simulation of RBAC user role
const currentUserRole = 'admin'; // Change to 'analyst' to test RBAC

interface AppSidebarProps {
  isOpen?: boolean;
  setIsOpen?: (v: boolean) => void;
}

const AppSidebar = ({ isOpen, setIsOpen }: AppSidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state: { alerts } } = useStore();
  const [searchQuery, setSearchQuery] = useState('');

  const unreadCount = alerts.filter(a => !a.read).length;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/cases?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  return (
    <aside className={`fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border flex flex-col z-50 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-primary/20 flex items-center justify-center">
              <Search className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-sm font-bold text-foreground tracking-wider">OSINT</h1>
              <p className="text-[10px] text-muted-foreground tracking-widest uppercase">Intelligence Platform</p>
            </div>
          </div>
          <button className="md:hidden text-muted-foreground hover:text-foreground" onClick={() => setIsOpen?.(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Global search..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-md bg-sidebar-accent/50 border border-sidebar-border text-xs text-sidebar-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-display"
          />
        </form>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          if (item.to === '/admin' && currentUserRole !== 'admin') return null;
          
          const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + '/');
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setIsOpen?.(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all ${
              isActive ?
              'bg-primary/10 text-primary border border-primary/20' :
              'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground border border-transparent'}`
              }>
              
              <item.icon className="w-4 h-4 shrink-0" />
              <span className="font-medium flex-1">{item.label}</span>
              {item.to === '/alerts' && unreadCount > 0 && (
                <span className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse-glow">
                  {unreadCount}
                </span>
              )}
            </NavLink>);

        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
            <span className="text-xs font-display text-secondary-foreground">JD</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">John Doe</p>
            <p className="text-xs text-muted-foreground">Investigator</p>
          </div>
          <NavLink to="/" className="text-muted-foreground hover:text-destructive transition-colors">
            <LogOut className="w-4 h-4" />
          </NavLink>
        </div>
      </div>
    </aside>);

};

export default AppSidebar;