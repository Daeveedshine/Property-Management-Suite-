import React, { useState, useMemo } from 'react';
import { User, UserRole, Property, PropertyStatus, PropertyCategory, PropertyType } from '../types';
import { getStore, saveStore } from '../store';
import { 
  MapPin, Plus, Edit, X, Wrench, Info, ArrowRight, DollarSign, 
  UserPlus, Save, Loader2, Tag, Layout, Briefcase, UserCheck, 
  Maximize2, Users, CalendarDays, Clock, FileText 
} from 'lucide-react';

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
    if (user.role === UserRole.ADMIN) return store.properties;
    if (user.role === UserRole.AGENT) {
      return store.properties.filter(p => p.agentId === user.id);
    }
    return store.properties.filter(p => p.id === user.assignedPropertyId);
  }, [user, store]);

  const eligibleTenants = useMemo(() => {
    if (user.role === UserRole.ADMIN) {
      return store.users.filter(u => u.role === UserRole.TENANT);
    }
    const applicationsForMe = store.applications.filter(app => 
      app.agentIdCode.toLowerCase() === user.id.toLowerCase() ||
      app.agentId.toLowerCase() === user.id.toLowerCase()
    );
    const tenantIds = Array.from(new Set(applicationsForMe.map(app => app.userId)));
    return store.users.filter(u => u.role === UserRole.TENANT && tenantIds.includes(u.id));
  }, [store.applications, store.users, user.id, user.role]);

  const getStatusStyle = (status: PropertyStatus) => {
    switch (status) {
      case PropertyStatus.OCCUPIED: return 'bg-emerald-500 text-white border-emerald-400/50 shadow-emerald-500/20';
      case PropertyStatus.VACANT: return 'bg-blue-600 text-white border-blue-500/50 shadow-blue-600/20';
      case PropertyStatus.LISTED: return 'bg-amber-500 text-white border-amber-400/50 shadow-amber-500/20';
      default: return 'bg-zinc-500 text-white border-zinc-400/50';
    }
  };

  const handleOpenDetail = (property: Property) => {
    setSelectedProperty(property);
    setEditFormData(property);
    setIsEditing(false);
  };

  const handleStartEdit = (e: React.MouseEvent, property: Property) => {
    e.stopPropagation();
    setSelectedProperty(property);
    setEditFormData(property);
    setIsEditing(true);
  };

  const calculateExpiryDate = (startDate: string) => {
    if (!startDate) return '';
    const date = new Date(startDate);
    date.setFullYear(date.getFullYear() + 1);
    date.setDate(date.getDate() - 1);
    return date.toISOString().split('T')[0];
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const start = e.target.value;
    const expiry = calculateExpiryDate(start);
    setEditFormData({ ...editFormData, rentStartDate: start, rentExpiryDate: expiry });
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

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-5xl font-black text-zinc-900 dark:text-white tracking-tighter">Inventory</h1>
          <p className="text-zinc-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-2 opacity-60">Asset Registry</p>
        </div>
        {(user.role === UserRole.AGENT || user.role === UserRole.ADMIN) && (
          <button 
            onClick={handlePublishNew}
            className="w-full sm:w-auto bg-blue-600 text-white px-10 py-5 rounded-[1.8rem] flex items-center justify-center shadow-2xl shadow-blue-600/20 font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-3" /> Publish Asset
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        {properties.map(property => {
          const propertyAgent = store.users.find(u => u.id === property.agentId);
          return (
            <div 
              key={property.id} 
              onClick={() => handleOpenDetail(property)}
              className="glass-card rounded-[3.2rem] overflow-hidden group hover:scale-[1.01] transition-all duration-700 cursor-pointer flex flex-col md:flex-row shadow-2xl border-white/20 dark:border-white/5"
            >
              {/* Media Part */}
              <div className="w-full md:w-5/12 h-80 md:h-auto bg-offwhite dark:bg-black relative overflow-hidden shrink-0">
                <img 
                  src={`https://picsum.photos/seed/${property.id}/600/800`} 
                  alt={property.name} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                />
                <div className="absolute top-6 left-6 flex flex-col gap-2">
                  <span className={`px-4 py-2 rounded-2xl text-[9px] font-black uppercase shadow-xl border backdrop-blur-md ${getStatusStyle(property.status)}`}>
                    {property.status}
                  </span>
                  <span className="px-4 py-2 rounded-2xl text-[9px] font-black uppercase border border-white/20 bg-white/30 backdrop-blur-md text-zinc-900 dark:text-white shadow-xl">
                    {property.category}
                  </span>
                </div>
              </div>

              {/* Data Part */}
              <div className="p-10 flex-1 flex flex-col justify-between space-y-8">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-black text-zinc-900 dark:text-white leading-tight tracking-tighter">{property.name}</h3>
                    {(user.role === UserRole.AGENT || user.role === UserRole.ADMIN) && (
                      <button 
                        onClick={(e) => handleStartEdit(e, property)}
                        className="p-3 bg-white/10 dark:bg-white/5 rounded-2xl text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all border border-white/10"
                      >
                        <Edit size={16} />
                      </button>
                    )}
                  </div>
                  
                  <div className="flex items-center text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-10">
                    <MapPin className="w-3.5 h-3.5 mr-2 text-blue-600" />
                    <span className="truncate">{property.location}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="p-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
                      <p className="text-[8px] font-black text-zinc-500 uppercase mb-1">Type</p>
                      <p className="text-xs font-black text-zinc-900 dark:text-white truncate">{property.type}</p>
                    </div>
                    <div className="p-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
                      <p className="text-[8px] font-black text-zinc-500 uppercase mb-1">Term</p>
                      <p className="text-xs font-black text-zinc-900 dark:text-white truncate">Annual (1yr)</p>
                    </div>
                    <div className="p-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
                      <p className="text-[8px] font-black text-zinc-500 uppercase mb-1 flex items-center gap-1">Start</p>
                      <p className="text-xs font-black text-zinc-900 dark:text-white">{property.rentStartDate || '---'}</p>
                    </div>
                    <div className="p-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
                      <p className="text-[8px] font-black text-zinc-500 uppercase mb-1 flex items-center gap-1">Expiry</p>
                      <p className="text-xs font-black text-blue-600 dark:text-blue-400">
                        {property.rentExpiryDate || '---'}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10 backdrop-blur-sm">
                    <p className="text-[8px] font-black text-zinc-500 uppercase mb-2 flex items-center gap-1 tracking-widest"><FileText size={10}/> Summary</p>
                    <p className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-2 italic">
                      {property.description || "Portfolio brief pending submission."}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-6 border-t border-white/10">
                  <div className="flex flex-col">
                    <p className="text-[8px] font-black text-zinc-500 uppercase mb-1 tracking-widest">Agent Registry</p>
                    <div className="flex items-center gap-2">
                       <div className="w-6 h-6 bg-blue-600/20 rounded-lg flex items-center justify-center text-[10px] font-black text-blue-600 uppercase border border-blue-600/20">
                          {propertyAgent?.name.charAt(0)}
                       </div>
                       <p className="text-[10px] font-black text-zinc-900 dark:text-white uppercase truncate">{propertyAgent?.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] font-black text-zinc-500 uppercase mb-1 tracking-widest">Yield</p>
                    <p className="text-2xl font-black text-zinc-900 dark:text-white tracking-tighter leading-none">₦{property.rent.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Asset Inspector Modal */}
      {selectedProperty && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-3xl animate-in fade-in duration-500">
          <div className="glass-card w-full max-w-6xl md:rounded-[3.5rem] shadow-[0_32px_128px_rgba(0,0,0,0.5)] border-white/20 dark:border-white/5 overflow-hidden flex flex-col md:flex-row h-full md:h-auto md:max-h-[92vh]">
             
             <div 
               className="w-full md:w-5/12 h-72 md:h-auto relative group cursor-pointer shrink-0"
               onClick={() => setExpandedImage(`https://picsum.photos/seed/${selectedProperty.id}/1200/1600`)}
             >
                <img src={`https://picsum.photos/seed/${selectedProperty.id}/800/1200`} className="w-full h-full object-cover" alt="Property Preview" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Maximize2 className="text-white" size={48} />
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-10">
                    <p className="text-white font-black text-3xl tracking-tighter">{selectedProperty.name}</p>
                    <p className="text-white/60 text-[11px] font-black uppercase tracking-widest flex items-center gap-2 mt-2">
                      <MapPin size={12} className="text-blue-400" /> {selectedProperty.location}
                    </p>
                </div>
                <button onClick={() => setSelectedProperty(null)} className="absolute top-8 left-8 p-3 glass-card rounded-full text-white md:hidden shadow-xl z-10">
                  <X size={20} />
                </button>
             </div>

             <div className="flex-1 p-8 md:p-14 overflow-y-auto custom-scrollbar scroll-smooth">
                <div className="flex justify-between items-start mb-12">
                  <div className="space-y-4 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                        <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase shadow-lg border backdrop-blur-md ${getStatusStyle(selectedProperty.status)}`}>{selectedProperty.status}</span>
                        <span className="bg-white/10 border border-white/20 text-zinc-700 dark:text-zinc-300 px-4 py-1.5 rounded-xl text-[9px] font-black uppercase">{selectedProperty.category}</span>
                    </div>
                    {isEditing ? (
                        <input 
                            className="glass-input text-3xl font-black text-zinc-900 dark:text-white tracking-tighter p-4 rounded-2xl w-full outline-none" 
                            value={editFormData.name} 
                            onChange={e => setEditFormData({...editFormData, name: e.target.value})}
                        />
                    ) : (
                        <h2 className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-white tracking-tighter leading-tight">{selectedProperty.name}</h2>
                    )}
                  </div>
                  <div className="flex gap-4 ml-6">
                    {(user.role === UserRole.AGENT || user.role === UserRole.ADMIN) && !isEditing && (
                        <button 
                            onClick={() => setIsEditing(true)}
                            className="p-4 glass-input rounded-full text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
                        >
                            <Edit size={20} />
                        </button>
                    )}
                    <button onClick={() => setSelectedProperty(null)} className="p-4 glass-input rounded-full text-zinc-500 hover:text-rose-500 transition-all hidden md:block">
                        <X size={20} />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-12">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        {isEditing ? (
                            <>
                                <InputWrapper label="Location">
                                    <input className="glass-input w-full p-4 rounded-xl text-sm font-bold" value={editFormData.location} onChange={e => setEditFormData({...editFormData, location: e.target.value})} />
                                </InputWrapper>
                                <InputWrapper label="Annual Rent (₦)">
                                    <input type="number" className="glass-input w-full p-4 rounded-xl text-sm font-bold" value={editFormData.rent} onChange={e => setEditFormData({...editFormData, rent: parseInt(e.target.value) || 0})} />
                                </InputWrapper>
                                <InputWrapper label="Status">
                                    <select className="glass-input w-full p-4 rounded-xl text-sm font-bold appearance-none" value={editFormData.status} onChange={e => setEditFormData({...editFormData, status: e.target.value as PropertyStatus})}>
                                        <option value={PropertyStatus.DRAFT}>DRAFT</option>
                                        <option value={PropertyStatus.LISTED}>LISTED</option>
                                        <option value={PropertyStatus.VACANT}>VACANT</option>
                                        <option value={PropertyStatus.OCCUPIED}>OCCUPIED</option>
                                        <option value={PropertyStatus.ARCHIVED}>ARCHIVED</option>
                                    </select>
                                </InputWrapper>
                                <InputWrapper label="Lifecycle Start">
                                    <input type="date" className="glass-input w-full p-4 rounded-xl text-sm font-bold" value={editFormData.rentStartDate || ''} onChange={handleStartDateChange} />
                                </InputWrapper>
                            </>
                        ) : (
                            <>
                                <DetailCard icon={MapPin} label="Location" value={selectedProperty.location} />
                                <DetailCard icon={DollarSign} label="Annual Yield" value={`₦${selectedProperty.rent.toLocaleString()}`} />
                                <DetailCard icon={Layout} label="Type" value={selectedProperty.type} />
                                {selectedProperty.rentStartDate && <DetailCard icon={CalendarDays} label="Start" value={selectedProperty.rentStartDate} />}
                            </>
                        )}
                    </div>

                    <div className="space-y-4">
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                            <Info size={14} className="text-blue-600" /> Executive Summary
                        </p>
                        {isEditing ? (
                            <textarea 
                                className="glass-input w-full h-44 p-6 rounded-[2rem] text-sm font-bold resize-none" 
                                value={editFormData.description} 
                                onChange={e => setEditFormData({...editFormData, description: e.target.value})}
                            />
                        ) : (
                            <p className="text-zinc-600 dark:text-zinc-400 font-bold leading-relaxed text-lg border-l-4 border-blue-600 pl-8 py-6 bg-white/5 backdrop-blur-md rounded-r-[2.5rem]">
                                {selectedProperty.description || "Portfolio brief pending submission."}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-6 pt-12 border-t border-white/10">
                        {isEditing ? (
                            <>
                                <button 
                                    onClick={handleSave} 
                                    disabled={isSaving}
                                    className="flex-[2] bg-blue-600 text-white font-black uppercase tracking-[0.2em] text-[10px] py-6 rounded-3xl shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                    Commit Lifecycle Updates
                                </button>
                                <button 
                                    onClick={() => { setIsEditing(false); setEditFormData(selectedProperty); }}
                                    className="flex-1 glass-input text-zinc-900 dark:text-white font-black uppercase tracking-[0.2em] text-[10px] py-6 rounded-3xl hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    <X size={18} /> Discard
                                </button>
                            </>
                        ) : (
                            <>
                                <button className="flex-1 bg-blue-600 text-white font-black uppercase tracking-[0.2em] text-[10px] py-6 rounded-[2rem] shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3">
                                    <UserPlus size={20} /> Initiate Tenancy
                                </button>
                                <button className="flex-1 glass-input text-zinc-900 dark:text-white font-black uppercase tracking-[0.2em] text-[10px] py-6 rounded-[2rem] hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center gap-3">
                                    <Wrench size={20} /> Support Hub
                                </button>
                            </>
                        )}
                    </div>
                </div>
             </div>
          </div>
        </div>
      )}

      {expandedImage && (
        <div 
          className="fixed inset-0 z-[150] bg-black/90 backdrop-blur-3xl flex items-center justify-center p-10 animate-in fade-in zoom-in-95 duration-500"
          onClick={() => setExpandedImage(null)}
        >
           <button className="absolute top-10 right-10 p-5 glass-card rounded-full text-white" onClick={() => setExpandedImage(null)}>
              <X size={32} />
           </button>
           <img src={expandedImage} className="max-w-full max-h-full object-contain rounded-3xl shadow-[0_0_80px_rgba(0,0,0,0.4)]" alt="Full Preview" />
        </div>
      )}
    </div>
  );
};

const InputWrapper = ({ label, children }: { label: string, children?: React.ReactNode }) => (
    <div className="space-y-2">
        <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">{label}</p>
        {children}
    </div>
);

const DetailCard = ({ icon: Icon, label, value }: any) => (
  <div className="p-8 bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/10 group hover:border-blue-600 transition-colors shadow-xl">
    <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">{label}</p>
        <Icon className="w-4 h-4 text-blue-600" />
    </div>
    <p className="text-xl font-black text-zinc-900 dark:text-white tracking-tighter truncate leading-tight">{value}</p>
  </div>
);

export default Properties;