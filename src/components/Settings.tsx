import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Moon, 
  Sun, 
  Palette, 
  Type, 
  Download, 
  Upload, 
  Trash2, 
  Info,
  ChevronRight,
  ShieldCheck,
  User,
  BookOpen,
  X,
  CheckCircle2,
  Mail,
  Facebook,
  Send
} from 'lucide-react';
import { AppSettings } from '../types';

interface SettingsProps {
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  onClearData: () => void;
}

export default function Settings({ settings, setSettings, onClearData }: SettingsProps) {
  const [showDevInfo, setShowDevInfo] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const toggleTheme = () => {
    setSettings({ ...settings, theme: settings.theme === 'light' ? 'dark' : 'light' });
  };

  const exportData = () => {
    const data = {
      customers: JSON.parse(localStorage.getItem('tailor_customers') || '[]'),
      measurements: JSON.parse(localStorage.getItem('tailor_measurements') || '{}'),
      orders: JSON.parse(localStorage.getItem('tailor_orders') || '[]'),
      transactions: JSON.parse(localStorage.getItem('tailor_transactions') || '[]'),
      settings: settings
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tailor_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert('ডাটা সফলভাবে এক্সপোর্ট করা হয়েছে!');
  };

  const importData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event: any) => {
        try {
          const data = JSON.parse(event.target.result);
          if (data.customers) localStorage.setItem('tailor_customers', JSON.stringify(data.customers));
          if (data.measurements) localStorage.setItem('tailor_measurements', JSON.stringify(data.measurements));
          if (data.orders) localStorage.setItem('tailor_orders', JSON.stringify(data.orders));
          if (data.transactions) localStorage.setItem('tailor_transactions', JSON.stringify(data.transactions));
          if (data.settings) setSettings(data.settings);
          
          alert('ডাটা সফলভাবে ইমপোর্ট করা হয়েছে! অনুগ্রহ করে অ্যাপটি রিস্টার্ট করুন।');
          window.location.reload();
        } catch (err) {
          alert('ভুল ব্যাকআপ ফাইল');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const colorPresets = ['#6C3EF4', '#FF6321', '#00C853', '#2979FF', '#D500F9', '#FFAB00'];

  return (
    <div className="px-6 py-8">
      <h1 className="text-2xl font-bold mb-8">সেটিংস</h1>

      {/* Appearance */}
      <section className="mb-8">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4 ml-2">অ্যাপের চেহারা</h3>
        <div className="bg-white rounded-[32px] shadow-sm border border-zinc-100 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-zinc-50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-400">
                {settings.theme === 'light' ? <Sun size={20} /> : <Moon size={20} />}
              </div>
              <span className="font-bold">ডার্ক মোড</span>
            </div>
            <button 
              onClick={toggleTheme}
              className={`w-12 h-6 rounded-full transition-colors relative ${settings.theme === 'dark' ? 'bg-[#6C3EF4]' : 'bg-zinc-200'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${settings.theme === 'dark' ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

          <div className="p-5 border-b border-zinc-50">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-400">
                <Palette size={20} />
              </div>
              <span className="font-bold">প্রধান রঙ</span>
            </div>
            <div className="flex justify-between">
              {colorPresets.map(color => (
                <button 
                  key={color}
                  onClick={() => setSettings({ ...settings, primaryColor: color })}
                  className={`w-8 h-8 rounded-full border-2 transition-transform ${settings.primaryColor === color ? 'scale-125 border-zinc-900' : 'border-transparent'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between p-5">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-400">
                <Type size={20} />
              </div>
              <span className="font-bold">ফন্টের আকার</span>
            </div>
            <select 
              value={settings.fontSize}
              onChange={(e) => setSettings({ ...settings, fontSize: e.target.value as any })}
              className="bg-zinc-50 border-none rounded-xl py-2 px-4 text-xs font-bold focus:ring-0"
            >
              <option value="small">ছোট</option>
              <option value="medium">মাঝারি</option>
              <option value="large">বড়</option>
            </select>
          </div>
        </div>
      </section>

      {/* Data Management */}
      <section className="mb-8">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4 ml-2">ডাটা ও ব্যাকআপ</h3>
        <div className="bg-white rounded-[32px] shadow-sm border border-zinc-100 overflow-hidden">
          <button onClick={exportData} className="w-full flex items-center justify-between p-5 border-b border-zinc-50 active:bg-zinc-50 transition-colors">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-[#6C3EF4]">
                <Download size={20} />
              </div>
              <span className="font-bold">ডাটা এক্সপোর্ট (JSON)</span>
            </div>
            <ChevronRight size={18} className="text-zinc-300" />
          </button>

          <button onClick={importData} className="w-full flex items-center justify-between p-5 border-b border-zinc-50 active:bg-zinc-50 transition-colors">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
                <Upload size={20} />
              </div>
              <span className="font-bold">ডাটা ইমপোর্ট</span>
            </div>
            <ChevronRight size={18} className="text-zinc-300" />
          </button>

          <button onClick={() => {
            if (window.confirm('আপনি কি নিশ্চিত যে সব অ্যাপ ডাটা মুছে ফেলতে চান? এটি আর ফেরত নেওয়া যাবে না।')) {
              onClearData();
              alert('সব ডাটা মুছে ফেলা হয়েছে।');
              window.location.reload();
            }
          }} className="w-full flex items-center justify-between p-5 active:bg-zinc-50 transition-colors">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500">
                <Trash2 size={20} />
              </div>
              <span className="font-bold text-rose-500">সব ডাটা মুছে ফেলুন</span>
            </div>
            <ChevronRight size={18} className="text-zinc-300" />
          </button>
        </div>
      </section>

      {/* Support & Help */}
      <section className="mb-8">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4 ml-2">সহায়তা ও তথ্য</h3>
        <div className="bg-white rounded-[32px] shadow-sm border border-zinc-100 overflow-hidden">
          <button 
            onClick={() => setShowGuide(true)}
            className="w-full flex items-center justify-between p-5 border-b border-zinc-50 active:bg-zinc-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                <BookOpen size={20} />
              </div>
              <span className="font-bold">অ্যাপ ব্যবহারের নিয়ম</span>
            </div>
            <ChevronRight size={18} className="text-zinc-300" />
          </button>

          <button 
            onClick={() => setShowDevInfo(true)}
            className="w-full flex items-center justify-between p-5 active:bg-zinc-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-[#6C3EF4]">
                <User size={20} />
              </div>
              <span className="font-bold">ডেভেলপার পরিচিতি</span>
            </div>
            <ChevronRight size={18} className="text-zinc-300" />
          </button>
        </div>
      </section>

      {/* App Info */}
      <section className="mb-8">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4 ml-2">সম্পর্কে</h3>
        <div className="bg-white rounded-[32px] shadow-sm border border-zinc-100 overflow-hidden p-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-20 h-20 rounded-[24px] bg-[#6C3EF4] flex items-center justify-center text-white shadow-xl shadow-indigo-100">
              <ShieldCheck size={40} />
            </div>
            <div>
              <h4 className="font-bold text-lg">টেইলর শপ ম্যানেজার</h4>
              <p className="text-xs text-zinc-400">ভার্সন ২.৪.০ (স্টেবল)</p>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed">
              আধুনিক টেইলরিং ব্যবসার জন্য ডিজাইন করা প্রফেশনাল ম্যানেজমেন্ট সিস্টেম। 
              নিরাপদ, অফলাইন এবং ব্যবহারে সহজ।
            </p>
            <div className="pt-4 flex space-x-4">
              <div className="flex flex-col items-center">
                <span className="text-lg font-bold">১০০%</span>
                <span className="text-[10px] text-zinc-400 uppercase font-bold">অফলাইন</span>
              </div>
              <div className="w-px h-8 bg-zinc-100" />
              <div className="flex flex-col items-center">
                <span className="text-lg font-bold">AES</span>
                <span className="text-[10px] text-zinc-400 uppercase font-bold">নিরাপদ</span>
              </div>
              <div className="w-px h-8 bg-zinc-100" />
              <div className="flex flex-col items-center">
                <span className="text-lg font-bold">প্রো</span>
                <span className="text-[10px] text-zinc-400 uppercase font-bold">ফিচার</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Developer Info Modal */}
      <AnimatePresence>
        {showDevInfo && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white w-full max-w-sm rounded-[32px] p-8 shadow-2xl relative flex flex-col items-center text-center"
            >
              {/* Profile Circle */}
              <div className="w-40 h-40 rounded-full border-4 border-blue-500 bg-pink-50 flex flex-col items-center justify-center mb-6 shadow-lg shrink-0">
                <span className="text-emerald-600 font-bold text-lg leading-tight">মোঃ মাজিদুল</span>
                <span className="text-emerald-600 font-bold text-lg leading-tight">হাসান</span>
                <span className="text-red-500 font-bold text-xl leading-tight mt-1">{'{'}শাহীন{'}'}</span>
              </div>

              {/* Name */}
              <h3 className="text-xl font-bold text-zinc-900 mb-4">
                মোঃ মাজিদুল হাসান {'{'}শাহীন{'}'}
              </h3>

              {/* Description */}
              <p className="text-xs text-zinc-500 leading-relaxed mb-8 text-justify">
                একজন ওয়েব ও অ্যাপ ডেভেলপার হিসেবে আমি সবসময় চেষ্টা করি প্রযুক্তিকে মানুষের জন্য আরও সহজ, কার্যকর এবং উপভোগ্য করে তুলতে। আমার প্রতিটি প্রজেক্টে ব্যবহারকারীর প্রয়োজন, আকর্ষণীয় ডিজাইন ও সর্বোচ্চ পারফরম্যান্সকে সর্বাধিক গুরুত্ব দিই। নতুন কিছু শেখা, তৈরি করা এবং সেটিকে মানুষের উপকারে কাজে লাগানোই আমার কাজের সবচেয়ে বড় অনুপ্রেরণা।
              </p>

              {/* Social Icons */}
              <div className="flex space-x-4 mb-8">
                <a href="mailto:majidulhasan456@gmail.com" className="w-12 h-12 rounded-2xl bg-zinc-50 flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors">
                  <Mail size={24} />
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-2xl bg-zinc-50 flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors">
                  <Facebook size={24} />
                </a>
                <a href="https://t.me/majidulhasan" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-2xl bg-zinc-50 flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors">
                  <Send size={24} />
                </a>
              </div>

              {/* Close Button */}
              <button 
                onClick={() => setShowDevInfo(false)}
                className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 active:scale-95 transition-transform"
              >
                বন্ধ করুন
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Usage Guide Modal */}
      <AnimatePresence>
        {showGuide && (
          <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="bg-white w-full max-w-md rounded-[40px] p-8 shadow-2xl max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-xl font-bold">অ্যাপ ব্যবহারের নিয়ম</h2>
                  <p className="text-xs text-zinc-400 mt-1">সহজ ৭টি ধাপে অ্যাপটি ব্যবহার করুন</p>
                </div>
                <button onClick={() => setShowGuide(false)} className="text-zinc-400 p-2">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                {[
                  { title: 'ড্যাশবোর্ড', desc: 'প্রতিদিনের আয়-ব্যয় এবং অর্ডারের সংক্ষিপ্ত রূপ একনজরে দেখুন।' },
                  { title: 'কাস্টমার ম্যানেজমেন্ট', desc: 'নতুন কাস্টমার যোগ করুন এবং তাদের ফোন নম্বর ও ঠিকানা সেভ করে রাখুন।' },
                  { title: 'মাপ গ্রহণ', desc: 'কাস্টমারের জন্য নির্দিষ্ট পোশাকের (পাঞ্জাবি, পাজামা ইত্যাদি) মাপ নিন এবং সেভ করুন।' },
                  { title: 'অর্ডার তৈরি', desc: 'অর্ডার তৈরি করুন, অগ্রিম পেমেন্ট নিন এবং ডেলিভারি ডেট সেট করুন।' },
                  { title: 'পেমেন্ট ট্রেকার', desc: 'কাস্টমারের বাকি টাকা কিস্তিতে জমা নিন, যা অটোমেটিক হিসাব-নিকাশে যুক্ত হবে।' },
                  { title: 'হিসাব-নিকাশ', desc: 'আপনার দোকানের সকল আয় এবং ব্যয়ের বিস্তারিত হিসাব রাখুন।' },
                  { title: 'ডাটা ব্যাকআপ', desc: 'সেটিংস থেকে আপনার সব ডাটা এক্সপোর্ট করে সুরক্ষিত রাখতে পারেন।' }
                ].map((item, i) => (
                  <div key={i} className="flex space-x-4">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 text-[#6C3EF4] flex items-center justify-center font-bold text-xs shrink-0">
                      {i + 1}
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-sm text-zinc-900">{item.title}</h4>
                      <p className="text-xs text-zinc-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start space-x-3">
                <Info className="text-amber-500 shrink-0 mt-0.5" size={18} />
                <p className="text-xs text-amber-700 leading-relaxed font-medium">
                  এই অ্যাপটি সম্পূর্ণ অফলাইন, তাই আপনার ডাটা শুধুমাত্র আপনার ফোনেই সংরক্ষিত থাকে। ডাটা ডিলিট হওয়ার হাত থেকে বাঁচতে নিয়মিত ব্যাকআপ নিন।
                </p>
              </div>

              <button 
                onClick={() => setShowGuide(false)}
                className="w-full mt-8 py-4 bg-[#6C3EF4] text-white rounded-2xl font-bold text-sm flex items-center justify-center space-x-2"
              >
                <CheckCircle2 size={18} />
                <span>বুঝেছি, ধন্যবাদ</span>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
