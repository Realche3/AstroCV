// src/app/dashboard/page.tsx
'use client';

import { useState, useCallback } from 'react';
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
  // Data
  const tailoredResume = useResumeStore((s) => s.tailoredResume);
  const coverLetter = useResumeStore((s) => s.coverLetter);
  const followUpEmail = useResumeStore((s) => s.followUpEmail);

  // Paywall state
  const isPaid = useResumeStore((s) => s.isPaid);

  // Plan modal
  const [planOpen, setPlanOpen] = useState(false);

  // -------- Download handlers --------
  const handleDownloadResume = useCallback(async () => {
    if (!tailoredResume) return;

    // Gate by payment
    if (!isPaid) {
      setPlanOpen(true);
      return;
    }

    const blob = await renderPdf(
      <TailoredResumePDF tailoredResume={tailoredResume} locked={false} />
    ).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'astrocv_resume.pdf';
    a.click();
    URL.revokeObjectURL(url);
  }, [isPaid, tailoredResume]);

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

  // CTA used by the resume preview overlay
  const handleUnlockClick = useCallback(() => {
    setPlanOpen(true);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 py-20 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-center text-blue-400">
          Your Tailored Documents
        </h1>

        {!tailoredResume ? (
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
            {/* Resume (Paid / Locked until purchase) */}
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
                {/* Tall, stacked preview */}
                <div className="h-[720px] sm:h-[820px]">
                  <ResumePreviewViewer
                    tailoredResume={tailoredResume}
                    locked={!isPaid}
                    onUnlock={handleUnlockClick}
                  />
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handleDownloadResume}
                    className="inline-flex items-center px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-blue-500/30"
                  >
                    Download Resume {isPaid ? '' : '(Paid)'}
                  </button>
                </div>
              </div>
            </section>

            {/* Cover Letter (Free) */}
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

            {/* Follow-up Email (Free) */}
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

      {/* Plan picker modal for unlocking resume */}
      <PlanPickerModal open={planOpen} onClose={() => setPlanOpen(false)} />
    </main>
  );
}
