import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Wallet, Calendar, Trash2 } from 'lucide-react';
import { Order, Payment, Transaction } from '../types';

interface PaymentTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  onUpdateOrder: (updatedOrder: Order) => void;
  onAddTransaction?: (tx: Transaction) => void;
}

export default function PaymentTrackerModal({ isOpen, onClose, order, onUpdateOrder, onAddTransaction }: PaymentTrackerModalProps) {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const paymentAmount = Number(amount);
    if (!paymentAmount || paymentAmount <= 0) return;

    const newPayment: Payment = {
      id: Date.now().toString(),
      amount: paymentAmount,
      date: date,
      note: note
    };

    const updatedPayments = [...(order.payments || []), newPayment];
    const totalPaid = order.advance + paymentAmount;
    const updatedOrder: Order = {
      ...order,
      advance: totalPaid,
      due: order.price - totalPaid,
      payments: updatedPayments
    };

    onUpdateOrder(updatedOrder);

    // Add transaction
    if (onAddTransaction) {
      onAddTransaction({
        id: Date.now().toString() + '-payment',
        type: 'Income',
        date: date,
        amount: paymentAmount,
        category: 'অর্ডার পেমেন্ট',
        note: `${order.customerName} - ${order.dressType} (কিস্তি: ${note || 'বাকি পরিশোধ'})`
      });
    }

    setAmount('');
    setNote('');
  };

  const handleDeletePayment = (paymentId: string) => {
    const paymentToDelete = order.payments?.find(p => p.id === paymentId);
    if (!paymentToDelete) return;

    const updatedPayments = order.payments?.filter(p => p.id !== paymentId) || [];
    const totalPaid = order.advance - paymentToDelete.amount;
    const updatedOrder: Order = {
      ...order,
      advance: totalPaid,
      due: order.price - totalPaid,
      payments: updatedPayments
    };

    onUpdateOrder(updatedOrder);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            className="bg-white w-full max-w-md rounded-[32px] p-8 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold">পেমেন্ট ট্রেকার</h2>
                <p className="text-xs text-zinc-400 mt-1">{order.customerName} - {order.dressType}</p>
              </div>
              <button onClick={onClose} className="text-zinc-400">
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-zinc-50 p-4 rounded-2xl">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">মোট মূল্য</p>
                <p className="text-lg font-bold text-zinc-900">৳{order.price}</p>
              </div>
              <div className="bg-rose-50 p-4 rounded-2xl">
                <p className="text-[10px] font-bold text-rose-400 uppercase tracking-wider mb-1">বাকি টাকা</p>
                <p className="text-lg font-bold text-rose-600">৳{order.due}</p>
              </div>
            </div>

            <form onSubmit={handleAddPayment} className="space-y-4 mb-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">পরিমাণ</label>
                  <input 
                    type="number" 
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-zinc-50 border-none rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#6C3EF4]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">তারিখ</label>
                  <input 
                    type="date" 
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-zinc-50 border-none rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#6C3EF4]"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">নোট (ঐচ্ছিক)</label>
                <input 
                  type="text" 
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="পেমেন্ট নোট..."
                  className="w-full bg-zinc-50 border-none rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#6C3EF4]"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-[#6C3EF4] text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 active:scale-95 transition-transform"
              >
                পেমেন্ট যোগ করুন
              </button>
            </form>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">পেমেন্ট হিস্ট্রি</h3>
              {(order.payments || []).length === 0 ? (
                <div className="text-center py-8 bg-zinc-50 rounded-2xl border-2 border-dashed border-zinc-100">
                  <p className="text-xs text-zinc-400">এখনো কোনো অতিরিক্ত পেমেন্ট নেই</p>
                </div>
              ) : (
                order.payments?.map((payment) => (
                  <div key={payment.id} className="bg-white p-4 rounded-2xl border border-zinc-100 flex items-center justify-between group">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                        <Wallet size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-900">৳{payment.amount}</p>
                        <p className="text-[10px] text-zinc-400 flex items-center">
                          <Calendar size={10} className="mr-1" />
                          {payment.date} {payment.note && `• ${payment.note}`}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeletePayment(payment.id)}
                      className="p-2 text-zinc-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
