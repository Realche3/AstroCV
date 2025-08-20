'use client';

import { useEffect, useMemo, useState } from 'react';
import { useResumeStore } from '@/app/store/resumeStore';

function formatTimeLeft(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`;
}

export default function ProTimerBadge() {
  const proAccessUntil = useResumeStore((s) => s.proAccessUntil);

  // tick every second
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const { isActive, isExpired, left } = useMemo(() => {
    if (!proAccessUntil) return { isActive: false, isExpired: false, left: 0 };
    const left = Math.max(0, proAccessUntil - now);
    const isActive = left > 0;
    const isExpired = !isActive;
    return { isActive, isExpired, left };
  }, [proAccessUntil, now]);

  if (!proAccessUntil) return null;

  if (isActive) {
    return (
      <span
        className="inline-flex items-center gap-2 rounded-full border border-blue-700 bg-blue-900/30 px-3 py-1 text-xs font-medium text-blue-200"
        title="Your Pro hour is active"
      >
        <span className="inline-block h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
        Pro active • {formatTimeLeft(left)}
      </span>
    );
  }

  // expired but we still show it so the user understands what happened
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full border border-amber-700 bg-amber-900/30 px-3 py-1 text-xs font-medium text-amber-200"
      title="Your Pro hour has ended"
    >
      <span className="inline-block h-2 w-2 rounded-full bg-amber-400" />
      Pro expired
    </span>
  );
}
