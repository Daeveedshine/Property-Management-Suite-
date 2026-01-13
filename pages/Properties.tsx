
import React, { useState, useMemo } from 'react';
import { User, UserRole, Property, PropertyStatus, NotificationType, ApplicationStatus } from '../types';
import { getStore, saveStore } from '../store';
import { MapPin, Plus, Edit, X, Users, CreditCard, Wrench, Info, ArrowRight, DollarSign, UserPlus, CheckCircle, Save, Trash2, Loader2, ChevronDown, Heart, Share2, PartyPopper, Mail, Phone } from 'lucide-react';

interface PropertiesProps {
  user: User;
}

const Properties: React.FC<PropertiesProps> = ({ user }) => {
  const [store, setStore] = useState(getStore());
  const [isAdding, setIsAdding] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Forms
  const [newProp, setNewProp] = useState({ name: '', location: '', rent: 0, description: '' });
  const [editForm, setEditForm] = useState<Partial<Property>>({});
  const [assigningTenantId, setAssigningTenantId] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignmentSuccess, setAssignmentSuccess] = useState(false);

  const properties = useMemo(() => {
    return user.role === UserRole.AGENT || user.role === UserRole.ADMIN
      ? store.properties 
      : store.properties.filter(p => p.id === user.assignedPropertyId);
  }, [user, store]);

  const unassignedTenants = useMemo(() => {
    return store.users.filter(u => u.role === UserRole.TENANT && !u.assignedPropertyId);
  }, [store.users]);

  const currentTenant = useMemo(() => {
    if (!selectedProperty?.tenantId) return null;
    return store.users.find(u => u.id === selectedProperty.tenantId);
  }, [selectedProperty, store.users]);

  const handleAdd = () => {
    if (!newProp.name || !newProp.location || newProp.rent <= 0) return;
    
    const freshProp: Property = {
      id: `p${Date.now()}`,
      name: newProp.name,
      location: newProp.location,
      rent: newProp.rent,
      description: newProp.description || 'Modern living space with premium amenities.',
      status: PropertyStatus.VACANT,
      agentId: user.id
    };
    const newState = { ...store, properties: [...store.properties, freshProp] };
    saveStore(newState);
    setStore(newState);
    setIsAdding(false);
    setNewProp({ name: '', location: '', rent: 0, description: '' });
  };

  const handleStartEdit = () => {
    if (!selectedProperty) return;
    setEditForm({ ...selectedProperty });
    setIsEditing(true);
  };

  const handleUpdate = () => {
    if (!selectedProperty || !editForm.name) return;

    const updatedProperties = store.properties.map(p => 
      p.id === selectedProperty.id ? { ...p, ...editForm } as Property : p
    );

    const newState = { ...store, properties: updatedProperties };
    saveStore(newState);
    setStore(newState);
    setSelectedProperty(updatedProperties.find(p => p.id === selectedProperty.id) || null);
    setIsEditing(false);
  };

  const handleQuickStatusUpdate = (status: PropertyStatus) => {
    if (!selectedProperty) return;
    
    const updatedProperties = store.properties.map(p => 
      p.id === selectedProperty.id ? { ...p, status } : p
    );

    const newState = { ...store, properties: updatedProperties };
    saveStore(newState);
    setStore(newState);
    setSelectedProperty({ ...selectedProperty, status });
  };

  const handleAssignTenant = () => {
    if (!selectedProperty || !assigningTenantId) return;
    setIsAssigning(true);

    setTimeout(() => {
      const updatedProperties = store.properties.map(p => 
        p.id === selectedProperty.id 
          ? { ...p, tenantId: assigningTenantId, status: PropertyStatus.OCCUPIED } 
          : p
      );
      
      const updatedUsers = store.users.map(u => 
        u.id === assigningTenantId 
          ? { ...u, assignedPropertyId: selectedProperty.id } 
          : u
      );

      const newAgreement = {
        id: `a${Date.now()}`,
        propertyId: selectedProperty.id,
        tenantId: assigningTenantId,
        version: 1,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        status: 'active' as const
      };

      const updatedApplications = store.applications.map(app => 
        (app.userId === assigningTenantId && app.propertyId === selectedProperty.id && app.status === ApplicationStatus.PENDING)
          ? { ...app, status: ApplicationStatus.APPROVED }
          : app
      );

      const tenantNotification = {
        id: `n_assign_${Date.now()}`,
        userId: assigningTenantId,
        title: 'Lease Activated',
        message: `Welcome home! Your lease for ${selectedProperty.name} has been activated. Access your digital agreement in the dashboard.`,
        type: NotificationType.SUCCESS,
        timestamp: new Date().toISOString(),
        isRead: false,
        linkTo: 'agreements'
      };

      const newState = { 
        ...store, 
        properties: updatedProperties, 
        users: updatedUsers,
        agreements: [...store.agreements, newAgreement],
        applications: updatedApplications,
        notifications: [tenantNotification, ...store.notifications]
      };

      saveStore(newState);
      setStore(newState);
      setSelectedProperty(updatedProperties.find(p => p.id === selectedProperty.id) || null);
      setAssigningTenantId('');
      setIsAssigning(false);
      setAssignmentSuccess(true);
      
      setTimeout(() => setAssignmentSuccess(false), 3000);
    }, 1200);
  };

  const getStatusStyle = (status: PropertyStatus) => {
    switch (status) {
      case PropertyStatus.OCCUPIED: return 'bg-emerald-600 text-white border-emerald-500';
      case PropertyStatus.VACANT: return 'bg-blue-600 text-white border-blue-500';
      case PropertyStatus.LISTED: return 'bg-zinc-700 text-white border-zinc-600';
      case PropertyStatus.ARCHIVED: return 'bg-rose-600 text-white border-rose-500';
      case PropertyStatus.DRAFT: return 'bg-zinc-800 text-zinc-400 border-zinc-700';
      default: return 'bg-zinc-800 text-zinc-400 border-zinc-700';
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0 animate-in fade-in duration-500 bg-black">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-1">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Portfolio</h1>
          <p className="text-zinc-500 text-sm font-medium">Global property intelligence at scale.</p>
        </div>
        {(user.role === UserRole.AGENT || user.role === UserRole.ADMIN) && (
          <button 
            onClick={() => setIsAdding(true)}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-900/40 transition-all active:scale-95 font-black uppercase tracking-widest text-xs"
          >
            <Plus className="w-5 h-5 mr-2" /> New Listing
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-white p-6 md:p-10 rounded-[3rem] border border-white/20 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-black text-2xl text-black">Create Listing</h3>
            <button onClick={() => setIsAdding(false)} className="bg-zinc-100 p-3 rounded-full text-zinc-400 hover:text-black transition-colors">
              <X size={20} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-2 ml-1">Property Name</label>
                <input 
                  placeholder="e.g. Sunset Heights #101" 
                  className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-bold text-black"
                  value={newProp.name}
                  onChange={e => setNewProp({...newProp, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-2 ml-1">Location Address</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input 
                    placeholder="Full street address" 
                    className="w-full pl-11 pr-5 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-bold text-black"
                    value={newProp.location}
                    onChange={e => setNewProp({...newProp, location: e.target.value})}
                  />
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-2 ml-1">Annual Rent (₦)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">₦</span>
                  <input 
                    type="number" 
                    placeholder="2500000" 
                    className="w-full pl-11 pr-5 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-bold text-black"
                    value={newProp.rent || ''}
                    onChange={e => setNewProp({...newProp, rent: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-2 ml-1">Property Description</label>
                <textarea 
                  placeholder="Property features and amenities..." 
                  className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all h-24 text-sm font-bold text-black resize-none"
                  value={newProp.description}
                  onChange={e => setNewProp({...newProp, description: e.target.value})}
                />
              </div>
            </div>
          </div>
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <button onClick={handleAdd} className="flex-[2] bg-blue-600 text-white px-8 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all flex items-center justify-center">
              <CheckCircle className="w-5 h-5 mr-2" /> Publish Listing
            </button>
            <button onClick={() => setIsAdding(false)} className="flex-1 bg-zinc-100 text-zinc-600 px-8 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-zinc-200 transition-all">Discard</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {properties.map(property => (
          <div key={property.id} className="bg-zinc-900 rounded-[3rem] overflow-hidden shadow-2xl border border-zinc-800 group hover:border-blue-500/50 transition-all duration-500">
            <div className="h-64 bg-zinc-800 relative overflow-hidden">
              <img 
                src={`https://picsum.photos/seed/${property.id}/600/400`} 
                alt={property.name} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 opacity-80" 
              />
              <div className="absolute top-6 left-6">
                <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase border backdrop-blur-md shadow-2xl ${getStatusStyle(property.status)}`}>
                  {property.status}
                </span>
              </div>
            </div>
            <div className="p-8">
              <p className="text-2xl font-black text-white leading-tight mb-2 group-hover:text-blue-400 transition-colors">{property.name}</p>
              <div className="flex items-center text-zinc-500 text-xs font-bold mb-8">
                <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                <span className="truncate">{property.location}</span>
              </div>
              
              <div className="flex items-center justify-between pt-6 border-t border-zinc-800">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Annual Rent</span>
                  <span className="text-3xl font-black text-white">₦{property.rent.toLocaleString()}</span>
                </div>
                <button 
                  onClick={() => { setSelectedProperty(property); setIsEditing(false); setAssignmentSuccess(false); }}
                  className="bg-blue-600 text-white px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center shadow-2xl shadow-blue-900/20 transform active:scale-95"
                >
                  Manage <ArrowRight className="ml-2 w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedProperty && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/90 backdrop-blur-lg animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-5xl h-[92vh] sm:h-auto sm:max-h-[90vh] overflow-hidden rounded-t-[3rem] sm:rounded-[4rem] shadow-2xl animate-in slide-in-from-bottom-10 duration-500 flex flex-col md:flex-row">
            
            <div className="w-full md:w-5/12 lg:w-4/12 h-64 md:h-auto relative bg-zinc-100 shrink-0">
              <img 
                src={`https://picsum.photos/seed/${selectedProperty.id}/800/1200`} 
                alt={selectedProperty.name} 
                className="w-full h-full object-cover" 
              />
              <button 
                onClick={() => setSelectedProperty(null)}
                className="absolute top-8 right-8 bg-black/60 backdrop-blur-md text-white p-4 rounded-full hover:bg-rose-600 md:hidden transition-all shadow-xl"
              >
                <X size={20} />
              </button>
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent flex flex-col justify-end p-8 md:p-12">
                <div className="flex items-center gap-2 mb-4">
                  <span className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase border backdrop-blur-md shadow-2xl ${getStatusStyle(selectedProperty.status)}`}>
                    {selectedProperty.status}
                  </span>
                </div>
                <h2 className="text-white text-4xl font-black leading-tight drop-shadow-2xl">{selectedProperty.name}</h2>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 md:p-14 relative bg-white">
              <button 
                onClick={() => setSelectedProperty(null)}
                className="absolute top-10 right-10 hidden md:flex p-4 bg-zinc-100 text-zinc-400 hover:text-rose-600 rounded-full transition-all"
              >
                <X size={24} />
              </button>

              <div className="space-y-12 max-w-2xl">
                <section>
                  <h3 className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.4em] mb-6">Property Intelligence</h3>
                  <p className="text-black leading-relaxed font-bold text-xl">
                    {selectedProperty.description || "A modern residential unit designed for premium urban living."}
                  </p>
                </section>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="bg-zinc-50 p-8 rounded-[2.5rem] border border-zinc-100">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Annual Rent</p>
                    <p className="text-4xl font-black text-black">₦{selectedProperty.rent.toLocaleString()}</p>
                  </div>

                  <div className="bg-zinc-50 p-8 rounded-[2.5rem] border border-zinc-100">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Portfolio Status</p>
                    <p className="text-2xl font-black text-black">{selectedProperty.status.replace('_', ' ')}</p>
                  </div>
                </div>

                {/* Assignment & Resident View */}
                {(user.role === UserRole.AGENT || user.role === UserRole.ADMIN) && (
                  <section className="pt-10 border-t border-zinc-100">
                    {!selectedProperty.tenantId ? (
                      <div className={`p-10 rounded-[3rem] transition-all duration-500 ${assignmentSuccess ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white shadow-2xl shadow-blue-100'}`}>
                        {assignmentSuccess ? (
                          <div className="flex flex-col items-center justify-center py-6 text-center space-y-4 animate-in zoom-in duration-300">
                            <PartyPopper size={48} className="text-white animate-bounce" />
                            <h4 className="text-3xl font-black">Assignment Finalized</h4>
                            <p className="text-emerald-100 font-bold">Tenant linked and lease activated.</p>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center font-black text-xl mb-6 uppercase tracking-wider">
                              <UserPlus className="w-7 h-7 mr-4 text-blue-200" />
                              Allocate Inventory
                            </div>
                            <div className="space-y-8">
                              <p className="text-sm text-blue-100 font-bold leading-relaxed">Select a verified applicant to allocate this property. This creates an active lease agreement automatically.</p>
                              <div className="relative">
                                <select 
                                  className="w-full px-6 py-5 bg-white/10 border border-white/20 rounded-2xl text-sm font-black focus:ring-4 focus:ring-white/20 outline-none appearance-none cursor-pointer text-white"
                                  value={assigningTenantId}
                                  onChange={(e) => setAssigningTenantId(e.target.value)}
                                >
                                  <option value="" className="text-black">Select Candidate...</option>
                                  {unassignedTenants.map(t => (
                                    <option key={t.id} value={t.id} className="text-black">{t.name} — {t.email}</option>
                                  ))}
                                </select>
                                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none opacity-50" />
                              </div>
                              <button 
                                onClick={handleAssignTenant}
                                disabled={!assigningTenantId || isAssigning}
                                className="w-full bg-white text-blue-600 font-black py-5 rounded-2xl shadow-2xl hover:bg-zinc-50 transition-all disabled:opacity-50 flex items-center justify-center transform active:scale-[0.98] uppercase tracking-widest text-xs"
                              >
                                {isAssigning ? <Loader2 className="w-5 h-5 mr-3 animate-spin" /> : <CheckCircle className="w-5 h-5 mr-3" />}
                                {isAssigning ? 'Synchronizing Records...' : 'Activate Tenancy'}
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="bg-zinc-50 p-10 rounded-[3rem] border border-zinc-100 space-y-8">
                        <div className="flex items-center justify-between">
                          <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.4em]">Current Resident</h4>
                          <span className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-[10px] font-black uppercase">Lease Active</span>
                        </div>
                        
                        {currentTenant ? (
                          <div className="flex flex-col sm:flex-row sm:items-center gap-8">
                            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-zinc-300 border border-zinc-200 text-3xl font-black shadow-sm">
                              {currentTenant.name.charAt(0)}
                            </div>
                            <div className="flex-1 space-y-2">
                              <p className="text-3xl font-black text-black">{currentTenant.name}</p>
                              <div className="flex flex-col gap-2">
                                <span className="flex items-center text-sm text-zinc-600 font-bold">
                                  <Mail size={14} className="mr-3 text-blue-600" /> {currentTenant.email}
                                </span>
                                {currentTenant.phone && (
                                  <span className="flex items-center text-sm text-zinc-600 font-bold">
                                    <Phone size={14} className="mr-3 text-blue-600" /> {currentTenant.phone}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <p className="text-zinc-400 italic">Tenant data mismatch.</p>
                        )}
                        
                        <div className="pt-6 border-t border-zinc-200 flex gap-4">
                           <button className="flex-1 bg-white border-2 border-zinc-200 text-black py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-100 transition-all">View Agreement</button>
                           <button className="flex-1 bg-white border-2 border-zinc-200 text-rose-600 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 hover:border-rose-100 transition-all">End Tenancy</button>
                        </div>
                      </div>
                    )}
                  </section>
                )}

                <div className="pt-12 flex flex-wrap gap-6">
                  {(user.role === UserRole.AGENT || user.role === UserRole.ADMIN) && (
                    <button 
                      onClick={handleStartEdit}
                      className="flex-1 bg-black text-white font-black py-5 px-8 rounded-2xl hover:bg-blue-600 transition-all flex items-center justify-center text-xs uppercase tracking-widest shadow-2xl"
                    >
                      <Edit className="w-4 h-4 mr-3" /> Edit Listing
                    </button>
                  )}
                  <button className="flex-1 bg-zinc-100 text-black font-black py-5 px-8 rounded-2xl hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center text-xs uppercase tracking-widest">
                    <Wrench className="w-4 h-4 mr-3" /> Maintenance
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Properties;
