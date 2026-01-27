
import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, History as HistoryIcon, PieChart as ChartIcon, Settings as SettingsIcon, 
  Plus, FileText, Moon, Sun, X, Trash2, Edit2, Download, Upload, 
  TrendingUp, TrendingDown, Bell, Palette, Check, HandCoins, User, 
  Mail, Facebook, Send, Pipette, Languages, ClipboardList, Filter, 
  Calendar, StickyNote, CalendarDays, Layers, CheckCircle2, AlertCircle, 
  CheckCircle, PlusCircle, RefreshCcw, BookOpen, ListFilter
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
    setShowEntryModal(false);
    setEditingItem(null);
  };

  const handleAddPayment = (loanId: string, payment: any) => {
    setData(prev => ({
      ...prev,
      khata: {
        ...prev.khata,
        loans: prev.khata.loans.map(l => {
          if (l.id !== loanId) return l;
          const newPayment = { ...payment, id: crypto.randomUUID() };
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
          return { ...l, status: l.type === 'TAKEN' ? 'PAID' : 'RECEIVED' };
        })
      }
    }));
    setSettleConfirmation(null);
  };

  const currentTheme = data.settings.themeColor;

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${isDarkMode ? 'dark bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
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
        {activeTab === 'dashboard' && <DashboardView t={t} lang={lang} totals={totals} loans={data.khata.loans} transactions={data.khata.transactions} theme={currentTheme} onShowAll={() => setActiveTab('history')} onEdit={(i:any) => { setEditingItem(i); setShowEntryModal(true); }} onDelete={(id:string, isL:boolean) => setDeleteConfirmation({id, isLoan: isL})} onShowDetail={setSelectedItemDetail} onOpenSettleConfirm={setSettleConfirmation} onOpenPaymentModal={setShowPaymentModal} />}
        {activeTab === 'history' && <HistoryView t={t} lang={lang} transactions={data.khata.transactions} loans={data.khata.loans} onEdit={(i:any) => { setEditingItem(i); setShowEntryModal(true); }} onDelete={(id:string, isL:boolean) => setDeleteConfirmation({id, isLoan: isL})} theme={currentTheme} onShowDetail={setSelectedItemDetail} onOpenSettleConfirm={setSettleConfirmation} onOpenPaymentModal={setShowPaymentModal} />}
        {activeTab === 'summary' && <SummaryView t={t} lang={lang} transactions={data.khata.transactions} loans={data.khata.loans} theme={currentTheme} />}
        {activeTab === 'reports' && <ReportsView t={t} lang={lang} transactions={data.khata.transactions} isDark={isDarkMode} theme={currentTheme} categories={data.khata.categories} />}
        {activeTab === 'notes' && <NotesView t={t} notes={data.khata.notes} setNotes={(n:any) => setData(p => ({...p, khata: {...p.khata, notes: n}}))} theme={currentTheme} />}
        {activeTab === 'settings' && <SettingsView t={t} settings={data.settings} onUpdateSettings={(s:any) => setData(p => ({...p, settings: {...p.settings, ...s}}))} onExport={storage.exportToJSON} onImport={async (e:any) => { if(e.target.files[0]) { await storage.importFromJSON(e.target.files[0]); setData(storage.getData()); } }} theme={currentTheme} onShowDevProfile={() => setShowDevModal(true)} onManageCategories={() => setShowCategoryManager(true)} onShowUsageGuide={() => setShowUsageModal(true)} />}
      </main>

      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50">
        <button onClick={() => { setEditingItem(null); setShowEntryModal(true); }} className={`${THEME_MAP[currentTheme].split(' ')[0]} text-white w-16 h-16 rounded-full shadow-xl flex items-center justify-center`}><Plus size={32} /></button>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t dark:border-gray-700 px-2 py-3 pb-6 flex justify-around items-center z-40">
        <NavItem icon={<LayoutDashboard size={20} />} label={t('home')} active={activeTab === 'dashboard'} theme={currentTheme} onClick={() => setActiveTab('dashboard')} />
        <NavItem icon={<HistoryIcon size={20} />} label={t('history')} active={activeTab === 'history'} theme={currentTheme} onClick={() => setActiveTab('history')} />
        <NavItem icon={<ClipboardList size={20} />} label={t('summary')} active={activeTab === 'summary'} theme={currentTheme} onClick={() => setActiveTab('summary')} />
        <div className="w-14"></div>
        <NavItem icon={<FileText size={20} />} label={t('monthlyNote')} active={activeTab === 'notes'} theme={currentTheme} onClick={() => setActiveTab('notes')} />
        <NavItem icon={<ChartIcon size={20} />} label={t('reports')} active={activeTab === 'reports'} theme={currentTheme} onClick={() => setActiveTab('reports')} />
        <NavItem icon={<SettingsIcon size={20} />} label={t('settings')} active={activeTab === 'settings'} theme={currentTheme} onClick={() => setActiveTab('settings')} />
      </nav>

      {showEntryModal && <EntryModal t={t} lang={lang} onClose={() => setShowEntryModal(false)} onSubmit={addOrUpdateEntry} theme={currentTheme} categories={data.khata.categories} initialData={editingItem} />}
      {showPaymentModal && <PaymentModal t={t} lang={lang} loan={showPaymentModal} onClose={() => setShowPaymentModal(null)} onSubmit={(p:any) => handleAddPayment(showPaymentModal.id, p)} theme={currentTheme} />}
      {showCategoryManager && <CategoryManagerModal t={t} categories={data.khata.categories} onUpdateCategories={(newC:any) => setData(p => ({...p, khata: {...p.khata, categories: newC}}))} theme={currentTheme} onClose={() => setShowCategoryManager(false)} />}
      {deleteConfirmation && <DeleteConfirmModal t={t} onClose={() => setDeleteConfirmation(null)} onConfirm={() => { const {id, isLoan} = deleteConfirmation; setData(prev => ({ ...prev, khata: { ...prev.khata, transactions: isLoan ? prev.khata.transactions : prev.khata.transactions.filter(t => t.id !== id), loans: isLoan ? prev.khata.loans.filter(l => l.id !== id) : prev.khata.loans } })); setDeleteConfirmation(null); }} />}
      {settleConfirmation && <SettleConfirmModal t={t} onClose={() => setSettleConfirmation(null)} onConfirm={() => handleSettleLoan(settleConfirmation)} />}
      {selectedItemDetail && <ItemDetailModal t={t} lang={lang} item={selectedItemDetail} onClose={() => setSelectedItemDetail(null)} />}
      {showDevModal && <DevProfileModal t={t} onClose={() => setShowDevModal(false)} theme={currentTheme} />}
      {showUsageModal && <UsageGuideModal t={t} onClose={() => setShowUsageModal(false)} />}
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

function DashboardView({ t, lang, totals, loans, transactions, theme, onShowAll, onEdit, onDelete, onShowDetail, onOpenSettleConfirm, onOpenPaymentModal }: any) {
  const recentItems = useMemo(() => {
    const combined = [...transactions.map((t:any) => ({...t, isLoan: false})), ...loans.map((l:any) => ({...l, isLoan: true, category: l.person, note: l.reason}))];
    return combined.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
  }, [transactions, loans]);

  return (
    <div className="space-y-6">
      <div className={`bg-gradient-to-br ${THEME_GRADIENT[theme as ThemeColor]} rounded-[2rem] p-8 text-white shadow-lg`}>
        <p className="text-white/80 text-xs font-bold uppercase tracking-widest mb-1">{t('currentBalance')}</p>
        <h2 className="text-4xl font-black mb-6">৳ {totals.balance.toLocaleString()}</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 p-3 rounded-2xl"><p className="text-[10px] text-white/70">{t('totalIncome')}</p><p className="font-bold">৳ {totals.income}</p></div>
          <div className="bg-white/10 p-3 rounded-2xl"><p className="text-[10px] text-white/70">{t('totalExpense')}</p><p className="font-bold">৳ {totals.expense}</p></div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-3xl border dark:border-gray-700 shadow-sm"><p className="text-[10px] font-bold text-gray-500 uppercase">{t('todayIncome')}</p><p className="text-lg font-bold text-emerald-600">৳ {totals.todayIncome}</p></div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-3xl border dark:border-gray-700 shadow-sm"><p className="text-[10px] font-bold text-gray-500 uppercase">{t('todayExpense')}</p><p className="text-lg font-bold text-rose-600">৳ {totals.todayExpense}</p></div>
      </div>
      <div className="flex justify-between items-center"><h3 className="font-bold text-lg">{t('recentHistory')}</h3><button onClick={onShowAll} className="text-xs font-bold opacity-50">{t('seeAll')}</button></div>
      <div className="space-y-4">
        {recentItems.map((item:any) => (
          <div key={item.id} onClick={() => onShowDetail(item)} className="bg-white dark:bg-gray-800 p-4 rounded-2xl border dark:border-gray-700 flex justify-between items-center cursor-pointer">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${item.isLoan ? 'bg-blue-50 text-blue-500' : item.type === 'INCOME' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>{item.isLoan ? <HandCoins size={20} /> : item.type === 'INCOME' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}</div>
              <div><p className="font-bold text-sm truncate max-w-[120px]">{item.category}</p><p className="text-[10px] text-gray-400">{item.date}</p></div>
            </div>
            <div className="text-right">
              <p className={`font-black ${ (item.type === 'INCOME' || (item.isLoan && item.type === 'GIVEN')) ? 'text-emerald-600' : 'text-rose-600'}`}>৳ {item.amount}</p>
              <div className="flex gap-2 justify-end mt-1">
                <button onClick={(e) => { e.stopPropagation(); onEdit(item); }} className="text-blue-500"><Edit2 size={14} /></button>
                <button onClick={(e) => { e.stopPropagation(); onDelete(item.id, item.isLoan); }} className="text-rose-500"><Trash2 size={14} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HistoryView({ t, transactions, loans, onEdit, onDelete, onShowDetail, onOpenPaymentModal }: any) {
  const items = useMemo(() => {
    const combined = [...transactions.map((t:any) => ({...t, isLoan: false})), ...loans.map((l:any) => ({...l, isLoan: true, category: l.person, note: l.reason}))];
    return combined.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, loans]);

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-lg">{t('history')}</h3>
      <div className="space-y-3">
        {items.map((item:any) => (
          <div key={item.id} onClick={() => onShowDetail(item)} className="bg-white dark:bg-gray-800 p-4 rounded-2xl border dark:border-gray-700 flex justify-between items-center cursor-pointer">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${item.isLoan ? 'bg-blue-50 text-blue-500' : item.type === 'INCOME' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>{item.isLoan ? <HandCoins size={20} /> : item.type === 'INCOME' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}</div>
              <div><p className="font-bold text-sm">{item.category}</p><p className="text-[10px] text-gray-400">{item.date}</p></div>
            </div>
            <div className="flex items-center gap-4">
              <p className={`font-black ${ (item.type === 'INCOME' || (item.isLoan && item.type === 'GIVEN')) ? 'text-emerald-600' : 'text-rose-600'}`}>৳ {item.amount}</p>
              <div className="flex gap-2">
                {item.isLoan && item.status === 'PENDING' && <button onClick={(e) => { e.stopPropagation(); onOpenPaymentModal(item); }} className="text-amber-500"><PlusCircle size={18}/></button>}
                <button onClick={(e) => { e.stopPropagation(); onEdit(item); }} className="text-blue-500"><Edit2 size={18} /></button>
                <button onClick={(e) => { e.stopPropagation(); onDelete(item.id, item.isLoan); }} className="text-rose-500"><Trash2 size={18} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SummaryView({ t, transactions }: any) {
  const months = useMemo(() => {
    const mSet = new Set<string>();
    transactions.forEach((t:any) => mSet.add(t.date.substring(0, 7)));
    return Array.from(mSet).sort().reverse();
  }, [transactions]);

  return (
    <div className="space-y-6">
      <h3 className="font-bold text-lg">{t('summary')}</h3>
      {months.map(m => {
        const income = transactions.filter((tr:any) => tr.date.startsWith(m) && tr.type === 'INCOME').reduce((s:number, tr:any) => s + tr.amount, 0);
        const expense = transactions.filter((tr:any) => tr.date.startsWith(m) && tr.type === 'EXPENSE').reduce((s:number, tr:any) => s + tr.amount, 0);
        return (
          <div key={m} className="bg-white dark:bg-gray-800 p-6 rounded-3xl border dark:border-gray-700 space-y-4 shadow-sm">
            <h4 className="font-black text-xs text-gray-400 uppercase tracking-widest">{m}</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-2xl"><p className="text-[10px] font-bold text-emerald-600 uppercase">{t('totalIncome')}</p><p className="text-lg font-black text-emerald-700 dark:text-emerald-400">৳ {income}</p></div>
              <div className="bg-rose-50 dark:bg-rose-900/10 p-4 rounded-2xl"><p className="text-[10px] font-bold text-rose-600 uppercase">{t('totalExpense')}</p><p className="text-lg font-black text-rose-700 dark:text-rose-400">৳ {expense}</p></div>
            </div>
            <div className="pt-2 border-t dark:border-gray-700 flex justify-between items-center"><span className="text-xs font-bold text-gray-500">{t('balance')}</span><span className={`font-black ${income >= expense ? 'text-emerald-600' : 'text-rose-600'}`}>৳ {income - expense}</span></div>
          </div>
        );
      })}
    </div>
  );
}

function ReportsView({ t, transactions, isDark }: any) {
  const data = useMemo(() => {
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i);
      const mStr = d.toISOString().substring(0, 7);
      const inc = transactions.filter((tr:any) => tr.date.startsWith(mStr) && tr.type === 'INCOME').reduce((s:number, tr:any) => s + tr.amount, 0);
      const exp = transactions.filter((tr:any) => tr.date.startsWith(mStr) && tr.type === 'EXPENSE').reduce((s:number, tr:any) => s + tr.amount, 0);
      last6Months.push({ name: mStr, income: inc, expense: exp });
    }
    return last6Months;
  }, [transactions]);

  const pieData = useMemo(() => {
    const cats: any = {};
    transactions.filter((tr:any) => tr.type === 'EXPENSE').forEach((tr:any) => cats[tr.category] = (cats[tr.category] || 0) + tr.amount);
    return Object.keys(cats).map(k => ({ name: k, value: cats[k] }));
  }, [transactions]);

  const COLORS = ['#4f46e5', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border dark:border-gray-700 shadow-sm">
        <h4 className="font-bold mb-6">{t('monthlySummary')}</h4>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#374151' : '#f3f4f6'} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: isDark ? '#9ca3af' : '#4b5563' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: isDark ? '#9ca3af' : '#4b5563' }} />
              <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} barSize={15} />
              <Bar dataKey="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={15} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border dark:border-gray-700 shadow-sm">
        <h4 className="font-bold mb-6">{t('totalExpense')}</h4>
        <div className="h-64 w-full">
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart><Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" cornerRadius={6}>{pieData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip /></PieChart>
            </ResponsiveContainer>
          ) : <p className="text-center opacity-30 italic py-10">কোন তথ্য নেই</p>}
        </div>
      </div>
    </div>
  );
}

function NotesView({ t, notes, setNotes }: any) {
  const [currentM, setCurrentM] = useState(new Date().toISOString().substring(0, 7));
  const currentNote = notes.find((n:any) => n.month === currentM)?.text || '';
  const handleSave = (val: string) => {
    const existing = notes.find((n:any) => n.month === currentM);
    if (existing) setNotes(notes.map((n:any) => n.month === currentM ? {...n, text: val} : n));
    else setNotes([...notes, { id: crypto.randomUUID(), month: currentM, text: val }]);
  };
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center"><h3 className="font-bold text-lg">{t('monthlyNote')}</h3><input type="month" value={currentM} onChange={e => setCurrentM(e.target.value)} className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 border-none outline-none font-bold text-xs" /></div>
      <textarea value={currentNote} onChange={e => handleSave(e.target.value)} placeholder="এই মাসের নোট লিখুন..." className="w-full h-80 p-6 rounded-3xl bg-white dark:bg-gray-800 border dark:border-gray-700 outline-none focus:ring-4 focus:ring-indigo-500/10 text-sm leading-relaxed shadow-sm dark:text-gray-100" />
    </div>
  );
}

function SettingsView({ t, settings, onUpdateSettings, onExport, onImport, onShowDevProfile, onManageCategories, onShowUsageGuide }: any) {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-3xl border dark:border-gray-700 p-6 space-y-4 shadow-sm">
        <h4 className="font-bold flex items-center gap-2"><Languages size={18} /> {t('language')}</h4>
        <div className="flex gap-2 p-1 bg-gray-50 dark:bg-gray-900 rounded-xl">
          <button onClick={() => onUpdateSettings({ language: 'bn' })} className={`flex-1 py-2 text-xs font-bold rounded-lg ${settings.language === 'bn' ? 'bg-white dark:bg-gray-700 shadow' : 'text-gray-400'}`}>বাংলা</button>
          <button onClick={() => onUpdateSettings({ language: 'en' })} className={`flex-1 py-2 text-xs font-bold rounded-lg ${settings.language === 'en' ? 'bg-white dark:bg-gray-700 shadow' : 'text-gray-400'}`}>English</button>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-3xl border dark:border-gray-700 overflow-hidden shadow-sm">
        <button onClick={onManageCategories} className="w-full p-5 flex items-center gap-4 border-b dark:border-gray-700 text-left"><ListFilter size={20} /><span className="font-bold text-sm">{t('manageCategories')}</span></button>
        <button onClick={onShowUsageGuide} className="w-full p-5 flex items-center gap-4 border-b dark:border-gray-700 text-left"><BookOpen size={20} /><span className="font-bold text-sm">{t('usageGuide')}</span></button>
        <button onClick={onExport} className="w-full p-5 flex items-center gap-4 border-b dark:border-gray-700 text-left"><Download size={20} /><span className="font-bold text-sm">{t('backup')}</span></button>
        <label className="w-full p-5 flex items-center gap-4 border-b dark:border-gray-700 cursor-pointer text-left"><Upload size={20} /><span className="font-bold text-sm">{t('restore')}</span><input type="file" accept=".json" onChange={onImport} className="hidden" /></label>
        <button onClick={onShowDevProfile} className="w-full p-5 flex items-center gap-4 text-left"><User size={20} /><span className="font-bold text-sm">{t('devProfile')}</span></button>
      </div>
    </div>
  );
}

function EntryModal({ t, lang, onClose, onSubmit, categories, initialData }: any) {
  const [entryType, setEntryType] = useState(initialData?.isLoan ? (initialData.type === 'TAKEN' ? 'TAKEN' : 'GIVEN') : (initialData?.type || 'EXPENSE'));
  const [amount, setAmount] = useState(initialData?.amount?.toString() || '');
  const [category, setCategory] = useState(initialData?.category || '');
  const [person, setPerson] = useState(initialData?.person || '');
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState(initialData?.note || initialData?.reason || '');

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-t-[3rem] p-8 space-y-6 overflow-y-auto max-h-[90vh] shadow-2xl animate-in slide-in-from-bottom duration-400">
        <div className="flex justify-between items-center"><h2 className="text-xl font-black">{initialData ? t('editEntry') : t('addEntry')}</h2><button onClick={onClose} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full"><X size={20} /></button></div>
        <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-900 rounded-xl overflow-x-auto hide-scrollbar">
          {['INCOME', 'EXPENSE', 'TAKEN', 'GIVEN'].map(type => (
            <button key={type} onClick={() => setEntryType(type)} className={`flex-1 py-2 px-3 rounded-lg font-bold text-[10px] uppercase ${entryType === type ? 'bg-white dark:bg-gray-700 shadow text-indigo-600' : 'text-gray-400'}`}>
              {type === 'INCOME' ? 'আয়' : type === 'EXPENSE' ? 'ব্যয়' : type === 'TAKEN' ? 'ঋণ গ্রহণ' : 'ঋণ প্রদান'}
            </button>
          ))}
        </div>
        <div className="space-y-4">
          <input type="number" placeholder="0.00" autoFocus value={amount} onChange={e => setAmount(e.target.value)} className="w-full text-4xl font-black p-6 text-center bg-gray-50 dark:bg-gray-900 rounded-[2rem] border-none outline-none focus:ring-4 focus:ring-indigo-500/10" />
          { (entryType === 'TAKEN' || entryType === 'GIVEN') ? <input type="text" placeholder="ব্যক্তির নাম" value={person} onChange={e => setPerson(e.target.value)} className="w-full p-5 bg-gray-50 dark:bg-gray-900 rounded-2xl outline-none font-bold" /> : <select value={category} onChange={e => setCategory(e.target.value)} className="w-full p-5 bg-gray-50 dark:bg-gray-900 rounded-2xl outline-none font-bold appearance-none"><option value="">ক্যাটাগরি নির্বাচন করুন</option>{categories.filter((c:any) => c.type === entryType).map((c:any) => <option key={c.id} value={c.label}>{c.label}</option>)}</select>}
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-5 bg-gray-50 dark:bg-gray-900 rounded-2xl outline-none font-bold" />
          <textarea placeholder="নোট লিখুন..." value={note} onChange={e => setNote(e.target.value)} className="w-full p-5 bg-gray-50 dark:bg-gray-900 rounded-2xl outline-none font-bold min-h-[80px]" />
        </div>
        <button onClick={() => onSubmit({ entryType, amount: parseFloat(amount), category, person, date, note })} className="w-full py-5 text-white font-black rounded-3xl shadow-xl bg-indigo-600 active:scale-95 transition-all text-lg">{initialData ? t('update') : t('save')}</button>
      </div>
    </div>
  );
}

function PaymentModal({ t, lang, loan, onClose, onSubmit }: any) {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] w-full max-w-sm space-y-6 shadow-2xl animate-in zoom-in-95">
        <h2 className="text-xl font-black">{t('addPayment')}</h2>
        <div className="space-y-4">
          <input type="number" placeholder="পরিমাণ" value={amount} onChange={e => setAmount(e.target.value)} className="w-full p-5 bg-gray-50 dark:bg-gray-900 rounded-2xl outline-none font-black text-xl text-center" />
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-5 bg-gray-50 dark:bg-gray-900 rounded-2xl outline-none font-bold" />
        </div>
        <div className="flex gap-2"><button onClick={() => onSubmit({ amount: parseFloat(amount), date, note: "" })} className="flex-1 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all">নিশ্চিত করুন</button><button onClick={onClose} className="px-6 py-4 bg-gray-100 dark:bg-gray-700 rounded-2xl font-bold">বাতিল</button></div>
      </div>
    </div>
  );
}

function CategoryManagerModal({ t, categories, onUpdateCategories, onClose }: any) {
  const [type, setType] = useState<TransactionType>('INCOME');
  const [label, setLabel] = useState('');
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] w-full max-w-md space-y-6 max-h-[85vh] flex flex-col shadow-2xl animate-in zoom-in-95">
        <div className="flex justify-between items-center"><h2 className="text-xl font-black">{t('manageCategories')}</h2><button onClick={onClose}><X size={24}/></button></div>
        <div className="flex gap-2 p-1 bg-gray-50 dark:bg-gray-900 rounded-2xl"><button onClick={() => setType('INCOME')} className={`flex-1 py-3 rounded-xl font-bold text-xs ${type === 'INCOME' ? 'bg-white shadow text-indigo-600' : 'text-gray-400'}`}>আয়</button><button onClick={() => setType('EXPENSE')} className={`flex-1 py-3 rounded-xl font-bold text-xs ${type === 'EXPENSE' ? 'bg-white shadow text-indigo-600' : 'text-gray-400'}`}>ব্যয়</button></div>
        <div className="flex gap-3"><input type="text" value={label} onChange={e => setLabel(e.target.value)} placeholder="নতুন নাম" className="flex-1 p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl outline-none font-bold text-sm" /><button onClick={() => { if(label) { onUpdateCategories([...categories, {id: crypto.randomUUID(), label, type}]); setLabel(''); } }} className="p-4 bg-indigo-600 text-white rounded-2xl shadow-lg active:scale-90"><Plus size={24}/></button></div>
        <div className="flex-1 overflow-y-auto space-y-2 pr-2 hide-scrollbar">{categories.filter((c:any) => c.type === type).map((c:any) => (<div key={c.id} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800"><span className="font-bold text-sm">{c.label}</span><button onClick={() => onUpdateCategories(categories.filter((cat:any) => cat.id !== c.id))} className="text-rose-500"><Trash2 size={18}/></button></div>))}</div>
      </div>
    </div>
  );
}

function ItemDetailModal({ t, lang, item, onClose }: any) {
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-md p-6 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] w-full max-w-sm space-y-6 shadow-2xl animate-in zoom-in-95">
        <div className="flex justify-between items-center"><h2 className="text-xl font-black">{t('noteDetails')}</h2><button onClick={onClose}><X size={20}/></button></div>
        <div className="space-y-4">
           <div className="flex justify-between border-b dark:border-gray-700 pb-2"><span className="text-gray-400 text-xs">{t('dateLabel')}</span><span className="font-bold">{item.date}</span></div>
           <div className="flex justify-between border-b dark:border-gray-700 pb-2"><span className="text-gray-400 text-xs">{t('category')}</span><span className="font-bold">{item.category}</span></div>
           <div className="flex justify-between border-b dark:border-gray-700 pb-2"><span className="text-gray-400 text-xs">{lang === 'bn' ? 'পরিমাণ' : 'Amount'}</span><span className="font-black">৳ {item.amount}</span></div>
           {item.note && <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl italic text-sm text-gray-500">"{item.note}"</div>}
        </div>
        <button onClick={onClose} className="w-full py-4 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-black rounded-3xl active:scale-95 transition-all">বন্ধ করুন</button>
      </div>
    </div>
  );
}

function DevProfileModal({ t, onClose }: any) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-md p-6 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-gray-800 p-10 rounded-[3rem] text-center space-y-8 w-full max-w-xs shadow-2xl animate-in zoom-in-95">
        <div className="w-32 h-32 bg-indigo-50 dark:bg-indigo-900/20 rounded-full mx-auto flex items-center justify-center p-1 border-4 border-white dark:border-gray-700 shadow-xl"><img src="https://api.dicebear.com/7.x/initials/svg?seed=MHShahid&backgroundColor=4f46e5" alt="Dev" className="rounded-full w-full h-full object-cover" /></div>
        <div className="space-y-1"><h2 className="text-2xl font-black text-gray-900 dark:text-white">{t('devName')}</h2><p className="text-[10px] font-black uppercase tracking-widest opacity-50">Web & App Developer</p></div>
        <div className="flex justify-center gap-6"><a href="#" className="p-3 bg-gray-50 dark:bg-gray-700 rounded-2xl"><Mail size={22}/></a><a href="#" className="p-3 bg-gray-50 dark:bg-gray-700 rounded-2xl"><Facebook size={22}/></a><a href="#" className="p-3 bg-gray-50 dark:bg-gray-700 rounded-2xl"><Send size={22}/></a></div>
        <button onClick={onClose} className="w-full py-5 bg-gray-900 dark:bg-gray-100 dark:text-gray-900 text-white font-black rounded-3xl shadow-xl active:scale-95 transition-all">বন্ধ করুন</button>
      </div>
    </div>
  );
}

function UsageGuideModal({ onClose }: any) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-6 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] w-full max-w-md space-y-6 overflow-y-auto max-h-[85vh] shadow-2xl animate-in zoom-in-95 text-sm">
        <div className="flex justify-between items-center"><h2 className="text-xl font-black">ব্যবহার বিধি</h2><button onClick={onClose}><X size={24}/></button></div>
        <p>১. নতুন আয়-ব্যয় যোগ করতে নিচের প্লাস (+) বাটনে ক্লিক করুন।</p>
        <p>২. লোন ম্যানেজ করতে লোন গ্রহণ বা প্রদান অপশনটি বেছে নিন।</p>
        <p>৩. নিয়মিত ব্যাকআপ নিয়ে রাখুন যাতে ডাটা না হারায়।</p>
        <button onClick={onClose} className="w-full py-5 bg-gray-900 dark:bg-gray-100 dark:text-gray-900 text-white font-black rounded-3xl shadow-xl transition-all">ঠিক আছে</button>
      </div>
    </div>
  );
}

function DeleteConfirmModal({ t, onClose, onConfirm }: any) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-6 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] text-center space-y-6 w-full max-w-xs shadow-2xl animate-in zoom-in-95">
        <Trash2 size={40} className="mx-auto text-rose-500" />
        <h2 className="text-2xl font-black">{t('confirmDelete')}</h2>
        <div className="flex flex-col gap-3"><button onClick={onConfirm} className="w-full py-4 bg-rose-500 text-white font-black rounded-2xl shadow-lg shadow-rose-200">মুছে ফেলুন</button><button onClick={onClose} className="w-full py-4 bg-gray-100 dark:bg-gray-700 rounded-2xl">বাতিল</button></div>
      </div>
    </div>
  );
}

function SettleConfirmModal({ t, onClose, onConfirm }: any) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-6 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] text-center space-y-6 w-full max-w-xs shadow-2xl animate-in zoom-in-95">
        <CheckCircle size={40} className="mx-auto text-emerald-500" />
        <h2 className="text-2xl font-black">পরিশোধ নিশ্চিত করুন</h2>
        <div className="flex flex-col gap-3"><button onClick={onConfirm} className="w-full py-4 bg-emerald-500 text-white font-black rounded-2xl shadow-lg">হ্যাঁ, পরিশোধ হয়েছে</button><button onClick={onClose} className="w-full py-4 bg-gray-100 dark:bg-gray-700 rounded-2xl">বাতিল</button></div>
      </div>
    </div>
  );
}
