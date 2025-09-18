export type Consent = {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
};

const COOKIE_NAME = 'astrocv_consent';
const LS_KEY = 'astrocv_consent';

export function getConsent(): Consent | null {
  try {
    // Prefer cookie
    const cookie = typeof document !== 'undefined' ? readCookie(COOKIE_NAME) : null;
    const source = cookie || (typeof localStorage !== 'undefined' ? localStorage.getItem(LS_KEY) : null);
    if (!source) return null;
    const parsed = JSON.parse(source) as Consent;
    if (!('necessary' in parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function setConsent(consent: Consent) {
  try {
    const value = JSON.stringify(consent);
    // Cookie: 365 days, SameSite=Lax, Secure
    const days = 365;
    const d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = `expires=${d.toUTCString()}`;
    const secure = 'Secure';
    const sameSite = 'SameSite=Lax';
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(value)}; ${expires}; Path=/; ${sameSite}; ${secure}`;
    localStorage.setItem(LS_KEY, value);
    // Notify other tabs
    try { window.dispatchEvent(new StorageEvent('storage', { key: LS_KEY, newValue: value })); } catch {}
  } catch {}
}

export function hasAnalyticsConsent(): boolean {
  const c = getConsent();
  return Boolean(c?.analytics);
}

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

