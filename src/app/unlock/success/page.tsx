//src\app\unlock\success\page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useResumeStore } from '@/app/store/resumeStore';

export default function UnlockSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setPaid = useResumeStore((s) => s.setPaid);
  const setProAccessUntil = useResumeStore((s) => s.setProAccessUntil);
  const setToken = useResumeStore((s) => s.setToken);

  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');
  const [purchaseType, setPurchaseType] = useState<'single' | 'pro' | null>(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (!sessionId) {
      setStatus('error');
      return;
    }

    const confirm = async () => {
      try {
        const res = await fetch(`/api/checkout/confirm?session_id=${encodeURIComponent(sessionId)}`);
        const data = await res.json();
        if (!res.ok || !data?.token) throw new Error('Confirm failed');

        setToken(data.token);
        setPaid(true);
        setProAccessUntil(data.exp ? data.exp * 1000 : null);
        setPurchaseType(data.type);

        if (data.type === 'single') {
          try {
            sessionStorage.setItem('astrocv_autodl', '1');
            router.replace('/dashboard');
          } catch (downloadErr) {
            console.error('Auto-download failed', downloadErr);
            setStatus('ok'); // Still unlocked for 10 min
          }
        } else {
          router.replace('/dashboard');
        }
      } catch (e) {
        console.error('[UNLOCK_SUCCESS_CONFIRM_ERROR]', e);
        setStatus('error');
      }
    };

    confirm();
  }, [router, searchParams, setPaid, setProAccessUntil, setToken]);

  if (status === 'loading') {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-950 text-gray-200">
        <p>Confirming your purchase…</p>
      </main>
    );
  }

  if (status === 'error') {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-950 text-red-400">
        <div className="text-center">
          <p className="mb-2">Something went wrong confirming your purchase.</p>
          <p className="text-sm text-gray-400">You can close this tab and return to your dashboard.</p>
        </div>
      </main>
    );
  }

  // ✅ Fallback if auto-download failed
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-gray-200 px-4">
      <h1 className="text-2xl font-bold text-blue-400 mb-4">Your Resume is Unlocked!</h1>
      <p className="mb-6 text-center max-w-md">
        Your tailored resume is unlocked for the next <span className="font-semibold">10 minutes</span>.
        If the download did not start automatically, click the button below to download it now.
      </p>
      <button
        onClick={() => router.push('/dashboard')}
        className="px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 transition text-white font-medium"
      >
        Download My Resume
      </button>
    </main>
  );
}
