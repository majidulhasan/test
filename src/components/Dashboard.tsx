import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Package, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  TrendingDown,
  Bell,
  Camera,
  X,
  Edit2
} from 'lucide-react';
import { Customer, Order, Transaction, AppSettings } from '../types';

interface DashboardProps {
  customers: Customer[];
  orders: Order[];
  transactions: Transaction[];
  onNavigate: (screen: any) => void;
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
}

export default function Dashboard({ customers, orders, transactions, onNavigate, settings, setSettings }: DashboardProps) {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pendingOrders = orders.filter(o => o.status === 'Pending').length;
  const readyOrders = orders.filter(o => o.status === 'Ready').length;
  
  const today = new Date().toISOString().split('T')[0];
  const todayIncome = transactions
    .filter(t => t.type === 'Income' && t.date === today)
    .reduce((sum, t) => sum + t.amount, 0);
  const todayExpense = transactions
    .filter(t => t.type === 'Expense' && t.date === today)
    .reduce((sum, t) => sum + t.amount, 0);

  const stats = [
    { label: 'মোট কাস্টমার', value: customers.length, icon: <Users size={20} />, color: 'bg-blue-500' },
    { label: 'মোট অর্ডার', value: orders.length, icon: <Package size={20} />, color: 'bg-indigo-500' },
    { label: 'পেন্ডিং অর্ডার', value: pendingOrders, icon: <Clock size={20} />, color: 'bg-orange-500' },
    { label: 'রেডি অর্ডার', value: readyOrders, icon: <CheckCircle2 size={20} />, color: 'bg-green-500' },
    { label: 'আজকের আয়', value: `৳${todayIncome}`, icon: <TrendingUp size={20} />, color: 'bg-emerald-500' },
    { label: 'আজকের ব্যয়', value: `৳${todayExpense}`, icon: <TrendingDown size={20} />, color: 'bg-rose-500' },
  ];

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings({ ...settings, ownerPhoto: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div 
          className="flex items-center space-x-3 cursor-pointer group"
          onClick={() => setIsEditingProfile(true)}
        >
          <div className="relative w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-[#6C3EF4] overflow-hidden">
            {settings.ownerPhoto ? (
              <img src={settings.ownerPhoto} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <Users size={24} />
            )}
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Edit2 size={16} className="text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold flex items-center">
              {settings.shopName || 'টেইলর শপ'}
            </h1>
            <p className="text-xs text-zinc-500">Created by M H {'{'}Shahin{'}'}</p>
          </div>
        </div>
        <button className="w-10 h-10 rounded-xl bg-white shadow-sm border border-zinc-100 flex items-center justify-center text-zinc-400">
          <Bell size={20} />
        </button>
      </div>

      <AnimatePresence>
        {isEditingProfile && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-sm rounded-[32px] p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">প্রোফাইল আপডেট</h3>
                <button onClick={() => setIsEditingProfile(false)} className="text-zinc-400 p-1">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex flex-col items-center">
                  <div 
                    className="relative w-24 h-24 rounded-3xl bg-indigo-50 flex items-center justify-center text-[#6C3EF4] cursor-pointer overflow-hidden border-2 border-dashed border-indigo-200 hover:border-[#6C3EF4] transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {settings.ownerPhoto ? (
                      <img src={settings.ownerPhoto} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <Camera size={32} />
                    )}
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Camera size={24} className="text-white" />
                    </div>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handlePhotoUpload} 
                    accept="image/*" 
                    className="hidden" 
                  />
                  <p className="text-[10px] text-zinc-400 mt-2">ছবি পরিবর্তন করতে ক্লিক করুন</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">দোকানের নাম</label>
                    <input 
                      type="text" 
                      value={settings.shopName || ''}
                      onChange={(e) => setSettings({ ...settings, shopName: e.target.value })}
                      placeholder="টেইলর শপ"
                      className="w-full bg-zinc-50 border-none rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#6C3EF4]"
                    />
                  </div>
                </div>

                <button 
                  onClick={() => setIsEditingProfile(false)}
                  className="w-full py-4 rounded-2xl text-sm font-bold text-white bg-[#6C3EF4] shadow-lg shadow-indigo-100 active:scale-95 transition-transform"
                >
                  সেভ করুন
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-4 rounded-3xl shadow-sm border border-zinc-100 flex flex-col space-y-3"
          >
            <div className={`w-10 h-10 rounded-2xl ${stat.color} bg-opacity-10 flex items-center justify-center`} style={{ color: stat.color.replace('bg-', 'text-') }}>
              {stat.icon}
            </div>
            <div>
              <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">{stat.label}</p>
              <p className="text-lg font-bold text-zinc-900">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">সাম্প্রতিক অর্ডার</h2>
        <button onClick={() => onNavigate('orders')} className="text-xs font-bold text-[#6C3EF4]">সব দেখুন</button>
      </div>
      
      <div className="space-y-4">
        {orders.slice(0, 5).map((order) => (
          <div key={order.id} className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-100 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-400">
                <Package size={20} />
              </div>
              <div>
                <p className="text-sm font-bold">{order.customerName}</p>
                <p className="text-[10px] text-zinc-400">{order.dressType} • {order.deliveryDate}</p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
              order.status === 'Pending' ? 'bg-orange-100 text-orange-600' :
              order.status === 'Processing' ? 'bg-blue-100 text-blue-600' :
              order.status === 'Ready' ? 'bg-green-100 text-green-600' :
              'bg-zinc-100 text-zinc-600'
            }`}>
              {order.status === 'Pending' ? 'পেন্ডিং' :
               order.status === 'Processing' ? 'প্রসেসিং' :
               order.status === 'Ready' ? 'রেডি' : 'ডেলিভারি'}
            </span>
          </div>
        ))}
        {orders.length === 0 && (
          <div className="text-center py-8 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
            <p className="text-sm text-zinc-400">এখনো কোনো অর্ডার নেই</p>
          </div>
        )}
      </div>
    </div>
  );
}
