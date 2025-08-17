'use client';

import { useEffect, useState } from 'react';
import { Viewer, Worker, SpecialZoomLevel } from '@react-pdf-viewer/core';
import { pdf as renderPdf } from '@react-pdf/renderer';
import TailoredResumePDF from './TailoredResumePDF';
import { TailoredResume } from '@/types/TailoredResume';
import '@react-pdf-viewer/core/lib/styles/index.css';

interface Props {
  tailoredResume: TailoredResume;
  locked?: boolean;        // 👈 new
  onUnlock?: () => void;   // optional handler to open checkout
  className?: string;
}

export default function ResumePreviewViewer({ tailoredResume, locked = false, onUnlock, className }: Props) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let revokedUrl: string | null = null;
    let active = true;

    const gen = async () => {
      try {
        setErr(null);
        const blob = await renderPdf(
          <TailoredResumePDF tailoredResume={tailoredResume} locked={locked} />
        ).toBlob();
        const url = URL.createObjectURL(blob);
        revokedUrl = url;
        if (active) setPdfUrl(url);
      } catch (e: any) {
        if (active) {
          setErr('Failed to generate preview.');
          setPdfUrl(null);
          console.error('[ResumePreviewViewer]', e);
        }
      }
    };

    gen();
    return () => {
      active = false;
      if (revokedUrl) URL.revokeObjectURL(revokedUrl);
    };
  }, [tailoredResume, locked]);

  return (
    <div
      className={`relative h-full min-h-[320px] ${locked ? 'select-none' : ''} ${className ?? ''}`}
      onContextMenu={locked ? (e) => e.preventDefault() : undefined}
    >
      <div className="h-full rounded-xl border border-gray-800 bg-gray-900/60 overflow-hidden">
        <Worker workerUrl="/pdf.worker.min.js">
          {err ? (
            <div className="h-full flex items-center justify-center text-sm text-red-400">
              {err}
            </div>
          ) : pdfUrl ? (
            <div className="h-full">
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
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 text-sm">
              Generating preview...
            </div>
          )}
        </Worker>
      </div>

      {/* 🔐 Lock overlay */}
      {locked && (
        <div className="pointer-events-auto absolute inset-0 flex items-center justify-center bg-gradient-to-b from-transparent via-gray-900/20 to-gray-900/40">
          <div className="rounded-xl border border-gray-700 bg-gray-900/80 px-6 py-5 shadow-xl text-center">
            <p className="text-gray-200 font-medium">Preview locked</p>
            <p className="text-gray-400 text-sm mt-1">
              Unlock full-quality & download for <span className="text-blue-300 font-semibold">$1.99</span>.
            </p>
            <button
              className="mt-3 inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium hover:from-blue-600 hover:to-blue-700 transition"
              onClick={onUnlock}
            >
              Unlock & Download
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
