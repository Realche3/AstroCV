import { create } from 'zustand';
import { TailoredResume } from '@/types/TailoredResume';

interface ResumeStore {
  tailoredResume: TailoredResume | null;
  coverLetter: string | null;
  followUpEmail: string | null;

  setAll: (
    resume: TailoredResume,
    coverLetter: string,
    followUpEmail: string
  ) => void;

  clearAll: () => void;
}

export const useResumeStore = create<ResumeStore>((set) => ({
  tailoredResume: null,
  coverLetter: null,
  followUpEmail: null,

  setAll: (resume, coverLetter, followUpEmail) =>
    set({ tailoredResume: resume, coverLetter, followUpEmail }),

  clearAll: () =>
    set({ tailoredResume: null, coverLetter: null, followUpEmail: null }),
}));
