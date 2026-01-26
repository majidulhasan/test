
export type TransactionType = 'income' | 'expense';
export type PaymentMethod = 'cash' | 'credit';

export interface Person {
  id: string;
  name: string;
  phone?: string;
  type: string; 
  balance: number; 
  dueDate?: string;
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  method: PaymentMethod;
  category: string;
  date: string; 
  personId?: string; 
  source?: string; 
  note?: string;
  image?: string; 
  dueDate?: string;
}

export interface AppSettings {
  language: 'bn' | 'en';
  theme: 'light' | 'dark';
  monthlyBudget: number;
  pin?: string;
  isPinEnabled: boolean;
  customCategories?: {
    income: string[];
    expense: string[];
  };
}

export interface MonthlyNote {
  monthYear: string; 
  content: string;
}

export type ViewState = 'dashboard' | 'transactions' | 'reports' | 'settings' | 'add' | 'baki' | 'ai_insights';
