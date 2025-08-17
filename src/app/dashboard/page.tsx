// src/app/dashboard/page.tsx
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { pdf as renderPdf } from '@react-pdf/renderer';

import { useResumeStore } from '@/app/store/resumeStore';

import ResumePreviewViewer from '@/components/ResumePreviewViewer';
import CoverLetterPreviewViewer from '@/components/CoverLetterPreviewViewer';
import EmailPreviewViewer from '@/components/EmailPreviewViewer';

import TailoredResumePDF from '@/components/TailoredResumePDF';
import TailoredCoverLetterPDF from '@/components/TailoredCoverLetterPDF';
import TailoredEmailPDF from '@/components/TailoredEmailPDF';

import PlanPickerModal from '@/components/PlanPickerModal';

export default function DashboardPage() {
  // Hydration status (do NOT early return; keep hooks order stable)
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  // Zustand state
  const tailoredResume = useResumeStore((s) => s.tailoredResume);
  const coverLetter = useResumeStore((s) => s.coverLetter);
  const followUpEmail = useResumeStore((s) => s.followUpEmail);

  const isPaid = useResumeStore((s) => s.isPaid);
  const proAccessUntil = useResumeStore((s) => s.proAccessUntil);

  const setToken = useResumeStore((s) => s.setToken);
  const setPaid = useResumeStore((s) => s.setPaid);
  const setProAccessUntil = useResumeStore((s) => s.setProAccessUntil);

  // Pro if we have a future timestamp
  const isPro = useMemo(
    () => !!proAccessUntil && Date.now() < proAccessUntil,
    [proAccessUntil]
  );

  // Plan modal
  const [planOpen, setPlanOpen] = useState(false);
  const openPlan = useCallback(() => setPlanOpen(true), []);
  const closePlan = useCallback(() => setPlanOpen(false), []);

  // Downloads
  const handleDownloadResume = useCallback(async () => {
    if (!tailoredResume) return;
    const blob = await renderPdf(
      <TailoredResumePDF tailoredResume={tailoredResume} locked={false} />
    ).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'astrocv_resume.pdf';
    a.click();
    URL.revokeObjectURL(url);
  }, [tailoredResume]);

  const handleDownloadCoverLetter = useCallback(async () => {
    if (!tailoredResume || !coverLetter) return;
    const blob = await renderPdf(
      <TailoredCoverLetterPDF
        name={tailoredResume.header.name}
        email={tailoredResume.header.email}
        content={coverLetter}
      />
    ).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'astrocv_cover_letter.pdf';
    a.click();
    URL.revokeObjectURL(url);
  }, [tailoredResume, coverLetter]);

  const handleDownloadEmail = useCallback(async () => {
    if (!tailoredResume || !followUpEmail) return;
    const blob = await renderPdf(
      <TailoredEmailPDF
        name={tailoredResume.header.name}
        email={tailoredResume.header.email}
        content={followUpEmail}
      />
    ).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'astrocv_follow_up_email.pdf';
    a.click();
    URL.revokeObjectURL(url);
  }, [tailoredResume, followUpEmail]);

  // Auto-download handling (single purchase)
  const autoRanRef = useRef(false);
  useEffect(() => {
    if (autoRanRef.current) return;

    const hasFlag =
      typeof window !== 'undefined' &&
      sessionStorage.getItem('astrocv_autodl') === '1';

    if (!hasFlag) return;
    if (!tailoredResume) return;
    if (!isPaid) return;

    autoRanRef.current = true;

    // Remove flag BEFORE starting to avoid re-triggers
    sessionStorage.removeItem('astrocv_autodl');

    (async () => {
      try {
        await handleDownloadResume();

        // Immediately relock for single (non-Pro)
        if (!isPro) {
          // small cushion so the file save dialog isn't disrupted
          setTimeout(() => {
            setToken(null);
            setPaid(false);
            setProAccessUntil(null);
          }, 300);
        }
      } catch (e) {
        console.error('[AUTO_DOWNLOAD_ERROR]', e);
        // optional: restore flag so user can try again
        // sessionStorage.setItem('astrocv_autodl', '1');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tailoredResume, isPaid, isPro]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 py-20 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-center text-blue-400">
          Your Tailored Documents
        </h1>

        {/* Hydration placeholder */}
        {!hydrated ? (
          <div className="text-center text-gray-400">Loading…</div>
        ) : !tailoredResume ? (
          <div className="text-center mt-10 space-y-4">
            <p className="text-gray-400 text-lg">No tailored resume found.</p>
            <Link
              href="/#upload-section"
              className="inline-block px-5 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition"
            >
              Go Back & Upload Resume
            </Link>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Resume (paywalled) */}
            <section className="rounded-xl border border-gray-800 bg-gray-900/50 shadow-lg">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
                <h2 className="text-sm font-semibold text-gray-200">Resume</h2>
                {!isPaid && (
                  <span className="text-xs rounded-full bg-blue-900/40 text-blue-200 px-2 py-1 border border-blue-800">
                    Locked
                  </span>
                )}
              </div>

              <div className="p-3">
                {/* Tall single-column preview so page fits without zoom */}
                <div className="h-[720px] sm:h-[820px]">
                  <ResumePreviewViewer
                    tailoredResume={tailoredResume}
                    locked={!isPaid}
                    onUnlock={openPlan}
                  />
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={async () => {
                      if (!isPaid) {
                        openPlan();
                        return;
                      }
                      await handleDownloadResume();
                    }}
                    className="inline-flex items-center px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-blue-500/30"
                  >
                    Download Resume {isPaid ? '' : '(Paid)'}
                  </button>
                </div>
              </div>
            </section>

            {/* Cover Letter (free) */}
            <section className="rounded-xl border border-gray-800 bg-gray-900/50 shadow-lg">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
                <h2 className="text-sm font-semibold text-gray-200">Cover Letter</h2>
                <span className="text-xs rounded-full bg-gray-800 text-gray-300 px-2 py-1 border border-gray-700">
                  Free
                </span>
              </div>

              <div className="p-3">
                <div className="h-[720px] sm:h-[820px]">
                  <CoverLetterPreviewViewer
                    name={tailoredResume.header.name}
                    email={tailoredResume.header.email}
                    content={coverLetter || ''}
                  />
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handleDownloadCoverLetter}
                    className="inline-flex items-center px-5 py-2.5 rounded-full bg-gray-800 text-white border border-gray-700 hover:border-blue-400 hover:text-blue-300 transition"
                  >
                    Download Cover Letter (Free)
                  </button>
                </div>
              </div>
            </section>

            {/* Follow-up Email (free) */}
            <section className="rounded-xl border border-gray-800 bg-gray-900/50 shadow-lg">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
                <h2 className="text-sm font-semibold text-gray-200">Follow-up Email</h2>
                <span className="text-xs rounded-full bg-gray-800 text-gray-300 px-2 py-1 border border-gray-700">
                  Free
                </span>
              </div>

              <div className="p-3">
                <div className="h-[720px] sm:h-[820px]">
                  <EmailPreviewViewer
                    name={tailoredResume.header.name}
                    email={tailoredResume.header.email}
                    content={followUpEmail || ''}
                  />
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handleDownloadEmail}
                    className="inline-flex items-center px-5 py-2.5 rounded-full bg-gray-800 text-white border border-gray-700 hover:border-blue-400 hover:text-blue-300 transition"
                  >
                    Download Follow-up Email (Free)
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>

      {/* Plan picker modal used to unlock resume */}
      <PlanPickerModal open={planOpen} onClose={closePlan} />
    </main>
  );
}
