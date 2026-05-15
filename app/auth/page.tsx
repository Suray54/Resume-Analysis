'use client';

import React, { useEffect } from 'react';
import { usePuterStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Zap, Github, Chrome } from 'lucide-react';
import { AppWrapper } from '@/components/AppWrapper';

const AuthPage = () => {
  const { user, signIn, isInitialized } = usePuterStore();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  if (!isInitialized) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-[32px] p-10 shadow-2xl border border-slate-100"
      >
        <div className="flex flex-col items-center text-center mb-10">
          <div className="bg-indigo-600 text-white p-4 rounded-2xl mb-6 shadow-xl shadow-indigo-100">
            <Zap className="w-8 h-8 fill-current" />
          </div>
          <h1 className="text-3xl font-bold font-display tracking-tight text-slate-800 mb-2">Resume<span className="text-indigo-600">Analyzer</span></h1>
          <p className="text-slate-500 font-medium">Smart AI Audit for your next career move</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => signIn()}
            className="w-full h-14 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all active:scale-[0.98] shadow-lg shadow-indigo-100"
          >
            Sign in with Puter.js
          </button>
          
          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-black text-slate-300">
              <span className="bg-white px-4">Powered by Puter.js</span>
            </div>
          </div>
          
          <p className="text-center text-[11px] text-slate-400 font-medium leading-relaxed">
            Upload resumes, match job descriptions, and get high-quality feedback using Claude 3.5 Sonnet.
          </p>
        </div>
      </motion.div>
      
      <p className="mt-8 text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-3">
        Built with <span className="text-indigo-400">Puter</span> + <span className="text-indigo-400">Next.js</span> + <span className="text-indigo-400">Claude</span>
      </p>
    </div>
  );
};

export default function Page() {
  return (
    <AppWrapper>
      <AuthPage />
    </AppWrapper>
  );
}
