import React from 'react';
import { ShoppingCart, Heart } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps { 
  product: Product; 
  addToCart: () => void; 
  toggleWishlist: () => void;
  isInWishlist: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  addToCart, 
  toggleWishlist, 
  isInWishlist 
}) => (
  <div className="group bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl dark:hover:shadow-indigo-900/10 transition-all duration-300 overflow-hidden flex flex-col h-full hover:-translate-y-1">
    <div className="relative aspect-[4/3] bg-slate-100 dark:bg-slate-800 overflow-hidden">
      <img 
        src={product.image} 
        alt={product.name} 
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
      />
      <button 
        onClick={(e) => { e.stopPropagation(); toggleWishlist(); }}
        className={`absolute top-3 right-3 p-2.5 rounded-full shadow-md transition-all duration-300 ${
          isInWishlist 
          ? 'bg-pink-500 text-white scale-110' 
          : 'bg-white/90 dark:bg-slate-900/90 text-slate-400 hover:text-pink-500 hover:scale-110'
        }`}
      >
        <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-current' : ''}`} />
      </button>
    </div>
    <div className="p-5 flex flex-col flex-grow">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1 mr-2">
          <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider mb-1">{product.category}</p>
          <h3 className="font-bold text-slate-900 dark:text-white text-lg leading-tight mb-1">{product.name}</h3>
        </div>
        <span className="font-bold text-slate-900 dark:text-white text-lg shrink-0">${product.price}</span>
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 line-clamp-2 flex-grow">{product.description}</p>
      <button 
        onClick={addToCart}
        className="w-full py-3 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg hover:shadow-indigo-500/20 active:scale-95 flex items-center justify-center gap-2"
      >
        <ShoppingCart className="w-4 h-4" />
        Add to Cart
      </button>
    </div>
  </div>
);
