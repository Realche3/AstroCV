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

  freeTrialUsed: boolean;
  singleCredits: number;

  // Payment/entitlement
  isPaid: boolean;
  proAccessUntil: number | null;
  purchaseType: PurchaseType;

  setPaid: (paid: boolean) => void;
  setProAccessUntil: (ts: number | null) => void;
  setPurchaseType: (t: PurchaseType) => void;

  setResumeTemplate: (templateId: ResumeTemplateId) => void;

  setFreeTrialUsed: (used: boolean) => void;
  addSingleCredit: (count?: number) => void;
  consumeSingleCredit: () => void;
  lockResume: () => void;

  // Token (client-side only)
  setToken: (token: string | null) => void;

  // Data setters
  setAll: (resume: TailoredResume, coverLetter: string, followUpEmail: string) => void;
  clearAll: () => void;
}

export const useResumeStore = create<ResumeStore>()(
  persist(
    (set) => ({
      tailoredResume: null,
      coverLetter: null,
      followUpEmail: null,

      resumeTemplateId: 'corporate-classic',

      freeTrialUsed: false,
      singleCredits: 0,

      isPaid: false,
      proAccessUntil: null,
      purchaseType: null,

      setPaid: (paid) => set({ isPaid: paid }),
      setProAccessUntil: (ts) => set({ proAccessUntil: ts }),
      setPurchaseType: (t) => set({ purchaseType: t }),

      setResumeTemplate: (templateId) => set({ resumeTemplateId: templateId }),

      setFreeTrialUsed: (used) => set({ freeTrialUsed: used }),
      addSingleCredit: (count = 1) =>
        set((state) => ({
          singleCredits: state.singleCredits + count,
          isPaid: true,
          purchaseType: 'single',
        })),
      consumeSingleCredit: () =>
        set((state) => {
          const next = Math.max(0, state.singleCredits - 1);
          const stillPro = !!(state.proAccessUntil && state.proAccessUntil > Date.now());
          const hasCredit = next > 0;
          return {
            singleCredits: next,
            isPaid: stillPro || hasCredit,
            purchaseType: stillPro ? state.purchaseType : hasCredit ? 'single' : null,
          };
        }),

      setToken: (token) => {
        if (typeof window !== 'undefined') {
          if (token) localStorage.setItem('astrocv_access', token);
          else localStorage.removeItem('astrocv_access');
        }
      },

      setAll: (resume, coverLetter, followUpEmail) =>
        set({ tailoredResume: resume, coverLetter, followUpEmail }),

      clearAll: () =>
        set((state) => ({
          tailoredResume: null,
          coverLetter: null,
          followUpEmail: null,
          resumeTemplateId: 'corporate-classic',
          freeTrialUsed: state.freeTrialUsed,
          singleCredits: state.singleCredits,
          isPaid: false,
          proAccessUntil: null,
          purchaseType: null,
        })),

      lockResume: () =>
        set((state) => ({
          isPaid: state.proAccessUntil && state.proAccessUntil > Date.now() ? state.isPaid : false,
          purchaseType: state.proAccessUntil && state.proAccessUntil > Date.now() ? state.purchaseType : state.singleCredits > 0 ? 'single' : null,
        })),
    }),
    {
      name: 'astrocv_store',
      partialize: (state) => ({
        tailoredResume: state.tailoredResume,
        coverLetter: state.coverLetter,
        followUpEmail: state.followUpEmail,
        resumeTemplateId: state.resumeTemplateId,
        freeTrialUsed: state.freeTrialUsed,
        singleCredits: state.singleCredits,
        isPaid: state.isPaid,
        proAccessUntil: state.proAccessUntil,
        purchaseType: state.purchaseType,
      }),
    }
  )
);


