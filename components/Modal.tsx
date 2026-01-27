
import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, className = "" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className={`bg-white dark:bg-gray-800 w-full max-w-lg rounded-t-[3rem] p-8 space-y-6 overflow-y-auto max-h-[90vh] shadow-2xl animate-in slide-in-from-bottom duration-400 ${className}`}>
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-black">{title}</h2>
          <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};
