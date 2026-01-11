
import React, { useState } from 'react';
import { User, UserRole, Agreement } from '../types';
import { getStore, saveStore } from '../store';
import { summarizeAgreement } from '../services/geminiService';
import { FileText, Upload, ExternalLink, Sparkles, Loader2, CheckCircle, Clock } from 'lucide-react';

interface AgreementsProps {
  user: User;
}

const Agreements: React.FC<AgreementsProps> = ({ user }) => {
  const store = getStore();
  const [agreements, setAgreements] = useState<Agreement[]>(
    user.role === UserRole.AGENT || user.role === UserRole.ADMIN
      ? store.agreements
      : store.agreements.filter(a => a.tenantId === user.id)
  );
  
  const [isSummarizing, setIsSummarizing] = useState<string | null>(null);
  const [summary, setSummary] = useState<Record<string, string>>({});
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const handleSummarize = async (agreement: Agreement) => {
    setIsSummarizing(agreement.id);
    const mockContent = `Lease for Property ${agreement.propertyId}. Start: ${agreement.startDate}, End: ${agreement.endDate}. Monthly Rent: $2500. Security Deposit: $5000. No pets allowed. Tenant responsible for utilities.`;
    const result = await summarizeAgreement(mockContent);
    setSummary(prev => ({ ...prev, [agreement.id]: result }));
    setIsSummarizing(null);
  };

  const simulateUpload = (id: string) => {
    setUploadingId(id);
    setTimeout(() => {
      const updatedAgreements = store.agreements.map(a => 
        a.id === id ? { ...a, documentUrl: `https://storage.googleapis.com/prop-lifecycle/agreements/${id}.pdf` } : a
      );
      const newState = { ...store, agreements: updatedAgreements };
      saveStore(newState);
      setAgreements(user.role === UserRole.TENANT ? updatedAgreements.filter(a => a.tenantId === user.id) : updatedAgreements);
      setUploadingId(null);
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Lease Agreements</h1>
        <p className="text-slate-500">View and manage legal documents and lease terms.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {agreements.length > 0 ? agreements.map(agreement => (
          <div key={agreement.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col md:flex-row">
            <div className="p-6 flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">Residential Lease Agreement v{agreement.version}</h3>
                  <div className="flex items-center text-xs text-slate-500 space-x-2">
                    <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {agreement.startDate} to {agreement.endDate}</span>
                    <span>•</span>
                    <span className={`uppercase font-bold ${agreement.status === 'active' ? 'text-emerald-600' : 'text-slate-400'}`}>{agreement.status}</span>
                  </div>
                </div>
              </div>

              {summary[agreement.id] ? (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4 animate-in zoom-in-95 duration-300">
                  <div className="flex items-center text-indigo-600 font-bold text-xs uppercase tracking-widest mb-2">
                    <Sparkles className="w-3.5 h-3.5 mr-1.5" /> AI Key Terms Summary
                  </div>
                  <div className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
                    {summary[agreement.id]}
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => handleSummarize(agreement)}
                  disabled={isSummarizing === agreement.id}
                  className="mb-4 text-xs font-bold text-indigo-600 flex items-center hover:text-indigo-800 disabled:opacity-50"
                >
                  {isSummarizing === agreement.id ? <Loader2 className="w-3 h-3 mr-1.5 animate-spin" /> : <Sparkles className="w-3 h-3 mr-1.5" />}
                  {isSummarizing === agreement.id ? 'Analyzing with Gemini...' : 'AI Summary of terms'}
                </button>
              )}
            </div>

            <div className="bg-slate-50/50 p-6 border-t md:border-t-0 md:border-l border-slate-100 flex flex-col justify-center items-center space-y-3 min-w-[200px]">
              {agreement.documentUrl ? (
                <a 
                  href={agreement.documentUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl flex items-center justify-center font-bold text-sm hover:bg-slate-50 transition-colors shadow-sm"
                >
                  <ExternalLink className="w-4 h-4 mr-2" /> View Document
                </a>
              ) : (
                user.role === UserRole.AGENT && (
                  <button 
                    onClick={() => simulateUpload(agreement.id)}
                    disabled={uploadingId === agreement.id}
                    className="w-full bg-indigo-600 text-white px-4 py-2.5 rounded-xl flex items-center justify-center font-bold text-sm hover:bg-indigo-700 transition-colors shadow-lg disabled:opacity-50"
                  >
                    {uploadingId === agreement.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                    {uploadingId === agreement.id ? 'Uploading...' : 'Upload Signed PDF'}
                  </button>
                )
              )}
              {agreement.documentUrl && (
                <div className="flex items-center text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
                  <CheckCircle className="w-3 h-3 mr-1" /> Signed & Verified
                </div>
              )}
            </div>
          </div>
        )) : (
          <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-600">No agreements found</h3>
            <p className="text-slate-400">Lease documents will appear here once generated.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Agreements;
