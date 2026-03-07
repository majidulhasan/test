import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, TrendingDown, Wallet, Calendar, Trash2, BarChart3, MoreVertical, Edit2 } from 'lucide-react';
import { Transaction } from '../types';
import ConfirmModal from './ConfirmModal';

interface AccountingProps {
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  onEdit: (tx: Transaction) => void;
}

export default function Accounting({ transactions, setTransactions, onEdit }: AccountingProps) {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const totalIncome = transactions.filter(t => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0);
  const netProfit = totalIncome - totalExpense;

  const deleteTx = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  // Simple Chart Data (Last 6 months)
  const months = ['জানু', 'ফেব্রু', 'মার্চ', 'এপ্রিল', 'মে', 'জুন'];
  const chartData = months.map(m => ({
    month: m,
    income: Math.floor(Math.random() * 5000) + 2000,
    expense: Math.floor(Math.random() * 2000) + 500
  }));

  const [reportType, setReportType] = useState<'monthly' | 'yearly'>('monthly');
  const [currentDate, setCurrentDate] = useState(new Date());

  const getFilteredTransactions = () => {
    return transactions.filter(t => {
      const tDate = new Date(t.date);
      if (reportType === 'monthly') {
        return tDate.getMonth() === currentDate.getMonth() && tDate.getFullYear() === currentDate.getFullYear();
      } else {
        return tDate.getFullYear() === currentDate.getFullYear();
      }
    });
  };

  const filteredTransactions = getFilteredTransactions();
  const reportIncome = filteredTransactions.filter(t => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0);
  const reportExpense = filteredTransactions.filter(t => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0);
  const reportProfit = reportIncome - reportExpense;

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Date,Type,Category,Amount,Note\n"
      + filteredTransactions.map(t => `${t.date},${t.type},${t.category},${t.amount},${t.note}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `report_${reportType}_${currentDate.toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const navigatePeriod = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (reportType === 'monthly') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    } else {
      newDate.setFullYear(newDate.getFullYear() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  return (
    <div className="px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">হিসাব-নিকাশ</h1>
        <div className="flex space-x-2">
          <button 
            onClick={handleExport}
            className="w-10 h-10 rounded-xl bg-white border border-zinc-100 flex items-center justify-center text-zinc-400 shadow-sm"
          >
            <BarChart3 size={20} />
          </button>
        </div>
      </div>

      {/* Report Controls */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-100 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex bg-zinc-100 rounded-xl p-1">
            <button 
              onClick={() => setReportType('monthly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${reportType === 'monthly' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-400'}`}
            >
              মাসিক
            </button>
            <button 
              onClick={() => setReportType('yearly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${reportType === 'yearly' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-400'}`}
            >
              বার্ষিক
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={() => navigatePeriod('prev')} className="p-1 hover:bg-zinc-100 rounded-lg">
              <TrendingDown size={16} className="rotate-90" />
            </button>
            <span className="text-sm font-bold min-w-[100px] text-center">
              {reportType === 'monthly' 
                ? currentDate.toLocaleDateString('bn-BD', { month: 'long', year: 'numeric' })
                : currentDate.toLocaleDateString('bn-BD', { year: 'numeric' })
              }
            </span>
            <button onClick={() => navigatePeriod('next')} className="p-1 hover:bg-zinc-100 rounded-lg">
              <TrendingDown size={16} className="-rotate-90" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="bg-emerald-50 p-3 rounded-xl text-center">
            <p className="text-[10px] text-emerald-500 font-bold uppercase">আয়</p>
            <p className="text-sm font-bold text-emerald-700">৳{reportIncome}</p>
          </div>
          <div className="bg-rose-50 p-3 rounded-xl text-center">
            <p className="text-[10px] text-rose-500 font-bold uppercase">ব্যয়</p>
            <p className="text-sm font-bold text-rose-700">৳{reportExpense}</p>
          </div>
          <div className="bg-indigo-50 p-3 rounded-xl text-center">
            <p className="text-[10px] text-indigo-500 font-bold uppercase">লাভ</p>
            <p className="text-sm font-bold text-indigo-700">৳{reportProfit}</p>
          </div>
        </div>
      </div>

      {/* Summary Cards (Overall) */}
      <h3 className="font-bold mb-4 text-sm text-zinc-400 uppercase tracking-wider">সর্বমোট হিসাব</h3>
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-emerald-500 p-5 rounded-[32px] text-white shadow-lg shadow-emerald-100">
          <TrendingUp size={24} className="mb-4 opacity-70" />
          <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">মোট আয়</p>
          <p className="text-xl font-bold">৳{totalIncome}</p>
        </div>
        <div className="bg-rose-500 p-5 rounded-[32px] text-white shadow-lg shadow-rose-100">
          <TrendingDown size={24} className="mb-4 opacity-70" />
          <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">মোট ব্যয়</p>
          <p className="text-xl font-bold">৳{totalExpense}</p>
        </div>
      </div>

      <div className="bg-[#6C3EF4] p-6 rounded-[32px] text-white shadow-xl shadow-indigo-100 mb-8 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">নিট লাভ</p>
          <p className="text-3xl font-bold">৳{netProfit}</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
          <Wallet size={24} />
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white p-6 rounded-[32px] shadow-sm border border-zinc-100 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold flex items-center">
            <BarChart3 size={18} className="mr-2 text-[#6C3EF4]" />
            মাসিক ওভারভিউ
          </h3>
          <div className="flex space-x-3">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 rounded-full bg-[#6C3EF4]" />
              <span className="text-[10px] font-bold text-zinc-400">আয়</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 rounded-full bg-[#FFC130]" />
              <span className="text-[10px] font-bold text-zinc-400">ব্যয়</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-end justify-between h-32 space-x-2">
          {chartData.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center space-y-2">
              <div className="w-full flex items-end justify-center space-x-1 h-full">
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${(d.income / 7000) * 100}%` }}
                  className="w-2 bg-[#6C3EF4] rounded-t-full"
                />
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${(d.expense / 7000) * 100}%` }}
                  className="w-2 bg-[#FFC130] rounded-t-full"
                />
              </div>
              <span className="text-[10px] font-bold text-zinc-400">{d.month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Transactions List */}
      <h3 className="font-bold mb-4">সাম্প্রতিক লেনদেন</h3>
      <div className="space-y-4">
        {transactions.map((tx) => (
          <div key={tx.id} className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-100 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                tx.type === 'Income' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'
              }`}>
                {tx.type === 'Income' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
              </div>
              <div>
                <p className="text-sm font-bold">{tx.category}</p>
                <p className="text-[10px] text-zinc-400">{tx.date} • {tx.note || 'কোনো নোট নেই'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 relative">
              <p className={`font-bold ${tx.type === 'Income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                {tx.type === 'Income' ? '+' : '-'}৳{tx.amount}
              </p>
              <div className="relative">
                <button 
                  onClick={() => setActiveMenuId(activeMenuId === tx.id ? null : tx.id)}
                  className="p-1 text-zinc-300 hover:text-zinc-600 transition-colors"
                >
                  <MoreVertical size={18} />
                </button>

                <AnimatePresence>
                  {activeMenuId === tx.id && (
                    <>
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setActiveMenuId(null)}
                      />
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="absolute right-0 top-full mt-2 w-32 bg-white rounded-xl shadow-xl border border-zinc-100 z-20 overflow-hidden"
                      >
                        <button
                          onClick={() => {
                            onEdit(tx);
                            setActiveMenuId(null);
                          }}
                          className="w-full flex items-center space-x-2 px-4 py-3 text-xs font-bold text-indigo-600 hover:bg-indigo-50 transition-colors"
                        >
                          <Edit2 size={14} />
                          <span>এডিট</span>
                        </button>
                        <button
                          onClick={() => {
                            setConfirmDeleteId(tx.id);
                            setActiveMenuId(null);
                          }}
                          className="w-full flex items-center space-x-2 px-4 py-3 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors border-t border-zinc-50"
                        >
                          <Trash2 size={14} />
                          <span>ডিলিট</span>
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        ))}
        {transactions.length === 0 && (
          <div className="text-center py-8">
            <p className="text-zinc-400">এখনো কোনো লেনদেন নেই</p>
          </div>
        )}
      </div>

      <ConfirmModal 
        isOpen={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={() => {
          if (confirmDeleteId) {
            deleteTx(confirmDeleteId);
            setConfirmDeleteId(null);
          }
        }}
        title="লেনদেন মুছে ফেলুন"
        message="আপনি কি নিশ্চিত যে এই লেনদেনটি মুছে ফেলতে চান? এটি আর ফেরত নেওয়া যাবে না।"
      />
    </div>
  );
}
