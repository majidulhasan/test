
import React, { useState } from 'react';
import { Lock, Check } from 'lucide-react';

export const AddEditPassword = ({ onSave, onCancel }: any) => {
  const [password, setPassword] = useState('');

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-center"><Lock size={48} className="text-indigo-600" /></div>
      <h2 className="text-xl font-black text-center">পাসওয়ার্ড সেট করুন</h2>
      <input 
        type="password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)}
        className="w-full p-4 bg-gray-100 dark:bg-gray-900 rounded-2xl text-center text-2xl"
        placeholder="****"
      />
      <button onClick={() => onSave(password)} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black">সংরক্ষণ করুন</button>
    </div>
  );
};
