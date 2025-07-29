'use client';

import { useEffect, useState } from 'react';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import { pdf } from '@react-pdf/renderer';
import TailoredEmailPDF from './TailoredEmailPDF';
import { TailoredResume } from '@/types/TailoredResume';
import '@react-pdf-viewer/core/lib/styles/index.css';

interface Props {
  tailoredResume: TailoredResume;
}

export default function EmailPreviewViewer({ tailoredResume }: Props) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    const generate = async () => {
      const blob = await pdf(<TailoredEmailPDF tailoredResume={tailoredResume} />).toBlob();
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    };
    generate();
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [tailoredResume]);

  if (!pdfUrl) {
    return <p className="text-gray-400 text-center">Generating email preview...</p>;
  }

  return (
    <div className="border border-gray-700 rounded-xl overflow-hidden shadow-lg">
      <Worker workerUrl="/pdf.worker.min.js">
        <Viewer fileUrl={pdfUrl} />
      </Worker>
    </div>
  );
}
