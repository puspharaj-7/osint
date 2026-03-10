import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Plus,
  FolderSearch,
  Network,
  Bell,
  Shield,
  LogOut,
  Search,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/new-investigation', icon: Plus, label: 'New Investigation' },
  { to: '/cases', icon: FolderSearch, label: 'Cases' },
  { to: '/graph', icon: Network, label: 'Graph Intelligence' },
  { to: '/alerts', icon: Bell, label: 'Alerts Center' },
  { to: '/admin', icon: Shield, label: 'Admin Panel' },
];

const AppSidebar = () => {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border flex flex-col z-50">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-primary/20 flex items-center justify-center">
            <Search className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-sm font-bold text-foreground tracking-wider">OSIRIS</h1>
            <p className="text-[10px] text-muted-foreground tracking-widest uppercase">Intelligence Platform</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(item => {
          const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + '/');
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all ${
                isActive
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground border border-transparent'
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          );
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
    </aside>
  );
};

export default AppSidebar;
