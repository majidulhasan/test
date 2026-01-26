
import React from 'react';
import { Mail, Facebook, Send, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

const DeveloperModal: React.FC<Props> = ({ isOpen, onClose, isDarkMode }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-fadeIn">
      <div className={`w-full max-w-sm rounded-[2.5rem] shadow-2xl relative animate-modalIn overflow-hidden ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
        
        <div className="p-8 pt-10 text-center">
          {/* Circular Logo/Profile */}
          <div className="relative inline-block mb-6">
            <div className="w-40 h-40 rounded-full border-4 border-blue-500 p-1 flex items-center justify-center bg-pink-100 shadow-lg">
                {/* SVG Logo Mockup as the user's specific image isn't available as a URL */}
                <div className="text-center font-bold text-gray-800 leading-tight">
                    <div className="text-emerald-600 text-lg">মোঃ মাজিদুল</div>
                    <div className="text-emerald-600 text-lg">হাসান</div>
                    <div className="text-red-500 text-xl font-black">{`{শাহীিন}`}</div>
                </div>
            </div>
          </div>

          <h2 className="text-2xl font-black mb-6 tracking-tight">মোঃ মাজিদুল হাসান {`{শাহীিন}`}</h2>

          <div className="mb-8 px-2">
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-bold">
              একজন ওয়েব ও অ্যাপ ডেভেলপার হিসেবে আমি সবসময় চেষ্টা করি প্রযুক্তিকে মানুষের জন্য আরও সহজ, কার্যকর এবং উপভোগ্য করে তুলতে। আমার প্রতিটি প্রজেক্টে ব্যবহারকারীর প্রয়োজন, আকর্ষণীয় ডিজাইন ও সর্বোচ্চ পারফরম্যান্সকে সর্বাধিক গুরুত্ব দিই। নতুন কিছু শেখা, তৈরি করা এবং সেটিকে মানুষের উপকারে কাজে লাগানোই আমার কাজের সবচেয়ে বড় অনুপ্রেরণা।
            </p>
          </div>

          {/* Social Links */}
          <div className="flex justify-center gap-6 mb-10">
            <a 
                href="mailto:contact@yourdomain.com" 
                className={`p-3 rounded-2xl transition-all active:scale-90 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800'}`}
            >
              <Mail size={28} />
            </a>
            <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noreferrer" 
                className={`p-3 rounded-2xl transition-all active:scale-90 ${isDarkMode ? 'bg-gray-800 text-blue-500' : 'bg-gray-100 text-blue-600'}`}
            >
              <Facebook size={28} />
            </a>
            <a 
                href="https://t.me/yourtelegram" 
                target="_blank" 
                rel="noreferrer" 
                className={`p-3 rounded-2xl transition-all active:scale-90 ${isDarkMode ? 'bg-gray-800 text-sky-400' : 'bg-gray-100 text-sky-500'}`}
            >
              <Send size={28} />
            </a>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xl shadow-xl shadow-blue-500/30 active:scale-95 transition-all"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default DeveloperModal;
