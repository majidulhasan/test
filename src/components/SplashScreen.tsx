import React from 'react';
import { motion } from 'motion/react';
import { Scissors } from 'lucide-react';

export default function SplashScreen() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#6C3EF4] to-[#8E66FF] text-white z-[100]"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="bg-white/20 p-6 rounded-3xl backdrop-blur-md mb-6"
      >
        <Scissors size={64} strokeWidth={1.5} />
      </motion.div>
      <motion.h1 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="text-3xl font-bold tracking-tight"
      >
        টেইলর শপ ম্যানেজার
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="mt-2 text-white/70 font-medium"
      >
        স্মার্ট টেইলরিং সিস্টেম
      </motion.p>
      
      <div className="absolute bottom-12">
        <div className="flex space-x-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
              }}
              className="w-2 h-2 bg-white rounded-full"
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
