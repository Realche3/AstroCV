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
  const setPurchaseType = useResumeStore((s) => s.setPurchaseType);

  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');

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
        if (!res.ok || !data?.token || !data?.type) throw new Error('Confirm failed');

        // Persist token + paid state
        setToken(data.token);
        setPaid(true);
        setPurchaseType(data.type);

        if (data.type === 'pro') {
          // Only Pro gets a time window
          if (data.exp) setProAccessUntil(data.exp * 1000);
          else setProAccessUntil(null);
          // Go to dashboard (unlocked during pro window)
          router.replace('/dashboard');
          return;
        }

        // SINGLE purchase:
        // Do NOT set proAccessUntil. We’ll auto-download on the dashboard and relock.
        setProAccessUntil(null);

        try {
          sessionStorage.setItem('astrocv_autodl', '1'); // dashboard will auto-download once
        } catch {
          // ignore
        }

        router.replace('/dashboard'); // dashboard will handle relock for singles
      } catch (e) {
        console.error('[UNLOCK_SUCCESS_CONFIRM_ERROR]', e);
        setStatus('error');
      }
    };

    confirm();
  }, [router, searchParams, setPaid, setProAccessUntil, setToken, setPurchaseType]);

  if (status === 'loading') {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-950 text-gray-200">
        <p>Confirming your purchase…</p>
      </main>
    );
  }

  if (status === 'error') {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-950 text-red-400 px-4">
        <div className="text-center max-w-md">
          <p className="mb-2">Something went wrong confirming your purchase.</p>
          <p className="text-sm text-gray-400">You can close this tab and return to your dashboard to retry.</p>
        </div>
      </main>
    );
  }

  // Fallback UI if for some reason we didn't navigate (rare)
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-gray-200 px-4">
      <h1 className="text-2xl font-bold text-blue-400 mb-4">Your Resume is Unlocked!</h1>
      <p className="mb-6 text-center max-w-md">
        We’ll take you back to your dashboard. If the download does not start automatically, you can download it manually there.
      </p>
      <button
        onClick={() => router.replace('/dashboard')}
        className="px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 transition text-white font-medium"
      >
        Go to Dashboard
      </button>
    </main>
  );
}
