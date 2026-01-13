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
  
  const properties = useMemo(() => {
    return user.role === UserRole.AGENT || user.role === UserRole.ADMIN
      ? store.properties 
      : store.properties.filter(p => p.id === user.assignedPropertyId);
  }, [user, store]);

  const getStatusStyle = (status: PropertyStatus) => {
    switch (status) {
      case PropertyStatus.OCCUPIED: return 'bg-white text-emerald-600 border-emerald-100';
      case PropertyStatus.VACANT: return 'bg-white text-blue-600 border-blue-100';
      default: return 'bg-white text-zinc-400 border-zinc-100';
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tighter">Inventory</h1>
          <p className="text-zinc-400 font-medium">Managing {properties.length} lifecycle assets.</p>
        </div>
        {(user.role === UserRole.AGENT || user.role === UserRole.ADMIN) && (
          <button 
            onClick={() => setIsAdding(true)}
            className="w-full sm:w-auto bg-blue-600 text-white px-8 py-4 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20 font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 mr-2" /> Publish Asset
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {properties.map(property => (
          <div key={property.id} className="bg-white dark:bg-zinc-900 rounded-[2.5rem] overflow-hidden shadow-sm border border-zinc-100 dark:border-zinc-800 group hover:border-blue-200 transition-all duration-300">
            <div className="h-60 bg-offwhite dark:bg-black relative overflow-hidden">
              <img 
                src={`https://picsum.photos/seed/${property.id}/600/400`} 
                alt={property.name} 
                className="w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform duration-1000" 
              />
              <div className="absolute top-6 left-6">
                <span className={`px-4 py-2 rounded-full text-[9px] font-black uppercase border shadow-sm ${getStatusStyle(property.status)}`}>
                  {property.status}
                </span>
              </div>
            </div>
            <div className="p-8">
              <h3 className="text-xl font-black text-zinc-900 dark:text-white mb-2 leading-tight">{property.name}</h3>
              <div className="flex items-center text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-8">
                <MapPin className="w-3 h-3 mr-2 text-blue-600" />
                <span className="truncate">{property.location}</span>
              </div>
              
              <div className="flex items-center justify-between pt-6 border-t border-zinc-100 dark:border-zinc-800">
                <div>
                  <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Annual Yield</p>
                  <p className="text-2xl font-black text-zinc-900 dark:text-white tracking-tighter">₦{property.rent.toLocaleString()}</p>
                </div>
                <button 
                  onClick={() => setSelectedProperty(property)}
                  className="bg-offwhite dark:bg-black text-zinc-900 dark:text-white p-4 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-90"
                >
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal Overlay - High Legibility 90% Paper UI */}
      {selectedProperty && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-white/95 backdrop-blur-lg animate-in fade-in duration-300">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-5xl rounded-[3rem] shadow-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden flex flex-col md:flex-row max-h-[92vh]">
             <div className="w-full md:w-5/12 h-64 md:h-auto bg-offwhite relative">
                <img src={`https://picsum.photos/seed/${selectedProperty.id}/800/1200`} className="w-full h-full object-cover" />
                <button onClick={() => setSelectedProperty(null)} className="absolute top-8 left-8 p-4 bg-white/80 rounded-full text-zinc-900 md:hidden shadow-xl">
                  <X size={24} />
                </button>
             </div>
             <div className="flex-1 p-8 md:p-14 overflow-y-auto bg-white dark:bg-zinc-900">
                <div className="flex justify-between items-start mb-10">
                  <div>
                    <h2 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tighter mb-2">{selectedProperty.name}</h2>
                    <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 px-4 py-2 rounded-full text-[9px] font-black uppercase border border-blue-100 dark:border-blue-800 shadow-sm">{selectedProperty.status}</span>
                  </div>
                  <button onClick={() => setSelectedProperty(null)} className="hidden md:block p-4 bg-offwhite dark:bg-black hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full text-zinc-400 transition-colors">
                    <X size={24} />
                  </button>
                </div>
                
                <p className="text-zinc-500 font-bold leading-relaxed mb-12 text-lg">
                  {selectedProperty.description || "A premium urban unit optimized for seamless property lifecycle management and high-yield occupancy."}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-14">
                   <div className="p-8 bg-offwhite dark:bg-black rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800">
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Annual Rental Rate</p>
                      <p className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter">₦{selectedProperty.rent.toLocaleString()}</p>
                   </div>
                   <div className="p-8 bg-offwhite dark:bg-black rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800">
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Asset Intelligence</p>
                      <p className="text-base font-black text-zinc-900 dark:text-white uppercase truncate">{selectedProperty.location.split(',')[0]}</p>
                   </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 pt-10 border-t border-zinc-100 dark:border-zinc-800">
                  <button className="flex-1 bg-blue-600 text-white font-black uppercase tracking-widest text-[10px] py-6 rounded-3xl shadow-xl shadow-blue-600/20 active:scale-95 transition-all">
                    Initiate Tenancy
                  </button>
                  <button className="flex-1 bg-offwhite dark:bg-black text-zinc-900 dark:text-white font-black uppercase tracking-widest text-[10px] py-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-100 transition-all">
                    Support Ticket Hub
                  </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Properties;