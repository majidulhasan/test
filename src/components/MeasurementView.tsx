import React from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Printer, 
  Scissors, 
  Calendar, 
  User, 
  Phone, 
  MapPin,
  Download,
  Share2,
  Edit2,
  Package,
  Wallet,
  Plus
} from 'lucide-react';
import { Customer, Measurement, Order } from '../types';

interface MeasurementViewProps {
  customer: Customer;
  measurement: Measurement;
  orders?: Order[];
  onBack: () => void;
  onEdit?: () => void;
}

export default function MeasurementView({ customer, measurement, orders = [], onBack, onEdit }: MeasurementViewProps) {
  const handlePrint = () => {
    window.print();
  };

  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, o) => sum + o.price, 0);
  const lastOrderDate = orders.length > 0 
    ? new Date(Math.max(...orders.map(o => o.createdAt))).toLocaleDateString('bn-BD')
    : 'N/A';

  return (
    <div className="px-6 py-8 max-w-2xl mx-auto print:p-0 print:max-w-none">
      <div className="flex items-center justify-between mb-8 print:hidden">
        <button onClick={onBack} className="w-10 h-10 rounded-xl bg-white border border-zinc-100 flex items-center justify-center text-zinc-400 shadow-sm">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold">প্রোফাইল ও মাপ</h1>
        <div className="flex space-x-2">
          <button onClick={() => onEdit?.()} className="w-10 h-10 rounded-xl bg-white border border-zinc-100 flex items-center justify-center text-zinc-400 shadow-sm">
            <Edit2 size={20} />
          </button>
          <button onClick={handlePrint} className="w-10 h-10 rounded-xl bg-white border border-zinc-100 flex items-center justify-center text-zinc-400 shadow-sm">
            <Printer size={20} />
          </button>
        </div>
      </div>

      {/* Header Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[32px] p-8 shadow-sm border border-zinc-100 mb-6 overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full opacity-50 -mr-8 -mt-8" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-2xl bg-[#6C3EF4] flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-indigo-100">
                {customer.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-zinc-900">{customer.name}</h2>
                <div className="flex items-center text-zinc-400 text-sm mt-1">
                  <Phone size={14} className="mr-1" />
                  <span>{customer.phone}</span>
                </div>
                {customer.address && (
                  <div className="flex items-center text-zinc-400 text-sm mt-1">
                    <MapPin size={14} className="mr-1" />
                    <span>{customer.address}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-zinc-50">
            <div className="text-center">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">মোট অর্ডার</p>
              <p className="text-lg font-bold text-zinc-900">{totalOrders}</p>
            </div>
            <div className="text-center border-l border-zinc-100">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">মোট খরচ</p>
              <p className="text-lg font-bold text-zinc-900">৳{totalSpent}</p>
            </div>
            <div className="text-center border-l border-zinc-100">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">শেষ অর্ডার</p>
              <p className="text-xs font-bold text-zinc-900 mt-1">{lastOrderDate}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Measurement Categories */}
      <div className="space-y-6">
        {measurement.categories.map((category, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-[32px] p-8 shadow-sm border border-zinc-100"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-[#6C3EF4]">
                <Scissors size={20} />
              </div>
              <h3 className="text-lg font-bold text-zinc-900">{category.name}</h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {category.fields.map((field, fIndex) => (
                <div key={fIndex} className="bg-zinc-50 rounded-2xl p-4 border border-zinc-100/50">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">{field.label}</p>
                  <p className="text-xl font-bold text-zinc-900">{field.value || '—'}</p>
                </div>
              ))}
            </div>

            {category.notes && (
              <div className="mt-6 bg-amber-50 rounded-2xl p-6 border border-amber-100">
                <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-2 flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-2" />
                  বিশেষ নির্দেশাবলী ({category.name})
                </h4>
                <p className="text-amber-800 text-sm leading-relaxed italic">
                  "{category.notes}"
                </p>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Global Notes (Legacy Support) */}
      {measurement.notes && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: measurement.categories.length * 0.1 }}
          className="mt-6 bg-amber-50 rounded-[32px] p-8 border border-amber-100"
        >
          <h3 className="text-sm font-bold text-amber-900 uppercase tracking-wider mb-3 flex items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-2" />
            সাধারণ নির্দেশাবলী
          </h3>
          <p className="text-amber-800 text-sm leading-relaxed italic">
            "{measurement.notes}"
          </p>
        </motion.div>
      )}

      {/* Footer for Printing */}
      <div className="hidden print:block mt-12 pt-8 border-t border-zinc-200 text-center">
        <p className="text-sm font-bold text-zinc-900">টেইলর শপ ম্যানেজমেন্ট</p>
        <p className="text-xs text-zinc-400 mt-1">আমাদের বেছে নেওয়ার জন্য ধন্যবাদ!</p>
      </div>

      <div className="mt-12 mb-8 text-center print:hidden">
        <button 
          onClick={onBack}
          className="text-zinc-400 font-bold text-sm hover:text-[#6C3EF4] transition-colors"
        >
          প্রোফাইলে ফিরে যান
        </button>
      </div>
    </div>
  );
}
