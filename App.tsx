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
import { Home, Building2, Wrench, CreditCard, LogOut, Menu, X, Shield, FileText, Bell, Table, Building, ClipboardCheck, UserPlus, User as UserIcon, Moon, Sun } from 'lucide-react';

export const Logo: React.FC<{ size?: number, className?: string }> = ({ size = 24, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path 
      d="M50 30V70" 
      stroke="currentColor" 
      strokeWidth="8" 
      strokeLinecap="round"
    />
    <path 
      d="M50 30C50 18.9543 58.9543 10 70 10C81.0457 10 90 18.9543 90 30V50" 
      stroke="currentColor" 
      strokeWidth="8" 
      strokeLinecap="round"
    />
    <path 
      d="M50 70C50 81.0457 41.0457 90 30 90C18.9543 90 10 81.0457 10 70V50" 
      stroke="currentColor" 
      strokeWidth="8" 
      strokeLinecap="round"
    />
    <circle cx="70" cy="30" r="6" fill="currentColor" />
    <circle cx="30" cy="70" r="6" fill="currentColor" />
  </svg>
);

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
      <div className="bg-white/10 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/20 shadow-2xl mb-8 transform hover:scale-105 transition-transform duration-500">
        <Logo size={64} className="text-white" />
      </div>
      <h1 className="text-6xl font-semibold tracking-tighter mb-2 drop-shadow-xl text-white">SPACEYA</h1>
      <p className="text-blue-400 font-playfair tracking-widest text-lg italic">Your Space, Handled</p>
    </div>
  </div>
);

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const store = getStore();
    const savedTheme = store.theme || 'dark';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');

    const timer = setTimeout(() => {
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

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    const store = getStore();
    store.theme = newTheme;
    saveStore(store);
  };

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
    if (!user) return null;
    
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

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex flex-col md:flex-row h-screen text-zinc-900 dark:text-white transition-colors duration-300 overflow-hidden relative">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between glass-card p-4 shadow-sm shrink-0 z-50">
        <div className="flex items-center gap-2">
           <Logo size={24} className="text-blue-600 dark:text-blue-400" />
           <h1 className="font-semibold text-xl tracking-tighter">SPACEYA</h1>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-white/10 dark:bg-black/20 text-zinc-500 dark:text-zinc-400"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2">
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Sidebar - Liquid Glass Style */}
      <aside className={`${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-72 glass-card text-zinc-900 dark:text-zinc-100 transition-transform md:translate-x-0 md:static md:inset-auto print:hidden flex flex-col m-4 rounded-[2.5rem] border-white/20 dark:border-white/5`}>
        <div className="p-8 h-full flex flex-col">
          <div className="hidden md:block mb-10 text-center">
            <div className="inline-block bg-blue-600/10 dark:bg-blue-400/10 p-5 rounded-[1.8rem] mb-4 border border-blue-600/20">
               <Logo size={44} className="text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tighter text-zinc-900 dark:text-white">SPACEYA</h1>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase mt-1 tracking-[0.3em] font-black opacity-60">Property Manager</p>
          </div>

          <nav className="space-y-1.5 flex-1 overflow-y-auto custom-scrollbar px-1">
            {navItems.filter(item => item.roles.includes(user?.role || UserRole.TENANT)).map(item => (
              <button
                key={item.id}
                onClick={() => { setView(item.id); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center px-5 py-4 text-xs font-bold rounded-2xl transition-all relative ${view === item.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20 scale-[1.02]' : 'text-zinc-500 dark:text-zinc-400 hover:bg-white/10 dark:hover:bg-black/30 hover:text-blue-600 dark:hover:text-blue-400'}`}
              >
                <item.icon className={`mr-4 h-4.5 w-4.5 ${view === item.id ? 'text-white' : 'text-zinc-400 group-hover:text-blue-600'}`} /> {item.label}
                {item.badge ? (
                  <span className="ml-auto bg-blue-600 dark:bg-blue-500 text-white text-[9px] px-2 py-0.5 rounded-full font-black border border-white/20">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            ))}
          </nav>

          <div className="pt-6 border-t border-zinc-200 dark:border-white/10 mt-6 space-y-2">
             <button 
               onClick={toggleTheme}
               className="w-full flex items-center px-5 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 hover:bg-white/10 dark:hover:bg-black/30 rounded-2xl transition-all"
             >
               {theme === 'light' ? <Moon className="mr-4 h-4.5 w-4.5" /> : <Sun className="mr-4 h-4.5 w-4.5" />}
               Toggle Theme
             </button>
             <button onClick={handleLogout} className="w-full flex items-center px-5 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 hover:text-rose-500 rounded-2xl transition-colors">
               <LogOut className="mr-4 h-4.5 w-4.5" /> Sign Out
             </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto p-4 md:p-8 lg:p-10 print:p-0 transition-colors duration-300 relative z-10">
        <div className="max-w-6xl mx-auto h-full">{renderView()}</div>
      </main>
    </div>
  );
};

export default App;