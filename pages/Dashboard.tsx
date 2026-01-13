import React, { useMemo } from 'react';
import { User, UserRole, PropertyStatus, TicketStatus, NotificationType, ApplicationStatus } from '../types';
import { getStore } from '../store';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Building, Users, AlertTriangle, TrendingUp, Clock, FileText, Wrench, Bell, UserPlus } from 'lucide-react';

interface DashboardProps {
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const store = getStore();
  const isDark = store.theme === 'dark';

  const stats = useMemo(() => {
    if (user.role === UserRole.AGENT) {
      return {
        totalProperties: store.properties.filter(p => p.agentId === user.id).length,
        occupiedProperties: store.properties.filter(p => p.agentId === user.id && p.status === PropertyStatus.OCCUPIED).length,
        pendingTickets: store.tickets.filter(t => t.status === TicketStatus.OPEN).length, 
        monthlyRevenue: store.payments.filter(p => p.status === 'paid').reduce((acc, curr) => acc + curr.amount, 0),
        pendingApps: store.applications.filter(a => a.agentId === user.id && a.status === ApplicationStatus.PENDING).length
      };
    } else {
      const myProperty = store.properties.find(p => p.id === user.assignedPropertyId);
      const myTickets = store.tickets.filter(t => t.tenantId === user.id);
      const myPayments = store.payments.filter(p => p.tenantId === user.id);
      return {
        propertyName: myProperty?.name || 'N/A',
        rentStatus: myPayments.find(p => p.status === 'pending') ? 'Pending' : 'Paid',
        activeTickets: myTickets.filter(t => t.status !== TicketStatus.RESOLVED).length,
        leaseExpiry: store.agreements.find(a => a.tenantId === user.id)?.endDate || 'N/A'
      };
    }
  }, [user, store]);

  const recentNotifications = useMemo(() => {
    return store.notifications
      .filter(n => n.userId === user.id)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 3);
  }, [store.notifications, user.id]);

  const paymentData = useMemo(() => {
    return [
      { name: 'Jan', amount: 4000000 },
      { name: 'Feb', amount: 3000000 },
      { name: 'Mar', amount: 2000000 },
      { name: 'Apr', amount: 2780000 },
      { name: 'May', amount: 1890000 },
      { name: 'Jun', amount: 2390000 },
    ];
  }, []);

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <header>
        <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tighter">Overview</h1>
        <p className="text-zinc-400 font-medium tracking-tight">Monitoring {user.name}'s space assets.</p>
      </header>

      {/* Top Stats - Pure White Surfaces (90% Paper Logic) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {user.role === UserRole.AGENT ? (
          <>
            <StatCard label="Portfolio" value={stats.totalProperties} icon={Building} />
            <StatCard label="Pipeline" value={stats.pendingApps} icon={UserPlus} />
            <StatCard label="Repairs" value={stats.pendingTickets} icon={AlertTriangle} />
            <StatCard label="Revenue" value={`₦${(stats.monthlyRevenue / 1000000).toFixed(1)}M`} icon={TrendingUp} />
          </>
        ) : (
          <>
            <StatCard label="Property" value={stats.propertyName} icon={Building} />
            <StatCard label="Rent Status" value={stats.rentStatus} icon={Clock} />
            <StatCard label="Maintenance" value={stats.activeTickets} icon={Wrench} />
            <StatCard label="Expiry" value={stats.leaseExpiry} icon={FileText} />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Chart Card - 90/10 Ratio with blue bars */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] shadow-sm border border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-900 dark:text-white">Revenue Lifecycle</h3>
            <div className="bg-offwhite dark:bg-black px-4 py-2 rounded-xl text-[10px] font-black uppercase text-zinc-400">Monthly Yield</div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={paymentData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#222" : "#F3F4F6"} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: isDark ? '#444' : '#9CA3AF', fontSize: 10, fontWeight: 'bold'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: isDark ? '#444' : '#9CA3AF', fontSize: 10, fontWeight: 'bold'}} />
                <Tooltip 
                  cursor={{fill: isDark ? '#111' : '#F9FAFB'}}
                  contentStyle={{backgroundColor: isDark ? '#000' : '#FFF', borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)'}}
                  itemStyle={{color: '#2563EB', fontWeight: 'bold'}}
                />
                <Bar dataKey="amount" fill="#2563EB" radius={[10, 10, 10, 10]} barSize={26} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Notifications Card - 90/10 Logic: Clean list with blue accents */}
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] shadow-sm border border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-900 dark:text-white">Alert Registry</h3>
            <Bell className="w-4 h-4 text-blue-600" />
          </div>
          <div className="space-y-4">
            {recentNotifications.length > 0 ? recentNotifications.map(notification => (
                <AlertItem 
                    key={notification.id}
                    title={notification.title} 
                    desc={notification.message} 
                    time={new Date(notification.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
                />
            )) : (
                <div className="text-center py-16">
                    <p className="text-zinc-300 text-xs font-black uppercase tracking-widest">Quiet Hub</p>
                </div>
            )}
          </div>
          <button className="w-full mt-10 text-[9px] font-black uppercase tracking-[0.3em] text-blue-600 hover:text-zinc-900 dark:hover:text-white transition-colors">
              Access Full Archive
          </button>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon }: any) => {
  return (
    <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm hover:border-blue-200 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.1em]">{label}</p>
        <Icon className="w-4 h-4 text-blue-600" />
      </div>
      <p className="text-xl font-black text-zinc-900 dark:text-white truncate tracking-tighter">{value}</p>
    </div>
  );
};

const AlertItem = ({ title, desc, time }: any) => {
  return (
    <div className="p-4 bg-offwhite dark:bg-black rounded-2xl border border-zinc-100 dark:border-zinc-800">
      <div className="flex justify-between items-start mb-1">
        <h4 className="text-[9px] font-black uppercase text-zinc-900 dark:text-white tracking-tight">{title}</h4>
        <span className="text-[9px] text-zinc-400 font-bold">{time}</span>
      </div>
      <p className="text-[10px] leading-relaxed text-zinc-500 line-clamp-1">{desc}</p>
    </div>
  );
};

export default Dashboard;