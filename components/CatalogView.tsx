import React from 'react';
import { CATEGORIES, MOCK_PRODUCTS } from '../../constants';
import { Product } from '../../types';
import { ProductCard } from '../ProductCard';

interface CatalogTabProps {
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
  addToCart: (p: Product) => void;
  toggleWishlist: (id: string) => void;
  wishlist: Set<string>;
}

export const CatalogTab: React.FC<CatalogTabProps> = ({ 
  selectedCategory, 
  setSelectedCategory, 
  addToCart, 
  toggleWishlist, 
  wishlist 
}) => (
  <div className="animate-fade-in pb-24">
    {/* Categories */}
    <div className="flex gap-3 overflow-x-auto pb-4 mb-6 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
      {CATEGORIES.map((cat, idx) => (
        <button 
          key={idx}
          onClick={() => setSelectedCategory(cat)}
          className={`px-5 py-2.5 rounded-full whitespace-nowrap text-sm font-medium transition-all ${
            selectedCategory === cat
            ? 'bg-indigo-600 text-white shadow-md transform scale-105' 
            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>

    {/* Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {MOCK_PRODUCTS
          .filter(p => selectedCategory === 'All' || p.category === selectedCategory)
          .map((p) => (
          <ProductCard 
              key={p.id} 
              product={p} 
              addToCart={() => addToCart(p)}
              toggleWishlist={() => toggleWishlist(p.id)}
              isInWishlist={wishlist.has(p.id)}
          />
      ))}
    </div>
  </div>
);
