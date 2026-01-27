
import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';

export const LockScreen = ({ onUnlock, correctPassword }: any) => {
  const [input, setInput] = useState('');

  const handleCheck = () => {
    if (input === correctPassword) onUnlock();
    else alert('ভুল পাসওয়ার্ড!');
  };

  return (
    <div className="fixed inset-0 z-[500] bg-white dark:bg-gray-900 flex flex-col items-center justify-center p-10 space-y-8">
      <ShieldCheck size={64} className="text-indigo-600" />
      <h2 className="text-2xl font-black">নিরাপত্তা যাচাই</h2>
      <input 
        type="password" 
        value={input} 
        onChange={(e) => setInput(e.target.value)}
        className="w-full max-w-xs p-4 bg-gray-100 dark:bg-gray-800 rounded-2xl text-center text-2xl outline-none border-2 border-transparent focus:border-indigo-600"
        placeholder="পাসওয়ার্ড দিন"
      />
      <button onClick={handleCheck} className="w-full max-w-xs py-4 bg-indigo-600 text-white rounded-2xl font-black">আনলক করুন</button>
    </div>
  );
};
