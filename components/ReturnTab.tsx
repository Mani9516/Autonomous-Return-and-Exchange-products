import React from 'react';
import { PackageOpen, Camera, XCircle, Loader2, Cpu, CheckCircle, FileText, Download } from 'lucide-react';
import { Product, AgentLog } from '../../types';
import { RETURN_REASONS } from '../../constants';
import { LogViewer } from '../LogViewer';

interface ReturnTabProps {
  selectedProduct: Product | null;
  setActiveTab: (t: string) => void;
  returnReason: string;
  setReturnReason: (r: string) => void;
  uploadedImage: string | null;
  setUploadedImage: (s: string | null) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  startAutonomousReturn: () => void;
  isProcessing: boolean;
  finalDecision: string | null;
  finalEmail: string | null;
  agentLogs: AgentLog[];
}

export const ReturnTab: React.FC<ReturnTabProps> = ({
  selectedProduct,
  setActiveTab,
  returnReason,
  setReturnReason,
  uploadedImage,
  setUploadedImage,
  handleImageUpload,
  startAutonomousReturn,
  isProcessing,
  finalDecision,
  finalEmail,
  agentLogs
}) => {
  if (!selectedProduct) {
      return (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 animate-fade-in mx-auto max-w-2xl">
              <PackageOpen className="w-16 h-16 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-slate-400">Select an item from "My Orders" to initiate a return.</p>
              <button onClick={() => setActiveTab('orders')} className="mt-4 text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
                  Go to Orders
              </button>
          </div>
      );
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in pb-24">
      <div className="space-y-6">
        <div className="text-center md:text-left">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Return Request</h2>
          <div className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg w-fit mx-auto md:mx-0">
              <img src={selectedProduct.image} className="w-12 h-12 rounded object-cover shrink-0" />
              <div className="min-w-0 text-left">
                  <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">{selectedProduct.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{selectedProduct.orderId}</p>
              </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          {/* 1. Reason */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">1. Reason for return</label>
            <select 
              className="w-full border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3 px-3 border outline-none"
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              disabled={isProcessing || !!finalDecision}
            >
              <option value="">Select a reason...</option>
              {RETURN_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          {/* 2. Evidence */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">2. Upload Evidence (AI Analysis)</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 dark:border-slate-700 border-dashed rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors relative bg-slate-50/50 dark:bg-slate-900/50">
              <div className="space-y-1 text-center">
                {uploadedImage ? (
                  <div className="relative">
                    <img src={uploadedImage} alt="Preview" className="mx-auto h-48 object-contain rounded-md shadow-sm" />
                    {!isProcessing && !finalDecision && (
                       <button 
                          onClick={() => setUploadedImage(null)}
                          className="absolute -top-2 -right-2 bg-white dark:bg-slate-700 text-slate-400 border border-slate-200 dark:border-slate-600 rounded-full p-1 shadow-md hover:text-red-500 hover:border-red-500 transition-colors"
                       >
                          <XCircle className="w-5 h-5" />
                       </button>
                    )}
                  </div>
                ) : (
                  <>
                    <Camera className="mx-auto h-12 w-12 text-slate-400" />
                    <div className="flex text-sm text-slate-600 dark:text-slate-400 justify-center">
                      <label className="relative cursor-pointer bg-transparent rounded-md font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 focus-within:outline-none">
                        <span>Upload a photo</span>
                        <input type="file" className="sr-only" accept="image/*" onChange={handleImageUpload} />
                      </label>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-500">Supports JPG, PNG</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action */}
          {!finalDecision && (
            <button
              disabled={!returnReason || !uploadedImage || isProcessing}
              onClick={startAutonomousReturn}
              className={`w-full py-3 rounded-lg font-bold text-white shadow-md transition-all flex items-center justify-center gap-2 ${
                !returnReason || !uploadedImage || isProcessing
                ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:shadow-lg transform active:scale-95'
              }`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Cpu className="w-5 h-5" />
                  Initiate Auto-Review
                </>
              )}
            </button>
          )}
        </div>

        {/* Result */}
        {finalDecision && (
          <div className={`p-6 rounded-xl border shadow-lg animate-fade-in ${
            finalDecision === 'APPROVED' ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' : 
            finalDecision === 'DENIED' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              {finalDecision === 'APPROVED' ? <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" /> : 
               finalDecision === 'DENIED' ? <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" /> : 
               <FileText className="w-8 h-8 text-amber-600 dark:text-amber-400" />}
              <h3 className={`text-2xl font-bold ${
                 finalDecision === 'APPROVED' ? 'text-emerald-800 dark:text-emerald-300' : 
                 finalDecision === 'DENIED' ? 'text-red-800 dark:text-red-300' : 'text-amber-800 dark:text-amber-300'
              }`}>Return {finalDecision}</h3>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 mb-4 font-mono text-sm whitespace-pre-wrap text-slate-800 dark:text-slate-200 shadow-sm">
              {finalEmail}
            </div>

            {finalDecision === 'APPROVED' && (
              <button className="w-full py-3 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition-colors shadow-sm flex items-center justify-center gap-2">
                <Download className="w-5 h-5" />
                Download Label
              </button>
            )}
          </div>
        )}

        {/* Agent Activity Logs Integration */}
        <LogViewer logs={agentLogs} isProcessing={isProcessing} />

      </div>
    </div>
  );
};
