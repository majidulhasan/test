
import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff, ChevronDown, Palette } from 'lucide-react';
import { Category, PasswordEntry } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: any) => void;
  onAddCategoryClick: () => void;
  initialData: PasswordEntry | null;
  defaultCategoryId?: string;
  categories: Category[];
  customColors: string[];
  isDarkMode: boolean;
}

const PRESET_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1', '#06b6d4'];

const AddEditPasswordModal: React.FC<Props> = ({ 
  isOpen, onClose, onSave, initialData, defaultCategoryId, categories, customColors, isDarkMode 
}) => {
  const [formData, setFormData] = useState({
    categoryId: '',
    newCategoryName: '',
    newCategoryColor: PRESET_COLORS[0],
    isCreatingNewCategory: false,
    title: '',
    username: '',
    passwordValue: ''
  });
  const [showPw, setShowPw] = useState(false);
  const [isSelectingCategory, setIsSelectingCategory] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          categoryId: initialData.categoryId,
          newCategoryName: '',
          newCategoryColor: PRESET_COLORS[0],
          isCreatingNewCategory: false,
          title: initialData.title,
          username: initialData.username,
          passwordValue: initialData.passwordValue
        });
      } else {
        const initialCatId = defaultCategoryId && defaultCategoryId !== 'all' ? defaultCategoryId : '';
        setFormData({
          categoryId: initialCatId,
          newCategoryName: '',
          newCategoryColor: PRESET_COLORS[0],
          isCreatingNewCategory: false,
          title: '',
          username: '',
          passwordValue: ''
        });
      }
      setIsSelectingCategory(false);
    }
  }, [initialData, categories, isOpen, defaultCategoryId]);

  const handleSave = () => {
    onSave(formData);
  };

  const selectedCategory = categories.find(c => c.id === formData.categoryId);

  if (!isOpen) return null;

  // এডিট মোড (initialData থাকলে) অথবা নির্দিষ্ট ক্যাটাগরি ফিল্টার অন থাকলে ক্যাটাগরি সিলেকশন হাইড থাকবে
  const isFixedCategory = !!initialData || (defaultCategoryId !== undefined && defaultCategoryId !== 'all');

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={`w-full max-w-md rounded-[2.5rem] p-8 animate-modalIn shadow-2xl relative ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
        <button onClick={onClose} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-red-500 active:scale-90 transition-all"><X size={24} /></button>

        <h2 className="text-2xl font-bold mb-10 text-center">
          {initialData ? 'পাসওয়ার্ড আপডেট করুন' : 'নতুন পাসওয়ার্ড যোগ করুন'}
        </h2>

        <div className="space-y-8">
          {/* Category Selection - শুধুমাত্র নতুন পাসওয়ার্ড যোগ করার সময় এবং All সিলেক্ট থাকলে দেখাবে */}
          {!isFixedCategory ? (
            <div className="relative">
              <label className="absolute -top-3 left-4 bg-inherit px-2 text-sm font-medium text-blue-600 z-10">ক্যাটাগরি</label>
              <button 
                onClick={() => setIsSelectingCategory(true)}
                className={`w-full p-4 rounded-xl border-2 text-left flex items-center justify-between font-medium ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}
              >
                <span className={formData.categoryId || formData.isCreatingNewCategory ? 'opacity-100' : 'opacity-50'}>
                  {formData.isCreatingNewCategory 
                    ? "নতুন ক্যাটাগরি যোগ করা হচ্ছে..." 
                    : (selectedCategory?.name || "-- ক্যাটাগরি সিলেক্ট করুন --")}
                </span>
                <ChevronDown size={20} className="text-gray-400" />
              </button>
            </div>
          ) : (
            // এডিট মোডে ক্যাটাগরির নাম শুধু টেক্সট হিসেবে দেখানো যেতে পারে চাইলে, অথবা কিছু না দেখালেও চলে
            initialData && (
              <div className="flex items-center gap-2 px-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedCategory?.color || '#3b82f6' }} />
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{selectedCategory?.name} ক্যাটাগরিতে এডিট করা হচ্ছে</span>
              </div>
            )
          )}

          {/* Inline New Category Creator - শুধুমাত্র নতুন এন্ট্রি মোডে কাজ করবে */}
          {formData.isCreatingNewCategory && !isFixedCategory && (
            <div className="p-5 rounded-2xl bg-blue-50/50 dark:bg-blue-900/10 border-2 border-blue-500/30 space-y-5 animate-modalIn">
              <div className="relative">
                <label className="absolute -top-3 left-4 bg-inherit px-2 text-xs font-bold text-blue-600 z-10">নতুন ক্যাটাগরির নাম</label>
                <input
                  type="text"
                  autoFocus
                  className={`w-full p-4 rounded-xl border-2 border-blue-500 outline-none font-bold ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}
                  placeholder="যেমন: Personal, Office"
                  value={formData.newCategoryName}
                  onChange={(e) => setFormData({ ...formData, newCategoryName: e.target.value })}
                />
              </div>
              
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-blue-600 ml-1 flex items-center gap-2"><Palette size={12} /> রঙ নির্বাচন করুন</label>
                <div className="flex flex-wrap gap-2 max-h-[80px] overflow-y-auto no-scrollbar">
                  {PRESET_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, newCategoryColor: color })}
                      className={`w-8 h-8 rounded-full border-2 transition-all active:scale-90 ${formData.newCategoryColor === color ? 'border-white dark:border-gray-500 scale-110 shadow-lg' : 'border-transparent opacity-60'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  {customColors.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, newCategoryColor: color })}
                      className={`w-8 h-8 rounded-full border-2 transition-all active:scale-90 ${formData.newCategoryColor === color ? 'border-white dark:border-gray-500 scale-110 shadow-lg' : 'border-transparent opacity-60'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Form Fields */}
          <div className="relative">
            <label className="absolute -top-3 left-4 bg-inherit px-2 text-sm font-medium text-blue-600 z-10">ওয়েবসাইট/অ্যাপের নাম</label>
            <input
              type="text"
              className={`w-full p-4 rounded-xl border-2 outline-none font-bold ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200 focus:border-blue-500 transition-all'}`}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="relative">
            <label className="absolute -top-3 left-4 bg-inherit px-2 text-sm font-medium text-blue-600 z-10">ইউজারনেম/ইমেইল</label>
            <input
              type="text"
              className={`w-full p-4 rounded-xl border-2 outline-none font-bold ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200 focus:border-blue-500 transition-all'}`}
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </div>

          <div className="relative">
            <label className="absolute -top-3 left-4 bg-inherit px-2 text-sm font-medium text-blue-600 z-10">পাসওয়ার্ড</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                className={`w-full p-4 pr-12 rounded-xl border-2 outline-none font-bold ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200 focus:border-blue-500 transition-all'}`}
                value={formData.passwordValue}
                onChange={(e) => setFormData({ ...formData, passwordValue: e.target.value })}
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                {showPw ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={(!formData.categoryId && !formData.newCategoryName && !isFixedCategory) || !formData.title}
            className={`w-full py-5 bg-blue-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-500/20 active:scale-95 transition-all mt-4 disabled:opacity-50 disabled:shadow-none`}
          >
            {initialData ? 'আপডেট করুন' : 'সংরক্ষণ করুন'}
          </button>
        </div>

        {/* Category Picker Overlay */}
        {isSelectingCategory && !isFixedCategory && (
          <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
            <div className={`w-full max-w-sm rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 animate-modalIn ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold">ক্যাটাগরি বাছাই করুন</h3>
                <button onClick={() => setIsSelectingCategory(false)} className="text-gray-400"><X size={24} /></button>
              </div>

              <div className="space-y-2 max-h-[50vh] overflow-y-auto no-scrollbar pb-4">
                <button
                  onClick={() => {
                    setFormData({ ...formData, categoryId: '', isCreatingNewCategory: true });
                    setIsSelectingCategory(false);
                  }}
                  className={`w-full p-5 rounded-2xl flex items-center justify-between transition-all ${formData.isCreatingNewCategory ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 border-2 border-blue-500' : 'hover:bg-gray-50 dark:hover:bg-gray-700 border-2 border-transparent'}`}
                >
                  <span className="font-bold">-- নতুন ক্যাটাগরি যোগ করুন --</span>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${formData.isCreatingNewCategory ? 'border-blue-600' : 'border-gray-300'}`}>
                    {formData.isCreatingNewCategory && <div className="w-3 h-3 bg-blue-600 rounded-full" />}
                  </div>
                </button>

                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setFormData({ ...formData, categoryId: cat.id, isCreatingNewCategory: false });
                      setIsSelectingCategory(false);
                    }}
                    className={`w-full p-5 rounded-2xl flex items-center justify-between transition-all ${formData.categoryId === cat.id ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 border-2 border-blue-500' : 'hover:bg-gray-50 dark:hover:bg-gray-700 border-2 border-transparent'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="font-bold">{cat.name}</span>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${formData.categoryId === cat.id ? 'border-blue-600' : 'border-gray-300'}`}>
                      {formData.categoryId === cat.id && <div className="w-3 h-3 bg-blue-600 rounded-full" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddEditPasswordModal;
