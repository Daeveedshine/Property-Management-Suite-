
import React, { useState, useEffect } from 'react';
import { User, UserRole } from './types';
import { getStore, saveStore } from './store';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Properties from './pages/Properties';
import Maintenance from './pages/Maintenance';
import Payments from './pages/Payments';
import Agreements from './pages/Agreements';
import Notifications from './pages/Notifications';
import Reports from './pages/Reports';
import { Home, Building2, Wrench, CreditCard, LogOut, Menu, X, Shield, FileText, Bell, Table, Building } from 'lucide-react';

const SplashScreen: React.FC = () => (
  <div className="fixed inset-0 z-[9999] bg-indigo-600 flex flex-col items-center justify-center text-white transition-opacity duration-1000">
    <div className="animate-pulse-gentle flex flex-col items-center">
      <div className="bg-white/10 p-6 rounded-3xl backdrop-blur-md mb-6 border border-white/20">
        <Building size={64} className="text-white" />
      </div>
      <h1 className="text-4xl font-black tracking-tight mb-2">PMS</h1>
      <p className="text-indigo-100/70 font-medium tracking-widest uppercase text-xs">Property Management Suit</p>
    </div>
    <div className="absolute bottom-12 flex items-center space-x-2 text-indigo-200/50">
      <div className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '0ms' }}></div>
      <div className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '150ms' }}></div>
      <div className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '300ms' }}></div>
    </div>
  </div>
);

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initial loading simulation for splash screen
    const timer = setTimeout(() => {
      const store = getStore();
      if (store.currentUser) {
        setUser(store.currentUser);
        if (store.currentUser.role === UserRole.ADMIN) setView('admin_dashboard');
        
        const unread = store.notifications.filter(n => n.userId === store.currentUser?.id && !n.isRead).length;
        setUnreadCount(unread);
      }
      setIsLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const refreshUnreadCount = () => {
    const store = getStore();
    if (user) {
      const unread = store.notifications.filter(n => n.userId === user.id && !n.isRead).length;
      setUnreadCount(unread);
    }
  };

  const handleLogin = (loggedUser: User) => {
    const store = getStore();
    store.currentUser = loggedUser;
    saveStore(store);
    setUser(loggedUser);
    setView(loggedUser.role === UserRole.ADMIN ? 'admin_dashboard' : 'dashboard');
    refreshUnreadCount();
  };

  const handleLogout = () => {
    const store = getStore();
    store.currentUser = null;
    saveStore(store);
    setUser(null);
  };

  if (isLoading) {
    return <SplashScreen />;
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const renderView = () => {
    switch (view) {
      case 'admin_dashboard': return <AdminDashboard user={user} />;
      case 'dashboard': return <Dashboard user={user} />;
      case 'properties': return <Properties user={user} />;
      case 'maintenance': return <Maintenance user={user} />;
      case 'payments': return <Payments user={user} />;
      case 'agreements': return <Agreements user={user} />;
      case 'notifications': return <Notifications user={user} onRefreshCount={refreshUnreadCount} onNavigate={setView} />;
      case 'reports': return <Reports user={user} />;
      default: return user.role === UserRole.ADMIN ? <AdminDashboard user={user} /> : <Dashboard user={user} />;
    }
  };

  const navItems = [
    { id: 'admin_dashboard', label: 'Admin Panel', icon: Shield, roles: [UserRole.ADMIN] },
    { id: 'dashboard', label: 'Overview', icon: Home, roles: [UserRole.AGENT, UserRole.TENANT] },
    { id: 'properties', label: 'Properties', icon: Building2, roles: [UserRole.AGENT, UserRole.ADMIN, UserRole.TENANT] },
    { id: 'agreements', label: 'Agreements', icon: FileText, roles: [UserRole.AGENT, UserRole.TENANT, UserRole.ADMIN] },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench, roles: [UserRole.AGENT, UserRole.TENANT, UserRole.ADMIN] },
    { id: 'payments', label: 'Rent & Payments', icon: CreditCard, roles: [UserRole.AGENT, UserRole.TENANT, UserRole.ADMIN] },
    { id: 'reports', label: 'Full Sheet (Reports)', icon: Table, roles: [UserRole.AGENT, UserRole.ADMIN] },
    { id: 'notifications', label: 'Notifications', icon: Bell, roles: [UserRole.AGENT, UserRole.TENANT, UserRole.ADMIN], badge: unreadCount },
  ];

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-50 animate-in fade-in duration-700">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between bg-indigo-600 text-white p-4">
        <h1 className="font-black text-xl tracking-tight">PMS</h1>
        <div className="flex items-center space-x-4">
            <button onClick={() => setView('notifications')} className="relative">
                <Bell size={24} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center border-2 border-indigo-600">
                        {unreadCount}
                    </span>
                )}
            </button>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside className={`
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
        fixed inset-y-0 left-0 z-50 w-64 bg-indigo-900 text-indigo-100 transition-transform md:translate-x-0 md:static md:inset-auto
      `}>
        <div className="p-6 h-full flex flex-col">
          <div className="hidden md:block mb-8">
            <h1 className="text-3xl font-black tracking-tight flex items-center">
              <Building className="mr-2 text-indigo-400" size={28} />
              PMS
            </h1>
            <p className="text-[10px] text-indigo-300 uppercase mt-1 tracking-widest font-bold opacity-80">Property Suit</p>
          </div>

          <nav className="space-y-1 flex-1 overflow-y-auto">
            {navItems.filter(item => item.roles.includes(user.role)).map(item => (
              <button
                key={item.id}
                onClick={() => { setView(item.id); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors relative ${view === item.id ? 'bg-indigo-800 text-white shadow-inner' : 'hover:bg-indigo-800/50 hover:text-white'}`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.label}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 bg-rose-500 text-white text-[10px] font-bold h-5 min-w-[20px] px-1 rounded-full flex items-center justify-center border border-indigo-900">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div className="pt-4 border-t border-indigo-800">
            <div className="px-4 py-2">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-indigo-300 capitalize">{user.role.toLowerCase()}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full mt-2 flex items-center px-4 py-3 text-sm font-medium text-indigo-300 hover:text-white rounded-lg hover:bg-indigo-800/50"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default App;
