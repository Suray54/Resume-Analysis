'use client';

import React from 'react';
import Link from 'next/link';
import { usePuterStore } from '@/lib/store';
import { FileText, LogOut, User, Plus, Zap } from 'lucide-react';
import { motion } from 'motion/react';

export const Navbar = () => {
  const { user, signOut } = usePuterStore();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="bg-indigo-600 text-white p-1.5 rounded-xl shadow-lg shadow-indigo-200 transition-transform group-hover:scale-110">
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <span className="text-xl font-bold font-display tracking-tight text-slate-800">
                Resume<span className="text-indigo-600">Analyzer</span>
              </span>
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link 
                  href="/upload" 
                  className="hidden sm:flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-all shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  New Analysis
                </Link>
                <div className="h-6 w-[1px] bg-slate-200 hidden sm:block mx-1" />
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="text-sm font-semibold hidden sm:inline">Sign Out</span>
                </button>
                <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center border-2 border-white shadow-sm overflow-hidden">
                  <User className="w-5 h-5 text-slate-400" />
                </div>
              </>
            ) : (
              <Link
                href="/auth"
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-all shadow-md"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
