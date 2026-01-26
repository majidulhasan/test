
import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, History, PieChart as ChartIcon, Settings as SettingsIcon, 
  Plus, FileText, Moon, Sun, X, Trash2, Edit2, Download, Upload, 
  TrendingUp, TrendingDown, Bell, Palette, Check, HandCoins, User, 
  Mail, Facebook, Send, Pipette, Languages, ClipboardList, Filter, 
  Calendar, StickyNote, CalendarDays, Layers, CheckCircle2, AlertCircle, 
  CheckCircle, PlusCircle, History as HistoryIcon, RefreshCcw, BookOpen, ListFilter
} from 'lucide-react';
import { storage } from './services/storage.ts';
import { Transaction, Loan, StorageData, TransactionType, LoanType, ThemeColor, Category, LoanStatus, LoanPayment } from './types.ts';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell
} from 'recharts';

type ActiveTab = 'dashboard' | 'history' | 'summary' | 'reports' | 'notes' | 'settings';

const PRESET_COLORS: Record<string, string> = {
  indigo: '#4f46e5',
  emerald: '#10b981',
  rose: '#f43f5e',
  amber: '#f59e0b',
};

const THEME_MAP: Record<ThemeColor, string> = {
  indigo: 'bg-indigo-600 shadow-indigo-200 text-indigo-600 dark:text-indigo-400',
  emerald: 'bg-emerald-600 shadow-emerald-200 text-emerald-600 dark:text-emerald-400',
  rose: 'bg-rose-600 shadow-rose-200 text-rose-600 dark:text-rose-400',
  amber: 'bg-amber-600 shadow-amber-200 text-amber-600 dark:text-amber-400',
  custom: 'bg-[var(--theme-color)] shadow-gray-200 text-[var(--theme-color)] dark:text-[var(--theme-color)]',
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
    summary: 'সংক্ষিপ্ত',
    reports: 'রিপোর্ট',
    settings: 'সেটিং',
    currentBalance: 'বর্তমান ব্যালেন্স',
    totalIncome: 'মোট আয়',
    totalExpense: 'মোট ব্যয়',
    todayIncome: 'আজকের আয়',
    todayExpense: 'আজকের ব্যয়',
    loanGiven: 'পাওনা টাকা',
    loanTaken: 'ধার নেওয়া',
    recentHistory: 'সাম্প্রতিক হিসাব',
    seeAll: 'সব দেখুন',
    language: 'অ্যাপের ভাষা',
    devProfile: 'ডেভেলপার পরিচিতি',
    usageGuide: 'ব্যবহার বিধি',
    backup: 'ব্যাকআপ ডাউনলোড',
    restore: 'ব্যাকআপ রিস্টোর',
    themeColor: 'থিম কালার',
    reminder: 'লোন রিমাইন্ডার',
    save: 'সংরক্ষণ করুন',
    update: 'আপডেট করুন',
    addEntry: 'হিসাব যোগ করুন',
    editEntry: 'হিসাব সংশোধন',
    monthlyNote: 'নোটস',
    devName: 'মো: মাজিদুল হাসান {শাহীন}',
    close: 'বন্ধ করুন',
    monthlySummary: 'মাসিক সারসংক্ষেপ',
    balance: 'অবশিষ্ট',
    netBalance: 'নিট ব্যালেন্স',
    weekly: 'সাপ্তাহিক',
    monthly: 'মাসিক',
    yearly: 'বাৎসরিক',
    customRange: 'কাস্টম',
    category: 'ক্যাটাগরি',
    manageCategories: 'ক্যাটাগরি ম্যানেজ',
    startDate: 'শুরুর তারিখ',
    endDate: 'শেষ তারিখ',
    allCategories: 'সব ক্যাটাগরি',
    stats: 'পরিসংখ্যান',
    finance: 'আয়-ব্যয়',
    loans: 'লেনদেন',
    netLoan: 'নিট ঋণ',
    confirmDelete: 'আপনি কি নিশ্চিত?',
    deleteWarn: 'এই হিসাবটি ডিলেট করলে আর ফিরে পাওয়া যাবে না।',
    deleteBtn: 'হ্যাঁ, ডিলেট করুন',
    cancelBtn: 'না, থাক',
    noteDetails: 'বিস্তারিত তথ্য',
    transactionNotes: 'নোটসমূহ',
    dateLabel: 'তারিখ',
    typeLabel: 'ধরণ',
    incomeType: 'আয়',
    expenseType: 'ব্যয়',
    loanTakenType: 'ধার গ্রহণ',
    loanGivenType: 'ধার প্রদান',
    closingBalance: 'সমাপনী ব্যালেন্স',
    settle: 'পরিশোধ সম্পন্ন',
    confirmSettle: 'পরিশোধ নিশ্চিত করুন',
    settleWarn: 'আপনি কি এই লেনদেনটি সম্পন্ন হিসেবে মার্ক করতে চান? এটি আপনার পেন্ডিং লিস্ট থেকে সরে যাবে।',
    yesSettle: 'হ্যাঁ, পরিশোধ হয়েছে',
    addPayment: 'পেমেন্ট যোগ করুন',
    remaining: 'অবশিষ্ট',
    paidAmount: 'পরিশোধিত',
    paymentHistory: 'পেমেন্ট হিস্ট্রি',
    editCat: 'ক্যাটাগরি এডিট',
    deleteCat: 'ক্যাটাগরি ডিলেট'
  },
  en: {
    appTitle: 'Amar Khata',
    diaryTitle: 'My Digital Diary',
    home: 'Home',
    history: 'History',
    summary: 'Summary',
    reports: 'Reports',
    settings: 'Settings',
    currentBalance: 'Current Balance',
    totalIncome: 'Total Income',
    totalExpense: 'Total Expense',
    todayIncome: 'Today Income',
    todayExpense: 'Today Expense',
    loanGiven: 'Money Owed',
    loanTaken: 'Money Borrowed',
    recentHistory: 'Recent Transactions',
    seeAll: 'See All',
    language: 'App Language',
    devProfile: 'Developer Profile',
    usageGuide: 'Usage Guide',
    backup: 'Download Backup',
    restore: 'Restore Backup',
    themeColor: 'Theme Color',
    reminder: 'Loan Reminder',
    save: 'Save Changes',
    update: 'Update Entry',
    addEntry: 'Add Entry',
    editEntry: 'Edit Entry',
    monthlyNote: 'Notes',
    devName: 'Md. Majidul Hasan {Shahin}',
    close: 'Close',
    monthlySummary: 'Monthly Summary',
    balance: 'Balance',
    netBalance: 'Net Balance',
    weekly: 'Weekly',
    monthly: 'Monthly',
    yearly: 'Yearly',
    customRange: 'Custom',
    category: 'Category',
    manageCategories: 'Manage Categories',
    startDate: 'Start Date',
    endDate: 'End Date',
    allCategories: 'All Categories',
    stats: 'Statistics',
    finance: 'Finance',
    loans: 'Dealings',
    netLoan: 'Net Loan',
    confirmDelete: 'Are you sure?',
    deleteWarn: 'If you delete this record, it cannot be recovered.',
    deleteBtn: 'Yes, Delete',
    cancelBtn: 'No, Keep',
    noteDetails: 'Detailed Info',
    transactionNotes: 'Notes',
    dateLabel: 'Date',
    typeLabel: 'Type',
    incomeType: 'Income',
    expenseType: 'Expense',
    loanTakenType: 'Loan Taken',
    loanGivenType: 'Loan Given',
    closingBalance: 'Closing Balance',
    settle: 'Mark Settle',
    confirmSettle: 'Confirm Settlement',
    settleWarn: 'Are you sure you want to mark this transaction as settled? It will be moved from your pending list.',
    yesSettle: 'Yes, Settle Now',
    addPayment: 'Add Payment',
    remaining: 'Remaining',
    paidAmount: 'Paid',
    paymentHistory: 'Payment History',
    editCat: 'Edit Category',
    deleteCat: 'Delete Category'
  }
};

export default function App() {
  const [data, setData] = useState<StorageData>(storage.getData());
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(data.settings.theme === 'dark');
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState<Loan | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{id: string, isLoan: boolean} | null>(null);
  const [settleConfirmation, setSettleConfirmation] = useState<Loan | null>(null);
  const [selectedItemDetail, setSelectedItemDetail] = useState<any>(null);
  const [showDevModal, setShowDevModal] = useState(false);
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const lang = data.settings.language || 'bn';
  const t = (key: string) => translations[lang][key] || key;

  const activeColorHex = useMemo(() => {
    if (data.settings.themeColor === 'custom') {
      return data.settings.customHex || '#6366f1';
    }
    return PRESET_COLORS[data.settings.themeColor] || '#4f46e5';
  }, [data.settings.themeColor, data.settings.customHex]);

  useEffect(() => {
    storage.saveData(data);
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    root.style.setProperty('--theme-color', activeColorHex);
  }, [data, isDarkMode, activeColorHex]);

  const updateSettings = (updates: Partial<StorageData['settings']>) => {
    setIsLoading(true);
    setTimeout(() => {
      setData(prev => ({ ...prev, settings: { ...prev.settings, ...updates } }));
      setIsLoading(false);
    }, 300);
  };

  const totals = useMemo(() => {
    const income = data.khata.transactions.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
    const expense = data.khata.transactions.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);
    
    const loanTaken = data.khata.loans.filter(l => l.type === 'TAKEN' && l.status === 'PENDING').reduce((s, l) => {
      const paid = l.payments?.reduce((ps, p) => ps + p.amount, 0) || 0;
      return s + (l.amount - paid);
    }, 0);
    
    const loanGiven = data.khata.loans.filter(l => l.type === 'GIVEN' && l.status === 'PENDING').reduce((s, l) => {
      const received = l.payments?.reduce((ps, p) => ps + p.amount, 0) || 0;
      return s + (l.amount - received);
    }, 0);

    const todayStr = new Date().toISOString().split('T')[0];
    const todayIncome = data.khata.transactions.filter(t => t.type === 'INCOME' && t.date === todayStr).reduce((s, t) => s + t.amount, 0);
    const todayExpense = data.khata.transactions.filter(t => t.type === 'EXPENSE' && t.date === todayStr).reduce((s, t) => s + t.amount, 0);

    return {
      income, expense, loanTaken, loanGiven, todayIncome, todayExpense,
      balance: income - expense + loanTaken - loanGiven,
    };
  }, [data.khata.transactions, data.khata.loans]);

  const addOrUpdateEntry = (entry: any) => {
    setIsLoading(true);
    setTimeout(() => {
      const isEdit = !!editingItem;
      const entryId = isEdit ? editingItem.id : crypto.randomUUID();

      if (entry.entryType === 'INCOME' || entry.entryType === 'EXPENSE') {
        const newT: Transaction = {
          id: entryId,
          type: entry.entryType,
          amount: entry.amount,
          category: entry.category,
          note: entry.note,
          date: entry.date,
        };
        setData(prev => {
          let updatedTransactions = [...prev.khata.transactions];
          if (isEdit) {
            updatedTransactions = updatedTransactions.map(t => t.id === entryId ? newT : t);
          } else {
            updatedTransactions = [newT, ...updatedTransactions];
          }
          return { ...prev, khata: { ...prev.khata, transactions: updatedTransactions }};
        });
      } else {
        const newL: Loan = {
          id: entryId,
          type: entry.entryType,
          person: entry.person,
          amount: entry.amount,
          date: entry.date,
          dueDate: entry.dueDate,
          reason: entry.note,
          status: editingItem?.status || 'PENDING',
          payments: editingItem?.payments || []
        };
        setData(prev => {
          let updatedLoans = [...prev.khata.loans];
          if (isEdit) {
            updatedLoans = updatedLoans.map(l => l.id === entryId ? newL : l);
          } else {
            updatedLoans = [newL, ...updatedLoans];
          }
          return { ...prev, khata: { ...prev.khata, loans: updatedLoans }};
        });
      }
      setIsLoading(false);
      setShowEntryModal(false);
      setEditingItem(null);
    }, 400);
  };

  const handleSettleLoan = (loan: Loan) => {
    setData(prev => ({
      ...prev,
      khata: {
        ...prev.khata,
        loans: prev.khata.loans.map(l => {
          if (l.id !== loan.id) return l;
          return { ...l, status: l.type === 'TAKEN' ? 'PAID' : 'RECEIVED' };
        })
      }
    }));
    setSettleConfirmation(null);
  };

  const currentTheme = data.settings.themeColor;

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${isDarkMode ? 'dark bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      {isLoading && (
        <div className="fixed top-0 left-0 w-full h-1 z-[100]">
          <div className={`h-full animate-progress ${THEME_MAP[currentTheme].split(' ')[0]}`}></div>
        </div>
      )}

      <header className="px-6 py-5 flex justify-between items-center bg-white dark:bg-gray-800 border-b dark:border-gray-700 sticky top-0 z-40">
        <div>
          <p className={`text-[10px] font-bold uppercase tracking-widest ${THEME_MAP[currentTheme].split(' ')[2]}`}>{t('diaryTitle')}</p>
          <h1 className="text-xl font-extrabold text-gray-900 dark:text-gray-100">{t('appTitle')}</h1>
        </div>
        <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2.5 rounded-2xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full px-5 py-6 space-y-8 pb-32">
        {activeTab === 'dashboard' && (
          <DashboardView 
            t={t} lang={lang} totals={totals} loans={data.khata.loans} 
            transactions={data.khata.transactions} theme={currentTheme} 
            onShowAll={() => setActiveTab('history')} 
            onEdit={(item: any) => { setEditingItem(item); setShowEntryModal(true); }} 
            onDelete={(id:string, isL:boolean) => setDeleteConfirmation({id, isLoan: isL})} 
            onShowDetail={setSelectedItemDetail}
            onOpenSettleConfirm={setSettleConfirmation}
            onOpenPaymentModal={setShowPaymentModal}
          />
        )}
        {activeTab === 'history' && (
          <HistoryView 
            t={t} lang={lang} transactions={data.khata.transactions} 
            loans={data.khata.loans} theme={currentTheme}
            onEdit={(item: any) => { setEditingItem(item); setShowEntryModal(true); }} 
            onDelete={(id:string, isL:boolean) => setDeleteConfirmation({id, isLoan: isL})}
            onShowDetail={setSelectedItemDetail}
          />
        )}
        {activeTab === 'settings' && (
           <SettingsView 
             t={t} settings={data.settings} onUpdateSettings={updateSettings} 
             theme={currentTheme} onShowDevProfile={() => setShowDevModal(true)}
           />
        )}
      </main>

      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50">
        <button onClick={() => { setEditingItem(null); setShowEntryModal(true); }} className={`${THEME_MAP[currentTheme].split(' ')[0]} text-white w-16 h-16 rounded-full shadow-xl flex items-center justify-center`}><Plus size={32} /></button>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t dark:border-gray-700 px-2 py-3 pb-6 flex justify-around items-center z-40">
        <NavItem icon={<LayoutDashboard size={20} />} label={t('home')} active={activeTab === 'dashboard'} theme={currentTheme} onClick={() => setActiveTab('dashboard')} />
        <NavItem icon={<History size={20} />} label={t('history')} active={activeTab === 'history'} theme={currentTheme} onClick={() => setActiveTab('history')} />
        <NavItem icon={<SettingsIcon size={20} />} label={t('settings')} active={activeTab === 'settings'} theme={currentTheme} onClick={() => setActiveTab('settings')} />
      </nav>

      {showEntryModal && (
        <EntryModal t={t} lang={lang} onClose={() => setShowEntryModal(false)} onSubmit={addOrUpdateEntry} theme={currentTheme} categories={data.khata.categories} initialData={editingItem} />
      )}

      {deleteConfirmation && (
        <DeleteConfirmModal t={t} onClose={() => setDeleteConfirmation(null)} onConfirm={() => {
          const { id, isLoan } = deleteConfirmation;
          setData(prev => ({
            ...prev,
            khata: {
              ...prev.khata,
              transactions: isLoan ? prev.khata.transactions : prev.khata.transactions.filter(t => t.id !== id),
              loans: isLoan ? prev.khata.loans.filter(l => l.id !== id) : prev.khata.loans
            }
          }));
          setDeleteConfirmation(null);
        }} />
      )}

      {showDevModal && (
        <DevProfileModal t={t} onClose={() => setShowDevModal(false)} theme={currentTheme} />
      )}
    </div>
  );
}

function NavItem({ icon, label, active, theme, onClick }: any) {
  const activeClass = THEME_MAP[theme as ThemeColor].split(' ')[2];
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 ${active ? activeClass : 'text-gray-400'}`}>
      {icon}
      <span className="text-[10px] font-bold">{label}</span>
    </button>
  );
}

function DashboardView({ t, totals, theme }: any) {
  const gradientClass = THEME_GRADIENT[theme as ThemeColor];
  return (
    <div className="space-y-6">
      <div className={`bg-gradient-to-br ${gradientClass} rounded-[2rem] p-8 text-white shadow-lg`}>
        <p className="text-white/80 text-xs font-bold uppercase tracking-widest mb-1">{t('currentBalance')}</p>
        <h2 className="text-4xl font-black mb-6">৳ {totals.balance.toLocaleString()}</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 p-3 rounded-2xl">
            <p className="text-[10px] text-white/70">{t('totalIncome')}</p>
            <p className="font-bold">৳ {totals.income}</p>
          </div>
          <div className="bg-white/10 p-3 rounded-2xl">
            <p className="text-[10px] text-white/70">{t('totalExpense')}</p>
            <p className="font-bold">৳ {totals.expense}</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-3xl border dark:border-gray-700">
           <p className="text-[10px] font-bold text-gray-500">{t('todayIncome')}</p>
           <p className="text-lg font-bold text-emerald-600">৳ {totals.todayIncome}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-3xl border dark:border-gray-700">
           <p className="text-[10px] font-bold text-gray-500">{t('todayExpense')}</p>
           <p className="text-lg font-bold text-rose-600">৳ {totals.todayExpense}</p>
        </div>
      </div>
    </div>
  );
}

function HistoryView({ t, transactions, onDelete, theme }: any) {
  const accentText = THEME_MAP[theme as ThemeColor].split(' ')[2];
  return (
    <div className="space-y-4">
      <h3 className="font-bold text-lg">{t('recentHistory')}</h3>
      {transactions.map((item: any) => (
        <div key={item.id} className="bg-white dark:bg-gray-800 p-4 rounded-2xl border dark:border-gray-700 flex justify-between items-center">
          <div>
            <p className="font-bold">{item.category}</p>
            <p className="text-xs text-gray-400">{item.date}</p>
          </div>
          <div className="flex items-center gap-4">
            <p className={`font-black ${item.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
              {item.type === 'INCOME' ? '+' : '-'} ৳ {item.amount}
            </p>
            <button onClick={() => onDelete(item.id, false)} className="text-rose-500"><Trash2 size={18} /></button>
          </div>
        </div>
      ))}
      {transactions.length === 0 && <p className="text-center text-gray-400 py-10">কোন হিসাব নেই</p>}
    </div>
  );
}

function SettingsView({ t, onShowDevProfile, theme }: any) {
  const accentText = THEME_MAP[theme as ThemeColor].split(' ')[2];
  return (
    <div className="space-y-4">
      <h3 className="font-bold text-lg">{t('settings')}</h3>
      <div className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 overflow-hidden">
        <button onClick={onShowDevProfile} className="w-full p-5 flex items-center gap-4 border-b dark:border-gray-700">
          <User className={accentText} size={20} />
          <span>{t('devProfile')}</span>
        </button>
        <button className="w-full p-5 flex items-center gap-4">
          <Download className={accentText} size={20} />
          <span>{t('backup')}</span>
        </button>
      </div>
    </div>
  );
}

function EntryModal({ t, onClose, onSubmit, theme, categories }: any) {
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const accentClass = THEME_MAP[theme as ThemeColor].split(' ')[0];

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-t-[2.5rem] p-8 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">{t('addEntry')}</h2>
          <button onClick={onClose}><X size={24} /></button>
        </div>
        <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-700 rounded-xl">
          <button onClick={() => setType('INCOME')} className={`flex-1 py-2 rounded-lg font-bold ${type === 'INCOME' ? 'bg-white dark:bg-gray-600 shadow' : ''}`}>আয়</button>
          <button onClick={() => setType('EXPENSE')} className={`flex-1 py-2 rounded-lg font-bold ${type === 'EXPENSE' ? 'bg-white dark:bg-gray-600 shadow' : ''}`}>ব্যয়</button>
        </div>
        <input type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} className="w-full text-4xl font-black p-4 text-center bg-gray-50 dark:bg-gray-900 rounded-2xl outline-none" />
        <select value={category} onChange={e => setCategory(e.target.value)} className="w-full p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl outline-none">
          <option value="">ক্যাটাগরি নির্বাচন করুন</option>
          {categories.filter((c:any) => c.type === type).map((c:any) => <option key={c.id} value={c.label}>{c.label}</option>)}
        </select>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl outline-none" />
        <button onClick={() => onSubmit({ entryType: type, amount: parseFloat(amount), category, date, note: '' })} className={`w-full py-4 text-white font-bold rounded-2xl ${accentClass}`}>সেভ করুন</button>
      </div>
    </div>
  );
}

function DeleteConfirmModal({ t, onClose, onConfirm }: any) {
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 p-6">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] text-center space-y-6 w-full max-w-xs">
        <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-500"><Trash2 size={32} /></div>
        <h2 className="text-xl font-bold">{t('confirmDelete')}</h2>
        <div className="flex flex-col gap-2">
          <button onClick={onConfirm} className="w-full py-3 bg-rose-500 text-white font-bold rounded-xl">মুছে ফেলুন</button>
          <button onClick={onClose} className="w-full py-3 bg-gray-100 dark:bg-gray-700 rounded-xl">বাতিল</button>
        </div>
      </div>
    </div>
  );
}

function DevProfileModal({ t, onClose }: any) {
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 p-6">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] text-center space-y-6 w-full max-w-xs">
        <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto overflow-hidden">
           <img src="https://api.dicebear.com/7.x/initials/svg?seed=MHShahid" alt="Dev" />
        </div>
        <div>
          <h2 className="text-xl font-bold">{t('devName')}</h2>
          <p className="text-sm text-gray-500">ওয়েব ও অ্যাপ ডেভেলপার</p>
        </div>
        <button onClick={onClose} className="w-full py-3 bg-gray-900 dark:bg-gray-100 dark:text-gray-900 text-white font-bold rounded-xl">বন্ধ করুন</button>
      </div>
    </div>
  );
}
