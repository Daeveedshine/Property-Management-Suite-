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
      <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl mb-8 transform hover:scale-105 transition-transform duration-500">
        <Logo size={64} className="text-blue-600" />
      </div>
      <h1 className="text-6xl font-black tracking-tighter mb-2 drop-shadow-xl text-white">SPACEYA</h1>
      <p className="text-blue-400 font-bold tracking-[0.4em] uppercase text-xs">Space Intelligence Suite</p>
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

  // If no user is logged in, show the Login page full screen without sidebar/header.
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-offwhite text-zinc-900 dark:bg-black dark:text-white transition-colors duration-300 overflow-hidden">
      {/* Mobile Header - 90/10 Logic: Background White, Accents Blue */}
      <div className="md:hidden flex items-center justify-between bg-white dark:bg-zinc-900 p-4 shadow-sm border-b border-zinc-100 dark:border-zinc-800 shrink-0">
        <div className="flex items-center gap-2">
           <Logo size={24} className="text-blue-600" />
           <h1 className="font-black text-xl tracking-tighter">SPACEYA</h1>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-offwhite dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2">
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Sidebar - Monochromatic Paper White for 90% aesthetic */}
      <aside className={`${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-transform md:translate-x-0 md:static md:inset-auto print:hidden border-r border-zinc-100 dark:border-zinc-800 flex flex-col`}>
        <div className="p-6 h-full flex flex-col">
          <div className="hidden md:block mb-10 text-center">
            <div className="inline-block bg-offwhite dark:bg-white/5 p-5 rounded-[1.5rem] mb-3">
               <Logo size={40} className="text-blue-600" />
            </div>
            <h1 className="text-2xl font-black tracking-tighter text-zinc-900 dark:text-white">SPACEYA</h1>
            <p className="text-[10px] text-zinc-400 uppercase mt-1 tracking-[0.3em] font-black">Lifecycle Manager</p>
          </div>

          <nav className="space-y-1 flex-1 overflow-y-auto custom-scrollbar">
            {navItems.filter(item => item.roles.includes(user?.role || UserRole.TENANT)).map(item => (
              <button
                key={item.id}
                onClick={() => { setView(item.id); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center px-4 py-3.5 text-xs font-bold rounded-xl transition-all relative ${view === item.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-zinc-500 dark:text-zinc-400 hover:bg-offwhite dark:hover:bg-white/5 hover:text-blue-600 dark:hover:text-white'}`}
              >
                <item.icon className={`mr-3 h-4 w-4 ${view === item.id ? 'text-white' : 'text-zinc-400'}`} /> {item.label}
                {item.badge ? (
                  <span className="ml-auto bg-blue-600 dark:bg-blue-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-black">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            ))}
          </nav>

          <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 mt-6">
             <button 
               onClick={toggleTheme}
               className="w-full mb-4 flex items-center px-4 py-3 text-xs font-bold text-zinc-400 hover:bg-offwhite dark:hover:bg-white/5 rounded-xl transition-all"
             >
               {theme === 'light' ? <Moon className="mr-3 h-4 w-4" /> : <Sun className="mr-3 h-4 w-4" />}
               Toggle Theme
             </button>
             <button onClick={handleLogout} className="w-full flex items-center px-4 py-3 text-xs font-bold text-zinc-400 hover:text-rose-500 rounded-xl transition-colors">
               <LogOut className="mr-3 h-4 w-4" /> Sign Out
             </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto p-4 md:p-10 lg:p-14 print:p-0 bg-offwhite dark:bg-black transition-colors duration-300">
        <div className="max-w-6xl mx-auto">{renderView()}</div>
      </main>
    </div>
  );
};

export default App;