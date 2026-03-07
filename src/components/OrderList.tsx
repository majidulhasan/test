import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Search, Package, Calendar, Clock, CheckCircle2, X, Trash2, Edit2, Filter, ArrowUp, ArrowDown, Wallet, History } from 'lucide-react';
import { Order, Customer, Measurement, Transaction } from '../types';
import ConfirmModal from './ConfirmModal';
import PaymentTrackerModal from './PaymentTrackerModal';

interface OrderListProps {
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  customers: Customer[];
  measurements: Record<string, Measurement>;
  onAddTransaction?: (tx: Transaction) => void;
}

export default function OrderList({ orders, setOrders, customers, measurements, onAddTransaction }: OrderListProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter States
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState<'date' | 'delivery' | 'name' | 'price'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [newOrder, setNewOrder] = useState<Partial<Order>>({
    dressType: 'Shirt',
    quantity: 1,
    status: 'Pending',
    deliveryDate: new Date().toISOString().split('T')[0]
  });

  const [activeTab, setActiveTab] = useState<'All' | 'Pending' | 'Processing' | 'Ready' | 'Delivered'>('All');

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.dressType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'All' || o.status === activeTab;
    
    // Date Range Filter
    const orderDate = new Date(o.createdAt).toISOString().split('T')[0];
    const matchesDate = (!dateRange.start || orderDate >= dateRange.start) && 
                        (!dateRange.end || orderDate <= dateRange.end);

    // Price Range Filter
    const matchesPrice = (!priceRange.min || o.price >= Number(priceRange.min)) &&
                         (!priceRange.max || o.price <= Number(priceRange.max));

    return matchesSearch && matchesTab && matchesDate && matchesPrice;
  }).sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'date':
        comparison = a.createdAt - b.createdAt;
        break;
      case 'delivery':
        comparison = a.deliveryDate.localeCompare(b.deliveryDate);
        break;
      case 'name':
        comparison = a.customerName.localeCompare(b.customerName);
        break;
      case 'price':
        comparison = a.price - b.price;
        break;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleAddOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrder.customerId || !newOrder.price) return;

    const customer = customers.find(c => c.id === newOrder.customerId);
    const order: Order = {
      id: editingOrder?.id || Date.now().toString(),
      customerId: newOrder.customerId,
      customerName: customer?.name || 'Unknown',
      dressType: newOrder.dressType as any,
      quantity: newOrder.quantity || 1,
      price: Number(newOrder.price),
      advance: Number(newOrder.advance || 0),
      due: Number(newOrder.price) - Number(newOrder.advance || 0),
      deliveryDate: newOrder.deliveryDate || '',
      status: editingOrder?.status || 'Pending',
      createdAt: editingOrder?.createdAt || Date.now(),
      payments: editingOrder?.payments || []
    };

    if (editingOrder) {
      setOrders(orders.map(o => o.id === editingOrder.id ? order : o));
    } else {
      setOrders([order, ...orders]);
      
      // Add transaction for initial advance
      if (order.advance > 0 && onAddTransaction) {
        onAddTransaction({
          id: Date.now().toString(),
          type: 'Income',
          date: new Date().toISOString().split('T')[0],
          amount: order.advance,
          category: 'অর্ডার পেমেন্ট',
          note: `${order.customerName} - ${order.dressType} (অগ্রিম)`
        });
      }
    }
    
    setIsAdding(false);
    setEditingOrder(null);
    setNewOrder({
      dressType: 'Shirt',
      quantity: 1,
      status: 'Pending',
      deliveryDate: new Date().toISOString().split('T')[0]
    });
  };

  const deleteOrder = (id: string) => {
    setOrders(orders.filter(o => o.id !== id));
  };

  const updateStatus = (id: string, status: Order['status']) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
  };

  return (
    <div className="px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">অর্ডার তালিকা</h1>
      </div>

      {/* Search and Filter */}
      <div className="flex space-x-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <input 
            type="text" 
            placeholder="অর্ডার খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-zinc-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#6C3EF4] focus:ring-opacity-20 shadow-sm"
          />
        </div>
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className={`w-14 rounded-2xl flex items-center justify-center border transition-all ${showFilters ? 'bg-[#6C3EF4] text-white border-[#6C3EF4]' : 'bg-white text-zinc-400 border-zinc-100'}`}
        >
          <Filter size={20} />
        </button>
      </div>

      {/* Advanced Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-6"
          >
            <div className="bg-white p-5 rounded-3xl border border-zinc-100 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">তারিখ থেকে</label>
                  <input 
                    type="date" 
                    value={dateRange.start}
                    onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                    className="w-full bg-zinc-50 border-none rounded-xl py-2 px-3 text-xs"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">তারিখ পর্যন্ত</label>
                  <input 
                    type="date" 
                    value={dateRange.end}
                    onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                    className="w-full bg-zinc-50 border-none rounded-xl py-2 px-3 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">সর্বনিম্ন মূল্য</label>
                  <input 
                    type="number" 
                    placeholder="0"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({...priceRange, min: e.target.value})}
                    className="w-full bg-zinc-50 border-none rounded-xl py-2 px-3 text-xs"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">সর্বোচ্চ মূল্য</label>
                  <input 
                    type="number" 
                    placeholder="∞"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
                    className="w-full bg-zinc-50 border-none rounded-xl py-2 px-3 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-zinc-50">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">সাজান:</span>
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-zinc-50 border-none rounded-lg py-1 px-2 text-xs font-bold text-zinc-600"
                  >
                    <option value="date">তারিখ</option>
                    <option value="delivery">ডেলিভারি</option>
                    <option value="name">নাম</option>
                    <option value="price">মূল্য</option>
                  </select>
                </div>
                <button 
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="p-2 bg-zinc-50 rounded-lg text-zinc-500 hover:bg-zinc-100"
                >
                  {sortOrder === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Tabs */}
      <div className="flex space-x-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {['All', 'Pending', 'Processing', 'Ready', 'Delivered'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === tab 
                ? 'bg-[#6C3EF4] text-white shadow-lg shadow-indigo-100' 
                : 'bg-white text-zinc-500 border border-zinc-100'
            }`}
          >
            {tab === 'All' ? 'সব' : 
             tab === 'Pending' ? 'পেন্ডিং' : 
             tab === 'Processing' ? 'প্রসেসিং' : 
             tab === 'Ready' ? 'রেডি' : 'ডেলিভারি'}
          </button>
        ))}
      </div>

      {/* Order List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <motion.div
            layout
            key={order.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-5 rounded-3xl shadow-sm border border-zinc-100"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-[#6C3EF4]">
                  <Package size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900">{order.customerName}</h3>
                  <p className="text-xs text-zinc-400">{order.dressType} • পরিমাণ: {order.quantity}</p>
                  <p className="text-[10px] text-zinc-400 mt-1 flex items-center">
                    <Clock size={10} className="mr-1" />
                    অর্ডার তারিখ: {formatDate(order.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setTrackingOrder(order)}
                  className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center hover:bg-emerald-100 transition-colors"
                  title="পেমেন্ট হিস্ট্রি"
                >
                  <Wallet size={18} />
                </button>
                <button 
                  onClick={() => {
                    setEditingOrder(order);
                    setNewOrder({
                      customerId: order.customerId,
                      dressType: order.dressType,
                      quantity: order.quantity,
                      price: order.price,
                      advance: order.advance,
                      deliveryDate: order.deliveryDate,
                      status: order.status
                    });
                    setIsAdding(true);
                  }} 
                  className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center hover:bg-indigo-100 transition-colors"
                  title="এডিট"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={() => setConfirmDeleteId(order.id)} 
                  className="w-9 h-9 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-100 transition-colors"
                  title="ডিলিট"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-zinc-50 p-2 rounded-xl text-center">
                  <p className="text-[8px] text-zinc-400 uppercase font-bold">মোট</p>
                  <p className="text-xs font-bold">৳{order.price}</p>
                </div>
                <div className="bg-emerald-50 p-2 rounded-xl text-center">
                  <p className="text-[8px] text-emerald-400 uppercase font-bold">পরিশোধ</p>
                  <p className="text-xs font-bold text-emerald-600">৳{order.advance}</p>
                </div>
                <div className="bg-rose-50 p-2 rounded-xl text-center">
                  <p className="text-[8px] text-rose-400 uppercase font-bold">বাকি</p>
                  <p className="text-xs font-bold text-rose-600">৳{order.due}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-zinc-50">
                <div className="flex items-center text-zinc-400 text-[10px] font-bold">
                  <Calendar size={12} className="mr-1" />
                  <span>ডেলিভারি: {order.deliveryDate}</span>
                </div>
                <select 
                  value={order.status}
                  onChange={(e) => updateStatus(order.id, e.target.value as any)}
                  className={`text-[10px] font-bold px-3 py-1.5 rounded-full border-none focus:ring-0 ${
                    order.status === 'Pending' ? 'bg-orange-100 text-orange-600' :
                    order.status === 'Processing' ? 'bg-blue-100 text-blue-600' :
                    order.status === 'Ready' ? 'bg-green-100 text-green-600' :
                    'bg-zinc-100 text-zinc-600'
                  }`}
                >
                  <option value="Pending">পেন্ডিং</option>
                  <option value="Processing">প্রসেসিং</option>
                  <option value="Ready">রেডি</option>
                  <option value="Delivered">ডেলিভারি করা হয়েছে</option>
                </select>
              </div>
          </motion.div>
        ))}
        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-zinc-400">কোনো অর্ডার পাওয়া যায়নি</p>
          </div>
        )}
      </div>

      {/* Add Order FAB */}
      <button 
        onClick={() => setIsAdding(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-[#6C3EF4] text-white rounded-full shadow-lg shadow-indigo-200 flex items-center justify-center hover:bg-indigo-600 transition-colors z-40"
      >
        <Plus size={24} />
      </button>

      {/* Add Order Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="bg-white w-full max-w-md rounded-t-[32px] p-8 pb-12 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold">{editingOrder ? 'অর্ডার আপডেট করুন' : 'নতুন অর্ডার তৈরি করুন'}</h2>
                <button 
                  onClick={() => {
                    setIsAdding(false);
                    setEditingOrder(null);
                  }} 
                  className="text-zinc-400"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleAddOrder} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">কাস্টমার</label>
                  <select 
                    required
                    value={newOrder.customerId}
                    onChange={(e) => {
                      const customerId = e.target.value;
                      const customerCategories = measurements[customerId]?.categories || [];
                      setNewOrder({
                        ...newOrder, 
                        customerId,
                        dressType: customerCategories.length > 0 ? customerCategories[0].name : 'Shirt'
                      });
                    }}
                    className="w-full bg-zinc-50 border-none rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-[#6C3EF4]"
                  >
                    <option value="">কাস্টমার নির্বাচন করুন</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">পোশাকের ধরন</label>
                    <div className="space-y-2">
                        <select 
                          value={
                            newOrder.customerId && measurements[newOrder.customerId]?.categories.length > 0
                              ? (measurements[newOrder.customerId].categories.some(c => c.name === newOrder.dressType) ? newOrder.dressType : 'Other')
                              : (['Shirt', 'Pant', 'Panjabi', 'Pajama', 'Jubba', 'Suit', 'Salwar Kameez', 'Blouse', 'Petticoat', 'Maxi', 'Borka', 'Frock'].includes(newOrder.dressType || '') ? newOrder.dressType : 'Other')
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val !== 'Other') {
                              setNewOrder({...newOrder, dressType: val});
                            } else {
                              setNewOrder({...newOrder, dressType: ''});
                            }
                          }}
                          className="w-full bg-zinc-50 border-none rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-[#6C3EF4]"
                        >
                          {newOrder.customerId && measurements[newOrder.customerId]?.categories.length > 0 ? (
                            <>
                              {measurements[newOrder.customerId].categories.map(cat => (
                                <option key={cat.name} value={cat.name}>{cat.name}</option>
                              ))}
                              <option value="Other">অন্যান্য (কাস্টম)</option>
                            </>
                          ) : (
                            <>
                              <option value="Panjabi">পাঞ্জাবি</option>
                              <option value="Pajama">পাজামা</option>
                              <option value="Jubba">জুব্বা</option>
                              <option value="Shirt">শার্ট</option>
                              <option value="Pant">প্যান্ট</option>
                              <option value="Suit">স্যুট</option>
                              <option value="Salwar Kameez">সালোয়ার কামিজ</option>
                              <option value="Blouse">ব্লাউজ</option>
                              <option value="Petticoat">পেটিকোট</option>
                              <option value="Maxi">মেক্সি</option>
                              <option value="Borka">বোরকা</option>
                              <option value="Frock">ফ্রক</option>
                              <option value="Other">অন্যান্য (কাস্টম)</option>
                            </>
                          )}
                        </select>
                        {(newOrder.customerId && measurements[newOrder.customerId]?.categories.length > 0 
                          ? !measurements[newOrder.customerId].categories.some(c => c.name === newOrder.dressType)
                          : !['Shirt', 'Pant', 'Panjabi', 'Pajama', 'Jubba', 'Suit', 'Salwar Kameez', 'Blouse', 'Petticoat', 'Maxi', 'Borka', 'Frock'].includes(newOrder.dressType || '')
                        ) && (
                          <input 
                            type="text"
                            placeholder="পোশাকের নাম লিখুন (যেমন: শেরওয়ানি)"
                            value={newOrder.dressType}
                            onChange={(e) => setNewOrder({...newOrder, dressType: e.target.value})}
                            className="w-full bg-zinc-50 border-none rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-[#6C3EF4]"
                          />
                        )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">পরিমাণ</label>
                    <input 
                      type="number" 
                      min="1"
                      value={newOrder.quantity}
                      onChange={(e) => setNewOrder({...newOrder, quantity: Number(e.target.value)})}
                      className="w-full bg-zinc-50 border-none rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-[#6C3EF4]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">মোট মূল্য</label>
                    <input 
                      type="number" 
                      required
                      value={newOrder.price}
                      onChange={(e) => setNewOrder({...newOrder, price: Number(e.target.value)})}
                      placeholder="0.00"
                      className="w-full bg-zinc-50 border-none rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-[#6C3EF4]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">অগ্রিম প্রদান</label>
                    <input 
                      type="number" 
                      value={newOrder.advance}
                      onChange={(e) => setNewOrder({...newOrder, advance: Number(e.target.value)})}
                      placeholder="0.00"
                      className="w-full bg-zinc-50 border-none rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-[#6C3EF4]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">ডেলিভারি তারিখ</label>
                  <input 
                    type="date" 
                    required
                    value={newOrder.deliveryDate}
                    onChange={(e) => setNewOrder({...newOrder, deliveryDate: e.target.value})}
                    className="w-full bg-zinc-50 border-none rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-[#6C3EF4]"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-[#6C3EF4] text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-100"
                >
                  অর্ডার তৈরি করুন
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmModal 
        isOpen={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={() => {
          if (confirmDeleteId) {
            deleteOrder(confirmDeleteId);
            setConfirmDeleteId(null);
          }
        }}
        title="অর্ডার মুছে ফেলুন"
        message="আপনি কি নিশ্চিত যে এই অর্ডারটি মুছে ফেলতে চান? এটি আর ফেরত নেওয়া যাবে না।"
      />

      {trackingOrder && (
        <PaymentTrackerModal 
          isOpen={!!trackingOrder}
          onClose={() => setTrackingOrder(null)}
          order={trackingOrder}
          onUpdateOrder={(updatedOrder) => {
            setOrders(orders.map(o => o.id === updatedOrder.id ? updatedOrder : o));
            setTrackingOrder(updatedOrder);
          }}
          onAddTransaction={onAddTransaction}
        />
      )}
    </div>
  );
}
