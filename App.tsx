
import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, History as HistoryIcon, Settings as SettingsIcon, 
  Moon, Sun, Lock, Download, Upload, User
} from 'lucide-react';
import { storage } from './services/storage.ts';
import { Transaction, Loan, StorageData, ThemeColor } from './types.ts';

// Components
import { DeleteConfirmModal } from './components/DeleteConfirmModal.tsx';
import { DeveloperModal } from './components/DeveloperModal.tsx';
import { LockScreen } from './components/LockScreen.tsx';
import { Modal } from './components/Modal.tsx';
import { AddEditPassword } from './AddEditPassword.tsx';

type ActiveTab = 'dashboard' | 'history' | 'settings';

const THEME_MAP: Record<ThemeColor, string> = {
  indigo: 'text-indigo-600 dark:text-indigo-400',
  emerald: 'text-emerald-600 dark:text-emerald-400',
  rose: 'text-rose-600 dark:text-rose-400',
  amber: 'text-amber-600 dark:text-amber-400',
  custom: 'text-[var(--theme-color)]',
};

const THEME_GRADIENT: Record<ThemeColor, string> = {
  indigo: 'from-indigo-600 to-violet-700',
  emerald: 'from-emerald-600 to-teal-700',
  rose: 'from-rose-600 to-pink-700',
  amber: 'from-amber-600 to-orange-700',
  custom: 'from-[var(--theme-color)] to-black/30',
};

const translations: any = {
  bn: {
    appTitle: 'আমার খাতা',
    diaryTitle: 'আমার ডিজিটাল ডায়েরি',
    home: 'হোম',
    history: 'হিসাব',
    settings: 'সেটিং',
    currentBalance: 'বর্তমান ব্যালেন্স',
    devProfile: 'ডেভেলপার পরিচিতি',
    backup: 'ব্যাকআপ ডাউনলোড',
    restore: 'ব্যাকআপ রিস্টোর',
    devName: 'মো: মাজিদুল হাসান {শাহীন}',
    close: 'বন্ধ করুন',
    confirmDelete: 'আপনি কি নিশ্চিত?',
    deleteBtn: 'হ্যাঁ, ডিলেট করুন',
    cancelBtn: 'না, থাক',
    security: 'নিরাপত্তা (পাসওয়ার্ড)',
    setPass: 'পাসওয়ার্ড সেট করুন',
  }
};

export default function App() {
  const [data, setData] = useState<StorageData>(storage.getData());
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(data.settings.theme === 'dark');
  const [isLocked, setIsLocked] = useState(data.settings.securityEnabled && !!data.settings.password);
  const [showDevModal, setShowDevModal] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);

  const lang = data.settings.language || 'bn';
  const t = (key: string) => translations[lang][key] || key;
  const currentTheme = data.settings.themeColor;

  useEffect(() => {
    storage.saveData(data);
    const root = window.document.documentElement;
    isDarkMode ? root.classList.add('dark') : root.classList.remove('dark');
  }, [data, isDarkMode]);

  const totals = useMemo(() => {
    const income = data.khata.transactions.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
    const expense = data.khata.transactions.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);
    return { balance: income - expense };
  }, [data.khata.transactions]);

  if (isLocked) {
    return <LockScreen correctPassword={data.settings.password} onUnlock={() => setIsLocked(false)} />;
  }

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${isDarkMode ? 'dark bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      <header className="px-6 py-5 flex justify-between items-center bg-white dark:bg-gray-800 border-b dark:border-gray-700 sticky top-0 z-40">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">{t('diaryTitle')}</p>
          <h1 className="text-xl font-extrabold">{t('appTitle')}</h1>
        </div>
        <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2.5 rounded-2xl bg-gray-100 dark:bg-gray-700">
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full px-5 py-6 space-y-8 pb-32">
        {activeTab === 'dashboard' && (
          <div className={`bg-gradient-to-br ${THEME_GRADIENT[currentTheme]} rounded-[2.5rem] p-10 text-white shadow-2xl`}>
            <p className="text-white/70 text-[10px] font-black uppercase tracking-widest mb-2">{t('currentBalance')}</p>
            <h2 className="text-5xl font-black">৳ {totals.balance.toLocaleString('bn-BD')}</h2>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-4">
            <SettingsItem icon={<User size={18} />} label={t('devProfile')} onClick={() => setShowDevModal(true)} />
            <SettingsItem icon={<Lock size={18} />} label={t('security')} badge={data.settings.securityEnabled ? 'ON' : 'OFF'} onClick={() => setShowPassModal(true)} />
            <SettingsItem icon={<Download size={18} />} label={t('backup')} onClick={() => storage.exportToJSON()} />
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t dark:border-gray-700 px-2 py-3 pb-6 flex justify-around items-center z-40">
        <NavItem icon={<LayoutDashboard size={20} />} label={t('home')} active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
        <NavItem icon={<HistoryIcon size={20} />} label={t('history')} active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
        <NavItem icon={<SettingsIcon size={20} />} label={t('settings')} active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
      </nav>

      {showDevModal && <DeveloperModal t={t} onClose={() => setShowDevModal(false)} />}
      <Modal isOpen={showPassModal} onClose={() => setShowPassModal(false)} title={t('setPass')}>
        <AddEditPassword onSave={(pass: string) => {
          setData(prev => ({ ...prev, settings: { ...prev.settings, password: pass, securityEnabled: true } }));
          setShowPassModal(false);
        }} />
      </Modal>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: any) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 ${active ? 'text-indigo-600' : 'text-gray-400 opacity-60'}`}>
      {icon}
      <span className="text-[10px] font-bold">{label}</span>
    </button>
  );
}

function SettingsItem({ icon, label, onClick, badge }: any) {
  return (
    <button onClick={onClick} className="w-full p-5 flex items-center gap-4 bg-white dark:bg-gray-800 rounded-3xl border dark:border-gray-700 text-left active:scale-[0.98] transition-all">
      <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-xl">{icon}</div>
      <span className="font-bold text-sm flex-1">{label}</span>
      {badge && <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${badge === 'ON' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>{badge}</span>}
    </button>
  );
}
