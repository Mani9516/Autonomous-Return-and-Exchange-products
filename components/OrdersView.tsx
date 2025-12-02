import React from 'react';
import { createRoot } from 'react-dom/client';
import { Download, CornerUpLeft } from 'lucide-react';
import { MOCK_PRODUCTS } from '../../constants';
import { Product, User } from '../../types';
import { InvoiceView } from '../InvoiceView';

interface OrdersTabProps {
  user: User | null;
  setSelectedProduct: (p: Product) => void;
  setActiveTab: (t: string) => void;
}

export const OrdersTab: React.FC<OrdersTabProps> = ({
  user,
  setSelectedProduct,
  setActiveTab
}) => (
  <div className="animate-fade-in space-y-4 pb-24">
      {MOCK_PRODUCTS.slice(0, 3).map((p) => (
        <div key={p.id} className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 flex flex-col md:flex-row items-start md:items-center gap-6 shadow-sm hover:shadow-md transition-shadow">
          <img src={p.image} alt={p.name} className="w-24 h-24 object-cover rounded-md bg-slate-100 dark:bg-slate-800 shrink-0" />
          <div className="flex-1 w-full text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg text-slate-900 dark:text-white line-clamp-1">{p.name}</h3>
                <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
                <span className="text-xs font-medium px-2 py-0.5 bg-green-100 dark:bg-green-900/30 rounded text-green-700 dark:text-green-300 w-fit">Delivered</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">Ordered on {p.purchasedDate}</p>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-mono">{p.orderId}</p>
          </div>
          <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto min-w-[160px]">
             <button 
              onClick={() => {
                  const win = window.open('', '_blank');
                  if(win && user) {
                      win.document.write('<html><head><title>Invoice</title><script src="https://cdn.tailwindcss.com"></script></head><body>');
                      win.document.write(`<div id="invoice-root"></div>`);
                      win.document.write('</body></html>');
                      const container = win.document.getElementById('invoice-root');
                      if(container) {
                           const root = createRoot(container);
                           root.render(<InvoiceView product={p} user={user} date={new Date().toLocaleDateString()} />);
                      }
                  }
              }}
              className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium flex items-center justify-center gap-2 transition-colors"
             >
               <Download className="w-4 h-4" /> <span className="md:hidden lg:inline">Invoice</span>
             </button>
            <button 
              onClick={() => {
                setSelectedProduct(p);
                setActiveTab('return');
              }}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <CornerUpLeft className="w-4 h-4" />
              Return
            </button>
          </div>
        </div>
      ))}
  </div>
);
