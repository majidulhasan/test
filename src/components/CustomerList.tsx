import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Plus, User, Phone, ChevronRight, X, Calendar, Hash, Trash2, Edit3, MoreVertical, List, Layers } from 'lucide-react';
import { Customer } from '../types';

interface CustomerListProps {
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  onSelectCustomer: (id: string) => void;
}

export default function CustomerList({ customers, setCustomers, onSelectCustomer }: CustomerListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deletingCustomerId, setDeletingCustomerId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grouped' | 'list'>('grouped');
  const [filterDate, setFilterDate] = useState<string>('');

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.phone.includes(searchTerm) ||
      c.id.includes(searchTerm);
      
    let matchesDate = true;
    if (filterDate) {
      const dateObj = new Date(c.createdAt);
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      
      matchesDate = formattedDate === filterDate;
    }
    
    return matchesSearch && matchesDate;
  });

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeletingCustomerId(id);
  };

  const confirmDelete = () => {
    if (deletingCustomerId) {
      setCustomers(prev => prev.filter(c => c.id !== deletingCustomerId));
      setDeletingCustomerId(null);
    }
  };

  const handleEdit = (e: React.MouseEvent, customer: Customer) => {
    e.stopPropagation();
    setEditingCustomer(customer);
  };

  const groupedCustomers = filteredCustomers.reduce((acc, customer) => {
    const dateStr = formatDate(customer.createdAt);
    if (!acc[dateStr]) {
      acc[dateStr] = [];
    }
    acc[dateStr].push(customer);
    return acc;
  }, {} as Record<string, Customer[]>);

  const sortedDates = Object.keys(groupedCustomers).sort((a, b) => {
    return groupedCustomers[b][0].createdAt - groupedCustomers[a][0].createdAt;
  });

  return (
    <div className="px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">কাস্টমার তালিকা</h1>
        <div className="flex bg-white rounded-xl p-1 shadow-sm border border-zinc-100">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-indigo-50 text-[#6C3EF4]' : 'text-zinc-400 hover:text-zinc-600'}`}
            title="সাধারণ তালিকা"
          >
            <List size={20} />
          </button>
          <button
            onClick={() => setViewMode('grouped')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'grouped' ? 'bg-indigo-50 text-[#6C3EF4]' : 'text-zinc-400 hover:text-zinc-600'}`}
            title="তারিখ অনুযায়ী"
          >
            <Layers size={20} />
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <input 
            type="text" 
            placeholder="নাম, ফোন নম্বর বা আইডি দিয়ে খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-zinc-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#6C3EF4] focus:ring-opacity-20 shadow-sm"
          />
        </div>
        <div className="relative w-14 flex-shrink-0">
          <input 
            type="date" 
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div className={`w-full h-full rounded-2xl border flex items-center justify-center transition-colors ${filterDate ? 'bg-indigo-50 border-indigo-100 text-[#6C3EF4]' : 'bg-white border-zinc-100 text-zinc-400'}`}>
            <Calendar size={20} />
          </div>
          {filterDate && (
            <button 
              onClick={() => setFilterDate('')}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 z-20 hover:bg-red-600"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Customer List */}
      <div className="space-y-6">
        {viewMode === 'grouped' ? (
          sortedDates.map(date => (
            <div key={date} className="space-y-4">
              <h2 className="text-sm font-bold text-zinc-500 sticky top-0 bg-[#f5f5f5]/80 backdrop-blur-md py-2 z-10">{date}</h2>
              {groupedCustomers[date].map((customer) => (
                <motion.div
                  layout
                  key={customer.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => onSelectCustomer(customer.id)}
                  className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-100 flex items-center justify-between active:scale-95 transition-transform cursor-pointer group"
                >
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-[#6C3EF4] flex-shrink-0">
                      <User size={24} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-bold text-zinc-900 truncate">{customer.name}</h3>
                        <span className="text-[10px] bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-full flex items-center flex-shrink-0">
                          <Hash size={10} className="mr-0.5" />
                          {customer.id}
                        </span>
                      </div>
                      <div className="flex items-center text-zinc-400 text-xs mt-1 truncate">
                        <Phone size={10} className="mr-1 flex-shrink-0" />
                        <span className="mr-2 truncate">{customer.phone}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
                    <div className="relative">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(prev => prev === customer.id ? null : customer.id);
                        }}
                        className="p-2 text-zinc-400 hover:text-zinc-600 rounded-xl transition-colors"
                      >
                        <MoreVertical size={20} />
                      </button>
                      {openMenuId === customer.id && (
                        <>
                          <div 
                            className="fixed inset-0 z-10" 
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(null);
                            }}
                          />
                          <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-lg border border-zinc-100 py-2 z-20">
                            <button 
                              onClick={(e) => {
                                setOpenMenuId(null);
                                handleEdit(e, customer);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 flex items-center"
                            >
                              <Edit3 size={16} className="mr-2 text-[#6C3EF4]" />
                              এডিট
                            </button>
                            <button 
                              onClick={(e) => {
                                setOpenMenuId(null);
                                handleDeleteClick(e, customer.id);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                            >
                              <Trash2 size={16} className="mr-2" />
                              ডিলেট
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                    <ChevronRight size={20} className="text-zinc-300" />
                  </div>
                </motion.div>
              ))}
            </div>
          ))
        ) : (
          <div className="space-y-4">
            {filteredCustomers.map((customer) => (
              <motion.div
                layout
                key={customer.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => onSelectCustomer(customer.id)}
                className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-100 flex items-center justify-between active:scale-95 transition-transform cursor-pointer group"
              >
                <div className="flex items-center space-x-4 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-[#6C3EF4] flex-shrink-0">
                    <User size={24} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-zinc-900 truncate">{customer.name}</h3>
                      <span className="text-[10px] bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-full flex items-center flex-shrink-0">
                        <Hash size={10} className="mr-0.5" />
                        {customer.id}
                      </span>
                    </div>
                    <div className="flex items-center text-zinc-400 text-xs mt-1 truncate">
                      <Phone size={10} className="mr-1 flex-shrink-0" />
                      <span className="mr-2 truncate">{customer.phone}</span>
                      <Calendar size={10} className="mr-1 flex-shrink-0 ml-2" />
                      <span className="truncate">{formatDate(customer.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
                  <div className="relative">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(prev => prev === customer.id ? null : customer.id);
                      }}
                      className="p-2 text-zinc-400 hover:text-zinc-600 rounded-xl transition-colors"
                    >
                      <MoreVertical size={20} />
                    </button>
                    {openMenuId === customer.id && (
                      <>
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(null);
                          }}
                        />
                        <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-lg border border-zinc-100 py-2 z-20">
                          <button 
                            onClick={(e) => {
                              setOpenMenuId(null);
                              handleEdit(e, customer);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 flex items-center"
                          >
                            <Edit3 size={16} className="mr-2 text-[#6C3EF4]" />
                            এডিট
                          </button>
                          <button 
                            onClick={(e) => {
                              setOpenMenuId(null);
                              handleDeleteClick(e, customer.id);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                          >
                            <Trash2 size={16} className="mr-2" />
                            ডিলেট
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                  <ChevronRight size={20} className="text-zinc-300" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
        {filteredCustomers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-zinc-400">কোনো কাস্টমার পাওয়া যায়নি</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {deletingCustomerId && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[32px] p-6 w-full max-w-sm text-center"
            >
              <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} />
              </div>
              <h2 className="text-xl font-bold mb-2">কাস্টমার মুছে ফেলুন</h2>
              <p className="text-zinc-500 mb-6">আপনি কি নিশ্চিত যে এই কাস্টমারকে মুছে ফেলতে চান? এই কাজটি বাতিল করা যাবে না।</p>
              <div className="flex space-x-3">
                <button 
                  onClick={() => setDeletingCustomerId(null)}
                  className="flex-1 py-3 rounded-xl font-bold text-zinc-600 bg-zinc-100"
                >
                  বাতিল
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 py-3 rounded-xl font-bold text-white bg-red-500"
                >
                  মুছে ফেলুন
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {editingCustomer && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[32px] p-6 w-full max-w-md"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">কাস্টমার এডিট করুন</h2>
                <button onClick={() => setEditingCustomer(null)} className="p-2 bg-zinc-50 rounded-full text-zinc-400">
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">কাস্টমারের নাম</label>
                  <input 
                    type="text" 
                    value={editingCustomer.name}
                    onChange={(e) => setEditingCustomer({...editingCustomer, name: e.target.value})}
                    className="w-full bg-zinc-50 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#6C3EF4]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">ফোন নম্বর</label>
                  <input 
                    type="tel" 
                    value={editingCustomer.phone}
                    onChange={(e) => setEditingCustomer({...editingCustomer, phone: e.target.value})}
                    className="w-full bg-zinc-50 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#6C3EF4]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">ঠিকানা (ঐচ্ছিক)</label>
                  <input 
                    type="text" 
                    value={editingCustomer.address}
                    onChange={(e) => setEditingCustomer({...editingCustomer, address: e.target.value})}
                    className="w-full bg-zinc-50 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#6C3EF4]"
                  />
                </div>
                <button 
                  onClick={() => {
                    setCustomers(prev => prev.map(c => c.id === editingCustomer.id ? editingCustomer : c));
                    setEditingCustomer(null);
                  }}
                  className="w-full bg-[#6C3EF4] text-white py-4 rounded-xl font-bold text-sm mt-4"
                >
                  সেভ করুন
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
