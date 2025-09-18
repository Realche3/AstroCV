'use client';

import { useEffect, useState } from 'react';
import { Consent, getConsent, setConsent } from '@/lib/consent';

export default function CookiePreferences() {
  const [consent, setConsentState] = useState<Consent>({ necessary: true, analytics: false, marketing: false });
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    const current = getConsent();
    if (current) setConsentState(current);
  }, []);

  const save = () => {
    setConsent(consent);
    setSaved('Preferences saved.');
    setTimeout(() => setSaved(null), 2000);
  };

  return (
    <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-6 shadow-lg">
      <div className="space-y-4">
        <PrefRow
          title="Strictly necessary"
          desc="Required for core functionality like security and preferences."
          checked
          disabled
        />
        <PrefRow
          title="Analytics"
          desc="Helps us understand usage to improve astroCV."
          checked={consent.analytics}
          onChange={(v) => setConsentState((c) => ({ ...c, analytics: v }))}
        />
        <PrefRow
          title="Marketing"
          desc="Personalized offers. We don't use this currently."
          checked={consent.marketing}
          onChange={(v) => setConsentState((c) => ({ ...c, marketing: v }))}
        />
      </div>
      {saved && <div className="mt-4 text-sm text-green-400">{saved}</div>}
      <div className="mt-6 flex justify-end">
        <button onClick={save} className="px-6 py-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-blue-500/20">Save Preferences</button>
      </div>
    </div>
  );
}

function PrefRow({ title, desc, checked, disabled, onChange }: { title: string; desc: string; checked?: boolean; disabled?: boolean; onChange?: (v: boolean) => void; }) {
  return (
    <label className={`flex items-start gap-3 ${disabled ? 'opacity-60' : ''}`}>
      <input
        type="checkbox"
        className="mt-1 h-4 w-4 rounded border-gray-600 bg-gray-800"
        checked={!!checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
      />
      <div>
        <div className="text-gray-200 font-medium">{title}</div>
        <div className="text-sm text-gray-400">{desc}</div>
      </div>
    </label>
  );
}

