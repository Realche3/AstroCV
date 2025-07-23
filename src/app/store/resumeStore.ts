import { create } from 'zustand';
import { TailoredResume } from '@/types/TailoredResume';

interface ResumeStore {
  tailoredResume: TailoredResume | null;
  setTailoredResume: (resume: TailoredResume) => void;
  clearTailoredResume: () => void;
}

export const useResumeStore = create<ResumeStore>((set) => ({
  tailoredResume: null,
  setTailoredResume: (resume) => set({ tailoredResume: resume }),
  clearTailoredResume: () => set({ tailoredResume: null }),
}));
