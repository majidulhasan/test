import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { Transaction } from '../types';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (tx: Transaction) => void;
  editTransaction?: Transaction | null;
}

export default function AddTransactionModal({ isOpen, onClose, onAdd, editTransaction }: AddTransactionModalProps) {
  const [type, setType] = React.useState<'Income' | 'Expense'>(editTransaction?.type || 'Income');
  const [newTx, setNewTx] = React.useState<Partial<Transaction>>(editTransaction || {
    type: 'Income',
    date: new Date().toISOString().split('T')[0],
    category: 'General'
  });

  React.useEffect(() => {
    if (editTransaction) {
      setType(editTransaction.type);
      setNewTx(editTransaction);
    } else {
      setType('Income');
      setNewTx({
        type: 'Income',
        date: new Date().toISOString().split('T')[0],
        category: 'General'
      });
    }
  }, [editTransaction]);

  const handleAddTx = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTx.amount || !newTx.category) return;

    const tx: Transaction = {
      id: editTransaction?.id || Date.now().toString(),
      type: type,
      amount: Number(newTx.amount),
      date: newTx.date || '',
      category: newTx.category || '',
      note: newTx.note || ''
    };

    onAdd(tx);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            className="bg-white w-full max-w-md rounded-t-[32px] p-8 pb-12 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold">{editTransaction ? 'লেনদেন আপডেট করুন' : 'লেনদেন যোগ করুন'}</h2>
              <button onClick={onClose} className="text-zinc-400">
                <X size={24} />
              </button>
            </div>

            <div className="flex p-1 bg-zinc-100 rounded-2xl mb-8">
              <button 
                onClick={() => setType('Income')}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${type === 'Income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-zinc-400'}`}
              >
                আয়
              </button>
              <button 
                onClick={() => setType('Expense')}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${type === 'Expense' ? 'bg-white text-rose-600 shadow-sm' : 'text-zinc-400'}`}
              >
                ব্যয়
              </button>
            </div>

            <form onSubmit={handleAddTx} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">পরিমাণ</label>
                <input 
                  type="number" 
                  required
                  value={newTx.amount || ''}
                  onChange={(e) => setNewTx({...newTx, amount: Number(e.target.value)})}
                  placeholder="0.00"
                  className="w-full bg-zinc-50 border-none rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-[#6C3EF4]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">ক্যাটাগরি</label>
                  <input 
                    type="text" 
                    required
                    value={newTx.category || ''}
                    onChange={(e) => setNewTx({...newTx, category: e.target.value})}
                    placeholder="যেমন: ভাড়া, বেতন"
                    className="w-full bg-zinc-50 border-none rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-[#6C3EF4]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">তারিখ</label>
                  <input 
                    type="date" 
                    required
                    value={newTx.date || ''}
                    onChange={(e) => setNewTx({...newTx, date: e.target.value})}
                    className="w-full bg-zinc-50 border-none rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-[#6C3EF4]"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">নোট (ঐচ্ছিক)</label>
                <input 
                  type="text" 
                  value={newTx.note || ''}
                  onChange={(e) => setNewTx({...newTx, note: e.target.value})}
                  placeholder="নোট লিখুন..."
                  className="w-full bg-zinc-50 border-none rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-[#6C3EF4]"
                />
              </div>

              <button 
                type="submit"
                className={`w-full py-5 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-100 text-white ${
                  type === 'Income' ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
              >
                সেভ করুন
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
