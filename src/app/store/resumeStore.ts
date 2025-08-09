// src/app/store/resumeStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TailoredResume } from '@/types/TailoredResume';

interface ResumeStore {
  tailoredResume: TailoredResume | null;
  coverLetter: string | null;
  followUpEmail: string | null;

  // Payment/entitlement
  isPaid: boolean;
  proAccessUntil: number | null;
  setPaid: (paid: boolean) => void;
  setProAccessUntil: (ts: number | null) => void;

  // Token (client-side only)
  setToken: (token: string | null) => void;

  setAll: (resume: TailoredResume, coverLetter: string, followUpEmail: string) => void;
  clearAll: () => void;
}

export const useResumeStore = create<ResumeStore>()(
  persist(
    (set) => ({
      tailoredResume: null,
      coverLetter: null,
      followUpEmail: null,

      isPaid: false,
      proAccessUntil: null,
      setPaid: (paid) => set({ isPaid: paid }),
      setProAccessUntil: (ts) => set({ proAccessUntil: ts }),

      setToken: (token) => {
        if (typeof window !== 'undefined') {
          if (token) localStorage.setItem('astrocv_access', token);
          else localStorage.removeItem('astrocv_access');
        }
      },

      setAll: (resume, coverLetter, followUpEmail) =>
        set({ tailoredResume: resume, coverLetter, followUpEmail }),

      clearAll: () =>
        set({
          tailoredResume: null,
          coverLetter: null,
          followUpEmail: null,
          isPaid: false,
          proAccessUntil: null,
        }),
    }),
    {
      name: 'astrocv_store', // key in localStorage
      // only persist what we need
      partialize: (state) => ({
        tailoredResume: state.tailoredResume,
        coverLetter: state.coverLetter,
        followUpEmail: state.followUpEmail,
        isPaid: state.isPaid,
        proAccessUntil: state.proAccessUntil,
      }),
    }
  )
);
