import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Plus, 
  ChevronRight, 
  ArrowLeft, 
  User, 
  Phone, 
  MapPin, 
  Save, 
  Scissors,
  Edit2,
  Trash2,
  Ruler,
  Activity,
  Maximize,
  Circle,
  MoveHorizontal,
  RefreshCw,
  ArrowDown,
  MoveVertical,
  ArrowUp,
  Search,
  Check,
  Minus,
  CheckSquare,
  CircleDot,
  Type,
  Hash,
  ChevronDown,
  Star
} from 'lucide-react';
import { Customer, Measurement, MeasurementCategory, FieldType } from '../types';

interface NewOrderFlowProps {
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  measurements: Record<string, Measurement>;
  setMeasurements: React.Dispatch<React.SetStateAction<Record<string, Measurement>>>;
  onClose: () => void;
  onComplete: (customerId: string) => void;
  initialCustomerId?: string;
}

const INITIAL_CATEGORIES: MeasurementCategory[] = [
  { name: 'পাঞ্জাবি', fields: [{ label: 'লম্বা', value: '' }, { label: 'পুঁট', value: '' }, { label: 'বুক', value: '' }, { label: 'হাতা', value: '' }, { label: 'কলার', value: '' }, { label: 'পেট', value: '' }] },
  { name: 'পাজামা', fields: [{ label: 'কোমর', value: '' }, { label: 'হিপ', value: '' }, { label: 'লম্বা', value: '' }, { label: 'রান', value: '' }, { label: 'মুহুরি', value: '' }] },
  { name: 'জুব্বা', fields: [{ label: 'লম্বা', value: '' }, { label: 'পুঁট', value: '' }, { label: 'বুক', value: '' }, { label: 'হাতা', value: '' }, { label: 'কলার', value: '' }, { label: 'পেট', value: '' }, { label: 'ঘের', value: '' }] },
  { name: 'কটি', fields: [{ label: 'লম্বা', value: '' }, { label: 'বুক', value: '' }, { label: 'কোমর', value: '' }, { label: 'পুঁট', value: '' }] },
  { name: 'শেরওয়ানি', fields: [{ label: 'লম্বা', value: '' }, { label: 'পুঁট', value: '' }, { label: 'বুক', value: '' }, { label: 'হাতা', value: '' }, { label: 'কলার', value: '' }] },
];

const COMMON_FIELDS = [
  { label: 'লম্বা', icon: <Ruler size={18} /> },
  { label: 'বুক', icon: <User size={18} /> },
  { label: 'কোমর', icon: <Activity size={18} /> },
  { label: 'হিপ', icon: <Maximize size={18} /> },
  { label: 'হাতা', icon: <Scissors size={18} /> },
  { label: 'কলার', icon: <Circle size={18} /> },
  { label: 'পুঁট', icon: <MoveHorizontal size={18} /> },
  { label: 'ঘের', icon: <RefreshCw size={18} /> },
  { label: 'মুহুরি', icon: <ArrowDown size={18} /> },
  { label: 'রান', icon: <MoveVertical size={18} /> },
  { label: 'গলা', icon: <Circle size={18} /> },
  { label: 'তিরা', icon: <MoveHorizontal size={18} /> },
  { label: 'লুজ', icon: <Plus size={18} /> },
  { label: 'হাই', icon: <ArrowUp size={18} /> },
];

export default function NewOrderFlow({ customers, setCustomers, measurements, setMeasurements, onClose, onComplete, initialCustomerId }: NewOrderFlowProps) {
  const [step, setStep] = useState<'category' | 'customer' | 'measurement'>('category');
  const [categories, setCategories] = useState<MeasurementCategory[]>(() => {
    const saved = localStorage.getItem('tailor_templates');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });
  const [selectedCategory, setSelectedCategory] = useState<MeasurementCategory | null>(null);
  const [customerData, setCustomerData] = useState({ name: '', phone: '', address: '' });
  const [measurementData, setMeasurementData] = useState<MeasurementCategory | null>(null);
  const [orderNote, setOrderNote] = useState('');
  const [isEditingTemplates, setIsEditingTemplates] = useState(false);
  const [fieldSelector, setFieldSelector] = useState<{ catIndex: number } | null>(null);
  const [customFieldModal, setCustomFieldModal] = useState<{ 
    catIndex: number;
    selectedType: FieldType;
  } | null>(null);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [fieldSearch, setFieldSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [modalConfig, setModalConfig] = useState<{
    type: 'prompt' | 'confirm';
    title: string;
    initialValue?: string;
    onConfirm: (value: string) => void;
  } | null>(null);

  useEffect(() => {
    localStorage.setItem('tailor_templates', JSON.stringify(categories));
  }, [categories]);

  const nextCustomerId = (Math.max(...customers.map(c => parseInt(c.id) || 0), 0) + 1).toString();

  const handleAddCategory = () => {
    setModalConfig({
      type: 'prompt',
      title: 'ক্যাটাগরির নাম লিখুন:',
      initialValue: '',
      onConfirm: (name) => {
        if (name) {
          setCategories([...categories, { name, fields: [] }]);
        }
        setModalConfig(null);
      }
    });
  };

  const handleEditCategory = (index: number) => {
    setModalConfig({
      type: 'prompt',
      title: 'নতুন নাম লিখুন:',
      initialValue: categories[index].name,
      onConfirm: (name) => {
        if (name) {
          const newCats = [...categories];
          newCats[index] = { ...newCats[index], name };
          setCategories(newCats);
        }
        setModalConfig(null);
      }
    });
  };

  const handleDeleteCategory = (index: number) => {
    setModalConfig({
      type: 'confirm',
      title: 'আপনি কি এই ক্যাটাগরি মুছে ফেলতে চান?',
      onConfirm: () => {
        setCategories(categories.filter((_, i) => i !== index));
        setModalConfig(null);
      }
    });
  };

  const handleAddField = (catIndex: number) => {
    setFieldSelector({ catIndex });
    setSelectedFields(categories[catIndex].fields.map(f => f.label));
    setFieldSearch('');
  };

  const toggleFieldSelection = (label: string) => {
    setSelectedFields(prev => 
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
    );
  };

  const handleConfirmFields = () => {
    if (fieldSelector === null) return;
    const { catIndex } = fieldSelector;
    
    const newCats = [...categories];
    // Keep existing values if field already existed, otherwise add new
    const newFields = selectedFields.map(label => {
      const existing = categories[catIndex].fields.find(f => f.label === label);
      return existing || { label, value: '' };
    });

    newCats[catIndex] = {
      ...newCats[catIndex],
      fields: newFields
    };
    setCategories(newCats);
    setFieldSelector(null);
  };

  const handleAddCustomField = () => {
    if (fieldSelector === null) return;
    setCustomFieldModal({ 
      catIndex: fieldSelector.catIndex,
      selectedType: 'text'
    });
    setFieldSelector(null);
  };

  const handleCreateCustomField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customFieldModal) return;
    
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const label = formData.get('label') as string;
    const type = customFieldModal.selectedType;
    const optionsStr = formData.get('options') as string;
    
    if (!label) return;

    const options = type === 'radio' ? optionsStr.split(',').map(o => o.trim()).filter(Boolean) : undefined;

    const newCats = [...categories];
    newCats[customFieldModal.catIndex] = {
      ...newCats[customFieldModal.catIndex],
      fields: [...newCats[customFieldModal.catIndex].fields, { 
        label, 
        value: type === 'checkbox' ? false : type === 'count' ? 0 : '', 
        type,
        options
      }]
    };
    setCategories(newCats);
    setCustomFieldModal(null);
  };

  const handleEditFieldLabel = (catIndex: number, fieldIndex: number) => {
    setModalConfig({
      type: 'prompt',
      title: 'মাপের নাম পরিবর্তন করুন:',
      initialValue: categories[catIndex].fields[fieldIndex].label,
      onConfirm: (label) => {
        if (label) {
          const newCats = [...categories];
          const newFields = [...newCats[catIndex].fields];
          newFields[fieldIndex] = { ...newFields[fieldIndex], label };
          newCats[catIndex] = { ...newCats[catIndex], fields: newFields };
          setCategories(newCats);
        }
        setModalConfig(null);
      }
    });
  };

  const handleToggleFieldOptional = (catIndex: number, fieldIndex: number) => {
    const newCats = [...categories];
    const newFields = [...newCats[catIndex].fields];
    newFields[fieldIndex] = { 
      ...newFields[fieldIndex], 
      isOptional: !newFields[fieldIndex].isOptional 
    };
    newCats[catIndex] = { ...newCats[catIndex], fields: newFields };
    setCategories(newCats);
  };

  const handleRemoveField = (catIndex: number, fieldIndex: number) => {
    const newCats = [...categories];
    newCats[catIndex] = {
      ...newCats[catIndex],
      fields: newCats[catIndex].fields.filter((_, i) => i !== fieldIndex)
    };
    setCategories(newCats);
  };

  const handleSelectCategory = (cat: MeasurementCategory) => {
    setSelectedCategory(cat);
    setMeasurementData(JSON.parse(JSON.stringify(cat))); // Deep copy
    if (initialCustomerId) {
      setStep('measurement');
    } else {
      setStep('customer');
    }
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('measurement');
  };

  const handleFinalSave = () => {
    if (!measurementData) return;

    const missingRequiredFields = measurementData.fields.filter(f => {
      if (f.isOptional) return false;
      if (f.type === 'checkbox') return false;
      if (f.type === 'count') return false;
      return f.value === undefined || f.value === null || f.value === '' || f.value.toString().trim() === '';
    });

    if (missingRequiredFields.length > 0) {
      setError(`অনুগ্রহ করে আবশ্যিক মাপগুলো পূরণ করুন: ${missingRequiredFields.map(f => f.label).join(', ')}`);
      return;
    }
    
    setError(null);

    const categoryWithNotes = { ...measurementData, notes: orderNote };

    if (initialCustomerId) {
      // Update existing customer measurements
      const currentMeasurement = measurements[initialCustomerId];
      let updatedMeasurement: Measurement;

      if (currentMeasurement) {
        updatedMeasurement = {
          ...currentMeasurement,
          categories: [...currentMeasurement.categories, categoryWithNotes],
          updatedAt: Date.now()
        };
      } else {
        // Should not happen if coming from profile, but handle it
        updatedMeasurement = {
          customerId: initialCustomerId,
          categories: [categoryWithNotes],
          notes: '',
          updatedAt: Date.now()
        };
      }

      setMeasurements({ ...measurements, [initialCustomerId]: updatedMeasurement });
      onComplete(initialCustomerId);
    } else {
      // Create new customer
      const newCustomer: Customer = {
        id: nextCustomerId,
        ...customerData,
        createdAt: Date.now()
      };

      const newMeasurement: Measurement = {
        customerId: newCustomer.id,
        categories: [categoryWithNotes],
        notes: '',
        updatedAt: Date.now()
      };

      setCustomers([newCustomer, ...customers]);
      setMeasurements({ ...measurements, [newCustomer.id]: newMeasurement });
      onComplete(newCustomer.id);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        className="bg-white w-full max-w-md rounded-t-[32px] p-8 pb-12 shadow-2xl overflow-y-auto max-h-[90vh]"
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            {step !== 'category' && (
              <button 
                onClick={() => {
                  if (step === 'measurement') {
                    setStep(initialCustomerId ? 'category' : 'customer');
                  } else {
                    setStep('category');
                  }
                }} 
                className="text-zinc-400"
              >
                <ArrowLeft size={24} />
              </button>
            )}
            <h2 className="text-xl font-bold">
              {step === 'category' ? 'পোশাক নির্বাচন করুন' : 
               step === 'customer' ? 'কাস্টমার তথ্য' : 'মাপ গ্রহণ'}
            </h2>
          </div>
          <button onClick={onClose} className="text-zinc-400">
            <X size={24} />
          </button>
        </div>

        {step === 'category' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-zinc-500">কোন পোশাকের মাপ নিতে চান?</p>
              <button 
                onClick={() => setIsEditingTemplates(!isEditingTemplates)}
                className={`text-xs font-bold ${isEditingTemplates ? 'text-rose-500' : 'text-[#6C3EF4]'}`}
              >
                {isEditingTemplates ? 'সম্পন্ন' : 'এডিট করুন'}
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {categories.map((cat, i) => (
                <div key={i} className="relative group">
                  <button
                    onClick={() => !isEditingTemplates && handleSelectCategory(cat)}
                    className={`w-full p-6 bg-zinc-50 rounded-3xl border border-zinc-100 flex flex-col items-center space-y-3 transition-all ${!isEditingTemplates && 'active:scale-95 hover:bg-indigo-50 hover:border-indigo-100'}`}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[#6C3EF4]">
                      <Scissors size={24} />
                    </div>
                    <span className="text-sm font-bold text-zinc-700">{cat.name}</span>
                  </button>
                  
                  {isEditingTemplates && (
                    <div className="absolute -top-2 -right-2 flex space-x-1">
                      <button onClick={() => handleEditCategory(i)} className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDeleteCategory(i)} className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                  
                  {isEditingTemplates && (
                    <button 
                      onClick={() => handleAddField(i)}
                      className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-emerald-500 text-white text-[10px] font-bold rounded-full shadow-lg z-10"
                    >
                      + মাপ যোগ
                    </button>
                  )}
                  
                  {isEditingTemplates && cat.fields.length > 0 && (
                    <div className="mt-2 p-2 bg-zinc-100 rounded-xl space-y-1 max-h-[100px] overflow-y-auto">
                      {cat.fields.map((field, fi) => (
                        <div key={fi} className="flex items-center justify-between text-[10px] font-bold text-zinc-500">
                          <span className="truncate mr-2">{field.label}</span>
                          <div className="flex items-center space-x-2 shrink-0">
                            <button 
                              onClick={() => handleToggleFieldOptional(i, fi)} 
                              className={`p-1 ${field.isOptional ? 'text-amber-400' : 'text-zinc-300'}`}
                              title={field.isOptional ? "ঐচ্ছিক" : "আবশ্যিক"}
                            >
                              <Star size={10} fill={field.isOptional ? "currentColor" : "none"} />
                            </button>
                            <button onClick={() => handleEditFieldLabel(i, fi)} className="text-blue-500 p-1">
                              <Edit2 size={10} />
                            </button>
                            <button onClick={() => handleRemoveField(i, fi)} className="text-rose-500 p-1">
                              <Trash2 size={10} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <button
              onClick={handleAddCategory}
              className="w-full py-4 mt-4 border-2 border-dashed border-zinc-300 rounded-2xl flex items-center justify-center space-x-2 text-zinc-500 font-bold hover:border-[#6C3EF4] hover:text-[#6C3EF4] hover:bg-indigo-50 transition-all"
            >
              <Plus size={20} />
              <span>নতুন ক্যাটাগরি যোগ করুন</span>
            </button>
          </div>
        )}

        {step === 'customer' && (
          <form onSubmit={handleSaveCustomer} className="space-y-6">
            <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 flex items-center justify-between">
              <span className="text-sm font-bold text-indigo-900">কাস্টমার আইডি</span>
              <span className="text-lg font-black text-[#6C3EF4]">#{nextCustomerId}</span>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center">
                  <User size={14} className="mr-1" /> নাম
                </label>
                <input 
                  autoFocus
                  type="text" 
                  required
                  value={customerData.name}
                  onChange={(e) => setCustomerData({...customerData, name: e.target.value})}
                  placeholder="কাস্টমারের নাম লিখুন"
                  className="w-full bg-zinc-50 border-none rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-[#6C3EF4]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center">
                  <Phone size={14} className="mr-1" /> ফোন নম্বর
                </label>
                <input 
                  type="tel" 
                  required
                  value={customerData.phone}
                  onChange={(e) => setCustomerData({...customerData, phone: e.target.value})}
                  placeholder="ফোন নম্বর লিখুন"
                  className="w-full bg-zinc-50 border-none rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-[#6C3EF4]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center">
                  <MapPin size={14} className="mr-1" /> ঠিকানা
                </label>
                <textarea 
                  value={customerData.address}
                  onChange={(e) => setCustomerData({...customerData, address: e.target.value})}
                  placeholder="ঠিকানা লিখুন"
                  rows={3}
                  className="w-full bg-zinc-50 border-none rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-[#6C3EF4] resize-none"
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-[#6C3EF4] text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-100 flex items-center justify-center space-x-2"
            >
              <span>পরবর্তী ধাপ</span>
              <ChevronRight size={20} />
            </button>
          </form>
        )}

        {step === 'measurement' && measurementData && (
          <div className="space-y-6">
            <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
              <p className="text-xs text-zinc-400 uppercase font-bold tracking-wider mb-1">নির্বাচিত পোশাক</p>
              <p className="text-lg font-bold text-zinc-900">{selectedCategory?.name}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {measurementData.fields.map((field, i) => (
                <div key={i} className={`space-y-2 ${field.type === 'radio' ? 'col-span-2' : ''}`}>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-2 flex items-center">
                    {field.label}
                    {!field.isOptional && <span className="text-rose-500 ml-1">*</span>}
                  </label>
                  
                  {(!field.type || field.type === 'text') && (
                    <input 
                      type="text" 
                      inputMode="decimal"
                      value={field.value}
                      onChange={(e) => {
                        const newFields = [...measurementData.fields];
                        newFields[i].value = e.target.value;
                        setMeasurementData({ ...measurementData, fields: newFields });
                      }}
                      placeholder="0.0"
                      className="w-full bg-zinc-50 border-none rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-[#6C3EF4]"
                    />
                  )}

                  {field.type === 'checkbox' && (
                    <button 
                      onClick={() => {
                        const newFields = [...measurementData.fields];
                        newFields[i].value = !field.value;
                        setMeasurementData({ ...measurementData, fields: newFields });
                      }}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${field.value ? 'bg-indigo-50 border-[#6C3EF4] text-[#6C3EF4]' : 'bg-zinc-50 border-transparent text-zinc-500'}`}
                    >
                      <span className="text-sm font-bold">{field.value ? 'হ্যাঁ' : 'না'}</span>
                      {field.value ? <CheckSquare size={20} /> : <div className="w-5 h-5 border-2 border-zinc-300 rounded-md" />}
                    </button>
                  )}

                  {field.type === 'count' && (
                    <div className="flex items-center space-x-3 bg-zinc-50 rounded-2xl p-2">
                      <button 
                        onClick={() => {
                          const newFields = [...measurementData.fields];
                          newFields[i].value = Math.max(0, (field.value || 0) - 1);
                          setMeasurementData({ ...measurementData, fields: newFields });
                        }}
                        className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-zinc-400 active:scale-90 transition-transform"
                      >
                        <Minus size={18} />
                      </button>
                      <span className="flex-1 text-center font-bold text-lg">{field.value || 0}</span>
                      <button 
                        onClick={() => {
                          const newFields = [...measurementData.fields];
                          newFields[i].value = (field.value || 0) + 1;
                          setMeasurementData({ ...measurementData, fields: newFields });
                        }}
                        className="w-10 h-10 rounded-xl bg-[#6C3EF4] text-white shadow-lg shadow-indigo-100 flex items-center justify-center active:scale-90 transition-transform"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  )}

                  {field.type === 'radio' && field.options && (
                    <div className="grid grid-cols-2 gap-2">
                      {field.options.map((opt) => (
                        <button 
                          key={opt}
                          onClick={() => {
                            const newFields = [...measurementData.fields];
                            newFields[i].value = opt;
                            setMeasurementData({ ...measurementData, fields: newFields });
                          }}
                          className={`flex items-center space-x-3 p-4 rounded-2xl border transition-all ${field.value === opt ? 'bg-indigo-50 border-[#6C3EF4] text-[#6C3EF4]' : 'bg-zinc-50 border-transparent text-zinc-500'}`}
                        >
                          {field.value === opt ? <CircleDot size={18} /> : <Circle size={18} />}
                          <span className="text-sm font-bold">{opt}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Notes */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-zinc-100 mb-8">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">বিশেষ নোট</label>
              <textarea 
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value)}
                placeholder="বিশেষ কোনো নির্দেশনা থাকলে লিখুন..."
                rows={3}
                className="w-full bg-zinc-50 border-none rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-[#6C3EF4] resize-none"
              />
            </div>

            {error && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-medium">
                {error}
              </div>
            )}

            <button 
              onClick={handleFinalSave}
              className="w-full bg-[#6C3EF4] text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-100 flex items-center justify-center space-x-2"
            >
              <Save size={20} />
              <span>মাপ সেভ করুন</span>
            </button>
          </div>
        )}

        {/* Custom Prompt/Confirm Modal */}
        <AnimatePresence>
          {fieldSelector && (
            <div className="fixed inset-0 z-[300] flex items-end justify-center bg-black/50 backdrop-blur-sm p-4">
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                className="bg-white w-full max-w-md rounded-[32px] p-8 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold">মাপের নাম নির্বাচন করুন</h2>
                    <p className="text-xs text-zinc-400 mt-1">প্রয়োজনীয় মাপগুলো সিলেক্ট করুন</p>
                  </div>
                  <button onClick={() => setFieldSelector(null)} className="text-zinc-400">
                    <X size={24} />
                  </button>
                </div>

                <div className="relative mb-6">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <input 
                    type="text"
                    placeholder="মাপ খুঁজুন..."
                    value={fieldSearch}
                    onChange={(e) => setFieldSearch(e.target.value)}
                    className="w-full bg-zinc-50 border-none rounded-2xl py-4 pl-12 pr-6 text-sm focus:ring-2 focus:ring-[#6C3EF4]"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3 mb-6 overflow-y-auto pr-2">
                  {COMMON_FIELDS.filter(f => f.label.includes(fieldSearch)).map((field) => {
                    const isSelected = selectedFields.includes(field.label);
                    return (
                      <button 
                        key={field.label}
                        onClick={() => toggleFieldSelection(field.label)}
                        className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all space-y-2 relative ${
                          isSelected 
                            ? 'bg-indigo-50 border-[#6C3EF4] text-[#6C3EF4]' 
                            : 'bg-white border-zinc-100 text-zinc-500'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#6C3EF4] text-white flex items-center justify-center">
                            <Check size={10} />
                          </div>
                        )}
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSelected ? 'bg-white shadow-sm' : 'bg-zinc-50'}`}>
                          {field.icon}
                        </div>
                        <span className="text-[10px] font-bold">{field.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex space-x-3 mt-auto">
                  <button 
                    onClick={handleAddCustomField}
                    className="flex-1 p-4 bg-white border-2 border-dashed border-zinc-200 rounded-2xl text-xs font-bold text-zinc-400 hover:border-[#6C3EF4] hover:text-[#6C3EF4] transition-all"
                  >
                    + কাস্টম মাপ
                  </button>
                  <button 
                    onClick={handleConfirmFields}
                    className="flex-1 p-4 bg-[#6C3EF4] text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-100"
                  >
                    সম্পন্ন
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {customFieldModal && (
            <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white w-full max-w-sm rounded-[40px] p-8 shadow-2xl border border-zinc-100"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-zinc-900">নতুন মাপ তৈরি করুন</h3>
                  <button onClick={() => setCustomFieldModal(null)} className="text-zinc-400 p-1">
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleCreateCustomField} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-2">মাপের নাম</label>
                    <input 
                      name="label"
                      type="text"
                      required
                      placeholder="যেমন: কলার, পকেট"
                      className="w-full bg-zinc-50 border-none rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-[#6C3EF4] transition-all"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-2">ইনপুট টাইপ</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'text', label: 'Text', icon: <Type size={18} /> },
                        { id: 'checkbox', label: 'Check', icon: <CheckSquare size={18} /> },
                        { id: 'radio', label: 'Radio', icon: <CircleDot size={18} /> },
                        { id: 'count', label: 'Count', icon: <Hash size={18} /> }
                      ].map((type) => (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setCustomFieldModal({ ...customFieldModal, selectedType: type.id as FieldType })}
                          className={`flex items-center space-x-3 p-3 rounded-2xl border transition-all ${
                            customFieldModal.selectedType === type.id 
                              ? 'bg-indigo-50 border-[#6C3EF4] text-[#6C3EF4]' 
                              : 'bg-zinc-50 border-transparent text-zinc-500'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${customFieldModal.selectedType === type.id ? 'bg-white shadow-sm' : 'bg-zinc-100'}`}>
                            {type.icon}
                          </div>
                          <span className="text-xs font-bold">{type.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <AnimatePresence>
                    {customFieldModal.selectedType === 'radio' && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2 overflow-hidden"
                      >
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-2">অপশনগুলো (কমা দিয়ে লিখুন)</label>
                        <input 
                          name="options"
                          type="text"
                          required
                          placeholder="যেমন: গোল, ভি, কলার"
                          className="w-full bg-zinc-50 border-none rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-[#6C3EF4] transition-all"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex space-x-3 pt-4">
                    <button 
                      type="button"
                      onClick={() => setCustomFieldModal(null)}
                      className="flex-1 py-4 rounded-2xl text-sm font-bold text-zinc-400 bg-zinc-50 active:scale-95 transition-transform"
                    >
                      বাতিল
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 py-4 rounded-2xl text-sm font-bold text-white bg-[#6C3EF4] shadow-lg shadow-indigo-100 active:scale-95 transition-transform"
                    >
                      তৈরি করুন
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}

          {modalConfig && (
            <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white w-full max-w-xs rounded-3xl p-6 shadow-2xl"
              >
                <h3 className="text-lg font-bold mb-4">{modalConfig.title}</h3>
                
                {modalConfig.type === 'prompt' ? (
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const val = (e.currentTarget.elements.namedItem('promptValue') as HTMLInputElement).value;
                    modalConfig.onConfirm(val);
                  }}>
                    <input 
                      autoFocus
                      name="promptValue"
                      type="text"
                      defaultValue={modalConfig.initialValue}
                      className="w-full bg-zinc-50 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#6C3EF4] mb-6"
                    />
                    <div className="flex space-x-3">
                      <button 
                        type="button"
                        onClick={() => setModalConfig(null)}
                        className="flex-1 py-3 rounded-xl text-sm font-bold text-zinc-400 bg-zinc-50"
                      >
                        বাতিল
                      </button>
                      <button 
                        type="submit"
                        className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-[#6C3EF4]"
                      >
                        ঠিক আছে
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex space-x-3">
                    <button 
                      onClick={() => setModalConfig(null)}
                      className="flex-1 py-3 rounded-xl text-sm font-bold text-zinc-400 bg-zinc-50"
                    >
                      না
                    </button>
                    <button 
                      onClick={() => modalConfig.onConfirm('')}
                      className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-rose-500"
                    >
                      হ্যাঁ
                    </button>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
