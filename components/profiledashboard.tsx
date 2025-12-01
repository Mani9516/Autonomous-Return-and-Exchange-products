import React, { useState } from 'react';
import { User, Order, CartItem, Product } from '../types';
import { OrdersView } from './OrdersView';
import { WishlistView } from './WishlistView';
import { CartView } from './CartView';

interface ProfileDashboardProps {
  user: User | null;
  orders: Order[];
  cart: CartItem[];
  wishlist: string[];
  initiateReturn: (order: Order) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  checkoutCart: () => void;
  setActiveTab: (tab: any) => void;
  toggleWishlist: (product: Product) => void;
  addToCart: (product: Product) => void;
}

export const ProfileDashboard: React.FC<ProfileDashboardProps> = ({ 
    user, 
    orders, 
    cart, 
    wishlist, 
    initiateReturn,
    removeFromCart,
    updateQuantity,
    checkoutCart,
    setActiveTab,
    toggleWishlist,
    addToCart
}) => {
    const [subTab, setSubTab] = useState<'orders' | 'cart' | 'wishlist'>('orders');

    return (
        <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm mb-8 flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                    {(user?.name || "U").charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{user?.name}</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-4">{user?.email}</p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-2">
                        <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium border border-blue-100 dark:border-blue-800">Premium Member</span>
                        <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-700">ID: {user?.id}</span>
                    </div>
                </div>
                <div className="flex flex-col gap-2 min-w-[140px]">
                     <div className="grid grid-cols-3 gap-2 text-center text-sm">
                         <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                             <div className="font-bold">{orders.length}</div>
                             <div className="text-[10px] text-slate-500">Orders</div>
                         </div>
                         <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                             <div className="font-bold">{wishlist.length}</div>
                             <div className="text-[10px] text-slate-500">Saved</div>
                         </div>
                         <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                             <div className="font-bold">{cart.length}</div>
                             <div className="text-[10px] text-slate-500">Cart</div>
                         </div>
                     </div>
                </div>
            </div>

            {/* Dashboard Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6">
                <button 
                    onClick={() => setSubTab('orders')}
                    className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${subTab === 'orders' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
                >
                    My Orders
                </button>
                <button 
                    onClick={() => setSubTab('wishlist')}
                    className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${subTab === 'wishlist' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
                >
                    Wishlist
                </button>
                <button 
                    onClick={() => setSubTab('cart')}
                    className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${subTab === 'cart' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
                >
                    My Cart
                </button>
            </div>

            {/* Tab Content */}
            <div className="min-h-[300px]">
                {subTab === 'orders' && <OrdersView orders={orders} user={user} initiateReturn={initiateReturn} />}
                {subTab === 'wishlist' && <WishlistView wishlist={wishlist} toggleWishlist={toggleWishlist} addToCart={addToCart} />}
                {subTab === 'cart' && <CartView cart={cart} removeFromCart={removeFromCart} updateQuantity={updateQuantity} checkoutCart={checkoutCart} setActiveTab={setActiveTab} />}
            </div>
        </div>
    );
};
