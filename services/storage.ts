
import { StorageData } from '../types.ts';

const STORAGE_KEY = 'amar_khata_v2';

const INITIAL_DATA: StorageData = {
  settings: {
    language: 'bn',
    theme: 'light',
    themeColor: 'indigo',
    customHex: '#6366f1',
    reminderEnabled: true,
    reminderTime: '09:00',
  },
  khata: {
    id: 'personal',
    name: 'ব্যক্তিগত খাতা',
    transactions: [],
    loans: [],
    notes: [],
    categories: [
      { id: '1', label: 'বেতন', type: 'INCOME' },
      { id: '2', label: 'বোনাস', type: 'INCOME' },
      { id: '3', label: 'খাবার', type: 'EXPENSE' },
      { id: '4', label: 'ভাড়া', type: 'EXPENSE' },
      { id: '5', label: 'বাজার', type: 'EXPENSE' },
      { id: '6', label: 'যাতায়াত', type: 'EXPENSE' },
    ],
  },
};

export const storage = {
  getData: (): StorageData => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : INITIAL_DATA;
  },

  saveData: (data: StorageData) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    const today = new Date().toISOString().split('T')[0];
    if (data.settings.lastAutoBackup !== today) {
      localStorage.setItem(`${STORAGE_KEY}_auto_backup`, JSON.stringify(data));
      data.settings.lastAutoBackup = today;
    }
  },

  exportToJSON: () => {
    const data = storage.getData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Amar_Khata_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  importFromJSON: (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const parsed = JSON.parse(content);
          if (parsed && parsed.khata && parsed.settings) {
            storage.saveData(parsed);
            resolve();
          } else {
            reject(new Error('Invalid backup file'));
          }
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('File reading failed'));
      reader.readAsText(file);
    });
  }
};
