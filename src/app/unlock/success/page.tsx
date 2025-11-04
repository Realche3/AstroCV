'use client';
export const dynamic = 'force-dynamic';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useResumeStore } from '@/app/store/resumeStore';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setPaid = useResumeStore((s) => s.setPaid);
  const setProAccessUntil = useResumeStore((s) => s.setProAccessUntil);
  const setToken = useResumeStore((s) => s.setToken);
  const setPurchaseType = useResumeStore((s) => s.setPurchaseType);
  const addSingleCredit = useResumeStore((s) => s.addSingleCredit);

  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionIdResolved, setSessionIdResolved] = useState(false);

  useEffect(() => {
    let foundId: string | null = null;
    const queryId = searchParams.get('session_id');
    if (queryId) {
      foundId = queryId;
    } else if (typeof window !== 'undefined') {
      const hash = window.location.hash.startsWith('#')
        ? window.location.hash.slice(1)
        : window.location.hash;
      if (hash) {
        const params = new URLSearchParams(hash);
        const hashId = params.get('session_id');
        if (hashId) {
          foundId = hashId;
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        }
      }
    }
    setSessionId(foundId);
    setSessionIdResolved(true);
  }, [searchParams]);

  useEffect(() => {
    if (!sessionIdResolved || !sessionId) return;

    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('astrocv_last_sid', sessionId);
      }
    } catch {}

    const confirm = async () => {
      try {
        setStatus('loading');
        const res = await fetch(`/api/checkout/confirm?session_id=${encodeURIComponent(sessionId)}`, {
          headers: { 'Cache-Control': 'no-store' },
        });
        const data = await res.json();
        if (!res.ok || !data?.token || !data?.type) throw new Error('Confirm failed');
        setToken(data.token);
        setPurchaseType(data.type);

        if (data.type === 'pro') {
          setPaid(true);
          if (data.exp) setProAccessUntil(data.exp * 1000);
          else setProAccessUntil(null);
          try {
            sessionStorage.setItem(
              'astrocv_limit_notice',
              'Pro Hour activated! Unlimited tailoring is unlocked for the next 60 minutes. Head to "Tailor Your Resume" to get started.'
            );
            sessionStorage.removeItem('astrocv_plan_prompt');
          } catch {}
          router.replace('/dashboard');
          return;
        }

        setProAccessUntil(null);
        addSingleCredit(2);
        setPaid(true);

        try {
          sessionStorage.setItem(
            'astrocv_limit_notice',
            `Payment received! You have 2 paid resume credits ready. Head to "Tailor Your Resume" whenever you're ready to use the next one.`
          );
          sessionStorage.removeItem('astrocv_plan_prompt');
        } catch {}

        router.replace('/dashboard');
      } catch (e) {
        console.error('[UNLOCK_SUCCESS_CONFIRM_ERROR]', e);
        setStatus('error');
      }
    };

    confirm();
  }, [sessionIdResolved, sessionId, router, setPaid, setProAccessUntil, setToken, setPurchaseType, addSingleCredit]);

  useEffect(() => {
    if (!sessionIdResolved) return;
    if (sessionId) return;
    const timeout = setTimeout(() => setStatus('error'), 4000);
    return () => clearTimeout(timeout);
  }, [sessionIdResolved, sessionId]);

  if (status === 'loading') {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-950 text-gray-200">
        <p>Confirming your purchase.</p>
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

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-gray-200 px-4">
      <h1 className="text-2xl font-bold text-blue-400 mb-4">Your payment is confirmed!</h1>
      <p className="mb-6 text-center max-w-md">
        We'll take you back to the dashboard. Use your new credit anytime to tailor the next job application.
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

export default function UnlockSuccessPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center bg-gray-950 text-gray-200">
        <p>Loading...</p>
      </main>
    }>
      <SuccessContent />
    </Suspense>
  );
}
