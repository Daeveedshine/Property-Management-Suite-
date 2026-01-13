import React, { useState, useMemo } from 'react';
import { User, UserRole, Property, PropertyStatus, PropertyCategory, PropertyType } from '../types';
import { getStore, saveStore } from '../store';
import { MapPin, Plus, Edit, X, Wrench, Info, ArrowRight, DollarSign, UserPlus, Save, Loader2, Tag, Layout, Briefcase, UserCheck, Maximize2, Users } from 'lucide-react';

interface PropertiesProps {
  user: User;
}

const PROPERTY_TYPES: PropertyType[] = [
  'Single Room', 'Self-contained', 'Mini Flat (1 Bedroom)', 
  '2 Bedroom flat', '3 Bedroom Flat', '4 Bedroom Flat', 
  'Terrace', 'Semi-detached Duplex', 'Fully Detached Duplex', 
  'Penthouse', 'Studio Appartment', 'Serviced Appartment', 
  'Shop', 'Plaza Shop', 'Office Space', 'Co-working Space', 
  'Factory', 'Warehouse', 'land'
];

const Properties: React.FC<PropertiesProps> = ({ user }) => {
  const [store, setStore] = useState(getStore());
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<Property>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  
  const properties = useMemo(() => {
    return user.role === UserRole.AGENT || user.role === UserRole.ADMIN
      ? store.properties 
      : store.properties.filter(p => p.id === user.assignedPropertyId);
  }, [user, store]);

  // Logic to find tenants who have submitted applications to this specific agent
  const eligibleTenants = useMemo(() => {
    // For Admin, show all tenants. For Agents, show only those who used their Agent ID.
    if (user.role === UserRole.ADMIN) {
      return store.users.filter(u => u.role === UserRole.TENANT);
    }
    
    // Filter applications where the agent code matches current agent's ID or name
    const applicationsForMe = store.applications.filter(app => 
      app.agentIdCode.toLowerCase() === user.id.toLowerCase() ||
      app.agentId.toLowerCase() === user.id.toLowerCase()
    );
    
    const tenantIds = Array.from(new Set(applicationsForMe.map(app => app.userId)));
    return store.users.filter(u => u.role === UserRole.TENANT && tenantIds.includes(u.id));
  }, [store.applications, store.users, user.id, user.role]);

  const getStatusStyle = (status: PropertyStatus) => {
    switch (status) {
      case PropertyStatus.OCCUPIED: return 'bg-white text-emerald-600 border-emerald-100';
      case PropertyStatus.VACANT: return 'bg-white text-blue-600 border-blue-100';
      case PropertyStatus.LISTED: return 'bg-white text-amber-600 border-amber-100';
      default: return 'bg-white text-zinc-400 border-zinc-100';
    }
  };

  const handleOpenDetail = (property: Property) => {
    setSelectedProperty(property);
    setEditFormData(property);
    setIsEditing(false);
  };

  const handleStartEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditFormData(selectedProperty || {});
  };

  const handleSave = () => {
    if (!selectedProperty) return;
    setIsSaving(true);
    
    setTimeout(() => {
      const updatedProperties = store.properties.map(p => 
        p.id === selectedProperty.id ? { ...p, ...editFormData } as Property : p
      );
      
      const updatedStore = { ...store, properties: updatedProperties };
      saveStore(updatedStore);
      setStore(updatedStore);
      setSelectedProperty({ ...selectedProperty, ...editFormData } as Property);
      setIsEditing(false);
      setIsSaving(false);
    }, 800);
  };

  const handlePublishNew = () => {
      const newId = `p${Date.now()}`;
      const newProperty: Property = {
          id: newId,
          name: 'New Asset ' + (store.properties.length + 1),
          location: 'Address TBD',
          rent: 0,
          status: PropertyStatus.DRAFT,
          agentId: user.id,
          category: PropertyCategory.RESIDENTIAL,
          type: 'Mini Flat (1 Bedroom)',
          description: 'Enter description here...'
      };
      const updatedStore = { ...store, properties: [...store.properties, newProperty] };
      saveStore(updatedStore);
      setStore(updatedStore);
      handleOpenDetail(newProperty);
      setIsEditing(true);
  };

  const currentAgent = useMemo(() => {
      if (!selectedProperty) return null;
      return store.users.find(u => u.id === selectedProperty.agentId);
  }, [selectedProperty, store.users]);

  const currentTenant = useMemo(() => {
      const tenantId = isEditing ? editFormData.tenantId : selectedProperty?.tenantId;
      if (!tenantId) return null;
      return store.users.find(u => u.id === tenantId);
  }, [selectedProperty, editFormData.tenantId, isEditing, store.users]);

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tighter">Inventory</h1>
          <p className="text-zinc-400 font-medium">Managing {properties.length} lifecycle assets.</p>
        </div>
        {(user.role === UserRole.AGENT || user.role === UserRole.ADMIN) && (
          <button 
            onClick={handlePublishNew}
            className="w-full sm:w-auto bg-blue-600 text-white px-8 py-4 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20 font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 mr-2" /> Publish Asset
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {properties.map(property => (
          <div 
            key={property.id} 
            onClick={() => handleOpenDetail(property)}
            className="bg-white dark:bg-zinc-900 rounded-[2.5rem] overflow-hidden shadow-sm border border-zinc-100 dark:border-zinc-800 group hover:border-blue-200 transition-all duration-300 cursor-pointer"
          >
            <div className="h-60 bg-offwhite dark:bg-black relative overflow-hidden">
              <img 
                src={`https://picsum.photos/seed/${property.id}/600/400`} 
                alt={property.name} 
                className="w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform duration-1000" 
              />
              <div className="absolute top-6 left-6 flex gap-2">
                <span className={`px-4 py-2 rounded-full text-[9px] font-black uppercase border shadow-sm ${getStatusStyle(property.status)}`}>
                  {property.status}
                </span>
                <span className="px-4 py-2 rounded-full text-[9px] font-black uppercase border bg-white text-zinc-600 border-zinc-100 shadow-sm">
                  {property.category}
                </span>
              </div>
            </div>
            <div className="p-8">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-black text-zinc-900 dark:text-white leading-tight">{property.name}</h3>
                <span className="text-[10px] font-black text-blue-600 uppercase bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-md">{property.type}</span>
              </div>
              <div className="flex items-center text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-8">
                <MapPin className="w-3 h-3 mr-2 text-blue-600" />
                <span className="truncate">{property.location}</span>
              </div>
              
              <div className="flex items-center justify-between pt-6 border-t border-zinc-100 dark:border-zinc-800">
                <div>
                  <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Annual Yield</p>
                  <p className="text-2xl font-black text-zinc-900 dark:text-white tracking-tighter">₦{property.rent.toLocaleString()}</p>
                </div>
                <div className="bg-offwhite dark:bg-black text-zinc-900 dark:text-white p-4 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-90">
                  <ArrowRight size={20} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Advanced Asset Inspector Modal - Highly Responsive & Scrollable */}
      {selectedProperty && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4 bg-white/95 dark:bg-black/95 backdrop-blur-lg animate-in fade-in duration-300">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-6xl md:rounded-[3rem] shadow-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden flex flex-col md:flex-row h-full md:h-auto md:max-h-[92vh]">
             
             {/* Left Panel: Media/Preview - Fixed Height on Mobile, Responsive on Desktop */}
             <div 
               className="w-full md:w-5/12 h-64 md:h-auto bg-offwhite relative group cursor-pointer shrink-0"
               onClick={() => setExpandedImage(`https://picsum.photos/seed/${selectedProperty.id}/1200/1600`)}
             >
                <img src={`https://picsum.photos/seed/${selectedProperty.id}/800/1200`} className="w-full h-full object-cover" alt="Property Preview" />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Maximize2 className="text-white" size={48} />
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-6 sm:p-10">
                    <p className="text-white font-black text-xl sm:text-2xl tracking-tighter">{selectedProperty.name}</p>
                    <p className="text-white/80 text-[10px] sm:text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                      <MapPin size={12} className="text-blue-400" /> {selectedProperty.location}
                    </p>
                </div>
                <button onClick={() => setSelectedProperty(null)} className="absolute top-6 left-6 p-3 bg-white/80 dark:bg-black/80 rounded-full text-zinc-900 dark:text-white md:hidden shadow-xl z-10">
                  <X size={20} />
                </button>
             </div>

             {/* Right Panel: Content - Scrollable on both Mobile and Desktop */}
             <div className="flex-1 p-6 sm:p-10 lg:p-14 overflow-y-auto bg-white dark:bg-zinc-900 custom-scrollbar scroll-smooth">
                <div className="flex justify-between items-start mb-8 sm:mb-10">
                  <div className="space-y-4 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <span className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[8px] sm:text-[9px] font-black uppercase shadow-sm border ${getStatusStyle(selectedProperty.status)}`}>{selectedProperty.status}</span>
                        <span className="bg-zinc-100 dark:bg-white/5 text-zinc-500 dark:text-zinc-400 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[8px] sm:text-[9px] font-black uppercase border border-zinc-200 dark:border-zinc-800">{selectedProperty.category}</span>
                        <span className="bg-zinc-100 dark:bg-white/5 text-zinc-500 dark:text-zinc-400 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[8px] sm:text-[9px] font-black uppercase border border-zinc-200 dark:border-zinc-800">{selectedProperty.type}</span>
                    </div>
                    {isEditing ? (
                        <input 
                            className="text-xl sm:text-3xl md:text-4xl font-black text-zinc-900 dark:text-white tracking-tighter bg-offwhite dark:bg-black p-3 sm:p-4 rounded-2xl w-full border-2 border-blue-600 outline-none" 
                            value={editFormData.name} 
                            onChange={e => setEditFormData({...editFormData, name: e.target.value})}
                        />
                    ) : (
                        <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-zinc-900 dark:text-white tracking-tighter leading-none break-words">{selectedProperty.name}</h2>
                    )}
                  </div>
                  <div className="flex gap-2 sm:gap-3 ml-4">
                    {(user.role === UserRole.AGENT || user.role === UserRole.ADMIN) && !isEditing && (
                        <button 
                            onClick={handleStartEdit}
                            className="p-2 sm:p-4 bg-offwhite dark:bg-black hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full text-zinc-400 transition-colors"
                        >
                            <Edit size={20} />
                        </button>
                    )}
                    <button onClick={() => setSelectedProperty(null)} className="p-2 sm:p-4 bg-offwhite dark:bg-black hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full text-zinc-400 transition-colors hidden md:block">
                        <X size={20} />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-10 sm:space-y-12">
                    {/* Primary Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
                        {isEditing ? (
                            <>
                                <InputWrapper label="Location/Address">
                                    <input className="edit-field" value={editFormData.location} onChange={e => setEditFormData({...editFormData, location: e.target.value})} />
                                </InputWrapper>
                                <InputWrapper label="Annual Rent (₦)">
                                    <input type="number" className="edit-field" value={editFormData.rent} onChange={e => setEditFormData({...editFormData, rent: parseInt(e.target.value) || 0})} />
                                </InputWrapper>
                                <InputWrapper label="Status">
                                    <select className="edit-field" value={editFormData.status} onChange={e => setEditFormData({...editFormData, status: e.target.value as PropertyStatus})}>
                                        <option value={PropertyStatus.DRAFT}>DRAFT</option>
                                        <option value={PropertyStatus.LISTED}>LISTED</option>
                                        <option value={PropertyStatus.VACANT}>VACANT</option>
                                        <option value={PropertyStatus.OCCUPIED}>OCCUPIED</option>
                                        <option value={PropertyStatus.ARCHIVED}>ARCHIVED</option>
                                    </select>
                                </InputWrapper>
                                <InputWrapper label="Category">
                                    <select className="edit-field" value={editFormData.category} onChange={e => setEditFormData({...editFormData, category: e.target.value as PropertyCategory})}>
                                        <option value={PropertyCategory.RESIDENTIAL}>Residential</option>
                                        <option value={PropertyCategory.COMMERCIAL}>Commercial</option>
                                    </select>
                                </InputWrapper>
                                <InputWrapper label="Property Type">
                                    <select className="edit-field" value={editFormData.type} onChange={e => setEditFormData({...editFormData, type: e.target.value as PropertyType})}>
                                        {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </InputWrapper>
                                <InputWrapper label="Assign Tenant (Filtered by your Agent ID)">
                                    <select 
                                        className="edit-field" 
                                        value={editFormData.tenantId || ''} 
                                        onChange={e => setEditFormData({...editFormData, tenantId: e.target.value})}
                                    >
                                        <option value="">Unassigned</option>
                                        {eligibleTenants.map(t => (
                                          <option key={t.id} value={t.id}>{t.name} ({t.id})</option>
                                        ))}
                                    </select>
                                    <p className="text-[8px] font-bold text-blue-500 uppercase tracking-widest mt-1">
                                      Showing {eligibleTenants.length} tenants who applied via your registry ID.
                                    </p>
                                </InputWrapper>
                            </>
                        ) : (
                            <>
                                <DetailCard icon={MapPin} label="Location" value={selectedProperty.location} />
                                <DetailCard icon={DollarSign} label="Annual Yield" value={`₦${selectedProperty.rent.toLocaleString()}`} />
                                <DetailCard icon={Layout} label="Type" value={selectedProperty.type} />
                                <DetailCard icon={Tag} label="Class" value={selectedProperty.category} />
                            </>
                        )}
                    </div>

                    {/* Description Section */}
                    <div className="space-y-4">
                        <p className="text-[9px] sm:text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                            <Info size={14} className="text-blue-600" /> Executive Summary
                        </p>
                        {isEditing ? (
                            <textarea 
                                className="w-full edit-field h-40 resize-none p-6" 
                                value={editFormData.description} 
                                onChange={e => setEditFormData({...editFormData, description: e.target.value})}
                            />
                        ) : (
                            <p className="text-zinc-600 dark:text-zinc-400 font-bold leading-relaxed text-sm sm:text-lg border-l-4 border-blue-600 pl-5 sm:pl-8 py-4 bg-offwhite dark:bg-white/5 rounded-r-3xl">
                                {selectedProperty.description || "No overview provided for this asset."}
                            </p>
                        )}
                    </div>

                    {/* Relationships: Agent & Tenant */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                        <div className="p-6 sm:p-8 bg-zinc-950 rounded-[2rem] sm:rounded-[2.5rem] border border-zinc-900 text-white shadow-xl">
                            <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <Briefcase size={12} className="text-blue-500" /> Custodian Agent
                            </p>
                            {currentAgent ? (
                                <div className="flex items-center gap-4">
                                    <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-2xl bg-white/10 flex items-center justify-center font-black text-blue-500 border border-white/5">
                                        {currentAgent.name.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-black text-sm sm:text-base truncate">{currentAgent.name}</p>
                                        <p className="text-[9px] sm:text-[10px] font-bold text-zinc-500 uppercase tracking-widest truncate">{currentAgent.id}</p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-zinc-600 italic font-bold">No custodian assigned.</p>
                            )}
                        </div>

                        <div className={`p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border flex flex-col justify-center shadow-lg ${currentTenant ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30' : 'bg-offwhite dark:bg-black border-zinc-100 dark:border-zinc-800'}`}>
                             <p className={`text-[9px] font-black uppercase tracking-widest mb-6 flex items-center gap-2 ${currentTenant ? 'text-emerald-500' : 'text-zinc-400'}`}>
                                <UserCheck size={12} /> Occupancy Profile
                             </p>
                             {currentTenant ? (
                                <div className="flex items-center gap-4">
                                    <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-2xl bg-emerald-500 flex items-center justify-center font-black text-white shadow-lg shadow-emerald-500/20">
                                        {currentTenant.name.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-black text-sm sm:text-base text-zinc-900 dark:text-white truncate">{currentTenant.name}</p>
                                        <p className="text-[9px] sm:text-[10px] font-bold text-emerald-600/60 uppercase tracking-widest truncate">Active Resident</p>
                                    </div>
                                </div>
                             ) : (
                                <p className="text-zinc-400 italic font-bold">Unoccupied Lifecycle.</p>
                             )}
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 pt-10 border-t border-zinc-100 dark:border-zinc-800">
                        {isEditing ? (
                            <>
                                <button 
                                    onClick={handleSave} 
                                    disabled={isSaving}
                                    className="flex-[2] bg-blue-600 text-white font-black uppercase tracking-widest text-[10px] sm:text-[11px] py-4 sm:py-6 rounded-3xl shadow-xl shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                    Commit Lifecycle Updates
                                </button>
                                <button 
                                    onClick={handleCancelEdit}
                                    className="flex-1 bg-offwhite dark:bg-black text-zinc-900 dark:text-white font-black uppercase tracking-widest text-[10px] sm:text-[11px] py-4 sm:py-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-100 transition-all flex items-center justify-center gap-2"
                                >
                                    <X size={18} /> Cancel
                                </button>
                            </>
                        ) : (
                            <>
                                <button className="flex-1 bg-blue-600 text-white font-black uppercase tracking-widest text-[10px] sm:text-[11px] py-4 sm:py-6 rounded-3xl shadow-xl shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-3">
                                    <UserPlus size={18} /> Initiate Tenancy
                                </button>
                                <button className="flex-1 bg-offwhite dark:bg-black text-zinc-900 dark:text-white font-black uppercase tracking-widest text-[10px] sm:text-[11px] py-4 sm:py-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-100 transition-all flex items-center justify-center gap-3">
                                    <Wrench size={18} /> Maintenance Hub
                                </button>
                            </>
                        )}
                    </div>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* LIGHTBOX / IMAGE EXPANDER */}
      {expandedImage && (
        <div 
          className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-4 md:p-10 animate-in fade-in zoom-in-95 duration-300"
          onClick={() => setExpandedImage(null)}
        >
           <button 
             className="absolute top-8 right-8 p-4 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all"
             onClick={(e) => { e.stopPropagation(); setExpandedImage(null); }}
           >
              <X size={32} />
           </button>
           <div className="relative w-full h-full flex items-center justify-center" onClick={e => e.stopPropagation()}>
              <img 
                src={expandedImage} 
                className="max-w-full max-h-full object-contain rounded-2xl shadow-[0_0_100px_rgba(37,99,235,0.2)]" 
                alt="Expanded View"
              />
           </div>
        </div>
      )}

      <style>{`
        .edit-field {
            @apply w-full px-6 py-4 bg-offwhite dark:bg-black border-2 border-zinc-100 dark:border-zinc-800 rounded-2xl text-sm sm:text-base font-bold text-zinc-900 dark:text-white focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #2563EB;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
      `}</style>
    </div>
  );
};

const InputWrapper = ({ label, children }: { label: string, children?: React.ReactNode }) => (
    <div className="space-y-2">
        <p className="text-[8px] sm:text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">{label}</p>
        {children}
    </div>
);

const DetailCard = ({ icon: Icon, label, value }: any) => (
  <div className="p-5 sm:p-8 bg-offwhite dark:bg-white/5 rounded-[1.5rem] sm:rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 group hover:border-blue-200 transition-colors shadow-sm">
    <div className="flex items-center justify-between mb-3 sm:mb-4">
        <p className="text-[8px] sm:text-[10px] font-black text-zinc-400 uppercase tracking-widest">{label}</p>
        <Icon className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
    </div>
    <p className="text-sm sm:text-xl font-black text-zinc-900 dark:text-white tracking-tighter truncate">{value}</p>
  </div>
);

export default Properties;