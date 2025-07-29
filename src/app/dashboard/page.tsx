'use client';

import { useResumeStore } from '@/app/store/resumeStore';
import ResumePreviewViewer from '@/components/ResumePreviewViewer';
import CoverLetterPreviewViewer from '@/components/CoverLetterPreviewViewer';
import EmailPreviewViewer from '@/components/EmailPreviewViewer';
import { pdf } from '@react-pdf/renderer';
import TailoredResumePDF from '@/components/TailoredResumePDF';
import Link from 'next/link';

export default function DashboardPage() {
  const tailoredResume = useResumeStore((state) => state.tailoredResume);

  const handleDownload = async () => {
    if (!tailoredResume) return;
    const blob = await pdf(<TailoredResumePDF tailoredResume={tailoredResume} />).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'astrocv_resume.pdf';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-center text-blue-400">
          Your Tailored Documents
        </h1>

        {tailoredResume ? (
          <>
            <div className="text-center mb-6">
              <button
                onClick={handleDownload}
                className="inline-flex items-center px-6 py-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-blue-500/30"
              >
                Download Resume PDF
              </button>
            </div>

            {/* Responsive layout for previews */}
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <ResumePreviewViewer tailoredResume={tailoredResume} />
              </div>
              <div className="flex-1">
                <CoverLetterPreviewViewer tailoredResume={tailoredResume} />
              </div>
              <div className="flex-1">
                <EmailPreviewViewer tailoredResume={tailoredResume} />
              </div>
            </div>
          </>
        ) : (
          <div className="text-center mt-10 space-y-4">
            <p className="text-gray-400 text-lg">No tailored resume found.</p>
            <Link
              href="/#upload-section"
              className="inline-block px-5 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition"
            >
              Go Back & Upload Resume
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
