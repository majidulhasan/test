import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, History, PieChart as ChartIcon, Settings as SettingsIcon, Plus, FileText,
  Moon, Sun, X, Trash2, Edit2, Download, Upload, TrendingUp, TrendingDown, Bell, Palette,
  Check, HandCoins, User, Mail, Facebook, Send, Pipette, Languages, ClipboardList, Filter,
  Calendar, StickyNote, Info, CalendarDays, Layers, CheckCircle2, Clock, AlertCircle,
  Archive, ArrowRight, ListFilter, CheckCircle, PlusCircle, History as HistoryIcon,
  RefreshCcw, HelpCircle, BookOpen
} from 'lucide-react';
import { storage } from './storage';
import { Transaction, Loan, StorageData, TransactionType, LoanType, ThemeColor, Category, MonthlyNote, LoanStatus, LoanPayment } from './types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

type ActiveTab = 'dashboard' | 'history' | 'summary' | 'reports' | 'notes' | 'settings';

const PRESET_COLORS: Record<string, string> = {
  indigo: '#4f46e5', emerald: '#10b981', rose: '#f43f5e', amber: '#f59e0b',
};

const THEME_MAP: Record<ThemeColor, string> = {
  indigo: 'bg-indigo-600 shadow-indigo-200 text-indigo-600 dark:text-indigo-400',
  emerald: 'bg-emerald-600 shadow-emerald-200 text-emerald-600 dark:text-emerald-400',
  rose: 'bg-rose-600 shadow-rose-200 text-rose-600 dark:text-rose-400',
  amber: 'bg-amber-600 shadow-amber-200 text-amber-600 dark:text-amber-400',
  custom: 'bg-[var(--theme-color)] shadow-gray-200 text-[var(--theme-color)] dark:text-[var(--theme-color)]',
};

const THEME_GRADIENT: Record<ThemeColor, string> = {
  indigo: 'from-indigo-600 to-violet-700', emerald: 'from-emerald-600 to-teal-700',
  rose: 'from-rose-600 to-pink-700', amber: 'from-amber-600 to-orange-700',
  custom: 'from-[var(--theme-color)] to-black/30',
};

const translations: any = {
  bn: {
    appTitle: 'আমার খাতা', diaryTitle: 'আমার ডিজিটাল ডায়েরি', home: 'হোম', history: 'হিসাব', summary: 'সংক্ষিপ্ত', reports: 'রিপোর্ট', settings: 'সেটিং', currentBalance: 'বর্তমান ব্যালেন্স', totalIncome: 'মোট আয়', totalExpense: 'মোট ব্যয়', todayIncome: 'আজকের আয়', todayExpense: 'আজকের ব্যয়', loanGiven: 'পাওনা টাকা', loanTaken: 'ধার নেওয়া', recentHistory: 'সাম্প্রতিক হিসাব', seeAll: 'সব দেখুন', language: 'অ্যাপের ভাষা', devProfile: 'ডেভেলপার পরিচিতি', usageGuide: 'ব্যবহার বিধি', backup: 'ব্যাকআপ ডাউনলোড', restore: 'ব্যাকআপ রিস্টোর', themeColor: 'থিম কালার', reminder: 'লোন রিমাইন্ডার', save: 'সংরক্ষণ করুন', update: 'আপডেট করুন', addEntry: 'হিসাব যোগ করুন', editEntry: 'হিসাব সংশোধন', monthlyNote: 'নোটসমূহ', devName: 'মো: মাজিদুল হাসান {শাহীন}', close: 'বন্ধ করুন', monthlySummary: 'মাসিক সারসংক্ষেপ', balance: 'অবশিষ্ট', netBalance: 'নিট ব্যালেন্স', weekly: 'সাপ্তাহিক', monthly: 'মাসিক', yearly: 'বাৎসরিক', customRange: 'কাস্টম', category: 'ক্যাটাগরি', manageCategories: 'ক্যাটাগরি ম্যানেজ', startDate: 'শুরুর তারিখ', endDate: 'শেষ তারিখ', allCategories: 'সব ক্যাটাগরি', stats: 'পরিসংখ্যান', finance: 'আয়-ব্যয়', loans: 'লেনদেন', netLoan: 'নিট ঋণ', confirmDelete: 'আপনি কি নিশ্চিত?', deleteWarn: 'এই হিসাবটি ডিলেট করলে আর ফিরে পাওয়া যাবে না।', deleteBtn: 'হ্যাঁ, ডিলেট করুন', cancelBtn: 'না, থাক', noteDetails: 'বিস্তারিত তথ্য', transactionNotes: 'নোটসমূহ', dateLabel: 'তারিখ', typeLabel: 'ধরণ', incomeType: 'আয়', expenseType: 'ব্যয়', loanTakenType: 'ধার গ্রহণ', loanGivenType: 'ধার প্রদান', closingBalance: 'সমাপনী ব্যালেন্স', settle: 'পরিশোধ সম্পন্ন', confirmSettle: 'পরিশোধ নিশ্চিত করুন', settleWarn: 'লেনদেন সম্পন্ন হিসেবে মার্ক করবেন?', yesSettle: 'হ্যাঁ, পরিশোধ হয়েছে', addPayment: 'পেমেন্ট যোগ করুন', remaining: 'অবশিষ্ট', paidAmount: 'পরিশোধিত', paymentHistory: 'পেমেন্ট হিস্ট্রি', editCat: 'ক্যাটাগরি এডিট', deleteCat: 'ক্যাটাগরি ডিলেট', selectCatError: 'ক্যাটাগরি সিলেক্ট করুন', settledFilter: 'পরিশোধিত', paidStamp: 'PAID'
  },
  en: {
    appTitle: 'Amar Khata', diaryTitle: 'My Digital Diary', home: 'Home', history: 'History', summary: 'Summary', reports: 'Reports', settings: 'Settings', currentBalance: 'Current Balance', totalIncome: 'Total Income', totalExpense: 'Total Expense', todayIncome: 'Today Income', todayExpense: 'Today Expense', loanGiven: 'Money Owed', loanTaken: 'Money Borrowed', recentHistory: 'Recent Transactions', seeAll: 'See All', language: 'App Language', devProfile: 'Developer Profile', usageGuide: 'Usage Guide', backup: 'Download Backup', restore: 'Restore Backup', themeColor: 'Theme Color', reminder: 'Loan Reminder', save: 'Save Changes', update: 'Update Entry', addEntry: 'Add Entry', editEntry: 'Edit Entry', monthlyNote: 'Notes', devName: 'Md. Majidul Hasan {Shahin}', close: 'Close', monthlySummary: 'Monthly Summary', balance: 'Balance', netBalance: 'Net Balance', weekly: 'Weekly', monthly: 'Monthly', yearly: 'Yearly', customRange: 'Custom', category: 'Category', manageCategories: 'Manage Categories', startDate: 'Start Date', endDate: 'End Date', allCategories: 'All Categories', stats: 'Statistics', finance: 'Finance', loans: 'Dealings', netLoan: 'Net Loan', confirmDelete: 'Are you sure?', deleteWarn: 'If deleted, it cannot be recovered.', deleteBtn: 'Yes, Delete', cancelBtn: 'No, Keep', noteDetails: 'Detailed Info', transactionNotes: 'Notes', dateLabel: 'Date', typeLabel: 'Type', incomeType: 'Income', expenseType: 'Expense', loanTakenType: 'Loan Taken', loanGivenType: 'Loan Given', closingBalance: 'Closing Balance', settle: 'Mark Settle', confirmSettle: 'Confirm Settlement', settleWarn: 'Mark as settled?', yesSettle: 'Yes, Settle Now', addPayment: 'Add Payment', remaining: 'Remaining', paidAmount: 'Paid', paymentHistory: 'Payment History', editCat: 'Edit Category', deleteCat: 'Delete Category', selectCatError: 'Please select a category', settledFilter: 'Settled', paidStamp: 'PAID'
  }
};

export default function App() {
  const [data, setData] = useState<StorageData>(storage.getData());
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(data.settings.theme === 'dark');
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState<{loan: Loan, payment?: LoanPayment} | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{id: string, isLoan: boolean, paymentId?: string} | null>(null);
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
    if (isDarkMode) {
      root.classList.add('dark');
      document.body.classList.add('bg-gray-900');
    } else {
      root.classList.remove('dark');
      document.body.classList.remove('bg-gray-900');
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
        const newT: Transaction = { id: entryId, type: entry.entryType, amount: entry.amount, category: entry.category, note: entry.note, date: entry.date };
        setData(prev => {
          let updatedTransactions = isEdit ? prev.khata.transactions.map(t => t.id === entryId ? newT : t) : [newT, ...prev.khata.transactions];
          return { ...prev, khata: { ...prev.khata, transactions: updatedTransactions }};
        });
      } else {
        const newL: Loan = { id: entryId, type: entry.entryType, person: entry.person, amount: entry.amount, date: entry.date, dueDate: entry.dueDate, reason: entry.note, status: editingItem?.status || 'PENDING', payments: editingItem?.payments || [] };
        setData(prev => {
          let updatedLoans = isEdit ? prev.khata.loans.map(l => l.id === entryId ? newL : l) : [newL, ...prev.khata.loans];
          return { ...prev, khata: { ...prev.khata, loans: updatedLoans }};
        });
      }
      setIsLoading(false); setShowEntryModal(false); setEditingItem(null);
    }, 400);
  };

  const currentTheme = data.settings.themeColor;

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${isDarkMode ? 'dark bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      {isLoading && <div className="fixed top-0 left-0 w-full h-1 z-[100]"><div className={`h-full animate-progress ${THEME_MAP[currentTheme].split(' ')[0]}`}></div></div>}
      <header className="px-6 py-5 flex justify-between items-center bg-white dark:bg-gray-800 border-b dark:border-gray-700 sticky top-0 z-40 backdrop-blur-lg bg-opacity-80 dark:bg-opacity-80">
        <div><p className={`text-[10px] font-bold uppercase tracking-widest ${THEME_MAP[currentTheme].split(' ')[2]}`}>{t('diaryTitle')}</p><h1 className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">{t('appTitle')}</h1></div>
        <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2.5 rounded-2xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 transition-all active:scale-90 hover:brightness-95 dark:hover:brightness-110">{isDarkMode ? <Sun size={20} /> : <Moon size={20} />}</button>
      </header>
      <main className="flex-1 max-w-lg mx-auto w-full px-5 py-6 space-y-8">
        {activeTab === 'dashboard' && <DashboardView t={t} lang={lang} totals={totals} loans={data.khata.loans} transactions={data.khata.transactions} theme={currentTheme} onShowAll={() => setActiveTab('history')} onEdit={(item: any) => { setEditingItem(item); setShowEntryModal(true); }} onDelete={(id:string, isL:boolean) => setDeleteConfirmation({id, isLoan: isL})} onShowDetail={setSelectedItemDetail} onOpenSettleConfirm={setSettleConfirmation} onOpenPaymentModal={(loan:Loan) => setShowPaymentModal({loan})} />}
        {activeTab === 'history' && <HistoryView t={t} lang={lang} transactions={data.khata.transactions} loans={data.khata.loans} onDelete={(id:string, isL:boolean) => setDeleteConfirmation({id, isLoan: isL})} onEdit={(item: any) => { setEditingItem(item); setShowEntryModal(true); }} theme={currentTheme} onShowDetail={setSelectedItemDetail} onOpenSettleConfirm={setSettleConfirmation} onOpenPaymentModal={(loan:Loan) => setShowPaymentModal({loan})} />}
        {activeTab === 'summary' && <SummaryView t={t} lang={lang} transactions={data.khata.transactions} loans={data.khata.loans} theme={currentTheme} />}
        {activeTab === 'reports' && <ReportsView t={t} lang={lang} transactions={data.khata.transactions} isDark={isDarkMode} theme={currentTheme} categories={data.khata.categories} />}
        {activeTab === 'notes' && <NotesView t={t} lang={lang} notes={data.khata.notes} setNotes={(n:any) => setData(p => ({...p, khata: {...p.khata, notes: n}}))} theme={currentTheme} />}
        {activeTab === 'settings' && <SettingsView t={t} lang={lang} settings={data.settings} onUpdateSettings={updateSettings} onExport={storage.exportToJSON} onImport={async (e:any) => { if (e.target.files[0]) { await storage.importFromJSON(e.target.files[0]); setData(storage.getData()); } }} theme={currentTheme} onShowDevProfile={() => setShowDevModal(true)} onManageCategories={() => setShowCategoryManager(true)} onShowUsageGuide={() => setShowUsageModal(true)} />}
      </main>
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50"><button onClick={() => { setEditingItem(null); setShowEntryModal(true); }} className={`${THEME_MAP[currentTheme].split(' ')[0]} text-white w-16 h-16 rounded-full shadow-xl flex items-center justify-center hover:scale-105 transition-all active:scale-90`}><Plus size={32} strokeWidth={3} /></button></div>
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t dark:border-gray-700 px-2 py-3 pb-6 flex justify-around items-center z-40 transition-colors duration-300">
        <NavItem icon={<LayoutDashboard size={20} />} label={t('home')} active={activeTab === 'dashboard'} theme={currentTheme} onClick={() => setActiveTab('dashboard')} />
        <NavItem icon={<History size={20} />} label={t('history')} active={activeTab === 'history'} theme={currentTheme} onClick={() => setActiveTab('history')} />
        <NavItem icon={<ClipboardList size={20} />} label={t('summary')} active={activeTab === 'summary'} theme={currentTheme} onClick={() => setActiveTab('summary')} />
        <div className="w-14"></div>
        <NavItem icon={<FileText size={20} />} label={t('monthlyNote')} active={activeTab === 'notes'} theme={currentTheme} onClick={() => setActiveTab('notes')} />
        <NavItem icon={<ChartIcon size={20} />} label={t('reports')} active={activeTab === 'reports'} theme={currentTheme} onClick={() => setActiveTab('reports')} />
        <NavItem icon={<SettingsIcon size={20} />} label={t('settings')} active={activeTab === 'settings'} theme={currentTheme} onClick={() => setActiveTab('settings')} />
      </nav>
      {showEntryModal && <EntryModal t={t} lang={lang} onClose={() => { setShowEntryModal(false); setEditingItem(null); }} onSubmit={addOrUpdateEntry} theme={currentTheme} categories={data.khata.categories} initialData={editingItem} />}
      {showDevModal && <DevProfileModal t={t} onClose={() => setShowDevModal(false)} theme={currentTheme} />}
      {deleteConfirmation && <DeleteConfirmModal t={t} onClose={() => setDeleteConfirmation(null)} onConfirm={() => {
          setData(prev => ({ ...prev, khata: { ...prev.khata, transactions: deleteConfirmation.isLoan ? prev.khata.transactions : prev.khata.transactions.filter(t => t.id !== deleteConfirmation.id), loans: deleteConfirmation.isLoan ? prev.khata.loans.filter(l => l.id !== deleteConfirmation.id) : prev.khata.loans }}));
          setDeleteConfirmation(null);
      }} />}
    </div>
  );
}

function NavItem({ icon, label, active, theme, onClick }: any) {
  const activeClass = THEME_MAP[theme as ThemeColor].split(' ')[2];
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-all ${active ? `${activeClass} scale-110 font-bold` : 'text-gray-400 dark:text-gray-500'}`}>
      {icon} <span className="text-[10px] font-bold">{label}</span>
    </button>
  );
}

function DashboardView({ t, lang, totals, loans, transactions, theme, onShowAll, onShowDetail }: any) {
  const gradientClass = THEME_GRADIENT[theme as ThemeColor];
  const accentText = THEME_MAP[theme as ThemeColor].split(' ')[2];
  const recentItems = useMemo(() => {
    const combined = [...transactions.map((t: any) => ({ ...t, isLoan: false })), ...loans.map((l: any) => ({ ...l, isLoan: true, category: l.person, note: l.reason }))];
    return combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6);
  }, [transactions, loans]);

  return (
    <div className="space-y-6">
      <div className={`bg-gradient-to-br ${gradientClass} rounded-[2.5rem] p-8 text-white shadow-2xl`}>
        <p className="text-white/80 text-xs font-bold uppercase tracking-widest mb-2">{t('currentBalance')}</p>
        <h2 className="text-4xl font-black mb-6">৳ {totals.balance.toLocaleString()}</h2>
        <div className="grid grid-cols-2 gap-4">
          <div><p className="text-[10px] text-white/70">{t('totalIncome')}</p><p className="font-bold">৳ {totals.income.toLocaleString()}</p></div>
          <div><p className="text-[10px] text-white/70">{t('totalExpense')}</p><p className="font-bold">৳ {totals.expense.toLocaleString()}</p></div>
        </div>
      </div>
      <div>
        <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-black">{t('recentHistory')}</h3><button onClick={onShowAll} className={`text-xs font-bold ${accentText}`}>{t('seeAll')}</button></div>
        <div className="space-y-3">
          {recentItems.map((item: any) => (
            <div key={item.id} onClick={() => onShowDetail(item)} className="bg-white dark:bg-gray-800 p-4 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between cursor-pointer">
              <div><p className="font-bold text-sm">{item.isLoan ? item.person : item.category}</p><p className="text-[10px] text-gray-400">{new Date(item.date).toLocaleDateString()}</p></div>
              <p className={`font-black ${(item.type === 'INCOME' || (item.isLoan && item.type === 'GIVEN')) ? 'text-emerald-600' : 'text-rose-600'}`}>৳ {item.amount.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HistoryView({ t, lang, transactions, loans, onDelete }: any) {
  const items = useMemo(() => [...transactions.map((t:any) => ({...t, isLoan: false})), ...loans.map((l:any) => ({...l, isLoan: true, category: l.person}))].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [transactions, loans]);
  return (<div className="space-y-4 pb-20">{items.map((item:any) => (<div key={item.id} className="bg-white dark:bg-gray-800 p-5 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between"><div><p className="font-bold text-sm">{item.isLoan ? item.person : item.category}</p><p className="text-[10px] text-gray-400">{item.date}</p></div><div className="flex items-center gap-4"><p className="font-black">৳ {item.amount}</p><button onClick={() => onDelete(item.id, item.isLoan)} className="text-rose-500"><Trash2 size={16}/></button></div></div>))}</div>);
}

function SummaryView({ t }: any) {
  return (<div className="space-y-4 pb-20 p-6 bg-white dark:bg-gray-800 rounded-3xl border dark:border-gray-700"><h3 className="font-bold">{t('monthlySummary')}</h3><p className="text-sm opacity-60">এই ফিচারটি শীঘ্রই আসছে...</p></div>);
}

function ReportsView() {
  return (<div className="text-center py-20 opacity-30 italic">রিপোর্ট ডাটা এখানে দেখা যাবে...</div>);
}

function NotesView({ t, notes, setNotes }: any) {
  const [activeMonth] = useState(new Date().toISOString().substring(0, 7));
  const currentNote = notes.find((n: any) => n.month === activeMonth);
  return (
    <div className="space-y-6 pb-20">
      <h3 className="font-black text-xl">{t('monthlyNote')}</h3>
      <textarea 
        className="w-full h-80 p-8 rounded-[3rem] bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 outline-none text-sm leading-loose shadow-sm dark:text-gray-100" 
        placeholder="আপনার নোট এখানে লিখুন..." 
        value={currentNote?.text || ''} 
        onChange={(e) => {
          const text = e.target.value;
          if (currentNote) {
            setNotes(notes.map((n: any) => n.month === activeMonth ? { ...n, text } : n));
          } else {
            setNotes([...notes, { id: crypto.randomUUID(), month: activeMonth, text }]);
          }
        }} 
      />
    </div>
  );
}

function SettingsView({ t, onExport, onShowDevProfile }: any) {
  return (
    <div className="space-y-4 pb-20">
      <button onClick={onShowDevProfile} className="w-full p-5 bg-white dark:bg-gray-800 rounded-2xl font-bold flex justify-between items-center shadow-sm">
        <span>{t('devProfile')}</span> <User size={18}/>
      </button>
      <button onClick={onExport} className="w-full p-5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl font-bold flex justify-between items-center shadow-sm">
        <span>{t('backup')}</span> <Download size={18}/>
      </button>
    </div>
  );
}

function EntryModal({ t, onClose, onSubmit }: any) {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] w-full max-w-md shadow-2xl">
        <h2 className="text-xl font-black mb-6">{t('addEntry')}</h2>
        <div className="space-y-4">
          <input 
            type="number" 
            className="w-full p-4 bg-gray-50 dark:bg-gray-700 rounded-2xl outline-none focus:ring-2 ring-indigo-500" 
            placeholder="টাকার পরিমাণ" 
            value={amount} 
            onChange={(e) => setAmount(e.target.value)} 
          />
          <input 
            type="text" 
            className="w-full p-4 bg-gray-50 dark:bg-gray-700 rounded-2xl outline-none focus:ring-2 ring-indigo-500" 
            placeholder="নোট (ঐচ্ছিক)" 
            value={note} 
            onChange={(e) => setNote(e.target.value)} 
          />
          <div className="flex gap-4 pt-2">
            <button onClick={onClose} className="flex-1 p-4 bg-gray-100 dark:bg-gray-700 dark:text-gray-100 rounded-2xl font-bold">বাতিল</button>
            <button 
              onClick={() => {
                if(!amount) return;
                onSubmit({
                  entryType: 'EXPENSE', 
                  amount: parseFloat(amount), 
                  date: new Date().toISOString().split('T')[0], 
                  category: 'অন্যান্য',
                  note: note
                });
              }} 
              className="flex-1 p-4 bg-indigo-600 text-white rounded-2xl font-bold"
            >
              সেভ করুন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DevProfileModal({ t, onClose }: any) {
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-[3rem] w-full max-w-sm text-center shadow-2xl">
        <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="text-indigo-600" size={40} />
        </div>
        <h2 className="text-xl font-black mb-1">{t('devName')}</h2>
        <p className="text-sm opacity-60 mb-6">ফুল-স্ট্যাক ডেভেলপার</p>
        <button onClick={onClose} className="p-4 bg-indigo-600 text-white w-full rounded-2xl font-black">{t('close')}</button>
      </div>
    </div>
  );
}

function DeleteConfirmModal({ t, onClose, onConfirm }: any) {
  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] text-center shadow-2xl max-w-xs w-full">
        <div className="bg-rose-100 dark:bg-rose-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trash2 className="text-rose-600" size={30} />
        </div>
        <h3 className="font-black text-lg mb-2">{t('confirmDelete')}</h3>
        <p className="text-sm opacity-60 mb-6">{t('deleteWarn')}</p>
        <div className="flex flex-col gap-2">
          <button onClick={onConfirm} className="p-4 bg-rose-600 text-white rounded-2xl font-bold">হ্যাঁ, ডিলেট করুন</button>
          <button onClick={onClose} className="p-4 bg-gray-100 dark:bg-gray-700 font-bold rounded-2xl">না, থাক</button>
        </div>
      </div>
    </div>
  );
}