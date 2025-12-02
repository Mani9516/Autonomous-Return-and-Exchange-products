import React from 'react';
import { ShoppingCart, Loader2, CreditCard } from 'lucide-react';
import { CartItem } from '../../types';

interface CartTabProps {
  cart: CartItem[];
  setActiveTab: (t: string) => void;
  handleCheckout: () => void;
  isProcessing: boolean;
}

export const CartTab: React.FC<CartTabProps> = ({
  cart,
  setActiveTab,
  handleCheckout,
  isProcessing
}) => (
    <div className="max-w-5xl mx-auto animate-fade-in pb-24">
        {cart.length === 0 ? (
             <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                  <ShoppingCart className="w-16 h-16 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
                  <p className="text-slate-500 dark:text-slate-400">Your cart is empty.</p>
                  <button onClick={() => setActiveTab('catalog')} className="mt-4 text-indigo-600 dark:text-indigo-400 font-medium hover:underline">Start Shopping</button>
              </div>
        ) : (
            <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    {cart.map((item, idx) => (
                        <div key={idx} className="p-4 flex gap-4 border-b border-slate-100 dark:border-slate-800 last:border-0">
                            <img src={item.image} className="w-20 h-20 object-cover rounded-lg bg-slate-100 dark:bg-slate-800" />
                            <div className="flex-1">
                                <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-1">{item.name}</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm">{item.category}</p>
                                <div className="mt-2 flex justify-between items-center">
                                    <span className="font-bold text-slate-900 dark:text-white">${item.price}</span>
                                    <div className="text-sm text-slate-500 dark:text-slate-400">Qty: {item.quantity}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="w-full lg:w-80 h-fit bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="font-bold text-lg mb-4 text-slate-900 dark:text-white">Summary</h3>
                    <div className="flex justify-between mb-2 text-slate-600 dark:text-slate-400">
                        <span>Subtotal</span>
                        <span>${cart.reduce((a, b) => a + (b.price * b.quantity), 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mb-4 text-slate-600 dark:text-slate-400">
                        <span>Tax (8%)</span>
                        <span>${(cart.reduce((a, b) => a + (b.price * b.quantity), 0) * 0.08).toFixed(2)}</span>
                    </div>
                    <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex justify-between font-bold text-lg mb-6 text-slate-900 dark:text-white">
                        <span>Total</span>
                        <span>${(cart.reduce((a, b) => a + (b.price * b.quantity), 0) * 1.08).toFixed(2)}</span>
                    </div>
                    <button 
                      onClick={handleCheckout}
                      disabled={isProcessing}
                      className="w-full bg-slate-900 dark:bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-slate-800 dark:hover:bg-indigo-500 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
                        {isProcessing ? 'Processing Payment...' : 'Checkout'}
                    </button>
                </div>
            </div>
        )}
    </div>
);
