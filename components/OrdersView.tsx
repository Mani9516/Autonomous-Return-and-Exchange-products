import React from 'react';
import { Order, OrderStatus, User } from '../types';
import { generateInvoice } from '../utils/invoiceGenerator';

interface OrdersViewProps {
  orders: Order[];
  user: User | null;
  initiateReturn: (order: Order) => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({ orders, user, initiateReturn }) => (
    <div className="space-y-6 pb-20">
      {orders.length === 0 ? (
          <div className="text-center py-10 text-slate-500">No orders found. Browse the catalog to create one.</div>
      ) : (
          orders.slice().reverse().map(order => (
            <div key={order.orderId} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 flex flex-wrap justify-between items-center gap-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex gap-6 text-sm">
                  <div>
                    <span className="block text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide">Order Placed</span>
                    <span className="font-medium">{order.date}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide">Total Items</span>
                    <span className="font-medium">{order.items.length}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide">Order #</span>
                    <span className="font-medium">{order.orderId}</span>
                  </div>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => user && generateInvoice(order, user)}
                        className="text-blue-600 dark:text-blue-400 text-sm hover:underline font-medium"
                    >
                        Download Invoice
                    </button>
                    {(order.status === OrderStatus.DELIVERED || order.status === OrderStatus.RETURN_INITIATED) && (
                        <button 
                            onClick={() => initiateReturn(order)}
                            className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
                        >
                            Return / Exchange
                        </button>
                    )}
                </div>
              </div>
              <div className="p-4 space-y-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-center">
                    <div className="w-16 h-16 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-white">{item.name}</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Qty: 1 • {item.price.toFixed(2)} USD</p>
                    </div>
                  </div>
                ))}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        order.status === OrderStatus.DELIVERED ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                        order.status === OrderStatus.RETURN_INITIATED ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                        {order.status}
                    </span>
                </div>
              </div>
            </div>
          ))
      )}
    </div>
);