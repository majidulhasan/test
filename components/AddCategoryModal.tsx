
import React, { useState } from 'react';
import { X, Plus, Palette } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, color: string) => void;
  customColors: string[];
  isDarkMode: boolean;
}

const PRESET_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1', '#06b6d4'
];

const AddCategoryModal: React.FC<Props> = ({ isOpen, onClose, onSave, customColors, isDarkMode }) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
      <div className={`w-full max-w-sm p-8 rounded-[2.5rem] shadow-2xl animate-modalIn border relative ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-100 text-gray-900'}`}>
        <button onClick={onClose} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-red-500 transition-all active:scale-90"><X size={24} /></button>
        
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl shadow-emerald-500/10">
            <Plus size={40} />
          </div>
          <h2 className="text-2xl font-black">নতুন ক্যাটাগরি</h2>
          <p className="text-sm opacity-60">একটি সুন্দর নাম ও রঙ বেছে নিন</p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); if(name.trim()) onSave(name, color); setName(''); }} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-blue-600 ml-1">ক্যাটাগরি নাম</label>
            <input
              type="text"
              required
              autoFocus
              className={`w-full p-4 rounded-2xl border-2 outline-none focus:border-blue-500 transition-all font-bold ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-100'}`}
              placeholder="যেমন: Personal, Bank"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-blue-600 ml-1 flex items-center gap-1 justify-center"><Palette size={12} /> রঙ নির্বাচন করুন</label>
            <div className="flex flex-wrap gap-2 justify-center max-h-[100px] overflow-y-auto no-scrollbar py-1">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-9 h-9 rounded-xl border-4 transition-all shadow-md active:scale-90 ${color === c ? 'border-white dark:border-gray-600 scale-110 shadow-lg' : 'border-transparent opacity-60'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
              {customColors.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-9 h-9 rounded-xl border-4 transition-all shadow-md active:scale-90 ${color === c ? 'border-white dark:border-gray-600 scale-110 shadow-lg' : 'border-transparent opacity-60'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-4"
          >
            তৈরি করুন
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddCategoryModal;
