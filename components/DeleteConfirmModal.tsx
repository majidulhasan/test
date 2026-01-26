
import React from 'react';
import { Trash2, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  onConfirm: () => void;
  isDarkMode: boolean;
}

const DeleteConfirmModal: React.FC<Props> = ({ isOpen, title, onClose, onConfirm, isDarkMode }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
      <div className={`w-full max-w-sm p-8 rounded-[2.5rem] text-center shadow-2xl animate-modalIn border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-100 text-gray-900'}`}>
        <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-red-500/10">
          <Trash2 size={40} />
        </div>
        <h3 className="text-2xl font-black mb-3">আপনি কি নিশ্চিত?</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed font-bold">
          আপনি কি "{title}" পাসওয়ার্ডটি চিরতরে মুছে ফেলতে চান?
        </p>
        <div className="space-y-3">
          <button 
            onClick={onConfirm}
            className="w-full py-5 bg-red-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-red-500/30 active:scale-95 transition-all"
          >
            হ্যাঁ, মুছে দিন
          </button>
          <button 
            onClick={onClose}
            className={`w-full py-4 rounded-2xl font-bold transition-all ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-500'}`}
          >
            না, বাতিল করুন
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
