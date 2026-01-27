
import React from 'react';
import { Mail, Facebook, Send } from 'lucide-react';

export const DeveloperModal = ({ t, onClose }: any) => {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-md p-6 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-gray-800 p-10 rounded-[3rem] text-center space-y-8 w-full max-w-xs shadow-2xl animate-in zoom-in-95">
        <div className="w-32 h-32 bg-indigo-50 dark:bg-indigo-900/20 rounded-full mx-auto flex items-center justify-center p-1 border-4 border-white dark:border-gray-700 shadow-xl">
          <img src="https://api.dicebear.com/7.x/initials/svg?seed=MHShahid&backgroundColor=4f46e5" alt="Dev" className="rounded-full w-full h-full object-cover" />
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white">{t('devName')}</h2>
          <p className="text-[10px] font-black uppercase tracking-widest opacity-50">Web & App Developer</p>
        </div>
        <div className="flex justify-center gap-6">
          <a href="mailto:shahin@example.com" className="p-3 bg-gray-50 dark:bg-gray-700 rounded-2xl"><Mail size={22}/></a>
          <a href="https://facebook.com" className="p-3 bg-gray-50 dark:bg-gray-700 rounded-2xl"><Facebook size={22}/></a>
          <a href="https://t.me" className="p-3 bg-gray-50 dark:bg-gray-700 rounded-2xl"><Send size={22}/></a>
        </div>
        <button onClick={onClose} className="w-full py-5 bg-gray-900 dark:bg-gray-100 dark:text-gray-900 text-white font-black rounded-3xl shadow-xl active:scale-95 transition-all">
          {t('close')}
        </button>
      </div>
    </div>
  );
};
