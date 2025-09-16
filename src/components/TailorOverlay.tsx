'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface TailorOverlayProps {
  steps?: string[];
  title?: string;
  subtitle?: string;
  stepIndex?: number; // 0-based; controls current step when provided
}

export default function TailorOverlay({
  steps = [
    'Reading current resume',
    'Extracting key data',
    'Analyzing job description',
    'Generating tailored resume',
    'Finalizing documents',
  ],
  title = 'Tailoring Your Resume',
  subtitle = 'Please wait a moment while we prepare your tailored documents.',
  stepIndex,
}: TailorOverlayProps) {
  const [internalIdx, setInternalIdx] = useState(0);

  useEffect(() => {
    let id: any = null;
    // Only auto-advance when uncontrolled; clamp at second-to-last step
    if (stepIndex === undefined) {
      id = setInterval(() => {
        setInternalIdx((i) => Math.min(steps.length - 2, i + 1));
      }, 1200);
    }
    // Lock background scroll while overlay is visible
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      if (id) clearInterval(id);
      document.body.style.overflow = prevOverflow;
    };
  }, [steps.length, stepIndex]);

  const currentIdx = stepIndex !== undefined ? Math.max(0, Math.min(stepIndex, steps.length - 1)) : internalIdx;
  const progress = (currentIdx + 1) / steps.length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-busy="true"
      className="fixed inset-0 z-[999] flex items-center justify-center bg-gray-950/90 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md mx-4 rounded-2xl border border-gray-800 bg-gray-900/80 shadow-2xl"
      >
        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 opacity-90 animate-pulse" />
              <Loader2 className="absolute inset-0 m-auto h-7 w-7 text-white animate-spin" />
            </div>
          </div>

          <h3 className="text-center text-xl font-semibold text-blue-400 mb-2">
            {title}
          </h3>
          <p className="text-center text-gray-300 mb-4">
            {subtitle}
          </p>

          {/* Progress bar */}
          <div className="mb-3 h-2 w-full rounded-full bg-gray-800 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(0.18, progress) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-center text-sm text-gray-400 mb-2">
            Step {currentIdx + 1} of {steps.length}
          </p>

          {/* Rotating step messages */}
          <div className="mt-2">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center gap-2 py-1">
                <div
                  className={
                    'h-2 w-2 rounded-full ' +
                    (i === currentIdx ? 'bg-blue-400' : 'bg-gray-700')
                  }
                />
                <p
                  className={
                    'text-sm ' + (i === currentIdx ? 'text-gray-200' : 'text-gray-500')
                  }
                >
                  {s}
                </p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
