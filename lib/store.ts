import { create } from 'zustand';
import { ResumeAnalysis } from './types';

interface PuterState {
  user: any | null;
  resumes: ResumeAnalysis[];
  isInitialized: boolean;
  isLoading: boolean;
  
  initialize: () => void;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  
  fetchResumes: () => Promise<void>;
  addResume: (resume: ResumeAnalysis) => Promise<void>;
  deleteResume: (id: string) => Promise<void>;
  getResume: (id: string) => ResumeAnalysis | undefined;
}

export const usePuterStore = create<PuterState>((set, get) => ({
  user: null,
  resumes: [],
  isInitialized: false,
  isLoading: false,

  initialize: () => {
    if (get().isInitialized) return;

    const checkPuter = async () => {
      if (typeof window !== 'undefined' && window.puter) {
        const puter = window.puter;
        
        const findAuth = async (retries = 5) => {
          try {
            const isSignedIn = puter.auth.isSignedIn();
            if (isSignedIn) {
              const user = await puter.auth.getUser();
              set({ user });
              await get().fetchResumes();
              return true;
            }
          } catch (e) {
            console.warn("Auth check attempt failed:", e);
          }
          
          if (retries > 0) {
            await new Promise(r => setTimeout(r, 200));
            return findAuth(retries - 1);
          }
          return false;
        };
        
        await findAuth();
        set({ isInitialized: true });
      } else {
        // Poll for Puter if it's not ready yet (max 10 seconds)
        let attempts = 0;
        const interval = setInterval(() => {
          attempts++;
          if (window.puter) {
            clearInterval(interval);
            get().initialize();
          } else if (attempts > 50) { // 10 seconds
            clearInterval(interval);
            console.error("Puter script failed to load after 10 seconds");
            set({ isInitialized: true }); // Stop blocking anyway
          }
        }, 200);
      }
    };
    
    checkPuter();
  },

  signIn: async () => {
    if (!window.puter) return;
    const user = await window.puter.auth.signIn();
    set({ user });
    await get().fetchResumes();
  },

  signOut: async () => {
    if (!window.puter) return;
    await window.puter.auth.signOut();
    set({ user: null, resumes: [] });
  },

  fetchResumes: async () => {
    if (!window.puter) return;
    set({ isLoading: true });
    try {
      const listData = await window.puter.kv.get('resumeanalyzer_resumes_list');
      if (listData) {
        const ids: string[] = JSON.parse(listData);
        const resumePromises = ids.map(id => window.puter.kv.get(`resumeanalyzer_resume_${id}`));
        const resumeResults = await Promise.all(resumePromises);
        const resumes: ResumeAnalysis[] = resumeResults
          .filter(r => r !== null)
          .map(r => JSON.parse(r));
        set({ resumes: resumes.sort((a, b) => b.createdAt - a.createdAt) });
      }
    } catch (e) {
      console.error("Error fetching resumes:", e);
    } finally {
      set({ isLoading: false });
    }
  },

  addResume: async (resume: ResumeAnalysis) => {
    if (!window.puter) return;
    
    try {
      // 1. Save individual resume to KV
      await window.puter.kv.set(`resumeanalyzer_resume_${resume.id}`, JSON.stringify(resume));
      
      // 2. Update list of IDs
      const listData = await window.puter.kv.get('resumeanalyzer_resumes_list');
      const ids: string[] = listData ? JSON.parse(listData) : [];
      if (!ids.includes(resume.id)) {
        const newIds = [resume.id, ...ids];
        await window.puter.kv.set('resumeanalyzer_resumes_list', JSON.stringify(newIds));
      }
      
      // 3. Update local state
      const currentResumes = get().resumes;
      set({ resumes: [resume, ...currentResumes] });
    } catch (e) {
      console.error("Error adding resume:", e);
      throw e;
    }
  },

  deleteResume: async (id: string) => {
    if (!window.puter) return;
    try {
      console.log("Attempting to delete resume:", id);
      
      // Remove PDF file from FS if path exists
      const resume = get().resumes.find(r => r.id === id);
      if (resume?.pdfPath) {
        try {
          await window.puter.fs.delete(resume.pdfPath);
        } catch (e) {
          console.warn("FS delete failed (might be already gone):", e);
        }
      }

      // 1. Remove individual KV entry
      await window.puter.kv.del(`resumeanalyzer_resume_${id}`);
      
      // 2. Update list of IDs
      const listData = await window.puter.kv.get('resumeanalyzer_resumes_list');
      if (listData) {
        const ids: string[] = JSON.parse(listData);
        const newIds = ids.filter(resumeId => resumeId !== id);
        console.log("Updated IDs list:", newIds);
        await window.puter.kv.set('resumeanalyzer_resumes_list', JSON.stringify(newIds));
      }
      
      // 3. Update local state
      set({ resumes: get().resumes.filter(r => r.id !== id) });
      console.log("Resume deleted successfully from state");
    } catch (e) {
      console.error("Error deleting resume:", e);
      throw e;
    }
  },

  getResume: (id: string) => {
    return get().resumes.find(r => r.id === id);
  }
}));
