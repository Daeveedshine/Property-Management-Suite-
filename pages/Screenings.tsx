
import React, { useState, useMemo } from 'react';
import { User, UserRole, TenantApplication, ApplicationStatus, NotificationType } from '../types';
import { getStore, saveStore } from '../store';
import { ClipboardCheck, User as UserIcon, Building, DollarSign, Phone, CheckCircle, XCircle, ShieldAlert, TrendingUp, Search } from 'lucide-react';

interface ScreeningsProps {
  user: User;
  onNavigate: (view: string) => void;
}

const Screenings: React.FC<ScreeningsProps> = ({ user, onNavigate }) => {
  const [store, setStore] = useState(getStore());
  const [selectedApp, setSelectedApp] = useState<TenantApplication | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Agents only see applications routed to them; Admins see everything
  const relevantApps = useMemo(() => {
    if (user.role === UserRole.ADMIN) return store.applications;
    return store.applications.filter(app => app.agentId === user.id);
  }, [store.applications, user.id, user.role]);

  const handleUpdateStatus = (id: string, status: ApplicationStatus) => {
    const updatedApps = store.applications.map(app => app.id === id ? { ...app, status } : app);
    const app = store.applications.find(a => a.id === id);
    if (!app) return;

    const notification = {
      id: `n_app_${Date.now()}`,
      userId: app.userId,
      title: `Application Update`,
      message: `Your application for ${app.propertyId} has been marked as ${status.toLowerCase()}.`,
      type: status === ApplicationStatus.APPROVED ? NotificationType.SUCCESS : NotificationType.INFO,
      timestamp: new Date().toISOString(),
      isRead: false
    };

    const newState = { ...store, applications: updatedApps, notifications: [notification, ...store.notifications] };
    saveStore(newState);
    setStore(newState);
    setSelectedApp(null);
  };

  const filteredApps = relevantApps.filter(app => 
    app.personalInfo.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || app.id.includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Candidate Vetting</h1>
          <p className="text-zinc-500 text-sm">Review tenant profiles and financial data.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
          <input type="text" placeholder="Search registry..." className="pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-600 text-white" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-4">
          {filteredApps.map(app => (
            <button key={app.id} onClick={() => setSelectedApp(app)} className={`w-full text-left p-6 rounded-[2rem] border transition-all ${selectedApp?.id === app.id ? 'bg-blue-600 text-white border-blue-600 shadow-2xl scale-[1.02]' : 'bg-zinc-900 text-white border-zinc-800 hover:border-blue-500/50 shadow-sm'}`}>
              <div className="flex justify-between items-start mb-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${app.status === 'PENDING' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>{app.status}</span>
                <span className="text-[10px] font-bold opacity-60">{new Date(app.submissionDate).toLocaleDateString()}</span>
              </div>
              <h4 className="font-black text-xl mb-1">{app.personalInfo.fullName}</h4>
              <p className={`text-xs font-bold mb-4 opacity-70`}>{app.employment.employer}</p>
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                 <span className="text-[10px] font-black uppercase tracking-widest">Trust Index: {app.riskScore}%</span>
                 <div className="w-16 h-1.5 bg-white/20 rounded-full overflow-hidden"><div className="h-full bg-emerald-400" style={{width: `${app.riskScore}%`}}></div></div>
              </div>
            </button>
          ))}
          {filteredApps.length === 0 && (
            <div className="p-8 text-center bg-zinc-900/50 rounded-3xl border border-zinc-800 border-dashed">
              <p className="text-zinc-500 text-sm font-bold">No candidate profiles found.</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          {selectedApp ? (
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl overflow-hidden animate-in slide-in-from-right-10">
               <div className="bg-slate-900 p-8 text-white flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="flex items-center gap-5">
                     <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10"><UserIcon size={32} /></div>
                     <div><h2 className="text-3xl font-black">{selectedApp.personalInfo.fullName}</h2><p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">{selectedApp.personalInfo.phone}</p></div>
                  </div>
                  <div className="text-center px-6 py-3 bg-white/5 rounded-2xl border border-white/10">
                     <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-1">Stability Rating</p>
                     <p className="text-4xl font-black text-emerald-400">{selectedApp.riskScore}%</p>
                  </div>
               </div>
               <div className="p-10 space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                     <section className="space-y-4">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] border-b pb-2">Financial Records</h3>
                        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                           <p className="text-[10px] font-bold text-slate-400 uppercase">Employment Details</p>
                           <p className="text-slate-900 font-black mb-2">{selectedApp.employment.jobTitle} @ {selectedApp.employment.employer}</p>
                           <p className="text-2xl font-black text-blue-600">${selectedApp.employment.monthlyIncome.toLocaleString()}</p>
                        </div>
                     </section>
                     <section className="space-y-4">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] border-b pb-2">Compliance Check</h3>
                        <div className="grid grid-cols-1 gap-2">
                           <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 text-xs font-black"><CheckCircle size={14} /> IDENTITY VERIFIED</div>
                           <div className="flex items-center gap-2 p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 text-xs font-black"><DollarSign size={14} /> INCOME STATEMENT LOGGED</div>
                        </div>
                     </section>
                  </div>
                  <div className="pt-8 border-t flex gap-4">
                     <button onClick={() => handleUpdateStatus(selectedApp.id, ApplicationStatus.APPROVED)} className="flex-1 bg-emerald-600 text-white py-5 rounded-2xl font-black shadow-xl shadow-emerald-100/40 hover:bg-emerald-700 transition-all">APPROVE TENANCY</button>
                     <button onClick={() => handleUpdateStatus(selectedApp.id, ApplicationStatus.REJECTED)} className="flex-1 bg-white border-2 border-slate-100 text-slate-400 py-5 rounded-2xl font-black hover:text-rose-500 hover:border-rose-100 transition-all">REJECT CANDIDATE</button>
                  </div>
               </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-zinc-900/30 rounded-[3rem] border-2 border-dashed border-zinc-800 py-24">
               <ClipboardCheck size={64} className="text-zinc-800 mb-6" />
               <p className="text-zinc-600 font-black uppercase tracking-widest text-sm">Select an application for review</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Screenings;
