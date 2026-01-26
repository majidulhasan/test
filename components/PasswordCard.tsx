
import React, { useState } from 'react';
import { Eye, EyeOff, Edit, Trash2, Shield, Copy, CheckCircle2, Key } from 'lucide-react';
import { PasswordEntry } from '../types';

interface Props {
  password: PasswordEntry;
  isDarkMode: boolean;
  categoryColor?: string;
  categoryName?: string;
  onEdit: () => void;
  onDelete: () => void;
  onCopy?: () => void;
}

const PasswordCard: React.FC<Props> = ({ 
  password, 
  isDarkMode, 
  categoryColor = '#3b82f6', 
  categoryName = 'General',
  onEdit, 
  onDelete, 
  onCopy 
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedType, setCopiedType] = useState<'username' | 'password' | null>(null);

  const copyToClipboard = (text: string, type: 'username' | 'password') => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    if (onCopy) onCopy();
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <>
      <div className={`p-5 rounded-[2rem] shadow-xl border transition-all duration-300 group hover:-translate-y-1 ${isDarkMode ? 'bg-gray-800 border-gray-700 shadow-black/30' : 'bg-white border-gray-100 shadow-gray-200/50'}`}>
        <div className="flex items-center justify-between gap-3">
          {/* Left Section: Icon and Text */}
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div 
              className="w-12 h-12 rounded-2xl flex flex-shrink-0 items-center justify-center text-white shadow-lg transition-transform duration-300"
              style={{ 
                backgroundColor: categoryColor, 
                boxShadow: `0 8px 12px -3px ${categoryColor}33` 
              }}
            >
              <Shield size={24} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-black leading-tight tracking-tight group-hover:text-blue-600 transition-colors truncate">
                {password.title}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-gray-500 dark:text-gray-400 text-xs font-bold opacity-80 truncate max-w-[120px]">
                  {password.username}
                </p>
                <span 
                  className="text-[10px] px-2 py-0.5 rounded-full font-bold text-white whitespace-nowrap overflow-hidden text-ellipsis"
                  style={{ backgroundColor: categoryColor + 'CC' }}
                >
                  {categoryName}
                </span>
              </div>
            </div>
          </div>

          {/* Right Section: Actions */}
          <div className="flex gap-1.5 flex-shrink-0">
            <button 
              onClick={() => setShowDetails(true)}
              className={`p-2.5 rounded-xl transition-all active:scale-90 text-gray-400 bg-gray-100 dark:bg-gray-900/50 hover:bg-blue-600 hover:text-white`}
            >
              <Eye size={20} />
            </button>
            <button onClick={onEdit} className="p-2.5 text-blue-500 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-600 hover:text-white transition-all active:scale-90">
              <Edit size={20} />
            </button>
            <button onClick={onDelete} className="p-2.5 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-600 hover:text-white transition-all active:scale-90">
              <Trash2 size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Password Details Overlay (Like the image) */}
      {showDetails && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-fadeIn">
          <div className={`w-full max-w-sm p-8 rounded-[2.5rem] text-center shadow-2xl relative animate-modalIn ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            
            {/* Key Icon */}
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-500/30">
              <Key size={40} className="text-white" />
            </div>

            <div className="space-y-6 text-left mb-8">
              {/* Username Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 ml-1">ইউজারনেম / ইমেইল</label>
                <div className={`flex items-center justify-between p-4 rounded-2xl border ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
                  <span className="font-bold truncate text-sm flex-1 mr-2">{password.username}</span>
                  <button 
                    onClick={() => copyToClipboard(password.username, 'username')} 
                    className={`p-1 flex-shrink-0 transition-all ${copiedType === 'username' ? 'text-emerald-500' : 'text-gray-400 hover:text-blue-500'}`}
                  >
                    {copiedType === 'username' ? <CheckCircle2 size={20} /> : <Copy size={20} />}
                  </button>
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 ml-1">পাসওয়ার্ড</label>
                <div className={`flex items-center justify-between p-4 rounded-2xl border ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
                  <span className={`font-mono font-bold tracking-widest text-lg flex-1 truncate mr-2 ${!showPassword ? 'blur-[4px]' : ''}`}>
                    {showPassword ? password.passwordValue : '••••••••••••'}
                  </span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1 text-gray-400 hover:text-blue-500 transition-all"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                    <button 
                      onClick={() => copyToClipboard(password.passwordValue, 'password')} 
                      className={`p-1 flex-shrink-0 transition-all ${copiedType === 'password' ? 'text-emerald-500' : 'text-gray-400 hover:text-blue-500'}`}
                    >
                      {copiedType === 'password' ? <CheckCircle2 size={20} /> : <Copy size={20} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* OK Button */}
            <button
              onClick={() => { setShowDetails(false); setShowPassword(false); }}
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-500/20 active:scale-95 transition-all"
            >
              ঠিক আছে
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes modalIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-modalIn {
          animation: modalIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
    </>
  );
};

export default PasswordCard;
