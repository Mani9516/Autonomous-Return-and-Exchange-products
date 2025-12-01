import React from 'react';
import { Product } from '../types';
import { ALL_PRODUCTS } from '../constants';

interface WishlistViewProps {
  wishlist: string[];
  toggleWishlist: (product: Product) => void;
  addToCart: (product: Product) => void;
}

export const WishlistView: React.FC<WishlistViewProps> = ({ wishlist, toggleWishlist, addToCart }) => {
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
