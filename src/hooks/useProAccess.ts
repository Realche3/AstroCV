'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useResumeStore } from '@/app/store/resumeStore';

export function useProAccess() {
  const proAccessUntil = useResumeStore((s) => s.proAccessUntil);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    // tick every second for a smooth countdown
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const timeLeftMs = useMemo(
    () => Math.max((proAccessUntil ?? 0) - now, 0),
    [proAccessUntil, now]
  );
  
  const hadPro = Boolean (proAccessUntil);
  const isProActive = Boolean(proAccessUntil && timeLeftMs > 0);
  const isExpired = hadPro && !isProActive;
  return { isProActive, isExpired, timeLeftMs, proAccessUntil };
}

export function formatTimeLeft(ms: number) {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;

  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`;
}
