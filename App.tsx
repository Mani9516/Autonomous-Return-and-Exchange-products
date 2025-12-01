import React, { useState, useRef, useEffect } from 'react';
import { GeminiAgent } from './services/geminiService';
import { Order, OrderStatus, ChatMessage, User, Attachment, CartItem, Product } from './types';
import { RETURN_REASONS } from './constants';
import { Content } from '@google/genai';
import { db } from './services/mockDb';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './components/LandingPage';
import { AuthPage } from './components/AuthPage';
import { OrdersView } from './components/OrdersView';
import { CartView } from './components/CartView';
import { WishlistView } from './components/WishlistView'; // Not used directly in App render but used in ProfileDashboard
import { CatalogView } from './components/CatalogView';
import { ProfileDashboard } from './components/ProfileDashboard';
import { generateInvoice } from './utils/invoiceGenerator';

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

            {activeTab === 'profile' && <ProfileDashboard 
                user={user}
                orders={orders}
                cart={cart}
                wishlist={wishlist}
                initiateReturn={initiateReturn}
                removeFromCart={removeFromCart}
                updateQuantity={updateQuantity}
                checkoutCart={checkoutCart}
                setActiveTab={setActiveTab}
                toggleWishlist={toggleWishlist}
                addToCart={addToCart}
            />}
            {activeTab === 'orders' && <div className="max-w-5xl mx-auto"><h2 className="text-2xl font-bold mb-6">My Orders</h2><OrdersView orders={orders} user={user} initiateReturn={initiateReturn} /></div>}
            {activeTab === 'catalog' && <CatalogView user={user} wishlist={wishlist} addToCart={addToCart} toggleWishlist={toggleWishlist} onRefresh={loadUserData} />}
            {activeTab === 'cart' && <div className="max-w-4xl mx-auto"><h2 className="text-2xl font-bold mb-6">Shopping Cart ({cart.reduce((a, b) => a + b.quantity, 0)} items)</h2><CartView cart={cart} removeFromCart={removeFromCart} updateQuantity={updateQuantity} checkoutCart={checkoutCart} setActiveTab={setActiveTab} /></div>}
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