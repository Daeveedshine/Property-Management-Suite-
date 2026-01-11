
import React, { useMemo, useState } from 'react';
import { User, UserRole, Payment } from '../types';
import { getStore, saveStore } from '../store';
import { Receipt, DollarSign, Calendar, ArrowRight, CreditCard, ShieldCheck, Loader2, CheckCircle2, X } from 'lucide-react';

interface PaymentsProps {
  user: User;
}

const Payments: React.FC<PaymentsProps> = ({ user }) => {
  const [store, setStore] = useState(getStore());
  const [payingId, setPayingId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const payments = useMemo(() => {
    return user.role === UserRole.AGENT || user.role === UserRole.ADMIN
      ? store.payments 
      : store.payments.filter(p => p.tenantId === user.id);
  }, [user, store]);

  const stats = useMemo(() => {
    const total = payments.filter(p => p.status === 'paid').reduce((acc, p) => acc + p.amount, 0);
    const outstanding = payments.filter(p => p.status === 'pending').reduce((acc, p) => acc + p.amount, 0);
    const pendingCount = payments.filter(p => p.status === 'pending').length;
    return { total, outstanding, pendingCount };
  }, [payments]);

  const handlePay = (paymentId: string) => {
    setPayingId(paymentId);
  };

  const processPayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const updatedPayments = store.payments.map(p => 
        p.id === payingId ? { ...p, status: 'paid' as const, date: new Date().toISOString().split('T')[0] } : p
      );
      const newState = { ...store, payments: updatedPayments };
      saveStore(newState);
      setStore(newState);
      setIsProcessing(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setPayingId(null);
      }, 2000);
    }, 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Rent & Payments</h1>
          <p className="text-slate-500">Track financial history and settle outstanding balances.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-indigo-600 text-white p-4 rounded-2xl shadow-lg min-w-[150px]">
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Total Collected</p>
            <p className="text-2xl font-bold">${stats.total.toLocaleString()}</p>
          </div>
          <div className="bg-rose-500 text-white p-4 rounded-2xl shadow-lg min-w-[150px]">
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Outstanding</p>
            <p className="text-2xl font-bold">${stats.outstanding.toLocaleString()}</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 font-medium">Pending Invoices</p>
            <p className="text-2xl font-bold text-slate-800">{stats.pendingCount}</p>
          </div>
          <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
            <Calendar className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 font-medium">Auto-Pay Status</p>
            <p className="text-2xl font-bold text-slate-800">Enabled</p>
          </div>
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Payment Portal Modal Simulation */}
      {payingId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-indigo-600 p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">Secure Checkout</h3>
                <p className="text-indigo-100 text-xs">Simulated Payment Portal</p>
              </div>
              {!isProcessing && !success && (
                <button onClick={() => setPayingId(null)} className="p-2 hover:bg-white/10 rounded-full">
                  <X className="w-6 h-6" />
                </button>
              )}
            </div>
            
            <div className="p-8">
              {success ? (
                <div className="text-center py-8 animate-in scale-in duration-500">
                  <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-12 h-12" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-800">Payment Successful</h4>
                  <p className="text-slate-500 mt-2">Your rent has been settled and the agent notified.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                    <span className="text-slate-600">Total Due</span>
                    <span className="text-2xl font-bold text-slate-800">${payments.find(p => p.id === payingId)?.amount.toLocaleString()}</span>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Payment Method</p>
                    <div className="p-4 border-2 border-indigo-600 bg-indigo-50 rounded-2xl flex items-center">
                      <CreditCard className="w-6 h-6 text-indigo-600 mr-4" />
                      <div>
                        <p className="text-sm font-bold text-slate-800">Visa ending in 4242</p>
                        <p className="text-[10px] text-indigo-600">Primary Account</p>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={processPayment}
                    disabled={isProcessing}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg transition-all transform active:scale-95 disabled:opacity-50 flex items-center justify-center"
                  >
                    {isProcessing ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <DollarSign className="w-5 h-5 mr-2" />}
                    {isProcessing ? 'Processing Transaction...' : 'Confirm & Pay Now'}
                  </button>
                  <p className="text-[10px] text-center text-slate-400">Encrypted by PropLifecycle SecurePay</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Payment Schedule & History</h3>
          <button className="text-indigo-600 text-sm font-semibold flex items-center hover:underline">
            Export Records <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                <th className="px-6 py-4">Transaction</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.map(payment => (
                <tr key={payment.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="p-2 bg-slate-100 rounded-lg mr-3">
                        <Receipt className="w-4 h-4 text-slate-500" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">Monthly Rent</p>
                        <p className="text-[10px] text-slate-400 font-mono">{payment.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {new Date(payment.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                      payment.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 
                      payment.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-800">
                    ${payment.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {payment.status === 'pending' && user.role === UserRole.TENANT ? (
                      <button 
                        onClick={() => handlePay(payment.id)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
                      >
                        Pay Now
                      </button>
                    ) : (
                      <button className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors">Download Receipt</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Payments;
