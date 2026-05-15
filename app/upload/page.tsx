"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePuterStore } from "@/lib/store";
import { Navbar } from "@/components/Navbar";
import { AppWrapper } from "@/components/AppWrapper";
import { pdfToImage } from "@/lib/pdf";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "motion/react";
import {
  Upload,
  FileText,
  ArrowRight,
  Loader2,
  CheckCircle2,
  X,
  Sparkles,
  Building,
  Briefcase,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";

const UploadPage = () => {
  const { user, isInitialized, addResume } = usePuterStore();
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState("");

  useEffect(() => {
    if (isInitialized && !user) {
      router.push("/auth");
    }
  }, [user, isInitialized, router]);

  // Pre-warm PDF library on mount
  useEffect(() => {
    const warmUp = async () => {
      try {
        await import("@/lib/pdf").then((m) => m.pdfToImage);
      } catch (e) {
        console.warn("Pre-warm failed", e);
      }
    };
    warmUp();
  }, []);

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !window.puter || !user) return;

    setIsProcessing(true);
    let pdfPathForSave = "";
    try {
      // 1. Process PDF
      setProcessStep("Extracting data from PDF...");
      const { previewUrl, text: resumeText } = await pdfToImage(file);

      // 2. Upload to Puter FS
      setProcessStep("Uploading to Puter Cloud...");
      try {
        // Just try to create and ignore error if it exists
        await window.puter.fs.mkdir("resumeanalyzer").catch(() => {});

        pdfPathForSave = `resumeanalyzer/${uuidv4()}.pdf`;
        await window.puter.fs.write(pdfPathForSave, file);
      } catch (fsError: any) {
        console.warn(
          "Puter FS Subdirectory Write Error, falling back to root:",
          fsError,
        );
        pdfPathForSave = `${uuidv4()}.pdf`;
        await window.puter.fs.write(pdfPathForSave, file);
      }

      // 3. AI Analysis
      setProcessStep("Engaging AI for analysis...");
      const systemPrompt = `You are an expert HR recruiter and ATS specialist. 
      Analyze the provided resume text against the job description for ${jobTitle} at ${companyName}.
      
      CRITICAL: You must return ONLY a JSON object. No narrative, no preamble, no markdown formatting.
      
      JSON SCHEMA:
      {
        "atsScore": number (0-100),
        "summary": "A concise 2-3 sentence executive summary of the candidate's alignment with this specific role.",
        "feedback": {
          "toneAndStyle": { "score": number (0-100), "description": "1-2 sentence assessment of language and impact" },
          "content": { "score": number (0-100), "description": "1-2 sentence assessment of relevance and depth" },
          "structure": { "score": number (0-100), "description": "1-2 sentence assessment of layout and readability" },
          "skills": { "score": number (0-100), "description": "1-2 sentence assessment of technical stack alignment" }
        },
        "strengths": string[] (at least 3 highlight points),
        "improvements": string[] (at least 3 specific action items),
        "matchedKeywords": string[] (tech stack terms mentioned in JD that are in resume),
        "missingKeywords": string[] (tech stack terms mentioned in JD but NOT in resume)
      }`;

      const userPrompt = `JOB DESCRIPTION:\n${jobDescription}\n\nRESUME TEXT:\n${resumeText}\n\nStrictly return the JSON analysis based on the schema provided.`;

      let response;
      try {
        // Try Claude 3.5 Sonnet first
        response = await window.puter.ai.chat(userPrompt, {
          model: "claude-3-5-sonnet",
          system: systemPrompt,
        });
      } catch (aiError: any) {
        console.warn("Primary model failed, falling back:", aiError);
        response = await window.puter.ai.chat(
          `${systemPrompt}\n\n${userPrompt}`,
          {
            model: "gpt-4o",
          },
        );
      }

      // Robust JSON extraction
      if (!response || !response.message || !response.message.content) {
        console.error("Invalid response structure:", response);
        throw new Error(
          "AI service returned an invalid response. Please try again.",
        );
      }

      let content = response.message.content;
      console.log("Raw AI Response:", content);

      // Try to find JSON block in markdown if present
      const markdownMatch = content.match(
        /```(?:json)?\s*(\{[\s\S]*?\})\s*```/,
      );
      // Try to find anything between first { and last }
      const curlyMatch = content.match(/(\{[\s\S]*\})/);

      let jsonStr = markdownMatch
        ? markdownMatch[1]
        : curlyMatch
          ? curlyMatch[1]
          : content;

      let analysis;
      try {
        analysis = JSON.parse(jsonStr);
      } catch (e) {
        console.error("Failed to parse AI JSON. Content received:", jsonStr);
        throw new Error(
          "The AI failed to format the analysis as JSON. Please refine your inputs or try again.",
        );
      }

      // 4. Save result
      setProcessStep("Saving analysis...");
      const resumeId = uuidv4();
      await addResume({
        id: resumeId,
        companyName,
        jobTitle,
        atsScore: analysis.atsScore,
        previewUrl,
        pdfPath: pdfPathForSave,
        summary: analysis.summary,
        feedback: analysis.feedback,
        strengths: analysis.strengths || [],
        improvements: analysis.improvements || [],
        matchedKeywords: analysis.matchedKeywords || [],
        missingKeywords: analysis.missingKeywords || [],
        createdAt: Date.now(),
      });

      setProcessStep("Done!");
      router.push(`/res/${resumeId}`);
    } catch (error: any) {
      // Improved error logging
      console.error("Full Processing Error:", error);

      let errorMessage = "Unknown error occurred";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      } else if (error && typeof error === "object") {
        errorMessage =
          error.message ||
          error.error?.message ||
          error.error ||
          "Operation failed";
      }

      console.error("Final Error Message:", errorMessage);
      alert(`Failed to analyze resume: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="flex flex-col items-center gap-4 text-center">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
            <p className="text-slate-400 font-medium animate-pulse">
              Establishing Audit Environment...
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-16">
        <div className="mb-12">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold font-display tracking-tight text-slate-800"
          >
            Audit <span className="text-indigo-600">Request</span>
          </motion.h1>
          <p className="text-slate-500 mt-2 font-medium">
            Get a deep technical analysis of your resume alignment.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                Company Entity
              </label>
              <div className="relative group">
                <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 transition-colors group-focus-within:text-indigo-500" />
                <input
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Stripe, OpenAI"
                  className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/50 focus:outline-none transition-all shadow-sm"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                Target Role
              </label>
              <div className="relative group">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 transition-colors group-focus-within:text-indigo-500" />
                <input
                  required
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Senior Product Engineer"
                  className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/50 focus:outline-none transition-all shadow-sm"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
              Job Description Fragment
            </label>
            <textarea
              required
              rows={5}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste relevant job requirements to help Claude understand the role context..."
              className="w-full px-5 py-4 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/50 focus:outline-none transition-all resize-none shadow-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
              Source Resume (PDF)
            </label>
            {!file ? (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-2xl p-16 flex flex-col items-center justify-center cursor-pointer transition-all ${
                  isDragActive
                    ? "border-indigo-500 bg-indigo-500/5"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <input {...getInputProps()} />
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                  <Upload className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-sm font-bold text-slate-800">
                  Click or drag a PDF here
                </p>
                <p className="text-xs text-slate-400 mt-2 font-medium uppercase tracking-tighter">
                  Maximum file size: 5MB
                </p>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-between p-5 bg-white border border-slate-200 rounded-2xl shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 truncate max-w-[200px]">
                      {file.name}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-300" />
                </button>
              </motion.div>
            )}
          </div>

          <button
            type="submit"
            disabled={!file || !companyName || !jobTitle || isProcessing}
            className="w-full h-16 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-3 disabled:bg-slate-200 disabled:cursor-not-allowed hover:bg-indigo-700 transition-all active:scale-[0.98] shadow-xl shadow-indigo-200"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {processStep}
              </>
            ) : (
              <>
                Initialize Audit
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </main>

      {/* Processing Overlay */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center"
          >
            <div className="relative mb-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="w-40 h-40 rounded-full border-4 border-slate-100 border-t-indigo-600"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-12 h-12 text-indigo-600 animate-pulse" />
              </div>
            </div>

            <div className="max-w-md space-y-4">
              <motion.h2
                key={processStep}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-3xl font-bold font-display text-slate-800"
              >
                {processStep}
              </motion.h2>
              <p className="text-slate-500 font-medium leading-relaxed">
                Our AI auditor is cross-referencing your experience with
                industry benchmarks for {jobTitle} roles.
              </p>
              <div className="pt-8 flex justify-center gap-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                    className="w-2 h-2 rounded-full bg-indigo-600"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function Page() {
  return (
    <AppWrapper>
      <UploadPage />
    </AppWrapper>
  );
}
