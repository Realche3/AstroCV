import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TailoredResume } from '@/types/TailoredResume';

type PurchaseType = 'single' | 'pro' | null;

type ResumeTemplateId =
  | 'corporate-classic'
  | 'corporate-executive'
  | 'corporate-modern'
  | 'tech-skills'
  | 'tech-project'
  | 'tech-lean'
  | 'creative-minimal'
  | 'creative-bold'
  | 'creative-hybrid'
  | 'health-academic'
  | 'health-chronological'
  | 'health-functional'
  | 'operations-simple'
  | 'operations-achievement'
  | 'operations-compact';

interface ResumeStore {
  tailoredResume: TailoredResume | null;
  coverLetter: string | null;
  followUpEmail: string | null;

  resumeTemplateId: ResumeTemplateId;

  // Payment/entitlement
  isPaid: boolean;
  proAccessUntil: number | null;
  purchaseType: PurchaseType;

  setPaid: (paid: boolean) => void;
  setProAccessUntil: (ts: number | null) => void;
  setPurchaseType: (t: PurchaseType) => void;

  setResumeTemplate: (templateId: ResumeTemplateId) => void;

  // Token (client-side only)
  setToken: (token: string | null) => void;

  // Data setters
  setAll: (resume: TailoredResume, coverLetter: string, followUpEmail: string) => void;
  clearAll: () => void;

  // Lock helper (used to relock after single download)
  lockResume: () => void;
}

export const useResumeStore = create<ResumeStore>()(
  persist(
    (set) => ({
      tailoredResume: null,
      coverLetter: null,
      followUpEmail: null,

      resumeTemplateId: 'corporate-classic',

      isPaid: false,
      proAccessUntil: null,
      purchaseType: null,

      setPaid: (paid) => set({ isPaid: paid }),
      setProAccessUntil: (ts) => set({ proAccessUntil: ts }),
      setPurchaseType: (t) => set({ purchaseType: t }),

      setResumeTemplate: (templateId) => set({ resumeTemplateId: templateId }),

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
          resumeTemplateId: 'corporate-classic',
          isPaid: false,
          proAccessUntil: null,
          purchaseType: null,
        }),

      lockResume: () =>
        set({
          isPaid: false,
          // proAccessUntil: null,
          purchaseType: null,
        }),
    }),
    {
      name: 'astrocv_store',
      partialize: (state) => ({
        tailoredResume: state.tailoredResume,
        coverLetter: state.coverLetter,
        followUpEmail: state.followUpEmail,
        resumeTemplateId: state.resumeTemplateId,
        isPaid: state.isPaid,
        proAccessUntil: state.proAccessUntil,
        purchaseType: state.purchaseType,
      }),
    }
  )
);

