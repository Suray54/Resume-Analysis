'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';
import { ResumeAnalysis } from '@/lib/types';
import { Calendar, Building, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePuterStore } from '@/lib/store';

export const ResumeCard = ({ resume }: { resume: ResumeAnalysis }) => {
  const { deleteResume } = usePuterStore();

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-100';
    if (score >= 50) return 'text-amber-600 bg-amber-50 border-amber-100';
    return 'text-rose-600 bg-rose-50 border-rose-100';
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this analysis?')) {
      try {
        await deleteResume(resume.id);
      } catch (err) {
        alert('Failed to delete resume');
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="group relative bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300"
    >
      <button 
        onClick={handleDelete}
        className="absolute top-4 left-4 z-50 p-2.5 bg-white/95 backdrop-blur-md rounded-xl text-rose-500 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white border border-slate-200 shadow-xl active:scale-95 touch-manipulation"
        title="Delete analysis"
      >
        <Trash2 className="w-5 h-5" />
      </button>

      <Link href={`/res/${resume.id}`} className="block relative z-10 no-underline">
        <div className="aspect-[3/4] relative overflow-hidden bg-slate-100 border-b border-slate-100">
          <Image
            src={resume.previewUrl}
            alt={resume.jobTitle}
            fill
            className="object-cover object-top opacity-90 group-hover:opacity-100 transition-opacity"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/60 to-transparent p-6 pt-12">
            <div className={cn(
              "absolute top-4 right-4 px-3 py-1.5 rounded-lg border text-sm font-bold shadow-lg backdrop-blur-md",
              getScoreColor(resume.atsScore)
            )}>
              {resume.atsScore}%
            </div>
          </div>
        </div>
        
        <div className="p-5">
          <h3 className="font-bold text-lg text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-1">
            {resume.jobTitle}
          </h3>
          
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
              <Building className="w-4 h-4" />
              <span className="truncate">{resume.companyName}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
              <Calendar className="w-4 h-4" />
              <span>{new Date(resume.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
