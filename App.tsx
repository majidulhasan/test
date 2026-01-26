
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, Plus, Settings, Home, Eye, EyeOff, Edit, Trash2, 
  ChevronRight, Download, Upload, Trash, X, Copy, CheckCircle2,
  ShieldCheck, RotateCw, Info, Lock
} from 'lucide-react';
import { Category, PasswordEntry, AppState, SecurityQuestion } from './types';
import { fuzzySearch } from './utils/search';

// Components
import PasswordCard from './components/PasswordCard';
import AddEditPasswordModal from './components/AddEditPasswordModal';
import SettingsModal from './components/SettingsModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import LockScreen from './components/LockScreen';
import AddCategoryModal from './components/AddCategoryModal';
import DeveloperModal from './components/DeveloperModal';

const App: React.FC = () => {
  // State
  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [customColors, setCustomColors] = useState<string[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [masterPassword, setMasterPassword] = useState<string | undefined>(undefined);
  const [pinLength, setPinLength] = useState<number>(4);
  const [securityQuestions, setSecurityQuestions] = useState<SecurityQuestion[]>([]);
  const [autoLockSeconds, setAutoLockSeconds] = useState(300);
  const [lockOnExit, setLockOnExit] = useState(true);
  const [activeTab, setActiveTab] = useState<'home' | 'settings'>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');
  
  // UI states
  const [isLocked, setIsLocked] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDeveloperModalOpen, setIsDeveloperModalOpen] = useState(false);
  const [editingPassword, setEditingPassword] = useState<PasswordEntry | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const lastActivityRef = useRef<number>(Date.now());

  // Persistence
  useEffect(() => {
    const savedData = localStorage.getItem('passnest_data');
    if (savedData) {
      try {
        const parsed: AppState = JSON.parse(savedData);
        setPasswords(parsed.passwords || []);
        setCategories(parsed.categories || []);
        setCustomColors(parsed.customColors || []);
        setIsDarkMode(parsed.isDarkMode || false);
        setMasterPassword(parsed.masterPassword);
        setPinLength(parsed.pinLength || 4);
        setSecurityQuestions(parsed.securityQuestions || []);
        const savedSecs = (parsed as any).autoLockMinutes !== undefined 
          ? (parsed as any).autoLockMinutes * 60 
          : (parsed.autoLockSeconds ?? 300);
        setAutoLockSeconds(savedSecs);
        setLockOnExit(parsed.lockOnExit ?? true);
      } catch (e) {
        console.error("Failed to parse saved data", e);
      }
    }
  }, []);

  useEffect(() => {
    const data: AppState = { passwords, categories, customColors, isDarkMode, masterPassword, pinLength, autoLockSeconds, lockOnExit, securityQuestions };
    localStorage.setItem('passnest_data', JSON.stringify(data));
    
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [passwords, categories, customColors, isDarkMode, masterPassword, pinLength, autoLockSeconds, lockOnExit, securityQuestions]);

  // Activity Tracking
  useEffect(() => {
    const updateActivity = () => {
      lastActivityRef.current = Date.now();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && lockOnExit && !isLocked && masterPassword) {
        setIsLocked(true);
      }
    };

    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('click', updateActivity);
    window.addEventListener('scroll', updateActivity);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const checkInactivity = setInterval(() => {
      if (!isLocked && masterPassword && autoLockSeconds > 0) {
        const inactiveTimeSecs = (Date.now() - lastActivityRef.current) / 1000;
        if (inactiveTimeSecs >= autoLockSeconds) {
          setIsLocked(true);
        }
      }
    }, 1000);

    return () => {
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('click', updateActivity);
      window.removeEventListener('scroll', updateActivity);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(checkInactivity);
    };
  }, [isLocked, masterPassword, autoLockSeconds, lockOnExit]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleUnlock = (password: string): boolean => {
    if (password === masterPassword) {
      setIsLocked(false);
      lastActivityRef.current = Date.now();
      return true;
    }
    return false;
  };

  const handleSetMasterPassword = (password: string, recoveryQuestions?: SecurityQuestion[]) => {
    setMasterPassword(password);
    setPinLength(password.length);
    if (recoveryQuestions) setSecurityQuestions(recoveryQuestions);
    setIsLocked(false);
    lastActivityRef.current = Date.now();
    showToast('মাস্টার পাসওয়ার্ড সেটআপ সফল হয়েছে!');
  };

  const handleSavePassword = (data: any) => {
    let finalCategoryId = data.categoryId;
    if (data.isCreatingNewCategory && data.newCategoryName.trim()) {
      const newCat: Category = {
        id: Math.random().toString(36).substr(2, 9),
        name: data.newCategoryName.trim(),
        color: data.newCategoryColor || '#3b82f6',
      };
      setCategories(prev => [...prev, newCat]);
      finalCategoryId = newCat.id;
    }

    if (data.id) {
      setPasswords(prev => prev.map(p => p.id === data.id ? {
        ...p,
        categoryId: finalCategoryId,
        title: data.title,
        username: data.username,
        passwordValue: data.passwordValue
      } : p));
      showToast('পাসওয়ার্ড আপডেট করা হয়েছে!');
    } else {
      const newEntry: PasswordEntry = {
        id: Math.random().toString(36).substr(2, 9),
        categoryId: finalCategoryId,
        title: data.title,
        username: data.username,
        passwordValue: data.passwordValue,
        createdAt: Date.now(),
      };
      setPasswords(prev => [newEntry, ...prev]);
      showToast('পাসওয়ার্ড সফলভাবে যোগ করা হয়েছে!');
    }
    setIsAddModalOpen(false);
    setEditingPassword(null);
  };

  const handleDeletePassword = (id: string) => {
    setPasswords(prev => prev.filter(p => p.id !== id));
    setDeletingId(null);
    showToast('পাসওয়ার্ড মুছে ফেলা হয়েছে', 'error');
  };

  const handleAddCategory = (name: string, color: string) => {
    const newCat: Category = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      color,
    };
    setCategories(prev => [...prev, newCat]);
    setIsAddCategoryModalOpen(false);
    showToast('নতুন ক্যাটাগরি যোগ করা হয়েছে');
  };

  const handleUpdateCategory = (id: string, newName: string, newColor: string) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, name: newName, color: newColor } : c));
    showToast('ক্যাটাগরি আপডেট করা হয়েছে');
  };

  const handleDeleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    setPasswords(prev => prev.filter(p => p.categoryId !== id));
    if (selectedCategoryId === id) setSelectedCategoryId('all');
    showToast('ক্যাটাগরি এবং এর পাসওয়ার্ডগুলো মুছে ফেলা হয়েছে', 'error');
  };

  const handleAddCustomColor = (color: string) => {
    if (!customColors.includes(color)) {
      setCustomColors(prev => [color, ...prev]);
      showToast('কাস্টম রঙ যোগ করা হয়েছে');
    }
  };

  const handleDeleteCustomColor = (color: string) => {
    setCustomColors(prev => prev.filter(c => c !== color));
    showToast('রঙ মুছে ফেলা হয়েছে', 'error');
  };

  const filteredPasswords = useMemo(() => {
    return passwords.filter(p => {
      const matchesSearch = fuzzySearch(searchQuery, p.title) || fuzzySearch(searchQuery, p.username);
      const matchesCategory = selectedCategoryId === 'all' || p.categoryId === selectedCategoryId;
      return matchesSearch && matchesCategory;
    });
  }, [passwords, searchQuery, selectedCategoryId]);

  if (isLocked) {
    return (
      <LockScreen 
        isDarkMode={isDarkMode} 
        isFirstTime={!masterPassword} 
        onUnlock={handleUnlock} 
        onSetMasterPassword={handleSetMasterPassword}
        savedSecurityQuestions={securityQuestions}
        pinLength={pinLength}
      />
    );
  }

  return (
    <div className={`min-h-screen pb-24 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <header className="bg-blue-600 text-white p-4 shadow-lg sticky top-0 z-40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck size={24} />
          <h1 className="text-xl font-bold truncate pr-4">PassNest By MH {`{Shahin}`}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsLocked(true)} className="p-2 hover:bg-white/10 rounded-full transition-colors active:scale-90"><Lock size={20} /></button>
          <button onClick={() => window.location.reload()} className="p-2 hover:bg-white/10 rounded-full transition-colors"><RotateCw size={20} /></button>
        </div>
      </header>

      <div className="bg-blue-600 text-white pb-12 pt-4 px-6 rounded-b-[2.5rem] shadow-xl text-center">
        <h2 className="text-2xl font-extrabold mb-1">PassNest By MH {`{Shahin}`}</h2>
        <p className="opacity-80 text-sm font-medium">সম্পূর্ণ অফলাইন এবং নিরাপদ পাসওয়ার্ড ম্যানেজার</p>
      </div>

      <main className="p-4 max-w-2xl mx-auto -mt-8 relative z-20">
        <div className="relative mb-6 transition-all duration-300 transform focus-within:scale-[1.02] focus-within:z-30">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
          <input 
            type="text" 
            className={`w-full py-4 pl-12 pr-4 rounded-2xl border-none shadow-xl outline-none transition-all duration-300 ${isDarkMode ? 'bg-gray-800 focus:bg-gray-700' : 'bg-white focus:shadow-2xl focus:shadow-blue-500/10'}`} 
            placeholder="অ্যাপ বা ওয়েবসাইট খুঁজুন..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
          />
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4">
          <button onClick={() => setSelectedCategoryId('all')} className={`px-6 py-2.5 rounded-xl font-bold whitespace-nowrap transition-all shadow-sm ${selectedCategoryId === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 dark:bg-gray-800'}`}>All</button>
          {categories.map(cat => (
            <button key={cat.id} onClick={() => setSelectedCategoryId(cat.id)} className={`px-6 py-2.5 rounded-xl font-bold transition-all shadow-sm whitespace-nowrap active:scale-95 flex items-center gap-2 ${selectedCategoryId === cat.id ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 dark:bg-gray-800'}`}>
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />{cat.name}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filteredPasswords.length > 0 ? (
            filteredPasswords.map(pw => {
              const category = categories.find(c => c.id === pw.categoryId);
              return <PasswordCard key={pw.id} password={pw} isDarkMode={isDarkMode} categoryColor={category?.color} categoryName={category?.name} onEdit={() => setEditingPassword(pw)} onDelete={() => setDeletingId(pw.id)} onCopy={() => showToast('কপি করা হয়েছে!')} />;
            })
          ) : (
            <div className="text-center py-20 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800 text-gray-400">
              <ShieldCheck size={48} className="mx-auto mb-4 opacity-50" />
              <p className="font-medium">কোনো পাসওয়ার্ড পাওয়া যায়নি</p>
            </div>
          )}
        </div>
      </main>

      <button onClick={() => setIsAddModalOpen(true)} className="fixed bottom-24 right-6 w-16 h-16 bg-blue-600 text-white rounded-2xl shadow-2xl flex items-center justify-center active:scale-90 transition-all z-30"><Plus size={32} /></button>

      <nav className={`fixed bottom-0 left-0 right-0 h-20 flex justify-around items-center border-t backdrop-blur-md z-40 px-6 ${isDarkMode ? 'bg-gray-900/80 border-gray-800' : 'bg-white/80 border-gray-100'}`}>
        <button onClick={() => {setActiveTab('home'); setIsSettingsOpen(false)}} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'home' && !isSettingsOpen ? 'text-blue-600 scale-110' : 'text-gray-400'}`}><Home size={26} /><span className="text-[10px] font-bold uppercase tracking-wider">Home</span></button>
        <button onClick={() => {setIsSettingsOpen(true); setActiveTab('settings')}} className={`flex flex-col items-center gap-1 transition-all ${isSettingsOpen ? 'text-blue-600 scale-110' : 'text-gray-400'}`}><Settings size={26} /><span className="text-[10px] font-bold uppercase tracking-wider">Settings</span></button>
      </nav>

      <AddEditPasswordModal 
        isOpen={isAddModalOpen || editingPassword !== null} 
        onClose={() => { setIsAddModalOpen(false); setEditingPassword(null); }} 
        onSave={handleSavePassword} 
        onAddCategoryClick={() => setIsAddCategoryModalOpen(true)} 
        initialData={editingPassword} 
        defaultCategoryId={selectedCategoryId}
        categories={categories}
        customColors={customColors}
        isDarkMode={isDarkMode} 
      />
      <AddCategoryModal isOpen={isAddCategoryModalOpen} onClose={() => setIsAddCategoryModalOpen(false)} onSave={handleAddCategory} customColors={customColors} isDarkMode={isDarkMode} />
      <DeleteConfirmModal isOpen={deletingId !== null} title={passwords.find(p => p.id === deletingId)?.title || ''} onClose={() => setDeletingId(null)} onConfirm={() => deletingId && handleDeletePassword(deletingId)} isDarkMode={isDarkMode} />
      
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        isDarkMode={isDarkMode} 
        setIsDarkMode={setIsDarkMode} 
        categories={categories} 
        customColors={customColors}
        onAddCategory={handleAddCategory} 
        onUpdateCategory={handleUpdateCategory} 
        onDeleteCategory={handleDeleteCategory}
        onAddCustomColor={handleAddCustomColor}
        onDeleteCustomColor={handleDeleteCustomColor}
        onReorderCategories={(cats) => setCategories(cats)}
        autoLockSeconds={autoLockSeconds} 
        setAutoLockSeconds={setAutoLockSeconds} 
        lockOnExit={lockOnExit}
        setLockOnExit={setLockOnExit}
        pinLength={pinLength}
        setPinLength={setPinLength}
        onSetMasterPassword={handleSetMasterPassword} 
        securityQuestions={securityQuestions} 
        onExportData={() => { const data = JSON.stringify({ passwords, categories, customColors, masterPassword, pinLength, autoLockSeconds, lockOnExit, securityQuestions }); const blob = new Blob([data], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `PassNest_Backup.json`; a.click(); }} 
        onImportData={(json) => { try { const p = JSON.parse(json); if(p.passwords) setPasswords(p.passwords); if(p.categories) setCategories(p.categories); if(p.customColors) setCustomColors(p.customColors); if(p.pinLength) setPinLength(p.pinLength); showToast('তথ্য রিস্টোর করা হয়েছে!'); } catch(e) { showToast('ভুল ফাইল', 'error'); } }} 
        onDeleteAll={() => { localStorage.clear(); window.location.reload(); }}
        onOpenDeveloper={() => setIsDeveloperModalOpen(true)}
      />

      <DeveloperModal isOpen={isDeveloperModalOpen} onClose={() => setIsDeveloperModalOpen(false)} isDarkMode={isDarkMode} />
      
      {toast && (
        <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[150] px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 animate-bounce ${toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'}`}>
          {toast.type === 'error' ? <Info size={18} /> : <CheckCircle2 size={18} />}
          <span className="font-bold text-sm">{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default App;
