'use client';

import { useResumeStore } from '@/app/store/resumeStore';
import ResumePreviewViewer from '@/components/ResumePreviewViewer';
import CoverLetterPreviewViewer from '@/components/CoverLetterPreviewViewer';
import EmailPreviewViewer from '@/components/EmailPreviewViewer';
import { pdf } from '@react-pdf/renderer';
import TailoredResumePDF from '@/components/TailoredResumePDF';
import TailoredCoverLetterPDF from '@/components/TailoredCoverLetterPDF';
import TailoredEmailPDF from '@/components/TailoredEmailPDF';
import Link from 'next/link';

export default function DashboardPage() {
  const tailoredResume = useResumeStore((s) => s.tailoredResume);
  const coverLetter = useResumeStore((s) => s.coverLetter);
  const followUpEmail = useResumeStore((s) => s.followUpEmail);

  const handleDownloadResume = async () => {
    if (!tailoredResume) return;
    // TODO: gate with paywall before allowing download
    const blob = await pdf(<TailoredResumePDF tailoredResume={tailoredResume} />).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'astrocv_resume.pdf';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadCoverLetter = async () => {
    if (!tailoredResume || !coverLetter) return;
    const blob = await pdf(
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
  };

  const handleDownloadEmail = async () => {
    if (!tailoredResume || !followUpEmail) return;
    const blob = await pdf(
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
  };

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
            {/* Resume */}
            <section className="rounded-xl border border-gray-800 bg-gray-900/50 shadow-lg">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
                <h2 className="text-sm font-semibold text-gray-200">Resume</h2>
              </div>
              <div className="p-3">
                <div className="h-[720px] sm:h-[820px]">
                  <ResumePreviewViewer tailoredResume={tailoredResume} />
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handleDownloadResume}
                    className="inline-flex items-center px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-blue-500/30"
                  >
                    Download Resume (Paid)
                  </button>
                </div>
              </div>
            </section>

            {/* Cover Letter */}
            <section className="rounded-xl border border-gray-800 bg-gray-900/50 shadow-lg">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
                <h2 className="text-sm font-semibold text-gray-200">Cover Letter</h2>
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

            {/* Follow-up Email */}
            <section className="rounded-xl border border-gray-800 bg-gray-900/50 shadow-lg">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
                <h2 className="text-sm font-semibold text-gray-200">Follow-up Email</h2>
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
    </main>
  );
}
