'use client';

import { motion } from 'framer-motion';

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-gray-950 text-gray-200 py-20 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl mx-auto"
      >
        <h1 className="text-4xl sm:text-5xl font-bold text-blue-400 mb-6 text-center">
          Privacy Policy
        </h1>

        <p className="text-gray-400 mb-6 text-sm sm:text-base text-center">
          Last updated: July 23, 2025
        </p>

        <section className="space-y-6 text-sm sm:text-base leading-relaxed">
          <p>
            At <strong>AstroCV</strong>, your privacy is important to us. This policy outlines how we
            collect, use, and protect your personal information.
          </p>

          <h2 className="text-blue-300 font-semibold text-lg">1. Information We Collect</h2>
          <ul className="list-disc ml-6 space-y-2">
            <li><strong>Uploaded Files:</strong> Your resume is processed temporarily for tailoring, but never stored permanently.</li>
            <li><strong>Job Descriptions:</strong> Used only to optimize your resume — never shared or saved.</li>
            <li><strong>Email (if applicable):</strong> Collected only when submitting a form or checkout, for delivery and support purposes.</li>
          </ul>

          <h2 className="text-blue-300 font-semibold text-lg">2. How We Use Your Data</h2>
          <p>
            We use your data solely to generate tailored resumes using AI. None of your information is sold or used for marketing unless explicitly permitted.
          </p>

          <h2 className="text-blue-300 font-semibold text-lg">3. Data Security</h2>
          <p>
            We use encrypted connections (HTTPS) and secure third-party services (e.g. Stripe, OpenAI API, Vercel) to protect your data.
          </p>

          <h2 className="text-blue-300 font-semibold text-lg">4. Third-Party Services</h2>
          <p>
            We rely on trusted providers for certain operations:
          </p>
          <ul className="list-disc ml-6 space-y-1">
            <li><strong>Stripe</strong> – Payment processing (see their <a href="https://stripe.com/privacy" className="text-blue-400 underline" target="_blank">privacy policy</a>)</li>
            <li><strong>OpenAI</strong> – AI tailoring logic (data not stored or reused)</li>
            <li><strong>Vercel</strong> – Hosting platform</li>
          </ul>

          <h2 className="text-blue-300 font-semibold text-lg">5. Data Retention</h2>
          <p>
            We don’t retain your resume or job content after the tailoring is complete. Your tailored result is stored temporarily in your browser or session.
          </p>

          <h2 className="text-blue-300 font-semibold text-lg">6. Your Rights</h2>
          <p>
            You may contact us to request data deletion or inquire about how your information is handled at any time.
          </p>

          <h2 className="text-blue-300 font-semibold text-lg">7. Changes to This Policy</h2>
          <p>
            We may update this policy occasionally. Any changes will be posted on this page with a new effective date.
          </p>

          <h2 className="text-blue-300 font-semibold text-lg">8. Contact Us</h2>
          <p>
            If you have questions, feel free to reach out via our contact form or email us at <a href="mailto:support@astrocv.ai" className="text-blue-400 underline">support@astrocv.ai</a>.
          </p>
        </section>
      </motion.div>
    </main>
  );
}
