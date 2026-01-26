
import React, { useState, useEffect } from 'react';
import { Transaction, AppSettings, ViewState, MonthlyNote, Person } from './types';
import { I18N } from './constants';
import Dashboard from './components/Dashboard';
import TransactionList from './components/TransactionList';
import Reports from './components/Reports';
import Settings from './components/Settings';
import TransactionForm from './components/TransactionForm';
import BakiKhata from './components/BakiKhata';
import SmartInsights from './components/SmartInsights';
import PinLock from './components/PinLock';

const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('tk_transactions');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [people, setPeople] = useState<Person[]>(() => {
    const saved = localStorage.getItem('tk_people');
    return saved ? JSON.parse(saved) : [];
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('tk_settings');
    const defaultSettings: AppSettings = {
      language: 'bn', theme: 'light', monthlyBudget: 0,
      isPinEnabled: false,
      customCategories: { income: [], expense: [] }
    };
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  });

  const [notes, setNotes] = useState<MonthlyNote[]>(() => {
    const saved = localStorage.getItem('tk_notes');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeView, setActiveView] = useState<ViewState>('dashboard');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    if (settings.isPinEnabled && settings.pin) {
      setIsLocked(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tk_transactions', JSON.stringify(transactions));
    localStorage.setItem('tk_people', JSON.stringify(people));
    localStorage.setItem('tk_settings', JSON.stringify(settings));
    localStorage.setItem('tk_notes', JSON.stringify(notes));
    document.documentElement.classList.toggle('dark', settings.theme === 'dark');
  }, [transactions, people, settings, notes]);

  const t = I18N[settings.language];

  const updatePersonBalance = (personId: string, amount: number, type: 'add' | 'remove') => {
    setPeople(prev => prev.map(p => {
      if (p.id === personId) {
        return { ...p, balance: p.balance + (type === 'add' ? amount : -amount) };
      }
      return p;
    }));
  };

  const addTransaction = (txn: Transaction, isNewCategory?: boolean) => {
    setTransactions(prev => [txn, ...prev]);
    if (txn.personId && txn.method === 'credit') {
      const balanceImpact = txn.type === 'expense' ? txn.amount : -txn.amount;
      updatePersonBalance(txn.personId, balanceImpact, 'add');
    }
    if (isNewCategory) {
      setSettings(prev => ({
        ...prev,
        customCategories: {
          ...prev.customCategories,
          [txn.type]: [...(prev.customCategories?.[txn.type] || []), txn.category]
        }
      }));
    }
  };

  const updateTransaction = (newTxn: Transaction) => {
    const oldTxn = transactions.find(t => t.id === newTxn.id);
    if (!oldTxn) return;

    // Revert old impact
    if (oldTxn.personId && oldTxn.method === 'credit') {
      const oldImpact = oldTxn.type === 'expense' ? oldTxn.amount : -oldTxn.amount;
      updatePersonBalance(oldTxn.personId, oldImpact, 'remove');
    }

    // Apply new impact
    if (newTxn.personId && newTxn.method === 'credit') {
      const newImpact = newTxn.type === 'expense' ? newTxn.amount : -newTxn.amount;
      updatePersonBalance(newTxn.personId, newImpact, 'add');
    }

    setTransactions(prev => prev.map(t => t.id === newTxn.id ? newTxn : t));
    setEditingTransaction(null);
  };

  const deleteTransaction = (id: string) => {
    if (confirm(t.confirmDelete)) {
      const txn = transactions.find(t => t.id === id);
      if (txn?.personId && txn.method === 'credit') {
        const impact = txn.type === 'expense' ? txn.amount : -txn.amount;
        updatePersonBalance(txn.personId, impact, 'remove');
      }
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  if (isLocked && settings.pin) {
    return <PinLock correctPin={settings.pin} onUnlock={() => setIsLocked(false)} language={settings.language} />;
  }

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard 
                  transactions={transactions} people={people} language={settings.language} 
                  onAddClick={() => setActiveView('add')} budget={settings.monthlyBudget}
                  onAiClick={() => setActiveView('ai_insights')}
                />;
      case 'transactions':
        return <TransactionList 
                  transactions={transactions} language={settings.language} 
                  onEdit={txn => { setEditingTransaction(txn); setActiveView('add'); }}
                  onDelete={deleteTransaction}
                />;
      case 'baki':
        return <BakiKhata 
                  people={people} transactions={transactions} language={settings.language}
                  onAddPerson={p => setPeople(prev => [...prev, p])}
                  onSettle={(personId, amount) => {
                    const settleTxn: Transaction = {
                      id: Date.now().toString(),
                      amount: Math.abs(amount),
                      type: amount > 0 ? 'income' : 'expense',
                      method: 'cash',
                      category: settings.language === 'bn' ? 'হিসাব সমন্বয়' : 'Settlement',
                      date: new Date().toISOString(),
                      personId,
                      note: settings.language === 'bn' ? 'পুরাতন হিসাব মিটানো হয়েছে' : 'Old balance settled'
                    };
                    addTransaction(settleTxn);
                    setPeople(prev => prev.map(p => p.id === personId ? { ...p, balance: 0 } : p));
                  }}
                />;
      case 'reports':
        return <Reports 
                  transactions={transactions} notes={notes} language={settings.language} 
                  onUpdateNote={(my, c) => setNotes(prev => {
                    const ex = prev.find(n => n.monthYear === my);
                    return ex ? prev.map(n => n.monthYear === my ? { ...n, content: c } : n) : [...prev, { monthYear: my, content: c }];
                  })}
                />;
      case 'settings':
        return <Settings settings={settings} setSettings={setSettings} onReset={() => {
          if (confirm(t.resetWarning)) {
            localStorage.clear();
            window.location.reload();
          }
        }} />;
      case 'ai_insights':
        return <SmartInsights transactions={transactions} language={settings.language} onClose={() => setActiveView('dashboard')} />;
      case 'add':
        return <TransactionForm 
                  initialData={editingTransaction} people={people} language={settings.language} 
                  customCategories={settings.customCategories}
                  onSave={(txn, isNew) => {
                    if (editingTransaction) updateTransaction(txn);
                    else addTransaction(txn, isNew);
                    setActiveView('dashboard');
                  }}
                  onCancel={() => { setEditingTransaction(null); setActiveView('dashboard'); }}
                />;
      default: return null;
    }
  };

  return (
    <div className={`min-h-screen pb-24 transition-colors duration-200 ${settings.theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <header className={`sticky top-0 z-40 px-6 py-4 flex justify-between items-center backdrop-blur-md ${settings.theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-100'} border-b`}>
        <h1 className="text-2xl font-black text-teal-600 dark:text-teal-400 flex items-center gap-3 italic">
          <i className="fas fa-book-bookmark"></i>
          {t.appName}
        </h1>
        <div className="flex gap-4">
          <button 
            onClick={() => setActiveView('ai_insights')}
            className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 rounded-2xl flex items-center justify-center shadow-inner"
          >
            <i className="fas fa-sparkles"></i>
          </button>
          <button 
            onClick={() => setSettings(s => ({ ...s, theme: s.theme === 'light' ? 'dark' : 'light' }))} 
            className="w-10 h-10 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-2xl flex items-center justify-center shadow-inner"
          >
            <i className={`fas ${settings.theme === 'light' ? 'fa-moon' : 'fa-sun'}`}></i>
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto">{renderContent()}</main>

      <nav className={`fixed bottom-6 left-6 right-6 h-20 rounded-[2.5rem] shadow-2xl flex justify-around items-center z-50 px-4 backdrop-blur-xl ${settings.theme === 'dark' ? 'bg-slate-800/90 border-slate-700' : 'bg-white/90 border-slate-200'} border`}>
        {[
          { id: 'dashboard', icon: 'fa-house', label: t.dashboard },
          { id: 'transactions', icon: 'fa-receipt', label: t.transactions },
          { id: 'baki', icon: 'fa-address-book', label: t.baki },
          { id: 'reports', icon: 'fa-chart-simple', label: t.reports },
          { id: 'settings', icon: 'fa-sliders', label: t.settings },
        ].map(item => (
          <button 
            key={item.id}
            onClick={() => setActiveView(item.id as ViewState)}
            className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all ${activeView === item.id ? 'bg-teal-600 text-white shadow-xl shadow-teal-600/30 scale-110' : 'text-slate-400 hover:text-teal-500'}`}
          >
            <i className={`fas ${item.icon} text-lg`}></i>
            <span className="text-[7px] font-black uppercase mt-1 leading-none">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;
