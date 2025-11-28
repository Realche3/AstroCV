'use client';
import { useState } from 'react';
import { CheckCircleIcon, SparklesIcon } from '@heroicons/react/24/solid';

interface Props {
  open: boolean;
  onClose: () => void;
}

const plans = [
  {
    id: 'starter' as const,
    name: 'Starter',
    price: '$2.99',
    blurb: 'One full resume kit to try us out.',
    features: [
      'One AI-tailored resume matched to your job description',
      'Matching cover letter and follow-up email',
      'Download in PDF (DOCX unlocked on paid plan)',
    ],
    badge: '',
    cta: 'Unlock 1 credit',
  },
  {
    id: 'career' as const,
    name: 'Career Pack',
    price: '$9.99',
    blurb: 'Five kits to power a week of applications.',
    features: [
      'Five AI-tailored resume kits',
      'All templates unlocked (free + pro)',
      'Download in PDF & DOCX formats',
      'Priority processing compared to Starter',
    ],
    badge: 'BEST VALUE',
    cta: 'Unlock 5 credits',
  },
  {
    id: 'standard' as const,
    name: 'Standard',
    price: '$4.99',
    blurb: 'Get two complete resume kits to use anytime.',
    features: [
      'Two AI-tailored resumes matched to your job descriptions',
      'Matching cover letter with recruiter-ready language',
      'Follow-up email template to stay top-of-mind',
      'Download in both PDF & DOCX formats',
      'Credits never expire until you use them',
    ],
    badge: 'RECOMMENDED',
    cta: 'Unlock 2 credits',
  },
  {
    id: 'hour' as const,
    name: 'Pro Hour',
    price: '$12.99',
    blurb: 'Unlimited tailoring while you iterate and apply fast.',
    features: [
      'Unlimited resume+letter generations for 60 minutes',
      'Download every version in PDF & DOCX',
      'Refine for multiple roles without extra cost',
      'Priority processing during your hour',
      'Keep everything you generate forever',
    ],
    badge: 'Pro',
    cta: 'Start Pro hour',
  },
];

type PlanId = (typeof plans)[number]['id'];

export default function PlanPickerModal({ open, onClose }: Props) {
  const [loading, setLoading] = useState<PlanId | null>(null);

  if (!open) return null;

  const createCheckout = async (plan: PlanId) => {
    try {
      setLoading(plan);
      const res = await fetch('/api/checkout/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok || !data?.checkoutUrl) throw new Error('Failed to create session');
      window.location.href = data.checkoutUrl;
    } catch (e) {
      console.error(e);
      setLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 backdrop-blur px-3">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/70 via-gray-950/80 to-gray-950/95" aria-hidden />
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-blue-900/50 bg-gray-950/95 p-4 sm:p-6 shadow-2xl">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-400/40 bg-blue-500/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-blue-100">
              <SparklesIcon className="h-3.5 w-3.5" /> Premium exports
            </span>
            <h3 className="mt-4 text-2xl font-bold text-white sm:text-3xl">Upgrade when you're ready</h3>
            <p className="mt-2 max-w-2xl text-sm text-gray-300 sm:text-base">
              Keep using the dashboard for free. When you need unlimited formats or an extra package, pick the option that fits your pace.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-gray-700 bg-gray-800 px-4 py-2 text-sm text-gray-300 transition hover:border-blue-500 hover:text-white"
            aria-label="Close pricing"
          >
            Close
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:gap-5 lg:grid-cols-2">
          {plans.map((plan) => {
            const isLoading = loading === plan.id;
            return (
              <div
                key={plan.id}
                className="relative flex h-full flex-col justify-between rounded-2xl border border-gray-800/70 bg-gray-900/70 p-4 shadow-xl transition hover:border-blue-500/60 hover:shadow-blue-900/20"
              >
                {plan.badge ? (
                  <span className={`absolute -top-3 left-5 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow ${plan.badge === 'BEST VALUE' ? 'bg-emerald-500 text-emerald-50' : 'bg-blue-500 text-blue-50'}`}>
                    {plan.badge}
                  </span>
                ) : null}
                <div className="space-y-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-gray-400">{plan.name}</p>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-3xl font-semibold text-white">{plan.price}</span>
                      <span className="text-sm text-gray-400">one-time</span>
                    </div>
                    <p className="mt-2 text-sm text-gray-300">{plan.blurb}</p>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-200">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <CheckCircleIcon className="mt-[2px] h-4 w-4 text-blue-400" />
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  onClick={() => createCheckout(plan.id)}
                  disabled={loading !== null}
                  className="mt-6 inline-flex w-full items-center justify-center rounded-xl border border-blue-500/50 bg-blue-500/20 px-4 py-3 text-sm font-semibold text-blue-100 transition hover:border-blue-400 hover:bg-blue-500/30 disabled:opacity-60"
                >
                  {isLoading ? 'Redirecting...' : plan.cta}
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-gray-800/60 bg-gray-900/40 p-4 text-xs text-gray-400 sm:flex-row sm:items-center sm:justify-between">
          <p>No subscriptions or hidden fees. Checkout is handled securely by Stripe.</p>
          <p className="text-gray-500">Need help? Reply to your receipt and we'll take care of it.</p>
        </div>
      </div>
    </div>
  );
}
