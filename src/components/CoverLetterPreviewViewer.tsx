'use client';

import { useEffect, useState } from 'react';
import { SpecialZoomLevel, Viewer, Worker } from '@react-pdf-viewer/core';
import { pdf } from '@react-pdf/renderer';
import TailoredCoverLetterPDF from './TailoredCoverLetterPDF';
import '@react-pdf-viewer/core/lib/styles/index.css';

interface Props {
  name: string;
  email: string;
  content: string;
}

export default function CoverLetterPreviewViewer({ name, email, content }: Props) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    const generate = async () => {
      const blob = await pdf(<TailoredCoverLetterPDF name={name} email={email} content={content} />).toBlob();
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    };
    generate();

    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [name, email, content]);

  if (!pdfUrl) {
    return <p className="text-gray-400 text-center">Generating cover letter preview...</p>;
  }

  return (
    <div className="h-[720px] sm:h-[820px] rounded-xl border border-gray-800 bg-gray-900/60 overflow-hidden">
      <Worker workerUrl="/pdf.worker.min.js">
        <Viewer
          fileUrl={pdfUrl}
          defaultScale={SpecialZoomLevel.PageFit}
          renderError={(error) => (
            <div className="h-full flex items-center justify-center text-sm text-red-400">
              {error.message || 'Preview failed to load.'}
            </div>
          )}
          renderLoader={() => (
            <div className="h-full flex items-center justify-center text-gray-400 text-sm">
              Loading preview...
            </div>
          )}
        />

      </Worker>
    </div>
  );
}
