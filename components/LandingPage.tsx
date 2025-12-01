import React from 'react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => (
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