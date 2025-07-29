'use client';

import { useEffect, useState } from 'react';
import { Viewer, Worker } from '@react-pdf-viewer/core';
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
    <div className="border border-gray-700 rounded-xl overflow-hidden shadow-lg bg-white h-[500px]">
      <Worker workerUrl="/pdf.worker.min.js">
        <Viewer fileUrl={pdfBlobUrl} />
      </Worker>
    </div>
  );
}
