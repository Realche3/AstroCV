'use client';

import { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

type FAQ = { question: string; answer: string };

const faqs: FAQ[] = [
  {
    question: 'How much does AstroCV cost?',
    answer:
      'We offer one-time purchases and time-limited Pro access. Current pricing is shown at checkout before you pay.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'Payments are processed securely by Stripe. We accept major debit/credit cards; additional methods may be available depending on your region.',
  },
  {
    question: 'Does Pro auto-renew?',
    answer:
      'No. Pro access is time-limited and does not auto-renew. When it expires you can purchase access again anytime.',
  },
  {
    question: 'Refunds and billing issues',
    answer:
      'If you experience a billing error (e.g., duplicate charge), contact support and we will review and assist promptly.',
  },
  {
    question: 'How long does tailoring take?',
    answer:
      'Typically under a minute. Upload your resume, paste the job description, and get a tailored version — no prompt engineering.',
  },
  {
    question: 'Why use AstroCV instead of ChatGPT?',
    answer:
      'AstroCV focuses on hiring best practices: ATS-safe formatting, role-targeted bullet points, polished PDF output, and consistent structure — no manual prompting, reformatting, or guesswork.',
  },
  {
    question: 'What file types can I upload?',
    answer:
      'PDF, DOC, or DOCX up to 5 MB — or paste your resume text directly.',
  },
  {
    question: 'Will my resume be ATS-friendly?',
    answer:
      'Yes. We use clean structure, standard fonts, clear headings, and simple bullets — no tables or heavy graphics.',
  },
  {
    question: 'Is my data safe?',
    answer:
      'We process your resume and job description securely and do not share them. See our Privacy Policy for details.',
  },
  {
    question: 'Can I tailor for multiple roles?',
    answer:
      'Yes. Run tailoring again for different roles and descriptions to get role-specific versions.',
  },
  {
    question: 'Can I edit the result?',
    answer:
      'Absolutely — use the generated text as a strong baseline and tweak details before downloading your PDF.',
  },
  {
    question: 'How do I contact support?',
    answer:
      "Email support@astrocv.ai and we'll get back to you as soon as possible.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const defaultVisible = 6;
  const visibleFaqs = showAll ? faqs : faqs.slice(0, defaultVisible);

  return (
    <section id="faq" className="py-20 bg-gradient-to-b from-gray-900 to-gray-950 px-4 sm:px-6 lg:px-8 border-t border-gray-800">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-white mb-10">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {visibleFaqs.map((faq, index) => (
            <div
              key={index}
              className="border border-gray-700 rounded-xl bg-gray-900/60 overflow-hidden"
            >
              <button
                onClick={() => toggle(index)}
                className="w-full flex items-center justify-between px-5 py-4 text-left text-white font-medium hover:bg-gray-800 transition"
              >
                <span>{faq.question}</span>
                <ChevronDownIcon
                  className={`h-5 w-5 text-blue-400 transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <AnimatePresence initial={false}>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-5 pb-4 text-gray-300 text-sm leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
          {faqs.length > defaultVisible && (
            <div className="pt-2 flex justify-center">
              <button
                onClick={() => {
                  setShowAll(!showAll);
                  setOpenIndex(null);
                }}
                className="px-4 py-2 text-sm font-medium rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow hover:shadow-blue-500/20 transition"
              >
                {showAll ? 'See less' : 'See more'}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
