import React, { useState } from 'react';
import { User, UserRole, MaintenanceTicket, TicketStatus, TicketPriority, NotificationType } from '../types';
import { getStore, saveStore } from '../store';
import { Plus, CheckCircle2, Clock, AlertCircle, Wrench, X, ChevronDown } from 'lucide-react';

interface MaintenanceProps {
  user: User;
}

const Maintenance: React.FC<MaintenanceProps> = ({ user }) => {
  const [store, setStore] = useState(getStore());
  const [tickets, setTickets] = useState<MaintenanceTicket[]>(
    user.role === UserRole.AGENT || user.role === UserRole.ADMIN
      ? store.tickets 
      : store.tickets.filter(t => t.tenantId === user.id)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newIssue, setNewIssue] = useState('');

  const handleSubmit = async () => {
    if (!newIssue) return;
    setIsSubmitting(true);
    
    setTimeout(() => {
      const freshTicket: MaintenanceTicket = {
        id: `t${Date.now()}`,
        propertyId: user.assignedPropertyId || 'p1',
        tenantId: user.id,
        issue: newIssue,
        status: TicketStatus.OPEN,
        priority: TicketPriority.MEDIUM,
        createdAt: new Date().toISOString(),
      };

      const newState = { 
          ...store, 
          tickets: [freshTicket, ...store.tickets],
          notifications: [{
            id: `n_t_${Date.now()}`,
            userId: 'u1', 
            title: 'Maintenance Logged',
            message: `A new repair request has been filed for Unit ${freshTicket.propertyId}.`,
            type: NotificationType.INFO,
            timestamp: new Date().toISOString(),
            isRead: false,
            linkTo: 'maintenance'
          }, ...store.notifications]
      };
      saveStore(newState);
      setStore(newState);
      setTickets([freshTicket, ...tickets]);
      setNewIssue('');
      setIsSubmitting(false);
    }, 1000);
  };

  const handleUpdateStatus = (ticketId: string, newStatus: TicketStatus) => {
    const updatedTickets = store.tickets.map(t => t.id === ticketId ? { ...t, status: newStatus } : t);
    const ticket = store.tickets.find(t => t.id === ticketId);
    if (!ticket) return;

    const newState = { 
        ...store, 
        tickets: updatedTickets,
        notifications: [{
            id: `n_ts_${Date.now()}`,
            userId: ticket.tenantId,
            title: 'Ticket Status Updated',
            message: `Request #${ticket.id} is now ${newStatus.replace('_', ' ')}.`,
            type: NotificationType.INFO,
            timestamp: new Date().toISOString(),
            isRead: false
        }, ...store.notifications]
    };
    saveStore(newState);
    setStore(newState);
    setTickets(user.role === UserRole.TENANT ? updatedTickets.filter(t => t.tenantId === user.id) : updatedTickets);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <header className="flex justify-between items-center px-1">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter">Support Tickets</h1>
          <p className="text-zinc-400 font-medium">Official infrastructure repair tracking.</p>
        </div>
        {user.role === UserRole.TENANT && (
          <button 
            onClick={() => setIsSubmitting(true)} 
            className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center shadow-lg shadow-blue-600/20 transform active:scale-95 transition-all"
          >
            <Plus size={16} className="mr-2" /> Log Issue
          </button>
        )}
      </header>

      {isSubmitting && (
        <div className="bg-white dark:bg-zinc-900 p-8 md:p-12 rounded-[3rem] border border-zinc-100 dark:border-white/10 shadow-2xl animate-in zoom-in-95">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-black text-2xl text-zinc-900 dark:text-white">New Repair Request</h3>
            <button onClick={() => setIsSubmitting(false)} className="text-zinc-400 hover:text-rose-500 p-2">
              <X size={24} />
            </button>
          </div>
          <textarea 
            className="w-full p-8 bg-offwhite dark:bg-black border-2 border-zinc-50 dark:border-zinc-800 rounded-[2.5rem] h-44 outline-none focus:ring-4 focus:ring-blue-600/10 mb-8 text-lg font-bold text-zinc-900 dark:text-white resize-none" 
            placeholder="Describe the fault clearly..." 
            value={newIssue} 
            onChange={e => setNewIssue(e.target.value)} 
          />
          <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={handleSubmit} disabled={!newIssue} className="flex-[2] bg-blue-600 text-white px-8 py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-100 disabled:opacity-50">Submit Ticket</button>
            <button onClick={() => setIsSubmitting(false)} className="flex-1 text-zinc-400 font-black uppercase tracking-widest text-xs px-4 bg-offwhite dark:bg-zinc-800 rounded-2xl hover:bg-zinc-100 transition-colors">Discard</button>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {tickets.map(ticket => (
          <div key={ticket.id} className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row justify-between items-center gap-8 group hover:border-blue-200 transition-all duration-300">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[9px] font-black uppercase text-zinc-400 tracking-widest">ID: {ticket.id.slice(-4)}</span>
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${ticket.priority === 'EMERGENCY' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-offwhite dark:bg-zinc-800 text-zinc-400 border border-zinc-100'}`}>{ticket.priority}</span>
              </div>
              <h4 className="text-xl font-black text-zinc-900 dark:text-white mb-2 leading-tight">{ticket.issue}</h4>
              <div className="flex items-center gap-4 text-[9px] text-zinc-400 font-black uppercase tracking-widest">
                <span>Unit: {ticket.propertyId}</span>
                <span className="w-1 h-1 bg-zinc-200 rounded-full"></span>
                <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
               <span className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase flex-1 md:flex-none text-center shadow-sm ${ticket.status === 'RESOLVED' ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'}`}>{ticket.status.replace('_', ' ')}</span>
               {(user.role === UserRole.AGENT || user.role === UserRole.ADMIN) && (
                 <div className="relative flex-1 md:flex-none">
                    <select className="appearance-none bg-offwhite dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-2xl px-6 py-3 pr-10 text-[9px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-blue-600" value={ticket.status} onChange={e => handleUpdateStatus(ticket.id, e.target.value as TicketStatus)}>
                      <option value={TicketStatus.OPEN}>OPEN</option>
                      <option value={TicketStatus.IN_PROGRESS}>IN PROGRESS</option>
                      <option value={TicketStatus.RESOLVED}>RESOLVED</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                 </div>
               )}
            </div>
          </div>
        ))}
        {tickets.length === 0 && (
          <div className="text-center py-24 bg-white dark:bg-zinc-950 rounded-[4rem] border-2 border-dashed border-zinc-100 dark:border-zinc-800">
            <Wrench className="w-12 h-12 text-zinc-100 dark:text-zinc-800 mx-auto mb-6" />
            <p className="text-zinc-300 font-black uppercase tracking-widest text-[10px]">Registry Empty</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Maintenance;