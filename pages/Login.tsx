
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { getStore, saveStore } from '../store';
import { UserCircle, Apple, Mail, Phone, ArrowRight, Lock, Shield, UserPlus, Building } from 'lucide-react';

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
      setError('Invalid email or user does not exist. Please register.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }
    
    const store = getStore();
    if (store.users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      setError('Email already registered.');
      return;
    }

    const newUser: User = {
      id: `u${Date.now()}`,
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
        name: `${provider} User`,
        email: socialEmail,
        role: UserRole.TENANT,
        phone: '+1 (555) 123-4567'
      };
      const newState = { ...store, users: [...store.users, user] };
      saveStore(newState);
    }
    onLogin(user);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
          <div className="bg-indigo-600 p-8 text-white text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/20">
                <Building size={32} />
              </div>
            </div>
            <h2 className="text-4xl font-black tracking-tight">PMS</h2>
            <p className="mt-2 text-indigo-100/80 font-medium tracking-wide">Property Management Suit</p>
          </div>
          
          <div className="flex border-b border-slate-100">
            <button 
              onClick={() => { setIsRegistering(false); setError(''); }}
              className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${!isRegistering ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Sign In
            </button>
            <button 
              onClick={() => { setIsRegistering(true); setError(''); }}
              className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${isRegistering ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Register
            </button>
          </div>

          <form className="p-8 space-y-4" onSubmit={isRegistering ? handleRegister : handleLogin}>
            {error && <div className="bg-red-50 text-red-500 p-3 rounded-xl text-xs font-bold border border-red-100 animate-pulse">{error}</div>}
            
            {isRegistering && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
                  <div className="relative">
                    <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                    <input
                      required
                      type="text"
                      placeholder="e.g. John Doe"
                      className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-medium"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Select Your Role</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole(UserRole.TENANT)}
                      className={`py-3 rounded-xl border-2 font-bold text-xs flex flex-col items-center gap-1 transition-all ${role === UserRole.TENANT ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}
                    >
                      <UserCircle className="w-5 h-5" />
                      I'm a Tenant
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole(UserRole.AGENT)}
                      className={`py-3 rounded-xl border-2 font-bold text-xs flex flex-col items-center gap-1 transition-all ${role === UserRole.AGENT ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}
                    >
                      <Shield className="w-5 h-5" />
                      I'm an Agent
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                <input
                  required
                  type="email"
                  placeholder="name@example.com"
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-medium"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {isRegistering && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-medium"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                <input
                  required
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-medium"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-100 transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center group"
            >
              {isRegistering ? 'Create Account' : 'Sign In'}
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="p-8 pt-4 space-y-4 bg-slate-50/50">
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest"><span className="bg-white px-4 text-slate-400">Or continue with</span></div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => simulateSocialLogin('Apple')}
                className="flex items-center justify-center p-3 rounded-xl font-bold text-xs bg-black text-white transition-transform active:scale-95 shadow-md shadow-black/10"
              >
                <Apple className="w-4 h-4 mr-2" />
                Apple ID
              </button>
              <button 
                onClick={() => simulateSocialLogin('Google')}
                className="flex items-center justify-center p-3 rounded-xl font-bold text-xs bg-white text-slate-700 border border-slate-200 transition-transform active:scale-95 shadow-md shadow-slate-200/50"
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
