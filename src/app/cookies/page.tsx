'use client';

import CookiePreferences from '@/components/CookiePreferences';
import { motion } from 'framer-motion';

export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-gray-950 text-gray-200 py-20 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-3xl mx-auto"
      >
        <h1 className="text-4xl sm:text-5xl font-bold text-blue-400 mb-6 text-center">Cookies & Preferences</h1>
        <p className="text-gray-400 text-sm sm:text-base mb-8 text-center">
          We use necessary cookies to run astroCV and optional analytics to improve the product. Manage your preferences below.
        </p>
        <CookiePreferences />
        <section className="mt-10 space-y-4 text-sm sm:text-base text-gray-400">
          <h2 className="text-blue-300 font-semibold text-lg">What we collect</h2>
          <p>
            Necessary cookies keep the site secure and remember your preferences. When enabled, analytics cookies help us understand which features are most useful.
          </p>
          <h2 className="text-blue-300 font-semibold text-lg">Third‑party services</h2>
          <p>
            We may use privacy‑respecting analytics providers and Stripe for payments. We do not sell your personal data.
          </p>
        </section>
      </motion.div>
    </main>
  );
}

