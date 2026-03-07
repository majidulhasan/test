import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning';
}

export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'মুছে ফেলুন', 
  cancelText = 'বাতিল',
  type = 'danger'
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white w-full max-w-sm rounded-[32px] p-8 shadow-2xl overflow-hidden"
          >
            <div className="flex flex-col items-center text-center">
              <div className={`w-16 h-16 rounded-2xl mb-6 flex items-center justify-center ${
                type === 'danger' ? 'bg-rose-50 text-rose-500' : 'bg-amber-50 text-amber-500'
              }`}>
                <AlertTriangle size={32} />
              </div>
              
              <h2 className="text-xl font-bold text-zinc-900 mb-2">{title}</h2>
              <p className="text-sm text-zinc-500 leading-relaxed mb-8">
                {message}
              </p>
              
              <div className="flex w-full space-x-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-4 rounded-2xl font-bold text-zinc-600 bg-zinc-100 active:scale-95 transition-transform"
                >
                  {cancelText}
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className={`flex-1 py-4 rounded-2xl font-bold text-white active:scale-95 transition-transform shadow-lg ${
                    type === 'danger' ? 'bg-rose-500 shadow-rose-100' : 'bg-amber-500 shadow-amber-100'
                  }`}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
