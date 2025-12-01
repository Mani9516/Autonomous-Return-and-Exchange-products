import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GeminiAgent } from './services/geminiService';
import { Order, OrderStatus, ChatMessage, LogEntry, User, Attachment, NlpState, CartItem, Product } from './types';
import { ALL_PRODUCTS, KNOWLEDGE_BASE_ARTICLES, RETURN_REASONS } from './constants';
import { Content } from '@google/genai';
import { db } from './services/mockDb';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from './components/Sidebar';

// --- Helper: Invoice Generator ---
const generateInvoice = (order: Order, user: User) => {
    const total = order.items.reduce((sum, item) => sum + item.price, 0);
    const invoiceHtml = `
    <html>
    <head>
        <title>Invoice #${order.orderId}</title>
        <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 40px; }
            .logo { font-size: 24px; font-weight: bold; color: #4f46e5; }
            .meta { text-align: right; }
            .bill-to { margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { text-align: left; padding: 12px; background: #f9fafb; border-bottom: 1px solid #eee; }
            td { padding: 12px; border-bottom: 1px solid #eee; }
            .total { text-align: right; font-size: 20px; font-weight: bold; }
            .footer { margin-top: 50px; font-size: 12px; color: #999; text-align: center; }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="logo">AutoReturn AI</div>
            <div class="meta">
                <p>Invoice #: ${order.orderId}</p>
                <p>Date: ${order.date}</p>
            </div>
        </div>
        <div class="bill-to">
            <strong>Bill To:</strong><br>
            ${user.name}<br>
            ${user.email}
        </div>
        <table>
            <thead>
                <tr>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Price</th>
                </tr>
            </thead>
            <tbody>
                ${order.items.map(item => `
                <tr>
                    <td>${item.name} <br><span style="font-size:12px;color:#666">${item.id}</span></td>
                    <td>1</td>
                    <td>$${item.price.toFixed(2)}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>
        <div class="total">Total: $${total.toFixed(2)}</div>
        <div class="footer">
            Thank you for your business. This is an electronically generated invoice.
        </div>
    </body>
    </html>
    `;
    const blob = new Blob([invoiceHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Invoice-${order.orderId}.html`;
    a.click();
    URL.revokeObjectURL(url);
};

// --- Components ---

const LandingPage = ({ onGetStarted }: { onGetStarted: () => void }) => (
  <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 flex flex-col">
    <header className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
      <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">
        AutoReturn AI
      </div>
      <button 
        onClick={onGetStarted}
        className="px-5 py-2 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium hover:opacity-90 transition-opacity"
      >
        Login
      </button>
    </header>

    <main className="flex-1 flex flex-col items-center justify-center text-center px-4 relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -z-10" />

      <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 max-w-4xl">
        Autonomous Returns <br/>
        <span className="text-blue-600 dark:text-blue-400">Powered by Intelligence</span>
      </h1>
      <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mb-10 leading-relaxed">
        Experience the future of customer service. Our Multi-Agent System handles complex returns, exchanges, and policy checks instantly using Vision, NLP, and Logic.
      </p>

      <button 
        onClick={onGetStarted}
        className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white transition-all duration-200 bg-blue-600 rounded-full hover:bg-blue-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 shadow-lg shadow-blue-600/30"
      >
        Access Portal
        <svg className="w-5 h-5 ml-2 -mr-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-5xl w-full text-left">
        {[
          { title: "Vision Agent", desc: "Instantly analyzes product damage photos and videos using YOLOv5 & Gemini Vision." },
          { title: "Policy Engine", desc: "Checks return eligibility against 50+ rules in real-time via ChromaDB." },
          { title: "Smart Resolution", desc: "Automated approvals for refunds and exchanges without human intervention." }
        ].map((feat, i) => (
          <div key={i} className="p-6 rounded-2xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-semibold mb-2">{feat.title}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">{feat.desc}</p>
          </div>
        ))}
      </div>
    </main>
  </div>
);

type AuthView = 'login' | 'register' | 'forgot_email' | 'forgot_verify';

const AuthPage = ({ onAuthSuccess }: { onAuthSuccess: (user: User) => void }) => {
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

// --- Main App Logic ---

const App = () => {
  const [view, setView] = useState<'landing' | 'auth' | 'app'>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'support' | 'orders' | 'catalog' | 'cart' | 'profile'>('support');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const agentRef = useRef<GeminiAgent | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Data State
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);

  // Return Flow State
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedOrderForReturn, setSelectedOrderForReturn] = useState<Order | null>(null);
  const [returnReason, setReturnReason] = useState('');

  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Initialization
  useEffect(() => {
    // Initialize Agent
    agentRef.current = new GeminiAgent();

    // Check session
    const checkSession = async () => {
        const sessionUser = await db.restoreSession();
        if (sessionUser) {
            setUser(sessionUser);
            loadUserData(sessionUser);
            setView('app');
        }
    };
    checkSession();

    // Dark mode init
    const isDark = document.documentElement.classList.contains('dark') || 
                   (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    setIsDarkMode(isDark);
    if (isDark) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const loadUserData = async (currentUser: User) => {
      const userOrders = await db.fetchUserOrders(currentUser.id);
      setOrders(userOrders);
      setWishlist(currentUser.wishlist || []);
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // --- Actions ---

  const handleLogout = () => {
      db.clearSession();
      setUser(null);
      setMessages([]);
      setCart([]);
      setWishlist([]);
      setView('landing');
      setActiveTab('support');
  };

  const handleSendMessage = async (text: string = input) => {
    if ((!text.trim() && !attachment) || isLoading) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: text,
      attachment: attachment || undefined
    };

    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setAttachment(null);
    setIsLoading(true);

    try {
      // Build history for API
      const history: Content[] = messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }] 
      }));

      // Tool Executor for Simulated Backend
      const toolExecutor = async (name: string, args: any) => {
        console.log(`[Backend] Executing ${name}`, args);
        
        switch (name) {
          case 'performNlpAnalysis':
            await new Promise(r => setTimeout(r, 400)); // Simulate latency
            return {
              intent: (args.text || "").toLowerCase().includes('return') ? 'return_request' : 'general_inquiry',
              sentiment: 'neutral',
              entities: []
            };

          case 'getUserOrders':
             // Return simplified list for context
             return orders.slice(0, 5).map(o => ({
                 id: o.orderId,
                 date: o.date,
                 items: o.items.map(i => i.name).join(', ')
             }));

          case 'runPythonVisionAnalysis':
             let detected = (args && args.defectClass) ? args.defectClass : "physical_damage";
             
             // Smart Context Detection for Simulation
             const combinedInput = `${newMessage.text} ${args?.defectClass || ''}`.toLowerCase();
             if (combinedInput.includes('screen') || combinedInput.includes('monitor') || combinedInput.includes('display') || combinedInput.includes('tv')) {
                 detected = "cracked_screen";
             } else if (combinedInput.includes('tear') || combinedInput.includes('hole') || combinedInput.includes('fabric')) {
                 detected = "torn_fabric";
             } else if (combinedInput.includes('scrat')) {
                 detected = "scratches";
             }

             // Inject Visual Card immediately
             setMessages(prev => [...prev, {
                 id: `sys_${Date.now()}`,
                 role: 'system',
                 text: "analyzing",
                 isToolOutput: true,
                 toolName: "YOLOv5 Analysis",
                 analysisResult: {
                     status: "complete",
                     detected_objects: [detected],
                     confidence: 0.98,
                     analysis_time_ms: 342
                 }
             }]);

             await new Promise(r => setTimeout(r, 1500)); // Simulate heavy processing
             return {
                 status: "success",
                 detected_objects: [detected],
                 confidence: 0.98,
                 bounding_box: [100, 150, 400, 500],
                 analysis_time_ms: 342
             };

          case 'processReturn':
             if (args.orderId) {
                await db.updateOrderStatus(args.orderId, OrderStatus.RETURN_INITIATED);
             }
             if (user) await loadUserData(user); // Refresh UI
             return { transactionId: `txn_${Date.now()}`, status: "approved" };

          case 'checkReturnPolicy':
             // Simple rule engine simulation
             const reason = (args.scenario || "").toLowerCase();
             if (reason.includes('damage') || reason.includes('defective')) return { eligible: true, action: "Refund" };
             if (reason.includes('mind')) return { eligible: true, fee: 5.99, action: "Refund" };
             return { eligible: true, action: "Review" };

          default:
             return { result: "Function executed successfully on backend." };
        }
      };

      if (agentRef.current) {
        const responseText = await agentRef.current.sendMessage(
            newMessage.text,
            newMessage.attachment ? { base64: newMessage.attachment.base64, mimeType: newMessage.attachment.mimeType } : null,
            history,
            toolExecutor
        );

        setMessages(prev => [...prev, {
            id: (Date.now() + 1).toString(),
            role: 'model',
            text: responseText
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "I'm having trouble connecting to the support server. Please try again."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setAttachment({
        type: file.type.startsWith('video') ? 'video' : 'image',
        url: URL.createObjectURL(file),
        base64: (event.target?.result as string).split(',')[1],
        mimeType: file.type
      });
    };
    reader.readAsDataURL(file);
  };

  // --- Cart Logic ---
  const addToCart = (product: Product) => {
    setCart(prev => {
        const existing = prev.find(item => item.product.id === product.id);
        if (existing) {
            return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
        }
        return [...prev, { id: `cart_${Date.now()}`, product, quantity: 1 }];
    });
    // Visual feedback
    const btn = document.getElementById(`btn-add-${product.id}`);
    if(btn) {
        const originalText = btn.innerText;
        btn.innerText = "Added!";
        btn.classList.add('bg-green-600');
        setTimeout(() => {
            btn.innerText = originalText;
            btn.classList.remove('bg-green-600');
        }, 1500);
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(p => p.product.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
        if (item.product.id === productId) {
            return { ...item, quantity: Math.max(1, item.quantity + delta) };
        }
        return item;
    }));
  };

  const checkoutCart = async () => {
    if(!user || cart.length === 0) return;
    const items = cart.flatMap(item => Array(item.quantity).fill(item.product));
    await db.createOrder(user.id, items);
    setCart([]);
    await loadUserData(user);
    setActiveTab('orders');
    alert("Order placed successfully! Check 'My Orders'.");
  };

  // --- Wishlist Logic ---
  const toggleWishlist = async (product: Product) => {
      if (!user) return;
      const newWishlist = await db.toggleWishlist(user.id, product.id);
      setWishlist(newWishlist);
  };

  // --- Return Flow Logic ---

  const initiateReturn = (order: Order) => {
      setSelectedOrderForReturn(order);
      setShowReturnModal(true);
  };

  const confirmReturnReason = (reason: string) => {
      setShowReturnModal(false);
      setActiveTab('support');
      
      const prompt = `I would like to initiate a return for Order #${selectedOrderForReturn?.orderId}.
      The reason category is: "${reason}".
      Please ask me for any details you need to process this.`;
      
      handleSendMessage(prompt);
      setReturnReason(reason);
  };

  // --- Sub-Views ---

  const OrdersView = () => (
    <div className="space-y-6 pb-20">
      {orders.length === 0 ? (
          <div className="text-center py-10 text-slate-500">No orders found. Browse the catalog to create one.</div>
      ) : (
          orders.slice().reverse().map(order => (
            <div key={order.orderId} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 flex flex-wrap justify-between items-center gap-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex gap-6 text-sm">
                  <div>
                    <span className="block text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide">Order Placed</span>
                    <span className="font-medium">{order.date}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide">Total Items</span>
                    <span className="font-medium">{order.items.length}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide">Order #</span>
                    <span className="font-medium">{order.orderId}</span>
                  </div>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => user && generateInvoice(order, user)}
                        className="text-blue-600 dark:text-blue-400 text-sm hover:underline font-medium"
                    >
                        Download Invoice
                    </button>
                    {(order.status === OrderStatus.DELIVERED || order.status === OrderStatus.RETURN_INITIATED) && (
                        <button 
                            onClick={() => initiateReturn(order)}
                            className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
                        >
                            Return / Exchange
                        </button>
                    )}
                </div>
              </div>
              <div className="p-4 space-y-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-center">
                    <div className="w-16 h-16 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-white">{item.name}</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Qty: 1 • {item.price.toFixed(2)} USD</p>
                    </div>
                  </div>
                ))}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        order.status === OrderStatus.DELIVERED ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                        order.status === OrderStatus.RETURN_INITIATED ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                        {order.status}
                    </span>
                </div>
              </div>
            </div>
          ))
      )}
    </div>
  );

  const CartView = () => {
    const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

    return (
      <div className="pb-20">
        {cart.length === 0 ? (
           <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
             <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
             </div>
             <p className="text-slate-500 mb-6">Your cart is empty</p>
             <button onClick={() => setActiveTab('catalog')} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Browse Catalog</button>
           </div>
        ) : (
           <div className="grid gap-8 md:grid-cols-3">
             <div className="md:col-span-2 space-y-4">
               {cart.map(item => (
                 <div key={item.id} className="flex gap-4 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <img src={item.product.image} className="w-24 h-24 object-cover rounded-lg bg-slate-100" alt={item.product.name} />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                          <h3 className="font-semibold text-slate-900 dark:text-white">{item.product.name}</h3>
                          <button 
                            onClick={() => removeFromCart(item.product.id)} 
                            className="text-slate-400 hover:text-red-500"
                            title="Remove Item"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                          </button>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{item.product.color} • {item.product.size}</p>
                      
                      <div className="flex justify-between items-end mt-2">
                        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 rounded-lg p-1">
                            <button 
                                onClick={() => updateQuantity(item.product.id, -1)} 
                                className="w-7 h-7 flex items-center justify-center rounded-md bg-white dark:bg-slate-700 shadow-sm text-slate-600 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-50"
                                disabled={item.quantity <= 1}
                            >-</button>
                            <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                            <button 
                                onClick={() => updateQuantity(item.product.id, 1)} 
                                className="w-7 h-7 flex items-center justify-center rounded-md bg-white dark:bg-slate-700 shadow-sm text-slate-600 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600"
                            >+</button>
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white">${(item.product.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                 </div>
               ))}
             </div>
             <div className="h-fit p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm sticky top-24">
               <h3 className="text-lg font-bold mb-4">Summary</h3>
               <div className="flex justify-between mb-2 text-slate-600 dark:text-slate-300"><span>Subtotal</span><span>${total.toFixed(2)}</span></div>
               <div className="flex justify-between mb-4 text-sm text-green-600"><span>Shipping</span><span>Free</span></div>
               <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex justify-between font-bold text-lg mb-6">
                 <span>Total</span><span>${total.toFixed(2)}</span>
               </div>
               <button onClick={checkoutCart} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-lg shadow-blue-600/20 transition-all">
                 Checkout & Pay
               </button>
               <p className="text-xs text-center text-slate-400 mt-4">Secure Checkout Powered by Stripe (Demo)</p>
             </div>
           </div>
        )}
      </div>
    );
  };

  const WishlistView = () => {
      const wishlistItems = ALL_PRODUCTS.filter(p => wishlist.includes(p.id));

      return (
          <div className="pb-20">
              {wishlistItems.length === 0 ? (
                  <div className="text-center py-10 text-slate-500">Your wishlist is empty.</div>
              ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                      {wishlistItems.map(product => (
                          <div key={product.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col">
                              <div className="h-40 overflow-hidden relative">
                                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                  <button 
                                    onClick={() => toggleWishlist(product)}
                                    className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 text-red-500 shadow-sm"
                                  >
                                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                                  </button>
                              </div>
                              <div className="p-4 flex-1 flex flex-col">
                                  <h4 className="font-semibold text-slate-900 dark:text-white mb-1">{product.name}</h4>
                                  <p className="text-slate-500 text-sm mb-4">${product.price}</p>
                                  <button 
                                      onClick={() => addToCart(product)}
                                      className="mt-auto w-full py-2 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                                  >
                                      Move to Cart
                                  </button>
                              </div>
                          </div>
                      ))}
                  </div>
              )}
          </div>
      );
  };

  const ProfileDashboard = () => {
    const [subTab, setSubTab] = useState<'orders' | 'cart' | 'wishlist'>('orders');

    return (
        <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm mb-8 flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                    {(user?.name || "U").charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{user?.name}</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-4">{user?.email}</p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-2">
                        <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium border border-blue-100 dark:border-blue-800">Premium Member</span>
                        <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-700">ID: {user?.id}</span>
                    </div>
                </div>
                <div className="flex flex-col gap-2 min-w-[140px]">
                     <div className="grid grid-cols-3 gap-2 text-center text-sm">
                         <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                             <div className="font-bold">{orders.length}</div>
                             <div className="text-[10px] text-slate-500">Orders</div>
                         </div>
                         <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                             <div className="font-bold">{wishlist.length}</div>
                             <div className="text-[10px] text-slate-500">Saved</div>
                         </div>
                         <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                             <div className="font-bold">{cart.length}</div>
                             <div className="text-[10px] text-slate-500">Cart</div>
                         </div>
                     </div>
                </div>
            </div>

            {/* Dashboard Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6">
                <button 
                    onClick={() => setSubTab('orders')}
                    className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${subTab === 'orders' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
                >
                    My Orders
                </button>
                <button 
                    onClick={() => setSubTab('wishlist')}
                    className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${subTab === 'wishlist' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
                >
                    Wishlist
                </button>
                <button 
                    onClick={() => setSubTab('cart')}
                    className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${subTab === 'cart' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
                >
                    My Cart
                </button>
            </div>

            {/* Tab Content */}
            <div className="min-h-[300px]">
                {subTab === 'orders' && <OrdersView />}
                {subTab === 'wishlist' && <WishlistView />}
                {subTab === 'cart' && <CartView />}
            </div>
        </div>
    );
  };

  const CatalogDemoView = () => {
    const handleBuyNow = async (item: Product) => {
        if (!user) return;
        await db.createOrder(user.id, [item]);
        await loadUserData(user);
        alert("Order created instantly! Check 'My Orders'.");
    };

    return (
      <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
         <div className="mb-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900">
             <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">Shopping Catalog</h3>
             <p className="text-blue-700 dark:text-blue-300 leading-relaxed">
                 Browse our collection. Use <strong>Add to Cart</strong> to build a multi-item order, or <strong>Buy Now</strong> for a quick purchase simulation.
             </p>
         </div>
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {ALL_PRODUCTS.map(product => {
                const isLiked = wishlist.includes(product.id);
                return (
                    <div key={product.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-lg transition-shadow group flex flex-col h-full relative">
                        <div className="h-48 overflow-hidden bg-slate-100 relative">
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            <div className="absolute top-2 left-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-2 py-1 rounded text-xs font-medium border border-slate-200 dark:border-slate-700">
                                {product.category}
                            </div>
                            <button 
                                onClick={() => toggleWishlist(product)}
                                className={`absolute top-2 right-2 p-2 rounded-full shadow-sm transition-colors ${isLiked ? 'bg-red-50 text-red-500' : 'bg-white/90 text-slate-400 hover:text-red-500'}`}
                            >
                                <svg className={`w-5 h-5 ${isLiked ? 'fill-current' : 'fill-none'}`} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                            </button>
                        </div>
                        <div className="p-5 flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-1">{product.name}</h3>
                                <span className="font-bold text-slate-900 dark:text-white">${product.price}</span>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 flex-1">{product.tags.join(', ')}</p>
                            
                            <div className="grid grid-cols-2 gap-3 mt-auto">
                                <button 
                                    id={`btn-add-${product.id}`}
                                    onClick={() => addToCart(product)}
                                    className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm"
                                >
                                    Add to Cart
                                </button>
                                <button 
                                    onClick={() => handleBuyNow(product)}
                                    className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-medium hover:opacity-90 transition-opacity text-sm"
                                >
                                    Buy Now
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })}
         </div>
      </div>
    );
  };

  // --- Views Handling ---

  if (view === 'landing') return <LandingPage onGetStarted={() => setView('auth')} />;
  if (view === 'auth') return <AuthPage onAuthSuccess={(u) => { setUser(u); loadUserData(u); setView('app'); }} />;

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans transition-colors duration-300 overflow-hidden">
      
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartItemCount={cart.reduce((a, b) => a + b.quantity, 0)}
        user={user}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-30 shrink-0">
            <button onClick={() => setIsSidebarOpen(true)} className="text-slate-600 dark:text-slate-300">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>
            <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">AutoReturn AI</span>
            <div className="w-6"></div> {/* Spacer */}
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
            
            {activeTab === 'support' && (
                <div className="max-w-4xl mx-auto h-[85vh] md:h-[90vh] flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-300">
                    {/* Agent Header */}
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur flex justify-between items-center z-10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-900 dark:text-white">AutoReturn Assistant</h3>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                    <span className="text-xs text-slate-500 dark:text-slate-400">Online • Powered by Gemini 2.0</span>
                                </div>
                            </div>
                        </div>
                        {messages.find(m => m.analysisResult) && (
                            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-xs font-medium text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900">
                                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                                Vision Analysis Active
                            </div>
                        )}
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30 dark:bg-slate-950/30">
                        {messages.length === 0 && (
                            <div className="text-center mt-20 opacity-50">
                                <div className="w-20 h-20 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mb-4 flex items-center justify-center">
                                    <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                                </div>
                                <p className="text-slate-500">How can I help you with your order today?</p>
                            </div>
                        )}
                        {messages.map((msg) => (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={msg.id} 
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${
                                    msg.role === 'user' 
                                        ? 'bg-blue-600 text-white rounded-tr-none' 
                                        : msg.role === 'system'
                                        ? 'bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 w-full max-w-sm'
                                        : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-tl-none'
                                }`}>
                                    {msg.attachment && (
                                        <div className="mb-3 rounded-lg overflow-hidden border border-white/20">
                                            {msg.attachment.type === 'image' ? (
                                                <img src={msg.attachment.url} alt="User upload" className="max-w-xs max-h-48 object-cover" />
                                            ) : (
                                                <video src={msg.attachment.url} controls className="max-w-xs max-h-48 bg-black" />
                                            )}
                                        </div>
                                    )}
                                    
                                    {msg.role === 'system' && msg.analysisResult ? (
                                        <div className="text-xs font-mono">
                                            <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-200 dark:border-slate-600">
                                                <span className="font-bold flex items-center gap-2">
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                    YOLOv5 Analysis
                                                </span>
                                                <span className="text-green-600 dark:text-green-400 font-bold">{Math.round(msg.analysisResult.confidence * 100)}% Conf.</span>
                                            </div>
                                            <div className="space-y-1.5">
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500 dark:text-slate-400">Detected:</span>
                                                    <span className="font-bold text-red-500">{msg.analysisResult.detected_objects.join(', ')}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500 dark:text-slate-400">Latency:</span>
                                                    <span>{msg.analysisResult.analysis_time_ms}ms</span>
                                                </div>
                                                <div className="mt-2 w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                                                    <div className="bg-blue-500 h-full w-[98%]"></div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="prose dark:prose-invert text-sm max-w-none whitespace-pre-wrap">
                                            {msg.text}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white dark:bg-slate-800 rounded-2xl rounded-tl-none p-4 border border-slate-100 dark:border-slate-700 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></span>
                                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-75"></span>
                                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-150"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                        {attachment && (
                            <div className="mb-3 flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg w-fit border border-slate-200 dark:border-slate-700">
                                <span className="text-xs font-medium truncate max-w-[200px]">Attached Media</span>
                                <button onClick={() => setAttachment(null)} className="text-slate-500 hover:text-red-500">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                </button>
                            </div>
                        )}
                        <div className="flex gap-2">
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors"
                                title="Upload Photo or Video of Damage"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                            </button>
                            <input 
                                type="file" 
                                ref={fileInputRef}
                                className="hidden" 
                                accept="image/*,video/*"
                                onChange={handleFileUpload}
                            />
                            <input 
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Describe your issue or return request... (Upload photos for damage claims)"
                                className="flex-1 bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                            />
                            <button 
                                onClick={() => handleSendMessage()}
                                disabled={isLoading || (!input.trim() && !attachment)}
                                className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded-xl transition-colors shadow-lg shadow-blue-600/20"
                            >
                                <svg className="w-6 h-6 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'profile' && <ProfileDashboard />}
            {activeTab === 'orders' && <div className="max-w-5xl mx-auto"><h2 className="text-2xl font-bold mb-6">My Orders</h2><OrdersView /></div>}
            {activeTab === 'catalog' && <CatalogDemoView />}
            {activeTab === 'cart' && <div className="max-w-4xl mx-auto"><h2 className="text-2xl font-bold mb-6">Shopping Cart ({cart.reduce((a, b) => a + b.quantity, 0)} items)</h2><CartView /></div>}
        </main>
      </div>

      {/* Return Reason Modal */}
      <AnimatePresence>
        {showReturnModal && selectedOrderForReturn && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            >
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800"
                >
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Why are you returning this?</h3>
                        <button onClick={() => setShowReturnModal(false)} className="text-slate-400 hover:text-slate-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>
                    
                    <p className="text-sm text-slate-500 mb-6">Select a reason to help our AI Agent process your request faster.</p>
                    
                    <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                        {RETURN_REASONS.map((reason, idx) => (
                            <button 
                                key={idx}
                                onClick={() => confirmReturnReason(reason)}
                                className="w-full text-left p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-800 transition-colors flex justify-between items-center group"
                            >
                                <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-blue-700 dark:group-hover:text-blue-300">{reason}</span>
                                <svg className="w-5 h-5 text-slate-300 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                            </button>
                        ))}
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
