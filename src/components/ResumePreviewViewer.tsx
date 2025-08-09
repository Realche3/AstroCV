'use client';

import { useEffect, useState } from 'react';
import { SpecialZoomLevel, Viewer, Worker } from '@react-pdf-viewer/core';
import { pdf } from '@react-pdf/renderer';
import TailoredResumePDF from './TailoredResumePDF';
import '@react-pdf-viewer/core/lib/styles/index.css';
import { TailoredResume } from '@/types/TailoredResume';

interface ResumePreviewViewerProps {
  tailoredResume: TailoredResume;
}

export default function ResumePreviewViewer({ tailoredResume }: ResumePreviewViewerProps) {
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    const generatePdf = async () => {
      const blob = await pdf(<TailoredResumePDF tailoredResume={tailoredResume} />).toBlob();
      const url = URL.createObjectURL(blob);
      setPdfBlobUrl(url);
    };

    generatePdf();

    return () => {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
    };
  }, [tailoredResume]);

  if (!pdfBlobUrl) {
    return <p className="text-gray-400 text-center">Generating preview...</p>;
  }

  return (
    <div className="h-[720px] sm:h-[820px] rounded-xl border border-gray-800 bg-gray-900/60 overflow-hidden">
      <Worker workerUrl="/pdf.worker.min.js">

        <Viewer
          fileUrl={pdfBlobUrl}
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
