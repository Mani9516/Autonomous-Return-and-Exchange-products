import React, { useState } from 'react';
import { Mail, Cpu, Lock, Check, AlertCircle, Loader2, ArrowRight, Sun, Moon } from 'lucide-react';
import { User } from '../types';
import { loginUser, registerUser } from '../services/dbService';

interface AuthViewProps { 
  initialMode?: 'login'|'register';
  onSuccess: (user: User) => void;
  onCancel: () => void;
  toggleDarkMode: () => void;
  darkMode: boolean;
}

export const AuthView: React.FC<AuthViewProps> = ({ 
  initialMode = 'login',
  onSuccess,
  onCancel,
  toggleDarkMode,
  darkMode
}) => {
  const [mode, setMode] = useState<'login'|'register'|'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'forgot') {
          await new Promise(resolve => setTimeout(resolve, 1500)); 
          setResetSent(true);
          setLoading(false);
          return;
      }

      const u = mode === 'register' 
        ? await registerUser(name, email, password)
        : await loginUser(email, password);
      
      onSuccess(u);
    } catch (err: any) {
      if (mode === 'login') {
           setError('Wrong credentials');
      } else {
           setError(err.message || 'Authentication failed');
      }
    } finally {
      if (mode !== 'forgot') setLoading(false);
    }
  };

  const passwordRequirements = [
      { text: "At least 8 characters", met: password.length >= 8 },
      { text: "Contains a number", met: /\d/.test(password) },
      { text: "Contains a special character", met: /[!@#$%^&*]/.test(password) },
  ];

  if (mode === 'forgot' && resetSent) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
              <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 border border-slate-100 dark:border-slate-800 text-center animate-fade-in-up">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 dark:text-green-400">
                      <Mail className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Check your inbox</h2>
                  <p className="text-slate-500 dark:text-slate-400 mb-8">We've sent a password reset link to <strong>{email}</strong></p>
                  <button 
                      onClick={() => { setResetSent(false); setMode('login'); }}
                      className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                  >
                      Back to Login
                  </button>
                  <p className="mt-4 text-xs text-slate-400">
                      Didn't receive it? <button onClick={() => setResetSent(false)} className="text-indigo-600 hover:underline">Try again</button>
                  </p>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors duration-300 p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 border border-slate-100 dark:border-slate-800 transition-colors duration-300 animate-fade-in">
          <div className="flex items-center gap-2 mb-8 justify-center cursor-pointer" onClick={onCancel}>
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Cpu className="text-white w-6 h-6" />
            </div>
            <span className="font-bold text-2xl text-slate-800 dark:text-white">AutoResolve</span>
          </div>
          
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              {mode === 'register' ? 'Create Account' : mode === 'forgot' ? 'Reset Password' : 'Welcome Back'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
              {mode === 'forgot' ? 'Enter your email to receive a reset link.' : 'Autonomous Retail Exchange Platform'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg p-3 border focus:ring-2 focus:ring-indigo-500 outline-none transition-colors" placeholder="John Doe" required />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                  <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg pl-10 p-3 border focus:ring-2 focus:ring-indigo-500 outline-none transition-colors" placeholder="user@example.com" required />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                    {mode === 'login' && (
                        <button type="button" onClick={() => setMode('forgot')} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">Forgot password?</button>
                    )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                  <input 
                      type="password" 
                      value={password} 
                      onChange={e => setPassword(e.target.value)} 
                      className="w-full border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg pl-10 pr-4 p-3 border focus:ring-2 focus:ring-indigo-500 outline-none transition-colors" 
                      placeholder="••••••••" 
                      required 
                  />
                </div>
                
                {mode === 'register' && password.length > 0 && (
                    <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg space-y-2">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Requirements:</p>
                        {passwordRequirements.map((req, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs">
                                {req.met ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                                ) : (
                                    <div className="w-3.5 h-3.5 rounded-full border border-slate-400 flex items-center justify-center">
                                        <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                                    </div>
                                )}
                                <span className={req.met ? "text-emerald-600 dark:text-emerald-400 transition-colors" : "text-slate-500 transition-colors"}>
                                    {req.text}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-sm text-red-600 dark:text-red-400 animate-pulse">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
              </div>
            )}

            <button disabled={loading} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 mt-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === 'register' ? 'Register Securely' : mode === 'forgot' ? 'Send Reset Link' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            {mode === 'register' ? (
              <p className="text-slate-500 dark:text-slate-400">Already have an account? <button onClick={() => setMode('login')} className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">Sign in</button></p>
            ) : mode === 'login' ? (
              <p className="text-slate-500 dark:text-slate-400">New to AutoResolve? <button onClick={() => setMode('register')} className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">Create account</button></p>
            ) : (
              <button onClick={() => setMode('login')} className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline flex items-center justify-center gap-1 w-full">
                  <ArrowRight className="w-3 h-3 rotate-180" /> Back to Login
              </button>
            )}
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
              <button 
                onClick={toggleDarkMode} 
                className="w-full py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded flex items-center justify-center gap-2 text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                  {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  Switch to {darkMode ? 'Light' : 'Dark'} Mode
              </button>
          </div>
        </div>
    </div>
  );
};
