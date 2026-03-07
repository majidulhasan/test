import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Package, 
  LayoutDashboard, 
  Wallet, 
  Settings as SettingsIcon, 
  Plus, 
  Search, 
  Bell, 
  User,
  Scissors,
  ChevronRight,
  ArrowLeft,
  Save,
  Trash2,
  Printer,
  Download,
  Upload,
  Moon,
  Sun
} from 'lucide-react';
import { Customer, Measurement, Order, Transaction, AppSettings } from './types';

// Screens
import Dashboard from './components/Dashboard';
import CustomerList from './components/CustomerList';
import MeasurementForm from './components/MeasurementForm';
import OrderList from './components/OrderList';
import Accounting from './components/Accounting';
import Settings from './components/Settings';
import SplashScreen from './components/SplashScreen';
import MeasurementView from './components/MeasurementView';
import NewOrderFlow from './components/NewOrderFlow';
import AddTransactionModal from './components/AddTransactionModal';

type Screen = 'splash' | 'dashboard' | 'customers' | 'measurements' | 'orders' | 'accounts' | 'settings' | 'measurement-view';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [measurements, setMeasurements] = useState<Record<string, Measurement>>({});
  const [orders, setOrders] = useState<Order[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'light',
    primaryColor: '#6C3EF4',
    fontSize: 'medium'
  });

  const [activeCustomerId, setActiveCustomerId] = useState<string | null>(null);
  const [isNewOrderFlowOpen, setIsNewOrderFlowOpen] = useState(false);
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [editTransaction, setEditTransaction] = useState<Transaction | null>(null);

  // Load data from localStorage
  useEffect(() => {
    const safeParse = (key: string, fallback: any) => {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : fallback;
      } catch (e) {
        console.error(`Error parsing ${key} from localStorage`, e);
        return fallback;
      }
    };

    setCustomers(safeParse('tailor_customers', []));
    setMeasurements(safeParse('tailor_measurements', {}));
    setOrders(safeParse('tailor_orders', []));
    setTransactions(safeParse('tailor_transactions', []));
    setSettings(safeParse('tailor_settings', {
      theme: 'light',
      primaryColor: '#6C3EF4',
      fontSize: 'medium'
    }));

    // Splash screen timeout
    const timer = setTimeout(() => {
      setCurrentScreen('dashboard');
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('tailor_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('tailor_measurements', JSON.stringify(measurements));
  }, [measurements]);

  useEffect(() => {
    localStorage.setItem('tailor_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('tailor_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('tailor_settings', JSON.stringify(settings));
  }, [settings]);

  const navigateTo = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  return (
    <div className={`min-h-screen font-sans ${settings.theme === 'dark' ? 'bg-zinc-950 text-white' : 'bg-zinc-50 text-zinc-900'}`}>
      <AnimatePresence mode="wait">
        {currentScreen === 'splash' && (
          <SplashScreen />
        )}

        {currentScreen !== 'splash' && (
          <motion.div 
            key="main-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pb-20"
          >
            {currentScreen === 'dashboard' && (
              <Dashboard 
                customers={customers} 
                orders={orders} 
                transactions={transactions}
                onNavigate={navigateTo}
                settings={settings}
                setSettings={setSettings}
              />
            )}
            {currentScreen === 'customers' && (
              <CustomerList 
                customers={customers} 
                setCustomers={setCustomers}
                onSelectCustomer={(id) => {
                  setActiveCustomerId(id);
                  navigateTo('measurement-view');
                }}
              />
            )}
            {currentScreen === 'measurements' && (
              <MeasurementForm 
                customers={customers}
                setCustomers={setCustomers}
                measurements={measurements}
                setMeasurements={setMeasurements}
                orders={orders}
                initialCustomerId={activeCustomerId || undefined}
                onBack={() => navigateTo('dashboard')}
                onSaveSuccess={() => navigateTo('measurement-view')}
                onCustomerChange={(id) => setActiveCustomerId(id)}
              />
            )}
            {currentScreen === 'measurement-view' && activeCustomerId && measurements[activeCustomerId] && (
              <MeasurementView 
                customer={customers.find(c => c.id === activeCustomerId)!}
                measurement={measurements[activeCustomerId]}
                orders={orders.filter(o => o.customerId === activeCustomerId)}
                onBack={() => navigateTo('customers')}
                onEdit={() => navigateTo('measurements')}
              />
            )}
            {currentScreen === 'orders' && (
              <OrderList 
                orders={orders} 
                setOrders={setOrders}
                customers={customers}
                measurements={measurements}
                onAddTransaction={(tx) => setTransactions(prev => [tx, ...prev])}
              />
            )}
            {currentScreen === 'accounts' && (
              <Accounting 
                transactions={transactions} 
                setTransactions={setTransactions}
                onEdit={(tx) => {
                  setEditTransaction(tx);
                  setIsAddTransactionOpen(true);
                }}
              />
            )}
            {currentScreen === 'settings' && (
              <Settings 
                settings={settings} 
                setSettings={setSettings}
                onClearData={() => {
                  setCustomers([]);
                  setMeasurements({});
                  setOrders([]);
                  setTransactions([]);
                  localStorage.clear();
                }}
              />
            )}

            {/* Bottom Navigation */}
            <nav className={`fixed bottom-0 left-0 right-0 h-16 border-t flex items-center justify-around px-4 z-50 ${settings.theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}>
              <NavItem 
                icon={<LayoutDashboard size={20} />} 
                label="ড্যাশবোর্ড" 
                active={currentScreen === 'dashboard'} 
                onClick={() => navigateTo('dashboard')}
                settings={settings}
              />
              <NavItem 
                icon={<Users size={20} />} 
                label="কাস্টমার" 
                active={currentScreen === 'customers'} 
                onClick={() => navigateTo('customers')}
                settings={settings}
              />
              <NavItem 
                icon={<Package size={20} />} 
                label="অর্ডার" 
                active={currentScreen === 'orders'} 
                onClick={() => navigateTo('orders')}
                settings={settings}
              />
              <NavItem 
                icon={<Wallet size={20} />} 
                label="হিসাব" 
                active={currentScreen === 'accounts'} 
                onClick={() => navigateTo('accounts')}
                settings={settings}
              />
              <NavItem 
                icon={<SettingsIcon size={20} />} 
                label="সেটিংস" 
                active={currentScreen === 'settings'} 
                onClick={() => navigateTo('settings')}
                settings={settings}
              />
            </nav>

            {/* Floating Action Button */}
            {currentScreen !== 'measurements' && currentScreen !== 'orders' && currentScreen !== 'settings' && (
              <div className="fixed bottom-24 right-6 z-[60]">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    if (currentScreen === 'accounts') {
                      setEditTransaction(null);
                      setIsAddTransactionOpen(true);
                    } else {
                      setIsNewOrderFlowOpen(true);
                    }
                  }}
                  className="w-14 h-14 rounded-full text-white flex items-center justify-center shadow-xl shadow-indigo-200"
                  style={{ backgroundColor: settings.primaryColor }}
                >
                  <Plus size={28} />
                </motion.button>
              </div>
            )}

            {/* Modals */}
            <AnimatePresence>
              {isNewOrderFlowOpen && (
                <NewOrderFlow 
                  customers={customers}
                  setCustomers={setCustomers}
                  measurements={measurements}
                  setMeasurements={setMeasurements}
                  onClose={() => setIsNewOrderFlowOpen(false)}
                  onComplete={(customerId) => {
                    setIsNewOrderFlowOpen(false);
                    setActiveCustomerId(customerId);
                    navigateTo('measurement-view');
                  }}
                  initialCustomerId={currentScreen === 'measurement-view' ? activeCustomerId || undefined : undefined}
                />
              )}
              {isAddTransactionOpen && (
                <AddTransactionModal 
                  isOpen={isAddTransactionOpen}
                  onClose={() => {
                    setIsAddTransactionOpen(false);
                    setEditTransaction(null);
                  }}
                  editTransaction={editTransaction}
                  onAdd={(tx) => {
                    if (editTransaction) {
                      setTransactions(prev => prev.map(t => t.id === tx.id ? tx : t));
                    } else {
                      setTransactions(prev => [tx, ...prev]);
                    }
                  }}
                />
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavItem({ icon, label, active, onClick, settings }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void, settings: AppSettings }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center space-y-1 transition-colors ${active ? '' : 'text-zinc-400'}`}
      style={{ color: active ? settings.primaryColor : undefined }}
    >
      <div className={`p-1 rounded-lg transition-colors ${active ? 'bg-opacity-10' : ''}`} style={{ backgroundColor: active ? `${settings.primaryColor}20` : 'transparent' }}>
        {icon}
      </div>
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}
