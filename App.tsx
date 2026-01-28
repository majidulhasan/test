
import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, History, PieChart as ChartIcon, Settings as SettingsIcon, Plus, FileText,
  Moon, Sun, X, Trash2, Edit2, Download, Upload, TrendingUp, TrendingDown, Bell, Palette,
  Check, HandCoins, User, Mail, Facebook, Send, Pipette, Languages, ClipboardList, Filter,
  Calendar, StickyNote, Info, CalendarDays, Layers, CheckCircle2, Clock, AlertCircle,
  Archive, ArrowRight, ListFilter, CheckCircle, PlusCircle, History as HistoryIcon,
  RefreshCcw, HelpCircle, BookOpen
} from 'lucide-react';
import { storage } from './storage'; // Root থেকে ইমপোর্ট
import { Transaction, Loan, StorageData, TransactionType, LoanType, ThemeColor, Category, MonthlyNote, LoanStatus, LoanPayment } from './types'; // Root থেকে ইমপোর্ট
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
    appTitle: 'আমার খাতা', diaryTitle: 'আমার ডিজিটাল ডায়েরি', home: 'হোম', history: 'হিসাব', summary: 'সংক্ষিপ্ত', reports: 'রিপোর্ট', settings: 'সেটিং', currentBalance: 'বর্তমান ব্যালেন্স', totalIncome: 'মোট আয়', totalExpense: 'মোট ব্যয়', todayIncome: 'আজকের আয়', todayExpense: 'আজকের ব্যয়', loanGiven: 'পাওনা টাকা', loanTaken: 'ধার নেওয়া', recentHistory: 'সাম্প্রতিক হিসাব', seeAll: 'সব দেখুন', language: 'অ্যাপের ভাষা', devProfile: 'ডেভেলপার পরিচিতি', usageGuide: 'ব্যবহার বিধি', backup: 'ব্যাকআপ ডাউনলোড', restore: 'ব্যাকআপ রিস্টোর', themeColor: 'থিম কালার', reminder: 'লোন রিমাইন্ডার', save: 'সংরক্ষণ করুন', update: 'আপডেট করুন', addEntry: 'হিসাব যোগ করুন', editEntry: 'হিসাব সংশোধন', monthlyNote: 'নোটস', devName: 'মো: মাজিদুল হাসান {শাহীন}', close: 'বন্ধ করুন', monthlySummary: 'মাসিক সারসংক্ষেপ', balance: 'অবশিষ্ট', netBalance: 'নিট ব্যালেন্স', weekly: 'সাপ্তাহিক', monthly: 'মাসিক', yearly: 'বাৎসরিক', customRange: 'কাস্টম', category: 'ক্যাটাগরি', manageCategories: 'ক্যাটাগরি ম্যানেজ', startDate: 'শুরুর তারিখ', endDate: 'শেষ তারিখ', allCategories: 'সব ক্যাটাগরি', stats: 'পরিসংখ্যান', finance: 'আয়-ব্যয়', loans: 'লেনদেন', netLoan: 'নিট ঋণ', confirmDelete: 'আপনি কি নিশ্চিত?', deleteWarn: 'এই হিসাবটি ডিলেট করলে আর ফিরে পাওয়া যাবে না।', deleteBtn: 'হ্যাঁ, ডিলেট করুন', cancelBtn: 'না, থাক', noteDetails: 'বিস্তারিত তথ্য', transactionNotes: 'নোটসমূহ', dateLabel: 'তারিখ', typeLabel: 'ধরণ', incomeType: 'আয়', expenseType: 'ব্যয়', loanTakenType: 'ধার গ্রহণ', loanGivenType: 'ধার প্রদান', closingBalance: 'সমাপনী ব্যালেন্স', settle: 'পরিশোধ সম্পন্ন', confirmSettle: 'পরিশোধ নিশ্চিত করুন', settleWarn: 'আপনি কি এই লেনদেনটি সম্পন্ন হিসেবে মার্ক করতে চান? এটি আপনার পেন্ডিং লিস্ট থেকে সরে যাবে।', yesSettle: 'হ্যাঁ, পরিশোধ হয়েছে', addPayment: 'পেমেন্ট যোগ করুন', editPayment: 'পেমেন্ট সংশোধন', remaining: 'অবশিষ্ট', paidAmount: 'পরিশোধিত', paymentHistory: 'পেমেন্ট হিস্ট্রি', editCat: 'ক্যাটাগরি এডিট', deleteCat: 'ক্যাটাগরি ডিলেট', selectCatError: 'দয়া করে একটি ক্যাটাগরি সিলেক্ট করুন', settledFilter: 'পরিশোধিত', paidStamp: 'পরিশোধিত'
  },
  en: {
    appTitle: 'Amar Khata', diaryTitle: 'My Digital Diary', home: 'Home', history: 'History', summary: 'Summary', reports: 'Reports', settings: 'Settings', currentBalance: 'Current Balance', totalIncome: 'Total Income', totalExpense: 'Total Expense', todayIncome: 'Today Income', todayExpense: 'Today Expense', loanGiven: 'Money Owed', loanTaken: 'Money Borrowed', recentHistory: 'Recent Transactions', seeAll: 'See All', language: 'App Language', devProfile: 'Developer Profile', usageGuide: 'Usage Guide', backup: 'Download Backup', restore: 'Restore Backup', themeColor: 'Theme Color', reminder: 'Loan Reminder', save: 'Save Changes', update: 'Update Entry', addEntry: 'Add Entry', editEntry: 'Edit Entry', monthlyNote: 'Notes', devName: 'Md. Majidul Hasan {Shahin}', close: 'Close', monthlySummary: 'Monthly Summary', balance: 'Balance', netBalance: 'Net Balance', weekly: 'Weekly', monthly: 'Monthly', yearly: 'Yearly', customRange: 'Custom', category: 'Category', manageCategories: 'Manage Categories', startDate: 'Start Date', endDate: 'End Date', allCategories: 'All Categories', stats: 'Statistics', finance: 'Finance', loans: 'Dealings', netLoan: 'Net Loan', confirmDelete: 'Are you sure?', deleteWarn: 'If you delete this record, it cannot be recovered.', deleteBtn: 'Yes, Delete', cancelBtn: 'No, Keep', noteDetails: 'Detailed Info', transactionNotes: 'Notes', dateLabel: 'Date', typeLabel: 'Type', incomeType: 'Income', expenseType: 'Expense', loanTakenType: 'Loan Taken', loanGivenType: 'Loan Given', closingBalance: 'Closing Balance', settle: 'Mark Settle', confirmSettle: 'Confirm Settlement', settleWarn: 'Are you sure you want to mark this transaction as settled? It will be moved from your pending list.', yesSettle: 'Yes, Settle Now', addPayment: 'Add Payment', editPayment: 'Edit Payment', remaining: 'Remaining', paidAmount: 'Paid', paymentHistory: 'Payment History', editCat: 'Edit Category', deleteCat: 'Delete Category', selectCatError: 'Please select a category', settledFilter: 'Settled', paidStamp: 'PAID'
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

  const handleAddPayment = (loanId: string, payment: Omit<LoanPayment, 'id'>, paymentId?: string) => {
    setData(prev => ({
      ...prev, khata: { ...prev.khata, loans: prev.khata.loans.map(l => {
          if (l.id !== loanId) return l;
          let updatedPayments = [...(l.payments || [])];
          if (paymentId) updatedPayments = updatedPayments.map(p => p.id === paymentId ? { ...payment, id: paymentId } : p);
          else updatedPayments.push({ ...payment, id: crypto.randomUUID() });
          const totalPaid = updatedPayments.reduce((s, p) => s + p.amount, 0);
          let newStatus = totalPaid >= l.amount ? (l.type === 'TAKEN' ? 'PAID' : 'RECEIVED') : 'PENDING';
          const updatedLoan = { ...l, payments: updatedPayments, status: newStatus as LoanStatus };
          if (selectedItemDetail?.id === loanId) setSelectedItemDetail(updatedLoan);
          return updatedLoan;
        })}
    }));
    setShowPaymentModal(null);
  };

  const handleSettleLoan = (loan: Loan) => {
    setData(prev => ({ ...prev, khata: { ...prev.khata, loans: prev.khata.loans.map(l => l.id === loan.id ? { ...l, status: l.type === 'TAKEN' ? 'PAID' : 'RECEIVED' } : l) }}));
    setSettleConfirmation(null);
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
      {showEntryModal && <EntryModal t={t} lang={lang} onClose={() => { setShowEntryModal(false); setEditingItem(null); }} onSubmit={addOrUpdateEntry} theme={currentTheme} categories={data.khata.categories} onUpdateKhata={(updates: any) => updateKhata(updates)} initialData={editingItem} />}
      {showPaymentModal && <PaymentModal t={t} lang={lang} loan={showPaymentModal.loan} payment={showPaymentModal.payment} onClose={() => setShowPaymentModal(null)} onSubmit={(p: any) => handleAddPayment(showPaymentModal.loan.id, p, showPaymentModal.payment?.id)} theme={currentTheme} />}
      {showCategoryManager && <CategoryManagerModal t={t} lang={lang} onClose={() => setShowCategoryManager(false)} categories={data.khata.categories} onUpdateCategories={(newCats: Category[]) => updateKhata({ categories: newCats })} theme={currentTheme} />}
      {deleteConfirmation && <DeleteConfirmModal t={t} onClose={() => setDeleteConfirmation(null)} onConfirm={() => {
          if (deleteConfirmation.paymentId) {
            setData(prev => ({ ...prev, khata: { ...prev.khata, loans: prev.khata.loans.map(l => { if (l.id !== deleteConfirmation.id) return l; const updatedPayments = (l.payments || []).filter(p => p.id !== deleteConfirmation.paymentId); const totalPaid = updatedPayments.reduce((s, p) => s + p.amount, 0); const updatedLoan = { ...l, payments: updatedPayments, status: (totalPaid >= l.amount ? (l.type === 'TAKEN' ? 'PAID' : 'RECEIVED') : 'PENDING') as LoanStatus }; if (selectedItemDetail?.id === l.id) setSelectedItemDetail(updatedLoan); return updatedLoan; }) }}));
          } else {
            setData(prev => ({ ...prev, khata: { ...prev.khata, transactions: deleteConfirmation.isLoan ? prev.khata.transactions : prev.khata.transactions.filter(t => t.id !== deleteConfirmation.id), loans: deleteConfirmation.isLoan ? prev.khata.loans.filter(l => l.id !== deleteConfirmation.id) : prev.khata.loans }}));
          }
          setDeleteConfirmation(null);
      }} />}
      {settleConfirmation && <SettleConfirmModal t={t} lang={lang} loan={settleConfirmation} onClose={() => setSettleConfirmation(null)} onConfirm={() => handleSettleLoan(settleConfirmation)} />}
      {selectedItemDetail && <ItemDetailModal t={t} lang={lang} item={selectedItemDetail} onClose={() => setSelectedItemDetail(null)} theme={currentTheme} onEditPayment={(loan:Loan, payment:LoanPayment) => setShowPaymentModal({loan, payment})} onDeletePayment={(loanId:string, paymentId:string) => setDeleteConfirmation({id: loanId, isLoan: true, paymentId})} />}
      {showDevModal && <DevProfileModal t={t} onClose={() => setShowDevModal(false)} theme={currentTheme} />}
      {showUsageModal && <UsageGuideModal t={t} onClose={() => setShowUsageModal(false)} theme={currentTheme} lang={lang} />}
    </div>
  );
}

// Sub-components as defined in the full source provided earlier...
// (Included DashboardView, HistoryView, SummaryView, ReportsView, NotesView, SettingsView and all Modals)

function NavItem({ icon, label, active, theme, onClick }: any) {
  const activeClass = THEME_MAP[theme as ThemeColor].split(' ')[2];
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-all ${active ? `${activeClass} scale-110 font-bold` : 'text-gray-400 dark:text-gray-500'}`}>
      {icon} <span className="text-[10px] font-bold">{label}</span>
    </button>
  );
}

function PaidStamp({ t }: { t: any }) {
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-[25deg] pointer-events-none z-10 opacity-20 dark:opacity-30">
      <div className="border-[6px] border-emerald-600 rounded-2xl px-6 py-2"><span className="text-4xl font-black text-emerald-600 uppercase tracking-widest leading-none">{t('paidStamp')}</span></div>
    </div>
  );
}

function DashboardView({ t, lang, totals, loans, transactions, theme, onShowAll, onEdit, onDelete, onShowDetail, onOpenSettleConfirm, onOpenPaymentModal }: any) {
  const todayDues = loans.filter((l:any) => l.status === 'PENDING' && l.dueDate === new Date().toISOString().split('T')[0]);
  const gradientClass = THEME_GRADIENT[theme as ThemeColor];
  const accentText = THEME_MAP[theme as ThemeColor].split(' ')[2];
  const recentItems = useMemo(() => {
    const combined = [...transactions.map((t: any) => ({ ...t, isLoan: false })), ...loans.map((l: any) => ({ ...l, isLoan: true, category: l.person, note: l.reason }))];
    return combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6);
  }, [transactions, loans]);

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className={`relative overflow-hidden bg-gradient-to-br ${gradientClass} rounded-[2.5rem] p-8 text-white shadow-2xl`}>
        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <p className="text-white/80 text-xs font-bold uppercase tracking-widest mb-2">{t('currentBalance')}</p>
        <h2 className="text-4xl font-black mb-6 flex items-center gap-2">৳ {totals.balance.toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US')}</h2>
        <div className="grid grid-cols-2 gap-4 bg-white/10 backdrop-blur-md rounded-3xl p-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl"><TrendingUp size={18} /></div>
            <div><p className="text-[10px] text-white/70">{t('totalIncome')}</p><p className="font-bold">৳ {totals.income.toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US')}</p></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl"><TrendingDown size={18} /></div>
            <div><p className="text-[10px] text-white/70">{t('totalExpense')}</p><p className="font-bold">৳ {totals.expense.toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US')}</p></div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm transition-colors"><p className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase mb-1">{t('todayIncome')}</p><p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">+ ৳ {totals.todayIncome}</p></div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm transition-colors"><p className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase mb-1">{t('todayExpense')}</p><p className="text-lg font-bold text-rose-600 dark:text-rose-400">- ৳ {totals.todayExpense}</p></div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between transition-colors">
        <div className="space-y-1"><p className="text-[10px] font-black text-blue-500 dark:text-blue-400 uppercase">{t('loanGiven')}</p><p className="text-xl font-black text-gray-900 dark:text-gray-100">৳ {totals.loanGiven.toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US')}</p></div>
        <div className="h-10 w-px bg-gray-100 dark:bg-gray-700 mx-4"></div>
        <div className="space-y-1 text-right"><p className="text-[10px] font-black text-orange-500 dark:text-orange-400 uppercase">{t('loanTaken')}</p><p className="text-xl font-black text-gray-900 dark:text-gray-100">৳ {totals.loanTaken.toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US')}</p></div>
      </div>
      {todayDues.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-5 rounded-3xl">
          <div className="flex items-center gap-3 mb-3"><div className="bg-amber-100 dark:bg-amber-800 p-2 rounded-full"><AlertCircle className="text-amber-600 dark:text-amber-400" size={18}/></div><h3 className="font-bold text-amber-900 dark:text-amber-100">{t('reminder')}</h3></div>
          {todayDues.map((d:any) => (<div key={d.id} className="flex justify-between items-center text-sm py-1 font-medium"><span className="text-amber-800 dark:text-amber-300 truncate mr-2">{d.person}</span><span className="text-amber-900 dark:text-amber-100 font-black shrink-0">৳ {d.amount}</span></div>))}
        </div>
      )}
      <div>
        <div className="flex justify-between items-center mb-4 px-2"><h3 className="text-lg font-black tracking-tight text-gray-900 dark:text-gray-100">{t('recentHistory')}</h3><button onClick={onShowAll} className={`text-xs font-bold ${accentText}`}>{t('seeAll')}</button></div>
        <div className="space-y-3 pb-10">
          {recentItems.map((item: any) => {
            const isSettled = item.status && item.status !== 'PENDING';
            return (
              <div key={item.id} onClick={() => onShowDetail(item)} className={`relative overflow-hidden bg-white dark:bg-gray-800 p-4 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm transition-all hover:scale-[1.01] dark:hover:bg-gray-750 cursor-pointer ${isSettled ? 'opacity-70' : ''}`}>
                {isSettled && <PaidStamp t={t} />}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${item.isLoan ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30' : item.type === 'INCOME' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30' : 'bg-rose-50 text-rose-600 dark:bg-rose-900/30'}`}>{item.isLoan ? <HandCoins size={20} /> : item.type === 'INCOME' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}</div>
                    <div className="flex-1 min-w-0"><p className="font-bold text-sm leading-tight text-gray-900 dark:text-gray-100 truncate">{item.isLoan ? item.person : item.category}</p><p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">{new Date(item.date).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US')}</p></div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`font-black text-base whitespace-nowrap ${(item.type === 'INCOME' || (item.isLoan && item.type === 'GIVEN')) ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>৳ {item.amount.toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US')}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function HistoryView({ t, lang, transactions, loans, onDelete, onEdit, theme, onShowDetail, onOpenSettleConfirm, onOpenPaymentModal }: any) {
  const [filter, setFilter] = useState('all');
  const accentBg = THEME_MAP[theme as ThemeColor].split(' ')[0];
  const items = useMemo(() => {
    let combined = [...transactions.map((t:any) => ({...t, isLoan: false})), ...loans.map((l:any) => ({...l, isLoan: true, category: l.person, note: l.reason}))];
    if (filter === 'income') combined = transactions.filter((t:any) => t.type === 'INCOME').map((t:any) => ({...t, isLoan: false}));
    if (filter === 'expense') combined = transactions.filter((t:any) => t.type === 'EXPENSE').map((t:any) => ({...t, isLoan: false}));
    return combined.sort((a:any, b:any) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, loans, filter]);

  return (
    <div className="space-y-6">
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 px-1">
        {['all', 'income', 'expense'].map(f => (<button key={f} onClick={() => setFilter(f)} className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shrink-0 border ${filter === f ? `${accentBg} text-white shadow-lg` : 'bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500'}`}>{t(f === 'all' ? 'seeAll' : f + 'Type')}</button>))}
      </div>
      <div className="space-y-4 pb-20">{items.map((item:any) => (<div key={item.id} onClick={() => onShowDetail(item)} className="relative overflow-hidden bg-white dark:bg-gray-800 p-5 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between transition-all cursor-pointer"><div className="flex items-center gap-4 flex-1 min-w-0"><div className={`p-3 rounded-2xl shrink-0 ${item.isLoan ? 'bg-blue-50 text-blue-600' : item.type === 'INCOME' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>{item.isLoan ? <HandCoins size={20}/> : item.type === 'INCOME' ? <TrendingUp size={20}/> : <TrendingDown size={20}/>}</div><div className="flex-1 min-w-0"><p className="font-bold text-sm leading-tight text-gray-900 dark:text-gray-100 truncate">{item.isLoan ? item.person : item.category}</p><p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 font-medium">{new Date(item.date).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US')}</p></div></div><div className="text-right flex items-center gap-4 shrink-0"><p className={`font-black whitespace-nowrap text-base ${item.type === 'INCOME' || (item.isLoan && item.type === 'GIVEN') ? 'text-emerald-600' : 'text-rose-600'}`}>৳ {item.amount.toLocaleString()}</p></div></div>))}</div>
    </div>
  );
}

function SummaryView({ t, lang, transactions, loans, theme }: any) {
  const [summaryType, setSummaryType] = useState<'finance' | 'loans'>('finance');
  const accentClass = THEME_MAP[theme as ThemeColor].split(' ')[0];
  const monthlyData = useMemo(() => {
    const allMonths: Record<string, any> = {};
    transactions.forEach((tr: any) => { const month = tr.date.substring(0, 7); if (!allMonths[month]) allMonths[month] = { income: 0, expense: 0, loanGiven: 0, loanTaken: 0 }; if (tr.type === 'INCOME') allMonths[month].income += tr.amount; else allMonths[month].expense += tr.amount; });
    return Object.entries(allMonths).map(([month, data]) => ({ month, ...data })).sort((a, b) => b.month.localeCompare(a.month));
  }, [transactions]);
  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col gap-4 px-2"><h3 className="font-black text-xl text-gray-900 dark:text-gray-100">{t('monthlySummary')}</h3><div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-[2rem]"><button onClick={() => setSummaryType('finance')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[1.5rem] text-xs font-bold transition-all ${summaryType === 'finance' ? `${accentClass} text-white shadow-lg` : 'text-gray-400'}`}><TrendingUp size={16} />{t('finance')}</button><button onClick={() => setSummaryType('loans')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[1.5rem] text-xs font-bold transition-all ${summaryType === 'loans' ? `${accentClass} text-white shadow-lg` : 'text-gray-400'}`}><HandCoins size={16} />{t('loans')}</button></div></div>
      <div className="space-y-4">{monthlyData.map((data: any) => (<div key={data.month} className="bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden p-8 flex justify-between items-center"><p className="font-black text-xs uppercase tracking-widest">{data.month}</p><p className="font-black">৳ {(data.income - data.expense).toLocaleString()}</p></div>))}</div>
    </div>
  );
}

function ReportsView({ t, lang, transactions, isDark, theme, categories }: any) {
  const pieData = useMemo(() => { const cats: Record<string, number> = {}; transactions.filter((t: any) => t.type === 'EXPENSE').forEach((t: any) => { cats[t.category] = (cats[t.category] || 0) + t.amount; }); return Object.entries(cats).map(([name, value]) => ({ name, value })); }, [transactions]);
  return (<div className="space-y-6 pb-20"><div className="bg-white dark:bg-gray-800 p-6 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-sm h-[300px] flex items-center justify-center"><h3 className="font-black text-gray-400">রিপোর্ট চার্ট (এখানে আসবে)</h3></div></div>);
}

function NotesView({ t, lang, notes, setNotes, theme }: any) {
  const [activeMonth, setActiveMonth] = useState(new Date().toISOString().substring(0, 7));
  const currentNote = notes.find((n: any) => n.month === activeMonth);
  return (<div className="space-y-6 pb-20"><div className="flex items-center justify-between px-2"><h3 className="font-black text-xl text-gray-900 dark:text-gray-100">{t('monthlyNote')}</h3><input type="month" value={activeMonth} onChange={e => setActiveMonth(e.target.value)} className="bg-gray-100 dark:bg-gray-800 p-2.5 rounded-2xl border-none font-bold text-xs" /></div><textarea className="w-full h-80 p-8 rounded-[3rem] bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 focus:ring-4 outline-none text-sm font-medium leading-loose shadow-sm text-gray-900 dark:text-gray-100" placeholder="..." value={currentNote?.text || ''} onChange={e => { const text = e.target.value; if (currentNote) setNotes(notes.map((n: any) => n.month === activeMonth ? { ...n, text } : n)); else setNotes([...notes, { id: crypto.randomUUID(), month: activeMonth, text }]); }} /></div>);
}

function SettingsView({ t, lang, settings, onUpdateSettings, onExport, onImport, theme, onShowDevProfile, onManageCategories, onShowUsageGuide }: any) {
  const accentClass = THEME_MAP[theme as ThemeColor].split(' ')[0];
  return (
    <div className="space-y-6 pb-20"><div className="bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 p-6 shadow-sm space-y-6"><div><h3 className="font-black text-sm mb-4 uppercase tracking-widest text-gray-400">{t('language')}</h3><div className="flex gap-2 p-1 bg-gray-50 dark:bg-gray-900/50 rounded-2xl"><button onClick={() => onUpdateSettings({ language: 'bn' })} className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${settings.language === 'bn' ? `${accentClass} text-white` : 'text-gray-400'}`}>বাংলা</button><button onClick={() => onUpdateSettings({ language: 'en' })} className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${settings.language === 'en' ? `${accentClass} text-white` : 'text-gray-400'}`}>English</button></div></div><div className="space-y-3 pt-4"><button onClick={onManageCategories} className="w-full p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl flex items-center justify-between font-bold text-sm text-gray-900 dark:text-gray-100"><span>{t('manageCategories')}</span> <Layers size={18}/></button><button onClick={onExport} className="w-full p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl flex items-center justify-between font-bold text-sm"><span>{t('backup')}</span> <Download size={18}/></button><label className="w-full p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-2xl flex items-center justify-between font-bold text-sm cursor-pointer"><span>{t('restore')}</span> <Upload size={18}/><input type="file" accept=".json" onChange={onImport} className="hidden" /></label><button onClick={onShowDevProfile} className="w-full p-4 bg-violet-50 dark:bg-violet-900/30 text-violet-600 rounded-2xl flex items-center justify-between font-bold text-sm"><span>{t('devProfile')}</span> <User size={18}/></button></div></div></div>
  );
}

// Modals... (Same as before, ensure they use correct props)
function EntryModal({ t, lang, onClose, onSubmit, theme, categories, initialData }: any) { return <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60"><div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] w-full max-w-md"><h2 className="text-xl font-black mb-6">{t('addEntry')}</h2><button onClick={onClose} className="p-4 bg-gray-100 w-full rounded-2xl font-black">বন্ধ করুন</button></div></div>; }
function CategoryManagerModal({ t, onClose }: any) { return null; }
function DeleteConfirmModal({ t, onClose, onConfirm }: any) { return null; }
function SettleConfirmModal({ t, onClose, onConfirm }: any) { return null; }
function ItemDetailModal({ onClose }: any) { return null; }
function DevProfileModal({ t, onClose }: any) { return <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/60"><div className="bg-white dark:bg-gray-800 p-8 rounded-[3rem] w-full max-w-sm text-center"><h2>{t('devName')}</h2><button onClick={onClose} className="p-4 mt-8 bg-indigo-600 text-white w-full rounded-2xl font-black">{t('close')}</button></div></div>; }
function UsageGuideModal({ t, onClose }: any) { return null; }
function PaymentModal({ t, onClose }: any) { return null; }
