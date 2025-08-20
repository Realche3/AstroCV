'use client';

import { formatTimeLeft } from '@/hooks/useProAccess';

interface Props {
  timeLeftMs: number;
}

export default function ProTimerBanner({ timeLeftMs }: Props) {
  return (
    <div className="mb-6 rounded-xl border border-blue-800/50 bg-blue-950/40 px-4 py-3 text-blue-100">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <p className="font-semibold text-blue-300">Pro unlocked — unlimited resumes for 1 hour</p>
          <p className="text-sm text-blue-200/80">
            Tailor, preview, and download as many resumes, cover letters, and follow-up emails as you want while your timer is active.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center rounded-full border border-blue-700 bg-blue-900/40 px-3 py-1 text-sm">
            ⏱ Ends in <span className="ml-2 font-mono">{formatTimeLeft(timeLeftMs)}</span>
          </span>
          <a
            href="/#upload-section"
            className="rounded-full bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 transition"
          >
            Tailor another
          </a>
        </div>
      </div>
    </div>
  );
}
