
import React from 'react';
import { 
  Home, 
  Utensils, 
  Car, 
  Briefcase, 
  ShoppingBag, 
  HeartPulse, 
  Gamepad2, 
  Smartphone,
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const CATEGORIES = {
  INCOME: [
    { label: 'বেতন', value: 'Salary', icon: <Briefcase size={16} /> },
    { label: 'বোনাস', value: 'Bonus', icon: <Wallet size={16} /> },
    { label: 'উপহার', value: 'Gift', icon: <ShoppingBag size={16} /> },
    { label: 'বিনিয়োগ', value: 'Investment', icon: <ArrowUpCircle size={16} /> },
    { label: 'অন্যান্য', value: 'Other', icon: <ArrowDownCircle size={16} /> },
  ],
  EXPENSE: [
    { label: 'খাবার', value: 'Food', icon: <Utensils size={16} /> },
    { label: 'বাসা ভাড়া', value: 'Rent', icon: <Home size={16} /> },
    { label: 'যাতায়াত', value: 'Transport', icon: <Car size={16} /> },
    { label: 'বাজার', value: 'Shopping', icon: <ShoppingBag size={16} /> },
    { label: 'চিকিৎসা', value: 'Health', icon: <HeartPulse size={16} /> },
    { label: 'বিনোদন', value: 'Entertainment', icon: <Gamepad2 size={16} /> },
    { label: 'বিল', value: 'Bills', icon: <Smartphone size={16} /> },
    { label: 'অন্যান্য', value: 'Other', icon: <AlertCircle size={16} /> },
  ]
};

export const LOAN_STATUS_LABELS = {
  PENDING: 'বাকি',
  PAID: 'পরিশোধিত',
  RECEIVED: 'গৃহীত'
};
