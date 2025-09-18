'use client';

import { useEffect, useState } from 'react';
import { getConsent, setConsent, Consent } from '@/lib/consent';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const c = getConsent();
    setVisible(!c);
  }, []);

  if (!visible) return null;

  const acceptAll = () => {
    const c: Consent = { necessary: true, analytics: true, marketing: false };
    setConsent(c);
    setVisible(false);
  };
  const declineAll = () => {
    const c: Consent = { necessary: true, analytics: false, marketing: false };
    setConsent(c);
    setVisible(false);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-[1000] px-4 pb-4">
      <div className="mx-auto max-w-4xl rounded-2xl border border-gray-800 bg-gray-900/90 backdrop-blur p-4 sm:p-5 shadow-xl">
        <p className="text-gray-200 text-sm">
          We use necessary cookies to make astroCV work. With your consent, we also use analytics to improve the experience. You can change your choices anytime on the Cookies page.
        </p>
        <div className="mt-3 flex flex-col sm:flex-row gap-2 sm:justify-end">
          <a href="/cookies" className="text-xs text-blue-400 hover:text-blue-300">Cookies settings</a>
          <div className="flex gap-2 sm:ml-auto">
            <button onClick={declineAll} className="px-4 py-2 rounded-full border border-gray-700 text-gray-200 hover:border-blue-400 hover:text-blue-300 text-sm">Decline</button>
            <button onClick={acceptAll} className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium hover:from-blue-600 hover:to-blue-700">Accept</button>
          </div>
        </div>
      </div>
    </div>
  );
}

