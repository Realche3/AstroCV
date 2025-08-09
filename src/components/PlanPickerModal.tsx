'use client';
import { useState } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function PlanPickerModal({ open, onClose }: Props) {
  const [loading, setLoading] = useState<'single' | 'hour' | null>(null);

  if (!open) return null;

  const createCheckout = async (plan: 'single' | 'hour') => {
    try {
      setLoading(plan);
      const res = await fetch('/api/checkout/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok || !data?.checkoutUrl) throw new Error('Failed to create session');
      window.location.href = data.checkoutUrl;
    } catch (e) {
      console.error(e);
      setLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-gray-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Unlock Resume</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => createCheckout('single')}
            disabled={loading !== null}
            className="w-full rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-white hover:border-blue-400 hover:text-blue-300 transition"
          >
            {loading === 'single' ? 'Redirecting…' : 'Just this resume — $1.99'}
          </button>

          <button
            onClick={() => createCheckout('hour')}
            disabled={loading !== null}
            className="w-full rounded-xl border border-blue-900 bg-blue-950/40 px-4 py-3 text-blue-100 hover:border-blue-600 hover:text-white transition"
          >
            {loading === 'hour' ? 'Redirecting…' : 'Unlimited resumes for 1 hour — $10'}
          </button>

          <p className="text-xs text-gray-400">
            No account required. Access is stored on this device for the selected duration.
          </p>
        </div>
      </div>
    </div>
  );
}
