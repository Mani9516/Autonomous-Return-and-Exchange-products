import React from 'react';
import { Heart } from 'lucide-react';
import { MOCK_PRODUCTS } from '../../constants';
import { Product } from '../../types';
import { ProductCard } from '../ProductCard';

interface WishlistTabProps {
  wishlist: Set<string>;
  addToCart: (p: Product) => void;
  toggleWishlist: (id: string) => void;
  setActiveTab: (t: string) => void;
}

export const WishlistTab: React.FC<WishlistTabProps> = ({ 
  wishlist, 
  addToCart, 
  toggleWishlist, 
  setActiveTab 
}) => {
  const wishlistProducts = MOCK_PRODUCTS.filter(p => wishlist.has(p.id));
  
  if (wishlistProducts.length === 0) {
      return (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 animate-fade-in max-w-2xl mx-auto">
              <div className="w-20 h-20 bg-pink-50 dark:bg-pink-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-10 h-10 text-pink-300 dark:text-pink-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Your wishlist is empty</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-8">Tap the heart on any product to save it for later.</p>
              <button onClick={() => setActiveTab('catalog')} className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">
                Browse Products
              </button>
          </div>
      );
  }

  return (
      <div className="animate-fade-in pb-24">
           <div className="flex items-center gap-3 mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">My Wishlist</h2>
              <span className="bg-pink-100 dark:bg-pink-900/50 text-pink-600 dark:text-pink-300 text-xs font-bold px-2.5 py-1 rounded-full">{wishlistProducts.length} items</span>
           </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlistProducts.map(p => (
                  <ProductCard 
                      key={p.id} 
                      product={p} 
                      addToCart={() => addToCart(p)}
                      toggleWishlist={() => toggleWishlist(p.id)}
                      isInWishlist={true}
                  />
              ))}
          </div>
      </div>
  );
};
