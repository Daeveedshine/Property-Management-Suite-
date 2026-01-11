
import React, { useState, useMemo } from 'react';
import { User, UserRole, Property, PropertyStatus } from '../types';
import { getStore, saveStore } from '../store';
import { MapPin, Plus, Edit, X, Users, CreditCard, Wrench, Info, ArrowRight, DollarSign, UserPlus, CheckCircle, Save, Trash2, Loader2, ChevronDown } from 'lucide-react';

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

  const properties = useMemo(() => {
    return user.role === UserRole.AGENT || user.role === UserRole.ADMIN
      ? store.properties 
      : store.properties.filter(p => p.id === user.assignedPropertyId);
  }, [user, store]);

  const unassignedTenants = useMemo(() => {
    return store.users.filter(u => u.role === UserRole.TENANT && !u.assignedPropertyId);
  }, [store.users]);

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

      const newState = { 
        ...store, 
        properties: updatedProperties, 
        users: updatedUsers,
        agreements: [...store.agreements, newAgreement]
      };

      saveStore(newState);
      setStore(newState);
      setSelectedProperty(updatedProperties.find(p => p.id === selectedProperty.id) || null);
      setAssigningTenantId('');
      setIsAssigning(false);
    }, 1000);
  };

  const getStatusStyle = (status: PropertyStatus) => {
    switch (status) {
      case PropertyStatus.OCCUPIED: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case PropertyStatus.VACANT: return 'bg-amber-100 text-amber-700 border-amber-200';
      case PropertyStatus.LISTED: return 'bg-blue-100 text-blue-700 border-blue-200';
      case PropertyStatus.ARCHIVED: return 'bg-rose-100 text-rose-700 border-rose-200';
      case PropertyStatus.DRAFT: return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Properties</h1>
          <p className="text-slate-500">Manage your real estate portfolio.</p>
        </div>
        {(user.role === UserRole.AGENT || user.role === UserRole.ADMIN) && (
          <button 
            onClick={() => setIsAdding(true)}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 transition-all active:scale-95"
          >
            <Plus className="w-5 h-5 mr-2" /> Add Property
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-slate-800">New Property Details</h3>
            <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Display Name</label>
                <input 
                  placeholder="e.g. Sunset Heights #101" 
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                  value={newProp.name}
                  onChange={e => setNewProp({...newProp, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Location Address</label>
                <input 
                  placeholder="Full street address" 
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                  value={newProp.location}
                  onChange={e => setNewProp({...newProp, location: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Monthly Rent ($)</label>
                <input 
                  type="number" 
                  placeholder="2500" 
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                  value={newProp.rent || ''}
                  onChange={e => setNewProp({...newProp, rent: parseInt(e.target.value)})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</label>
                <textarea 
                  placeholder="Brief overview of the property..." 
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all h-20 text-sm"
                  value={newProp.description}
                  onChange={e => setNewProp({...newProp, description: e.target.value})}
                />
              </div>
            </div>
          </div>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button onClick={handleAdd} className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all">Create Listing</button>
            <button onClick={() => setIsAdding(false)} className="flex-1 bg-slate-100 text-slate-600 px-6 py-3 rounded-xl font-bold hover:bg-slate-200 transition-all">Discard</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map(property => (
          <div key={property.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 group hover:shadow-xl hover:border-indigo-100 transition-all duration-300">
            <div className="h-48 bg-slate-200 relative overflow-hidden">
              <img 
                src={`https://picsum.photos/seed/${property.id}/600/400`} 
                alt={property.name} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
              />
              <div className="absolute top-4 left-4">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${getStatusStyle(property.status)}`}>
                  {property.status}
                </span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                <p className="text-white font-bold text-lg leading-tight">{property.name}</p>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center text-slate-500 text-sm mb-4">
                <MapPin className="w-4 h-4 mr-2 text-indigo-500" />
                <span className="truncate">{property.location}</span>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Monthly Rent</span>
                  <span className="text-xl font-black text-indigo-600">${property.rent.toLocaleString()}</span>
                </div>
                <button 
                  onClick={() => { setSelectedProperty(property); setIsEditing(false); }}
                  className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-600 transition-colors flex items-center shadow-lg shadow-slate-100"
                >
                  View Details <ArrowRight className="ml-2 w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Property Detail Modal */}
      {selectedProperty && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-4xl h-full sm:h-auto sm:max-h-[90vh] overflow-hidden rounded-t-3xl sm:rounded-3xl shadow-2xl animate-in slide-in-from-bottom-10 duration-500 flex flex-col md:flex-row">
            
            {/* Image Section */}
            <div className="w-full md:w-2/5 h-64 md:h-auto relative bg-slate-200 shrink-0">
              <img 
                src={`https://picsum.photos/seed/${selectedProperty.id}/800/1200`} 
                alt={selectedProperty.name} 
                className="w-full h-full object-cover" 
              />
              <button 
                onClick={() => setSelectedProperty(null)}
                className="absolute top-4 right-4 bg-white/20 backdrop-blur-md text-white p-2 rounded-full hover:bg-white/40 md:hidden transition-colors"
              >
                <X size={20} />
              </button>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-8">
                <div className="mb-4 flex items-center">
                  {!isEditing && (user.role === UserRole.AGENT || user.role === UserRole.ADMIN) ? (
                    <div className="relative group">
                      <select 
                        className={`appearance-none px-4 py-1.5 pr-8 rounded-full text-[10px] font-bold uppercase border cursor-pointer transition-all outline-none focus:ring-2 focus:ring-white/50 ${getStatusStyle(selectedProperty.status)}`}
                        value={selectedProperty.status}
                        onChange={(e) => handleQuickStatusUpdate(e.target.value as PropertyStatus)}
                      >
                        {Object.values(PropertyStatus).map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 opacity-50 pointer-events-none" />
                    </div>
                  ) : (
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${getStatusStyle(isEditing ? editForm.status as PropertyStatus : selectedProperty.status)}`}>
                      {isEditing ? editForm.status : selectedProperty.status}
                    </span>
                  )}
                </div>
                {!isEditing ? (
                  <h2 className="text-white text-3xl font-black">{selectedProperty.name}</h2>
                ) : (
                  <input 
                    className="bg-white/10 backdrop-blur-md border border-white/30 text-white text-2xl font-black px-3 py-1.5 rounded-xl outline-none focus:ring-2 focus:ring-white/50 w-full"
                    value={editForm.name}
                    onChange={e => setEditForm({...editForm, name: e.target.value})}
                  />
                )}
              </div>
            </div>

            {/* Content Section */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 relative">
              <button 
                onClick={() => setSelectedProperty(null)}
                className="absolute top-8 right-8 text-slate-400 hover:text-slate-600 hidden md:block"
              >
                <X size={24} />
              </button>

              <div className="space-y-8">
                <section>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Location & Overview</h3>
                  <div className="flex items-start space-x-3 mb-4">
                    <MapPin className="text-indigo-600 w-5 h-5 mt-1 shrink-0" />
                    {!isEditing ? (
                      <p className="text-slate-700 font-medium text-lg leading-snug">{selectedProperty.location}</p>
                    ) : (
                      <input 
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                        value={editForm.location}
                        onChange={e => setEditForm({...editForm, location: e.target.value})}
                      />
                    )}
                  </div>
                  {!isEditing ? (
                    <p className="text-slate-500 leading-relaxed italic text-sm md:text-base">
                      {selectedProperty.description || "A premium property managed by PropLifecycle. This unit features high-end finishes, abundant natural light, and access to all community amenities."}
                    </p>
                  ) : (
                    <textarea 
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 h-24"
                      value={editForm.description}
                      onChange={e => setEditForm({...editForm, description: e.target.value})}
                    />
                  )}
                </section>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="flex items-center text-indigo-600 mb-2">
                      <DollarSign className="w-4 h-4 mr-2" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Financials</span>
                    </div>
                    {!isEditing ? (
                      <p className="text-xl md:text-2xl font-black text-slate-800">${selectedProperty.rent.toLocaleString()}</p>
                    ) : (
                      <div className="flex items-center">
                        <span className="text-lg font-bold mr-1">$</span>
                        <input 
                          type="number"
                          className="w-full px-2 py-1 border border-slate-200 rounded-lg text-lg font-black outline-none"
                          value={editForm.rent}
                          onChange={e => setEditForm({...editForm, rent: parseInt(e.target.value)})}
                        />
                      </div>
                    )}
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">Per Calendar Month</p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="flex items-center text-indigo-600 mb-2">
                      <Users className="w-4 h-4 mr-2" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Occupancy</span>
                    </div>
                    {isEditing ? (
                       <select 
                        className="w-full mt-1 px-2 py-1 border border-slate-200 rounded-lg text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                        value={editForm.status}
                        onChange={(e) => setEditForm({...editForm, status: e.target.value as PropertyStatus})}
                       >
                         {Object.values(PropertyStatus).map(s => (
                           <option key={s} value={s}>{s}</option>
                         ))}
                       </select>
                    ) : (
                      <p className="text-lg font-bold text-slate-800 truncate">
                        {selectedProperty.tenantId ? 'Leased' : 'Vacant'}
                      </p>
                    )}
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter truncate">
                      {selectedProperty.tenantId ? `Tenant ID: ${selectedProperty.tenantId}` : 'Available for Listing'}
                    </p>
                  </div>
                </div>

                {/* Tenant Assignment Section */}
                {(user.role === UserRole.AGENT || user.role === UserRole.ADMIN) && !selectedProperty.tenantId && !isEditing && (
                  <section className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 animate-in zoom-in-95 duration-300">
                    <div className="flex items-center text-indigo-700 font-bold mb-4">
                      <UserPlus className="w-5 h-5 mr-2" />
                      Assign a Tenant
                    </div>
                    <div className="space-y-4">
                      <p className="text-xs text-indigo-600/80">Select a tenant who doesn't currently have an assigned property to initiate a lease.</p>
                      <select 
                        className="w-full px-4 py-3 bg-white border border-indigo-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={assigningTenantId}
                        onChange={(e) => setAssigningTenantId(e.target.value)}
                      >
                        <option value="">Select an available tenant...</option>
                        {unassignedTenants.map(t => (
                          <option key={t.id} value={t.id}>{t.name} ({t.email})</option>
                        ))}
                      </select>
                      <button 
                        onClick={handleAssignTenant}
                        disabled={!assigningTenantId || isAssigning}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-200 transition-all disabled:opacity-50 flex items-center justify-center"
                      >
                        {isAssigning ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                        {isAssigning ? 'Finalizing Lease...' : 'Assign & Create Agreement'}
                      </button>
                    </div>
                  </section>
                )}

                {!isEditing && (
                  <section className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Asset Management</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl hover:border-indigo-200 transition-colors cursor-pointer group">
                        <div className="flex items-center">
                          <Wrench className="w-5 h-5 text-slate-400 mr-4 group-hover:text-indigo-500" />
                          <div>
                            <p className="text-sm font-bold text-slate-800">Maintenance History</p>
                            <p className="text-[10px] text-slate-400">View repair requests</p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300" />
                      </div>
                    </div>
                  </section>
                )}

                <div className="pt-6 border-t border-slate-100 flex gap-3">
                  {(user.role === UserRole.AGENT || user.role === UserRole.ADMIN) && (
                    !isEditing ? (
                      <>
                        <button 
                          onClick={handleStartEdit}
                          className="flex-1 bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center text-sm"
                        >
                          <Edit className="w-4 h-4 mr-2" /> Edit Listing
                        </button>
                        <button className="p-3.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          onClick={handleUpdate}
                          className="flex-[2] bg-emerald-600 text-white font-bold py-3.5 rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center text-sm"
                        >
                          <Save className="w-4 h-4 mr-2" /> Save Changes
                        </button>
                        <button 
                          onClick={() => setIsEditing(false)}
                          className="flex-1 bg-slate-100 text-slate-600 font-bold py-3.5 rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center text-sm"
                        >
                          Cancel
                        </button>
                      </>
                    )
                  )}
                  {!isEditing && (
                    <button className="flex-1 bg-indigo-50 text-indigo-600 font-bold py-3.5 rounded-xl hover:bg-indigo-100 transition-colors flex items-center justify-center text-sm">
                      <Info className="w-4 h-4 mr-2" /> Full Report
                    </button>
                  )}
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
