
import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, History, PieChart as ChartIcon, Settings as SettingsIcon, 
  Plus, FileText, Moon, Sun, X, Trash2, Edit2, Download, Upload, 
  TrendingUp, TrendingDown, Bell, Palette, Check, HandCoins, User, 
  Mail, Facebook, Send, Pipette, Languages, ClipboardList, Filter, 
  Calendar, StickyNote, CalendarDays, Layers, CheckCircle2, AlertCircle, 
  Archive, ArrowRight, ListFilter, CheckCircle, PlusCircle, RefreshCcw, 
  BookOpen, History as HistoryIcon
} from 'lucide-react';
import { storage } from './services/storage';
import { Transaction, Loan, StorageData, TransactionType, LoanType, ThemeColor, Category, MonthlyNote, LoanStatus, LoanPayment } from './types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

type ActiveTab = 'dashboard' | 'history' | 'summary' | 'reports' | 'notes' | 'settings';

const PRESET_COLORS: Record<string, string> = {
  indigo: '#4f46e5',
  emerald: '#10b981',
  rose: '#f43f5e',
  amber: '#f59e0b',
};

const THEME_MAP: Record<ThemeColor, string> = {
  indigo: 'bg-indigo-600 shadow-indigo-200 text-indigo-600 dark:text-indigo-400 border-indigo-600',
  emerald: 'bg-emerald-600 shadow-emerald-200 text-emerald-600 dark:text-emerald-400 border-emerald-600',
  rose: 'bg-rose-600 shadow-rose-200 text-rose-600 dark:text-rose-400 border-rose-600',
  amber: 'bg-amber-600 shadow-amber-200 text-amber-600 dark:text-amber-400 border-amber-600',
  custom: 'bg-[var(--theme-color)] shadow-gray-200 text-[var(--theme-color)] dark:text-[var(--theme-color)] border-[var(--theme-color)]',
};

const THEME_GRADIENT: Record<ThemeColor, string> = {
  indigo: 'from-indigo-600 via-indigo-700 to-violet-800',
  emerald: 'from-emerald-600 via-emerald-700 to-teal-800',
  rose: 'from-rose-600 via-rose-700 to-pink-800',
  amber: 'from-amber-600 via-amber-700 to-orange-800',
  custom: 'from-[var(--theme-color)] to-black/40',
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
    settleWarn: 'আপনি কি এই লেনদেনটি সম্পন্ন হিসেবে মার্ক করতে চান?',
    yesSettle: 'হ্যাঁ, পরিশোধ হয়েছে',
    addPayment: 'পেমেন্ট যোগ করুন',
    remaining: 'অবশিষ্ট',
    paidAmount: 'পরিশোধিত',
    paymentHistory: 'পেমেন্ট হিস্ট্রি',
    categoryChart: 'বিভাগভিত্তিক ব্যয়'
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
    language: 'Language',
    devProfile: 'Developer',
    usageGuide: 'Usage Guide',
    backup: 'Backup',
    restore: 'Restore',
    themeColor: 'Theme',
    reminder: 'Reminder',
    save: 'Save',
    update: 'Update',
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
    manageCategories: 'Categories',
    startDate: 'Start',
    endDate: 'End',
    allCategories: 'All Categories',
    stats: 'Stats',
    finance: 'Finance',
    loans: 'Loans',
    netLoan: 'Net Loan',
    confirmDelete: 'Are you sure?',
    deleteWarn: 'This record cannot be recovered.',
    deleteBtn: 'Yes, Delete',
    cancelBtn: 'Cancel',
    noteDetails: 'Details',
    transactionNotes: 'Notes',
    dateLabel: 'Date',
    typeLabel: 'Type',
    incomeType: 'Income',
    expenseType: 'Expense',
    loanTakenType: 'Loan Taken',
    loanGivenType: 'Loan Given',
    closingBalance: 'Closing Balance',
    settle: 'Settle',
    confirmSettle: 'Confirm',
    settleWarn: 'Mark this as fully settled?',
    yesSettle: 'Yes, Settle',
    addPayment: 'Add Payment',
    remaining: 'Remaining',
    paidAmount: 'Paid',
    paymentHistory: 'Payments',
    categoryChart: 'Expense by Category'
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
    if (data.settings.themeColor === 'custom') return data.settings.customHex || '#6366f1';
    return PRESET_COLORS[data.settings.themeColor] || '#4f46e5';
  }, [data.settings.themeColor, data.settings.customHex]);

  useEffect(() => {
    storage.saveData(data);
    const root = window.document.documentElement;
    if (isDarkMode) root.classList.add('dark');
    else root.classList.remove('dark');
    root.style.setProperty('--theme-color', activeColorHex);
  }, [data, isDarkMode, activeColorHex]);

  const totals = useMemo(() => {
    const income = data.khata.transactions.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
    const expense = data.khata.transactions.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);
    
    const loanTaken = data.khata.loans.filter(l => l.type === 'TAKEN' && l.status === 'PENDING').reduce((s, l) => {
      const paid = l.payments?.reduce((ps, p) => ps + p.amount, 0) || 0;
      return s + (l.amount - paid);
    }, 0);
    
    const loanGiven = data.khata.loans.filter(l => l.type === 'GIVEN' && l.status === 'PENDING').reduce((s, l) => {
      const rec = l.payments?.reduce((ps, p) => ps + p.amount, 0) || 0;
      return s + (l.amount - rec);
    }, 0);

    const today = new Date().toISOString().split('T')[0];
    const todayInc = data.khata.transactions.filter(t => t.type === 'INCOME' && t.date === today).reduce((s, t) => s + t.amount, 0);
    const todayExp = data.khata.transactions.filter(t => t.type === 'EXPENSE' && t.date === today).reduce((s, t) => s + t.amount, 0);

    return { 
      income, expense, loanTaken, loanGiven, 
      todayIncome: todayInc, todayExpense: todayExp, 
      balance: income - expense + loanTaken - loanGiven 
    };
  }, [data.khata.transactions, data.khata.loans]);

  const handleEntrySubmit = (entry: any) => {
    setIsLoading(true);
    setTimeout(() => {
      const id = editingItem?.id || crypto.randomUUID();
      if (entry.entryType === 'INCOME' || entry.entryType === 'EXPENSE') {
        const newT: Transaction = { 
          id, type: entry.entryType, amount: entry.amount, 
          category: entry.category, note: entry.note, date: entry.date 
        };
        setData(prev => ({ 
          ...prev, 
          khata: { 
            ...prev.khata, 
            transactions: editingItem 
              ? prev.khata.transactions.map(t => t.id === id ? newT : t) 
              : [newT, ...prev.khata.transactions] 
          }
        }));
      } else {
        const newL: Loan = { 
          id, type: entry.entryType, person: entry.person, amount: entry.amount, 
          date: entry.date, dueDate: entry.dueDate, reason: entry.note, 
          status: editingItem?.status || 'PENDING', 
          payments: editingItem?.payments || [] 
        };
        setData(prev => ({ 
          ...prev, 
          khata: { 
            ...prev.khata, 
            loans: editingItem 
              ? prev.khata.loans.map(l => l.id === id ? newL : l) 
              : [newL, ...prev.khata.loans] 
          }
        }));
      }
      setIsLoading(false); setShowEntryModal(false); setEditingItem(null);
    }, 300);
  };

  const handleSettle = (loan: Loan) => {
    setData(prev => ({
      ...prev, 
      khata: { 
        ...prev.khata, 
        loans: prev.khata.loans.map(l => l.id === loan.id ? { ...l, status: l.type === 'TAKEN' ? 'PAID' : 'RECEIVED' } : l) 
      }
    }));
    setSettleConfirmation(null);
  };

  const handleAddPayment = (loanId: string, payment: any) => {
    setData(prev => ({
      ...prev,
      khata: {
        ...prev.khata,
        loans: prev.khata.loans.map(l => {
          if (l.id !== loanId) return l;
          const updatedPayments = [...(l.payments || []), { ...payment, id: crypto.randomUUID() }];
          const totalPaid = updatedPayments.reduce((s, p) => s + p.amount, 0);
          const isSettled = totalPaid >= l.amount;
          return {
            ...l,
            payments: updatedPayments,
            status: isSettled ? (l.type === 'TAKEN' ? 'PAID' : 'RECEIVED') : 'PENDING'
          };
        })
      }
    }));
    setShowPaymentModal(null);
  };

  const currentTheme = data.settings.themeColor;

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-[#FAFBFF] text-slate-900'}`}>
      
      {isLoading && (
        <div className="fixed top-0 left-0 w-full h-1 z-[100] overflow-hidden">
          <div className="h-full bg-indigo-500 animate-progress"></div>
        </div>
      )}

      <header className="px-6 py-5 flex justify-between items-center bg-white/80 dark:bg-slate-900/80 border-b dark:border-slate-800/50 sticky top-0 z-40 backdrop-blur-xl">
        <div className="flex flex-col">
          <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-500">{t('diaryTitle')}</p>
          <h1 className="text-xl font-black tracking-tight">{t('appTitle')}</h1>
        </div>
        <button 
          onClick={() => {
            const nextTheme = isDarkMode ? 'light' : 'dark';
            setIsDarkMode(!isDarkMode);
            setData(p => ({ ...p, settings: { ...p.settings, theme: nextTheme as 'light' | 'dark' }}));
          }} 
          className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 active:scale-90 transition-all"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full px-5 py-8 space-y-10 pb-32">
        {activeTab === 'dashboard' && <DashboardView t={t} lang={lang} totals={totals} loans={data.khata.loans} transactions={data.khata.transactions} theme={currentTheme} onShowAll={() => setActiveTab('history')} onEdit={(i:any) => {setEditingItem(i); setShowEntryModal(true);}} onDelete={(id:any,isL:any) => setDeleteConfirmation({id, isLoan:isL})} onShowDetail={setSelectedItemDetail} onOpenSettle={setSettleConfirmation} onOpenPayment={setShowPaymentModal} />}
        {activeTab === 'history' && <HistoryView t={t} lang={lang} transactions={data.khata.transactions} loans={data.khata.loans} onEdit={(i:any) => {setEditingItem(i); setShowEntryModal(true);}} onDelete={(id:any,isL:any) => setDeleteConfirmation({id, isLoan:isL})} onShowDetail={setSelectedItemDetail} theme={currentTheme} onOpenSettle={setSettleConfirmation} onOpenPayment={setShowPaymentModal} />}
        {activeTab === 'summary' && <SummaryView t={t} lang={lang} transactions={data.khata.transactions} loans={data.khata.loans} theme={currentTheme} />}
        {activeTab === 'reports' && <ReportsView t={t} lang={lang} transactions={data.khata.transactions} isDark={isDarkMode} theme={currentTheme} categories={data.khata.categories} />}
        {activeTab === 'notes' && <NotesView t={t} notes={data.khata.notes} setNotes={(n:any) => setData(p => ({...p, khata: {...p.khata, notes: n}}))} theme={currentTheme} lang={lang} />}
        {activeTab === 'settings' && <SettingsView t={t} lang={lang} settings={data.settings} onUpdateSettings={(u:any) => setData(p => ({...p, settings: {...p.settings, ...u}}))} onExport={storage.exportToJSON} onImport={async (e:any) => { if(e.target.files[0]) { await storage.importFromJSON(e.target.files[0]); setData(storage.getData()); } }} theme={currentTheme} onShowDev={() => setShowDevModal(true)} onManageCats={() => setShowCategoryManager(true)} onShowUsage={() => setShowUsageModal(true)} />}
      </main>

      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50">
        <button 
          onClick={() => { setEditingItem(null); setShowEntryModal(true); }} 
          className={`${THEME_MAP[currentTheme].split(' ')[0]} text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center active:scale-90 hover:scale-110 transition-all border-4 border-white dark:border-slate-950`}
        >
          <Plus size={32} strokeWidth={3} />
        </button>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 border-t dark:border-slate-800/50 px-2 py-4 flex justify-around items-center z-40 backdrop-blur-md shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
        <NavItem icon={<LayoutDashboard size={20} />} active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} theme={currentTheme} label={t('home')} />
        <NavItem icon={<History size={20} />} active={activeTab === 'history'} onClick={() => setActiveTab('history')} theme={currentTheme} label={t('history')} />
        <NavItem icon={<ClipboardList size={20} />} active={activeTab === 'summary'} onClick={() => setActiveTab('summary')} theme={currentTheme} label={t('summary')} />
        <div className="w-12"></div>
        <NavItem icon={<FileText size={20} />} active={activeTab === 'notes'} onClick={() => setActiveTab('notes')} theme={currentTheme} label={t('monthlyNote')} />
        <NavItem icon={<ChartIcon size={20} />} active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} theme={currentTheme} label={t('reports')} />
        <NavItem icon={<SettingsIcon size={20} />} active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} theme={currentTheme} label={t('settings')} />
      </nav>

      {/* Modals */}
      {showEntryModal && <EntryModal t={t} lang={lang} onClose={() => setShowEntryModal(false)} onSubmit={handleEntrySubmit} theme={currentTheme} categories={data.khata.categories} initialData={editingItem} onUpdateCategories={(newCats: any) => setData(p => ({...p, khata: {...p.khata, categories: newCats}}))} />}
      {showCategoryManager && <CategoryManagerModal t={t} lang={lang} onClose={() => setShowCategoryManager(false)} categories={data.khata.categories} onUpdate={(c:any) => setData(p => ({...p, khata: {...p.khata, categories: c}}))} theme={currentTheme} />}
      {deleteConfirmation && <DeleteModal t={t} onClose={() => setDeleteConfirmation(null)} onConfirm={() => {
        const {id, isLoan} = deleteConfirmation;
        setData(p => ({ ...p, khata: { ...p.khata, transactions: isLoan ? p.khata.transactions : p.khata.transactions.filter(t => t.id !== id), loans: isLoan ? p.khata.loans.filter(l => l.id !== id) : p.khata.loans }}));
        setDeleteConfirmation(null);
      }} />}
      {settleConfirmation && <SettleModal t={t} loan={settleConfirmation} onClose={() => setSettleConfirmation(null)} onConfirm={() => handleSettle(settleConfirmation)} theme={currentTheme} lang={lang} />}
      {showPaymentModal && <PaymentModal t={t} lang={lang} loan={showPaymentModal} onClose={() => setShowPaymentModal(null)} onSubmit={(p: any) => handleAddPayment(showPaymentModal.id, p)} theme={currentTheme} />}
      {selectedItemDetail && <DetailModal t={t} lang={lang} item={selectedItemDetail} onClose={() => setSelectedItemDetail(null)} theme={currentTheme} />}
      {showDevModal && <DevModal t={t} onClose={() => setShowDevModal(false)} theme={currentTheme} />}
      {showUsageModal && <UsageModal t={t} onClose={() => setShowUsageModal(false)} theme={currentTheme} lang={lang} />}
    </div>
  );
}

function NavItem({ icon, active, onClick, theme, label }: any) {
  const color = THEME_MAP[theme].split(' ')[2];
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-all ${active ? `${color} scale-110` : 'text-slate-400'}`}>
      {icon}
      <span className="text-[9px] font-bold">{label}</span>
    </button>
  );
}

function DashboardView({ t, lang, totals, loans, transactions, theme, onShowAll, onEdit, onDelete, onShowDetail, onOpenSettle, onOpenPayment }: any) {
  const gradient = THEME_GRADIENT[theme];
  const recent = useMemo(() => {
    const combined = [
      ...transactions.map(t => ({...t, isLoan: false})), 
      ...loans.map(l => ({...l, isLoan: true, category: l.person, note: l.reason}))
    ];
    return combined.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
  }, [transactions, loans]);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className={`p-8 rounded-[2.5rem] bg-gradient-to-br ${gradient} text-white shadow-xl relative overflow-hidden group`}>
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform"><HandCoins size={80} /></div>
        <div className="relative z-10">
          <p className="text-[11px] font-bold uppercase opacity-70 mb-1">{t('currentBalance')}</p>
          <h2 className="text-4xl font-black mb-8 tabular-nums tracking-tighter">৳ {totals.balance.toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US')}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/15 p-4 rounded-3xl backdrop-blur-md border border-white/10">
              <p className="text-[10px] font-bold opacity-70 uppercase mb-1">{t('totalIncome')}</p>
              <p className="text-lg font-black">৳{totals.income.toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US')}</p>
            </div>
            <div className="bg-white/15 p-4 rounded-3xl backdrop-blur-md border border-white/10">
              <p className="text-[10px] font-bold opacity-70 uppercase mb-1">{t('totalExpense')}</p>
              <p className="text-lg font-black">৳{totals.expense.toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <DashboardStatCard label={t('loanGiven')} value={totals.loanGiven} color="text-emerald-500" lang={lang} />
        <DashboardStatCard label={t('loanTaken')} value={totals.loanTaken} color="text-rose-500" lang={lang} />
      </div>

      <div className="space-y-5">
        <div className="flex justify-between items-center px-1">
          <h3 className="font-black text-lg tracking-tight">{t('recentHistory')}</h3>
          <button onClick={onShowAll} className="text-xs font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 px-3 py-1.5 rounded-xl">{t('seeAll')}</button>
        </div>
        <div className="space-y-4">
          {recent.map((item:any) => (
            <TransactionCard 
              key={item.id} 
              item={item} 
              onShowDetail={onShowDetail} 
              onEdit={onEdit} 
              onDelete={onDelete} 
              onOpenSettle={onOpenSettle}
              onOpenPayment={onOpenPayment}
              t={t} 
              lang={lang}
            />
          ))}
          {recent.length === 0 && (
            <div className="text-center py-16 opacity-20">
              <Archive size={48} className="mx-auto mb-4" />
              <p className="font-bold italic">{lang === 'bn' ? 'এখনো কোনো হিসাব নেই' : 'No records yet'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DashboardStatCard({ label, value, color, lang }: any) {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 transition-transform active:scale-95">
      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wider">{label}</p>
      <p className={`text-xl font-black ${color} tabular-nums`}>৳{value.toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US')}</p>
    </div>
  );
}

function TransactionCard({ item, onShowDetail, onEdit, onDelete, onOpenSettle, onOpenPayment, t, lang }: any) {
  const isSettled = item.status && item.status !== 'PENDING';
  
  return (
    <div 
      onClick={() => onShowDetail(item)} 
      className={`bg-white dark:bg-slate-900 p-4 rounded-[1.8rem] border border-slate-100 dark:border-slate-800 flex items-center justify-between cursor-pointer group hover:border-indigo-500/30 transition-all ${isSettled ? 'opacity-40 grayscale' : ''}`}
    >
      <div className="flex items-center gap-4">
        <div className={`p-3.5 rounded-[1.25rem] ${item.isLoan ? 'bg-blue-50 text-blue-500 dark:bg-blue-900/20' : item.type === 'INCOME' ? 'bg-emerald-50 text-emerald-500 dark:bg-emerald-900/20' : 'bg-rose-50 text-rose-500 dark:bg-rose-900/20'}`}>
          {item.isLoan ? <HandCoins size={22} /> : item.type === 'INCOME' ? <TrendingUp size={22} /> : <TrendingDown size={22} />}
        </div>
        <div>
          <p className="font-black text-[14px] leading-none mb-1 tracking-tight text-slate-900 dark:text-white">
            {item.category} {item.isLoan && <span className="text-[10px] opacity-40 ml-1">({item.type === 'TAKEN' ? 'গ্রহণ' : 'প্রদান'})</span>}
          </p>
          <p className="text-[10px] text-slate-400 font-bold">{new Date(item.date).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', { day: 'numeric', month: 'short' })}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <p className={`font-black tabular-nums tracking-tighter ${ (item.type === 'INCOME' || (item.isLoan && item.type === 'GIVEN')) ? 'text-emerald-600' : 'text-rose-600'}`}>
          ৳{item.amount.toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US')}
        </p>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {item.isLoan && !isSettled && (
             <>
               <button onClick={(e) => { e.stopPropagation(); onOpenPayment(item); }} className="p-2 text-emerald-500"><PlusCircle size={16}/></button>
               <button onClick={(e) => { e.stopPropagation(); onOpenSettle(item); }} className="p-2 text-blue-500"><CheckCircle size={16}/></button>
             </>
          )}
          <button onClick={(e) => { e.stopPropagation(); onEdit(item); }} className="p-2 text-slate-400 hover:text-blue-500"><Edit2 size={16} /></button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(item.id, !!item.isLoan); }} className="p-2 text-slate-400 hover:text-rose-500"><Trash2 size={16} /></button>
        </div>
      </div>
    </div>
  );
}

function HistoryView({ t, lang, transactions, loans, onShowDetail, onEdit, onDelete, theme, onOpenSettle, onOpenPayment }: any) {
  const [filter, setFilter] = useState('all');
  
  const items = useMemo(() => {
    let combined = [
      ...transactions.map(t => ({...t, isLoan: false})), 
      ...loans.map(l => ({...l, isLoan: true, category: l.person, note: l.reason}))
    ];
    
    if (filter === 'income') combined = combined.filter(i => !i.isLoan && i.type === 'INCOME');
    if (filter === 'expense') combined = combined.filter(i => !i.isLoan && i.type === 'EXPENSE');
    if (filter === 'loans') combined = combined.filter(i => i.isLoan);
    
    return combined.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, loans, filter]);

  const activeColor = THEME_MAP[theme].split(' ')[0];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex gap-2 overflow-x-auto hide-scrollbar py-2">
        {['all', 'income', 'expense', 'loans'].map(f => (
          <button 
            key={f} 
            onClick={() => setFilter(f)} 
            className={`px-6 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all border shrink-0 ${filter === f ? `${activeColor} text-white border-transparent shadow-lg` : 'bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 border-slate-100 dark:border-slate-800'}`}
          >
            {f === 'all' ? 'সব' : f === 'income' ? 'আয়' : f === 'expense' ? 'ব্যয়' : 'লেনদেন'}
          </button>
        ))}
      </div>
      <div className="space-y-4">
        {items.map((item:any) => (
          <TransactionCard 
            key={item.id} 
            item={item} 
            onShowDetail={onShowDetail} 
            onEdit={onEdit} 
            onDelete={onDelete} 
            onOpenSettle={onOpenSettle}
            onOpenPayment={onOpenPayment}
            t={t} 
            lang={lang}
          />
        ))}
        {items.length === 0 && <p className="text-center py-20 opacity-20 italic">খুঁজে পাওয়া যায়নি</p>}
      </div>
    </div>
  );
}

function SummaryView({ t, lang, transactions, loans, theme }: any) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7));
  
  const monthlyData = useMemo(() => {
    const inc = transactions.filter(t => t.type === 'INCOME' && t.date.startsWith(selectedMonth)).reduce((s, t) => s + t.amount, 0);
    const exp = transactions.filter(t => t.type === 'EXPENSE' && t.date.startsWith(selectedMonth)).reduce((s, t) => s + t.amount, 0);
    const taken = loans.filter(l => l.type === 'TAKEN' && l.date.startsWith(selectedMonth)).reduce((s, l) => s + l.amount, 0);
    const given = loans.filter(l => l.type === 'GIVEN' && l.date.startsWith(selectedMonth)).reduce((s, l) => s + l.amount, 0);
    return { inc, exp, taken, given, balance: inc - exp };
  }, [transactions, loans, selectedMonth]);

  const themeText = THEME_MAP[theme].split(' ')[2];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center px-2">
        <h3 className="text-xl font-black">{t('monthlySummary')}</h3>
        <input 
          type="month" 
          value={selectedMonth} 
          onChange={e => setSelectedMonth(e.target.value)} 
          className={`p-3 rounded-2xl border-none outline-none font-black text-xs ${themeText} bg-white dark:bg-slate-900 shadow-sm`}
        />
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 space-y-8">
        <SummaryRow label={t('totalIncome')} value={monthlyData.inc} color="text-emerald-500" lang={lang} />
        <SummaryRow label={t('totalExpense')} value={monthlyData.exp} color="text-rose-500" lang={lang} />
        <div className="h-[1px] bg-slate-100 dark:bg-slate-800"></div>
        <SummaryRow label={t('balance')} value={monthlyData.balance} color={monthlyData.balance >= 0 ? "text-emerald-600" : "text-rose-600"} lang={lang} isLarge />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <DashboardStatCard label={lang === 'bn' ? 'গৃহীত ঋণ' : 'Taken'} value={monthlyData.taken} color="text-orange-500" lang={lang} />
        <DashboardStatCard label={lang === 'bn' ? 'প্রদত্ত ঋণ' : 'Given'} value={monthlyData.given} color="text-blue-500" lang={lang} />
      </div>
    </div>
  );
}

function SummaryRow({ label, value, color, lang, isLarge }: any) {
  return (
    <div className="flex justify-between items-center">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      <p className={`${isLarge ? 'text-2xl font-black' : 'text-xl font-bold'} ${color} tabular-nums`}>৳{value.toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US')}</p>
    </div>
  );
}

function ReportsView({ t, lang, transactions, isDark, theme, categories }: any) {
  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => {
      const income = transactions.filter(t => t.type === 'INCOME' && t.date === date).reduce((s, t) => s + t.amount, 0);
      const expense = transactions.filter(t => t.type === 'EXPENSE' && t.date === date).reduce((s, t) => s + t.amount, 0);
      return { date: date.split('-').slice(1).join('/'), income, expense };
    });
  }, [transactions]);

  const pieData = useMemo(() => {
    const cats: Record<string, number> = {};
    transactions.filter(t => t.type === 'EXPENSE').forEach(t => {
      cats[t.category] = (cats[t.category] || 0) + t.amount;
    });
    return Object.entries(cats).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const COLORS = ['#4f46e5', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800">
        <h4 className="text-sm font-black mb-8 opacity-50 uppercase tracking-widest">{lang === 'bn' ? 'সাপ্তাহিক ট্র্যাকার' : 'Weekly Tracker'}</h4>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#1e293b' : '#f1f5f9'} />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontSize: '12px' }}
                cursor={{ stroke: '#4f46e5', strokeWidth: 2 }}
              />
              <Area type="monotone" dataKey="income" stroke="#10b981" fillOpacity={1} fill="url(#colorInc)" strokeWidth={3} />
              <Area type="monotone" dataKey="expense" stroke="#f43f5e" fillOpacity={1} fill="url(#colorExp)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800">
        <h4 className="text-sm font-black mb-8 opacity-50 uppercase tracking-widest">{t('categoryChart')}</h4>
        <div className="h-[250px] w-full">
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" stroke="none" cornerRadius={8}>
                  {pieData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center py-20 opacity-20 italic">তথ্য নেই</p>
          )}
        </div>
      </div>
    </div>
  );
}

function NotesView({ t, notes, setNotes, theme, lang }: any) {
  const [activeMonth, setActiveMonth] = useState(new Date().toISOString().substring(0, 7));
  const currentNote = notes.find((n: any) => n.month === activeMonth);
  
  const handleSave = (text: string) => {
    if (currentNote) {
      setNotes(notes.map((n: any) => n.month === activeMonth ? { ...n, text } : n));
    } else {
      setNotes([...notes, { id: crypto.randomUUID(), month: activeMonth, text }]);
    }
  };

  const themeText = THEME_MAP[theme].split(' ')[2];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center px-2">
        <h3 className="text-xl font-black">{t('monthlyNote')}</h3>
        <input 
          type="month" 
          value={activeMonth} 
          onChange={e => setActiveMonth(e.target.value)} 
          className={`p-3 rounded-2xl border-none outline-none font-black text-xs ${themeText} bg-white dark:bg-slate-900 shadow-sm`}
        />
      </div>
      <textarea 
        className="w-full min-h-[400px] p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none text-[15px] font-semibold leading-relaxed shadow-sm transition-all text-slate-800 dark:text-slate-100 placeholder-slate-300 dark:placeholder-slate-700 resize-none"
        placeholder={lang === 'bn' ? 'এই মাসের জরুরি কিছু লিখে রাখুন...' : 'Type your thoughts here...'}
        value={currentNote?.text || ''}
        onChange={e => handleSave(e.target.value)}
      />
    </div>
  );
}

function SettingsView({ t, settings, onUpdateSettings, onExport, onImport, onShowDev, onManageCats, onShowUsage }: any) {
  return (
    <div className="space-y-8 animate-fade-in">
      <h3 className="text-xl font-black px-1">{t('settings')}</h3>
      
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm">
        <SettingItem icon={<Languages size={20}/>} label={t('language')} value={settings.language === 'bn' ? 'বাংলা' : 'English'} onClick={() => onUpdateSettings({ language: settings.language === 'bn' ? 'en' : 'bn' })} color="text-blue-500" />
        <SettingItem icon={<Layers size={20}/>} label={t('manageCategories')} onClick={onManageCats} color="text-emerald-500" />
        <SettingItem icon={<Palette size={20}/>} label={t('themeColor')} value={settings.themeColor.toUpperCase()} onClick={() => onUpdateSettings({ themeColor: settings.themeColor === 'indigo' ? 'emerald' : settings.themeColor === 'emerald' ? 'rose' : settings.themeColor === 'rose' ? 'amber' : 'indigo' })} color="text-amber-500" />
        <SettingItem icon={<Download size={20}/>} label={t('backup')} onClick={onExport} color="text-indigo-500" />
        <label className="block w-full cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
           <div className="flex items-center gap-4 p-6 border-b dark:border-slate-800 last:border-none">
             <div className="p-3 bg-violet-50 dark:bg-violet-950/30 text-violet-500 rounded-2xl"><Upload size={20}/></div>
             <span className="flex-1 font-black text-sm">{t('restore')}</span>
             <input type="file" className="hidden" accept=".json" onChange={onImport} />
           </div>
        </label>
        <SettingItem icon={<BookOpen size={20}/>} label={t('usageGuide')} onClick={onShowUsage} color="text-teal-500" />
        <SettingItem icon={<User size={20}/>} label={t('devProfile')} onClick={onShowDev} color="text-pink-500" isLast />
      </div>

      <div className="text-center opacity-20 pt-10">
        <p className="text-[10px] font-black uppercase tracking-[0.4em]">{t('appTitle')} v2.5</p>
      </div>
    </div>
  );
}

function SettingItem({ icon, label, value, onClick, color, isLast }: any) {
  return (
    <button 
      onClick={onClick} 
      className={`w-full flex items-center gap-4 p-6 border-b dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${isLast ? 'border-none' : ''}`}
    >
      <div className={`p-3 bg-slate-50 dark:bg-slate-950/30 ${color} rounded-2xl`}>{icon}</div>
      <span className="flex-1 text-left font-black text-sm">{label}</span>
      {value && <span className="text-[10px] font-black uppercase text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">{value}</span>}
      <ArrowRight size={16} className="text-slate-300" />
    </button>
  );
}

function EntryModal({ t, lang, onClose, onSubmit, categories, initialData, onUpdateCategories }: any) {
  const [entryType, setEntryType] = useState(initialData?.type || 'EXPENSE');
  const [amount, setAmount] = useState(initialData?.amount || '');
  const [category, setCategory] = useState(initialData?.category || '');
  const [person, setPerson] = useState(initialData?.person || '');
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState(initialData?.note || initialData?.reason || '');
  const [newCat, setNewCat] = useState('');

  const filteredCats = categories.filter((c:any) => c.type === (entryType === 'INCOME' || entryType === 'EXPENSE' ? entryType : 'EXPENSE'));

  const handleAddCat = () => {
    if(!newCat.trim()) return;
    const nc = { id: crypto.randomUUID(), label: newCat, type: entryType as TransactionType };
    onUpdateCategories([...categories, nc]);
    setCategory(newCat);
    setNewCat('');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-t-[3rem] sm:rounded-[3rem] p-8 shadow-2xl overflow-y-auto max-h-[95vh] hide-scrollbar border dark:border-slate-800">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-black tracking-tight">{initialData ? t('editEntry') : t('addEntry')}</h2>
          <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full active:scale-90"><X size={20} /></button>
        </div>
        
        <form onSubmit={(e) => { e.preventDefault(); onSubmit({ entryType, amount: parseFloat(amount), category, person, date, note }); }} className="space-y-6">
          <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl">
            {['INCOME', 'EXPENSE', 'TAKEN', 'GIVEN'].map(type => (
              <button key={type} type="button" onClick={() => setEntryType(type)} className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${entryType === type ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600' : 'text-slate-400'}`}>
                {type === 'INCOME' ? 'আয়' : type === 'EXPENSE' ? 'ব্যয়' : type === 'TAKEN' ? 'গ্রহণ' : 'প্রদান'}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">{lang === 'bn' ? 'পরিমাণ (৳)' : 'Amount'}</label>
            <input type="number" required autoFocus value={amount} onChange={e => setAmount(e.target.value)} className="w-full p-6 bg-slate-50 dark:bg-slate-950 rounded-[1.8rem] border-none outline-none font-black text-4xl tabular-nums shadow-inner" placeholder="0" />
          </div>

          {(entryType === 'INCOME' || entryType === 'EXPENSE') ? (
             <div className="space-y-4">
               <div className="flex justify-between items-center px-2">
                 <label className="text-[10px] font-black uppercase text-slate-400">{t('category')}</label>
                 <div className="flex gap-2">
                   <input value={newCat} onChange={e => setNewCat(e.target.value)} placeholder="নতুন..." className="text-[10px] p-1 border-b dark:bg-transparent" />
                   <button type="button" onClick={handleAddCat} className="text-indigo-500 font-bold">+</button>
                 </div>
               </div>
               <div className="grid grid-cols-3 gap-3">
                 {filteredCats.map((cat:any) => (
                   <button 
                     key={cat.id} 
                     type="button" 
                     onClick={() => setCategory(cat.label)} 
                     className={`p-3 rounded-2xl text-[11px] font-black border transition-all ${category === cat.label ? 'bg-indigo-600 text-white border-transparent shadow-lg scale-105' : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-800'}`}
                   >
                     {cat.label}
                   </button>
                 ))}
               </div>
             </div>
          ) : (
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">{lang === 'bn' ? 'ব্যক্তির নাম' : 'Person Name'}</label>
              <input type="text" required value={person} onChange={e => setPerson(e.target.value)} className="w-full p-5 bg-slate-50 dark:bg-slate-950 rounded-[1.5rem] border-none outline-none font-black text-sm" placeholder="নাম..." />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">{t('dateLabel')}</label>
            <input type="date" required value={date} onChange={e => setDate(e.target.value)} className="w-full p-5 bg-slate-50 dark:bg-slate-950 rounded-[1.5rem] border-none outline-none font-black text-sm tabular-nums" />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">{t('transactionNotes')}</label>
            <textarea value={note} onChange={e => setNote(e.target.value)} className="w-full p-5 bg-slate-50 dark:bg-slate-950 rounded-[1.5rem] border-none outline-none font-bold text-sm min-h-[100px] resize-none" placeholder=" বিস্তারিত..." />
          </div>

          <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-lg shadow-xl shadow-indigo-200 dark:shadow-none active:scale-95 transition-all">
            {initialData ? t('update') : t('save')}
          </button>
        </form>
      </div>
    </div>
  );
}

function CategoryManagerModal({ t, lang, onClose, categories, onUpdate, theme }: any) {
  const [newLabel, setNewLabel] = useState('');
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const activeColor = THEME_MAP[theme].split(' ')[0];

  const handleAdd = () => {
    if(!newLabel.trim()) return;
    onUpdate([...categories, { id: crypto.randomUUID(), label: newLabel, type }]);
    setNewLabel('');
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl flex flex-col max-h-[85vh] border dark:border-slate-800">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-black">{t('manageCategories')}</h2>
          <button onClick={onClose} className="p-2"><X size={20}/></button>
        </div>
        <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-6">
          <button onClick={() => setType('INCOME')} className={`flex-1 py-2 rounded-xl text-[10px] font-black ${type === 'INCOME' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-400'}`}>আয়</button>
          <button onClick={() => setType('EXPENSE')} className={`flex-1 py-2 rounded-xl text-[10px] font-black ${type === 'EXPENSE' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-400'}`}>ব্যয়</button>
        </div>
        <div className="flex gap-3 mb-6">
          <input type="text" value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="নতুন নাম..." className="flex-1 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border-none outline-none font-bold" />
          <button onClick={handleAdd} className={`p-4 ${activeColor} text-white rounded-2xl shadow-lg active:scale-90`}><Plus size={24}/></button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-3 pr-2 hide-scrollbar">
          {categories.filter((c:any) => c.type === type).map((cat:any) => (
            <div key={cat.id} className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-950 rounded-[1.5rem] group border dark:border-slate-800 shadow-sm">
              <span className="font-bold text-sm">{cat.label}</span>
              <button onClick={() => onUpdate(categories.filter((c:any) => c.id !== cat.id))} className="text-rose-500 p-2 opacity-50 hover:opacity-100"><Trash2 size={16}/></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PaymentModal({ t, lang, loan, onClose, onSubmit, theme }: any) {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const activeColor = THEME_MAP[theme].split(' ')[0];

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl border dark:border-slate-800">
        <h2 className="text-lg font-black mb-6">{t('addPayment')} - {loan.person}</h2>
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">পরিমাণ (৳)</label>
            <input type="number" required autoFocus value={amount} onChange={e => setAmount(e.target.value)} className="w-full p-5 bg-slate-50 dark:bg-slate-950 rounded-2xl border-none outline-none font-black text-2xl" placeholder="0" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">তারিখ</label>
            <input type="date" required value={date} onChange={e => setDate(e.target.value)} className="w-full p-5 bg-slate-50 dark:bg-slate-950 rounded-2xl border-none outline-none font-black text-sm" />
          </div>
          <button onClick={() => amount && onSubmit({ amount: parseFloat(amount), date, note: '' })} className={`w-full py-5 ${activeColor} text-white rounded-[2rem] font-black text-lg shadow-xl active:scale-95 transition-all`}>
            নিশ্চিত করুন
          </button>
        </div>
      </div>
    </div>
  );
}

function SettleModal({ t, loan, onClose, onConfirm, theme, lang }: any) {
  const activeColor = THEME_MAP[theme].split(' ')[0];
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] p-10 text-center shadow-2xl border dark:border-slate-800">
        <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle size={40} strokeWidth={3}/></div>
        <h2 className="text-xl font-black mb-2">{t('confirmSettle')}</h2>
        <p className="text-sm text-slate-400 font-bold mb-10 leading-relaxed px-4">{t('settleWarn')}</p>
        <div className="flex flex-col gap-3">
          <button onClick={onConfirm} className={`w-full py-5 ${activeColor} text-white rounded-[2rem] font-black text-lg shadow-xl active:scale-95 transition-all`}>{t('yesSettle')}</button>
          <button onClick={onClose} className="w-full py-5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-[2rem] font-black text-lg active:scale-95 transition-all">{t('cancelBtn')}</button>
        </div>
      </div>
    </div>
  );
}

function DeleteModal({ t, onClose, onConfirm }: any) {
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] p-10 text-center shadow-2xl">
        <div className="w-20 h-20 bg-rose-50 dark:bg-rose-950/30 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6"><Trash2 size={40} /></div>
        <h2 className="text-xl font-black mb-2">{t('confirmDelete')}</h2>
        <p className="text-sm text-slate-400 font-bold mb-10 leading-relaxed">{t('deleteWarn')}</p>
        <div className="flex flex-col gap-3">
          <button onClick={onConfirm} className="w-full py-5 bg-rose-500 text-white rounded-[2rem] font-black text-lg shadow-xl shadow-rose-200 dark:shadow-none active:scale-95 transition-all">{t('deleteBtn')}</button>
          <button onClick={onClose} className="w-full py-5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-[2rem] font-black text-lg active:scale-95 transition-all">{t('cancelBtn')}</button>
        </div>
      </div>
    </div>
  );
}

function DetailModal({ t, lang, item, onClose, theme }: any) {
  const isIncome = item.type === 'INCOME' || (item.isLoan && item.type === 'GIVEN');
  const paid = item.payments?.reduce((s:number, p:any) => s + p.amount, 0) || 0;
  
  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-sm rounded-[3rem] p-10 shadow-2xl border dark:border-slate-800">
        <h2 className="text-xl font-black mb-10 text-center">{t('noteDetails')}</h2>
        <div className="space-y-6">
          <DetailRow label={t('category')} value={item.category} icon={<Layers size={18}/>} />
          <DetailRow label={t('dateLabel')} value={new Date(item.date).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })} icon={<Calendar size={18}/>} />
          <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-3xl text-center space-y-1 border dark:border-slate-800">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">মোট পরিমাণ</p>
            <p className={`text-4xl font-black tabular-nums ${isIncome ? 'text-emerald-500' : 'text-rose-500'}`}>৳{item.amount}</p>
          </div>
          {item.isLoan && (
             <div className="flex gap-4">
               <div className="flex-1 bg-emerald-50 dark:bg-emerald-950/20 p-4 rounded-2xl text-center">
                 <p className="text-[9px] font-bold uppercase text-emerald-600 mb-1">পরিশোধিত</p>
                 <p className="text-sm font-black text-emerald-600">৳{paid}</p>
               </div>
               <div className="flex-1 bg-rose-50 dark:bg-rose-950/20 p-4 rounded-2xl text-center">
                 <p className="text-[9px] font-bold uppercase text-rose-600 mb-1">অবশিষ্ট</p>
                 <p className="text-sm font-black text-rose-600">৳{item.amount - paid}</p>
               </div>
             </div>
          )}
          {item.note && (
             <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-3xl italic text-slate-500 text-sm leading-relaxed border dark:border-slate-800">
               "{item.note}"
             </div>
          )}
        </div>
        <button onClick={onClose} className="w-full py-5 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-[2rem] font-black mt-10 active:scale-95 transition-all shadow-xl">{t('close')}</button>
      </div>
    </div>
  );
}

function DetailRow({ label, value, icon }: any) {
  return (
    <div className="flex items-center gap-4">
      <div className="p-2.5 bg-slate-50 dark:bg-slate-950 text-slate-400 rounded-xl">{icon}</div>
      <div className="flex-1 border-b dark:border-slate-800 pb-2">
        <p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">{label}</p>
        <p className="font-bold text-sm">{value}</p>
      </div>
    </div>
  );
}

function DevModal({ t, onClose, theme }: any) {
  const activeColor = THEME_MAP[theme].split(' ')[0];
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-sm rounded-[3rem] p-12 text-center border dark:border-slate-800 shadow-2xl">
        <div className={`w-28 h-28 ${activeColor} rounded-full mx-auto mb-8 flex items-center justify-center text-white text-4xl font-black shadow-2xl ring-8 ring-slate-50 dark:ring-slate-800`}>AK</div>
        <h2 className="text-2xl font-black mb-2 tracking-tight">{t('devName')}</h2>
        <p className="text-slate-400 text-sm mb-12 font-bold italic leading-relaxed px-4">জীবনকে সহজ করার জন্য ডিজিটাল ডায়েরি তৈরির ক্ষুদ্র প্রচেষ্টা।</p>
        
        <div className="flex justify-center gap-6 mb-12">
           <a href="https://facebook.com/majidulhasanshahin" className="p-4 bg-blue-50 dark:bg-blue-950/30 text-blue-500 rounded-2xl active:scale-90 transition-all"><Facebook size={24}/></a>
           <a href="mailto:majidul.hasan.shahin@gmail.com" className="p-4 bg-rose-50 dark:bg-rose-950/30 text-rose-500 rounded-2xl active:scale-90 transition-all"><Mail size={24}/></a>
           <a href="https://t.me/majidulhasanshahin" className="p-4 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 rounded-2xl active:scale-90 transition-all"><Send size={24}/></a>
        </div>

        <button onClick={onClose} className={`w-full py-5 ${activeColor} text-white rounded-[2.2rem] font-black text-lg active:scale-95 transition-all shadow-xl`}>{t('close')}</button>
      </div>
    </div>
  );
}

function UsageModal({ t, onClose, theme, lang }: any) {
  const activeColor = THEME_MAP[theme].split(' ')[0];
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-[3rem] p-10 border dark:border-slate-800 shadow-2xl flex flex-col max-h-[85vh]">
        <h2 className="text-2xl font-black mb-8 px-2 flex items-center gap-4"><BookOpen className="text-indigo-500"/> {t('usageGuide')}</h2>
        <div className="flex-1 overflow-y-auto space-y-8 pr-2 hide-scrollbar">
           <UsageStep icon={<Plus className="text-blue-500"/>} title="হিসাব যোগ করুন" text="নিচের মাঝখানের প্লাস (+) বাটনে ক্লিক করে আয়, ব্যয় বা ঋণের হিসাব দ্রুত যোগ করুন।" />
           <UsageStep icon={<History className="text-emerald-500"/>} title="হিস্ট্রি দেখুন" text="আপনার সব ট্রানজ্যাকশন তারিখ অনুযায়ী ইতিহাস সেকশনে ফিল্টারসহ দেখতে পাবেন।" />
           <UsageStep icon={<HandCoins className="text-orange-500"/>} title="ঋণ ট্র্যাকিং" text="কাউকে টাকা ধার দিলে বা নিলে আংশিক পেমেন্ট আপডেট এবং সম্পন্ন করার সুবিধা রয়েছে।" />
           <UsageStep icon={<Download className="text-indigo-500"/>} title="ডাটা নিরাপদ রাখুন" text="সেটিংস থেকে নিয়মিত 'ব্যাকআপ' ফাইলটি ডাউনলোড করে আপনার মেইল বা ড্রাইভে রেখে দিন।" />
           <UsageStep icon={<AlertCircle className="text-rose-500"/>} title="অফলাইন সুবিধা" text="অ্যাপটি ইন্টারনেট ছাড়াই চলে। আপনার ডাটা শুধুমাত্র আপনার ফোনেই সেভ থাকে।" />
        </div>
        <button onClick={onClose} className={`w-full py-5 ${activeColor} text-white rounded-[2rem] font-black text-lg mt-8 active:scale-95 transition-all shadow-xl`}>{t('close')}</button>
      </div>
    </div>
  );
}

function UsageStep({ icon, title, text }: any) {
  return (
    <div className="flex gap-5 group">
       <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-[1.5rem] shrink-0 h-fit border dark:border-slate-800 group-hover:scale-110 transition-transform">{icon}</div>
       <div className="space-y-1">
         <p className="font-black text-sm tracking-tight">{title}</p>
         <p className="text-xs text-slate-400 font-bold leading-relaxed">{text}</p>
       </div>
    </div>
  );
}
