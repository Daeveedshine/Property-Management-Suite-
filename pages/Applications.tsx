import React, { useState, useMemo, useRef } from 'react';
import { User, TenantApplication, ApplicationStatus, NotificationType } from '../types';
import { getStore, saveStore } from '../store';
import { 
  CheckCircle, ArrowRight, ArrowLeft, Building, ShieldCheck, 
  Loader2, MapPin, UserCheck, 
  Search, Camera, Fingerprint, 
  Briefcase, Users, Phone, PenTool, Calendar, History, FileText, Eye,
  UserPlus, Download, Trash2, Edit3, Image as ImageIcon, AlertCircle
} from 'lucide-react';

interface ApplicationsProps {
  user: User;
  onNavigate: (view: string) => void;
}

const Applications: React.FC<ApplicationsProps> = ({ user, onNavigate }) => {
  const store = getStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const passportInputRef = useRef<HTMLInputElement>(null);
  
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewingApp, setViewingApp] = useState<TenantApplication | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<TenantApplication>>({
    firstName: '',
    surname: '',
    middleName: '',
    maritalStatus: 'Single',
    gender: 'Male',
    currentHomeAddress: '',
    occupation: '',
    familySize: 1,
    phoneNumber: user.phone || '',
    reasonForRelocating: '',
    currentLandlordName: '',
    currentLandlordPhone: '',
    verificationType: 'NIN',
    verificationIdNumber: '',
    verificationUrl: '',
    passportPhotoUrl: '',
    agentIdCode: '',
    signature: '',
    applicationDate: new Date().toISOString().split('T')[0]
  });

  const myApplications = useMemo(() => {
    return store.applications
      .filter(app => app.userId === user.id)
      .sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime());
  }, [store.applications, user.id]);

  const targetAgent = useMemo(() => {
    if (!formData.agentIdCode) return null;
    return store.users.find(u => u.id.toLowerCase() === formData.agentIdCode?.toLowerCase());
  }, [store.users, formData.agentIdCode]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'verificationUrl' | 'passportPhotoUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, [field]: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleEdit = (app: TenantApplication) => {
    setEditingId(app.id);
    setFormData({ ...app });
    setStep(1);
    setActiveTab('new');
  };

  const handleSubmit = async () => {
    if (!targetAgent) return;
    setIsSubmitting(true);
    
    // Simulate scoring
    const score = 70 + Math.floor(Math.random() * 25);
    const recommendation = score > 80 
      ? "Verified candidate with clean profile. High stability rating." 
      : "Standard profile. Verification thresholds passed.";

    setTimeout(() => {
      let updatedApplications;
      if (editingId) {
        updatedApplications = store.applications.map(app => 
          app.id === editingId 
            ? { ...app, ...formData, riskScore: score, aiRecommendation: recommendation, submissionDate: new Date().toISOString() } as TenantApplication
            : app
        );
      } else {
        const newApp: TenantApplication = {
          id: `app${Date.now()}`,
          userId: user.id,
          propertyId: 'PENDING',
          agentId: targetAgent.id, 
          status: ApplicationStatus.PENDING,
          submissionDate: new Date().toISOString(),
          ...formData,
          riskScore: score,
          aiRecommendation: recommendation
        } as TenantApplication;
        updatedApplications = [...store.applications, newApp];
      }

      const agentNotification = {
        id: `n_app_${Date.now()}`,
        userId: targetAgent.id,
        title: editingId ? 'Application Updated' : 'New Enrollment Form',
        message: `${formData.firstName} ${formData.surname} has ${editingId ? 'modified their' : 'submitted a new'} dossier.`,
        type: NotificationType.INFO,
        timestamp: new Date().toISOString(),
        isRead: false,
        linkTo: 'screenings'
      };

      const newState = { 
        ...store, 
        applications: updatedApplications,
        notifications: [agentNotification, ...store.notifications]
      };
      saveStore(newState);
      setIsSubmitting(false);
      setActiveTab('history');
      setEditingId(null);
      setFormData({
        firstName: '', surname: '', middleName: '', maritalStatus: 'Single', gender: 'Male',
        currentHomeAddress: '', occupation: '', familySize: 1, phoneNumber: user.phone || '',
        reasonForRelocating: '', currentLandlordName: '', currentLandlordPhone: '',
        verificationType: 'NIN', verificationIdNumber: '', verificationUrl: '',
        passportPhotoUrl: '', agentIdCode: '', signature: '',
        applicationDate: new Date().toISOString().split('T')[0]
      });
    }, 1500);
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const getStatusStyle = (status: ApplicationStatus) => {
    switch (status) {
      case ApplicationStatus.APPROVED: return 'bg-emerald-600/10 text-emerald-500 border-emerald-500/20';
      case ApplicationStatus.REJECTED: return 'bg-rose-600/10 text-rose-500 border-rose-500/20';
      case ApplicationStatus.PENDING: return 'bg-amber-600/10 text-amber-500 border-amber-600/20';
      default: return 'bg-zinc-800 text-zinc-400 border-zinc-700';
    }
  };

  const isStep1Valid = formData.firstName && formData.surname && formData.phoneNumber && formData.gender;
  const isStep2Valid = formData.currentHomeAddress && formData.occupation && formData.reasonForRelocating;
  const isStep3Valid = !!formData.verificationUrl && !!formData.passportPhotoUrl && formData.verificationIdNumber;
  const isStep4Valid = !!targetAgent;
  const isStep5Valid = formData.signature && formData.signature.length > 2;

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-500 pb-24">
      <header className="text-center space-y-6 print:hidden">
        <div className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-[0.3em]">
           Tenancy Hub • Global Enrollment
        </div>
        <h1 className="text-5xl font-black text-white tracking-tighter">
          {editingId ? 'Modify Dossier' : 'Dossier Filing'}
        </h1>
        
        <div className="flex justify-center p-1 bg-zinc-900 rounded-3xl w-fit mx-auto border border-zinc-800">
           <button 
             onClick={() => { setActiveTab('new'); setViewingApp(null); setStep(1); setEditingId(null); }} 
             className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'new' ? 'bg-white text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}
           >
             <UserPlus className="inline-block mr-2 w-4 h-4" /> {editingId ? 'Editing Form' : 'Filing Form'}
           </button>
           <button 
             onClick={() => { setActiveTab('history'); setViewingApp(null); }} 
             className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-white text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}
           >
             <History className="inline-block mr-2 w-4 h-4" /> Active Submissions ({myApplications.length})
           </button>
        </div>
      </header>

      {activeTab === 'new' ? (
        <div className="space-y-12 print:hidden">
          <div className="text-center">
            <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-[0.3em]">Stage {step} of 5</p>
            <div className="flex gap-2 max-w-xs mx-auto mt-4">
                {[1,2,3,4,5].map(i => (
                    <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i <= step ? 'bg-blue-600 shadow-xl' : 'bg-zinc-800'}`}></div>
                ))}
            </div>
          </div>

          <div className="bg-zinc-900 p-8 md:p-14 rounded-[3.5rem] border border-zinc-800 shadow-2xl">
            {step === 1 && (
               <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
                   <div className="flex items-center gap-4 text-blue-500">
                       <UserCheck size={32} />
                       <h3 className="text-2xl font-black">Personal Identity</h3>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       <InputGroup label="Surname" value={formData.surname!} onChange={v => setFormData({...formData, surname: v})} />
                       <InputGroup label="First Name" value={formData.firstName!} onChange={v => setFormData({...formData, firstName: v})} />
                       <InputGroup label="Other Name" value={formData.middleName!} onChange={v => setFormData({...formData, middleName: v})} />
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <SelectGroup label="Gender" value={formData.gender!} options={['Male', 'Female']} onChange={v => setFormData({...formData, gender: v as any})} />
                      <SelectGroup label="Marital Status" value={formData.maritalStatus!} options={['Single', 'Married', 'Widower', 'Widow']} onChange={v => setFormData({...formData, maritalStatus: v as any})} />
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-zinc-800">
                       <InputGroup label="Phone Number" value={formData.phoneNumber!} onChange={v => setFormData({...formData, phoneNumber: v})} placeholder="+234..." />
                   </div>
                   <button onClick={nextStep} disabled={!isStep1Valid} className="w-full bg-blue-600 text-white py-6 rounded-3xl font-black uppercase tracking-widest text-xs disabled:opacity-50 flex items-center justify-center gap-2 transform active:scale-95 transition-all">Proceed to Background <ArrowRight size={16} /></button>
               </div>
            )}

            {step === 2 && (
               <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
                   <div className="flex items-center gap-4 text-blue-500">
                       <MapPin size={32} />
                       <h3 className="text-2xl font-black">Residential History</h3>
                   </div>
                   <div className="space-y-6">
                       <InputGroup label="Current Home Address" value={formData.currentHomeAddress!} onChange={v => setFormData({...formData, currentHomeAddress: v})} />
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <InputGroup label="Occupation" value={formData.occupation!} onChange={v => setFormData({...formData, occupation: v})} />
                          <InputGroup label="Family Size" type="number" value={formData.familySize!} onChange={v => setFormData({...formData, familySize: parseInt(v) || 0})} />
                       </div>
                   </div>
                   <div className="p-8 bg-black/40 rounded-[2.5rem] border border-zinc-800 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <InputGroup label="Current Landlord Name" value={formData.currentLandlordName!} onChange={v => setFormData({...formData, currentLandlordName: v})} />
                         <InputGroup label="Landlord Contact" value={formData.currentLandlordPhone!} onChange={v => setFormData({...formData, currentLandlordPhone: v})} />
                      </div>
                      <InputGroup label="Reason for Relocation" value={formData.reasonForRelocating!} onChange={v => setFormData({...formData, reasonForRelocating: v})} isTextArea />
                   </div>
                   <div className="flex gap-4">
                       <button onClick={prevStep} className="flex-1 bg-zinc-800 text-zinc-400 py-6 rounded-3xl font-black uppercase tracking-widest text-xs">Back</button>
                       <button onClick={nextStep} disabled={!isStep2Valid} className="flex-[2] bg-blue-600 text-white py-6 rounded-3xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2">Verify Documents <ArrowRight size={16} /></button>
                   </div>
               </div>
            )}

            {step === 3 && (
               <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
                   <div className="flex items-center gap-4 text-blue-500">
                       <Fingerprint size={32} />
                       <h3 className="text-2xl font-black">Digital Verification</h3>
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Passport Photograph</label>
                        <input type="file" ref={passportInputRef} className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'passportPhotoUrl')} />
                        <button onClick={() => passportInputRef.current?.click()} className={`w-full aspect-square rounded-[3rem] border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all relative overflow-hidden ${formData.passportPhotoUrl ? 'border-blue-500 bg-blue-500/10' : 'border-zinc-800 bg-black/20 hover:border-zinc-600'}`}>
                           {formData.passportPhotoUrl ? (
                             <img src={formData.passportPhotoUrl} className="absolute inset-0 w-full h-full object-cover" alt="Passport" />
                           ) : (
                             <>
                               <Camera size={32} className="text-zinc-600" />
                               <span className="text-[10px] font-black uppercase text-zinc-500">Click to Capture</span>
                             </>
                           )}
                        </button>
                      </div>

                      <div className="space-y-6">
                        <SelectGroup label="ID Document Type" value={formData.verificationType!} options={['NIN', 'Passport', "Voter's Card", "Driver's License"]} onChange={v => setFormData({...formData, verificationType: v as any})} />
                        <InputGroup label="Document Number" value={formData.verificationIdNumber!} onChange={v => setFormData({...formData, verificationIdNumber: v})} />
                        
                        <div className="space-y-4 pt-4">
                           <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Identity Scan</label>
                           <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'verificationUrl')} />
                           <button onClick={() => fileInputRef.current?.click()} className={`w-full h-40 rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all relative overflow-hidden ${formData.verificationUrl ? 'border-blue-500 bg-blue-500/10' : 'border-zinc-800 bg-black/20 hover:border-zinc-600'}`}>
                              {formData.verificationUrl ? (
                                <img src={formData.verificationUrl} className="absolute inset-0 w-full h-full object-cover opacity-60" alt="ID Scan" />
                              ) : (
                                <>
                                  <ImageIcon size={24} className="text-zinc-600" />
                                  <span className="text-[10px] font-black uppercase text-zinc-500">Upload Doc Scan</span>
                                </>
                              )}
                           </button>
                        </div>
                      </div>
                   </div>

                   <div className="flex gap-4 pt-6">
                       <button onClick={prevStep} className="flex-1 bg-zinc-800 text-zinc-400 py-6 rounded-3xl font-black uppercase tracking-widest text-xs">Back</button>
                       <button onClick={nextStep} disabled={!isStep3Valid} className="flex-[2] bg-blue-600 text-white py-6 rounded-3xl font-black uppercase tracking-widest text-xs">Route to Agent <ArrowRight size={16} /></button>
                   </div>
               </div>
            )}

            {step === 4 && (
               <div className="space-y-10 animate-in slide-in-from-right-4 duration-500 text-center">
                   <div className="inline-block p-8 bg-blue-600/10 rounded-full text-blue-500 mb-2">
                      <UserCheck size={64} />
                   </div>
                   <h3 className="text-3xl font-black">Final Routing</h3>
                   <div className="max-w-md mx-auto space-y-8">
                       <p className="text-zinc-500 font-bold leading-relaxed">Enter your Agent's unique Suite ID code. This dossier will be privately routed to their Command Center for review.</p>
                       <div className="relative">
                          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600" size={24} />
                          <input 
                            className="w-full pl-16 pr-8 py-6 bg-black border-2 border-zinc-800 rounded-[2.5rem] text-2xl font-black text-white outline-none focus:ring-4 focus:ring-blue-600/20 tracking-widest uppercase transition-all" 
                            placeholder="SUITE-AGENT-ID" 
                            value={formData.agentIdCode} 
                            onChange={e => setFormData({...formData, agentIdCode: e.target.value})} 
                          />
                       </div>
                       {formData.agentIdCode && (
                          <div className={`p-6 rounded-3xl border-2 animate-in zoom-in duration-300 ${targetAgent ? 'bg-emerald-600/10 border-emerald-500/40 text-emerald-400' : 'bg-rose-600/10 border-rose-500/40 text-rose-400'}`}>
                             {targetAgent ? (
                               <div className="flex items-center justify-center gap-3">
                                 <CheckCircle size={20} />
                                 <span className="font-black uppercase text-xs">Verified Agent: {targetAgent.name}</span>
                               </div>
                             ) : (
                               <div className="flex items-center justify-center gap-3">
                                 <AlertCircle size={20} />
                                 <span className="font-black uppercase text-xs">Invalid Agent ID — Check Code</span>
                               </div>
                             )}
                          </div>
                       )}
                   </div>
                   <div className="flex gap-4 pt-10">
                       <button onClick={prevStep} className="flex-1 bg-zinc-800 text-zinc-400 py-6 rounded-3xl font-black uppercase tracking-widest text-xs">Back</button>
                       <button onClick={nextStep} disabled={!isStep4Valid} className="flex-[2] bg-blue-600 text-white py-6 rounded-3xl font-black uppercase tracking-widest text-xs">Seal Dossier <ArrowRight size={16} /></button>
                   </div>
               </div>
            )}

            {step === 5 && (
               <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
                   <div className="flex items-center gap-4 text-blue-500">
                       <PenTool size={32} />
                       <h3 className="text-2xl font-black">Authentication</h3>
                   </div>
                   <div className="bg-white rounded-[3rem] p-10 md:p-14 space-y-12">
                       <div className="flex justify-between items-center pb-6 border-b border-zinc-100">
                           <div className="flex items-center gap-2 text-zinc-400">
                             <Calendar size={16} />
                             <span className="text-[10px] font-black uppercase tracking-widest">Enrollment Date</span>
                           </div>
                           <span className="text-black font-black text-sm">{formData.applicationDate}</span>
                       </div>

                       <div className="space-y-6">
                           <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">Digital Legal Signature</label>
                           <input 
                               className="w-full px-8 py-14 bg-zinc-50 border-4 border-dashed border-zinc-100 rounded-[2.5rem] text-5xl font-serif italic text-black text-center outline-none" 
                               placeholder="Type Full Legal Name"
                               value={formData.signature}
                               onChange={e => setFormData({...formData, signature: e.target.value})}
                           />
                           <p className="text-[10px] text-zinc-400 text-center font-bold uppercase tracking-[0.2em] leading-relaxed">
                             I certify that the information provided is accurate and my digital signature holds legal validity.
                           </p>
                       </div>
                   </div>
                   <div className="flex gap-4 pt-6">
                       <button onClick={prevStep} className="flex-1 bg-zinc-800 text-zinc-400 py-6 rounded-3xl font-black uppercase tracking-widest text-xs">Back</button>
                       <button 
                           onClick={handleSubmit} 
                           disabled={!isStep5Valid || isSubmitting}
                           className="flex-[2] bg-blue-600 text-white py-6 rounded-3xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-2xl shadow-blue-900/40 disabled:opacity-50"
                       >
                           {isSubmitting ? <Loader2 className="animate-spin" /> : <ShieldCheck />}
                           {isSubmitting ? 'Securing Records...' : (editingId ? 'Update Official Enrollment' : 'Submit Official Enrollment')}
                       </button>
                   </div>
               </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {viewingApp ? (
            <div className="animate-in slide-in-from-bottom-10 duration-700">
               <div className="mb-8 flex justify-between items-center print:hidden">
                 <button onClick={() => setViewingApp(null)} className="flex items-center text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-all">
                   <ArrowLeft className="mr-2 w-4 h-4" /> Back to History
                 </button>
                 <div className="flex gap-3">
                   <button onClick={() => handleEdit(viewingApp)} className="flex items-center gap-2 bg-zinc-800 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-700 transition-all">
                     <Edit3 size={16} /> Modify Details
                   </button>
                   <button onClick={() => window.print()} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl">
                     <Download size={16} /> Export Dossier
                   </button>
                 </div>
               </div>

               {/* Full View Dossier */}
               <div className="bg-white rounded-[4rem] overflow-hidden shadow-2xl print:shadow-none print:rounded-none">
                  {/* PDF Header (Hidden in app) */}
                  <div className="hidden print:flex items-center justify-between border-b-[8px] border-blue-600 p-12 mb-10">
                    <div className="flex items-center gap-4">
                      <div className="bg-zinc-900 text-white p-5 rounded-3xl"><Building size={32} /></div>
                      <div>
                        <h1 className="text-4xl font-black text-zinc-900 tracking-tighter">PMS</h1>
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">Official Tenancy Enrollment</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Dossier ID</p>
                      <p className="font-mono font-bold text-blue-600">{viewingApp.id}</p>
                    </div>
                  </div>

                  <div className="bg-zinc-900 p-10 md:p-14 text-white flex flex-col md:flex-row justify-between items-center gap-10 print:bg-white print:text-black print:border-b print:pb-12">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                      <div className="w-32 h-32 bg-white rounded-[2.5rem] overflow-hidden border-2 border-white/10 shadow-2xl print:border-zinc-200">
                        <img src={viewingApp.passportPhotoUrl} className="w-full h-full object-cover" alt="Headshot" />
                      </div>
                      <div className="text-center md:text-left">
                        <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-2">{viewingApp.firstName} {viewingApp.surname}</h2>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                           <span className={`px-5 py-1.5 rounded-full text-[10px] font-black uppercase border ${getStatusStyle(viewingApp.status)}`}>
                             {viewingApp.status} Candidate
                           </span>
                           <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">
                             Filed {new Date(viewingApp.submissionDate).toLocaleDateString()}
                           </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-center px-12 py-8 bg-black/40 rounded-[2.5rem] border border-white/5 print:bg-zinc-50 print:border-zinc-100 print:shadow-none">
                      <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] mb-2">Stability Rating</p>
                      <p className="text-6xl font-black text-emerald-400 print:text-emerald-600">{viewingApp.riskScore}%</p>
                    </div>
                  </div>

                  <div className="p-10 md:p-16 space-y-16 text-black print:p-0 print:pt-12">
                     <section className="space-y-8">
                        <h3 className="text-xs font-black text-zinc-400 uppercase tracking-[0.4em] border-b-2 border-zinc-100 pb-4 flex items-center">
                           01: Profile Information
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
                           <DataPoint label="Surname" value={viewingApp.surname} />
                           <DataPoint label="First Name" value={viewingApp.firstName} />
                           <DataPoint label="Other Name" value={viewingApp.middleName} />
                           <DataPoint label="Gender" value={viewingApp.gender} />
                           <DataPoint label="Marital Status" value={viewingApp.maritalStatus} />
                           <DataPoint label="Occupation" value={viewingApp.occupation} />
                           <DataPoint label="Phone Number" value={viewingApp.phoneNumber} />
                           <DataPoint label="Family Size" value={viewingApp.familySize} />
                        </div>
                     </section>

                     <section className="space-y-8">
                        <h3 className="text-xs font-black text-zinc-400 uppercase tracking-[0.4em] border-b-2 border-zinc-100 pb-4 flex items-center">
                           02: Residential History
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                           <DataPoint label="Current Address" value={viewingApp.currentHomeAddress} />
                           <DataPoint label="Reason for Relocation" value={viewingApp.reasonForRelocating} />
                           <DataPoint label="Current Landlord" value={viewingApp.currentLandlordName} />
                           <DataPoint label="Landlord Phone" value={viewingApp.currentLandlordPhone} />
                        </div>
                     </section>

                     <section className="space-y-8">
                        <h3 className="text-xs font-black text-zinc-400 uppercase tracking-[0.4em] border-b-2 border-zinc-100 pb-4 flex items-center">
                           03: Identity Documents
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                           <div className="space-y-8">
                              <DataPoint label="Verification Method" value={viewingApp.verificationType} />
                              <DataPoint label="ID Number" value={viewingApp.verificationIdNumber} />
                              <div className="bg-zinc-50 p-6 rounded-3xl border border-zinc-100">
                                 <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Verification Scan</p>
                                 <img src={viewingApp.verificationUrl} className="w-full h-auto rounded-2xl max-h-56 object-contain shadow-xl" alt="ID Document" />
                              </div>
                           </div>
                           <div className="p-12 bg-zinc-950 rounded-[3.5rem] flex flex-col items-center justify-center text-center print:bg-white print:border-4 print:rounded-none">
                              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] mb-6">Digital Signature Authentication</p>
                              <p className="text-5xl font-serif italic text-white border-b-2 border-zinc-800 pb-4 px-10 print:text-black print:border-zinc-200">
                                {viewingApp.signature}
                              </p>
                              <div className="mt-8 flex items-center gap-3 text-emerald-500">
                                 <ShieldCheck size={20} />
                                 <span className="text-[9px] font-black uppercase tracking-[0.3em]">Authenticity Encrypted</span>
                              </div>
                           </div>
                        </div>
                     </section>

                     <div className="hidden print:block pt-12 border-t text-center text-zinc-300">
                        <p className="text-[8px] font-black uppercase tracking-[0.5em]">This is an official document of the PropLifecycle Suite</p>
                     </div>
                  </div>
               </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {myApplications.length > 0 ? myApplications.map(app => (
                <div key={app.id} className="bg-zinc-900 border border-zinc-800 p-8 rounded-[3rem] flex flex-col md:flex-row justify-between items-center gap-8 group hover:border-blue-500 transition-all duration-500">
                  <div className="flex items-center gap-8 w-full">
                    <div className="w-20 h-20 bg-zinc-800 rounded-3xl overflow-hidden border border-zinc-700 shadow-xl group-hover:scale-110 transition-transform">
                      <img src={app.passportPhotoUrl} className="w-full h-full object-cover grayscale group-hover:grayscale-0" alt="Headshot" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-3xl font-black text-white truncate">{app.firstName} {app.surname}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">ID: {app.id.substring(3)}</span>
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${getStatusStyle(app.status)}`}>
                          {app.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <button onClick={() => setViewingApp(app)} className="bg-zinc-800 text-white p-5 rounded-2xl hover:bg-blue-600 transition-all shadow-xl"><Eye size={24} /></button>
                    <button onClick={() => handleEdit(app)} className="bg-zinc-800 text-white p-5 rounded-2xl hover:bg-emerald-600 transition-all shadow-xl"><Edit3 size={24} /></button>
                  </div>
                </div>
              )) : (
                <div className="py-32 text-center bg-zinc-950 rounded-[4rem] border-2 border-dashed border-zinc-800 text-zinc-700">
                   <FileText size={48} className="mx-auto mb-6 opacity-20" />
                   <p className="font-black uppercase tracking-[0.3em] text-xs">No dossiers filed in current cycle.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <style>{`
        @media print {
          html, body, #root, main, .flex, .flex-1, .max-w-6xl, .h-screen, .overflow-auto { height: auto !important; overflow: visible !important; position: static !important; background: white !important; color: black !important; }
          aside, nav, header, .print\\:hidden { display: none !important; }
          main { padding: 0 !important; margin: 0 !important; width: 100% !important; }
          @page { size: A4; margin: 2cm; }
          .bg-zinc-900, .bg-zinc-950, .bg-black { background-color: white !important; color: black !important; }
          .text-white { color: black !important; }
          section { page-break-inside: avoid; }
        }
      `}</style>
    </div>
  );
};

const InputGroup = ({ label, value, onChange, placeholder = '', type = 'text', isTextArea = false }: any) => (
  <div className="space-y-2">
    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">{label}</label>
    {isTextArea ? (
      <textarea 
        className="w-full px-5 py-4 bg-white rounded-2xl text-sm font-bold text-black outline-none focus:ring-4 focus:ring-blue-600/20 h-24 resize-none" 
        value={value} 
        onChange={e => onChange(e.target.value)} 
        placeholder={placeholder}
      />
    ) : (
      <input 
        type={type}
        className="w-full px-5 py-4 bg-white rounded-2xl text-sm font-bold text-black outline-none focus:ring-4 focus:ring-blue-600/20" 
        value={value} 
        onChange={e => onChange(e.target.value)} 
        placeholder={placeholder}
      />
    )}
  </div>
);

const SelectGroup = ({ label, value, options, onChange }: any) => (
  <div className="space-y-2">
    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">{label}</label>
    <select 
      className="w-full px-5 py-4 bg-white rounded-2xl text-sm font-bold text-black outline-none appearance-none cursor-pointer" 
      value={value} 
      onChange={e => onChange(e.target.value)}
    >
      {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

const DataPoint = ({ label, value }: { label: string, value: string | number | undefined }) => (
  <div className="space-y-1">
    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">{label}</p>
    <p className="text-sm font-bold text-black leading-tight">{value || 'N/A'}</p>
  </div>
);

export default Applications;