'use client';
import { useEffect } from 'react';
import { useResumeStore } from '@/app/store/resumeStore';

export default function EntitlementGate() {
  const setPaid = useResumeStore((s) => s.setPaid);
  const setProAccessUntil = useResumeStore((s) => s.setProAccessUntil);
  const setTemplateAccessUntil = useResumeStore((s) => s.setTemplateAccessUntil);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('astrocv_access') : null;
    if (!token) return;

    const verify = async () => {
      try {
        const res = await fetch(`/api/auth/verify?token=${encodeURIComponent(token)}`);
        const data = await res.json();
        if (data?.valid && data.type === 'pro') {
          setPaid(true);
          setProAccessUntil(data.exp ? data.exp * 1000 : null);
          setTemplateAccessUntil(data.exp ? data.exp * 1000 : null);
        } else {
          setPaid(false);
          setProAccessUntil(null);
          setTemplateAccessUntil(null);
        }
      } catch {
        setPaid(false);
        setProAccessUntil(null);
        setTemplateAccessUntil(null);
      }
    };
    verify();
  }, [setPaid, setProAccessUntil, setTemplateAccessUntil]);

  return null;
}
