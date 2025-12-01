import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { db } from '../services/mockDb';

type AuthView = 'login' | 'register' | 'forgot_email' | 'forgot_verify';

interface AuthPageProps {
  onAuthSuccess: (user: User) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
  const [view, setView] = useState<AuthView>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [enteredCode, setEnteredCode] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));

  // Clear errors when view changes
  useEffect(() => {
    setError('');
    setSuccessMsg('');
    setPassword('');
  }, [view]);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
        if (view === 'login') {
            const res = await db.login(email, password);
            if (res.error) setError(res.error);
            else if (res.user) {
                if (rememberMe) db.setSession(res.user.id);
                onAuthSuccess(res.user);
            }
        } else if (view === 'register') {
            const res = await db.register(email, password);
            if (res.error) setError(res.error);
            else if (res.user) {
                if (rememberMe) db.setSession(res.user.id);
                onAuthSuccess(res.user);
            }
        } else if (view === 'forgot_email') {
            const exists = await db.verifyEmail(email);
            if (!exists) {
                setError("No account found with this email. (Hint: Try 'user@demo.com')");
            } else {
                const code = Math.floor(1000 + Math.random() * 9000).toString();
                setResetCode(code);
                alert(`DEMO: Your password reset code is ${code}`);
                setSuccessMsg(`Code sent to ${email}`);
                setTimeout(() => {
                    setView('forgot_verify');
                    setSuccessMsg('');
                }, 1000);
            }
        } else if (view === 'forgot_verify') {
            if (enteredCode !== resetCode) {
                setError("Invalid verification code. Please try again.");
            } else {
                const updated = await db.updatePassword(email, password);
                if (updated) {
                    setSuccessMsg("Password updated successfully! Please sign in.");
                    setTimeout(() => setView('login'), 2000);
                } else {
                    setError("Failed to update password. Try again.");
                }
            }
        }
    } catch (err) {
        setError("Connection failed. Please try again.");
    } finally {
        setLoading(false);
    }
  };

  const resendCode = async () => {
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      setResetCode(code);
      alert(`DEMO: Your new password reset code is ${code}`);
      setSuccessMsg("New code sent!");
      setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleFillDemo = () => {
      setEmail("user@demo.com");
      setPassword("123456");
  };

  const getTitle = () => {
      switch(view) {
          case 'login': return 'Welcome Back';
          case 'register': return 'Create Account';
          case 'forgot_email': return 'Reset Password';
          case 'forgot_verify': return 'Verify & Set Password';
      }
  };

  const getSubtitle = () => {
      switch(view) {
          case 'login': return 'Sign in to manage your returns';
          case 'register': return 'Register for the portal';
          case 'forgot_email': return 'Enter your email to receive a code';
          case 'forgot_verify': return 'Enter the code sent to your email';
      }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 relative">
       {/* Theme Toggle for Auth Page */}
       <div className="absolute top-6 right-6">
         <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
         >
            {isDarkMode ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
            )}
         </button>
      </div>

      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 transition-all">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            {getTitle()}
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            {getSubtitle()}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {(view === 'login' || view === 'register' || view === 'forgot_email') && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                <input 
                  type="email"
                  name="email"
                  autoComplete="username"
                  required
                  className="w-full px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
          )}

          {view === 'forgot_verify' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Verification Code</label>
                <div className="flex gap-2">
                    <input 
                      type="text"
                      placeholder="0000"
                      required
                      maxLength={4}
                      className="w-full px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white tracking-widest text-center text-lg"
                      value={enteredCode}
                      onChange={(e) => setEnteredCode(e.target.value)}
                    />
                    <button 
                        type="button" 
                        onClick={resendCode}
                        className="px-3 text-sm text-blue-600 hover:text-blue-500 whitespace-nowrap"
                    >
                        Resend Code
                    </button>
                </div>
              </div>
          )}

          {(view === 'login' || view === 'register' || view === 'forgot_verify') && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    {view === 'forgot_verify' ? 'New Password' : 'Password'}
                </label>
                <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"}
                      name="password"
                      autoComplete={view === 'login' ? "current-password" : "new-password"}
                      required
                      className="w-full px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white pr-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                        {showPassword ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                        )}
                    </button>
                </div>
              </div>
          )}

          {(view === 'login') && (
              <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center space-x-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={rememberMe}
                        onChange={e => setRememberMe(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" 
                      />
                      <span className="text-slate-600 dark:text-slate-400">Remember me</span>
                  </label>
                  <button type="button" onClick={() => setView('forgot_email')} className="text-blue-600 hover:text-blue-500">
                      Forgot password?
                  </button>
              </div>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}
          
          {successMsg && (
            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-sm">
              {successMsg}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors shadow-lg shadow-blue-600/20 disabled:opacity-50"
          >
            {loading ? 'Processing...' : (
                view === 'login' ? 'Sign In' : 
                view === 'register' ? 'Create Account' : 
                view === 'forgot_email' ? 'Send Reset Code' : 'Reset Password'
            )}
          </button>
          
          {view === 'login' && (
            <button
                type="button" 
                onClick={handleFillDemo}
                className="w-full py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-colors text-sm"
            >
                Fill Demo Credentials
            </button>
          )}
        </form>

        <div className="mt-6 text-center text-sm">
          {view === 'login' ? (
              <button 
                onClick={() => setView('register')}
                className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              >
                Don't have an account? Sign up
              </button>
          ) : view === 'register' ? (
              <button 
                onClick={() => setView('login')}
                className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              >
                Already have an account? Sign in
              </button>
          ) : (
              <button 
                onClick={() => setView('login')}
                className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              >
                Back to Sign In
              </button>
          )}
        </div>
      </div>
    </div>
  );
};