import React, { useState, useRef, useEffect } from 'react';
import { Activity, ChevronDown, ChevronUp, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { AgentLog } from '../types';

interface LogViewerProps { 
  logs: AgentLog[]; 
  isProcessing: boolean; 
}

export const LogViewer: React.FC<LogViewerProps> = ({ logs, isProcessing }) => {
    const [isOpen, setIsOpen] = useState(false);
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (logs.length > 0 && isProcessing) {
            setIsOpen(true);
        }
    }, [logs.length, isProcessing]);

    useEffect(() => {
        if (isOpen && endRef.current) {
            endRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [logs, isOpen]);

    if (logs.length === 0) return null;

    return (
        <div className="mt-8 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm bg-white dark:bg-slate-900 animate-fade-in">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/50 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            >
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    <Activity className="w-4 h-4 text-indigo-500" />
                    Agent Activity Logs
                    <span className="ml-2 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs px-2 py-0.5 rounded-full">{logs.length} events</span>
                </div>
                {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>
            
            {isOpen && (
                <div className="max-h-80 overflow-y-auto p-4 bg-slate-950 space-y-3 font-mono text-xs">
                    {logs.map((log) => (
                        <div key={log.id} className="flex gap-3 group">
                            <span className="text-slate-600 shrink-0 select-none">
                                {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <span className={`font-bold ${
                                        log.agentName === 'Vision Agent' ? 'text-blue-400' :
                                        log.agentName === 'Policy Agent' ? 'text-purple-400' :
                                        log.agentName === 'Resolution Agent' ? 'text-emerald-400' :
                                        log.agentName === 'SQL Database' ? 'text-slate-400' :
                                        'text-orange-400'
                                    }`}>
                                        {log.agentName}
                                    </span>
                                    {log.status === 'processing' && <Loader2 className="w-3 h-3 animate-spin text-slate-500" />}
                                    {log.status === 'success' && <CheckCircle className="w-3 h-3 text-emerald-500" />}
                                    {log.status === 'failure' && <XCircle className="w-3 h-3 text-red-500" />}
                                </div>
                                <p className="text-slate-300 break-words">{log.message}</p>
                                {log.details && (
                                    <div className="mt-2 p-2 rounded bg-slate-900 border border-slate-800 text-slate-400 whitespace-pre-wrap overflow-x-auto">
                                        {log.details}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    <div ref={endRef} />
                </div>
            )}
        </div>
    );
};
