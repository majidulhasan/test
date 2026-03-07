/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  createdAt: number;
}

export type FieldType = 'text' | 'checkbox' | 'radio' | 'count';

export interface MeasurementField {
  label: string;
  value: any;
  type?: FieldType;
  options?: string[];
  isOptional?: boolean;
}

export interface MeasurementCategory {
  name: string;
  fields: MeasurementField[];
  notes?: string;
}

export interface Measurement {
  customerId: string;
  categories: MeasurementCategory[];
  notes: string;
  updatedAt: number;
}

export interface Payment {
  id: string;
  amount: number;
  date: string;
  note?: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  dressType: string;
  quantity: number;
  price: number;
  advance: number;
  due: number;
  deliveryDate: string;
  status: 'Pending' | 'Processing' | 'Ready' | 'Delivered';
  createdAt: number;
  payments?: Payment[];
}

export interface Transaction {
  id: string;
  type: 'Income' | 'Expense';
  date: string;
  amount: number;
  category: string;
  note: string;
}

export interface AppSettings {
  theme: 'light' | 'dark';
  primaryColor: string;
  fontSize: 'small' | 'medium' | 'large';
  shopName?: string;
  ownerName?: string;
  ownerPhoto?: string;
}
