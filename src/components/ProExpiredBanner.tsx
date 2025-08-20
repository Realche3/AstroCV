'use client';

export default function ProExpiredBanner() {
  return (
    <div className="mb-6 rounded-xl border border-amber-700/50 bg-amber-900/30 px-4 py-3 text-amber-100">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <p className="font-semibold text-amber-200">Your Pro hour has ended</p>
          <p className="text-sm text-amber-100/80">
            You can still preview your documents. Unlock again to download your resume and generate unlimited documents for another hour.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/#pricing"
            className="rounded-full bg-amber-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-600 transition"
          >
            Unlock again
          </a>
        </div>
      </div>
    </div>
  );
}
