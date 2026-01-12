
import React, { useState } from 'react';
import { User, Property, TenantApplication, ApplicationStatus, NotificationType } from '../types';
import { getStore, saveStore } from '../store';
// Added Shield and AlertCircle to the lucide-react imports to fix the reported errors
import { CheckCircle, ArrowRight, ArrowLeft, Building, ShieldCheck, Loader2, Smartphone, Key, MapPin, Briefcase, UserCheck, Search, Filter, Shield, AlertCircle } from 'lucide-react';

interface ApplicationsProps {
  user: User;
  onNavigate: (view: string) => void;
}

const Applications: React.FC<ApplicationsProps> = ({ user, onNavigate }) => {
  const store = getStore();
  const [step, setStep] = useState(1);
  const [propertyId, setPropertyId] = useState('');
  const [agentSearchId, setAgentSearchId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // OTP Simulation
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isOtpVerified, setIsOtpVerified] = useState(false);

  const [formData, setFormData] = useState({
    personalInfo: { 
      fullName: user.name, 
      gender: 'Male',
      dob: '', 
      maritalStatus: 'Single', 
      dependents: 0, 
      nationality: 'Nigerian', 
      stateOfOrigin: '',
      permanentAddress: '',
      currentAddress: '',
      phone: user.phone || ''
    },
    identity: { idType: 'NIN', idNumber: '', nin: '', idUrlFront: '', idUrlBack: '', selfieUrl: '' },
    employment: { 
      status: 'Employed', 
      employer: '', 
      officeAddress: '',
      workPhone: '',
      jobTitle: '',
      monthlyIncome: 0,
      incomeProofUrl: ''
    },
    rentalHistory: { 
      previousLandlord: '', 
      landlordPhone: '',
      duration: '',
      monthlyRent: 0,
      reasonForLeaving: '',
      paidOnTime: true
    },
    emergency: {
      name: '',
      phone: '',
      relationship: ''
    },
    guarantor: { 
      name: '', 
      phone: '',
      occupation: '',
      address: '',
      idUrl: ''
    }
  });

  // Filter properties based on the Agent ID provided in step 4
  const filteredProperties = store.properties.filter(p => 
    p.status !== 'OCCUPIED' && p.agentId.toLowerCase() === agentSearchId.toLowerCase()
  );
  
  const selectedProp = store.properties.find(p => p.id === propertyId);
  const targetAgent = store.users.find(u => u.id.toLowerCase() === agentSearchId.toLowerCase());

  const handleVerifyPhone = () => {
    setShowOtp(true);
  };

  const handleConfirmOtp = () => {
    if (otpCode === '1234') {
      setIsOtpVerified(true);
      setShowOtp(false);
      nextStep();
    } else {
      alert('Invalid OTP. Use 1234 for simulation.');
    }
  };

  const calculateTrustScore = (income: number, rent: number) => {
    if (rent === 0) return 100;
    const ratio = income / rent;
    if (ratio >= 4) return 98;
    if (ratio >= 3) return 88;
    if (ratio >= 2.5) return 75;
    if (ratio >= 2) return 60;
    return 40;
  };

  const handleSubmit = async () => {
    if (!selectedProp) return;
    setIsSubmitting(true);
    
    const rent = selectedProp.rent;
    const income = formData.employment.monthlyIncome;
    const score = calculateTrustScore(income, rent);
    const recommendation = score > 70 
      ? "Strong financial profile based on income-to-rent ratio." 
      : "Financial profile below standard thresholds; suggest higher guarantor scrutiny.";

    setTimeout(() => {
      const newApp: TenantApplication = {
        id: `app${Date.now()}`,
        userId: user.id,
        propertyId: propertyId,
        agentId: selectedProp.agentId, 
        status: ApplicationStatus.PENDING,
        submissionDate: new Date().toISOString(),
        ...formData,
        riskScore: score,
        aiRecommendation: recommendation
      };

      const agentNotification = {
        id: `n_app_agent_${Date.now()}`,
        userId: selectedProp.agentId,
        title: 'New Application Received',
        message: `A new application has been submitted for ${selectedProp.name} by ${user.name}.`,
        type: NotificationType.INFO,
        timestamp: new Date().toISOString(),
        isRead: false,
        linkTo: 'screenings'
      };

      const newState = { 
        ...store, 
        applications: [...store.applications, newApp],
        notifications: [agentNotification, ...store.notifications]
      };
      saveStore(newState);
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1500);
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  if (isSubmitted) {
    return (
      <div className="max-w-md mx-auto py-24 text-center animate-in zoom-in-95 duration-700 bg-black min-h-screen">
        <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-100/20 animate-bounce">
          <CheckCircle size={48} />
        </div>
        <h2 className="text-3xl font-black text-white mb-3 tracking-tight">Profile Registered</h2>
        <p className="text-zinc-500 font-bold mb-10 leading-relaxed px-4">Your digital application has been successfully routed to the property agent for final verification.</p>
        <button 
          onClick={() => onNavigate('dashboard')} 
          className="w-full bg-blue-600 text-white px-8 py-5 rounded-2xl font-black shadow-2xl hover:bg-white hover:text-blue-600 transition-all transform active:scale-95 uppercase tracking-widest text-xs"
        >
          Return to Hub
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-12 animate-in fade-in duration-500 pb-24">
      <header className="text-center space-y-4">
        <div className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-[0.3em]">
           Verified Tenancy Onboarding
        </div>
        <h1 className="text-4xl font-black text-white">Apply Now</h1>
        <p className="text-zinc-500 font-bold">Stage {step} of 6: {
          step === 1 ? 'Personal Profile' : 
          step === 2 ? 'Financial Health' : 
          step === 3 ? 'History & Guarantor' : 
          step === 4 ? 'Agent Identification' :
          step === 5 ? 'Property Selection' : 'Review'
        }</p>
        
        <div className="flex gap-2 max-w-xs mx-auto mt-4">
            {[1,2,3,4,5,6].map(i => (
                <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i <= step ? 'bg-blue-600 shadow-sm' : 'bg-zinc-800'}`}></div>
            ))}
        </div>
      </header>

      <div className="bg-zinc-900 p-8 md:p-12 rounded-[3rem] border border-zinc-800 shadow-2xl">
         {/* Step 1: Personal Info & Identity */}
         {step === 1 && (
           <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
              <div className="flex items-center gap-3 mb-2 text-blue-500">
                  <UserCheck size={24} />
                  <h3 className="text-xl font-black">Personal Metadata</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase ml-1">Legal Name</label>
                    <input className="w-full px-5 py-4 bg-white rounded-2xl text-sm font-bold text-black border-none outline-none focus:ring-4 focus:ring-blue-600/20" value={formData.personalInfo.fullName} onChange={e => setFormData({...formData, personalInfo: {...formData.personalInfo, fullName: e.target.value}})} />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase ml-1">Identity Verification (Phone)</label>
                    <div className="flex gap-2">
                        <input className="flex-1 px-5 py-4 bg-white rounded-2xl text-sm font-bold text-black border-none outline-none" placeholder="+1 (555) 000-0000" value={formData.personalInfo.phone} onChange={e => setFormData({...formData, personalInfo: {...formData.personalInfo, phone: e.target.value}})} />
                        {!isOtpVerified && <button onClick={handleVerifyPhone} className="bg-blue-600 text-white px-4 rounded-xl text-[10px] font-black uppercase">Verify</button>}
                        {isOtpVerified && <div className="bg-emerald-500/10 text-emerald-500 p-4 rounded-xl flex items-center"><CheckCircle size={20} /></div>}
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase ml-1">Date of Birth</label>
                    <input type="date" className="w-full px-5 py-4 bg-white rounded-2xl text-sm font-bold text-black border-none outline-none" value={formData.personalInfo.dob} onChange={e => setFormData({...formData, personalInfo: {...formData.personalInfo, dob: e.target.value}})} />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase ml-1">Current Address</label>
                    <input className="w-full px-5 py-4 bg-white rounded-2xl text-sm font-bold text-black border-none outline-none" value={formData.personalInfo.currentAddress} onChange={e => setFormData({...formData, personalInfo: {...formData.personalInfo, currentAddress: e.target.value}})} />
                </div>
              </div>
              
              {showOtp && (
                <div className="p-8 bg-zinc-950 rounded-3xl border border-blue-600/20 space-y-4">
                    <div className="flex items-center gap-3"><Key className="text-blue-500" size={20} /><p className="font-bold text-white">Enter OTP (Simulation: 1234)</p></div>
                    <input className="w-full bg-zinc-900 border border-zinc-800 p-4 rounded-xl text-center text-2xl font-black tracking-widest text-blue-500 outline-none" maxLength={4} value={otpCode} onChange={e => setOtpCode(e.target.value)} />
                    <button onClick={handleConfirmOtp} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs">Confirm Code</button>
                </div>
              )}

              <button disabled={!isOtpVerified || !formData.personalInfo.fullName} onClick={nextStep} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs mt-4 disabled:opacity-50 transition-all flex items-center justify-center gap-2">Next Stage <ArrowRight size={16} /></button>
           </div>
         )}

         {/* Step 2: Financial/Employment */}
         {step === 2 && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-3 mb-2 text-blue-500">
                    <Briefcase size={24} />
                    <h3 className="text-xl font-black">Financial Analysis</h3>
                </div>
                <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-500 uppercase ml-1">Employer / Company</label>
                        <input className="w-full px-5 py-4 bg-white rounded-2xl text-sm font-bold text-black border-none outline-none" value={formData.employment.employer} onChange={e => setFormData({...formData, employment: {...formData.employment, employer: e.target.value}})} />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-500 uppercase ml-1">Job Title</label>
                            <input className="w-full px-5 py-4 bg-white rounded-2xl text-sm font-bold text-black border-none outline-none" value={formData.employment.jobTitle} onChange={e => setFormData({...formData, employment: {...formData.employment, jobTitle: e.target.value}})} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-500 uppercase ml-1">Monthly Yield (Income)</label>
                            <input type="number" className="w-full px-5 py-4 bg-white rounded-2xl text-sm font-bold text-black border-none outline-none" value={formData.employment.monthlyIncome || ''} onChange={e => setFormData({...formData, employment: {...formData.employment, monthlyIncome: parseInt(e.target.value)}})} />
                        </div>
                    </div>
                </div>
                <div className="flex gap-4">
                    <button onClick={prevStep} className="flex-1 bg-zinc-800 text-zinc-400 py-5 rounded-2xl font-black uppercase tracking-widest text-xs">Back</button>
                    <button disabled={!formData.employment.employer || !formData.employment.monthlyIncome} onClick={nextStep} className="flex-[2] bg-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2">History & Security <ArrowRight size={16} /></button>
                </div>
            </div>
         )}

         {/* Step 3: History & Guarantor */}
         {step === 3 && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-3 mb-2 text-blue-500">
                    <MapPin size={24} />
                    <h3 className="text-xl font-black">History & Security</h3>
                </div>
                <div className="space-y-6">
                    <div className="p-6 bg-zinc-950 rounded-3xl border border-zinc-800 space-y-4">
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Previous Landlord Info</p>
                        <input className="w-full px-5 py-4 bg-white rounded-2xl text-sm font-bold text-black border-none outline-none" placeholder="Landlord Name" value={formData.rentalHistory.previousLandlord} onChange={e => setFormData({...formData, rentalHistory: {...formData.rentalHistory, previousLandlord: e.target.value}})} />
                        <input className="w-full px-5 py-4 bg-white rounded-2xl text-sm font-bold text-black border-none outline-none" placeholder="Phone Number" value={formData.rentalHistory.landlordPhone} onChange={e => setFormData({...formData, rentalHistory: {...formData.rentalHistory, landlordPhone: e.target.value}})} />
                    </div>
                    <div className="p-6 bg-zinc-950 rounded-3xl border border-zinc-800 space-y-4">
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Guarantor Verification</p>
                        <input className="w-full px-5 py-4 bg-white rounded-2xl text-sm font-bold text-black border-none outline-none" placeholder="Guarantor Legal Name" value={formData.guarantor.name} onChange={e => setFormData({...formData, guarantor: {...formData.guarantor, name: e.target.value}})} />
                        <input className="w-full px-5 py-4 bg-white rounded-2xl text-sm font-bold text-black border-none outline-none" placeholder="Guarantor Phone" value={formData.guarantor.phone} onChange={e => setFormData({...formData, guarantor: {...formData.guarantor, phone: e.target.value}})} />
                    </div>
                </div>
                <div className="flex gap-4">
                    <button onClick={prevStep} className="flex-1 bg-zinc-800 text-zinc-400 py-5 rounded-2xl font-black uppercase tracking-widest text-xs">Back</button>
                    <button disabled={!formData.guarantor.name || !formData.guarantor.phone} onClick={nextStep} className="flex-[2] bg-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2">Locate Agent <ArrowRight size={16} /></button>
                </div>
            </div>
         )}

         {/* Step 4: Agent Identification */}
         {step === 4 && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
               <div className="flex items-center gap-3 mb-2 text-blue-500">
                    <Shield size={24} />
                    <h3 className="text-xl font-black">Agent Linkage</h3>
                </div>
                <p className="text-zinc-500 text-sm font-medium leading-relaxed">Enter the unique Agent Identification Code provided by your property manager to view their verified inventory.</p>
                
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search size={20} className="text-zinc-700 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <input 
                      className="w-full pl-12 pr-5 py-6 bg-white rounded-3xl text-lg font-black text-black border-none outline-none focus:ring-8 focus:ring-blue-600/10 placeholder:text-zinc-300 tracking-widest uppercase"
                      placeholder="AGT-XXXXXX"
                      value={agentSearchId}
                      onChange={e => setAgentSearchId(e.target.value)}
                    />
                </div>

                {agentSearchId && !targetAgent && (
                    <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center text-rose-500 gap-3">
                        <AlertCircle size={18} />
                        <span className="text-xs font-black uppercase">Unregistered Agent ID</span>
                    </div>
                )}

                {targetAgent && (
                    <div className="p-6 bg-blue-600/10 border border-blue-600/20 rounded-[2rem] flex items-center gap-4 animate-in zoom-in-95">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 font-black shadow-sm">
                            {targetAgent.name.charAt(0)}
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Verified Agent Found</p>
                            <p className="text-white font-black text-lg">{targetAgent.name}</p>
                        </div>
                    </div>
                )}

                <div className="flex gap-4">
                    <button onClick={prevStep} className="flex-1 bg-zinc-800 text-zinc-400 py-5 rounded-2xl font-black uppercase tracking-widest text-xs">Back</button>
                    <button disabled={!targetAgent} onClick={nextStep} className="flex-[2] bg-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2">View Properties <ArrowRight size={16} /></button>
                </div>
            </div>
         )}

         {/* Step 5: Property Selection */}
         {step === 5 && (
           <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
              <div className="flex items-center gap-3 mb-2 text-blue-500">
                  <Building size={24} />
                  <h3 className="text-xl font-black">Agent Inventory</h3>
              </div>
              <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Managed listings by {targetAgent?.name}</label>
              
              {filteredProperties.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                    {filteredProperties.map(p => (
                    <button 
                        key={p.id} 
                        onClick={() => setPropertyId(p.id)}
                        className={`w-full text-left p-6 rounded-3xl border-2 transition-all flex items-center justify-between ${propertyId === p.id ? 'border-blue-600 bg-blue-600/10' : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950/50'}`}
                    >
                        <div>
                            <p className="font-black text-white text-lg">{p.name}</p>
                            <p className="text-xs text-zinc-500">{p.location}</p>
                        </div>
                        <div className="text-right">
                            <p className="font-black text-white text-xl">${p.rent.toLocaleString()}</p>
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Monthly Yield</p>
                        </div>
                    </button>
                    ))}
                </div>
              ) : (
                <div className="py-20 text-center space-y-4 bg-zinc-950 rounded-[2rem] border border-dashed border-zinc-800">
                    <Filter className="mx-auto text-zinc-700" size={48} />
                    <p className="text-zinc-600 font-bold">No vacant listings available for this Agent ID.</p>
                </div>
              )}

              <div className="flex gap-4 mt-8">
                    <button onClick={prevStep} className="flex-1 bg-zinc-800 text-zinc-400 py-5 rounded-2xl font-black uppercase tracking-widest text-xs">Back</button>
                    <button disabled={!propertyId} onClick={nextStep} className="flex-[2] bg-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2">Final Review <ArrowRight size={16} /></button>
              </div>
           </div>
         )}

         {/* Step 6: Submission */}
         {step === 6 && (
            <div className="space-y-8 text-center py-6 animate-in zoom-in-95 duration-500">
               <div className="p-10 bg-zinc-950 rounded-[3rem] border border-zinc-800">
                  <ShieldCheck size={64} className="mx-auto text-emerald-500 mb-6" />
                  <h3 className="text-2xl font-black text-white mb-4">Integrity Check</h3>
                  <p className="text-zinc-400 font-bold mb-10 px-4">I hereby certify that all information provided in this digital application is accurate and true to the best of my knowledge.</p>
                  
                  <div className="bg-zinc-900 p-6 rounded-2xl text-left border border-zinc-800 mb-10">
                     <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Final Summary</p>
                     <p className="text-white font-bold">{formData.personalInfo.fullName} applying for {selectedProp?.name}</p>
                     <p className="text-blue-500 font-black mt-1">Managed by: {targetAgent?.name}</p>
                     <p className="text-zinc-500 font-black text-[10px] mt-1 uppercase">Unit ID: {selectedProp?.id}</p>
                  </div>

                  <button 
                    onClick={handleSubmit} 
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 text-white py-6 rounded-3xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-2xl shadow-blue-900/40 transform active:scale-[0.98] transition-all"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" /> : <ShieldCheck />}
                    {isSubmitting ? 'Securing Profile...' : 'Seal & Submit Enrollment'}
                  </button>
               </div>
               <button onClick={prevStep} className="text-zinc-500 font-black uppercase tracking-widest text-[10px] flex items-center justify-center mx-auto gap-2">
                  <ArrowLeft size={14} /> Back to selection
               </button>
            </div>
         )}
      </div>
    </div>
  );
};

export default Applications;
