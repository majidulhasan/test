import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  History, 
  PieChart as ChartIcon, 
  Settings as SettingsIcon, 
  Plus, 
  FileText,
  Moon,
  Sun,
  X,
  Trash2,
  Edit2,
  Download,
  Upload,
  TrendingUp,
  TrendingDown,
  Bell,
  Palette,
  Check,
  HandCoins,
  User,
  Mail,
  Facebook,
  Send,
  Pipette,
  Languages,
  ClipboardList,
  Filter,
  Calendar,
  StickyNote,
  Info,
  CalendarDays,
  Layers,
  CheckCircle2,
  Clock,
  AlertCircle,
  Archive,
  ArrowRight,
  ListFilter,
  CheckCircle,
  PlusCircle,
  History as HistoryIcon,
  RefreshCcw,
  HelpCircle,
  BookOpen
} from 'lucide-react';
import { storage } from './services/storage';
import { Transaction, Loan, StorageData, TransactionType, LoanType, ThemeColor, Category, MonthlyNote, LoanStatus, LoanPayment } from './types';
import { LOAN_STATUS_LABELS } from './constants';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell
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
      document.body.classList.add('bg-slate-950');
    } else {
      root.classList.remove('dark');
      document.body.classList.remove('bg-slate-950');
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

  const updateKhata = (updates: any) => {
    setData(prev => ({ ...prev, khata: { ...prev.khata, ...updates } }));
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

  const handleAddPayment = (loanId: string, payment: Omit<LoanPayment, 'id'>) => {
    setData(prev => ({
      ...prev,
      khata: {
        ...prev.khata,
        loans: prev.khata.loans.map(l => {
          if (l.id !== loanId) return l;
          const newPayment: LoanPayment = { ...payment, id: crypto.randomUUID() };
          const updatedPayments = [...(l.payments || []), newPayment];
          const totalPaid = updatedPayments.reduce((s, p) => s + p.amount, 0);
          let newStatus = l.status;
          if (totalPaid >= l.amount) {
            newStatus = l.type === 'TAKEN' ? 'PAID' : 'RECEIVED';
          }
          return { ...l, payments: updatedPayments, status: newStatus };
        })
      }
    }));
    setShowPaymentModal(null);
  };

  const handleSettleLoan = (loan: Loan) => {
    setData(prev => ({
      ...prev,
      khata: {
        ...prev.khata,
        loans: prev.khata.loans.map(l => {
          if (l.id !== loan.id) return l;
          let newStatus: LoanStatus = l.type === 'TAKEN' ? 'PAID' : 'RECEIVED';
          return { ...l, status: newStatus };
        })
      }
    }));
    setSettleConfirmation(null);
  };

  const currentTheme = data.settings.themeColor;

  return (
    <div className={`min-h-screen flex flex-col transition-all duration-700 ease-in-out ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-[#FAFBFF] text-slate-900'}`}>
      {isLoading && (
        <div className="fixed top-0 left-0 w-full h-1 z-[100] overflow-hidden">
          <div className={`h-full animate-progress ${THEME_MAP[currentTheme].split(' ')[0]} shadow-[0_0_15px_rgba(0,0,0,0.2)]`}></div>
        </div>
      )}

      <header className="px-6 py-6 flex justify-between items-center bg-white/70 dark:bg-slate-900/70 border-b dark:border-slate-800/50 sticky top-0 z-40 backdrop-blur-2xl transition-all">
        <div className="flex flex-col">
          <p className={`text-[9px] font-black uppercase tracking-[0.3em] ${THEME_MAP[currentTheme].split(' ')[2]} opacity-90`}>{t('diaryTitle')}</p>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white drop-shadow-sm -mt-0.5">{t('appTitle')}</h1>
        </div>
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)} 
          className="p-3 rounded-[1.25rem] bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 transition-all active:scale-90 hover:shadow-lg shadow-sm"
        >
          {isDarkMode ? <Sun size={20} strokeWidth={2.5} /> : <Moon size={20} strokeWidth={2.5} />}
        </button>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full px-5 py-8 space-y-12">
        {activeTab === 'dashboard' && <DashboardView t={t} lang={lang} totals={totals} loans={data.khata.loans} transactions={data.khata.transactions} theme={currentTheme} onShowAll={() => setActiveTab('history')} onEdit={(item: any) => { setEditingItem(item); setShowEntryModal(true); }} onDelete={(id:string, isL:boolean) => setDeleteConfirmation({id, isLoan: isL})} onShowDetail={setSelectedItemDetail} onOpenSettleConfirm={setSettleConfirmation} onOpenPaymentModal={setShowPaymentModal} />}
        {activeTab === 'history' && <HistoryView t={t} lang={lang} transactions={data.khata.transactions} loans={data.khata.loans} onDelete={(id:string, isL:boolean) => setDeleteConfirmation({id, isLoan: isL})} onEdit={(item: any) => { setEditingItem(item); setShowEntryModal(true); }} theme={currentTheme} onShowDetail={setSelectedItemDetail} onOpenSettleConfirm={setSettleConfirmation} onOpenPaymentModal={setShowPaymentModal} />}
        {activeTab === 'summary' && <SummaryView t={t} lang={lang} transactions={data.khata.transactions} loans={data.khata.loans} theme={currentTheme} />}
        {activeTab === 'reports' && <ReportsView t={t} lang={lang} transactions={data.khata.transactions} isDark={isDarkMode} theme={currentTheme} categories={data.khata.categories} />}
        {activeTab === 'notes' && <NotesView t={t} notes={data.khata.notes} setNotes={(n:any) => setData(p => ({...p, khata: {...p.khata, notes: n}}))} theme={currentTheme} />}
        {activeTab === 'settings' && (
          <SettingsView 
            t={t} lang={lang} settings={data.settings} onUpdateSettings={updateSettings} onExport={storage.exportToJSON} onImport={async (e:any) => { if (e.target.files[0]) { await storage.importFromJSON(e.target.files[0]); setData(storage.getData()); } }} theme={currentTheme} onShowDevProfile={() => setShowDevModal(true)} onManageCategories={() => setShowCategoryManager(true)} onShowUsageGuide={() => setShowUsageModal(true)}
          />
        )}
      </main>

      <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50">
        <button 
          onClick={() => { setEditingItem(null); setShowEntryModal(true); }} 
          className={`${THEME_MAP[currentTheme].split(' ')[0]} text-white w-16 h-16 rounded-full shadow-[0_15px_40px_-10px_rgba(0,0,0,0.4)] flex items-center justify-center hover:scale-110 active:scale-90 transition-all ring-4 ring-white dark:ring-slate-950`}
        >
          <Plus size={36} strokeWidth={3.5} />
        </button>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 border-t dark:border-slate-800/40 px-2 py-4 pb-10 flex justify-around items-center z-40 backdrop-blur-3xl transition-all shadow-[0_-15px_40px_-15px_rgba(0,0,0,0.15)]">
        <NavItem icon={<LayoutDashboard size={20} />} label={t('home')} active={activeTab === 'dashboard'} theme={currentTheme} onClick={() => setActiveTab('dashboard')} />
        <NavItem icon={<History size={20} />} label={t('history')} active={activeTab === 'history'} theme={currentTheme} onClick={() => setActiveTab('history')} />
        <NavItem icon={<ClipboardList size={20} />} label={t('summary')} active={activeTab === 'summary'} theme={currentTheme} onClick={() => setActiveTab('summary')} />
        <div className="w-14"></div>
        <NavItem icon={<FileText size={20} />} label={t('monthlyNote')} active={activeTab === 'notes'} theme={currentTheme} onClick={() => setActiveTab('notes')} />
        <NavItem icon={<ChartIcon size={20} />} label={t('reports')} active={activeTab === 'reports'} theme={currentTheme} onClick={() => setActiveTab('reports')} />
        <NavItem icon={<SettingsIcon size={20} />} label={t('settings')} active={activeTab === 'settings'} theme={currentTheme} onClick={() => setActiveTab('settings')} />
      </nav>

      {/* Overlays & Modals */}
      {showEntryModal && (
        <EntryModal t={t} lang={lang} onClose={() => { setShowEntryModal(false); setEditingItem(null); }} onSubmit={addOrUpdateEntry} theme={currentTheme} categories={data.khata.categories} onUpdateKhata={(updates: any) => updateKhata(updates)} initialData={editingItem} />
      )}

      {showPaymentModal && (
        <PaymentModal t={t} lang={lang} loan={showPaymentModal} onClose={() => setShowPaymentModal(null)} onSubmit={(p: any) => handleAddPayment(showPaymentModal.id, p)} theme={currentTheme} />
      )}

      {showCategoryManager && (
        <CategoryManagerModal t={t} lang={lang} onClose={() => setShowCategoryManager(false)} categories={data.khata.categories} onUpdateCategories={(newCats: Category[]) => updateKhata({ categories: newCats })} theme={currentTheme} />
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

      {settleConfirmation && (
        <SettleConfirmModal t={t} lang={lang} loan={settleConfirmation} onClose={() => setSettleConfirmation(null)} onConfirm={() => handleSettleLoan(settleConfirmation)} />
      )}

      {selectedItemDetail && (
        <ItemDetailModal t={t} lang={lang} item={selectedItemDetail} onClose={() => setSelectedItemDetail(null)} theme={currentTheme} />
      )}

      {showDevModal && (
        <DevProfileModal t={t} onClose={() => setShowDevModal(false)} theme={currentTheme} />
      )}

      {showUsageModal && (
        <UsageGuideModal t={t} onClose={() => setShowUsageModal(false)} theme={currentTheme} lang={lang} />
      )}
    </div>
  );
}

function NavItem({ icon, label, active, theme, onClick }: any) {
  const activeClass = THEME_MAP[theme as ThemeColor].split(' ')[2];
  return (
    <button 
      onClick={onClick} 
      className={`flex flex-col items-center gap-1.5 transition-all duration-300 active:scale-95 ${active ? `${activeClass} scale-110 font-black` : 'text-slate-400 dark:text-slate-600 hover:text-slate-500'}`}
    >
      <div className={`transition-all duration-300 ${active ? 'drop-shadow-[0_0_12px_rgba(var(--theme-rgb),0.6)]' : ''}`}>
        {icon}
      </div>
      <span className="text-[10px] font-bold tracking-tighter">{label}</span>
    </button>
  );
}

function DashboardView({ t, lang, totals, loans, transactions, theme, onShowAll, onEdit, onDelete, onShowDetail, onOpenSettleConfirm, onOpenPaymentModal }: any) {
  const todayDues = loans.filter((l:any) => l.status === 'PENDING' && l.dueDate === new Date().toISOString().split('T')[0]);
  const gradientClass = THEME_GRADIENT[theme as ThemeColor];
  const accentText = THEME_MAP[theme as ThemeColor].split(' ')[2];

  const recentItems = useMemo(() => {
    const combined = [
      ...transactions.map((t: any) => ({ ...t, isLoan: false })),
      ...loans.map((l: any) => ({ ...l, isLoan: true, category: l.person, note: l.reason }))
    ];
    return combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6);
  }, [transactions, loans]);

  return (
    <div className="space-y-10 animate-in slide-in-from-bottom-8 duration-1000 ease-out">
      <div className={`relative overflow-hidden bg-gradient-to-br ${gradientClass} rounded-[3rem] p-10 text-white shadow-[0_30px_70px_-20px_rgba(0,0,0,0.35)] group transition-all`}>
        {/* Glow Effects */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/20 rounded-full blur-[90px] group-hover:bg-white/30 transition-all duration-700"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-black/10 rounded-full blur-[60px]"></div>
        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-white/20 rounded-[3rem]"></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <p className="text-white/80 text-[11px] font-black uppercase tracking-[0.25em]">{t('currentBalance')}</p>
            <HandCoins size={22} className="opacity-40" />
          </div>
          <h2 className="text-5xl font-black mb-12 flex items-baseline gap-2 tabular-nums tracking-tight">
            <span className="text-3xl opacity-60 font-bold">৳</span> 
            {totals.balance.toLocaleString('bn-BD')}
          </h2>
          
          <div className="grid grid-cols-2 gap-4 bg-black/10 backdrop-blur-xl rounded-[2.5rem] p-6 border border-white/10 shadow-inner">
            <div className="flex flex-col gap-1">
              <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">{t('totalIncome')}</p>
              <p className="text-xl font-black tabular-nums">৳{totals.income.toLocaleString('bn-BD')}</p>
            </div>
            <div className="flex flex-col gap-1 border-l border-white/10 pl-6">
              <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">{t('totalExpense')}</p>
              <p className="text-xl font-black tabular-nums">৳{totals.expense.toLocaleString('bn-BD')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <DashboardMetric label={t('todayIncome')} value={`+ ৳${totals.todayIncome}`} color="emerald" />
        <DashboardMetric label={t('todayExpense')} value={`- ৳${totals.todayExpense}`} color="rose" />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.8rem] p-9 border border-slate-200/50 dark:border-slate-800/50 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.08)] flex items-center justify-between group">
        <div className="space-y-1.5">
          <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">{t('loanGiven')}</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">৳{totals.loanGiven.toLocaleString('bn-BD')}</p>
        </div>
        <div className="h-14 w-0.5 bg-slate-100 dark:bg-slate-800 mx-8 rounded-full"></div>
        <div className="space-y-1.5 text-right">
          <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em]">{t('loanTaken')}</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">৳{totals.loanTaken.toLocaleString('bn-BD')}</p>
        </div>
      </div>

      {todayDues.length > 0 && (
        <div className="bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/20 p-7 rounded-[2.8rem] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Bell size={48} /></div>
          <div className="flex items-center gap-3 mb-5">
            <div className="bg-amber-500 p-2.5 rounded-full shadow-[0_8px_20px_-5px_rgba(245,158,11,0.5)]">
              <AlertCircle className="text-white" size={18} strokeWidth={3}/>
            </div>
            <h3 className="font-black text-amber-900 dark:text-amber-200 tracking-tight text-lg">{t('reminder')}</h3>
          </div>
          <div className="space-y-3">
            {todayDues.map((d:any) => (
              <div key={d.id} className="flex justify-between items-center text-sm font-bold bg-white/40 dark:bg-slate-900/40 p-3 rounded-2xl">
                <span className="text-amber-900 dark:text-amber-100 truncate mr-4">{d.person}</span>
                <span className="text-amber-600 dark:text-amber-400 font-black tabular-nums shrink-0">৳{d.amount}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="flex justify-between items-center mb-8 px-2">
          <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">{t('recentHistory')}</h3>
          <button 
            onClick={onShowAll} 
            className={`text-xs font-black uppercase tracking-[0.2em] ${accentText} bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 px-5 py-3 rounded-[1.25rem] transition-all active:scale-95 shadow-sm`}
          >
            {t('seeAll')}
          </button>
        </div>
        <div className="space-y-5 pb-16">
          {recentItems.map((item: any) => (
            <TransactionCard 
              key={item.id} 
              item={item} 
              t={t} 
              lang={lang} 
              onShowDetail={onShowDetail} 
              onOpenPaymentModal={onOpenPaymentModal} 
              onOpenSettleConfirm={onOpenSettleConfirm} 
              onEdit={onEdit} 
              onDelete={onDelete} 
            />
          ))}
          {recentItems.length === 0 && (
            <div className="text-center py-24 flex flex-col items-center opacity-20">
              <Archive size={64} strokeWidth={1} className="mb-6" />
              <p className="text-lg font-black italic tracking-tight">{lang === 'bn' ? 'এখনো কোনো হিসাব নেই' : 'No records yet'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DashboardMetric({ label, value, color }: any) {
  const colors: any = {
    emerald: 'text-emerald-600 dark:text-emerald-400',
    rose: 'text-rose-600 dark:text-rose-400'
  };
  return (
    <div className="bg-white dark:bg-slate-900 p-7 rounded-[2.8rem] border border-slate-200/50 dark:border-slate-800/50 shadow-sm transition-all hover:shadow-md group">
      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-3 group-hover:translate-x-1 transition-transform">{label}</p>
      <p className={`text-2xl font-black tabular-nums tracking-tighter ${colors[color]}`}>{value}</p>
    </div>
  );
}

function TransactionCard({ item, t, lang, onShowDetail, onOpenPaymentModal, onOpenSettleConfirm, onEdit, onDelete }: any) {
  const isSettled = item.status && item.status !== 'PENDING';
  const paid = item.isLoan ? (item.payments?.reduce((s:number, p:any) => s + p.amount, 0) || 0) : 0;
  const remaining = item.isLoan ? (item.amount - paid) : 0;
  
  return (
    <div 
      onClick={() => onShowDetail(item)}
      className={`bg-white dark:bg-slate-900 p-5 rounded-[2.5rem] border border-slate-200/50 dark:border-slate-800/50 shadow-sm transition-all hover:scale-[1.02] active:scale-98 cursor-pointer relative group overflow-hidden ${isSettled ? 'opacity-40 grayscale' : ''}`}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className={`w-12 h-12 rounded-[1.25rem] flex items-center justify-center shrink-0 shadow-inner ${item.isLoan ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30' : item.type === 'INCOME' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30' : 'bg-rose-50 text-rose-600 dark:bg-rose-900/30'}`}>
              {item.isLoan ? <HandCoins size={22} strokeWidth={2} /> : item.type === 'INCOME' ? <TrendingUp size={22} strokeWidth={2} /> : <TrendingDown size={22} strokeWidth={2} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-[15px] leading-tight text-slate-900 dark:text-white truncate mb-1 tracking-tight">
                {item.category} {item.isLoan && (item.type === 'TAKEN' ? (lang === 'en' ? '↓' : '(ঋণ গ্রহণ)') : (lang === 'en' ? '↑' : '(ঋণ প্রদান)'))}
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest">
                {new Date(item.date).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', { day: 'numeric', month: 'short' })}
              </p>
            </div>
          </div>
          
          <div className="text-right shrink-0">
            <p className={`font-black text-lg whitespace-nowrap tabular-nums tracking-tighter ${ (item.type === 'INCOME' || (item.isLoan && item.type === 'GIVEN')) ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              { (item.type === 'INCOME' || (item.isLoan && item.type === 'GIVEN')) ? '+' : '-'} ৳{item.isLoan ? remaining : item.amount}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-50 dark:border-slate-800/50">
          <div className="flex-1 min-w-0">
            {item.note && (
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold italic truncate pr-2">
                "{item.note}"
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {item.isLoan && !isSettled && (
              <>
                <button onClick={(e) => { e.stopPropagation(); onOpenPaymentModal(item); }} className="w-9 h-9 flex items-center justify-center text-amber-500 bg-amber-50 dark:bg-amber-900/20 rounded-xl shadow-sm border border-amber-100/50 dark:border-amber-900/30 transition-all active:scale-90" title={t('addPayment')}><PlusCircle size={18} /></button>
                <button onClick={(e) => { e.stopPropagation(); onOpenSettleConfirm(item); }} className="w-9 h-9 flex items-center justify-center text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl shadow-sm border border-emerald-100/50 dark:border-amber-900/30 transition-all active:scale-90" title={t('settle')}><CheckCircle size={18} /></button>
              </>
            )}
            <button onClick={(e) => { e.stopPropagation(); onEdit(item); }} className="w-9 h-9 flex items-center justify-center text-blue-500 bg-blue-50 dark:bg-blue-900/20 rounded-xl shadow-sm border border-blue-100/50 dark:border-blue-900/30 transition-all active:scale-90"><Edit2 size={16} /></button>
            <button onClick={(e) => { e.stopPropagation(); onDelete(item.id, !!item.isLoan); }} className="w-9 h-9 flex items-center justify-center text-rose-500 bg-rose-50 dark:bg-rose-900/20 rounded-xl shadow-sm border border-rose-100/50 dark:border-rose-900/30 transition-all active:scale-90"><Trash2 size={16} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ItemDetailModal({ t, lang, item, onClose, theme }: any) {
  const isIncome = item.type === 'INCOME' || (item.isLoan && item.type === 'GIVEN');
  const typeText = useMemo(() => {
    if (item.isLoan) return item.type === 'TAKEN' ? t('loanTakenType') : t('loanGivenType');
    return item.type === 'INCOME' ? t('incomeType') : t('expenseType');
  }, [item, t]);

  const paidAmount = item.payments?.reduce((s:number, p:any) => s + p.amount, 0) || 0;
  const remaining = item.isLoan ? (item.amount - paidAmount) : 0;

  const sortedPayments = useMemo(() => {
    if (!item.payments) return [];
    return [...item.payments].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [item.payments]);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" onClick={onClose}></div>
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-sm rounded-[3.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-500 overflow-y-auto max-h-[90vh] hide-scrollbar border border-white/20 dark:border-slate-800/50">
        <div className="flex justify-between items-start mb-12">
          <div className="flex items-center gap-5">
             <div className={`p-4 rounded-[1.5rem] shadow-2xl ${isIncome ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30' : 'bg-rose-50 text-rose-600 dark:bg-rose-900/30'}`}>
                {item.isLoan ? <HandCoins size={32} strokeWidth={2.5} /> : isIncome ? <TrendingUp size={32} strokeWidth={2.5} /> : <TrendingDown size={32} strokeWidth={2.5} />}
             </div>
             <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-none tracking-tight mb-2">{t('noteDetails')}</h2>
                <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${isIncome ? 'text-emerald-500' : 'text-rose-500'}`}>{typeText}</p>
             </div>
          </div>
          <button onClick={onClose} className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 transition-all active:scale-90"><X size={22} strokeWidth={3} /></button>
        </div>
        
        <div className="space-y-5">
          <DetailRow icon={<CalendarDays size={20} />} label={t('dateLabel')} value={new Date(item.date).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })} />
          <DetailRow icon={<Layers size={20} />} label={t('category')} value={item.category} />
          <DetailRow icon={<CheckCircle2 size={20} />} label={lang === 'bn' ? 'মোট পরিমাণ' : 'Total Amount'} value={`৳ ${item.amount.toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US')}`} isLarge />
          
          {item.isLoan && (
            <>
              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="bg-emerald-50/60 dark:bg-emerald-900/10 p-6 rounded-[2.2rem] border border-emerald-100 dark:border-emerald-800/30 shadow-sm">
                  <p className="text-[10px] font-black text-emerald-600/70 uppercase tracking-widest mb-2">{t('paidAmount')}</p>
                  <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">৳{paidAmount}</p>
                </div>
                <div className="bg-rose-50/60 dark:bg-rose-900/10 p-6 rounded-[2.2rem] border border-rose-100 dark:border-rose-800/30 shadow-sm">
                  <p className="text-[10px] font-black text-rose-600/70 uppercase tracking-widest mb-2">{t('remaining')}</p>
                  <p className="text-xl font-black text-rose-600 dark:text-rose-400 tabular-nums">৳{remaining}</p>
                </div>
              </div>
              
              {sortedPayments.length > 0 && (
                <div className="bg-slate-50 dark:bg-slate-800/40 p-7 rounded-[2.8rem] border border-slate-100 dark:border-slate-800/50 mt-6 shadow-inner">
                  <div className="flex items-center gap-3 mb-6">
                    <HistoryIcon size={18} className="text-slate-400" />
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">{t('paymentHistory')}</span>
                  </div>
                  <div className="space-y-4 max-h-[250px] overflow-y-auto hide-scrollbar pr-1">
                    {sortedPayments.map((p: any) => (
                      <div key={p.id} className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-[1.25rem] border border-slate-100 dark:border-slate-800/40 shadow-sm transition-transform hover:translate-x-1">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-1">{t('dateLabel')}</span>
                          <span className="text-[13px] font-black text-slate-700 dark:text-slate-300">
                            {new Date(p.date).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[16px] font-black text-emerald-600 dark:text-emerald-400 tabular-nums">৳{p.amount}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {item.note && (
            <div className="bg-blue-50/40 dark:bg-blue-900/10 p-7 rounded-[2.8rem] border border-blue-100/50 dark:border-blue-800/30 mt-8 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-2 h-full bg-blue-500/10"></div>
              <div className="flex items-center gap-3 mb-4 text-blue-600/90 dark:text-blue-400">
                <StickyNote size={20} strokeWidth={2.5} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{lang === 'en' ? 'Note' : 'নোট / তথ্য'}</span>
              </div>
              <p className="text-[15px] font-semibold text-slate-700 dark:text-slate-200 leading-relaxed italic">
                "{item.note}"
              </p>
            </div>
          )}
        </div>
        <button 
          onClick={onClose} 
          className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black py-6 rounded-[2.2rem] mt-12 active:scale-95 transition-all shadow-2xl text-lg tracking-tight"
        >
          {t('close')}
        </button>
      </div>
    </div>
  );
}

function DetailRow({ icon, label, value, isLarge = false }: any) {
  return (
    <div className="flex items-center justify-between p-6 rounded-[2.2rem] bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/50 group transition-all">
      <div className="flex items-center gap-4 text-slate-400 dark:text-slate-500">
        {React.cloneElement(icon, { strokeWidth: 2.5 })}
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">{label}</span>
      </div>
      <span className={`font-black tracking-tight text-slate-900 dark:text-white tabular-nums ${isLarge ? 'text-2xl' : 'text-[15px]'}`}>
        {value}
      </span>
    </div>
  );
}

function HistoryView({ t, lang, transactions, loans, onDelete, onEdit, theme, onShowDetail, onOpenSettleConfirm, onOpenPaymentModal }: any) {
  const [filter, setFilter] = useState('all');
  const accentBg = THEME_MAP[theme as ThemeColor].split(' ')[0];

  const items = useMemo(() => {
    let combined = [...transactions.map(t => ({...t, isLoan: false})), ...loans.map((l:any) => ({...l, isLoan: true, category: l.person, note: l.reason}))];
    if (filter === 'income') combined = transactions.filter((t:any) => t.type === 'INCOME').map(t => ({...t, isLoan: false}));
    if (filter === 'expense') combined = transactions.filter((t:any) => t.type === 'EXPENSE').map(t => ({...t, isLoan: false}));
    if (filter === 'taken') combined = loans.filter((l:any) => l.type === 'TAKEN').map((l:any) => ({...l, isLoan: true, category: l.person, note: l.reason}));
    if (filter === 'given') combined = loans.filter((l:any) => l.type === 'GIVEN').map((l:any) => ({...l, isLoan: true, category: l.person, note: l.reason}));
    return combined.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, loans, filter]);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2 px-1">
        {['all', 'income', 'expense', 'taken', 'given'].map(f => (
          <button 
            key={f} 
            onClick={() => setFilter(f)} 
            className={`px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] transition-all shrink-0 active:scale-95 shadow-sm border ${filter === f ? `${accentBg} text-white border-transparent ring-4 ring-offset-2 ring-transparent` : 'bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 border-slate-200/50 dark:border-slate-800/50 hover:bg-slate-50'}`}
          >
            {f === 'all' ? (lang === 'bn' ? 'সব' : 'All') : f === 'income' ? (lang === 'bn' ? 'আয়' : 'Income') : f === 'expense' ? (lang === 'bn' ? 'ব্যয়' : 'Expense') : f === 'taken' ? (lang === 'bn' ? 'ঋণ গ্রহণ' : 'Loan Taken') : (lang === 'bn' ? 'ঋণ প্রদান' : 'Loan Given')}
          </button>
        ))}
      </div>
      <div className="space-y-6 pb-28">
        {items.map((item:any) => (
          <TransactionCard 
            key={item.id} 
            item={item} 
            t={t} 
            lang={lang} 
            onShowDetail={onShowDetail} 
            onOpenPaymentModal={onOpenPaymentModal} 
            onOpenSettleConfirm={onOpenSettleConfirm} 
            onEdit={onEdit} 
            onDelete={onDelete} 
          />
        ))}
      </div>
    </div>
  );
}

function SummaryView({ t, lang, transactions, loans, theme }: any) {
  const [summaryType, setSummaryType] = useState<'finance' | 'loans'>('finance');
  const [viewMode, setViewMode] = useState<'monthly' | 'yearly' | 'custom'>('monthly');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, '0'));
  const [startMonth, setStartMonth] = useState(new Date().toISOString().substring(0, 7));
  const [endMonth, setEndMonth] = useState(new Date().toISOString().substring(0, 7));
  
  const accentClass = THEME_MAP[theme as ThemeColor].split(' ')[0];
  const accentText = THEME_MAP[theme as ThemeColor].split(' ')[2];
  
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    for (let y = 2022; y <= 2032; y++) { years.add(y.toString()); }
    transactions.forEach((tr: any) => years.add(tr.date.substring(0, 4)));
    loans.forEach((lo: any) => years.add(lo.date.substring(0, 4)));
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [transactions, loans]);

  const monthlyData = useMemo(() => {
    const allMonths: Record<string, { income: number, expense: number, loanGiven: number, loanTaken: number }> = {};
    transactions.forEach((tr: any) => {
      const month = tr.date.substring(0, 7);
      if (!allMonths[month]) allMonths[month] = { income: 0, expense: 0, loanGiven: 0, loanTaken: 0 };
      if (tr.type === 'INCOME') allMonths[month].income += tr.amount;
      else if (tr.type === 'EXPENSE') allMonths[month].expense += tr.amount;
    });
    loans.forEach((lo: any) => {
      const month = lo.date.substring(0, 7);
      if (!allMonths[month]) allMonths[month] = { income: 0, expense: 0, loanGiven: 0, loanTaken: 0 };
      const paymentsInMonth = lo.payments?.filter((p:any) => p.date.startsWith(month)).reduce((s:number, p:any) => s + p.amount, 0) || 0;
      if (lo.type === 'GIVEN') allMonths[month].loanGiven += paymentsInMonth;
      else if (lo.type === 'TAKEN') allMonths[month].loanTaken += paymentsInMonth;
    });
    const sortedMonths = Object.keys(allMonths).sort((a, b) => a.localeCompare(b));
    let runningBalance = 0;
    const records = sortedMonths.map(month => {
      const data = allMonths[month];
      const monthlyNet = data.income - data.expense + data.loanTaken - data.loanGiven;
      runningBalance += monthlyNet;
      return { month, ...data, financeBalance: data.income - data.expense, loanBalance: data.loanTaken - data.loanGiven, closingBalance: runningBalance };
    });
    if (viewMode === 'monthly') return records.filter(r => r.month === `${selectedYear}-${selectedMonth}`);
    if (viewMode === 'yearly') return records.filter(r => r.month.startsWith(selectedYear)).reverse();
    return records.filter(r => r.month >= startMonth && r.month <= endMonth).reverse();
  }, [transactions, loans, selectedYear, selectedMonth, viewMode, startMonth, endMonth]);

  const rangeTotals = useMemo(() => {
    return monthlyData.reduce((acc, curr) => ({
      income: acc.income + curr.income,
      expense: acc.expense + curr.expense,
      loanGiven: acc.loanGiven + curr.loanGiven,
      loanTaken: acc.loanTaken + curr.loanTaken,
    }), { income: 0, expense: 0, loanGiven: 0, loanTaken: 0 });
  }, [monthlyData]);

  const monthNames = lang === 'bn' 
    ? ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর']
    : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div className="space-y-10 animate-in slide-in-from-top-12 duration-1000 ease-out">
      <div className="flex flex-col gap-8 px-2">
        <h3 className="font-black text-3xl text-slate-900 dark:text-white drop-shadow-sm tracking-tight">{t('monthlySummary')}</h3>
        <div className="flex gap-2.5 p-2 bg-slate-100 dark:bg-slate-900 rounded-[2.2rem] shadow-inner border border-slate-200/40 dark:border-slate-800/40">
          <button onClick={() => setViewMode('monthly')} className={`flex-1 py-4 px-4 text-[11px] font-black uppercase tracking-[0.2em] rounded-[1.5rem] transition-all whitespace-nowrap ${viewMode === 'monthly' ? `${accentClass} text-white shadow-xl` : 'text-slate-400 dark:text-slate-600'}`}>{t('monthly')}</button>
          <button onClick={() => setViewMode('yearly')} className={`flex-1 py-4 px-4 text-[11px] font-black uppercase tracking-[0.2em] rounded-[1.5rem] transition-all whitespace-nowrap ${viewMode === 'yearly' ? `${accentClass} text-white shadow-xl` : 'text-slate-400 dark:text-slate-600'}`}>{t('yearly')}</button>
          <button onClick={() => setViewMode('custom')} className={`flex-1 py-4 px-4 text-[11px] font-black uppercase tracking-[0.2em] rounded-[1.5rem] transition-all whitespace-nowrap ${viewMode === 'custom' ? `${accentClass} text-white shadow-xl` : 'text-slate-400 dark:text-slate-600'}`}>{t('customRange')}</button>
        </div>
        
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[3.2rem] border border-slate-200/50 dark:border-slate-800/50 shadow-[0_25px_60px_-25px_rgba(0,0,0,0.06)] animate-in zoom-in-95 duration-500">
          {viewMode === 'monthly' ? (
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] ml-4">{lang === 'bn' ? 'বছর' : 'Year'}</label>
                <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className={`w-full bg-slate-50 dark:bg-slate-950/50 px-7 py-5 rounded-[1.5rem] text-[15px] font-black ${accentText} outline-none border border-slate-100 dark:border-slate-800 shadow-sm appearance-none cursor-pointer`}>{availableYears.map(y => <option key={y} value={y}>{y}</option>)}</select>
              </div>
              <div className="space-y-2.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] ml-4">{lang === 'bn' ? 'মাস' : 'Month'}</label>
                <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className={`w-full bg-slate-50 dark:bg-slate-950/50 px-7 py-5 rounded-[1.5rem] text-[15px] font-black ${accentText} outline-none border border-slate-100 dark:border-slate-800 shadow-sm appearance-none cursor-pointer`}>{monthNames.map((name, i) => (<option key={i} value={(i + 1).toString().padStart(2, '0')}>{name}</option>))}</select>
              </div>
            </div>
          ) : viewMode === 'yearly' ? (
             <div className="flex flex-col gap-3">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] ml-4">{lang === 'bn' ? 'বছর নির্বাচন করুন' : 'Select Year'}</label>
               <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className={`bg-slate-50 dark:bg-slate-950/50 px-10 py-5 rounded-[1.8rem] text-[16px] font-black ${accentText} outline-none border border-slate-100 dark:border-slate-800 shadow-sm appearance-none w-full`}>{availableYears.map(y => <option key={y} value={y}>{y}</option>)}</select>
             </div>
          ) : (
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2.5"><label className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-widest">{lang === 'bn' ? 'শুরু' : 'Start'}</label><input type="month" value={startMonth} onChange={e => setStartMonth(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950/50 p-5 rounded-[1.5rem] text-sm font-black outline-none border border-slate-100 dark:border-slate-800 dark:text-white" /></div>
              <div className="space-y-2.5"><label className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-widest">{lang === 'bn' ? 'শেষ' : 'End'}</label><input type="month" value={endMonth} onChange={e => setEndMonth(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950/50 p-5 rounded-[1.5rem] text-sm font-black outline-none border border-slate-100 dark:border-slate-800 dark:text-white" /></div>
            </div>
          )}
        </div>

        <div className="flex gap-5 p-2.5 bg-slate-100 dark:bg-slate-900 rounded-[2.5rem] shadow-inner border border-slate-200/30 dark:border-slate-800/30">
          <button onClick={() => setSummaryType('finance')} className={`flex-1 flex items-center justify-center gap-3.5 py-5 rounded-[1.8rem] text-[15px] font-black transition-all active:scale-95 ${summaryType === 'finance' ? `${accentClass} text-white shadow-xl` : 'text-slate-400 dark:text-slate-600'}`}>
            <TrendingUp size={20} strokeWidth={3} /> {t('finance')}
          </button>
          <button onClick={() => setSummaryType('loans')} className={`flex-1 flex items-center justify-center gap-3.5 py-5 rounded-[1.8rem] text-[15px] font-black transition-all active:scale-95 ${summaryType === 'loans' ? `${accentClass} text-white shadow-xl` : 'text-slate-400 dark:text-slate-600'}`}>
            <HandCoins size={20} strokeWidth={3} /> {t('loans')}
          </button>
        </div>
      </div>

      {monthlyData.length > 0 && (
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[3.8rem] border-2 border-dashed border-slate-200 dark:border-slate-800 mx-2 text-center group transition-all hover:border-solid hover:border-slate-300 dark:hover:border-slate-700 shadow-sm">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-8">
            {viewMode === 'yearly' ? `${selectedYear} ${lang === 'bn' ? 'এর মোট হিসাব' : 'Totals'}` : (lang === 'bn' ? 'সামগ্রিক সারসংক্ষেপ' : 'Overall Totals')}
          </p>
          <div className="grid grid-cols-2 gap-12">
            <div className="space-y-3">
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{summaryType === 'finance' ? t('totalIncome') : t('loanTaken')}</p>
              <p className="text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter">৳{(summaryType === 'finance' ? rangeTotals.income : rangeTotals.loanTaken).toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US')}</p>
            </div>
            <div className="space-y-3 border-l border-slate-100 dark:border-slate-800/60 pl-12">
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{summaryType === 'finance' ? t('totalExpense') : t('loanGiven')}</p>
              <p className="text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter">৳{(summaryType === 'finance' ? rangeTotals.expense : rangeTotals.loanGiven).toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US')}</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-8 pb-28 px-2">
        {monthlyData.map((data: any) => (
          <div key={data.month} className="bg-white dark:bg-slate-900 rounded-[3.2rem] border border-slate-200/50 dark:border-slate-800/50 shadow-[0_15px_35px_-15px_rgba(0,0,0,0.06)] overflow-hidden transition-all hover:shadow-2xl hover:scale-[1.02]">
            <div className="bg-slate-50/70 dark:bg-slate-950/70 px-10 py-7 flex justify-between items-center border-b dark:border-slate-800/50 backdrop-blur-md">
              <p className="font-black text-[14px] uppercase tracking-[0.2em] text-slate-900 dark:text-white">
                {new Date(data.month + '-01').toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', { month: 'long', year: 'numeric' })}
              </p>
              <div className={`text-[10px] font-black px-6 py-2.5 rounded-full tabular-nums shadow-sm ${summaryType === 'finance' ? (data.financeBalance >= 0 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30' : 'bg-rose-50 text-rose-600 dark:bg-rose-900/30') : (data.loanBalance >= 0 ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/30' : 'bg-blue-50 text-blue-600 dark:bg-blue-900/30')}`}>
                {summaryType === 'finance' ? t('balance') : t('netLoan')}: ৳{Math.abs(summaryType === 'finance' ? data.financeBalance : data.loanBalance).toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US')}
              </div>
            </div>
            <div className="p-12 grid grid-cols-2 gap-16">
              {summaryType === 'finance' ? (
                <>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-emerald-600/50 dark:text-emerald-400/50 uppercase tracking-widest">{t('totalIncome')}</p>
                    <p className="text-4xl font-black text-slate-900 dark:text-white tabular-nums truncate tracking-tighter">৳{data.income.toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US')}</p>
                  </div>
                  <div className="space-y-2 text-right">
                    <p className="text-[10px] font-black text-rose-600/50 dark:text-rose-400/50 uppercase tracking-widest">{t('totalExpense')}</p>
                    <p className="text-4xl font-black text-slate-900 dark:text-white tabular-nums truncate tracking-tighter">৳{data.expense.toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US')}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-orange-600/50 dark:text-orange-400/50 uppercase tracking-widest">{t('loanTaken')}</p>
                    <p className="text-4xl font-black text-slate-900 dark:text-white tabular-nums truncate tracking-tighter">৳{data.loanTaken.toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US')}</p>
                  </div>
                  <div className="space-y-2 text-right">
                    <p className="text-[10px] font-black text-blue-600/50 dark:text-blue-400/50 uppercase tracking-widest">{t('loanGiven')}</p>
                    <p className="text-4xl font-black text-slate-900 dark:text-white tabular-nums truncate tracking-tighter">৳{data.loanGiven.toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US')}</p>
                  </div>
                </>
              )}
            </div>
            <div className="px-10 pb-10 text-center border-t dark:border-slate-800/50 pt-8 bg-slate-50/30 dark:bg-slate-950/20">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">{t('closingBalance')}</p>
              <p className={`text-2xl font-black tabular-nums tracking-tight ${data.closingBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                ৳{data.closingBalance.toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US')}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReportsView({ t, lang, transactions, isDark, theme, categories }: any) {
  const [rangeType, setRangeType] = useState<'weekly' | 'monthly' | 'custom'>('monthly');
  const [catFilter, setCatFilter] = useState('all');
  const [customStart, setCustomStart] = useState(new Date().toISOString().split('T')[0]);
  const [customEnd, setCustomEnd] = useState(new Date().toISOString().split('T')[0]);
  const activeColorHex = useMemo(() => theme === 'custom' ? 'var(--theme-color)' : PRESET_COLORS[theme] || '#4f46e5', [theme]);
  
  const filteredTransactions = useMemo(() => transactions.filter((tr: Transaction) => { 
    if (catFilter !== 'all' && tr.category !== catFilter) return false; 
    const trDate = new Date(tr.date); 
    const now = new Date(); 
    if (rangeType === 'weekly') { 
      const weekAgo = new Date(); weekAgo.setDate(now.getDate() - 7); return trDate >= weekAgo; 
    } else if (rangeType === 'monthly') { 
      return trDate.getMonth() === now.getMonth() && trDate.getFullYear() === now.getFullYear(); 
    } else if (rangeType === 'custom') { 
      const start = new Date(customStart); const end = new Date(customEnd); 
      start.setHours(0,0,0,0); end.setHours(23,59,59,999); return trDate >= start && trDate <= end; 
    } return true; 
  }), [transactions, rangeType, catFilter, customStart, customEnd]);

  const chartData = useMemo(() => { 
    const isDaily = rangeType === 'weekly' || (rangeType === 'custom' && (new Date(customEnd).getTime() - new Date(customStart).getTime()) < 30 * 24 * 60 * 60 * 1000); 
    const groups: Record<string, { income: number, expense: number }> = {}; 
    filteredTransactions.forEach((t: any) => { 
      const key = isDaily ? t.date : t.date.substring(0, 7); 
      if (!groups[key]) groups[key] = { income: 0, expense: 0 }; 
      if (t.type === 'INCOME') groups[key].income += t.amount; else groups[key].expense += t.amount; 
    }); return Object.entries(groups).map(([name, val]) => ({ name, ...val })).sort((a, b) => a.name.localeCompare(b.name)); 
  }, [filteredTransactions, rangeType, customStart, customEnd]);

  const pieData = useMemo(() => { 
    const cats: Record<string, number> = {}; 
    filteredTransactions.filter((t: any) => t.type === 'EXPENSE').forEach((t: any) => { 
      cats[t.category] = (cats[t.category] || 0) + t.amount; 
    }); return Object.entries(cats).map(([name, value]) => ({ name, value })); 
  }, [filteredTransactions]);

  const stats = useMemo(() => { 
    const inc = filteredTransactions.filter((t: any) => t.type === 'INCOME').reduce((s,t) => s + t.amount, 0); 
    const exp = filteredTransactions.filter((t: any) => t.type === 'EXPENSE').reduce((s,t) => s + t.amount, 0); 
    return { income: inc, expense: exp, balance: inc - exp }; 
  }, [filteredTransactions]);

  const COLORS = [activeColorHex, '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
  const accentClass = THEME_MAP[theme].split(' ')[0];
  const accentText = THEME_MAP[theme].split(' ')[2];

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-28">
      <div className="bg-white dark:bg-slate-900 p-10 rounded-[3.2rem] border border-slate-200/50 dark:border-slate-800/50 shadow-sm space-y-10">
        <div className="flex items-center gap-4">
          <div className={`p-3.5 rounded-[1.2rem] bg-slate-50 dark:bg-slate-950 shadow-sm ${accentText}`}>
            <Filter size={24} strokeWidth={3} />
          </div>
          <h3 className="font-black text-xl uppercase tracking-wider">{t('stats')}</h3>
        </div>
        <div className="flex gap-2.5 p-2 bg-slate-50 dark:bg-slate-950/50 rounded-[1.8rem] shadow-inner border border-slate-200/30 dark:border-slate-800/50">
          {['weekly', 'monthly', 'custom'].map((r: any) => (
            <button key={r} onClick={() => setRangeType(r)} className={`flex-1 py-4 text-[11px] font-black uppercase tracking-widest rounded-[1.25rem] transition-all ${rangeType === r ? `${accentClass} text-white shadow-xl` : 'text-slate-400 dark:text-slate-600'}`}>{t(r === 'custom' ? 'customRange' : r)}</button>
          ))}
        </div>
        <div className="space-y-3.5">
          <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-4">{t('category')}</label>
          <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className="w-full p-6 bg-slate-50 dark:bg-slate-950/50 rounded-[2.2rem] border border-slate-100 dark:border-slate-800 outline-none font-black text-[15px] text-slate-900 dark:text-white appearance-none shadow-sm cursor-pointer transition-all focus:ring-4 ring-slate-100 dark:ring-slate-800/50">
            <option value="all">{t('allCategories')}</option>
            {Array.from(new Set(categories.map((c: any) => c.label))).map((catLabel: any) => (
              <option key={catLabel} value={catLabel}>{catLabel}</option>
            ))}
          </select>
        </div>
        {rangeType === 'custom' && (
          <div className="grid grid-cols-2 gap-5 animate-in slide-in-from-top-6 duration-500">
            <div className="space-y-2.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">{t('startDate')}</label>
              <input type="date" className="w-full p-5 bg-slate-50 dark:bg-slate-950/50 rounded-[1.8rem] border border-slate-100 dark:border-slate-800 outline-none font-black text-xs dark:text-white tabular-nums shadow-sm" value={customStart} onChange={e => setCustomStart(e.target.value)} />
            </div>
            <div className="space-y-2.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">{t('endDate')}</label>
              <input type="date" className="w-full p-5 bg-slate-50 dark:bg-slate-950/50 rounded-[1.8rem] border border-slate-100 dark:border-slate-800 outline-none font-black text-xs dark:text-white tabular-nums shadow-sm" value={customEnd} onChange={e => setCustomEnd(e.target.value)} />
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatBadge label={t('totalIncome')} value={stats.income} color="emerald" lang={lang} />
        <StatBadge label={t('totalExpense')} value={stats.expense} color="rose" lang={lang} />
        <StatBadge label={t('balance')} value={stats.balance} color="blue" lang={lang} />
      </div>

      <div className="bg-white dark:bg-slate-900 p-10 rounded-[3.8rem] border border-slate-200/50 dark:border-slate-800/50 shadow-sm">
        <h3 className="font-black text-2xl mb-10 tracking-tight text-slate-900 dark:text-white">
          {rangeType === 'weekly' ? t('weekly') : rangeType === 'monthly' ? t('monthly') : t('customRange')} {lang === 'bn' ? 'বিশ্লেষণ' : 'Analysis'}
        </h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#1e293b' : '#f1f5f9'} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: isDark ? '#475569' : '#94a3b8'}} tickFormatter={(v) => rangeType === 'weekly' ? v.split('-').pop() : v} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: isDark ? '#475569' : '#94a3b8'}} />
              <Tooltip 
                cursor={{fill: 'transparent'}} 
                contentStyle={{ backgroundColor: isDark ? '#0f172a' : '#fff', borderRadius: '28px', border: 'none', boxShadow: '0 25px 60px -15px rgba(0,0,0,0.3)', fontSize: '13px', fontWeight: 'bold' }} 
              />
              <Bar dataKey="income" name={t('totalIncome')} fill="#10b981" radius={[10, 10, 10, 10]} barSize={14} />
              <Bar dataKey="expense" name={t('totalExpense')} fill="#ef4444" radius={[10, 10, 10, 10]} barSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-10 rounded-[3.8rem] border border-slate-200/50 dark:border-slate-800/50 shadow-sm">
        <h3 className="font-black text-2xl mb-10 tracking-tight text-slate-900 dark:text-white">{t('totalExpense')} {lang === 'bn' ? 'বিভাগভিত্তিক' : 'by Category'}</h3>
        <div className="h-[300px] w-full">
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} innerRadius={80} outerRadius={110} paddingAngle={10} cornerRadius={16} dataKey="value" stroke="none">
                  {pieData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: isDark ? '#0f172a' : '#fff', borderRadius: '24px', border: 'none', boxShadow: '0 25px 60px -15px rgba(0,0,0,0.2)' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center opacity-10">
              <ClipboardList size={64} strokeWidth={1} className="mb-6" />
              <p className="text-lg font-black italic">{lang === 'bn' ? 'কোন তথ্য নেই' : 'No data'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatBadge({ label, value, color, lang }: any) {
  const colors: Record<string, string> = {
    emerald: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100/50 dark:border-emerald-800/30',
    rose: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20 border-rose-100/50 dark:border-rose-800/30',
    blue: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 border-blue-100/50 dark:border-blue-800/30'
  };
  return (
    <div className={`p-6 rounded-[2.5rem] border shadow-sm text-center transition-all hover:scale-110 active:scale-95 ${colors[color]}`}>
      <p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-70 leading-none">{label}</p>
      <p className={`text-[16px] font-black tabular-nums truncate tracking-tight text-slate-900 dark:text-white`}>৳{value.toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US')}</p>
    </div>
  );
}

function NotesView({ t, notes, setNotes, theme }: any) {
  const [activeMonth, setActiveMonth] = useState(new Date().toISOString().substring(0, 7));
  const currentNote = notes.find((n: any) => n.month === activeMonth);
  const accentText = THEME_MAP[theme as ThemeColor].split(' ')[2];
  const handleSave = (text: string) => { 
    if (currentNote) { setNotes(notes.map((n: any) => n.month === activeMonth ? { ...n, text } : n)); } 
    else { setNotes([...notes, { id: crypto.randomUUID(), month: activeMonth, text }]); }
  };
  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      <div className="flex items-center justify-between px-3">
        <h3 className="font-black text-3xl text-slate-900 dark:text-white drop-shadow-sm tracking-tight">{t('monthlySummary') === 'Monthly Summary' ? 'Notes' : 'নোটস'}</h3>
        <input type="month" value={activeMonth} onChange={e => setActiveMonth(e.target.value)} className={`bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 font-black text-[14px] ${accentText} outline-none transition-all shadow-sm focus:ring-4 ring-slate-100 dark:ring-slate-800/50 cursor-pointer`} />
      </div>
      <div className="relative group">
        <div className={`absolute -inset-1.5 bg-gradient-to-tr ${THEME_GRADIENT[theme as ThemeColor]} rounded-[4rem] opacity-5 group-focus-within:opacity-15 blur-2xl transition-all duration-700`}></div>
        <textarea 
          className="relative w-full h-[65vh] p-12 rounded-[3.5rem] bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 focus:ring-0 outline-none text-[16px] font-semibold leading-relaxed shadow-[0_40px_100px_-30px_rgba(0,0,0,0.12)] transition-all text-slate-800 dark:text-slate-100 placeholder-slate-300 dark:placeholder-slate-700 resize-none hide-scrollbar scroll-smooth" 
          placeholder={t('save') === 'Save Changes' ? 'Type your thoughts for this month...' : 'এই মাসের জরুরি কিছু লিখে রাখুন...'} 
          value={currentNote?.text || ''} 
          onChange={e => handleSave(e.target.value)} 
        />
      </div>
    </div>
  );
}

function SettingsView({ t, lang, settings, onUpdateSettings, onExport, onImport, theme, onShowDevProfile, onManageCategories, onShowUsageGuide }: any) {
  const [notifPermission, setNotifPermission] = useState(Notification.permission);
  const accentClass = THEME_MAP[theme as ThemeColor].split(' ')[0];
  const accentText = THEME_MAP[theme as ThemeColor].split(' ')[2];
  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-28">
      <SectionCard title={t('language')} icon={<Languages size={22} />} accentText={accentText}>
        <div className="flex gap-4 p-2 bg-slate-50 dark:bg-slate-950/50 rounded-[1.8rem] shadow-inner mt-6 border border-slate-200/40 dark:border-slate-800/40">
          <button onClick={() => onUpdateSettings({ language: 'bn' })} className={`flex-1 py-4 text-xs font-black rounded-2xl transition-all ${settings.language === 'bn' ? `${accentClass} text-white shadow-xl` : 'text-slate-400 dark:text-slate-600'}`}>বাংলা</button>
          <button onClick={() => onUpdateSettings({ language: 'en' })} className={`flex-1 py-4 text-xs font-black rounded-2xl transition-all ${settings.language === 'en' ? `${accentClass} text-white shadow-xl` : 'text-slate-400 dark:text-slate-600'}`}>English</button>
        </div>
      </SectionCard>

      <SectionCard title={t('themeColor')} icon={<Palette size={22} />} accentText={accentText}>
        <div className="flex flex-wrap gap-6 px-2 items-center mt-8">
          {(['indigo', 'emerald', 'rose', 'amber'] as ThemeColor[]).map(c => (
            <button key={c} onClick={() => onUpdateSettings({ themeColor: c })} className={`w-12 h-12 rounded-[1.25rem] flex items-center justify-center transition-all ${THEME_MAP[c].split(' ')[0]} ${settings.themeColor === c ? 'ring-4 ring-offset-4 ring-slate-100 dark:ring-slate-800 scale-110 shadow-2xl' : 'opacity-40 hover:opacity-100'}`}>
              {settings.themeColor === c && <Check className="text-white" size={24} strokeWidth={4}/>}
            </button>
          ))}
          <div className="flex items-center gap-5">
            <button onClick={() => onUpdateSettings({ themeColor: 'custom' })} className={`w-12 h-12 rounded-[1.25rem] flex items-center justify-center transition-all bg-gradient-to-br from-slate-200 to-slate-400 dark:from-slate-700 dark:to-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-600 ${settings.themeColor === 'custom' ? 'ring-4 ring-offset-4 ring-slate-100 dark:ring-slate-800 scale-110 shadow-2xl' : 'opacity-40 hover:opacity-100'}`} style={settings.themeColor === 'custom' ? { backgroundColor: settings.customHex } : {}}>
              {settings.themeColor === 'custom' ? <Check className="text-white" size={24} strokeWidth={4}/> : <Pipette className="text-slate-500 dark:text-slate-300" size={22}/>}
            </button>
            {settings.themeColor === 'custom' && (
              <div className="flex items-center bg-white dark:bg-slate-950 px-5 py-3 rounded-[1.25rem] border border-slate-200 dark:border-slate-800 shadow-sm animate-in slide-in-from-left-6 duration-500">
                <input type="color" value={settings.customHex || '#6366f1'} onChange={e => onUpdateSettings({ customHex: e.target.value })} className="w-8 h-8 border-none bg-transparent cursor-pointer rounded-lg overflow-hidden" />
                <span className="text-[11px] font-black ml-4 uppercase text-slate-500 tabular-nums tracking-wider">{settings.customHex}</span>
              </div>
            )}
          </div>
        </div>
      </SectionCard>

      <SectionCard title={t('reminder')} icon={<Bell size={22} />} accentText="text-orange-500">
        <div className="flex items-center justify-between mt-8">
          <div className="flex flex-col">
            <span className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{lang === 'bn' ? 'নোটিফিকেশন সময়' : 'Notification Time'}</span>
            {settings.reminderEnabled && (
              <input type="time" value={settings.reminderTime} onChange={e => onUpdateSettings({ reminderTime: e.target.value })} className="bg-transparent border-none font-black text-3xl outline-none text-slate-900 dark:text-white tabular-nums mt-1.5 tracking-tight" />
            )}
          </div>
          <button onClick={() => onUpdateSettings({ reminderEnabled: !settings.reminderEnabled })} className={`w-16 h-9 rounded-full transition-all relative shadow-inner p-1 ${settings.reminderEnabled ? accentClass : 'bg-slate-200 dark:bg-slate-800'}`}>
            <div className={`w-7 h-7 bg-white rounded-full transition-all shadow-xl absolute top-1 ${settings.reminderEnabled ? 'left-[33px]' : 'left-1'}`}></div>
          </button>
        </div>
        {settings.reminderEnabled && notifPermission !== 'granted' && (
          <button onClick={async () => { const res = await Notification.requestPermission(); setNotifPermission(res); }} className="w-full mt-8 bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[11px] font-black py-5 rounded-[1.8rem] border border-orange-500/20 shadow-sm active:scale-95 transition-all">
            {lang === 'bn' ? 'নোটিফিকেশন পারমিশন দিন' : 'Allow Notifications'}
          </button>
        )}
      </SectionCard>

      <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] border border-slate-200/60 dark:border-slate-800/60 overflow-hidden shadow-sm">
        <SettingAction icon={<ListFilter />} label={t('manageCategories')} subLabel={lang === 'bn' ? 'আয়-ব্যয় ক্যাটাগরি ম্যানেজ' : 'Categories'} color="emerald" onClick={onManageCategories} />
        <SettingAction icon={<BookOpen />} label={t('usageGuide')} subLabel={lang === 'bn' ? 'ব্যবহার বিধি দেখুন' : 'How to guide'} color="amber" onClick={onShowUsageGuide} />
        <SettingAction icon={<Download />} label={t('backup')} subLabel={lang === 'bn' ? 'JSON ব্যাকআপ ডাউনলোড' : 'Export data'} color="blue" onClick={onExport} />
        <label className="group block"><SettingAction icon={<Upload />} label={t('restore')} subLabel={lang === 'bn' ? 'পুরানো ডাটা রিস্টোর' : 'Import data'} color="violet" isLast isLabel /><input type="file" accept=".json" onChange={onImport} className="hidden" /></label>
        <SettingAction icon={<User />} label={t('devProfile')} subLabel={lang === 'bn' ? 'ডেভেলপার পরিচিতি' : 'Meet MD. Shahin'} color="pink" onClick={onShowDevProfile} />
      </div>

      <div className="text-center p-16 opacity-20 grayscale hover:opacity-40 transition-all duration-700">
        <FileText size={56} strokeWidth={1} className="mx-auto mb-8 text-slate-300 dark:text-slate-600" />
        <p className="text-[12px] font-black uppercase tracking-[0.5em] text-slate-400 dark:text-slate-500 mb-2">{t('appTitle')} v2.5</p>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'bn' ? 'অফলাইন ডিজিটাল হিসাব ডায়েরি' : 'Your Digital Khata'}</p>
      </div>
    </div>
  );
}

function SectionCard({ title, icon, children, accentText }: any) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] border border-slate-200/80 dark:border-slate-800/80 p-10 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)] transition-all hover:shadow-lg">
      <div className="flex items-center gap-5">
        <div className={`p-4 rounded-[1.25rem] bg-slate-50 dark:bg-slate-950/50 ${accentText} shadow-inner`}>{icon}</div>
        <h3 className="font-black text-[17px] text-slate-900 dark:text-white uppercase tracking-[0.1em]">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function SettingAction({ icon, label, subLabel, color, onClick, isLast, isLabel }: any) {
  const colors: any = {
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
    violet: 'bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400',
    pink: 'bg-pink-50 text-pink-600 dark:bg-pink-950/40 dark:text-pink-400',
  };
  
  const content = (
    <div className={`w-full p-8 flex items-center gap-7 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all cursor-pointer ${!isLast ? 'border-b dark:border-slate-800/60' : ''}`}>
      <div className={`${colors[color]} p-5 rounded-[1.5rem] shadow-sm transition-all group-hover:scale-110`}>{icon}</div>
      <div className="flex-1 text-left">
        <p className="font-black text-[16px] text-slate-900 dark:text-white mb-1 tracking-tight">{label}</p>
        <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{subLabel}</p>
      </div>
      <ArrowRight size={20} className="text-slate-200 dark:text-slate-700 transition-all group-hover:text-slate-400 group-hover:translate-x-1" strokeWidth={3} />
    </div>
  );

  return isLabel ? <span className="block">{content}</span> : <button onClick={onClick} className="w-full block group">{content}</button>;
}

function PaymentModal({ t, lang, loan, onClose, onSubmit, theme }: any) {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const accentClass = THEME_MAP[theme as ThemeColor].split(' ')[0];
  const paid = loan.payments?.reduce((s:number, p:any) => s + p.amount, 0) || 0;
  const remaining = loan.amount - paid;

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" onClick={onClose}></div>
      <div className="relative bg-white dark:bg-slate-900 w-full max-sm:w-[95%] max-w-sm rounded-[3.8rem] p-12 shadow-2xl border border-white/10 dark:border-slate-800/50 animate-in zoom-in-95 duration-500">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{t('addPayment')}</h2>
          <button onClick={onClose} className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 transition-all active:scale-90"><X size={22} strokeWidth={3} /></button>
        </div>
        <div className="bg-slate-50 dark:bg-slate-950/50 p-8 rounded-[2.5rem] mb-12 flex justify-between items-center border border-slate-200/50 dark:border-slate-800/50 shadow-inner">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('remaining')}</p>
            <p className="text-3xl font-black text-rose-500 tabular-nums tracking-tighter">৳{remaining}</p>
          </div>
          <div className="text-right space-y-1 border-l border-slate-200 dark:border-slate-800 pl-8">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('paidAmount')}</p>
            <p className="text-xl font-black text-emerald-500 tabular-nums">৳{paid}</p>
          </div>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); if(parseFloat(amount) > 0) onSubmit({ amount: parseFloat(amount), date, note: '' }); }} className="space-y-8">
          <div className="space-y-3">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-6">{lang === 'bn' ? 'পরিমাণ' : 'Amount'}</label>
            <input type="number" required autoFocus value={amount} onChange={e => setAmount(e.target.value)} className="w-full p-8 bg-slate-50 dark:bg-slate-950/50 rounded-[2.2rem] border-none outline-none font-black text-4xl text-slate-900 dark:text-white tabular-nums shadow-inner focus:ring-4 ring-slate-100 dark:ring-slate-800/40 transition-all" placeholder="0" />
          </div>
          <div className="space-y-3">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-6">{t('dateLabel')}</label>
            <input type="date" required value={date} onChange={e => setDate(e.target.value)} className="w-full p-6 bg-slate-50 dark:bg-slate-950/50 rounded-[1.8rem] border-none outline-none font-black text-sm text-slate-900 dark:text-white tabular-nums shadow-inner" />
          </div>
          <button type="submit" className={`w-full ${accentClass} text-white font-black py-7 rounded-[2.5rem] shadow-2xl shadow-slate-200 dark:shadow-none active:scale-95 transition-all text-xl mt-8 tracking-tight`}>
            {lang === 'bn' ? 'নিশ্চিত করুন' : 'Confirm'}
          </button>
        </form>
      </div>
    </div>
  );
}

function DeleteConfirmModal({ t, onClose, onConfirm }: any) {
  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" onClick={onClose}></div>
      <div className="relative bg-white dark:bg-slate-900 w-full max-sm:w-[95%] max-w-sm rounded-[3.8rem] p-12 shadow-2xl text-center border border-white/10 dark:border-slate-800/50">
        <div className="w-28 h-28 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-10 shadow-inner">
          <Trash2 size={56} strokeWidth={2.5} />
        </div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">{t('confirmDelete')}</h2>
        <p className="text-slate-500 dark:text-slate-400 text-[15px] font-bold leading-relaxed mb-12 px-6">{t('deleteWarn')}</p>
        <div className="flex flex-col gap-5">
          <button onClick={onConfirm} className="w-full bg-rose-500 hover:bg-rose-600 text-white font-black py-6 rounded-[2.2rem] shadow-2xl shadow-rose-200 dark:shadow-none active:scale-95 transition-all text-xl">{t('deleteBtn')}</button>
          <button onClick={onClose} className="w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-black py-6 rounded-[2.2rem] active:scale-95 transition-all text-xl">{t('cancelBtn')}</button>
        </div>
      </div>
    </div>
  );
}

function SettleConfirmModal({ t, lang, loan, onClose, onConfirm }: any) {
  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" onClick={onClose}></div>
      <div className="relative bg-white dark:bg-slate-900 w-full max-sm:w-[95%] max-w-sm rounded-[3.8rem] p-12 shadow-2xl text-center border border-white/10 dark:border-slate-800/50">
        <div className="w-28 h-28 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-10 shadow-inner">
          <CheckCircle size={56} strokeWidth={2.5} />
        </div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">{t('confirmSettle')}</h2>
        <div className="bg-slate-50 dark:bg-slate-950/50 p-8 rounded-[2.5rem] mb-12 shadow-inner border border-slate-100 dark:border-slate-800/40">
          <p className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2">{loan.person}</p>
          <p className="text-4xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums tracking-tighter">৳{loan.amount}</p>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-[15px] font-bold leading-relaxed mb-12 px-6">{t('settleWarn')}</p>
        <div className="flex flex-col gap-5">
          <button onClick={onConfirm} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-6 rounded-[2.2rem] shadow-2xl shadow-emerald-200 dark:shadow-none active:scale-95 transition-all text-xl">{t('yesSettle')}</button>
          <button onClick={onClose} className="w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-black py-6 rounded-[2.2rem] active:scale-95 transition-all text-xl">{t('cancelBtn')}</button>
        </div>
      </div>
    </div>
  );
}

function EntryModal({ t, lang, onClose, onSubmit, theme, categories, onUpdateKhata, initialData }: any) {
  const [entryType, setEntryType] = useState<TransactionType | LoanType>(initialData?.type || 'EXPENSE');
  const [amount, setAmount] = useState(initialData?.amount?.toString() || '');
  const [category, setCategory] = useState(initialData?.category || '');
  const [person, setPerson] = useState(initialData?.person || '');
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(initialData?.dueDate || new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState(initialData?.note || initialData?.reason || '');
  const [newCategoryLabel, setNewCategoryLabel] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const accentClass = THEME_MAP[theme as ThemeColor].split(' ')[0];
  const accentText = THEME_MAP[theme as ThemeColor].split(' ')[2];
  
  const filteredCategories = categories.filter((c: any) => c.type === (entryType === 'INCOME' ? 'INCOME' : 'EXPENSE'));

  return (
    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-6 animate-in fade-in duration-500">
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-t-[4rem] sm:rounded-[4rem] p-10 pt-12 shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95 duration-700 overflow-y-auto max-h-[96vh] hide-scrollbar border border-white/20 dark:border-slate-800/50">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{initialData ? t('editEntry') : t('addEntry')}</h2>
          <button onClick={onClose} className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 active:scale-90 transition-all"><X size={22} strokeWidth={3} /></button>
        </div>
        
        <div className="flex gap-2.5 p-2 bg-slate-100 dark:bg-slate-950/50 rounded-[2.2rem] mb-12 shadow-inner border border-slate-200/40 dark:border-slate-800/40">
          {['INCOME', 'EXPENSE', 'TAKEN', 'GIVEN'].map((type) => (
            <button key={type} onClick={() => { setEntryType(type as any); setCategory(''); }} className={`flex-1 py-4 text-[11px] font-black uppercase tracking-widest rounded-[1.4rem] transition-all active:scale-95 ${entryType === type ? `${accentClass} text-white shadow-xl` : 'text-slate-400 dark:text-slate-600'}`}>
              {type === 'INCOME' ? 'আয়' : type === 'EXPENSE' ? 'ব্যয়' : type === 'TAKEN' ? 'গ্রহণ' : 'প্রদান'}
            </button>
          ))}
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSubmit({ entryType, amount: parseFloat(amount), category, person, date, dueDate, note }); }} className="space-y-10">
          <div className="space-y-4">
            <label className="text-[12px] font-black text-slate-400 uppercase tracking-[0.3em] ml-6">{lang === 'bn' ? 'টাকার পরিমাণ' : 'Amount'}</label>
            <input type="number" required autoFocus value={amount} onChange={e => setAmount(e.target.value)} className="w-full p-10 bg-slate-50 dark:bg-slate-950/50 rounded-[3rem] border-none outline-none font-black text-5xl text-slate-900 dark:text-white placeholder-slate-200 dark:placeholder-slate-800 focus:ring-4 focus:ring-opacity-10 transition-all shadow-inner tabular-nums tracking-tighter" placeholder="0" />
          </div>

          {(entryType === 'INCOME' || entryType === 'EXPENSE') ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center ml-6 mr-4">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{t('category')}</label>
                <button type="button" onClick={() => setShowAddCategory(!showAddCategory)} className={`text-[10px] font-black uppercase tracking-[0.25em] px-5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950/50 ${accentText} active:scale-95 transition-all shadow-sm`}>
                  {showAddCategory ? t('close') : '+ নতুন'}
                </button>
              </div>
              {showAddCategory ? (
                <div className="flex gap-4 animate-in slide-in-from-top-6 duration-500">
                  <input type="text" value={newCategoryLabel} onChange={e => setNewCategoryLabel(e.target.value)} className="flex-1 p-6 bg-slate-50 dark:bg-slate-950/50 rounded-[2rem] border-none outline-none font-black text-[15px] text-slate-900 dark:text-white shadow-inner" placeholder="নতুন নাম লিখুন" />
                  <button type="button" onClick={() => { if(!newCategoryLabel) return; onUpdateKhata({ categories: [...categories, { id: crypto.randomUUID(), label: newCategoryLabel, type: entryType as TransactionType }] }); setCategory(newCategoryLabel); setNewCategoryLabel(''); setShowAddCategory(false); }} className={`p-6 ${accentClass} text-white rounded-[2rem] shadow-2xl active:scale-90 transition-all`}>
                    <Check size={28} strokeWidth={4} />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {filteredCategories.map((cat: any) => (
                    <button key={cat.id} type="button" onClick={() => setCategory(cat.label)} className={`p-5 rounded-[1.8rem] text-[12px] font-black uppercase tracking-tight transition-all border break-words ${category === cat.label ? `${accentClass} text-white border-transparent shadow-2xl scale-105 z-10` : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-800 hover:bg-slate-50'}`}>
                      {cat.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-6">{lang === 'bn' ? 'ব্যক্তির নাম' : 'Person Name'}</label>
              <div className="relative group">
                <div className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-600 transition-colors"><User size={22} /></div>
                <input type="text" required value={person} onChange={e => setPerson(e.target.value)} className="w-full p-6 pl-20 bg-slate-50 dark:bg-slate-950/50 rounded-[2.5rem] border-none outline-none font-black text-[17px] text-slate-900 dark:text-white shadow-inner" placeholder="নাম লিখুন" />
              </div>
            </div>
          )}

          <div className={`grid ${entryType === 'TAKEN' || entryType === 'GIVEN' ? 'grid-cols-2' : 'grid-cols-1'} gap-6`}>
            <div className="space-y-4">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-6">{t('startDate')}</label>
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400"><Calendar size={20} /></div>
                <input type="date" required value={date} onChange={e => setDate(e.target.value)} className="w-full p-6 pl-16 bg-slate-50 dark:bg-slate-950/50 rounded-[2.2rem] border-none outline-none font-black text-sm tabular-nums text-slate-900 dark:text-white" />
              </div>
            </div>
            {(entryType === 'TAKEN' || entryType === 'GIVEN') && (
              <div className="space-y-4">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-6">{lang === 'bn' ? 'পরিশোধ' : 'Due'}</label>
                <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400"><Calendar size={20} /></div>
                  <input type="date" required value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full p-6 pl-16 bg-slate-50 dark:bg-slate-950/50 rounded-[2.2rem] border-none outline-none font-black text-sm tabular-nums text-slate-900 dark:text-white" />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-6">নোট / কারণ</label>
            <div className="relative group">
              <div className="absolute left-8 top-8 text-slate-400 group-focus-within:text-slate-600 transition-colors"><FileText size={22} /></div>
              <textarea value={note} onChange={e => setNote(e.target.value)} className="w-full p-8 pl-20 bg-slate-50 dark:bg-slate-950/50 rounded-[2.8rem] border-none outline-none font-bold text-[17px] text-slate-900 dark:text-white min-h-[160px] shadow-inner transition-all focus:ring-4 focus:ring-opacity-10" placeholder="বিস্তারিত কিছু..." />
            </div>
          </div>

          <button type="submit" className={`w-full ${accentClass} text-white font-black py-8 rounded-[3rem] shadow-[0_25px_60px_-15px_rgba(var(--theme-rgb),0.6)] active:scale-95 transition-all text-2xl mt-8 tracking-tight`}>
            {initialData ? t('update') : 'সংরক্ষণ করুন'}
          </button>
        </form>
      </div>
    </div>
  );
}

function CategoryManagerModal({ t, lang, onClose, categories, onUpdateCategories, theme }: any) {
  const [type, setType] = useState<TransactionType>('INCOME');
  const [newLabel, setNewLabel] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const accentClass = THEME_MAP[theme as ThemeColor].split(' ')[0];

  const handleSave = () => {
    if (!newLabel.trim()) return;
    if (editingCategory) { onUpdateCategories(categories.map((c: any) => c.id === editingCategory.id ? { ...c, label: newLabel } : c)); setEditingCategory(null); } 
    else { onUpdateCategories([...categories, { id: crypto.randomUUID(), label: newLabel, type }]); }
    setNewLabel('');
  };

  const filtered = categories.filter((c: any) => c.type === type);

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" onClick={onClose}></div>
      <div className="relative bg-white dark:bg-slate-900 w-full max-sm:w-[95%] max-w-md rounded-[3.8rem] p-12 shadow-2xl animate-in zoom-in-95 duration-500 flex flex-col max-h-[85vh] border border-white/20 dark:border-slate-800/50">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{t('manageCategories')}</h2>
          <button onClick={onClose} className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 active:scale-90 transition-all"><X size={22} strokeWidth={3}/></button>
        </div>

        <div className="flex gap-3 p-2 bg-slate-100 dark:bg-slate-950/50 rounded-[2rem] mb-12 shadow-inner border border-slate-200/40 dark:border-slate-800/40">
          <button onClick={() => { setType('INCOME'); setEditingCategory(null); setNewLabel(''); }} className={`flex-1 py-4 text-[11px] font-black uppercase tracking-widest rounded-[1.4rem] transition-all ${type === 'INCOME' ? `${accentClass} text-white shadow-xl` : 'text-slate-400 dark:text-slate-600'}`}>{t('incomeType')}</button>
          <button onClick={() => { setType('EXPENSE'); setEditingCategory(null); setNewLabel(''); }} className={`flex-1 py-4 text-[11px] font-black uppercase tracking-widest rounded-[1.4rem] transition-all ${type === 'EXPENSE' ? `${accentClass} text-white shadow-xl` : 'text-slate-400 dark:text-slate-600'}`}>{t('expenseType')}</button>
        </div>

        <div className="flex gap-5 mb-12 relative">
          <input type="text" value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder={editingCategory ? "সংশোধন..." : "নতুন নাম..."} className="flex-1 p-7 bg-slate-50 dark:bg-slate-950/50 rounded-[2.2rem] border-none outline-none font-black text-[16px] text-slate-900 dark:text-white shadow-inner" />
          <button onClick={handleSave} className={`p-7 ${accentClass} text-white rounded-[2.2rem] shadow-2xl transition-all active:scale-90`}>
            {editingCategory ? <RefreshCcw size={28} strokeWidth={3} /> : <Plus size={28} strokeWidth={3} />}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-3 hide-scrollbar">
          {filtered.map((cat: any) => (
            <div key={cat.id} className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-950/50 rounded-[2rem] border border-slate-100 dark:border-slate-800/40 group transition-all hover:bg-white dark:hover:bg-slate-800 shadow-sm">
              <span className="font-black text-[17px] text-slate-900 dark:text-white tracking-tight">{cat.label}</span>
              <div className="flex gap-3">
                <button onClick={() => { setEditingCategory(cat); setNewLabel(cat.label); }} className="p-4 text-blue-500 bg-white dark:bg-slate-900 rounded-2xl shadow-sm hover:scale-110 active:scale-90 transition-all"><Edit2 size={18} strokeWidth={3} /></button>
                <button onClick={() => setCategoryToDelete(cat)} className="p-4 text-rose-500 bg-white dark:bg-slate-900 rounded-2xl shadow-sm hover:scale-110 active:scale-90 transition-all"><Trash2 size={18} strokeWidth={3} /></button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-24 opacity-10 grayscale">
              <Layers size={48} strokeWidth={1} className="mx-auto mb-4" />
              <p className="italic text-lg font-black tracking-tight">{lang === 'bn' ? 'খালি' : 'Empty'}</p>
            </div>
          )}
        </div>

        {categoryToDelete && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-10 bg-slate-950/95 animate-in fade-in zoom-in-95 rounded-[3.8rem] backdrop-blur-3xl text-white">
            <div className="text-center">
              <div className="w-24 h-24 bg-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                <Trash2 size={48} strokeWidth={3} />
              </div>
              <h3 className="text-3xl font-black mb-4 tracking-tight">{t('confirmDelete')}</h3>
              <p className="text-sm text-slate-400 mb-12 font-bold leading-relaxed">ক্যাটাগরি: <span className="text-white font-black text-lg">"{categoryToDelete.label}"</span></p>
              <div className="flex flex-col gap-5">
                <button onClick={() => { onUpdateCategories(categories.filter((c: any) => c.id !== categoryToDelete.id)); setCategoryToDelete(null); }} className="w-full bg-rose-500 text-white font-black py-6 rounded-[2.2rem] shadow-2xl active:scale-95 transition-all text-xl">{t('deleteBtn')}</button>
                <button onClick={() => setCategoryToDelete(null)} className="w-full bg-slate-800 text-white font-black py-6 rounded-[2.2rem] active:scale-95 transition-all text-xl">{t('cancelBtn')}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DevProfileModal({ t, onClose, theme }: any) {
  const accentClass = THEME_MAP[theme as ThemeColor].split(' ')[0];
  const accentBorder = theme === 'custom' ? 'border-[var(--theme-color)]' : 
    theme === 'indigo' ? 'border-indigo-600' :
    theme === 'emerald' ? 'border-emerald-600' :
    theme === 'rose' ? 'border-rose-600' : 'border-amber-600';
  
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-2xl" onClick={onClose}></div>
      <div className="relative bg-white dark:bg-slate-900 w-full max-sm:w-[95%] max-w-sm rounded-[4.2rem] p-12 pt-20 shadow-2xl animate-in zoom-in-95 duration-500 text-center flex flex-col items-center border border-white/20 dark:border-slate-800/50">
        
        <div className={`w-44 h-44 rounded-full mb-10 p-2 border-[8px] ${accentBorder} shadow-2xl relative overflow-hidden group transition-all duration-700 hover:rotate-6`}>
          <div className="w-full h-full rounded-full bg-slate-50 dark:bg-slate-950 overflow-hidden flex items-center justify-center transition-transform duration-1000 group-hover:scale-125">
            <img 
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=MDHShahin" 
              alt="Developer" 
              className="w-full h-full object-cover scale-110" 
            />
          </div>
        </div>

        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
          {t('devName')}
        </h2>

        <p className="text-[15px] text-slate-500 dark:text-slate-400 leading-relaxed text-center px-2 mb-14 font-medium italic">
          একজন প্যাশনেট ডেভেলপার হিসেবে আমি প্রযুক্তিকে শৈল্পিক রূপ দিতে পছন্দ করি। আমার লক্ষ্য এমন কিছু তৈরি করা যা মানুষের দৈনন্দিন জীবনকে আরও সহজ ও সাবলীল করে তুলবে।
        </p>

        <div className="flex gap-10 mb-16">
          <SocialIcon href="mailto:majidul.hasan.shahin@gmail.com" icon={<Mail />} color="rose" />
          <SocialIcon href="https://facebook.com/majidulhasanshahin" icon={<Facebook />} color="blue" />
          <SocialIcon href="https://t.me/majidulhasanshahin" icon={<Send />} color="emerald" isLast />
        </div>

        <button 
          onClick={onClose} 
          className={`w-full ${accentClass} text-white font-black py-7 rounded-[2.5rem] shadow-2xl active:scale-95 transition-all text-xl tracking-tight`}
        >
          {t('close')}
        </button>
      </div>
    </div>
  );
}

function SocialIcon({ href, icon, color, isLast }: any) {
  const colors: any = {
    rose: 'text-rose-500 bg-rose-50 dark:bg-rose-950/40',
    blue: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40',
    emerald: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40'
  };
  return (
    <a href={href} target="_blank" rel="noreferrer" className={`p-5 rounded-[1.5rem] ${colors[color]} transition-all hover:scale-125 hover:rotate-12 active:scale-90 shadow-md border border-white/10`}>
      {React.cloneElement(icon, { size: 28, strokeWidth: 3, className: isLast ? '-rotate-12 translate-x-0.5' : '' })}
    </a>
  );
}

function UsageGuideModal({ t, onClose, theme, lang }: any) {
  const accentClass = THEME_MAP[theme as ThemeColor].split(' ')[0];
  const accentText = THEME_MAP[theme as ThemeColor].split(' ')[2];
  
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-2xl" onClick={onClose}></div>
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-[4rem] shadow-2xl border border-white/20 dark:border-slate-800/50 animate-in zoom-in-95 duration-500 flex flex-col max-h-[92vh] overflow-hidden">
        
        <div className="p-12 pb-8 flex justify-between items-center border-b dark:border-slate-800/50">
          <div className="flex items-center gap-5">
            <div className={`p-4 rounded-[1.4rem] bg-amber-50 dark:bg-amber-950/30 ${accentText} shadow-inner`}>
              <BookOpen size={32} strokeWidth={3} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-[0.1em]">
              {t('usageGuide')}
            </h2>
          </div>
          <button onClick={onClose} className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 transition-all active:scale-90"><X size={26} strokeWidth={3.5} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-12 space-y-12 scroll-smooth hide-scrollbar bg-slate-50/20 dark:bg-transparent">
          {lang === 'bn' ? (
            <>
              <UsageSection title="হোম পেজ" icon={<LayoutDashboard className="text-indigo-500" />} text="আপনার মোট ব্যালেন্স, আয়-ব্যয় এবং লেনদেনের সংক্ষিপ্ত রূপ এখানে দেখা যায়। প্লাস (+) বাটন দিয়ে দ্রুত হিসাব যোগ করুন।" />
              <UsageSection title="হিসাব তালিকা" icon={<History className="text-emerald-500" />} text="আপনার সকল পূর্বের হিসাব তারিখ অনুযায়ী এখানে থাকে। ফিল্টার ব্যবহার করে নির্দিষ্ট হিসাব খুঁজে নিতে পারেন।" />
              <UsageSection title="লেনদেন ও ঋণ" icon={<HandCoins className="text-orange-500" />} text="কাউকে টাকা ধার দিলে বা কারো থেকে ধার নিলে তা লেনদেন হিসেবে যোগ করুন। আপনি আংশিক পেমেন্টও আপডেট করতে পারবেন।" />
              <UsageSection title="মাসিক নোট" icon={<FileText className="text-blue-500" />} text="এটি আপনার ব্যক্তিগত ডায়েরি। মাসের যেকোনো বিশেষ তথ্য বা হিসাব এখানে লিখে রাখতে পারেন।" />
              <UsageSection title="রিপোর্ট ও চার্ট" icon={<ChartIcon className="text-rose-500" />} text="গ্রাফ এবং পাই-চার্টের মাধ্যমে আপনার ব্যয়ের ধরন বিশ্লেষণ করুন এবং বাজেট নিয়ন্ত্রণে সাহায্য নিন।" />
              <div className="bg-blue-500/10 dark:bg-blue-500/5 p-8 rounded-[3rem] border border-blue-500/20">
                <p className="text-sm font-black text-blue-600 dark:text-blue-400 italic text-center leading-relaxed tracking-tight">
                  * অ্যাপটি ১০০% অফলাইন। আপনার ডাটা শুধুমাত্র আপনার ফোনেই সেভ থাকে। তাই ডাটা সুরক্ষায় নিয়মিত 'ব্যাকআপ' ডাউনলোড করে রাখুন।
                </p>
              </div>
            </>
          ) : (
            <>
              <UsageSection title="Dashboard" icon={<LayoutDashboard className="text-indigo-500" />} text="View summary of balance, income, expense and loans. Use (+) to add new records instantly." />
              <UsageSection title="History" icon={<History className="text-emerald-500" />} text="Chronological list of all entries. Filter by type to find specific transactions easily." />
              <UsageSection title="Loans & Dealings" icon={<HandCoins className="text-orange-500" />} text="Track borrowed or lent money. Record partial payments until fully settled." />
              <UsageSection title="Monthly Notes" icon={<FileText className="text-blue-500" />} text="A private digital diary for each month. Keep track of special records here." />
              <UsageSection title="Reports" icon={<ChartIcon className="text-rose-500" />} text="Analyze your financial habits with charts. Perfect for budgeting and savings." />
              <div className="bg-blue-500/10 dark:bg-blue-500/5 p-8 rounded-[3rem] border border-blue-500/20">
                <p className="text-sm font-black text-blue-600 dark:text-blue-400 italic text-center leading-relaxed tracking-tight">
                  * 100% Offline. Your data never leaves your device. Always keep regular backups to avoid accidental data loss.
                </p>
              </div>
            </>
          )}
        </div>

        <div className="p-12 border-t dark:border-slate-800/50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl">
          <button 
            onClick={onClose} 
            className={`w-full ${accentClass} text-white font-black py-7 rounded-[2.5rem] shadow-2xl active:scale-95 transition-all text-2xl tracking-tight`}
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
}

function UsageSection({ title, icon, text }: any) {
  return (
    <section className="space-y-5 group">
      <h3 className="text-[19px] font-black text-slate-900 dark:text-white flex items-center gap-5 transition-transform group-hover:translate-x-2 duration-500 tracking-tight">
        <div className="p-3.5 rounded-[1.25rem] bg-white dark:bg-slate-950 shadow-md border border-slate-100 dark:border-slate-800/50 group-hover:shadow-xl transition-all">
          {React.cloneElement(icon, { size: 24, strokeWidth: 3 })}
        </div>
        {title}
      </h3>
      <p className="text-[15px] font-semibold text-slate-500 dark:text-slate-400 leading-relaxed text-justify pl-[68px]">
        {text}
      </p>
    </section>
  );
}
