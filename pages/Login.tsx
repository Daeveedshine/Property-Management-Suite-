
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { getStore, saveStore } from '../store';
import { UserCircle, Apple, Mail, Phone, ArrowRight, Lock, Shield, Home, Users, UserCheck } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.TENANT);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const store = getStore();
    const user = store.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (user) {
      onLogin(user);
    } else {
      setError('Account not found. Please register or check details.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all mandatory fields.');
      return;
    }
    
    const store = getStore();
    if (store.users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      setError('This email is already registered.');
      return;
    }

    // Generate specialized unique IDs for Agents vs Tenants
    const uniqueId = role === UserRole.AGENT 
      ? `AGT-${Math.random().toString(36).substr(2, 6).toUpperCase()}` 
      : `u${Date.now()}`;

    const newUser: User = {
      id: uniqueId,
      name,
      email,
      role,
      phone
    };

    const newState = { ...store, users: [...store.users, newUser] };
    saveStore(newState);
    onLogin(newUser);
  };

  const simulateSocialLogin = (provider: string) => {
    const socialEmail = `social_${provider.toLowerCase()}@example.com`;
    const store = getStore();
    let user = store.users.find(u => u.email === socialEmail);
    
    if (!user) {
      user = {
        id: `u_social_${Date.now()}`,
        name: `${provider} Profile`,
        email: socialEmail,
        role: UserRole.TENANT,
        phone: ''
      };
      const newState = { ...store, users: [...store.users, user] };
      saveStore(newState);
    }
    onLogin(user);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-black">
      <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover z-0 opacity-40">
        <source src="https://assets.mixkit.co/videos/preview/mixkit-drone-shot-of-a-small-modern-house-in-the-forest-4309-large.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-[1px] z-1"></div>

      <div className="max-w-md w-full relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-white/20">
          <div className="bg-zinc-900 p-10 text-white text-center border-b border-zinc-800">
            <div className="flex justify-center mb-6">
              <div className="bg-white/5 p-5 rounded-[1.5rem] backdrop-blur-md border border-white/10 shadow-xl">
                <Home size={40} className="text-blue-600" />
              </div>
            </div>
            <h2 className="text-5xl font-black tracking-tighter text-white">PMS</h2>
            <p className="mt-2 text-blue-400 font-bold tracking-widest text-xs uppercase">Property Suite</p>
          </div>
          
          <div className="flex border-b border-zinc-100 bg-zinc-50">
            <button onClick={() => setIsRegistering(false)} className={`flex-1 py-5 text-[10px] font-black uppercase tracking-widest transition-all ${!isRegistering ? 'text-blue-600 bg-white' : 'text-zinc-400'}`}>Sign In</button>
            <button onClick={() => setIsRegistering(true)} className={`flex-1 py-5 text-[10px] font-black uppercase tracking-widest transition-all ${isRegistering ? 'text-blue-600 bg-white' : 'text-zinc-400'}`}>Register</button>
          </div>

          <form className="p-8 md:p-10 space-y-6 bg-white" onSubmit={isRegistering ? handleRegister : handleLogin}>
            {error && <div className="bg-red-50 text-red-500 p-4 rounded-2xl text-xs font-bold border border-red-100">{error}</div>}
            
            {isRegistering && (
              <>
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">Select Persona</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole(UserRole.TENANT)}
                      className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                        role === UserRole.TENANT 
                          ? 'border-blue-600 bg-blue-50 text-blue-600' 
                          : 'border-zinc-100 bg-zinc-50 text-zinc-400 grayscale hover:grayscale-0'
                      }`}
                    >
                      <Users size={24} className="mb-2" />
                      <span className="text-[10px] font-black uppercase">Tenant / Buyer</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole(UserRole.AGENT)}
                      className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                        role === UserRole.AGENT 
                          ? 'border-blue-600 bg-blue-50 text-blue-600' 
                          : 'border-zinc-100 bg-zinc-50 text-zinc-400 grayscale hover:grayscale-0'
                      }`}
                    >
                      <UserCheck size={24} className="mb-2" />
                      <span className="text-[10px] font-black uppercase">Agent / Seller</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">Legal Name</label>
                  <input required className="w-full px-5 py-4 rounded-2xl border border-zinc-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold text-black" value={name} onChange={e => setName(e.target.value)} />
                </div>
                
                <div>
                  <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">Phone Number</label>
                  <input className="w-full px-5 py-4 rounded-2xl border border-zinc-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold text-black" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" />
                </div>
              </>
            )}

            <div>
              <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
              <input required type="email" className="w-full px-5 py-4 rounded-2xl border border-zinc-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold text-black" value={email} onChange={e => setEmail(e.target.value)} />
            </div>

            <div>
              <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">Secure Password</label>
              <input required type="password" className="w-full px-5 py-4 rounded-2xl border border-zinc-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold text-black" value={password} onChange={e => setPassword(e.target.value)} />
            </div>

            <button type="submit" className="w-full bg-blue-600 text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-blue-100 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center">
              {isRegistering ? 'Create Profile' : 'Access Hub'} <ArrowRight className="ml-2 w-5 h-5" />
            </button>
          </form>

          {!isRegistering && (
            <div className="p-10 pt-0 flex gap-3 bg-white">
               <button type="button" onClick={() => simulateSocialLogin('Apple')} className="flex-1 py-4 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest">Apple</button>
               <button type="button" onClick={() => simulateSocialLogin('Google')} className="flex-1 py-4 bg-zinc-50 border border-zinc-200 text-zinc-600 rounded-2xl text-[10px] font-black uppercase tracking-widest">Google</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
