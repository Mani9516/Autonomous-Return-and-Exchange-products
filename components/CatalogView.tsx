import React from 'react';
import { Product, User } from '../types';
import { ALL_PRODUCTS } from '../constants';
import { db } from '../services/mockDb';

interface CatalogViewProps {
  user: User | null;
  wishlist: string[];
  addToCart: (product: Product) => void;
  toggleWishlist: (product: Product) => void;
  onRefresh: (user: User) => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({ user, wishlist, addToCart, toggleWishlist, onRefresh }) => {
    const handleBuyNow = async (item: Product) => {
        if (!user) return;
        await db.createOrder(user.id, [item]);
        onRefresh(user);
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