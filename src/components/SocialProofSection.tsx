'use client';

import Link from 'next/link';
import { StarIcon } from '@heroicons/react/24/solid';

const partnerLogos = [
  { name: 'Northwind Labs' },
  { name: 'Helix Health' },
  { name: 'Aurora Finance' },
  { name: 'Cobalt Robotics' },
  { name: 'Brightline Media' },
  { name: 'Summit Analytics' },
  { name: 'Bluebird Retail' },
  { name: 'Atlas Logistics' },
];

const testimonials = [
  {
    quote: 'I stopped rewriting the same bullets. Two applications, two callbacks within a week.',
    name: 'Maya Thompson',
    role: 'Product Manager, B2B SaaS',
  },
  {
    quote: 'The wording finally sounds like me, just sharper. Got past the ATS on roles I used to miss.',
    name: 'Jared Lin',
    role: 'Senior Software Engineer',
  },
  {
    quote: 'It surfaced impact I buried. Recruiters actually asked about the metrics I added.',
    name: 'Alina Fernandez',
    role: 'UX Researcher',
  },
  {
    quote: 'Follow-up copy got replies in threads that were ice cold. Huge time saver.',
    name: 'Devin Morales',
    role: 'Sales Director',
  },
  {
    quote: 'Tailored three roles in one evening. Clear keywords without feeling like keyword stuffing.',
    name: 'Priya Shah',
    role: 'Data Scientist',
  },
];

export default function SocialProofSection() {
  return (
    <section
      id="social-proof"
      className="relative border-t border-gray-900/60 bg-gray-950 px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.18),_transparent_65%)]" />
      </div>

      <div className="relative mx-auto max-w-6xl space-y-12">
        <div className="space-y-4 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-blue-300/80">
            Trusted by teams across tech, finance, healthcare, and design
          </p>
          <h2 className="text-3xl font-semibold text-gray-100 sm:text-4xl">Proof your story resonates</h2>
          <p className="mx-auto max-w-2xl text-sm text-gray-400 sm:text-base">
            From early-stage builders to global enterprises, AstroCV powers applications that feel personal and professional.
            Join thousands of candidates tailoring smarter.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
          {partnerLogos.map((logo) => (
            <div
              key={logo.name}
              className="inline-flex items-center justify-center rounded-full border border-gray-800/70 bg-gray-900/60 px-5 py-2 text-sm font-medium tracking-wide text-gray-300"
            >
              {logo.name}
            </div>
          ))}
        </div>

        <p className="text-center text-[10px] uppercase tracking-[0.25em] text-gray-500">
          Descriptors represent typical customer industries and are not endorsements.
        </p>

        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
          {testimonials.map((testimonial) => (
            <article
              key={testimonial.name}
              className="relative rounded-2xl border border-gray-800/70 bg-gray-900/40 p-6 shadow-lg shadow-blue-900/10 ring-1 ring-gray-900/40"
            >
              <div className="absolute -top-4 left-6 flex items-center gap-1 rounded-full bg-blue-900/60 px-3 py-1 text-xs font-semibold text-blue-200 shadow shadow-blue-900/30">
                {[...Array(5)].map((_, idx) => (
                  <StarIcon key={idx} className="h-3 w-3 text-blue-300" />
                ))}
                <span className="ml-1 text-blue-100/80">5.0</span>
              </div>
              <blockquote className="mt-4 text-sm leading-relaxed text-gray-200">"{testimonial.quote}"</blockquote>
              <div className="mt-6">
                <p className="text-sm font-semibold text-gray-100">{testimonial.name}</p>
                <p className="text-xs text-gray-400">{testimonial.role}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="flex justify-center">
          <Link
            href="#contact"
            className="inline-flex items-center rounded-full border border-blue-500/60 bg-blue-500/10 px-5 py-2 text-sm font-medium text-blue-200 transition hover:border-blue-400 hover:text-blue-100"
          >
            Share your experience with us
          </Link>
        </div>
      </div>
    </section>
  );
}
