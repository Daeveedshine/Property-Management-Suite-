
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
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-black text-white">Welcome back, {user.name}</h1>
        <p className="text-zinc-500 font-medium">Global property intelligence at your fingertips.</p>
      </header>

      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {user.role === UserRole.AGENT ? (
          <>
            <StatCard label="My Portfolio" value={stats.totalProperties} icon={Building} color="blue" />
            <StatCard label="Pending Applications" value={stats.pendingApps} icon={UserPlus} color="emerald" />
            <StatCard label="Open Maintenance" value={stats.pendingTickets} icon={AlertTriangle} color="amber" />
            <StatCard label="Total Annual Revenue" value={`₦${stats.monthlyRevenue.toLocaleString()}`} icon={TrendingUp} color="blue" />
          </>
        ) : (
          <>
            <StatCard label="Assigned Property" value={stats.propertyName} icon={Building} color="blue" />
            <StatCard label="Rent Status" value={stats.rentStatus} icon={Clock} color={stats.rentStatus === 'Paid' ? 'emerald' : 'amber'} />
            <StatCard label="Active Maintenance" value={stats.activeTickets} icon={Wrench} color="blue" />
            <StatCard label="Lease Expiry" value={stats.leaseExpiry} icon={FileText} color="zinc" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="lg:col-span-2 bg-zinc-900 p-6 rounded-[2rem] shadow-2xl border border-zinc-800">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">Financial Performance (₦)</h3>
            <select className="text-sm bg-black border border-zinc-800 rounded-xl px-3 py-1 outline-none text-zinc-400">
              <option>Last 6 months</option>
              <option>Last year</option>
            </select>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={paymentData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333333" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#666666', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#666666', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#111111'}}
                  contentStyle={{backgroundColor: '#000000', borderRadius: '12px', border: '1px solid #333333', boxShadow: '0 4px 12px rgba(0,0,0,0.5)'}}
                />
                <Bar dataKey="amount" fill="#2563EB" radius={[8, 8, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Notifications */}
        <div className="bg-zinc-900 p-6 rounded-[2rem] shadow-2xl border border-zinc-800">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">Critical Alerts</h3>
            <Bell className="w-5 h-5 text-blue-600" />
          </div>
          <div className="space-y-4">
            {recentNotifications.length > 0 ? recentNotifications.map(notification => (
                <AlertItem 
                    key={notification.id}
                    title={notification.title} 
                    desc={notification.message} 
                    type={notification.type} 
                    time={new Date(notification.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
                    isRead={notification.isRead}
                />
            )) : (
                <div className="text-center py-10">
                    <p className="text-zinc-600 text-sm italic">No recent alerts</p>
                </div>
            )}
          </div>
          {recentNotifications.length > 0 && (
            <button className="w-full mt-6 text-xs font-black uppercase tracking-widest text-white hover:text-blue-400 transition-colors py-4 bg-zinc-800 rounded-2xl">
                View All Notifications
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, color }: any) => {
  const colors: any = {
    blue: 'bg-blue-600/10 text-blue-500',
    emerald: 'bg-emerald-600/10 text-emerald-500',
    amber: 'bg-amber-600/10 text-amber-500',
    zinc: 'bg-zinc-600/10 text-zinc-400',
  };

  return (
    <div className="bg-zinc-900 p-6 rounded-[2rem] border border-zinc-800 shadow-xl flex items-center space-x-4">
      <div className={`p-4 rounded-2xl ${colors[color] || colors.blue}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-xl font-black text-white truncate leading-tight">{value}</p>
      </div>
    </div>
  );
};

const AlertItem = ({ title, desc, type, time, isRead }: any) => {
  const styles: any = {
    WARNING: 'border-amber-900/50 bg-amber-950/20 text-amber-200',
    INFO: 'border-blue-900/50 bg-blue-950/20 text-blue-200',
    ERROR: 'border-rose-900/50 bg-rose-950/20 text-rose-200',
    SUCCESS: 'border-emerald-900/50 bg-emerald-950/20 text-emerald-200',
  };
  return (
    <div className={`p-4 border rounded-2xl transition-all ${styles[type] || styles.INFO} ${isRead ? 'opacity-40' : 'shadow-lg border-zinc-700'}`}>
      <div className="flex justify-between items-start mb-1">
        <h4 className="text-xs font-black uppercase tracking-tight">{title}</h4>
        <span className="text-[10px] text-zinc-500 font-bold">{time}</span>
      </div>
      <p className="text-[11px] text-zinc-400 leading-relaxed line-clamp-2">{desc}</p>
    </div>
  );
};

export default Dashboard;
