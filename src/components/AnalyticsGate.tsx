'use client';

import { useEffect, useState } from 'react';
import { hasAnalyticsConsent } from '@/lib/consent';
import { Analytics } from '@vercel/analytics/next';

export default function AnalyticsGate() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(hasAnalyticsConsent());
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'astrocv_consent') setEnabled(hasAnalyticsConsent());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  if (!enabled) return null;
  return <Analytics />;
}

