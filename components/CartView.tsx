import React from 'react';
import { CartItem, Product } from '../types';

interface CartViewProps {
  cart: CartItem[];
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  checkoutCart: () => void;
  setActiveTab: (tab: any) => void;
}

export const CartView: React.FC<CartViewProps> = ({ cart, removeFromCart, updateQuantity, checkoutCart, setActiveTab }) => {
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