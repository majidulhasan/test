
import React from 'react';
import { Trash2 } from 'lucide-react';

export const DeleteConfirmModal = ({ t, onClose, onConfirm }: any) => {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-6 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] text-center space-y-6 w-full max-w-xs shadow-2xl animate-in zoom-in-95">
        <Trash2 size={40} className="mx-auto text-rose-500" />
        <h2 className="text-2xl font-black">{t('confirmDelete')}</h2>
        <div className="flex flex-col gap-3">
          <button onClick={onConfirm} className="w-full py-4 bg-rose-500 text-white font-black rounded-2xl shadow-lg shadow-rose-200">
            {t('deleteBtn')}
          </button>
          <button onClick={onClose} className="w-full py-4 bg-gray-100 dark:bg-gray-700 rounded-2xl">
            {t('cancelBtn')}
          </button>
        </div>
      </div>
    </div>
  );
};
