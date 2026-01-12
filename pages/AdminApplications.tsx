
import React, { useState } from 'react';
import { User, TenantApplication, ApplicationStatus } from '../types';
import { getStore } from '../store';
import { 
  ArrowLeft, Search, Download, FileText, User as UserIcon, Building, 
  TrendingUp, DollarSign, Smartphone, Globe, Landmark, MapPin, 
  ShieldCheck, Briefcase, Phone, Users, Info, Calendar, CreditCard,
  FileSearch, AlertCircle
} from 'lucide-react';

interface AdminApplicationsProps {
  user: User;
  onBack: () => void;
}

const AdminApplications: React.FC<AdminApplicationsProps> = ({ user, onBack }) => {
  const store = getStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApp, setSelectedApp] = useState<TenantApplication | null>(null);

  const filteredApps = store.applications.filter(app => 
    app.personalInfo.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.id.includes(searchTerm)
  );

  const handleExportPDF = () => {
    window.print();
  };

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 50) return 'text-amber-500';
    return 'text-rose-500';
  };

  const getStatusStyle = (status: ApplicationStatus) => {
    switch (status) {
      case ApplicationStatus.APPROVED: return 'bg-emerald-100 text-emerald-700';
      case ApplicationStatus.REJECTED: return 'bg-rose-100 text-rose-700';
      case ApplicationStatus.PENDING: return 'bg-amber-100 text-amber-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Global Registry</h1>
            <p className="text-slate-500 text-sm">Reviewing {store.applications.length} historical and active tenant profiles.</p>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
           <div className="relative flex-1 sm:min-w-[250px]">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
             <input 
               type="text" 
               placeholder="Search registry by name or ID..."
               className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
             />
           </div>
        </div>
      </header>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden print:hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b">
                <th className="px-6 py-5">Applicant</th>
                <th className="px-6 py-5">Managed Property</th>
                <th className="px-6 py-5">Financial Yield</th>
                <th className="px-6 py-5">Risk Rating</th>
                <th className="px-6 py-5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredApps.map(app => {
                const prop = store.properties.find(p => p.id === app.propertyId);
                return (
                  <tr key={app.id} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold border border-slate-200">
                           {app.personalInfo.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{app.personalInfo.fullName}</p>
                          <span className={`px-2 py-0.5 rounded-[4px] text-[8px] font-black uppercase ${getStatusStyle(app.status)}`}>{app.status}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-bold text-indigo-600">{prop?.name || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-black text-slate-700">${app.employment.monthlyIncome.toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp size={14} className={getRiskColor(app.riskScore)} />
                        <span className={`text-xs font-black ${getRiskColor(app.riskScore)}`}>{app.riskScore}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedApp(app)}
                        className="text-indigo-600 hover:text-indigo-800 font-black text-xs flex items-center justify-end uppercase tracking-widest"
                      >
                         Open Report <FileSearch size={14} className="ml-2" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedApp && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm print:bg-white print:p-0 print:static print:block animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-5xl max-h-[95vh] overflow-y-auto rounded-[3rem] shadow-2xl print:max-h-none print:shadow-none print:rounded-none animate-in zoom-in-95 duration-500">
             <div className="p-8 md:p-12 border-b print:p-0">
               <div className="flex justify-between items-start mb-10 print:hidden">
                 <button 
                  onClick={() => setSelectedApp(null)}
                  className="bg-slate-100 p-3 rounded-full text-slate-400 hover:text-slate-600 transition-all"
                 >
                   <ArrowLeft size={20} />
                 </button>
                 <div className="flex gap-3">
                    <button 
                      onClick={handleExportPDF}
                      className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black flex items-center shadow-xl shadow-indigo-100 hover:bg-slate-900 transition-all active:scale-95 text-xs uppercase tracking-widest"
                    >
                      <Download size={18} className="mr-2" /> Export PDF Report
                    </button>
                 </div>
               </div>

               {/* PDF Header - Only visible in print */}
               <div className="hidden print:flex justify-between items-center border-b-[8px] border-indigo-600 pb-8 mb-12">
                  <div className="flex items-center gap-4">
                     <div className="bg-indigo-600 p-4 rounded-[1.5rem] text-white"><Building size={40} /></div>
                     <div>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tighter">PMS</h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Official Background Report</p>
                     </div>
                  </div>
                  <div className="text-right space-y-1">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Digital Dossier ID</p>
                     <p className="text-sm font-mono font-black text-indigo-600">{selectedApp.id}</p>
                     <p className="text-[9px] text-slate-400 font-bold">Issued: {new Date().toLocaleDateString()}</p>
                  </div>
               </div>

               <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                 <div className="flex items-center gap-8">
                    <div className="w-32 h-32 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200 overflow-hidden border-2 border-slate-100 shadow-inner">
                      <UserIcon size={64} />
                    </div>
                    <div className="space-y-2">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusStyle(selectedApp.status)}`}>{selectedApp.status} Candidate</span>
                      <h2 className="text-5xl font-black text-slate-900 tracking-tighter">{selectedApp.personalInfo.fullName}</h2>
                      <div className="flex flex-wrap items-center gap-6 text-slate-500 font-bold text-sm">
                        <span className="flex items-center gap-2"><Smartphone size={16} className="text-indigo-600" /> {selectedApp.personalInfo.phone}</span>
                        <span className="flex items-center gap-2 uppercase tracking-widest text-[10px]"><Calendar size={16} className="text-indigo-600" /> Logged: {new Date(selectedApp.submissionDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                 </div>
                 <div className="bg-slate-900 p-8 rounded-[2.5rem] text-center min-w-[220px] shadow-2xl print:bg-white print:border-4 print:border-slate-100 print:shadow-none">
                   <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-2">Vetting Score</p>
                   <p className={`text-6xl font-black ${getRiskColor(selectedApp.riskScore)}`}>{selectedApp.riskScore}%</p>
                   <div className="mt-3 w-full h-1.5 bg-white/10 rounded-full overflow-hidden print:bg-slate-100">
                      <div className={`h-full bg-current ${getRiskColor(selectedApp.riskScore)}`} style={{width: `${selectedApp.riskScore}%`}}></div>
                   </div>
                 </div>
               </div>
             </div>

             <div className="p-8 md:p-14 space-y-16 print:p-0 print:mt-12">
               {/* Segment 1: Personal & Identity */}
               <section className="space-y-8">
                  <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-3">
                     <Users size={20} className="text-indigo-600" />
                     <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em]">Section 01: Identity & Profile</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-8 print:grid-cols-4">
                     <DataPoint label="Legal Name" value={selectedApp.personalInfo.fullName} />
                     <DataPoint label="D.O.B" value={selectedApp.personalInfo.dob} />
                     <DataPoint label="Gender" value={selectedApp.personalInfo.gender} />
                     <DataPoint label="Marital Status" value={selectedApp.personalInfo.maritalStatus} />
                     <DataPoint label="Nationality" value={selectedApp.personalInfo.nationality} />
                     <DataPoint label="State of Origin" value={selectedApp.personalInfo.stateOfOrigin} />
                     <DataPoint label="Dependents" value={selectedApp.personalInfo.dependents} />
                     <DataPoint label="Primary Phone" value={selectedApp.personalInfo.phone} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:grid-cols-2">
                     <DataPoint label="Current Residential Address" value={selectedApp.personalInfo.currentAddress} />
                     <DataPoint label="Permanent Legal Address" value={selectedApp.personalInfo.permanentAddress} />
                  </div>
                  <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-6 print:grid-cols-3">
                     <DataPoint label="Identity Document" value={selectedApp.identity.idType} />
                     <DataPoint label="Document Number" value={selectedApp.identity.idNumber} />
                     <DataPoint label="National Identity (NIN)" value={selectedApp.identity.nin} />
                  </div>
               </section>

               {/* Segment 2: Financial & Employment */}
               <section className="space-y-8">
                  <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-3">
                     <Briefcase size={20} className="text-indigo-600" />
                     <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em]">Section 02: Financial Solvency</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 print:grid-cols-3">
                     <DataPoint label="Employment Status" value={selectedApp.employment.status} />
                     <DataPoint label="Primary Employer" value={selectedApp.employment.employer} />
                     <DataPoint label="Job Designation" value={selectedApp.employment.jobTitle} />
                     <DataPoint label="Workplace Contact" value={selectedApp.employment.workPhone} />
                     <div className="md:col-span-2">
                        <DataPoint label="Corporate Office Address" value={selectedApp.employment.officeAddress} />
                     </div>
                  </div>
                  <div className="p-8 bg-emerald-50 rounded-[2.5rem] border border-emerald-100 flex items-center justify-between shadow-sm">
                     <div className="space-y-1">
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Audited Monthly Net Income</p>
                        <p className="text-4xl font-black text-emerald-700">${selectedApp.employment.monthlyIncome.toLocaleString()}</p>
                     </div>
                     <div className="bg-white p-4 rounded-2xl text-emerald-600 shadow-sm"><DollarSign size={32} /></div>
                  </div>
               </section>

               {/* Segment 3: Residential History & Emergency */}
               <section className="space-y-8">
                  <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-3">
                     <MapPin size={20} className="text-indigo-600" />
                     <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em]">Section 03: Residential Background</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:grid-cols-2">
                     <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-6">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Previous Landlord Details</p>
                        <div className="grid grid-cols-2 gap-4">
                           <DataPoint label="Full Name" value={selectedApp.rentalHistory.previousLandlord} />
                           <DataPoint label="Contact" value={selectedApp.rentalHistory.landlordPhone} />
                           <DataPoint label="Duration" value={selectedApp.rentalHistory.duration} />
                           <DataPoint label="Previous Rent" value={`$${selectedApp.rentalHistory.monthlyRent}`} />
                        </div>
                        <DataPoint label="Reason for Relocation" value={selectedApp.rentalHistory.reasonForLeaving} />
                     </div>
                     <div className="p-6 bg-amber-50 rounded-[2rem] border border-amber-100 space-y-6">
                        <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-2">Emergency Notification Path</p>
                        <DataPoint label="Primary Contact Name" value={selectedApp.emergency.name} />
                        <div className="grid grid-cols-2 gap-4">
                           <DataPoint label="Phone" value={selectedApp.emergency.phone} />
                           <DataPoint label="Legal Relationship" value={selectedApp.emergency.relationship} />
                        </div>
                     </div>
                  </div>
               </section>

               {/* Segment 4: Guarantor & Risk Assessment */}
               <section className="space-y-8">
                  <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-3">
                     <ShieldCheck size={20} className="text-indigo-600" />
                     <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em]">Section 04: Security & Guarantees</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:grid-cols-2">
                     <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-6">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Guarantor Verification</p>
                        <div className="grid grid-cols-2 gap-6">
                           <DataPoint label="Legal Name" value={selectedApp.guarantor.name} />
                           <DataPoint label="Contact Phone" value={selectedApp.guarantor.phone} />
                           <DataPoint label="Occupation" value={selectedApp.guarantor.occupation} />
                        </div>
                        <DataPoint label="Verified Residence" value={selectedApp.guarantor.address} />
                     </div>
                     <div className="p-8 bg-indigo-50 rounded-[2.5rem] border border-indigo-100 space-y-6 flex flex-col justify-center">
                        <div className="flex items-center gap-3 text-indigo-600 mb-2">
                           <TrendingUp size={24} />
                           <p className="text-xs font-black uppercase tracking-widest">System Recommendation</p>
                        </div>
                        <p className="text-indigo-900 font-bold italic leading-relaxed">
                           "{selectedApp.aiRecommendation}"
                        </p>
                     </div>
                  </div>
               </section>

               <div className="hidden print:block pt-16 border-t-4 border-slate-100 text-center text-slate-400 pb-8">
                  <p className="text-[10px] font-black uppercase tracking-[0.5em]">End of Official Record - Digital Registry Document</p>
                  <p className="text-[8px] mt-4 font-bold">This report was automatically generated by the PMS Suite. Verification can be performed by entering the Dossier ID at pms.suite/verify</p>
               </div>
             </div>
          </div>
        </div>
      )}

      <style>{`
        @media print {
          body { 
            background: white !important; 
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          #root { background: white !important; }
          .print\\:block { display: block !important; }
          .print\\:flex { display: flex !important; }
          .print\\:static { 
            position: static !important; 
            width: 100% !important; 
            max-width: none !important; 
            margin: 0 !important; 
            box-shadow: none !important;
            overflow: visible !important;
          }
          .print\\:p-0 { padding: 0 !important; }
          .print\\:m-0 { margin: 0 !important; }
          .print\\:border-0 { border: 0 !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:rounded-none { border-radius: 0 !important; }
          .print\\:hidden { display: none !important; }
          
          /* Force page breaks for clean sections if needed */
          section { page-break-inside: avoid; }
          
          @page { 
            margin: 1.5cm; 
            size: A4;
          }

          /* Ensure colors print correctly */
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          
          /* Specific text adjustments for print clarity */
          .text-slate-400 { color: #94a3b8 !important; }
          .text-indigo-600 { color: #4f46e5 !important; }
          .text-emerald-700 { color: #047857 !important; }
        }
      `}</style>
    </div>
  );
};

const DataPoint = ({ label, value }: { label: string, value: string | number | undefined }) => (
  <div className="space-y-1">
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{label}</p>
    <p className="text-sm font-bold text-slate-800 leading-tight">{value || 'Not Disclosed'}</p>
  </div>
);

export default AdminApplications;
