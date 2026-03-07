import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Save, 
  Trash2, 
  Printer, 
  Scissors, 
  History, 
  Package, 
  Calendar, 
  Plus, 
  X, 
  GripVertical,
  Edit3,
  Search,
  User,
  UserPlus,
  Baby,
  ChevronRight
} from 'lucide-react';
import { Customer, Measurement, Order, MeasurementCategory, MeasurementField } from '../types';

interface MeasurementFormProps {
  customers: Customer[];
  setCustomers?: React.Dispatch<React.SetStateAction<Customer[]>>;
  measurements: Record<string, Measurement>;
  setMeasurements: React.Dispatch<React.SetStateAction<Record<string, Measurement>>>;
  orders: Order[];
  initialCustomerId?: string;
  onBack: () => void;
  onSaveSuccess?: () => void;
  onCustomerChange?: (id: string) => void;
}

const DRESS_TEMPLATES = {
  male: [
    { name: 'পাঞ্জাবি', fields: ['লম্বা', 'পুঁট', 'বুক', 'হাতা', 'কলার', 'পেট'] },
    { name: 'পাজামা', fields: ['কোমর', 'হিপ', 'লম্বা', 'রান', 'মুহুরি'] },
    { name: 'জুব্বা', fields: ['লম্বা', 'পুঁট', 'বুক', 'হাতা', 'কলার', 'পেট', 'ঘের'] },
    { name: 'শার্ট', fields: ['লম্বা', 'পুঁট', 'বুক', 'হাতা', 'কলার', 'পেট'] },
    { name: 'প্যান্ট', fields: ['কোমর', 'হিপ', 'লম্বা', 'রান', 'মুহুরি'] },
    { name: 'স্যুট', fields: ['লম্বা', 'পুঁট', 'বুক', 'হাতা', 'কলার', 'পেট'] },
  ],
  female: [
    { name: 'সালোয়ার কামিজ', fields: ['লম্বা', 'বুক', 'কোমর', 'হিপ', 'হাতা', 'পুঁট', 'ঘের'] },
    { name: 'ব্লাউজ', fields: ['লম্বা', 'বুক', 'কোমর', 'হাতা', 'পুঁট', 'গলা'] },
    { name: 'পেটিকোট', fields: ['কোমর', 'লম্বা', 'ঘের'] },
    { name: 'মেক্সি', fields: ['লম্বা', 'বুক', 'হাতা', 'পুঁট', 'ঘের'] },
    { name: 'বোরকা', fields: ['লম্বা', 'বুক', 'হাতা', 'পুঁট', 'ঘের'] },
  ],
  child: [
    { name: 'শার্ট', fields: ['লম্বা', 'পুঁট', 'বুক', 'হাতা', 'কলার'] },
    { name: 'প্যান্ট', fields: ['কোমর', 'লম্বা', 'মুহুরি'] },
    { name: 'ফ্রক', fields: ['লম্বা', 'বুক', 'কোমর', 'হাতা', 'পুঁট'] },
  ]
};

const DEFAULT_CATEGORIES: MeasurementCategory[] = [];

export default function MeasurementForm({ customers, setCustomers, measurements, setMeasurements, orders, initialCustomerId, onBack, onSaveSuccess, onCustomerChange }: MeasurementFormProps) {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(initialCustomerId || customers[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'measurements' | 'history'>('measurements');
  const [historySearch, setHistorySearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [selectionStep, setSelectionStep] = useState<'gender' | 'dress'>('gender');
  const [selectedGender, setSelectedGender] = useState<'male' | 'female' | 'child' | null>(null);
  
  const [editingCustomer, setEditingCustomer] = useState<{name: string, phone: string, address: string} | null>(null);
  
  const [editingCategoryName, setEditingCategoryName] = useState<{index: number, name: string} | null>(null);

  const [templates, setTemplates] = useState<MeasurementCategory[]>(() => {
    const saved = localStorage.getItem('tailor_templates');
    return saved ? JSON.parse(saved) : [];
  });

  const [formData, setFormData] = useState<Measurement>({
    customerId: selectedCustomerId,
    categories: DEFAULT_CATEGORIES,
    notes: '',
    updatedAt: Date.now()
  });

  // Sync formData when selectedCustomerId changes
  useEffect(() => {
    if (selectedCustomerId && measurements[selectedCustomerId]) {
      setFormData(measurements[selectedCustomerId]);
    } else {
      setFormData({
        customerId: selectedCustomerId,
        categories: JSON.parse(JSON.stringify(DEFAULT_CATEGORIES)), // Deep copy
        notes: '',
        updatedAt: Date.now()
      });
    }
  }, [selectedCustomerId, measurements]);

  const filteredOrders = orders
    .filter(o => o.customerId === selectedCustomerId)
    .filter(o => 
      o.dressType.toLowerCase().includes(historySearch.toLowerCase()) ||
      o.status.toLowerCase().includes(historySearch.toLowerCase()) ||
      o.id.toLowerCase().includes(historySearch.toLowerCase())
    );

  const handleSave = () => {
    if (!selectedCustomerId) {
      setError('অনুগ্রহ করে আগে একজন কাস্টমার নির্বাচন করুন');
      return;
    }
    
    let missingFields: string[] = [];
    formData.categories.forEach(cat => {
      cat.fields.forEach(f => {
        if (f.isOptional) return;
        if (f.type === 'checkbox') return;
        if (f.type === 'count') return;
        if (f.value === undefined || f.value === null || f.value === '' || f.value.toString().trim() === '') {
          missingFields.push(`${cat.name} - ${f.label}`);
        }
      });
    });

    if (missingFields.length > 0) {
      setError(`অনুগ্রহ করে আবশ্যিক মাপগুলো পূরণ করুন: ${missingFields.join(', ')}`);
      return;
    }
    
    setError(null);

    const updatedMeasurements = {
      ...measurements,
      [selectedCustomerId]: { 
        ...formData, 
        customerId: selectedCustomerId,
        updatedAt: Date.now() 
      }
    };
    
    setMeasurements(updatedMeasurements);
    if (onSaveSuccess) {
      onSaveSuccess();
    }
  };

  const handleDelete = () => {
    if (window.confirm('আপনি কি নিশ্চিত যে এই মাপটি মুছে ফেলতে চান?')) {
      const newMeasurements = { ...measurements };
      delete newMeasurements[selectedCustomerId];
      setMeasurements(newMeasurements);
      alert('মাপ মুছে ফেলা হয়েছে');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const addCategory = () => {
    setIsAddingCategory(true);
    setSelectionStep('gender');
    setSelectedGender(null);
  };

  const handleTemplateSelect = (template: { name: string, fields: string[] }) => {
    setFormData(prev => ({
      ...prev,
      categories: [...prev.categories, { 
        name: template.name, 
        fields: template.fields.map(f => ({ label: f, value: '' })) 
      }]
    }));
    setIsAddingCategory(false);
  };

  const addCustomCategory = () => {
    const name = prompt('ক্যাটাগরির নাম লিখুন (যেমন: পাঞ্জাবি, স্যুট):');
    if (name) {
      setFormData(prev => ({
        ...prev,
        categories: [...prev.categories, { name, fields: [] }]
      }));
      setIsAddingCategory(false);
    }
  };

  const removeCategory = (index: number) => {
    if (window.confirm('এই পুরো ক্যাটাগরিটি কি মুছে ফেলতে চান?')) {
      setFormData(prev => ({
        ...prev,
        categories: prev.categories.filter((_, i) => i !== index)
      }));
    }
  };

  const addField = (categoryIndex: number) => {
    const label = prompt('মাপের নাম লিখুন (যেমন: লম্বা, বুক):');
    if (label) {
      setFormData(prev => {
        const newCategories = [...prev.categories];
        newCategories[categoryIndex] = {
          ...newCategories[categoryIndex],
          fields: [...newCategories[categoryIndex].fields, { label, value: '' }]
        };
        return { ...prev, categories: newCategories };
      });
    }
  };

  const removeField = (categoryIndex: number, fieldIndex: number) => {
    setFormData(prev => {
      const newCategories = [...prev.categories];
      newCategories[categoryIndex] = {
        ...newCategories[categoryIndex],
        fields: newCategories[categoryIndex].fields.filter((_, i) => i !== fieldIndex)
      };
      return { ...prev, categories: newCategories };
    });
  };

  const updateFieldValue = (categoryIndex: number, fieldIndex: number, value: string) => {
    setFormData(prev => {
      const newCategories = [...prev.categories];
      const newFields = [...newCategories[categoryIndex].fields];
      newFields[fieldIndex] = { ...newFields[fieldIndex], value };
      newCategories[categoryIndex] = { ...newCategories[categoryIndex], fields: newFields };
      return { ...prev, categories: newCategories };
    });
  };

  const updateCategoryName = (index: number, name: string) => {
    setFormData(prev => {
      const newCategories = [...prev.categories];
      newCategories[index] = { ...newCategories[index], name };
      return { ...prev, categories: newCategories };
    });
  };

  const updateFieldLabel = (categoryIndex: number, fieldIndex: number, label: string) => {
    setFormData(prev => {
      const newCategories = [...prev.categories];
      const newFields = [...newCategories[categoryIndex].fields];
      newFields[fieldIndex] = { ...newFields[fieldIndex], label };
      newCategories[categoryIndex] = { ...newCategories[categoryIndex], fields: newFields };
      return { ...prev, categories: newCategories };
    });
  };

  return (
    <div className="px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="w-10 h-10 rounded-xl bg-white border border-zinc-100 flex items-center justify-center text-zinc-400">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold">কাস্টমার প্রোফাইল</h1>
        <div className="w-10 h-10"></div>
      </div>

      {/* Customer Profile Display */}
      {(() => {
        const customer = customers.find(c => c.id === selectedCustomerId);
        if (!customer) return null;
        
        if (editingCustomer) {
          return (
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-zinc-100 mb-6 space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-zinc-900">প্রোফাইল এডিট করুন</h3>
                <button 
                  onClick={() => setEditingCustomer(null)}
                  className="text-zinc-400 p-1"
                >
                  <X size={20} />
                </button>
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">কাস্টমারের নাম</label>
                <input 
                  type="text" 
                  value={editingCustomer.name}
                  onChange={(e) => setEditingCustomer({...editingCustomer, name: e.target.value})}
                  placeholder="কাস্টমারের নাম"
                  className="w-full bg-zinc-50 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#6C3EF4]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">ফোন নম্বর</label>
                <input 
                  type="tel" 
                  value={editingCustomer.phone}
                  onChange={(e) => setEditingCustomer({...editingCustomer, phone: e.target.value})}
                  placeholder="ফোন নম্বর"
                  className="w-full bg-zinc-50 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#6C3EF4]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">ঠিকানা (ঐচ্ছিক)</label>
                <input 
                  type="text" 
                  value={editingCustomer.address}
                  onChange={(e) => setEditingCustomer({...editingCustomer, address: e.target.value})}
                  placeholder="ঠিকানা (ঐচ্ছিক)"
                  className="w-full bg-zinc-50 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#6C3EF4]"
                />
              </div>
              <button 
                onClick={() => {
                  if (setCustomers) {
                    setCustomers(prev => prev.map(c => 
                      c.id === customer.id 
                        ? { ...c, name: editingCustomer.name, phone: editingCustomer.phone, address: editingCustomer.address }
                        : c
                    ));
                  }
                  setEditingCustomer(null);
                }}
                className="w-full bg-[#6C3EF4] text-white py-3 rounded-xl font-bold text-sm"
              >
                সেভ করুন
              </button>
            </div>
          );
        }

        return (
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-zinc-100 mb-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-[#6C3EF4] text-xl font-bold">
                {customer.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-lg font-bold text-zinc-900">{customer.name}</h2>
                <p className="text-sm text-zinc-500">{customer.phone}</p>
                {customer.address && <p className="text-xs text-zinc-400 mt-1">{customer.address}</p>}
              </div>
            </div>
            <button 
              onClick={() => setEditingCustomer({ name: customer.name, phone: customer.phone, address: customer.address || '' })}
              className="w-10 h-10 rounded-xl bg-zinc-50 text-zinc-400 flex items-center justify-center hover:bg-indigo-50 hover:text-[#6C3EF4] transition-colors"
            >
              <Edit3 size={18} />
            </button>
          </div>
        );
      })()}

      <AnimatePresence mode="wait">
        <motion.div
          key="measurements"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.2 }}
        >
          {formData.categories.map((category, catIndex) => (
              <div key={catIndex} className="bg-white p-6 rounded-3xl shadow-sm border border-zinc-100 mb-6 relative group">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-[#6C3EF4]">
                      <Scissors size={16} />
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-lg text-zinc-900">{category.name}</span>
                      <button 
                        onClick={() => setEditingCategoryName({ index: catIndex, name: category.name })}
                        className="p-1.5 text-[#6C3EF4] bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                      >
                        <Edit3 size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {category.fields.map((field, fieldIndex) => (
                    <div key={fieldIndex} className="space-y-1 relative group/field">
                      <div className="flex items-center justify-between px-2">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider w-full truncate flex items-center">
                          {field.label}
                          {!field.isOptional && <span className="text-rose-500 ml-1">*</span>}
                        </span>
                        <button 
                          onClick={() => removeField(catIndex, fieldIndex)}
                          className="text-zinc-300 hover:text-rose-500 opacity-0 group-hover/field:opacity-100 transition-opacity"
                        >
                          <X size={10} />
                        </button>
                      </div>
                      <input 
                        type="text" 
                        inputMode="decimal"
                        value={field.value}
                        onChange={(e) => updateFieldValue(catIndex, fieldIndex, e.target.value)}
                        placeholder="0.0"
                        className="w-full bg-zinc-50 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#6C3EF4]"
                      />
                    </div>
                  ))}
                </div>
                
                {category.fields.length === 0 && (
                  <div className="text-center py-4 border-2 border-dashed border-zinc-100 rounded-2xl">
                    <p className="text-xs text-zinc-400">এখনো কোনো মাপ যোগ করা হয়নি</p>
                    <button 
                      onClick={() => addField(catIndex)}
                      className="text-xs font-bold text-[#6C3EF4] mt-2"
                    >
                      + মাপ যোগ করুন
                    </button>
                  </div>
                )}

                <div className="mt-6 pt-6 border-t border-zinc-100">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2 block">বিশেষ নোট ({category.name})</label>
                  <textarea 
                    value={category.notes || ''}
                    onChange={(e) => {
                      setFormData(prev => {
                        const newCategories = [...prev.categories];
                        newCategories[catIndex] = { ...newCategories[catIndex], notes: e.target.value };
                        return { ...prev, categories: newCategories };
                      });
                    }}
                    placeholder="এই পোশাকের জন্য বিশেষ কোনো নির্দেশনা থাকলে লিখুন..."
                    rows={2}
                    className="w-full bg-zinc-50 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#6C3EF4] resize-none"
                  />
                </div>
              </div>
            ))}

            {/* Category Selection Modal */}
            <AnimatePresence>
              {isAddingCategory && (
                <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/50 backdrop-blur-sm p-4">
                  <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    className="bg-white w-full max-w-md rounded-[32px] p-8 shadow-2xl overflow-hidden"
                  >
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h2 className="text-xl font-bold">
                          {selectionStep === 'gender' ? 'লিঙ্গ নির্বাচন করুন' : 'পোশাকের ধরন'}
                        </h2>
                        <p className="text-xs text-zinc-400 mt-1">
                          {selectionStep === 'gender' ? 'কার জন্য মাপ নিতে চান?' : 'কোন পোশাকের মাপ নিতে চান?'}
                        </p>
                      </div>
                      <button onClick={() => setIsAddingCategory(false)} className="text-zinc-400">
                        <X size={24} />
                      </button>
                    </div>

                    <div className="space-y-4">
                      {selectionStep === 'gender' ? (
                        <div className="grid grid-cols-1 gap-4">
                          <button 
                            onClick={() => { setSelectedGender('male'); setSelectionStep('dress'); }}
                            className="flex items-center justify-between p-6 bg-blue-50 rounded-2xl border border-blue-100 group active:scale-95 transition-transform"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 rounded-xl bg-blue-500 text-white flex items-center justify-center">
                                <User size={24} />
                              </div>
                              <span className="font-bold text-blue-900">পুরুষ</span>
                            </div>
                            <ChevronRight size={20} className="text-blue-300" />
                          </button>
                          <button 
                            onClick={() => { setSelectedGender('female'); setSelectionStep('dress'); }}
                            className="flex items-center justify-between p-6 bg-rose-50 rounded-2xl border border-rose-100 group active:scale-95 transition-transform"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 rounded-xl bg-rose-500 text-white flex items-center justify-center">
                                <UserPlus size={24} />
                              </div>
                              <span className="font-bold text-rose-900">মহিলা</span>
                            </div>
                            <ChevronRight size={20} className="text-rose-300" />
                          </button>
                          <button 
                            onClick={() => { setSelectedGender('child'); setSelectionStep('dress'); }}
                            className="flex items-center justify-between p-6 bg-emerald-50 rounded-2xl border border-emerald-100 group active:scale-95 transition-transform"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
                                <Baby size={24} />
                              </div>
                              <span className="font-bold text-emerald-900">শিশু</span>
                            </div>
                            <ChevronRight size={20} className="text-emerald-300" />
                          </button>
                          <div className="pt-4 border-t border-zinc-100">
                            <button 
                              onClick={() => setSelectionStep('dress')}
                              className="w-full p-4 bg-indigo-50 text-[#6C3EF4] rounded-2xl text-sm font-bold flex items-center justify-center space-x-2"
                            >
                              <span>সরাসরি পোশাক নির্বাচন</span>
                              <ChevronRight size={16} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            {selectedGender ? DRESS_TEMPLATES[selectedGender].map((template) => (
                              <button 
                                key={template.name}
                                onClick={() => handleTemplateSelect(template)}
                                className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 text-sm font-bold text-zinc-700 hover:bg-indigo-50 hover:border-indigo-100 hover:text-[#6C3EF4] transition-all"
                              >
                                {template.name}
                              </button>
                            )) : templates.map((template) => (
                              <button 
                                key={template.name}
                                onClick={() => handleTemplateSelect({ name: template.name, fields: template.fields.map(f => f.label) })}
                                className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 text-sm font-bold text-zinc-700 hover:bg-indigo-50 hover:border-indigo-100 hover:text-[#6C3EF4] transition-all"
                              >
                                {template.name}
                              </button>
                            ))}
                          </div>
                          <div className="pt-4 border-t border-zinc-100">
                            <button 
                              onClick={addCustomCategory}
                              className="w-full p-4 bg-white border-2 border-dashed border-zinc-200 rounded-2xl text-sm font-bold text-zinc-400 hover:border-[#6C3EF4] hover:text-[#6C3EF4] transition-all"
                            >
                              + কাস্টম ক্যাটাগরি যোগ করুন
                            </button>
                          </div>
                          <button 
                            onClick={() => setSelectionStep('gender')}
                            className="w-full py-3 text-zinc-400 text-xs font-bold uppercase tracking-widest"
                          >
                            পিছনে যান
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {error && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-medium">
                {error}
              </div>
            )}

            <button 
              onClick={handleSave}
              className="w-full bg-[#6C3EF4] text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-100 flex items-center justify-center space-x-2"
            >
              <Save size={20} />
              <span>মাপ সেভ করুন</span>
            </button>
          </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {editingCategoryName && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[32px] p-6 w-full max-w-sm"
            >
              <h2 className="text-xl font-bold mb-4">পোশাকের নাম পরিবর্তন করুন</h2>
              <input 
                type="text" 
                value={editingCategoryName.name}
                onChange={(e) => setEditingCategoryName({...editingCategoryName, name: e.target.value})}
                className="w-full bg-zinc-50 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#6C3EF4] mb-6"
                autoFocus
              />
              <div className="flex space-x-3">
                <button 
                  onClick={() => setEditingCategoryName(null)}
                  className="flex-1 py-3 rounded-xl font-bold text-zinc-600 bg-zinc-100"
                >
                  বাতিল
                </button>
                <button 
                  onClick={() => {
                    updateCategoryName(editingCategoryName.index, editingCategoryName.name);
                    setEditingCategoryName(null);
                  }}
                  className="flex-1 py-3 rounded-xl font-bold text-white bg-[#6C3EF4]"
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
