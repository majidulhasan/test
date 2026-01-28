import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, History, PieChart as ChartIcon, Settings as SettingsIcon, Plus, FileText,
  Moon, Sun, Trash2, Download, User, TrendingUp, TrendingDown,
  ChevronRight, Calendar, Info, HelpCircle, ArrowUpCircle, ArrowDownCircle,
  Wallet, HandCoins, AlertCircle, CheckCircle2, ClipboardList
} from 'lucide-react';
import { storage } from './storage';
import { Transaction, Loan, StorageData, ThemeColor, MonthlyNote, TransactionType } from './types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
  AreaChart, Area
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
    appTitle: 'আমার খাতা', diaryTitle: 'আমার ডিজিটাল ডায়েরি', home: 'হোম', history: 'হিসাব', summary: 'সংক্ষিপ্ত', reports: 'রিপোর্ট', settings: 'সেটিং', currentBalance: 'বর্তমান ব্যালেন্স', totalIncome: 'মোট আয়', totalExpense: 'মোট ব্যয়', todayIncome: 'আজকের আয়', todayExpense: 'আজকের ব্যয়', loanGiven: 'পাওনা টাকা', loanTaken: 'ধার নেওয়া', recentHistory: 'সাম্প্রতিক হিসাব', seeAll: 'সব দেখুন', language: 'অ্যাপের ভাষা', devProfile: 'ডেভেলপার পরিচিতি', usageGuide: 'ব্যবহার বিধি', backup: 'ব্যাকআপ ডাউনলোড', restore: 'ব্যাকআপ রিস্টোর', themeColor: 'থিম কালার', save: 'সংরক্ষণ করুন', update: 'আপডেট করুন', addEntry: 'হিসাব যোগ করুন', editEntry: 'হিসাব সংশোধন', monthlyNote: 'নোটসমূহ', devName: 'মো: মাজিদুল হাসান {শাহীন}', close: 'বন্ধ করুন', monthlySummary: 'মাসিক সারসংক্ষেপ', balance: 'অবশিষ্ট', confirmDelete: 'আপনি কি নিশ্চিত?', deleteWarn: 'এই হিসাবটি ডিলেট করলে আর ফিরে পাওয়া যাবে না।', deleteBtn: 'হ্যাঁ, ডিলেট করুন', cancelBtn: 'না, থাক', noteDetails: 'বিস্তারিত তথ্য', transactionNotes: 'নোটসমূহ', dateLabel: 'তারিখ', incomeType: 'আয়', expenseType: 'ব্যয়'
  },
  en: {
    appTitle: 'Amar Khata', diaryTitle: 'My Digital Diary', home: 'Home', history: 'History', summary: 'Summary', reports: 'Reports', settings: 'Settings', currentBalance: 'Current Balance', totalIncome: 'Total Income', totalExpense: 'Total Expense', todayIncome: 'Today Income', todayExpense: 'Today Expense', loanGiven: 'Money Owed', loanTaken: 'Money Borrowed', recentHistory: 'Recent Transactions', seeAll: 'See All', language: 'App Language', devProfile: 'Developer Profile', usageGuide: 'Usage Guide', backup: 'Download Backup', restore: 'Restore Backup', themeColor: 'Theme Color', save: 'Save Changes', update: 'Update Entry', addEntry: 'Add Entry', editEntry: 'Edit Entry', monthlyNote: 'Notes', devName: 'Md. Majidul Hasan {Shahin}', close: 'Close', monthlySummary: 'Monthly Summary', balance: 'Balance', confirmDelete: 'Are you sure?', deleteWarn: 'If deleted, it cannot be recovered.', deleteBtn: 'Yes, Delete', cancelBtn: 'No, Keep', noteDetails: 'Detailed Info', transactionNotes: 'Notes', dateLabel: 'Date', incomeType: 'Income', expenseType: 'Expense'
  }
};

export default function App() {
  const [data, setData] = useState<StorageData>(storage.getData());
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(data.settings.theme === 'dark');
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{id: string, isLoan: boolean} | null>(null);
  const [showDevModal, setShowDevModal] = useState(false);
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
    if (isDarkMode) root.classList.add('dark'); else root.classList.remove('dark');
    root.style.setProperty('--theme-color', activeColorHex);
  }, [data, isDarkMode, activeColorHex]);

  const totals = useMemo(() => {
    const income = data.khata.transactions.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
    const expense = data.khata.transactions.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);
    const loanTaken = data.khata.loans.filter(l => l.type === 'TAKEN' && l.status === 'PENDING').reduce((s, l) => s + l.amount, 0);
    const loanGiven = data.khata.loans.filter(l => l.type === 'GIVEN' && l.status === 'PENDING').reduce((s, l) => s + l.amount, 0);
    return { income, expense, loanTaken, loanGiven, balance: income - expense + loanTaken - loanGiven };
  }, [data.khata.transactions, data.khata.loans]);

  const handleAddEntry = (entry: { entryType: TransactionType, amount: number, category: string, date: string, note?: string }) => {
    setIsLoading(true);
    setTimeout(() => {
      const id = editingItem?.id || crypto.randomUUID();
      const newT: Transaction = { id, type: entry.entryType, amount: entry.amount, category: entry.category, note: entry.note || '', date: entry.date };
      setData(prev => ({ 
        ...prev, 
        khata: { 
          ...prev.khata, 
          transactions: editingItem ? prev.khata.transactions.map(item => item.id === id ? newT : item) : [newT, ...prev.khata.transactions] 
        }
      }));
      setIsLoading(false); setShowEntryModal(false); setEditingItem(null);
    }, 400);
  };

  const currentTheme = data.settings.themeColor;

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${isDarkMode ? 'dark bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      {isLoading && <div className="fixed top-0 left-0 w-full h-1 z-[100]"><div className={`h-full animate-progress ${THEME_MAP[currentTheme].split(' ')[0]}`}></div></div>}
      
      <header className="px-6 py-5 flex justify-between items-center bg-white dark:bg-gray-800 border-b dark:border-gray-700 sticky top-0 z-40 backdrop-blur-lg bg-opacity-80 dark:bg-opacity-80">
        <div>
          <p className={`text-[10px] font-bold uppercase tracking-widest ${THEME_MAP[currentTheme].split(' ')[2]}`}>{t('diaryTitle')}</p>
          <h1 className="text-xl font-extrabold text-gray-900 dark:text-gray-100">{t('appTitle')}</h1>
        </div>
        <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2.5 rounded-2xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 transition-all hover:scale-110 active:scale-95">
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full px-5 py-6 pb-32 overflow-x-hidden">
        {activeTab === 'dashboard' && <DashboardView t={t} totals={totals} transactions={data.khata.transactions} theme={currentTheme} onShowAll={() => setActiveTab('history')} />}
        {activeTab === 'history' && <HistoryView t={t} transactions={data.khata.transactions} onDelete={(id:string) => setDeleteConfirmation({id, isLoan:false})} />}
        {activeTab === 'summary' && <SummaryView t={t} transactions={data.khata.transactions} totals={totals} />}
        {activeTab === 'notes' && <NotesView t={t} notes={data.khata.notes} setNotes={(n: MonthlyNote[]) => setData(p => ({...p, khata: {...p.khata, notes: n}}))} />}
        {activeTab === 'reports' && <ReportsView t={t} transactions={data.khata.transactions} theme={currentTheme} />}
        {activeTab === 'settings' && <SettingsView t={t} onShowDevProfile={() => setShowDevModal(true)} onExport={storage.exportToJSON} theme={currentTheme} settings={data.settings} onUpdateSettings={(s: any) => setData(p => ({...p, settings: {...p.settings, ...s}}))} />}
      </main>

      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50">
        <button onClick={() => { setEditingItem(null); setShowEntryModal(true); }} className={`${THEME_MAP[currentTheme].split(' ')[0]} text-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center hover:scale-105 active:scale-90 transition-all ring-4 ring-white dark:ring-gray-800`}>
          <Plus size={32} strokeWidth={3} />
        </button>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t dark:border-gray-700 px-2 py-3 pb-6 flex justify-around items-center z-40 shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.1)]">
        <NavItem icon={<LayoutDashboard size={20} />} label={t('home')} active={activeTab === 'dashboard'} theme={currentTheme} onClick={() => setActiveTab('dashboard')} />
        <NavItem icon={<History size={20} />} label={t('history')} active={activeTab === 'history'} theme={currentTheme} onClick={() => setActiveTab('history')} />
        <NavItem icon={<ClipboardList size={20} />} label={t('summary')} active={activeTab === 'summary'} theme={currentTheme} onClick={() => setActiveTab('summary')} />
        <div className="w-14"></div>
        <NavItem icon={<FileText size={20} />} label={t('monthlyNote')} active={activeTab === 'notes'} theme={currentTheme} onClick={() => setActiveTab('notes')} />
        <NavItem icon={<ChartIcon size={20} />} label={t('reports')} active={activeTab === 'reports'} theme={currentTheme} onClick={() => setActiveTab('reports')} />
        <NavItem icon={<SettingsIcon size={20} />} label={t('settings')} active={activeTab === 'settings'} theme={currentTheme} onClick={() => setActiveTab('settings')} />
      </nav>

      {showEntryModal && <EntryModal t={t} onClose={() => setShowEntryModal(false)} onSubmit={handleAddEntry} theme={currentTheme} />}
      {showDevModal && <DevProfileModal t={t} onClose={() => setShowDevModal(false)} />}
      {deleteConfirmation && <DeleteConfirmModal t={t} onClose={() => setDeleteConfirmation(null)} onConfirm={() => {
        setData(prev => ({ ...prev, khata: { ...prev.khata, transactions: prev.khata.transactions.filter(t => t.id !== deleteConfirmation.id) }}));
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

function DashboardView({ t, totals, transactions, theme, onShowAll }: any) {
  const gradientClass = THEME_GRADIENT[theme as ThemeColor];
  const recentItems = transactions.slice(0, 5);
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className={`bg-gradient-to-br ${gradientClass} rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group`}>
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all"></div>
        <p className="text-white/80 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2"><Wallet size={14} /> {t('currentBalance')}</p>
        <h2 className="text-4xl font-black mb-6 tracking-tight">৳ {totals.balance.toLocaleString()}</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 p-4 rounded-3xl backdrop-blur-sm">
            <p className="text-[10px] text-white/70 uppercase font-bold">{t('totalIncome')}</p>
            <p className="font-bold text-lg">৳ {totals.income.toLocaleString()}</p>
          </div>
          <div className="bg-white/10 p-4 rounded-3xl backdrop-blur-sm">
            <p className="text-[10px] text-white/70 uppercase font-bold">{t('totalExpense')}</p>
            <p className="font-bold text-lg">৳ {totals.expense.toLocaleString()}</p>
          </div>
        </div>
      </div>
      <div>
        <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-black">{t('recentHistory')}</h3><button onClick={onShowAll} className="text-xs font-bold text-indigo-500 flex items-center gap-1">{t('seeAll')} <ChevronRight size={14}/></button></div>
        <div className="space-y-3">
          {recentItems.length === 0 ? (
            <div className="text-center py-10 opacity-30 italic">কোনো ডাটা পাওয়া যায়নি</div>
          ) : recentItems.map((item: Transaction) => (
            <div key={item.id} className="bg-white dark:bg-gray-800 p-4 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between hover:scale-[1.02] transition-transform">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-2xl ${item.type === 'INCOME' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' : 'bg-rose-100 text-rose-600 dark:bg-rose-900/30'}`}>
                  {item.type === 'INCOME' ? <ArrowUpCircle size={20} /> : <ArrowDownCircle size={20} />}
                </div>
                <div><p className="font-bold text-sm">{item.category}</p><p className="text-[10px] text-gray-400">{item.date}</p></div>
              </div>
              <p className={`font-black ${item.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>৳ {item.amount.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HistoryView({ t, transactions, onDelete }: any) {
  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <h3 className="text-xl font-black mb-4 flex items-center gap-2"><History size={24} /> {t('history')}</h3>
      {transactions.length === 0 ? (
        <div className="text-center py-20 opacity-30 italic">হিসাব খাতা খালি</div>
      ) : transactions.map((item: Transaction) => (
        <div key={item.id} className="bg-white dark:bg-gray-800 p-5 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${item.type === 'INCOME' ? 'text-emerald-500' : 'text-rose-500'}`}>
              {item.type === 'INCOME' ? <TrendingUp size={18}/> : <TrendingDown size={18}/>}
            </div>
            <div><p className="font-bold text-sm">{item.category}</p><p className="text-[10px] text-gray-400">{item.date}</p></div>
          </div>
          <div className="flex items-center gap-4">
            <p className={`font-black ${item.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>৳ {item.amount}</p>
            <button onClick={() => onDelete(item.id)} className="text-rose-400 p-2 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors"><Trash2 size={16}/></button>
          </div>
        </div>
      ))}
    </div>
  );
}

function SummaryView({ t, totals, transactions }: any) {
  const categorySummary = useMemo(() => {
    const summary: Record<string, number> = {};
    transactions.forEach((t: Transaction) => {
      if (t.type === 'EXPENSE') {
        summary[t.category] = (summary[t.category] || 0) + t.amount;
      }
    });
    return Object.entries(summary).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);
  }, [transactions]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h3 className="text-xl font-black mb-4">{t('monthlySummary')}</h3>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] border dark:border-gray-700 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h4 className="font-bold text-sm uppercase opacity-50 tracking-wider">ব্যয় বিশ্লেষণ</h4>
          <PieChart size={16} className="opacity-20" />
        </div>
        {categorySummary.length === 0 ? (
          <div className="text-center py-10 opacity-30 italic text-sm">কোনো ব্যয় পাওয়া যায়নি</div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categorySummary} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} paddingAngle={5} label>
                  {categorySummary.map((_, index) => <Cell key={`cell-${index}`} fill={[`#4f46e5`, `#10b981`, `#f43f5e`, `#f59e0b`, `#8b5cf6`][index % 5]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-emerald-50 dark:bg-emerald-900/10 p-5 rounded-3xl border border-emerald-100 dark:border-emerald-800/30 text-center">
            <p className="text-[10px] font-bold text-emerald-600 uppercase mb-1">মোট আয়</p>
            <p className="font-black text-xl text-emerald-700">৳ {totals.income}</p>
        </div>
        <div className="bg-rose-50 dark:bg-rose-900/10 p-5 rounded-3xl border border-rose-100 dark:border-rose-800/30 text-center">
            <p className="text-[10px] font-bold text-rose-600 uppercase mb-1">মোট ব্যয়</p>
            <p className="font-black text-xl text-rose-700">৳ {totals.expense}</p>
        </div>
      </div>
    </div>
  );
}

function ReportsView({ t, transactions, theme }: any) {
  const chartData = useMemo(() => {
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => ({
      date: date.split('-')[2],
      income: transactions.filter((t: Transaction) => t.date === date && t.type === 'INCOME').reduce((s: number, t: Transaction) => s + t.amount, 0),
      expense: transactions.filter((t: Transaction) => t.date === date && t.type === 'EXPENSE').reduce((s: number, t: Transaction) => s + t.amount, 0),
    }));
  }, [transactions]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h3 className="text-xl font-black mb-4">{t('reports')}</h3>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-[2.5rem] border dark:border-gray-700 shadow-sm overflow-hidden">
        <p className="text-xs font-bold opacity-40 uppercase mb-6">গত ৭ দিনের লেখনচিত্র</p>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888822" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} hide />
              <Tooltip />
              <Area type="monotone" dataKey="income" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={3} />
              <Area type="monotone" dataKey="expense" stroke="#f43f5e" fillOpacity={1} fill="url(#colorExpense)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-gray-100 dark:bg-gray-800/50 p-4 rounded-2xl flex items-center gap-3">
        <HelpCircle size={16} className="text-indigo-500" />
        <p className="text-[10px] leading-relaxed opacity-50 uppercase font-bold">এই চার্টটি আপনার প্রতিদিনের আয় এবং ব্যয়ের তুলনামূলক চিত্র তুলে ধরে। সবুজ মানে আয় এবং লাল মানে ব্যয়।</p>
      </div>
    </div>
  );
}

function NotesView({ t, notes, setNotes }: any) {
  const activeMonth = useMemo(() => new Date().toISOString().substring(0, 7), []);
  const currentNote = notes.find((n: MonthlyNote) => n.month === activeMonth);
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h3 className="font-black text-xl flex items-center gap-2"><FileText size={24} /> {t('monthlyNote')}</h3>
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-[3rem] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
        <textarea 
          className="relative w-full h-80 p-8 rounded-[3rem] bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 outline-none shadow-sm dark:text-gray-100 leading-relaxed text-sm focus:ring-2 ring-indigo-500/20 transition-all" 
          placeholder="আপনার বিশেষ নোট এখানে লিখে রাখুন..." 
          value={currentNote?.text || ''} 
          onChange={(e) => {
            const text = e.target.value;
            if (currentNote) {
              setNotes(notes.map((n: MonthlyNote) => n.month === activeMonth ? { ...n, text } : n));
            } else {
              setNotes([...notes, { id: crypto.randomUUID(), month: activeMonth, text }]);
            }
          }} 
        />
      </div>
      <p className="text-center text-[10px] opacity-30 uppercase font-bold tracking-widest">{activeMonth} - এর জন্য নোট সংরক্ষিত হচ্ছে</p>
    </div>
  );
}

function SettingsView({ t, onShowDevProfile, onExport, theme, settings, onUpdateSettings }: any) {
  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <h3 className="text-xl font-black mb-4 flex items-center gap-2"><SettingsIcon size={24} /> {t('settings')}</h3>
      
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-2 shadow-sm border dark:border-gray-700">
        <button onClick={() => onUpdateSettings({ language: settings.language === 'bn' ? 'en' : 'bn' })} className="w-full p-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-2xl transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 text-amber-600 dark:bg-amber-900/20 rounded-xl"><Info size={18}/></div>
            <span className="font-bold text-sm">{t('language')}</span>
          </div>
          <span className="text-xs font-black uppercase text-indigo-500">{settings.language === 'bn' ? 'বাংলা' : 'English'}</span>
        </button>

        <button onClick={onShowDevProfile} className="w-full p-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-2xl transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-600 dark:bg-indigo-900/20 rounded-xl"><User size={18}/></div>
            <span className="font-bold text-sm">{t('devProfile')}</span>
          </div>
          <ChevronRight size={16} className="opacity-30" />
        </button>

        <button onClick={onExport} className="w-full p-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-2xl transition-colors border-t dark:border-gray-700 mt-2 pt-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-600 dark:bg-blue-900/20 rounded-xl"><Download size={18}/></div>
            <span className="font-bold text-sm">{t('backup')}</span>
          </div>
          <ChevronRight size={16} className="opacity-30" />
        </button>
      </div>

      <div className="p-6 text-center opacity-20">
        <p className="text-[10px] font-bold uppercase tracking-widest">Version 2.5.0 Gold Edition</p>
      </div>
    </div>
  );
}

function EntryModal({ t, onClose, onSubmit, theme }: any) {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [category, setCategory] = useState('অন্যান্য');
  
  const accentColor = type === 'INCOME' ? 'text-emerald-500' : 'text-rose-500';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] w-full max-w-md shadow-2xl scale-in-center animate-in zoom-in-95 duration-200">
        <div className="flex gap-2 mb-6 bg-gray-100 dark:bg-gray-700 p-1.5 rounded-2xl">
          <button onClick={() => setType('INCOME')} className={`flex-1 p-3 rounded-xl font-bold transition-all ${type === 'INCOME' ? 'bg-white dark:bg-gray-600 shadow-sm text-emerald-600' : 'text-gray-400'}`}>{t('incomeType')}</button>
          <button onClick={() => setType('EXPENSE')} className={`flex-1 p-3 rounded-xl font-bold transition-all ${type === 'EXPENSE' ? 'bg-white dark:bg-gray-600 shadow-sm text-rose-600' : 'text-gray-400'}`}>{t('expenseType')}</button>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-xl opacity-20">৳</span>
            <input 
              type="number" 
              autoFocus
              className={`w-full p-5 pl-10 bg-gray-50 dark:bg-gray-700 rounded-3xl outline-none border-2 border-transparent focus:border-indigo-500 transition-all font-black text-2xl ${accentColor}`}
              placeholder="0.00" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)} 
            />
          </div>

          <select 
            className="w-full p-4 bg-gray-50 dark:bg-gray-700 rounded-2xl outline-none border-2 border-transparent focus:border-indigo-500 font-bold text-sm"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="অন্যান্য">অন্যান্য</option>
            <option value="খাবার">খাবার</option>
            <option value="বেতন">বেতন</option>
            <option value="ভাড়া">ভাড়া</option>
            <option value="যাতায়াত">যাতায়াত</option>
            <option value="শপিং">শপিং</option>
          </select>
          
          <div className="flex gap-4 pt-4">
            <button onClick={onClose} className="flex-1 p-4 bg-gray-100 dark:bg-gray-700 rounded-2xl font-bold transition-all active:scale-95">{t('close')}</button>
            <button 
              onClick={() => { if(!amount) return; onSubmit({entryType: type, amount: parseFloat(amount), date: new Date().toISOString().split('T')[0], category}); }} 
              className={`flex-1 p-4 ${THEME_MAP[theme as ThemeColor].split(' ')[0]} text-white rounded-2xl font-bold shadow-lg transition-all active:scale-95`}
            >
              {t('save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DevProfileModal({ t, onClose }: any) {
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-[3rem] w-full max-w-sm text-center shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl border-4 border-white dark:border-gray-700">
          <User className="text-white" size={48} />
        </div>
        <h2 className="text-2xl font-black mb-2 leading-none">{t('devName')}</h2>
        <p className="text-sm opacity-50 mb-8 font-bold uppercase tracking-widest">Full-Stack Engineer</p>
        <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-2xl text-left">
                <CheckCircle2 size={18} className="text-indigo-500" />
                <span className="text-xs font-bold opacity-70">প্রোফেশনাল অ্যাপ ডেভেলপমেন্ট</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-2xl text-left">
                <CheckCircle2 size={18} className="text-emerald-500" />
                <span className="text-xs font-bold opacity-70">ক্লিন এবং মডার্ন ইউজার ইন্টারফেস</span>
            </div>
        </div>
        <button onClick={onClose} className="p-4 bg-gray-900 dark:bg-white dark:text-gray-900 text-white w-full rounded-2xl font-black mt-8 transition-all active:scale-95 shadow-lg">{t('close')}</button>
      </div>
    </div>
  );
}

function DeleteConfirmModal({ t, onClose, onConfirm }: any) {
  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] text-center shadow-2xl max-w-xs w-full animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 bg-rose-100 text-rose-500 dark:bg-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} />
        </div>
        <h3 className="font-black text-xl mb-2">{t('confirmDelete')}</h3>
        <p className="text-sm opacity-50 mb-8 leading-relaxed">{t('deleteWarn')}</p>
        <div className="flex flex-col gap-3">
          <button onClick={onConfirm} className="p-4 bg-rose-600 text-white rounded-2xl font-bold shadow-lg shadow-rose-200 dark:shadow-none transition-all active:scale-95">{t('deleteBtn')}</button>
          <button onClick={onClose} className="p-4 bg-gray-100 dark:bg-gray-700 font-bold rounded-2xl transition-all active:scale-95">{t('cancelBtn')}</button>
        </div>
      </div>
    </div>
  );
}