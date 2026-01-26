
import React, { useState, useEffect, useRef } from 'react';
import { 
  X, ChevronRight, Edit, Trash2, Plus, Download, Upload, Trash, 
  User, Heart, ShieldAlert, Github, Facebook, Lock, Clock, 
  HelpCircle, ArrowUp, ArrowDown, AlertTriangle, Palette, 
  ExternalLink, Key, ShieldCheck, Power
} from 'lucide-react';
import { Category, SecurityQuestion } from '../types';

const PRESET_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1', '#06b6d4'
];

const AUTO_LOCK_PRESETS = [
  { label: '৩০ সে.', value: 30 },
  { label: '১ মি.', value: 60 },
  { label: '২ মি.', value: 120 },
  { label: '৫ মি.', value: 300 },
  { label: 'বন্ধ', value: 0 },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  categories: Category[];
  customColors: string[];
  onAddCategory: (name: string, color: string) => void;
  onUpdateCategory: (id: string, name: string, color: string) => void;
  onDeleteCategory: (id: string) => void;
  onAddCustomColor: (color: string) => void;
  onDeleteCustomColor: (color: string) => void;
  onReorderCategories: (newCategories: Category[]) => void;
  autoLockSeconds: number;
  setAutoLockSeconds: (val: number) => void;
  lockOnExit: boolean;
  setLockOnExit: (val: boolean) => void;
  pinLength: number;
  setPinLength: (val: number) => void;
  onSetMasterPassword: (password: string, recoveryQuestions?: SecurityQuestion[]) => void;
  securityQuestions: SecurityQuestion[];
  onExportData: () => void;
  onImportData: (json: string) => void;
  onDeleteAll: () => void;
  onOpenDeveloper: () => void;
}

const SettingsModal: React.FC<Props> = ({ 
  isOpen, onClose, isDarkMode, setIsDarkMode, categories, customColors,
  onAddCategory, onUpdateCategory, onDeleteCategory, onAddCustomColor, onDeleteCustomColor, onReorderCategories,
  autoLockSeconds, setAutoLockSeconds, lockOnExit, setLockOnExit, pinLength, setPinLength, onSetMasterPassword,
  securityQuestions,
  onExportData, onImportData, onDeleteAll, onOpenDeveloper
}) => {
  // Modal states
  const [showPwChange, setShowPwChange] = useState(false);
  const [newMasterPw, setNewMasterPw] = useState('');
  const [newSetupQuestions, setNewSetupQuestions] = useState<SecurityQuestion[]>([]);
  const [showCustomLockInput, setShowCustomLockInput] = useState(false);
  const [tempPinLength, setTempPinLength] = useState<number>(pinLength);
  
  useEffect(() => {
    if (securityQuestions && securityQuestions.length > 0) {
      setNewSetupQuestions([...securityQuestions]);
    } else {
      setNewSetupQuestions([
        { question: 'আপনার প্রিয় রঙের নাম কি?', answer: '' },
        { question: 'আপনার প্রথম স্কুলের নাম কি?', answer: '' }
      ]);
    }
  }, [securityQuestions, showPwChange]);

  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState(PRESET_COLORS[0]);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingCatName, setEditingCatName] = useState('');
  const [editingCatColor, setEditingCatColor] = useState(PRESET_COLORS[0]);
  
  const [customColorPicker, setCustomColorPicker] = useState('#ff0000');
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [deleteCountdown, setDeleteCountdown] = useState(5);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (showDeleteAllConfirm) {
      setDeleteCountdown(5);
      timerRef.current = window.setInterval(() => {
        setDeleteCountdown(prev => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [showDeleteAllConfirm]);

  const moveCategory = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= categories.length) return;
    const newCats = [...categories];
    const temp = newCats[index];
    newCats[index] = newCats[newIdx];
    newCats[newIdx] = temp;
    onReorderCategories(newCats);
  };

  const handlePasswordUpdate = () => {
    if (newMasterPw.length !== tempPinLength) {
      alert(`পাসওয়ার্ড ঠিক ${tempPinLength} অক্ষরের হতে হবে`);
      return;
    }
    if (newSetupQuestions.some(q => !q.answer.trim())) {
      alert('রিকভারি প্রশ্নের উত্তর দিন।');
      return;
    }
    setPinLength(tempPinLength);
    onSetMasterPassword(newMasterPw, newSetupQuestions);
    setShowPwChange(false);
    setNewMasterPw('');
    alert('মাস্টার পাসওয়ার্ড সফলভাবে আপডেট করা হয়েছে।');
  };

  const updateCustomTime = (min: number, sec: number) => {
    const total = (min * 60) + sec;
    setAutoLockSeconds(total);
  };

  const isCurrentValuePreset = AUTO_LOCK_PRESETS.some(p => p.value === autoLockSeconds);

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex flex-col transition-all duration-300 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className="bg-blue-600 text-white p-6 flex items-center justify-between shadow-xl sticky top-0 z-30">
        <div>
          <h2 className="text-2xl font-black tracking-tight">সেটিংস</h2>
          <p className="text-xs opacity-80 font-bold uppercase tracking-widest">PassNest By MH {`{Shahin}`}</p>
        </div>
        <button onClick={onClose} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all active:scale-90">
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 max-w-2xl mx-auto w-full no-scrollbar pb-12">
        
        {/* Appearance Section */}
        <div className={`p-6 rounded-[2rem] border transition-all ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100 shadow-md'}`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl"><Heart size={20} className="fill-current" /></div>
            <h3 className="font-black text-sm uppercase tracking-widest opacity-60">অ্যাপ ডিসপ্লে</h3>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-black text-lg">ডার্ক মোড</p>
              <p className="text-xs text-gray-400 font-bold">ডার্ক থিম ব্যবহার করুন</p>
            </div>
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)} 
              className={`w-14 h-8 rounded-full transition-all relative ${isDarkMode ? 'bg-blue-600' : 'bg-gray-300'}`}
            >
              <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${isDarkMode ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </div>

        {/* Security Setup */}
        <div className={`p-6 rounded-[2rem] border transition-all ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100 shadow-md'}`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-xl"><ShieldCheck size={20} /></div>
            <h3 className="font-black text-sm uppercase tracking-widest opacity-60">নিরাপত্তা সেটআপ</h3>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800/20">
              <div>
                <p className="font-black text-sm">অ্যাপ থেকে বের হলেই লক</p>
                <p className="text-[10px] text-gray-400 font-bold">মিনিমাইজ করলে সাথে সাথে লক হবে</p>
              </div>
              <button 
                onClick={() => setLockOnExit(!lockOnExit)} 
                className={`w-12 h-6 rounded-full transition-all relative ${lockOnExit ? 'bg-emerald-500' : 'bg-gray-300'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all ${lockOnExit ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="font-black text-lg">ইন-অ্যাপ অটো-লক সময়</p>
                <p className="text-xs text-gray-400 font-bold">কতক্ষণ অলস থাকলে অটোমেটিক লক হবে</p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {AUTO_LOCK_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => {
                      setAutoLockSeconds(preset.value);
                      setShowCustomLockInput(false);
                    }}
                    className={`px-4 py-2.5 rounded-xl font-black text-[10px] transition-all active:scale-95 ${
                      !showCustomLockInput && autoLockSeconds === preset.value
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                        : isDarkMode ? 'bg-gray-900 text-gray-400' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
                <button
                  onClick={() => setShowCustomLockInput(true)}
                  className={`px-4 py-2.5 rounded-xl font-black text-[10px] transition-all active:scale-95 ${
                    showCustomLockInput || !isCurrentValuePreset
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                      : isDarkMode ? 'bg-gray-900 text-gray-400' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  কাস্টম
                </button>
              </div>

              {(showCustomLockInput || !isCurrentValuePreset) && (
                <div className="grid grid-cols-2 gap-3 bg-blue-50 dark:bg-blue-900/10 p-5 rounded-[2rem] border border-blue-100 dark:border-blue-900/30">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-blue-600 mb-1">মিনিট</p>
                    <input 
                      type="number" 
                      className="w-full bg-white dark:bg-gray-800 p-3 rounded-xl outline-none font-black text-xl text-center shadow-sm" 
                      value={Math.floor(autoLockSeconds / 60)} 
                      onChange={(e) => updateCustomTime(Math.max(0, parseInt(e.target.value) || 0), autoLockSeconds % 60)}
                      min="0"
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-blue-600 mb-1">সেকেন্ড</p>
                    <input 
                      type="number" 
                      className="w-full bg-white dark:bg-gray-800 p-3 rounded-xl outline-none font-black text-xl text-center shadow-sm" 
                      value={autoLockSeconds % 60} 
                      onChange={(e) => updateCustomTime(Math.floor(autoLockSeconds / 60), Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                      min="0"
                      max="59"
                    />
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={() => { setTempPinLength(pinLength); setShowPwChange(true); }}
              className="w-full p-5 bg-amber-500/10 text-amber-600 rounded-2xl font-black border-2 border-dashed border-amber-500/30 flex items-center justify-between active:scale-[0.98] transition-all"
            >
              <div className="flex items-center gap-3"><Key size={20} /> <span>মাস্টার পাসওয়ার্ড ও রিকভারি</span></div>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Custom Colors Section - Re-added */}
        <div className={`p-6 rounded-[2rem] border transition-all ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100 shadow-md'}`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-pink-100 dark:bg-pink-900/30 text-pink-600 rounded-xl"><Palette size={20} /></div>
            <h3 className="font-black text-sm uppercase tracking-widest opacity-60">কালার কাস্টমাইজেশন</h3>
          </div>
          
          <div className="flex gap-4 items-center mb-6">
            <input 
              type="color" 
              value={customColorPicker} 
              onChange={(e) => setCustomColorPicker(e.target.value)}
              className="w-14 h-14 rounded-2xl cursor-pointer border-none bg-transparent"
            />
            <button 
              onClick={() => onAddCustomColor(customColorPicker)}
              className="flex-1 py-4 bg-pink-600 text-white rounded-2xl font-black shadow-lg shadow-pink-500/20 active:scale-95 transition-all"
            >
              রঙটি সেভ করুন
            </button>
          </div>

          {customColors.length > 0 && (
            <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
              {customColors.map(color => (
                <div key={color} className="relative group">
                  <div className="w-10 h-10 rounded-xl shadow-md border-2 border-white dark:border-gray-600" style={{ backgroundColor: color }} />
                  <button 
                    onClick={() => onDeleteCustomColor(color)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-100 transition-opacity"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Categories Section */}
        <div className={`p-6 rounded-[2rem] border transition-all ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100 shadow-md'}`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-xl"><Edit size={20} /></div>
            <h3 className="font-black text-sm uppercase tracking-widest opacity-60">ক্যাটাগরি ম্যানেজমেন্ট</h3>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex gap-2">
              <input 
                type="text" 
                className={`flex-1 p-4 rounded-2xl border-2 outline-none focus:border-indigo-500 font-black ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-100'}`} 
                placeholder="নাম লিখুন..." 
                value={newCatName} 
                onChange={(e) => setNewCatName(e.target.value)} 
              />
              <button 
                onClick={() => { if(newCatName.trim()) { onAddCategory(newCatName, newCatColor); setNewCatName(''); } }}
                className="p-4 bg-indigo-600 text-white rounded-2xl active:scale-90 transition-all shadow-lg"
              >
                <Plus size={24} />
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2 justify-center">
              {PRESET_COLORS.map(c => (
                <button key={c} onClick={() => setNewCatColor(c)} className={`w-8 h-8 rounded-xl border-4 transition-all ${newCatColor === c ? 'border-indigo-500 scale-110 shadow-lg' : 'border-transparent opacity-50'}`} style={{ backgroundColor: c }} />
              ))}
              {customColors.map(c => (
                <button key={c} onClick={() => setNewCatColor(c)} className={`w-8 h-8 rounded-xl border-4 transition-all ${newCatColor === c ? 'border-indigo-500 scale-110 shadow-lg' : 'border-transparent opacity-50'}`} style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {categories.map((cat, idx) => (
              <div key={cat.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-transparent hover:border-indigo-500/20">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="font-black truncate">{cat.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => { setEditingCatId(cat.id); setEditingCatName(cat.name); setEditingCatColor(cat.color || '#3b82f6'); }} className="p-2 text-blue-500"><Edit size={16} /></button>
                  <button onClick={() => onDeleteCategory(cat.id)} className="p-2 text-red-500"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Backup Section */}
        <div className={`p-6 rounded-[2rem] border transition-all ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100 shadow-md'}`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-xl"><Download size={20} /></div>
            <h3 className="font-black text-sm uppercase tracking-widest opacity-60">ব্যাকআপ ও ডেটা</h3>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <button onClick={onExportData} className="flex items-center justify-between p-5 bg-emerald-600 text-white rounded-2xl font-black shadow-lg active:scale-95 transition-all">
              <div className="flex items-center gap-3"><Download size={20} /> <span>ব্যাকআপ ডাউনলোড</span></div>
              <ChevronRight size={18} />
            </button>
            <label className="flex items-center justify-between p-5 bg-blue-500 text-white rounded-2xl font-black shadow-lg active:scale-95 transition-all cursor-pointer">
              <div className="flex items-center gap-3"><Upload size={20} /> <span>রিস্টোর করুন</span></div>
              <input type="file" className="hidden" accept=".json" onChange={(e) => { const file = e.target.files?.[0]; if(file) { const reader = new FileReader(); reader.onload = (re) => onImportData(re.target?.result as string); reader.readAsText(file); } }} />
              <ChevronRight size={18} />
            </label>
            <button onClick={() => setShowDeleteAllConfirm(true)} className="flex items-center justify-between p-5 bg-red-600 text-white rounded-2xl font-black shadow-lg active:scale-95 transition-all mt-2">
              <div className="flex items-center gap-3"><Trash size={20} /> <span>সব তথ্য মুছে ফেলুন</span></div>
              <Trash size={18} />
            </button>
          </div>
        </div>

        {/* Developer Section */}
        <div className={`p-6 rounded-[2rem] border transition-all ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100 shadow-md'}`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-xl"><User size={20} /></div>
            <h3 className="font-black text-sm uppercase tracking-widest opacity-60">ডেভেলপার পরিচিতি</h3>
          </div>
          
          <div className="space-y-3">
             <button 
                onClick={onOpenDeveloper}
                className="w-full flex items-center justify-between p-5 bg-indigo-600 text-white rounded-2xl font-black shadow-lg active:scale-95 transition-all"
             >
                <div className="flex items-center gap-3"><User size={20} /> <span>ডেভেলপার পরিচিতি</span></div>
                <ChevronRight size={18} />
             </button>
          </div>
        </div>
      </div>

      {/* --- PASSWORD CHANGE MODAL --- */}
      {showPwChange && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md overflow-y-auto">
          <div className={`w-full max-w-sm p-8 rounded-[2.5rem] shadow-2xl animate-modalIn border ${isDarkMode ? 'bg-gray-800 border-amber-500/20 text-white' : 'bg-white text-gray-900'}`}>
            <h3 className="text-2xl font-black mb-8 text-center tracking-tight">মাস্টার পাসওয়ার্ড পরিবর্তন</h3>
            <div className="flex justify-center gap-3 mb-6">
              {[4, 6].map(len => (
                <button key={len} onClick={() => { setTempPinLength(len); setNewMasterPw(''); }} className={`px-6 py-2 rounded-xl font-black text-xs transition-all ${tempPinLength === len ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-200 text-gray-500 dark:bg-gray-900'}`}>{len} সংখ্যা</button>
              ))}
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase text-blue-600 ml-2 tracking-widest">নতুন পাসওয়ার্ড ({tempPinLength} অক্ষর)</label>
                 <input type="password" maxLength={tempPinLength} className={`w-full p-4 rounded-2xl border-2 outline-none focus:border-blue-500 font-black text-center tracking-[0.5em] ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-100'}`} placeholder={"•".repeat(tempPinLength)} value={newMasterPw} onChange={(e) => setNewMasterPw(e.target.value)} autoFocus />
              </div>
            </div>
            <div className="flex flex-col gap-3 mt-8">
              <button onClick={handlePasswordUpdate} disabled={newMasterPw.length !== tempPinLength} className={`w-full py-5 rounded-2xl font-black text-lg shadow-xl transition-all ${newMasterPw.length === tempPinLength ? 'bg-blue-600 text-white shadow-blue-500/20 active:scale-95' : 'bg-gray-300 opacity-50 cursor-not-allowed'}`}>পরিবর্তন করুন</button>
              <button onClick={() => setShowPwChange(false)} className="w-full py-3 text-gray-400 font-black hover:underline transition-all">বাতিল</button>
            </div>
          </div>
        </div>
      )}

      {/* Editing Category Modal */}
      {editingCatId && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
          <div className={`w-full max-w-sm p-8 rounded-[2.5rem] shadow-2xl animate-modalIn ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
            <h4 className="text-2xl font-black mb-8 text-center">ক্যাটাগরি এডিট</h4>
            <div className="space-y-6">
              <div className="space-y-1.5"><label className="text-[10px] font-black uppercase text-blue-600 ml-1 tracking-widest">নতুন নাম</label><input type="text" className={`w-full p-4 rounded-2xl border-2 outline-none focus:border-blue-500 font-black ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-100'}`} value={editingCatName} onChange={(e) => setEditingCatName(e.target.value)} autoFocus /></div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-blue-600 ml-1 block text-center tracking-widest">রঙ নির্বাচন</label>
                <div className="flex flex-wrap gap-2 justify-center">
                  {PRESET_COLORS.map(color => (<button key={color} onClick={() => setEditingCatColor(color)} className={`w-8 h-8 rounded-xl border-4 transition-all ${editingCatColor === color ? 'border-indigo-500 scale-110 shadow-lg' : 'border-transparent opacity-70'}`} style={{ backgroundColor: color }} />))}
                  {customColors.map(color => (<button key={color} onClick={() => setEditingCatColor(color)} className={`w-8 h-8 rounded-xl border-4 transition-all ${editingCatColor === color ? 'border-indigo-500 scale-110 shadow-lg' : 'border-transparent opacity-70'}`} style={{ backgroundColor: color }} />))}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3 mt-8">
              <button onClick={() => { if(editingCatName.trim()) { onUpdateCategory(editingCatId, editingCatName, editingCatColor); setEditingCatId(null); } }} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-500/20 active:scale-95 transition-all">আপডেট করুন</button>
              <button onClick={() => setEditingCatId(null)} className="w-full py-3 text-gray-400 font-black hover:underline transition-all">বাতিল</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete All Confirm */}
      {showDeleteAllConfirm && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
          <div className={`w-full max-w-sm p-8 rounded-[2.5rem] text-center shadow-2xl border ${isDarkMode ? 'bg-gray-800 border-red-500/20 text-white' : 'bg-white text-gray-900'}`}>
            <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl"><AlertTriangle size={40} className="animate-pulse" /></div>
            <h4 className="text-2xl font-black mb-4 text-red-600">সব মুছে ফেলবেন?</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 font-black leading-relaxed px-4">আপনার সব সংরক্ষিত পাসওয়ার্ড চিরতরে মুছে ফেলা হবে।</p>
            <div className="space-y-3">
              <button onClick={() => { if(deleteCountdown === 0) { onDeleteAll(); setShowDeleteAllConfirm(false); } }} disabled={deleteCountdown > 0} className={`w-full py-5 rounded-2xl font-black text-lg transition-all ${deleteCountdown > 0 ? 'bg-gray-200 dark:bg-gray-700 text-gray-400' : 'bg-red-600 text-white shadow-xl shadow-red-500/30 active:scale-95'}`}>{deleteCountdown > 0 ? `অপেক্ষা করুন (${deleteCountdown})` : 'সব ডেটা মুছে দিন'}</button>
              <button onClick={() => setShowDeleteAllConfirm(false)} className="w-full py-3 text-gray-400 font-bold hover:underline transition-all">না, ফিরে যান</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsModal;
