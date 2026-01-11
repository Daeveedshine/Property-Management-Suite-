
import React, { useState } from 'react';
import { User, UserRole, MaintenanceTicket, TicketStatus, TicketPriority, NotificationType } from '../types';
import { getStore, saveStore } from '../store';
import { analyzeMaintenanceRequest } from '../services/geminiService';
import { Plus, CheckCircle2, Clock, AlertCircle, Sparkles, Loader2, Wrench, MoreHorizontal, Settings2 } from 'lucide-react';

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
  const [isAiProcessing, setIsAiProcessing] = useState(false);

  const handleSubmit = async () => {
    if (!newIssue) return;
    setIsAiProcessing(true);
    
    // AI Enhancement
    const analysis = await analyzeMaintenanceRequest(newIssue);

    const freshTicket: MaintenanceTicket = {
      id: `t${Date.now()}`,
      propertyId: user.assignedPropertyId || 'p1',
      tenantId: user.id,
      issue: newIssue,
      status: TicketStatus.OPEN,
      priority: analysis.priority as TicketPriority,
      createdAt: new Date().toISOString(),
      aiAssessment: analysis.assessment
    };

    // Notify Agent
    const agentNotification = {
      id: `n_t_${Date.now()}`,
      userId: 'u1', // In real app, find property agent
      title: 'New Maintenance Request',
      message: `A new ticket has been submitted for property ${freshTicket.propertyId}. Priority: ${freshTicket.priority}.`,
      type: NotificationType.INFO,
      timestamp: new Date().toISOString(),
      isRead: false,
      linkTo: 'maintenance'
    };

    const newState = { 
        ...store, 
        tickets: [freshTicket, ...store.tickets],
        notifications: [agentNotification, ...store.notifications]
    };
    saveStore(newState);
    setStore(newState);
    setTickets([freshTicket, ...tickets]);
    setNewIssue('');
    setIsSubmitting(false);
    setIsAiProcessing(false);
  };

  const handleUpdateStatus = (ticketId: string, newStatus: TicketStatus) => {
    const updatedTickets = store.tickets.map(t => 
        t.id === ticketId ? { ...t, status: newStatus } : t
    );
    
    const ticket = store.tickets.find(t => t.id === ticketId);
    if (!ticket) return;

    // Notify Tenant
    const tenantNotification = {
        id: `n_ts_${Date.now()}`,
        userId: ticket.tenantId,
        title: 'Maintenance Update',
        message: `Your maintenance request #${ticket.id} is now ${newStatus.replace('_', ' ').toLowerCase()}.`,
        type: newStatus === TicketStatus.RESOLVED ? NotificationType.SUCCESS : NotificationType.INFO,
        timestamp: new Date().toISOString(),
        isRead: false,
        linkTo: 'maintenance'
    };

    const newState = { 
        ...store, 
        tickets: updatedTickets,
        notifications: [tenantNotification, ...store.notifications]
    };
    saveStore(newState);
    setStore(newState);
    setTickets(user.role === UserRole.TENANT ? updatedTickets.filter(t => t.tenantId === user.id) : updatedTickets);
  };

  const getPriorityColor = (priority: TicketPriority) => {
    switch (priority) {
      case TicketPriority.EMERGENCY: return 'text-red-600 bg-red-100';
      case TicketPriority.HIGH: return 'text-orange-600 bg-orange-100';
      case TicketPriority.MEDIUM: return 'text-amber-600 bg-amber-100';
      default: return 'text-emerald-600 bg-emerald-100';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Maintenance Tickets</h1>
          <p className="text-slate-500">Track and manage repair requests.</p>
        </div>
        {user.role === UserRole.TENANT && (
          <button 
            onClick={() => setIsSubmitting(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center shadow-lg transition-all transform active:scale-95"
          >
            <Plus className="w-4 h-4 mr-2" /> Submit Request
          </button>
        )}
      </div>

      {isSubmitting && (
        <div className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-xl animate-in zoom-in-95 duration-300">
          <h3 className="font-bold text-slate-800 mb-4">Report an Issue</h3>
          <textarea 
            className="w-full p-4 border rounded-xl h-32 outline-none focus:ring-2 focus:ring-indigo-500 mb-4 text-sm"
            placeholder="Describe the problem in detail (e.g. 'Kitchen sink is leaking from the P-trap...')"
            value={newIssue}
            onChange={e => setNewIssue(e.target.value)}
          />
          <div className="flex space-x-3 items-center">
            <button 
              onClick={handleSubmit} 
              disabled={isAiProcessing || !newIssue}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold flex items-center disabled:opacity-50 transition-all"
            >
              {isAiProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
              {isAiProcessing ? 'AI Analyzing...' : 'Submit with AI Assist'}
            </button>
            {!isAiProcessing && (
              <button onClick={() => setIsSubmitting(false)} className="text-slate-400 font-bold text-sm px-4 hover:text-slate-600">Cancel</button>
            )}
          </div>
          {isAiProcessing && (
            <div className="mt-4 p-3 bg-indigo-50 rounded-xl border border-indigo-100 flex items-center animate-pulse">
                <Sparkles className="w-4 h-4 text-indigo-500 mr-2" />
                <p className="text-xs text-indigo-500 font-medium">Gemini is evaluating priority and providing technical insights...</p>
            </div>
          )}
        </div>
      )}

      <div className="space-y-4">
        {tickets.length > 0 ? tickets.map(ticket => (
          <div key={ticket.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:border-indigo-100 transition-all group">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority}
                  </span>
                  <span className="text-xs text-slate-400 font-medium font-mono">#{ticket.id}</span>
                </div>
                <h4 className="text-lg font-bold text-slate-800 mb-1 leading-tight">{ticket.issue}</h4>
                <div className="flex items-center text-xs text-slate-500">
                  <Clock className="w-3 h-3 mr-1" />
                  {new Date(ticket.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  <span className="mx-2">•</span>
                  <span className="bg-slate-50 px-2 py-0.5 rounded border border-slate-100">Unit: {ticket.propertyId}</span>
                </div>
                
                {ticket.aiAssessment && (
                  <div className="mt-4 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 text-sm">
                    <div className="flex items-center text-indigo-700 font-bold mb-2 text-xs uppercase tracking-widest">
                      <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                      AI Technical Assessment
                    </div>
                    <p className="text-indigo-600/80 leading-relaxed italic text-sm">{ticket.aiAssessment}</p>
                  </div>
                )}
              </div>

              <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-4">
                <div className={`flex items-center px-4 py-2 rounded-full text-xs font-bold ${
                    ticket.status === TicketStatus.OPEN ? 'bg-amber-100 text-amber-700' : 
                    ticket.status === TicketStatus.IN_PROGRESS ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {ticket.status === TicketStatus.OPEN ? <AlertCircle className="w-3.5 h-3.5 mr-2" /> : 
                   ticket.status === TicketStatus.IN_PROGRESS ? <Clock className="w-3.5 h-3.5 mr-2" /> : <CheckCircle2 className="w-3.5 h-3.5 mr-2" />}
                  {ticket.status.replace('_', ' ')}
                </div>
                
                {(user.role === UserRole.AGENT || user.role === UserRole.ADMIN) && (
                  <div className="flex items-center gap-2">
                     <select 
                        className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-2 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-600"
                        value={ticket.status}
                        onChange={(e) => handleUpdateStatus(ticket.id, e.target.value as TicketStatus)}
                     >
                        <option value={TicketStatus.OPEN}>Mark Open</option>
                        <option value={TicketStatus.IN_PROGRESS}>Mark In Progress</option>
                        <option value={TicketStatus.RESOLVED}>Mark Resolved</option>
                     </select>
                  </div>
                )}
              </div>
            </div>
          </div>
        )) : (
          <div className="text-center py-24 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <Wrench className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-400">No active maintenance requests</h3>
            <p className="text-slate-400 text-sm">Everything seems to be in perfect order.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Maintenance;
