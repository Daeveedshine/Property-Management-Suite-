
import React, { useMemo } from 'react';
import { User, UserRole, PropertyStatus, TicketStatus, NotificationType } from '../types';
import { getStore } from '../store';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Building, Users, AlertTriangle, TrendingUp, Clock, FileText, Wrench, Bell } from 'lucide-react';

interface DashboardProps {
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const store = getStore();

  const stats = useMemo(() => {
    if (user.role === UserRole.AGENT) {
      return {
        totalProperties: store.properties.length,
        occupiedProperties: store.properties.filter(p => p.status === PropertyStatus.OCCUPIED).length,
        pendingTickets: store.tickets.filter(t => t.status === TicketStatus.OPEN).length,
        monthlyRevenue: store.payments.filter(p => p.status === 'paid').reduce((acc, curr) => acc + curr.amount, 0),
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
      { name: 'Jan', amount: 4000 },
      { name: 'Feb', amount: 3000 },
      { name: 'Mar', amount: 2000 },
      { name: 'Apr', amount: 2780 },
      { name: 'May', amount: 1890 },
      { name: 'Jun', amount: 2390 },
    ];
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-2xl font-bold text-slate-800">Welcome back, {user.name}</h1>
        <p className="text-slate-500">Here's what's happening today in your property network.</p>
      </header>

      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {user.role === UserRole.AGENT ? (
          <>
            <StatCard label="Total Properties" value={stats.totalProperties} icon={Building} color="indigo" />
            <StatCard label="Occupied" value={stats.occupiedProperties} icon={Users} color="emerald" />
            <StatCard label="Open Tickets" value={stats.pendingTickets} icon={AlertTriangle} color="amber" />
            <StatCard label="Total Revenue" value={`$${stats.monthlyRevenue.toLocaleString()}`} icon={TrendingUp} color="blue" />
          </>
        ) : (
          <>
            <StatCard label="Assigned Property" value={stats.propertyName} icon={Building} color="indigo" />
            <StatCard label="Rent Status" value={stats.rentStatus} icon={Clock} color={stats.rentStatus === 'Paid' ? 'emerald' : 'amber'} />
            <StatCard label="Active Maintenance" value={stats.activeTickets} icon={Wrench} color="blue" />
            <StatCard label="Lease Expiry" value={stats.leaseExpiry} icon={FileText} color="slate" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800">Financial Performance</h3>
            <select className="text-sm border rounded px-2 py-1 outline-none text-slate-500">
              <option>Last 6 months</option>
              <option>Last year</option>
            </select>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={paymentData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                />
                <Bar dataKey="amount" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Notifications */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800">Recent Alerts</h3>
            <Bell className="w-4 h-4 text-slate-300" />
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
                    <p className="text-slate-400 text-sm italic">No recent alerts</p>
                </div>
            )}
          </div>
          {recentNotifications.length > 0 && (
            <button className="w-full mt-4 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors py-2 bg-indigo-50 rounded-xl">
                View Notification Center
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, color }: any) => {
  const colors: any = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    blue: 'bg-blue-50 text-blue-600',
    slate: 'bg-slate-50 text-slate-600',
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
      <div className={`p-3 rounded-xl ${colors[color] || colors.indigo}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
        <p className="text-xl font-bold text-slate-800 truncate leading-tight">{value}</p>
      </div>
    </div>
  );
};

const AlertItem = ({ title, desc, type, time, isRead }: any) => {
  const styles: any = {
    WARNING: 'border-amber-200 bg-amber-50/50',
    INFO: 'border-blue-200 bg-blue-50/50',
    ERROR: 'border-red-200 bg-red-50/50',
    SUCCESS: 'border-emerald-200 bg-emerald-50/50',
  };
  return (
    <div className={`p-3 border rounded-xl transition-all ${styles[type] || styles.INFO} ${isRead ? 'opacity-60 grayscale-[0.5]' : 'shadow-sm'}`}>
      <div className="flex justify-between items-start">
        <h4 className="text-xs font-bold text-slate-800">{title}</h4>
        <span className="text-[10px] text-slate-500 font-medium">{time}</span>
      </div>
      <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-relaxed">{desc}</p>
    </div>
  );
};

export default Dashboard;
