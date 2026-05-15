'use client';

import React, { useEffect } from 'react';
import { usePuterStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { ResumeCard } from '@/components/ResumeCard';
import { AppWrapper } from '@/components/AppWrapper';
import { motion } from 'motion/react';
import { Plus, Search, Filter } from 'lucide-react';
import Link from 'next/link';

const HomePage = () => {
  const { user, resumes, isInitialized, isLoading } = usePuterStore();
  const router = useRouter();

  useEffect(() => {
    if (isInitialized && !user) {
      router.push('/auth');
    }
  }, [user, isInitialized, router]);

  if (!isInitialized || !user) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl font-bold font-display tracking-tight text-slate-800"
            >
              Recent <span className="text-indigo-600">Analyses</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-2 text-slate-500 font-medium"
            >
              Manage your resume feedback and AI insights
            </motion.p>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3"
          >
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search resumes..."
                className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all shadow-sm"
              />
            </div>
            <Link 
              href="/upload" 
              className="bg-indigo-600 text-white p-2.5 rounded-lg hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-200"
            >
              <Plus className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white border border-slate-100 rounded-xl h-80 animate-pulse" />
            ))}
          </div>
        ) : resumes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {resumes.map((resume) => (
              <ResumeCard key={resume.id} resume={resume} />
            ))}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-32 bg-white border border-slate-200 rounded-2xl shadow-sm"
          >
            <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6">
              <Plus className="w-10 h-10 text-indigo-200" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No analyses found</h3>
            <p className="text-slate-500 mb-8 max-w-xs text-center font-medium">Upload your first resume to get tailored AI feedback and ATS scores.</p>
            <Link 
              href="/upload"
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-indigo-700 transition-all active:scale-95 shadow-xl shadow-indigo-200"
            >
              Start New Analysis
            </Link>
          </motion.div>
        )}
      </main>
      
      <footer className="py-8 text-center text-slate-400 text-xs font-semibold uppercase tracking-widest border-t border-slate-100">
        © 2026 ResumeAnalyzer • Powered by Claude 3.5
      </footer>
    </div>
  );
};

export default function Page() {
  return (
    <AppWrapper>
      <HomePage />
    </AppWrapper>
  );
}
