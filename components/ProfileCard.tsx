import React from 'react';
import { User as UserIcon, Bell, ArrowRight, Settings, CreditCard, LogOut } from 'lucide-react';
import { User } from '../../types';

interface ProfileTabProps {
  user: User | null;
  onSignOut: () => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({ user, onSignOut }) => (
  <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm animate-fade-in mb-20">
      <div className="flex items-center gap-6 mb-8">
          <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 border-4 border-white dark:border-slate-800 shadow-lg">
              <UserIcon className="w-10 h-10" />
          </div>
          <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{user?.name}</h2>
              <p className="text-slate-500 dark:text-slate-400">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="inline-block px-3 py-0.5 bg-slate-100 dark:bg-slate-800 text-xs font-mono rounded-full text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    ID: {user?.id}
                </span>
                <span className="inline-block px-3 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-xs font-semibold rounded-full text-emerald-600 dark:text-emerald-400">
                    Verified User
                </span>
              </div>
          </div>
      </div>
      
      <div className="space-y-6">
          <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Account Settings</h3>
              <div className="grid gap-3">
                  <button className="text-left w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all flex justify-between items-center group">
                      <div className="flex items-center gap-3">
                        <Bell className="w-5 h-5 text-slate-400 group-hover:text-indigo-500" />
                        <span className="text-slate-700 dark:text-slate-300 font-medium">Notification Preferences</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500" />
                  </button>
                  <button className="text-left w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all flex justify-between items-center group">
                      <div className="flex items-center gap-3">
                        <Settings className="w-5 h-5 text-slate-400 group-hover:text-indigo-500" />
                        <span className="text-slate-700 dark:text-slate-300 font-medium">Privacy & Security</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500" />
                  </button>
                  <button className="text-left w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all flex justify-between items-center group">
                       <div className="flex items-center gap-3">
                        <CreditCard className="w-5 h-5 text-slate-400 group-hover:text-indigo-500" />
                        <span className="text-slate-700 dark:text-slate-300 font-medium">Payment Methods</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500" />
                  </button>
              </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
              <button 
                onClick={onSignOut}
                className="w-full p-4 rounded-xl border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-semibold flex items-center justify-center gap-2"
              >
                  <LogOut className="w-5 h-5" />
                  Sign Out
              </button>
          </div>
      </div>
  </div>
);
