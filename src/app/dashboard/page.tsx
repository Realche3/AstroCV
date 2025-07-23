'use client';

import { useResumeStore } from '@/app/store/resumeStore';
import ResumePreviewViewer from '@/components/ResumePreviewViewer';

export default function DashboardPage() {
  const tailoredResume = useResumeStore((state) => state.tailoredResume);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-center text-blue-400">
          Your Tailored Resume
        </h1>

        {tailoredResume ? (
          <ResumePreviewViewer tailoredResume={tailoredResume} />
        ) : (
          <p className="text-gray-400 text-center">
            No tailored resume found. Please tailor your resume first.
          </p>
        )}
      </div>
    </main>
  );
}
