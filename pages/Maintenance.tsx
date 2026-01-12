
import React, { useState } from 'react';
import { User, UserRole, MaintenanceTicket, TicketStatus, TicketPriority, NotificationType } from '../types';
import { getStore, saveStore } from '../store';
// Added ChevronDown to the lucide-react imports
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
    <div className="space-y-8 animate-in fade-in duration-500 bg-black">
      <header className="flex justify-between items-center px-1">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Maintenance Tickets</h1>
          <p className="text-zinc-500 font-medium">Official infrastructure repair tracking.</p>
        </div>
        {user.role === UserRole.TENANT && (
          <button onClick={() => setIsSubmitting(true)} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center shadow-2xl shadow-blue-900/20 transform active:scale-95"><Plus size={18} className="mr-2" /> Log Issue</button>
        )}
      </header>

      {isSubmitting && (
        <div className="bg-white p-10 rounded-[3rem] border border-white/20 shadow-2xl animate-in zoom-in-95">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-black text-2xl text-black">New Repair Request</h3>
            <button onClick={() => setIsSubmitting(false)} className="text-zinc-400 hover:text-black">
              <X size={24} />
            </button>
          </div>
          <textarea className="w-full p-8 border-2 border-zinc-100 rounded-[2rem] h-40 outline-none focus:ring-4 focus:ring-blue-600/10 mb-8 text-lg font-bold text-black bg-zinc-50 resize-none" placeholder="Please describe the fault clearly (e.g. leaking sink, electrical trip)..." value={newIssue} onChange={e => setNewIssue(e.target.value)} />
          <div className="flex gap-4">
            <button onClick={handleSubmit} disabled={!newIssue} className="flex-[2] bg-blue-600 text-white px-8 py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-100 disabled:opacity-50">Submit Ticket</button>
            <button onClick={() => setIsSubmitting(false)} className="flex-1 text-zinc-500 font-black uppercase tracking-widest text-xs px-4 bg-zinc-100 rounded-2xl hover:bg-zinc-200">Discard</button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {tickets.map(ticket => (
          <div key={ticket.id} className="bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-800 shadow-xl flex flex-col md:flex-row justify-between items-center gap-8 group hover:border-blue-500/30 transition-all duration-500">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Ticket #{ticket.id.substring(ticket.id.length-4)}</span>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${ticket.priority === 'EMERGENCY' ? 'bg-rose-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}>{ticket.priority}</span>
              </div>
              <h4 className="text-2xl font-black text-white mb-2 leading-tight">{ticket.issue}</h4>
              <div className="flex items-center gap-4 text-[10px] text-zinc-600 font-black uppercase tracking-widest">
                <span>Logged {new Date(ticket.createdAt).toLocaleDateString()}</span>
                <span className="w-1.5 h-1.5 bg-zinc-800 rounded-full"></span>
                <span>Unit ID: {ticket.propertyId}</span>
              </div>
            </div>
            <div className="flex items-center gap-6 w-full md:w-auto">
               <span className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase flex-1 md:flex-none text-center ${ticket.status === 'RESOLVED' ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'}`}>{ticket.status.replace('_', ' ')}</span>
               {(user.role === UserRole.AGENT || user.role === UserRole.ADMIN) && (
                 <div className="relative flex-1 md:flex-none">
                    <select className="appearance-none bg-zinc-800 border-zinc-700 text-white rounded-2xl px-6 py-3 pr-10 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-blue-600" value={ticket.status} onChange={e => handleUpdateStatus(ticket.id, e.target.value as TicketStatus)}>
                      <option value={TicketStatus.OPEN}>OPEN</option>
                      <option value={TicketStatus.IN_PROGRESS}>IN PROGRESS</option>
                      <option value={TicketStatus.RESOLVED}>RESOLVED</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                 </div>
               )}
            </div>
          </div>
        ))}
        {tickets.length === 0 && (
          <div className="text-center py-24 bg-zinc-950 rounded-[4rem] border-2 border-dashed border-zinc-800">
            <Wrench className="w-16 h-16 text-zinc-800 mx-auto mb-6" />
            <p className="text-zinc-600 font-black uppercase tracking-widest text-xs">No active maintenance records</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Maintenance;
