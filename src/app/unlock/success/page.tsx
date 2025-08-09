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

        setStatus('ok');
        setTimeout(() => router.replace('/dashboard'), 800);
      } catch (e) {
        console.error('[UNLOCK_SUCCESS_CONFIRM_ERROR]', e);
        setStatus('error');
      }
    };

    confirm();
  }, [router, searchParams, setPaid, setProAccessUntil, setToken]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-950 text-gray-200">
      {status === 'loading' && <p>Confirming your purchase…</p>}
      {status === 'ok' && <p>Unlocked! Redirecting…</p>}
      {status === 'error' && (
        <div className="text-center">
          <p className="mb-2">Something went wrong confirming your purchase.</p>
          <p className="text-sm text-gray-400">You can close this tab and return to your dashboard.</p>
        </div>
      )}
    </main>
  );
}
