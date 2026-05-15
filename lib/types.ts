export interface ResumeAnalysis {
  id: string;
  companyName: string;
  jobTitle: string;
  atsScore: number;
  previewUrl: string; // PNG preview stored in Puter FS or as DATA URL
  pdfPath?: string;
  summary?: string;
  feedback: {
    toneAndStyle: { score: number; description: string };
    content: { score: number; description: string };
    structure: { score: number; description: string };
    skills: { score: number; description: string };
  };
  strengths: string[];
  improvements: string[];
  matchedKeywords: string[];
  missingKeywords: string[];
  createdAt: number;
}

declare global {
  interface Window {
    puter: any;
  }
}
