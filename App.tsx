
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
import Applications from './pages/Applications';
import Screenings from './pages/Screenings';
import AdminApplications from './pages/AdminApplications';
import Profile from './pages/Profile';
import { Home, Building2, Wrench, CreditCard, LogOut, Menu, X, Shield, FileText, Bell, Table, Building, ClipboardCheck, UserPlus, User as UserIcon } from 'lucide-react';

const SplashScreen: React.FC = () => (
  <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center text-white transition-opacity duration-1000 overflow-hidden">
    <video 
      autoPlay muted loop playsInline 
      className="absolute inset-0 w-full h-full object-cover scale-105 opacity-40"
    >
      <source src="https://assets.mixkit.co/videos/preview/mixkit-drone-view-of-a-mansion-with-a-pool-and-garden-4286-large.mp4" type="video/mp4" />
    </video>
    <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>
    <div className="relative z-10 animate-pulse-gentle flex flex-col items-center text-center px-6">
      <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl mb-8 transform hover:scale-105 transition-transform duration-500">
        <Home size={64} className="text-blue-600" />
      </div>
      <h1 className="text-6xl font-black tracking-tighter mb-2 drop-shadow-xl text-white">PMS</h1>
      <p className="text-blue-400 font-bold tracking-[0.4em] uppercase text-xs">Modern Property Suite</p>
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
    const timer = setTimeout(() => {
      const store = getStore();
      if (store.currentUser) {
        setUser(store.currentUser);
        if (store.currentUser.role === UserRole.ADMIN) setView('admin_dashboard');
        const unread = store.notifications.filter(n => n.userId === store.currentUser?.id && !n.isRead).length;
        setUnreadCount(unread);
      }
      setIsLoading(false);
    }, 2000);
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

  const renderView = () => {
    if (!user) return <Login onLogin={handleLogin} />;
    
    switch (view) {
      case 'admin_dashboard': return <AdminDashboard user={user} onNavigate={setView} />;
      case 'dashboard': return <Dashboard user={user} />;
      case 'properties': return <Properties user={user} />;
      case 'maintenance': return <Maintenance user={user} />;
      case 'payments': return <Payments user={user} />;
      case 'agreements': return <Agreements user={user} />;
      case 'notifications': return <Notifications user={user} onRefreshCount={refreshUnreadCount} onNavigate={setView} />;
      case 'reports': return <Reports user={user} />;
      case 'applications': return <Applications user={user} onNavigate={setView} />;
      case 'screenings': return <Screenings user={user} onNavigate={setView} />;
      case 'admin_applications': return <AdminApplications user={user} onBack={() => setView('admin_dashboard')} />;
      case 'profile': return <Profile user={user} onUserUpdate={setUser} />;
      default: return <Dashboard user={user} />;
    }
  };

  const navItems = [
    { id: 'admin_dashboard', label: 'Admin Panel', icon: Shield, roles: [UserRole.ADMIN] },
    { id: 'dashboard', label: 'Overview', icon: Home, roles: [UserRole.AGENT, UserRole.TENANT] },
    { id: 'properties', label: 'Properties', icon: Building2, roles: [UserRole.AGENT, UserRole.ADMIN, UserRole.TENANT] },
    { id: 'applications', label: 'Apply Now', icon: UserPlus, roles: [UserRole.TENANT] },
    { id: 'screenings', label: 'Screenings', icon: ClipboardCheck, roles: [UserRole.AGENT, UserRole.ADMIN] },
    { id: 'agreements', label: 'Agreements', icon: FileText, roles: [UserRole.AGENT, UserRole.TENANT, UserRole.ADMIN] },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench, roles: [UserRole.AGENT, UserRole.TENANT, UserRole.ADMIN] },
    { id: 'payments', label: 'Rent & Payments', icon: CreditCard, roles: [UserRole.AGENT, UserRole.TENANT, UserRole.ADMIN] },
    { id: 'reports', label: 'Global Registry', icon: Table, roles: [UserRole.AGENT, UserRole.ADMIN] },
    { id: 'notifications', label: 'Notifications', icon: Bell, roles: [UserRole.AGENT, UserRole.TENANT, UserRole.ADMIN], badge: unreadCount },
    { id: 'profile', label: 'My Profile', icon: UserIcon, roles: [UserRole.AGENT, UserRole.TENANT, UserRole.ADMIN] },
  ];

  if (isLoading) return <SplashScreen />;
  if (!user) return <Login onLogin={handleLogin} />;

  return (
    <div className="flex flex-col md:flex-row h-screen bg-black text-white animate-in fade-in duration-700">
      <div className="md:hidden flex items-center justify-between bg-zinc-900 text-white p-4">
        <div className="flex items-center gap-2">
           <Home size={20} className="text-blue-600" />
           <h1 className="font-black text-xl tracking-tighter">PMS</h1>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <aside className={`${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-zinc-950 text-zinc-100 transition-transform md:translate-x-0 md:static md:inset-auto print:hidden shadow-2xl border-r border-zinc-800`}>
        <div className="p-6 h-full flex flex-col">
          <div className="hidden md:block mb-10 text-center">
            <div className="inline-block bg-white/5 p-4 rounded-[1.5rem] mb-3 border border-white/10">
               <Home className="text-blue-600" size={32} />
            </div>
            <h1 className="text-3xl font-black tracking-tighter text-white">PMS</h1>
            <p className="text-[10px] text-zinc-500 uppercase mt-1 tracking-widest font-black">Lifecycle Manager</p>
          </div>
          <nav className="space-y-1.5 flex-1 overflow-y-auto">
            {navItems.filter(item => item.roles.includes(user.role)).map(item => (
              <button
                key={item.id}
                onClick={() => { setView(item.id); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center px-4 py-3.5 text-sm font-bold rounded-2xl transition-all relative ${view === item.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/40 translate-x-1' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
              >
                <item.icon className={`mr-3 h-5 w-5 ${view === item.id ? 'text-white' : 'text-zinc-500'}`} /> {item.label}
                {item.badge ? (
                  <span className="ml-auto bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-black animate-pulse">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            ))}
          </nav>
          <div className="pt-6 border-t border-zinc-800">
             <div className="px-4 py-3 bg-zinc-900 rounded-2xl mb-4">
                <p className="text-[10px] font-black uppercase text-zinc-500 mb-1">Signed in as</p>
                <p className="text-sm font-bold text-white truncate">{user.name}</p>
             </div>
             <button onClick={handleLogout} className="w-full flex items-center px-4 py-3 text-sm font-bold text-zinc-400 hover:text-rose-400 rounded-2xl transition-colors hover:bg-rose-400/10">
               <LogOut className="mr-3 h-5 w-5" /> Sign Out
             </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto p-4 md:p-8 lg:p-12 print:p-0 bg-black">
        <div className="max-w-6xl mx-auto">{renderView()}</div>
      </main>
    </div>
  );
};

export default App;
