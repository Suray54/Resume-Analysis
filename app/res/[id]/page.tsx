'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { usePuterStore } from '@/lib/store';
import { Navbar } from '@/components/Navbar';
import { AppWrapper } from '@/components/AppWrapper';
import { ScoreGauge } from '@/components/ScoreGauge';
import { AccordionItem } from '@/components/Accordion';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Eye, 
  FileCheck, 
  AlertCircle,
  Sparkles,
  Info,
  ThumbsUp,
  AlertTriangle,
  Check,
  X,
  Loader2,
  Palette,
  FileText,
  LayoutGrid,
  Zap,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const ReviewPage = () => {
  const { id } = useParams() as { id: string };
  const { user, getResume, isInitialized } = usePuterStore();
  const router = useRouter();
  
  const resume = getResume(id);

  useEffect(() => {
    if (isInitialized && !user) {
      router.push('/auth');
    }
  }, [user, isInitialized, router]);

  const handleViewPDF = async () => {
    if (resume?.pdfPath && window.puter) {
      // Open tab immediately to avoid pop-up blocker
      const newTab = window.open('', '_blank');
      if (newTab) {
        newTab.document.title = 'Loading PDF...';
        newTab.document.body.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;color:#666;">Loading your resume...</div>';
      }

      try {
        const fileContent = await window.puter.fs.read(resume.pdfPath);
        // Ensure the blob is of type application/pdf
        const blob = new Blob([fileContent], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        if (newTab) {
          newTab.location.href = url;
          newTab.document.title = `Resume - ${resume.jobTitle}`;
        }
      } catch (e) {
        console.error("Failed to read PDF from Puter FS:", e);
        if (newTab) {
          newTab.document.body.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;color:#e11d48;">Failed to load PDF. Please try again.</div>';
        }
      }
    } else if (resume?.previewUrl) {
      const newTab = window.open();
      if (newTab) {
        newTab.document.write(`<img src="${resume.previewUrl}" style="max-width: 100%; height: auto; display: block; margin: 0 auto;">`);
        newTab.document.title = `Resume Preview - ${resume.jobTitle}`;
      }
    }
  };

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    tone: true,
    content: true,
    structure: true,
    skills: true
  });

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="flex flex-col items-center gap-4 text-center">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
            <p className="text-slate-400 font-medium animate-pulse">Loading Audit Report...</p>
          </div>
        </main>
      </div>
    );
  }
  
  if (!resume) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-4">
        <AlertCircle className="w-12 h-12 text-neutral-300 mb-4" />
        <h2 className="text-xl font-bold flex flex-col items-center">
          Analysis not found
          <span className="text-sm font-normal text-neutral-500 mt-1">Check the URL or return home</span>
        </h2>
        <Link href="/" className="mt-8 bg-neutral-900 text-white px-8 py-3 rounded-full font-bold">
          Go Back Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-slate-200 bg-white px-8 flex items-center justify-between shadow-sm z-10 shrink-0">
          <div className="flex items-center gap-4">
            <Link 
              href="/"
              className="p-1.5 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-200"
            >
              <ArrowLeft className="w-5 h-5 text-slate-500" />
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-bold text-slate-800 tracking-tight">
                Analysis <span className="text-indigo-600">Report</span>
              </h1>
              <div className="h-4 w-[1px] bg-slate-200 mx-1 hidden sm:block"></div>
              <span className="text-sm text-slate-500 font-medium truncate max-w-[200px] hidden sm:block">
                {resume.jobTitle} • {resume.companyName}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={handleViewPDF}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 rounded-lg border border-slate-200 transition-all active:scale-[0.98]"
            >
              <Eye className="w-4 h-4" />
              View PDF
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-white">
          {/* Feedback */}
          <section className="p-6 md:p-12 lg:p-16 max-w-7xl mx-auto w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column (Stick on Desktop) */}
              <div className="lg:col-span-4 space-y-6">
                {/* Score Section */}
                <div className="p-8 rounded-2xl bg-white border border-slate-100 shadow-sm flex flex-col items-center text-center">
                  <div className="relative mb-4">
                    <ScoreGauge score={resume.atsScore} size={240} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center pt-10">
                      <span className="text-6xl font-bold text-amber-500 leading-none">{resume.atsScore}</span>
                      <span className="text-xs font-bold text-slate-400 mt-1 tracking-[0.2em] uppercase">
                        {resume.atsScore >= 80 ? "GREAT" : resume.atsScore >= 50 ? "FAIR" : "POOR"}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-slate-500 mt-2">ATS Score</p>
                </div>

                {/* AI Summary Card */}
                <div className="p-8 rounded-2xl bg-white border border-slate-100 shadow-sm flex flex-col gap-3">
                  <h4 className="font-bold text-slate-900 tracking-tight">AI Summary</h4>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {resume.summary || (
                      resume.atsScore >= 80 
                        ? "Excellent! Your resume matches this job description exceptionally well. High probability of passing initial screenings."
                        : resume.atsScore >= 50 
                        ? "Good foundation. You have many core requirements, but the resume lacks the specific semantic alignment for total recruitment confidence."
                        : "Action required. Your resume is missing major technical indicators and structural cues necessary for this specific job profile."
                    )}
                  </p>
                </div>

                {/* Keywords (Matching image aesthetics) */}
                <div className="space-y-4">
                  <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Keywords Matched</h4>
                    <div className="flex flex-wrap gap-2">
                      {resume.matchedKeywords?.map((kw, i) => (
                        <span key={i} className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[11px] font-bold border border-emerald-100">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Missing Keywords</h4>
                    <div className="flex flex-wrap gap-2">
                      {resume.missingKeywords?.map((kw, i) => (
                        <span key={i} className="px-3 py-1 bg-rose-50 text-rose-700 rounded-full text-[11px] font-bold border border-rose-100">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Detailed Feedback */}
              <div className="lg:col-span-8 space-y-6">
                {/* Strengths & Improvements */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-8 rounded-2xl bg-[#f0f9f4] border border-[#e1f2e8] flex flex-col gap-5">
                    <div className="flex items-center gap-3 text-[#10b981]">
                      <ThumbsUp className="w-5 h-5" />
                      <h4 className="font-bold text-slate-900 tracking-tight">Strengths</h4>
                    </div>
                    <ul className="space-y-4">
                      {(resume.strengths && resume.strengths.length > 0) ? (
                        resume.strengths.map((item, i) => (
                          <li key={i} className="flex gap-3 text-slate-600 text-sm leading-relaxed font-medium">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#10b981]/60 mt-2 shrink-0" />
                            {item}
                          </li>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 italic">No significant strengths identified.</p>
                      )}
                    </ul>
                  </div>

                  <div className="p-8 rounded-2xl bg-[#fffaf0] border border-[#fef3c7] flex flex-col gap-5">
                    <div className="flex items-center gap-3 text-[#f59e0b]">
                      <AlertTriangle className="w-5 h-5" />
                      <h4 className="font-bold text-slate-900 tracking-tight">Improvements</h4>
                    </div>
                    <ul className="space-y-4">
                      {(resume.improvements && resume.improvements.length > 0) ? (
                        resume.improvements.map((item, i) => (
                          <li key={i} className="flex gap-3 text-slate-600 text-sm leading-relaxed font-medium">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]/60 mt-2 shrink-0" />
                            {item}
                          </li>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 italic">No major improvements suggested.</p>
                      )}
                    </ul>
                  </div>
                </div>

                {[
                  { 
                    id: 'tone', 
                    title: 'Tone & Style', 
                    icon: Palette, 
                    color: 'indigo', 
                    data: resume.feedback.toneAndStyle 
                  },
                  { 
                    id: 'content', 
                    title: 'Content Quality', 
                    icon: FileText, 
                    color: 'violet', 
                    data: resume.feedback.content 
                  },
                  { 
                    id: 'structure', 
                    title: 'Structure & Format', 
                    icon: LayoutGrid, 
                    color: 'blue', 
                    data: resume.feedback.structure 
                  },
                  { 
                    id: 'skills', 
                    title: 'Skills Alignment', 
                    icon: Zap, 
                    color: 'indigo', 
                    data: resume.feedback.skills 
                  },
                ].map((section) => (
                  <div key={section.id} className="p-8 rounded-2xl bg-white border border-slate-100 shadow-sm transition-all hover:shadow-md overflow-hidden">
                    <button 
                      onClick={() => toggleSection(section.id)}
                      className="w-full flex items-start justify-between mb-0"
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center",
                          section.color === 'indigo' ? "bg-indigo-50 text-indigo-600" :
                          section.color === 'violet' ? "bg-violet-50 text-violet-600" :
                          "bg-blue-50 text-blue-600"
                        )}>
                          <section.icon className="w-6 h-6" />
                        </div>
                        <h4 className="font-bold text-lg text-slate-900 tracking-tight">{section.title}</h4>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {typeof section.data === 'object' && 'score' in section.data && (
                          <div className="px-3 py-1.5 bg-amber-50 text-amber-600 rounded-full text-[11px] font-bold flex items-center gap-2 border border-amber-100">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                            {section.data.score}%
                          </div>
                        )}
                        <div className={cn(
                          "p-1 hover:bg-slate-50 rounded-lg transition-transform duration-200",
                          expandedSections[section.id] ? "rotate-180" : "rotate-0"
                        )}>
                          <ChevronDown className="w-5 h-5 text-slate-300" />
                        </div>
                      </div>
                    </button>
                    
                    <motion.div
                      initial={false}
                      animate={{ 
                        height: expandedSections[section.id] ? 'auto' : 0,
                        opacity: expandedSections[section.id] ? 1 : 0,
                        marginTop: expandedSections[section.id] ? 24 : 0
                      }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <p className="text-slate-600 text-base leading-relaxed">
                        {(typeof section.data === 'object' && section.data !== null && 'description' in section.data)
                          ? (section.data as any).description 
                          : (Array.isArray(section.data) ? (section.data as any[]).join(' ') : String(section.data))}
                      </p>
                    </motion.div>
                  </div>
                ))}
              </div>

            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default function Page() {
  return (
    <AppWrapper>
      <ReviewPage />
    </AppWrapper>
  );
}
