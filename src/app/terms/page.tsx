'use client';

export default function TermsPage() {
  return (
    <main className="min-h-screen px-4 sm:px-6 lg:px-8 py-20 bg-gray-950 text-gray-300">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-blue-400 mb-6">Terms of Service</h1>

        <p className="mb-4 text-sm text-gray-400">
          Last updated: July 23, 2025
        </p>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-white mb-2">1. Service Overview</h2>
          <p className="text-gray-400">
            AstroCV provides an AI-powered resume tailoring tool to help job seekers quickly generate optimized resumes based on job descriptions. We use OpenAI APIs and proprietary prompts to deliver high-quality resume suggestions.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-white mb-2">2. No Job Guarantee</h2>
          <p className="text-gray-400">
            While we aim to improve your chances of landing interviews, we do not guarantee job placement or specific outcomes. Our tool is a productivity assistant, not a career placement service.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-white mb-2">3. Payment & Refunds</h2>
          <p className="text-gray-400">
            All payments cover access to our AI processing and premium API usage. Due to the digital and instant nature of the service, we do not offer refunds once the tailored resume has been generated.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-white mb-2">4. User Data & Privacy</h2>
          <p className="text-gray-400">
            We do not store your uploaded resumes or job descriptions. Tailored results are generated and shown to you on the fly. We use industry best practices to protect any temporary data used during generation.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-white mb-2">5. Fair Use</h2>
          <p className="text-gray-400">
            Users agree not to misuse the platform, attempt to reverse-engineer the AI process, or resell the service under a different brand without permission.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-white mb-2">6. Contact</h2>
          <p className="text-gray-400">
            If you have any questions or concerns about these terms, please contact us at <a href="mailto:admin@astrolyft.com" className="text-blue-400 underline">admin@astrolyft.com</a>.
          </p>
        </section>

        <p className="text-sm text-gray-500">
          By using AstroCV, you agree to these terms and our privacy policy.
        </p>
      </div>
    </main>
  );
}
