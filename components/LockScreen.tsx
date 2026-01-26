
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Unlock, ArrowRight, Eye, EyeOff, HelpCircle, ChevronLeft, KeyRound, ShieldAlert } from 'lucide-react';
import { SecurityQuestion } from '../types';

interface Props {
  isDarkMode: boolean;
  onUnlock: (password: string) => boolean;
  isFirstTime: boolean;
  onSetMasterPassword: (password: string, recoveryQuestions?: SecurityQuestion[]) => void;
  savedSecurityQuestions?: SecurityQuestion[];
  pinLength: number;
}

type ViewState = 'unlock' | 'setup' | 'recovery_questions' | 'reset_password';

const LockScreen: React.FC<Props> = ({ isDarkMode, onUnlock, isFirstTime, onSetMasterPassword, savedSecurityQuestions = [], pinLength = 4 }) => {
  const [view, setView] = useState<ViewState>(isFirstTime ? 'setup' : 'unlock');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [setupPinLength, setSetupPinLength] = useState<number>(4);

  // Recovery State
  const [recoveryAnswers, setRecoveryAnswers] = useState<string[]>([]);
  const [newPassword, setNewPassword] = useState('');
  const [recoveryError, setRecoveryError] = useState(false);

  // Setup State
  const [setupQuestions, setSetupQuestions] = useState<SecurityQuestion[]>([
    { question: 'আপনার প্রিয় রঙের নাম কি?', answer: '' },
    { question: 'আপনার প্রথম স্কুলের নাম কি?', answer: '' }
  ]);

  // --- AUTO UNLOCK LOGIC ---
  useEffect(() => {
    if (view === 'unlock' && password.length === pinLength) {
      const success = onUnlock(password);
      if (success) {
        setIsUnlocking(true);
        setError(false);
      } else {
        setError(true);
        // ভুল হলে ইনপুট লাল হবে এবং অটো ক্লিয়ার হবে
        setTimeout(() => {
          setPassword('');
          setError(false);
        }, 800);
      }
    }
  }, [password, view, onUnlock, pinLength]);

  const handleUnlockSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (password.length < pinLength) return;
    
    const success = onUnlock(password);
    if (!success) {
      setError(true);
      setTimeout(() => {
        setPassword('');
        setError(false);
      }, 800);
    } else {
      setIsUnlocking(true);
    }
  };

  const handleSetupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length !== setupPinLength) {
      alert(`পাসওয়ার্ড ঠিক ${setupPinLength} অক্ষরের হতে হবে`);
      return;
    }
    if (setupQuestions.some(q => q.answer.trim() === '')) {
      alert('রিকভারি প্রশ্নের উত্তর দেওয়া বাধ্যতামূলক।');
      return;
    }
    onSetMasterPassword(password, setupQuestions);
  };

  const handleRecoverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const allCorrect = savedSecurityQuestions.every((q, idx) => 
      q.answer.toLowerCase().trim() === (recoveryAnswers[idx] || '').toLowerCase().trim()
    );

    if (allCorrect) {
      setView('reset_password');
      setRecoveryError(false);
    } else {
      setRecoveryError(true);
      setTimeout(() => setRecoveryError(false), 500);
    }
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length !== pinLength) {
      alert(`নতুন পাসওয়ার্ড ঠিক ${pinLength} অক্ষরের হতে হবে`);
      return;
    }
    onSetMasterPassword(newPassword, savedSecurityQuestions);
  };

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 overflow-y-auto transition-all duration-700 ${isUnlocking ? 'scale-110 opacity-0 pointer-events-none' : 'scale-100 opacity-100'} ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="w-full max-w-sm text-center py-10">
        
        {/* Header Icon */}
        <div className={`w-24 h-24 mx-auto mb-8 rounded-[2rem] flex items-center justify-center shadow-2xl transition-all duration-500 transform ${
          isUnlocking ? 'bg-emerald-500 scale-125 rotate-0 shadow-emerald-500/50' :
          error ? 'bg-red-600 shadow-red-500/30 animate-shake' :
          view === 'recovery_questions' ? 'bg-amber-500 shadow-amber-500/30 rotate-12' : 
          view === 'reset_password' ? 'bg-emerald-500 shadow-emerald-500/30 scale-110' :
          'bg-blue-600 shadow-blue-500/30'
        }`}>
          {isUnlocking ? <Unlock size={48} className="text-white animate-bounce" /> :
           view === 'recovery_questions' ? <HelpCircle size={48} className="text-white" /> : 
           view === 'reset_password' ? <KeyRound size={48} className="text-white" /> :
           <Lock size={48} className="text-white" />}
        </div>

        <h1 className="text-3xl font-black mb-2 tracking-tight">PassNest</h1>

        {/* --- UNLOCK VIEW --- */}
        {view === 'unlock' && (
          <div className="animate-modalIn">
            <p className="text-gray-500 dark:text-gray-400 mb-10 font-bold">নিরাপত্তার জন্য {pinLength} অক্ষরের পিন দিন</p>
            <form onSubmit={handleUnlockSubmit} className="space-y-4">
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoFocus
                  maxLength={pinLength}
                  className={`w-full p-5 pl-14 pr-14 rounded-3xl border-2 outline-none transition-all font-black text-2xl text-center tracking-[0.5em] ${
                    error 
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                      : isDarkMode ? 'bg-gray-800 border-gray-700 focus:border-blue-500' : 'bg-white border-gray-100 focus:border-blue-500 shadow-xl'
                  }`}
                  placeholder={"•".repeat(pinLength)}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isUnlocking}
                />
                <div className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors duration-300 ${isUnlocking ? 'text-emerald-500' : 'text-gray-400'}`}>
                  <ShieldCheck size={24} />
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500"
                >
                  {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
                </button>
              </div>
            </form>
            
            {error && (
              <p className="mt-4 text-red-500 font-black text-sm animate-pulse">ভুল পাসওয়ার্ড! আবার চেষ্টা করুন।</p>
            )}

            {savedSecurityQuestions.length > 0 && !error && (
              <button 
                onClick={() => setView('recovery_questions')}
                className="mt-12 text-sm font-black text-blue-600 hover:text-blue-500 transition-colors bg-blue-50 dark:bg-blue-900/20 px-6 py-3 rounded-2xl"
              >
                পাসওয়ার্ড ভুলে গেছেন?
              </button>
            )}
          </div>
        )}

        {/* --- SETUP VIEW --- */}
        {view === 'setup' && (
          <div className="animate-modalIn">
            <p className="text-gray-500 dark:text-gray-400 mb-8 font-bold leading-relaxed px-4">আপনার তথ্য সুরক্ষিত রাখতে ৪ বা ৬ অক্ষরের পিন সেট করুন</p>
            
            <div className="flex justify-center gap-3 mb-8">
              {[4, 6].map(len => (
                <button 
                  key={len}
                  onClick={() => { setSetupPinLength(len); setPassword(''); }}
                  className={`px-8 py-3 rounded-2xl font-black transition-all ${setupPinLength === len ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-200 text-gray-500 dark:bg-gray-800'}`}
                >
                  {len} সংখ্যা
                </button>
              ))}
            </div>

            <form onSubmit={handleSetupSubmit} className="space-y-6 text-left">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-blue-600 ml-3 tracking-widest">মাস্টার পাসওয়ার্ড ({setupPinLength} অক্ষর)</label>
                <input
                  type="password"
                  required
                  maxLength={setupPinLength}
                  className={`w-full p-5 rounded-2xl border-2 outline-none transition-all font-black text-xl text-center tracking-[0.5em] ${isDarkMode ? 'bg-gray-800 border-gray-700 focus:border-blue-500' : 'bg-white border-gray-100 focus:border-blue-500 shadow-md'}`}
                  placeholder={"•".repeat(setupPinLength)}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-[2rem] space-y-5 border border-blue-100 dark:border-blue-800/30">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldAlert size={18} className="text-blue-600" />
                  <h3 className="text-xs font-black text-blue-700 dark:text-blue-400 uppercase tracking-widest">পাসওয়ার্ড রিকভারি প্রশ্ন</h3>
                </div>
                {setupQuestions.map((q, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <p className="text-[11px] font-bold opacity-60 ml-1">{q.question}</p>
                    <input
                      type="text"
                      required
                      className={`w-full p-4 rounded-xl border-2 outline-none transition-all font-bold ${isDarkMode ? 'bg-gray-900 border-gray-700 focus:border-blue-500' : 'bg-white border-gray-100 focus:border-blue-500'}`}
                      placeholder="আপনার উত্তর"
                      value={q.answer}
                      onChange={(e) => {
                        const newQ = [...setupQuestions];
                        newQ[idx].answer = e.target.value;
                        setSetupQuestions(newQ);
                      }}
                    />
                  </div>
                ))}
              </div>

              <button
                type="submit"
                disabled={password.length !== setupPinLength}
                className={`w-full py-5 text-white rounded-3xl font-black text-xl shadow-xl transition-all ${password.length === setupPinLength ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20 active:scale-95' : 'bg-gray-300 cursor-not-allowed opacity-50'}`}
              >
                সেটআপ সম্পূর্ণ করুন
              </button>
            </form>
          </div>
        )}

        {/* --- RECOVERY QUESTIONS VIEW --- */}
        {view === 'recovery_questions' && (
          <div className="animate-modalIn">
            <p className="text-gray-500 dark:text-gray-400 mb-8 font-bold leading-relaxed">পাসওয়ার্ড পুনরুদ্ধার করতে নিচের প্রশ্নগুলোর সঠিক উত্তর দিন</p>
            <form onSubmit={handleRecoverySubmit} className="space-y-6 text-left">
              <div className={`space-y-5 p-6 rounded-[2.5rem] ${recoveryError ? 'bg-red-50 dark:bg-red-900/10 animate-shake border-2 border-red-500/20' : 'bg-amber-50 dark:bg-amber-900/10 border-2 border-amber-500/20'}`}>
                {savedSecurityQuestions.map((q, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest ml-1">{q.question}</p>
                    <input
                      type="text"
                      required
                      autoFocus={idx === 0}
                      className={`w-full p-4 rounded-2xl border-2 outline-none transition-all font-black ${
                        recoveryError 
                          ? 'border-red-400 bg-white dark:bg-gray-800' 
                          : isDarkMode ? 'bg-gray-900 border-gray-700 focus:border-amber-500' : 'bg-white border-gray-100 focus:border-amber-500 shadow-sm'
                      }`}
                      placeholder="উত্তর লিখুন..."
                      value={recoveryAnswers[idx] || ''}
                      onChange={(e) => {
                        const newAns = [...recoveryAnswers];
                        newAns[idx] = e.target.value;
                        setRecoveryAnswers(newAns);
                      }}
                    />
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  className="w-full py-5 bg-amber-500 text-white rounded-3xl font-black text-xl hover:bg-amber-600 shadow-xl shadow-amber-500/20 active:scale-95 transition-all"
                >
                  উত্তর চেক করুন
                </button>
                <button
                  type="button"
                  onClick={() => setView('unlock')}
                  className="w-full py-4 text-gray-500 font-bold text-sm flex items-center justify-center gap-2 hover:opacity-80 transition-all"
                >
                  <ChevronLeft size={18} /> ফিরে যান
                </button>
              </div>
            </form>
          </div>
        )}

        {/* --- RESET PASSWORD VIEW --- */}
        {view === 'reset_password' && (
          <div className="animate-modalIn">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-3xl mb-8 border-2 border-emerald-500/20">
              <p className="text-emerald-600 dark:text-emerald-400 font-black text-sm">পাসওয়ার্ড রিসেট করতে নতুন পিন দিন।</p>
            </div>
            
            <div className="flex justify-center gap-3 mb-6">
              {[4, 6].map(len => (
                <button 
                  key={len}
                  onClick={() => { setSetupPinLength(len); setNewPassword(''); }}
                  className={`px-8 py-2 rounded-xl font-black text-xs transition-all ${setupPinLength === len ? 'bg-emerald-600 text-white shadow-lg' : 'bg-gray-200 text-gray-500 dark:bg-gray-800'}`}
                >
                  {len} সংখ্যা
                </button>
              ))}
            </div>

            <form onSubmit={handleResetSubmit} className="space-y-6">
              <div className="relative">
                <input
                  type="password"
                  autoFocus
                  required
                  maxLength={setupPinLength}
                  className={`w-full p-5 pl-14 pr-14 rounded-3xl border-2 outline-none transition-all font-black text-2xl text-center tracking-[0.5em] ${
                    isDarkMode ? 'bg-gray-800 border-gray-700 focus:border-blue-500' : 'bg-white border-gray-100 focus:border-blue-500 shadow-xl'
                  }`}
                  placeholder={"•".repeat(setupPinLength)}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                  <ShieldCheck size={24} />
                </div>
              </div>
              <button
                type="submit"
                disabled={newPassword.length !== setupPinLength}
                className={`w-full py-5 text-white rounded-3xl font-black text-xl shadow-xl transition-all ${newPassword.length === setupPinLength ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20 active:scale-95' : 'bg-gray-300 cursor-not-allowed opacity-50'}`}
              >
                রিসেট সম্পন্ন করুন
              </button>
            </form>
          </div>
        )}
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out 0s 2;
        }
      `}</style>
    </div>
  );
};

export default LockScreen;
